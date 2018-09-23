import * as Backbone from "backbone";
import * as _ from "underscore";
import * as KeypadModelPkg from "../models/keypad";
import "./../../css/keypad.styl";

const mainTpl = require("./../../tpl/keypad.hbs");

export class Keypad extends Backbone.View<KeypadModelPkg.Keypad> {
    public model: KeypadModelPkg.Keypad;
    public $hintToShow: any;
    public hintShowing: boolean;
    public calcWidth: number;
    public containmentWidth: number;
    public containmentHeight: number;
    public calcHeight: number;
    public containmentPostion: JQuery.Coordinates;
    public containmentOffset: JQuery.Coordinates;

    constructor(attr: Backbone.ViewOptions<KeypadModelPkg.Keypad>, options?: {}) {
        super(attr);
        this.render();
        this.makeDraggable();
    }

    public events(): Backbone.EventsHash {
        return {};
    }

    public render(): Keypad {
        this.$el.html(mainTpl(this._getTemplateOptions()));
        this.$(".lrn-ui-style-floating-keyboard").outerWidth(400);
        this.$(".custom-keypad-container")
            .css({
                height: 360,
                width: 400
            })
            .hide();
        if ("ontouchstart" in window) {
            this.$(".custom-keypad-container button[title]").on(
                "touchstart",
                this.mouseClickOnKeypadButtons.bind(this)
            );
        } else {
            this.$(".custom-keypad-container button[title]").click(
                this.mouseClickOnKeypadButtons.bind(this)
            );
        }
        return this;
    }

    public setHintToShow(evennt: any) {
        this.$hintToShow = $(evennt.currentTarget);
        this.showHint();
    }

    public unSetHintToShow(evennt: any) {
        if (this.hintShowing) {
            this.hideHint();
        }
        this.$hintToShow = null;
    }

    public showHint() {
        if (this.$hintToShow) {
            const $hintToShow = this.$hintToShow;

            this.$(".lrn-hint-title").text($hintToShow.attr("title") || "");
            this.$(".lrn-hint-shortcut").text($hintToShow.data("shortcut") || "");
            this.$(".lrn-formula-keyboard-hint").removeClass("lrn-empty");
            this.hintShowing = !0;
        }
    }

    public hideHint() {
        this.$(".lrn-formula-keyboard-hint").addClass("lrn-empty");
        this.hintShowing = !1;
    }

    public showKeypad(isHide: boolean) {
        this.$(".lrn-ui-style-floating-keyboard,.custom-keypad-container").toggle(
            isHide
        );
    }

    public setOffset(calOffsetLeft: any, calOffsetTop: any) {
        this.$el.offset({
            left: calOffsetLeft,
            top: calOffsetTop
        });
        this.$(".custom-keypad-container").offset({
            left: calOffsetLeft,
            top: calOffsetTop
        });
    }

    public mouseClickOnKeypadButtons(event: any) {
        event.preventDefault();
        const title = $(event.currentTarget).attr("title");
        console.log("keypad-button-pressed");
        if (["Left", "Right", "Backspace"].indexOf(title) > -1) {
            this.trigger(
                "keypad-button-pressed",
                $(event.currentTarget).attr("title")
            );
        } else {
            this.trigger(
                "keypad-button-pressed",
                $(event.currentTarget).data("shortcut")
            );
        }
    }

    public getParentElement() {
        return this.$el.closest(".player-wrapper");
    }

    private makeDraggable() {
        this.$(".custom-keypad-container").draggable({
            containment: this.getParentElement(),
            handle: ".lrn-drag-area"
        });
    }

    private _getTemplateOptions() {
        return {};
    }
}
