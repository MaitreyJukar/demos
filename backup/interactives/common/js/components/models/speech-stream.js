(function () {
    'use strict';

    /**
    * Plays and pauses the audio when clicked on play and pause button respectively 
    *
    * @class SpeechStream
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.SpeechStream = Backbone.Model.extend({

    }, {

        /**
        * voice heard when audio is played in English
        * 
        * @property voiceEnglishMaleTom
        * @type String
        * @defaults ScanSoft Tom_Full_22kHz
        */
        voiceEnglishMaleTom: "ScanSoft Tom_Full_22kHz",

        /**
        * voice heard when audio is played in Spanish
        * 
        * @property voiceSpanishFemalePenelope
        * @type String
        * @defaults IVONA 2 Penelope - Spanish (US) female voice [22kHz]
        */
        voiceSpanishFemalePenelope: "IVONA 2 Penelope - Spanish (US) female voice [22kHz]",

        /**
        * Array of id's whose text is to be played
        * 
        * @property speechId
        * @type Array
        * @defaults null
        */
        speechId: null,

        /**
        * TTS voice
        * 
        * @property defaultTTSVoice
        * @type String
        * @defaults empty
        */
        defaultTTSVoice: '',

        /**
        * index of the array of ids to be played
        * 
        * @property currentIdIndex
        * @type Number
        * @defaults 0
        */
        currentIdIndex: 0,

        /**
        * specifies that the audio is paused if set to true
        * 
        * @property speechPaused
        * @type Boolean
        * @defaults true
        */
        speechPaused: true,

        /**
        * timer used when audio is paused at the first word of a new sentence
        * 
        * @property pauseTimeout
        * @type Number
        * @defaults null
        */
        pauseTimeout: null,

        /**
        * specifies that the audio is played if set to true
        * 
        * @property playSpeaker
        * @type Boolean
        * @defaults false
        */
        playSpeaker: false,

        /**
        * specifies that the audio is downloaded and has started to play
        * 
        * @property readingStarted
        * @type Boolean
        * @defaults false
        */
        readingStarted: false,

        /**
        * specifies whether the audio reading is between the sentence or not
        * 
        * @property inBetweenSentence
        * @type Boolean
        * @defaults true
        */
        inBetweenSentence: true,

        /**
        * individual id of the div from the array of ids to be played  
        * 
        * @property divID
        * @type String
        * @defaults empty
        */
        divID: '',

        /**
        * text of the respective id from the array of ids
        * 
        * @property divText
        * @type String
        * @defaults empty
        */
        divText: '',

        /**
        * This method is called only for the first time when it is loaded. It initializes the variables used to
        * play and pause audio written in the library textHelpMain.js
        * 
        * @method initializeTextHelp
        * @private
        * @param {String} rangeTextColor The color of the whole sentence to be played.
        * @param {String} rangeBackgroundColor Background color sentence to be played.
        * @param {String} wordTextColor The color of the word currently playing.
        * @param {String} wordBakgroundColor Background color of the word currently playing.
        */
        initializeTextHelp: function (rangeTextColor, rangeBackgroundColor, wordTextColor, wordBakgroundColor) {
            try {
                eba_use_html5 = true;
                eba_icons = no_bar;

                eba_login_name = "discoveryeducation";
                //eba_server = "discoveryeducation.speechstream.net";
                eba_server = "discoveryeducationtoolbar.speechstream.net";
                //eba_speech_server = "discoveryeducation.speechstream.net";
                eba_speech_server = "discoveryeducation.speechstream.net";

                eba_cust_id = "1740";
                eba_book_id = '4';
                eba_page_id = 'asterisk';


                // This determines the customers unique ID
                /*
                Removed as bookId and pageId is set in player container for interactive, it is set dynamically from loadinteractive call of api               
                //eba_book_id = '8';//strBookId;                            // This determines the book unique ID
                //eba_page_id = '1';//strPageId;                            // This determines the page unique ID
                */
                //eba_clientside_pronunciation = true;

                //eba_speech_range_colours = "color:" + rangeTextColor + "; background:" + rangeBackgroundColor;
                eba_speech_range_style = "color:" + rangeTextColor + "; background:" + rangeBackgroundColor;
                //eba_speech_word_colours = "color:" + wordTextColor + "; background:" + wordBakgroundColor;
                eba_speech_word_style = "color:" + wordTextColor + "; background:" + wordBakgroundColor;
                eba_page_complete_callback = "MathInteractives.Common.Components.Models.SpeechStream.readNext";
                eba_speech_complete_callback = "MathInteractives.Common.Components.Models.SpeechStream.newLineComplete";
                eba_rendering_speech_callback = "MathInteractives.Common.Components.Models.SpeechStream.newLineStarted";

                //eba_clientside_pronunciation = true;
                eba_ignore_frames = true;
				
				//load tts through https protocol
				eba_ssl_flag = (location.protocol == "https:");

                var strLanguage = 'en';//queryString('Lang');

                //alert(SPANISH + " strLanguage " + strLanguage);
                switch (strLanguage) {
                    case "es":
                        {
                            eba_language = SPANISH;
                            eba_voice = this.voiceSpanishFemalePenelope;
                            break;
                        }
                    default:
                        {
                            eba_voice = this.voiceEnglishMaleTom; // This specifies the voice to use, Samantha is the US female voice.
                            break;
                        }
                }
                this.defaultTTSVoice = eba_voice;
                this.setupIgnoreSections();

            } catch (err) { alert("Init Error"); }
        },

        setupIgnoreSections: function()
        {
            var pageControl = SpeechStream.tools.getPageControl();
            pageControl.setIgnorePageDefault(true);

            //noinspection JSUnresolvedVariable
            if(typeof(discoveryLoadedCallback) == "function")
            {
                //noinspection JSUnresolvedFunction
                discoveryLoadedCallback(pageControl);
            }

        },

        /**
        * Passes the ids of the text to be played to the function written in textMainHelp,
        * which in turn plays the audio
        * @method speakElementsById
        * @param {Array} messageIds Ids of the messages to be played.
        */
        speakElementsById: function (messageIds) {
            this.speechId = messageIds;

            if (this.speechId.length != 0) {
                this.currentIdIndex = 0;
                this.divID = this.speechId[this.currentIdIndex];

                $rw_speakById(this.speechId[this.currentIdIndex]);

            }
        },

        /**
        * Traverses through the ids, reading their text. 
        * 
        * @method readNext
        */
        readNext: function () {
            var ttsFinishedReadingDiv;
            this.currentIdIndex++;
            if (this.currentIdIndex < this.speechId.length) {
                setHackDivData();
                //alert(document.getElementById(arrId[intCurrentIdIndex]).innerHTML)

                //Calls a callback function with the first parameter indicating the id of the div which has been read and the second parameter indicating the id of the div which is going to be read
                if (ttsFinishedReadingDiv != null) ttsFinishedReadingDiv(this.speechId[this.currentIdIndex - 1], this.speechId[this.currentIdIndex]);

                $rw_speakById(this.speechId[this.currentIdIndex]);
            }
            else {
                //Calls a callback function with the first parameter indicating the id of the div which has been read and the second parameter indicating the id of the div which is going to be read
                if (ttsFinishedReadingDiv != null) ttsFinishedReadingDiv(this.speechId[this.currentIdIndex - 1], null);

                //clearInterval(nScrollInterval);   // alert(strNextFocusElem)

                this.playSpeaker = true;
                this.inBetweenSentence = true;

                this.resetTTSIconState();
                $('#' + MathInteractives.global.SpeechStream.currentTTSId).trigger('focusOnCompletion');
            }

        },

        /**
        * Hides the pause tts button and shows the play tts button when reading is completed. 
        * 
        * @method resetTTSIconState
        */
        resetTTSIconState: function () {
            MathInteractives.global.PlayerTTS.resetTooltipText();
        },

        /**
        * Will be called when a new line starts reading 
        * 
        * @method newLineStarted
        */
        newLineStarted: function () {
            this.readingStarted = true;
            if (this.speechPaused) {
                $rw_event_pause();
            }
            this.inBetweenSentence = false;
        },

        /**
        * will be called when a line completes reading 
        * 
        * @method newLineComplete
        */
        newLineComplete: function () {
            this.readingStarted = false;
            this.inBetweenSentence = true;
        },

        /**
        * Receives the array of ids and passes it to the speakElementsById function to play the audio.
        * It also sets some boolean which indicates the start of text reading.
        *
        * @method startSpeaking
        * @param {Array} divIds Ids of the messages to be played.
        * @param {Array} container Container id. Optional
        */
        startSpeaking: function (divIds, container) {

            this.speechPaused = false;
            this.inBetweenSentence = true;
            this.readingStarted = false;
            clearTimeout(this.pauseTimeout);
            //clearInterval(nScrollInterval);
            $rw_stopSpeech(true);
            $rw_event_stop();

            if (container != undefined && container != null && container != "") {
                var containerDiv = $('#' + container + ' .scroll-pane-arrows');
                if (containerDiv.length > 0) {
                    containerDiv.each(function () {
                        var jspData = $(this).data('jsp');
                        if (jspData) {
                            jspData.scrollToY(0, false);
                        }
                    });
                }
            }

            this.speakElementsById(divIds);

        },

        /**
        * Stops reading voluntarily.
        *
        * @method stopReading
        */
        stopReading: function (isSetFocusOnComplete) {
           

            var _PLAYER_TTS = MathInteractives.global.PlayerTTS;
            if (typeof _PLAYER_TTS.ttsView === 'undefined') {
                return;
            }
            if (typeof isSetFocusOnComplete !== "undefined") {
                _PLAYER_TTS.ttsView.model.setFocusStatusOnComplete(isSetFocusOnComplete);
                _PLAYER_TTS.ttsView.hideTTSTooltip();
            }
            this.speechPaused = false;
            this.inBetweenSentence = true;
            this.readingStarted = false;
            clearTimeout(this.pauseTimeout);
            //clearInterval(nScrollInterval);
            $rw_stopSpeech(true);
            $rw_event_stop();

            $rw_setVoice(this.defaultTTSVoice);
            MathInteractives.global.PlayerTTS.resetTooltipText();
            if (_PLAYER_TTS.ttsView) {
                _PLAYER_TTS.ttsView.model.setFocusStatusOnComplete(true);
                _PLAYER_TTS.ttsView.hideTTSTooltip();
            }
        },

        /**
        * Pauses reading when clicked on the pause tts button.
        *
        * @method pauseReading
        */
        pauseReading: function () {
            var self = this;
            this.speechPaused = true;

            if (!this.inBetweenSentence) {
                clearTimeout(this.pauseTimeout);
                if ($rw_isPaused()) $rw_event_pause();
                $rw_event_pause();
                //$rw_event_pause();
            }
            else {
                this.pauseTimeout = setTimeout($.proxy(this.pauseReading, self), 10);
            }
        },

        /**
        * Starts reading, either from the start of the sentence or from the point where it was paused.
        *
        * @method playTTSSpeaker
        * @param {Array} messages Ids of the messages to be played.
        */
        playTTSSpeaker: function (messages) {

            this.speechPaused = false;
            if (!this.inBetweenSentence) {
                clearTimeout(this.pauseTimeout);
                $rw_event_play();
            }
            else {
                this.startSpeaking(messages);
            }

        }



    });

    //MathInteractives.Common.Components.Models.SpeechStream.initializeTextHelp("blue", "transparent", "orange", "transparent");
    MathInteractives.global.SpeechStream = MathInteractives.Common.Components.Models.SpeechStream;
})()

/*
* textHelpMain.js Function call on completion of dynamic load of js
*/
function $rw_userParameters() {
    MathInteractives.Common.Components.Models.SpeechStream.initializeTextHelp("blue", "transparent", "orange", "transparent");
}