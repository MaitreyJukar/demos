/* globals MathUtilities, $ */

(function() {
    'use strict';
    MathUtilities.undoManager = new MathUtilities.Components.Undo.Models.UndoManager({
        "maxStackSize": 15
    });

    /**
     * Contains methods to convert values and make objects suitable for template requirements.
     * @class UnitConverter
     * @constructor
     * @extends Backbone.Model
     * @namespace MathUtilities.Tools.UnitConverter.Models
     */
    MathUtilities.Tools.UnitConverter.Models.UnitConverter = Backbone.Model.extend({

        "defaults": {
            /**
             * Stores the `JSON` data that is fetched from the JSON file of unit-converter.
             * 
             * @property jsonData
             * @type Object
             * @defaults null
             */
            "jsonData": null,

            /**
             * Stores the `JSON` data that is fetched from the JSON file of unit-converter,used for display.
             * 
             * @property accJsonData
             * @type Object
             * @defaults null
             */
            "accJsonData": null,

            /**
             * Contains an `Array` of options in categories drop-down.
             * 
             * @property categoryDropDownOptions
             * @type Array
             * @defaults null
             */
            "categoryDropDownOptions": null,

            /**
             * Contains an `Array` of arrays of units.
             * 
             * @property unitsDropDownOptions
             * @type Array
             * @defaults null
             */
            "unitsDropDownOptions": null
        },

        /**
         * Changes to true only when an Undo | Redo is in operation.
         * 
         * @property bWIP
         * @type Boolean
         * @default false
         */
        "bWIP": false,

        /**
         * Contains an `Array` of categories with their corresponding units arrays.
         * 
         * @property allCategoryUnits
         * @type Array
         * @defaults null
         */
        "allCategoryUnits": null,

        /**
         * Contains an `Array` of all categories present in the JSON data.
         * 
         * @property allCategoryData
         * @type Array
         * @defaults null
         */
        "allCategoryData": null,

        /**
         * Contains list of last active element before any undo or redo operation.
         * 
         * @property lastActiveElement
         * @type Array
         * @defaults null
         */
        "lastActiveElement": [],

        /**
         * It is an `Object` that stores data which is accepted and used to displayed.
         * 
         * @property dataToDisplay
         * @type Object
         */
        "dataToDisplay": {
            /**
             * Contains current selected Category index from the Category `Array`.
             * 
             * @property selectedCategoryIndex
             * @type Number
             * @defaults 0
             */
            "selectedCategoryIndex": 0,

            /**
             * Contains index of the unit's `Array` which is used to convert 'to'.
             * 
             * @property fromUnitIndex
             * @type Number
             * @defaults null
             */
            "fromUnitIndex": null,

            /**
             * Contains index of the unit's `Array` which is used to convert 'from'.
             * 
             * @property toUnitIndex
             * @type Number
             * @defaults null
             */
            "toUnitIndex": null,

            /**
             * Contains value to be converted to.
             * 
             * @property inputValue
             * @type String
             * @defaults null
             */
            "inputValue": null,

            /**
             * Contains converted result.
             * 
             * @property answer
             * @type String
             * @defaults null
             */
            "answer": null,

            /**
             * Contains last focused element.
             * 
             * @property activeElement
             * @type Object
             * @defaults null
             */
            "activeElement": $('body')[0]
        },

        /**
         * Automatically called by backbone.js when UnitConverter object is instantiated.
         * 
         * @method initialize
         */
        "initialize": function() {
            this.allCategoryUnits = [];
            this._addAccessibilityData();
            this._makeArrayOfCategories();
        },

        /**
         * Combine conversion data and visual data such into single object.
         * @method _addAccessibilityData
         * @private
         */
        "_addAccessibilityData": function() {
            var accData = this.get('accJsonData'),
                allCategories = this.get('jsonData').categories,
                numOfCategories = allCategories.length,
                currCategory = null,
                categoriesCounter,
                screenCounter,
                numOfScreens = accData.length,
                currScreen = [],
                numOfElements = [],
                currElement,
                elementCounter,
                typeCounter,
                currUnit,
                numOfUnits,
                unitCounter,
                currType,
                message,
                categoriesMessages;

            //add corresponding categories acc and loc data from accJsondata into jsonData

            //find combobox screen in accData
            for (screenCounter = 0; screenCounter < numOfScreens; screenCounter++) {
                if (accData[screenCounter].id === "combobox") {
                    currScreen = accData[screenCounter];
                    numOfElements = currScreen.elements.length;
                    break;
                }
            }

            //In current screen find "categories-drop-down" element
            for (elementCounter = 0; elementCounter < numOfElements; elementCounter++) {
                if (currScreen.elements[elementCounter].id === "categories-drop-down") {
                    categoriesMessages = currScreen.elements[2].messages;
                    break;
                }
            }


            for (categoriesCounter = 0; categoriesCounter < numOfCategories; categoriesCounter++) {
                currCategory = allCategories[categoriesCounter];

                //attach corresponding category acc and loc data from categoriesAccData into jsonData
                currCategory.name = categoriesMessages[categoriesCounter + 1].message.loc;

                //find corresponding category screen in accData
                for (screenCounter = 0; screenCounter < numOfScreens; screenCounter++) {
                    if (currCategory.id === accData[screenCounter].id) {
                        currScreen = accData[screenCounter];
                        numOfElements = currScreen.elements.length;
                        break;
                    }
                }

                //add acc and loc data of corresponding category element
                for (typeCounter = 0; typeCounter < currCategory.type.length; typeCounter++) {
                    currType = currCategory.type[typeCounter];

                    //type acc and loc text
                    for (elementCounter = 0; elementCounter < numOfElements; elementCounter++) {
                        currElement = currScreen.elements[elementCounter];
                        if (currType.id === currElement.id) {
                            message = currElement.messages[0].message;
                            currType.name = message.loc;
                            currType.acc = message.acc;
                            break;
                        }
                    }

                    //units acc and loc text
                    numOfUnits = currType.units.length;
                    for (unitCounter = 0; unitCounter < numOfUnits; unitCounter++) {
                        currUnit = currCategory.type[typeCounter].units[unitCounter];
                        for (elementCounter = 0; elementCounter < numOfElements; elementCounter++) {
                            currElement = currScreen.elements[elementCounter];
                            if (currUnit.id === currElement.id) {
                                message = currElement.messages[0].message;
                                currUnit.name = message.loc;
                                currUnit.acc = message.acc;
                                break;
                            }
                        }
                    }
                }
            }
        },
        /**
         * Makes an array of objects of all categories in the form required by templates.
         *
         * @method _makeArrayOfCategories
         * @private
         */
        "_makeArrayOfCategories": function() {
            var allCategories = this.get('jsonData').categories,
                numOfCategories = allCategories.length,
                currCategory = null,
                currCategoryID = null,
                currCategoryData = null,
                optionVisibilty = null,
                categoryOptions = [],
                i;

            this.allCategoryData = allCategories;

            for (i = 0; i < numOfCategories; i++) {
                currCategory = allCategories[i];
                currCategoryID = currCategory.id;

                // Show/hide the given option according to its 'visible' property
                if (typeof currCategory.visible === 'undefined') {
                    optionVisibilty = 'block';
                } else {
                    optionVisibilty = 'none';
                }

                currCategoryData = {
                    "optionID": currCategoryID,
                    "optionValue": currCategoryID,
                    "optionText": currCategory.name,
                    "optionVisiblity": optionVisibilty
                };

                categoryOptions.push(currCategoryData);

                this._makeUnitsArray(currCategory);
            }

            this._prependSelectOption(categoryOptions);
            this.set('categoryDropDownOptions', categoryOptions);

            this._setOptionforSelectCategory();
            this.set('unitsDropDownOptions', this.allCategoryUnits);
        },

        /**
         * Makes an `Array` of `Objects` of all units of the current selected category,
         * in the form required by templates.
         *
         * @method _makeUnitsArray
         * @param {Object} [category] Current selected category.
         * @private
         */
        "_makeUnitsArray": function(category) {

            var type = category.type,
                units = null,
                numOfUnits = null,
                currentUnit = null,
                currUnitID = null,
                optionVisibilty = null,
                unitDetails = {},
                unitsList = [],
                currType = [],
                index = 0,
                j;

            for (; index < 2; index++) {
                units = type[index].units;
                numOfUnits = units.length;
                currType[index] = {
                    "id": type[index].id,
                    "label": type[index].name,
                    "units": []
                };

                for (j = 0; j < numOfUnits; j++) {
                    currentUnit = units[j];
                    currUnitID = currentUnit.id;

                    if (typeof currentUnit.visible === 'undefined') {
                        optionVisibilty = 'block';
                    } else {
                        optionVisibilty = 'none';
                    }

                    unitDetails = {
                        "optionID": currUnitID,
                        "optionValue": currUnitID,
                        "optionText": currentUnit.name,
                        "optionVisiblity": optionVisibilty,
                        "optionAcc": currentUnit.acc
                    };
                    currType[index].units[j] = unitDetails;
                }


            }
            unitsList.push(currType);

            this.allCategoryUnits.push(unitsList);
        },

        /**
         * Sets `Select` as the first option.
         *
         * @method _prependSelectOption
         * @param {Array} [array] Array of options to which 'Select' is to be prepended.
         * @private
         */
        "_prependSelectOption": function(array) {
            array.unshift({
                "optionID": '',
                "optionValue": '',
                "optionText": 'Select'
            });
        },

        /**
         * Sets ' ' as the options for 'Select' category.
         *
         * @method _setOptionforSelectCategory
         * @private
         */
        "_setOptionforSelectCategory": function() {
            this.allCategoryUnits.unshift([{
                "optionID": '',
                "optionValue": '',
                "optionText": 'Select'
            }]);
        },

        /**
         * Performs conversion.
         *
         * @method convert
         * @param {Object} [data] Contains category index, 'to' and 'from' units' index and
         * the value to be converted.
         * @return {String} Converted value.
         */
        "convert": function(data) {
            var categoryIndex = data.categoryIndex,
                fromUnitIndex = data.fromUnitIndex,
                toUnitIndex = data.toUnitIndex,
                valueToConvert = data.valueToConvert,
                currentCategory, currentFromUnit, valueInPrimaryUnit, currentToUnit, convertedValue,
                unitsLength;

            currentCategory = this.allCategoryData[categoryIndex];
            // Grouped units.
            if (currentCategory.type) { // Ungrouped units.
                unitsLength = currentCategory.type[0].units.length - 1;
            } else {
                unitsLength = currentCategory.units.length;
            }

            // Grouped units.
            if (currentCategory.type) { // Ungrouped units.
                if (fromUnitIndex <= unitsLength) {
                    currentFromUnit = currentCategory.type[0].units[fromUnitIndex];
                } else {
                    currentFromUnit = currentCategory.type[1].units[fromUnitIndex - unitsLength - 1];
                }
            } else {
                currentFromUnit = currentCategory.units[fromUnitIndex];
            }

            valueInPrimaryUnit = this._convertToPrimary(currentFromUnit, valueToConvert);

            // Grouped units.
            if (currentCategory.type) { // Ungrouped units.
                if (toUnitIndex <= unitsLength) {
                    currentToUnit = currentCategory.type[0].units[toUnitIndex];
                } else {
                    currentToUnit = currentCategory.type[1].units[toUnitIndex - unitsLength - 1];
                }
            } else {
                currentToUnit = currentCategory.units[toUnitIndex];
            }

            if (currentToUnit !== void 0 && valueInPrimaryUnit !== void 0) {
                convertedValue = this._convertFromPrimary(currentToUnit, valueInPrimaryUnit);

                return convertedValue.toString();
            }

        },

        /**
         * Converts the given value to its primary unit's value.
         *
         * @method _convertToPrimary
         * @param {Object} [fromUnit] data of 'from' unit.
         * @param {Number} [valueToConvert] value to convert.
         * @return {Number} Value in primary units of the category.
         * @private
         */
        "_convertToPrimary": function(fromUnit, valueToConvert) {

            var fromPrimary = fromUnit.fromPrimary,
                toPrimary = null,
                inPrimaryUnit = null;

            // Checks if conversion formula is direct multiplication or substitution
            if (fromPrimary.search("x") < 0) {
                // Determining the conversion factor 'toPrimary' using 'fromPrimary'
                toPrimary = (1 / eval(fromPrimary));
                inPrimaryUnit = eval(toPrimary) * valueToConvert;
            } else {
                // Uses direct formula given in JSON
                toPrimary = fromUnit.toPrimary;
                inPrimaryUnit = eval(toPrimary.replace("x", this._truncateZeros(valueToConvert)));
            }

            return inPrimaryUnit;
        },

        /**
         * Removes the leading zeros, checks whether only zeros are inserted as input.
         *
         * @method _truncateZeros
         * @private
         * @param {String} inputValue The value inserted to the text field.
         */
        "_truncateZeros": function(inputValue) {
            var inputArray = [],
                i;
            if (inputValue === '.') {
                return;
            }
            
            inputArray = inputValue.split('.');

            for (i in inputArray) {
                if (i === '0') {
                    if (inputArray[i] === '') {
                        continue;
                    }
                    if (inputArray[i] === '-' && inputArray[1] !== void 0 && inputArray[1] !== ''){
                        inputArray[i] = '-0';
                    }
                    inputArray[i] = parseInt(inputArray[i], 10);
                } else if (i === '1' && (inputArray[i] === '' || inputArray[i] === '-' || parseInt(inputArray[i], 10) <= 0)) {
                    inputArray.splice(parseInt(i, 10), 1);
                    if(inputArray[0] === ''){
                        inputArray[0] = parseInt(inputArray[0], 10);
                    }
                }
            }
            if (inputArray.length > 1) {
                inputArray = inputArray.join('.');
            }
            return inputArray;
        },

        /**
         * Triggers after `_convertToPrimary`, converts the returned primary unit's value 
         * from `_convertToPrimary` to value in required unit.
         *
         * @method _convertFromPrimary
         * @param {Object} [toUnit] data of `to unit`.
         * @param {Number} [valueToConvert] value to convert.
         * @return {Number} Converted value in the required units.
         * @private
         */
        "_convertFromPrimary": function(toUnit, valueToConvert) {

            var fromPrimary = toUnit.fromPrimary,
                convertedValue = null;

            if (fromPrimary.search("x") < 0) {
                convertedValue = eval(fromPrimary) * valueToConvert;
            } else {
                convertedValue = eval(fromPrimary.replace("x", valueToConvert));
            }

            // If answer is NaN, display nothing.
            if (isNaN(convertedValue)) {
                convertedValue = '';
            } else if (convertedValue.toString().length > 11) {
                convertedValue = convertedValue.toPrecision(10);
            }
            return convertedValue;
        },

        /**
         * Sets the data on inputting value in the input box.
         *
         * @method changedEvent
         * @param {Object} changedEvent Contains the latest values of Category selected index,
         * left input box, right input box, unit index to be converted, unit index converted from.
         */
        "changedEvent": function(changedEvent) {
            if (!this.bWIP) {
                this.execute(MathUtilities.Tools.UnitConverter.Models.UnitConverter.ACTION_SET_DATA, changedEvent);
            }
        },

        "registerModule": function() {
            var undoActionData,
                redoActionData,
                moduleObj;
            undoActionData = new MathUtilities.Components.Undo.Models.Action({
                "name": MathUtilities.Tools.UnitConverter.Models.UnitConverter.ACTION_SET_DATA,
                "data": {},
                "manager": this
            });

            redoActionData = new MathUtilities.Components.Undo.Models.Action({
                "name": MathUtilities.Tools.UnitConverter.Models.UnitConverter.ACTION_SET_DATA,
                "data": {},
                "manager": this
            });

            moduleObj = {
                "moduleName": MathUtilities.Tools.UnitConverter.Models.UnitConverter.MODULE_NAME,
                "undoAction": undoActionData,
                "redoAction": redoActionData,
                "domReference": this.$("#main-container")
            };

            MathUtilities.undoManager.registerModule(moduleObj);
        },

        /**
         * Triggers on user action, example: (change event of combo-box, entering values in an input box).
         * 
         * @method execute
         * @param {String} [actionName] Action to be performed.
         * @param {Object} [data] The current data of all components of the tool.
         * @param {Boolean} [skipRegistration] Skips the registration of the action in undo manager if sent false.
         */
        "execute": function(actionName, data, skipRegistration) {
            var undoActionData = null,
                redoActionData = null;

            if (actionName === 'set-data') {
                if (skipRegistration !== true) {
                    undoActionData = new MathUtilities.Components.Undo.Models.Action({
                        "name": MathUtilities.Tools.UnitConverter.Models.UnitConverter.ACTION_SET_DATA,
                        "data": this.dataToDisplay,
                        "manager": this
                    });

                    redoActionData = new MathUtilities.Components.Undo.Models.Action({
                        "name": MathUtilities.Tools.UnitConverter.Models.UnitConverter.ACTION_SET_DATA,
                        "data": data,
                        "manager": this
                    });
                } else {
                    this.dataToDisplay = data;
                    $(this).trigger('updateView');
                }
            }

            if (!skipRegistration) {
                MathUtilities.undoManager.registerAction(MathUtilities.Tools.UnitConverter.Models.UnitConverter.MODULE_NAME, undoActionData, redoActionData);
                this.dataToDisplay = data;
            }
        }
    }, {
        "ACTION_SET_DATA": 'set-data',
        "MODULE_NAME": 'unit-converter',
        "JSON_DATA": null,
        /**
         * @property BASEPATH
         * @static
         * @type string
         */
        "BASEPATH": ''
    });

})();
