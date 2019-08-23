import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupportRoutingModule } from './support-routing.module';
import { SupportComponent } from './support.component';
import { AppChartsModule } from '../../shared/components/app-charts/app-charts.module';
import {AppSidebarModule} from '../../shared/components/app-sidebar/app-sidebar.module';
import {WrapperMultiSelectDropdownModule} from '../../shared/components/wrapper-multiselect-dropdown/wrapper-multiselect-dropdown.module';
import { AppPopupButtonModule} from '../../shared/components/app-popup-button/app-popup-button.module';
import {AppDataTableModule, AppSpinnerModule, DataTableModule, AppDataTable2Module} from '../../shared/components';
import { Select2Module } from 'ng2-select2';
import { PopUpModalModule } from '../../shared/components/pop-up-modal/pop-up-modal.module';
import { OktaAuthService } from '../../../services/okta.service';

@NgModule({
  imports: [
    CommonModule,
    SupportRoutingModule,
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
    PopUpModalModule,
    AppDataTable2Module
  ],
  declarations: [SupportComponent],
  providers: [OktaAuthService]
})

export class SupportModule { }
