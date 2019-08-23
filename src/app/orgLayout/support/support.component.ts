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
        isDownload: true,
        isRowSelection: null,
        isPageLength: true,
        isPagination: true
    }];
    dashboard: any;
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

            console.log('case >>')
            console.log(this.caseSensitive);

            this.matchingResults = this.vendorOptions.filter(function (vendor) {
                if (this.caseSensitive) {
                    return vendor.id.indexOf(this.searchcontent) !== -1 || vendor.text.indexOf(this.searchcontent) !== -1;
                } else {
                    return vendor.id.toLowerCase().indexOf(this.searchcontent.toLowerCase()) !== -1 || vendor.text.toLowerCase().indexOf(this.searchcontent.toLowerCase()) !== -1;
                }
            }, this);
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

        this.dataObject = {};
        this.gridData = {};
        this.gridData['result'] = [];
        this.gridData.columnsToAppend$ = [
            'Line Item Budget',
            'Line Item Monthly Media Spend',
            'Line Item Media Spend',
            'Line Item Budget Remaining',
            'Line Item Monthly Budget',
            'Line Item Daily Budget',
            'Line Item Daily Spend',
            'Line Item Monthly Cumulative Spend',
            'Line Item Monthly Budget Remaining',
            'Line Item Daily Budget Remaining',
            'Average Line Item Monthly Budget',
            'Media Cost',
            'Technology Cost',
            'Average Line Item Daily Budget',
            'Client Fee',
            'Merchant Processing Fee',
            'Platform Fee'
        ];
        this.gridData['headers'] = [];
        this.gridData['options'] = this.options[0];
        this.dashboard = 'schemaGrid';
        this.gridData['result'] = [];
        this.dataObject.gridData = this.gridData;
    }

    OnVendorSelect(e: any): void {
        this.selectedVendor = e;
        this.matchingResults = [];
        this.getVendorName();
        this.paymentMethods = [];
        this.getVendorPaymentMethods().subscribe(
            response => {
                if (response && response.body) {
                    this.paymentMethods = response.body;
                    // response.body.forEach(function (ele) {
                    //
                    //   this.retPaymentMethodsHTML += '<div style="margin-bottom: 10px"><label>Payment Method</label><span style="margin-left: 5px">' + ele.payment_method  + '</span><br><label>Last 4 digits</label><span>' + ele.last_four_digits +  '</span><br><label>Payment Status</label><span>' + ele.status + '</span><br><label>Default</label><span>' + (ele.is_default == 1 ? 'Yes' : 'No') + '</span></div>';
                    // }, this);
                }
            },
            err => {
            }
        );
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
}
