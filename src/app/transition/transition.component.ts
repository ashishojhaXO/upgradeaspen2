/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import {ChangeDetectorRef, Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
// import {FormControl, FormGroup, FormArray, Validators} from '@angular/forms';
import {Http, Headers, RequestOptions} from '@angular/http';
import {finalize, map} from 'rxjs/operators';
import { DomSanitizer} from '@angular/platform-browser';
import { OktaAuthService } from '../../../src/services/okta.service';

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
  widget;

  constructor(
    private okta: OktaAuthService, 
    private route: ActivatedRoute, private router: Router, private http: Http, private sanitizer: DomSanitizer, private changeDetectorRef: ChangeDetectorRef) {
    this.showSpinner = false;
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.performActions();
  }

  ngOnInit() {
  }

  performActions() {
    this.showSpinner = true;
    this.widget = this.okta.getWidget();
    this.getCustomerInfoRequest();
  }

  getCutomerInfoSuccess(responseDetails) {
          this.showSpinner = false;

          if (responseDetails.body && responseDetails.body) {
            // if( responseDetails.body[0].groups && responseDetails.body[0].groups.length) {
            localStorage.setItem('loggedInUserGroup', JSON.stringify([responseDetails.body.user.user_role]));
            // }
            // if (responseDetails.body.user.email_id.indexOf('fusionseven') !== -1) {
            //   localStorage.setItem('loggedInUserGroup', JSON.stringify([{
            //     profile : {
            //       name : 'fs-employee'
            //     }
            //   }]));
            // }
            localStorage.setItem('customerInfo', JSON.stringify(responseDetails.body));
            localStorage.setItem('customerStatus', responseDetails.body.user.status);
            localStorage.setItem('loggedInUserName', responseDetails.body.user.first_name + ' ' + responseDetails.body.user.last_name);
            localStorage.setItem('loggedInUserEmail', responseDetails.body.user.email_id);
            localStorage.setItem('loggedInOrg', responseDetails.body.org && responseDetails.body.org.org_name ? responseDetails.body.org.org_name : 'Org Name');
            this.checkForAppAccess();
          } else {
            this.error = 'No User details found. Please contact administrator';
            console.log('No Vendor details found');
          }
  }

  getCutomerInfoError(err){
          console.log('err >>>')
          console.log(err);
          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              const self = this;
              this.widget.tokenManager.refresh('accessToken')
                  .then(function (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    // TODO: this is undefined here, check
                    console.log("THIS:: this: ", this, " self: ", self)
                    this.showSpinner = false;
                    this.getCustomerInfoRequest();
                  })
                  .catch(function (err1) {
                    console.log('error >>')
                    console.log(err1);
                  });
            } 
            else {
              this.widget.signOut(() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              });
            }
          } else {
            this.showSpinner = false;
            this.error = err;
          }
  }

  getCustomerInfoRequest() {
    return this.getCustomerInfo().subscribe(
        responseDetails => {
          this.getCutomerInfoSuccess(responseDetails);
        },
        err => {
          this.getCutomerInfoError(err)
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
      console.log("!access logout")
      this.logout();
    } else {
      this.router.navigate(['./app/dashboards']);
    }
  }

  logout() {
    this.widget.signOut(() => {
      localStorage.removeItem('accessToken');
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
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json' , 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});

    // TODO: no UserId getting sent by the server yet, so it's empty.
    const urserID = localStorage.getItem('loggedInUserID') || '';

    const url = this.api_fs.api + '/api/users/' + urserID + '/external';
    return this.http
        .get(url, options)
        .pipe(map((response: any) =>
            response.json()
        ));
  }

}
