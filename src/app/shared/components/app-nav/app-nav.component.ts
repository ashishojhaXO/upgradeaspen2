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
    @Input() mainUlClass: any;
    @Input() random: any;

    subMenu: any;
    clearPreselectedMenuItem: boolean;
    selected: any;
    menu: any;
    // urlPath: string;

    constructor(public router: Router, private translate: TranslateService) {
        
        this.initConstVars();
    }

    initConstVars() {
        // this.urlPath = window.location.pathname;
        // this.urlPath = this.urlPath.replace( /.*app/, '');

        if(typeof this.mainUlClass == "undefined") 
            this.mainUlClass = "main-menu";
        
        // recurse & Set css property on init
        this.recurse(this.mainmenu)
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['mainmenu'] || changes['subMenu'] || changes['mainUlClass'] || changes['random'] ) {

            console.log('mainmenu >>>')
            console.log(this.mainmenu);

            console.log('subMenu >>>')
            console.log(this.subMenu);

            console.log('mainUlClass >>>')
            console.log(this.mainUlClass);

            console.log('random >>>')
            console.log(this.random);

            // this.getMenuItems();
            // this.getMenuItems(this.menu);

            // OnChange, recurse & add css
            this.recurse(this.mainmenu)
            // this.addCss();
        }

    }

    addCss(di) {
        console.log("+++ FIRST DI: ", di);
        if(!di.css)
            di.css = ' display-none';
        else
            di.css += '';
        
       console.log("++++SECOND DI: ", di);
    }

    removeCss(di) {
        if(di.css)
            di.css = '';
    }

    ngOnInit() {

        console.log('onInit mainmenu >>>')
        console.log(this.mainmenu);

        // this.menu = this.mainmenu;
        this.mainUlClass = this.mainUlClass;

        console.log('onInit mainmenu 22 >>>')
        console.log(this.mainmenu);

        console.log('onInit mainUlClass >>>')
        console.log(this.mainUlClass);

        // this.getMenuItems();
        // this.getMenuItems(this.menu);
    }

    setSelected(pageUrlPath, liUrlPath) {
        // instead of liUrlPath, 
        // break liUrlPath in parts divided by 'slash' &
        // take -1th element of the returning array
        const newLiUrlArr = this.breakLiUrl(liUrlPath);

        const minus1Elem = newLiUrlArr[newLiUrlArr.length - 2]

        const ret = pageUrlPath.indexOf (minus1Elem) != -1;
        
        console.log("set SELEC: ", 
            pageUrlPath, liUrlPath, newLiUrlArr, minus1Elem, 
        " RET: ", ret
        );

        return ret;
    }

    breakLiUrl(liUrlPath) {
        return liUrlPath.split("/");
    }

    replaceApp( str ) {
        const ret = str.replace(/.*app/, '');

        return ret;
    }

    recurse(li) { 
        console.log("REcuRES LI: ", li);
        // Tail Recursion
        // If condition, since, at first instance, the mainmenu is still to be loaded
        if(li) {
            for( let i = 0; i < li.length; i++) { 
                
                // if( this.setSelected(this.urlPath, li[i].url ) !== true ) {
                // if( this.setSelected( window.location.pathname , li[i].url ) !== true ) {
                if( this.setSelected( this.router.url , li[i].url ) !== true ) {
                    this.addCss(li[i])
                    console.log( "LI i css: --- ", li[i]);
                } else {
                    this.removeCss(li[i])

                }

                if(li[i].submenu) { 
                    this.recurse(li[i].submenu) 
                }
            }
        }
    }

    // getMenuItems(menu) {
    //     console.log("getMenuItems: ", menu);
    //     if (menu) {
    //         const urlParts = menu.indexOf('/') != -1 ? menu.split('/') : menu;

    //         const corr = this.mainmenu.find(x => x.url === (urlParts[1] + '/' + urlParts[2]));

    //         console.log("urlPar, corr: ", urlParts, corr);

    //         if (corr) {
    //             this.mainmenu[this.mainmenu.indexOf(corr)].selected = true;

    //         console.log("IF this.mainmenu: ", this.mainmenu , this.mainmenu.indexOf(corr) , this.mainmenu[this.mainmenu.indexOf(corr)] );

    //             if (this.mainmenu[this.mainmenu.indexOf(corr)].submenu) {

    //         console.log("IF 2 this.mainmenu: ", this.mainmenu , this.mainmenu.indexOf(corr) , this.mainmenu[this.mainmenu.indexOf(corr)] );

    //                 this.subMenu = this.mainmenu[this.mainmenu.indexOf(corr)].submenu;
    //                 this.getMenuItems(this.subMenu);

    //         //         if (urlParts[3]) {
    //         // console.log("IF 3 this.subMenu: ", this.subMenu , this.mainmenu.indexOf(corr) , this.mainmenu[this.mainmenu.indexOf(corr)] );

    //         //             const corr1 = this.mainmenu[this.mainmenu.indexOf(corr)].submenu.find(x => x.id === urlParts[3]);

    //         //             if (corr1) {
    //         //                 this.mainmenu[this.mainmenu.indexOf(corr)].submenu[this.mainmenu[this.mainmenu.indexOf(corr)].submenu.indexOf(corr1)].selected = true;

    //         // console.log(
    //         //     "IF 4 corr1 this.mainmenu: ", 
    //         //     this.mainmenu[this.mainmenu.indexOf(corr)].submenu[this.mainmenu[this.mainmenu.indexOf(corr)].submenu.indexOf(corr1)]
    //         // );

    //         //             }
    //                 // }

    //             }
    //         }
    //     }
    // }


    getMenuItems() {
        if (window.location.pathname) {
            const urlParts = window.location.pathname.indexOf('/') != -1 ? window.location.pathname.split('/') : window.location.pathname;
            const corr = this.mainmenu.find(x => x.url === (urlParts[1] + '/' + urlParts[2]));

            // console.log("urlPar, corr: ", urlParts, corr);

            if (corr) {
                this.mainmenu[this.mainmenu.indexOf(corr)].selected = true;

            // console.log("IF this.mainmenu: ", this.mainmenu , this.mainmenu.indexOf(corr) , this.mainmenu[this.mainmenu.indexOf(corr)] );
                if (this.mainmenu[this.mainmenu.indexOf(corr)].submenu) {
            // console.log("IF 2 this.mainmenu: ", this.mainmenu , this.mainmenu.indexOf(corr) , this.mainmenu[this.mainmenu.indexOf(corr)] );
                    this.subMenu = this.mainmenu[this.mainmenu.indexOf(corr)].submenu;
                    if (urlParts[3]) {
            // console.log("IF 3 this.subMenu: ", this.subMenu , this.mainmenu.indexOf(corr) , this.mainmenu[this.mainmenu.indexOf(corr)] );
                        const corr1 = this.mainmenu[this.mainmenu.indexOf(corr)].submenu.find(x => x.id === urlParts[3]);
                        if (corr1) {
                            this.mainmenu[this.mainmenu.indexOf(corr)].submenu[this.mainmenu[this.mainmenu.indexOf(corr)].submenu.indexOf(corr1)].selected = true;
            // console.log(
            //     "IF 4 corr1 this.mainmenu: ", 
            //     this.mainmenu[this.mainmenu.indexOf(corr)].submenu[this.mainmenu[this.mainmenu.indexOf(corr)].submenu.indexOf(corr1)]
            // );
                        }
                    }
                }
            }
        }
    }

    loadOptions(position, object) {
        // remove pre-selected option from the configured JSON
        // if (!this.clearPreselectedMenuItem) {
        //     const preselectedOption = this.mainmenu.find(x => x.selected);
        //     if (preselectedOption) {
        //         preselectedOption.selected = false;
        //         this.clearPreselectedMenuItem = true;
        //     }
        // }
        // this.selected = position;


        if (object.url) {
            this.router.navigate([object.url]);
        }
        // if (this.mainmenu[position]) {
        //     this.subMenu = this.mainmenu[position].submenu;
        // }

        this.recurse(this.mainmenu);
    }

    isActive(position) {
        return this.selected === position;
    }

}
