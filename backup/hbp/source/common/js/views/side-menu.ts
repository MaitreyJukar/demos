import * as Backbone from "backbone";
import * as $ from "jquery";
import * as Handlebars from "handlebars";
import * as _ from "underscore";
import "bootstrap/dist/js/bootstrap.min";
import "bootstrap/dist/css/bootstrap.min.css";
import MainLinksCollection from "../collections/menu-links";
import ItemModel from "../models/item-model";
import ItemView from "./item-view";
import Player from "./player";
import { Utilities } from "../utilities";
const scrollIntoView = require('scroll-into-view');

export declare class MenuItemChunk {
    text: string;
    url: string;
    dataURL: string;
    childLinks?: MenuItemChunk[];
    refid?: string;
    id?: string;
}

export class SideMenuView extends Backbone.View<Backbone.Model> {
    public mainlinksCollection: MainLinksCollection;
    public template: any;
    public openSideMenu: boolean;
    private partialTemplate: any;
    constructor() {
        const events = {
            "click .side-menu-accordion-header": "onClickAccordion",
            //"click .icon-enter": "onClickEnter"
            "click .icon-arrow-left": "removeSideBarHeader",
            "click a.side-menu-link": "onSideMenuLinkClick",
            "keydown .first-level-header": "triggerClick",
            "keydown .side-menu-link": "handleKeydownLink"
        };
        super({ el: "#side-menu", events: events })
    }
    initialize() {
        this.openSideMenu = true;
        this.render();
        let linkData = this.getLinkData();
        // this.$el.on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", this.onTransitionEnd.bind(this));
    }
    onTransitionEnd() {
        if (this.$el.hasClass("hide-menu")) {
            this.$el.addClass("menu-hidden");
        } else {
            this.$el.removeClass("menu-hidden");
        }
    }
    render() {
        this.template = require("../../tpl/side-menu.hbs");
        this.partialTemplate = require("../../tpl/partials/menu-accordion.hbs");
        return this;
    }
    getLinkData() {
        this.mainlinksCollection = new MainLinksCollection();
        this.mainlinksCollection.appName = Player.Instance.model.appName;

        let linkData = this.mainlinksCollection.fetch({
            success: this.onLinkDataFetchSuccess.bind(this),
            error: function () {
                console.log('Failed to fetch!');
            }
        });
        return linkData;
    }
    /**
     * Sets received JSON to mainlinksCollection, start creating accordions
     *
     * @param collection 'backbone collection'
     * @param response 'JSON'
     */
    onLinkDataFetchSuccess(collection: MainLinksCollection, response: any) {
        this.createAccordions(response.mainlinks);
        this.$(".side-menu-accordion-content").on('shown.bs.collapse', (event: any) => {
            scrollIntoView($(event.target).find(".active-link")[0], {
                "isScrollable": function (target: any, defaultIsScrollable: any) {
                    return defaultIsScrollable(target) || $(target).hasClass('scrollable');
                }
            });
        })
        this.$(".side-menu-accordion-content .side-menu-accordion-header:last-child").on("click", (event: any) => {
            if (Player.Instance.$("#hamburger-menu").is(":visible")) {
                Player.Instance.headerView.toggleSideMenu(event);
            }
        });
        this.trigger("model-ready", Player.Instance.model.sideMenuCollection);
    }
    createAccordions(mainLinks: any[]) {
        let self = this;

        Handlebars.registerHelper("hierarchy", function (data: any) {
            return data.childLinks ? (data.hash ? "CHAPTERS" : "UNITS") : "TOPICS";
        });
        Handlebars.registerHelper("currLevel", function (data: any) {
            return data.childLinks ? (data.hash ? "1" : "2") : "3";
        });
        Handlebars.registerHelper("counter", function (index: number) {
            return index + 1;
        });
        Handlebars.registerHelper('testHelper', function (mainLinks2: any) {
            let options: any = {};
            options.mainLinks = mainLinks2;
            return self.partialTemplate(options);
        });
        this.$el.html(this.template({ mainLinks: mainLinks }));

        this.createMenuViews(mainLinks);
        this.displayDefaultState();
    }
    createMenuViews(mainlinks: any[]) {
        const playerModel = Player.Instance.model;
        let obj: any = playerModel.menuData;
        let savedData: any = playerModel.savedData;
        let currModel, visited: boolean, bookmarked;

        this.$(".menu-item").each(function (index, item) {
            const refid = $(this).data("refid");
            const parent = $(this).parents(".menu-item").eq(0);
            const hash = $(this).find(".side-menu-link").eq(0).attr("href");
            obj[refid] = {};

            currModel = _.find(savedData.items, function (obj: any) {
                return obj.itemModel.refid === refid;
            });

            obj[refid].itemModel = new ItemModel({
                pageTitle: $(this).data("pagetitle"),
                dataURL: $(this).data("jsonurl"),
                refid,
                hash: hash ? hash.replace("#", "") : null,
                text: $(this).find(".side-menu-link").eq(0).text()
            });

            obj[refid].itemView = new ItemView({
                "model": obj[refid].itemModel,
                "el": $(item)
            });

            if (parent.length) {
                obj[parent.data("refid")].itemModel.addToParent(obj[refid].itemModel, parent.data("refid"));
            } else {
                Player.Instance.model.sideMenuCollection.add(obj[refid].itemModel);
            }
        });

        _.each(playerModel.savedData.items, function (currData: any, index) {
            if (obj[currData.itemModel.refid]) {
                obj[currData.itemModel.refid].itemModel.progress = currData.itemModel._progress;
                if (currData.itemModel._visited) {
                    obj[currData.itemModel.refid].itemModel.visited = currData.itemModel._visited;
                }
                if (currData.itemModel._bookmark) {
                    obj[currData.itemModel.refid].itemModel.bookmark = currData.itemModel._bookmark;
                }
            }
        });
    }
    /**
     * Replaces + icon with right arrow for first level menu-items, display first item as selected by default
     *
     */
    displayDefaultState() {
        const currLink = Player.Instance.model.savedData && Player.Instance.model.savedData.currentLink;

        if (!location.hash) {
            if (!currLink) {
                location.hash = "#1";
                this.openSideMenu = false;
                this.$(".side-menu-link[aria-level='1']").addClass("displayed").attr("tabindex", "-1");
                this.$(".side-menu-link[aria-level='1']").eq(0).attr("tabindex", "0");
            } else {
                location.hash = "#" + currLink;
            }
        }
        this.$(".side-menu-accordion > .menu-item > .side-menu-accordion-header > .icon-plus").removeClass("icon-plus").addClass("icon-enter").attr("title", "Enter");
        this.$(".side-menu-accordion > .menu-item > .side-menu-accordion-content").attr("aria-hidden", "true");
    }

    /**
     * Changes window hash on click of accordion headers and sets active class
     *
     * @param event 'click'
     */
    onClickAccordion(event: any) {
        const $target = $(event.currentTarget);
        let $currentTarget = $target.find(".side-menu-link");
        const hash = $currentTarget.attr("href");

        if (!$currentTarget.parents(".side-menu-accordion-content").length) {
            this.showSideBarHeader($currentTarget, $currentTarget.parents(".side-menu-accordion-header"));
        }

        if (!hash) {
            this.collapseElement($currentTarget.parents(".side-menu-accordion-content").find(".side-menu-accordion-content").not($currentTarget.parent().next()));
            $currentTarget.parents(".side-menu-accordion-content").find(".menu-item > .side-menu-accordion-header > .icon-minus").toggleClass("icon-plus icon-minus")
                .attr("title", "Expand");
            const perText = $target.find("a.side-menu-link").prevAll(".status-bar").find(".percent-text").text();
            let strToAppend = "";
            if (perText) {
                const percent = perText.replace("%", "");
                strToAppend = percent + "% Complete, ";
            }
            if ($target.hasClass("collapsed")) {
                $target.find(".icon-plus").toggleClass("icon-plus icon-minus").attr("title", "Collapse");
                $target.find("a.side-menu-link").attr("aria-label", strToAppend + "Collapse " + $target.find("a.side-menu-link").text());
            } else {
                $target.find("a.side-menu-link").attr("aria-label", strToAppend + "Expand " + $target.find("a.side-menu-link").text());
            }
        } else {
            window.location.hash = hash.replace("#", "");
        }
    }

    handleKeydownLink(event: any) {
        const $currentTarget = $(event.currentTarget);
        const keyCode = event.keyCode;

        switch (keyCode) {
            // To fix on enter & space key issue on 2nd level.
            case 13: //enter key
            case 32: //space key
                let currEnterLevel = Number($currentTarget.attr("aria-level"));
                if (currEnterLevel === 2) {
                    if ($currentTarget.parent().hasClass("collapsed")) {
                        $currentTarget.parent().next().find(".side-menu-link").removeClass("displayed");
                    } else {
                        $currentTarget.parent().next().find(".side-menu-link").addClass("displayed");
                    }
                    event.preventDefault();
                }
                break;
            case 40: //down key
                this.$(".side-menu-link").attr("tabindex", "-1");
                this.$(".side-menu-link.displayed").eq(this.$(".side-menu-link.displayed").index($currentTarget) + 1).focus().attr("tabindex", "0");
                event.preventDefault();
                break;

            case 38://up key
                const currPosition = this.$(".side-menu-link.displayed").index($currentTarget);
                if (currPosition) {
                    this.$(".side-menu-link").attr("tabindex", "-1");
                    this.$(".side-menu-link.displayed").eq(currPosition - 1).focus().attr("tabindex", "0");
                }
                event.preventDefault();
                break;

            case 39://right key
                let currLevel = Number($currentTarget.attr("aria-level"));

                switch (currLevel) {
                    case 1:
                        if (!$currentTarget.parents('.menu-item').eq(0).hasClass("current-header")) {
                            event.currentTarget = $currentTarget.parent();
                            this.onClickAccordion(event);
                        } else {
                            this.$(".side-menu-link.displayed[aria-level='2']").eq(0).focus();
                        }
                        break;
                    case 2:
                        if ($currentTarget.parent().hasClass("collapsed")) {
                            $currentTarget.trigger("click");
                            $currentTarget.parent().next().find(".side-menu-link").addClass("displayed");
                        } else {
                            $currentTarget.parent().next().find(".side-menu-link").eq(0).focus();
                        }
                        break;
                    default:
                        break;
                }
                event.preventDefault();
                break;

            case 37://left key
                currLevel = Number($currentTarget.attr("aria-level"));

                switch (currLevel) {
                    case 1:
                        if ($currentTarget.parents('.menu-item').eq(0).hasClass("current-header"))
                            this.removeSideBarHeader(event);
                        break;
                    case 2:
                        if (!$currentTarget.parent().hasClass("collapsed")) {
                            $currentTarget.trigger("click");
                            $currentTarget.parent().next().find(".side-menu-link").removeClass("displayed");
                        } else {
                            this.$(".side-menu-link.displayed[aria-level='1']").focus();
                        }
                        break;
                    case 3:
                        $currentTarget.parents('ul').eq(0).prev().find(".displayed").focus();
                    default:
                        break;
                }
                event.preventDefault();
                break;
            default:
                break;
        };
    }
    onClickEnter(event: any) {
        const $target = $(event.currentTarget);
        const currHash = location.hash;
        const $activeLink = this.$('a.side-menu-link[href$="' + currHash + '"]');

        $activeLink.parent().addClass("active-link");
        this.showSideBarHeader($target.prev(), $target.parent());
        this.showElement($activeLink.parents(".side-menu-accordion-content"));
        event.preventDefault();
        event.stopPropagation();
    }
    /**
     * Triggers click when enter or space key is pressed
     *
     * @param event 'keydown'
     */
    triggerClick(event: any) {
        const $currentTarget = $(event.currentTarget);
        const keyCode = event.keyCode;

        switch (keyCode) {
            case 13: //enter
            case 32: //space
                $currentTarget.trigger("click");
                event.stopPropagation();
                event.preventDefault();
                break;

            default:
                break;
        }
    }
    /**
     * Removes active class from all headers and sets on the header passed
     *
     * @param $currentTarget 'jQuery object of accordion header'
     */
    setActiveLink($currentTarget: JQuery<HTMLElement>) {
        if ($currentTarget.parents(".side-menu-accordion-content").length !== 1) {
            this.$(".active-link, .active-header").removeClass("active-link active-header");
            if (!$currentTarget.parents(".side-menu-accordion-content").length) {
                $currentTarget.addClass("active-header active-link");
            } else {
                $currentTarget.addClass("active-link");
            }
        }
        $currentTarget.trigger("visited");
    }
    /**
     * 
     * Changes accordion headers on browser navigation / hash change
     *
     */
    changeActiveTab() {
        let href = location.hash,
            $currentTarget = this.$("a[href='" + href + "']"),
            $parentContent = $currentTarget.parents(".side-menu-accordion-content"),
            $lastParentHeader = $parentContent.last().prev(),
            $lastParentHeaderLink = $lastParentHeader.find(".side-menu-link"),
            $currentAccordion = $currentTarget.parents(".side-menu-accordion-content").eq(0),
            $accordions = $parentContent.find(".side-menu-accordion-content").not($currentAccordion),
            index, activeIndex,
            $prevElement, $prevHeader,
            event = {} as any;

        this.setActiveLink($currentTarget.parent());

        //jumping from one menu item to another
        if (!($lastParentHeader.hasClass("side-menu-header") || $currentTarget.parent().hasClass("side-menu-header") || !this.$(".side-menu-header").length)) {
            this.removeSideBarHeader(event);

            if ($lastParentHeaderLink.length) {
                $prevElement = $lastParentHeaderLink;
                $prevHeader = $lastParentHeader;
            } else {
                $prevElement = $currentTarget;
                $prevHeader = $currentTarget.parent();
            }
            this.showSideBarHeader($prevElement, $prevHeader);

            this.trigger("done-loading");
        }

        //click on topic link
        if (!$parentContent.length) {
            this.showSideBarHeader($currentTarget, $currentTarget.parents(".side-menu-accordion-header"));
        } else if ($parentContent.length) {
            this.showSideBarHeader($currentTarget, $lastParentHeader);
            this.showElement($parentContent);
            if ($currentAccordion.length) { //collapse other accordion before opening other
                this.collapseElement($accordions);
            }
        }
        Utilities.setPageTitle(Player.Instance.model.activeModel.pageTitle);
        this.$(".side-menu-link").attr("tabindex", "-1");
        this.$(".active-link, .active-header").find(".side-menu-link.displayed").attr("tabindex", "0");
    }
    /**
     * 
     * Displays second level of side-menu accordion
     *
     * @param $currentTarget 'clicked link'
     * @param $headerItem 'header of clicked link to be convert into menu header'
     */
    showSideBarHeader($currentTarget: JQuery<HTMLElement>, $headerItem: JQuery<HTMLElement>) {
        if (this.openSideMenu) {
            const $currentSection = $currentTarget.parents(".menu-item").find(".menu-item");

            this.$(".level1").toggleClass("level1 level2");
            this.$(".displayed").removeClass("displayed");
            $headerItem.find(".side-menu-link").addClass("displayed");
            $currentTarget.parents(".side-menu-accordion-content").eq(0).find(">li>.side-menu-accordion-header>a").addClass("displayed");
            this.$(".menu-item").not($currentSection.add($currentTarget.parents(".menu-item"))).addClass("zero-height");
            this.$(".side-menu-accordion > .hierarchy-title").addClass("zero-height");
            $headerItem.addClass("side-menu-header").removeClass("active-link").removeAttr("data-toggle");
            $headerItem.find(".status-bar, .icon-enter").addClass("hide");
            $headerItem.find(".icon-arrow-left, .divider").removeClass("hide");
            $headerItem.parent().addClass("current-header");
            $headerItem.next().addClass("swipe");

            this.$(".side-menu-accordion").find(".menu-item.zero-height").find(".side-menu-link, .icon-arrow-left").attr("tabindex", "-1");
            $headerItem.next().find(".first-level-header").attr("tabindex", "0");
            $headerItem.parents(".side-menu-accordion").children().not($headerItem.parent()).attr("aria-hidden", "true");

            this.showElement($headerItem.next());
        } else {
            this.openSideMenu = true;
        }
    }
    /**
     * 
     * Display first level of accordion
     *
     */
    removeSideBarHeader(event: any) {
        const $sideHeader = this.$(".side-menu-header");
        const $openAccordion = $sideHeader.next();

        this.$(".level2").toggleClass("level1 level2");
        this.$(".menu-item.zero-height, .hierarchy-title.zero-height").removeClass("zero-height");
        this.$(".current-header").removeClass("current-header");
        this.collapseElement($openAccordion.add($openAccordion.find(".in")));
        this.$(".side-menu-accordion > .menu-item > .side-menu-accordion-content").attr("aria-hidden", "true");


        this.$(".side-menu-accordion>.menu-item>.side-menu-accordion-header>.side-menu-link").addClass("displayed");
        this.$(".side-menu-link").removeAttr("tabindex");
        this.$(".icon-arrow-left").attr("tabindex", "0");
        this.$(".first-level-header, .side-menu-link.displayed").attr("tabindex", "-1");
        this.$(".side-menu-accordion > .menu-item").removeAttr("aria-hidden");


        this.$(".side-menu-accordion>.menu-item>.active-link").removeClass("active-link");
        $sideHeader.find(".status-bar, .icon-enter").removeClass("hide");
        $sideHeader.find(".icon-arrow-left, .divider").addClass("hide");
        $sideHeader.next().removeClass("swipe");
        $sideHeader.removeClass("side-menu-header").addClass("active-link").attr("data-toggle", "toggle");

        if (event) {
            event.stopPropagation && event.stopPropagation();
            event.preventDefault && event.preventDefault();
        }

        if (event && event.currentTarget && this.$el.has(event.currentTarget).length === 1) {
            // Prevent loss of focus when back is pressed..
            console.info("Force focus()");
            this.$(".active-link a.side-menu-link").eq(0).focus().attr("tabindex", "0");
        }
    }
    collapseElement(element: any) {
        element.collapse("hide");
        element.prev().find(".icon-minus").attr("title", "Expand").toggleClass("icon-plus icon-minus");
        element.find(".side-menu-link.displayed").removeClass("displayed");
    }
    showElement(element: any) {
        element.collapse("show");
        element.prev().find(".icon-plus").attr("title", "Collapse").toggleClass("icon-plus icon-minus");
        element.find("li > .side-menu-accordion-header .side-menu-link.first-level-header").addClass("displayed");
    }

    /**
     * Returns active link chunk from link chunk tree.
     * @param currLinkChunk Recursing current link chunk.
     * @param url Optional, Active URL.
     */
    getActiveLinkChunk(currLinkChunk: any[], url = location.hash.replace("#", "")): any {
        for (const link of currLinkChunk) {
            if (link.url === url) {
                return link;
            }
            else if (link.childLinks) {
                const linkChunk = this.getActiveLinkChunk(link.childLinks, url);
                if (linkChunk !== void 0) {
                    return linkChunk;
                }
            }
        }
    }
    showHideBookMarkIcon(hash: string, isShow: boolean) {
        let href = "#" + hash,
            $currentTarget = this.$("a[href='" + href + "']"),
            $currentHeader = $currentTarget.parents(".side-menu-accordion-header"),
            $bookmarkIcon = $currentHeader.find(".icon-bookmarked");

        $bookmarkIcon.toggleClass("hide", !isShow);
    }

    onSideMenuLinkClick(event: JQuery.Event) {
        let $target = $(event.currentTarget),
            isValidLink = $target.is('a') && $target.hasClass('side-menu-link') && !$target.parents('.active-link').length && !$target.parents('.active-header').length && $target.attr('href');

        if (isValidLink) {
            this.trigger('page-updated');
        }
        this.trigger("side-menu-link-clicked");
    }
}