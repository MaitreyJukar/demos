/* global _, $, window  */

(function(MathUtilities) {
    'use strict';

    /**
     * A customized Backbone.View that represents Keyboard and Equation Editor
     * @class MathEditorView
     * @constructor
     * @namespace Components.MathEditor.Keyboard.Views
     * @module MathEditor
     * @extends Backbone.View
     */
    MathUtilities.Components.MathEditor.Views.MathEditor = Backbone.View.extend({

        /**
         * @property _keyboard
         * @type Object
         * @default null
         */
        "_keyboard": null,

        /**
         * @property _equationEditor
         * @type Object
         * @default null
         */
        "_equationEditor": null,

        /**
         * Instantiates KeyboardModel and EquationEditorModel models and binds events for the keys.
         * @method initialize
         */
        "initialize": function() {

            var jsonData = this.model.get('jsonData'),
                jsonEquationData = this.model.get('equationJsonData'),
                editorCall = this.model.get('editorCall'),
                enterClick = this.model.get('enterClick'),
                idCounter = this.model.get('idCounter'),
                keyboardObject = this.model.get('keyboardObject'),
                closeButton = this.model.get('closeButton'),
                keyboardHolder = this.model.get('keyboardHolder'),
                keyboardModel = null,
                equationEditorModel = null,
                enterClickFunction = this.model.get('enterClickFunction'),
                defaultFocus = this.model.get('defaultFocus'),
                isAccessibilityAllow = this.model.get('isAccessibilityAllow'),
                basePath = this.model.get('basePath'),
                expressionData = this.model.get('expressionData'),
                keyboardVisible = this.model.get('keyboardVisible'),
                donotBindTab = this.model.get('donotBindTab'),
                EquationEditor = MathUtilities.Components.MathEditor.EquationEditor;

            if (this.model.get('keyboardCall')) {
                if (keyboardObject) {
                    this._keyboard = keyboardObject;

                } else {
                    keyboardModel = new MathUtilities.Components.MathEditor.Keyboard.Models.Keyboard();
                    keyboardModel.parseData(jsonData, jsonEquationData, enterClick, keyboardHolder,
                        isAccessibilityAllow, basePath, keyboardVisible);
                    this._keyboard = new MathUtilities.Components.MathEditor.Keyboard.Views.Keyboard({
                        "model": keyboardModel,
                        "el": '#keyboard'
                    });

                    this._keyboard.on('click', _.bind(this.onClick, this))
                        .on('keyClick', _.bind(this.onKeyClick, this));
                }
                if (expressionData && !EquationEditor.ExpressionPanelEditorInstance) {
                    this.listenToOnce(this._keyboard, 'expressionPanelUsed', this.expressionPanelVisible);
                }
                this.model.set('keyboardView', this._keyboard);
                this._keyboard.setExpressionData(expressionData);
                if (keyboardVisible === false) {
                    $('.math-utilities-math-editor-keyboard').css('visibility', 'hidden');
                }
            }

            if (editorCall && !(expressionData && EquationEditor.ExpressionPanelEditorInstance)) {
                if (keyboardObject) {
                    this._keyboard = keyboardObject;
                }

                equationEditorModel = new EquationEditor.Models.EquationEditor();
                equationEditorModel.parseData({
                    "equationJsonData": jsonEquationData,
                    "enterClick": enterClick,
                    "idCounter": idCounter,
                    "closeButton": closeButton,
                    "enterClickFunction": enterClickFunction,
                    "defaultFocus": defaultFocus
                });

                this._equationEditor = new EquationEditor.Views.EquationEditor({
                    "model": equationEditorModel,
                    "el": this.$el,
                    "isAccessibilityAllow": isAccessibilityAllow,
                    "donotBindTab": donotBindTab
                });

                MathUtilities.Components.MathEditor.Models.MathEditor.EDITOR = this.$el;
                this._equationEditor.on('focus', _.bind(this.onFocus, this))
                    .on('getData', _.bind(this.getFocusArea, this));
                if (expressionData !== null) {
                    if (typeof expressionData.latex === 'string') {
                        this._keyboard.onEquationEditorCreate();
                        this.listenTo(this._equationEditor, 'renderKeyCode', this.updateLatex);
                    }
                    EquationEditor.ExpressionPanelEditorInstance = this._equationEditor;
                }
                this.listenTo(this._equationEditor, 'tabKeyPress', this.tabKeyPressOnEditor);
            }

            this.render();
        },

        "updateLatex": function(keyCode) {
            this._keyboard.updateLatex(keyCode);
        },

        /**
         * Calls keyboard's tabKeyPressOnEditor method.
         * @method tabKeyPressOnEditor
         * @param shiftKey {Boolean} True, if shift key was pressed. False, otherwise.
         */
        "tabKeyPressOnEditor": function(shiftKey) {
            this._keyboard.tabKeyPressOnEditor(shiftKey);
        },

        "expressionPanelVisible": function() {
            this.$el = $('.keyboard-mathquill-container');
            this.el = this.$el[0];
        },

        "render": function() {
            return this;
        },

        /**
         * Triggers equation editor click event.
         * @param {String} keyCode Key code of current key clicked.
         * @param {String} ignoreText Check for similar keycodes.
         * @param {Boolean} enterClicked Check whether 'Enter' is clicked.
         * @method onClick
         */

        "onClick": function(keyCode, ignoreText, enterClicked) {
            this._equationEditor.renderKeyCode(keyCode, ignoreText, enterClicked);
        },

        /**
         * set focus text area on focus of equation-editor.
         * @param {DOM} focusTextarea Focused math editor element
         * @method onFocus
         */
        "onFocus": function(focusTextarea) {
            var keyboard = this._keyboard,
                showExpressionPanel;

            if (keyboard) {
                keyboard.model.set({
                    "focusedTextarea": focusTextarea,
                    "showKeyboard": true
                });
                showExpressionPanel = $(focusTextarea).data('showExpressionPanel');
                if (showExpressionPanel) {
                    keyboard.showExpressionPanel();
                } else {
                    keyboard.forceExpressionPanelEditorBlur();
                    keyboard.hideExpressionPanel();
                }
            } else {
                this._equationEditor.model.set('focusedTextarea', focusTextarea);
            }
            focusTextarea.trigger('textareafocus', focusTextarea);
        },

        /**
         * get focus text area.
         * @method getFocusedArea
         */
        "getFocusArea": function() {
            if (this._keyboard) {
                this._equationEditor.model.set('focusedTextarea', this._keyboard.model.get('focusedTextarea'));
            }
        },

        /**
         * set focus on the equation editor on click on function panel button click.
         * @method onKeyClick
         */
        "onKeyClick": function() {
            if (!MathUtilities.Components.Utils.Models.BrowserCheck.isIOS) {
                this._keyboard.model.get('focusedTextarea').find("textarea").focus();
            }
        }
    }, {
        "createDisabledMathquill": function($mathquill, latex) {
            $mathquill.mathquill('revert') // reverts mathquillified element
                .mathquill() // creates a mathquilified span
                .mathquill('latex', latex); // sets latex in mathquill
        }
    });
}(window.MathUtilities));
