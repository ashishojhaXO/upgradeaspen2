import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {WrapperMultiSelectDropdownComponent} from './wrapper-multiselect-dropdown.component';
import {MultiSelectDropdownModule} from '../multiselect-dropdown/multiselect-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectDropdownModule
  ],
  declarations: [
    WrapperMultiSelectDropdownComponent
  ],
  exports: [WrapperMultiSelectDropdownComponent]
})
export class WrapperMultiSelectDropdownModule {
}
