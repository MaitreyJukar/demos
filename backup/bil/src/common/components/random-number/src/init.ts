// tslint:disable-next-line:no-import-side-effect
import "../../../helper/handlebars-helpers";
import { RandomNumberAttributes, RandomNumberGenerator } from "./models/random-number";
import * as RandomNumberButtonView from "./views/button";
import * as RandomNumberChitView from "./views/chit";
import * as RandomNumberDiceView from "./views/dice";
import * as RandomNumberView from "./views/random-number";

import * as Utilities from "./../../../helper/utilities";
import CommonUtilities = Utilities;

export interface Options {
    queData: RandomNumberAttributes;
    $container: JQuery<HTMLElement> | HTMLElement;
    currentLanguage: CommonUtilities.Language;
}

export interface ExtWindow extends Window {
    BILTools: any;
}
declare const window: ExtWindow;
window.BILTools = window.BILTools || {};

export const init = (options?: Options) => {

    const randomNumberAttributes = options.queData;
    const currentLanguage = options.currentLanguage;
    const customModel = new RandomNumberGenerator(randomNumberAttributes, currentLanguage);

    const subtype = randomNumberAttributes.subType;
    const view = new RandomNumberView.RandomNumber({
        el: options.$container,
        model: customModel
    });
    return view;
};

window.BILTools.RandomNumber = init;
