import * as Backbone from "backbone";
import PlayerView from "./player";
import { HeaderMenuModel, MenuItem, eState } from "./../models/header-menu";
import { animationEvent } from "./footer";
import * as Handlebars from "handlebars";
import "../../css/header-menu.css";

export class HeaderMenuButtonClickedData {
    event: JQuery.Event;
    changed: boolean;
    itemIndex: number;
    item: MenuItem;
    changeType: string;
    $target: JQuery<HTMLButtonElement>;
}

export class HeaderMenuIconicTextClickedData {
    event: JQuery.Event;
    itemIndex: number;
    item: MenuItem;
    $target: JQuery<HTMLDivElement>;
}

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;
const partialTemplates: { [x: string]: HandlebarsTpl } = {
    "button-group": require("./../../tpl/partials/hm-button-group.hbs") as HandlebarsTpl,
    "iconic-text": require("./../../tpl/partials/hm-iconic-text.hbs") as HandlebarsTpl
};

export interface EventMap {
    "menu-hidden": HeaderMenuView;
}

export class HeaderMenuView extends Backbone.View<HeaderMenuModel> {
    public model: HeaderMenuModel;
    public menuTpl: HandlebarsTpl;
    public $headerMenuWrapper: JQuery<HTMLDivElement>;

    constructor(attr: Backbone.ViewOptions<HeaderMenuModel> = {}) {
        attr.el = "#menu-holder";
        super(attr);
        Handlebars.registerHelper('partialHMTmpls', function (data: MenuItem) {
            if (!data || !data.itemType) {
                console.error("No data found");
                return "";
            }
            if (partialTemplates[data.itemType]) {
                if (data.targetLink && data.tagName === "a") {
                    data.hasValidLink = true;
                } else {
                    data.hasValidLink = false;
                }
                return partialTemplates[data.itemType](data);
            } else {
                console.warn("Unknown partial Template found with name:", data.itemType);
                return "";
            }
        });
        this.menuTpl = require("./../../tpl/header-menu.hbs");
        this.render(true);
        this.$(".hm-focusable").keydown(this.onKeydown.bind(this));
    }

    events() {
        return {
            "click": "onWrapperClick",
            "click button.button": "onButtonClicked",
            "click .menu-item-container.iconic-text": "onMenuItemClicked",
            "keydown .button-group": "onSpinButtonKeydown"
        };
    }

    /**
     * Renders template.
     * Hides menu.
     */
    render(isHide = false) {
        this.$el.append(this.menuTpl(this.model.toJSON()));
        this.$headerMenuWrapper = this.$(".header-menu-wrapper") as JQuery<HTMLDivElement>;;
        this.$headerMenuWrapper.addClass(this.className);
        if (isHide) {
            this.hide();
        }
        this.$(".menu-item-container").not(".button-group").addClass("hm-focusable");
        this.$(".button").addClass("hm-focusable");
        return this;
    }

    /**
     * Handler for keydown event on focusable element
     * @param event jQuery's event object.
     */
    private onKeydown(event: JQuery.Event) {
        const $focusables = this.$(".hm-focusable");
        if (!$(event.target).hasClass("hm-focusable")) {
            return;
        }
        if (this.model.state === eState.HIDDEN) {
            return;
        }
        switch (event.which) {
            case 9:
                const elemIndex = $focusables.index($(event.target));
                if (event.shiftKey) {
                    if (elemIndex === 0) {
                        this.hide();
                    }
                } else {
                    if (elemIndex === $focusables.length - 1) {
                        this.hide();
                    }
                }
                PlayerView.Instance.trigger("resetHeaderIcon", {
                    currentTarget: PlayerView.Instance.$(".header-icons .icon-ellipses")
                });
                break;
            case 32:
            case 13:
                if (!$(event.target).hasClass("button") && !$(event.currentTarget).is("a")) {
                    $(event.target).click();
                    PlayerView.Instance.trigger("resetHeaderIcon", {
                        currentTarget: PlayerView.Instance.$(".header-icons .icon-ellipses")
                    });
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    event.preventDefault();
                }
                break;
            case 27:
                this.hide();
                PlayerView.Instance.$(".header-icons button.icon-ellipses").focus();
        }
    }

    /**
     * Handler to increase/decrease font size on keydown
     * @param event 
     */
    onSpinButtonKeydown(event: any) {
        switch (event.which) {
            case 38://up key
            case 39://right key
                this.$(".plus-button").trigger("click");
                event.stopPropagation();
                event.preventDefault();
                break;

            case 37:
            case 40:
                this.$(".minus-button").trigger("click");
                event.stopPropagation();
                event.preventDefault();
                break;
        }
    }

    /**
     * Hides current header.
     * @param animate whether to show animation or not.
     */
    hide(animate = true) {
        if (!animate) {
            this.$headerMenuWrapper.hide();
            this.model.state = eState.HIDDEN;
            this.$headerMenuWrapper.removeClass("animated");
            this.trigger("menu-hidden", this);
            this.$el.hide();
            return;
        }
        this.$headerMenuWrapper.off(animationEvent).one(animationEvent, () => {
            this.$headerMenuWrapper.hide();
            this.model.state = eState.HIDDEN;
            this.$headerMenuWrapper.removeClass("animated");
            this.trigger("menu-hidden", this);
            this.$el.hide();
        });
        this.$headerMenuWrapper.removeClass("openMenu").addClass("animated closeMenu");
    }

    /**
     * Shows current header.
     * @param animate whether to show animation or not.
     */
    show(animate = true) {
        if (!animate) {
            this.$el.show();
            this.$headerMenuWrapper.show();
            this.$(".hm-focusable").eq(0).focus();
            this.model.state = eState.SHOWN;
            this.$headerMenuWrapper.removeClass("animated");
            return;
        }
        this.$headerMenuWrapper.off(animationEvent).one(animationEvent, () => {
            this.$headerMenuWrapper.removeClass("animated");
        });
        this.$headerMenuWrapper.removeClass("closeMenu").addClass("animated openMenu");
        this.$el.show();
        this.$headerMenuWrapper.show();
        this.$(".hm-focusable").eq(0).focus().tooltip("hide");
        this.model.state = eState.SHOWN;
    }

    /**
     * Handler on wrapper clicked event.
     * Hides whole view.
     * @param event 
     */
    private onWrapperClick(event: JQuery.Event) {
        if ($(event.target).attr("id") === "menu-holder") {
            this.hide();
            PlayerView.Instance.trigger("resetHeaderIcon", {
                currentTarget: PlayerView.Instance.$(".header-icons .icon-ellipses")
            });
            PlayerView.Instance.$(".header-icons button.icon-ellipses").focus();
        }
    }

    /**
     * Handler for any of the buttons clicked event.
     * Triggers "menu-button-clicked" event with HeaderMenuButtonClickedData.
     * @param event Event object.
     */
    private onButtonClicked(event: JQuery.Event) {
        if (this.model.state === eState.HIDDEN) {
            return;
        }
        let $target = $(event.target);
        if (!$target.hasClass("button")) {
            $target = $target.closest(".button");
        }
        const itemIndex = $target.closest(".menu-item-container").index();
        const item = this.model.items[itemIndex];
        let changeType = "none";
        let changed = false;
        if ($target.hasClass("minus-button")) {
            const res = item.percent - item.percentChange;
            if (res > 25 && res <= 200) {
                item.percent = res;
                changed = true;
                changeType = "reduced";
                const $item = this.$(".menu-item-container").eq(itemIndex);
                $item.find(".text-indicator").html(res + "%");
                $item.closest(".menu-item-container").attr("aria-valuenow", res)
                    .attr("aria-valuetext", res + "% Font size");
                $target.toggleClass("disabled", res === 50)
                    .prop("disabled", res === 50);
                $item.find(".plus-button")
                    .toggleClass("disabled", !(res < 200))
                    .prop("disabled", !(res < 200));
                if (res === 50) {
                    this.$("button.plus-button").focus();
                }
            }
        } else if ($target.hasClass("plus-button")) {
            const res = item.percent + item.percentChange;
            if (res > 25 && res <= 200) {
                item.percent = res;
                changed = true;
                changeType = "incremented";
                const $item = this.$(".menu-item-container").eq(itemIndex);
                $item.find(".text-indicator").html(res + "%");
                $item.closest(".menu-item-container").attr("aria-valuenow", res)
                    .attr("aria-valuetext", res + "% Font size");
                $target.toggleClass("disabled", res === 200)
                    .prop("disabled", res === 200);
                $item.find(".minus-button")
                    .toggleClass("disabled", !(res > 50))
                    .prop("disabled", !(res > 50));
                if (res === 200) {
                    this.$("button.minus-button").focus();
                }
            }

        }
        $target.tooltip("hide");
        this.trigger("menu-button-clicked", { event, changed, itemIndex, item, changeType, $target });
    }

    /**
     * Handler for any of the buttons clicked event.
     * Triggers "menu-iconic-text-clicked" event with HeaderMenuIconicTextClickedData.
     * @param event Event object.
     */
    private onMenuItemClicked(event: JQuery.Event) {
        if (this.model.state === eState.HIDDEN) {
            return;
        }
        let $target = $(event.target);
        if (!$target.hasClass("iconic-text")) {
            $target = $target.closest(".iconic-text");
        }
        const itemIndex = $target.index();
        const item = this.model.items[itemIndex];
        this.trigger("menu-iconic-text-clicked", { event, $target, itemIndex, item });
    }

    /**
     * Adds custom event listner on current view.
     * @param event EventMap key event name.
     * @param callback Listener for custom event.
     * @param context Optional context to bind on listner.
     */
    public addListener<E extends keyof EventMap>(event: E, callback: (data: EventMap[E]) => any, context?: any) {
        if (context !== void 0 && context !== null && typeof context === "object") {
            callback = callback.bind(context);
        }
        return this.on(event, callback);
    }
}