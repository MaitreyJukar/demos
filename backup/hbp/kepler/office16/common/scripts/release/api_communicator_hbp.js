/*!
 *   COPYRIGHT 2014 Zeus Systems Pvt. Ltd.
 *   THE FOLLOWING CODE IS PROPRIETARY AND MAY NOT BE USED, COPIED, MODIFIED OR DISTRIBUTED IN ANY WAY WITHOUT AN EXPRESS LICENSE FROM ZEUS SYSTEMS PVT. LTD.  [Contact us at: contact@zeuslearning.com].
 *   UNAUTHORIZED USE IS ILLEGAL AND STRICTLY PROHIBITED.
 */


//This bool is set to true to inform Kepler that it is loaded with built in API.
var hbp_api_present = true;
var kepler = null;
var lms_api = null;
var keplerData = null;
var taskData = null;
var bKeplerLoaded = false;
var hbpDebug = false;

var _hbp = {
    log: function () {
        hbpDebug && console.log.apply(this, arguments);
    },
    info: function () {
        hbpDebug && console.info.apply(this, arguments);
    },
    error: function () {
        hbpDebug && console.error.apply(this, arguments);
    },
    warn: function () {
        hbpDebug && console.warn.apply(this, arguments);
    }
};

var __lmsData = { "header.messageid": "A556F03A-C6F6-451b-9B8F-86A442879D93" };
var __config = {
    "header.messageid": "A556F03A-C6F6-451b-9B8F-86A442879D93",
    "header.userid": "8292292",
    "header.sessionid": "45",
    "header.assignmentid": "988123",
    "header.repositorytokenid": "102919",
    "header.sectionid": "2",
    "app.tokenid": "102919",
    "assignmentstatus": "0",
    "DownloadParams.Resources.URL": "http://192.168.2.106/resources",
    "DownloadParams.word.URL": "http://192.168.2.106/word",
    "parameters.displayname": null,
    "parameters.AttemptNumber": "256",
    "parameters.assignmenttitle": null,
    "parameters.AssignmentInstructions": {
        "content": "Insert any kind of text here. The text cannot contain RTF/HTML characters.blahblahblah"
    },
    "parameters.displayname": "Display Name",
    "parameters.assignmenttitle": "Assignment Title",
    "parameters.Compression": "0",
    "parameters.Encryption": "0",
    "parameters.LocationCheck": "0",
    "parameters.LocationCheckType": "1",
    "parameters.LocationCheckValues": null,
    "parameters.transitiontime": "1000",
    "parameters.TransitionTextCorrect": "CORRECT",
    "parameters.TransitionTextIncorrect": "INCORRECT",
    "parameters.TransitionCorrectFont": "Verdana",
    "parameters.TransitionIncorrectFont": "Verdana",
    "parameters.TransitionCorrectFontSize": "45",
    "parameters.TransitionIncorrectFontSize": "45",
    "parameters.TransitionCorrectFontColor": "#009100",
    "parameters.TransitionIncorrectFontColor": "#FF0C18",
    "parameters.UploadLocal": "0",
    "parameters.resourcepath": "",
    "parameters.lms_url": "http://192.168.2.106/LoginPage.aspx",
    "parameters.lms_url_report": "Report.aspx",
    "parameters.lms_urlport": "80",
    "parameters.reportcompression": "0",
    "parameters.actionstringoptimization": "0",
    "parameters.doubleclickinterval": "250",
    "parameters.doubleclickregion": "10",
    "parameters.longtapinterval": "500",
    "parameters.longtapregion": "5",
    "parameters.usedynamicdialogloading": "1",
    "recoveryparams.RestartFromQuestionID": "0",
    "recoveryparams.RestartQuestionType": "1",
    "parameters.intermediatereport": "0",
    "parameters.accessibility": "1",
    "parameters.donotusedialogpreloading": "1",
    "parameters.assignmentstatus": "2",
    "parameters.loadbase64audio": "1",
    "parameters.loadwebaudio": "1"
};
var __assignment = {
    "document.1.name": "document a (sales and planning)",
    "document.1.solutionimageurl": "0a1929.bmp",
    "document.count": 0,
    "header.assignmentid": "983685814",
    "header.messageid": "505393b7-d9be-4080-a144-fb3293f67f2e",
    "parameters.applicationsincluded": 2,
    "parameters.assignmentmode": 0,
    "parameters.restrictionmode": 0,
    "parameters.assignmentname": "this is the assignment name",
    "parameters.assignmentpreview": 0,
    "parameters.assignmenttype": 1,
    "parameters.displayresults": 0,
    "parameters.playaudio": 1,
    "parameters.questionattemptcount": 44,
    "parameters.totaltime": 6000,
    "parameters.trapalttab": 0,
    "question.1.documentid": 1,
    "question.1.filename": "",
    "question.1.questioncab": "http://www.bycyabyby.com/traituncate/excel.task.2.2.cab",
    "question.1.questionid": "19",
    "question.1.questionmetadata": "book.application.chapter.document.task.scenario",
    "question.1.questionname": "shading a paragraph.",
    "question.1.questionorder": 0,
    "question.1.questionstepcontenturl": "www.cya.com/resources/1223/1223.cab",
    "question.1.questionstephintsoundurl": "http://billi/content/taitdemo/resources/audio/excel.task.2.2.mp3",
    "question.1.remainingattempts": 50,
    "question.1.skipquestion": 0,
    "question.1.playaudio": 1,
    "question.count": 1
};

/**
* @desc This is minimal assignment and config data to launch kepler.
*/
var minumumConfig = {
    "lmsData": JSON.stringify(__lmsData),
    "config": JSON.stringify(__config),
    "assignment": JSON.stringify(__assignment)
};

/**
* @desc This is mapping of LMS functions to kepler function id for communicate with kepler.
* function callbacks are added to this object dynamicaly to give acknowledgement to LMS.
*/
var lmsFuncToFId = {
    //Calls from LMS to Kepler.
    loadTask: { fid: 0 },
    loadInteractionPhase: { fid: 12 },
    retryInteractionPhase: { fid: 14 },
    setVolume: { fid: 16 },
    showClosedCaptions: { fid: 18 },
    startPlaying: { fid: 20 },
    stopPlaying: { fid: 22 },
    gotoNextStep: { fid: 24 },
    gotoPreviousStep: { fid: 26 },
    gotoStep: { fid: 29 },
    showKeyboard: { fid: 33 },
    setFocus: { fid: 36 },
    setSpeed: { fid: 39 },
    //Calls from Kepler to LMS.
    loadTaskAck: { fid: 1 },
    loadInteractionPhaseAck: { fid: 13 },
    retryInteractionPhaseAck: { fid: 15 },
    setVolumeAck: { fid: 17 },
    showClosedCaptionsAck: { fid: 19 },
    startPlayingAck: { fid: 21 },
    stopPlayingAck: { fid: 23 },
    gotoNextStepAck: { fid: 25 },
    gotoPreviousStepAck: { fid: 27 },
    gotoStepAck: { fid: 30 },
    showKeyboardAck: { fid: 34 },
    setFocusAck: { fid: 37 },
    setFocusToPlayer: { fid: 38 },
    setSpeedAck: { fid: 40 },
    updateCurrenttime: { fid: 44 },
    updateClosedCaption: { fid: 45 }
};

ZEUS.KeplerPlayer.CommunicatorAPI = {
    //API's for LMS and Kepler to Communicator calls
    fnMsgToKepler: MsgToKepler,
    fnOnCreate: OnCreate,
    fnMsgFromKepler: MsgFromKepler,
    fnOnKeplerAPILoad: OnKeplerAPI_Load,
    fnAPICommunicatorReady: onAPICommunicatorReady,
    fnIsHBPAPIPresent: IsHBPAPIPresent,
    getInstructionText: GetInstructionText
};


/**
 * @function
 * @desc Check hbp API is present or not.
 */
function IsHBPAPIPresent() {
    return hbp_api_present;
}

/**
 * @function
 * @desc Return current item instruction text from tait file.
 *		 It will return blank string if kepler loadtask is not completed. so, make sure it
 *		 should be calledafter loadtask of kepler is completed.
 */
function GetInstructionText() {
    var strInstruction = "";
    try {
        strInstruction = Kepler.Engine.Core.EngineApp.get_engine().get_taskMaster().getCurrentItem().get_description();
    }
    catch (ex) {

    }
    return strInstruction;
}

/**
 * @function
 * @desc Excecute callback functions and pass JSON data object.
 * @params {array object} oAckCallBackFuncList callback functions list to be excecuted.
 * @params {object} data response JSON to LMS as per function.
 */
function ExecuteCallBack(oAckCallBackFuncList, data) {
    fnCallBacks = oAckCallBackFuncList.fnCallBacks;
    if (fnCallBacks) {
        for (var i = 0; i < fnCallBacks.length; i++) {
            fnCallBacks[i].apply(lms_api, [data]);
        }
    }
    else {
        _hbp.log("No callback function provided.");
    }
}


/**
* @function
* @desc api_player will trigger this event once Kepler player is read.
*       <br/>LMS will be informed by calling OnPlayerReady function and the LMS should register their OnCreate and OnData fnCallBacks to this communicator using SetHandlers at this time.
*/
function OnKeplerAPI_Load() {
    // KeplerAPI is part of the 'api_player.js' which will internally communicate with Kepler system.
    kepler = ZEUS.KeplerAPI;

    // Find the reference to LMS API by searching in parent window.
    lms_api = FindLmsApi();

    SetHandlers(OnCreate, MsgFromKepler);
}

/**
 * @function
 * @desc Forwarding to api_player.
 *       So, api_player can directly talk to LMS using this callback handlers.
 */
function SetHandlers(OnCreate, OnData) {
    kepler.SetHandlers(OnCreate, OnData);
}

/**
* @function
* @desc Kepler-Player is ready to accept data.
*       <br/>This method is called by the Kepler to inform that, it is ready to accept initialization data.
*/
function OnCreate() {
    lms_api.keplerReadyHandler();
}

/**
 * @function
 * @desc All the request from Kepler will catch here.
 *       <br/>Kepler will talk to this LMS using this function by passing functionId that indicates
 *       type of request. And can pass data according to the request type.
 * @params {int} fid Function ID, that defines the type of request.
 *                   <br/>1. INIT - Indicates that Kepler is successfully loaded with the exam data and can now able to start exam.
 *                   <br/>2. INIT_RESPONSE - Response to the INIT call, indicates Kepler to start the exam.
 *                   <br/>4. FINAL_RESULT - Send from Kepler with report data on final exam submission.
 *                   <br/>6. RESULT_RESPONSE - Acknowledgement to the result data indicates successfully accepted the result.
 *                   <br/>13. LOAD_INTERACTION_PHASEACK - Acknowledgement to load interaction phase.
 *                   <br/>15. RETRY_INTERACTION_PHASEACK - Acknowledgement to retry interaction phase.
 *                   <br/>17. SET_VOLUMEACK - Acknowledgement to set volume.
 *                   <br/>19. SHOW_CLOSED_CAPTIONSACK - Acknowledgement to show close captions.
 *                   <br/>21. START_PLAYINGACK - Acknowledgement to start playing.
 *                   <br/>23. STOP_PLAYINGACK - Acknowledgement to stop playing.
 *                   <br/>25. GO_TO_NEXT_STEPACK - Acknowledgement to go to next step.
 *                   <br/>27. GO_TO_PREVIOUS_STEPACK - Acknowledgement to go to previous step.
 * @params {object} data JSON that depends on the request type.
 */
function MsgFromKepler(fid, data) {
    switch (fid) {
        case 1:
            {
                // Kepler is successfully loaded so do INIT_RESPONSE to Kepler to start the exam.
                kepler.Data(2/*INIT_RESPONSE*/, data);

                loadTaskAck(data);
                updateLoadedTime();
                break;
            }
        case 4:
            {
                //Save for final submit.
                // Call external API's SaveState function
                //KEPLER_EXT_API.SaveState(data);
                //lms_api.triggerScoringEvent(data);

                // Response to the successful report-result reception.
                kepler.Data(6/*RESULT_RESPONSE*/, data);
                break;
            }
        case 13:
            {
                loadInteractionPhaseAck(data);
                break;
            }
        case 15:
            {
                //retryInteractionPhase acknowledgement                    
                retryInteractionPhaseAck(data);
                break;
            }
        case 17:
            {
                //setVolume acknowledgement
                setVolumeAck(data);
                break;
            }
        case 19:
            {
                //showClosedCaptions acknowledgement
                showClosedCaptionsAck(data);
                break;
            }
        case 21:
            {
                //startPlaying acknowledgement
                startPlayingAck(data);
                break;
            }
        case 23:
            {
                //stopPlaying acknowledgement
                stopPlayingAck(data);
                break;
            }
        case 25:
            {
                //gotoNextStep acknowledgement
                gotoNextStepAck(data);
                break;
            }
        case 27:
            {
                //gotoPreviousStep acknowledgement
                gotoPreviousStepAck(data);
                break;
            }
        case 28:
            {
                //Save scoring details.
                raiseScoringEvent(data);
                break;
            }
        case 30:
            {
                gotoStepAck(data);
                break;
            }
        case 31:
            {
                raiseStepEvent(data);
                break;
            }
        case 32:
            {
                RaiseError(data.msgData.responseData);
                break;
            }
        case 34:
            {
                showKeyboardAck(data);
                break;
            }
        case 35:
            {
                raiseKeyboardStateEvent(data);
                break;
            }
        case 36:
            {
                setFocus();
                break;
            }
        case 37:
            {
                setFocusAck();
                break;
            }

        case 38:
            {
                setFocusToPlayer();
                break;
            }
        case 41:
            {
                UserRequest(data);
                break;
            }
        case 44:
            {
                //Set Current Time
                updateCurrenttime(data);
                break;
            }
        case 45:
            {
                updateClosedCaption(data);
                break;
            }
    }
}

/**
 * @function
 * @desc Call from LMS to send any data. Will be forwarded to api_player.
 * @params {string} fnName Function name.
 * @params {object} data JSON containing assignment and config data.
 * @params {array object} fnCallBacks LMS callbacks functions to callBacks for acknowledgement to LMS this task 
 *                          <br/>is excecuted successfully.
 */
function MsgToKepler(fnName, data, fnCallBacks) {

    var errorData = null;

    try {
        var fnPointer = eval(fnName);
        errorData = fnPointer.apply(this, [data, fnCallBacks]);
        kepler.Data(lmsFuncToFId[fnName].fid, keplerData);
    }
    catch (ex) {
        _hbp.error("Exception: " + ex.message);
    }
}

/**
 * @function
 * @desc Call from LMS to load task.
 * @params {object} data send by LMS.
 * @params {array object} fnCallBacks callbacks to LMS API when task completed.
 */
function loadTask(data, fnCallBacks) {

    _hbp.log("Kepler received loadtask event from LMS.");

    taskData = data;
    var taskDetail = data.taskDetail;
    var taskID = taskDetail.taskId;

    var errorData = null;
    //Currently considering task will load in Noraml trainning mode.

    keplerData = CloneMinumumConfigAndAssignment();

    var validMode = ["Hint", "Assessment", "Video"];

    if (validMode.indexOf(data.learningMode) != -1) {
        data.simMode = data.learningMode;
    }
    if (validMode.indexOf(data.simMode) === -1) {
        _hbp.warn("LearningMode should either be Hint, Assessment as per documentation not " + data.simMode);
        data.simMode = "Hint"; //setting training as default simMode
    }

    taskData = data;
    var taskDetail = data.taskDetail;
    var taitPath = taskDetail.taskPath;
    if (taskDetail.bCMSlauncherPresent) {
        taitPath += taskDetail.taskId;
        taitPath += "/" + taskDetail.taskId + ".json";
    }
    else {
        if (taskDetail.scenarioPosition) {
            taitPath += "/" + taskDetail.taskId + ".json";
        }
        else {
            taitPath += "/" + taskDetail.taskId + ".json";
        }
    }

    var config = JSON.parse(keplerData.msgData.config);
    //config["interactionphase"] = data.simMode;            

    var assignment = JSON.parse(keplerData.msgData.assignment);
    config["parameters.showtaskbar"] = "0";
    assignment["question.1.questionid"] = taskDetail.taskId;
    assignment["question.1.filename"] = taitPath;

    if (data.simMode === "Hint") {
        //Set Assignment type to HINT_SHOWME as per(ASSIGNMENT_TYPE)
        assignment["parameters.assignmenttype"] = 1;
    }
    else if (data.simMode === "Assessment") {
        //Set Assignment type to NONE as per(ASSIGNMENT_TYPE)
        assignment["parameters.assignmenttype"] = 0;

    }
    else if (data.simMode === "Video") {
        //Set Assignment type to VIDEO as per(ASSIGNMENT_TYPE)
        assignment["parameters.assignmenttype"] = 4;
        config["parameters.accessibility"] = 0;
    }
    config["recoveryparams.restartfromquestionid"] = assignment["uniquetaskid"] = taskID;
    keplerData.msgData.config = JSON.stringify(config);
    keplerData.msgData.assignment = JSON.stringify(assignment);

    var errorData = {
        "errorType": "taskError",
        "description": "An error occurred during loading of the task.",
        "taskId": taskDetail.taskId
    }

    keplerData.msgData.responseData.simMode = data.simMode;
    keplerData.msgData.responseData.taskId = taskDetail.taskId;


    lmsFuncToFId.loadTaskAck.fnCallBacks = fnCallBacks;

    return errorData;

}

/**
 * @function
 * @desc Call from Kepler to acknowledgement loadtask.
 * @params {object} data send by Kepler.
 */
function loadTaskAck(data) {

    _hbp.log("Kepler response to loadtask");

    var responseData = keplerData.msgData.responseData;
    var simMode = taskData.simMode;


    var lmsdata = {
        "simMode": taskData.simMode,
        "event": "taskLoaded",
        "taskId": taskData.taskDetail.taskId,
        "questionText": data.msgData.responseData.question
    }
    bKeplerLoaded = true;

    ExecuteCallBack(lmsFuncToFId.loadTaskAck, lmsdata);

}

/**
* @function
* @desc Call from Kepler to tell engine that new step is loaded.
* @params {object} data send by Kepler.
*/
function getTranscriptData() {
    var arrTranscriptData = "";
    try {
        arrTranscriptData = Kepler.Engine.Core.EngineApp.get_engine().getTranscriptDataForCurrentTask();
    }
    catch (ex) {

    }
    return arrTranscriptData;
}

/**
 * @function
 * @desc Call from Kepler to tell engine that new step is loaded.
 * @params {object} data send by Kepler.
 */
function raiseStepEvent(data) {
    var stepNumber = data.msgData.responseData.stepNumber;

    //update task data.
    taskData.requestedStepNumber = stepNumber;
    taskData.stepNumber = stepNumber;

    var timeIndex = 60 * stepNumber;
    var lmsRetData = {
        "event": "stepLoaded",
        "stepNumber": stepNumber,
        "timeIndex": timeIndex
    }
    lms_api.stepEventHandler(lmsRetData);
}
/**
 * @function
 * @desc Call from LMS to load interaction phase Intro, Observe, Practice and Apply.
 * @params {object} data send by LMS.
 * @params {array} fnCallBacks callbacks to LMS API when task completed.
 */
function loadInteractionPhase(data, fnCallBacks) {

    var errorData = null;

    if (bKeplerLoaded) {
        if (taskData.taskDetail.recordMode && taskData.taskDetail.recordMode == 1) {
            data.phaseName = "Observe";
        }
        taskData.phaseName = data.phaseName;
        taskData.requestedStepNumber = 1;

        keplerData.msgData.responseData = data || {};

    }

    var errorData = {
        "errorType": "phaseError",
        "description": "An error occurred during selection of phase of the task.",
        "taskId": taskData.taskDetail.taskId
    }

    lmsFuncToFId.loadInteractionPhaseAck.fnCallBacks = fnCallBacks;

    return errorData;
}

/**
 * @function
 * @desc Call from Kepler to acknowledgement loadInteractionPhase.
 * @params {object} data send by Kepler.
 */
function loadInteractionPhaseAck(data) {

    _hbp.log("Kepler response to loadInteractionPhase");
    taskData.stepNumber = taskData.requestedStepNumber;
    var phaseName = keplerData.msgData.responseData.phaseName;
    var totalSteps = keplerData.msgData.responseData.totalSteps;
    var totaltime = keplerData.msgData.responseData.totaltime;
    var stepList = keplerData.msgData.responseData.jumps;
    var captions = keplerData.msgData.responseData.captions;
    var lmsData = {
        "phaseName": phaseName,
        "event": "phaseLoaded",
        "totalSteps": totalSteps,
        "totaltime": totaltime,
        "stepList": stepList,
        "captions": captions
    }


    //loadInteractionPhase acknowledgement
    ExecuteCallBack(lmsFuncToFId.loadInteractionPhaseAck, lmsData);
}

//Not implemented yet.
function retryInteractionPhase(data, fnCallBacks) {

    _hbp.log("retryInteractionPhase : Not Implemented Exception.");
    stepNumber = taskData.requestedStepNumber;

    keplerData.msgData.responseData = {
        "stepNumber": stepNumber
    };

    var errorData = {
        "errorType": "stepError",
        "description": "An error occurred during selection of phase of the task.",
        "taskId": taskData.taskDetail.taskId
    }

    lmsFuncToFId.retryInteractionPhaseAck.fnCallBacks = fnCallBacks;

    return errorData;
}

//Not implemented yet.
function retryInteractionPhaseAck(data) {

    taskData.stepNumber = taskData.requestedStepNumber;
    stepNumber = taskData.stepNumber;
    var timeIndex = 60 * stepNumber;
    var lmsData = {
        "event": "stepLoaded",
        "stepNumber": stepNumber,
        "timeIndex": timeIndex
    };

    ExecuteCallBack(lmsFuncToFId.retryInteractionPhaseAck, lmsData);
}

/**
 * @function
 * @desc Call from LMS to set volume.
 * @params {object} data send by LMS.
 * @params {array} fnCallBacks callbacks to LMS API when task completed.
 */
function setVolume(data, fnCallBacks) {

    keplerData.msgData.responseData = data || {};

    var errorData = {
        "errorType": "soundError",
        "description": "An error occurred during turning on/off volume.",
        "taskId": taskData.taskDetail.taskId
    }

    lmsFuncToFId.setVolumeAck.fnCallBacks = fnCallBacks;

    return errorData;
}

function setVolumeAck(data) {

    var event = keplerData.msgData.responseData.volume ? "soundOn" : "soundOff";
    taskData.volume = keplerData.msgData.responseData.volume;
    var lmsData = {
        "event": event
    };
    ExecuteCallBack(lmsFuncToFId.setVolumeAck, lmsData);
}

//Not implemented yet.
function showClosedCaptions(data, fnCallBacks) {

    keplerData.msgData.responseData["showCaptions"] = data.showCaptions;

    lmsFuncToFId.showClosedCaptionsAck.fnCallBacks = fnCallBacks;

    var errorData = {
        "errorType": "ccError",
        "description": "An error occurred during turning on/off Closed Captioning.",
        "taskId": taskData.taskDetail.taskId
    }

    return errorData;
}

function showClosedCaptionsAck(data) {

    var lmsData = {
        "event": "ccOn"
    }
    ExecuteCallBack(lmsFuncToFId.showClosedCaptionsAck, lmsData);
}

/**
 * @function
 * @desc Call from LMS to kepler for play the audio/video/animation.
 * @params {object} data send by LMS.
 * @params {array} fnCallBacks callbacks to LMS API when task is performed.
 */
function startPlaying(data, fnCallBacks) {
    keplerData.msgData.responseData = data || {};
    lmsFuncToFId.startPlayingAck.fnCallBacks = fnCallBacks;
    var errorData = {
        "errorType": "playError",
        "description": "An error occurred during start of simulation playing.",
        "taskId": taskData.taskDetail.taskId
    }
    return errorData;

}

function startPlayingAck(data) {
    //TODO:data should contains timeindex.
    var lmsData = {
        "event": "started",
        "timeIndex": "0"
    }
    ExecuteCallBack(lmsFuncToFId.startPlayingAck, lmsData);
}

/**
 * @function
 * @desc Call from LMS to kepler for show/hide keyboard.
 * @params {object} data send by LMS.
 * @params {array} fnCallBacks callbacks to LMS API when keyboard is shown/hidden.
 */
function showKeyboard(data, fnCallBacks) {

    taskData.showKeyboard = data.showKeyboard;
    keplerData.msgData.responseData = data || {};
    lmsFuncToFId.showKeyboardAck.fnCallBacks = fnCallBacks;

    var errorData = {
        "errorType": "keyboardError",
        "description": "An error occurred in show/hide keyboard.",
        "taskId": taskData.taskDetail.taskId
    };
    return errorData;
}

//Not implemented yet.
function showKeyboardAck(data) {

    _hbp.log("Kepler response to showKeyboard.");
    var lmsData = {
        "event": "onscreenKeyboardEvent",
        "visible": taskData.showKeyboard
    };
    ExecuteCallBack(lmsFuncToFId.showKeyboardAck, lmsData);
}

function raiseKeyboardStateEvent(data) {
    _hbp.log("RaiseKeyboardStateEvent : " + data.msgData.responseData.showKeyboard);
    var lmsData = {
        "event": "onscreenKeyboardEvent",
        "visible": data.msgData.responseData.showKeyboard
    };

    //lms_api.fnRaiseKeyboardStateEvent(lmsData);
}

function setFocus() {
    //lmsFuncToFId.showKeyboardAck.fnCallBacks = fnCallBacks;

    var errorData = {
        "errorType": "focusShiftError",
        "description": "An error occurred while shifting focus from player to SIM.",
        "taskId": taskData.taskDetail.taskId
    };
    return errorData;
}

function setFocusAck() {

}

function setFocusToPlayer() {
    _hbp.log("Setting Focus To Player");
    var lmsData = {};

    lms_api.setFocusToPlayer(lmsData);
}

/**
 * @function
 * @desc Call from LMS to kepler for stop the audio/video/animation.
 * @params {object} data send by LMS.
 * @params {array} fnCallBacks callbacks to LMS API when task is performed.
 */
function stopPlaying(data, fnCallBacks) {
    keplerData.msgData.responseData = data || {};
    lmsFuncToFId.stopPlayingAck.fnCallBacks = fnCallBacks;

    var errorData = {
        "errorType": "playError",
        "description": "An error occurred during start of simulation playing.",
        "taskId": taskData.taskDetail.taskId
    }

    return errorData;
}

function stopPlayingAck(data) {

    //TODO: data should contains timeIndex value.
    var lmsData = {
        "event": "stopped",
        "timeIndex": "60"
    }
    ExecuteCallBack(lmsFuncToFId.stopPlayingAck, lmsData);
}

//Not implemented yet.
function gotoNextStep(data, fnCallBacks) {

    _hbp.log("gotoNextStep : Not Implemented Exception.");
    lmsFuncToFId.gotoNextStepAck.fnCallBacks = fnCallBacks;
}

//Not implemented yet.
function gotoNextStepAck(data) {

    _hbp.log("gotoNextStepAck : Not Implemented Exception.");

    var lmsData = {
        "event": "previousStepEnabled",
        "timeIndex": "60"
    }
    ExecuteCallBack(lmsFuncToFId.gotoNextStepAck, lmsData);
}

//Not implemented yet.
function gotoPreviousStep(data, fnCallBacks) {

    _hbp.log("gotoPreviousStep : Not Implemented Exception.");
    lmsFuncToFId.gotoPreviousStep.fnCallBacks = fnCallBacks;
}

//Not implemented yet.
function gotoPreviousStepAck(data) {

    _hbp.log("gotoPreviousStepAck : Not Implemented Exception.");
    var lmsdata = {
        "event": "previousStepDisabled",
        "timeIndex": 0
    }

    ExecuteCallBack(lmsFuncToFId.gotoPreviousStepAck, lmsData);
}

function gotoStep(data, fnCallBacks) {

    taskData.requestedStepNumber = data.stepNumber;

    keplerData.msgData.responseData = data || {};

    //If Total steps are present then. validate total steps.
    lmsFuncToFId.gotoStepAck.fnCallBacks = fnCallBacks;

    var errorData = {
        "errorType": "stepError",
        "description": "An error occurred while loading step.",
        "taskId": taskData.taskDetail.taskId
    }

    return errorData;
}

function gotoStepAck(data) {
    taskData.stepNumber = taskData.requestedStepNumber;
    stepNumber = taskData.stepNumber;

    var timeIndex = 60 * stepNumber;
    var lmsData = {
        "event": "stepLoaded",
        "stepNumber": stepNumber,
        "timeIndex": timeIndex
    };

    //gotoStep acknowledgement
    ExecuteCallBack(lmsFuncToFId.gotoStepAck, lmsData);
}

function raiseScoringEvent(data) {

    var lmsData = {
        "event": data.msgData.responseData.event,
        "playbackDetails": data.msgData.playbackData
    };

    lms_api.scoringEventHandler(lmsData);
}

/**
 * @function
 * @desc Clone minimum assignment and config data.     
 */
function CloneMinumumConfigAndAssignment() {

    var data = {};
    data.lmsData = minumumConfig.lmsData;
    data.rcode = 0;
    data.msgData = { "config": minumumConfig.config, "assignment": minumumConfig.assignment, "playbackData": null, "responseData": {} };
    return data;
}

/**
 * @function
 * @desc When any error occur it will raise error to LMS.     
 * @params {object} error data which contains error details.
 */
function RaiseError(errorData) {
    lms_api.raiseError(errorData)
}

/**
 * @function
 * @desc when there is a user request that the engine cannot handle
 * @params {object} identifies that the event is a userRequest and a name that identifies the action that the user did to generate the request
 */
function UserRequest(data) {

    _hbp.log("user request event");

    var lmsData = {
        "event": data.msgData.responseData.event,
        "name": data.msgData.responseData.name
    };

    lms_api.userRequest(lmsData);
}


/**
 * @function
 * @desc Call from LMS to set speed.
 * @params {object} data send by LMS.
 * @params {array} fnCallBacks callbacks to LMS API when set speed task completed.
 */
function setSpeed(data, fnCallBacks) {

    keplerData.msgData.responseData = data || {};

    var errorData = {
        "errorType": "speedError",
        "description": "An error occurred while setting speed.",
        "taskId": taskData.taskDetail.taskId
    }

    lmsFuncToFId.setSpeedAck.fnCallBacks = fnCallBacks;

    return errorData;
}

function setSpeedAck(data) {

    var event = "";
    taskData.speed = keplerData.msgData.responseData.speed;

    var lmsData = {
        "event": event
    };
    ExecuteCallBack(lmsFuncToFId.setSpeedAck, lmsData);
}

function updateClosedCaption(data) {
    if (lms_api && lms_api.updateClosedCaptionHandler && typeof lms_api.updateClosedCaptionHandler === "function") {
        lms_api.updateClosedCaptionHandler(data.msgData.responseData.caption);
    }
}


function updateCurrenttime(data) {
    if (lms_api && lms_api.updateTimerEventHandler && typeof lms_api.updateTimerEventHandler === "function") {
        lms_api.updateTimerEventHandler(data);
    }
}
/**
* @function
* @desc Find Kepler's external API by searching in the parent window hierarchy.
* @returns {ZEUS.ContentEngine} Reference to Kepler's external API to communicate with the launcher.
*/
function FindLmsApi() {
    var ext_api = null;
    /* var win = GetParentOrOpenerWindow(window);

    while (win) {
        try {
            if (typeof win.HBP.LMSAPIModule != undefined) {
                // Check the presence of api_lms.js' in parent window for communication
                // ext_api = win.ContentPlayer.App.Engines.zeus.module;
                // ext_api = win.HBP.LMSAPIModule;
                // Extended check for the presence of version member
                // if (!ext_api.API_VERSION) {
                //  ext_api = null;
                // }
            }
        }
        catch (ex) {
            ext_api = null;
        }

        // If API found, then break the loop. Otherwise try for next level of parent/opener window.
        if (ext_api) {
            break;
        } else {
            win = GetParentOrOpenerWindow(win);
        }
    } */
    ext_api = window.HBP.LMSAPIModule;

    return ext_api;
}

/**
 * @function
 * @desc Get parent window by searching in the parent/opener hierarchy.
 *       If parent is not valid then will return reference of opener.
 * @param {window} win Reference to the current window, whose parent is being asked.
 * @returns {window} Reference to the parent/opener window.
 */
function GetParentOrOpenerWindow(win) {
    var winParent;
    if (win == win.parent) {
        winParent = win.opener;
    } else {
        winParent = win.parent;
    }

    if (winParent) {
        try {
            if (!winParent.name && winParent.name != "") {
                winParent = null;
            }
        } catch (ex) {
            // In cross-domain popup, accessing property is not allowed.
            winParent = null;
        }
    }

    return winParent;
}

/**
 * @function
 * @desc Clone a given object
 * @param {obj} JSON object to be clone.
 * @return {temp} JSON object which is cloned using obj.
 */
function Clone(obj) {
    if (obj == null || typeof (obj) != 'object')
        return obj;

    var temp = obj.constructor();

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = this.Clone(obj[key]);
        }
    }
    return temp;
}

function onAPICommunicatorReady() {
    /**
    * Binding playerReady even to the document.
    * This event will be fired by api_player when the Kepler-player is ready to accept exam data.
    */
    $(document).on('playerReady', function () {
        ZEUS.KeplerPlayer.CommunicatorAPI.fnOnKeplerAPILoad();
        if (lms_api && typeof lms_api.playerReadyHandler === "function") {
            lms_api.playerReadyHandler.apply(lms_api, arguments);
        }
    });
}

function updateLoadedTime() {
    var elmTimeLogger = document.getElementById("timeLogger");

    if (window.parent.location.search.indexOf("logtime") != -1) {
        elmTimeLogger.style.display = "block";
        var startTime = timeLogger.getAttribute("startTime");
        var currentText = elmTimeLogger.innerHTML;

        var timediff = new Date().getTime() - parseInt(startTime);
        elmTimeLogger.innerHTML = currentText + "<br/>Task loaded :" + timediff;
        timeLogger.setAttribute("startTime", new Date().getTime());

    }
}




/*!
 *   COPYRIGHT 2014 Zeus Systems Pvt. Ltd.
 *   THE FOLLOWING CODE IS PROPRIETARY AND MAY NOT BE USED, COPIED, MODIFIED OR DISTRIBUTED IN ANY WAY WITHOUT AN EXPRESS LICENSE FROM ZEUS SYSTEMS PVT. LTD.  [Contact us at: contact@zeuslearning.com].
 *   UNAUTHORIZED USE IS ILLEGAL AND STRICTLY PROHIBITED.
 */
