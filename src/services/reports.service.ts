import {Injectable} from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import {BaseService} from './base';
import 'rxjs/add/operator/toPromise';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastsManager} from 'ng2-toastr';
import {Service} from './util';
import {Observable} from 'rxjs/Observable';
import {HttpResponse} from '@angular/common/http';

@Injectable()
export class ReportsService {

  base: any;
  service: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private http: Http,
              private toastr: ToastsManager) {

    this.base = new BaseService();
    this.service = new Service(router, http, toastr);
  }

  reportTemplates: any = {
    "docs": [
      {
        "_id": "5bf258d1911c08440b9721bd",
        "createdAt": "2018-11-19T06:31:46.084Z",
        "updatedAt": "2019-01-03T08:55:14.350Z",
        "type": "billing",
        "name": "btil_adhoc",
        "id": "RPT2",
        "context": {
          "partner": {
            "type": [
              "PROV",
              "TPAS",
              "VERI"
            ],
            "code": "btil"
          },
          "client": {
            "name": "btil",
            "code": "btil"
          },
          "version": {
            "minor": 0,
            "major": 1
          },
          "name": "btil_adhoc"
        },
        "report": {
          "period": {
            "_id": "58ece1f00aaf3c05c8b0568b",
            "aggregation": [
              {
                "option": "Daily",
                "isDefault": true,
                "_id": "58ece1f00aaf3c05c8b05693"
              },
              {
                "option": "Monthly",
                "_id": "58ece1f00aaf3c05c8b05692"
              }
            ],
            "duration": [
              {
                "option": "Yesterday",
                "value": 1,
                "start": "2016-07-24T18:30:00.000Z",
                "end": "2016-07-30T18:30:00.000Z",
                "isDefault": true,
                "_id": "58ece1f00aaf3c05c8b05691"
              },
              {
                "option": "Last 7 Days",
                "value": 7,
                "start": "2016-07-24T18:30:00.000Z",
                "end": "2016-07-30T18:30:00.000Z",
                "_id": "58ece1f00aaf3c05c8b05690"
              },
              {
                "option": "Last N Days",
                "value": 25,
                "start": "2016-07-24T18:30:00.000Z",
                "end": "2016-08-15T18:30:00.000Z",
                "_id": "58ece1f00aaf3c05c8b0568f"
              },
              {
                "option": "Last Month",
                "value": 30,
                "start": "2016-06-30T18:30:00.000Z",
                "end": "2016-07-30T18:30:00.000Z",
                "_id": "58ece1f00aaf3c05c8b0568e"
              },
              {
                "option": "Last Quarter",
                "value": 90,
                "start": "2016-06-30T18:30:00.000Z",
                "end": "2016-07-30T18:30:00.000Z",
                "_id": "58ece1f00aaf3c05c8b0568d"
              },
              {
                "option": "Custom Period",
                "value": 120,
                "start": "2016-07-24T18:30:00.000Z",
                "end": "2016-08-15T18:30:00.000Z",
                "_id": "58ece1f00aaf3c05c8b0568c"
              }
            ]
          },
          "delivery": {
            "oneTimeRun": false,
            "active": true,
            "public": true,
            "s3": {
              "enabled": false,
              "bucket": "test",
              "secretAccessKey": "test",
              "accessKeyId": "test"
            },
            "schedule": {
              "runOnce": false,
              "_id": "58ece1f00aaf3c05c8b0568a",
              "end_date": "2017-07-24T18:30:00.000Z",
              "start_date": "2016-07-24T18:30:00.000Z"
            },
            "runTime": "2016-09-30T04:00:00.000Z",
            "email": "dinesh@fusionseven.com, marty@fusionseven.com",
            "emailEnabled": true,
            "filename": "blabla",
            "type": "csv",
            "_id": "58ece1f00aaf3c05c8b05683",
            "ftp": {
              "enabled": true,
              "host": "52.24.48.74",
              "user": "marty",
              "password": "password",
              "directory": "/",
              "port": 21,
              "mode": "passive"
            },
            "extension": [
              {
                "option": "csv",
                "isDefault": true,
                "_id": "58ece1f00aaf3c05c8b05689"
              },
              {
                "option": "txt",
                "_id": "58ece1f00aaf3c05c8b05688"
              }
            ],
            "frequency": [
              {
                "selected": true,
                "values": [

                ],
                "_id": "58ece1f00aaf3c05c8b05687",
                "option": "Daily"
              },
              {
                "selected": false,
                "values": [
                  "Mon",
                  "Tue"
                ],
                "_id": "58ece1f00aaf3c05c8b05686",
                "option": "Weekly"
              },
              {
                "selected": false,
                "values": [
                  "1,15,28"
                ],
                "_id": "58ece1f00aaf3c05c8b05685",
                "option": "Monthly"
              },
              {
                "selected": false,
                "values": [
                  "31:Jan,Apr,Jul,Oct"
                ],
                "_id": "58ece1f00aaf3c05c8b05684",
                "option": "Quarterly"
              }
            ]
          },
          "derivedAttributes": [
            {
              "fieldSets": [
                {
                  "fields": [
                    {
                      "isStaticField": true,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "f7_name": "Custom",
                      "report_alias": "A2_Custom_Dimension",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ]
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "A1_All",
                      "f7_name": "A1_All"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Client Code",
                      "f7_name": "client_code"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Client Name",
                      "f7_name": "client_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Partner Type",
                      "f7_name": "partner_type"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Partner Code",
                      "f7_name": "partner_code"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Partner Name",
                      "f7_name": "partner_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Country Code",
                      "f7_name": "country_code"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Advertiser ID",
                      "f7_name": "advertiser_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Advertiser Name",
                      "f7_name": "advertiser_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Campaign ID",
                      "f7_name": "campaign_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Campaign Name",
                      "f7_name": "campaign_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Placement ID",
                      "f7_name": "placement_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Placement Name",
                      "f7_name": "placement_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Creative ID",
                      "f7_name": "creative_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "Creative Name",
                      "f7_name": "creative_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Creative Size",
                      "f7_name": "creative_size"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "veri"
                      ],
                      "report_alias": "Media Property",
                      "f7_name": "media_property"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "prov"
                      ],
                      "report_alias": "Currency Code",
                      "f7_name": "currency_code"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas"
                      ],
                      "report_alias": "Site ID",
                      "f7_name": "site_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Site Name",
                      "f7_name": "site_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Campaign Type",
                      "f7_name": "campaign_type"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Publisher Name",
                      "f7_name": "ctrt_iord_publisher_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Advertiser name",
                      "f7_name": "ctrt_iord_advertiser_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Estimate Code",
                      "f7_name": "ctrt_iord_estimate_code"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Estimate Description",
                      "f7_name": "ctrt_iord_estimate_description"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Campaign Id",
                      "f7_name": "ctrt_iord_campaign_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Campaign Name",
                      "f7_name": "ctrt_iord_campaign_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Start Date",
                      "f7_name": "ctrt_iord_start_date"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract End Date",
                      "f7_name": "ctrt_iord_end_date"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Ad Unit",
                      "f7_name": "ctrt_iord_ad_unit"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Rate Type",
                      "f7_name": "ctrt_iord_rate_type"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "report_alias": "Contract Creative Size",
                      "f7_name": "ctrt_iord_creative_size"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Budget Type",
                      "f7_name": "ctrt_iord_budget_type"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Package Id",
                      "f7_name": "ctrt_iord_package_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract TPAS Advertiser Id",
                      "f7_name": "ctrt_iord_tpas_advertiser_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract TPAS Advertiser Name",
                      "f7_name": "ctrt_iord_tpas_advertiser_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract TPAS Campaign Id",
                      "f7_name": "ctrt_iord_tpas_campaign_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract TPAS Campaign Name",
                      "f7_name": "ctrt_iord_tpas_campaign_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract TPAS Placement Id",
                      "f7_name": "ctrt_iord_tpas_placement_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract TPAS Placement Name",
                      "f7_name": "ctrt_iord_tpas_placement_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract PROV Advertiser Id",
                      "f7_name": "ctrt_iord_prov_advertiser_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract PROV Advertiser Name",
                      "f7_name": "ctrt_iord_prov_advertiser_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract PROV Campaign Id",
                      "f7_name": "ctrt_iord_prov_campaign_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract PROV Campaign Name",
                      "f7_name": "ctrt_iord_prov_campaign_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Placement Id",
                      "f7_name": "ctrt_iord_placement_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Placement Name",
                      "f7_name": "ctrt_iord_placement_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract PROV Placement Id",
                      "f7_name": "ctrt_iord_prov_placement_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract PROV Placement Name",
                      "f7_name": "ctrt_iord_prov_placement_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract PROV Partner Code",
                      "f7_name": "ctrt_iord_prov_partner_code"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Source",
                      "f7_name": "ctrt_iord_contract_source"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Account Id",
                      "f7_name": "ctrt_iord_account_id"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Type",
                      "f7_name": "ctrt_iord_agent_type"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Agent First Name",
                      "f7_name": "ctrt_iord_agent_first_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Agent Last Name",
                      "f7_name": "ctrt_iord_agent_last_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Month Count Check",
                      "f7_name": "ctrt_iord_month_count_check"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Termination Date",
                      "f7_name": "ctrt_iord_termination_date"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Selected Product",
                      "f7_name": "ctrt_iord_product_name"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Agent Tactic",
                      "f7_name": "ctrt_iord_agent_tactic"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Reporting Tactic ",
                      "f7_name": "ctrt_iord_reporting_tactic"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Creative",
                      "f7_name": "ctrt_iord_creative"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Auto Restricted",
                      "f7_name": "ctrt_iord_auto_restricted"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Homeowners Restricted",
                      "f7_name": "ctrt_iord_homeowners_restricted"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Renters Restricted",
                      "f7_name": "ctrt_iord_renters_restricted"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Agent Run Renters",
                      "f7_name": "ctrt_iord_agent_run_renters"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Language",
                      "f7_name": "ctrt_iord_language"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Regional Billing Code",
                      "f7_name": "ctrt_iord_regional_billing_code"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract ST Code",
                      "f7_name": "ctrt_iord_st_code"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Market Area",
                      "f7_name": "ctrt_iord_market_area"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Market City",
                      "f7_name": "ctrt_iord_market_city"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Market County",
                      "f7_name": "ctrt_iord_market_county"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Market State",
                      "f7_name": "ctrt_iord_market_state"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Target Demo",
                      "f7_name": "ctrt_iord_target_demographics"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Targeting Zip Codes",
                      "f7_name": "ctrt_iord_target_zip_codes"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Tier",
                      "f7_name": "ctrt_iord_tier"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract General Market URL",
                      "f7_name": "ctrt_iord_general_market_url"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract General Market URL Type",
                      "f7_name": "ctrt_iord_general_market_url_type"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Renters URL",
                      "f7_name": "ctrt_iord_renters_url"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Renters URL Type",
                      "f7_name": "ctrt_iord_renters_url_type"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Contract Brand Safety Source",
                      "f7_name": "ctrt_iord_brand_safety_source"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "mappedField": true,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Deactivation Date",
                      "f7_name": "ctrt_iord_deactivation_date"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Date",
                      "f7_name": "date"
                    },
                    {
                      "isStaticField": false,
                      "isCustomField": false,
                      "isCustomAlias": false,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "report_alias": "Month",
                      "f7_name": "month_of_date"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "Derived",
                      "alias": "Derived Metric",
                      "report_alias": "A2 Derived_Metric",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "pick_first",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "ctrt_iord_campaign_length",
                      "alias": "Contract Campaign Length",
                      "report_alias": "Contract Campaign Length",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Impressions",
                      "alias": "Impressions",
                      "f7_name": "impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "tpas",
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Viewable Impressions",
                      "alias": "Viewable Impressions",
                      "f7_name": "viewable_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Clicks",
                      "alias": "Clicks",
                      "f7_name": "clicks"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Conversions",
                      "alias": "Conversions",
                      "f7_name": "conversions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "A1_All",
                      "alias": "A1_All",
                      "f7_name": "A1_All"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Unique User Clicks",
                      "alias": "Unique User Clicks",
                      "f7_name": "unique_user_clicks"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Video First Quartile",
                      "alias": "Video First Quartile",
                      "f7_name": "video_first_quartile"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Video Second Quartile",
                      "alias": "Video Second Quartile",
                      "f7_name": "video_second_quartile"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Video Third Quartile",
                      "alias": "Video Third Quartile",
                      "f7_name": "video_third_quartile"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Video Fourth Quartile",
                      "alias": "Video Fourth Quartile",
                      "f7_name": "video_fourth_quartile"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Video Start",
                      "alias": "Video Start",
                      "f7_name": "video_start"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Views",
                      "alias": "Views",
                      "f7_name": "views"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Views Rate",
                      "alias": "Views Rate",
                      "f7_name": "views_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Interactions",
                      "alias": "Interactions",
                      "f7_name": "interactions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Interaction Rate",
                      "alias": "Interaction Rate",
                      "f7_name": "interaction_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Authentic Impressions",
                      "alias": "Authentic Impressions",
                      "f7_name": "authentic_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Brand Safety Impressions",
                      "alias": "Brand Safety Impressions",
                      "f7_name": "brand_safe_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Brand Safety Rate",
                      "alias": "Brand Safety Rate",
                      "f7_name": "brand_safe_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Brand Safety Blocks",
                      "alias": "Brand Safety Blocks",
                      "f7_name": "brand_safety_blocks"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Fraud Incidents",
                      "alias": "Fraud Incidents",
                      "f7_name": "fraud_incidents"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Display Eligible Impressions",
                      "alias": "Display Eligible Impressions",
                      "f7_name": "display_eligible_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Display Viewable Rate",
                      "alias": "Display Viewable Rate",
                      "f7_name": "display_viewable_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Display Measured Impressions",
                      "alias": "Display Measured Impressions",
                      "f7_name": "display_measured_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Video Eligible Impressions",
                      "alias": "Video Eligible Impressions",
                      "f7_name": "video_eligible_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Video Measured Impressions",
                      "alias": "Video Measured Impressions",
                      "f7_name": "video_measured_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Video Viewable Impressions",
                      "alias": "Video Viewable Impressions",
                      "f7_name": "video_viewable_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Media Cost",
                      "alias": "Media Cost",
                      "f7_name": "media_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Total Media Cost",
                      "alias": "Total Media Cost",
                      "f7_name": "total_media_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Data Cost",
                      "alias": "Data Cost",
                      "f7_name": "data_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Privacy compliance cost",
                      "alias": "Privacy compliance cost",
                      "f7_name": "privacy_compliance_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Contextual Cost",
                      "alias": "Contextual Cost",
                      "f7_name": "contextual_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Platform Cost",
                      "alias": "Platform Cost",
                      "f7_name": "platform_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Ad Serving Cost",
                      "alias": "Ad Serving Cost",
                      "f7_name": "ad_serving_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Total Cost",
                      "alias": "Total Cost",
                      "f7_name": "total_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [
                        {
                          "f7_name": "impressions",
                          "alias": "Impressions",
                          "report_alias": "Impressions",
                          "selected": false,
                          "partnerType": [
                            "dspd"
                          ],
                          "agg_func": "sum",
                          "type": "Number"
                        },
                        {
                          "f7_name": "ctrt_iord_publisher_name",
                          "alias": "Contract Publisher Name",
                          "report_alias": "Contract Publisher Name",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "ctrt_iord_campaign_id",
                          "alias": "Contract Campaign Id",
                          "report_alias": "Contract Campaign Id",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "placement_id",
                          "alias": "Placement ID",
                          "report_alias": "Placement ID",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "isRateField": true,
                      "isWeightedAVG": true,
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "CPM",
                      "alias": "CPM",
                      "f7_name": "cpm"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [
                        {
                          "f7_name": "impressions",
                          "alias": "Impressions",
                          "report_alias": "Impressions",
                          "selected": false,
                          "partnerType": [
                            "dspd"
                          ],
                          "agg_func": "sum",
                          "type": "Number"
                        },
                        {
                          "f7_name": "ctrt_iord_publisher_name",
                          "alias": "Contract Publisher Name",
                          "report_alias": "Contract Publisher Name",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "ctrt_iord_campaign_id",
                          "alias": "Contract Campaign Id",
                          "report_alias": "Contract Campaign Id",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "placement_id",
                          "alias": "Placement ID",
                          "report_alias": "Placement ID",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "isRateField": true,
                      "isWeightedAVG": true,
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "CPC",
                      "alias": "CPC",
                      "f7_name": "cpc"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "CTR",
                      "alias": "CTR",
                      "f7_name": "ctr"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [
                        {
                          "f7_name": "impressions",
                          "alias": "Impressions",
                          "report_alias": "Impressions",
                          "selected": false,
                          "partnerType": [
                            "dspd"
                          ],
                          "agg_func": "sum",
                          "type": "Number"
                        },
                        {
                          "f7_name": "ctrt_iord_publisher_name",
                          "alias": "Contract Publisher Name",
                          "report_alias": "Contract Publisher Name",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "ctrt_iord_campaign_id",
                          "alias": "Contract Campaign Id",
                          "report_alias": "Contract Campaign Id",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "placement_id",
                          "alias": "Placement ID",
                          "report_alias": "Placement ID",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "isRateField": true,
                      "isWeightedAVG": true,
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "CPA",
                      "alias": "CPA",
                      "f7_name": "cpa"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [
                        {
                          "f7_name": "impressions",
                          "alias": "Impressions",
                          "report_alias": "Impressions",
                          "selected": false,
                          "partnerType": [
                            "dspd"
                          ],
                          "agg_func": "sum",
                          "type": "Number"
                        },
                        {
                          "f7_name": "ctrt_iord_publisher_name",
                          "alias": "Contract Publisher Name",
                          "report_alias": "Contract Publisher Name",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "ctrt_iord_campaign_id",
                          "alias": "Contract Campaign Id",
                          "report_alias": "Contract Campaign Id",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "placement_id",
                          "alias": "Placement ID",
                          "report_alias": "Placement ID",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "isStaticField": false,
                          "mappedField": true
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "isRateField": true,
                      "isWeightedAVG": true,
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "CPV",
                      "alias": "CPV",
                      "f7_name": "cpv"
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Quantity",
                      "alias": "Contract Quantity",
                      "f7_name": "ctrt_iord_quantity"
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Actual Units",
                      "alias": "Contract Actual Units",
                      "f7_name": "ctrt_iord_actual_units"
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Budget",
                      "alias": "Contract Budget",
                      "f7_name": "ctrt_iord_budget"
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Net Media Budget",
                      "alias": "Contract Net Media Budget",
                      "f7_name": "ctrt_iord_net_media_budget"
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "pick_first",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Nielsen County Size",
                      "alias": "Contract Nielsen County Size",
                      "f7_name": "ctrt_iord_nielsen_county_size"
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "pick_first",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Number of Zip Codes Targeted",
                      "alias": "Contract Number of Zip Codes Targeted",
                      "f7_name": "ctrt_iord_target_no_of_zip_codes"
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "pick_first",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Targeting Radius",
                      "alias": "Contract Targeting Radius",
                      "f7_name": "ctrt_iord_target_radius"
                    },
                    {
                      "type": "Number",
                      "agg_func": "pick_first",
                      "isDerivedField": false,
                      "derivedField_func": "pick_first",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Digital Media Radius Population",
                      "alias": "Contract Digital Media Radius Population",
                      "f7_name": "ctrt_iord_target_population"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Ad Serving Rate",
                      "alias": "Contract Ad Serving Rate",
                      "f7_name": "ctrt_iord_ad_serving_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Ad Serving Cost",
                      "alias": "Contract Ad Serving Cost",
                      "f7_name": "ctrt_iord_ad_serving_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract CPM",
                      "alias": "Contract CPM",
                      "f7_name": "ctrt_iord_cpm"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract CPC",
                      "alias": "Contract CPC",
                      "f7_name": "ctrt_iord_cpc"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Vendor Floor CPM",
                      "alias": "Contract Vendor Floor CPM",
                      "f7_name": "ctrt_iord_vendor_floor_cpm"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Vendor Impressions ",
                      "alias": "Contract Vendor Impressions ",
                      "f7_name": "ctrt_iord_vendor_floor_impressions"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Vendor Floor CPC",
                      "alias": "Contract Vendor Floor CPC",
                      "f7_name": "ctrt_iord_vendor_floor_cpc"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Vendor Clicks ",
                      "alias": "Contract Vendor Clicks ",
                      "f7_name": "ctrt_iord_vendor_floor_clicks"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Brand Safety Cost",
                      "alias": "Contract Brand Safety Cost",
                      "f7_name": "ctrt_iord_brand_safety_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "Contract Brand Safety Rate",
                      "alias": "Contract Brand Safety Rate",
                      "f7_name": "ctrt_iord_brand_safety_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_budget",
                          "alias": "Contract Budget",
                          "report_alias": "Contract Budget",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "agg_func": "pick_first",
                          "type": "Number"
                        },
                        {
                          "f7_name": "fs_total_cost",
                          "alias": "F7 Calculated Total Cost",
                          "report_alias": "F7 Calculated Total Cost",
                          "selected": false,
                          "partnerType": [
                            "prov"
                          ],
                          "agg_func": "sum",
                          "type": "Number"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "Spend_Delta",
                      "alias": "Spend Delta",
                      "report_alias": "Spend Delta",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "No of days in campaign",
                      "alias": "No of days in campaign",
                      "report_alias": "No of days in campaign",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "No of days CTD ",
                      "alias": "No of days CTD",
                      "report_alias": "No of days CTD",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isCustomFunction": true,
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "No of days in month",
                      "alias": "No of days in month",
                      "report_alias": "No of days in month",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "No of days MTD ",
                      "alias": "No of days MTD",
                      "report_alias": "No of days MTD",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "No of days remaining in month",
                      "alias": "No of days remaining in month",
                      "report_alias": "No of days remaining in month",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "No of days remaining in campaign",
                      "alias": "No of days remaining in campaign",
                      "report_alias": "No of days remaining in campaign",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "No of days remaining in campaign after end of month",
                      "alias": "No of days remaining in campaign after end of month",
                      "report_alias": "No of days remaining in campaign after end of month",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ]
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Total Media Cost",
                      "alias": "F7 Calculated Total Media Cost",
                      "f7_name": "fs_total_media_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Platform Cost",
                      "alias": "F7 Calculated Platform Cost",
                      "f7_name": "fs_platform_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Ad Serving Cost",
                      "alias": "F7 Calculated Ad Serving Cost",
                      "f7_name": "fs_ad_serving_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Total Cost",
                      "alias": "F7 Calculated Total Cost",
                      "f7_name": "fs_total_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Other Cost",
                      "alias": "F7 Calculated Other Cost",
                      "f7_name": "fs_other_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated ECPM",
                      "alias": "F7 Calculated ECPM",
                      "f7_name": "fs_ecpm"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Agency Fee",
                      "alias": "F7 Calculated Agency Fee",
                      "f7_name": "fs_agency_fee"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Revenue",
                      "alias": "F7 Calculated Revenue",
                      "f7_name": "fs_revenue"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Profit",
                      "alias": "F7 Calculated Profit",
                      "f7_name": "fs_profit"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Profit Margin",
                      "alias": "F7 Calculated Profit Margin",
                      "f7_name": "fs_profit_margin"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated ROI",
                      "alias": "F7 Calculated ROI",
                      "f7_name": "fs_roi"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated CPM",
                      "alias": "F7 Calculated CPM",
                      "f7_name": "fs_cpm"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated CPC",
                      "alias": "F7 Calculated CPC",
                      "f7_name": "fs_cpc"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated CPA",
                      "alias": "F7 Calculated CPA",
                      "f7_name": "fs_cpa"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated CPCV",
                      "alias": "F7 Calculated CPCV",
                      "f7_name": "fs_cpcv"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated CPE",
                      "alias": "F7 Calculated CPE",
                      "f7_name": "fs_cpe"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated CTR",
                      "alias": "F7 Calculated CTR",
                      "f7_name": "fs_ctr"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Conversion Rate",
                      "alias": "F7 Calculated Conversion Rate",
                      "f7_name": "fs_conversion_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Engagement Rate",
                      "alias": "F7 Calculated Engagement Rate",
                      "f7_name": "fs_engagement_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "sum",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Viewability Rate",
                      "alias": "F7 Calculated Viewability Rate",
                      "f7_name": "fs_viewability_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "average",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Verification Brand Safety Rate",
                      "alias": "F7 Calculated Verification Brand Safety Rate",
                      "f7_name": "fs_veri_brand_safety_rate"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": false,
                      "derivedField_func": "average",
                      "derivedField_func_param": [

                      ],
                      "nestedDerivedFields": [

                      ],
                      "partnerType": [
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "F7 Calculated Verification Brand Safety Cost",
                      "alias": "F7 Calculated Verification Brand Safety Cost",
                      "f7_name": "fs_veri_brand_safety_cost"
                    },
                    {
                      "type": "Number",
                      "agg_func": "sum",
                      "isDerivedField": true,
                      "derivedField_func": "subtract",
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "nestedDerivedFields": [

                      ],
                      "f7_name": "daysBetween",
                      "alias": "daysBetween",
                      "report_alias": "daysBetween",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          "_id": "58ece1f00aaf3c05c8b05607",
          "alert": [

          ],
          "filterList": [
            {
              "_id": "58ece1f00aaf3c05c8b05674",
              "fieldSets": [
                {
                  "_id": "58ece1f00aaf3c05c8b05675",
                  "fields": [
                    {
                      "f7_name": "ctrt_iord_advertiser_name",
                      "alias": "Contract Advertiser name",
                      "report_alias": "Contract Advertiser name",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "parent": "",
                      "_id": "58ece1f00aaf3c05c8b05680",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_publisher_name",
                      "alias": "Contract Publisher Name",
                      "report_alias": "Contract Publisher Name",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "parent": "ctrt_iord_advertiser_name",
                      "_id": "58ece1f00aaf3c05c8b0567f",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_campaign_id",
                      "alias": "Contract Campaign Id",
                      "report_alias": "Contract Campaign Id",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "parent": "ctrt_iord_publisher_name",
                      "_id": "58ece1f00aaf3c05c8b0567e",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_campaign_name",
                      "alias": "Contract Campaign Name",
                      "report_alias": "Contract Campaign Name",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "parent": "ctrt_iord_campaign_id",
                      "_id": "58ece1f00aaf3c05c8b0567c",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_account_id",
                      "alias": "Contract Account ID",
                      "report_alias": "Contract Account Id",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "parent": "ctrt_iord_campaign_name",
                      "_id": "58ece1f00aaf3c05c8b0567c",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_reporting_tactic",
                      "alias": "Contract Reporting Tactic",
                      "report_alias": "Contract Reporting Tactic",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "parent": "ctrt_iord_campaign_name",
                      "_id": "58ece1f00aaf3c05c8b0567c",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_placement_id",
                      "alias": "Placement ID",
                      "report_alias": "Placement ID",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "parent": "ctrt_iord_campaign_name",
                      "_id": "58ece1f00aaf3c05c8b0567c",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_placement_name",
                      "alias": "Placement Name",
                      "report_alias": "Placement Name",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "parent": "ctrt_iord_placement_id",
                      "_id": "58ece1f00aaf3c05c8b0567c",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    }
                  ]
                }
              ]
            }
          ],
          "metrics": [
            {
              "_id": "58ece1f00aaf3c05c8b05652",
              "fieldSets": [
                {
                  "_id": "58ece1f00aaf3c05c8b05653",
                  "fields": [
                    {
                      "_id": "58ece1f00aaf3c05c8b05673",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "A2 Derived_Metric",
                      "alias": "Derived Metric",
                      "f7_name": "Derived",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5c15f4ccc50f2a37a6a8c77c",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "selected": false,
                      "report_alias": "Contract Campaign Length",
                      "alias": "Contract Campaign Length",
                      "f7_name": "ctrt_iord_campaign_length",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "pick_first",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "impressions",
                      "alias": "Impressions",
                      "report_alias": "Impressions",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05673",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "viewable_impressions",
                      "alias": "Viewable Impressions",
                      "report_alias": "Viewable Impressions",
                      "selected": false,
                      "partnerType": [
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05673",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "clicks",
                      "alias": "Clicks",
                      "report_alias": "Clicks",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05672",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "conversions",
                      "alias": "Conversions",
                      "report_alias": "Conversions",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05671",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf358d",
                      "f7_name": "A1_All",
                      "alias": "A1_All",
                      "report_alias": "A1_All",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "unique_user_clicks",
                      "alias": "Unique User Clicks",
                      "report_alias": "Unique User Clicks",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05665",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "video_first_quartile",
                      "alias": "Video First Quartile",
                      "report_alias": "Video First Quartile",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05665",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "video_second_quartile",
                      "alias": "Video Second Quartile",
                      "report_alias": "Video Second Quartile",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05665",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "video_third_quartile",
                      "alias": "Video Third Quartile",
                      "report_alias": "Video Third Quartile",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05665",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "video_fourth_quartile",
                      "alias": "Video Fourth Quartile",
                      "report_alias": "Video Fourth Quartile",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05665",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "video_start",
                      "alias": "Video Start",
                      "report_alias": "Video Start",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05665",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "views",
                      "alias": "Views",
                      "report_alias": "Views",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05665",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "views_rate",
                      "alias": "Views Rate",
                      "report_alias": "Views Rate",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05670",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "interactions",
                      "alias": "Interactions",
                      "report_alias": "Interactions",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566f",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "interaction_rate",
                      "alias": "Interaction Rate",
                      "report_alias": "Interaction Rate",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "authentic_impressions",
                      "alias": "Authentic Impressions",
                      "report_alias": "Authentic Impressions",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "brand_safe_impressions",
                      "alias": "Brand Safety Impressions",
                      "report_alias": "Brand Safety Impressions",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "brand_safe_rate",
                      "alias": "Brand Safety Rate",
                      "report_alias": "Brand Safety Rate",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "brand_safety_blocks",
                      "alias": "Brand Safety Blocks",
                      "report_alias": "Brand Safety Blocks",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fraud_incidents",
                      "alias": "Fraud Incidents",
                      "report_alias": "Fraud Incidents",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "display_eligible_impressions",
                      "alias": "Display Eligible Impressions",
                      "report_alias": "Display Eligible Impressions",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "display_viewable_rate",
                      "alias": "Display Viewable Rate",
                      "report_alias": "Display Viewable Rate",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "display_measured_impressions",
                      "alias": "Display Measured Impressions",
                      "report_alias": "Display Measured Impressions",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "video_eligible_impressions",
                      "alias": "Video Eligible Impressions",
                      "report_alias": "Video Eligible Impressions",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "video_measured_impressions",
                      "alias": "Video Measured Impressions",
                      "report_alias": "Video Measured Impressions",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "video_viewable_impressions",
                      "alias": "Video Viewable Impressions",
                      "report_alias": "Video Viewable Impressions",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "media_cost",
                      "alias": "Media Cost",
                      "report_alias": "Media Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566b",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "total_media_cost",
                      "alias": "Total Media Cost",
                      "report_alias": "Total Media Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566b",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "data_cost",
                      "alias": "Data Cost",
                      "report_alias": "Data Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566b",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "privacy_compliance_cost",
                      "alias": "Privacy compliance cost",
                      "report_alias": "Privacy compliance cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566b",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "contextual_cost",
                      "alias": "Contextual Cost",
                      "report_alias": "Contextual Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566b",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "platform_cost",
                      "alias": "Platform Cost",
                      "report_alias": "Platform Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566b",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ad_serving_cost",
                      "alias": "Ad Serving Cost",
                      "report_alias": "Ad Serving Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566b",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "total_cost",
                      "alias": "Total Cost",
                      "report_alias": "Total Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566b",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "cpm",
                      "alias": "CPM",
                      "report_alias": "CPM",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566a",
                      "isWeightedAVG": true,
                      "isRateField": true,
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "impressions",
                          "alias": "Impressions",
                          "report_alias": "Impressions",
                          "selected": false,
                          "partnerType": [
                            "dspd"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05673",
                          "agg_func": "sum",
                          "type": "Number"
                        },
                        {
                          "f7_name": "ctrt_iord_publisher_name",
                          "alias": "Contract Publisher Name",
                          "report_alias": "Contract Publisher Name",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "isStaticField": false,
                          "mappedField": true,
                          "_id": "58ece1f00aaf3c05c8b05651"
                        },
                        {
                          "f7_name": "ctrt_iord_campaign_id",
                          "alias": "Contract Campaign Id",
                          "report_alias": "Contract Campaign Id",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0567e",
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "placement_id",
                          "alias": "Placement ID",
                          "report_alias": "Placement ID",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0567e",
                          "isStaticField": false,
                          "mappedField": true
                        }
                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "cpc",
                      "alias": "CPC",
                      "report_alias": "CPC",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566a",
                      "isWeightedAVG": true,
                      "isRateField": true,
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "impressions",
                          "alias": "Impressions",
                          "report_alias": "Impressions",
                          "selected": false,
                          "partnerType": [
                            "dspd"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05673",
                          "agg_func": "sum",
                          "type": "Number"
                        },
                        {
                          "f7_name": "ctrt_iord_publisher_name",
                          "alias": "Contract Publisher Name",
                          "report_alias": "Contract Publisher Name",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "isStaticField": false,
                          "mappedField": true,
                          "_id": "58ece1f00aaf3c05c8b05651"
                        },
                        {
                          "f7_name": "ctrt_iord_campaign_id",
                          "alias": "Contract Campaign Id",
                          "report_alias": "Contract Campaign Id",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0567e",
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "placement_id",
                          "alias": "Placement ID",
                          "report_alias": "Placement ID",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0567e",
                          "isStaticField": false,
                          "mappedField": true
                        }
                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctr",
                      "alias": "CTR",
                      "report_alias": "CTR",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566a",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "cpa",
                      "alias": "CPA",
                      "report_alias": "CPA",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566a",
                      "isWeightedAVG": true,
                      "isRateField": true,
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "impressions",
                          "alias": "Impressions",
                          "report_alias": "Impressions",
                          "selected": false,
                          "partnerType": [
                            "dspd"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05673",
                          "agg_func": "sum",
                          "type": "Number"
                        },
                        {
                          "f7_name": "ctrt_iord_publisher_name",
                          "alias": "Contract Publisher Name",
                          "report_alias": "Contract Publisher Name",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "isStaticField": false,
                          "mappedField": true,
                          "_id": "58ece1f00aaf3c05c8b05651"
                        },
                        {
                          "f7_name": "ctrt_iord_campaign_id",
                          "alias": "Contract Campaign Id",
                          "report_alias": "Contract Campaign Id",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0567e",
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "placement_id",
                          "alias": "Placement ID",
                          "report_alias": "Placement ID",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0567e",
                          "isStaticField": false,
                          "mappedField": true
                        }
                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "cpv",
                      "alias": "CPV",
                      "report_alias": "CPV",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566a",
                      "isWeightedAVG": true,
                      "isRateField": true,
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "impressions",
                          "alias": "Impressions",
                          "report_alias": "Impressions",
                          "selected": false,
                          "partnerType": [
                            "dspd"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05673",
                          "agg_func": "sum",
                          "type": "Number"
                        },
                        {
                          "f7_name": "ctrt_iord_publisher_name",
                          "alias": "Contract Publisher Name",
                          "report_alias": "Contract Publisher Name",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "isStaticField": false,
                          "mappedField": true,
                          "_id": "58ece1f00aaf3c05c8b05651"
                        },
                        {
                          "f7_name": "ctrt_iord_campaign_id",
                          "alias": "Contract Campaign Id",
                          "report_alias": "Contract Campaign Id",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0567e",
                          "isStaticField": false,
                          "mappedField": true
                        },
                        {
                          "f7_name": "placement_id",
                          "alias": "Placement ID",
                          "report_alias": "Placement ID",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0567e",
                          "isStaticField": false,
                          "mappedField": true
                        }
                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_quantity",
                      "alias": "Contract Quantity",
                      "report_alias": "Contract Quantity",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_actual_units",
                      "alias": "Contract Actual Units",
                      "report_alias": "Contract Actual Units",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_budget",
                      "alias": "Contract Budget",
                      "report_alias": "Contract Budget",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_net_media_budget",
                      "alias": "Contract Net Media Budget",
                      "report_alias": "Contract Net Media Budget",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_nielsen_county_size",
                      "alias": "Contract Nielsen County Size",
                      "report_alias": "Contract Nielsen County Size",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "pick_first",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_target_no_of_zip_codes",
                      "alias": "Contract Number of Zip Codes Targeted",
                      "report_alias": "Contract Number of Zip Codes Targeted",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "pick_first",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_target_radius",
                      "alias": "Contract Targeting Radius",
                      "report_alias": "Contract Targeting Radius",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "pick_first",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_target_population",
                      "alias": "Contract Digital Media Radius Population",
                      "report_alias": "Contract Digital Media Radius Population",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "pick_first",
                      "isDerivedField": false,
                      "agg_func": "pick_first",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_ad_serving_rate",
                      "alias": "Contract Ad Serving Rate",
                      "report_alias": "Contract Ad Serving Rate",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_ad_serving_cost",
                      "alias": "Contract Ad Serving Cost",
                      "report_alias": "Contract Ad Serving Cost",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_cpm",
                      "alias": "Contract CPM",
                      "report_alias": "Contract CPM",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_cpc",
                      "alias": "Contract CPC",
                      "report_alias": "Contract CPC",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_vendor_floor_cpm",
                      "alias": "Contract Vendor Floor CPM",
                      "report_alias": "Contract Vendor Floor CPM",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_vendor_floor_impressions",
                      "alias": "Contract Vendor Impressions ",
                      "report_alias": "Contract Vendor Impressions ",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_vendor_floor_cpc",
                      "alias": "Contract Vendor Floor CPC",
                      "report_alias": "Contract Vendor Floor CPC",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_vendor_floor_clicks",
                      "alias": "Contract Vendor Clicks ",
                      "report_alias": "Contract Vendor Clicks ",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_brand_safety_cost",
                      "alias": "Contract Brand Safety Cost",
                      "report_alias": "Contract Brand Safety Cost",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "ctrt_iord_brand_safety_rate",
                      "alias": "Contract Brand Safety Rate",
                      "report_alias": "Contract Brand Safety Rate",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566e",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf358c",
                      "partnerType": [
                        "prov"
                      ],
                      "selected": false,
                      "report_alias": "Spend Delta",
                      "alias": "Spend Delta",
                      "f7_name": "Spend_Delta",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_budget",
                          "alias": "Contract Budget",
                          "report_alias": "Contract Budget",
                          "selected": false,
                          "partnerType": [
                            "prov",
                            "tpas"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05664",
                          "agg_func": "pick_first",
                          "type": "Number"
                        },
                        {
                          "f7_name": "fs_total_cost",
                          "alias": "F7 Calculated Total Cost",
                          "report_alias": "F7 Calculated Total Cost",
                          "selected": false,
                          "partnerType": [
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b0566f",
                          "agg_func": "sum",
                          "type": "Number"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf358b",
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "No of days in campaign",
                      "alias": "No of days in campaign",
                      "f7_name": "No of days in campaign",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf358a",
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "No of days CTD",
                      "alias": "No of days CTD",
                      "f7_name": "No of days CTD ",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf3589",
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "No of days in month",
                      "alias": "No of days in month",
                      "f7_name": "No of days in month",
                      "isCustomFunction": true,
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf3588",
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "No of days MTD",
                      "alias": "No of days MTD",
                      "f7_name": "No of days MTD ",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf3587",
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "No of days remaining in month",
                      "alias": "No of days remaining in month",
                      "f7_name": "No of days remaining in month",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf3586",
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "No of days remaining in campaign",
                      "alias": "No of days remaining in campaign",
                      "f7_name": "No of days remaining in campaign",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "_id": "5ac209590313876abbaf3585",
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "No of days remaining in campaign after end of month",
                      "alias": "No of days remaining in campaign after end of month",
                      "f7_name": "No of days remaining in campaign after end of month",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "_id": "58ece1f00aaf3c05c8b05651",
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_total_media_cost",
                      "alias": "F7 Calculated Total Media Cost",
                      "report_alias": "F7 Calculated Total Media Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566f",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_platform_cost",
                      "alias": "F7 Calculated Platform Cost",
                      "report_alias": "F7 Calculated Platform Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566f",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_ad_serving_cost",
                      "alias": "F7 Calculated Ad Serving Cost",
                      "report_alias": "F7 Calculated Ad Serving Cost",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566f",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_total_cost",
                      "alias": "F7 Calculated Total Cost",
                      "report_alias": "F7 Calculated Total Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566f",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_other_cost",
                      "alias": "F7 Calculated Other Cost",
                      "report_alias": "F7 Calculated Other Cost",
                      "selected": false,
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b0566f",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_ecpm",
                      "alias": "F7 Calculated ECPM",
                      "report_alias": "F7 Calculated ECPM",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_agency_fee",
                      "alias": "F7 Calculated Agency Fee",
                      "report_alias": "F7 Calculated Agency Fee",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_revenue",
                      "alias": "F7 Calculated Revenue",
                      "report_alias": "F7 Calculated Revenue",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_profit",
                      "alias": "F7 Calculated Profit",
                      "report_alias": "F7 Calculated Profit",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_profit_margin",
                      "alias": "F7 Calculated Profit Margin",
                      "report_alias": "F7 Calculated Profit Margin",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_roi",
                      "alias": "F7 Calculated ROI",
                      "report_alias": "F7 Calculated ROI",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_cpm",
                      "alias": "F7 Calculated CPM",
                      "report_alias": "F7 Calculated CPM",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_cpc",
                      "alias": "F7 Calculated CPC",
                      "report_alias": "F7 Calculated CPC",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_cpa",
                      "alias": "F7 Calculated CPA",
                      "report_alias": "F7 Calculated CPA",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_cpcv",
                      "alias": "F7 Calculated CPCV",
                      "report_alias": "F7 Calculated CPCV",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_cpe",
                      "alias": "F7 Calculated CPE",
                      "report_alias": "F7 Calculated CPE",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_ctr",
                      "alias": "F7 Calculated CTR",
                      "report_alias": "F7 Calculated CTR",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_conversion_rate",
                      "alias": "F7 Calculated Conversion Rate",
                      "report_alias": "F7 Calculated Conversion Rate",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_engagement_rate",
                      "alias": "F7 Calculated Engagement Rate",
                      "report_alias": "F7 Calculated Engagement Rate",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_viewability_rate",
                      "alias": "F7 Calculated Viewability Rate",
                      "report_alias": "F7 Calculated Viewability Rate",
                      "selected": false,
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "sum",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_veri_brand_safety_rate",
                      "alias": "F7 Calculated Verification Brand Safety Rate",
                      "report_alias": "F7 Calculated Verification Brand Safety Rate",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "average",
                      "type": "Number"
                    },
                    {
                      "f7_name": "fs_veri_brand_safety_cost",
                      "alias": "F7 Calculated Verification Brand Safety Cost",
                      "report_alias": "F7 Calculated Verification Brand Safety Cost",
                      "selected": false,
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05669",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [

                      ],
                      "derivedField_func": "average",
                      "isDerivedField": false,
                      "agg_func": "sum",
                      "type": "Number"
                    },
                    {
                      "partnerType": [
                        "prov",
                        "tpas"
                      ],
                      "selected": false,
                      "report_alias": "daysBetween",
                      "alias": "daysBetween",
                      "f7_name": "daysBetween",
                      "nestedDerivedFields": [

                      ],
                      "derivedField_func_param": [
                        {
                          "f7_name": "date",
                          "report_alias": "Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_start_date",
                          "report_alias": "Contract Start Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        },
                        {
                          "f7_name": "ctrt_iord_end_date",
                          "report_alias": "Contract End Date",
                          "selected": false,
                          "partnerType": [
                            "tpas",
                            "prov"
                          ],
                          "agg_func": "pick_first",
                          "type": "Date"
                        }
                      ],
                      "derivedField_func": "subtract",
                      "isDerivedField": true,
                      "agg_func": "sum",
                      "type": "Number"
                    }
                  ]
                }
              ]
            }
          ],
          "staticDimensions": [

          ],
          "dimensions": [
            {
              "_id": "58ece1f00aaf3c05c8b05611",
              "fieldSets": [
                {
                  "_id": "58ece1f00aaf3c05c8b05612",
                  "fields": [
                    {
                      "_id": "5ac209590313876abbaf358f",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "report_alias": "A2_Custom_Dimension",
                      "f7_name": "Custom",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": true
                    },
                    {
                      "_id": "5ac209590313876abbaf358e",
                      "f7_name": "A1_All",
                      "report_alias": "A1_All",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "client_code",
                      "report_alias": "Client Code",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "client_name",
                      "report_alias": "Client Name",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "partner_type",
                      "report_alias": "Partner Type",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "partner_code",
                      "report_alias": "Partner Code",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "partner_name",
                      "report_alias": "Partner Name",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "country_code",
                      "report_alias": "Country Code",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "advertiser_id",
                      "report_alias": "Advertiser ID",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "advertiser_name",
                      "report_alias": "Advertiser Name",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "campaign_id",
                      "report_alias": "Campaign ID",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "campaign_name",
                      "report_alias": "Campaign Name",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "placement_id",
                      "report_alias": "Placement ID",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "placement_name",
                      "report_alias": "Placement Name",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "creative_id",
                      "report_alias": "Creative ID",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "creative_name",
                      "report_alias": "Creative Name",
                      "partnerType": [
                        "tpas",
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "creative_size",
                      "report_alias": "Creative Size",
                      "partnerType": [
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "media_property",
                      "report_alias": "Media Property",
                      "partnerType": [
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "currency_code",
                      "report_alias": "Currency Code",
                      "partnerType": [
                        "prov"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "site_id",
                      "report_alias": "Site ID",
                      "partnerType": [
                        "tpas"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "site_name",
                      "report_alias": "Site Name",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "campaign_type",
                      "report_alias": "Campaign Type",
                      "partnerType": [
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_publisher_name",
                      "report_alias": "Contract Publisher Name",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_advertiser_name",
                      "report_alias": "Contract Advertiser name",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_estimate_code",
                      "report_alias": "Contract Estimate Code",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_estimate_description",
                      "report_alias": "Contract Estimate Description",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_campaign_id",
                      "report_alias": "Contract Campaign Id",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_campaign_name",
                      "report_alias": "Contract Campaign Name",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_start_date",
                      "report_alias": "Contract Start Date",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_end_date",
                      "report_alias": "Contract End Date",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_ad_unit",
                      "report_alias": "Contract Ad Unit",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_rate_type",
                      "report_alias": "Contract Rate Type",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_creative_size",
                      "report_alias": "Contract Creative Size",
                      "partnerType": [
                        "tpas",
                        "prov",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_budget_type",
                      "report_alias": "Contract Budget Type",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_package_id",
                      "report_alias": "Contract Package Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_tpas_advertiser_id",
                      "report_alias": "Contract TPAS Advertiser Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_tpas_advertiser_name",
                      "report_alias": "Contract TPAS Advertiser Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_tpas_campaign_id",
                      "report_alias": "Contract TPAS Campaign Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_tpas_campaign_name",
                      "report_alias": "Contract TPAS Campaign Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_tpas_placement_id",
                      "report_alias": "Contract TPAS Placement Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_tpas_placement_name",
                      "report_alias": "Contract TPAS Placement Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_prov_advertiser_id",
                      "report_alias": "Contract PROV Advertiser Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_prov_advertiser_name",
                      "report_alias": "Contract PROV Advertiser Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_prov_campaign_id",
                      "report_alias": "Contract PROV Campaign Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_prov_campaign_name",
                      "report_alias": "Contract PROV Campaign Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_placement_id",
                      "report_alias": "Contract Placement Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_placement_name",
                      "report_alias": "Contract Placement Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_prov_placement_id",
                      "report_alias": "Contract PROV Placement Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_prov_placement_name",
                      "report_alias": "Contract PROV Placement Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_prov_partner_code",
                      "report_alias": "Contract PROV Partner Code",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_contract_source",
                      "report_alias": "Contract Source",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_account_id",
                      "report_alias": "Contract Account Id",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_agent_type",
                      "report_alias": "Contract Type",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_agent_first_name",
                      "report_alias": "Contract Agent First Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_agent_last_name",
                      "report_alias": "Contract Agent Last Name",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_month_count_check",
                      "report_alias": "Contract Month Count Check",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_termination_date",
                      "report_alias": "Contract Termination Date",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_product_name",
                      "report_alias": "Contract Selected Product",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_agent_tactic",
                      "report_alias": "Contract Agent Tactic",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_reporting_tactic",
                      "report_alias": "Contract Reporting Tactic ",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_creative",
                      "report_alias": "Contract Creative",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_auto_restricted",
                      "report_alias": "Contract Auto Restricted",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_homeowners_restricted",
                      "report_alias": "Contract Homeowners Restricted",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_renters_restricted",
                      "report_alias": "Contract Renters Restricted",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_agent_run_renters",
                      "report_alias": "Contract Agent Run Renters",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_language",
                      "report_alias": "Contract Language",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_regional_billing_code",
                      "report_alias": "Contract Regional Billing Code",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_st_code",
                      "report_alias": "Contract ST Code",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_market_area",
                      "report_alias": "Contract Market Area",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_market_city",
                      "report_alias": "Contract Market City",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_market_county",
                      "report_alias": "Contract Market County",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_market_state",
                      "report_alias": "Contract Market State",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_target_demographics",
                      "report_alias": "Contract Target Demo",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_target_zip_codes",
                      "report_alias": "Contract Targeting Zip Codes",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_tier",
                      "report_alias": "Contract Tier",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_general_market_url",
                      "report_alias": "Contract General Market URL",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_general_market_url_type",
                      "report_alias": "Contract General Market URL Type",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_renters_url",
                      "report_alias": "Contract Renters URL",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_renters_url_type",
                      "report_alias": "Contract Renters URL Type",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_brand_safety_source",
                      "report_alias": "Contract Brand Safety Source",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "ctrt_iord_deactivation_date",
                      "report_alias": "Deactivation Date",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05651",
                      "mappedField": true,
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "date",
                      "report_alias": "Date",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05618",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    },
                    {
                      "f7_name": "month_of_date",
                      "report_alias": "Month",
                      "partnerType": [
                        "prov",
                        "tpas",
                        "veri"
                      ],
                      "_id": "58ece1f00aaf3c05c8b05617",
                      "isCustomAlias": false,
                      "isCustomField": false,
                      "isStaticField": false
                    }
                  ]
                }
              ]
            }
          ],
          "filters": [

          ],
          "graph": [

          ],
          "concepts": [

          ]
        },
        "mappingOptions": [
          {
            "label": "Mapped",
            "value": "Mapped"
          },
          {
            "label": "Unmapped",
            "value": "Unmapped"
          }
        ],
        "__v": 0,
        "mappingStatusEnabled": true,
        "excludePartnerType": false,
        "alertEnabled": true
      }
    ],
    "total": 1,
    "limit": 10,
    "page": 1,
    "pages": 1
  };

  existingReport: any = {
    data: {
    "favourite": false,
    "showAlertNotify": false,
    "type": "billing",
    "reportResult": [

    ],
    "excludePartnerType": false,
    "mappingStatusEnabled": true,
    "summaryEnabled": false,
    "_id": "5c14f5f1b4f40421045d4595",
    "createdAt": "2018-04-10T05:38:45.552Z",
    "updatedAt": "2019-01-28T10:21:19.105Z",
    "name": "NEWRETEST_2573_Custom_monthly_threshold",
    "id": "RPT2",
    "context": {
      "name": "btil_adhoc",
      "version": {
        "major": 1,
        "minor": 0
      },
      "client": {
        "code": "btil",
        "name": "btil"
      },
      "partner": {
        "code": "btil",
        "type": [
          "PROV"
        ]
      }
    },
    "report": {
      "staticDimensions": [

      ],
      "alert": [
        {
          "alertType": "Threshold",
          "alertMetric": "impressions",
          "alertopr": ">=",
          "alertThreshold1": "100000",
          "alertThreshold2": "",
          "enabled": true,
          "version": 5,
          "report_alias": "Impressions"
        }
      ],
      "_id": "58ece1f00aaf3c05c8b05607",
      "concepts": [

      ],
      "graph": [

      ],
      "filters": [
        {
          "value": [
            "State Farm Mutual Automobile Insurance"
          ],
          "_id": "5c483fc2ebb68f09aca87e03",
          "f7_name": "ctrt_iord_advertiser_name",
          "reportAlias": "Contract Advertiser name"
        }
      ],
      "dimensions": [
        {
          "fieldSets": [
            {
              "fields": [
                {
                  "isStaticField": false,
                  "isCustomField": false,
                  "isCustomAlias": false,
                  "_id": "58ece1f00aaf3c05c8b05651",
                  "partnerType": [
                    "tpas",
                    "prov"
                  ],
                  "report_alias": "Advertiser ID",
                  "f7_name": "advertiser_id"
                }
              ],
              "_id": "58ece1f00aaf3c05c8b05612"
            }
          ],
          "_id": "58ece1f00aaf3c05c8b05611"
        }
      ],
      "metrics": [
        {
          "fieldSets": [
            {
              "fields": [
                {
                  "type": "Number",
                  "agg_func": "sum",
                  "isDerivedField": false,
                  "derivedField_func": "sum",
                  "derivedField_func_param": [

                  ],
                  "nestedDerivedFields": [

                  ],
                  "_id": "58ece1f00aaf3c05c8b05673",
                  "partnerType": [
                    "prov",
                    "tpas",
                    "veri"
                  ],
                  "selected": false,
                  "report_alias": "Impressions",
                  "alias": "Impressions",
                  "f7_name": "impressions"
                }
              ],
              "_id": "58ece1f00aaf3c05c8b05653"
            }
          ],
          "_id": "58ece1f00aaf3c05c8b05652"
        }
      ],
      "filterList": [
        {
          "fieldSets": [
            {
              "fields": [
                {
                  "isStaticField": false,
                  "isCustomField": false,
                  "isCustomAlias": false,
                  "_id": "58ece1f00aaf3c05c8b05680",
                  "parent": "",
                  "partnerType": [
                    "prov",
                    "tpas"
                  ],
                  "selected": false,
                  "report_alias": "Contract Advertiser name",
                  "alias": "Contract Advertiser name",
                  "f7_name": "ctrt_iord_advertiser_name"
                }
              ],
              "_id": "58ece1f00aaf3c05c8b05675"
            }
          ],
          "_id": "58ece1f00aaf3c05c8b05674"
        }
      ],
      "uiElements": [

      ],
      "period": {
        "_id": "58ece1f00aaf3c05c8b0568b",
        "duration": [
          {
            "_id": "58ece1f00aaf3c05c8b0568c",
            "end": "2018-12-15T00:00:00.000Z",
            "start": "2018-08-01T00:00:00.000Z",
            "value": 120,
            "option": "Custom Period"
          }
        ],
        "aggregation": [
          {
            "_id": "58ece1f00aaf3c05c8b05692",
            "option": "Monthly"
          }
        ]
      },
      "delivery": {
        "ftp": {
          "mode": "passive",
          "port": 0,
          "directory": "",
          "password": "",
          "user": "",
          "host": "",
          "enabled": false
        },
        "s3": {
          "accessKeyId": "",
          "secretAccessKey": "",
          "bucket": "",
          "enabled": false
        },
        "emailEnabled": true,
        "ftpEnabled": false,
        "s3Enabled": false,
        "_id": "58ece1f00aaf3c05c8b05683",
        "frequency": [
          {
            "values": [

            ],
            "_id": "58ece1f00aaf3c05c8b05687",
            "option": "Daily"
          }
        ],
        "extension": [
          {
            "_id": "58ece1f00aaf3c05c8b05689",
            "isDefault": true,
            "option": "csv"
          }
        ],
        "type": "csv",
        "filename": "NEWRETEST_2573_Custom_monthly_threshold",
        "email": "nancy.navis@aspiresys.com",
        "runTime": "02:00",
        "schedule": {
          "runOnce": false,
          "_id": "58ece1f00aaf3c05c8b0568a",
          "start_date": "2018-12-15T00:00:00.000Z",
          "end_date": "2018-12-15T00:00:00.000Z"
        },
        "public": false,
        "active": true,
        "lastRunTime": "2019-01-28T10:21:19.100Z",
        "lastRunResultId": "5c4ed67f49f568300c58b3c3",
        "lastRunStatus": "OK"
      }
    },
    "__v": 0,
    "mappingOptions": [
      {
        "value": "Mapped",
        "label": "Mapped"
      },
      {
        "value": "Unmapped",
        "label": "Unmapped"
      }
    ],
    "alertEnabled": true,
    "mappingStatus": "Mapped",
    "createdBy": "Nancy Navis",
    "updatedBy": "DEV_BTIL"
  }
};

  public getReportTemplate(context: any) {
    // Enable for API gateway
    // const clientCode = context.client.code;
    // console.log(clientCode);
    // const url = this.base.REPORT_TEMPLATES + "?clientCode="  + clientCode;;

    const url = this.base.REPORT_TEMPLATES;
    return this.service.Call('get', url);
  }

  public getReportById(context: any, id: any) {
    const url = this.base.REPORTS + '/' + id ;
    return this.service.Call('get', url);
    //return Observable.of(new HttpResponse({status: 200, body: this.existingReport}));
  }

  public createOrUpdateReport(context: any, reportPayload: any, saveType:  any, reportId: any) {
    const type = saveType === 'saveRun' ? '?action=run' : '';
    console.log(reportId);
    if (reportId) {
      console.log('Updating existing report: ' + reportId);
      const url = this.base.REPORTS + '/' + reportId + type;
      return this.service.Call('put', url, reportPayload);
    } else {
      console.log('Creating new report: ');
      const url = this.base.REPORTS + type;
      return this.service.Call('post', url, reportPayload);
    }
  }

  public searchContractByPartnerType(context: any, query) {
    const clientCode = context.client.code;
    const body = [{"type":"iord","parent":[],"field": "publisher_name" }]; // TODO - refactor this
    // const url =  "http://localhost:3214/api/v3/contracts/lookupByPartner" + "?clientCode=" + clientCode;
    const url =  this.base.V3_CONTRACTS_SERVICE + '/lookupByPartner' + "?clientCode="  + clientCode;
    return this.service.Call('post', url, body);
  }

  public reportSummary(context: any) {
    const clientCode = context.client.code;
    const url = this.base.REPORTS+'/results/lastrunstwo?page=1&limit=100&clientCode=btil';
    // const url = this.base.REPORTS+'/results/lastrunsTwo/?page=1&limit=100&clientCode=' + clientCode;
    return this.http
          .get(url)
          .map(res => {
            return res.json();
          }).share();
  }

  public reportRunOrDownload(context: any, reportId: any, type:  any) {
    const url = this.base.REPORTS + '/' + reportId + '/' + type;
    const typeCall = type === 'download' ? 'post' : 'get';
    return this.service.Call(typeCall, url);
  }

  public reportDownload(context: any, reportId: any, type:  any) {
    const url = this.base.REPORTS + '/' + reportId + '/' + type;
    const typeCall = type === 'download' ? 'postnojson' : 'get';
    return this.service.Call(typeCall, url);
  }

  public reportDelete(context: any, reportId: any, type:  any) {
    const url = this.base.REPORTS + '/' + reportId ;
    // const typeCall = type === 'download' ? 'post' : 'get';
    return this.service.Call(type, url);
  }

}
