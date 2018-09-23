import { Observable, Subject } from 'rxjs/Rx';
import { QUANTITY } from './../dnd-base/dnd-base';
import { questionType } from './../question/question.component';
import { QuestionDataModel, responseType } from './../question/question.model';

export class SelectModel extends QuestionDataModel {

  select: Array<string>;
  correctAnswer: Array<number>;
  selectStatement: string;
  studentResponse: Array<number>;
  submited = false;
  responseType = responseType.NOT_ATTEMPTED;
  feedbackJson;
  userActions: Observable<EVENTTYPE>;
  userActionSubject: Subject<EVENTTYPE>;
  feedbackObj: Array<object>;
  specificFeedback: boolean;
  showCorrectAnswer: boolean;
  checkCorrectAnswer: Array<number> = [];
  interacted = false;
  constructor(data: any) {
    super(data);
    this.question = data.question;
    this.select = data.select;
    this.correctAnswer = data.correctAnswer;
    this.selectStatement = data.selectStatement;
    this.noOfTrials = data.noOfTrials ? parseInt(data.noOfTrials, 0) : 1;
    this.attempted = data.attempted ? data.attempted : false;
    this.userActionSubject = new Subject<EVENTTYPE>();
    this.userActions = this.userActionSubject.asObservable();
    this.allowRetrial = data.allowRetrial ? data.allowRetrial : false;
    this.feedbackObj = data.feedbackObj;
    this.specificFeedback = data.specificFeedback ? data.specificFeedback : false;
    this.resetData();
  }


  submit() {
    this.submited = true;
    this.interacted = false;
    this.checkCorrectAnswer = [];
    for (let i = 0; i < this.correctAnswer.length; i++) {
      this.checkCorrectAnswer.push(responseType.INCORRECT);
      if (this.correctAnswer[i] === this.studentResponse[i]) {
        this.checkCorrectAnswer[i] = responseType.CORRECT;
      }
    }


    (this.checkCorrectAnswer.filter((fType) => { return fType === responseType.CORRECT }).length === 0) ?
     (this.responseType = responseType.INCORRECT)
      : ((this.checkCorrectAnswer.filter((fType) => { return fType === responseType.CORRECT }).length === this.correctAnswer.length) ?
        (this.responseType = responseType.CORRECT) : (this.responseType = responseType.PARTIALLY_CORRECT));

    if (!this.specificFeedback) {
      if (this.allowRetrial) {
        this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials][this.strResponseType[this.responseType - 1]];
      } else {
        this.feedback = this.feedbackObj[this.strResponseType[this.responseType - 1]];
      }
    }

    if (this.allowRetrial) {
      this.noOfTrials--;
    }

    this.userActionSubject.next(EVENTTYPE.STUDENT_RESPONSE);
  }

  onClick() {
    this.showCorrectAnswer ? this.userActionSubject.next(EVENTTYPE.CORRECT_ANSWER) :
     this.userActionSubject.next(EVENTTYPE.STUDENT_RESPONSE);
    this.showCorrectAnswer = !this.showCorrectAnswer;
  }

  selected(expectedSelectedcount?: number, quantity?: QUANTITY) {

    if (!expectedSelectedcount) {
      expectedSelectedcount = this.select.length;
    }
    if (!quantity) {
      quantity = QUANTITY.EXACT;
    }

    const actualSelected = this.studentResponse.filter((selectedIndex) => {
      return selectedIndex !== 0;
    }).length;

    if ((quantity === QUANTITY.EXACT && expectedSelectedcount === actualSelected) ||
      (quantity === QUANTITY.LESS_THAN && actualSelected < expectedSelectedcount) ||
      (quantity === QUANTITY.GREATER_THEN && actualSelected > expectedSelectedcount) ||
      (quantity === QUANTITY.AT_LEAST && actualSelected >= expectedSelectedcount) ||
      (quantity === QUANTITY.AT_MOST && actualSelected <= expectedSelectedcount)) {
      return true;
    }

    return false;
  }

  resetData() {
    this.interacted = false;
    if (!this.submited || (this.allowRetrial && this.noOfTrials > 0)) {
      this.submited = false;
      this.attempted = false;
      this.showCorrectAnswer = true;
      this.responseType = responseType.NOT_ATTEMPTED;
      this.studentResponse = [];
      for (let i = 0; i < this.select.length; i++) {
        this.studentResponse.push(0);
      }
      this.userActionSubject.next(EVENTTYPE.RESET);
    }
  }
}


export enum EVENTTYPE {
  RESET = 0,
  STUDENT_RESPONSE = 1,
  CORRECT_ANSWER = 2
}


