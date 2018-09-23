import * as CommAPI from "./kepler-communication-api";
import { LMSModule } from "./lms-module";

export class KeplerEngine implements LMSModule {
    public name = "zeus";
    /**
     * @desc This KeplerAPI handle to kepler to pass data to kepler.
     */
    public keplerAPI: any = null;
    /**
     * @desc When kepler APi is not loaded and LMS try to communicate with Kepler at that time all
     *       calls are pushed to this array and later on when keplerReady function call comes these
     *       pendings call are passed to Kepler.
     */
    public pendingCalls: any[] = [];
    public engineManager: CommAPI.KeplerCommunicationAPI;
    public engineIFrame: Window | any;
    public isSoundOn: boolean | number = true;
    public speedVal = 1;
    public oTaskDetail: any = null;

    constructor() {
        $(document).ready(() => {
            document.addEventListener("mouseup", this.raiseMouseUpEvent.bind(this));
        });
    }

    public setManager(manager: CommAPI.KeplerCommunicationAPI, window: Window) {
        this.engineManager = manager;
        this.engineIFrame = window;
    }

    /**
     * @desc This function will pass calls to kepler engine if KeplerAPI is not loaded then push to pending calls.
     * @param {string} fnName Function name.
     * @param {object} data JSON data from LMS to kepler.
     * @param {array object} fnCallBacks Callback function that will be acknowledged after task is completed.
     */
    private contentEngineCall(fnName: string, data?: any, fnCallBacks?: any[]) {
        if (!this.keplerAPI) {
            this.pendingCalls.push({ "fnName": fnName, "data": data, "fnCallBacks": fnCallBacks });
            return;
        }
        this.keplerAPI.fnMsgToKepler(fnName, data, fnCallBacks);
    }

    public keplerReadyHandler() {
        this.keplerAPI = this.engineIFrame.ZEUS.KeplerPlayer.CommunicatorAPI;

        if (this.pendingCalls) {
            //for (var i = 0; i < pendingCalls.length; i++) {
            while (this.pendingCalls.length > 0) {
                var pendingCall = this.pendingCalls.pop();
                this.keplerAPI.fnMsgToKepler(pendingCall.fnName, pendingCall.data, pendingCall.fnCallBacks);
            }
        }
    }

    public getInstructionText() {
        if (this.keplerAPI) {
            return this.keplerAPI.fnGetInstructionText();
        }
        return "";
    }

    public setFocus() {
        if (this.engineIFrame) {
            this.engineIFrame.focus();
        }
        this.contentEngineCall("setFocus");
    }

    public setFocusToPlayer(focusDetails: { [id: string]: any }) {
        console.log('ContentEngine call to set focus to ContentPlayer');
        if (this.engineIFrame && this.engineManager.setFocus) {
            this.engineManager.setFocus(this, focusDetails);
        }
    }

    public userRequest(data: { event: string; name: string }) {
        console.log(data.name);
        if (data.event != null && data.event == "showSimKeyboard") {
            this.showHidekeyboard(true);
        }
        else if (data.name == "ctrl-F2") {
            this.setFocusToPlayer({});
        }
    }

    public setSpeed(speed: number, fnCallBack: Function) {
        if (speed == undefined) {
            this.raiseError('setSpeed was called with an undefined speed'); return '';
        }
        if (speed == undefined) {
            this.raiseError('setSpeed was called with an undefined callback function'); return '';
        }
        console.log('setSpeed received in engine');
        var data = {
            "speed": speed
        }
        this.speedVal = speed;
        this.contentEngineCall("setSpeed", data, [fnCallBack]);
    }

    public loadTask(taskDetail: any, learningMode: string, fnCallBack: Function, playerSetting: any) {
        if (taskDetail == undefined || learningMode == undefined) {
            this.raiseError('loadTask was called with an undefined taskDetail or learningMode'); return '';
        }
        if (fnCallBack == undefined) {
            this.raiseError('loadTask was called with an undefined fnCallBack'); return '';
        }
        console.log('loadTask received in engine');
        if (playerSetting != null) {
            if (playerSetting.sound)
                this.isSoundOn = playerSetting.sound;
            if (playerSetting.playbackSpeed)
                this.speedVal = playerSetting.playbackSpeed == 0 ? 1 : playerSetting.playbackSpeed;
        }
        var data = {
            "taskDetail": taskDetail,
            "simMode": learningMode,
            "name": this.name,
            "sound": this.isSoundOn,
            "speed": this.speedVal
        }
        this.oTaskDetail = taskDetail;
        this.pendingCalls = [];
        if (this.oTaskDetail.reload != null && !this.oTaskDetail.reload) {
            this.keplerAPI = null;
            this.engineIFrame = null;
        }
        this.contentEngineCall("loadTask", data, [fnCallBack]);
    }

    public loadInteractionPhase(phaseName: string, optionalInstructions: any, fnCallBack: Function) {
        if (phaseName == undefined) {
            this.raiseError('loadInteractionPhase was called with an undefined phaseName'); return '';
        }
        if (fnCallBack == undefined) {
            this.raiseError('loadInteractionPhase was called with an undefined fnCallBack'); return '';
        }
        console.log('loadInteractionPhase received in engine');
        var data: any = {
            "phaseName": phaseName
        }
        if (optionalInstructions) {
            data["optionalInstructions"] = optionalInstructions;
            data["taskDetail"] = this.oTaskDetail;
        }
        this.contentEngineCall("loadInteractionPhase", data, [fnCallBack]);
    }

    public restartInteractionPhase(phaseName: string, fnCallBack: Function) {
        if (phaseName == undefined) {
            this.raiseError('restartInteractionPhase was called with an undefined phaseName'); return '';
        }
        if (fnCallBack == undefined) {
            this.raiseError('restartInteractionPhase was called with an undefined fnCallBack'); return '';
        }
        console.log('restartInteractionPhase received in engine');
        this.loadInteractionPhase(phaseName, null, fnCallBack);
    }

    public retryInteractionPhase(phaseName: string, fnCallBack: Function) {
        if (fnCallBack == undefined) {
            this.raiseError('retryInteractionPhase was called with an undefined fnCallBack'); return '';
        }
        if (phaseName === 'Intro') {
            return;
        }
        console.log('retryInteractionPhase received in engine');
        this.contentEngineCall("retryInteractionPhase", null, [fnCallBack]);
    }

    public setVolume(volume: number, fnCallBack: any) {
        if (volume == undefined) {
            this.raiseError('setVolume was called with an undefined volume'); return '';
        }
        if (fnCallBack == undefined) {
            this.raiseError('setVolume was called with an undefined fnCallBack'); return '';
        }
        console.log('setVolume received in engine');
        var data = {
            "volume": volume
        }
        this.isSoundOn = volume;
        this.contentEngineCall("setVolume", data, [fnCallBack]);
    }

    public showClosedCaptions(showCaptions: any, fnCallBack: any) {
        if (showCaptions == undefined) {
            this.raiseError('showClosedCaptions was called with an undefined showCaptions'); return '';
        }
        if (fnCallBack == undefined) {
            this.raiseError('showClosedCaptions was called with an undefined fnCallBack'); return '';
        }
        console.log('showClosedCaptions received in engine');
        var data = {
            "showCaptions": showCaptions
        }
        this.contentEngineCall("showClosedCaptions", data, [fnCallBack]);
    }

    public showHidekeyboard(showKeyboard: boolean) {
        var data = {
            "showKeyboard": true
        }
        this.contentEngineCall("showKeyboard", data, null);
    }

    public startPlaying(fnCallBack: any) {
        if (fnCallBack == undefined) {
            this.raiseError('startPlaying was called with an undefined fnCallBack'); return '';
        }
        console.log('startPlaying received in engine');
        this.contentEngineCall("startPlaying", null, [fnCallBack]);
    }

    public stopPlaying(fnCallBack: any) {
        if (fnCallBack == undefined) {
            this.raiseError('stopPlaying was called with an undefined fnCallBack'); return '';
        }

        console.log('stopPlaying received in engine');
        this.contentEngineCall("stopPlaying", null, [fnCallBack]);
    }

    public gotoStep(stepNumber: number, fnCallBack: any) {
        if (stepNumber == undefined) {
            this.raiseError('gotoStep was called with an undefined stepNumber'); return '';
        }
        if (fnCallBack == undefined) {
            this.raiseError('gotoStep was called with an undefined fnCallBack'); return '';
        }
        console.log('gotoStep received in engine');
        var data = {
            "stepNumber": stepNumber
        }
        this.contentEngineCall("gotoStep", data, [fnCallBack]);
    }

    public raiseError(errorDetails: string) {
        this.engineManager.callbackErrorEvent(errorDetails);
    }

    public taskEventHandler(taskDetails: any) {
        console.log('EVENT: Content Engine raise TaskEvent with taskDetails:' + JSON.stringify(taskDetails));
    }

    public phaseEventHandler(phaseDetails: any) {
        console.log('EVENT: Content Engine raise PhaseEvent with phaseDetails:' + JSON.stringify(phaseDetails));
    }

    public stepEventHandler(stepEventDetails: any) {
        this.engineManager.callbackStepEvent(stepEventDetails);
    }

    public topicEventHandler(topicEventDetails: any) {
        console.log('EVENT: Content Engine raise TopicEvent with topicDetails:' + JSON.stringify(topicEventDetails));
    }

    public updateTimerEventHandler(data: any) {
        this.engineManager.callbackUpdateTimerEvent(data);
    }

    public scoringEventHandler(ScoringDetails: any) {
        window.setTimeout(() => {
            this.setFocusToPlayer({});
            this.engineManager.callbackScoringEvent(ScoringDetails);
        }, 100);
    }

    public playEventHandler(playEventDetails: any) {
        console.log('EVENT: Content Engine raise playEvent with playEventDetails:' + JSON.stringify(playEventDetails));
    }

    public keyboardStateEventHandler(onscreenKeyboardDetails: any) {
        console.log('EVENT: Content Engine raise KeyboardStateEvent with :' + JSON.stringify(onscreenKeyboardDetails));
    }

    public updateClosedCaptionHandler(newCaption: string) {
        this.engineManager.callbackClosedCaptionUpdateEvent(newCaption);
    }

    private raiseMouseUpEvent(e: any) {
        if (this.engineIFrame && this.engineIFrame.document && this.engineIFrame.document.body) {
            var engineBody = this.engineIFrame.document.body;
            var evt = this.engineIFrame.document.createEvent("MouseEvent");
            evt.initMouseEvent(e.type, e.canBubble, e.cancelable, e.view, e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
            engineBody.dispatchEvent(evt);
        }
    }

    /**
     * Handler for keplar's player dom ready call.
     * Calls engineManager's `callbackPlayerReady` method.
     */
    public playerReadyHandler() {
        if (this.engineManager && typeof this.engineManager.callbackPlayerReady === "function") {
            this.engineManager.callbackPlayerReady.apply(this.engineManager, arguments);
        }
    }
}