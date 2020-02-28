import { Injectable } from '@angular/core';

@Injectable()
export class BaseService {

  BASE_URL = this.getBaseURL();

  REPORT_SERVICE_API_GATEWAY_URL = 'https://plazo-dev.fusionseven.net';

  API = '/api';
  POST_PAYMENTS_METHODS_ENDPOINT = '/payments/methods';
  POST_PAYMENTS_CHARGE_ENDPOINT = '/payments/charge';
  PUT_DEFAULT_PAYMENTS_METHOD = '/payments/methods/default';

  POST_RETRY_CHARGE_ENDPOINT = '/retry-charge';
  POST_REGENERATE_RECEIPT_ENDPOINT = '/regenerate-receipt';
  POST_REPROCESS_ENDPOINT = '/reprocess';
  POST_RECALCULATE_ENDPOINT = '/orders/recalculate';

  LOGIN_URL = this.BASE_URL + '/v4/login';

  ORGANIZATION_BASE_URL = this.BASE_URL + '/usermgmt/organization';

  ORGANIZATION_CONTACT_BASE_URL = this.BASE_URL + '/usermgmt/organizationContact';

  UPDATE_PASSWORD = this.BASE_URL + '/v4/identities/user/resetPassword';

  REQUEST_RESET_CODE = this.BASE_URL + '/usermgmt/auth/resetPassword/request';

  GLOBAL_ADMIN_USERS = this.BASE_URL + '/v4';

  CREATE_EDIT_ORGANIZATION = this.ORGANIZATION_BASE_URL + '/contact';

  GET_ORGANIZATION_BY_ID = this.ORGANIZATION_BASE_URL + '/contact';

  PARTNER_TYPE = this.BASE_URL + '/usermgmt/partnerType';

  GET_ORGANIZATION_CONTACT_BY_ID = this.ORGANIZATION_CONTACT_BASE_URL;

  GET_ACCESS_TOKEN_URL = this.BASE_URL + '/usermgmt/auth/getAccessToken';

  ADMIN_USERS = this.BASE_URL + '/usermgmt/user';

  CREATE_USER_PASSWORD = this.BASE_URL + '/v4/identities/user/loginActivate';

  CHECK_ACTIVE_STATUS = this.BASE_URL + '/v4/identities/user/checkActiveStatus';

  GET_ADMIN_ROLE = this.BASE_URL + '/usermgmt/role/adminRole';

  CHECK_USER_MAIL = this.BASE_URL + '/v4/identities/user/forgetPassword';

  FEATURE_LIST_URL = this.BASE_URL + '/usermgmt/feature';

  GET_PREFERENCE_MENU = this.BASE_URL + '/v4/preferences';

  DATA_COLLECTION_URL = this.BASE_URL + '/v1/datacollection';

  REFERENCE_URL = this.BASE_URL + '/v1/references';

  TRANSACTION_SCHEMA = this.BASE_URL + '/usermgmt/org/schema';

  ORGANIZATION_URL = this.BASE_URL + '/v4/identities?type=org';

  IDENTITY_UPDATE_STATUS = this.BASE_URL + '/v4/identities/status/update';

  IDENTITIES_URL = this.BASE_URL + '/v4/identities';

  UPDATE_IDENTITY = this.IDENTITIES_URL + '/child';

  CREATE_ORGANIZATION = this.BASE_URL + '/v4/register';

  GET_COUNTRIES_URL = this.BASE_URL + '/usermgmt/country';

  GET_STATE_URL = this.BASE_URL + '/usermgmt/state';

  ORG_SCHEMA = this.BASE_URL + '/v1/datacollection/schema';

  ORG_CONTACT = this.BASE_URL + '/v4/contacts';

  USER_ROLES = this.BASE_URL + '/v4/roles';

  GLOBAL_PARAMETER = this.BASE_URL + '/v4/parameters';

  PARAMETERS_URL = this.BASE_URL + '/v4/parameters';

  DATACLTMODAL_URL = this.BASE_URL + '/v1/datacollection/deleteStatusAndDatacollection';

  CONTRACTS_SERVICE = this.BASE_URL + '/v4/contracts';

  BULK_CONTRACT_UPLOAD_LOGS_SERVICE = this.BASE_URL + '/v4/contractUploadLogs';

  UPLOAD_FILE_PATH = '/usr/local/FusionSeven/master/code/fs-data/in/';

  UPLOAD_SERVICE = this.BASE_URL;

  V3_CONTRACTS_SERVICE = this.BASE_URL +  '/v3/contracts';

  // REPORT_TEMPLATES = this.BASE_URL + '/v1/reportTemplates';

  // REPORTS = this.BASE_URL + '/v1/reports';

  // REPORTS = this.REPORT_SERVICE_API_GATEWAY_URL + '/reports/reports';

  // Enable for API gateway
  REPORT_TEMPLATES = 'https://cors-anywhere.herokuapp.com/https://plazo-dev.fusionseven.net/reports/reporttemplates?clientCode=btil';

  REPORTS = 'https://cors-anywhere.herokuapp.com/https://plazo-dev.fusionseven.net/reports/reports';

  constructor() { }

  // ENABLE FOR DEV ENV
  public getBaseURL(): string {
    const apis = localStorage.getItem('app_api');
    if (apis != null) {
      return (JSON.parse(apis)).api_fs;
    } else {
      return 'https://dev-api.fusionseven.net/api';
      //  return 'https://qa.fusionseven.net/api'; // for QA
      //  return 'http://localhost:3225/api'; // for local development
    }
  }
}
