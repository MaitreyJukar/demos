import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { PaginatorComponent } from 'app/core/components/paginator/paginator.component';
import { MessageService, SECTION } from '../../../core/services/message.service';
import { DndBaseComponent } from './../../../core/components/dnd-base/dnd-base';
import { MatchComponent } from './../../../core/components/match/match.component';
import { QuizModel } from './quiz.model';

@Component({
  selector: 'app-quiz',
  styleUrls: ['./quiz.component.scss'],
  templateUrl: './quiz.component.html'
})
export class QuizComponent implements OnDestroy, OnInit {

  model: QuizModel;
  @ViewChild('prevoiusButton') prevButton;
  @ViewChild('nextButton') nextButton;
  @ViewChild('mcq') component;
  @ViewChild('reportPopup') report;
  @ViewChild('brAlert') alertPopup;
  @ViewChild('hotspot') hotspot;
  @ViewChild('dnd') dnd: DndBaseComponent;
  @ViewChild('match') match: MatchComponent;
  @ViewChild('paginator') paginator: PaginatorComponent;

  condition: boolean = true;
  collection = [];
  pageNumber: number = 1;
  totalPages: number = 0;
  submitClicked: boolean = false;
  viewReport: boolean = false;
  alertTitle;
  alertMsg: string = 'submitAlertAllAttempted';
  focusYesEle: ElementRef;
  focusNoEle: ElementRef;
  isHotspot = false;
  fullScreenMode = false;
  reportVisible: boolean = false;

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const target: any = event.target;
    if (this.reportVisible) {
      return;
    }
    if (!target.classList.contains('icon-list')) {
      this.paginator.displayQuestionList = false;
    }
    if (target.classList.contains('question-number-paginator')) {
      this.paginator.displayQuestionList = true;
    }
  }

  ngOnInit() {
    const data = MessageService.dloData['quiz'];
    this.model = new QuizModel(data);
    this.pageNumber = this.model.currentQuestion;
    if (this.model.questions[this.pageNumber - 1].type === 6) {
      this.isHotspot = true;
    } else {
      this.isHotspot = false;
    }
    document.body.scrollTop = 0;
    MessageService.section = SECTION.TAKE_QUIZ;
  }
  ngOnDestroy() {
    this.model.currentQuestion = this.pageNumber;
    MessageService.dloData['quiz'] = this.model;
    MessageService.section = SECTION.NONE;
  }
  onPageChange(pageNumber: number) {
    this.pageNumber = pageNumber;
    if (this.model.questions[pageNumber - 1].type === 6) {
      this.isHotspot = true;
    } else {
      this.isHotspot = false;
    }
  }
  quizSubmitted() {

    for (let i = 0; i < this.model.questions.length; i++) {
      this.model.questions[i].submit();
    }
    this.model.submited = true;

    MessageService.dloData['quiz'] = this.model;
    this.showReport();
  }
  changeMode() {
    this.fullScreenMode = !this.fullScreenMode;
  }
  isLastPage() {
    if (this.pageNumber === this.model.questions.length) {
      return true;
    }
    return false;
  }

  showReport() {
    this.reportVisible = true;
    document.body.classList.add('report-open');
    // window.alert('Coming Soon...');
  }
  hideReport() {
    this.reportVisible = false
    document.body.classList.remove('report-open');

  }

  showAlertMessage() {
    this.alertTitle = 'alert';
    for (let i = 0; i < this.model.questions.length; i++) {
      if (this.model.questions[i].attempted) {
        this.alertMsg = 'submitAlertAllAttempted';

      } else {
        this.alertMsg = 'submitAlertPartialAttempted';
        break;
      }
    }
    setTimeout(() => {
      this.alertPopup.show();
    }, 200);
  }



  alertYesClicked(event: EventTarget) {
    this.quizSubmitted();
  }
  fullscreen() {
    this.hotspot.fullscreen();
  }
}
