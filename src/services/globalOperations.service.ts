import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BaseService } from './base';
import 'rxjs/add/operator/toPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { Service } from './util';

@Injectable()
export class GlobalAdminUserService {

  base: any;
  service: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private toastr: ToastsManager) {

    this.base = new BaseService();
    this.service = new Service(router, http, toastr);
  }

  /**
   * Create Admin User Service from formData
   * @param dataObj
   */
  public createAdminUser(dataObj: any) {
    const data = JSON.stringify(dataObj);
    return this.service.Call('post', this.base.GLOBAL_ADMIN_USERS + '/register', data);
  }

  /**
   * Fetch All User Details
   * @param userID
   * @param Data
   */
  getAllUsers(roleId) {
    return this.service.Call('get', this.base.GLOBAL_ADMIN_USERS +
      '/identities?type=user&fetchAddress=true&status=active,pending&role=' + roleId);
  }

  /**
   * Update User Details
   * @param userID
   * @param Data
   */
  updateUser(userID, data) {
    return this.service.Call('put', this.base.GLOBAL_ADMIN_USERS + '/identities/child/' + userID, data);
  }

  /**
   * Delete User Details
   * @param userID
   * @param Data
   */
  removeUser(userID, data) {
    return this.service.Call('delete', this.base.GLOBAL_ADMIN_USERS + '/identities/' + data);
  }

  /*Get Feature List*/
  getAllFeatureList() {
    return this.service.Call('get', this.base.GLOBAL_ADMIN_USERS + '/features');
  }

  /**
   * Update status of FeatureList
   * @param fId
   * @param dataObj
   */
  updateFeature(fId: any, dataObj: any) {
    return this.service.Call('put', this.base.GLOBAL_ADMIN_USERS + '/features/' + fId, dataObj);

  }

  /**
   * Update of FeatureList Name,Code,Description
   * @param fId
   * @param dataObj
   */
  updateFeatureContent(fId: any, dataObj: any) {
    return this.service.Call('put', this.base.GLOBAL_ADMIN_USERS + '/features/' + fId, dataObj);

  }

}
