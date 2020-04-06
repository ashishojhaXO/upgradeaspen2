import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

export interface AutoCompleteModel {
  value: any;
  display: string;
}

@Component({
  selector: 'app-tag2',
  templateUrl: './app-tag2.component.html',
  styleUrls: ['./app-tag2.component.scss']
})
export class AppTag2Component implements OnInit {

  @Input() dataModel: any;
  @Input() maxItems: any;
  @Input() primaryPlaceholder: string;
  @Input() secondaryPlaceholder: string;
  @Input() validation_func: string;
  @Input() validationMessages: string;
  @Output() updateDataModel: EventEmitter<any> = new EventEmitter<any>();

  validators: any;
  errorMessages: any;

  private email_validation(control: FormControl) {
    var EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/i;
    if (control.value.length != "" && !EMAIL_REGEXP.test(control.value)) {
      return { "email_validation": true };
    }
    return null;
  }

  constructor() {
  }

  ngOnInit() {
    this.validators = [ this[this.validation_func] ];
    this.errorMessages = {};
    this.errorMessages[this.validation_func] = this.validationMessages;
    this.maxItems = this.maxItems ? this.maxItems : 100;
  }

  OnAddingtag(e) {
    this.updateDataModel.emit({
          dataModel: this.dataModel
        }
    );
  }

  OnRemovingTag(e) {
    this.updateDataModel.emit({
          dataModel: this.dataModel
        }
    );
  }

}
