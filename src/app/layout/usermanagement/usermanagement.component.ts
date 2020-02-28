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
          " this: ", this, " run blah: ", 
        );
        this.getUsers(table);
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

    // this.searchDataRequest();
    this.getUsers();

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

  calc(res) {
    console.log("CALALAL: ", res);
    let rest = res.data.count - res.data.rows.length;
    // res.data.rows = res.data.rows.concat( new Array(rest));
    console.log("calc rest: ", rest, " res: ", res);

    for(let i = 0; i <= rest; i++) {
      res.data.rows.push({i: i});
    }
  }

  successCB(res, table) {
    // console.log( " res.json(): ", res.json())

    // TODO: Temporarily
    let resp = {data: ''};
    resp.data = '{"count":509,"rows":[{"email_id":"fusionseven.io+F7890@gmail.com","first_name":"Ratnakar","last_name":"Verma","external_id":"00ujji8z14WARDUBE0h7","external_status":"EXPIRED","last_login (GMT)":"2019-11-05 10:00:52","company_name":"FusionSeven","created_at (GMT)":"2019-02-26 02:17:52","updated_at (GMT)":null},{"email_id":"fusionseven.io+F9999@gmail.com","first_name":"Fusion","last_name":"7even","external_id":"00ujjiomvmcEVJ1mD0h7","external_status":"EXPIRED","last_login (GMT)":"2019-08-16 22:45:46","company_name":"FusionSeven","created_at (GMT)":"2019-02-26 02:19:50","updated_at (GMT)":null},{"email_id":"fusionseven.io+vendorF911@gmail.com","first_name":"Fusion","last_name":"7","external_id":"00ujjixorq5tFQSuC0h7","external_status":"EXPIRED","last_login (GMT)":"2019-09-17 17:15:14","company_name":"FusionSeven","created_at (GMT)":"2019-02-26 02:33:59","updated_at (GMT)":null},{"email_id":"fusionseven.io+f7test123@gmail.com","first_name":"f7","last_name":"test123","external_id":"00ujk9uvgpT1tUbJl0h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-19 18:51:56","company_name":"FusionSeven","created_at (GMT)":"2019-02-27 06:09:45","updated_at (GMT)":null},{"email_id":"fusionseven.io+123123123@gmail.com","first_name":"F","last_name":"7","external_id":"00ujkawh0rnnglJgm0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-02-27 06:54:32","updated_at (GMT)":null},{"email_id":"fusionseven.io+123123123123@gmail.com","first_name":"F","last_name":"7","external_id":"00ujkaz1biuZPC8eH0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-02-27 07:05:44","updated_at (GMT)":null},{"email_id":"rverma@fusionseven.com","first_name":"Ratnakar","last_name":"Verma","external_id":"00uitnykfeqD2rKaK0h7","external_status":"ACTIVE","last_login (GMT)":"2020-02-06 19:29:10","company_name":"FusionSeven","created_at (GMT)":"2019-02-27 00:00:00","updated_at (GMT)":null},{"email_id":"gurur@fusionseven.com","first_name":"Guru","last_name":"Prasad","external_id":"00uiuhnomqp9UiRtg0h7","external_status":"EXPIRED","last_login (GMT)":"2019-07-12 21:34:20","company_name":"FusionSeven","created_at (GMT)":"2019-02-27 17:51:42","updated_at (GMT)":null},{"email_id":"fusionseven.io+f7876@gmail.com","first_name":"F7","last_name":"f7876","external_id":"00ujkxq70v6trYDGD0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-02-28 04:30:02","updated_at (GMT)":null},{"email_id":"fusionseven.io+f7678@gmail.com","first_name":"F7","last_name":"f767","external_id":"00ujkxphu1x7f4PGS0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-02-28 04:30:45","updated_at (GMT)":null},{"email_id":"hbirdi@fusionseven.com","first_name":"Harman","last_name":"Birdi","external_id":"00uj93p5lnm96pZdi0h7","external_status":"EXPIRED","last_login (GMT)":"2019-05-08 03:44:51","company_name":"FusionSeven","created_at (GMT)":"2019-02-28 10:55:17","updated_at (GMT)":null},{"email_id":"mlynch@fusionseven.com","first_name":"Martin","last_name":"Lynch","external_id":"00ujdzo713ooKJxpe0h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-29 22:23:41","company_name":"FusionSeven","created_at (GMT)":"2019-02-28 03:07:07","updated_at (GMT)":null},{"email_id":"fusionseven.io+f79876@gmail.com","first_name":"FusionsSeven","last_name":"F79876","external_id":"00ujn20nx1B4uxu3p0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-03-06 21:48:47","updated_at (GMT)":null},{"email_id":"fusionseven.io+f79877@gmail.com","first_name":"FusionsSeven","last_name":"F79877","external_id":"00ujn207hw4f2tEk20h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-03-06 21:58:19","updated_at (GMT)":null},{"email_id":"fusionseven.io+testuser123@gmail.com","first_name":"Fu","last_name":"Se","external_id":"00ujn4cbulGGGki9L0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-03-07 00:23:59","updated_at (GMT)":null},{"email_id":"fusionseven.io+FS2019@gmail.com","first_name":"Fu","last_name":"Se","external_id":"00ujn4te1pueJoJpu0h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-08 06:54:49","company_name":"FusionSeven","created_at (GMT)":"2019-03-07 01:27:57","updated_at (GMT)":null},{"email_id":"lombardi@fusionseven.com","first_name":"David","last_name":"Lombardi","external_id":"00ujdzo0c8irs5KRs0h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-14 17:54:09","company_name":"FusionSeven","created_at (GMT)":null,"updated_at (GMT)":null},{"email_id":"fusionseven.io+f7abc@gmail.com","first_name":"F7","last_name":"ABC","external_id":"00ujn63oi4F1gebpw0h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-07 04:16:11","company_name":"FusionSeven","created_at (GMT)":"2019-03-07 04:14:47","updated_at (GMT)":null},{"email_id":"fusionseven.io+FS2211@gmail.com","first_name":"Fus","last_name":"Sev","external_id":"00ujnesodk3TZ5wQ20h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-03-07 19:19:46","updated_at (GMT)":null},{"email_id":"fusionseven.io+f70000@gmail.com","first_name":"FusionsSeven","last_name":"F70000","external_id":"00ujnjv4yucXqSkY80h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-08 01:04:37","company_name":"FusionSeven","created_at (GMT)":"2019-03-08 01:03:15","updated_at (GMT)":null},{"email_id":"fusionseven.io+f7abcde@gmail.com","first_name":"FusionsSeven","last_name":"f7abcde","external_id":"00ujnjzuniqDWloRO0h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-08 01:28:18","company_name":"FusionSeven","created_at (GMT)":"2019-03-08 01:27:11","updated_at (GMT)":null},{"email_id":"ratnakarverma+fs1@gmail.com","first_name":"Ratnakar","last_name":"FS1","external_id":null,"external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-03-08 05:00:22","updated_at (GMT)":null},{"email_id":"ratnakarverma+fs2@gmail.com","first_name":"Ratnakar","last_name":"FS2","external_id":null,"external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-03-08 05:01:52","updated_at (GMT)":null},{"email_id":"ratnakarverma+fs20190308906@gmail.com","first_name":"Ratnakar","last_name":"fs20190308906","external_id":"00ujnmxassZ7qSQii0h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-08 05:08:28","company_name":"FusionSeven","created_at (GMT)":"2019-03-08 05:06:58","updated_at (GMT)":null},{"email_id":"fusionseven.io+vendor388@gmail.com","first_name":"Ratnakar","last_name":"Junk","external_id":null,"external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-03-08 05:13:33","updated_at (GMT)":null}]}';
    resp.data = JSON.parse(resp.data);
    console.log("getUsers successCB: resp ", resp, 
      " table: ", table, " this: ", this
    );
    // Page 3, shows for page:2, but start: 50
    // also multiple clicks are getting registered, 
    // multiple times table is rendering
    // table.page.info = 
    // '{"page":2,"pages":21,"start":50,"end":75,"length":25,"recordsTotal":510,"recordsDisplay":510,"serverSide":false}'

    this.calc(resp);
    res = resp;
    //

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

  getUsers(table?) {
    console.log("BLAH")

    // if no table, then send all default, page=1 & limit=25
    // else, send table data

    let data = {};

    this.genericService.getUsers(data)
    .subscribe(
      (res) => {
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

}
