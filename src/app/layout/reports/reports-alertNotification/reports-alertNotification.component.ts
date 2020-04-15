/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-04-22 16:37:19
 */

import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../../services/okta.service';

@Component({
  selector: 'app-reports-alertNotification',
  templateUrl: './reports-alertNotification.component.html',
  styleUrls: ['./reports-alertNotification.component.scss']
})
export class AlertNoticationdashboardsComponent implements OnInit {

  headers: any = [];
  gridData: any;
  dataObject: any = {};
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
    isRowSelection: null,
    isPageLength: true,
    isPagination: true,
    fixedColumn: 1
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  isRoot: boolean;
  orgInfo: any;
  orgArr = [];
  selectedOrg: any;
  orgValue = '';

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const custInfo =  JSON.parse(localStorage.getItem('customerInfo') || '');
    this.orgInfo = custInfo.org;

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

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchOrgRequest();
    this.searchDataRequest();
  }

  searchDataRequest() {
    return this.searchData().subscribe(
        response => {
          if (response && response.body) {
            this.populateDataTable(response.body, true);
            this.showSpinner = false;
          }
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err, 
              self.searchDataRequest.bind(self)
            );
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  searchData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    let org=this.orgValue; 
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/reports/alert'+( org ? ('?org_uuid=' + org) : '');
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  populateDataTable(response, initialLoad) {
    const tableData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    this.headers = [];

    if (tableData.length) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        let header = {
          key: keys[i],
          title: keys[i].replace(/_/g,' ').toUpperCase(),
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: false,
          width: '150'
        }
        this.headers.push(header);
      }
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.dashboard = 'alertGrid';
    this.dataObject.gridData = this.gridData;
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleRowSelection(rowObj: any, rowData: any) {

  }

  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }
  searchOrgRequest() {
    return this.searchOrgData().subscribe(
        response => {
          if (response && response.data) {
            response.data.forEach(function (ele) {
              this.orgArr.push({
                id: ele.org_uuid,
                text: ele.org_name
              });
            }, this);
          }
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchOrgRequest.bind(self)
            );
          } else {
            this.showSpinner = false;
          }
        }
    );
  }
  searchOrgData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orgs';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }
  orgChange(value) {
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }

}
