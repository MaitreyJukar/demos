//APIs for ContentPlayer to ContentEngine calls

import * as InterfacePckg from "./interfaces/communication-api-interface";

export declare interface LMSModule {
    loadTask: (taskData: {
        taskId: string;
        taskPath: string;
        scenarioPosition: string
    }, taskType: string, cbFnc: Function, playerSettings?: any) => any;
    loadInteractionPhase: (phaseName: string, optionalInstructions: any, fnCallBack: Function) => void | string;
    restartInteractionPhase: (phaseName: string, fnCallBack: Function) => void | string;
    retryInteractionPhase: (phaseName: string, fnCallBack: Function) => void | string;
    setVolume: (volume: number, cbFnc: (data: InterfacePckg.CallbackDatas.SetVolume) => void) => any;
    showClosedCaptions: (isShow: boolean, cbFnc: Function) => any;
    showHidekeyboard: (showKeyboard: boolean) => void;
    startPlaying: (cbFnc: Function) => any;
    stopPlaying: (cbFnc: Function) => any;
    gotoStep: (stepNumber: number, cbFnc: Function) => any;
    /**
     * @memberof CommunicatorAPI
     * @function
     * @desc This function will be called when kepler is ready. This function will excecute pending kepler calls.
     */
    keplerReadyHandler: () => void;
    raiseError: (errorDetails: string) => void;
    taskEventHandler: (taskDetails: any) => void;
    phaseEventHandler: (phaseDetails: any) => void;
    scoringEventHandler: (ScoringDetails: any) => void;
    stepEventHandler: (stepEventDetails: any) => void;
    topicEventHandler: (topicEventDetails: any) => void;
    keyboardStateEventHandler: (onscreenKeyboardDetails: any) => void;
    setManager: (manager: InterfacePckg.CommunicationAPIInterface, window: Window) => void;
    /**
     * @memberof CommunicatorAPI
     * @function
     * @desc It will return blank string if kepler API is not ready and kepler loadtask is not completed. so, make sure it
     * should be calledafter that.
     */
    getInstructionText: () => any;
    setFocus: () => void;
    setFocusToPlayer: (focusDetails: { [id: string]: any; }) => void;
    /**
     * @memberof CommunicatorAPI
     * @function
     * @desc It will set speed of playback.
     */
    setSpeed: (speed: number, cbFnc: Function) => any;
    /**
     * @function
     * @desc handles user request
     */
    userRequest: (data: { event: string; name: string; }) => void;
    updateTimerEventHandler: (data: any) => void;
    updateClosedCaptionHandler: (newCaption: string) => void;
    /**
     * Handler for keplar's player dom ready call.
     * Calls engineManager's `callbackPlayerReady` method.
     */
    playerReadyHandler(): void;
}

export interface ExtWindow extends Window {
    HBP: { LMSAPIModule: LMSModule };
}