import { AfterViewInit, Directive, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { BrowserCompatibilityService } from './services/browser-compatibility.service';
import { MessageService } from './services/message.service';

import * as Hammer from 'hammerjs';
import { KeyboardService } from './services/keyboard.service';
import { WindowResizeService } from './services/window-resize.service';

@Directive({
  selector: '[appScroll]'
})
export class ScrollDirective implements AfterViewInit {
  listenScroll: boolean = true;
  scrollFromMouse: boolean = false;
  scrollTops: Array<number> = [];
  @Input() sectionSelector: string;
  @Input() topOffset: number = 0;
  prevScrollTop = null;
  @Output() sectionChanged: EventEmitter<any> = new EventEmitter();
  scrollTimer = null;
  currentActiveSection: number = 0;
  hammerManager: any = undefined;
  mobileViewWidth: number = 700;
  landscapeMinHeight: number = 600;
  isAndroid: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 768 || ((window.innerHeight > window.innerWidth || window.innerHeight < this.landscapeMinHeight)
      && this.isAndroid)) {
      if (this.hammerManager) {
        this.hammerManager.destroy();
        document.getElementsByClassName('scroll')[0].setAttribute('style', 'touchAction:auto;');
      }
    } else {
      if (!this.hammerManager && this.browserCompatibilityService.isTouch) {
        document.getElementsByClassName('scroll')[0].setAttribute('style', 'touchAction:none;');
        this.attachHammerEvents();
      }
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp() {
    if ( !this.browserCompatibilityService.isTouch && this.scrollFromMouse && this.listenScroll) {
      this.scrollFromMouse = false;
      this.snapToNearest();
    }
  }







  @HostListener('window:scroll', ['$event'])
  onScroll($event) {
    if (window.innerWidth < 700 || document.body.classList.contains('modal-open')) {
      return;
    }
    $event.preventDefault();
    $event.stopPropagation();
    this.scrollFromMouse = true;

  }
  @HostListener('window:DOMMouseScroll', ['$event'])
  onMouseWheelFirefox(event: any) {
    if (window.innerWidth < 700 || document.body.classList.contains('modal-open')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (this.listenScroll) {
      this.onScrollWheel(event);
    }
  }

  // @HostListener('window:onmousewheel', ['$event']) onMouseWheelIE(event: any) {
  //   console.log('afadf');

  //   this.onWindowScroll(event);
  // }

  @HostListener('window:mousewheel', ['$event'])
  onWindowScroll($event) {
    if (window.innerWidth < 700 || document.body.classList.contains('modal-open')) {
      return;
    }
    $event.preventDefault();
    $event.stopPropagation();

    if (this.listenScroll) {
      this.onScrollWheel($event);
    }
  }
  @HostListener('window:touchmove', ['$event'])
  onTouchMove($event) {
    if (document.body.classList.contains('modal-open') && this.browserCompatibilityService.isIPad &&
      !this.checkIfScrollFromModal($event.target)) {
      $event.preventDefault();
    }
  }



  constructor(private browserCompatibilityService: BrowserCompatibilityService, resizeService: WindowResizeService) {
    this.isAndroid = browserCompatibilityService.isAndroid;
  }

  ngAfterViewInit() {
    jQuery(jQuery(this.sectionSelector)[0]).addClass('active');
    setTimeout(() => {
      this.scrollToSection(0);
    }, 0);
    if (this.browserCompatibilityService.isTouch) {
      this.attachHammerEvents();
    }

  }
  checkIfScrollFromModal(src) {
    while (src !== document.body) {
      if (src.classList.contains('modal-body')) {
        return true;
      }
      src = src.parentElement;
    }
    return false;
  }
  removeHammerEvents() {
    if (this.hammerManager) {
      this.hammerManager.destroy();
    }
  }
  attachHammerEvents() {
    if (window.innerWidth >= 768) {
      if ((window.innerHeight > window.innerWidth || window.innerHeight < this.landscapeMinHeight) && this.isAndroid) {
        this.removeHammerEvents();
        return;
      }
      const ele = document.getElementsByClassName('scroll')[0];

      this.hammerManager = new Hammer.Manager(ele, {
        recognizers: [
          [Hammer.Swipe, { direction: Hammer.DIRECTION_ALL }],
        ]
      });
      this.hammerManager.on('swipeup', (ev) => {
        const nextIndex = this.currentActiveSection + 1;
        if (nextIndex < jQuery(this.sectionSelector).length && !document.body.classList.contains('modal-open')
          && !KeyboardService.isDragging) {
          this.scrollToSection(nextIndex);
        }
      });

      this.hammerManager.on('swipedown', (ev) => {
        const nextIndex = this.currentActiveSection - 1;
        if (nextIndex >= 0 && !document.body.classList.contains('modal-open') && !KeyboardService.isDragging) {
          this.scrollToSection(nextIndex);
        }
      })

    }

  }

  onScrollWheel($event) {
    $event.preventDefault();
    $event.stopPropagation();
    const sections = jQuery(this.sectionSelector);
    let nextIndex: number;
    if (!this.browserCompatibilityService.isFireFox) {
      if ($event.wheelDelta < 0) {
        nextIndex = this.currentActiveSection + 1;
      } else {
        nextIndex = this.currentActiveSection - 1
      }
    } else if (this.browserCompatibilityService.isFireFox) {
      if ($event.detail > 0) {
        nextIndex = this.currentActiveSection + 1;
      } else {
        nextIndex = this.currentActiveSection - 1
      }

    }
    if (nextIndex >= 0 && nextIndex < sections.length) {
      this.scrollToSection(nextIndex);
    }
    this.listenScroll = false;
    if (!this.scrollTimer) {
      this.scrollTimer = setTimeout(() => {

        this.listenScroll = true;
        this.scrollTimer = null;

      }, 1000);
    }

  }



  snapToNearest() {
    const index = this.findNearestSection();
    this.scrollToSection(index);
  }

  scrollToSection(index: number) {
    this.calculateScrollTops();
    const sections = jQuery(this.sectionSelector);

    sections.removeClass('active');
    jQuery(sections[index]).addClass('active');
    this.prevScrollTop = this.scrollTops[index];


    jQuery('html, body').animate({
      scrollTop: this.scrollTops[index]
    }, 500);

    if (this.currentActiveSection !== index) {
      this.sectionChanged.next(index);
      this.currentActiveSection = index;
    }
  }

  moveSectionUp() {
    const sections = jQuery(this.sectionSelector);

    const nextIndex = this.currentActiveSection - 1;
    if (nextIndex >= 0 && nextIndex < sections.length) {
      this.scrollToSection(nextIndex);
    }
  }
  moveSectionDown() {
    const sections = jQuery(this.sectionSelector);

    const nextIndex = this.currentActiveSection + 1;
    if (nextIndex >= 0 && nextIndex < sections.length) {
      this.scrollToSection(nextIndex);
    }
  }

  findNearestSection() {
    const curentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let scrollTopDiff = Number.POSITIVE_INFINITY;
    let scrollToIndex = -1;
    for (let i = 0; i < this.scrollTops.length; i++) {
      const currentScrollDiff = Math.abs(curentScrollTop - this.scrollTops[i]);
      if (currentScrollDiff < scrollTopDiff) {
        scrollTopDiff = currentScrollDiff;
        scrollToIndex = i;
      }
    }
    return scrollToIndex;
  }

  calculateScrollTops() {
    this.scrollTops = [];
    const sections = jQuery(this.sectionSelector);
    for (let i = 0; i < sections.length; i++) {
      this.scrollTops.push(jQuery(sections[i]).offset().top - this.topOffset);
    }

  }

}
