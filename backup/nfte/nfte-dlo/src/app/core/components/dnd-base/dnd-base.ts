import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, NgZone,
  OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { MessageService } from '../../services/message.service';
import { KeyboardService } from './../../services/keyboard.service';
import { WindowResizeService } from './../../services/window-resize.service';
import { QuestionComponent } from './../question/question.component';
import { DNDModel } from './dnd.model';

@Component({
  selector: 'app-dnd',
  styleUrls: ['./dnd.component.scss'],
  templateUrl: './dnd.component.html'
})
export class DndBaseComponent extends QuestionComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  DROP_GROUP_TOLERANCE = 10;

  correctAnswerCount: number = 0;
  feedbackClass: string = '';
  incorrectAnswerCount: number = 0;
  doneClicked: boolean;
  correctOptions: Array<any>;
  imgSrc: string;
  imageOriginalWidth: number;
  imageOriginalHeight: number;
  imageWidth: string;
  imageHeight: string;
  showCorrectAnswerFlag: boolean = false;

  clickedItemId: string;
  clickedGroupId: string;
  viewReady: boolean = false;
  draggableSlelctedByGroupFlag: number = 0;
  dndId: string = 'dnd-';
  // tileToReset;
  @Input() handleWidth: boolean = false;
  @Input() index: number;
  dndModel: DNDModel;
  maxWidth = 0;
  maxHeight = 0;
  isIE: boolean;
  isAndroid: boolean;
  resizeService: WindowResizeService;
  isDragging: boolean = false;
  showMobileDND: boolean = false;
  timelineVerticalLineLeft: number;
  browserCompatibilityService: BrowserCompatibilityService;
  @ViewChild('image') image: ElementRef;

  @Input() set model(model: DNDModel) {
    this.dndModel = model;
  }

  get model(): DNDModel {
    return this.dndModel;
  }
  @Input() set showCorrectAnswer(showCorrectAnswer: boolean) {
    this.showCorrectAnswerFlag = showCorrectAnswer;
    if (this.dndModel.studentResponse !== null && this.viewReady) {
      if (showCorrectAnswer) {
        this.setCorrectResponse();
      } else {
        this.setStudentResponse();
      }
      this.applyStateClass();
    }
  }

  constructor(el: ElementRef, private cdr: ChangeDetectorRef, private zone: NgZone, resizeService: WindowResizeService,
    browserCompatibilityService: BrowserCompatibilityService) {
    super(el);
    this.isIE = browserCompatibilityService.isIE;
    this.isAndroid = browserCompatibilityService.isAndroid
    this.resizeService = resizeService;
    this.browserCompatibilityService = browserCompatibilityService;

  }

  ngOnInit() {
    this.correctOptions = this.dndModel.arrCorrectOption;
    this.dndId += this.index;

    this.resizeService.register(this);

  }
  ngOnChanges(simpleChanges: SimpleChanges) {
    if (this.showResult) {
      if (this.dndModel.submited) {
        setTimeout(() => {
          this.setCorrectIncorrectClass();
        }, 100);
      }
    } else {
      this.setCorrectIncorrectClass();
    }

  }
  ngAfterViewInit() {
    super.ngAfterViewInit();
    const timeout = MessageService.activityName === 'fo' ? 1000 : 100;
    setTimeout(() => {
      const that = this;
      this.viewReady = true;
      if (!this.model.tilesWithinImage) {
        this.checkTileMaxDimensions();
      }
      if (this.dndModel.studentResponse !== null) {
        if (this.showCorrectAnswerFlag) {
          this.setCorrectResponse();
        } else {
          this.setStudentResponse();
        }
        this.applyStateClass();
      }
      if (this.dndModel.studentResponse && this.dndModel.studentResponse.length > 0 && this.dropped()) {
        this.dndModel.attempted = true;
      }
      if (!this.dndModel.submited) {
        this.createDraggables();
        this.createDroopables();
      }
      if (this.dndModel.inline) {
        const dropzones = this.elRef.nativeElement.querySelectorAll('.drop-group');
        for (let i = 0; i < dropzones.length; i++) {
          dropzones[i].addEventListener('click', this.setClickedElementToDropLocation.bind(this));
          dropzones[i].addEventListener('focus', ($event) => this.onFocus($event));
          dropzones[i].addEventListener('blur', ($event) => this.onFocus($event));

        }

      }
      this.setCorrectIncorrectClass();
      this.cdr.detectChanges();
      this.calculateTimeLineVerticalLineLeft();
    }, timeout);

  }

  getQuestion(){
    var question = this.dndModel.text;
    if( this.dndModel.inline ) {
      question += this.dndModel.inlineText;
    }
    return this.getPlainText(question);
  }

  getPlainText( text: string ): string{
    do{
      const html = text.slice( text.indexOf('<'), text.indexOf('>') + 1);
      const replace = html.indexOf('drop-group-wrapper') !== -1 ? 'drop-slot ' : ''; 
      text = text.replace( html , replace);
    } while( text.indexOf('<') !== -1 && text.indexOf('>') !== -1);
    return text;
  }

  calculateTimeLineVerticalLineLeft() {
    if (this.dndModel.timeline) {
      const eleTimeline = this.$el.find('.timeline')[0];
      this.timelineVerticalLineLeft = eleTimeline.offsetLeft + (Math.ceil(this.$el.find('.timeline .circle')[0].offsetWidth) / 2) - 1;
    }
  }

  onImageLoad() {
    this.imageOriginalHeight = this.image.nativeElement.naturalHeight;
    this.imageOriginalWidth = this.image.nativeElement.naturalWidth;
    this.onResize();
  }

  resetTilesSize(){
    const dragTiles = this.elRef.nativeElement.querySelectorAll('.draggable-container');
    const dragTilesTitles = this.elRef.nativeElement.querySelectorAll('.drop-group-name');
    for (let i = 0; i < dragTiles.length; i++) {
      jQuery(dragTiles[i]).css('height', 'auto').css('width', 'auto');
      this.$el.find('.draggable').css('height', 'auto').css('width', 'auto');

      if (jQuery(dragTilesTitles[i])) {
        jQuery(dragTilesTitles[i]).css('width', 'auto');
      }
    }
    if (!this.dndModel.backgroundImage) {
      const dropGroups = this.elRef.nativeElement.querySelectorAll('.drop-group');
      for (let i = 0; i < dropGroups.length; i++) {
        jQuery(dropGroups[i]).css('height', 'auto').css('width', 'auto');
      }
    }
    this.cdr.detectChanges();
  }

  checkTileMaxDimensions() {
    this.resetTilesSize();
    this.maxWidth = 0;
    this.maxHeight = 0;
    const dragTiles = this.elRef.nativeElement.querySelectorAll('.draggable-container');
    const dragTilesTitles = this.elRef.nativeElement.querySelectorAll('.drop-group-name');
    for (let i = 0; i < dragTiles.length; i++) {
      if (dragTiles[i].offsetWidth + 1 > this.maxWidth) {
        this.maxWidth = dragTiles[i].offsetWidth + 1;
      }
      if (dragTiles[i].offsetHeight > this.maxHeight) {
        this.maxHeight = dragTiles[i].offsetHeight;
      }
    }

    for (let i = 0; i < dragTiles.length; i++) {
      jQuery(dragTiles[i]).css('height', this.maxHeight + 'px').css('width', this.maxWidth + 'px');
      this.$el.find('.draggable').css('height', this.maxHeight + 'px').css('width', this.maxWidth + 'px');

      if (jQuery(dragTilesTitles[i])) {
        jQuery(dragTilesTitles[i]).css('width', this.maxWidth + 'px');
      }
    }
    if (!this.dndModel.backgroundImage) {
      const dropGroups = this.elRef.nativeElement.querySelectorAll('.drop-group');
      for (let i = 0; i < dropGroups.length; i++) {
        if (this.model.singledrop) {
          jQuery(dropGroups[i]).css('height', this.maxHeight + this.DROP_GROUP_TOLERANCE + 'px')
            .css('width', this.maxWidth + this.DROP_GROUP_TOLERANCE + 'px');
        } else {
          jQuery(dropGroups[i]).css('height', this.model.options.length * (this.maxHeight + 8) + 8 + 'px')
            .css('width', this.maxWidth + this.DROP_GROUP_TOLERANCE + 'px');
        }
      }
    }
  }
  ngOnDestroy() {
    this.resizeService.deregister(this);
  }


  createDraggables() {
    const that = this;

    this.$el.find('.draggable').draggable({
      containment: that.$el,
      cursor: 'move',
      delay: this.browserCompatibilityService.isTouch ? 500 : 0,
      revert: function (dropped) {
        const $draggable = jQuery(this);
        if (this.$el) {
          this.$el.find($draggable[0]).removeClass('highlight-draggable');
          this.$el.find('.drop-group').removeClass('highlight-droppable');
        } else {
          jQuery($draggable[0]).removeClass('highlight-draggable');
          jQuery('.drop-group').removeClass('highlight-droppable');
        }

        if (!dropped) {
          that.moveToInitialPosition($draggable[0]);
        }
        return;
      },
      scroll: false, scrollSensitivity: 100, scrollSpeed: 5, stack: '.draggable',
      start: function (event, ui) {
        KeyboardService.isDragging = true;
        this.isDragging = true;
        jQuery(this).addClass('drag-state-active');
        if (this.$el) {
          this.$el.find('.drop-group').removeClass('highlight-droppable');
        } else {
          jQuery('.drop-group').removeClass('highlight-droppable');
        }

        const dropLocation = this.$el.find('drop-group')[0];
      }.bind(this),
      stop: function (event, ui) {
        KeyboardService.isDragging = false;

        setTimeout(() => {
          this.isDragging = false;

        }, 100);

        jQuery(this).removeClass('drag-state-active');
      }.bind(this)
    });
    if (this.dndModel.isClone) {
      jQuery('.draggable').not('.cloned-item').draggable('option', 'helper', 'clone');
    }
  }

  createDroopables() {
    this.$el.find('.drop-group-wrapper .drop-zone').droppable({
      accept: this.$el.find('.draggable'),
      activate: function () {
        this.$el.find('.drop-group').css({
          // border: '1px dashed red'
        });
      }.bind(this),
      activeClass: 'ui-state-highlight',
      deactivate: function () {
        this.$el.find('.drop-group').css('border', '');
      }.bind(this),

      drop: function (event, ui) {
        this.moveToDroppedLocation.call(this, event.target, ui.draggable[0]);
        this.changeFontSize(ui.draggable[0]);
      }.bind(this),
      hoverClass: 'ui-state-active',
      tolerance: 'intersect'
    });

    const dragTiles: Array<HTMLElement> = this.$el.find('.draggable-container.drop-zone');
    for (let i = 0; i < dragTiles.length; i++) {
      let acceptId: string = dragTiles[i].id;
      acceptId = this.getId(dragTiles[i]);
      jQuery(dragTiles[i]).droppable({
        accept: function (e) {
          if (e[0].dataset.id === i) {
            return true;
          } else {
            return false;
          }
        },
        deactivate: function () {
          this.$el.find('.drop-group').css('border', '');
        }.bind(this),

        drop: function (event, ui) {
          this.moveToDroppedLocation.call(this, event.target, ui.draggable[0]);
          const ele: any = event.target;
        }.bind(this),
        hoverClass: 'ui-state-active',
        tolerance: 'intersect'
      });
    }
    this.scale();

  }
  setStudentResponse() {
    const that = this;
    const tempAnsweredOptions = this.dndModel.answeredOptions.slice();
    this.dndModel.answeredOptions = tempAnsweredOptions;
    if (this.dndModel.submited) {
      this.resetTilesPosition();
    }
    for (const group of that.dndModel.studentResponse) {
      const responseGroup = this.$el.find('.drop-group[data-id=' + group['id'] + ']');
      for (const item of group['items']) {
        that.resizeDraggable(this.$el.find('.draggable[data-id=' + item['id'] + ']')[0], responseGroup, true);
        if (this.dndModel.isClone) {
          const ele = this.$el.find('.draggable[data-id=' + item['id'] + ']').clone()[0];
          ele.classList.add('cloned-item');
          ele.dataset.droppedLocation = group['id'];
          this.$el.find(responseGroup).append(ele);
        } else {
          this.$el.find(responseGroup).append(this.$el.find('.draggable[data-id=' + item['id'] + ']'));
        }
        this.changeContentDimensions(this.$el.find('.draggable[data-id=' + item['id'] + ']')[0]);

      }
    }
    this.setCorrectIncorrectClass();
  }
  setCorrectResponse() {
    const that = this;
    if (this.dndModel.submited) {
      this.resetTilesPosition();
    }
    for (let index = 0; index < this.dndModel.arrCorrectOption.length; index++) {
      if (this.dndModel.isClone) {
        const draggedItem = this.$el.find('.draggable[data-id=' + index + ']');
        for (let j = 0; j < this.dndModel.arrCorrectOption[index].length; j++) {
          if (this.dndModel.arrCorrectOption[index][j] !== -1) {
            const dropLocation = this.$el.find('.drop-group[data-id=' + this.dndModel.arrCorrectOption[index][j] + ']');
            that.resizeDraggable(draggedItem[0], dropLocation[0], true);
            this.$el.find(dropLocation).append(draggedItem.clone());
            this.changeContentDimensions(draggedItem[0]);
          }
        }
      } else {
        const draggedItem = this.$el.find('.draggable[data-id=' + index + ']');
        const dropLocation = this.$el.find('.drop-group[data-id=' + this.dndModel.arrCorrectOption[index] + ']');
        that.resizeDraggable(draggedItem[0], dropLocation[0], true);
        this.$el.find(dropLocation).append(draggedItem);
        this.changeContentDimensions(draggedItem[0]);
      }


      // this.validateDrop.call(this, dropLocation, draggedItem);
    }
    this.setCorrectIncorrectClass();

  }



  dropped(expectedDroppedcount?: number, quantity?: QUANTITY): boolean {
    let undragged = 0;
    const parentDraggables = this.$el.find('.draggable-container');
    if (!expectedDroppedcount) {
      expectedDroppedcount = parentDraggables.length;
    }
    if (!quantity) {
      quantity = QUANTITY.EXACT;
    }

    for (let i = 0; i < parentDraggables.length; i++) {
      if (parentDraggables[i].children.length > 0) {
        undragged++;
      }
    }

    const actualDraggedCount = parentDraggables.length - undragged;

    if ((quantity === QUANTITY.EXACT && expectedDroppedcount === actualDraggedCount) ||
      (quantity === QUANTITY.LESS_THAN && actualDraggedCount < expectedDroppedcount) ||
      (quantity === QUANTITY.GREATER_THEN && actualDraggedCount > expectedDroppedcount) ||
      (quantity === QUANTITY.AT_LEAST && actualDraggedCount >= expectedDroppedcount) ||
      (quantity === QUANTITY.AT_MOST && actualDraggedCount <= expectedDroppedcount)) {
      return true;
    }
    return false;
  }

  applyStateClass() {
    const droppables = this.$el.find('.drop-group');
    for (let i = 0; i < droppables.length; i++) {
      const parentDroppable = jQuery(droppables[i]).parents('.drop-group-wrapper');
      if (parentDroppable) {
        droppables[i].children.length > 0 ? parentDroppable.addClass('dropped') : parentDroppable.removeClass('dropped');
      }
    }
  }


  moveToDroppedLocation(dropLocation, draggedItem) {
    if (dropLocation !== draggedItem.parentElement) {
      this.resizeDraggable(draggedItem, dropLocation, true);

    }
    if (this.$el) {
      this.$el.find(draggedItem).removeClass('highlight-draggable');
      this.$el.find('.drop-group').removeClass('highlight-droppable');
    } else {
      jQuery(draggedItem).removeClass('highlight-draggable');
      jQuery('.drop-group').removeClass('highlight-droppable');
    }

    if (this.dndModel.singledrop) {

      if (jQuery(dropLocation).children().length) {
        if (this.dndModel.isClone) {
          jQuery(dropLocation).children()[0].remove();
        } else {
          this.moveToInitialPosition(jQuery(dropLocation).children()[0]);

        }
      }
    } else {
      if (this.dndModel.maxDroppables && Number(this.dndModel.maxDroppables) <= jQuery(dropLocation).children().length) {
        this.moveToInitialPosition(jQuery(dropLocation).children()[0]);
      }
    }
    jQuery(draggedItem.style.top = '0px');
    jQuery(draggedItem.style.left = '0px');
    if (dropLocation !== draggedItem.parentElement) {
      this.resizeDraggable(draggedItem, dropLocation, true);

      if (this.dndModel.isClone && !draggedItem.classList.contains('cloned-item')) {
        const clonedDraggable = jQuery(draggedItem).clone();
        const draggedItemId = this.getId(draggedItem);
        clonedDraggable.removeClass('drag-state-active');
        clonedDraggable[0].classList.add('cloned-item');
        jQuery(dropLocation).append(clonedDraggable);
        clonedDraggable[0].addEventListener('click', (event) => { this.setClickedId(event) });
        clonedDraggable[0].addEventListener('focus', this.onFocus);
        clonedDraggable[0].addEventListener('blur', this.onBlur);

        this.validateDrop.call(this, dropLocation, clonedDraggable[0]);
        this.createDraggables();
      } else {
        jQuery(dropLocation).append(draggedItem);
        this.validateDrop.call(this, dropLocation, draggedItem);

      }

      this.changeContentDimensions(draggedItem);
    }
    this.clickedItemId = null;
    const draggables = this.$el.find('.draggable');
    for (let i = 0; i < draggables.length; i++) {
      draggables[i].tabIndex = 0;
    }
    this.zone.run(() => {
      this.dndModel.interacted = true;
      if (this.model.checkAllDropped) {
        if (this.dropped()) {
          this.dndModel.attempted = true;
        } else {
          this.dndModel.attempted = false;
        }
      } else {
        this.dndModel.attempted = true;
      }
      this.setAttempted();
    });
    this.cdr.detectChanges();
    this.applyStateClass();
  }
  changeContentDimensions(draggedItem) {
    return;
  }
  onResize() {
    if (window.innerWidth < 750) {
      this.$el.find('.draggable').draggable(
        'option', 'scroll', true
      )
    } else {
      this.$el.find('.draggable').draggable(
        'option', 'scroll', false
      )
    }
    let ratio = (3 / 4);
    const padding = this.DROP_GROUP_TOLERANCE;
    if (window.innerWidth < 700) {
      this.showMobileDND = true;
      this.handleWidth = true;
    } else {
      this.showMobileDND = false;
      this.handleWidth = false;
    }
    // set image height width ratio
    if (this.imageOriginalHeight && this.imageOriginalWidth) {
      ratio = this.imageOriginalHeight / this.imageOriginalWidth;
      const maxWidth = jQuery(this.$el.find('.options-container-wrapper')[0]).innerWidth();
      const maxHeight = jQuery(this.$el.find('.options-container-wrapper')[0]).innerHeight();
      let newWidth: string = this.imageOriginalWidth.toString();
      let newHeight: string = this.imageOriginalHeight.toString();
      if (this.handleWidth) {
        if (this.imageOriginalWidth > maxWidth) {
          newWidth = maxWidth.toString();
          newHeight = (maxWidth * ratio).toString();
        }
      } else {
        if (maxHeight < ratio * maxWidth) {

          if (this.imageOriginalHeight > maxHeight) {
            newHeight = maxHeight.toString();
            newWidth = (maxHeight / ratio).toString();
          }
        } else {
          if (this.imageOriginalWidth > maxWidth) {
            newWidth = maxWidth.toString();
            newHeight = (maxWidth * ratio).toString();
          }
        }
      }
      this.imageHeight = newHeight;
      this.imageWidth = newWidth;
      this.imageHeight = parseInt(this.imageHeight, 10) + 'px';
      this.imageWidth = parseInt(this.imageWidth, 10) + 'px';
    }
    this.scale();
    window.setTimeout(() => {
      this.changeFontSize();
      const dropGroups = this.$el.find('.drop-group');
      for (let i = 0; i < dropGroups.length; i++) {
        const children = dropGroups[i].children;
        for (let j = 0; j < children.length; j++) {
          this.resizeDraggable(children[j], dropGroups[i], true);
          this.changeContentDimensions(children[j]);
        }
      }
      this.checkTileMaxDimensions();
      this.cdr.detectChanges();
      setTimeout(() => {
        this.calculateTimeLineVerticalLineLeft();
      }, 300);
    }, 100);
  }
  scale() {
    return;
  }
  changeFontSize() {
    return;
  }

  saveResponse() {
    if (!this.dndModel.submited) {
      const groupsResponseArray = [];
      for (const group of this.dndModel.groups) {
        let groupId = group['id'];
        groupId = groupId;
        const groupItemsArray = [];
        const children: any = this.$el.find('.drop-group[data-id=' + groupId + ']').children();

        for (const child of children) {
          groupItemsArray.push({ 'id': child.dataset.id });
        }
        const groupResponseObj = { 'id': groupId, 'items': groupItemsArray };
        groupsResponseArray.push(groupResponseObj);
      }
      this.dndModel.studentResponse = groupsResponseArray;
    }
  }



  moveToInitialPosition(element: HTMLElement) {
    const draggableId = '#draggable-' + element.dataset.id;
    if (this.$el) {
      this.$el.find(element).removeClass('highlight-draggable');
      this.$el.find('.drop-group').removeClass('highlight-droppable');
    } else {
      jQuery(element).removeClass('highlight-draggable');
      jQuery('.drop-group').removeClass('highlight-droppable');
    }

    if (this.dndModel.isClone) {
      const previousDropId = element.parentElement.dataset.id;
      if (element.parentElement.classList.contains('drop-group')) {
        element.remove();
        const dropLocation = '';
        this.validateDrop(dropLocation, element, previousDropId);
      }

    } else {
      if (this.$el) {
        this.$el.find(draggableId).append(element);
      } else {
        jQuery(draggableId).append(element);
      }

      const dropLocation = '';
      this.validateDrop(dropLocation, element);
    }
    element.style.top = '0px';
    element.style.left = '0px';
    this.setDraggableDimensions(element);
    // element.style.position = 'relative';
    if (this.dndModel.backgroundImage) {
      jQuery(element).find('.draggable-content')[0].style.transform = 'scale(1,1)';
      jQuery(element).find('.draggable-content')[0].style.width = '100%';
      jQuery(element).find('.draggable-content')[0].style.height = '100%';
    }
    this.clickedItemId = undefined;
    this.zone.run(() => {
      if (this.model.checkAllDropped) {
        if (this.dropped()) {
          this.dndModel.attempted = true;
        } else {
          this.dndModel.attempted = false;
        }
      }
      this.setAttempted();

    });
    if (!this.dropped(1, QUANTITY.AT_LEAST)) {
      this.model.interacted = false;
    }
    this.cdr.detectChanges();
    this.applyStateClass();
  }

  setAttempted() {
    setTimeout(() => {
      if (!this.dndModel.submited) {
        const droppedLength = this.$el.find('.dropped.drop-group-wrapper').length;
        if (droppedLength > 0) {
          this.dndModel.attempted = true;
        } else if (droppedLength === 0) {
          this.dndModel.attempted = false;
        }
      }
    }, 100);
  }

  validateDrop(dropLocation, droppedItem: HTMLElement, previousDropId?) {

    const droppedItemId: string = this.getId(droppedItem);
    const correctOption = parseInt(droppedItemId, 10);
    let matchFlag = false;
    if (dropLocation !== '') {
      const dropLocationId: number = parseInt(this.getId(dropLocation), 10);
      if (this.dndModel.specificFeedback && !this.dndModel.submited) {
        this.dndModel.feedback = this.dndModel.options[correctOption]['feedback']
      }
      if (this.dndModel.isClone) {
        if (this.correctOptions[correctOption].indexOf(dropLocationId) !== -1) {
          matchFlag = true;
        }
      } else {
        if (this.correctOptions[correctOption] === dropLocationId) {
          matchFlag = true;
        }
      }
    } else {
      if (this.dndModel.isClone) {
        if (this.correctOptions[correctOption][previousDropId] === -1) {
          matchFlag = true;

        }
      } else {
        if (this.correctOptions[correctOption] === -1) {
          matchFlag = true;

        }
      }
      if (!this.dndModel.submited) {
        this.dndModel.feedback = '';
      }
    }
    if (!this.dndModel.submited) {
      if (this.dndModel.isClone) {
        if (typeof dropLocation !== 'string') {
          const dropLocationId: number = parseInt(this.getId(dropLocation), 10);
          this.dndModel.answeredOptions[correctOption][dropLocationId] = matchFlag;
        } else {
          this.dndModel.answeredOptions[correctOption][previousDropId] = matchFlag;

        }
      } else {
        this.dndModel.answeredOptions[correctOption] = matchFlag;
      }
    }
    this.saveResponse();
  }

  getId(element: any): string {
    const found: string = element.dataset.id;
    if (found === null) {
      return '-1';
    }
    return found;
  }
  setCorrectIncorrectClass() {
    const draggables = this.$el.find('.draggable');
    for (let i = 0; i < draggables.length; i++) {
      if (draggables[i].classList.contains('correct-answer')) {
        draggables[i].classList.remove('correct-answer');
        jQuery(draggables[i]).find('.icon')[0].classList.remove('icon-check');
      }
      if (draggables[i].classList.contains('wrong-answer')) {
        draggables[i].classList.remove('wrong-answer');
        jQuery(draggables[i]).find('.icon')[0].classList.remove('icon-check-cross');
      }

    }
    if (this.model.submited && this.showResult) {
      for (let i = 0; i < draggables.length; i++) {
        if (this.showCorrectAnswerFlag) {
          draggables[i].classList.add('correct-answer');
          jQuery(draggables[i]).find('.icon')[0].classList.add('icon-check');
        } else {
          if (this.dndModel.isClone) {
            // tslint:disable-next-line:no-empty
            if (!draggables[i].classList.contains('cloned-item')) {

            } else if (this.dndModel.answeredOptions[draggables[i].dataset.id][draggables[i].dataset.droppedLocation]) {
              draggables[i].classList.add('correct-answer');
              jQuery(draggables[i]).find('.icon')[0].classList.add('icon-check');
            } else {
              draggables[i].classList.add('wrong-answer');
              jQuery(draggables[i]).find('.icon')[0].classList.add('icon-check-cross');
            }
          } else {
            if (this.dndModel.answeredOptions[draggables[i].dataset.id]) {
              draggables[i].classList.add('correct-answer');
              jQuery(draggables[i]).find('.icon')[0].classList.add('icon-check');
            } else {
              draggables[i].classList.add('wrong-answer');
              jQuery(draggables[i]).find('.icon')[0].classList.add('icon-check-cross');

            }
          }
        }

      }
    }
  }
  resetTilesPosition() {
    for (const tile of this.dndModel.options) {
      const tileId: string = tile['id'];
      if (this.dndModel.isClone) {
        const tileElement = this.$el.find('.draggable[data-id=' + tileId + ']');
        for (let j = 0; j < tileElement.length; j++) {
          this.moveToInitialPosition(tileElement[j])
        }
      } else {
        const tileElement: HTMLElement = this.$el.find('.draggable[data-id=' + tileId + ']')[0];
        this.moveToInitialPosition(tileElement)

      }
    }
  }
  resizeDraggable(draggedItem, dropLocation, forceResize?: boolean) {
    return;
  }
  setDraggableDimensions(element) {
    return;
  }
  setClickedId(event) {
    const that = this;
    if (this.isDragging) {
      return true;
    }
    if (this.clickedItemId) {


      if (event.currentTarget.parentElement.classList.contains('drop-group')) {
        event.currentTarget.classList.remove('highlight-draggable');
        this.setClickedElementToDropLocation(event.currentTarget.parentElement, true);
      } else {
        this.clickedItemId = event.currentTarget.dataset.id;
        event.stopPropagation();

      }
    } else {
      this.clickedItemId = event.currentTarget.dataset.id;
      event.stopPropagation();
      if (this.$el) {
        this.$el.find('.draggable').removeClass('highlight-draggable');
        this.$el.find('.drop-group').addClass('highlight-droppable');
      } else {
        jQuery('.draggable').removeClass('highlight-draggable');
        jQuery('.drop-group').addClass('highlight-droppable');
      }

      event.currentTarget.classList.add('highlight-draggable');

    }
    const draggables = this.$el.find('.draggable');

    for (let i = 0; i < draggables.length; i++) {
      draggables[i].tabIndex = -1;
    }
    const dropzones = this.$el.find('.drop-group');

    for (let i = 0; i < dropzones.length; i++) {
      dropzones[i].tabIndex = 0;
    }
  }
  setClickedElementToDropLocation(event, dontReturn?: boolean) {
    if (!dontReturn) {
      if (event.target !== event.currentTarget) {
        return;
      }
    }
    let group;

    if (event.currentTarget) {
      group = event.currentTarget;
      event.stopPropagation();
    } else {
      group = event;
    }

    if (this.clickedItemId) {
      const tile = this.$el.find('.draggable:not(.cloned-item)[data-id=' + this.clickedItemId + ']')[0];
      this.moveToDroppedLocation(group, tile);
      this.clickedItemId = undefined;
    }
    const dropzones = this.elRef.nativeElement.querySelectorAll('.drop-group');

    for (let i = 0; i < dropzones.length; i++) {
      dropzones[i].tabIndex = -1;
    }

  }

  /* To move draggable to initial position when clicked on other place than drop group */
  @HostListener('document:click', ['$event'])
  onOuterClick(event: MouseEvent) {
    if (this.clickedItemId && event.srcElement && !event.srcElement.classList.contains('drop-group')) {
      this.moveToInitialPosition(this.$el.find('.draggable[data-id=' + this.clickedItemId + ']')[0]);
      this.clickedItemId = undefined;
    }
  }
  // tslint:disable-next-line:max-file-line-count
}

export enum QUANTITY {
  EXACT = 1,
  AT_LEAST = 2,
  AT_MOST = 3,
  LESS_THAN = 4,
  GREATER_THEN = 5
}
