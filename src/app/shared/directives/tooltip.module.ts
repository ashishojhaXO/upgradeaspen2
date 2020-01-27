import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
    ],
    declarations: [TooltipDirective],
    exports: [TooltipDirective],
    providers: [],
    entryComponents: []
})
export class TooltipModule { }
