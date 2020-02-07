import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in-no-jquery';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class OktaAuthService {

  api_fs: any;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private http: Http
  ) {

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
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



  signOut() {
    // TODO: SignOut to be implemented

  }



  refresh(accessToken){
    console.log("acccc: refresh", accessToken)
    return new Promise( function (resolve, reject ) {
        () => resolve(localStorage.getItem('accessToken'))
    })
  }

  tokenManager = {

    getLocalStorageKey: (keyName) => {
      return localStorage.getItem(keyName);
    },
    
    refresh: (accessToken, successCB, errorCB) => {
      // @params `accessToken`: some string value
      // @params `func`: A function passed from the Controller file, Signature: func(response)

      console.log("refresh: ", accessToken);

      // return this.logOut.apply(this, [accessToken]);
    
    
      let refresh_token = this.tokenManager.getLocalStorageKey("refresh_token");
      let url = "/api/users/token/refresh";
      let body = {
        "refresh_token": refresh_token,
      };


      return this.http.post(url, body)
      .subscribe( 
        // on subscribe run the passed function `func`
        successCB,
        errorCB
      );

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

    // Return widget only if the person is logged in and accesToken exists, else logout
    if(!localStorage.getItem('accessToken')) {
      return this.logOut(localStorage.getItem('accessToken'))
    }

    // Return widget only if the person is logged in and accesToken exists, else logout
    return this.widget();
    // return 
  }

  logOutService() {
    console.log("lOSERV remove all localSTOR")
    localStorage.removeItem('accessToken');

    return this.router.navigate(['login']);
  }

  logOut(accessToken) {
    console.log("acccc: logOUT", accessToken)
    const self = this;

    return new Promise( function (resolve, reject ) {
      console.log("inside resolver", self, this)
      self.logOutService().then( () => {
        console.log("logOUSERV.then resovl")
        return resolve(localStorage.getItem('accessToken')) 
      }, rej => {
        console.log("louOutServ rej: ", rej);
      }
      ).catch(err => {
        console.log("louOutServ err: ", err);
      })
    })
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
