import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export declare class KaleidoscopeAttributes {
    public angle?: number;
    public centerX?: number;
    public centerY?: number;
    public image?: string;
    public imageSrc?: string;
    public imgX?: number;
    public imgY?: number;
    public radius?: number;
}

export const PATTERNS = [
    "candy",
    "chalk",
    "jellyfish",
    "paint",
    "pattern",
    "pencils",
    "play-stones",
    "substances"
];

export const ALT_TEXT = {
    "candy": "Candies of different colors",
    "chalk": "Chalks of different colors",
    "jellyfish": "Glowing underwater creatures",
    "paint": "Painted colors pattern",
    "pattern": "Waves and circle pattern",
    "pencils": "Pencils of different colors",
    "play-stones": "Play stones of different colors",
    "substances": "Fabrics of different colors"
};

export const ANGLES = [1, 2, 3, 4, 5, 6, 9, 10, 12, 15, 20, 30, 45, 60, 90];

export const IMG_PATH = "./data/media/images/";

export const IMG_EXTENSION = ".jpg";

export const IMG_WIDTH = 500;
export const IMG_HEIGHT = 200;

export class Kaleidoscope extends Backbone.Model {
    constructor(attr: KaleidoscopeAttributes) {
        super(attr);
    }

    get angle(): number { return this.get("angle"); }
    set angle(value: number) { this.set("angle", value); }

    get radianAngle(): number { return Math.PI * this.angle / 180; }

    get centerX(): number { return this.get("centerX"); }
    set centerX(value: number) { this.set("centerX", value); }

    get centerY(): number { return this.get("centerY"); }
    set centerY(value: number) { this.set("centerY", value); }

    get imgX(): number { return this.get("imgX"); }
    set imgX(value: number) { this.set("imgX", value); }

    get imgY(): number { return this.get("imgY"); }
    set imgY(value: number) { this.set("imgY", value); }

    get radius(): number { return this.get("radius"); }
    set radius(value: number) { this.set("radius", value); }

    get imageWidth(): number { return IMG_WIDTH; }
    get imageHeight(): number { return IMG_HEIGHT; }

    get imageSrc(): string { return IMG_PATH + this.image + IMG_EXTENSION; }

    get image(): string { return this.get("image"); }
    set image(value: string) { this.set("image", value); }

    get patterns(): string[] { return PATTERNS; }

    get angles(): number[] { return ANGLES; }

    get auto(): boolean { return window.location.search.indexOf("auto") > -1; }

    get scaleFactor(): number {
        if (this.angle === 90) {
            return 2;
        } else if (this.angle === 60) {
            return 1.5;
        } else {
            return 1;
        }
    }

    public defaults() {
        return {
            angle: 30,
            image: PATTERNS[0],
            imgX: 0,
            imgY: 0,
            radius: 225
        };
    }

}
