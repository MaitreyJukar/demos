import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleReportComponent } from './simple-report.component';

describe('SimpleReportComponent', () => {
  let component: SimpleReportComponent;
  let fixture: ComponentFixture<SimpleReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
