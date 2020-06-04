import { Component, OnInit, EventEmitter, Input, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { OktaAuthService } from '../../../../services/okta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reconciliation-profiles',
  templateUrl: './reconciliation-profiles.component.html',
  styleUrls: ['./reconciliation-profiles.component.css']
})
export class ReconciliationProfilesComponent implements OnInit {
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  selectedRow: any;
  invoices = [];
  memo: string;
  selectedInvoice: any;
  @Input() invoiceId: any;
  @Input() invoiceNumber: any;
  @Input() period: any;
  @Input() supplier: any;
  @Input() filters: any;
  itemDetails: any;
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

    this.searchDataRequest(this.invoiceId, this.period);
    console.log('this.invoiceId >>')
    console.log(this.invoiceId);
  }

  onTabClick(item) {
    if (item.order_id) {
      if (item.show) {
        item.show = false;
      } else {
        item.show = true;
        this.itemDetails = item;
        if (!item.lineItems) {
          this.searchLineItemDataRequest(item, this.period);
        }
      }
    } else {
      Swal({
        title: 'No Line Items found',
        text: 'We did not find any line items for this record',
        type: 'error'
      })
    }
  }
  onInvoiceClick(invoice) {
    if (invoice.profileName) {
      if (invoice.show) {
        invoice.show = false;
      } else {
        invoice.show = true;
        this.getInvoiceDetails(invoice);
      }
    } else {
      Swal({
        title: 'No Orders found',
        text: 'We did not find any orders for this record',
        type: 'error'
      })
    }
  }

  searchLineItemDataRequest(invoiceDetails, period) {
    let self = this;
    this.searchLineItemData(invoiceDetails, period).subscribe(
        response => {
          if (response) {
            invoiceDetails.lineItems = response;
            this.showSpinner = false;
          }
        },
        err => {
          if (err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
                this,
                err,
                self.searchLineItemDataRequest.bind(self, invoiceDetails, period),
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
  searchLineItemData(data, period) {
    console.log("data",data);
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    let dataObj = {
      year: period[0].id.split('-')[0],
      month: period[0].id.split('-')[1],
      invoice_header_id: data.invoice_header_id,
      filters : this.filters
    }
    if(data.supplier.toLowerCase() === 'kenshoo'){
      dataObj['profile_name'] = data.profile_name;
      dataObj['order_id'] = data.order_id;
    }else{
      if (data.order_id) {
        dataObj['order_id'] = data.order_id;
      } else {
        dataObj['profile_name'] = data.profile_name;
      }
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

  getInvoiceDetails(invoice) {
    if (!invoice.invoiceItems.length) {
      this.getKenshooProfileDetails(invoice, invoice.profileName, invoice.invoiceHeaderId, this.period);
    }
  }

  searchDataRequest(invoiceId, period) {
    let self = this;
    this.searchData(invoiceId, period).subscribe(
      response => {
        if (response) {
          const kenshoo_data = response.find(x => x.supplier.toLowerCase() === 'kenshoo');
          if (!kenshoo_data) {
            const invoiceItems = response;
            this.invoices.push({
              isKenshoo: false,
              invoiceNumber: invoiceItems.length ? invoiceItems[0].invoice_number : '',
              invoiceHeaderId: invoiceItems.length ? invoiceItems[0].invoice_header_id : '',
              invoiceItems: invoiceItems,
              show: true
            });
          } else {
            const invoiceItems = response;
            invoiceItems.forEach(function (d) {
              this.invoices.push({
                isKenshoo: true,
                profileName: d.profile_name,
                invoiceNumber: d.invoice_number,
                billingPeriod: d.billing_period,
                supplier: d.supplier,
                invoiceHeaderId: d.invoice_header_id,
                invoiceItems: [],
                billedAmount: d.order_billed_amount,
                calculatedAmount: d.order_calculated_amount,
                discrepancyAmount: d.order_discrepancy_amount
              });
            }, this);
          }
          this.showSpinner = false;
        }
      },
      err => {
        if (err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.searchDataRequest.bind(self, invoiceId, period)
          );
        } else {
          Swal({
            title: 'No Invoices found',
            text: 'We did not find any invoices associated with ID : ' + invoiceId,
            type: 'error'
          }).then(() => {
            // this.router.navigate(['/app/admin/invoices']);
          });
          this.showSpinner = false;
        }
      }
    );
  }

  getKenshooProfileDetails(invoice, profileName, invoice_header_id, period) {
    let self = this;
    this.searchProfileData(profileName, invoice_header_id, period).subscribe(
      response => {
        if (response) {
          const invoiceItems = response;
          invoiceItems.forEach(function (item) {
            item.pay = '';
          }, this);
          invoice.invoiceItems = invoiceItems;
          this.showSpinner = false;
        }

        console.log('invoice')
        console.log(invoice);

      },
      err => {

        if (err.status === 401) {
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.getKenshooProfileDetails.bind(self, invoice, profileName, invoice_header_id, period)
          );
        } else {
          this.showSpinner = false;
        }
      }
    );
  }

  searchProfileData(profileName, InvoiceHeaderID, period) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const dataObj = {
      year: period[0].id.split('-')[0],
      month: period[0].id.split('-')[1],
      invoice_header_id: InvoiceHeaderID,
      profile_name: profileName,
      filters: this.filters
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

  searchData(invoiceId, period) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const dataObj = {
      year: period[0].id.split('-')[0],
      month: period[0].id.split('-')[1],
      invoice_header_id: invoiceId,
      filters: this.filters
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

  handleCheckboxSelection(rowObj: any, rowData: any) {
    console.log('this.selectedRow >>')
    console.log(this.selectedRow);
    this.selectedRow = rowObj;
  }

  handleUnCheckboxSelection(rowObj: any, rowData: any) {
    this.selectedRow = null;
  }

  handleRow(rowObj: any, rowData: any) {
    if (this[rowObj.action])
      this[rowObj.action](rowObj);
  }
  getMonth(num) {
    var ret = '';
    switch (num) {
      case 1: ret = 'Jan'; break;
      case 2: ret = 'Feb'; break;
      case 3: ret = 'Mar'; break;
      case 4: ret = 'Apr'; break;
      case 5: ret = 'May'; break;
      case 6: ret = 'Jun'; break;
      case 7: ret = 'Jul'; break;
      case 8: ret = 'Aug'; break;
      case 9: ret = 'Sep'; break;
      case 10: ret = 'Oct'; break;
      case 11: ret = 'Nov'; break;
      case 12: ret = 'Dec'; break;
    }
    return ret;
  }
}

