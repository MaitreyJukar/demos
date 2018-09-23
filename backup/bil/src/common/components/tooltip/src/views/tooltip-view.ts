import * as Backbone from "backbone";
import * as _ from "underscore";
import CommonUtilities = Utilities;
import * as ToolTipModelPkg from "../models/tooltip-model";
import * as SoundManager from "./../../../../helper/sound-manager";
import * as Utilities from "./../../../../helper/utilities";
import "./../../css/tooltip.styl";

export interface ExtWindow extends Window {
    MathJax: any;
}
declare const window: ExtWindow;
const toolTipTemplate: (attr?: any) => string = require("./../../tpl/tooltip.hbs");

export class ToolTip extends Backbone.View<ToolTipModelPkg.ToolTip> {

    public SoundManager: SoundManager.SoundManager;
    constructor(attr?: Backbone.ViewOptions<ToolTipModelPkg.ToolTip>) {
        super(attr);
        this.attachModelEvents();
        const soundManager: SoundManager.SoundManager = SoundManager.SoundManager.getInstance();
        this.SoundManager = soundManager;
        this.render()
            .renderState();
    }

    public events(): Backbone.EventsHash {
        return {
            "click #play-button-tooltip": "onTogglePlay"
        };
    }

    public render(): ToolTip {
        this.model.setTooltipLocText();
        this.$el.append(toolTipTemplate(this.model.toJSON()));
        if (window.MathJax) {
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
        }
        return this;
    }

    public attachModelEvents() {
        this.listenTo(this.model, "change:state", this.renderState);
        // this.listenTo(this, ToolTipModelPkg.EVENTS.TOGGLEICON, () => {
        //     this.togglePlayPauseIcon();
        // });
        this.listenTo(this, "render-play-icon", this.renderTooltipPlayIcon);
        this.listenTo(this, "render-pause-icon", this.renderTooltipPauseIcon);
    }

    public onTogglePlay(): void {
        if (this.model.audioID) {
            if (this.$el.find("#tooltip-play").hasClass("bil-icon-pop-up-play")) {
                this.playAudio();
            } else {
                this.pauseAudio();
            }
        } else {
            Utilities.Utilities.logger.info("no audio found");
        }
    }

    public pauseAudio() {
        this.$("#tooltip-play").removeClass("bil-icon-pop-up-pause").addClass("bil-icon-pop-up-play");
        this.$("#play-button-tooltip").attr({
            "aria-label": this.model.locTextData.playBtnAria,
            "title": this.model.locTextData.playBtnAria
        });
        this.trigger(ToolTipModelPkg.EVENTS.PAUSE);
    }

    public stopAudio() {
        this.$("#tooltip-play").removeClass("bil-icon-pop-up-pause").addClass("bil-icon-pop-up-play");
        this.$("#play-button-tooltip").attr({
            "aria-label": this.model.locTextData.playBtnAria,
            "title": this.model.locTextData.playBtnAria
        });
        this.trigger(ToolTipModelPkg.EVENTS.STOP);
    }

    /**
     * Plays audio (changes play button icon).
     * Triggers `ToolTipModelPkg.EVENTS.PLAY` event and `ToolTipModelPkg.EVENTS.MUTE` conditionally.
     */
    public playAudio() {
        let audioMissing = false;
        const soundMgr = $(this.SoundManager);
        soundMgr.on("tooltip-audio-missing", () => {
            audioMissing = true;
        });
        this.trigger(ToolTipModelPkg.EVENTS.PLAY);
        if (!audioMissing) {
            this.$("#tooltip-play").addClass("bil-icon-pop-up-pause").removeClass("bil-icon-pop-up-play");
            this.$("#play-button-tooltip").attr({
                "aria-label": this.model.locTextData.pauseBtnAria,
                "title": this.model.locTextData.pauseBtnAria
            });
            // this.SoundManager.play(this.model.audioID);
            if (this.$el.find("#sound").hasClass("bil-icon-sound-off")) {
                this.trigger(ToolTipModelPkg.EVENTS.MUTE);
            }
        }
        soundMgr.off("tooltip-audio-missing");
    }

    public togglePlayPauseIcon() {
        if (this.$el.find("#tooltip-play").hasClass("bil-icon-pop-up-pause")) {
            this.renderTooltipPlayIcon();
        } else if (this.$el.find("#tooltip-play").hasClass("bil-icon-pop-up-play")) {
            this.renderTooltipPauseIcon();
        }
    }
    public renderTooltipPlayIcon() {
        this.$el.find("#tooltip-play").removeClass("bil-icon-pop-up-pause").addClass("bil-icon-pop-up-play");
        this.$el.find("#play-button-tooltip").attr({
            "aria-label": this.model.locTextData.playBtnAria,
            "title": this.model.locTextData.playBtnAria
        });
    }

    public renderTooltipPauseIcon() {
        this.$el.find("#tooltip-play").removeClass("bil-icon-pop-up-play").addClass("bil-icon-pop-up-pause");
        this.$el.find("#play-button-tooltip").attr({
            "aria-label": this.model.locTextData.pauseBtnAria,
            "title": this.model.locTextData.pauseBtnAria
        });
    }

    private renderState() {
        if (this.model.state == ToolTipModelPkg.State.HIDE) {
            this.$(".tooltip").addClass("hide");
            this.$(".tooltip").attr("aria-hidden", "true");
            this.stopAudio();
        } else if (this.model.state == ToolTipModelPkg.State.SHOW) {
            this.$(".tooltip").removeClass("hide");
            this.$(".tooltip").attr("aria-hidden", "false");
            $(document).on("click." + this.model.modelId, this.hideToolTip.bind(this));
        }
        return this;
    }

    private hideToolTip(event: JQuery.Event): void {
        if (!$(event.target).closest(".tooltip").length) {
            this.model.state = ToolTipModelPkg.State.HIDE;
            $(document).off("click." + this.model.modelId);
            this.stopAudio();
        }
    }
}
