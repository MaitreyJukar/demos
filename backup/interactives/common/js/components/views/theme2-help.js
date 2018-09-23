(function () {
    'use strict';

    /**
    * View for rendering Tooltip and its related events
    *
    * @class Tooltip
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    * @type Object
    **/
    MathInteractives.Common.Components.Theme2.Views.Help = MathInteractives.Common.Player.Views.Base.extend({
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
        * Holds the view of the previous button
        *
        * @property prevButtonView
        * @type Object
        * @default null
        */
        prevButtonView: null,

        /**
        * Holds the view of the next button
        *
        * @property nextButtonView
        * @type Object
        * @default null
        */
        nextButtonView: null,

        /**
        * Holds the view of the tool tip created.
        *
        * @property tooltipView
        * @type Object
        * @default null
        */
        tooltipView: null,

        /**
        * Holds the list of the visible elements among all elements.
        *
        * @property visibleElements
        * @type array
        * @default empty array []
        */
        visibleElements: [],

        /**
        * Holds the model of path for preloading files
        *
        * @property toggle
        * @type Boolean
        * @default false
        */
        toggle: false,

        /**
        * Holds animationType based on arrow type
        *
        * @property animationType
        * @type object
        * @default null
        */
        animationType: null,

        /**
        * Attaches click events to the next and previous buttons.
        *
        * @property events
        * @type Object
        **/
        events: function () {
            return {
                'click .help-footer-prev-btn.clickEnabled': '_onPrevBtnClick',
                'click .help-footer-next-btn.clickEnabled': '_onNextBtnClick'
            };
        },

        /**
        * Calls render and attach events
        *
        * @method initialize
        * @public
        **/
        initialize: function initialize() {

            this.filePath = this.model.get('filePath');
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this.idPrefix = this.player.getIDPrefix();
            this.$el = $('#' + this.idPrefix + 'player').find('.player');
            this.baseIndex = this.getTabIndex('help-btn');
            this.keyCode = -1;
            this._setCustomValues();
            this.render();
            this.filterHelpItems();
            this._displayHelpTooltip();
            this.loadScreen('help-screen');
            this._attachEvents();
        },

        /**
        * Set focus to subtitle on shift tab on help icon
        *
        * @method _setFocusToHeaderSubtitleOnShiftTab
        * @private
        **/
        _setFocusToHeaderSubtitleOnShiftTab: function (event) {

            var keyEvent = this._isEventTabOrShiftTab(event);
            if (keyEvent.shiftTabKey === true) {
                if (this.getTabIndex('help-btn') !== (this.baseIndex + 9)) {
                    event.preventDefault();
                    this.setFocus('header-subtitle');
                }
            }
        },

        /**
        * Set focus to help icon on tab on subtitle
        *
        * @method _setFocusToHelpOnTab
        * @private
        **/
        _setFocusToHelpOnTab: function (event) {

            var keyEvent = this._isEventTabOrShiftTab(event);
            if (keyEvent.tabKey === true) {
                event.preventDefault();
                if (this.$('.custom-btn-type-save').length === 0) {
                    this.setFocus('help-btn');
                }
                else {
                    this.setFocus('save-btn');
                }
            }
        },

        /**
        * Return if event is tab or shit-tab
        *
        * @method _isEventTabOrShiftTab
        * @private
        **/
        _isEventTabOrShiftTab: function (event) {
            var key = event ? event.which : event.keyCode,
                returnObj = {
                    shiftTabKey: false,
                    tabKey: false
                };
            if (key === 9) {

                if (typeof event.shiftKey !== 'undefined' && event.shiftKey === true) {
                    returnObj.shiftTabKey = true;
                }
                if (event.shiftKey !== true) {
                    returnObj.tabKey = true;
                }
            }
            return returnObj;
        },

        /**
        * Sets custom values for animation related parameters
        *
        * @method _setCustomValues
        * @private
        **/
        _setCustomValues: function () {
            var holder = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE;
            this.directionMapper = {
                'left': holder.LEFT_MIDDLE,
                'top': holder.TOP_MIDDLE,
                'right': holder.RIGHT_MIDDLE,
                'bottom': holder.BOTTOM_MIDDLE
            };
            this.priorityArray = ['left', 'top', 'right', 'bottom'];
            this.model.set('positionArray', this.priorityArray);

            this.animationType = [];
            this.animationType[holder.LEFT_MIDDLE] = 'fadeInRight';
            this.animationType[holder.TOP_MIDDLE] = 'fadeInUp';
            this.animationType[holder.RIGHT_MIDDLE] = 'fadeInLeft';
            this.animationType[holder.BOTTOM_MIDDLE] = 'fadeInDown';
        },

        /**
        * Attaches events
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function () {
            var self = this;
            this.on(MathInteractives.Common.Player.Views.Player.Events.TOGGLE_ELEMENT_HELP,
            function (data) {
                self.enableHelp(data.eleId, data.msgId, data.bEnableHelp);
            });
            this.on(MathInteractives.Common.Player.Views.Player.Events.CHANGE_HELP_TEXT,
            function (data) {
                self._changeText(data.eleId, data.msgId, data.text, data.accText);
            });
        },

        /**
        * Renders Tooltip
        *
        * @method render
        * @private
        **/
        render: function render() {
            var $container = this.$el,
                $span = $('<span />').addClass('fa fa-question-circle');

            $container.append(MathInteractives.Common.Components.templates.theme2Help({ 'idPrefix': this.idPrefix }).trim());
            this.loadScreen('theme2-help');
            this._generateButtons();
            this.$el.find('.help-img').append($span);
        },

        /**
        * Generates the help navigation i.e. previous and next buttons
        * @method _generateButtons
        * @type private
        */
        _generateButtons: function _generateButtons() {

            var ButtonData = {
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'help-footer-next-btn',
                    'type': MathInteractives.global.Theme2.Button.TYPE.NEXT,
                    'colorType': MathInteractives.global.Theme2.Button.COLORTYPE.HEADER_BLUE_SHADOW,
                    'tooltipText': this.getAccMessage('help-next-btn', 0),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE
                },
                'path': this.filePath,
                'manager': this.manager,
                'player': this.player
            },
            stateHolder = MathInteractives.Common.Components.Theme2.Views.Button;
            this.nextButtonView = MathInteractives.global.Theme2.Button.generateButton(ButtonData);
            ButtonData['data']['id'] = this.idPrefix + 'help-footer-prev-btn';
            ButtonData['data']['type'] = MathInteractives.global.Theme2.Button.TYPE.BACK;
            ButtonData['data']['tooltipText'] = this.getAccMessage('help-prev-btn', 0);
            this.prevButtonView = MathInteractives.global.Theme2.Button.generateButton(ButtonData);

            this.$el.find('#' + this.idPrefix + 'help-footer-prev-btn').css('float', 'right');
            this.$el.find('#' + this.idPrefix + 'help-footer-next-btn').css('float', 'right');

            this.loadScreen('theme2-help-buttons');
            //this.setTabIndex('help-footer-prev-btn', this.baseIndex + 8);
            //this.setTabIndex('help-footer-next-btn', this.baseIndex + 7);

            this._bindTabEventsToButtons();
        },

        /* Binds focus events to the buttons
        * @method _bindTabEventsToButtons
        * @type private
        */
        _bindTabEventsToButtons: function () {
            var self = this,
                stateHolder = MathInteractives.Common.Components.Theme2.Views.Button,
                $domRefreshDiv = null;

            this.focusIn('help-progress-text', function (event) {
                self.setTabIndex('help-btn', self.baseIndex);
                $domRefreshDiv = $('<span></span>');
                $('body').append($domRefreshDiv);
                $domRefreshDiv.remove();
            });

            this.$('#' + this.idPrefix + 'help-footer-prev-btn').on('focusin', function (event) {
                self.setTabIndex('help-btn', self.baseIndex + 9);
                $domRefreshDiv = $('<span></span>');
                $('body').append($domRefreshDiv);
                $domRefreshDiv.remove();
            });

            this.$('#' + this.idPrefix + 'help-footer-next-btn').on('focusin', function (event) {
                self.setTabIndex('help-btn', self.baseIndex + 9);
                $domRefreshDiv = $('<span></span>');
                $('body').append($domRefreshDiv);
                $domRefreshDiv.remove();
            });

        },

        /**
        * Updates the status of the element count and current element index.
        * @method _updateIndexText
        * @type private
        */
        _updateIndexText: function () {
            var currentIndex = this.model.get('currentIndex'),
                visibleItemsCount = this.visibleElements.length,
                currentIndex = visibleItemsCount === 0 ? 0 : currentIndex,
                progressObject = [currentIndex, visibleItemsCount];
            this.changeMessage('help-progress-text', 0, progressObject);
            this.changeAccMessage('help-progress-text', 0, progressObject);
            this.model.set('currentIndex', currentIndex);
        },

        /**
        * Manages button state depending on the current element index and total visible elements count.
        * Disables previous button if current index is at first element.
        * Disables next button if current index is at last element.
        * @method _manageButtonState
        * @type private
        */
        _manageButtonState: function () {
            var model = this.model,
                stateHolder = MathInteractives.Common.Components.Theme2.Views.Button,
                disableState = stateHolder.BUTTON_STATE_DISABLED,
                enableState = stateHolder.BUTTON_STATE_ACTIVE,
                totalItems = this.visibleElements.length,
                currentIndex = model.get('currentIndex'),
                prevBtnState = (currentIndex === 1 || totalItems === 0) ? disableState : enableState,
                nextBtnState = (currentIndex === totalItems || totalItems === 0) ? disableState : enableState;
            this.prevButtonView.setButtonState(prevBtnState);
            this.nextButtonView.setButtonState(nextBtnState);

            this.enableTab('help-footer-prev-btn', prevBtnState === disableState ? false : true);
            this.enableTab('help-footer-next-btn', nextBtnState === disableState ? false : true);

        },

        /**
        * Handles click of next button.
        *
        * @param Object event
        * @method _onNextBtnClick
        * @type private
        */
        _onNextBtnClick: function (event) {
            this._manageItemsCount(true);
            this._manageButtonState();
            this._displayHelpTooltip();
            MathInteractives.global.SpeechStream.stopReading();
        },

        /**
        * Handles click of previous button.
        *
        * @method _onPrevBtnClick
        * @param Object event
        * @type private
        */
        _onPrevBtnClick: function (event) {
            this._manageItemsCount(false);
            this._manageButtonState();
            this._displayHelpTooltip();
            MathInteractives.global.SpeechStream.stopReading();
        },

        /**
        * Handles current index. If last then do not allow to increment the count similarly disallow decrement when the index
        * is pointing to the first element.
        *
        * @method _manageItemsCount
        * @param {Boolean} bIncrement . If true increment current index otherwise decrement.
        * @type private
        */
        _manageItemsCount: function (bIncrement) {
            var currentIndex = this.model.get('currentIndex'),
                totalItems = this.visibleElements.length;

            currentIndex = bIncrement ? (currentIndex < totalItems ? currentIndex + 1 : currentIndex) :
                                        (currentIndex > 1) ? currentIndex - 1 : currentIndex;
            this.model.set('currentIndex', currentIndex);
            this._updateIndexText();
        },

        /**
        * Displays tooltip with tts button. Displays tooltip of the item pointed by the current index.
        *
        * @method _displayHelpTooltip
        * @param Object event
        * @type private
        */
        _displayHelpTooltip: function () {
            var visibleEles = this.visibleElements,
                currentIndex = this.model.get('currentIndex'),
                totalItems = this.visibleElements.length,
                staticHolder = MathInteractives.Common.Components.Theme2.Views.Tooltip,
                positionArray = this.model.get('positionArray'),
                directions = this.directionMapper;
            if (totalItems === 0 || currentIndex < 1 || currentIndex > totalItems) {
                return;
            }
            currentIndex = totalItems.length == 0 ? 0 : currentIndex;
            if (this.tooltipView !== null && typeof this.tooltipView !== 'undefined') {
                this.tooltipView.hideTooltip();
                this.removeTooltip();
            }
            var currentItem = visibleEles[currentIndex - 1],
                offsetVal = currentItem.offset ? currentItem.offset : { x: 0, y: 0 },
                msgId = currentItem.msgId ? currentItem.msgId : 0,
                direction = currentItem.position ? directions[currentItem.position] : directions['left'];
            currentItem.helpId = currentItem.helpId ? currentItem.helpId : currentItem.elementId;
            //generate tooltip for current displayed tooltip help item.
            var data = {
                elementEl: this.idPrefix + currentItem.elementId,
                idPrefix: this.idPrefix,
                manager: this.manager,
                _player: this.player,
                type: staticHolder.TYPE.GENERAL,
                arrowType: direction,
                path: this.filePath,
                isTts: true,
                text: currentItem.text ? currentItem.text : this.getMessage(currentItem.helpId, msgId),
                accText: currentItem.accText ? currentItem.accText : this.getAccMessage(currentItem.helpId, msgId),
                fromElementCenter: currentItem.fromElementCenter,
                isHelp: true
            };
            currentItem.msgId = msgId;
            this.tooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(data);




            this.tooltipView.showTooltip();

            var $tooltipElement = this.tooltipView.$el,
                width = currentItem.tooltipWidth ? currentItem.tooltipWidth : this.model.get('tooltipWidth');
            // override css according to help-screen css.
            $tooltipElement.find('.text-container').css({ 'width': width, 'line-height': this.model.get('lineHeight') + 'px' });
            $tooltipElement.css({ 'min-width': this.tooltipView.$el.find('.text-container').width() + 55 });
            $tooltipElement.css({ 'max-height': currentItem.tooltipHeight ? currentItem.tooltipHeight : this.model.get('tooltipHeight') });
            $tooltipElement.find('.border-div').css({ 'display': 'none' });
            $tooltipElement.addClass('help-tooltip').removeAttr('data-html2canvas-ignore');

            var $arrowDiv = $tooltipElement.find('.arrow-div');




            this.tooltipView.showTooltip(); this.addOffsetInTooltip(offsetVal);
            // if position is specified
            if (currentItem.position) {
                //check if the tooltip can fit at given position in interactivity container
                if (!this.tooltipView._checkContainment()) {
                    //check if arrow can be placed dynamically
                    if (currentItem.dynamicArrowPosition) {
                        //check if space is available for tooltip
                        if (this.tooltipView.isSpaceAvailable(data.arrowType)) {
                            this.addOffsetInTooltip(offsetVal);
                            this.tooltipView._bringInContainer();
                            if (!this.tooltipView._checkContainment()) {
                                this.managePositions(currentItem, offsetVal);
                            }
                        }
                        else {
                            this.managePositions(currentItem, offsetVal);
                        }
                    }
                    else {
                        this.managePositions(currentItem, offsetVal);
                    }
                }
            }
            else {
                //manage position of tooltip
                this.managePositions(currentItem, offsetVal);
            }


            this.tooltipView.displayTooltip();
            this.animateTooltip();
            var calcData = this.tooltipView.model.get('calcData');
            var deg = calcData.deg, arrowTop, arrowLeft;

            if (currentItem.hideArrowDiv) {
                $arrowDiv.hide();
            }
            // create arrow div
            $arrowDiv.css({
                "-webkit-transform": "rotate(0deg)",
                "-ms-transform": "rotate(0deg)",
                "-moz-transform": "rotate(0deg)",
                "transform": "rotate(0deg)"
            });

            if (deg === '180deg') {
                $arrowDiv.css({
                    "border-bottom": "0",
                    "border-left": "11px solid transparent",
                    "border-right": "11px solid transparent",
                    "border-top": "10px solid #2A2A2A"
                });
            }
            else if (deg === '270deg') {
                arrowTop = parseInt($arrowDiv.css('top'), 10);
                $arrowDiv.css({ 'top': arrowTop - 6 });
                $arrowDiv.css({
                    "border-bottom": "10px solid transparent",
                    "border-top": "10px solid transparent",
                    "border-right": "11px solid #2A2A2A",
                    "border-left": "5px solid transparent"
                });
            }
            else if (deg === '90deg') {
                arrowLeft = parseInt($arrowDiv.css('left'), 10);
                arrowTop = parseInt($arrowDiv.css('top'), 10);
                $arrowDiv.css({
                    'left': arrowLeft + 5,
                    'top': arrowTop - 6,
                    "border-bottom": "11px solid transparent",
                    "border-top": "11px solid transparent",
                    "border-left": "11px solid #2A2A2A",
                    "border-right": "5px solid transparent"
                });
            }
            else if (deg === '0deg') {
                $arrowDiv.css({
                    "border-top": "0",
                    "border-left": "11px solid transparent",
                    "border-right": "11px solid transparent",
                    "border-bottom": "10px solid #2A2A2A"
                });
            }

            // override css according to help-screen css.
            $tooltipElement.find('.tts-container').css({ 'margin-top': '10px' });
            this.$el.find('#' + data.elementEl + '-help-tooltip').css('zIndex', 901);
            this.$el.find('#' + this.tooltipView.elementEl + '-help-tooltip-tts-play-btn-tooltip').css('zIndex', 902);
            this.$el.find('#' + this.tooltipView.elementEl + '-help-tooltip-tts-pause-btn-tooltip').css('zIndex', 902);
            this.$el.find('#' + this.tooltipView.elementEl + '-help-tooltip-tts-sound-btn-tooltip').css('zIndex', 902);
            this._createAccessibilityElements(currentItem, msgId);

        },

        /**
        * Creates accessibility elements for tooltip.
        *
        * @method _createAccessibilityElements
        * @param {Object} currentItem the current element
        * @param {String} msgId message id of current screen element
        * @type private
        */
        _createAccessibilityElements: function (currentItem, msgId) {
            var self = this;

            this.setTabIndex('help-progress-text', this.baseIndex + 2);
            this.stopReading();
            this.setFocus('help-progress-text');

            this.createAccDiv({
                'elementId': currentItem.elementId + '-help-tooltip-text-container',
                'tabIndex': this.baseIndex + 4,
                'acc': currentItem.accText ? currentItem.accText : this.getAccMessage(currentItem.helpId, msgId),
                'offsetLeft': -4,
                'offsetTop': -3
            });

            this.createAccDiv({
                'elementId': currentItem.elementId + '-help-tooltip-tts-play-btn',
                'tabIndex': this.baseIndex + 6,
                'acc': this.getAccMessage('tts-btn', 0)
            });

            this.createAccDiv({
                'elementId': currentItem.elementId + '-help-tooltip-tts-pause-btn',
                'tabIndex': this.baseIndex + 6,
                'acc': this.getAccMessage('tts-btn', 0)
            });

            this.createAccDiv({
                'elementId': currentItem.elementId + '-help-tooltip-tts-sound-btn',
                'tabIndex': this.baseIndex + 6,
                'acc': this.getAccMessage('tts-btn', 0)
            });

            this.focusIn(currentItem.elementId + '-help-tooltip-tts-sound-btn', function (event) {
                if (this.is(':visible')) {
                    self.setTabIndex('help-btn', self.baseIndex + 9);
                    var $domRefreshDiv = $('<span></span>');
                    $('body').append($domRefreshDiv);
                    $domRefreshDiv.remove();
                }
            });

            this.focusIn(currentItem.elementId + '-help-tooltip-tts-pause-btn', function (event) {
                if (this.is(':visible')) {
                    self.setTabIndex('help-btn', self.baseIndex + 9);
                    var $domRefreshDiv = $('<span></span>');
                    $('body').append($domRefreshDiv);
                    $domRefreshDiv.remove();
                }
            });

            this.focusIn(currentItem.elementId + '-help-tooltip-tts-play-btn', function (event) {
                if (this.is(':visible')) {
                    self.setTabIndex('help-btn', self.baseIndex + 9);
                    var $domRefreshDiv = $('<span></span>');
                    $('body').append($domRefreshDiv);
                    $domRefreshDiv.remove();
                }
            });
        },

        /**
        * Manages position of the tooltip according to free space available in the help screen
        *
        * @method managePositions
        * @param {Object} currentItem the current element
        * @param {Object} offset the left and right positions to be added
        * @type public
        */
        managePositions: function (currentItem, offset) {
            var id, directionList, i;
            if (currentItem.positionArray) {
                directionList = this.generatePositionObject(currentItem.positionArray);
            } else {
                directionList = this.generatePositionObject(this.priorityArray);
            }

            for (i = 0; i < directionList.length; i++) {
                this.tooltipView.setArrowType(directionList[i]);
                if (this.tooltipView.isSpaceAvailable(directionList[i])) {
                    this.tooltipView.setArrowType(directionList[i]);
                    this.tooltipView.showTooltip();
                    this.addOffsetInTooltip(offset);
                    this.tooltipView._bringInContainer();
                    break;
                    if (this.tooltipView._checkContainment()) {
                        break;
                    }
                }
            }

            this.addOffsetInTooltip(offset);
            this.tooltipView._bringInContainer();
        },

        /**
        * Adds offset provided by user in the tooltip position.
        *
        * @method addOffsetInTooltip
        * @param {Object} offset
        * @type public
        */
        addOffsetInTooltip: function (offset) {
            this.tooltipView.showTooltip();
            var $el = this.tooltipView.$el,
                left = parseInt($el.css('left')),
                top = parseInt($el.css('top'));
            left += offset.x;
            top += offset.y;

            $el.css({ left: left, top: top });
            this.tooltipView.displayTooltip();
        },

        /**
        * Displays tooltip with tts button. Displays tooltip of the item pointed by the current index.
        *
        * @method generatePositionObject
        * @param Object position array e.g. ['left','top','right','bottom']
        * @return Object position array which mapps direction to tooltip arrow type from directionMapper.
        * @type private
        */
        generatePositionObject: function (positionArray) {
            var object = [], i;
            for (i = 0; i < positionArray.length; i++) {
                object.push(this.directionMapper[positionArray[i]]);
            }
            return object;
        },

        /**
        * Toggles display of the tooltip
        *
        * @method generatePositionObject
        * @type private
        */
        toggleHelpView: function () {
            if (this.toggle) {
                this.setTabIndex('help-btn', this.baseIndex);
            }
            this.toggle = !this.toggle;
            this.$el.find('.help-screen').css('display', this.toggle ? 'block' : 'none');
            this.filterHelpItems();
            this.model.set('currentIndex', 1);
            if (!this.toggle) {
                this.hideHelpTooltip();
            }
            else {
                this.showHelpTooltip();
            }

        },

        /**
        * Hides the help screen.
        *
        * @method hideHelpTooltip
        * @type public
        */
        hideHelpTooltip: function () {
            var $btnSave = this.$('.custom-btn-type-save');
            if (this.tooltipView) {
                this.tooltipView.hideTooltip();
                this.removeTooltip();
                if ($btnSave.length === 0) {
                    this.$('.custom-btn-type-help').off('keydown', $.proxy(this._setFocusToHeaderSubtitleOnShiftTab, this));
                } else {
                    $btnSave.off('keydown', $.proxy(this._setFocusToHeaderSubtitleOnShiftTab, this));
                }
                this.$('.header-subtitle').off('keydown', $.proxy(this._setFocusToHelpOnTab, this));
            }
            this.toggle = false;
            this.filterHelpItems();
            this.model.set('currentIndex', 1);
            this.$el.find('.help-screen').css('display', 'none');
            MathInteractives.global.SpeechStream.stopReading();
        },

        /**
        * Displays the help screen.
        *
        * @method showHelpTooltip
        * @type public
        */
        showHelpTooltip: function () {
            var $btnSave = this.$('.custom-btn-type-save');
            this.$el.find('.help-screen').css('display', 'block');
            this.toggle = true;
            this.setTabIndex('help-footer-prev-btn', this.baseIndex + 8);
            this.setTabIndex('help-footer-next-btn', this.baseIndex + 7);
            this.enableTab('help-footer-prev-btn', false);
            this.baseIndex = this.getTabIndex('help-btn');
            this.filterHelpItems();
            this.model.set('currentIndex', 1);
            this._displayHelpTooltip();
            if ($btnSave.length === 0) {
                this.$('.custom-btn-type-help').on('keydown', $.proxy(this._setFocusToHeaderSubtitleOnShiftTab, this));
            } else {
                $btnSave.on('keydown', $.proxy(this._setFocusToHeaderSubtitleOnShiftTab, this));
            }
            this.$('.header-subtitle').on('keydown', $.proxy(this._setFocusToHelpOnTab, this));
        },

        /**
        * Removes the tooltip.
        *
        * @method removeTooltip
        * @type public
        */
        removeTooltip: function () {
            this.$el.find('#' + this.tooltipView.elementEl + '-help-tooltip').off().remove();
            this.$el.find('#' + this.tooltipView.elementEl + '-help-tooltip-tts-play-btn-tooltip').off().remove();
            this.$el.find('#' + this.tooltipView.elementEl + '-help-tooltip-tts-pause-btn-tooltip').off().remove();
            this.$el.find('#' + this.tooltipView.elementEl + '-help-tooltip-tts-sound-btn-tooltip').off().remove();
        },

        /**
        * Enables/Disable help for provided element id.
        *
        * @method enableHelp
        * @param {String} eleId
        * @param {String} msgId
        * @param {Boolean} bEnableHelp
        * @type public
        */
        enableHelp: function (eleId, msgId, bEnableHelp) {
            var allhelpEles = this.model.get('helpElements'),
                currentItem,
                i;
            allhelpEles = this._findUniqueHelpElements(allhelpEles);
            if (allhelpEles.length > 0) {
                this.model.set('helpElements', allhelpEles);
            }
            for (i = 0; i < allhelpEles.length; i++) {
                currentItem = allhelpEles[i];
                if (currentItem.elementId === eleId && currentItem.msgId === msgId) {
                    currentItem.isHelpDisabled = bEnableHelp;
                    this.filterHelpItems();
                    break;
                }
            }
        },

        /**
         * It will find the unique help elements provided to it in the array.
         *
         * @param   {Array} helpEles An array consisting of all the help elements present in the model. (May consist of duplicates)
         * @returns {Array} An array consisting of unique help elements only.
         *
         * @method _findUniqueHelpElements
         * @private
         */
        _findUniqueHelpElements: function _findUniqueHelpElements(helpEles) {
            var index,
                uniqueHelpEles = [];
            for (index = 0; index < helpEles.length; index++) {
                if (this._findTermInArray(helpEles[index], uniqueHelpEles) === false) {
                    uniqueHelpEles.push(helpEles[index]);
                }
            }
            return uniqueHelpEles;
        },

         /**
          * An internal method used to find whether the given term is present in the given array.
          *
          * @param   {Object}  The   helpElement to be checked if present in the array of help elements.
          * @param   {Array}   array The array of help elements in which the given term could be present
          * @returns {Boolean} Will return true if term present else false
          *
          * @method _findTermInArray
          * @private
          */
         _findTermInArray: function _findTermInArray(term, array) {
            var index,
                currentHelpEl;
            for (index = 0; index < array.length; index++) {
                currentHelpEl = array[index];
                if (currentHelpEl.elementId === term.elementId && currentHelpEl.helpId === term.helpId) {
                    return true;
                }
            }
            return false;
        },

        _changeParams: function (eleId, msgId, params) {

        },

        /**
        * Change Text and Acc text for help tooltips
        *
        * @method _changeText
        * @type private
        */
        _changeText: function (eleId, msgId, text, accText) {
            var allhelpEles = this.model.get('helpElements'),
               currentItem,
               i;
            for (i = 0; i < allhelpEles.length; i++) {
                currentItem = allhelpEles[i];
                if (currentItem.elementId === eleId && currentItem.msgId === msgId) {
                    currentItem.text = text;
                    currentItem.accText = accText;
                    break;
                }
            }
        },

        /**
        * Animates the tooltip according to type of the arrow of tooltip.
        *
        * @method animateTooltip
        * @type public
        */
        animateTooltip: function () {
            var $tooltip = this.tooltipView.$el,
                arrowType = this.tooltipView.getArrowType(),
                animationType = this.animationType;

            $tooltip.addClass(animationType[arrowType]).addClass('animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass(animationType[arrowType]).removeClass('animated');
            });
        },

        /**
        * Filters currently visible elements from all elements.
        *
        * @method filterHelpItems
        * @type public
        */
        filterHelpItems: function () {
            var allhelpEles = this.model.get('helpElements'),
                currentItem, visibleHelpEle = [], flag, i;
            for (i = 0; i < allhelpEles.length; i++) {
                currentItem = allhelpEles[i];
                flag = !$('#' + this.idPrefix + currentItem.elementId).is(':visible') || (currentItem.isHelpDisabled === false);
                if (flag) {
                    continue;
                }
                visibleHelpEle.push(currentItem);
            }
            this.visibleElements = visibleHelpEle;
            this._manageButtonState();
            this._updateIndexText();
        }

    }, {
        /*
        * Initialize model and render the corresponding view
        * @method generateHelpScreen
        * @param {object} helpScreenProps
        * @static
        */
        generateHelpScreen: function (helpScreenProps) {

            var helpScreenModel = new MathInteractives.Common.Components.Theme2.Models.Help(helpScreenProps);
            var helpScreenView = new MathInteractives.Common.Components.Theme2.Views.Help({ el: helpScreenProps.el, model: helpScreenModel });
            return helpScreenView;
        }
    });

    MathInteractives.global.Theme2.Help = MathInteractives.Common.Components.Theme2.Views.Help;
})();
