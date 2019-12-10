import { Component, OnInit } from '@angular/core';
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
        coutdownTimerMax: 3000,
    }

    // If this instance has been initiated for more than 60 secconds(1 minute)
    // Show a popUp to load page again/ destroy this self instance
    // countdownTimer: Number = this.config.coutdownTimerMax;
    countdownTimer: any;

    constructor(private translate: TranslateService,
        public router: Router, private common: Common,
        private popUp: AppPopUpComponent
    ) {

    }

    ngOnInit() {
        this.startTimer()

    }

    ngOnDestroy() {
    }
    
    stopTimer() {
        this.countdownTimer.unsubscribe();
        const swalOptions = {
            title: "Error occurred!",
            text: "Reloading the page...",
            type: 'error',
            timer: this.config.coutdownTimerMax,
            buttons: false,
        }
        this.popUp.showPopUp(swalOptions).then( (res) => {
            location.reload();
        })
    }

    startTimer() {
        this.countdownTimer = Observable.timer(this.config.coutdownTimerMax).subscribe( res => {
            this.stopTimer();
        })
    }

}
