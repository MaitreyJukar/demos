import * as Backbone from "backbone";
import PlayerModel from "./player-model";
import SideMenuCollection from "../collections/side-menu";
import PlayerView from "./../views/player";
import * as Handlebars from "handlebars";
import * as _ from "underscore";
import { Utilities } from "./../utilities";

/**
 * @type enum (extended)
 * @level0 play
 * @level1 pause
 * @level2 replay
 */
export const eControlModes = new Utilities.ExtEnum(["play", "pause", "replay"]);

/**
 * @type enum (extended)
 * @level0 HalfScreen
 * @level1 FullScreen
 */
export const eScreenModes = new Utilities.ExtEnum(["HalfScreen", "FullScreen"]);

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

export class VideoPlayerControls extends Backbone.Model {
    get modelId(): string { return (this.get("modelId")); }
    set modelId(value: string) { this.set("modelId", value); }

    /**
     * follows enum (extended) eControlModes
     */
    get controlMode(): number { return (this.get("controlMode")); }
    set controlMode(value: number) {
        if (eControlModes.indexOf(eControlModes[value]) === -1) {
            console.warn("Invalid controlMode getting set:", value, "Try from:", eControlModes);
            return;
        }
        this.set("controlMode", value);
    }

    get timeElapsed(): number { return (this.get("timeElapsed")); }
    set timeElapsed(value: number) {
        if (value > this.totalTime) {
            console.warn("WARNING! timeElapsed for video controls was set more than its totalTime, preventing setter.", value, ">", this.totalTime);
            return;
        }
        this.set("timeElapsed", value);
    }

    get totalTime(): number { return (this.get("totalTime")); }
    set totalTime(value: number) { this.set("totalTime", value); }

    get currentSpeed(): number { return (this.get("currentSpeed")); }
    set currentSpeed(value: number) {
        if (value < this.minSpeed || value > this.maxSpeed) {
            return;
        }
        this.set("currentSpeed", value);
    }

    get maxSpeed(): number { return (this.get("maxSpeed")); }
    set maxSpeed(value: number) { this.set("maxSpeed", value); }

    get minSpeed(): number { return (this.get("minSpeed")); }
    set minSpeed(value: number) { this.set("minSpeed", value); }

    get speedVariance(): number { return (this.get("speedVariance")); }
    set speedVariance(value: number) { this.set("speedVariance", value); }

    /**
     * follows enum (extended) eScreenModes
     */
    get screenMode(): number { return (this.get("screenMode")); }
    set screenMode(value: number) { this.set("screenMode", value); }

    get isClosedCaptionsShown(): boolean { return (this.get("isClosedCaptionsShown")); }
    set isClosedCaptionsShown(value: boolean) { this.set("isClosedCaptionsShown", value); }

    get isAudioMute(): boolean { return (this.get("isAudioMute")); }
    set isAudioMute(value: boolean) { this.set("isAudioMute", value); }

    get isMobMenuShown(): boolean { return (this.get("isMobMenuShown")); }
    set isMobMenuShown(value: boolean) { this.set("isMobMenuShown", value); }

    get currentStep(): number { return (this.get("currentStep")); }
    set currentStep(value: number) { this.set("currentStep", value); }

    get maxStep(): number { return (this.get("maxStep")); }
    set maxStep(value: number) { this.set("maxStep", value); }

    get isMuteBtnAvailable(): boolean { return (this.get("maxStep")); }
    set isMuteBtnAvailable(value: boolean) { this.set("maxStep", value); }

    constructor(attr?: any) {
        super(attr);
    }

    defaults() {
        return {
            modelId: _.uniqueId("vpc-"),
            controlMode: eControlModes.pause,
            timeElapsed: 0,
            totalTime: 0,
            currentSpeed: 1,
            maxSpeed: 2,
            minSpeed: 1,
            speedVariance: 1,
            screenMode: eScreenModes.HalfScreen,
            isClosedCaptionsShown: true,
            isAudioMute: false,
            isMobMenuShown: false,
            maxStep: -1,
            currentStep: -1,
            isMuteBtnAvailable: !Utilities.isTouchDevice()
        };
    }
}