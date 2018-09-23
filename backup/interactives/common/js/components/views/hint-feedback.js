
(function () {
    'use strict';

    /**
    * View for creating hint or feedback panel and its related events
    *
    * @class HintFeedback
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.HintFeedback = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Holds the type of panel
        * @property _type
        * @private
        */
        _type: null,

        /**
        * Holds the title of panel
        * @property _title
        * @private
        */
        _title: null,

        /**
        * Holds the manager of panel
        * @property manager
        * @private
        */
        manager: null,

        /**
        * Holds the loc Text of panel
        * @property _locText
        * @private
        */
        _locText: null,

        /**
        * Holds the acc Text of panel
        * @property _accText
        * @private
        */
        _accText: null,

        /**
        * Holds the screen Id of panel
        * @property _screenId
        * @private
        */
        _screenId: null,

        /**
        * Holds the width of panel
        * @property _width
        * @private
        */
        _width: null,

        /**
        * Holds the boolean of crossbutton
        * @property _crossButton
        * @private
        */
        _crossButton: null,

        /**
        * Holds the starting tabindex of the element within the panel
        * @property _tabIndex
        * @private
        */
        _tabIndex: null,

        /**
        * Holds the id of the panel
        * @property _containerId
        * @private
        */
        _containerId: null,

        /**
        * Holds the buttons property of panel
        * @property _buttons
        * @private
        */
        _buttons: null,

        /**
        * Holds the path of panel
        * @property _path
        * @private
        */
        _path: null,

        /**
        * Holds the idPrefix of panel
        * @property idPrefix
        * @private
        */
        idPrefix: null,


        /**
        * Holds boolean value for Feedback container width > height
        * @property _isFBContainerWidthMore
        * @private
        */
        _isContainerWidthMore: false,

        /**
        * Holds keydown event object on hint component
        * @property keyDown
        * @private
        */
        keyDown: {},
        /**
        * Calls render and stores the values from the model
        *
        * @method initialize
        **/
        initialize: function initialize() {
            this._type = this.model.getType();
            this._title = this.model.getTitle();
            this.idPrefix = this.model.getIdPrefix();
            this._containerId = this.model.getContainerId();
            this._locText = this.model.getLocText();
            this._buttons = this.model.getButtons();
            this._path = this.model.getPath();
            this._player = this.model.getPlayer();
            this.manager = this.model.getManager();
            this._HINTFEEDBACK_TYPE = this.model.getHintFeedbackType();
            this.$el.data('baseclass', this.$el.attr('class'));
            this.loadScreen('hint-feedback-component');
            this.render();
        },

        /**
        * Renders type, width, title, text and other features of hint and feedback panel and binds events
        *
        * @method render
        **/
        render: function render() {
            this.$el.show();
            this._addPanelClassToContainer();
            this._setWidthHeightOfContainer();
            this._insertTopButtons();
            this._addTitle();
            this._insertText();
        },

        /**
        * Checks type of Panel and add its class 
        *
        * @method _addPanelClassToContainer
        **/
        _addPanelClassToContainer: function _addPanelClassToContainer() {
            switch (this._type) {
                case this._HINTFEEDBACK_TYPE.HINT:
                    {
                        this.$el.addClass('hint-panel');
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_RIGHT_PADDING:
                    {
                        this.$el.addClass('feedback-panel feedback-panel-right-padding');
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_TOP_PADDING:
                    {
                        this.$el.addClass('feedback-panel feedback-panel-top-padding');
                        break;
                    }
            }
        },

        /**
        * Inerts title in feedback or hint panel.
        *
        * @method _addTitle
        **/
        _addTitle: function _addTitle() {
            if (typeof (this._title) !== 'undefined') {
                switch (this._type) {
                    case this._HINTFEEDBACK_TYPE.HINT:
                        {
                            this.$el.find('.hintfeedback-header').append('<div id="' + this._containerId + '-title-panel" class="inner-title-panel">' + this._title + '</div>');
                            break;
                        }
                    case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_RIGHT_PADDING:
                        {
                            break;
                        }
                    case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_TOP_PADDING:
                        {
                            break;
                        }
                }
            }
        },

        /*
        * Update Loc and Acc text as per msg Id and arrParams passed by user
        */
        _updateLocAccText: function () {
            var unPrefixedId = this._containerId.split(this.idPrefix)[1],
                model = this.model,
                msgId = model.getMessageID(),
                arrParams = model.getArrParams();
            this.changeMessage(unPrefixedId + '-text-panel', msgId, arrParams);
            this.changeAccMessage(unPrefixedId + '-acc-panel', msgId, arrParams);
        },


        /**
        * Inerts text in feedback or hint panel.
        *
        * @method _insertText
        **/
        _insertText: function _insertText() {
            var $el = this.$el,
                hasbuttons = (typeof (this._buttons) !== 'undefined') ? true : false,
                containerHeight = this.model.getHeight();

            //$el.append('<div class="hintfeedback-content"><div id ="' + this._containerId + '-acc-panel" class="feedback-acc-panel"></div><div id ="' + this._containerId + '-scroll-panel" class="feedback-scroll-panel"><div id="' + this._containerId + '-text-panel" class="inner-text-panel"></div></div></div>');

            if (hasbuttons === true) {
                this._checkButtons();
            }
            switch (this._type) {
                case this._HINTFEEDBACK_TYPE.HINT:
                    {
                        $el.find('.inner-text-panel').html(this._locText);
                        if (hasbuttons === true) {
                        }
                        else {
                            if (typeof containerHeight !== 'undefined') {
                                $el.find('.feedback-scroll-panel').css('height', (containerHeight - ($el.find('.inner-title-panel').height() + 15)) + "px");
                            }
                        }

                        // Load Hack screen for Accessibility 
                        this._createHackScreenForHint();
                        window.setTimeout($.proxy(this._hideHintOnClickingPlayer, this), 0);
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_RIGHT_PADDING:
                    {
                        this.loadScreen(this.model.getScreenId());
                        this._updateLocAccText();

                        if (hasbuttons === true) {
                            if (typeof containerHeight !== 'undefined') {
                                $el.find('.feedback-scroll-panel').css('height', (containerHeight - ($el.find('.panel-button-container').height() + 28)) + "px");  // 2+ 11+ 15, 2 : bottom margin, 11 : top margin, 15 - space between text and btn
                            }
                        }
                        else {
                            if (typeof containerHeight !== 'undefined') {
                                $el.find('.feedback-scroll-panel').css('height', (containerHeight - 26) + "px"); // 11 + 15, 11 : top margin, 15 - space between text and bottom border
                            }
                        }
                        this._setAccessibilityForFeedback();
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_TOP_PADDING:
                    {
                        this.loadScreen(this.model.getScreenId());
                        this._updateLocAccText();
                        if (hasbuttons === true) {
                            if (typeof containerHeight !== 'undefined') {
                                $el.find('.feedback-scroll-panel').css('height', (containerHeight - ($el.find('.hintfeedback-header').height() + $el.find('.panel-button-container').height() + 17)) + "px"); // 2+ 15, 2 : bottom margin, 15 - space between text and btn
                            }
                        }
                        else {
                            if (typeof containerHeight !== 'undefined') {
                                $el.find('.feedback-scroll-panel').css('height', (containerHeight - ($el.find('.hintfeedback-header').height() + 15)) + "px");  // 15 - space between text and bottom border
                            }
                        }
                        this._setAccessibilityForFeedback();
                        break;
                    }
            }
        },

        /**
        * Hides Hint feedback on clicking anywhere on Player. 
        * @method _hideHintOnClickingPlayer
        * @private
        */
        _hideHintOnClickingPlayer: function () {
            var self = this, customEvent = this._containerId + 'close-hint-feedback',
                unPrefixedId = this._containerId.split(this.idPrefix)[1],
                _CROSS_BTN_CALLBACK_EVENT = MathInteractives.Common.Components.Views.HintFeedback.HINT_FEEDBACK_CROSS_BTN_CALLBACK,
                _IS_SHIFT_PRESSED = MathInteractives.Common.Components.Views.HintFeedback.IS_SHIFT_PRESSED,
                    focusOutEventData = {};

            // Bind on $el with "on" and not "one" to ensure multiple clicks on hint component does not bubble event to player.
            this.$el.off('mousedown.' + customEvent).on('mousedown.' + customEvent, $.proxy(function (event) {
                if (event.preventdefault) {
                    event.preventdefault();
                }
                return false;
            }, this));

            // Bind on player only once so event (callback) bind at interactivity level does not trigger multiple times.
            this._player.$el.off('mousedown.' + customEvent).one('mousedown.' + customEvent, function (event) {
                self.$el.trigger(_CROSS_BTN_CALLBACK_EVENT);
                self.closeHintFeedBackPanel();
            });



            this.$el.off('keydown.hideHintOnFocusOut').on('keydown.hideHintOnFocusOut', function (event) {
                self.keyDown = event || window.event;
            });

            this.focusOut(unPrefixedId + '-close-button-panel', function () {
                var keyDown = self.keyDown,
                charCode = (keyDown.keyCode) ? keyDown.keyCode : keyDown.which;

                if (keyDown.shiftKey === false && charCode !== 32) {
                    focusOutEventData[_IS_SHIFT_PRESSED] = false;
                    self.$el.trigger(_CROSS_BTN_CALLBACK_EVENT, focusOutEventData);
                    self.closeHintFeedBackPanel();
                }
            }, 1);

            this._focusOutHidePanel = function () {
                if (self.keyDown.shiftKey === true) {
                    focusOutEventData[_IS_SHIFT_PRESSED] = true;
                    self.$el.trigger(_CROSS_BTN_CALLBACK_EVENT, focusOutEventData);
                    self.closeHintFeedBackPanel();
                }
            };
            this.focusOut(unPrefixedId, this._focusOutHidePanel, 1, false);
            this.focusOut(unPrefixedId, this._focusOutHidePanel, 1);

        },

        /**
        * Creates Hack screen for Hint component
        * @method _createHackScreenForHint
        * @private
        */
        _createHackScreenForHint: function () {
            var tabIndex = this.model.getTabIndex(),
                unPrefixedId = this._containerId.split(this.idPrefix)[1];
            this.Hint_HackScreenProp = {
                elementId: unPrefixedId,
                tabIndex: tabIndex,
                acc: this.model.getAccText()
            };

            this.Close_HackScreenProp = {
                elementId: unPrefixedId + '-close-button-panel',
                tabIndex: tabIndex + 10,
                role: 'button',
                acc: this.getAccMessage('close-btn', 0)
            };
            this.createAccDiv(this.Hint_HackScreenProp);
            this.createAccDiv(this.Close_HackScreenProp);
        },


        /**
        * Sets Accessibility for Feedback component
        * @method _setAccessibilityForFeedback
        * @private
        */
        _setAccessibilityForFeedback: function () {
            var self = this,
                currentTab = this._player.getCurrentActiveTab(),
                $scrollPanel = this.$('#' + this._containerId + '-scroll-panel'),
                tabIndex = this.model.getTabIndex(),
                ttsTabIndex = tabIndex + 5,
                unPrefixedId = this._containerId.split(this.idPrefix)[1],
                isModalDisplayed = this.$el.hasClass('feedback-with-modal') === true,
                isTabsCovered = this.model.get('isTabsCovered'),
                isNextTabPresent = this._player.$el.find('#' + this.idPrefix + 'player-tab-' + (currentTab + 1)).length > 0 ? true : false;

            if (isModalDisplayed === true) {
                if (isTabsCovered === false) {//  TABS NOT covered
                    if (isNextTabPresent === true) { // Current Tab is intermediate Tab, Next Tab is present
                        tabIndex = this.getTabIndex('player-tab-' + (currentTab)) + 5;
                        ttsTabIndex = this.getTabIndex('player-tab-' + (currentTab + 1)) - 100; // 100 tab indexes are kept Reserved for feedback/ other components
                    }
                    else {// Current Tab is LAST TAB / NO TABS present
                        if (currentTab > 0 || isNextTabPresent === true) { // LAST TAB, so tab index of feedback = tab Index of Button + 5
                            tabIndex = this.getTabIndex('player-tab-' + (currentTab)) + 5;
                        }
                        else {// NO Tabs present, so tab index of feedback = tab Index of Heading + 5
                            tabIndex = this.getTabIndex('heading') + 5;
                        }
                        ttsTabIndex = MathInteractives.Common.Components.Views.HintFeedback.FEEDBACK_WITH_MODAL_TAB_INDEX_TABS_NOT_COVERED_NO_TABS;
                    }
                }
                else { // All TABS covered
                    ttsTabIndex = 5;
                    ttsTabIndex = MathInteractives.Common.Components.Views.HintFeedback.FEEDBACK_WITH_MODAL_TAB_INDEX_TABS_COVERED;
                }
            }

            //this.$('#' + this._containerId + '-acc-panel').css({ position: 'absolute', width: $scrollPanel.width(), height: $scrollPanel.height() });
            this.updateFeedbackFocusRect();
            this.setTabIndex(unPrefixedId + '-acc-panel', tabIndex);
            this.restrictAccDivSize(unPrefixedId + '-acc-panel');


            /* SET TAB INDEX FOR TTS BUTTON */
            this.ttsView.renderTTSAccessibility(ttsTabIndex);
            tabIndex = ttsTabIndex;


            /** Load Screen for Feedback Buttons **/

            if (typeof (this._buttons) !== 'undefined') {
                $(this._buttons).each(function (index) {
                    tabIndex += 5;
                    var feedback_Hack_ButtonProp = {
                        elementId: unPrefixedId + '-panel-button-' + index,
                        tabIndex: tabIndex,
                        role: 'button',
                        acc: this
                    };
                    self.createAccDiv(feedback_Hack_ButtonProp);
                });
            }

            if (this.$el.hasClass('has-close-button')) {
                this.Close_HackScreenProp = {
                    elementId: unPrefixedId + '-close-button-panel',
                    tabIndex: tabIndex + 5,
                    role: 'button',
                    acc: this.getAccMessage('close-btn', 0)
                };
                this.createAccDiv(this.Close_HackScreenProp);
            }
            if (isModalDisplayed === true) {
                this._setAccessibilityEventsForFeedback(unPrefixedId);
            }
        },

        /**
        * Sets width and height of acc-panel for feedback component and updates focus rect.
        * @method updateFeedbackFocusRect
        * @public
        */
        updateFeedbackFocusRect: function () {
            var $scrollPanel = this.$('#' + this._containerId + '-scroll-panel'),
                unPrefixedId = this._containerId.split(this.idPrefix)[1],
                accPanelId = unPrefixedId + '-acc-panel',
                $accPanel = this.$('#' + this.idPrefix + accPanelId),
                accPanelTabIndex = this.getTabIndex(accPanelId);
            $accPanel.css({ position: 'absolute', width: $scrollPanel.width(), height: $scrollPanel.height() });
            if (accPanelTabIndex > -1) {
                this.updateFocusRect(accPanelId);
            }
        },

        /**
        * Sets accessibility key events for feedback component
        * @method _setAccessibilityEventsForFeedback
        * @param {String} unPrefixedId
        * @private
        */
        _setAccessibilityEventsForFeedback: function (unPrefixedId) {
            var self = this,
                elemIdToFocus_onShiftTab;

            this.$el.off('keydown.setFocusforFeedbackModal').on('keydown.setFocusforFeedbackModal', function (event) {
                self.keyDown = event;
            });


            this._setFocusToAccFeedbackOnShiftTab = function () {
                if (self.keyDown.shiftKey === true) {
                    self.setFocus(unPrefixedId + '-acc-panel');
                }
            }

            this._setFocusToFeedbackTTSOnTab = function () {
                if (self.keyDown.shiftKey === false) {
                    var unPrefixed_TTS_Id = self.$el.find('.tts-button-panel > .click-enabled:visible').attr('id').trim().split(self.idPrefix)[1];
                    self.setFocus(unPrefixed_TTS_Id);
                }
            }
            this.focusOut(unPrefixedId + '-tts-button-panel-play-btn', this._setFocusToAccFeedbackOnShiftTab, 1, false); // unbind previous binds and then bind focusout
            this.focusOut(unPrefixedId + '-tts-button-panel-play-btn', this._setFocusToAccFeedbackOnShiftTab, 1);

            this.focusOut(unPrefixedId + '-tts-button-panel-pause-btn', this._setFocusToAccFeedbackOnShiftTab, 1, false); // unbind previous binds and then bind focusout
            this.focusOut(unPrefixedId + '-tts-button-panel-pause-btn', this._setFocusToAccFeedbackOnShiftTab, 1);

            this.focusOut(unPrefixedId + '-acc-panel', this._setFocusToFeedbackTTSOnTab, 1, false); // unbind previous binds and then bind focusout
            this.focusOut(unPrefixedId + '-acc-panel', this._setFocusToFeedbackTTSOnTab, 1);
        },


        /*
        * Enable/ Disable Hint-Feedback Tab Index.
        * @method enableHintFeedbackTab
        * @param {Boolean} isEnabled .
        */
        enableHintFeedbackTab: function (isEnabled) {
            var unPrefixedId = this._containerId.split(this.idPrefix)[1],
                closeBtnId = unPrefixedId + '-close-button-panel';
            switch (this._type) {
                case this._HINTFEEDBACK_TYPE.HINT:
                    {
                        this.enableTab(unPrefixedId, isEnabled);
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_RIGHT_PADDING:
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_TOP_PADDING:
                    {
                        this.enableTab(unPrefixedId + "-acc-panel", isEnabled);
                        this.ttsView.enableTTSBtnTab(isEnabled);
                        if (this._buttons) {
                            var counter = 0, buttonsLength = this._buttons.length;
                            for (; counter < buttonsLength; counter++) {
                                this.enableTab(unPrefixedId + '-panel-button-' + counter, isEnabled);
                            }
                        }
                        break;
                    }
            }
            this.enableTab(closeBtnId, isEnabled);

        },

        /**
        * Sets Width/Height of Container as per value passsed
        * @method _setWidthHeightOfContainer
        * @private
        */
        _setWidthHeightOfContainer: function _setWidthHeightOfContainer() {
            var $el = this.$el,
            model = this.model;
            if (typeof (model.getWidth()) !== 'undefined') {
                $el.css({ 'width': model.getWidth() + 'px' });
            }
            if (typeof (model.getHeight()) !== 'undefined') {
                $el.css({ 'height': model.getHeight() + 'px' });
            }
        },

        /**
        * Checks the existance of cross button in feedback or hint panel.
        *
        * @method _insertTopButtons
        **/
        _insertTopButtons: function _insertTopButtons() {
            var type = this._type,
                closeBtnType, messagesToPlay, ttsBtn, ttsView,
            hasbuttons = (typeof (this._buttons) !== 'undefined') ? true : false,
            showModal = (this.model.getModalDisplayStatus() === false) ? false : this.model.getModalDisplayStatus(),
            hasCrossButton = (typeof (this.model.getCrossButton()) === 'undefined') ? 'undefined' : this.model.getCrossButton(),
            _templateData = $('<div/>').append(MathInteractives.Common.Components.templates['hintFeedback']({ 'container-id': this._containerId }).trim()).children().children();
            this.$el.append(_templateData);
            //this.$el.append('<div class="hintfeedback-header"><div class="hintfeedback-button-panel"></div></div>');

            var $buttonPanel = this.$el.find('.hintfeedback-button-panel');
            switch (this._type) {
                case this._HINTFEEDBACK_TYPE.HINT:
                    {
                        closeBtnType = MathInteractives.Common.Components.Views.Button.TYPE.CLOSE_PURPLE_CROSS;
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_RIGHT_PADDING:
                    {
                        closeBtnType = MathInteractives.Common.Components.Views.Button.TYPE.CLOSE_ORANGE_CROSS;
                        this.$el.addClass('has-tts-button');
                        if (hasbuttons === true) {
                            this.$el.addClass('feedback-with-buttons');
                        }
                        if ((hasbuttons === true && showModal !== false) || showModal === true) {
                            this._showFeedBackModal();
                        }
                        $buttonPanel.append('<div id="' + this._containerId + '-tts-button-panel" class="tts-button-panel inner-top-button-panel"></div>');
                        messagesToPlay = [this._containerId + '-text-panel'];
                        ttsBtn = { containerId: this._containerId + '-tts-button-panel', messagesToPlay: messagesToPlay, path: this._path, player: this._player, idPrefix: this.idPrefix, manager: this.manager }
                        this.ttsView = MathInteractives.global.PlayerTTS.generateTTS(ttsBtn);
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_TOP_PADDING:
                    {
                        closeBtnType = MathInteractives.Common.Components.Views.Button.TYPE.CLOSE_ORANGE_CROSS;
                        this.$el.addClass('has-tts-button');
                        if (hasbuttons === true) {
                            this.$el.addClass('feedback-with-buttons');
                        }
                        if ((hasbuttons === true && showModal !== false) || showModal === true) {
                            this._showFeedBackModal();
                        }
                        $buttonPanel.append('<div id="' + this._containerId + '-tts-button-panel" class="tts-button-panel inner-top-button-panel"></div>');
                        messagesToPlay = [this._containerId + '-text-panel'];
                        ttsBtn = { containerId: this._containerId + '-tts-button-panel', messagesToPlay: messagesToPlay, path: this._path, player: this._player, idPrefix: this.idPrefix, manager: this.manager }
                        this.ttsView = MathInteractives.global.PlayerTTS.generateTTS(ttsBtn);
                        break;
                    }
            }

            if (hasCrossButton || (!hasbuttons && hasCrossButton !== 'undefined')) {

                $buttonPanel.append('<div id="' + this._containerId + '-close-button-panel" class="close-button-panel inner-top-button-panel"></div>');
                this.$el.addClass('has-close-button');
                this.$el.find('.tts-button-panel').addClass('tts-button-panel-without-button');
                var closeBtn = {
                    id: this._containerId + '-close-button-panel',
                    tooltipText: this.getMessage('close-btn-tooltip-text', '0'),
                    type: closeBtnType,
                    path: this._path,
                    player: this.model.get('player')
                };
                var self = this;
                self.closePanelButton = MathInteractives.global.Button.generateButton(closeBtn);
                self.closePanelButton.$el.off('click')
                                     .on('click', function (event) {
                                         MathInteractives.global.SpeechStream.stopReading();
                                         self.$el.trigger(MathInteractives.Common.Components.Views.HintFeedback.HINT_FEEDBACK_CROSS_BTN_CALLBACK);
                                         self.closeHintFeedBackPanel();
                                         self.removeFeedBackModal();
                                         self._player.$el.off('mousedown.' + self._containerId + 'close-hint-feedback');
                                     });

            }
            var $fbModal = this._player.$('.feedback-modal');
            $fbModal.css({ 'height': $fbModal.parent().height() });
        },

        /**
        * Checks the existance of buttons in feedback or hint panel.
        *
        * @method _checkButtons
        **/
        _checkButtons: function _checkButtons() {
            if (typeof (this._buttons) !== 'undefined') {
                this.$el.find('.hintfeedback-content').append('<div id="' + this._containerId + 'panel-button-container" class="panel-button-container"></div>')
                for (var i = 0; i < this._buttons.length; i++) {
                    var j = 0;
                    j = parseInt(i);
                    this.$el.find('.panel-button-container').append('<div id="' + this._containerId + '-panel-button-' + i + '" class="panel-button"></div>');
                    var panelBtn = {
                        id: this._containerId + '-panel-button-' + i,
                        //icon: { PathId: 'help-icon', height: 28, width: 56 },
                        text: this._buttons[i],
                        type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,
                        path: this._path,
                        fixedMinWidth: true,
                        btnWidthGroup: 'feedback-buttons'

                    };

                    var panelButton = MathInteractives.global.Button.generateButton(panelBtn);
                    this.$('#' + this._containerId + '-panel-button-' + i).off('click')
                                      .on('click', $.proxy(function (event) {
                                          MathInteractives.global.SpeechStream.stopReading();
                                          this.$el.trigger(this._containerId + '-feedback-panel-button' + i);
                                          this.closeHintFeedBackPanel();

                                      }, this));
                }
            }
        },

        /**
        * Empties Hint/Feedback panel and removes Modal div.
        *
        * @method closeHintFeedBackPanel
        * @param {Number} currentTab
        **/
        closeHintFeedBackPanel: function closeHintFeedBackPanel(currentTab) {
            var $el = this.$el;
            if ($el.hasClass('feedback-with-modal') === true) {
                this.removeFeedBackModal(currentTab);
            }
            $el.html('').hide().removeAttr('style').attr('class', this.$el.data('baseclass'));
            switch (this._type) {
                case this._HINTFEEDBACK_TYPE.HINT:
                    {
                        $el.removeClass('hint-panel');
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_RIGHT_PADDING:
                    {
                        $el.removeClass('feedback-panel');
                        break;
                    }
                case this._HINTFEEDBACK_TYPE.FEEDBACK_WITH_TOP_PADDING:
                    {
                        $el.removeClass('feedback-panel');
                        break;
                    }
            }
        },

        /*
        * Removes Feedback Modal from current Active Tab.
        * @method  removeFeedBackModal
        */
        removeFeedBackModal: function removeFeedBackModal(currentTab) {
            var isTabsCovered = this.model.get('isTabsCovered'), currentTabNo, player = this.model.get('player');
            if (typeof currentTab !== 'undefined' && isNaN(currentTab) === true) {
                this.log('currentTab is invalid');
                return;
            }
            currentTabNo = currentTab || player.getCurrentActiveTab();
            if (this.model.get('isTabsCovered') === true) {
                player.$el.find('.feedback-modal').remove();
            }
            else {
                $(player.$el.find("#" + this.idPrefix + "activity-area-" + currentTabNo)).find('.feedback-modal').remove();
            }
            player.setModalPresent(false);
        },

        /*
        * Appends Feedback Modal Div  to current Active Tab.
        * @method  _showFeedBackModal
        */
        _showFeedBackModal: function () {
            var isTabsCovered = this.model.get('isTabsCovered'), $currentTab, currentTabNo, player = this.model.get('player');
            currentTabNo = player.getCurrentActiveTab();
            $currentTab = (isTabsCovered === false) ? $(player.$el.find("#" + this.idPrefix + "activity-area-" + currentTabNo)) : player.$el;
            this.$el.addClass('feedback-with-modal');
            player.setModalPresent(true);
            if (isTabsCovered === true) {
                $currentTab = player.$el;
                if ($currentTab.find('.feedback-modal').length === 0) {
                    $currentTab.append('<div class="feedback-modal CoverTabs"></div>');
                }
            }
            else {
                $currentTab = $(player.$el.find("#" + this.idPrefix + "activity-area-" + currentTabNo));
                if ($currentTab.find('.feedback-modal').length === 0) {
                    $currentTab.append('<div class="feedback-modal"></div>');
                }
            }
        }

    }, {
        /*
        * Keydown Event data Variable Name for Shift key pressed to be passed on Cross Button click for Hint component 
        * @property IS_SHIFT_PRESSED
        * @type String
        * @static
        * @final
        */
        IS_SHIFT_PRESSED: 'isShiftPressed',

        /*
        * CallBack event on Cross Button click for Hint and Feedback 
        * @property HINT_FEEDBACK_CROSS_BTN_CALLBACK
        * @type String
        * @static
        * @final
        */
        HINT_FEEDBACK_CROSS_BTN_CALLBACK: "cross-button-hint-feedback",


        /*
        * Tab Index for feedback with activity area covered Modal for last tab / without tabs 
        * @property FEEDBACK_WITH_MODAL_TAB_INDEX_TABS_NOT_COVERED_NO_TABS
        * @type Number
        * @static
        * @final
        */
        FEEDBACK_WITH_MODAL_TAB_INDEX_TABS_NOT_COVERED_NO_TABS: 4705,


        /*
        * Tab Index for feedback with Interactivity area covered Modal
        * @property FEEDBACK_WITH_MODAL_TAB_INDEX_TABS_COVERED
        * @type Number
        * @static
        * @final
        */
        FEEDBACK_WITH_MODAL_TAB_INDEX_TABS_COVERED: 4905,

        generateHintFeedbackPanel: function (options) {

            /*
            options = {
            'type' : int, 1:hint and 2:feedback (mandatory)
            'tile' : 'text', title of the panel (optional)
            'locText' : text, text in the hint panel (mandatory for hint)
            'accText': text, acc text in the hint panel (mandatory for hint)
            'width': int, width of the panel(optional)
            'crossButton' : boolean , closs button at the top of the panel (optional)
            'tabindex' : int , for the hint panel (not yet implemented)
            'containerId' : string, parent of the panel (mandatory)
            'buttons' : array of text of the button, if button required in the panel(optional) 
            'screenId' : string, text in the feedback panel (mandatory for feedback panel)
            'isTabsCovered' : boolean, specifies if Tabs is to be covered by Feedback Modal, if displayed 
            'manager' : manager, this (mandatory)
            'path' : path, this (mandatory)
            }
                
            */
            var hintFeedbackModel = new MathInteractives.Common.Components.Models.HintFeedback(options);
            var hintFeedbackView = new MathInteractives.Common.Components.Views.HintFeedback({ el: $("#" + options['containerId']), model: hintFeedbackModel });

            return hintFeedbackView;

        }
    });


    MathInteractives.global.HintFeedback = MathInteractives.Common.Components.Views.HintFeedback;
})();