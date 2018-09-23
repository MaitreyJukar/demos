import * as Backbone from "backbone";
// tslint:disable-next-line:no-import-side-effect
import "jqueryui";
// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jquery-ui-touch-punch";
import * as _ from "underscore";
import "../../css/designer.styl";
import * as KaleidoscopePkg from "../models/kaleidoscope";

const designerTpl: (attr?: any) => string = require("./../../tpl/designer.hbs");

const KEYCODES = {
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    UP: 38
};

declare class MoveParams {
    public x: number;
    public y: number;
}

export class Designer extends Backbone.View<KaleidoscopePkg.Kaleidoscope> {

    private _timer: number = null;

    private _generator: any;

    constructor(attr?: Backbone.ViewOptions<KaleidoscopePkg.Kaleidoscope>) {
        super(attr);
        this.render();
        this._setInitialValues();
        this._makeTriangleDraggable();
        this._updateImage();
        this._updateTriangle();
        this._attachListeners();
        if (this.model.auto) {
            this._keepMoving();
        }
    }

    public events(): Backbone.EventsHash {
        return {
            "click .auto": this._toggleAuto.bind(this)
        };
    }

    public render(): Designer {
        this.$el.html(designerTpl({
            auto: this.model.auto,
            selectedImg: this.model.image
        }));
        return this;
    }

    private _setInitialValues() {
        function* _infiniteSequence() {
            let index = 0;
            while (true) {
                yield (index++ % 2) ? this._keepMoving.bind(this) : this._stopMoving.bind(this);
            }
        }
        this._generator = _infiniteSequence.bind(this)();
        return this;
    }

    private _attachListeners() {
        this.listenTo(this.model, "change:angle", this._updateTriangle.bind(this));
        this.listenTo(this.model, "change:image", this._updateImage.bind(this));
        this._attachKeyboardListeners();
    }

    private _attachKeyboardListeners() {
        $(window).on("keydown", this._onKeyDown.bind(this));
    }

    private _onKeyDown(evt: JQueryEventObject | any) {
        const moveParams = {
            x: 0,
            y: 0
        };
        switch (evt.keyCode) {
            case KEYCODES.UP:
                moveParams.y--;
                break;
            case KEYCODES.DOWN:
                moveParams.y++;
                break;
            case KEYCODES.LEFT:
                moveParams.x--;
                break;
            case KEYCODES.RIGHT:
                moveParams.x++;
                break;
            default:
        }
        this._moveTriangle(moveParams);
    }

    private _moveTriangle(data: MoveParams) {
        const newX = this.model.imgX + data.x;
        const newY = this.model.imgY + data.y;
        if (data.x && newX >= 0 && !this._exceedsMaxX(newX)) {
            this.model.imgX = newX;
            this._updateTrianglePosition();
        } else if (data.y && newY >= 0 && !this._exceedsMaxY(newY)) {
            this.model.imgY = newY;
            this._updateTrianglePosition();
        }
    }

    private _updateImage() {
        this.$(".selected-pattern")
            .removeClass(this.model.patterns.join(" "))
            .addClass(this.model.image);
    }

    private _updateTriangle() {
        this.$(".triangle-selector")
            .removeClass(this.model.angles.map((x) => "angle-" + x))
            .addClass("angle-" + this.model.angle);
        this._bringInBounds();
    }

    private _makeTriangleDraggable() {
        this.$(".triangle-selector").draggable({
            containment: "parent",
            drag: this._onDrag.bind(this)
        });
    }

    private _onDrag(evt: JQueryEventObject, ui: any) {
        this.model.imgX = ui.position.left;
        this.model.imgY = ui.position.top;
    }

    private _bringInBounds() {
        let changed = false;
        const height = this._getDraggableHeight(this.model.radianAngle, this.model.scaleFactor);
        const width = this._getDraggableWidth(this.model.radianAngle, this.model.scaleFactor);

        if (this._exceedsMaxY(this.model.imgY)) {
            this.model.imgY -= this.model.imgY + height - this.model.imageHeight;
            changed = true;
        }
        if (this._exceedsMaxX(this.model.imgX)) {
            this.model.imgX -= this.model.imgX + width - this.model.imageWidth;
            changed = true;
        }
        if (changed) {
            this._updateTrianglePosition();
        }
    }

    private _updateTrianglePosition() {
        this.$(".triangle-selector").css({
            left: this.model.imgX,
            top: this.model.imgY
        });
    }

    private _exceedsMaxX(x: number) {
        const width = this._getDraggableWidth(this.model.radianAngle, this.model.scaleFactor);
        return width + x > this.model.imageWidth;
    }

    private _exceedsMaxY(y: number) {
        const height = this._getDraggableHeight(this.model.radianAngle, this.model.scaleFactor);
        return height + y > this.model.imageHeight;
    }

    private _getDraggableHeight(angle: number, scaleFactor: number) {
        return Math.round(Math.sin(angle / 2) * this.model.radius * 2) / scaleFactor;
    }

    private _getDraggableWidth(angle: number, scaleFactor: number) {
        return Math.round(Math.cos(angle / 2) * this.model.radius) / scaleFactor;
    }

    // Helper function to generate values to be used in designer.styl file for draggable height and width
    private _heightWidthStylusHelper() {
        console.info(this.model.angles.map((x) => x + " " +
            Math.round(Math.cos(x * Math.PI / 360) * this.model.radius) + " " +
            Math.round(Math.sin(x * Math.PI / 360) * this.model.radius * 2)
        ).join(","));
    }

    private _keepMoving() {
        this._stopMoving();
        let count = 20;
        let evt = {
            keyCode: this._getRandomInt(37, 41)
        };
        this._timer = window.setInterval(() => {
            if (count) {
                count--;
            } else {
                count = 20;
                evt = {
                    keyCode: this._getRandomInt(37, 41)
                };
            }
            this._onKeyDown(evt);
        }, 20);
    }

    private _stopMoving() {
        if (this._timer) {
            window.clearInterval(this._timer);
        }
    }

    private _toggleAuto() {
        this._generator.next().value();
    }

    private _getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
    }
}
