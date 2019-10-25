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
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import{PopUpModalComponent} from "../../shared/components/pop-up-modal/pop-up-modal.component";
import { OktaAuthService } from '../../../services/okta.service';
import { OrganizationService} from '../../../services';
import * as _ from 'lodash';

@Component({
  selector: 'app-order-payment',
  templateUrl: './orderPayment.component.html',
  styleUrls: ['./orderPayment.component.scss']
})
export class OrderPaymentComponent {
  constructor() {

  }
}
