import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CWRMainComponent } from './CWR-main.component';

describe('Dlo1MainComponent', () => {
  let component: CWRMainComponent;
  let fixture: ComponentFixture<CWRMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CWRMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CWRMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
