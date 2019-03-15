import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpModule, Http } from '@angular/http';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { AuthService } from '../../services/auth';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModule } from '@angular/common';
import { BaseService } from '../../services/base';
import { Common } from '../shared/util/common';
import { BrowserModule } from '@angular/platform-browser';

export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        CommonModule,
        ToastModule.forRoot(),
        RouterTestingModule,
        HttpModule,
        FormsModule,
        BrowserModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [Http]
          }
        }),
        ReactiveFormsModule],
      providers: [Common, AuthService, BaseService]
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  }));
});
