import { questionType } from './../question/question.component'
import { QuestionDataModel, responseType } from './../question/question.model';

export class MatchModel extends QuestionDataModel {
    leftData;
    rightData;
    doneClicked: boolean = false;
    selected: number;
    feedback: string;
    submited: boolean = false;
    studentResponse: Array<Object> = new Array<Object>();
    arrCorrectOption: Array<string>;
    correctAnswerCount: number = 0;
    incorrectAnswerCount: number = -1;
    question;
    feedbackObj;

    constructor(data) {
        super(data.question);
        this.type = questionType.MATCHING;
        this.question = data.question;
        this.leftData = data.leftData;
        this.rightData = data.rightData;
        this.selected = data.selected;
        this.arrCorrectOption = data.question.arrCorrectOption;
        if (data.submited) {
            this.submited = data.submited;
        }
        if (data.attempted) {
            this.attempted = data.attempted;
        }
        if (data.feedback) {
            this.feedback = data.feedback;
        }
        if (data.studentResponse) {
            this.studentResponse = data.studentResponse;
        }
        if (data.responseType) {
            this.responseType = data.responseType;
        }
        if (data.allowRetrial) {
            this.allowRetrial = data.allowRetrial;
        }
        if (data.noOfTrials) {
            this.noOfTrials = data.noOfTrials;
        }

        this.feedbackObj = data.feedbackObj;
    }

    submit() {
        this.submited = true;
        this.calculateAnswers();
        let count = 0;
        for (let i = 0; i < this.arrCorrectOption.length; i++) {
            for (const obj of this.arrCorrectOption[i]) {
                count++;
            }
        }
        if (this.correctAnswerCount > 0 && this.incorrectAnswerCount === -1 && this.correctAnswerCount === count) {
            this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['correct'];
            this.responseType = responseType.CORRECT;
        } else if (this.correctAnswerCount === 0) {
            this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['inCorrect'];
            this.responseType = responseType.INCORRECT;
        } else {
            this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['partiallyCorrect'];
            this.responseType = responseType.PARTIALLY_CORRECT;
        }
        if (this.allowRetrial) {
            this.noOfTrials--;
        }
    }
    calculateAnswers() {
        if (this.studentResponse !== null) {
            for (const studentResponseItem of this.studentResponse) {
                for (const answerStatus of studentResponseItem['validatedArray']) {
                    if (answerStatus === false) {
                        if (this.incorrectAnswerCount === -1) {
                            this.incorrectAnswerCount = 0;
                        }
                        this.incorrectAnswerCount++;
                    }
                    if (answerStatus === true) {
                        this.correctAnswerCount++;
                    }
                }
            }
        }
    }
    resetData() {
        this.selected = -1;
        this.attempted = false;
        this.studentResponse = null;
        this.correctAnswerCount = 0;
        this.incorrectAnswerCount = -1;
        if (this.allowRetrial) {
            this.submited = false;
        }

    }
}
