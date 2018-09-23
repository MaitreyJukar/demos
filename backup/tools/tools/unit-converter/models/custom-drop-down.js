(function() {
    'use strict';

    /**
    * Conatins properties for custom drop-down. 
    *
    * @module MathUtilities.Tools.UnitConverter
    * @class CustomDropDown
    * @construtor
    * @extends Backbone.Model
    * @namespace MathUtilities.Tools.UnitConverter.Models
    */
    MathUtilities.Tools.UnitConverter.Models.CustomDropDown = Backbone.Model.extend({
        defaults: {
            /**
            * Contains ID to be assigned to the custom drop-down.
            * 
            * @property dropDownID
            * @type String
            * @default null
            */
            dropDownID: null,

            /**
            * Contains a string of CSS classes to be applied to the custom drop-down.
            * 
            * @property cssClasses
            * @type String
            * @default null
            */
            cssClasses: null,

            /**
            * Contains an array of objects specifying text, value and ID of the custom drop-down's option.
            * 
            * @property optionsDetails
            * @type Array
            * @default null
            */
            optionsDetails: null
        }
    });
})();