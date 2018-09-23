import * as Backbone from "backbone";
import "./../../../common/css/bil-icons.css";
import "./../../../common/css/embed.styl";
import "./../../../common/css/learnosity.styl";
import * as SoundManager from "./../../../common/helper/sound-manager";

import * as ToolTipPkg from "./../../../common/components/tooltip/src/models/tooltip-model";
import { ToolTip } from "./../../../common/components/tooltip/src/views/tooltip-view";
import "./../css/g-6-8-player.styl";

import { Language, Utilities } from "./../../../common/helper/utilities";

const playerTemplate: (attr?: KeyValue) => string = require("./../tpl/player.hbs");
const additionalInfo: (attr?: KeyValue) => string = require("./../tpl/partials/additional-info.hbs");

const LRN_ITEM_SELECTOR = ".learnosity-item:not(.learnosity-facade-item)";
const LRN_FACADE_SELECTOR = ".learnosity-facade-item";
const LRN_ALL_SELECTOR = ".learnosity-item";

export class QuestionState {
    public validated: boolean;
    public showMe: boolean;
    public checkClicked: boolean;
}

export interface ExtWindow extends Window {
    BIL: any;
    itemsApp: any;
    MathJax: any;
    lib: any;
    ExposedFunctions: any;
}

declare const window: ExtWindow;
window.lib = window.lib || {};

declare let Desmos: any;
import { Initializer } from "../../../common/components/interfaces/initializer";
import { BasePlayerAttributes, BasePlayerModel } from "./g-6-8-player-model";

export declare class KeyValue {
    [id: string]: any;
}

const basePlayerTemplate: (attr?: KeyValue) => string = require("./../tpl/g-6-8-player.hbs");

export interface EventMap {
    "caption-changed": string;
    "ipad-play-clicked": JQuery.Event;
    "lrn-loaded-on-reset": BasePlayerView;
    "exe-lrn-ques": BasePlayerView;
    "audio-completed": BasePlayerView;
    "pause-audio": BasePlayerView;
    "current-audio-played": string;
    "show-preloader": JQuery.Event;
    "start-audio": BasePlayerView;
}

export interface CustomData {
    dataReference: string;
    subType: string;
    questionID: number;
    validate?: boolean;
    validationFn?: string;
    showAnswerFn?: string;
    keepEnabled?: boolean;
}

export class BasePlayerView extends Backbone.View<BasePlayerModel> {
    public static EVENTS = {
        CAPTION_CHANGE: "change-caption",
        LANGUAGE_CHANGE: "change-localization-language"
    };
    public customPlayers: { [id: string]: any } = {};
    public itemsApp: any;
    public className = "g-6-8-player";
    public showState = true;
    public showLanguageState = true;
    public showPlayPauseState = true;
    public currentlyPlayingAudioId: string;
    public currentlyPlayingTtsAudioId: string;
    public currentCaption: string;
    public basePlayerTemplate: (attr?: KeyValue) => string = basePlayerTemplate;
    public footerTemplate: (attr?: KeyValue) => string;
    public controlsTemplate: (attr?: KeyValue) => string;
    public questionState: QuestionState[] = [];
    public desmosData: any = [];
    public customData: CustomData[] = [];
    public learnosityItems: any;
    public languages = Language;
    public SoundManager: SoundManager.SoundManager;
    public recentReset = false;
    public tooltipModel: ToolTipPkg.ToolTip;
    public toolTipComponent: ToolTip;
    public playerTemplate: (attr?: KeyValue) => string = playerTemplate;
    public reachedTill = 0;
    public reachedLast = false;
    /**
     * cached elements declared here
     */
    public showAnswerBtn: JQuery<HTMLElement>;
    public validateBtn: JQuery<HTMLElement>;
    public continueBtn: JQuery<HTMLElement>;
    public finishBtn: JQuery<HTMLElement>;
    public infoBtn: JQuery<HTMLElement>;
    public container: JQuery<HTMLElement>;

    private _oldQuestionIndex: number;

    constructor(attr?: Backbone.ViewOptions<BasePlayerModel>) {
        super(attr);
        this.parseModelData();
        this.attachClientLoadListener();
        this.attachModelEvents();
        const soundManager: SoundManager.SoundManager = SoundManager.SoundManager.getInstance();
        this.SoundManager = soundManager;
        this.addCustomStyleOverride();
        this.addCustomScript();
        this.lazyLoadCustomComponents();
        this.exposeFunctions();
        $(window).resize(this.handleResize.bind(this));
    }

    public exposeFunctions() {
        window.ExposedFunctions = {
            enableCheck: this.enableCheckButtons.bind(this)
        };
    }

    public enableCheckButtons() {
        this.enableCheckOnChange(this.model.currentQuestionIndex);
    }

    /**
     * Handler for window's resize event.
     */
    public handleResize() {
        // Take natural height for iPad for now.
        /* if (Utilities.isTouchDevice()) {
            const height = window.innerHeight;
            this.$el.height(height - 50);
        } */
    }

    public parseModelData() {
        for (const [index, ques] of this.model.questions.entries()) {
            for (const layout of ques.layouts) {
                if (layout.multi) {
                    for (const component of layout.lcomponents.components) {
                        this.saveQuestionData(component, index);
                    }
                    for (const component of layout.rcomponents.components) {
                        this.saveQuestionData(component, index);
                    }
                } else {
                    for (const component of layout.components) {
                        this.saveQuestionData(component, index);
                    }
                }
            }
        }
    }

    public events(): Backbone.EventsHash {
        return {
            "click #finish": "onDoneButtonClick",
            "click .continue": "renderNextQuestion",
            "click .finish": "disableFinishButton",
            "click .info": "infoShow",
            "click .show-answer": "showCorrectAnswer",
            "click .validate": "validateCurrentQuestion"
        };
    }

    public attachModelEvents(): BasePlayerView {
        return this;
    }

    /**
     * Render function.
     * override in subclass
     */
    public render(): BasePlayerView {
        this.$(document).ready(() => {
            this.$(".player-wrapper").addClass("runtime");
        });
        this.model.setPlayerLocText();
        this.$(".shell-container").remove();
        this.$el.append(this.basePlayerTemplate(this.model.toJSON()));
        $(this.SoundManager).on("AUDIO_PLAYBACK_COMPLETE", ((soundId: string, event: JQuery.Event) => {
            this.audioComplete();
        }).bind(this));
        this.renderAllQuestions();
        this.showCurrentQuestion();
        this.cacheElements();
        this.setLanguage();
        if ((this.model.totalQuestions == 1) && (this.model.questions[this.model.currentQuestionIndex].validate == false)) {
            this.finishBtn.removeClass("hide");
            this.infoBtn.removeClass("hide");
        }
        this.renderTooltip();
        this.handleResize();
        return this;
    }

    public renderAllQuestions(): void {
        const $container = this.$(".player-wrapper");
        const $questionContainer = $(this.playerTemplate(this.model.toJSON()));
        $container.append($questionContainer);
        this.executeLearnosityQuestions();
    }

    public cacheElements(): void {
        this.showAnswerBtn = this.$(".show-answer");
        this.validateBtn = this.$(".validate");
        this.continueBtn = this.$(".continue");
        this.finishBtn = this.$(".finish-button-container");
        this.infoBtn = this.$(".info-button-container");
        this.container = this.$(".player-wrapper");
    }

    public showCurrentQuestion(): void {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        this.$(".player-wrapper").attr("quesid", currentQuestionIndex);
        const currentQuestion = this.model.questions[currentQuestionIndex];
        this.$("#question" + currentQuestionIndex).removeClass("hide");
        this.postTemplateRender(this.model.currentQuestionIndex);
        this.$("#question" + currentQuestionIndex + " .show-answer").addClass("hide");
        if (currentQuestionIndex == this.model.totalQuestions - 1) {
            this.$("#question" + currentQuestionIndex + " .continue").addClass("hide");
            this.$("#question" + currentQuestionIndex + " .validate").addClass("hide");
            this.$("#question" + currentQuestionIndex + " .show-answer").addClass("hide");
        }
        if (currentQuestion.validate == false) {
            this.$("#question" + currentQuestionIndex + " .validate").addClass("hide");
            this.$("#question" + currentQuestionIndex + " .show-answer").addClass("hide");
            if ((currentQuestionIndex == this.model.totalQuestions - 1) && (this.model.totalQuestions > 1)) {
                this.finishBtn.removeClass("hide");
                this.$("#question" + currentQuestionIndex + " .info-button-container").addClass("hide");
            }
        } else {
            this.$("#question" + currentQuestionIndex + " .continue").addClass("hide");
            this.$("#question" + currentQuestionIndex + " .validate").removeClass("hide").attr("disabled", "disabled");
        }
        this.bindQuestionChangeEvent();
        if (window.MathJax) {
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
        }
    }

    public isToBeValidated(custRef: string): boolean {
        for (const customData of this.customData) {
            if (customData.dataReference === custRef) {
                return !!customData.validate;
            }
        }
        return false;
    }

    public validateCurrentQuestion(event: JQuery.Event): void {
        this.targetSave();
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const isLastQuestion = (currentQuestionIndex == this.model.totalQuestions - 1) ? true : false;
        const $items = this.$el.find("#question" + currentQuestionIndex).find(LRN_ITEM_SELECTOR);
        let isValid = this._validateLrnItems($items, currentQuestionIndex);
        isValid = this._validateCustomItems() && isValid;
        isValid = this._validateLearnosityFacadeItems(currentQuestionIndex) && isValid;
        this.$("#question" + currentQuestionIndex).addClass("que-validated");
        if (isValid) {
            this.$("#question" + currentQuestionIndex + " .validate").addClass("hide");
            this.$("#question" + currentQuestionIndex + " .continue").removeClass("hide");
            for (const currItem of $items) {
                const $item = $(currItem);
                this.disableLearnosityQuestion($item);
            }
            if (isLastQuestion) {
                this.finishBtn.removeClass("hide");
                this.infoBtn.removeClass("hide");
                this.$("#question" + currentQuestionIndex + " .info-button-container").addClass("hide");
                this.$("#question" + currentQuestionIndex + " .continue").addClass("hide");
                this.scrollToDone();
            } else {
                this.$("#question" + currentQuestionIndex + " .continue").removeClass("hide").focus();
            }
        } else {
            this.$("#question" + currentQuestionIndex + " .validate").addClass("hide");
            this.$("#question" + currentQuestionIndex + " .continue").addClass("hide");
            this.$("#question" + currentQuestionIndex + " .show-answer").removeClass("hide").focus();
        }
        this.bindQuestionChangeEvent();
    }

    public _validateLearnosityFacadeItems(currentQuestionIndex: number) {
        const $items = this.$el.find("#question" + currentQuestionIndex).find(LRN_FACADE_SELECTOR);
        let isValid = true;
        for (const currItem of $items) {
            const $item = $(currItem);
            isValid = this.validateLrnFacade($item) && isValid;
        }
        return isValid;
    }

    public validateLrnFacade($item: JQuery<HTMLElement>): boolean {
        const validationFn = $item.closest(".learnosity-facade-container").attr("validation");
        return window.BIL.CustomJS[validationFn]($item, this, this.model);
    }

    public _validateCustomItems() {
        let isValid = true;
        const custRefs = this.model.getCurrCustomDataRef();
        for (const custRef of custRefs) {
            if (custRef &&
                this.customPlayers[custRef] &&
                this.isToBeValidated(custRef) &&
                typeof this.customPlayers[custRef].validate === "function") {
                isValid = this.customPlayers[custRef].validate() && isValid;
            }
        }
        return isValid;
    }

    public _validateLrnItems($items: JQuery<HTMLElement>, currentQuestionIndex: number) {
        let isValid = true;
        for (const currItem of $items) {
            const $item = $(currItem);
            const options = {
                showCorrectAnswers: true
            };
            this.validateQuestion(options, $item);
            isValid = this.isValidAnswer($item) && isValid;
        }
        return isValid;
    }

    public showCorrectAnswer(): void {
        this.targetSave();
        const currentQuestionIndex = this.model.currentQuestionIndex;
        this.showLrnCorrectAnswer(currentQuestionIndex);
        this.showCustomCorrectAnswer(currentQuestionIndex);
        this.$("#question" + currentQuestionIndex).removeClass("que-validated").addClass("que-showanswer");
        if (currentQuestionIndex != this.model.totalQuestions - 1) {
            // scroll to the bottom of the continue button
            this.scrollToContinue(currentQuestionIndex);
        } else {
            // scroll to the bottom of the finish button
            this.scrollToDone();
        }
    }

    public scrollToContinue(currentQuestionIndex: number) {
        const $currQuest = this.$("#question" + this.model.currentQuestionIndex);
        const offsetTop = $currQuest[0].offsetTop;
        const time = this.scrollingTime($currQuest, this.$("#question" + currentQuestionIndex + " .continue"));
        this.$(".player-wrapper").animate({
            scrollTop: (offsetTop + $currQuest.height() + this.$("#question" + currentQuestionIndex + " .continue").height())
        }, time);
    }

    public showCustomCorrectAnswer(currentQuestionIndex: number) {
        const custRefs = this.model.getCurrCustomDataRef();
        for (const custRef of custRefs) {
            if (custRef &&
                this.customPlayers[custRef] &&
                this.isToBeValidated(custRef) &&
                typeof this.customPlayers[custRef].showAnswer === "function") {
                this.customPlayers[custRef].showAnswer();
                this.customPlayers[custRef].disable();
                this.enableContinueOnChange(currentQuestionIndex);
            }
        }
    }

    public showLrnCorrectAnswer(currentQuestionIndex: number) {
        const $items = this.$el.find("#question" + currentQuestionIndex).find(LRN_ITEM_SELECTOR);
        // iterate on multiple learnosity items in a single question container
        for (const currItem of $items) {
            const $item = $(currItem);
            // tslint:disable-next-line:no-string-literal
            const itemsApp = window.itemsApp;
            const item = itemsApp.getItems();
            const referenceId = $item.data("reference");
            // tslint:disable-next-line:no-string-literal
            if (item[referenceId] && item[referenceId]["response_ids"]) {
                // tslint:disable-next-line:no-string-literal
                if ((item[referenceId] !== void 0) && (item[referenceId]["response_ids"] !== void 0)) {
                    // tslint:disable-next-line:no-string-literal
                    let responseIds = item[referenceId]["response_ids"];
                    responseIds = typeof responseIds === "string" ? [responseIds] : responseIds;
                    for (const response of responseIds) {
                        // TODO: Change if condition to below condition and verify
                        // itemsApp.questions()[response].checkValidation().has_validation
                        const questionResp = itemsApp.questions()[response];
                        const lrnQuestion = itemsApp.questions()[response].getQuestion();
                        const questionID = lrnQuestion.response_id;
                        const $quesItemRegion = this.$("#" + questionID);
                        this.disableQuestion();
                        if (["formulaessay", "longtext"].indexOf(lrnQuestion.type) == -1) {
                            let $correctAnswerList;
                            if (lrnQuestion.validation) {
                                const question = itemsApp.question(response);
                                question.validate({
                                    showCorrectAnswers: true
                                });
                                $correctAnswerList = $quesItemRegion.find(".lrn_correctAnswerList");
                                if (lrnQuestion.validation.valid_response.value.length <= 1) {
                                    // tslint:disable-next-line:max-line-length
                                    $correctAnswerList.find(".lrn_responseIndex").addClass("hide");
                                    $correctAnswerList.find("li").addClass("remove-left-padding");
                                    $quesItemRegion.addClass("single-answer");
                                }
                                const $incorrectQuestions = $quesItemRegion
                                    .find(this.getSelectorFromLrnDataType(lrnQuestion.type));
                                const $correctlyAnswered = this._gerCorrectlyAnsweredQuestions($quesItemRegion, lrnQuestion.type);
                                this.replaceAnswers(
                                    $correctAnswerList,
                                    $incorrectQuestions,
                                    $correctlyAnswered,
                                    questionResp,
                                    $quesItemRegion
                                );
                            }
                        }
                    }
                }
                this.enableContinueOnChange(currentQuestionIndex);
            }
        }
    }

    public scrollToDone() {
        const time = this.scrollingTime(this.$("#question" + this.model.currentQuestionIndex), this.finishBtn);
        this.$(".player-wrapper").animate({
            scrollTop: (this.$("#question" + this.model.currentQuestionIndex)[0].offsetTop +
                this.$("#question" + this.model.currentQuestionIndex).height())
        }, time);
    }

    public enableContinueOnChange(currentQuestionIndex: number) {
        if (currentQuestionIndex != this.model.totalQuestions - 1) {
            this.$("#question" + currentQuestionIndex + " .continue").removeClass("hide");
            $("button.continue").focus();
        }
        this.$("#question" + currentQuestionIndex + " .show-answer").addClass("hide");
        if (currentQuestionIndex == this.model.totalQuestions - 1) {
            this.finishBtn.removeClass("hide");
            this.finishBtn.focus();
            this.$("#question" + currentQuestionIndex + " .info-button-container").addClass("hide");
            // this.infoBtn.removeClass("hide");
        }
    }

    public getCorrectAnswers($quesItemRegion: JQuery<HTMLElement>, lrnInputType: string) {
        if ($(".lrn_combobox", $quesItemRegion).hasClass("lrn_correct")) {
            return $(".lrn_combobox.lrn_correct", $quesItemRegion);
        } else if ($(".lrn_dropzone>.lrn_draggable", $quesItemRegion).hasClass("lrn_correct")) {
            return $(".lrn_cloze_response.lrn_correct_marker .lrn_draggable", $quesItemRegion);
        }
    }

    public _gerCorrectlyAnsweredQuestions($quesItemRegion: JQuery<HTMLElement>, lrnInputType: string) {
        switch (lrnInputType) {
            case "clozedropdown":
                return $(".lrn_combobox.lrn_correct", $quesItemRegion);
            case "imageclozeassociationV2":
                return $(".lrn_imagecloze_response.lrn_correct_marker", $quesItemRegion);
            default:
                return null;
        }
    }

    public replaceCorrectAnswers($correctlyAnswered: JQuery<HTMLElement>) {
        if ($correctlyAnswered && $correctlyAnswered.length) {
            $correctlyAnswered.each((idx: number, el: HTMLElement) => {
                const $el = $(el);
                if ($el.hasClass("lrn_combobox")) {
                    const val = $el.find(".lrn_cloze_response").val() as string;
                    $el.html(val);
                } else if ($el.find(".lrn_dragdrop").length) {
                    const val = $el.find(".lrn_dropzone .lrn_item").text();
                    $(".lrn_dropzone_mask .lrn_cloze_response", $el).html(val);
                }
            });
        }
    }

    public getSelectorFromLrnDataType(lrnInputType: string) {
        let arrSelectors = [];
        switch (lrnInputType) {
            case "clozedropdown":
                arrSelectors = [".lrn_combobox.lrn_incorrect",
                    ".lrn_combobox.lrn_not_attempted"];
                break;
            case "clozeformula":
                arrSelectors = [".lrn_textinput.lrn-clozeformula-input.lrn_cloze_response:not(.lrn_correct)"];
                break;
            case "clozeassociation":
                arrSelectors = [".lrn_cloze_response.lrn_dragdrop.lrn_dropzone.lrn_not_attempted_marker.lrn_response_container",
                    ".lrn_cloze_response.lrn_dragdrop.lrn_dropzone.lrn_incorrect_marker.lrn_response_container"];
                break;
            case "imageclozeformula":
                arrSelectors = ["[data-lrn-access-review-dest].lrn_incorrect",
                    "[data-lrn-access-review-dest].lrn_not_attempted",
                    "[data-lrn-access-review-dest]:not(.lrn_correct)"];
                break;
            case "imageclozeassociationV2":
                arrSelectors = [".lrn_not_attempted_marker.lrn_imagecloze_response",
                    ".lrn_imagecloze_response:not(.lrn_correct_marker)"];
                break;
            default:
                arrSelectors = ["[data-lrn-access-review-dest].lrn_incorrect",
                    "[data-lrn-access-review-dest].lrn_not_attempted"];
        }
        return arrSelectors.join(",");
    }

    public replaceAnswers(
        $answerContainer: JQuery<HTMLElement>,
        $responses: JQuery<HTMLElement>,
        $correctlyAnswered: JQuery<HTMLElement>,
        question: any,
        $quesEl: JQuery<HTMLElement>
    ) {
        const $lrnItem = $quesEl.closest(LRN_ITEM_SELECTOR);
        if ($lrnItem.hasClass("replace-answers")) {
            const $answers = $("li", $answerContainer);
            question.resetValidationUI();
            $responses.each((idx: number, el: HTMLElement) => {
                this.replaceAnswerHTML(el, $answers, idx);
            });
            $(".lrn_correctAnswers", $lrnItem).hide();
            if (window.MathJax) {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }
            this.replaceCorrectAnswers($correctlyAnswered);
        }
    }

    public replaceAnswerHTML(el: HTMLElement, $answers: JQuery<HTMLElement>, idx: number) {
        const $ansHTML = $answers.eq(idx).find(".lrn_responseText").html();
        if ($(el).hasClass("lrn_combobox")) {
            $(el).html($ansHTML);
        } else if ($(el).find(".lrn_dragdrop").length) {
            $(".lrn_cloze_response.lrn_dragdrop.lrn_dropzone", el).html($ansHTML);
        } else {
            $(".lrn_math_editable", el).html($ansHTML);
        }
    }

    public renderNextQuestion(): void {
        this.targetSave();
        this.stopAudio();
        const currentQuestionIndex = this.model.currentQuestionIndex;
        this.$("#question" + currentQuestionIndex).addClass("finished");
        this.$("#question" + currentQuestionIndex + " .continue").addClass("hide");
        const currentQuestion = this.model.questions[currentQuestionIndex];
        if (currentQuestion.validate == false) {
            this.disableQuestion();
        }
        const questionIndex = this.model.currentQuestionIndex + 1;
        if (questionIndex < this.model.totalQuestions) {
            this.model.currentQuestionIndex++;
            this.showCurrentQuestion();
            this.setCaption();
            // scroll to the top of the question div
            const time = this.scrollingTime(this.$("#question" + this.model.currentQuestionIndex));
            this.$(".player-wrapper").animate({ scrollTop: this.$("#question" + this.model.currentQuestionIndex)[0].offsetTop }, time);
            this.playCurrentQuestionAudio();
            this.cacheElements();
        } else {
            this.finishBtn.removeClass("hide");
            this.infoBtn.removeClass("hide");
        }
        this.renderValidateButton();
    }

    public reducePlayerHeight() {
        this.$el.find(".player-wrapper").addClass("expanded");
    }

    public expandPlayerHeight() {
        this.$el.find(".player-wrapper").removeClass("expanded");
    }

    public attachClientLoadListener(): void {
        document.body.addEventListener("itemsappinit", () => {
            Utilities.logger.info("Items app initialized");
        });
        document.body.addEventListener("learnosityloaded", () => {
            Utilities.logger.info("Learnosity loaded");
            this.bindQuestionChangeEvent(this._oldQuestionIndex);
            if (this.recentReset) {
                this.recentReset = false;
                this.trigger("lrn-loaded-on-reset", this);
            }
            this.renderValidateButton();
        });
    }

    /**
     * Loads player into body for now later will be loaded into dedicated DIV (`#main-player-container`).
     */
    public loadPlayer(): BasePlayerView {
        this.render();
        return this;
    }

    /**
     * Removes player from body / dedicated DIV.
     */
    public unloadPlayer(): BasePlayerView {
        this.$el.html("");
        this.$el.remove();
        return this;
    }

    public executeLearnosityQuestions(): void {
        this.trigger("exe-lrn-ques", this);
    }

    public getTooltipContainer(): JQuery<HTMLElement> {
        let quesID = this.model.additionalInfo.quesID;
        if (quesID == null || quesID === this.model.questions.length - 1) {
            quesID = this.model.questions.length - 1;
            return this.$(`.component-wrapper[quesid=${quesID}] .info-button-container, .finish-button-container .info-button-container`);
        } else {
            return this.$(`.component-wrapper[quesid=${quesID}] .info-button-container`);
        }
    }

    public renderTooltip() {
        if (this.model.additionalInfo) {
            const $tooltipEl = this.getTooltipContainer();
            const buttonText = this.model.additionalInfo.buttonText ?
                this.model.additionalInfo.buttonText : this.model.additionalInfo.title;
            $tooltipEl.html(additionalInfo({
                title: buttonText
            }));
            this.tooltipModel = new ToolTipPkg.ToolTip(
                this.model.toJSON().additionalInfo, this.model.currentLanguage
            );
            this.toolTipComponent = new ToolTip({
                el: $tooltipEl,
                model: this.tooltipModel
            });
            this.attachTooltipEvents();
        }
    }

    public attachTooltipEvents() {
        this.listenTo(this.toolTipComponent, ToolTipPkg.EVENTS.PLAY, () => {
            this.playTooltipAudio();
        });
        this.listenTo(this.toolTipComponent, ToolTipPkg.EVENTS.PAUSE, () => {
            this.pauseTooltipAudio();
        });
        this.listenTo(this.toolTipComponent, ToolTipPkg.EVENTS.STOP, () => {
            this.stopTooltipAudio();
        });
    }

    public renderDesmosCalculator(question: any, desmosDiv: HTMLElement): void {
        let settings = question.desmosSettings && question.desmosType !== "geometry" ? question.desmosSettings : {};
        let desmos = Desmos.GraphingCalculator(desmosDiv, settings);
        $.getJSON(question.desmosURL, (resp: any) => { desmos.setState(resp.state); });
        desmos.observeEvent("change", () => {
            if (desmos.isAnyExpressionSelected) {
                Utilities.logger.info("Change occurred");
                this.$("#refresh").addClass("refreshEnabled").removeClass("refreshDisabled");
                this.$("#refresh").prop("disabled", false);
            }
        });
        if (question.desmosType == "geometry") {
            settings = question.desmosSettings ? question.desmosSettings : {};
            desmos = Desmos.Geometry(desmosDiv, settings);
        }
    }

    public getCurrentQuestionAudioID(): string {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const currentQuestionArray = this.model.questions[currentQuestionIndex];
        const langSuffix = "_" + this.model.currentLanguage;
        let audioId = currentQuestionArray.audioID;
        if (audioId) {
            audioId += langSuffix;
            this.currentlyPlayingAudioId = audioId;
        }
        return this.currentlyPlayingAudioId.replace(/_e[ns]$/, langSuffix);
    }

    public getCurrentlyPlayingAudioID(): string {
        if (this.currentlyPlayingAudioId) {
            const langSuffix = "_" + this.model.currentLanguage;
            this.currentlyPlayingAudioId = this.currentlyPlayingAudioId.replace(/_e[ns]$/, langSuffix);
        }
        return this.currentlyPlayingAudioId;
    }

    public playCurrentQuestionAudio(): void {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const currentQuestionArray = this.model.questions[currentQuestionIndex];
        const audioId = currentQuestionArray.audioID;
        if (audioId) {
            const currentAudio = this.getCurrentQuestionAudioID();
            const audioExists = this.SoundManager.resumeOrPlay(currentAudio);
            if (audioExists) {
                this.trigger("current-audio-played", currentAudio);
                this.trigger("pause-audio");
            }
        } else {
            this.trigger("audio-completed");
        }
    }

    public muteCurrentAudio(): void {
        this.SoundManager.mute(this.getCurrentlyPlayingAudioID());
    }

    public unmuteCurrentAudio(): void {
        this.SoundManager.unmute(this.getCurrentlyPlayingAudioID());
    }

    public playCurrentAudio(): void {
        const currentAudio = this.getCurrentQuestionAudioID();
        this.SoundManager.stop(this.currentlyPlayingTtsAudioId);
        const audioExists = this.SoundManager.resumeOrPlay(currentAudio);
        if (audioExists) {
            this.trigger("current-audio-played", currentAudio);
            if (this.model.additionalInfo) {
                this.toolTipComponent.trigger("render-play-icon");
            }
        }
    }

    public pauseCurrentAudio(): void {
        this.SoundManager.pause(this.getCurrentQuestionAudioID());
        this.trigger("audio-completed");
    }

    public pauseCurrentTooltipAudio(): void {
        this.SoundManager.pause(this.currentlyPlayingTtsAudioId);
        this.trigger("audio-paused");
    }

    public audioComplete(): void {
        this.trigger("audio-completed");
    }

    public playTooltipAudio(): void {
        let audioId = this.model.additionalInfo.audioID;
        if (audioId) {
            audioId += "_" + this.model.currentLanguage;
            this.pauseCurrentAudio();
            const audioExists = this.SoundManager.resumeOrPlay(audioId);
            if (audioExists) {
                this.currentlyPlayingTtsAudioId = audioId;
                this.trigger("current-audio-played", audioId);
                // this.trigger("pause-audio");
                // this.trigger(ToolTipPkg.EVENTS.TOGGLEICON);
                $(this.SoundManager).one("AUDIO_PLAYBACK_COMPLETE", ((evt: JQuery.Event, data: any) => {
                    if (data["sound-id"] == this.currentlyPlayingTtsAudioId) {
                        this.toolTipComponent.trigger("render-play-icon");
                    }
                }).bind(this));
            } else {
                $(this.SoundManager).trigger("tooltip-audio-missing");
            }
        } else {
            this.trigger("audio-completed");
        }
    }

    public pauseTooltipAudio(): void {
        this.SoundManager.pause(this.model.additionalInfo.audioID + "_" + this.model.currentLanguage);
    }

    public stopTooltipAudio(): void {
        this.SoundManager.stop(this.model.additionalInfo.audioID + "_" + this.model.currentLanguage);
    }

    public stopAudio() {
        this.SoundManager.stop(this.getCurrentlyPlayingAudioID());
    }

    public onValidateButton(): void {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const $item = this.$el.find("#question" + currentQuestionIndex).find(LRN_ITEM_SELECTOR);

        const options = {
            showCorrectAnswers: true
        };
        this.validateQuestion(options, $item);

        this.$("#validate").addClass("hide");
        this.$("#refreshCurrent").removeClass("hide");

        const isValid = this.isValidAnswer($item);
        if (isValid) {
            this.$("#next-button").prop("disabled", false);
            this.$("#show-answer").addClass("hide");
            this.$("#try-again").addClass("hide");
            this.disableQuestion();
        }
    }

    public validateQuestion(options: any, $item: JQuery<HTMLElement>): void {
        // tslint:disable-next-line:no-string-literal
        const itemsApp = window.itemsApp;
        const item = itemsApp.getItems();
        const referenceId = $item.data("reference");
        // tslint:disable-next-line:no-string-literal
        let responseIds = item[referenceId]["response_ids"];
        responseIds = typeof responseIds === "string" ? [responseIds] : responseIds;
        for (const response of responseIds) {
            const question = itemsApp.question(response);
            if (question && question.validate) {
                question.validate();
            }
        }
    }

    public isValidAnswer($container: any): boolean {
        const itemsApp = window.itemsApp;
        const currentQuestionIndex = this.model.currentQuestionIndex;
        if (itemsApp.getItems !== void 0) {
            const item = itemsApp.getItems();
            const referenceId = $container.data("reference");
            // tslint:disable-next-line:no-string-literal
            if ((item[referenceId] !== void 0) && (item[referenceId]["response_ids"] !== void 0)) {
                // tslint:disable-next-line:no-string-literal
                let responseIds = item[referenceId]["response_ids"];
                responseIds = typeof responseIds === "string" ? [responseIds] : responseIds;
                let bValid = true;
                for (const response of responseIds) {
                    const question = itemsApp.question(response);
                    if (question.checkValidation().has_validation) {
                        bValid = bValid && question.isValid();
                    }
                }
                return bValid;
            } else {
                return false;
            }
        } else {
            return false;
        }

    }

    public onShowCorrect(): void {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const $item = this.$el.find("#question" + currentQuestionIndex).find(LRN_ITEM_SELECTOR);
        // tslint:disable-next-line:no-string-literal
        const itemsApp = window.itemsApp;
        const item = itemsApp.getItems();
        const referenceId = $item.data("reference");
        // tslint:disable-next-line:no-string-literal
        if (item[referenceId] && item[referenceId]["response_ids"]) {
            // tslint:disable-next-line:no-string-literal
            const responseIds = item[referenceId]["response_ids"];
            const question = itemsApp.question(responseIds);
            question.validate({
                showCorrectAnswers: true
            });
            this.disableQuestion();
            this.$("#next-button").prop("disabled", false);
        }
    }

    public refreshAll(): void {
        this.recentReset = true;
        this.showPreloader();
        this.stopAudio();
        this.container.empty();
        this.model.currentQuestionIndex = 0;
        this.reachedTill = 0;
        this.render();
        this.$(".hide-on-start").removeClass("hide-on-start");
        this.$(".player-wrapper").removeClass("invisible").attr("quesid", 0);
    }

    public setCheckControlsState(): void {
        if (this.model.currentQuestionIndex != (this.model.totalQuestions - 1)) {
            this.$("#finish").addClass("hide");
        }
    }

    public disableValidateButton(): void {
        this.$("#finish").prop("disabled", true);
    }

    public disableQuestion(): void {
        const itemsApp = window.itemsApp;

        const item = itemsApp.getItems();
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const $items = this.$el.find("#question" + currentQuestionIndex).find(LRN_ALL_SELECTOR);
        // iterate on multiple learnosity items in a single question container
        for (const currItem of $items) {
            const $item = $(currItem);
            if (!$item.closest(".learnosity-container").hasClass("keep-enabled")) {
                this.disableLearnosityQuestion($item);
            }
        }
        this.disableCustomComponents();
    }

    public disableLearnosityQuestion($item: any): void {
        const itemsApp = window.itemsApp;

        const item = itemsApp.getItems();
        const referenceId = $item.data("reference");
        // tslint:disable-next-line:no-string-literal
        let responseIds = item[referenceId]["response_ids"];
        responseIds = typeof responseIds === "string" ? [responseIds] : responseIds;
        for (const response of responseIds) {
            itemsApp.questions()[response].disable();
        }
    }

    public disableCustomComponents() {
        const custRefs = this.model.getCurrCustomDataRef();
        for (const custRef of custRefs) {
            if (custRef && this.customPlayers[custRef] && typeof this.customPlayers[custRef].disable === "function") {
                this.customPlayers[custRef].disable();
            }
        }
    }

    public enableQuestion(): void {
        const itemsApp = window.itemsApp;

        const item = itemsApp.getItems();
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const $item = this.$el.find("#question" + currentQuestionIndex).find(LRN_ALL_SELECTOR);
        const referenceId = $item.data("reference");
        const responseIds = item[referenceId].response_ids;
        const quest = itemsApp.question(responseIds);
        if (quest.enable) {
            quest.enable();
        }
        const custRefs = this.model.getCurrCustomDataRef();
        for (const custRef of custRefs) {
            if (custRef && this.customPlayers[custRef] && typeof this.customPlayers[custRef].enable === "function") {
                this.customPlayers[custRef].enable();
            }
        }
    }

    public tryAgain() {
        this.enableQuestion();
    }

    public changeView(lang?: Language) {
        this.trigger(BasePlayerView.EVENTS.LANGUAGE_CHANGE, lang);
    }

    public setCaption() {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const currentQuestionArray = this.model.questions[currentQuestionIndex];
        const caption = currentQuestionArray.caption;
        if (!caption) {
            this.trigger("caption-changed", this.currentCaption);
        } else {
            this.currentCaption = caption;
            this.trigger("caption-changed", caption);
        }
    }

    public disableFinishButton(): void {
        this.$("#finish").prop("disabled", true);
        this.targetSave();
        const currentQuestionIndex = this.model.currentQuestionIndex;
        this.$("#question" + currentQuestionIndex).addClass("finished");
        this.finishBtn.prop("disabled", true);
        this.disableQuestion();
        $("#language-button").focus();
    }

    public postTemplateRender(questionID: number): void {
        let desmosIdx = 0;
        for (const desmosData of this.desmosData) {
            if (desmosData.questionID == questionID) {
                const desmosDiv = this.$(".component-wrapper[quesid=" + desmosData.questionID + "] .desmos-item");
                this.renderDesmosCalculator(desmosData, desmosDiv[desmosIdx]);
                desmosIdx++;
            }
        }
        let index = 0;
        for (const customData of this.customData) {
            if (customData.questionID == questionID) {
                const $customDiv = this.$(".component-wrapper[quesid=" + customData.questionID + "] .custom-container").eq(index);
                index++;
                const subType: string = customData.subType;

                import(`./../../../common/components/${subType}/src/init`).then((InitializerPkg: Initializer) => {
                    const customPlayer = InitializerPkg.init({
                        $container: $customDiv,
                        currentLanguage: this.model.currentLanguage,
                        queData: Utilities.loadedJsons[customData.dataReference]
                    });
                    this.customPlayers[customData.dataReference] = customPlayer;
                    if (this.model.questions[questionID].validate && customData.validate) {
                        this.listenTo(customPlayer, "changed", () => {
                            this.enableCheckOnChange(questionID);
                        });
                    }
                });
            }
        }
    }

    public bindQuestionChangeEvent(currentQuestionIndex = this.model.currentQuestionIndex): void {
        let hasNoValue = true;
        const itemsApp = window.itemsApp;
        if (!itemsApp) {
            this._oldQuestionIndex = currentQuestionIndex;
            return;
        }
        const item = itemsApp.getItems();
        const $items = this.$el.find("#question" + currentQuestionIndex).find(LRN_ALL_SELECTOR);
        // iterate on multiple learnosity items in a single question container
        for (const currItem of $items) {
            const $item = $(currItem);
            const referenceId = $item.data("reference");
            // tslint:disable-next-line:no-string-literal
            let responseIds = item[referenceId]["response_ids"];
            responseIds = typeof responseIds === "string" ? [responseIds] : responseIds;
            for (const response of responseIds) {
                const question = itemsApp.question(response);
                if (this.model.questions[currentQuestionIndex].validate && question.checkValidation().has_validation) {
                    question.on("changed", () => {
                        hasNoValue = true;
                        const questionType = itemsApp.question(response).getQuestion().type;
                        let quesResponse = itemsApp.question(response).getResponse().value;
                        quesResponse = typeof quesResponse === "string" ? [quesResponse] : quesResponse;
                        switch (questionType) {
                            case "simplechart":
                                hasNoValue = !this.chartHasValue(quesResponse);
                                break;
                            case "graphplotting":
                                hasNoValue = !this.graphHasValue(quesResponse);
                                break;
                            default:
                                for (const que of quesResponse) {
                                    if (que != null && que !== "") {
                                        hasNoValue = false;
                                        break;
                                    }
                                }
                        }
                        if (hasNoValue == false) {
                            this.enableCheckOnChange(currentQuestionIndex);
                        } else {
                            this.disableCheckOnChange(currentQuestionIndex);
                        }
                    });
                }
            }
        }
    }

    public disableCheckOnChange(currentQuestionIndex: number) {
        this.$("#question" + currentQuestionIndex + " .show-answer").addClass("hide");
        this.$("#question" + currentQuestionIndex + " .validate").removeClass("hide").attr("disabled", "disabled");
    }

    public enableCheckOnChange(currentQuestionIndex: number) {
        this.$("#question" + currentQuestionIndex + " .validate").removeClass("hide").removeAttr("disabled");
        this.$("#question" + currentQuestionIndex + " .show-answer").addClass("hide");
    }

    public chartHasValue(quesResponse: any): boolean {
        if (quesResponse.data && quesResponse.data.length) {
            for (const response of quesResponse.data) {
                if (response.interactive) {
                    return true;
                }
            }
        }
        return false;
    }

    public graphHasValue(quesResponse: any): boolean {
        if (quesResponse.length > 0) {
            return quesResponse[0].actions && quesResponse[0].actions.length;
        }
        return quesResponse.actions && quesResponse.actions.length;
    }

    /**
     * To bind valid events on communicator.
     * @param event valid string event name.
     * @param callback valid callback function with appropriate data.
     * @param context optional, any context to bind callback on.
     */
    public attachListener<E extends keyof EventMap>(event: E, callback: (data: EventMap[E]) => any, context?: any) {
        if (context !== void 0 && context !== null && typeof context === "object") {
            callback = callback.bind(context);
        }
        return this.on(event, callback);
    }

    /**
     * Handler for iPad's play button clicked event.
     * Hides play button on click.
     * @param eve jQuery event object.
     */
    public onIpadPlayBtnClicked(eve: JQuery.Event<HTMLButtonElement>): void {
        $(".play-btn-container").hide();
        $("body").addClass("body-scroll");
        this.$(".player-wrapper").removeClass("invisible");
    }

    public renderValidateButton(): void {
        let hasNoValue = true;
        const itemsApp = window.itemsApp;
        const item = itemsApp.getItems();
        const $item = this.$el.find("#question" + this.model.currentQuestionIndex).find(LRN_ALL_SELECTOR);
        const referenceId = $item.data("reference");
        // tslint:disable-next-line:no-string-literal
        if (item[referenceId] && item[referenceId].response_ids) {
            // tslint:disable-next-line:no-string-literal
            let responseIds = item[referenceId].response_ids;
            responseIds = typeof responseIds === "string" ? [responseIds] : responseIds;
            for (const response of responseIds) {
                const question = itemsApp.question(response);
                if (this.model.questions[this.model.currentQuestionIndex].validate && question.checkValidation().has_validation) {
                    if (itemsApp.question(response) && itemsApp.question(response).getResponse() &&
                        itemsApp.question(response).getResponse().value !== null) {
                        let quest = itemsApp.question(response).getResponse().value;
                        quest = typeof quest === "string" ? [quest] : quest;
                        for (const que of quest) {
                            if (que != null && que !== "") {
                                hasNoValue = false;
                                break;
                            }
                        }
                        if (hasNoValue == false) {
                            this.$("#question" + this.model.currentQuestionIndex + " .validate").removeClass("hide").removeAttr("disabled");
                        } else {
                            this.$("#question" + this.model.currentQuestionIndex + " .validate").removeClass("hide")
                                .attr("disabled", "disabled");
                        }
                    }
                }
            }
        }
    }

    public scrollingTime($elem1: JQuery<HTMLElement>, $elem2?: JQuery<HTMLElement>): number {
        if ($elem2) {
            return Math.abs($elem1[0].offsetTop + $elem1.height() + $elem2.height() - this.$(".player-wrapper").scrollTop());
        } else {
            return Math.abs($elem1[0].offsetTop - this.$(".player-wrapper").scrollTop());
        }
    }

    public setLanguage() {
        this.validateBtn.html(this.model.locTextData.checkBtnText);
        this.$el.find(".continue-align").html(this.model.locTextData.contBtnText);
        this.$el.find(".finish-btn-text").html(this.model.locTextData.finishBtnText);
        this.showAnswerBtn.html(this.model.locTextData.showBtnText);
        this.$el.find(".replay").html(this.model.locTextData.replayBtnText);
    }

    public showPreloader() {
        this.trigger("show-preloader");
    }

    public infoShow(event: JQuery.Event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.toolTipComponent.model.toggleState();
    }

    public targetSave(): void {
        if (location.search.indexOf("submit_practice") > -1) {
            const itemsApp = window.itemsApp;
            itemsApp.save();
        }
    }

    private addCustomStyleOverride(): void {
        if (this.model.useCustomStyle) {
            // To do move this on init and load once.
            const url = "./css/exploration.css";
            $("head").append("<link type='text/css' rel='stylesheet' href='" + url + "'>");
        }
    }

    private addCustomScript(): void {
        if (this.model.useCustomScript) {
            const url = "./js/exploration.js";
            const scriptTag: HTMLScriptElement = document.createElement("script");
            scriptTag.onload = this.onScriptLoaded.bind(this);
            scriptTag.onerror = this.onScriptLoadFailed.bind(this);
            scriptTag.async = false;
            scriptTag.src = url;
            $("head").append(scriptTag);
        }
    }

    private onScriptLoaded(): void {
        console.info("Custom script loaded");
    }

    private onScriptLoadFailed(): void {
        console.info("Custom script load failed");
    }

    /**
     * Lazy loads custom components if any required in current Exploration.
     */
    private lazyLoadCustomComponents() {
        const cComps = this.model.getCustomComponents();
        const loadingComps: string[] = [];
        for (const comp of cComps) {
            const compType = comp.subType;
            if (loadingComps.indexOf(compType) === -1) {
                loadingComps.push(compType);
                const type: string = compType;
                if (type) {
                    import(`./../../../common/components/${type}/src/init`).then((InitializerPkg: Initializer) => {
                        Utilities.logger.info("CC Loaded:", type);
                    }, (reason) => {
                        Utilities.logger.warn("Failed to load", reason);
                    });
                } else {
                    Utilities.logger.warn("[Invalid Custom Component] CC You are trying to import is cannot be found!");
                }
            }
        }
    }

    private saveQuestionData(data: any, questionIdx: number) {
        switch (data.type) {
            case "desmos":
                this.saveDesmosData(data, questionIdx);
                break;
            case "custom":
                this.saveCustomData(data, questionIdx);
                break;
            case "image":
                Utilities.logger.info(data);
                this.saveImageData(data, questionIdx);
        }
    }

    private saveImageData(data: any, questionIdx: number) {
        const imgSrc = Utilities.getImageSource(data.imgID);
        data.ImgSrc = (imgSrc) ? imgSrc : Utilities.getImageSource(data.imgID, this.model.currentLanguage);
    }

    private saveDesmosData(data: any, questionIdx: number) {
        switch (data.desmosType) {
            case "calculator":
            case "geometry": {
                this.desmosData.push({
                    desmosSettings: data.settings,
                    desmosType: data.desmosType,
                    desmosURL: data.desmosURL,
                    questionID: questionIdx
                });
            }
        }
    }

    private saveCustomData(data: any, questionIdx: number) {
        this.customData.push({
            dataReference: data.dataReference,
            questionID: questionIdx,
            subType: data.subType,
            validate: data.validate
        });
    }
    // tslint:disable-next-line:max-file-line-count
}
