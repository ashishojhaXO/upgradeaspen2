import { Component, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'app';

  constructor(private translate: TranslateService,
    public toastr: ToastsManager,
    vRef: ViewContainerRef) {

    translate.addLangs(['en', 'fr', 'ur']);
    translate.setDefaultLang('en');
    this.toastr.setRootViewContainerRef(vRef);

    // var apis_fs = {
    //   api: "https://plazo-dev.fusionseven.net",
    //   redirectUrl: "http://localhost:4300",
    //   staticBaseUrl: "https://static.fusionseven.net",
    //   termsFile: "DynamicMediaTermsAndConditions.pdf"
    // };
    // var externalAuth = {
    //   api: "https://dev-256587.oktapreview.com",
    //   clientId: '0oaiu5g5o2Bj0Cg3Z0h7'
    // };
    // var externalPaymentGateway = {
    //   api: "https://not-needed",
    // };
    //
    // localStorage.setItem("apis_fs", JSON.stringify(apis_fs));
    // localStorage.setItem("externalAuth", JSON.stringify(externalAuth));
    // localStorage.setItem("externalPaymentGateway", JSON.stringify(externalPaymentGateway));
    
    // new app config
    // var apis_fs = {  
    //   api: "https://plazo-dev.fusionseven.net",
    //   widget: "https://static.fusionseven.net/widget/widget_dev.js",
    //   version: "306"
    // };
    // localStorage.setItem("apis_fs", JSON.stringify(apis_fs));
      
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr|ur/) ? browserLang : 'en');
  }
}
