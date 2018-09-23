import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { BrowserCompatibilityService } from '../../../core/services/browser-compatibility.service';
import { MainComponent } from './../../../core/components/main/main.component';
import { MessageService } from './../../../core/services/message.service';

@Component({
  selector: 'app-isr-main',
  styleUrls: ['./ISR-main.component.scss'],
  templateUrl: './ISR-main.component.html'
})

export class ISRMainComponent extends MainComponent implements OnInit {

  /**
   * all data related to particular dlo is loaded or not
   */
  dataLoaded: boolean = false;
  isIE: boolean = false;
  isEdge: boolean = false;
  isFireFox: boolean = false;
  isAndroid: boolean = false;

  /**
   * constructor
   * @param  {Http} publichttp
   * @param  {Router} router
   */
  constructor(public http: Http, router: Router, browserCompatibilityService: BrowserCompatibilityService) {
    super(http, router, browserCompatibilityService);
    MessageService.activityName = 'isr';
    this.isIE = browserCompatibilityService.isIE;
    this.isEdge = browserCompatibilityService.isEdge;
    this.isFireFox = browserCompatibilityService.isFireFox;
    this.isAndroid = browserCompatibilityService.isAndroid;

    super.initApp();
  }

  /**
   * life cycle ngoninit - set dlo name which is required to fetch data
   */
  ngOnInit() {
    MessageService.activityName = 'isr';
  }

  /**
   * load data related to module and show its main component
   */
  loadModule() {
    return new Promise(resolve => {
      MessageService.dataLoaded = true;
      this.dataLoaded = true;
      console.log('ISR data loaded successfully');
      resolve();
    });
  }




}
