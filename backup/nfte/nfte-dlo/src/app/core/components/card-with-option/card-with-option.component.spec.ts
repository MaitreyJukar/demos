import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardWithOptionComponent } from './card-with-option.component';

describe('CardWithOptionComponent', () => {
  let component: CardWithOptionComponent;
  let fixture: ComponentFixture<CardWithOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardWithOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardWithOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
