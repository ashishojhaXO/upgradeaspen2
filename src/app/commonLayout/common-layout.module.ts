import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableModule } from '../shared/components';
import { Ng2MultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FooterComponent } from '../shared';
import { CommonLayoutRoutingModule } from './common-layout-routing.module';
import { CommonLayoutComponent } from './common-layout.component';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { McBreadcrumbsModule } from 'ngx-breadcrumbs';
import { PopUpModalModule } from '../shared/components/pop-up-modal/pop-up-modal.module';
import { HeaderComponentDirective } from '../shared/components/header/header.component';

@NgModule({
  imports: [
    CommonModule,
    DataTableModule,
    CommonLayoutRoutingModule,
    TranslateModule,
    FormsModule,
    Ng2MultiSelectDropDownModule.forRoot(),
    ConfirmationPopoverModule.forRoot(),
    McBreadcrumbsModule.forRoot(),
    PopUpModalModule,
    ReactiveFormsModule
  ],
  declarations: [
    CommonLayoutComponent,
    HeaderComponentDirective,
    FooterComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CommonLayoutModule { }
