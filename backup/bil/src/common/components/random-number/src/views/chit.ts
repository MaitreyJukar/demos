import * as Backbone from "backbone";
import * as _ from "underscore";
import CommonUtilities = Utilities;
import * as RandomNumberModel from "../models/random-number";
import * as Utilities from "./../../../../helper/utilities";
import * as CreateJSHelperModelPkg from "./../../../create-js-helper/src/models/create-js-helper";
import * as CreateJSHelperViewPkg from "./../../../create-js-helper/src/views/create-js-helper";

import "../../css/chit.styl";

export interface ExtWindow extends Window {
    createjs: any;
    lib: any;
}
declare const window: ExtWindow;
window.createjs = window.createjs || {};
window.lib = window.lib || {};

const animationData: CreateJSHelperModelPkg.AnimationData = require("./../../data/animations.json");
const animationNames: string[] = [];
// Load createjs lib..
require("./../../../../vendor/create-js/js/createjs.min.js");
// Load animation files..
for (const key in animationData) {
    if (animationData.hasOwnProperty(key)) {
        animationNames.push(key);
        require("./../../animations/" + key + ".js");
    }
}

const randomNumberTemplate: (attr?: any) => string = require("./../../tpl/box.hbs");
const canvasWrapperTemplate: (attr?: any) => string = require("./../../tpl/chit.hbs");

export class RandomNumberChit extends Backbone.View<RandomNumberModel.RandomNumberGenerator> {

    public createJSHelper: CreateJSHelperViewPkg.CreateJSHelper;
    public cachedTopBoxes: Array<JQuery<HTMLElement>> = [];
    public cachedBottomBoxes: Array<JQuery<HTMLElement>> = [];
    public animationId: string;
    public className: string;
    private tenChit: boolean;
    private tenChitClass: string;
    constructor(attr?: Backbone.ViewOptions<RandomNumberModel.RandomNumberGenerator>) {
        super(attr);
        this.setAnimationId();
        this.initCreateJSHelper();
        this.render();
        if (this.tenChit) {
            this.renderAnotherTenChits();
        }
        this.cacheAllBoxes();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .generate-random": "generateRandomNumber"
        };
    }

    public render(): RandomNumberChit {
        this.$(".animation-wrapper").append(randomNumberTemplate(this.model.toJSON()));
        this.$(".animation-wrapper").addClass(this.className);
        this.$("div.random-number-container").addClass("position-boxes").addClass(this.className);
        this.$("div.number-container span").addClass("scale-up-boxes");
        this.model.buttonText =
            Utilities.Utilities.getLocText(this.model.currentLanguage, this.model.randomNumberAttributes.subType.toLowerCase(), "btnText");
        this.createJSHelper.attachListener("animationEnd", this.showRandomNumber, this);
        return this;
    }

    public renderAnotherTenChits() {
        this.$("div.random-number-container").before('<p class="control-group chit-text-group">Control Group</p>');
        this.$(".number-container").addClass("topChits");
        this.$(".animation-wrapper").append(randomNumberTemplate(this.model.toJSON()));
        // tslint:disable-next-line:max-line-length
        this.$("div.random-number-container").not(".position-boxes").addClass("tenChitBottom position-boxes " + this.className).before('<p class="chit-text-group treatment-group">Treatment Group</p>');
    }

    public cacheAllBoxes() {
        for (let i = 0; i < this.model.count; i++) {
            this.cachedTopBoxes.push(this.$(".random-number-" + (i) + this.tenChitClass + " span"));
            this.cachedBottomBoxes.push(this.$(".tenChitBottom .random-number-" + (i) + " span"));
        }
    }

    public setAnimationId() {
        switch (this.model.count) {
            case 2:
                this.animationId = animationNames[0];
                this.className = "chit-2";
                this.tenChit = false;
                this.tenChitClass = "";
                break;
            case 10:
                this.animationId = animationNames[1];
                this.className = "chit-10";
                this.tenChit = true;
                this.tenChitClass = ".topChits";
                if (this.model.rangeArr.length != 20) {
                    CommonUtilities.Utilities.logger.warn("Length of range array should be 20");
                }
                break;
            default:
                this.animationId = animationNames[0];
                this.$("div.random-number-container").addClass("position-boxes");
                this.model.count = 2;
                this.className = "chit-2";
                this.tenChit = false;
                this.tenChitClass = "";
                CommonUtilities.Utilities.logger.warn("invalid count to chit mapping - chit.ts file");
        }
    }

    public generateRandomNumber() {
        this.removeBoxData();
        return this.createJSHelper.initAnimation(this.animationId);
    }

    public setRandomNumber() {
        return this.generateRandomNumber();
    }

    public showRandomNumber() {
        this.model.randomizeRandomeArr();
        for (let i = 0; i < this.model.count; i++) {
            if (this.tenChit) {
                this.cachedTopBoxes[i].html(this.model.rangeArr[i].toString());
                setTimeout(() => {
                    this.cachedBottomBoxes[i].html(this.model.rangeArr[i + 10].toString());
                }, 500);
            } else {
                this.cachedTopBoxes[i].html(this.model.randomNumberArray[i].toString());
            }
        }
    }

    public removeBoxData() {
        for (let i = 0; i < this.model.count; i++) {
            this.cachedTopBoxes[i].html("");
            this.cachedBottomBoxes[i].html("");
        }
    }

    public initCreateJSHelper() {
        const model = new CreateJSHelperModelPkg.CreateJSHelper({ animationData });
        this.$el.append(canvasWrapperTemplate);
        this.createJSHelper = new CreateJSHelperViewPkg.CreateJSHelper({
            model
        }, {
                $constainer: this.$(".animation-wrapper")
            });
        $("div.random-type-container").addClass("parent-random-type-container");
        this.setCreateJSProps();
        this.createJSHelper.gotoAndStop(this.animationId);
    }

    public setCreateJSProps() {
        if (this.className == "chit-2") {
            window.lib.properties.height = 210;
        } else if (this.className == "chit-10") {
            window.lib.properties.height = 290;
        }
    }
}
