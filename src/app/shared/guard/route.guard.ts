import { Injectable } from '@angular/core';
import { Router, CanLoad, Route, ActivatedRoute } from '@angular/router';

@Injectable()
export class RouteGuard implements CanLoad {
    showSpinner: boolean;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
    }

    canLoad(route: Route): boolean {
        const AccessToken: any = localStorage.getItem('accessToken');
        if (!AccessToken) {
            this.router.navigate(['/login'], {queryParamsHandling: 'preserve'} ).then(res => {
                this.showSpinner = false;
            });
        }
        if ((window.location.pathname === "/" || window.location.pathname === "/login"
            || window.location.pathname === "/login/") && AccessToken) {
            if (this.isSupportRole()) {
                this.router.navigate(['app/admin/invoices']).then( res => {
                    this.showSpinner = false;
                });
            } else {
                this.router.navigate(['/app/dashboards/'] ).then(res => {
                    this.showSpinner = false;
                });
            }

        }
        return true;
    }

    isSupportRole() {
        const groupArr = [];
        const groups = localStorage.getItem('loggedInUserGroup') || '';
        if (groups) {
            const grp = JSON.parse(groups);
            grp.forEach(function (item) {
                groupArr.push(item);
            });
        }
        let isRoot = false;
        let isAdmin = false;
        let isSupport = false;
        if (groupArr.length) {
            groupArr.forEach(function (grp) {
                if (grp === 'ROOT' || grp === 'SUPER_USER' || grp === 'ORG_ADMIN' || grp === 'SUPPORT') {
                    if(grp === 'ORG_ADMIN') {
                        isAdmin = true;
                    }
                    if (grp === 'ROOT' || grp === 'SUPER_USER') {
                        isRoot = true;
                    }
                    if (grp === 'SUPPORT') {
                        isSupport = true;
                    }
                }
            });
        }
        return isSupport;
    }
}
