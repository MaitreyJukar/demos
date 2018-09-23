import * as Backbone from "backbone";
import * as Handlebars from "handlebars";
import * as _ from "underscore";

// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jqueryui";
// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jquery-ui-touch-punch";

import "../../css/panel.styl";
import * as PanelModelPkg from "../models/panel-model";

const PanelTemplate: (attr?: any) => string = require("./../../tpl/tools-panel.hbs");

export interface PanelViewOptions {
    isPointBtnVisble?: boolean;
    isSegmentBtnVisible?: boolean;
    isLineBtnVisible?: boolean;
    isPolygonBtnVisible?: boolean;
    isZoomBehaviourAllowed?: boolean;
    isUndoRedoAllowed?: boolean;
    isMoveBtnVisble?: boolean;
    isDeleteBtnVisible?: boolean;
    isLabelBtnVisble?: boolean;
    isMesureBtnVisible?: boolean;
    isTranslateBtnVisble?: boolean;
    isReflectBtnVisible?: boolean;
    isRotateBtnVisible?: boolean;
    isAngleBtnVisble?: boolean;
    isLengthBtnVisble?: boolean;
    isMeasureAlignment?: boolean;
    isPopUpShown?: boolean;
}

export class Panel extends Backbone.View<PanelModelPkg.Panel> {
    public static isShowMeasurements: any;
    public isPointBtnVisble: boolean;
    public isSegmentBtnVisible: boolean;
    public isLineBtnVisible: boolean;
    public isPolygonBtnVisible: boolean;
    public isZoomBehaviourAllowed: boolean;
    public isUndoRedoAllowed: boolean;
    public isMoveBtnVisble: boolean;
    public isDeleteBtnVisible: boolean;
    public isMesureBtnVisible: boolean;
    public isLabelBtnVisble: boolean;
    public isTranslateBtnVisble: boolean;
    public isReflectBtnVisible: boolean;
    public isRotateBtnVisible: boolean;
    public isAngleBtnVisble: boolean;
    public isLengthBtnVisble: boolean;
    public isMeasureAlignment: boolean;
    public isPopUpShown: boolean;
    public currTemplateData: PanelViewOptions;

    constructor(attr?: Backbone.ViewOptions<PanelModelPkg.Panel>, options?: PanelViewOptions) {
        super(attr);
        this.currTemplateData = options;
        this.render(options);
    }
    public static getIsShowMeasurements(): boolean {
        return this.isShowMeasurements;
    }

    public events(): Backbone.EventsHash {
        return {
        };
    }

    public toolsBtnClicked(event: MouseEvent) {
        const $target = $(event.target),
            mode = $target.attr("data-mode"),
            type = $target.attr("data-btn-name");

        if (type === "measure") {
            this.toggleMeasureOptionsPopup();
            if (!this.$(".measurement-buttons-container").hasClass("hide-measurement")) {
                this.$("#length").prop("checked") ? this.$("#length").trigger("click") : this.$("#angle").trigger("click");
                this.setIsShowMeasurements();
            }
            this.setHeightForMeasureContainer();
        } else {
            if (type === "measurement-checkbox") {
                this.setIsShowMeasurements();
            }
            this.trigger("tools-btn-clicked", event);
        }
    }

    public sliderBtnClicked(event: MouseEvent) {
        const container = this.$(".tools-panel-buttons-container"),
            startSlider = container.parent().find(".start-slider"),
            endSlider = container.parent().find(".end-slider");
        let scrollLeft = container.scrollLeft();
        const $target = $(event.target),
            type = $target.attr("data-btn-name");
        switch (type) {
            case "start-slider":
                scrollLeft -= 100;
                break;
            case "end-slider":
                scrollLeft += 100;
        }
        container.animate({ scrollLeft: scrollLeft.toString() }, 300);
        setTimeout(() => {
            this.enableDisableSlider(container, container.scrollLeft(), endSlider, startSlider);
        }, 300);
    }

    public enableDisableSlider(container: JQuery<HTMLElement>, scrollLeft: number, end: JQuery<HTMLElement>, start: JQuery<HTMLElement>) {
        if (container[0].scrollWidth - container[0].clientWidth === scrollLeft) {
            end.addClass("disabled-btn");
        } else {
            end.removeClass("disabled-btn");
        }
        if (scrollLeft === 0) {
            start.addClass("disabled-btn");
        } else {
            start.removeClass("disabled-btn");
        }
    }

    public setHeightForMeasureContainer() {
        if (this.isMeasurementPopupVisible()) {
            this.$(".tools-panel-buttons-container").addClass("open-measure");
        } else {
            this.$(".tools-panel-buttons-container").removeClass("open-measure");
        }
    }

    public checkIfOverFlow() {
        if (this.$(".tools-panel-buttons-container")[0].scrollWidth <= this.$(".tools-panel-buttons-container")[0].clientWidth + 10) {
            this.$(".btn-slider").addClass("hide-editable-label");
            this.$(".geometric-figures-button-container").css("padding-left", 0);
            this.$(".transformation-button-container").css("padding-right", 0);
            this.$(".measurement-buttons-container").addClass("no-slider");
        } else {
            this.$(".btn-slider").removeClass("hide-editable-label");
            this.$(".geometric-figures-button-container").css("padding-left", 10);
            this.$(".transformation-button-container").css("padding-right", 30);
            this.$(".measurement-buttons-container").removeClass("no-slider");
        }
    }

    public bindClickEventOnDocument() {
        $(document).on("mouseup.measure", this.mouseUpOnDocument.bind(this));
    }

    public mouseUpOnDocument(event: MouseEvent) {
        const target = event.target;
        if (!$(target).hasClass("measure-btn") && this.isMeasurementPopupVisible() &&
            !$(target).parents(".measurement-buttons-container").length) {
            this.toggleMeasureOptionsPopup();
        }
    }

    public setIsShowMeasurements() {
        Panel.isShowMeasurements = this.$("#measurement-checkbox").prop("checked");
    }

    public toggleMeasureOptionsPopup() {
        this.$(".measurement-buttons-container").toggleClass("hide-measurement");
    }

    public updateMeasurementCheckbox(event: any) {
        this.$("#measurement-checkbox").prop("checked", true);
        this.setIsShowMeasurements();
    }

    public isMeasurementPopupVisible(): boolean {
        return !this.$(".measurement-buttons-container").hasClass("hide-measurement");
    }

    public render(options?: PanelViewOptions): Panel {
        this.isPointBtnVisble = options.isPointBtnVisble;
        this.isSegmentBtnVisible = options.isSegmentBtnVisible;
        this.isLineBtnVisible = options.isLineBtnVisible;
        this.isPolygonBtnVisible = options.isPolygonBtnVisible;
        this.isZoomBehaviourAllowed = options.isZoomBehaviourAllowed;
        this.isUndoRedoAllowed = options.isUndoRedoAllowed;
        this.isMoveBtnVisble = options.isMoveBtnVisble;
        this.isDeleteBtnVisible = options.isDeleteBtnVisible;
        this.isLabelBtnVisble = options.isLabelBtnVisble;
        this.isMesureBtnVisible = options.isMesureBtnVisible;
        this.isTranslateBtnVisble = options.isTranslateBtnVisble;
        this.isReflectBtnVisible = options.isReflectBtnVisible;
        this.isRotateBtnVisible = options.isRotateBtnVisible;
        this.isAngleBtnVisble = options.isAngleBtnVisble;
        this.isLengthBtnVisble = options.isLengthBtnVisble;
        this.isMeasureAlignment = options.isMeasureAlignment;
        this.isPopUpShown = options.isPopUpShown;

        this.$el.html(PanelTemplate(this.currTemplateData));
        this.$el.closest(".geometry-tool-playground").append(this.$(".undo-redo-buttons-panel,.zoom-buttons-panel"))
            .find(".tools-btn").on("click", this.toolsBtnClicked.bind(this));
        this.$el.find(".btn-slider").on("click", this.sliderBtnClicked.bind(this));
        this.bindClickEventOnDocument();
        this.checkIfOverFlow();
        return this;
    }
}
