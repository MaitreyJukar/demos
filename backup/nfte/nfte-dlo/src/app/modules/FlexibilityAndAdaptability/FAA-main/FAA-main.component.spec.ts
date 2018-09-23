import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FAAMainComponent } from './FAA-main.component';

describe('Dlo1MainComponent', () => {
  let component: FAAMainComponent;
  let fixture: ComponentFixture<FAAMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FAAMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FAAMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
