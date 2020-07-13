/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import {FormControl, FormGroup, Validators, FormArray, ValidatorFn} from '@angular/forms';
import{PopUpModalComponent} from "../../shared/components/pop-up-modal/pop-up-modal.component";
import { OktaAuthService } from '../../../services/okta.service';
import { OrganizationService} from '../../../services';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import swal from 'sweetalert2';
import DataTableUtilsPluginExt from "../../../scripts/data-table/data-table-utils-plugin-ext";

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit  {

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

    // NOTE: FixedColumn's Structure Changed
    isFixedColumn: {
      fixedColumns: {
        leftColumns: 1,
      },
      changeFixedColumnData: (ev, $, table) => {
        // HACK: If Last page, a hack to avoid the DataTables 'anCells' error
        if(table.page.info().page+1 == table.page.info().pages) {
          let d = new DataTableUtilsPluginExt(ev, $, table).hideSticky();
        } else {
          let d = new DataTableUtilsPluginExt(ev, $, table).showSticky();
          table.fixedColumns().update();
        }
      },
      fixedColumnFunc: (ev, $, table ) => {
        // Util.DataTable.Func
        // DataTableUtilsPluginExt.fixedColumnFunc(ev, $, table);
        let d = new DataTableUtilsPluginExt(ev, $, table).run();
      },
      fixedColumnFilterToggle: ($, table) => {
        new DataTableUtilsPluginExt(null, $, table).attachClickInputSearch();
      }
    },

  }];
  dashboard: any;
  api_fs: any;
  @ViewChild('AddPayment') addPayment: PopUpModalComponent;
  externalAuth: any;
  showSpinner: boolean;
  summary = [];
  widget: any;
  paymentForm:FormGroup;
  newForm: boolean = true;
  paymentFormNew:FormGroup;
  organizations = [];
  payeeArr = [];
  selectedPayee : any = '';
  selectedOrg : any;
  selectedVendor: any;
  vendors= [];
  InvoiceArr = [];
  selectedInvoice: any = '';
  selectedStatus: any;
  selectedPaymentMethod: any;
  error: any;
  paymentModel : any;
  lineItemInvoice: any;
  lineItemPartial = [];
  totalPayment: number;
  verifyLineAmount: number;
  verifyLineAmountError: boolean = false;
  verifyLineItemPartialInputArr: boolean = false;
  statusOptions = [
    {
      id: 'FAILED',
      text: 'FAILED'
    },
    {
      id: 'FUNDED',
      text: 'FUNDED'
    },
    {
      id: 'INVOICE SUBMITTED',
      text: 'INVOICE SUBMITTED'
    },
    {
      id: 'PAYMENT_SENT',
      text: 'PAYMENT SENT'
    },
    {
      id: 'PENDING',
      text: 'PENDING'
    }];

    paymentMethodOptions = [

      {
        id: 'BILL PAY',
        text: 'BILL PAY'
      },
      {
        id: 'CHECK',
        text: 'CHECK'
      },
      {
        id: 'WIRE',
        text: 'WIRE'
      }];
  //@ViewChild('searchField') searchField: ElementRef;
  matchingResults = [];
  inSearchMode: boolean = false;
  dropList: boolean = false;
  payeeObject: any;
  isRoot: boolean;
  orgArr = [];
  orgValue = '';
  isForbidden:boolean = false;

  constructor(private okta: OktaAuthService, private organizationService: OrganizationService, private route: ActivatedRoute, private router: Router, private http: Http) {
    this.paymentForm = new FormGroup({
      memo: new FormControl('', Validators.required),
      amount: new FormControl('', [Validators.required, Validators.pattern(/^(0|[1-9]\d*)(\.\d+)?$/)]),
      invoiceRequestId: new FormControl(''),
      type: new FormControl('', Validators.required)
    });

    this.paymentFormNew = new FormGroup({
      payeeName: new FormControl('', Validators.required),
      paymentInvoice: new FormControl('', Validators.required),
      payPartialCheck: new FormControl(''),
      payPartialInput: new FormControl('', [this.checkZero, this.checkPartialPay(this.totalPayment,false).bind(this)]),
      lineItemPartialInputArr: new FormArray([]),
      searchcontentInput: new FormControl('')
    })
    this.paymentModel= {
      memo: '',
      amount: '',
      invoiceRequestId: '',
      type: ''
    };
  }

  ngOnInit() {

    this.widget = this.okta.getWidget();
    this.showSpinner = true;
    this.height = '50vh';
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const grp = JSON.parse(groups);
    grp.forEach(function (item) {
      if(item === 'ROOT' || item === 'SUPER_USER' || item === 'SUPPORT') {
        this.isRoot = true;
      }
    }, this);

    this.searchDataRequest();
    this.getOrganizations();
    this.searchOrgRequest();
    console.log(this.selectedStatus);
    this.paymentFormNew.controls['payPartialCheck'].valueChanges.subscribe(change => {
      console.log('tick change', change);
      if(change === false){
        this.paymentFormNew.controls['payPartialInput'].setValue('');
        this.verifyLineAmountError = false;
        this.verifyLineItemPartialInputArr = false;
        const control = <FormArray>this.paymentFormNew.controls['lineItemPartialInputArr'];
        for(let i = control.length-1; i >= 0; i--) {
            control.removeAt(i);
        }
      }else if(change){
        this.getInvoiceItems(this.selectedInvoice);
      }
    });
  }

  OnOrgChange(e) {
    if (e.value !== this.orgValue) {
      this.orgValue = e.value;
      this.dataObject.isDataAvailable = false;
      this.searchDataRequest(this.orgValue);
    }
  }

  onSearchChange(e){
    //console.log('onSearchChange: ', e);
    this.matchingResults = [];
    this.inSearchMode = true;
    this.dropList = true;
    if (!e) {
        this.inSearchMode = false;
        return;
    }
    this.getFilteredInvoices(e).subscribe(
      response => {
          if (response && response.body && response.body.length) {
              this.matchingResults = response.body;
              //console.log('matching results>>>>>>>>', this.matchingResults);
          }else{
            this.matchingResults = [];
          }
          this.inSearchMode = false;
      },
      err => {
      }
    );
  }

  OnSearchSelect(e: any): void {

    //console.log('OnSearchSelect: from selecting e >>>', e);
    this.matchingResults = [];
    this.dropList = false;
    this.inSearchMode = false;
    this.paymentFormNew.controls['searchcontentInput'].setValue(e.invoice_number);
    const invoices= {
      id : e.id,
      text: e.invoice_number,
      date: e.date,
      tamount: e.total_amount,
      lineItem: e.ap_invoice_line_items
    };
    this.selectedInvoice = invoices;
    this.getInvoiceItems(invoices);
    const __this = this;
    setTimeout(function () {
        __this.showSpinner = false;
    }, 100);
}

  searchDataRequest(org = null) {
    return this.searchData(org).subscribe(
        response => {
          if (response) {
            console.log('response >>>')
            console.log(response);
            if (response.body) {
              if (response.body.summary) {
                this.summary = response.body.summary;
              }
              if (response.body.transactions) {
                this.populateDataTable(response.body.transactions, true);
              }
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

  searchData(org = null) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/transactions' + ( this.isRoot ? ('?org_uuid=' + org) : '');
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

    if (tableData.length) {
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

  handleShowModal(modalComponent: PopUpModalComponent)
  {
    modalComponent.show();
    this.getPayees();
  }
  handleCloseModal(modalComponent: PopUpModalComponent) {
    this.error = '';

    this.selectedOrg = this.organizations[0].id;
    this.getVendors(this.selectedOrg);
    this.selectedStatus = this.statusOptions[0].id;
    this.selectedPaymentMethod = this.paymentMethodOptions[0].id;

    this.paymentModel.memo = '';
    this.paymentForm.patchValue({
      memo : ''
    });

    this.paymentModel.type = '';
    this.paymentForm.patchValue({
      type : ''
    });

    this.paymentModel.amount = '';
    this.paymentForm.patchValue({
      amount : ''
    });

    this.paymentModel.invoiceRequestId = '';
    this.paymentForm.patchValue({
      invoiceRequestId : ''
    });
    modalComponent.hide();
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();

  }

  searchOrgRequest() {
    return this.searchOrgData().subscribe(
        response => {
          if (response && response.data) {
            this.orgArr.push({
              id: '',
              text: 'All'
            })
            response.data.forEach(function (item) {
              this.orgArr.push({
                id: item.org_uuid,
                text: item.org_name
              });
            }, this);
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
              } else if(err.status === 403) {
                  this.isForbidden = true;
                  this.showSpinner = false;
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

  getOrganizations() {
    this.getAllOrganizations().subscribe(
      response => {
        if(response)
        {
          if(response.data.length > 0)
          {
            const organizations = [];

            _.forEach(response.data, organization => {

              organizations.push({
                id : organization.id,
                text: organization.name
              }
              );

            });

            this.organizations = _.sortBy(organizations,'text');
          }
        }
      },
      err => {

        if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getOrganizations.bind(self)
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

  getPayees(){
    this.getAllPayees().subscribe(
      response => {
        //console.log('getPayees: payeeresponse>>>>>>>', response)
        if(response)
        {
          if(response.body.length > 0)
          {
            const payees = [];

            _.forEach(response.body, payee => {

              payees.push({
                id : payee.id,
                text: payee.name,
                type: payee.type
              }
              );
            });
            this.payeeArr = _.sortBy(payees,'text');
            //console.log('payeeArr: payee arr', this.payeeArr);
          }
          else{
            this.payeeArr=[];
          }
        }
      },
      err => {

        if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getPayees.bind(self)
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
  getAllPayees(){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/payee';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
    }).share();
  }

  getVendors(orgid: any){
   return this.getVendorsByOrg(orgid).subscribe(
      response => {
        if((response)&&(response.body)&&(response.body.data))
        {
          if(response.body.data.length > 0)
          {
            const vendors = [];

            _.forEach(response.body.data, vendor => {

              vendors.push({
                id : vendor.id,
                text: vendor.name
              }
              );

            });

            this.vendors = _.sortBy(vendors,'text');
          }
        }
      },
      err => {
        if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getVendors.bind(self, orgid)
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

  getFilteredInvoices(match) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
        token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/invoices/search?invoice_number=' + match + '&payee_id=' + this.selectedPayee;
    return this.http
        .get(url, options)
        .map(res => {
            return res.json();
        }).share();
  }

  getInvoiceItems(invoiceObj: any){
    //console.log('getInvoiceItems: ',invoiceObj,'lineitempartial', this.lineItemPartial,"from here");
    this.lineItemInvoice = invoiceObj;
    this.totalPayment = +invoiceObj.tamount;
    this.paymentFormNew.setControl('lineItemPartialInputArr', new FormArray([]));
    this.lineItemPartial = invoiceObj.lineItem;
    //console.log('getInvoiceItems: ',this.lineItemPartial, this.paymentFormNew.get('payPartialCheck').value, this.totalPayment)
    for(let line of this.lineItemPartial){
      //console.log('getInvoiceItems: line',line);
      (<FormArray>this.paymentFormNew.get('lineItemPartialInputArr')).push(
        new FormControl(null,[this.checkZero, this.checkPartialPay(line.amount,true)])
      )
    }
  }

  getVendorsByOrg(orgid: any){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken;
      token = AccessToken;
    }

    console.log('AccessToken >>>')
    console.log(AccessToken);

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors/vendor-by-orgid?orgid=' + orgid;
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }

  getAllOrganizations(){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken;
      token = AccessToken;
    }

    console.log('AccessToken >>>')
    console.log(AccessToken);

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/vendors/orgs';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }
  OnOrgChanged(e: any): void {
    if (this.selectedOrg !== e.value ) {
      this.selectedOrg = e.value;
      this.getVendors(this.selectedOrg);
    }
  }
  OnPayeeChanged(e: any): void {
    if (this.selectedPayee !== e.value ) {
      this.paymentFormNew.controls['searchcontentInput'].setValue('');
      this.clearSearch();
      this.selectedPayee = e.value;
      const payeeObject = this.payeeArr.find(x => x.id === +e.value);
      this.payeeObject = {
        id: payeeObject.id,
        name: payeeObject.text,
        type: payeeObject.type
      }
    }
  }

  OnVendorChanged(e: any): void {
    if (this.selectedVendor !== e.value ) {
      this.selectedVendor = e.value;

    }
  }
  // onInvoiceChange(e: any): void {
  //   if(this.selectedInvoice !=e.value ){
  //     this.selectedInvoice = e.value;
  //     console.log('********selected invoice',this.selectedInvoice);
  //     const invoice = _.find(this.InvoiceArr, { 'id' : +this.selectedInvoice});
  //     this.getInvoiceItems(invoice);
  //   }
  // }

  OnStatusChanged(e: any): void {
    if (this.selectedStatus !== e.value ) {
      this.selectedStatus = e.value;

    }
  }

  OnPaymentMethodChanged(e: any): void {
    if (this.selectedPaymentMethod !== e.value ) {
      this.selectedPaymentMethod = e.value;

    }
  }


  OnSubmit(modalComponent: PopUpModalComponent) {
    this.showSpinner = true;
    this.error = '';
    const dataObj: any = {};

    dataObj.type = this.paymentForm.controls['type'].value;
    dataObj.vendor_id = this.selectedVendor;
    dataObj.customer_id = this.selectedOrg;
    dataObj.invoice_amount =  this.paymentForm.controls['amount'].value;
    dataObj.invoice_status = this.selectedStatus;
    dataObj.invoice_comments = this.paymentForm.controls['memo'].value;
    dataObj.invoice_request_id = this.paymentForm.controls['invoiceRequestId'].value;
    if(this.paymentForm.controls['type'].value == 'ap'){
    dataObj.payment_method = this.selectedPaymentMethod;
    }

    console.log("dataobj:" + dataObj);
    this.createTransactionRequest(dataObj);
  }

  createTransactionRequest(dataObj) {
    return this.createTransaction(dataObj).subscribe(
        response => {
          console.log('response from create transaction >>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;

            this.error = { type : response.body ? 'success' : 'fail' , message : response.body ?  'Transaction successfully created' : 'Transaction creation failed' };

          }

        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.createTransactionRequest.bind(self, dataObj)
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

  createTransaction(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);
    const url = this.api_fs.api + '/api/payments/transactions';
    return this.http
      .post(url, data, options)
      .map(res => {
        return res.json();
      }).share();
  }

  handleRowSelection(rowObj: any, rowData: any) {

  }

  checkPartialPay(totalPayment: number, line: boolean): ValidatorFn {
    return (control: FormControl): { [key: string]: boolean } | null => {
      if(line){
        if(totalPayment < control.value){
          return  {'partialExceeds': true}
        }
      }
      else{
        if(this.totalPayment < control.value){
          return  {'partialExceeds': true}
        }
      }
    }
  }

  checkZero(control: FormControl): {[s:string]:boolean} {
    if(!(+control.value)){
      return {'negativeNumber': true}
    }
  }

  newFormSubmit(modalComponent: PopUpModalComponent){
    if(this.paymentFormNew.get('payPartialCheck').value){
      this.verifyLineAmountError = false;
      this.verifyLineItemPartialInputArr = false;
      const formValue = this.paymentFormNew.value;
      if(!(+formValue.payPartialInput)){
        this.verifyLineItemPartialInputArr = true;
        return false;
      }
      const lineItemPartial = []
      this.verifyLineAmount = 0;
      for(let i=0; i < this.lineItemPartial.length; i++){
        lineItemPartial.push({
          id : this.lineItemPartial[i].line_item_id,
          amount : +formValue.lineItemPartialInputArr[i],
          units: this.lineItemPartial[i].units,
          quantity: this.lineItemPartial[i].quantity
        })
        if(!(+formValue.lineItemPartialInputArr[i])){
          this.verifyLineItemPartialInputArr = true;
          return false;
        }
        this.verifyLineAmount += +formValue.lineItemPartialInputArr[i];
      }
      if(this.verifyLineAmount > +formValue.payPartialInput){
        this.verifyLineAmountError = true;
      }else{
        // setting legacy: true so the payment --> create transaction functionality do not break with invoice functionality
        const formData = {
          legacy: true,
          payee: this.payeeObject,
          invoice: {
            number: this.lineItemInvoice.text,
            date: this.lineItemInvoice.date.split("T")[0],
            amount: this.paymentFormNew.get('payPartialInput').value
          },
          line_items: lineItemPartial
        }
        this.updateAp(formData, modalComponent);
        // console.log('new form submit', formData);
      }
    }else{
      const lineItemPartial = []
      for(let i=0; i < this.lineItemPartial.length; i++){
        lineItemPartial.push({
          id : this.lineItemPartial[i].line_item_id,
          amount : +this.lineItemPartial[i].amount,
          units: this.lineItemPartial[i].units,
          quantity: this.lineItemPartial[i].quantity
        })
      }
      const formData = {
        legacy: true,
        payee: this.payeeObject,
        invoice: {
          number: this.lineItemInvoice.text,
          date: this.lineItemInvoice.date.split("T")[0],
          amount: this.lineItemInvoice.tamount
        },
        line_items: lineItemPartial
      }
      this.updateAp(formData, modalComponent);
      //console.log('new form submit', formData);
    }
  }
  clearSearch() {
    this.paymentFormNew.controls['searchcontentInput'].setValue('');
    this.paymentFormNew.controls['payPartialCheck'].setValue('');
    this.paymentFormNew.controls['payPartialInput'].setValue('');
    this.selectedPayee = null;
    this.lineItemInvoice = null;
    this.matchingResults = [];
    this.inSearchMode = false;
  }

  updateAp(formData, modalComponent){
    this.updateApService(formData).subscribe(
      response => {
        //console.log('updateAp: payeeresponse>>>>>>>', response)
        if(response)
        {
          if(response.status === 200)
          {
            //console.log('success');
            swal({
              title: 'Success',
              text: 'Transaction Successful',
              type: 'success'
            }).then( ()=> {
              this.closeModal(modalComponent);
              }
            )
          }
          else{
            swal({
              title: 'Error',
              text: response.errorMessage,
              type: 'warning'
            });
            //console.log(response.errorMessage);
          }
        }
      },
      err => {
        if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.updateAp.bind(self, formData, modalComponent)
            );

          } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
          } else {
          this.error = { type : 'fail' , message : JSON.parse(err._body).errorMessage};
          swal({
            title: 'Error',
            text: err._body ? (err._body.indexOf(':') !== -1 ? err._body.split(':')[1] : err._body) : 'An Error occurred',
            type: 'error'
          });
          console.log(this.error);
          this.showSpinner = false;
        }
      }
    );
  }
  updateApService(formData){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(formData);
    var url = this.api_fs.api + '/api/payments/transactions';
    return this.http
      .post(url, data, options)
      .map(res => {
        return res.json();
    }).share();
  }
  closeModal(modalComponent: PopUpModalComponent){
    this.clearSearch();
    this.payeeArr = [];
    modalComponent.hide();
  }
  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }

  handleActions(ev: any) {
    // const action = $(ev.elem).data('action');
    const action = ev.event ? ev.event : $(ev.elem).data('action');

    if(this[action]) {
      this[action](ev);
    } else {
      // Some problem
      // Function does not exists in this class, if data-action string is correct
      // Else if all functions exists, then, data-action string coming from html is not correct
      console.log(`Error: Function yet to be implemented: ${action}`)
    }
  }

}
