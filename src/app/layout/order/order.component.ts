/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

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
    isDownload: true,
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
  isExistingOrder = false;
  dataFieldConfiguration = [];
  templates = [];
  template = '';
  templateDefinition = [];
  data: any = {};
  FormModel: any;
  public form: FormGroup;
  formAttribute: any;
  dataRowUpdated = false;
  minDate = new Date();

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http, fb: FormBuilder,) {
    this.formAttribute = fb;
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchTemplates();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isExistingOrder = true;
      }
    });
  }

  searchTemplates() {
    this.getTemplates().subscribe(
        response => {
          console.log('response >>')
          console.log(response);

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
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.showSpinner = false;
                    this.searchTemplates();
                  })
                  .catch(function (err) {
                    console.log('error >>')
                    console.log(err);
                  });
            } else {
              this.widget.signOut(() => {
                this.widget.tokenManager.remove('accessToken');
                window.location.href = '/login';
              });
            }
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  searchTemplateDetails(templateID) {
    this.getTemplateDetails(templateID).subscribe(
        response => {
          if (response && response.orderTemplateData && response.orderTemplateData.orderFields && response.orderTemplateData.orderFields.length) {
            response.orderTemplateData.orderFields.forEach(function (ele) {

              const obj: any = {
                label : ele.label,
                name: ele.name,
                type: ele.type,
                validation : ele.validation,
                value: ele.value || '',
                disabled : ele.disable !== 0,
                size: 40
              };

              if (ele.type === 'list') {
                obj.options = [];
                if (ele.attr_list && ele.attr_list.options && ele.attr_list.options.length) {
                  ele.attr_list.options.forEach(function (option) {
                    for(const prop in option) {
                      obj.options.push({
                        id : prop,
                        text: option[prop]
                      });
                    }
                  });
                }
              }

              this.templateDefinition.push(obj);

            }, this);

            this.buildTemplateForm();

            if (response && response.orderTemplateData && response.orderTemplateData.lineItems && response.orderTemplateData.lineItems.length) {
              response.orderTemplateData.lineItems.forEach(function (ele) {

                const obj: any = {
                  label : ele.label,
                  name: ele.name,
                  type: ele.type,
                  validation : ele.validation,
                  value: ele.value || '',
                  disabled : ele.disable !== 0
                };

                if (ele.type === 'list') {
                  obj.options = [];
                  if (ele.attr_list && ele.attr_list.options && ele.attr_list.options.length) {
                    ele.attr_list.options.forEach(function (option) {
                      for(const prop in option) {
                        obj.options.push({
                          key : prop,
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
              this.buildLineItem(this.dataFieldConfiguration);
            }

          }
        },
        err => {

          if(err.status === 401) {
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.showSpinner = false;
                    this.getTemplateDetails(templateID);
                  })
                  .catch(function (err) {
                    console.log('error >>')
                    console.log(err);
                  });
            } else {
              this.widget.signOut(() => {
                this.widget.tokenManager.remove('accessToken');
                window.location.href = '/login';
              });
            }
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  getTemplates() {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
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
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
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

  addLineItem() {

    this.dataRowUpdated = false;
    const __this = this;
    setTimeout(function () {
      const dataObj = {};
      __this.dataFieldConfiguration.forEach(function (conf) {
        dataObj[conf.name] = '';
      });
      __this.dataObject.gridData.result.push(dataObj);
      __this.dataRowUpdated = true;
    }, 100);
  }

  removeLineItem() {

  }

  OnTemplateChange(e) {
    if (e.value && e.value !== this.template) {
      this.template = e.value;
      this.searchTemplateDetails(this.template);
    }
  }

  OnSelectValueChange(e, def) {
    if (e.value && e.value !== def.value) {
      def.value = e.value;
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

  buildLineItem(lineItemDef) {
    this.dataObject = {};
    this.gridData = {};
    this.gridData['result'] = [];
    const headers = [];

    lineItemDef.forEach(function (key) {
      headers.push({
        key: key.name,
        title: key.name.replace(/_/g,' ').toUpperCase(),
        data: key.name,
        isFilterRequired: true,
        isCheckbox: false,
        class: 'nocolvis',
        editButton: false,
        width: '150'
      });
    });

    // const dataObj = {};
    // lineItemDef.forEach(function (conf) {
    //   dataObj[conf.name] = '10/01/2019';
    // });

    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];
    // this.gridData['result'] = [dataObj];
    this.dashboard = 'orderLineItem';
    this.dataObject.gridData = this.gridData;
  }

  searchDataRequest() {
    return this.searchData().subscribe(
        response => {
          if (response) {
            if (response) {
              this.populateDataTable(response, true);
              this.showSpinner = false;
            }
          }
        },
        err => {

          if(err.status === 401) {
            if(this.widget.tokenManager.get('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    this.widget.tokenManager.add('accessToken', newToken);
                    this.showSpinner = false;
                    this.searchDataRequest();
                  })
                  .catch(function (err) {
                    console.log('error >>')
                    console.log(err);
                  });
            } else {
              this.widget.signOut(() => {
                this.widget.tokenManager.remove('accessToken');
                window.location.href = '/login';
              });
            }
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  searchData() {
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

  populateDataTable(response, initialLoad) {

    this.dataObject = {};
    const tableData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    const headers = [];

    console.log('tableData >>>')
    console.log(tableData);

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
    this.gridData['options'] = this.options[0];
    this.gridData.columnsToColor = [
      { index: 11, name: 'MERCHANT PROCESSING FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 15, name: 'LINE ITEM MEDIA BUDGET', color: 'rgb(47,132,234,0.2)'},
      { index: 16, name: 'KENSHOO FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 17, name: 'THD FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 10, name: 'LINE ITEM TOTAL BUDGET', color: 'rgb(47,132,234,0.4)'}
    ];
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleRowSelection(rowObj: any, rowData: any) {

  }
}
