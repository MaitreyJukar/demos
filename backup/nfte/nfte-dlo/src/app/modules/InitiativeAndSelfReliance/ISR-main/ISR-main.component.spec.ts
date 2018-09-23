import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ISRMainComponent } from './ISR-main.component';

describe('Dlo1MainComponent', () => {
  let component: ISRMainComponent;
  let fixture: ComponentFixture<ISRMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ISRMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ISRMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
