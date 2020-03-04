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
   * POST Retry Charge
   * @param dataObj
   */
  public retryCharge(dataObj: any) {

    const data = JSON.stringify(dataObj);

    const apiPath = JSON.parse(localStorage.getItem('apis_fs'));
    return this.service.Call(
      'post',
      apiPath.api +
      this.base.API +
      this.base.POST_RETRY_CHARGE_ENDPOINT,
      data
    );
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


    let json = {"data":{"count":479,"rows":[{"email_id":"fusionseven.io+F7890@gmail.com","first_name":"Ratnakar","last_name":"Verma","external_id":"00ujji8z14WARDUBE0h7","external_status":"EXPIRED","last_login (GMT)":"2019-11-05 10:00:52","company_name":"FusionSeven","created_at (GMT)":"2019-02-26 02:17:52","updated_at (GMT)":null},{"email_id":"fusionseven.io+F9999@gmail.com","first_name":"Fusion","last_name":"7even","external_id":"00ujjiomvmcEVJ1mD0h7","external_status":"EXPIRED","last_login (GMT)":"2019-08-16 22:45:46","company_name":"FusionSeven","created_at (GMT)":"2019-02-26 02:19:50","updated_at (GMT)":null},{"email_id":"fusionseven.io+vendorF911@gmail.com","first_name":"Fusion","last_name":"7","external_id":"00ujjixorq5tFQSuC0h7","external_status":"EXPIRED","last_login (GMT)":"2019-09-17 17:15:14","company_name":"FusionSeven","created_at (GMT)":"2019-02-26 02:33:59","updated_at (GMT)":null},{"email_id":"fusionseven.io+f7test123@gmail.com","first_name":"f7","last_name":"test123","external_id":"00ujk9uvgpT1tUbJl0h7","external_status":"EXPIRED","last_login (GMT)":"2019-03-19 18:51:56","company_name":"FusionSeven","created_at (GMT)":"2019-02-27 06:09:45","updated_at (GMT)":null},{"email_id":"fusionseven.io+123123123@gmail.com","first_name":"F","last_name":"7","external_id":"00ujkawh0rnnglJgm0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-02-27 06:54:32","updated_at (GMT)":null},{"email_id":"fusionseven.io+123123123123@gmail.com","first_name":"F","last_name":"7","external_id":"00ujkaz1biuZPC8eH0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-02-27 07:05:44","updated_at (GMT)":null},{"email_id":"rverma@fusionseven.com","first_name":"Ratnakar","last_name":"Verma","external_id":"00uitnykfeqD2rKaK0h7","external_status":"ACTIVE","last_login (GMT)":"2020-02-06 19:29:10","company_name":"FusionSeven","created_at (GMT)":"2019-02-27 00:00:00","updated_at (GMT)":null},{"email_id":"gurur@fusionseven.com","first_name":"Guru","last_name":"Prasad","external_id":"00uiuhnomqp9UiRtg0h7","external_status":"EXPIRED","last_login (GMT)":"2019-07-12 21:34:20","company_name":"FusionSeven","created_at (GMT)":"2019-02-27 17:51:42","updated_at (GMT)":null},{"email_id":"fusionseven.io+f7876@gmail.com","first_name":"F7","last_name":"f7876","external_id":"00ujkxq70v6trYDGD0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-02-28 04:30:02","updated_at (GMT)":null},{"email_id":"fusionseven.io+f7678@gmail.com","first_name":"F7","last_name":"f767","external_id":"00ujkxphu1x7f4PGS0h7","external_status":"EXPIRED","last_login (GMT)":null,"company_name":"FusionSeven","created_at (GMT)":"2019-02-28 04:30:45","updated_at (GMT)":null}]}}
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
      apiPath.api +
      this.base.API +
      this.base.GET_USERS_ENDPOINT + '?limit='+limit+'&page='+page+ ( org ? ('&org_uuid=' + org) : '')
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
