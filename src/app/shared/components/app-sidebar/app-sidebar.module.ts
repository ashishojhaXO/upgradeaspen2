import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppSidebarComponent} from './app-sidebar.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AppSidebarComponent
  ],
  exports: [AppSidebarComponent]
})
export class AppSidebarModule {
}
