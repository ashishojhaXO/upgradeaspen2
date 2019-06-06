import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendorManagementComponentRoutingModule } from './vendorManagement-routing.module';
import { VendorManagementComponent } from './vendorManagement.component';
import { AppChartsModule } from '../../shared/components/app-charts/app-charts.module';
import {AppSidebarModule} from '../../shared/components/app-sidebar/app-sidebar.module';
import {WrapperMultiSelectDropdownModule} from '../../shared/components/wrapper-multiselect-dropdown/wrapper-multiselect-dropdown.module';
import { AppPopupButtonModule} from '../../shared/components/app-popup-button/app-popup-button.module';
import {AppDataTableModule, AppSpinnerModule, DataTableModule} from '../../shared/components';
import { Select2Module } from 'ng2-select2';
import { PopUpModalModule } from '../../shared/components/pop-up-modal/pop-up-modal.module';
import { OktaAuthService } from '../../../services/okta.service';

@NgModule({
  imports: [
    CommonModule,
    VendorManagementComponentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppChartsModule,
    AppSidebarModule,
    WrapperMultiSelectDropdownModule,
    AppPopupButtonModule,
    DataTableModule,
    AppDataTableModule,
    AppSpinnerModule,
    Select2Module,
    PopUpModalModule
  ],
  declarations: [VendorManagementComponent],
  providers: [OktaAuthService]
})

export class VendorManagementModule { }
