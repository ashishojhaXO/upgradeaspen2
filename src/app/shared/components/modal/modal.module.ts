import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { ModalModule as BsModal } from 'ngx-bootstrap';
import { DataTableModule, AppSpinnerModule } from '../';

@NgModule({
  imports: [
    CommonModule,
    BsModal.forRoot(),
    DataTableModule,
    AppSpinnerModule
  ],
  declarations: [ModalComponent],
  exports: [ModalComponent]
})
export class ModalModule { }
