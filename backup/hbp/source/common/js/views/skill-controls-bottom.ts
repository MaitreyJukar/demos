import * as Backbone from "backbone";
import * as Handlebars from "handlebars";
import * as _ from "underscore";
import "./../../css/skill-controls-bottom.css";

import * as SkillCtrlPkcg from "./../models/skill-controls";

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

/**
 * SkillController view class for bottom aligned controller.
 * @class SkillControllerBottom
 */
export class SkillControllerBottom extends Backbone.View<SkillCtrlPkcg.SkillController> {
    public static STATE_CLASSES = ["normal", "minimize"];
    public static HINT_CLASSES = ["has-hint", "no-hint"];

    public model: SkillCtrlPkcg.SkillController;
    public template: HandlebarsTpl;

    constructor(attr: Backbone.ViewOptions<SkillCtrlPkcg.SkillController> = {}) {
        if (attr.model === void 0) {
            attr.model = new SkillCtrlPkcg.SkillController();
        }
        super(attr);
        this.template = require("./../../tpl/skill-controls-bottom.hbs");
        this.render();
        this.attachModelEvents();
    }

    attachModelEvents() {
        this.listenTo(this.model, "change:currentQuestion", this.renderCurrentQuestion);
        this.listenTo(this.model, "change:currentQuestion", this.renderCounters);
        this.listenTo(this.model, "change:state", this.renderState);
        this.listenTo(this.model, "change:hasHintBtn", this.renderHintState);
    }

    /**
     * Events for current view.
     */
    events() {
        return {
            "click .hint-holder": "onHintHolderClicked"
        };
    }

    render() {
        const tplObj = {
            currentQuestion: this.model.currentQuestion + 1,
            totalQuestions: this.model.dataJSONs.length,
            questionText: this.model.getCurrentQuestion(),
            hintCls: (this.model.hasHintBtn) ? SkillControllerBottom.HINT_CLASSES[0] : SkillControllerBottom.HINT_CLASSES[1]
        };
        this.$el.html(this.template(tplObj));
        this.renderCurrentQuestion()
            .renderState()
            .renderHintState()
            .renderCounters();
        return this;
    }

    renderCurrentQuestion() {
        this.$(".question-holder").html(this.model.getCurrentQuestion());
        return this;
    }

    renderState() {
        this.$(".skill-controls-main").removeClass(SkillControllerBottom.STATE_CLASSES.join(" "));
        this.$(".skill-controls-main").addClass(SkillControllerBottom.STATE_CLASSES[this.model.state]);
        return this;
    }

    renderHintState() {
        this.$(".skill-controls-main").removeClass(SkillControllerBottom.HINT_CLASSES.join(" "));
        this.$(".skill-controls-main").addClass((this.model.hasHintBtn) ? SkillControllerBottom.HINT_CLASSES[0] : SkillControllerBottom.HINT_CLASSES[1]);
        return this;
    }

    renderCounters() {
        this.$(".counters-holder").html((this.model.currentQuestion + 1) + " of " + this.model.dataJSONs.length);
        return this;
    }

    private onHintHolderClicked(event: JQuery.Event) {
        this.trigger("hint-clicked", event, this);
    }
}