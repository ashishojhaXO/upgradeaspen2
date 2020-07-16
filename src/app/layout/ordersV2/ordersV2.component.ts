/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import {Component, OnInit, Input, ViewChild, HostListener} from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import Swal from 'sweetalert2';
import { GenericService } from '../../../services/generic.service';
import { AppPopUpComponent } from '../../shared/components/app-pop-up/app-pop-up.component';
import { PopUpModalComponent } from '../../shared/components/pop-up-modal/pop-up-modal.component';
import { modalConfigDefaults } from 'ngx-bootstrap/modal/modal-options.class';

import { CsvService } from '../../../services/csv';
import {ToasterService} from 'angular2-toaster';
import {moment} from 'ngx-bootstrap/chronos/test/chain';
import DataTableColumnSearchPluginExt from '../../../scripts/data-table/data-table-search-plugin-ext';
import DataTableUtilsPluginExt from '../../../scripts/data-table/data-table-utils-plugin-ext';

@Component({
  selector: 'app-orders-v2',
  templateUrl: './ordersV2.component.html',
  styleUrls: ['./ordersV2.component.scss'],
  providers: [GenericService, AppPopUpComponent],
})
export class OrdersV2Component implements OnInit  {

  draftItems = [];
  newItems = [];
  paymentReceivedItems = [];
  inProgressItems = [];
  completedItems = [];
  availableBalance = 0;
  pendingAR = 0;
  pendingAP = 0;
  totalDraftAmount = 0;
  totalNewAmount = 0;
  totalPaymentReceivedAmount = 0;
  totalCompletedAmount = 0;

  height: any;
  isRoot: boolean;
  isUser: boolean;
  orgArr = [];
  orgValue = '';
  select2Options = {
    // placeholder: { id: '', text: 'Select organization' }
  };
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  selectedOrder: any;
  hideSummary: any;
  allowOrderFunctionality: any;
  hasTemplates = false;
  private toaster: any;
  selectedUserUuid: any;
  resultStatus: any;

  constructor(
      private okta: OktaAuthService,
      private route: ActivatedRoute,
      private router: Router,
      protected genericService: GenericService,
      protected popUp: AppPopUpComponent,
      private http: Http,
      toasterService: ToasterService) {
    this.toaster = toasterService;
  }

  ngOnInit() {



    // this.draftItems.push({
    //   orderNum : '149-23-739',
    //   orderDate: 'Jul 10,2020',
    //   orderAmount: '$5,000.00',
    //   orderCampaign: 'BMW Campaign - Facebook',
    //   orderPlacedBy: 'Steve Mathews',
    //   entityType: 'Vendor'
    // })
    // this.draftItems.push({
    //   orderNum : '873-44-484',
    //   orderDate: 'Jul 6,2020',
    //   orderAmount: '$15,000.00',
    //   orderCampaign: 'Levis - Google',
    //   orderPlacedBy: 'Dam Vin',
    //   entityType: 'User'
    // })


    // this.newItems.push({
    //   orderNum : '454-22-444',
    //   orderDate: 'Jun 29,2020',
    //   orderAmount: '$3,000.00',
    //   orderCampaign: 'Goyo - Pinterest',
    //   orderPlacedBy: 'Gam bit',
    //   entityType: 'Vendor'
    // })
    // this.newItems.push({
    //   orderNum : '342-54-234',
    //   orderDate: 'Jun 30,2020',
    //   orderAmount: '$2,000.00',
    //   orderCampaign: 'Steve Maiden - Facebook',
    //   orderPlacedBy: 'Steve Staller',
    //   entityType: 'User'
    // })

    // this.paymentReceivedItems.push({
    //   orderNum : '430-49-0394',
    //   orderDate: 'Jun 25,2020',
    //   orderAmount: '$10,000.00',
    //   orderCampaign: 'Apple Inc - Facebook',
    //   orderPlacedBy: 'Tim Cook',
    //   entityType: 'Vendor'
    // })
    // this.paymentReceivedItems.push({
    //   orderNum : '223-54-123',
    //   orderDate: 'Jun 21,2020',
    //   orderAmount: '$30,000.00',
    //   orderCampaign: 'OTUS - Google',
    //   orderPlacedBy: 'Samual Jackson',
    //   entityType: 'Vendor'
    // })

    // this.inProgressItems.push({
    //   orderNum : '882-23-234',
    //   orderDate: 'Jun 1,2020',
    //   orderAmount: '$3,200.00',
    //   orderCampaign: 'Ford Inc - Google',
    //   orderPlacedBy: 'Henry Ford',
    //   entityType: 'User'
    // })
    // this.inProgressItems.push({
    //   orderNum : '536-23-121',
    //   orderDate: 'Jun 2,2020',
    //   orderAmount: '$100,000.00',
    //   orderCampaign: 'Accenture Inc - Google',
    //   orderPlacedBy: 'Arial Dacosta',
    //   entityType: 'Vendor'
    // })
    //
    // this.completedItems.push({
    //   orderNum : '122-78-239',
    //   orderDate: 'May 25,2020',
    //   orderAmount: '$2,800.00',
    //   orderCampaign: 'Massive Inc - Pinterest',
    //   orderPlacedBy: 'Kapolu Mas',
    //   entityType: 'Vendor'
    // });

    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const grp = JSON.parse(groups);

    console.log('grp >>>')
    console.log(grp);

    this.selectedUserUuid = JSON.parse(localStorage.getItem("customerInfo") ).user.user_uuid

    this.isUser = false;
    grp.forEach(function (item) {
      if (item === 'USER') {
        this.isUser = true;
      }
      else if(item === 'ROOT' || item === 'SUPER_USER') {
        this.isRoot = true;
      }
    }, this);

    this.allowOrderFunctionality = localStorage.getItem('allowOrderFunctionality') || 'true';

    // if (this.isUser) {
    //   this.allowOrderFunctionality = 'false';
    // }
    this.resultStatus = 'Fetching results';
    this.searchTemplates();
    if (this.isRoot) {
      this.allowOrderFunctionality = 'true';
      this.searchOrgRequest();
      this.retrieveTransactionSummary();
    } else {
      this.retrieveOrders();
      this.retrieveTransactionSummary();
    }
  }

  retrieveOrders(org = null) {
    this.showSpinner = true;
    this.getOrderData(org).subscribe(
        response => {
          this.showSpinner = false;
          if(response.rows && response.rows.length) {
            this.draftItems = response.rows.filter(function (row) {
              return row.status === "Draft"
            }, this);
            this.newItems = response.rows.filter(function (row) {
              return row.status === "New"
            }, this);
            this.paymentReceivedItems = response.rows.filter(function (row) {
              return row.status === "Payment Received"
            }, this);
            // this.inProgressItems = response.rows.filter(function (row) {
            //   return row.status === "In Progress"
            // }, this);
            this.completedItems = response.rows.filter(function (row) {
              return row.status === "Order Completed"
            }, this);

            this.draftItems.forEach(function (item) {
              this.totalDraftAmount += item.total_budget ? item.total_budget : 0;
            }, this);

            this.newItems.forEach(function (item) {
              this.totalNewAmount += item.total_budget ? item.total_budget : 0;
            }, this);

            this.paymentReceivedItems.forEach(function (item) {
              this.totalPaymentReceivedAmount += item.total_budget ? item.total_budget : 0;
            }, this);

            this.completedItems.forEach(function (item) {
              this.totalCompletedAmount += item.total_budget ? item.total_budget : 0;
            }, this);

            console.log('this.totalDraftAmount >>')
            console.log(this.totalDraftAmount);
          }
        },
        err => {
          this.showSpinner = false;
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.retrieveOrders.bind(self, org)
            );
          } else {
            Swal({
              title: 'Unable to load orders',
              text: 'An error occurred while loading orders. Please try again',
              type: 'error'
            }).then( () => {
            });
            this.showSpinner = false;
          }
        }
    );
  }

  getOrderData(org = null) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders' + ( org ? ('?org_uuid=' + org) : '');
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  retrieveTransactionSummary(org = null) {
    this.getTransactionSummary(org).subscribe(
        response => {
          if(response.body && response.body.summary) {
            this.availableBalance = response.body.summary.find(x=> x.type === 'Available Balance').amount;
            this.pendingAR = response.body.summary.find(x=> x.type === 'Pending AR').amount;
            this.pendingAP = response.body.summary.find(x=> x.type === 'Pending AP').amount;
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.retrieveTransactionSummary.bind(self, org)
            );
          } else {
            Swal({
              title: 'Unable to load orders',
              text: 'An error occurred while loading orders. Please try again',
              type: 'error'
            }).then( () => {
            });
            this.showSpinner = false;
          }
        }
    );
  }

  getTransactionSummary(org = null) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/payments/transactions' + ( org ? ('?org_uuid=' + org) : '');
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  searchOrgRequest() {
    this.showSpinner = true;
    this.searchOrgData().subscribe(
        response => {
          this.showSpinner = false;
          if (response && response.data) {
            response.data.forEach(function (item) {
              this.orgArr.push({
                id: item.org_uuid,
                text: item.org_name
              });
            }, this);

            if (this.orgArr.length) {
              this.orgValue = this.orgArr[0].id;

              this.retrieveOrders(this.orgValue);
              this.retrieveTransactionSummary(this.orgValue);
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
                self.searchOrgRequest.bind(self)
            );
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  searchTemplates() {
    this.getTemplates().subscribe(
        response => {
          //this.showSpinner = false;
          if (response && response.orgTemplates && response.orgTemplates.templates && response.orgTemplates.templates.length) {
            const publishedTemplates = response.orgTemplates.templates.filter(function (ele) {
              return ele.is_publish === 'True';
            }, this);
            this.hasTemplates = publishedTemplates.length ? true : false;
          } else {
            this.hasTemplates = false;
          }

          if (!this.hasTemplates) {
            this.toaster.pop('success', 'No Order Templates Available', 'No order template has been setup for your organization. Please contact your Administrator');
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.searchTemplates.bind(self)
            );
          } else {
            this.showSpinner = false;
            Swal({
              title: 'An error occurred',
              html: err._body ? JSON.parse(err._body).message : 'No error definition available',
              type: 'error'
            });
          }
        }
    );
  }

  getTemplates() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/templates';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
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

  handleViewOrderDetails(dataObj: any, status: String) {
    this.selectedOrder = dataObj;
    this.selectedOrder.status = status;
    this.hideSummary = true;
  }

  reLoad() {
    this.showSpinner = true;
    this.retrieveOrders(this.orgValue);
    this.retrieveTransactionSummary(this.orgValue);
  }

  showOrders() {
    this.hideSummary = false;
    this.selectedOrder = null;
  }

  OnOrgChange(e) {
    if (e.value && e.value !== this.orgValue) {
      this.orgValue = e.value;
      this.resultStatus = 'Fetching results';
      this.retrieveOrders(this.orgValue);
      this.retrieveTransactionSummary(this.orgValue);
    }
  }

  navigate() {
    if (this.hasTemplates) {
      this.router.navigate(['/app/order/create']);
    }
  }
}


