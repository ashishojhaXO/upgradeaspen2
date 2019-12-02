import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransitionRoutingModule } from './transition-routing.module';
import { TransitionComponent } from './transition.component';
import { AppSpinnerModule } from '../shared/components';
import { OktaAuthService } from '../../../src/services/okta.service';

@NgModule({
  imports: [
    CommonModule,
      TransitionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppSpinnerModule
  ],
  declarations: [TransitionComponent],
  // providers: [OktaAuthService]
})

export class TransitionModule { }
