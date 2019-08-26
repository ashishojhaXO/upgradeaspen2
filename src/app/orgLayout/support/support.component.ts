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
    widget: any;
    vendorOptions = [];
    orderOptions = [];
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
            if (!this.searchcontent) {
                this.matchingResults = [];
                return;
            }

            if (this.searchType === 'vendor') {
                this.matchingResults = this.vendorOptions.filter(function (vendor) {
                    if (this.caseSensitive) {
                        return vendor.id.indexOf(this.searchcontent) !== -1 || vendor.text.indexOf(this.searchcontent) !== -1;
                    } else {
                        return vendor.id.toLowerCase().indexOf(this.searchcontent.toLowerCase()) !== -1 || vendor.text.toLowerCase().indexOf(this.searchcontent.toLowerCase()) !== -1;
                    }
                }, this);
            } else if (this.searchType === 'order') {
                this.matchingResults = this.orderOptions.filter(function (order) {
                    if (this.caseSensitive) {
                        return order.id.toString().indexOf(this.searchcontent) !== -1 || order.text.toString().indexOf(this.searchcontent) !== -1;
                    } else {
                        return order.id.toString().toLowerCase().indexOf(this.searchcontent.toLowerCase()) !== -1 || order.text.toString().toLowerCase().indexOf(this.searchcontent.toLowerCase()) !== -1;
                    }
                }, this);
            }
        });

        this.selectedVendor = '';
        this.searchVendorData().subscribe(
            response => {
                if (response) {
                    if (response.body && response.body.length) {
                        response.body.forEach(function (x) {
                            this.vendorOptions.push({id: x.external_vendor_id, text: x.first_name + ' ' + x.last_name});
                        }, this);
                        this.showSpinner = false;
                    }
                }
            },
            err => {
                if (err.status === 401) {
                } else {
                    this.showSpinner = false;
                }
            }
        );
        this.getOrdersData().subscribe(
            response => {
                if (response && response.length) {
                    response.forEach(function (x) {
                        this.orderOptions.push({id: x['Order ID'], text: x['Order ID']});
                    }, this);
                    this.showSpinner = false;
                }
            },
            err => {
                if (err.status === 401) {
                } else {
                    this.showSpinner = false;
                }
            }
        );
    }

    OnSearchSelect(e: any): void {
        if (this.searchType === 'vendor') {
            this.selectedVendor = e.id;
            this.selectedVendorName = e.text;
            this.matchingResults = [];
            this.getVendorName();
            this.paymentMethods = [];
            this.getVendorPaymentMethods().subscribe(
                response => {
                    if (response && response.body) {
                        this.paymentMethods = response.body;
                    }
                },
                err => {
                }
            );
            this.getOrdersData().subscribe(
                response => {
                    if (response) {
                        const data = response.filter(function (x) {
                            return x.Vendor === this.selectedVendorName;
                        }, this)

                        this.populateOrders(data);
                    }
                },
                err => {
                }
            );
            this.getPaymentsData().subscribe(
                response => {
                    if (response && response.body && response.body.transactions) {
                        const data = response.body.transactions.filter(function (x) {
                            return x.vendor_name === this.selectedVendorName;
                        }, this)

                        console.log('data >>')
                        console.log(data);

                        this.populatePayments(data);
                    }
                },
                err => {
                }
            );
        }
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
        this.dataObjectPayments.gridId = 'order';
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

    getOrdersData() {
        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/orders/line-items';
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
        this.selectedVendorName = this.vendorOptions.find(x => x.id === this.selectedVendor).text;
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
        }
    }
}
