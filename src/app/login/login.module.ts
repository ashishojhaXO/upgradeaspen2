import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { OktaAuthService } from '../../../src/services/okta.service';

import {
  OktaAuthModule,
  OktaCallbackComponent,
  OktaAuthGuard
} from '@okta/okta-angular';
import { LoginNewComponent } from './login-new/login-new.component';

const config = {
  issuer: 'https://dev-256587.oktapreview.com/oauth2/default',
  clientId: '0oaiu5g5o2Bj0Cg3Z0h7'
}

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [LoginComponent, LoginNewComponent],
  providers: [OktaAuthService]
})
export class LoginModule { }
