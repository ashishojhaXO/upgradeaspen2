import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppSidebarModule} from '../../shared/components/app-sidebar/app-sidebar.module';
import {MultiSelectDropdownModule} from '../../shared/components/multiselect-dropdown/multiselect-dropdown.module';
import {ReportsRoutingModule} from './reports-routing.module';
import {ReportsSummaryComponent} from './reports-summary/reports-summary.component';
import {AdhocReportBuilderComponent} from './reports-adhocReportBuilder/reports-adhocReportBuilder.component';
import {AlertNoticationdashboardsComponent} from './reports-alertNotification/reports-alertNotification.component';
import {AuthService, OrganizationService} from '../../../services';
import {TheReportsService} from './reportsLocal.service';
import {ReportsService} from '../../../services/reports.service';
import { MyDatePickerModule } from 'mydatepicker';
import {AccordionModule} from '../../shared/components/app-accordion/app-accordion.module';
import {CheckboxSwitchModule} from '../../shared/components/app-checkbox-switch/app-checkbox-switch.module';
import {PopUpModalModule} from '../../shared/components/pop-up-modal/pop-up-modal.module';
import {AppPopupButtonModule} from '../../shared/components/app-popup-button/app-popup-button.module';
import {TagModule} from '../../shared/components/app-tag/tag.module';
import { AppChartsModule } from '../../shared/components/app-charts/app-charts.module';
import {AppDataTableModule, AppSpinnerModule, DataTableModule, AppDataTable2Module} from '../../shared/components';
import {ReportsUtil} from '../../shared/util/reports-util';
import { OktaAuthService } from '../../../services/okta.service';

@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppSidebarModule,
    MultiSelectDropdownModule,
    MyDatePickerModule,
    AccordionModule,
    CheckboxSwitchModule,
    PopUpModalModule,
    AppDataTableModule,
    AppDataTable2Module,
    TagModule,
    AppPopupButtonModule,
    AppChartsModule,
    AppSpinnerModule
  ],
  declarations: [ReportsSummaryComponent, AdhocReportBuilderComponent, AlertNoticationdashboardsComponent, AlertNoticationdashboardsComponent],
  providers: [OrganizationService, AuthService, TheReportsService, ReportsService, ReportsUtil, DatePipe, OktaAuthService],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})

export class ReportsModule {
}
