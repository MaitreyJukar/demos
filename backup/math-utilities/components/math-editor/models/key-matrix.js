(function (MathUtilities) {
    'use strict';
    /**
    * A customized Backbone.Model that represents Keyboard-keys
    * @class KeyMatrixModel
    * @constructor
    * @namespace Components.MathEditor.Keyboard.Models
    * @module MathEditor
    * @submodule Keyboard
    * @extends Backbone.Model
    */
    MathUtilities.Components.MathEditor.Keyboard.Models.KeyMatrix = Backbone.Model.extend({

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
            * @property interval
            * @type Object
            * @default null
            */
            interval: null

        },

        /**
        * Sets jsonData property
        * @method parseData
        * @param {Object} jsonData. Its JSON data for Keyboard.
        */
        parseData: function parseData(jsonData) {
            this.set('jsonData', jsonData);
        }
    }, {
        /**
        * @property WIDTH
        * @static
        * @type Integer
        */
        WIDTH: 54,

        /**
        * @property HEIGHT
        * @static
        * @type Integer
        */
        HEIGHT: 32,

        /**
        * @property PADDING
        * @static
        * @type Integer
        */
        PADDING: 10,

        /**
        * @property IDCOUNTER
        * @static
        * @type Integer
        */
        IDCOUNTER: 0
    });
}(window.MathUtilities));
