import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import { Common } from '../../shared/util/common';
import { Http, Headers, RequestOptions } from '@angular/http';
import { USER_CLIENT_NAME } from '../../../constants/organization';
import {ENV} from '../../../constants/env';

// interface User {
//   body: Object({
//     data: Object({
//       access_token: String
//     })
//   })
// };

@Component({
  selector: 'app-login-new',
  templateUrl: './login-new.component.html',
  styleUrls: ['./login-new.component.scss']
})
export class LoginNewComponent implements OnInit {

  loginForm: FormGroup;
  forgotForm: FormGroup;
  isForgotContainer: boolean = false;
  formError: string = null;
  api_fs: any;
  showSpinner: boolean;
  version: any;

  constructor(
    private common:Common,
    private http: Http,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.formOnInit();
    this.initVars();
  }

  initVars() {
    if( !localStorage.getItem('apis_fs') )
      localStorage.setItem('apis_fs', JSON.stringify(ENV.apis_fs));
    // or some url from config file
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs')) || ENV.apis_fs;
    this.version = this.api_fs.version;
  }

  private formOnInit(){
    this.loginForm = new FormGroup({
      'userData': new FormGroup({
        'userEmail': new FormControl(null, Validators.required),
        'password': new FormControl(null, Validators.required)
      }),
      'saveLogin': new FormControl(false)
    });
    this.forgotForm = new FormGroup({
      'forgotEmail': new FormControl(null, Validators.required)
    });
    //checking cookie for remember me functionallity
    let rememberName = this.common.getCookie('ln');
    if(rememberName){
      this.loginForm.patchValue({
          'userData':{
            'userEmail': rememberName
          }
      });
    };
  }

  loginService(body: Object) {
    const headers = new Headers({'Content-Type': 'application/json' , 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const api_url_part = "/api";
    const endPoint = "/users/token";
    const url = this.api_fs.api + api_url_part + endPoint;

    this.showSpinner = true;
    return this.http.post(url, body, options).map(res => {
      return res.json()
    }).share();
  }

  saveUser(res: any) {

    console.log('res >>')
    console.log(res);

    localStorage.setItem('accessToken', res.access_token);
    localStorage.setItem('idToken', res.id_token);
    localStorage.setItem('loggedInUserName', res.first_name.trim() + " " + res.last_name.trim());
    localStorage.setItem('loggedInUserID', res.external_id);
    localStorage.setItem('loggedInUserGroup', JSON.stringify([res.user_role ? res.user_role.name.toUpperCase() : '']));
    localStorage.setItem('loggedInOrg', res.org && res.org.org_name ? res.org.org_name : 'Home Depot');
  }

  compileBody(userData){
      const body = {username: userData.userEmail, password: userData.password};
      return body;
  }

  onSubmitLoginForm(){
    if(this.loginForm.valid){
      let userData = this.loginForm.get('userData').value;
      let saveLogin = this.loginForm.get('saveLogin').value;
      //setting remember me coookie
      if(saveLogin){
        const expdate = 365*24*60*60*1000;
        this.common.setLoginCookie('ln', userData.userEmail, expdate);
      }

      const body = this.compileBody(userData)

      //login api comes here
      this.loginService(body).subscribe( res => {
        this.saveUser(res);
        this.getCustomerInfo().subscribe(
            responseDetails => {

              console.log('responseDetails >>>')
              console.log(responseDetails);

              if (responseDetails && responseDetails) {
                localStorage.setItem('customerInfo', JSON.stringify(responseDetails));
                this.router.navigate(['/app/dashboards/'], { relativeTo: this.route } ).then( res => {
                  this.showSpinner = false;
                });
              } else {
                this.showSpinner = false;
                this.formError = 'No User details found. Please contact administrator';
                console.log('No Vendor details found');
              }
            },
            err => {
              this.showSpinner = false;
              if (err.status === 401) {
                if (localStorage.getItem('accessToken')) {

                } else {

                }
              } else {

              }
            }
        );
      }, rej => {
        //this.loginForm.reset();
        this.showSpinner = false;
        // this.formError = rej.statusText; //for error handling
        console.log("rej", rej);
        this.formError = rej.json().message; //for error handling
      });
    }
  }

  getCustomerInfo(): any {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
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

  forgotPasswordService(forgotObj: Object) {

    const headers = new Headers({'Content-Type': 'application/json' , 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});

    const api_url_part = "/api";
    const endPoint = "/users/token";
    const url = this.api_fs.api + api_url_part + endPoint;
    // const body = {username: username, password: password};

    this.showSpinner = true;
    return this.http.post(url, forgotObj, options).map(res => {
      return res.json()
    }).share();
  }

  onSubmitForgotForm(){
    if(this.forgotForm.valid){
      let forgotEmail = this.forgotForm.get('forgotEmail').value;
      //forgot api comes here
      const forgotObj = {"email": forgotEmail};
      this.forgotPasswordService(forgotObj).subscribe( res => {
        this.showSpinner = false;
        // this.formError = res.statusText;
        console.log("res", res);
        this.formError = res.json().message;
      }, rej => {
        //this.loginForm.reset();
        this.showSpinner = false;
        // this.formError = rej.statusText; //for error handling
        console.log("rej 2", rej);
        this.formError = rej.json().message; //for error handling
      });
    }
  }

}
