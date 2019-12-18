import { Component, OnInit, Directive, Input } from '@angular/core';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-nav',
    templateUrl: './app-nav.component.html',
    styleUrls: ['./app-nav.component.scss']
})
export class AppNavComponent implements OnInit {

    @Input() navItems: any;
    constructor(public router: Router) {
    }

    ngOnInit() {

    }
}
