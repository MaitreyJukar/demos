import { questionType } from './../question/question.component'
import { QuestionDataModel, responseType } from './../question/question.model';

export class MCQModel extends QuestionDataModel {

    options: Array<Object>;     // array of available options for mcq question
    selected: number; // currently selected option
    feedback: string; // feedback when question is submited
    submited: boolean = false; // boolean representing whether question is submited or not

    /**
     * constructor - set variables using json data or user response data
     * @param   data - json data or user data for this model
     */
    constructor(data) {
        super(data.question);
        this.type = questionType.MCQ;
        this.options = data.options;
        this.correctOption = Number(this.correctOption);
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
        if (data.responseType) {
            this.responseType = data.responseType;
        }

    }

    /**
     * check whether current option is correct or not
     * @param  {} selected - currently selected option
     * @returns boolean
     */
    isCorrect(selected): boolean {
        if (selected === this.correctOption) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * submit this question
     */
    submit() {
        this.submited = true;
        if (this.isCorrect(this.selected)) {
            this.responseType = responseType.CORRECT;
        } else {
            this.responseType = responseType.INCORRECT;
        }
        if (this.selected !== -1) {
            this.feedback = this.getFeedback();
        } else {
            this.feedback = '';
        }
    }

    getFeedback() {
        return this.options[this.selected]['feedback'];
    }

    /**
     * reset user response
     */
    resetData() {
        this.selected = -1;
        this.attempted = false;
    }
}
