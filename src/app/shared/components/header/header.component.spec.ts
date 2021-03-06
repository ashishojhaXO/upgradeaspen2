import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HeaderComponentDirective } from './header.component';

describe('HeaderComponentDirective', () => {
  let component: HeaderComponentDirective;
  let fixture: ComponentFixture<HeaderComponentDirective>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [HeaderComponentDirective],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponentDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
