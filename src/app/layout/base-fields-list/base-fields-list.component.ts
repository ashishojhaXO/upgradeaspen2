import { Component, OnInit, Input, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'base-fields-list',
  templateUrl: './base-fields-list.component.html',
  styleUrls: ['./base-fields-list.component.scss']
})
export class BaseFieldsListComponent implements OnInit  {

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
    isRowHighlight: false,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: true,
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 0, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    isOrder: [[2, 'asc']],
  }];
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  pageId = '';
  orgInfo: any;
  orgArr = [];
  selectedOrg: any;
  orgValue = '';
  select2Options = {
    // placeholder: { id: '', text: 'Select organization' }
  };
  isRoot: boolean;
  isForbidden:boolean = false;

  @ViewChild ( AppDataTable2Component )
  private appDataTable2Component : AppDataTable2Component;
  selectedRow: any;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const custInfo =  JSON.parse(localStorage.getItem('customerInfo') || '');
    this.orgInfo = custInfo.org;

    console.log('custInfo >>>')
    console.log(custInfo);

    const grp = JSON.parse(groups);
    grp.forEach(function (item) {
      if (item === 'ROOT' || item === 'SUPER_USER') {
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
    if (this.isRoot) {
      this.searchOrgRequest();
    } else {
      this.searchDataRequest();
    }
  }

  cancelOrder() {
  }

  redirectToModifyOrderTemplatePage() {}

  handleEdit(dataObj: any){
    
  }

  searchDataRequest() {
    return this.searchData().subscribe(
        response => {
          if (response) {
            if (response.attributes) {
              this.populateDataTable(response.attributes, true);
              this.showSpinner = false;
            }
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
          } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
          } else {
            this.showSpinner = false;
            Swal({
              title: 'An error occurred',
              html: err._body ? JSON.parse(err._body).message : 'No error definition available',
              type: 'error'
            });
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
    let org =this.orgValue;
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/templates/attributes'+( org ? ('?org_uuid=' + org) : '');
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  populateDataTable(response, initialLoad) {
    const baseData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    const headers = [];
    const tableData= [];
    if (baseData.length) {
      baseData.forEach(function (ele) {
      tableData.push({
          "Name": ele.name,
          "Global": ele.org_id == null ? true : false,
          "Org": ele.org_id
        });
      }, this);

      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        headers.push({
          key: keys[i],
          title: keys[i].replace(/_/g,' ').toUpperCase(),
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: true,
          width: '150'
        });
      }
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];
    this.dataObject.gridData = this.gridData;
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleCheckboxSelection(rowObj: any, rowData: any) {
    console.log('this.selectedRow >>')
    this.selectedRow = rowObj;
    console.log(this.selectedRow.data.id);
    this.redirectToModifyOrderTemplatePage();
  }

  handleUnCheckboxSelection(rowObj: any, rowData: any) {
    this.selectedRow = null;
  }

  handleRow(rowObj: any, rowData: any) {
    if(this[rowObj.action])
      this[rowObj.action](rowObj);
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
                text: ele.org_name,
                ord_id: ele.id
              });
            }, this);

            if (this.orgArr.length) {
              this.orgValue = this.orgArr[0].id;
              this.searchDataRequest();
            }
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
          } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
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
  // orgChange(value) {
  //   this.showSpinner = true;
  //   this.dataObject.isDataAvailable = false;
  //   this.searchDataRequest();
  // }

  OnOrgChange(e) {
      this.dataObject.isDataAvailable = false;
      this.orgValue = e.value;
      this.reLoad();
  }
}
