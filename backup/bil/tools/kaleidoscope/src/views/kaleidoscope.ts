import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/kaleidoscope.styl";
import * as KaleidoscopePkg from "../models/kaleidoscope";

const kaleidoscopeTemplate: (attr?: any) => string = require("./../../tpl/kaleidoscope.hbs");

export class Kaleidoscope extends Backbone.View<KaleidoscopePkg.Kaleidoscope> {
    private _ctx: CanvasRenderingContext2D;
    private _canvas: HTMLCanvasElement;
    private _imgs: any = {};
    private _frame: number;

    constructor(attr?: Backbone.ViewOptions<KaleidoscopePkg.Kaleidoscope>) {
        super(attr);
        this.render();
        this._setInitialValues();
        this._attachListeners();
    }

    public events(): Backbone.EventsHash {
        return {};
    }

    public render(): Kaleidoscope {
        this.$el.html(kaleidoscopeTemplate());
        return this;
    }

    private _setInitialValues() {
        this._canvas = this.$(".kaleidoscope")[0] as HTMLCanvasElement;
        this.model.centerX = this._canvas.width / 2;
        this.model.centerY = this._canvas.height / 2;
        this._ctx = this._canvas.getContext("2d");
        this._updateView();
    }

    private _attachListeners() {
        this.listenTo(this.model, "change:angle", this._updateView.bind(this));
        this.listenTo(this.model, "change:image", this._updateView.bind(this));
        this.listenTo(this.model, "change:imgX", this._updateView.bind(this));
        this.listenTo(this.model, "change:imgY", this._updateView.bind(this));
    }

    private _updateView() {
        if (!this._imgs[this.model.image]) {
            this._imgs[this.model.image] = new Image();
            this._imgs[this.model.image].onload = this._onImageLoaded.bind(this);
            this._imgs[this.model.image].src = $("button[data-value=" + this.model.image + "] img").attr("src");
        } else {
            this._onImageLoaded();
        }
    }

    private _onImageLoaded(resp?: any) {
        if (this._frame) {
            window.cancelAnimationFrame(this._frame);
        }
        this._frame = window.requestAnimationFrame(this._redrawKaleidoscope.bind(this));
    }

    private _redrawKaleidoscope() {
        this._clearCanvas();
        this._drawKaleidoscope();
    }

    private _drawKaleidoscope() {
        for (let i = 0; i < 360 / this.model.angle; i++) {
            this._drawTriangle(!!(i % 2));
            this._rotateContext(this.model.radianAngle);
        }
    }

    private _rotateContext(angle: number) {
        this._ctx.translate(this.model.centerX, this.model.centerY);
        this._ctx.rotate(angle);
        this._ctx.translate(-this.model.centerX, -this.model.centerY);
    }

    private _drawTriangle(invertImg: boolean) {
        this._ctx.save();
        this._defineTriangle();
        this._ctx.clip();
        this._applyStrokeProperties();
        if (invertImg) {
            this._ctx.translate(this.model.centerX, this.model.centerY);
            this._ctx.scale(1, -1);
            this._ctx.translate(-this.model.centerX, -this.model.centerY);
        }
        this._ctx.drawImage(this._imgs[this.model.image],
            this.model.imgX * 2, this.model.imgY * 2,
            this.model.imageWidth * 2, this.model.imageHeight * 2,
            this.model.centerX, this.model.centerY - this._getYDiff(),
            this.model.imageWidth * this.model.scaleFactor, this.model.imageHeight * this.model.scaleFactor);
        this._ctx.stroke();
        this._ctx.restore();
    }

    private _defineTriangle() {
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.moveTo(this.model.centerX, this.model.centerY);
        this._ctx.lineTo(this.model.centerX + this._getXDiff(), this.model.centerY - this._getYDiff());
        this._ctx.lineTo(this.model.centerX + this._getXDiff(), this.model.centerY + this._getYDiff());
        this._ctx.lineTo(this.model.centerX, this.model.centerY);
        this._ctx.closePath();
        this._ctx.restore();
    }

    private _applyStrokeProperties() {
        this._ctx.strokeStyle = "#afe0ea";
        this._ctx.lineWidth = 1;
        this._ctx.lineCap = "round";
        this._ctx.lineJoin = "bevel";
    }

    private _getXDiff() {
        return this.model.radius * Math.cos(this.model.radianAngle / 2);
    }

    private _getYDiff() {
        return this.model.radius * Math.sin(this.model.radianAngle / 2);
    }

    private _clearCanvas() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
}
