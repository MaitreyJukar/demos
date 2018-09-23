import * as InteractiveDesmosModelPkg from "./models/interactive-desmos";
import * as InteractiveDesmosViewPkg from "./views/interactive-desmos";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: InteractiveDesmosModelPkg.InteractiveDesmos;
}

export const init = (options?: Options) => {
    const modelAttrs = {};
    Object.assign(modelAttrs, options.queData);

    const customModel = new InteractiveDesmosModelPkg.InteractiveDesmos(modelAttrs);
    const view = new InteractiveDesmosViewPkg.InteractiveDesmos({
        el: options.$container,
        model: customModel
    });
    return view;
};
