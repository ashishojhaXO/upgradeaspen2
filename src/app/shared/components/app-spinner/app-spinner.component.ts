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
        pageReloadCountdownTimerMaxFunc: () => {
            let cacheNumber: number;
            return () => {
                if (cacheNumber)
                    return cacheNumber;

                // Formula: Math.round( Math.random() * (max - min ) ) + min
                cacheNumber = Math.round( Math.random() * (10 - 5) ) + 5;
                return cacheNumber;
            }
        },
        pageReloadCountdownTimerMax: Number(),
    }

    // If this instance has been initiated for more than 60 secconds(1 minute)
    // Show a popUp to load page again/ destroy this self instance
    // countdownTimer: Number = this.config.coutdownTimerMax;
    countdownTimer: any;

    @Input()
    showSpinnerFlag: boolean;
    @Input() isSpinnerActive: boolean;
    @Input() isForbidden: boolean; 
    isTimeOut: boolean = false;
    timeOutFlag;
    waitTime;
    api_fs;
    showForbiddenToast: boolean = false;
    constructor(
        private translate: TranslateService,
        private elt: ElementRef,
        public router: Router, private common: Common,
        private popUp: AppPopUpComponent
    ) {
        this.config.pageReloadCountdownTimerMax = this.config.pageReloadCountdownTimerMaxFunc()()
        this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
        if(this.api_fs && this.api_fs.spinnerTimeout){
          this.waitTime = parseInt(this.api_fs.spinnerTimeout);
        }else{
          this.waitTime = 20000; // 20 Seconds
        }
        console.log("Spinner waitTime",this.waitTime);
    }

    ngOnInit() {
       // this.startTimerCond()
    }

    ngOnChanges(){
       if(this.isSpinnerActive == true){
           this.timeOutFlag = setTimeout(() => {
               this.isSpinnerActive = false;
               this.isTimeOut = true;
           }, this.waitTime);
       }else{
        this.isTimeOut = false;
        clearTimeout(this.timeOutFlag);
       }
       console.log("Spinner time",this.isSpinnerActive);
       if(this.isForbidden){
         this.showForbiddenToast = true;
       }
    }
    hideCustToast(){
        this.isTimeOut = false;
        this.showForbiddenToast = false;
    }
    ngAfterViewInit() {}

    ngOnDestroy() {
       // this.stopTimerCond()
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
            text: `Reloading page in the next ${this.config.pageReloadCountdownTimerMax} seconds...`,
            type: 'error',
            timer: this.config.pageReloadCountdownTimerMax * 1000,
            showCloseButton: true,
            reverseButtons: true,
            showCancelButton: true,
            cancelButtonText: "Cancel Reload",
        }
        this.popUp.showPopUp(swalOptions).then(
            (res) => {
                if(res.value || res.dismiss.toString() == "timer" ) {
                    location.reload();
                }
            },
        )
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
