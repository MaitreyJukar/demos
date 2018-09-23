import * as Handlebars from "handlebars";
// tslint:disable-next-line:no-import-side-effect
import "../../common/helper/handlebars-helpers";
import * as PopupModelPckg from "./../../../src/common/components/popup/src/models/popup";
import * as PopupMgrPckg from "./../../../src/common/components/popup/src/popup-mgr";
import * as FooterPkg from "./../../common/k-5-components/footer/src/models/footer-model";
import { FooterView } from "./../../common/k-5-components/footer/src/views/footer-view";

import * as TooltipPkg from "./../../common/components/tooltip/src/models/tooltip-model";
import { ToolTip } from "./../../common/components/tooltip/src/views/tooltip-view";
import * as PreloaderPkg from "./../../common/helper/preloader";
import { Language, LocalizedData, PromiseWrapper, Utilities } from "./../../common/helper/utilities";
import * as PlayerModelPkg from "./../k-5-player/src/k-5-player-model";
import * as BasePlayerViewPkg from "./../k-5-player/src/k-5-player-view";

import * as InitPlayerPkg from "./../k-5-player/src/init-player";
import PlayerAttributes = PlayerModelPkg.BasePlayerAttributes;
import PlayerModel = PlayerModelPkg.BasePlayerModel;
import PlayerView = BasePlayerViewPkg.BasePlayerView;
// import { PlayerAttributes, PlayerModel } from "./src/player-model";
// import { PlayerView } from "./src/player-view";

export interface ExtWindow extends Window {
    LoadState: any;
    execute(): any;
}

declare const window: ExtWindow;

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;
const partialTemplates: { [x: string]: HandlebarsTpl } = {
    animation: require("./../k-5-player/tpl/partials/components/animation.hbs") as HandlebarsTpl,
    controls: require("./../k-5-player/tpl/partials/components/controls.hbs") as HandlebarsTpl,
    custom: require("./../k-5-player/tpl/partials/components/custom.hbs") as HandlebarsTpl,
    desmos: require("./../k-5-player/tpl/partials/components/desmos.hbs") as HandlebarsTpl,
    highlighter: require("./../k-5-player/tpl/partials/components/highlighter.hbs") as HandlebarsTpl,
    html: require("./../k-5-player/tpl/partials/components/html.hbs") as HandlebarsTpl,
    image: require("./../k-5-player/tpl/partials/components/image.hbs") as HandlebarsTpl,
    learnosity: require("./../k-5-player/tpl/partials/components/learnosity.hbs") as HandlebarsTpl,
    storybook: require("./../k-5-player/tpl/partials/components/storybook.hbs") as HandlebarsTpl
};

export declare class KeyValue {
    [id: string]: any;
}

export interface BrowserDetect {
    name: string;
    os: string;
    version: string;
}

const { detect } = require("detect-browser");
const browser: BrowserDetect = detect();
const pageTemplate: (attr?: KeyValue) => string = require("./../k-5-player/tpl/partials/page.hbs");
const questionTemplate: (attr?: KeyValue) => string = require("./../k-5-player/tpl/partials/question.hbs");
const componentTable: (attr?: KeyValue) => string = require("./../k-5-player/tpl/partials/componentTable.hbs");
const controlsTemplate: (attr?: KeyValue) => string = require("./../k-5-player/tpl/partials/controls.hbs");
const popupData: PopupMgrPckg.Attributes = require("./../../common/components/popup/data/json/popup.json");
export class Player extends InitPlayerPkg.PlayerInit {
    public executeCallPromise: PromiseWrapper<{}>;
    public executeReadyPromise: PromiseWrapper<{}>;
    public preloader: PreloaderPkg.Preloader;
    public playerModel: PlayerModel;
    public playerView: PlayerView;
    public playerJSON: any = {};
    public localizedData: any = {};
    public footer: FooterView;
    public tooltip: ToolTip;
    public currentLanguage: Language = Language.ENGLISH;
    public explorationTitle = {
        en: "Start Exploration",
        es: "S - Start Exploration"
    };
    public languagesAvailable: string[] = [];
    public naPopup: PopupMgrPckg.PopupManager;
    private initialPlayClicked = false;
    public loadPlayer(playerData: PlayerModelPkg.PlayerData, opts?: any) {
        if (opts && opts.preloader) {
            this.preloader = opts.preloader;
            this.languagesAvailable = opts.languagesAvailable;
            this.currentLanguage = opts.langToLoad;
        }
        if (browser) {
            $("body").addClass(browser.name);
        }
        this.initPromises();
        this.registerTemplateHelpers();
        this.initExplorationLocalization(playerData);
        this.parseJSON(playerData);
        this.renderFooter(playerData);
        this.createLanguageView(this.currentLanguage);
        this.initializePopupManager();
        this.showLanguageView(this.currentLanguage);
        this.attachFooterEvents();
        // this.attachTooltipEvents();
        // execute();
        window.LoadState.DOMReady = true;
        this.executeCallPromise.resolve();
        /* this.executeReadyPromise.resolve(); */
    }

    public initPromises() {
        this.executeReadyPromise = new PromiseWrapper();
        this.executeCallPromise = new PromiseWrapper();
        Promise.all([this.executeReadyPromise, this.executeCallPromise]).then((datas) => {
            Utilities.logger.log("Both promises ready! calling execute");
            window.execute();
        }, (err) => {
            Utilities.logger.warn("[Something went wrong] Unable to call execute method", err);
        }).catch((err) => {
            Utilities.logger.warn("[Something went wrong] Unable to call execute method", err);
        });
        if (typeof window.execute === "function" && typeof window.LoadState.exeWrapper.origExecute === "function") {
            Utilities.logger.log("execute function found");
            this.executeReadyPromise.resolve();
        } else {
            Utilities.logger.warn("[Not a function] execute not a function waiting for lrn script to load..");
            $("script#lrn-script")[0].onload = this.executeReadyPromise.resolve;
            $("script#lrn-script")[0].onerror = this.executeReadyPromise.reject;
        }
    }

    public createLanguageView(language: string): void {
        const data = this.playerJSON[language];
        const $container = $("<div/>", {
            class: "player-container",
            id: language
        });
        $("#main-player-container .players-container").append($container);
        const playerModel: PlayerModel = new PlayerModel(data, language);
        const playerView: PlayerView = new PlayerView({
            el: $container,
            model: playerModel
        });
        playerView.attachListener("disable-next", () => {
            this.footer.disableNextBtn();
        });
        playerView.attachListener("last-question-reached", () => {
            this.footer.onLastQuestionReached();
        });
        playerView.attachListener("last-question-validated", () => {
            this.footer.onLastQuestionValidated();
        });
        playerView.attachListener("last-question-updated", () => {
            this.footer.onLastQuestionUpdated();
        });
        playerView.loadPlayer();
        playerView.attachListener("caption-changed", (caption) => {
            this.footer.setCaption(caption);
        });
        playerView.attachListener("start-audio", (view) => {
            this.footer.playAudio();
        });
        playerView.attachListener("lrn-loaded-on-reset", (view) => {
            if (this.getCurrentView() !== view) {
                view.$el.hide();
            } else {
                this.preloader.hide(() => {
                    this.footer.onLoadingAfterRefresh();
                    this.footer.playAudio();
                    this.getCurrentView().playAnimation(0);
                    $("#refresh").removeAttr("disabled");
                });
            }
        });
        playerView.attachListener("audio-completed", (view) => {
            this.footer.renderPlayIcon();
        });
        playerView.attachListener("exploration-audio-completed", (view) => {
            this.footer.onAudioCompleted();
        });
        playerView.attachListener("pause-audio", (view) => {
            this.footer.renderPauseIcon();
        });
        playerView.attachListener("show-preloader", () => {
            this.preloader.show();
        });
        playerView.attachListener("current-audio-played", (audioId) => {
            if (this.footer.isAudioMuted()) {
                this.getCurrentView().muteCurrentAudio();
            }
        });
        playerView.attachListener("enable-next", () => {
            this.footer.enableNextBtn();
        });
        playerView.attachListener("stop-audio", () => {
            this.footer.stopAudio();
        });

        this.playerModel = playerModel;
        this.playerView = playerView;
    }

    public initExplorationLocalization(playerData: PlayerAttributes): void {
        for (const lang of this.languagesAvailable) {
            this.localizedData[lang] = playerData[lang];
        }
    }

    public showLanguageView(language: Language): void {
        if (this.playerView) {
            const playerView = this.playerView;
            // this.forEachView((view) => {
            if (language !== this.playerView.model.currentLanguage) {
                this.playerView.$el.hide();
                this.playerView.stopAudio();
                Utilities.logger.info("hiding:", this.playerView.model.currentLanguage);
            }
            // });
            playerView.stopAudio();
            if (this.initialPlayClicked) {
                this.footer.renderPlayIcon();
                this.footer.onTogglePlay();
            }
            playerView.setCaption();
            playerView.$el.show();
        }
    }

    public onLanguageChange(): void {
        this.showLanguageView(this.currentLanguage);
        $("html").attr("lang", this.currentLanguage);
        this.naPopup.setLanguage(this.currentLanguage);
        const title = this.explorationTitle[this.currentLanguage];
        $("#start-exploration").attr({
            "aria-label": title,
            "title": title
        });
    }

    public parseComponents(componentsArray: PlayerModelPkg.Component[][], lang: string):
        PlayerModelPkg.Component[][] {
        for (const components of componentsArray) {
            for (let comp of components) {
                if (comp.type == "layout") {
                    comp.components = this.parseComponents(comp.components, lang);
                } else {
                    comp = this.getTypeData(comp, lang);
                }
            }
        }
        return componentsArray;
    }

    public parseJSON(playerData: PlayerModelPkg.PlayerData): void {
        for (const lang of this.languagesAvailable) {
            const playerJSON = $.extend(true, {}, playerData.common);
            for (const page of playerJSON.pages) {
                page.components = this.parseComponents(page.components, lang);
            }

            for (const data of playerJSON.questionsData) {
                data.audioID = (data.audioID) ? data.audioID : null;
                data.caption = this.getLocalizedData(data.caption, lang);
            }
            if (playerJSON.additionalInfo) {
                playerJSON.additionalInfo.title = this.getLocalizedData(playerJSON.additionalInfo.title, lang);
                playerJSON.additionalInfo.content = this.getLocalizedData(playerJSON.additionalInfo.content, lang);
                if (playerJSON.additionalInfo.image) {
                    playerJSON.additionalInfo.image.altText = this.getLocalizedData(playerJSON.additionalInfo.image.altText, lang);
                    if (playerJSON.additionalInfo.postImgContent) {
                        playerJSON.additionalInfo.postImgContent = this.getLocalizedData(playerJSON.additionalInfo.postImgContent, lang);
                    }
                }
                if (playerJSON.additionalInfo.audioID) {
                    playerJSON.additionalInfo.audioID =
                        (playerJSON.additionalInfo.audioID) ? playerJSON.additionalInfo.audioID : null;
                }
            }
            this.playerJSON[lang] = playerJSON;
        }
    }

    public getTypeData(comp: PlayerModelPkg.Component, lang: string): PlayerModelPkg.Component {
        if (comp.type == "html") {
            comp.innerHTML = this.getLocalizedData(comp.innerHTML, lang);
        } else if (comp.type == "desmos") {
            comp.desmosURL = this.getLocalizedData(comp.desmosURL, lang);
        } else if (comp.type == "image") {
            comp.altText = this.getLocalizedData(comp.altText, lang);
        }
        return comp;
    }

    public getLocalizedData(elementID: string, lang: string): string {
        const data = this.localizedData[lang].localized_data[elementID];
        return data;
    }

    public getCurrentView() {
        return this.playerView;
    }

    /**
     * Plays audio from footer and triggers handler for all player views.
     * @param event Button clicked event Obj.
     */
    public playInitialAudio(event: JQuery.Event<HTMLButtonElement>) {
        Utilities.logger.info("ipad-play-btn clicked");
        this.footer.playAudio();
        this.completeInitialization(event);
    }

    public initializeStoryBookPlayer(event: JQuery.Event<HTMLButtonElement>) {
        this.footer.playAudio();
        this.completeInitialization(event);
        this.playerView.initializeStoryBookPlayer();
    }

    public completeInitialization(event: JQuery.Event<HTMLButtonElement>) {
        this.footer.$(".hide-on-start").removeClass("hide-on-start");
        // this.forEachView((view) => {
        this.playerView.onIpadPlayBtnClicked(event);
        // });
        this.initialPlayClicked = true;
    }

    public audioMissingFallback(event: JQuery.Event<HTMLButtonElement>) {
        Utilities.logger.info("ipad-play-btn clicked");
        Utilities.logger.warn("[Audio missing]");
        this.footer.$(".hide-on-start").removeClass("hide-on-start");
        this.playerView.onIpadPlayBtnClicked(event);
        this.initialPlayClicked = true;
    }

    /**
     * Initilizes popupup manager.
     */
    private initializePopupManager() {
        const langs: string[] = [];
        for (const lang in Language) {
            if (Language.hasOwnProperty(lang) && typeof Language[lang] === "string") {
                langs.push(Language[lang]);
            }
        }
        popupData.availableLangs = langs;
        const popupLocData: PopupMgrPckg.LocData = {
            langs: {
                en: [
                    {
                        buttonLables: [
                            LocalizedData.playerLocDataEnglish.popup["button-lable1"]
                        ],
                        text: LocalizedData.playerLocDataEnglish.popup.text
                    }
                ],
                es: [
                    {
                        buttonLables: [
                            LocalizedData.playerLocDataEspanol.popup["button-lable1"]
                        ],
                        text: LocalizedData.playerLocDataEspanol.popup.text
                    }
                ]
            }
        };
        popupData.localizationData = popupLocData;
        this.naPopup = new PopupMgrPckg.PopupManager(popupData);
        this.naPopup.on("state-changed", (event, data) => {
            if (data.popupView.model.state == PopupModelPckg.eState.HIDDEN) { // Compare it with proper enum
                $("#language-button").focus();
            }
        });
    }

    private registerTemplateHelpers() {
        Handlebars.registerHelper("componentsTpl", this.componentHelper);
        Handlebars.registerHelper("controlsTpl", this.controlHelper);
        Handlebars.registerHelper("componentTable", this.componentTableHelper);
        Handlebars.registerHelper("pageTpl", this.pagesHelper);
    }

    private controlHelper(data: any, opts: any) {
        const componentId = "k-5-player";
        data.validateBtnText = Utilities.getLocText(this.currentLanguage, componentId, "check-button");
        return controlsTemplate(data);
    }

    private pagesHelper(data: any, opts: any) {
        data.idx = opts.data.index;
        return pageTemplate(data);
    }

    private componentHelper(data: any, questionIdx: number) {
        if (partialTemplates[data.type]) {
            data.idx = questionIdx;
            return partialTemplates[data.type](data);
        } else {
            Utilities.logger.warn("Unknown partial Template found with name:", data.nodeType);
            return "";
        }
    }

    private componentTableHelper(data: any, opts: any) {
        data.idx = opts.data.index;
        return componentTable(data);
    }

    private questionHelper(data: any, opts: any) {
        data.idx = opts.data.index;
        return questionTemplate(data);
    }

    private renderFooter(playerData: PlayerAttributes) {
        const $footerContainer = $("<footer id=\"footer-container\"></footer>");
        $("#main-player-container").append($footerContainer);
        const audioID = this.playerJSON[this.currentLanguage].questionsData.filter((data:
            PlayerModelPkg.QuestionData) => data.id == 0)[0].audioID;
        const enableDoneOnAudioEnd = playerData.common.enableDoneOnAudioEnd != null ? playerData.common.enableDoneOnAudioEnd : true;
        const validateLastQuestion = !!playerData.common.validateLastQuestion;
        const footerModel = new FooterPkg.FooterModel({
            audioID: audioID + "_" + this.currentLanguage,
            enableDoneOnAudioEnd,
            lang: this.currentLanguage,
            languagesAvailable: this.languagesAvailable,
            type: FooterPkg.FooterTypes.multi,
            validateLastQuestion
        });
        this.footer = new FooterView({
            el: $footerContainer,
            model: footerModel
        });
    }

    private showLangNApopup() {
        this.naPopup.showPopupById("lang-na");
    }

    private attachFooterEvents() {
        this.listenTo(this.footer, FooterPkg.EVENTS.MUTE, () => {
            const currView = this.getCurrentView();
            this.footer.model.audioID = currView.getCurrentQuestionAudioID();
            currView.muteCurrentAudio();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.UNMUTE, () => {
            const currView = this.getCurrentView();
            this.footer.model.audioID = currView.getCurrentQuestionAudioID();
            currView.unmuteCurrentAudio();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.PLAY, () => {
            const currView = this.getCurrentView();
            this.footer.model.audioID = currView.getCurrentQuestionAudioID();
            currView.playCurrentAudio();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.PAUSE, () => {
            const currView = this.getCurrentView();
            currView.pauseCurrentAudio();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.STOP, () => {
            const currView = this.getCurrentView();
            currView.stopAudio();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.SHOW_CAPTION, () => {
            const currView = this.getCurrentView();
            currView.reducePlayerHeight();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.CHANGE_LANG, () => {
            const currView = this.getCurrentView();
            this.currentLanguage = this.footer.model.currentLanguage;
            this.updateAudioLanguage();
            currView.toggleStoryBookLanguage();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.HIDE_CAPTION, () => {
            const currView = this.getCurrentView();
            currView.expandPlayerHeight();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.LANG_NA, () => {
            this.showLangNApopup();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.REFRESH, () => {
            this.footer.resetInitialState();
            this.playerView.$el.show();
            this.playerView.$(".player-wrapper").addClass("invisible");
            this.playerView.refreshAll();
            const language = this.footer.model.currentLanguage;
            this.playerView.setCaption();
            this.playerView.$(".player-wrapper").removeClass("invisible");
            window.LoadState.recentlyExecuted = false;
            window.execute();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.NEXT, () => {
            const currView = this.getCurrentView();
            currView.onNextClick();
        });
        this.listenTo(this.footer, FooterPkg.EVENTS.DONE, () => {
            const currView = this.getCurrentView();
            currView.onDoneClick();
        });
    }

    private updateAudioLanguage() {
        this.footer.stopAudio();
        this.getCurrentView().model.currentLanguage = this.currentLanguage;
    }

    private reloadPageOnLanguageChange(language: string): void {
        const currentUrl = window.location.href;
        const updatedUrl = this.updateQueryStringParameter(currentUrl, "lang", language);
        window.location.href = updatedUrl;
    }

    private updateQueryStringParameter(uri: string, key: string, value: string) {
        const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        const separator = uri.indexOf("?") !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, "$1" + key + "=" + value + "$2");
        } else {
            return uri + separator + key + "=" + value;
        }
    }

    /**
     * Callback to execute on each view.
     * If callback returns true, looping will be prevented.
     * @param cb Fired for each view.
     */
    // private forEachView(cb: (view: PlayerView) => any) {
    //     for (const view in this.playerViews) {
    //         if (this.playerViews.hasOwnProperty(view)) {
    //             if (cb(this.playerViews[view]) === true) {
    //                 break;
    //             }
    //         }
    //     }
    // }

}
