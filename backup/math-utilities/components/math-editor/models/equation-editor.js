/* globals window */

(function (MathUtilities) {
    'use strict';
    /**
    * A customized Backbone.Model that represents Equation Editor.
    * @class EquationEditorModel
    * @constructor
    * @namespace Components.MathEditor.EquationEditor.Models
    * @module MathEditor
    * @submodule EquationEditor
    * @extends Backbone.Model
    */
    MathUtilities.Components.MathEditor.EquationEditor.Models.EquationEditor = Backbone.Model.extend({

        /**
        * @property defaults
        * @type Object
        */
        "defaults": {
            /**
            * @property focusedTextarea
            * @type Object
            * @default null
            */
            "focusedTextarea": null,

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
            * @property divID
            * @type Integer
            * @default 0
            */
            "divId": 0,

            /**
            * @property enterClickFunction
            * @type Boolean
            * @default false
            */
            "enterClickFunction": false,

            /**
            * @property defaultFocus
            * @type Boolean
            * @default true
            */
            "defaultFocus": true

        },
        /**
        * Sets jsonData and equationJsonData property
        * @method parseData
        * @param options {Object} Provides properties to be parsed.
        */
        "parseData": function (options) {
            this.set({
                "equationJsonData": options.equationJsonData,
                "enterClick": options.enterClick,
                "idCounter": options.idCounter,
                "closeButton": options.closeButton,
                "enterClickFunction": options.enterClickFunction,
                "defaultFocus": options.defaultFocus
            });
        }
    }, {
        /**
        * @property KEYCODE_LEFT
        * @static
        * @type String
        */
        "KEYCODE_LEFT": '37',

        /**
        * @property KEYCODE_RIGHT
        * @static
        * @type String
        */
        "KEYCODE_RIGHT": '39',

        /**
        * @property KEYCODE_UP
        * @static
        * @type String
        */
        "KEYCODE_UP": '38',

        /**
        * @property KEYCODE_DOWN
        * @static
        * @type String
        */
        "KEYCODE_DOWN": '40',

        /**
        * @property KEYCODE_OPEN_BRACKET
        * @static
        * @type String
        */
        "KEYCODE_OPEN_BRACKET": '40',

        /**
        * @property KEYCODE_BACKSPACE
        * @static
        * @type String
        */
        "KEYCODE_BACKSPACE": '8',

        /**
        * @property KEYCODE_ENTER
        * @static
        * @type String
        */
        "KEYCODE_ENTER": '13',

        /**
        * @property KEYCODE_SPACEBAR
        * @static
        * @type String
        */
        "KEYCODE_SPACEBAR": '32',

        /**
        * @property KEYCODE_DOT
        * @static
        * @type String
        */
        "KEYCODE_DOT": '46',

        /**
        * @property KEYCODE_CARAT
        * @static
        * @type String
        */
        "KEYCODE_CARAT": '94',

        /**
        * @property KEYCODE_RAISETOTWO
        * @static
        * @type String
        */
        "KEYCODE_RAISETOTWO": '178',

        /**
        * @property KEYCODE_BASETWO
        * @static
        * @type String
        */
        "KEYCODE_BASETWO": '95'
    });
}(window.MathUtilities));
