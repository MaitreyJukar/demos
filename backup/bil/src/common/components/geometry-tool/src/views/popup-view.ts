import * as Backbone from "backbone";
import "../../css/popup.styl";
import * as PopupModelPkg from "./../models/popup-model";

const PopupTemplate: (attr?: any) => string = require("./../../tpl/popup.hbs");

export class Popup extends Backbone.View<PopupModelPkg.Popup> {
    public type: string;
    constructor(attr?: Backbone.ViewOptions<PopupModelPkg.Popup>, options?: PopupViewOptions) {
        super(attr);
        this.render(options);
    }

    public events(): Backbone.EventsHash {
        return {
        };
    }

    public popupBtnClicked(event: MouseEvent) {
        const $target = this.$(event.target),
            inputElements = this.$(".input-values-container").find("input"),
            inputNumbers = this.$(".input-values-container").find("input[type='number']"),
            inputValues = new PopupParams();
        let num, denom;
        inputValues.type = this.type;

        switch ($target.data().btnName) {
            case "translate":
                inputValues.x = (+(inputNumbers.get(0) as HTMLInputElement).value);
                inputValues.y = (+(inputNumbers.get(1) as HTMLInputElement).value);
                if (!(inputValues.x && inputValues.y)) {
                    this.showErrorMsg(true);
                    return;
                }
                inputValues.btnType = "ok";
                break;
            case "reflect":
                inputValues.isXAxis = (inputElements.get(0) as HTMLInputElement).checked;
                inputValues.btnType = "ok";
                break;
            case "rotate":
                inputValues.angle = (inputElements.get(0) as HTMLInputElement).checked ? 90 :
                    (inputElements.get(1) as HTMLInputElement).checked ? 180 : 270;
                inputValues.isClockwise = (inputElements.get(3) as HTMLInputElement).checked;
                inputValues.btnType = "ok";
                break;
            case "dilate":
                const temp = inputNumbers.get(1) ? (+(inputNumbers.get(1) as HTMLInputElement).value) : 1;
                num = (+(inputNumbers.get(0) as HTMLInputElement).value);
                if (!num) {
                    this.showErrorMsg(true);
                    return;
                }
                denom = temp || 1;
                inputValues.multiplierK = num / denom;
                inputValues.btnType = "ok";
                break;
            case "cancel":
                inputValues.btnType = "cancel";
        }
        console.log(inputValues);
        this.showAndHidePopUp();
        this.trigger("popup-btn-clicked", inputValues);
    }

    public showErrorMsg(isError: boolean) {
        if (isError) {
            this.$(".error-msg").removeClass("hide-msg");
        } else {
            this.$(".error-msg").addClass("hide-msg");
        }
    }

    public render(options?: PopupViewOptions): Popup {
        this.updateType(options);
        return this;
    }

    public updateType(options?: PopupViewOptions) {
        this.$el.html(PopupTemplate(this.getTemplateOptions(options)));
        this.$el.closest(".geometry-tool-playground").append(this.$("#transform-dialogs")).find(".popup-btn")
            .on("click", this.popupBtnClicked.bind(this));
        this.$el.find("input[type=radio][name=primary-radio]").on("change", this.dilateRadioBtnClicked.bind(this));
        this.type = options.type;
    }

    public dilateRadioBtnClicked(event: any) {
        const value = (event.target as HTMLInputElement).value;
        switch (value) {
            case "integer":
                $(".input-box:last").addClass("hide");
                break;
            case "fraction":
                $(".input-box:last").removeClass("hide");
        }
    }

    public showAndHidePopUp() {
        this.$("." + this.type + "-container").toggleClass("hide");
    }

    public getTemplateOptions(options: PopupViewOptions) {
        let data, currentTemplateData;
        currentTemplateData = this.model.jsonData.popUpData;
        switch (options.type) {
            case "translate":
                data = currentTemplateData.translate;
                break;
            case "reflect":
                data = currentTemplateData.reflect;
                break;
            case "rotate":
                data = currentTemplateData.rotate;
                break;
            case "dilate":
                data = currentTemplateData.dilate;
        }
        return data;
    }
}

export class PopupParams {
    public type: string;
    public x?: number;
    public y?: number;
    public isXAxis?: boolean;
    public angle: number;
    public isClockwise?: boolean;
    public btnType?: string;
    public multiplierK?: number;
}

export interface PopupViewOptions {
    type?: string;
}
