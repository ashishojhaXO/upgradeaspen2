import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPopUpComponentComponent } from './app-pop-up-component.component';

describe('AppPopUpComponentComponent', () => {
  let component: AppPopUpComponentComponent;
  let fixture: ComponentFixture<AppPopUpComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppPopUpComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppPopUpComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
