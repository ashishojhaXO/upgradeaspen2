import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {TagSettings} from './tag.settings';

@Component({
  selector: 'app-tag2',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})

export class TagComponent implements OnInit {

  constructor(public router: Router) {
  }

  @Input()
  data: Array<any>;

  @Input()
  settings: TagSettings;

  @Output('onAdd')
  onTagAdd: EventEmitter<any> = new EventEmitter<any>();

  @Output('onRemove')
  onTagRemove: EventEmitter<any> = new EventEmitter<any>();

  @Output('onEdit')
  onTagEdit: EventEmitter<any> = new EventEmitter<any>();

  defaultSettings: TagSettings = {
    identifyBy: 'id',
    displayBy: 'itemName',
    isEditable: false,
    isDraggable: false,
    hideInputBox: true
  };

  dragZone = '';


  autocompleteItemsAsObjects = [
    {value: 'Item1', id: 0, extra: 0},
    {value: 'item2', id: 1, extra: 1},
    'item3'
  ];

  ngOnInit() {
    this.settings = Object.assign(this.defaultSettings, this.settings);

    this.dragZone = this.settings.isDraggable ? 'zone1' : '';
  }

  onAdd(item: any) {
    this.onTagAdd.emit(item);
  }

  onRemove(item: any) {
    console.log(item);
    this.onTagRemove.emit(item);
  }

  onEdit(item: any) {
    console.log(item);
    this.onTagEdit.emit(item);
  }
}
