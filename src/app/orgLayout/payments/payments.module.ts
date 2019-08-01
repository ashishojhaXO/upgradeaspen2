import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsComponent } from './payments.component';
import {PopUpModalModule} from "../../shared/components/pop-up-modal/pop-up-modal.module";
import { AppChartsModule } from '../../shared/components/app-charts/app-charts.module';
import {AppSidebarModule} from '../../shared/components/app-sidebar/app-sidebar.module';
import {WrapperMultiSelectDropdownModule} from '../../shared/components/wrapper-multiselect-dropdown/wrapper-multiselect-dropdown.module';
import { AppPopupButtonModule} from '../../shared/components/app-popup-button/app-popup-button.module';
import {AppDataTableModule, AppSpinnerModule, DataTableModule, AppDataTable2Module} from '../../shared/components';
import {CheckboxSwitchModule} from '../../shared/components/app-checkbox-switch/app-checkbox-switch.module';
import { Select2Module } from 'ng2-select2';
import { OktaAuthService } from '../../../services/okta.service';
import { OrganizationService } from '../../../services/organization.service';

@NgModule({
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PopUpModalModule,
    AppChartsModule,
    AppSidebarModule,
    WrapperMultiSelectDropdownModule,
    AppPopupButtonModule,
    DataTableModule,
    AppDataTableModule,
    AppSpinnerModule,
    AppDataTable2Module,
    CheckboxSwitchModule,
    Select2Module
  ],
  declarations: [PaymentsComponent],
  providers: [OktaAuthService , OrganizationService]
})

export class PaymentsModule { }
