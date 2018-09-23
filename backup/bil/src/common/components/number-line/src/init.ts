import * as NumberLineModelPkg from "./models/number-line";
import * as NumberLineViewPkg from "./views/number-line";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: NumberLineModelPkg.NumberLine;
    data?: any;
}

export interface ExtWindow extends Window {
    BILTools: any;
}
declare const window: ExtWindow;
window.BILTools = window.BILTools || {};

export const init = (options?: Options) => {
    const modelAttrs: any = {};
    if (options.data) {
        modelAttrs.savedData = options.data;
    }
    Object.assign(modelAttrs, options.queData);

    const customModel = new NumberLineModelPkg.NumberLine(modelAttrs);
    const view = new NumberLineViewPkg.NumberLine({
        el: options.$container,
        model: customModel
    });
    return view;
};
