import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransitionRoutingModule } from './transition-routing.module';
import { TransitionComponent } from './transition.component';
import { AppSpinnerModule } from '../shared/components';

@NgModule({
  imports: [
    CommonModule,
      TransitionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppSpinnerModule
  ],
  declarations: [TransitionComponent],
  providers: []
})

export class TransitionModule { }
