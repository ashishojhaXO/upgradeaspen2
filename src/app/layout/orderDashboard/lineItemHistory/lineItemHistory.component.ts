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
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../../services/okta.service';
import Swal from 'sweetalert2';
import {PopUpModalComponent} from '../../../shared/components/pop-up-modal/pop-up-modal.component';

@Component({
  selector: 'app-line-item-history',
  templateUrl: './lineItemHistory.component.html',
  styleUrls: ['./lineItemHistory.component.scss']
})
export class LineItemHistoryComponent implements OnInit  {

  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  gridData: any;
  dataObject: any = {};
  @Input() lineItemID: any;
  @Input() displayLineItemID: any;
  lineItemDetails = [];
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: false,
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isRowHighlight: true,
    isDownloadAsCsv: true,
    // Commenting out fixedColumn, as we need subRow isTree children child row, to show action buttons
    // NOTE: FixedColumn's Structure Changed
    // fixedColumn: 1,
    // isFixedColumn: {
    //   fixedColumns: {
    //     leftColumns: 1,
    //   },
    //   fixedColumnFunc: (ev, $, table ) => {
    //     // Util.DataTable.Func
    //     DataTableUtilsPluginExt.fixedColumnFunc(ev, $, table);
    //   },
    // },
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: false,
    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 0, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    // isOrder: [[3, 'asc']],
    // isOrder: [[3, 'desc']],
    // isOrder: [[3, 'name-string-not-nullund-desc']],
    isTree: false
  }];

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchDataRequest(this.lineItemID);
  }

  searchDataRequest(lineItemID) {
    let self = this;
    this.searchData(lineItemID).subscribe(
        response => {
          this.lineItemDetails = this.filterResults(response.data.line_items);
          this.populateDataTable(this.lineItemDetails);
          this.showSpinner = false;
        },
        err => {

          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.searchDataRequest.bind(self, lineItemID),
            );
          } else {
            // Swal({
            //   title: 'No Invoices found',
            //   text: 'We did not find any invoices associated with ID : ' + invoiceId,
            //   type: 'error'
            // }).then( () => {
            //  // this.router.navigate(['/app/admin/invoices']);
            // });
             this.showSpinner = false;
          }
        }
    );
  }

  filterResults(lineItemDetails) {
    const newLineArr = [];
    lineItemDetails.forEach(function (line) {
      const newLine = {};
      for (const prop in line) {
        if (prop === 'Line_Item_Total_Budget' || prop === 'Merchant_Processing_Fee' || prop === 'Status' || prop === 'Amount_Received_On_GMT'
        || prop === 'Line_Item_Start_Date' || prop === 'Line_Item_End_Date' || prop === 'Amount_Received' || prop === 'Available_Total_Line_Item_Budget'
        || prop === 'Line_Item_Media_Budget' || prop === 'Media_Services_Fee' || prop === 'THD_Fee' || prop === 'Merchant_Processing_Fee' || prop === 'Total_Platform_Cost' || prop === 'record_type') {
          // if (prop === 'Amount_Received_On_GMT') {
          //   newLine['line item extension budget received date'] = line[prop];
          // } else if (prop === 'Line_Item_Start_Date') {
          //   newLine['line item extension start date'] = line[prop];
          // } else if (prop === 'Line_Item_End_Date') {
          //   newLine['line item extension end date'] = line[prop];
          // } else if (prop === 'Amount_Received') {
          //   newLine['line item extension budget'] = line[prop];
          // } else {
          //   newLine[prop] = line[prop];
          // }

          newLine[prop] = line[prop];
        }
      }
      newLineArr.push(newLine);
    });
    return newLineArr;
  }

  populateDataTable(response) {

    console.log('response >>')
    console.log(response);

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
    this.dataObject.gridData = this.gridData;
    this.dataObject.gridId = 'lineItemHistory';
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  searchData(lineItemID) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    const data: any = {
      line_item_id : lineItemID
    };
    var url = this.api_fs.api + '/api/orders/history' ;
    return this.http
        .post(url, data, options)
        .map(res => {
          return res.json();
        }).share();
  }
}
