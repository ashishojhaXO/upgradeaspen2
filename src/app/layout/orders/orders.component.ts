/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit, Input, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  providers: [GenericService, AppPopUpComponent],
})
export class OrdersComponent implements OnInit  {

  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  isRoot: boolean;
  orgArr = [];
  orgValue = '';
  isHistory: boolean;
  select2Options = {
    // placeholder: { id: '', text: 'Select organization' }
  };
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isRowHighlight: true,

    // For Csv functionality searchDataRequestCsv
    isDownloadAsCsv: true,
    isDownloadAsCsvFunc: ( table, pageLength, csv?) => {
      this.apiMethod(table, pageLength, csv);
    },
    //

    isDownloadOption: {
      value: true,
      icon: '',
      dependency: ['vendor_receipt_id'],
      tooltip: 'Download Vendor Receipt',
      dependencyToolTip:'Vendor receipt generation is pending'
    },
    isPlayOption: {
      value : true,
      icon : 'fa-plus-circle',
      tooltip: 'View Order Details'
    },
    isCustomOption: {
      value : true,
      icon : 'fa-history',
      tooltip: 'View History'
    },
    isCustomOption2: {
      value : true,
      icon : 'fa-calendar',
      tooltip: 'Add/Edit Payout Date'
    },
    // Commenting out fixedColumn, as we need subRow isTree children child row, to show action buttons
    // NOTE: FixedColumn's Structure Changed
    // isFixedColumn: {
    //   fixedColumns: {
    //     leftColumns: 1,
    //   },
    //   fixedColumnFunc: (ev, $, table ) => {
    //     // Util.DataTable.Func
    //     DataTableUtilsPluginExt.fixedColumnFunc(ev, $, table);
    //   },
    // },
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: true,
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 1, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    // isOrder: [[3, 'asc']],
    // isOrder: [[3, 'desc']],
    // isOrder: [[3, 'name-string-not-nullund-desc']],
    isOrder: [],
    isHideColumns: [ "vendor_receipt_id","internal_line_item_id","internal_order_id","vendor_uuid"],

    // TODO: How is this 'blah' thing even happening!!!
    isColumnDefs: [
      {
        type: 'name-string-not-nullund',
        // type: 'blah',
        targets: '_all',
        render: (data, type, row, meta) =>{
          return data;
        }
      },
      {
        type: 'name-string-not-nullund',
        // type: 'name-string-not-nullund-a',
        // type: 'blah',
        targets: 2,
        orderable: false,
      }
    ],

    // TODO: Check for PageLen change event also...
    isApiCallForNextPage: {
      value: true,
      apiMethod: ( table, pageLength, csv?) => {
        // Make ApiCall to backend with PageNo, Limit,
        this.apiMethod(table, pageLength, csv);
      },

    },

    isDataTableGlobalSearchApi: {
      value: true
    },

    isTree: true,
    // isChildRowActions required when there need to be actions below every row.
    isChildRowActions: {
      buttons: {},
      buttonCondition: {},
      htmlFunction: (row) => {

        let ngHtmlContent = '<div>' +
            '<button class="btn action-btn api-action" data-action="retryCharge" '+ ( row.Status.trim() == "ERROR_PROCESSING_PAYMENT" ? "" : "disabled" ) + ' data-order-id="'+row.internal_order_id + '" data-line-item-id="'+row.internal_line_item_id + '" data-vendor-uuid="'+ row.vendor_uuid +'" data-display-id="'+ row.order_id +'" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"' +
            '><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i><i class="fa fa-credit-card" style="color: #5cb85c; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span> Retry Charge</button>' +
            '<button class="btn action-btn api-action" data-action="regenerateReceipt" data-order-id="'+row.internal_order_id+ '" data-line-item-id= "'+ row.internal_line_item_id +'" data-display-id="'+ row.order_id +'" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"' +
            '><span style="margin-right: 5px; position: relative;"> <i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i><i class="fa fa-newspaper-o" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i></span>Regenerate Receipt</button>' +
            // '<button class="btn action-btn api-action" data-action="reprocess" data-order-id="row.Order_Id " style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"' +
            // '><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i><i class="fa fa-cogs" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i></span>Reprocess</button>' +
            '<button class="btn action-btn api-action" data-action="recalculate" data-order-id="'+ row.internal_order_id + '" data-display-id="'+ row.order_id +'" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"' +
            '><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i><i class="fa fa-calculator" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i></span>Recalculate</button>' +
            '</div>';

        return ngHtmlContent;
      }
    }

  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  selectedOrderID: any;
  selectedDisplayOrderID: any;
  selectedLineItemID: any;
  selectedDisplayLineItemID: any;
  hideTable: any;
  allowOrderFunctionality: any;
  orderPayment: number;
  selectedPayoutDate: any;
  dateOptions = {
    format: "YYYY-MM-DD",
    showClear: true
  };
  // retryChargeState: boolean = true;

  @ViewChild ( AppDataTable2Component )
  private appDataTable2Component : AppDataTable2Component;
  selectedRow: any;
  @ViewChild('ReceiptsList') receiptsList: PopUpModalComponent;
  @ViewChild('PayoutDate') payoutDate: PopUpModalComponent;

  response: any;
  org: string;
  selectedVendorUuid:any;
  currentTable: any;
  hasTemplates = false;
  private toaster: any;

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

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const grp = JSON.parse(groups);

    console.log('grp >>>')
    console.log(grp);

    let isUser = false;
    grp.forEach(function (item) {
      if (item === 'USER') {
        isUser = true;
      }
      else if(item === 'ROOT' || item === 'SUPER_USER') {
        this.isRoot = true;
      }
    }, this);

    this.allowOrderFunctionality = localStorage.getItem('allowOrderFunctionality') || 'true';

    // if (isUser) {
    //   this.allowOrderFunctionality = 'false';
    // }
    this.searchTemplates();
    if (this.isRoot) {
      this.allowOrderFunctionality = 'true';
      this.searchOrgRequest();
    } else {
      this.searchDataRequest();
    }
  }

  apiMethod = (table, pageLength, csv?) => {
    let searchVal = table.search();
    if((searchVal.trim())!=""){
      this.doDownloadOrderCsv(table);
    }else{
      this.options[0].isDisplayStart = table && table.page.info().start ? table.page.info().start : 0;

      if(csv){
        // Later we need csv function here
        this.searchDataRequestCsv(this.orgValue, table, csv);
      }
      else {
        this.searchDataRequest(null, table);
      }
    }
  }
  doDownloadOrderCsv(table){
    let tblData = table.rows( {page: 'current', filter : 'applied'} ).data();
    var visible_columns = [];
    table.columns().every( function () {
      if(this.visible()){
        visible_columns.push($(this.header()).text());
      }
    });
    console.log('visible_columns', visible_columns);
    let dtcolArr = table.columns().header().toArray().map(x => x.innerText);
    let dtrowObject = {};
    let dtDataArr = [];
    for (var i = 0; i < tblData.length; i++) {
      dtrowObject = {};
      for (var x = 0; x < tblData[i].length; x++) {
        let colName= dtcolArr[x];
        dtrowObject[colName] = tblData[i][x];
      }
      dtDataArr.push(dtrowObject);
    }
    console.log("dtDataArr",dtDataArr);

    let rows = dtDataArr;
    let arr: Array<String> = [];
    if (rows && rows.length) {
      rows.filter(res => delete res['ACTIONS']);
      const filRows = rows.filter(res => delete res[""]);
      arr.push(Object.keys(filRows[0]).join(",").replace(/_/g, ' ').toUpperCase());
      let dataRows = filRows.map((k, v) => { return Object.values(k).join(", "); })
      arr = arr.concat(dataRows);
    }
    let csvStr: String = "";
    csvStr = arr.join("\n");
    // var data = encode(csvStr);
    let b64 = btoa(csvStr as string);
    let a = "data:text/csv;base64," + b64;
    $('<a href=' + a + ' download="data.csv">')[0].click();
    return arr;
  }

  searchOrgRequest() {
    return this.searchOrgData().subscribe(
        response => {
          if (response && response.data) {

            response.data.forEach(function (item) {
              this.orgArr.push({
                id: item.org_uuid,
                text: item.org_name
              });
            }, this);

            if (this.orgArr.length) {
              this.orgValue = this.orgArr[0].id;
              this.searchDataRequest(this.orgValue, this.currentTable);
            }
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
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  searchTemplates() {
    this.getTemplates().subscribe(
        response => {
          this.showSpinner = false;
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


  searchDataRequestCsv(org = null, table?, csv?) {

    // if no table, then send all default, page=1 & limit=25
    // else, send table data
    let data = {
      page: 0,
      limit: 10000000,
      org: org ? org : ''
    };

    // this.hasData = false;
    this.showSpinner = true;

    return this.genericService.getOrdersLineItemsCsv(data, this.isRoot)
        .subscribe(
            (res) => {
              // this.hasData = true;
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

  cancelOrder() {
    // const res = OrderService.cancelOrder(id)
    // return res.subscribe( order => console.log(`Order id: ${order.id} cancelled`) )
    console.warn("Not Implemented: Call to Cancel service yet to be implemented...");
  }

  redirectToModifyOrderPage() {
    if(this.selectedRow && this.selectedRow.rowIndex) {
      const pageId = this.selectedRow.rowIndex;
      this.router.navigate([`../order/${pageId}`], { relativeTo: this.route } );
    }
  }

  // Recursively call this.main function where
  // the 401 response came in
  // Error CBs
  errorCallback = function (err) {
    console.log('error >>', err);
    console.log(err);
  }
  // Success & Error CBs/

  compileDataForPage(org, table) {
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

    return data;
  }

  calc(res, table) {
    let li = [];
    if (res.data.rows.length) {
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
    }
    return li;
  }

  searchDataRequestCB(res, table) {
    this.response = res.data.rows;
    let li = this.calc(res, table);

    // In order to refresh DataTable, we have to reassign the data variable, dataObject here.
    // TODO: Data to send to html
    // NumberOfPages: Send number of rowCount/limit
    // CurrentPageNo:
    // TotalCountofRows:
    this.dataObject = {};

    this.populateDataTable(li, true);
  }

  searchDataRequest(org = null, table?) {

    // if no table, then send all default, page=1 & limit=25
    // else, send table data
    let data = this.compileDataForPage(org, table);

    // this.hasData = false;
    this.showSpinner = true;

    const self = this;
    // return this.searchData(org)
    return this.genericService
    // .successMockCall(data)
        .getOrdersLineItems(data, this.isRoot)
        .subscribe(
            response => {
              if (response && response.data.rows && typeof response.data.rows == "object" && response.data.rows.length ) {
                this.showSpinner = false;
                // this.populateDataTable(response, true);
                this.searchDataRequestCB(response, table);
              } else {
                this.showSpinner = false;
                // self.popUp.showPopUp(self.popUp.popUpDict.noData)
                // console.log("No data to show")
              }
            },
            err => {
              if(err.status === 401) {
                this.widget.refreshElseSignout(
                    this,
                    err,
                    self.searchDataRequest.bind(self, org, table),
                    self.errorCallback.bind(self)
                );
              } else {
                this.showSpinner = false;
              }

            }
        );
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

    this.options[0].isPlayOption.value = this.allowOrderFunctionality === 'true' ? true : false;

    this.options[0].isCustomOption2.value = this.isRoot ? true : false;

    // const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
    // if (customerInfo && customerInfo.org && customerInfo.org.org_name === 'Home Depot') {
    //   this.options[0].isPlayOption.icon = 'fa-history';
    //   this.options[0].isPlayOption.tooltip = 'View History';
    //   this.options[0].isPlayOption.value = true;
    //   this.isHomeDepot = true;
    // }

    this.gridData['options'] = this.options[0];

    this.gridData.columnsToColor = [
      { index: 13, name: 'MERCHANT PROCESSING FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 17, name: 'LINE ITEM MEDIA BUDGET', color: 'rgb(47,132,234,0.2)'},
      { index: 18, name: 'KENSHOO FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 19, name: 'THD FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 12, name: 'LINE ITEM TOTAL BUDGET', color: 'rgb(47,132,234,0.4)'}
    ];
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleCheckboxSelection(rowObj: any, rowData: any) {
    this.selectedRow = rowObj;
  }

  handleUnCheckboxSelection(rowObj: any, rowData: any) {
    this.selectedRow = null;
  }

  handleRow(rowObj: any, rowData: any) {
    if(this[rowObj.action])
      this[rowObj.action](rowObj);
  }

  receiptList: Array<Object>;
  handleDownload(dataObj: any) {
    // Show modal with Downloadable Receipts and their Download links
    // Call all receipts & then call this.handleDownloadLink or this.searchDownloadLink

    let data = {
      "line_item_id": dataObj.data.internal_line_item_id
    }
    this.showSpinner = true;

    this.genericService.postOrderReceiptList(data)
        .subscribe(
            (res) => {
              this.showSpinner = false;
              if(res.data.length){
                res.data.forEach( function (obj) {
                  obj.order_id = dataObj.data.order_id;
                  obj.line_item_id = dataObj.data.line_item_id;
                 });
                this.receiptList = res.data;
              }
              // Show modal popUp, from there run this.handleDownloadLink(receiptId)
              this.receiptsList.show();
            },
            (rej) => {
              this.showSpinner = false;
              this.errorCB(rej);
            }

        )
  }

  handleDownloadLink(dataObj: any) {
    // const downloadId = dataObj.data.Vendor_Receipt_Id;
    // const orderId = dataObj.data.Order_Id;

    const downloadId = dataObj.vendor_receipt_id;
    const orderId = "";

    console.log('dataObj >>')
    console.log(dataObj);

    if (downloadId) {
      this.searchDownloadLink(downloadId, orderId);
    } else {
      Swal({
        title: 'No downloadable link available',
        text: 'We did not find a download link for that order',
        type: 'error'
      });
    }
  }

  handleRun(dataObj: any) {
    console.log('dataObj.data >>')
    console.log(dataObj.data.order_id);

    this.selectedOrderID = dataObj.data.internal_order_id;
    this.selectedLineItemID = dataObj.data.internal_line_item_id;
    this.selectedVendorUuid = dataObj.data.vendor_uuid;
    this.selectedDisplayOrderID = dataObj.data.order_id ? dataObj.data.order_id : dataObj.data.internal_order_id;
    this.hideTable = true;
    this.isHistory = false;
  }

  handleCustom(dataObj: any) {
    this.selectedOrderID = dataObj.data.internal_order_id;
    this.selectedLineItemID = dataObj.data.internal_line_item_id;
    this.selectedDisplayLineItemID = dataObj.data.line_item_id;
    this.selectedVendorUuid = dataObj.data.vendor_uuid;
    this.selectedDisplayOrderID = dataObj.data.order_id ? dataObj.data.order_id : dataObj.data.internal_order_id;
    this.hideTable = true;
    this.isHistory = true;
  }

  handleCustom2(dataObj: any) {
    this.selectedLineItemID = dataObj.data.internal_line_item_id;
    this.selectedPayoutDate = dataObj.data.payout_date;
    this.selectedDisplayLineItemID = dataObj.data.line_item_id;
    this.payoutDate.show();
    console.log('dataObj >>>')
    console.log(dataObj);
  }

  searchDownloadLink(downloadId, orderId) {
    var self = this;
    this.getDownloadLink(downloadId).subscribe(
        response => {
          if (response && response.data && response.data.pre_signed_url) {
            const link = document.createElement('a');
            link.setAttribute('href', response.data.pre_signed_url);
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
          } else {
            Swal({
              title: 'No downloadable link available',
              text: 'We did not find a download link for that order',
              type: 'error'
            });
          }
        },
        err => {
          if(err.status === 401) {
            this.widget.refreshElseSignout(
                this,
                err,
                self.searchDownloadLink.bind(self, downloadId, orderId),
                self.errorCallback.bind(self)
            );
          } else {
            Swal({
              title: 'Unable to download the order details',
              text: 'We were enable to download details of order: ' + orderId  + '. Please try again',
              type: 'error'
            });
            this.showSpinner = false;
          }
        });
  }

  getDownloadLink(downloadId) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }

    const data = JSON.stringify({
      'reference_id': downloadId
    });

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/reports/download';
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  reLoad() {
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest(this.orgValue, this.currentTable);
  }

  getOrders() {

    let data = {};

    this.genericService.getOrders(data)
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

  successCB(res, display_id = null) {
    // console.log( " res.json(): ", res.json())
    // this.populateDataTable(res.data.rows, false);

    // TODO: Some success callback here
    this.showSpinner = false;
    // let body = res.json();
    let body = res;
    // if (res && res.status == 200) {
    let popUpOptions = {
      title: 'Success',
      text: body.message,
      type: 'success',
      reverseButtons: true,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: "Cancel"
    };
    this.popUp.showPopUp(popUpOptions);
    // }
  }

  errorCB(res, display_id = null) {
    let genericErrorString = "Some error occured, please contact the Server Admin with code: ORD_RC"
    // TODO: Some error callback here
    this.showSpinner = false;
    let body = res.json();
    // if (res && res.status == 400) {
    let popUpOptions = {
      title: 'Error',
      text: body.message || genericErrorString,
      type: 'error',
      reverseButtons: true,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: "Cancel"
    }
    this.popUp.showPopUp(popUpOptions);
    // }
  }

  retryCharge(option) {
    // this.showSpinner = true;

    // Compile option/data
    let order_id = $(option.elem).data("orderId");
    let display_id = $(option.elem).data("displayId");
    let vendor_uuid = $(option.elem).data("vendorUuid");
    console.log("display_id",display_id);
    // let line_item_id = $(option.elem).data("lineItemId");
    // let data = {
    //   "order_id": order_id
    // };

    // this.selectedOrderID = order_id;
    // this.hideTable = true;

    this.router.navigate(['/app/orderPayment/', order_id, vendor_uuid, display_id]);
  }

  regenerateReceipt(option) {
    this.showSpinner = true;
    // Compile option/data
    let order_id = $(option.elem).data("orderId");
    let line_item_id = $(option.elem).data("lineItemId");
    let display_id = $(option.elem).data("displayId");
    let data = {
      order_id: order_id,
      line_item_id: line_item_id
    };

    return this.genericService
        .regenerateReceipt(data)
        .subscribe(
            (res) => {
              this.showSpinner = false;
              this.successCB(res, display_id);
            },
            (rej) => {
              this.showSpinner = false;
              this.errorCB(rej,display_id);
            }
        )
  }

  reprocess(option) {
    this.showSpinner = true;
    // Compile option/data
    let data = {};

    return this.genericService
        .reprocess(data)
        .subscribe(
            (res) => {
              this.showSpinner = false;
              this.successCB(res)
            },
            (rej) => {
              this.showSpinner = false;
              this.errorCB(rej)
            }
        )
  }

  recalculate(option) {
    // Function Code: ORD_RC
    this.showSpinner = true;
    // Compile option/data
    let order_id = $(option.elem).data("orderId");
    let data = {"order_id": order_id};

    return this.genericService
        .recalculate(data)
        .subscribe(
            (res) => {
              this.showSpinner = false;
              this.successCB(res)
            },
            (rej) => {
              this.showSpinner = false;
              this.errorCB(rej)
            }
        )
  }

  handleDataTableInit(ev) {
    this.currentTable = ev.data;
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

  showOrders() {
    this.hideTable = false;
    this.selectedOrderID = null;
    this.selectedLineItemID = null;
  }

  OnOrgChange(e) {
    if (e.value && e.value !== this.orgValue) {
      this.dataObject.isDataAvailable = false;
      this.orgValue = e.value;

      // Seeting the DataTable page to 0, the first page
      if (this.currentTable) {
        // if(this.appDataTable2Component && this.appDataTable2Component.table) {
        // this.currentTable.page(0)
        this.options[0].isDisplayStart = this.currentTable && this.currentTable.page.info().start ? this.currentTable.page.info().start : 0;

        // this.appDataTable2Component.table.page(0)
      }

      this.searchDataRequest(this.orgValue, this.currentTable);
    }
  }

  navigate() {
    if (this.hasTemplates) {
      this.router.navigate(['/app/order/create']);
    }
  }

  handleSubmitPayoutDate() {
    if (!this.selectedPayoutDate) {
      Swal({
        title: 'No date selection',
        html: 'Please choose a date',
        type: 'error'
      });
      return;
    }
    const selectedPayoutDate = moment(this.selectedPayoutDate._d).format('YYYY-MM-DD');
    this.submitPayoutDate(selectedPayoutDate).subscribe(
        response => {
          this.handleClosePayoutDate();
          Swal({
            title: 'Success',
            html: response.message ? response.message : 'Payout date successfully updated',
            type: 'success'
          }).then( () => {
            this.reLoad();
          });
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.submitPayoutDate.bind(self, selectedPayoutDate)
            );
          } else {
            this.showSpinner = false;
            Swal({
              title: 'An error occurred',
              html: err._body ? JSON.parse(err._body).message : 'No error definition available',
              type: 'error'
            });
          }
        });
  }

  submitPayoutDate(selectedPayoutDate) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const data = JSON.stringify({
      internal_line_item_id : this.selectedLineItemID,
      payout_date : selectedPayoutDate
    });

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/payoutdate';
    return this.http
        .put(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }


  handleClosePayoutDate() {
    this.payoutDate.hide();
    this.selectedLineItemID = null;
    this.selectedPayoutDate = null;
    this.selectedDisplayLineItemID = null;
  }
}


