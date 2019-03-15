import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CheckboxSwitchComponent} from './app-checkbox-switch.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CheckboxSwitchComponent
  ],
  exports: [CheckboxSwitchComponent]
})
export class CheckboxSwitchModule {
}
