import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AccordionComponent} from './app-accordion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    AccordionComponent
  ],
  exports: [AccordionComponent]
})
export class AccordionModule {
}
