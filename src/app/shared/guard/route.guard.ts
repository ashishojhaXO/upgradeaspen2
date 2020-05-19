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

    this.activatedRoute.queryParams.subscribe(params => {
      //  this.id = +params['id']; // (+) converts string 'id' to a number
       console.log("ROOO: ", params)
    })

        const AccessToken: any = localStorage.getItem('accessToken');
        console.log("rGUARD");

        if (!AccessToken) {
        console.log("NOAT");
            this.router.navigate(['/login'], {queryParamsHandling: 'preserve'} ).then(res => {
                this.showSpinner = false;
            });
        }
        if ((window.location.pathname === "/" || window.location.pathname === "/login"
            || window.location.pathname === "/login/") && AccessToken) {          
            this.router.navigate(['/app/dashboards/'] ).then(res => {
                this.showSpinner = false;
            });
        }
        return true;
    }
}
