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
    text: 'Select Period',
    primaryKey: 'value',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };
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
    text: 'Select File Type',
    primaryKey: 'option',
    labelKey: 'option',
    searchBy: ['option'],
    dropDownWidth: 95,
    dropDownWidthUnit: '%'
  };

  frequencyDropDownSettings = {
    singleSelection: true,
    text: 'Select Frequency',
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
    text: 'Run Time(PST)',
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
  partnerTypeList = [
    {option: 'Provider', value: 'PROV'},
    {option: '3rd Part Ad Server', value: 'TPAS'},
    {option: 'Verification', value: 'VERI'}];
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
      key: '_id',
      title: '',
      data: 'id',
      isFilterRequired: false,
      isCheckbox: true,
      class: 'nocolvis'
    },
    {
      key: 'contractPublisherName',
      title: 'Contract Publisher name',
      data: 'contractPublisherName',
      isFilterRequired: true,
      editButton: false,
      width: 'auto',
    },
  ];
  options: Array<DataTableOptions> = [{
    isSearchColumn: true,
    isOrdering: true,
    isTableInfo: true,
    isEditOption: true,
    isDeleteOption: true,
    isAddRow: true,
    isColVisibility: true,
    isRowSelection: true,
    isShowEntries: false,
    isPageLength: 10,
    isEmptyTable: 'You have no Bulk Import Log',
  }];

  filterPopupData: any = {
    options: {
      'isSearchColumn': true,
      'isOrdering': true,
      'isTableInfo': true,
      'isEditOption': true,
      'isDeleteOption': true,
      'isAddRow': true,
      'isColVisibility': true,
      'isRowSelection': true,
      'isShowEntries': false,
      'isPageLength': 5,
      'isEmptyTable': 'No records found.'
    },
    headers: [
      {
        'key': '_id',
        'title': '',
        'data': 'id',
        'isFilterRequired': false,
        'isCheckbox': true,
        'class': 'nocolvis'
      },
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
      'isSearchColumn': true,
      'isOrdering': true,
      'isTableInfo': true,
      'isEditOption': true,
      'isDeleteOption': true,
      'isAddRow': true,
      'isColVisibility': true,
      'isRowSelection': true,
      'isShowEntries': false,
      'isPageLength': 5,
      'isPagination': true,
      'isEmptyTable': 'No records found.'
    },
    headers: [
      {
        'key': '_id',
        'title': '',
        'data': 'id',
        'isFilterRequired': false,
        'isCheckbox': true,
        'class': 'nocolvis'
      },
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
      'isSearchColumn': true,
      'isOrdering': true,
      'isTableInfo': true,
      'isEditOption': true,
      'isDeleteOption': true,
      'isAddRow': true,
      'isColVisibility': true,
      'isRowSelection': true,
      'isShowEntries': false,
      'isPageLength': 5,
      'isPagination': true,
      'isEmptyTable': 'No records found.'
    },
    headers: [
      {
        'key': '_id',
        'title': '',
        'data': 'id',
        'isFilterRequired': false,
        'isCheckbox': true,
        'class': 'nocolvis'
      },
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
  movingThresholdEnable = false;
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

    if(this.isEditMode){
      this.fetchReportData();
    } else {
      this.getReportDetails();
    }
  }

  getReportDetails() {
    this.getReportData().subscribe(response => {
      console.log(response);
      if (response && response.body) {
        this.reportTemplate = response.body;

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
    }, error => {
      const message = JSON.parse(error._body).error.errors[0].message;
      this.toastr.error('ERROR!', message);
    });
  }

  getReportData() {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
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
    this.movingThresholdEnable = false;
    this.thresholdValueField = true;
    this.alertThresholdData = this.alertThresholdList;
    this.selectedAlertType = [item];
    if (item.value === 'Moving Average') {
      this.movingThresholdEnable = true;
      this.thresholdValueField = false;
      this.alertThresholdData = this.movingThresholdList;
    }
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
    console.log(item);
    filterItem.filterConfig.values = filterItem.filterConfig.values.filter(e => e._id !== item._id);
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
    this.router.navigate(['/reports']);
  }

  updateFilterConfig(event, filterItem) {
    console.log(event);
    if (event && event.values) {
      filterItem['selectedItems'] = event.values;
    }
  }

  updateDimensionsConfig(event) {
    console.log(event);
    if (event && event.values) {
      this.dimensionTagsList = event.values;
    }
  }

  updateMetricsConfig(event) {
    console.log(event);
    if (event && event.values) {
      this.metricsTagsList = event.values;
      this.alertMetricList = event.values;
    }
  }

  getDependentConfig(dependsOn: any) {
  }

  getFilterConfigData(title: any) {
    return {
      options: {
        'isSearchColumn': true,
        'isOrdering': true,
        'isTableInfo': true,
        'isEditOption': true,
        'isDeleteOption': true,
        'isAddRow': true,
        'isColVisibility': true,
        'isRowSelection': true,
        'isShowEntries': false,
        'isPageLength': 10,
        'isEmptyTable': 'No records found.'
      },
      headers: [
        {
          'key': '_id',
          'title': '',
          'data': 'id',
          'isFilterRequired': false,
          'isCheckbox': true,
          'class': 'nocolvis'
        },
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
        f7Name: filterObj.report_alias,
        label: filterObj.report_alias,
        values: [],
        isMultiSelect: false,
        dependentOn: [],
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

  getFilterConfig(filterItem: any) {
    console.log(filterItem);
    if (filterItem.hasOwnProperty('filterConfig') && filterItem.filterConfig) {
      return filterItem.filterConfig;
    } else {
      const filterConfObj = {
        f7Name: filterItem.report_alias,
        label: filterItem.report_alias,
        values: [],
        isMultiSelect: false,
        dependentOn: [],
        includeCustom: true,
        isMultipleCustomType: true,
        isTag: false,
        placeHolderText: 'Name',
        placeHolderValue: 'Text',
        serverSide: 'false',
        type: 'popupButton'
      };

      filterItem['filterConfig'] = filterConfObj;
      return filterConfObj;
    }
  }

  getData() {
    const query = [{'type': 'iord', 'parent': [], 'field': 'publisher_name'}];
    return this.reportsService.searchContractByPartnerType(this.context, query);
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
    console.log(this.dimensionTagsList);
    console.log(this.metricsTagsList);

    const formValues: any = {};
    formValues.reportName = this.dataModel.reportName;
    formValues.period = (this.selectedPeriod && this.selectedPeriod.length) ? this.selectedPeriod[0].value : '';
    formValues.noOfDays = this.dataModel.noOfDays === '' ? 0 : this.dataModel.noOfDays ; // TODO
    formValues.startDate = _.isUndefined(this.dataModel.periodStartDate) ? '' : this.dataModel.periodStartDate.formatted;
    formValues.endDate = _.isUndefined(this.dataModel.periodEndDate) ? '' : this.dataModel.periodEndDate.formatted;

    formValues.mappingStatus =  (this.selectedTransactionStatus && this.selectedTransactionStatus.length)
      ? this.selectedTransactionStatus[0].value : '';
    formValues.aggregation =  (this.selectedAggregation && this.selectedAggregation.length) ? this.selectedAggregation[0].option : '';

    formValues.filterList = [];
    if (this.selectedFilter && this.selectedFilter.length) {
      formValues.filterList = this.selectedFilter.map( e => e.f7_name).join(',');

      this.selectedFilter.forEach( filterObj => {
        const filterKey = filterObj.f7_name;
        const filterLabel = filterObj.report_alias;
        const selectedFilterItems = (filterObj.selectedItems
          && filterObj.selectedItems.length) ? filterObj.selectedItems.map( e => e.label).join('|') : '';
        const subFilterPropertyName = 'subFilter' + ':' + filterKey + ':' + filterLabel;
        const subFilterPropertyValue = selectedFilterItems;
        formValues[subFilterPropertyName] = subFilterPropertyValue;
      });
    }

    formValues.dimensions = [];
    if (this.dimensionTagsList && this.dimensionTagsList.length) {
      formValues.dimensions = this.dimensionTagsList.map(function(e){
        return { value: e.id, label: e.label};
      });
    }

    formValues.metrics = [];
    if (this.metricsTagsList && this.metricsTagsList.length) {
      formValues.metrics = this.metricsTagsList.map(function(e){
        return { value: e.id, label: e.label};
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
    formValues.email = this.dataModel.emailDelivery.email;
    formValues.hasEmail = this.dataModel.emailDelivery.email !== '' ? true : false;

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
    // formValues['alertThreshold2']
    // formValues['alertMovingAvgPeriod']
    // formValues['alertThreshold1']
    // formValues['alertThreshold2']
    // formValues['alertMovingAvgPeriod']
    // formValues['isSummary']
    // formValues['isSummaryRowCheck-' + index]
    // formValues['summaryAggregation-' + index]
  return formValues;
  }

  handleSubmit(saveType: any, reportform: any) {
   // const valid = Validate.validate(this.dataModel) ;

    if (!reportform.valid) {
      _.forEach(reportform.controls , (v, i) => {
        reportform.controls[i].markAsTouched();
      });
      console.log(this.selectedPartnerType);
      debugger;
      return false;
    }else {
      _.forEach(reportform.controls , (v, i) => {
        reportform.controls[i].markAsUntouched();
      });
    }
   // console.log(JSON.stringify(valid));

    const formValues = this.populateFormObj();
    console.log(JSON.stringify(formValues));
    const clonedReportTemplate = JSON.parse(JSON.stringify(this.reportTemplate));
    const reportInstanceExisting = null;
    const reportPayload = this.reportsUtil.submitDataTransformation(formValues, clonedReportTemplate, reportInstanceExisting, clonedReportTemplate);
    this.reportsService.createOrUpdateReport(this.context, reportPayload, saveType, this.reportId).subscribe(reponse => {
      console.log(reponse);
      this.router.navigate(['/reports']);
    },error => {
      const message = JSON.parse(error._body).error.errors[0].message;
      this.toastr.error('ERROR!', message);
    });
  }

  fetchReportData() {
    const context = {};
    this.reportsService.getReportTemplate(context).subscribe(response => {
      if (response) {
        const templates = response.docs;
        if (templates && templates.length > 0) {
          this.reportTemplate = templates[0];
          console.log(this.reportTemplate);
          this.excludePartnerType = this.reportTemplate.excludePartnerType;
          this.mappingStatusEnabled = this.reportTemplate.mappingStatusEnabled;

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

          this.reportsService.getReportById(context, this.reportId).subscribe(reportResponse => {
            console.log(reportResponse);
            if (reportResponse ) {
              this.existingReport = reportResponse;
              const report = this.existingReport.report;
              this.reportDeleteAction = this.reportId;
              if (report) {
                if (report.period && report.period.duration && report.period.duration.length > 0) {
                  this.selectedPeriod = report.period.duration;
                  this.selectedAggregation = report.period.aggregation;
                }
                this.selectedFileType = report.delivery.extension;
                this.selectedFrequency = report.delivery.frequency;

                if (report.filterList && report.filterList.length > 0
                  && report.filterList[0].fieldSets && report.filterList[0].fieldSets.length > 0) {
                  if (report.filterList[0].fieldSets[0].fields) {
                    const existingFilters = report.filterList[0].fieldSets[0].fields;
                    this.selectedFilter = this.getSelectedFilterList(this.filterList, existingFilters);
                    console.log(this.selectedFilter);
                    this.selectedFilter.forEach( selectedFilterObj => {
                      if (selectedFilterObj.filterConfig) {
                        const filterValueObj = report.filters.find( e => e.f7_name === selectedFilterObj.f7_name);
                        console.log(filterValueObj);
                        if (filterValueObj) {
                          if (filterValueObj.value && filterValueObj.value.length) {
                            selectedFilterObj['selectedItems'] = filterValueObj.value.map( e => {
                              return {id: e, label: e, isChecked: true};
                            });
                          }
                        }
                      }
                    });
                  }
                }

                if (report.dimensions && report.dimensions.length > 0
                  && report.dimensions[0].fieldSets && report.dimensions[0].fieldSets.length > 0) {
                  if (report.dimensions[0].fieldSets[0].fields) {
                    this.dimensionTagsList = report.dimensions[0].fieldSets[0].fields.map(function(e){
                      return { id: e.f7_name, label: e.report_alias};
                    });
                  }
                }

                if (report.metrics && report.metrics.length > 0 && report.metrics[0].fieldSets && report.metrics[0].fieldSets.length > 0) {
                  if (report.metrics[0].fieldSets[0].fields) {
                    this.metricsTagsList = report.metrics[0].fieldSets[0].fields.map(function(e){
                      return { id: e.f7_name, label: e.report_alias};
                    });
                  }
                }

                this.populateDataModel(this.existingReport, this.reportTemplate);
              }

            }
          }, error => {
            const message = JSON.parse(error._body).error.errors[0].message;
            this.toastr.error('ERROR!', message);
          });

        }
      }
    }, error => {
      const message = JSON.parse(error._body).error.errors[0].message;
      this.toastr.error('ERROR!', message);
    });
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
      const message = JSON.parse(error._body).message;
      this.toastr.error('ERROR!', message);
    });
  }
}
