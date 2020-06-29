/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav, Ashish Ojha
 * Date: 2020-05-28 14:54:37
 */

import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import { GenericService } from '../../../services/generic.service';
import { DataTableOptions } from '../../../models/dataTableOptions';
import Swal from 'sweetalert2';
import { OktaAuthService } from '../../../services/okta.service';
import {Headers, Http, RequestOptions} from '@angular/http';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css'],
  providers: [GenericService],
})
export class PaymentMethodsComponent implements OnInit {

  selectionType = '';
  paymentOptions: any;
  vendorId: string;
  showSpinner: boolean;
  api_fs: any;
  vendorUuid:any;
  userUuid:any;
  displayId: any;
  widget: any;
  isRoot: boolean;
  paymentsMethodsData: any;
  paymentsChargeData: any;
  @Input() orderId: string;
  @Input() displayOrderID: any;

  constructor(
    private route: ActivatedRoute,
    private genericService: GenericService,
    private router: Router,
    private okta: OktaAuthService,
    private http: Http
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

      console.log('window[\'fs_widget_config\'] >>')
      console.log(window['fs_widget_config']);
      const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
      this.vendorUuid = this.route.snapshot.paramMap.get('vendor_uuid');
      this.displayId = this.displayOrderID || this.route.snapshot.paramMap.get('displayId');
      // this.initVendorUuid();
      window['fs_widget_config'].vendor_id = this.vendorId = this.vendorUuid;
      window['fs_widget_config'].api_key = customerInfo.org.x_api_key;
      window['fs_widget_config'].org_id = customerInfo.org.org_id;
      window['fs_widget_config'].user_uuid = this.userUuid = customerInfo.user.user_uuid;

        this.route.queryParams.subscribe(
            params => {
                if (params['message']) {
                    Swal({
                        title: 'Error',
                        text: params['message'],
                        type: 'error'
                    }).then(() => {

                    });
                }
            });
    }
    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const custInfo =  JSON.parse(localStorage.getItem('customerInfo') || '');
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
    // this.initVars();
    this.widget = this.okta.getWidget();
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

  // initVars() {
  //   if(!this.orderId) {
  //     this.orderId = this.route.snapshot.paramMap.get('id') || '';
  //   }

  //   if (!this.orderId) {
  //     Swal ({
  //       title: 'No Order ID found',
  //       text: 'We did not find an order to be paid for',
  //       type: 'error'
  //     }).then( () => {
  //       this.router.navigate(['/app/order/orders']);
  //     });
  //   }
  // }
  // initVendorUuid(){
  //   if (!this.vendorUuid) {
  //     console.log("NOVENDID")
      // Swal({
      //   title: 'No Vendor ID found',
      //   text: 'We did not find vendor id for this order',
      //   type: 'error'
      // }).then( () => {
        // this.router.navigate(['/app/order/orders']);
      // });
  //   }
  // }

  paymentTypeSelection(type) {
    this.selectionType = type;

    if ( this.selectionType == 'default') {
      this.postPaymentMethods(1);
    }
  }

  successCB(res) {

    const self = this;
    self.paymentOptions = [];
    if(res.body && res.body.length > 0){
      self.paymentOptions = res.body;
      // set paymentsChargeData to use it for charging
      res.body.filter((k, i) => {
        return k.is_default == 1 ? this.setPaymentsChargeData(k) : Object()
      })[0]

    }

  }

  errorCB(err) {
    console.log("ECB: ", err);
  }

  setPaymentsMethodsData() {
    this.paymentsMethodsData = { user_id : this.userUuid } ;
    // this.paymentsMethodsData = { user_id : this.userUuid };
  }

  postPaymentMethods(option) {
    this.showSpinner = true;
    this.setPaymentsMethodsData()

    let headers = {
      org_id: window['fs_widget_config'].org_id,
      'x-api-key': window['fs_widget_config'].api_key
    };

    return this.genericService
        .postUserPaymentsMethods(this.paymentsMethodsData, headers)
        .subscribe(
            (res) => {
              this.showSpinner = false;
              // this.successCB.apply(this, [res])
              this.successCB(res);
            },
            (err) => {
              if(err.status === 401) {
                let self = this;
                this.widget.refreshElseSignout(
                    this,
                    err,
                    self.postPaymentMethods.bind(self, option)
                );
              } else {
                this.showSpinner = false;
                Swal({
                  title: 'An error occurred',
                  html: err._body ? JSON.parse(err._body).message : 'No error definition available',
                  type: 'error'
                });
              }
            }
        )
  }

  setDefaultPaymentMethod(option) {

    const obj = {
      user_id : this.userUuid,
      payment_method_id : option.payment_method_id
    }

    const headers = {
      org_id: window['fs_widget_config'].org_id,
      'x-api-key': window['fs_widget_config'].api_key,
      'Content-Type': 'application/json'
    };

    this.genericService
        .setDefaultPaymentMethod(obj, headers)
        .subscribe( (res) => {
              this.showSpinner = false;
              Swal({
                title: 'Default Payment Method Successfully Changed',
                text: 'Your default payment method for future payments has been changed successfully',
                type: 'success'
              }).then( () => {

              });
            },
            (err) => {
              if(err.status === 401) {
                let self = this;
                this.widget.refreshElseSignout(
                    this,
                    err,
                    self.setDefaultPaymentMethod.bind(self, option)
                );
              } else {
                this.showSpinner = false;
                Swal({
                  title: 'Default Payment Method Change Failed',
                  html: err._body ? JSON.parse(err._body).message : 'No error definition available',
                  type: 'error'
                });
              }
            });
  }

  setPaymentsChargeData(option) {
    // [paymentsChargeData]="option.is_default == '1' ? option : false"
    this.paymentsChargeData = {
      // vendorid: this.vendorId,
      userid: this.userUuid,
      paymentmethodid: option.payment_method_id,
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
                text: 'Your payment for the order ' + (this.displayId ? this.displayId : (this.displayOrderID ? this.displayOrderID  : this.orderId ) ) + ' was successfully charged',
                type: 'success'
              }).then( () => {
                // this.router.navigate(['/app/order/orders']);
              });
            },
            (err) => {
              if(err.status === 401) {
                let self = this;
                this.widget.refreshElseSignout(
                    this,
                    err,
                    self.postPaymentsCharge.bind(self, option)
                );
              } else {
                this.showSpinner = false;
                Swal({
                  title: 'Payment Charge Failed',
                  text: 'We are having trouble charging for the order ' + (this.displayId ? this.displayId : this.orderId) + ' using the selected payment type. Please try again',
                  type: 'error'
                });
              }
              // this.errorCB.apply(this, [rej]);
            });
  }


  //
  // protected getPaymentMethodsSuccess(){}
  //
  // protected getPaymentMethodsError(){}

  // protected getPaymentMethods() {
  //   let dataObj: object = {};
  //   return this.genericService.getPaymentMethods(dataObj)
  //     .subscribe(
  //       this.getPaymentMethodsSuccess,
  //       this.getPaymentMethodsError,
  //     )
  // }
  //-

}
