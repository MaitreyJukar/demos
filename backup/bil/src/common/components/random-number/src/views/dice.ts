import * as Backbone from "backbone";
import * as _ from "underscore";
import CommonUtilities = Utilities;
import * as RandomNumberModel from "../models/random-number";
import * as Utilities from "./../../../../helper/utilities";
import * as DiceRollPkg from "./dice-roller";

import "../../css/dice.styl";

const randomNumberTemplate: (attr?: any) => string = require("./../../tpl/dice.hbs");
const boxTemplate: (attr?: any) => string = require("./../../tpl/box.hbs");

export class RandomNumberDice extends Backbone.View<RandomNumberModel.RandomNumberGenerator> {

    public dice: DiceRollPkg.DiceRoller[];
    public rollCount = 0;
    public endPromise: CommonUtilities.PromiseWrapper<number>;

    constructor(attr?: Backbone.ViewOptions<RandomNumberModel.RandomNumberGenerator>) {
        super(attr);
        this.setButtonText();
        this.model.rangeArr = [1, 2, 3, 4, 5, 6];
        this.render();
    }

    public getButtonText() {
        let buttonText: string;
        if (this.model.incremental) {
            buttonText = "Roll " + this.model.rollCount;
        } else if (this.model.times) {
            buttonText = "Roll " + this.model.times;
        } else {
            buttonText =
                Utilities.Utilities.getLocText(this.model.currentLanguage,
                    this.model.randomNumberAttributes.subType.toLowerCase(), "btnText");
            buttonText = buttonText ? buttonText : "Roll";
        }
        return buttonText;
    }

    public setButtonText() {
        this.model.buttonText = this.getButtonText();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .generate-random": "generateRandomNumber"
        };
    }

    public render(): RandomNumberDice {
        this.$el.append(randomNumberTemplate(this.model.toJSON()));
        this.$("div.random-dice-container").first().append(boxTemplate(this.model.toJSON()));
        this.dice = [];
        if (this.model.times !== void 0) {
            this.model.count = this.model.times;
            this.model.randomNumber();
            this.dice.push(new DiceRollPkg.DiceRoller({
                completeCallback: this.diceRolled.bind(this),
                diceRadius: 50,
                el: this.$("#dice-0")[0] as HTMLCanvasElement,
                height: 100,
                width: 100
            }));
        } else {
            this.model.randomNumber();
            for (let i = 0; i < this.model.randomNumberArray.length; i++) {
                this.dice.push(new DiceRollPkg.DiceRoller({
                    completeCallback: this.diceRolled.bind(this),
                    diceRadius: 50,
                    el: this.$("#dice-" + i)[0] as HTMLCanvasElement,
                    height: 100,
                    width: 100
                }));
            }
        }
        return this;
    }

    public generateRandomNumber() {
        this.endPromise = new Utilities.PromiseWrapper<number>();
        this.$(".number-container span").html("");
        const times = (this.model.times) ? this.dice.length : this.model.randomNumberArray.length;
        for (let i = 0; i < times; i++) {
            const valIdx = this.model.sameNumber ? 0 : i;
            this.dice[i].rollTo(this.model.randomNumberArray[valIdx], true);
        }
        return this.endPromise;
    }

    public setRandomNumber() {
        return this.generateRandomNumber();
    }

    public diceRolled() {
        this.rollCount++;
        if (this.rollCount === this.dice.length) {
            for (let i = 0; i < this.dice.length; i++) {
                const valIdx = this.model.sameNumber ? 0 : i;
                this.$(".random-number-" + (i) + " span").html(this.model.randomNumberArray[valIdx].toString());
            }
            this.endPromise.resolve();
            this.rollCount = 0;
            if (this.model.incremental) {
                this.model.currentRoll++;
            }
            if (this.model.incremental && this.model.currentRoll < this.model.increments.length) {
                this.setButtonText();
            }
        }
    }
}
