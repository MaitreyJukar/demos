import * as Backbone from "backbone";
import PlayerModel from "./player-model";
import SideMenuCollection from "../collections/side-menu";
import MenuModel from "./item-model";
import PlayerView from "./../views/player";
import * as Handlebars from "handlebars";
import { CaptionData } from "./../interfaces/communication-api-interface";

/**
 * Declared class, used as referance of content's node type.
 * @class DataNode
 */
export declare class DataNode {
    nodeType: string;
    text?: string; // for text node.
    html?: string; // Rich HTML for custom node.
    bulletList?: string[]; // array of strings for bullet node.
    img?: { url: string, alt: string }; // image object for text-image & image node.
    dataVideoJson?: string; // for kepler-video-scratchpad nodes.
    dataScratchpadJson?: string; // for kepler-video-scratchpad nodes.
    dataOtherJson?: string[]; // for kepler-video-(other) nodes (json ids).
    titles?: string[]; // for kepler-video-(other) nodes (titles).
    dataJson?: string; // for kepler nodes.
    dataJsons?: string[]; // for kepler-assessment only and kepler-training only nodes.
    useCustomTitle?: boolean; // for kepler nodes.
    title?: string; //for kepler nodes.
    hideText?: boolean; //for kepler training & assessment node, true if no text to render
    bulletTitle?: string; //for bullet node.
}

/**
 * Declared class, used as referance of content's main info.
 * @class DataNodesContainer
 */
export declare class DataNodesContainer {
    [id: string]: {
        nodes: DataNode[];
        type: string;
        title: string;
        bookmark?: boolean;
    };
}

export class PageManagerModel extends Backbone.Model {
    get dataJSON(): DataNodesContainer { return (this.get("dataJSON")); }
    set dataJSON(value: DataNodesContainer) { this.set("dataJSON", value); }

    get linksCollection(): SideMenuCollection { return PlayerView._instance.model.sideMenuCollection; }

    get activeModel(): MenuModel { return PlayerView._instance.model.activeModel; }
    set activeModel(value: MenuModel) { PlayerView._instance.model.activeModel = value; }

    get videoCaption(): string { return this.get("videoCaption"); }
    set videoCaption(value: string) { this.set("videoCaption", value); }

    get videoCaptionsData(): CaptionData[] { return this.get("videoCaptionsData"); }
    set videoCaptionsData(value: CaptionData[]) { this.set("videoCaptionsData", value); }

    constructor(attr?: any) {
        super(attr);
    }

    defaults() {
        return {
            "dataJSON": {},
            "videoCaption": "",
            "videoCaptionsData": [] as CaptionData[]
        }
    }

    /**
     * Returns current time caption.
     * @param time Any number.
     */
    public getCaptionByTime(time: number) {
        const TOLERANCE = 0.1; // To avoid flickering of captions.
        time = time + TOLERANCE;

        let latestCaption = "";
        for (const capData of this.videoCaptionsData) {
            if (time > (capData.time / 1000)) {
                latestCaption = capData.text;
            }
        }
        return latestCaption;
    }
}