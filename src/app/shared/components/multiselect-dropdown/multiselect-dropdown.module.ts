import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MultiSelectDropdownComponent} from './multiselect-dropdown.component';
import {AngularMultiSelectModule} from './core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AngularMultiSelectModule
  ],
  declarations: [
    MultiSelectDropdownComponent
  ],
  exports: [MultiSelectDropdownComponent]
})
export class MultiSelectDropdownModule {
}
