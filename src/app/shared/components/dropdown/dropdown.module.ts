/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Gobinath samuvel
 * Date: 2018-07-01
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagInputModule } from 'ngx-chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownComponent } from './dropdown.component';
import {Ng2MultiSelectDropDownModule} from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    CommonModule,
    TagInputModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2MultiSelectDropDownModule.forRoot()
  ],
  declarations: [DropDownComponent],
  exports: [DropDownComponent]
})

export class DropDownModule { }
