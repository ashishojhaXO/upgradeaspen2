import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppDataTableHeirarchyComponent } from './app-data-table-heirarchy.component';
// import { AppDataTablePopupComponent } from './../app-data-table/app-data-table-popup.component';
import { Select2Module } from 'ng2-select2';
import { FormsModule } from '@angular/forms';
import { DomService } from '../dom.service';
import { PopUpModalModule } from '../pop-up-modal/pop-up-modal.module';
import { TagInputModule } from 'ngx-chips';
import { Ng2MultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {DataTablesResponse} from './../app-data-table/app-data-table.response';
import { DataTableService, ReportsService } from '../../../../services';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        Select2Module,
        FormsModule,
        TagInputModule,
        PopUpModalModule,
        Ng2MultiSelectDropDownModule.forRoot()
    ],
    declarations: [
      AppDataTableHeirarchyComponent
    ],
    exports: [AppDataTableHeirarchyComponent],
    providers: [DomService, DataTableService, DataTablesResponse, ReportsService],
    entryComponents: []
})
export class AppDataTableHeirarchyModule { }
