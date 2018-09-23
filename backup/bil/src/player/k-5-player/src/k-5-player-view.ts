import * as Backbone from "backbone";
import * as _ from "underscore";

// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jqueryui";
// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jquery-ui-touch-punch";
import "./../../../common/css/bil-icons.css";
import "./../../../common/css/k-5-embed.styl";
import "./../../../common/css/k-5-learnosity-large-font.styl";
import "./../../../common/css/k-5-learnosity.styl";
import * as SoundManager from "./../../../common/helper/sound-manager";

import * as ToolTipPkg from "./../../../common/components/tooltip/src/models/tooltip-model";
import { ToolTip } from "./../../../common/components/tooltip/src/views/tooltip-view";
import "./../css/k-5-player.styl";

import * as CreateJSHelperModelPkg from "./../../../common/components/create-js-helper/src/models/create-js-helper";
import * as CreateJSHelperViewPkg from "./../../../common/components/create-js-helper/src/views/create-js-helper";

import { Language, Utilities } from "./../../../common/helper/utilities";

const playerTemplate: (attr?: KeyValue) => string = require("./../tpl/player.hbs");

const animationData: CreateJSHelperModelPkg.AnimationData = require("./../data/animations.json");
const animationNames: string[] = [];

export class QuestionState {
    public validated: boolean;
    public showMe: boolean;
    public checkClicked: boolean;
}

export interface ExtWindow extends Window {
    createjs: any;
    lib: any;
    MathJax: any;
    BIL: any;
    itemsApp: any;
    ExposedFunctions: any;
}

declare const window: ExtWindow;
window.createjs = window.createjs || {};
window.lib = window.lib || {};

declare const BIMStories: any;

// Load createjs lib..
require("./../../../common/vendor/create-js/js/createjs.min.js");

declare let Desmos: any;
import { compile } from "handlebars";
import { Initializer } from "../../../common/components/interfaces/initializer";
import { BasePlayerAttributes, BasePlayerModel, Component } from "./k-5-player-model";

export declare class KeyValue {
    [id: string]: any;
}

const basePlayerTemplate: (attr?: KeyValue) => string = require("./../tpl/k-5-player.hbs");

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
    "disable-next": BasePlayerView;
    "enable-next": BasePlayerView;
    "last-question-reached": BasePlayerView;
    "last-question-updated": BasePlayerView;
    "stop-audio": BasePlayerView;
    "exploration-audio-completed": BasePlayerView;
    "last-question-validated": BasePlayerView;
}

export interface CustomData {
    compID: number;
    dataReference: string;
    subType: string;
    questionID: number;
    saveData?: boolean;
    fetchData?: boolean;
    key?: string;
}

export class BasePlayerView extends Backbone.View<BasePlayerModel> {
    public static EVENTS = {
        CAPTION_CHANGE: "change-caption",
        LANGUAGE_CHANGE: "change-localization-language"
    };
    public customPlayers: { [id: string]: any } = {};
    public customPlayerViews: { [compID: number]: any } = {};
    public itemsApp: any;
    public className = "base-player";
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
    public highlighterData: any[] = [];
    public animationData: any[] = [];
    public learnosityItems: any;
    public languages = Language;
    public SoundManager: SoundManager.SoundManager;
    public recentReset = false;
    public tooltipModel: ToolTipPkg.ToolTip;
    public toolTipComponent: ToolTip;
    public playerTemplate: (attr?: KeyValue) => string = playerTemplate;
    public reachedTill = 0;
    public reachedLast = false;
    public lastQuestionUpdated = false;
    /**
     * cached elements declared here
     */
    public showAnswerBtn: JQuery<HTMLElement>;
    public validateBtn: JQuery<HTMLElement>;
    public continueBtn: JQuery<HTMLElement>;
    public finishBtn: JQuery<HTMLElement>;
    public infoBtn: JQuery<HTMLElement>;
    public container: JQuery<HTMLElement>;
    public hasAnimation = false;
    public createJSHelper: CreateJSHelperViewPkg.CreateJSHelper;
    public animationInFirstQue: boolean;
    public compValidationCounter = 0;
    private _oldComponentIndex: number[] = [];

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
            enableCheck: this.enableAllChecks.bind(this)
        };
    }

    public enableAllChecks() {
        const components = this.model.getComponentsByQuestionIDInPage(this.model.currentQuestionIndex, this.model.currentPageIndex);
        // this.customPlayerViews
        const $checkBtns = this.$(`.question${this.model.currentQuestionIndex} .validate`);
        const compIDs: string[] = [];
        const quesIDs = $checkBtns.each((idx: number, elem: HTMLElement) => {
            compIDs.push($(elem).attr("data-compid"));
        });
        for (const compID of compIDs) {
            if (this.customPlayerViews[compID]) {
                this.customPlayerViews[compID].trigger("changed");
            } else if (this.$(`.question[data-compid=${compID}]`).hasClass("comp-type-learnosity")) {
                this.$(`.question${this.model.currentQuestionIndex} .validate`).removeAttr("disabled");
            }
        }
        for (const component of components) {
            if (component.validateChange) {
                this.enableNextOnValidation();
            }
        }
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
        for (const [index, page] of this.model.pages.entries()) {
            this.parseComponentData(page.components);
        }
    }

    public parseComponentData(componentsArr: Component[][]) {
        for (const components of componentsArr) {
            for (const component of components) {
                if (component.type == "layout") {
                    this.parseComponentData(component.components);
                } else {
                    this.saveComponentData(component);
                }
            }
        }
    }

    public events(): Backbone.EventsHash {
        return {
            "click #finish": "disableValidateButton",
            "click .desmos-show-me-btn": "showDesmosAnswer",
            "click .finish": "disableFinishButton",
            "click .highlight-show-me-btn": "showHighlightAnswer",
            "click .info": "infoShow",
            "click .replay": "replayAnimation",
            "click .saveBtn": "onSaveButtonClick",
            "click .show-answer": "showCorrectAnswer",
            "click .top-buttons .lrn_clear": "clearHighlighter",
            "click .top-buttons .lrn_redo": "redoHighlighter",
            "click .top-buttons .lrn_undo": "undoHighlighter",
            "click .tryAgain": "onTryAgain",
            "click .validate": "validateCurrentComponent",
            // tslint:disable-next-line:max-line-length
            "mousedown .comp-type-highlighter:not(.finished) .highlighter-container:not(.hide-show-me) .highlighter-item": "onHighlighterChange",
            // tslint:disable-next-line:max-line-length
            "touchmove .comp-type-highlighter:not(.finished) .highlighter-container .highlighter-item": "onHighlighterMove",
            // tslint:disable-next-line:max-line-length
            "touchstart .comp-type-highlighter:not(.finished) .highlighter-container:not(.hide-show-me) .highlighter-item": "onHighlighterChange"
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
        if (this.hasAnimation) {
            this.initAnimation();
        }
        this.$(".shell-container").remove();
        this.$el.append(this.basePlayerTemplate(this.model.toJSON()));
        $(this.SoundManager).on("AUDIO_PLAYBACK_COMPLETE", ((soundId: string, event: JQuery.Event) => {
            this.audioComplete();
        }).bind(this));
        this.renderCurrentPage();
        this.showCurrentPage();
        this.showCurrentQuestion();
        this.cacheElements();
        this.setLanguage();
        if ((this.model.totalPages == 1) && (this.model.questionsData[this.model.currentQuestionIndex].validate == false)) {
            this.finishBtn.removeClass("hide");
            this.infoBtn.removeClass("hide");
        }
        this.renderTooltip();
        this.handleResize();
        this.hideEmptyComponentsContainer();
        return this;
    }

    public initAnimation(): void {
        // Load animation files..
        for (const data of this.animationData) {
            const key = data.animationName;
            if (animationData.hasOwnProperty(key)) {
                animationNames.push(key);
                // require("./../animations/" + key + ".js");
            }
        }
    }

    public renderCurrentPage(): void {
        const $container = this.$(".player-wrapper");
        const questions = this.model.pages;
        const explorationInfo = this.model.additionalInfo;
        const $questionContainer = $(this.playerTemplate(this.model.toJSON()));
        $container.append($questionContainer);
        this.executeLearnosityQuestions();
    }

    public hideAllQuestionsInCurrPage(): void {
        const currentPageIndex = this.model.currentPageIndex;
        const currentQuestionIndex = this.model.currentQuestionIndex;
        this.$("#page" + currentPageIndex).find(".question").addClass("hide");
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
        // const currentQuestion = this.model.questionsData[currentQuestionIndex];
        this.$(".player-wrapper").attr("quesid", currentQuestionIndex);
        this.$(".question" + currentQuestionIndex).removeClass("hide");
        this.postTemplateRender(this.model.currentQuestionIndex);
        const questionsInCurrentPage = this.model.allComponentsByPage[this.model.currentPageIndex];
        const componentsInCurrentQuestion = questionsInCurrentPage.filter((data) => data.questionID == currentQuestionIndex);
        const maxQuestionID = this.model.getMaxQuestionIDInPage(this.model.currentPageIndex);
        const isLastPage = (this.model.currentPageIndex == this.model.pages.length - 1) ? true : false;
        if (isLastPage && maxQuestionID == currentQuestionIndex) {
            this.trigger("last-question-reached");
        }
        this.checkForValidationInCurrComponents(componentsInCurrentQuestion);
        if (window.MathJax) {
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
        }
    }

    public checkForValidationInCurrComponents(componentsInCurrentQuestion: Component[]): void {
        this.compValidationCounter = 0;
        for (const comp of componentsInCurrentQuestion) {
            comp.validate = (comp.validate !== void 0) ? comp.validate : false;
            if (comp.validate) {
                this.compValidationCounter++;
            } else if (comp.type === "highlighter" && !comp.hideShowMe) {
                this.compValidationCounter++;
            } else if (this._isChangeToBeValidated(comp)) {
                this.compValidationCounter++;
            }
            if (comp.enableNext) {
                this.compValidationCounter = 0;
                break;
            }
        }
        if (this.compValidationCounter > 0) {
            this.trigger("disable-next");
        } else {
            if (this.isLastQuestion()) {
                this.trigger("last-question-validated");
            }
        }
    }

    public _isChangeToBeValidated(comp: Component) {
        return !!comp.validateChange;
    }

    public showCurrentPage(): void {
        const currentPageIndex = this.model.currentPageIndex;
        const currentQuestionIndex = this.model.currentQuestionIndex;
        this.$(".page-container").addClass("hide");
        this.$("#page" + currentPageIndex).removeClass("hide");
        this.hideAllQuestionsInCurrPage();
    }

    public validateCurrentComponent(event: JQuery.Event): void {
        this.targetSave();
        const currentCompID = parseInt($(event.currentTarget).attr("data-compID"), 10);
        const currentComp = this.model.getComponentByID(currentCompID);
        const currentPageIndex = this.model.currentPageIndex;
        let isValid = false;
        if (currentComp.type == "learnosity") {
            isValid = this.validateLearnosityQuestion(currentCompID);
        } else if (currentComp.type == "custom" && this.customPlayerViews[currentCompID] &&
            typeof this.customPlayerViews[currentCompID].validate === "function") {
            isValid = this.customPlayerViews[currentCompID].validate();
        }

        if (isValid) {
            this.$(".component" + currentCompID + " .validate").addClass("hide");
            this.enableNextOnValidation();
        } else {
            this.$(".component" + currentCompID + " .validate").addClass("hide");
            this.$(".component" + currentCompID + " .tryAgain").removeClass("hide").focus();
            this.$(".component" + currentCompID + " .show-answer").removeClass("hide");
        }
        this.disableComponent(currentCompID);
        this.bindComponentChangeEvent(currentCompID);
    }

    public validateLearnosityQuestion(currentCompID: number): boolean {
        const $items = this.$el.find(".component" + currentCompID).find(".learnosity-item");
        let isValid = true;
        // iterate on multiple learnosity items in a single question container
        for (const currItem of $items) {
            const $item = $(currItem);
            const options = {
                showCorrectAnswers: true
            };
            this.$(".component" + currentCompID).addClass("que-validated");
            this.validateQuestion(options, $item);
            isValid = isValid && this.isValidAnswer($item);
        }
        if (isValid) {
            for (const currItem of $items) {
                const $item = $(currItem);
                this.disableLearnosityQuestion($item);
            }
        }
        return isValid;
    }

    public onTryAgain(event: JQuery.Event): void {
        const compID = parseInt($(event.currentTarget).attr("data-compID"), 10);
        this.$(".component" + compID).removeClass("que-validated");
        this.handleComponentOnTryAgain(compID);
        this.$(".component" + compID + " .tryAgain").addClass("hide");
        this.$(".component" + compID + " .show-answer").addClass("hide");
        this.$(".component" + compID + " .validate").removeClass("hide").focus();
    }

    public onSaveButtonClick(event: JQuery.Event): void {
        const compID = $(event.currentTarget).attr("data-compID");
        this.$("#save-btn-" + compID).attr("disabled", "disabled");
        this.targetSave();
    }

    public enableNextOnValidation(): void {
        this.compValidationCounter--;
        if (this.compValidationCounter == 0) {
            if (this.isLastQuestion()) {
                this.trigger("last-question-validated");
            } else {
                this.trigger("enable-next");
            }
        }
    }

    public isLastQuestion() {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const maxQuestionID = this.model.getMaxQuestionIDInPage(this.model.currentPageIndex);
        const isLastPage = (this.model.currentPageIndex == this.model.pages.length - 1) ? true : false;
        return (isLastPage && maxQuestionID == currentQuestionIndex);
    }

    public showCorrectAnswer(event: JQuery.Event): void {
        this.targetSave();
        const currCompID: number = parseInt($(event.currentTarget).attr("data-compID"), 10);
        const comp = this.model.getComponentByID(currCompID);
        if (comp.type == "learnosity") {
            this.showCorrectLearnosityAnswer(currCompID);
        } else if (comp.type == "custom") {
            if (this.customPlayerViews[currCompID] !== void 0 && typeof this.customPlayerViews[currCompID].showAnswer === "function") {
                this.customPlayerViews[currCompID].showAnswer();
            }
            this.disableComponent(currCompID);
        }
        this.enableNextOnValidation();
        this.$(".component" + currCompID + " .show-answer").addClass("hide");
        this.$(".component" + currCompID + " .tryAgain").addClass("hide");
    }

    public showCorrectLearnosityAnswer(currCompID: number): void {
        const $items = this.$el.find(".component" + currCompID).find(".learnosity-item");
        // iterate on multiple learnosity items in a single question container
        for (const currItem of $items) {
            const $item = $(currItem);
            this.$(".component" + currCompID).removeClass("que-validated").addClass("que-showanswer"); // check-this
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
                        const lrnQuestion = questionResp.getQuestion();
                        const questionID = lrnQuestion.response_id;
                        const $quesItemRegion = this.$("#" + questionID);
                        if (["formulaessay", "longtext"].indexOf(lrnQuestion.type) == -1) {
                            const $correctAnswerList = $quesItemRegion.find(".lrn_correctAnswerList");
                            const $incorrectQuestions = $quesItemRegion
                                .find("[data-lrn-access-review-dest].lrn_incorrect, [data-lrn-access-review-dest].lrn_not_attempted");
                            if (lrnQuestion.validation &&
                                lrnQuestion.validation.valid_response.value.length > 1) {
                                this.disableComponent(currCompID);
                                const question = itemsApp.questions()[response].validate({ showCorrectAnswers: true });
                                $item.addClass("multiple-response");
                            } else {
                                const question = itemsApp.question(response);
                                question.validate({
                                    showCorrectAnswer: true
                                });
                                this.disableComponent(currCompID);
                                $correctAnswerList.find(".lrn_responseIndex").addClass("hide");
                                $correctAnswerList.find("li").addClass("remove-left-padding");
                                $quesItemRegion.addClass("single-answer");
                            }
                            this.replaceAnswers($correctAnswerList, $incorrectQuestions, currCompID, questionResp);
                        }
                    }
                }
            }
        }
    }
    public replaceAnswers($answerContainer: JQuery<HTMLElement>, $responses: JQuery<HTMLElement>, currCompID: number, question: any) {
        const $lrnItem = this.$(".component" + currCompID).find(".learnosity-item");
        const comp = this.model.getComponentByID(currCompID);
        if ($lrnItem.hasClass("replace-answers")) {
            const $answers = $("li", $answerContainer);
            $responses.each((idx: number, el: HTMLElement) => {
                if (comp.answers) {
                    // Please fix for multiple when replacing wrong answers
                    $(".lrn_math_editable", el).html(`<span class="stored-answers">${comp.answers[idx]}</span>`);
                } else {
                    $(".lrn_math_editable", el).html($answers.eq(idx).find(".lrn_responseText").html());
                }
            });
            question.resetValidationUI();
            $(".lrn_correctAnswers", $lrnItem).hide();
            if (window.MathJax) {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }
        }
    }

    public onNextClick(): void {
        this.triggerComponentEvents();
        const currentPageIndex = this.model.currentPageIndex;
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const lastQuestionID = this.model.getMaxQuestionIDInPage(currentPageIndex);
        if (lastQuestionID == currentQuestionIndex) {
            this.model.currentPageIndex += 1;
            if (this.model.currentPageIndex < this.model.pages.length) {
                const firstQuestionID = this.model.getMinQuestionIDInPage(this.model.currentPageIndex);
                if (!(firstQuestionID == currentQuestionIndex)) {
                    this.preRenderNextQuestion();
                    this.model.currentQuestionIndex++;
                }
                this.showCurrentPage();
                this.renderNextQuestion();
            }
        } else {
            this.preRenderNextQuestion();
            this.model.currentQuestionIndex++;
            this.renderNextQuestion();
        }
        this.targetSave();
    }

    public triggerComponentEvents() {
        const components = this.model.getComponentsByQuestionIDInPage(this.model.currentQuestionIndex, this.model.currentPageIndex);
        for (const comp of components) {
            const currComp = this.customPlayerViews[comp.id];
            if (currComp && typeof currComp.finish === "function") {
                currComp.finish();
            }
        }
    }

    public onDoneClick(): void {
        this.targetSave();
        this.disableCurrentQuestion();
        this.disableHighlighters();
    }

    public disableCurrentQuestion(): void {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        // tslint:disable-next-line:max-line-length
        const $currentQueContainer = this.$(".question" + this.model.currentQuestionIndex).addClass("finished");
        for (const $que of $currentQueContainer) {
            const compID = parseInt($($que).attr("data-compID"), 10);
            // if (this.model.getComponentByID(compID).validate) {
            this.disableComponent(compID);
            // }
        }
    }

    public disableHighlighters() {
        this.$(".highlighter-container .highlight-show-me-container").hide();
    }

    public preRenderNextQuestion(): void {
        this.targetSave();
        this.stopAudio();
        this.disableCurrentQuestion();
    }

    public renderNextQuestion(): void {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const hasCustomData = this.hasCustomData(currentQuestionIndex);
        this.showCurrentQuestion();
        if (!hasCustomData) {
            this.hidePreviousQuestion();
        }
        this.hideEmptyComponentsContainer();
        this.setCaption();
        this.playCurrentQuestionAudio();
        this.cacheElements();
        this.renderValidateButton();
        if (!hasCustomData) {
            this.scrollToQuestionInView();
        }
    }

    public hidePreviousQuestion() {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        this.$(`.question[data-replace='${currentQuestionIndex}']`).addClass("hide");
        const $question = this.$(`.question[data-replace='${currentQuestionIndex}']`).closest(".component-col-container").find(".question");
        if ($question.length == 1) {
            this.$(`.question[data-replace='${currentQuestionIndex}']`).closest(".component-col-container").addClass("hide");
        }
    }

    public hasCustomData(questionID: number) {
        const componentsToRender = this.model.getComponentsByQuestionIDInPage(questionID, this.model.currentPageIndex);
        for (const comp of componentsToRender) {
            const compID = comp.id;
            const customData = this.customData.filter((data) => data.compID == compID);
            return customData.length > 0 && customData[0].compID == compID;
        }
    }

    public hideEmptyComponentsContainer(): void {
        const currentPageIndex = this.model.currentPageIndex;
        const $rowContainers = this.$("#page" + currentPageIndex).find(".component-row-container");
        for (let i = 0; i < $rowContainers.length; i++) {
            const $componentDivs = $rowContainers.eq(i).find(".component-wrapper");
            const $componentHiddenDivs = $rowContainers.eq(i).find(".component-wrapper.hide");
            const $componentEmptyDivs = $rowContainers.eq(i).find(".component-wrapper > .empty");
            if (($componentDivs.length == $componentHiddenDivs.length) ||
                ($componentDivs.length == $componentEmptyDivs.length)) {
                $rowContainers.eq(i).addClass("hide");
            } else if ($componentDivs.length > $componentHiddenDivs.length) {
                $rowContainers.eq(i).removeClass("hide");
            }
        }
    }

    public scrollToQuestionInView(): void {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const $prevReplaced = this.$(`.question[data-replace='${currentQuestionIndex}']`);
        const $currQuest = this.$(".question" + currentQuestionIndex);
        const $scrollTo = this.$(".scroll-to-view.question" + currentQuestionIndex);
        if ($scrollTo.length) {
            this.animateScrolling($scrollTo);
        } else if ($prevReplaced.length == 0) {
            if ($currQuest.length) {
                this.animateScrolling($currQuest);
            }
        }
    }

    public animateScrolling($currQuest: JQuery<HTMLElement>) {
        const PLAYER_PADDING = 20;
        const $playerWrapper = this.$(".player-wrapper");
        const scrollTop = $playerWrapper.scrollTop();
        let offsetTop = this.findLeastOffsetTop($currQuest) - PLAYER_PADDING;
        offsetTop = offsetTop < 0 ? 0 : offsetTop;
        offsetTop += scrollTop;
        const time = Math.abs(offsetTop - scrollTop) + 100;
        $playerWrapper.animate({
            scrollTop: offsetTop
        }, time);
    }

    public findLeastOffsetTop($elements: JQuery<HTMLElement>): number {
        let offsetTop: number = null;
        $elements.each((idx: number, elem: HTMLElement) => {
            const elemOffsetTop = elem.getBoundingClientRect().top;
            offsetTop = offsetTop === null ? elemOffsetTop : ((elemOffsetTop < offsetTop) ? elemOffsetTop : offsetTop);
        });
        return offsetTop;
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
            for (const compIdx of this._oldComponentIndex) {
                this.bindComponentChangeEvent(compIdx);
            }
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

    public renderTooltip() {
        this.tooltipModel = new ToolTipPkg.ToolTip(
            this.model.toJSON().additionalInfo, this.model.currentLanguage
        );
        this.toolTipComponent = new ToolTip({
            el: this.$(".info-button-container"),
            model: this.tooltipModel
        });
        this.attachTooltipEvents();
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
        const $desmosWrapper = this.$(".component-wrapper.component" + question.compID);
        let settings = question.desmosSettings && question.desmosType !== "geometry" ? question.desmosSettings : {};
        let desmos = Desmos.GraphingCalculator(desmosDiv, settings);
        let showMeDesmos: any;
        const comp = this.model.getComponentByID(question.compID);
        if (question.desmosType == "geometry") {
            settings = question.desmosSettings ? question.desmosSettings : {};
            desmos = Desmos.Geometry(desmosDiv, settings);
        }
        if (question.showMe) {
            const showMeDiv = $(".show-me-desmos-item", $desmosWrapper)[0];
            showMeDesmos = Desmos.GraphingCalculator(showMeDiv, settings);
            if (question.desmosType == "geometry") {
                showMeDesmos = Desmos.Geometry(showMeDiv, settings);
            }
            $.getJSON(question.showMe, (showMeResp: any) => {
                showMeDesmos.setState(showMeResp.state);
            });
        }
        $.getJSON(question.desmosURL, (resp: any) => {
            desmos.setState(resp.state);
            desmos.observeEvent("change", () => {
                if (desmos.isAnyExpressionSelected) {
                    Utilities.logger.info("Change occurred");
                    this.$("#refresh").addClass("refreshEnabled").removeClass("refreshDisabled");
                    this.$("#refresh").prop("disabled", false);
                }
                if (question.showMe) {
                    $(".desmos-show-me-btn", $desmosWrapper).removeAttr("disabled");
                }
                if (this._isChangeToBeValidated(comp) && !$desmosWrapper.hasClass("changed")) {
                    $desmosWrapper.addClass("changed");
                    this.enableNextOnValidation();
                }
            });
        });
    }

    public showDesmosAnswer(evt: JQueryEventObject) {
        const $showMeBtn = $(evt.target);
        const $desmosComp = $showMeBtn.closest(".component-wrapper");
        $desmosComp.addClass("answer-shown");
    }

    public getCurrentQuestionAudioID(): string {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const currentQuestionArray = this.model.questionsData.filter((data) => data.id == currentQuestionIndex);
        const langSuffix = "_" + this.model.currentLanguage;
        let audioId = currentQuestionArray[0] && currentQuestionArray[0].audioID;
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
        const currentQuestionArray = this.model.questionsData.filter((data) => data.id == currentQuestionIndex);
        const audioId = currentQuestionArray[0] && currentQuestionArray[0].audioID;
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
        this.muteStoryBookAudio(true);
    }

    public unmuteCurrentAudio(): void {
        this.SoundManager.unmute(this.getCurrentlyPlayingAudioID());
        this.muteStoryBookAudio(false);
    }

    public playCurrentAudio(): void {
        const currentAudio = this.getCurrentQuestionAudioID();
        this.SoundManager.stop(this.currentlyPlayingTtsAudioId);
        const audioExists = this.SoundManager.resumeOrPlay(currentAudio);
        if (audioExists) {
            this.trigger("current-audio-played", currentAudio);
            this.toolTipComponent.trigger("render-play-icon");
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
        this.trigger("exploration-audio-completed");
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

    public validateQuestion(options: any, $item: JQuery<HTMLElement>): void {
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

    public refreshAll(): void {
        this.model.savedData = {};
        this.recentReset = true;
        this.lastQuestionUpdated = false;
        this.showPreloader();
        this.stopAudio();
        this.container.empty();
        this.model.currentPageIndex = 0;
        this.model.currentQuestionIndex = 0;
        this.reachedTill = 0;
        this.render();
        this.$(".hide-on-start").removeClass("hide-on-start");
        this.$(".player-wrapper").removeClass("invisible").attr("quesid", 0);
        if (this.model.hasStoryBook) {
            this.initializeStoryBookPlayer();
        }
    }

    public setCheckControlsState(): void {
        if (this.model.currentPageIndex != (this.model.totalPages - 1)) {
            this.$("#finish").addClass("hide");
        }
    }

    public disableValidateButton(): void {
        this.$("#finish").prop("disabled", true);
    }

    public disableComponent(compID: number): void {
        const comp = this.model.getComponentByID(compID);
        if (comp.type == "learnosity") {
            const itemsApp = window.itemsApp;
            const item = itemsApp.getItems();
            const $items = this.$el.find(".component" + compID).find(".learnosity-item");
            // iterate on multiple learnosity items in a single question container
            for (const currItem of $items) {
                const $item = $(currItem);
                this.disableLearnosityQuestion($item);
            }
        } else if (comp.type == "custom") {
            if (this.customPlayerViews[compID] !== void 0
                && this.model.getComponentByID(compID).validate
                && typeof this.customPlayerViews[compID].disable === "function") {
                this.customPlayerViews[compID].disable();
            }
        }
    }

    public handleComponentOnTryAgain(compID: number): void {
        const comp = this.model.getComponentByID(compID);
        if (comp.type == "learnosity") {
            const itemsApp = window.itemsApp;
            const item = itemsApp.getItems();
            const $items = this.$el.find(".component" + compID).find(".learnosity-item");
            // iterate on multiple learnosity items in a single question container
            for (const currItem of $items) {
                const $item = $(currItem);
                this.enableLearnosityQuestion($item);
            }

        } else if (comp.type == "custom") {
            const compView = this.customPlayerViews[compID];
            if (compView !== void 0) {
                if (typeof compView.clearValidation === "function") {
                    compView.clearValidation();
                }
                if (typeof compView.enable === "function") {
                    compView.enable();
                }
            }
        }
        this.trigger("stop-audio");
        this.playCurrentQuestionAudio();
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
        const custRef = this.model.getCurrCustomDataRef();
        if (custRef && this.customPlayers[custRef] && typeof this.customPlayers[custRef].disable === "function") {
            this.customPlayers[custRef].disable();
        }
    }

    public enableLearnosityQuestion($item: any): void {
        const itemsApp = window.itemsApp;

        const item = itemsApp.getItems();
        const referenceId = $item.data("reference");
        // tslint:disable-next-line:no-string-literal
        const responseIds = item[referenceId]["response_ids"];
        for (const response of responseIds) {
            const questionResponse = itemsApp.questions()[response];
            questionResponse.enable();
            questionResponse.resetValidationUI();
        }
        const custRef = this.model.getCurrCustomDataRef();
        if (custRef && this.customPlayers[custRef] && typeof this.customPlayers[custRef].enable === "function") {
            this.customPlayers[custRef].enable();
        }
    }

    public changeView(lang?: Language) {
        this.trigger(BasePlayerView.EVENTS.LANGUAGE_CHANGE, lang);
    }

    public setCaption() {
        const currentQuestionIndex = this.model.currentQuestionIndex;
        const currentQuestionArray = this.model.questionsData.filter((data) => data.id == currentQuestionIndex);
        const caption = currentQuestionArray[0] && currentQuestionArray[0].caption;
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
        const currentPageIndex = this.model.currentPageIndex;
        this.$("#question" + currentPageIndex).addClass("finished");
        this.finishBtn.prop("disabled", true);
        // this.disableQuestion();
        $("#language-button").focus();
    }

    public postTemplateRender(questionID: number): void {
        const componentsToRender = this.model.getComponentsByQuestionIDInPage(questionID, this.model.currentPageIndex);
        for (const comp of componentsToRender) {
            const compID = comp.id;
            const customData = this.customData.filter((data) => data.compID == compID);
            if (customData.length > 0) {
                if (customData[0].compID == compID) {
                    const $customDiv = this.$(".component-wrapper.component" + customData[0].compID + " .custom-container");
                    console.info($customDiv);
                    const subType: string = customData[0].subType;
                    let data: any = {};
                    if (customData[0].fetchData) {
                        data = this.model.savedData[customData[0].key];
                    }
                    const saveData = (customData[0].saveData) ? true : false;
                    import(`./../../../common/components/${subType}/src/init`).then((InitializerPkg: Initializer) => {
                        const customPlayer = InitializerPkg.init({
                            $container: $customDiv,
                            currentLanguage: this.model.currentLanguage,
                            data,
                            queData: Utilities.loadedJsons[customData[0].dataReference],
                            saveData
                        });
                        this.customPlayers[customData[0].dataReference] = customPlayer;
                        this.customPlayerViews[compID] = customPlayer;
                        this.bindComponentChangeEvent(compID);
                        if (customData[0].saveData) {
                            this.listenTo(customPlayer, "save-data", (savedData: any) => {
                                this.model.savedData[customData[0].key] = savedData;
                            });
                        }
                    }).then(this.onCustomComponentRendered.bind(this));
                }
            }
            for (const desmosData of this.desmosData) {
                if (desmosData.compID == compID) {
                    const $desmosWrapper = this.$(".component-wrapper.component" + desmosData.compID);
                    const desmosDiv = $(".desmos-item", $desmosWrapper);
                    this.renderDesmosCalculator(desmosData, desmosDiv[0]);
                }
            }
            for (const playerAnimationData of this.animationData) {
                if (playerAnimationData.compID == compID) {
                    // tslint:disable-next-line:max-line-length
                    const $container = this.$(".component-wrapper[data-compid=" + playerAnimationData.compID + "]").find(".animation-wrapper");
                    const model = new CreateJSHelperModelPkg.CreateJSHelper({ animationData });
                    this.createJSHelper = new CreateJSHelperViewPkg.CreateJSHelper({
                        model
                    }, {
                            $constainer: $container
                        });
                    this.createJSHelper.gotoAndStop(playerAnimationData.animationName);
                    if (questionID == 0 && !this.recentReset) {
                        this.animationInFirstQue = true;
                    } else {
                        this.createJSHelper.initAnimation(playerAnimationData.animationName);
                    }
                    $container.attr("alt", playerAnimationData.altText);
                }
            }
            if (comp.type == "learnosity") {
                this.bindComponentChangeEvent(compID);
            }
            if (comp.type == "highlighter") {
                for (const highlightData of this.highlighterData) {
                    if (highlightData.compID == compID) {
                        const $highlighter = this.$(".component-wrapper.component" + highlightData.compID);
                        const $highlightContainer = $(".highlighter-container", $highlighter);
                        const $highlightAnswer = $(".highlight-show-me-answer", $highlighter);
                        const $highlightAnswerWrapper = $(".highlight-show-me-answer-wrapper", $highlighter);
                        $highlightAnswer.html(highlightData.answer);
                        if (highlightData.altText) {
                            $highlighter.attr("title", highlightData.altText);
                        }
                        if (highlightData.ansAltText) {
                            $highlightAnswerWrapper.attr("title", highlightData.ansAltText);
                        }
                        if (!comp.hideShowMe) {
                            this.trigger("disable-next");
                        }
                        if (highlightData.isMenubarShown) {
                            $highlightContainer.addClass("show-menu");
                            if (highlightData.smallButtons) {
                                $highlightContainer.addClass("small-buttons");
                            }
                        }
                        if (highlightData.topButtons) {
                            this._adjustButtonPosition($highlighter);
                        }
                    }
                }
            }
        }
    }

    public _adjustButtonPosition($highlighter: JQuery<HTMLElement>) {
        const $topBtns = $highlighter.find(".top-buttons");
        $topBtns.removeClass("hide");
        $topBtns.draggable({
            handle: ".drag-handle"
        });
        const $highlightContainer = $(".highlighter-container", $highlighter);
        const leftMargin = $highlightContainer.css("margin-left");
        $topBtns.css({
            left: $highlightContainer.css("left"),
            top: $highlightContainer.css("top")
        });
        if (leftMargin) {
            $topBtns.css("margin-left", leftMargin);
        }
    }

    public clearHighlighter(evt: JQueryEventObject) {
        const $btn = $(evt.target);
        const $compContainer = $btn.closest(".comp-type-highlighter");
        const $highlighter = $compContainer.find(".highlighter-container");
        $highlighter.find(".lrn_clear").trigger("click");
    }

    public undoHighlighter(evt: JQueryEventObject) {
        const $btn = $(evt.target);
        const $compContainer = $btn.closest(".comp-type-highlighter");
        const $highlighter = $compContainer.find(".highlighter-container");
        $highlighter.find(".lrn_undo").trigger("click");
    }

    public redoHighlighter(evt: JQueryEventObject) {
        const $btn = $(evt.target);
        const $compContainer = $btn.closest(".comp-type-highlighter");
        const $highlighter = $compContainer.find(".highlighter-container");
        $highlighter.find(".lrn_redo").trigger("click");
    }

    public onCustomComponentRendered() {
        this.hidePreviousQuestion();
        this.scrollToQuestionInView();
        this.hideEmptyComponentsContainer();
    }

    public replayAnimation(event: JQuery.Event): void {
        const queID = $(event.target).data("id");
        const queAnimData = this.animationData.filter((data) => data.questionID == queID);
        this.createJSHelper.initAnimation(queAnimData[0].animationName);
    }

    public bindComponentChangeEvent(currentCompID: number): void {
        const comp = this.model.getComponentByID(currentCompID);
        if (comp.type == "learnosity" &&
            (comp.validate || this._isLastQuesToBeValidated(comp) || this._isChangeToBeValidated(comp))) {
            this.bindLearnosityQuestionChangeEvent(comp.id);
        } else if ((comp.validate || this._isChangeToBeValidated(comp)) && comp.type == "custom") {
            this.bindCustomPlayerChangeEvent(comp.id, comp);
        }
    }

    public bindLearnosityQuestionChangeEvent(compID: number): void {
        let hasNoValue = true;
        const itemsApp = window.itemsApp;
        if (!itemsApp) {
            this._oldComponentIndex.push(compID);
            return;
        }
        const item = itemsApp.getItems();
        const $component = this.$(".component" + compID);
        const $items = $(".learnosity-item", $component);
        for (const currItem of $items) {
            const $item = $(currItem);
            const referenceId = $item.data("reference");
            // tslint:disable-next-line:no-string-literal
            let responseIds = item[referenceId]["response_ids"];
            // const compID = parseInt($item.closest(".component-wrapper").attr("data-compID"), 10);
            responseIds = typeof responseIds === "string" ? [responseIds] : responseIds;
            for (const response of responseIds) {
                const question = itemsApp.question(response);
                const currComp = this.model.getComponentByID(compID);
                if (currComp.validate && question.checkValidation().has_validation) {
                    question.on("changed", () => {
                        hasNoValue = true;
                        const questionType = itemsApp.question(response).getQuestion().type;
                        let quesResponse = itemsApp.question(response).getResponse().value;
                        // tslint:disable-next-line:max-line-length
                        quesResponse = (typeof quesResponse === "string" || typeof quesResponse === "object") ? [quesResponse] : quesResponse;
                        switch (questionType) {
                            case "simplechart":
                                hasNoValue = !this.chartHasValue(quesResponse);
                                break;
                            case "graphplotting":
                                hasNoValue = !this.graphHasValue(quesResponse);
                                break;
                            default:
                                if (currComp.validateAll) {
                                    hasNoValue = this._checkAllValues(quesResponse);
                                } else {
                                    for (const que of quesResponse) {
                                        if (Array.isArray(que)) {
                                            for (const resp of que) {
                                                if (resp != null && resp !== "") {
                                                    hasNoValue = false;
                                                    break;
                                                }
                                            }
                                        } else if (que != null && que !== "") {
                                            hasNoValue = false;
                                            break;
                                        }
                                    }
                                }
                        }

                        if (hasNoValue == false) {
                            this.$(".component" + compID + " .validate").removeClass("hide").removeAttr("disabled");
                            this.$(".component" + compID + " .show-answer").addClass("hide");
                        } else {
                            this.$(".component" + compID + " .show-answer").addClass("hide");
                            this.$(".component" + compID + " .validate").removeClass("hide").attr("disabled", "disabled");
                        }
                    });
                } else if (this._isLastQuesToBeValidated(currComp)) {
                    question.on("changed", () => {
                        if (!this.lastQuestionUpdated) {
                            this.lastQuestionUpdated = true;
                            this.trigger("last-question-updated");
                        }
                    });
                } else if (this._isChangeToBeValidated(currComp)) {
                    question.on("changed", () => {
                        if (!$component.hasClass("changed")) {
                            $component.addClass("changed");
                            this.enableNextOnValidation();
                        }
                    });
                }
            }
        }
    }

    public _checkAllValues(quesResponse: any): boolean {
        let hasNoValue = false;
        for (const que of quesResponse) {
            if (Array.isArray(que)) {
                for (const resp of que) {
                    if (resp == null || resp === "") {
                        hasNoValue = true;
                        break;
                    }
                }
            } else {
                if (que == null || que === "") {
                    hasNoValue = true;
                    break;
                }
            }
        }
        return hasNoValue;
    }

    public _isLastQuesToBeValidated(component: Component) {
        return this.model.validateLastQuestion && this._isLastComponent(component);
    }

    public _isHighlighter(component: Component) {
        return component.type === "highlighter";
    }

    public onHighlighterChange(evt: JQueryEventObject) {
        const $highlighterItem = $(evt.target).closest(".highlighter-container");
        $(".highlight-show-me-btn", $highlighterItem).removeAttr("disabled");
        if (!$highlighterItem.hasClass("changed") && !$highlighterItem.hasClass("hide-show-me")) {
            $highlighterItem.addClass("changed");
            this.enableNextOnValidation();
        }
    }

    public onHighlighterMove(evt: JQueryEventObject) {
        evt.preventDefault();
    }

    public _isLastComponent(component: Component) {
        const isLastPage = (this.model.currentPageIndex == this.model.pages.length - 1);
        const maxQuestionID = this.model.getMaxQuestionIDInPage(this.model.currentPageIndex);
        return isLastPage && maxQuestionID === component.questionID;
    }

    public bindCustomPlayerChangeEvent(compID: number, comp: Component): void {
        const customPlayerView = this.customPlayerViews[compID];
        if (customPlayerView !== void 0) {
            this.listenTo(customPlayerView, "changed", () => {
                this.onCustomComponentChange(comp, compID);
            });
        }
    }

    public onCustomComponentChange(comp: Component, compID: number) {
        if (comp.validate) {
            if (!this.$(".component" + compID + " .tryAgain").hasClass("hide")) {
                this.$(".component" + compID + " .tryAgain").addClass("hide");
                this.$(".component" + compID + " .show-answer").addClass("hide");
                this.$(".component" + compID + " .validate").removeClass("hide").removeAttr("disabled");
            } else {
                this.$(".component" + compID + " .validate").removeClass("hide").removeAttr("disabled");
            }
        } else if (comp.validateChange) {
            const $compEl = this.$(".component" + compID);
            if (!$compEl.hasClass("changed")) {
                $compEl.addClass("changed");
                this.enableNextOnValidation();
            }
        }
    }

    public chartHasValue(quesResponse: any): boolean {
        if (quesResponse.data && quesResponse.data.length) {
            for (const response of quesResponse.data) {
                if (response.interactive) {
                    return true;
                }
            }
        } else if (quesResponse[0].data && quesResponse[0].data.length) {
            for (const response of quesResponse[0].data) {
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
        if (this.animationInFirstQue) {
            this.createJSHelper.initAnimation(this.animationData[0].animationName);
        }
        if (this.model.getComponentByID(0).validate) {
            this.trigger("disable-next");
        }
    }

    public renderValidateButton(): void {
        let hasNoValue = true;
        const itemsApp = window.itemsApp;
        const item = itemsApp.getItems();
        const $item = this.$el.find("#question" + this.model.currentQuestionIndex).find(".learnosity-item");
        const referenceId = $item.data("reference");
        if (item[referenceId] && item[referenceId].response_ids) {
            let responseIds = item[referenceId].response_ids;
            responseIds = typeof responseIds === "string" ? [responseIds] : responseIds;
            for (const response of responseIds) {
                const question = itemsApp.question(response);
                const questionsData = this.model.questionsData.filter((data) => data.id == this.model.currentQuestionIndex);
                if (questionsData[0] && questionsData[0].validate && question.checkValidation().has_validation) {
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
                            this.$("#question" + this.model.currentPageIndex + " .validate").removeClass("hide").removeAttr("disabled");
                        } else {
                            this.$("#question" + this.model.currentPageIndex + " .validate").removeClass("hide")
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
        this.$el.find(".validate span").html(this.model.locTextData.checkBtnText);
        this.$el.find(".show-answer span").html(this.model.locTextData.showBtnText);
        this.$el.find(".continue-align").html(this.model.locTextData.contBtnText);
        this.$el.find(".finish-btn-text").html(this.model.locTextData.finishBtnText);
        this.$el.find(".replay").html(this.model.locTextData.replayBtnText);
        this.$el.find(".saveBtn").html(this.model.locTextData.saveBtnText);
        this.$el.find(".tryAgain span").html(this.model.locTextData.tryAgainText);
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

    public playAnimation(index: number): void {
        if (this.hasAnimation) {
            this.createJSHelper.initAnimation(this.animationData[index].animationName);
        }
    }

    public initializeStoryBookPlayer() {
        const storyBookPlayerData = this.model.getStoryBookData();
        this.trigger("disable-next");
        this.hideFooterElems();
        /*define configuration options for storyboard player*/
        const configOpts = {
            allow_tts: true,
            image_location: "https://static.bigideasmath.com/protected/content/storybook/resources/images",
            json_location: "https://static.bigideasmath.com/protected/content/storybook/resources/json/stories.json",
            language: this.model.currentLanguage == Language.ENGLISH ? "e" : "s",
            storyCompleteCallback: this.storyCompleteCallback.bind(this),
            storyboard_key: storyBookPlayerData.key,
            target_id: "storyboard-player"
        };

        // Initialize story board player
        BIMStories.storyboard = new BIMStories.BimStoryBoard(configOpts);
    }

    public muteStoryBookAudio(mute: boolean) {
        if (this.model.hasStoryBook) {
            BIMStories.storyboard.toggleAudioVolume(Number(!mute));
        }
    }

    public playStoryBookAudio() {
        if (this.model.hasStoryBook) {
            const player = $("#bim-f-audio-player")[0] as HTMLAudioElement;
            player.play();
        }
    }

    public pauseStoryBookAudio() {
        if (this.model.hasStoryBook) {
            const player = $("#bim-f-audio-player")[0] as HTMLAudioElement;
            player.pause();
        }
    }

    public toggleStoryBookLanguage() {
        if (this.model.hasStoryBook) {
            const lang = this.model.currentLanguage == Language.ENGLISH ? "e" : "s";
            BIMStories.storyboard.changeLanguage(lang);
        }
    }

    public hideFooterElems() {
        $("#main-player-container").addClass("hide-footer-elems");
    }

    public hideFooter() {
        $("#main-player-container").addClass("hide-footer");
    }

    public showFooter() {
        $("#main-player-container").removeClass("hide-footer");
    }

    public showFooterElems() {
        $("#main-player-container").removeClass("hide-footer-elems");
    }

    public showHighlightAnswer(evt: JQueryEventObject) {
        const $btn = $(evt.target);
        const $highlighter = $btn.closest(".highlighter-container");
        const $compContainer = $highlighter.closest(".comp-type-highlighter");
        $highlighter.addClass("display-answer");
        $compContainer.find(".top-buttons").addClass("hide");
        $btn.hide();
        const answerFn = $highlighter.attr("answerfn");
        if (answerFn) {
            window.BIL.CustomJS[answerFn](this, $highlighter, this.getHighlighterSavedData($highlighter));
        }
        if (!$highlighter.hasClass("changed") && !$highlighter.hasClass("hide-show-me")) {
            $highlighter.addClass("changed");
            this.enableNextOnValidation();
        }
    }

    private getHighlighterSavedData($elem: JQuery<HTMLElement>) {
        const key = $elem.attr("fetchkey");
        if (key) {
            return this.model.savedData[key];
        }
        return {};
    }

    private addCustomStyleOverride(): void {
        if (this.model.useCustomStyle) {
            // To do move this on init and load once.
            const url = "./css/exploration.css";
            $("head").append("<link type='text/css' rel='stylesheet' href='" + url + "'>");
        }
        if (this.model.useLargerFont) {
            $("#main-player-container").addClass("larger-font");
        }
    }

    private addCustomScript(): void {
        if (this.model.useCustomScript) {
            const url = "./js/exploration.js";
            const scriptTag: HTMLScriptElement = document.createElement("script");
            scriptTag.type = "text/javascript";
            scriptTag.onload = this.onScriptLoaded.bind(this);
            scriptTag.onerror = this.onScriptLoadFailed.bind(this);
            scriptTag.async = false;
            $("head").append(scriptTag);
            scriptTag.src = url;
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

    private storyCompleteCallback() {
        if (this.model.currentQuestionIndex === 0) {
            this.showFooterElems();
            this.trigger("enable-next");
        }
    }

    private saveComponentData(data: any, questionIdx?: number) {
        switch (data.type) {
            case "desmos":
                this.saveDesmosData(data);
                break;
            case "custom":
                this.saveCustomData(data);
                break;
            case "image":
                Utilities.logger.info(data);
                this.saveImageData(data);
                break;
            case "animation":
                this.saveAnimationData(data);
                break;
            case "highlighter":
                this.saveHighlighterData(data);
        }
    }

    private saveImageData(data: any) {
        const imgSrc = Utilities.getImageSource(data.imgID);
        data.ImgSrc = (imgSrc) ? imgSrc : Utilities.getImageSource(data.imgID, this.model.currentLanguage);
    }

    private saveDesmosData(data: any) {
        switch (data.desmosType) {
            case "calculator":
            case "geometry": {
                this.desmosData.push({
                    compID: data.id,
                    desmosSettings: data.settings,
                    desmosType: data.desmosType,
                    desmosURL: data.desmosURL,
                    questionID: data.questionID,
                    showMe: data.showMe
                });
            }
        }
    }

    private saveHighlighterData(data: any) {
        this.highlighterData.push({
            altText: data.altText,
            ansAltText: data.ansAltText,
            answer: data.answer,
            compID: data.id,
            isMenubarShown: data.isMenubarShown,
            key: data.key,
            questionID: data.questionID,
            showAnswerFn: data.showAnswerFn,
            smallButtons: data.smallButtons,
            topButtons: data.topButtons
        });
    }

    private saveCustomData(data: any) {
        this.customData.push({
            compID: data.id,
            dataReference: data.dataReference,
            fetchData: data.fetchData,
            key: data.key,
            questionID: data.questionID,
            saveData: data.saveData,
            subType: data.subType
        });
    }

    private saveAnimationData(data: any) {
        this.hasAnimation = true;
        this.animationData.push({
            altText: data.accText,
            animationName: data.animationName,
            compID: data.id,
            questionID: data.questionID
        });
    }
    // tslint:disable-next-line:max-file-line-count
}
