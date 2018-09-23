import * as Backbone from "backbone";
import PlayerView from "./player";
import { PanelDataList, PanelModel, eState, eTemplateType } from "./../models/panel";
import * as Handlebars from "handlebars";
import MenuModel from "../models/item-model";
import { animationEvent } from "./footer";
import "../../css/panel.css";
import * as _ from "underscore";

const Mark = require('mark.js');
const scrollIntoView = require('scroll-into-view');

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

export class PanelView extends Backbone.View<PanelModel<any>> {
    public static FOCUSABLES_SEL: string[] = [".panel-main-container a", ".panel-main-container button"];
    public model: PanelModel<any>;
    public panelTpl: HandlebarsTpl;
    public panelContentTpl: HandlebarsTpl;
    public mark: any;
    public isTimerRunning: boolean;
    public timerId: any;
    private get $focusables(): JQuery<HTMLElement> { return this.$(PanelView.FOCUSABLES_SEL.join(", ")); };

    constructor(attr: Backbone.ViewOptions<PanelModel<any>> = {}) {
        super(attr);
        if (!this.model) {
            this.model = new PanelModel();
        }
        this.panelTpl = require("./../../tpl/panel.hbs");
        this.panelContentTpl = require("./../../tpl/partials/panel-content.hbs");
        this.render();
        if (this.model.templateType === eTemplateType.ALPHA_LIST) {
            this.model.fetch({
                success: this.onFetchSuccess.bind(this),
                error: function () {
                    console.log('Failed to fetch!');
                }
            });
        }
        this.model.on("change:state", this.onStateChanged.bind(this));
        this.mark = new Mark(this.$(".panel-main-container").get(0));
    }

    events() {
        return {
            "click .close-icon-holder button.panel-button": "onPanelCloseBtnClicked",
            "click .remove-item": "onRemoveItemBtnClicked",
            "input .panel-search-container input": "onSearchInput"
        };
    }

    /**
     * Applies current template and renders panel content.
     */
    render() {
        this.$el.addClass("panel-wrapper");
        this.$el.html(this.panelTpl(this.model.toJSON()));
        this.updatePanelContent();
        return this;
    }

    /**
     * Hides current view.
     */
    hide() {
        this.model.state = eState.HIDDEN;
        this.clearSearchInput();
    }

    /**
     * Shows current view.
     */
    show() {
        this.model.state = eState.SHOWN;
        this.isTimerRunning = false;
    }

    /**
     * Toggles current view.
     */
    toggle() {
        switch (this.model.state) {
            case eState.HIDDEN:
                this.show();
                break;
            case eState.SHOWN:
                this.hide();
                break;
        }
        return this.model.state;
    }

    /**
     * Updates view with current list in model.
     */
    updatePanelContent(newList = this.model.list) {
        if (this.model.templateType === eTemplateType.ALPHA_LIST) {
            const clonedList: PanelDataList[] = JSON.parse(JSON.stringify(newList));
            clonedList.sort((a: PanelDataList, b: PanelDataList) => {
                return a.term.localeCompare(b.term);
            });
            const newObj = _.groupBy(clonedList, (value: PanelDataList, index: number, list: PanelDataList[]) => {
                return value.term.charAt(0).toUpperCase();
            });
            const contentArr = this.dictionaryToArray(newObj);
            this.$(".panel-main-container").html(this.panelContentTpl(contentArr));
            this.$(".panel-main-container .item-text-holder a").on("click", this.scrollToLinkTarget.bind(this));
        } else {
            this.$(".panel-main-container").html(this.model.templateFnc(newList));
        }
    }

    /**
     * Scroll glossary term in view on link click.
     * @param event jQuery event object.
     */
    scrollToLinkTarget(event: JQuery.Event) {
        let $target = $(event.target),
            scrollTarget = this.$(".panel-main-container .items-holder[data-id='" + $target.attr("data-target") + "']")[0];

        this.clearSearchInput();
        scrollIntoView(scrollTarget, {
            "align": {
                "top": 0.01
            },
            "isScrollable": function (target: any, defaultIsScrollable: any) {
                return defaultIsScrollable(target) || $(target).hasClass('scrollable');
            }
        });
    }

    /**
     * Converts underscore dictionary to array struct.
     * @param obj input dictionary object.
     */
    dictionaryToArray(obj: _.Dictionary<PanelDataList[]>) {
        const retArr: { alphabet: string; items: PanelDataList[] }[] = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                retArr.push({
                    alphabet: key,
                    items: obj[key]
                });
            }
        }
        return retArr;
    }

    /**
     * Handler for model's state changed event.
     * Hides / Shows view according to state.
     */
    onStateChanged() {
        switch (this.model.state) {
            case eState.HIDDEN:
                this.hidePanel();
                break;
            case eState.SHOWN:
                this.showPanel();
                break;
        }
    }

    /**
     * Handler for panel's hidden state
     * @param animate whether to show animation or not.
     */
    hidePanel(animate = true) {
        if (!animate) {
            this.$el.removeClass("animated");
            this.$el.hide();
            this.trigger("panel-hidden", { panel: this });
            return;
        }
        this.$el.off(animationEvent).one(animationEvent, () => {
            this.$el.removeClass("animated");
            this.$el.hide();
            this.trigger("panel-hidden", { panel: this });
        });
        this.$el.removeClass("pageFadeIn").addClass("animated pageFadeOut");
    }

    /**
     * Handler for panel's shown state
     * @param animate whether to show animation or not.
     */
    showPanel(animate = true) {
        if (!animate) {
            this.$el.removeClass("animated");
            this.$el.show();
            this.trigger("panel-shown", { panel: this });
            return;
        }
        this.$el.off(animationEvent).one(animationEvent, () => {
            this.$el.removeClass("animated");
        });
        this.$el.removeClass("pageFadeOut").addClass("animated pageFadeIn");
        this.$el.show();
        this.trigger("panel-shown", { panel: this });
    }

    /**
     * Handler for panel's close button holder.
     * @param event jQuery event object.
     */
    onPanelCloseBtnClicked(event: JQuery.Event) {
        PlayerView.Instance.trigger("resetHeaderIcon");
        this.hide();
        this.trigger("main-panel-shown");
    }

    /**
     * Success callback for fetch, updates list and updates view.
     * @param model fatched panel model.
     * @param result fetch results.
     */
    onFetchSuccess(model: PanelModel<any>, result: { glossary: PanelDataList[] }) {
        this.model.list = result.glossary;
        this.updatePanelContent();
    }

    /**
     * Handler for search box's change event.
     * @param event jQuery event object.
     */
    onSearchInput(event: JQuery.Event) {
        if (!this.isTimerRunning) {
            this.isTimerRunning = true;
            this.timerId = window.setTimeout(() => {
                const newVal: string = this.$(".panel-search-container input").val() as string;
                this.searchAndHighlight(newVal);
                this.isTimerRunning = false;
                window.clearTimeout(this.timerId);
            }, 250);
        }
    }

    searchAndHighlight(newVal: string = this.$(".panel-search-container input").val() as string) {
        this.$(".hide-section, .hide-alpha-section, .highlight-section").removeClass("hide-section hide-alpha-section highlight-section");
        this.mark.unmark();
        newVal = newVal.trim();
        if (newVal === "") {
            return;
        }
        let callback: () => any;
        if (this.model.templateType === eTemplateType.ALPHA_LIST) {
            callback = () => {
                this.$(".panel-main-container div.fluid-container .items-holder").each((index: number, element: HTMLElement) => {
                    if ($("mark", element).length === 0) {
                        $(element).addClass("hide-section");
                    }
                });
                this.$(".panel-main-container div.fluid-container").each((index: number, element: HTMLElement) => {
                    if ($(".alphabet-holder ~ .items-holder mark", element).length === 0) {
                        $(element).addClass("hide-alpha-section");
                    }
                });
            };
        } else {
            callback = () => {
                this.$(".panel-main-container div.fluid-container").each((index: number, element: HTMLElement) => {
                    if ($("mark", element).length === 0) {
                        $(element).addClass("hide-section");
                    }
                });
            }
        }
        this.mark.unmark({
            done: () => {
                this.mark.mark(newVal, {
                    exclude: [".alphabet-holder div"],
                    done: callback,
                    separateWordSearch: false
                });
            }
        });
    }

    /**
     * Handler for panel's remove button's click event.
     * Remove current from list.
     * @param event jQuery event object.
     */
    onRemoveItemBtnClicked(event: JQuery.Event) {
        let $target = $(event.target);
        if (!$target.hasClass("remove-item")) {
            $target = $target.closest("button.remove-item");
        }
        const index = $target.data("index");
        this.removeItemByIndex(index);
        // To fix, after deletion bookmarks wont stay highlighted.
        if (this.$(".panel-search-container input").val() !== "") {
            this.searchAndHighlight();
        }
        this.$(".panel-main-container").focus();
    }

    /**
     * Removes item from list by index.
     * @param index to map item from list.
     */
    removeItemByIndex(index: number) {
        const item = this.model.list[index];
        const $bookmarkIcon = PlayerView.Instance.$(".icon-container>button");
        this.model.list.splice(index, 1);
        PlayerView.Instance.model.sideMenuCollection.forEachModel((model: MenuModel, counter: number, depth: number, parentModel: MenuModel) => {
            if (model.hash === item.hash) {
                model.bookmark = false;
                return true;
            }
        });
        this.updatePanelContent();
        if (PlayerView.Instance.model.activeModel.hash === item.hash) {
            $bookmarkIcon.removeClass("icon-bookmarked").addClass("icon-bookmark");
            $bookmarkIcon.attr("aria-label", PlayerView.Instance.model.unbookmarkedAccText);
        }
        PlayerView.Instance.sideMenu.showHideBookMarkIcon(item.hash, false);
        PlayerView.Instance.model.updateSavedData();
    }

    /**
     * Toggles item from current list.
     * @param activeModel Currently active chunk (chunk whose bookmark to be toggled).
     */
    toggleItemStateFromList(activeModel: MenuModel) {
        const bookmark = _.findWhere(this.model.list, { hash: activeModel.hash });
        if (this.model.list.indexOf(bookmark) === -1) {
            const tabs = PlayerView.Instance.model.sideMenuCollection.getParentModels(activeModel);
            const pageNo = PlayerView.Instance.model.sideMenuCollection.getPageNoByModel(activeModel);
            tabs.pop();
            this.model.list.push({
                hash: activeModel.hash,
                refid: activeModel.refid,
                text: activeModel.text,
                tabs,
                pageNo
            });
        } else {
            this.model.list.splice(this.model.list.indexOf(bookmark), 1);
        }
        this.updatePanelContent();
    }

    clearSearchInput() {
        this.isTimerRunning = false;
        window.clearTimeout(this.timerId);
        this.$(".panel-search-container input").val("");
        this.searchAndHighlight("");
    }
}