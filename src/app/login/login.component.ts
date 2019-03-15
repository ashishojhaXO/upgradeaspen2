/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in-no-jquery';
import { Common } from '../shared/util/common';
import * as ENVCONFIG from '../../constants/env';
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

  widget = new OktaSignIn({
    logo: 'https://op1static.oktacdn.com/bc/image/fileStoreRecord?id=fs0iw1hhzapgSwb4s0h7', // Try changing "okta.com" to other domains, like: "workday.com", "splunk.com", or "delmonte.com"
    language: 'en',                       // Try: [fr, de, es, ja, zh-CN] Full list: https://github.com/okta/okta-signin-widget#language-and-text
    i18n: {
      'en': {
        'primaryauth.title': 'Sign In',   // Changes the sign in text
        'primaryauth.submit': 'Sign In',  // Changes the sign in button
      }
    },
    baseUrl: JSON.parse(localStorage.getItem('externalAuth')).api,
    clientId: JSON.parse(localStorage.getItem('externalAuth')).clientId,
    redirectUri: JSON.parse(localStorage.getItem('apis_fs')).redirectUrl + '/app/dashboards',
    authParams: {
      issuer: 'default',
      responseType: ['id_token', 'token'],
      scopes: ['openid', 'email', 'profile']
    }
  });

  constructor(private common: Common, private changeDetectorRef: ChangeDetectorRef, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

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
          localStorage.setItem('loggedInUserName', res[0].claims.name);
          localStorage.setItem('loggedInUserID', res[0].claims.sub);
          localStorage.setItem('accessToken', res[1].accessToken);
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
          this.router.navigate(['./app/dashboards']);
        }
      },
      err => {
        this.error = err;
      }
    );
  }

  getOktaAccessToken(): any {
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const url = this.api_fs.api + '/authtoken/token';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }

  getCustomerInfo(): any {
    const token = localStorage.getItem('accessToken');
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
