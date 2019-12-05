import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppScriptEmbedderComponent } from './app-script-embedder.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule
    ],
    declarations: [
      AppScriptEmbedderComponent
    ],
    exports: [AppScriptEmbedderComponent],
    providers: [],
    entryComponents: []
})
export class AppScriptEmbedderModule { }
