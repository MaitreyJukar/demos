/* globals _, MathUtilities, $, window  */
(function() {
    'use strict';
    /**
     * A customized Backbone.View that encapsulates logic behind the presentation of Calculator.
     * @module Calculator
     * @class Calculator
     * @constructor
     * @extends Backbone.View
     * @namespace Tools.Calculator.Views
     */

    MathUtilities.Tools.Calculator.Views.Calculator = Backbone.View.extend({
        /**
         * Specifies the view of Text box(calculator display screen)
         * @property isAccessible
         * @type Boolean
         * @default false
         */
        "isAccessible": false,
        /**
         * Specifies the view of Text box(calculator display screen)
         * @property textboxView
         * @type Object
         * @default null
         */
        "textboxView": null,

        /**
         * Specifies namespace for all calculator tool models
         * @property modelNameSpace
         * @type Object
         */
        "modelNameSpace": MathUtilities.Tools.Calculator.Models,

        /**
         * Specifies namespace for all calculator tool views.
         * @property viewNameSpace
         * @type Object
         */
        "viewNameSpace": MathUtilities.Tools.Calculator.Views,

        /**
         * Specifies namespace for all calculator tool collections.
         * @property collectionNameSpace
         * @type Object
         */
        "collectionNameSpace": MathUtilities.Tools.Calculator.Collections,

        /**
         * Identifies if any button that triggers the evaluation of input expression was pressed.
         * @property collectionNameSpace
         * @type boolean
         * @default: false
         */
        "equaltoClicked": false,

        /**
         * Stores scientific and standard button views.
         * @property keyViews
         * @type object
         * @default: []
         */
        "keyViews": [],

        /**
         * Stores undo manager model object.
         * @property undoManager
         * @type object
         * @default: null
         */
        "undoManager": null,

        /**
         * Stores undo manager view object.
         * @property undoManagerView
         * @type object
         * @default: null
         */
        "undoManagerView": null,

        /**
         * Stores accessibility manager view object.
         * @property accManagerView
         * @type object
         * @default: null
         */
        "accManagerView": null,
        "TouchAndType": MathUtilities.Components.Utils.TouchSimulator,

        /**
         * It triggers the instantiation of other calculator views and models.
         * @method initialize
         * @return
         */

        "initialize": function() {
            //accessibility
            var managerModel = new MathUtilities.Components.Manager.Models.Manager({
                    "isWrapOn": false,
                    "startTabindex": this.options.startTabIndex
                }),
                JSON_DATA = MathUtilities.Tools.Calculator.Models.Calculator.JSON_DATA,
                isReFocus, updateInputText,
                standardPanel = this.$('#standard-panel'),
                isTouchSupported = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile,
                TAP = this.TouchAndType.SPECIFIC_EVENTS.TAP;
            managerModel.parse(JSON_DATA);
            //isTouchSupported added to handle accessibility in tablet
            if (this.options.bAllowAccessibility && !isTouchSupported) {
                managerModel.isAccessible = true;
                this.isAccessible = true;
            } else {
                managerModel.isAccessible = false;
            }


            this.$('#keyboard-container').prepend(MathUtilities.Tools.Calculator.templates.sectionFocusRect().trim());
            this.accManagerView = new MathUtilities.Components.Manager.Views.Manager({
                "el": '#calculator',
                "model": managerModel
            });


            this.$('#standard-section-focus-div').css({
                "width": standardPanel.width(),
                "height": standardPanel.height()
            });
            this._renderKeys();

            //load calculator screen
            this.accManagerView.loadScreen('calculator');

            //load standard-key panel
            this.accManagerView.loadScreen('standard-panel');
            this.enableStandardPanel(false);

            this.$('#standard-section-focus-div').on('click', _.bind(function() {
                this.enableStandardPanel(true);
                this.accManagerView.setFocus('key-one');
            }, this));
            this.accManagerView.focusIn('allClear', _.bind(function() {
                this.enableStandardPanel(false);
                //Enable disable undo button depending on undo stack
                this.accManagerView.enableTab('undo-btn-calc', this.undoManager._undoRedoStackMap.Calculator !== void 0 &&
                    this.undoManager._undoRedoStackMap.Calculator.undo.length !== 0);

                //Enable disable redo button depending on redo stack
                this.accManagerView.enableTab('redo-btn-calc', this.undoManager._undoRedoStackMap.Calculator !== void 0 &&
                    this.undoManager._undoRedoStackMap.Calculator.redo.length !== 0);
            }, this));
            this.accManagerView.focusIn('standard-section-focus-div', _.bind(function() {
                this.accManagerView.updateFocusRect('standard-section-focus-div');
                this.enableStandardPanel(false);

                if (this.$('#scientific-panel').is(':visible')) {
                    this.enableScientificPanel(false);
                }
            }, this));
            this.accManagerView.focusIn('math-quill-holder', _.bind(function() {
                this.accManagerView.updateFocusRect('math-quill-holder');
            }, this));

            //close history pop-up
            this.accManagerView.focusIn('undo-btn-calc', _.bind(function() {
                this.hideHistoryPopUp();
            }, this));
            //update z-index of accessibility-elem divs of redo and history buttons as they appears cut
            this.accManagerView.focusIn('redo-btn-calc', _.bind(function() {
                this.$('#redo-btn-calc .acc-read-elem').css('z-index', 1);
                this.hideHistoryPopUp();
            }, this));
            this.accManagerView.focusIn('history-btn', _.bind(function() {
                this.$('#history-btn .acc-read-elem').css('z-index', 1);
            }, this));

            this.$('#outerDiv-editor-0').keydown(_.bind(function(e) {
                //If escape key is pressed on any key, set focus on respective parent-panel
                if (e.which === 27) {
                    this.accManagerView.setFocus('math-quill-holder');
                }
            }, this));

            this.$('.standard-panel-child .acc-read-elem:not(\'#standard-section-focus-div-acc-elem\')').keydown(_.bind(function(e) {
                //If escape key is pressed on any key, set focus on respective parent-panel
                if (e.which === 27) {
                    this.accManagerView.setFocus('standard-section-focus-div', 0);
                    this.enableStandardPanel(false);
                }
            }, this));



            isReFocus = false;
            //this code is added,for IE
            this.$('#math-quill-holder').on('click', function() {
                var $this = $(this);
                _.delay(function() {
                    $this.find('textarea').focus();
                }, 10);
            }).find('textarea').on('keydown', _.bind(function(event) {
                if (this.isAccessible && event.keyCode === 9) {
                    isReFocus = true;
                    this.accManagerView.setFocus('math-quill-holder');
                    event.stopPropagation();
                }
            }, this));

            updateInputText = _.bind(function() {
                if (!isReFocus) {
                    isReFocus = true;
                    var inputLatex = this.viewNameSpace.Textbox.getText(this.textboxView.$el).trim(),
                        inputEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                    inputEquationData.setConstants({}, true);
                    inputEquationData.setLatex(inputLatex, true);
                    MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(inputEquationData);
                    if (inputLatex === '') {
                        this.accManagerView.changeAccMessage('math-quill-holder', 0);
                    } else if (inputEquationData.getAccText() !== null) {
                        if (this.$('#answer-display').is(':visible')) {
                            this.accManagerView.changeAccMessage('math-quill-holder', 2, [inputEquationData.getAccText()]);
                        } else {
                            this.accManagerView.changeAccMessage('math-quill-holder', 3, [inputEquationData.getAccText()]);
                        }

                    } else {
                        this.accManagerView.changeAccMessage('math-quill-holder', 1);
                    }
                    this.accManagerView.setFocus('temp-focus');
                    this.accManagerView.setFocus('math-quill-holder');
                }
                // added for math quill focus in IE
                _.delay(function() {
                    isReFocus = false;
                }, 100);
            }, this);

            this.accManagerView.focusIn('math-quill-holder', updateInputText);

            this.accManagerView.enableTab('history-btn', false);


            this._renderTextBox();
            this._prepareAnswerDisplay();
            this._customizeRadioButtons('.deg-rad-key');
            this.undoManager = new MathUtilities.Components.Undo.Models.UndoManager({
                "maxStackSize": this.viewNameSpace.Calculator.UNDOREDO_LIMIT
            });
            this.undoManagerView = new MathUtilities.Components.Undo.Views.UndoManager({
                "el": this.$el
            });
            this._bindEventOnUndoManagerView();
            this._bindEscapeKeyHandler();

            this._setDefaults();
            this.$('#scientific-panel [data-type=radio]').addClass('scientific-panel-child');
            this.accManagerView.setFocus('title-text', 0);
            this.TouchAndType.enableTouch(this.$('#undo-btn-calc'), {
                "specificEvents": TAP
            });
            this.TouchAndType.enableTouch(this.$('#redo-btn-calc'), {
                "specificEvents": TAP
            });
            this.TouchAndType.enableTouch(this.$('#history-btn'), {
                "specificEvents": TAP
            });

            this.$el.attr("tabindex", "-1")
                .on("keypress", _.bind(this.handleKeyEvent, this))
                .on("keydown", _.bind(this.handleKeyEvent, this));

        },

        /**
         * Performs post construction(of calculator) task.
         * @method _setDefaults
         * @private
         * @return
         */
        "_setDefaults": function() {
            this.$('#degreeSelect').parent().parent().addClass('float-right');
            this._createFDButton();
        },

        /**
         * Replaces all the child elements of FD button with a `Div` element.
         * @method _createFDButton
         * @private
         */
        "_createFDButton": function() {
            var $element = this.$('#standard-panel').children('#frac-decimal'),
                newDiv = $('<div id="fd-image">');

            $element.append(newDiv);
            this.disableFD();
        },

        /**
         * Changes attribute `disabled` to `true` for all the elements passed to it.
         * @method disableFD
         * @param {Array} buttons Array of HTML DOM elements.
         */
        "disableFD": function() {
            var $fd = this.$('#standard-panel').children('#frac-decimal');

            $fd.prop('isDisabled', true).addClass('disabled-cursor');
            $fd.find('#fd-image').addClass('fd-disabled').removeClass('fd-enabled');

            //disable tab (accessibility)
            this.accManagerView.enableTab('frac-decimal', false);
        },

        /**
         * Changes attribute `disabled` to `false` for all the elements passed to it.
         * @method enableFD
         * @param {Array} buttons Array of HTML DOM elements.
         */
        "enableFD": function() {
            var $fd = this.$('#standard-panel').children('#frac-decimal');

            $fd.prop('isDisabled', false).removeClass('disabled-cursor');
            $fd.find('#fd-image').removeClass('fd-disabled').addClass('fd-enabled');

            //Enable tab (accessibility)
            this.accManagerView.enableTab('frac-decimal', true);
        },

        /**
         * Hash of CSS selectors mapped to events. Selectors are el-relative selectors.
         * @property events
         * @type Object
         */
        "events": function() {
            return {
                "click #history-btn": "showHideHistory",
                "click #undo-btn-calc": "undo",
                "click #redo-btn-calc": "redo",
                "mousedown": "hideHistory",
                "click #standard-view": "toggleOperatingMode",
                "click #scientific-view": "toggleOperatingMode",
                "keydown #temp-focus": "triggerInputDisplayKeydownEvents",
                "keypress #temp-focus": "triggerInputDisplayKeyEvents",
                "click #standard-view-directional-arrow": "toggleOperatingMode",
                "click #scientific-view-directional-arrow": "toggleOperatingMode"
            };
        },

        /**
         * sets focus to inputs display of calculator.
         * @method focusOnInput
         * @return
         */
        "focusOnInput": function() {
            // timeout added for math quill focus
            _.delay(function() {
                this.$('#editor-1').find('textarea').focus();
            }, 250);
        },

        /**
        * Launches calculator in scientific mode, standard mode, with or without view switch buttons based on input parameter.
        * @method setOptions
        * @param initialState {object} An object with
        bDisplaySwitchButtons property - to specify whether to display view-switch buttons.
        If this property is not provided then view-switch buttons are displayed.
        ndefaultView property - to specify whether the default launch view is standard or scientific.
        If this property is not provided then default launch view is scientific;

        * @return
        */
        "setOptions": function(initialState) {
            var ndefaultView,
                bDisplaySwitchButtons,
                SCIENTIFIC = 2,
                $scientific,
                $standard;
            ndefaultView = initialState.ndefaultView || 1;
            if (initialState.bDisplaySwitchButtons !== false) {
                initialState.bDisplaySwitchButtons = true;
            }
            bDisplaySwitchButtons = initialState.bDisplaySwitchButtons;

            if (ndefaultView === SCIENTIFIC) {
                // scientific
                $scientific = this.$('#scientific-view');
                $scientific.trigger('click');
                this.TouchAndType.enableTouch($scientific);
            } else {
                // standard
                $standard = this.$('#standard-view');
                $standard.trigger('click');
                this.TouchAndType.enableTouch($standard);
            }

            if (!bDisplaySwitchButtons) {
                this.$('#toggle-calculator-container').hide();
            }

        },

        /**
         * Triggers custom key down events on input display.
         * @method triggerInputDisplayKeydownEvents
         * @param event {object} event object
         * @return
         */
        "triggerInputDisplayKeydownEvents": function(event) {
            var $inputBox = this.textboxView.$el,
                keyDownEvent, keyUpEvent, keyCode;

            keyCode = event.keyCode;

            if (keyCode === 8) {
                // backspace
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (event.ctrlKey === true && (keyCode === 90 || keyCode === 89)) {
                // undo redo CTRL + z and CTRL + y
                event.preventDefault();
                event.stopPropagation();

                keyDownEvent = $.Event('keydown');
                keyDownEvent.keyCode = Number(keyCode);
                keyDownEvent.charCode = Number(keyCode);
                keyDownEvent.which = Number(keyCode);
                keyDownEvent.bubbles = true;
                keyDownEvent.ctrlKey = true;
                keyDownEvent.cancelable = true;

                keyUpEvent = $.Event('up');
                keyUpEvent.keyCode = Number(keyCode);
                keyUpEvent.charCode = Number(keyCode);
                keyUpEvent.which = Number(keyCode);
                keyUpEvent.bubbles = true;
                keyUpEvent.cancelable = true;
                keyDownEvent.eventSubType = "custom";

                $inputBox.trigger(keyDownEvent).trigger(keyUpEvent).focus();
            }

        },

        /**
         * Manages padding for display screen in all the circumstances.
         * @method manageDisplay
         * @param bOutputPresent {boolean} Specifies if output is present or not.
         * @return
         */
        "manageDisplay": function(bOutputPresent) {
            var classToAdd, classToRemove, inputDisplay;
            inputDisplay = this.$('#math-quill-holder');
            if (bOutputPresent) {
                classToAdd = 'input-with-answer-padding';
                classToRemove = 'input-padding';
            } else {
                classToAdd = 'input-padding';
                classToRemove = 'input-with-answer-padding';
            }

            inputDisplay.removeClass(classToRemove).addClass(classToAdd);

            this._manageDisplayForInputOnlyScroll(bOutputPresent);

        },

        /**
         * Manages margin-top and scroll of display screen in all the circumstances.
         * @method _manageDisplayForInputOnlyScroll
         * @param bOutputPresent {boolean} Specifies if output is present or not.
         * @private
         * @return
         */
        "_manageDisplayForInputOnlyScroll": function(bOutputPresent) {
            var answerDisplay = this.$('#editor-1'),
                mathquillHolder = this.$('#math-quill-holder'),
                MARGIN_HT = 60,
                SCROLL_HT = 89,
                PADDING = 12,
                inputOutputDisplay = this.$('#input-output-box');

            if (bOutputPresent) {
                answerDisplay.addClass('margin-top-over-ride');
                inputOutputDisplay.addClass('input-output-box-scroll');
            } else {
                answerDisplay.toggleClass('margin-top-over-ride', answerDisplay.height() >= MARGIN_HT);
                inputOutputDisplay.toggleClass('input-output-box-scroll', mathquillHolder.height() + PADDING >= SCROLL_HT);
            }
            inputOutputDisplay.toggleClass('has-scroll', mathquillHolder.height() + PADDING > SCROLL_HT);
        },

        /**
         * Manages space between input display and output display in all the circumstances.
         * @method manageInputBoxPosition
         * @param bAddClass {boolean} Specifies whether to add class or not.
         * @return
         */
        "manageInputBoxPosition": function(bAddClass) {
            var calculatorDisplayDomElement = this.textboxView.$el,
                inputLatex = this.viewNameSpace.Textbox.getText(calculatorDisplayDomElement),
                divisionLatexPattern = /frac{/; // check if inputLatex has fraction or not
            if (bAddClass) {
                calculatorDisplayDomElement.addClass('margin-on-divide-operation');
            } else {
                if (!inputLatex.match(divisionLatexPattern)) {
                    calculatorDisplayDomElement.removeClass('margin-on-divide-operation');
                }
            }
        },


        /**
         * Binds custom events on UndoManager View to perform undo and redo.
         * @method _bindEventOnUndoManagerView
         * @private
         * @return
         */
        "_bindEventOnUndoManagerView": function() {
            this.undoManagerView.on('undo:actionPerformed', _.bind(function() {
                this.$el.mathquill('latex', '');
                this.disableFD();
                this.undoManager.undo(this.viewNameSpace.Calculator.MODULE_NAME);
                this.model.set('currentScreenState', this.viewNameSpace.Textbox.getText(this.textboxView.$el));
            }, this));

            this.undoManagerView.on('redo:actionPerformed', _.bind(function() {
                this.disableFD();
                this.undoManager.redo(this.viewNameSpace.Calculator.MODULE_NAME);
                this.model.set('currentScreenState', this.viewNameSpace.Textbox.getText(this.textboxView.$el));
            }, this));
        },

        /**
         * Renders Scientific and standard calculator keys.
         * @method _renderKeys
         * @private
         * @return
         */
        "_renderKeys": function() {
            var $scienticKeyContainer = this.$('#scientific-panel'),
                $standaredContainer = this.$('#standard-panel'),
                jsonData = this.model.get('jsonData'),
                scientificData = jsonData.scientific,
                standardData = jsonData.standard,
                commonData = jsonData.common,
                KeyModelClass = this.modelNameSpace.Key,
                KeyViewClass = this.viewNameSpace.Key,
                calculatorKeys = new this.collectionNameSpace.CalculatorKey(),
                scientificDataState, $backspaceKey, iLooper = 0,
                templates = MathUtilities.Tools.Calculator.templates,
                $plusminusKey;

            //Generate Common Keys
            this.$('#math-quill-holder').after(templates.standardPanel(commonData).trim());

            //Creating view for each Common key
            this.$('.common-key').each(_.bind(function(index, elem) {
                var data = commonData[index].state,
                    keyModel, keyView,
                    eventData;
                keyModel = new KeyModelClass({
                    "jsonData": data,
                    "currentState": 0
                });
                keyView = new KeyViewClass({
                    "model": keyModel,
                    "el": elem
                });

                this.keyViews.push(keyView);

                eventData = {
                    "keyView": keyView,
                    "keyModel": keyModel,
                    "calculatorView": this
                };

                keyView.$el.on('mousedown', _.bind(function(event) {
                    this.hideHistory(event);
                }, this));

                keyView.$el.on('click', eventData, keyView.keyClickHandler);

                this.TouchAndType.enableTouch(keyView.$el);
            }, this));

            //Generate Scientific Keys
            for (; iLooper < scientificData.length; iLooper++) {
                scientificDataState = scientificData[iLooper].state[0];
                // regex to check if its degree/radian key
                if (scientificDataState.keyClass && scientificDataState.keyClass.search(/deg-rad-key/g) > -1) {
                    scientificDataState.isRadio = true;
                }
                $scienticKeyContainer.append(templates.scientificPanel(scientificData[iLooper]).trim());
            }

            this._setupDegreeRadianSelection();

            //Creating view for each scientific key
            this.$('#scientific-panel').children(':not(.section-focus-div)').each(_.bind(function(index, value) {
                var data, eventData, keyModel, keyView;
                data = scientificData[index].state;

                if (data[0].keyType === "degreeRadian") {
                    return 'continue';
                }

                keyModel = new KeyModelClass({
                    "jsonData": data,
                    "currentState": 0
                });
                keyView = new KeyViewClass({
                    "model": keyModel,
                    "el": value
                });

                this.keyViews.push(keyView);

                // add standard key model into collection
                calculatorKeys.add(keyModel);

                eventData = {
                    "keyView": keyView,
                    "keyModel": keyModel,
                    "calculatorKeysCollection": calculatorKeys,
                    "calculatorView": this
                };

                keyView.$el.on('mousedown', _.bind(function(event) {
                        this.hideHistory(event);
                    }, this))
                    .on('click', eventData, keyView.keyClickHandler);
                this.TouchAndType.enableTouch(keyView.$el);
            }, this));

            //Generate Standard Keys
            $standaredContainer.append(templates.standardPanel(standardData).trim());

            $backspaceKey = this.$('[key=backspace]');
            $backspaceKey.append($('<div id="backspace-img">'));
            $backspaceKey.children().remove('span');

            $plusminusKey = this.$('[key=plusminus]');
            $plusminusKey.append($('<div id="plusminus-img">'));
            $plusminusKey.children().remove('span');

            // handle special keys
            this.$('.bracket-key').find('span').html('(&nbsp;&nbsp;)');
            this.$('.operator-key').eq(2).find('span').html('&ndash;');

            //Creating view for each standard key
            this.$('.standard-key').each(_.bind(function(index, elem) {
                var data = standardData[index].state,
                    keyModel, keyView,
                    eventData, isBackspaceKey;
                keyModel = new KeyModelClass({
                    "jsonData": data,
                    "currentState": 0
                });
                keyView = new KeyViewClass({
                    "model": keyModel,
                    "el": elem
                });

                this.keyViews.push(keyView);

                eventData = {
                    "keyView": keyView,
                    "keyModel": keyModel,
                    "calculatorView": this
                };
                isBackspaceKey = $(elem).attr('key') === 'backspace';

                keyView.$el.on('mousedown', _.bind(function(event) {
                    this.hideHistory(event);
                }, this));
                if (isBackspaceKey) {
                    keyView.$el.on('mousedown', eventData, keyView.keyMouseDownHandler)
                        .on('mouseup', eventData, keyView.keyMouseUpHandler);
                } else {
                    keyView.$el.on('click', eventData, keyView.keyClickHandler);
                }
                this.TouchAndType.enableTouch(keyView.$el);
            }, this));
            //unbind events from all the skip keys
            this.$('.skipKey').off();
            this.$('.blank-key').off();
        },

        /**
         * Renders calculator display.
         * @method _renderTextBox
         * @private
         * @return
         */
        "_renderTextBox": function() {
            var $editor = this.$('#editor-1'),
                textbox = new this.modelNameSpace.Textbox(),
                textboxView = new this.viewNameSpace.Textbox({
                    "model": textbox,
                    "el": $editor
                }),
                eventData = {
                    "calculatorView": this
                },
                closureFn;

            this.textboxView = textboxView;
            // bind events
            textboxView.bindEvents('vmkClickStart');
            textboxView.bindEvents('vmkClickEnd');
            textboxView.bindEvents('keydown', eventData);
            textboxView.bindEvents('keypress', eventData);
            textboxView.bindEvents('keyup', eventData);
            textboxView.bindEvents('paste', eventData);
            textboxView.$el.on('keydown', _.bind(function(event) {
                this._focusHandler(event, this);
            }, this));
            closureFn = function() {
                // set focus
                $editor.find('textarea').focus();
            };
            // added for mathquill focus
            _.delay(closureFn, 0);
        },


        "_focusHandler": function(event, calculatorView) {
            var historyBox = calculatorView.$('#history-box'),
                historyBtn = calculatorView.$('#history-btn');

            if (historyBox.is(':visible')) {
                calculatorView.$('.history-data.selected').removeClass('selected');
                historyBtn.removeClass('pull-up').addClass('pull-down');
            }

            historyBox.slideUp();
        },

        /**
         * Changes view between standard to scientific based on parameter.
         * @method toggleOperatingMode
         * @param {Object} event object
         * @return
         */
        "toggleOperatingMode": function(event) {
            var $el = this.$el,
                scientificPanel = this.$('#scientific-panel'),
                scientificSection = this.$('#scientific-section-focus-div'),
                scientificStandardDivide = this.$('#scientific-standard-divider'),
                outputContainer = this.$('#output-container'),
                keyboardCotainer = this.$('#keyboard-container'),
                TextboxView = this.viewNameSpace.Textbox,
                inputDisplay = this.textboxView.$el,
                outputDisplay = this.$('#answer-display'),
                standardViewDirectionalArrow = this.$('#standard-view-directional-arrow'),
                scientificViewDirectionalArrow = this.$('#scientific-view-directional-arrow'),
                eventTarget = $(event.target),
                textboxModel = this.textboxView.model,

                isTouchSupported = 'ontouchend' in document;
            scientificPanel = this.$('#scientific-panel');


            this.$('#history-box').hide();
            this.$('#editor-1').removeClass('equationSmallFont');
            this.$('#math-quill-holder').addClass('mathquill-holder-big');
            this.$('.disabled').removeClass('disabled');
            // clear display screen
            TextboxView.clearText(inputDisplay);
            TextboxView.clearText(outputDisplay);
            this.resetStoredResults();
            outputDisplay.hide();
            this.$('#divider').remove();
            this.manageDisplay(false);
            if (eventTarget.is(this.$('#standard-view')) || eventTarget.is(this.$('#standard-view-directional-arrow'))) {
                scientificPanel.hide();
                scientificSection.hide();
                scientificStandardDivide.hide();
                this.$('#title-img').removeClass('scientific-view').addClass('standard-view');
                this.$('#title-text').addClass('standard-text');
                this.$('#scientific-view').addClass('disabled');
                $el.removeClass('scientific-view').addClass('standard-view');
                keyboardCotainer.removeClass('scientific-keyboard').addClass('standard-keyboard');
                outputContainer.removeClass('mathquill-editable-scientific-size').addClass('mathquill-editable-standard-size');
                this.$('#history-box').removeClass('history-box-scientific-view').addClass('history-box-standard-view');
                this.$('#history-btn').removeClass('history-btn-scientific-mode').addClass('history-btn-standard-mode');
                this.$('#redo-btn-calc').removeClass('redo-btn-scientific-mode').addClass('redo-btn-standard-mode');
                this.$('#undo-btn-calc').removeClass('undo-btn-scientific-mode').addClass('undo-btn-standard-mode');
                this.$('#undo-redo-history-container').removeClass('container-scientific-mode')
                    .addClass('container-standard-mode');

                standardViewDirectionalArrow.addClass('directional-arrow-hide');
                scientificViewDirectionalArrow.removeClass('directional-arrow-hide');
                textboxModel.set({
                    "scientificNotationLatex": '',
                    "standardNotationLatex": ''
                });

                //update text-box focus rect,as its size change

                //Change title Message
                this.accManagerView.changeAccMessage('title-text', 0);
                this.accManagerView.changeMessage('title-text', 0);
                this.accManagerView.updateFocusRect('title-text');
                this.accManagerView.updateFocusRect('math-quill-holder');

                // invert engineering and inverse keys
                if (this.$('[key=eng]').hasClass('active')) {
                    if (isTouchSupported) {
                        this.$('[key=eng]').trigger('touchstart');
                    } else {
                        this.$('[key=eng]').trigger('click');
                    }

                }
                if (this.$('[key=inverse]').hasClass('active')) {
                    if (isTouchSupported) {
                        this.$('[key=inverse]').trigger('touchstart');
                    } else {
                        this.$('[key=inverse]').trigger('click');
                    }

                }

                // remove selected state of engineering and inverse button

                //accessibility of scientific-panel remove
                this.accManagerView.unloadScreen('scientific-panel');
            } else if (eventTarget.is(this.$('#scientific-view')) || eventTarget.is(this.$('#scientific-view-directional-arrow'))) {
                scientificPanel.show();
                scientificSection.show();
                this.$('#title-img').removeClass('standard-view').addClass('scientific-view');
                this.$('#standard-view').addClass('disabled');
                $el.removeClass('standard-view').addClass('scientific-view');
                keyboardCotainer.removeClass('standard-keyboard').addClass('scientific-keyboard');
                scientificStandardDivide.show();
                outputContainer.removeClass('mathquill-editable-standard-size').addClass('mathquill-editable-scientific-size');
                this.$('#title-text').removeClass('standard-text');
                this.$('#history-box').removeClass('history-box-standard-view').addClass('history-box-scientific-view');
                this.$('#history-btn').removeClass('history-btn-standard-mode').addClass('history-btn-scientific-mode');
                this.$('#redo-btn-calc').removeClass('redo-btn-standard-mode').addClass('redo-btn-scientific-mode');
                this.$('#undo-btn-calc').removeClass('undo-btn-standard-mode').addClass('undo-btn-scientific-mode');
                this.$('#undo-redo-history-container').removeClass('container-standard-mode')
                    .addClass('container-scientific-mode');

                this.$('[key=inverse]').removeClass('active').removeClass('NORMAL-HOVER');
                this.$('[key=eng]').removeClass('active').removeClass('NORMAL-HOVER');

                standardViewDirectionalArrow.removeClass('directional-arrow-hide');
                scientificViewDirectionalArrow.addClass('directional-arrow-hide');

                //accessibility of scientific-panel added
                this.accManagerView.loadScreen('scientific-panel');
                this.$('#scientific-section-focus-div').css({
                    "width": scientificPanel.width() + 'px',
                    "height": scientificPanel.height() + 'px'
                });
                this.$('#scientific-section-focus-div').on('click', _.bind(function(event) {
                    //click event for radio button is handle.
                    if ($(event.target).parents('.radio').length === 0) {
                        this.enableScientificPanel(true);
                        this.disableRadioUnchkBtn();
                        this.setRadioBtnFocus();
                    }
                }, this));
                this.accManagerView.focusIn('scientific-section-focus-div', _.bind(function() {
                    this.enableScientificPanel(false);
                }, this));
                this.accManagerView.focusIn('frac-decimal', _.bind(function() {
                    this.enableScientificPanel(false);
                }, this));
                this.accManagerView.focusIn('standard-panel', _.bind(function() {
                    this.enableScientificPanel(false);
                }, this));

                this.$('.scientific-panel-child .acc-read-elem').keydown(_.bind(function(e) {
                    //If escape key is pressed on any key, set focus on respective parent-panel
                    if (e.which === 27) {
                        this.accManagerView.setFocus('scientific-section-focus-div', 0);
                        this.enableScientificPanel(false);
                    }
                }, this));

                //to handle arrow handling for custom radio button
                this.$('#radianSelect, #degreeSelect').on('keydown', _.bind(function(event) {
                    var modelData = MathUtilities.Tools.Calculator.Models.Calculator,
                        keyCode = event.keyCode,
                        $target = $(event.currentTarget);
                    if (keyCode === modelData.KEYCODE_RIGHT || keyCode === modelData.KEYCODE_LEFT || keyCode === modelData.KEYCODE_UP || keyCode === modelData.KEYCODE_DOWN) {
                        if ($target.attr('id') === 'radianSelect') {
                            this.$('#degreeSelect').click();
                        } else {
                            this.$('#radianSelect').click();
                        }
                        this.disableRadioUnchkBtn();
                        this.setRadioBtnFocus();

                        //added to stop scrolling of page
                        event.preventDefault();
                    }
                }, this));

                //Change title Message
                this.accManagerView.changeAccMessage('title-text', 1);
                this.accManagerView.changeMessage('title-text', 1);
                // for accessibility
                _.delay(_.bind(function() {
                    this.accManagerView.updateFocusRect('title-text');
                    this.accManagerView.setFocus('title-text');
                }, this), 50);
                this.accManagerView.updateFocusRect('math-quill-holder');

                this.enableScientificPanel(false);
                this.accManagerView.updateFocusRect('scientific-section-focus-div');


            }

            inputDisplay.find('textarea').focus();

            // clear stored state;
            this.model.set('currentScreenState', '');
            // clear undo - redo stack;
            this.undoManager.clearModule(this.viewNameSpace.Calculator.MODULE_NAME);
            // Disable FD button
            this.disableFD();
            this.manageInputBoxPosition(false);
        },

        /*YUI documentation and test cases to be written*/
        "disableRadioUnchkBtn": function() {
            if (this.$('#degreeSelect').attr('data-checked') === 'checked') {
                this.accManagerView.enableTab('radianSelect', false);
                this.accManagerView.enableTab('degreeSelect', true);
            } else {
                this.accManagerView.enableTab('degreeSelect', false);
                this.accManagerView.enableTab('radianSelect', true);
            }

        },

        /*YUI documentation and test cases to be written*/
        "setRadioBtnFocus": function() {
            if (this.$('#degreeSelect').attr('data-checked') === 'checked') {
                this.accManagerView.setFocus('degreeSelect');
            } else {
                this.accManagerView.setFocus('radianSelect');
            }
        },

        "enableStandardPanel": function(bEnable) {
            var counter, length,
                tabName = ['key-one', 'key-two', 'key-three', 'key-four', 'key-five',
                    'key-six', 'key-seven', 'key-eight', 'key-nine', 'key-zero', 'dot', 'bracket',
                    'divide', 'multiply', 'minus', 'plus', 'backspace', 'equal', 'plus-minus'
                ];
            length = tabName.length;
            for (counter = 0; counter < length; counter++) {
                this.accManagerView.enableTab(tabName[counter], bEnable);
            }
        },

        "enableScientificPanel": function(bEnable) {
            var counter, length,
                tabName = ['yth-power', 'sin', 'cos', 'tan', 'yth-root', 'sin-inv', 'cos-inv', 'tan-inv',
                    'inverse', 'square', 'factorial', 'log', 'naturalLog', 'square-root', 'pi', 'euler', 'reciprocal',
                    'percentage', 'absolute', 'eng', 'exp', 'radianSelect', 'degreeSelect'
                ];
            length = tabName.length;
            for (counter = 0; counter < length; counter++) {
                this.accManagerView.enableTab(tabName[counter], bEnable);
            }

        },

        /**
         * Sets scientificNotationLatex and standardNotationLatex of calculator model to blank string.
         * @method resetStoredResults
         * @return
         */
        "resetStoredResults": function() {
            this.textboxView.model.set('scientificNotationLatex', '').set('standardNotationLatex', '');
        },

        /**
         * mathquillifies answer display.
         * @method _prepareAnswerDisplay
         * @return
         */
        "_prepareAnswerDisplay": function() {
            //Mathquilify answer display
            this.$('#answer-display').mathquill();
        },

        /**
         * A keypress handler for temp-div. Triggers key events on input display.
         * @method triggerInputDisplayKeyEvents
         * @return
         */
        "triggerInputDisplayKeyEvents": function(event) {
            var keyPressEvent, keysToSkip,
                keyCode = event.which || event.keyCode || event.charCode;

            //nothing should happen on click of enter key and equal to
            keysToSkip = [13, 61];

            if (keysToSkip.indexOf(keyCode) !== -1 || event.charCode === 0) {
                return;
            }

            if (event.ctrlKey) {
                event.preventDefault();
                event.stopPropagation();

                return;
            }

            if (keyCode !== 0) {
                this.textboxView.$el.val(String.fromCharCode(keyCode));
                keyPressEvent = $.Event('keypress');
                keyPressEvent.charCode = Number(keyCode);
                keyPressEvent.keyCode = Number(keyCode);
                keyPressEvent.which = Number(keyCode);
                keyPressEvent.bubbles = true;
                keyPressEvent.cancelable = true;
                keyPressEvent.eventSubType = "custom";
                this.textboxView.$el.trigger(keyPressEvent).focus();
            }

        },

        /**
         * Customizes radio buttons.
         * @method _customizeRadioButtons
         * @param {String}. A jQuery Selector
         * @private
         * @return
         */
        "_customizeRadioButtons": function(selector) {
            $(selector).each(function(index, elem) {
                $(elem).customRadioButton();
            });

        },

        /**
         * Sets the default radio button and Binds click handler on radio buttons.
         * @method _setupDegreeRadianSelection
         * @private
         * @return
         */
        "_setupDegreeRadianSelection": function() {
            //Set default radio button
            this.$('[type=radio].active').prop('checked', 'checked');

            // bind handler for change
            this.$('.radio').each(_.bind(function(key, value) {
                var eventData = {
                    "calculatorView": this
                };
                $(value).on('click', eventData, this._radioSelectionChange);
            }, this));

        },

        /**
         * Change event Handler for radio button selection change.
         * Set `isAngularMeasurementUnitDegree` property of calculator model on radio button selection change.
         * @method _radioSelectionChange
         * @param {Object} event. Holds event related data.
         * @return
         */
        "_radioSelectionChange": function(event) {
            event.preventDefault();
            var eventData = event.data,
                calculatorView = eventData.calculatorView,
                $calculatorView = calculatorView.$el,
                calculatorModel = calculatorView.model,
                target = event.target;
            //not used .is() due to issue with accessibility div being HTML element
            if (target === $calculatorView.find('#radianSelect')[0] || target === $calculatorView.find("label[for='radianSelect']")[0] ||
                target === $calculatorView.find('#radianSelect .acc-read-elem')[0] ||
                target === $calculatorView.find('#radianSelect .localised-text')[0]) {
                calculatorModel.set('isAngularMeasurementUnitDegree', false);
            } else if (target === $calculatorView.find('#degreeSelect')[0] || target === $calculatorView.find("label[for='degreeSelect']")[0] ||
                target === $calculatorView.find('#degreeSelect .acc-read-elem')[0] ||
                target === $calculatorView.find('#degreeSelect .localised-text')[0]) {
                calculatorModel.set('isAngularMeasurementUnitDegree', true);
            }
        },

        /**
         * Undo button event handler.
         * @method undo
         * @param {object} event object
         * @return
         */
        "undo": function(event) {
            var isTouchSupported;

            event.stopPropagation();
            event.preventDefault();

            this.$('#editor-1').mathquill('latex', '');

            this.disableFD();

            isTouchSupported = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile;

            if (isTouchSupported) {
                this.hideHistory(event);
            }

            this.$('#math-quill-holder').addClass('mathquill-holder-big');
            this.undoManager.undo(this.viewNameSpace.Calculator.MODULE_NAME);
            this.model.set('currentScreenState', this.viewNameSpace.Textbox.getText(this.textboxView.$el));
            // added for mathquill focus
            _.delay(_.bind(function() {
                this.$('#editor-1').find('textarea').focus();
            }, this), 0.001);

        },

        /**
         * Redo button event handler.
         * @method redo
         * @param {object} event object
         * @return
         */
        "redo": function(event) {
            var isTouchSupported;
            event.stopPropagation();
            event.preventDefault();

            this.disableFD();
            isTouchSupported = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile;

            if (isTouchSupported) {
                this.hideHistory(event);
            }

            this.$('#math-quill-holder').addClass('mathquill-holder-big');
            this.undoManager.redo(this.viewNameSpace.Calculator.MODULE_NAME);
            this.model.set('currentScreenState', this.viewNameSpace.Textbox.getText(this.textboxView.$el));
            // added for mathquill focus
            _.delay(_.bind(function() {
                this.$('#editor-1').find('textarea').focus();
            }, this), 0.001);
        },

        /**
         * Opens and closes history Container based on event parameter
         * @method showHideHistory
         * @param {object} event object
         * @return
         */
        "showHideHistory": function(event) {
            var $this = $(event.currentTarget);
            if (this.$('#history-box').is(':visible')) {
                // unselect selected history
                this.$('.history-data.selected').removeClass('selected');
                $this.removeClass('pull-up').addClass('pull-down');

                this.$('#history-box').slideUp();

                if (this.isAccessible) {
                    this.accManagerView.changeAccMessage('history-btn', 0);
                    this.accManagerView.setFocus('temp-focus');
                    this.accManagerView.setFocus('history-btn', 100);
                } else {
                    this.$('#editor-1').find('textarea').focus();
                }
            } else {
                $this.removeClass('pull-down').addClass('pull-up');
                this.$('#history-box').slideDown();
                if (this.$('#history-container').height() === 192) { // max height of history section.
                    this.$('#history-container').addClass('history-overflow');
                }

                if (this.isAccessible) {
                    //to update size of history-data for accessibility
                    this.$('.history-data').each(_.bind(function(key, value) {
                        this.accManagerView.updateFocusRect($(value).attr('id'));
                        this.accManagerView.enableTab($(value).attr('id'), true);
                    }, this));


                    this.accManagerView.changeAccMessage('history-btn', 2);
                    this.accManagerView.setFocus('temp-focus');
                    this.accManagerView.setFocus('history-btn', 100);
                }
            }

        },

        /**
         * Closes history Container based on event parameter
         * @method hideHistory
         * @param {object} event object
         * @return
         */
        "hideHistory": function(event) {
            var historyBox = this.$('#history-box'),
                historyBtn = this.$('#history-btn'),
                modeToggleArrowButtons = this.$('.view-toggle, .directional-arrow-container'),
                skipHiding,
                skipOnModeChange;

            if (!historyBox.is(':visible')) {
                return;
            }

            skipHiding = event.target === historyBtn[0] || event.target === historyBox[0] ||
                event.target === this.$('#history-btn div')[0] || $.contains(historyBox[0], event.target);
            skipOnModeChange = $.inArray(event.target, modeToggleArrowButtons) !== -1;

            if (event.target === this.$('#history-box-title')[0]) {
                skipHiding = false;
            }

            if (skipHiding) {
                return;
            }

            if (historyBox.is(':visible')) {
                this.$('.history-data.selected').removeClass('selected');
                historyBtn.removeClass('pull-up').addClass('pull-down');
            }
            if (skipOnModeChange && $(event.target).hasClass('disabled')) {
                return;
            }
            historyBox.slideUp();
            // added for mathquill focus
            _.delay(_.bind(function() {
                if (document.activeElement === this.$('#temp-focus').first()) {
                    return;
                }
                this.$('#editor-1').find('textarea').focus();
            }, this), 0);

            //change message of history-btn
            if (this.isAccessible) {
                this.accManagerView.changeAccMessage('history-btn', 0);
            }

        },

        /**
         * Closes history Container
         * @method hideHistoryPopUp
         * @return
         */
        "hideHistoryPopUp": function hideHistoryPopUp() {
            this.$('#history-btn').removeClass('pull-up').addClass('pull-down');
            this.$('#history-box').slideUp();

            //change acc message of history-btn
            this.accManagerView.changeAccMessage('history-btn', 0);
        },
        /**
         * Hide history on escape key down
         * @method _bindEscapeKeyHandler
         * @private
         * @return
         */
        "_bindEscapeKeyHandler": function() {
            var historyBox = this.$('#history-box');
            this.$el.on('keydown', _.bind(function(event) {
                //keyCode = 27 is for escape key
                if (event.keyCode === 27) {
                    if (historyBox.is(':visible')) {
                        this.$('.history-data.selected').removeClass('selected');
                        this.$('#history-btn').removeClass('pull-up').addClass('pull-down');
                    }
                    historyBox.slideUp();
                }
            }, this));
        },


        /**
         * Sets 'currentScreenState' property of the calculator model if and only if there is a change in output screen state.
         * @method _recordNewScreenState
         * @private
         * @param {String} newScreenState. New State of the output screen.
         * @return
         */
        "_recordNewScreenState": function(newScreenState) {
            var calculatorModel = this.model,
                currentState = calculatorModel.get('currentScreenState');

            if (currentState === newScreenState) {
                return;
            }
            this._createUndoRedoData(currentState, newScreenState, this.viewNameSpace.Calculator.executeActionList.OUTPUT_SCREEN_STATE);

            calculatorModel.set('currentScreenState', newScreenState);
        },

        /**
         * Creates a single object to store undo-redo data and then passes that object and actionName to the execute method.
         * @method _createUndoRedoData
         * @private
         * @param {String} undoData. Previous screen state.
         * @param {String} redoData. New screen state.
         * @param {String} actionName. undo-redo action name in execute method;
         * @return
         */
        "_createUndoRedoData": function(undoData, redoData, actionName) {
            var undoRedoData = {},
                undoRedoAction = null;


            undoRedoData.undoData = undoData;
            undoRedoData.redoData = redoData;

            undoRedoAction = actionName;

            this.execute(undoRedoAction, undoRedoData);

        },

        /**
         * If skipRegistration parameter is true it performs undo or redo operation.
         * Else it creates undo and redo actions and registers them.
         * @method execute
         * @param {String} actionName Name of the action to execute to undo or redo.
         * @param {String} data It is undo redo data.
         * @param {boolean} skipRegistration If true, undo or redo operation is performed.
         * If false, undo and redo actions are created and registered.
         * @return
         */
        "execute": function(actionName, data, skipRegistration) {
            var undoAction = null,
                redoAction = null,
                viewNameSpace = this.viewNameSpace,
                UndoRedoModelNameSpace = MathUtilities.Components.Undo.Models,
                CalculatorViewClass = viewNameSpace.Calculator,
                $answerDisplay = this.$('#answer-display');


            if (actionName === 'screenState') {
                if (skipRegistration) {
                    viewNameSpace.Textbox.setText(data, this.textboxView.$el, 'latex');
                    if (data.indexOf('frac') !== -1) {
                        this.manageInputBoxPosition(true);
                    } else {
                        this.manageInputBoxPosition(false);
                    }
                    $answerDisplay.hide();
                    this.equaltoClicked = false;
                    this.textboxView.$el.removeClass('equationSmallFont');
                    this.$('#divider').remove();
                    this.manageDisplay(false);
                    this.resetStoredResults();

                    if (this.isAccessible) {
                        this.accManagerView.setFocus('math-quill-holder', 5);
                    }
                } else {
                    undoAction = new UndoRedoModelNameSpace.Action({
                        "name": CalculatorViewClass.executeActionList.OUTPUT_SCREEN_STATE,
                        "data": data.undoData,
                        "manager": this
                    });

                    redoAction = new UndoRedoModelNameSpace.Action({
                        "name": CalculatorViewClass.executeActionList.OUTPUT_SCREEN_STATE,
                        "data": data.redoData,
                        "manager": this
                    });
                }
            }

            if (!skipRegistration) {
                this.undoManager.registerAction(viewNameSpace.Calculator.MODULE_NAME, undoAction, redoAction);
            }
        },

        /**
         * Triggers keyDown and keyPress Events.
         * @method _triggerKeyDown
         * @param {Object} selector. JQuery object of key-editor.
         * @param {Number} keyCode. Key code associated with a character to be rendered.
         * @param {Boolean} isSpecialChar. A boolean to check whether the character has to be entered in key-editor.
         * Special characters such as space bar, arrow keys and backspace are not rendered in key-editor.
         * @param {Boolean} isOpenBracket. A boolean to check whether the latex has open bracket or not.
         * @param {Boolean} isTriggerCode, trigger to stimulate keyboard functionality on $el
         * @return
         */
        "_triggerKeyDown": function(selector, keyCode, isSpecialChar, isOpenBracket, isTriggerCode) {
            var keyDownEvent, keyPressEvent, keyUpEvent;
            if (!isSpecialChar) {
                selector.val(String.fromCharCode(keyCode));
            }

            keyDownEvent = $.Event('keydown');
            keyDownEvent.keyCode = Number(keyCode);
            keyDownEvent.charCode = Number(keyCode);
            keyDownEvent.which = Number(keyCode);
            keyDownEvent.bubbles = true;
            keyDownEvent.cancelable = true;
            keyUpEvent = $.Event('keyup');
            keyUpEvent.keyCode = Number(keyCode);
            keyUpEvent.charCode = Number(keyCode);
            keyUpEvent.which = Number(keyCode);
            keyUpEvent.bubbles = true;
            keyUpEvent.cancelable = true;

            //key code 8 is for backspace key
            if (keyCode === 8) {
                selector.trigger(keyDownEvent).trigger(keyUpEvent).focus();
                return;
            }
            keyDownEvent.openBracket = isOpenBracket || false;
            keyPressEvent = $.Event('keypress');
            keyPressEvent.keyCode = Number(keyCode);
            keyPressEvent.charCode = Number(keyCode);
            keyPressEvent.which = Number(keyCode);
            keyPressEvent.bubbles = true;
            keyPressEvent.cancelable = true;
            keyPressEvent.isTriggerCode = isTriggerCode;
            keyDownEvent.eventSubType = "custom";
            selector.trigger(keyDownEvent).trigger(keyPressEvent).trigger(keyUpEvent).focus();

        },

        /**
         * Destroys the view.
         * @method destroy
         * @return
         */
        "destroy": function() {
            var keyViewCount = this.keyViews.length,
                iCount;
            //detach all events
            this.detachEvents();

            //destroy input-output display text box
            this.textboxView.destroy();

            for (iCount = 0; iCount < keyViewCount; iCount++) {
                this.keyViews[iCount].destroy();
            }

            this.modelNameSpace = null;
            this.viewNameSpace = null;
            this.collectionNameSpace = null;
            this.equaltoClicked = null;
            this.textboxView = null;
            this.keyViews = null;
            this.remove();

        },

        /**
         * Unbinds all the events.
         * @method destroy
         * @return
         */
        "detachEvents": function() {
            this.$el.add("*").off();
        },

        "handleKeyEvent": function(event) {
            if ($(event.target).is('textarea')) {
                return;
            }
            var $parent = $(event.target).parent(),
                triggerEvent = false,
                code = event.which || event.charCode || event.keyCode,
                isSpecialChar = false,
                inputEvaluationTriggerKeys = [13, 61]; //keyCode 13: enter, 61:=

            if (event.type === "keydown") {
                //8 for backspace and 13 for enter
                //backspace is not triggered in keyPress
                //when accessibility is on, accessibility manager prevent enter key propogation, as it is used to trigger click functionality
                //but for title and answer we don't need click functionality, so triggering enter event in mathquill
                if (code === 8 || code === 13 && ($parent.is($("#title-text")) || $parent.is($("#answer-display")))) {
                    triggerEvent = true;
                    isSpecialChar = true;
                }
            } else if (this.isCharacterKeyPress(event)) {
                triggerEvent = true;
                isSpecialChar = inputEvaluationTriggerKeys.indexOf(code) > -1;
            }
            if (triggerEvent) {
                _.delay(_.bind(function() {
                    this._triggerKeyDown(this.textboxView.$el.find("textarea"), code, isSpecialChar, false, true);
                }, this), 100); // delay is added to avoid focus conflict with button ReFocus
            }
        },
        "isCharacterKeyPress": function(event) {
            if (typeof event.which == "undefined") {
                // This is IE, which only fires key press events for printable keys
                return true;
            }
            if (typeof event.which == "number" && event.which > 0) {
                // In other browsers except old versions of WebKit, event.which is
                // only greater than zero if the key press is a printable key.
                // We need to filter out backspace and ctrl/alt/meta key combinations
                return !event.ctrlKey && !event.metaKey && !event.altKey && event.which != 8; //8 for backspace
            }
            return false;
        }
    }, {
        /**
         * Identifies the module name required for undo-redo operation
         * @property MODULE_NAME
         * @type Number
         * @static
         * @final
         **/
        "MODULE_NAME": 'Calculator',

        /**
         * Identifies the limit of history data.
         * @property HISTORY_LIMIT
         * @type Number
         * @static
         * @final
         **/
        "HISTORY_LIMIT": 20,


        /**
         * Identifies the limit of Undo and redo.
         * @property UNDOREDO_LIMIT
         * @type Number
         * @static
         * @final
         **/
        "UNDOREDO_LIMIT": 15,

        /**
         * Identifies the type of undo-redo action to take.
         * @property executeActionList
         * @type Object
         * @static
         * @final
         **/
        "executeActionList": {
            "OUTPUT_SCREEN_STATE": 'screenState'
        }

    });
})();
