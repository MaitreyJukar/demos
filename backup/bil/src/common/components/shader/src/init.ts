// tslint:disable-next-line:no-import-side-effect
import "../../../helper/handlebars-helpers";
import * as ShaderModelPkg from "./models/shader";
import * as ShaderViewPkg from "./views/shader";

export interface Options {
    queData: any;
    $container: JQuery<HTMLElement> | HTMLElement;
    data?: any;
}

export interface ExtWindow extends Window {
    BILTools: any;
}
declare const window: ExtWindow;
window.BILTools = window.BILTools || {};

export const init = (options?: Options) => {
    const modelAttrs = {} as any;
    if (options.data) {
        modelAttrs.savedData = options.data;
    }
    Object.assign(modelAttrs, options.queData);

    const customModel = new ShaderModelPkg.Shader(modelAttrs);
    const view = new ShaderViewPkg.Shader({
        el: options.$container,
        model: customModel
    });
    return view;
};

window.BILTools.ShadingTool = init;
