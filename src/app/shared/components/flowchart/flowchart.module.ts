import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlowchartComponent} from './flowchart.component';

@NgModule({
    imports: [ CommonModule ],
    declarations: [ FlowchartComponent ],
    exports: [ FlowchartComponent ]
})

export class FlowchartModule {}
