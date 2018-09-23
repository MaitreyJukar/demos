import * as Backbone from "backbone";
import * as _ from "underscore";

// Dialog styles..
import "./../../css/dialog.css";
import "./../../css/dialog-partials/mobile-fullscreen.css";

// Theme styles..
import "./../../css/dialog-themes/red.css";

import * as DialogModelPckg from "./../models/dialog";

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

export interface CustomEventMap {
    "button-clicked": { event: JQuery.Event; dialogView: Dialog, btnId?: string };
}

export class Dialog extends Backbone.View<DialogModelPckg.Dialog> {
    public static FOCUSABLE_SELECTOR: string = "button";
    public template: HandlebarsTpl;
    public btnTemplate: HandlebarsTpl;
    public get $focusables(): JQuery<HTMLElement> { return this.$(Dialog.FOCUSABLE_SELECTOR); }

    constructor(attr: any = {}) {
        if (attr.model === void 0) {
            attr.model = new DialogModelPckg.Dialog();
        }
        super(attr);
        this.template = require("./../../tpl/dialog.hbs");
        this.btnTemplate = require("./../../tpl/dialog-btns.hbs");
        this.render();
        this.attachModelEvents();
    }

    public events() {
        return {
            "click button": "onBtnClicked"
        };
    }

    public attachModelEvents() {
        this.listenTo(this.model, "change:state", this.renderState);
        this.listenTo(this.model, "change:content", this.renderContent);
        this.listenTo(this.model, "change:extraClass", this.renderExtraCls);
    }

    public render() {
        super.render();
        this.$el.append(this.template(this.model.toJSON()));
        this.renderButtons()
            .renderTitleIcon()
            .renderColorTheme()
            .renderExtraCls()
            .attachKeydownListener();
        return this;
    }

    private attachKeydownListener() {
        this.$focusables.keydown(this.onBtnKeydown.bind(this));
    }

    public renderState() {
        const newCls = (this.model.state === DialogModelPckg.eState.SHOWN) ? "show" : "hide";
        this.$(".dialog-wrapper").removeClass("show hide").addClass(newCls);
        if (this.model.state === DialogModelPckg.eState.SHOWN) {
            // Focus on first button always
            this.$focusables.eq(0).focus();
        }
        return this;
    }

    public renderContent() {
        this.$("content-holder").html(this.model.content);
    }

    public renderButtons() {
        if (this.model.buttonsData.length === 0) {
            this.$(".buttons-holder").css("display", "none");
        } else {
            this.$(".buttons-holder").css("display", "");
        }

        for (const btn of this.model.buttonsData) {
            const obj = { ...btn, ...{ isIconAvailable: !(btn.icon === "") } };
            this.$(".buttons-holder").append(this.btnTemplate(obj));
        }
        return this;
    }

    public renderExtraCls() {
        this.$(".dialog-wrapper").addClass(this.model.extraClass);
        return this;
    }

    public renderTitleIcon() {
        this.$("#title-icon-" + this.model.dialogId).attr("class", this.model.titleIcon + " title-icon");
        return this;
    }

    public renderColorTheme() {
        let classes: string[] = [];
        for (const key in DialogModelPckg.ColorThemes) {
            if (DialogModelPckg.ColorThemes[key] !== "") {
                classes.push(DialogModelPckg.ColorThemes[key]);
            }
        }
        this.$(".dialog-wrapper").removeClass(classes.join(", ")).addClass(DialogModelPckg.ColorThemes[this.model.colorTheme]);
        return this;
    }

    /**
     * Sets model's state to `SHOWN`.
     * Thus, renders new state accordingly.
     */
    public show() {
        this.model.state = DialogModelPckg.eState.SHOWN;
    }

    /**
     * Sets model's state to `HIDDEN`.
     * Thus, renders new state accordingly.
     */
    public hide() {
        this.model.state = DialogModelPckg.eState.HIDDEN;
    }

    /**
     * Adds valid custom event listen.
     * @param event valid event name.
     * @param callback any function handler.
     * @param obj Any optional context.
     */
    public addListener<E extends keyof CustomEventMap>(event: E, callback: (data: CustomEventMap[E]) => any, obj?: any) {
        return this.on(event, callback, obj);
    }

    /**
     * Handler for any of the dialog's button's clicked event.
     * Triggers dialog custom event `button-clicked`.
     * @param event jQuery event object.
     */
    private onBtnClicked(event: JQuery.Event) {
        const btnId = $(event.currentTarget).attr("id");
        this.trigger("button-clicked", { event, dialogView: this, btnId });
        if (this.model.dismissOnBtnClick) {
            this.model.state = DialogModelPckg.eState.HIDDEN;
        }
    }

    /**
     * Handler for any of the button's keydown event.
     * @param event jQuery event object.
     */
    private onBtnKeydown(event: JQuery.Event) {
        if (event === void 0 || event.which === void 0 || event.shiftKey === void 0) {
            console.warn("[Invalid Argument] 1st argument is not valid in 'onBtnKeydown' method.");
            return;
        }
        const $focusables = this.$(Dialog.FOCUSABLE_SELECTOR + ":visible");

        switch (event.which) {
            case 9: // Tab key
                if (event.shiftKey && $focusables.index($(event.currentTarget)) === 0) {
                    console.info("[Dialog] Shift tab on 1st elem, Focusing on last element");
                    event.preventDefault();
                    event.stopPropagation();
                    $focusables.eq($focusables.length - 1).focus();
                } else if (!event.shiftKey && $focusables.index($(event.currentTarget)) === $focusables.length - 1) {
                    console.info("[Dialog] Tab on last elem, Focusing on first element");
                    event.preventDefault();
                    event.stopPropagation();
                    $focusables.eq(0).focus();
                }
                break;
            case 27: // Escape key
                if (this.model.state === DialogModelPckg.eState.SHOWN) {
                    this.hide();
                }
                break;
        }
    }
}