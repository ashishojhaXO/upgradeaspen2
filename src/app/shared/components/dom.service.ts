import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ApplicationRef,
    EventEmitter
} from '@angular/core';

@Injectable()
export class DomService {
  modalEvent: EventEmitter<any> = new EventEmitter() ;

  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private appRef: ApplicationRef,
      private injector: Injector
  ) { }

  getModalChangeEmitter(event) {
    this.modalEvent.emit(event);
  }

  appendComponent(element: any = '', component: any = '', object: any = '') {
    // Create a component reference from the component
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);

      (componentRef.instance as any).triggerModal.subscribe(e => {
        this.getModalChangeEmitter(e);
      });

      (componentRef.instance as any).items = object;
      (componentRef.instance as any).tagConfig = object.config;

      // Attach component to the appRef so that it's inside the ng component tree
      this.appRef.attachView(componentRef.hostView);

      // Get DOM element from component
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
        .rootNodes[0] as HTMLElement;

      // Append DOM element to the body
      element[0].innerHTML = '';
      element[0].appendChild(domElem);
  }

}
