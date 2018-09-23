import * as Backbone from "backbone";
import * as Handlebars from "handlebars";
import * as _ from "underscore";

import "./../../css/skill-controls-top.css";

import * as SkillCtrlPkcg from "./../models/skill-controls";
import { Utilities } from "../utilities";

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

export interface QuestionChangedData {
    event?: JQuery.Event;
    skillCtrl: SkillControllerTop;
    newQuestion: string;
    newDataJson: string;
    newQuestionCounter: number;
}

/**
 * SkillController view class for top aligned controller.
 * @class SkillControllerTop
 */
export class SkillControllerTop extends Backbone.View<SkillCtrlPkcg.SkillController> {
    public static HINT_CLASSES = ["has-hint", "no-hint"];
    public static COUNTER_STATE_CLASSES = ["show-counters", "hide-counters"];
    public static DISPLAY_HINT_CLASSES = ["inactive-hint", "active-hint"];
    public static HINT_ICON_CLASSES = ["icon-hint-off", "icon-hint-on"];

    public model: SkillCtrlPkcg.SkillController;
    public template: HandlebarsTpl;

    constructor(attr: Backbone.ViewOptions<SkillCtrlPkcg.SkillController> = {}) {
        if (attr.model === void 0) {
            attr.model = new SkillCtrlPkcg.SkillController();
        }
        if (attr.el === void 0) {
            console.warn("WARNING! el attributes must be provided from attributes for this class to work, else use 'SkillControllerBottom' class to automatically construct its el");
        }
        super(attr);
        this.template = require("./../../tpl/skill-controls-top.hbs");
        this.render();
        this.attachModelEvents();
    }

    attachModelEvents() {
        this.listenTo(this.model, "change:question", this.renderCurrentQuestion);
        this.listenTo(this.model, "change:currentQuestion", this.renderCounters);
        this.listenTo(this.model, "change:dataJSONs", this.renderCounters);
        this.listenTo(this.model, "change:hasHintBtn", this.renderHintState);
        this.listenTo(this.model, "change:showQuestionCounters", this.renderCounterState);
        this.listenTo(this.model, "change:mode", this.renderMode);
    }

    /**
     * Events for current view.
     */
    events() {
        return {
            "click .hint-holder": "onHintHolderClicked",
            "click .help-holder": "onHelpHolderClicked",
            "click .replay-holder": "onReplayHolderClicked",
            "click .icon-arrow-left": "onLeftNavBtnClicked",
            "click .icon-arrow-right": "onRightNavBtnClicked"
        };
    }

    /**
     * Applies template and renders all model values.
     */
    render() {
        const tplObj = {
            currentQuestion: this.model.currentQuestion + 1,
            totalQuestions: this.model.dataJSONs.length,
            questionText: this.model.getCurrentQuestion(),
            hintCls: (this.model.hasHintBtn) ? SkillControllerTop.HINT_CLASSES[0] : SkillControllerTop.HINT_CLASSES[1]
        };
        this.$el.addClass("skill-controls-top");
        this.$el.append(this.template(tplObj));
        this.renderCurrentQuestion()
            .renderHintState()
            .renderCounterState()
            .renderMode()
            .renderCounters();
        return this;
    }

    /**
     * Resets question text according to model.
     */
    renderCurrentQuestion() {
        this.$(".iframe-title").html(this.model.getCurrentQuestion());
        return this;
    }

    /**
     * Adds/Removes hint class from element.
     */
    renderHintState() {
        this.$el.removeClass(SkillControllerTop.HINT_CLASSES.join(" "));
        this.$el.addClass((this.model.hasHintBtn) ? SkillControllerTop.HINT_CLASSES[0] : SkillControllerTop.HINT_CLASSES[1]);
        return this;
    }

    /**
     * Renders counters according to model and enable/disables next previous button.
     */
    renderCounters() {
        const $leftBtn = this.$("button.icon-arrow-left") as JQuery<HTMLButtonElement>;
        const $rightBtn = this.$("button.icon-arrow-right") as JQuery<HTMLButtonElement>;

        this.$(".counters-holder").html((this.model.currentQuestion + 1) + " of " + this.model.dataJSONs.length);
        if (this.model.currentQuestion <= 0) {
            Utilities.disableBtn($leftBtn);
        } else {
            Utilities.enableBtn($leftBtn);
        }
        if ((this.model.currentQuestion + 1) >= this.model.dataJSONs.length) {
            Utilities.disableBtn($rightBtn);
        } else {
            Utilities.enableBtn($rightBtn);
        }
        return this;
    }

    renderMode() {
        this.$(".hint-holder").removeClass(SkillControllerTop.DISPLAY_HINT_CLASSES.join(" "))
            .addClass(SkillControllerTop.DISPLAY_HINT_CLASSES[this.model.mode]);
        this.$(".hint-holder i").removeClass(SkillControllerTop.HINT_ICON_CLASSES.join(" "))
            .addClass(SkillControllerTop.HINT_ICON_CLASSES[this.model.mode]);
        return this;
    }

    /**
     * Adds / Removes counter's state class from main element.
     */
    renderCounterState() {
        this.$el.removeClass(SkillControllerTop.COUNTER_STATE_CLASSES.join(" "));
        this.$el.addClass((this.model.showQuestionCounters) ? SkillControllerTop.COUNTER_STATE_CLASSES[0] : SkillControllerTop.COUNTER_STATE_CLASSES[1]);
        return this;
    }

    /**
     * Handler for hint clicked event.
     * Triggers 'hint-clicked' custom event.
     * @param event jQuery Event object.
     */
    private onHintHolderClicked(event: JQuery.Event) {
        this.trigger("hint-clicked", event, this);
    }
    
    /**
     * Handler for hint clicked event.
     * Triggers 'hint-clicked' custom event.
     * @param event jQuery Event object.
     */
    private onHelpHolderClicked(event: JQuery.Event) {
        this.trigger("help-clicked", event, this);
    }

    /**
     * Handler for replay clicked event.
     * Triggers 'replay-clicked' custom event.
     * @param event jQuery Event object.
     */
    private onReplayHolderClicked(event: JQuery.Event) {
        this.trigger("retry-clicked", event, this);
    }

    /**
     * Handler for left navigation button's clicked event.
     * @param event jQuery Event object.
     */
    private onLeftNavBtnClicked(event: JQuery.Event) {
        this.gotoQuestion(-1, event);
    }

    /**
     * Handler for left navigation button's clicked event.
     * @param event jQuery Event object.
     */
    private onRightNavBtnClicked(event: JQuery.Event) {
        this.gotoQuestion(1, event);
    }

    /**
     * Triggers 'question-changed' custom event with previous question and data json parameters.
     * By default param goes to next question.
     * @param questionOffset offset by which question to be set, default 1 (Goes to next Question).
     * @param event jQuery Event object, Optional.
     */
    public gotoQuestion(questionOffset = 1, event?: JQuery.Event) {
        const dataObj: QuestionChangedData = {
            event,
            skillCtrl: this,
            newQuestion: this.model.getCurrentQuestion(questionOffset),
            newDataJson: this.model.getCurrentDataJSON(questionOffset),
            newQuestionCounter: this.model.currentQuestion + questionOffset
        };
        this.trigger("question-changed", dataObj);
    }
}