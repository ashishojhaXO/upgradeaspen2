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
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit  {

  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  invoiceId: any;
  selectedRow: any;
  invoiceItems = [];
  totalAmount = 0;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.invoiceId = params['id'];
        this.searchDataRequest(this.invoiceId);
      } else {
        Swal({
          title: 'No Invoice ID found',
          text: 'We did not find an invoice ID in the request',
          type: 'error'
        }).then( () => {
          this.router.navigate(['/app/payments/invoices']);
        });
      }
    });
  }

  searchDataRequest(invoiceId) {
    this.searchData(invoiceId).subscribe(
        response => {
          if (response && response.data) {
            this.invoiceItems = response.data;
            this.invoiceItems.forEach(function (item) {
              item.pay = '';
            }, this);
            this.showSpinner = false;
          }
        },
        err => {

          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    this.showSpinner = false;
                    this.searchDataRequest(invoiceId);
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

  searchData(invoiceId) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/invoices/' + invoiceId;
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
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

  updateTotal() {
    this.totalAmount = 0;
    this.invoiceItems.forEach(function (item) {
      this.totalAmount += item.pay ? parseFloat(item.pay) : 0;
    }, this);
  }

  OnPay() {

    const lineItems = [];
    this.invoiceItems.forEach(function (item) {
      lineItems.push({
        id : item.id,
        amount: item.pay ? parseFloat(item.pay) : 0,
        client_id: item.client_id,
        company_name : item.company_name
      });
    }, this);

    const dataObj = {
      invoice: {
        number: this.invoiceItems[0].invoice_number,
        header_id: this.invoiceItems[0].invoice_header_id,
        amount : this.totalAmount // total amount of the entered values in line item
      },
      line_items: lineItems
    };

    this.createTransactionRequest(dataObj);
  }

  createTransactionRequest(dataObj) {
    return this.createTransaction(dataObj).subscribe(
        response => {
          console.log('response from create transaction >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;

          //  this.error = { type : response.body ? 'success' : 'fail' , message : response.body ?  'Transaction successfully created' : 'Transaction creation failed' };

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
            this.showSpinner = false;
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
}
