import * as Backbone from "backbone";
import * as _ from "underscore";
import CommonUtilities = Utilities;
import * as RandomNumberModel from "../models/random-number";
import * as Utilities from "./../../../../helper/utilities";

import "../../css/button.styl";

const randomNumberTemplate: (attr?: any) => string = require("./../../tpl/box.hbs");

export class RandomNumberButton extends Backbone.View<RandomNumberModel.RandomNumberGenerator> {
    constructor(attr?: Backbone.ViewOptions<RandomNumberModel.RandomNumberGenerator>) {
        super(attr);
        this.model.count = (this.model.count !== void 0) ? this.model.count : 2;
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .generate-random": "generateRandomNumber"
        };
    }

    public render(): RandomNumberButton {
        this.$el.append(randomNumberTemplate(this.model.toJSON()));
        this.model.buttonText = !this.model.buttonText ?
            Utilities.Utilities.getLocText(this.model.currentLanguage, this.model.randomNumberAttributes.subType.toLowerCase(), "btnText") :
            this.model.buttonText;
        this.model.logText = "Numbers round";
        $(".random-type-container").addClass("button-styles");
        return this;
    }

    public setDefaultValues() {
        for (let i = 0; i < this.model.defaultValues.length; i++) {
            this.$(".random-number-" + i + " span").html(this.model.defaultValues[i].toString());
        }
    }

    public removeBoxData() {
        for (let i = 0; i < this.model.count; i++) {
            this.$(".random-number-" + i + " span").html("");
        }
    }

    public setRandomNumber() {
        this.removeBoxData();
        for (let i = 0; i < this.model.randomNumberArray.length; i++) {
            this.$(".random-number-" + i + " span").html(this.model.randomNumberArray[i].toString());
        }
        const endPromise = new Utilities.PromiseWrapper<number>();
        endPromise.resolve(0);
        return endPromise;
    }
}
