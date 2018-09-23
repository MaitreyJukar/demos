/* global _, $, window  */

(function(MathUtilities) {
    'use strict';

    /**
     * A customized Backbone.View that holds the logic behind the presentation of Equation Editor.
     * @class EquationEditorView
     * @constructor
     * @namespace Components.MathEditor.EquationEditor.Views
     * @module MathEditor
     * @submodule EquationEditor
     * @extends Backbone.View
     */

    MathUtilities.Components.MathEditor.EquationEditor.Views.EquationEditor = Backbone.View.extend({

        /**
         * Triggers render call.
         * @method initialize
         * @param {Object} options for equation editor accessibility
         */
        "initialize": function initialize(options) {
            this.isAccessibilityAllow = options.isAccessibilityAllow;
            this.donotBindTab = options.donotBindTab;
            this.render();
        },

        /**
         * Inserts text-editor into DOM.
         * @method render
         * @chainable
         * @return {Object}
         */
        "render": function render() {
            this.onEnterClick(this.$el);
            return this;
        },

        /**
         * New text area added for virtual keyboard 'Enter' click.
         * @method onEnterClick
         * @param {Object} editorHolder container of editor on which Enter click is triggered
         * @private
         */
        "onEnterClick": function(editorHolder) {
            var editorLength = editorHolder.find('.mathquill-editable').length,
                nodeId = editorLength + 1,
                editorId = 'editor-' + nodeId,
                $newEditor = null,
                $editorTextarea,
                i,
                idCounter = this.model.get('idCounter'),
                divId = this.model.get('divId');

            if (idCounter === void 0) {
                if (editorLength === 0) {
                    editorHolder.append(MathUtilities.Components.MathEditor.templates.editableTextbox({
                        "_editorId": editorId,
                        "_divId": divId
                    }).trim());

                    if (this.model.get('closeButton')) {
                        $('#outerDiv-editor-' + divId).append(MathUtilities.Components.MathEditor.templates.closeButton({
                            "_divId": divId
                        }).trim());
                    }
                } else {
                    for (i = 0; i < editorLength + 1; i++) {
                        if ($('#' + editorId).length === 0) {
                            editorHolder.append(MathUtilities.Components.MathEditor.templates.editableTextbox({
                                "_editorId": editorId,
                                "_divId": divId
                            }).trim());

                            if (this.model.get('closeButton')) {
                                $('#outerDiv-editor-' + divId).append(MathUtilities.Components.MathEditor.templates.closeButton({
                                    "_divId": divId
                                }).trim());
                            }
                            break;
                        }
                        nodeId++;
                        editorId = 'editor-' + nodeId;
                    }
                }
            } else {
                editorId = idCounter;
                editorHolder.append(MathUtilities.Components.MathEditor.templates.editableTextbox({
                    "_editorId": 'editor-' + idCounter,
                    "_divId": divId
                }).trim());

                if (this.model.get('closeButton')) {
                    $('#outerDiv-editor-' + divId).append(MathUtilities.Components.MathEditor.templates.closeButton({
                        "_divId": divId
                    }).trim());
                }
            }
            $newEditor = $(editorHolder.find('.mathquill-editable')[editorLength]);

            $newEditor.mathquill('editable');

            editorHolder.find('#closeDiv-editor-' + divId).on('click', _.bind(this.closeEditor, this));
            this.model.set({
                "divId": ++divId
            });

            $editorTextarea = $newEditor.find('textarea');
            if (this.isAccessibilityAllow && !this.donotBindTab) {
                $editorTextarea.on('keydown', _.bind(this.onKeyDown, this));
            }
            $editorTextarea.off('paste.equationEditor')
                .on('paste.equationEditor', _.bind(this._onEquationPaste, this))
                .on('keyup', _.bind(this.onKeyUp, this))
                .on('focus', _.bind(this.setFocusedArea, this));

            if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                $editorTextarea.prop('readonly', true)
                    .on('focus', _.bind(this.showKeyboardOnTouchDevices, this));
            }
            if (editorLength !== 0) {
                $newEditor.blur();
            }

            if (this.model.get('defaultFocus') || this.model.get('defaultFocus') === void 0) {
                if (editorLength === 0) {
                    _.delay(function() {
                        $editorTextarea.first().trigger('focus');
                    }, 10);
                } else {
                    $editorTextarea.first().trigger('focus');
                }
            }
        },

        "onKeyDown": function(event) {
            // 9 for tab
            if (event.keyCode === 9) {
                event.preventDefault();
                this.trigger('tabKeyPress', event.shiftKey);
            }
        },

        /**
         * Sets the current focused text area to a variable in model.
         * @method setFocusedArea
         * @private
         * @param {Object} textArea Focused text area
         */
        "setFocusedArea": function(textArea) {
            this.trigger('focus', $(textArea.currentTarget).parent().parent());
        },

        /**
         * Sets the current focused text area to a variable in model for touch devices.
         * @method showKeyboardOnTouchDevices
         * @private
         * @param {Object} event current event object.
         */
        "showKeyboardOnTouchDevices": function(event) {
            $(event.currentTarget).attr('readOnly', true);
            event.preventDefault();
        },

        /**
         * Modify/Handle text before actual paste.
         * @method _onEquationPaste
         * @private
         * @param {Object} event current event object.
         */
        "_onEquationPaste": function(event) {
            var $mathQuill = $(event.target).parents('.outerDiv').find('.mathquill-editable'),
                actualText;

            // Add Time out as actual paste function of the mathquill should be completed before following text replace.
            _.delay(function() {
                actualText = $mathQuill.mathquill('latex');
                actualText = actualText.replace(/(<|>)=/g, '='); // Correct all less than/ greater than or equal to signs
                $mathQuill.mathquill('latex', actualText);
                $mathQuill.find('textarea').focus();
            }, 0);

        },

        /**
         * Called on every keyup.
         * @method onKeyUp
         * @private
         * @param {Object} event current event object.
         */
        "onKeyUp": function(event) {
            this.trigger('renderKeyCode', event.keyCode);
            if (event.equation) {
                return;
            }
            var equationJson = this.model.get('equationJsonData'),
                equationArray = Object.keys(equationJson),
                equationLength = equationArray.length,
                $mathSpan = $(event.currentTarget).parent().parent(),
                currentFocusParent = $mathSpan.find('.cursor').parent(),
                varInSpan = currentFocusParent.find('var'),
                inputText = varInSpan.text(),
                j = 0,
                text = null,
                containsText = null,
                textLength = null,
                i = 0,
                keyCode = null,
                currPosition = 0,
                cursorPos = 0,
                childArray = null,
                cursorPosition = null,
                spanPosition = null,
                forCursorValue = 0,
                length = null,
                supChildren = null,
                supCount = 0,
                a = 0,
                k = 0,
                b = 0,
                z = 0,
                varPositionCount = 0,
                varNegationCount = 0,
                spanCount = currentFocusParent.find('span'),
                currentText = currentFocusParent.children('*:not(.cursor)').text(), // plain text excluding cursor &zwj; (zero width joiner)
                EquationEditorModel = MathUtilities.Components.MathEditor.EquationEditor.Models.EquationEditor;

            // keyCode for <: 60,188; for >: 62,190; for =: 61,187
            if ([60, 188, 62, 190, 187, 61].indexOf(event.keyCode) > -1) {
                if (currentText.indexOf('<=') !== -1) {
                    if (event.keyCode !== 187 && event.keyCode !== 61) {
                        this.renderKeyCode(EquationEditorModel.KEYCODE_RIGHT, null, false, true);
                    }
                    //Remove < & = and then add keycode 8804
                    this.renderKeyCode(EquationEditorModel.KEYCODE_BACKSPACE, null, false, true);
                    this.renderKeyCode(EquationEditorModel.KEYCODE_BACKSPACE, null, false, true);
                    this.renderKeyCode('8804', null, false, true);
                } else if (currentText.indexOf('>=') !== -1) {
                    if (event.keyCode !== 187 && event.keyCode !== 61) {
                        this.renderKeyCode(EquationEditorModel.KEYCODE_RIGHT, null, false, true);
                    }
                    //Remove > & = and then add keycode 8805
                    this.renderKeyCode(EquationEditorModel.KEYCODE_BACKSPACE, null, false, true);
                    this.renderKeyCode(EquationEditorModel.KEYCODE_BACKSPACE, null, false, true);
                    this.renderKeyCode('8805', null, false, true);
                }
            }
            // keyCode for enter
            if (event.keyCode === 13 && this.model.get('enterClick') && !this.model.get('enterClickFunction')) {
                this.onEnterClick(this.$el);
            } else {
                if (inputText.indexOf('\\') === -1) {
                    for (j = 0; j < equationLength; j++) {
                        text = equationArray[j];
                        containsText = inputText.indexOf(text);
                        textLength = text.split("").length;
                        i = 0;
                        currPosition = containsText + textLength;
                        cursorPos = $mathSpan.find('.cursor').index();

                        childArray = $mathSpan.find('.cursor').parent().children();
                        length = childArray.length;
                        cursorPosition = null;
                        spanPosition = null;
                        forCursorValue = 0;
                        supCount = 0;

                        if (currPosition === cursorPos - 1 && !$(spanCount[1]).hasClass('cursor') && ($(spanCount[1]).index() > $mathSpan.find('.cursor').parent().find('var').first().index())) {
                            cursorPos--;
                        } else {
                            for (b = 0; b < length; b++) {
                                if ($(childArray[b]).hasClass('cursor')) {
                                    cursorPosition = b;
                                }
                            }

                            for (a = 0; a < length; a++) {
                                if ($(childArray[a]).prop('tagName') === 'SUP' || $(childArray[a]).prop('tagName') === 'SUB') {
                                    supChildren = $(childArray[a]).children();
                                    if (supChildren.length > 0) {

                                        for (k = 0; k < supChildren.length; k++) {
                                            if (!$(supChildren[k]).hasClass('nthroot') && a < cursorPosition) {
                                                supCount++;
                                                break;
                                            }
                                        }
                                    } else if (a < cursorPosition) {
                                        supCount++;
                                    }
                                }
                                if (a < cursorPosition && $(childArray[a]).prop('tagName') === 'VAR' &&
                                    inputText.indexOf($(childArray[a]).text()) !== -1 &&
                                    inputText.indexOf($(childArray[a]).text()) < containsText &&
                                    (inputText.indexOf($(childArray[a]).text()) > a || $mathSpan.find('.cursor').parent().hasClass('mathquill-editable'))) {
                                    forCursorValue++;
                                }

                                if ($(childArray[a]).prop('tagName') === 'SPAN' && !$(childArray[a]).hasClass('cursor') && a < cursorPosition) {
                                    forCursorValue++;
                                }

                                if ($(childArray[a]).prop('tagName') === 'SPAN' && !$(childArray[a]).hasClass('textarea') &&
                                    !$(childArray[a]).hasClass('cursor') && a < cursorPosition) {
                                    spanPosition = a;
                                }
                            }

                            forCursorValue = forCursorValue + supCount;
                            if (cursorPosition > spanPosition) {
                                cursorPos -= forCursorValue;
                            }

                            if (containsText > 0 && currPosition !== cursorPos) {
                                currPosition -= containsText;
                            }
                        }

                        if (containsText !== -1) {
                            $(event.currentTarget).trigger('vmkClickStart');
                            z = containsText;
                            for (; z < varInSpan.length; z++) {
                                if (varInSpan[z + 1]) {
                                    if (currentFocusParent.find(varInSpan[z]).index() + 1 === currentFocusParent.find(varInSpan[z + 1]).index()) {
                                        varPositionCount++;
                                        if (varPositionCount + 1 === text.length) {
                                            break;
                                        }
                                    } else {
                                        if (currentFocusParent.find(varInSpan[z + 1]).index() - currentFocusParent.find(varInSpan[z]).index() === 2 &&
                                            currentFocusParent.find('.cursor').index() === currentFocusParent.find(varInSpan[z + 1]).index() - 1) {
                                            varPositionCount++;
                                        } else {
                                            varNegationCount++;
                                        }
                                    }
                                }
                            }

                            if ((varPositionCount + 1 === text.length || varPositionCount === 0) && varNegationCount === 0) {

                                if (equationJson[text].render) {
                                    if (currPosition > cursorPos) {

                                        for (k = 0; k < currPosition - cursorPos; k++) {
                                            this.renderKeyCode(EquationEditorModel.KEYCODE_RIGHT, null, false, true);
                                        }
                                    } else if (currPosition < cursorPos) {

                                        for (k = 0; k < cursorPos - currPosition; k++) {
                                            this.renderKeyCode(EquationEditorModel.KEYCODE_LEFT, null, false, true);
                                        }
                                    }

                                    for (i = 0; i < textLength; i++) {
                                        this.renderKeyCode(EquationEditorModel.KEYCODE_BACKSPACE, null, false, true);
                                    }
                                    keyCode = equationJson[equationArray[j]].keyCode;
                                    this.renderKeyCode(keyCode, null, false, true);
                                    $(event.currentTarget).trigger('vmkClickEnd');
                                }
                            } else {
                                varPositionCount = 0;
                                varNegationCount = 0;
                                $(event.currentTarget).trigger('vmkClickEnd');
                            }
                        }
                    }
                }

            }
        },

        /**
         * Called on every virtual keyboard key click.
         * @method renderKeyCode
         * @private
         * @param {String} keyCode Key code of current key clicked.
         * @param {String} textIgnore Check for similar key codes.
         * @param {Boolean} enterClicked Check whether 'Enter' is clicked.
         * @param {Boolean} keyUp Check whether its a keyboard event.
         */
        "renderKeyCode": function(keyCode, textIgnore, enterClicked, keyUp) {
            if (keyCode === '') {
                return;
            }
            this.trigger('getData');
            var $focusedTextArea = null,
                EquationEditorModel = null,
                keyDownEvent = null,
                keyStrokes = null,
                cursorIndex = null,
                $inputBox = null,
                keyPressEvent = null,
                keyUpEvent = null,
                curKeyCode = null,
                cnt = 0,
                element = null,
                tagName = null,
                keyStrokesCount = null,
                inputEvent = null;

            $focusedTextArea = $(this.model.get('focusedTextarea'));
            if (enterClicked && this.model.get('enterClick')) {
                if (this.model.get('enterClickFunction')) {
                    keyDownEvent = $.Event('keydown');
                    $inputBox = $focusedTextArea.find('textarea');
                    keyDownEvent.keyCode = Number(keyCode);
                    $inputBox.trigger(keyDownEvent);
                } else {
                    this.onEnterClick(this.$el);
                }
                if (!keyUp) {
                    $inputBox = $focusedTextArea.find('textarea');
                    $inputBox.trigger('vmkClickStart');
                }
            } else {
                if (!enterClicked) {

                    EquationEditorModel = MathUtilities.Components.MathEditor.EquationEditor.Models.EquationEditor;

                    keyStrokes = keyCode.split(',');

                    keyStrokesCount = keyStrokes.length;
                    $inputBox = $focusedTextArea.find('textarea');
                    keyDownEvent = $.Event('keydown');
                    keyPressEvent = $.Event('keypress');
                    keyUpEvent = $.Event('keyup');
                    inputEvent = $.Event('input');
                    curKeyCode = null;
                    cnt = 0;
                    if (!keyUp) {
                        $inputBox.trigger('vmkClickStart');
                    }
                    if (!MathUtilities.Components.Utils.Models.BrowserCheck.isIOS) {
                        $inputBox.focus();
                    }

                    if (keyCode === EquationEditorModel.KEYCODE_RAISETOTWO || keyCode === EquationEditorModel.KEYCODE_CARAT || keyCode === EquationEditorModel.KEYCODE_BASETWO) {

                        if (!MathUtilities.Components.Utils.Models.BrowserCheck.isIOS) {
                            $inputBox.focus();
                        }
                        cursorIndex = $focusedTextArea.find('.cursor').parent().find('.cursor').index();
                        element = $focusedTextArea.find('.cursor').parent().children().eq(cursorIndex - 1);
                        tagName = element.prop('tagName');

                        if ((tagName === 'SPAN' || tagName === void 0) && (element.is('.textarea, .binary-operator') || element.is('.cursor')) && !element.hasClass('non-leaf')) {
                            keyStrokes[1] = EquationEditorModel.KEYCODE_LEFT;
                            if (keyCode === EquationEditorModel.KEYCODE_RAISETOTWO) {
                                keyStrokes[2] = EquationEditorModel.KEYCODE_LEFT;
                                keyStrokes[3] = EquationEditorModel.KEYCODE_LEFT;
                                keyStrokes[4] = EquationEditorModel.KEYCODE_OPEN_BRACKET;
                            } else {
                                keyStrokes[2] = EquationEditorModel.KEYCODE_OPEN_BRACKET;
                            }
                            textIgnore = 'false';
                            keyStrokesCount = keyStrokes.length;
                        }
                    }

                    for (cnt = 0; cnt < keyStrokesCount; cnt++) {
                        curKeyCode = keyStrokes[cnt];

                        if (curKeyCode !== EquationEditorModel.KEYCODE_SPACEBAR &&
                            curKeyCode !== EquationEditorModel.KEYCODE_BACKSPACE &&
                            curKeyCode !== EquationEditorModel.KEYCODE_LEFT &&
                            curKeyCode !== EquationEditorModel.KEYCODE_UP &&
                            curKeyCode !== EquationEditorModel.KEYCODE_RIGHT &&
                            curKeyCode !== EquationEditorModel.KEYCODE_DOWN) {
                            $inputBox.val(String.fromCharCode(curKeyCode));
                        }
                        if (curKeyCode === EquationEditorModel.KEYCODE_SPACEBAR && keyStrokesCount === 1) {
                            $inputBox.val(String.fromCharCode(curKeyCode));
                        }

                        if (keyUp && curKeyCode === EquationEditorModel.KEYCODE_DOWN) {
                            textIgnore = 'true';
                        }

                        if (textIgnore !== 'true' && curKeyCode === EquationEditorModel.KEYCODE_OPEN_BRACKET) {
                            $inputBox.val(String.fromCharCode(curKeyCode).toLowerCase());
                        }

                        if (curKeyCode !== EquationEditorModel.KEYCODE_DOT) {
                            keyDownEvent.keyCode = Number(curKeyCode);
                            keyDownEvent.charCode = Number(curKeyCode);
                            keyDownEvent.which = Number(curKeyCode);
                            keyDownEvent.bubbles = true;
                            keyDownEvent.cancelable = true;


                            keyPressEvent.keyCode = Number(curKeyCode);
                            keyPressEvent.charCode = Number(curKeyCode);
                            keyPressEvent.which = Number(curKeyCode);
                            keyPressEvent.bubbles = true;
                            keyPressEvent.cancelable = true;

                            inputEvent.keyCode = Number(curKeyCode);
                            inputEvent.charCode = Number(curKeyCode);
                            inputEvent.which = Number(curKeyCode);
                            inputEvent.bubbles = true;
                            inputEvent.cancelable = true;

                            keyUpEvent.keyCode = Number(curKeyCode);
                            keyUpEvent.charCode = Number(curKeyCode);
                            keyUpEvent.which = Number(curKeyCode);
                            keyUpEvent.bubbles = true;
                            keyUpEvent.cancelable = true;
                        }

                        if (curKeyCode === EquationEditorModel.KEYCODE_OPEN_BRACKET && textIgnore === 'false') {
                            keyDownEvent.openBracket = true;
                            keyPressEvent.openBracket = true;
                        } else if (curKeyCode === EquationEditorModel.KEYCODE_DOWN && textIgnore === 'true') {
                            keyDownEvent.openBracket = false;
                            keyPressEvent.openBracket = false;
                        }

                        if (curKeyCode === EquationEditorModel.KEYCODE_UP) {
                            keyDownEvent.upArrow = true;
                            keyPressEvent.upArrow = true;
                        }

                        if (keyUp === void 0 && curKeyCode === EquationEditorModel.KEYCODE_RIGHT && keyStrokesCount !== 1) {
                            keyDownEvent.rightArrow = true;
                            keyPressEvent.rightArrow = true;
                        }

                        if (keyStrokes.length === 1) {
                            if (curKeyCode === EquationEditorModel.KEYCODE_DOWN) {
                                keyDownEvent.onlyDownArrow = true;
                                keyPressEvent.onlyDownArrow = true;
                            } else if (curKeyCode === EquationEditorModel.KEYCODE_UP) {
                                keyDownEvent.onlyUpArrow = true;
                                keyPressEvent.onlyUpArrow = true;
                            }
                        }

                        if (keyUp) {
                            keyUpEvent.equation = true;
                        }
                        $inputBox.trigger(keyDownEvent).trigger(keyPressEvent).trigger(inputEvent).trigger(keyUpEvent);
                    }
                    if (!MathUtilities.Components.Utils.Models.BrowserCheck.isIOS) {
                        $inputBox.focus();
                    }
                }
            }
            if (!keyUp) {
                $inputBox.trigger('vmkClickEnd');
            }
        },

        /**
         * Called on every close button click.
         * @method closeEditor
         * @private
         * @param {object} event current event object.
         */
        "closeEditor": function(event) {

            var currDiv = event.target.parentElement,
                $currDiv = $(currDiv);

            if (currDiv.nextElementSibling === null && currDiv.previousElementSibling === null) {
                $currDiv.hide();
                _.delay(function() {
                    $currDiv.show();
                }, 50);

            } else {

                $currDiv.remove();
            }
        }
    });
}(window.MathUtilities));
