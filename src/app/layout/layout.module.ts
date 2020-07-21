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
import { AppNavComponent } from '../shared/components/app-nav/app-nav.component';
import { FooterComponent } from '../shared';
import {CheckboxSwitchModule} from './../shared/components/app-checkbox-switch/app-checkbox-switch.module';
import {MultiSelectDropdownModule} from './../shared/components/multiselect-dropdown/multiselect-dropdown.module';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AppScriptEmbedderModule} from './../shared/components/app-script-embedder/app-script-embedder.module';
import {A2Edatetimepicker} from 'ng2-eonasdan-datetimepicker';
import { TooltipModule } from './../shared/directives/tooltip.module';
import { AppTag2Module } from './../shared/components/app-tag2/app-tag2.module';
import { AppFileUploaderModule } from './../shared/components/app-file-uploader/app-file-uploader.module';
import { ColorPickerModule } from 'ngx-color-picker';

//declarations
import { DashboardsComponent } from './dashboards/dashboards.component';
import { VendorManagementComponent } from './vendorManagement/vendorManagement.component';
import { OrdersComponent } from './orders/orders.component';
// import { OrdersV2Component } from './ordersV2/ordersV2.component';
// import { OrderV2DetailsComponent } from './orderV2Details/orderV2Details.component';
import { PaymentsComponent } from './payments/payments.component';
import { ReconciliationComponent } from './reconciliation/reconciliation.component';
import { SupportComponent } from './support/support.component';
import { TasksComponent } from './tasks/tasks.component';
import { UserManagementComponent } from './usermanagement/usermanagement.component';
import { VisDashboardComponent } from './visDashboard/visDashboard.component';
import { OrderComponent } from './order/order.component';
import { OrderPaymentComponent } from './orderPayment/orderPayment.component';
import { ConfigureAdComponent } from './configureAd/configureAd.component';
import { TargetAudComponent } from './targetAud/targetAud.component';
import { BaseFieldsComponent } from './baseFields/baseFields.component';
import { OrderTemplateComponent } from './order-template/order-template.component';
import { OrderSummaryComponent } from './orderSummary/orderSummary.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { InvoiceComponent } from './invoice/invoice.component';
import {OrgManagementComponent} from './../layout/orgManagement/orgManagement.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import {EmailManagementComponent} from './../layout/emailManagement/emailManagement.component';
import {OrderDashboardComponent} from './../layout/orderDashboard/orderDashboard.component';
import {LineItemHistoryComponent} from './../layout/orderDashboard/lineItemHistory/lineItemHistory.component';
import {UploadsComponent} from './../layout/uploads/uploads.component';

// providers
import { AuthGuard } from './../shared';
import { OktaAuthService } from './../../services/okta.service';
import { OrganizationService } from './../../services/organization.service';
import { OrdersProcessedComponent } from './orders-processed/orders-processed.component';
import { CustomFormBuilderModule } from '../shared/components/customformbuilder/customformbuilder.module';
import { OrdersTemplateListComponent } from './orders-template-list/orders-template-list.component';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { NumericDirective } from '../shared/directives/Numeric.directive';
import { JobsComponent } from './jobs/jobs.component';
import { OperationsDashboardComponent } from './operations-dashboard/operations-dashboard.component';
import { ReconciliationLineItemsComponent } from './reconciliation/reconciliation-line-items/reconciliation-line-items.component';
import { ReconciliationProfilesComponent } from './reconciliation/reconciliation-profiles/reconciliation-profiles.component';
import { FocusDirective } from '../shared/directives/Focus.directive';
import { BaseFieldsListComponent } from './base-fields-list/base-fields-list.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';

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
        MultiSelectDropdownModule,
        BsDatepickerModule.forRoot(),
        DatepickerModule.forRoot(),
        AppScriptEmbedderModule,
        CustomFormBuilderModule,
        A2Edatetimepicker,
        TooltipModule,
        AppTag2Module,
        AppFileUploaderModule,
        ColorPickerModule
    ],
    declarations: [
        LayoutComponent,
        SidebarComponentDirective,
        HeaderComponentDirective,
        AppNavComponent,
        FooterComponent,
        DashboardsComponent,
        OrdersComponent,
        // OrdersV2Component,
        // OrderV2DetailsComponent,
        OrdersTemplateListComponent,
        OrdersListComponent,
        PaymentsComponent,
        VendorManagementComponent,
        ReconciliationComponent,
        SupportComponent,
        TasksComponent,
        UserManagementComponent,
        VisDashboardComponent,
        OrderComponent,
        OrdersProcessedComponent,
        OrderPaymentComponent,
        BaseFieldsComponent,
        OrderTemplateComponent,
        ConfigureAdComponent,
        TargetAudComponent,
        OrderSummaryComponent,
        NumericDirective,
        InvoicesComponent,
        InvoiceComponent,
        UserSettingsComponent,
        OrgManagementComponent,
        AnalyticsComponent,
        EmailManagementComponent,
        OrderDashboardComponent,
        LineItemHistoryComponent,
        JobsComponent,
        OperationsDashboardComponent,
        UploadsComponent,
        ReconciliationLineItemsComponent,
        ReconciliationProfilesComponent,
        FocusDirective,
        BaseFieldsListComponent,
        PaymentMethodsComponent
    ],
    providers: [
        AuthGuard,
        OktaAuthService,
        OrganizationService],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class LayoutModule { }
