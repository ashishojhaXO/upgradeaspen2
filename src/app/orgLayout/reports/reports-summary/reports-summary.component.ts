import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from "../../../../models/dataTableOptions";
import * as gridData from "./gridData.json";
import {AuthService, ReportsService} from '../../../../services';
import {DataTableAction } from '../../../shared/components/app-data-table/data-table-action';
import {DataTableActionType } from '../../../shared/components/app-data-table/data-table-action-type';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import {ToastsManager} from 'ng2-toastr';
import {TheReportsService} from '../reportsLocal.service';

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

  constructor(private route: ActivatedRoute, private router: Router,
              public reportsService: TheReportsService, public datePipe: DatePipe,
              public toastr: ToastsManager, private authService: AuthService) {
  }

  ngOnInit() {
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
    const spendData = JSON.parse(JSON.stringify(gridData));
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
    let result = [];
    this.reportsService.reportSummary(this.context).subscribe(response => {
      if (response) {
        _.forEach(response, (v, i) => {
          let period = v.report.period.duration[0]['option'];
          if (period === 'Custom Period') {
            const startDate = __this.datePipe.transform(v.report.period.duration[0].start, 'MMM-dd-yyyy');
            const endDate = __this.datePipe.transform(v.report.period.duration[0].end, 'MMM-dd-yyyy');
            period = startDate + ' - ' + endDate;
          }
          v['period'] = period;
          v['lastruntime'] = _.size(v.reportResult) > 0 ? __this.datePipe.transform(v.reportResult[0]['run_date'], 'yyyy-dd-M h:mm:ss a') : '';
          v['status'] = _.size(v.reportResult) > 0 ? v.reportResult[0]['status'] : '';
          const gridResult = {};
          _.forEach(this.headers, (vv, ii) => {
            gridResult[vv['data']] = v[vv['data']];
          });
          gridResult['id'] = v['_id'];
          gridResult['downloadId'] = _.size(v.reportResult) > 0 ? v.reportResult[0]['_id'] : '';
          gridResult['downloadurl'] = _.size(v.reportResult) > 0 ? v.reportResult[0]['signedUrl'] : '';
          gridResult['toggleOptions'] = _.size(v.reportResult) > 0 ? v.reportResult : [];
          gridResult['alertEnabled'] = _.size(v.report.alert) > 0;
          result.push(gridResult);
        });

        // result = result.reverse();
        __this.gridData['result'] = result;
        __this.options[0].isPageLength =  10;
        __this.dataObject.gridData = __this.gridData;
        __this.dataObject.isDataAvailable = __this.gridData.result && __this.gridData.result.length ? true : false;
      }
    });
  }

  handleEdit(rowObj: any, rowData: any) {
    console.log(rowObj);
    console.log(rowData);
    this.router.navigate(['/reports/adHocReportBuilder', rowData.id]);
  }

  handleRun(rowObj: any, rowData: any) {
    console.log(rowData);
    const reportId = rowData.id;
    const type = 'run?clientCode=btil';
    this.reportsService.reportRunOrDownload(this.context, reportId, type).subscribe(response => {
      console.log(response);
      this.dataObject.isDataAvailable = false;
      this.populateReportDataTable();
    }, error => {
      const message = JSON.parse(error._body).message;
      this.toastr.error('ERROR!', message);
    });
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
