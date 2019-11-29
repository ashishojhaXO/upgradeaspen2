import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { OktaAuthService } from '../../../services/okta.service';
import { Headers, RequestOptions, Http } from '@angular/http';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-order-template',
  templateUrl: './order-template.component.html',
  styleUrls: ['./order-template.component.scss']
})
export class OrderTemplateComponent implements OnInit {

  @ViewChild('orderForm') orderForm;
  @ViewChild('lineItemForm') lineItemForm;

  templateForm: FormGroup;
  organizations = [];
  attributesArray = [];
  templateResponse:any = {};
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  editTemplate: boolean = false;
  templateId: any;
  templateField = [];

  constructor(private okta: OktaAuthService, private http: Http,private route: ActivatedRoute) { }

  ngOnInit() {
    this.showSpinner = true;
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    this.getOrganizations();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.templateId = {
          "template_id": +params['id']
        };
        this.editTemplate = true;
        this.getTemplate(this.templateId);
      }
    });

    this.formOnInIt();
  }

  formOnInIt() {
    this.templateForm = new FormGroup({
      templateName: new FormControl(null, Validators.required),
      orgName: new FormControl(null, Validators.required)
    });
  }

  getOrganizations(){
    this.getOrganizationService().subscribe(
      response => {
        console.log('response >>')
        console.log(response);
        if (response && response.org_list) {
          response.org_list.forEach(function (ele) {
            this.organizations.push({
              id: ele.id,
              text: ele.org_name
            });
          }, this);
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.organizations)
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  localStorage.setItem('accessToken', newToken);
                  this.showSpinner = false;
                  this.getOrganizations();
                })
                .catch(function (err) {
                  console.log('error >>')
                  console.log(err);
                });
          } else {
            this.widget.signOut(() => {
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            });
          }
        } else {
          this.showSpinner = false;
        }
      }
    );
  }

  getOrganizationService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/organizations';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  onSubmitTemplate() {
    if(this.templateForm.valid){
      if(this.orderForm.model.attributes.length && this.lineItemForm.model.attributes.length){
        this.templateResponse.template_id = "";
        this.templateResponse.template_name = this.templateForm.value.templateName;
        this.templateResponse.org_id = this.templateForm.value.orgName;
        let orderFields = [];
        let lineItems = [];
        this.orderForm.model.attributes.forEach(element => {
          orderFields.push(_.pick(element, ['id', 'name', 'label', 'type', 'attr_list', 'default_value', 'disable', 'validation']))
        });
        this.lineItemForm.model.attributes.forEach(element => {
          lineItems.push(_.pick(element, ['id', 'name', 'label', 'type', 'attr_list', 'default_value', 'disable', 'validation']))
        });

        // create flat array for validation properties
          orderFields.forEach(function (ele) {
              const validationArr = [];
              for(const prop in ele.validation) {
                  if(prop === 'required' && ele.validation[prop] === 1) {
                      validationArr.push(prop);
                  }
              }
              ele.validation = validationArr;
          });
          lineItems.forEach(function (ele) {
              const validationArr = [];
              for(const prop in ele.validation) {
                  if(prop === 'required' && ele.validation[prop] === 1) {
                      validationArr.push(prop);
                  }
              }
              ele.validation = validationArr;
          });

        this.templateResponse.orderTemplateData = {
          orderFields : orderFields,
          lineItems : lineItems
        }
        console.log('templateResponse>>>>>', this.templateResponse);
        this.createTemplate(this.templateResponse);
      }
      else{
        if(!this.orderForm.model.attributes.length){
          Swal({
            title: 'Incomplete Template',
            html: '<h5>Please add fields for order!</h5>',
            type: 'warning'
          })
        }else {
          Swal({
            title: 'Incomplete Template',
            html: '<h5>Please add fields for line item!</h5>',
            type: 'warning'
          })
        }
      }
    }
  }

  createTemplate(template){
    this.createTemplateService(template).subscribe(
      response => {
        console.log('response >>')
        console.log(response);
        if (response && response.status == 200) {
          response.message
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>', response.message);
          Swal({
            title: 'Template successfully ' + this.editTemplate ? 'modified' : 'generated',
            text: response.message,
            type: 'success'
          })
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  localStorage.setItem('accessToken', newToken);
                  this.showSpinner = false;
                  this.createTemplateService(template);
                })
                .catch(function (err) {
                  console.log('error >>')
                  console.log(err);
                });
          } else {
            this.widget.signOut(() => {
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            });
          }
        } else {
          this.showSpinner = false;
        }
      }
    );
  }

  createTemplateService(template){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    template.template_id = this.editTemplate ? this.templateId.template_id : '';
    const data = JSON.stringify(template);
    var url = this.api_fs.api + '/api/orders/templates/create';
    if(this.editTemplate) {
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


  getTemplate(templateId){
    this.getTemplateService(templateId).subscribe(
      response => {
        if (response && response.status == 200) {
          console.log('template edit fields', response);
          this.templateField = response.orderTemplateData;
          console.log('template edit fields array', this.templateField);
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  localStorage.setItem('accessToken', newToken);
                  this.showSpinner = false;
                  this.getTemplateService(templateId);
                })
                .catch(function (err) {
                  console.log('error >>')
                  console.log(err);
                });
          } else {
            this.widget.signOut(() => {
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            });
          }
        } else {
          this.showSpinner = false;
        }
      }
    );
  }

  getTemplateService(templateId) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(templateId);
    var url = this.api_fs.api + '/api/orders/form';
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }
}
