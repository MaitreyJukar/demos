// tslint:disable-next-line:no-import-side-effect
import "../../../helper/handlebars-helpers";
import * as DragDropModelPkg from "./models/drag-drop";
import * as DragDropViewPkg from "./views/drag-drop";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: DragDropModelPkg.DragDrop;
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

    const customModel = new DragDropModelPkg.DragDrop(modelAttrs);
    const view = new DragDropViewPkg.DragDrop({
        el: options.$container,
        model: customModel
    });
    return view;
};

window.BILTools.DragDrop = init;
