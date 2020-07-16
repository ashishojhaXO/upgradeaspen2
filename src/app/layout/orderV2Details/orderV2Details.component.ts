/**
 * Copyright 2019. Accelitas Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-11-14 14:54:37
 */

import {Component, OnInit, trigger, state, style, transition, animate, OnChanges, ViewChild, Input} from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import {CsvService} from '../../../services/csv';
import {GenericService} from '../../../services/generic.service';
import {AppPopUpComponent} from '../../shared/components/app-pop-up/app-pop-up.component';
import {ToasterService} from 'angular2-toaster';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';
import Swal from 'sweetalert2';
import {moment} from 'ngx-bootstrap/chronos/test/chain';

@Component({
  selector: 'app-order-v2-details',
  templateUrl: './orderV2Details.component.html',
  animations: [
    trigger('popOverState', [
      state('show', style({
        display: 'block'
      })),
      state('hide',   style({
        display: 'none'
      })),
      transition('show => hide', animate('600ms ease-out')),
      transition('hide => show', animate('1000ms ease-in'))
    ])
  ],
  styles: [`
        animation { display: block; }
    `]
})
export class OrderV2DetailsComponent implements OnInit  {

  gridData: any;
  dataObjectLineItemSummary: any = {};
  height: any;
  isRoot: boolean;
  isUser: boolean;
  orgValue = '';
  selectedUserUuid: any;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isRowHighlight: true,
    isCustomOption: {
      value : true,
      icon : 'fa-calendar',
      tooltip: 'Add/Edit Payout Date'
    },
    isCustomOption2: {
      value : true,
      icon : 'fa-credit-card-alt',
      tooltip: 'Retry Charge'
    },
    isCustomOption3: {
      value : true,
      icon : 'fa-newspaper-o',
      tooltip: 'Regenerate Receipt'
    },
    isCustomOption4: {
          value : true,
          icon : 'fa-money',
          tooltip: 'Download Receipt'
    },
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: true,
    isActionColPosition: 0, // This can not be 0, since zeroth column logic might crash
    isOrder: [],
    isHideColumns: [ "vendor_receipt_id","internal_line_item_id","internal_order_id","vendor_uuid"],
    isTree: false,
    // isChildRowActions required when there need to be actions below every row.
    isChildRowActions: {}
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  private toaster: any;
  sortOption: any;
  response: any;
  resultStatus:any;

  selectedLineItemID: any;
  selectedLineItemDetails: any;

  selectedPayoutDate: any;
  selectedDisplayLineItemID: any;
  vendorUuid: any;
  @Input() orderInfo: any;
  @Input() org: any;
  orderID: any;
  displayOrderID = '';
  lineItemIds: any;
  orderDetails: any;
  lineItemDetails: any;

  dateOptions = {
    format: "YYYY-MM-DD",
    showClear: true
  };

  @ViewChild('ReceiptsList') receiptsList: PopUpModalComponent;
  @ViewChild('ManagePayments') managePayments: PopUpModalComponent;
  @ViewChild('PayoutDate') payoutDate: PopUpModalComponent;
  receiptList: Array<Object>;

  constructor(private okta: OktaAuthService,
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

    this.resultStatus = 'Fetching results';

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

    this.orderID = this.orderInfo.id;

   // this.searchDataRequest();
   this.searchDateRequest(this.orderID);

    console.log('orderID >>>')
    console.log(this.orderID);
  }

    retrieveLineItemDetails() {
        this.getLineItemsForOrder().subscribe(
            response => {
                this.showSpinner = false;
                if(response.data && response.data.rows && response.data.rows.length) {
                    this.populateDataTable(response.data.rows, true);
                } else {
                    this.resultStatus = 'No data found'
                }
               console.log('response >>>$$$')
               console.log(response);
            },
            err => {
                this.showSpinner = false;
                if(err.status === 401) {
                    let self = this;
                    this.widget.refreshElseSignout(
                        this,
                        err,
                        self.retrieveLineItemDetails.bind(self)
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

    getLineItemsForOrder() {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/orders/' + this.orderID + '/line-items' + (this.org ? ('?org_uuid=' + this.org) : '');
        return this.http
            .get(url, options)
            .map(res => {
                return res.json();
            }).share();
    }


  handleRow(rowObj: any, rowData: any) {
    if(this[rowObj.action])
      this[rowObj.action](rowObj);
  }

  handleCheckboxSelection(rowObj: any, rowData: any) {
      console.log('rowObj >>')
      console.log(rowObj);
      this.selectedLineItemID = rowObj.data.internal_line_item_id;
      this.selectedDisplayLineItemID = rowObj.data.line_item_id;
      const lineItem = this.lineItemDetails.find( x=> x.line_item_id === this.selectedLineItemID);
      if (lineItem) {
          this.selectedLineItemDetails = lineItem;
      }
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

   // this.options[0].isPlayOption.value = this.allowOrderFunctionality === 'true' ? true : false;

   // this.options[0].isCustomOption2.value = this.isRoot ? true : false;

    // const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
    // if (customerInfo && customerInfo.org && customerInfo.org.org_name === 'Home Depot') {
    //   this.options[0].isPlayOption.icon = 'fa-history';
    //   this.options[0].isPlayOption.tooltip = 'View History';
    //   this.options[0].isPlayOption.value = true;
    //   this.isHomeDepot = true;
    // }

    // if(this.options[0].isDataTableGlobalSearchApi.searchQuery) {
    //   this.options[0]["search"] = {
    //     "search": this.searchQuery
    //   }
    // }

      if (!this.isRoot) {
          this.options[0].isCustomOption.value = false;
          this.options[0].isCustomOption2.value = false;
          this.options[0].isCustomOption3.value = false;
      }

    this.gridData['options'] = this.options[0];
    this.gridData.columnsToColor = [
      { index: 13, name: 'MERCHANT PROCESSING FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 17, name: 'LINE ITEM MEDIA BUDGET', color: 'rgb(47,132,234,0.2)'},
      { index: 18, name: 'KENSHOO FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 19, name: 'THD FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 12, name: 'LINE ITEM TOTAL BUDGET', color: 'rgb(47,132,234,0.4)'}
    ];
    this.dashboard = 'paymentGrid';
    this.dataObjectLineItemSummary.gridData = this.gridData;

    console.log('this.gridData >>')
    console.log(this.gridData);

    this.dataObjectLineItemSummary.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
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
            showCloseButton: true
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

  handleCustom(dataObj: any) {
    this.selectedLineItemID = dataObj.data.internal_line_item_id;
    this.selectedPayoutDate = dataObj.data.payout_date;
    this.selectedDisplayLineItemID = dataObj.data.line_item_id;
    this.payoutDate.show();
  }

  handleCustom2(dataObj: any) {
    this.orderID = this.orderID;
   // this.displayOrderID = $(option.elem).data("displayId");
    this.lineItemIds =  this.selectedLineItemID = dataObj.data.internal_line_item_id;
    this.managePayments.show();
  }

  handleCustom3(dataObj: any) {
    this.showSpinner = true;
    // Compile option/data
    let order_id = this.orderID;
    let line_item_id = dataObj.data.internal_line_item_id;
    let display_id = dataObj.data.line_item_id ? dataObj.data.line_item_id : dataObj.data.internal_line_item_id
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
              this.errorCB(rej, display_id);
            }
        )
  }

    handleCustom4(dataObj: any) {
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

    errorCallback = function (err) {
        console.log('error >>', err);
        console.log(err);
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

  handleRecalculate() {
    // Function Code: ORD_RC
    this.showSpinner = true;
    // Compile option/data
    let order_id = this.orderID;
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

  payOrder() {
    console.log('this.lineItemDetails >>')
    console.log(this.lineItemDetails);
    this.orderID = this.orderID;
    this.lineItemIds =  this.lineItemDetails.map(function (lineitem) {
        return lineitem.line_item_id;
    });

    this.lineItemIds = this.lineItemIds.join(',');
    console.log('this.lineItemIds >>')
    console.log(this.lineItemIds);
    this.managePayments.show();
  }

  editOrder() {
      console.log('this.orderDetails >>')
      console.log(this.orderDetails);
        if (!this.orderDetails.payment_received_date) {
          this.router.navigate(['/app/order/create', this.orderID]);
        }
  }

  cancelOrder() {
    if (!this.orderDetails.payment_received_date) {
      Swal({
        title: 'Are you sure you want to delete this order?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          this.cancelOrderRequest(this.orderID, this.displayOrderID);
        }
      });
    }
  }

  cancelOrderRequest(orderID, displayOrderID) {
    this.cancelRequest(orderID).subscribe(
        response => {
          console.log('response >>')
          console.log(response);
          this.showSpinner = false;
          Swal({
            title: 'Order Successfully Canceled',
            text: 'Order : ' + ( displayOrderID ? displayOrderID : orderID ) + ' has been successfully canceled',
            type: 'success'
          }).then( () => {
            this.router.navigate(['/app/order/ordersV2']);
          });
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.cancelOrderRequest.bind(self, orderID),
            );
          } else {
            this.showSpinner = false;
            Swal({
              title: 'Order Cancelation Failed',
              html: err._body ? JSON.parse(err._body).message : 'No error definition available',
              type: 'error'
            }).then( () => {
              // this.router.navigate(['/app/admin/invoices']);
            });
          }
        }
    );
  }

  cancelRequest(orderID) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data: any = {
      order_id : orderID
    };
    var url = this.api_fs.api + '/api/orders/delete' ;
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  refundLineItem(lineItem) {
      if (lineItem.ended) {
      const orderID = this.orderID;
      Swal({
        title: 'Issue Refund?',
        text: 'You have $' + lineItem.balance_amount + ' available. Would you like to refund ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          let self = this;
          this.refundRequest(lineItem, orderID).subscribe(
              response => {
                console.log('response >>')
                console.log(response);
                this.showSpinner = false;
                Swal({
                  title: 'Refund Successfully Issued',
                  text: 'A refund of $' + lineItem.balance_amount + ' has been successfully issued',
                  type: 'success'
                }).then( () => {
                  this.router.navigate(['/app/order/orders']);
                });
              },
              err => {
                if(err.status === 401) {
                  let self = this;
                  this.widget.refreshElseSignout(
                      this,
                      err,
                      self.refundLineItem.bind(self, lineItem, orderID)
                  );
                } else {
                  Swal({
                    title: 'Refund Issue Failed',
                    text: 'An error occurred while issuing refund. Please try again',
                    type: 'error'
                  }).then( () => {
                  });
                  this.showSpinner = false;
                }
              }
          );
        }
      });
    }
  }

  refundRequest(lineItem, orderID) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data: any = JSON.stringify({
      order_id : orderID,
      line_item_id : lineItem.line_item_id,
      refund_amount : lineItem.balance_amount
    });
    var url = this.api_fs.api + '/api/orders/refund' ;
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  extendOrder(lineItem) {

    console.log('this.lineItemDetails')
    console.log(this.lineItemDetails);

    console.log(this.selectedLineItemID);
    console.log(this.selectedDisplayLineItemID);

    console.log('this.orderID >>')
    console.log(this.orderID);

      if (this.lineItemExtensionAllowed(lineItem.line_item_end_date) && this.orderDetails.payment_received_date) {
          this.router.navigate(['/app/order/create', this.orderID, this.vendorUuid, lineItem.line_item_id]);
      }

    // console.log('lineItem.line_item_id >>')
    // console.log(lineItem.line_item_id);


  }

  lineItemExtensionAllowed(endData) {
    return this.getDaysBetweenDates(new Date(endData), new Date()) >= 7;
  }

  getDaysBetweenDates(second, first) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24)) + 1;
  }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
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
                    this.dataObjectLineItemSummary.isDataAvailable = false;
                    const __this = this;
                    setTimeout(function () {
                        __this.retrieveLineItemDetails();
                    }, 100);
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
                } else if(err.status === 403) {
                    this.showSpinner = false;
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
        this.selectedPayoutDate = null;
    }

    searchDateRequest(orderID) {
        this.showSpinner = true;
        let self = this;
        this.searchDate(orderID).subscribe(
            response => {
                console.log('DAT response >>')
                console.log(response);
                this.orderDetails = response.data.order;
                this.lineItemDetails = response.data.lineItems;
                if (this.lineItemDetails.length) {

                    const __this = this;
                    this.lineItemDetails = this.lineItemDetails.map(function (item) {
                        item.active = false;
                        item.started = item.line_item_start_date && !(new Date(item.line_item_start_date) >= new Date());
                        item.ended = item.line_item_end_date && (new Date(item.line_item_end_date) <= new Date());
                        item.actual_line_item_start_date = __this.addDays(item.line_item_start_date, 1);
                        item.actual_line_item_end_date = __this.addDays(item.line_item_end_date, 1);
                        return item;
                    });
                    const endDates = this.lineItemDetails.map(function (item) {
                        return item.line_item_end_date;
                    });
                    const startDates = this.lineItemDetails.map(function (item) {
                        return item.line_item_start_date;
                    });

                    this.orderDetails.start = this.min_date(startDates);
                    this.orderDetails.started = false;
                    if (this.orderDetails.start) {
                        this.orderDetails.started = !(new Date(this.orderDetails.start) >= new Date());
                    }

                    this.orderDetails.end = this.max_date(endDates);
                    this.orderDetails.ended = false;
                    if(this.orderDetails.end) {
                        this.orderDetails.ended = (new Date(this.orderDetails.end) <= new Date());
                    }

                    // this.lineItemIds = this.lineItemDetails.map((item, i) => {
                    //   return item.line_item_id;
                    // })
                }
                this.retrieveLineItemDetails();
            },
            err => {

                if(err.status === 401) {
                    let self = this;
                    this.widget.refreshElseSignout(
                        this,
                        err,
                        self.searchDateRequest.bind(self, orderID),
                    );

                } else {
                    this.showSpinner = false;
                    Swal({
                        title: 'No Additional Details Available',
                        text: 'No additional details are available for OrderID : ' + orderID,
                        type: 'error'
                    }).then( () => {
                        this.router.navigate(['/app/order/orders']);
                    });
                }
            }
        );
    }

    max_date(datesArr) {
        var max_dt = datesArr[0],
            max_dtObj = new Date(datesArr[0]);
        datesArr.forEach(function(dt, index)
        {
            if ( new Date( dt ) > max_dtObj) {
                max_dt = dt;
                max_dtObj = new Date(dt);
            }
        });
        return max_dt;
    }

    min_date(datesArr) {
        var min_dt = datesArr[0],
            min_dtObj = new Date(datesArr[0]);
        datesArr.forEach(function(dt, index)
        {
            if ( new Date( dt ) < min_dtObj) {
                min_dt = dt;
                min_dtObj = new Date(dt);
            }
        });
        return min_dt;
    }

    searchDate(orderID) {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        const data: any = {
            order_id : orderID
        };
        var url = this.api_fs.api + '/api/orders/dates' ;
        return this.http
            .post(url, data, options)
            .map(res => {
                return res.json();
            }).share();
    }
}
