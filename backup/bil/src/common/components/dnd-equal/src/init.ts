// tslint:disable-next-line:no-import-side-effect
import "../../../helper/handlebars-helpers";
import * as DndEqualModelPkg from "./models/dnd-equal";
import * as DndEqualViewPkg from "./views/dnd-equal";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    data?: any;
    queData: any;
    saveData?: boolean;
}

export interface ExtWindow extends Window {
    BILTools: any;
}
declare const window: ExtWindow;
window.BILTools = window.BILTools || {};

export const init = (options?: Options) => {
    const modelAttrs = {
        saveData: options.saveData,
        savedData: options.data
    };
    Object.assign(modelAttrs, options.queData);

    const customModel = new DndEqualModelPkg.DndEqual(modelAttrs);
    const view = new DndEqualViewPkg.DndEqual({
        el: options.$container,
        model: customModel
    });
    return view;
};

window.BILTools.DndEqual = init;
