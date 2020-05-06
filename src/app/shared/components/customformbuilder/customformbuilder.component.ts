import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { field } from "./customformbuilder.model";
import Swal from 'sweetalert2';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { Headers, RequestOptions, Http } from '@angular/http';
import { OktaAuthService } from '../../../../services/okta.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-customformbuilder',
  templateUrl: './customformbuilder.component.html',
  styleUrls: ['./customformbuilder.component.scss']
})
export class CustomFormbuilderComponent implements OnInit {

  @Input() isBaseField: boolean;
  @Input('fieldData') fieldData;
  @Input('editTemplate') editTemplate;
  @Input() clearSelectedFields: any;
  @Input('builderFor') builderFor;
  @Output('onShowSpinner') onShowSpinner: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() org: any;
  api_fs: any;
  externalAuth: any;
  showSpinner: boolean;
  widget: any;
  dependentOnOptions = [];
  select2Options = {
    multiple: true
  };

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
            "name": "Text"
          },
          {
            "id": "",
            "dropType": "email",
            "type": "text",
            "icon": "fa-envelope",
            "name": "Email"
          },
          {
            "id": "",
            "dropType": "phone",
            "type": "int",
            "icon": "fa-phone",
            "name": "Phone"
          },
          {
            "id": "",
            "dropType": "number",
            "type": "int",
            "icon": "fa-html5",
            "name": "Number"
          },
          {
            "id": "",
            "dropType": "amount",
            "type": "amount",
            "icon": "fa-usd",
            "name": "Amount"
          },
          {
            "id": "",
            "dropType": "date",
            "type": "date",
            "icon":"fa-calendar",
            "name": "Date"
          },
          {
            "id": "",
            "dropType": "textarea",
            "type": "text",
            "icon":"fa-text-width",
            "name": "Textarea"
          },
          {
            "id": "",
            "dropType": "checkbox",
            "type": "checkbox",
            "icon":"fa-list",
            "name": "Checkbox"
          },
          {
            "id": "",
            "dropType": "radio",
            "type": "radio",
            "icon":"fa-list-ul",
            "name": "Radio"
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
        //console.log('from custom field input >>', this.fieldData);
        if(this.fieldData){
          this.fieldData.forEach(element => {
            if(element.type == 'varchar' || element.type == 'text' || element.type == 'string'){
              element.dropType = 'text';
              element.attr_list = "";
              if(element.validation == null){
                element.validation = [];
              }
              // element.validation = {
              //   required : element.validation == null ? 0 : element.validation.required
              // }
            }else if(element.type == 'int' || element.type == "decimal"){
              element.dropType = 'number';
              element.attr_list = "";
              // element.validation = {
              //   required : element.validation == null ? 0 : element.validation.required
              // }
              if(element.validation == null){
                element.validation = [];
              }
            }else if(element.type == 'list'){
              element.dropType = 'autocomplete';
              // element.validation = {
              //   required : element.validation == null ? 0 : element.validation.required
              // }
              if(element.validation == null){
                element.validation = [];
              }
            }else if(element.type == 'radio'){
              element.dropType = 'radio';
              // element.validation = {
              //   required : element.validation == null ? 0 : element.validation.required
              // }
              if(element.validation == null){
                element.validation = [];
              }
            }else if(element.type == 'checkbox'){
              element.dropType = 'checkbox';
              if(element.default_value){
                element.checkboxDefault = element.default_value.split(', ');
                console.log(element.checkboxDefault, element.default_value);
              }
              // element.validation = {
              //   required : element.validation == null ? 0 : element.validation.required
              // }
              if(element.validation == null){
                element.validation = [];
              }
            }else {
              element.dropType = element.type;
              // element.validation = {
              //   required : element.validation == null ? 0 : element.validation.required
              // }
              if(element.validation == null){
                element.validation = [];
              }
            }

            this.model.attributes.push(element);
          });

          this.updateDependentOnList();
          console.log('list>>>>>>>>>', this.model);
        }
      }
    }

    if (changes['org'] || changes['clearSelectedFields']) {
      if (this.org) {
        this.getAttributes();
      }
      if (changes['clearSelectedFields']) {
        this.model.attributes = [];
      }
    }
  }

  OnDependentOnChanged(e: any, item): void {
    if (!item.request_dependent_property || item.request_dependent_property !== e.value ) {
      item.request_dependent_property = e.value;
    }
  }

  getAttributes(){
    this.getAttributeService().subscribe(
      response => {
        if (response && response.attributes) {
          //console.log('response from get attributes', response.attributes);
          const fieldModels = response.attributes;
          if (this.builderFor === 'order'){
            this.fieldModels = this.sortAttributes('order', fieldModels);
          }else if (this.builderFor === 'lineitem') {
            this.fieldModels = this.sortAttributes('lineitem', fieldModels);
          } else {
            this.fieldModels = fieldModels;
          }
          this.fieldModels.forEach(element => {
            element.validation = [];
            if(element.type == 'varchar' || element.type == 'text' || element.type == 'string'){
              element.dropType = 'text';
              element.attr_list = "";
            }else if(element.type == 'int' || element.type == "decimal"){
              element.dropType = 'number';
              element.attr_list = "";
            }else if(element.type == 'list'){
              element.dropType = 'autocomplete';
              element.attr_list =  {
                "options": []
              }
            }else if(element.type == 'radio'){
              element.dropType = 'radio';
              element.attr_list =  {
                "options": []
              }
            }else if(element.type == 'checkbox'){
              element.dropType = 'checkbox';
              element.checkboxDefault = [];
              element.attr_list =  {
                "options": []
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
          let self = this;
          this.widget.refreshElseSignout(
            this,
            err,
            self.getAttributes.bind(self)
          );
        } else {
          this.showSpinner = false;
          Swal({
            title: 'An error occurred',
            html: err._body ? JSON.parse(err._body).message : 'No error definition available',
            type: 'error'
          });
        }
      }
    );
  }

  getAttributeService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    console.log('this.org >>>')
    console.log(this.org);

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    var url = this.api_fs.api + '/api/orders/templates/attributes' + ( this.org ? ('?org_uuid=' + this.org) : '');
    return this.http
        .get(url, options)
        .map(res => {
          return res.json();
        }).share();
  }

  sortAttributes(value, arr) {
    arr.forEach((element, index) => {
      if(element.core === value){
        arr.unshift(arr.splice(index, 1)[0]);
      }
    })
    return arr;
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

  onDrop( event:DndDropEvent, list?:any[], isBaseField: boolean = false ) {
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

      if(event.dropEffect === "copy" && !isBaseField) {
        const checkDup = list.find(x => x.name === event.data.name);
        if (checkDup) {
          Swal({
            title: 'Duplicate Field',
            // html: item.request_mapped_property ? responseLookup[item.request_mapped_property] : JSON.stringify(responseLookup),
            html: 'The field "' + event.data.name + '" already exists in the defined fields ',
            type: 'error'
          });
          return;
        }
      }

      list.splice( index, 0, event.data );
    }

    this.updateDependentOnList(event.data);
  }

  updateDependentOnList(item = null) {
    this.dependentOnOptions = [];
    this.model.attributes.forEach(function (ele) {
     // const skip = item && item.name && item.name === ele.name;
      this.dependentOnOptions.push({
        id: ele.name,
        text: ele.name
      });
    }, this);
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
        this.updateDependentOnList();
      }
    });
  }

  validationSet(field: string, value:boolean, item){
    if(value){
      item.validation.push(field)
      if (field === 'apiLookup') {
        item.request_mapped_property = 'data';
      }
    }else{
      item.validation.splice(item.validation.indexOf(field), 1)
      if(field === 'apiLookup') {
        item.request_type = '';
        item.request_url = '';
        item.request_payload = '';
        item.request_mapped_property = '';
        item.request_dependent_property = '';
      }
    }
  }

  onCalculatedClick(item) {
    item.calculated = item.calculated === 0 ? 1 : 0;
  }

  onCheckboxClick(value, isChecked, item){
    if(isChecked) {
      item.checkboxDefault.push(value);
    } else {
      let index = item.checkboxDefault.indexOf(value);
      item.checkboxDefault.splice(index,1);
    }
    item.default_value = item.checkboxDefault.join(', ');
  }

  ValidateAPILookUp(item) {
    this.onShowSpinner.emit(true)

    this.performApiLookUpForValue(item.request_type, item.request_url, item.request_payload).subscribe(
        responseLookup => {
          // if (item.request_mapped_property) {
          //   if (item.dropType === 'autocomplete' || item.dropType === 'checkbox' || item.dropType === 'radio') {
          //     if (Object.prototype.toString.call(responseLookup[item.request_mapped_property]) === '[object Array]') {
          //       item.default_value = responseLookup[item.request_mapped_property].length ? responseLookup[item.request_mapped_property][0] : '';
          //       const options = [];
          //       responseLookup[item.request_mapped_property].forEach(function (prop) {
          //         options.push({
          //           "option": prop
          //         });
          //       });
          //       item.attr_list.options = options;

          //       console.log("ITEM: ", item, ", options: ", options)

          //     } else {
          //       item.default_value = responseLookup[item.request_mapped_property];
          //       item.attr_list.options = [{
          //         "option": responseLookup[item.request_mapped_property]
          //       }];
          //     }
          //   } else {
          //     item.default_value = responseLookup[item.request_mapped_property];
          //   }
          // }
          // else {

            this.onShowSpinner.emit(false);

            Swal({
              title: 'Validation Successful',
              // html: item.request_mapped_property ? responseLookup[item.request_mapped_property] : JSON.stringify(responseLookup),
              html: "Field validated successfully.",
              type: 'success'
            }).then((value)=>{
              // this.onShowSpinner.emit(false);
            }, (err)=>{
              // this.onShowSpinner.emit(false);
            });
              // this.onShowSpinner.emit(false);

            let keys = Object.keys(responseLookup).filter((value, index)=> {
              return value != "status";
            })

            item.request_mapped_property = keys[0];

          // }
        },
        err => {
          this.onShowSpinner.emit(false);

          Swal({
            title: 'Validation Failed',
            html: 'Response could not be validated',
            type: 'error'
          });

        });

  }

  performApiLookUpForValue(requestType, requestUrl, requestPayload) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }

    const data = requestPayload ? requestPayload : {};
    const apiPath = this.api_fs.api;

    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
    const options = new RequestOptions({headers: headers});
    if(requestType === 'post') {
      return this.http
          .post(apiPath + requestUrl, data, options)
          .map(res => {
            return res.json();
          }).share();
    } else if (requestType === 'get') {
      return this.http
          .get(apiPath + requestUrl, options)
          .map(res => {
            return res.json();
          }).share();
    }
  }
}
