/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {OktaAuthService} from '../../../services/okta.service';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

    gridData: any;
    dataObjectOrders: any = {};
    dataObjectPayments: any = {};
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
    selectedOrder: string;
    selectedOrderClientID: string;
    selectedOrderChannel: string;
    widget: any;
    searchOptions = [{
        id: 'vendor',
        text: 'Vendor'
    },{
        id: 'order',
        text: 'Order ID'
    }];
    searchType = '';
    paymentMethods = [];
    matchingResults = [];
    inSearchMode = false;
    @ViewChild('searchField') searchField: ElementRef;

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
                                return { id: x.id , name :  ( x.id + ' - ' + x.order_id + ' - ' + x.channels_id )};
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
                        // const data = response.body.transactions.filter(function (x) {
                        //     return x.vendor_name === this.selectedVendorName;
                        // }, this)

                        // console.log('data >>')
                        // console.log(data);

                        this.populatePayments(response.body.summary);
                    }
                },
                err => {
                }
            );
        } else {
            this.selectedOrder = e.id;
            this.selectedOrderClientID = e.name.indexOf('-') !== -1 ? e.name.split('-')[1] : e.name;
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
            vendor_id: this.selectedVendor,
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
        }
    }

    handleRowSelection(rowObj: any) {
        console.log('rowObj >>')
        console.log(rowObj);
    }

    clearSearch() {
        this.searchcontent = '';
        this.matchingResults = [];
    }
}
