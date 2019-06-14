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
import {DataTableAction } from '../../shared/components/app-data-table/data-table-action';
import {DataTableActionType } from '../../shared/components/app-data-table/data-table-action-type';

@Component({
  selector: 'app-vendormanagement',
  templateUrl: './vendorManagement.component.html',
  styleUrls: ['./vendorManagement.component.scss']
})
export class VendorManagementComponent implements OnInit, DataTableAction  {

  headers: any = [];
  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: Array<DataTableOptions> = [{
    isSearchColumn: true,
    isOrdering: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isDownload: true,
    isRowSelection: true,
    isShowEntries: false,
    isPagination: true,
    isPageLength: 10,
    isEmptyTable: 'No Data',
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

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {

    this.vendorForm = new FormGroup({
      external_vendor_id: new FormControl('', Validators.required),
      first_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      company_name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
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
    this.searchDataRequest();
  }

  searchDataRequest() {
    return this.searchData().subscribe(
        response => {
          if (response) {
            console.log('response >>')
            console.log(response);
            if (response.body) {
              this.showSpinner = false;
              this.populateDataTable(response.body, true);
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

  searchData() {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }

    console.log('AccessToken >>>')
    console.log(AccessToken.accessToken);


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

    if (tableData && tableData.length) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        let header = {
          key: keys[i],
          title: keys[i].replace('_',' ').toUpperCase(),
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: false,
          width: '150'
        }
        this.headers.push(header);
      }

      this.headers.push({
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
            actionName : 'Delete',
            actionType : DataTableActionType.DELETE,
            actionUrl : 'reportid',
            actionIcon : 'fa-trash',
            actionFunc: 'handleDelete'
          }
        ]
      });
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleEdit(rowObj: any, rowData: any) {
    console.log('rowData >>>')
    console.log(rowData);
    this.editID = rowData.id;

    this.vendorModel.external_vendor_id = rowData.external_vendor_id;
    this.vendorForm.patchValue({
      external_vendor_id : rowData.external_vendor_id
    });
    this.vendorModel.first_name = rowData.first_name;
    this.vendorForm.patchValue({
      first_name : rowData.first_name
    });
    this.vendorModel.last_name = rowData.last_name;
    this.vendorForm.patchValue({
      last_name : rowData.last_name
    });
    this.vendorModel.company_name = rowData.company_name;
    this.vendorForm.patchValue({
      company_name : rowData.company_name
    });
    this.vendorModel.email = rowData.email;
    this.vendorForm.patchValue({
      email : rowData.email
    });
    this.vendorModel.address_1 = rowData.address_1;
    this.vendorForm.patchValue({
      address_1 : rowData.address_1
    });
    this.vendorModel.address_2 = rowData.address_2;
    this.vendorForm.patchValue({
      address_2 : rowData.address_2
    });
    this.vendorModel.city = rowData.city;
    this.vendorForm.patchValue({
      city : rowData.city
    });
    this.vendorModel.state = rowData.state;
    this.vendorForm.patchValue({
      state : rowData.state
    });
    this.vendorModel.country = rowData.country;
    this.vendorForm.patchValue({
      country : rowData.country
    });

    this.addVendor.show();

  //  this.router.navigate(['/app/reports/adHocReportBuilder', rowData.id]);
  }

  handleRun(rowObj: any, rowData: any) {
  }

  handleDelete(rowObj: any, rowData: any) {
    console.log('rowData >>>!!!!')
    console.log(rowData);
    if(rowData.id) {
      this.performVendorDeletionRequest(rowData.id);
    }
  }

  handleDownload(rowObj: any, rowData: any) {
  }

  handleEmail(rowObj: any, rowData: any) {
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
            this.error = { type : response.body ? 'success' : 'fail' , message : response.body ?  'Vendor successfully ' + ( this.editID ? 'edited' : 'created' ) : 'Vendor ' + ( this.editID ? 'editing' : 'creation' ) + ' failed' };
            this.editID = '';
          }
        },
        err => {
          if(err.status === 401) {
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.showSpinner = false;
                    this.performVendorAdditionRequest(dataObj);
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

  performVendorAddition(dataObj) {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
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
          console.log('response from vendor deletion >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            this.searchDataRequest();
           // this.error = { type : response.body ? 'success' : 'fail' , message : response.body ?  'Vendor successfully deleted ' : 'Vendor ' + ( this.editID ? 'editing' : 'creation' ) + ' failed' };
           // this.editID = '';
          }
        },
        err => {
          if(err.status === 401) {
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.showSpinner = false;
                    this.performVendorDeletionRequest(id);
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

  performVendorDeletion(id) {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
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
