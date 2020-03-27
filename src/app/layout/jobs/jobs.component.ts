/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav, Ashish Ojha
 * Date: 2020-03-26 17:49:00
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
import { AppPopUpComponent } from '../../shared/components/app-pop-up/app-pop-up.component';
import { PopUpModalComponent } from '../../shared/components/pop-up-modal/pop-up-modal.component';
import { modalConfigDefaults } from 'ngx-bootstrap/modal/modal-options.class';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
  providers: [GenericService, AppPopUpComponent]
})
export class JobsComponent implements OnInit {

  // constructor(

  // ) { }

  // ngOnInit() {
  // }

  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    // isEditOption: {
    //   value : true,
    //   icon : '',
    //   tooltip: 'Edit Jobs'
    // },
    isPlayOption: {
      value: true,
      tooltip: "Execute Job",
    },
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isRowHighlight: false,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: true,

    // Any number starting from 1 to ..., but not 0
    isActionColPosition: 0, // This can not be 0, since zeroth column logic might crash
    // since isActionColPosition is 1, isOrder is also required to be sent,
    // since default ordering assigned in dataTable is [[1, 'asc']]
    isOrder: [[2, 'asc']],

  }];

  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  pageId = '';

  @ViewChild ( AppDataTable2Component )
  private appDataTable2Component : AppDataTable2Component;
  selectedRow: any;

  constructor(
    private okta: OktaAuthService, 
    private route: ActivatedRoute, 
    private router: Router, 
    private genericService: GenericService,
    private popUp: AppPopUpComponent,
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

  redirectToModifyOrderTemplatePage() {}

  handleEdit(dataObj: any){
    console.log('rowData >>>')
    console.log(dataObj.data);
    this.pageId = dataObj.data.id;
    this.router.navigate([`../ordertemplate/${this.pageId}`], { relativeTo: this.route } );
  }

  searchDataRequest() {
    return this.searchData().subscribe(
        response => {
          if (response) {
            if (response.data) {
              this.populateDataTable(response.data, false);
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
              self.searchDataRequest.bind(self)
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
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/reports/admin/canned-reports';
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
          editButton: true,
          width: '150'
        });
      }
    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];
    this.dataObject.gridData = this.gridData;
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  // handleCheckboxSelection(rowObj: any, rowData: any) {
  //   console.log('redirecto to Report page of JobId >>')
  //   this.selectedRow = rowObj;
  //   console.log(this.selectedRow.data.id);
  //   this.redirectToModifyOrderTemplatePage();
  // }

  handleUnCheckboxSelection(rowObj: any, rowData: any) {
    // console.log("Unselection")
    this.selectedRow = null;
  }

  handleRun(dataObj: any) {
    const data = {
      "job_id": dataObj.data.id, 
      "action": ["execute"]
    };

    this.genericService.postJobReportExecute(data).subscribe(
      (res) => {
        // Success show if stayHere or to ReprtsPage
        let popUpOptions = {
          title: 'Success',
          text: res.message + ". Would you like to go to Reports page or Stay here?",
          type: 'success',
          reverseButtons: true,
          showCloseButton: true,
          showCancelButton: true,
          cancelButtonText: "Stay here",
          confirmButtonText: "Go to Reports ->"
        };
        this.popUp.showPopUp(popUpOptions).then(
          (ok) => {
            if(ok.value) {
              // redirect to Reports_Page_With_JobId
              console.log("Will navigate when Orders-Processed-Reports api is ready")
              // this.router.navigate([`/app/admin/order-processed/${dataObj.data.id}`]);
            }
          },
          (rej) => {
            // console.log("rej Value", rej)
          }
        );

      },
      (rej) => {
        // Some Error occured
        let popUpOptions = {
          title: 'Error',
          text: rej.message,
          type: 'error',
          // reverseButtons: true,
          showCloseButton: true,
          // showCancelButton: true,
          // cancelButtonText: "Cancel"
        };
        this.popUp.showPopUp(popUpOptions);

      }
    )
  }

  handleRow(rowObj: any, rowData: any) {
    if(this[rowObj.action])
      this[rowObj.action](rowObj);
  }

  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest();
  }


}
