/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import Swal from 'sweetalert2';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit  {

  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isPlayOption: {
      value : true,
      icon : 'fa-dollar',
      tooltip: 'Pay Invoice'
    },
    isColVisibility: true,
    isRowHighlight: true,
    isDownloadAsCsv: true,
    isDownloadOption: {
      value: true,
      icon: '',
      tooltip: 'View/Download Invoice'
    },
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: true,
    // fixedColumn: 1,
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 0, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    isOrder: [[2, 'asc']],
    isHideColumns: ["id", "downloadable_file_id"],
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  selectedRow: any;
  selectedInvoiceDetails: any;
  memo: string;
  @ViewChild('AddPayment') addPayment: PopUpModalComponent;
  hideTable: boolean;
  selectedInvoice: any;
  selectedInvoiceNumber: any;
  isRoot: boolean;
  orgInfo: any;
  orgArr = [];
  selectedOrg: any;
  orgValue = '';
  
  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const custInfo =  JSON.parse(localStorage.getItem('customerInfo') || '');
    this.orgInfo = custInfo.org;

    console.log('custInfo >>>')
    console.log(custInfo);

    const grp = JSON.parse(groups);
    grp.forEach(function (item) {
      if(item === 'ROOT' || item === 'SUPER_USER') {
        this.isRoot = true;
      }
    }, this);
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));    
    this.searchOrgRequest();
    this.searchDataRequest();
  }

  searchDataRequest() {
    let self = this;
     this.searchData().subscribe(
        response => {
          if (response && response.data) {
            this.populateDataTable(response.data, true);
            this.showSpinner = false;
          }
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDataRequest.bind(self)
            );
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  searchData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    let org=this.orgValue;    
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/invoices/all'+( org ? ('?org_uuid=' + org) : '');
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  populateDataTable(response, initialLoad) {
    const tableData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    const headers = [];

    if (tableData.length) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        headers.push({
          key: keys[i],
          title: keys[i].replace(/_/g,' ').toUpperCase(),
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: false,
          width: '150'
        });
      }
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleCheckboxSelection(rowObj: any, rowData: any) {
    console.log('this.selectedRow >>')
    console.log(this.selectedRow);
    this.selectedRow = rowObj;
  }

  handleUnCheckboxSelection(rowObj: any, rowData: any) {
    this.selectedRow = null;
  }

  handleRow(rowObj: any, rowData: any) {
    if(this[rowObj.action])
      this[rowObj.action](rowObj);
  }

  handleRun(dataObj: any) {
    console.log('dataObj.data >>')
    console.log(dataObj.data);
    const invoiceId = dataObj.data.id;
    if (invoiceId) {
      this.selectedInvoiceNumber = dataObj.data.invoice_number;
      this.selectedInvoice = invoiceId;
      this.hideTable = true;
     // this.router.navigate(['/app/admin/invoices/invoice/' + invoiceId]);
    } else {
      Swal({
        title: 'No invoice ID found',
        text: 'We did not find an invoice id',
        type: 'error'
      });
    }
  }

  handleDownload(dataObj: any) {
    console.log('dataObj >>')
    console.log(dataObj);
    const downloadId = dataObj.data.downloadable_file_id;
    const invoiceId = dataObj.data.id;
    if (downloadId) {
      this.searchDownloadLink(downloadId, invoiceId);
    } else {
      Swal({
        title: 'No downloadable link available',
        text: 'We did not find a download link for that invoice',
        type: 'error'
      });
    }
  }

  searchDownloadLink(downloadId, invoiceId) {
    this.getDownloadLink(downloadId).subscribe(
        response => {
          if (response && response.data && response.data.pre_signed_url) {
            const link = document.createElement('a');
            link.setAttribute('href', response.data.pre_signed_url);
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
          } else {
            Swal({
              title: 'No downloadable link available',
              text: 'We did not find a download link for that invoice',
              type: 'error'
            });
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDownloadLink.bind(self, downloadId, invoiceId)
            );
          } else {
            Swal({
              title: 'Unable to download the invoice',
              text: 'We were enable to download details of invoice: ' + invoiceId  + '. Please try again',
              type: 'error'
            });
            this.showSpinner = false;
          }
        });
  }

  getDownloadLink(downloadId) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const data = JSON.stringify({
         'reference_id': downloadId
    });

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/reports/download';
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  reLoad(){
   // this.hideTable = !this.hideTable;
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }

  showInvoices() {
    this.hideTable = false;
    this.selectedInvoice = null;
    this.selectedInvoiceNumber = null;
  }

  handleInvoicePay(dataObj: any) {
    console.log('dataObj >>>')
    console.log(dataObj);
    this.selectedInvoiceDetails = dataObj.data;
    this.addPayment.show();
  }

  OnPay(modalComponent: PopUpModalComponent) {

    modalComponent.hide();

    console.log('this.selectedInvoiceDetails >>>')
    console.log(this.selectedInvoiceDetails);

    this.selectedInvoiceDetails.invoice.memo = this.memo;
    this.createTransactionRequest(this.selectedInvoiceDetails);
  }

  createTransactionRequest(dataObj) {
    return this.createTransaction(dataObj).subscribe(
        response => {
          console.log('response from create transaction >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            this.memo = '';
            Swal({
              title: 'Payment Successful',
              text: 'Payment for the selected invoice : ' + this.selectedInvoiceDetails.invoice.number  +  ' was successfully submitted',
              type: 'success'
            }).then( () => {
              this.reLoad();
            });
          } else {
            Swal({
              title: 'Payment Failed',
              text: 'We were unable to process payment for the selected invoice : ' +  this.selectedInvoiceDetails.invoice.number  +  '. Please try again',
              type: 'error'
            });
          }
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.createTransactionRequest.bind(self, dataObj)
            );
          } else {
            this.showSpinner = false;
            Swal({
              title: 'Payment Failed',
              text: 'We were unable to process payment for the selected invoice : ' + this.selectedInvoiceDetails.invoice.number   +  '. Please try again',
              type: 'error'
            });
          }
        }
    );
  }

  createTransaction(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);
    const url = this.api_fs.api + '/api/payments/transactions';
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  handleCloseModal(modalComponent: PopUpModalComponent) {
    modalComponent.hide();
    this.memo = '';
  }
  searchOrgRequest() {
    return this.searchOrgData().subscribe(
        response => {
          if (response && response.data) {
            response.data.forEach(function (ele) {
              this.orgArr.push({
                id: ele.org_uuid,
                text: ele.org_name
              });
            }, this);
          }
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchOrgRequest.bind(self)
            );
          } else {
            this.showSpinner = false;
          }
        }
    );
  }
  searchOrgData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orgs';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }
  orgChange(value) {
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }

}
