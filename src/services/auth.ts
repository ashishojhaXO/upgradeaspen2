import { Injectable } from '@angular/core';
import { BaseService } from './base';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Service } from './util';
import * as _ from 'lodash';
import {Observable} from 'rxjs/Observable';
import * as preference from '../localService/preference.json';

@Injectable()
export class AuthService {

  base: any;
  service: any;
  Options: any;

  constructor(
    public router: Router,
    public http: Http,
    public toastr: ToastsManager
  ) {
    this.base = new BaseService();
    this.service = new Service(router, http, toastr);
    this.Options = this.service.getHeaders();
  }

  /**
   *
   * @param {string} email
   * @param {string} password
   * @returns {any}
   */
  public login(email: string, password: string): any {
    const data = JSON.stringify({ email: email.toLowerCase(), password: password });
    return this.service.Call('post', this.base.LOGIN_URL, data);
  }

  /**
   * Get current access token
   * @returns {string}
   */
  getAccessToken() {
    return localStorage.getItem('token');
  }

  /** Get Identity info */
  public getIdentityInfo(name) {
    return localStorage.length > 0 ? localStorage.getItem(name) : '';
  }

  /** Set Identity info */
  public setIdentityInfo(name, val) {
    localStorage.setItem(name, val);
  }

  /** Organization name has to be checked, if that enabled or not */
  public orgOnChecked() {
    const orgCXT = this.getIdentityInfo('org-context');
    if (!_.isUndefined(orgCXT) && !_.isNull(orgCXT)) {
      if (!_.isUndefined(JSON.parse(orgCXT)['orgChanged'])) {
        const org = JSON.parse(orgCXT);
        delete org['orgChanged'];
        this.setIdentityInfo('org-context', JSON.stringify(org));
        return true;
      } else if (_.isEmpty(JSON.parse(orgCXT)['client']['name'])) {
        return true;
      }
    }
    return false;
  }

  /** If organization not selected, then it will get client name from context */
  public orgNotSelection() {
    const orgCXT = this.getIdentityInfo('org-context');
    if (!_.isUndefined(orgCXT)) {
      if (_.isNull(orgCXT)) {
        return true;
      } else if (_.isEmpty(JSON.parse(orgCXT)['client']['name'])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get new access token by using refresh token
   * @returns {Observable<any>}
   */
  refreshAccessToken() {
    const refresh_token = this.getIdentityInfo('refreshToken');
    const data = { refreshToken: refresh_token };
    return this.http
      .post(this.base.GET_ACCESS_TOKEN_URL, data, this.Options)
      .map(res => {
        const result = res.json();
        this.setIdentityInfo('token', result.accessToken);
        return res.json();
      });
  }

  /**
   * Create User Password
   * @returns {Observable<any>}
   * @param {string} password
   * @param {string} activationCode
   * @returns {string } PasswordDigest
   */

  createUserPassword(data) {
    return this.http.put(this.base.CREATE_USER_PASSWORD, data).map(res => {
      return res.json();
    });
  }

  /**
   * Check ACTIVE STATUS
   * @param {string} data
   * @returns {Observable<any>}
   */
  checkActiveStatus(data) {
    return this.service.Call('post', this.base.CHECK_ACTIVE_STATUS, data);
  }

  /**
   * Check Email validate for Forgot Password
   * @param {string} email
   * @returns {Observable<any>}
   */
  public checkEmailValidation(data) {
    const token = this.getIdentityInfo('token');
    data['authToken'] = token;
    return this.service.Call('post', this.base.CHECK_USER_MAIL, data);
  }

  /**
   * Get Preference data for menu
   *
   */
  public getPreferenceMenu() {
    return Observable.of( preference);
    // return this.service.Call('get', this.base.GET_PREFERENCE_MENU);
  }

  /**
   * Get User Details base on Organization Id
   *
   */
  public getUserByEmail(email: string) {
    return this.service.Call('get', this.base.ADMIN_USERS + '/singleUser/' + email);
  }

  /**
   * Create user Preference
   * @param {string} userPreference
   *
   */
  public createUserPreference(userPreference: any) {
    return this.service.Call('post', this.base.ADMIN_USERS + '/preference/', userPreference);
  }

  /**
   * GetUser Preference
   * @param {string} userId
   */
  public getUserPreference(userId: string) {
    return this.service.Call('get', this.base.ADMIN_USERS + '/preference/' + userId);
  }

  /**
   * Preference Details Update
   * @param prefID
   * @param Data
   */
  public preferencesUpdate(prefID, data) {
    return this.service.Call('put', this.base.GLOBAL_ADMIN_USERS + '/identities/child/' + prefID, data);
  }

  public settingUserInfo(userID, data) {
    return this.service.Call('get', this.base.GLOBAL_ADMIN_USERS + '/identities?type=user&id=' + userID + '&fetchAddress=true', data);
  }
  /**
   * Update User Details
   * @param userID
   * @param Data
   */
  public settingUpdateUser(userID, data) {
    return this.service.Call('put', this.base.GLOBAL_ADMIN_USERS + '/identities/child/' + userID, data);
  }

}
