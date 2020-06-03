import { Injectable } from '@angular/core';
import { BaseService } from './';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class Service {

  base: any;
  authService: any;
  constructor(public router: Router, public http: Http, public toastr: ToastsManager) {
    this.base = new BaseService();
  }

  /**
   * Genric function for all web service calls
   * @param method
   * @param url
   * @param data
   */
  Call(method: any, url: any, data: any, options?: any, deleteHeaderKeys?: Array<string>) {

    const Url = url;
    const Method = method;
    const Data = data;
    const Options = this.getHeaders(options, deleteHeaderKeys);

    console.log('Options >>');
    console.log(Options);

    switch (Method) {

      case 'post': {

        return this.http
          .post(Url, Data, Options)
          .map(res => {
            return res.json();
          }).share();
      }

      case 'postnojson': {
        return this.http
          .post(Url, Data, Options)
          .map(res => {
            return res;
          }).share();
      }

      case 'get': {
        let opts = {};
        opts = {...Options};
        if(options){
          opts = {...opts, ...options}
        }

        return this.http
          .get(Url, opts)
          .map(res => {
            return res.json();
          }).share();
      }

      case 'put': {
        return this.http
          .put(Url, Data, Options)
          .map(res => {
            return res;
          }).share();
      }

      case 'delete': {

        // const token = localStorage.getItem('token');
        const token = localStorage.getItem('accessToken'); // "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YWRkYjAxODA4MzZjMDA5ODRiY2UyN2UiLCJlbWFpbCI6ImZ1c2lvbnNldmVuLmlvK2J0aWxAZ21haWwuY29tIiwibmFtZSI6IkRFVl9CVElMIiwiY2xpZW50Q29kZSI6ImJ0aWwiLCJleHAiOjE1NTAxNDA4NjUsImlhdCI6MTU0OTUzNjA2NX0.nNwbKih3u9Yby4hlV0gXW7qXWs22V5Gq6QaB5aRjhCg";
        const headers = new Headers({ 'Content-Type': 'application/json', token : token, callingapp : 'aspen' });

        return this.http
          .delete(Url, new RequestOptions({
            headers: headers,
            body: Data
          }))
          .map(res => {
            return res.json();
          }).share();
      }

      default: {
        break;
      }
    }
  }

  deleteHeaderKeys(keysToRemoveArray: Array<string>, options?) {
    let headers = {};

    // TODO: No type checking happening at them moment
    if(!keysToRemoveArray)
      headers = options;

    if(!options)
      headers = options;

    // Remove keys from this options dict
    if(keysToRemoveArray && options) {
      keysToRemoveArray.map((val, idx) => {
        delete options[val]
      })
      headers = options
    }

    return headers;
  }


  extendHeaders(options?) {
    // If empty, return empty object
    if(!options)
      return {};

    let headers = {...options};
    return headers
  }

  /**
   * Get header with token for all service calls
   * @returns Header Object
   */
  getHeaders(options?, deleteHeaderKeys?) {
    // TODO: Need to accept Dynamic headers here
    const token = localStorage.getItem('accessToken'); // "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YWRkYjAxODA4MzZjMDA5ODRiY2UyN2UiLCJlbWFpbCI6ImZ1c2lvbnNldmVuLmlvK2J0aWxAZ21haWwuY29tIiwibmFtZSI6IkRFVl9CVElMIiwiY2xpZW50Q29kZSI6ImJ0aWwiLCJleHAiOjE1NTAxNDA4NjUsImlhdCI6MTU0OTUzNjA2NX0.nNwbKih3u9Yby4hlV0gXW7qXWs22V5Gq6QaB5aRjhCg";
    // const token = localStorage.getItem('token')

    let headers = this.extendHeaders(options)
    headers = {
      ...headers, 
      ...{ 
        'Content-Type': 'application/json', 
        'token': token, 
        'callingapp': 'aspen' 
      }
    }
    headers = this.deleteHeaderKeys(deleteHeaderKeys, headers)

    headers = new Headers(headers);

    return new RequestOptions({ headers: headers });
  }

}
