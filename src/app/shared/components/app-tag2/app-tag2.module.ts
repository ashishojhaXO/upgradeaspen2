import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TagInputModule} from 'ngx-chips';
import {AppTag2Component} from './app-tag2.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TagInputModule
  ],
  declarations: [
    AppTag2Component
  ],
  exports: [AppTag2Component]
})
export class AppTag2Module {
}
