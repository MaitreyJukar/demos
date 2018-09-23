import * as ClickNClickModelPkg from "./models/click-n-click";
import * as ClickNClickViewPkg from "./views/click-n-click";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: ClickNClickModelPkg.ClickNClick;
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

    const customModel = new ClickNClickModelPkg.ClickNClick(modelAttrs);
    const view = new ClickNClickViewPkg.ClickNClick({
        el: options.$container,
        model: customModel
    });
    return view;
};
