import * as Backbone from "backbone";

// tslint:disable-next-line:no-import-side-effect
import "jquery-mousewheel";

import * as MathUtilityPkg from "../models/maths-utility";

import { Color, Layer, MouseEvent, PaperScope, Path, Point, PointText, Rectangle, Shape, Size, Symbol, Tool } from "paper";
import * as _ from "underscore";
import * as GridGraphModelPkg from "../models/grid-graph-model";

export interface GridViewOptions {
    canvasHeight?: number;
    canvasWidth?: number;
    xAxisMinValue?: number;
    xAxisMaxValue?: number;
    yAxisMinValue?: number;
    yAxisMaxValue?: number;
    isZoomBehaviourAllowed?: boolean;
    isPanBehaviourAllowed?: boolean;
    isDoubleClickZoomAllow?: boolean;
    canvasBackgroundColor?: string;
    canvasBackgroundAlpha?: number;
}

const ZOOM_FACTORS = [1, 2, 5];
const GRID_MARKER_LINES = {
    DEFAULT: {
        MARKER_LINE: 2,
        ZOOM_STEPS: 4
    },
    FIVE_MULTIPLIER: {
        MARKER_LINE: 2,
        ZOOM_STEPS: 6
    }
};
const ADJACENT_LINES_MIN_DISTANCE = 14;
const MINIMUM_ZOOM_LEVEL_FACTOR = 0.65;
const ZOOM_LEVEL_INCREMENT_STEPS = 0.1;
const ZOOM_DISTANCE = 3;
const MARKER_FONT = {
    COLOR: {
        AT_END_OF_GRAPH_AREA: "#000",
        ON_GRAPH_AREA: "#000"
    },
    FAMILY: "Source Sans Pro",
    SIZE: 12,
    WEIGHT: 40
};

const TEXT_ALIGN = {
    HORIZONTAL: {
        CENTER: "center",
        LEFT: "left",
        RIGHT: "right"
    },
    VERTICAL: {
        BOTTOM: "bottom",
        MIDDLE: "middle",
        TOP: "top"
    }
};

const MARGIN = {
    "X-LABELS": {
        "AT-CANVAS-END": {
            BOTTOM: 2,
            LEFT: 2,
            RIGHT: 2,
            TOP: 2
        },
        "ON-CANVAS": {
            BOTTOM: 0,
            LEFT: 0,
            RIGHT: 0,
            TOP: 7
        }
    },
    "Y-LABELS": {
        "AT-CANVAS-END": {
            BOTTOM: 2,
            LEFT: 2,
            RIGHT: 2,
            TOP: 2
        },
        "ON-CANVAS": {
            BOTTOM: 0,
            LEFT: 0,
            RIGHT: 7,
            TOP: 0
        }
    }
};

const PI = "\u03C0";
const X10_STRING = "\u00D710";

export class GridGraph extends Backbone.View<GridGraphModelPkg.GridGraph> {

    public canvasSize = {
        height: 600,
        width: 800
    };
    public projectLayers = {
        gridBGLayer: null as any,
        gridLayer: null as any
    };
    public paperScope: PaperScope;
    public paperTool: Tool;
    public previousOriginPositionOnGrpah: number;
    public girdMarkerBounds = {
        max: {
            "\\theta": null as any,
            "x": null as any,
            "y": null as any
        },
        min: {
            "\\theta": null as any,
            "x": null as any,
            "y": null as any
        }
    };
    public lastViewRefresh: any;
    public refreshTimer: any;
    public delta: any;

    constructor(attr: Backbone.ViewOptions<GridGraphModelPkg.GridGraph>, options?: GridViewOptions) {
        super(attr);
        this.render(options);
    }

    public render(options?: GridViewOptions): GridGraph {
        this.setStaticData();
        this.updateModelData(options);
        this.calculateLimits();
        this.paperSetUp();
        this.createGridBackground();
        this.createGridLinesSymbol();
        this.setDefaultZoom();
        this.paperScope.view.draw();
        return this;
    }

    public reRenderGraph() {
        this.activateCurScope();

        const $canvas = $(".graph-app"),
            graphData = this.model.graphData,
            gridParameters = graphData.gridParameters,
            xGridLines = gridParameters.xGridLines,
            yGridLines = gridParameters.yGridLines,
            curLimits = graphData.gridLimits.curLimits,
            height = $canvas.height(),
            width = $canvas.width(),
            curDistanceBetweenTwoHorizontalLines = gridParameters.curDistanceBetweenTwoHorizontalLines,
            curDistanceBetweenTwoVerticalLines = gridParameters.curDistanceBetweenTwoVerticalLines,
            previousHeight = this.canvasSize.height,
            previousWidth = this.canvasSize.width,
            extraHeight = height - previousHeight,
            extraWidth = width - previousWidth;
        let xExtraCount = 0,
            yExtraCount = 0,
            xPosition, yPosition;

        if (width > 0 && height > 0 && (extraHeight !== 0 || extraWidth !== 0)) {
            if (extraHeight !== 0) {
                this.canvasSize.height = height;

                yExtraCount = extraHeight / (curDistanceBetweenTwoHorizontalLines * yGridLines)
                    * graphData.zoomingCharacteristics.yTotalMultiplier;
                curLimits.yLower = curLimits.yLower - yExtraCount / 2;
                curLimits.yUpper = curLimits.yUpper + yExtraCount / 2;
            }

            if (extraWidth !== 0) {
                this.canvasSize.width = width;

                xExtraCount = extraWidth / (curDistanceBetweenTwoVerticalLines * xGridLines)
                    * graphData.zoomingCharacteristics.xTotalMultiplier;
                curLimits.xLower = curLimits.xLower - xExtraCount / 2;
                curLimits.xUpper = curLimits.xUpper + xExtraCount / 2;
            }

            $canvas.find(".grid-graph").width(this.canvasSize.width).height(this.canvasSize.height);

            this.setBounds();

            gridParameters.countOfVerticalLines += extraWidth / curDistanceBetweenTwoVerticalLines;
            gridParameters.countOfHorizontalLines += extraHeight / curDistanceBetweenTwoHorizontalLines;

            /* condition to decide initial origin Position*/
            xPosition = curLimits.xLower >= 0 ? -curLimits.xLower : Math.abs(curLimits.xLower);
            yPosition = curLimits.yUpper <= 0 ? -Math.abs(curLimits.yUpper) : Math.abs(curLimits.yUpper);

            graphData.graphOriginData.curOrigin =
                new Point(xPosition / graphData.zoomingCharacteristics.xTotalMultiplier * xGridLines * curDistanceBetweenTwoVerticalLines,
                    yPosition / graphData.zoomingCharacteristics.yTotalMultiplier * yGridLines * curDistanceBetweenTwoHorizontalLines);

            graphData.graphOriginData.defOrigin = new Point(this.canvasSize.width / 2, this.canvasSize.height / 2);

            this.calculateOriginPositionOnGraph();

            this.createGridLinesSymbol();

            this.calculateDeltaAngle();

            this.drawGridGraph();

            this.paperScope.view.viewSize.width = width;
            this.paperScope.view.viewSize.height = height;

            this.refreshGridGraph();
            this.setStaticData();
        }
    }

    public setStaticData() {
        GridGraphModelPkg.GridGraph.GRAPH_DATA = this.model.graphData;
        GridGraphModelPkg.GridGraph.canvasSize = this.canvasSize;
    }

    public zoomInBtnClicked(event: Event) {
        let i = 0,
            zoomCaller: any, interval: any;
        const totalShiftPoint = GRID_MARKER_LINES.DEFAULT.ZOOM_STEPS;

        zoomCaller = _.bind(function() {
            this.trigger("before-zoom-in");
            this.zoomGraph(1, true);
            this.trigger("after-zoom-in");
        }, this);

        interval = setInterval(() => {
            zoomCaller();
            i++;
            if (i > totalShiftPoint) {
                clearInterval(interval);
            }
        }, 0.1);
    }

    public zoomOutBtnClicked(event: Event) {
        let i = 0,
            zoomCaller: any, interval: any;
        const totalShiftPoint = GRID_MARKER_LINES.DEFAULT.ZOOM_STEPS;

        zoomCaller = _.bind(function() {
            this.trigger("before-zoom-out");
            this.zoomGraph(-1, true);
            this.trigger("after-zoom-out");
        }, this);

        interval = setInterval(() => {
            zoomCaller();
            i++;
            if (i > totalShiftPoint) {
                clearInterval(interval);
            }
        }, 0.1);
    }

    public defaultZoomBtnClicked(event: Event) {
        this.trigger("before-default-zoom");
        this.setDefaultZoom();
        this.refreshGridGraph();
        this.calculateDeltaAngle();
        this.trigger("after-default-zoom");
    }

    public mouseDragOnLayer(event: any) {
        let deltaVar;
        this.activateCurScope();
        if (this.model.isPanBehaviourAllowed) {
            if (event.delta) {
                deltaVar = event.delta;
            } else {
                // in IE wheel deltaX and deltaY are not given so just following wheel delta
                deltaVar = {
                    x: 0,
                    y: event.originalEvent.wheelDelta
                };
            }
            this.panBy(deltaVar.x, deltaVar.y);
        }
    }

    private getCanvasToGridCoordinate(canvasPointCoordinates: number[]) {
        let dummyPoint = new Point(canvasPointCoordinates[0], canvasPointCoordinates[1]);
        dummyPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(dummyPoint);
        return [dummyPoint.x, dummyPoint.y];
    }

    private getGridToCanvasCoordinate(gridPointCoordinate: number[]) {
        let dummyPoint = new Point(gridPointCoordinate[0], gridPointCoordinate[1]);
        dummyPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(dummyPoint);
        return [dummyPoint.x, dummyPoint.y];
    }

    private zoomGraph(delta?: any, ismouseWheel?: any, isPinchZoom?: any, refPoint?: any) {
        this.activateCurScope();
        const graphData = this.model.graphData,
            gridParameters = graphData.gridParameters,
            graphOriginData = graphData.graphOriginData,
            height = this.canvasSize.height,
            width = this.canvasSize.width,
            curOrigin = graphOriginData.curOrigin,
            zoomingCharacteristics = graphData.zoomingCharacteristics;
        let shiftDistance = null,
            angle = null,
            newOriginPoint,
            zoomFactor = this.calculateZoomLevelLimits(),
            shiftFactor = null;

        refPoint = refPoint || zoomingCharacteristics.refPoint;
        if (delta === 0) {
            return;
        }
        ismouseWheel = null;
        if (delta > 0) {
            shiftFactor = this.originShiftFactor(refPoint, true);
            shiftDistance = shiftFactor.distance;
            angle = shiftFactor.angle;

            this.activateCurScope();
            newOriginPoint = new Point(curOrigin.x + Math.cos(angle) *
                shiftDistance, curOrigin.y - Math.sin(angle) * shiftDistance);
            this.delta = new Point(graphOriginData.curOrigin.x - newOriginPoint.x, graphOriginData.curOrigin.y - newOriginPoint.y);
            graphOriginData.curOrigin = newOriginPoint;
            this.previousOriginPositionOnGrpah = this.getCanvasToGridCoordinate([width, height / 2])[0];

            zoomingCharacteristics.curXZoomLevel += ZOOM_LEVEL_INCREMENT_STEPS;
            zoomingCharacteristics.curXZoomLevel = parseFloat(zoomingCharacteristics.curXZoomLevel.toFixed(4));

            if (zoomingCharacteristics.curXZoomLevel > zoomFactor.xMaxZoomLevel) {
                /*vertical line distance Multiplier*/
                this.xAxisZoomFactorModifier(false);
                zoomFactor = this.calculateZoomLevelLimits();
                zoomingCharacteristics.curXZoomLevel = zoomFactor.xMinZoomLevel;
            }

            zoomingCharacteristics.curYZoomLevel += ZOOM_LEVEL_INCREMENT_STEPS;
            zoomingCharacteristics.curYZoomLevel = parseFloat(zoomingCharacteristics.curYZoomLevel.toFixed(4));
            if (zoomingCharacteristics.curYZoomLevel > zoomFactor.yMaxZoomLevel) {
                /*horizontal line distance Multiplier*/
                this.yAxisZoomFactorModifier(false);
                zoomFactor = this.calculateZoomLevelLimits();
                zoomingCharacteristics.curYZoomLevel = zoomFactor.yMinZoomLevel;
            }

            gridParameters.curDistanceBetweenTwoVerticalLines = zoomingCharacteristics.curXZoomLevel *
                gridParameters.distanceBetweenTwoVerticalLines;
            gridParameters.countOfVerticalLines = width / gridParameters.curDistanceBetweenTwoVerticalLines;

            gridParameters.curDistanceBetweenTwoHorizontalLines = zoomingCharacteristics.curYZoomLevel *
                gridParameters.distanceBetweenTwoHorizontalLines;
            gridParameters.countOfHorizontalLines = height / gridParameters.curDistanceBetweenTwoHorizontalLines;

        } else {
            shiftFactor = this.originShiftFactor(refPoint, false);
            shiftDistance = shiftFactor.distance;
            angle = shiftFactor.angle;
            /*ShiftOrigin*/

            this.activateCurScope();
            newOriginPoint = new Point(curOrigin.x + Math.cos(angle) * shiftDistance,
                curOrigin.y - Math.sin(angle) * shiftDistance);
            this.delta = new Point(graphOriginData.curOrigin.x - newOriginPoint.x,
                graphOriginData.curOrigin.y - newOriginPoint.y);
            graphOriginData.curOrigin = newOriginPoint;
            this.previousOriginPositionOnGrpah = this.getCanvasToGridCoordinate([width, height / 2])[0];

            zoomingCharacteristics.curXZoomLevel -= ZOOM_LEVEL_INCREMENT_STEPS;
            zoomingCharacteristics.curXZoomLevel = parseFloat(zoomingCharacteristics.curXZoomLevel.toFixed(4));

            if (zoomingCharacteristics.curXZoomLevel < zoomFactor.xMinZoomLevel) {
                /*vertical line distance Multiplier*/
                this.xAxisZoomFactorModifier(true);
                zoomFactor = this.calculateZoomLevelLimits();
                zoomingCharacteristics.curXZoomLevel = zoomFactor.xMaxZoomLevel;
            }
            zoomingCharacteristics.curYZoomLevel -= ZOOM_LEVEL_INCREMENT_STEPS;
            zoomingCharacteristics.curYZoomLevel = parseFloat(zoomingCharacteristics.curYZoomLevel.toFixed(4));

            if (zoomingCharacteristics.curYZoomLevel < zoomFactor.yMinZoomLevel) {
                /*horizontal line distance Multiplier*/
                this.yAxisZoomFactorModifier(true);
                zoomFactor = this.calculateZoomLevelLimits();
                zoomingCharacteristics.curYZoomLevel = zoomFactor.yMaxZoomLevel;
            }

            gridParameters.curDistanceBetweenTwoVerticalLines = zoomingCharacteristics.curXZoomLevel *
                gridParameters.distanceBetweenTwoVerticalLines;
            gridParameters.countOfVerticalLines = width / gridParameters.curDistanceBetweenTwoVerticalLines;

            gridParameters.curDistanceBetweenTwoHorizontalLines = zoomingCharacteristics.curYZoomLevel *
                gridParameters.distanceBetweenTwoHorizontalLines;
            gridParameters.countOfHorizontalLines = height / gridParameters.curDistanceBetweenTwoHorizontalLines;
        }

        this.graphLimitChangesDuringDragging();

        this.calculateDeltaAngle();

        this.drawGridGraph();
        this.refreshGridGraph();
    }

    private originShiftFactor(refPoint: any, isZoomIn: any) {
        const nextFactors = this.getNextMarkerFactors(!isZoomIn),
            graphData = this.model.graphData,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            gridParameters = graphData.gridParameters,
            curOrigin = graphData.graphOriginData.curOrigin,
            zoomLevels = this.calculateZoomLevelLimits(zoomingCharacteristics.xTotalMultiplier, zoomingCharacteristics.yTotalMultiplier),
            nextZoomLevels = this.calculateZoomLevelLimits(nextFactors.xMarker.xTotalMultiplier, nextFactors.yMarker.yTotalMultiplier),
            nextOriginPoint = {
                x: null as number,
                y: null as number
            };
        let verticalLinesDistance,
            horizontalLineDistance,
            xGridLines,
            yGridLines,
            xMultiplier,
            yMultiplier,
            currentClickedPoint,
            distance,
            angle,
            nextXZoomLevel,
            nextYZoomLevel;

        if (isZoomIn) {
            nextXZoomLevel = zoomingCharacteristics.curXZoomLevel + ZOOM_LEVEL_INCREMENT_STEPS;
            nextYZoomLevel = zoomingCharacteristics.curYZoomLevel + ZOOM_LEVEL_INCREMENT_STEPS;

            if (nextXZoomLevel > zoomLevels.xMaxZoomLevel) {
                nextXZoomLevel = nextZoomLevels.xMinZoomLevel;
                xMultiplier = nextFactors.xMarker.xTotalMultiplier;
            } else {
                xMultiplier = zoomingCharacteristics.xTotalMultiplier;
            }

            if (nextYZoomLevel > zoomLevels.yMaxZoomLevel) {
                nextYZoomLevel = nextZoomLevels.yMinZoomLevel;
                yMultiplier = nextFactors.yMarker.yTotalMultiplier;

            } else {
                yMultiplier = zoomingCharacteristics.yTotalMultiplier;
            }
        } else {
            nextXZoomLevel = zoomingCharacteristics.curXZoomLevel - ZOOM_LEVEL_INCREMENT_STEPS;
            nextYZoomLevel = zoomingCharacteristics.curYZoomLevel - ZOOM_LEVEL_INCREMENT_STEPS;

            if (nextXZoomLevel < zoomLevels.xMinZoomLevel) {
                nextXZoomLevel = nextZoomLevels.xMaxZoomLevel;
                xMultiplier = nextFactors.xMarker.xTotalMultiplier;
            } else {
                xMultiplier = zoomingCharacteristics.xTotalMultiplier;
            }

            if (nextYZoomLevel < zoomLevels.yMinZoomLevel) {
                nextYZoomLevel = nextZoomLevels.yMaxZoomLevel;
                yMultiplier = nextFactors.yMarker.yTotalMultiplier;

            } else {
                yMultiplier = zoomingCharacteristics.yTotalMultiplier;
            }
        }
        xGridLines = this.calculateNoOfMarkerLines(xMultiplier);
        yGridLines = this.calculateNoOfMarkerLines(yMultiplier);

        verticalLinesDistance = nextXZoomLevel * gridParameters.distanceBetweenTwoVerticalLines;

        horizontalLineDistance = nextYZoomLevel * gridParameters.distanceBetweenTwoHorizontalLines;

        currentClickedPoint = this.getGridToCanvasCoordinate(refPoint);

        nextOriginPoint.x = currentClickedPoint[0] - refPoint[0] * xGridLines * verticalLinesDistance / xMultiplier;
        nextOriginPoint.y = currentClickedPoint[1] + refPoint[1] * yGridLines * horizontalLineDistance / yMultiplier;

        distance = Math.sqrt(Math.pow(nextOriginPoint.x - curOrigin.x, 2) + Math.pow(nextOriginPoint.y - curOrigin.y, 2));

        angle = this.getAngleBetweenTwoPoints(curOrigin, nextOriginPoint);

        return {
            angle,
            distance
        };
    }

    // Update default values of model data depending upon parameter passed while creating object of class.
    private updateModelData(options?: GridViewOptions) {
        const graphData = this.model.graphData,
            gridLimits = graphData.gridLimits;

        if (options) {
            this.canvasSize.height = options.canvasHeight ? options.canvasHeight : this.$el.height();
            this.canvasSize.width = options.canvasWidth ? options.canvasWidth : this.$el.width();
            if (options.xAxisMinValue && options.xAxisMaxValue) {
                gridLimits.defLimits.xLower = gridLimits.curLimits.xLower = options.xAxisMinValue;
                gridLimits.defLimits.xUpper = gridLimits.curLimits.xUpper = options.xAxisMaxValue;
            }
            if (options.yAxisMinValue && options.yAxisMaxValue) {
                gridLimits.defLimits.yLower = gridLimits.curLimits.xLower = options.yAxisMinValue;
                gridLimits.defLimits.yUpper = gridLimits.curLimits.xUpper = options.yAxisMaxValue;
            }
            if (options.isZoomBehaviourAllowed) {
                this.model.isZoomBehaviourAllowed = options.isZoomBehaviourAllowed;
            }
            if (options.isPanBehaviourAllowed) {
                this.model.isPanBehaviourAllowed = options.isPanBehaviourAllowed;
            }
            if (options.isDoubleClickZoomAllow) {
                graphData.zoomingCharacteristics.isDoubleClickZoomAllow = !options.isDoubleClickZoomAllow;
            }
            if (options.canvasBackgroundColor) {
                this.model.canvasBackgroundColor = options.canvasBackgroundColor;
                this.model.canvasBackgroundAlpha = options.canvasBackgroundAlpha;
            }
        }
    }

    private calculateLimits() {
        const limits = this.model.graphData.gridLimits,
            $canvas = this.$(".grid-graph"),
            xAspectRatio = 800 / Math.abs(limits.defLimits.xUpper - limits.defLimits.xLower),
            yAspectRatio = 600 / Math.abs(limits.defLimits.yUpper - limits.defLimits.yLower);
        let xUnits, yUnits;

        $canvas.width(this.canvasSize.width).height(this.canvasSize.height);
        xUnits = (this.canvasSize.width / xAspectRatio) / 2;
        yUnits = (this.canvasSize.height / yAspectRatio) / 2;
        limits.defLimits.xLower = limits.curLimits.xLower = -xUnits;
        limits.defLimits.xUpper = limits.curLimits.xUpper = xUnits;
        limits.defLimits.yLower = limits.curLimits.yLower = -yUnits;
        limits.defLimits.yUpper = limits.curLimits.yUpper = yUnits;
    }

    private paperSetUp() {
        const $canvas = this.$(".grid-graph"),
            canvas = $canvas[0],
            graphData = this.model.graphData;

        this.paperScope = new PaperScope();
        this.paperTool = new Tool();
        this.paperScope.install($canvas);
        this.paperScope.setup(canvas as HTMLCanvasElement);

        graphData.graphOriginData.defOrigin = new Point(this.canvasSize.width / 2, this.canvasSize.height / 2);
        this.projectLayers.gridBGLayer = this.paperScope.project.activeLayer;
        this.projectLayers.gridLayer = new Layer();
        this.projectLayers.gridLayer.activate();
        this.bindCanvasEvents();
    }

    private bindCanvasEvents() {
        const canvas = this.$(".grid-graph")[0];

        if (this.model.graphData.zoomingCharacteristics.isDoubleClickZoomAllow) {
            canvas.ondblclick = this.doubleClickedOnCanvas.bind(this);
        }
        if (this.model.isPanBehaviourAllowed) {
            this.projectLayers.gridLayer.onMouseDrag = this.mouseDragOnLayer.bind(this);
            this.projectLayers.gridBGLayer.onMouseDrag = this.mouseDragOnLayer.bind(this);
        }

    }

    private panBy(dx: any, dy: any) {
        const graphData = this.model.graphData,
            graphOriginData = graphData.graphOriginData,
            width = this.canvasSize.width,
            height = this.canvasSize.height,
            deltaVar = {
                x: dx,
                y: dy
            };
        graphOriginData.curOrigin.x += deltaVar.x;
        graphOriginData.curOrigin.y += deltaVar.y;
        this.drawGridGraph();
        graphOriginData.isOriginUpdated = true;
        this.graphLimitChangesDuringDragging();
        this.calculateDeltaAngle();
        this.previousOriginPositionOnGrpah = this.getCanvasToGridCoordinate([width, height / 2])[0];
    }

    private graphLimitChangesDuringDragging() {
        const graphData = this.model.graphData,
            curOrigin = graphData.graphOriginData.curOrigin,
            curLimits = graphData.gridLimits.curLimits,
            canvasHeight = this.canvasSize.height,
            canvasWidth = this.canvasSize.width;

        curLimits.yLower = this.getCanvasToGridCoordinate([curOrigin.x, canvasHeight])[1];
        curLimits.yUpper = this.getCanvasToGridCoordinate([curOrigin.x, 0])[1];
        curLimits.xUpper = this.getCanvasToGridCoordinate([canvasWidth, curOrigin.y])[0];
        curLimits.xLower = this.getCanvasToGridCoordinate([0, curOrigin.y])[0];

        this.setBounds();
    }

    private doubleClickedOnCanvas(event: any) {
        this.activateCurScope();

        const graphData = this.model.graphData,
            isDoubleClickZoomAllow = graphData.zoomingCharacteristics.isDoubleClickZoomAllow,
            isZoomBehaviourAllowed = this.model.isZoomBehaviourAllowed,
            graphOriginData = graphData.graphOriginData,
            defOrigin = graphOriginData.defOrigin,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            totalShiftPoint = GRID_MARKER_LINES.DEFAULT.ZOOM_STEPS;
        let i = 1,
            zoomCaller: () => any,
            interval: any,
            clickedPointGraphCoOrdinate: number[];

        if (isZoomBehaviourAllowed && isDoubleClickZoomAllow) {

            graphOriginData.isOriginUpdated = true;
            clickedPointGraphCoOrdinate = this.getCanvasToGridCoordinate([event.x, event.y]);

            zoomCaller = _.bind(function() {
                this.zoomGraph(1, false, false, clickedPointGraphCoOrdinate);
            }, this);

            interval = setInterval(_.bind(function() {
                zoomCaller();
                i++;
                if (i > totalShiftPoint) {
                    clearInterval(interval);
                    zoomingCharacteristics.refPoint = this.getCanvasToGridCoordinate([defOrigin.x, defOrigin.y]);
                }

            }, this), 0.1);
        }
    }

    private createGridBackground() {
        this.projectLayers.gridBGLayer.activate();
        const startingPoint = new Point(0, 0),
            gridSize = new Size(this.canvasSize.width, this.canvasSize.height),
            rectangle = new Rectangle(startingPoint, gridSize),
            shape = Shape.Rectangle(rectangle),
            canvasBackgroundColor = this.model.canvasBackgroundColor;

        shape.fillColor = new Color(canvasBackgroundColor.r, canvasBackgroundColor.g,
            canvasBackgroundColor.b, this.model.canvasBackgroundAlpha);
    }

    private createGridLinesSymbol() {
        const height = this.canvasSize.height,
            width = this.canvasSize.width,
            gridSymbols = this.model.graphData.gridSymbols,
            gridLineStyle = this.model.gridLineStyle;

        gridSymbols.xInnerGridLines =
            this.symbolGenerator(0, height, gridLineStyle.color.xLine.gridLine, gridLineStyle.size.xLine.gridLine);
        gridSymbols.xMarkerLines =
            this.symbolGenerator(0, height, gridLineStyle.color.xLine.markerLine, gridLineStyle.size.xLine.markerLine);

        gridSymbols.yInnerGridLines =
            this.symbolGenerator(width, 0, gridLineStyle.color.yLine.gridLine, gridLineStyle.size.yLine.gridLine);
        gridSymbols.yMarkerLines =
            this.symbolGenerator(width, 0, gridLineStyle.color.yLine.markerLine, gridLineStyle.size.yLine.markerLine);

        gridSymbols.xAxis = this.symbolGenerator(width, 0, gridLineStyle.color.xLine.axisLine, gridLineStyle.size.xLine.axisLine);
        gridSymbols.yAxis = this.symbolGenerator(0, height, gridLineStyle.color.yLine.axisLine, gridLineStyle.size.yLine.axisLine);
    }

    private symbolGenerator(width: number, height: number, strokeColor: any, strokeWidth: number) {
        const axisPath = new Path.Line({
            from: [0, 0],
            strokeColor: new Color(strokeColor),
            strokeWidth,
            to: [width, height]
        }),
            axisSymbol = new Symbol(axisPath);

        axisPath.remove();
        return axisSymbol;
    }

    private setDefaultZoom() {
        const graphData = this.model.graphData,
            gridLimits = graphData.gridLimits,
            defLimits = gridLimits.defLimits,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            gridParameters = graphData.gridParameters,
            factors = ZOOM_FACTORS,
            graphOriginData = graphData.graphOriginData,
            xLower = defLimits.xLower,
            xUpper = defLimits.xUpper,
            yLower = defLimits.yLower,
            yUpper = defLimits.yUpper;

        this.activateCurScope();
        zoomingCharacteristics.xCurrentZoomFactor = zoomingCharacteristics.yCurrentZoomFactor = factors[1];
        zoomingCharacteristics.xZoomMultiplier = zoomingCharacteristics.yZoomMultiplier = 1;
        zoomingCharacteristics.xTotalMultiplier = zoomingCharacteristics.yTotalMultiplier = factors[1];
        gridParameters.yGridLines = 2;
        gridParameters.xGridLines = 2;

        zoomingCharacteristics.zoomLevel = 1;

        graphOriginData.isOriginUpdated = false;

        gridLimits.isLimistUpdated = true;

        this.setGridLimits(xLower, xUpper, yLower, yUpper);
        this.generateEqualizeAxisScales();
        zoomingCharacteristics.refPoint = this.getCanvasToGridCoordinate([graphOriginData.defOrigin.x, graphOriginData.defOrigin.y]);
        this.trigger("zooming");
        this.refreshGridGraph();
    }

    private generateEqualizeAxisScales() {
        const graphData = this.model.graphData,
            canvas = this.canvasSize,
            gridLimits = graphData.gridLimits,
            gridParameters = graphData.gridParameters,
            canvasHeight = canvas.height,
            canvasWidth = canvas.width,
            curOrigin = graphData.graphOriginData.curOrigin,
            defOrigin = graphData.graphOriginData.defOrigin,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            curLimits = gridLimits.curLimits;
        let xLowerMultiplier, xUpperMultiplier, yLowerMultiplier, yUpperMultiplier;

        if (gridLimits.isLimistUpdated === true) {
            if (curOrigin.y < 0) {
                yLowerMultiplier = -1;
                yUpperMultiplier = -1;
            } else if (curOrigin.y > canvasHeight) {
                yLowerMultiplier = 1;
                yUpperMultiplier = 1;
            } else {
                yLowerMultiplier = -1;
                yUpperMultiplier = 1;
            }

            gridParameters.distanceBetweenTwoHorizontalLines = gridParameters.distanceBetweenTwoVerticalLines;
            gridParameters.curDistanceBetweenTwoHorizontalLines = gridParameters.curDistanceBetweenTwoVerticalLines;
            gridParameters.countOfHorizontalLines = canvasHeight / gridParameters.curDistanceBetweenTwoHorizontalLines;

            zoomingCharacteristics.yCurrentZoomFactor = zoomingCharacteristics.xCurrentZoomFactor;
            zoomingCharacteristics.yZoomMultiplier = zoomingCharacteristics.xZoomMultiplier;
            zoomingCharacteristics.yTotalMultiplier = zoomingCharacteristics.xTotalMultiplier;
            gridParameters.yGridLines = gridParameters.xGridLines;

            zoomingCharacteristics.curYZoomLevel = zoomingCharacteristics.curXZoomLevel;

            curLimits.yLower = yLowerMultiplier * (Math.abs(curOrigin.y - canvasHeight) /
                gridParameters.curDistanceBetweenTwoHorizontalLines) / gridParameters.yGridLines *
                zoomingCharacteristics.yTotalMultiplier;
            curLimits.yUpper = yUpperMultiplier * (Math.abs(curOrigin.y) /
                gridParameters.curDistanceBetweenTwoHorizontalLines) / gridParameters.yGridLines *
                zoomingCharacteristics.yTotalMultiplier;

        } else {
            if (curOrigin.x < 0) {
                xLowerMultiplier = 1;
                xUpperMultiplier = 1;
            } else if (curOrigin.x > canvasWidth) {
                xLowerMultiplier = -1;
                xUpperMultiplier = -1;
            } else {
                xLowerMultiplier = -1;
                xUpperMultiplier = 1;
            }

            gridParameters.distanceBetweenTwoVerticalLines = gridParameters.distanceBetweenTwoHorizontalLines;
            gridParameters.curDistanceBetweenTwoVerticalLines = gridParameters.curDistanceBetweenTwoHorizontalLines;
            gridParameters.countOfVerticalLines = canvasWidth / gridParameters.curDistanceBetweenTwoVerticalLines;

            curLimits.xUpper = xUpperMultiplier * (Math.abs(curOrigin.x - canvasWidth) /
                gridParameters.curDistanceBetweenTwoVerticalLines) / gridParameters.xGridLines * zoomingCharacteristics.xTotalMultiplier;
            curLimits.xLower = xLowerMultiplier * (Math.abs(curOrigin.x) /
                gridParameters.curDistanceBetweenTwoHorizontalLines) / gridParameters.xGridLines * zoomingCharacteristics.xTotalMultiplier;
        }

        this.setBounds();

        this.calculateOriginPositionOnGraph();

        this.drawGridGraph();

        zoomingCharacteristics.refPoint = this.getCanvasToGridCoordinate([defOrigin.x, defOrigin.y]);
    }

    private drawGridGraph(supressRedraw?: any) {
        this.activateCurScope();
        this.projectLayers.gridLayer.activate();
        this.drawGraph();
        this.drawAxisLines();
        this.axisMarker();
        this.refreshGridGraph();
    }

    private refreshGridGraph() {
        const currentTime = new Date().getTime();
        let diff;
        const CUT_OFF = 50;

        if (this.lastViewRefresh) {
            diff = currentTime - this.lastViewRefresh;
        }

        if (diff && diff < CUT_OFF) {
            if (this.refreshTimer) {
                return;
            }
            this.refreshTimer = setInterval(_.bind(this.refreshGridGraph, this), CUT_OFF - diff);
            return;
        }

        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        this.lastViewRefresh = currentTime;
        this.paperScope.view.draw();
    }

    private axisMarker() {
        const graphData = this.model.graphData,
            canvas = this.canvasSize,
            gridParameters = graphData.gridParameters,
            height = canvas.height,
            width = canvas.width,
            curOrigin = graphData.graphOriginData.curOrigin,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            xZoomMultiplier = zoomingCharacteristics.xZoomMultiplier,
            yZoomMultiplier = zoomingCharacteristics.yZoomMultiplier,
            markerStyle = MARKER_FONT,
            textColoronCanvas = markerStyle.COLOR.ON_GRAPH_AREA,
            textColorAtEndOfCanvas = markerStyle.COLOR.AT_END_OF_GRAPH_AREA,
            textFontSize = markerStyle.SIZE,
            horizontalAlignment = TEXT_ALIGN.HORIZONTAL,
            vaericalAlignment = TEXT_ALIGN.VERTICAL,
            margin = MARGIN,
            xLabelsMargin = margin["X-LABELS"],
            yLabelsMargin = margin["Y-LABELS"],
            fontFamily = markerStyle.FAMILY,
            fontWeight = markerStyle.WEIGHT,
            xGridLines = gridParameters.xGridLines,
            yGridLines = gridParameters.yGridLines,
            xTotalMultiplier = zoomingCharacteristics.xTotalMultiplier;

        let textFontColor = textColoronCanvas,
            horizontalAlign, verticalAlign, textCo,
            textStyle = {},
            xIncrementFactor, yIncrementFactor,
            lineCounter, curDistanceBetweenTwoVerticalLines,
            countOfVerticalLines, curDistanceBetweenTwoHorizontalLines, countOfHorizontalLines,
            canvasDistanceLeftOfOrigin, canvasLinesLeftOfOrigin, extraCanvasDistance,
            lineCountDecider, markerText, currentMarkerText, textXPosition, textYPosition,
            originDistanceLeftofCanvas, linesLeftOfCanvas, xMarkerFactor, canvasDistanceaboveOfOrigin,
            canvasLinesAboveOfOrigin, originDistanceAboveofCanvas, linesAboveCanvas,
            currNumber, powerValue,
            yTotalMultiplier = zoomingCharacteristics.yTotalMultiplier;

        curDistanceBetweenTwoVerticalLines = gridParameters.curDistanceBetweenTwoVerticalLines;
        countOfVerticalLines = gridParameters.countOfVerticalLines;

        /*condition to decide rank of first line,draw on canvas, from origin*/
        if (curOrigin.x >= 0) {
            canvasDistanceLeftOfOrigin = curOrigin.x;
            canvasLinesLeftOfOrigin = parseInt("" + canvasDistanceLeftOfOrigin / curDistanceBetweenTwoVerticalLines, 10);
            extraCanvasDistance = canvasDistanceLeftOfOrigin - canvasLinesLeftOfOrigin * curDistanceBetweenTwoVerticalLines;
            lineCountDecider = xGridLines - canvasLinesLeftOfOrigin % xGridLines;
            markerText = parseInt("" + canvasLinesLeftOfOrigin / xGridLines, 10);
        } else {
            originDistanceLeftofCanvas = Math.abs(curOrigin.x);
            linesLeftOfCanvas = parseInt("" + originDistanceLeftofCanvas / curDistanceBetweenTwoVerticalLines, 10);
            extraCanvasDistance = curDistanceBetweenTwoVerticalLines -
                (originDistanceLeftofCanvas - linesLeftOfCanvas * curDistanceBetweenTwoVerticalLines);
            lineCountDecider = linesLeftOfCanvas;
            markerText = parseInt("" + linesLeftOfCanvas / xGridLines, 10);

            if (extraCanvasDistance !== 0) {
                lineCountDecider++;
                markerText++;
            }
        }
        xMarkerFactor = xTotalMultiplier;

        if (curOrigin.x >= 0) {
            xMarkerFactor = -xTotalMultiplier;
        }
        xIncrementFactor = 1;

        // x-axis  Marker
        for (lineCounter = 0; lineCounter <= countOfVerticalLines; lineCounter++) {
            horizontalAlign = horizontalAlignment.CENTER;
            verticalAlign = vaericalAlignment.BOTTOM;

            if (lineCountDecider % xGridLines === 0) {

                textXPosition = extraCanvasDistance + lineCounter * curDistanceBetweenTwoVerticalLines;
                textYPosition = curOrigin.y;
                currentMarkerText = this.getPowerOfNumber(markerText * xMarkerFactor, xZoomMultiplier, xMarkerFactor);

                currNumber = currentMarkerText[0];
                powerValue = currentMarkerText[1];

                textYPosition += xLabelsMargin["ON-CANVAS"].TOP;

                this.activateCurScope();

                textCo = this.getToPower10(currNumber, powerValue, new Point(textXPosition, textYPosition), {
                    fontColor: textFontColor,
                    fontSize: textFontSize,
                    justification: horizontalAlign,
                    verticalAlign
                }, false);
                if (currentMarkerText[0] !== 0) {
                    if (textCo.base.x <= 0) {
                        textXPosition = xLabelsMargin["AT-CANVAS-END"].LEFT;
                        horizontalAlign = horizontalAlignment.LEFT;
                    } else if (textCo.base.x + textCo.base.width + textCo.power.width >= width &&
                        textCo.base.x + textCo.base.width / 2 <= width) {
                        textXPosition = width - xLabelsMargin["AT-CANVAS-END"].RIGHT;
                        horizontalAlign = horizontalAlignment.RIGHT;
                    } else if (textCo.base.x + textCo.base.width + textCo.power.width >= width &&
                        textCo.base.x + textCo.base.width / 2 > width) {
                        horizontalAlign = horizontalAlignment.LEFT;
                    }
                } else {
                    textXPosition -= yLabelsMargin["ON-CANVAS"].RIGHT; // to align with y marker
                    horizontalAlign = horizontalAlignment.RIGHT;
                }

                /*if graph is Cartesian then axis are present at canvas ends if origin is not on canvas*/
                if (textCo.base.y < 0 || textCo.power.y < 0) {
                    textYPosition = xLabelsMargin["AT-CANVAS-END"].TOP;
                    textFontColor = textColorAtEndOfCanvas;
                    verticalAlign = vaericalAlignment.BOTTOM;
                } else if (textCo.base.y + textCo.base.height > height) {
                    textYPosition = height - xLabelsMargin["AT-CANVAS-END"].BOTTOM;
                    textFontColor = textColorAtEndOfCanvas;
                    verticalAlign = vaericalAlignment.TOP;
                }

                /*create PointText at corresponding Point*/
                if (curOrigin.y > 0 && curOrigin.y < height && currNumber === 0 || markerText !== 0) {
                    textStyle = {
                        fontColor: textFontColor,
                        fontFamily,
                        fontSize: textFontSize,
                        fontWeight,
                        justification: horizontalAlign,
                        verticalAlign
                    };
                    this.getToPower10(currNumber, powerValue, new Point(textXPosition, textYPosition), textStyle);
                }
                /*if origin is left of canvas then all marker text are positive.*/
                if (curOrigin.x < 0) {
                    markerText += xIncrementFactor;
                } else {
                    markerText -= xIncrementFactor;
                }
            }
            lineCountDecider++;
        }

        curDistanceBetweenTwoHorizontalLines = gridParameters.curDistanceBetweenTwoHorizontalLines;
        countOfHorizontalLines = gridParameters.countOfHorizontalLines;

        if (curOrigin.y >= 0) {
            canvasDistanceaboveOfOrigin = curOrigin.y;
            canvasLinesAboveOfOrigin = parseInt("" + canvasDistanceaboveOfOrigin / curDistanceBetweenTwoHorizontalLines, 10);
            extraCanvasDistance = canvasDistanceaboveOfOrigin - canvasLinesAboveOfOrigin * curDistanceBetweenTwoHorizontalLines;
            lineCountDecider = yGridLines - canvasLinesAboveOfOrigin % yGridLines;
            markerText = parseInt("" + canvasLinesAboveOfOrigin / yGridLines, 10);
        } else {
            originDistanceAboveofCanvas = Math.abs(curOrigin.y);
            linesAboveCanvas = parseInt("" + originDistanceAboveofCanvas / curDistanceBetweenTwoHorizontalLines, 10);
            extraCanvasDistance = curDistanceBetweenTwoHorizontalLines -
                (originDistanceAboveofCanvas - linesAboveCanvas * curDistanceBetweenTwoHorizontalLines);
            lineCountDecider = linesAboveCanvas;
            markerText = parseInt("" + linesAboveCanvas / yGridLines, 10);

            if (extraCanvasDistance !== 0) {
                lineCountDecider++;
                markerText++;
            }
        }

        /*if origin is above canvas all Y-marker values are negative*/
        if (curOrigin.y < 0) {
            yTotalMultiplier = -yTotalMultiplier;
        }
        yIncrementFactor = 1;
        textFontColor = textColoronCanvas;
        /*Calculate MarkerText and its Position of different marker on Y-axis*/

        for (lineCounter = 0; lineCounter <= countOfHorizontalLines; lineCounter++) {

            if (lineCountDecider % yGridLines === 0) {
                verticalAlign = vaericalAlignment.MIDDLE;
                horizontalAlign = horizontalAlignment.RIGHT;
                currentMarkerText = this.getPowerOfNumber(markerText * yTotalMultiplier, yZoomMultiplier, yTotalMultiplier);

                currNumber = currentMarkerText[0];
                powerValue = currentMarkerText[1];

                /*marker Y-Position*/
                textYPosition = extraCanvasDistance + lineCounter * curDistanceBetweenTwoHorizontalLines;
                textXPosition = curOrigin.x - yLabelsMargin["ON-CANVAS"].RIGHT;

                this.activateCurScope();
                /*marker Position Shifting factor if its crossing canvas size*/
                textCo = this.getToPower10(currNumber, powerValue, new Point(textXPosition, textYPosition), {
                    fontColor: textFontColor,
                    fontSize: textFontSize,
                    justification: horizontalAlign,
                    verticalAlign
                }, false);
                if (textCo.base.y + textCo.base.height / 4 <= 0 || textCo.power.y <= 0) {
                    textYPosition = yLabelsMargin["AT-CANVAS-END"].TOP;
                    verticalAlign = vaericalAlignment.BOTTOM;
                } else if (textCo.base.y + textCo.base.height > height) {
                    textYPosition = height - yLabelsMargin["AT-CANVAS-END"].BOTTOM;
                    verticalAlign = vaericalAlignment.TOP;
                }

                /*X-position of markerText*/

                /*if graph is Cartesian then axis are present at canvas ends if origin is not on canvas*/
                if (textCo.base.x < 0) {
                    textXPosition = yLabelsMargin["AT-CANVAS-END"].LEFT;
                    horizontalAlign = horizontalAlignment.LEFT;
                    textFontColor = textColorAtEndOfCanvas;
                } else if (curOrigin.x > width) {
                    textXPosition = width - yLabelsMargin["AT-CANVAS-END"].RIGHT;
                    horizontalAlign = horizontalAlignment.RIGHT;
                    textFontColor = textColorAtEndOfCanvas;
                }

                if (currNumber !== 0) {
                    textStyle = {
                        fontColor: textFontColor,
                        fontFamily,
                        fontSize: textFontSize,
                        fontWeight,
                        justification: horizontalAlign,
                        verticalAlign
                    };
                    /*  if (isProjectorModeOn) {
                          textStyle.strokeWidth = 0.3;
                          textStyle.strokeColor = textFontColor;
                      }*/
                    this.getToPower10(currNumber, powerValue, new Point(textXPosition, textYPosition), textStyle);
                }
                if (curOrigin.y < 0) {
                    markerText += yIncrementFactor;
                } else {
                    markerText -= yIncrementFactor;
                }
            }
            lineCountDecider++;
        }
    }

    private getPowerOfNumber(currNumber: any, tenMultiplier: any, increaseFactor: any) {
        currNumber = parseFloat(currNumber);
        let absNumber, powerValue = 0,
            baseNumber,
            arr, precision = 1;
        const MAX_PRECISION = 10;
        const MIN_PRECISION = 4;
        increaseFactor = Math.abs(increaseFactor);

        while (increaseFactor < 1) {
            precision++;
            increaseFactor *= 10;
        }
        if (currNumber < 0) {
            absNumber = Math.abs(currNumber);
            if (tenMultiplier < 0.0001) {
                while (absNumber < 1) {
                    absNumber *= 10;
                    powerValue--;
                }
            } else if (tenMultiplier > 10000) {
                while (absNumber / 10 >= 1) {
                    absNumber /= 10;
                    powerValue++;
                }
            }
            currNumber = -absNumber;
        } else {
            if (tenMultiplier < 0.0001 && currNumber !== 0) {
                while (currNumber < 1) {
                    currNumber *= 10;
                    powerValue--;
                }
            } else if (tenMultiplier > 10000) {
                while (currNumber / 10 >= 1) {
                    currNumber /= 10;
                    powerValue++;
                }
            }
        }
        baseNumber = currNumber;
        if (precision > MAX_PRECISION) {
            baseNumber = parseFloat(currNumber.toFixed(MAX_PRECISION));
        } else if (precision > MIN_PRECISION) {
            baseNumber = parseFloat(currNumber.toFixed(precision));
        } else {
            baseNumber = parseFloat(currNumber.toFixed(MIN_PRECISION));
        }
        arr = [baseNumber, powerValue];
        return arr;
    }

    private getToPower10(base: any, power: any, point: any, style: any, toBedraw?: any) {
        let tempBase,
            tempPower;
        const strokeColor = style.strokeColor;
        const fontSize = style.fontSize;
        const justification = style.justification;
        const verticalAlign = style.verticalAlign;
        const fillColor = style.fontColor;
        const strokeWidth = style.strokeWidth;
        const fontFamily = style.fontFamily;
        const fontWeight = style.fontWeight;
        let baseHeight, baseWidth, powerWidth;
        const horizontalAlign = TEXT_ALIGN.HORIZONTAL;
        const vericalAlignment = TEXT_ALIGN.VERTICAL;
        let baseCo, powerCo;

        tempBase = new PointText({
            content: base,
            fillColor,
            fontFamily,
            fontWeight,
            justification: "left",
            point,
            strokeColor,
            strokeWidth
        });

        tempPower = new PointText({
            fillColor,
            fontFamily,
            fontWeight,
            justification: "left",
            point: [point.x + tempBase.bounds.width, point.y],
            strokeColor,
            strokeWidth
        });

        if (typeof fontSize !== "undefined") {
            tempBase.fontSize = fontSize;
            tempPower.fontSize = fontSize * 3 / 4;
        }

        if (power !== 0) {
            tempBase.content = tempBase.content + X10_STRING;
            tempPower.content = power;
            tempPower.bounds.x = tempBase.bounds.x + tempBase.bounds.width;
            tempPower.bounds.y = tempBase.bounds.y - tempPower.bounds.height / 4;
        }

        baseHeight = tempBase.bounds.height;
        baseWidth = tempBase.bounds.width;
        powerWidth = tempPower.bounds.width;

        if (verticalAlign === vericalAlignment.MIDDLE) {
            tempBase.bounds.y += baseHeight / 4;
            tempPower.bounds.y += baseHeight / 4;
        } else if (verticalAlign === vericalAlignment.BOTTOM) {
            tempBase.bounds.y += baseHeight / 2;
            tempPower.bounds.y += baseHeight / 2;
        }

        if (justification === horizontalAlign.RIGHT) {
            tempBase.bounds.x -= powerWidth + baseWidth;
            tempPower.bounds.x -= powerWidth + baseWidth;
        } else if (justification === horizontalAlign.CENTER) {
            tempBase.bounds.x -= powerWidth / 2 + baseWidth / 2;
            tempPower.bounds.x -= powerWidth / 2 + baseWidth / 2;
        }

        baseCo = {
            height: tempBase.bounds.height,
            width: tempBase.bounds.width,
            x: tempBase.bounds.x,
            y: tempBase.bounds.y
        };
        powerCo = {
            height: tempPower.bounds.height,
            width: tempPower.bounds.width,
            x: tempPower.bounds.x,
            y: tempPower.bounds.y
        };

        if (toBedraw === false) {
            tempBase.remove();
            tempPower.remove();
        }

        return {
            base: baseCo,
            power: powerCo
        };
    }

    private drawAxisLines() {
        const graphData = this.model.graphData,
            curOrigin = graphData.graphOriginData.curOrigin,
            isAxisLinesVisible = graphData.gridLineBooleans.isAxisLinesVisible,
            canvas = this.canvasSize,
            gridSymbols = graphData.gridSymbols,
            height = canvas.height,
            width = canvas.width;

        this.activateCurScope();
        if (isAxisLinesVisible) {
            gridSymbols.xAxis.place(new Point(width / 2, curOrigin.y)).guide = "true";
            gridSymbols.yAxis.place(new Point(curOrigin.x, height / 2)).guide = "true";
        }
    }

    private drawGraph() {
        this.paperScope.project.activeLayer.removeChildren();

        const graphData = this.model.graphData,
            canvas = this.canvasSize,
            gridParameters = graphData.gridParameters,
            gridSymbols = graphData.gridSymbols,
            isGridLineVisible = graphData.gridLineBooleans.isGridLineVisible,
            height = canvas.height,
            width = canvas.width,
            curOrigin = graphData.graphOriginData.curOrigin,
            xGridLines = gridParameters.xGridLines,
            yGridLines = gridParameters.yGridLines;

        let curDistanceBetweenTwoVerticalLines, countOfVerticalLines,
            canvasDistanceLeftOfOrigin, canvasLinesLeftOfOrigin, xExtraCanvasDistance, lineCounter,
            xlineCountDecider, originDistanceLeftofCanvas, linesLeftOfCanvas,
            curDistanceBetweenTwoHorizontalLines, countOfHorizontalLines,
            canvasDistanceaboveOfOrigin, canvasLinesAboveOfOrigin, yExtraCanvasDistance,
            ylineCountDecider, originDistanceAboveofCanvas, linesAboveCanvas;

        if (isGridLineVisible === true) {
            curDistanceBetweenTwoVerticalLines = gridParameters.curDistanceBetweenTwoVerticalLines;
            countOfVerticalLines = gridParameters.countOfVerticalLines;
            if (curOrigin.x >= 0) {
                canvasDistanceLeftOfOrigin = curOrigin.x;
                canvasLinesLeftOfOrigin = parseInt("" + canvasDistanceLeftOfOrigin / curDistanceBetweenTwoVerticalLines, 10);
                xExtraCanvasDistance = canvasDistanceLeftOfOrigin - canvasLinesLeftOfOrigin * curDistanceBetweenTwoVerticalLines;
                lineCounter = 0;
                xlineCountDecider = xGridLines - canvasLinesLeftOfOrigin % xGridLines;
            } else {
                originDistanceLeftofCanvas = Math.abs(curOrigin.x);
                linesLeftOfCanvas = parseInt("" + originDistanceLeftofCanvas / curDistanceBetweenTwoVerticalLines, 10);
                xExtraCanvasDistance = curDistanceBetweenTwoVerticalLines -
                    (originDistanceLeftofCanvas - linesLeftOfCanvas * curDistanceBetweenTwoVerticalLines);
                lineCounter = 0;
                xlineCountDecider = linesLeftOfCanvas;

                if (xExtraCanvasDistance !== 0) {
                    xlineCountDecider++;
                }
            }

            curDistanceBetweenTwoHorizontalLines = gridParameters.curDistanceBetweenTwoHorizontalLines;
            countOfHorizontalLines = gridParameters.countOfHorizontalLines;

            if (curOrigin.y >= 0) {
                canvasDistanceaboveOfOrigin = curOrigin.y;
                canvasLinesAboveOfOrigin = parseInt("" + canvasDistanceaboveOfOrigin / curDistanceBetweenTwoHorizontalLines, 10);
                yExtraCanvasDistance = canvasDistanceaboveOfOrigin - canvasLinesAboveOfOrigin * curDistanceBetweenTwoHorizontalLines;
                ylineCountDecider = yGridLines - canvasLinesAboveOfOrigin % yGridLines;
            } else {
                originDistanceAboveofCanvas = Math.abs(curOrigin.y);
                linesAboveCanvas = parseInt("" + originDistanceAboveofCanvas / curDistanceBetweenTwoHorizontalLines, 10);
                yExtraCanvasDistance = curDistanceBetweenTwoHorizontalLines -
                    (originDistanceAboveofCanvas - linesAboveCanvas * curDistanceBetweenTwoHorizontalLines);
                ylineCountDecider = linesAboveCanvas;

                if (yExtraCanvasDistance !== 0) {
                    ylineCountDecider++;
                }
            }
            this.activateCurScope();
            for (lineCounter = 0; lineCounter < countOfVerticalLines; lineCounter++ , xlineCountDecider++) {
                if (xlineCountDecider % xGridLines === 0) {
                    gridSymbols.xMarkerLines.place(new Point(xExtraCanvasDistance +
                        lineCounter * curDistanceBetweenTwoVerticalLines, height / 2)).guide = true;
                } else {
                    // gridSymbols.xInnerGridLines.place(new Point(xExtraCanvasDistance + lineCounter *
                    //   curDistanceBetweenTwoVerticalLines, height / 2)).guide = true;
                }
            }

            for (lineCounter = 0; lineCounter < countOfHorizontalLines; lineCounter++ , ylineCountDecider++) {
                if (ylineCountDecider % yGridLines === 0) {
                    gridSymbols.yMarkerLines.place(new Point(width / 2,
                        yExtraCanvasDistance + lineCounter * curDistanceBetweenTwoHorizontalLines)).guide = true;

                } else {

                    // gridSymbols.yInnerGridLines.place(new Point(width / 2,
                    //   yExtraCanvasDistance + lineCounter * curDistanceBetweenTwoHorizontalLines)).guide = true;
                }
            }
        }
    }

    private setGridLimits(xLower: any, xUpper: any, yLower: any, yUpper: any) {
        const graphData = this.model.graphData,
            curLimits = graphData.gridLimits.curLimits,
            graphOriginData = graphData.graphOriginData,
            zoomingCharacteristics = graphData.zoomingCharacteristics;
        let graphCenterPoint, currentGraphOrigin;

        xLower = parseFloat(xLower);
        yLower = parseFloat(yLower);
        xUpper = parseFloat(xUpper);
        yUpper = parseFloat(yUpper);

        if (isNaN(xLower) || isNaN(xUpper) || isNaN(yLower) || isNaN(yUpper) || xLower >= xUpper || yLower >= yUpper) {
            return;
        }

        curLimits.xLower = xLower;
        curLimits.xUpper = xUpper;
        curLimits.yLower = yLower;
        curLimits.yUpper = yUpper;

        this.setDistanceBetweenLines();

        this.calculateOriginPositionOnGraph();

        graphCenterPoint = graphOriginData.defOrigin;
        currentGraphOrigin = graphOriginData.curOrigin;

        zoomingCharacteristics.refPoint = this.getCanvasToGridCoordinate([graphCenterPoint.x, graphCenterPoint.y]);
        graphOriginData.isOriginUpdated = !(graphCenterPoint.x === currentGraphOrigin.x && graphCenterPoint.y === currentGraphOrigin.y);

        this.setBounds();
    }

    private setBounds() {
        const gridMarkerBounds = this.model.gridMarkerBounds;
        const bounds = this.girdMarkerBounds;
        const limits = this.model.graphData.gridLimits.curLimits;

        gridMarkerBounds.max.x = bounds.max.x = limits.xUpper;
        gridMarkerBounds.min.x = bounds.min.x = limits.xLower;
        gridMarkerBounds.max.y = bounds.max.y = limits.yUpper;
        gridMarkerBounds.min.y = bounds.min.y = limits.yLower;

        this.calculateDeltaAngle();
    }

    private calculateDeltaAngle() {
        const graphData = this.model.graphData,
            gridMarkerBounds = this.model.gridMarkerBounds,
            origin = graphData.graphOriginData.curOrigin,
            canvasHeight = this.canvasSize.height,
            canvasWidth = this.canvasSize.width;
        let minAnglePoint, maxAnglePoint, minDeltaAngle, maxDeltaAngle;

        this.activateCurScope();
        if (origin.y < 0) {
            if (origin.x < 0) {
                minAnglePoint = new Point(0, canvasHeight);
                maxAnglePoint = new Point(canvasWidth, 0);
            } else if (origin.x > canvasWidth) {
                minAnglePoint = new Point(0, 0);
                maxAnglePoint = new Point(canvasWidth, canvasHeight);
            } else {
                minAnglePoint = new Point(0, 0);
                maxAnglePoint = new Point(canvasWidth, 0);
            }
        } else if (origin.y > canvasHeight) {
            if (origin.x < 0) {
                minAnglePoint = new Point(canvasWidth, canvasHeight);
                maxAnglePoint = new Point(0, 0);
            } else if (origin.x > canvasWidth) {
                minAnglePoint = new Point(canvasWidth, 0);
                maxAnglePoint = new Point(0, canvasHeight);
            } else {
                minAnglePoint = new Point(canvasWidth, canvasHeight);
                maxAnglePoint = new Point(0, canvasHeight);
            }
        } else {
            if (origin.x < 0) {
                minAnglePoint = new Point(canvasWidth, 0);
                maxAnglePoint = new Point(canvasWidth, canvasHeight);
            } else if (origin.x > canvasWidth) {
                minAnglePoint = new Point(canvasWidth, 0);
                maxAnglePoint = new Point(canvasWidth, canvasHeight);
            } else {
                minAnglePoint = new Point(canvasWidth, 0);
                maxAnglePoint = new Point(canvasWidth, canvasHeight);
            }
        }
        minDeltaAngle = this.getAngleBetweenTwoPoints(origin, minAnglePoint);
        maxDeltaAngle = this.getAngleBetweenTwoPoints(origin, maxAnglePoint);

        this.girdMarkerBounds.max["\\theta"] = gridMarkerBounds.max["\\theta"] = maxDeltaAngle;
        this.girdMarkerBounds.min["\\theta"] = gridMarkerBounds.min["\\theta"] = minDeltaAngle;
    }

    private getAngleBetweenTwoPoints(fromPoint: any, toPoint: any) {
        const height = Math.abs(fromPoint.y - toPoint.y),
            width = Math.abs(fromPoint.x - toPoint.x);
        let angle = Math.atan(width / height);

        if (fromPoint.y < toPoint.y) {
            if (fromPoint.x < toPoint.x) {
                angle = Math.PI * 3 / 2 + angle;
            } else if (fromPoint.x > toPoint.x) {
                angle = Math.PI * 3 / 2 - angle;
            } else {
                angle = Math.PI * 3 / 2;
            }
        } else if (fromPoint.y > toPoint.y) {
            if (fromPoint.x < toPoint.x) {
                angle = Math.PI / 2 - angle;
            } else if (fromPoint.x > toPoint.x) {
                angle = Math.PI / 2 + angle;
            } else {
                angle = Math.PI / 2;
            }
        } else {
            if (fromPoint.x < toPoint.x) {
                angle = 0;
            } else if (fromPoint.x > toPoint.x) {
                angle = Math.PI;
            } else {
                angle = 0;
            }
        }
        return angle;
    }

    private calculateOriginPositionOnGraph() {
        const graphData = this.model.graphData,
            height = this.canvasSize.height,
            width = this.canvasSize.width,
            curLimits = graphData.gridLimits.curLimits,
            gridParameters = graphData.gridParameters,
            xLowerValue = curLimits.xLower,
            yUpperValue = curLimits.yUpper,
            xGridLines = gridParameters.xGridLines,
            yGridLines = gridParameters.yGridLines,
            scope = this.paperScope;
        let xPosition, yPosition;
        xLowerValue >= 0 ? xPosition = -xLowerValue : xPosition = Math.abs(xLowerValue);
        yUpperValue <= 0 ? yPosition = -Math.abs(yUpperValue) : yPosition = Math.abs(yUpperValue);
        graphData.graphOriginData.curOrigin = new Point(xPosition /
            graphData.zoomingCharacteristics.xTotalMultiplier * xGridLines * gridParameters.curDistanceBetweenTwoVerticalLines, yPosition /
            graphData.zoomingCharacteristics.yTotalMultiplier * yGridLines * gridParameters.curDistanceBetweenTwoHorizontalLines);

        this.previousOriginPositionOnGrpah = this.getCanvasToGridCoordinate([width, height / 2])[0];
    }

    private setDistanceBetweenLines() {
        const graphData = this.model.graphData,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            distance = graphData.gridParameters;

        zoomingCharacteristics.curXZoomLevel = this.calculateDistanceAndZoomLevel(false);
        zoomingCharacteristics.curYZoomLevel = this.calculateDistanceAndZoomLevel(true);

        distance.distanceBetweenTwoVerticalLines = distance.distanceBetweenTwoVerticalLines / zoomingCharacteristics.curXZoomLevel;
        distance.distanceBetweenTwoHorizontalLines = distance.distanceBetweenTwoHorizontalLines / zoomingCharacteristics.curYZoomLevel;
    }

    private calculateDistanceAndZoomLevel(isYAxis: boolean) {
        const graphData = this.model.graphData,
            distance = graphData.gridParameters,
            previousIteration = [];
        let modify = false, minMaxFactor, iteration = 1,
            ansObj, zoomLevel,
            isCheck;

        while (!modify) {
            this.updateGridParameters();
            minMaxFactor = this.calculateZoomLevelLimits();
            isCheck = isYAxis ? distance.distanceBetweenTwoHorizontalLines < minMaxFactor.yMinDistance :
                distance.distanceBetweenTwoVerticalLines < minMaxFactor.xMinDistance;
            if (isCheck) {
                isYAxis ? this.yAxisZoomFactorModifier(true) : this.xAxisZoomFactorModifier(true);
                iteration++;
            } else {
                ansObj = isYAxis ? this.getZooomLevelBasedOnDistance(minMaxFactor.yMinDistance, minMaxFactor.yMaxDistance,
                    minMaxFactor.yMinZoomLevel, minMaxFactor.yMaxZoomLevel, distance.distanceBetweenTwoHorizontalLines) :
                    this.getZooomLevelBasedOnDistance(minMaxFactor.xMinDistance, minMaxFactor.xMaxDistance,
                        minMaxFactor.xMinZoomLevel, minMaxFactor.xMaxZoomLevel, distance.distanceBetweenTwoVerticalLines);
                zoomLevel = ansObj.zoomLevel;
                modify = ansObj.modify;
                if (!modify) {
                    isYAxis ? this.yAxisZoomFactorModifier(true) : this.xAxisZoomFactorModifier(true);
                    iteration--;
                }
            }
            if (previousIteration.indexOf(iteration) !== -1) {
                ansObj = isYAxis ? this.getZooomLevelBasedOnDistance(minMaxFactor.yExtraMinDistance, minMaxFactor.yExtraMaxDistance,
                    minMaxFactor.yMinZoomLevel, minMaxFactor.yMaxZoomLevel, distance.distanceBetweenTwoHorizontalLines) :
                    this.getZooomLevelBasedOnDistance(minMaxFactor.xExtraMinDistance, minMaxFactor.xExtraMaxDistance,
                        minMaxFactor.xMinZoomLevel, minMaxFactor.xMaxZoomLevel, distance.distanceBetweenTwoVerticalLines);
                zoomLevel = ansObj.zoomLevel;
                modify = ansObj.modify;
            }
            previousIteration.push(iteration);
        }
        return zoomLevel;
    }

    private getZooomLevelBasedOnDistance(minDistance: any, maxDistance: any, minZoomLevel: any, maxZoomLevel: any, lineDistance: any) {
        let currentZoomLevel = parseFloat(minZoomLevel.toFixed(4)),
            distance0, distance1, zoomLevel, modify;
        const incrementStep = ZOOM_LEVEL_INCREMENT_STEPS;

        while (currentZoomLevel <= maxZoomLevel) {
            distance0 = minZoomLevel / currentZoomLevel * lineDistance;
            distance1 = maxZoomLevel / currentZoomLevel * lineDistance;
            if (distance0 >= minDistance && distance1 <= maxDistance) {
                zoomLevel = currentZoomLevel;
                modify = true;
            }
            currentZoomLevel += incrementStep;
            currentZoomLevel = parseFloat(currentZoomLevel.toFixed(4));
        }
        return {
            modify,
            zoomLevel
        };
    }

    private xAxisZoomFactorModifier(isZoomFactorIncrease: boolean) {
        const graphData = this.model.graphData,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            nextFactors = this.getNextMarkerFactors(isZoomFactorIncrease).xMarker;

        zoomingCharacteristics.xCurrentZoomFactor = nextFactors.xCurrentZoomFactor;
        zoomingCharacteristics.xTotalMultiplier = nextFactors.xTotalMultiplier;
        zoomingCharacteristics.xZoomMultiplier = nextFactors.xZoomMultiplier;
        graphData.gridParameters.xGridLines = this.calculateNoOfMarkerLines(zoomingCharacteristics.xTotalMultiplier);
    }

    private yAxisZoomFactorModifier(isZoomFactorIncrease: boolean) {
        const graphData = this.model.graphData,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            nextFactors = this.getNextMarkerFactors(isZoomFactorIncrease).yMarker;

        zoomingCharacteristics.yCurrentZoomFactor = nextFactors.yCurrentZoomFactor;
        zoomingCharacteristics.yTotalMultiplier = nextFactors.yTotalMultiplier;
        zoomingCharacteristics.yZoomMultiplier = nextFactors.yZoomMultiplier;
        graphData.gridParameters.yGridLines = this.calculateNoOfMarkerLines(zoomingCharacteristics.yTotalMultiplier);
    }

    private getNextMarkerFactors(isIncrease: boolean) {

        const graphData = this.model.graphData,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            factor = ZOOM_FACTORS,
            newMarkerValue = {
                xMarker: {
                    xCurrentZoomFactor: null as number,
                    xTotalMultiplier: null as number,
                    xZoomMultiplier: null as number
                },
                yMarker: {
                    yCurrentZoomFactor: null as number,
                    yTotalMultiplier: null as number,
                    yZoomMultiplier: null as number
                }
            },
            multiplicationFactor = 10;

        switch (zoomingCharacteristics.xCurrentZoomFactor) {
            case factor[0]:
                newMarkerValue.xMarker.xCurrentZoomFactor = isIncrease ? factor[1] : factor[2];
                newMarkerValue.xMarker.xZoomMultiplier = isIncrease ? zoomingCharacteristics.xZoomMultiplier :
                    zoomingCharacteristics.xZoomMultiplier / multiplicationFactor;
                break;

            case factor[1]:
                newMarkerValue.xMarker.xCurrentZoomFactor = isIncrease ? factor[2] : factor[0];
                newMarkerValue.xMarker.xZoomMultiplier = zoomingCharacteristics.xZoomMultiplier;
                break;

            case factor[2]:
                newMarkerValue.xMarker.xCurrentZoomFactor = isIncrease ? factor[0] : factor[1];
                newMarkerValue.xMarker.xZoomMultiplier = isIncrease ? zoomingCharacteristics.xZoomMultiplier * multiplicationFactor :
                    zoomingCharacteristics.xZoomMultiplier;
        }
        newMarkerValue.xMarker.xTotalMultiplier =
            newMarkerValue.xMarker.xCurrentZoomFactor * newMarkerValue.xMarker.xZoomMultiplier;

        switch (zoomingCharacteristics.yCurrentZoomFactor) {
            case factor[0]:
                newMarkerValue.yMarker.yCurrentZoomFactor = isIncrease ? factor[1] : factor[2];
                newMarkerValue.yMarker.yZoomMultiplier = isIncrease ? zoomingCharacteristics.yZoomMultiplier :
                    zoomingCharacteristics.yZoomMultiplier / multiplicationFactor;
                break;

            case factor[1]:
                newMarkerValue.yMarker.yCurrentZoomFactor = isIncrease ? factor[2] : factor[0];
                newMarkerValue.yMarker.yZoomMultiplier = zoomingCharacteristics.yZoomMultiplier;
                break;

            case factor[2]:
                newMarkerValue.yMarker.yCurrentZoomFactor = isIncrease ? factor[0] : factor[1];
                newMarkerValue.yMarker.yZoomMultiplier = isIncrease ? zoomingCharacteristics.yZoomMultiplier * multiplicationFactor :
                    zoomingCharacteristics.yZoomMultiplier;
        }
        newMarkerValue.yMarker.yTotalMultiplier =
            newMarkerValue.yMarker.yCurrentZoomFactor * newMarkerValue.yMarker.yZoomMultiplier;

        return newMarkerValue;
    }

    private updateGridParameters() {
        const graphData = this.model.graphData,
            curLimits = graphData.gridLimits.curLimits,
            gridParameters = graphData.gridParameters;

        let adjacentGridParameters;

        adjacentGridParameters = this.calculateDistanceBetweenAdjacentLines(curLimits.xLower,
            curLimits.xUpper, curLimits.yLower, curLimits.yUpper);

        gridParameters.countOfVerticalLines = adjacentGridParameters.countOfVerticalLines;
        gridParameters.distanceBetweenTwoVerticalLines = gridParameters.curDistanceBetweenTwoVerticalLines
            = adjacentGridParameters.distanceBetweenVerticalLines;
        gridParameters.countOfHorizontalLines = adjacentGridParameters.countOfHorizontalLines;
        gridParameters.distanceBetweenTwoHorizontalLines = gridParameters.curDistanceBetweenTwoHorizontalLines
            = adjacentGridParameters.distanceBetweenHorizontalLines;
    }

    private calculateDistanceBetweenAdjacentLines(xLower: any, xUpper: any, yLower: any, yUpper: any) {
        const height = this.canvasSize.height,
            width = this.canvasSize.width,
            graphData = this.model.graphData,
            gridParameters = graphData.gridParameters,
            xGridLines = gridParameters.xGridLines,
            yGridLines = gridParameters.yGridLines;

        let graphVerticalLines, verticalLineDistance,
            graphHorizontalLines, horizontalineDistance;

        graphVerticalLines = (xUpper - xLower) / graphData.zoomingCharacteristics.xTotalMultiplier * xGridLines;
        verticalLineDistance = width / graphVerticalLines;
        graphHorizontalLines = (yUpper - yLower) / graphData.zoomingCharacteristics.yTotalMultiplier * yGridLines;
        horizontalineDistance = height / graphHorizontalLines;

        return {
            countOfHorizontalLines: graphHorizontalLines,
            countOfVerticalLines: graphVerticalLines,
            distanceBetweenHorizontalLines: horizontalineDistance,
            distanceBetweenVerticalLines: verticalLineDistance
        };
    }

    private calculateZoomLevelLimits(xMultiplierValue?: any, yMultiplierValue?: any) {

        const graphData = this.model.graphData,
            zoomingCharacteristics = graphData.zoomingCharacteristics;

        let xMultiplier = zoomingCharacteristics.xTotalMultiplier,
            yMultiplier = zoomingCharacteristics.yTotalMultiplier,
            xFactors, yFactors, xGridLines, yGridLines;

        xMultiplier = xMultiplierValue || xMultiplier;
        yMultiplier = yMultiplierValue || yMultiplier;

        xGridLines = this.calculateNoOfMarkerLines(xMultiplier);
        yGridLines = this.calculateNoOfMarkerLines(yMultiplier);
        xFactors = this.calculateLineFactors(xGridLines);
        yFactors = this.calculateLineFactors(yGridLines);

        return {
            xExtraMaxDistance: xFactors.extraMaxDistance,
            xExtraMinDistance: xFactors.extraMinDistance,
            xMaxDistance: xFactors.maxDistance,
            xMaxZoomLevel: xFactors.maxZoomLevel,
            xMinDistance: xFactors.minDistance,
            xMinZoomLevel: xFactors.minZoomLevel,
            yExtraMaxDistance: yFactors.extraMaxDistance,
            yExtraMinDistance: yFactors.extraMinDistance,
            yMaxDistance: yFactors.maxDistance,
            yMaxZoomLevel: yFactors.maxZoomLevel,
            yMinDistance: yFactors.minDistance,
            yMinZoomLevel: yFactors.minZoomLevel
        };
    }

    private calculateLineFactors(lines: any) {
        const MarkerLinesObject = GRID_MARKER_LINES,
            stepsforFive = MarkerLinesObject.FIVE_MULTIPLIER.ZOOM_STEPS,
            defaultSteps = MarkerLinesObject.DEFAULT.ZOOM_STEPS,
            minimumZoomLevel = MINIMUM_ZOOM_LEVEL_FACTOR,
            incrementValue = ZOOM_LEVEL_INCREMENT_STEPS,
            adjacentMinDistance = ADJACENT_LINES_MIN_DISTANCE,
            zoomDistance = ZOOM_DISTANCE;

        let minDistance, maxDistance, minZoomLevel, maxZoomLevel, extraMaxDistance, extraMinDistance;

        if (lines === MarkerLinesObject.FIVE_MULTIPLIER) {
            minDistance = adjacentMinDistance;
            maxDistance = minDistance + zoomDistance * stepsforFive;
            minZoomLevel = minimumZoomLevel;
            maxZoomLevel = minZoomLevel + incrementValue * stepsforFive;
            extraMaxDistance = maxDistance + zoomDistance;
            extraMinDistance = minDistance - zoomDistance;
        } else {
            minDistance = adjacentMinDistance + zoomDistance;
            maxDistance = minDistance + zoomDistance * defaultSteps;
            minZoomLevel = minimumZoomLevel + incrementValue;
            maxZoomLevel = minZoomLevel + incrementValue * defaultSteps;
            extraMaxDistance = maxDistance + zoomDistance;
            extraMinDistance = minDistance - zoomDistance;
        }
        return {
            extraMaxDistance,
            extraMinDistance,
            maxDistance,
            maxZoomLevel,
            minDistance,
            minZoomLevel
        };
    }

    private calculateNoOfMarkerLines(textNumber: any) {
        const markerLines = GRID_MARKER_LINES,
            regex = /5/;

        return regex.test(textNumber) ? markerLines.FIVE_MULTIPLIER.MARKER_LINE : markerLines.DEFAULT.MARKER_LINE;
    }

    private activateCurScope() {
        this.paperScope.activate();
    }

    private getNearestCanvasPoint(canvasPoint: any) {
        const gridPoint = this.getCanvasToGridCoordinate(canvasPoint),
            nearestGridPoint = this.getNearestGridPoint(gridPoint);
        return this.getGridToCanvasCoordinate(nearestGridPoint);
    }

    private getNearestGridPoint(point: any) {
        let minDistance,
            counter, currentDistance,
            nearestPoint, diagonalDistance;
        const x = point[0],
            y = point[1],
            closerPoints = this.getNearestGraphPoints(point);

        diagonalDistance = MathUtilityPkg.Utility.distance(closerPoints[0][0], closerPoints[0][1],
            closerPoints[2][0], closerPoints[2][1]) * 0.4;

        for (counter = 0; counter < closerPoints.length; counter++) {
            currentDistance = Math.sqrt(Math.pow(x - closerPoints[counter][0], 2) + Math.pow(y - closerPoints[counter][1], 2));

            if (typeof minDistance !== "number") {
                minDistance = currentDistance;
                nearestPoint = closerPoints[counter];
            } else if (currentDistance < minDistance) {
                minDistance = currentDistance;
                nearestPoint = closerPoints[counter];
            }
        }
        if (minDistance > diagonalDistance) {
            return point;
        }
        return nearestPoint;
    }

    private getNearestGraphPoints(point: any) {
        let smallestXMultiplier, smallestYMultiplier,
            xMin, xMax, yMin, yMax,
            xSignValue = 1,
            ySignValue = 1;

        const x = point[0],
            y = point[1],
            graphData = this.model.graphData,
            xGridLines = graphData.gridParameters.xGridLines,
            yGridLines = graphData.gridParameters.yGridLines,
            xTotalMultiplier = graphData.zoomingCharacteristics.xTotalMultiplier,
            yTotalMultiplier = graphData.zoomingCharacteristics.yTotalMultiplier;

        if (Math.abs(x) !== 0) {
            xSignValue = x / Math.abs(x);
        }
        if (Math.abs(y) !== 0) {
            ySignValue = y / Math.abs(y);
        }

        smallestXMultiplier = xSignValue * xTotalMultiplier / xGridLines;
        smallestYMultiplier = ySignValue * yTotalMultiplier / yGridLines;

        xMin = x % smallestXMultiplier;
        xMax = smallestXMultiplier - xMin;

        yMin = y % smallestYMultiplier;
        yMax = smallestYMultiplier - yMin;

        return [
            [x - xMin, y - yMin],
            [x + xMax, y - yMin],
            [x - xMin, y + yMax],
            [x + xMax, y + yMax]
        ];

    }
}
