import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersProcessedComponent } from './orders-processed.component';

describe('OrdersProcessedComponent', () => {
  let component: OrdersProcessedComponent;
  let fixture: ComponentFixture<OrdersProcessedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdersProcessedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
