/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-03-26 12:54:37
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { PopUpModalComponent } from '../../shared/components/pop-up-modal/pop-up-modal.component';
import { DataTableOptions } from '../../../models/dataTableOptions';
import { Http, Headers, RequestOptions } from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {moment} from 'ngx-bootstrap/chronos/test/chain';

@Component({
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss']
})
export class ReconciliationComponent implements OnInit {

  headers: any = [];
  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: any = [{
    isSearchColumn: true,
    isTableInfo: true,
    isCustomOption: {
      value: true,
      icon: 'fa-arrow-circle-o-down',
      tooltip: 'Download'
    },
    // isDeleteOption: {
    //   value: true,
    //   icon: '',
    //   tooltip: 'Delete'
    // },
    isAddRow: false,
    isColVisibility: true,
    isDownloadAsCsv: true,
    isRowHighlight: true,
    isDownloadAsCsvFunc: (table, pageLength, csv?) => {
      this.apiMethod(table, pageLength, csv);
    },
    isDownloadOption: {
      value: true,
      icon: '',
      tooltip: 'View/Download Invoice'
    },
    isPlayOption: {
      value: true,
      icon: 'fa-plus-circle',
      tooltip: 'View Order Info'
    },
    isCustomOption2: {
      value : true,
      icon : 'fa-pencil',
      tooltip: 'Add/Edit SES No'
    },
    isRowSelection: null,
    isPageLength: true,
    isPagination: true,
    isHideColumns: ["invoice_header_id"]
  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  periodData: any;
  selectedPeriod: any;
  channelData: any;
  selectedChannel: any;
  selectedSupplier: any;
  selectedSES: any;

  settings: any = {
    singleSelection: true,
    text: 'Select ',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    labelKey: 'itemName',
    searchBy: ['itemName'],
    enableCheckAll: true,
    enableSearchFilter: true,
    showTooltip: true,
    tooltipElementsSize: 10
  };
  hideTable: boolean;
  selectedInvoice: any;
  selectedInvoiceNumber: any;
  selectedInvoiceHeaderId: any;
  hasData: boolean;
  selectedInvoiceDetails: any;
  memo: string;
  orgArr = [];
  selectedOrg: any;
  orgValue = '';
  orgInfo: any;
  isRoot: boolean;
  dashboardConfig: any;
  period: any= {};
  dateOptions = {
    format: "MMM YYYY",
    showClear: false
  };

  @ViewChild('UploadInvoice') uploadInvoice: PopUpModalComponent;
  @ViewChild('SES') SES: PopUpModalComponent;

  uploadForm: FormGroup;
  uploadModel: any;
  select2Options = {
    placeholder: { id: '', text: 'Select a channel' }
  };
  channelOptions: any;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {

    this.uploadModel = {
      channel: '',
      emails: [],
      comments: '',
      file: '',
      fileAsBase64: ''
    };
    const groups = localStorage.getItem('loggedInUserGroup') || '';
    const custInfo = JSON.parse(localStorage.getItem('customerInfo') || '');
    this.orgInfo = custInfo.org;

    console.log('custInfo >>>')
    console.log(custInfo);

    const grp = JSON.parse(groups);
    grp.forEach(function (item) {
      if (item === 'ROOT' || item === 'SUPER_USER') {
        this.isRoot = true;
      }
    }, this);
    if (this.isRoot) {
      this.selectedOrg = [{id: custInfo.org.org_id, itemName: custInfo.org.org_name}];
    } else {
      this.selectedOrg = [{}];
    }
  }

  ngOnInit() {

   // this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.periodData = this.getPeriod();
    this.selectedPeriod = [this.periodData[1]];
    this.channelData = this.getChannel();
    this.selectedChannel = [this.channelData[0]];
    if (this.isRoot) {
      this.searchOrgRequest();
    }
    if (this.selectedOrg[0].id) {
      this.orgValue = this.selectedOrg[0].id;
    }

   // this.searchDataRequest();

    const testJSON = {
      "data": {
        "views": [
          {
            "filters": {
              "dataset": [],
              "source": [
                {
                  "hasAllOption": false,
                  "order": 1,
                  "parent": [],
                  "displayDefault": true,
                  "f7_name": "period",
                  "alias": "Period",
                  "type": "monthpicker"
                },
                {
                  "hasAllOption": false,
                  "order": 2,
                  "parent": [],
                  "displayDefault": true,
                  "f7_name": "supplier",
                  "alias": "Supplier",
                  "type": "popupButton"
                },
                {
                  "hasAllOption": true,
                  "order": 5,
                  "parent": [
                    "period",
                    "supplier"
                  ],
                  "displayDefault": true,
                  "f7_name": "invoice_number",
                  "alias": "Invoice Number",
                  "type": "popupButton"
                },
                {
                  "hasAllOption": false,
                  "order": 3,
                  "parent": [],
                  "displayDefault": true,
                  "f7_name": "mk_number",
                  "alias": "Marketing Contract",
                  "type": "popupButton"
                },
                {
                  "hasAllOption": false,
                  "order": 4,
                  "parent": [],
                  "displayDefault": true,
                  "f7_name": "po_number",
                  "alias": "Purchase Order",
                  "type": "popupButton"
                }
              ]
            },
            "name": "Reconciliation"
          }
        ]
      }
    };

    this.populateFilters(testJSON);
  }

  populateFilters(filterResponse, seedResponse = null) {

    localStorage.setItem('dashboardConfig_reconciliation', JSON.stringify(filterResponse));
    const dashboardConfig = filterResponse.data;

    this.dashboardConfig = {};
    this.dashboardConfig.filterProps = [];
    const getSelectedTypeConfig = dashboardConfig.views.find(x => x.name.toLowerCase() === 'reconciliation');

    if (getSelectedTypeConfig) {

      getSelectedTypeConfig.filters.source.forEach(function (filter, index) {
        if (filter.f7_name != 'month') {
          var newFilter: any = {};
          newFilter.f7Name = filter.f7_name;
          newFilter.label = filter.alias;
          newFilter.values = [];
          newFilter.displayDefault = null; // filter.displayDefault;

          if (!newFilter.displayDefault && seedResponse) {
            if (seedResponse[newFilter.f7Name] && seedResponse[newFilter.f7Name].length) {
              if (seedResponse[newFilter.f7Name] !== 'period') {
                newFilter.values = [{
                  id: seedResponse[newFilter.f7Name][0],
                  label: seedResponse[newFilter.f7Name][0]
                }];
              }
            }
          }
          //  newFilter.values = filter.default_value ? [filter.default_value] : [];

          newFilter.isMultiSelect = filter.hasAllOption || false;
          newFilter.dependentOn = filter.parent || [];
          newFilter.includeCustom = false;
          newFilter.isMultipleCustomType = false;
          newFilter.isTag = false;
          newFilter.placeHolderText = '';
          newFilter.placeHolderValue = '';
          newFilter.apiRequestUrl = '';
          newFilter.apiRequestType = '';
          newFilter.type = filter.type;

          this.dashboardConfig.filterProps.push(newFilter);
        }
      }, this);
    }

    console.log('this.dashboardConfig >>>')
    console.log(this.dashboardConfig);

    const periodFilter = this.dashboardConfig.filterProps.find( x=> x.f7Name === 'period');
    if (periodFilter && seedResponse && seedResponse['period'] && seedResponse['period'].values && seedResponse['period'].values.startDate) {

      periodFilter.values = [{
        id: seedResponse['period'].values.startDate,
        itemName: this.getMonthName(seedResponse['period'].values.startDate.split('-')[1].replace('0','')) + ' ' + seedResponse['period'].values.startDate.split('-')[0]
      }];

      this.period.display = moment(periodFilter.values[0].id).format('MMM YYYY');
      this.period.value =  moment(periodFilter.values[0].id).format('MMM YYYY');
    } else {
      const d = new Date(),
          month = '' + (d.getMonth() + 1),
          year = d.getFullYear();
      this.period.display = moment(year + '-' + ( month.length < 2 ? ('0' + month) : month) + '-01').format('MMM YYYY');
      this.period.value =  moment(year + '-' + ( month.length < 2 ? ('0' + month) : month) + '-01').format('MMM YYYY');
    }
  }

  getDependentConfig(dependsOn: any) {
    return this.dashboardConfig.filterProps.filter(function (x) {
      return dependsOn.indexOf(x.f7Name) !== -1;
    });
  }

  getData(filterConfig, dependentConfig) {

    const applyFilter = [];
    if(dependentConfig.length) {
      dependentConfig.forEach(function (config) {
        if (config.values.length) {
          const values = [];
          config.values.forEach(function (val) {
            values.push(val.id);
          });
          applyFilter.push({
            f7Name : config.f7Name,
            values : values
          });
        }
      });
    }

    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});

    console.log('applyFilter >>>')
    console.log(applyFilter);

    var dateField;
    const objDate = this.period.display;
    if (objDate) {
      dateField = objDate.split(' ')[1] + '-' + this.getMonthNum(objDate.split(' ')[0]) + '-01';
    } else {
      dateField = this.formatDate(new Date());
    }

    var startDate = dateField + 'T00:00:00Z';
    var endDate = '';
    var endDateOftheMonth = 0;
    if (dateField.split('-')[1] == 12) {
      endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
      endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    } else {
      endDateOftheMonth = new Date(dateField.split('-')[0], dateField.split('-')[1], 0).getDate();
      endDate = dateField.split('-')[0] + '-' + dateField.split('-')[1] + '-' + endDateOftheMonth  + 'T23:59:59Z';
    }

    const dataObj = {
      filter: applyFilter,
      entity: filterConfig.f7Name,
      page: 1,
      limit: 10,
      period: {
        f7Name: 'date',
        values: {
          startDate: startDate,
          endDate: endDate
        }
      }
    };

    var obj = JSON.stringify(dataObj);

    console.log('filter dataObj >>')
    console.log(obj);
    let org = this.orgValue;
    return this.http
        .post(this.api_fs.api + '/api/reports/org/homd/filters'+( org ? ('?org_id=' + org) : ''), obj, options )
        .map(res => {
          const result = res.json();
          const ret = [];
          if (result.length) {
            result.forEach(function (item) {
              ret.push({id: item, label: item});
            });
          }
          return ret;
        });
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, '01'].join('-');
  }

  OnPeriodChange(e, filter) {
    if (e && e._d) {
      this.period.display = moment(e._d).format('MMM YYYY');
      this.period.value = moment(e._d).format('YYYY-MM-01');
    }

    this.dashboardConfig.filterProps.map(function (x) {
      if (x.f7Name === 'period' && x.values && x.values.length) {
        x.values[0].id = this.period.value;
        x.values[0].itemName = this.period.display;
      }
    }, this);
  }

  updateFilterConfig(data) {
    console.log('updated value ' + data.f7Name)
    console.log(data);

    // Reset the filters dependent on the current field
    this.dashboardConfig.filterProps.forEach(function (item) {
      if (item.dependentOn.indexOf(data.f7Name) != -1) {
        item.values = [];
      }
    });
  }

  getMonthName(num) {
    switch (num) {
      case '1' : return 'Jan';
      case '2' : return 'Feb';
      case '3' : return 'Mar';
      case '4' : return 'Apr';
      case '5' : return 'May';
      case '6' : return 'Jun';
      case '7' : return 'Jul';
      case '8' : return 'Aug';
      case '9' : return 'Sep';
      case '10' : return 'Oct';
      case '11' : return 'Nov';
      case '12' : return 'Dec';
    }
  }

  getFilter(dashboardType): any {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    let org = this.orgValue;

    console.log('token >>>>')
    console.log(token);

    const headers = new Headers({'Content-Type': 'application/json', 'callingapp' : 'aspen', 'token' : token});
    const options = new RequestOptions({headers: headers});
    return this.http.get(this.api_fs.api + '/api/reports/org/Home%20Depot/template/dashboard?templatename=' + dashboardType + ( org ? ('&org_id=' + org) : ''), options).toPromise()
        .then(data => data.json())
        .catch();
  }

  handleSelect(selectedItem, type) {
    this[type] = [selectedItem];
  }

  handleDeSelect(selectedItem, type) {

  }

  handleRowSelection(rowObj: any, rowData: any) {

  }

  search() {
    this.dataObject.isDataAvailable = false;
    this.showSpinner = true;

    console.log('this.dashboardConfig ####');
    console.log(this.dashboardConfig);

    this.searchDataRequest();
  }

  searchDataRequest() {
    return this.searchData().subscribe(
      response => {
        if (response) {
          console.log(response);
          this.populateDataTable(response, true);
          this.showSpinner = false;
        } else {
          this.showSpinner = false;
        }
      },
      err => {
        if (err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchDataRequest.bind(self)
          );
        } else {
          this.showSpinner = false;
          console.log('err')
          console.log(err);
        }
      }
    );
  }

  searchData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }

    this.selectedPeriod[0].id = this.period.display.split(' ')[1] + '-' + this.getMonthNum(this.period.display.split(' ')[0]) + '-01';
    this.selectedPeriod[0].itemName = this.period.display;

    console.log('this.selectedPeriod >>')
    console.log(this.selectedPeriod);

    console.log('this.period >>')
    console.log(this.period);

    // const dataObj = {
    //     year: "2020",
    //     month: "03",
    //     invoice_header_id: 1376,
    //     order_id: "325",
    //     filters: {
    //       invoice_number: ["120047554", "20USIV04771"],
    //       mk_number: ["1193"],
    //       po_number: ["119"]
    //     }
    // }

    const dataObj: any = {};
    const filters = {};
    this.dashboardConfig.filterProps.forEach(function (filter) {
      if(filter.f7Name !== 'type' && filter.f7Name !== 'period') {
        var newFilter: any = {};
        newFilter.f7Name = filter.f7Name;
        newFilter.values = [];
        if (Object.prototype.toString.call(filter.values) === '[object Array]') {
          if(filter.values.length) {
            var ret = filter.values.map(function (val) {
              return val.id;
            });
            newFilter.values = ret;
          }
        } else if (filter.values) {
          newFilter.values.push(filter.values);
        }

        for (const prop in newFilter) {
          filters[newFilter.f7Name] = newFilter.values;
        }
      }
    }, this);
    dataObj.filters = filters;
    dataObj.year = this.period.display.split(' ')[1];
    dataObj.month = this.getMonthNum(this.period.display.split(' ')[0]);

    console.log('dataObj >>>')
    console.log(dataObj);

    const obj = JSON.stringify(dataObj);
    console.log('obj >>')
    console.log(obj)
    let org = this.orgValue;
    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    const url = this.api_fs.api + '/api/reports/reconciliation' + (org ? ('?org_id=' + org) : '');
    return this.http
      .post(url, obj, options)
      .map(res => {
        return res.json();
      }).share();
  }

  populateDataTable(response, initialLoad) {
    const tableData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    this.headers = [];

    if (tableData.length) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        let header = {
          key: keys[i],
          title: keys[i].replace(/_/g, ' ').toUpperCase(),
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: false,
          width: '150'
        }
        this.headers.push(header);
      }
    }

    const rowsToColor = [];
    if (tableData.length) {
      tableData.forEach(function (data, index) {
        if (data.discrepancy_amount && data.discrepancy_amount > 0) {
          rowsToColor.push({
            index: index,
            'color': 'rgba(255,0,0,0.9)'
            // color: 'rgba(255,255,255,0.9)'
          });
        }
      });
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
    this.gridData.rowsToColor = rowsToColor;
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    this.dataObject.gridId = 'reconciliation';
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  getPeriod() {
    const months = [];
    const monthName = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    const d = new Date();
    for (var i = 0; i <= 12; i++) {
      var monthVal = (d.getMonth() + 1).toString().length === 1 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1);

      const existingMonth = months.find(x => x.id === d.getFullYear() + '-' + monthVal + '-' + '01');
      if (!existingMonth) {
        months.push({
          id: d.getFullYear() + '-' + monthVal + '-' + '01',
          itemName: monthName[d.getMonth()] + ' ' + d.getFullYear()
        });
      }
      d.setMonth(d.getMonth() - 1);
    }
    return months;
  }

  getChannel() {
    const channel = [];
    channel.push({ id: 'pinterest', itemName: 'Pinterest' });
    channel.push({ id: 'facebook', itemName: 'Facebook' });
    channel.push({ id: 'google', itemName: 'Google' });
    return channel;
  }

  reLoad() {
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }
  handleRow(rowObj: any, rowData: any) {
    if (this[rowObj.action])
      this[rowObj.action](rowObj);
  }
  handleRun(dataObj: any) {
    console.log('dataObj.data >>')
    console.log(dataObj.data);
    const invoiceId = dataObj.data.invoice_header_id;
    if (invoiceId) {
      this.selectedInvoiceNumber = dataObj.data.invoice_number;
      this.selectedInvoice = invoiceId;
      this.selectedSupplier = dataObj.data.supplier;
      this.hideTable = true;
      // this.router.navigate(['/app/admin/invoices/invoice/' + invoiceId]);
    } else {
      Swal({
        title: 'No invoice ID found',
        text: 'We did not find an invoice id',
        type: 'error'
      });
    }
  }

  handleDownload(dataObj: any) {
    console.log('dataObj >>')
    console.log(dataObj);
    const downloadId = dataObj.data.reference_number;
    const invoiceId = dataObj.data.invoice_header_id;
    if (downloadId) {
      this.searchDownloadLink(downloadId, invoiceId);
    } else {
      Swal({
        title: 'No downloadable link available',
        text: 'We did not find a download link for that invoice',
        type: 'error'
      });
    }
  }
  searchDownloadLink(downloadId, invoiceId) {
    this.getDownloadLink(downloadId).subscribe(
      response => {
        if (response && response.data && response.data.pre_signed_url) {
          const link = document.createElement('a');
          link.setAttribute('href', response.data.pre_signed_url);
          link.setAttribute('target', '_blank');
          document.body.appendChild(link);
          link.click();
        } else {
          Swal({
            title: 'No downloadable link available',
            text: 'We did not find a download link for that invoice',
            type: 'error'
          });
        }
      },
      err => {
        if (err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchDownloadLink.bind(self, downloadId, invoiceId)
          );
        } else {
          Swal({
            title: 'Unable to download the invoice',
            text: 'We were enable to download details of invoice: ' + invoiceId + '. Please try again',
            type: 'error'
          });
          this.showSpinner = false;
        }
      });
  }

  getDownloadLink(downloadId) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const data = JSON.stringify({
      'reference_id': downloadId
    });

    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    var url = this.api_fs.api + '/api/reports/download';
    return this.http
      .post(url, data, options)
      .map(res => {
        return res.json();
      }).share();
  }

  apiMethod = (table, pageLength, csv?) => {
    this.options[0].isDisplayStart = table && table.page.info().start ? table.page.info().start : 0;

    if (csv) {
      this.searchDataRequestCsv(null, table);
    }
    else
      this.searchDataRequest();
  }

  searchDataRequestCsv(org = null, table?) {

    return this.getRecCSV()
      .subscribe(
        (res) => {
          this.hasData = true;
          this.successCBCsv(res, table)
        },
        (err) => {
          this.showSpinner = false;
          this.errorCB(err)

          if (err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDataRequestCsv.bind(self, org, table)
            );
          } else {
            this.showSpinner = false;
          }
        }
      );
  }

  successCBCsv(res, table) {
    // Set this.response, before calc
    let rows = res.data.invoices;
    // let li = this.calc(res, table);
    console.log("Download Csv Here...");

    let arr: Array<String> = [];

    if (rows && rows.length) {
      rows.filter(res => delete res['lineItems']);
      rows.filter(res => delete res['profiles']);
      const filRows = rows.filter(res => delete res['orders']);
      console.log(filRows);

      arr.push(Object.keys(filRows[0]).join(",").replace(/_/g, ' ').toUpperCase());
      let dataRows = filRows.map((k, v) => { return Object.values(k).join(", "); })
      arr = arr.concat(dataRows);
    }
    let csvStr: String = "";
    csvStr = arr.join("\n");

    // var data = encode(csvStr);
    let b64 = btoa(csvStr as string);
    let a = "data:text/csv;base64," + b64;
    $('<a href=' + a + ' download="data.csv">')[0].click();

    return arr;
  }

  errorCB(rej) {
    console.log("errorCB: ", rej)
  }
  getRecCSV(invoice_header_id?) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const year = this.selectedPeriod[0].id.split('-')[0];
    const month = this.selectedPeriod[0].id.split('-')[1]
    let invoice_param = "";
    if (invoice_header_id) {
      invoice_param = "&invoice_header_id=" + invoice_header_id;
    }
    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    const url = this.api_fs.api + '/api/reports/reconciliation/export?year=' + year + '&month=' + month + invoice_param;
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }
  showReDashboard() {
    this.hideTable = false;
    this.selectedInvoice = null;
    this.selectedInvoiceNumber = null;
  }

  handleCustom(dataObj: any) {
    let invoice_header_id = "";
    if (dataObj.data.invoice_header_id) {
      invoice_header_id = dataObj.data.invoice_header_id;
    }
    return this.getRecCSV(invoice_header_id)
      .subscribe(
        (res) => {
          if (res.data.orders && res.data.orders.length) {
            this.hasData = true;
            this.invoiceOrderCsv(res.data.orders);
          } else if (res.data.profiles && res.data.profiles.length) {
            let orders = [];
            let profiles = res.data.profiles;
            profiles.forEach(function (data, index) {
              if (data.orders && data.orders.length) {
                data.orders.forEach(function (ordData, index) {
                  orders.push(ordData);
                });
              }
            });
            if (orders) {
              this.hasData = true;
              this.invoiceOrderCsv(orders);
            } else {
              Swal({
                title: 'No downloadable link available',
                text: 'We did not find a download link for that invoice',
                type: 'error'
              });
            }
          } else {
            Swal({
              title: 'No downloadable link available',
              text: 'We did not find a download link for that invoice',
              type: 'error'
            });
          }
        },
        (err) => {
          this.showSpinner = false;
          this.errorCB(err)
          if (err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.handleCustom.bind(self, dataObj)
            );
          } else {
            this.showSpinner = false;
          }
        }
      );
  }

  handleCustom2(dataObj: any) {
    const invoiceId = dataObj.data.invoice_header_id;
    if (invoiceId) {
      this.selectedInvoiceNumber = dataObj.data.invoice_number;
      this.selectedInvoiceHeaderId = dataObj.data.invoice_header_id;
      this.selectedSES = dataObj.data.ses_number;
      this.SES.show();
    }
  }

  handleSubmitSES() {
    if (!this.selectedSES) {
      Swal({
        title: 'No SES Number Provided',
        html: 'Please enter a value',
        type: 'error'
      });
      return;
    }
    this.submitSES().subscribe(
        response => {
          this.handleCloseSES();
          Swal({
            title: 'Success',
            html: response.message ? response.message : 'SES number successfully updated',
            type: 'success'
          }).then( () => {
            this.reLoad();
          });
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.submitSES.bind(self)
            );
          } else {
            this.showSpinner = false;
            Swal({
              title: 'An error occurred',
              html: err._body ? JSON.parse(err._body).message : 'No error definition available',
              type: 'error'
            });
          }
        });
  }

  submitSES() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const data = JSON.stringify({
      invoice_header_id : this.selectedInvoiceHeaderId,
      ses_number : this.selectedSES
    });

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const url = this.api_fs.api + '/api/payments/invoices/update';
    return this.http
        .put(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }

  handleCloseSES() {
    this.selectedInvoiceNumber = null;
    this.selectedInvoiceHeaderId = null;
    this.selectedSES = null;
    this.SES.hide();
  }

  invoiceOrderCsv(res) {
    let rows = res;
    let arr: Array<String> = [];
    if (rows && rows.length) {
      rows.filter(res => delete res['lineItems']);
      rows.filter(res => delete res['profiles']);
      const filRows = rows.filter(res => delete res['orders']);
      console.log(filRows);
      arr.push(Object.keys(filRows[0]).join(",").replace(/_/g, ' ').toUpperCase());
      let dataRows = filRows.map((k, v) => { return Object.values(k).join(", "); })
      arr = arr.concat(dataRows);
    }
    let csvStr: String = "";
    csvStr = arr.join("\n");
    // var data = encode(csvStr);
    let b64 = btoa(csvStr as string);
    let a = "data:text/csv;base64," + b64;
    $('<a href=' + a + ' download="data.csv">')[0].click();
    return arr;
  }

  handleShowModal(modalComponent: PopUpModalComponent) {
    this.getChannelEmails();
    modalComponent.show();
  }

  OnSelectValueChange(e) {
    if (e.value && e.value !== this.uploadModel.channel) {
      this.uploadModel.channel = e.value;
      const corrObj = this.channelOptions.find(x => x.id == this.uploadModel.channel);
      if (corrObj && corrObj.email) {
        this.uploadModel.emails = [{ display: corrObj.email, value: corrObj.email }];
      } else {
        this.uploadModel.emails = [];
      }
      // if (corrObj && corrObj.email && corrObj.email.length) {
      //     this.uploadModel.emails = corrObj.email.map(function (email) {
      //         return { display: email, value: email};
      //     });
      // }
    }
  }

  getChannelEmails() {
    this.channelEmails().subscribe(
      response => {
        if (response && response.data && response.data.length) {
          this.channelOptions = response.data.map(function (d) {
            return { id: d.channel_id, text: d.channel, email: d.email };
          });
          this.channelOptions.splice(0, 0, {
            id: '', text: 'Empty', email: ''
          });
        }
      },
      err => {
        if (err.status === 401) {
          const self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            this.getChannelEmails.bind(self)
          );
        } else {
          this.showSpinner = false;
        }
      });
  }

  handleCloseModal(modalComponent: PopUpModalComponent) {
    modalComponent.hide();
  }

  _updateDataModel(e) {
    this.uploadModel.emails = e.dataModel;
  }

  OnProcessFile(e) {
    this.convertToBase64(e);
  }

  convertToBase64(file): void {
    const __this = this;
    this.uploadModel.file = file;
    const myReader = new FileReader();
    myReader.onloadend = (e) => {
      __this.uploadModel.fileAsBase64 = myReader.result;
      __this.uploadModel.fileAsBase64 = __this.uploadModel.fileAsBase64.indexOf(',') !== -1 ? __this.uploadModel.fileAsBase64.split(',')[1] : __this.uploadModel.fileAsBase64;
    };
    myReader.readAsDataURL(file);
  }

  OnUpload(modalComponent: PopUpModalComponent) {
    this.showSpinner = true;
    this.performChannelEmailUpdate(modalComponent);
    this.performChannelInvoiceUpload(modalComponent);
  }

  performChannelEmailUpdate(modalComponent: PopUpModalComponent) {
    this.updateChannelEmails().subscribe(
      response => {
        if (response) {
        }
      },
      err => {
        if (err.status === 401) {
          const self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            this.performChannelEmailUpdate.bind(self)
          );
        } else {
          // Swal({
          //     title: 'Invoice email failed',
          //     text: 'There was an error emailing the invoice. Please try again',
          //     type: 'error'
          // })
          this.showSpinner = false;
        }
      });
  }

  performChannelInvoiceUpload(modalComponent: PopUpModalComponent) {
    this.uploadFile().subscribe(
      response1 => {
        if (response1) {
          this.showSpinner = false;
          Swal({
            title: 'Invoice emailed successfully',
            text: 'Invoice has been successfully emailed',
            type: 'success'
          }).then(() => {
            modalComponent.hide();
            this.uploadModel.file = '';
            this.uploadModel.fileAsBase64 = '';
            this.uploadModel.emails = [];
            this.uploadModel.channel = '';
          });
        }
      },
      err => {
        if (err.status === 401) {
          const self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            this.performChannelInvoiceUpload.bind(self)
          );
        } else {
          Swal({
            title: 'Invoice email failed',
            text: 'There was an error emailing the invoice. Please try again',
            type: 'error'
          })
          this.showSpinner = false;
        }
      });
  }

  validated() {
    let valid = true;
    for (const prop in this.uploadModel) {
      if (prop !== 'comments') {
        if (Object.prototype.toString.call(this.uploadModel[prop]) === '[object Array]' && !this.uploadModel[prop].length) {
          valid = false;
        } else if (!this.uploadModel[prop]) {
          valid = false;
        }
      }
    }
    return valid;
  }

  channelEmails() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    const url = this.api_fs.api + '/api/payments/invoices/channels';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }

  updateChannelEmails() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    let channel = '';
    const corrObj = this.channelOptions.find(x => x.id == this.uploadModel.channel);
    if (corrObj) {
      channel = corrObj.id;
    }

    const data = JSON.stringify({
      channel_id: channel,
      email: this.uploadModel.emails[0].value
      // email : this.uploadModel.emails.map(function (email) {
      //     return email.value;
      // }),
    });

    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    const url = this.api_fs.api + '/api/payments/invoices/channels';
    return this.http
      .put(url, data, options)
      .map(res => {
        return res.json();
      }).share();
  }

  uploadFile() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    let channel = '';
    const corrObj = this.channelOptions.find(x => x.id == this.uploadModel.channel);
    if (corrObj) {
      channel = corrObj.id;
    }

    const data = JSON.stringify({
      channel_id: channel,
      file: this.uploadModel.fileAsBase64,
      fileName: this.uploadModel.file.name
    });

    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    const url = this.api_fs.api + '/api/payments/invoices/channels/email';
    return this.http
      .post(url, data, options)
      .map(res => {
        return res.json();
      }).share();
  }
  searchOrgRequest() {
    return this.searchOrgData().subscribe(
      response => {
        if (response && response.data) {
          response.data.forEach(function (ele) {
            this.orgArr.push({
              id: ele.org_uuid,
              itemName: ele.org_name
            });
          }, this);
        }
      },
      err => {

        if (err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchOrgRequest.bind(self)
          );
        } else {
          this.showSpinner = false;
        }
      }
    );
  }
  searchOrgData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    var url = this.api_fs.api + '/api/orgs';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }
  handleOrgSelect(selectedItem, type) {
    if (selectedItem.id) {
      console.log("Org", selectedItem);
      this.selectedOrg = [selectedItem];
      this.ngOnInit();
    }
  }

  handleOrgDeSelect(selectedItem, type) {
    this.selectedOrg = [{}];
    this.orgValue = "";
    this.ngOnInit();
  }
  handleDelete(dataObj: any) {
    Swal({
      title: 'Are you sure you want to delete this invoice?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.value) {
        this.deleteInvoice(dataObj.data.invoice_header_id);
      }
    });
  }
  deleteInvoice(invoiceId){
    return this.deleteInvoiceReq(invoiceId).subscribe(
      response => {
        if (response) { Swal({
          title: 'Invoice deleted successfully',
          text: 'Invoice has been deleted successfully',
          type: 'success'
        }).then( () => {
          this.reLoad();
        });
        }
      },
      err => {
        if (err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchOrgRequest.bind(self)
          );
        } else {
          this.showSpinner = false;
        }
      }
    );
  }
  deleteInvoiceReq(invoiceId) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    var url = this.api_fs.api + '/api/payments/invoices/'+invoiceId;
    return this.http
      .delete(url, options)
      .map(res => {
        return res.json();
      }).share();
  }

  getMonthNum(name) {
    switch (name) {
      case 'Jan' : return '01';
      case 'Feb' : return '02';
      case 'Mar' : return '03';
      case 'Apr' : return '04';
      case 'May' : return '05';
      case 'Jun' : return '06';
      case 'Jul' : return '07';
      case 'Aug' : return '08';
      case 'Sep' : return '09';
      case 'Oct' : return '10';
      case 'Nov' : return '11';
      case 'Dec' : return '12';
    }
  }
}
