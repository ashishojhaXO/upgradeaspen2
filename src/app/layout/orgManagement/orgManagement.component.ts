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
import { FormControl, FormGroup, Validators, ValidatorFn, ValidationErrors} from '@angular/forms';
import { OktaAuthService } from '../../../services/okta.service';
import {DataTableAction } from '../../shared/components/app-data-table/data-table-action';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import DataTableUtilsPluginExt from '../../../scripts/data-table/data-table-utils-plugin-ext';

@Component({
  selector: 'app-orgmanagement',
  templateUrl: './orgManagement.component.html',
  styleUrls: ['./orgManagement.component.scss']
})
export class OrgManagementComponent implements OnInit, DataTableAction  {

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
      tooltip: 'Edit Org'
    },
    isDeleteOption: {
      value : false,
      icon : '',
      tooltip: 'Delete Org'
    },
    isAddRow: false,
    isColVisibility: true,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isRowSelection: null,
    isPageLength: true,
    isPagination: true,
    isFixedColumn: {
      fixedColumns: {
        leftColumns: 0,
      },
      fixedColumnFunc: (ev, $, table ) => {
        // Util.DataTable.Func
        // DataTableUtilsPluginExt.fixedColumnFunc(ev, $, table);
        let d = new DataTableUtilsPluginExt(ev, $, table).run();
      },
    },
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 0, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    isOrder: [[2, 'asc']],
    isHideColumns: [ 'ui_metadata']
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  @ViewChild('AddOrg') addOrg: PopUpModalComponent;
  orgForm: FormGroup;
  orgModel: any;
  error: any;
  showSpinner: boolean;
  widget: any;
  editID: any;
  resultStatus: any;
  hideSubmit = false;
  logoFile: any;
  showLogo = false;
  @ViewChild('org_name') org_nameEl:ElementRef;
  defaultColors = {themeColor:'#252425',themeTxtColor:'#eeedef', subMenuColor: '#54575A', subMenuTxtColor:'#eeedef', filterColor:'#54575a',
                  filterTxtColor:'#adadad',primaryBtnColor:'#f06d30',primaryBtnTxtColor:'#fff',secondaryBtnColor:'#ededed',
                  secondaryBtnTxtColor:'#4e9b49' };

  constructor(
      private okta: OktaAuthService,
      private route: ActivatedRoute, private router: Router, private http: Http, private toastr: ToastsManager,
      private element: ElementRef) {

    this.orgForm = new FormGroup({
      org_name: new FormControl('', Validators.required),
      first_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required),
      email_id: new FormControl('', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]),
      alternate_email_id: new FormControl('', [Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]),
      address_1: new FormControl('', Validators.required),
      address_2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zip: new FormControl('', [Validators.required,Validators.pattern('^[0-9-]*$')]),
      country: new FormControl('', Validators.required),
      logo: new FormControl(''),
      themeColor: new FormControl(''),
      themeTxtColor: new FormControl(''),
      subMenuColor: new FormControl(''),
      subMenuTxtColor: new FormControl(''),
      filterColor: new FormControl(''),
      filterTxtColor: new FormControl(''),
      primaryBtnColor: new FormControl(''),
      primaryBtnTxtColor: new FormControl(''),
      secondaryBtnColor: new FormControl(''),
      secondaryBtnTxtColor: new FormControl(''),
      allowCreate: new FormControl(''),
      logoType: new FormControl('')
    }, this.alternateEmailValidator);

    this.orgModel = {
      org_name: '',
      first_name: '',
      last_name: '',
      email_id: '',
      alternate_email_id: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      themeColor: this.defaultColors['themeColor'],
      themeTxtColor: this.defaultColors['themeTxtColor'],
      subMenuColor: this.defaultColors['subMenuColor'],
      subMenuTxtColor: this.defaultColors['subMenuTxtColor'],
      filterColor: this.defaultColors['filterColor'],
      filterTxtColor: this.defaultColors['filterTxtColor'],
      primaryBtnColor: this.defaultColors['primaryBtnColor'],
      primaryBtnTxtColor: this.defaultColors['primaryBtnTxtColor'],
      secondaryBtnColor: this.defaultColors['secondaryBtnColor'],
      secondaryBtnTxtColor: this.defaultColors['secondaryBtnTxtColor'],
      logo: 'https://static.accelitas.io/accelitas_logo_trans.png',
      originalLogo: 'https://static.accelitas.io/accelitas_logo_trans.png',
      allowCreate: true,
      logoType: 'url'
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
    var url = this.api_fs.api + '/api/orgs';
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

  toggleLogo() {
    this.showLogo = !this.showLogo;
  }

  clearLogo(type) {
    if (type === 'url') {
      const logo = this.orgModel.originalLogo;
      this.orgModel.logo = logo;
      this.orgForm.patchValue({
        logo : logo
      });
    } else {
      this.orgModel.logo = '';
    }
  }

  handleEdit(dataObj: any) {
    console.log('rowData >>>')
    console.log(dataObj.data);
    this.editID = dataObj.data.id;

    this.orgModel.org_name = dataObj.data.org_name;
    this.orgForm.patchValue({
      org_name : dataObj.data.org_name
    });
    this.orgModel.first_name = dataObj.data.first_name;
    this.orgForm.patchValue({
      first_name : dataObj.data.first_name
    });
    this.orgModel.last_name = dataObj.data.last_name;
    this.orgForm.patchValue({
      last_name : dataObj.data.last_name
    });
    this.orgModel.email_id = dataObj.data.email_id;
    this.orgForm.patchValue({
      email_id : dataObj.data.email_id
    });
    this.orgModel.alternate_email_id = dataObj.data.alternate_email_id;
    this.orgForm.patchValue({
      alternate_email_id: dataObj.data.alternate_email_id
    });
    this.orgModel.address_1 = dataObj.data.address_1;
    this.orgForm.patchValue({
      address_1 : dataObj.data.address_1
    });
    this.orgModel.address_2 = dataObj.data.address_2;
    this.orgForm.patchValue({
      address_2 : dataObj.data.address_2
    });
    this.orgModel.city = dataObj.data.city;
    this.orgForm.patchValue({
      city : dataObj.data.city
    });
    this.orgModel.state = dataObj.data.state;
    this.orgForm.patchValue({
      state : dataObj.data.state
    });
    this.orgModel.zip = dataObj.data.zip;
    this.orgForm.patchValue({
      zip : dataObj.data.zip
    });
    this.orgModel.country = dataObj.data.country;
    this.orgForm.patchValue({
      country : dataObj.data.country
    });

    const meta = dataObj.data.ui_metadata ? JSON.parse(dataObj.data.ui_metadata.toString().replace(/'/g, '"')) : null;
    if (meta) {
      this.orgModel.logo = meta.logo;
      this.orgModel.originalLogo = meta.logo;
      this.orgModel.themeColor = meta.themeColor;
      this.orgModel.themeTxtColor = meta.themeTxtColor;
      this.orgModel.subMenuColor = meta.subMenuColor;
      this.orgModel.subMenuTxtColor = meta.subMenuTxtColor;
      this.orgModel.filterColor = meta.filterColor;
      this.orgModel.filterTxtColor = meta.filterTxtColor;
      this.orgModel.primaryBtnColor = meta.primaryBtnColor;
      this.orgModel.primaryBtnTxtColor = meta.primaryBtnTxtColor;
      this.orgModel.secondaryBtnColor = meta.secondaryBtnColor;
      this.orgModel.secondaryBtnTxtColor = meta.secondaryBtnTxtColor;
      this.orgModel.allowCreate = typeof this.orgModel.allowCreate === 'string' ? (meta.order_create_enabled === 'true' ? true : false) : meta.order_create_enabled;
      this.orgForm.patchValue({
        allowCreate : typeof this.orgModel.allowCreate === 'string' ? (meta.order_create_enabled === 'true' ? true : false) : meta.order_create_enabled
      });
    }

    this.orgModel.logoType = this.orgModel.logo && (this.orgModel.logo.indexOf('http') !== -1 || this.orgModel.logo.indexOf('https') !== -1) ? 'url' : 'file';
    this.orgForm.patchValue({
      logoType : this.orgModel.logoType
    });

    this.addOrg.show();
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
          this.toastr.error('ERROR!', 'Org cannot be deleted since it has existing order(s) or user(s) associated with it');
          this.showError = false;
        }
      } else {
        this.performOrgDeletionRequest(dataObj.data.id);
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
    dataObj.first_name = this.orgForm.controls['first_name'].value;
    dataObj.last_name = this.orgForm.controls['last_name'].value;
    dataObj.org_name = this.orgForm.controls['org_name'].value;
    dataObj.email_id = this.orgForm.controls['email_id'].value;
    dataObj.alternate_email_id = this.orgForm.controls['alternate_email_id'].value;
    dataObj.address_1 = this.orgForm.controls['address_1'].value;
    dataObj.address_2 = this.orgForm.controls['address_2'].value;
    dataObj.city = this.orgForm.controls['city'].value;
    dataObj.state = this.orgForm.controls['state'].value;
    dataObj.zip = this.orgForm.controls['zip'].value;
    dataObj.country = this.orgForm.controls['country'].value;
    const meta = {
      logo : this.orgModel.logo,
      themeColor: this.orgModel.themeColor,
      themeTxtColor: this.orgModel.themeTxtColor,
      subMenuColor: this.orgModel.subMenuColor,
      subMenuTxtColor: this.orgModel.subMenuTxtColor,
      filterColor: this.orgModel.filterColor,
      filterTxtColor: this.orgModel.filterTxtColor,
      primaryBtnColor: this.orgModel.primaryBtnColor,
      primaryBtnTxtColor: this.orgModel.primaryBtnTxtColor,
      secondaryBtnColor: this.orgModel.secondaryBtnColor,
      secondaryBtnTxtColor: this.orgModel.secondaryBtnTxtColor,
      order_create_enabled: this.orgModel.allowCreate ? 'true' : 'false'
    };

    dataObj.ui_metadata = JSON.stringify(meta);

    console.log('dataObj >>')
    console.log(dataObj);

    this.performOrgAdditionRequest(dataObj);
  }

  performVendorAdditionRequest(dataObj) {
    return this.performVendorAddition(dataObj).subscribe(
        response => {
          console.log('response from vendor creation >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            const existingMessage = this.error.message;
            this.error = { type : response.data ? 'success' : 'fail' , message : existingMessage + (response.data ?  '<br/> Default Vendor successfully ' + ( this.editID ? 'updated' : 'created' ) : ' </br> Default Vendor ' + ( this.editID ? 'editing' : 'creation' ) + ' failed')};
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

  performOrgAdditionRequest(dataObj) {
    return this.performOrgAddition(dataObj).subscribe(
        response => {
          console.log('response from Org creation >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            this.error = { type : response.data ? 'success' : 'fail' , message : response.data ?  'Org successfully ' + ( this.editID ? 'updated' : 'created' ) : 'Org ' + ( this.editID ? 'editing' : 'creation' ) + ' failed' };
            if (response.data) {
              this.hideSubmit = true;
            }
            // if (!this.editID) {
            //   const vendorObj: any = {};
            //   vendorObj.org_uuid = response.data.org_uuid;
            //   vendorObj.external_vendor_id = Math.floor(1000000000 + Math.random() * 9000000000);
            //   vendorObj.first_name = dataObj.first_name;
            //   vendorObj.last_name = dataObj.last_name;
            //   vendorObj.company_name = response.data.org_name;
            //   vendorObj.email = dataObj.email_id;
            //   vendorObj.alternate_email_id = dataObj.alternate_email_id;
            //   vendorObj.address_1 = dataObj.address_1;
            //   vendorObj.address_2 = dataObj.address_2;
            //   vendorObj.city = dataObj.city;
            //   vendorObj.state = dataObj.state;
            //   vendorObj.zip = dataObj.zip;
            //   vendorObj.country = dataObj.country;
            //   this.performVendorAdditionRequest(vendorObj);
            // } else {
            //
            // }
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.performOrgAdditionRequest.bind(self, dataObj)
            );
          } else {
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  performOrgAddition(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);
    const url = this.editID ? this.api_fs.api + '/api/orgs/' + this.editID : this.api_fs.api + '/api/orgs';
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

  performOrgDeletionRequest(id) {
    return this.performOrgDeletion(id).subscribe(
        response => {
          if (response) {
            this.showSpinner = false;
            this.searchDataRequest();
            // this.error = { type : response.body ? 'success' : 'fail' , message : response.body ?  'Org successfully deleted ' : 'Org ' + ( this.editID ? 'editing' : 'creation' ) + ' failed' };
            // this.editID = '';
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.performOrgDeletionRequest.bind(self, id)
            );
          } else {
            this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
            this.showSpinner = false;
          }
        }
    );
  }

  performOrgDeletion(id) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const url = this.api_fs.api + '/api/Orgs/' + id;
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
    this.showLogo = false;
    this.orgForm.reset();
    this.orgModel.logo = 'https://static.accelitas.io/accelitas_logo_trans.png';
    this.orgForm.patchValue({
      logo : 'https://static.accelitas.io/accelitas_logo_trans.png'
    });
    this.orgModel.originalLogo = 'https://static.accelitas.io/accelitas_logo_trans.png';
    this.orgModel.logoType = 'url';
    this.orgForm.patchValue({
      logoType : 'url'
    });
    this.orgModel.allowCreate = true;
    this.orgForm.patchValue({
      allowCreate : true
    });
    this.orgModel.themeColor = this.defaultColors['themeColor'];
    this.orgForm.patchValue({
      themeColor : this.defaultColors['themeColor']
    });
    this.orgModel.themeTxtColor = this.defaultColors['themeTxtColor'];
    this.orgForm.patchValue({
      themeTxtColor : this.defaultColors['themeTxtColor']
    });
    this.orgModel.subMenuColor = this.defaultColors['subMenuColor'];
    this.orgForm.patchValue({
      subMenuColor : this.defaultColors['subMenuColor']
    });
    this.orgModel.subMenuTxtColor = this.defaultColors['subMenuTxtColor'];
    this.orgForm.patchValue({
      subMenuTxtColor : this.defaultColors['subMenuTxtColor']
    });
    this.orgModel.filterColor = this.defaultColors['filterColor'];
    this.orgForm.patchValue({
      filterColor : this.defaultColors['filterColor']
    });
    this.orgModel.filterTxtColor = this.defaultColors['filterTxtColor'];
    this.orgForm.patchValue({
      filterTxtColor : this.defaultColors['filterTxtColor']
    });
    this.orgModel.primaryBtnColor = this.defaultColors['primaryBtnColor'];
    this.orgForm.patchValue({
      primaryBtnColor : this.defaultColors['primaryBtnColor']
    });
    this.orgModel.primaryBtnTxtColor = this.defaultColors['primaryBtnTxtColor'];
    this.orgForm.patchValue({
      primaryBtnTxtColor : this.defaultColors['primaryBtnTxtColor']
    });
    this.orgModel.secondaryBtnColor = this.defaultColors['secondaryBtnColor'];
    this.orgForm.patchValue({
      secondaryBtnColor : this.defaultColors['secondaryBtnColor']
    });
    this.orgModel.secondaryBtnTxtColor = this.defaultColors['secondaryBtnTxtColor'];
    this.orgForm.patchValue({
      secondaryBtnTxtColor : this.defaultColors['secondaryBtnTxtColor']
    });
    modalComponent.hide();
    this.reLoad();
  }

  handleShowModal(modalComponent: PopUpModalComponent) {
    modalComponent.show();
    setTimeout(() => this.org_nameEl.nativeElement.focus());
  }

  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }
  alternateEmailValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    if (this.orgForm) {
      const email = control.value['email_id'];
      const alternateEemailId = control.value['alternate_email_id'];
      return (email && alternateEemailId && email === alternateEemailId) ? { 'alternateEmailMatch': true } : null;
    }
  }

  OnProcessFile(e) {
    this.convertToBase64(e);
  }

  convertToBase64(file): void {
    const __this = this;
    this.logoFile = file;
    const myReader = new FileReader();
    myReader.onloadend = (e) => {
      __this.orgModel.logo = myReader.result;
      console.log('__this.orgModel.logo >>')
      console.log(__this.orgModel.logo);
    };
    myReader.readAsDataURL(file);
  }

}

