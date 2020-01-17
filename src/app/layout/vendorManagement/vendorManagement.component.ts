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
  selector: 'app-vendormanagement',
  templateUrl: './vendorManagement.component.html',
  styleUrls: ['./vendorManagement.component.scss']
})
export class VendorManagementComponent implements OnInit, DataTableAction  {

  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  showError: boolean;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: {
      value : true,
      icon : '',
      tooltip: 'Edit Vendor'
    },
    isDeleteOption: {
      value : true,
      icon : '',
      tooltip: 'Delete Vendor'
    },
    isAddRow: false,
    isColVisibility: true,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isRowSelection: null,
    isPageLength: true,
    isPagination: true,
    isTree: true,
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 1, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    isOrder: [[2, 'asc']],
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  @ViewChild('AddVendor') addVendor: PopUpModalComponent;
  vendorForm: FormGroup;
  vendorModel: any;
  error: any;
  showSpinner: boolean;
  widget: any;
  editID: any;
  resultStatus: any;

  constructor(
    private okta: OktaAuthService,
    private route: ActivatedRoute, private router: Router, private http: Http, private toastr: ToastsManager) {

    this.vendorForm = new FormGroup({
      external_vendor_id: new FormControl('', Validators.required),
      first_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      company_name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]),
      address_1: new FormControl('', Validators.required),
      address_2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required)
    });

    this.vendorModel = {
      external_vendor_id: '',
      first_name: '',
      last_name: '',
      company_name: '',
      email: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      country: ''
    };

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
            if (response && response.length) {
              this.showSpinner = false;
              this.populateDataTable(response, true);
            } else {
              this.resultStatus = 'No data found'
              this.showSpinner = false;
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
                    this.searchDataRequest();
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

  searchData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors';
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

  handleEdit(dataObj: any) {
    console.log('rowData >>>')
    console.log(dataObj.data);
    this.editID = dataObj.data.id;

    this.vendorModel.external_vendor_id = dataObj.data.external_vendor_id;
    this.vendorForm.patchValue({
      external_vendor_id : dataObj.data.external_vendor_id
    });
    this.vendorModel.first_name = dataObj.data.first_name;
    this.vendorForm.patchValue({
      first_name : dataObj.data.first_name
    });
    this.vendorModel.last_name = dataObj.data.last_name;
    this.vendorForm.patchValue({
      last_name : dataObj.data.last_name
    });
    this.vendorModel.company_name = dataObj.data.company_name;
    this.vendorForm.patchValue({
      company_name : dataObj.data.company_name
    });
    this.vendorModel.email = dataObj.data.email;
    this.vendorForm.patchValue({
      email : dataObj.data.email
    });
    this.vendorModel.address_1 = dataObj.data.address_1;
    this.vendorForm.patchValue({
      address_1 : dataObj.data.address_1
    });
    this.vendorModel.address_2 = dataObj.data.address_2;
    this.vendorForm.patchValue({
      address_2 : dataObj.data.address_2
    });
    this.vendorModel.city = dataObj.data.city;
    this.vendorForm.patchValue({
      city : dataObj.data.city
    });
    this.vendorModel.state = dataObj.data.state;
    this.vendorForm.patchValue({
      state : dataObj.data.state
    });
    this.vendorModel.country = dataObj.data.country;
    this.vendorForm.patchValue({
      country : dataObj.data.country
    });

    this.addVendor.show();

  //  this.router.navigate(['/app/reports/adHocReportBuilder', rowData.id]);
  }

  handleRun(rowObj: any, rowData: any) {
  }

  handleDelete(dataObj: any) {
    // console.log('rowData >>>!!!!')
    // console.log(rowData);

    console.log('dataObj >>')
    console.log(dataObj);

    if (dataObj.data.id) {
      if (dataObj.data.id.no_of_orders > 0 && dataObj.data.id.no_of_users) {
        if (!this.showError) {
          this.showError = true;
          this.toastr.error('ERROR!', 'Vendor cannot be deleted since it has existing order(s) or user(s) associated with it');
          this.showError = false;
        }
      } else {
        this.performVendorDeletionRequest(dataObj.data.id);
      }
    }
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
    const dataObj: any = {};
    dataObj.external_vendor_id = this.vendorForm.controls['external_vendor_id'].value;
    dataObj.first_name = this.vendorForm.controls['first_name'].value;
    dataObj.last_name = this.vendorForm.controls['last_name'].value;
    dataObj.company_name = this.vendorForm.controls['company_name'].value;
    dataObj.email = this.vendorForm.controls['email'].value;
    dataObj.address_1 = this.vendorForm.controls['address_1'].value;
    dataObj.address_2 = this.vendorForm.controls['address_2'].value;
    dataObj.city = this.vendorForm.controls['city'].value;
    dataObj.state = this.vendorForm.controls['state'].value;
    dataObj.country = this.vendorForm.controls['country'].value;

    this.performVendorAdditionRequest(dataObj);
  }

  performVendorAdditionRequest(dataObj) {
    return this.performVendorAddition(dataObj).subscribe(
        response => {
          console.log('response from vendor creation >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            this.error = { type : response.data ? 'success' : 'fail' , message : response.data ?  'Vendor successfully ' + ( this.editID ? 'updated' : 'created' ) : 'Vendor ' + ( this.editID ? 'editing' : 'creation' ) + ' failed' };
          }
        },
        err => {
          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    this.showSpinner = false;
                    this.performVendorAdditionRequest(dataObj);
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
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  performVendorAddition(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);
    const url = this.editID ? this.api_fs.api + '/api/vendors/' + this.editID : this.api_fs.api + '/api/vendors';
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

  performVendorDeletionRequest(id) {
    return this.performVendorDeletion(id).subscribe(
        response => {
          if (response) {
            this.showSpinner = false;
            this.searchDataRequest();
           // this.error = { type : response.body ? 'success' : 'fail' , message : response.body ?  'Vendor successfully deleted ' : 'Vendor ' + ( this.editID ? 'editing' : 'creation' ) + ' failed' };
           // this.editID = '';
          }
        },
        err => {
          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    this.showSpinner = false;
                    this.performVendorDeletionRequest(id);
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
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  performVendorDeletion(id) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const url = this.api_fs.api + '/api/vendors/' + id;
    return this.http
        .delete(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  handleCloseModal(modalComponent: PopUpModalComponent) {
    this.error = '';
    this.editID = '';

    this.vendorModel.external_vendor_id = '';
    this.vendorForm.patchValue({
      external_vendor_id : ''
    });
    this.vendorModel.first_name = '';
    this.vendorForm.patchValue({
      first_name : ''
    });
    this.vendorModel.last_name = '';
    this.vendorForm.patchValue({
      last_name : ''
    });
    this.vendorModel.company_name = '';
    this.vendorForm.patchValue({
      company_name : ''
    });
    this.vendorModel.email = '';
    this.vendorForm.patchValue({
      email : ''
    });
    this.vendorModel.address_1 = '';
    this.vendorForm.patchValue({
      address_1 : ''
    });
    this.vendorModel.address_2 = '';
    this.vendorForm.patchValue({
      address_2 : ''
    });
    this.vendorModel.city = '';
    this.vendorForm.patchValue({
      city : ''
    });
    this.vendorModel.state = '';
    this.vendorForm.patchValue({
      state : ''
    });
    this.vendorModel.country = '';
    this.vendorForm.patchValue({
      country : ''
    });

    modalComponent.hide();
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }

  handleShowModal(modalComponent: PopUpModalComponent) {
    modalComponent.show();
  }
}
