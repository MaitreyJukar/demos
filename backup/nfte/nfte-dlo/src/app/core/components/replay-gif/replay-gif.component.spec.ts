import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayGifComponent } from './replay-gif.component';

describe('ReplayGifComponent', () => {
  let component: ReplayGifComponent;
  let fixture: ComponentFixture<ReplayGifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplayGifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplayGifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
