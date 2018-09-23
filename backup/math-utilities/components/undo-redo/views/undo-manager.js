(function () {
    'use strict';

    /**
    * Manages undo and redo for different modules.
    *
    * @class UndoManager
    * @constructor
    * @extends Backbone.View
    * @namespace MathUtilities.Components.Undo.Views
    */
    MathUtilities.Components.Undo.Views.UndoManager = Backbone.View.extend({
        OSName: null,
        MAC_OS_VALID_KEYS_CODE: {
            SHIFT: null,
            Z_KEY: null,
            LEFT_WINDOW_FOR_CHROME: null,
            RIGHT_WINDOW_FOR_CHROME: null,
            LEFT_RIGHT_WINDOW_FOR_MOZILLA: null
        },
        invalidKeysPressed: null,

        macOsKeys: null,

        pressedKeys: null,

        /**
        * Automatically called by backbone.js when UndoManager object is instantiated.
        * 
        * @method initialize
        */
        initialize: function () {
            var $container = this.$el;
            //tabindex is set to -1, so that if accessibility is on screen reader should not read its content.
            $container.attr('tabindex', -1).off('keydown', $.proxy(this.onKeyDownEvent, this)).on('keydown', $.proxy(this.onKeyDownEvent, this)).off('keyup', $.proxy(this.onKeyUpEvent, this)).on('keyup', $.proxy(this.onKeyUpEvent, this));

            this.pressedKeys = {};
            this.invalidKeysPressed = [];
            this.macOsKeys = {};

            $container.off('blur', $.proxy(this._emptyPressedKeys, this)).on('blur', $.proxy(this._emptyPressedKeys, this));

            this.OSName = "Unknown OS";
            if (navigator.appVersion.indexOf("Win") !== -1) {
                this.OSName = "Windows";
            }
            else if (navigator.appVersion.indexOf("Mac") !== -1) {
                this.OSName = "MacOS";
            }
            else if (navigator.appVersion.indexOf("X11") !== -1) {
                this.OSName = "UNIX";
            }
            else if (navigator.appVersion.indexOf("Linux") !== -1) {
                this.OSName = "Linux";
            }

            this._setConstant();
        },

        _emptyPressedKeys: function (e) {
            var keys = Object.keys(this.pressedKeys);
            delete this.pressedKeys;
            this.pressedKeys = {};
        },

        /**
        * Detects a Ctrl+z Or a Ctrl+y keyDown event and triggers the view object.
        *
        * @method onKeyDownEvent
        */
        onKeyDownEvent: function (event) {
            var numberOfKeysDown = null,
                keyCode = event.keyCode,
                isInvalidKeyPressed = false,
                invalidKeysCounter, validCodeObject,
                invalidKeysLength = this.invalidKeysPressed.length,
                isUndoOperation, isRedoOperation;
            if (keyCode === 17) {
                this.pressedKeys = {};
            }
            this.pressedKeys[keyCode] = true;
            numberOfKeysDown = Object.keys(this.pressedKeys).length;

            for (invalidKeysCounter = 0; invalidKeysCounter < invalidKeysLength; invalidKeysCounter++) {
                if (this.invalidKeysPressed[invalidKeysCounter] === true) {
                    isInvalidKeyPressed = true;
                    break;
                }
            }

            if (this.OSName === "MacOS") {

                validCodeObject = this.macOsKeys;
                if (keyCode in validCodeObject) {
                    validCodeObject[keyCode] = true;

                    if (!isInvalidKeyPressed) {
                        isRedoOperation = (validCodeObject[this.MAC_OS_VALID_KEYS_CODE.LEFT_WINDOW_FOR_CHROME] || validCodeObject[this.MAC_OS_VALID_KEYS_CODE.RIGHT_WINDOW_FOR_CHROME] || validCodeObject[this.MAC_OS_VALID_KEYS_CODE.LEFT_RIGHT_WINDOW_FOR_MOZILLA]) && validCodeObject[this.MAC_OS_VALID_KEYS_CODE.SHIFT] && validCodeObject[this.MAC_OS_VALID_KEYS_CODE.Z_KEY];
                        isUndoOperation = (validCodeObject[this.MAC_OS_VALID_KEYS_CODE.LEFT_WINDOW_FOR_CHROME] || validCodeObject[this.MAC_OS_VALID_KEYS_CODE.RIGHT_WINDOW_FOR_CHROME] || validCodeObject[this.MAC_OS_VALID_KEYS_CODE.LEFT_RIGHT_WINDOW_FOR_MOZILLA]) && validCodeObject[this.MAC_OS_VALID_KEYS_CODE.Z_KEY];

                        if (isRedoOperation) {
                            if (numberOfKeysDown > 3) {
                                return;
                            }
                            //this.$el.find(document.activeElement).blur();
                            event.preventDefault();
                            this.trigger('redo:actionPerformed');
                        }
                        else if (isUndoOperation) {
                            if (numberOfKeysDown > 2) {
                                return;
                            }
                            //this.$el.find(document.activeElement).blur();
                            event.preventDefault();
                            this.trigger('undo:actionPerformed');
                        }

                        validCodeObject[this.MAC_OS_VALID_KEYS_CODE.Z_KEY] = false;
                    }
                }
                else {
                    //                    this.invalidKeysPressed[keyCode] = true;
                    validCodeObject[this.MAC_OS_VALID_KEYS_CODE.LEFT_WINDOW_FOR_CHROME] = false;
                    validCodeObject[this.MAC_OS_VALID_KEYS_CODE.RIGHT_WINDOW_FOR_CHROME] = false;
                    validCodeObject[this.MAC_OS_VALID_KEYS_CODE.LEFT_RIGHT_WINDOW_FOR_MOZILLA] = false;
                    validCodeObject[this.MAC_OS_VALID_KEYS_CODE.SHIFT] = false;
                    validCodeObject[this.MAC_OS_VALID_KEYS_CODE.Z_KEY] = false;
                }
            }
            else {
                if (numberOfKeysDown > 2) {
                    return;
                }
                if (event.ctrlKey === true && keyCode === 90) {
                    //this.$el.find(document.activeElement).blur();
                    event.preventDefault();
                    this.trigger('undo:actionPerformed');
                }
                else if (event.ctrlKey === true && keyCode === 89) {
                    //this.$el.find(document.activeElement).blur();
                    event.preventDefault();
                    this.trigger('redo:actionPerformed');
                }
            }
        },

        onKeyUpEvent: function (event) {
            var validKeys,
                keyCode = event.keyCode;

            delete this.pressedKeys[keyCode];

            if (this.OSName === "MacOS") {
                validKeys = this.macOsKeys;
                if (keyCode in validKeys) {
                    if (keyCode === this.MAC_OS_VALID_KEYS_CODE.LEFT_WINDOW_FOR_CHROME || keyCode === this.MAC_OS_VALID_KEYS_CODE.RIGHT_WINDOW_FOR_CHROME || keyCode === this.MAC_OS_VALID_KEYS_CODE.LEFT_RIGHT_WINDOW_FOR_MOZILLA) {
                        validKeys[this.MAC_OS_VALID_KEYS_CODE.LEFT_WINDOW_FOR_CHROME] = false;
                        validKeys[this.MAC_OS_VALID_KEYS_CODE.RIGHT_WINDOW_FOR_CHROME] = false;
                        validKeys[this.MAC_OS_VALID_KEYS_CODE.LEFT_RIGHT_WINDOW_FOR_MOZILLA] = false;
                    }
                    else if (keyCode === this.MAC_OS_VALID_KEYS_CODE.SHIFT) {
                        validKeys[this.MAC_OS_VALID_KEYS_CODE.SHIFT] = false;
                    }
                }
                else {
                    this.invalidKeysPressed[keyCode] = false;
                }
                validKeys[this.MAC_OS_VALID_KEYS_CODE.Z_KEY] = false;
            }
        },

        _setConstant: function () {
            if (this.OSName === "MacOS") {
                //set key code value for MAC_OS_VALID_KEYS_CODE
                this.MAC_OS_VALID_KEYS_CODE.SHIFT = 16;
                this.MAC_OS_VALID_KEYS_CODE.Z_KEY = 90;
                this.MAC_OS_VALID_KEYS_CODE.LEFT_WINDOW_FOR_CHROME = 91;
                this.MAC_OS_VALID_KEYS_CODE.RIGHT_WINDOW_FOR_CHROME = 93;
                this.MAC_OS_VALID_KEYS_CODE.LEFT_RIGHT_WINDOW_FOR_MOZILLA = 224;

                //set false values for macOsKeys
                this.macOsKeys[this.MAC_OS_VALID_KEYS_CODE.SHIFT] = false;
                this.macOsKeys[this.MAC_OS_VALID_KEYS_CODE.Z_KEY] = false;
                this.macOsKeys[this.MAC_OS_VALID_KEYS_CODE.LEFT_WINDOW_FOR_CHROME] = false;
                this.macOsKeys[this.MAC_OS_VALID_KEYS_CODE.RIGHT_WINDOW_FOR_CHROME] = false;
                this.macOsKeys[this.MAC_OS_VALID_KEYS_CODE.LEFT_RIGHT_WINDOW_FOR_MOZILLA] = false;
            }
        }
    });

})();