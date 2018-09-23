import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/patterns.styl";
import * as KaleidoscopePkg from "../models/kaleidoscope";

const patternsTpl: (attr?: any) => string = require("./../../tpl/patterns.hbs");

export class Patterns extends Backbone.View<KaleidoscopePkg.Kaleidoscope> {
    constructor(attr?: Backbone.ViewOptions<KaleidoscopePkg.Kaleidoscope>) {
        super(attr);
        this.render();
        this._setInitialValues();
        this._selectButton();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .pattern-button:not(.selected)": this._updatePattern.bind(this)
        };
    }

    public render(): Patterns {
        this.$el.html(patternsTpl(this._getPatterns()));
        return this;
    }

    private _getPatterns(): any[] {
        return this.model.patterns.map((val) => ({
            alt: KaleidoscopePkg.ALT_TEXT[val],
            src: KaleidoscopePkg.IMG_PATH + val + KaleidoscopePkg.IMG_EXTENSION,
            value: val
        }));
    }

    private _setInitialValues() {
        return this;
    }

    private _updatePattern(evt: JQueryEventObject) {
        const $target = $(evt.currentTarget);
        const pattern = $target.data("value");
        this.model.image = pattern;
        this._selectButton();
    }

    private _selectButton() {
        this.$(".pattern-button.selected").removeClass("selected");
        this.$(".pattern-button[data-value=" + this.model.image + "]").addClass("selected");
    }
}
