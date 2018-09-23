import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioDescribeComponent } from './scenario-describe.component';

describe('ScenarioDescribeComponent', () => {
  let component: ScenarioDescribeComponent;
  let fixture: ComponentFixture<ScenarioDescribeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScenarioDescribeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioDescribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
