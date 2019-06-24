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

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss']
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
    isDownload: true,
    isRowSelection: null,
    isPageLength: true,
    isPagination: true
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  @ViewChild('AddUser') addUser: PopUpModalComponent;
  userForm: FormGroup;
  userModel: any;
  selectedSource: any;
  selectedVendor: any;
  error: any;
  showSpinner: boolean;

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
  widget: any;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {

    this.userForm = new FormGroup({
      email: new FormControl('', Validators.required),
      first: new FormControl('', Validators.required),
      last: new FormControl('', Validators.required)
    });

    this.userModel = {
      email: '',
      first: '',
      last: ''
    };

  }

  ngOnInit() {

    this.widget = this.okta.getWidget();
    this.showSpinner = true;
    this.selectedSource = 'f7';
    this.height = '50vh';
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchDataRequest();
  }

  searchDataRequest() {
    return this.searchData().subscribe(
        response => {
          if (response) {
            console.log('response >>')
            console.log(JSON.stringify(response));
            if (response.body) {
              this.showSpinner = false;
              this.populateDataTable(response.body, true);
              return this.getVendors().subscribe(
                  response1 => {
                    console.log('response1');
                    console.log(JSON.stringify(response1));
                    if (response1 && response1.body) {
                      const vendorOptions = [];
                      response1.body.forEach(function (item) {
                        vendorOptions.push({
                          id: item.id,
                          text: item.external_vendor_id + ' - ' + item.company_name
                        });
                      });
                      this.vendorOptions = vendorOptions;
                      if(response1.body.length) {
                        this.selectedVendor = response1.body[0].id;
                      }
                    }
                  },
                  err1 => {

                    if(err1.status === 401) {
                      if(this.widget.tokenManager.get('accessToken')) {
                        this.widget.tokenManager.refresh('accessToken')
                            .then(function (newToken) {
                              this.widget.tokenManager.add('accessToken', newToken);
                              this.showSpinner = false;
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
              )
            }
          }
        },
        err => {

          if(err.status === 401) {
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.showSpinner = false;
                    this.searchDataRequest();
                  })
                  .catch(function (err1) {
                    console.log('error >>')
                    console.log(err1);
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

  getVendors() {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
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
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
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
    console.log(this.gridData);
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
    dataObj.source = this.selectedSource;
    if (this.selectedSource === 'vendor') {
      dataObj.vendor_id = this.selectedVendor;
    }

    this.performUserAdditionRequest(dataObj);
  }

  performUserAdditionRequest(dataObj) {
    return this.performUserAddition(dataObj).subscribe(
        response => {
          console.log('response from user creation >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            this.error = { type : 'success' , message : response.body };
          }
          // modalComponent.hide();
        },
        err => {

          if(err.status === 401) {
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.showSpinner = false;
                    this.performUserAdditionRequest(dataObj);
                  })
                  .catch(function (err1) {
                    console.log('error >>')
                    console.log(err1);
                  });
            } else {
              this.widget.signOut(() => {
                this.widget.tokenManager.remove('accessToken');
                window.location.href = '/login';
              });
            }
          } else {
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  performUserAddition(dataObj) {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
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
    modalComponent.show();
  }
}
