import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgDataTableComponent } from './ng-data-table.component';
import { Select2Module } from 'ng2-select2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeysPipe } from '../../../../pipes/keys.pipe';
import { TagInputModule } from 'ngx-chips';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    Select2Module,
    FormsModule,
    TagInputModule,
    ReactiveFormsModule
  ],
  declarations: [
    NgDataTableComponent, KeysPipe
  ],
  exports: [NgDataTableComponent],
  providers: []
})
export class NgDataTableModule { }
