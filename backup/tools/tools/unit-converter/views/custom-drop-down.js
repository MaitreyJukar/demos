(function () {
    'use strict';

    /**
    * Generates HTML of select box using templates and provides method to change options.
    *
    * @module MathUtilities.Tools.UnitConverter
    * @class CustomDropDown
    * @constructor
    * @extends Backbone.View
    * @namespace MathUtilities.Tools.UnitConverter.Views
    */
    MathUtilities.Tools.UnitConverter.Views.CustomDropDown = Backbone.View.extend({

        /**
        * Returns HTML of drop-down.
        *
        * @method getHTML
        * @type String
        * @return {String} Html String of the drop-down.
        */
        getHTML: function () {
            var model = this.model,
                dropDownID = model.get('dropDownID'),
                cssClasses = model.get('cssClasses'),
                options = model.get('optionsDetails'),
                allData = null,
                dropDownHTML = null;
            
            allData = {
                dropDownClasses: cssClasses,
                dropDownID: dropDownID,
                options: options
            };

            // Passing data to compiled template.
            dropDownHTML = MathUtilities.Tools.UnitConverter.Views.SelectBoxTemplate(allData);

            return dropDownHTML;
        }
    },
    {
        /**
        * Compiled template of select box.
        *
        * @static 
        */
        SelectBoxTemplate: null,

        /**
        * Compiled template for options. 
        *
        * @static 
        */
        OptionsTemplate: null,

        /**
        * Sets a new set of 'options' to the drop-down menu.
        *
        * @method changeOptions
        * @params {Object} [options] `Array` of `Objects` of drop-down menu's options 
        * whose HTML is to be generated.
        * @return {String} New set of options in the dropdown.
        * @static 
        */
        changeOptions: function (options) {
            var newOptions = MathUtilities.Tools.UnitConverter.Views.OptionsTemplate({ options: options[0] });
           
            return newOptions.trim();
        }
    });
})();