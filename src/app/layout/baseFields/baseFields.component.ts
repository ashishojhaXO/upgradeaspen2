import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { OktaAuthService } from '../../../services/okta.service';
import { Headers, RequestOptions, Http } from '@angular/http';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';


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
  isRoot: boolean;
  org: string;
  orgArr = [];
  clearSelectedFields = false;
  select2Options = {
    // placeholder: { id: '', text: 'Select organization' }
  };
  orgValue = '';
  isForbidden:boolean = false;

  constructor(private okta: OktaAuthService, private http: Http, private route: ActivatedRoute, private router: Router, ) { }

  ngOnInit() {
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const grp = JSON.parse(groups);

    console.log('grp >>>')
    console.log(grp);

    let isUser = false;
    grp.forEach(function (item) {
      if (item === 'USER') {
        isUser = true;
      }
      else if(item === 'ROOT' || item === 'SUPER_USER') {
        this.isRoot = true;

        this.searchOrgRequest();
      }
    }, this);


  }

  onSubmitTemplate() {
    // this.showSpinner = true;

    if(this.baseForm.model.attributes.length){
      let baseItems = [];
      this.baseForm.model.attributes.forEach(element => {
        baseItems.push(_.pick(element, ['name', 'type']))
      });

      this.attributes =  {
        "attributes": baseItems
      };

      if (this.isRoot) {
        this.attributes.org_uuid = this.orgValue ? this.orgValue : null;
      }

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

  searchOrgRequest() {
    return this.searchOrgData().subscribe(
        response => {
          if (response && response.data) {
            this.orgArr.push({ id: '', text: 'All'});
            response.data.forEach(function (item) {
              this.orgArr.push({
                id: item.org_uuid,
                text: item.org_name
              });
            }, this);
          }
        },
        err => {

          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    this.showSpinner = false;
                    this.searchOrgRequest();
                  })
                  .catch(function (err1) {
                    console.log('error >>')
                    console.log(err1);
                  });
            } else {
              this.widget.signOut(() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              });
            }
          } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  orgChange(value) {
    // this.dataObject.isDataAvailable = false;
    this.org = value;
    // this.searchDataRequest(value);
  }

  createBase(template){
    this.createBaseService(template).subscribe(
      response => {
        console.log('response >>')
        console.log(response);
        this.showSpinner = false;
        if (response) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>', response.message);
          Swal({
            title: 'Base fields generated',
            text: response.message,
            type: 'success'
          }).then((result) => {
          //  this.orgValue = '';
            this.clearSelectedFields = true;
            const __this = this;
            setTimeout(function () {
              __this.clearSelectedFields = false;
              __this.router.navigate(['/app/admin/basefieldslist']);
            }, 1000);
          });
        }
      },
      err => {
        if(err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.createBase.bind(self, template)
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

  OnOrgChange(e) {
    if (e.value && e.value !== this.orgValue) {
      this.orgValue = e.value;
    }
  }
}
