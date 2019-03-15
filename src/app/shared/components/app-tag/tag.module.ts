import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TagInputModule} from 'ngx-chips';
import {TagComponent} from './tag.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TagInputModule
  ],
  declarations: [
    TagComponent
  ],
  exports: [TagComponent]
})
export class TagModule {
}
