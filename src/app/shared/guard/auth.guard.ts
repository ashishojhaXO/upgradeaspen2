import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Common } from '../../shared/util/common';
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in-no-jquery';
import * as ENVCONFIG from '../../../constants/env';

@Injectable()
export class AuthGuard implements CanActivate {

  // widget = new OktaSignIn({
  //   logo: 'https://op1static.oktacdn.com/bc/image/fileStoreRecord?id=fs0iw1hhzapgSwb4s0h7', // Try changing "okta.com" to other domains, like: "workday.com", "splunk.com", or "delmonte.com"
  //   language: 'en',                       // Try: [fr, de, es, ja, zh-CN] Full list: https://github.com/okta/okta-signin-widget#language-and-text
  //   i18n: {
  //     'en': {
  //       'primaryauth.title': 'Sign In',   // Changes the sign in text
  //       'primaryauth.submit': 'Sign In',  // Changes the sign in button
  //     }
  //   },
  //   baseUrl: JSON.parse(localStorage.getItem('externalAuth')).api,
  //   clientId: JSON.parse(localStorage.getItem('externalAuth')).clientId,
  //   redirectUri: JSON.parse(localStorage.getItem('apis_fs')).redirectUrl + '/app/dashboards',
  //   authParams: {
  //     issuer: 'default'
  //   }
  // });

  widget = new Promise( function (resolve, reject ) {
    console.log("authGuard widget")
    setTimeout( () => resolve("done"), 1000);
  })
    constructor( private router: Router, private common: Common ) {
      console.log("authGuard construcotr")
    }

     canActivate(): any {
       console.log("canACT")
      // get session Info
       return new Promise((resolve, reject) => {
          console.log("canAct promoise")

         
      
         return true
        //  this.widget

        //  .session.get((response) => {
        //    if (response.status !== 'INACTIVE') {
        //      resolve(true);
        //    } else {
        //      this.router.navigate(['./login']);
        //      resolve(false);
        //    }
        //  });
       });
    }
}
