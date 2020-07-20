/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors} from '@angular/forms';
import { OktaAuthService } from '../../../services/okta.service';
import {DataTableAction } from '../../shared/components/app-data-table/data-table-action';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { take, switchMapTo, tap, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import DataTableUtilsPluginExt from '../../../scripts/data-table/data-table-utils-plugin-ext';

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
    isHideColumns: [ "id"],

    /*isFixedColumn: {
      fixedColumns: {
        leftColumns: 2,
      },
      fixedColumnFunc: (ev, $, table ) => {
        // Util.DataTable.Func
        // DataTableUtilsPluginExt.fixedColumnFunc(ev, $, table);
        let d = new DataTableUtilsPluginExt(ev, $, table).run();
      },
    },*/

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
  orgValue = '';
  orgArr = [];
  orgArrLanding = [];
  isRoot: boolean;
  orgInfo: any;
  hideSubmit: any;
  companyName='';
  @ViewChild('orgName') orgNameEl:ElementRef;
  isForbidden:boolean = false;

  constructor(
      private okta: OktaAuthService,
      private route: ActivatedRoute, private router: Router, private http: Http, private toastr: ToastsManager,
      private element: ElementRef
      ) {

    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const custInfo =  JSON.parse(localStorage.getItem('customerInfo') || '');
    this.orgInfo = custInfo.org;

    console.log('custInfo >>>')
    console.log(custInfo);

    const grp = JSON.parse(groups);
    grp.forEach(function (item) {
      if(item === 'ROOT' || item === 'SUPER_USER' || item === 'SUPPORT') {
        this.isRoot = true;
      }
    }, this);

    this.vendorForm = new FormGroup({
      org: new FormControl('', null),
      external_vendor_id: new FormControl('', Validators.required),
      first_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      company_name: new FormControl('', Validators.required,this.companyValidator()),
      email: new FormControl('', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]),
      address_1: new FormControl('', Validators.required),
      address_2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zip: new FormControl('', [Validators.required, Validators.pattern('^[0-9-]*$')]),
      country: new FormControl('', Validators.required)
    });

    this.vendorModel = {
      org: '',
      external_vendor_id: '',
      first_name: '',
      last_name: '',
      company_name: '',
      email: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      zip: '',
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
    this.searchDataRequest(this.isRoot ? '' : this.orgInfo.org_id);
    this.searchOrgRequest();
  }

  searchOrgRequest() {
    return this.searchOrgData().subscribe(
        response => {
          if (response && response.data) {
            response.data.forEach(function (ele) {
              this.orgArr.push({
                id: ele.org_uuid,
                text: ele.org_name
              });
            }, this);

            this.orgArrLanding = JSON.parse(JSON.stringify(this.orgArr));
            this.orgArrLanding.unshift({ id: '', text: 'All'});

            this.vendorModel.org = this.orgArr[0].id;
            this.vendorForm.patchValue({
              org : this.orgArr[0].id
            });
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

  searchDataRequest(org = null) {
    return this.searchData(org).subscribe(
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
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDataRequest.bind(self, org)
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

  searchData(org) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const obj: any = {};
    if (this.isRoot && org) {
      obj['org_uuid'] = org;
    }
    const dataObj = JSON.stringify(obj);

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors/list';
    return this.http
        .post(url, dataObj, options)
        .map(res => {
          return res.json();
        }).share();
  }

  OnOrgChanged(e: any) {
    if (e.value && e.value !== this.vendorModel.org) {
      this.vendorModel.org = e.value;
    }
  }

  OnOrgLandingChange(e) {
    if (e.value !== this.orgValue) {
      this.orgValue = e.value;
      this.dataObject.isDataAvailable = false;
      this.searchDataRequest(this.orgValue);
    }
  }

  // orgChange(value) {
  //   this.dataObject.isDataAvailable = false;
  //   this.searchDataRequest(value);
  // }

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
    this.vendorModel.org = dataObj.data.org_uuid;
    this.vendorForm.patchValue({
      org : dataObj.data.org_uuid
    });

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
    this.companyName = dataObj.data.company_name;
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
    this.vendorModel.zip = dataObj.data.zip;
    this.vendorForm.patchValue({
      zip : dataObj.data.zip
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

    Swal({
      title: 'Are you sure you want to delete this vendor?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.value) {
        if (dataObj.data.id) {
          if (dataObj.data.id.no_of_orders > 0 && dataObj.data.id.no_of_users) {

            Swal({
              title: 'Vendor Deletion Failed',
              html: 'Vendor cannot be deleted since it has existing order(s) or user(s) associated with it',
              type: 'error'
            }).then( () => {
              // this.router.navigate(['/app/admin/invoices']);
            });

            // if (!this.showError) {
            //   this.showError = true;
            //   this.toastr.error('ERROR!', 'Vendor cannot be deleted since it has existing order(s) or user(s) associated with it');
            //   this.showError = false;
            // }
          } else {
            this.performVendorDeletionRequest(dataObj.data.id);
          }
        }
      }
    });
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
    if (this.isRoot) {
      dataObj.org_uuid = this.vendorModel.org;
    }
    dataObj.external_vendor_id = this.vendorForm.controls['external_vendor_id'].value;
    dataObj.first_name = this.vendorForm.controls['first_name'].value;
    dataObj.last_name = this.vendorForm.controls['last_name'].value;
    dataObj.company_name = this.vendorForm.controls['company_name'].value;
    dataObj.email = this.vendorForm.controls['email'].value;
    dataObj.address_1 = this.vendorForm.controls['address_1'].value;
    dataObj.address_2 = this.vendorForm.controls['address_2'].value;
    dataObj.city = this.vendorForm.controls['city'].value;
    dataObj.state = this.vendorForm.controls['state'].value;
    dataObj.zip = this.vendorForm.controls['zip'].value;
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
            if (response.data) {
              this.hideSubmit = true;
            }
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.performVendorAdditionRequest.bind(self, dataObj)
            );
          } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
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
            Swal({
              title: 'Vendor Deletion Successful',
              html: 'Vendor ' + id + ' successfully deleted',
              type: 'success'
            }).then( () => {
              this.reLoad();
            });

            // this.error = { type : response.body ? 'success' : 'fail' , message : response.body ?  'Vendor successfully deleted ' : 'Vendor ' + ( this.editID ? 'editing' : 'creation' ) + ' failed' };
            // this.editID = '';
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.performVendorDeletionRequest.bind(self, id)
            );
          } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
          } else {

            console.log('err >>')
            console.log(err);

            Swal({
              title: 'Vendor Deletion Failed',
              html: err._body ? JSON.parse(err._body).errorMessage : 'No error definition available',
              type: 'error'
            }).then( () => {
              // this.router.navigate(['/app/admin/invoices']);
            });
            // this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
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
    this.hideSubmit = false;
    this.vendorForm.reset();
    modalComponent.hide();

    if (this.orgArr && this.orgArr.length) {
      this.vendorModel.org = this.orgArr[0].id;
    }

    this.reLoad();
  }

  handleShowModal(modalComponent: PopUpModalComponent) {
    modalComponent.show();
    //setTimeout(() => this.orgNameEl.nativeElement.focus());
  }

  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest(this.isRoot ? this.orgValue : this.orgInfo.org_id);
  }

  validateCompany(company_name){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
        token = AccessToken;
    }
    const obj: any = {};
    obj['company_name'] = company_name;
    const dataObj = JSON.stringify(obj);
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors/valid';
    return this.http
        .post(url, dataObj, options)
        .map(res => {
            return res.json();
        }) .catch((error: any) => {
          if (error.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              error,
              this.validateCompany.bind(self, company_name)
            );
          } else if(error.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
          }
          return Observable.throw(error.status);
      }).share();
   }

   companyValidator(){
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      } else {
        if(this.companyName == control.value){
          return of(null);
        }else{
        return control.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          take(1),
          switchMapTo(this.validateCompany(control.value)),
          tap(() => control.markAsTouched()),
          tap((data)=>console.log("validatorDT",data)),
          map((response: any) => response.validCompanyName==true ? { companyValid: true } : null)
        );
       }
      }
    };
   }
}
