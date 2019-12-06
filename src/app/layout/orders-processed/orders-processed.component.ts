import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { OrdersComponent } from '../orders/orders.component';
import { GenericService } from '../../../services/generic.service';
import { AppPopUpComponent } from '../../shared/components/app-pop-up/app-pop-up.component';

@Component({
  selector: 'app-orders-processed',
  templateUrl: './orders-processed.component.html',
  styleUrls: ['./orders-processed.component.css'],
  providers: [GenericService, AppPopUpComponent]
})
export class OrdersProcessedComponent extends OrdersComponent {

  config = {
    urls: {
      downloadJob: '/api/reports/adhoc/reexecute',
      executeJob: '',
      sendEmail: ''
    }
  };

  columnsToShow: string[] = [
    "Vendor_Name", "Order_Id",
  ];

  constructor(
    okta: OktaAuthService,
    route: ActivatedRoute, router: Router, http: Http,
    private popUp: AppPopUpComponent,
    private genericService: GenericService
  ) { 
    super(okta, route, router, http)

    // Initializing some data
    this.init();
  }

  init() {
    const options = {
      // isSelection To stop selecting and highlighting Row, not working as this config still to be used in app-data-table2 Conponent
      isSelection: false,
      isRowHighlight: false,
      isRowSelection: false,
      isEmailOption: true,
      isPlayOption: {
        value: true,
      },
      isDownloadOption: true,
    }

    this.options[0] = Object.assign( {}, this.options[0], options);
  }


  ngOnInit() {
    super.ngOnInit();
  }

  populateDataTable(response, initialLoad) {
    console.log("resP: ", response)
    const tableData = response;
    this.gridData = {};
    this.gridData['result'] = [];
    const headers = [];

    console.log("resP: ", response, " TABL: ", tableData)

    if (tableData.length) {
      const keys = Object.keys(tableData[0]);
      
      console.log("IF TAB len keys", keys)

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
      
      console.log("IF TAB len header", headers)

    }

    this.gridData['result'] = tableData;
    this.gridData['headers'] = headers;
    this.gridData['options'] = this.options[0];

    this.dashboard = 'paymentGrid';
    this.dataObject.gridData = this.gridData;
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;

    console.log("griDATA: ", this.gridData, " dataOBJ: ", this.dataObject);
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;

  }

  compileHeaderData() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});

    return options;
  }

  random() {

  }
  
  beforeRunReport() {
    // const reportId = dataObj.data.id;
    // this.runReport(reportId).subscribe(response => {
    //   console.log(response);
    //   this.dataObject.isDataAvailable = false;
    //   // this.populateReportDataTable();
    //   this.random();
    // }, error => {
    //  // const message = JSON.parse(error._body).message;
    //  // this.toastr.error('ERROR!', message);
    // });
  }

  runReport(reportId) {
    // const AccessToken: any = this.widget.tokenManager.get('accessToken');
    // let token = '';
    // if (AccessToken) {
    //   token = AccessToken.accessToken;
    // }
    // const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    // const options = new RequestOptions({headers: headers});
    // const data = { "adhoc_report_id" : reportId};

    // var url = this.api_fs.api + '/api/reports/adhoc/reexecute';
    // return this.http
    //     .post(url, data, options);
  }

  // Swal's here
  onHandleRunError(rej) {
    const swalOptions = {
      title: "Job execution failed!",
      text: rej.message,
      type: 'error',
      showCloseButton: true,
      reverseButtons: true,
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }
    this.popUp.showPopUp(swalOptions )
  }

  onHandleRunSuccess(res) {
    const swalOptions = {
      title: "Job executed successfully",
      text: res.message,
      type: 'success',
      showCloseButton: true,
      reverseButtons: true,
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }
    this.popUp.showPopUp(swalOptions )
  }
  // Swal's here/

  handleRun(dataObj: any) {
    console.log("Trigger Execute/Run API", dataObj)
    this.showSpinner = true;
    
    const options = this.compileHeaderData();
    const data = {
      "job_id": dataObj.data.job_id || dataObj.data.Order_Id,
      "action": ["execute"]
    };

    this.showSpinner = true;
    this.genericService.ordersProcessedReportRun(data).subscribe(
      (res) => {
        this.showSpinner = false;
        this.onHandleRunSuccess(res)
      },
      (rej) => {
        this.showSpinner = false;
        this.onHandleRunError(rej)
      }
    )
  }
  
  onHandleDownloadError(rej) {
    const swalOptions = {
      title: "Download failed!",
      text: rej.message,
      type: 'error',
      showCloseButton: true,
      reverseButtons: true,
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }
    this.popUp.showPopUp(swalOptions )
  }

  onHandleDownloadSuccess(res) {
    const swalOptions = {
      title: "Download",
      text: res.message,
      type: 'success',
      showCloseButton: true,
      reverseButtons: true,
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }
    this.popUp.showPopUp(swalOptions )
  }


  handleDownload(dataObj: any) {
    console.log("Trigger Download API: ", dataObj);

    // const options = this.compileHeaderData();
    const data = {
      "job_id": dataObj.data.job_id || dataObj.data.Order_Id,
    };
    this.showSpinner = true;

    this.genericService.ordersProcessedReportDownload(data).subscribe(
      (res) => {
        // Show download Link
        this.onHandleDownloadSuccess(res)
      },
      (rej) => {
        this.onHandleDownloadError(rej)
      }
    )

  }

  onHandleEmailError(rej) {
    const swalOptions = {
      title: "Email sending failed!",
      text: rej.message,
      type: 'error',
      showCloseButton: true,
      reverseButtons: true,
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }
    this.popUp.showPopUp(swalOptions )
  }

  onHandleEmailSuccess(res) {
    const swalOptions = {
      title: "Email sent!",
      text: res.message,
      type: 'success',
      showCloseButton: true,
      reverseButtons: true,
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }
    this.popUp.showPopUp(swalOptions )
  }

  handleEmail(dataObj: any) {
    console.log("Trigger Email API");

    const options = this.compileHeaderData();
    const data = {
      "job_id": dataObj.data.job_id || dataObj.data.Order_Id,
      "action": ["email"]
    };

    this.genericService.ordersProcessedReportEmail(data).subscribe(
      (res) => {
        this.onHandleEmailSuccess(res)
      },
      (rej) => {
        this.onHandleEmailError(rej)
      }
    )

  }


}
