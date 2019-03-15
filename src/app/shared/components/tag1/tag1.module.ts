import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagInputModule } from 'ngx-chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tag1Component } from './tag1.component';
import { DataTableService } from '../../../../services';

@NgModule({
  imports: [
    CommonModule,
    TagInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [Tag1Component],
  exports: [Tag1Component],
  providers: [DataTableService]
})

export class Tag1Module { }
