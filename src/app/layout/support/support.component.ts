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
import Swal from 'sweetalert2';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import { fromPromise } from 'rxjs/observable/fromPromise';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss']
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

    constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
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
            this.selectedOrderID = e.name.indexOf('-') !== -1 ? e.name.split('-')[1] : e.name;
            this.selectedOrderLineItemID = e.name.indexOf('-') !== -1 ? e.name.split('-')[0] : e.name;
            this.selectedOrderChannel =  e.name.indexOf('-') !== -1 ? e.name.split('-')[2] : e.name;
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
            this.getOrders()
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
        console.log("POPULATE", data);

        // this.dataObjectPayments = {};
        this.dataObjectRetryOrders = {};

        this.gridData = {};
        this.gridData['result'] = [];
        this.gridData['headers'] = this.compileTableHeaders(data);

        console.log( "thisopts" ,this.options[0] );
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
            // .pipe(
            //     map( (res) => {
            //         console.log("map res", res );
            //         return res.json();
            //         // res.json()
            //      }),
            //     filter( item => {
            //         console.log("ITEM: ", item);
            //         return item['Vendor Payment Status'] == "ERROR PROCESSING PAYMENT";
            //     })
            // )

            .map(res => {
                return res.json();
            })
            // .flatMap(res => Observable.from(res))
            // .filter( ( res, idx ) => {
            //     // return res[];
            //     return res['Vendor Payment Status'] == "ERROR PROCESSING PAYMENT";
            // })
            .share();
            
            // .map(res => {
            //     console.log( "ORDERS MAP: ", res);
            //     return res.json();
            // }).share();
    }
    
    getOrders() {
        // Call From Orders service 
        this.getOrdersService()
        .subscribe(resp => {
            console.log("SUBS resp", resp);
            // this.orders = resp.body
            // this.dataObjectRetryOrders = resp
            this.populateRetryOrders( resp.filter((val) => {
                return val['Vendor Payment Status'] == "ERROR PROCESSING PAYMENT";
            }))
            // .body
        });
    }

    // Retry Orders/

    handleRowSelection(rowObj: any) {
        console.log('rowObj >>')
        console.log(rowObj);
    }

    selectedRow: any;
    handleCheckboxSelection(rowObj: any, rowData: any) {
        console.log("CHECK")
        this.selectedRow = rowObj;
    }

    handleUnCheckboxSelection(rowObj: any, rowData: any) {
        console.log("UNCHECK")
        this.selectedRow = null;
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

        const dataObj = JSON.stringify({
            vendor_id: this.selectedVendorUUID,
            org_id: 2,
        });

        const headers = new Headers({'Content-Type': 'application/json', 'callingapp': 'pine', 'token': token});
        const options = new RequestOptions({headers: headers});
        const url = this.api_fs.api + '/api/orders/line-items';

        return this.http
            .post(url, dataObj, options)
            .map(res => {
                return res.json();
            }).share();
    }

    // PopUpComponent
    questionPopUp(options?: {}): {} {
        const orderIdList = [1,2,3];
        const startOptions = {
            title: 'Retry Orders',
            text: `Are you sure you wish to retry payments of order ids: ${orderIdList}`,
            type: 'question',
            showCancelButton: true,
            cancelButtonText: "Cancel",
            confirmButtonText: "Submit",
        };

        return startOptions;
    }

    errorPopUp(options?: {}): {} {
        const orderIdList = [1,2,3];
        const startOptions = {
            title: "Operation Failed",
            text: "Operation to retry orders ids failed",
            type: 'error',
            // cancelButtonText: "Ok",
        };

        return startOptions;
    }

    showPopUp(options) {
        return Swal.fire(options)

        // .then((res)=> {
        //     if(res.value) {
        //         console.log("THEN REs", res)
        //     }
        //     // Fire Retry Orders

        //     // Call async, if this passes, 

        //     // postRetryOrder
        //     // return new Promise


        // })
        // .then((res) => {
        //     // Success Swal
        //     console.log("THEN REs2222", res)

        // })
        // .catch((err)=> {
        //     console.log("Errror", err)
        //     // Else error Swal
        //     this.errorPopUp()
        // });
        // console.log("FFFF: ", f);

    }

    runCompileShowPopUp() {
        const options = this.questionPopUp()
        return this.showPopUp(options);
    }
    // PopUpComponent/

    getRetryOrderIds() {
        console.log( "appDATA@: ", this.appDataTable2Component )
        const selectedRows = this.appDataTable2Component.table.rows({selected: true})
        const selectedRowsData = selectedRows.data();
        const len = selectedRowsData.length;
        let rowDataOrderIds = [];
        for(let i = 0; i < len; i++) {
            this.dataObjectOrders.push
            rowDataOrderIds.push(selectedRowsData[i])
        }

        console.log("IDIDID", rowDataOrderIds);

        return rowDataOrderIds;

    }

    retrySubmitBtn(rowObj: any) {

        const rowDataOrderIds = this.getRetryOrderIds();
        // Either this
        const prom = this.runCompileShowPopUp();


        // prom
        // .then((res) => {
        //     console.log("RESO", res);
        // }, () => {
        //     console.log("REJEC");
        // })
        // .catch();

        // Else this
        // Fire Observable here from Promise
        fromPromise(prom)
        .pipe(
            switchMap( (res) => {
                console.log("switch: ", res);
                // if( res && res.value){
                //     console.log("IFIFIFF");
                //     return this.postRetryOrderService(rowDataOrderIds);
                // }
                // else {
                //     console.log("ELELELELEL");
                // }
                return this.postRetryOrderService(rowDataOrderIds);
            })
        )
        .subscribe(
            // success
            (res)=>{
                this.getOrdersService().subscribe( (res) => {
                    console.log("getORDERSERVICE REs", res)
                })
            },
            // error
            ()=>{}
        )

    }

    clearSearch() {
        this.searchcontent = '';
        this.matchingResults = [];
    }
}
