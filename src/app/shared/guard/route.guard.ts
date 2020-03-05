import { Injectable } from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';

@Injectable()
export class RouteGuard implements CanLoad {
    showSpinner: boolean;
    constructor(
        private router: Router
    ) {
    }

    canLoad(route: Route): boolean {
        const AccessToken: any = localStorage.getItem('accessToken');
        if (!AccessToken) {
            this.router.navigate(['/login']).then(res => {
                this.showSpinner = false;
            });
        }
        if ((window.location.pathname === "/" || window.location.pathname === "/login"
            || window.location.pathname === "/login/") && AccessToken) {          
            this.router.navigate(['/app/dashboards/']).then(res => {
                this.showSpinner = false;
            });
        }
        return true;
    }
}
