/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import * as chartConfig from './chartConfig.json';
import {Http, Headers, RequestOptions} from '@angular/http';
import {PopupDataAction} from '../../shared/components/app-popup-button/popup-data-action';
import { OktaAuthService } from '../../../services/okta.service';
import Swal from 'sweetalert2';
import {moment} from 'ngx-bootstrap/chronos/test/chain';
import {ToasterService} from 'angular2-toaster';
import DataTableUtilsPluginExt from '../../../scripts/data-table/data-table-utils-plugin-ext';

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
      values : 'Daily',
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

    // NOTE: FixedColumn's Structure Changed
    // fixedColumn: 1
    isFixedColumn: {
      fixedColumns: {
        leftColumns: 1,
      },
      fixedColumnFunc: (ev, $, table ) => {
        // Util.DataTable.Func
        DataTableUtilsPluginExt.fixedColumnFunc(ev, $, table);
      },
    },

  }];
  dashboard: any;
  widget: any;
  orgArr = [];
  selectedOrg: any;
  orgValue = '';
  orgInfo: any;
  isRoot: boolean;
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
  @ViewChild('chart') chartRef;
  @ViewChild('table') tableRef;
  dateOptions = {
    format: "MMM YYYY",
    showClear: false
  };
  period: any= {};
  private toasterService: ToasterService;
  isReportTemp = true;
  constructor(
      private okta: OktaAuthService,
      private route: ActivatedRoute, private router: Router, private http: Http,
      toasterService: ToasterService) {
    this.showSpinner = false;
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
    if(this.isRoot){
    this.selectedOrg = [{id: custInfo.org.org_id, itemName: custInfo.org.org_name}];
    }else{
      this.selectedOrg = [{}];
    }
    this.toasterService = toasterService;
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

    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});

    console.log('applyFilter >>>')
    console.log(applyFilter);

    var dateField;
    const objDate = this.dashboardConfig.filterProps.find(x=> x.f7Name === 'period').values;
    if(objDate && objDate.length) {
      dateField = objDate[0].id;
    } else {
      dateField = this.formatDate(new Date());
    }

    var startDate = dateField + 'T00:00:00Z';
    var endDate = '';
    var endDateOftheMonth = 0;
    if (dateField.split('-')[1] == 12) {
      endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
      endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    } else {
      endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
      endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    }

    const dataObj = {
      filter: applyFilter,
      entity: filterConfig.f7Name,
      page: 1,
      limit: 10,
      period: {
        f7Name: 'date',
        values: {
          startDate: startDate,
          endDate: endDate
        }
      }
    };

    var obj = JSON.stringify(dataObj);

    console.log('filter dataObj >>')
    console.log(obj);
    let org = this.orgValue;
    return this.http
        .post(this.api_fs.api + '/api/reports/org/homd/filters'+( org ? ('?org_id=' + org) : ''), obj, options )
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

    // if (applyFilter.length) {
    //
    //   var dateField;
    //   const objDate = this.dashboardConfig.filterProps.find(x=> x.f7Name === 'period').values;
    //   if(objDate && objDate.length) {
    //     dateField = objDate[0].id;
    //   } else {
    //     dateField = this.formatDate(new Date());
    //   }
    //
    //   var startDate = dateField + 'T00:00:00Z';
    //   var endDate = '';
    //   var endDateOftheMonth = 0;
    //   if (dateField.split('-')[1] == 12) {
    //     endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
    //     endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    //   } else {
    //     endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
    //     endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    //   }
    //
    //   const dataObj = {
    //     filter: applyFilter,
    //     entity: filterConfig.f7Name,
    //     page: 1,
    //     limit: 10,
    //     period: {
    //       f7Name: 'date',
    //       values: {
    //         startDate: startDate,
    //         endDate: endDate
    //       }
    //     }
    //   };
    //
    //   var obj = JSON.stringify(dataObj);
    //
    //   console.log('filter dataObj >>')
    //   console.log(obj);
    //
    //   return this.http
    //     .post(this.api_fs.api + '/api/reports/org/homd/filters', obj, options )
    //     .map(res => {
    //       const result = res.json();
    //       const ret = [];
    //       if (result.length) {
    //         result.forEach(function (item) {
    //           ret.push({id: item, label: item});
    //         });
    //       }
    //       return ret;
    //     });
    // } else {
    //
    //   // const obj1 = {
    //   //   "dashboard": "pacing",
    //   //   "type": "daily",
    //   //   "clientCode": "homd",
    //   //   "period": {
    //   //     "f7Name": "date",
    //   //     "values": {
    //   //       "startDate": "2019-02-01T00:00:00Z",
    //   //       "endDate": "2019-02-28T23:59:59Z"
    //   //     }
    //   //   }
    //   // };
    //   //
    //   // const obj2 = JSON.stringify(obj1);
    //   //
    //   // return this.http
    //   //     .post(this.api_fs.api + '/api/reports/org/homd/seed-dashboard', obj2, options )
    //   //     .map(res => {
    //   //       const result = res.json();
    //   //       const ret = [];
    //   //       if (result.length) {
    //   //         result.forEach(function (item) {
    //   //           ret.push({id: item, label: item});
    //   //         });
    //   //       }
    //   //       return ret;
    //   //     });
    //
    //   return this.http
    //       .get(this.api_fs.api + '/api/reports/org/homd/seed-filters')
    //       .map(res => {
    //         if (res['_body']) {
    //           const result = JSON.parse(res['_body']);
    //           const data = result[filterConfig.f7Name];
    //           const ret = [];
    //           if (data && data.length) {
    //             data.forEach(function (item) {
    //               ret.push({id: item, label: item});
    //             });
    //           }
    //           return ret;
    //         }
    //       });
    //
    // }
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
    const corrFilter = this.dashboardConfig.filterProps.find( x=> x.type === filter.type);
    if (corrFilter) {
      corrFilter.values = Obj.value;
      this.selectedView = Obj.value;
    }
    this.search();
  }

  OnPeriodChange(e, filter) {
    if (e && e._d) {
      this.period.display = moment(e._d).format('MMM YYYY');
      this.period.value = moment(e._d).format('YYYY-MM-01');
    }

    this.dashboardConfig.filterProps.map(function (x) {
      if (x.f7Name === 'period' && x.values && x.values.length) {
        x.values[0].id = this.period.value;
        x.values[0].itemName = this.period.display;
      }
    }, this);
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
    if(this.isRoot){
     this.searchOrgRequest();
    }
    if(this.selectedOrg[0].id){
      this.orgValue = this.selectedOrg[0].id;
    }
    if (this.dashboardType === 'pacing' || this.dashboardType === 'spend') {
      this
          .getFilter(this.dashboardType)
          .then(
              response => {
                if (response && response.data && response.data.views) {
                  this.isReportTemp = true;
                  this.getSeedData()
                      .then(
                          response1 => {
                            this.populateFilters(response.data, response1);
                            //this.search();
                          });

                  this.getSeedDashboard()
                      .then(
                          response2 => {
                            response2 = response2.json();
                            this.showSpinner = false;
                            this.populateChart(response2);
                            this.populateDataTable(response2);
                          }, error => {
                            if(error.status === 401) {
                              let self = this;
                              this.widget.refreshElseSignout(
                                  this,
                                  error,
                                  // self.searchDataRequest.bind(self),
                                  self.ngOnInit.bind(self)
                              );

                            } else {
                              this.showSpinner = false;
                            }

                          });
                } else {
                  //this.toasterService.pop('success', 'No Report Template Definition Available', 'There is no report template definition available for the selected org');
                  this.isReportTemp = false;
                  this.showSpinner = false;
                 /* Swal({
                    title: 'No Template Definition Available',
                    text: 'There is no template definition available for the selected org',
                    type: 'error'
                  }).then( () => {
                    // this.router.navigate(['/app/admin/invoices']);
                  }); */
                }
              },
              error => {

                if(error.status === 401) {
                  this.showSpinner = false;
                  let self = this;
                  this.widget.refreshElseSignout(
                      this,
                      error,
                      self.ngOnInit.bind(self)
                  );
                } else {
                  this.showSpinner = false;
                }
              });

      const defaultObj: any = {};
      defaultObj.gridData = [];
      defaultObj.chartData = [];
      this.populateChart(defaultObj);
      this.populateDataTable(defaultObj);
    }
  }

  getSeedData() {

    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    let org=this.orgValue;
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});

    return this.http
        .get(this.api_fs.api + '/api/reports/org/homd/seed-filters'+( org ? ('?org_id=' + org) : ''), options).toPromise()
        .then(data => data.json())
        .catch();
  }

  getSeedDashboard() {
    console.log("gSD")

    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});

    const obj = {
      dashboard: this.dashboardType,
      type: 'daily',
      clientCode: 'homd'
    };

    this.showSpinner = false;
    let org=this.orgValue;
    const dataObj = JSON.stringify(obj);
    return this.http.post(
        this.api_fs.api + '/api/reports/org/homd/seed-dashboard/v1'+( org ? ('?org_id=' + org) : ''),
        dataObj,
        options
    ).toPromise()
    // .then(
    //   data => data.json(),
    //   rej => {
    //     console.log("inside gSD: ", rej)
    //     this.showSpinner = false;
    //   }
    // )
    // .catch( rej => {
    //   console.log("CATCH REj", rej)
    // });
  }

  populateFilters(filterResponse, seedResponse) {

    localStorage.setItem('dashboardConfig_' + this.dashboardType, JSON.stringify(filterResponse));
    var dashboardConfig = filterResponse;
    var selectedType = this.dashboardConfig.filterProps.filter(function (filter) {
      return filter.f7Name === 'type';
    });

    if (selectedType.length) {

      // console.log('dashboardConfig >>')
      // console.log(dashboardConfig);
      //
      // console.log('selectedType >>')
      // console.log(selectedType);

      var getSelectedTypeConfig = dashboardConfig.views.find(x => x.name === selectedType[0].values);

      // console.log('getSelectedTypeConfig >>')
      // console.log(getSelectedTypeConfig);

      this.selectedView = getSelectedTypeConfig.name;
      if (getSelectedTypeConfig) {

        // console.log('getSelectedTypeConfig.filters.source >>>')
        // console.log(getSelectedTypeConfig.filters.source);

        getSelectedTypeConfig.filters.source.forEach(function (filter, index) {
          if (filter.f7_name != 'month') {
            var newFilter: any = {};
            newFilter.f7Name = filter.f7_name;
            newFilter.label = filter.alias;
            newFilter.values = [];
            newFilter.displayDefault = null; // filter.displayDefault;

            if (!newFilter.displayDefault) {
              if (seedResponse[newFilter.f7Name] && seedResponse[newFilter.f7Name].length) {
                if (seedResponse[newFilter.f7Name] !== 'period') {
                  newFilter.values = [{
                    id: seedResponse[newFilter.f7Name][0],
                    label: seedResponse[newFilter.f7Name][0]
                  }];
                }
              }
            }
            //  newFilter.values = filter.default_value ? [filter.default_value] : [];

            newFilter.isMultiSelect = filter.hasAllOption || false;
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

      const periodFilter = this.dashboardConfig.filterProps.find( x=> x.f7Name === 'period');
      if (periodFilter && seedResponse['period'] && seedResponse['period'].values && seedResponse['period'].values.startDate) {

        periodFilter.values = [{
          id: seedResponse['period'].values.startDate,
          itemName: this.getMonthName(seedResponse['period'].values.startDate.split('-')[1].replace('0','')) + ' ' + seedResponse['period'].values.startDate.split('-')[0]
        }];

        console.log('periodFilter.values[0].id >>>')
        console.log(periodFilter.values[0].id);

        this.period.display = moment(periodFilter.values[0].id).format('MMM YYYY');
        this.period.value =  moment(periodFilter.values[0].id).format('MMM YYYY');
      }
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

  setChartConfig(response, dataPoints: Array<Number> = []) {
    const num = this.dashboardType == 'spend' ? 4 : 3;
    const dataPointsLength = dataPoints.length || 1;
    this.chartConfig.barWidth = 3000 / (response.chartData.data.length * dataPointsLength * num ) ;
  }

  populateChart(response) {

    console.log('chart response >>>')
    console.log(response.chartData);

    this.chartConfig = JSON.parse(JSON.stringify(chartConfig));
    if (response.chartData && response.chartData.data && response.chartData.data.length) {

      console.log('response.chartData >>><<')
      console.log(response.chartData);


      if(this.dashboardType === 'pacing') {

        this.chartConfig.title = '';
        this.chartConfig.YAxis.data = [];
        this.chartConfig.isStacked = true;

        if (this.selectedView === 'Monthly') {
          response.chartData.data.forEach(function (x) {
            x['date'] = this.getMonthName(x['Month']) + ' ' + x['Year'];
          }, this);

          this.chartConfig.XAxis.dataPropertyName = 'date';
          this.chartConfig.XAxis.labelName = '';
          this.chartConfig.YAxis.data.push({
            labelName: '',
            unitType: ''
          });

        } else {

          this.chartConfig.XAxis.labelName = '';
          this.chartConfig.XAxis.dataPropertyName = 'Date';
          this.chartConfig.YAxis.data.push({
            labelName: '',
            unitType: '',
            // tickIntervalType: 'logarithmic'
          });
        }

        // Chart Labels configured dynamically
        const dataPoints = [];
        response.chartData.meta.forEach(function (meta) {
          dataPoints.push({
            propertyName: meta.label,
            type: meta.chart_type,
            color: meta.color
          });
        });
        this.chartConfig.dataPoints = dataPoints;

        this.chartConfig.data = response.chartData.data;

        // Set Dynamic Chart configs here
        this.setChartConfig(response, dataPoints);

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

          response.chartData.data.forEach(function (x) {
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

          // this.chartConfig.dataPoints = [
          //   {
          //     propertyName: 'Media Cost',
          //     type: 'column',
          //     color: 'rgb(85, 182, 188)',
          //     YaxisAssociation : ''
          //   },
          //   {
          //     propertyName: 'Kenshoo Fee',
          //     type: 'column',
          //     color: 'rgb(58, 116, 179)',
          //     YaxisAssociation : ''
          //   },
          //   {
          //     propertyName: 'THD Fee',
          //     type: 'column',
          //     color: 'rgb(151, 160, 169)',
          //     YaxisAssociation : ''
          //   },
          //   {
          //     propertyName: 'Merchant Processing Fee',
          //     type: 'column',
          //     color: 'rgb(253, 193, 138)',
          //     YaxisAssociation : ''
          //   },
          //   {
          //     propertyName: 'Total Platform Cost',
          //     type: 'column',
          //     color: 'rgb(223, 142, 145)',
          //     YaxisAssociation : ''
          //   },
          //   {
          //     propertyName: 'Line Item Total Budget',
          //     type: 'line',
          //     color: 'rgb(253, 8, 0)',
          //     YaxisAssociation : ''
          //   }
          // ];

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

          // this.chartConfig.dataPoints = [
          //   {
          //     propertyName: 'Media Cost',
          //     type: 'column',
          //     color: 'rgb(80, 130, 186)'
          //   },
          //   {
          //     propertyName: 'Kenshoo Fee',
          //     type: 'column',
          //     color: 'rgb(56, 199, 224)'
          //   },
          //   {
          //     propertyName: 'THD Fee',
          //     type: 'column',
          //     color: 'rgb(85, 182, 188)',
          //     YaxisAssociation : ''
          //   },
          //   {
          //     propertyName: 'Merchant Processing Fee',
          //     type: 'column',
          //     color: 'rgb(253, 193, 138)',
          //     YaxisAssociation : ''
          //   },
          //   {
          //     propertyName: 'Total Platform Cost',
          //     type: 'column',
          //     color: 'rgb(223, 142, 145)',
          //     YaxisAssociation : ''
          //   },
          //   {
          //     propertyName: 'Line Item Daily Budget',
          //     type: 'line',
          //     color: 'rgb(253, 8, 0)'
          //   }
          // ];
        }

        // Chart Labels configured dynamically
        const dataPoints = [];
        response.chartData.meta.forEach(function (meta) {
          dataPoints.push({
            propertyName: meta.label,
            type: meta.chart_type,
            color: meta.color
          });
        });
        this.chartConfig.dataPoints = dataPoints;

        this.chartConfig.data = response.chartData.data;

        // Set Dynamic Chart configs here
        this.setChartConfig(response, dataPoints);

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

  populateDataTable(response) {
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
      'Average Line Item Daily Budget',
      'Client Fee',
      'Merchant Processing Fee',
      'Platform Fee'
    ]
    const headers = [];

    if(responseData.gridData && responseData.gridData.length) {

      console.log('responseData.gridData[0] >>')
      console.log(responseData.gridData[0]);

      const keys = Object.keys(responseData.gridData[0]);
      for (let i = 0; i < keys.length; i++) {
        headers.push({
          key: keys[i],
          title: keys[i],
          mData: keys[i],
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: false,
          width: '150'
        });
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


      this.dataObject.isDataAvailable = true; // this.gridData.result && this.gridData.result.length ? true : false;
    }
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  getFilter(dashboardType): any {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    let org=this.orgValue;

    console.log('token >>>>')
    console.log(token);

    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});
    return this.http.get(this.api_fs.api + '/api/reports/org/Home%20Depot/template/dashboard?templatename=' + dashboardType+( org ? ('&org_id=' + org) : ''), options).toPromise()
        .then(data => data.json())
        .catch();
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, '01'].join('-');
  }

  search() {

    var dateField;
    const obj = this.dashboardConfig.filterProps.find(x=> x.f7Name === 'period').values;
    if(obj && obj.length) {
      dateField = obj[0].id;
    } else {
      dateField = this.formatDate(new Date());
    }
    // dateField = '2019-04-01';

    const startDate = dateField + 'T00:00:00Z';
    let endDate = '';
    let endDateOftheMonth = 0;
    if (dateField.split('-')[1] == 12) {
      endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
      endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    } else {
      endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
      endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    }

    const dataObj: any = {};
    dataObj.clientCode = 'homd';
    dataObj.dashboard = this.dashboardType;
    const filters = [];
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
    dataObj.period = {
      f7Name: 'date',
      values: {
        startDate: startDate,
        endDate: endDate
      }
    };
    dataObj.type = this.dashboardConfig.filterProps.find(x=> x.f7Name === 'type').values.toLowerCase();

    console.log('dataObj @@@@@>>>>>')
    console.log(JSON.stringify(dataObj));
    this.getSearchDataRequest(dataObj);

  }

  handleRowSelection(rowObj: any, rowData: any) {

  }

  refreshToken() {
    // Refresh token api
    return this.http.get("/users/token").toPromise()
    //  map( (res) => {
    //   return res.json();
    // })
  }

  getSearchDataRequest(dataObj) {
    let self = this;
    this.showSpinner = true;
    this.getSearchData(dataObj).subscribe(
        response => {
          if(response) {

            console.log('chart response >>')
            console.log(response);

            // FIX : Duplicate headers creation during dataSource changes ( being called by scrollX on the datatable )
            this.dataObject.isDataAvailable = false;
            const __this = this;
            setTimeout(function () {
              __this.populateDataTable(response);
            }, 0);

            this.populateChart(response);
            this.showSpinner = false;
          }
        },
        err => {
          if(err.status === 401) {

            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.getSearchDataRequest.bind(self, dataObj)
            );

          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  getSearchData(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);

    console.log('data to post >>')
    console.log(data);
    let org=this.orgValue;
    var url;
    if(dataObj.dashboard === 'pacing') {
      url = this.api_fs.api + '/api/reports/pacing/v1'+( org ? ('?org_id=' + org) : '');
    } else if(dataObj.dashboard === 'spend') {
      url = this.api_fs.api + '/api/reports/spend/v1'+( org ? ('?org_id=' + org) : '');
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

  exportAll(){
    // console.log(this.chartRef);
    this.chartRef.exportPNG();
    // console.log(this.tableRef);
    this.tableRef.exportTable();
  }
  searchOrgRequest() {
    return this.searchOrgData().subscribe(
        response => {
          if (response && response.data) {
            response.data.forEach(function (ele) {
              this.orgArr.push({
                id: ele.org_uuid,
                itemName: ele.org_name
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

  handleSelect(selectedItem, type) {
   if(selectedItem.id){
    console.log("Org",selectedItem);
    this.selectedOrg = [selectedItem];
    this.ngOnInit();
   }
 }

 handleDeSelect(selectedItem, type) {
  this.selectedOrg = [{}];
  this.orgValue="";
  this.ngOnInit();
 }
}
