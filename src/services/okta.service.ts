import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in-no-jquery';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable()
export class OktaAuthService {

  constructor(
    private route: ActivatedRoute, private router: Router
  ) {

  }

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

  logOutService() {
    console.log("lOSERV remove all localSTOR")
    return this.router.navigate(['/loginnew']);
  }

  signOut() {
    // TODO: SignOut to be implemented

  }


  logOut(accessToken) {

    console.log("acccc: logOUT", accessToken)
    const self = this;

    return new Promise( function (resolve, reject ) {
      console.log("inside resolver", self, this)
      self.logOutService().then( () => {
        console.log("logOUSERV.then resovl")
        return resolve(localStorage.getItem('accessToken')) 
        }
      )
    })
  }

  refresh(accessToken){
    console.log("acccc: refresh", accessToken)
    return new Promise( function (resolve, reject ) {
        () => resolve(localStorage.getItem('accessToken'))
    })
  }

  tokenManager = {
    refresh: (accessToken) => {
      console.log("refresh: ", accessToken);
      return this.logOut.apply(this, [accessToken]);
    }
  }

  widget() {
    // return new Promise( function (resolve, reject ) {
    //   setTimeout( () => resolve("done"), 1000);
    // })

    return this;
  }


  // tokendMan.refere = /api/user/revf

  getWidget() {
    console.log("getWidget: ")
    return this.widget();
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
