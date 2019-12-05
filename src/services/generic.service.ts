import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BaseService } from './base';
import 'rxjs/add/operator/toPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { Service } from './util';

@Injectable()
export class GenericService {

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
   * POST Payments Methods
   * @param dataObj
   */
  public postPaymentsMethods(dataObj: any) {
    
    const data = JSON.stringify(dataObj);
    console.log("dataObj: ", dataObj, " data; ", data);

    return this.service.Call(
      'post', 
      this.base.REPORT_SERVICE_API_GATEWAY_URL +
      this.base.API + 
      this.base.POST_PAYMENTS_METHODS_ENDPOINT, 
      data
    );
  }

  /**
   * POST Payments Charge
   * @param dataObj
   */
  public postPaymentsCharge(dataObj: any) {
    
    const data = JSON.stringify(dataObj);

    return this.service.Call(
      'post', 
      this.base.REPORT_SERVICE_API_GATEWAY_URL +
      this.base.API + 
      this.base.POST_PAYMENTS_CHARGE_ENDPOINT, 
      data
    );
  }

  /**
   * POST OrdersProcessedReportDownload
   * @param dataObj
   */
  postOrdersProcessedReportDownload(dataObj) {
    const data = JSON.stringify(dataObj);
    console.log("dataObj: ", dataObj, " data; ", data);

    return this.service.Call(
      'post', 
      this.base.REPORT_SERVICE_API_GATEWAY_URL +
      this.base.API + 
      this.base.postOrdersProcessedReportDownload,
      data
    );

  }

  /**
   * POST postOrdersProcessedReportEmail
   * @param dataObj
   */
  postOrdersProcessedReportEmail(dataObj) {
    const data = JSON.stringify(dataObj);
    console.log("dataObj: ", dataObj, " data; ", data);

    return this.service.Call(
      'post', 
      this.base.REPORT_SERVICE_API_GATEWAY_URL +
      this.base.API + 
      this.base.postOrdersProcessedReportEmail,
      data
    );

  }

  /**
   * POST postOrdersProcessedReportRun
   * @param dataObj
   */
  postOrdersProcessedReportRun(dataObj) {
    const data = JSON.stringify(dataObj);
    console.log("dataObj: ", dataObj, " data; ", data);

    return this.service.Call(
      'post', 
      this.base.REPORT_SERVICE_API_GATEWAY_URL +
      this.base.API + 
      this.base.postOrdersProcessedReportRun,
      data
    );

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
