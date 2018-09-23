import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnIntroComponent } from './learn-intro.component';

describe('LearnIntroComponent', () => {
  let component: LearnIntroComponent;
  let fixture: ComponentFixture<LearnIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnIntroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
