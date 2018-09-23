/* globals window */

(function(MathUtilities) {
    'use strict';
    /**
     * A customized Backbone.Model that represents Equation Editor and Keyboard.
     * @class TextEditorModel
     * @constructor
     * @namespace Components.MathEditor.Keyboard.Models
     * @module MathEditor
     * @extends Backbone.Model
     */
    MathUtilities.Components.MathEditor.Models.MathEditor = Backbone.Model.extend({

        /**
         * @property defaults
         * @type Object
         */
        "defaults": {

            /**
             * @property jsonData
             * @type Object
             * @default null
             */
            "jsonData": null,

            /**
             * @property focusedTextarea
             * @type Object
             * @default null
             */
            "focusedTextarea": null,

            /**
             * @property currText
             * @type String
             * @default ''
             */
            "currText": '',

            /**
             * @property prevText
             * @type String
             * @default ''
             */
            "prevText": '',

            /**
             * @property equationJsonData
             * @type Object
             * @default null
             */
            "equationJsonData": null,

            /**
             * @property enterClick
             * @type Boolean
             * @default false
             */
            "enterClick": false,

            /**
             * @property idCounter
             * @type Integer
             * @default null
             */
            "idCounter": null,
            /**
             * @property editorCall
             * @type Boolean
             * @default false
             */
            "editorCall": false,

            /**
             * @property keyboardCall
             * @type Boolean
             * @default false
             */
            "keyboardCall": false,

            /**
             * @property keyboardObject
             * @type Object
             * @default null
             */
            "keyboardObject": null,

            /**
             * @property keyboardView
             * @type Object
             * @default null
             */
            "keyboardView": null,

            /**
             * @property closeButton
             * @type Boolean
             * @default false
             */
            "closeButton": false,

            /**
             * @property keyboardHolder
             * @type Object
             * @default null
             */
            "keyboardHolder": null,

            /**
             * @property enterClickFunction
             * @type Boolean
             * @default false
             */
            "enterClickFunction": false,

            /**
             * @property defaultFocus
             * @type Boolean
             * @default false
             */
            "defaultFocus": false,

            /**
             * @property isAccessibilityAllow
             * @type Boolean
             * @default false
             */
            "isAccessibilityAllow": false,

            /**
             * @property basePath
             * @type String
             * @default ''
             */
            "basePath": '',

            /**
             * @property expressionData
             * @type object
             * @default ''
             */
            "expressionData": null,

            /**
             * @property keyboardVisible
             * @type Boolean
             * @default true
             */
            "keyboardVisible": true
        },

        /**
         * Sets jsonData and equationJsonData property
         * @method parseData
         * @param options {Object} Provides properties to be parsed.
         */
        "parseData": function (options) {
            this.set({
                "jsonData": options.jsonData,
                "equationJsonData": options.equationJsonData,
                "editorCall": options.editorCall,
                "keyboardCall": options.keyboardCall,
                "enterClick": options.enterClick,
                "idCounter": options.idCounter,
                "keyboardObject": options.keyboardObject,
                "closeButton": options.closeButton,
                "keyboardHolder": options.keyboardHolder,
                "enterClickFunction": options.enterClickFunction,
                "defaultFocus": options.defaultFocus
            });
            if (options.isAccessibilityAllow) {
                this.set('isAccessibilityAllow', options.isAccessibilityAllow && !MathUtilities.Components.Utils.Models.BrowserCheck.isMobile);
            }
            if (options.basePath) {
                this.set('basePath', options.basePath);
            }
            this.set('expressionData', options.expressionData);
            if (typeof options.keyboardVisible === 'boolean') {
                this.set('keyboardVisible', options.keyboardVisible);
            }
            if (options.donotBindTab) {
                this.set('donotBindTab', options.donotBindTab);
            }
        }
    }, {

        /**
         * @property FOCUS_TEXTAREA
         * @static
         * @type object
         */
        "FOCUS_TEXTAREA": null,

        /**
         * @property EDITOR
         * @static
         * @type object
         */
        "EDITOR": null
    });
}(window.MathUtilities));
