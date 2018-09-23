// tslint:disable-next-line:no-import-side-effect
import "../../../helper/handlebars-helpers";
import { Language } from "../../../helper/utilities";
import * as AlgeModelPkg from "./models/algebra-tiles-model";
import * as AlgeViewPkg from "./views/algebra-tiles-view";

export interface Options {
    queData: AlgeModelPkg.JsonStruct;
    $container: JQuery<HTMLElement> | HTMLElement;
    currentLanguage: Language;
}

export interface ExtWindow extends Window {
    BILTools: any;
}
declare const window: ExtWindow;
window.BILTools = window.BILTools || {};

export const init = (options?: Options) => {
    const customModel = new AlgeModelPkg.AlgebraTiles({
        algeData: options.queData,
        currentLanguage: options.currentLanguage
    });
    const view = new AlgeViewPkg.AlgebraTiles({
        el: options.$container,
        model: customModel
    });
    return view;
};

window.BILTools.AlgebraTiles = init;
