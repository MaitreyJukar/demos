import * as ToolNameModelPkg from "./models/tool-name";
import * as ToolNameViewPkg from "./views/tool-name";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: ToolNameModelPkg.ToolName;
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

    const customModel = new ToolNameModelPkg.ToolName(modelAttrs);
    const view = new ToolNameViewPkg.ToolName({
        el: options.$container,
        model: customModel
    });
    return view;
};
