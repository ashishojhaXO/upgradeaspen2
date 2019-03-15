/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import {ChangeDetectorRef, Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, FormArray, Validators} from '@angular/forms';
import {Http, Headers, RequestOptions} from '@angular/http';
import {finalize, map} from 'rxjs/operators';
import { DomSanitizer} from '@angular/platform-browser';
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in-no-jquery';

@Component({
  selector: 'app-transition',
  templateUrl: './transition.component.html',
  styleUrls: ['./transition.component.scss']
})
export class TransitionComponent implements OnInit {

  api_fs; any;
  externalAuth: any;
  error: any;
  showSpinner: any;
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

  constructor(private route: ActivatedRoute, private router: Router, private http: Http, private sanitizer: DomSanitizer, private changeDetectorRef: ChangeDetectorRef) {
    this.showSpinner = false;
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.performActions();
  }

  ngOnInit() {
  }

  performActions() {
    this.showSpinner = true;
    return this.getCustomerInfo().subscribe(
      responseDetails => {
        this.showSpinner = false;
        if (responseDetails.body && responseDetails.body.length) {
          console.log('responseDetails.body[0] >>')
          console.log(responseDetails)
          localStorage.setItem('loggedInUserGroup', JSON.stringify(responseDetails.body[0].groups));
          localStorage.setItem('customerInfo', JSON.stringify(responseDetails.body[0]));
          localStorage.setItem('customerStatus', responseDetails.body[0].external_status);
          localStorage.setItem('loggedInUserName', responseDetails.body[0].user.first_name + ' ' + responseDetails.body[0].user.last_name);
          localStorage.setItem('loggedInUserEmail', responseDetails.body[0].user.email_id);
          this.checkForAppAccess();
          //  this.router.navigate(['./app/dashboards']);

        } else {
          this.error = 'No User details found. Please contact administrator';
          console.log('No Vendor details found');
        }
      },
      err => {
        this.showSpinner = false;
        this.error = 'Error Fetching User Details . Please contact administrator';
        console.log('err cust details')
        console.log(err);
      }
    );
  }

  checkForAppAccess() {
    const groupArr = [];
    const groups = JSON.parse(localStorage.getItem('customerInfo')) || '';
    if (groups && groups.groups) {
      const grp = groups.groups;
      grp.forEach(function (item) {
        if (item.profile && item.profile.name) {
          groupArr.push(item.profile.name);
        }
      });
    }

    console.log('groupArr >>>')
    console.log(groupArr);

    let access = true;
    if (groupArr.length) {
      groupArr.forEach(function (grp) {
        if (grp === 'thd-vendors') {
          access = false;
        }
      });
    }

    if (!access) {
      this.logout();
    } else {
      this.router.navigate(['./app/dashboards']);
    }
  }

  logout() {
    this.widget.signOut(() => {
      this.changeDetectorRef.detectChanges();
     // this.router.navigate(['./login'],{ queryParams: { error: '401' } });
      window.location.href = '/login?error=401';
    });
  }

  getOktaAccessToken(): any {
    const clientID = this.externalAuth.clientId;
    const clientSecret = this.externalAuth.clientSecret;
    // const clientSecret = '9Q3H9aEHDXewOSQUg3qqmT7PbJg86YSrXBXpqH43';
    const oktaAuthToken = btoa(clientID + ':' + clientSecret);
    console.log('this.externalAuth >>');
    console.log(this.externalAuth);
    console.log('oktaAuthToken >>');
    console.log(oktaAuthToken);
    const headers = new Headers({'Content-Type': 'application/json',
      'Authorization': 'Basic ' + oktaAuthToken, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const url = this.api_fs.api + '/authtoken/token';
    return this.http
        .get(url, options)
        .pipe(map((response: any) =>
            response.json()
        ));
  }

  getCustomerInfo(): any {
    const token = localStorage.getItem('accessToken');
    const headers = new Headers({'Content-Type': 'application/json' , 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});
    const urserID = localStorage.getItem('loggedInUserID') || '';
    const url = this.api_fs.api + '/api/users/' + urserID + '/external';
    return this.http
        .get(url, options)
        .pipe(map((response: any) =>
            response.json()
        ));
  }

}
