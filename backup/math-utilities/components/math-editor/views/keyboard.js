/* global MathUtilities, _, window, $ */

(function(MathUtilities) {
    'use strict';

    /**
     * A customized Backbone.View that holds the logic behind the presentation of Keyboard.
     * @class KeyboardView
     * @constructor
     * @namespace Components.MathEditor.Keyboard.Views
     * @module MathEditor
     * @submodule Keyboard
     * @extends Backbone.View
     */
    var BrowserCheck = MathUtilities.Components.Utils.Models.BrowserCheck;

    MathUtilities.Components.MathEditor.Keyboard.Views.Keyboard = Backbone.View.extend({

        /**
         * @property _functionPanel
         * @type Object
         * @default null
         */
        "_functionPanel": null,

        /**
         * @property _numberPanel
         * @type Object
         * @default null
         */
        "_numberPanel": null,

        /**
         * @property isAccessibilityAllow
         * @type Boolean
         * @default null
         */
        "isAccessibilityAllow": null,

        "_expressionPanel": null,

        /**
         * @property accManagerView
         * @type Object
         * @default null
         */
        "accManagerView": null,

        "_keyboardParnetHolder": null,

        /**
         * Holds the scroll top position of window.
         *
         * @property _scrollTop
         * @type Number
         * @default null
         */
        "_scrollTop": null,

        /**
         * Stores a flag to determine whether document should scroll when keyboard overlaps mathquill
         * @property scrollOnKeyboardOverlap
         * @type Boolean
         * @default true
         */
        "scrollOnKeyboardOverlap": true,

        /**
         * used only for ios vmk fixed position issue.
         * @property currentCursorHolder
         * @type Object
         * @default null
         */
        "$currentCursorHolder": null,

        /**
         * Instantiates FunctionPanelView and BasePanelView view and binds events for the keys.
         * @method initialize
         */
        "initialize": function() {
            var MathEditor = MathUtilities.Components.MathEditor,
                KeyboardModels = MathEditor.Keyboard.Models,
                KeyboardViews = MathEditor.Keyboard.Views,
                functionPanelModel = new KeyboardModels.FunctionPanel(),
                numberPanelModel = new KeyboardModels.BasePanel(),
                arrowPanelModel = new KeyboardModels.BasePanel(),
                expressionPanelModel = new KeyboardModels.ExpressionPanel(),
                jsonData = this.model.get('jsonData');

            this.$el.html(MathEditor.templates.keyboard().trim());
            functionPanelModel.parseData(jsonData.functionkeys);
            numberPanelModel.parseData(jsonData.number);
            arrowPanelModel.parseData(jsonData.arrowpanel);
            expressionPanelModel.parseData(jsonData.symbols);

            this._functionPanel = new KeyboardViews.FunctionPanel({
                "model": functionPanelModel,
                "el": '.function-panel'
            });

            this._numberPanel = new KeyboardViews.BasePanel({
                "model": numberPanelModel,
                "el": '.number-panel'
            });

            this._arrowPanel = new KeyboardViews.BasePanel({
                "model": arrowPanelModel,
                "el": ".buttons-panel"
            });

            this._expressionPanel = new KeyboardViews.ExpressionPanel({
                "model": expressionPanelModel,
                "el": '.keyboard-expression-panel',
                "isAccessibilityAllow": this.model.get('isAccessibilityAllow')
            });

            this.listenTo(this._expressionPanel, 'hideKeyboard', this.hideKeyboard)
                .listenTo(this._expressionPanel, 'showKeyboard', this.show)
                .listenTo(this._expressionPanel, 'tabPressInMathquill', this.tabPressOnMathquillExpressionPanel)
                .listenTo(expressionPanelModel, 'change:showSymbolPanel', this._updateAccMsgOfSymbolPanelButton)
                .listenTo(this._expressionPanel, 'enableDisableSymbol', this.enableDisableSymbolAcc);

            this.render();
            this._initAccessibility();
            this.resizeKeyboardView();

            //Keyboard needs to be responsive.
            //No one provides height width to keyboard,
            //so keyboards listens to the window for dimension change.
            $(window).on("resize", _.bind(function() {
                this.resizeKeyboardView();
            }, this));

            expressionPanelModel.set('showPanel', false);

            this._functionPanel.on('click', _.bind(this.onClick, this))
                .on('moreClick', _.bind(this.onMoreClick, this));

            this._expressionPanel.on('click', _.bind(this.onClick, this));
            this.$('.moreButton').on('mousedown', _.bind(this.onKeyClick, this));

            this.$('.tabHeader').on('mousedown', _.bind(this.onKeyClick, this))
                .on('click', _.bind(this.onHeaderChange, this));
            this.$('.moreButton').on('mousedown', _.bind(this.onKeyClick, this));

            this._numberPanel.on('click', _.bind(this.onClick, this));
            this._arrowPanel.on('click', _.bind(this.onClick, this));
        },

        "resizeKeyboardView": function() {
            var width = $(window).width(),
                range = MathUtilities.Components.MathEditor.Keyboard.Views.Keyboard.Constants.range;

            $('#math-utilities-keyboard-container').width(width);
            if (width > range[0]) {
                this.addClassToKeyboardHolder("extra-large");
                this.handleNumberPanelSelected();
            } else if (width > range[1]) {
                this.addClassToKeyboardHolder("large");
                this.handleNumberPanelSelected();
            } else if (width > range[2]) {
                this.addClassToKeyboardHolder("medium");
                this.showHideNumberPanel(MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.curSubPanelIndex);
            } else if (width > range[3]) {
                this.addClassToKeyboardHolder("small");
                this.showHideNumberPanel(MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.curSubPanelIndex);
            } else if (width < range[3]) {
                this.addClassToKeyboardHolder("tiny");
                this.showHideNumberPanel(MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.curSubPanelIndex);
            }
            this.changeText();
            if (this.isAccessibilityAllow && !BrowserCheck.isMobile) {
                _.delay(_.bind(function() {
                    this.updateAllFocusDivs();
                }, this), 10);
            }
        },

        "updateAllFocusDivs": function() {
            var elementArray = this.$('.acc-read-elem').parent(),
                counter = 0,
                length = elementArray.length;

            for (; counter < length; counter++) {
                this.accManagerView.updateFocusRect($(elementArray[counter]).attr('id'));
            }
        },

        "changeText": function() {
            if (this.accManagerView.$el.hasClass("tiny")) {
                this.$(".keyboard-expression-panel-cancel").text("X");
                this.$(".trig .localised-text").text("Trig");
            } else {
                this.$(".keyboard-expression-panel-cancel").text("Cancel");
                this.$(".trig .localised-text").text("Trigonometry");
            }
        },

        "handleNumberPanelSelected": function() {
            if (MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.curSubPanelIndex === 0) {
                this.$('#common').addClass('tabHeader-Selected');
                this.$('#numbers').removeClass('tabHeader-Selected');
                MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.curSubPanelIndex = 1;
                MathUtilities.Components.MathEditor.Keyboard.Views.FunctionPanel.showCommonFunctionKeys();
            }
            this.$('.number-panel').show();
        },

        "showHideNumberPanel": function(index) {
            if (index === 0) {
                this.$('.number-panel').show();
            } else {
                this.$('.number-panel').hide();
            }
        },

        "addClassToKeyboardHolder": function(className) {
            if (!this.accManagerView.$el.hasClass(className)) {
                var arrClasses = ["extra-large", "large", "medium", "small", "tiny"],
                    index;

                for (index in arrClasses) {
                    this.accManagerView.$el.removeClass(arrClasses[index]);
                }
                this.accManagerView.$el.addClass(className);
            }
        },

        /**
         * Instantiates Accessibility view
         * @method _initAccessibility
         */
        "_initAccessibility": function() {
            //set accessibility variable value and create view for accessibility
            this.isAccessibilityAllow = this.model.get('isAccessibilityAllow');

            var managerModel,
                setAccessibility = _.bind(function setAccessibility(accData) {
                    managerModel = new MathUtilities.Components.Manager.Models.Manager();
                    managerModel.parse(accData);

                    this.accManagerView = new MathUtilities.Components.Manager.Views.Manager({
                        "el": '#keyboardHolder',
                        "model": managerModel
                    });

                    if (this.isAccessibilityAllow && !BrowserCheck.isMobile) {
                        managerModel.isAccessible = true;
                        this.accessibilityOn();
                    } else {
                        managerModel.isAccessible = false;
                        this.accessibilityOff();
                    }
                }, this);

            //call to get json for accessibility
            $.ajax({
                "url": this.model.get('basePath') + 'data/tools/lang/en/components/math-editor/acc-data.json',
                "success": function(json) {
                    setAccessibility(json);

                },
                "async": false
            });
        },

        /**
         * Inserts css changes into DOM and binds event for undo/redo buttons.
         * @method render
         * @chainable
         * @return {Object}
         */
        "render": function() {
            var $elementParent = this.$el.parent();

            this.$el.addClass('onscreen-keyboard');
            $('.number-panel').show();
            if (BrowserCheck.isMobile) {
                $('.number-panel').css('padding-left', '0');
            }
            this._keyboardParnetHolder = $(this.model.get('keyboardHolder')).parent();

            this._keyboardParnetHolder.append(MathUtilities.Components.MathEditor.templates.keyboardHolder().trim());

            if (this.model.get('keyboardVisible') === false) {
                $('.math-utilities-math-editor-keyboard').css('visibility', 'hidden');
            }

            $('#keyboardHolder .keyboard-wrapper').append(MathUtilities.Components.MathEditor.templates.keyboardTitleHolder().trim())
                .append($(this.model.get('keyboardHolder')))
                .attr({
                    "onselectstart": 'return false',
                    "ondragstart": 'return false'
                });
            $('.keyboardTitleHolder').on('click', _.bind(this.onKeyboardTitleClick, this));

            MathUtilities.Components.Utils.TouchSimulator.enableTouch($elementParent);
            $elementParent.on('mouseover', _.bind(this.addKeyboardContainerHover, this))
                .on('mouseout mouseup', _.bind(this.removeKeyboardContainerHover, this))
                .on('mousedown', _.bind(this.onKeyboardContainerMouseDown, this))
                .on('click', _.bind(this.onKeyboardHolderClick, this));

            return this;
        },

        /**
         * Prevent propagation of click event on keyboard for iOS.
         * @method onKeyboardHolderClick
         * @param {jqueryEventObject} event
         */
        "onKeyboardHolderClick": function(event) {
            /*Regex for ios 8 version*/
            if (BrowserCheck.isIOS) {
                event.stopPropagation();
            }
        },

        /**
         * Prevent default event of the browser on mouse down.
         * In case of firefox the expression panel textarea blur occurs on clicking the keyboard empty blocks.
         * @method onKeyboardContainerMouseDown
         * @param {jqueryEventObject} evt
         */
        "onKeyboardContainerMouseDown": function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (evt.originalEvent && evt.originalEvent.data && evt.originalEvent.data.simulatedEvent) {
                $(evt.currentTarget).addClass('keyboardContainerHover');
            }
        },

        /**
         * Add hover class on the keyboard container on mouse over
         * @method addKeyboardContainerHover
         * @param {jqueryEventObject} evt
         */
        "addKeyboardContainerHover": function(evt) {
            $(evt.currentTarget).addClass('keyboardContainerHover');
        },

        /**
         * Remove hover class on the keyboard container on mouse out
         * @method removeKeyboardContainerHover
         * @param {jqueryEventObject} evt
         */
        "removeKeyboardContainerHover": function(evt) {
            if (evt.originalEvent && evt.originalEvent.type.toLowerCase() === "mouseup" &&
                !(evt.originalEvent.data && evt.originalEvent.data.simulatedEvent)) {
                return;
            }
            $(evt.currentTarget).removeClass('keyboardContainerHover');
        },

        /**
         * minimize and maximize the keyboard.
         * @method  onKeyboardTitleClick
         * @private
         */
        "onKeyboardTitleClick": function() {

            var currStatus = $(this.model.get('keyboardHolder')).css('display'),
                DUMMY_FOCUS_DELAY = 10,
                KEYBOARD_TITLE_FOCUS_DELAY = 30;

            if (currStatus === 'none') {
                $(this.model.get('keyboardHolder')).css('display', 'block');

                this.changeAccMessage('keyboardTitleContainer', 0);
                this.$el.trigger('keyboardMax');
            } else {
                $(this.model.get('keyboardHolder')).css('display', 'none');
                this.$el.trigger('keyboardMin');

                this.changeAccMessage('keyboardTitleContainer', 1);
            }

            this.setFocus('dummy-focus-rect', DUMMY_FOCUS_DELAY);
            this.setFocus('keyboardTitleContainer', KEYBOARD_TITLE_FOCUS_DELAY);
        },

        /**
         * Called on every virtual keyboard key click.Triggers parent click function.
         * @method onClick
         * @private
         */
        "onClick": function() {
            var keyCode = arguments[0],
                ignoreText = arguments[1],
                enterClicked = arguments[2],
                id = arguments[3],
                FOCUS_DELAY = 10;
            this.trigger('click', keyCode, ignoreText, enterClicked, id);

            this.setFocus(id, FOCUS_DELAY);
        },

        /**
         * trigger event onKeyclick on click of function panel button click.
         * @method onKeyClick
         * @param {Object} event current event object.
         */
        "onKeyClick": function(event) {
            //2 : mouse middle button, 3: mouse right button
            if (event.which === 2 || event.which === 3) {
                return void 0;
            }
            if (event.type === 'keypress') {
                $(event.currentTarget.parentElement).attr('data-mousedown', true);
            } else {
                $(event.currentTarget).attr('data-mousedown', true);
            }
            this.trigger('keyClick');
            return false;
        },

        "onHeaderChange": function(event) {
            var currentId = $(event.currentTarget).attr('id'),
                HEADER_FOCUS_DELAY = 15;

            this.changeHeaderAccMessage(currentId);
            $('.keyboardContainer').addClass('keyboardKeyActive');
            this.setFocus(currentId, HEADER_FOCUS_DELAY);
            this.changeText();
        },

        "onMoreClick": function() {
            if (!this.isAccessibilityAllow) {
                return;
            }
            var prevMode = arguments[0],
                DELAY = 20,
                firstFocusableElem;
            switch (prevMode) {
                case 'more0':
                    this.setFocus('dummy-focus-rect');
                    this.unloadScreen('common-tab1');
                    this.loadScreen('common-tab2');
                    firstFocusableElem = $('[data-keycode = more1]').attr('id');
                    this.setFocus(firstFocusableElem, DELAY);
                    break;
                case 'more1':
                    this.setFocus('dummy-focus-rect');
                    this.unloadScreen('common-tab2');
                    this.loadScreen('common-tab1');
                    firstFocusableElem = $('[data-keycode = more0]').attr('id');
                    this.setFocus(firstFocusableElem, DELAY);
                    break;
            }
            $('.keyboardContainer').addClass('keyboardKeyActive');
        },

        "accessibilityOn": function() {
            var functionSectionHeader = ['common', 'trig', 'others', 'atoz'],
                commonElements0 = [],
                commonElements1 = [],
                trigElements = [],
                othersElements = [],
                atozElements = [],
                numberSectionIds = [],
                keySectionIds = [],
                symbolPanelIds = [],
                idCount,
                startId,
                endId,
                addIdtoArray,
                enableSection,
                getElementsArray,
                TAB_KEY_CODE = 9,
                ESCAPE_KEY_CODE = 27,
                KEY_FOCUS_DELAY = 80,
                screens = this.accManagerView.model.get('nodes')._byId, // Screens get from manager for keyboard keys
                commonTab1Screen = screens['common-tab1'],
                commonTab2Screen = screens['common-tab2'],
                trigScreen = screens['trigo-tab'],
                othersScreen = screens['others-tab'],
                atozScreen = screens['atoz-tab'],
                numbersScreen = screens['number-panel'],
                keySectionScreen = screens['key-editor'],
                symbolPanelScreen = screens['keyboard-expression-panel'],
                elements,
                firstFocusableElem,
                elementsLength;


            addIdtoArray = function(idArray, screen) {
                elements = screen.get('elements');
                elementsLength = elements.length;
                startId = elements[0].id;
                endId = elements[elementsLength - 1].id;
                for (idCount = startId; idCount <= endId; idCount++) {
                    idArray.push(idCount.toString());
                }
            };

            //common elements
            //for more0
            addIdtoArray(commonElements0, commonTab1Screen);

            //for more1
            addIdtoArray(commonElements1, commonTab2Screen);

            //trig elements
            addIdtoArray(trigElements, trigScreen);

            //others elements
            addIdtoArray(othersElements, othersScreen);
            //a to z elements
            addIdtoArray(atozElements, atozScreen);

            //numberSectionIds
            addIdtoArray(numberSectionIds, numbersScreen);

            //keySectionIds
            addIdtoArray(keySectionIds, keySectionScreen);
            // symbol panel ids
            addIdtoArray(symbolPanelIds, symbolPanelScreen);

            enableSection = _.bind(function(sectionIds, isEnable) {
                var idCounter;
                for (idCounter = 0; idCounter < sectionIds.length; idCounter++) {
                    this.enableTab(sectionIds[idCounter], isEnable);
                }
            }, this);

            getElementsArray = _.bind(function() {
                var selectedTab = this.$('.header .tabHeader-Selected').attr('id'),
                    $more0 = this.$('#1'),
                    elementArray;
                switch (selectedTab) {
                    case 'common':
                        if ($more0.parent().is(':visible')) {
                            elementArray = commonElements0;
                        } else {
                            elementArray = commonElements1;
                        }
                        break;
                    case 'trig':
                        elementArray = trigElements;
                        break;
                    case 'others':
                        elementArray = othersElements;
                        break;
                    case 'atoz':
                        elementArray = atozElements;
                        break;
                }
                return elementArray;
            }, this);

            this.$('.key-panels-wrapper').prepend(MathUtilities.Components.MathEditor.templates.sectionFocusRect().trim());

            //load screens
            this.loadScreen('number-panel');
            this.loadScreen('common-tab1');
            this.loadScreen('key-editor');
            this.loadScreen('keyboard-expression-panel');

            //disable section element tab
            enableSection(functionSectionHeader, false);
            enableSection(commonElements0, false);
            enableSection(numberSectionIds, false);
            enableSection(keySectionIds, false);

            //on section's click enable elements inside it
            this.$('#functionSection').on('click', _.bind(function() {
                enableSection(functionSectionHeader, true);
                enableSection(getElementsArray(), true);
                this.setFocus('common', KEY_FOCUS_DELAY);
            }, this)).on('keydown', _.bind(function(evt) {
                if (!this._expressionPanel.model.get('showPanel') && evt.keyCode === TAB_KEY_CODE && evt.shiftKey) {
                    this.focusOutOnKeyboard(evt.shiftKey);
                    evt.preventDefault();
                }
            }, this));

            this.$('#keyboard-symbol-show').on('click', _.bind(function() {
                if (this._expressionPanel.model.get('showSymbolPanel')) {
                    enableSection(symbolPanelIds, true);
                    firstFocusableElem = $('[data-keycode = \'92,112,109,32\']').attr('id'); // 92,112,109,32 denotes keycode for +- key in geometry symbol section
                    this.setFocus(firstFocusableElem, KEY_FOCUS_DELAY);
                }
            }, this));

            this.$('#numberSection').on('click', _.bind(function() {
                enableSection(numberSectionIds, true);
                firstFocusableElem = $('[data-keycode = 49]').attr('id'); // data-keycode-49: number 1
                this.setFocus(firstFocusableElem, KEY_FOCUS_DELAY);
            }, this));

            this.$('#keySection').on('click', _.bind(function() {
                enableSection(keySectionIds, true);
                firstFocusableElem = $('[data-keycode = 38]').attr('id'); // data-keycode-38: up-arrow-key
                this.setFocus(firstFocusableElem, KEY_FOCUS_DELAY);
            }, this));

            //enable section element's tab if focus is on section or next section
            this.accManagerView.focusIn('functionSection', function() {
                enableSection(functionSectionHeader, false);
                enableSection(getElementsArray(), false);
            });

            this.$('#keyboard-mathquill-wrapper').on('keydown', _.bind(function(evt) {
                if (evt.keyCode === TAB_KEY_CODE && evt.shiftKey) {
                    this.focusOutOnKeyboard(evt.shiftKey);
                    evt.preventDefault();
                }
            }, this));

            $('#keyboardTitleContainer').on('keydown', _.bind(function(evt) {
                if (evt.keyCode === TAB_KEY_CODE && !evt.shiftKey) {
                    this.focusOutOnKeyboard(evt.shiftKey);
                    evt.preventDefault();
                }

            }, this));

            this.accManagerView.focusIn('keyboard-mathquill-wrapper', _.bind(function() {
                this.accManagerView.updateFocusRect('keyboard-mathquill-wrapper');
            }, this));

            this.accManagerView.focusIn('numberSection', function() {
                enableSection(functionSectionHeader, false);
                enableSection(getElementsArray(), false);
                enableSection(numberSectionIds, false);
            });

            this.accManagerView.focusIn('keySection', function() {
                enableSection(numberSectionIds, false);
                enableSection(keySectionIds, false);
            });

            this.accManagerView.focusIn('keyboardTitleContainer', _.bind(function() {
                enableSection(keySectionIds, false);
                if (this._expressionPanel.model.get('showPanel')) {
                    this.focusOutOnKeyboard(false);
                }
            }, this));

            //attach escape key for section and arrow keys
            this.$('.key,.tabHeader').on('keydown', _.bind(function(event) {
                var $target = $(event.target),
                    $targetAncestor = $target.parents();

                //Escape key pressed
                if (event.keyCode === ESCAPE_KEY_CODE) {
                    if ($targetAncestor.is('.function-panel')) {
                        //function section
                        this.setFocus('functionSection');
                    } else if ($targetAncestor.is('.number-panel') && $targetAncestor.is('.box1')) {
                        this.setFocus('numberSection');
                    } else if ($targetAncestor.is('.number-panel') && $targetAncestor.is('.box2')) {
                        this.setFocus('keySection');
                    }
                }
            }, this));

            this.accManagerView.updateFocusRect('keyboardTitleContainer');

            //change default text of common as selected
            this.changeHeaderAccMessage('common');

            //set default focus to function section

            this.$el.on('focus', '.acc-read-elem', function() {
                _.delay(function() {
                    $('.keyboardContainer').addClass('keyboardKeyActive');
                }, 1);

            }).on('blur', '.acc-read-elem', _.bind(function() {
                $('.keyboardContainer').removeClass('keyboardKeyActive');

                if (this._expressionPanel.model.get('showPanel')) {
                    this._expressionPanel.onLostFocus();
                }
                this.trigger('keyblur', this.model.get('focusedTextarea'));
            }, this));

        },

        "focusOutOnKeyboard": function(shiftKey) {
            this.$el.trigger('keyboardFocusOut', [shiftKey, this.model.get('focusedTextarea')]);
        },

        "accessibilityOff": function() {
            this.loadScreen('number-panel');
            this.loadScreen('common-tab1');
            this.loadScreen('common-tab2');
            this.loadScreen('key-editor');
            this.loadScreen('trigo-tab');
            this.loadScreen('others-tab');
            this.loadScreen('atoz-tab');
            this.loadScreen('keyboard-expression-panel');
        },

        /**
         * Change Acc message of header in function section
         * @method changeHeaderAccMessage
         * @param selectedKey {string} selected header tab id
         */
        "changeHeaderAccMessage": function(selectedKey) {
            if (this.isAccessibilityAllow) {
                var functionIds = ['common', 'trig', 'others', 'atoz'];

                _.each(functionIds, function(element) {
                    if (element === selectedKey) {
                        this.changeAccMessage(element, 1);
                    } else {
                        this.changeAccMessage(element, 0);
                    }
                }, this);
                switch (selectedKey) {
                    case functionIds[0]:
                        this.unloadScreen('common-tab1');
                        this.unloadScreen('common-tab2');
                        this.loadScreen('common-tab1');
                        break;
                    case functionIds[1]:
                        this.unloadScreen('trigo-tab');
                        this.loadScreen('trigo-tab');
                        break;
                    case functionIds[2]:
                        this.unloadScreen('others-tab');
                        this.loadScreen('others-tab');
                        break;
                    case functionIds[3]:
                        this.unloadScreen('atoz-tab');
                        this.loadScreen('atoz-tab');
                        break;
                }

            }
        },

        /**
         * load screen
         * @method loadScreen
         * @param screenId {String} of required element.
         **/
        "loadScreen": function(screenId) {
            this.accManagerView.loadScreen(screenId);
        },

        /**
         * unload screen
         * @method unloadScreen
         * @param screenId {String} of required element.
         **/
        "unloadScreen": function(screenId) {
            this.accManagerView.unloadScreen(screenId);
        },

        /**
         * Enable or disable tab of element
         * @method enableTab
         * @param elementId {String} of required element.
         * @param isEnable {String} if true enable else disable.
         **/
        "enableTab": function(elementId, isEnable) {
            if (this.isAccessibilityAllow) {
                this.accManagerView.enableTab(elementId, isEnable);
            }
        },

        /**
         * Sets the focus to element.
         * @method setFocus
         * @param elementId {String} of required element.
         * @param nDelay {Number} after nDelay ms focus will be set to elementId.
         **/
        "setFocus": function(elementId, nDelay) {

            if (BrowserCheck.isMobile || BrowserCheck.isChromeOSTouchAndType) {
                this._expressionPanel.$('textarea').prop('readonly', true);
            }

            if (this.isAccessibilityAllow) {
                this.accManagerView.setFocus(elementId, nDelay);
            }
        },

        /**
         * Call change Acc Message method, accessibility manager
         * @method changeAccMessage
         * @param accId {String}  Id of element.
         * @param messageId {String}  Id of message which is to be set
         * @param params {Array} array of replacement text for place holder(%@$%)(optional)
         */
        "changeAccMessage": function(accId, messageId, params) {
            if (this.isAccessibilityAllow) {
                this.accManagerView.changeAccMessage(accId, messageId, params);
            }
        },

        /**
         * Set expression data of the expression panel and show keyboard.
         * @method setExpressionData
         * @param expressionData {object}  expressionData object for the expression panel.
         */
        "setExpressionData": function(expressionData) {
            if (expressionData !== null) {
                this.showKeyboard(expressionData);
                this.trigger('expressionPanelUsed');
            } else {
                this._expressionPanel.model.set('showPanel', false);
            }
        },

        /**
         * Show keyboard in the holder passed as the parameter.
         * Move the keyboard inside the holder if required.
         * @method show
         * @param $elmHolder {jqueryObject}  holder to show keyboard.
         */
        "show": function($elmHolder) {
            var $prevHolder = this._keyboardParnetHolder;
            if (!$elmHolder) {
                $elmHolder = $('body');
            }
            if ($elmHolder[0] !== $prevHolder[0]) {
                $elmHolder.append($('.math-utilities-math-editor-keyboard'));
                this._keyboardParnetHolder = $elmHolder;
            }
            $('.math-utilities-math-editor-keyboard').show().css('visibility', 'visible');
            $('.keyboardContainer').show();
            this.model.set('showKeyboard', true);
            this.$el.trigger('keyboardOpen');
        },

        /**
         * Hide keyboard.
         * @method hide
         */
        "hide": function() {
            $('.math-utilities-math-editor-keyboard').hide();
            this.model.set('showKeyboard', false);
        },

        "showKeyboard": function(expressionData, $elmHolder, $keyboardParentHolder) {
            var FOCUS_DELAY = 100,
                self = this;
            this.show($keyboardParentHolder);
            if (expressionData) {
                this.showExpressionPanel();
                if (BrowserCheck.isMobile || BrowserCheck.isChromeOSTouchAndType) {
                    this._expressionPanel.$('textarea').prop('readonly', true);
                }

                /*fix for ios vmk not closing issue*/
                if (BrowserCheck.isIOS) {

                    $('body').on('click.withExpressionPanel', _.bind(function() {
                        this.preventKeyboardClose = false;
                        this.onLostFocus();
                    }, this._expressionPanel));
                }

                this._expressionPanel.model.setExpressionData(expressionData);
                this._updateExpressionPanelEquationAccMsg();
                if (this.model.get('isAccessibilityAllow') && !BrowserCheck.isIOS) {
                    this.setFocus('keyboard-mathquill-wrapper', FOCUS_DELAY);
                } else {

                    /* iOS 8 hack
                        - disable the scrolling of the page temporarily before setting focus to textarea
                        - enable scrolling again, once the keyboard is open and the page settles
                    */
                    if (BrowserCheck.isIOS) {

                        // delay added here to open vmk after native keyboard gets
                        // closed on blur
                        _.delay(function() {
                            self._expressionPanel.preventKeyboardClose = true;
                            self.handleOverLapofEquationandKeyboard($elmHolder);
                        }, 50);

                        $(document.activeElement).blur();
                        this.model.set('focusedTextarea', self._expressionPanel.$('textarea').parent().parent());

                    } else {
                        this._expressionPanel.setFocusToTextarea();
                    }
                }

                $elmHolder = expressionData.elmHolder;
                this.scrollOnKeyboardOverlap = !!expressionData.scrollOnKeyboardOverlap;

            } else {
                this.$el.addClass("expression-panel-hidden");
                this.forceExpressionPanelEditorBlur();
                if (BrowserCheck.isIOS) {
                    $('body').off('click.withExpressionPanel');
                    this.model.set('focusedTextarea', $elmHolder.find('textarea').parent().parent());
                }
            }

            if (this.scrollOnKeyboardOverlap && !BrowserCheck.isIOS) {
                this.handleOverLapofEquationandKeyboard($elmHolder);
            }
            this.$el.trigger('expressionPanelRendered');
        },

        "hideKeyboard": function() {
            var KEYBOARD_CLOSING_TIME = 50;
            this.model.set('showKeyboard', false);

            if (BrowserCheck.isIOS) {
                this.model.set('focusedTextarea', null);
                $('body')
                    .off('click.withExpressionPanel')
                    .off('click.withoutExpressionPanel');
            }

            _.delay(_.bind(function() {
                var $htmlBody;

                if (this.model.get('showKeyboard') === false) {
                    $htmlBody = $('html,body');

                    $('.math-utilities-math-editor-keyboard').hide();
                    this.hideExpressionPanel();

                    $htmlBody.removeClass('math-vmk-keyboard-open');

                    if (MathUtilities.Components.Utils.Models.BrowserCheck.isChrome) {
                        $htmlBody.removeClass('tei_overflow_visible');
                    }

                    $('.tei_dummy_div').remove();

                    this.$el.trigger('keyboardClose');

                }
            }, this), KEYBOARD_CLOSING_TIME);
        },

        "handleOverLapofEquationandKeyboard": function($elmHolder) {
            var $htmlBody;

            if (this.scrollOnKeyboardOverlap) {
                $htmlBody = $('html,body');

                $htmlBody.addClass('math-vmk-keyboard-open');

                // Fix for chrome: Not able to scroll in chrome with overflow hidden on HTML and body
                if (BrowserCheck.isChrome) {
                    $htmlBody.addClass('tei_overflow_visible');
                }

                var offset = this.getAbsoluteFrameClientPoint($elmHolder[0]),
                    $keyboardHolder = $('.keyboardHolder'),
                    GAP_BETWEEN_HOLDER_AND_KEYBOARD = 100,
                    keyBoardTop = $keyboardHolder.offset().top,
                    documentHeight,
                    keyboardHeight,
                    scrollHeight,
                    $divTopPushDom,
                    pushDomPrevHeight;


                if (offset.top + GAP_BETWEEN_HOLDER_AND_KEYBOARD > keyBoardTop) {

                    documentHeight = document.body.scrollHeight;
                    keyboardHeight = $keyboardHolder.height();
                    scrollHeight = offset.top - $(window).height() + keyboardHeight + GAP_BETWEEN_HOLDER_AND_KEYBOARD;

                    if (documentHeight < offset.top + GAP_BETWEEN_HOLDER_AND_KEYBOARD + keyboardHeight) {

                        $divTopPushDom = $('.tei_dummy_div');
                        pushDomPrevHeight = 0;

                        if ($divTopPushDom.length === 0) {
                            $divTopPushDom = $('<div/>');
                        } else {
                            pushDomPrevHeight = $divTopPushDom.height();
                        }
                        $divTopPushDom.addClass('tei_dummy_div').css({
                            "height": offset.top + GAP_BETWEEN_HOLDER_AND_KEYBOARD + keyboardHeight + pushDomPrevHeight - documentHeight,
                            "width": 1
                        });
                        $('body').append($divTopPushDom);
                    }

                    $('html,body').scrollTop(scrollHeight);
                }
            }
        },

        "getAbsoluteFrameClientPoint": function(elmCurr) {
            var offset = null,
                oCurrDoc,
                oWin,
                ptClient;
            offset = $(elmCurr).offset();
            oCurrDoc = elmCurr.ownerDocument;
            while (oCurrDoc !== null && oCurrDoc.documentElement !== document.documentElement) {
                oWin = this.getElementOwnerWindow(elmCurr);
                elmCurr = oWin.frameElement;
                if (!elmCurr) {
                    break;
                }
                oCurrDoc = elmCurr ? elmCurr.ownerDocument : null;
                ptClient = $(elmCurr).offset();
                offset.left += ptClient.left;
                offset.top += ptClient.top;
            }
            return offset;
        },

        "getElementOwnerWindow": function(elmTarget) {
            var windowElm = null,
                oDoc;
            if (elmTarget) {
                oDoc = elmTarget.ownerDocument;
                windowElm = oDoc.parentWindow || oDoc.defaultView;
            }
            return windowElm;
        },

        "showExpressionPanel": function() {
            this._expressionPanel.model.set('showPanel', true);
        },

        "hideExpressionPanel": function() {
            this._expressionPanel.model.set({
                "showPanel": false,
                "showSymbolPanel": false
            });
        },

        "updateLatex": function(keyCode) {
            var editorLatex = this.model.get('focusedTextarea').mathquill('latex');
            // Check key code for '?' OR '/'
            if (keyCode === 191 || keyCode === 47) {
                this.handleOverLapofEquationandKeyboard(this._expressionPanel.model.getElmHolder());
            }
            this._expressionPanel.model.set('currLatex', editorLatex);
            this._updateExpressionPanelEquationAccMsg();
        },

        "_updateExpressionPanelEquationAccMsg": function() {

            var editorLatex = this._expressionPanel.model.get('currLatex'),
                equationAccText, mathquillWrapperAcc;
            if (this.isAccessibilityAllow) {
                equationAccText = MathUtilities.Components.EquationEngine.Models.ParserAssist.getEquationAccessibility(editorLatex);
                mathquillWrapperAcc = '';

                if (typeof equationAccText === 'string') {
                    mathquillWrapperAcc = this.accManagerView.getAccMessage('keyboard-mathquill-wrapper', 1) + equationAccText;
                    this.accManagerView.setAccMessage('keyboard-mathquill-wrapper', mathquillWrapperAcc);
                } else {
                    this.changeAccMessage('keyboard-mathquill-wrapper', 0);
                }
            }

        },

        "_updateAccMsgOfSymbolPanelButton": function(model) {
            if (model.get('showSymbolPanel')) {
                this.changeAccMessage('keyboard-symbol-show', 1);
            } else {
                this.changeAccMessage('keyboard-symbol-show', 0);
            }
        },
        "onEquationEditorCreate": function() {
            var mathquillFocusDelay = 100;
            this._expressionPanel.onEquationEditorCreate();
            if (BrowserCheck.isIOS || BrowserCheck.isChromeOSTouchAndType) {
                this._expressionPanel.$('textarea').prop("readonly", true);
                this.model.set('focusedTextarea', this._expressionPanel.$('textarea').parent().parent());
            } else if (this.isAccessibilityAllow) {
                this.setFocus('keyboard-mathquill-wrapper', mathquillFocusDelay);
            }
        },

        "tabPressOnMathquillExpressionPanel": function(shiftKey) {
            if (shiftKey) {
                this.setFocus('keyboard-mathquill-wrapper');
            } else {

                if (this._expressionPanel.model.get('useSymbols')) {
                    this.setFocus('keyboard-symbol-show');
                } else {
                    this.setFocus('keyboard-expression-panel-add');
                }
            }

        },

        "enableDisableSymbolAcc": function(isEnable) {
            this.accManagerView.enableTab('keyboard-symbol-show', isEnable);
        },

        /**
         * Sets focus on function-panel if expression panel is not visible on tab key press or Triggers 'shiftTabOnEditor' event if
         *  shift-tab was pressed.
         * @method tabKeyPressOnEditor
         * @param shiftKey {Boolean} True, if shift key was pressed. False, otherwise.
         */
        "tabKeyPressOnEditor": function(shiftKey) {
            if (shiftKey) {
                this.$el.trigger('shiftTabOnEditor', [this.model.get('focusedTextarea')]);
            } else if (!this._expressionPanel.model.get('showPanel')) {
                this.setFocus('functionSection');
            }
        },

        "forceExpressionPanelEditorBlur": function() {
            this._expressionPanel.forceExpressionPanelEditorBlur();
        }
    }, {
        "Constants": {
            "range": [970, 900, 660, 530]
        }
    });
}(window.MathUtilities));
