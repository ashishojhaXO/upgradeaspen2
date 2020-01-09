import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  constructor() { }

  userProfile: FormGroup;

  ngOnInit() {
    this.formInIt();
    this.getUserDetails();
  }

  formInIt() {
    this.userProfile = new FormGroup({
      email: new FormControl({value: null, disabled: true}, Validators.required),
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      phone: new FormControl(null),
      address1: new FormControl(null),
      address2: new FormControl(null),
      city: new FormControl(null),
      zipCode: new FormControl(null),
      state: new FormControl(null),
      country: new FormControl(null),
      role: new FormControl({value: null, disabled: true}, Validators.required)
    });
  }

  getUserDetails() {
    //service call
    this.setForm();
  }

  setForm() {
    this.userProfile.patchValue({
      email: 'ayushkanodia@outlook.com',
      firstName: 'ayush',
      lastName: 'kanodia',
      role: 'admin'
    })
  }

  userProfileSubmit() {
    console.log(this.userProfile.getRawValue());
  }

}
