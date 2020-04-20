import {Component, OnInit, Directive, Input, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import { Rules } from '../../util/rulesEngine';

declare var $: any;

@Component({
    selector: 'app-nav',
    templateUrl: './app-nav.component.html',
    styleUrls: ['./app-nav.component.scss']
})
export class AppNavComponent implements OnInit, OnChanges {

    @Input() mainmenu: any;
    @Input() mainUlClass: any;
    @Input() random: any;
    @Input() urlPath: string;
    @Output() _hasSubMenus =  new EventEmitter<any>();
    // urlPath: string;

    subMenu: any;
    clearPreselectedMenuItem: boolean;
    selected: any;
    selectedUrl: any;
    menu: any;

    // Navigation rules
    showSubmenu: boolean = true;

    constructor(public router: Router, private translate: TranslateService) {

        this.initConstVars();
    }

    initConstVars() {

        if(typeof this.mainUlClass == "undefined")
            this.mainUlClass = "nav navbar-nav main-menu";

        // recurse & Set css property on init
        // this.recurse(this.mainmenu)

        let customerInfo =  JSON.parse( localStorage.getItem('customerInfo'));

        if( customerInfo && customerInfo.org && "hasTemplates" in customerInfo.org ) {
            // Rules for Order Submenu
            var hasTemplates = customerInfo.org.hasTemplates;
            var rules = new Rules(hasTemplates, [ Rules.exists,  ] );
            this.showSubmenu = rules.runRule();
            // if ( this.mainmenu && this.mainmenu.id == "orders" && !this.showSubmenu )
            //     delete this.mainmenu.submenu;
            // Rules for Order Submenu-
        }

    }

    ngOnChanges(changes: SimpleChanges) {
        //
        this.selectedUrl = this.router.url;
        // Set selected on the main nav level
        this.setSelectedMenu(this.mainmenu)

        if (
            changes['mainmenu'] ||
            changes['subMenu'] ||
            changes['mainUlClass'] ||
            changes['urlPath']
        ) {
            // Nothing here really!!!
        }


    }

    // setSelectedMenu(i, bool) {
    setSelectedMenu(mainmenu) {
        // i.selected = bool;
        // this.selected = i;
        if (mainmenu) {
            mainmenu.forEach(element => {
                element.selected = (this.selectedUrl.substr(1) === element.url) || (this.selectedUrl.substr(0, this.selectedUrl.lastIndexOf('/')).substr(1) === element.url);
                if (element.selected) {
                    this.showSubmenu = element.submenu && element.submenu.length;
                    this._hasSubMenus.emit({ hasSubMenu : !!(element.submenu && element.submenu.length) , level: element.level });
                }
            }), this;
        }
    }

    addCss(di) {
        if(!di.css)
            di.css = ' display-none';
        else
            di.css += '';
    }

    removeCss(di) {
        if(di.css)
            di.css = '';
    }

    ngOnInit() {
        // console.log('onInit mainmenu >>>')
        // console.log(this.mainmenu);
        this.mainUlClass = this.mainUlClass;
    }

    compareUrl(pageUrlPath, liUrlPath) {
        // instead of liUrlPath,
        // break liUrlPath in parts divided by 'slash' &
        // take -1th element of the returning array
        const newLiUrlArr = this.breakLiUrl(liUrlPath);
        const minus1Elem = newLiUrlArr[newLiUrlArr.length - 2]
        const ret = pageUrlPath.indexOf (minus1Elem) != -1;
        return ret;
    }

    breakLiUrl(liUrlPath) {
        return liUrlPath.split("/");
    }

    replaceApp( str ) {
        const ret = str.replace(/.*app/, '');

        return ret;
    }

    // This `recurse` function not getting used at the moment
    recurse(li) {
        // console.log("REcuRES LI: ", li);
        // Tail Recursion
        // If condition, since, at first instance, the mainmenu is still to be loaded
        if(li) {
                // console.log("this.router.url ++++ ", this.router.url);
            for( let i = 0; i < li.length; i++) {

                // If url's don't match
                if( this.compareUrl(this.urlPath, li[i].url ) !== true ) {
                // if( this.compareUrl( window.location.pathname , li[i].url ) !== true ) {
                // if( this.compareUrl( this.router.url , li[i].url ) !== true ) {
                    this.addCss(li[i])
                    // this.setSelectedMenu(li[i], false)
                    // console.log( "LI i css: --- ", li[i]);
                } else {
                    // If url's match
                    // this.setSelectedMenu(li[i], true)
                    this.removeCss(li[i])
                }

                if(li[i].submenu) {
                    this.recurse(li[i].submenu)
                }
            }
        }
    }



    // func Not getting used
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
        if (object.url) {
            this.urlPath = object.url;

            this.router.navigate([object.url]);
        }
        // if (this.mainmenu[position]) {
        //     this.subMenu = this.mainmenu[position].submenu;
        // }

        // this.recurse(this.mainmenu);
    }

    isActive(position) {
        return this.selected === position;
    }

}
