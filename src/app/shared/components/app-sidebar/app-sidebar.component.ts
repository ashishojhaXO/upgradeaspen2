import { Component, OnInit, Directive } from '@angular/core';
import { Router } from '@angular/router';
import * as preference from '../../../../localService/preference.json';

declare var $: any;

@Component({
    selector: 'app-sidebar1',
    templateUrl: './app-sidebar.component.html',
    styleUrls: ['./app-sidebar.component.scss']
})
@Directive({
    selector: '[appRouterLinkActive]',
    exportAs: 'routerLinkActive'
})
export class AppSidebarComponent implements OnInit {

    constructor(public router: Router) {
    }

    ngOnInit() {

      // $(window ).resize(function() {
      //   if ($(window).width() < 1500) {
      //     $('.sidebar').addClass('closed');
      //     $('.sidebar-toggle').addClass('collapsed');
      //     $('.app-container').addClass('expanded');
      //     $('.sidebar-form').addClass('hide');
      //     if ($(window).width() < 1358) {
      //       $('.sidebar').addClass('hide');
      //     } else {
      //       $('.sidebar').removeClass('hide');
      //     }
      //   }
      // });
    }

  toggleSideBar() {
    $('.sidebar').toggleClass('closed');
    $('.sidebar .sidebar-toggle .fa').toggleClass('fa-caret-left fa-caret-right');
    $('.sidebar-toggle').toggleClass('collapsed');
    $('.sidebar-form').toggleClass('hide');
    $('.app-container').toggleClass('expanded');
  }
}
