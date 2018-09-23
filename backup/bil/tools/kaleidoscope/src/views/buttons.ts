import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/buttons.styl";
import * as KaleidoscopePkg from "../models/kaleidoscope";

const buttonsTpl: (attr?: any) => string = require("./../../tpl/buttons.hbs");

export class Buttons extends Backbone.View<KaleidoscopePkg.Kaleidoscope> {
    constructor(attr?: Backbone.ViewOptions<KaleidoscopePkg.Kaleidoscope>) {
        super(attr);
        this.render();
        this._setInitialValues();
        this._selectButton();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .degree-button:not(.selected)": this._updateAngle.bind(this)
        };
    }

    public render(): Buttons {
        this.$el.html(buttonsTpl(this.model.angles));
        return this;
    }

    private _setInitialValues() {
        return this;
    }

    private _updateAngle(evt: JQueryEventObject) {
        const $target = $(evt.currentTarget);
        const angle = $target.data("value");
        this.model.angle = parseInt(angle, 10);
        this._selectButton();
    }

    private _selectButton() {
        this.$(".degree-button.selected").removeClass("selected");
        this.$(".degree-button[data-value=" + this.model.angle + "]").addClass("selected");
    }
}
