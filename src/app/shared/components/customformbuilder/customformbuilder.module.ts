import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomFormbuilderComponent } from './customformbuilder.component';
import { FormsModule } from '@angular/forms';
import { DndModule } from "ngx-drag-drop";
import { Select2Module } from 'ng2-select2';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DndModule,
        Select2Module
    ],
    declarations: [
      CustomFormbuilderComponent
    ],
    exports: [CustomFormbuilderComponent],
    entryComponents: []
})
export class CustomFormBuilderModule { }
