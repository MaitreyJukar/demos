(function (MathUtilities) {
    'use strict';
    /**
    * A customized Backbone.Model that represents Keyboard
    * @class KeyboardModel
    * @constructor
    * @namespace Components.MathEditor.Keyboard.Models
    * @module MathEditor
    * @submodule Keyboard
    * @extends Backbone.Model
    */
    MathUtilities.Components.MathEditor.Keyboard.Models.Keyboard = Backbone.Model.extend({

        /**
        * @property defaults
        * @type Object
        */
        defaults: {

            /**
            * @property jsonData
            * @type Object
            * @default null
            */
            jsonData: null,

            /**
            * @property focusedTextarea
            * @type Object
            * @default null
            */
            focusedTextarea: null,

            /**
            * @property currText
            * @type String
            * @default ''
            */
            currText: '',

            /**
            * @property prevText
            * @type String
            * @default ''
            */
            prevText: '',

            /**
            * @property equationJsonData
            * @type Object
            * @default null
            */
            equationJsonData: null,

            /**
            * @property enterClick
            * @type Booolean
            * @default false
            */
            enterClick: false,

            /**
            * @property keyboardHolder
            * @type Object
            * @default null
            */
            keyboardHolder: null,

            /**
            * @property isAccessibilityAllow
            * @type Boolean
            * @default false
            */
            isAccessibilityAllow: false,

            /**
            * @property basePath
            * @type String
            * @default ''
            */
            basePath: '',

            /**
            * @property showKeyboard
            * @type Boolean
            * @default false
            */
            showKeyboard: false,

            /**
            * @property keyboardVisible
            * @type Boolean
            * @default true
            */
            keyboardVisible: true
        },

        /**
        * Sets jsonData and equationJsonData property
        * @method parseData
        * @param {Object} jsonData. Its JSON data for Keyboard.
        * @param {Object} equationJsonData. Its JSON data for Keyboard Latex Commands.
        * @param {Boolean} enterClick. To check if new equation editor is to be added on 'Enter' click.
        * @param {Object} keyboardHolder. Div holder for keyboard.
        * @param {Boolean} isAccessibilityAllow. Whether accessibility is on or off.
        * @param {String} basePath.file path to access acc-data json
        */
        parseData: function parseData(jsonData, equationJsonData, enterClick, keyboardHolder, isAccessibilityAllow, basePath, keyboardVisible) {
            this.set('jsonData', jsonData);
            this.set('equationJsonData', equationJsonData);
            this.set('enterClick', enterClick);
            this.set('keyboardHolder', keyboardHolder);
            this.set('isAccessibilityAllow', isAccessibilityAllow);
            this.set('basePath', basePath);
            this.set('keyboardVisible', keyboardVisible);
        }
    });
}(window.MathUtilities));