import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in-no-jquery';

@Injectable()
export class OktaAuthService {

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
  //     issuer: 'default',
  //     responseType: ['id_token', 'token'],
  //     scopes: ['openid', 'email', 'profile']
  //   }
  // });



  widget() {
    return new Promise( function (resolve, reject ) {
      setTimeout( () => resolve("done"), 1000);
    })
  }


  // tokendMan.refere = /api/user/revf

  getWidget() {
    console.log("getWidget: ")
    return this.widget;
    // return 
  }

  getWidgetConfig() {
    return { logo: 'https://op1static.oktacdn.com/bc/image/fileStoreRecord?id=fs0iw1hhzapgSwb4s0h7', // Try changing "okta.com" to other domains, like: "workday.com", "splunk.com", or "delmonte.com"
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
    }
  }
}
