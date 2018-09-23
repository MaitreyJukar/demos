import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DloMainComponent } from './dlo-main.component';

describe('Dlo1MainComponent', () => {
  let component: DloMainComponent;
  let fixture: ComponentFixture<DloMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DloMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DloMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
