var ttsDiv;
/* Voice options START */
var oTTSVoices = new Object();
oTTSVoices.English = new Object();
oTTSVoices.Spanish = new Object();

oTTSVoices.English.Male = new Object();
oTTSVoices.English.Female = new Object();

oTTSVoices.Spanish.Male = new Object();
oTTSVoices.Spanish.Female = new Object();

oTTSVoices.English.Male.Tom = "ScanSoft Tom_Full_22kHz";
/*
oTTSVoices.English.Male.Daniel = "ScanSoft Daniel_Full_22kHz";
oTTSVoices.English.Male.Paul = "VW Paul";
*/

oTTSVoices.English.Female.Jill = "ScanSoft Jill_Full_22kHz";
/*
oTTSVoices.English.Female.Emily = "ScanSoft Emily_Full_22kHz";
oTTSVoices.English.Female.Kate = "VW Kate";
*/

oTTSVoices.Spanish.Female.Penelope = "IVONA 2 Penelope - Spanish (US) female voice [22kHz]";
/*
oTTSVoices.Spanish.Female.Miguel = "IVONA 2 Miguel - Spanish (US) male voice [22kHz]";    //outside discovery contract
oTTSVoices.Spanish.Female.Paulina = "ScanSoft Paulina_Full_22kHz";    //outside discovery contract
oTTSVoices.Spanish.Female.Isabel = "ScanSoft Isabel_Full_22kHz";    //outside discovery contract
*/

function ChangeTTSVoice(strVoice, strButtonParentId) {
    if (strButtonParentId) $("#" + strButtonParentId).data("TTSVoice", strVoice);
}

/* Voice options END */
function initializeTextHelp(strRangeTextColor, strRangeBackgroundColor, strWordTextColor, strWordBakgroundColor) {
    
    // try
    // {
    /* +++ User customisable parameters start here. +++ */
    //eba_icons = main_icons + calculator_icon; // This determines which toolbar icons are shown.
    //eba_icons = main_icons + pronedit_icon + proncreate_icon;
    eba_use_html5 = true;
    eba_icons = no_bar;
    //eba_annotate_persist_highlights = true;
    //eba_play_start_point = "speechContent2";
    //eba_voice = "ScanSoft Jill_Full_22kHz";
    //eba_no_display_icons = play_icon + pause_icon;
    //eba_hidden_bar = true;
    ////eba_check_pronunciation_before_cache = true;
    eba_login_name = "discoveryeducation";
    eba_server = "discoveryeducation.speechstream.net";
    eba_speech_server = "discoveryeducation.speechstream.net";

    eba_cust_id = "1740"                              // This determines the customers unique ID 
    //eba_book_id = "0512";                           // This determines the book unique ID ;
    //eba_page_id = "0513";

    ////          eba_cust_id = "1740"                              // This determines the customers unique ID 
    //  eba_book_id = strBookId                           // This determines the book unique ID 
    //eba_page_id = strPageId                           // This determines the page unique ID

    //eba_date_filter_mode = SpeechStream.DateFilterModes.NUMBER;
    //eba_book_id = "051213";                           // This determines the book unique ID ;
    //eba_page_id = "051334";
    //eba_book_id = "786";//"051213";                           // This determines the book unique ID ;
    //eba_page_id = "abc";//"051334";
    //eba_clientside_pronunciation = true;
    eba_math = true;
    //eba_symbol_text = '-:minus;';
    //    eba_book_id = "5";                           // This determines the book unique ID ;
    //    eba_page_id = "2601";

    //eba_login_name = "rwonline"; 		// Note that this login name should be changed to the username for your account.
    //eba_voice = "ScanSoft Tom_Full_22kHz"; // This specifies the voice to use, Samantha is the US female voice.
    //eba_server = "speechus.texthelp.com"; 	// This should match the domain that is in the initial line.
    //eba_speech_server = "speechus.texthelp.com"; // This determines the speech server to use (start with speechus or speechuk).

    eba_speech_range_colors = "color:" + strRangeTextColor + "; background:" + strRangeBackgroundColor;
    eba_speech_word_colors = "color:" + strWordTextColor + "; background:" + strWordBakgroundColor;
    eba_page_complete_callback = "readNext()";
    eba_speech_complete_callback = "newLineComplete";
    eba_rendering_speech_callback = "newLineStarted";
    //eba_mp3_callback = "temp()";
    //eba_no_title = true;
    //eba_override_x = 830;
    //eba_override_y = 0;
    //eba_speak_selection_by_sentence = false;

    //eba_inline_img = true;
    //eba_login_name = "zeuslearning";
    //eba_login_password = "taw87Thebr";

    eba_use_commands = true;

    /* +++ End of user customisable parameters section. +++ */
    var strLanguage = "en"//queryString('Lang');

    //alert(SPANISH + " strLanguage " + strLanguage);
    switch (strLanguage) {
        case "es":
            {
                eba_language = SPANISH;
                eba_voice = oTTSVoices.Spanish.Female.Penelope;
                break;
            }
        default:
            {
                eba_voice = oTTSVoices.English.Male.Tom; // This specifies the voice to use, Samantha is the US female voice.
                break;
            }
    }
    strDefaultTTSVoice = eba_voice;
    //$rw_barInit();
    //} catch (err) { alert("Init Error") }
}

function $rw_userParameters() {
    initializeTextHelp("blue", "transparent", "orange", "transparent");
}

var strDefaultTTSVoice;
var intCurrentIdIndex;
var arrId = new Array();
var strDivID = "";
var strDivText = "";
var strNextFocusElem = "";
var g_bSpeechPaused = false;
var g_bPauseTimeout = null;
function speakElementsById(_arrId) {
    arrId = _arrId;
    if (arrId.length != 0) {
        intCurrentIdIndex = 0;
        strDivID = arrId[intCurrentIdIndex];

        //SetHackDivVariables();

        $rw_speakById(arrId[intCurrentIdIndex]);
    }
}

function SetHackDivVariables() {
    strDivID = arrId[intCurrentIdIndex];
    var oHackDiv = $("#" + strDivID + "_hack");

    if (oHackDiv) {
        strDivText = oHackDiv.html();
        oHackDiv.html("");
    }
}

var TTSFinishedReadingDiv;

function readNext() {
    intCurrentIdIndex++;
    if (intCurrentIdIndex < arrId.length) {
        //SetHackDivData();
        //SetHackDivVariables();
        //alert(document.getElementById(arrId[intCurrentIdIndex]).innerHTML)

        //Calls a callback function with the first parameter indicating the id of the div which has been read and the second parameter indicating the id of the div which is going to be read
        if (TTSFinishedReadingDiv != null) TTSFinishedReadingDiv(arrId[intCurrentIdIndex - 1], arrId[intCurrentIdIndex]);

        $rw_speakById(arrId[intCurrentIdIndex]);
    }
    else {
        //Calls a callback function with the first parameter indicating the id of the div which has been read and the second parameter indicating the id of the div which is going to be read
        if (TTSFinishedReadingDiv != null) TTSFinishedReadingDiv(arrId[intCurrentIdIndex - 1], null);

        //clearInterval(nScrollInterval);   // alert(strNextFocusElem)
        m_bPlaySpeaker = true;
        // Manager.SetFocus(strNextFocusElem);
        ResetTTSIconState();
        /*$(".TTSSpeaker").each(function ()
        {
        Manager.SetTTSAccMessage($(this).parent().attr('id'), Manager.GetAccMessage("TTS_ACC_TEXT", 0));
        if (Shell && Shell.ChangeTooltipText)
        Shell.ChangeTooltipText($(this).parent().parent().attr('id'), Manager.GetMessage("Listen_tooltip", 0));
        })*/
        ////           //commented for Voice Change
        ////           setTimeout(function () {
        ////               Manager.SetFocus(ParentDiv)
        ////           }, 50);
        if (typeof (ResetSpeakerButtonFlags) == "function") {
            ResetSpeakerButtonFlags();
        }
        $rw_setVoice(strDefaultTTSVoice);
        setTimeout(function () { Manager.SetFocus(ttsDiv) }, 5)
    }

}

function ResetTTSIconState() {
    $(".TTSSpeaker").attr('state', 'inactive').removeClass(function (index, className) {
        var matches = className.match(/(SpeakerPaused[_a-z0-9]*)/gi) || [];
        var matches2 = className.match(/(SpeakerPlay[_a-z0-9]*)/gi) || []
        var strReturn = matches.join(' ') + ' ' + matches2.join(' ');
        return strReturn;
    });
}

var bReadingStarted = false;
var g_bInBetweenSentence = false;
//will be called when a new line starts reading
function newLineStarted() {
    bReadingStarted = true;
    if (g_bSpeechPaused) {
        $rw_event_pause();
    }
    g_bInBetweenSentence = false;
}

//will be called when a line completes reading
function newLineComplete() {
    bReadingStarted = false;
    g_bInBetweenSentence = true;
}

var nScrollInterval;
var g_strCurrentReaderContainerId;
function startSpeaking(arrDivIds, strScrollContainerId) {

    /* var oScrollPaneJSP = $('#' + strScrollContainerId).data('jsp');
    if ($('#' + strScrollContainerId) && $('#' + strScrollContainerId).data('jsp'))
    {
    $('#' + strScrollContainerId).data('jsp').scrollToY(0, false);
    }
    //clearInterval(nScrollInterval);
    nScrollInterval = setInterval(function () { SetScrollPosition(strScrollContainerId); }, 50);*/
    speakElementsById(arrDivIds);

}

function SetScrollPosition(strScrollContainerId) {
    var oScrollPaneJSP = $('#' + strScrollContainerId).data('jsp');
    if ($('#' + strScrollContainerId) && $('#' + strScrollContainerId).data('jsp')) {
        $('#' + strScrollContainerId).data('jsp').scrollToY($('#' + strScrollContainerId).data('jsp').getContentPositionY(), false);
    }
}

function SetHackDivData() {
    var oHackDiv = $("#" + strDivID + "_hack");

    if (oHackDiv) {
        oHackDiv.html(strDivText);
    }
    strDivID = "";
}

function StopReading() {
    m_bPlaySpeaker = true;
    g_bSpeechPaused = false;
    bReadingStarted = false;
    clearTimeout(g_bPauseTimeout);
    //clearInterval(nScrollInterval);
    $rw_stopSpeech(true);
    //SetHackDivData();
    ResetTTSIconState();
    /*$(".TTSSpeaker").each(function () {
    Manager.SetTTSAccMessage($(this).parent().attr('id'), Manager.GetAccMessage("TTS_ACC_TEXT", 0));
    if (Shell && Shell.ChangeTooltipText) {
    Shell.ChangeTooltipText($(this).parent().parent().attr('id'), Manager.GetMessage("Listen_tooltip", 0));             
    }
    })*/
    $rw_setVoice(strDefaultTTSVoice);
}

function StartSpeaking(arrMessages) {
    StopReading();
    startSpeaking(arrMessages);
}

function AddCSS(strID, arrImages, strImageID, width, height) {
    if (!strID) {
        strID = "";
    }
    if (!strImageID) {
        strImageID = "";
    }
    var strImage = arrImages[0];
    if (!width) width = 30;
    if (!height) height = 30;
    if (strImage.indexOf("small") != -1) { width = 20; height = 20; };
    //var arrImages = new Array("sound up.png", "sound rollover.png", "sound down.png");
    var strCSS = "<style type='text/css'>"
    strCSS += ".SpeakerUp" + strID
    strCSS += "{"
    strCSS += "background-image:url('" + /*GetPath(FolderPath.COMMON_ASSET_IMAGE) + strImageID +*/arrImages[0] + "');"
    strCSS += "background-repeat:no-repeat;"
    strCSS += "width:" + width + "px;"
    strCSS += "height:" + height + "px;"
    strCSS += "cursor:pointer;"
    strCSS += "}"
    strCSS += ".SpeakerUp" + strID + ":hover"
    strCSS += "{"
    strCSS += "background-image:url('" + /*GetPath(FolderPath.COMMON_ASSET_IMAGE) + strImageID +*/arrImages[1] + "');"
    strCSS += "width:" + width + "px;"
    strCSS += "height:" + height + "px;"
    strCSS += "cursor:pointer;"
    strCSS += "}"
    strCSS += ".SpeakerUp" + strID + ":active"
    strCSS += "{"
    strCSS += "background-image:url('" + /*GetPath(FolderPath.COMMON_ASSET_IMAGE) + strImageID +*/arrImages[2] + "');"
    strCSS += "width:" + width + "px;"
    strCSS += "height:" + height + "px;"
    strCSS += "cursor:pointer;"
    strCSS += "}"
    strCSS += ".SpeakerPaused" + strID
    strCSS += "{"
    strCSS += 'background-image:url("img/pause_up.png");';
    strCSS += "background-repeat:no-repeat;"
    //   strCSS += "width:" + width + "px;"
    //   strCSS += "height:" + height + "px;"
    strCSS += "cursor:pointer;"
    strCSS += "background-size:100% 100%;"
    strCSS += "}"
    strCSS += ".SpeakerPaused" + strID + ":hover"
    strCSS += "{"
    strCSS += 'background-image:url("img/pause_rollover.png");';
    strCSS += "background-repeat:no-repeat;"
    //   strCSS += "width:" + width + "px;"
    //   strCSS += "height:" + height + "px;"
    strCSS += "cursor:pointer;"
    strCSS += "background-size:100% 100%;"
    strCSS += "}"
    strCSS += ".SpeakerPaused" + strID + ":active"
    strCSS += "{"
    strCSS += 'background-image:url("img/pause_down.png");';
    strCSS += "background-repeat:no-repeat;"
    //   strCSS += "width:" + width + "px;"
    //   strCSS += "height:" + height + "px;"
    //   strCSS += "cursor:pointer;"
    strCSS += "background-size:100% 100%;"
    strCSS += "}"
    strCSS += ".SpeakerPlay" + strID
    strCSS += "{"
    strCSS += 'background-image:url("img/play_up.png");';
    strCSS += "background-repeat:no-repeat;"
    //    strCSS += "width:" + width + "px;"
    //    strCSS += "height:" + height + "px;"
    //    strCSS += "cursor:pointer;"
    strCSS += "background-size:100% 100%;"
    strCSS += "}"
    strCSS += ".SpeakerPlay" + strID + ":hover"
    strCSS += "{"
    strCSS += 'background-image:url("img/play_rollover.png");';
    strCSS += "background-repeat:no-repeat;"
    //   strCSS += "width:" + width + "px;"
    //   strCSS += "height:" + height + "px;"
    //   strCSS += "cursor:pointer;"
    strCSS += "background-size:100% 100%;"
    strCSS += "}"
    strCSS += ".SpeakerPlay" + strID + ":active"
    strCSS += "{"
    strCSS += 'background-image:url("img/play_down.png");';
    strCSS += "background-repeat:no-repeat;"
    //    strCSS += "width:" + width + "px;"
    //   strCSS += "height:" + height + "px;"
    //    strCSS += "cursor:pointer;"
    strCSS += "background-size:100% 100%;"
    strCSS += "}"
    strCSS += "</style>";
    $('head').append(strCSS);
    //document.body.appendChild(new AddCSS
    // style='background-image:url(" + GetImagePath('ArrowBox') + ")'
}










var ParentDiv;
function LoadSpeaker(strParent, arrMessages, strCSSID, strNextElemID, strScrollContainerId, strVoice) {
    var oSpeaker = new SpeakerButton();
    oSpeaker.Init(strParent, arrMessages, strCSSID, strNextElemID, strScrollContainerId, strVoice);
}

function SpeakerButton() {
    this.m_strParent;
    this.m_arrMessages;
    this.m_strScrollbarContainerId;
}

//setter functions for various properties, these can be used to change the values of these properties from their default values
//setter function for alpha
SpeakerButton.prototype.Init = function (strParent, arrMessages, strCSSID, strNextElemID, strScrollContainerId, strVoice) {
    if (!strCSSID) {
        strCSSID = "";
    }

    this.m_strParent = strParent;
    this.m_arrMessages = arrMessages;
    this.m_strScrollbarContainerId = strScrollContainerId;
    var oThis = this;
    var nRand = Math.random();

    nRand = Number(String(nRand).substring(2, 5));

    var strButton = "<div id=" + strParent + "_Speaker" + nRand + " class='SpeakerUp" + strCSSID + " TTSSpeaker' state='inactive' style='position:absolute;z-index:1'></div>";

    var oParent = document.getElementById(strParent);

    if (strVoice != undefined && strVoice != null && strVoice != "") {
        $(oParent).data("TTSVoice", strVoice);
    }

    $(oParent).append(strButton);

    var oSpeaker = document.getElementById(strParent + "_Speaker" + nRand);
    var oSpeakerElem = $("#" + strParent + " .TTSSpeaker");
    //AddTTSToolTip(oSpeakerElem);
    $(oParent).unbind('click');
    $(oParent).bind('click', function () {
        //if (!($("#rwDrag").is(":visible"))) {
        //    alert("speaker Not Ready Yet");
        //    return;
        //}
        ttsDiv = ParentDiv = oParent.id;
        if (oSpeakerElem.attr('state') == 'inactive') {
            if (strNextElemID) { strNextFocusElem = strNextElemID; }
            else { strNextFocusElem = strParent; }
            //               oThis.SpeakerClick(oThis);
            //clearInterval(nScrollInterval);
            oThis.SpeakerClick(oThis, this);
            oSpeakerElem.attr('state', 'active');
            oSpeakerElem.toggleClass("SpeakerPaused" + strCSSID);
            // Manager.SetTTSAccMessage(strParent, Manager.GetAccMessage("TTS_ACC_TEXT", 1));
            //toggleToolTip(oSpeakerElem, strCSSID);
        }
        else {
            oSpeakerElem.toggleClass("SpeakerPlay" + strCSSID);
            if (oSpeakerElem.hasClass("SpeakerPlay" + strCSSID)) {
                //Manager.SetTTSAccMessage(strParent, Manager.GetAccMessage("TTS_ACC_TEXT", 2));
                g_bSpeechPaused = true;
                if (g_bInBetweenSentence) {
                    g_bPauseTimeout = setTimeout(PauseReading, 1);
                }
                else {
                    $rw_event_pause();
                }
            }
            else {
                //Manager.SetTTSAccMessage(strParent, Manager.GetAccMessage("TTS_ACC_TEXT", 1));
                g_bSpeechPaused = false;
                clearTimeout(g_bPauseTimeout);
                $rw_event_play();
            }
            //toggleToolTip(oSpeakerElem, strCSSID);
        }

    });

}

function PauseReading() {
    if (!g_bInBetweenSentence) {
        clearTimeout(g_bPauseTimeout);
        if ($rw_isPaused()) $rw_event_pause();
        $rw_event_pause();
        //$rw_event_pause();
    }
    else {
        g_bPauseTimeout = setTimeout(PauseReading, 10);
    }
}

function pauseSpeech() {
    if (!$rw_isPaused()) {
        $rw_event_pause();
        setTimeout(function pauseSpeech() { }, 10)
    }

}

function AddTTSToolTip(oSpeakerElem) {
    if (!Shell || !Shell.AddTooltip) {
        return;
    }
    Shell.AddTooltip(Shell.TooltipTypes.LISTEN, oSpeakerElem.parent().parent().attr('id'));
}

function toggleToolTip(oSpeakerElem, strCSSID) {
    if (!Shell || !Shell.ChangeTooltipText) {
        return;
    }
    if (oSpeakerElem.hasClass("SpeakerPlay" + strCSSID)) {
        Shell.ChangeTooltipText(oSpeakerElem.parent().parent().attr('id'), Manager.GetMessage("Play_tooltip", 0));
    }
    else {
        Shell.ChangeTooltipText(oSpeakerElem.parent().parent().attr('id'), Manager.GetMessage("Pause_tooltip", 0));
    }

}

SpeakerButton.prototype.SpeakerClick = function (oThis, oSpeakerParent) {
    StopReading();
    var strVoice = $(oSpeakerParent).data("TTSVoice");
    if (strVoice != null) $rw_setVoice(strVoice);
    startSpeaking(oThis.m_arrMessages); //, oThis.m_strScrollbarContainerId);
}
var m_bPlaySpeaker = true;
function PlayTTSSpeaker(arrMessages) {
    StopReading();

    startSpeaking(arrMessages);
    /*if(m_bPlaySpeaker)
    {
    startSpeaking(arrMessages);
    }
    else
    {
    PauseTTSSpeaker()
    }
    m_bPlaySpeaker = false;*/
}

function PauseTTSSpeaker() {
    //$rw_event_pause();
}