/**
 * Copyright 2019. Accelitas Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-11-14 14:54:37
 */

import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-target-aud',
  templateUrl: './targetAud.component.html',
  animations: [
    trigger('popOverState', [
      state('show', style({
        display: 'block'
      })),
      state('hide',   style({
        display: 'none'
      })),
      transition('show => hide', animate('600ms ease-out')),
      transition('hide => show', animate('1000ms ease-in'))
    ])
  ],
  styles: [`
        animation { display: block; }
    `]
})
export class TargetAudComponent implements OnInit  {

  gridData: any;
  dataObject: any;
  isDataAvailable: boolean;
  height: any;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isRowHighlight: false,
    isRowSelection: {
      isMultiple : false
    },
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: true
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  isExistingOrder = false;
  dataFieldConfiguration = [];
  templates = [];
  template = '';
  templateDefinition = [];
  data: any = {};
  FormModel: any;
  public form: FormGroup;
  formAttribute: any;
  dataRowUpdated = false;
  minDate = new Date();
  lineItems = [];
  clickedItem: any = 0;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http, fb: FormBuilder,) {
    this.formAttribute = fb;
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isExistingOrder = true;
      }
    });

    this.lineItems = [{
      name : 'Facebook',
      show : false,
      kpis: [1]
    },{
      name : 'Google',
      show : false,
      kpis: [1]
    },{
      name : 'Pinterest',
      show : false,
      kpis: [1]
    }]
  }

  addKpi(i) {
    this.lineItems[i].kpis.push(1);
  }

  toggle(i) {
    this.lineItems[i].show = !this.lineItems[i].show;
    this.clickedItem = i;
  }

  OnSubmit() {
    this.router.navigate(['/app/orderSummary']);
  }
}
