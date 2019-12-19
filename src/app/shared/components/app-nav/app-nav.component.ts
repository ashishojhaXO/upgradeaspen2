import {Component, OnInit, Directive, Input, OnChanges, SimpleChanges} from '@angular/core';
import { Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

declare var $: any;

@Component({
    selector: 'app-nav',
    templateUrl: './app-nav.component.html',
    styleUrls: ['./app-nav.component.scss']
})
export class AppNavComponent implements OnInit, OnChanges {

    @Input() mainmenu: any;
    subMenu: any;
    clearPreselectedMenuItem: boolean;
    selected: any;

    constructor(public router: Router, private translate: TranslateService) {
    }

    ngOnInit() {
        this.getMenuItems();
    }

    getMenuItems() {
        if (window.location.pathname) {
            const urlParts = window.location.pathname.indexOf('/') != -1 ? window.location.pathname.split('/') : window.location.pathname;
            const corr = this.mainmenu.find(x => x.url === (urlParts[1] + '/' + urlParts[2]));
            if (corr) {
                this.mainmenu[this.mainmenu.indexOf(corr)].selected = true;
                if (this.mainmenu[this.mainmenu.indexOf(corr)].submenu) {
                    this.subMenu = this.mainmenu[this.mainmenu.indexOf(corr)].submenu;
                    if (urlParts[3]) {
                        const corr1 = this.mainmenu[this.mainmenu.indexOf(corr)].submenu.find(x => x.id === urlParts[3]);
                        if (corr1) {
                            this.mainmenu[this.mainmenu.indexOf(corr)].submenu[this.mainmenu[this.mainmenu.indexOf(corr)].submenu.indexOf(corr1)].selected = true;
                        }
                    }
                }
            }
        }
    }

    loadOptions(position, object) {
        // remove pre-selected option from the configured JSON
        if (!this.clearPreselectedMenuItem) {
            const preselectedOption = this.mainmenu.find(x => x.selected);
            if (preselectedOption) {
                preselectedOption.selected = false;
                this.clearPreselectedMenuItem = true;
            }
        }
        this.selected = position;
        if (object.url) {
            this.router.navigate([object.url]);
        }
        if (this.mainmenu[position]) {
            this.subMenu = this.mainmenu[position].submenu;
        }
    }

    isActive(position) {
        return this.selected === position;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['mainmenu']) {

            console.log('mainmenu >>>')
            console.log(this.mainmenu);

            console.log('subMenu >>>')
            console.log(this.subMenu);

            this.getMenuItems();
        }
    }
}
