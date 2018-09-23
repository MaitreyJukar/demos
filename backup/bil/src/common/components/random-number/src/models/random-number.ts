import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";
import * as Utilities from "./../../../../helper/utilities";
import CommonUtilities = Utilities;

export enum Types {
    Dice,
    Chit,
    Button
}

export declare class RandomNumberAttributes {
    public subType: string;
    public min?: number;
    public max?: number;
    public rangeArr?: number[];
    public count: number;
    public unique: boolean;
    public buttonText: string;
    public label?: string;
    public limit?: number;
    public logText: string;
    public incremental?: boolean;
    public increments?: number[];
    public rollCount?: number;
    public currentRoll?: number;
    public factor?: number;
    public tolerance?: number;
    public sameNumber?: boolean;
    public showDefault?: boolean;
    public defaultValues?: number[];
    public times?: number;
    public displayCount?: number;
}

export class RandomNumberGenerator extends Backbone.Model {

    public randomNumberAttributes: RandomNumberAttributes;
    public randomNumberArray: number[];

    constructor(attr: RandomNumberAttributes, lang: CommonUtilities.Language) {
        super(attr);
        this.randomNumberAttributes = attr;
        if (this.max != null) {
            this.rangeArr = _.range(this.min, this.max + 1);
        }
        this.randomNumberArray = [];
        this.currentLanguage = lang;
    }

    get type(): Types { return this.get("type"); }
    set type(value: Types) { this.set("type", value); }

    get min(): number { return this.get("min"); }
    set min(value: number) { this.set("min", value); }

    get max(): number { return this.get("max"); }
    set max(value: number) { this.set("max", value); }

    get count(): number { return this.get("count"); }
    set count(value: number) { this.set("count", value); }

    get rangeArr(): number[] { return this.get("rangeArr"); }
    set rangeArr(value: number[]) { this.set("rangeArr", value); }

    // flag that indicates whether the random number generated will be repeated
    get unique(): boolean { return this.get("unique"); }
    set unique(value: boolean) { this.set("unique", value); }

    // the max number of times the random number can be generated
    get limit(): number { return this.get("limit"); }
    set limit(value: number) { this.set("limit", value); }

    get buttonText(): string { return this.get("buttonText"); }
    set buttonText(value: string) { this.set("buttonText", value); }

    get logText(): string { return this.get("logText"); }
    set logText(value: string) { this.set("logText", value); }

    get currentLanguage(): CommonUtilities.Language { return this.get("currentLanguage"); }
    set currentLanguage(value: CommonUtilities.Language) { this.set("currentLanguage", value); }

    // whether the output is a probability for a series of steps instead of random numbers
    get incremental(): boolean { return this.get("incremental"); }
    set incremental(value: boolean) { this.set("incremental", value); }

    // the steps/increments multiplied to probability
    get increments(): number[] { return this.get("increments"); }
    set increments(value: number[]) { this.set("increments", value); }

    get currentRoll(): number { return this.get("currentRoll"); }
    set currentRoll(value: number) { this.set("currentRoll", value); }

    // the number by which to divide increments to get the probability
    get factor(): number { return this.get("factor"); }
    set factor(value: number) { this.set("factor", value); }

    // tolerance set for probability value
    get tolerance(): number { return this.get("tolerance"); }
    set tolerance(value: number) { this.set("tolerance", value); }

    // whether all numbers generated are same
    get sameNumber(): boolean { return this.get("sameNumber"); }
    set sameNumber(value: boolean) { this.set("sameNumber", value); }

    // whether any default values is shown
    get showDefault(): boolean { return this.get("showDefault"); }
    set showDefault(value: boolean) { this.set("showDefault", value); }

    // whether any default values is shown
    get defaultValues(): number[] { return this.get("defaultValues"); }
    set defaultValues(value: number[]) { this.set("defaultValues", value); }

    get label(): string { return this.get("label"); }
    set label(value: string) { this.set("label", value); }

    get times(): number { return this.get("times"); }
    set times(value: number) { this.set("times", value); }

    get rollCount(): number { return this.increments[this.currentRoll]; }

    get displayCount(): number { return this.get("displayCount"); }

    public randomNumber(): void {
        const randomArr: number[] = [];
        let randomIndex: number;
        const valueArray = this.rangeArr.slice();
        for (let i = 0; i < this.count; i++) {
            randomIndex = Math.floor(Math.random() * valueArray.length);
            randomArr.push(valueArray[randomIndex]);
            if (this.unique == true) {
                valueArray.splice(randomIndex, 1);
            }
        }
        this.randomNumberArray = randomArr;
    }

    public countInstances(arr: any[], obj: any) {
        return arr.reduce((pre, cur) => (cur === obj) ? ++pre : pre, 0);
    }

    public randomizeRandomeArr(): void {
        this.rangeArr = _.shuffle(this.rangeArr);
    }

    public defaults() {
        return {
            buttonText: "",
            count: 0,
            currentRoll: 0,
            displayCount: 3,
            incremental: false,
            increments: null as number[],
            limit: 50,
            max: null as number,
            min: null as number,
            rangeArr: [] as number[],
            rollCount: 0,
            sameNumber: false,
            tolerance: 2,
            type: Types.Dice,
            unique: false
        };
    }

}
