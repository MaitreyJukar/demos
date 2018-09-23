import * as Backbone from "backbone";
import * as _ from "underscore";
import { DrawingObject, PointDelta } from "./classes";

export class UndoRedoAttributes {
    public mode?: string;
    public type?: string;
    public data?: DrawingObject | DrawingObject[];
    public delta?: PointDelta;
}

export class UndoRedo extends Backbone.Model {
    constructor(attr: UndoRedoAttributes) {
        super(attr);
    }

    public defaults(): UndoRedoAttributes {
        return {
            data: [] as DrawingObject | DrawingObject[],
            delta: null as PointDelta,
            mode: null as string,
            type: null as string
        };
    }

    get mode(): string { return this.get("mode"); }

    set mode(mode: string) { this.set("mode", mode); }

    get type(): string { return this.get("type"); }

    set type(type: string) { this.set("type", type); }

    get drawingObject(): DrawingObject[] { return this.get("drawingObject"); }

    set drawingObject(drawingObject: DrawingObject[]) { this.set("drawingObject", drawingObject); }

    get data(): DrawingObject | DrawingObject[] { return this.get("data"); }

    set data(data: DrawingObject | DrawingObject[]) { this.set("data", data); }

    get delta(): PointDelta { return this.get("delta"); }

    set delta(delta: PointDelta) { this.set("delta", delta); }
}
