import { CardFlipModel } from '../card-flip/card-flip.model';
import { QuestionDataModel } from './../question/question.model';

export class CardsMCQModel extends QuestionDataModel {

    options: Array<CardFlipModel> = [];     // array of available options for mcq question

    /**
     * constructor - set variables using json data or user response data
     * @param   data - json data or user data for this model
     */
    constructor(data) {
        super(data.question);
        for (let i = 0; i < data.options.length; i++) {
            this.options.push(new CardFlipModel(data.options[i]));
        }
        this.options = data.options;
    }

}
