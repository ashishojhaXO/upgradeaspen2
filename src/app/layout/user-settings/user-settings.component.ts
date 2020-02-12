import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OktaAuthService } from '../../../services/okta.service';
import Swal from 'sweetalert2';
import { Headers, RequestOptions, Http } from '@angular/http';
import * as countryJson from '../../../localService/isoCountries.json'

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  constructor(private okta: OktaAuthService, private http: Http) { }

  api_fs;
  userProfile: FormGroup;
  showSpinner: boolean;
  widget;
  userID;
  countryArr;
  selectedCountry;
  userData;

  ngOnInit() {
    this.showSpinner = true;
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.userID = localStorage.getItem('loggedInUserID') || '';
    this.countryArr = countryJson;
    this.formInIt();
    this.getUserDetails();
  }

  formInIt() {
    this.userProfile = new FormGroup({
      email: new FormControl({value: null, disabled: true}, Validators.required),
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.pattern('^[0-9-]*$')),
      address1: new FormControl(null),
      address2: new FormControl(null),
      city: new FormControl(null),
      zipCode: new FormControl(null, Validators.pattern('^[0-9-]*$')),
      state: new FormControl(null),
      country: new FormControl(null),
      role: new FormControl({value: null, disabled: true}, Validators.required)
    });
  }

  getUserDetails() {
    this.getUserService().subscribe(
       response => {
         if (response && response.data) {
          // console.log(response.data);
          this.userData = response.data;
          const user = response.data;
           this.setForm(user);
           this.showSpinner = false;
         }
       },
       err => {
         if(err.status === 401) {
           if(localStorage.getItem('accessToken')) {
              let self = this;
              this.widget.tokenManager.refresh(
                'accessToken',
                self.getUserService.bind(self)
              );
           } else {
             this.widget.signOut(() => {
               localStorage.removeItem('accessToken');
               window.location.href = '/login';
             });
           }
         } else {
           this.showSpinner = false;
           Swal({
            title: 'Error',
            text: err.message,
            type: 'error'
          });
         }
       }
   );
  }

  getUserService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/users/user-by-id/' + this.userID;
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  setForm(user) {
    this.userProfile.patchValue({
      email: user.email_id,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      address1: user.address_1,
      address2: user.address_2,
      city: user.city,
      zipCode: user.zip,
      state: user.state,
      country: user.country,
      role: user.user_role.name,
    });
    this.selectedCountry = user.country ? user.country.toUpperCase() : '';
  }

  userProfileSubmit() {
    // console.log('existing', this.userData)
    // console.log(this.userProfile.getRawValue());
    const user = this.userProfile.getRawValue();
    this.userData.first_name = user.firstName;
    this.userData.last_name = user.lastName;
    this.userData.phone = user.phone;
    this.userData.address_1 = user.address1;
    this.userData.address_2 = user.address2;
    this.userData.city = user.city;
    this.userData.state = user.state;
    this.userData.zip = user.zipCode;
    this.userData.country = user.country;
    this.userData.user_role = {name: user.role}
    // console.log('updated', this.userData)
    this.saveUserDetails(this.userData);
  }

  OnCountryChanged(e: any): void {
    if (!this.selectedCountry || this.selectedCountry !== e.value ) {
      this.selectedCountry = e.value;
      this.userProfile.patchValue({
        country: e.value
      })
    }
  }

  saveUserDetails(user) {
    this.saveUserService(user).subscribe(
       response => {
         if (response && response.data) {
          this.showSpinner = false;
          Swal({
            title: 'Update successfull',
            text: response.message,
            type: 'success'
          });
         }
       },
       err => {
         if(err.status === 401) {
           if(localStorage.getItem('accessToken')) {
              let self = this;
              this.widget.tokenManager.refresh(
                'accessToken',
                self.saveUserService.bind(self)
              );
           } else {
             this.widget.signOut(() => {
               localStorage.removeItem('accessToken');
               window.location.href = '/login';
             });
           }
         } else {
           this.showSpinner = false;
           Swal({
            title: 'Error',
            text: err.message,
            type: 'error'
          });
         }
       }
   );
  }

  saveUserService(user) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(user);
    var url = this.api_fs.api + '/api/users/' + this.userID;
    return this.http
        .put(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

}
