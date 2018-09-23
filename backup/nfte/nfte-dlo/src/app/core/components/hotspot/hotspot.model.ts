import { questionType } from './../question/question.component'
import { QuestionDataModel, responseType } from './../question/question.model';

export class HotspotModel extends QuestionDataModel {

    type: number = questionType.HOTSPOT;
    options: Array<Object>;
    groups: Array<Object>;
    feedback: string;
    imagesrc: string;
    isSingleSelect: boolean;
    userResponse: Array<number>;
    question: any;
    arrCorrectOption: Array<number>;
    backup: Array<number>;
    feedbackObj;


    constructor(data) {
        super(data.question);
        this.question = data.question;
        this.options = data.options;
        if (data.backup) {
            this.backup = data.backup;
        }
        if (data.arrCorrectOption) {
            this.arrCorrectOption = data.arrCorrectOption;
        }
        this.imagesrc = data.imagesrc;
        this.isSingleSelect = data.question.isSingleSelect;
        if (data.submited) {
            this.submited = data.submited;
        }
        if (data.userResponse) {
            this.userResponse = data.userResponse;
        }
        if (data.feedback) {
            this.feedback = data.feedback;
        }
        if (data.attempted) {
            this.attempted = data.attempted;
        }
        if (data.responseType) {
            this.responseType = data.responseType;
        }
        this.feedbackObj = data.feedbackObj;


    }
    submit() {
        this.submited = true;

        if (this.userResponse) {
            const arrOptionsSelectedLength = this.userResponse.length;
            if (arrOptionsSelectedLength) {
                const arrCorrectOptionsLength = this.question.arrCorrectOption.length;
                if (arrOptionsSelectedLength === arrCorrectOptionsLength
                    && this.userResponse.every((v, i) =>
                        v === this.question.arrCorrectOption[i])) {
                    if (this.isSingleSelect) {
                        this.feedback = this.options[this.userResponse[0]]['feedback'];
                    } else {
                        this.feedback = this.feedbackObj['correct'];
                    }
                    this.responseType = responseType.CORRECT;
                } else if (this.userResponse.some(r => this.question.arrCorrectOption.indexOf(r) >= 0)) {
                    if (this.isSingleSelect) {
                        this.feedback = this.options[this.userResponse[0]]['feedback'];
                    } else {
                        this.feedback = this.feedbackObj['partiallyCorrect'];
                    }
                    this.responseType = responseType.PARTIALLY_CORRECT;
                } else {
                    if (this.isSingleSelect) {
                        this.feedback = this.options[this.userResponse[0]]['feedback'];
                    } else {
                        this.feedback = this.feedbackObj['inCorrect'];
                    }
                    this.responseType = responseType.INCORRECT;
                }
            } else {
                if (this.isSingleSelect) {
                    this.feedback = this.options[this.userResponse[0]]['feedback'];
                } else {
                    this.feedback = this.feedbackObj['inCorrect'];
                }
                this.responseType = responseType.INCORRECT;
            }
        }
    }

    resetData() {
        this.userResponse = [];
        this.attempted = false;
    }
}
