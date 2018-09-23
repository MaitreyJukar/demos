import * as KaleidoscopeModelPkg from "./models/kaleidoscope";
import * as ButtonsViewPkg from "./views/buttons";
import * as DesignerViewPkg from "./views/designer";
import * as KaleidoscopeViewPkg from "./views/kaleidoscope";
import * as PatternsViewPkg from "./views/patterns";

import "../css/common.styl";

declare interface ExtWindow extends Window {
    cb?: number;
}

declare const window: ExtWindow;
declare const CACHEBUSTER: number;

export interface Options {
    componentData: KaleidoscopeModelPkg.KaleidoscopeAttributes;
    $container: JQuery<HTMLElement> | HTMLElement;
}

export class KaleidoscopeGenerator {
    private _model: KaleidoscopeModelPkg.Kaleidoscope;

    private _buttons: ButtonsViewPkg.Buttons;
    private _patterns: PatternsViewPkg.Patterns;
    private _designer: DesignerViewPkg.Designer;
    private _kaleidoscope: KaleidoscopeViewPkg.Kaleidoscope;

    constructor() {
        window.cb = (CACHEBUSTER !== void 0 && CACHEBUSTER !== null && typeof CACHEBUSTER === "number") ? CACHEBUSTER : 2;
        this._initializeModel();
        this._renderButtonsPanel();
        this._renderPatterns();
        this._renderDesignSelector();
        this._createKaleidoscope();
    }

    private _initializeModel() {
        this._model = new KaleidoscopeModelPkg.Kaleidoscope({});
        return this;
    }

    private _renderButtonsPanel() {
        this._buttons = new ButtonsViewPkg.Buttons({
            el: $(".buttons-section"),
            model: this._model
        });
        return this;
    }

    private _renderPatterns() {
        this._patterns = new PatternsViewPkg.Patterns({
            el: $(".patterns-section"),
            model: this._model
        });
        return this;
    }

    private _renderDesignSelector() {
        this._designer = new DesignerViewPkg.Designer({
            el: $(".designer-section"),
            model: this._model
        });
        return this;
    }

    private _createKaleidoscope(options?: Options) {
        const kaleidoscope = new KaleidoscopeViewPkg.Kaleidoscope({
            el: $(".kaleidoscope-section"),
            model: this._model
        });
        return kaleidoscope;
    }
}

$(document).ready(() => {
    const app: any = new KaleidoscopeGenerator();
});
