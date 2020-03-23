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
   * POST Regenerate Receipt
   * @param dataObj
   */
  public regenerateReceipt(dataObj: any) {

    const data = JSON.stringify(dataObj);

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
      'post',
      apiPath.api +
      this.base.API +
      this.base.POST_REGENERATE_RECEIPT_ENDPOINT,
      data
    );
  }

  /**
   * POST Reprocess
   * @param dataObj
   */
  public reprocess(dataObj: any) {

    const data = JSON.stringify(dataObj);

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
      'post',
      apiPath.api +
      this.base.API +
      this.base.POST_REPROCESS_ENDPOINT,
      data
    );
  }

  /**
   * POST Recalculate
   * @param dataObj
   */
  public recalculate(dataObj: any) {

    const data = JSON.stringify(dataObj);

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
      'post',
      apiPath.api +
      this.base.API +
      this.base.POST_RECALCULATE_ENDPOINT,
      data
    );
  }

  

  /**
   * Get Orders Method
   * @param dataObj
   */
  getOrders(data) {

    let limit = data.limit || 25;
    let pageNo = data.pageNo || 1;

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
      'get', 
      apiPath.api +
      this.base.API +
      this.base.GET_ORDERS_ENDPOINT + '?limit='+limit+'&page='+pageNo 
    );
  }

  /**
   * Success Mock Call
   * @param dataObj
   */
  successMockCall() {


    let json = {
      "data":
      {
        "count":479,
        "rows":[
          {"email_id":"fu.io+F7@gmail.com","first_name":"Ra","last_name":"Ve","external_id":"00ujj","external_status":"EX","last_login (GMT)":"2019-11-05 10:00:52","company_name":"Fu","created_at (GMT)":"2019-02-26 02:17:52","updated_at (GMT)":null}
        ]
      }
    }
    return json;
  }

  /**
   * Error Mock Call
   * @param dataObj
   */
  errorMockCall() {

  }

  /**
   * GET Users Method
   * @param dataObj
   */
  getUsers(data) {

    let limit = data.limit || 25;
    let page = data.page || 1;
    let org = data.org;

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

    return this.service.Call(
      'get', 
      apiPath.api + this.base.API + this.base.GET_USERS_ENDPOINT + '?limit='+limit+'&page='+page+ ( org ? ('&org_uuid=' + org) : '')
    );
  }

  /**
   * GET UsersCsv Method
   * @param dataObj
   */
  getUsersCsv(data) {

    let limit = data.limit != null ? data.limit : 25;
    let page = data.page != null ? data.page : 1;
    let org = data.org;

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

    return this.service.Call(
      'get', 
      apiPath.api + this.base.API + this.base.GET_USERS_ENDPOINT + '?limit='+limit+'&page='+page+ ( org ? ('&org_uuid=' + org) : ''),
      {},
      {"Content-Type": "application/csv"}
    );
  }

  /**
   * POST Payments Methods
   * @param dataObj
   */
  public postPaymentsMethods(dataObj: any) {

    const data = JSON.stringify(dataObj);

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
      'post',
        apiPath.api +
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

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

    return this.service.Call(
      'post',
        apiPath.api +
      this.base.API +
      this.base.POST_PAYMENTS_CHARGE_ENDPOINT,
      data
    );
  }

  /**
   * PUT Set Default Payment method
   * @param dataObj
   */
  public setDefaultPaymentMethod(dataObj: any) {

    const data = JSON.stringify(dataObj);

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

    return this.service.Call(
        'put',
        apiPath.api +
        this.base.API +
        this.base.PUT_DEFAULT_PAYMENTS_METHOD,
        data
    );
  }
  
  postOrderReceiptList(dataObj) {

    const data = JSON.stringify(dataObj);
<<<<<<< HEAD
    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
=======
>>>>>>> 2990

    return this.service.Call(
      'post', 
      apiPath.api + this.base.API + this.base.POST_ORDERS_RECEIPT_DOWNLOAD_ENDPOINT,
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
