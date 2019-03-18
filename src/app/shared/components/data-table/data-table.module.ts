import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableComponent } from './data-table.component';
import { DataTablePopupComponent } from './data-table-popup.component';
import { Select2Module } from 'ng2-select2';
import { FormsModule } from '@angular/forms';
import { DomService } from '../dom.service';
import { DataTableService } from '../../../../services';
import { TagComponent } from '../tag/tag.component';
// import { DropDownComponent } from '../dropdown/dropdown.component';
// import { TagInputModule } from 'ngx-chips';
import { Ng2MultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        Select2Module,
        FormsModule,
        TagInputModule,
        Ng2MultiSelectDropDownModule.forRoot()
    ],
    declarations: [
        DataTableComponent, TagComponent, DataTablePopupComponent
    ],
    exports: [DataTableComponent, DataTablePopupComponent],
    providers: [DomService, DataTableService],
    entryComponents: []
})
export class DataTableModule { }
