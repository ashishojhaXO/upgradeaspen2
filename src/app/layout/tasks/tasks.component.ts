/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-05-08 14:54:37
 */

import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit  {

  headers: any = [];
  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  api_fs: any;
  externalAuth: any;
  error: any;
  showSpinner: boolean;
  widget: any;
  periods: any;
  selectedPeriod: any;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {
    this.widget = this.okta.getWidget();
    this.showSpinner = true;
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.periods = this.getPeriods();
  }

  getPeriods() {
    var months = [];
    var monthName = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    var d = new Date();
    for (var i=0; i<=12; i++) {
      var monthVal = (d.getMonth() + 1).toString().length === 1 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1);
      const corrMonth = months.find(x=> x.id === (d.getFullYear() + '-' + monthVal + '-' + '01'));
      if(!corrMonth) {
        months.push({
          'id': d.getFullYear() + '-' + monthVal + '-' + '01',
          'text': monthName[d.getMonth()] + ' ' + d.getFullYear()
        })
      }
      d.setMonth(d.getMonth() - 1);
    }
    return months;
  }

  OnPeriodChange(e: any): void {
    if (!this.selectedPeriod || this.selectedPeriod !== e.value ) {
      this.selectedPeriod = e.value;
    }
  }
}
