import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { OktaAuthService } from '../../../services/okta.service';
import { Headers, RequestOptions, Http } from '@angular/http';
import * as _ from 'lodash';


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

  constructor(private okta: OktaAuthService, private http: Http) { }

  ngOnInit() {
    this.showSpinner = true;
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    this.getOrganizations();
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
          if(this.widget.tokenManager.get('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  this.widget.tokenManager.add('accessToken', newToken);
                  this.showSpinner = false;
                  this.getOrganizations();
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

  getOrganizationService() {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
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
            html: '<h5>Please make template for order!</h5>',
            type: 'warning'
          })
        }else {
          Swal({
            title: 'Incomplete Template',
            html: '<h5>Please make template for line item!</h5>',
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
            title: 'Template generated',
            text: response.message,
            type: 'success'
          })
        }
      },
      err => {
        if(err.status === 401) {
          if(this.widget.tokenManager.get('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  this.widget.tokenManager.add('accessToken', newToken);
                  this.showSpinner = false;
                  this.createTemplateService(template);
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

  createTemplateService(template){
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(template);
    var url = this.api_fs.api + '/api/orders/templates/create';
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }
}