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
          'f7Name' : 'type',
          'label' : 'View',
          'values' : 'Monthly',
          'isMultiSelect' : false,
          'dependentOn' : [],
          'type' : 'toggle',
          'toggleOptions' : ['Monthly','Daily']
        },
        {
          'f7Name' : 'period',
          'label' : 'Period',
          'values' : [],
          'isMultiSelect' : false,
          'dependentOn' : [],
          'type' : 'dropdown'
        }
  ];

  headers: any = [];
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
    isEmptyTable: 'No Data',
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

    console.log('applyFilter >>>>')
    console.log(applyFilter);

    const client = localStorage.getItem('client') || '';

    if (applyFilter.length) {

      const token = localStorage.getItem('jwt');
      const headers = new Headers({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token});
      const options = new RequestOptions({headers: headers});

      const dataObj = {
        filters: applyFilter,
        entity: filterConfig.f7Name,
        page: 1,
        limit: 10
      };

      console.log('dataObj >>>>>>')
      console.log(JSON.stringify(dataObj));

      return this.http
        .post('https://dev-api.fusionseven.net/api/v1/reportTransactions/getFilters', dataObj, options )
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
        .get('https://dev-api.fusionseven.net/api/v1/reportTransactions/getSeedFilters')
        .map(res => {
          if (res['_body']) {
            const result = JSON.parse(res['_body']);
            const data = result[filterConfig.f7Name];
            const ret = [];

            console.log('result >>')
            console.log(result);

            console.log('filterConfig.f7Name >>')
            console.log(filterConfig);

            if (data.length) {
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

  setActive(filter, value) {

    this.dashboardConfig = {};
    this.dashboardConfig.filterProps = JSON.parse(JSON.stringify(this.defaultFilters));

    const corrFilter = this.dashboardConfig.filterProps.find( x=> x.type === filter.type);
    if (corrFilter) {
      corrFilter.values = value;
    }

    console.log('this.defaultFilters >>>')
    console.log(this.defaultFilters);

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
            console.log('response >>>')
            console.log(response);
            this.showSpinner = false;
            if (response.docs && response.docs.length) {
              this.populateFilters(response.docs[0]);
              this.search();
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
       var getSelectedTypeConfig = dashboardConfig.views.find(x => x.name === selectedType[0].values);
       this.selectedView = getSelectedTypeConfig.name;
       if (getSelectedTypeConfig) {
         getSelectedTypeConfig.filters.source.forEach(function (filter, index) {
           var newFilter: any = {};
           newFilter.f7Name = filter.f7_name;
           newFilter.label = filter.alias;
           newFilter.values = [];
         //  newFilter.values = filter.default_value ? [filter.default_value] : [];
           newFilter.isMultiSelect = filter.isMultiSelect;
           newFilter.dependentOn = filter.checkParent ? [filter.checkParent] : [];
           newFilter.includeCustom = false;
           newFilter.isMultipleCustomType = false;
           newFilter.isTag = false;
           newFilter.placeHolderText = '';
           newFilter.placeHolderValue = '';
           newFilter.apiRequestUrl = '';
           newFilter.apiRequestType = '';
           newFilter.type = 'popupButton';

           this.dashboardConfig.filterProps.push(newFilter);
         }, this);
       }

      console.log('this.dashboardConfig.filterProps >>>')
      console.log(this.dashboardConfig.filterProps);
    }
  }

  populateChart(response) {

    console.log('response >>>')
    console.log(response);

    this.chartConfig = JSON.parse(JSON.stringify(chartConfig));
    if (response.chartData.length) {

      if(this.dashboardType === 'pacing') {

        this.chartConfig.title = '';
        this.chartConfig.YAxis.data = [];

        if (this.selectedView === 'Monthly') {
          this.chartConfig.XAxis.dataPropertyName = 'Month';

          this.chartConfig.XAxis.labelName = '';

          this.chartConfig.YAxis.data.push({
            labelName: 'Monthly Spend',
            unitType: ''
          });
          this.chartConfig.dataPoints = [
            {
              propertyName: 'Campaign Cumulative Spend',
              type: 'column',
              color: 'rgb(80, 130, 186)'
            },
            {
              propertyName: 'Monthly Spend',
              type: 'column',
              color: 'rgb(56, 199, 224)'
            },
            {
              propertyName: 'Budget',
              type: 'line',
              color: 'rgb(253, 8, 0)'
            }
          ];
        } else {

          this.chartConfig.XAxis.labelName = 'November 2018';
          this.chartConfig.XAxis.dataPropertyName = 'Date';
          this.chartConfig.YAxis.data.push({
            labelName: 'Daily Spend',
            unitType: ''
          });
          this.chartConfig.dataPoints = [
            {
              propertyName: 'Monthly Cumulative Spend',
              type: 'column',
              color: 'rgb(80, 130, 186)'
            },
            {
              propertyName: 'Daily Spend',
              type: 'column',
              color: 'rgb(56, 199, 224)'
            },
            {
              propertyName: 'Monthly Budget',
              type: 'line',
              color: 'rgb(253, 8, 0)'
            }
          ];
        }

        this.chartConfig.data = response.chartData;

        this.chartConfig.data.map(function (d) {
          if (d['Date']) {
            return d['Date'] = d['Date'].split('-')[2];
          }
        });

      } else {

        this.chartConfig.title = '';
        this.chartConfig.YAxis.data = [];

        if (this.selectedView === 'Monthly') {

          this.chartConfig.XAxis.labelName = '';
          this.chartConfig.XAxis.dataPropertyName = 'Month';

          this.chartConfig.YAxis.data.push({
            labelName: 'Average Monthly Budget',
            unitType: '',
            // tickIntervalType: 'logarithmic'
          });
          this.chartConfig.YAxis.data.push({
            labelName: 'Ad Serving Cost:',
            unitType: ''
          });

          this.chartConfig.dataPoints = [
            {
              propertyName: 'Media Cost',
              type: 'column',
              color: 'rgb(85, 182, 188)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'Data Cost',
              type: 'column',
              color: 'rgb(58, 116, 179)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'Platform Cost',
              type: 'column',
              color: 'rgb(153, 204, 51)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'Ad Serving Cost',
              type: 'column',
              color: 'rgb(68, 77, 92)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'Contextual Cost',
              type: 'column',
              color: 'rgb(253, 193, 138)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'Privacy Compliance Cost',
              type: 'column',
              color: 'rgb(223, 142, 145)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'Other Cost',
              type: 'line',
              color: 'rgb(151, 160, 169)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'Average Daily Budget',
              type: 'line',
              color: 'rgb(253, 8, 0)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'Spend Delta',
              type: 'column',
              color: 'rgb(207, 190, 2)',
              YaxisAssociation : 'Average Monthly Budget'
            },
            {
              propertyName: 'CPM',
              type: 'line',
              color: 'rgb(207, 190, 2)',
              YaxisAssociation : 'Ad Serving Cost'
            },
            {
              propertyName: 'CPC',
              type: 'line',
              color: 'rgb(140, 198, 255)',
              YaxisAssociation : 'Ad Serving Cost'
            },
            {
              propertyName: 'CPA',
              type: 'line',
              color: 'rgb(230, 73, 201)',
              YaxisAssociation : 'Ad Serving Cost'
            },
            {
              propertyName: 'CPCV',
              type: 'line',
              color: 'rgb(85, 182, 188)',
              YaxisAssociation : 'Ad Serving Cost'
            },
            {
              propertyName: 'CPE',
              type: 'line',
              color: 'rgb(148, 83, 3)',
              YaxisAssociation : 'Ad Serving Cost'
            }
          ];

        } else {

          this.chartConfig.XAxis.labelName = 'November 2018';
          this.chartConfig.XAxis.dataPropertyName = 'Date';

          this.chartConfig.YAxis.data.push({
            labelName: 'Daily Budget',
            unitType: '',
            // tickIntervalType: 'logarithmic'
          });
          this.chartConfig.YAxis.data.push({
            labelName: 'Cost Per Pricing Model',
            unitType: ''
          });

          this.chartConfig.dataPoints = [
            {
              propertyName: 'Media Cost',
              type: 'column',
              color: 'rgb(85, 182, 188)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'Data Cost',
              type: 'column',
              color: 'rgb(58, 116, 179)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'Platform Cost',
              type: 'column',
              color: 'rgb(153, 204, 51)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'Ad Serving Cost',
              type: 'column',
              color: 'rgb(68, 77, 92)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'Contextual Cost',
              type: 'column',
              color: 'rgb(253, 193, 138)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'Privacy Compliance Cost',
              type: 'column',
              color: 'rgb(223, 142, 145)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'Other Cost',
              type: 'line',
              color: 'rgb(151, 160, 169)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'Average Daily Budget',
              type: 'line',
              color: 'rgb(253, 8, 0)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'Spend Delta',
              type: 'column',
              color: 'rgb(207, 190, 2)',
              YaxisAssociation : 'Daily Budget'
            },
            {
              propertyName: 'CPM',
              type: 'line',
              color: 'rgb(207, 190, 2)',
              YaxisAssociation : 'Cost Per Pricing Model'
            },
            {
              propertyName: 'CPC',
              type: 'line',
              color: 'rgb(140, 198, 255)',
              YaxisAssociation : 'Cost Per Pricing Model'
            },
            {
              propertyName: 'CPA',
              type: 'line',
              color: 'rgb(230, 73, 201)',
              YaxisAssociation : 'Cost Per Pricing Model'
            },
            {
              propertyName: 'CPCV',
              type: 'line',
              color: 'rgb(85, 182, 188)',
              YaxisAssociation : 'Cost Per Pricing Model'
            },
            {
              propertyName: 'CPE',
              type: 'line',
              color: 'rgb(148, 83, 3)',
              YaxisAssociation : 'Cost Per Pricing Model'
            }
          ];
        }

        this.chartConfig.data = response.chartData;
        this.chartConfig.data.map(function (d) {
          if (d['Date']) {
            return d['Date'] = d['Date'].split('-')[2];
          }
        });
      }
    }
  }

  populateDataTable(response, initialLoad) {
    const pacingData = response;
    this.gridData = {};
    this.gridData['result'] = [];

    console.log('pacingData.gridData[0] >>')
    console.log(pacingData.gridData[0]);

    if(pacingData.gridData.length) {
      const keys = Object.keys(pacingData.gridData[0]);
      for (let i = 0; i < keys.length; i++) {
        let header = {
          key: keys[i],
          title: keys[i],
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

    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.dashboard = 'schemaGrid';
    let result = [];
    for (let i = 0; i < pacingData.gridData.length; i++) {
      result.push(pacingData.gridData[i]);
    }
    this.gridData['result'] = result;
    this.dataObject.gridData = this.gridData;
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
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
    return this.http.get(this.api_fs.api + '/reports/dashboardtemplates?name=' + dashboardType, options).toPromise()
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
    dataObj.clientCode = 'btil';
    dataObj.dashboard = this.dashboardType;

    if(dataObj.dashboard === 'pacing') {
      dataObj.dimensions = [''];
      dataObj.metrics = ['fs_total_cost'];
    } else if (dataObj.dashboard === 'spend') {
      dataObj.isMultiCampaign = false;
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
    dataObj.partnerType = ['prov'];
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
    return this.getSearchData(dataObj).subscribe(
        response => {
          if(response) {
            this.populateDataTable(response, false);
            this.populateChart(response);
          }
        },
        err => {
          if(err.status === 401) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  this.widget.tokenManager.add('accessToken', newToken);
                  this.getSearchDataRequest(dataObj);
                });
          } else {
            console.log('err')
            console.log(err);
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


