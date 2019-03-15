import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BaseService } from './base';
import { Service } from './util';
import { AuthService } from './auth';
import 'rxjs/add/operator/toPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';

@Injectable()
export class PartnerTypeService {

  base: any;
  service: any;
  authService: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private toastr: ToastsManager) {

    this.base = new BaseService();
    this.service = new Service(router, http, toastr);
    this.authService = new AuthService(router, http, toastr);
  }

  /**
   * Add partner type service
   * @param dataObj
   */
  public addPartnerType(dataObj: any) {
    const data = JSON.stringify(dataObj);
    return this.service.Call('post', this.base.PARTNER_TYPE, data);

  }

  /**
   * Edit partner type service
   * @param dataObj
   */
  public editPartnerType(partnerTypeCode: string, dataObj: any) {
    const data = JSON.stringify(dataObj);
    return this.service.Call('put', this.base.PARTNER_TYPE + '/' + partnerTypeCode, data);

  }

  /**
   * Fetch all partner types
   */
  getAllPartnerType() {
    return this.service.Call('get', this.base.PARTNER_TYPE);
  }

  /**
   * Delete partner type by partnerTypeID
   * @param {string} partnerTypeCode
   * @param dataObj
   */
  public deletePartnerTypeById(dataObj: any) {
    const url = this.base.PARTNER_TYPE;
    return this.service.Call('delete', url, dataObj);
  }
}
