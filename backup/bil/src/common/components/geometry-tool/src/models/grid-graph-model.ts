import * as Backbone from "backbone";
import * as _ from "underscore";

export class GridGraphAttributes {
}

export class GridGraph extends Backbone.Model {

    public static GRAPH_DATA: any;
    public static canvasSize: any;

    constructor(attr: GridGraphAttributes) {
        super(attr);
    }

    get canvasBackgroundAlpha(): number { return this.get("canvasBackgroundAlpha"); }
    set canvasBackgroundAlpha(value: number) { this.set("canvasBackgroundAlpha", value); }

    get canvasBackgroundColor(): any { return this.get("canvasBackgroundColor"); }
    set canvasBackgroundColor(value: any) { this.set("canvasBackgroundColor", value); }

    get graphData(): any { return this.get("graphData"); }

    get gridLineStyle(): any { return this.get("gridLineStyle"); }

    get gridMarkerBounds(): any { return this.get("gridMarkerBounds"); }
    set gridMarkerBounds(value: any) { this.set("gridMarkerBounds", value); }

    get isZoomBehaviourAllowed(): boolean { return this.get("isZoomBehaviourAllowed"); }
    set isZoomBehaviourAllowed(value: boolean) { this.set("isZoomBehaviourAllowed", value); }

    get isPanBehaviourAllowed(): boolean { return this.get("isPanBehaviourAllowed"); }
    set isPanBehaviourAllowed(value: boolean) { this.set("isPanBehaviourAllowed", value); }

    public defaults() {
        return {
            canvasBackgroundAlpha: 1,
            canvasBackgroundColor: {
                b: 255,
                g: 255,
                r: 255
            },
            graphData: {
                graphOriginData: {
                    curOrigin: null as any,
                    defOrigin: null as any,
                    isOriginUpdated: false as boolean
                },
                gridLimits: {
                    curLimits: {
                        xLower: -20,
                        xUpper: 20,
                        yLower: -15,
                        yUpper: 15
                    },
                    defLimits: {
                        xLower: -20,
                        xUpper: 20,
                        yLower: -15,
                        yUpper: 15
                    },
                    isLimistUpdated: null as boolean
                },
                gridLineBooleans: {
                    isAxisLinesVisible: true,
                    isGridLineVisible: true
                },
                gridParameters: {
                    countOfHorizontalLines: null as number,
                    countOfVerticalLines: null as number,
                    curDistanceBetweenTwoHorizontalLines: null as number,
                    curDistanceBetweenTwoVerticalLines: null as number,
                    distanceBetweenTwoHorizontalLines: null as number,
                    distanceBetweenTwoVerticalLines: null as number,
                    xGridLines: 2,
                    yGridLines: 2
                },
                gridSymbols: {
                    xAxis: null as any,
                    xInnerGridLines: null as any,
                    xMarkerLines: null as any,
                    yAxis: null as any,
                    yInnerGridLines: null as any,
                    yMarkerLines: null as any
                },
                zoomingCharacteristics: {
                    curXZoomLevel: null as number,
                    curYZoomLevel: null as number,
                    isDoubleClickZoomAllow: true,
                    refPoint: null as any,
                    xCurrentZoomFactor: null as number,
                    xTotalMultiplier: null as number,
                    xZoomMultiplier: null as number,
                    yCurrentZoomFactor: null as number,
                    yTotalMultiplier: null as number,
                    yZoomMultiplier: null as number,
                    zoomLevel: null as number
                }
            },
            gridLineStyle: {
                color: {
                    xLine: {
                        axisLine: [0, 0, 0],
                        axisLineProjector: [0, 0, 0],
                        gridLine: [0.9, 0.9, 0.9],
                        gridLineProjector: [0.8, 0.8, 0.8],
                        markerLine: [0.7, 0.7, 0.7],
                        markerLineProjector: [0.4, 0.4, 0.4]
                    },

                    yLine: {
                        axisLine: [0, 0, 0],
                        axisLineProjector: [0, 0, 0],
                        gridLine: [0.9, 0.9, 0.9],
                        gridLineProjector: [0.8, 0.8, 0.8],
                        markerLine: [0.7, 0.7, 0.7],
                        markerLineProjector: [0.4, 0.4, 0.4]
                    }
                },
                size: {
                    xLine: {
                        axisLine: 1,
                        axisLineProjector: 2,
                        gridLine: 1,
                        gridLineProjector: 2,
                        markerLine: 1,
                        markerLineProjector: 2
                    },

                    yLine: {
                        axisLine: 1,
                        axisLineProjector: 2,
                        gridLine: 1,
                        gridLineProjector: 2,
                        markerLine: 1,
                        markerLineProjector: 2
                    }
                }
            },
            gridMarkerBounds: {
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
            },
            isPanBehaviourAllowed: true,
            isZoomBehaviourAllowed: true
        };
    }
}
