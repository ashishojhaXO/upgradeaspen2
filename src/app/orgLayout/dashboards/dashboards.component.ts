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
import {DataTableOptions} from '../../../models/dataTableOptions';
import * as chartConfig from './chartConfig.json';
import {Http, Headers, RequestOptions} from '@angular/http';
import {PopupDataAction} from '../../shared/components/app-popup-button/popup-data-action';
import { OktaAuthService } from '../../../services/okta.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit, PopupDataAction  {

  chartConfig: any;
  dashboardConfig: any;
  dashboardType: any;
  selectedView: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: any;

  defaultFilters = [
        {
          f7Name : 'type',
          label : 'View',
          values : 'Monthly',
          isMultiSelect : false,
          dependentOn : [],
          type : 'toggle',
          toggleOptions : [{
            name : 'CTD',
            value : 'Monthly'
          },
          {
            name: 'MTD',
            value: 'Daily'
          }]
        },
        {
          f7Name : 'period',
          label : 'Period',
          values : [],
          isMultiSelect : false,
          dependentOn : [],
          type : 'dropdown'
        }
  ];

  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: Array<DataTableOptions> = [{
    isSearchColumn: true,
    isOrdering: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isRowSelection: true,
    isShowEntries: false,
    isPagination: true,
    isPageLength: 10,
    isEmptyTable: 'No Data'
  }];
  dashboard: any;
  widget: any;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
    this.showSpinner = false;
  }

  getDependentConfig(dependsOn: any) {
    return this.dashboardConfig.filterProps.filter(function (x) {
       return dependsOn.indexOf(x.f7Name) !== -1;
    });
  }

  getData(filterConfig, dependentConfig) {

    const applyFilter = [];
    if(dependentConfig.length) {
      dependentConfig.forEach(function (config) {
        if (config.values.length) {
          const values = [];
          config.values.forEach(function (val) {
             values.push(val.id);
          });
          applyFilter.push({
            f7Name : config.f7Name,
            values : values
          });
        }
      });
    }

    if (applyFilter.length) {

      const AccessToken: any = this.widget.tokenManager.get('accessToken');
      let token = '';
      if (AccessToken) {
        token = AccessToken.accessToken;
      }
      const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
      const options = new RequestOptions({headers: headers});

      const dataObj = {
        filter: applyFilter,
        entity: filterConfig.f7Name,
        page: 1,
        limit: 10
      };

      var obj = JSON.stringify(dataObj);

      console.log('filter dataObj >>')
      console.log(obj);

      return this.http
        .post(this.api_fs.api + '/api/reports/org/homd/filters', obj, options )
        .map(res => {
          const result = res.json();
          const ret = [];
          if (result.length) {
            result.forEach(function (item) {
              ret.push({id: item, label: item});
            });
          }
          return ret;
        });
    } else {
      return this.http
          .get(this.api_fs.api + '/api/reports/org/homd/seed-filters')
          .map(res => {
            if (res['_body']) {
              const result = JSON.parse(res['_body']);
              const data = result[filterConfig.f7Name];
              const ret = [];
              if (data && data.length) {
                data.forEach(function (item) {
                  ret.push({id: item, label: item});
                });
              }
              return ret;
            }
          });
    }
  }

  updateFilterConfig(data) {
   console.log('updated value ' + data.f7Name)
    console.log(data);

   // Reset the filters dependent on the current field
    this.dashboardConfig.filterProps.forEach(function (item) {
      if (item.dependentOn.indexOf(data.f7Name) != -1) {
        item.values = [];
      }
    });
  }

  setActive(filter, Obj) {

    this.dashboardConfig = {};
    this.dashboardConfig.filterProps = JSON.parse(JSON.stringify(this.defaultFilters));

    const corrFilter = this.dashboardConfig.filterProps.find( x=> x.type === filter.type);
    if (corrFilter) {
      corrFilter.values = Obj.value;
    }

    var dataSource = JSON.parse(localStorage.getItem('dashboardConfig_' + this.dashboardType)) || '';
    if (dataSource) {
      this.populateFilters(dataSource);
    }
  }

  ngOnInit() {

    this.widget = this.okta.getWidget();
    this.showSpinner = true;
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    this.dashboardType = this.router.url.substr(this.router.url.lastIndexOf('/') + 1);
    this.height = '50vh';
    this.dashboardConfig = {};
    this.dashboardConfig.filterProps = JSON.parse(JSON.stringify(this.defaultFilters));
    if (this.dashboardType === 'pacing' || this.dashboardType === 'spend') {
      this
        .getFilter(this.dashboardType)
        .then(
          response => {
            console.log('response filter >>>')
            console.log(JSON.stringify(response));
            this.showSpinner = false;
            if (response && response.data) {
              this.populateFilters(response.data);
              var __this = this;
              setTimeout(function () {
                __this.search();
              },3000);

            }
          },
          error => {
            this.showSpinner = false;
          });

      const defaultObj: any = {};
      defaultObj.gridData = [];
      defaultObj.chartData = [];
      this.populateChart(defaultObj);
      this.populateDataTable(defaultObj, true);
    }
  }

  populateFilters(response) {

    localStorage.setItem('dashboardConfig_' + this.dashboardType, JSON.stringify(response));
    var dashboardConfig = response;
    var selectedType = this.dashboardConfig.filterProps.filter(function (filter) {
       return filter.f7Name === 'type';
    });

    if (selectedType.length) {

      console.log('dashboardConfig >>')
      console.log(dashboardConfig);

      console.log('selectedType >>')
      console.log(selectedType);

       var getSelectedTypeConfig = dashboardConfig.views.find(x => x.name === selectedType[0].values);

       console.log('getSelectedTypeConfig >>')
       console.log(getSelectedTypeConfig);

       this.selectedView = getSelectedTypeConfig.name;
       if (getSelectedTypeConfig) {

         console.log('getSelectedTypeConfig.filters.source >>>')
         console.log(getSelectedTypeConfig.filters.source);

         getSelectedTypeConfig.filters.source.forEach(function (filter, index) {
           if(filter.f7_name != 'month') {
             var newFilter: any = {};
             newFilter.f7Name = filter.f7_name;
             newFilter.label = filter.alias;
             newFilter.values = [];
             newFilter.displayDefault = filter.displayDefault;
             //  newFilter.values = filter.default_value ? [filter.default_value] : [];
             newFilter.isMultiSelect = filter.isMultiSelect || false;
             newFilter.dependentOn = filter.parent || [];
             newFilter.includeCustom = false;
             newFilter.isMultipleCustomType = false;
             newFilter.isTag = false;
             newFilter.placeHolderText = '';
             newFilter.placeHolderValue = '';
             newFilter.apiRequestUrl = '';
             newFilter.apiRequestType = '';
             newFilter.type = 'popupButton';

             this.dashboardConfig.filterProps.push(newFilter);
           }
         }, this);
       }

      console.log('this.dashboardConfig.filterProps >>>')
      console.log(this.dashboardConfig.filterProps);
    }
  }

  getMonthName(num) {
    switch (num) {
      case '1' : return 'Jan';
      case '2' : return 'Feb';
      case '3' : return 'Mar';
      case '4' : return 'Apr';
      case '5' : return 'May';
      case '6' : return 'Jun';
      case '7' : return 'Jul';
      case '8' : return 'Aug';
      case '9' : return 'Sep';
      case '10' : return 'Oct';
      case '11' : return 'Nov';
      case '12' : return 'Dec';
    }
  }

  populateChart(response) {

    console.log('chart response >>>')
    console.log(response.chartData);

    this.chartConfig = JSON.parse(JSON.stringify(chartConfig));
    if (response.chartData && response.chartData.length) {

      console.log('response.chartData >>><<')
      console.log(response.chartData);

      if(this.dashboardType === 'pacing') {

        this.chartConfig.title = '';
        this.chartConfig.YAxis.data = [];
        this.chartConfig.isStacked = true;

        if (this.selectedView === 'Monthly') {

          response.chartData.forEach(function (x) {
            x['date'] = this.getMonthName(x['Month']) + ' ' + x['Year'];
          }, this);

          this.chartConfig.XAxis.dataPropertyName = 'date';
          this.chartConfig.XAxis.labelName = '';
          this.chartConfig.YAxis.data.push({
            labelName: '',
            unitType: ''
          });
          this.chartConfig.dataPoints = [
            {
              propertyName: 'Monthly Spend',
              type: 'column',
              color: 'rgb(56, 199, 224)'
            },
            {
              propertyName: 'Cumulative Spend',
              type: 'column',
              color: 'rgb(80, 130, 186)'
            },
            {
              propertyName: 'Line Item Budget',
              type: 'line',
              color: 'rgb(253, 8, 0)'
            }
          ];
        } else {

          this.chartConfig.XAxis.labelName = '';
          this.chartConfig.XAxis.dataPropertyName = 'Date';
          this.chartConfig.YAxis.data.push({
            labelName: '',
            unitType: '',
            // tickIntervalType: 'logarithmic'
          });
          this.chartConfig.dataPoints = [
            {
              propertyName: 'Daily Spend',
              type: 'column',
              color: 'rgb(56, 199, 224)'
            },
            {
              propertyName: 'Monthly Cumulative Spend',
              type: 'column',
              color: 'rgb(80, 130, 186)'
            },
            {
              propertyName: 'Line Item Monthly Budget',
              type: 'line',
              color: 'rgb(253, 8, 0)'
            }
          ];
        }

        this.chartConfig.data = response.chartData;

        console.log('this.chartConfig.data >>')
        console.log(this.chartConfig.data);

        // this.chartConfig.data.map(function (d) {
        //   if (d['Date']) {
        //     return d['Date'] = d['Date'].split('-')[2];
        //   }
        // });

      } else {

        this.chartConfig.title = '';
        this.chartConfig.YAxis.data = [];

        if (this.selectedView === 'Monthly') {

          response.chartData.forEach(function (x) {
            x['date'] = this.getMonthName(x['Month']) + ' ' + x['Year'];
          }, this);

          this.chartConfig.XAxis.labelName = '';
          this.chartConfig.XAxis.dataPropertyName = 'date';

          this.chartConfig.YAxis.data.push({
            labelName: '',
            unitType: '',
            // tickIntervalType: 'logarithmic'
          });
          // this.chartConfig.YAxis.data.push({
          //   labelName: '',
          //   unitType: ''
          // });

          this.chartConfig.dataPoints = [
            {
              propertyName: 'Media Cost',
              type: 'column',
              color: 'rgb(85, 182, 188)',
              YaxisAssociation : ''
            },
            {
              propertyName: 'Technology Cost',
              type: 'column',
              color: 'rgb(58, 116, 179)',
              YaxisAssociation : ''
            },
            {
              propertyName: 'Line Item Budget',
              type: 'line',
              color: 'rgb(153, 204, 51)',
              YaxisAssociation : ''
            }
          ];

        } else {

          this.chartConfig.XAxis.labelName = '';
          this.chartConfig.XAxis.dataPropertyName = 'Date';

          this.chartConfig.YAxis.data.push({
            labelName: '',
            unitType: '',
            // tickIntervalType: 'logarithmic'
          });
          // this.chartConfig.YAxis.data.push({
          //   labelName: '',
          //   unitType: ''
          // });

          this.chartConfig.dataPoints = [
            {
              propertyName: 'Media Cost',
              type: 'column',
              color: 'rgb(80, 130, 186)'
            },
            {
              propertyName: 'Technology Cost',
              type: 'column',
              color: 'rgb(56, 199, 224)'
            },
            {
              propertyName: 'Line Item Budget',
              type: 'line',
              color: 'rgb(253, 8, 0)'
            }
          ];
        }

        this.chartConfig.data = response.chartData ; //response.chartData;

        console.log('this.chartConfig.data >>')
        console.log(this.chartConfig.data);

        // this.chartConfig.data.map(function (d) {
        //   if (d['Date']) {
        //     return d['Date'] = d['Date'].split('-')[2];
        //   }
        // });
      }
    }
  }

  populateDataTable(response, initialLoad) {
    const responseData = response;
    this.dataObject = {};
    this.gridData = {};
    this.gridData['result'] = [];
    this.gridData.columnsToAppend$ = [
      'Line Item Budget',
      'Line Item Monthly Media Spend',
      'Line Item Media Spend',
      'Line Item Budget Remaining',
      'Line Item Monthly Budget',
      'Line Item Daily Budget',
      'Line Item Daily Spend',
      'Line Item Monthly Cumulative Spend',
      'Line Item Monthly Budget Remaining',
      'Line Item Daily Budget Remaining',
      'Average Line Item Monthly Budget',
      'Media Cost',
      'Technology Cost',
      'Average Line Item Daily Budget'
    ]
    const headers = [];

    if(responseData.gridData && responseData.gridData.length) {

      console.log('responseData.gridData[0] >>')
      console.log(responseData.gridData[0]);

      const keys = Object.keys(responseData.gridData[0]);
      for (let i = 0; i < keys.length; i++) {
          let header = {
            key: keys[i],
            title: keys[i],
            mData: keys[i],
            data: keys[i],
            isFilterRequired: true,
            isCheckbox: false,
            class: 'nocolvis',
            editButton: false,
            width: '150'
          }
          headers.push(header);
      }

      this.gridData['headers'] = headers;
      this.gridData['options'] = this.options[0];
      this.dashboard = 'schemaGrid';
      let result = [];
      for (let i = 0; i < responseData.gridData.length; i++) {
        result.push(responseData.gridData[i]);
      }
      this.gridData['result'] = result;
      this.dataObject.gridData = this.gridData;
      console.log('this.gridData <<<<<');
      console.log(this.gridData);
      this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    }
   // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  getFilter(dashboardType): any {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});
    return this.http.get(this.api_fs.api + '/api/reports/org/Home%20Depot/template/dashboard', options).toPromise()
      .then(data => data.json())
      .catch();
  }

  search() {

    var dateField = this.dashboardConfig.filterProps.find(x=> x.f7Name === 'period').values[0].id;
    var startDate = dateField + 'T00:00:00Z';
    var endDate = '';
    var endDateOftheMonth = 0;
    if (dateField.split('-')[1] == 12) {
      console.log('endDate >>')
      console.log(new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate());
      endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
      endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    } else {
      endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
      endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    }

    const dataObj: any = {};
    dataObj.clientCode = 'homd';
    dataObj.dashboard = this.dashboardType;

    if(dataObj.dashboard === 'pacing') {
      // dataObj.dimensions = [''];
      // dataObj.metrics = ['fs_total_cost'];
    } else if (dataObj.dashboard === 'spend') {
      // dataObj.isMultiCampaign = false;
    }
    var filters = [];
    this.dashboardConfig.filterProps.forEach(function (filter) {
      if(filter.f7Name !== 'type' && filter.f7Name !== 'period') {
        var newFilter: any = {};
        newFilter.f7Name = filter.f7Name;
        newFilter.values = [];
        if (Object.prototype.toString.call(filter.values) === '[object Array]') {
          if(filter.values.length) {
            var ret = filter.values.map(function (val) {
              return val.id;
            });
            newFilter.values = ret;
          }
        } else if (filter.values) {
          newFilter.values.push(filter.values);
        }
        filters.push(newFilter);
      }
    }, this);
    dataObj.filter = filters;
   // dataObj.partnerType = ['prov'];
    dataObj.period = {
      f7Name: 'date',
      values: {
        startDate: startDate,
        endDate: endDate
      }
    };
    dataObj.type = this.dashboardConfig.filterProps.find(x=> x.f7Name === 'type').values.toLowerCase();

    console.log('dataObj >>>>>')
    console.log(JSON.stringify(dataObj));

    this.getSearchDataRequest(dataObj);

  }

  getSearchDataRequest(dataObj) {
    this.showSpinner = true;
    this.getSearchData(dataObj).subscribe(
        response => {
          if(response) {

            console.log('chart response >>')
            console.log(response);

            this.populateDataTable(response, false);
            this.populateChart(response);

            this.showSpinner = false;
          }
        },
        err => {

          if(err.status === 401) {
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.showSpinner = false;
                    this.getSearchDataRequest(dataObj);
                  })
                  .catch(function (err) {
                    console.log('error >>')
                    console.log(err);
                  });
            } else {
              this.widget.signOut(() => {
                this.widget.tokenManager.remove('accessToken');
                window.location.href = '/login';
              });
            }
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  getSearchData(dataObj) {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);

    console.log('data to post >>')
    console.log(data);

    var url;
    if(dataObj.dashboard === 'pacing') {
      url = this.api_fs.api + '/api/reports/pacing';
    } else if(dataObj.dashboard === 'spend') {
      url = this.api_fs.api + '/api/reports/spend';
    }
    return this.http
      .post(url, data, options)
      .map(res => {
        return res.json();
      }).share();
  }

  isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  getSelectedValues(obj) {
    var ret = obj.map(function (value) {
      return value.label;
    });
    return ret.join('<br/>');
  }
}
