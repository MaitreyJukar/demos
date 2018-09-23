// tslint:disable-next-line:no-import-side-effect
import "../../../helper/handlebars-helpers";
import * as DNDImageModelPkg from "./models/dnd-image";
import * as DNDImageViewPkg from "./views/dnd-image";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    data?: any;
    queData: DNDImageModelPkg.DNDImage;
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

    const customModel = new DNDImageModelPkg.DNDImage(modelAttrs);
    const view = new DNDImageViewPkg.DNDImage({
        el: options.$container,
        model: customModel
    });
    return view;
};

window.BILTools.DndImage = init;
