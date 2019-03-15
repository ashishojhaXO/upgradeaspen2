import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-checkbox-switch',
  templateUrl: './app-checkbox-switch.component.html',
  styleUrls: ['./app-checkbox-switch.component.scss']
})

export class CheckboxSwitchComponent implements OnInit {

  constructor(public router: Router) {
  }

  @Input()
  value: boolean;
  @Output()
  onChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  activeClass = '';

  ngOnInit() {
  }

  handleOnChange(value: boolean) {
    this.value = value;
    this.activeClass = this.value ? 'a-tive' : 'in-active';
    this.onChange.emit(value);
  }

}
