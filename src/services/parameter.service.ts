import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BaseService } from './base';
import { Service } from './util';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth';
import 'rxjs/add/operator/toPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';

@Injectable()
export class ParameterService {

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
   * Get All Parameters in System
   */
  public getAllParameters() {

    // create observable
    return new Observable(observer => {

      // observable execution
      observer.next(
        [
          {
            id: 3,
            ParameterId: '24d4f7ba-21da-11e8-a9cb-3444444',
            Label: 'Currency',
            Type: 'list',
            Value: [
              { value: 'USD', description: 'United States Dollar' },
              { value: 'JPY', description: 'Japan Yen' },
            ],
            Options: [['USD', 'CAD', 'JPY']],
          },
          {
            id: 2,
            ParameterId: '24d4f7ba-21da-11e8-a9cb-123123',
            Label: 'Country',
            Type: 'list',
            Value: [
              { value: 'US', description: 'United States' },
              { value: 'JPN', description: 'Japan' }],
            Options: [['US', 'CA', 'JPN']],
          },
          {
            id: 1,
            ParameterId: '24d4f7ba-21da-11e8-a9cb-06505ad8c204',
            Label: 'Recon',
            Type: 'boolean',
            Value: 'Yes',
          }
        ]
      );
      observer.complete();
    });
  }

  getGlobalParameters2() {
    return this.service.Call('get', this.base.PARAMETERS_URL + '/global');
  }

  getParameters(type = 'global', identity = null) {
    let queryParams = '?parameterType=' + type;
    queryParams = identity ? queryParams + '&identity=' + identity : queryParams;
    return this.service.Call('get', this.base.PARAMETERS_URL + queryParams);
  }

  updateParameters(id, data) {
    return this.service.Call('put', this.base.PARAMETERS_URL + '/' + id, data);
  }

  updateOrganizationContext(id, data) {
    return this.service.Call('put', this.base.UPDATE_IDENTITY + '/' + id, data);
  }

  createGlobalParameter(parameter) {
    return this.service.Call('post', this.base.PARAMETERS_URL, parameter);
  }

  createParameter(object) {
    return this.service.Call('post', this.base.PARAMETERS_URL, object);
  }

  updateGlobalParameter(id, data) {
    return this.service.Call('put', this.base.PARAMETERS_URL + '/' + id, data);
  }

  deleteGlobalParameter(ids) {
    return this.service.Call('delete', this.base.PARAMETERS_URL + '/multiple/ids', ids);
  }

  deleteParameter(id) {
    return this.service.Call('delete', this.base.PARAMETERS_URL + '/' + id);
  }
}
