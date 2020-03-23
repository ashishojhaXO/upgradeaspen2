/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-03-26 12:54:37
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import Swal from 'sweetalert2';
import { GenericService } from '../../../services/generic.service';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';

@Component({
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss'],
  providers: [GenericService]
})
export class ReconciliationComponent implements OnInit  {

  headers: any = [];
  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: any = [{
      isSearchColumn: true,
      isTableInfo: true,
      isCustomOption: {
        value : true,
        icon : 'fa-arrow-circle-o-down',
        tooltip: 'Download'
      },
      isDeleteOption: false,
      isAddRow: false,
      isColVisibility: true,
      isDownloadAsCsv: true,
      isDownloadAsCsvFunc: ( table, pageLength, csv?) => {
        this.apiMethod(table, pageLength, csv);
      },
      isDownloadOption: {
        value: true,
        icon: '',
        tooltip: 'View/Download Invoice'
      },
      isPlayOption: {
        value : true,
        icon : 'fa-plus-square',
        tooltip: 'View'
      },
      isRowSelection: null,
      isPageLength: true,
      isPagination: true
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  periodData: any;
  selectedPeriod: any;
  channelData: any;
  selectedChannel: any;

  settings: any = {
        singleSelection: true,
        text: 'Select ' ,
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        labelKey: 'itemName',
        searchBy: ['itemName'],
        enableCheckAll: true,
        enableSearchFilter: true,
        showTooltip: true,
        tooltipElementsSize: 10
    };
    hideTable: boolean;
    selectedInvoice: any;
    selectedInvoiceNumber: any;
    hasData: boolean;
    selectedInvoiceDetails: any;
    memo: string;
    @ViewChild('AddPayment') addPayment: PopUpModalComponent;
  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http,private genericService: GenericService) {
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.periodData = this.getPeriod();
    this.selectedPeriod = [this.periodData[1]];
    this.channelData = this.getChannel();
    this.selectedChannel = [this.channelData[0]];
    this.searchDataRequest();
  }

    handleSelect(selectedItem, type) {
       this[type] = [selectedItem];
    }

    handleDeSelect(selectedItem, type) {

    }

    handleRowSelection(rowObj: any, rowData: any) {

    }

    search() {
        this.dataObject.isDataAvailable = false;
        this.showSpinner = true;
        this.searchDataRequest();
    }

   searchDataRequest() {
      return this.searchData().subscribe(
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
            console.log('err')
            console.log(err);
          }
        }
    );
  }

  searchData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const dataObj = {
        clientCode: 'homd',
        year: this.selectedPeriod[0].id.split('-')[0],
        month: this.selectedPeriod[0].id.split('-')[1],
        // siteName: this.selectedChannel[0].id
    }

    const obj = JSON.stringify(dataObj);

    console.log('obj >>')
    console.log(obj)

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    //const url = this.api_fs.api + '/api/reports/reconciliation';
    const url= this.api_fs.api + '/api/payments/invoices/all';
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
    this.headers = [];

    if (tableData.length) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        let header = {
          key: keys[i],
          title: keys[i].replace(/_/g,' ').toUpperCase(),
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: false,
          width: '150'
        }
        this.headers.push(header);
      }
    }

   const rowsToColor = [];
    if (tableData.length) {
        tableData.forEach(function (data, index) {
            if (data.discrepancy_amount && data.discrepancy_amount > 0) {
                rowsToColor.push({
                    index: index,
                    'background-color': 'rgba(255,0,0,0.9)',
                    color: 'rgba(255,255,255,0.9)'
                });
            }
        });
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.gridData.rowsToColor = rowsToColor;
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  getPeriod() {
        const months = [];
        const monthName = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
        const d = new Date();
        for (var i=0; i<=12; i++) {
            var monthVal = (d.getMonth() + 1).toString().length === 1 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1);

            const existingMonth = months.find(x=> x.id === d.getFullYear() + '-' + monthVal + '-' + '01');
            if(!existingMonth) {
                months.push({
                    id: d.getFullYear() + '-' + monthVal + '-' + '01',
                    itemName: monthName[d.getMonth()] + ' ' + d.getFullYear()
                });
            }
            d.setMonth(d.getMonth() - 1);
        }
        return months;
    }

    getChannel() {
        const channel = [];
        channel.push({ id: 'pinterest', itemName: 'Pinterest'});
        channel.push({ id: 'facebook', itemName: 'Facebook'});
        channel.push({ id: 'google', itemName: 'Google'});
        return channel;
    }

    reLoad(){
      this.showSpinner = true;
      this.dataObject.isDataAvailable = false;
      this.searchDataRequest();
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

    apiMethod = (table, pageLength, csv?) => {
      this.options[0].isDisplayStart = table && table.page.info().start ? table.page.info().start : 0;
      
      if(csv){
        this.searchDataRequestCsv(null, table);
      }
      else
        this.searchDataRequest();
    }

    searchDataRequestCsv(org = null, table?) {

      // if no table, then send all default, page=1 & limit=25
      // else, send table data
      let data = { 
        page: 0, 
        limit: 10000000,
        org: org ? org : ''
      };
  
      // this.hasData = false;
      // this.showSpinner = true;
  
      return this.getRecCSV(data)
      .subscribe(
        (res) => {
          this.hasData = true;
          // this.showSpinner = false;
          // this.successCB.apply(this, [res])
          this.successCBCsv(res, table)
        },
        (err) => {
          this.showSpinner = false;
          this.errorCB(err)
  
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDataRequestCsv.bind(self, org, table)
            );
          } else {
            this.showSpinner = false;
          }
        }
      );
  
    }
    successCBCsv(res, table) {
      // Set this.response, before calc
      let rows = res.data;
      // let li = this.calc(res, table);
      console.log("Download Csv Here...");
  
      let arr: Array<String> = [];
  
      if (rows && rows.length) {
        const filRow = rows.map(res => {
          return { id: res.id, downloadable_file_id: res.downloadable_file_id,supplier:res.supplier,invoice_number:res.invoice_number,
            invoice_date:res.invoice_date,billing_period:res.billing_period,reference_number:res.reference_number,due_date:res.due_date,
            invoice_amount:res.invoice_amount,paid_amount:res.paid_amount,payment_terms:res.payment_terms,created_at:res.created_at
          };
        });
        arr.push( Object.keys(filRow[0]).join(",") ); 
        let dataRows = filRow.map( (k, v) => { return Object.values(k).join(", "); } ) 
        arr = arr.concat(dataRows);
      }
      let csvStr: String = "";
      csvStr = arr.join("\n");
  
      // var data = encode(csvStr);
      let b64 = btoa(csvStr as string);
      let a = "data:text/csv;base64," + b64;
      $('<a href='+a+' download="data.csv">')[0].click();
  
      return arr;
    }
  
    errorCB(rej) {
      console.log("errorCB: ", rej)
    }
    getRecCSV(data) {
      const AccessToken: any = localStorage.getItem('accessToken');
      let token = '';
      if (AccessToken) {
        // // token = AccessToken.accessToken;
        token = AccessToken;
      }
  
      const dataObj = {
          clientCode: 'homd',
          year: this.selectedPeriod[0].id.split('-')[0],
          month: this.selectedPeriod[0].id.split('-')[1],
          // siteName: this.selectedChannel[0].id
      }
  
      const obj = JSON.stringify(dataObj);
  
      console.log('obj >>')
      console.log(obj)
  
      const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
      const options = new RequestOptions({headers: headers});
      //const url = this.api_fs.api + '/api/reports/reconciliation';
      const url= this.api_fs.api + '/api/payments/invoices/all';
      return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
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
    handleCustom(dataObj: any){
      console.log(dataObj);
    }
}
