import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppPopupButtonComponent } from './app-popup-button.component';
import { FormsModule } from '@angular/forms';
import {PopUpModalModule} from '../../../shared/components/pop-up-modal/pop-up-modal.module';
import {AppDataTableModule} from '../../../shared/components/app-data-table/app-data-table.module';
import {AppSpinnerModule} from '../index';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        PopUpModalModule,
        AppDataTableModule,
        AppSpinnerModule
    ],
    declarations: [
      AppPopupButtonComponent
    ],
    exports: [AppPopupButtonComponent],
    providers: []
})
export class AppPopupButtonModule { }
