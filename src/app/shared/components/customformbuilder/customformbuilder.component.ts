import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { field } from "./customformbuilder.model";
import Swal from "sweetalert2";
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { Headers, RequestOptions, Http } from '@angular/http';
import { OktaAuthService } from '../../../../services/okta.service';

@Component({
  selector: 'app-customformbuilder',
  templateUrl: './customformbuilder.component.html',
  styleUrls: ['./customformbuilder.component.scss']
})
export class CustomFormbuilderComponent implements OnInit {

  @Input() isBaseField: boolean;
  @Input('fieldData') fieldData;
  @Input('editTemplate') editTemplate;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;

  value = {
    option: ""
  }


  fieldModels: Array<field>=[];
  modelFields:Array<field>=[];

  model:any = {
    attributes:this.modelFields
  };

  constructor( 
    private okta: OktaAuthService, 
    private http: Http) {
  }

  ngOnInit() {
      if (this.isBaseField) {
        this.fieldModels = [
          {
            "id": "",
            "dropType": "text",
            "type": "varchar",
            "icon": "fa-font",
            "name": "text"
          },
          {
            "id": "",
            "dropType": "email",
            "type": "text",
            "icon": "fa-envelope",
            "name": "email"
          },
          {
            "id": "",
            "dropType": "phone",
            "type": "int",
            "icon": "fa-phone",
            "name": "phone"
          },
          {
            "id": "",
            "dropType": "number",
            "type": "int",
            "icon": "fa-html5",
            "name": "number"
          },
          {
            "id": "",
            "dropType": "amount",
            "type": "amount",
            "icon": "fa-usd",
            "name": "amount"
          },
          {
            "id": "",
            "dropType": "date",
            "type": "date",
            "icon":"fa-calendar",
            "name": "date"
          },
          {
            "id": "",
            "dropType": "textarea",
            "type": "text",
            "icon":"fa-text-width",
            "name": "textarea"
          },
          {
            "id": "",
            "dropType": "checkbox",
            "type": "checkbox",
            "icon":"fa-list",
            "name": "checkbox"
          },
          {
            "id": "",
            "dropType": "radio",
            "type": "radio",
            "icon":"fa-list-ul",
            "name": "radio"
          },
          {
            "id": "",
            "dropType": "autocomplete",
            "type": "list",
            "icon":"fa-bars",
            "name": "List"
          }
        ];
      } else{
        this.showSpinner = true;
        this.widget = this.okta.getWidget();
        this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
        this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));
        this.getAttributes();
      }
  }

  ngOnChanges(changes: SimpleChanges){
    if(this.editTemplate){
      if(changes['fieldData']){
        console.log('from custom field input >>', this.fieldData);
        if(this.fieldData){
          this.fieldData.forEach(element => {
            if(element.type == 'varchar' || element.type == 'text' || element.type == 'string'){
              element.dropType = 'text';
              element.attr_list = "";
              element.validation = {
                required : element.validation == null ? 0 : element.validation.required
              }
            }else if(element.type == 'int' || element.type == "decimal"){
              element.dropType = 'number';
              element.attr_list = "";
              element.validation = {
                required : element.validation == null ? 0 : element.validation.required
              }
            }else if(element.type == 'list'){
              element.dropType = 'autocomplete';
              element.validation = {
                required : element.validation == null ? 0 : element.validation.required
              }
            }else if(element.type == 'radio'){
              element.dropType = 'radio';
              element.validation = {
                required : element.validation == null ? 0 : element.validation.required
              }
            }else if(element.type == 'checkbox'){
              element.dropType = 'checkbox';
              element.validation = {
                required : element.validation == null ? 0 : element.validation.required
              }
            }else {
              element.dropType = element.type;
              element.validation = {
                required : element.validation == null ? 0 : element.validation.required
              }
            }
            this.model.attributes.push(element);
          });
          console.log('list>>>>>>>>>', this.model);
        }
      }
    }
  }

  getAttributes(){
    this.getAttributeService().subscribe(
      response => {
        if (response && response.attributes) {
          //console.log('response from get attributes', response.attributes);
          this.fieldModels = response.attributes;
          this.fieldModels.forEach(element => {
            element.validation = {required : false};
            element.disable = 0;
            if(element.type == 'varchar' || element.type == 'text' || element.type == 'string'){
              element.dropType = 'text';
              element.attr_list = "";
            }else if(element.type == 'int' || element.type == "decimal"){
              element.dropType = 'number';
              element.attr_list = "";
            }else if(element.type == 'list'){
              element.dropType = 'autocomplete';
              element.attr_list =  {
                "options": [
                  {
                      "option": "value1"
                  },
                  {
                      "option": "value2"
                  }
                ]
              }
            }else if(element.type == 'radio'){
              element.dropType = 'radio';
              element.attr_list =  {
                "options": [
                  {
                      "option": "value1"
                  },
                  {
                      "option": "value2"
                  }
                ]
              }
            }else if(element.type == 'checkbox'){
              element.dropType = 'checkbox';
              element.attr_list =  {
                "options": [
                  {
                      "option": "value1"
                  },
                  {
                      "option": "value2"
                  }
                ]
              }
            }else {
              element.dropType = element.type;
            }
          });
          // console.log('attributes drop fields', this.fieldModels);
        }
      },
      err => {
        if(err.status === 401) {
          if(localStorage.getItem('accessToken')) {
            this.widget.tokenManager.refresh('accessToken')
                .then(function (newToken) {
                  localStorage.setItem('accessToken', newToken);
                  this.showSpinner = false;
                  this.getAttributeService();
                })
                .catch(function (err) {
                  console.log('error >>')
                  console.log(err);
                });
          } else {
            this.widget.signOut(() => {
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            });
          }
        } else {
          this.showSpinner = false;
        }
      }
    );
  }

  getAttributeService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken.accessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/templates/attributes';
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
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
      if(!this.isBaseField){
        event.data.label = event.data.name;
      }
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
