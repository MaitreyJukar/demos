import {
  AfterViewChecked, AfterViewInit, ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, ViewChild
} from '@angular/core';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { WindowResizeService } from './../../services/window-resize.service';
import { DndBaseComponent } from './../dnd-base/dnd-base';
import { QuestionComponent } from './../question/question.component';

import * as jQuery from 'jquery';
import 'jqueryui';
(window as any).jQuery = jQuery;
declare var require: any;
require('jquery-ui-touch-punch');

@Component({
  selector: 'app-drag-and-drop-2',
  styleUrls: ['./drag-and-drop-2.component.scss'],
  templateUrl: './drag-and-drop-2.component.html'
})
export class DragAndDrop2Component extends DndBaseComponent {
  @Input() scaleB: boolean = false;
  @Input() parentHeight: number;
  @Input() parentWidth: number;
  @ViewChild('optionsContainer') optionsContainer: ElementRef;
  constructor(el: ElementRef, cdr: ChangeDetectorRef, zone: NgZone, resizeService: WindowResizeService,
    browserCompatibilityService: BrowserCompatibilityService) {
    super(el, cdr, zone, resizeService, browserCompatibilityService);
  }
  resizeDraggable(draggedItem, dropLocation, forceResize?: boolean) {
    const dragCurrentWidth = jQuery(jQuery(draggedItem)[0]).outerWidth();
    const dragCurrentHeight = jQuery(jQuery(draggedItem)[0]).outerHeight();

    const dropCurrentWidth = jQuery(jQuery(dropLocation)[0]).width();
    let dropCurrentHeight = jQuery(jQuery(dropLocation)[0]).height();
    if (!this.dndModel.singledrop && !this.dndModel.maxDroppables) {
      dropCurrentHeight = dropCurrentHeight / this.dndModel.options.length;
    }
    if (!this.dndModel.singledrop && this.dndModel.maxDroppables) {
      dropCurrentHeight = dropCurrentHeight / this.dndModel.maxDroppables;
    }
    if (forceResize || dropCurrentHeight < dragCurrentHeight || dropCurrentWidth < dragCurrentWidth) {


      const content = jQuery(draggedItem).find('.draggable-content');

      content[0].style.transform = 'none';
      draggedItem.style.width = this.maxWidth + 'px';
      draggedItem.style.height = this.maxHeight + 'px';
      content[0].style.width = this.maxWidth - 10 + 'px';
      content[0].style.height = this.maxHeight - 18 + 'px';
      const contentWidth = content[0].clientWidth;
      const contentHeight = content[0].clientHeight;




      if (this.dndModel.singledrop) {
        draggedItem.style.width = 'calc(100% - 5px)';
        draggedItem.style.height = 'calc(100% - 5px)';
      } else {
        draggedItem.style.width = 'calc(100% - 5px)';
        if (this.dndModel.maxDroppables) {
          draggedItem.style.height = 'calc(' + (100 / this.dndModel.maxDroppables) + '% - 5px)';

        } else {
          draggedItem.style.height = 'calc(' + (100 / this.dndModel.options.length) + '% - 5px)';
        }
      }

      const scaleW = (dropCurrentWidth - 10 - 10) / contentWidth;
      let scaleH = (dropCurrentHeight - 10 - 10) / contentHeight;
      if (!this.dndModel.singledrop) {
        scaleH = (dropCurrentHeight - 5) / contentHeight;
        if (scaleH > 1) {
          scaleH = 1;
        }
      }
      content.css('transform', 'scale(' + scaleW + ',' + scaleH + ')')
      content.css('transform-origin', '0 0');
    }



  }
  changeContentDimensions(draggedItem) {
    const dragItemH = draggedItem.clientHeight;
    const dragItemW = draggedItem.clientWidth;
    (jQuery(draggedItem).find('.draggable-content'))[0].style.width = '100%';
    (jQuery(draggedItem).find('.draggable-content'))[0].style.height = '100%';
    const contentH = (jQuery(draggedItem).find('.draggable-content'))[0].getBoundingClientRect().height;
    const contentW = (jQuery(draggedItem).find('.draggable-content'))[0].getBoundingClientRect().width;

    (jQuery(draggedItem).find('.draggable-content'))[0].style.width = ((dragItemW * 100) / contentW) + '%';
    (jQuery(draggedItem).find('.draggable-content'))[0].style.height = ((dragItemH * 100) / contentH) + '%';
  }
  setDraggableDimensions(element) {
    element.style.width = '100%';
    element.style.height = '100%'
  }


  changeFontSize(draggableEle?: HTMLElement) {
    const draggables = this.dndModel.options;
    let maxFontSize = 0;

    // set dimensions of draggables
    if (draggableEle) {
      let height = jQuery(draggableEle).height();
      if (this.dndModel.options[draggableEle.dataset['id']]['maxNoOfLines']) {
        height = height / this.dndModel.options[draggableEle.dataset['id']]['maxNoOfLines'];
      }
      let fontSize = 16;
      if (height >= 16) {
        fontSize = 16;
      } else {
        fontSize = Math.floor(height);
      }

    } else {


      for (let i = 0; i < draggables.length; i++) {
        const draggable = jQuery('.draggable[data-id=' + draggables[i]['id'] + ']');
        let height = draggable.height();
        if (this.dndModel.options[i]['maxNoOfLines']) {
          height = height / this.dndModel.options[i]['maxNoOfLines'];
        }
        let fontSize = 16;
        if (height >= 24) {
          fontSize = 16;
        } else if (height <= 10) {
          fontSize = Math.floor(height);
        } else {
          fontSize = Math.floor(height) - 6;
        }

        if (fontSize > maxFontSize) {
          maxFontSize = fontSize;
        }
      }
    }

    const groupNames = jQuery('.drop-group-name');
    for (let i = 0; i < groupNames.length; i++) {


      groupNames[i].style.top = 0 + '%';
      const groupNameHeight: number = groupNames[i].offsetHeight;
      const groupNameTop: number = groupNames[i].offsetTop;
      groupNames[i].style.top = groupNameTop - groupNameHeight + 'px';


      const dropGroupLeft = 0 + '%';
      groupNames[i].style.left = dropGroupLeft + '%';

      const groupNameWidth: number = groupNames[i].offsetWidth;
      const groupNameLeft: number = groupNames[i].offsetLeft;
      groupNames[i].style.left = 'calc(' + 50 + '% - ' + groupNameWidth / 2 + 'px)';

    }

  }


  resizeText(itemId) {
    return
  }
}

