import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Common } from '../../shared/util/common';
import { Http } from '@angular/http';

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
  
  constructor(private common:Common, private http: Http) { }

  ngOnInit() {
    this.formOnInit();
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

  loginService() {

    const url = "/api/login";
    const body = {};

    return this.http.post(url, body).share();
  }

  onSubmitLoginForm(){
    if(this.loginForm.valid){
      let userData = this.loginForm.get('userData').value;
      let saveLogin = this.loginForm.get('saveLogin').value;
      //console.log('user data:', userData);
      //setting remember me coookie
      if(saveLogin){
        const expdate = 365*24*60*60*1000;
        this.common.setLoginCookie('ln', userData.userEmail, expdate);
      }

      //login api comes here
      this.loginService().subscribe( res => {

      }, rej => {

      });

      //this.formError //for error handling
      //this.loginForm.reset();
    }
  }

  onSubmitForgotForm(){
    if(this.forgotForm.valid){
      let forgotEmail = this.forgotForm.get('forgotEmail').value;
      //console.log('forgot Email:', forgotEmail)
      //forgot api comes here
      //this.formError //for error handling
      this.isForgotContainer = false;
    }
  }

}
