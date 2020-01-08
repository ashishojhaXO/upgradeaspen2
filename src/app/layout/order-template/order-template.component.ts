import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { OktaAuthService } from '../../../services/okta.service';
import { Headers, RequestOptions, Http } from '@angular/http';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';


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
  templateField: any;
  orderFieldsArr = [];
  lineFieldsArr = [];
  isPublished:boolean = false;

  constructor(private okta: OktaAuthService, private http: Http,private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.showSpinner = true;
    // this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.templateId = {
          "template_id": +params['id']
        };
        this.editTemplate = true;
        this.getTemplate(this.templateId);
      } else {
        this.getOrganizations();
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
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.organizations);
          this.showSpinner = false;
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            console.log("ord-temp no okt if")
            // this.widget.tokenManager.refresh('accessToken')
            //     .then(function (newToken) {
            //       localStorage.setItem('accessToken', newToken);
            //       this.showSpinner = false;
            //       this.getOrganizations();
            //     })
            //     .catch(function (err) {
            //       console.log('error >>')
            //       console.log(err);
            //     });
          } else {
            console.log("ord-temp no okt else")
            // this.widget.tokenManager.refresh('accessToken')
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

  getOrganizationService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
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
        if (this.isPublished){
          this.templateResponse.isPublish = 1;
        }else {
          this.templateResponse.isPublish = 0;
        }
        let orderFields = [];
        let lineItems = [];
        this.orderForm.model.attributes.forEach(element => {
          orderFields.push(_.pick(element, ['id', 'name', 'label', 'type', 'attr_list', 'default_value', 'validation', 'request_type', 'request_url', 'request_payload', 'request_mapped_property' ]))
        });
        this.lineItemForm.model.attributes.forEach(element => {
          lineItems.push(_.pick(element, ['id', 'name', 'label', 'type', 'attr_list', 'default_value', 'validation', 'request_type', 'request_url', 'request_payload', 'request_mapped_property']))
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

  onPublishForm(){
    if(this.templateForm.valid){
      this.isPublished = true;
    }
    this.onSubmitTemplate();
  }

  createTemplate(template){
    this.createTemplateService(template).subscribe(
      response => {
        console.log('response >>')
        console.log(response);
        if (response && response.status == 200) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>', response.message);
          let status;
          if(this.isPublished){
            status = "published"
          }else{
            if(this.editTemplate){
              status = "modified"
            }else{
              status = "generated"
            }
          }
          Swal({
            title: 'Template successfully ' + status,
            text: response.message,
            type: 'success'
          }).then( () => {
              this.router.navigate(['/app/admin/ordertemplatelist']);
            }
          )
        }
      },
      err => {
        console.log('err >>>')
        console.log(err)
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
          Swal({
            title: 'Error',
            text: err._body ? (err._body.indexOf(':') !== -1 ? err._body.split(':')[1] : err._body) : 'An Error occurred',
            type: 'error'
          })
          this.showSpinner = false;
        }
      }
    );
  }

  createTemplateService(template){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
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
          this.showSpinner = false;
          console.log('template edit fields', response);
          this.templateField = response.orderTemplateData;
          this.orderFieldsArr = this.templateField.orderFields;
          this.lineFieldsArr = this.templateField.lineItems;
          if(this.templateField.template.hasOwnProperty('isPublish')){
            this.isPublished = this.templateField.template.isPublish;
          } else {
            this.isPublished = false;
          }
          this.templateForm.controls['templateName'].setValue(this.templateField.template.template_name);
          this.templateForm.controls['orgName'].setValue(this.templateField.organizaion.org_id);
          console.log('template edit fields array', this.templateField);
          this.getOrganizations();
        }
        else{
          this.showSpinner = false;
          Swal({
            title: 'Error',
            text: response.message,
            type: 'warning'
          }).then( () => {
              this.router.navigate(['/app/admin/ordertemplatelist']);
            }
          )
        }
      },
      err => {
        console.log('err >>')
        console.log(err);
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
          Swal({
            title: 'Error',
            text: err._body ? (err._body.indexOf(':') !== -1 ? err._body.split(':')[1] : err._body) : 'An Error occurred',
            type: 'error'
          })
          this.showSpinner = false;
        }
      }
    );
  }

  getTemplateService(templateId) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
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

  cloneForm(){
    this.isPublished = false;
    this.editTemplate = false;
    this.templateResponse.template_id = "";
    this.templateForm.controls['templateName'].setValue(this.templateField.template.template_name + '_clone');
  }
}
