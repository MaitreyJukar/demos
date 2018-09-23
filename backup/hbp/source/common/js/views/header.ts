
import * as Backbone from "backbone";
import * as $ from "jquery";
import "../../css/sidebar.css";
import "../../css/header.css";
const scrollIntoView = require('scroll-into-view');

export default class HeaderView extends Backbone.View<Backbone.Model> {
    private currWidth: number;

    constructor() {
        var events = {
            "click #hamburger-menu": "toggleSideMenu",
            "click .header-icons button": "selectHeaderButton"
        };
        super({ el: "#header", events: events });
        this.currWidth = $(window).width();
    }

    initialize() {
        this.render();
        $(window).resize(this.resizeHandler.bind(this));
    }

    /**
     * Handler for resize event.
     * Keeps open side menu if any of the link in side menu was focused.
     * Force focuses on active header if screen size goes from small to large and focused element is hamburger-menu button.
     * @param eve jQuery event object.
     */
    resizeHandler(eve: JQuery.Event) {
        // If focused element is inside side menu.
        if ($("#side-menu").has(document.activeElement).length !== 0) {
            $("#side-menu").removeClass("hide-menu");
            $("#hamburger-menu").addClass("selected");
            $(".side-menu-modal").removeClass("hide-modal");
            scrollIntoView($("#side-menu .active-link")[0]);
        }
        if (document.activeElement === this.$("#hamburger-menu").get(0)) {
            if (eve.type === "resize") {
                const oldWidth = this.currWidth;
                this.currWidth = $(window).width();
                if (this.currWidth > 1024 && oldWidth <= 1024) {
                    console.info("Force focus active header");
                    if ($("#side-menu .menu-item.current-header a.side-menu-link").length === 0) {
                        $("#side-menu .side-menu-link").eq(0).focus();
                    } else {
                        $("#side-menu .menu-item.current-header a.side-menu-link").eq(0).focus();
                    }
                }
            }
        }
        this.currWidth = $(window).width();
    }

    toggleSideMenu(event: any) {
        $("#side-menu").toggleClass("hide-menu");
        $("#hamburger-menu").toggleClass("selected");
        $(".side-menu-modal").toggleClass("hide-modal");
        scrollIntoView($("#side-menu .active-link")[0]);
    }

    selectHeaderButton(event: any = {}) {
        const $currButton = $(event.currentTarget);

        if ($currButton.hasClass("icon-search") || $currButton.hasClass("icon-dashboard"))
            return;

        if ($currButton.hasClass("selected"))
            $currButton.removeClass("selected");
        else if ($currButton.hasClass("icon-ellipses")) {
            $currButton.addClass("selected");
        } else {
            $(".header-icons button").removeClass("selected");
            $currButton.addClass("selected");
        }
        $currButton.tooltip("hide");
    }

    render() {
        let template = require("../../tpl/header.hbs");
        this.$el.html(template);
        return this;
    }
}