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
  // invoiceId: any;
  selectedRow: any;
  invoices = [];
  memo: string;
  selectedInvoice: any;
  @ViewChild('AddPayment') addPayment: PopUpModalComponent;
  @Input() invoiceId: any;
  @Input() invoiceNumber: any;
  @Input() orgId: any;
  isRoot: boolean;
  tempLineItemID: string;
  tempMemo: string;
  tempProfile: string;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const grp = JSON.parse(groups);

    console.log('grp >>>')
    console.log(grp);

    grp.forEach(function (item) {
     if(item === 'ROOT' || item === 'SUPER_USER') {
        this.isRoot = true;
      }
    }, this);

    this.searchDataRequest(this.invoiceId);

    console.log('this.invoiceId >>')
    console.log(this.invoiceId);

    // this.route.params.subscribe(params => {
    //   if (params['id']) {
    //     this.invoiceId = params['id'];
    //     this.searchDataRequest(this.invoiceId);
    //   } else {
    //     Swal({
    //       title: 'No Invoice ID found',
    //       text: 'We did not find an invoice ID in the request',
    //       type: 'error'
    //     }).then( () => {
    //       this.router.navigate(['/app/payment/invoices']);
    //     });
    //   }
    // });
  }

  toggleField(invoice, item, field, prop, update) {
    invoice.invoiceItems.forEach(function (invoice1) {
      if (invoice1 !== item) {
        invoice1.is_memo_append = false;
        invoice1.is_line_item_id_append = false;
      }
    }, this);

    if (prop === 'line_item_id') {
        item.is_memo_append = false;
    } else if (prop === 'memo') {
        item.is_line_item_id_append = false;
    }

    item[field] = !item[field];
    if (!update) {
      this.tempLineItemID = '';
      this.tempMemo = '';
    } else {
      if (prop === 'line_item_id') {
        this.tempLineItemID = item[prop];
      } else if (prop === 'memo') {
        this.tempMemo = item[prop];
      }
    }
  }

  toogleInvoiceField(invoices, invoice, field , prop, update, alias = null) {

    console.log('invoice >>>')
    console.log(invoice)

    invoices.forEach(function (invoice1) {
      if (invoice1.id !== invoice.id) {
        invoice1.is_memo_append = false;
        invoice1.is_profile_append = false;
      }
    }, this);

    if (prop === 'profile_name') {
      invoice.is_memo_append = false;
    } else if (prop === 'memo') {
      invoice.is_profile_append = false;
    }

    invoice[field] = !invoice[field];

    console.log('field >>')
    console.log(field);
    console.log('invoice[field] >>')
    console.log(invoice[field])

    if (!update) {
      this.tempProfile = '';
      this.tempMemo = '';
    } else {
      if (prop === 'profile_name') {
        this.tempProfile = alias ? invoice[alias] : invoice[prop];
      } else if (prop === 'memo') {
        this.tempMemo = invoice[prop];
      }
    }
  }

  updateField(invoice, item, field, prop) {
    console.log('tempLineItemID >>')
    console.log(this.tempLineItemID);

    console.log('prop >>')
    console.log(prop);

    let targetField = '';
    if (prop === 'line_item_id') {
      targetField = this.tempLineItemID;
    } else if (prop === 'memo') {
      targetField = this.tempMemo;
    }
    this.showSpinner = true;
    this.updateValue(item, prop, targetField).subscribe(
        response => {
          this.showSpinner = false;
          item[prop] = targetField;
          this.toggleField(invoice, item, field, prop, false);
          Swal({
            title: 'Updated',
            text: prop + ' has been successfully updated',
            type: 'success'
          }).then( () => {

          });
        },
        err => {
          this.showSpinner = false;
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.updateField.bind(self, invoice, item, field, prop)
            );
          } else {
            Swal({
              title: 'Error',
              text: 'An error occured while updating ' + prop,
              type: 'error'
            }).then( () => {

            });
          }
        }
    );
  }

  updateValue(item, prop, targetField) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    let dataObj = {};
    if (prop === 'line_item_id') {
      dataObj = JSON.stringify({
        'line_item_id' : targetField
      });
    } else if (prop === 'memo') {
      dataObj = JSON.stringify({
        'memo' : targetField
      });
    }

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/invoices/line-items/' + item.id;
    return this.http
        .put(url, dataObj, options)
        .map(res => {
          return res.json();
        }).share();
  }

  updateInvoiceField(invoices, invoice, field, prop, alias = null) {
    console.log('prop >>')
    console.log(prop);

    console.log('invoice >>')
    console.log(invoice);

    let targetField = '';
    if (prop === 'profile_name') {
      targetField = this.tempProfile;
    } else if (prop === 'memo') {
      targetField = this.tempMemo;
    }

    console.log('targetField >>')
    console.log(targetField);

    this.showSpinner = true;
    this.updateInvoiceValue(invoice, prop, targetField).subscribe(
        response => {
          this.showSpinner = false;
          if (alias) {
            invoice[alias] = targetField;
          } else {
            invoice[prop] = targetField;
          }
          this.toogleInvoiceField(invoices, invoice, field, prop, false, alias);
        },
        err => {
          this.showSpinner = false;
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.updateInvoiceField.bind(self, invoices, invoice, field, prop, alias)
            );
          } else {
            Swal({
              title: 'Error',
              text: 'Error occured',
              type: 'error'
            }).then( () => {

            });
          }
        }
    );
  }

  updateInvoiceValue(invoice, prop, targetField) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    let dataObj = {};
    if (prop === 'profile_name') {
      dataObj = JSON.stringify({
        'profile_name' : targetField
      });
    } else if (prop === 'memo') {
      dataObj = JSON.stringify({
        'memo' : targetField
      });
    }

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/invoices/line-items/' + invoice.id;
    return this.http
        .put(url, dataObj, options)
        .map(res => {
          return res.json();
        }).share();
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
            const kenshoo_data = response.data.find(x=> x.site_name && x.site_name.toLowerCase() === 'kenshoo');
            if (!kenshoo_data) {
              const invoiceItems = response.data;
              // invoiceItems.forEach(function (item) {
              //   item.pay = item.discrepancy_amount === 0 ? item.billed_amount : '';
              // }, this);
              this.invoices.push({
                isKenshoo: false,
                invoiceNumber: invoiceItems.length ? invoiceItems[0].invoice_number : '',
                invoiceHeaderId: invoiceItems.length ? invoiceItems[0].invoice_header_id : '',
                invoiceItems : invoiceItems,
                show: true
              });
            } else {
              const invoiceItems = response.data;
              // invoiceItems.forEach(function (item) {
              //   item.pay = item.discrepancy_amount === 0 ? item.calculated_amount : '';
              // }, this);
              invoiceItems.forEach(function (d) {
                this.invoices.push({
                  isKenshoo: true,
                  profileName: d.profile_name,
                  id: d.id,
                  memo: d.memo,
                  invoiceNumber: d.invoice_number,
                  billingPeriod: d.billing_period,
                  supplier: d.supplier,
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
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDataRequest.bind(self, invoiceId)
            );

          } else {
            Swal({
              title: 'No Invoices found',
              text: 'We did not find any invoices associated with ID : ' + invoiceId,
              type: 'error'
            }).then( () => {
             // this.router.navigate(['/app/admin/invoices']);
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
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getKenshooProfileDetails.bind(self, invoice, profileName, invoice_header_id)
            );
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
    let org=this.orgId;
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/invoices/line-items?profile_name=' + profileName + '&invoice_header_id=' + InvoiceHeaderID
    +( org ? ('&org_uuid=' + org) : '');
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
    let org=this.orgId;
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/invoices/' + invoiceId+( org ? ('?org_uuid=' + org) : '');
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
    let self = this;
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
              this.invoices = [];
              this.searchDataRequest(this.invoiceId);
             // this.router.navigate(['/app/admin/invoices']);
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

  OnHeaderChecked(e, invoice) {
    if (e.target.checked) {
      invoice.totalAmount = 0;
      invoice.invoiceItems.forEach(function (item) {
        if (!item.checked) {
          const hasDiscrepancy = invoice.isKenshoo ? invoice.discrepancyAmount !== 0 : item.discrepancy_amount !== 0;
          if (!hasDiscrepancy) {
            item.checked = true;
            item.pay = invoice.isKenshoo ? (item.total_spend - (item.paid_amount ? item.paid_amount : 0 )) : (item.calculated_amount - (item.paid_amount ? item.paid_amount : 0 ));
            if (item.pay < 0) {
              item.pay = 0;
            }
          }
        }
        invoice.totalAmount += item.pay ? parseFloat(item.pay) : 0;
      });
    } else {
      invoice.invoiceItems.forEach(function (item) {
        item.checked = false;
      });
    }
  }

  OnCheckChecked(e, invoice, item) {
    invoice.totalAmount = 0;
    if (e.target.checked) {
      item.checked = true;
      item.pay = invoice.isKenshoo ? (item.total_spend - (item.paid_amount ? item.paid_amount : 0 )) : (item.calculated_amount - (item.paid_amount ? item.paid_amount : 0 ));
      if (item.pay < 0) {
        item.pay = 0;
      }
    }
    invoice.totalAmount += item.pay ? parseFloat(item.pay) : 0;
  }
}
