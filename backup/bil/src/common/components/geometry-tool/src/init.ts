import * as GeometryToolModelPkg from "./models/geometry-tool-model";
import * as GeometryToolViewPkg from "./views/geometry-tool-view";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: GeometryToolModelPkg.GeometryToolAttributes;
}

export interface ExtWindow extends Window {
    BILTools: any;
}

declare const window: ExtWindow;
window.BILTools = window.BILTools || {};

export const init = (options?: Options) => {
    const modelAttrs: any = {
        popUpData: options.queData.popUpData,
        toolsBtnData: options.queData.toolsBtnData
    };
    Object.assign(modelAttrs, options.queData);

    const customModel = new GeometryToolModelPkg.GeometryTool(modelAttrs);

    const view = new GeometryToolViewPkg.GeometryTool({
        el: options.$container,
        model: customModel
    });
    return view;
};

window.BILTools.GeometryTool = init;
