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
  selector: 'app-order-dashboard',
  templateUrl: './orderDashboard.component.html',
  styleUrls: ['./orderDashboard.component.scss']
})
export class OrderDashboardComponent implements OnInit  {

  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  // invoiceId: any;
  selectedRow: any;
  invoices = [];
  memo: string;
  @Input() orderID: any;
  @Input() displayOrderID: any;
  @Input() lineItemID: any;
  @Input() vendorUuid: any;
  config: any;
  options: any;
  orderDetails: any;
  lineItemDetails = [];

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();
    this.options = { multi: false };
    this.config = this.mergeConfig(this.options);
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchDateRequest(this.orderID, this.lineItemID);
  }

  searchDateRequest(orderID, lineItemID) {
    let self = this;
    this.searchDate(orderID, lineItemID).subscribe(
        response => {
          console.log('response >>')
          console.log(response);
          this.orderDetails = response.data.order;
          this.lineItemDetails = response.data.lineItems;
          if (this.lineItemDetails.length) {

            const __this = this;
            this.lineItemDetails = this.lineItemDetails.map(function (item) {
              item.active = false;
              item.started = item.line_item_start_date && !(new Date(item.line_item_start_date) >= new Date());
              item.ended = item.line_item_end_date && (new Date(item.line_item_end_date) <= new Date());
              item.actual_line_item_start_date = __this.addDays(item.line_item_start_date, 1);
              item.actual_line_item_end_date = __this.addDays(item.line_item_end_date, 1);
              return item;
            });
            const endDates = this.lineItemDetails.map(function (item) {
              return item.line_item_end_date;
            });
            const startDates = this.lineItemDetails.map(function (item) {
              return item.line_item_start_date;
            });

            this.orderDetails.start = this.min_date(startDates);
            this.orderDetails.started = false;
            if (this.orderDetails.start) {
              this.orderDetails.started = !(new Date(this.orderDetails.start) >= new Date());
            }

            this.orderDetails.end = this.max_date(endDates);
            this.orderDetails.ended = false;
            if(this.orderDetails.end) {
              this.orderDetails.ended = (new Date(this.orderDetails.end) <= new Date());
            }
          }
          this.showSpinner = false;
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDateRequest.bind(self, orderID, lineItemID),
            );

          } else {
            // Swal({
            //   title: 'No Invoices found',
            //   text: 'We did not find any invoices associated with ID : ' + invoiceId,
            //   type: 'error'
            // }).then( () => {
            //  // this.router.navigate(['/app/admin/invoices']);
            // });
            // this.showSpinner = false;
          }
        }
    );
  }

  max_date(datesArr) {
    var max_dt = datesArr[0],
        max_dtObj = new Date(datesArr[0]);
    datesArr.forEach(function(dt, index)
    {
      if ( new Date( dt ) > max_dtObj) {
        max_dt = dt;
        max_dtObj = new Date(dt);
      }
    });
    return max_dt;
  }

  min_date(datesArr) {
    var min_dt = datesArr[0],
        min_dtObj = new Date(datesArr[0]);
    datesArr.forEach(function(dt, index)
    {
      if ( new Date( dt ) < min_dtObj) {
        min_dt = dt;
        min_dtObj = new Date(dt);
      }
    });
    return min_dt;
  }

  searchDate(orderID, lineItemID) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data: any = {
      order_id : orderID
    };
    var url = this.api_fs.api + '/api/orders/dates' ;
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  mergeConfig(options) {
    // 기본 옵션
    const config = {
      // selector: '#accordion',
      multi: true
    };

    return { ...config, ...options };
  }

  lineItemExtensionAllowed(endData) {
    return this.getDaysBetweenDates(new Date(endData), new Date()) >= 7;
  }

  getDaysBetweenDates(second, first) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24)) + 1;
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  toggle(index: number) {
    // 멀티 오픈을 허용하지 않으면 타깃 이외의 모든 submenu를 클로즈한다.
    if (!this.config.multi) {
      this.lineItemDetails.filter(
          (menu, i) => i !== index && menu.active
      ).forEach(menu => menu.active = !menu.active);
    }

    // Menu의 active를 반전
    this.lineItemDetails[index].active = !this.lineItemDetails[index].active;
  }

  payOrder() {
    console.log('this.displayOrderID >>')
    console.log(this.displayOrderID);
    if (!this.orderDetails.payment_received_date) {
      this.router.navigate(['/app/orderPayment/', this.orderID, this.vendorUuid, this.displayOrderID]);
    }
  }

  editOrder() {
    if (!this.orderDetails.payment_received_date) {
      this.router.navigate(['/app/order/create', this.orderID, this.vendorUuid]);
    }
  }

  cancelOrder() {
    if (!this.orderDetails.payment_received_date) {
      Swal({
        title: 'Are you sure you want to delete this order?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          this.cancelOrderRequest(this.orderID, this.displayOrderID);
        }
      });
    }
  }

  cancelOrderRequest(orderID, displayOrderID) {
    this.cancelRequest(orderID).subscribe(
        response => {
          console.log('response >>')
          console.log(response);
          this.showSpinner = false;
          Swal({
            title: 'Order Successfully Delete',
            text: 'Order : ' + displayOrderID + ' has been successfully deleted',
            type: 'success'
          }).then( () => {
           this.router.navigate(['/app/order/orders']);
          });
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.cancelOrderRequest.bind(self, orderID),
            );
          } else {
            this.showSpinner = false;
            Swal({
              title: 'Order Deletion Failed',
              html: err._body ? JSON.parse(err._body).message : 'No error definition available',
              type: 'error'
            }).then( () => {
             // this.router.navigate(['/app/admin/invoices']);
            });
          }
        }
    );
  }

  refundLineItem(lineItem, orderID) {
    if (lineItem.ended ) {
      Swal({
        title: 'Issue Refund?',
        text: 'You have $' + lineItem.balance_amount + ' available. Would you like to refund ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          let self = this;
          this.refundRequest(lineItem, orderID).subscribe(
              response => {
                console.log('response >>')
                console.log(response);
                this.showSpinner = false;
                Swal({
                  title: 'Refund Successfully Issued',
                  text: 'A refund of $' + lineItem.balance_amount + ' has been successfully issued',
                  type: 'success'
                }).then( () => {
                  this.router.navigate(['/app/order/orders']);
                });
              },
              err => {
                if(err.status === 401) {
                  let self = this;
                  this.widget.refreshElseSignout(
                      this,
                      err,
                      self.refundLineItem.bind(self, lineItem, orderID)
                  );
                } else {
                  Swal({
                    title: 'Refund Issue Failed',
                    text: 'An error occurred while issuing refund. Please try again',
                    type: 'error'
                  }).then( () => {
                  });
                  this.showSpinner = false;
                }
              }
          );
        }
      });
    }
  }

  cancelRequest(orderID) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data: any = {
      order_id : orderID
    };
    var url = this.api_fs.api + '/api/orders/delete' ;
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  refundRequest(lineItem, orderID) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data: any = JSON.stringify({
      order_id : orderID,
      line_item_id : lineItem.line_item_id,
      refund_amount : lineItem.balance_amount
    });
    var url = this.api_fs.api + '/api/orders/refund' ;
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  extendOrder(lineItem) {

    console.log('this.orderID >>')
    console.log(this.orderID);

    console.log('lineItem.line_item_id >>')
    console.log(lineItem.line_item_id);

    if (this.lineItemExtensionAllowed(lineItem.line_item_end_date) && this.orderDetails.payment_received_date) {
      this.router.navigate(['/app/order/create', this.orderID, this.vendorUuid, lineItem.line_item_id]);
    }
  }
}
