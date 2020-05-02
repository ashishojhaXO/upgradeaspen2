import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { OktaAuthService } from '../../../services/okta.service';
import { Headers, RequestOptions, Http } from '@angular/http';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import set = Reflect.set;


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
  orgInfo: any;
  orgArr = [];
  selectedOrg: any;
  orgValue = '';
  orgUUID = '';
  isRoot: boolean;
  select2Options = {
     placeholder: { id: '', text: 'Select organization' }
  };

  constructor(private okta: OktaAuthService, private http: Http,private route: ActivatedRoute, private router: Router) {
    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const custInfo =  JSON.parse(localStorage.getItem('customerInfo') || '');
    this.orgInfo = custInfo.org;

    console.log('custInfo >>>')
    console.log(custInfo);

    const grp = JSON.parse(groups);
    grp.forEach(function (item) {
      if(item === 'ROOT' || item === 'SUPER_USER') {
        this.isRoot = true;
      }
    }, this);
   }

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
      orgName: new FormControl(null, this.isRoot ? Validators.required: null)
    });
  }

  getOrganizations(){
    this.getOrganizationService().subscribe(
      response => {
        console.log('getOrgani response >>')
        console.log(response);
        if (response && response.org_list) {
          this.organizations.push({ id: '', text: 'Empty', org_uuid : ''});
          response.org_list.forEach(function (ele) {
            this.organizations.push({
              id: ele.id,
              org_uuid: ele.org_uuid,
              text: ele.org_name
            });
          }, this);
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.organizations);
          this.showSpinner = false;
        }
      },
      err => {
        if(err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.getOrganizations.bind(self)
          );
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
        if(this.isRoot){
         this.templateResponse.org_uuid = this.organizations.find(x => x.id == this.templateForm.value.orgName).org_uuid;
        }
        if (this.isPublished){
          this.templateResponse.isPublish = 1;
        }else {
          this.templateResponse.isPublish = 0;
        }
        let orderFields = [];
        let lineItems = [];
        this.orderForm.model.attributes.forEach(element => {
          orderFields.push(_.pick(element, ['id', 'name', 'label', 'type', 'attr_list', 'default_value', 'validation', 'request_type', 'request_url', 'request_payload', 'request_mapped_property', 'request_dependent_property' ]))
        });
        this.lineItemForm.model.attributes.forEach(element => {
          lineItems.push(_.pick(element, ['id', 'name', 'label', 'type', 'attr_list', 'default_value', 'validation', 'request_type', 'request_url', 'request_payload', 'request_mapped_property', 'request_dependent_property']))
        });

        orderFields.forEach(function (order) {
          if(order.request_dependent_property && order.request_dependent_property.length) {
            order.request_dependent_property = order.request_dependent_property.join(',');
          }
        });

        lineItems.forEach(function (line) {
          if(line.request_dependent_property && line.request_dependent_property.length) {
            line.request_dependent_property = line.request_dependent_property.join(',');
          }
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
        if (response) {
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
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.createTemplate.bind(self, template)
            );
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
        if (response) {
          this.showSpinner = false;
          console.log('template edit fields', response);
          this.templateField = response.orderTemplateData;
          this.orderFieldsArr = this.templateField.orderFields;

          console.log('this.orderFieldsArr >>>')
            console.log(this.orderFieldsArr);

          if (this.orderFieldsArr.length) {
            this.orderFieldsArr.forEach(function (field) {
              if (field.request_dependent_property) {
                if (field.request_dependent_property.indexOf(',') != -1) {
                  field.request_dependent_property = field.request_dependent_property.split(',');
                } else {
                  field.request_dependent_property = [field.request_dependent_property];
                }
              }
            });
          }

          this.lineFieldsArr = this.templateField.lineItems;
          if(this.templateField.template.hasOwnProperty('isPublish')){
            this.isPublished = this.templateField.template.isPublish;
          } else {
            this.isPublished = false;
          }
          this.templateForm.controls['templateName'].setValue(this.templateField.template.template_name);

          console.log('this.templateField.organizaion.org_id >>')
            console.log(this.templateField.organizaion.org_id);

          this.orgValue = this.templateField.organizaion.org_id;
          this.orgUUID = this.organizations.find( x=> x.id == this.orgValue).org_uuid;
          this.templateForm.controls['orgName'].setValue(this.templateField.organizaion.org_id);
          console.log('template edit fields array', this.templateField);
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
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getTemplate.bind(self, templateId)
            );
        } else {
          Swal({
            title: 'An error occurred',
            html: err._body ? JSON.parse(err._body).message : 'No error definition available',
            type: 'error'
          });
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

  cloneForm() {
    this.isPublished = false;
    this.editTemplate = false;
    this.templateResponse.template_id = "";
    this.templateForm.controls['templateName'].setValue(this.templateField.template.template_name + '_clone');
  }

    OnOrgChange(e) {
      console.log('e >>>')
        console.log(e);
        if (e.value && e.value !== this.orgValue) {
            if (this.orgValue) {
                Swal({
                    title: 'Change Organization ?',
                    text: 'Changing the organization would replace fields list and remove selected fields',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes'
                }).then( (result) => {
                    if (result.value) {
                        this.orgValue = e.value;
                        this.templateForm.controls['orgName'].setValue(this.orgValue);
                        this.orgUUID = this.organizations.find( x=> x.id == this.orgValue).org_uuid;
                        this.orderFieldsArr = [];
                    } else {
                        const oldValue = JSON.parse(JSON.stringify(this.orgValue));
                        this.orgValue = '';
                        const __this = this;
                        setTimeout(function () {
                            __this.orgValue = oldValue;
                        }, 500);
                    }
                });
            } else {
                this.orgValue = e.value;
                this.templateForm.controls['orgName'].setValue(this.orgValue);
                this.orgUUID = this.organizations.find( x=> x.id == this.orgValue).org_uuid;
                this.orderFieldsArr = [];
            }

            console.log('orderFieldsArr >>>')
            console.log(this.orderFieldsArr);
        }
    }
}
