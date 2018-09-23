import {
  AfterViewChecked, AfterViewInit, ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, ViewChild
} from '@angular/core';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { WindowResizeService } from './../../services/window-resize.service';

import { DndBaseComponent } from './../dnd-base/dnd-base'
import { QuestionComponent } from './../question/question.component';

import * as jQuery from 'jquery';
import 'jqueryui';
(window as any).jQuery = jQuery;
declare var require: any;
require('jquery-ui-touch-punch');

@Component({
  selector: 'app-drag-and-drop',
  styleUrls: ['./drag-and-drop.component.scss'],
  templateUrl: './drag-and-drop.component.html'
})
export class DragAndDropComponent extends DndBaseComponent implements AfterViewInit, OnInit {
  @Input() scaleB: boolean = false;
  @Input() parentHeight: number;
  @Input() parentWidth: number;
  @Input() alignDragDrop: ALIGNMENT;
  @ViewChild('optionsContainer') optionsContainer: ElementRef;
  changeDetact: ChangeDetectorRef;
  scaleRatio: number;
  constructor(el: ElementRef, cdr: ChangeDetectorRef, zone: NgZone,
    resizeService: WindowResizeService, browserCompatibilityService: BrowserCompatibilityService) {
    super(el, cdr, zone, resizeService, browserCompatibilityService);
    this.changeDetact = cdr;
    this.alignDragDrop = ALIGNMENT.ROW;
  }
  scale() {
    if (this.scaleB) {
      let scaleRatioH: number;
      let scaleRatioW: number;
      this.optionsContainer.nativeElement.style.height = 'auto';
      if ((this.parentHeight / (this.optionsContainer.nativeElement.offsetHeight + 36)) < 1) {
        scaleRatioH = this.parentHeight / (this.optionsContainer.nativeElement.offsetHeight + 36);
      } else {
        scaleRatioH = 0;
      }
      this.optionsContainer.nativeElement.style.height = '';
      this.optionsContainer.nativeElement.style.width = 'auto';
      if ((this.parentWidth / (this.optionsContainer.nativeElement.offsetWidth)) < 1) {
        scaleRatioW = this.parentWidth / (this.optionsContainer.nativeElement.offsetWidth);
      } else {
        scaleRatioW = 0;
      }
      this.optionsContainer.nativeElement.style.width = '';
      if (scaleRatioH > scaleRatioW && scaleRatioH !== 0) {
        this.scaleRatio = scaleRatioH;
      }
      if (scaleRatioH <= scaleRatioW && scaleRatioW !== 0) {
        this.scaleRatio = scaleRatioW;
      }
      this.changeDetact.detectChanges();
    }
  }

  getMaxWidth(width) {
    return parseInt(width, 10) + 20 + 'px'
  }


}

enum ALIGNMENT {
  ROW = 0,
  COLUMN = 1
}


