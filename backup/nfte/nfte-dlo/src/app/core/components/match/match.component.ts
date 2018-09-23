import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { WindowResizeService } from './../../services/window-resize.service';
import { QuestionComponent } from './../question/question.component';
import { MatchModel } from './match.model';

import * as jQuery from 'jquery';
import 'jqueryui';
(window as any).jQuery = jQuery;
declare var require: any;
@Component({
  selector: 'app-match',
  styleUrls: ['./match.component.scss'],
  templateUrl: './match.component.html'
})
export class MatchComponent extends QuestionComponent implements OnInit, AfterViewInit, OnDestroy {
  matchModel: MatchModel;
  showCorrectAnswerFlag: boolean = false;
  disabled;
  drawLineFirstClickElement;
  drawLineFirstClickY;
  drawLineSecondClickElement;
  drawLineSecondClickY;
  sideClicked;
  clickedSameRadioButton;
  clickedParentRadioButton
  parentRadioButton;
  viewReady: boolean = false;
  showClickedRadioButton: boolean = false;
  fullScreen: Boolean = false;
  window: any;
  selectedColumn: number;
  @Input() index: number;
  @Input() set model(model: MatchModel) {
    this.matchModel = model;
  }
  get model(): MatchModel {
    return this.matchModel;
  }
  @Input() set showCorrectAnswer(showCorrectAnswer: boolean) {
    this.showCorrectAnswerFlag = showCorrectAnswer;
    if (this.matchModel.studentResponse !== null && this.viewReady) {
      if (this.showCorrectAnswerFlag) {
        this.resetMatching();
        this.setCorrectResponse();
      } else {
        this.resetMatching();
        this.setStudentResponse();
      }
    }
  }
  constructor(el: ElementRef, private cdr: ChangeDetectorRef, private resizeService: WindowResizeService) {
    super(el);
   }

  ngOnInit() {
    this.resizeService.register(this);
    this.selectedColumn = -1;
    this.fullScreen = false;
    this.drawLineFirstClickElement = undefined;
    this.drawLineFirstClickY = undefined;
    this.drawLineSecondClickElement = undefined;
    this.drawLineSecondClickY = undefined;
    this.onResize();
  }
  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.viewReady = true;
    if (this.matchModel.studentResponse !== null) {
      if (this.showCorrectAnswerFlag) {
        this.setCorrectResponse();
      } else {
        this.setStudentResponse();
      }
    }
  }

  ngOnDestroy() {
    this.resizeService.deregister(this);
  }

  isAncestorProperty(element, property, value) {
    while (element) {
      if (window.getComputedStyle(element).getPropertyValue(property) === value) {
        return true;
      }
      element = element.offsetParent as HTMLElement;
    }

    return false;
  }

  onScroll() {
    if (this.fullScreen) {
      document.body.scrollLeft = 0;
      document.body.scrollTop = 0;
    }
  }
  reflectChanges() {
    const inactiveRadioButtons = this.$el.find('.inactive .second-click-state');
    for (let i = 0; i < inactiveRadioButtons.length; i++) {
      inactiveRadioButtons[i].classList.remove('second-click-state');
    }

    let activeRadioButtons = this.$el.find('.active .second-click-state');
    for (let i = 0; i < activeRadioButtons.length; i++) {
      this.$el.find('.inactive #' + activeRadioButtons[i].id).addClass('second-click-state');
      this.parentRadioButton = this.$el.find('.inactive #' + activeRadioButtons[i].id)[0];
      this.drawLineFirstClickElement = jQuery(this.parentRadioButton).find('.circle')[0];
    }

    activeRadioButtons = this.$el.find('.active .click-state');
    for (let i = 0; i < activeRadioButtons.length; i++) {
      this.$el.find('.inactive #' + activeRadioButtons[i].id).addClass('click-state');
    }


  }

  setResponse() {
    this.resetMatching();
    if (this.matchModel.studentResponse !== null) {
      if (this.showCorrectAnswerFlag) {
        this.setCorrectResponse();
      } else {
        this.setStudentResponse();
      }
    }
  }

  onResize() {
    this.reflectChanges();
    this.window = window;
    this.cdr.detectChanges();
    this.setResponse();
  }

  setFullScreenMode(isFullScreen: Boolean) {
    this.fullScreen = isFullScreen;
    this.onScroll();
  }

  setCorrectResponse() {
    this.matchModel.arrCorrectOption.forEach((studentResponseItem, index) => {
      const leftElementId = 'match-left-' + this.index + '-' + index;
      for (const rightElement of studentResponseItem) {
        const rightElementId = 'match-right-' + this.index + '-' + rightElement;
        const line = this.createLine(leftElementId, rightElementId);
        line.addClass('correct-line');
        this.$el.find('.active #' + rightElementId).addClass('click-state');
        this.$el.find('.active #' + leftElementId).addClass('click-state');
      }
    });
  }

  setStudentResponse() {
    this.modifyState('click-state');
    const response = [];
    for (const studentResponseItem of this.matchModel.studentResponse) {
      studentResponseItem['validatedArray'] = [];
      studentResponseItem['items'].forEach((rightElement, index) => {

        const line = this.createLine(studentResponseItem['leftElementId'], rightElement);
        this.$el.find('.active #' + studentResponseItem['leftElementId']).addClass('click-state');
        this.$el.find('.active #' + rightElement).addClass('click-state');
        studentResponseItem['validatedArray'].push(this.validateResponse(this.$el.find('#' + studentResponseItem['leftElementId'])[0],
          this.$el.find('#' + rightElement)[0]));
        if (this.model.submited) {
          if (studentResponseItem['validatedArray'][index]) {
            line.addClass('correct-line');
          }
          if (!studentResponseItem['validatedArray'][index]) {
            line.addClass('incorrect-line');
          }
        }
      });
      response.push({
        'items': studentResponseItem['items'],
        'leftElementId': studentResponseItem['leftElementId'],
        'validatedArray': studentResponseItem['validatedArray']
      });
    }
    if (response.length !== 0) {
      this.matchModel.studentResponse = response;
    }
  }
  setSelected() {
    const matchedLine = this.$el.find('.active .match-middle-container').children().length;
    // this.matchModel.selected = index;
    if (matchedLine) {
      this.matchModel.attempted = true;
    } else {
      this.matchModel.attempted = false;
    }
  }

  modifyState(removeState) {
    this.matchModel.arrCorrectOption.forEach((studentResponseItem, index) => {
      const leftElementId = 'match-left-' + this.index + '-' + index;
      for (const rightElement of studentResponseItem) {
        const rightElementId = 'match-right-' + this.index + '-' + rightElement;
        this.$el.find('.active #' + rightElementId).removeClass(removeState);
        this.$el.find('.active #' + leftElementId).removeClass(removeState);
      }
    });
  }

  resetMatch() {
    this.modifyState('click-state');
    this.modifyState('second-click-state');
    if (this.parentRadioButton) {
      this.parentRadioButton.classList.remove('second-click-state');
    }
    this.resetMatching();
  }

  resetMatching() {
    let lines;
    lines = this.$el.find('.active .line');
    for (let i = 0; i < lines.length; i++) {
      lines[i].parentNode.removeChild(lines[i]);
    }

    const radio = this.$el.find('.circle');
    for (let i = 0; i < radio.length; i++) {
      radio[i].classList.remove('click-state');
    }
  }

  /* calculates the offset from main body tag */
  cumulativeOffset(element: HTMLElement) {
    let top = 0, left = 0;
    while (element) {
      top += element.offsetTop - element.scrollTop || 0;
      left += element.offsetLeft - element.scrollLeft || 0;

      element = element.offsetParent as HTMLElement;
    }

    return {
      left: left,
      top: top
    };
  };

  createLine(firstElementId, secondElementId) {
    this.onScroll();
    const firstElement = this.$el.find('.active #' + firstElementId)[0];
    const secondElement = this.$el.find('.active #' + secondElementId)[0];
    const firstElementWidth = firstElement.offsetWidth;
    const firstElementHeight = firstElement.offsetHeight;
    const secondElementWidth = secondElement.offsetWidth;
    const secondElementHeight = secondElement.offsetHeight;
    let x1 = Math.round(this.cumulativeOffset(firstElement).left + (firstElementWidth / 2));
    let y1 = Math.round(this.cumulativeOffset(firstElement).top + (firstElementHeight / 2));
    const x2 = Math.round(this.cumulativeOffset(secondElement).left + (secondElementWidth / 2));
    const y2 = Math.round(this.cumulativeOffset(secondElement).top + (secondElementHeight / 2));
    const length = Math.sqrt(Math.round((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const angleAbs = Math.abs(angle);
    const transform = 'rotate(' + angleAbs + 'deg)';
    const ele = jQuery('<div>');
    const eleParent = this.$el.find('.active .match-middle-container');

    if (!this.fullScreen) {
      if (this.isAncestorProperty(this.elRef.nativeElement, 'position', 'fixed')) {
        x1 = x1 + document.getElementsByTagName('html')[0].scrollLeft;
        y1 = y1 + document.getElementsByTagName('html')[0].scrollTop;

      } else {
        x1 = x1 + document.body.scrollLeft;
        y1 = y1 + document.body.scrollTop;
      }
    }


    const line = ele
      .appendTo(eleParent)
      .addClass('line')
      .css({
        'transform': transform,
        'width': this.pixelToPercentage(length, eleParent ? eleParent[0].offsetWidth : 0) + '%'
      })
      .offset({ left: x1, top: y1 });
    if (angle < 0) {
      ele.css({
        'transform': 'rotate(' + -1 * angleAbs + 'deg)'
      })
    }
    return line;
  }

  pixelToPercentage(childEleHeight: number, parentEleHeight) {
    return childEleHeight !== 0 && parentEleHeight !== 0 ? Math.round((childEleHeight / parentEleHeight) * 100) : 0;
  }


  /* saves clicked item*/
  setClickCoordinates(event) {
    let saveResponseFlag = false;
    const element = event.currentTarget.parentElement.querySelector('.mcq-radio-button');
   
    if (!this.drawLineFirstClickElement) {
      this.drawLineFirstClickElement = event.currentTarget.parentElement.querySelector('.mcq-radio-button');
      this.clickedSameRadioButton = this.drawLineFirstClickElement.id;
      this.parentRadioButton = this.drawLineFirstClickElement.parentElement;
      this.clickedParentRadioButton = this.parentRadioButton;
      this.drawLineFirstClickElement.classList.add('click-state');
      this.parentRadioButton.classList.add('second-click-state');
      this.selectedColumn = parseInt(jQuery(element).parents('.radio-option-container')[0].getAttribute('index'));
      // this.$el.find('#' + this.parentRadioButton).addClass('second-click-state');
      this.sideClicked = jQuery( this.drawLineFirstClickElement ).parents('#radio-option-container')[0].classList;
    } else {
      this.selectedColumn = -1;
      if (this.sideClicked !== jQuery( element ).parents('#radio-option-container')[0].classList) {
        this.drawLineSecondClickElement = event.currentTarget.parentElement.querySelector('.mcq-radio-button');
        this.drawLineSecondClickElement.classList.add('click-state');
        this.parentRadioButton.classList.remove('second-click-state');
        if (this.sideClicked.value.indexOf('match-left-container') !== -1) {
          saveResponseFlag = this.saveResponse(this.drawLineFirstClickElement, this.drawLineSecondClickElement);
        } else {
          saveResponseFlag = this.saveResponse(this.drawLineSecondClickElement, this.drawLineFirstClickElement);
        }
        if (saveResponseFlag) {
          this.createLine(this.drawLineFirstClickElement.id, this.drawLineSecondClickElement.id);
          this.setResponse();

        }
        this.drawLineFirstClickElement = undefined;
        this.drawLineFirstClickY = undefined;
        if (saveResponseFlag) {
          this.setSelected();
        }
      } else {
        this.drawLineFirstClickElement = event.currentTarget.parentElement.querySelector('.mcq-radio-button');
        this.parentRadioButton = this.drawLineFirstClickElement.parentElement;
        this.sideClicked = jQuery( this.drawLineFirstClickElement ).parents('#radio-option-container')[0].classList;
        if (this.model.studentResponse) {
          for (const studentResponseElement of this.matchModel.studentResponse) {
            if (this.sideClicked.value.indexOf('match-left-container') !== -1) {
              if (studentResponseElement['leftElementId'] === this.clickedSameRadioButton) {
                this.showClickedRadioButton = true;
                break;
              }
            } else {
              for (const rightElementID of studentResponseElement['items']) {
                if (rightElementID === this.clickedSameRadioButton) {
                  this.showClickedRadioButton = true;
                  break;
                }
              }
            }
            if (this.showClickedRadioButton === true) {
              break;
            }
          }
        }
        if (this.drawLineFirstClickElement.id === this.clickedSameRadioButton) {
          if (this.showClickedRadioButton === true) {
            this.clickedParentRadioButton.classList.remove('second-click-state');
          } else {
            this.$el.find('.active #' + this.clickedSameRadioButton).removeClass('click-state');
            this.clickedParentRadioButton.classList.remove('second-click-state');
          }
          this.drawLineFirstClickElement = undefined;
        } else {
          if (this.showClickedRadioButton === true) {
            this.clickedParentRadioButton.classList.remove('second-click-state');
          } else {
            this.$el.find('.active #' + this.clickedSameRadioButton).removeClass('click-state');
            this.clickedParentRadioButton.classList.remove('second-click-state');
          }
          if (this.drawLineFirstClickElement.classList.contains('click-state')) {
            this.parentRadioButton.classList.add('second-click-state');
          } else {
            this.drawLineFirstClickElement.classList.add('click-state');
            this.parentRadioButton.classList.add('second-click-state');
          }
          this.clickedSameRadioButton = this.drawLineFirstClickElement.id;
          this.clickedParentRadioButton = this.parentRadioButton;
          this.showClickedRadioButton = false;
        }
      }
    }
  }

  /* save relation of the left matched element to the right element */
  saveResponse(leftElement, rightElement): boolean {
    const rightItem = rightElement.id;
    if (this.matchModel.studentResponse === null) {
      this.matchModel.studentResponse = [];
      const rightElementsArray = [];
      const rightElementsValidatedArray = [];
      rightElementsArray.push(rightItem);
      rightElementsValidatedArray.push(this.validateResponse(leftElement, rightElement));
      // const line = this.createLine(leftElement.id, rightElement.id);
      this.matchModel.studentResponse.push({
        'items': rightElementsArray,
        'leftElementId': leftElement.id,
        'validatedArray': rightElementsValidatedArray
      });
      return true;
    } else {
      let checkSameResponse = false;
      for (const studentResponseElement of this.matchModel.studentResponse) {
        for (const rightElementID of studentResponseElement['items']) {
          if (studentResponseElement['leftElementId'] === leftElement.id && rightElementID === rightItem) {
            const index = studentResponseElement['items'].indexOf(rightElementID);
            studentResponseElement['items'].splice(index, 1);
            if (studentResponseElement['items'].length === 0) {
              const respIndex = this.model.studentResponse.indexOf(studentResponseElement);
              this.model.studentResponse.splice(respIndex, 1);
            }
            checkSameResponse = true;
          }
          if (checkSameResponse) {
            leftElement.classList.remove('click-state');
            rightElement.classList.remove('click-state');
            return checkSameResponse;
          }
        }
      }
      let leftElementIdFlag = false;
      let rightElementMatchFlag = false;
      for (const studentResponseElement of this.matchModel.studentResponse) {
        if (studentResponseElement['leftElementId'] === leftElement.id) {
          studentResponseElement['items'].forEach(rightElementId => {
            if (rightElementId !== rightElement.id) {
              if (studentResponseElement['items'].indexOf(rightItem) === -1) {
                studentResponseElement['items'].push(rightItem);
              }
              studentResponseElement['validatedArray'].push(this.validateResponse(leftElement, rightElement));
              leftElementIdFlag = true;
            } else {
              rightElementMatchFlag = true;
            }
          });
          break;
        }
      }

      if (!leftElementIdFlag && !rightElementMatchFlag) {
        const rightElementsArray = [];
        const rightElementsValidatedArray = [];
        rightElementsArray.push(rightItem);
        rightElementsValidatedArray.push(this.validateResponse(leftElement, rightElement));
        const newStudentResponseItem = {
          'items': rightElementsArray,
          'leftElementId': leftElement.id,
          'validatedArray': rightElementsValidatedArray
        };
        this.matchModel.studentResponse.push(newStudentResponseItem);
        leftElementIdFlag = true;
      }
      if (leftElementIdFlag && !rightElementMatchFlag) {
        return true;
      } else {
        return false;
      }
    }
  }

  /* checkes whether the user response is correct or not */
  validateResponse(leftElement, rightElement): boolean {
    let itemValidate: boolean;
    const leftElementIdValue = parseInt(this.getId(leftElement), 0);
    const rightElementIdValue = this.getId(rightElement);
    for (let i = 0; i < this.model.arrCorrectOption[leftElementIdValue].length; i++) {
      if (this.matchModel.arrCorrectOption[leftElementIdValue][i] === rightElementIdValue) {
        itemValidate = true;
        break;
      }
      itemValidate = false;
    }
    return itemValidate;
  }
  /* gets the last character of the element id */
  getId(element: any): string {
    const re = /[\d]+$/i;
    const found: string = element.id.match(re);
    if (found === null) {
      return '-1';
    }
    return found[0];
  }

  /* to set page to question and answer to readnoly mode */
  setReadonly() {
    document.getElementsByClassName('match-container')[0].classList.add('readonly');
  }

  /* to set the stte to submitted when done button is clicked */
  onDoneClick() {
    this.setReadonly();
    this.model.submit();
    this.matchModel.doneClicked = true;
    this.disabled = true;
    this.setStudentResponse();
    const inactiveRadioButtons = this.$el.find('.second-click-state');
    if (inactiveRadioButtons.length > 0) {
      this.drawLineFirstClickElement = undefined;
    }
    for (let i = 0; i < inactiveRadioButtons.length; i++) {
      inactiveRadioButtons[i].classList.remove('second-click-state');
    }
  }

  beforePrint() {
    document.getElementsByClassName('match-left-right-container')[0].classList.add('print');
    this.setResponse();

  }
  afterPrint() {
    document.getElementsByClassName('match-left-right-container')[0].classList.remove('print');
    this.setResponse();

  }
}
