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
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { OktaAuthService } from '../../../services/okta.service';
import { AppPopUpComponent } from '../../shared/components/app-pop-up/app-pop-up.component';
import { GenericService } from '../../../services/generic.service';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import { CsvService } from '../../../services/csv';

// import { DataTablePluginExt } from "../../../services/data-table-plugin-ext";
// import { DataTablePluginExt } from "./../../../scripts/data-table/data-table-plugin-ext.js";

// var DataTablePluginExt = 
// require("../../../services/data-table-plugin-ext.js");

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss'],
  providers: [AppPopUpComponent, GenericService]
})
export class UserManagementComponent implements OnInit  {

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
    // For Csv functionality searchDataRequestCsv
    isDownloadAsCsv: true,
    isDownloadAsCsvFunc: ( table, pageLength, csv?) => {
      this.apiMethod(table, pageLength, csv);
    },
    //
    isDownloadOption: false,
    isRowSelection: null,
    isPageLength: true,
    isPageLengthNo: 25,
    isPagination: true,
    isTree: true,

    // To start the DataTables from a particular page number
    isDisplayStart: 0,

    // TODO: How is this 'blah' thing even happening!!!
    isColumnDefs: [
      { 
        type: 'name-string-not-nullund', 
        // type: 'name-string-not-nullund-a', 
        // type: 'blah',
        // type: 'string',
        targets: '_all',
        render: (data, type, row, meta)=>{ 
          return data; 
        }
      }
    ],

    // If dataTable is having `isApiCallForNextPage`
    // Then we will also have to send isOrder
    // We might have to write a PlugIn/Extension for DataTables
    // $.fn.dataTable.ext.sort
    isOrder: [[1, 'desc']],
    // isOrder: [[1, 'name-string-not-nullund']],
    // isOrdering: false,
    // For limited pagewise data
    isApiCallForNextPage: {
      value: true,
      apiMethod: ( table, pageLength, csv?) => {
        this.apiMethod(table, pageLength, csv);
      },

    },

  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  @ViewChild('AddUser') addUser: PopUpModalComponent;
  @ViewChild ( AppDataTable2Component )
  private appDataTable2Component : AppDataTable2Component;
  userForm: FormGroup;
  userModel: any;
  selectedRole: any;
  selectedSource: any;
  selectedVendor: any;
  error: any;
  showSpinner: boolean;
  userID: string;
  isRoot: boolean;
  orgInfo: any;
  selectedOrg: any;
  orgArr: any;
  response: any;
  orgValue = '';
  hasData: boolean;

  sourceOptions = [
    {
      id: 'f7',
      text: 'FusionSeven'
    },
    {
      id: 'thd',
      text: 'Home Depot'
    },
    {
      id: 'vendor',
      text: 'Vendor'
    }];

  vendorOptions = [];
  roleOptions = [];
  widget: any;

  constructor(
    private okta: OktaAuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private popUp: AppPopUpComponent,
    private genericService: GenericService
  ) {

    this.userForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]),
      first: new FormControl('', Validators.required),
      last: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required),
      org: new FormControl('', Validators.required),
      vendor: new FormControl('', Validators.required),
    });

    this.userModel = {
      email: '',
      first: '',
      last: ''
    };

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

  }

  ngOnInit() {

    this.widget = this.okta.getWidget();
    this.showSpinner = true;
    this.selectedSource = 'f7';
    this.height = '50vh';
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    this.searchDataRequest();

    this.searchOrgRequest();

    // Init Datatables Extension Plug-ins
    // new DataTablePluginExt() 
    // this.loadScript("../../../services/data-table-plugin-ext.js");

  }

  apiMethod = (table, pageLength, csv?) => {
    this.options[0].isDisplayStart = table && table.page.info().start ? table.page.info().start : 0;

    if(csv){
      this.searchDataRequestCsv(null, table);
    }
    else
      this.searchDataRequest(null, table);
  }

  searchOrgRequest() {
    return this.searchOrgData().subscribe(
        response => {
          if (response && response.data) {

            const orgArr = [];
            response.data.forEach(function (item) {
              orgArr.push({
                id: item.org_uuid,
                text: item.org_name
              });
            });

            this.orgArr = orgArr;
            if (this.orgArr.length) {
              this.selectedOrg = this.orgArr[0].id;
              this.userForm.patchValue({
                org : this.orgArr[0].id
              });
            }
          }

          if(!this.isRoot) {
            this.selectedOrg = this.orgInfo.org_id;
            this.userForm.patchValue({
              org : this.orgInfo.org_id
            });
          }

          if (this.selectedOrg) {
            this.getVendorsService(this.selectedOrg);
          }

        },
        err => {

          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    this.showSpinner = false;
                    this.searchOrgRequest();
                  })
                  .catch(function (err1) {
                    console.log('error >>')
                    console.log(err1);
                  });
            } else {
              this.widget.signOut(() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              });
            }
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

  getVendorsService(org = null) {
    return this.getVendors(org).subscribe(
      response => {
        this.showSpinner = false;
        if (response) {
          const vendorOptions = [];
          response.forEach(function (item) {
            vendorOptions.push({
              id: item.vendor_id,
              text: item.external_vendor_id + ' - ' + item.company_name
            });
          });
          this.vendorOptions = vendorOptions;
          if(response.length) {
            this.selectedVendor = response[0].vendor_id;
            this.userForm.patchValue({
              vendor : response[0].vendor_id
            });
          }
        }
      },
      err => {
        this.showSpinner = false;
        if(err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
              this,
              err,
              self.getVendorsService.bind(self, org)
          );
        }
      }
    )
  }

  searchDataRequest(org = null, table? ) {

    // if no table, then send all default, page=1 & limit=25
    // else, send table data
    let data = {
      page: 1,
      limit: +localStorage.getItem("gridPageCount"),
      org: org ? org : ''
    };

    if(table) {
      let tab = table.page.info();
      data = {
        page: tab.page + 1,
        limit: tab.length,
        org: org ? org : ''
      };
    }

    this.hasData = false;
    this.showSpinner = true;

    return this.genericService.getUsers(data)
    .subscribe(
      (res) => {
        this.hasData = true;
        this.showSpinner = false;
        // this.successCB.apply(this, [res])
        this.successCB(res, table)
      },
      (err) => {
        this.showSpinner = false;
        this.errorCB(err)

        if(err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchDataRequest.bind(self, org, table)
          );
        } else {
          this.showSpinner = false;
        }
      }
    );

  }

  searchDataRequestCsv(org = null, table?) {

    // if no table, then send all default, page=1 & limit=25
    // else, send table data
    let data = {
      page: 0,
      limit: 10000000,
      org: org ? org : ''
    };

    // this.hasData = false;
    this.showSpinner = true;

    return this.genericService.getUsersCsv(data)
    .subscribe(
      (res) => {
        this.hasData = true;
        this.showSpinner = false;
        // this.successCB.apply(this, [res])
        // this.successCBCsv(res, table)
        this.showSpinner = false;
        let csv = new CsvService()
        csv.successCBCsv(res, table)
      },
      (err) => {
        this.showSpinner = false;
        this.errorCB(err)

        if(err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchDataRequestCsv.bind(self, org, table)
          );
        } else {
          this.showSpinner = false;
        }
      }
    );

  }

  // TODO: Not in use at the moment, replaced by this.searchDataRequest
  getUsers(table?) {
    // if no table, then send all default, page=1 & limit=25
    // else, send table data
    let data = {
      page: 1,
      limit: +localStorage.getItem("gridPageCount")
    };

    if(table) {
      let tab = table.page.info();
      data = {
        page: tab.page + 1,
        limit: tab.length
      };
    }

    this.hasData = false;
    this.showSpinner = true;

    this.genericService.getUsers(data)
    .subscribe(
      (res) => {
        this.hasData = true;
        this.showSpinner = false;
        // this.successCB.apply(this, [res])
        this.successCB(res, table)
      },
      (rej) => {
        this.showSpinner = false;
        this.errorCB(rej)
      }
    )
  }

  // TODO: Not in use at the moment, replaced by generic.getUsers
  searchData(org) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/users' + ( org ? ('?org_uuid=' + org) : '');

    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }

  OnRoleChanged(e: any): void {
    if (!this.selectedRole || this.selectedRole !== e.value ) {
      this.selectedRole = e.value;
      this.userForm.patchValue({
        role : e.value
      });
    }
  }

  OnSourceChanged(e: any): void {
    if (!this.selectedSource || this.selectedSource !== e.value ) {
      this.selectedSource = e.value;
    }
  }

  OnVendorChanged(e: any): void {
    console.log('e.value >>>')
    console.log(e.value);
    console.log('this.selectedVendor')
    console.log(this.selectedVendor);
    if (this.selectedVendor !== e.value ) {
      this.selectedVendor = e.value;
      this.userForm.patchValue({
        vendor : e.value
      });
    }
  }

  OnOrgChanged(e: any) {
    if (!this.selectedOrg || this.selectedOrg !== e.value ) {
      this.userForm.patchValue({
        org : e.value
      });
      this.selectedOrg = e.value;
      this.showSpinner = true;
      this.userForm.patchValue({
        vendor : ''
      });
      this.getVendorsService(this.selectedOrg);
    }
  }

  handleRowSelection(rowObj: any, rowData: any) {

  }

  getVendors(org = null) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const obj: any = {};
    if (this.isRoot) {
      obj['org_uuid'] = org;
    }
    const dataObj = JSON.stringify(obj);

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token , 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors/list';
    return this.http
      .post(url, dataObj, options)
      .map(res => {
        return res.json();
      }).share();
  }


  orgChange(value) {
      this.dataObject.isDataAvailable = false;
      this.searchDataRequest(value);
  }

  setDataTableHeaders( ) {
    // Ideally pass data into this function & then set the DataTableHeaders
    let tableData = this.response;
    let headers = [];

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

    return headers;
  }

  populateDataTable(response, initialLoad) {
    // @param: response: response is not longer actual Api_Response, its a differently compiled response from successCB function
    const tableData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    const headers = [];


    this.gridData['result'] = tableData;
    this.gridData['headers'] = this.setDataTableHeaders();
    this.gridData['options'] = this.options[0];
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  OnSubmit(modalComponent: PopUpModalComponent) {
    this.showSpinner = true;
    this.error = '';
    const dataObj: any = {};
    dataObj.email_id = this.userForm.controls['email'].value;
    dataObj.first_name = this.userForm.controls['first'].value;
    dataObj.last_name = this.userForm.controls['last'].value;
    // dataObj.source = this.selectedSource;
    dataObj.role_id = this.selectedRole;
    if(this.isRoot) {
      dataObj.org_uuid = this.selectedOrg;
    }
    dataObj.vendor_id = this.selectedVendor;
    // if (this.selectedSource === 'vendor') {
    //
    // }

    this.performUserAdditionRequest(dataObj);
  }

  getRolesService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/users/roles';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }

  getRoles() {
    this.getRolesService().subscribe(
      response => {
        this.showSpinner = false;

        if (response) {
          const roleOptions = [];
          response.user_roles.forEach(function (item) {
            roleOptions.push({
              id: item.id,
              // id: item.name,
              text: item.name.replace( item.name[0], item.name[0].toUpperCase() )
            });
          });

          this.roleOptions = roleOptions;

          if(this.roleOptions.length) {
            this.selectedRole = String(this.roleOptions[0].id );
            this.userForm.patchValue({
              role : String(this.roleOptions[0].id )
            });
          }
        }
      },
      err => {
        if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getRoles.bind(self)
            );
        } else {
          this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
          this.showSpinner = false;
        }

      }

    )
  }

  performUserAdditionRequest(dataObj) {
    return this.performUserAddition(dataObj).subscribe(
        response => {
          console.log('response from user creation >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            this.error = { type : 'success' , message : response };
          }
          // modalComponent.hide();
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.performUserAdditionRequest.bind(self, dataObj)
            );
          } else {
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  performUserAddition(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);
    const url = this.api_fs.api + '/api/users';
    return this.http
      .post(url, data, options)
      .map(res => {
        return res.json();
      }).share();
  }

  handleCloseModal(modalComponent: PopUpModalComponent) {
    this.error = '';
    this.userModel.email = '';
    this.userForm.patchValue({
      email : ''
    });
    this.userModel.first = '';
    this.userForm.patchValue({
      first : ''
    });
    this.userModel.last = '';
    this.userForm.patchValue({
      last : ''
    });
    this.selectedSource = 'f7';
    this.selectedVendor = '';
    modalComponent.hide();

    // TODO: Temporarily deactivating these 2 lines,
    // since they may not be needed on modal close
    // this.dataObject.isDataAvailable = false;
    // this.searchDataRequest();
  }

  handleShowModal(modalComponent: PopUpModalComponent) {
    this.getRoles();
    modalComponent.show();
  }

  // Started

  showError() {
    console.log("Some error occured while catching data from child component");
  }

  handleRow(rowObj: any, rowData: any) {
    // If this.rowObj.action func exists then run that function
    const func = this[rowObj.action] ? this[rowObj.action] : this.showError();
  }

  apiCall(endPoint, dataObj) {
    // TODO: FTM: All calls are Post, change it to be generic
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const api_url_part = '/api';
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);
    const url = this.api_fs.api + api_url_part + endPoint;
    return this.http
      .post(url, data, options)
      .map(res => {
        return res.json();
      }).share();
  }

  successCallBack = (res) => {
    this.showSpinner = false;
    let popUpOptions = {};
    if (res.status = 200) {
      popUpOptions = {
        title: "Email sent",
        text: res.message,
        type: 'success',
        cancelButtonText: "Cancel",
      }

    } else if (res.status == 400) {
      popUpOptions = {
        title: "Error in sending Email",
        text: "Error while sending email.",
        type: 'error',
        cancelButtonText: "Cancel",
      }

    } else {
      popUpOptions = {
        title: "Error",
        text: "Some error in sending email.",
        type: 'error',
        cancelButtonText: "Cancel",
      }

    }
    this.popUp.showPopUp(popUpOptions);
  }

  errorCallBack = (err) => {
    this.showSpinner = false;
    const popUpOptions = {
      title: "Error",
      text: JSON.parse(err._body).message,
      type: 'error',
      cancelButtonText: "Cancel",
    }

    this.popUp.showPopUp(popUpOptions);
  }

  resendEmail() {
    // TODO: To be completed still, waiting for API
    const endPoint = `/users/${this.userID}/resend-activation-email`;
    const data = {
      // "vendor | f7 | thd", pine: vendor, aspen: f7
      "source": "f7"
    };

    this.showSpinner = true;
    // Pre AreUSure SweetAlert PopUp
    this.apiCall(endPoint, data).subscribe( this.successCallBack, this.errorCallBack );
  }

  deactivate() {
    const endPoint = `/users/${this.userID}/deactivate`;
    const data = {};

    const popUpOptions = {
      title: "Deactivate?",
      text: "Are you sure you want to deactivate the account?",
      type: 'question',
      showCloseButton: true,
      showCancelButton: true,
      reverseButtons: true,
    }

    const prom = this.popUp.showPopUp(popUpOptions);
    prom
    .then((res) => {
      if(res && res.value) {
        this.showSpinner = true;
        return this.apiCall(endPoint, data).toPromise()
      }
    })
    .then((res)=>{
      // Resolve
      this.showSpinner = false;
      if(res) {
        const str = res.message;
        const swalOptions = {
          title: 'Success',
          text: str,
          type: 'success',
          showCloseButton: true,
          confirmButtonText: "Ok",
        };
        return this.popUp.showPopUp(swalOptions)
      }
      return null;
    }, (rej) => {
      this.showSpinner = false;
      if(rej) {
        const swalOptions = {
          title: 'Error',
          text: JSON.parse(rej._body).message,
          type: 'error',
          showCloseButton: true,
          confirmButtonText: "Ok",
        };
        this.popUp.showPopUp(swalOptions)
        throw new Error("Rejected");
      }
      return null;
    })
    .then((ok) => {
      // On Resolve Call getRetryOrders
      if(ok && ok.value) {
        this.showSpinner = true; // true here & then when getRetryOrders pulled, false spinner
        return this.searchDataRequest();
      }
      return null;
    })
    .catch((err)=>{
      // if (err instanceof ApiError)
      this.showSpinner = false;
      console.log("Error: Deactivating account: ", err);
    });
    // Post Success/Error SweetAlert PopUp
  }

  handleActions(ev: any) {
    const action = $(ev.elem).data('action');
    this.userID = ev.data.data()[4];

    if(this[action]) {
      // const func = this[action];
      // func();
      this[action]();
    } else {
      // Some problem
      // Function does not exists in this class, if data-action string is correct
      // Else if all functions exists, then, data-action string coming from html is not correct
      console.log(`Error: Problem executing function: ${action}`)
    }
  }

  // Started/
  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;

    let org = ""
    let table = this.appDataTable2Component.table;

    this.searchDataRequest(org, table);
  }

  calc(res, table) {
    let li = [];
    let keyNames = {};
    let keyNamesList = Object.keys(res.data.rows[0]);
    for(let i = 0; i < keyNamesList.length; i++ ) {
      keyNames[keyNamesList[i]] = null;
    }

    // Even when table is not there, still we need to run this,
    // Since, data will be of the first page.
    // If !table
    // Data is in the start, It is the 1st page data, fill the array in the starting
    if (!table || table.page.info().start == 0) {
      li.push(...res.data.rows);
      for(let i = res.data.rows.length; i < res.data.count; i++) {
        // res.data.rows.push({i: i});
        li.push( keyNames )
      }

    }

    if(table) {
      let tab = table.page.info();
      if(tab.start != 0 && tab.start + +tab.length != res.data.count) {

        // Then fill the array in the middle
        // Empty in start
        for(let i = 0; i < tab.start; i++) {
          li.push(keyNames )
        }
        // Data in Middle
        li.push(...res.data.rows);
        // Empty data in the end
        for(let i = tab.start + res.data.rows.length; i < res.data.count; i++) {
          li.push( keyNames )
        }
      }


      // Fill Data at the end of the Array
      if( tab.start != 0 && tab.start + +tab.length == res.data.count
        // table.page.info().end == res.data.count
        ) {
        let tab = table.page.info();

        for(let i = 0; i < tab.start; i++) {
          // res.data.rows.push({i: i});
          li.push(keyNames)
        }
        li.push(...res.data.rows);
      }

    }

    return li;
  }

  successCB(res, table) {

    // Set this.response, before calc
    // Since now, populateDataTable is getting made up,
    // EmptyData_ActualData_EmptyData response, & not the actualy API_Response
    //
    this.response = res.data.rows;
    let li = this.calc(res, table);

    // In order to refresh DataTable, we have to reassign the data variable, dataObject here.
    // TODO: Data to send to html
    // NumberOfPages: Send number of rowCount/limit
    // CurrentPageNo:
    // TotalCountofRows:
    this.dataObject = {};
    this.populateDataTable(li, false);
  }

  successCBCsv(res, table) {
    // Set this.response, before calc
    let rows = res.data.rows;
    // let li = this.calc(res, table);
    console.log("Download Csv Here...");

    let arr: Array<String> = [];

    if (rows && rows.length) {
      arr.push( Object.keys(rows[0]).join(",") );
      let dataRows = rows.map( (k, v) => { return Object.values(k).join(", "); } )
      arr = arr.concat(dataRows);
    }

    let csvStr: String = "";
    csvStr = arr.join("\n");

    // var data = encode(csvStr);
    let b64 = btoa(csvStr as string);
    let a = "data:text/csv;base64," + b64;
    $('<a href='+a+' download="data.csv">')[0].click();

    return arr;
  }

  errorCB(rej) {
    console.log("errorCB: ", rej)
  }


}
