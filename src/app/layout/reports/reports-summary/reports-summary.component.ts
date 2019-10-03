import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../../models/dataTableOptions';
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
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: true,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isDownload: true,
    isRowSelection: null,
    isPageLength: true,
    isPagination: true,
    isTree: true,
    inheritHeadersForTree: true,
    isPlayOption: true,
    isDownloadOption: true,
  }];
  dashboard: any;
  serverSide: any;
  serviceURI: any;
  serviceMethod: any;
  widget: any;
  api_fs: any;
  showSpinner: boolean;

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
    this.showSpinner = true;
    this.gridData = {};
    this.gridData['result'] = [];
    // const keys = Object.keys(spendData.gridData[0]);
    this.headers = [
      // {
      //   key: '',
      //   title: '',
      //   data: 'noDataFeed',
      //   isFilterRequired: true,
      //   isCheckbox: false,
      //   class: 'nocolvis',
      //   editButton: false,
      //   width: '80',
      //   toggle: true,
      //   searchcolumn: true
      // },
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
      }
    ];
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.dashboard = 'schemaGrid';
    const __this = this;
    const result = [];
    return this.getReportData().subscribe(
        response => {
          if (response && response.body && response.body.length) {
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

            console.log('dataObject >>@@')
            console.log(__this.dataObject);

            __this.dataObject.isDataAvailable = __this.gridData.result && __this.gridData.result.length ? true : false;
            this.showSpinner = false;

          } else {
            this.gridData['result'] = [];
            this.dataObject.isDataAvailable = true;
            this.dataObject.gridData = this.gridData;
            this.showSpinner = false;
          }
        },
        err => {

          if(err.status === 401) {
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.showSpinner = false;
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.populateReportDataTable();
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

  handleEdit(dataObj: any) {
    this.router.navigate(['/app/reports/adHocReportBuilder', dataObj.data.id]);
  }

  handleRun(dataObj: any) {
    const reportId = dataObj.data.id;
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

  handleDownload(dataObj: any) {
    const link = document.createElement('a');
    link.setAttribute('href', dataObj.data.downloadurl);
    document.body.appendChild(link);
    link.click();
  }

  handleRowSelection(rowObj: any, rowData: any) {

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