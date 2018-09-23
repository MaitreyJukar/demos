import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { MainComponent } from './../../../core/components/main/main.component';
import { MessageService } from './../../../core/services/message.service';

@Component({
  selector: 'app-dlo-main',
  styleUrls: ['./dlo-main.component.scss'],
  templateUrl: './dlo-main.component.html'
})

export class DLOMainComponent extends MainComponent implements OnInit {

  /**
   * all data related to particular dlo is loaded or not
   */
  dataLoaded: boolean = false;

  /**
   * constructor
   * @param  {Http} publichttp
   * @param  {Router} router
   */
  constructor(public http: Http, router: Router, browserCompatibilityService: BrowserCompatibilityService) {
    super(http, router, browserCompatibilityService);
    MessageService.activityName = 'dlo';
    super.initApp();
  }

  /**
   * life cycle ngoninit - set dlo name which is required to fetch data
   */
  ngOnInit() {
    MessageService.activityName = 'dlo';
  }

  /**
   * load data related to module and show its main component
   */
  loadModule() {
    return new Promise(resolve => {
      MessageService.dataLoaded = true;
      this.dataLoaded = true;
      console.log('DLO data loaded successfully');
      resolve();
    });
  }




}

