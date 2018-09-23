import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioDescribe2Component } from './scenario-describe-2.component';

describe('ScenarioDescribe2Component', () => {
  let component: ScenarioDescribe2Component;
  let fixture: ComponentFixture<ScenarioDescribe2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScenarioDescribe2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioDescribe2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
