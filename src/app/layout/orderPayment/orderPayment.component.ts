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

@Component({
  selector: 'app-order-payment',
  templateUrl: './orderPayment.component.html',
  styleUrls: ['./orderPayment.component.scss']
})
export class OrderPaymentComponent {
  constructor() {
    if (window['fs_widget_config']) {
      console.log('window[\'fs_widget_config\'] >>')
      console.log(window['fs_widget_config']);
        const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
        window['fs_widget_config'].vendor_id = customerInfo.vendor.vendor_id;
        window['fs_widget_config'].api_key = customerInfo.org.x_api_key;
        window['fs_widget_config'].org_id = customerInfo.org.org_id;
    }
  }
}
