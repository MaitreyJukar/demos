(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.Model that represents 'Choose Task' section in Matrix Tool.
    * @class ChooseTask
    * @constructor
    * @namespace Tools.MatrixTool.MatrixToolHolder.Models
    * @module MatrixTool
    * @submodule MatrixToolHolder
    * @extends Backbone.Model
    */
    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.ChooseTask = Backbone.Model.extend({
        /**
        * @property defaults
        * @type Object
        */
        defaults: {
            dropdownValue: null,
            firstVertSliderValue: 5,
            firstHoriSliderValue: 0,
            secondVertSliderValue: 5,
            secondHoriSliderValue: 0,
            firstHoriList: [],
            firstVertList: [],
            secondHoriList: [],
            secondVertList: [],
            goBtnView: null,
            answer: null,
            cursorPosition: null,
            sliderDragFocus:null,
            slidingStartData:null,
            cellKeyPressData: null,
            inputMatrixHeight: null,
            keydownFlagForNexus: false,
            insideKeydown: false,
            numText: '',
            denomText:''
        }

    }, {
        /**
        * @property KEYCODE_LEFT
        * @static
        * @type Integer
        */
        KEYCODE_LEFT: 37,

        /**
        * @property KEYCODE_RIGHT
        * @static
        * @type Integer
        */
        KEYCODE_RIGHT: 39,

        /**
        * @property KEYCODE_UP
        * @static
        * @type Integer
        */
        KEYCODE_UP: 38,

        /**
        * @property KEYCODE_DOWN
        * @static
        * @type Integer
        */
        KEYCODE_DOWN: 40,
        /**
        * @property KEYCODE_ALPHABET_A
        * @static
        * @type Integer
        */
        KEYCODE_ALPHABET_A: 97,
        /**
        * @property KEYCODE_ALPHABET_C
        * @static
        * @type Integer
        */
        KEYCODE_ALPHABET_C: 99,
        /**
       * @property KEYCODE_ALPHABET_V
       * @static
       * @type Integer
       */
        KEYCODE_ALPHABET_V: 118,
        /**
       * @property KEYCODE_ALPHABET_X
       * @static
       * @type Integer
       */
        KEYCODE_ALPHABET_X: 120,

        /**
       * @property KEYCODE_MAC_LEFT_WINDOW_FOR_CHROME
       * @static
       * @type Integer
       */
        KEYCODE_MAC_LEFT_WINDOW_FOR_CHROME: 91,
        /**
      * @property KEYCODE_MAC_RIGHT_WINDOW_FOR_CHROME
      * @static
      * @type Integer
      */
        KEYCODE_MAC_RIGHT_WINDOW_FOR_CHROME: 93,
        /**
      * @property KEYCODE_MAC_LEFT_RIGHT_WINDOW_FOR_MOZILLA
      * @static
      * @type Integer
      */
        KEYCODE_MAC_LEFT_RIGHT_WINDOW_FOR_MOZILLA: 224

    });
}(window.MathUtilities));