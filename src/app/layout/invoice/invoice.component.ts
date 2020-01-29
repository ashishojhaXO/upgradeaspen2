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
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';

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
  invoices = [];
  memo: string;
  selectedInvoice: any;
  @ViewChild('AddPayment') addPayment: PopUpModalComponent;

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
          this.router.navigate(['/app/payment/invoices']);
        });
      }
    });
  }

  onTabClick(invoice) {
    if(invoice.show) {
      invoice.show = false;
    } else {
      invoice.show = true;
      this.getInvoiceDetails(invoice);
    }
  }

  getInvoiceDetails(invoice) {
    if(!invoice.invoiceItems.length) {
      this.getKenshooProfileDetails(invoice, invoice.profileName, invoice.invoiceHeaderId);
    }
  }

  searchDataRequest(invoiceId) {
    this.searchData(invoiceId).subscribe(
        response => {
          if (response && response.data) {
            const kenshoo_data = response.data.find(x=> x.site_name.toLowerCase() === 'kenshoo');
            if (!kenshoo_data) {
              const invoiceItems = response.data;
              invoiceItems.forEach(function (item) {
                item.pay = item.discrepancy_amount === 0 ? item.billed_amount : '';
              }, this);
              this.invoices.push({
                isKenshoo: false,
                invoiceNumber: invoiceItems.length ? invoiceItems[0].invoice_number : '',
                invoiceHeaderId: invoiceItems.length ? invoiceItems[0].invoice_header_id : '',
                invoiceItems : invoiceItems,
                show: true
              });
            } else {
              const invoiceItems = response.data;
              invoiceItems.forEach(function (item) {
                item.pay = item.discrepancy_amount === 0 ? item.calculated_amount : '';
              }, this);
              invoiceItems.forEach(function (d) {
                this.invoices.push({
                  isKenshoo: true,
                  profileName: d.profile_name,
                  invoiceNumber: d.invoice_number,
                  invoiceHeaderId: d.invoice_header_id,
                  invoiceItems : [],
                  billedAmount : d.billed_amount,
                  calculatedAmount: d.calculated_amount,
                  discrepancyAmount: d.discrepancy_amount
              });
              }, this);
            }
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
            Swal({
              title: 'No Invoices found',
              text: 'We did not find any invoices associated with ID : ' + invoiceId,
              type: 'error'
            }).then( () => {
              this.router.navigate(['/app/admin/invoices']);
            });
            this.showSpinner = false;
          }
        }
    );
  }

  getKenshooProfileDetails(invoice, profileName, invoice_header_id) {
    this.searchProfileData(profileName, invoice_header_id).subscribe(
        response => {
          if (response && response.data) {
            const invoiceItems = response.data;
            invoiceItems.forEach(function (item) {
              item.pay = '';
            }, this);
            invoice.invoiceItems = invoiceItems;
            this.showSpinner = false;
          }

          console.log('invoice')
          console.log(invoice);

        },
        err => {

          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    this.showSpinner = false;
                    this.getKenshooProfileDetails(invoice, profileName, invoice_header_id);
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

  searchProfileData(profileName, InvoiceHeaderID) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/invoices/line-items?profile_name=' + profileName + '&invoice_header_id=' + InvoiceHeaderID;
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
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

  updateTotal(invoice) {
    invoice.totalAmount = 0;
    invoice.invoiceItems.forEach(function (item) {
      invoice.totalAmount += item.pay ? parseFloat(item.pay) : 0;
    }, this);
  }

  OnPay(modalComponent: PopUpModalComponent) {

    modalComponent.hide();
    const lineItems = [];
    this.selectedInvoice.invoiceItems.forEach(function (item) {
      lineItems.push({
        id : item.line_item_id,
        amount: item.pay ? parseFloat(item.pay) : 0,
        client_id: item.client_id
      });
    }, this);

    console.log('this.selectedInvoice >>')
    console.log(this.selectedInvoice);


    const dataObj = {
      invoice: {
        number: this.selectedInvoice.invoiceNumber,
        header_id: this.selectedInvoice.invoiceHeaderId,
        amount : this.selectedInvoice.totalAmount, // total amount of the entered values in line item,
        memo: this.memo
      },
      line_items: lineItems
    };

    this.createTransactionRequest(dataObj);
  }

  getMonth(num) {
    var ret = '';
    switch (num) {
      case 1: ret = 'Jan'; break;
      case 2: ret = 'Feb'; break;
      case 3: ret = 'Mar'; break;
      case 4: ret = 'Apr'; break;
      case 5: ret = 'May'; break;
      case 6: ret = 'Jun'; break;
      case 7: ret = 'Jul'; break;
      case 8: ret = 'Aug'; break;
      case 9: ret = 'Sep'; break;
      case 10: ret = 'Oct'; break;
      case 11: ret = 'Nov'; break;
      case 12: ret = 'Dec'; break;
    }
    return ret;
  }

  createTransactionRequest(dataObj) {
    return this.createTransaction(dataObj).subscribe(
        response => {
          console.log('response from create transaction >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            Swal({
              title: 'Payment Successful',
              text: 'Payment for the selected invoice : ' + this.invoiceId  +  ' was successfully submitted',
              type: 'success'
            }).then( () => {
              this.router.navigate(['/app/admin/invoices']);
            });
          } else {
            Swal({
              title: 'Payment Failed',
              text: 'We were unable to process payment for the selected invoice : ' + this.invoiceId  +  '. Please try again',
              type: 'error'
            });
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
            Swal({
              title: 'Payment Failed',
              text: 'We were unable to process payment for the selected invoice : ' + this.invoiceId  +  '. Please try again',
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

  handleShowModal(modalComponent: PopUpModalComponent, invoice: any) {
    this.selectedInvoice = invoice;
    modalComponent.show();
  }
  handleCloseModal(modalComponent: PopUpModalComponent) {
    modalComponent.hide();
    this.memo = '';
  }
}
