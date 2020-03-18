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
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import Swal from 'sweetalert2';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit  {

  gridData: any;
  dataObject: any;
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

  // gridDataResult: Object[] = new Array(Object);
  gridDataResult: Object[] = [];

  @ViewChild ( AppDataTable2Component )
  private appDataTable2Component : AppDataTable2Component;

  constructor(
    // private okta: OktaAuthService,
    private route: ActivatedRoute, private router: Router, private http: Http, fb: FormBuilder,) {
    this.formAttribute = fb;
  }

  ngOnInit() {

    this.showSpinner = true;
    // this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchTemplates();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.searchDateRequest(params['id'], params['lineItemId']);
        // if(this.templates.length) {
        //   this.template = '41';
        //   this.searchTemplateDetails(this.template);
        // }
      }
    });
  }

  extractOrderDetails(id, lineItemId = null) {
    this.getOrderDetails(id).subscribe(
        response => {
          this.showSpinner = false;
          this.orderId = id;
          if (response.orders && response.orders.length && response.orders[0].order && response.orders[0].order.temp_id) {
            this.existingOrder = response.orders[0];
            this.template = response.orders[0].order.temp_id;
            this.searchTemplateDetails(this.template, this.existingOrder, lineItemId);
          }
        },
        err => {
          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              console.log("ord no okt if")
              // this.widget.tokenManager.refresh('accessToken')
              //     .then(function (newToken) {
              //       localStorage.setItem('accessToken', newToken);
              //       this.showSpinner = false;
              //       this.searchTemplates();
              //     })
              //     .catch(function (err) {
              //       console.log('error >>')
              //       console.log(err);
              //     });
            } else {
              console.log("ord no okt else")
              // this.widget.signOut(() => {
              //   localStorage.removeItem('accessToken');
              //   window.location.href = '/login';
              // });
            }
          } else {
            this.showSpinner = false;
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

  searchTemplates() {
    this.getTemplates().subscribe(
        response => {
          this.showSpinner = false;
          if (response && response.orgTemplates && response.orgTemplates.templates && response.orgTemplates.templates.length) {
            response.orgTemplates.templates.forEach(function (ele) {
              this.templates.push({
                id: ele.id,
                text: ele.name
              });
            }, this);
          }
        },
        err => {

          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              console.log("ord no okt if")
              // this.widget.tokenManager.refresh('accessToken')
              //     .then(function (newToken) {
              //       localStorage.setItem('accessToken', newToken);
              //       this.showSpinner = false;
              //       this.searchTemplates();
              //     })
              //     .catch(function (err) {
              //       console.log('error >>')
              //       console.log(err);
              //     });
            } else {
              console.log("ord no okt else")
              // this.widget.signOut(() => {
              //   localStorage.removeItem('accessToken');
              //   window.location.href = '/login';
              // });
            }
          } else {
            this.showSpinner = false;
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
              response.orderTemplateData.lineItems.forEach(function (ele) {

                const obj: any = {
                  id: ele.id,
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
            if(!this.existingOrder) {
              response.orderTemplateData.orderFields.forEach(function (ele) {
                if (ele.validation && ele.validation.indexOf('apiLookup') !== -1) {
                  this.performApiLookUpForValue(ele.request_type, ele.request_url, ele.request_payload).subscribe(
                      responseLookup => {
                        if(ele.request_mapped_property) {
                           if (ele.type === 'list') {
                             if( Object.prototype.toString.call( responseLookup[ele.request_mapped_property] ) === '[object Array]' ) {
                               (<FormControl>this.form.controls[ele.name]).setValue(responseLookup[ele.request_mapped_property].length ? responseLookup[ele.request_mapped_property][0] : '');
                               const options = [];
                               responseLookup[ele.request_mapped_property].forEach(function (prop) {
                                 options.push({
                                   id: prop, text: prop
                                 });
                               });
                               responseLookup[ele.request_mapped_property].forEach(function (prop) {
                                 this.data.controls.forEach(function (ctrl) {
                                   if (ctrl.name === ele.name) {
                                     ctrl.options = options;
                                   }
                                 }, this);
                               });
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
                      });
                  }
              }, this);
            }

            // Perform API Lookup for line item configuration
            if(!this.existingOrder) {
              this.dataFieldConfiguration.forEach(function (lineItem) {
                if (lineItem.validation && lineItem.validation.indexOf('apiLookup') !== -1) {
                  this.performApiLookUpForValue(lineItem.request_type, lineItem.request_url, lineItem.request_payload).subscribe(
                      responseLookup => {
                        if(lineItem.request_mapped_property) {
                          if (lineItem.type === 'list') {
                            if( Object.prototype.toString.call( responseLookup[lineItem.request_mapped_property] ) === '[object Array]' ) {
                              lineItem.value =  responseLookup[lineItem.request_mapped_property].length ? responseLookup[lineItem.request_mapped_property][0] : ''
                              const options = [];
                              responseLookup[lineItem.request_mapped_property].forEach(function (prop) {
                                options.push({
                                  key: prop, text: prop
                                });
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
                      });
                }
              }, this);
            }

          } else {
            this.buildTemplateForm();
            this.buildLineItem(this.dataFieldConfiguration, existingOrderInfo, lineItemId);

            // Perform API Lookup for line item configuration
            if(!this.existingOrder) {
              this.dataFieldConfiguration.forEach(function (lineItem) {
                if (lineItem.validation && lineItem.validation.indexOf('apiLookup') !== -1) {
                  this.performApiLookUpForValue(lineItem.request_type, lineItem.request_url, lineItem.request_payload).subscribe(
                      responseLookup => {
                        if(lineItem.request_mapped_property) {
                          if (lineItem.type === 'list') {
                            if( Object.prototype.toString.call( responseLookup[lineItem.request_mapped_property] ) === '[object Array]' ) {
                              lineItem.value =  responseLookup[lineItem.request_mapped_property].length ? responseLookup[lineItem.request_mapped_property][0] : ''
                              const options = [];
                              responseLookup[lineItem.request_mapped_property].forEach(function (prop) {
                                options.push({
                                  key: prop, text: prop
                                });
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
              self.getTemplateDetails.bind(self, templateID)
            );
          } else {
            this.showSpinner = false;
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
                self.searchDateRequest.bind(self, orderID),
            );

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
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/templates';
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

  performApiLookUpForValue(requestType, requestUrl, requestPayload) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const data = requestPayload ? requestPayload : {};

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    if(requestType === 'post') {
      return this.http
          .post(requestUrl, data, options)
          .map(res => {
            return res.json();
          }).share();
    } else if(requestType === 'get') {
      return this.http
          .get(requestUrl, options)
          .map(res => {
            return res.json();
          }).share();
    }
  }

  addLineItem() {

    // this.dataRowUpdated = false;

    const __this = this;

    // setTimeout(function () {

      const dataObj = {};
      __this.dataFieldConfiguration.forEach(function (conf) {

        console.log('conf >>')
        console.log(conf);

        dataObj[conf.name] = conf.default_value ? conf.default_value : '';
      });


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
      this.searchTemplateDetails(this.template);
    }
  }

  OnSelectValueChange(e, name) {
    if (e.value && e.value !== this.FormModel.attributes[name].value) {
      (<FormControl>this.form.controls[name]).setValue(e.value);
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

    console.log('this.data.controls >>')
    console.log(this.data.controls);

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

      headers.push({
        key: key.name,
        title: key.label.replace(/_/g,' ').toUpperCase() + ( key.validation && key.validation.length && key.validation.indexOf('required') !== -1 ? ' * ' : '' ),
        data: key.name,
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      });
    });

    if (existingOrderInfo && existingOrderInfo.lineItems && existingOrderInfo.lineItems.length) {

      existingOrderInfo.lineItems.forEach(function (ele, index) {
        const obj: any = {};
        lineItemDef.forEach(function (line) {
          if (ele[line.name] !== null) {
            if (lineItemId) {
              obj.suppliedId = lineItemId;
            }
            obj.id = ele.id;
            obj[line.name] = ele[line.name] && ele[line.name].toString().indexOf('T00:00:00.000Z') !== -1 ? ele[line.name].split('T')[0] : ele[line.name];
          }
        });
        lineItemRows.push(obj);
      }, this);
    }

    console.log('lineItemRows >>>')
    console.log(lineItemRows);

    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];
    if (lineItemRows.length) {
      this.gridData['result'] = lineItemRows;
    }
    this.dashboard = 'orderLineItem';
    this.dataObject.gridData = this.gridData;
    this.dataObject.paymentReceived = this.paymentReceived;

    console.log('this.dataObject >>>')
    console.log(this.dataObject);
  }

  onCheckItem(event, item, itemValue) {

    console.log('event.target.checked >>')
    console.log(event.target.checked)
    console.log('item >>')
    console.log(item)
    console.log('itemValue >>')
    console.log(itemValue)

    const value = typeof item.value === 'string' ? [item.value] : item.value;

    if (event.target.checked) {
      if (value.indexOf(itemValue) === -1) {
        value.push(itemValue);
      }
    } else {
      value.splice(value.indexOf(itemValue), 1);
    }

    console.log('value >>')
    console.log(value);

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
    if (!this.orderId) {
      reqObj.vendor_id =  customerInfo.vendor.vendor_id;
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

    console.log('reqObj >>')
    console.log(reqObj);

    const lineItems = [];

    let extendedLineItemIndex = -1;
    if (this.dataObject.gridData.result.length && this.originalResponseObj.orderTemplateData.lineItems && this.originalResponseObj.orderTemplateData.lineItems.length) {

     console.log('this.dataObject.gridData.result >>>')
      console.log(this.dataObject.gridData.result);

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
          }

          if (obj.field_id) {
            objArr.push(obj);
          }
        }
        lineItems.push(objArr);
      }, this);
    }

    if(this.orderId) {
      lineItems.forEach(function (lItem, index) {
        const obj: any = {};
        obj.lineItemFields = lItem;
        obj.line_item_id = this.existingOrder.lineItems[index].id;
        reqObj.orderDetail.lineItems.push(obj);
      }, this);
    } else {
      reqObj.orderDetail.lineItems = lineItems;
    }

    if (this.orderId) {
      reqObj.order_id = this.orderId;
    }

    if (extendedLineItemIndex > -1) {

      const dataObj: any = {};
      dataObj.order_id = this.orderId;
      dataObj.line_item_id = this.lineItemId;
      reqObj.orderDetail.lineItems[extendedLineItemIndex].lineItemFields.forEach(function (item) {
        if (item.name && item.name !== 'line_item_id') {
          if (item.name === 'end_date') {
            dataObj['extended_end_date'] = item.field_value;
          } else {
            dataObj[item.name] = item.field_value;
          }
        }
      });

      console.log('dataObj >>>')
      console.log(dataObj);

      this.submitLineItemExtensionData(dataObj).subscribe(
          response => {
            if (response) {
              this.showSpinner = false;
              Swal({
                title: 'Line Item Extended',
                text: 'The Line Item ' + this.lineItemId + ' was successfully extended',
                type: 'success'
              }).then(() => {
                // this.router.navigate(['/app/targetAud/']);
                this.router.navigate(['/app/order/orders']);
              });
            }
          },
          err => {
            this.showSpinner = false;
            Swal({
              title: 'Order ' + (this.orderId ? 'Update' : 'Submission') + ' Failed',
              html: 'An error occurred while ' + (this.orderId ? 'updating' : 'submitting') + ' the order. Please try again',
              type: 'error'
            });
          }
      );
    } else {
      this.submitData(reqObj).subscribe(
          response => {
            if (response) {
              this.showSpinner = false;
              Swal({
                title: 'Order Successfully ' + (this.orderId ? 'Updated' : 'Submitted'),
                text: 'Your order was successfully ' + (this.orderId ? 'updated' : 'submitted') + '.You will now be directed to payment page where you will be able to choose from any existing payment methods on file or can add a new payment method',
                type: 'success'
              }).then(() => {
                // this.router.navigate(['/app/targetAud/']);
                this.router.navigate(['/app/orderPayment/' + response.order_id]);
              });
            }
          },
          err => {
            this.showSpinner = false;
            Swal({
              title: 'Order ' + (this.orderId ? 'Update' : 'Submission') + ' Failed',
              html: 'An error occurred while ' + (this.orderId ? 'updating' : 'submitting') + ' the order. Please try again',
              type: 'error'
            });
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
}
