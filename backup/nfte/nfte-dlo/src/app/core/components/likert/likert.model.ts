import { questionType } from './../question/question.component'
import { QuestionDataModel } from './../question/question.model';

export class LikertModel extends QuestionDataModel {

    options: Array<Object>;     // array of available options for Likert question
    selected: number; // currently selected option
    submited: boolean = false; // boolean representing whether question is submited or not
    desc: string;
    /**
     * constructor - set variables using json data or user response data
     * @param   data - json data or user data for this model
     */
    constructor(data) {
        super(data.question);
        this.type = questionType.LIKERT;
        this.options = data.options;
        this.correctOption = Number(this.correctOption);
        this.selected = data.selected;
        this.desc = data.desc;
        if (data.submited) {
            this.submited = data.submited;
        }
        if (data.attempted) {
            this.attempted = data.attempted;
        }

    }


    /**
     * submit this question
     */
    submit() {
        this.submited = true;
    }

    /**
     * reset user response
     */
    resetData() {
        this.selected = -1;
        this.attempted = false;
    }
}
