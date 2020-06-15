import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BaseService } from './base';
import 'rxjs/add/operator/toPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { Service } from './util';

// Testing
import { TestClass } from './TestClass';
// Testing-


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
   * GET
   * A potential GET wrapper for all the GET API Calls
   * @param functionToCall: function to make the GET Api Call
   * @param functionToCallParams: Params to pass to the function that makes the GET Api Call
   * @param successCallback: callBack function on success of the GET api call
   * @param errorCallback: callBack function on error of the GET api call
   */
  getWrapper(functionToCall, functionToCallParams, successCallback, errorCallback) {
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
  successMockCall(data?) {

    let test = new TestClass();
    return test.someHttpEP();
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
      apiPath.api +
      this.base.API +
      this.base.GET_USERS_ENDPOINT + '?limit='+limit+'&page='+page+ ( org ? ('&org_uuid=' + org) : '')
    );
  }

  /*

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
  public setDefaultPaymentMethod(dataObj: any, headers?) {

    const data = JSON.stringify(dataObj);
    let deleteHeaderKeys = ['token', 'callingapp'];

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
        'post',
        apiPath.api +
        this.base.API +
        this.base.
            PUT_DEFAULT_PAYMENTS_METHOD,
        data,
        headers,
        deleteHeaderKeys
    );
  }

  postOrderReceiptList(dataObj) {

    const data = JSON.stringify(dataObj);
    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

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
  ordersProcessedReportDownload(dataObj) {
    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    const data = JSON.stringify(dataObj);

    return this.service.Call(
      'post',
      apiPath.api +
      this.base.API +
      this.base.ADMIN_REPORT_DOWNLOAD,
      data
    );

  }

  /**
   * POST postOrdersProcessedReportEmail
   * @param dataObj
   */
  ordersProcessedReportEmail(dataObj) {
    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    const data = JSON.stringify(dataObj);
    console.log("dataObj: ", dataObj, " data; ", data);

    return this.service.Call(
      'post',
      apiPath.api +
      this.base.API +
      this.base.ADMIN_REPORT,
      data
    );

  }

  /**
   * POST postOrdersProcessedReportRun
   * @param dataObj
   */
  ordersProcessedReportRun(dataObj) {
    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    const data = JSON.stringify(dataObj);
    console.log("dataObj: ", dataObj, " data; ", data);

    return this.service.Call(
      'post',
      apiPath.api +
      this.base.API +
      this.base.ADMIN_REPORT,
      data
    );

  }

  /**
   * Get Jobs Method
   * @param dataObj
   */
  getJobs(data) {

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
      'get',
      apiPath.api +
      this.base.API +
      this.base.GET_JOBS_ENDPOINT
    );
  }


  /**
   * POST postJobReportExecute
   * Execute a Report of a particular Job_id
   * @param dataObj
   */
  postJobReportExecute(dataObj) {
    const data = JSON.stringify(dataObj);
    console.log("dataObj: ", dataObj, " data; ", data);

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

    return this.service.Call(
      'post',
      apiPath.api +
      this.base.API +
      this.base.POST_JOB_REPORT_EXECUTE,
      data
    );

  }


  /**
   * GET getOrders
   * Get order line-items
   * @param dataObj
   */
  getOrdersLineItems(data, isRoot=null, sort?) {

    let org = data.org || null;
    let limit = data.limit || 25;
    let page = data.page || 1;
    let search = data.search || "";
    // const data = JSON.stringify(dataObj);
    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

    return this.service.Call(
      'get',
      apiPath.api +
      this.base.API +
      this.base.GET_ORDERS_LINE_ITEMS_ENDPOINT
        + '?limit='+limit+'&page='+page
        // + (isRoot ? ('&org_uuid=' + org) : ''),
        + ( org ? ('&org_uuid=' + org)  : '')
        + ( search ? ('&search=' + search)  : '')
        + ( sort ? ('&sort_by=' + sort.sortColumn.key + '&sort_order=' + sort.sortDirection)  : ''),
      data
    );

  }

  getOrdersLineItemsCsv(data, isRoot=null) {

    let limit = data.limit != null ? data.limit : 25;
    let page = data.page != null ? data.page : 1;
    let org = data.org;

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

    return this.service.Call(
      'get',
      apiPath.api + this.base.API +
      this.base.GET_ORDERS_LINE_ITEMS_ENDPOINT
        + '?limit='+limit+'&page='+page
        // + (isRoot ? ('&org_uuid=' + org) : '')
        + ( org ? ('&org_uuid=' + org)  : '')
        ,
      {},
      {"Content-Type": "application/csv"}
    );
  }

  /**
   * Get the list of currently available payment methods of the user
   * @param dataObj
   */
  getPaymentMethods(dataObj: any) {
    let limit = dataObj.limit || 25;
    let pageNo = dataObj.pageNo || 1;

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));

    return this.service.Call(
      'get',
      apiPath.api +
      this.base.API +
      this.base.GET_ORDERS_ENDPOINT + '?limit='+limit+'&page='+pageNo
    );
  }

  /**
   * POST User Payments Methods
   * @param dataObj
   */
  public postUserPaymentsMethods(dataObj: any, headers) {

    const data = JSON.stringify(dataObj);
    let deleteHeaderKeys = ['token', 'callingapp'];

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
      'post',
        apiPath.api +
      this.base.API +
      this.base.
      POST_USER_PAYMENTS_METHODS_ENDPOINT,
      data,
      headers,
      deleteHeaderKeys
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
