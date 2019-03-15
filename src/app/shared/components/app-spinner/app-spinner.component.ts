import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Common } from '../../util/common';

@Component({
    selector: 'app-custom-spinner',
    templateUrl: './app-spinner.component.html',
    styleUrls: ['./app-spinner.component.scss']
})
export class AppSpinnerComponent implements OnInit {

    constructor(private translate: TranslateService, public router: Router, private common: Common) {

    }

    ngOnInit() {

    }

}
