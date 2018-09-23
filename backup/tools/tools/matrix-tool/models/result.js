(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.Model that represents 'Result' section in Matrix Tool.
    * @class Result
    * @constructor
    * @namespace Tools.MatrixTool.MatrixToolHolder.Models
    * @module MatrixTool
    * @submodule MatrixToolHolder
    * @extends Backbone.Model
    */
    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.Result = Backbone.Model.extend({
        /**
        * @property defaults
        * @type Object
        */
        defaults: {
            resultValue: null,
            isArray: true
        }

    }, {});
}(window.MathUtilities));