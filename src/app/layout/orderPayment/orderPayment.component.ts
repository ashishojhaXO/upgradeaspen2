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
import { OktaAuthService } from '../../../services/okta.service';
import {Headers, RequestOptions, Http} from '@angular/http';

@Component({
  selector: 'app-order-payment',
  templateUrl: './orderPayment.component.html',
  styleUrls: ['./orderPayment.component.scss'],
  providers: [GenericService],
})
export class OrderPaymentComponent {

  selectionType = '';
  paymentOptions: any;
  @Input() orderId: string;
  vendorId: string;
  showSpinner: boolean;
  // domain: string;
  api_fs: any;
  vendorUuid:any;
  userUuid: any;
  displayId: any;
  widget: any;
  isRoot: boolean;
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
      console.log('window.location.hostname')
      console.log(window.location.hostname);

      console.log('window[\'fs_widget_config\'] >>')
      console.log(window['fs_widget_config']);
      const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));

      // this.vendorUuid = this.route.snapshot.paramMap.get('vendor_uuid');
      this.vendorUuid = customerInfo.vendor.vendor_id
      this.userUuid = this.route.snapshot.paramMap.get('vendor_uuid');

      this.displayId = this.route.snapshot.paramMap.get('displayId');
      this.initVendorUuid();
      window['fs_widget_config'].vendor_id = this.vendorId = this.vendorUuid;
      window['fs_widget_config'].api_key = customerInfo.org.x_api_key;
      window['fs_widget_config'].org_id = customerInfo.org.org_id;
      window['fs_widget_config'].user_uuid = this.userUuid = customerInfo.user.user_uuid;

      // console.log("vendorUuid",this.vendorId);
      // Temp assignment FOR TESTING:
      // window['fs_widget_config'].vendor_id = '592f94f3-e2b1-4621-b1c0-c795ee2a1814'
      // this.vendorId = '592f94f3-e2b1-4621-b1c0-c795ee2a1814';
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
    this.initVars();
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

  initVars() {
    if(!this.orderId) {
      this.orderId = this.route.snapshot.paramMap.get('id') || '';
    }

    if (!this.orderId) {
      Swal({
        title: 'No Order ID found',
        text: 'We did not find an order to be paid for',
        type: 'error'
      }).then( () => {
        this.router.navigate(['/app/order/orders']);
      });
    }
  }
  initVendorUuid(){
    if (!this.vendorUuid) {
      Swal({
        title: 'No Vendor ID found',
        text: 'We did not find vendor id for this order',
        type: 'error'
      }).then( () => {
        this.router.navigate(['/app/order/orders']);
      });
    }
  }

  paymentTypeSelection(type) {
    this.selectionType = type;
    if ( this.selectionType == 'default') {
      this.postPaymentMethods(1);
    }
  }

  successCB(res) {

    const self = this;
    self.paymentOptions = [];
    if(res.attributes && res.attributes.length > 0){
      self.paymentOptions = res.attributes;
      // set paymentsChargeData to use it for charging
      res.attributes.filter((k, i) => {
        return k.is_default == 1 ? this.setPaymentsChargeData(k) : Object()
      })[0]

    }

  }

  errorCB(err) {
    console.log("ECB: ", err);

  }

  paymentsMethodsData: any;
  paymentsChargeData: any;

  setPaymentsMethodsData() {
    // this.paymentsMethodsData = { vendor_id : this.vendorId } ;
    this.paymentsMethodsData = { user_id: this.userUuid} ;
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
                console.log('err >>')
                console.log(err);
                this.showSpinner = false;
                Swal({
                  title: 'An error occurred',
                  html: err._body ? JSON.parse(err._body).message : 'No error definition available',
                  type: 'error'
                });
              }
              //this.errorCB(rej)
            }
        )
  }

  setDefaultPaymentMethod(option) {
    console.log('option >>')
    console.log(option);
    const obj = {
      vendor_id : this.vendorId,
      paymentmethodid : option.paymentmethodid
    };

    // const AccessToken: any = localStorage.getItem('accessToken');
    // let token = '';
    // if (AccessToken) {
    //   // token = AccessToken.accessToken;
    //   token = AccessToken;
    // }
    //
    // const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    // const options = new RequestOptions({headers: headers});

    this.setVendorPaymentMethodsRequest(obj).subscribe( (res) => {
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

  setVendorPaymentMethodsRequest(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const obj = JSON.stringify(dataObj);

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/methods/default';
    return this.http
        .put(url, obj, options)
        .map(res => {
          return res.json();
        }).share();

    // const data = JSON.stringify(dataObj);
    // const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    // return this.api.Call(
    //     'put',
    //     apiPath.api +
    //     this.base.API +
    //     this.base.
    //         PUT_VENDOR_DEFAULT_PAYMENTS_METHOD,
    //     data,
    //     option
    // );
  }

  setPaymentsChargeData(option) {
    // [paymentsChargeData]="option.is_default == '1' ? option : false"
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
                text: 'Your payment for the order ' + (this.displayId ? this.displayId : this.orderId) + ' was successfully charged',
                type: 'success'
              }).then( () => {
                this.router.navigate(['/app/order/orders']);
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
}
