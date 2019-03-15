import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppDataTableComponent } from './app-data-table.component';
import { AppDataTablePopupComponent } from './app-data-table-popup.component';
import { Select2Module } from 'ng2-select2';
import { FormsModule } from '@angular/forms';
import { DomService } from '../dom.service';
import { Tag1Component } from '../tag1/tag1.component';
// import { DropDownComponent } from '../dropdown/dropdown.component';
import { PopUpModalModule } from '../pop-up-modal/pop-up-modal.module';
import { TagInputModule } from 'ngx-chips';
import { Ng2MultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {DataTablesResponse} from "./app-data-table.response";
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
      AppDataTableComponent, Tag1Component, AppDataTablePopupComponent
    ],
    exports: [AppDataTableComponent, AppDataTablePopupComponent],
    providers: [DomService, DataTableService, DataTablesResponse, ReportsService],
    entryComponents: [Tag1Component]
})
export class AppDataTableModule { }
