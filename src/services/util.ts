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
  Call(method: any, url: any, data: any) {

    const Url = url;
    const Method = method;
    const Data = data;
    const Options = this.getHeaders();

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
        return this.http
          .get(Url, Options)
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
        const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YWRkYjAxODA4MzZjMDA5ODRiY2UyN2UiLCJlbWFpbCI6ImZ1c2lvbnNldmVuLmlvK2J0aWxAZ21haWwuY29tIiwibmFtZSI6IkRFVl9CVElMIiwiY2xpZW50Q29kZSI6ImJ0aWwiLCJleHAiOjE1NTAxNDA4NjUsImlhdCI6MTU0OTUzNjA2NX0.nNwbKih3u9Yby4hlV0gXW7qXWs22V5Gq6QaB5aRjhCg";
        const headers = new Headers({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + token });

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

  /**
   * Get header with token for all service calls
   * @returns Header Object
   */
  getHeaders() {
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YWRkYjAxODA4MzZjMDA5ODRiY2UyN2UiLCJlbWFpbCI6ImZ1c2lvbnNldmVuLmlvK2J0aWxAZ21haWwuY29tIiwibmFtZSI6IkRFVl9CVElMIiwiY2xpZW50Q29kZSI6ImJ0aWwiLCJleHAiOjE1NTAxNDA4NjUsImlhdCI6MTU0OTUzNjA2NX0.nNwbKih3u9Yby4hlV0gXW7qXWs22V5Gq6QaB5aRjhCg";
    // const token = localStorage.getItem('token')
    const headers = new Headers({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + token });
    return new RequestOptions({ headers: headers });
  }

}
