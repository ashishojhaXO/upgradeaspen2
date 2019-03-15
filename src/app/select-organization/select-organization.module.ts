/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Gobinath samuvel
 * Date: 2018-02-20 10:00:00
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectOrganizationRoutingModule } from './select-organization-routing.module';
import { SelectOrganizationComponent } from './select-organization.component';
import { AuthService, BaseService, OrganizationService } from '../../services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { Ng2MultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataTableModule, AppSpinnerModule } from '../shared/components';
import { ModalModule as BsModal } from 'ngx-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        SelectOrganizationRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        TextMaskModule,
        DataTableModule,
        Ng2MultiSelectDropDownModule.forRoot(),
        AppSpinnerModule,
        BsModal.forRoot()
    ],
    declarations: [SelectOrganizationComponent],
    providers: [AuthService, BaseService, OrganizationService]

})
export class SelectOrganizationModule { }
