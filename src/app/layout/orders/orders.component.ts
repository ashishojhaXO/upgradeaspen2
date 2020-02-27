/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-02-27 14:54:37
 */

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import Swal from 'sweetalert2';
import { GenericService } from '../../../services/generic.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  providers: [GenericService],
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit  {

  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isRowHighlight: false,
    isDownloadAsCsv: true,
    isDownloadOption: {
      value: true,
      icon: '',
      dependency: ['Vendor_Receipt_Id'],
      tooltip: 'Download Vendor Receipt'
    },
    fixedColumn: 1,
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: true,
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 0, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    isOrder: [[2, 'asc']],
    isHideColumns: [ "Vendor_Receipt_Id"],


    // TODO: Check for PageLen change event also...
    // isApiCallForNextPage: {
    //   value: true,
    //   apiMethod: (table) => {
    //     console.log(
    //       "apiMethod here, table here: ", table, 
    //       " this: ", this, " run blah: ", this.getOrders()
    //     );
    //     // Make ApiCall to backend with PageNo, Limit, 
    //   }
    // }

  }];
  dashboard: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;

  @ViewChild ( AppDataTable2Component )
  private appDataTable2Component : AppDataTable2Component;
  selectedRow: any;

  constructor(
    private okta: OktaAuthService, 
    private route: ActivatedRoute, 
    private router: Router, 
    private genericService: GenericService,
    private http: Http) {
  }


  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchDataRequest();
  }

  cancelOrder() {
    // const res = OrderService.cancelOrder(id)
    // return res.subscribe( order => console.log(`Order id: ${order.id} cancelled`) )
    console.warn("Not Implemented: Call to Cancel service yet to be implemented...");
  }

  redirectToModifyOrderPage() {
    if(this.selectedRow && this.selectedRow.rowIndex) {
      const pageId = this.selectedRow.rowIndex;
      this.router.navigate([`../order/${pageId}`], { relativeTo: this.route } );
    }
  }

  // Recursively call this.main function where
  // the 401 response came in
  // Error CBs
  errorCallback = function (err) {
    console.log('error >>', err);
    console.log(err);
  }
  // Success & Error CBs/

  searchDataRequest() {
    const self = this;
    return this.searchData().subscribe(
        response => {
          if (response) {
            if (response) {
              this.populateDataTable(response, true);
              this.showSpinner = false;
            }
          }
        },
        err => {
          if(err.status === 401) {
            console.log("this:  ", this, "this.widget:", this.widget)
            this.widget.refreshElseSignout(
              this,
              err, 
              self.searchDataRequest.bind(self), 
              self.errorCallback.bind(self) 
            );
          } else {
            this.showSpinner = false;
          }

        }
    );
  }

  searchData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/line-items';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  populateDataTable(response, initialLoad) {
    const tableData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    const headers = [];

    if (tableData.length) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        headers.push({
          key: keys[i],
          title: keys[i].replace(/_/g,' ').toUpperCase(),
          data: keys[i],
          isFilterRequired: true,
          isCheckbox: false,
          class: 'nocolvis',
          editButton: false,
          width: '150'
        });
      }
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];
    this.gridData.columnsToColor = [
      { index: 11, name: 'MERCHANT PROCESSING FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 15, name: 'LINE ITEM MEDIA BUDGET', color: 'rgb(47,132,234,0.2)'},
      { index: 16, name: 'KENSHOO FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 17, name: 'THD FEE', color: 'rgb(47,132,234,0.2)'},
      { index: 10, name: 'LINE ITEM TOTAL BUDGET', color: 'rgb(47,132,234,0.4)'}
    ];
    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleCheckboxSelection(rowObj: any, rowData: any) {
    this.selectedRow = rowObj;
  }

  handleUnCheckboxSelection(rowObj: any, rowData: any) {
    this.selectedRow = null;
  }

  handleRow(rowObj: any, rowData: any) {
    if(this[rowObj.action])
      this[rowObj.action](rowObj);
  }

  handleDownload(dataObj: any) {
    const downloadId = dataObj.data.Vendor_Receipt_Id;
    const orderId = dataObj.data.Order_Id;

    console.log('dataObj >>')
    console.log(dataObj);

    if (downloadId) {
      this.searchDownloadLink(downloadId, orderId);
    } else {
      Swal({
        title: 'No downloadable link available',
        text: 'We did not find a download link for that order',
        type: 'error'
      });
    }
  }

  searchDownloadLink(downloadId, orderId) {
    var self = this;
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
              text: 'We did not find a download link for that order',
              type: 'error'
            });
          }
        },
        err => {
          if(err.status === 401) {
            this.widget.refreshElseSignout(
              this,
              err, 
              self.searchDownloadLink.bind(self, downloadId, orderId), 
              self.errorCallback.bind(self)
            );
          } else {
            Swal({
              title: 'Unable to download the order details',
              text: 'We were enable to download details of order: ' + orderId  + '. Please try again',
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

  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }

  successCB(res) {
    console.log("getOrders successCB: res ", res)
    // console.log( " res.json(): ", res.json())
    this.populateDataTable(res.data.rows, false);

  }

  errorCB(rej) {
    console.log("getOrders errorCB: ", rej)
  }

  getOrders() {
    console.log("BLAH")

    let data = {};

    this.genericService.getOrders(data)
    .subscribe(
      (res) => {
        this.showSpinner = false;
        // this.successCB.apply(this, [res])
        this.successCB(res)
      },
      (rej) => {
        this.showSpinner = false;
        this.errorCB(rej)
      }
    )

  }

}
