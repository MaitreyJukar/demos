import { questionType } from './../question/question.component'
import { QuestionDataModel, responseType } from './../question/question.model';

export class MRQModel extends QuestionDataModel {

    options: Array<string>;
    selected: Array<number>;
    feedback: string;
    submited: boolean = false;
    question;
    arrCorrectOption: Array<number>;
    columnHeader: boolean = false;
    columns;
    feedbackObj;
    submitFeedback: string;


    constructor(data) {
        super(data.question);
        this.type = questionType.MRQ;
        this.question = data.question;
        this.arrCorrectOption = data.question.arrCorrectOption;
        this.selected = data.selected;
        if (data.submited) {
            this.submited = data.submited;
        }
        if (data.attempted) {
            this.attempted = data.attempted;
        }
        if (data.feedback) {
            this.feedback = data.feedback;
        }
        if (data.columnHeader) {
            this.columnHeader = data.columnHeader;
            this.columns = data.columns;
        } else {
            this.options = data.options;
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
    isCorrect(option: number): boolean { // check individual option is correct?
        if (this.arrCorrectOption.indexOf(option) !== -1) {
            return true;
        } else {
            return false;
        }
    }
    submit() { // check overall
        this.submited = true;
        const selectedLength = this.selected.length;
        if (selectedLength) {
            const correctOptionsLength = this.arrCorrectOption.length;
            if (selectedLength === correctOptionsLength
                && this.selected.every((v, i) =>
                    v === this.arrCorrectOption[i])) {
                if (this.allowRetrial) {
                    this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['correct'];
                } else {
                    this.feedback = this.feedbackObj['correct'];
                }
                this.responseType = responseType.CORRECT;
            } else if (this.selected.some(r => this.arrCorrectOption.indexOf(r) >= 0)) {
                if (this.allowRetrial) {
                    this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['partiallyCorrect'];
                } else {
                    this.feedback = this.feedbackObj['partiallyCorrect'];
                }
                this.responseType = responseType.PARTIALLY_CORRECT
            } else {
                if (this.allowRetrial) {
                    this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['inCorrect'];
                } else {
                    this.feedback = this.feedbackObj['inCorrect'];
                }
                this.responseType = responseType.INCORRECT;
            }
        } else {
            if (this.allowRetrial) {
                this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['inCorrect'];
            } else {
                this.feedback = this.feedbackObj['inCorrect'];
            }
        }
        if (this.allowRetrial) {
            this.noOfTrials--;
        }
        this.createSubmitFeedbackText();
    }
    resetData() {
        if (!this.submited || (this.allowRetrial && this.noOfTrials > 0)) {
            this.selected = [];
            this.attempted = false;
            this.submitFeedback = '';
            if (this.allowRetrial) {
                this.submited = false;
            }
        }

    }
    createSubmitFeedbackText() {
        let feedback = '';
        for (let i = 0; i < this.selected.length; i++) {
            feedback += 'option ';
            if (this.columnHeader) {
                if (this.selected[i] >= this.columns[0].options.length) {
                    feedback += this.columns[1].options[this.selected[i] - this.columns[0].options.length].option;
                } else {
                    feedback += this.columns[0].options[this.selected[i]].option;
                }
            } else {
                feedback += this.options[this.selected[i]];

            }
            feedback += ' is ';
            if (this.arrCorrectOption.indexOf(this.selected[i]) !== -1) {
                feedback += 'correct '
            } else {
                feedback += 'not correct ';
            }
        }
        if (this.noOfTrials === 0) {
            feedback += this.feedback;
        }
        this.submitFeedback = feedback;
    }
}
