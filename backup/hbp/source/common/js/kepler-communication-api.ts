import * as _ from "underscore";
import * as InterfacePckg from "./interfaces/communication-api-interface";
import { LMSModule, ExtWindow } from "./lms-module.d";
import { KeplerEngine } from "./kepler_player";

declare const window: ExtWindow;

export class KeplerCommunicationAPI implements InterfacePckg.CommunicationAPIInterface {
    public module: LMSModule;
    private taskDirPath: string;

    constructor(iframeWindow: Window, lmsAPIModule: LMSModule, taskDirPath: string) {
        this.module = lmsAPIModule;
        this.taskDirPath = taskDirPath;
        this.module.setManager(this, iframeWindow);
    }

    public loadTask(jsonId: string, taskType: InterfacePckg.eTasks, cbFnc = (data: any) => { }) {
        let resFnc: Function, rejFnc: Function;
        console.info("Loading task", InterfacePckg.eTasks[taskType],
            "with jsonId: " + jsonId,
            "& learning mode: " + InterfacePckg.LEARNING_MODE[taskType],
            "& scenario position: " + InterfacePckg.SCENARIO_POSITION[InterfacePckg.eTasks[taskType]]);

        const ltPromise = new Promise<InterfacePckg.CallbackDatas.LoadInteraction>((resolve, reject) => {
            resFnc = resolve;
            rejFnc = reject;
        });
        ltPromise.then(cbFnc);

        this.module.loadTask({
            taskId: jsonId,
            taskPath: this.taskDirPath + jsonId,
            scenarioPosition: InterfacePckg.SCENARIO_POSITION[InterfacePckg.eTasks[taskType]]
        }, InterfacePckg.LEARNING_MODE[taskType], resFnc);

        return ltPromise;
    }

    public loadInteractionPhase(phaseName: string, cbFnc: (data: InterfacePckg.CallbackDatas.LoadInteraction) => void = (data) => { }) {
        let resFnc: Function, rejFnc: Function;
        console.info("Loading InteractionPhase '" + phaseName + "'");

        const liPromise = new Promise<InterfacePckg.CallbackDatas.LoadInteraction>((resolve, reject) => {
            resFnc = resolve;
            rejFnc = reject;
        });
        liPromise.then(cbFnc);

        this.module.loadInteractionPhase(phaseName, void 0, resFnc);
        return liPromise;
    }

    public retryInteractionPhase(phaseName: string, cbFnc = (data: any) => { }) {
        let resFnc: Function, rejFnc: Function;
        console.info("Retrying InteractionPhase '" + phaseName + "'");
        const reIPPromise = new Promise<any>((resolve, reject) => {
            resFnc = resolve;
            rejFnc = reject;
        });
        reIPPromise.then(cbFnc);

        this.module.retryInteractionPhase(phaseName, resFnc);

        return reIPPromise;
    }

    public unloadTask(taskType: InterfacePckg.eTasks) {
        console.info("Unloading task", InterfacePckg.eTasks[taskType]);
        // Add unload call here..
    }

    public playVideo(cbFnc: Function) {
        this.module.startPlaying(cbFnc);
    }

    public pauseVideo(cbFnc: Function) {
        this.module.stopPlaying(cbFnc);
    }

    public setSpeed(speed: number, cbFnc: Function) {
        this.module.setSpeed(speed, cbFnc);
    }

    public showClosedCaptions(isShow: boolean, cbFnc: Function) {
        this.module.showClosedCaptions(isShow, cbFnc);
    }

    public setVolume(volume: number, cbFnc: (data: InterfacePckg.CallbackDatas.SetVolume) => void) {
        this.module.setVolume(volume, cbFnc);
    }

    public gotoStep(stepNo: number, cbFnc: (data: InterfacePckg.CallbackDatas.GotoStep) => void) {
        this.module.gotoStep(stepNo, cbFnc);
    }

    public callbackStepEvent(event: InterfacePckg.Events.StepEventData) {
        $(this).trigger("step-event", event);
    }

    public callbackScoringEvent(event: any) {
        $(this).trigger("scoring-event", event);
    }

    public callbackUpdateTimerEvent(data: any) {
        $(this).trigger("update-timer-event", data);
    }

    public callbackClosedCaptionUpdateEvent(newCaption: string) {
        $(this).trigger("update-cc-event", newCaption);
    }

    public callbackPlayerReady(eve: InterfacePckg.CommAPIEventMap["player-ready"]) {
        $(this).trigger("player-ready", eve);
    }

    public setFocus(a: KeplerEngine, b: any) {
        $(".back-button-wrapper:visible").focus();
    }

    public callbackErrorEvent(error: any) {
        console.info(error);
    }

    public on<E extends keyof InterfacePckg.CommAPIEventMap>(event: E, callback: (event: JQuery.Event, data: InterfacePckg.CommAPIEventMap[E]) => any, context?: any) {
        if (context !== void 0 && context !== null && typeof context === "object") {
            callback = callback.bind(context);
        }
        return $(this).on(event, callback);
    }
}