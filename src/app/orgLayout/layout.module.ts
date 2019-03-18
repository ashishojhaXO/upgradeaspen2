import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponentDirective } from '../shared';
import { FormsModule } from '@angular/forms';
import { McBreadcrumbsModule } from 'ngx-breadcrumbs';
import { DataTableModule } from '../shared/components';
import { AppSpinnerModule } from '../shared/components';
import { Ng2MultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AuthGuard } from './../shared';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        FormsModule,
        McBreadcrumbsModule.forRoot(),
        Ng2MultiSelectDropDownModule.forRoot(),
        DataTableModule,
        AppSpinnerModule
    ],
    declarations: [
        LayoutComponent,
        SidebarComponentDirective,
    ],
    providers: [AuthGuard],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class LayoutModule { }
