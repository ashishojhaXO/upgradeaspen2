/**
 * Copyright 2020. Accelitas Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2020-03-19 14:54:37
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { OktaAuthService } from '../../../services/okta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss']
})
export class UploadsComponent implements OnInit  {

  showSpinner: boolean;
  uploadedFile: any;
  uploadTypes = [];
  uploadType: any;
  api_fs: any;
  widget: any;

  constructor(
    private route: ActivatedRoute, private router: Router, private http: Http, fb: FormBuilder, private okta: OktaAuthService) {
  }

  ngOnInit() {

    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.uploadTypes.push({
      id: 1,
      text: 'Flex Fields',
      api: '/someapi'
    });
    this.uploadType = 1;
  }

  OnUploadTypeChange(e) {
    if (e.value && e.value !== this.uploadType) {
      this.uploadType = e.value;
    }
  }

  OnProcessFile(e) {
    this.convertToBase64(e);
  }

  convertToBase64(file): void {
    const __this = this;
    this.showSpinner = true;
    const myReader = new FileReader();
    myReader.onloadend = (e) => {
      const fileAsBase64 = myReader.result;
      const apiEndPoint = __this.uploadTypes.find(x=> x.id === __this.uploadType).api;
      __this.uploadFile(fileAsBase64, apiEndPoint).subscribe(
          response => {
            if (response) {
              __this.showSpinner = false;
              Swal({
                title: 'File Successfully Uploaded',
                text: 'File : ' + this.uploadedFile.name + ' has been successfully uploaded',
                type: 'success'
              }).then( () => {
                __this.uploadedFile = null;
              });
            }
          },
          err => {

            if(err.status === 401) {
              __this.widget.refreshElseSignout(
                  __this,
                  err,
                  __this.uploadFile.bind(self, fileAsBase64, apiEndPoint)
              );
            } else {
              __this.showSpinner = false;
            }
          });
    };
    myReader.readAsDataURL(file);
  }

  uploadFile(dataObj, api) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const url = this.api_fs.api + api;
    return this.http
        .post(url, dataObj, options)
        .map(res => {
          return res.json();
        }).share();
  }
}
