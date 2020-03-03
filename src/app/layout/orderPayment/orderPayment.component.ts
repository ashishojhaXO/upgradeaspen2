/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import { GenericService } from '../../../services/generic.service';
import { DataTableOptions } from '../../../models/dataTableOptions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-payment',
  templateUrl: './orderPayment.component.html',
  styleUrls: ['./orderPayment.component.scss'],
  providers: [GenericService],
})
export class OrderPaymentComponent {

  selectionType = '';
  paymentOptions: any;
  orderId: string;
  vendorId: string;
  showSpinner: boolean;
  // domain: string;
  api_fs: any;

  constructor(
      private route: ActivatedRoute,
      private genericService: GenericService,
      private router: Router
  ) {

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));

    // if(window.location.hostname.indexOf('-dev') !== -1 || window.location.hostname.indexOf('localhost') !== -1) {
    //   this.domain = 'dev';
    // } else if (window.location.hostname.indexOf('-qa') !== -1) {
    //   this.domain = 'qa';
    // } else {
    //   this.domain = 'prod';
    // }

    if (window['fs_widget_config']) {
      console.log('window.location.hostname')
      console.log(window.location.hostname);

      console.log('window[\'fs_widget_config\'] >>')
      console.log(window['fs_widget_config']);
      const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
      window['fs_widget_config'].vendor_id = this.vendorId = customerInfo.vendor.vendor_id;
      window['fs_widget_config'].api_key = customerInfo.org.x_api_key;
      window['fs_widget_config'].org_id = customerInfo.org.org_id;

      // Temp assignment FOR TESTING:
      // window['fs_widget_config'].vendor_id = '592f94f3-e2b1-4621-b1c0-c795ee2a1814'
      // this.vendorId = '592f94f3-e2b1-4621-b1c0-c795ee2a1814';
    }
  }

  ngOnInit() {
    this.initVars();
    // set Pay by CC/ACH by default
    this.selectionType = 'default';
    if ( this.selectionType == 'default') {
      // Introduce a timeout to sync between newly created account to be displayed in the existing payments list
      const __this = this;
      setTimeout(function () {
        __this.postPaymentMethods(1);
      }, 1000);
    }
  }

  initVars() {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.orderId) {
      Swal({
        title: 'No Order ID found',
        text: 'We did not find an order to be paid for',
        type: 'error'
      }).then( () => {
        this.router.navigate(['/app/order/orderslist']);
      });
    }
  }

  paymentTypeSelection(type) {
    this.selectionType = type;

    console.log("selTYP: ", this.selectionType);

    if ( this.selectionType == 'default') {
      console.log("IF mein")
      this.postPaymentMethods(1);
    }
  }

  successCB(res) {

    console.log("SCB: ", res);
    const self = this;
    self.paymentOptions = [];
    if(res.attributes && res.attributes.length > 0){
      console.log("SCB IFFF: ", res, this , " self", self);
      self.paymentOptions = res.attributes;
      // set paymentsChargeData to use it for charging
      res.attributes.filter((k, i) => {
        return k.is_default == 1 ? this.setPaymentsChargeData(k) : Object()
      })[0]

      console.log("SCB IFFF: self.paymentOptions ", self.paymentOptions ,
          " this payMC", this.paymentsChargeData );
    }

  }

  errorCB(err) {
    console.log("ECB: ", err);

  }

  paymentsMethodsData: any;
  paymentsChargeData: any;

  setPaymentsMethodsData() {
    this.paymentsMethodsData = { vendor_id : this.vendorId } ;
  }

  postPaymentMethods(option) {
    this.showSpinner = true;
    this.setPaymentsMethodsData()

    return this.genericService
        .postPaymentsMethods(this.paymentsMethodsData)
        .subscribe(
            (res) => {
              this.showSpinner = false;
              // this.successCB.apply(this, [res])
              this.successCB(res)
            },
            (rej) => {
              this.showSpinner = false;
              this.errorCB(rej)
            }
        )
  }

  setDefaultPaymentMethod(option) {
    console.log('option >>')
    console.log(option);
    const obj = {
      vendor_id : this.vendorId,
      paymentmethodid : option.paymentmethodid
    }
    this.genericService
        .setDefaultPaymentMethod(obj)
        .subscribe( (res) => {
              this.showSpinner = false;
              Swal({
                title: 'Default Payment Method Successfully Changed',
                text: 'Your default payment method for future payments has been changed successfully',
                type: 'success'
              }).then( () => {

              });
            },
            (rej) => {
              this.showSpinner = false;
              Swal({
                title: 'Default Payment Method Change Failed',
                text: 'We are having trouble changing the default payment method. Please try again',
                type: 'error'
              }).then( () => {})

            });
  }

  setPaymentsChargeData(option) {
    // [paymentsChargeData]="option.is_default == '1' ? option : false"
    console.log("OPtion", option);
    this.paymentsChargeData = {
      vendorid: this.vendorId,
      orderid: this.orderId,
      paymentmethodid: option.paymentmethodid,
      // "lineitems": [15,16,17]
    }
  }

  postPaymentsCharge(option) {
    this.setPaymentsChargeData(option);

    this.showSpinner = true;

    this.genericService
        .postPaymentsCharge(this.paymentsChargeData)
        .subscribe( (res) => {
              this.showSpinner = false;
              Swal({
                title: 'Payment Successfully Charged',
                text: 'Your payment for the order ' + this.orderId + ' was successfully charged',
                type: 'success'
              }).then( () => {
                this.router.navigate(['/app/order/orderslist']);
              });
            },
            (rej) => {
              this.showSpinner = false;
              Swal({
                title: 'Payment Charge Failed',
                text: 'We are having trouble charging for the order ' + this.orderId + ' using the selected payment type. Please try again',
                type: 'error'
              }).then( () => {})
              this.errorCB.apply(this, [rej])
            });
  }



}
