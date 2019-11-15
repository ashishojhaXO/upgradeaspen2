import { Component, OnInit } from '@angular/core';
import { value, field } from "./customformbuilder.model";
import Swal from "sweetalert2";
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';

@Component({
  selector: 'app-customformbuilder',
  templateUrl: './customformbuilder.component.html',
  styleUrls: ['./customformbuilder.component.scss']
})
export class CustomFormbuilderComponent implements OnInit {

  value = {
    option: ""
  }

  fieldModels: Array<field>=[
    {
      "id": "",
      "dropType": "text",
      "type": "varchar",
      "icon": "fa-font",
      "label": "Text",
      "default_value": "",
      "attr_list": "",
      "validation": {
        "required": false,
        "regex": ""
      },
      "disable": 0
    },
    {
      "id": "",
      "dropType": "email",
      "type": "text",
      "icon": "fa-envelope",
      "label": "Email",
      "default_value": "",
      "attr_list": "",
      "validation": {
        "required": true,
        "regex": "^([a-zA-Z0-9_.-]+)@([a-zA-Z0-9_.-]+)\.([a-zA-Z]{2,5})$"
      },
      "disable": 0
    },
    {
      "id": "",
      "dropType": "phone",
      "type": "int",
      "icon": "fa-phone",
      "label": "Phone",
      "default_value": "",
      "attr_list": "",
      "validation": {
        "required": false,
        "regex": "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"
      },
      "disable": 0
    },
    {
      "id": "",
      "dropType": "number",
      "type": "int",
      "label": "Number",
      "icon": "fa-html5",
      "default_value": "",
      "attr_list": "",
      "validation": {
        "required": false,
        "regex": ""
      },
      "disable": 0
    },
    {
      "id": "",
      "dropType": "amount",
      "type": "amount",
      "label": "Amount",
      "icon": "fa-usd",
      "default_value": "",
      "attr_list": "",
      "validation": {
        "required": false,
        "regex": ""
      },
      "disable": 0
    },
    {
      "id": "",
      "dropType": "date",
      "type": "date",
      "icon":"fa-calendar",
      "label": "Date",
      "default_value": "now",
      "attr_list": "",
      "validation": {
        "required": false,
        "regex": ""
      },
      "disable": 0
    },
    {
      "id": "",
      "dropType": "textarea",
      "type": "text",
      "icon":"fa-text-width",
      "label": "Textarea",
      "default_value": "Textarea",
      "attr_list": "",
      "validation": {
        "required": false,
        "regex": ""
      },
      "disable": 0
    },
    {
      "id": "",
      "dropType": "checkbox",
      "type": "checkbox",
      "label": "Checkbox",
      "default_value": "",
      "attr_list": {
        "options": [
          {
              "option": "value1"
          },
          {
              "option": "value2"
          }
        ]
      },
      "validation": {
        "required": false,
        "regex": ""
      },
      "icon":"fa-list",
      "disable": 0
    },
    {
      "id": "",
      "dropType": "radio",
      "type": "radio",
      "icon":"fa-list-ul",
      "label": "Radio",
      "default_value": "",
      "attr_list": {
        "options": [
          {
              "option": "value1"
          },
          {
              "option": "value2"
          }
        ]
      },
      "validation": {
        "required": false,
        "regex": ""
      },
      "disable": 0
    },
    {
      "id": "",
      "dropType": "autocomplete",
      "type": "list",
      "icon":"fa-bars",
      "label": "List",
      "default_value": "",
      "attr_list": {
        "options": [
          {
              "option": "value1"
          },
          {
              "option": "value2"
          }
        ]
      },
      "validation": {
        "required": false,
        "regex": ""
      },
      "disable": 0
    }
  ];

  modelFields:Array<field>=[];

  model:any = {
    attributes:this.modelFields
  };

  constructor() { }

  ngOnInit() {
  }

  onDragStart(event:DragEvent) {
    //console.log("drag started", JSON.stringify(event, null, 2));
  }
  
  onDragEnd(event:DragEvent) {
    //console.log("drag ended", JSON.stringify(event, null, 2));
  }
  
  onDraggableCopied(event:DragEvent) {
    //console.log("draggable copied", JSON.stringify(event, null, 2));
  }
  
  onDraggableLinked(event:DragEvent) {
    //console.log("draggable linked", JSON.stringify(event, null, 2));
  }

  onDragged( item:any, list:any[], effect:DropEffect ) {
    if( effect === "move" ) {
      const index = list.indexOf( item );
      list.splice( index, 1 );
    }
  }
      
  onDragCanceled(event:DragEvent) {
    //console.log("drag cancelled", JSON.stringify(event, null, 2));
  }
  
  onDragover(event:DragEvent) {
    //console.log("dragover", JSON.stringify(event, null, 2));
  }
  
  onDrop( event:DndDropEvent, list?:any[] ) {
    if( list && (event.dropEffect === "copy" || event.dropEffect === "move") ) {
      
      if(event.dropEffect === "copy")
      event.data.dropName = event.data.dropType+'-'+new Date().getTime();
      event.data.name = event.data.label;
      let index = event.index;
      if( typeof index === "undefined" ) {
        index = list.length;
      }
      list.splice( index, 0, event.data );
    }
  }

  addValue(values){
    values.push(this.value);
    this.value={option:""};
  }

  removeField(i){
    Swal({
      title: 'Are you sure?',
      text: "Do you want to remove this field?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00B96F',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove!'
    }).then((result) => {
      if (result.value) {
        this.model.attributes.splice(i,1);
      }
    });
  }

}
