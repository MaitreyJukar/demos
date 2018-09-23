import * as Backbone from "backbone";
import * as _ from 'underscore';
import * as $ from 'jquery';
import Player from "./views/player";
import PlayerModel from "./models/player-model";
import MenuModel from "./models/item-model";
declare const cb: number;

/**
 * Declared class, used as reference of content's node type.
 * @class DataNode
 */
declare class DataNode {
    nodeType: string;
    text?: string; // for text node.
    html?: string; // Rich HTML for custom node.
    img?: { url: string, alt: string }; // image object for text-image node.
}

/**
 * Declared class, used as reference of content's main info.
 * @class DataNodesContainer
 */
declare class DataNodesContainer {
    [id: string]: {
        nodes: DataNode[];
        type: string;
        title: string;
        bookmark?: boolean;
    };
}

declare class ExtWindow extends Window {
    app: any
}

declare const window: ExtWindow;

/**
 * Declared class, used for storing data related to side menu items.
 * @class SideMenuItem
 */
class SideMenuItem {
    refid?: string;
    text: string;
    hash: string;
    dataURL: string;
    childLinks: SideMenuItem[];
}

/**
 * Router information
 */
interface RouterOptions {
    routes: any;
    appName?: string;
}

export default class Router extends Backbone.Router {
    public player: Player;
    public appName: string;
    routes: any;
    dataJSON: DataNodesContainer;

    constructor(options?: any) {
        var routes = {
            "": "index",
            "(:lvl1)(/:lvl2)(/:lvl3)(/:lvl4)": "performRoute"
        };
        if (options === void 0) { options = {}; }
        if (options.routes === void 0) { options.routes = routes; }
        super(options);
    }

    /**
     * Default initialize function called when new instance is created
     * @param options
     */
    initialize(options?: RouterOptions) {
        this.appName = options.appName ? options.appName : "spreadsheet-modeling";
        // Initialize player model
        let model = new PlayerModel({
            appName: this.appName
        });
        this.listenTo(model, "data-fetched", () => {
            this.renderPlayer(model);
        });
    }

    renderPlayer(model: PlayerModel) {
        this.initializePlayerView(model);
        this.dataJSON = {};
        this.listenTo(this.player.sideMenu, "model-ready", (linkJson: any) => {
            this.fetchSideMenuJSON();
        });
    }

    /**
     * Initializes a new player instance
     * @param model 
     */
    initializePlayerView(model: PlayerModel) {
        this.player = new Player({
            "el": ".main-container",
            "model": model
        });
    }

    /**
     * Fetches side menu related information
     */
    fetchSideMenuJSON() {
        /*
        $.ajax({
            "url": "content/" + this.appName + "/json/side-menu.json?cb=" + cb,
            "success": function () {
                Backbone.history.start();
            }
        });
        */
        Backbone.history.start();
    }

    /**
     * Handles all types of routes (Chapters, Unit, Lessons, Topic)
     * @param lvl1 
     * @param lvl2 
     * @param lvl3 
     * @param lvl4 
     */
    performRoute(lvl1: string, lvl2: string, lvl3: string, lvl4: string) {
        let data = this.player.sideMenu.mainlinksCollection,
            url: any,
            dataNode: SideMenuItem;

        url = location.hash.slice(1);

        dataNode = this.searchObj(this.player.model.sideMenuCollection.models, url);

        if (dataNode) {
            if (this.dataJSON.hasOwnProperty(dataNode.hash)) {
                this.player.updatePlayerView(this.dataJSON, dataNode.hash);
                this.player.trigger("routeChanged", { url });
            } else if (dataNode.dataURL) {
                this.player.showPageLoader();
                // Requesting data json
                $.ajax({
                    "url": "content/" + this.appName + "/json/topics/" + dataNode.dataURL + "?cb=" + cb,
                    "success": _.bind(function (result: any) {
                        this.dataJSON[dataNode.hash] = result;
                        this.player.updatePlayerView(this.dataJSON, dataNode.hash);
                        this.player.trigger("routeChanged", { url });
                    }, this),
                    "error": _.bind(function () {
                        this.player.trigger("routeChanged", { url });
                    }, this)
                });
            }
        } else {
            console.warn("No data node found !!");
            if (!this.player.checkAllLoaded()) {
                console.info("Page is not loaded, Redirecting to #1");
                window.location.hash = "#1";
            }
        }
    }

    /**
     * Finds a menu item from its collection on the basis of its URL
     * @param obj 
     * @param url 
     */
    searchObj(obj: MenuModel[], url: string): any {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let currObj = obj[key];
                if (currObj.hash === url)
                    return currObj;
                else if (currObj.subMenuItems && currObj.subMenuItems.models) {
                    const foundObj = this.searchObj(currObj.subMenuItems.models, url)
                    if (foundObj !== void 0) {
                        return foundObj;
                    }
                }
            }
        }
    }

}