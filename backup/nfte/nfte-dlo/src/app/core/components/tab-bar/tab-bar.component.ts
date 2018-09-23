import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BaseComponent } from './../base/base.component';

@Component({
  selector: 'app-tab-bar',
  styleUrls: ['./tab-bar.component.scss'],
  templateUrl: './tab-bar.component.html'
})
export class TabBarComponent extends BaseComponent implements OnInit {
  /**
   * list of tabs to be displayed
   */
  tabList: Array<string>;
  router: Router;
  constructor(router: Router) {
    super();
    this.router = router;
  }

  /**
   * life cycle method ngoninit - initialize tab list
   */
  ngOnInit() {
    this.tabList = ['learn', 'explore', 'take-quiz'];
  }



}
