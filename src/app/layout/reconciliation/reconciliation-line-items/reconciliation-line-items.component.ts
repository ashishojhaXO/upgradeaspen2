import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { OktaAuthService } from '../../../../services/okta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reconciliation-line-items',
  templateUrl: './reconciliation-line-items.component.html',
  styleUrls: ['./reconciliation-line-items.component.css']
})
export class ReconciliationLineItemsComponent implements OnInit {
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  selectedRow: any;
  lineItems: any;
  @Input() itemDetails: any;
  @Input() period: any;
  @Output() pick = new EventEmitter();

  constructor(
    private okta: OktaAuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: Http) {
  }
  ngOnInit() {
    this.showSpinner = true;
    this.widget = this.okta.getWidget();
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.searchDataRequest(this.itemDetails, this.period);
  }
  searchDataRequest(invoiceDetails, period) {
    this.searchData(invoiceDetails, period).subscribe(
      response => {
        if (response) {
          this.lineItems=response;
          this.showSpinner = false;
        }
      },
      err => {
        if (err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchDataRequest.bind(self, invoiceDetails, period)
          );
        } else {
          Swal({
            title: 'No Invoices found',
            text: 'We did not find any invoices associated with ID : ',
            type: 'error'
          }).then(() => {
            // this.router.navigate(['/app/admin/invoices']);
          });
          this.showSpinner = false;
        }
      }
    );
  }
  searchData(data, period) {
    console.log("data",data);
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    let dataObj = {
      year: period[0].id.split('-')[0],
      month: period[0].id.split('-')[1],
      invoice_header_id: data.invoice_header_id
    }
    console.log("data.order_id",data.order_id);
    if (data.order_id) {
      dataObj['order_id'] = data.order_id;
    } else {
      dataObj['profile_name'] = data.profile_name;
    }
    const obj = JSON.stringify(dataObj);
    console.log('obj >>')
    console.log(obj)
    const headers = new Headers({ 'Content-Type': 'application/json', 'token': token, 'callingapp': 'aspen' });
    const options = new RequestOptions({ headers: headers });
    var url = this.api_fs.api + '/api/reports/reconciliation';
    return this.http
      .post(url, obj, options)
      .map(res => {
        return res.json();
      }).share();
  }

}
