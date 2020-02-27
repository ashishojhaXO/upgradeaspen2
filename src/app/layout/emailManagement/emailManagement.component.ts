/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { OktaAuthService } from '../../../services/okta.service';
import {DataTableAction } from '../../shared/components/app-data-table/data-table-action';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-emailmanagement',
  templateUrl: './emailManagement.component.html',
  styleUrls: ['./emailManagement.component.scss']
})
export class EmailManagementComponent implements OnInit, DataTableAction  {

  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  showError: boolean;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: {
      value : false,
      icon : '',
      tooltip: 'Edit email'
    },
    isDeleteOption: {
      value : true,
      icon : '',
      tooltip: 'Delete Email'
    },
    isAddRow: false,
    isColVisibility: true,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isPageLength: true,
    isPagination: true,
    //fixedColumn: 1,
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 1, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    // isOrder: [[2, 'asc']],
    isHideColumns: [ 'id'],
    isRowSelection: {
      isMultiple : true
    },
    sendResponseOnCheckboxClick: true
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  @ViewChild('AddEmails') addEmails: PopUpModalComponent;
  emailModel: any;
  error: any;
  showSpinner: boolean;
  widget: any;
  editID: any;
  resultStatus: any;
  selected = [];
  emails = [];

  constructor(
      private okta: OktaAuthService,
      private route: ActivatedRoute, private router: Router, private http: Http, private toastr: ToastsManager) {
  }

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
            console.log('response >>')
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

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDataRequest.bind(self)
            );
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
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/users/email/blocked';
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
          title: keys[i].replace(/_/g,' ').toUpperCase(),
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
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleDelete(dataObj: any) {
    // console.log('rowData >>>!!!!')
    // console.log(rowData);

    console.log('this.selected >>!!!!')
    console.log(this.selected);

    const obj = { 'email_ids' : this.selected.map(function (m) {
        return m.id;
      })};

    this.performEmailDeletionRequest(obj);
  }

  handleDownload(rowObj: any, rowData: any) {
  }

  handleEmail(rowObj: any, rowData: any) {
  }

  handleRowSelection(rowObj: any, rowData: any) {

  }

  OnSubmit(modalComponent: PopUpModalComponent) {
    this.showSpinner = true;
    this.error = '';
    const dataObj: any = { emails : this.emails.map(function (email) {
      return email.value;
    })};
     this.performEmailAdditionRequest(dataObj);
  }

  performEmailAdditionRequest(dataObj) {
    return this.performEmailAddition(dataObj).subscribe(
        response => {
          console.log('response from email creation >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            this.error = { type : response.status === 'success' ? 'success' : 'fail' , message : response.message };
            this.emails = [];
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.performEmailAdditionRequest.bind(self, dataObj)
            );
          } else {
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  performEmailAddition(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);
    const url = this.editID ? this.api_fs.api + '/api/users/email/blocked/' + this.editID : this.api_fs.api + '/api/users/email/blocked';
    if (this.editID) {
      return this.http
          .put(url, data, options)
          .map(res => {
            return res.json();
          }).share();
    } else {
      return this.http
          .post(url, data, options)
          .map(res => {
            return res.json();
          }).share();
    }
  }

  performEmailDeletionRequest(obj) {
    return this.performEmailDeletion(obj).subscribe(
        response => {
          if (response) {
            this.showSpinner = false;
            this.dataObject.isDataAvailable = false;
            this.searchDataRequest();
            // this.error = { type : response.status === 'success' ? 'success' : 'fail' , message : response.message };
            //  this.editID = '';
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.performEmailDeletionRequest.bind(self, obj)
            );
          } else {
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  performEmailDeletion(obj) {
    const dataObj = JSON.stringify(obj);
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers, body : dataObj});
    const url = this.api_fs.api + '/api/users/email/blocked';
    return this.http
        .delete(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  handleCloseModal(modalComponent: PopUpModalComponent) {
    this.error = '';
    modalComponent.hide();
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }

  handleShowModal(modalComponent: PopUpModalComponent) {
    modalComponent.show();
  }

  handleEdit() {

  }

  handleRun() {

  }

  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }

  handleCheckboxSelection(obj) {

    console.log('handleCheckboxSelection >>>')
    if (this.dataObject.gridData.options.isRowSelection && !this.dataObject.gridData.options.isRowSelection.isMultiple) {
      this.selected = [];
    }

    const selectedValue = {
      id: obj.data[Object.keys(obj.data)[0]],
      label: obj.data[Object.keys(obj.data)[0]]
    }

    this.selected.push(selectedValue);

    console.log('this.selected >>')
    console.log(this.selected);

  }

  handleUnCheckboxSelection(obj) {
    console.log('handleUnCheckboxSelection >>>')
    console.log('obj >>>')
    console.log(obj);
    console.log('this.selected >>')
    console.log(JSON.parse(JSON.stringify(this.selected)));
    const unSelectedItem = this.selected.find(x=> x.id === obj.data.id);
    if(unSelectedItem) {
      this.selected.splice(this.selected.indexOf(unSelectedItem), 1);
    }
    console.log('this.selected >>')
    console.log(this.selected);
  }

  handleHeaderCheckboxSelection(obj) {
    console.log('handleHeaderCheckboxSelection >>>')
    this.selected = [];
    console.log('obj >>>')
    console.log(obj);
    if (obj.data.length) {
      obj.data.forEach(function(dat) {
        this.selected.push({
          id: dat.id,
          label: dat.id
        });
      }, this);
    }

    console.log('this.selected >>')
    console.log(this.selected);
  }

  _updateDataModel(e) {
    this.emails = e.dataModel;
  }

}
