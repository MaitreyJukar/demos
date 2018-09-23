import * as Backbone from "backbone";
import * as Handlebars from "handlebars";
import * as _ from "underscore";

// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jqueryui";
// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jquery-ui-touch-punch";

import "../../css/geometry-tool.styl";

import { Layer, PaperScope, Path, Point } from "paper";
import * as DrawingModelPkg from "../models/drawing-model";
import * as GeometryToolModelPkg from "../models/geometry-tool-model";
import * as GridGraphModel from "../models/grid-graph-model";
import * as MathUtilityPkg from "../models/maths-utility";
import * as PanelModel from "../models/panel-model";
import * as PopupModel from "../models/popup-model";
import * as GridGraphView from "../views/grid-graph-view";
import * as PanelView from "../views/panel-view";
import * as PopupView from "../views/popup-view";
import * as DrawingViewPkg from "./drawing-view";
import * as PlotterViewPkg from "./plotter-view";

declare interface ExtWindow extends Window {
    isClockWise: any;
    angle: any;
    currAxis: any;
}
declare const window: ExtWindow;

const GeometryToolTemplate: (attr?: any) => string = require("./../../tpl/geometry-tool.hbs");

export class GeometryTool extends Backbone.View<GeometryToolModelPkg.GeometryTool> {
    public gridGraphModel: GridGraphModel.GridGraph;
    public gridGraphView: GridGraphView.GridGraph;
    public panelView: PanelView.Panel;
    public panelModel: PanelModel.Panel;
    public popupView: PopupView.Popup;
    public popupModel: PopupModel.Popup;
    public drawingModel: DrawingModelPkg.DrawingModel;
    public drawingView: DrawingViewPkg.DrawingView;
    constructor(attr?: Backbone.ViewOptions<GeometryToolModelPkg.GeometryTool>) {
        super(attr);
        this.render();
        this.addResizeListener();

    }

    public events(): Backbone.EventsHash {
        return {
            "touchmove canvas": this.handleTouchMoveOnCanvas.bind(this)
        };
    }

    public handleTouchMoveOnCanvas(event: MouseEvent) {
        event.preventDefault();
    }

    public render(): GeometryTool {
        this.$el.html(GeometryToolTemplate(this._getTemplateOptions()));
        this.initializeGridGraph();
        this.initializePanelView();
        this.initializeDrawingView();
        return this;
    }
    public addResizeListener() {
        window.addEventListener("resize", () => {
            this.gridGraphView.reRenderGraph();
            this.drawingView.canvasSetup(true);
            this.drawingView.redrawShape();
            this.panelView.checkIfOverFlow();
        });
    }

    public initializeGridGraph() {
        this.gridGraphModel = new GridGraphModel.GridGraph({});
        this.gridGraphView = new GridGraphView.GridGraph({
            el: this.$(".graph-app"),
            model: this.gridGraphModel
        }, {
                canvasHeight: this.$(".graph-app").height(),
                canvasWidth: this.$(".graph-app").width()
            });
    }

    public initializePanelView() {
        const staticData = $.extend(true, {}, PanelModel.Panel.toolsBtnData),
            currTemplateData = $.extend(true, staticData, this.model.toolsBtnData);
        this.panelModel = new PanelModel.Panel({});
        this.panelView = new PanelView.Panel({
            el: this.$(".tools-panel"),
            model: this.panelModel
        }, currTemplateData);

        this.listenTo(this.panelView, "tools-btn-clicked", this.toolsBtnClicked.bind(this));
    }

    public toolsBtnClicked(event: MouseEvent) {
        const $target = $(event.target),
            mode = $target.attr("data-mode"),
            type = $target.attr("data-btn-name");

        switch (type) {
            case "zoom-in":
                this.listenTo(this.gridGraphView, "before-zoom-in", this.drawingView.perform.bind(this.drawingView, {
                    mode,
                    type
                }));
                this.listenTo(this.gridGraphView, "after-zoom-in", function(gridView: any) {
                    this.redrawShape();
                    this.stopListening(gridView, "before-zoom-in after-zoom-in");
                }.bind(this.drawingView, this.gridGraphView));
                this.gridGraphView.zoomInBtnClicked(event);

                break;
            case "zoom-out":
                this.listenTo(this.gridGraphView, "before-zoom-out", this.drawingView.perform.bind(this.drawingView, {
                    mode,
                    type
                }));
                this.listenTo(this.gridGraphView, "after-zoom-out", function(gridView: any) {
                    this.redrawShape();
                    this.stopListening(gridView, "before-zoom-out after-zoom-out");
                }.bind(this.drawingView, this.gridGraphView));
                this.gridGraphView.zoomOutBtnClicked(event);
                break;
            case "default-zoom":
                this.listenTo(this.gridGraphView, "before-default-zoom", this.drawingView.perform.bind(this.drawingView, {
                    mode,
                    type
                }));
                this.listenTo(this.gridGraphView, "after-default-zoom", function(gridView: any) {
                    this.redrawShape();
                    this.stopListening(gridView, "before-default-zoom after-default-zoom");
                }.bind(this.drawingView, this.gridGraphView));
                this.gridGraphView.defaultZoomBtnClicked(event);
                break;
            case "measurement-checkbox":
                this.drawingView.showHideMeasurements();
                break;
            default:
                this.drawingView.perform({
                    isPopUpShown: this.panelView.isPopUpShown,
                    mode,
                    type
                });
        }
    }

    public initializeDrawingView() {
        this.drawingModel = new DrawingModelPkg.DrawingModel({ popUpData: this.model.popUpData });
        this.drawingView = new DrawingViewPkg.DrawingView({
            el: this.$(".graph-container"),
            model: this.drawingModel
        });

        this.listenTo(this.drawingView, "update-measurement-checkbox", this.panelView.updateMeasurementCheckbox.bind(this.panelView));
        this.listenTo(this.drawingView, "mouse-drag-on-tool", this.mouseDragOnTool.bind(this));
    }

    public mouseDragOnTool(event: MouseEvent) {
        this.gridGraphView.mouseDragOnLayer(event);
    }

    public _getTemplateOptions() {
        return {
        };
    }
    public enable() {
        this.$(".geometry-tool-holder").removeClass("disabled");
    }

    public disable() {
        this.$(".geometry-tool-holder").addClass("disabled");
    }
}
