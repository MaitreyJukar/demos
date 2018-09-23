import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MrqComponent } from './mrq.component';

describe('MrqComponent', () => {
  let component: MrqComponent;
  let fixture: ComponentFixture<MrqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MrqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MrqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
