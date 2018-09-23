import * as Backbone from "backbone";
import "jqueryui";
import "jquery-ui-touch-punch";
import PlayerView from "./player";
import * as VPCViewPckg from "./video-player-controls";
import * as SkillViewPckg from "./skill-controls-top";
import * as SkillModelPckg from "./../models/skill-controls";
import * as VPCModelPckg from "./../models/video-player-controls";
import { PageManagerModel, DataNodesContainer, DataNode } from "./../models/page-manager";
import * as Handlebars from "handlebars";
import * as InterfacePckg from "./../interfaces/communication-api-interface";
import "../../css/page.css";
import "../../css/video-slider.css";
import "../../css/closed-caption.css";
import Player from "./player";
import { eControlModes } from "./../models/video-player-controls";
import { Popup } from "./../models/popup";
import * as PopupMgrPckg from "./../popup-mgr";
import * as DialogPckg from "./../dialog-mgr";
import { Utilities } from "../utilities";
const scrollIntoView = require('scroll-into-view');

export interface QuestionChangedData extends SkillViewPckg.QuestionChangedData {
    instanceType: "training" | "assessment" | "";
}

const popupData: PopupMgrPckg.PopupManager = require("./../../data/json/popup.json");
const dialogData: DialogPckg.DialogManager = require("./../../data/json/dialog.json");

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;
const partialTemplates: { [x: string]: HandlebarsTpl } = {
    "text": require("./../../tpl/partials/text.hbs") as HandlebarsTpl,
    "custom": require("./../../tpl/partials/custom.hbs") as HandlebarsTpl,
    "image-text": require("./../../tpl/partials/image-text.hbs") as HandlebarsTpl,
    "bullet": require("./../../tpl/partials/bullet.hbs") as HandlebarsTpl,
    "scratchpad": require("./../../tpl/partials/scratchpad.hbs") as HandlebarsTpl,
    "image": require("./../../tpl/partials/image.hbs") as HandlebarsTpl,
    "assessment": require("./../../tpl/partials/assessment.hbs") as HandlebarsTpl,
    "training": require("./../../tpl/partials/training.hbs") as HandlebarsTpl,
    "kepler-video": require("./../../tpl/partials/kepler-video.hbs") as HandlebarsTpl,
    "intro-image": require("./../../tpl/partials/intro-image.hbs") as HandlebarsTpl,
    "kepler-video-scratchpad": require("./../../tpl/partials/kepler-video-scratchpad.hbs") as HandlebarsTpl,
    "kepler-video-training": require("./../../tpl/partials/kepler-video-training.hbs") as HandlebarsTpl,
    "kepler-video-assessment": require("./../../tpl/partials/kepler-video-assessment.hbs") as HandlebarsTpl
};

export default class PageManagerView extends Backbone.View<PageManagerModel> {
    public static TARGET_MAP: { [id: string]: string } = {
        "kepler-video-scratchpad": "kepler-scratchpad",
        "kepler-video-assessment": "kepler-assessment",
        "kepler-video-training": "kepler-training"
    };
    public static LANUCH_BTN_LABEL_MAP: { [id: string]: string } = {
        "kepler-video-scratchpad": "LAUNCH SCRATCHPAD",
        "kepler-video-assessment": "LAUNCH PRACTICE",
        "kepler-video-training": "LAUNCH EXERCISE"
    };
    public static LANUCH_BTN_ICON_MAP: { [id: string]: string } = {
        "kepler-video-scratchpad": "icon-launch-scratchpad-keplerskill",
        "kepler-video-assessment": "icon-practice",
        "kepler-video-training": "icon-practice"
    };

    public model: PageManagerModel;
    public pageTpl: HandlebarsTpl;
    public sliderPipTpl: HandlebarsTpl;
    public currentFS: number;
    public maxFS: number;
    public minFS: number;
    public changeFSFactor: number;
    public separatorNodeTypes: string[];
    public customTitleNodeTypes: string[];
    public videoPlayerControler: VPCViewPckg.VideoPlayerControls;
    public get commAPI() { return PlayerView.Instance.keplerCommAPIVideo; };
    public skillCtrl: SkillViewPckg.SkillControllerTop;
    public popupMgr: PopupMgrPckg.PopupManager;
    public dialogMgr: DialogPckg.DialogManager;
    public blobObject: Blob;

    constructor(attr: Backbone.ViewOptions<PageManagerModel> = {}) {
        attr.el = "section .main-section";
        super(attr);
        if (!this.model) {
            this.model = new PageManagerModel();
        }
        this.pageTpl = require("./../../tpl/page.hbs");
        this.sliderPipTpl = require("./../../tpl/partials/slider-pip.hbs");
        this.currentFS = this.currentFS || 16;
        this.maxFS = this.maxFS || 24;
        this.minFS = this.minFS || 12;
        this.changeFSFactor = this.changeFSFactor || 2;
        this.separatorNodeTypes = this.separatorNodeTypes || ["kepler-video", "kepler-video-scratchpad", "kepler-video-training", "kepler-video-assessment"];
        this.customTitleNodeTypes = this.customTitleNodeTypes || ["kepler-video-scratchpad", "scratchpad", "training", "assessment", "kepler-video-training", "kepler-video-assessment"];
        this.videoPlayerControler = new VPCViewPckg.VideoPlayerControls({
            el: this.$("#video-player-controls")
        });
        this.popupMgr = new PopupMgrPckg.PopupManager(popupData);
        this.dialogMgr = new DialogPckg.DialogManager(dialogData);
        this.initSkillControllers();
        this.attachEvents();
        this.attachModelEvents();
        this.render();
    }

    /**
     * Attaches current view's model events.
     */
    private attachModelEvents() {
        this.listenTo(this.model, "change:videoCaption", this.renderVideoCaptions);
    }

    /**
     * Initializes training and assessment skill controllers.
     */
    private initSkillControllers() {
        const skillModel = new SkillModelPckg.SkillController({
            hasHintBtn: true,
            showQuestionCounters: true
        });
        this.skillCtrl = new SkillViewPckg.SkillControllerTop({
            el: ".kepler-window.kepler-window-skill .header-back",
            model: skillModel,
            className: "skill-ctrl",
            id: "skill-ctrl"
        });
    }

    /**
     * Registers partialTmpls hepler.
     */
    render() {
        Handlebars.registerHelper('partialTmpls', function (data: DataNode) {
            if (!data || !data.nodeType) {
                console.error("No data found");
                return "";
            }
            if (partialTemplates[data.nodeType]) {
                return partialTemplates[data.nodeType](data);
            } else {
                console.warn("Unknown partial Template found with name:", data.nodeType);
                return "";
            }
        });
        this.applyFontSize(this.currentFS);
        return this;
    }

    events(): Backbone.EventsHash {
        return {
            "click button.launch-btn": "onLaunchButtonClicked",
            "click .play-icon button.icon-video": "onPlayButtonClicked",
            "click .replay-icon button": "onReplayButtonClicked"
        };
    }

    /**
     * Starts playing video only if currently not playing. (You can use force true option to play video anyways).
     * @param force Forces to play video regardless of current mode.
     */
    playVideo(force = false) {
        const ctrlModel = this.videoPlayerControler.model;
        if (ctrlModel.controlMode === VPCModelPckg.eControlModes.play && !force) {
            return;
        }
        this.hideVideoEndOverlay(false);
        this.commAPI.playVideo((data: InterfacePckg.CallbackDatas.PlayVideo) => {
            console.info("playVideo cb", data);
            ctrlModel.controlMode = (data.event === "started") ? VPCModelPckg.eControlModes.play : ctrlModel.controlMode;
        });
    }

    /**
     * Pauses playing video only if currently not paused. (You can use force true option to pause video anyways).
     * @param force Forces to pause video regardless of current mode.
     */
    pauseVideo(force = false, cbFnc = (data: InterfacePckg.CallbackDatas.PauseVideo) => { }) {
        const ctrlModel = this.videoPlayerControler.model;
        if (ctrlModel.controlMode === VPCModelPckg.eControlModes.pause && !force) {
            return;
        }
        this.commAPI.pauseVideo((data: InterfacePckg.CallbackDatas.PauseVideo) => {
            console.info("pauseVideo cb", data);
            ctrlModel.controlMode = (data.event === "stopped") ? VPCModelPckg.eControlModes.pause : ctrlModel.controlMode;
            cbFnc(data);
        });
    }

    /**
     * returns video play status
     */
    isVideoPlaying() {
        return this.videoPlayerControler.model.controlMode === VPCModelPckg.eControlModes.play;
    }

    /**
     * Resets time elapsed and total time of video player controler to its defaults.
     */
    resetVideoTimers() {
        const ctrlModel = this.videoPlayerControler.model;
        const ctrlModelDefaults = ctrlModel.defaults();
        ctrlModel.timeElapsed = ctrlModelDefaults.timeElapsed;
        ctrlModel.totalTime = ctrlModelDefaults.totalTime;
    }

    /**
     * Sets videoPlayerControler's screen mode to HalfScreen.
     */
    exitVideoFullscreenMode() {
        const ctrlModel = this.videoPlayerControler.model;
        ctrlModel.screenMode = VPCModelPckg.eScreenModes.HalfScreen;
    }

    /**
     * Applies current closed caption state to video, toggles if given param is true.
     * @param isToggle determines whether to toggle state or maintain. (default false)
     */
    applyCurrentClosedCaptions(isToggle = false) {
        const ctrlModel = this.videoPlayerControler.model;
        let newVal = ctrlModel.isClosedCaptionsShown;
        if (isToggle) {
            newVal = !ctrlModel.isClosedCaptionsShown;
        }
        this.commAPI.showClosedCaptions(newVal, (data: any) => {
            console.info("showClosedCaptions cb", data);
        });
    }

    /**
     * Applies current audio state to video, toggles if given param is true.
     * @param isToggle determines whether to toggle state or maintain. (default false)
     */
    applyCurrentAudio(isToggle = false) {
        const ctrlModel = this.videoPlayerControler.model;
        let newVal = ctrlModel.isAudioMute ? 0 : 100;
        if (isToggle) {
            newVal = ctrlModel.isAudioMute ? 100 : 0;
        }
        this.commAPI.setVolume(newVal, (data: InterfacePckg.CallbackDatas.SetVolume) => {
            console.info("Audio cb", data);
            ctrlModel.isAudioMute = (data.event === "soundOff");
        });
    }

    attachEvents() {
        this.listenTo(this.skillCtrl, "hint-clicked", this.onHintClicked);
        this.listenTo(this.skillCtrl, "retry-clicked", this.onRetryClicked);
        this.listenTo(this.skillCtrl, "help-clicked", this.onHelpClicked);
        this.listenTo(this.skillCtrl, "question-changed", this.onQuestionChanged);

        this.popupMgr.on("button-clicked", (event, data) => {
            this.trigger("popup-button-clicked", data);
        });

        this.dialogMgr.on("button-clicked", (event, data) => {
            this.trigger("dialog-button-clicked", data);
        });

        const ctrlModel = this.videoPlayerControler.model;
        const that = this;
        this.listenTo(this.videoPlayerControler, "change-controlMode", (command: "play" | "replay" | "pause") => {
            if (command === "replay") {
                this.trigger("launch-btn-clicked", {
                    target: this.$(".replay-icon .icon-replay").data("target"),
                    event: null,
                    dataJson: this.$(".replay-icon .icon-replay").data("json")
                });
                this.setVideoSliderValue(0);
            }
            if (command === "play" || command === "replay") {
                this.commAPI.playVideo((data: InterfacePckg.CallbackDatas.PlayVideo) => {
                    console.info("playVideo cb", data);
                    ctrlModel.controlMode = (data.event === "started") ? VPCModelPckg.eControlModes.play : ctrlModel.controlMode;
                    this.hideVideoEndOverlay(true);
                    this.enableDisableVideoSlider(true);
                    this.$(".ui-slider-range, .ui-slider-handle").css("transition", "");
                });
            } else {
                this.commAPI.pauseVideo((data: InterfacePckg.CallbackDatas.PauseVideo) => {
                    console.info("pauseVideo cb", data);
                    ctrlModel.controlMode = (data.event === "stopped") ? VPCModelPckg.eControlModes.pause : ctrlModel.controlMode;
                    if (ctrlModel.timeElapsed !== ctrlModel.totalTime) {
                        const $elapsedBar = that.$(".ui-slider-range");
                        const progress = ($elapsedBar.width() / that.$("#slider").width()) * 100;
                        $elapsedBar.css({ "transition": "none", "width": progress + "%" });
                        that.$(".ui-slider-handle").css({ "transition": "none", "left": progress + "%" });
                    }
                });
                Player.Instance.showControlButtons();
            }
        });
        this.listenTo(this.videoPlayerControler, "change-currentSpeed", (speed: number) => {
            this.commAPI.setSpeed(speed, (data: any) => {
                console.info("setSpeed cb", data);
                ctrlModel.currentSpeed = speed;
            });
        });
        this.listenTo(this.videoPlayerControler, "change-isClosedCaptionsShown", () => {
            console.info("showClosedCaptions:", !ctrlModel.isClosedCaptionsShown);
            const displayStyle: string = (!ctrlModel.isClosedCaptionsShown) ? "" : "none";
            this.$("#closed-caption").css("display", displayStyle);
            ctrlModel.isClosedCaptionsShown = !ctrlModel.isClosedCaptionsShown;
        });
        this.listenTo(this.videoPlayerControler, "change-isAudioMute", () => {
            this.commAPI.setVolume(ctrlModel.isAudioMute ? 100 : 0, (data: InterfacePckg.CallbackDatas.SetVolume) => {
                console.info("Audio cb", data);
                ctrlModel.isAudioMute = (data.event === "soundOff");
            });
        });
        this.listenTo(this.videoPlayerControler, "change-step", this.onVideoStepChange.bind(this));
        this.listenTo(ctrlModel, "change:screenMode", () => {
            if (ctrlModel.screenMode === VPCModelPckg.eScreenModes.HalfScreen) {
                this.$(".kepler-window.kepler-window-video").removeClass("full-screen");
                Player.Instance.$("#main-content-holder section").removeClass("z-index-12");
                Player.Instance.$("#main-content-holder").removeClass("z-index-12");
            } else {
                this.$(".kepler-window.kepler-window-video").addClass("full-screen");
                Player.Instance.$("#main-content-holder section").addClass("z-index-12");
                Player.Instance.$("#main-content-holder").addClass("z-index-12");
            }
        });
        this.listenTo(ctrlModel, "change:controlMode", () => {
            if (ctrlModel.controlMode === VPCModelPckg.eControlModes.replay) {
                this.$(".kepler-window.kepler-window-video").addClass("video-replay-mode");
            } else {
                this.$(".kepler-window.kepler-window-video").removeClass("video-replay-mode");
            }
        });

        $(window).keydown(this.onKeydown.bind(this));
    }

    attachCommAPIEvents() {
        const ctrlModel = this.videoPlayerControler.model;
        this.commAPI.on("step-event", (event, data) => {
            ctrlModel.currentStep = data.stepNumber;
        });
        this.commAPI.on("scoring-event", this.onVideoEnd.bind(this));
        this.commAPI.on("update-timer-event", (event, data) => {
            if (ctrlModel.controlMode === 0) {
                let time: number = data.msgData.responseData.currentTime;
                let $sliderElement = this.$(".video-slider #slider.ui-slider");
                let accurateTime = time;
                time = Math.round(time);
                ctrlModel.timeElapsed = time;
                if (!$sliderElement.hasClass("ui-state-active")) {
                    this.setVideoSliderValue(accurateTime);
                }
                let updatedTime = data.msgData.responseData.currentTime;
                const newCaption = this.model.getCaptionByTime(updatedTime);
                if (newCaption) {
                    this.model.videoCaption = newCaption;
                }
            }
            // To fix video is playing when skill or scratchpad window is visible.
            if (PlayerView.Instance.isSkillOrScratchpadVisible()) {
                this.pauseVideo(true);
            }
        });
    }

    onVideoEnd(event: JQuery.Event, data: any) {
        const ctrlModel = this.videoPlayerControler.model;
        const that = this;

        if (this.getVideoSliderValue() < ctrlModel.totalTime) {
            console.log("%cTime needs to be updated in tait: " + this.getVideoSliderValue(), 'background: #222; color: #bada55');
            this.setVideoSliderValue(ctrlModel.totalTime);
            this.$(".video-slider .ui-slider-range").one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function (event) {
                that.showVideoEndOverlay();
            });
        } else {
            this.showVideoEndOverlay();
        }

        ctrlModel.timeElapsed = Math.floor(ctrlModel.totalTime);
        ctrlModel.controlMode = VPCModelPckg.eControlModes.replay;
        this.videoPlayerControler.disableBtn(this.videoPlayerControler.$("#goto-prev-button") as JQuery<HTMLButtonElement>);
        this.videoPlayerControler.disableBtn(this.videoPlayerControler.$("#goto-next-button") as JQuery<HTMLButtonElement>);
        this.enableDisableVideoSlider(false);
        this.model.videoCaption = "";
    }

    /**
     * Handler for skillCtrl's hint clicked event.
     * @param event jQuery's Event object.
     * @param skillCtrl Skill Controller from which event was dispatched.
     */
    onHintClicked(event: JQuery.Event, skillCtrl: SkillViewPckg.SkillControllerTop) {
        if (skillCtrl.model.type === SkillModelPckg.SkillController.eTypes.TRAINING) {
            console.info("Hint clicked, change mode to hint from here..");
            this.trigger("hint-clicked");
        } else if (skillCtrl.model.type === SkillModelPckg.SkillController.eTypes.ASSESSMENT) {
            console.info("Hint clicked from assessment skill ctrl..");
        } else {
            console.warn("WARNING! Unknown type was found in skill ctrl model", skillCtrl.model.type);
        }
    }

    /**
     * Handler for skillCtrl's retry button clicked event.
     * @param event jQuery's Event object.
     * @param skillCtrl Skill Controller from which event was dispatched.
     */
    onRetryClicked(event: JQuery.Event, skillCtrl: SkillViewPckg.SkillControllerTop) {
        this.trigger("retry-clicked");
    }

    /**
     * Handler for skillCtrl's help button clicked event.
     * @param event jQuery's Event object.
     * @param skillCtrl Skill Controller from which event was dispatched.
     */
    onHelpClicked(event: JQuery.Event, skillCtrl: SkillViewPckg.SkillControllerTop) {
        this.trigger("help-clicked", event, skillCtrl);
    }

    /**
     * Handler for skillCtrl's question changed event.
     * @param data Question changed data.
     */
    onQuestionChanged(data: SkillViewPckg.QuestionChangedData) {
        let newData: QuestionChangedData;
        let instanceType: "training" | "assessment" | "" = "";
        if (data.skillCtrl.model.type === SkillModelPckg.SkillController.eTypes.TRAINING) {
            instanceType = "training";
        } else if (data.skillCtrl.model.type === SkillModelPckg.SkillController.eTypes.ASSESSMENT) {
            instanceType = "assessment";
        }
        newData = { ...data, ...{ instanceType } };
        this.trigger("question-changed", newData);
    }

    /**
     * Handler for keydown event.
     * Closes video full screen, if currently its full screen, and escape button is pressed.
     * @param event jQuery event object.
     */
    onKeydown(event: JQuery.Event) {
        if (event.which === 27 && this.videoPlayerControler.model.screenMode === VPCModelPckg.eScreenModes.FullScreen) {
            this.videoPlayerControler.model.screenMode = VPCModelPckg.eScreenModes.HalfScreen;
            PlayerView.Instance.handleResize();
        }
    }

    onVideoStepChange(stepNo: number) {
        const ctrlModel = this.videoPlayerControler.model;
        this.videoPlayerControler.disableBtn(this.videoPlayerControler.$("#goto-prev-button") as JQuery<HTMLButtonElement>);
        this.videoPlayerControler.disableBtn(this.videoPlayerControler.$("#goto-next-button") as JQuery<HTMLButtonElement>);
        this.commAPI.gotoStep(stepNo, (data: InterfacePckg.CallbackDatas.GotoStep) => {
            this.videoPlayerControler.enableBtn(this.videoPlayerControler.$("#goto-prev-button") as JQuery<HTMLButtonElement>);
            this.videoPlayerControler.enableBtn(this.videoPlayerControler.$("#goto-next-button") as JQuery<HTMLButtonElement>);
            ctrlModel.currentStep = data.stepNumber;
        });
    }

    /**
     * Changes skill ctrl's mode to HINT.
     */
    activateSkillHintMode() {
        this.skillCtrl.model.mode = SkillModelPckg.SkillController.eModes.HINT;
    }

    /**
     * Changes skill ctrl's mode to NORMAL.
     */
    dectivateSkillHintMode() {
        this.skillCtrl.model.mode = SkillModelPckg.SkillController.eModes.NORMAL;
    }

    /**
     * Toggles skill ctrl's mode between HINT and NORMAL.
     */
    toggleSkillHintMode() {
        if (this.skillCtrl.model.mode === SkillModelPckg.SkillController.eModes.HINT) {
            this.skillCtrl.model.mode = SkillModelPckg.SkillController.eModes.NORMAL;
        } else {
            this.skillCtrl.model.mode = SkillModelPckg.SkillController.eModes.HINT;
        }
        return this.skillCtrl.model.mode;
    }

    /**
     * Updates Page content view according to show latest JSON.
     * @param updatedJSON Updated JSON.
     * @param url current active URL
     */
    updatePageView(updatedJSON: DataNodesContainer, url: string = location.hash.replace("#", "")) {
        this.model.dataJSON = updatedJSON;
        const topChunk: DataNode[] = [];
        const bottomChunk: DataNode[] = [];
        const currChunk: typeof updatedJSON[0] = JSON.parse(JSON.stringify(updatedJSON[url]));
        let separatorFound = false;
        let dataVideoJson = "";
        let dataAssessmentJson = "";
        let dataTrainingJson = "";
        this.$el.removeClass("node-kepler-video-scratchpad node-kepler-video");
        this.model.videoCaption = "";
        currChunk.nodes.forEach((value: DataNode, index: number, array: DataNode[]) => {
            let noScratchpad: boolean = false;
            let noOther: boolean = false;
            if (this.separatorNodeTypes.indexOf(value.nodeType) !== -1) {
                separatorFound = true;
                if (value.dataScratchpadJson !== void 0 && value.dataScratchpadJson !== null) {
                    this.$(".video-holder .button-holder .scratchpad-launch-btn").data("json", value.dataScratchpadJson);
                    this.$(".video-holder .button-holder .scratchpad-launch-btn").data("use-custom-title", String(value.useCustomTitle));
                    this.$(".video-holder .button-holder .scratchpad-launch-btn").data("target", PageManagerView.TARGET_MAP[value.nodeType]);
                    this.$(".video-holder .button-holder .scratchpad-launch-btn span").html(PageManagerView.LANUCH_BTN_LABEL_MAP[value.nodeType]);
                    this.$(".video-holder .button-holder .scratchpad-launch-btn #launcher-icon")
                        .removeAttr("class")
                        .attr("class", "")
                        .addClass(PageManagerView.LANUCH_BTN_ICON_MAP[value.nodeType]);
                    this.$el.addClass("node-" + "kepler-video-scratchpad");
                } else {
                    noScratchpad = true;
                }
                if (value.dataOtherJson !== void 0 && value.dataOtherJson !== null) {
                    this.$(".video-holder .button-holder .scratchpad-launch-btn").data("json", value.dataOtherJson[0]);
                    this.$(".video-holder .button-holder .scratchpad-launch-btn").data("use-custom-title", String(value.useCustomTitle));
                    this.$(".video-holder .button-holder .scratchpad-launch-btn").data("target", PageManagerView.TARGET_MAP[value.nodeType]);
                    this.$(".video-holder .button-holder .scratchpad-launch-btn span").html(PageManagerView.LANUCH_BTN_LABEL_MAP[value.nodeType]);
                    this.$(".video-holder .button-holder .scratchpad-launch-btn #launcher-icon")
                        .removeAttr("class")
                        .attr("class", "")
                        .addClass(PageManagerView.LANUCH_BTN_ICON_MAP[value.nodeType]);
                    this.$el.addClass("node-" + "kepler-video-scratchpad"); // kepler video scratchpad class has all the styles applicable to other video nodes.

                    /* if (value.nodeType === "kepler-video-assessment") {
                        this.skillCtrl.model.dataJSONs = value.dataOtherJson;
                    } else if (value.nodeType === "kepler-video-training") {
                        this.skillCtrl.model.dataJSONs = value.dataOtherJson;
                    } */
                    this.skillCtrl.model.dataJSONs = value.dataOtherJson;
                    this.skillCtrl.model.currentQuestion = 0;
                } else {
                    noOther = true;
                }
                if (noScratchpad && noOther) {
                    this.$el.addClass("node-" + value.nodeType);
                }
                this.downloadData(value);
                dataVideoJson = value.dataVideoJson;
                this.$(".kepler-window.kepler-window-video .replay-icon button").data("json", value.dataVideoJson);
            }
            if (!separatorFound) {
                topChunk.push(value);
            } else {
                bottomChunk.push(value);
            }
            if (this.customTitleNodeTypes.indexOf(value.nodeType) !== -1 && value.useCustomTitle) {
                const selector = ".kepler-window." + PlayerView.NODE_TYPE_KEPLER_WINDOW_SELECTOR[value.nodeType] + " .header-back .iframe-title";
                PlayerView.Instance.$(selector).html(value.title);
            }

            if (value.nodeType === "assessment") {
                this.skillCtrl.model.dataJSONs = value.dataJsons;
                dataAssessmentJson = value.dataJsons[0];
            } else if (value.nodeType === "training") {
                this.skillCtrl.model.dataJSONs = value.dataJsons;
                dataTrainingJson = value.dataJsons[0];
            }

            if (value.titles) {
                this.skillCtrl.model.questions = value.titles;
                for (let i = 0; i < value.titles.length; i++) {
                    const jsonIds = (value.dataOtherJson) ? value.dataOtherJson : value.dataJsons;
                    this.skillCtrl.model.setQuestionData(jsonIds[i], value.titles[i]);
                }
            } else {
                this.skillCtrl.model.questions = this.skillCtrl.model.defaults().questions;
            }
        });
        /* console.info("currChunk", topChunk, bottomChunk); */
        this.$(".top-nodes").html(this.pageTpl({ nodes: topChunk }));
        this.$(".bottom-nodes").html(this.pageTpl({ nodes: bottomChunk }));
        this.$(".kepler-window.kepler-window-video").hide();
        this.$(".video-scratchpad-holder").css("display", "none");
        this.hideVideoEndOverlay(false);
        this.trigger("page-ready", separatorFound, dataVideoJson, dataAssessmentJson, dataTrainingJson);
        this.$(".video-slider #slider").empty();
        this.$(".video-slider #slider").slider();
        this.enableDisableVideoSlider(false);
        if (Utilities.isTouchDevice()) {
            if (Player.Instance.isVideoPlayerReady) {
                Utilities.enableBtn(this.$(".node-main-content-container.kepler-video .play-icon button") as JQuery<HTMLButtonElement>);
            } else {
                Utilities.disableBtn(this.$(".node-main-content-container.kepler-video .play-icon button") as JQuery<HTMLButtonElement>);
            }
        }
    }

    /**
     * Shows reset button overlay on video.
     */
    showVideoEndOverlay() {
        this.$(".kepler-window.kepler-window-video .video-end-overlay").css("display", "");
        this.$(".kepler-window.kepler-window-video .replay-icon").css("display", "");
        Player.Instance.showControlButtons();
    }

    /**
     * Hides reset button overlay on video.
     */
    hideVideoEndOverlay(hideButton: boolean) {
        this.$(".kepler-window.kepler-window-video .video-end-overlay").css("display", "none");
        this.$(".kepler-window.kepler-window-video .replay-icon").css("display", "none");
        Player.Instance.hideControlButtons(hideButton);
    }

    /**
     * Increases font size by FS change factor (2 by default).
     */
    increaseFontSize() {
        this.applyFontSize(this.currentFS + this.changeFSFactor);
    }

    /**
     * Decreases font size by FS change factor (2 by default).
     */
    decreaseFontSize() {
        this.applyFontSize(this.currentFS - this.changeFSFactor);
    }

    /**
     * Applies new font size only if it fits max / min conditions.
     * @param size any font size in number.
     */
    applyFontSize(size: number) {
        if (size <= this.maxFS && size >= this.minFS) {
            this.currentFS = size;
            this.$el.css("font-size", this.currentFS + "px");
            PlayerView.Instance.$(".title-container").css("font-size", (this.currentFS + 2) + "px");
            PlayerView.Instance.$(".panel-container .panel-main-container").css("font-size", this.currentFS + "px");
            PlayerView.Instance.$(".page-nav-items-holder").css("font-size", this.currentFS + "px");
        }
    }

    /**
     * Handler for launch button (kepler demo) click event.
     * @param event jQuery event object.
     */
    onLaunchButtonClicked(event: JQuery.Event) {
        let $target = $(event.currentTarget);
        const target: string = $target.data("target");
        const dataJson: string = $target.data("json");
        const useCustomTitle: boolean = $target.data("useCustomTitle") == "1";
        this.trigger("launch-btn-clicked", { target, event, dataJson, useCustomTitle });
    }

    /**
     * Handler for video thumbnail's replay button (kepler video demo) click event.
     * @param event jQuery event object.
     */
    onReplayButtonClicked(event: JQuery.Event) {
        this.videoPlayerControler.trigger("change-controlMode", "replay");
    }

    /**
     * Handler for video thumbnail's play button (kepler video demo) click event.
     * Hides clicked node container div.
     * @param event jQuery event object.
     */
    onPlayButtonClicked(event: JQuery.Event) {
        let $target = $(event.currentTarget);
        const $containerNode = $target.closest(".node-main-content-container.kepler-video");
        const target: string = $target.data("target");
        const dataJson: string = $target.data("json");
        this.trigger("launch-btn-clicked", { target, event, dataJson });
        this.setVideoSliderValue(0);
        $containerNode.hide();
        this.hideVideoEndOverlay(true);
        if (Player.Instance._isVideoStarted) {
            this.$(".video-slider .ui-slider-handle").show();
        } else {
            this.$(".video-slider .ui-slider-handle").hide();
        }
    }

    downloadData(value: DataNode) {
        const that = this;

        if (Utilities.isIE()) {
            $.get("./content/" + Player.Instance.model.appName + "/kepler-tasks/office16/" + value.dataVideoJson + "/" + value.dataVideoJson + ".txt", function (data) {
                that.blobObject = new Blob([data]);
            }, 'text');
        } else {
            this.$('a#trans-button').attr({
                "href": "./content/" + Player.Instance.model.appName + "/kepler-tasks/office16/" + value.dataVideoJson + "/" + value.dataVideoJson + ".txt"
            });
        }
    }

    setTranscriptTitle(title: string) {
        if (!Utilities.isIE()) {
            this.$('a#trans-button').attr({
                "download": title + " - transcript.txt"
            });
        }
    }

    isPageContentLoaded(hash: string) {
        return this.model.dataJSON[hash];
    }

    /**
     * Renders video player's captions.
     * Attached to model's videoCaption change event.
     */
    renderVideoCaptions() {
        this.$("#closed-caption .cc-text-container .cc-text").text(this.model.videoCaption);
    }

    /**
     * Renders videoSlider with step marks
     * @param totalTime total video time in sec
     * @param stepValues list of steps with starting time in sec
     */
    renderVideoSlider(totalTime: number, stepValues: number[]) {
        let sliderValuePercentageMap: any[] = [],
            currentHandleValue: number,
            closestStepValue: number,
            currentPlaybackMode: number;

        for (let idx in stepValues) {
            if (stepValues.hasOwnProperty(idx)) {
                stepValues[idx] = Math.round(stepValues[idx] / 1000);
            }
        }

        stepValues.push(Math.round(totalTime));

        this.$(".video-slider #slider").slider("destroy");
        this.$(".video-slider #slider").empty();
        this.$(".video-slider #slider").slider({
            animate: "slow",
            value: 0,
            min: 0,
            range: "min",
            max: totalTime,
            step: 1,
            start: (event: any, ui) => {

                if (Utilities.isTouchDevice() && (event.originalEvent && event.originalEvent.type)) {
                    return;
                }

                currentPlaybackMode = this.videoPlayerControler.model.controlMode;
                $(event.target).addClass("ui-state-active");
                this.videoPlayerControler.trigger("change-controlMode", "pause");
                if (!$(event.target).find('.ui-slider-handle').hasClass("ui-state-hover")) {
                    $(event.target).addClass("ui-state-no-transition");
                }
            },
            slide: (event, ui) => {
                currentHandleValue = ui.value;
                closestStepValue = this.getClosestSliderPipValue(stepValues, currentHandleValue);
                this.setVideoSliderValue(closestStepValue);
                return false;
            },
            stop: (event, ui) => {
                currentHandleValue = ui.value;
                closestStepValue = this.getClosestSliderPipValue(stepValues, currentHandleValue);
                $(event.target).removeClass("ui-state-active ui-state-no-transition");
                if ($(event.target).hasClass("ui-slider-disabled")) {
                    this.setVideoSliderValue(totalTime);
                } else if (stepValues.indexOf(closestStepValue) + 1 === stepValues.length) {
                    this.videoPlayerControler.model.timeElapsed = closestStepValue;
                    this.onVideoEnd(event as JQueryEventObject, {});
                    return;
                } else {
                    this.onVideoStepChange(stepValues.indexOf(closestStepValue) + 1);
                }
                this.videoPlayerControler.trigger("change-controlMode", "play");
            }
        });
        this.$("#slider .ui-slider-handle").off("keydown keyup").on("keydown", (eve) => {
            if (!this.$("#slider").hasClass("ui-state-disabled") && !this.$("#slider").hasClass("ui-state-active")) {
                // Add left right keydown instructions here...
                const ctrlModel = this.videoPlayerControler.model;
                switch (eve.which) {
                    case 39: // Right arrow key
                        if (ctrlModel.currentStep + 1 <= ctrlModel.maxStep) {
                            /* console.info("Goto next");
                            this.onVideoStepChange(ctrlModel.currentStep + 1); */
                        }
                        Utilities.stopEvePropogation(eve);
                        break;
                    case 37: // Left arrow key
                        if (ctrlModel.currentStep - 1 > 0) {
                            /* console.info("Goto prev");
                            this.onVideoStepChange(ctrlModel.currentStep - 1); */
                        }
                        Utilities.stopEvePropogation(eve);
                        break;
                }
            }
        }).on("keyup", Utilities.stopEvePropogation);

        stepValues.forEach((value: number) => {
            sliderValuePercentageMap.push({
                value: value,
                percentage: (value * 100 / totalTime).toFixed(4)
            });
        });
        this.$(".video-slider #slider").append(this.sliderPipTpl(sliderValuePercentageMap));
        this.$(".ui-slider-pip .ui-slider-line:last").hide();
    }

    setVideoSliderValue(value: number) {
        value = Math.floor(this.videoPlayerControler.model.totalTime) === Math.floor(value) ? this.videoPlayerControler.model.totalTime : value;
        this.$(".video-slider #slider").slider({
            "value": value
        });
    }

    getVideoSliderValue() {
        return this.$(".video-slider #slider").slider("value");
    }

    enableDisableVideoSlider(isEnable: boolean) {
        this.$(".video-slider #slider").slider(isEnable ? "enable" : "disable");
    }

    getClosestSliderPipValue(stepValues: any, value: number) {
        let diff = Math.abs(stepValues[0] - value);
        let idx = 0;
        for (let c = 1; c < stepValues.length; c++) {
            let cdiff = Math.abs(stepValues[c] - value);
            if (cdiff < diff) {
                idx = c;
                diff = cdiff;
            }
        }
        return stepValues[idx];
    }

    /**
     * Resets skill ctrl model's current question to 0.
     */
    public resetCurrentQuestion() {
        this.skillCtrl.model.currentQuestion = 0;
    }
}