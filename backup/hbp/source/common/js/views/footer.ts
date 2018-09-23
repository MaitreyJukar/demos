import * as Backbone from "backbone";
import * as Handlebars from "handlebars";
import FooterModel from "../models/footer";
import { MenuItemChunk } from "../views/side-menu";
import Player from "../views/player";
import SideMenuCollection from "../collections/side-menu";
import MenuModel from "../models/item-model";
import "../../css/footer.css";
import "bootstrap/dist/js/bootstrap.min";
import "bootstrap/dist/css/bootstrap.min.css";

declare class MenuModelExt extends MenuModel {
    isActive?: boolean;
    index?: number;
    idPrefix?: string;
}

export const animationEvent: string = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

export default class FooterView extends Backbone.View<FooterModel> {
    public static UP_DOWN_NAVIGATION: boolean = true;
    public tabs: Array<any>;
    public template: (attr?: { [x: string]: any }) => string;
    public menuItemTpl: (attr?: { [x: string]: any }) => string;
    public menuTpl: (attr?: { heighlightIndex: number; menuModels: MenuModel[]; }) => string;
    public pageNavItemsTpl: (attr?: { [x: string]: any }) => string;
    public model: FooterModel;
    public $footerMenuParentWrapper: JQuery<HTMLDivElement>;
    public $footerMenuWrapper: JQuery<HTMLDivElement>;
    public $footerMenuContainer: JQuery<HTMLDivElement>;
    public $sideMenu: JQuery<HTMLDivElement>;

    constructor() {
        super({ el: "footer" });
    }

    /**
     * Events of footer view.
     */
    events(): Backbone.EventsHash {
        return {
            "click button.menu-button": "onMenuBtnClicked",
            "click .footer-menu-wrapper": "onFooterWrapperClicked",
            /* "click .footer-menu-wrapper a": "hideFooterMenu", */
            "click .items .item-link a": "onNextPrevBtnClicked"
        };
    }

    /**
     * Constructor for footer view.
     */
    initialize() {
        this.registerTemplateHelpers();
        this.registerTemplatePartials();
        this.model = new FooterModel();
        this.render();
        this.bindModelEvents();
        this.cacheElements();
        this.attachEvents();
    }

    /**
     * Handler for keydown event bound on window.
     * Hides footer if escape button was pressed on footer menu focused.
     * @param eve jQuery event object.
     */
    private onKeydown(eve: JQuery.Event) {
        const $currTarget = $(eve.target);
        if (this.$el.has($currTarget.get(0)).length === 1) {
            if (eve.which === 27) {
                this.hideFooterMenu();
                this.$(".center-items button.menu-button").focus();
            }
        }
    }

    /**
     * Registers helpers for rendering footer items using Handlebars
     */
    private registerTemplateHelpers() {
        Handlebars.registerHelper('footerItem', (menuModel: MenuModel, index: number, heighlightIndex: number) => {
            const newModel: MenuModelExt = JSON.parse(JSON.stringify((typeof menuModel.toJSON === "function") ? menuModel.toJSON() : menuModel));
            newModel.isActive = (index === heighlightIndex);
            newModel.index = index + 1;
            return this.menuItemTpl(newModel);
        });

        Handlebars.registerHelper('ifCond', (v1: any, o1: string, v2: any, options: any) => {
            return this.compareValues(v1, v2, o1) ? options.fn(this.model) : options.inverse(this.model);
        });
    }
    /**
     * Registers templates and partials for footer menu
     */
    private registerTemplatePartials() {
        this.template = require("../../tpl/footer.hbs");
        this.menuTpl = require("../../tpl/footer-menu.hbs");
        this.menuItemTpl = require("../../tpl/partials/footer-menu-item.hbs");
        this.pageNavItemsTpl = require("../../tpl/partials/page-navigation-item.hbs");
    }

    /**
     * Renders current view with template.
     */
    render() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
    /**
     * Binds model change listeners
     */
    private bindModelEvents() {
        this.model.on('change:activeTabUrl', this.onActiveTabURLChanged, this);
    }
    /**
     * Caches all elements to prevent excessive DOM traversal
     */
    private cacheElements() {
        this.$footerMenuParentWrapper = Player.Instance.$(".footer-menu-parent-wrapper") as JQuery<HTMLDivElement>;
        this.$footerMenuWrapper = this.$footerMenuParentWrapper.find(".footer-menu-wrapper") as JQuery<HTMLDivElement>;
        this.$footerMenuContainer = this.$footerMenuParentWrapper.find(".footer-menu-container") as JQuery<HTMLDivElement>;
        this.$sideMenu = Player.Instance.$("#side-menu") as JQuery<HTMLDivElement>;
    }
    /**
     * Attaches events to DOM elements
     */
    private attachEvents() {
        this.$footerMenuWrapper.on("click", this.onFooterWrapperClicked.bind(this));
        Player.Instance.$(".footer-menu-modal").on("click", this.onFooterWrapperClicked.bind(this));
        $(window).resize(this.onResize.bind(this));
    }

    private onResize(event: JQuery.Event) {
        const $activeElem = $(document.activeElement);
        if ($activeElem.hasClass("menu-link")) {
            const href = $activeElem.attr("href");
            $("a.menu-link[href='" + href + "']:visible").focus();
        }
    }

    /**
     * Handler for footer's menu button clicked event.
     * Opens current pages popup.
     * @param event jQuery's event object.
     */
    private onMenuBtnClicked(event: JQuery.Event) {
        if (this.$(".menu-button").hasClass("selected")) {
            this.hideFooterMenu(event);
        } else {
            this.showFooterMenu();
        }
    }

    /**
     * Handler for model's activeTabURL value changed event.
     * Renders footer according to current active tab.
     */
    onActiveTabURLChanged() {
        if (!this.model.activeModel) {
            console.warn("No active model found!");
            return;
        }
        const sideMnuCollection = Player.Instance.model.sideMenuCollection;
        let found = false;
        let nxtModel: MenuModel;
        let preModel: MenuModel;
        let prepreModel: MenuModel;
        let preActiveModel: MenuModel;
        let prepreActiveModel: MenuModel;
        let nxtDep: number = -1;
        let nxtIndex: number = 0;
        let preDep: number = -1;
        let prepreDep: number = -1;
        let preIndex: number = 0;
        let prepreIndex: number = 0;
        let rightLink: string;

        this.model.isShowCenter = this.model.activeModel.subMenuItems.models.length === 0;

        this.model.linksCollection.forEachModel((model: MenuModel, counter: number, depth: number, parentModel: MenuModel) => {
            if (found) {
                if (nxtModel == void 0) {
                    nxtModel = model;
                    nxtDep = depth;
                    nxtIndex = counter + 1;
                }
                if (model.hash) {
                    rightLink = model.hash;
                    found = false;
                    return true;
                }
            } else {
                if (model === this.model.activeModel) {
                    found = true;
                    if (parentModel) {
                        this.model.current = counter + 1;
                        this.model.max = parentModel.subMenuItems.models.length;
                    } else {
                        prepreActiveModel = preActiveModel;
                    }
                }
                if (!parentModel) {
                    preActiveModel = model;
                }
                if (preModel && preModel.hash) {
                    prepreModel = preModel;
                    prepreDep = preDep;
                    prepreIndex = preIndex;
                }
                preModel = model;
                preDep = depth;
                preIndex = counter + 1;
            }
        });
        this.model.rightLink = rightLink ? "#" + rightLink : ((nxtModel) ? "#" + nxtModel.hash : "#" + this.model.activeModel.hash);
        this.model.leftLink = (prepreModel) ? "#" + prepreModel.hash : "#" + this.model.activeModel.hash;
        this.model.nextLabel = (this.model.linksCollection.levelLables[nxtDep]) ? this.model.linksCollection.levelLables[nxtDep] : "";
        if (nxtDep === this.model.linksCollection.levelLables.length - 2 && nxtModel && nxtModel.subMenuItems.models.length === 0) {
            this.model.nextLabel = this.model.linksCollection.levelLables[this.model.linksCollection.levelLables.length - 1];
        }
        this.model.prevLabel = (this.model.linksCollection.levelLables[prepreDep]) ? this.model.linksCollection.levelLables[prepreDep] : "";
        if (prepreDep === this.model.linksCollection.levelLables.length - 2 && prepreModel && prepreModel.subMenuItems.models.length === 0) {
            this.model.prevLabel = this.model.linksCollection.levelLables[this.model.linksCollection.levelLables.length - 1];
        }
        this.model.currLabel = (this.model.linksCollection.levelLables[preDep]) ? this.model.linksCollection.levelLables[preDep] : "";
        if (preDep === this.model.linksCollection.levelLables.length - 2 && this.model.activeModel && this.model.activeModel.subMenuItems.models.length === 0) {
            this.model.currLabel = this.model.linksCollection.levelLables[this.model.linksCollection.levelLables.length - 1];
        }
        this.model.nextLinkText = (nxtModel) ? nxtModel.text : "";
        this.model.prevLinkText = (prepreModel) ? prepreModel.text : "";
        this.model.nextLinkIndex = nxtIndex;
        this.model.prevLinkIndex = prepreIndex;
        this.model.leftLink = (this.model.currLabel == "Chapter" && prepreActiveModel) ? "#" + prepreActiveModel.hash : this.model.leftLink;
        this.model.prevLinkText = (this.model.currLabel == "Chapter" && prepreActiveModel) ? prepreActiveModel.text : this.model.prevLinkText;

        let elemSelector: string = "";
        const $currFocusedElem = $(document.activeElement);
        if (this.isCurrentlyFocused()) {
            switch (true) {
                case $currFocusedElem.hasClass("right button"):
                    elemSelector = ".right-items.items .item-link a";
                    break;
                case $currFocusedElem.hasClass("left button"):
                    elemSelector = ".left-items.items .item-link a";
                    break;
                case $currFocusedElem.hasClass("menu-link"):
                    elemSelector = "button.menu-button";
                    break;
                case $currFocusedElem.closest(".right-items.items").length !== 0:
                    elemSelector = ".right-items.items .item-link a";
                    break;
                case $currFocusedElem.closest(".left-items.items").length !== 0:
                    elemSelector = ".left-items.items .item-link a";
                    break;
            }
        }

        this.$el.html(this.template(this.model.toJSON()));
        this.$(".footer-menu-modal").on("click", this.onFooterWrapperClicked.bind(this));
        this.cacheElements();
        Player.Instance.$(".page-nav-items-holder").html(this.pageNavItemsTpl(this.model.toJSON()));
        this.renderFooterMenu(elemSelector !== "");
        if (elemSelector) {
            this.$(elemSelector).focus();
        }

        const prevAriaLabel = "Previous " + this.model.prevLabel + ", " + sideMnuCollection.getModelByHash(this.model.leftLink.replace("#", "")).text;
        const nextAriaLabel = "Next " + this.model.nextLabel + ", " + sideMnuCollection.getModelByHash(this.model.rightLink.replace("#", "")).text;
        this.$(".left-items .item-link a").attr("aria-label", prevAriaLabel);
        this.$(".right-items .item-link a").attr("aria-label", nextAriaLabel);

        this.trigger("footer-ready");
    }

    /**
     * Returns true if active elements is a child of current element, otherwise false.
     */
    private isCurrentlyFocused() {
        return this.$el.has(document.activeElement).length === 1;
    }

    /**
     * Renders footer menu as per menu models.
     */
    private renderFooterMenu(isAnimateOnHide = false) {
        let parentModelC: MenuModel;
        let menuModels = [] as MenuModel[];
        let heighlightIndex: number = -1;
        this.model.linksCollection.forEachModel((model: MenuModel, counter: number, depth: number, parentModel: MenuModel) => {
            if (model === this.model.activeModel && parentModel) {
                parentModelC = parentModel;
                return true;
            }
        });
        heighlightIndex = this.model.current - 1;
        menuModels = (parentModelC) ? parentModelC.subMenuItems.models : menuModels;
        let tplObj = { ...{ menuModels }, ...{ heighlightIndex } };
        this.$footerMenuWrapper.find(".footer-menu-container").html(this.menuTpl(tplObj));

        tplObj = JSON.parse(JSON.stringify(tplObj));
        tplObj.menuModels.forEach((value, index, array) => {
            let newArr: MenuModelExt[] = tplObj.menuModels;
            newArr[index].idPrefix = "-mobile";
        });
        $(".mobile-footer-menu .footer-menu-container").html(this.menuTpl(tplObj));

        this.$footerMenuWrapper.find(".close-icon-holder button").on("click", this.hideFooterMenu.bind(this));
        this.$footerMenuWrapper.find("a").on("keydown", this.onFooterMenuItemKeydown.bind(this));
        this.$footerMenuWrapper.find("a").keydown(this.onKeydown.bind(this));
        this.$(".center-items button.menu-button").keydown(this.onKeydown.bind(this));
        this.hideFooterMenu(void 0, isAnimateOnHide);
    }

    /**
     * Hides footer menu (wrapper) with slideUp animation.
     * @param animate whether to show animation or not.
     */
    private hideFooterMenu(event: any = {}, animate = true) {
        let $target = $(event.currentTarget),
            isFooterMenuLink = $target.is('a') && $target.parents('.footer-menu-wrapper').length;
        const cachedEve = event;
        if (!animate) {
            this.$footerMenuContainer.removeClass("animated");
            this.$footerMenuWrapper.hide();
            Player.Instance.$(".footer-menu-modal").hide();
            return;
        }
        if (isFooterMenuLink) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.$sideMenu.removeClass("is-behind");
        this.$footerMenuWrapper.addClass("on-top");
        this.$footerMenuContainer.off(animationEvent).one(animationEvent, () => {
            this.$footerMenuWrapper.hide();
            Player.Instance.$(".footer-menu-modal").hide();
            this.$footerMenuWrapper.removeClass("on-top");
            this.$footerMenuContainer.removeClass("animated");
            if (isFooterMenuLink && window.location.hash !== $target.attr("href") && cachedEve && cachedEve.type !== "keydown") {
                this.trigger('page-updated');
                window.location.hash = $target.attr("href");
            }
            this.$(".menu-button").removeClass("selected");
        });
        this.$footerMenuContainer.removeClass("slideUp").addClass("animated slideDown");
    }

    /**
     * Shows footer menu (wrapper) with slideDown animation.
     * @param animate whether to show animation or not.
     */
    private showFooterMenu(animate = true) {
        if (!animate) {
            this.$footerMenuContainer.removeClass("animated");
            this.$footerMenuWrapper.show();
            Player.Instance.$(".footer-menu-modal").show();
            return;
        }
        this.$sideMenu.addClass("is-behind");
        this.$footerMenuWrapper.addClass("on-top");
        this.$footerMenuContainer.off(animationEvent).one(animationEvent, () => {
            this.$footerMenuWrapper.removeClass("on-top");
            this.$footerMenuContainer.removeClass("animated");
        });
        this.$footerMenuContainer.removeClass("slideDown").addClass("animated slideUp");
        this.$footerMenuWrapper.show();
        Player.Instance.$(".footer-menu-modal").show();
        this.$(".menu-button").addClass("selected");
    }

    /**
     * Handler on footer's wrapper div click.
     * Hides footer menu.
     * @param event jQuery event object.
     */
    private onFooterWrapperClicked(event: JQuery.Event) {
        if ($(event.target).hasClass("footer-menu-wrapper") || $(event.target).hasClass("footer-menu-modal")) {
            this.hideFooterMenu(event);
        }
    }

    /**
     * Handler on footer's menu item keydown.
     * Hides footer menu if tab pressed on last elem or shift-tab on 1st elem.
     * @param event jQuery event object.
     */
    private onFooterMenuItemKeydown(event: JQuery.Event) {
        const $focusables = this.$footerMenuWrapper.find("a:visible");
        const elemIndex = $focusables.index($(event.target));

        switch (event.which) {
            case 9:
                if (event.shiftKey) {
                    if (elemIndex === 0) {
                        this.hideFooterMenu(event);
                        this.$("button.menu-button").focus();
                    }
                } else {
                    if (elemIndex === $focusables.length - 1) {
                        this.hideFooterMenu(event);
                        this.$("button.menu-button").focus();
                    }
                }
                break;
            case 38:
                if (FooterView.UP_DOWN_NAVIGATION) {
                    if (elemIndex === 0) {
                        this.hideFooterMenu(event);
                        this.$("button.menu-button").focus();
                    } else {
                        $focusables.eq(elemIndex - 1).focus();
                    }
                }
                break;
            case 40:
                if (FooterView.UP_DOWN_NAVIGATION) {
                    if (elemIndex === $focusables.length - 1) {
                        this.hideFooterMenu(event);
                        this.$("button.menu-button").focus();
                    } else {
                        $focusables.eq(elemIndex + 1).focus();
                    }
                }
                break;
        }
    }

    /**
     * Returns active tab list by using recursive method.
     */
    private getTabListRecrsv() {
        let tabs = [];
        if (this.model.activeModel === void 0 || this.model.activeModel === null) {
            if (this.model.linksCollection.length > 0) {
                tabs.push(this.model.linksCollection.models[0]);
            }
        } else {
            const arr: MenuModel[] = [];
            let res = this.getActiveTabs(this.model.linksCollection.models, arr);
            res = res.reverse();
            tabs = res;
        }
        return tabs;
    }

    /**
     * Returns active tab list indexes by using recursive method.
     */
    private getTabListIndxesRecrsv() {
        let tabs = [];
        if (this.model.activeModel === void 0 || this.model.activeModel === null) {
            if (this.model.linksCollection.length > 0) {
                tabs.push(0);
            }
        } else {
            const arr: any[] = [];
            let res = this.getActiveIndex(this.model.linksCollection.models, arr);
            res = res.reverse();
            tabs = res;
        }
        return tabs;
    }

    /**
     * Returns active tabs array from given chunks.
     * @param linkChunk array of menu chunks.
     * @param res Result array.
     * @param activeModel Optional active link URL.
     */
    private getActiveTabs(linkChunk: MenuModel[], res: MenuModel[], activeModel?: MenuModel) {
        if (activeModel === void 0) { activeModel = this.model.activeModel; }
        let count = 0;
        for (const child of linkChunk) {
            if (child === activeModel) {
                res.push(child);
                return res;
            }
            if (child.subMenuItems && child.subMenuItems.models && child.subMenuItems.models.length !== 0) {
                const oldResLen = res.length;
                res = this.getActiveTabs(child.subMenuItems.models, res);
                if (oldResLen !== res.length) {
                    res.push(child);
                }
            }
            count++;
        }
        return res;
    }

    /**
     * Returns active indexes array from given chunks.
     * @param linkChunk array of menu chunks.
     * @param res Result array.
     * @param activeLinkUrl Optional active link URL.
     */
    private getActiveIndex(linkChunk: MenuModel[], res: number[], activeModel?: MenuModel) {
        if (activeModel === void 0) { activeModel = this.model.activeModel; }
        let count = 0;
        for (const child of linkChunk) {
            if (child === activeModel) {
                res.push(count);
                return res;
            }
            if (child.subMenuItems && child.subMenuItems.models && child.subMenuItems.models.length !== 0) {
                const oldResLen = res.length;
                res = this.getActiveIndex(child.subMenuItems.models, res);
                if (oldResLen !== res.length) {
                    res.push(count);
                }
            }
            count++;
        }
        return res;
    }

    /**
     * Converts a tree form into a serial array.
     * Calls recursively.
     * @param linkChunk Array of menu items.
     * @param res Optional, resulting array to be returned.
     */
    private treeToArr(linkChunk: MenuModel[], res: MenuModel[] = []) {
        for (const child of linkChunk) {
            res.push(child);
            if (child.subMenuItems && child.subMenuItems.models) {
                res = this.treeToArr(child.subMenuItems.models, res);
            }
        }
        return res;
    }

    /**
     * Compares variables using operator and returns result
     * @param v1 variable 1
     * @param v2 variable 2
     * @param o1 operator string
     */
    private compareValues(v1: any, v2: any, o1: string) {
        let result: boolean;
        switch (o1) {
            case "==":
                result = v1 == v2;
                break;
            case "!=":
                result = v1 != v2;
                break;
            default:
                result = false;
        }
        return result;
    }

    /**
     * trigger page-update event on page change.
     * @param event jQuery event object.
     */
    private onNextPrevBtnClicked(event: JQuery.Event) {
        let $target = $(event.currentTarget),
            isValidLink = $target.is('a') && $target.parents('.item-link').length && $target.attr('href');
        if (isValidLink) {
            this.trigger("page-updated");
            let oldElem: Element;
            if (this.isCurrentlyFocused()) {
                oldElem = document.activeElement;
            }
            // fix window.hash not changed in IE.
            window.location.hash = $target.attr('href');
            if (oldElem) {
                $(oldElem).focus();
            }
        }
    }
}