import * as Backbone from "backbone";
import * as _ from "underscore";
import { Utilities } from "./../../../../helper/utilities";

import "./../../css/popup.styl";

import * as PopupModelPckg from "./../models/popup";

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

export interface CustomEventMap {
    "button-clicked": { event: JQuery.Event; popupView: Popup; btnId?: string };
}

export class Popup extends Backbone.View<PopupModelPckg.Popup> {
    public static FOCUSABLE_SELECTOR = "button";
    public model: PopupModelPckg.Popup;
    public template: HandlebarsTpl;
    public btnTemplate: HandlebarsTpl;
    public get $focusables(): JQuery<HTMLElement> { return this.$(Popup.FOCUSABLE_SELECTOR); }

    constructor(attr: any = {}) {
        if (attr.model === void 0) {
            attr.model = new PopupModelPckg.Popup();
        }
        if (attr.el === void 0) {
            Utilities.logger.warn("WARNING! el attribute must be provided for 'Popup' view to work");
        }
        super(attr);
        this.template = require("./../../tpl/popup.hbs");
        this.btnTemplate = require("./../../tpl/popup-btns.hbs");
        this.render();
        this.attachModelEvents();
    }

    public events() {
        return {
            "click button": "onBtnClicked"
        };
    }

    public attachModelEvents() {
        this.listenTo(this.model, "change:hasCloseBtn", this.renderCloseIconState);
        this.listenTo(this.model, "change:state", this.renderState);
        this.listenTo(this.model, "change:pretextIcon", this.renderPretextIcon);
        this.listenTo(this.model, "change:pretextIcon", this.renderPretextIconState);
        this.listenTo(this.model, "change:text", this.renderText);
    }

    /**
     * Appends current view into element.
     */
    public render() {
        super.render();
        this.$el.append(this.template(this.model.toJSON()));
        this.renderCloseIconState()
            .renderState()
            .renderPretextIconState()
            .renderPretextIcon()
            .renderText()
            .renderButtons()
            .attachKeydownListener();

        return this;
    }

    public renderCloseIconState() {
        const newCls = (this.model.hasCloseBtn) ? "showInlineBlock" : "hide";
        this.$(".close-icon-holder").removeClass("showInlineBlock hide").addClass(newCls);
        return this;
    }

    public renderState() {
        const newCls = (this.model.state === PopupModelPckg.Popup.eState.SHOWN) ? "show" : "hide";
        this.$(".popup-wrapper").removeClass("show hide").addClass(newCls);
        if (this.model.state === PopupModelPckg.Popup.eState.SHOWN) {
            // Focus on first button always
            this.$focusables.eq(0).focus();
            // this.$(".popup-main").focus();
        }
        return this;
    }

    public renderPretextIconState() {
        const newCls = (this.model.pretextIcon === "") ? "hide" : "showInlineBlock";
        this.$(".pretext-icon-holder").removeClass("showInlineBlock hide").addClass(newCls);
        return this;
    }

    public renderPretextIcon() {
        this.$(".pretext-icon-holder span")
            .removeAttr("class")
            .attr("class", "")
            .addClass(this.model.pretextIcon);

        return this;
    }

    public renderText() {
        this.$(".text-node").html(this.model.text);
        return this;
    }

    public renderButtons() {
        // Add button render code here..
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

    /**
     * Updates button lables according to Model data.
     * TODO: Update view of according to all attributes in `ButtonData`.
     */
    public updateButtons() {
        this.$(".buttons-holder .popup-button").each((index, elem) => {
            if (this.model.buttonsData[index] &&
                this.model.buttonsData[index].label &&
                typeof this.model.buttonsData[index].label === "string") {
                $(elem).find(".label-container").text(this.model.buttonsData[index].label);
            }
        });
    }

    /**
     * Sets model state to `HIDDEN`.
     * Thus renders new state accordingly.
     */
    public hide() {
        this.model.state = PopupModelPckg.eState.HIDDEN;
    }

    /**
     * Sets model state to `SHOWN`.
     * Thus renders new state accordingly.
     */
    public show() {
        this.model.state = PopupModelPckg.eState.SHOWN;
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

    private attachKeydownListener() {
        this.$focusables.keydown(this.onBtnKeydown.bind(this));
    }

    /**
     * Handler for any of the popup button's clicked event.
     * Triggers popup custom event 'button-clicked'.
     * @param event jQuery event object.
     */
    private onBtnClicked(event: JQuery.Event) {
        const btnId = $(event.currentTarget).attr("id");
        this.trigger("button-clicked", { event, popupView: this, btnId });
        if (this.model.dismissOnBtnClick) {
            this.model.state = PopupModelPckg.Popup.eState.HIDDEN;
        }
    }

    /**
     * Handler for any of the button's keydown event.
     *
     * @param event jQuery event object.
     */
    private onBtnKeydown(event: JQuery.Event) {
        if (event === void 0 || event.which === void 0 || event.shiftKey === void 0) {
            Utilities.logger.warn("[Invalid Argument] 1st argument is not valid in 'onBtnKeydown' method.");
            return;
        }
        const $focusables = this.$(Popup.FOCUSABLE_SELECTOR + ":visible");

        switch (event.which) {
            case 9: // Tab key
                if (event.shiftKey && $focusables.index($(event.currentTarget)) === 0) {
                    Utilities.logger.info("[Popup] Shift tab on 1st elem, Focusing on last element");
                    event.preventDefault();
                    event.stopPropagation();
                    $focusables.eq($focusables.length - 1).focus();
                } else if (!event.shiftKey && $focusables.index($(event.currentTarget)) === $focusables.length - 1) {
                    Utilities.logger.info("[Popup] Tab on last elem, Focusing on first element");
                    event.preventDefault();
                    event.stopPropagation();
                    $focusables.eq(0).focus();
                }
                break;
            case 27: // Escape key
                if (this.model.state !== PopupModelPckg.eState.HIDDEN) {
                    this.hide();
                }
            // break;
        }
    }
}
