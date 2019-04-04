import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../../models/dataTableOptions';
import * as chartConfig from './chartConfig.json';
import * as chartData from './chartData.json';
import * as gridData from './gridData.json';

@Component({
  selector: 'app-reports-alertNotification',
  templateUrl: './reports-alertNotification.component.html',
  styleUrls: ['./reports-alertNotification.component.scss']
})
export class AlertNoticationdashboardsComponent implements OnInit {

  chartConfig: any;
  dashboardConfig: any;
  dashboardType: any;

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
    isPageLength: 10,
    isPagination: true,
    isEmptyTable: 'No Data'
  }];
  dashboard: any;
  serverSide: any;
  serviceURI: any;
  serviceMethod: any;

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  getDependentConfig(dependsOn: any) {
    return this.dashboardConfig.filterProps.filter(function (x) {
      return dependsOn.indexOf(x.f7Name) !== -1;
    });
  }

  updateFilterConfig(data) {
    console.log('updated value ' + data.f7Name)
    console.log(data);
  }

  setActive(filter, value) {
    filter.values = value;
  }

  ngOnInit() {
    this.serverSide = false;
    this.serviceMethod = 'GET';
    this.serviceURI = './gridData.json'

    this.dashboardConfig = {};

    this.dashboardType = this.router.url.substr(this.router.url.lastIndexOf('/') + 1);
    this.chartConfig = chartConfig;
    this.height = '50vh';

    this.dashboardConfig = JSON.parse(JSON.stringify(chartData));
    this.populateSpendChart();
    this.populateAlertsDataTable();
  }

  populatePacingChart() {
    this.chartConfig.title = '';
    this.chartConfig.XAxis.dataPropertyName = 'Date';
    this.chartConfig.XAxis.labelName = 'November 2018';
    this.chartConfig.YAxis.data = [];
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

    this.chartConfig.data = this.dashboardConfig.data;
    this.chartConfig.data.map(function (d) {
      return d['Date'] = d['Date'].split('-')[2];
    });
    // return this.testService.getchartConfig().subscribe(
    //   response => {
    //       console.log('response >>')
    //       console.log(response);
    //   },err => {
    //     console.log('err >>')
    //     console.log(err);
    //   });
  }

  populateSpendChart() {
    this.chartConfig.title = '';
    this.chartConfig.XAxis.dataPropertyName = 'Date';
    this.chartConfig.XAxis.labelName = 'November 2018';
    this.chartConfig.YAxis.data = [];
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

    this.chartConfig.data = this.dashboardConfig.data;
    this.chartConfig.data.map(function (d) {
      return d['Date'] = d['Date'].split('-')[2];
    });
    // return this.testService.getchartConfig().subscribe(
    //   response => {
    //       console.log('response >>')
    //       console.log(response);
    //   },err => {
    //     console.log('err >>')
    //     console.log(err);
    //   });
  }

  populateAlertsDataTable() {
    const spendData = JSON.parse(JSON.stringify(gridData));
    this.gridData = {};
    this.gridData['result'] = [];
    const keys = Object.keys(spendData.gridData[0]);
    this.headers = [
      {
        key: 'Alert Name',
        title: 'ALERT NAME',
        data: 'Alert Name',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Alert Type',
        title: 'ALERT TYPE',
        data: 'Alert Type',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Metric',
        title: 'METRIC',
        data: 'Metric',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Threshold',
        title: 'THRESHOLD',
        data: 'Threshold',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Alert Creation Date',
        title: 'ALERT CREATION DATE',
        data: 'Alert Creation Date',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Status',
        title: 'STATUS',
        data: 'Status',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      }
    ]
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.dashboard = 'schemaGrid';
    let result = [];
    for (let i = 0; i < spendData.gridData.length; i++) {
      result.push(spendData.gridData[i]);
    }
    this.gridData['result'] = result;
    this.options[0].isPageLength =  10;
    this.dataObject.gridData = this.gridData;
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
  }

}
