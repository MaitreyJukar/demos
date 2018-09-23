import { Component, OnInit } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { AccessibilityService } from './../../services/accessibility.service';
import { KeyboardService } from './../../services/keyboard.service';
import { MessageService } from './../../services/message.service';


@Component({
  selector: 'app-main',
  styleUrls: ['./main.component.scss'],
  templateUrl: './main.component.html'
})
export class MainComponent {

  /**
   * Type of Activity
   */
  activity: string;

  /**
   * Json data from string table json.
   */
  stringData: object;

  /**
   * Json data from string table json.
   */
  accData: object;

  currentImage: number = 0;
  imagesDataReady: boolean = false;
  images: Array<String>;

  browserCompatibilityService: BrowserCompatibilityService;

  /**
   * BaseActivityComponent constructor
   * @param {Http} private http [description]
   */
  constructor(public http: Http, private router: Router, browserCompatibilityService: BrowserCompatibilityService) {
    this.browserCompatibilityService = browserCompatibilityService;
  }

  /**
   * @method loadModule: Load Activity Module.
   * @returns {Promise}
   */
  loadModule() {
    return new Promise(resolve => {
      MessageService.dataLoaded = true;
      this.router.navigate([this.activity]);
      resolve();
    });
  }


  /**
   * @method initApp: Initializes the activity.
   * @param {number}: Contains the activity enum value.
   */
  initApp() {
    this.activity = MessageService.activityName;
    this.loadActivityStringJson(this.activity)
      .then(response => {
        this.loadModule();
        this.loadImages();
      });
  }
  loadImages() {
    this.images = MessageService.assets['images'];
    this.imagesDataReady = true;

  }
  onImageLoad() {
    if (this.currentImage < (this.images.length - 1) ) {
      this.currentImage++;
    }
  }


  /**
   * @method loadActivityStringJson: Load Activity JSON containing string data.
   * @param {path}
   * @returns {Promise}
   */
  loadActivityStringJson(path) {
    return new Promise((resolve, reject) => {
      this.http.get('assets/' + path + '/jsons/' + path + '.json')
        .subscribe(function (res) {
          const data = res.json();
          MessageService.jsonData = data['string-table'];
          AccessibilityService.jsonData = data['acc-data'];
          MessageService.dloData = data['dlo'];
          MessageService.dloData['quiz']['questions'] = MessageService.dloData['quiz'];
          MessageService.assets = data['assets'];
          resolve();
        });
    });
  }
}

