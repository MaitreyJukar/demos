import * as Backbone from "backbone";
import * as _ from "underscore";

export class PanelAttributes {
}

export class Panel extends Backbone.Model {
    public static toolsBtnData = {
        dataButtonContainer: [{
            buttonClass: "label-btn tools-btn",
            buttonContainerClass: "label-btn-container",
            buttonText: "Label",
            dataBtnName: "label",
            isButtonVisible: true,
            mode: "measure"
        }, {
            buttonClass: "measure-btn tools-btn",
            buttonContainerClass: "measure-btn-container",
            buttonText: "Measure",
            dataBtnName: "measure",
            isButtonVisible: true,
            isMeasureAlignment: true,
            measureButtonData: [{
                buttonClass: "length-btn tools-btn",
                buttonContainerClass: "measure-btn measure-btn-inline",
                buttonId: "length",
                buttonText: "Length",
                dataBtnName: "length",
                isButtonVisible: true,
                isChecked: true,
                mode: "measure"
            }, {
                buttonClass: "angle-btn tools-btn",
                buttonContainerClass: "measure-btn measure-btn-inline",
                buttonId: "angle",
                buttonText: "Angle",
                dataBtnName: "angle",
                isButtonVisible: true,
                isChecked: false,
                mode: "measure"
            }],
            measureCheckBoxButtonData: {
                buttonClass: "tools-btn",
                buttonId: "measurement-checkbox",
                buttonText: "Show Measurements",
                dataBtnName: "measurement-checkbox",
                isButtonVisible: true,
                isChecked: true
            },
            mode: "measure"
        }],
        geometricFiguresButtonData: [{
            buttonClass: "point-btn tools-btn",
            buttonContainerClass: "point-btn-container",
            buttonText: "Point",
            dataBtnName: "point",
            isButtonVisible: true,
            mode: "draw"
        }, {
            buttonClass: "segment-btn tools-btn",
            buttonContainerClass: "segment-btn-container",
            buttonText: "Segment",
            dataBtnName: "segment",
            isButtonVisible: true,
            mode: "draw"
        }, {
            buttonClass: "line-btn tools-btn",
            buttonContainerClass: "line-btn-container",
            buttonText: "Line",
            dataBtnName: "line",
            isButtonVisible: true,
            mode: "draw"
        }, {
            buttonClass: "polygon-btn tools-btn",
            buttonContainerClass: "polygon-btn-container",
            buttonText: "Polygon",
            dataBtnName: "polygon",
            isButtonVisible: true,
            mode: "draw"
        }],
        isPopUpShown: true,
        isUndoRedoAllowed: true,
        isZoomBehaviourAllowed: true,
        objectOperationButtonData: [{
            buttonClass: "move-btn tools-btn",
            buttonContainerClass: "move-btn-container",
            buttonText: "Move",
            dataBtnName: "move",
            isButtonVisible: true,
            mode: "action"
        }, {
            buttonClass: "delete-btn tools-btn",
            buttonContainerClass: "delete-btn-container",
            buttonText: "Delete",
            dataBtnName: "delete",
            isButtonVisible: true,
            mode: "action"
        }],
        transformationButtonsData: [{
            buttonClass: "translate-btn tools-btn",
            buttonContainerClass: "translate-btn-container",
            buttonText: "Translate",
            dataBtnName: "translate",
            isButtonVisible: false,
            mode: "transform"
        }, {
            buttonClass: "reflect-btn tools-btn",
            buttonContainerClass: "reflect-btn-container",
            buttonText: "Reflect",
            dataBtnName: "reflect",
            isButtonVisible: false,
            mode: "transform"
        }, {
            buttonClass: "rotate-btn tools-btn",
            buttonContainerClass: "rotate-btn-container",
            buttonText: "Rotate",
            dataBtnName: "rotate",
            isButtonVisible: false,
            mode: "transform"
        }, {
            buttonClass: "dilate-btn tools-btn",
            buttonContainerClass: "dilate-btn-container",
            buttonText: "Dilate",
            dataBtnName: "dilate",
            isButtonVisible: false,
            mode: "transform"
        }]
    };

    constructor(attr: PanelAttributes) {
        super(attr);
    }

    public defaults() {
        return {

        };
    }
}
