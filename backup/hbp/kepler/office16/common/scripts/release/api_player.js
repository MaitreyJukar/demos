/**
 * @desc Wrapper that accept data from LMS to communicate with Kepler and vice versa.
 *       Communication wrapper that generates a bridge between Kepler-player and LMS.
 */

/**
* @callback
* @desc Handler for OnCreate call.
*/
var createHanlder = null;

/**
 * @callback
 * @desc Handler for OnData call.
 */
fnOnData = null;

/**
 * @global
 * @var {bool}
 * @desc true after document ready.
 */
isDocReady = false;

/**
 * @global
 * @var {bool}
 * @desc true after Kepler-player is ready to accept data.
 */
isPlayerReady = false;

ZEUS.KeplerAPI = {

    //Api's for CommunicatorApi to Kepler calls
    Data: Data,
    SetHandlers: SetHandlers,
    fnDocReady: playerDocOnReady,
    fnSendPlayerReady: sendPlayerReady,
    fnApi_lmshandler: api_lmshandler,
    fnApi_playerhandler: api_playerhandler,
    fnSetplayerhandler: setPlayerhandler
};

/**
* @function
* @desc Set Handler for OnCreate and OnData callbacks.
*       <br/>- OnCreate will be invoked when Kepler is loaded and ready to accept exam data.
*       <br/>- OnData will be invoked from Kepler when it wants to send/notify something to LMS.
*/
function SetHandlers(OnCreate, OnData) {
    createHanlder = OnCreate;
    fnOnData = OnData;
};

/**
* @function
* @desc Set kepler player handler to communicate kepler-player.
*/
function setPlayerhandler(handler) {
    this.fnApi_playerhandler = handler;
}

/**
 * @function
 * @desc Call from LMS to send any data.
 * @params {int} fid Function ID - it is the request type.
 *                   <br/>1. INIT - Indicates that Kepler is successfully loaded with the exam data and can 
 *                   now able to start exam.
 *                   <br/>2. INIT_RESPONSE - Response to the INIT call, indicates Kepler to start the exam.
 *                   <br/>4. FINAL_RESULT - Send from Kepler with report data on final exam submission.
 *                   <br/>6. RESULT_RESPONSE - Acknowledgement to the result data indicates successfully 
 *                   accepted the result.
 * @params {object} data JSON containing assignment and config data.
 */
function Data(fid, data) {
    this.fnApi_playerhandler(fid, data);
};

/**
* @function
* @desc Set document ready status true.
*       It also checks if Kepler-player is ready and then only call final PlayerReady function.
*/
function playerDocOnReady() {
    isDocReady = true;
    if (isPlayerReady) {
        sendPlayerReady();
    }
}

/**
* @function
* @desc Triggers player ready event to inform LMS api (api_lms) about Kepler-player is ready.
*       And invoke {@link createHanlder} callback function to initialize LMS api.
*/
function sendPlayerReady() {
    $(document).trigger('playerReady');
    createHanlder();
}

/**
* @function
* @desc LMS handler function invoked by Kepler-player to send some data.
*       All requests will be forwarded to LMS api (api_lms) by invoking {@link fnOnData} callback.
*       Only PLAYER_READY request is not directly forwarded to LMS until we ensures that the document is also ready.
*       When document is ready and Kepler-player is ready then only we inform LMS to send exam data.
* @params {int} fid Function ID - it is the request type.
*                   <br/>10. PLAYER_READY - Indicates that Kepler-player is loaded and ready to accept exam data.
* @params {object} data JSON containing assignment and config data.
*/
function api_lmshandler(iFunId, oData) {
    if (iFunId == 10/*PLAYER_READY*/) {
        isPlayerReady = true;
        // If document is not ready then wait for the api_player_DocOnReady(..) call
        if (isDocReady) {
            sendPlayerReady();
        }
    }
    else {
        // Invoke callback of LMS api.
        fnOnData(iFunId, oData);
    }
}

/**
 * @function
 * @desc api_playerhandler will be overridden by the Kepler's runtime function handler.
 *       On calling this function we can talk to Kepler-player.
 */
function api_playerhandler(iFunId, oData) {
    alert("PlayerHandler funID=" + iFunId);
}


