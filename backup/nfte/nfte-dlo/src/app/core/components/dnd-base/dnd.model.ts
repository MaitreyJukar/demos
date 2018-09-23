import { questionType } from './../question/question.component';
import { QuestionDataModel, responseType } from './../question/question.model';

export class DNDModel extends QuestionDataModel {

    type: number = questionType.DRAGDROP;
    options: Array<Object>;
    groups: Array<Object>;
    studentResponse: Array<Object> = null;
    feedback: string;
    singledrop: boolean = false;
    backgroundImage: Array<string>;
    answeredOptions: Array<any> = new Array<any>();
    question: string;
    correctAnswerCount: number = 0;
    incorrectAnswerCount: number = 0;
    arrCorrectOption: Array<any>;
    feedbackObj;
    specificFeedback: boolean = false;
    inline: boolean = false;
    tilesWithinImage: boolean;
    inlineText: string;
    isClone: boolean;
    maxDroppables: number;
    checkAllDropped: boolean = false;
    interacted: boolean = false;
    timeline: TimeLineActivity;
    constructor(data) {
        super(data.question);
        this.question = data.question;
        this.options = data.options;
        this.groups = data.groups;
        this.singledrop = data.singledrop;
        this.backgroundImage = data.backgroundImage;
        this.arrCorrectOption = data.question.arrCorrectOption;
        this.isClone = data.isClone;
        if (data.maxDroppables) {
            this.maxDroppables = data.maxDroppables;
        }

        for (let i = 0; i < this.options.length; i++) {
            if (this.isClone) {
                this.answeredOptions[i] = new Array(this.groups.length).fill(false);
                for (let j = 0; j < this.answeredOptions[i].length; j++) {
                    if (this.arrCorrectOption[i][j] === -1) {
                        this.answeredOptions[i][j] = true;
                    }
                }
            } else {
                this.answeredOptions[i] = false;
                if (this.arrCorrectOption[i] === -1) {
                    this.answeredOptions[i] = true;
                }
            }
        }
        if (data.answeredOptions) {
            if (data.answeredOptions.length !== 0) {
                this.answeredOptions = data.answeredOptions;
            }
        }
        this.tilesWithinImage = data.tilesWithinImage;
        if (data.specificFeedback) {
            this.specificFeedback = data.specificFeedback;
        }
        if (data.submited) {
            this.submited = data.submited;
        }
        if (data.studentResponse) {
            this.studentResponse = data.studentResponse;
        }
        if (data.attempted) {
            this.attempted = data.attempted;
        }
        if (data.feedback) {
            this.feedback = data.feedback;
        }
        if (data.inline) {
            this.inline = data.inline;
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
        if (data.inline) {
            this.inlineText = data.inlineText;
        }
        if (data.checkAllDropped) {
            this.checkAllDropped = data.checkAllDropped;
        }

        if (data.timeline) {
            this.timeline = new TimeLineActivity(data.timeline);
        }

        this.feedbackObj = data.feedbackObj;

    }
    submit() {
        this.submited = true;
        this.interacted = false;
        this.calculateAnswers();
        if (this.studentResponse === null) {
            this.studentResponse = [];
        }
        if (this.correctAnswerCount > 0 && this.incorrectAnswerCount === 0) {
            if (!this.specificFeedback) {
                if (this.allowRetrial) {
                    this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['correct'];
                } else {
                    this.feedback = this.feedbackObj['correct'];
                }
            }
            this.responseType = responseType.CORRECT;
        } else if (this.correctAnswerCount > 0 && this.incorrectAnswerCount > 0) {
            if (!this.specificFeedback) {
                if (this.allowRetrial) {
                    this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['partiallyCorrect'];
                } else {
                    this.feedback = this.feedbackObj['partiallyCorrect'];
                }
                this.responseType = responseType.PARTIALLY_CORRECT;
            } else {
                this.responseType = responseType.INCORRECT;
            }
        } else {
            if (!this.specificFeedback) {
                if (this.allowRetrial) {
                    this.feedback = this.feedbackObj[this.feedbackObj.length - this.noOfTrials]['inCorrect'];
                } else {
                    this.feedback = this.feedbackObj['inCorrect'];
                }
            }
            this.responseType = responseType.INCORRECT;
        }
        if (this.allowRetrial) {
            this.noOfTrials--;
        }

    }
    calculateAnswers() {
        for (let i = 0; i < this.answeredOptions.length; i++) {
            if (this.isClone) {
                for (let j = 0; j < this.answeredOptions[i].length; j++) {
                    if (this.answeredOptions[i][j] === false) {
                        this.incorrectAnswerCount++;
                    }
                    if (this.answeredOptions[i][j] === true && this.arrCorrectOption[i][j] !== -1) {
                        this.correctAnswerCount++;
                    }
                }
            } else {
                if (this.answeredOptions[i] === false) {
                    this.incorrectAnswerCount++;
                }
                if (this.answeredOptions[i] === true && this.arrCorrectOption[i] !== -1) {
                    this.correctAnswerCount++;
                }
            }
        }
    }
    resetData() {
        this.interacted = false;
        if (!this.submited || (this.allowRetrial && this.noOfTrials > 0)) {
            this.attempted = false;
            this.studentResponse = null;
            if (this.allowRetrial) {
                this.correctAnswerCount = 0;
                this.incorrectAnswerCount = 0;
                this.submited = false;
            }
        }
    }
}

export class TimeLineActivity {
    public tags: string[];
    public ipodTags: string[];
    constructor(timeline) {
        if (timeline.tags) {
            this.tags = timeline.tags;
        }
        if (timeline.ipodTags) {
            this.ipodTags = timeline.ipodTags;
        }
    }
}
