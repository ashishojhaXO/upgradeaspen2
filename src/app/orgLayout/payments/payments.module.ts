import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsComponent } from './payments.component';
import { AppChartsModule } from '../../shared/components/app-charts/app-charts.module';
import {AppSidebarModule} from '../../shared/components/app-sidebar/app-sidebar.module';
import {WrapperMultiSelectDropdownModule} from '../../shared/components/wrapper-multiselect-dropdown/wrapper-multiselect-dropdown.module';
import { AppPopupButtonModule} from '../../shared/components/app-popup-button/app-popup-button.module';
import {AppDataTableModule, AppSpinnerModule, DataTableModule} from '../../shared/components';

@NgModule({
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppChartsModule,
    AppSidebarModule,
    WrapperMultiSelectDropdownModule,
    AppPopupButtonModule,
    DataTableModule,
    AppDataTableModule,
    AppSpinnerModule
  ],
  declarations: [PaymentsComponent],
  providers: []
})

export class PaymentsModule { }
