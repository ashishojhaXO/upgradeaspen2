import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Tag1Component } from './tag1.component';

describe('Tag1Component', () => {
  let component: Tag1Component;
  let fixture: ComponentFixture<Tag1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Tag1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Tag1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
