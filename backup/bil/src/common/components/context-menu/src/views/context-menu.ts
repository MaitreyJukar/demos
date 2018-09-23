import * as Backbone from "backbone";
import * as _ from "underscore";
import { Utilities } from "./../../../../helper/utilities";
import "./../../css/context-menu.styl";
import * as CollectionPkg from "./../collections/menu-items";
import * as ContextMenuModelPkg from "./../model/context-menu";

interface TplObject {
    label: string;
    val: number;
}

const contextMenuTpl: (attr?: TplObject[]) => string = require("./../../tpl/context-menu.hbs");

export class ContextMenuView extends Backbone.View<ContextMenuModelPkg.ContextMenuModel> {
    public static EVENTS = {
        DELETE: "DELETE",
        ESC: "ESC",
        MOVE: "MOVE"
    };
    public collection: CollectionPkg.MenuItems;

    constructor(attr?: Backbone.ViewOptions<ContextMenuModelPkg.ContextMenuModel>, opts?: any) {
        super(attr);
        this.collection.expanded = false;
        this.render();
    }

    public accessibilityContextMenu(event: JQuery.Event): void {
        // keydown events to be handled here
        event.stopPropagation();
        const $cacheVar = $(event.target);
        const $contextMenuItems = this.$("section.context-menu li.content");
        switch (event.which) {
            case 38:
                // up
                if ($cacheVar[0] === $contextMenuItems[0]) {
                    $contextMenuItems.eq($contextMenuItems.length - 1).focus();
                } else {
                    $cacheVar.prev().focus();
                }
                break;
            case 40:
                // down key
                if ($cacheVar[0] === $contextMenuItems[$contextMenuItems.length - 1]) {
                    $contextMenuItems.eq(0).focus();
                } else {
                    $cacheVar.next().focus();
                }
                break;
            case 13:
            case 32:
                // enter / space
                this.onContextMenuOptionsClicked(event);
                break;
            case 9:
            case 27:
                // Esc
                // tab
                this.hideContextMenu();
                this.trigger(ContextMenuView.EVENTS.ESC);
                event.stopPropagation();
                event.preventDefault();
        }
    }

    public appendContextMenu(target: JQuery<HTMLElement>): void {
        this.toggleContextMenu(target);
    }

    public events(): Backbone.EventsHash {
        return {
            "click li.content": "onContextMenuOptionsClicked",
            "keydown section.context-menu": "accessibilityContextMenu"
        };
    }

    public ifClickedOutside(): void {
        $(document).on("click", (e: any) => {
            // click out side
            if (!($(e.target).parents("section.context-menu").length == 1) && (this.collection.expanded)) {
                this.hideContextMenu();
            }
        });
    }

    public hideContextMenu(): void {
        this.$("section.context-menu").addClass("hide");
        this.collection.expanded = false;
    }

    public render(): ContextMenuView {
        this.$el.append(contextMenuTpl(this.collection.toJSON()));
        this.ifClickedOutside();
        return this;
    }

    public showContextMenu(target: JQuery<HTMLElement>): void {
        const x = target[0].getBoundingClientRect().left;
        const y = target[0].getBoundingClientRect().top;
        const height = target[0].getBoundingClientRect().height;
        const width = target[0].getBoundingClientRect().width;
        const xOffset = x + (width / 2);
        const yOffset = y + (height / 2);
        this.$("section.context-menu").removeClass("hide").css({ top: yOffset, left: xOffset }).focus();
        this.$("section.context-menu li.content").first().focus();
        this.collection.expanded = true;
    }

    public toggleContextMenu(target?: JQuery<HTMLElement>): void {
        if (this.collection.expanded) {
            this.hideContextMenu();
        } else {
            this.showContextMenu(target);
        }
    }

    public onRightClick(event: JQuery.Event): void {
        event.preventDefault();
        this.toggleContextMenu($(event.target));
    }

    public onContextMenuOptionsClicked(event: JQuery.Event): void {
        Utilities.logger.info($(event.target).attr("value"));
        switch (Number($(event.target).attr("value"))) {
            case ContextMenuModelPkg.ModelType.DELETE:
                this.trigger(ContextMenuView.EVENTS.DELETE);
                break;
            case ContextMenuModelPkg.ModelType.MOVE:
                this.trigger(ContextMenuView.EVENTS.MOVE);
                break;
            default:
                Utilities.logger.warn("NO li element binded to this element - please check context-menu - view");
        }
        this.toggleContextMenu();
    }
}
