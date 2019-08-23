import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VisDashboardRoutingModule } from './visDashboard-routing.module';
import { VisDashboardComponent } from './visDashboard.component';
import { AppChartsModule } from '../../shared/components/app-charts/app-charts.module';
import {AppSidebarModule} from '../../shared/components/app-sidebar/app-sidebar.module';
import {WrapperMultiSelectDropdownModule} from '../../shared/components/wrapper-multiselect-dropdown/wrapper-multiselect-dropdown.module';
import { AppPopupButtonModule} from '../../shared/components/app-popup-button/app-popup-button.module';
import {AppDataTableModule, AppSpinnerModule, DataTableModule, AppDataTable2Module} from '../../shared/components';
import { OktaAuthService } from '../../../services/okta.service';

@NgModule({
  imports: [
    CommonModule,
    VisDashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppChartsModule,
    AppSidebarModule,
    WrapperMultiSelectDropdownModule,
    AppPopupButtonModule,
    DataTableModule,
    AppDataTableModule,
    AppSpinnerModule,
    AppDataTable2Module
  ],
  declarations: [VisDashboardComponent],
  providers: [OktaAuthService],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})

export class VisDashboardModule { }
