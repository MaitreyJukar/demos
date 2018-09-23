import { QuestionMode } from '../video-player/video-player.component';
import { questionType } from './question.component';
export class QuestionDataModel {

    text: string;

    imageUrl: string;

    videoUrl: string;

    correctOption: number;

    isSingleSelect: boolean;

    submited: boolean = false;

    type: questionType;

    isGradable;

    feedback: string;

    attempted: boolean = false;

    question;

    questionMode: QuestionMode;

    responseType;

    strResponseType: Array<string>;

    noOfTrials: number = 1;

    allowRetrial: boolean = false;

    hotspotcoords: any;
    interacted: boolean;

    constructor(data) {
        this.text = data.text;
        this.imageUrl = data.imageUrl;
        this.videoUrl = data.videoUrl;
        this.correctOption = data.correctOption;
        this.isSingleSelect = data.isSingleSelect;
        this.question = data;
        this.isGradable = data.isGradable ? data.isGradable === 'true' : true;
        this.questionMode = parseInt(data.questionMode, 0);
        if (data.feedback) {
            this.feedback = data.feedback;
        }
        this.strResponseType = ['correct', 'inCorrect', 'partiallyCorrect'];
        this.hotspotcoords = data['hotspotcoords'];
    }
    submit() {
        return;
    }
    resetData() {
        return;
    }

}

export enum responseType {
    CORRECT = 1,
    INCORRECT = 2,
    PARTIALLY_CORRECT = 3,
    NOT_ATTEMPTED = 4
}





