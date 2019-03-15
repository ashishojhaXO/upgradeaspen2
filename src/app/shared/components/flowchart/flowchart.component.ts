import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TreeNode} from "primeng/primeng";

declare var $: any;
declare var mermaid: any;

@Component({
  selector: 'app-flow-chart',
  template: '<div class="mermaid">graph RL;\n  Loading...;</div>'
})

export class FlowchartComponent implements OnInit {
    @Input() graphData: string;

    constructor() {}

    ngOnInit() {
      this.drawChart(this.graphData);
    }

    drawChart(graphData) {
      $(document).ready(() => {
          document.getElementById('mymodel').innerHTML = '<div class="mermaid">' + graphData + '</div>';
          mermaid.init();
      });
    }
}
