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
  }

  ngOnInit() {
    console.log("NGON ININ")
    super.ngOnInit();
  }

}
