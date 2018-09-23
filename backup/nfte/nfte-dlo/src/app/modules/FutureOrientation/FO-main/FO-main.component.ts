import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { MainComponent } from './../../../core/components/main/main.component';
import { MessageService } from './../../../core/services/message.service';

@Component({
  selector: 'app-FO-main',
  styleUrls: ['./FO-main.component.scss'],
  templateUrl: './FO-main.component.html'
})

export class FOMainComponent extends MainComponent implements OnInit {

  /**
   * all data related to particular dlo is loaded or not
   */
  dataLoaded: boolean = false;
  isEdge: boolean = false;
  isFireFox: boolean = false;
  isIE: boolean = false;
  isAndroid: boolean = false;
  isSafari: boolean = false;
  /**
   * constructor
   * @param  {Http} publichttp
   * @param  {Router} router
   */
  constructor(public http: Http, router: Router, browserCompatibilityService: BrowserCompatibilityService) {
    super(http, router, browserCompatibilityService);
    MessageService.activityName = 'fo';
    super.initApp();
    this.isEdge = browserCompatibilityService.isEdge;
    this.isFireFox = browserCompatibilityService.isFireFox;
    this.isIE = browserCompatibilityService.isIE;
    this.isAndroid = browserCompatibilityService.isAndroid;
    this.isSafari = browserCompatibilityService.isSafari;
  }

  /**
   * life cycle ngoninit - set dlo name which is required to fetch data
   */
  ngOnInit() {
    MessageService.activityName = 'fo';
  }

  /**
   * load data related to module and show its main component
   */
  loadModule() {
    return new Promise(resolve => {
      MessageService.dataLoaded = true;
      this.dataLoaded = true;
      console.log('fo data loaded successfully');
      resolve();
    });
  }




}

