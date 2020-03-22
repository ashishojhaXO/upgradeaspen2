import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppFileUploaderComponent } from './app-file-uploader.component';
import { DropZoneDirective } from './drop-zone.directive';
import { FileSizePipe } from './file-size.pipe';
import { FileSelectDirective } from './file-select.directive';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
    ],
    declarations: [
        AppFileUploaderComponent, DropZoneDirective, FileSizePipe, FileSelectDirective
    ],
    exports: [AppFileUploaderComponent],
    providers: [],
    entryComponents: []
})
export class AppFileUploaderModule { }
