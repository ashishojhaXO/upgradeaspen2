import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomFormbuilderComponent } from './customformbuilder.component';
import { FormsModule } from '@angular/forms';
import { DndModule } from "ngx-drag-drop";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DndModule
    ],
    declarations: [
      CustomFormbuilderComponent
    ],
    exports: [CustomFormbuilderComponent],
    entryComponents: []
})
export class CustomFormBuilderModule { }
