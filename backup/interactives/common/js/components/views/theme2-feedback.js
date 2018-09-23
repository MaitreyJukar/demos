
(function () {
    'use strict';

    if (MathInteractives.Common.Components.Theme2.Views.Feedback) {
        return;
    }


    var className = null;

    /**
    * View for rendering Feedback
    *
    * @class Feedback
    * @constructor
    * @namespace MathInteractives.Common.Components.Theme2.Feedback
    **/
    MathInteractives.Common.Components.Theme2.Views.Feedback = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Holds the interactivity player reference
        * @property player
        * @default null
        * @private
        */
        player: null,

        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,
        /**
        * Holds the interactivity manager reference
        * @property manager
        * @default null
        * @private
        */
        manager: null,

        /**
        * File-path object
        * @property filePath
        * @type Object
        * @default null
        **/
        filePath: null,

        /**
        * Array of the button views in the feedback container
        * @property buttonViews
        * @type Array
        * @default null
        **/
        buttonViews: null,

        ttsView: null,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {

            this.player = this.model.get('player');
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('filePath');
            this.render();
        },

        /**
        * Renders Feedback
        * @method render
        **/
        render: function render() {
            this.renderTemplate();
            this.renderTTS();
            this.renderText();
            this.renderButtons();
        },
        /**
        * Render the Template of feedback 
        * @public
        * @method renderTemplate
        **/
        renderTemplate: function renderTemplate() {
            var templateOptions = {
                idPrefix: this.idPrefix,
                buttonPropertiesArray: this.model.get('buttonPropertiesArray')
            },
                templateHtml = MathInteractives.Common.Components.templates.theme2Feedback(templateOptions).trim();
            this.$el.append(templateHtml);
            return;
        },
        /**
        * Render the TTS button
        * @public
        * @method renderTTS
        **/
        renderTTS: function renderTTS() {
            this.log('tts');
            var tabIndex = this.model.get('tabIndex');



            var ttsObj = {
                'containerId': this.idPrefix + 'feedback-tts-container',
                'manager': this.manager,
                'player': this.player,
                'filePath': this.filePath,
                'ttsColor': this.model.get('ttsColorType'),
                'idPrefix': this.idPrefix,
                'messagesToPlay': [this.idPrefix + 'feedback-text-container']
            };

            this.ttsView = MathInteractives.global.Theme2.PlayerTTS.generateTTS(ttsObj);

            if (tabIndex) {
                tabIndex = tabIndex + 2;
                this.ttsView.renderTTSAccessibility(tabIndex);
            }


        },
        /**
        * Render the text of feedback 
        * @public
        * @method renderText
        **/
        renderText: function renderText() {

            this.changeFeedbackText();
            this.changeHeaderText();
            return;


        },

        /**
        * Render the all buttons of feedback
        * @Public
        * @method renderButtons
        **/

        renderButtons: function renderButtons() {
            var self = this,
                buttonViews = null,
                buttonPropertiesArray = this.model.get('buttonPropertiesArray'),
                buttonAccTextArray = this.model.get('buttonAccText'),
                length = buttonPropertiesArray.length,
                index = null,
                currentBtnProps = null,
                accText = null,
                btnView = null,
                tabIndex = this.model.get('tabIndex');

            this.buttonViews = [];
            buttonViews = this.buttonViews;
            for (index = 0; index < length; index++) {
                btnView = null;

                currentBtnProps = buttonPropertiesArray[index];
                currentBtnProps.id = this.idPrefix + 'feedback-button-' + index + '-container';
                currentBtnProps.type = currentBtnProps.type ? currentBtnProps.type : MathInteractives.global.Theme2.Button.TYPE.TEXT;

                btnView = MathInteractives.global.Theme2.Button.generateButton({
                    data: buttonPropertiesArray[index],
                    path: this.filePath,
                    player: this.player
                });
                buttonViews.push(btnView);
                this.attachClickHandlerForButtons(index);


                if (tabIndex) {
                    tabIndex = this.getTabIndex('feedback-text-wrapper') + ((index + 1) * 5);

                    var accObj = {
                        "elementId": 'feedback-button-' + index + '-container',
                        "role": "button",
                        "tabIndex": tabIndex,
                        "acc": buttonAccTextArray ? buttonAccTextArray[index] : currentBtnProps.text
                    };
                    this.createAccDiv(accObj);
                }
            }
            return;
        },

        /**
        * attach events to buttons of feedback
        * @method attachClickHandlerForButtons
        * @param {number} index index of the button view 
        * @private
        */

        attachClickHandlerForButtons: function (index) {
            var self = this,
                btnView = this.buttonViews[index];
            btnView.$el.on('click', function () {
                self.trigger(className.FEEDBACK_BUTTON_CLICK, {
                    buttonView: btnView,
                    index: index
                });
            });
            return;
        },

        /**
        * Hides the feedback
        * @public
        * @method hideFeedback
        **/
        hideFeedback: function hideFeedback() {
            this.$('.' + className.FEEDBACK_WRAPPER_SELECTOR).hide();
            return;
        },
        /**
        * Shows feedback pop up
        * @public
        * @method showFeedback
        **/
        showFeedback: function showFeedback() {

            this.$('.' + className.FEEDBACK_WRAPPER_SELECTOR).show();
            this.updateFocusRect(className.FEEDBACK_TEXT_CONTAINER_SELECTOR);
            return;
        },

        /**
        * Changes the header text
        * @public
        * @method changeHeaderText
        * @param {string} headerText Text to be set as the header text
        * @param {string} accHeaderText accessibility Text to be set for the acc div
        **/
        changeHeaderText: function changeHeaderText(headerText, accHeaderText) {
            if (headerText) {
                this.model.set('headerText', headerText);
            }
            var $textContainer = this.$('.' + className.FEEDBACK_HEADER_TEXT_CONTAINER_SELECTOR),
                headerText = this.model.get('headerText');

            $textContainer.html(headerText);


            return;
        },

        /**
        * Changes the feedback text
        * @method changeFeedbackText
        * @param {string} text Text to be set as the feedback text
        * @param {string} accText accessibility Text to be set for the acc div
        * @param {object} customAccDiv custom AccDiv sent from the interactivity
        * @public
        **/
        changeFeedbackText: function changeFeedbackText(text, accText, customAccDiv) {
            if (text) {
                this.model.set('text', text);
            }
            if (accText) {
                this.model.set('accText', accText);
            }
            var $textContainer = this.$('.' + className.FEEDBACK_TEXT_CONTAINER_SELECTOR),
                text = this.model.get('text'),
                tabIndex = this.model.get('tabIndex'),
               accText = this.model.get('accText');
            //            var accTextObj = {
            //                "elementId": className.FEEDBACK_TEXT_CONTAINER_SELECTOR,
            //                "tabIndex": -1,
            //                "loc": text
            //            };
            //            this.createAccDiv(accTextObj);
            //this.setMessage(className.FEEDBACK_TEXT_CONTAINER_SELECTOR, text);
            if (customAccDiv !== undefined && customAccDiv !== null) {
                customAccDiv.tabIndex = tabIndex;
                this.createAccDiv(customAccDiv);
            }
            else {
                var accObj = {
                    "elementId": className.FEEDBACK_TEXT_WRAPPER,
                    "tabIndex": tabIndex,
                    "loc": '',
                    "acc": accText ? accText : text
                };
                this.createAccDiv(accObj);
            }
            $textContainer.html(text);
            return;
        },
        hideTTS: function hideTTS() {
            this.ttsView.$el.hide();
            return;
        },
        showTTS: function showTTS() {
            this.ttsView.$el.show();
            return;
        }
    }, {

        /**
        * generate the feedback
        * @method generateFeedback
        * @param {json} feedbackProps feedbackProps it contain the all properties of model 
        * @private
        */
        generateFeedback: function (feedbackProps) {
            var feedbackModel = null, feedbackView = null;
            if (feedbackProps) {

                feedbackModel = new MathInteractives.Common.Components.Theme2.Models.Feedback(feedbackProps);
                feedbackView = new MathInteractives.Common.Components.Theme2.Views.Feedback({
                    model: feedbackModel,
                    el: '#' + feedbackProps.idPrefix + feedbackProps.feedbackContainerID
                });

                return feedbackView;
            }
        },

        /**
        * Feedback wrapper id
        * @property FEEDBACK_WRAPPER_SELECTOR
        * @type string
        * @static
        **/
        FEEDBACK_WRAPPER_SELECTOR: 'feedback-wrapper',

        /**
        * Feedback text container id
        * @property FEEDBACK_TEXT_CONTAINER_SELECTOR
        * @type string
        * @static
        **/
        FEEDBACK_TEXT_CONTAINER_SELECTOR: 'feedback-text-container',

        /**
        * Feedback header text id
        * @property FEEDBACK_HEADER_TEXT_CONTAINER_SELECTOR
        * @type string
        * @static
        **/
        FEEDBACK_HEADER_TEXT_CONTAINER_SELECTOR: 'feedback-header-text-container',

        /**
        * Button container id
        * @property FEEDBACK_BUTTONS_CONTAINER
        * @type string
        * @static
        **/
        FEEDBACK_BUTTONS_CONTAINER: 'feedback-buttons-container',

        /**
        * feedback button click
        * @property FEEDBACK_BUTTON_CLICK
        * @type string
        * @static
        **/
        FEEDBACK_BUTTON_CLICK: 'feedback-button-click',

        /**
        * feedback text wrapper id
        * @property FEEDBACK_TEXT_WRAPPER
        * @type string
        * @static
        **/
        FEEDBACK_TEXT_WRAPPER: 'feedback-text-wrapper'
    });

    MathInteractives.global.Theme2.Feedback = className = MathInteractives.Common.Components.Theme2.Views.Feedback;
})();
