import { Color, Layer, Point, PointText } from "paper";
import * as RelationModelPkg from "./relation-model";

export class Counters {
    public point: number;
    public segment: number;
    public line: number;
    public polygon: number;
    public angle: number;
    public length: number;
}
export class ColorProperties {
    public alpha: number;
    public color?: string;
}
export class Styles {
    public fillColor?: ColorProperties;
    public opacity?: number;
    public strokeColor?: ColorProperties;
    public strokeWidth?: number;
    public justification?: string;
    public fontSize?: number;
    public fontWeight?: number;
    public font?: string;
}

export class StylesType {
    public default: Styles;
    public drawing?: Styles;
    public hitArea?: Styles;
    public hovered?: Styles;
    public selected?: Styles;
    public numberEdge?: Styles;
    public special?: Styles;
}

export class ShapeStyles {
    public point?: StylesType;
    public segment?: StylesType;
    public line?: StylesType;
    public polygon?: StylesType;
    public label?: StylesType;
    public angle?: StylesType;
}

export class DrawingLayers {
    public service: Layer;
    public drawing: Layer;
}

export class DrawingOptions {
    public mode: string;
    public type: string;
}

export class ShapeCollection {
    public paperShape?: any; // PaperPkg.Point | PaperPkg.Point | PaperPkg.Path.line | PaperPkg.Path;
    public paperHitArea?: any; // PaperPkg.Point | PaperPkg.Point | PaperPkg.Path.line | PaperPkg.Path;
    public paperLabel?: any;
}

export class ArcParameters {
    public from: Point;
    public through: Point;
    public to: Point;
    public angle: number;
}

export class DrawingObject {
    public count: number;
    public id: number;
    public incinerated: boolean;
    public mode: string;
    public type: string;
    public slave: boolean;
    public visible: boolean;
    public drawingComplete: boolean;
    public minPointsNeeded: number;
    public maxPointsNeeded: number;
    public sources: DrawingObject[];
    public offspring: DrawingObject[];
    public keySegments: DrawingObject[];
    public keyPoints: DrawingObject[];
    public position: Point;
    public pointsFinalized: Point[];
    public mouseGridPosition: Point;
    public paperShapeCollection: ShapeCollection;
    public creator: RelationModelPkg.RelationModel;
    public labelText: string;
    public selected: boolean;
    public isDragging: boolean;
    public labelGridPoint: Point;
    public eventDelta: PointDelta;
    public species: string;
}

export class LabelPoints {
    public current?: DrawingObject;
    public previous?: DrawingObject;
    public next?: DrawingObject;
}

export class PointDelta {
    public x: number;
    public y: number;
}

export class ActionData {
    public data?: DrawingObject | DrawingObject[];
    public delta?: PointDelta;
}

export class Coordinate {
    public x: number;
    public y: number;
}
