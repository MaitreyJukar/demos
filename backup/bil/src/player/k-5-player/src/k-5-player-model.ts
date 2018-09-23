import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";
import * as TooltipModelPkg from "./../../../common/components/tooltip/src/models/tooltip-model";
import * as Utilities from "./../../../common/helper/utilities";
import CommonUtilities = Utilities;
// import { Component } from "../../base-player/src/base-player-model";
const Language = CommonUtilities.Language;

export enum QuestionType {
    "learnosity",
    "desmos",
    "custom",
    "html",
    "controls"
}

export declare class BasePlayerAttributes {
    public explorationID?: string;
    public pages?: PageLayout[];
    public questionsData?: QuestionData[];
    public additionalInfo?: AdditionalInfo;
    public locTextData?: any;
    public showHint?: boolean;
    public common?: any;
    public enableDoneOnAudioEnd?: boolean;
    public validateLastQuestion?: boolean;
}

export interface Component {
    id: number;
    type: string;
    subType: string;
    cssClass?: string;
    innerHTML?: string;
    dataReference?: string;
    desmosURL?: string;
    altText?: string;
    questionID?: number;
    pageID?: number;
    components?: Component[][];
    validate?: boolean;
    width?: string;
    save?: boolean;
    replace?: number;
    enableNext?: boolean;
    validateAll?: boolean;
    hideShowMe?: boolean;
    validateChange?: boolean;
    answers?: any[];
    topButtons?: boolean;
}

export declare class PageLayout {
    public components?: Component[][];
}

export declare class QuestionData {
    public id: number;
    public audioID?: string;
    public caption?: string;
    public validate?: boolean;
}

export declare class AdditionalInfo {
    public title?: string;
    public content?: string;
    public position?: string;
    public postImgContent?: string;
    public image?: TooltipModelPkg.InfoImage;
    public audioID?: string;
}

export declare class JSONStructure {
    public useCustomStyle?: boolean;
    public useCustomScript?: boolean;
    public useLargerFont?: boolean;
    public hasStoryBook?: boolean;
    public explorationID?: string;
    public pages: PageLayout[];
    public questionsData: QuestionData[];
    public resources?: any;
    public additionalInfo?: AdditionalInfo;
}

export declare class PlayerData {
    public common: JSONStructure;
    public en?: { localized_data: any };
    public es?: { localized_data: any };
}

/**
 * Player base class for all players to be inherited from.
 */
export class BasePlayerModel extends Backbone.Model {
    public pages: PageLayout[];
    public questionsData: QuestionData[];
    public additionalInfo: AdditionalInfo;
    public currentPageIndex: number;
    public currentQuestionIndex: number;
    public totalPages: number;
    public currentLanguage: Utilities.Language;
    public explorationID?: string;
    public customComponents = ["custom"];
    public allComponentsByPage: Component[][];
    public allComponents: Component[];
    public savedData: any = {};

    constructor(attr: BasePlayerAttributes, opts?: any) {
        super(attr, opts);
        this.pages = attr.pages;
        this.questionsData = attr.questionsData;
        this.additionalInfo = attr.additionalInfo;
        this.totalPages = this.pages.length;
        this.explorationID = attr.explorationID;
        this.currentLanguage = opts;
        this.languages = Language;
        this.currentPageIndex = 0;
        this.currentQuestionIndex = 0;
        this.validateLastQuestion = attr.validateLastQuestion;
        this.getAllComponentsArray();
    }

    get locTextData(): { [id: string]: string } { return this.get("locTextData"); }
    set locTextData(value: { [id: string]: string }) { this.set("locTextData", value); }

    get languages(): typeof Utilities.Language { return this.get("languages"); }
    set languages(value: typeof Utilities.Language) { this.set("languages", value); }

    get useCustomStyle(): boolean { return this.get("useCustomStyle"); }
    set useCustomStyle(value: boolean) { this.set("useCustomStyle", value); }

    get useCustomScript(): boolean { return this.get("useCustomScript"); }
    set useCustomScript(value: boolean) { this.set("useCustomScript", value); }

    get useLargerFont(): boolean { return this.get("useLargerFont"); }
    set useLargerFont(value: boolean) { this.set("useLargerFont", value); }

    get validateLastQuestion(): boolean { return this.get("validateLastQuestion"); }
    set validateLastQuestion(value: boolean) { this.set("validateLastQuestion", value); }

    get hasStoryBook(): boolean { return this.get("hasStoryBook"); }
    set hasStoryBook(value: boolean) { this.set("hasStoryBook", value); }

    /**
     * By default take current defaults.
     */
    public defaults(): Backbone.ObjectHash {
        return $.extend(true, {}, this.baseDefaults());
    }

    /**
     * Defaults for base player model.
     */
    public baseDefaults(): Backbone.ObjectHash {
        return {};
    }

    public setPlayerLocText(): void {
        const selectedLanguage = this.currentLanguage;
        const getLocText = CommonUtilities.Utilities.getLocText;
        const componentId = "k-5-player";

        this.locTextData = {
            checkBtnText: getLocText(selectedLanguage, componentId, "check-button"),
            contBtnText: getLocText(selectedLanguage, componentId, "continue-button"),
            engText: getLocText(selectedLanguage, componentId, "lang-text-english"),
            finishBtnText: getLocText(selectedLanguage, componentId, "finish-button"),
            replayBtnText: getLocText(selectedLanguage, componentId, "replay-button"),
            saveBtnText: getLocText(selectedLanguage, componentId, "save-button"),
            showBtnText: getLocText(selectedLanguage, componentId, "show-button"),
            spanishText: getLocText(selectedLanguage, componentId, "lang-text-spanish"),
            tryAgainText: getLocText(selectedLanguage, componentId, "try-again-button"),
            unmuteBtnAria: getLocText(selectedLanguage, componentId, "unmute-button")
        };
    }

    public getAllComponentsArray(): void {
        const componentsArray: Component[][] = [];
        this.allComponents = [];
        let counter = 0;
        for (const [index, page] of this.pages.entries()) {
            if (page.components) {
                componentsArray[index] = [];
                this.forEachComponentArray(page.components, (comp) => {
                    comp.id = counter++;
                    componentsArray[index].push(comp);
                    comp.pageID = index;
                    this.allComponents.push(comp);
                });
            }
        }
        console.info(componentsArray);
        this.allComponentsByPage = componentsArray;
    }

    public getComponentsByQuestionIDInPage(questionID?: number, pageID?: number) {
        return this.allComponentsByPage[pageID].filter((comp) => comp.questionID == questionID);
    }

    public getComponentByID(id: number): Component {
        const component = this.allComponents.filter((comp) => comp.id == id);
        return component[0];
    }

    public getMaxQuestionIDInPage(pageIndex: number): number {
        let quesID = 0;
        const componentsInPage: Component[] = this.allComponentsByPage[pageIndex];
        componentsInPage.forEach((comp) => {
            if (comp.questionID > quesID) {
                quesID = comp.questionID;
            }
        });
        return quesID;
    }

    public getMinQuestionIDInPage(pageIndex: number): number {
        let quesID = this.questionsData[this.questionsData.length - 1].id;
        const componentsInPage: Component[] = this.allComponentsByPage[pageIndex];
        componentsInPage.forEach((comp) => {
            if (comp.questionID < quesID) {
                quesID = comp.questionID;
            }
        });
        return quesID;
    }

    /**
     * Returns data referance in string if found, otherwise empty string.
     */
    public getCurrCustomDataRef(): string {
        const currPage = this.pages[this.currentPageIndex];
        if (currPage && currPage.components) {
            const componentsArray: Component[] = [];
            this.forEachComponentArray(currPage.components, (comp) => {
                componentsArray.push(comp);
            });

            for (const component of componentsArray) {
                if (component.subType === "grid" && component.dataReference) {
                    return component.dataReference;
                }
            }

            return "";
        } else {
            return "";
        }
    }

    public getCustomComponents() {
        const custComponents: Component[] = [];
        this.forEachComponent((comp) => {
            if (this.customComponents.indexOf(comp.type) !== -1) {
                custComponents.push(comp);
            }
        });
        return custComponents;
    }

    public getStoryBookData() {
        let storyBook: any = null;
        this.forEachComponent((comp) => {
            if (comp.type === "storybook") {
                storyBook = comp;
            }
        });
        return storyBook;
    }

    /**
     * Callback to execute on each view.
     * If callback returns true, looping will be prevented.
     * @param cb Fired for each component in current loaded Exploration.
     */
    public forEachComponent(cb: (component: Component) => any) {
        for (const page of this.pages) {
            if (page.components) {
                this.forEachComponentArray(page.components, cb);
            }
        }
    }

    public forEachComponentArray(componentsArr: Component[][], cb: (Component: Component) => any) {
        for (const components of componentsArr) {
            for (const component of components) {
                if (component.type == "layout") {
                    this.forEachComponentArray(component.components, cb);
                }
                cb(component);
            }
        }
    }
}
