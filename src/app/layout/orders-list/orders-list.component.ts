import { Component, OnInit, Input, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'jquery';
import 'bootstrap';
import {Router, ActivatedRoute} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { AppDataTable2Component } from '../../shared/components/app-data-table2/app-data-table2.component';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit  {

  gridData: any;
  dataObject: any = {};
  isDataAvailable: boolean;
  height: any;
  options: Array<any> = [{
    isSearchColumn: true,
    isTableInfo: true,
    isEditOption: {
      value : true,
      icon : '',
      tooltip: 'Edit Order'
    },
    isPlayOption: {
      value : true,
      icon : 'fa-dollar',
      tooltip: 'Pay Order'
    },
    isDeleteOption: false,
    isAddRow: false,
    isColVisibility: true,
    isRowHighlight: false,
    isDownloadAsCsv: true,
    isDownloadOption: false,
    isPageLength: true,
    isPagination: true,
    sendResponseOnCheckboxClick: true
  }];
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  templateValue = 'all';
  templateArr = [];
  editID = '';
  payID = '';

  @ViewChild ( AppDataTable2Component )
  private appDataTable2Component : AppDataTable2Component;
  selectedRow: any;

  constructor(private okta: OktaAuthService, private route: ActivatedRoute, private router: Router, private http: Http) {
  }

  ngOnInit() {

    this.showSpinner = true;
    this.widget = this.okta.getWidget();

    this.height = '50vh';

    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
    this.getTemplates();
    this.searchDataRequest(this.templateValue);
  }

  cancelOrder() {
    // const res = OrderService.cancelOrder(id)
    // return res.subscribe( order => console.log(`Order id: ${order.id} cancelled`) )
    console.warn("Not Implemented: Call to Cancel service yet to be implemented...");
  }

  redirectToModifyOrderTemplatePage() {
    if(this.selectedRow && this.selectedRow.data) {
      const pageId = this.selectedRow.data.id;
      this.router.navigate([`../ordertemplate/${pageId}`], { relativeTo: this.route } );
    }
  }

  searchDataRequest(templateValue) {
    this.dataObject.isDataAvailable = false;
    const __this = this;
    setTimeout(function () {
      __this.processDataRequest(templateValue);
    }, 0);
  }

  processDataRequest(templateValue) {
    this.searchData(templateValue).subscribe(
        response => {
          if (response) {
            if (response.orders) {
              const orders = [];
              response.orders.forEach(element => {
                orders.push(element.order);
              });
              console.log('from orders', orders);
              this.populateDataTable(orders, true);
              this.showSpinner = false;
            }
          }
        },
        err => {

          if(err.status === 401) {
            if(localStorage.getItem('accessToken')) {
              let self = this;
              this.widget.tokenManager.refresh(
                'accessToken',
                    self.searchDataRequest.bind(self, templateValue)
              );
            } else {
              this.widget.signOut(() => {
                this.widget.tokenManager.remove('accessToken');
                window.location.href = '/login';
              });
            }
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  searchData(templateValue) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    let template;
    if(templateValue == 'all'){
       template = '';
    }else{
      template = {
        "template_id": templateValue
      }
    }
    const data = JSON.stringify(template);
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/list';
    return this.http
        .post(url, data, options)
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
    console.log(this.gridData);
    this.dataObject.isDataAvailable = this.gridData.result && this.gridData.result.length ? true : false;
    // this.dataObject.isDataAvailable = initialLoad ? true : this.dataObject.isDataAvailable;
  }

  handleCheckboxSelection(rowObj: any, rowData: any) {
    console.log('this.selectedRow >>')
    this.selectedRow = rowObj;
    console.log(this.selectedRow.data.id);
    this.redirectToModifyOrderTemplatePage();
  }

  handleUnCheckboxSelection(rowObj: any, rowData: any) {
    this.selectedRow = null;
  }

  handleRow(rowObj: any, rowData: any) {
    if(this[rowObj.action])
      this[rowObj.action](rowObj);
  }

  handleEdit(dataObj: any) {
    console.log('rowData >>>')
    console.log(dataObj.data);
    this.editID = dataObj.data.id;
    this.router.navigate(['/app/order/create', this.editID]);
  }

  handleRun(dataObj: any){
    console.log('rowData >>>')
    console.log(dataObj.data);
    this.payID = dataObj.data.id;
    this.router.navigate(['/app/orderPayment/', this.payID]);
  }

  getOrganizations() {
    console.log("Placeholder function: GetOrganizations");
  }

  getTemplates(){
    this.getTemplateService().subscribe(
      response => {
        console.log('response >>')
        console.log(response);
        if (response && response.orgTemplates) {
          response.orgTemplates.templates.forEach(function (ele) {
            this.templateArr.push({
              id: ele.id,
              text: ele.name
            });
          }, this);
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.templateArr);
          this.showSpinner = false;
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            console.log("ord-temp no okt if")
            // this.widget.tokenManager.refresh('accessToken')
            //     .then(function (newToken) {
            //       localStorage.setItem('accessToken', newToken);
            //       this.showSpinner = false;
            //       this.getOrganizations();
            //     })
            //     .catch(function (err) {
            //       console.log('error >>')
            //       console.log(err);
            //     });
              let self = this;
              this.widget.tokenManager.refresh(
                'accessToken',
                self.getOrganizations.bind(self)
              );
          } else {
            console.log("ord-temp no okt else")
            // this.widget.tokenManager.refresh('accessToken')
            this.widget.signOut(() => {
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            });
          }
        } else {
          this.showSpinner = false;
        }
      }
    );
  }

  getTemplateService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/org-templates';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  templateChange(value){
    this.searchDataRequest(value)
  }

  reLoad(){
    this.showSpinner = true;
    this.dataObject.isDataAvailable = false;
    this.searchDataRequest(this.templateValue);
  }
}
