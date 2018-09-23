(function() {
    'use strict';

    /**
    * Conatins properties for unit-value displayer.
    *
    * @module MathUtilities.Tools.UnitConverter
    * @class UnitValueDisplayer
    * @construtor
    * @extends Backbone.Model
    * @namespace MathUtilities.Tools.UnitConverter.Models
    */
    MathUtilities.Tools.UnitConverter.Models.UnitValueDisplayer = Backbone.Model.extend({

        defaults: {
            /**
            * Contains ID to be assigned to the unit-value displayer.
            * 
            * @property valueBoxID
            * @type String
            * @default null
            */
            valueBoxID: null,

            /**
            * Contains a string of CSS classes to be applied to the  unit-value displayer.
            * 
            * @property valueBoxClasses
            * @type String
            * @default null
            */
            valueBoxClasses: null,

            /**
            * Contains the default value to be displayed.
            * 
            * @property defaultValue
            * @type String
            * @default ''
            */
            defaultValue: '',

            /**
            * ID of the drop-down
            * 
            * @property unitsDropDownID
            * @type String
            * @default null
            */
            unitsDropDownID: null,

            /**
            * CSS classes of drop-down
            * 
            * @property unitsDropDownCss
            * @type String
            * @default null
            */
            unitsDropDownCss: null,

            /**
            * Array of objects of options
            * 
            * @property unitsDropDownCss
            * @type Array
            * @default null
            */
            unitsDropDownOptions: null,

            /**
            * Default unit to be displayed
            * 
            * @property defaultUnit
            * @type String
            * @default null
            */
            defaultUnit: null
        }
    });
})();