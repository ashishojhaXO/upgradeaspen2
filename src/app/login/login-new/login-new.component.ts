import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import { Common } from '../../shared/util/common';
import { Http, Headers, RequestOptions } from '@angular/http';
import { USER_CLIENT_NAME } from '../../../constants/organization';

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
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs')) || ''; // or some url from config file
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

  loginService(userData: Object) {
    const headers = new Headers({'Content-Type': 'application/json' , 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const api_url_part = "/api";
    const endPoint = "/users/token";
    const url = this.api_fs.api + api_url_part + endPoint;
    // const body = {username: username, password: password};

    this.showSpinner = true;
    return this.http.post(url, userData, options).map(res => {
      return res.json()
    }).share();
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

      //login api comes here
      this.loginService(userData).subscribe( res => {
        // Setting required data here
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('idToken', res.idToken);

        this.router.navigate(['/app/dashboards/'], { relativeTo: this.route } ).then( res => {
          this.showSpinner = false;
        });
      }, rej => {
        //this.loginForm.reset();
        this.showSpinner = false;
        this.formError = rej.statusText; //for error handling
      });
    }
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
        this.formError = res.statusText;
      }, rej => {
        //this.loginForm.reset();
        this.showSpinner = false;
        this.formError = rej.statusText; //for error handling
      });
    }
  }

}
