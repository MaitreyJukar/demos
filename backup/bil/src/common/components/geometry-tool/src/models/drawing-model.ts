import * as Backbone from "backbone";
import { Color, Layer, PaperScope, Point, Tool } from "paper";
import * as _ from "underscore";
import * as PlotterViewPkg from "../views/plotter-view";
import {
    Counters, DrawingLayers, DrawingObject, DrawingOptions, ShapeStyles, StylesType
} from "./classes";
import * as GridGraphModelPkg from "./grid-graph-model";
import * as MathUtilityPkg from "./maths-utility";
import * as OperationModelPkg from "./operation-model";
import * as RelationModelPkg from "./relation-model";

declare interface ExtWindow extends Window {
    paperScope: any;
}
declare const window: ExtWindow;

export class DrawingAttributes {
    public popUpData?: any;
}

export class DrawingModel extends Backbone.Model {
    public static factoryCount = 0;
    public static styles: ShapeStyles;
    public tool: Tool;

    constructor(attr: DrawingAttributes) {
        super(attr);
        this.initializeStaticData();
        this.popUpData = attr.popUpData;
        this.globalCounters = {
            angle: 0,
            length: 0,
            line: 0,
            point: 0,
            polygon: 0,
            segment: 0
        };
    }

    get popUpData(): any {
        return this.get("popUpData");
    }

    set popUpData(popUpData: any) {
        this.set("popUpData", popUpData);
    }

    public static getLabelText(num: number): string {
        const letter = (nNum: number) => {
            const a = "A".charCodeAt(0);
            return String.fromCharCode(a + nNum - 1);
        };

        let result;
        if (num <= 26) {
            result = letter(num);
        } else {
            const modulo = num % 26,
                quotient = Math.floor(num / 26);
            result = modulo === 0 ? letter(quotient - 1) + letter(26) : letter(quotient) + letter(modulo);
        }
        return result;
    }

    /**
     * getStylesForShape
     * @param species shape type
     */
    public static getStylesForShape(species: string): StylesType {
        return DrawingModel.styles[species];
    }
    /**
     * createOperation
     */
    public createOperation(options: DrawingOptions): any {
        let _undergoingOperation: OperationModelPkg.OperationModel;

        _undergoingOperation = this._undergoingOperation = new OperationModelPkg.OperationModel(options);
        return _undergoingOperation;
    }
    /**
     * canvasSetup setup drawing canvas view
     */
    public canvasSetup($canvas: JQuery<HTMLElement>) {
        $canvas.width(GridGraphModelPkg.GridGraph.canvasSize.width)
            .height(GridGraphModelPkg.GridGraph.canvasSize.height);

        this.canvas = $canvas[0];
    }
    /**
     * setupDrawingScope
     */
    public setupDrawingScope() {
        let _drawingScope: PaperScope;

        this._drawingScope = _drawingScope = new PaperScope();
        _drawingScope.setup(this.canvas as HTMLCanvasElement);
        _drawingScope.activate();
        window.paperScope = _drawingScope;
    }
    /**
     * initializeLayers
     */
    public initializeLayers() {
        this.layers.drawing = new Layer();
        this.layers.service = new Layer();
        this.tool = new Tool();
    }
    /**
     * getFactoryDataObject
     * returns a default object for drawings or transform operation
     */
    public getFactoryDataObject(type: string): DrawingObject {
        let data: DrawingObject;

        data = new DrawingObject();
        data.keyPoints = [];
        data.keySegments = [];
        data.sources = [];
        data.offspring = [];
        data.pointsFinalized = [];
        data.type = type;

        switch (type) {
            case "polygon":
                data.maxPointsNeeded = -1;
                data.minPointsNeeded = 1;
                data.mode = "draw";
                data.species = type;
                break;
            case "segment":
            case "line":
                data.maxPointsNeeded = 2;
                data.minPointsNeeded = 1;
                data.mode = "draw";
                data.species = type;
                break;
            case "point":
                data.maxPointsNeeded = 1;
                data.minPointsNeeded = 0;
                data.mode = "draw";
                data.species = type;
                break;
            case "angle":
                data.minPointsNeeded = -1;
                data.maxPointsNeeded = 3;
                data.mode = "measure";
                data.species = type;
                break;
            case "length":
                data.minPointsNeeded = -1;
                data.maxPointsNeeded = 2;
                data.mode = "measure";
                data.species = type;
                break;
            case "transform":
            case "reflect":
            case "translate":
            case "rotate":
            case "dilate":
                data.maxPointsNeeded = -1;
                data.minPointsNeeded = -1;
                data.mode = "transform";
                break;
            case "default":
        }
        data.id = DrawingModel.factoryCount++;
        return data;
    }

    /**
     * createNewPoint
     */
    public createNewPoint(): DrawingObject {
        let _unsettledPoint: DrawingObject;

        this._unsettledPoint = _unsettledPoint = this.getFactoryDataObject("point");

        return _unsettledPoint;
    }

    /**
     * createNewSegment
     */
    public createNewSegment(): DrawingObject {
        let _unsettledSegment: DrawingObject;

        this._unsettledSegment = _unsettledSegment = this.getFactoryDataObject("segment");

        return _unsettledSegment;
    }
    /**
     * getSegmentGridPoints
     */
    public getSegmentGridPoints(drawingObject: DrawingObject): Point[] {
        let segmentGridPoints: Point[], totalKeyPoints: number, looper: number;

        segmentGridPoints = [];
        totalKeyPoints = drawingObject.keyPoints.length;

        for (looper = 0; looper < totalKeyPoints; looper++) {
            segmentGridPoints.push(drawingObject.keyPoints[looper].position);
        }

        return segmentGridPoints;
    }

    /**
     * updateGlobalCounters
     * @param species drawing type
     */
    public updateGlobalCounters(species: string): number {
        switch (species) {
            case "point":
                return ++this.globalCounters.point;
            case "segment":
                return ++this.globalCounters.segment;
            case "line":
                return ++this.globalCounters.line;
        }
    }

    /**
     * doesShapeAlreadyExists
     * @param drawingObject current drawn shape
     */
    public doesShapeAlreadyExists(drawingObject: DrawingObject): any {
        let looper;
        for (looper in this.drawnShapes) {
            if (this.drawnShapes[looper] && this.drawnShapes[looper] === drawingObject) {
                return true;
            }
        }
        return false;
    }

    /**
     * addSourceOffspring
     * @param drawingObject current drawing object
     */
    public addSourceOffspring(drawingObject: DrawingObject): any {
        let looper: number, totalPoints: number;

        if (drawingObject.species === "point") {
            return;
        }
        totalPoints = drawingObject.keyPoints.length;
        for (looper = 0; looper < totalPoints; looper++) {
            drawingObject.keyPoints[looper].offspring.push(drawingObject);
        }
    }

    /**
     * addOffspringSource
     * @param drawingObject current drawing object
     */
    public addOffspringSource(drawingObject: DrawingObject): any {
        let looper: number, totalPoints: number;

        if (drawingObject.species === "point") {
            return;
        }
        totalPoints = drawingObject.keyPoints.length;
        for (looper = 0; looper < totalPoints; looper++) {
            drawingObject.sources.push(drawingObject.keyPoints[looper]);
        }
    }

    /**
     * addDrawingRelation add drawing object creator or relation
     * @param drawingObject current drawing object
     */
    public addDrawingRelation(drawingObject: DrawingObject) {
        let _currentRelation: RelationModelPkg.RelationModel;
        _currentRelation = this._currentRelation;
        drawingObject.creator = _currentRelation;
    }

    /**
     * defaults
     */
    public defaults() {
        return {
            _currentDrawing: null as DrawingObject,
            _currentRelation: null as RelationModelPkg.RelationModel,
            _dilateHandle: null as DrawingObject,
            _drawingScope: null as PaperScope,
            _selected: [] as DrawingObject[],
            _undergoingOperation: null as OperationModelPkg.OperationModel,
            _unsettledPoint: null as DrawingObject,
            _unsettledSegment: null as DrawingObject,
            canvas: null as HTMLElement,
            deletedShapes: null as DrawingObject[],
            doNotRegisterAction: null as boolean,
            drawnShapes: null as any,
            globalCounters: new Counters(),
            hitObject: null as DrawingObject,
            layers: new DrawingLayers(),
            measureLabels: [] as DrawingObject[],
            plotterView: null as PlotterViewPkg.PlotterView,
            selectedShapeForTransformation: null as DrawingObject
        };
    }
    /**
     * activateScopeAndLayer
     */
    public activateScopeAndLayer() {
        this._drawingScope.activate();
        this.layers.drawing.activate();
    }
    /**
     * initializeStaticData
     */
    private initializeStaticData() {
        // DrawingModel.styles = {
        //     angle: {
        //         default: {
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#424242"
        //             },
        //             strokeWidth: 4
        //         }
        //     },
        //     label: {
        //         default: {
        //             fillColor: {
        //                 alpha: 1,
        //                 color: "#424242"
        //             },
        //             fontSize: 12,
        //             justification: "center"
        //         }
        //     },
        //     line: {
        //         default: {
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#bf6cea"
        //             },
        //             strokeWidth: 4
        //         },
        //         drawing: {
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#424242"
        //             },
        //             strokeWidth: 4
        //         },
        //         hitArea: {
        //             strokeColor: {
        //                 alpha: 0.000001,
        //                 color: "#db490e"
        //             },
        //             strokeWidth: 8
        //         },
        //         hovered: {
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#db490e"
        //             },
        //             strokeWidth: 4
        //         },
        //         selected: {
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#01cc01"
        //             },
        //             strokeWidth: 4
        //         }
        //     },
        //     point: {
        //         default: {
        //             fillColor: {
        //                 alpha: 1,
        //                 color: "#bf6cea"
        //             },
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#bf6cea"
        //             },
        //             strokeWidth: 2
        //         },
        //         drawing: {
        //             fillColor: {
        //                 alpha: 1,
        //                 color: "#424242"
        //             },
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#424242"
        //             },
        //             strokeWidth: 2
        //         },
        //         hitArea: {
        //             fillColor: {
        //                 alpha: 0.000001,
        //                 color: "#db490e"
        //             },
        //             strokeColor: {
        //                 alpha: 0.000001,
        //                 color: "#db490e"
        //             },
        //             strokeWidth: 2
        //         },
        //         hovered: {
        //             fillColor: {
        //                 alpha: 1,
        //                 color: "#db490e"
        //             },
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#db490e"
        //             },
        //             strokeWidth: 2
        //         },
        //         selected: {
        //             fillColor: {
        //                 alpha: 1,
        //                 color: "#01cc01"
        //             },
        //             strokeColor: {
        //                 alpha: 1,
        //                 color: "#01cc01"
        //             },
        //             strokeWidth: 2
        //         }
        //     },
        //     polygon: {
        //         default: {
        //             fillColor: {
        //                 alpha: 0.3,
        //                 color: "#424242"
        //             },
        //             strokeColor: {
        //                 alpha: 0,
        //                 color: "#bf6cea"
        //             },
        //             strokeWidth: 0
        //         },
        //         drawing: {
        //             fillColor: {
        //                 alpha: 0.3,
        //                 color: "#424242"
        //             },
        //             strokeColor: {
        //                 alpha: 0,
        //                 color: "#424242"
        //             },
        //             strokeWidth: 0
        //         },
        //         hitArea: {
        //             fillColor: {
        //                 alpha: 0.000001,
        //                 color: "#db490e"
        //             },
        //             strokeColor: {
        //                 alpha: 0,
        //                 color: "#db490e"
        //             },
        //             strokeWidth: 0
        //         },
        //         hovered: {
        //             fillColor: {
        //                 alpha: 0.3,
        //                 color: "#db490e"
        //             },
        //             strokeColor: {
        //                 alpha: 0,
        //                 color: "#db490e"
        //             },
        //             strokeWidth: 0
        //         },
        //         selected: {
        //             fillColor: {
        //                 alpha: 0.3,
        //                 color: "#01cc01"
        //             },
        //             strokeColor: {
        //                 alpha: 0,
        //                 color: "#01cc01"
        //             },
        //             strokeWidth: 0
        //         }
        //     }
        // };
        DrawingModel.styles = {
            angle: {
                default: {
                    strokeColor: {
                        alpha: 1,
                        color: "#ca3c3c"
                    },
                    strokeWidth: 4
                }
            },
            label: {
                default: {
                    fillColor: {
                        alpha: 1,
                        color: "#424242"
                    },
                    font: "Source Sans Pro",
                    fontSize: 18,
                    fontWeight: 600,
                    justification: "center"
                }
            },
            line: {
                default: {
                    strokeColor: {
                        alpha: 1,
                        color: "#c9c9c9"
                    },
                    strokeWidth: 4
                },
                drawing: {
                    strokeColor: {
                        alpha: 1,
                        color: "#ed6e6e"
                    },
                    strokeWidth: 4
                },
                hitArea: {
                    strokeColor: {
                        alpha: 0.000001,
                        color: "#fe4747"
                    },
                    strokeWidth: 8
                },
                hovered: {
                    strokeColor: {
                        alpha: 1,
                        color: "#fe4747"
                    },
                    strokeWidth: 4
                },
                selected: {
                    strokeColor: {
                        alpha: 1,
                        color: "#ca3c3c"
                    },
                    strokeWidth: 4
                }
            },
            point: {
                default: {
                    fillColor: {
                        alpha: 1,
                        color: "#c9c9c9"
                    },
                    strokeColor: {
                        alpha: 1,
                        color: "#c9c9c9"
                    },
                    strokeWidth: 2
                },
                drawing: {
                    fillColor: {
                        alpha: 1,
                        color: "#ed6e6e"
                    },
                    strokeColor: {
                        alpha: 1,
                        color: "#ed6e6e"
                    },
                    strokeWidth: 2
                },
                hitArea: {
                    fillColor: {
                        alpha: 0.000001,
                        color: "#fe4747"
                    },
                    strokeColor: {
                        alpha: 0.000001,
                        color: "#fe4747"
                    },
                    strokeWidth: 2
                },
                hovered: {
                    fillColor: {
                        alpha: 1,
                        color: "#fe4747"
                    },
                    strokeColor: {
                        alpha: 1,
                        color: "#fe4747"
                    },
                    strokeWidth: 2
                },
                selected: {
                    fillColor: {
                        alpha: 1,
                        color: "#ca3c3c"
                    },
                    strokeColor: {
                        alpha: 1,
                        color: "#ca3c3c"
                    },
                    strokeWidth: 2
                }
            },
            polygon: {
                default: {
                    fillColor: {
                        alpha: 0.24,
                        color: "#c9c9c9"
                    },
                    strokeColor: {
                        alpha: 0,
                        color: "#c9c9c9"
                    },
                    strokeWidth: 0
                },
                drawing: {
                    fillColor: {
                        alpha: 0.24,
                        color: "#ed6e6e"
                    },
                    strokeColor: {
                        alpha: 0,
                        color: "#ed6e6e"
                    },
                    strokeWidth: 0
                },
                hitArea: {
                    fillColor: {
                        alpha: 0.000001,
                        color: "#ed6e6e"
                    },
                    strokeColor: {
                        alpha: 0,
                        color: "#ed6e6e"
                    },
                    strokeWidth: 0
                },
                hovered: {
                    fillColor: {
                        alpha: 0.5,
                        color: "#ed6e6e"
                    },
                    strokeColor: {
                        alpha: 0,
                        color: "#ed6e6e"
                    },
                    strokeWidth: 0
                },
                selected: {
                    fillColor: {
                        alpha: 0.75,
                        color: "#ed6e6e"
                    },
                    strokeColor: {
                        alpha: 0,
                        color: "#ed6e6e"
                    },
                    strokeWidth: 0
                }
            }
        };
        DrawingModel.styles.segment = DrawingModel.styles.line;
    }
    get measureLabels(): any {
        return this.get("measureLabels");
    }

    set measureLabels(measureLabels: any) {
        this.set("measureLabels", measureLabels);
    }

    get _undergoingOperation(): OperationModelPkg.OperationModel {
        return this.get("_undergoingOperation");
    }

    set _undergoingOperation(_undergoingOperation: OperationModelPkg.OperationModel) {
        this.set("_undergoingOperation", _undergoingOperation);
    }

    get _currentRelation(): RelationModelPkg.RelationModel {
        return this.get("_currentRelation");
    }

    set _currentRelation(_currentRelation: RelationModelPkg.RelationModel) {
        this.set("_currentRelation", _currentRelation);
    }

    get _currentDrawing(): DrawingObject {
        return this.get("_currentDrawing");
    }

    set _currentDrawing(_currentDrawing: DrawingObject) {
        this.set("_currentDrawing", _currentDrawing);
    }

    get _unsettledPoint(): DrawingObject {
        return this.get("_unsettledPoint");
    }

    set _unsettledPoint(_unsettledPoint: DrawingObject) {
        this.set("_unsettledPoint", _unsettledPoint);
    }

    get layers(): DrawingLayers {
        return this.get("layers");
    }

    set layers(layers: DrawingLayers) {
        this.set("layers", layers);
    }

    get plotterView(): PlotterViewPkg.PlotterView {
        return this.get("plotterView");
    }

    set plotterView(plotterView: PlotterViewPkg.PlotterView) {
        this.set("plotterView", plotterView);
    }

    get drawnShapes(): any {
        return this.get("drawnShapes");
    }

    set drawnShapes(drawnShapes: any) {
        this.set("drawnShapes", drawnShapes);
    }

    get globalCounter(): Counters {
        return this.get("globalCounter");
    }

    set globalCounter(globalCounter: Counters) {
        this.set("globalCounter", globalCounter);
    }

    get canvas(): HTMLElement {
        return this.get("canvas");
    }

    set canvas(canvas: HTMLElement) {
        this.set("canvas", canvas);
    }

    get _drawingScope(): PaperScope {
        return this.get("_drawingScope");
    }

    set _drawingScope(_drawingScope: PaperScope) {
        this.set("_drawingScope", _drawingScope);
    }

    get globalCounters(): Counters {
        return this.get("globalCounters");
    }

    set globalCounters(globalCounters: Counters) {
        this.set("globalCounters", globalCounters);
    }

    get doNotRegisterAction(): boolean {
        return this.get("doNotRegisterAction");
    }

    set doNotRegisterAction(doNotRegisterAction: boolean) {
        this.set("doNotRegisterAction", doNotRegisterAction);
    }

    get _unsettledSegment(): DrawingObject {
        return this.get("_unsettledSegment");
    }

    set _unsettledSegment(_unsettledSegment: DrawingObject) {
        this.set("_unsettledSegment", _unsettledSegment);
    }

    get _selected(): DrawingObject[] {
        return this.get("_selected");
    }

    set _selected(_selected: DrawingObject[]) {
        this.set("_selected", _selected);
    }

    get hitObject(): DrawingObject {
        return this.get("hitObject");
    }

    set hitObject(hitObject: DrawingObject) {
        this.set("hitObject", hitObject);
    }

    get deletedShapes(): DrawingObject[] {
        return this.get("deletedShapes");
    }

    set deletedShapes(deletedShapes: DrawingObject[]) {
        this.set("deletedShapes", deletedShapes);
    }

    get _dilateHandle(): DrawingObject {
        return this.get("_dilateHandle");
    }

    set _dilateHandle(_dilateHandle: DrawingObject) {
        this.set("_dilateHandle", _dilateHandle);
    }

    get selectedShapeForTransformation(): DrawingObject {
        return this.get("selectedShapeForTransformation");
    }

    set selectedShapeForTransformation(selectedShapeForTransformation: DrawingObject) {
        this.set("selectedShapeForTransformation", selectedShapeForTransformation);
    }
}
