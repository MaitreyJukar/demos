import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BrowserCompatibilityService } from '../../services/browser-compatibility.service';
import { WindowResizeService } from './../../services/window-resize.service';
import { MatchComponent } from './../match/match.component';
import { questionType } from './../question/question.component';
import { responseType } from './../question/question.model';

@Component({
  selector: 'app-simple-report',
  styleUrls: ['./simple-report.component.scss'],
  templateUrl: './simple-report.component.html'
})

export class SimpleReportComponent implements OnInit, OnDestroy {
  @ViewChild('match') match: MatchComponent;
  correctCounter: number = 0;
  incorrectCounter: number = 0;
  partiallyCorrectCounter: number = 0;
  notAnsweredCounter: number = 0;
  notGraded: number = 0;
  reportModel;
  showCorrectAnswer: Array<boolean>;
  barDataCounter = [];
  chartData = [];
  chartMaxTickValue: number;


  @Input() set model(model: object) {
    this.reportModel = model;
    for (let i = 0; i < this.reportModel.questions.length; i++) {
      if (this.reportModel.questions[i].type === questionType.LIKERT && this.reportModel.questions[i].attempted) {
        this.notGraded++;
      } else {
        if (!this.reportModel.questions[i].attempted) {
          this.notAnsweredCounter++;
        } else {
          if (this.reportModel.questions[i].responseType === responseType.CORRECT) {
            this.correctCounter++;
          } else if (this.reportModel.questions[i].responseType === responseType.PARTIALLY_CORRECT) {
            this.partiallyCorrectCounter++;
          } else {
            this.incorrectCounter++;
          }
        }
      }
    }

    // this.chartData = [this.correctCounter, this.partiallyCorrectCounter, this.incorrectCounter,
    //    this.notAnsweredCounter, this.notGraded];
    this.barDataCounter = [this.correctCounter, this.partiallyCorrectCounter, this.incorrectCounter,
    this.notAnsweredCounter, this.notGraded];

    this.showCorrectAnswer = new Array(this.reportModel.questions.length).fill(true);
    this.chartMaxTickValue = this.reportModel.questions.length;

    this.getChartData();
  }

  get model(): object {
    return this.reportModel;
  }
  colors = [
    { code: '#50812c' }
    , { code: '#005393' }
    , { code: '#d03131' }
    , { code: '#737373' }
    , { code: '#F8604A' }
  ];

  xAxisLabels = [{ name: 'Correct', icon: 'icon-tick_filled' }
    , { name: 'Partially Correct', icon: 'icon-partial-correct' }
    , { name: 'Incorrect', icon: 'icon-cross_filled' }
    , { name: 'Not Answered', icon: 'icon-skipped' }
    , { name: 'Not Graded', icon: 'icon-not-graded' }];

  options = {};

  @Output() backClicked = new EventEmitter();
  constructor(private wrs: WindowResizeService, private browserCompatibilityService: BrowserCompatibilityService,
    private cdr: ChangeDetectorRef) {
    if (window.matchMedia) {
      const print = window.matchMedia('print');
      const me = this;
      print.addListener(function (param) {
        if (param.matches) {
          me.afterPrint();
        }
      });
    }

    window.addEventListener('afterprint', this.afterPrint.bind(this));  // IE, EDGE
    window.addEventListener('beforeprint', this.beforePrint.bind(this))

  }

  beforePrint() {
    this.match.beforePrint();
  }

  afterPrint() {
    this.match.afterPrint();
    this.cdr.detectChanges();

    if (this.browserCompatibilityService.isEdge) {
      jQuery('.report-container').removeClass('edge_print');
      this.cdr.detectChanges();
    }
    if (window.innerWidth > 600) {
      setTimeout((me) => {
        this.wrs.resizeWindow(true);
      }, 1000, this);
    } else {
      this.wrs.resizeWindow(true);
    }
    setTimeout((me) => {
      me.wrs.resizeWindow(true);
    }, 0, this);



  }


  ngOnInit() {
    document.body.scrollTop = 0;
    jQuery('app-tab-bar').addClass('hide');
    jQuery('app-header').addClass('hide');
  }

  ngOnDestroy() {
    jQuery('app-tab-bar').removeClass('hide');
    jQuery('app-header').removeClass('hide');
    document.body.classList.remove('report-open');

  }

  setClassForResize(question, index) {
    let classList = '';
    if (index === 0) {
      classList += 'first';
    }
    if (question.type === 5 && question.backgroundImage !== undefined || question.type === 6) {
      classList += 'handle-resize';
    }
    return classList;
  }
  setIconClass(question) {
    if (!question.attempted) {
      return 'icon-skipped';
    }
    if (question.responseType === responseType.CORRECT) {
      return 'icon-check';
    } else if (question.responseType === responseType.INCORRECT) {
      return 'icon-check-cross';
    } else {
      return 'icon-partial-correct';
    }
  }

  setFeedbackClass(question, index) {
    let classList = '';
    if (question.responseType === responseType.CORRECT) {
      classList += 'correct';
    } else if (question.responseType === responseType.INCORRECT) {
      classList += 'incorrect';
    } else {
      classList += 'partially-correct';
    }
    if (!this.showCorrectAnswer[index]) {
      classList += ' hide-feedback';
    }
    return classList;
  }
  downloadReport() {
    if (!this.browserCompatibilityService.isEdge) {
      document.body.style.position = 'initial';

    } else {
      jQuery('.report-container').addClass('edge_print');
      this.cdr.detectChanges();
      this.wrs.resizeWindow(true);
    }
    setTimeout(() => {
      (window as any).print();
    }, 100);
  }



  checkIfCorrect(question) {
    if (question.responseType === responseType.CORRECT) {
      return true;
    } else {
      return false;
    }
  }

  getChartData() {
    this.chartData = [];
    for (let i = 0; i < this.colors.length; i++) {
      this.chartData[i] = {};
      this.chartData[i].colorCode = this.colors[i].code;
    }
    for (let i = 0; i < this.barDataCounter.length; i++) {
      this.chartData[i].barDataCounter = this.barDataCounter[i];
    }
    for (let i = 0; i < this.xAxisLabels.length; i++) {
      this.chartData[i].xAxisLabels = this.xAxisLabels[i];
    }
  }

}

