(function (MathUtilities) {
    'use strict';
    /**
    * A customized Backbone.Model that represents Keyboard-alphabets, numbers
    * @class BasePanelModel
    * @constructor
    * @namespace Components.MathEditor.Keyboard.Models
    * @module MathEditor
    * @submodule Keyboard
    * @extends Backbone.Model
    */
    MathUtilities.Components.MathEditor.Keyboard.Models.BasePanel = Backbone.Model.extend({

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
            * @property matrixCount
            * @type Integer
            * @default 0
            */
            matrixCount: 0
        },

        /**
        * Sets jsonData property
        * @method parseData
        * @param {Object} jsonData. Its JSON data for Keyboard.
        */
        parseData: function parseData(jsonData) {
            this.set('jsonData', jsonData);
            this.set('matrixCount', Object.keys(jsonData).length);
        }
    });

}(window.MathUtilities));
