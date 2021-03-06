/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
// import { OktaAuthService } from '../../../services/okta.service';
import {FormBuilder, FormControl, FormGroup, FormArray, Validators, ReactiveFormsModule} from '@angular/forms';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import { OktaAuthService } from '../../../services/okta.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit  {

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
        isRowHighlight: false,
        isRowSelection: {
            isMultiple : false
        },
        isPageLength: true,
        isPagination: true,
        sendResponseOnCheckboxClick: true
    }];
    dashboard: any;
    api_fs: any;
    externalAuth: any;
    showSpinner: boolean;
    widget: any;
    existingOrder: any;
    dataFieldConfiguration = [];
    templates = [];
    template = '';
    templateDefinition = [];
    data: any = {};
    FormModel: any;
    public form: FormGroup;
    formAttribute: any;
    dataRowUpdated = false;
    dataRowUpdatedLen = 0;
    minDate = new Date();
    orderId: any;
    lineItemId: any;
    dateOptions = {
        format: "YYYY-MM-DD",
        showClear: true
    };
    selectedRow: any;
    originalResponseObj: any;
    paymentReceived: any;
    isOrderExtend: boolean;
    select2Options = {
        placeholder: { id: '', text: 'Select an option' }
    };
    vendor_id: any;

    // gridDataResult: Object[] = new Array(Object);
    gridDataResult: Object[] = [];
    lineItemForm: FormGroup;

    @ViewChild ( AppDataTable2Component )
    private appDataTable2Component : AppDataTable2Component;
    isRoot: boolean;
    orgInfo: any;
    orgArr = [];
    selectedOrg: any;
    orgValue = '';

    userUuid:any;
    isForbidden:boolean = false;

    constructor(
        // private okta: OktaAuthService,
        private route: ActivatedRoute, private router: Router, private http: Http, fb: FormBuilder, private okta: OktaAuthService) {
        this.formAttribute = fb;
        const groups = localStorage.getItem('loggedInUserGroup') || '';
        const custInfo =  JSON.parse(localStorage.getItem('customerInfo') || '');
        this.orgInfo = custInfo.org;

        console.log('custInfo >>>')
        console.log(custInfo);

        const grp = JSON.parse(groups);
        grp.forEach(function (item) {
          if (item === 'ROOT' || item === 'SUPER_USER') {
            this.isRoot = true;
          }
        }, this);
    }

    ngOnInit() {

        this.showSpinner = true;
        this.widget = this.okta.getWidget();

        const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
        this.userUuid = customerInfo.user.user_uuid;
        this.height = '50vh';
        this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
        this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
        this.route.params.subscribe(params => {
            if (params['id']) {
                // if (params['vendorId']) {
                //     this.vendor_id = params['vendorId'];
                // }
                this.searchTemplates(params['id'], params['lineItemId'], true);
                // if(this.templates.length) {
                //   this.template = '41';
                //   this.searchTemplateDetails(this.template);
                // }
            } else {
            if (this.isRoot) {
                this.searchOrgRequest();
                }else{
                this.searchTemplates(null, null , false);
            }
            }
        });
    }

    extractOrderDetails(id, lineItemId = null) {
        this.getOrderDetails(id).subscribe(
            response => {

                if(lineItemId) {
                    this.isOrderExtend = true;
                }
                this.showSpinner = false;
                this.orderId = id;
                if (response.orders && response.orders.length && response.orders[0].order && response.orders[0].order.temp_id) {
                    this.existingOrder = response.orders[0];
                    this.template = response.orders[0].order.temp_id;

                    if (this.isOrderExtend) {
                        this.existingOrder.lineItems.forEach(function (lineItem) {
                            lineItem['additional_budget'] = 0;
                            // lineItem['additional_budget'] = lineItem['campaign_line_item_budget'];
                        });
                    }

                    this.searchTemplateDetails(this.template, this.existingOrder, lineItemId);
                }
            },
            err => {
                if(err.status === 401) {
                    let self = this;
                    this.widget.refreshElseSignout(
                        this,
                        err,
                        self.extractOrderDetails.bind(self, id, lineItemId)
                    );
                    } else if(err.status === 403) {
                        this.isForbidden = true;
                        this.showSpinner = false;
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

    getOrderDetails(id) {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken;
        }
        const data = JSON.stringify({order_id: id});
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/orders/list';
        return this.http
            .post(url, data, options)
            .map(res => {
                return res.json();
            }).share();
    }

    searchTemplates(id, lineItemId, existingOrder = false) {
        this.getTemplates().subscribe(
            response => {
                this.showSpinner = false;
                if (response && response.orgTemplates && response.orgTemplates.templates && response.orgTemplates.templates.length) {

                    const templates = [];
                    response.orgTemplates.templates.forEach(function (ele) {
                        templates.push({
                            id: ele.id,
                            text: ele.name,
                            isPublish: ele.is_publish === 'True' ? true : false
                        });
                    }, this);

                    if (!existingOrder) {

                        this.templates = templates.filter(function (x) {
                            return x.isPublish;
                        });

                        if (this.templates.length === 1) {
                            this.template = this.templates[0].id;
                            this.dataFieldConfiguration = [];
                            this.searchTemplateDetails(this.template);
                        }
                    } else {
                        this.templates = templates;
                        this.searchDateRequest(id, lineItemId);
                    }
                }
            },
            err => {
                if(err.status === 401) {
                    let self = this;
                    this.widget.refreshElseSignout(
                        this,
                        err,
                        self.searchTemplates.bind(self, existingOrder)
                    );
                    } else if(err.status === 403) {
                        this.isForbidden = true;
                        this.showSpinner = false;
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

    searchTemplateDetails(templateID, existingOrderInfo = null, lineItemId = null) {
        this.templateDefinition = [];
        this.getTemplateDetails(templateID).subscribe(
            response => {
                this.originalResponseObj = response;
                // Build Order Info
                if (response && response.orderTemplateData && response.orderTemplateData.orderFields && response.orderTemplateData.orderFields.length) {
                    response.orderTemplateData.orderFields.forEach(function (ele) {
                        let value =  ele.default_value || '';
                        if (existingOrderInfo && existingOrderInfo.order[ele.name] !== null) {
                            value = existingOrderInfo.order[ele.name];
                        }

                        const obj: any = {
                            id: ele.id,
                            calculated: ele.calculated,
                            label : ele.label,
                            name: ele.name,
                            type: ele.type,
                            validation : ele.validation,
                            value: value,
                            disabled : ele.disable !== 0,
                            size: 40
                        };

                        if (ele.type === 'list' || ele.type === 'checkbox' || ele.type === 'radio') {
                            obj.options = [];
                            if (ele.attr_list && ele.attr_list.options && ele.attr_list.options.length) {
                                ele.attr_list.options.forEach(function (option) {
                                    for(const prop in option) {
                                        obj.options.push({
                                            id : option[prop], //  this needs to be the ID which is right now coming as 'option' for all
                                            text: option[prop]
                                        });
                                    }
                                });
                            }
                        }

                        this.templateDefinition.push(obj);

                    }, this);

                    this.buildTemplateForm();

                    // Build Line Item Info
                    if (response && response.orderTemplateData && response.orderTemplateData.lineItems && response.orderTemplateData.lineItems.length) {

                        if (this.isOrderExtend) {
                            const lineItemBudgetIndex = response.orderTemplateData.lineItems.find(x=> x.name === 'campaign_line_item_budget');
                            if (lineItemBudgetIndex) {
                                response.orderTemplateData.lineItems.splice(response.orderTemplateData.lineItems.indexOf(lineItemBudgetIndex) + 1, 0 , {
                                    id: 1,
                                    name: 'additional_budget',
                                    label: 'Additional Budget',
                                    type: 'amount',
                                    default_value: null,
                                    attr_list: null,
                                    validation: [],
                                    placeholder: 0,
                                    temp_group: 'lineitem',
                                    request_type: null,
                                    request_url: null,
                                    request_payload: null,
                                    request_mapped_property: null,
                                    request_dependent_property: null
                                });
                            }
                        }

                        response.orderTemplateData.lineItems.forEach(function (ele) {

                            const obj: any = {
                                id: ele.id,
                                calculated: ele.calculated,
                                default_value: ele.default_value,
                                label : ele.label,
                                name: ele.name,
                                type: ele.type,
                                validation : ele.validation,
                                value: ele.default_value || '',
                                disabled : ele.disable !== 0,
                                request_type: ele.request_type,
                                request_url: ele.request_url,
                                request_payload: ele.request_payload,
                                request_mapped_property: ele.request_mapped_property
                            };

                            if (ele.type === 'list' || ele.type === 'checkbox' || ele.type === 'radio') {
                                obj.options = [];
                                if (ele.attr_list && ele.attr_list.options && ele.attr_list.options.length) {
                                    ele.attr_list.options.forEach(function (option) {
                                        for(const prop in option) {
                                            obj.options.push({
                                                key : option[prop], //  this needs to be the ID which is right now coming as 'option' for all
                                                text: option[prop]
                                            });
                                        }
                                    });
                                }
                            }

                            this.dataFieldConfiguration.push(obj);

                        }, this);
                    }

                    if (this.dataFieldConfiguration.length) {
                        this.buildLineItem(this.dataFieldConfiguration, existingOrderInfo, lineItemId);
                    }

                    // Perform API Lookup order field configuration
                    response.orderTemplateData.orderFields.forEach(function (ele) {
                        if (ele.validation && ele.validation.indexOf('apiLookup') !== -1 && ele.request_url) {
                            this.performRealApiLookUpForValue(ele, this.data.controls, null).subscribe(
                                responseLookup => {
                                    if(ele.request_mapped_property) {
                                        if (ele.type === 'list') {

                                            if( Object.prototype.toString.call( responseLookup[ele.request_mapped_property] ) === '[object Array]' ) {
                                                (<FormControl>this.form.controls[ele.name]).setValue(responseLookup[ele.request_mapped_property].length ? responseLookup[ele.request_mapped_property][0] : '');
                                                const options = [];

                                                options.push({ id: '', text: 'Empty'});

                                                responseLookup[ele.request_mapped_property].forEach(function (prop) {
                                                    if (typeof prop === 'object') {
                                                        options.push({
                                                            id: prop.key, text: prop.value
                                                        });
                                                    } else {
                                                        options.push({
                                                            id: prop, text: prop
                                                        });
                                                    }
                                                });
                                                responseLookup[ele.request_mapped_property].forEach(function (prop) {
                                                    this.data.controls.forEach(function (ctrl) {
                                                        if (ctrl.name === ele.name) {
                                                            ctrl.options = options;
                                                        }
                                                    }, this);
                                                }, this);

                                                if (this.existingOrder) {
                                                    (<FormControl>this.form.controls[ele.name]).setValue(this.existingOrder.order[ele.name]);
                                                }

                                            } else {
                                                (<FormControl>this.form.controls[ele.name]).setValue(responseLookup[ele.request_mapped_property]);
                                                this.data.controls.forEach(function (ctrl) {
                                                    if (ctrl.name === ele.name) {
                                                        ctrl.options = [{
                                                            id: responseLookup[ele.request_mapped_property], text: responseLookup[ele.request_mapped_property]
                                                        }];
                                                    }
                                                }, this);
                                            }
                                        } else {
                                            (<FormControl>this.form.controls[ele.name]).setValue(responseLookup[ele.request_mapped_property]);
                                        }
                                    }
                                },err => {
                                    if(err.status === 401) {
                                        let self = this;
                                        this.widget.refreshElseSignout(
                                            this,
                                            err,
                                            self.searchTemplateDetails.bind(self, templateID, existingOrderInfo, lineItemId)
                                        );
                                        } else if(err.status === 403) {
                                            this.isForbidden = true;
                                            this.showSpinner = false;
                                        } else {
                                        this.data.controls.forEach(function (ctrl) {
                                            if (ctrl.name === ele.name) {
                                                ctrl.options = [];
                                            }
                                        }, this);
                                    }
                                });
                        }
                    }, this);

                    // Perform API Lookup for line item configuration
                    if(!this.existingOrder) {
                        this.dataFieldConfiguration.forEach(function (lineItem) {
                            if (lineItem.validation && lineItem.validation.indexOf('apiLookup') !== -1 && lineItem.request_url) {
                                this.performRealApiLookUpForValue(lineItem, null).subscribe(
                                    responseLookup => {
                                        if(lineItem.request_mapped_property) {
                                            if (lineItem.type === 'list') {
                                                if( Object.prototype.toString.call( responseLookup[lineItem.request_mapped_property] ) === '[object Array]' ) {
                                                    lineItem.value =  responseLookup[lineItem.request_mapped_property].length ? responseLookup[lineItem.request_mapped_property][0] : ''
                                                    const options = [];
                                                    responseLookup[lineItem.request_mapped_property].forEach(function (prop) {

                                                        if (typeof prop === 'object') {
                                                            options.push({
                                                                key: prop.key, text: prop.value
                                                            });
                                                        } else {
                                                            options.push({
                                                                key: prop, text: prop
                                                            });
                                                        }
                                                    });
                                                    lineItem.options = options;
                                                } else {
                                                    lineItem.value = lineItem.default_value = responseLookup[lineItem.request_mapped_property];
                                                    lineItem.options = [{ key: responseLookup[lineItem.request_mapped_property], text: responseLookup[lineItem.request_mapped_property]}];
                                                }
                                            } else {
                                                lineItem.value =  responseLookup[lineItem.request_mapped_property];
                                            }
                                        }
                                    },err => {
                                        if(err.status === 401) {
                                            let self = this;
                                            this.widget.refreshElseSignout(
                                                this,
                                                err,
                                                self.searchTemplateDetails.bind(self, templateID, existingOrderInfo, lineItemId)
                                            );
                                            } else if(err.status === 403) {
                                                this.isForbidden = true;
                                                this.showSpinner = false;
                                            } else {
                                            lineItem.options = [];
                                        }
                                    });
                            }
                        }, this);
                    }

                } else {
                    this.buildTemplateForm();
                    this.buildLineItem(this.dataFieldConfiguration, existingOrderInfo, lineItemId);

                    // Perform API Lookup for line item configuration
                    if (!this.existingOrder) {
                        this.dataFieldConfiguration.forEach(function (lineItem) {
                            if (lineItem.validation && lineItem.validation.indexOf('apiLookup') !== -1 && lineItem.request_url) {
                                this.performRealApiLookUpForValue(lineItem, null).subscribe(
                                    responseLookup => {
                                        if(lineItem.request_mapped_property) {
                                            if (lineItem.type === 'list') {
                                                if( Object.prototype.toString.call( responseLookup[lineItem.request_mapped_property] ) === '[object Array]' ) {
                                                    lineItem.value =  responseLookup[lineItem.request_mapped_property].length ? responseLookup[lineItem.request_mapped_property][0] : ''
                                                    const options = [];
                                                    responseLookup[lineItem.request_mapped_property].forEach(function (prop) {

                                                        if (typeof prop === 'object') {
                                                            options.push({
                                                                key: prop.key, text: prop.value
                                                            });
                                                        } else {
                                                            options.push({
                                                                key: prop, text: prop
                                                            });
                                                        }
                                                    });
                                                    lineItem.options = options;
                                                } else {
                                                    lineItem.value = lineItem.default_value = responseLookup[lineItem.request_mapped_property];
                                                    lineItem.options = [{ key: responseLookup[lineItem.request_mapped_property], text: responseLookup[lineItem.request_mapped_property]}];
                                                }
                                            } else {
                                                lineItem.value =  responseLookup[lineItem.request_mapped_property];
                                            }
                                        }
                                    },err => {
                                        if (err.status === 401) {
                                            let self = this;
                                            this.widget.refreshElseSignout(
                                                this,
                                                err,
                                                self.searchTemplateDetails.bind(self, templateID, existingOrderInfo, lineItemId)
                                            );
                                        } else if(err.status === 403) {
                                            this.isForbidden = true;
                                            this.showSpinner = false;
                                          } else {
                                            lineItem.options = [];
                                        }
                                    });
                            }
                        }, this);
                    }
                }
            },
            err => {

                if(err.status === 401) {
                    let self = this;
                    this.widget.refreshElseSignout(
                        this,
                        err,
                        self.searchTemplateDetails.bind(self, templateID, existingOrderInfo, lineItemId)
                    );
                } else if(err.status === 403) {
                    this.isForbidden = true;
                    this.showSpinner = false;
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

    searchDateRequest(orderID, lineItemId) {

        console.log('lineItemId >>>>@@@')
        console.log(lineItemId);

        this.lineItemId = lineItemId;
        let self = this;
        this.searchDate(orderID).subscribe(
            response => {
                console.log('payment response >>')
                this.paymentReceived = !!response.data.order.payment_received_date;
                this.extractOrderDetails(orderID, lineItemId);
            },
            err => {
                if(err.status === 401) {
                    let self = this;
                    this.widget.refreshElseSignout(
                        this,
                        err,
                        self.searchDateRequest.bind(self, orderID, lineItemId)
                    );
                } else if(err.status === 403) {
                    this.isForbidden = true;
                    this.showSpinner = false;
                  } else {
                }
            }
        );
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

    getTemplates() {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }
        let org =this.orgValue;
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/orders/templates'+( org ? ('?org_uuid=' + org) : '');
        return this.http
            .get(url, options)
            .map(res => {
                return res.json();
            }).share();
    }

    getTemplateDetails(templateID) {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }

        const data = {
            template_id : templateID
        }

        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/orders/form';
        return this.http
            .post(url, data, options)
            .map(res => {
                return res.json();
            }).share();
    }

    performRealApiLookUpForValue(lineItem, formControls, dependentOn = null) {
        const requestType =  lineItem.request_type;
        let  requestUrl = lineItem.request_url;
        const requestPayload = lineItem.request_payload;

        if (typeof lineItem.request_dependent_property === 'string' ) {
            if (lineItem.request_dependent_property.indexOf(',') != -1) {
                lineItem.request_dependent_property = lineItem.request_dependent_property.split(',');
            } else {
                lineItem.request_dependent_property = [lineItem.request_dependent_property];
            }
        }

        const  requestDependentProperty = lineItem.request_dependent_property;
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        };

        if (requestDependentProperty && requestDependentProperty.length && ((formControls[dependentOn] && formControls[dependentOn].value && formControls[dependentOn].value !== -1) || (dependentOn === null))) {

            if (requestType.toLowerCase() === 'get') {

                let queryParams = '?';
                requestDependentProperty.forEach(function (prop, index) {
                    if (prop === lineItem.name) {
                        (<FormControl>this.form.controls[prop]).setValue(null);
                    }
                    queryParams += formControls[prop] && formControls[prop].value && formControls[prop].value !== -1 ? (prop + '=' + formControls[prop].value) : prop;
                    if (index !== (requestDependentProperty.length -1 )) {
                        queryParams += '&';
                    }
                }, this);

                requestUrl += queryParams;

            } else if (requestType.toLowerCase() === 'post') {
                requestPayload[lineItem.name] = null;
            }
        }

        const data = requestPayload ? requestPayload : {};
        const apiDomain = requestUrl && (requestUrl.indexOf('http://') !== -1 || requestUrl.indexOf('https://') !== -1) ? '' : this.api_fs.api;

        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        if(requestType === 'post') {
            return this.http
                .post(apiDomain + requestUrl, data, options)
                .map(res => {
                    return res.json();
                }).share();
        } else if (requestType === 'get') {
            return this.http
                .get(apiDomain + requestUrl, options)
                .map(res => {
                    return res.json();
                }).share();
        }
    }

    lineItemFormArray = new FormArray([]);

    addLineItem() {

        // this.dataRowUpdated = false;
        // setTimeout(function () {

        let formControl = {};
        const dataObj = {};

        this.dataFieldConfiguration.forEach(function (conf) {
            // console.log('conf >>')
            // console.log(conf);
            dataObj[conf.name] = conf.default_value ? conf.default_value : '';

           let valiFn = []; let asyncValiFn = [];
            let dict = {};

            if( conf.validation && Validators[ conf.validation[0] ]  ) {
                valiFn = [ Validators[ conf.validation[0] ] ]
                asyncValiFn.push({updateOn: 'blur'});

                // dict['validators'] = [ Validators[ conf.validation[0] ] ];
                // dict['updateOn'] = 'blur';
            }


            formControl[conf.name] = new FormControl('', valiFn, asyncValiFn)
            // formControl[conf.name] = new FormControl('', dict)

        }, this);

        // this.lineItemForm =  new FormGroup(formControl)
        dataObj['form'] = new FormGroup(formControl)
        // TODO: Maybe remove since Not used at the moment
        this.lineItemFormArray.push(dataObj['form'])


        console.log('dataObj >>')
        console.log(dataObj);

        // this.gridDataResult.push(dataObj);
        // this.dataRowUpdated = false;
        // __this.dataObject.gridData.result = this.gridDataResult;
        // __this.dataRowUpdated = true;

        this.dataObject.gridData.result.push(dataObj);
        this.dataRowUpdatedLen = this.dataObject.gridData.result.length;

        // this.appDataTable2Component.table.row.add(dataObj);

        // __this.dataRowUpdated = true;

        // }, 100);

        // this.appDataTable2Component.table.row.add(dataObj).draw(false);

    }

    removeLineItem() {
        if(this.selectedRow) {
            // this.dataRowUpdated = false;
            const __this = this;
            // setTimeout(function () {
            __this.dataObject.gridData.result.splice(__this.selectedRow.rowIndex, 1);
            this.dataRowUpdatedLen = this.dataObject.gridData.result.length;
            // }, 100);
        }
    }

    OnTemplateChange(e) {
        if (e.value && e.value !== this.template) {
            this.template = e.value;
            this.dataFieldConfiguration = [];
            this.searchTemplateDetails(this.template);
        }
    }

    OnSelectValueChange(e, name, def) {

        console.log('e.value >>')
        console.log(e.value);

        console.log('this.FormModel.attributes[name].value >>')
        console.log(this.FormModel.attributes[name].value)

        if (e.value !== this.FormModel.attributes[name].value) {
            if (e.value) {
                (<FormControl>this.form.controls[name]).setValue(e.value);
            }
            const dependOnFields = this.originalResponseObj.orderTemplateData.orderFields.filter(function (field) {
                return field.request_dependent_property && field.name !== def.name && field.request_dependent_property.indexOf(def.name) !== -1;
            });

            console.log('def >>')
            console.log(def);

            console.log('dependOnFields >>>')
            console.log(dependOnFields);

            if (dependOnFields.length) {
                dependOnFields.forEach(function (ele) {
                    if (ele.request_url) {
                        this.performRealApiLookUpForValue(ele, this.form.controls, name).subscribe(
                            responseLookup => {
                                if(ele.request_mapped_property) {
                                    if (ele.type === 'list') {
                                        if( Object.prototype.toString.call( responseLookup[ele.request_mapped_property] ) === '[object Array]' ) {
                                            (<FormControl>this.form.controls[ele.name]).setValue(responseLookup[ele.request_mapped_property].length ? responseLookup[ele.request_mapped_property][0] : '');
                                            const options = [];

                                            options.push({ id: '', text: 'Empty'});
                                            responseLookup[ele.request_mapped_property].forEach(function (prop) {

                                                if (typeof prop === 'object') {
                                                    options.push({
                                                        id: prop.key, text: prop.value
                                                    });
                                                } else {
                                                    options.push({
                                                        id: prop, text: prop
                                                    });
                                                }
                                            });
                                            this.data.controls.forEach(function (ctrl) {
                                                if (ctrl.name === ele.name) {
                                                    if (this.existingOrder && !this.originalResponseObj.orderTemplateData.orderFields.find(x => x.name === ele.name).valueExtracted) {
                                                        const corr = options.filter(function (op) {
                                                            return op.id === this.existingOrder.order[ele.name];
                                                        }, this);

                                                        console.log('corr >>>')
                                                        console.log(corr);

                                                        if (corr && corr.length) {
                                                            ctrl.options = options;
                                                            (<FormControl>this.form.controls[ele.name]).setValue(this.existingOrder.order[ele.name]);
                                                            this.originalResponseObj.orderTemplateData.orderFields.find(x => x.name === ele.name).valueExtracted = true;
                                                        }
                                                    } else {
                                                        ctrl.options = options;
                                                    }

                                                }
                                            }, this);

                                            // if (this.existingOrder && !this.originalResponseObj.orderTemplateData.orderFields.find(x=> x.name === ele.name).valueExtracted) {
                                            //     (<FormControl>this.form.controls[ele.name]).setValue(this.existingOrder.order[ele.name]);
                                            //    // this.FormModel.attributes[name].value = this.existingOrder.order[ele.name];
                                            //     this.originalResponseObj.orderTemplateData.orderFields.find(x=> x.name === ele.name).valueExtracted = true;
                                            // }

                                        } else {
                                            (<FormControl>this.form.controls[ele.name]).setValue(responseLookup[ele.request_mapped_property]);
                                            this.data.controls.forEach(function (ctrl) {
                                                if (ctrl.name === ele.name) {
                                                    ctrl.options = [{
                                                        id: responseLookup[ele.request_mapped_property], text: responseLookup[ele.request_mapped_property]
                                                    }];
                                                }
                                            }, this);
                                        }
                                    } else {
                                        (<FormControl>this.form.controls[ele.name]).setValue(responseLookup[ele.request_mapped_property]);
                                    }
                                }
                            },err => {
                                if(err.status === 401) {
                                    // let self = this;
                                    // this.widget.refreshElseSignout(
                                    //     this,
                                    //     err,
                                    //     self.searchTemplates.bind(self)
                                    // );
                                } else if(err.status === 403) {
                                    this.isForbidden = true;
                                    this.showSpinner = false;
                                  } else {
                                    this.data.controls.forEach(function (ctrl) {
                                        if (ctrl.name === ele.name) {
                                            ctrl.options = [];
                                        }
                                    }, this);
                                }
                            });
                    }
                }, this);
            }
        }
    }

    buildTemplateForm() {

        const attributes = {};
        const group = {};
        this.data.controls = this.templateDefinition;

        this.data.controls.forEach(function(item) {
            attributes[item.name] = '';
            group[item.name] = (item.validation && item.validation.length && item.validation.indexOf('required') !== -1) ? ['', Validators.compose([Validators.required])] : [''];
        }, this);

        // Model object
        this.FormModel = {
            attributes: attributes
        };

        this.form = this.formAttribute.group(group);
        this.data.controls.forEach(function(item) {
            this.FormModel.attributes[item.name] = this.form.controls[item.name];
            // populate values
            (<FormControl>this.form.controls[item.name]).setValue(item.value || '');
        }, this);
    }

    buildLineItem(lineItemDef, existingOrderInfo = null, lineItemId = null) {
        this.dataObject = {};
        this.gridData = {};
        this.gridData['result'] = [];
        const headers = [];
        const lineItemRows = [];

        lineItemDef.forEach(function (key) {
            if (key.calculated !== 1) {
                headers.push({
                    key: key.name,
                    title: key.label.replace(/_/g, ' ').toUpperCase() + (key.validation && key.validation.length && key.validation.indexOf('required') !== -1 ? ' * ' : ''),
                    data: key.name,
                    isFilterRequired: true,
                    isCheckbox: false,
                    class: 'nocolvis',
                    editButton: false,
                    width: '150'
                });
            }
        });

        if (existingOrderInfo && existingOrderInfo.lineItems && existingOrderInfo.lineItems.length) {

            console.log('existingOrderInfo.lineItems >>')
            console.log(existingOrderInfo.lineItems);

            existingOrderInfo.lineItems.forEach(function (ele, index) {

                const obj: any = {};
                let formControl = {};

                lineItemDef.forEach(function (line) {
                    if (ele[line.name] !== null) {
                        if (lineItemId) {
                            obj.suppliedId = lineItemId;
                        }
                        obj.id = ele.id;
                        obj[line.name] = ele[line.name] && ele[line.name].toString().indexOf('T00:00:00.000Z') !== -1 ? ele[line.name].split('T')[0] : ele[line.name];

                        formControl[line.name] = new FormControl(ele[line.name])
                    }

                });

                // Obj
                obj['form'] = new FormGroup(formControl)
                // Obj/

                lineItemRows.push(obj);
            }, this);
        }

        this.gridData['headers'] = headers;
        this.gridData['options'] = this.options[0];
        if (lineItemRows.length) {
            this.gridData['result'] = lineItemRows;
        }
        this.dashboard = 'orderLineItem';
        this.dataObject.gridData = this.gridData;
        this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
        this.dataObject.paymentReceived = this.paymentReceived;
    }

    onCheckItem(event, item, itemValue) {

        const value = typeof item.value === 'string' ? [item.value] : item.value;

        if (event.target.checked) {
            if (value.indexOf(itemValue) === -1) {
                value.push(itemValue);
            }
        } else {
            value.splice(value.indexOf(itemValue), 1);
        }

        //item.value = value;

        (<FormControl>this.form.controls[item.name]).setValue(value || '');
    }

    handleCheckboxSelection(rowObj: any, rowData: any) {
        console.log('this.selectedRow >>')
        console.log(this.selectedRow);
        this.selectedRow = rowObj;
    }

    handleUnCheckboxSelection(rowObj: any, rowData: any) {
        this.selectedRow = null;
    }

    handleRowSelection(rowObj: any, rowData: any) {

    }

    handleActions(ev: any) {
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

    OnCancel() {
        Swal({
            title: 'Are you sure you want to cancel the changes?',
            text: "All unsaved changes would be lost",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                this.router.navigate(['/app/order/orders']);
            }
        });
    }

    OnSubmit() {

        console.log('this.originalResponseObj >>')
        console.log(this.originalResponseObj);

        this.showSpinner = true;

        const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
        const reqObj: any = {};

        // if (!this.vendor_id) {
        //     this.vendor_id = customerInfo.vendor ? customerInfo.vendor.vendor_id : null;
        // }

        if (!this.orderId) {
            reqObj.vendor_id =  customerInfo.vendor ? customerInfo.vendor.vendor_id : null;
            reqObj.org_id = customerInfo.org.org_id;
            reqObj.template_id = this.originalResponseObj.orderTemplateData.template.template_id;
        };
        reqObj.orderDetail = {
            orderFields : [],
            lineItems: []
        };

        this.data.controls.forEach(function (ele, index) {
            const corr = this.form.controls[ele.name];
            if (corr) {
                if (ele.type === 'date' && this.form.controls[ele.name].value) {
                    ele.value = this.form.controls[ele.name].value._d ? this.formatDate(new Date(this.form.controls[ele.name].value._d)) : this.formatDate(new Date(this.form.controls[ele.name].value));
                } else {
                    ele.value = corr.value;
                }
            }

            reqObj.orderDetail.orderFields.push({
                field_id: ele.id,
                field_value: ele.value,
                name: ele.name
            });
        }, this);

        const lineItems = [];

        let extendedLineItemIndex = -1;
        if (this.dataObject.gridData.result.length && this.originalResponseObj.orderTemplateData.lineItems && this.originalResponseObj.orderTemplateData.lineItems.length) {
            this.dataObject.gridData.result.forEach(function (ele, index) {

                if (ele.suppliedId == ele.id && this.lineItemId) {
                    extendedLineItemIndex = index;
                }

                const objArr = [];
                for (const prop in ele) {

                    const obj: any = {};
                    const corr = this.originalResponseObj.orderTemplateData.lineItems.find(x=> x.name === prop);
                    if (corr) {
                        obj.field_id = corr.id;
                        obj.field_value = ele[prop];
                        obj.name = corr.name;
                        // We need to include only those keys in final request dataObj
                        // Whose, new value is not equal to its formControl's Original value
                        // obj.formControl = ele.form.controls[prop]
                        obj._original_value =  ele.form.controls[prop]._value
                    }

                    if (obj.field_id) {
                        objArr.push(obj);
                    }
                }

                lineItems.push(objArr);
            }, this);
        }

        if (this.orderId) {
            lineItems.forEach(function (lItem, index) {
                const obj: any = {};
                obj.lineItemFields = lItem;
                obj.line_item_id = this.existingOrder.lineItems[index] ? this.existingOrder.lineItems[index].id : null;
                reqObj.orderDetail.lineItems.push(obj);
            }, this);
        } else {
            reqObj.orderDetail.lineItems = lineItems;
        }

        if (this.orderId) {
            reqObj.order_id = this.orderId;
        }

        if (this.isOrderExtend && extendedLineItemIndex > -1) {

            const dataObj: any = {};
            dataObj.order_id = this.orderId;
            dataObj.line_item_id = this.lineItemId;

            reqObj.orderDetail.lineItems[extendedLineItemIndex].lineItemFields.forEach(function (item) {
                if (item.name && item.name !== 'line_item_id') {

                    if (item.name === 'end_date') {
                        const d = new Date(item.field_value);
                        d.setHours(0,0,0, 0);
                        d.setDate(d.getDate() + 1);

                        if (d.getTime() > new Date(item._original_value).getTime()) {
                            dataObj['extended_end_date'] = item.field_value;
                        }
                    } else if (item.name === 'additional_budget' && item.field_value > 0) {
                        dataObj['extended_item_budget'] = item.field_value;
                    } else {
                        dataObj[item.name] = item.field_value;
                    }
                }
            });

            console.log('reqObj.orderDetail.lineItems[extendedLineItemIndex].lineItemFields >>>')
            console.log(reqObj.orderDetail.lineItems[extendedLineItemIndex].lineItemFields);

            console.log('dataObj >>>')
            console.log(dataObj);

            const displayLineItemObj = reqObj.orderDetail.lineItems[extendedLineItemIndex].lineItemFields.find(x=> x.name === 'line_item_id');
            const displayLineItemId = displayLineItemObj ? displayLineItemObj.field_value : this.lineItemId;

            this.submitLineItemExtensionData(dataObj).subscribe(
                response => {
                    if (response) {
                        this.showSpinner = false;
                        Swal({
                            title: 'Line Item Extended',
                            text: 'The Line Item ' + displayLineItemId + ' was successfully extended',
                            type: 'success'
                        }).then(() => {
                            // this.router.navigate(['/app/targetAud/']);
                            this.router.navigate(['/app/order/orders']);
                        });
                    }
                },
                err => {
                    if(err.status === 401) {
                        let self = this;
                        this.widget.refreshElseSignout(
                            this,
                            err,
                            self.OnSubmit.bind(self)
                        );
                    } else if(err.status === 403) {
                        this.isForbidden = true;
                        this.showSpinner = false;
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
        } else {
            this.submitData(reqObj).subscribe(
                response => {
                    if (response) {

                        console.log('reqObj >>')
                        console.log(reqObj);

                        this.showSpinner = false;
                        Swal({
                            title: 'Order Successfully ' + (this.orderId ? 'Updated' : 'Submitted'),
                            text: 'Your order was successfully ' + (this.orderId ? 'updated' : 'submitted') + '.You will now be directed to payment page where you will be able to choose from any existing payment methods on file or can add a new payment method',
                            type: 'success'
                        }).then(() => {
                            // this.router.navigate(['/app/targetAud/']);
                            // TODO: Commenting For the moment
                            this.router.navigate(['/app/orderPayment/' + response.order_id, this.userUuid]);
                            // this.router.navigate(['/app/orderPayment/' + response.order_id, this.vendor_id]);
                        });
                    }
                },
                err => {
                    if(err.status === 401) {
                        let self = this;
                        this.widget.refreshElseSignout(
                            this,
                            err,
                            self.OnSubmit.bind(self)
                        );
                    } else if(err.status === 403) {
                        this.isForbidden = true;
                        this.showSpinner = false;
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
    }

    submitData(reqObj) {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        const data = JSON.stringify(reqObj);
        const url = this.api_fs.api + '/api/orders/create';
        if (reqObj.order_id) {
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

    submitLineItemExtensionData(reqObj) {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        const data = JSON.stringify(reqObj);
        const url = this.api_fs.api + '/api/orders/extend';
        return this.http
            .post(url, data, options)
            .map(res => {
                return res.json();
            }).share();
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    getSelect2Value(def) {
        return (this.existingOrder && !this.originalResponseObj.orderTemplateData.orderFields.find(x=> x.name === def.name).valueExtracted ? this.FormModel.attributes[def.name].value : def.value);
    }

    searchOrgRequest() {
        return this.searchOrgData().subscribe(
            response => {
              if (response && response.data) {
                response.data.forEach(function (ele) {
                  this.orgArr.push({
                    id: ele.org_uuid,
                    text: ele.org_name,
                    ord_id: ele.id
                  });
                }, this);

                if (this.orgArr.length) {
                  this.orgValue = this.orgArr[0].id;
                  this.searchTemplates(null, null , false);
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
            } else if(err.status === 403) {
                this.isForbidden = true;
                this.showSpinner = false;
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
    OnOrgChange(e) {
        if (e.value && e.value !== this.orgValue) {
        this.showSpinner = true;
        this.orgValue = e.value;
        this.data.controls = '';
        this.dataObject = '';
        this.template='';
        this.templates = [];
        this.dataObject = {};
        this.data.controls = {};
        this.templateDefinition = [];
        this.searchTemplates(null, null , false);
        }
    }
}

