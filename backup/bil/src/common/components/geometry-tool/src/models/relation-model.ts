import * as Backbone from "backbone";
import { Point } from "paper";
import * as _ from "underscore";
import * as PlotterViewPkg from "../views/plotter-view";
import { DrawingObject } from "./classes";
import * as MathUtilityPkg from "./maths-utility";

export class RelationAttributes {
    public mode: string;
    public type: string;
    public sources: DrawingObject[];
    public offspring: DrawingObject;
}

export class RelationModel extends Backbone.Model {
    constructor(attr: RelationAttributes) {
        super(attr);
    }

    public defaults(): RelationAttributes {
        return {
            mode: null as string,
            offspring: null as DrawingObject,
            sources: [] as DrawingObject[],
            type: null as string
        };
    }

    /**
     * addSources
     * @param drawingObject drawing source point
     */
    public addSources(drawingObject: DrawingObject) {
        if (this.type === "point" || this.type === "polygon" && drawingObject.type === "point") {
            return;
        }
        this.sources.push(drawingObject);
    }

    /**
     * addOffspring
     * @param drawingObject relation offspring drawing object
     */
    public addOffspring(drawingObject: DrawingObject) {
        this.offspring = drawingObject;
    }

    /**
     * isFirstCoincidentPoint
     * @param drawingObject polygon drawing object
     */
    public isFirstCoincidentPoint(drawingObject: DrawingObject): any {
        let canvasPoint: Point;

        canvasPoint = MathUtilityPkg.Utility.gridToCanvasCoordinate(drawingObject.mouseGridPosition);
        return drawingObject.keyPoints.length > 2 &&
            PlotterViewPkg.PlotterView.checkHitTest(drawingObject.keyPoints[0], canvasPoint);
    }
    /**
     * isMature
     * @param drawingObject current drawing object
     */
    public isMature(drawingObject: DrawingObject): boolean {
        const mode = drawingObject.mode,
            type = drawingObject.type,
            species = drawingObject.species;

        switch (mode) {
            case "draw":
                switch (species) {
                    case "point":
                        return true;
                    case "segment":
                    case "line":
                        return this.sources.length === drawingObject.maxPointsNeeded;
                    case "polygon":
                        return this.isFirstCoincidentPoint(drawingObject);
                }
                break;
            case "measure":
                return this.sources.length === drawingObject.maxPointsNeeded;
            case "transform":
                return this.sources.length > 0;

        }
    }

    get mode(): string { return this.get("mode"); }

    set mode(mode: string) { this.set("mode", mode); }

    get offspring(): DrawingObject { return this.get("offspring"); }

    set offspring(offspring: DrawingObject) { this.set("offspring", offspring); }

    get sources(): DrawingObject[] { return this.get("sources"); }

    set sources(sources: DrawingObject[]) { this.set("sources", sources); }

    get type(): string { return this.get("type"); }

    set type(type: string) { this.set("type", type); }
}
