import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { DataTableAction } from '../../shared/components/app-data-table/data-table-action';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-operations-dashboard',
  templateUrl: './operations-dashboard.component.html',
  styleUrls: ['./operations-dashboard.component.scss']
})
export class OperationsDashboardComponent implements OnInit {
  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  showError: boolean;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isAddRow: false,
    isColVisibility: true,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isRowSelection: null,
    isPageLength: true,
    isPagination: true,
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 0, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    isOrder: [[2, 'asc']]
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  orgModel: any;
  error: any;
  showSpinner: boolean;
  widget: any;
  editID: any;
  resultStatus: any;
  isForbidden:boolean = false;

  constructor(
    private okta: OktaAuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private toastr: ToastsManager
  ) { }

  ngOnInit() {
    this.widget = this.okta.getWidget();
    this.showSpinner = true;
    this.height = '50vh';
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.resultStatus = 'Fetching results';
    this.searchDataRequest();
  }
  searchDataRequest() {
    return this.searchData().subscribe(
      response => {
        if (response) {
          console.log(response);
          if (response.data && response.data.length) {
            this.showSpinner = false;
            this.populateDataTable(response.data, true);
          } else {
            this.resultStatus = 'No data found'
            this.showSpinner = false;
          }
        }
      },
      err => {

        if (err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchDataRequest.bind(self)
          );
         } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
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
      token = AccessToken;
    }

    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    var url = this.api_fs.api + '/api/reports/operations';
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
    const headers = [];

    if (tableData && tableData.length) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        headers.push({
          key: keys[i],
          title: keys[i].replace(/_/g, ' ').toUpperCase(),
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: false,
          width: '150'
        });
      }
    }
    this.gridData['result'] = tableData;
    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
  }
  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }
}