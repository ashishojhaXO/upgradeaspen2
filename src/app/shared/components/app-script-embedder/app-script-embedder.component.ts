/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-10-24 10:00:00
 */
import { Component, ElementRef, ViewChild, Input } from '@angular/core';


@Component({
  selector: 'app-script-embedder',
  templateUrl: './app-script-embedder.component.html',
  styleUrls: ['./app-script-embedder.component.scss'],
  moduleId: module.id
})

export class AppScriptEmbedderComponent {

  @Input()
  src: string;

  @Input()
  type: string;

  @ViewChild('script') script: ElementRef;

  convertToScript() {
    var element = this.script.nativeElement;
    var script = document.createElement("script");
    script.type = this.type ? this.type : "text/javascript";
    if (this.src) {
      script.src = this.src;
    }
    if (element.innerHTML) {
      script.innerHTML = element.innerHTML;
    }
    var parent = element.parentElement;
    parent.parentElement.replaceChild(script, parent);
  }

  ngAfterViewInit() {
    this.convertToScript();
  }
}
