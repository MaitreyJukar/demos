import * as Backbone from "backbone";
import "jqueryui";
import HeaderView from "./header";
import * as Handlebars from "handlebars";
import BreadcrumbsView from "./breadcrumb";
import FooterView from "./footer";
import { animationEvent } from "./footer";
import { SideMenuView, MenuItemChunk } from "./side-menu";
import PageManagerView, { QuestionChangedData } from "./page-manager";
import { PageManagerModel, DataNode, DataNodesContainer } from "./../models/page-manager";
import { HeaderMenuModel, MenuItem } from "./../models/header-menu";
import { PanelDataList, PanelModel, eState, eTemplateType } from "./../models/panel";
import { PanelView } from "./../views/panel";
import { HeaderMenuView, HeaderMenuButtonClickedData, HeaderMenuIconicTextClickedData } from "./../views/header-menu";
import PlayerModel from "../models/player-model";
import MenuModel from "../models/item-model";
import SideMenuCollection from "../collections/side-menu";
import "../../css/animations.css";
import "../../css/main.css";
import "../../css/bookmarks-panel.css";
import "../../css/hbp-icons.css";
import * as KeplerCommunicationAPIPkg from "./../kepler-communication-api";
import * as _ from "underscore";
import * as InterfacePckg from "./../interfaces/communication-api-interface";
import * as VPCPckg from "./../models/video-player-controls";
import * as VPCModelPckg from "./../models/video-player-controls";
import { Utilities } from "../utilities";
import { KeplerEngine } from "../kepler_player";
import { SkillController } from "../models/skill-controls";
import { CustomEventMap } from "../popup-mgr";
import * as DialogModelPackg from "./../models/dialog";
import { Popup } from "../models/popup";
const { detect } = require('detect-browser');
const scrollIntoView = require('scroll-into-view');
const browser = detect();

const eTasks = InterfacePckg.eTasks;
const taskMap: { [id: string]: number } = {
    "kepler-training": eTasks.TRAINING,
    "kepler-video": eTasks.VIDEO,
    "kepler-assessment": eTasks.ASSESSMENT,
    "kepler-scratchpad": eTasks.SCRATCHPAD
};

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

declare class BookmarkMenuChunk {
    refid?: string;
    text?: string;
    title?: string;
    hash: string;
    tabs?: { hash: string; text: string; }[];
    pageNo: number;
}

declare var document: {
    [key: string]: any; // missing index defintion
}

export default class Player extends Backbone.View<PlayerModel> {
    public static KEPLER_VIDEO_DATA = {
        WIDTH: 1280,
        HEIGHT: 707.777778,
        MARGINS: 15,
        MAX_WIDTHS: {
            FULL: 725,
            "1366px": 676,
            "1024px": 520,
            "768px": 550,
            "568px": 350
        },
        MIN_SCALE_WIDTH: 901,
        MIN_SCALE_HEIGHT: 901
    };
    public static KEPLER_VIDEO_CLOSED_CAPTION_DATA = {
        FONT_SIZE: 20,
        LINE_HEIGHT: 16,
        PADDING: 20,
        TEXT_PADDING: 4,
        MIN_SCALE: 0.5,
    }
    public static KEPLER_SKILL_DATA = {
        MIN_SCALE_WIDTH: 901,
        MIN_SCALE_HEIGHT: 501
    };
    public static NODE_TYPE_KEPLER_WINDOW_SELECTOR: { [x: string]: string } = {
        "kepler-video-scratchpad": "kepler-window-scratchpad",
        "kepler-video": "kepler-window-video",
        "training": "kepler-window-training",
        "kepler-video-training": "kepler-window-training",
        "scratchpad": "kepler-window-scratchpad",
        "assessment": "kepler-window-assessment",
        "kepler-video-assessment": "kepler-window-assessment"
    };
    public static IFRAME_TARGET_MAP: { [x: string]: string } = {
        "kepler-scratchpad": "kepler-scratchpad",
        "kepler-video": "kepler-video",
        "kepler-assessment": "kepler-skill",
        "kepler-training": "kepler-skill"
    };
    public static HINT_DISPLAY_CLASSES = ["hide-hint", "show-hint"];

    private _skillWindow: JQuery<HTMLElement> = this.$(".kepler-window.kepler-window-skill");
    public get $skillWindow(): JQuery<HTMLElement> {
        if (this._skillWindow.length !== 0) {
            return this._skillWindow;
        } else {
            this._skillWindow = this.$(".kepler-window.kepler-window-skill");
            return this._skillWindow;
        }
    }

    private _scratchpadWindow: JQuery<HTMLElement> = this.$(".kepler-window.kepler-window-scratchpad");
    public get $scratchpadWindow(): JQuery<HTMLElement> {
        if (this._scratchpadWindow.length !== 0) {
            return this._scratchpadWindow;
        } else {
            this._scratchpadWindow = this.$(".kepler-window.kepler-window-scratchpad");
            return this._scratchpadWindow;
        }
    }

    public get $videoPlayerController(): JQuery<HTMLElement> {
        if (this.pageManagerView && this.pageManagerView.videoPlayerControler && this.pageManagerView.videoPlayerControler.$el) {
            return this.pageManagerView.videoPlayerControler.$el;
        } else {
            return this.$("#video-player-controls");
        }
    }
    public isVideoPlayerReady: boolean = false;
    public currScratchpadItem: string = "";
    public isScratchpadLoaded: boolean = false;
    public isVideoIFrameLoaded: boolean = false;
    public isSkillIFrameLoaded: boolean = false;
    public $audio: JQuery<HTMLAudioElement>;
    public headerView: HeaderView;
    public headerMenuView: HeaderMenuView;
    public breadcrumbsView: BreadcrumbsView;
    public footerView: FooterView;
    public sideMenu: SideMenuView;
    public pageManagerView: PageManagerView;
    public glossaryView: PanelView;
    public bookmarkView: PanelView;
    public bookmarksTpl: HandlebarsTpl = require("./../../tpl/bookmarks-panel.hbs");
    public bookmarkPanelState: eState;
    public currentKeplerTask: number;
    public keplerCommAPIVideo: InterfacePckg.CommunicationAPIInterface;
    public keplerCommAPISkill: InterfacePckg.CommunicationAPIInterface;
    public _isVideoStarted: boolean;
    public keplerLauncher = [
        this.launchTraining.bind(this),
        this.launchAssessment.bind(this),
        this.launchVideo.bind(this),
        this.launchScratchpad.bind(this),
    ];
    static _instance: Player;
    public static get Instance(): Player { return Player._instance; }

    private _audioPlayed: boolean = false;
    private setProgressIfReadBound: () => void = this.setProgressIfRead.bind(this);
    private _currentVideoJSONID: string;
    private _oldHash: string;
    private _videoPaused: boolean = false;
    private timer: number;
    private _lastSkillJsonId: string = "";
    private silentAudioBuffer: AudioBuffer;
    private loadIntCallback: Function = () => { };
    private launchableTrainingData: { target: string; event: JQuery.Event<EventTarget, null>; dataJson: string; useCustomTitle: boolean; } = null;
    private launchableAssessmentData: { target: string; event: JQuery.Event<EventTarget, null>; dataJson: string; useCustomTitle: boolean; } = null;
    private launchableVideoData: { target: string; event: JQuery.Event<EventTarget, null>; dataJson: string; useCustomTitle: boolean; } = null;

    constructor(attr?: Backbone.ViewOptions<PlayerModel>) {
        super(attr);
        this.initKeplerModules();
        this.isVideoIFrameLoaded = true;
        this.isSkillIFrameLoaded = true;
        this.handleResize();
    }

    /**
     * Initializes player and it's components.
     */
    initialize(attr?: any) {
        Player._instance = this;
        const throttledResizeHandler = _.throttle(this.handleResize.bind(this), 100);
        const throttledSkillResizeHandler = _.throttle(this.skillResizeHandler.bind(this), 100);
        $(window).resize(throttledResizeHandler);
        $(window).resize(throttledSkillResizeHandler);
        this.render();
        this._isVideoStarted = false;
        this.bookmarksTpl = require("./../../tpl/bookmarks-panel.hbs");
        /* this.initKeplerModules(); */
        this.headerView = new HeaderView();
        this.breadcrumbsView = new BreadcrumbsView();
        this.footerView = new FooterView();
        this.sideMenu = new SideMenuView();
        this.pageManagerView = new PageManagerView();
        this.initHeaderMenu()
            .initPanels()
            .initTooltips()
            .attachComponentEventListeners()
            .attachListeners();
        if ((/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))) {
            $(document).on(this.getVisibilityEvent(), this.handleVisibilityChange.bind(this));
        }
    }

    /**
     * Starts listening to footer, page-manager, side-menu, panels and header-menu's custom events.
     */
    public attachComponentEventListeners() {
        this.listenTo(this.footerView, "footer-ready", () => {
            $('.loader-wrapper').addClass("footer-ready");
            this.hidePreloader();
        });
        this.listenTo(this.pageManagerView, "page-ready", (videoNodeAvailable: boolean, dataVideoJson: string, dataAssessmentJson: string, dataTrainingJson: string) => {
            $('.loader-wrapper').addClass("page-ready");
            this._currentVideoJSONID = dataVideoJson;
            this.hidePreloader();
            if (videoNodeAvailable) {
                this.insertAudioIntoKepler();
            }
            if (dataAssessmentJson !== "") {
                this.insertAudioIntoKepler("iframe.kepler-assessment", dataAssessmentJson);
            }
            if (dataTrainingJson !== "") {
                this.insertAudioIntoKepler("iframe.kepler-training", dataTrainingJson);
            }
        });
        this.listenTo(this.pageManagerView, "hint-clicked", this.activateHintMode);
        this.listenTo(this.pageManagerView, "retry-clicked", this.onRetryButtonClicked);
        this.listenTo(this.pageManagerView, "help-clicked", this.onHelpButtonClicked);
        this.listenTo(this.pageManagerView, "question-changed", this.onkeplerSkillQuestionChange);
        this.listenTo(this.pageManagerView, "popup-button-clicked", this.onPopupBtnClicked);
        this.listenTo(this.pageManagerView, "dialog-button-clicked", this.onDialogBtnClicked);
        this.pageManagerView.popupMgr.on("state-changed", (eve, data) => {
            if (data.popupView.model.state === Popup.eState.HIDDEN) {
                this.$(".kepler-window button.back-button-wrapper:visible").focus();
            }
        });
        this.pageManagerView.dialogMgr.on("state-changed", (eve, data) => {
            if (data.dialogView.model.state === DialogModelPackg.eState.HIDDEN) {
                this.$("button.help-holder").removeClass("active-help");
                this.getLiveIframe(["video"]).closest(".kepler-window").find(".back-button-wrapper").focus();
            }
        });
        this.listenTo(this.sideMenu, "model-ready", (linkJson: SideMenuCollection) => {
            this.updateBookmarkList(linkJson.models);
            $('.loader-wrapper').addClass("side-menu-ready");
            this.hidePreloader();
        });
        this.listenTo(this.sideMenu, "page-updated", this.hideMainPanel.bind(this));
        this.listenTo(this.sideMenu, "side-menu-link-clicked", () => {
            this.showMainPanel();
        });
        this.listenTo(this.glossaryView, "main-panel-shown", () => {
            this.showMainPanel(true);
            this.$(".header-icons button.icon-glossary").focus();
        });
        this.listenTo(this.bookmarkView, "main-panel-shown", () => {
            this.showMainPanel(true);
            this.$(".header-icons button.icon-ellipses").focus();
        });
        this.listenTo(this.glossaryView, "panel-hidden", this.onGlossaryHidden.bind(this));
        this.listenTo(this.glossaryView, "panel-shown", this.onGlossaryShown.bind(this));
        this.listenTo(this.bookmarkView, "panel-hidden", () => {
            //this.$("#main-content-holder").show();
        });
        this.listenTo(this.bookmarkView, "panel-shown", () => {
            this.glossaryView.hide();
            //this.$("#main-content-holder").hide();
            this.pageManagerView.pauseVideo();
        });
        this.listenTo(this.headerMenuView, "menu-button-clicked", this.onHeaderMenuBtnClicked.bind(this));
        this.listenTo(this.headerMenuView, "menu-iconic-text-clicked", this.onHeaderMenuItemClicked.bind(this));
        this.headerMenuView.addListener("menu-hidden", (menu) => {
            this.$("button.icon-ellipses").removeClass("selected");
        });
        this.listenTo(this.footerView, "page-updated", this.hideMainPanel.bind(this));
        return this;
    }

    /**
     * Initializes all tooltips in player view.
     */
    public initTooltips() {
        this.$('[data-toggle="tooltip"]').tooltip().on("touchstart", function (event) {
            const timer = setTimeout(() => {
                $(event.currentTarget).tooltip("show");
            }, 750);
            $(this).off("touchend touchcancel").on("touchend touchcancel", function (event) {
                clearTimeout(timer);
                $(event.currentTarget).tooltip("destroy");
            });
        });
        return this;
    }

    /**
     * Initializes glossary and bookmarks panel.
     */
    public initPanels() {
        const glossaryPanelModel = new PanelModel<PanelDataList>({
            title: "Glossary",
            searchPlaceholderText: "Search Glossary",
            searchAccText: "Search Glossary",
            searchBtnAccText: "Search Glossary",
            closeBtnAccText: "Close Glossary"
        });
        this.glossaryView = new PanelView({
            model: glossaryPanelModel,
            el: "#glossary-container"
        });

        const bookmarkModel = new PanelModel<BookmarkMenuChunk>({
            title: "Bookmarks",
            icon: "bookmarked",
            templateType: eTemplateType.DELETABLE_LIST,
            templateFnc: this.bookmarksTpl,
            searchPlaceholderText: "Search Bookmarks",
            searchAccText: "Search Bookmarks",
            searchBtnAccText: "Search Bookmarks",
            closeBtnAccText: "Close Bookmarks"
        });
        this.bookmarkView = new PanelView({
            model: bookmarkModel,
            el: "#bookmarks-container"
        });
        this.bookmarkPanelState = eState.HIDDEN;
        return this;
    }

    /**
     * Initializes modules needed for kepler iframes.
     */
    initKeplerModules() {
        const videoKeplerEngine = new KeplerEngine();
        const skillKeplerEngine = new KeplerEngine();
        const taskDirPath = "../../content/" + this.model.appName + "/kepler-tasks/office16/";

        const videoDoc: any = this.$("iframe.kepler-video").contents().get(0);
        const videoWindow = videoDoc.defaultView;
        videoWindow.HBP = videoWindow.HBP || {};
        videoWindow.HBP.type = "kepler-video";
        videoWindow.HBP.LMSAPIModule = videoKeplerEngine;
        videoWindow.HBP.aContext = Utilities.getAudioContext();

        const skillDoc: any = this.$("iframe.kepler-skill").contents().get(0);
        const skillWindow = skillDoc.defaultView;
        skillWindow.HBP = skillWindow.HBP || {};
        skillWindow.HBP.type = "kepler-skill";
        skillWindow.HBP.LMSAPIModule = skillKeplerEngine;

        this.keplerCommAPIVideo = new KeplerCommunicationAPIPkg.KeplerCommunicationAPI(videoWindow, videoKeplerEngine, taskDirPath);
        this.keplerCommAPISkill = new KeplerCommunicationAPIPkg.KeplerCommunicationAPI(skillWindow, skillKeplerEngine, taskDirPath);

        this.pageManagerView.attachCommAPIEvents();
        this.keplerCommAPISkill.on("scoring-event", this.onKeplerSkillScoringEvent, this);

        if (Utilities.isTouchDevice()) {
            Utilities.disableBtn(this.pageManagerView.$(".node-main-content-container.kepler-video .play-icon button") as JQuery<HTMLButtonElement>);
            this.keplerCommAPIVideo.on("player-ready", (eve, oldEve) => {
                // For non-video pages landing case..
                let jsonId;
                if (!this._currentVideoJSONID) {
                    jsonId = "sample-audio-2";
                }
                this.insertAudioIntoKepler(void 0, jsonId, () => {
                    if (Utilities.getAudioContext() !== null) {
                        Utilities.loadAudioForAudioContext("./content/common/media/audio/1-second-of-silence.mp3")
                            .then((buffer) => {
                                this.isVideoPlayerReady = true;
                                this.silentAudioBuffer = buffer;
                                Utilities.enableBtn(this.pageManagerView.$(".node-main-content-container.kepler-video .play-icon button") as JQuery<HTMLButtonElement>);
                                console.info("Enabled...");
                                return buffer;
                            }, (reason) => {
                                this.isVideoPlayerReady = true;
                                console.warn("Failed to load audio, enabling anyway", reason);
                                Utilities.enableBtn(this.pageManagerView.$(".node-main-content-container.kepler-video .play-icon button") as JQuery<HTMLButtonElement>);
                            });
                    } else {
                        this.isVideoPlayerReady = true;
                        Utilities.enableBtn(this.pageManagerView.$(".node-main-content-container.kepler-video .play-icon button") as JQuery<HTMLButtonElement>);
                        console.info("Enabled...");
                    }
                });
            });
        }
        return this;
    }

    /**
     * Initializes header's ellipses menu.
     */
    initHeaderMenu() {
        const headerModel = new HeaderMenuModel({
            items: [{
                itemType: "button-group",
                text: "Text Size",
                percent: 100,
                percentChange: 25
            }, {
                itemType: "iconic-text",
                tagName: "div",
                accText: "Navigate to Glossary page",
                text: "Glossary",
                icon: "glossary",
                class: "glossary"
            }, {
                itemType: "iconic-text",
                tagName: "div",
                accText: "Navigate to Bookmarks page",
                text: "Bookmarks",
                icon: "bookmarked",
                class: "bookmark"
            }, {
                itemType: "iconic-text",
                tagName: "div",
                accText: "Print",
                text: "Print",
                icon: "print",
                class: "print"
            }, {
                itemType: "iconic-text",
                tagName: "div",
                accText: "Navigate to Help page",
                text: "Help",
                icon: "help",
                class: "help"
            }, {
                itemType: "iconic-text",
                tagName: "div",
                accText: "Reset usage",
                text: "Reset Usage",
                icon: "reset",
                class: "clear"
            }, {
                itemType: "iconic-text",
                tagName: "a",
                targetLink: this.model.signoutURL,
                accText: "Signout",
                text: "Signout",
                icon: "logout",
                class: "logout"
            }]
        });
        this.headerMenuView = new HeaderMenuView({
            className: "signout-menu",
            model: headerModel
        });
        return this;
    }

    /**
     * Inserts audio into kepler iframe only if current audio elem is not present.
     * @param sel string selector in current `el`.
     * @param jsonId string id by which audio to be appended.
     * @param canPlayCb Any function (optional) to attach on `canplay` | `loadedmetadata` event of recently appended audio.
     */
    insertAudioIntoKepler(sel = "iframe.kepler-video", jsonId = this._currentVideoJSONID, canPlayCb?: (data: any) => void) {
        const $audioElem = this.$(sel).contents().find("audio#" + jsonId);
        const eventName = (Utilities.getMobileDeviceType() === "iOS") ? "loadedmetadata" : "canplay";

        if ($audioElem.length === 0) {
            if (this.$(sel).contents().find("body").length) {
                const $audio = $("<audio preload='auto' class='hbp-sample-audio' id='" + jsonId + "'></audio>");
                this.$(sel).contents().find("body").append($audio);
                if (canPlayCb !== void 0) {
                    $audio.one(eventName, canPlayCb);
                }
                $audio.attr("src", "../../content/common/media/audio/1-second-of-silence.mp3");
            }
            else {
                console.warn("Kepler not ready");
            }
        } else {
            if (canPlayCb !== void 0) {
                $audioElem.one(eventName, canPlayCb);
            }
        }
    }

    render() {
        let template = require("../../tpl/player.hbs");
        this.$el.html(template(this.model.toJSON()));
        if (this.hasExtraPaddingAtBottom()) {
            this.$("#content").addClass("has-extra-padding");
        }

        if (browser) {
            $("body").addClass(browser.name);
        }
        if (Utilities.isTouchDevice()) {
            $("body").addClass("touch-device");
        }
        return this;
    }

    events() {
        return {
            "keydown .header-back *": "onHeaderbackElementsKeydown",
            "click .kepler-window-scratchpad .header-back button.help-holder": "onHelpButtonClicked",
            "click .header-icons button": "onHeaderIconClicked",
            "click #breadcrumbs-container a": "onBreadcrumbsLinkClicked",
            "click #bookmarks-container .item-text a": "onBookmarkItemClicked",
            "click .kepler-window .header-back button.back-button-wrapper": "hideKeplerIframes"
        };
    }

    /**
     * Handler for keydown event on back button.
     */
    onHeaderbackElementsKeydown(eve: JQuery.Event) {
        // For ctrl F2 key..
        if (eve && eve.ctrlKey && eve.which === 113) {
            console.info("Ctrl + F2: Focusing live iFrame..");
            this.getLiveIframe(["video"]).focus();
            eve.preventDefault();
        }
    }

    attachListeners() {
        this.listenTo(this, "routeChanged", this.onRouteChanged);
        this.listenTo(this, "activeModelChange", this.onActiveModelChange);
        this.listenTo(this, "resetHeaderIcon", this.headerView.selectHeaderButton);
        this.listenTo(this.pageManagerView, "launch-btn-clicked", this.onKeplerLaunchBtnClicked);
        this.listenTo(this.pageManagerView.skillCtrl.model, "change:mode", this.renderKeplerHintMode);
        this.$(".page-holder .icon-bookmark,.page-holder .icon-bookmarked").on("click", this.onIconClicked.bind(this));
        this.$(".side-menu-modal").on("click", this.headerView.toggleSideMenu);
        this.$el[0].addEventListener("scratchpad-ready", this.onScratchpadReady.bind(this));
        this.$el[0].addEventListener("focus-player", this.setFocusToPlayer.bind(this));
        this.$(".header-back .title-wrapper").on("scroll", (event: JQuery.Event) => {
            let $scrollElem = $(event.target);
            this.onScroll($scrollElem);
        });
        $(window).on("unload", this.setProgressIfReadBound);
        return this;
    }

    onScratchpadReady() {
        $('.loader-wrapper').addClass("scratchpad-ready");
        this.isScratchpadLoaded = true;
        if (!this.currScratchpadItem) {
            this.$(".kepler-window.kepler-window-scratchpad").css("display", "none").removeClass("show");
        } else {
            this.$(".kepler-window.kepler-window-scratchpad").removeClass("show");
            console.info("Scratchpad :", PlayerModel.INDEX_URLS.SCRATCHPAD + "#" + this.currScratchpadItem);
            this.$("iframe.kepler-scratchpad").attr("src", PlayerModel.INDEX_URLS.SCRATCHPAD + "#" + this.currScratchpadItem);
        }

        //this.$(".kepler-window.kepler-window-skill .wrapper-iframe").prepend("<iframe class=\"kepler-skill\" src=\"" + this.model.defaults().keplerSkillIframeUrl + "\" scrolling=\"no\"></iframe>");
        //this.$(".kepler-window.kepler-window-video #video-wrapper").prepend("<iframe class=\"kepler-video\" scrolling=\"no\" src=\"" + this.model.defaults().keplerVideoIframeUrl + "\" tabindex=\"-1\"></iframe>");
        /* this.initKeplerModules();
        this.isVideoIFrameLoaded = true;
        this.isSkillIFrameLoaded = true; */
        /* this.hidePreloader();
        if (this.launchableVideoData !== null) {
            this.launchVideo(this.launchableVideoData);
        }
        if (this.launchableAssessmentData !== null) {
            this.launchAssessment(this.launchableAssessmentData, this.loadIntCallback);
        }
        if (this.launchableTrainingData !== null) {
            this.launchTraining(this.launchableTrainingData, this.loadIntCallback);
        } */
    }

    setFocusToPlayer() {
        this.$(".back-button-wrapper:visible").focus();
    }

    /**
     * Handler for all kepler's launch button clicked event.
     * @param data containing target type, event obj, dataJson and custom title flag.
     */
    onKeplerLaunchBtnClicked(data: { target: string, event: JQuery.Event, dataJson: string, useCustomTitle: boolean }) {
        const $keplerWindow = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]).closest(".kepler-window");
        const $keplerIframe = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]);
        const dataTitle = this.getCurrentDataTitle();
        if (!data.useCustomTitle) $keplerWindow.find(".iframe-title").html(dataTitle);
        /* this.$(".main-section.node-kepler-video-scratchpad .video-scratchpad-holder").css("display", ""); */
        this.currentKeplerTask = taskMap[data.target];
        this._oldHash = window.location.hash.replace("#", "");
        if (this.keplerLauncher[this.currentKeplerTask]) {
            this.keplerLauncher[this.currentKeplerTask](data);
        } else {
            console.warn("No launcher function found for data:", data);
        }
    }

    /**
     * Launches training iframe.
     * @param data containing target type, event obj, dataJson and custom title flag.
     */
    launchTraining(data: { target: string, event: JQuery.Event, dataJson: string, useCustomTitle: boolean }, loadIntCb: Function = () => { }) {
        let $keplerWindow = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]).closest(".kepler-window");
        const $keplerIframe = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]);
        const dataTitle = this.getCurrentDataTitle();

        if ($keplerWindow.length === 0) {
            $keplerWindow = this.$(".kepler-window.kepler-window-skill");
        }

        $keplerWindow.find(".iframe-title").html("");

        this._lastSkillJsonId = data.dataJson;
        this.pageManagerView.skillCtrl.model.type = SkillController.eTypes.TRAINING;
        $keplerWindow.show().removeClass("assessment-skill").addClass("training-skill");
        this.pageManagerView.pauseVideo();
        this.$el.addClass("video-kepler-fullscreen skill-kepler-fullscreen");
        // this.handleResize();
        this.preloadKeplerAudio("iframe." + Player.IFRAME_TARGET_MAP[data.target], data.dataJson);
        const newQuestion = this.pageManagerView.skillCtrl.model.getQuestionData(data.dataJson);
        this.pageManagerView.skillCtrl.model.setCurrentQuestion(newQuestion);
        this.pageManagerView.skillCtrl.renderCurrentQuestion();
        this.onScroll($keplerWindow.find(".title-wrapper"));
        this.skillResizeHandler();

        if (!this.isSkillIFrameLoaded) {
            this.launchableTrainingData = data;
            this.loadIntCallback = loadIntCb;
            return;
        }

        let oldFocusedElem: HTMLElement = document.activeElement;
        if ($keplerWindow.has(oldFocusedElem).length === 0) {
            oldFocusedElem = $keplerWindow.find("button.back-button-wrapper").get(0);
        }
        oldFocusedElem.focus();
        this.keplerCommAPISkill.loadTask(data.dataJson, taskMap[data.target], (loadData: any) => {
            console.info("loadTask cb kepler-training", loadData);
            if (this._oldHash !== window.location.hash.replace("#", "")) {
                console.info("Page change occured, preventing training loadInteractionPhase");
                return;
            }
            this.keplerCommAPISkill.loadInteractionPhase("Assessment", (loadInteractionData: InterfacePckg.CallbackDatas.LoadInteraction) => {
                console.info("loadInteractionPhase cb:", loadInteractionData);
                loadIntCb(loadData, loadInteractionData);
                oldFocusedElem.focus();
                window.setTimeout(() => { oldFocusedElem.focus(); }, 250);
            });
        });
    }

    /**
     * Launches assessment iframe.
     * @param data containing target type, event obj, dataJson and custom title flag.
     */
    launchAssessment(data: { target: string, event: JQuery.Event, dataJson: string, useCustomTitle: boolean }, loadIntCb: Function = () => { }) {
        let $keplerWindow = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]).closest(".kepler-window");
        const $keplerIframe = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]);
        const dataTitle = this.getCurrentDataTitle();

        if ($keplerWindow.length === 0) {
            $keplerWindow = this.$(".kepler-window.kepler-window-skill");
        }

        $keplerWindow.find(".iframe-title").html("");

        $keplerWindow.show().removeClass("training-skill").addClass("assessment-skill");
        this.pageManagerView.pauseVideo();
        this.$el.addClass("video-kepler-fullscreen skill-kepler-fullscreen");
        // this.handleResize();
        const newQuestion = this.pageManagerView.skillCtrl.model.getQuestionData(data.dataJson);
        this.pageManagerView.skillCtrl.model.setCurrentQuestion(newQuestion);
        this.pageManagerView.skillCtrl.renderCurrentQuestion();
        this.onScroll($keplerWindow.find(".title-wrapper"));
        this.skillResizeHandler();

        if (this._lastSkillJsonId === data.dataJson && this.pageManagerView.skillCtrl.model.type === SkillController.eTypes.ASSESSMENT) {
            console.info("Same skill loaded!");
            return;
        }

        this._lastSkillJsonId = data.dataJson;
        this.pageManagerView.skillCtrl.model.type = SkillController.eTypes.ASSESSMENT;
        this.preloadKeplerAudio("iframe." + Player.IFRAME_TARGET_MAP[data.target], data.dataJson);

        if (!this.isSkillIFrameLoaded) {
            this.launchableAssessmentData = data;
            this.loadIntCallback = loadIntCb;
            this._lastSkillJsonId = "";
            return;
        }

        this.keplerCommAPISkill.loadTask(data.dataJson, taskMap[data.target], (loadData: any) => {
            console.info("loadTask cb kepler-assessment", loadData);
            if (this._oldHash !== window.location.hash.replace("#", "")) {
                console.info("Page change occured, preventing assessment loadInteractionPhase");
                return;
            }
            this.keplerCommAPISkill.loadInteractionPhase("Assessment", (loadInteractionData: InterfacePckg.CallbackDatas.LoadInteraction) => {
                console.info("loadInteractionPhase cb:", loadInteractionData);
                loadIntCb(loadData, loadInteractionData);
                this.$(".kepler-window-skill .back-button-wrapper").focus();
            });
        });
    }

    /**
     * Launches video iframe.
     * @param data containing target type, event obj, dataJson and custom title flag.
     */
    launchVideo(data: { target: string, event: JQuery.Event, dataJson: string, useCustomTitle: boolean }) {
        let $keplerWindow = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]).closest(".kepler-window");
        const $keplerIframe = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]);
        const dataTitle = this.getCurrentDataTitle();

        if ($keplerWindow.length === 0) {
            $keplerWindow = this.$(".kepler-window.kepler-window-video");
        }

        $keplerWindow.show();
        this.$(".main-section.node-kepler-video-scratchpad .video-scratchpad-holder").css("display", "");
        this.handleResize();
        this.preloadKeplerAudio();
        this.pageManagerView.resetVideoTimers();
        this.pageManagerView.model.videoCaption = "";

        if (!this.isVideoIFrameLoaded) {
            this.launchableVideoData = data;
            return;
        }

        const aContext = Utilities.getAudioContext();
        // if audio context and silenct audio's butter is available, play it.
        if (aContext !== null && this.silentAudioBuffer !== void 0) {
            const buffSrc = aContext.createBufferSource();
            buffSrc.buffer = this.silentAudioBuffer;
            buffSrc.loop = false;
            buffSrc.connect(aContext.destination);
            buffSrc.start(0, 0, 0.6);
        }

        this.keplerCommAPIVideo.loadTask(data.dataJson, taskMap[data.target])
            .then((loadData: any) => {
                console.info("loadTask cb kepler-video", data);
                if (this._oldHash !== window.location.hash.replace("#", "")) {
                    console.info("Page change occured, preventing video loadInteractionPhase");
                    return;
                }
                this.keplerCommAPIVideo.loadInteractionPhase("Observe")
                    .then((loadInteractionData) => {
                        this._isVideoStarted = true;
                        const sliderValues = loadInteractionData.stepList;
                        const totalTime = loadInteractionData.totaltime;

                        console.info("loadInteractionPhase cb:", loadInteractionData);
                        this.pageManagerView.videoPlayerControler.model.totalTime = totalTime;
                        this.pageManagerView.videoPlayerControler.model.maxStep = loadInteractionData.totalSteps;
                        this.pageManagerView.videoPlayerControler.model.controlMode = VPCPckg.eControlModes.play;
                        this.pageManagerView.applyCurrentAudio();
                        /* this.pageManagerView.applyCurrentClosedCaptions(); */
                        this.pageManagerView.setTranscriptTitle(this.model.activeModel.text);
                        this.pageManagerView.renderVideoSlider(totalTime, sliderValues);
                        this.$(".video-slider .ui-slider-handle").show();
                        this.$(".video-slider .start-seekbar").addClass("video-start");

                        if (loadInteractionData.captions) {
                            this.pageManagerView.model.videoCaptionsData = loadInteractionData.captions;
                        }
                        Player.Instance.scrollVideo().then((endType) => {
                            this.$("#play-pause-button").focus();
                        });
                        return loadInteractionData;
                    });
            });
    }

    /**
     * Launches scratchpad iframe.
     * @param data containing target type, event obj, dataJson and custom title flag.
     */
    launchScratchpad(data: { target: string, event: JQuery.Event, dataJson: string, useCustomTitle: boolean }) {
        const $keplerWindow = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]).closest(".kepler-window");
        const $keplerIframe = this.$("iframe." + Player.IFRAME_TARGET_MAP[data.target]);
        const dataTitle = this.getCurrentDataTitle();

        this.pageManagerView.pauseVideo();
        this.$el.addClass("video-kepler-fullscreen skill-kepler-fullscreen");
        this.$(".kepler-window.kepler-window-scratchpad").css("display", "");
        // scroll left to 0 on scratchpad launch
        $keplerWindow.find(".title-wrapper").scrollLeft(0);
        this.onScroll($keplerWindow.find(".title-wrapper"));
        this.$(".kepler-window-scratchpad .icon-back").focus();
        this.currScratchpadItem = data.dataJson;
        if (this.isScratchpadLoaded) {
            console.info("Scratchpad :", PlayerModel.INDEX_URLS.SCRATCHPAD + "#" + data.dataJson);
            this.$("iframe.kepler-scratchpad").attr("src", PlayerModel.INDEX_URLS.SCRATCHPAD + "#" + data.dataJson);
        } else {
            this.$(".kepler-window.kepler-window-scratchpad").removeClass("show");
        }
        this.setFocusToPlayer();
    }

    /**
     * Returns true if skill / scratchpad widnow is visible, false otherwise.
     */
    public isSkillOrScratchpadVisible() {
        const isSkillVisible = this.$skillWindow.is(":visible");
        const isScratchpadVisible = this.$scratchpadWindow.is(":visible");

        return (isSkillVisible || isScratchpadVisible);
    }

    hideControlButtons(hideButton: boolean) {
        if (!(Math.max(document.documentElement.clientWidth, document.body.clientWidth) <= 560))
            return;

        const $keplerWindow = this.$(".kepler-window .video-overlay");
        const that = this;

        $keplerWindow.off("touchstart").on("touchstart", function (event) {
            if (event.target !== this)
                return;
            clearInterval(that.timer);
            $("#video-player-controls").parent().removeClass("hide-buttons");
            that.setHideTimer();
        });

        if (hideButton) {
            this.setHideTimer();
        }
    }

    setHideTimer() {
        this.timer = window.setTimeout(() => {
            this.$("#video-player-controls").parent().addClass("hide-buttons");
        }, 5000);
    }

    showControlButtons() {
        if (!(Math.max(document.documentElement.clientWidth, document.body.clientWidth) <= 560))
            return;

        clearInterval(this.timer);
        this.$("#video-player-controls").parent().removeClass("hide-buttons");
        this.$(".kepler-window .video-overlay").off("touchstart");
    }

    /**
     * Activates hint mode of current training kepler instance.
     */
    activateHintMode() {
        const phaseMode = (this.pageManagerView.skillCtrl.model.mode === SkillController.eModes.HINT) ? "Assessment" : "Hint";
        const hintPromise = this.keplerCommAPISkill.loadInteractionPhase(phaseMode);
        hintPromise.then((loadInteractionData) => {
            console.info("loadInteractionPhase 'Hint' cb:", loadInteractionData);
            this.pageManagerView.toggleSkillHintMode();
        });
        return hintPromise;
    }

    retrySkill() {
        const retryPromise = this.keplerCommAPISkill.loadInteractionPhase("Assessment");
        retryPromise.then((loadInteractionData) => {
            console.info("retry loadInteractionPhase cb", loadInteractionData);
            this.pageManagerView.dectivateSkillHintMode();
        });
    }

    onRetryButtonClicked() {
        this.pageManagerView.popupMgr.showPopupById("retry-confirmation-popup");
    }

    onHelpButtonClicked(event: JQuery.Event) {
        const $kepWindow = $(event.currentTarget).closest(".kepler-window");
        switch (true) {
            case $kepWindow.hasClass("kepler-window-scratchpad"):
                this.pageManagerView.dialogMgr.showDialogById("scratchpad-help-dialog");
                break;
            case $kepWindow.hasClass("assessment-skill"):
                this.pageManagerView.dialogMgr.showDialogById("assessment-help-dialog");
                break;
            case $kepWindow.hasClass("training-skill"):
                this.pageManagerView.dialogMgr.showDialogById("training-help-dialog");
                break;
            default:
                console.warn("[Unexpected] No valid class found on nearest kepler-window when clicked on help button.");
        }
        $(event.currentTarget).addClass("active-help");
    }

    /**
     * Handler for kepler skill's (assessment & training) question changed event.
     * @param data Data contraining new json id.
     */
    onkeplerSkillQuestionChange(data: QuestionChangedData) {
        console.info("keplerSkillChangeQuestion(): ", data);
        let fnc: Function;
        let target: string = "";
        let completeCb: Function;
        const oldActiveElem = document.activeElement;

        this.pageManagerView.skillCtrl.model.currentQuestion = data.newQuestionCounter;
        const newQueTitle = this.pageManagerView.skillCtrl.model.getQuestionData(data.newDataJson);
        this.pageManagerView.skillCtrl.model.setCurrentQuestion(newQueTitle);
        this.pageManagerView.skillCtrl.renderCurrentQuestion();
        this.pageManagerView.dectivateSkillHintMode();

        completeCb = (loadData: any, cData: InterfacePckg.CallbackDatas.LoadInteraction) => {
            $(oldActiveElem).focus();
        };

        if (data.instanceType === "training") {
            fnc = this.launchTraining.bind(this);
            target = "kepler-training";
        } else if (data.instanceType === "assessment") {
            fnc = this.launchAssessment.bind(this);
            target = "kepler-assessment";
        }

        fnc({
            target,
            event: data.event,
            dataJson: data.newDataJson,
            useCustomTitle: true
        }, completeCb);
    }

    /**
     * Preloads and plays mute audio from video iframe.
     */
    preloadKeplerAudio(sel = "iframe.kepler-video", jsonId = this._currentVideoJSONID) {
        this.insertAudioIntoKepler(sel, jsonId);
        const audioElem: any = this.$(sel).contents().find("audio#" + jsonId).get(0);
        if (audioElem && audioElem.play && typeof audioElem.play === "function") {
            try {
                audioElem.currentTime = 0;
            } catch (ex) {
                console.warn("Exception:", ex);
            }
            if (audioElem.src.indexOf("1-second-of-silence.mp3") !== -1) {
                audioElem.play();
                console.info("Play called");
            }
        }
    }

    getCurrentDataTitle() {
        const currChunk = this.pageManagerView.model.dataJSON[this.model.activeModel.hash];
        return (currChunk && currChunk.title) ? currChunk.title : "";
    }

    getCurrentSerialNumber() {
        return this.model.activeModel.collection.indexOf(this.model.activeModel) + 1;
    }

    /**
     * Hides kepler iframes (excluding video).
     */
    hideKeplerIframes() {
        if (this.$(".kepler-video-scratchpad:visible").length !== 0) {
            this.$(".video-scratchpad-holder").css("display", "none");
        }
        // To reset scratchpad task.
        if (this.currentKeplerTask !== null && this.currentKeplerTask === taskMap["kepler-scratchpad"]) {
            this.$("iframe.kepler-scratchpad").attr("src", PlayerModel.INDEX_URLS.SCRATCHPAD + "#");
            if ($('.loader-wrapper').hasClass('scratchpad-ready')) {
                this.$(".kepler-window.kepler-window-scratchpad").css("display", "none");
            } else {
                this.$(".kepler-window.kepler-window-scratchpad").addClass("show");
            }
            this.$el.removeClass("video-kepler-fullscreen skill-kepler-fullscreen");
            this.currScratchpadItem = "";
        } else {
            this.$(".kepler-window:not(.kepler-window-video)").hide();
        }

        if (this.currentKeplerTask !== null && this.currentKeplerTask === taskMap["kepler-video"]) {
            // this.keplerCommAPIVideo.unloadTask(this.currentKeplerTask);
            this.launchableVideoData = null;
        } else if (this.currentKeplerTask !== null && (this.currentKeplerTask === taskMap["kepler-training"] || this.currentKeplerTask === taskMap["kepler-assessment"])) {
            // this.keplerCommAPISkill.unloadTask(this.currentKeplerTask);
            this.$el.removeClass("video-kepler-fullscreen skill-kepler-fullscreen");
            this.pageManagerView.dectivateSkillHintMode();
            this.loadIntCallback = () => { };
        }
        if (this.currentKeplerTask !== null && this.currentKeplerTask === taskMap["kepler-training"]) {
            if (this.keplerCommAPISkill) {
                this.retrySkill();
            }
            this.pageManagerView.resetCurrentQuestion();
            this.launchableTrainingData = null;
        }
        if (this.currentKeplerTask !== null && this.currentKeplerTask === taskMap["kepler-assessment"]) {
            this.launchableAssessmentData = null;
        }
        this.currentKeplerTask = null;
        this.handleResize();
    }

    onActiveModelChange(model: MenuModel) {

        //check if active model exists and if it belongs to leaf node and if it has completed its timer
        this.setProgressIfRead();
        this.model.activeModel = model;
        if (!(this.model.activeModel.subMenuItems.length || this.model.activeModel.visited) &&
            !(this.isPreloaderPresent() || !this.pageManagerView.isPageContentLoaded(this.model.activeModel.hash))) {
            this.model.activeModel.startTimer();
        }
        this.$("section .title-container .serial-no").html(this.getCurrentSerialNumber().toString());
        this.$("section .title-container .serial-no").toggleClass("hide", this.model.activeModel.subMenuItems.length > 0);
    }

    setProgressIfRead() {
        if (this.model.activeModel && !(this.model.activeModel.subMenuItems.length || this.model.activeModel.visited)) {
            if (this.model.activeModel.read) {
                this.model.activeModel.progress = 100;
            } else {
                this.model.activeModel.stopTimer();
            }
        }
    }

    /**
     * Handler for header icon's click event.
     * @param event jQuery event object.
     */
    onHeaderIconClicked(event: JQuery.Event) {
        const $target: JQuery<HTMLAnchorElement> = $(event.target) as JQuery<HTMLAnchorElement>;
        if ($target.hasClass("icon-bookmarked")) {
            this.toggleBookmarkPanel();
        } else if ($target.hasClass("icon-ellipses")) {
            this.$(".icon-ellipses").tooltip("hide");
            this.headerMenuView.show();
        } else if ($target.hasClass("icon-glossary")) {
            this.toggleGlossaryPanel();
        } else {
            $target.one("focusin", function (event: any) {
                $(this).tooltip("hide");    //hide tooltip after clicking "OK" of popup
            });
            window.alert("Not included in POC");
        }
    }

    onGlossaryHidden(data: any) {
        //this.$("#main-content-holder").show();
    }

    onGlossaryShown(data: any) {
        this.bookmarkView.hide();
        //this.$("#main-content-holder").hide();
        this.pageManagerView.pauseVideo();
    }

    onHeaderMenuBtnClicked(data: HeaderMenuButtonClickedData) {
        const $target: JQuery<HTMLButtonElement> = data.$target;
        if ($target.hasClass("minus-button")) {
            this.pageManagerView.decreaseFontSize();
        }
        else if ($target.hasClass("plus-button")) {
            this.pageManagerView.increaseFontSize();
        }
    }

    onHeaderMenuItemClicked(data: HeaderMenuIconicTextClickedData) {
        if (data.item.text === "Bookmarks") {
            this.headerMenuView.hide();
            this.showBookmarkPanel();
            this.headerView.selectHeaderButton({});
            if (data && data.event) {
                this.$(".header-icons button.icon-ellipses").focus();
            }
        } else if (data.item.text === "Glossary") {
            this.headerMenuView.hide();
            this.showGlossaryPanel();
            this.headerView.selectHeaderButton({
                currentTarget: this.headerView.$el.find("button.icon-" + data.item.class)
            });
        } else if (data.item.text === "Signout") {
            console.info("Signingout..");
        } else if (data.item.text === "Reset Usage") {
            this.clearServerData();
        } else {
            window.alert("Not included in POC");
        }
    }

    /**
     * Clears server data and reloads page.
     */
    public clearServerData() {
        console.info("Clearing data..");
        const success = (data: any) => {
            console.info("done..", data);
            this.clearModelData();
            return data;
        };
        const failure = (data: any) => {
            console.info("failed..", data);
            // For local testing..
            this.clearModelData();
            return data;
        };
        return this.model.clearServerData().then(success).catch(failure);
    }

    /**
     * Removes window unload listener and refreshes page to first page.
     */
    private clearModelData() {
        $(window).off("unload", this.setProgressIfReadBound);
        window.location.href = window.location.href.replace(window.location.hash, "");
    }

    /**
     * Handler for bookmarked item's click event.
     * @param event jQuery event object.
     */
    onBookmarkItemClicked(event: JQuery.Event) {
        this.showMainPanel();
    }

    /**
     * Shows / Hides main content page.
     * Hides / Shows bookmarks page.
     * Hides glossary panel.
     */
    toggleBookmarkPanel() {
        //this.glossaryView.hide();
        const newState = this.bookmarkView.toggle();
        if (newState === eState.HIDDEN) {
            this.showMainPanel();
        } else {
            this.hideMainPanel();
        }
    }

    /**
     * Shows / Hides glossary panel.
     * Hides / Shows main content page.
     * Hides bookmarks page.
     */
    toggleGlossaryPanel() {
        //this.bookmarkView.hide();
        const newState = this.glossaryView.toggle();
        if (newState === eState.HIDDEN) {
            this.showMainPanel();
        } else {
            this.hideMainPanel();
        }
    }

    /**
     * Hides main content page.
     * Shows bookmarks page.
     * Hides Glossary panel.
     */
    showBookmarkPanel() {
        this.bookmarkView.show();
        this.hideMainPanel();
    }

    /**
     * Shows main content page.
     * Hides bookmarks page.
     * Hides Glossary panel.
     * @param animate whether to show animation or not.
     */
    showMainPanel(animate = true) {
        let $animationElem = this.$("#main-content-holder section");
        if (!animate) {
            $animationElem.removeClass("animated");
            this.$("#content").removeClass("is-footer-hidden");
            this.glossaryView.hide();
            this.bookmarkView.hide();
            this.$("#main-content-holder").show();
            this.$(".panel-main-container").scrollTop(0);
            return;
        }
        $animationElem.off(animationEvent).one(animationEvent, () => {
            $animationElem.removeClass("animated");
        });
        this.glossaryView.hide();
        this.bookmarkView.hide();
        $animationElem.removeClass("pageFadeOut").addClass("animated pageFadeIn");
        this.$("#content").removeClass("is-footer-hidden");
        this.$("#main-content-holder").show();
        this.$(".panel-main-container").scrollTop(0);
    }

    /**
     * Hides main content page.
     * @param animate whether to show animation or not.
     */
    hideMainPanel(animate = true) {
        let $animationElem = this.$("#main-content-holder section");
        if (!animate) {
            $animationElem.removeClass("animated");
            this.$("#content").addClass("is-footer-hidden");
            this.$("#main-content-holder").hide();
            return;
        }
        $animationElem.off(animationEvent).one(animationEvent, () => {
            $animationElem.removeClass("animated");
            this.$("#content").addClass("is-footer-hidden");
            this.$("#main-content-holder").hide();
        });
        $animationElem.removeClass("pageFadeIn").addClass("animated pageFadeOut");
    }

    /**
     * Handler for kepler skill's scoring event.
     * Shows proper popup.
     * @param event jQuery event object.
     * @param data scoring data.
     */
    private onKeplerSkillScoringEvent(event: JQuery.Event, data: InterfacePckg.CommAPIEventMap["scoring-event"]) {
        console.info("onKeplerSkillScoringEvent", event, data);
        if (data.event.toLowerCase() === "correct") {
            /* window.alert("Correct"); */
            console.info(this._lastSkillJsonId, this.pageManagerView.skillCtrl.model.dataJSONs);
            const dataJsonIndex = this.pageManagerView.skillCtrl.model.dataJSONs.indexOf(this._lastSkillJsonId);
            if (dataJsonIndex !== -1) {
                if (dataJsonIndex === this.pageManagerView.skillCtrl.model.dataJSONs.length - 1) {
                    // Last json, show 'task-complete-popup'
                    this.pageManagerView.popupMgr.showPopupById("task-complete-popup");
                } else {
                    // still jsons to go, show 'correct-popup'
                    this.pageManagerView.popupMgr.showPopupById("correct-popup");
                }
                this.pageManagerView.dectivateSkillHintMode();
            } else {
                console.warn("WARNING! current skill json was not found in jsons (Array)");
            }
        } else if (data.event.toLowerCase() === "incorrect") {
            /* window.alert("Incorrect"); */
            this.pageManagerView.popupMgr.showPopupById("incorrect-popup");
        } else {
            console.warn("WARNING! unknown response in scoring-event:", data.event);
        }
    }

    /**
     * Handler for popup manager's all popup's any of the button's clicked event.
     * Goes to next question if next button is clicked.
     * @param data popup manager's 'button-clicked' custom event data.
     */
    private onPopupBtnClicked(data: CustomEventMap["button-clicked"]) {
        switch (data.btnId) {
            case "popup-next-button":
                console.info("Next button clicked");
                this.pageManagerView.skillCtrl.gotoQuestion();
                break;
            case "retry-confirm-yes-button":
                console.info("Yes button clicked");
                this.retrySkill();
                break;
            /* case "":
            case "popup-retry-button":
            case "retry-confirm-no-button":
                this.$(".kepler-window button.back-button-wrapper:visible").focus();
                break; */
        }
    }

    private onDialogBtnClicked() {
        this.$("button.help-holder").removeClass("active-help");
    }

    /**
     * Hides main content page.
     * Hides bookmarks page.
     * Shows Glossary panel.
     */
    showGlossaryPanel() {
        this.glossaryView.show();
        this.hideMainPanel();
    }

    /**
     * Handler for bookmark icon's click event.
     * Toggles bookmark selection.
     * @param event jQuery event object.
     */
    onIconClicked(event: JQuery.Event) {
        this.toggleCurrentBookmark();
        const $bookmarkIcon = $(event.target);
        if ($bookmarkIcon.hasClass("icon-bookmark")) {
            $bookmarkIcon.removeClass("icon-bookmark").addClass("icon-bookmarked");
            $bookmarkIcon.attr("aria-label", this.model.bookmarkedAccText);
            this.sideMenu.showHideBookMarkIcon(this.model.activeModel.hash, true);
        } else if ($bookmarkIcon.hasClass("icon-bookmarked")) {
            $bookmarkIcon.removeClass("icon-bookmarked").addClass("icon-bookmark");
            $bookmarkIcon.attr("aria-label", this.model.unbookmarkedAccText);
            this.sideMenu.showHideBookMarkIcon(this.model.activeModel.hash, false);
        }
        $bookmarkIcon.tooltip("hide");
        this.bookmarkView.toggleItemStateFromList(this.model.activeModel);
        const oldActiveElem = document.activeElement;
        Utilities.reFocusElement(oldActiveElem);
    }

    /**
     * Toggles currently active page's bookmark.
     */
    toggleCurrentBookmark() {
        if (this.model.activeModel) {
            this.model.activeModel.bookmark = !this.model.activeModel.bookmark;
            this.model.updateSavedData();
        }
    }

    /**
     * Handler for router's route changed event.
     * Updates side menu, breadcrum view and footer view.
     * @param data Object containing current active URL.
     */
    onRouteChanged(data: { url: string }) {
        if (this.$(".header-icons button.selected").length) {
            this.trigger("resetHeaderIcon");
        }
        this.sideMenu.changeActiveTab();
        this.breadcrumbsView.updateView();
        this.footerView.onActiveTabURLChanged();
        this.showMainPanel();
        this.resetBookmarkIcon();
        /* this.pageManagerView.pauseVideo(void 0, (data) => {
            this.pageManagerView.resetVideoTimers();
        }); */
        if (this._isVideoStarted) {
            console.info("Playing.. stopping");
            this.keplerCommAPIVideo.loadInteractionPhase("Assessment", (data) => {
                this.pageManagerView.resetVideoTimers();
                console.info("Assesment cb");
                this._isVideoStarted = false;
            });
        }
        this.$el.removeClass("video-kepler-fullscreen skill-kepler-fullscreen");
        this.pageManagerView.exitVideoFullscreenMode();
        this.pageManagerView.popupMgr.hideAllPopups();
        this.pageManagerView.dialogMgr.hideAllDialogs();
        this.pageManagerView.resetCurrentQuestion();
        if (this.checkAllLoaded()) {
            this.hideKeplerIframes();
        }
        this.hidePageLoader();
        this.handleResize();
    }

    /**
     * Resets bookmark icon as per active model.
     */
    resetBookmarkIcon() {
        const $bookmarkIcon = this.$(".icon-container button");
        if (this.model.activeModel && this.model.activeModel.bookmark) {
            $bookmarkIcon.removeClass("icon-bookmark").addClass("icon-bookmarked");
            $bookmarkIcon.attr("aria-label", this.model.bookmarkedAccText);
        } else {
            $bookmarkIcon.removeClass("icon-bookmarked").addClass("icon-bookmark");
            $bookmarkIcon.attr("aria-label", this.model.unbookmarkedAccText);
        }
    }

    /**
     * Updates Player view according to show latest JSON.
     * @param updatedJSON Updated JSON.
     * @param url current active URL
     */
    updatePlayerView(updatedJSON: DataNodesContainer, url: string) {
        this.model.updateUrlOnServer(url);
        if (this.getBookmarkedChunkByURL(url) !== void 0) {
            updatedJSON[url].bookmark = true;
            this.$("section .icon-container button").removeClass("icon-bookmark").addClass("icon-bookmarked");
            this.$("section .icon-container button").attr("aria-label", this.model.bookmarkedAccText);
        } else {
            updatedJSON[url].bookmark = false;
            this.$("section .icon-container button").removeClass("icon-bookmarked").addClass("icon-bookmark");
            this.$("section .icon-container button").attr("aria-label", this.model.unbookmarkedAccText);
        }
        this.$("section .title-container .title-text").html(updatedJSON[url].title ? updatedJSON[url].title : "");
        this.$("section .title-container .title-icon i")
            .removeClass()
            .addClass("icon-" + (updatedJSON[url].type ? updatedJSON[url].type : "document"));
        this.pageManagerView.updatePageView(updatedJSON, url);
        this.pageManagerView.dectivateSkillHintMode();
        this.$("section").scrollTop(0);
    }

    /**
     * Updates Bookmark list from updated content json.
     * @param updatedLinks Updated links json
     */
    updateBookmarkList(updatedLinks: MenuModel[]) {
        this.bookmarkView.model.list = this.updateBookmarksArray(updatedLinks);
        this.bookmarkView.updatePanelContent();
        this.bookmarkView.model.list.forEach((item: BookmarkMenuChunk) => {
            this.sideMenu.showHideBookMarkIcon(item.hash, true);
        })
    }

    /**
     * Updates bookmark list from given json.
     * @param currLinkChunk 
     * @param bookmarkArray 
     */
    updateBookmarksArray(currLinkChunk: MenuModel[], bookmarkArray = [] as BookmarkMenuChunk[]): any {
        for (const link of currLinkChunk) {
            if (link.bookmark) {
                const tabs = this.model.sideMenuCollection.getParentModels(link);
                const pageNo = this.model.sideMenuCollection.getPageNoByModel(link);
                tabs.pop();
                bookmarkArray.push({
                    refid: link.refid,
                    hash: link.hash,
                    text: link.text,
                    tabs,
                    pageNo
                });
            }
            if (link.subMenuItems && link.subMenuItems.models && link.subMenuItems.models.length !== 0) {
                bookmarkArray = this.updateBookmarksArray(link.subMenuItems.models, bookmarkArray);
            }
        }
        return bookmarkArray;
    }

    /**
     * Returns chunk if it is bookmarked.
     * @param url any url.
     */
    getBookmarkedChunkByURL(url: string) {
        for (const bookmarkedChunk of this.bookmarkView.model.list) {
            if (bookmarkedChunk.hash === url) {
                return bookmarkedChunk;
            }
        }
    }

    /**
     * check whether has to add device and browser specific extra padding. 
     */
    hasExtraPaddingAtBottom() {
        return (navigator.userAgent.search("Chrome") >= 0 && navigator.userAgent.search("Nexus 5") >= 0);
    }

    onBreadcrumbsLinkClicked(event: JQuery.Event) {
        let $target = $(event.currentTarget),
            isValidLink = $target.is('a') && !$target.hasClass("inactive-breadcrumbs") &&
                $target.parents('.breadcrumbs-link').length && $target.attr('href') && window.location.hash !== $target.attr('href');
        if (isValidLink) {
            this.hideMainPanel();
        }
    }

    /**
     * Shows page loader
     * @param animate whether to show animation or not.
     */
    showPageLoader(animate = true) {
        if (!animate) {
            this.$("#breadcrumbs-container").css("display", "inline-block");
            this.$("#main-content-holder section").addClass("page-loading");
            this.$(".page-loader").show();
            return;
        }
        this.$(".page-loader").off(animationEvent).one(animationEvent, () => {
            this.$(".page-loader").removeClass("animated");
        });
        this.$(".page-loader").removeClass("pageFadeOut").addClass("pageFadeIn animated");
        this.$("#breadcrumbs-container").css("display", "inline-block");
        this.$("#main-content-holder section").addClass("page-loading");
        this.$(".page-loader").show();
    }

    /**
     * Hides Page loader
     * @param animate whether to show animation or not.
     */
    hidePageLoader(animate = true) {
        if (!animate) {
            this.$("#main-content-holder section").removeClass("page-loading");
            this.$(".page-loader").hide();
            this.$("#breadcrumbs-container").css("display", "block");
            this.addPad();
            return;
        }
        this.$(".page-loader").off(animationEvent).one(animationEvent, () => {
            this.$(".page-loader").hide();
            this.$("#breadcrumbs-container").css("display", "block");
            this.$(".page-loader").removeClass("animated");
            this.$(".no-transition").removeClass("no-transition");
        });
        this.$("#main-content-holder section").removeClass("page-loading");
        this.$(".page-loader").removeClass("pageFadeIn").addClass("pageFadeOut animated");
        this.addPad();
    }

    addPad() {
        this.$("#main-content-holder section").removeClass("padd-add");
        if (this.$(".page-nav-items-holder").height() + this.$(".page-holder").outerHeight() >= this.$("#main-content-holder section").height()) {
            this.$("#main-content-holder section").addClass("padd-add");
        }
    }

    /**
     * check if side-menu, page and footer ready 
     */
    checkAllLoaded() {
        const loaderWrapper = $('.loader-wrapper');

        if (loaderWrapper.hasClass('page-ready') && loaderWrapper.hasClass('footer-ready') &&
            loaderWrapper.hasClass('side-menu-ready')/*  && loaderWrapper.hasClass('scratchpad-ready') */) {
            return true;
        }
    }

    /**
     * Hides Preloader on side-menu, page and footer ready 
     * @param animate whether to show animation or not.
     */
    hidePreloader(animate = true) {
        let loaderWrapper = $('.loader-wrapper');
        if (this.checkAllLoaded()) {
            if (!animate) {
                loaderWrapper.hide();
                if (!this.model.activeModel.subMenuItems.length) {
                    this.model.activeModel.startTimer();
                }
                return;
            }
            loaderWrapper.off(animationEvent).one(animationEvent, () => {
                loaderWrapper.removeClass("animated");
                loaderWrapper.hide();
                if (!this.model.activeModel.subMenuItems.length) {
                    this.model.activeModel.startTimer();
                }
            });
            loaderWrapper.addClass("pageFadeOut animated");
        }
    }

    isPreloaderPresent() {
        return $('.loader-wrapper').is(':visible');
    }

    /**
     * Handles resize from current screen size and iframe size.
     */
    handleResize() {
        if (Utilities.isTouchDevice() || Utilities.isSafari()) {
            const height = (Utilities.isIOS()) ? screen.height : window.innerHeight;
            this.$el.height(height);
        }

        // No computation for kepler video if skill is on fullscreen..
        if (this.$el.hasClass("skill-kepler-fullscreen")) {
            return;
        }
        const keplerVideoConstants = Player.KEPLER_VIDEO_DATA;
        let appWidth = Math.max(document.documentElement.clientWidth, document.body.clientWidth);
        let appHeight = Math.max(document.documentElement.clientHeight, document.body.clientHeight);
        let scale;
        let appAspectRatio = appWidth / appHeight;
        let actualAspectRatio = keplerVideoConstants.WIDTH / keplerVideoConstants.HEIGHT;
        let wrapperHeight: number;
        let wrapperWidth: number;
        let minWidth = keplerVideoConstants.MIN_SCALE_WIDTH - (keplerVideoConstants.MARGINS * 2);
        let minHeight = (minWidth / keplerVideoConstants.WIDTH * keplerVideoConstants.HEIGHT);

        const $controller = this.$videoPlayerController;
        const controllsHeight = appWidth <= 560 ? 0 : $controller.height() + this.$(".video-slider").height();
        const $fsVideoWrapper = this.$(".kepler-window.kepler-window-video.full-screen #video-wrapper");
        const $fsAllWrapper = this.$(".kepler-window.kepler-window-video.full-screen .iframe-controlls-wrapper");
        const $keplerWindowVideo = this.$(".kepler-window.kepler-window-video");
        const $parent = $keplerWindowVideo.parent();
        const maxWidths = keplerVideoConstants.MAX_WIDTHS;

        if (appAspectRatio <= actualAspectRatio) {
            scale = appWidth / keplerVideoConstants.WIDTH;
        } else {
            scale = (appHeight) / keplerVideoConstants.HEIGHT;
        }

        // Clear applied old css
        this.$("#video-wrapper").css({
            "transform": "",
            "-webkit-transform": "",
            "height": "",
            "width": ""
        });
        this.resizeClosedCaption();

        $keplerWindowVideo.find(".iframe-controlls-wrapper").css({
            "height": "",
            "width": ""
        });

        // To handle fullscreen resize under minimum scale width / height. (Apply scale property and keep height width to minimum scale).
        if (appWidth < keplerVideoConstants.MIN_SCALE_WIDTH || appHeight < keplerVideoConstants.MIN_SCALE_HEIGHT) {
            let fsWidth;
            let fsHeight;
            let fsScale;
            if (appAspectRatio <= actualAspectRatio) {
                fsWidth = Math.max(keplerVideoConstants.MIN_SCALE_WIDTH, appWidth);
                fsHeight = fsWidth * (appHeight - controllsHeight) / appWidth;
                fsScale = appWidth / fsWidth;
            } else {
                fsHeight = Math.max(keplerVideoConstants.MIN_SCALE_HEIGHT, appHeight) - controllsHeight;
                fsWidth = fsHeight * (appWidth) / (appHeight);
                fsScale = (appHeight) / fsHeight;
                fsHeight = fsHeight - (controllsHeight / fsScale);
            }
            $fsVideoWrapper.css({
                "height": (fsHeight) + "px",
                "width": fsWidth + "px",
                "transform": "scale(" + fsScale + ")",
                "-webkit-transform": "scale(" + fsScale + ")"
            });
            this.resizeClosedCaption(fsScale);
        } else {
            $fsVideoWrapper.css({
                "transform": "",
                "-webkit-transform": "",
                "height": "",
                "width": ""
            });
            this.resizeClosedCaption();
        }

        // Clear applied old css
        $keplerWindowVideo.css({
            "height": "",
            "width": ""
        });
        $controller.css({
            "max-width": "",
            "width": ""
        });
        this.$(".kepler-video img").css({
            "height": "",
            "width": "",
            "max-width": ""
        });
        this.$(".kepler-video .thumbnail-modal").css({
            "height": "",
            "width": "",
            "max-width": ""
        });
        $keplerWindowVideo.css("height", "");

        // To handle resize when not in fullscreen & more than minimum width (Apply dynamic height to iframe wrapper and keep width auto).
        const iWidth = this.$("iframe.kepler-video").width();
        if (!$keplerWindowVideo.hasClass("full-screen") && iWidth >= keplerVideoConstants.MIN_SCALE_WIDTH) {
            let iHeight = iWidth / keplerVideoConstants.WIDTH * keplerVideoConstants.HEIGHT;
            iHeight = (Math.round(iHeight * 100) / 100);
            $keplerWindowVideo.css("height", iHeight + "px");
        }

        // To handle resize when not in fullscreen & width less than minimum scale width
        // Keep width auto at minimum scale and apply height with calculated aspect ratio.
        // Apply same height width to thumbnail if screen width is under minimum scale width.
        if (!$keplerWindowVideo.hasClass("full-screen")/*  && (iWidth < keplerVideoConstants.MIN_SCALE_WIDTH) */) {
            let newWidth = $keplerWindowVideo.width();
            // For image's resize.
            const oldDisplay = $keplerWindowVideo.css("display");
            if (newWidth === 0) {
                this.$(".page-holder").css("display", "block");
                $keplerWindowVideo.css("display", "block");
                newWidth = $keplerWindowVideo.width();
                this.$(".page-holder").css("display", "");
                $keplerWindowVideo.css("display", oldDisplay);
            }

            minWidth = keplerVideoConstants.MIN_SCALE_WIDTH;
            minHeight = (minWidth / keplerVideoConstants.WIDTH * keplerVideoConstants.HEIGHT);

            switch (true) {
                case appWidth > 0 && appWidth <= 768:
                    newWidth = Math.min(newWidth, maxWidths["768px"]);
                    break;
                case appWidth > 768 && appWidth <= 1024:
                    newWidth = Math.min(newWidth, maxWidths["1024px"]);
                    break;
                case appWidth > 1024 && appWidth <= 1366:
                    newWidth = Math.min(newWidth, maxWidths["1366px"]);
                    break;
                case appWidth > 1366:
                    newWidth = Math.min(newWidth, maxWidths.FULL);
                    break;
            }

            let newHeight = (newWidth / keplerVideoConstants.WIDTH * keplerVideoConstants.HEIGHT) + controllsHeight;
            const newScale = newWidth / minWidth;

            $keplerWindowVideo.css({
                "height": newHeight,
                "width": newWidth
            });
            this.$("#video-wrapper").css("transform", "scale(" + newScale + ")").css({
                "-webkit-transform": "scale(" + newScale + ")",
                "height": minHeight + "px",
                "width": (minWidth - 0) + "px" // To Fix Bug #205342
            });
            this.resizeClosedCaption(newScale);
            $controller.css({
                "max-width": "100%",
                "width": "100%"
            });
            if (/* appWidth < keplerVideoConstants.MINMUMSCALE_WIDTH && */ newWidth > 0) {
                this.$(".kepler-video img").css({
                    "height": newHeight,
                    "width": newWidth,
                    "max-width": "100%"
                });
                this.$(".kepler-video .thumbnail-modal").css({
                    "height": newHeight,
                    "width": newWidth,
                    "max-width": "100%"
                });
            }
        }
    }

    resizeClosedCaption(scale: number = 1) {
        let minScale = scale < Player.KEPLER_VIDEO_CLOSED_CAPTION_DATA.MIN_SCALE ? Player.KEPLER_VIDEO_CLOSED_CAPTION_DATA.MIN_SCALE : scale,
            scaledFontSize = Player.KEPLER_VIDEO_CLOSED_CAPTION_DATA.FONT_SIZE * minScale,
            scaledLineHeight = Player.KEPLER_VIDEO_CLOSED_CAPTION_DATA.LINE_HEIGHT * minScale,
            scaledPadd = Player.KEPLER_VIDEO_CLOSED_CAPTION_DATA.PADDING * scale,
            scaledTextPadd = Player.KEPLER_VIDEO_CLOSED_CAPTION_DATA.TEXT_PADDING * scale;

        this.$("#closed-caption .cc-text-container").css({
            'font-size': scaledFontSize + "px",
            'padding': scaledPadd + "px"
        });

        this.$("#closed-caption .cc-text-container .cc-text").css({
            'padding': scaledTextPadd + "px",
            'line-height': scaledLineHeight + "px"
        });
    }

    /**
     * Skill iframe wrapper's resize handler.
     */
    skillResizeHandler() {
        const $wrapperFrame = this.$(".kepler-window-skill .wrapper-iframe:visible");
        if ($wrapperFrame.length === 0) {
            return;
        }
        $wrapperFrame.css({
            "height": "",
            "width": "",
            "transform": "",
            "-webkit-transform": ""
        }).removeClass("skill-scaled");
        let appWidth = $wrapperFrame.width();
        let appHeight = $wrapperFrame.height();
        let newWidth: number;
        let newHeight: number;
        let newScale: number;
        let appAspectRatio = appWidth / appHeight;

        if (appHeight <= Player.KEPLER_SKILL_DATA.MIN_SCALE_HEIGHT && appWidth <= Player.KEPLER_SKILL_DATA.MIN_SCALE_WIDTH) {
            if (appWidth < appHeight) {
                newWidth = Player.KEPLER_SKILL_DATA.MIN_SCALE_WIDTH;
                newHeight = newWidth / appAspectRatio;
            } else {
                newHeight = Player.KEPLER_SKILL_DATA.MIN_SCALE_HEIGHT;
                newWidth = newHeight * appAspectRatio;
            }
        } else if (appWidth <= Player.KEPLER_SKILL_DATA.MIN_SCALE_WIDTH) {
            newWidth = Player.KEPLER_SKILL_DATA.MIN_SCALE_WIDTH;
            newHeight = newWidth / appAspectRatio;
        } else if (appHeight <= Player.KEPLER_SKILL_DATA.MIN_SCALE_HEIGHT) {
            newHeight = Player.KEPLER_SKILL_DATA.MIN_SCALE_HEIGHT;
            newWidth = newHeight * appAspectRatio;
        } else {
            return;
        }

        newScale = appWidth / newWidth;

        $wrapperFrame.height(newHeight)
            .width(newWidth)
            .addClass("skill-scaled")
            .css({
                "transform": "scale(" + newScale + ")",
                "-webkit-transform": "scale(" + newScale + ")"
            });
    }

    /**
     * get the correct attribute name
     * @param prefix browser prefix
     */
    getHiddenPropertyName(prefix: string) {
        return (prefix ? prefix + 'Hidden' : 'hidden');
    }

    /**
     * get the correct event name
     */
    getVisibilityEvent() {
        let prefix = this.getBrowserPrefix();
        return (prefix ? prefix : '') + 'visibilitychange';
    }

    /**
     * get current browser vendor prefix
     */
    getBrowserPrefix() {
        var browserPrefixes = ['moz', 'ms', 'o', 'webkit'];
        for (var i = 0; i < browserPrefixes.length; i++) {
            if (this.getHiddenPropertyName(browserPrefixes[i]) in document) {
                // return vendor prefix
                return browserPrefixes[i];
            }
        }
        // no vendor prefix needed
        return null;
    }

    /**
     * handler for tab visibility in browser
     */
    handleVisibilityChange() {
        let hiddenPropName = this.getHiddenPropertyName(this.getBrowserPrefix()) as any;
        if (document[hiddenPropName]) {
            if (this.pageManagerView.isVideoPlaying()) {
                this._videoPaused = true;
                this.pageManagerView.pauseVideo();
            }
        } else {
            if (this._videoPaused) {
                this.pageManagerView.playVideo();
                this._videoPaused = false;
            }
        }
    }

    onScroll($scrollElem: JQuery) {
        if ($scrollElem && $scrollElem.length === 0) {
            return;
        }
        let scrollLeft = $scrollElem.scrollLeft(),
            innerWidth = $scrollElem.innerWidth(),
            outerWidth = $scrollElem.outerWidth(),
            scrollWidth = $scrollElem.get(0).scrollWidth;

        if (scrollWidth > innerWidth) {
            $scrollElem.find(".scroll-shadow-box").removeClass("hide");
            if (scrollLeft == 0) {
                $scrollElem.find(".scroll-shadow-box.left").addClass("hide");
            }
            else if ((scrollWidth - scrollLeft - 5) <= outerWidth) {
                $scrollElem.find(".scroll-shadow-box.right").addClass("hide");
            }
        } else {
            $scrollElem.find(".scroll-shadow-box").addClass("hide");
        }
    }

    /**
     * Scrolls video element into view.
     */
    scrollVideo() {
        let resolver: (value?: "complete" | "canceled" | PromiseLike<"complete" | "canceled">) => void;
        let rejecter: (reason?: any) => void;
        const scrollPromise = new Promise<"complete" | "canceled">((resolve, reject) => {
            resolver = resolve;
            rejecter = reject;
        });
        scrollIntoView(this.$(".kepler-window.kepler-window-video").get(0), {
            "isScrollable": function (target: any, defaultIsScrollable: any) {
                return defaultIsScrollable(target) || $(target).hasClass('scrollable');
            }
        }, resolver);
        return scrollPromise;
    }

    /**
     * Adds / Removes hint class from wrapper-iframe div of kepler skill window.
     */
    renderKeplerHintMode() {
        const newMode = this.pageManagerView.skillCtrl.model.mode;
        const classesToRemove = Player.HINT_DISPLAY_CLASSES.join(" ");
        const classToAdd = (newMode === SkillController.eModes.HINT) ? Player.HINT_DISPLAY_CLASSES[1] : Player.HINT_DISPLAY_CLASSES[0];

        console.info("Class to add:", classToAdd);
        this.$(".kepler-window.kepler-window-skill .wrapper-iframe").removeClass(classesToRemove).addClass(classToAdd);
    }

    /**
     * Returns visible iframe element from scratchpad, video and skill.
     * @param excludes Array of string indicating which type of iframes to be excluded, Optional, By default none shall exclude.
     */
    private getLiveIframe(excludes = [] as string[]): JQuery<HTMLIFrameElement> {
        const hasVideo = (excludes.indexOf("video") === -1);
        const hasSkill = (excludes.indexOf("skill") === -1);
        const hasScratchpad = (excludes.indexOf("scratchpad") === -1);

        let selectors = [] as string[];
        if (hasVideo) {
            selectors.push(".kepler-window.kepler-window-video iframe:visible");
        }
        if (hasSkill) {
            selectors.push(".kepler-window.kepler-window-skill iframe:visible");
        }
        if (hasScratchpad) {
            selectors.push(".kepler-window.kepler-window-scratchpad iframe:visible");
        }
        return this.$(selectors.join(", ")) as JQuery<HTMLIFrameElement>;
    }
}