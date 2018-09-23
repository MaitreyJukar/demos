import * as Backbone from "backbone";
import * as _ from "underscore";
import {
    DrawingObject, DrawingOptions
} from "./classes";
import * as RelationModelPkg from "./relation-model";

export class OperationAttributes {
    public mode?: string;
    public type?: string;
    public drawingObject?: DrawingObject;
    public relation?: RelationModelPkg.RelationModel;
}

export class OperationModel extends Backbone.Model {
    constructor(attr: OperationAttributes) {
        super(attr);
    }
    /**
     * defaults
     */
    public defaults(): OperationAttributes {
        return {
            drawingObject: null as DrawingObject,
            mode: null as string,
            relation: null as RelationModelPkg.RelationModel,
            type: null as string
        };
    }
    /**
     * setDrawingObject
     * @param _currentDrawing current drawing object
     */
    public setDrawingObject(_currentDrawing: DrawingObject): any {
        this.drawingObject = _currentDrawing;
    }
    /**
     * setRelationObject
     * @param _currentRelation current relation
     */
    public setRelation(_currentRelation: RelationModelPkg.RelationModel): any {
        this.relation = _currentRelation;
    }
    /**
     * abortOperation
     */
    public abortOperation(): any {
        this.mode = null;
        this.type = null;
        this.drawingObject = null;
        this.relation = null;
    }
    /**
     * isDrawingMode returns true if current mode is drawing or transform
     */
    public isDrawingMode(): boolean {
        return ["draw", "measure", "transform"].indexOf(this.mode) > -1;
    }

    get drawingObject(): DrawingObject { return this.get("drawingObject"); }

    set drawingObject(drawingObject: DrawingObject) { this.set("drawingObject", drawingObject); }

    get mode(): string { return this.get("mode"); }

    set mode(mode: string) { this.set("mode", mode); }

    get relation(): RelationModelPkg.RelationModel { return this.get("relation"); }

    set relation(relation: RelationModelPkg.RelationModel) { this.set("relation", relation); }

    get type(): string { return this.get("type"); }

    set type(type: string) { this.set("type", type); }
}
