(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.Model that represents 'Choose Equation' section in Cas Tool.
    * @class ChooseEquation
    * @constructor
    * @namespace Tools.CasTool.CasToolHolder.Models
    * @module CasTool
    * @submodule CasToolHolder
    * @extends Backbone.Model
    */
    MathUtilities.Tools.CasTool.CasToolHolder.Models.ChooseEquation = Backbone.Model.extend({
        /**
        * @property defaults
        * @type Object
        */
        defaults: {
            dropdownValue:null
        }

    }, {});
}(window.MathUtilities));