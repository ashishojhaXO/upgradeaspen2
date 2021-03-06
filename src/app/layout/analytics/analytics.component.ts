import { Component, OnInit, Inject } from '@angular/core';
import { Headers, RequestOptions, Http } from '@angular/http';
import { OktaAuthService } from '../../../services/okta.service';
import { DOCUMENT } from '@angular/common';
import swal from 'sweetalert2';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  constructor(private http: Http, private okta: OktaAuthService, @Inject(DOCUMENT) document: any) {
    this.hostname = document.location.hostname;
  }
  hostname;
  viewId;
  api_fs: any;
  showSpinner: boolean;
  widget: any;
  analyticsResponseHeader;
  analyticsResponseBody;
  regexSpace = new RegExp(/([A-Z]+)/g);
  startDate;
  endDate;
  googleToken;
  userDetail;
  userDetailHeader;
  userDetailBody;
  userId;
  emailId;
  chartConfig;
  isForbidden:boolean = false;

  ngOnInit() {
    this.widget = this.okta.getWidget();
    this.showSpinner = true;
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.getToken();
    // console.log('from init', this.hostname);
    if (this.hostname === "aspen.fusionseven.io" || this.hostname === "aspen.accelitas.io"){
      this.viewId = 'ga:210064983';
    } else if (this.hostname === "aspen-qa.fusionseven.net"){
      this.viewId = 'ga:209804732';
    } else {
      this.viewId = 'ga:209802679';
    }
  }

  getToken() {
    return this.getTokenService().subscribe(
        response => {
          // console.log('response >>>')
          // console.log(response);
          if(response && response.data){
            this.googleToken = response.data.access_token;
            this.analyticsReport().subscribe(
              response => {
                if (response) {
                  this.analyticsResponseHeader = response.columnHeaders;
                  this.analyticsResponseBody = response.rows;
                  this.startDate = response.query['start-date'];
                  this.endDate = response.query['end-date'];
                  // console.log('analytics report response: ', response);
                  this.showSpinner = false;
                }
                else {
                  console.log('No response from google analytics api')
                }
              },
              err => {
                console.log('error occured: ', err);
              }
            );
            this.analyticsChart().subscribe(
              response => {
                if (response) {
                  // console.log('analytics chart response: ', response);
                  this.setChartConfig(response);
                  this.showSpinner = false;
                }
                else {
                  console.log('No response from google analytics api')
                }
              },
              err => {
                console.log('error occured: ', err);
              }
            );
          }
        },
        err => {
          if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getToken.bind(self)
            );
          } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
          } else {
            this.showSpinner = false;
          }
        }
    );
  }

  getTokenService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/googleapis/token';
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      }).share();
  }

  analyticsReport() {
    var url = 'https://www.googleapis.com/analytics/v3/data/ga?ids='+this.viewId+'&start-date=30daysAgo&end-date=yesterday&metrics=ga%3Asessions%2Cga%3Apageviews%2Cga%3AtimeOnPage&dimensions=ga%3Adimension1&access_token='+this.googleToken;
    return this.http
      .get(url)
      .map(res => {
        return res.json();
      }).share();
  }

  analyticsChart() {
    var url = 'https://www.googleapis.com/analytics/v3/data/ga?ids='+this.viewId+'&start-date=30daysAgo&end-date=yesterday&metrics=ga%3Ausers&dimensions=ga%3Adate&access_token='+this.googleToken;
    return this.http
      .get(url)
      .map(res => {
        return res.json();
      }).share();
  }

  getgoogleUser(id){
    this.showSpinner = true;
    this.userId = id.replace('go', '');
    this.getUserDetails();
    this.getgoogleUserService(id).subscribe(
      response => {
        // console.log(response);
        if(response) {
          this.userDetail = response;
          this.userDetailHeader = this.userDetail.columnHeaders;
          this.userDetailBody = this.userDetail.rows;
        }
        this.showSpinner = false;
      },
      error => {
        console.log(error);
        this.showSpinner = false;
      }
    )
  }

  getgoogleUserService(id) {
    // console.log(id);
    var url = 'https://www.googleapis.com/analytics/v3/data/ga?ids='+this.viewId+'&start-date=30daysAgo&end-date=yesterday&metrics=ga%3Apageviews%2Cga%3AtimeOnPage&dimensions=ga%3ApagePath%2Cga%3Adate&sort=-ga%3Adate&filters=ga%3Adimension1%3D%3D'+ id +'&access_token='+this.googleToken;
    return this.http
      .get(url)
      .map(res => {
        return res.json();
      }).share();
  }

  getUserDetails() {
    this.getUserService().subscribe(
       response => {
         if (response && response.data) {
          // console.log(response.data);
          this.emailId = response.data.email_id;
         }
         this.showSpinner = false;
       },
       err => {
         if(err.status === 401) {
            let self = this;
            this.widget.refreshElseSignout(
              this,
              err,
              self.getUserDetails.bind(self)
            );
          } else if(err.status === 403) {
            this.isForbidden = true;
            this.showSpinner = false;
          } else {
           this.showSpinner = false;
           swal({
            title: 'Error',
            text: err.message,
            type: 'error'
          });
         }
         this.showSpinner = false;
       }
   );
  }

  getUserService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/users/user-by-id/' + this.userId;
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  setChartConfig(data) {
    this.chartConfig = {
      type: "line",
      title: 'Users Vs Date',
      subTitle: 'Source: Google Analytics',
      seriesName: ['Users', 'Sessions'],
      data: data.rows
    }
    // console.log("analytics chart config: ", this.chartConfig);
  }

  dateSet(col) {
    return col.replace(/(\d{4})(\d{2})(\d{2})/g, '$3-$2-$1');
  }

}
