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
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in-no-jquery';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  // loginForm: FormGroup;
  // forgotForm: FormGroup;
  // isForgotContainer: boolean = false;
  // formError: string = null;

  constructor(private okta: OktaAuthService, private common: Common, private changeDetectorRef: ChangeDetectorRef, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {
    //this.formOnInit();
    const widgetConfig = this.okta.getWidgetConfig();

    this.error = '';
    this.route.queryParams.subscribe(params => {
      if (params) {
        if(params.error == 401 ) {
          this.error = 'You are not authorized to access this application';
        } else if (params['Welcome']) {
          widgetConfig.i18n.en['primaryauth.title'] = 'Your account has been activated. You may login now with your credentials';
        }
      }
    });

    this.widget = new OktaSignIn(widgetConfig);

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

  // private formOnInit(){
  //   this.loginForm = new FormGroup({
  //     'userData': new FormGroup({
  //       'userEmail': new FormControl(null, Validators.required),
  //       'password': new FormControl(null, Validators.required)
  //     }),
  //     'saveLogin': new FormControl(false)
  //   });
  //   this.forgotForm = new FormGroup({
  //     'forgotEmail': new FormControl(null, Validators.required)
  //   });
  //   //checking cookie for remember me functionallity
  //   let rememberName = this.common.getCookie('ln');
  //   if(rememberName){
  //     this.loginForm.patchValue({
  //         'userData':{
  //           'userEmail': rememberName
  //         }
  //     });
  //   };
  // }

  // onSubmitLoginForm(){
  //   if(this.loginForm.valid){
  //     let userData = this.loginForm.get('userData').value;
  //     let saveLogin = this.loginForm.get('saveLogin').value;
  //     //console.log('user data:', userData);
  //     //setting remember me coookie
  //     if(saveLogin){
  //       const expdate = 365*24*60*60*1000;
  //       this.common.setLoginCookie('ln', userData.userEmail, expdate);
  //     }
  //     //login api comes here
  //     //this.formError //for error handling
  //     //this.loginForm.reset();
  //   }
  // }

  // onSubmitForgotForm(){
  //   if(this.forgotForm.valid){
  //     let forgotEmail = this.forgotForm.get('forgotEmail').value;
  //     //console.log('forgot Email:', forgotEmail)
  //     //forgot api comes here
  //     //this.formError //for error handling
  //     this.isForgotContainer = false;
  //   }
  // }

  showLogin() {
    this.widget.renderEl({
        el: '#okta-signin-container'},
      (res) => {
        if (res.status === 'SUCCESS') {
          localStorage.setItem('accessToken', res[1]);
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

        console.log('responseDetails >>>')
        console.log(responseDetails);

        if (responseDetails.body && responseDetails.body) {
          // if( responseDetails.body[0].groups && responseDetails.body[0].groups.length) {
           localStorage.setItem('loggedInUserGroup', JSON.stringify([responseDetails.body.user.user_role]));
          // }
          // if (responseDetails.body.user.email_id.indexOf('fusionseven') !== -1) {
          //    localStorage.setItem('loggedInUserGroup', JSON.stringify([{
          //      profile : {
          //        name : 'fs-employee'
          //      }
          //    }]));
          // }
          localStorage.setItem('customerInfo', JSON.stringify(responseDetails.body));
          localStorage.setItem('customerStatus', responseDetails.body.user.status);
          localStorage.setItem('loggedInUserName', responseDetails.body.user.first_name + ' ' + responseDetails.body.user.last_name);
          localStorage.setItem('loggedInUserEmail', responseDetails.body.user.email_id);
          localStorage.setItem('loggedInOrg', responseDetails.body.org && responseDetails.body.org.org_name ? responseDetails.body.org.org_name : 'Org Name');
          window.location.href = '/app/dashboards';
        } else {
          this.changeDetectorRef.detectChanges();
          this.error = 'No User details found. Please contact administrator';
          console.log('No Vendor details found');
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  localStorage.setItem('accessToken', newToken);
                  this.performActions();
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
          this.error = err;
        }
      }
    );
  }

  getCustomerInfo(): any {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }

    console.log('token >>>')
    console.log(token);

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
