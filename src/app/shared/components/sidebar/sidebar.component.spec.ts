import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { SidebarComponentDirective } from './sidebar.component';

describe('SidebarComponentDirective', () => {
  let component: SidebarComponentDirective;
  let fixture: ComponentFixture<SidebarComponentDirective>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [SidebarComponentDirective]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponentDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
