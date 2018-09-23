(function () {
    'use strict';

    /**
    * Generates HTML of value displaying input box and unit's drop-down menus 
    * and provides method to change the options in drop-down.
    *
    * @module MathUtilities.Tools.UnitConverter
    * @class UnitValueDisplayer
    * @constructor
    * @extends Backbone.View
    * @namespace MathUtilities.Tools.UnitConverter.Views
    */
    MathUtilities.Tools.UnitConverter.Views.UnitValueDisplayer = Backbone.View.extend({

        /**
        * Creates and returns the html of the input box and drop-down.
        * 
        * @method getHTML
        * @type String
        * @return {String} HTML of input box and drop-down.
        */
        getHTML: function () {
            var model = this.model,
                valueBoxHTML = MathUtilities.Tools.UnitConverter.Views.InputBoxTemplate({
                    id: model.get('valueBoxID'),
                    cssClass: model.get('valueBoxClasses')
                }),
                unitsDropDown = new MathUtilities.Tools.UnitConverter.Models.CustomDropDown({
                    dropDownID: model.get('unitsDropDownID'),
                    cssClasses: model.get('unitsDropDownCss'),
                    optionsDetails: model.get('unitsDropDownOptions')
                }),
                unitsDropDownView = new MathUtilities.Tools.UnitConverter.Views.CustomDropDown({ model: unitsDropDown }),
                unitsDropDownHTML = unitsDropDownView.getHTML();

            return (unitsDropDownHTML + valueBoxHTML);
        },

        /**
        * Returns HTML of new drop-down menu's options. 
        * 
        * @method getNewOptionsHTML
        * @params {Object} [options] `Array` of `Objects` of drop-down menu's options 
        * whose HTML is to be generated.
        * @return {String} Html value of new set of drop-down menu's options.
        */
        getNewOptionsHTML: function (options) {
            var newOptions = MathUtilities.Tools.UnitConverter.Views.CustomDropDown.changeOptions(options);
            return newOptions;
        },

        /**
        * Returns JSON of new options 
        * 
        * @method getNewOptionsJSON
        * @params {Object} [options] Array of objects of options whose HTML is to be generated
        * @return {Object} String Html value of new set of options
        */
        getNewOptionsJSON: function (options) {

            var newOptions = MathUtilities.Tools.UnitConverter.Views.CustomDropDown.changeOptions(options),
                dummyElement;
            // Replace \n \r charecters if any
            newOptions = newOptions.replace("/\r?\n|\r/", "");
            // will die in safari and Ie9 if used other than Select tag here.
            dummyElement = $("<select>" + newOptions + "</select>");

            return this._parseHtmlToJson(dummyElement);
        },

        /**
        * Parses the Html data into JSON.
        * 
        * @method _parseHtmlToJson
        * @params {Object} Element of which elements are to be parsed.
        * @return {Object} [Object] JSON object
        */
        _parseHtmlToJson: function (oElement) {
            var groupData = null,
                linearData = [],
                parsedData = null,
                defaultData = null,
                arrOptions = [],
                arrOptgroup = $('optgroup', oElement),
                objElement = null,
                arrChildren = null,
                oLooper = 0,
                iLooper = 0;

            defaultData = { value: 'Select',
                text: 'Select',
                acc: 'Select',
                enabled: 'true',
                bIsOptGroupChild: false
            };

            for (; oLooper < arrOptgroup.length; oLooper++) {

                arrChildren = $(arrOptgroup[oLooper]).children();

                if (!arrChildren.length) {
                    continue;
                }

                objElement = $(arrOptgroup[oLooper]);
                if (objElement.is("optgroup")) {
                    groupData = {};
                    groupData.label = objElement.attr("label");
                    groupData.data = [];
                }

                for (iLooper = 0; iLooper < arrChildren.length; iLooper++) {
                    objElement = $(arrChildren[iLooper]);
                    if (objElement.is("option")) {
                        parsedData = {};
                        parsedData.value = objElement.attr('value');
                        parsedData.text = objElement.html();
                        parsedData.acc = objElement.attr("acc");
                        parsedData.enabled = objElement.attr('disabled') !== 'disabled';
                        parsedData.bIsOptGroupChild = true;

                        linearData.push(parsedData);
                        // Push the parsed data into the groupData
                        groupData.data.push(parsedData);
                    }
                }
                // Push the parsed data into the arrOptions
                arrOptions.push(groupData);
            }
            // Adds a default object to show select at the begining of the combo-box.
            arrOptions.unshift(defaultData);
            linearData.unshift(defaultData);

            return { data: arrOptions, linear: linearData };
        }

    },

    {
        /** 
        * Contains compiled template of input box.
        * 
        * @property getNewOptionsHTML
        * @default null
        * @static
        */
        InputBoxTemplate: null
    });
})();