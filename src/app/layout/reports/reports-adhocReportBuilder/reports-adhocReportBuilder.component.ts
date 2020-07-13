import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormBuilder, FormGroup, Validators, NgForm} from '@angular/forms';
import {ToastsManager} from 'ng2-toastr';
import {AuthService, OrganizationService} from '../../../../services';
import {MESSAGE} from '../../../../constants/message';
import {TheReportsService} from '../reportsLocal.service';
import {IMyDpOptions} from 'mydatepicker';
import {DataTableOptions} from '../../../../models/dataTableOptions';
import {PopUpModalComponent} from '../../../shared/components/pop-up-modal/pop-up-modal.component';
import {TagSettings} from '../../../shared/components/app-tag/tag.settings';
import * as common from '../../../../constants/common';
import * as reportsFilterConfig from '../reportsFilterConfig.json';
import {PopupDataAction} from '../../../shared/components/app-popup-button/popup-data-action';
import {ReportsUtil} from '../../../shared/util/reports-util';
import * as _ from 'lodash';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../../services/okta.service';
// import * as Validate from './validator';

const dateObj = new Date();
dateObj.setDate(dateObj.getDate() - 2);
const months = dateObj.getUTCMonth() + 1; // to get months from 1-12
const days = dateObj.getUTCDate();
const years = dateObj.getUTCFullYear();


@Component({
  selector: 'app-adhoc-report-builder',
  templateUrl: './reports-adhocReportBuilder.component.html',
  styleUrls: ['./reports-adhocReportBuilder.component.scss']
})
export class AdhocReportBuilderComponent implements OnInit, PopupDataAction {

  clientCode: string;
  clientName: string;
  localData: any;
  reportId: any;
  adhocReportBuilderForm: FormGroup;
  context: any;
  reportDeleteAction: any = 'no';

  periodDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'value',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };
  showSpinner: boolean;
  noOfDays: any = false;
  periodStartEnd: any = false;

  aggregationDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'option',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  fileTypeDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'option',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  frequencyDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'option',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  emailDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'option',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  dayOfMonthDropDownSettings = {
    singleSelection: true,
    text: 'Day Of Month',
    primaryKey: 'option',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  monthOfQuarterDropDownSettings = {
    singleSelection: true,
    text: 'Month of Quarter',
    primaryKey: 'option',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  runTimeDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'option',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  partnerTypeDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'value',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  transactionStatusDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'value',
    labelKey: 'label',
    searchBy: ['label'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  filtersDropDownSettings = {
    singleSelection: false,
    text: 'Select',
    primaryKey: 'f7_name',
    labelKey: 'report_alias',
    searchBy: ['report_alias'],
    enableCheckAll: true,
    enableSearchFilter: true,
    showTooltip: true,
    tooltipElementsSize: 5,
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  loading = false;
  appSpinner: any = true;

  periodList = [];
  aggregationList = [];
  fileTypeList = [];
  frequencyList = [];
  emailList = [];
  selectedEmail = [];
  dayOfMonthList = [{option: '1'}, {option: '2'}, {option: '3'}, {option: '4'}, {option: '5'},
    {option: '6'}, {option: '7'}, {option: '8'}, {option: '9'}, {option: '10'},
    {option: '11'}, {option: '12'}, {option: '13'}, {option: '14'}, {option: '15'},
    {option: '16'}, {option: '17'}, {option: '18'}, {option: '19'}, {option: '20'},
    {option: '21'}, {option: '22'}, {option: '23'}, {option: '24'}, {option: '25'},
    {option: '26'}, {option: '27'}, {option: '28'}, {option: '29'}, {option: '30'},{option: '31'}];
  monthOfQuarterList = [{option: '1'}, {option: '2'}, {option: '3'}];
  runTimeList = [{option: '00:00'}, {option: '01:00'}, {option: '02:00'}, {option: '03:00'}, {option: '04:00'},
    {option: '05:00'}, {option: '06:00'},{option: '07:00'}, {option: '08:00'}, {option: '09:00'}, {option: '10:00'},
    {option: '11:00'}, {option: '12:00'}, {option: '13:00'}, {option: '14:00'}, {option: '15:00'}, {option: '16:00'},
    {option: '17:00'}, {option: '18:00'}, {option: '19:00'}, {option: '20:00'}, {option: '21:00'}, {option: '22:00'}, {option: '23:00'}];
  partnerTypeList = [];
  transactionStatusList = [];
  filterList = [];

  isFrequencyDaily = false;
  isFrequencyMonthly = false;
  isFrequencyWeekly = false;
  isFrequencyQuarterly = false;

  selectedPeriod = [];
  selectedAggregation = [];
  selectedFileType = [];
  selectedFrequency = [];
  selectedDayOfMonthList = [];
  selectedMonthOfQuarterList = [];
  selectedRunTime = [];
  selectedPartnerType = [];
  selectedTransactionStatus = [];
  selectedFilter = [];
  selectedPopupModalData = [];
  selectedDimensions = [];
  selectedMetrics = [];

  dataModel: any = {};
  reportTemplate: any = {};

  monthDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  monthQuarter = [1, 2, 3];
  timeZone = [
    {
      'key': 'est',
      'displayText': 'EST'
    },
    {
      'key': 'cst',
      'displayText': 'CST'
    },
    {
      'key': 'mst',
      'displayText': 'MST'
    },
    {
      'key': 'pst',
      'displayText': 'PST'
    },
    {
      'key': 'akst',
      'displayText': 'AKST'
    },
    {
      'key': 'hast',
      'displayText': 'HAST'
    },
    {
      'key': 'edt',
      'displayText': 'EDT'
    },
    {
      'key': 'cdt',
      'displayText': 'CDT'
    },
    {
      'key': 'mdt',
      'displayText': 'MDT'
    },
    {
      'key': 'pdt',
      'displayText': 'PDT'
    },
    {
      'key': 'akdt',
      'displayText': 'AKDT'
    },
    {
      'key': 'hadt',
      'displayText': 'HADT'
    },
    {
      'key': 'gmt',
      'displayText': 'GMT'
    }
  ];
  showDaySelector = false;
  showMonthOfQuarter = false;
  showDayOfMonth = false;
  showDaySelectorError = false;
  isForbidden:boolean = false;
  public myDatePeriodPickerOptions: IMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    showTodayBtn: false,
    showClearDateBtn: false,
    disableUntil: {year: 0, month: 0, day: 0}
  };

  public myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    showTodayBtn: false,
    showClearDateBtn: false,
    disableUntil: {year: years, month: months, day: days}
  };

  headers: any = [
    {
      key: 'contractPublisherName',
      title: 'Contract Publisher name',
      data: 'contractPublisherName',
      isFilterRequired: true,
      editButton: false,
      width: 'auto',
    },
  ];
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: false,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isRowSelection: {
      isMultiple : true
    },
    isPageLength: true,
    isPagination: true
  }];

  filterPopupData: any = {
    options: {
      isSearchColumn: true,
      isTableInfo: true,
      isEditOption: false,
      isDeleteOption: false,
      isAddRow: false,
      isColVisibility: false,
    isDownloadAsCsv: true,
      isDownloadOption: false,
      isRowSelection: {
        isMultiple : true
      },
      isPageLength: true,
      isPagination: true
    },
    headers: [
      // {
      //   'key': '_id',
      //   'title': '',
      //   'data': 'id',
      //   'isFilterRequired': false,
      //   'isCheckbox': true,
      //   'class': 'nocolvis'
      // },
      {
        'key': 'label',
        'title': '',
        'data': 'label',
        'isFilterRequired': true,
        'editButton': false
      }
    ],
    data: []
  };
  filterPopupConfig: any;
  filterTagsList = [];
  filterTagSettings: TagSettings = {
    identifyBy: 'id',
    displayBy: 'label',
    isEditable: true,
    isDraggable: true,
    hideInputBox: true
  };

  dimensionsPopupData: any = {
    options: {
      isSearchColumn: true,
      isTableInfo: true,
      isEditOption: false,
      isDeleteOption: false,
      isAddRow: false,
      isColVisibility: false,
      isDownloadAsCsv: true,
      isDownloadOption: false,
      isRowSelection: {
        isMultiple : true
      },
      isPageLength: true,
      isPagination: true
    },
    headers: [
      // {
      //   'key': '_id',
      //   'title': '',
      //   'data': 'id',
      //   'isFilterRequired': false,
      //   'isCheckbox': true,
      //   'class': 'nocolvis'
      // },
      {
        'key': 'label',
        'title': 'Dimensions',
        'data': 'label',
        'isFilterRequired': true,
        'editButton': false
      }
    ],
    data: []
  };
  dimensionList = [];
  dimensionPopupConfig: any;
  dimensionTagsList = [];
  dimensionTagSettings: TagSettings = {
    identifyBy: 'id',
    displayBy: 'label',
    isEditable: true,
    isDraggable: true,
    hideInputBox: true
  };

  metricsPopupData: any = {
    options: {
      isSearchColumn: true,
      isTableInfo: true,
      isEditOption: false,
      isDeleteOption: false,
      isAddRow: false,
      isColVisibility: false,
      isDownloadAsCsv: true,
      isDownloadOption: false,
      isRowSelection: {
        isMultiple : true
      },
      isPageLength: true,
      isPagination: true
    },
    headers: [
      // {
      //   'key': '_id',
      //   'title': '',
      //   'data': 'id',
      //   'isFilterRequired': false,
      //   'isCheckbox': true,
      //   'class': 'nocolvis'
      // },
      {
        'key': 'label',
        'title': 'Metrics',
        'data': 'label',
        'isFilterRequired': true,
        'editButton': false
      }
    ],
    data: []
  };
  metricsList = [];
  metricsPopupConfig: any;
  metricsTagsList = [];
  metricsTagSettings: TagSettings = {
    identifyBy: 'id',
    displayBy: 'label',
    isEditable: true,
    isDraggable: true,
    hideInputBox: true
  };

  isAlertRequired = false;
  generateReport = false;
  alertTypeList = [{
    "label" : "Threshold",
    "value" : "Threshold"
  },
  {
    "label" : "Moving Average",
    "value" : "Moving Average"
  }];
  alertMetricList = [];
  alertThresholdList = [{
    "label" : ">",
    "value" : ">"
    },
    {
    "label" : ">=",
    "value" : ">="
    },
    {
    "label" : "<",
    "value" : "<"
    },
    {
    "label" : "<=",
    "value" : "<="
    },
    {
    "label" : "Between",
    "value" : "Between"
    }];

  movingThresholdList = [
    {
      "label" : "> 2*standard deviation",
      "value" : "> 2*standard deviation"
    },
    {
      "label" : ">= 2*standard deviation",
      "value" : ">= 2*standard deviation"
    },
    {
      "label" : "<- 2*standard deviation",
      "value" : "<- 2*standard deviation"
    },
    {
      "label" : "<=- 2*standard deviation",
      "value" : "<=- 2*standard deviation"
    }
  ];
  alertThresholdData = this.alertThresholdList;

  selectedAlertType = [];
  selectedMovingAvgPeriodType = [];
  selectedAlertMetric = [];
  selectedAlertThreshold = [];
  movingAverageEnable = false;
  thresholdValueField = true;
  alertMovingAvgPeriod = [
    {
      "label": "2",
      "value": "2"
    }, {
      "label": "3",
      "value": "3"
    }, {
      "label": "4",
      "value": "4"
    }, {
      "label": "5",
      "value": "5"
    }, {
      "label": "6",
      "value": "6"
    }, {
      "label": "7",
      "value": "7"
    }
  ];
  alertopr  = "";
  alertThreshold1  = "";
  alertThreshold2  = "";

  alertTypeDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'value',
    labelKey: 'label',
    searchBy: ['label'],
  };

  alertMetricDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'id',
    labelKey: 'label',
    searchBy: ['label'],
  };

  alertThresholdDropDownSettings = {
    singleSelection: true,
    text: 'Select',
    primaryKey: 'value',
    labelKey: 'label',
    searchBy: ['label'],
  };
  alertThresholdValue = '';
  alertMovingPeriodThresholdValue = [];

  gridData: any;
  data = [];
  dataObject: any = {};
  isDataAvailable: boolean;
  existingReport: any = {};

  excludePartnerType = false;
  mappingStatusEnabled = false;
  partnerType = '';
  isEditMode = false;
  widget: any;
  api_fs: any;

  @ViewChild('filterModal') public filterModalComponent: PopUpModalComponent;
  // @ViewChild('reportform') reportform: NgForm;
  // form: FormGroup;
  constructor(private organizationService: OrganizationService,
              public reportsService: TheReportsService,
              public toastr: ToastsManager,
              private formBuilder: FormBuilder,
              public router: Router,
              private route: ActivatedRoute,
              private element: ElementRef,
              private reportsUtil: ReportsUtil,
              private authService: AuthService,
              private okta: OktaAuthService,
              private http: Http
              ) {
  }

  ngOnInit() {

    this.showSpinner = false;
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.route.params.subscribe(
      (params: Params) => {
        if (params['id']) {
          this.reportId = params['id'];
        }
      }
    );
    this.isEditMode = (this.reportId) ? true :false;
    console.log('reportId:', this.reportId);
    console.log(this.isEditMode );

    this.localData = this.authService.getIdentityInfo('org-context');
    const org = JSON.parse(this.localData);
    this.clientCode = 'BTIL';
    this.context = {
      client : {
        code: 'BTIL'
      }
    };
    this.dataModel = {
      reportName: '',
      period: '',
      aggregation: '',
      formatAndSchedule: {
        fileName: '',
        fileType: '',
        active: true,
        public: false,
        oneTimeRun: false,
        monthOfQuarter: 0,
        dayOfMonth: 0,
        frequency: '',
        startDate: {
          date: '',
          time: '',
          median: '',
          timeZone: '',
          formatted: ''
        },
        endDate: {
          date: '',
          time: '',
          median: '',
          timeZone: '',
          formatted: ''
        },
        runtTime: '',
        frequency_week_Mon: '',
        frequency_week_Tue: '',
        frequency_week_Wed: '',
        frequency_week_Thu: '',
        frequency_week_Fri: '',
        frequency_week_Sat: '',
        frequency_week_Sun: '',
      },
      hasEmail: false,
      emailDelivery: {
        email: '',
      },
      hasFtp: false,
      ftpDelivery: {
        host: '',
        userId: '',
        directory: '',
        password: '',
        port: '',
      },
      hasS3: false,
      s3Delivery: {
        bucket: '',
        accessKeyId: '',
        secrectAccessKey: '',
      },
      lastRunTime : '',
      lastRunResultId : '',
      lastRunStatus : '',
    };

    const reportsFilterConfigObj = JSON.parse(JSON.stringify(reportsFilterConfig));
    this.dimensionPopupConfig = reportsFilterConfigObj.filterProps.find(e => e.f7Name === 'dimensions');
    this.metricsPopupConfig = reportsFilterConfigObj.filterProps.find(e => e.f7Name === 'metrics');
    this.getEmailRequest();
  }

  getEmailRequest() {
    this.getEmails().subscribe(response => {
      console.log('getEmails >>')
      console.log(response)
      if(response && response.body && response.body.length) {
        response.body.forEach(function (ele) {
          this.emailList.push({option: ele.email, value: ele.id});
        }, this);
      }

      if(this.isEditMode){
        this.fetchReportData();
      } else {
        this.getReportDetails();
      }

    }, err => {
      if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getEmailRequest.bind(self)
            );
      } else if(err.status === 403) {
        this.isForbidden = true;
        this.showSpinner = false;  
      } else {
        this.showSpinner = false;    
      }
    });
  }

  getEmails() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    console.log('token >>')
    console.log(token);
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/reports/adhoc/email';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  getReportDetails() {
    this.showSpinner = true;
    this.getReportTemplateData().subscribe(response => {
      console.log('response template');
      console.log(response);
      if (response && response.body) {
        this.reportTemplate = response.body;

        this.partnerTypeList = this.reportTemplate.context.partner.type.map(function (x) {
          return {option: x === 'dtrx' ? 'Transaction' : x, value: x}
        });

        if (this.reportTemplate.report.period && this.reportTemplate.report.period.duration
            && this.reportTemplate.report.period.duration.length > 0) {
          this.periodList = this.reportTemplate.report.period.duration;
          this.aggregationList = this.reportTemplate.report.period.aggregation;
        }

        this.fileTypeList = this.reportTemplate.report.delivery.extension;
        this.frequencyList = this.reportTemplate.report.delivery.frequency;

        this.transactionStatusList = this.reportTemplate.mappingOptions;

        if (this.reportTemplate.report.filterList && this.reportTemplate.report.filterList.length > 0
            && this.reportTemplate.report.filterList[0].fieldSets && this.reportTemplate.report.filterList[0].fieldSets.length > 0) {
          if (this.reportTemplate.report.filterList[0].fieldSets[0].fields) {
            this.filterList = this.reportTemplate.report.filterList[0].fieldSets[0].fields;
            this.populateFilterConfig();
          }
        }

        if (this.reportTemplate.report.dimensions && this.reportTemplate.report.dimensions.length > 0
            && this.reportTemplate.report.dimensions[0].fieldSets && this.reportTemplate.report.dimensions[0].fieldSets.length > 0) {
          if (this.reportTemplate.report.dimensions[0].fieldSets[0].fields) {
            this.dimensionList = this.reportTemplate.report.dimensions[0].fieldSets[0].fields;

            this.dimensionsPopupData.data
                = this.dimensionList.map(dimension => {
              return {id: dimension.f7_name, label: dimension.report_alias};
            });
          }
        }

        if (this.reportTemplate.report.metrics && this.reportTemplate.report.metrics.length > 0
            && this.reportTemplate.report.metrics[0].fieldSets && this.reportTemplate.report.metrics[0].fieldSets.length > 0) {
          if (this.reportTemplate.report.metrics[0].fieldSets[0].fields) {
            this.metricsList = this.reportTemplate.report.metrics[0].fieldSets[0].fields;

            this.metricsPopupData.data = this.metricsList.map(metric => {
              return {id: metric.f7_name, label: metric.report_alias};
            });
          }
        }
      }
      this.showSpinner = false;
    }, error => {
      const message = JSON.parse(error._body).error.errors[0].message;
      this.showSpinner = false;
    });
  }

  getReportTemplateData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    console.log('token >>')
    console.log(token);
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/reports/adhoc/org/2/template';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  onItemSelect(item: any) {
    console.log(item);
    this.noOfDays = false;
    this.periodStartEnd = false;
    if (item.value === 25) {
      this.noOfDays = true;
    }
    if (item.value === 120) {
      this.periodStartEnd = true;
    }
  }

  OnItemDeSelect(item: any) {
    console.log(item);
  }

  handleOnSelectAll(item: any) {
    console.log(item);
  }

  handleOnDeSelectAll(item: any) {
    console.log(item);
  }

  onFrequencySelect(item: any) {
    console.log(item);
    this.isFrequencyDaily = false;
    this.isFrequencyWeekly = false;
    this.isFrequencyMonthly = false;
    this.isFrequencyQuarterly = false;
    if(item.option && item.option.toLowerCase() === 'daily'){
      this.isFrequencyDaily = true;
    } else if(item.option && item.option.toLowerCase() === 'weekly'){
      this.isFrequencyWeekly = true;
    }else if(item.option && item.option.toLowerCase() === 'monthly'){
      this.isFrequencyMonthly = true;
    }else if(item.option && item.option.toLowerCase() === 'quarterly'){
      this.isFrequencyQuarterly = true;
    }
  }


  onFrequencyDeSelect(item: any) {
    console.log(item);
  }

  onEmailSelect(item: any) {

  }

  onEmailDeSelect(item: any) {

  }

  gridEvent(event) {
    if (event.functionRef === 'selectRow') {
      this.selectedPopupModalData = event.select[0];
    } else if (event.functionRef === 'rowSelected') {

      this.selectedPopupModalData = [];
      if (event.selected) {
        this.selectedPopupModalData.push.apply(this.selectedPopupModalData, event.selected);
      }
    }
  }

  interceptActions(retObject) {
    console.log(retObject);
  }


  handleCloseModal(modalComponent: PopUpModalComponent) {
    modalComponent.hide();

  }

  showFilterModal(popUpModalComponent: PopUpModalComponent) {
    popUpModalComponent.show();
  }

  onFilterSelect(item: any) {
    this.movingAverageEnable = false;
    this.thresholdValueField = true;
    this.alertThresholdData = this.alertThresholdList;
    this.selectedAlertType = [item];
    if (item.value === 'Moving Average') {
      this.movingAverageEnable = true;
      this.thresholdValueField = false;
      this.alertThresholdData = this.movingThresholdList;
    }
  }

  _OnDelete(obj, filterItem) {
    filterItem.selectedItems = [];
    const index = this[obj].indexOf(filterItem);
    this[obj].splice(index, 1);
  }

  onFilterDeSelect(item: any) {
    console.log(item);
  }

  onFilterSelectAll(item: any) {
    console.log(item);
  }

  onFilterDeSelectAll(item: any) {
    console.log(item);
  }

  onFilterSelectMoving(item: any) {
    console.log(item);
    this.alertMovingPeriodThresholdValue = [item];
  }

  onFilterSelectMetric(item: any) {
    console.log(item);
    this.selectedAlertMetric = [item];
  }

  onFilterSelectThreshold(item: any) {
    console.log(item);
    this.selectedAlertThreshold = [item];
  }

  onTagAdd(item: any, filterItem: any) {
    console.log(item);
  }

  onTagRemove(item: any, filterItem: any) {

    console.log('filterItem >>')
      console.log(filterItem);

    filterItem.filterConfig.values = filterItem.filterConfig.values.filter(e => e._id !== item._id);
  }

  onTagRemoveFromList(item: any, prop , popObj) {
    this[prop] = this[prop].filter( e=> e.id !== item.id);
    this[popObj].values = this[popObj].values.filter( e=> e.id !== item.id);

    if (prop === 'metricsTagsList' && this.selectedAlertMetric.length) {
      const findSelectedValue = this[prop].find(x=> x.id === this.selectedAlertMetric[0].id);
      if ( !findSelectedValue) {
          this.selectedAlertMetric = [];
      }
    }
  }

  onTagEdit(item: any, filterItem: any) {
    console.log(item);
  }

  handleAlertRequiredOnChange(value: boolean) {
    this.isAlertRequired = value;
  }

  handleGenerateReportOnChange(value: boolean) {
    this.generateReport = value;
  }

  handleSave() {
    // this.router.navigate([ '/']);
  }

  handleCancel() {
    this.router.navigate(['/app/reports/reportsSummary']);
  }

  updateFilterConfig(event, filterItem) {
    console.log(event);
    if (event && event.values) {
      filterItem['selectedItems'] = event.values;
    }
  }

  updateDimensionsConfig(event) {
    console.log(' event >>>> ');
    console.log(event);
    if (event && event.values) {
      this.dimensionTagsList = event.values;
    }

    console.log('this.dimensionTagsList >>')
    console.log(this.dimensionTagsList);
  }

  updateMetricsConfig(event) {
    console.log('event');
    console.log(event);
    if (event && event.values) {
      this.metricsTagsList = event.values;
      this.alertMetricList = event.values;
      if(this.selectedAlertMetric.length) {
          const findSelectedValue = this.metricsTagsList.find(x => x.id === this.selectedAlertMetric[0].id);
          if (!findSelectedValue) {
              this.selectedAlertMetric = [];
          }
      }
    }
  }

  getDependentConfig(dependsOn: any) {
    return this.filterList.filter(function (x) {
      return dependsOn.indexOf(x.f7_name) !== -1;
    });
  }

  getFilterConfigData(title: any) {
    return {
      options: {
        isSearchColumn: true,
        isTableInfo: true,
        isEditOption: false,
        isDeleteOption: false,
        isAddRow: false,
        isColVisibility: false,
        isDownloadAsCsv: true,
        isDownloadOption: false,
        isRowSelection: {
          isMultiple : true
        },
        isPageLength: true,
        isPagination: true
      },
      headers: [
        {
          'key': 'label',
          'title': title,
          'data': 'label',
          'isFilterRequired': true,
          'editButton': false
        }
      ],
      data: []
    };
  }

  populateFilterConfig() {
    this.filterList.forEach(filterObj => {
      filterObj['filterConfig'] = {
        f7Name: filterObj.f7_name,
        label: filterObj.report_alias,
        values: [],
        isMultiSelect: false,
        dependentOn: filterObj.parent || [],
        includeCustom: true,
        isMultipleCustomType: true,
        isTag: false,
        placeHolderText: 'Name',
        placeHolderValue: 'Text',
        serverSide: 'false',
        type: 'popupButton'
      };
    });
  }

  getData(filterConfig, dependentConfig) {

    console.log('filterConfig >>')
    console.log(filterConfig);

    console.log('dependentConfig >>')
    console.log(dependentConfig);

    const applyFilter = [];
    if(dependentConfig.length) {
      dependentConfig.forEach(function (config) {
        if (config.selectedItems && config.selectedItems.length) {
          const values = [];
          config.selectedItems.forEach(function (val) {
            values.push(val.id);
          });
          applyFilter.push({
            f7Name : config.f7_name,
            values : values
          });
        }
      });
    }

    console.log('applyFilter >>')
    console.log(applyFilter);

    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});

    var dataObj: any = {};
    dataObj.filterField = filterConfig.f7Name;
    if (applyFilter.length) {
      applyFilter.forEach(function (filter) {
        dataObj[filter.f7Name] = filter.values;
      });
    }

    const obj = JSON.stringify(dataObj);

    console.log('obj >>><<')
    console.log(obj);

    return this.http
        .post(this.api_fs.api + '/api/reports/adhoc/filters/search', obj, options )
        .map(res => {
          const result = res.json();

          console.log('result >>')
          console.log(result);

          const ret = [];
          if (result.body && result.body.length) {
            result.body.forEach(function (item) {
              ret.push({id: item.id, label: item.text});
            });
          }
          return ret;
        });
  }

  getSelectedFilterList(filterList: any, existingFilterList: any) {

    const comparer = (otherArray: any[]) => {
      return (current: any) => {
        return otherArray.filter((other: any) => {
          return other.f7_name === current.f7_name;
        }).length !== 0;
      };
    };

    return filterList.filter(comparer(existingFilterList));
  }

  getSelectedDimensionsList() {

    const comparer = (otherArray: any[]) => {
      return (current: any) => {
        return otherArray.filter((other: any) => {
          return other.id === current.f7_name;
        }).length !== 0;
      };
    };

    return this.dimensionList.filter(comparer(this.dimensionTagsList));
  }

  getSelectedMetricsList() {

    const comparer = (otherArray: any[]) => {
      return (current: any) => {
        return otherArray.filter((other: any) => {
          return other.id === current.f7_name;
        }).length !== 0;
      };
    };

    return this.metricsList.filter(comparer(this.metricsTagsList));
  }

  populateFormObj() {

    console.log('this.selectedPeriod >>')
    console.log(this.selectedPeriod);

    const formValues: any = {};
    formValues.reportName = this.dataModel.reportName;
    formValues.period = (this.selectedPeriod && this.selectedPeriod.length) ? this.selectedPeriod[0].option : '';
    formValues.noOfDays = this.dataModel.noOfDays === '' ? 0 : this.dataModel.noOfDays ; // TODO
    formValues.startDate = _.isUndefined(this.dataModel.periodStartDate) ? '' : this.dataModel.periodStartDate.formatted;
    formValues.endDate = _.isUndefined(this.dataModel.periodEndDate) ? '' : this.dataModel.periodEndDate.formatted;

    formValues.mappingStatus =  (this.selectedTransactionStatus && this.selectedTransactionStatus.length)
      ? this.selectedTransactionStatus[0].value : '';
    formValues.aggregation =  (this.selectedAggregation && this.selectedAggregation.length) ? this.selectedAggregation[0].option : '';

    console.log('this.selectedPartnerType >>')
    console.log(this.selectedPartnerType);

    formValues.parnerType = this.selectedPartnerType.map(function(x){
       return x.value;
    });

    formValues.filterList = [];
    if (this.selectedFilter && this.selectedFilter.length) {

      this.selectedFilter.forEach(function (filter) {
          var obj: any = {};
          obj.field_name = filter.f7_name;
          obj.value = [];

          if(filter.selectedItems) {
            filter.selectedItems.forEach(function (selected) {
              obj.value.push((obj.field_name === 'ctrt_vend_vendor_name' || obj.field_name === 'partner_name') ? selected.label : selected.id);
            });
          }
        formValues.filterList.push(obj);
      }, this);
    }

    formValues.dimensions = [];

    console.log('this.dimensionTagsList >>>')
    console.log(this.dimensionTagsList);

    if (this.dimensionTagsList && this.dimensionTagsList.length) {
      formValues.dimensions = this.dimensionTagsList.map(function(e){
        return e.id;
      });
    }

    formValues.metrics = [];
    if (this.metricsTagsList && this.metricsTagsList.length) {
      formValues.metrics = this.metricsTagsList.map(function(e){
        return { field_name: e.id, aggregation_function: "sum"};
      });
    }

    formValues.oneTimeRun = this.dataModel.formatAndSchedule.oneTimeRun ? 'yes' : 'no';
    formValues.reportActive = this.dataModel.formatAndSchedule.active ? 'yes' : 'no';
    formValues.reportPublic = this.dataModel.formatAndSchedule.public ? 'yes' : 'no';
    formValues.partnerType = (this.selectedPartnerType && this.selectedPartnerType.length) ? this.selectedPartnerType[0].value : '';

    formValues.lastRunTime = '2019-02-03T11:43:22.000Z';
    formValues.lastRunResultId = '5c52bf56d6fe62163d004223';
    formValues.lastRunStatus = 'Not Run';

    formValues.freqStartDate = this.dataModel.formatAndSchedule.startDate.formatted;
    formValues.freqEndDate = this.dataModel.formatAndSchedule.endDate.formatted;

    formValues.frequency = (this.selectedFrequency && this.selectedFrequency.length) ? this.selectedFrequency[0].option : '' ;
    formValues.frequency_week_Mon = '';
    formValues.frequency_week_Tue = '';
    formValues.frequency_week_Wed = '';
    formValues.frequency_week_Thu = '';
    formValues.frequency_week_Fri = '';
    formValues.frequency_week_Sat = '';
    formValues.frequency_week_Sun = '';

    formValues.dayOfMonth = 1;
    formValues.monthOfQuarter = '';
    formValues.runTime = (this.selectedRunTime && this.selectedRunTime.length) ? this.selectedRunTime[0].option : '';
    formValues.email = (this.selectedEmail && this.selectedEmail.length) ? this.selectedEmail[0].value : '';
    formValues.hasEmail = (this.selectedEmail && this.selectedEmail.length) ? true : false;

    formValues.fileName = this.dataModel.formatAndSchedule.fileName;
    formValues.fileType = (this.selectedFileType && this.selectedFileType.length) ? this.selectedFileType[0].option : '';

    formValues.hasFtp = this.dataModel.hasFtp;
    formValues.ftpHost = this.dataModel.ftpDelivery.host;
    formValues.ftpUser = this.dataModel.ftpDelivery.userId;
    formValues.ftpPwd = this.dataModel.ftpDelivery.password;
    formValues.ftpDir = this.dataModel.ftpDelivery.directory;
    formValues.ftpPort = this.dataModel.ftpDelivery.port;

    formValues.s3Bucket = this.dataModel.s3Delivery.bucket;
    formValues.s3AccessKeyID = this.dataModel.s3Delivery.accessKeyId;
    formValues.s3SecretAccessKey = this.dataModel.s3Delivery.secrectAccessKey;
    formValues['isAlert'] = this.isAlertRequired;
    formValues['alertType'] = _.size(this.selectedAlertType) ? this.selectedAlertType[0]['value'] : [];
    formValues['alertMetric'] = _.size(this.selectedAlertMetric) > 0 ? this.selectedAlertMetric[0]['id'] : [];
    formValues['alertopr'] = _.size(this.selectedAlertThreshold) > 0 ? this.selectedAlertThreshold[0]['value'] : [];
    formValues['alertThreshold1'] = this.alertThresholdValue;
    formValues['alertMovingAvgPeriod'] = _.size(this.alertMovingPeriodThresholdValue) > 0 ? this.alertMovingPeriodThresholdValue[0]['value'] : [];
    formValues['generateReport'] = this.generateReport;
    return formValues;
  }

  handleSubmit(saveType: any, reportform: any) {
   // const valid = Validate.validate(this.dataModel) ;

    this.showSpinner = true;
    if (!reportform.valid) {
      _.forEach(reportform.controls , (v, i) => {
        reportform.controls[i].markAsTouched();
      });
      console.log(this.selectedPartnerType);
      return false;
    }else {
      _.forEach(reportform.controls , (v, i) => {
        reportform.controls[i].markAsUntouched();
      });
    }
   // console.log(JSON.stringify(valid));

    const formValues = this.populateFormObj();
    console.log('formValues >>')
    console.log(JSON.stringify(formValues));

    const dataObj = {};
    dataObj['org_id'] = '2';
    dataObj['report_name'] = formValues.reportName;
    dataObj['report_definition'] = {};
    dataObj['report_definition']['report_name'] = formValues.reportName;
    dataObj['report_definition']['transaction_type'] = formValues.frequency.toLowerCase();
    dataObj['report_definition']['dimensions'] = formValues.dimensions;
    dataObj['report_definition']['partner_types'] = formValues.parnerType;
    dataObj['report_definition']['filters'] = formValues.filterList;
    dataObj['report_definition']['metrics'] = formValues.metrics;
    dataObj['report_definition']['aggregation'] = formValues.aggregation;
    dataObj['report_definition']['data_period'] = formValues.period.toLowerCase();
    if(formValues.period.toLowerCase() === 'last n days') {
      dataObj['report_definition']['data_period_days'] = formValues.noOfDays;
    } else if(formValues.period.toLowerCase() === 'custom period') {
      dataObj['report_definition']['data_start_date'] = formValues.startDate;
      dataObj['report_definition']['data_end_date'] = formValues.endDate;
    }
    dataObj['report_definition'] = JSON.stringify(dataObj['report_definition']);
    dataObj['alert_definition'] = '';
    if (formValues.isAlert) {
      dataObj['alert_definition'] = {};
      dataObj['alert_definition']['alert_type'] = formValues.alertType;
      dataObj['alert_definition']['metric'] = formValues.alertMetric;
      dataObj['alert_definition']['operator'] = formValues.alertopr;
      dataObj['alert_definition']['value'] = formValues.alertThreshold1;
      dataObj['alert_definition'] = JSON.stringify(dataObj['alert_definition']);
    }
    dataObj['is_hidden'] = '0';
    dataObj['is_alert_dependent'] = formValues.isAlert ? '1' : '0';
    dataObj['report_frequency'] = formValues.frequency.toLowerCase();
    dataObj['report_duration_begin'] = formValues.freqStartDate;
    dataObj['report_duration_end'] = formValues.freqEndDate;
    dataObj['report_run_time'] = formValues.runTime;
    dataObj['report_run_time_zone'] = 'PST';
    dataObj['report_file_type'] = formValues.fileType;
    dataObj['report_active'] = formValues.reportActive == 'no' ? '0' : '1';
    dataObj['is_public'] = formValues.reportPublic == 'no' ? '0' :  '1';
    dataObj['is_one_time_run'] = formValues.oneTimeRun == 'no' ? '0' :  '1';
    dataObj['delivery_type'] = 'email';
    dataObj['email_id'] = formValues.email;

    return this.submitFormData(dataObj).subscribe(
        response => {
          console.log('response>>>')
          console.log(response);
          if (response) {
            this.showSpinner = false;
            this.router.navigate(['/app/reports/reportsSummary']);
          }
          // modalComponent.hide();
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.handleSubmit.bind(self, saveType, reportform)
            );
         } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;  
          } else {
            this.showSpinner = false;
          }
        }
    );

  }

  submitFormData(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(dataObj);

    console.log('data to submit >>>>')
    console.log(data);

    var url;
    if (this.isEditMode) {
      url = this.api_fs.api + '/api/reports/adhoc/' + this.reportId;
      return this.http
          .put(url, data, options)
          .map(res => {
            return res.json();
          }).share();
    } else {
      url = this.api_fs.api + '/api/reports/adhoc';
      return this.http
          .post(url, data, options)
          .map(res => {
            return res.json();
          }).share();
    }
  }

  fetchReportData() {
    this.showSpinner = true;
    this.getReportTemplateData().subscribe(response => {
      if (response && response.body) {
        this.reportTemplate = response.body;

        this.isAlertRequired = this.reportTemplate.alertEnabled;

        this.partnerTypeList = this.reportTemplate.context.partner.type.map(function (x) {
          return {option: x === 'dtrx' ? 'Transaction' : x, value: x}
        });

        if (this.reportTemplate.report.period && this.reportTemplate.report.period.duration
            && this.reportTemplate.report.period.duration.length > 0) {
          this.periodList = this.reportTemplate.report.period.duration;
          this.aggregationList = this.reportTemplate.report.period.aggregation;
        }

        this.fileTypeList = this.reportTemplate.report.delivery.extension;
        this.frequencyList = this.reportTemplate.report.delivery.frequency;

        this.transactionStatusList = this.reportTemplate.mappingOptions;

        if (this.reportTemplate.report.filterList && this.reportTemplate.report.filterList.length > 0
            && this.reportTemplate.report.filterList[0].fieldSets && this.reportTemplate.report.filterList[0].fieldSets.length > 0) {
          if (this.reportTemplate.report.filterList[0].fieldSets[0].fields) {
            this.filterList = this.reportTemplate.report.filterList[0].fieldSets[0].fields;
            this.populateFilterConfig();
          }
        }

        if (this.reportTemplate.report.dimensions && this.reportTemplate.report.dimensions.length > 0
            && this.reportTemplate.report.dimensions[0].fieldSets && this.reportTemplate.report.dimensions[0].fieldSets.length > 0) {
          if (this.reportTemplate.report.dimensions[0].fieldSets[0].fields) {
            this.dimensionList = this.reportTemplate.report.dimensions[0].fieldSets[0].fields;

            this.dimensionsPopupData.data
                = this.dimensionList.map(dimension => {
              return {id: dimension.f7_name, label: dimension.report_alias};
            });
          }
        }

        if (this.reportTemplate.report.metrics && this.reportTemplate.report.metrics.length > 0
            && this.reportTemplate.report.metrics[0].fieldSets && this.reportTemplate.report.metrics[0].fieldSets.length > 0) {
          if (this.reportTemplate.report.metrics[0].fieldSets[0].fields) {
            this.metricsList = this.reportTemplate.report.metrics[0].fieldSets[0].fields;

            this.metricsPopupData.data = this.metricsList.map(metric => {
              return {id: metric.f7_name, label: metric.report_alias};
            });
          }
        }

       // this.showSpinner = false;

        this.getReportSummaryDataByID().subscribe(
            response1 => {

              console.log('response1 >>>')
              console.log(response1);

              if (response1 && response1.body) {
                var getReportData = response1.body;
                if (getReportData) {
                  console.log('response report data summary>>>')
                  console.log(JSON.stringify(getReportData));
                  this.dataModel.reportName = getReportData.report_name;
                  var reportDefinition = JSON.parse(getReportData.report_definition);


                  if (getReportData.alert_definition) {
                    var alertDefination = JSON.parse(getReportData.alert_definition);
                    this.selectedAlertType = this.alertTypeList.filter(function (x) {
                      return x.value === alertDefination.alert_type;
                    });
                    this.selectedAlertMetric = this.metricsPopupData.data.filter(function (x) {
                      return x.id === alertDefination.metric;
                    });
                    this.selectedAlertThreshold = this.alertThresholdData.filter(function (x) {
                      return x.value === alertDefination.operator;
                    });
                    this.alertThresholdValue = alertDefination.value;
                  }


                  var selectedPeriod = this.periodList.find( x=> x.option.toLowerCase() === reportDefinition.data_period);
                  if(selectedPeriod) {
                    this.selectedPeriod = [selectedPeriod];
                  }

                  var selectedAggregation = this.aggregationList.find( x=> x.option.toLowerCase() === reportDefinition.transaction_type);
                  if(selectedAggregation) {
                    this.selectedAggregation = [selectedAggregation];
                  }

                  var selectedFileType = this.fileTypeList.find( x=> x.option.toLowerCase() === getReportData.report_file_type);
                  if(selectedFileType) {
                    this.selectedFileType = [selectedFileType];
                  }

                  this.dataModel.formatAndSchedule.active  = getReportData.report_active == 1;
                  this.dataModel.formatAndSchedule.public = getReportData.is_public == 1;
                  this.dataModel.formatAndSchedule.oneTimeRun = getReportData.is_one_time_run == 1;

                  var selectedFrequency = this.frequencyList.find( x=> x.option.toLowerCase() === getReportData.report_frequency.toLowerCase());
                  if(selectedFrequency) {
                    this.selectedFrequency = [selectedFrequency];
                  }

                  this.dataModel.formatAndSchedule.startDate = { date: getReportData.report_duration_begin, formatted: getReportData.report_duration_begin };
                  this.dataModel.formatAndSchedule.endDate = { date: getReportData.report_duration_end, formatted: getReportData.report_duration_end };

                  var selectedRunTime = this.runTimeList.find( x=> x.option === getReportData.report_run_time.split(':')[0] + ':' + getReportData.report_run_time.split(':')[1]);
                  if(selectedRunTime) {
                    this.selectedRunTime = [selectedRunTime];
                  }

                  var selectedEmail = this.emailList.find( x=> x.value == getReportData.adhoc_reports_email.email_id);
                  if(selectedEmail) {
                    this.selectedEmail = [selectedEmail];
                  }

                  var filters = reportDefinition.filters.map(function(x) {
                    return x.field_name
                  })

                  var selectedFilter = this.filterList.filter(function(x){
                     return filters.indexOf(x.f7_name) != -1
                  });

                  if(selectedFilter.length) {
                    this.selectedFilter = selectedFilter;
                  }

                  // Populate Dimensions
                  var selectedDimensions = this.dimensionList.filter(function(x){
                    return reportDefinition.dimensions.indexOf(x.f7_name) != -1;
                  });

                  if(selectedDimensions.length) {
                    this.dimensionTagsList = [];
                    selectedDimensions.forEach(function (dimension) {
                      this.dimensionTagsList.push({ id: dimension.f7_name, label: dimension.report_alias});
                    }, this);
                  }

                  // Populate Metrics

                  var metricValues = reportDefinition.metrics.map(function(x){
                    return x.field_name;
                  });

                  var selectedMetrics = this.metricsList.filter(function(x){
                    return metricValues.indexOf(x.f7_name) != -1;
                  });

                  if(selectedMetrics.length) {
                    this.metricsTagsList = [];
                    selectedMetrics.forEach(function (metric) {
                      this.metricsTagsList.push({ id: metric.f7_name, label: metric.report_alias});
                    }, this);
                  }

                  console.log('this.dimensionList >>')
                  console.log(this.metricsList);

                  console.log('selectedDimensions >>')
                  console.log(selectedDimensions);

                  this.showSpinner = false;

                }
              }
            },
            err => {

              if(err.status === 401) {
                let self = this;
                this.widget.refreshElseSignout(
                  this,
                  err,
                  self.fetchReportData.bind(self)
                );
              } else if(err.status === 403) {
                this.isForbidden = true;
                this.showSpinner = false;  
              } else {
                this.showSpinner = false;
              }
            }
        );
      }
    }, error => {
      this.showSpinner = false;
      const message = JSON.parse(error._body).error.errors[0].message;
    });
  }

  getReportSummaryDataByID() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/reports/adhoc/' + this.reportId;
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  private populateDataModel(reportInstance, reportTemplate) {
    // console.log(reportInstance);
    this.dataModel.reportName = reportInstance.name;
    this.selectedPartnerType = this.partnerTypeList.filter( e => e.value === reportInstance.context.partner.type[0]);

    this.selectedTransactionStatus = (reportTemplate.mappingStatusEnabled && reportInstance.mappingStatus)
      ? this.transactionStatusList.filter( e => e.value === reportInstance.mappingStatus) : this.transactionStatusList[0];

    if (reportInstance.report.period.duration[0].option === 'Custom Period') {
      this.dataModel.periodStartDate = reportInstance.report.period.duration[0].start.substring(0, 10);
      this.dataModel.periodEndDate = reportInstance.report.period.duration[0].end.substring(0, 10);
    }

    this.dataModel.formatAndSchedule.fileName = reportInstance.report.delivery.filename;
    const freqOpt = !_.isUndefined(reportInstance.report.delivery.frequency[0]) ? reportInstance.report.delivery.frequency[0].option : '';
    this.dataModel.formatAndSchedule.frequency = this.frequencyList.filter( e => e.option === freqOpt);

    const freqVals = !_.isUndefined(reportInstance.report.delivery.frequency[0]) ? reportInstance.report.delivery.frequency[0].values : [];
    if (freqOpt === 'Weekly') {
      freqVals.forEach(day => {
        this.dataModel.formatAndSchedule['frequency_week_' + day] = true;
      });
    } else if (freqOpt === 'Monthly') {
      this.dataModel.formatAndSchedule.dayOfMonth = freqVals[0];
    } else if (freqOpt === 'Quarterly') {
      const dataQArr = freqVals[0].split(':');
      this.dataModel.formatAndSchedule.monthOfQuarter = parseInt(dataQArr[0], 10);
      this.dataModel.formatAndSchedule.dayOfMonth = parseInt(dataQArr[1], 10);
    }

    if (!reportInstance.report.delivery.schedule.runOnce) {
      if (reportInstance.report.delivery.schedule.start_date) {
        const startDateValue = reportInstance.report.delivery.schedule.start_date.substring(0, 10);
        this.dataModel.formatAndSchedule.startDate = { date: startDateValue, formatted: startDateValue };
      }

      if (reportInstance.report.delivery.schedule.end_date) {
        const endDateValue = reportInstance.report.delivery.schedule.end_date.substring(0, 10);
        this.dataModel.formatAndSchedule.endDate = { date: endDateValue, formatted: endDateValue };
      }
    } else {
      this.dataModel.formatAndSchedule.startDate =  { date: '', time: '', median: '', timeZone: '', formatted: ''};
      this.dataModel.formatAndSchedule.endDate =  { date: '', time: '', median: '', timeZone: '', formatted: ''};
    }

    this.dataModel.hasFtp = reportInstance.report.delivery.ftp.enabled;
    this.dataModel.ftpDelivery.directory = reportInstance.report.delivery.ftp.directory;
    this.dataModel.ftpDelivery.host = reportInstance.report.delivery.ftp.host;
    this.dataModel.ftpDelivery.port = reportInstance.report.delivery.ftp.port;
    this.dataModel.ftpDelivery.password = reportInstance.report.delivery.ftp.password;
    this.dataModel.ftpDelivery.userId = reportInstance.report.delivery.ftp.user;

    this.dataModel.hasS3 = reportInstance.report.delivery.s3.enabled;
    this.dataModel.s3Delivery.s3Bucket = reportInstance.report.delivery.s3.bucket;
    this.dataModel.s3Delivery.s3AccessKeyID = reportInstance.report.delivery.s3.accessKeyId;
    this.dataModel.s3Delivery.s3SecretAccessKey = reportInstance.report.delivery.s3.secretAccessKey;

    this.dataModel.hasEmail = reportInstance.report.delivery.emailEnabled;
    this.dataModel.emailDelivery.email = reportInstance.report.delivery.email;

    this.dataModel.lastRunTime = reportInstance.report.delivery.lastRunTime;
    this.dataModel.lastRunResultId = reportInstance.report.delivery.lastRunResultId;
    this.dataModel.lastRunStatus = reportInstance.report.delivery.lastRunStatus;

    if (reportInstance.report.period.duration[0].option === 'Last N Days') {
      this.dataModel.noOfDays = reportInstance.report.period.duration[0].value;
      this.dataModel.period = 25;
    } else {
      this.dataModel.period = reportInstance.report.period.duration[0].value;
    }
    this.periodStartEnd = false;
    this.noOfDays = false;
    if (this.dataModel.period === 120) {
      this.periodStartEnd = true;
      const startDate = reportInstance.report.period.duration[0].start.substring(0, 10);
      const endDate = reportInstance.report.period.duration[0].end.substring(0, 10);
      this.dataModel.periodStartDate = { date: startDate, formatted: startDate };
      this.dataModel.periodEndDate =  { date: endDate, formatted: endDate };
    }else if (this.dataModel.period === 25){
      this.noOfDays = true;
      this.dataModel.noOfDays = reportInstance.report.period.duration[0].value;
    }
    this.dataModel.formatAndSchedule.active = reportInstance.report.delivery.active;
    this.dataModel.formatAndSchedule.public = reportInstance.report.delivery.public;
    this.dataModel.formatAndSchedule.oneTimeRun = reportInstance.report.delivery.schedule.runOnce;

    this.selectedRunTime = this.runTimeList.filter( e => e.option === reportInstance.report.delivery.runTime);

    const alertData = _.size(reportInstance.report.alert) > 0 ? reportInstance.report.alert[0] : '';
    this.generateReport = _.size(alertData) > 0 ? alertData.generateReport : false;
    this.alertMetricList = this.metricsTagsList;
    this.isAlertRequired = _.size(alertData) > 0 ? alertData.enabled : false;
    this.selectedAlertType = _.size(alertData) > 0 ? _.filter(this.alertTypeList, {value: alertData.alertType}) : [];
    this.selectedAlertMetric = _.size(alertData) > 0 && _.size(this.alertMetricList) > 0 ? _.filter(this.alertMetricList, {id: alertData.alertMetric}) : [];
    this.selectedAlertThreshold = _.size(alertData) > 0 ? _.filter(this.alertThresholdData, {value: alertData.alertopr}) : [];
    this.alertThresholdValue = _.size(alertData) > 0 ? alertData.alertThreshold1 : '';
    // this.selectedAlertType  = "";
    // this.selectedAlertMetric  = "";
    // this.selectedAlertThreshold  = "";
    // this.alertopr  = "";
    // this.alertThreshold1  = "";
    // this.alertThreshold2  = "";

    /*if(reportInstance.report.alert.length > 0 )
    {
      if(reportInstance.report.alert[0].enabled){
        formDataDs.generateReport = reportInstance.report.alert[0].generateReport;
        formDataDs.isAlert = reportInstance.report.alert[0].enabled;
        formDataDs.alertType = reportInstance.report.alert[0].alertType;
        formDataDs.selectedAlertType  = reportInstance.report.alert[0].alertType;
        formDataDs.alertMovingAvgPeriod = reportInstance.report.alert[0].alertMovingAvgPeriod;
        formDataDs.alertMetric = reportInstance.report.alert[0].alertMetric;

        // Add alias field to alert metrics
        formDataDs.metrics.forEach((obj) => {
          if(isAliasField(obj.value) ) {
            const f7Name = removeAlias(obj.value);
            if(f7Name === formDataDs.alertMetric ){
              formDataDs.alertMetric = obj.value;
            }
          };
        });


        formDataDs.alertopr  = reportInstance.report.alert[0].alertopr;
        formDataDs.alertThreshold1  = reportInstance.report.alert[0].alertThreshold1;
        formDataDs.alertThreshold2  = reportInstance.report.alert[0].alertThreshold2;
      }
    }

    if(reportInstance.report.summary) {

      if(reportInstance.report.summary.enabled){

        var cnter = 0;
        // debugger;
        reportInstance.report.summary.fields.forEach((obj) => {


          var summAggr = 'summaryAggregation-' + cnter;
          var summMetrics = 'summaryMetric-' + cnter;

          formDataDs.isSummary = reportInstance.report.summary.enabled;
          formDataDs[summMetrics] = obj.report_alias;
          formDataDs[summAggr] =obj.aggregationType;

          formDataDs.metrics.forEach((obj) => {
            if(this.isAliasField(obj.value) ) {
              const f7Name = this.removeAlias(obj.value);
              if(f7Name === formDataDs[summMetrics] ){
                formDataDs[summMetrics] = obj.value;
              }
            };
          });

          formDataDs.metrics.forEach((obj) => {
            const f7Name = this.removeAlias(obj.value);
            if(obj.label === formDataDs[summMetrics] ){
              formDataDs[summMetrics] = f7Name;
            };
          });
          cnter = cnter +1;

        });

        formDataDs['summaryCount'] = cnter;

      }
    }

    const result = _.merge(formDataDs, this.getSubFilterValue(reportInstance, formFieldData));
    console.log("result", result); */
  };

  private getSubFilterValue(reportInstance, formFieldData) {
      const subFilterVal = {};

      reportInstance.report.filters.forEach((filterSelect) => {
        const filter = filterSelect.f7_name;
        const reportAlias = filterSelect.reportAlias;

        subFilterVal[`subFilter:${filter}:${reportAlias}`] =
          filterSelect.value.join("|");
      });

      return subFilterVal;
    };

  private removeAlias(key){
    return _.last(key.split(/[0-9]\|+/));
  }

  private isAliasField(key){
    const splitArray = key.split(/[0-9]\|+/);
    return splitArray.length > 1 ? true : false;
  }

  onActiveChange(event) {
    console.log(event);
    this.dataModel.formatAndSchedule.active = event;
  }

  onPublicChange(event) {
    this.dataModel.formatAndSchedule.public = event;
  }

  onOneTimeRunChange(event) {
    this.dataModel.formatAndSchedule.oneTimeRun = event;
  }

  handleDelete(){
    const reportId = this.reportDeleteAction;
    const type = 'delete';
    const __this = this;
    this.reportsService.reportDelete(this.context, reportId, type).subscribe(response => {
      __this.router.navigate(['/reports/reportsSummary']);
    }, error => {
      this.showSpinner = false;
      const message = JSON.parse(error._body).message;
    });
  }
}
