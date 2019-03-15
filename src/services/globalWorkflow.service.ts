import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {BaseService} from './base';
import 'rxjs/add/operator/toPromise';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';
import {Service} from './util';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';
import {HttpResponse} from '@angular/common/http';

@Injectable()
export class GlobalWorkflowService {

  base: any;
  service: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private http: Http,
              private toastr: ToastsManager) {

    this.base = new BaseService();
    this.service = new Service(router, http, toastr);
  }

  globalWorkflows: any =
    {
      'docs': [
        {
          '_id': '5b977949da60791c907fc5ba',
          'uid': 'c1_123',
          'id': 'WF_CAERVC',
          'createdAt': '2018-09-12',
          'startDate': '2018-09-12',
          'endDate': '2019-09-12',
          'updatedAt': '2018-09-12',
          'name': 'WF_CAERVC',
          'contractType': 'IORD',
          'currentAction': 'Approve',
          'currentActionOwner': 'Group 1',
          'nextAction': 'Execute',
          'nextActionOwner': 'Group 2',
          'status': 'Draft',
          'context': {
            'version': {
              'minor': 0,
              'major': 0
            },
            'client': {
              'code': 'dcbc',
              'name': 'DCBC'
            },
            'partner': {
              'type': 'dspd',
              'code': 'HULU'
            },
            'country': {
              'code': 'us'
            }
          },
          'createdBy': 'Simon Helberg',
          '__v': 0
        },
        {
          '_id': '5b977953da60791c907fc5bb',
          'uid': 'c1_124',
          'id': 'WF_CAERV',
          'createdAt': '2018-09-13',
          'updatedAt': '2018-09-13',
          'startDate': '2018-09-13',
          'endDate': '2019-09-13',
          'contractType': 'IORD',
          'currentAction': 'Approve',
          'currentActionOwner': 'Group 1',
          'nextAction': 'Execute',
          'nextActionOwner': 'Group 2',
          'name': 'WF_CAERV',
          'status': 'Draft',
          'context': {
            'version': {
              'minor': 0,
              'major': 0
            },
            'client': {
              'code': 'dcbc',
              'name': 'DCBC'
            },
            'partner': {
              'type': 'dspd',
              'code': 'HULU'
            },
            'country': {
              'code': 'us'
            }
          },
          'createdBy': 'Simon Helberg',
          '__v': 0
        },
        {
          '_id': '5b9c2965b0676451c92f77f47',
          'uid': 'c1_125',
          'id': 'WF_CAPV',
          'createdAt': '2018-09-14',
          'updatedAt': '2018-09-14',
          'startDate': '2018-09-14',
          'endDate': '2019-09-14',
          'contractType': 'IORD',
          'currentAction': 'Approve',
          'currentActionOwner': 'Group 1',
          'nextAction': 'Execute',
          'nextActionOwner': 'Group 2',
          'name': 'WF_CAER',
          'status': 'Draft',
          'context': {
            'version': {
              'minor': 0,
              'major': 0
            },
            'client': {
              'code': 'dcbc',
              'name': 'DCBC'
            },
            'partner': {
              'type': 'dspd',
              'code': 'HULU'
            },
            'country': {
              'code': 'us'
            }
          },
          'createdBy': 'Simon Helberg',
          '__v': 0
        }
      ],
      'total': 3,
      'limit': 10,
      'page': 1,
      'pages': 1
    };

  public getGlobalWorkflows(schemaContext: any) {
    return Observable.of(new HttpResponse({status: 200, body: this.globalWorkflows}));
  }

  public getGlobalWorkflowById(id: any) {
    const obj = this.globalWorkflows.docs.find(obj => obj.id === id);
    return Observable.of(new HttpResponse({status: 200, body: obj}));
  }
}
