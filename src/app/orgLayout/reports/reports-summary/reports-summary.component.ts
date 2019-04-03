import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../../models/dataTableOptions';
import * as gridData from './gridData.json';
import {AuthService, ReportsService} from '../../../../services';
import {DataTableAction } from '../../../shared/components/app-data-table/data-table-action';
import {DataTableActionType } from '../../../shared/components/app-data-table/data-table-action-type';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import {ToastsManager} from 'ng2-toastr';
import {TheReportsService} from '../reportsLocal.service';
import { OktaAuthService } from '../../../../services/okta.service';
import {Http, Headers, RequestOptions} from '@angular/http';

@Component({
  selector: 'app-reports',
  templateUrl: './reports-summary.component.html',
  styleUrls: ['./reports-summary.component.scss']
})
export class ReportsSummaryComponent implements OnInit, DataTableAction  {

  clientCode: string;
  clientName: string;
  context: any;
  localData: any;
  headers: any = [];
  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: Array<DataTableOptions> = [{
    isSearchColumn: true,
    isOrdering: true,
    isTableInfo: false,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isRowSelection: true,
    isShowEntries: false,
    isPageLength: 10,
    isPagination: true,
    isEmptyTable: 'No Data',
    isSorting: false,
  }];
  dashboard: any;
  serverSide: any;
  serviceURI: any;
  serviceMethod: any;
  widget: any;
  api_fs: any;

  constructor(private route: ActivatedRoute, private router: Router,
              public reportsService: TheReportsService, public datePipe: DatePipe,
              public toastr: ToastsManager, private authService: AuthService, private okta: OktaAuthService, private http: Http) {
  }

  ngOnInit() {
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.localData = this.authService.getIdentityInfo('org-context');
    const org = JSON.parse(this.localData);
    this.clientCode = 'BTIL';
    this.context = {
      client : {
        code: 'BTIL'
      }
    };

    this.height = '50vh';
    this.populateReportDataTable();
  }

  populateReportDataTable() {
    this.gridData = {};
    this.gridData['result'] = [];
    // const keys = Object.keys(spendData.gridData[0]);
    this.headers = [
      {
        key: '',
        title: '',
        data: 'noDataFeed',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '80',
        toggle: true,
        searchcolumn: true
      },
      {
        key: 'Report Name',
        title: 'REPORT NAME',
        data: 'name',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Report Frequency',
        title: 'REPORT FREQUENCY',
        data: 'frequency',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Period',
        title: 'PERIOD',
        data: 'period',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Author',
        title: 'AUTHOR',
        data: 'createdBy',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'LastRunTime',
        title: 'LAST RUN TIME',
        data: 'lastruntime',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      },
      {
        key: 'Status',
        title: 'STATUS',
        data: 'status',
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '75'
      },
      {
        key: 'Action',
        title: 'ACTION',
        data: 'noDataFeed',
        isFilterRequired: false,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '250',
        actionButton: [
          {
            actionName : 'Edit',
            actionType : DataTableActionType.EDIT,
            actionUrl : 'reportid',
            actionIcon : 'fa-pencil',
            actionFunc: 'handleEdit'
          },
          {
            actionName : 'Play',
            actionType : DataTableActionType.RUN,
            actionUrl : 'reportid',
            actionIcon : 'fa-play',
            actionFunc: 'handleRun'
          },
          {
            actionName : 'Download',
            actionType : DataTableActionType.DOWNLOAD,
            actionUrl : 'reportid',
            actionIcon : 'fa-download',
            actionFunc: 'handleDownload'
          }
        ]
      }
    ];
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.dashboard = 'schemaGrid';
    const __this = this;
    const result = [];
    return this.getReportData().subscribe(
        response => {
          if (response && response.body) {
            console.log('response report data>>>')
            console.log(JSON.stringify(response));
            _.forEach(response.body, (v, i) => {
              const startDate = __this.datePipe.transform(v.report_duration_begin, 'MMM-dd-yyyy');
              const endDate = __this.datePipe.transform(v.report_duration_end, 'MMM-dd-yyyy');
              const period = startDate + ' - ' + endDate;
              v['period'] = period;
              v['name'] = v.report_name;
              v['frequency'] = v.report_frequency;
              v['createdBy'] = v.adhoc_reports_histories && v.adhoc_reports_histories.length ? v.adhoc_reports_histories[0].created_by : '';
              v['lastruntime'] = v.adhoc_reports_histories && v.adhoc_reports_histories.length ? __this.datePipe.transform(v.adhoc_reports_histories[0].report_run_start_time, 'yyyy-dd-M h:mm:ss a') : '';
              v['status'] = v.adhoc_reports_histories && v.adhoc_reports_histories.length ? v.adhoc_reports_histories[0].report_run_status : '';
              const gridResult = {};
              _.forEach(this.headers, (vv, ii) => {
                gridResult[vv['data']] = v[vv['data']];
              });
              gridResult['id'] = v.adhoc_reports_histories && v.adhoc_reports_histories.length ? v.adhoc_reports_histories[0].report_id : '';
              gridResult['downloadId'] = v.adhoc_reports_histories && v.adhoc_reports_histories.length ? v.adhoc_reports_histories[0].id : ''; // _.size(v.reportResult) > 0 ? v.reportResult[0]['_id'] : '';
              gridResult['downloadurl'] = v.adhoc_reports_histories && v.adhoc_reports_histories.length ? v.adhoc_reports_histories[0].report_run_file_location : ''; // _.size(v.reportResult) > 0 ? v.reportResult[0]['signedUrl'] : '';
              gridResult['toggleOptions'] = v['id']; // _.size(v.reportResult) > 0 ? v.reportResult : [];
              gridResult['alertEnabled'] = v.is_alert_dependent !== 0; // _.size(v.report.alert) > 0;
              v.adhoc_reports_histories.forEach(function (ele) {
                ele.name = v.report_name;
                ele.frequency = v.report_frequency;
              });
              gridResult['heirarchyData'] = v.adhoc_reports_histories;
              result.push(gridResult);
            });

            // result = result.reverse();
            __this.gridData['result'] = result;
            __this.options[0].isPageLength =  10;
            __this.dataObject.gridData = __this.gridData;
            __this.dataObject.isDataAvailable = __this.gridData.result && __this.gridData.result.length ? true : false;

          }
        },
        err => {
          if(err.status === 401) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  this.widget.tokenManager.add('accessToken', newToken);
                  this.populateReportDataTable();
                  // this.showSpinner = false;
                  // this.searchDataRequest();
                });
          } else {
            // this.showSpinner = false;
            console.log('err')
            console.log(err);
          }
        }
    );
  }

  getReportData() {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }

    console.log('token >>')
    console.log(token);
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/reports/adhoc/summary';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  handleEdit(rowObj: any, rowData: any) {
    console.log('rowData >>>')
    console.log(rowData);
    this.router.navigate(['/app/reports/adHocReportBuilder', rowData.id]);
  }

  handleRun(rowObj: any, rowData: any) {
    console.log(rowData);
    const reportId = rowData.id;
    this.runReport(reportId).subscribe(response => {
      console.log(response);
      this.dataObject.isDataAvailable = false;
      this.populateReportDataTable();
    }, error => {
     // const message = JSON.parse(error._body).message;
     // this.toastr.error('ERROR!', message);
    });
  }

  runReport(reportId) {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = { "adhoc_report_id" : reportId};

    var url = this.api_fs.api + '/api/reports/adhoc/reexecute';
    return this.http
        .post(url, data, options);
  }

  handleDownload(rowObj: any, rowData: any) {
    const reportId = rowData.downloadId;
    const reportName = rowData.name;
    const lastruntime = rowData.lastruntime;
    const type = 'download';
    // this.reportsService.reportDownload(this.context, reportId, type).subscribe(response => {
    //   if (response.ok && response._body){
    //     // console.log(response._body);
    //     const fileName = reportName + '_' + lastruntime.replace(/-|\s|:|PM|AM/g,'');
    //     const data = new Array();
    //     const JsonData = response._body;
    //     const respSplit = JsonData.split('\n');
    //     // const headerSplit = respSplit[0].split(',');
    //     // let csvHeade = [];
    //         let csvContent = '';
    //         let dataString;
    //         respSplit.forEach((column, index) => {
    //           dataString = column ;
    //           csvContent += index < data.length ? dataString : dataString + '\n';
    //         });
    //         var blob = new Blob(["\ufeff", csvContent]);
    //         var url = URL.createObjectURL(blob);
    //         // var url = "https://f7-dev.s3.amazonaws.com/btil/reports/Test_Monthly_001_20190203010006_T1549184407006.csv?AWSAccessKeyId=AKIAJXQRDTGXZ3GXA62Q&Expires=1549948373&Signature=W5xIn4v9EOcjEX%2B%2Bg7MIys%2FsQj0%3D"
    //         const encodedUri = encodeURI(csvContent);
    //         const link = document.createElement('a');
    //         link.setAttribute('href', url);
    //         link.setAttribute('download', fileName + '.csv');
    //         document.body.appendChild(link);
    //         link.click();
    //   }
    // }, error => {
    //   const message = JSON.parse(error._body).message;
    //   this.toastr.error('ERROR!', message);
    // });
  }

  handleEmail(rowObj: any, rowData: any) {
    console.log(rowData);
  }

  handleDelete(rowObj: any, rowData: any) {
    const reportId = rowObj;
    const type = 'delete';
    const __this = this;
    this.reportsService.reportDelete(this.context, reportId, type).subscribe(response => {
      __this.dataObject.isDataAvailable = false;
      this.populateReportDataTable();
    }, error => {
      const message = JSON.parse(error._body).message;
      this.toastr.error('ERROR!', message);
    });
  }
}
