/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import 'rxjs/add/operator/filter';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {OktaAuthService} from '../../../services/okta.service';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import { OrderList } from 'primeng/primeng';
import { AppPopUpComponent } from '../../shared/components/app-pop-up/app-pop-up.component';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss'],
    providers: [AppPopUpComponent]
})
export class SupportComponent implements OnInit {

    gridData: any;
    dataObjectOrders: any = {};
    dataObjectPayments: any = {};
    dataObjectRetryOrders : any = {};
    dataObjectPaymentMethods: any = {};
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
    api_fs: any;
    externalAuth: any;
    error: any;
    showSpinner: boolean;
    searchcontent: any;
    caseSensitive: any;
    selectedVendor: string;
    selectedVendorName: string;
    selectedVendorUUID: string;
    pendingAP: string;
    pendingAR: string;
    availableBalance: string;
    selectedOrder: string;
    selectedOrderID: string;
    selectedOrderLineItemID: string
    selectedOrderChannel: string;
    widget: any;
    searchOptions = [{
        id: 'vendor',
        text: 'Vendor'
    },{
        id: 'order',
        text: 'Order ID'
    },{
        id: 'retry',
        text: 'Retry Orders'
    }];
    searchType = '';
    paymentMethods = [];
    matchingResults = [];
    inSearchMode = false;
    @ViewChild('searchField') searchField: ElementRef;
    @ViewChild ( AppDataTable2Component )
    private appDataTable2Component : AppDataTable2Component;
    selectedRowLength: Number = 0;
    orderDetails: Object;

    constructor(
        private okta: OktaAuthService,
        private route: ActivatedRoute,
        private router: Router,
        private http: Http,
        private popUp: AppPopUpComponent
    ) {
    }

    ngOnInit() {
        this.widget = this.okta.getWidget();
        this.showSpinner = true;
        this.height = '50vh';
        this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
        this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
        Observable.fromEvent(this.searchField.nativeElement, 'keyup').debounceTime(500).subscribe(value => {
            this.matchingResults = [];
            this.inSearchMode = true;
            if (!this.searchcontent) {
                this.inSearchMode = false;
                return;
            }

            if (this.searchType === 'vendor') {
                this.getFilteredVendors(this.searchcontent).subscribe(
                    response => {
                        if (response && response.body && response.body.length) {
                            this.matchingResults = response.body;
                        }
                        this.inSearchMode = false;
                    },
                    err => {
                    }
                );
            } else  if (this.searchType === 'order') {
                this.getFilteredOrders(this.searchcontent).subscribe(
                    response => {
                        if (response && response.data && response.data.length) {
                            this.matchingResults = response.data.map(function (x) {
                                return { id: x.order_id , name :  ( x.line_item_id + ' - ' + x.order_id + ' - ' + x.channels_id )};
                            });
                        }
                        this.inSearchMode = false;
                    },
                    err => {
                    }
                );
            }
        });

        this.selectedVendor = '';
        this.showSpinner = false;
    }


    OnSearchSelect(e: any): void {

        console.log('e >>>')
        console.log(e);

        this.showSpinner = true;
        if (this.searchType === 'vendor') {
            this.selectedVendor = e.id;
            this.selectedVendorName = e.name;
            this.selectedVendorUUID = e.vendor_id;
            this.getVendorName();
            this.paymentMethods = [];
            this.getVendorPaymentMethods().subscribe(
                response => {
                    if (response && response.body) {
                        this.populatePaymentMethods(response.body);
                        this.paymentMethods = response.body;
                    }
                },
                err => {
                }
            );
            this.getOrdersDataByVendorID(this.selectedVendor).subscribe(
                response => {
                    if (response && response.data) {
                        this.populateOrders(response.data);
                    }
                },
                err => {
                }
            );
            this.getPaymentsData().subscribe(
                response => {
                    if (response && response.body && response.body.summary) {

                        console.log('response.body.summary >>')
                        console.log(response.body.summary);
                        // const data = response.body.transactions.filter(function (x) {
                        //     return x.vendor_name === this.selectedVendorName;
                        // }, this)

                        // console.log('data >>')
                        // console.log(data);
                        this.pendingAP = response.body.summary.find(x=> x.type === 'Pending AP') ? response.body.summary.find(x=> x.type === 'Pending AP').amount : '-';
                        this.pendingAR = response.body.summary.find(x=> x.type === 'Pending AR') ? response.body.summary.find(x=> x.type === 'Pending AR').amount : '-';
                        this.availableBalance = response.body.summary.find(x=> x.type === 'Available Balance') ? response.body.summary.find(x=> x.type === 'Available Balance').amount : '-';
                        this.populatePayments(response.body.transactions);
                    }
                },
                err => {
                }
            );
        } else {
            this.selectedOrder = e.id;
            console.log('this.selectedOrder >>')
            console.log(this.selectedOrder);
            this.selectedOrderID = e.name.indexOf('-') !== -1 ? e.name.split('-')[1] : e.name;
            this.selectedOrderLineItemID = e.name.indexOf('-') !== -1 ? e.name.split('-')[0] : e.name;
            this.selectedOrderChannel =  e.name.indexOf('-') !== -1 ? e.name.split('-')[2] : e.name;

            this.getOrderDetails(this.selectedOrder).subscribe(
                response => {
                    // --- Show extended Order details
                    if (response && response.data && response.data.length) {
                        const resp = response.data[0];
                        // This orderDetails will be used in HTML
                        this.orderDetails = resp;
                        // Orders
                        const audit_orders = resp.audit_orders || [];
                        this.populateOrders(audit_orders);
                        // Line-Items
                        let line_items_data = []
                        if( resp.line_items && resp.line_items.length ) {
                            line_items_data = resp.line_items.map(
                                (v, k) =>  Object.assign( {}, {line_item_id: v.line_item_id}, v.ar_ap_transaction || {} )
                            );
                        }
                        this.populatePayments(line_items_data);
                    }
                },
                err => {
                    console.log("getOrderDetails err: ", err);
                }
            );
        }

        this.matchingResults = [];
        this.searchcontent = '';

        const __this = this;
        setTimeout(function () {
            __this.showSpinner = false;
        }, 100);
    }

    populateOrders(data) {

        this.dataObjectOrders = {};
        this.gridData = {};
        this.gridData['result'] = [];
        const headers = [];
        if (data.length) {
            const keys = Object.keys(data[0]);
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
        this.gridData['headers'] = headers;
        this.gridData['options'] = this.options[0];
        this.gridData['result'] = data;
        this.dataObjectOrders.gridData = this.gridData;
        this.dataObjectOrders.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
        this.dataObjectOrders.gridId = 'order';
    }

    populatePayments(data) {

        this.dataObjectPayments = {};
        this.gridData = {};
        this.gridData['result'] = [];
        const headers = [];
        if (data.length) {
            const keys = Object.keys(data[0]);
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
        this.gridData['headers'] = headers;
        this.gridData['options'] = this.options[0];
        this.gridData['result'] = data;
        this.dataObjectPayments.gridData = this.gridData;
        this.dataObjectPayments.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
        this.dataObjectPayments.gridId = 'payment';
    }

    populatePaymentMethods(data) {
        this.dataObjectPaymentMethods = {};
        this.gridData = {};
        this.gridData['result'] = [];
        const headers = [];
        if (data.length) {
            const keys = Object.keys(data[0]);
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
        this.gridData['headers'] = headers;
        this.gridData['options'] = this.options[0];
        this.gridData['result'] = data;
        this.dataObjectPaymentMethods.gridData = this.gridData;
        this.dataObjectPaymentMethods.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
        this.dataObjectPaymentMethods.gridId = 'paymentMethods';
    }

    getOrdersDataByVendorID(vendorID) {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/orders/vendor?vendor_id=' + vendorID;
        return this.http
            .get(url, options)
            .map(res => {
                return res.json();
            }).share();
    }

    getFilteredVendors(match) {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/vendors/search?search=' + match;
        return this.http
            .get(url, options)
            .map(res => {
                return res.json();
            }).share();
    }

    getFilteredOrders(match) {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/orders/search?search=' + match;
        return this.http
            .get(url, options)
            .map(res => {
                return res.json();
            }).share();
    }

    getOrderDetails(orderID) {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/orders/deepsearch?search=' + orderID;
        return this.http
            .get(url, options)
            .map(res => {
                return res.json();
            }).share();
    }

    getPaymentsData() {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/payments/transactions';
        return this.http
            .get(url, options)
            .map(res => {
                return res.json();
            }).share();
    }

    getVendorName() {
        this.selectedVendorName = this.matchingResults.find(x => x.id === this.selectedVendor).name;
    }

    searchVendorData() {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }

        const headers = new Headers({'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen'});
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/vendors';
        return this.http
            .get(url, options)
            .map(res => {
                return res.json();
            }).share();
    }

    getVendorPaymentMethods() {

        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }

        console.log('this.selectedVendor >>')
        console.log(this.selectedVendor);


        const dataObj = JSON.stringify({
            vendor_id: this.selectedVendorUUID,
            org_id: 2,
        });

        const headers = new Headers({'Content-Type': 'application/json', 'callingapp': 'pine', 'token': token});
        const options = new RequestOptions({headers: headers});
        const url = this.api_fs.api + '/api/payments/vendor-payment-methods';

        return this.http
            .post(url, dataObj, options)
            .map(res => {
                return res.json();
            }).share();
    }

    OnSearchChange(e) {
        if(!this.searchType || this.searchType != e.value) {
            this.searchType = e.value;
            this.searchcontent = '';
            this.matchingResults = [];
            this.dataObjectPayments = [];
            this.dataObjectPaymentMethods = [];
            this.dataObjectOrders = [];
        }

        if(this.searchType == 'retry') {
            // Get orders
            this.getRetryOrders()
        }
    }

    // Retry Orders

    compileTableHeaders(data) {
        const headers = [];
        if (data.length) {
            const keys = Object.keys(data[0]);
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

        return headers;
    }

    populateRetryOrders(data) {
        this.showSpinner = false;

        this.dataObjectRetryOrders = {};

        this.gridData = {};
        this.gridData['result'] = [];
        this.gridData['headers'] = this.compileTableHeaders(data);

        const optDict = {
            isRowSelection: {
                isMultiple : true,
            },
        }
        this.options[0] = Object.assign({}, this.options[0], optDict);

        this.gridData['options'] = this.options[0];

        this.gridData.columnsToColor = [
        { index: 11, name: 'MERCHANT PROCESSING FEE', color: 'rgb(47,132,234,0.2)'},
        { index: 15, name: 'LINE ITEM MEDIA BUDGET', color: 'rgb(47,132,234,0.2)'},
        { index: 16, name: 'KENSHOO FEE', color: 'rgb(47,132,234,0.2)'},
        { index: 17, name: 'THD FEE', color: 'rgb(47,132,234,0.2)'},
        { index: 10, name: 'LINE ITEM TOTAL BUDGET', color: 'rgb(47,132,234,0.4)'}
        ];

        this.gridData['result'] = data;
        this.dataObjectRetryOrders.gridData = this.gridData;
        this.dataObjectRetryOrders.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
        this.dataObjectRetryOrders.gridId = 'payment';
    }

    getOrdersService( ) {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }

        const headers = new Headers({'Content-Type': 'application/json', 'callingapp': 'pine', 'token': token});
        const options = new RequestOptions({headers: headers});
        // const url = this.api_fs.api + '/api/orders/line-items'
        const url = this.api_fs.api + '/api/orders/line-items';

        return this.http.get(url, options)
            .map(res => {
                return res.json();
            })
            .share();
    }

    getRetryOrders() {
        this.selectedRowLength = 0;

        // Call From Orders service
        this.getOrdersService()
        .subscribe(resp => {
            this.populateRetryOrders( resp.filter((val) => {
                return val['Vendor Payment Status'] == "ERROR PROCESSING PAYMENT";
            }))
        });
    }

    // Retry Orders/

    handleRowSelection(rowObj: any) {
        console.log('rowObj >>')
        console.log(rowObj);
    }

    handleCheckboxSelection(rowObj: any, rowData: any) {
        this.selectedRowLength = this.appDataTable2Component.table.rows({selected: true}).data().length;
    }

    handleUnCheckboxSelection(rowObj: any, rowData: any) {
        this.selectedRowLength = this.appDataTable2Component.table.rows({selected: true}).data().length;
    }

    handleRow(rowObj: any, rowData: any) {
        if(this[rowObj.action])
            this[rowObj.action](rowObj);
    }

    postRetryOrderService(data) {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }

        const dataObj = data;

        const headers = new Headers({'Content-Type': 'application/json', 'callingapp': 'pine', 'token': token});
        const options = new RequestOptions({headers: headers});
        const url = this.api_fs.api + '/api/orders/line-items';

        return this.http
            .post(url, dataObj, options)
    }


    getRetryOrderIds() {
        const selectedRows = this.appDataTable2Component.table.rows({selected: true})
        const selectedRowsData = selectedRows.data();
        const len = selectedRowsData.length;
        let rowDataOrderIds = [];
        // Taking Hard Coded index temporarily, since DataTables not returning data with column Names
        const line_item_id = 5;
        for(let i = 0; i < len; i++) {
            this.dataObjectOrders.push
            rowDataOrderIds.push(selectedRowsData[i][line_item_id])
        }

        return rowDataOrderIds;
    }

    prepareData() {

        const rowDataOrderIds = this.getRetryOrderIds();
        const data = {"ar_id": rowDataOrderIds, "action": "retry"};

        return data;
    }

    retrySubmitBtn(rowObj: any) {

        const data = this.prepareData();
        const prom = this.popUp.runCompileShowPopUp(data);

        prom
        .then((res) => {
            if(res && res.value) {
                this.showSpinner = true;
                return this.postRetryOrderService(data).toPromise()
            }
        })
        .then((res)=>{
            // Resolve
            this.showSpinner = false;
            if(res) {
                const swalOptions = {
                    title: 'Retry Orders Successful',
                    text: 'Retry Orders Successful',
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
                    title: 'Retry Orders Failed',
                    text: 'Retry Orders Failed',
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
                return this.getRetryOrders();
            }
            return null;
        })
        .catch((err)=>{
            // if (err instanceof ApiError)
            this.showSpinner = false;
            console.log("Error: Retry Orders: ", err);
        });

    }

    clearSearch() {
        this.searchcontent = '';
        this.matchingResults = [];
    }
}
