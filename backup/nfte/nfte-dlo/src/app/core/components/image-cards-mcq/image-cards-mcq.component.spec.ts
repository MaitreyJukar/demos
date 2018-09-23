import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCardsMcqComponent } from './image-cards-mcq.component';

describe('ImageCardsMcqComponent', () => {
  let component: ImageCardsMcqComponent;
  let fixture: ComponentFixture<ImageCardsMcqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCardsMcqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCardsMcqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
