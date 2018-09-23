import * as Backbone from "backbone";
import { SoundManager } from "../../../../helper/sound-manager";
import { Language } from "../../../../helper/utilities";
import { Utilities } from "./../../../../helper/utilities";
import "./../../css/multi.styl";
import * as FooterPkg from "./../models/footer-model";

declare class KeyValue {
    [id: string]: any;
}

export interface ExtWindow extends Window {
    MathJax: any;
}

declare const window: ExtWindow;

const multi: (attr?: KeyValue) => string = require("./../../tpl/multi.hbs");
const footerTpl: Array<(attr?: KeyValue) => string> = [multi];

const KEY_CODES = {
    ARROW_DOWN: 40,
    ARROW_UP: 38,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    TAB: 9
};

export class FooterView extends Backbone.View<FooterPkg.FooterModel> {

    constructor(attr?: Backbone.ViewOptions<FooterPkg.FooterModel>) {
        super(attr);
        this.attachModelEvents();
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {
            "click  #language-toggle .language-button": "changeLanguage",
            "click #next-button": "onNextClick",
            "click #play-button": "onTogglePlay",
            "click #refresh": "refreshAll",
            "click #sound-on": "onToggleSound",
            "click .toggle-button": "onToggleCaption",
            "keydown #language-toggle .language-button": "keyLanguageSelection"
        };
    }

    public attachModelEvents() {
        return this;
    }

    public render(): FooterView {
        this.model.setFooterLocText();
        const tplData: any = this.model.toJSON();
        tplData.selectedLanguage = this.model.currentLanguage == "en" ? "ENGLISH" : "ESPAÑOL";
        tplData.unselectedLanguage = this.model.currentLanguage == "en" ? "ESPAÑOL" : "ENGLISH";
        tplData.selectedDataId = this.model.currentLanguage == "en" ? this.model.languages.ENGLISH : this.model.languages.SPANISH;
        tplData.unselectedDataId = this.model.currentLanguage == "en" ? this.model.languages.SPANISH : this.model.languages.ENGLISH;
        this.$el.html(footerTpl[this.model.type](tplData));
        if (this.model.currentLanguage != Language.ENGLISH) {
            this.setCurrentLanguage(this.model.currentLanguage);
        }
        this.setLanguage();
        return this;
    }

    public refreshAll(): void {
        this.$("#refresh").attr("disabled", "disabled");
        this.onPlayerRefresh();
        this.trigger(FooterPkg.EVENTS.REFRESH);
        if (!(this.$("#audio-text").hasClass("caption-hidden"))) {
            this.hideCaption();
        }
        let isMute = false;
        if (this.$el.find("#sound").hasClass("bil-icon-k-5-sound-off")) {
            isMute = true;
        }
        if (isMute) {
            this.$el.find("#sound").addClass("bil-icon-k-5-sound-off").attr({
                "aria-label": this.model.locTextData.unmuteBtnAria,
                "title": this.model.locTextData.unmuteBtnAria
            });
        }
        if (this.$el.find("#play").hasClass("bil-icon-k-5-pause")) {
            this.renderPlayIcon();
        }
        this.$("#play-button").addClass("hide");
        this.$("#next-button").addClass("hide");
    }

    public onNextClick(event: JQuery.Event): void {
        const $btn = $(event.currentTarget);
        if ($btn.find("i").hasClass("bil-icon-done")) {
            console.info("done");
            this.disableNextBtn();
            this.trigger(FooterPkg.EVENTS.DONE);
            this.model.explorationComplete = true;
        } else {
            this.trigger(FooterPkg.EVENTS.NEXT);
        }
    }

    public onTogglePlay(): void {
        if (this.model.audioID) {
            if (this.$el.find("#play").hasClass("bil-icon-k-5-play")) {
                this.playAudio();
            } else {
                this.pauseAudio();
            }
        } else {
            Utilities.logger.info("no audio found");
        }
    }

    public stopAudio() {
        this.renderPlayIcon();
        this.trigger(FooterPkg.EVENTS.STOP);
    }

    /**
     * Pauses audio (changes play button icon).
     * Triggers `FooterPkg.EVENTS.PAUSE` event.
     */
    public pauseAudio() {
        this.renderPlayIcon();
        this.trigger(FooterPkg.EVENTS.PAUSE);
    }

    /**
     * Plays audio (changes play button icon).
     * Triggers `FooterPkg.EVENTS.PLAY` event and `FooterPkg.EVENTS.MUTE` conditionally.
     */
    public playAudio() {
        let audioMissing = false;
        const soundMgr = $(SoundManager.getInstance());
        soundMgr.on("audio-missing", () => {
            audioMissing = true;
        });
        this.trigger(FooterPkg.EVENTS.PLAY);
        if (!audioMissing) {
            this.renderPauseIcon();
            if (this.$el.find("#sound").hasClass("bil-icon-k-5-sound-off")) {
                this.trigger(FooterPkg.EVENTS.MUTE);
            }
        }
    }

    public onToggleSound(): void {
        if (this.model.audioID) {
            if (this.$el.find("#sound").hasClass("bil-icon-k-5-sound")) {
                this.$el.find("#sound").removeClass("bil-icon-k-5-sound").addClass("bil-icon-k-5-sound-off").attr({
                    "aria-label": this.model.locTextData.unmuteBtnAria,
                    "title": this.model.locTextData.unmuteBtnAria
                });
                this.$el.find("#sound-on").attr({
                    "aria-label": this.model.locTextData.unmuteBtnAria,
                    "title": this.model.locTextData.unmuteBtnAria
                });
                this.trigger(FooterPkg.EVENTS.MUTE);
            } else {
                this.$el.find("#sound").removeClass("bil-icon-k-5-sound-off").addClass("bil-icon-k-5-sound").attr({
                    "aria-label": this.model.locTextData.muteBtnAria,
                    "title": this.model.locTextData.muteBtnAria
                });
                this.$el.find("#sound-on").attr({
                    "aria-label": this.model.locTextData.muteBtnAria,
                    "title": this.model.locTextData.muteBtnAria
                });
                this.trigger(FooterPkg.EVENTS.UNMUTE);
            }
        } else {
            Utilities.logger.warn("[Invalid AudioID] no audio found");
        }
    }

    /**
     * Returns true if currently audio is muted.
     */
    public isAudioMuted() {
        return this.$("#sound-on .font-icons").hasClass("bil-icon-k-5-sound-off");
    }

    public showCaption(): void {
        this.$el.find("#caption").removeClass("transit");
        this.$el.find(".arrow-up").removeClass("arrow-hide");
        this.$el.find("#audio-text").removeClass("caption-hidden");
        this.$("#audio-text").attr({
            "aria-label": this.model.locTextData.capsHideBtnAria,
            "title": this.model.locTextData.capsHideBtnAria
        });
        this.trigger(FooterPkg.EVENTS.SHOW_CAPTION);
    }

    public hideCaption(): void {
        this.$el.find("#caption").addClass("transit");
        this.$el.find(".arrow-up").addClass("arrow-hide");
        this.$el.find("#audio-text").addClass("caption-hidden");
        $("#audio-text").attr({
            "aria-label": this.model.locTextData.capsShowBtnAria,
            "title": this.model.locTextData.capsShowBtnAria
        });
        this.trigger(FooterPkg.EVENTS.HIDE_CAPTION);
    }

    public onToggleCaption(): void {
        if (this.$el.find("#audio-text").hasClass("caption-hidden")) {
            this.showCaption();
        } else {
            this.hideCaption();
        }
    }
    public setLanguage() {
        this.$el.find("#prev-button").html(this.model.locTextData.backBtnText);
        this.$el.find("#next-button span").html(this.model.locTextData.nextBtnText);
        this.$el.find("#refresh").attr({
            "aria-label": this.model.locTextData.resetAllBtnAria,
            "title": this.model.locTextData.resetAllBtnAria
        });
        if (this.$el.find("#sound-on").hasClass("sound-on")) {
            this.$el.find("#sound-on").attr({
                "aria-label": this.model.locTextData.muteBtnAria,
                "title": this.model.locTextData.muteBtnAria
            });
        } else {
            this.$el.find("#sound-on").attr({
                "aria-label": this.model.locTextData.unmuteBtnAria,
                "title": this.model.locTextData.unmuteBtnAria
            });
        }
        if (this.$el.find("#audio-text").hasClass("caption-hidden")) {
            this.$("#audio-text").attr({
                "aria-label": this.model.locTextData.capsShowBtnAria,
                "title": this.model.locTextData.capsShowBtnAria
            });
        } else {
            this.$("#audio-text").attr({
                "aria-label": this.model.locTextData.capsHideBtnAria,
                "title": this.model.locTextData.capsHideBtnAria
            });
        }
        if (this.$el.find("#play-button").hasClass("play")) {
            this.$el.find("#play-button").attr({
                "aria-label": this.model.locTextData.playBtnAria,
                "title": this.model.locTextData.playBtnAria
            });
        } else {
            this.$el.find("#play-button").attr({
                "aria-label": this.model.locTextData.pauseBtnAria,
                "title": this.model.locTextData.pauseBtnAria
            });
        }
    }

    public keyLanguageSelection(evt: JQueryEventObject) {
        const $target = $(evt.target);
        switch (evt.keyCode) {
            case KEY_CODES.ENTER:
            case KEY_CODES.SPACE:
                this.changeLanguage(evt);
                break;
            case KEY_CODES.TAB:
                if (this.isLanguageToggleOpen()) {
                    if (($target.hasClass("es") && !evt.shiftKey) || ($target.hasClass("en") && evt.shiftKey)) {
                        this.closeLanguageSelection();
                    }
                }
                break;
            case KEY_CODES.ARROW_UP:
            case KEY_CODES.ARROW_DOWN:
                if (this.isLanguageToggleOpen()) {
                    if ($target.hasClass("es")) {
                        this.$(".language-button.en").focus();
                    } else {
                        this.$(".language-button.es").focus();
                    }
                }
                break;
            case KEY_CODES.ESC:
                if (this.isLanguageToggleOpen()) {
                    this.closeLanguageSelection();
                    this.$(".language-button.selected").focus();
                }
                break;
            default:
        }
    }

    public changeLanguage(evt: JQueryEventObject) {
        if (this.isLanguageToggleOpen()) {
            this.chooseLanguage(evt);
        } else {
            this.openLanguageSelection();
        }
    }

    public isLanguageToggleOpen(): boolean {
        return this.$("#language-toggle").hasClass("open");
    }

    public chooseLanguage(evt: JQueryEventObject) {
        const $target = $(evt.target);
        if (!$target.hasClass("selected")) {
            this.selectLanguage($target.data("id"), $target);
        }
        this.closeLanguageSelection();
    }

    public selectLanguage(language: Language, $selected: JQuery<HTMLElement>) {
        if (this.model.languagesAvailable.indexOf(language) >= 0) {
            this.trigger(FooterPkg.EVENTS.STOP);
            this.setCurrentLanguage(language);
            $selected.focus();
            this.model.currentLanguage = language;
            this.trigger(FooterPkg.EVENTS.CHANGE_LANG, language);
            // this.model.setFooterLocText();
            // this.setLanguage();
        } else {
            this.trigger(FooterPkg.EVENTS.LANG_NA);
        }
    }

    public openLanguageSelection() {
        this.$("#language-toggle").addClass("open");
        this.$(".language-button").attr("tabindex", 0);
        $(window).on("click.closelang", (evt: any) => {
            if (!$(evt.target).closest("#language-toggle").length) {
                this.closeLanguageSelection();
            }
        });
    }

    public closeLanguageSelection() {
        this.$("#language-toggle").removeClass("open");
        this.$(".language-button:not(.selected)").removeAttr("tabindex");
        $(window).off(".closelang");
    }

    public setCaption(caption?: string) {
        const $text = this.$el.find("#text");
        $text.html(caption);
        if (window.MathJax) {
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
        }
        $text[0].scrollTop = 0;
    }

    public setCurrentLanguage(lang: Language) {
        this.$(".language-button").removeClass("selected").removeAttr("tabindex");
        const $selected = this.$(`.language-button[data-id=${lang}]`);
        $selected.addClass("selected").attr("tabindex", 0);
    }

    public renderPlayIcon() {
        this.$el.find("#play").removeClass("bil-icon-k-5-pause").addClass("bil-icon-k-5-play");
        this.$el.find("#play-button").attr({
            "aria-label": this.model.locTextData.playBtnAria,
            "title": this.model.locTextData.playBtnAria
        });
    }

    public renderPauseIcon() {
        this.$el.find("#play").removeClass("bil-icon-k-5-play").addClass("bil-icon-k-5-pause");
        this.$el.find("#play-button").attr({
            "aria-label": this.model.locTextData.pauseBtnAria,
            "title": this.model.locTextData.pauseBtnAria
        });
    }

    public disableNextBtn() {
        this.$el.find("#next-button").attr("disabled", "disabled");
    }

    public enableNextBtn() {
        this.$el.find("#next-button").removeAttr("disabled");
    }

    public onLastQuestionReached() {
        this.$el.find("#next-button span").html(Utilities.getLocText(this.model.currentLanguage, "footer", "done-button"));
        this.$el.find("#next-button i").removeClass("bil-icon-k-5-shape_r").addClass("bil-icon-done");
        this.model.lastQuestionReached = true;
        if (this.model.enableDoneOnAudioEnd) {
            this.disableNextBtn();
        }
        this.enableDoneBtn();
    }

    public onLastQuestionValidated() {
        this.model.lastQuestionValidated = true;
        this.enableDoneBtn();
    }

    public onLastQuestionUpdated() {
        this.model.lastQuestionUpdated = true;
        this.enableDoneBtn();
    }

    public onLastAudioEnded() {
        this.enableDoneBtn();
    }

    public enableDoneBtn() {
        if (!this.model.explorationComplete && this.model.lastQuestionReached &&
            (!this.model.enableDoneOnAudioEnd || this.model.lastAudioEnded) &&
            (!this.model.validateLastQuestion || this.model.lastQuestionUpdated) &&
            this.model.lastQuestionValidated) {
            this.enableNextBtn();
        }
    }

    public onPlayerRefresh() {
        this.$el.find("#next-button span").html(this.model.locTextData.nextBtnText);
        this.$el.find("#next-button i").removeClass("bil-icon-done").addClass("bil-icon-k-5-shape_r");
        this.enableNextBtn();
    }

    public onLoadingAfterRefresh() {
        this.$("#play-button").removeClass("hide");
        this.$("#next-button").removeClass("hide");
    }

    public onAudioCompleted() {
        if (this.model.lastQuestionReached) {
            this.model.lastAudioEnded = true;
            this.enableDoneBtn();
        }
    }

    public resetInitialState() {
        this.model.lastQuestionReached = false;
        this.model.lastQuestionUpdated = false;
        this.model.lastAudioEnded = false;
        this.model.explorationComplete = false;
        this.model.lastQuestionValidated = false;
    }
}
