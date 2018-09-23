import * as CustomDesmosModelPkg from "./models/custom-desmos";
import * as CustomDesmosViewPkg from "./views/custom-desmos";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: CustomDesmosModelPkg.CustomDesmos;
    data?: any;
}

export const init = (options?: Options) => {
    const modelAttrs: any = {};
    if (options.data) {
        modelAttrs.savedData = options.data;
    }
    Object.assign(modelAttrs, options.queData);

    const customModel = new CustomDesmosModelPkg.CustomDesmos(modelAttrs);
    const view = new CustomDesmosViewPkg.CustomDesmos({
        el: options.$container,
        model: customModel
    });
    return view;
};
