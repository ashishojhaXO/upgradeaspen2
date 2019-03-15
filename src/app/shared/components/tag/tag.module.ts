import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagInputModule } from 'ngx-chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagComponent } from './tag.component';
import { DataTableService } from '../../../../services';

@NgModule({
  imports: [
    CommonModule,
    TagInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [TagComponent],
  exports: [TagComponent],
  providers: [DataTableService]
})

export class TagModule { }
