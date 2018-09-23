// angular
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

// our components
import { BaseComponent } from './core/components/base/base.component';
import { MessageService } from './core/services/message.service';
import { WindowResizeService } from './core/services/window-resize.service';
import { KeyboardService } from 'app/core/services/keyboard.service';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})

export class AppComponent extends BaseComponent {// implements OnDestroy, AfterViewInit {
  constructor(private keyboardService: KeyboardService) {
    super();
  }
  // not sure if following code is used

  // windowInnerWidth: number;
  // windowInnerHeight: number;

  // // app main div reference
  // @ViewChild('mainContainer') mainContainerEl: ElementRef;

  // constructor(private resizeService: WindowResizeService) {
  //   super();
  //   this.resizeService.register(this);
  //   this.windowInnerHeight = window.innerHeight;
  //   this.windowInnerWidth = window.innerWidth;
  // }

  // ngAfterViewInit() {
  //   this.mainContainerEl.nativeElement.style.innerHeight = this.windowInnerHeight;
  //   this.mainContainerEl.nativeElement.style.innerWidth = this.windowInnerWidth;
  // }

  // onResize() {
  //   if (window.innerWidth === this.mainContainerEl.nativeElement.clientWidth) {
  //     if (window.innerHeight > this.mainContainerEl.nativeElement.clientHeight) {
  //       this.windowInnerHeight = window.innerHeight;
  //     }
  //   } else {
  //     this.windowInnerHeight = window.innerHeight;
  //     this.windowInnerWidth = window.innerWidth;
  //   }
  //   this.mainContainerEl.nativeElement.style.innerHeight = this.windowInnerHeight;
  //   this.mainContainerEl.nativeElement.style.innerWidth = this.windowInnerWidth;
  // }

  // ngOnDestroy() {
  //   this.resizeService.deregister(this);
  // }

}
