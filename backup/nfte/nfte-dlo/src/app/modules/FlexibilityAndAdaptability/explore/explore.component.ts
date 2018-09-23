import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';


@Component({
  selector: 'app-explore',
  styleUrls: ['./explore.component.scss'],
  templateUrl: './explore.component.html'
})

export class ExploreComponent {
  router: Router;
  isSafari: boolean = false;
  isIE: boolean = false;
  isEdge: boolean = false;
  isFireFox: boolean = false;
  constructor(router: Router, private browser: BrowserCompatibilityService) {
    this.router = router;
    this.isSafari = browser.isSafari;
    this.isIE = browser.isIE;
    this.isEdge = browser.isEdge;
    this.isFireFox = browser.isFireFox;
  }

  backToScenarios() {
    this.router.navigate(['../FAA/explore']);
  }
}
