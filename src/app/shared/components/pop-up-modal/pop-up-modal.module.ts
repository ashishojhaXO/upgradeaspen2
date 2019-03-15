import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModalModule as BsModal} from 'ngx-bootstrap';
import { DataTableModule } from '../data-table/data-table.module';
import { AppSpinnerModule} from '../app-spinner/app-spinner.module';
import {PopUpModalComponent} from './pop-up-modal.component';

@NgModule({
  imports: [
    CommonModule,
    BsModal.forRoot(),
    DataTableModule,
    AppSpinnerModule
  ],
  declarations: [
    PopUpModalComponent,
  ],
  exports: [PopUpModalComponent]
})
export class PopUpModalModule {
}
