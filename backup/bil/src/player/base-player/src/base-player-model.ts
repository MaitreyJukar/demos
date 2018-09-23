import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";
import * as TooltipModelPkg from "./../../../common/components/tooltip/src/models/tooltip-model";
import * as Utilities from "./../../../common/helper/utilities";
import CommonUtilities = Utilities;
const Language = CommonUtilities.Language;
const COMMON_COMPONENTS = [
    "grid",
    "desmos",
    "custom-learnosity",
    "custom-desmos",
    "number-line"
];

export enum QuestionType {
    "learnosity",
    "desmos",
    "custom",
    "html",
    "controls"
}

export declare class BasePlayerAttributes {
    public explorationID?: string;
    public questions?: QuestionLayout[];
    public additionalInfo?: AdditionalInfo;
    public locTextData?: any;
    public showHint?: boolean;
    public common?: any;
}

export interface Component {
    type: string;
    subType: string;
    cssClass?: string;
    innerHTML?: string;
    dataReference?: string;
    desmosURL?: string;
    altText?: string;
}

export declare class LayoutComponent {
    public multi?: boolean;
    public components?: Component[];
    public lcomponents?: { components: Component[]; width: string };
    public rcomponents?: { components: Component[]; width: string };
}

export declare class QuestionLayout {
    public layouts?: LayoutComponent[];
    public caption?: string;
    public audioID?: string;
    public validate?: boolean;
}

export declare class AdditionalInfo {
    public title?: string;
    public content?: string;
    public position?: string;
    public postImgContent?: string;
    public image?: TooltipModelPkg.InfoImage;
    public audioID?: string;
    public quesID?: number;
    public buttonText?: string;
}

export declare class JSONStructure {
    public useCustomStyle?: boolean;
    public useCustomScript?: boolean;
    public explorationID?: string;
    public questions: QuestionLayout[];
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
    public questions: QuestionLayout[];
    public additionalInfo: AdditionalInfo;
    public currentQuestionIndex: number;
    public totalQuestions: number;
    public currentLanguage: Utilities.Language;
    public explorationID?: string;
    public customComponents = ["custom"];

    constructor(attr: BasePlayerAttributes, opts?: any) {
        super(attr, opts);
        this.questions = attr.questions;
        this.additionalInfo = attr.additionalInfo;
        this.totalQuestions = this.questions.length;
        this.explorationID = attr.explorationID;
        this.currentLanguage = opts;
        this.languages = Language;
        this.currentQuestionIndex = 0;
    }

    get locTextData(): { [id: string]: string } { return this.get("locTextData"); }
    set locTextData(value: { [id: string]: string }) { this.set("locTextData", value); }

    get languages(): typeof Utilities.Language { return this.get("languages"); }
    set languages(value: typeof Utilities.Language) { this.set("languages", value); }

    get useCustomStyle(): boolean { return this.get("useCustomStyle"); }
    set useCustomStyle(value: boolean) { this.set("useCustomStyle", value); }

    get useCustomScript(): boolean { return this.get("useCustomScript"); }
    set useCustomScript(value: boolean) { this.set("useCustomScript", value); }

    get hasCustomDesmos(): boolean { return this.get("hasCustomDesmos"); }
    set hasCustomDesmos(value: boolean) { this.set("hasCustomDesmos", value); }

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
        const componentId = "base-player";

        this.locTextData = {
            checkBtnText: getLocText(selectedLanguage, componentId, "check-button"),
            contBtnText: getLocText(selectedLanguage, componentId, "continue-button"),
            engText: getLocText(selectedLanguage, componentId, "lang-text-english"),
            finishBtnText: getLocText(selectedLanguage, componentId, "finish-button"),
            replayBtnText: getLocText(selectedLanguage, componentId, "replay-button"),
            showBtnText: getLocText(selectedLanguage, componentId, "show-button"),
            spanishText: getLocText(selectedLanguage, componentId, "lang-text-spanish"),
            unmuteBtnAria: getLocText(selectedLanguage, componentId, "unmute-button")
        };
    }

    /**
     * Returns data referance in string if found, otherwise empty string.
     */
    public getCurrCustomDataRef(): string[] {
        const currQue = this.questions[this.currentQuestionIndex];
        const dataRefs = [];
        if (currQue && currQue.layouts) {
            for (const layout of currQue.layouts) {
                if (layout.components) {
                    for (const comp of layout.components) {
                        if (this.hasDataRef(comp)) {
                            dataRefs.push(comp.dataReference);
                        }
                    }
                }
                if (layout.lcomponents) {
                    for (const comp of layout.lcomponents.components) {
                        if (this.hasDataRef(comp)) {
                            dataRefs.push(comp.dataReference);
                        }
                    }
                }
                if (layout.rcomponents) {
                    for (const comp of layout.rcomponents.components) {
                        if (this.hasDataRef(comp)) {
                            dataRefs.push(comp.dataReference);
                        }
                    }
                }
            }
        }
        return dataRefs;
    }

    /**
     * Determines whether the given component is a common component
     */
    public hasDataRef(comp: Component): boolean {
        return COMMON_COMPONENTS.indexOf(comp.subType) > -1 && !!comp.dataReference;
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

    /**
     * Callback to execute on each view.
     * If callback returns true, looping will be prevented.
     * @param cb Fired for each component in current loaded Exploration.
     */
    public forEachComponent(cb: (component: Component) => any) {
        for (const question of this.questions) {
            if (question.layouts) {
                for (const layout of question.layouts) {
                    if (layout.components) {
                        for (const comp of layout.components) {
                            cb(comp);
                        }
                    }
                    if (layout.lcomponents && layout.lcomponents.components) {
                        for (const comp of layout.lcomponents.components) {
                            cb(comp);
                        }
                    }
                    if (layout.rcomponents && layout.rcomponents.components) {
                        for (const comp of layout.rcomponents.components) {
                            cb(comp);
                        }
                    }
                }
            }
        }
    }
}
