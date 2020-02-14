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



  signOut(func?: Function) {
    // TODO: SignOut to be implemented
    if (func){
      console.log("signO IF FUNC")
      func()
    }
    else {
      console.log("signO nofunc else")
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

  }

  refresh(accessToken){
    console.log("acccc: refresh", accessToken)
    return new Promise( function (resolve, reject ) {
        () => resolve(localStorage.getItem('accessToken'))
    })
  }

  refreshElseSignout(obj, err, successFuncName, errorFuncName) {
    if(localStorage.getItem('accessToken')) {
      this.tokenManager.refresh(
        'accessToken', 
        successFuncName,
        errorFuncName
      );
    } else {
      console.log("ELSE SIGNOUT")
      this.signOut();
    }

  }

  tokenManager = {

    getLocalStorageKey: (keyName) => {
      return localStorage.getItem(keyName);
    },

    setLocalStorageKey: (keyName, value) => {
      return localStorage.setItem(keyName, value);
    },

    noCallback: (str) => {
      console.log("No callback: ", str)
    },

    successCallback: (response, successCB) => {
      console.log("tokMAN resp succCB: ", response, successCB)
      successCB ? successCB() : this.tokenManager.noCallback("No successCallback");
    },

    errorCallback: (response, errorCB) => {
      console.log("tokMAN resp errCB: ", response, errorCB)
      console.log('error response >>', response);
      errorCB ? errorCB() : this.tokenManager.noCallback("No errorCallback");
    },

    refresh: (accessToken, successCB, errorCB) => {
      // Refresh accessToken only
      // TODO: Later add, refresh of other tokens like: id_token, refresh_token etc
      // @params `accessToken`: some string value
      // @params `func`: A function passed from the Controller file, Signature: func(response)

      console.log("refresh: ", accessToken);

      // return this.logOut.apply(this, [accessToken]);

      const headers = new Headers({
        'Content-Type': 'application/json', 
        'callingapp' : 'aspen', 
        // "scope": "openid offline_access"
      });
      const options = new RequestOptions({headers: headers});

      let refresh_token = this.tokenManager.getLocalStorageKey("refreshToken");
      const api_url_part = "/api";
      let endPoint = "/users/token/refresh";
      const url = this.api_fs.api + api_url_part + endPoint;
      let body = {
        "refresh_token": refresh_token,
      };

      return this.http.post(url, body, options)
      .map(response => {
        let res = response.json();
        this.tokenManager.setLocalStorageKey('accessToken', res.data.access_token);
        return res;
      })
      .subscribe( 
        // on subscribe run the passed function `func`
        (response) => {
          this.tokenManager.successCallback.apply(this, [response, successCB])
        },
        (error) => {
          this.tokenManager.errorCallback.apply(this, [error, errorCB])
        }
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
