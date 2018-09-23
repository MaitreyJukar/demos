import * as Backbone from "backbone";
import PlayerView from "./player";
import * as Handlebars from "handlebars";
import * as VPCPckg from "./../models/video-player-controls";
import { Utilities } from "./../utilities";
import "../../css/video-controls.css";
import Player from "./player";

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

const controlModeIconClassMap = ["icon-pause", "icon-play", "icon-replay"];
const screenModeIconClassMap = ["icon-full-screen", "icon-half-screen"];
const speedIcons = ["icon-speed-1", "icon-speed-2"];
const showMuteBtnInMobMenu = false;
const mobMenuList = [{
    btnId: "speed-icon",
    iconCls: "icon-speed-1",
    text: "Speed"
}, {
    btnId: "transcript-icon",
    iconCls: "icon-transcript",
    text: "Transcript"
}, {
    btnId: "cc-icon",
    iconCls: "icon-closed-caption",
    text: "Closed Captions",
    hasUnderline: true
}];
if (showMuteBtnInMobMenu) {
    mobMenuList.push({
        btnId: "audio-mute-unmute-icon",
        iconCls: "icon-volume-up",
        text: "Unmute"
    });
}

export class VideoPlayerControls extends Backbone.View<VPCPckg.VideoPlayerControls> {
    public static mobMenuList = mobMenuList;
    public static ccEnabledIcon = "icon-closed-caption";
    public static ccDisabledIcon = "icon-closed-caption";
    public static audioMuteIcon = "icon-volume-off";
    public static mobMenuFSIcon = "icon-ellipses";
    public static mobMenuHSIcon = "icon-ellipses";
    public static audioFullIcon = "icon-volume-up";
    public static speedIcons = speedIcons;
    public static screenModeIconClassMap = screenModeIconClassMap;
    public static controlModeIconClassMap = controlModeIconClassMap;
    public model: VPCPckg.VideoPlayerControls;
    public videoControlTpl: HandlebarsTpl;
    public mobMenuTpl: HandlebarsTpl;

    constructor(attr: Backbone.ViewOptions<VPCPckg.VideoPlayerControls> = {}) {
        if (!attr.model) {
            attr.model = new VPCPckg.VideoPlayerControls();
        }
        super(attr);
        this.videoControlTpl = require("./../../tpl/partials/video-player-controls.hbs");
        this.mobMenuTpl = require("./../../tpl/partials/mob-menu.hbs");
        this.listenTo(this.model, "change:controlMode", this.renderControlMode);
        this.listenTo(this.model, "change:timeElapsed", this.renderDuration);
        this.listenTo(this.model, "change:totalTime", this.renderDuration);
        this.listenTo(this.model, "change:currentSpeed", this.renderCurrentSpeed);
        this.listenTo(this.model, "change:screenMode", this.renderScreenMode);
        this.listenTo(this.model, "change:isClosedCaptionsShown", this.renderCCMode);
        this.listenTo(this.model, "change:isAudioMute", this.renderAudioBtn);
        this.listenTo(this.model, "change:isMobMenuShown", this.renderMobMenuBtn);
        this.listenTo(this.model, "change:maxStep, change:currentStep", this.renderStepBtns);
        this.render();
        Utilities.FullScreenManager.attachChangeListener((ev: Event) => {
            if (Utilities.FullScreenManager.isFullscreen) {
                this.model.screenMode = VPCPckg.eScreenModes.FullScreen;
                PlayerView.Instance.handleResize();
            } else {
                this.model.screenMode = VPCPckg.eScreenModes.HalfScreen;
                PlayerView.Instance.handleResize();
                Player.Instance.scrollVideo();
            }
        });
    }

    /**
     * Native events for current view.
     */
    events(): Backbone.EventsHash {
        return {
            "click button#play-pause-button": "onPlayPauseBtnClicked",
            "click button#goto-prev-button": "onGotoPrevBtnClicked",
            "click button#goto-next-button": "onGotoNextBtnClicked",
            "click button#speed-button, button#speed-icon": "onSpeedBtnClicked",
            "click #trans-button, #transcript-icon": "onTransBtnClicked",
            "click button#subtitle-button, button#cc-icon": "onSubtitleBtnClicked",
            "click button#audio-mute-unmute-icon": "onVolumeBtnClicked",
            "click button#volume-button": "onVolumeBtnClicked",
            "click button#screen-shift-button": "onScreenShiftBtnClicked",
            "click button#mob-menu-button": "onMenuButtonClicked",
            "click .modal.mob-menu-wrapper": "onMenuWrapperClicked",
            "click .mob-menu button": "onMenuBtnClicked",
            "keydown .mob-menu button": "onMobMenuKeydown"
        };
    }

    /**
     * Applies template and renders all model values.
     */
    render() {
        const tpl = this.videoControlTpl(this.model.toJSON());
        const newTpl = Utilities.trimSpacesFromTemplate(tpl);
        this.$el.html(newTpl);
        this.renderControlMode()
            .renderScreenMode()
            .renderDuration()
            .renderCurrentSpeed()
            .renderCCMode()
            .renderMobMenu()
            .renderStepBtns()
            .renderMobMenuBtn()
            .renderAudioBtn();
        this.$("#speed-button, button#speed-icon").attr("disabled", "disabled").attr("aria-disabled", "true");
        return this;
    }

    renderMobMenu() {
        this.$el.append(this.mobMenuTpl(VideoPlayerControls.mobMenuList));
        return this;
    }

    renderControlMode() {
        const $modeIconBtn = this.$("#play-pause-button");

        for (const mode of VPCPckg.eControlModes) {
            $modeIconBtn.removeClass(VideoPlayerControls.controlModeIconClassMap[VPCPckg.eControlModes[mode]]);
        }
        $modeIconBtn.addClass(VideoPlayerControls.controlModeIconClassMap[this.model.controlMode]);

        if (this.model.controlMode === VPCPckg.eControlModes.play) {
            $modeIconBtn.attr({
                "aria-label": "Pause video",
                "title": "Pause"
            });
        } else if (this.model.controlMode === VPCPckg.eControlModes.pause) {
            $modeIconBtn.attr({
                "aria-label": "Play video",
                "title": "Play"
            });
        } else if (this.model.controlMode === VPCPckg.eControlModes.replay) {
            $modeIconBtn.attr({
                "aria-label": "Replay video",
                "title": "Replay"
            });
        }
        return this;
    }

    renderScreenMode() {
        const $screenShiftBtn = this.$("#screen-shift-button");
        for (const mode of VPCPckg.eScreenModes) {
            $screenShiftBtn.removeClass(VideoPlayerControls.screenModeIconClassMap[VPCPckg.eScreenModes[mode]]);
        }
        $screenShiftBtn.addClass(VideoPlayerControls.screenModeIconClassMap[this.model.screenMode]);

        if (this.model.screenMode === VPCPckg.eScreenModes.HalfScreen) {
            $screenShiftBtn.attr({
                "aria-label": "Goto full screen",
                "title": "Full Screen"
            });
            Player.Instance.$el.removeClass("video-kepler-fullscreen skill-kepler-fullscreen");
        } else {
            $screenShiftBtn.attr({
                "aria-label": "Goto embedded mode",
                "title": "Window Mode"
            });
            Player.Instance.$el.addClass("video-kepler-fullscreen");
        }
        PlayerView.Instance.handleResize();
        return this;
    }

    renderCCMode() {
        const classToAdd: string = (this.model.isClosedCaptionsShown) ? VideoPlayerControls.ccEnabledIcon : VideoPlayerControls.ccDisabledIcon;
        const displayStyle: string = (this.model.isClosedCaptionsShown) ? "" : "none";
        this.$("#subtitle-button").removeClass(VideoPlayerControls.ccEnabledIcon + ", " + VideoPlayerControls.ccDisabledIcon)
            .addClass(classToAdd);
        this.$(".cc-wrapper .underline, .mob-menu .underline").css("display", displayStyle);
        return this;
    }

    renderAudioBtn() {
        const $volBtn = this.$("#volume-button");
        const $mobMenuVolBtn = this.$("#audio-mute-unmute-icon");
        const classToAdd: string = (this.model.isAudioMute) ? VideoPlayerControls.audioMuteIcon : VideoPlayerControls.audioFullIcon;
        let cssStyles;
        $volBtn.removeClass(VideoPlayerControls.audioMuteIcon + " " + VideoPlayerControls.audioFullIcon)
            .addClass(classToAdd);
        $mobMenuVolBtn.find(".icon-holder span").removeClass(VideoPlayerControls.audioMuteIcon + " " + VideoPlayerControls.audioFullIcon)
            .addClass(classToAdd);
        if (this.model.isAudioMute) {
            cssStyles = {
                "aria-label": "Unmute audio",
                "title": "Unmute"
            };
        } else {
            cssStyles = {
                "aria-label": "Mute audio",
                "title": "Mute"
            };
        }
        $volBtn.attr(cssStyles);
        $mobMenuVolBtn.attr(cssStyles);
        $mobMenuVolBtn.find(".text-holder").text(cssStyles.title);
        return this;
    }

    renderMobMenuBtn() {
        let classToAdd;
        let expandedAttr;
        const $focusables = this.$(".mob-menu button[disabled!=disabled]");
        if (this.model.isMobMenuShown) {
            this.$(".modal.mob-menu-wrapper").show();
            this.$(".mob-menu").removeClass("scale-0");
            this.$el.addClass("mobile-menu-open");
            classToAdd = VideoPlayerControls.mobMenuFSIcon;
            expandedAttr = "true";
        } else {
            this.$(".modal.mob-menu-wrapper").hide();
            this.$(".mob-menu").addClass("scale-0");
            this.$el.removeClass("mobile-menu-open");
            classToAdd = VideoPlayerControls.mobMenuHSIcon;
            expandedAttr = "false";
        }
        this.$("#mob-menu-button").removeClass(VideoPlayerControls.mobMenuFSIcon + ", " + VideoPlayerControls.mobMenuHSIcon)
            .addClass(classToAdd);
        this.$("#mob-menu-button").attr("aria-expanded", expandedAttr);
        $focusables.eq(0).focus();
        return this;
    }

    renderStepBtns() {
        const $preBtn = this.$("#goto-prev-button") as JQuery<HTMLButtonElement>;
        const $nxtBtn = this.$("#goto-next-button") as JQuery<HTMLButtonElement>;
        if (this.model.currentStep <= 1) {
            this.disableBtn($preBtn);
        } else {
            this.enableBtn($preBtn);
        }
        if (this.model.currentStep === -1) {
            this.disableBtn($preBtn);
        }
        if (this.model.currentStep >= this.model.maxStep) {
            this.disableBtn($nxtBtn);
        } else {
            this.enableBtn($nxtBtn);
        }
        if (this.model.maxStep === -1) {
            this.disableBtn($nxtBtn);
        }
        return this;
    }

    renderDuration() {
        let totalTime = "",
            timeElapsed = "",
            remainingTime = "";
        const minCount = Math.floor(this.model.totalTime / 60);
        const secCount = Math.floor(this.model.totalTime % 60);
        const minElapsedCount = Math.floor(this.model.timeElapsed / 60);
        const secElapsedCount = this.model.timeElapsed % 60;
        const minRemainingCount = Math.floor((this.model.totalTime - this.model.timeElapsed) / 60);
        const secRemainingCount = Math.floor((this.model.totalTime - this.model.timeElapsed) % 60);

        totalTime = ("00" + minCount).slice(-2) + ":" + ("00" + secCount).slice(-2);
        timeElapsed = ("00" + minElapsedCount).slice(-2) + ":" + ("00" + secElapsedCount).slice(-2);
        remainingTime = ("00" + minRemainingCount).slice(-2) + ":" + ("00" + secRemainingCount).slice(-2);

        this.$(".elapsed-time").html(timeElapsed);
        this.$(".total-time").html(totalTime);
        this.$(".remaining-time").html(remainingTime === "00:00" ? remainingTime : ("-" + remainingTime));
        return this;
    }

    renderCurrentSpeed() {
        const $speedBtn = this.$("#speed-button");
        for (const cls of VideoPlayerControls.speedIcons) {
            $speedBtn.removeClass(cls);
        }
        $speedBtn.addClass(VideoPlayerControls.speedIcons[this.model.currentSpeed - 1]);
        return this;
    }

    /**
     * Plays video if mode is pause or pauses.
     */
    playOrPause($button: JQuery<HTMLElement>) {
        if (this.model.controlMode === VPCPckg.eControlModes.play) {
            this.trigger("change-controlMode", "pause");
        } else if (this.model.controlMode === VPCPckg.eControlModes.pause) {
            this.trigger("change-controlMode", "play");
        } else if (this.model.controlMode === VPCPckg.eControlModes.replay) {
            this.trigger("change-controlMode", "replay");
        }
    }

    /**
     * Switches scrrens.
     * To Fullscreen if its in half otherwise half.
     */
    switchScreens() {
        if (this.model.screenMode === VPCPckg.eScreenModes.HalfScreen) {
            Utilities.FullScreenManager.gotoFullScreen();
            this.model.screenMode = VPCPckg.eScreenModes.FullScreen;
        } else {
            Utilities.FullScreenManager.exitFullScreen();
            this.model.screenMode = VPCPckg.eScreenModes.HalfScreen;
        }
        PlayerView.Instance.handleResize();
    }

    /**
     * Handler for video control's play-pause button's click event.
     * @param event jQuery event object.
     */
    onPlayPauseBtnClicked(event: JQuery.Event) {
        this.playOrPause($(event.currentTarget));
    }

    onGotoPrevBtnClicked(event: JQuery.Event) {
        this.trigger("change-step", this.model.currentStep - 1);
    }

    onGotoNextBtnClicked(event: JQuery.Event) {
        this.trigger("change-step", this.model.currentStep + 1);
    }

    onSpeedBtnClicked(event: JQuery.Event) {
        if (this.model.currentSpeed === this.model.maxSpeed) {
            this.trigger("change-currentSpeed", this.model.minSpeed);
        } else {
            this.trigger("change-currentSpeed", this.model.maxSpeed);
        }
    }

    onTransBtnClicked(event: JQuery.Event) {
        if (Utilities.isIE()) {
            window.navigator.msSaveBlob &&
                window.navigator.msSaveBlob(Player.Instance.pageManagerView.blobObject, Player.Instance.model.activeModel.text + '.txt');
        }
    }

    onSubtitleBtnClicked(event: JQuery.Event) {
        this.trigger("change-isClosedCaptionsShown");
        /* this.model.isClosedCaptionsShown = !this.model.isClosedCaptionsShown; */
    }

    onVolumeBtnClicked(event: JQuery.Event) {
        this.trigger("change-isAudioMute");
        /* this.model.isAudioMute = !this.model.isAudioMute; */
    }

    onScreenShiftBtnClicked(event: JQuery.Event) {
        /* this.playOrPause(); */
        this.switchScreens();
        /* this.playOrPause(); */
    }

    onMenuButtonClicked(event: JQuery.Event<HTMLButtonElement>) {
        console.info("onMenuButtonClicked");
        this.model.isMobMenuShown = !this.model.isMobMenuShown;
    }

    onMenuWrapperClicked(event: JQuery.Event) {
        this.model.isMobMenuShown = false;
    }

    onMenuBtnClicked(event: JQuery.Event) {
        this.model.isMobMenuShown = false;
    }

    onMobMenuKeydown(event: JQuery.Event) {
        const $focusables = this.$(".mob-menu button[disabled!=disabled]");
        switch (event.which) {
            case 9:
                const elemIndex = $focusables.index($(event.currentTarget));
                if (event.shiftKey) {
                    if (elemIndex === 0) {
                        this.model.isMobMenuShown = false;
                    }
                } else {
                    if (elemIndex === $focusables.length - 1) {
                        this.model.isMobMenuShown = false;
                    }
                }
                break;
            case 27:
                this.model.isMobMenuShown = false;
        }
    }

    /**
     * Adds disabled attribute and aria-disabled to selected buttons.
     * @param $btn jquery selected button elements.
     */
    public disableBtn($btn: JQuery<HTMLButtonElement>) {
        $btn.attr("disabled", "disabled").attr("aria-disabled", "true");
    }

    /**
     * Removes disabled attribute and aria-disabled to selected buttons.
     * @param $btn jquery selected button elements.
     */
    public enableBtn($btn: JQuery<HTMLButtonElement>) {
        $btn.removeAttr("disabled").attr("aria-disabled", "false");
    }
}