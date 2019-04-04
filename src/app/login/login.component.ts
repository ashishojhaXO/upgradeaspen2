/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { OktaAuthService } from '../../../src/services/okta.service';
import { Common } from '../shared/util/common';
import {Http, Headers, RequestOptions} from '@angular/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  title = 'Fusion Seven';
  api_fs: any;
  externalAuth: any;
  error: any;
  widget;

  constructor(private okta: OktaAuthService, private common: Common, private changeDetectorRef: ChangeDetectorRef, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

    this.widget = this.okta.getWidget();

    this.error = '';
    this.route.queryParams.subscribe(params => {
      if (params) {
        if(params.error == 401 ) {
          this.error = 'You are not authorized to access this application';
        }
      }
    });

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    // get session Info
    this.widget.session.get((response) => {
      if (response.status !== 'INACTIVE') {
        localStorage.setItem('loggedInUserID', response.userId);
        window.location.href = 'transition';
      } else {
        this.showLogin();
      }
    });
  }

  showLogin() {
    this.widget.renderEl({
        el: '#okta-signin-container'},
      (res) => {
        if (res.status === 'SUCCESS') {
          this.widget.tokenManager.add('accessToken', res[1]);
          localStorage.setItem('loggedInUserName', res[0].claims.name);
          localStorage.setItem('loggedInUserID', res[0].claims.sub);
          this.changeDetectorRef.detectChanges();
          this.performActions();
        }
      },
      (err1) => {
        this.error = err1;
        throw err1;
      }
    );
  }

  performActions() {
    return this.getCustomerInfo().subscribe(
      responseDetails => {
        if (responseDetails.body && responseDetails.body.length) {
          if( responseDetails.body[0].groups && responseDetails.body[0].groups.length) {
            localStorage.setItem('loggedInUserGroup', JSON.stringify(responseDetails.body[0].groups));
          }
          localStorage.setItem('customerInfo', JSON.stringify(responseDetails.body[0]));
          localStorage.setItem('customerStatus', responseDetails.body[0].external_status);
          localStorage.setItem('loggedInUserName', responseDetails.body[0].user.first_name + ' ' + responseDetails.body[0].user.last_name);
          localStorage.setItem('loggedInUserEmail', responseDetails.body[0].user.email_id);
          this.router.navigate(['./app/dashboards']);
        } else {
          this.changeDetectorRef.detectChanges();
          this.error = 'No User details found. Please contact administrator';
          console.log('No Vendor details found');
        }
      },
      err => {
        if(err.status === 401) {
          if(this.widget.tokenManager.get('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  this.widget.tokenManager.add('accessToken', newToken);
                  this.performActions();
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
          this.error = err;
        }
      }
    );
  }

  getCustomerInfo(): any {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json' , 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});
    const urserID = localStorage.getItem('loggedInUserID') || '';
    const url = this.api_fs.api + '/api/users/' + urserID + '/external';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }
}
