import * as CustomLearnosityModelPkg from "./models/custom-learnosity";
import * as CustomLearnosityViewPkg from "./views/custom-learnosity";

export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: CustomLearnosityModelPkg.CustomLearnosity;
    data?: any;
}

export const init = (options?: Options) => {
    const modelAttrs: any = {};
    if (options.data) {
        modelAttrs.savedData = options.data;
    }
    Object.assign(modelAttrs, JSON.parse(JSON.stringify(options.queData)));

    const customModel = new CustomLearnosityModelPkg.CustomLearnosity(modelAttrs);
    const view = new CustomLearnosityViewPkg.CustomLearnosity({
        el: options.$container,
        model: customModel
    });
    return view;
};
