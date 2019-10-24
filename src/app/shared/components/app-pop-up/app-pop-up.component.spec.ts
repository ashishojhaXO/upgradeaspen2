import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPopUpComponent } from './app-pop-up.component';

describe('AppPopUpComponent', () => {
  let component: AppPopUpComponent;
  let fixture: ComponentFixture<AppPopUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppPopUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
