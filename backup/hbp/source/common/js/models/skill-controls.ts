import * as Backbone from "backbone";
import * as Handlebars from "handlebars";
import * as _ from "underscore";

enum eStates {
    NORMAL,
    MINIMIZED
}

enum eTypes {
    ASSESSMENT,
    TRAINING
}

enum eModes {
    NORMAL,
    HINT
}

export interface QuestionData {
    [id: string]: string;
}

export class SkillController extends Backbone.Model {
    public static eStates = eStates;
    public static eTypes = eTypes;
    public static eModes = eModes;

    get currentQuestion(): number { return (this.get("currentQuestion")); }
    set currentQuestion(value: number) {
        if (value > this.dataJSONs.length || value < 0) {
            console.warn("Invalid currentQuestion was set!");
            return;
        }
        this.set("currentQuestion", value);
    }

    get questions(): string[] { return (this.get("questions")); }
    set questions(value: string[]) { this.set("questions", value); }

    get questionData(): QuestionData { return (this.get("questionData")); }
    set questionData(value: QuestionData) { this.set("questionData", value); }

    get dataJSONs(): string[] { return (this.get("dataJSONs")); }
    set dataJSONs(value: string[]) { this.set("dataJSONs", value); }

    get state(): eStates { return (this.get("state")); }
    set state(value: eStates) { this.set("state", value); }

    get type(): eTypes { return (this.get("type")); }
    set type(value: eTypes) { this.set("type", value); }

    get mode(): eModes { return (this.get("mode")); }
    set mode(value: eModes) { this.set("mode", value); }

    get hasHintBtn(): boolean { return (this.get("hasHintBtn")); }
    set hasHintBtn(value: boolean) { this.set("hasHintBtn", value); }

    get showQuestionCounters(): boolean { return (this.get("showQuestionCounters")); }
    set showQuestionCounters(value: boolean) { this.set("showQuestionCounters", value); }

    constructor(attr?: any) {
        super(attr);
        this.onTypeChange();
        this.listenTo(this, "change:type", this.onTypeChange);
    }

    public defaults() {
        return {
            currentQuestion: 0,
            dataJSONs: [] as string[],
            hasHintBtn: true,
            showQuestionCounters: true,
            questions: [""],
            questionData: {},
            mode: eModes.NORMAL,
            state: eStates.NORMAL,
            type: eTypes.ASSESSMENT
        };
    }

    /**
     * Returns current question text from given offset.
     * @param offset offset by which question will be given.
     */
    public getCurrentQuestion(offset = 0) {
        return this.questions[this.currentQuestion + offset];
    }

    /**
     * Returns current data json from given offset.
     * @param offset offset by which question will be given.
     */
    public getCurrentDataJSON(offset = 0) {
        return this.dataJSONs[this.currentQuestion + offset];
    }

    /**
     * Sets current question text with given text.
     * @param question any string.
     */
    public setCurrentQuestion(question: string) {
        return this.questions[this.currentQuestion] = question;
    }

    /**
     * Sets question for given index.
     * @param dataJson Index for question.
     * @param title The question text.
     */
    public setQuestionData(dataJson: string, title: string) {
        return this.questionData[dataJson] = title;
    }

    /**
     * Retrusn question text by given index.
     * @param dataJson Index for question.
     */
    public getQuestionData(dataJson: string) {
        return this.questionData[dataJson];
    }

    /**
     * Handler for self's type-changed event.
     * show / hides hint button and question counters accordingly.
     */
    private onTypeChange() {
        switch (this.type) {
            case eTypes.ASSESSMENT:
                this.showQuestionCounters = false;
                this.hasHintBtn = false;
                break;
            case eTypes.TRAINING:
                this.showQuestionCounters = true;
                this.hasHintBtn = true;
                break;
            default:
                console.warn("WARNING! wrong type was set", this.type);
        }
    }
}