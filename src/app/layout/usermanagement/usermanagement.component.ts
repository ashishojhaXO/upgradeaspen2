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
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isRowSelection: null,
    isPageLength: true,
    isPagination: true,
    isTree: true,

    // For limited pagewise data
    isApiCallForNextPage: {
      value: true,
      apiMethod: (table) => {
        console.log(
          "apiMethod here, table here: ", table, 
          " this: ", this, " run blah: ", this.getOrders()
        );
        // Make ApiCall to backend with PageNo, Limit, 
      }
    }

  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  @ViewChild('AddUser') addUser: PopUpModalComponent;
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
      last: new FormControl('', Validators.required)
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
              this.selectedOrg = this.roleOptions[0].id;
            }
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

  getVendorsService() {
    return this.getVendors().subscribe(
      response2 => {
        console.log('response1');
        console.log(JSON.stringify(response2));
        if (response2 && response2.body) {
          const vendorOptions = [];
          response2.body.forEach(function (item) {
            vendorOptions.push({
              id: item.id,
              text: item.client_id + ' - ' + item.company_name
            });
          });
          this.vendorOptions = vendorOptions;
          if(response2.body.length) {
            this.selectedVendor = response2.body[0].id;
          }
        }
      },
      err2 => {
        this.showSpinner = false;
        console.log('err')
        console.log(err2);
      }
    )

  }

  searchDataRequest() {
    return this.searchData().subscribe(
        response => {
          if (response) {
            console.log('response >>')
            console.log(JSON.stringify(response));
            if (response) {
              this.showSpinner = false;
              this.populateDataTable(response, true);
              return this.getVendors().subscribe(
                  response1 => {
                    console.log('response1');
                    console.log(JSON.stringify(response1));
                    if (response1) {
                      const vendorOptions = [];
                      response1.forEach(function (item) {
                        vendorOptions.push({
                          id: item.id,
                          text: item.external_vendor_id + ' - ' + item.company_name
                        });
                      });
                      this.vendorOptions = vendorOptions;
                      if(response1.length) {
                        this.selectedVendor = response1[0].id;
                      }
                    }
                  },
                  err1 => {

                    if(err1.status === 401) {
                        // TODO: New this.widget.tokenManager.refresh to be implemented
                        // this.widget.tokenManager.refresh('accessToken')
                        //     .then(function (newToken) {
                        //       localStorage.setItem('accessToken', newToken);
                        //       this.showSpinner = false;
                        //       this.getVendorsService();
                        //     })
                        //     .catch(function (err) {
                        //       console.log('error >>')
                        //       console.log(err);
                        //     });
                        let self = this;
                        this.widget.refreshElseSignout(
                          this,
                          err1,
                          self.getVendorsService.bind(self)
                        );

                    } else {
                      this.showSpinner = false;
                    }
                  }
              )
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

  OnRoleChanged(e: any): void {
    if (!this.selectedRole || this.selectedRole !== e.value ) {
      this.selectedRole = e.value;
    }
  }

  OnSourceChanged(e: any): void {
    if (!this.selectedSource || this.selectedSource !== e.value ) {
      this.selectedSource = e.value;
    }
  }

  OnVendorChanged(e: any): void {
    if (this.selectedVendor !== e.value ) {
      this.selectedVendor = e.value;
    }
  }

  OnOrgChanged(e: any) {
    if (!this.selectedOrg || this.selectedOrg !== e.value ) {
      this.selectedOrg = e.value;
    }
  }

  handleRowSelection(rowObj: any, rowData: any) {

  }

  getVendors() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token , 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
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
    var url = this.api_fs.api + '/api/users';
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
    console.log(" GRIDDATA: ", this.gridData);
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
    dataObj.org_uuid = this.isRoot ? this.selectedOrg : this.orgInfo.org_id;
    if (this.selectedSource === 'vendor') {
      dataObj.vendor_id = this.selectedVendor;
    }

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
          }
        }
      },
      err => {
        if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              // self.searchDataRequest.bind(self)
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
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
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
    this.searchDataRequest();
  }

  successCB(res) {
    console.log("getUsers successCB: res ", res, " this: ", this)
    // console.log( " res.json(): ", res.json())

    // In order to refresh DataTable, we have to reassign the data variable, dataObject here.
    // TODO: Data to send to html 
    // NumberOfPages: Send number of rowCount/limit 
    // CurrentPageNo:
    // TotalCountofRows:
    this.dataObject = {};
    this.populateDataTable(res.data.rows, false);
  }

  errorCB(rej) {
    console.log("getUsers errorCB: ", rej)
  }

  getOrders() {
    console.log("BLAH")

    let data = {};

    this.genericService.getUsers(data)
    .subscribe(
      (res) => {
        this.showSpinner = false;
        // this.successCB.apply(this, [res])
        this.successCB(res)
      },
      (rej) => {
        this.showSpinner = false;
        this.errorCB(rej)
      }
    )

  }

}
