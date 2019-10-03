// imports
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponentDirective } from '../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McBreadcrumbsModule } from 'ngx-breadcrumbs';
import { Ng2MultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AppChartsModule } from './../shared/components/app-charts/app-charts.module';
import {AppSidebarModule} from './../shared/components/app-sidebar/app-sidebar.module';
import {WrapperMultiSelectDropdownModule} from './../shared/components/wrapper-multiselect-dropdown/wrapper-multiselect-dropdown.module';
import { AppPopupButtonModule} from './../shared/components/app-popup-button/app-popup-button.module';
import {AppDataTableModule, AppSpinnerModule, DataTableModule, AppDataTable2Module} from './../shared/components';
import { Select2Module } from 'ng2-select2';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { PopUpModalModule } from '../shared/components/pop-up-modal/pop-up-modal.module';
import { HeaderComponentDirective } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared';
import {CheckboxSwitchModule} from './../shared/components/app-checkbox-switch/app-checkbox-switch.module';
import {MultiSelectDropdownModule} from './../shared/components/multiselect-dropdown/multiselect-dropdown.module';

//declarations
import { DashboardsComponent } from './dashboards/dashboards.component';
import { VendorManagementComponent } from './vendorManagement/vendorManagement.component';
import { OrdersComponent } from './orders/orders.component';
import { PaymentsComponent } from './payments/payments.component';
import { ReconciliationComponent } from './reconciliation/reconciliation.component';
import { SupportComponent } from './support/support.component';
import { TasksComponent } from './tasks/tasks.component';
import { UserManagementComponent } from './usermanagement/usermanagement.component';
import { VisDashboardComponent } from './visDashboard/visDashboard.component';
import { OrderComponent } from './order/order.component';

// providers
import { AuthGuard } from './../shared';
import { OktaAuthService } from './../../services/okta.service';
import { OrganizationService } from './../../services/organization.service';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        McBreadcrumbsModule.forRoot(),
        Ng2MultiSelectDropDownModule.forRoot(),
        DataTableModule,
        AppSpinnerModule,
        AppChartsModule,
        AppSidebarModule,
        WrapperMultiSelectDropdownModule,
        AppPopupButtonModule,
        AppDataTableModule,
        AppSpinnerModule,
        DataTableModule,
        AppDataTable2Module,
        Select2Module,
        PopUpModalModule,
        ConfirmationPopoverModule,
        CheckboxSwitchModule,
        MultiSelectDropdownModule
    ],
    declarations: [
        LayoutComponent,
        SidebarComponentDirective,
        HeaderComponentDirective,
        FooterComponent,
        DashboardsComponent,
        OrdersComponent,
        PaymentsComponent,
        VendorManagementComponent,
        ReconciliationComponent,
        SupportComponent,
        TasksComponent,
        UserManagementComponent,
        VisDashboardComponent,
        OrderComponent
    ],
    providers: [AuthGuard, OktaAuthService, OrganizationService],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class LayoutModule { }
