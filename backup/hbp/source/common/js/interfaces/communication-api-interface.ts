import { KeplerEngine } from "../kepler_player";

/**
 * enum class containing task list.
 */
export enum eTasks {
    TRAINING,
    ASSESSMENT,
    VIDEO,
    SCRATCHPAD
}

/**
 * Scenario Positions of tasks.
 */
export const SCENARIO_POSITION: { [id: string]: string } = {
    TRAINING: "1",
    ASSESSMENT: "2",
    VIDEO: "3",
    SCRATCHPAD: "4"
};

export const LEARNING_MODE = ["Hint", "Assessment", "Video", ""]; // Training, Assessment, Video, Scratchpad.

/**
 * Events namespace.
 * @contains events data.
 */
export namespace Events {
    export interface StepEventData {
        event: "stepLoaded" | string;
        stepNumber: number;
        timeIndex: number;
    };
}

export interface CaptionData {
    time: number;
    text: string;
}

/**
 * CallbackDatas namespace.
 * @contains Callback function's data.
 */
export namespace CallbackDatas {
    export interface LoadInteraction {
        event: string;
        phaseName: string;
        totaltime: number;
        totalSteps: number;
        stepList: number[];
        captions: CaptionData[];
    }
    export interface PauseVideo {
        event: "stopped" | "started" | string;
        timeIndex: number;
    }
    export interface PlayVideo {
        event: "started" | "stopped" | string;
        timeIndex: number;
    }
    export interface SetVolume {
        event: "soundOff" | "soundOn" | string;
    }
    export interface GotoStep {
        event: "stepLoaded" | string;
        stepNumber: number;
        timeIndex: number;
    }
}

export interface CommAPIEventMap {
    "scoring-event": { event: "correct" | "incorrect", playbackDetails: string };
    "update-cc-event": string;
    "step-event": Events.StepEventData;
    "update-timer-event": any;
    "player-ready": JQuery.Event<HTMLAudioElement>;
}

/**
 * API Interface for communication with kepler player.
 */
export interface CommunicationAPIInterface {
    /**
     * Loads kepler task by jsonId and task type.
     * @param jsonId JSON's Id for which content to be loaded.
     * @param taskType Determines to load which task.
     * @param cbFnc Load complete callback.
     */
    loadTask(jsonId: string, taskType: eTasks, cbFnc?: (data: any) => any): Promise<any>;

    /**
     * Unloads kepler task by task type.
     * @param taskType Determines which task to unload.
     */
    unloadTask(taskType: eTasks): void;

    /**
     * Calls loadInteraction of loaded task.
     * Tobe called right after loadTask's ack.
     * @param phaseName phase to be loaded.
     * @param cbFnc Load Interaction complete callback.
     */
    loadInteractionPhase(phaseName: string, cbFnc?: (data: CallbackDatas.LoadInteraction) => void): Promise<CallbackDatas.LoadInteraction>;

    retryInteractionPhase(phaseName: string, fnCallBack?: (data: any) => any): Promise<any>;

    playVideo(cbFnc: Function): void;

    pauseVideo(cbFnc: Function): void;

    setSpeed(speed: number, cbFnc: Function): void;

    showClosedCaptions(isShow: boolean, cbFnc: Function): void;

    setVolume(volume: number, cbFnc: (data: CallbackDatas.SetVolume) => void): void;

    callbackStepEvent(event: Events.StepEventData): void;

    callbackErrorEvent(data: any): void;

    /**
     * Handler for keplar's player dom ready call.
     * Should raise player-ready event.
     */
    callbackPlayerReady(eve: CommAPIEventMap["player-ready"]): void;

    gotoStep(stepNo: number, cbFnc: (data: CallbackDatas.GotoStep) => void): void;

    setFocus(context: KeplerEngine, focusDetails: any): void;

    /**
     * To bind valid events on communicator.
     * @param event valid string event name.
     * @param callback valid callback function with appropriate data.
     * @param context optional, any context to bind callback on.
     */
    on<E extends keyof CommAPIEventMap>(event: E, callback: (event: JQuery.Event, data: CommAPIEventMap[E]) => any, context?: any): void;
}