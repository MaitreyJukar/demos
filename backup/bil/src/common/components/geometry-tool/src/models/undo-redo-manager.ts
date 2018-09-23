import * as Backbone from "backbone";
import * as _ from "underscore";
import { ActionData, DrawingObject, DrawingOptions, PointDelta } from "./classes";
import * as OperationModelPkg from "./operation-model";
import * as UndoRedoPkg from "./undo-redo";

export class UndoRedoManagerAttributes {
    public _undoRedoStack?: UndoRedoPkg.UndoRedo[];
    public _undoRedoPointer?: number;
}

export class UndoRedoManager extends Backbone.Model {
    constructor(attr: UndoRedoManagerAttributes) {
        super(attr);
    }

    public defaults(): UndoRedoManagerAttributes {
        return {
            _undoRedoPointer: -1 as number,
            _undoRedoStack: [] as UndoRedoPkg.UndoRedo[]
        };
    }
    /**
     * _registerAction
     * @param _undergoingOperation undergoing operation
     * @param actionData action data for undo redo
     */
    public _registerAction(_undergoingOperation: OperationModelPkg.OperationModel, actionData: ActionData) {
        let _undoRedoData: UndoRedoPkg.UndoRedo;

        const mode = _undergoingOperation.mode,
            type = _undergoingOperation.type;

        _undoRedoData = new UndoRedoPkg.UndoRedo({
            data: actionData.data as DrawingObject | DrawingObject[],
            delta: actionData.delta,
            mode,
            type
        });

        this.updateUndoRedoStack(_undoRedoData);
        this.updateUndoRedoPointer(_undoRedoData);
    }

    /**
     * udpateUndoRedoStack
     * @param _undoRedoData undo redo data
     */
    public updateUndoRedoStack(_undoRedoData: UndoRedoPkg.UndoRedo) {
        let _undoRedoStack: UndoRedoPkg.UndoRedo[],
            _undoRedoPointer: number;

        _undoRedoStack = this._undoRedoStack;
        _undoRedoPointer = this._undoRedoPointer;

        _undoRedoStack.splice(_undoRedoPointer + 1);

        _undoRedoStack.push(_undoRedoData);
    }

    /**
     * updateUndoRedoPointer
     */
    public updateUndoRedoPointer(_undoRedoData: UndoRedoPkg.UndoRedo) {
        const mode = _undoRedoData.mode,
            type = _undoRedoData.type;

        let _undoRedoStack: UndoRedoPkg.UndoRedo[];

        _undoRedoStack = this._undoRedoStack;

        switch (mode) {
            case "draw":
            case "measure":
            case "transform":
                this._undoRedoPointer = this._undoRedoStack.indexOf(_undoRedoData);
                break;
            case "action":
                switch (type) {
                    case "delete":
                    case "clear":
                    case "move":
                        this._undoRedoPointer = this._undoRedoStack.indexOf(_undoRedoData);
                        break;
                    case "undo":
                        if (_undoRedoStack && this._undoRedoPointer > -1) {
                            this._undoRedoPointer -= 1;
                        }
                        break;
                    case "redo":
                        if (_undoRedoStack && this._undoRedoPointer < _undoRedoStack.length) {
                            this._undoRedoPointer += 1;
                        }
                }
        }
    }

    /**
     * canPerformUndoRedoAction check if we can perform undo redo action
     * @param type action type
     */
    public canPerformUndoRedoAction(type: string): boolean {
        const _undoRedoStack = this._undoRedoStack,
            _undoRedoPointer = this._undoRedoPointer;

        return _undoRedoStack && _undoRedoStack.length > 0 && (type === "undo" && _undoRedoPointer !== -1 ||
            type === "redo" && _undoRedoStack.length - 1 !== _undoRedoPointer);
    }

    /**
     * undoRedo
     * @param options action options
     */
    public undoRedo(options: DrawingOptions) {
        let _undoRedoData: UndoRedoPkg.UndoRedo,
            _undoRedoStack: UndoRedoPkg.UndoRedo[];
        const mode = options.mode,
            type = options.type;

        if (!this.canPerformUndoRedoAction(type)) {
            return;
        }

        _undoRedoStack = this._undoRedoStack;
        this.updateUndoRedoPointer(options as UndoRedoPkg.UndoRedo);

        if (type === "undo") {

            _undoRedoData = _undoRedoStack[this._undoRedoPointer + 1];
            this._revertAction(_undoRedoData);

        } else if (type === "redo") {

            _undoRedoData = _undoRedoStack[this._undoRedoPointer];
            this._advanceAction(_undoRedoData);

        }
    }

    /**
     * _advanceAction
     * @param _undoRedoData undo redo data
     */
    public _advanceAction(_undoRedoData: UndoRedoPkg.UndoRedo) {
        const mode = _undoRedoData.mode,
            type = _undoRedoData.type;

        let looper: number, totalDrawingObjects: number, delta: PointDelta;

        switch (mode) {
            case "draw":
            case "measure":
            case "transform":
                this.trigger("reviveDrawing", _undoRedoData.data as DrawingObject);
                break;
            case "action":
                switch (type) {
                    case "clear":
                    case "delete":
                        totalDrawingObjects = (_undoRedoData.data as DrawingObject[]).length;
                        for (looper = 0; looper < totalDrawingObjects; looper++) {
                            this.trigger("removeDrawing", _undoRedoData.data[looper] as DrawingObject);
                        }
                        break;
                    case "move":
                        delta = {
                            x: _undoRedoData.delta.x,
                            y: _undoRedoData.delta.y
                        };
                        this.trigger("updateShape", _undoRedoData.data, delta);
                }
        }
    }
    /**
     * _revertAction
     * @param _undoRedoData undo redo data
     */
    public _revertAction(_undoRedoData: UndoRedoPkg.UndoRedo) {
        const mode = _undoRedoData.mode, type = _undoRedoData.type;

        let looper: number, totalDrawingObjects: number, delta: PointDelta;

        switch (mode) {
            case "draw":
            case "measure":
            case "transform":
                this.trigger("removeDrawing", _undoRedoData.data as DrawingObject);
                break;
            case "action":
                switch (type) {
                    case "clear":
                    case "delete":
                        totalDrawingObjects = (_undoRedoData.data as DrawingObject[]).length;
                        for (looper = 0; looper < totalDrawingObjects; looper++) {
                            this.trigger("reviveDrawing", _undoRedoData.data[looper] as DrawingObject);
                        }
                        break;
                    case "move":
                        delta = {
                            x: -_undoRedoData.delta.x,
                            y: -_undoRedoData.delta.y
                        };
                        this.trigger("updateShape", _undoRedoData.data, delta);
                }
        }
    }

    get _undoRedoStack(): UndoRedoPkg.UndoRedo[] { return this.get("_undoRedoStack"); }

    set _undoRedoStack(_undoRedoStack: UndoRedoPkg.UndoRedo[]) { this.set("_undoRedoStack", _undoRedoStack); }

    get _undoRedoPointer(): number { return this.get("_undoRedoPointer"); }

    set _undoRedoPointer(_undoRedoPointer: number) { this.set("_undoRedoPointer", _undoRedoPointer); }
}
