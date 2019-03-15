import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TreeMenuComponent } from './tree-menu.component';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'angular-tree-component';
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    TreeModule
  ],
  declarations: [
    TreeMenuComponent
  ],
  exports: [ TreeMenuComponent ],
  providers: []
})
export class TreeMenuModule { }
