import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from './../base/base.component';

@Component({
  selector: 'app-bottom-buttons',
  styleUrls: ['./bottom-buttons.component.scss'],
  templateUrl: './bottom-buttons.component.html'
})
export class BottomButtonsComponent extends BaseComponent implements AfterViewChecked {
  @Input() cuePointData;
  @Input() api;
  @Input() doneDisable;
  @Input() doneClicked;
  @Input() feedbackClass;
  @Input() feedback;
  @Input() videoCompleted: boolean = false;
  @Output() done = new EventEmitter<boolean>();
  @Output() skip = new EventEmitter<boolean>();
  @Output() explore = new EventEmitter<boolean>();
  @Output() resume = new EventEmitter<boolean>();
  @Output() showCorrectAnswer = new EventEmitter<boolean>();
  @Output() reset = new EventEmitter<boolean>();
  @Output() fullscreen = new EventEmitter<boolean>();
  @Input() showCorrectAnswerFlag;
  @Input() forceResume;



  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.forceResume = false;
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  isVisible(id): boolean {
    const ele = document.getElementById(id);
    if (ele && ele.clientHeight > 0 && ele.clientWidth > 0) {
      return true;
    }
    return false;
  }
  setIconClass() {
    let classes;
    if (this.feedbackClass === 'correct') {
      classes = 'icon-check correct';
    } else if (this.feedbackClass === 'partially-correct') {
      classes = 'icon-partial-correct partially-correct';
    } else {
      classes = 'icon-check-cross incorrect';
    }
    classes += ' feedback-icon';
    return classes;
  }

  isIpadView() {
    const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    console.log(width);
    if (width === 768) {
      return true;
    }
    return false;
  }

}


