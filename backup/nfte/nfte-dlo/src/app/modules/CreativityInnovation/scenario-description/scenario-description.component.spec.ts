import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioDescriptionComponent } from './scenario-description.component';

describe('ScenarioDescriptionComponent', () => {
  let component: ScenarioDescriptionComponent;
  let fixture: ComponentFixture<ScenarioDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScenarioDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
