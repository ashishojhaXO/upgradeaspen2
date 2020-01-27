import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppPopupButtonComponent } from './app-popup-button.component';
import { FormsModule } from '@angular/forms';
import {PopUpModalModule} from '../../../shared/components/pop-up-modal/pop-up-modal.module';
import {AppDataTableModule, AppSpinnerModule, AppDataTable2Module} from '../../../shared/components';
import { TooltipModule } from '../../../shared/directives/tooltip.module';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        PopUpModalModule,
        AppDataTableModule,
        AppDataTable2Module,
        AppSpinnerModule,
        TooltipModule
    ],
    declarations: [
      AppPopupButtonComponent
    ],
    exports: [AppPopupButtonComponent],
    providers: []
})
export class AppPopupButtonModule { }
