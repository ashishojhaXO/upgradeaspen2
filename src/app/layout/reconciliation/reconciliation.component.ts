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
import {Router, ActivatedRoute} from '@angular/router';
import {PopUpModalComponent} from '../../shared/components/pop-up-modal/pop-up-modal.component';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import Swal from 'sweetalert2';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss']
})
export class ReconciliationComponent implements OnInit  {

  headers: any = [];
  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: any = [{
      isSearchColumn: true,
      isTableInfo: true,
      isCustomOption: {
        value : true,
        icon : 'fa-arrow-circle-o-down',
        tooltip: 'Download'
      },
      isDeleteOption: false,
      isAddRow: false,
      isColVisibility: true,
      isDownloadAsCsv: true,
      isDownloadAsCsvFunc: ( table, pageLength, csv?) => {
        this.apiMethod(table, pageLength, csv);
      },
      isDownloadOption: {
        value: true,
        icon: '',
        tooltip: 'View/Download Invoice'
      },
      isPlayOption: {
        value : true,
        icon : 'fa-plus-square',
        tooltip: 'View'
      },
      isRowSelection: null,
      isPageLength: true,
      isPagination: true,
      isHideColumns: [ "invoice_header_id"]
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
  selectedSupplier:any;

  settings: any = {
        singleSelection: true,
        text: 'Select ' ,
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
    hasData: boolean;
    selectedInvoiceDetails: any;
    memo: string;
    @ViewChild('UploadInvoice') uploadInvoice: PopUpModalComponent;
    uploadForm: FormGroup;
    uploadModel: any;
    select2Options = {
        placeholder: { id: '', text: 'Select a channel' }
    };
    channelOptions = [
        { id: '', text: 'Empty'},
        { id: 8, text: 'facebook'},
        { id: 101, text: 'Dynamic Media - Google'},
        { id: 1, text: 'Facebook'},
        { id: 7, text: 'Dynamic Media - Pinterest'},
        { id: 5, text: 'Pinterest'},
        { id: 4, text: 'Google'},
        { id: 102, text: 'Display'},
        { id: 31, text: 'Facebook'},
        { id: 33, text: 'Pinterest'}
    ];

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {

      this.uploadModel = {
          channel: '',
          emails: [],
          comments: '',
          file: '',
          fileAsBase64: ''
      };
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.periodData = this.getPeriod();
    this.selectedPeriod = [this.periodData[1]];
    this.channelData = this.getChannel();
    this.selectedChannel = [this.channelData[0]];
    this.searchDataRequest();
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
        this.searchDataRequest();
    }

   searchDataRequest() {
      return this.searchData().subscribe(
        response => {
            if (response) {
              console.log(response);
                this.populateDataTable(response, true);
                this.showSpinner = false;
            }else{
                this.showSpinner = false;
            }
        },
        err => {
          if(err.status === 401) {
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
    const dataObj = {
        year: this.selectedPeriod[0].id.split('-')[0],
        month: this.selectedPeriod[0].id.split('-')[1]
    }
    const obj = JSON.stringify(dataObj);
    console.log('obj >>')
    console.log(obj)
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const url = this.api_fs.api + '/api/reports/reconciliation';
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
          title: keys[i].replace(/_/g,' ').toUpperCase(),
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
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  getPeriod() {
        const months = [];
        const monthName = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
        const d = new Date();
        for (var i=0; i<=12; i++) {
            var monthVal = (d.getMonth() + 1).toString().length === 1 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1);

            const existingMonth = months.find(x=> x.id === d.getFullYear() + '-' + monthVal + '-' + '01');
            if(!existingMonth) {
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
        channel.push({ id: 'pinterest', itemName: 'Pinterest'});
        channel.push({ id: 'facebook', itemName: 'Facebook'});
        channel.push({ id: 'google', itemName: 'Google'});
        return channel;
    }

    reLoad(){
      this.showSpinner = true;
      this.dataObject.isDataAvailable = false;
      this.searchDataRequest();
    }
    handleRow(rowObj: any, rowData: any) {
      if(this[rowObj.action])
        this[rowObj.action](rowObj);
    }
    handleRun(dataObj: any) {
      console.log('dataObj.data >>')
      console.log(dataObj.data);
      const invoiceId = dataObj.data.invoice_header_id;
      if (invoiceId) {
        this.selectedInvoiceNumber = dataObj.data.invoice_number;
        this.selectedInvoice = invoiceId;
        this.selectedSupplier= dataObj.data.supplier;
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
            if(err.status === 401) {
              let self = this;
              this.widget.refreshElseSignout(
                this,
                err,
                self.searchDownloadLink.bind(self, downloadId, invoiceId)
              );
            } else {
              Swal({
                title: 'Unable to download the invoice',
                text: 'We were enable to download details of invoice: ' + invoiceId  + '. Please try again',
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

      const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
      const options = new RequestOptions({headers: headers});
      var url = this.api_fs.api + '/api/reports/download';
      return this.http
          .post(url, data, options)
          .map(res => {
            return res.json();
          }).share();
    }

    apiMethod = (table, pageLength, csv?) => {
      this.options[0].isDisplayStart = table && table.page.info().start ? table.page.info().start : 0;

      if(csv){
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

          if(err.status === 401) {
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

        arr.push(Object.keys(filRows[0]).join(",").replace(/_/g,' ').toUpperCase());
        let dataRows = filRows.map( (k, v) => { return Object.values(k).join(", "); } )
        arr = arr.concat(dataRows);
      }
      let csvStr: String = "";
      csvStr = arr.join("\n");

      // var data = encode(csvStr);
      let b64 = btoa(csvStr as string);
      let a = "data:text/csv;base64," + b64;
      $('<a href='+a+' download="data.csv">')[0].click();

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
      let invoice_header_id="";
      if(dataObj.data.invoice_header_id){
        invoice_header_id=dataObj.data.invoice_header_id;
      }
      return this.getRecCSV(invoice_header_id)
        .subscribe(
          (res) => {
            if(res.data.orders && res.data.orders.length){
            this.hasData = true;
            this.invoiceOrderCsv(res.data.orders);
            }else if(res.data.profiles && res.data.profiles.length){
              let orders=[];
              let profiles=res.data.profiles;
              profiles.forEach(function (data, index) {
                if (data.orders && data.orders.length) {
                  data.orders.forEach(function (ordData, index) {
                       orders.push(ordData);
                  });
                }
            });
            if(orders){
              this.hasData = true;
              this.invoiceOrderCsv(orders);
            }else{
              Swal({
                title: 'No downloadable link available',
                text: 'We did not find a download link for that invoice',
                type: 'error'
              });
            }
            }else{
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
        modalComponent.show();
    }

    OnSelectValueChange(e) {
        if (e.value && e.value !== this.uploadModel.channel) {
            this.uploadModel.channel = e.value;
            this.getChannelEmails();
        }
    }

    getChannelEmails() {
        this.channelEmails().subscribe(
            response => {
                if (response && response.data && response.data.length) {
                   const corrObj =  response.data.find(x => x.channel_id === this.uploadModel.channel);
                   if (corrObj && corrObj.email && corrObj.email.length) {
                       this.uploadModel.emails = corrObj.email.map(function (email) {
                           return { display: email, value: email};
                       });
                   }
                }
            },
            err => {
                if(err.status === 401) {
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
        this.updateChannelEmails().subscribe(
            response => {
                if (response) {
                    this.uploadFile().subscribe(
                        response1 => {
                            if (response1) {
                                this.showSpinner = false;
                                Swal({
                                    title: 'Invoice emailed successfully',
                                    text: 'Invoice has been successfully emailed',
                                    type: 'success'
                                }).then( () => {
                                    modalComponent.hide();
                                    this.uploadModel.file = null;
                                });
                            }
                        },
                        err => {
                            if(err.status === 401) {
                                const self = this;
                                this.widget.refreshElseSignout(
                                    this,
                                    err,
                                    this.OnUpload.bind(self, modalComponent)
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
            },
            err => {
                if(err.status === 401) {
                    const self = this;
                    this.widget.refreshElseSignout(
                        this,
                        err,
                        this.OnUpload.bind(self, modalComponent)
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

    uploadFile() {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }
        const data = JSON.stringify({
            channel : this.uploadModel.channel,
            file: this.uploadModel.fileAsBase64,
            fileName: this.uploadModel.file.name
        });

        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
        const options = new RequestOptions({headers: headers});
        const url = this.api_fs.api + '/api/payments/invoices/channels/email';
        return this.http
            .post(url, data, options)
            .map(res => {
                return res.json();
            }).share();
    }

    channelEmails() {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }

        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
        const options = new RequestOptions({headers: headers});
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

        const data = JSON.stringify({
            channel_id : this.uploadModel.channel,
            email : this.uploadModel.emails.map(function (email) {
                return email.value;
            }),
        });

        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
        const options = new RequestOptions({headers: headers});
        const url = this.api_fs.api + '/api/payments/invoices/channels';
        return this.http
            .put(url, data, options)
            .map(res => {
                return res.json();
            }).share();
    }
}
