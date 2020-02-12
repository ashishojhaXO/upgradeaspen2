/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-03-26 12:54:37
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
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss']
})
export class ReconciliationComponent implements OnInit  {

  headers: any = [];
  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: any = [{
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
  periodData: any;
  selectedPeriod: any;
  channelData: any;
  selectedChannel: any;

  settings: any = {
        singleSelection: true,
        text: 'Select ' ,
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        labelKey: 'itemName',
        searchBy: ['itemName'],
        enableCheckAll: true,
        enableSearchFilter: true,
        showTooltip: true,
        tooltipElementsSize: 10
    };

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.periodData = this.getPeriod();
    this.selectedPeriod = [this.periodData[1]];
    this.channelData = this.getChannel();
    this.selectedChannel = [this.channelData[0]];
    this.searchDataRequest();
  }

    handleSelect(selectedItem, type) {
       this[type] = [selectedItem];
    }

    handleDeSelect(selectedItem, type) {

    }

    handleRowSelection(rowObj: any, rowData: any) {

    }

    search() {
        this.dataObject.isDataAvailable = false;
        this.showSpinner = true;
        this.searchDataRequest();
    }

   searchDataRequest() {
      return this.searchData().subscribe(
        response => {
            if (response) {
                this.populateDataTable(response, true);
                this.showSpinner = false;
            }
        },
        err => {
          if(err.status === 401) {
              let self = this;
              this.widget.tokenManager.refresh(
                'accessToken',
                  self.searchDataRequest.bind(self)
              );
          } else {
            this.showSpinner = false;
            console.log('err')
            console.log(err);
          }
        }
    );
  }

  searchData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const dataObj = {
        clientCode: 'homd',
        year: this.selectedPeriod[0].id.split('-')[0],
        month: this.selectedPeriod[0].id.split('-')[1],
        // siteName: this.selectedChannel[0].id
    }

    const obj = JSON.stringify(dataObj);

    console.log('obj >>')
    console.log(obj)

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const url = this.api_fs.api + '/api/reports/reconciliation';
    return this.http
      .post(url, obj, options)
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

   const rowsToColor = [];
    if (tableData.length) {
        tableData.forEach(function (data, index) {
            if (data.discrepancy_amount && data.discrepancy_amount > 0) {
                rowsToColor.push({
                    index: index,
                    'background-color': 'rgba(255,0,0,0.9)',
                    color: 'rgba(255,255,255,0.9)'
                });
            }
        });
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.gridData.rowsToColor = rowsToColor;
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  getPeriod() {
        const months = [];
        const monthName = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
        const d = new Date();
        for (var i=0; i<=12; i++) {
            var monthVal = (d.getMonth() + 1).toString().length === 1 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1);

            const existingMonth = months.find(x=> x.id === d.getFullYear() + '-' + monthVal + '-' + '01');
            if(!existingMonth) {
                months.push({
                    id: d.getFullYear() + '-' + monthVal + '-' + '01',
                    itemName: monthName[d.getMonth()] + ' ' + d.getFullYear()
                });
            }
            d.setMonth(d.getMonth() - 1);
        }
        return months;
    }

    getChannel() {
        const channel = [];
        channel.push({ id: 'pinterest', itemName: 'Pinterest'});
        channel.push({ id: 'facebook', itemName: 'Facebook'});
        channel.push({ id: 'google', itemName: 'Google'});
        return channel;
    }

    reLoad(){
      this.showSpinner = true;
      this.dataObject.isDataAvailable = false;
      this.searchDataRequest();
    }
}
