import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { OktaAuthService } from '../../../services/okta.service';
import { Headers, RequestOptions, Http } from '@angular/http';
import * as _ from 'lodash';


@Component({
  selector: 'app-base-fields',
  templateUrl: './baseFields.component.html',
  styleUrls: ['./baseFields.component.scss']
})
export class BaseFieldsComponent implements OnInit {

  @ViewChild('baseForm') baseForm;

  attributes:any = {};
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;

  constructor(private okta: OktaAuthService, private http: Http) { }

  ngOnInit() {
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

  }

  onSubmitTemplate() {
    this.showSpinner = true;
    if(this.baseForm.model.attributes.length){
      let baseItems = [];
      this.baseForm.model.attributes.forEach(element => {
        baseItems.push(_.pick(element, ['name', 'type']))
      });
      this.attributes =  {
        "attributes": baseItems
      };
      console.log('template base Response>>>>>', this.attributes);
      this.createBase(this.attributes);
    }
    else{
      Swal({
        title: 'No Fields',
        html: '<h5>Please make base fields!</h5>',
        type: 'warning'
      })
    }
  }

  createBase(template){
    let self = this;
    this.createBaseService(template).subscribe(
      response => {
        console.log('response >>')
        console.log(response);
        this.showSpinner = false;
        if (response && response.status == 200) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>', response.message);
          Swal({
            title: 'Base fields generated',
            text: response.message,
            type: 'success'
          })
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken', self.createBaseService.bind(self, template) );
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

  createBaseService(template){
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(template);
    var url = this.api_fs.api + '/api/orders/templates/attributes/create';
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }
}
