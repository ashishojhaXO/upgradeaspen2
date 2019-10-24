import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableOptions} from '../../../models/dataTableOptions';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';
import { OrdersComponent } from '../orders/orders.component';

@Component({
  selector: 'app-orders-processed',
  templateUrl: './orders-processed.component.html',
  styleUrls: ['./orders-processed.component.css']
})
export class OrdersProcessedComponent extends OrdersComponent {

  // gridData: any;
  // dataObject: any = {};
  // isDataAvailable: boolean;
  // height: any;
  // options: Array<any> = [{
  //   isSearchColumn: true,
  //   isTableInfo: true,
  //   isEditOption: false,
  //   isDeleteOption: false,
  //   isAddRow: false,
  //   isColVisibility: true,
  //   isDownload: true,
  //   isRowSelection: {
  //     isMultiple : false,
  //   },
  //   isPageLength: true,
  //   isPagination: true,
  // }];
  // dashboard: any;
  // api_fs: any;
  // externalAuth: any;
  // showSpinner: boolean;
  // widget: any;
  // selectedRow: any;

  constructor(okta: OktaAuthService, route: ActivatedRoute, router: Router, http: Http) { 
    super(okta, route, router, http)

    // Initializing some data
    this.init();
  }

  init() {
    const options = {
      isEmailOption: true,
      isPlayOption: true,
      isDownloadOption: true,
    }
    this.options[0] = Object.assign( {}, this.options[0], options);

    console.log("options: ", this.options);
  }

  columnsToShow: string[] = ["Vendor", "Order ID", "End Date", "Created At (GMT)"];

  ngOnInit() {
    console.log("NGON ININ")
    super.ngOnInit();
  }

  populateDataTable(response, initialLoad) {
    console.log("Pro popDT resp", response);
    const tableData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    const headers = [];


    if (tableData.length) {
      const keys = Object.keys(tableData[0]);
      for (let i = 0; i < keys.length; i++) {
        if ( this.columnsToShow.indexOf(keys[i]) !== -1 ) {
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

    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];

    // this.gridData.columnsToColor = [
    //   { index: 11, name: 'MERCHANT PROCESSING FEE', color: 'rgb(47,132,234,0.2)'},
    //   { index: 15, name: 'LINE ITEM MEDIA BUDGET', color: 'rgb(47,132,234,0.2)'},
    //   { index: 16, name: 'KENSHOO FEE', color: 'rgb(47,132,234,0.2)'},
    //   { index: 17, name: 'THD FEE', color: 'rgb(47,132,234,0.2)'},
    //   { index: 10, name: 'LINE ITEM TOTAL BUDGET', color: 'rgb(47,132,234,0.4)'}
    // ];

    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    console.log("griididiidid: ", this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;

  }

  handleEmail(dataObj: any) {
    console.log("Handle Email Option");
  }

  random() {

  }

  handleRun(dataObj: any) {
    const reportId = dataObj.data.id;
    this.runReport(reportId).subscribe(response => {
      console.log(response);
      this.dataObject.isDataAvailable = false;
      // this.populateReportDataTable();
      this.random();
    }, error => {
     // const message = JSON.parse(error._body).message;
     // this.toastr.error('ERROR!', message);
    });
  }

  runReport(reportId) {
    const AccessToken: any = this.widget.tokenManager.get('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const data = { "adhoc_report_id" : reportId};

    var url = this.api_fs.api + '/api/reports/adhoc/reexecute';
    return this.http
        .post(url, data, options);
  }

  handleDownload(dataObj: any) {
    const link = document.createElement('a');
    link.setAttribute('href', dataObj.data.downloadurl);
    document.body.appendChild(link);
    link.click();
  }

}
