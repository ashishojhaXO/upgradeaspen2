import { BrowserModule, Title } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { Validator } from './shared/util/validator';
import { Common } from './shared/util/common';
import { AuthGuard } from './shared';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { TagInputModule } from 'ngx-chips';
import { Ng2MultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { AppPopUpComponent } from './shared/components/app-pop-up/app-pop-up.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        AppPopUpComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ToastModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        CustomFormsModule,
        HttpModule,
        AppRoutingModule,
        TagInputModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [Http]
            }
        }),
        SlimLoadingBarModule.forRoot(),
        Ng2MultiSelectDropDownModule.forRoot(),
        ConfirmationPopoverModule.forRoot(),
    ],
    providers: [AuthGuard, Validator, Common, Title],
    bootstrap: [AppComponent]
})

export class AppModule { }
