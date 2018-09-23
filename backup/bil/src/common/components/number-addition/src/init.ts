import * as NumberAdditionModelPkg from "./models/number-addition";
import * as NumberAdditionViewPkg from "./views/number-addition";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: NumberAdditionModelPkg.NumberAddition;
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

    const customModel = new NumberAdditionModelPkg.NumberAddition(modelAttrs);
    const view = new NumberAdditionViewPkg.NumberAddition({
        el: options.$container,
        model: customModel
    });
    return view;
};
