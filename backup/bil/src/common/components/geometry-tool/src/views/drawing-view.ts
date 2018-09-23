import * as Backbone from "backbone";
import { Point } from "paper";
import * as _ from "underscore";
import {
    ActionData, Coordinate, DrawingObject, LabelPoints, PointDelta, ShapeCollection, StylesType
} from "../models/classes";
import * as DrawingModelPkg from "../models/drawing-model";
import * as MathUtilityPkg from "../models/maths-utility";
import * as OperationModelPkg from "../models/operation-model";
import * as PopupModel from "../models/popup-model";
import * as RelationModelPkg from "../models/relation-model";
import * as UndoRedoManagerPkg from "../models/undo-redo-manager";
import * as PanelView from "../views/panel-view";
import * as PopupView from "../views/popup-view";
import * as GridGraphModelPkg from "./../models/grid-graph-model";
import * as PlotterViewPkg from "./plotter-view";

export class DrawingView extends Backbone.View<DrawingModelPkg.DrawingModel> {
    public plotter: PlotterViewPkg.PlotterView;
    public operationModel: OperationModelPkg.OperationModel;
    public undoRedoManager: UndoRedoManagerPkg.UndoRedoManager;
    public canvasMouseMoveFuncProxy: any;
    public canvasMouseDownFuncProxy: any;
    public canvasMouseDragFuncProxy: any;
    public removeDrawingProxy: any;
    public reviveDrawingProxy: any;
    public updateShapeProxy: any;
    public currentDelta: Coordinate;
    public downPoint: Coordinate;
    public currPopupView: PopupView.Popup;
    public bMeasureLength = false;
    public bMeasureAngle = false;
    public currMovingObj: DrawingObject;
    private measureSelectedObject: DrawingObject[] = [];
    private startPoint: Coordinate;

    constructor(attr?: Backbone.ViewOptions<DrawingModelPkg.DrawingModel>) {
        super(attr);
        this.render();
        this.bindPanEventsOnCanvas(true);
    }
    /**
     * events bind events on html elements inside a view
     */
    public events(): Backbone.EventsHash {
        return {};
    }
    /**
     * render drawing view
     */
    public render(): DrawingView {
        // set up drawing canvas
        this.canvasSetup();

        // generate proxy functions
        this.generateProxyForFunction();

        // Create an empty project and a view for the canvas:
        this.model.setupDrawingScope();

        // //init layers
        this.model.initializeLayers();

        this.model.drawnShapes = {};

        // crete plotter view
        this.plotter = new PlotterViewPkg.PlotterView();
        // this.operationModel = new OperationModelPkg.OperationModel({});
        this.undoRedoManager = new UndoRedoManagerPkg.UndoRedoManager({});
        this.addUndoRedoEventListeners();

        return this;
    }
    /**
     * perform
     * @param options for selected tool
     */
    public perform(options: any): void {
        const type = options.type,
            mode = options.mode;

        let _undergoingOperation: OperationModelPkg.OperationModel,
            _currentRelation: RelationModelPkg.RelationModel,
            _currentDrawing: DrawingObject,
            previousOperation: OperationModelPkg.OperationModel;

        if (this.model._undergoingOperation) {
            previousOperation = $.extend(true, {}, this.model._undergoingOperation);
            this.abortUndergoingOperation();
        }
        _undergoingOperation = this.model.createOperation(options);

        if (this.checkForSameOperation(previousOperation, _undergoingOperation, type)) {
            this.abortUndergoingOperation();
            this.checkForPopupAndClose();
            this.setSelectedState();
            return;
        }
        if (_undergoingOperation.isDrawingMode()) {
            this.addCanvasListeners();

            _currentRelation = this.model._currentRelation = new RelationModelPkg.RelationModel(options);

            _currentDrawing = this.model._currentDrawing = this.model.getFactoryDataObject(options.type);
            _currentDrawing.creator = _currentRelation;

            _undergoingOperation.setDrawingObject(_currentDrawing);
            _undergoingOperation.setRelation(_currentRelation);
        }

        this.unbindAllTheEventsOnShape();
        this.removeSelectedStateForAllShape();
        switch (mode) {
            case "action":
                switch (type) {
                    case "undo":
                    case "redo":
                        this.undoRedoManager.undoRedo(options);
                        break;
                    case "clear":
                        this.clearGraph();
                        break;
                    case "move":
                    case "delete":
                        this.bindEventsOnShape(type, true);
                        this.setSelectedState(type);
                }
                break;
            case "transform":
                switch (type) {
                    case "translate":
                    case "reflect":
                    case "rotate":
                    case "dilate":
                        if (options.isPopUpShown) {
                            if (!this.currPopupView) {
                                this.currPopupView = this.initializePopupView(type);
                                this.currPopupView.on("popup-btn-clicked", this.popUpBtnClicked.bind(this, type));
                            } else {
                                this.currPopupView.updateType({ type });
                            }
                        }
                        this.unbindAllTheEventsOnShape();
                        this.bindEventsOnShape(type, true);
                        this.setSelectedState(type);
                }
                break;
            case "measure":
                switch (type) {
                    case "label":
                        this.unbindAllTheEventsOnShape();
                        this.bindEventsOnShape(type, true);
                        this.setSelectedState(type);
                        break;
                    case "angle":
                        this.bindEventsForMeasureLength("measure", false);
                        this.bindEventsForMeasureAngle("measure", true);
                        this.setSelectedState(mode);
                        break;
                    case "length":
                        this.bindEventsForMeasureAngle("measure", false);
                        this.bindEventsForMeasureLength("measure", true);
                        this.setSelectedState(mode);
                    // break;
                    // case "measurement-checkbox":
                    //     this.showHideMeasurements();
                }
                break;
            case "draw":
                this.setSelectedState(type);
        }
    }

    public unbindAllTheEventsOnShape() {
        this.bindEventsOnShape("all", false);
    }

    public setSelectedState(btnName?: string) {
        $(".tools-btn").removeClass("selected");
        if (btnName) {
            $("." + btnName + "-btn").addClass("selected");
        }
    }

    public checkForSameOperation(prevOp: OperationModelPkg.OperationModel, undergoingOp: OperationModelPkg.OperationModel, type: string) {
        return prevOp && prevOp.attributes.mode === undergoingOp.attributes.mode &&
            prevOp.attributes.type === undergoingOp.attributes.type &&
            type !== "undo" && type !== "redo" && type !== "clear";
    }

    public checkForPopupAndClose() {
        if ($(".popup-container").is(":visible")) {
            this.currPopupView.showAndHidePopUp();
        }
    }

    /**
     * bind click event on points
     * @param item drawing object
     * @param isBind bind
     */
    public bindLabelClickEvents(item: DrawingObject, isBind: boolean) {
        if (item.species === "point") {
            this.bindClickEvents(item, isBind);
        }
    }

    public mouseUpOnDocument(event: any) {
        const drawingObject = this.model._selected[0],
            currentOperation = this.model._undergoingOperation;
        if (currentOperation) {
            switch (currentOperation.type) {
                case "label":
                    if ($(".editable-label:visible").length && !event.target.classList.contains("input-editable-label")) {
                        this.removeSelectedStateForPreviousShape();
                        this.updateLabelWithEditableText(drawingObject);
                        this.bindMouseDownOnDocument(false);
                    }
            }
        }
    }

    public bindEnterKeyOnInputLabel(isBind: boolean) {
        if (isBind) {
            $(".editable-label").on("keydown.document", this.enterKeyOnEditableLabel.bind(this));
        } else {
            $(".editable-label").off("keydown.document");
        }
    }

    public enterKeyOnEditableLabel(event: KeyboardEvent) {
        const drawingObject = this.model._selected[0];
        if (this.model._selected.length && event.keyCode === 13) {
            this.removeSelectedStateForPreviousShape();
            this.updateLabelWithEditableText(drawingObject);
        }
    }

    public popUpBtnClicked(type: string, data: any) {
        if (data.btnType === "ok") {
            this.transformShape(data);
        } else if (data.btnType === "cancel") {
            this.removeSelectedStateForPreviousShape();
        }
        this.removeSelectedStateForAllShape();
        this.unbindAllTheEventsOnShape();
        this.setSelectedState();
    }

    public createTransformedObject(drawingObject: DrawingObject, data: any) {
        let _undergoingOperation: OperationModelPkg.OperationModel, _currentDrawing: DrawingObject,
            pointData: DrawingObject, looper: number,
            segmentData: DrawingObject,
            totalKeySegments: number;

        _undergoingOperation = this.model._undergoingOperation;
        _currentDrawing = this.model._currentDrawing;

        for (looper = 0; looper < drawingObject.keyPoints.length; looper++) {
            pointData = this.model.getFactoryDataObject("point");
            pointData.mode = _undergoingOperation.mode;
            pointData.type = _undergoingOperation.type;
            pointData.species = drawingObject.keyPoints[looper].species;
            pointData.slave = drawingObject.keyPoints[looper].slave;
            pointData.drawingComplete = drawingObject.keyPoints[looper].drawingComplete;
            pointData.mouseGridPosition = drawingObject.keyPoints[looper].mouseGridPosition;
            pointData.position = drawingObject.keyPoints[looper].position;
            pointData.labelText = drawingObject.keyPoints[looper].labelText + "'";
            _currentDrawing.keyPoints.push(this.updateDrawingObject(pointData, data));
        }

        totalKeySegments = drawingObject.keySegments.length;
        for (looper = 0; looper < totalKeySegments; looper++) {
            segmentData = this.model.getFactoryDataObject("segment");
            segmentData.mode = _undergoingOperation.mode;
            segmentData.type = _undergoingOperation.type;
            segmentData.species = drawingObject.keySegments[looper].species;
            segmentData.slave = drawingObject.keySegments[looper].slave;
            segmentData.drawingComplete = drawingObject.keySegments[looper].drawingComplete;
            segmentData.mouseGridPosition = drawingObject.keySegments[looper].mouseGridPosition;
            segmentData.position = drawingObject.keySegments[looper].position;
            segmentData.keyPoints.push(_currentDrawing.keyPoints[looper], _currentDrawing.keyPoints[(looper + 1) % totalKeySegments]);
            _currentDrawing.keySegments.push(this.updateDrawingObject(segmentData, data));
            this.model.addSourceOffspring(segmentData);
            this.model.addOffspringSource(segmentData);
        }
    }

    public transformShape(data: any, isDragging?: boolean): DrawingObject {
        console.log("***************** transform******************");
        let drawingObject: DrawingObject, _currentDrawing: DrawingObject,
            bounds;

        drawingObject = this.model.selectedShapeForTransformation ||
            this.model._selected[0].paperShapeCollection.paperHitArea.data.parentDrawingObject;
        bounds = drawingObject.paperShapeCollection.paperShape.bounds;

        this.model._currentRelation.addSources(drawingObject);

        _currentDrawing = this.model._currentDrawing;
        _currentDrawing.species = drawingObject.species;

        data.mouseGridPosition = data.position =
            new Point(MathUtilityPkg.Utility.canvasToGridCoordinate(new Point(bounds.centerX, bounds.centerY)));

        if (drawingObject.species === "point") {
            _currentDrawing.mouseGridPosition = _currentDrawing.position = drawingObject.mouseGridPosition;
            _currentDrawing.labelText = drawingObject.labelText + "'";
        } else {
            this.createTransformedObject(drawingObject, data);
        }

        if (!isDragging) {
            _currentDrawing.drawingComplete = true;
        }

        this.model.addSourceOffspring(_currentDrawing);
        this.model.addOffspringSource(_currentDrawing);
        this.model.addDrawingRelation(_currentDrawing);
        this.updateDrawingObject(_currentDrawing, data);
        if (_currentDrawing.species === "polygon" && _currentDrawing.paperShapeCollection) {
            this.closePolygonPath(_currentDrawing.paperShapeCollection);
        }
        return _currentDrawing;
    }

    public initializePopupView(type: string): PopupView.Popup {
        const popupModel = new PopupModel.Popup({ popUpData: this.model.attributes.popUpData });
        const popupView = new PopupView.Popup({
            el: this.$el.closest(".geometry-tool-playground").find("#transform-dialogs"),
            model: popupModel
        }, { type });
        return popupView;
    }

    public redrawShape() {
        let drawnShapes: any, looper: string;

        // if (this.model._undergoingOperation) {
        //     this.abortUndergoingOperation();
        // }

        this.model.activateScopeAndLayer();

        drawnShapes = this.model.drawnShapes;
        for (looper in drawnShapes) {
            if (drawnShapes[looper]) {
                this.updateShape(drawnShapes[looper] as DrawingObject);
            }
        }
    }

    public showHideMeasurements() {
        const visibilityFlag = PanelView.Panel.isShowMeasurements;
        let looper: string, drawnShapes: any, item: DrawingObject;

        drawnShapes = this.model.drawnShapes;

        for (looper in drawnShapes) {
            if (drawnShapes[looper] && drawnShapes[looper].mode === "measure") {
                item = drawnShapes[looper];
                item.visible = visibilityFlag;
                this.plotter._setVisibility(item.paperShapeCollection, item.species, visibilityFlag);
            }
        }

        this.refreshGraph();

    }

    public bindEventsForMeasureLength(type: string, isBind: boolean) {
        this.bMeasureLength = isBind;
        let item: DrawingObject, drawnShapes: any, looper: string,
            ctr: number, totalSegments: number;

        drawnShapes = this.model.drawnShapes;
        this.removeSelectedStateForAllShape();

        for (looper in drawnShapes) {
            if (drawnShapes[looper]) {
                item = drawnShapes[looper] as DrawingObject;
                totalSegments = item.keySegments.length;
                for (ctr = 0; ctr < totalSegments; ctr++) {
                    this.bindMouseEvents(item.keySegments[ctr], type, isBind);
                }
                if (item.type === "segment") {
                    this.bindMouseEvents(item, type, isBind);
                }
            }
        }
    }

    public bindEventsForMeasureAngle(type: string, isBind: boolean) {
        this.bMeasureAngle = isBind;
        let item: DrawingObject, drawnShapes: any, looper: string,
            ctr: number, totalPoints: number;

        drawnShapes = this.model.drawnShapes;
        this.removeSelectedStateForAllShape();
        for (looper in drawnShapes) {
            if (drawnShapes[looper]) {
                item = drawnShapes[looper] as DrawingObject;

                totalPoints = item.keyPoints.length;
                for (ctr = 0; ctr < totalPoints; ctr++) {
                    this.bindMouseEvents(item.keyPoints[ctr], type, isBind);
                }
                if (item.type === "point") {
                    this.bindMouseEvents(item, type, isBind);
                }
            }
        }
    }
    public measureDrawingObjectClicked(drawingObject: DrawingObject) {
        let _currentDrawing: DrawingObject, _currentRelation: RelationModelPkg.RelationModel,
            totalPoints: number, looper: number;

        _currentRelation = this.model._currentRelation;
        _currentDrawing = this.model._currentDrawing;

        switch (_currentDrawing.species) {
            case "angle":
                if (drawingObject.species === "point" && _currentDrawing.keyPoints.indexOf(drawingObject) === -1) {
                    _currentRelation.addSources(drawingObject);
                    _currentDrawing.keyPoints.push(drawingObject);
                }
                break;
            case "length":
                if (drawingObject.species === "segment" && drawingObject.offspring.length === 0) {
                    totalPoints = drawingObject.keyPoints.length;
                    for (looper = 0; looper < totalPoints; looper++) {
                        _currentRelation.addSources(drawingObject.keyPoints[looper]);
                        _currentDrawing.keyPoints.push(drawingObject.keyPoints[looper]);
                    }
                }
        }

        if (_currentRelation.isMature(_currentDrawing)) {
            if (this.doesMeasurementAlreadyExists(_currentDrawing)) {
                this.abortUndergoingOperation();
            } else {
                _currentDrawing.drawingComplete = true;
                _currentRelation.addOffspring(_currentDrawing);
                this.model.addSourceOffspring(_currentDrawing);
                this.model.addOffspringSource(_currentDrawing);
                this.model.addDrawingRelation(_currentDrawing);
                this.updateDrawingObject(_currentDrawing);
            }
            this.unbindAllTheEventsOnShape();
        }

        // if (drawingObject.selected) {
        //     this.measureSelectedObject.push(drawingObject);
        // } else {
        //     const index = this.measureSelectedObject.indexOf(drawingObject);
        //     this.measureSelectedObject.splice(index, 1);
        // }
        // if (this.bMeasureLength) {
        //     if (this.measureSelectedObject.length === 1) {
        //         const lengthLabel = this.plotter.drawMeasureLabel(this.measureSelectedObject[0]);
        //         this.model.measureLabels.push(lengthLabel);
        //         this.resetMeasureDataState();
        //     }
        // } else if (this.bMeasureAngle) {
        //     if (this.measureSelectedObject.length === 3) {
        //         const angleLabel = this.plotter.drawAngleArcOnGraph(this.measureSelectedObject);
        //         this.model.measureLabels.push(angleLabel.paperShape);
        //         this.resetMeasureDataState();
        //     }
        // }
    }
    public resetMeasureDataState() {
        this.measureSelectedObject = [];
        this.removeSelectedStateForAllShape();
    }

    public canvasSetup(isResize?: boolean) {
        let $canvas: JQuery<HTMLElement>;

        $canvas = this.$(".drawing-graph");

        $canvas.width(GridGraphModelPkg.GridGraph.canvasSize.width)
            .height(GridGraphModelPkg.GridGraph.canvasSize.height);

        if (isResize) {
            this.model._drawingScope.view.viewSize.width = GridGraphModelPkg.GridGraph.canvasSize.width;
            this.model._drawingScope.view.viewSize.height = GridGraphModelPkg.GridGraph.canvasSize.height;
        }

        this.model.canvas = $canvas[0];
    }
    /**
     * doesMeasurementAlreadyExists
     * @param _currentDrawing current drawing object
     */
    private doesMeasurementAlreadyExists(_currentDrawing: DrawingObject): boolean {
        let drawnShapes: any, looper: string, species: string, doesNotExists: boolean,
            totalSources: number, ctr: number, item: DrawingObject, creator: RelationModelPkg.RelationModel;

        drawnShapes = this.model.drawnShapes;
        species = _currentDrawing.species;
        doesNotExists = true;

        for (looper in drawnShapes) {
            if (drawnShapes[looper] && drawnShapes[looper].species === species) {
                item = drawnShapes[looper];
                creator = item.creator;
                totalSources = creator.sources.length;
                for (ctr = 0; ctr < totalSources; ctr++) {
                    if (creator.sources[ctr] !== _currentDrawing.keyPoints[ctr] &&
                        creator.sources[totalSources - ctr - 1] !== _currentDrawing.keyPoints[ctr]) {
                        break;
                    }
                }
                if (ctr === totalSources) {
                    doesNotExists = false;
                }
            }
        }

        return !doesNotExists;
    }

    private updateTransformPosition(drawingObject: DrawingObject, data: any) {
        let calX, calY;

        switch (data.type) {
            case "translate":
                calX = drawingObject.position.x + data.x;
                calY = drawingObject.position.y + data.y;
                break;
            case "reflect":
                calX = data.isXAxis ? drawingObject.position.x : -(drawingObject.position.x);
                calY = data.isXAxis ? -(drawingObject.position.y) : drawingObject.position.y;
                break;
            case "dilate":
                calY = data.mouseGridPosition.y;
                calX = data.mouseGridPosition.x;

                calX += data.multiplierK * (drawingObject.position.x - calX);
                calY += data.multiplierK * (drawingObject.position.y - calY);
                break;
            case "rotate":
                let calAngle = data.isClockwise ? data.angle * Math.PI / 180 : -(data.angle) * Math.PI / 180,
                    relX1, relY1, calX1, calY1;

                calAngle = Number(calAngle.toFixed(2));

                calY = data.mouseGridPosition.y;
                calX = data.mouseGridPosition.x;

                relX1 = drawingObject.mouseGridPosition.x - calX;
                relY1 = drawingObject.mouseGridPosition.y - calY;

                calX1 = relY1 * Math.sin(calAngle) +
                    relX1 * Math.cos(calAngle);
                calY1 = relY1 * Math.cos(calAngle) -
                    relX1 * Math.sin(calAngle);

                calX += calX1;
                calY += calY1;
        }

        drawingObject.mouseGridPosition = drawingObject.position = new Point(calX, calY);
        // drawingObject.labelText = drawingObject.labelText + "'";

    }

    private bindPanEventsOnCanvas(isBind: boolean) {
        this.model.tool.onMouseDrag = isBind ? this.handlePanMove.bind(this) : undefined;
    }

    private handlePanMove(event: MouseEvent) {
        if ((!this.model._undergoingOperation || this.model._undergoingOperation && this.model._undergoingOperation.mode !== "draw")
            && !this.currentDelta) {
            this.trigger("mouse-drag-on-tool", event);
            this.redrawShape();
        }
    }

    /**
     * bindEventsOnShape bind events(mouseenter,mouseleave,mouseup and mousedown) on shapes(point,segment,line,polygon)
     */
    private bindEventsOnShape(type: string, isBind: boolean): any {
        let item: DrawingObject, drawnShapes: any, looper: string,
            ctr: number, totalPoints: number, totalSegments: number;

        drawnShapes = this.model.drawnShapes;
        for (looper in drawnShapes) {
            if (drawnShapes[looper]) {
                item = drawnShapes[looper] as DrawingObject;
                totalPoints = item.keyPoints.length;
                for (ctr = 0; ctr < totalPoints; ctr++) {
                    this.bindMouseEvents(item.keyPoints[ctr], type, isBind);
                }

                totalSegments = item.keySegments.length;
                for (ctr = 0; ctr < totalSegments; ctr++) {
                    this.bindMouseEvents(item.keySegments[ctr], type, isBind);
                }
                this.bindMouseEvents(item, type, isBind);
            }
        }
    }
    /**
     * bindMouseEvents
     * @param item drawing object
     * @param type drawing type
     * @param isBind bind or unbind based on the value
     */
    private bindMouseEvents(item: DrawingObject, type: string, isBind: boolean) {
        switch (type) {
            case "move":
                this.bindDragEvents(item, isBind);
                break;
            case "delete":
                this.bindClickEvents(item, isBind);
                break;
            case "measure":
                this.bindMeasureEvents(item, isBind);
                break;
            case "translate":
            case "reflect":
            case "rotate":
            case "dilate":
                if (this.currPopupView) {
                    this.bindClickEvents(item, isBind);
                } else {
                    this.bindDragEvents(item, isBind);
                }
                break;
            case "label":
                this.bindLabelClickEvents(item, isBind);
                this.bindEnterKeyOnInputLabel(isBind);
                break;
            case "all":
                this.bindDragEvents(item, isBind);
                this.bindClickEvents(item, isBind);
        }
    }

    private bindDragEvents(item: DrawingObject, isBind: boolean) {
        if (!item.paperShapeCollection || !item.paperShapeCollection.paperHitArea) {
            return;
        }
        item.paperShapeCollection.paperHitArea.onMouseEnter = isBind ? this.mouseEnterOnShape.bind(this) : "";
        item.paperShapeCollection.paperHitArea.onMouseLeave = isBind ? this.mouseLeaveOnShape.bind(this) : "";
        item.paperShapeCollection.paperHitArea.onMouseDown = isBind ? this.mouseDownOnShape.bind(this) : "";
        item.paperShapeCollection.paperHitArea.onMouseDrag = isBind ? this.mouseDragOnShape.bind(this) : "";
        item.paperShapeCollection.paperHitArea.onMouseUp = isBind ? this.mouseUpOnShape.bind(this) : "";
    }
    private bindClickEvents(item: DrawingObject, isBind: boolean) {
        if (!item.paperShapeCollection || !item.paperShapeCollection.paperHitArea) {
            return;
        }
        item.paperShapeCollection.paperHitArea.onMouseEnter = isBind ? this.mouseEnterOnShape.bind(this) : "";
        item.paperShapeCollection.paperHitArea.onMouseLeave = isBind ? this.mouseLeaveOnShape.bind(this) : "";
        item.paperShapeCollection.paperHitArea.onClick = isBind ? this.mouseClickOnShape.bind(this) : "";
    }

    private bindMeasureEvents(item: DrawingObject, isBind: boolean) {
        this.bindClickEvents(item, isBind);
    }

    /**
     * mouseClickOnShape handle mouse enter on any shape
     * @param event event object
     */
    private mouseClickOnShape(event: any): any {
        let drawingObject: DrawingObject;

        drawingObject = event.target.data.drawingObject;
        switch (this.model._undergoingOperation.type) {
            case "delete":
                this.bindMouseEvents(drawingObject, "delete", false);
                this.deleteDrawing(drawingObject);
                break;
            case "translate":
            case "reflect":
            case "rotate":
            case "dilate":
                this.setSelectedStateForShape(drawingObject, true);
                this.currPopupView.showErrorMsg(false);
                this.currPopupView.showAndHidePopUp();
                break;
            case "angle":
                this.setSelectedStateForMeasure(drawingObject, true);
                this.measureDrawingObjectClicked(drawingObject);
                break;
            case "length":
                this.setSelectedStateForMeasure(drawingObject, true);
                this.measureDrawingObjectClicked(drawingObject);
                break;
            case "label":
                this.setSelectedStateForShape(drawingObject, true);
                this.showEditableLabel(drawingObject);
                this.bindMouseDownOnDocument(true);
        }
    }

    private showEditableLabel(drawingObject: DrawingObject) {
        const editableLabel = $(".editable-label"),
            inputBox = editableLabel.find("input").get(0) as HTMLInputElement,
            labelPosition = MathUtilityPkg.Utility.gridToCanvasCoordinate(drawingObject.position),
            labelText = drawingObject.labelText;
        editableLabel.removeClass("hide-editable-label");
        $(".editable-label").css({ top: labelPosition.y + 30, left: labelPosition.x - 18 });
        inputBox.value = labelText;
        inputBox.focus();
        inputBox.select();
    }

    private updateLabelWithEditableText(drawingObject: DrawingObject) {
        const editableLabel = $(".editable-label"),
            labelText = (editableLabel.find("input").get(0) as HTMLInputElement).value;
        if (drawingObject.labelText !== labelText) {
            drawingObject.labelText = labelText;
            drawingObject.paperShapeCollection.paperLabel.content = labelText;
            this.updateShape(drawingObject);
        }
        editableLabel.addClass("hide-editable-label");
    }

    private setSelectedStateForShape(drawingObject: DrawingObject, isAdd: boolean) {
        const stylesType = DrawingModelPkg.DrawingModel.getStylesForShape(drawingObject.species);
        this.plotter.changeShapeColor(drawingObject, stylesType.selected.strokeColor,
            stylesType.selected.fillColor);

        if (!drawingObject.selected) {
            drawingObject.selected = true;
            this.removeSelectedStateForPreviousShape();
            if (isAdd) {
                this.model._selected.push(drawingObject);
            }
        }
        drawingObject.paperShapeCollection.paperHitArea.onMouseEnter = "";
        drawingObject.paperShapeCollection.paperHitArea.onMouseLeave = "";
    }

    private setSelectedStateForMeasure(drawingObject: DrawingObject, isAdd: boolean) {
        const stylesType = DrawingModelPkg.DrawingModel.getStylesForShape(drawingObject.species);
        this.plotter.changeShapeColor(drawingObject, stylesType.selected.strokeColor,
            stylesType.selected.fillColor);

        if (!drawingObject.selected) {
            drawingObject.selected = true;
            if (isAdd) {
                this.model._selected.push(drawingObject);
            } else {
                this.removeSelectedStateForPreviousShape();
            }
        } else {
            this.removeSelectedShapeForSelectedShape(drawingObject);
        }
        drawingObject.paperShapeCollection.paperHitArea.onMouseEnter = "";
        drawingObject.paperShapeCollection.paperHitArea.onMouseLeave = "";
    }

    private removeSelectedStateForPreviousShape() {
        if (this.model._selected && this.model._selected.length > 0) {
            const previousDrawingObject = this.model._selected[0],
                stylesType = DrawingModelPkg.DrawingModel.getStylesForShape(previousDrawingObject.species);

            previousDrawingObject.selected = false;
            this.plotter.changeShapeColor(previousDrawingObject, stylesType.drawing.strokeColor,
                stylesType.drawing.fillColor);
            this.model._selected.splice(0, 1);
        }
    }
    private removeSelectedShapeForSelectedShape(shape: DrawingObject) {
        const index = this.model._selected.indexOf(shape),
            stylesType = DrawingModelPkg.DrawingModel.getStylesForShape(shape.species);
        shape.selected = false;
        this.plotter.changeShapeColor(shape, stylesType.drawing.strokeColor,
            stylesType.drawing.fillColor);
        this.model._selected.splice(0, 1);
    }

    private removeSelectedStateForAllShape() {
        if (this.model._selected.length > 0) {
            for (const shape of this.model._selected) {
                this.removeSelectedShapeForSelectedShape(shape);
            }
        }
    }
    /**
     * mouseEnterOnShape handle mouse enter on any shape
     * @param event event object
     */
    private mouseEnterOnShape(event: any): any {
        let drawingObject: DrawingObject, stylesType: StylesType;

        drawingObject = event.target.data.drawingObject;
        console.log("mouse enter" + drawingObject.species);
        stylesType = DrawingModelPkg.DrawingModel.getStylesForShape(drawingObject.species);

        this.plotter.changeShapeColor(drawingObject, stylesType.hovered.strokeColor,
            stylesType.hovered.fillColor);
    }
    /**
     * mouseLeaveOnShape handle mouse leave on any shape
     * @param event event object
     */
    private mouseLeaveOnShape(event: any): any {
        let drawingObject: DrawingObject, stylesType: StylesType;

        drawingObject = event.target.data.drawingObject;
        console.log("mouse LEAVE" + drawingObject.species);
        stylesType = DrawingModelPkg.DrawingModel.getStylesForShape(drawingObject.species);
        if (drawingObject.selected) {
            this.plotter.changeShapeColor(drawingObject, stylesType.selected.strokeColor,
                stylesType.selected.fillColor);
        } else {
            this.plotter.changeShapeColor(drawingObject, stylesType.drawing.strokeColor,
                stylesType.drawing.fillColor);
        }
    }
    /**
     * mouseDownOnShape handle mouse down on any shape
     * @param event event object
     */
    private mouseDownOnShape(event: any) {
        let drawingObject: DrawingObject, _undergoingOperation: OperationModelPkg.OperationModel,
            canvasPoint: Point, gridPoint: Point, _dilateHandle: DrawingObject;

        _undergoingOperation = this.model._undergoingOperation;
        _dilateHandle = this.model._dilateHandle;

        if (event.which === 1 || event.event && event.event.which === 1 || event.event.type === "touchstart") {
            canvasPoint = this.getMousePositionOnCanvas(event.event);
            gridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint);
            this.downPoint = {
                x: gridPoint.x,
                y: gridPoint.y
            };
            console.log(this.downPoint);

            drawingObject = event.target.data.drawingObject;

            this.startPoint = this.getShapePointPosition(drawingObject);
            console.log("startPoint", this.startPoint);

            this.setSelectedStateForShape(drawingObject, false);

            if (_undergoingOperation.mode === "transform" && _undergoingOperation.type === "dilate" && !this.currPopupView) {
                drawingObject = event.target.data.parentDrawingObject;
                if (drawingObject !== this.model.selectedShapeForTransformation && _dilateHandle &&
                    _dilateHandle.keyPoints.indexOf(drawingObject) === -1) {
                    this.model.selectedShapeForTransformation = null;
                    this.removeDrawing(_dilateHandle);
                    this.model._dilateHandle = null;
                }
                if (!this.model._dilateHandle) {
                    this.model._dilateHandle = this.createDilateHandle(drawingObject);
                    this.model.selectedShapeForTransformation = drawingObject;
                }
            }
        }
    }
    private createDilateHandle(drawingObject: DrawingObject): DrawingObject {
        let bounds: any, centerCanvasPoint: Point, centerGridPoint: Point,
            handleGridPoint: Point, handleInvisiblePoint: DrawingObject, handleVisiblePoint: DrawingObject,
            handleSegment: DrawingObject;

        bounds = drawingObject.paperShapeCollection.paperShape.bounds;

        centerCanvasPoint = new Point(bounds.centerX, bounds.centerY);
        centerGridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(centerCanvasPoint);

        handleGridPoint = new Point(centerGridPoint.x + 2, centerGridPoint.y);
        // handleCanvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(centerCanvasPoint);

        handleInvisiblePoint = this.model.getFactoryDataObject("point");
        handleInvisiblePoint.slave = true;
        handleInvisiblePoint.mouseGridPosition = centerGridPoint;
        handleInvisiblePoint.position = centerGridPoint;

        handleVisiblePoint = this.model.getFactoryDataObject("point");
        handleInvisiblePoint.slave = true;
        handleVisiblePoint.mouseGridPosition = handleGridPoint;
        handleVisiblePoint.position = handleGridPoint;
        handleVisiblePoint = this.updateDrawingObject(handleVisiblePoint);

        handleSegment = this.model.getFactoryDataObject("segment");
        handleSegment.keyPoints.push(handleInvisiblePoint, handleVisiblePoint);
        this.updateDrawingObject(handleSegment);
        this.model.addSourceOffspring(handleSegment);
        this.model.addOffspringSource(handleSegment);

        this.saveDrawingObjectInItem(handleVisiblePoint, handleVisiblePoint);
        this.bindMouseEvents(handleVisiblePoint, "move", true);
        this.updateShapesOrder(handleSegment);

        return handleSegment;
    }
    /**
     * mouseDragOnShape handle mouse drag on any shape
     * @param event event object
     */
    private mouseDragOnShape(event: any) {
        let drawingObject: DrawingObject, data: any, _currentDrawing: DrawingObject, _dilateHandle: DrawingObject,
            _dilateHandleDistance: number, scalingFactor: number, delta: any, isSelected: boolean,
            canvasPoint: Point, gridPoint: Point,
            _undergoingOperation: OperationModelPkg.OperationModel;

        _undergoingOperation = this.model._undergoingOperation;
        _currentDrawing = this.model._currentDrawing;
        drawingObject = event.target.data.drawingObject;
        isSelected = drawingObject.selected;

        if (isSelected) {
            if (!drawingObject.isDragging) {
                this.currentDelta = {
                    x: event.event.pageX - event.delta.x,
                    y: event.event.pageY - event.delta.y
                };
            }
            console.log("id " + drawingObject.id);
            drawingObject.isDragging = true;

            if (_undergoingOperation.mode === "transform") {
                switch (_undergoingOperation.type) {
                    case "translate":
                        drawingObject = event.target.data.parentDrawingObject;
                        canvasPoint = this.getMousePositionOnCanvas(event.event);
                        gridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint);
                        delta = {
                            x: gridPoint.x - this.downPoint.x,
                            y: gridPoint.y - this.downPoint.y
                        };
                        data = {
                            type: "translate",
                            x: delta.x,
                            y: delta.y
                        };

                        if (!_currentDrawing.paperShapeCollection) {
                            this.model.selectedShapeForTransformation = drawingObject;
                            _currentDrawing = this.transformShape(data, true);
                            this.removeSelectedShapeForSelectedShape(drawingObject);
                            drawingObject.selected = true;
                            isSelected = true;
                        } else {
                            this.updateTransformedShape(_currentDrawing, data);
                        }
                        break;
                    case "dilate":
                        _dilateHandle = this.model._dilateHandle;

                        if (_dilateHandle.keyPoints.indexOf(drawingObject) === -1) {
                            return;
                        }

                        delta = {
                            x: event.delta.x,
                            y: 0
                        };
                        this.updateShape(drawingObject, delta);

                        _dilateHandleDistance = MathUtilityPkg.Utility.distanceWithPaper(_dilateHandle.keyPoints[0].position,
                            _dilateHandle.keyPoints[1].position);
                        scalingFactor = _dilateHandleDistance / 2;

                        data = {
                            mouseGridPosition: _dilateHandle.keyPoints[0].mouseGridPosition,
                            multiplierK: scalingFactor,
                            position: _dilateHandle.keyPoints[0].position,
                            type: "dilate"
                        };

                        if (!_currentDrawing.paperShapeCollection && _dilateHandle && _dilateHandle.keyPoints.indexOf(drawingObject) > -1) {
                            _currentDrawing = this.transformShape(data, true);
                        } else {
                            this.updateTransformedShape(_currentDrawing, data);
                        }
                }
            } else {
                this.updateShape(drawingObject, event.delta, drawingObject.species === "point");
            }

            // if (this.currMovingObj || _undergoingOperation.mode === "transform" && _undergoingOperation.type === "translate") {
            //     if (!this.currMovingObj) {
            //         data = {
            //             drawingObject,
            //             type: "translate",
            //             x: 0,
            //             y: 0
            //         };
            //         this.currMovingObj = this.transformShape(data, true);
            //         this.removeSelectedShapeForSelectedShape(drawingObject);
            //         drawingObject.selected = true;
            //         isSelected = true;
            //     }
            //     currentDrawingObj = this.currMovingObj;
            //     // newDrawingObject.paperShapeCollection.paperHitArea.fire("mousedrag", event);
            // } else {
            //     currentDrawingObj = drawingObject;
            // }
            // if (isSelected) {
            //     // call update shape function
            //     this.updateShape(_currentDrawing || drawingObject, event.delta);
            // }

            console.log("mouse drag");
        }
    }
    private getShapePointPosition(drawingObject: DrawingObject): Coordinate {
        let canvasPoint: Point;

        if (drawingObject.species === "point") {
            canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(drawingObject.position);
        }
        if (drawingObject.keyPoints.length > 0) {
            canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(drawingObject.keyPoints[0].position);
        }

        return {
            x: canvasPoint.x,
            y: canvasPoint.y
        };
    }

    private updateTransformedShape(drawingObject: DrawingObject, data?: any) {
        let totalPoints: number, totalSegments: number, looper: number, selectedShapeForTransformation: DrawingObject;

        selectedShapeForTransformation = this.model.selectedShapeForTransformation;

        totalPoints = drawingObject.keyPoints.length;
        for (looper = 0; looper < totalPoints; looper++) {
            drawingObject.keyPoints[looper].mouseGridPosition = selectedShapeForTransformation.keyPoints[looper].mouseGridPosition;
            drawingObject.keyPoints[looper].position = selectedShapeForTransformation.keyPoints[looper].position;
            this.updateDrawingObject(drawingObject.keyPoints[looper], data);
        }

        totalSegments = drawingObject.keySegments.length;
        for (looper = 0; looper < totalSegments; looper++) {
            drawingObject.keySegments[looper].mouseGridPosition = selectedShapeForTransformation.keySegments[looper].mouseGridPosition;
            drawingObject.keySegments[looper].position = selectedShapeForTransformation.keySegments[looper].position;
            this.updateDrawingObject(drawingObject.keySegments[looper], data);
        }

        if (selectedShapeForTransformation.species === "point") {
            drawingObject.mouseGridPosition = selectedShapeForTransformation.mouseGridPosition;
            drawingObject.position = selectedShapeForTransformation.position;
        }
        this.updateDrawingObject(drawingObject, data);
    }
    /**
     * bindMouseDownOnDocument
     * @param isBind bind mouse up on document
     * @param drawingObject to pass on mouse up on document
     */
    private bindMouseDownOnDocument(isBind: boolean) {
        if (isBind) {
            document.addEventListener("mousedown", this.mouseUpOnDocument.bind(this));
        } else {
            document.removeEventListener("mousedown", this.mouseUpOnDocument.bind(this));
        }
    }

    /**
     * mouseUpOnShape handle mouse up on any shape
     * @param event event object
     */
    private mouseUpOnShape(event: any): any {
        let actionData: ActionData, isSelected: boolean, _undergoingOperation: OperationModelPkg.OperationModel,
            drawingObject: DrawingObject, _dilateHandle: DrawingObject, _currentDrawing: DrawingObject,
            endPoint: Coordinate, calDelta;

        drawingObject = event.target.data.drawingObject;
        _undergoingOperation = this.model._undergoingOperation;
        _dilateHandle = this.model._dilateHandle;
        _currentDrawing = this.model._currentDrawing;

        if (event.event.which === 1 || event.event.type === "touchend") {
            if (_undergoingOperation.mode === "transform" && _undergoingOperation.type === "dilate" && _dilateHandle &&
                _dilateHandle.keyPoints.indexOf(drawingObject) > -1 && drawingObject.isDragging) {
                drawingObject.isDragging = false;
                drawingObject.selected = false;
                // this.removeDrawing(_dilateHandle);
                // _dilateHandle = null;
                _currentDrawing.drawingComplete = true;
                this.updateDrawingObject(_currentDrawing);
                // this.setSelectedStateForShape(_currentDrawing, true);
            } else if (_undergoingOperation.mode === "transform" && _undergoingOperation.type === "translate"
                && _currentDrawing && _currentDrawing.paperShapeCollection) {
                _currentDrawing.drawingComplete = true;
                this.updateDrawingObject(_currentDrawing);
                // this.setSelectedStateForShape(_currentDrawing, true);
                drawingObject.isDragging = false;
                drawingObject.selected = false;
            } else {
                isSelected = drawingObject.selected && this.model._selected.indexOf(drawingObject) == -1;

                if (isSelected) {
                    this.model._selected.push(drawingObject);
                }
                if (drawingObject.isDragging) {
                    drawingObject.isDragging = false;
                    endPoint = this.getShapePointPosition(drawingObject);
                    console.log("startPoint", this.startPoint);
                    console.log("endPoint", endPoint);
                    calDelta = {
                        x: endPoint.x - this.startPoint.x,
                        y: endPoint.y - this.startPoint.y
                    };
                    this.startPoint = null;
                    this.updatePointPosition(drawingObject);
                    // if (!event.delta) {
                    //     calDelta = {
                    //         x: event.pageX - this.currentDelta.x,
                    //         y: event.pageY - this.currentDelta.y
                    //     };
                    // }

                    this.currentDelta = null;
                    drawingObject.eventDelta = calDelta || event.delta;
                    actionData = {
                        data: drawingObject,
                        delta: calDelta || event.delta as PointDelta
                    };
                    this.undoRedoManager._registerAction(this.model._undergoingOperation, actionData);
                    // this.bindMouseDownOnDocument(false, drawingObject);
                    this.updateShapesOrder(drawingObject);
                } else if (!isSelected) {
                    drawingObject.selected = false;
                    this.model._selected = [];
                }

                drawingObject.paperShapeCollection.paperHitArea.onMouseEnter = this.mouseEnterOnShape.bind(this);
                drawingObject.paperShapeCollection.paperHitArea.onMouseLeave = this.mouseLeaveOnShape.bind(this);
                console.log("mouse up");
            }
        }
    }
    private updatePointPosition(drawingObject: DrawingObject): any {
        let totalKeyPoints: number, looper: number;
        if (drawingObject.species === "point") {
            drawingObject.mouseGridPosition = drawingObject.position;
        }
        totalKeyPoints = drawingObject.keyPoints.length;
        if (totalKeyPoints > 0) {
            for (looper = 0; looper < totalKeyPoints; looper++) {
                drawingObject.keyPoints[looper].mouseGridPosition = drawingObject.keyPoints[looper].position;
            }
        }
    }
    /**
     * generateProxyForFunction generate canvas mouse move and mouse down proxy func
     */
    private generateProxyForFunction(): any {
        this.canvasMouseMoveFuncProxy = $.proxy(this.canvasMouseMoveFunc, this);
        this.canvasMouseDownFuncProxy = $.proxy(this.canvasMouseDownFunc, this);
        this.removeDrawingProxy = $.proxy(this.removeDrawing, this);
        this.reviveDrawingProxy = $.proxy(this.reviveDrawing, this);
        this.updateShapeProxy = $.proxy(this.updateShape, this);
    }
    /**
     * abortUndergoingOperation
     */
    private abortUndergoingOperation() {
        let _currentDrawing: DrawingObject, _dilateHandle: DrawingObject,
            _unsettledPoint: DrawingObject, _unsettledSegment: DrawingObject;

        if (this.model._undergoingOperation.isDrawingMode()) {
            this.removeCanvasListeners();
        }

        _currentDrawing = this.model._currentDrawing;
        if (_currentDrawing && !_currentDrawing.drawingComplete) {
            this.removeDrawing(_currentDrawing);
        }
        this.model._currentDrawing = null;

        _unsettledPoint = this.model._unsettledPoint;
        if (_unsettledPoint) {
            this.removeDrawing(_unsettledPoint);
        }
        this.model._unsettledPoint = null;

        _unsettledSegment = this.model._unsettledSegment;
        if (_unsettledSegment) {
            this.removeDrawing(_unsettledSegment);
        }
        this.model._unsettledSegment = null;

        _dilateHandle = this.model._dilateHandle;
        if (_dilateHandle) {
            this.removeDrawing(_dilateHandle);
        }
        this.model._dilateHandle = null;

        this.model._currentRelation = null;
        this.model._undergoingOperation.abortOperation();
        this.model._undergoingOperation = null;
        this.setSelectedState();
        this.unbindAllTheEventsOnShape();
    }
    /**
     * removeDrawing removes drawing object
     * @param drawingObject to remove
     */
    private removeDrawing(drawingObject: DrawingObject): any {
        let index: number, item: DrawingObject, looper: number,
            totalKeyPoints: number, totalKeySegments: number, totalOffsprings: number;

        if (drawingObject.incinerated) {
            return;
        }

        index = drawingObject.id;

        if (drawingObject.paperShapeCollection) {
            this.plotter.removeDrawing(drawingObject);
        }
        drawingObject.incinerated = true;

        if (drawingObject.mode !== "measure") {
            totalKeySegments = drawingObject.keySegments.length;
            for (looper = 0; looper < totalKeySegments; looper++) {
                item = drawingObject.keySegments[looper];
                this.removeDrawing(item);
            }

            totalKeyPoints = drawingObject.keyPoints.length;
            for (looper = 0; looper < totalKeyPoints; looper++) {
                item = drawingObject.keyPoints[looper];
                this.removeDrawing(item);
            }
        }

        totalOffsprings = drawingObject.offspring.length;
        for (looper = 0; looper < totalOffsprings; looper++) {
            item = drawingObject.offspring[looper];
            this.removeDrawing(item);
        }

        if (this.model.drawnShapes[index]) {
            if (this.model.deletedShapes) {
                this.model.deletedShapes.push(this.model.drawnShapes[index]);
            }
            // tslint:disable-next-line:no-dynamic-delete
            delete this.model.drawnShapes[index];
        }
    }
    /**
     * deleteDrawing
     * @param drawingObject drawing object to delete
     */
    private deleteDrawing(drawingObject: DrawingObject) {
        let actionData: ActionData;
        this.model.deletedShapes = [];
        this.removeDrawing(drawingObject);
        console.log(this.model.deletedShapes);
        actionData = {
            data: this.model.deletedShapes.slice()
        };
        this.undoRedoManager._registerAction(this.model._undergoingOperation, actionData);
        this.model.deletedShapes = null;
    }
    /**
     * clearGraph
     */
    private clearGraph() {
        let item: DrawingObject, drawnShapes: any, looper: string, actionData: ActionData;

        drawnShapes = this.model.drawnShapes;
        this.model.deletedShapes = [];

        for (looper in drawnShapes) {
            if (drawnShapes[looper]) {
                item = drawnShapes[looper] as DrawingObject;
                this.removeDrawing(item);
            }
        }

        if (this.model.deletedShapes && this.model.deletedShapes.length > 0) {
            actionData = {
                data: this.model.deletedShapes.slice()
            };
            this.undoRedoManager._registerAction(this.model._undergoingOperation, actionData);
        }
        this.plotter.labelCount = 0;
    }
    /**
     * createMovingPoint
     * @param canvasPoint determines moving point position
     */
    private createMovingPoint(canvasPoint: Point) {
        let _unsettledPoint: DrawingObject,
            gridPoint: Point;

        gridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint);
        _unsettledPoint = !this.model._unsettledPoint ? this.model.createNewPoint() : this.model._unsettledPoint;
        _unsettledPoint.mouseGridPosition = gridPoint;
        _unsettledPoint = this.updateDrawingObject(_unsettledPoint);
    }
    /**
     * getMousePositionOnCanvas
     * @param mouseEvent Event object
     * @param snapToGrid Snap to grid boolean
     */
    private getMousePositionOnCanvas(mouseEvent: any, snapToGrid?: boolean): Point {
        const domRect = this.model.canvas.getBoundingClientRect();
        let x: number, y: number,
            canvasPoint: Point,
            gridPoint: Point;

        if (mouseEvent.point) {
            x = mouseEvent.point.x;
            y = mouseEvent.point.y;
        }
        if (typeof mouseEvent.clientX !== "undefined") {
            x = mouseEvent.clientX - domRect.left;
            y = mouseEvent.clientY - domRect.top;
        }
        if (mouseEvent.changedTouches) {
            x = mouseEvent.changedTouches[0].clientX - domRect.left;
            y = mouseEvent.changedTouches[0].clientY - domRect.top;
        }
        if (mouseEvent.originalEvent) {
            x = mouseEvent.originalEvent.changedTouches[0].clientX - domRect.left;
            y = mouseEvent.originalEvent.changedTouches[0].clientY - domRect.top;
        }

        canvasPoint = new Point(x, y);

        if (snapToGrid) {
            gridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint, snapToGrid);
            canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(gridPoint, snapToGrid);
        }

        return canvasPoint;
    }
    /**
     * canvasMouseMoveFunc
     * @param event event object
     */
    private canvasMouseMoveFunc(event: any) {
        let _currentDrawing: DrawingObject,
            canvasPoint: Point,
            gridPoint: Point,
            _undergoingOperation: OperationModelPkg.OperationModel;

        _undergoingOperation = this.model._undergoingOperation;

        canvasPoint = this.getMousePositionOnCanvas(event, true);
        gridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint);

        if (_undergoingOperation.mode === "draw") {
            _currentDrawing = this.model._currentDrawing;
            _currentDrawing.mouseGridPosition = gridPoint;

            if (_undergoingOperation.type === "point" && !this.model._unsettledPoint) {
                this.model._unsettledPoint = _currentDrawing;
            }

            this.createMovingPoint(canvasPoint);
            this.model._unsettledPoint.slave = _currentDrawing.species !== "point";

            _currentDrawing = this.updateDrawingObject(_currentDrawing);
        }
    }
    /**
     * canvasMouseDownFunc
     * @param event event object
     */
    private canvasMouseDownFunc(event: any) {
        let _currentDrawing: DrawingObject,
            _undergoingOperation: OperationModelPkg.OperationModel,
            _currentRelation: RelationModelPkg.RelationModel,
            canvasPoint: Point,
            gridPoint: Point;

        _undergoingOperation = this.model._undergoingOperation;
        _currentRelation = this.model._currentRelation;

        canvasPoint = this.getMousePositionOnCanvas(event);
        gridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint);

        _currentDrawing = this.model._currentDrawing;

        if (_undergoingOperation.mode === "draw" && _currentDrawing) {
            _currentDrawing.mouseGridPosition = gridPoint;

            if (_currentDrawing.species === "polygon" && this.model._unsettledPoint &&
                _currentRelation.isFirstCoincidentPoint(_currentDrawing)) {
                this.replaceUnsettledPoint(_currentDrawing);
                this.removeLastSegment(_currentDrawing.paperShapeCollection);
                this.closePolygonPath(_currentDrawing.paperShapeCollection);
            }

            if (this.model._unsettledPoint) {
                this._confirmDrawingPoint(_currentDrawing);
            }

            if (this.model._unsettledSegment) {
                this._confirmDrawingSegment(_currentDrawing);
            }

            if (_currentRelation.isMature(_currentDrawing)) {
                _currentDrawing.drawingComplete = true;
                _currentRelation.addOffspring(_currentDrawing);
                this.model.addSourceOffspring(_currentDrawing);
                this.model.addOffspringSource(_currentDrawing);
                this.model.addDrawingRelation(_currentDrawing);
                this._finalizeDrawing(_currentDrawing);
            }
        }
    }
    /**
     * replaceUnsettledPoint
     * @param drawingObject polygon drawing object
     */
    private replaceUnsettledPoint(drawingObject: DrawingObject): any {
        let item: DrawingObject,
            replaceWithPointData: DrawingObject,
            _unsettledSegment: DrawingObject;

        _unsettledSegment = this.model._unsettledSegment;

        if (_unsettledSegment) {
            replaceWithPointData = drawingObject.keyPoints[0];
            _unsettledSegment.position = _unsettledSegment.mouseGridPosition = replaceWithPointData.position;
            _unsettledSegment.keyPoints[1] = replaceWithPointData;
        }

        if (this.model._unsettledPoint) {
            item = drawingObject.keyPoints.pop();
            this.removeDrawing(item);
            this.model._unsettledPoint = null;
        }
    }
    /**
     * removeLastSegment removes last segment
     * @param paperShapeCollection polygon shape and hit area
     */
    private removeLastSegment(paperShapeCollection: ShapeCollection) {
        paperShapeCollection.paperShape.lastSegment.remove();
        paperShapeCollection.paperHitArea.lastSegment.remove();
    }
    /**
     * closePolygonPath close current polygon path
     * @param paperShapeCollection polygon shape and hit area
     */
    private closePolygonPath(paperShapeCollection: ShapeCollection) {
        paperShapeCollection.paperShape.closed = true;
        paperShapeCollection.paperHitArea.closed = true;
    }
    /**
     * isDrawingComplete
     * @param drawingObject current drawing object
     */
    // private isDrawingComplete(drawingObject: DrawingObject): boolean {
    //     const mode = drawingObject.mode,
    //         species = drawingObject.species;

    //     switch (mode) {
    //         case "draw":
    //             return drawingObject.pointsFinalized.length === drawingObject.maxPointsNeeded ||
    //                 species === "polygon" && this.isFirstCoincidentPoint(drawingObject);
    //         case "transform":
    //             return;
    //     }
    // }
    /**
     * isFirstCoincidentPoint
     * @param drawingObject polygon drawing object
     */
    // private isFirstCoincidentPoint(drawingObject: DrawingObject): any {
    //     let canvasPoint: Point;

    //     canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(drawingObject.mouseGridPosition);
    //     return drawingObject.keyPoints.length > 2 &&
    //         PlotterViewPkg.PlotterView.checkHitTest(drawingObject.keyPoints[0], canvasPoint);
    // }
    /**
     * _finalizeDrawing
     * @param drawingObject that is finalized.
     */
    private _finalizeDrawing(drawingObject: DrawingObject) {
        let looper: number, _undergoingOperation: OperationModelPkg.OperationModel,
            totalKeyPoints: number, totalKeySegments: number, actionData: ActionData;

        if (this.isInvalidDrawing(drawingObject)) {
            // this._removeDrawing(drawing);
            return;
        }

        if (this.model.doesShapeAlreadyExists(drawingObject)) {
            return;
        }

        if (!drawingObject.count && !drawingObject.slave) {
            drawingObject.count = this.model.updateGlobalCounters(drawingObject.species);
        }
        this.model.drawnShapes[drawingObject.id] = drawingObject;
        if (drawingObject.mode !== "measure") {
            this.updateStyle(drawingObject);
            this.drawLabelOnGraph(drawingObject);
            this.saveDrawingObjectInItem(drawingObject, drawingObject);
        }

        this.updateShapesOrder(drawingObject);

        if (!(drawingObject.slave || this.model.doNotRegisterAction)) {
            actionData = {
                data: drawingObject
            };
            this.undoRedoManager._registerAction(this.model._undergoingOperation, actionData);
        }

        if (drawingObject.species === "point") {
            this.updateStyle(drawingObject);
            this.saveDrawingObjectInItem(drawingObject, drawingObject);
        } else {
            totalKeyPoints = drawingObject.keyPoints.length;
            for (looper = 0; looper < totalKeyPoints; looper++) {
                this.updateStyle(drawingObject.keyPoints[looper]);
                this.saveDrawingObjectInItem(drawingObject.keyPoints[looper], drawingObject);
            }
        }

        totalKeySegments = drawingObject.keySegments.length;
        for (looper = 0; looper < totalKeySegments; looper++) {
            this.updateStyle(drawingObject.keySegments[looper]);
            this.saveDrawingObjectInItem(drawingObject.keySegments[looper], drawingObject);
        }

        _undergoingOperation = this.model._undergoingOperation;
        if (_undergoingOperation) {
            this.abortUndergoingOperation();
        }
        // if (_undergoingOperation.isDrawingMode()) {
        //     this.perform({
        //         mode: _undergoingOperation.mode,
        //         type: _undergoingOperation.type
        //     });
        // }
    }
    /**
     * drawLabelOnGraph
     */
    private drawLabelOnGraph(drawingObject: DrawingObject) {
        if (!drawingObject.drawingComplete) {
            return;
        }
        let labelPoints: LabelPoints, totalKeyPoints: number, looper: number;

        labelPoints = {};
        switch (drawingObject.species) {
            case "point":
                labelPoints.current = drawingObject;
                this.drawLabel(drawingObject, labelPoints);
                break;
            case "segment":
            case "line":
            case "polygon":
                totalKeyPoints = drawingObject.keyPoints.length;

                for (looper = 0; looper < totalKeyPoints; looper++) {
                    labelPoints.previous = drawingObject.keyPoints[looper === 0 ? totalKeyPoints - 1 : looper - 1];
                    labelPoints.current = drawingObject.keyPoints[looper];
                    labelPoints.next = drawingObject.keyPoints[looper === totalKeyPoints - 1 ? 0 : looper + 1];
                    this.drawLabel(drawingObject, labelPoints);
                }
        }
    }
    /**
     * drawLabel
     * @param drawingObject current drawing object
     * @param labelPoints points required to draw the label
     */
    private drawLabel(drawingObject: DrawingObject, labelPoints: LabelPoints) {
        if (!labelPoints.current.paperShapeCollection.paperLabel) {
            this.plotter.drawLabelOnGraph(drawingObject, labelPoints);
        } else {
            this.plotter.updateLabelPosition(drawingObject, labelPoints);
        }
    }
    /**
     * saveDrawingObjectInItem
     * @param drawingObject drawing object to save inside the paperShape
     */
    private saveDrawingObjectInItem(drawingObject: DrawingObject, parDrawingObject: DrawingObject) {
        let paperShapeCollection: ShapeCollection;

        paperShapeCollection = drawingObject.paperShapeCollection;

        if (paperShapeCollection) {
            if (paperShapeCollection.paperShape) {
                paperShapeCollection.paperShape.data.parentDrawingObject = parDrawingObject;
                paperShapeCollection.paperShape.data.drawingObject = drawingObject;
            }
            if (paperShapeCollection.paperHitArea) {
                paperShapeCollection.paperHitArea.data.parentDrawingObject = parDrawingObject;
                paperShapeCollection.paperHitArea.data.drawingObject = drawingObject;
            }
        }
    }
    /**
     * updateStyle
     * @param drawingObject point object
     */
    private updateStyle(drawingObject: DrawingObject) {
        let stylesType: StylesType;

        stylesType = DrawingModelPkg.DrawingModel.getStylesForShape(drawingObject.species);
        this.plotter.changeShapeColor(drawingObject, stylesType.drawing.strokeColor,
            stylesType.drawing.fillColor);
    }
    /**
     * reviveDrawing
     */
    private reviveDrawing(drawingObject: DrawingObject) {
        this.model.doNotRegisterAction = true;
        drawingObject.incinerated = false;
        drawingObject.drawingComplete = true;
        this.addDrawingSources(drawingObject);
        this.updateDrawingObject(drawingObject);
        if (drawingObject.species === "polygon") {
            this.closePolygonPath(drawingObject.paperShapeCollection);
        }
        this.model.doNotRegisterAction = false;
    }
    /**
     * isInvalidDrawing return true if current drawing is invalid
     * @param drawingObject to check
     */
    private isInvalidDrawing(drawingObject: DrawingObject): boolean {
        return false;
    }
    /**
     * getUpdatedCanvasPosition
     * @param gridPoint grid position
     * @param delta contains x and y distance moved
     */
    private getUpdatedCanvasPosition(gridPoint: Point, delta: any): Point {
        let canvasPoint: Point;

        canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(gridPoint);
        canvasPoint.x += delta.x;
        canvasPoint.y += delta.y;

        return canvasPoint;
    }
    /**
     * updateShape
     * @param drawingObject drawing object moved
     * @param delta contains distance moved in x and y direction
     */
    private updateShape(drawingObject: DrawingObject, delta?: any, isPoint?: boolean) {
        // let sources: DrawingObject[], totalSources: number;
        let looper: number, totalKeyPoints: number, totalKeySegments: number, totalOffsprings: number,
            canvasPoint: Point, gridPoint: Point;

        /*if (drawingObject.creator && drawingObject.creator.mode === "transform") {
            sources = drawingObject.creator.sources;
            totalSources = sources.length;
            for (looper = 0; looper < totalSources; looper++) {
                this.updateShape(sources[looper], delta);
            }
        }*/

        if (drawingObject.species === "point") {
            if (delta) {
                if (isPoint) {
                    canvasPoint = this.getUpdatedCanvasPosition(drawingObject.mouseGridPosition, delta);

                    drawingObject.mouseGridPosition = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint);
                    // console.log("gridPoint ", MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint, isPoint));
                    // console.log("canvasPoint ", canvasPoint);

                    gridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint, isPoint);
                    canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(gridPoint, isPoint);

                    drawingObject.position = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint, isPoint);
                    // console.log("Snapped gridPoint ", gridPoint);
                    // console.log("Snapped canvasPoint ", canvasPoint);
                } else {
                    canvasPoint = this.getUpdatedCanvasPosition(drawingObject.mouseGridPosition, delta);
                    drawingObject.position = drawingObject.mouseGridPosition = MathUtilityPkg.Utility.canvasToGridCoordinate(canvasPoint);
                }
            }
            this.updateDrawingObject(drawingObject);
        }

        totalKeyPoints = drawingObject.keyPoints.length;
        for (looper = 0; looper < totalKeyPoints; looper++) {
            this.updateShape(drawingObject.keyPoints[looper], delta);
        }

        totalKeySegments = drawingObject.keySegments.length;
        for (looper = 0; looper < totalKeySegments; looper++) {
            this.updateDrawingObject(drawingObject.keySegments[looper]);
        }

        if (!drawingObject.slave) {
            if (drawingObject.species !== "point") {
                this.updateDrawingObject(drawingObject);
            }
            this.drawLabelOnGraph(drawingObject);
        }

        totalOffsprings = drawingObject.offspring.length;
        for (looper = 0; looper < totalOffsprings; looper++) {
            this.updateDrawingObject(drawingObject.offspring[looper]);
            this.drawLabelOnGraph(drawingObject.offspring[looper]);
        }
    }
    /**
     * updateDrawingObject
     */
    private updateDrawingObject(drawingObject: DrawingObject, data?: any) {
        if (!drawingObject) {
            return;
        }

        let segmentGridPoints: Point[];
        this.model.activateScopeAndLayer();

        if (drawingObject.mode === "transform" && drawingObject.species === "point" && data) {
            this.updateTransformPosition(drawingObject, data);
        }

        switch (drawingObject.species) {
            case "point":
                drawingObject.position = drawingObject.drawingComplete ? drawingObject.position : drawingObject.mouseGridPosition;
                drawingObject.paperShapeCollection = this.plotter.drawPointOnGraph(drawingObject.position,
                    drawingObject.paperShapeCollection);
                break;
            case "segment":
            case "line":
                if ((drawingObject.keyPoints.length === drawingObject.pointsFinalized.length ||
                    drawingObject.keyPoints.length === 0) && this.model._unsettledPoint) {
                    drawingObject.keyPoints.push(this.model._unsettledPoint);
                }

                if (drawingObject.keyPoints.length > drawingObject.minPointsNeeded) {
                    segmentGridPoints = this.model.getSegmentGridPoints(drawingObject);

                    if (!drawingObject.paperShapeCollection) {
                        drawingObject.paperShapeCollection = this.plotter.drawSegmentOnGraph(segmentGridPoints[0],
                            segmentGridPoints[1], drawingObject.species);
                    } else {
                        this.plotter._updateSegmentPoints(drawingObject.paperShapeCollection, segmentGridPoints, drawingObject.species);
                    }
                }
                break;
            case "polygon":
                if ((drawingObject.keyPoints.length === drawingObject.pointsFinalized.length ||
                    drawingObject.keyPoints.length === 0) && this.model._unsettledPoint) {
                    drawingObject.keyPoints.push(this.model._unsettledPoint);
                }

                if (drawingObject.keyPoints.length > drawingObject.minPointsNeeded) {
                    segmentGridPoints = this.model.getSegmentGridPoints(drawingObject);

                    if (!drawingObject.drawingComplete && drawingObject.keySegments.length !== drawingObject.keyPoints.length) {
                        this.createPolygonSegment(drawingObject);
                    }

                    if (!drawingObject.paperShapeCollection) {
                        drawingObject.paperShapeCollection = this.plotter.drawPolygonOnGraph(segmentGridPoints);
                    } else {
                        this.plotter._updatePolygonPoints(drawingObject.paperShapeCollection, segmentGridPoints);
                    }
                }
                break;
            case "angle":
                if (drawingObject.keyPoints.length === drawingObject.maxPointsNeeded) {
                    this.trigger("update-measurement-checkbox");
                    drawingObject.visible = PanelView.Panel.isShowMeasurements;
                    if (!drawingObject.paperShapeCollection) {
                        drawingObject.paperShapeCollection = this.plotter.drawAngleArcOnGraph(drawingObject.keyPoints);
                    } else {
                        this.plotter._updateAngleArcPoints(drawingObject.paperShapeCollection, drawingObject.keyPoints);
                    }
                }
                break;
            case "length":
                this.trigger("update-measurement-checkbox");
                drawingObject.visible = PanelView.Panel.isShowMeasurements;
                if (!drawingObject.paperShapeCollection) {
                    drawingObject.paperShapeCollection = this.plotter.drawMeasurementLabelOnGraph(drawingObject);
                } else {
                    this.plotter._updateMeasureLabelOnGraph(drawingObject.paperShapeCollection, drawingObject);
                }
                break;
            default:
        }

        if (drawingObject.hasOwnProperty("visible")) {
            this.plotter._setVisibility(drawingObject.paperShapeCollection, drawingObject.species,
                drawingObject.visible);
        }

        if (drawingObject.drawingComplete && !drawingObject.slave) {
            this._finalizeDrawing(drawingObject);
        }

        // this.refreshGraph();

        return drawingObject;
    }
    /**
     * updateShapesOrder
     * @param drawingObject current finalized drawing
     */
    private updateShapesOrder(drawingObject: DrawingObject) {
        let looper: number, totalPoints: number, totalSegments: number;

        if (drawingObject.paperShapeCollection) {
            this.bringToFront(drawingObject.paperShapeCollection);
        }

        totalSegments = drawingObject.keySegments.length;
        for (looper = 0; looper < totalSegments; looper++) {
            if (drawingObject.keySegments[looper].paperShapeCollection) {
                this.bringToFront(drawingObject.keySegments[looper].paperShapeCollection);
            }
        }

        totalPoints = drawingObject.keyPoints.length;
        for (looper = 0; looper < totalPoints; looper++) {
            if (drawingObject.keyPoints[looper].paperShapeCollection) {
                this.bringToFront(drawingObject.keyPoints[looper].paperShapeCollection);
            }
        }

        this.refreshGraph();
    }

    private bringToFront(paperShapeCollection: ShapeCollection) {
        if (paperShapeCollection.paperLabel) {
            paperShapeCollection.paperLabel.bringToFront();
        }
        if (paperShapeCollection.paperShape) {
            paperShapeCollection.paperShape.bringToFront();
        }
        if (paperShapeCollection.paperHitArea) {
            paperShapeCollection.paperHitArea.bringToFront();
        }
    }

    /**
     * createPolygonSegment
     * @param drawingObject polygon drawing object
     */
    private createPolygonSegment(drawingObject: DrawingObject): any {
        let _unsettledSegment: DrawingObject;

        if (!this.model._unsettledSegment) {
            _unsettledSegment = this.model.createNewSegment();
            _unsettledSegment.keyPoints = _unsettledSegment.keyPoints.concat(drawingObject.keyPoints.slice(-2));
        } else {
            _unsettledSegment = this.model._unsettledSegment;
        }

        _unsettledSegment.mouseGridPosition = drawingObject.mouseGridPosition;
        _unsettledSegment.slave = true;
        _unsettledSegment = this.updateDrawingObject(_unsettledSegment);
    }
    /**
     * addDrawingSources
     */
    private addDrawingSources(drawingObject: DrawingObject): any {
        let totalPoints: number, totalSegments: number, looper: number;

        totalPoints = drawingObject.keyPoints.length;
        for (looper = 0; looper < totalPoints; looper++) {
            drawingObject.keyPoints[looper].incinerated = false;
            this.updateDrawingObject(drawingObject.keyPoints[looper]);
        }

        if (drawingObject.species === "polygon") {
            totalSegments = drawingObject.keySegments.length;
            for (looper = 0; looper < totalSegments; looper++) {
                drawingObject.keySegments[looper].incinerated = false;
                this.updateDrawingObject(drawingObject.keySegments[looper]);
            }
        }
    }
    /**
     * _confirmDrawingPoint
     * @param drawingObject current drawing object
     */
    private _confirmDrawingPoint(drawingObject: DrawingObject) {
        let _currentRelation: RelationModelPkg.RelationModel;

        _currentRelation = this.model._currentRelation;
        _currentRelation.addSources(this.model._unsettledPoint);

        drawingObject.pointsFinalized.push(this.model._unsettledPoint.position);
        this.model._unsettledPoint.drawingComplete = true;
        this.model._unsettledPoint = null;
    }
    /**
     * _confirmDrawingSegment
     * @param drawingObject current drawing object
     */
    private _confirmDrawingSegment(drawingObject: DrawingObject) {
        let _currentRelation: RelationModelPkg.RelationModel;

        _currentRelation = this.model._currentRelation;
        _currentRelation.addSources(this.model._unsettledSegment);

        drawingObject.keySegments.push(this.model._unsettledSegment);
        this.model.addSourceOffspring(this.model._unsettledSegment);
        this.model.addOffspringSource(this.model._unsettledSegment);
        this.model._unsettledSegment.drawingComplete = true;
        this.model._unsettledSegment = null;
    }
    /**
     * addCanvasListeners
     */
    private addCanvasListeners() {
        let _undergoingOperation: OperationModelPkg.OperationModel;

        _undergoingOperation = this.model._undergoingOperation;

        this.model.canvas.addEventListener("mousemove", this.canvasMouseMoveFuncProxy);
        this.model.canvas.addEventListener("mousedown", this.canvasMouseDownFuncProxy);
    }
    /**
     * removeCanvasListeners
     */
    private removeCanvasListeners() {
        let _undergoingOperation: OperationModelPkg.OperationModel;

        _undergoingOperation = this.model._undergoingOperation;

        this.model.canvas.removeEventListener("mousemove", this.canvasMouseMoveFuncProxy);
        this.model.canvas.removeEventListener("mousedown", this.canvasMouseDownFuncProxy);
    }
    /**
     * refreshGraph
     */
    private refreshGraph() {
        this.model._drawingScope.view.draw();
    }
    /**
     * addUndoRedoEventListeners
     */
    private addUndoRedoEventListeners() {
        this.listenTo(this.undoRedoManager, "removeDrawing", this.removeDrawingProxy);
        this.listenTo(this.undoRedoManager, "reviveDrawing", this.reviveDrawingProxy);
        this.listenTo(this.undoRedoManager, "updateShape", this.updateShapeProxy);
    }

    // tslint:disable-next-line:max-file-line-count
}
