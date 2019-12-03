/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import{PopUpModalComponent} from "../../shared/components/pop-up-modal/pop-up-modal.component";
import { OktaAuthService } from '../../../services/okta.service';
import { OrganizationService} from '../../../services';
import * as _ from 'lodash';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit  {

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
    isColVisibility: true,
    isDownload: true,
    isRowSelection: null,
    isPageLength: true,
    isPagination: true
  }];
  dashboard: any;
  api_fs: any;
  @ViewChild('AddPayment') addPayment: PopUpModalComponent;
  externalAuth: any;
  showSpinner: boolean;
  summary = [];
  widget: any;
  paymentForm:FormGroup;
  organizations = [];
  selectedOrg : any;
  selectedVendor: any;
  vendors= [];
  selectedStatus: any;
  selectedPaymentMethod: any;
  error: any;
  paymentModel : any;
  statusOptions = [
    {
      id: 'FAILED',
      text: 'FAILED'
    },
    {
      id: 'FUNDED',
      text: 'FUNDED'
    },
    {
      id: 'INVOICE SUBMITTED',
      text: 'INVOICE SUBMITTED'
    },
    {
      id: 'PAYMENT_SENT',
      text: 'PAYMENT SENT'
    },
    {
      id: 'PENDING',
      text: 'PENDING'
    }];

    paymentMethodOptions = [

      {
        id: 'BILL PAY',
        text: 'BILL PAY'
      },
      {
        id: 'CHECK',
        text: 'CHECK'
      },
      {
        id: 'WIRE',
        text: 'WIRE'
      }];





  constructor(private okta: OktaAuthService, private organizationService: OrganizationService, private route: ActivatedRoute, private router: Router, private http: Http) {
    this.paymentForm = new FormGroup({
      memo: new FormControl('', Validators.required),
      amount: new FormControl('', [Validators.required, Validators.pattern(/^(0|[1-9]\d*)(\.\d+)?$/)]),
      invoiceRequestId: new FormControl(''),
      type: new FormControl('', Validators.required)
    });
    this.paymentModel= {
      memo: '',
      amount: '',
      invoiceRequestId: '',
      type: ''
    };
  }

  ngOnInit() {

    this.widget = this.okta.getWidget();
    this.showSpinner = true;
    this.height = '50vh';
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchDataRequest();
    this.getOrganizations();
    console.log(this.selectedStatus);

  }

  searchDataRequest() {
    return this.searchData().subscribe(
        response => {
          if (response) {
            console.log('response >>>')
            console.log(response);
            if (response.body) {
              if (response.body.summary) {
                this.summary = response.body.summary;
              }
              if (response.body.transactions) {
                this.populateDataTable(response.body.transactions, true);
              }
              this.showSpinner = false;
            }
          }
        },
        err => {

          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    this.showSpinner = false;
                    this.searchDataRequest();
                  })
                  .catch(function (err) {
                    console.log('error >>')
                    console.log(err);
                  });
            } else {
              this.widget.signOut(() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              });
            }
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
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/transactions';
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

  handleShowModal(modalComponent: PopUpModalComponent)
  {
    modalComponent.show();
  }
  handleCloseModal(modalComponent: PopUpModalComponent) {
    this.error = '';

    this.selectedOrg = this.organizations[0].id;
    this.getVendors(this.selectedOrg);
    this.selectedStatus = this.statusOptions[0].id;
    this.selectedPaymentMethod = this.paymentMethodOptions[0].id;

    this.paymentModel.memo = '';
    this.paymentForm.patchValue({
      memo : ''
    });

    this.paymentModel.type = '';
    this.paymentForm.patchValue({
      type : ''
    });

    this.paymentModel.amount = '';
    this.paymentForm.patchValue({
      amount : ''
    });

    this.paymentModel.invoiceRequestId = '';
    this.paymentForm.patchValue({
      invoiceRequestId : ''
    });
    modalComponent.hide();
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();

  }
  getOrganizations(){
    this.getAllOrganizations().subscribe(
      response => {
        if(response)
        {
          if(response.body.data.length > 0)
          {
            const organizations = [];

            _.forEach(response.body.data, organization => {

              organizations.push({
                id : organization.id,
                text: organization.name
              }
              );

            });

            this.organizations = _.sortBy(organizations,'text');
          }
        }
      },
      err => {

        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  localStorage.setItem('accessToken', newToken);
                  this.showSpinner = false;
                  this.getOrganizations();
                })
                .catch(function (err1) {
                  console.log('error >>')
                  console.log(err1);
                });
          } else {
            this.widget.signOut(() => {
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            });
          }
        } else {
          this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
          this.showSpinner = false;
        }
      }
    );
  }

  getVendors(orgid: any){
   return this.getVendorsByOrg(orgid).subscribe(
      response => {
        if(response)
        {
          if(response.body.data.length > 0)
          {
            const vendors = [];

            _.forEach(response.body.data, vendor => {

              vendors.push({
                id : vendor.id,
                text: vendor.name
              }
              );

            });

            this.vendors = _.sortBy(vendors,'text');
          }
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  localStorage.setItem('accessToken', newToken);
                  this.showSpinner = false;
                  this.getVendors(orgid);
                })
                .catch(function (err1) {
                  console.log('error >>')
                  console.log(err1);
                });
          } else {
            this.widget.signOut(() => {
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            });
          }
        } else {
          this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
          this.showSpinner = false;
        }
      }
    );
  }

  getVendorsByOrg(orgid: any){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
token = AccessToken;
    }

    console.log('AccessToken >>>')
    console.log(AccessToken.accessToken);

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors/vendor-by-orgid?orgid=' + orgid;
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }

  getAllOrganizations(){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
token = AccessToken;
    }

    console.log('AccessToken >>>')
    console.log(AccessToken.accessToken);

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors/orgs';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }
  OnOrgChanged(e: any): void {
    if (this.selectedOrg !== e.value ) {
      this.selectedOrg = e.value;
      this.getVendors(this.selectedOrg);
    }
  }

  OnVendorChanged(e: any): void {
    if (this.selectedVendor !== e.value ) {
      this.selectedVendor = e.value;

    }
  }
  OnStatusChanged(e: any): void {
    if (this.selectedStatus !== e.value ) {
      this.selectedStatus = e.value;

    }
  }

  OnPaymentMethodChanged(e: any): void {
    if (this.selectedPaymentMethod !== e.value ) {
      this.selectedPaymentMethod = e.value;

    }
  }


  OnSubmit(modalComponent: PopUpModalComponent) {
    this.showSpinner = true;
    this.error = '';
    const dataObj: any = {};

    dataObj.type = this.paymentForm.controls['type'].value;
    dataObj.vendor_id = this.selectedVendor;
    dataObj.customer_id = this.selectedOrg;
    dataObj.invoice_amount =  this.paymentForm.controls['amount'].value;
    dataObj.invoice_status = this.selectedStatus;
    dataObj.invoice_comments = this.paymentForm.controls['memo'].value;
    dataObj.invoice_request_id = this.paymentForm.controls['invoiceRequestId'].value;
    if(this.paymentForm.controls['type'].value == 'ap'){
    dataObj.payment_method = this.selectedPaymentMethod;
    }

    console.log("dataobj:" + dataObj);
    this.createTransactionRequest(dataObj);
  }

  createTransactionRequest(dataObj) {
    return this.createTransaction(dataObj).subscribe(
        response => {
          console.log('response from create transaction >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;

            this.error = { type : response.body ? 'success' : 'fail' , message : response.body ?  'Transaction successfully created' : 'Transaction creation failed' };

          }

        },
        err => {

          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    this.showSpinner = false;
                    this.createTransactionRequest(dataObj);
                  })
                  .catch(function (err1) {
                    console.log('error >>')
                    console.log(err1);
                  });
            } else {
              this.widget.signOut(() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              });
            }
          } else {
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  createTransaction(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
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

  handleRowSelection(rowObj: any, rowData: any) {

  }

}
