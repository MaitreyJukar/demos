export interface Options {
    $container: JQuery<HTMLElement> | HTMLElement;
    queData: any;
    data?: any;
}

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

export const init = (options?: Options) => {
    const modelAttrs: any = {};
    if (options.data) {
        modelAttrs.savedData = options.data;
    }
    Object.assign(modelAttrs, JSON.parse(JSON.stringify(options.queData)));
    const ModelConstructor = window.BIL.CustomJS[options.queData.modelConstructor];
    const ViewConstructor = window.BIL.CustomJS[options.queData.viewConstructor];
    const customModel = new ModelConstructor(modelAttrs);
    const view = new ViewConstructor({
        el: options.$container,
        model: customModel
    });
    return view;
};
