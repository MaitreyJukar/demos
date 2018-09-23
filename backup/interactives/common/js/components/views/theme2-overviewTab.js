(function () {
    'use strict'
    /**
    * holds functions related to basic set-up of the interactivity window.
    * @class OverviewTab
    * @namespace MathInteractives.Common.Components.Theme2.Views
    * @submodule MathInteractives.Common.Components.Theme2.Views.OverviewTab
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Views.OverviewTab = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Holds the interactivity id prefix
        * @property idprefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Holds the manager
        *
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Holds the player
        *
        * @property _player
        * @type Object
        * @default null
        */
        _player: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,
        /**
        * The id of the screen that contains the overview tab elements
        * @property screenID
        * @type String
        */
        screenID: null,
        /**
        * Holds the view of the go button
        * @property goButtonView
        * @type Backbone.View
        * @default null
        */
        goButtonView: null,
        /**
        * Holds the view of the tts button
        * @property ttsButtonView
        * @type Backbone.View
        * @default null
        */
        ttsButtonView: null,
        /**
        * Holds the whether step is loaded
        * @property isStepTwoLoaded
        * @type Boolean
        * @default false
        */
        isStepTwoLoaded: false,
        /**
        * Holds the whether let's go button is clicked
        * @property isLetsGoClicked
        * @type Boolean
        * @default false
        */
        isLetsGoClicked: false,

        /*
        * The timer used for throbber animation
        *
        * @property throbTimer
        * @type Number
        * @default numm
        **/
        throbTimer: null,

        /**
        * Holds audio file data
        * @property _audioFileDataMap
        * @type Object
        * @default null
        */
        _audioFileDataMap: null,

        /**
        * it calls the _render function and initialise properties 
        * @method initialize
        * @method public
        */
        initialize: function () {
            this.filePath = this.model.get('path');
            this.manager = this.model.get('manager');
            this._player = this.model.get('player');
            this.idPrefix = this._player.getIDPrefix();
            this.screenID = this.model.get('screenID');
            this._audioFileDataMap = this._player.model.get('audioFileDataMap');
            this.render();
            this._attachEvents();
        },

        /**
        * render renders the view 
        * @method render
        * @private
        */
        render: function () {
            // to remove unnecessary dom elements from interactivities uploaded earlier
            this.$el.find('.lets-go-btn').remove();

            this.$el.append(MathInteractives.Common.Components.templates.theme2OverviewTab({ 'idPrefix': this.idPrefix }).trim());

            this.loadScreen(this.screenID);
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIE || MathInteractives.Common.Utilities.Models.BrowserCheck.isIE11) {
                this.$('.overview-horizontal-rule').addClass('overview-horizontal-rule-ie');
            }
            this._generateButtons();
            this._setBackgroundImages();
            this._setupAccDivs();
        },

        /**
        * Binds events to elements
        * @method _attachEvents
        * @private
        */
        _attachEvents: function _attachEvents() {
            var Events = MathInteractives.Common.Components.Theme2.Views.OverviewTab.Events;
            this.off(Events.SECOND_STEP_LOAD).on(Events.SECOND_STEP_LOAD, $.proxy(this._secondStepLoad, this));
            this.off(Events.SECOND_STEP_PROGRESS).on(Events.SECOND_STEP_PROGRESS, $.proxy(this._secondStepProgress, this));
            this.off(Events.SECOND_STEP_COMPLETE).on(Events.SECOND_STEP_COMPLETE, $.proxy(this._secondStepComplete, this));
            this.off(Events.SECOND_STEP_ERROR).on(Events.SECOND_STEP_ERROR, $.proxy(this._secondStepError, this));
        },

        /**
        * Binds all the necessary events with their respective function
        * @property events
        * @private
        */
        events: {
            'click .overview-submit-button': 'submitButtonClicked'
        },
        /**
        * Listens and triggers the event when Let's go button is clicked
        * @method submitButtonClicked
        * @param event{Event Object} the event object
        * @private
        */
        submitButtonClicked: function submitButtonClicked(event) {
            this.isLetsGoClicked = true;
            this.triggerGoButtonClickedEvent();
            if (this.isStepTwoLoaded && this.model.get('focusOnHeader')) {
                this.setFocus('header-subtitle', 0);
            }
        },


        /**
        * Listens the event when Second step load started
        * @method _secondStepLoad
        * @param event{Event Object} the event object
        * @private
        */
        _secondStepLoad: function _secondStepLoad(event) {
            var $throbberContainer = this.$('.overview-throbber'),
                $loadingTextContainer = this.$('.overview-preloader-text');
            this._showPreloader();
            this.throbTimer = MathInteractives.Common.Player.Views.InteractivityPreloader.SHOW_THROBBER($throbberContainer, $loadingTextContainer);

        },

        /**
        * Listens the event when Second step load in progress
        * @method _secondStepProgress
        * @param event{Event Object} the event object
        * @private
        */
        _secondStepProgress: function _secondStepProgress(event) {
            //this.$('.overview-preloader-loaded-part').css({
            //    width: event.percentComplete + '%'
            //});
            //console.log(event);
            return;
        },

        /**
        * Listens the event when Second step load completes
        * @method _secondStepComplete
        * @param event{Event Object} the event object
        * @private
        */
        _secondStepComplete: function _secondStepComplete(event) {
            this._showPreloader(false);
            MathInteractives.Common.Player.Views.InteractivityPreloader.STOP_THROBBER(this.throbTimer, this.$('.overview-preloader-text'));
            this.isStepTwoLoaded = true;

            if (this.isLetsGoClicked) {
                this.isLetsGoClicked = false;
                if (this.model.get('focusOnHeader')) {
                    this.setFocus('header-subtitle', 0);
                }
            }
        },

        /**
        * Listens the event when Second step load gives error
        * @method _secondStepError
        * @param event{Event Object} the event object
        * @private
        */
        _secondStepError: function _secondStepError(event) {
            //TODO: Error Handling
            MathInteractives.Common.Player.Views.InteractivityPreloader.STOP_THROBBER(this.throbTimer, this.$('.overview-preloader-text'));
            return;
        },
        /**
        * Generates the preloader and loads all the files of the interactivity
        * @method _showPreloader
        * @private
        * @param show {bool} 
        */
        _showPreloader: function _showPreloader(show) {
            if (show === false) {
                this.$('.overview-submit-button').removeClass('no-display');
                this.$('.overview-preloader-container').addClass('no-display');
                this.loadScreen('overview-preloader-screen');
                return;
            }

            this.$('.overview-submit-button').addClass('no-display');
            this.$('.overview-preloader-container').removeClass('no-display');
            this.loadScreen('overview-preloader-screen');
            return;

        },

        /**
        * Triggers the event submitButtonClicked
        * @method triggerGoButtonClickedEvent
        * @private
        */
        triggerGoButtonClickedEvent: function () {
            this._player.onGoButtonClicked(this);
            //this.trigger(MathInteractives.Common.Components.Theme2.Views.OverviewTab.Events.GO_BUTTON_CLICKED, this);
        },
        /**
        * Sets the background images for the left and right side containers
        * @method _setBackgroundImages
        * @private
        */
        _setBackgroundImages: function _setBackgroundImages() {
            var leftImageContainerID = this.model.get('leftImageContainerID');
            this.$('.overview-image-region').css({ 'background-image': 'url("' + this.filePath.getImagePath(leftImageContainerID) + '")' });
            //this.$('.overview-text-region').css({ 'background-image': 'url("' + this.filePath.getImagePath('pattern') + '")' });
        },
        /**
        * Generates the tts button and the go button
        * @method _generateButtons
        * @private
        */
        _generateButtons: function _generateButtons() {
            this.loadScreen('overviewTabPlayerScreen');
            var goButtonText = this.getMessage('overview-button-text', 0);
            if (goButtonText === null || goButtonText === undefined || goButtonText === '') {
                goButtonText = this.getMessage('overview-submit-button-text', 0);
            }
            var goButtonData = {
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'overview-submit-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    'text': goButtonText,
                    'textPosition': 'left',
                    'width': 115,
                    'icon': {
                        'faClass': this.filePath.getFontAwesomeClass('next'),
                        'fontSize': 16,
                        'fontColor': '#FFFFFF',
                        'fontWeight': 'normal',
                        'height': 15,
                        'width': 9
                    }
                },
                'path': this.filePath,
                'manager': this.manager,
                'player': this._player
            };
            this.goButtonView = MathInteractives.global.Theme2.Button.generateButton(goButtonData);
            this.generateTTSButton();

        },
        /**
        * Generates the TTS Button
        * @method generateTTSButton
        * @public
        */
        generateTTSButton: function generateTTSButton() {
            var obj = {
                'containerId': this.idPrefix + 'overview-header-tts',
                'messagesToPlay': [this.idPrefix + 'overview-readable-text-region'],
                //tabIndex: 270,
                'isEnabled': true,
                'manager': this.manager,
                'player': this._player,
                'filePath': this.filePath,
                'idPrefix': this.idPrefix
            };
            this.ttsButtonView = MathInteractives.global.Theme2.PlayerTTS.generateTTS(obj);
            this.ttsButtonView.renderTTSAccessibility(270);
        },

        /**
        * Sets up the overview tab for accessibility
        * @method _setupAccDivs
        * @private
        */
        _setupAccDivs: function _setupAccDivs() {
            this.loadScreen('overviewTabScreen');
            this.setAccMessage('overview-readable-text-region', this.getAccMessage('overview-header', 0) +
                                                                '. ' + this.getAccMessage('overview-text', 0));

            var goButtonText = this.getAccMessage('overview-button-text', 0);
            if (goButtonText !== null && goButtonText !== undefined && goButtonText !== '') {
                this.setAccMessage('overview-submit-button', goButtonText);
            }
        }
    }, {
        /*
        * to generate overview tab as per the given requirement
        * @method generateOverviewTab
        * @param {object} overviewTabProps
        * @return overviewTabView {Object} overview tab view
        * @static
        */
        generateOverviewTab: function (overviewTabProps) {
            var overviewTabID;
            if (overviewTabProps) {
                overviewTabID = '#' + overviewTabProps.id;
                var overviewTabModel = new MathInteractives.Common.Components.Theme2.Models.OverviewTab(overviewTabProps);
                var overviewTabView = new MathInteractives.Common.Components.Theme2.Views.OverviewTab({ el: overviewTabID, model: overviewTabModel });

                return overviewTabView;
            }
        },

        Events: {
            /**
            * event name for selection changed
            * @property GO_BUTTON_CLICKED
            * @static
            */
            GO_BUTTON_CLICKED: 'go-button-clicked',

            /**
            * event name for first time load
            * @property SECOND_STEP_LOAD
            * @static
            */
            SECOND_STEP_LOAD: 'second-step-load',

            /**
            * event name for progress
            * @property SECOND_STEP_PROGRESS
            * @static
            */
            SECOND_STEP_PROGRESS: 'second-step-progress',

            /**
            * event name for complete
            * @property SECOND_STEP_COMPLETE
            * @static
            */
            SECOND_STEP_COMPLETE: 'second-step-complete',

            /**
            * event name for ERROR
            * @property SECOND_STEP_COMPLETE
            * @static
            */
            SECOND_STEP_ERROR: 'second-step-error'
        }
    });
    MathInteractives.global.Theme2.OverviewTab = MathInteractives.Common.Components.Theme2.Views.OverviewTab;
})();