/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import * as chartConfig from './chartConfig.json';
import {Http, Headers, RequestOptions} from '@angular/http';
import {PopupDataAction} from '../../shared/components/app-popup-button/popup-data-action';
import { OktaAuthService } from '../../../services/okta.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-vis-dashboard',
  templateUrl: './visDashboard.component.html',
  styleUrls: ['./visDashboard.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        display: 'inline-block',
        opacity: '1'
      })),
      state('closed', style({
        display: 'none',
        opacity: '0'
      })),
      // state('open', style({
      //   height: '*',
      //   opacity: '1'
      // })),
      // state('closed', style({
      //   height: '0px',
      //   opacity: '0'
      // })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
  ]
})
export class VisDashboardComponent implements OnInit  {

  orgChartConfig: any;
  vendorChartConfig: any;
  userChartConfig: any;
  selectedTile: any;
  widget: any;
  show = false;

  constructor(
    private okta: OktaAuthService, 
    private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

    this.widget = this.okta.getWidget();

    this.orgChartConfig = JSON.parse(JSON.stringify(chartConfig));
    this.orgChartConfig.data = [
        {
          label : 'THD',
          value: 23
        },
        {
          label : 'FS',
          value: 23
        },
        {
          label : 'OTHER',
          value: 42
        }];
    this.orgChartConfig.title = 98;
    this.orgChartConfig.titleXAlign = -63;

    this.vendorChartConfig = JSON.parse(JSON.stringify(chartConfig));
    this.vendorChartConfig.data = [
      {
        label : 'THD',
        value: 30
      },
      {
        label : 'FS',
        value: 20
      },
      {
        label : 'OTHER',
        value: 10
      }];
    this.vendorChartConfig.title = 60;
    this.vendorChartConfig.titleXAlign = -63;

    this.userChartConfig = JSON.parse(JSON.stringify(chartConfig));
    this.userChartConfig.data = [
      {
        label : 'THD',
        value: 230
      },
      {
        label : 'FS',
        value: 180
      },
      {
        label : 'OTHER',
        value: 130
      }];
    this.userChartConfig.title = 540;
    this.userChartConfig.titleXAlign = -67;
  }

  setSelectedTile(type) {
    if (this.selectedTile === type) {
      this.selectedTile = null;
      return;
    }
    this.selectedTile = type;
  }

  get stateName() {
    return this.selectedTile ? 'show' : 'hide'
  }
}
