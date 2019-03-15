import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-accordion',
  templateUrl: './app-accordion.component.html',
  styleUrls: ['./app-accordion.component.scss']
})

export class AccordionComponent implements OnInit {

  constructor(public router: Router) {
  }

  @Input()
  title: string;

  @Input()
  leaveExpanded: boolean;

  @Output('onSelect')
  onSelect: EventEmitter<any> = new EventEmitter<any>();

  isPanelOpen = false;

  ngOnInit() {
    this.isPanelOpen = this.leaveExpanded;
  }

  handlePanelClick(event) {
    if (!this.leaveExpanded) {
      if (this.isPanelOpen) {
        this.isPanelOpen = false;
      } else {
        this.isPanelOpen = true;
      }
    }
  }

}
