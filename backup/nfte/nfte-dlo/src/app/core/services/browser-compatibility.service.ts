import { Injectable, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';

@Injectable()
export class BrowserCompatibilityService {

  isIE: boolean;
  isFireFox: boolean;
  isTouch: boolean;
  isIPad: boolean;
  isIPhone: boolean;
  isIPod: boolean;
  isAndroid: boolean;
  isEdge: boolean;
  isSafari: boolean;

  orientation: ORIENTATION;
  device: DEVICES;
  isFreeScroll: boolean;

  constructor() {
    this.isIE = false;
    this.isFireFox = false;
    this.isTouch = false;
    this.isIPad = false;
    this.isIPhone = false;
    this.isIPod = false;
    this.isAndroid = false;
    this.isEdge = false;
    this.isSafari = false;

    this.detectBroswer();
    this.detectPlatform();

    this.detectOrientation();
    window.addEventListener('orientationchange', function () {
      this.detectOrientation();
    }.bind(this));
  }

  detectOrientation() {
    setTimeout(() => {
      if (window.innerHeight < window.innerWidth) {
        this.orientation = ORIENTATION.LANDSCAPE;
      } else {
        this.orientation = ORIENTATION.PORTRAIT;
      }

      if ((this.device === DEVICES.MOBILE && !this.isAndroid) || (this.isAndroid && this.orientation === ORIENTATION.PORTRAIT)) {
        this.isFreeScroll = true;
      } else {
        this.isFreeScroll = false;
      }

    }, 100, this);


  }

  detectBroswer() {
    const navigator: Navigator = window.navigator;

    const strUserAgent: string = navigator.userAgent;
    const strVendor: string = navigator.vendor;
    let isIE: boolean;
    let isEdge = false;
    let isFireFox = false;
    let iIndex: number;
    if ((iIndex = strUserAgent.indexOf('Silk')) !== -1) {
      isIE = false;

    } else if ((iIndex = strUserAgent.indexOf('Edge')) !== -1) {
      isEdge = true;
    } else if ((iIndex = strUserAgent.indexOf('Chrome')) !== -1) {
      isIE = false;

    } else if (strVendor && strVendor.indexOf('Apple') !== -1) {
      iIndex = strUserAgent.indexOf('CriOS');
      if (iIndex !== -1) {
        isIE = false;
      } else {
        iIndex = strUserAgent.indexOf('Version');
        isIE = false;
      }
    } else if ((iIndex = strUserAgent.indexOf('Firefox')) !== -1) {
      isIE = false;
      isFireFox = true;
    } else if ((iIndex = strUserAgent.indexOf('MSIE')) !== -1) {
      isIE = true;
    } else if ((iIndex = strUserAgent.indexOf('Trident')) !== -1) {
      iIndex = strUserAgent.indexOf('rv:');
      isIE = true;
    } else {
      isIE = false;
    }
    if (strUserAgent.search('Safari') >= 0 && navigator.userAgent.search('Chrome') < 0) {
      this.isSafari = true;
    }
    this.isEdge = isEdge;
    this.isIE = isIE;
    this.isFireFox = isFireFox;
  }

  detectPlatform() {
    const navigator = window.navigator;
    const strPlatform: string = navigator.platform;
    const strUserAgent: string = navigator.userAgent;
    let isTouch = false;
    let isIPad = false;
    let isIPhone = false;
    let isIPod = false;
    let isAndroid = false;
    this.device = DEVICES.DESKTOP;
    if (strUserAgent.indexOf('iPad') !== -1) {
      isTouch = true;
      isIPad = true;
    } else if (strUserAgent.indexOf('iPod') !== -1) {
      isTouch = true;
      isIPod = true;
    } else if (strUserAgent.indexOf('iPhone') !== -1) {
      isTouch = true;
      isIPhone = true;
    } else if (strUserAgent.indexOf('IEMobile') !== -1 || strUserAgent.indexOf('Windows Phone') !== -1) {
      isTouch = true;
    } else if (strUserAgent.indexOf('Tablet PC') !== -1) {
      isTouch = false;
    } else if (strPlatform.indexOf('Win') !== -1) {
      isTouch = false;
    } else if (strUserAgent.indexOf('Android') !== -1 ||
      strUserAgent.indexOf('Silk') !== -1 ||
      strUserAgent.indexOf('KFTT') !== -1) {
      isTouch = true;
      isAndroid = true;

    } else if (strUserAgent.indexOf('RIM Tablet OS') !== -1) {
      isTouch = false;
    } else if (strPlatform.indexOf('Linux') !== -1) {
      isTouch = false;
      if (strUserAgent.indexOf('CrOS') !== -1) {
        isTouch = false;
      }
    } else if (strPlatform.indexOf('Mac') !== -1) {
      isTouch = false;
    } else {
      isTouch = false;
    }
    this.isTouch = isTouch;
    this.isIPad = isIPad;
    this.isIPhone = isIPhone;
    this.isIPod = isIPod;
    this.isAndroid = isAndroid;

    if (isTouch) {
      if (isIPad) {
        this.device = DEVICES.TABLET;
      } else {
        this.device = DEVICES.MOBILE;
      }
    }
  }



}

export enum ORIENTATION {
  LANDSCAPE = 0,
  PORTRAIT = 1
}

export enum DEVICES {
  DESKTOP = 0,
  TABLET = 1,
  MOBILE = 2
}
