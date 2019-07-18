import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReconciliationRoutingModule } from './reconciliation-routing.module';
import { ReconciliationComponent } from './reconciliation.component';
import { AppChartsModule } from '../../shared/components/app-charts/app-charts.module';
import {AppSidebarModule} from '../../shared/components/app-sidebar/app-sidebar.module';
import {WrapperMultiSelectDropdownModule} from '../../shared/components/wrapper-multiselect-dropdown/wrapper-multiselect-dropdown.module';
import { AppPopupButtonModule} from '../../shared/components/app-popup-button/app-popup-button.module';
import {AppDataTableModule, AppSpinnerModule, DataTableModule, AppDataTable2Module} from '../../shared/components';
import { OktaAuthService } from '../../../services/okta.service';
import {MultiSelectDropdownModule} from '../../shared/components/multiselect-dropdown/multiselect-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    ReconciliationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppChartsModule,
    AppSidebarModule,
    WrapperMultiSelectDropdownModule,
    AppPopupButtonModule,
    DataTableModule,
    AppDataTableModule,
    AppDataTable2Module,
    AppSpinnerModule,
    MultiSelectDropdownModule
  ],
  declarations: [ReconciliationComponent],
  providers: [OktaAuthService]
})

export class ReconciliationModule { }
