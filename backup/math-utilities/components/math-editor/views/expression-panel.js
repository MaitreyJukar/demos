/* global window, $, MathUtilities, _ */

(function(KeyboardViews) {
    'use strict';

    /**
     *  View of Expression panel
     * @class EquationEditorView
     * @constructor
     * @namespace MathUtilities.Components.MathEditor.Keyboard.Views
     * @module MathEditor
     * @submodule ExpressionPanel
     * @extends Backbone.View
     */

    var BrowserCheck = MathUtilities.Components.Utils.Models.BrowserCheck;

    KeyboardViews.ExpressionPanel = Backbone.View.extend({
        /**
         * Prevents the keyboard from closing on lost focus of expression panel.
         *
         * @property preventKeyboardClose
         * @type Boolean
         * @default false
         */
        "preventKeyboardClose": false,
        "events": {
            "click .keyboard-expression-panel-add": "_addExpression",
            "click .keyboard-expression-panel-cancel": "_cancelExpression"
        },

        /**
         * Add listeners to change of model attributes.
         * Call render of the view.
         * Add listener to the resize of window.
         * @param options {Object} options for view
         * @method initialize
         * @param {Object} options Initialization options for ExpressionPanelView
         */
        "initialize": function(options) {
            var BrowserCheck = MathUtilities.Components.Utils.Models.BrowserCheck;
            this.isAccessibilityAllow = options.isAccessibilityAllow && !BrowserCheck.isMobile;
            this.listenTo(this.model, 'change:showPanel', this.showHidePanel)
                .listenTo(this.model, 'change:showSymbolPanel', this.showHideSymbolPanel)
                .listenTo(this.model, 'change:useSymbols', this.enbleDisableSymbol)
                .listenTo(this.model, 'change:passedLatex', this.updateEditorMathquill)
                .listenTo(this.model, 'elmHodlerChange', this.updateEditorMathquill);
            this.render();
            $(window).resize(_.bind(this.setMaxWidthHeightOfExpressionContainer, this));
            this.lostfocusoftextarea = false;
            this.isChromeOnTouchAndType = BrowserCheck.isChrome && "ontouchstart" in window && !BrowserCheck.isMobile;
        },

        /**
         * Render the template of the expression panel. Add listener for hover, mouse down etc on the buttons in the symbol panel
         * Create symbol panel model and view and attach listener on the click of the symbols.
         * @method render
         */
        "render": function() {
            var $expressionPanelButtons,
                symbolPanelModel;

            this.$el.html(MathUtilities.Components.MathEditor.templates.expressionPanel().trim());

            $expressionPanelButtons = this.$('.expression-button-container div');
            if (!BrowserCheck.isMobile) {
                $expressionPanelButtons.hover(function() {
                    $(this).addClass(KeyboardViews.ExpressionPanel.Constants.BUTTON_CLASS + '-Hover');
                }, function() {
                    $(this).removeClass(KeyboardViews.ExpressionPanel.Constants.BUTTON_CLASS + '-Hover');
                });
            }

            $expressionPanelButtons.on('mousedown touchstart', _.bind(this.addHoverEffect, this))
                .on('touchend', _.bind(this.removeHoverEffect, this));

            symbolPanelModel = new MathUtilities.Components.MathEditor.Keyboard.Models.BasePanel();
            symbolPanelModel.parseData(this.model.get('symbolJson'));
            this._symbolPanel = new MathUtilities.Components.MathEditor.Keyboard.Views.BasePanel({
                "model": symbolPanelModel,
                "el": this.$('.keyboard-symbol-panel')
            });

            this._symbolPanel.on('click', _.bind(this.onClick, this));
            this.$('.keyboard-mathquill-container').data('showExpressionPanel', true);

            this.$('#keyboard-symbol-show').on('click', _.bind(this._symbolClick, this));
        },

        /**
         * Call after the matheditor view is created in the specified holder of expression panel.
         * Attach listener to the textarea and mathquillify the textarea based on the current latex stored in the model.
         * @method onEquationEditorCreate
         */
        "onEquationEditorCreate": function() {
            var $mathquillEditable = this.$('.mathquill-editable'),
                $mathquillTextarea = $mathquillEditable.find('textarea');
            $mathquillTextarea.on('blur', _.bind(this.onLostFocus, this))
                .on('keydown', _.bind(this.textareaKeyDown, this));
            $mathquillEditable.data('showExpressionPanel', true);
            $mathquillEditable.mathquill('latex', this.model.get('currLatex'));
            if (BrowserCheck.isIOS) {
                $(document.activeElement).blur();
            } else if (!this.isAccessibilityAllow) {
                $mathquillTextarea.focus();
            }

            this.setMaxWidthHeightOfExpressionContainer();
        },

        /**
         * Listener for keyUp of textarea. Handle enter key and escape key press of the textarea
         * @method textareaKeyUp
         */
        "textareaKeyDown": function(evt) {
            var ESCAPE_KEYCODE = 27,
                ENTER_KEYCODE = 13,
                TAB_KEYCODE = 9;
            switch (evt.keyCode) {
                case ENTER_KEYCODE:
                    this._addExpression();
                    evt.preventDefault();
                    evt.stopPropagation();
                    break;
                case ESCAPE_KEYCODE:
                    this._cancelExpression();
                    break;
                case TAB_KEYCODE:
                    this.$('textarea').blur();
                    if (this.isAccessibilityAllow) {
                        this.trigger('tabPressInMathquill', evt.shiftKey);
                    }
                    break;
            }
        },

        /**
         * Listener for blur of textarea. Trigger hide keyboard call if focus shifts outside keyboard.
         * @method onLostFocus
         */
        "onLostFocus": function(evt) {

            var timeInterVal = 25;
            if (this._timer) {
                clearInterval(this._timer);
            }
            if (evt !== void 0) {
                timeInterVal = 10;
            }
            this._timer = setInterval(_.bind(function() {
                clearInterval(this._timer);
                if (!BrowserCheck.isIOS) {
                    if (this.isAccessibilityAllow &&
                        ($('.keyboardContainer').hasClass('keyboardKeyActive') ||
                            $('.keyboardContainer').find('.key-Active').length !== 0) ||
                        ($(document.activeElement).parent().hasClass('textarea') &&
                            this.$('.mathquill-editable.hasCursor').length > 0 ||
                            this.$('.mathquill-editable .hasCursor').length > 0)) {
                        return;

                    }
                }
                if ($('.keyboardContainer').hasClass('keyboardContainerHover')) {
                    if (!(BrowserCheck.isIOS || this.lostfocusoftextarea)) {
                        if (evt === void 0) {
                            this.setFocusToTextarea();
                        } else {
                            $(evt.currentTarget).focus();
                        }
                    }
                } else {
                    if (this.preventKeyboardClose) {
                        this.preventKeyboardClose = false;
                    } else {
                        this.triggerHidekeyboard();
                    }
                }
                this.lostfocusoftextarea = false;
            }, this), timeInterVal);
        },

        "forceExpressionPanelEditorBlur": function() {
            if (this._timer) {
                clearInterval(this._timer);
            }
            this.callComplete();
        },

        /**
         * Call complete callback set in the model on blur of keyboard
         * @method callComplete
         */
        "callComplete": function() {
            var completeCallback = this.model.get('completeCallback');
            if (completeCallback !== null) {
                completeCallback();
                this.model.set('completeCallback', null);
            }
        },

        /**
         * Calculate and set max width and height of the mathquill container.
         * @method setMaxWidthHeightOfExpressionContainer
         */
        "setMaxWidthHeightOfExpressionContainer": function() {
            var Constants = KeyboardViews.ExpressionPanel.Constants,
                keyBoardWidth = $(window).width(),
                range = MathUtilities.Components.MathEditor.Keyboard.Views.Keyboard.Constants.range,
                mathquillContainerMaxWidth = 0,
                mathquillContainerMaxHeight = ($(window).height() - (Constants.KEY_CONTAINER_HEIGHT + Constants.KEYBOARD_TITLE_HOLDER_HEIGHT +
                    Constants.PADDING_TOP)) * Constants.MAX_PERCENT_HEIGHT_MATHQUILL_CONTAINER;

            if (mathquillContainerMaxHeight < Constants.MINIMUM_MAX_HEIGHT_MATHQUILL_CONTAINER) {
                mathquillContainerMaxHeight = Constants.MINIMUM_MAX_HEIGHT_MATHQUILL_CONTAINER;
            }

            if (keyBoardWidth < Constants.KEYBOARD_MIN_WIDTH) {
                keyBoardWidth = Constants.KEYBOARD_MIN_WIDTH;
            } else if (keyBoardWidth > Constants.KEYBOARD_MAX_WIDTH) {
                keyBoardWidth = Constants.KEYBOARD_MAX_WIDTH;
            }
            if (keyBoardWidth < range[3]) {
                mathquillContainerMaxWidth = keyBoardWidth - (Constants.SYMBOL_BUTTON_WIDTH + Constants.EXTRA_SPACING);
            } else {
                mathquillContainerMaxWidth = keyBoardWidth - (Constants.EXPRESION_LABEL_WIDTH +
                    Constants.BUTTON_CONTAINER_WIDTH + Constants.SYMBOL_BUTTON_WIDTH + Constants.EXTRA_SPACING);
            }
            this.$('.keyboard-mathquill-container').css('max-height', mathquillContainerMaxHeight + 'px')
                .width(mathquillContainerMaxWidth);

            this.$('.mathquill-editable').css('min-width', mathquillContainerMaxWidth + 'px');

        },

        /**
         * Add press state of symbol button
         * @method addSymbolButtonPressedState
         * @param event{jqueryEventObject}
         */
        "addSymbolButtonPressedState": function(event) {
            $(event.currentTarget).addClass('keyboard-symbol-show-selected');
        },

        /**
         * Remove press state of symbol button
         * @method removeSymbolButtonPressState
         * @param event{jqueryEventObject}
         */
        "removeSymbolButtonPressState": function(event) {
            if (!this.model.get('showSymbolPanel')) {
                $(event.currentTarget).removeClass('keyboard-symbol-show-selected');
            }
        },

        /**
         * Add hover effect to the expression panel button.
         * @method addHoverEffect
         * @param event{jqueryEventObject}
         */
        "addHoverEffect": function(event) {
            $(event.currentTarget).addClass(KeyboardViews.ExpressionPanel.Constants.BUTTON_CLASS + '-Hover');
        },

        /**
         * Remove hover effect to the expression panel button.
         * @method removeHoverEffect
         * @param event{jqueryEventObject}
         */
        "removeHoverEffect": function(event) {
            $(event.currentTarget).removeClass(KeyboardViews.ExpressionPanel.Constants.BUTTON_CLASS + '-Hover');
        },

        /**
         * Show/Hide expression panel based on the 'showPanel' attribute of model
         * @method showHidePanel
         */
        "showHidePanel": function() {
            if (this.model.get('showPanel')) {
                this.$el.show();
            } else {
                this.$el.hide();
                this.model.set('showSymbolPanel', false);
            }
        },

        /**
         * Trigger event to hide keyboard and call the complete callback
         * @method triggerHidekeyboard
         */
        "triggerHidekeyboard": function() {
            this.callComplete();
            this.trigger('hideKeyboard');
        },

        "triggerShowKeyboard": function() {
            this.trigger('showKeyboard');
        },
        /**
         * Call when add button of expression panel is clicked.
         * Call the addCallback stored in model and trigger's hide keyboard.
         * @method _addExpression
         */
        "_addExpression": function() {
            var addCallback = this.model.get('addCallback');
            this.lostfocusoftextarea = true;
            if (addCallback !== null) {
                addCallback(this.model.get('currLatex'));
            }
            this.triggerHidekeyboard();
        },

        /**
         * Call when cancel button of expression panel is clicked.
         * Call the cancelCallback stored in model and trigger's hide keyboard.
         * @method _cancelExpression
         */
        "_cancelExpression": function() {
            var cancelCallback = this.model.get('cancelCallback');
            this.lostfocusoftextarea = true;
            if (cancelCallback !== null) {
                cancelCallback();
            }
            this.triggerHidekeyboard();
        },

        /**
         * Call when show symbol panel button clicked.
         * Trigger hide or show of symbol panel
         * @method _symbolClick
         */
        "_symbolClick": function() {
            this.model.set('showSymbolPanel', !this.model.get('showSymbolPanel'));
            if (!(this.isAccessibilityAllow || BrowserCheck.isIOS)) {
                this.setFocusToTextarea();
            }
        },

        /**
         * Based on the state of showSymbolPanel in model hide or show symbol.
         * @method showHideSymbolPanel
         */
        "showHideSymbolPanel": function() {
            if (this.model.get('showSymbolPanel') && this.model.get('useSymbols')) {
                this.$('.keyboard-symbol-show').addClass('keyboard-symbol-show-selected');
                this.$('.keyboard-symbol-panel').show();
            } else {
                this.$('.keyboard-symbol-show').removeClass('keyboard-symbol-show-selected');
                this.$('.keyboard-symbol-panel').hide();
            }
        },

        /**
         * Enable or disable symbol panel based on the state of useSymbol in the model.
         * Attach or remove listeners of the symbol panel button.
         * @method enbleDisableSymbol
         */
        "enbleDisableSymbol": function() {
            var useSymbols = this.model.get('useSymbols');
            if (useSymbols) {
                this.$('.keyboard-symbol-show').on('mousedown touchstart', _.bind(this.addSymbolButtonPressedState, this))
                    .on('mouseup touchend mouseout', _.bind(this.removeSymbolButtonPressState, this))
                    .hover(function() {
                        $(this).addClass(KeyboardViews.ExpressionPanel.Constants.BUTTON_CLASS + '-Hover');
                    }, function() {
                        $(this).removeClass(KeyboardViews.ExpressionPanel.Constants.BUTTON_CLASS + '-Hover');
                    })
                    .prop('disabled', false);
            } else {
                this.$('.keyboard-symbol-show').off('mousedown mouseup touchstart touchend mouseout hover')
                    .prop('disabled', true);
                this.model.set('showSymbolPanel', false);
            }

            this.trigger('enableDisableSymbol', useSymbols);
        },

        /**
         * Update mathquill of expression panel based on the latex stored in the model.
         * Attach or remove listeners of the symbol panel button.
         * @method updateEditorMathquill
         */
        "updateEditorMathquill": function() {
            if (this._timer) {
                this.callComplete();
                clearInterval(this._timer);
            }
            this.$('.mathquill-editable').mathquill('latex', this.model.get('passedLatex'));
        },

        /**
         * Set focus to textarea of the expression panel.
         * @method setFocusToTextarea
         */
        "setFocusToTextarea": function() {
            var $textarea = this.$('textarea');
            if (BrowserCheck.isMobile || BrowserCheck.isChromeOSTouchAndType) {
                $textarea.prop('readonly', true);
            }
            if (this.isChromeOnTouchAndType) {
                _.delay(function() {
                    $textarea.blur().focus();
                }, 10);
            } else {
                $textarea.focus();
            }
        },

        /**
         * Triggers parent view function on keyboard-key click.
         * @method onClick
         * @private
         */
        "onClick": function() {
            this.trigger('click', arguments[0], arguments[1], arguments[2], arguments[3]);
        }
    }, {
        // Expression panel constants
        "Constants": {
            "BUTTON_CLASS": "smallButton",
            "SYMBOL_PANEL_WIDTH": 210,
            "EXPRESION_LABEL_WIDTH": 95,
            "BUTTON_CONTAINER_WIDTH": 175,
            "SYMBOL_BUTTON_WIDTH": 40,
            "EXTRA_SPACING": 40,
            "KEYBOARD_MAX_WIDTH": 982,
            "KEYBOARD_MIN_WIDTH": 320,
            "KEY_CONTAINER_HEIGHT": 202,
            "KEYBOARD_TITLE_HOLDER_HEIGHT": 40,
            "PADDING_TOP": 20,
            "MAX_PERCENT_HEIGHT_MATHQUILL_CONTAINER": 0.7,
            "MINIMUM_MAX_HEIGHT_MATHQUILL_CONTAINER": 100
        }
    });
}(window.MathUtilities.Components.MathEditor.Keyboard.Views));