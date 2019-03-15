import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { BaseService } from './base';
import 'rxjs/add/operator/toPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { Service } from './util';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

@Injectable()
export class OrganizationService {

  base: any;
  service: any;
  maxFileUploadSize =  1024; // in KB

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private toastr: ToastsManager) {

    this.base = new BaseService();
    this.service = new Service(router, http, toastr);
  }

  public getReferenceBulkImportLogs(clientCode, partnerType, countryCode) {
    // const clientCode = schemaContext.clientCode;
    // const createdBy = schemaContext.createdBy;
    // const params = 'context.client.code=' + clientCode + '&'&limit=1000';
    // console.log(params);

    const url = this.base.REFERENCE_URL + '/searchUploadLogs?context.client.code=' + clientCode +
      '&context.country.code=' + countryCode +
      '&context.partner.type=' + partnerType;
    return this.service.Call('get', url);

    // const url = this.base.BULK_CONTRACT_UPLOAD_LOGS_SERVICE + '/search' + '?' + params;
    // return this.service.Call('post', url);
    // return Observable.of(new HttpResponse({status: 200, body: this.smartContractUploadLogs}));
  }

  public getReferenceBulkImportLogById(id) {
    const url = this.base.REFERENCE_URL + '/searchUploadLogs?_id=' + id ;
    return this.service.Call('get', url);
  }

  makeFileRequest(url: string, params: Array<string>, file: File, templateID: any) {
    return new Promise((resolve, reject) => {
      const formData: any = new FormData();
      const xhr = new XMLHttpRequest();
      const date = new Date();
      const random = Math.floor(Math.random() * Math.floor(100000));
      const timeStamp = date.getFullYear().toString() + this.pad2(date.getMonth() + 1) + this.pad2(date.getDate()) + this.pad2(date.getHours()) + this.pad2(date.getMinutes()) + this.pad2(date.getSeconds())
      // const filename = 'CRF_DCCI_US_IORD_DCCI_' + templateID + '_' + timeStamp + '.csv';
      //const filename = file.name.replace('.csv','') + '_' + random + '_' + templateID + '.csv';
      const filename = file.name.replace('.csv','') + '_' + timeStamp + '.csv';
      formData.append('uploads', file, filename);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      }
      xhr.open('POST', url, true);
      xhr.send(formData);
    });
  }

  getHeaderArray(csvRecordsArr) {
    const headers = csvRecordsArr[0].split(';');
    const headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  executeFile(file: any, filename: any, templateID: any, filePath: string, ReferenceCreateMode: any): any {

    const reader = new FileReader();
    reader.readAsText(file);

    const __this = this;

    reader.onload = (data) => {
      const csvData = reader.result;
      const csvRecordsArray = csvData.split(/\r\n|\n/);
      const headersRow = this.getHeaderArray(csvRecordsArray);
      const dataPayload: any = {};
      dataPayload.params = {};
      dataPayload.params.maxAsyncS3 = 20;
      dataPayload.params.s3RetryCount = 3;
      dataPayload.params.s3RetryDelay = 1000;
      dataPayload.params.multipartUploadThreshold = 20971520;
      dataPayload.params.multipartUploadSize = 15728640;
      dataPayload.params.s3Options = {};
      dataPayload.params.s3Options.accessKeyId = 'AKIAJXQRDTGXZ3GXA62Q';
      dataPayload.params.s3Options.secretAccessKey = '/tBzAlMvxory0MlxJwym1+ibg9/W/lR8IJMSKyq5';
      dataPayload.params.localFile = filePath + filename.replace('csv', 'gz');
      dataPayload.params.s3Params = {};
      dataPayload.params.s3Params.Bucket = 'f7-dev-bc';
      dataPayload.params.s3Params.Key = filename.replace('csv', 'gz');
      dataPayload.referenceTemplateId = templateID;
      dataPayload.headers = headersRow;

      const dataObj = JSON.stringify(dataPayload);

      const token = localStorage.getItem('token');
      const headers = new Headers({'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token});
      const options = new RequestOptions({headers: headers});

      let userName = localStorage.getItem('loggedInUserEmail') || '';
      userName = (userName) ? userName.replace('+',''): userName;
      return this.http
        .post(this.base.REFERENCE_URL + '/upload', dataObj, options)
        .map(res => {
        }).subscribe(
          (resData) => {
            __this.toastr.success('Your request was received. You will be notified when the reference records are available ');
            console.log('Bulk upload processing ' + filename);
            const url = this.base.REFERENCE_URL + '/processUpload';
            return this.http.post(url, { reviewContracts : true, filename : filename, userName : userName, templateId: templateID,  ReferenceCreateMode: ReferenceCreateMode }, options)
              .toPromise()
              .then(function (res) {
                console.log(res['_body']);
                __this.toastr.info('The file ' + filename + ' was processed. Please visit the summary page for detailed information');
              })
              .catch(function (err) {

              });
          },
          (err) => {

            console.log(err);
            this.toastr.error(err._body, 'Error!');

          })
      // this.csvRecords = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
    }

    reader.onerror = function () {
      alert('Unable to read ' + file.name);
    };
  }

  public processReferenceUploadFile(windowRef: any, files: File[], templateID, ReferenceCreateMode: any ) {
    let sizeValidation = true;
    for (let i = 0; i < files.length; i++) {
      if ((files[i].size / 1024) > this.maxFileUploadSize) {
        sizeValidation = false;
        return sizeValidation;
      }
      // if (files[i].name.length > this.maxfileLength) {
      //     sizeValidation = false;
      //     return sizeValidation;
      // }

      // TODO: This needs to be changed later to consume the endpoint from '/api/upload'
      let apiURL = '';
      if (this.base.UPLOAD_SERVICE) {
        apiURL = this.base.UPLOAD_SERVICE.substring(0, this.base.UPLOAD_SERVICE.lastIndexOf('/'));
      }

      this.makeFileRequest(apiURL + '/upload', [], files[i], templateID).then((result: any) => {
        if (result.length) {
          this.executeFile(files[i], result[0].filename, templateID, this.base.UPLOAD_FILE_PATH, ReferenceCreateMode);
        }
      }, (error) => {
        console.error(error);
      });
      return sizeValidation;
    }
  }

  pad2(n) {
    return n < 10 ? '0' + n : n;
  };

  public getReferenceTemplateById(referenceTemplateId: any) {
    const url = this.base.DATA_COLLECTION_URL + '/dataModel/search?_id=' + referenceTemplateId;
    return this.service.Call('get', url);
  }

  /**
   * Create Organization Service from formData
   * @param dataObj
   */
  public createOrganization(dataObj: any) {
    const data = JSON.stringify(dataObj);
    return this.service.Call('post', this.base.CREATE_EDIT_ORGANIZATION, data);
  }

  /**
   * Fetch Organization Details from Organization ID
   * @param {string} organizationID
   */
  public getOrganizationByID(organizationID: string) {
    const url = this.base.ORGANIZATION_URL + '/' + organizationID;
    return this.service.Call('get', url);
  }

  /**
   * Fetch Reference Types for an organization
   * @param {string} organizationID
   */
  public getReferenceTypes(clientCode: string, countryCode: string ) {
    const url = this.base.BASE_URL + '/v4/referenceTypes?clientCode=' + clientCode + '&country=' + countryCode;
    return this.service.Call('get', url);
  }

  public getOrganizationContactByID(organizationID: string) {
    const url = this.base.GET_ORGANIZATION_CONTACT_BY_ID + '/' + organizationID;
    return this.service.Call('get', url);
  }

  public editOrganizationByID(organizationID: string, dataObj: any) {
    const url = this.base.ORGANIZATION_BASE_URL + '/' + organizationID;
    return this.service.Call('put', url, dataObj);
  }

  public editOrganizationContactByID(organizationID: string, dataObj: any) {
    const url = this.base.ORG_CONTACT + '/identity/' + organizationID;
    return this.service.Call('put', url, dataObj);
  }

  // Organization Schema
  public getOrganizationSchema() {
    const url = this.base.TRANSACTION_SCHEMA;
    return this.service.Call('get', url);
  }

  /**
   * Fetch all Organization Call
   */
  getAllOrganization() {
    return this.service.Call('get', this.base.IDENTITIES_URL + '/?type=org');
  }

  /**
   * Fetch  Organization by code
   * @param context
   */
  getOrganizationByContext(context) {
    return this.service.Call('get', this.base.IDENTITIES_URL + '/?type=org' + context);
  }

  /**
   * Update Organization Details
   * @param organizationId
   * @param Data
   */
  updateOrganization(organizationId, Data) {
    return this.service.Call('put', this.base.UPDATE_IDENTITY + '/' + organizationId, Data);
  }

  /**
   * Fetch All Country
   */
  public getCountries() {
    const url = this.base.GET_COUNTRIES_URL;
    return this.service.Call('get', url);
  }

  /**
   * Create Organization
   * @param dataObj
   */
  public createNewOrganization(dataObj: any) {
    const data = JSON.stringify(dataObj);
    return this.service.Call('post', this.base.CREATE_ORGANIZATION, data);
  }

  /**
   * Delete An Organization
   * @param organizationId
   * @param Data
   */
  removeOrganization(organizationId) {
    return this.service.Call('delete', this.base.IDENTITIES_URL + '/' + organizationId);
  }

  /**
   * Fetch All Country
   * @param orgCode
   */
  public getOrganizationCountry(orgCode) {
    const url = this.base.ORGANIZATION_URL + '/' + 'country' + '/' + orgCode;
    return this.service.Call('get', url);
  }

  /**
   * Fetch All Partner Type Code
   */
  public getPartnerTypeCode() {
    const url = this.base.PARTNER_TYPE + '/' + 'partner' + '/' + 'typeCodes';
    return this.service.Call('get', url);
  }

  /**
   * Create Organization PartnerType
   * @param dataObj
   */
  public createOrganizationPartnerType(dataObj: any) {

    const data = JSON.stringify(dataObj);
    return this.service.Call('post', this.base.ORGANIZATION_URL + '/partnerType', data);
  }

  /**
   * Fetch  Organization Partner Type
   */
  public getOrganizationPartnerType(organizationId: string) {
    const url = this.base.ORGANIZATION_URL + '/' + 'partnerType' + '/' + organizationId;
    return this.service.Call('get', url);
  }

  /**
   * Fetch Organization Details from Organization Code
   * @param {string} organizationID
   */
  public getOrganizationByCode(organizationID: string) {
    const url = this.base.ORG_CONTACT + '?identityid=' + organizationID;
    return this.service.Call('get', url);
  }

  /**
   * Create Organization PartnerType
   * @param partnerData
   */
  public createOrganizationPartner(partnerData: any) {
    return this.service.Call('post', this.base.CREATE_ORGANIZATION, partnerData);
  }

  /**
   * Fetch  Organization Partner
   * @param organizationCode
   * @param countryCode
   */
  public getOrganizationPartner(organizationCode: string, countryCode) {
    return this.service.Call('get', this.base.IDENTITIES_URL +
      '/?type=partner&status=active&context.client.code=' + organizationCode +
      '&context.country.code=' + countryCode);
  }

  /**
   * Update Organization Partner Details
   * @param OrganizationPartnerId
   * @param Data
   */
  updateOrganizationPartner(orgPartnerId: string, partnerData: any) {

    return this.service.Call('put', this.base.IDENTITIES_URL + '/child' + '/' + orgPartnerId, partnerData);
  }

  /**
   * Remove Organization Partner Details
   * @param OrganizationPartnerId
   * @param Data
   */

  public removeOrganizationPartner(orgPartnerId: string) {

    return this.service.Call('delete', this.base.IDENTITIES_URL + '/' + orgPartnerId);
  }

  /**
   * Remove DataCollection , Datamodal, Connection Status *
   */
  public removePartnerDataCollectionModal(partnerData: any) {

    return this.service.Call('delete', this.base.DATACLTMODAL_URL, partnerData);
  }

  public GetDataCollectionContextId(partnerCode: string, partnerType: string, clientCode: string, countryCode: string) {
    const url = this.base.DATA_COLLECTION_URL +
      '?context.partner.code=' + partnerCode + '&context.partner.type=' + partnerType +
      '&context.client.code=' + clientCode + '&context.country.code=' + countryCode;
    return this.service.Call('get', url);
  }

  public reLoadFunction() {
    return this.service.Call('get', this.base.DATA_COLLECTION_URL);
  }

  public getLastConnectorStatus(clientCode, partnerType, partnerCode, countryCode) {
    const url = this.base.DATA_COLLECTION_URL +
      '/connector/searchLastConnectorStatus?organization=' + clientCode + '&countryCode=' + countryCode +
      '&partnerCode=' + partnerCode + '&partnerType=' + partnerType;
    return this.service.Call('get', url);
  }

  public createDataModel(dataObj: any) {
    const url = this.base.DATA_COLLECTION_URL + '/dataModel/create';
    const data = JSON.stringify(dataObj);
    return this.service.Call('post', url, data);
  }

  public updateDataModel(dataModelId: string, dataObj: any) {
    const url = this.base.DATA_COLLECTION_URL + '/dataModel/update/' + dataModelId;
    const data = JSON.stringify(dataObj);
    return this.service.Call('put', url, data);
  }

  public updateMetaDataModel(meta: string, dataModelId: string, dataObj: any) {
    const url = this.base.DATA_COLLECTION_URL + '/dataModel/meta/' + meta + '/' + dataModelId;
    const data = JSON.stringify(dataObj);
    return this.service.Call('put', url, data);
  }

  public getDataModelInfo(clientCode, partnerType, partnerCode, countryCode) {
    const url = this.base.DATA_COLLECTION_URL + '/dataModel/search?context.client.code=' + clientCode +
      '&context.country.code=' + countryCode + '&context.partner.code=' + partnerCode +
      '&context.partner.type=' + partnerType;
    return this.service.Call('get', url);
  }

  public getDataModelInfoUsingCategory(clientCode, partnerType, countryCode, categoryType) {
    const url = this.base.DATA_COLLECTION_URL + '/dataModel/search?context.client.code=' + clientCode +
      '&context.country.code=' + countryCode +
      '&context.partner.type=' + partnerType + '&context.partner.category=' + categoryType;

    return this.service.Call('get', url);
  }

  public createReferenceSummary(dataObj, isExisting) {
    const data = JSON.stringify(dataObj);

    console.log('data')
    console.log(data);

    const url = isExisting ? this.base.REFERENCE_URL + '/update/' + dataObj._id : this.base.REFERENCE_URL + '/createReference';


    return this.service.Call(isExisting ? 'put' : 'post', url, data);
  }

  public deleteReferenceSummary(id) {
    const url = this.base.REFERENCE_URL + '/' + id;
    return this.service.Call('delete', url);
  }

  public getReferenceSummary(clientCode, countryCode, categoryType) {
    const url = this.base.REFERENCE_URL + '/search?context.client.code=' + clientCode +
      '&context.country.code=' + countryCode +
      '&context.partner.type=' + categoryType.toLowerCase();
    return this.service.Call('get', url);
  }

  public getReferenceSummaryById(id) {
    const url = this.base.REFERENCE_URL + '/' + id;
    return this.service.Call('get', url);
  }

  public deleteDataModel(dataModelId: string) {
    const url = this.base.DATA_COLLECTION_URL + '/dataModel/delete/' + dataModelId;
    return this.service.Call('delete', url);
  }

  /**
   * Add partner type service
   * @param dataObj
   */
  public CreateDataCollection(dataObj: any) {
    const data = JSON.stringify(dataObj);
    return this.service.Call('post', this.base.DATA_COLLECTION_URL, data);

  }

  public GetDataCollection(id: string) {
    const url = this.base.DATA_COLLECTION_URL + '/' + id;
    return this.service.Call('get', url);

  }

  /**
   * Create Organization Features
   * @param orgFet
   * @param dataObj
   */
  public updateOrganizationFeatures(orgFet, dataObj: any) {
    return this.service.Call('put', this.base.GLOBAL_ADMIN_USERS + '/features/orgs/' + orgFet, dataObj);
  }

  /**
   * Fetch  Organization Features
   * @param organizationId
   */
  public getOrganizationFeatures(organizationId: string) {
    return this.service.Call('get', this.base.GLOBAL_ADMIN_USERS + '/features/orgs/' + organizationId);
  }

  /**
   * Fetch All States
   */
  public getStates() {
    const url = this.base.GET_STATE_URL;
    return this.service.Call('get', url);
  }

  public getOrgSchema(clientCode, countryCode) {
    const url = this.base.DATA_COLLECTION_URL + '/schema/search?context.client.code=' + clientCode + '&context.country.code=' + countryCode;
    return this.service.Call('get', url);
  }

  /**
   * Fetch  Organization Schema Grid
   */
  public getOrgReportSchema(schemaContext: any) {
    const url = this.base.ORG_SCHEMA + '/search?' + schemaContext;
    return this.service.Call('get', url);
  }

  public getOrgReportSchemaById(schemaID: string) {
    const url = this.base.ORG_SCHEMA + '/search?' + schemaID;
    return this.service.Call('get', url);
  }

  public updateOrgReportSchemaById(dataObj: any, schemaID: string) {
    const data = JSON.stringify(dataObj);
    const url = this.base.ORG_SCHEMA + '/update/' + schemaID;
    return this.service.Call('put', url, data);
  }

  public createOrgReportSchema(dataObj: any) {
    const data = JSON.stringify(dataObj);
    const url = this.base.ORG_SCHEMA + '/create';
    return this.service.Call('post', url, data);
  }

  public deleteOrgReportSchema(dataObj: any) {
    const url = this.base.ORG_SCHEMA + '/delete/' + dataObj;
    return this.service.Call('delete', url);
  }

  /**
   * Get All Category
   */
  public getCategory() {
    // create observable
    return new Observable(observer => {
      // observable execution
      observer.next(
        {
          Category: [{
            Code: 'TXN',
            Name: 'TXN'
          }, {
            Code: 'REF',
            Name: 'REF'
          }, {
            Code: 'CTRT',
            Name: 'CTRT'
          },
          {
            Code: 'MATCH',
            Name: 'MATCH'
          },
          {
            Code: 'RAW',
            Name: 'RAW'
          }]
        }
      );
      observer.complete();
    });
  }

  /**
   * Fetch list of values based on the field
   * @returns {Observable<any>}
   */
  public getFieldValues(arrayVal: any) {
    const paramType = ['global', 'org', 'partner'];
    const paramIdentifier = _.includes(paramType, arrayVal[0]['paramType']) ? arrayVal[0]['paramType'] : paramType[0];
    const url = this.base.PARAMETERS_URL + '?parameterType=' + paramIdentifier;
    const headers = new Headers({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') });
    const options = new RequestOptions({ headers: headers });
    const result = [];
    const field = arrayVal[0].field;
    const module = arrayVal[0].module;
      return this.http.get(url, options).map(res => {
        res.json().docs.forEach(item => {

          if (_.isEqual(item.name.toLowerCase(), field) && (_.isEqual(module, 'organization') ||
              _.isEqual(module, 'partner') || _.isEqual(module, 'addAdminUser'))) {
            result.push({ field: field, value: item.value });
          }
        });
        return result;
      }).share();
  }
}
