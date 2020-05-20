import { Component, DoCheck, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { McBreadcrumbsConfig } from 'ngx-breadcrumbs';
declare var $: any;
declare var jquery: any;
import 'datatables.net';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements DoCheck, OnInit {

  activeSidebar: boolean;
  hasSubMenu: boolean;

  constructor(public router: Router, private route: ActivatedRoute, private breadcrumbsConfig: McBreadcrumbsConfig) {
  }

  routeActive: any = true;

  ngDoCheck() {
    this.routeActive = this.router.url === '/';
    setTimeout(() => {
      $('.multiselect-dropdown').attr('tabindex', '0');
    }, 500);
  }

  ngOnInit() {

    console.log("LAYYO: ")
  }

  _hasSubMenus(e) {
    this.hasSubMenu = e.hasSubMenu;
  }

}
