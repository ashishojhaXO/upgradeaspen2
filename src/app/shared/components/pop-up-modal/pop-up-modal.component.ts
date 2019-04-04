import {Component} from '@angular/core';

@Component({
  selector: 'app-pop-up-modal',
  template: `
        <div (click)="onContainerClicked($event)" class="modal fade" tabindex="-1" [ngClass]="{'in': visibleAnimate}"
             [ngStyle]="{'display': visible ? 'block' : 'none', 'opacity': visibleAnimate ? 1 : 0}">
            <div class="modal-dialog" style="width: 55%; margin-top: 0%">
                <div class="modal-content" style="height: 100vh;">
                    <div class="modal-header" style="height: 50px;">
                        <ng-content select=".app-modal-header"></ng-content>
                    </div>
                    <div class="modal-body">
                        <ng-content select=".app-modal-body" style="padding-bottom:5px"></ng-content>
                    </div>
                    <div class="modal-footer" style="margin: 0px 5px">
                        <ng-content select=".app-modal-footer"></ng-content>
                    </div>
                </div>
            </div>
        </div>
    `,
  styleUrls: ['./pop-up-modal.component.scss']
})
export class PopUpModalComponent {

  public visible = false;
  public visibleAnimate = false;

  constructor() {}

  public show(): void {
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 1);
  }

  public hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 1);
  }

  public onContainerClicked(event: MouseEvent): void {
    // if ((<HTMLElement>event.target).classList.contains('modal')) {
    //   this.hide();
    // }
  }

}
