import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DragAndDrop2Component } from './drag-and-drop-2.component';

describe('DragAndDropComponent', () => {
  let component: DragAndDrop2Component;
  let fixture: ComponentFixture<DragAndDrop2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DragAndDrop2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DragAndDrop2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
