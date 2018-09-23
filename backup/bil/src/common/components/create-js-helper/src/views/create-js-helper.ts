import * as Backbone from "backbone";
import * as _ from "underscore";
import * as UtilitiesPkg from "./../../../../helper/utilities";
import * as CreateJSHelperModelPkg from "./../models/create-js-helper";

declare const createjs: {
    Stage: any;
    Ticker: any;
    Tween: any;
};

export interface ViewOptions {
    $constainer?: JQuery<HTMLElement>;
}

export interface EventDataMap {
    "animationEnd": string;
}

export interface CanvasStyles {
    height?: number;
    width?: number;
}

export class CreateJSHelper extends Backbone.View<CreateJSHelperModelPkg.CreateJSHelper> {
    public running: boolean;
    public oldPauseValue: boolean;
    public dirty: boolean;
    public exportRoots: { [id: string]: any };
    public stage: typeof createjs.Stage;
    public el: HTMLCanvasElement;
    public $constainer: JQuery<HTMLElement>;
    private _recentAnimationID: string;
    private _onAnimationCompleteBound: (data?: any) => any;

    constructor(attr?: Backbone.ViewOptions<CreateJSHelperModelPkg.CreateJSHelper>, opts?: ViewOptions) {
        attr = attr || {};
        attr = $.extend(true, attr, CreateJSHelper.defaults());
        super(attr);
        this.dirty = false;
        opts = opts || {};
        this.$constainer = opts.$constainer;
        this.exportRoots = {};
        this.render();
        this.initStage();
    }

    public static defaults() {
        return {
            className: "createJsCanvas",
            tagName: "canvas"
        };
    }

    public render() {
        this.$constainer.append(this.$el);
        return this;
    }

    public initStage() {
        this.stage = new createjs.Stage(this.el);
        createjs.Ticker.addEventListener("tick", this.stage);
        this.stage.addEventListener("drawstart", (e: Event) => {
            if (this.oldPauseValue != this.exportRoots[this._recentAnimationID].paused) {
                this.oldPauseValue = this.exportRoots[this._recentAnimationID].paused;
                this.dirty = true;
            }
            if (this.exportRoots[this._recentAnimationID].paused && !this.dirty) {
                e.preventDefault();
            } else {
                this.dirty = false;
            }
        });
    }

    public initAnimation(id: string) {
        const data = this.model.animationData[id];
        const ExportFunction = window[data.id][data.exportFunction];
        const properties = window[data.id].properties;

        const endPromise = new UtilitiesPkg.PromiseWrapper<string>();
        if (!this.exportRoots[id]) {
            this.exportRoots[id] = new ExportFunction();
        }

        if (this._recentAnimationID !== id) {
            // clear the stage if ant animation
            this.stage.clear();
            this.stage.removeAllChildren();
            this.stage.addChild(this.exportRoots[id]);
        } else if (this._recentAnimationID === void 0) {
            this.stage.addChild(this.exportRoots[id]);
        }
        // attach callback function
        $(this.exportRoots[id]).off("animation-complete", this._onAnimationCompleteBound);
        this._onAnimationCompleteBound = this.onAnimationComplete.bind(this, id, endPromise);
        $(this.exportRoots[id]).on("animation-complete", this._onAnimationCompleteBound);
        /* this.$el.attr("height", properties.height);
        this.$el.attr("width", properties.width); */
        this.applyStyles({ height: properties.height, width: properties.width });
        createjs.Ticker.setFPS(properties.fps);
        this._recentAnimationID = id;
        this.dirty = false;
        this.oldPauseValue = this.exportRoots[id].paused;
        this.exportRoots[id].gotoAndPlay(1);
        this.startAnimation();
        this.exportRoots[id].paused = false;
        return endPromise;
    }

    public callback(id: string) {
        this.trigger("animationEnd", id);
    }

    public applyStyles(props: CanvasStyles) {
        const attrs: CanvasStyles = {};
        if (this.$el.height() !== props.height) {
            attrs.height = props.height;
        }
        if (this.$el.width() !== props.width) {
            attrs.width = props.width;
        }
        this.$el.attr(attrs);
    }

    public stopAnimation() {
        this.running = false;
        this.exportRoots[this._recentAnimationID].stop();
    }

    public startAnimation() {
        this.running = true;
        this.exportRoots[this._recentAnimationID].play();
    }

    /**
     * returns current frame of the animation
     */
    public playPauseAnimation() {
        this.exportRoots[this._recentAnimationID].paused = !this.exportRoots[this._recentAnimationID].paused;
    }

    public getCurrentFrame() {
        return this.exportRoots[this._recentAnimationID].currentFrame;
    }

    /**
     * Adds an event on perticular frame number and returns a Promise.
     * @param frame Any frame number
     */
    public addEventOnFrame(frame: number) {
        const framePromise = new UtilitiesPkg.PromiseWrapper<{ animationID: string; frame: number }>();
        this.exportRoots[this._recentAnimationID].timeline.addTween(createjs.Tween.get(this.exportRoots[this._recentAnimationID])
            .wait(frame).call(framePromise.resolve.bind(this, {
                animationID: this._recentAnimationID,
                frame
            })).wait(1));
        return framePromise;
    }

    /**
     * To bind valid events on communicator.
     * @param event valid string event name.
     * @param callback valid callback function with appropriate data.
     * @param context optional, any context to bind callback on.
     */
    // tslint:disable-next-line:max-line-length
    public attachListener<E extends keyof EventDataMap>(event: E, callback: (data1: EventDataMap[E]) => any, context?: any) {
        if (context !== void 0 && context !== null && typeof context === "object") {
            callback = callback.bind(context);
        }
        return this.on(event, callback);
    }

    /**
     * Goes to specified frame and stops specified animation.
     * @param id Animation ID.
     * @param frameNo Any valid frame number.
     */
    public gotoAndStop(id: string, frameNo: number = 1) {
        const data = this.model.animationData[id];
        const ExportFunction = window[data.id][data.exportFunction];
        const properties = window[data.id].properties;

        if (!this.exportRoots[id]) {
            this.exportRoots[id] = new ExportFunction();
            $(this.exportRoots[id]).off("animation-complete", this._onAnimationCompleteBound);
            this._onAnimationCompleteBound = this.onAnimationComplete.bind(this, id);
            $(this.exportRoots[id]).on("animation-complete", this._onAnimationCompleteBound);
        }

        if (this._recentAnimationID !== id) {
            this.stage.removeAllChildren();
            this.stage.clear();
            this.stage.addChild(this.exportRoots[id]);
        } else if (this._recentAnimationID === void 0) {
            this.stage.addChild(this.exportRoots[id]);
        }

        this._recentAnimationID = id;
        /* this.$el.attr("height", properties.height);
        this.$el.attr("width", properties.width); */
        this.applyStyles({ height: properties.height, width: properties.width });
        createjs.Ticker.setFPS(properties.fps);
        this.exportRoots[id].paused = false;
        this.exportRoots[id].gotoAndStop(frameNo);
        this.startAnimation();
        this.exportRoots[id].paused = true;
    }

    private onAnimationComplete(id: string, endPromise?: UtilitiesPkg.PromiseWrapper<string>) {
        if (endPromise && typeof endPromise.resolve === "function") {
            endPromise.resolve(id);
        }
        this.callback(id);
    }
}
