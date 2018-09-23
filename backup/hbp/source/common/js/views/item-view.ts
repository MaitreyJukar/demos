import * as Backbone from "backbone";
import * as $ from "jquery";
import ItemModel from "../models/item-model";
import Player from "./player";

export default class ItemView extends Backbone.View<ItemModel> {
    model: ItemModel;
    constructor(attr?: Backbone.ViewOptions<ItemModel>) {
        super(attr);
    }
    public events(): Backbone.EventsHash {
        return {
            "visited": "onClickHeader"
        };
    }

    initialize() {
        this.attachListeners();
    }
    attachListeners() {
        this.listenTo(this.model, "change:_progress", this.updateProgress)
    }
    onClickHeader(event: any) {
        event.stopPropagation();
        if (!this.model.subMenuItems.length) {
            this.stopListening(this.model, "change:_time");
            this.listenTo(this.model, "change:_time", this.checkTime);
        }
        Player.Instance.trigger("activeModelChange", this.model);
    }
    /**
     * Check timer if it has reached required time
    */
    checkTime() {
        if (this.model.time === 5) {
            this.model.stopTimer();
            this.model.read = true;
        }
    }
    updateProgress() {
        let currentProgress = Math.floor(this.model.progress);

        if (currentProgress === 100) {
            this.$(".icon-check").eq(0).removeClass("hide");
            this.$(".progress-bar").eq(0).css("width", currentProgress + "%").attr("aria-valuenow", currentProgress + "%");
            this.$(".percent-text, .progress").slice(0, 2).addClass("hide");
        } else if (currentProgress) {
            this.$(".percent-text").eq(0).html(currentProgress.toString() + "%");
            this.$(".progress").eq(0).removeClass("hide");
            this.$(".progress-bar").eq(0).css("width", currentProgress + "%").attr("aria-valuenow", currentProgress + "%");
        }

        if (this.model.subMenuItems.models.length !== 0) {
            const $target = this.$el.find("a.side-menu-link").eq(0).closest(".side-menu-accordion-header");
            if ($target.hasClass("collapsed")) {
                $target.find("a.side-menu-link").eq(0).attr("aria-label", currentProgress + "% Complete, Collapse " + $target.find("a.side-menu-link").eq(0).text());
            } else {
                $target.find("a.side-menu-link").eq(0).attr("aria-label", currentProgress + "% Complete, Expand " + $target.find("a.side-menu-link").eq(0).text());
            }
        }
    }

}