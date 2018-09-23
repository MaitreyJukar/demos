import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnCardQuestionComponent } from './learn-card-question.component';

describe('LearnCardQuestionComponent', () => {
  let component: LearnCardQuestionComponent;
  let fixture: ComponentFixture<LearnCardQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnCardQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnCardQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
