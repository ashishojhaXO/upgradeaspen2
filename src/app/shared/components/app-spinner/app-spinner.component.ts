import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Common } from '../../util/common';
import { Observable } from 'rxjs/Observable';
import { AppPopUpComponent } from '../app-pop-up/app-pop-up.component';

@Component({
    selector: 'app-custom-spinner',
    templateUrl: './app-spinner.component.html',
    styleUrls: ['./app-spinner.component.scss'],
    providers: [AppPopUpComponent]
})
export class AppSpinnerComponent implements OnInit {

    // Configs here
    config = {
        // Max timer that this loading spinner can be shown on the page
        networkCallWaitTimeMax: 60000,
        pageReloadCountdownTimerMax: 3000,
    }

    // If this instance has been initiated for more than 60 secconds(1 minute)
    // Show a popUp to load page again/ destroy this self instance
    // countdownTimer: Number = this.config.coutdownTimerMax;
    countdownTimer: any;

    @Input()
    showSpinnerFlag: boolean;

    constructor(
        private translate: TranslateService,
        private elt: ElementRef,
        public router: Router, private common: Common,
        private popUp: AppPopUpComponent
    ) {

    }

    ngOnInit() {
        this.startTimerCond()
    }

    ngAfterViewInit() {}

    ngOnDestroy() {
        this.stopTimerCond()
    }

    startTimerCond() {
        // Only start/stop timers if showSpinnerFlag is passed,
        // not on other random html initiations
        if (typeof this.showSpinnerFlag != "undefined") {
            this.startTimer()
        }
    }

    stopTimerCond() {
        if (typeof this.showSpinnerFlag != "undefined") {
            this.stopTimer();
        }
    }

    removeNativeEl() {
        // Remove element
        this.elt.nativeElement.remove();
    }

    showErrorReloadPopUp() {
        const swalOptions = {
            title: "An error in network call!",
            text: `Reloading page in the next ${this.config.pageReloadCountdownTimerMax/1000} seconds...`,
            type: 'error',
            timer: this.config.pageReloadCountdownTimerMax,
        }
        this.popUp.showPopUp(swalOptions).then( (res) => {
            location.reload();
        })
    }
    
    stopTimer() {
        this.countdownTimer.unsubscribe();
    }

    startTimer() {
        this.countdownTimer = Observable.timer(this.config.networkCallWaitTimeMax)
        .subscribe( res => {
            this.stopTimer();
            this.removeNativeEl();
            this.showErrorReloadPopUp();
        })
    }

}
