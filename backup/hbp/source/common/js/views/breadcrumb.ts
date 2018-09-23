import * as Backbone from "backbone";
import * as Handlebars from "handlebars";
import BreadcrumbsModel from "../models/breadcrumb";
import ItemModel from "../models/item-model";
import Player from "../views/player";
import { MenuItemChunk } from "../views/side-menu";
import "../../css/breadcrumbs.css";

export default class BreadcrumbsView extends Backbone.View<Backbone.Model> {
    public tabs: Array<any>;
    public template: any;
    public model: BreadcrumbsModel;

    constructor() {
        super({ el: "#breadcrumbs-container" });
    }

    initialize() {
        Handlebars.registerHelper('ifNotLast', function (array: any, index: any, options: any) {
            if (index != array.length - 1) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
        this.render();

        this.model = new BreadcrumbsModel();

        this.model.on('change', this.updateView, this);
        this.attachListeners();
    }

    render() {
        Handlebars.registerHelper("topic", function (index: number) {
            const hierarchy = ["Chapter", "Unit", "Topic"];
            return hierarchy[index];
        });
        this.template = require("../../tpl/breadcrumbs.hbs");
        this.$el.html(this.template());
        return this;
    }

    attachListeners() {
        this.$el.on("scroll", Player._instance.onScroll.bind(this, this.$el));
        $(window).resize(Player._instance.onScroll.bind(this, this.$el));
    }

    /**
     * Updates current view according to the active model.
     */
    updateView() {
        const hadFocus = this.elemContainsInMainEl();
        const oldFocusedElem = document.activeElement;
        let elemIndex = -1;
        if (hadFocus) {
            elemIndex = this.$("a").index(oldFocusedElem);
        }

        if (this.model.linksCollection.length > 0) {
            this.tabs = this.getTabListRecrsv();
            const serial = this.model.activeModel.collection.indexOf(this.model.activeModel);
            this.$el.html(this.template({
                tabs: this.tabs,
                serial: serial + 1
            }));
        }
        this.$el.scrollLeft(this.$el.get(0).scrollWidth - this.$el.innerWidth() + 5);
        Player._instance.onScroll(this.$el);
        // Refocus after render..
        if (hadFocus && elemIndex !== -1) {
            this.$("a").eq(elemIndex).focus();
        }
    }

    /**
     * Returns true if given element is in current element.
     * @param elem any element, Optional, Default - focused element.
     */
    private elemContainsInMainEl(elem = document.activeElement) {
        return this.$el.has(elem).length === 1;
    }

    /**
     * Returns active tab list by using recursive method.
     */
    getTabListRecrsv() {
        let tabs = [];
        if (this.model.activeModel === void 0) {
            if (this.model.linksCollection.length > 0) {
                tabs.push(this.model.linksCollection.models[0]);
            }
        } else {
            const arr: any[] = [];
            let res = this.getActiveIndexes(this.model.linksCollection.models, arr);
            res = res.reverse();
            tabs = res;
        }
        tabs = this.updateTabHashValue(tabs);
        return tabs;
    }

    /**
     * Returns active indexes array from given chunks.
     * @param linkChunk array of menu chunks.
     * @param res Result array.
     * @param activeModel Optional active link model.
     */
    getActiveIndexes(linkChunk: ItemModel[], res: ItemModel[], activeModel?: ItemModel) {
        if (activeModel === void 0) { activeModel = this.model.activeModel; }
        let count = 0;
        for (const child of linkChunk) {
            if (child === activeModel) {
                res.push(child);
                return res;
            }
            if (child.subMenuItems !== void 0) {
                const oldResLen = res.length;
                res = this.getActiveIndexes(child.subMenuItems.models, res);
                if (oldResLen !== res.length) {
                    res.push(child);
                }
            }
            count++;
        }
        return res;
    }

    /**
     * Updates null hash value with hash value of first subMenuItem
     * @param tabs tab array
     */
    updateTabHashValue(tabs: any[]) {
        let updatedTabs = [];
        let tab: ItemModel;
        let tabCopy: any;
        for (tab of tabs) {
            if (!tab.hash) {
                tabCopy = tab.clone();
                tabCopy.hash = tab.subMenuItems.models[0].hash;
                updatedTabs.push(tabCopy);
            } else {
                updatedTabs.push(tab);
            }
        }
        return updatedTabs;
    }
}