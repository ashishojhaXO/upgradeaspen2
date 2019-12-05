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

  constructor(
    private route: ActivatedRoute,
    private genericService: GenericService,
    private router: Router
  ) {
    if (window['fs_widget_config']) {
      console.log('window[\'fs_widget_config\'] >>')
      console.log(window['fs_widget_config']);
        const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
        window['fs_widget_config'].vendor_id = this.vendorId = customerInfo.vendor.vendor_id;
       // this.vendorId = '592f94f3-e2b1-4621-b1c0-c795ee2a1814';
        window['fs_widget_config'].api_key = customerInfo.org.x_api_key;
        window['fs_widget_config'].org_id = customerInfo.org.org_id;
    }
  }

  ngOnInit() {
    this.initVars();
  }

  initVars() {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.orderId) {
      Swal({
        title: 'No Order ID found',
        text: 'We did not find an order to be paid for',
        type: 'error'
      }).then( () => {
        this.router.navigate(['/app/admin/orderslist']);
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

  setPaymentsMethodsData(option) {
    this.paymentsMethodsData = { vendor_id : this.vendorId } ;
  }

  postPaymentMethods(option) {
    this.setPaymentsMethodsData(1)

    return this.genericService
      .postPaymentsMethods(this.paymentsMethodsData)
      .subscribe(
        (res) => {
          // this.successCB.apply(this, [res])
          this.successCB(res)
        },
        (rej) => {
          this.errorCB(rej)
        }
      )
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

    const dataObj = { vendor_id : this.vendorId };

    this.setPaymentsChargeData(option);

   this.genericService
      .postPaymentsCharge(this.paymentsChargeData)
      .subscribe( (res) => {
            Swal({
              title: 'Payment Successfully Charged',
              text: 'Your payment for the order ' + this.orderId + ' was successfully charged',
              type: 'success'
            }).then( () => {
                  this.router.navigate(['/app/admin/orderslist']);
                });
      },
      (rej) => {
          Swal({
            title: 'Payment Charge Failed',
            text: 'We are having trouble charging for the order ' + this.orderId + ' using the selected payment type. Please try again',
            type: 'error'
          }).then( () => {})
          this.errorCB.apply(this, [rej])
        });
  }
}
