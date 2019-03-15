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

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr|ur/) ? browserLang : 'en');
  }
}
