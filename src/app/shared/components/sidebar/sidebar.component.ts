import { Component, OnInit, Directive } from '@angular/core';
import { Router } from '@angular/router';
import * as preference from '../../../../localService/preference.json';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
@Directive({
    selector: '[appRouterLinkActive]',
    exportAs: 'routerLinkActive'
})
export class SidebarComponentDirective implements OnInit {

    sideMenu: object;
    urlMatching: string;
    activeMenu: string;

    constructor(public router: Router) {
        this.sideMenu = preference['admin'];
        this.urlMatching = this.router.url.replace('/', '');
        this.activeMenu = localStorage.getItem('activeMenu');
    }

    ngOnInit() {
    }

}
