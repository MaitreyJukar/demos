import { inject, TestBed } from '@angular/core/testing';

import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessibilityService]
    });
  });

  it('should be created', inject([AccessibilityService], (service: AccessibilityService) => {
    expect(service).toBeTruthy();
  }));
});
