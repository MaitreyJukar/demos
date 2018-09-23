import * as Backbone from "backbone";
import { Path, Point, PointText } from "paper";
import * as _ from "underscore";
import { ArcParameters, ColorProperties, DrawingObject, LabelPoints, ShapeCollection, Styles, StylesType } from "../models/classes";
import * as  DrawingModelPkg from "../models/drawing-model";
import * as MathUtilityPkg from "../models/maths-utility";
import * as  GridGraphViewPkg from "./grid-graph-view";

export class PlotterView extends Backbone.View<Backbone.Model> {
    public labelCount = 0;
    constructor(attr?: Backbone.ViewOptions<Backbone.Model>) {
        super(attr);
        this.render();
    }
    /**
     * checkHitTest
     * @param drawingObject current drawing object
     * @param canvasPoint mouse canvas position
     */
    public static checkHitTest(drawingObject: DrawingObject, canvasPoint: Point): any {
        return drawingObject.paperShapeCollection.paperHitArea.hitTest(canvasPoint);
    }
    public static isColorProperty(property: string): boolean {
        return ["strokeColor", "fillColor"].indexOf(property) > -1;
    }
    public applyStyle(paperObject: Path.Circle | Path.Line | Path | PointText, styles: Styles) {
        let looper: string;

        for (looper in styles) {
            if (styles[looper]) {
                if (PlotterView.isColorProperty(looper)) {
                    paperObject[looper] = styles[looper].color;
                    paperObject[looper].alpha = styles[looper].alpha;
                } else {
                    paperObject[looper] = styles[looper];
                }
            }
        }

        return paperObject;
    }

    /**
     * events
     */
    public events(): Backbone.EventsHash {
        return {};
    }
    /**
     * render
     */
    public render(): PlotterView {
        return this;
    }

    /**
     * drawPointOnGraph
     */
    public drawPointOnGraph(mouseGridPosition: Point, paperPoint: ShapeCollection): ShapeCollection {
        let canvasPosition: Point,
            stylesType: StylesType;

        const paperRadius = 5;
        const paperHitRadius = 10;

        canvasPosition = MathUtilityPkg.Utility.gridToCanvasCoordinate(mouseGridPosition);

        if (!paperPoint) {
            stylesType = DrawingModelPkg.DrawingModel.getStylesForShape("point");

            paperPoint = new ShapeCollection();
            paperPoint.paperShape = this.drawPoint(canvasPosition, paperRadius, stylesType.default);
            paperPoint.paperHitArea = this.drawPoint(canvasPosition, paperHitRadius, stylesType.hitArea);
        } else {
            paperPoint.paperShape.position = canvasPosition;
            paperPoint.paperHitArea.position = canvasPosition;
        }

        return paperPoint;
    }
    /**
     * drawPoint
     */
    public drawPoint(canvasPosition: Point, radius: number, style?: Styles): Path.Circle {
        let point: Path.Circle;

        point = new Path.Circle(canvasPosition, radius);
        point.name = "point";

        if (style) {
            this.applyStyle(point, style);
        }

        return point;
    }

    /**
     * drawSegmentOnGraph
     * @param point1 segment point 1
     * @param point2 segment point 2,
     * @param species drawing type line or segment
     */
    public drawSegmentOnGraph(firstGridPoint: Point, secondGridPoint: Point, species: string): ShapeCollection {
        let firstCanvasPoint: Point,
            secondCanvasPoint: Point,
            paperShapeCollection: ShapeCollection,
            stylesType: StylesType;

        firstCanvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(firstGridPoint);
        secondCanvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(secondGridPoint);

        if (species === "line") {
            const boundary = MathUtilityPkg.Utility.getBoundaryPointsForLine(firstCanvasPoint, secondCanvasPoint);
            firstCanvasPoint = boundary[0];
            secondCanvasPoint = boundary[1];
        }

        paperShapeCollection = new ShapeCollection();
        stylesType = DrawingModelPkg.DrawingModel.getStylesForShape(species);

        paperShapeCollection.paperShape = this.drawSegment(firstCanvasPoint, secondCanvasPoint, stylesType.default);
        paperShapeCollection.paperHitArea = this.drawSegment(firstCanvasPoint, secondCanvasPoint, stylesType.hitArea);

        return paperShapeCollection;
    }
    /**
     * _updateSegmentPoints
     * @param segment segment paper shape collection
     * @param segmentGridPoints segment grid points
     * @param species drawing type line or segment
     */
    public _updateSegmentPoints(segment: ShapeCollection, segmentGridPoints: Point[], species: string) {
        let canvasPoint1: Point,
            canvasPoint2: Point;

        canvasPoint1 = MathUtilityPkg.Utility.gridToCanvasCoordinate(segmentGridPoints[0]);
        canvasPoint2 = MathUtilityPkg.Utility.gridToCanvasCoordinate(segmentGridPoints[1]);

        if (species === "line") {
            const boundary = MathUtilityPkg.Utility.getBoundaryPointsForLine(canvasPoint1, canvasPoint2);
            canvasPoint1 = boundary[0];
            canvasPoint2 = boundary[1];
        }

        segment.paperHitArea.segments[0].point = segment.paperShape.segments[0].point = canvasPoint1;
        segment.paperHitArea.segments[1].point = segment.paperShape.segments[1].point = canvasPoint2;
    }

    public drawSegment(canvasPoint1: Point, canvasPoint2: Point, style?: Styles): Path.Line {
        let line: Path.Line;

        line = new Path.Line(canvasPoint1, canvasPoint2);
        line.name = "line";

        if (style) {
            this.applyStyle(line, style);
        }

        return line;
    }

    public drawAngleArcOnGraph(keyPoints: DrawingObject[]): ShapeCollection {
        let paperShapeCollection: ShapeCollection, angleStylesType: StylesType, labelStylesType: StylesType,
            first: Point, common: Point, last: Point, labelCoords: Point,
            labelText: string, arcParams: ArcParameters;

        first = MathUtilityPkg.Utility.gridToCanvasCoordinate(keyPoints[0].position);
        common = MathUtilityPkg.Utility.gridToCanvasCoordinate(keyPoints[1].position);
        last = MathUtilityPkg.Utility.gridToCanvasCoordinate(keyPoints[2].position);

        arcParams = MathUtilityPkg.Utility.getArcParams(first, common, last);

        paperShapeCollection = new ShapeCollection();
        angleStylesType = DrawingModelPkg.DrawingModel.getStylesForShape("angle");
        labelStylesType = DrawingModelPkg.DrawingModel.getStylesForShape("label");

        labelText = Math.round(arcParams.angle) + "°";
        labelCoords = MathUtilityPkg.Utility.getPointOnLineAfterDistance(common, arcParams.through, 20, false);

        paperShapeCollection.paperShape = this.drawAngleArc(arcParams, angleStylesType.default);
        paperShapeCollection.paperLabel = this.drawLabel(labelCoords, labelText, labelStylesType.default);

        return paperShapeCollection;
    }

    public _updateAngleArcPoints(arc: ShapeCollection, keyPoints: DrawingObject[]) {
        let first: Point, common: Point, last: Point, arcPoints: ArcParameters,
            labelCoords: Point, labelText: string, angleStylesType: StylesType;

        first = MathUtilityPkg.Utility.gridToCanvasCoordinate(keyPoints[0].position);
        common = MathUtilityPkg.Utility.gridToCanvasCoordinate(keyPoints[1].position);
        last = MathUtilityPkg.Utility.gridToCanvasCoordinate(keyPoints[2].position);
        arcPoints = MathUtilityPkg.Utility.getArcParams(first, common, last);

        arc.paperShape.removeChildren();
        arc.paperShape.remove();

        angleStylesType = DrawingModelPkg.DrawingModel.getStylesForShape("angle");
        arc.paperShape = this.drawAngleArc(arcPoints, angleStylesType.default);

        labelText = Math.round(arcPoints.angle) + "°";
        labelCoords = MathUtilityPkg.Utility.getPointOnLineAfterDistance(common, arcPoints.through, 20, false);

        arc.paperLabel.content = labelText;
        arc.paperLabel.position = labelCoords;
    }

    /**
     * @param first first point of first line
     * @param common common point of both lines
     * @param last last point of second line
     */
    public drawAngleArc(arcParams: ArcParameters, style: Styles): Path.Arc {
        let from: Point, through: Point, to: Point, angle: number,
            path: Path | Path.Arc;

        from = arcParams.from;
        through = arcParams.through;
        to = arcParams.to;

        angle = arcParams.angle;

        if (angle === 90) {
            path = new Path();
            path.add(from);
            path.add(through);
            path.add(to);
        } else {
            path = new Path.Arc(from, through, to);
        }

        if (style) {
            this.applyStyle(path, style);
        }

        return path;
    }

    public _updateMeasureLabelOnGraph(shapeCollection: ShapeCollection, drawingObject: DrawingObject) {
        let first: DrawingObject, second: DrawingObject,
            label: string, point: Point, styles: StylesType;

        first = drawingObject.keyPoints[0];
        second = drawingObject.keyPoints[1];
        const labelPoints: LabelPoints = new LabelPoints();
        labelPoints.previous = first;
        labelPoints.current = second;

        label = MathUtilityPkg.Utility.distanceWithPaper(first.position, second.position).toFixed(2);
        point = MathUtilityPkg.Utility.getLabelCoordinate(drawingObject, labelPoints);
        styles = DrawingModelPkg.DrawingModel.getStylesForShape("label");

        shapeCollection.paperLabel.content = label;
        shapeCollection.paperLabel.position = point;
    }
    /**
     * drawMeasurementLabelOnGraph
     * @param segment measurement of segment object
     */
    public drawMeasurementLabelOnGraph(drawingObject: DrawingObject): ShapeCollection {
        let first: DrawingObject, second: DrawingObject, paperShapeCollection: ShapeCollection,
            label: string, point: Point, styles: StylesType, labelPoints: LabelPoints;

        first = drawingObject.keyPoints[0];
        second = drawingObject.keyPoints[1];
        labelPoints = new LabelPoints();
        labelPoints.previous = first;
        labelPoints.current = second;

        label = MathUtilityPkg.Utility.distanceWithPaper(first.position, second.position).toFixed(2);
        point = MathUtilityPkg.Utility.getLabelCoordinate(drawingObject, labelPoints);
        styles = DrawingModelPkg.DrawingModel.getStylesForShape("label");

        paperShapeCollection = new ShapeCollection();
        paperShapeCollection.paperLabel = this.drawLabel(point, label, styles.default);

        return paperShapeCollection;
    }

    /**
     * drawLabelOnGraph
     * @param drawingObject drawing object
     * @param labelPoints drawing object key points to find label coords
     */
    public drawLabelOnGraph(drawingObject: DrawingObject, labelPoints: LabelPoints) {
        let labelText: string, labelCoords: Point, stylesType: StylesType;

        labelText = labelPoints.current.labelText || DrawingModelPkg.DrawingModel.getLabelText(++this.labelCount);
        stylesType = DrawingModelPkg.DrawingModel.getStylesForShape("label");
        labelCoords = MathUtilityPkg.Utility.getLabelCoordinate(drawingObject, labelPoints);

        labelPoints.current.labelGridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(labelCoords);
        labelPoints.current.labelText = labelText;

        labelPoints.current.paperShapeCollection.paperLabel = this.drawLabel(labelCoords, labelText,
            stylesType.default);
    }

    /**
     * updateLabelPosition
     * @param drawingObject point object
     * @param labelPoints point label
     */
    public updateLabelPosition(drawingObject: DrawingObject, labelPoints: LabelPoints) {
        let labelText: string, labelCoords: Point, stylesType: StylesType;

        labelText = labelPoints.current.labelText || DrawingModelPkg.DrawingModel.getLabelText(++this.labelCount);
        stylesType = DrawingModelPkg.DrawingModel.getStylesForShape("label");
        labelCoords = MathUtilityPkg.Utility.getLabelCoordinate(drawingObject, labelPoints);

        labelPoints.current.labelGridPoint = MathUtilityPkg.Utility.canvasToGridCoordinate(labelCoords);
        labelPoints.current.labelText = labelText;

        labelPoints.current.paperShapeCollection.paperLabel.position = labelCoords;
    }

    /**
     * drawLabel
     * @param labelPosition label position
     * @param labelText label text
     * @param style label style
     */
    public drawLabel(labelPosition: Point, labelText: string, style: Styles): PointText {
        let text;

        text = new PointText(labelPosition);
        text.content = labelText;
        text.name = "text";

        if (style) {
            this.applyStyle(text, style);
        }
        return text;
    }
    /**
     * @param canvasPosition position of label on canvas
     * @param label label text
     */
    public addLabel(canvasPosition: Point, label: string): PointText {
        const text = new PointText(canvasPosition);
        text.justification = "center";
        text.fillColor = "black";
        text.fontSize = 12;
        text.content = label;
        text.position = canvasPosition;
        return text;
    }

    /**
     * drawPolygonOnGraph
     * @param segmentGridPoints points to draw polygon
     */
    public drawPolygonOnGraph(segmentGridPoints: Point[]): ShapeCollection {
        let paperShapeCollection: ShapeCollection,
            polygonCanvasPoints: Point[],
            canvasPoint: Point,
            stylesType: StylesType,
            looper: string;

        polygonCanvasPoints = [];

        for (looper in segmentGridPoints) {
            if (segmentGridPoints[looper]) {
                canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(segmentGridPoints[looper]);
                polygonCanvasPoints.push(canvasPoint);
            }
        }

        paperShapeCollection = new ShapeCollection();
        stylesType = DrawingModelPkg.DrawingModel.getStylesForShape("polygon");

        paperShapeCollection.paperShape = this.drawPolygon(polygonCanvasPoints, stylesType.default);
        paperShapeCollection.paperHitArea = this.drawPolygon(polygonCanvasPoints, stylesType.hitArea);

        return paperShapeCollection;
    }

    /**
     * _updatePolygonPoints
     * @param paperShapeCollection polygon paper object
     * @param segmentGridPoints polygon grid points
     */
    public _updatePolygonPoints(paperShapeCollection: ShapeCollection, segmentGridPoints: Point[]) {
        let canvasPoint: Point,
            looper: string;

        for (looper in segmentGridPoints) {
            if (segmentGridPoints[looper]) {
                canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(segmentGridPoints[looper]);

                if (paperShapeCollection.paperShape.segments[looper]) {
                    paperShapeCollection.paperShape.segments[looper].point = canvasPoint;
                    paperShapeCollection.paperHitArea.segments[looper].point = canvasPoint;
                } else {
                    paperShapeCollection.paperShape.add(canvasPoint);
                    paperShapeCollection.paperHitArea.add(canvasPoint);
                }
            }
        }
    }

    public drawPolygon(canvasPoints: Point[], style?: Styles): Path {
        let polygonPath: Path;

        polygonPath = new Path(canvasPoints);
        polygonPath.name = "polygon";

        if (style) {
            this.applyStyle(polygonPath, style);
        }

        return polygonPath;
    }

    public removeDrawing(drawingObject: DrawingObject): any {
        switch (drawingObject.species) {
            case "point":
                if (drawingObject.paperShapeCollection.paperLabel) {
                    drawingObject.paperShapeCollection.paperLabel.remove();
                }
                drawingObject.paperShapeCollection.paperShape.remove();
                drawingObject.paperShapeCollection.paperHitArea.remove();
                break;
            case "line":
            case "segment":
            case "polygon":
                drawingObject.paperShapeCollection.paperShape.remove();
                drawingObject.paperShapeCollection.paperHitArea.remove();
                break;
            case "angle":
            case "length":
                if (drawingObject.paperShapeCollection.paperShape) {
                    drawingObject.paperShapeCollection.paperShape.remove();
                }
                drawingObject.paperShapeCollection.paperLabel.remove();
        }

        drawingObject.paperShapeCollection = null;
    }

    /**
     * changeShapeColor
     * @param drawingObject change color of current drawing object
     * @param strokeColor stroke color to apply
     * @param fillColor fill color to apply
     */
    public changeShapeColor(drawingObject: DrawingObject, strokeColor: ColorProperties, fillColor?: ColorProperties) {
        const type = drawingObject.species;

        switch (type) {
            case "segment":
            case "line":
            case "polygon":
                drawingObject.paperShapeCollection.paperShape.strokeColor = strokeColor.color;
                drawingObject.paperShapeCollection.paperShape.strokeColor.alpha = strokeColor.alpha;
                if (fillColor) {
                    drawingObject.paperShapeCollection.paperShape.fillColor = fillColor.color;
                    drawingObject.paperShapeCollection.paperShape.fillColor.alpha = fillColor.alpha;
                }
                break;
            case "point":
                drawingObject.paperShapeCollection.paperShape.strokeColor = strokeColor.color;
                drawingObject.paperShapeCollection.paperShape.strokeColor.alpha = strokeColor.alpha;
                if (fillColor) {
                    drawingObject.paperShapeCollection.paperShape.fillColor = fillColor.color;
                    drawingObject.paperShapeCollection.paperShape.fillColor.alpha = fillColor.alpha;
                }
                break;
            case "default":
        }
    }
    /**
     * _setVisibility
     */
    public _setVisibility(drawingObject: ShapeCollection, species: string, visible: boolean) {
        if (drawingObject.paperShape) {
            drawingObject.paperShape.visible = visible;
        }
        if (drawingObject.paperHitArea) {
            drawingObject.paperHitArea.visible = visible;
        }
        if (drawingObject.paperLabel) {
            drawingObject.paperLabel.visible = visible;
        }
    }
}
