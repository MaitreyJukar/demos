(function (MathInteractives) {
    'use strict';
    var modelClass;
    /**
    * Top level model for Data Set Selection Step
    * @class DataSetSelectorModel
    * @module DataSetSelector
    * @namespace MathInteractives.Common.Interactivities.DataSetSelector.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Models.DataSetSelectorModel = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {
                /**
                * Stores no. of user data sets possible
                * 
                * @property userDataSetLimit
                * @type number
                * @default 0
                */
                userDataSetLimit: 0,

                /**
                * Stores no. of predefined sets available
                * 
                * @property noOfPredefinedSets
                * @type number
                * @default 0
                */
                noOfPredefinedSets: 0,

                /**
                *  Stores no. of sets to select from predefined sets
                * 
                * @property noOfSetsToSelect
                * @type number
                * @default 0
                */
                noOfSetsToSelect: 0,

                /**
                *  Stores reference to array of user defined data sets
                * 
                * @property userDataSets
                * @type Array
                * @default null
                */
                userDataSets: null,

                /**
                *  Stores reference to array of all data sets after sampling and shuffling.
                * 
                * @property dataSets
                * @type Array
                * @default null
                */
                dataSets: null,

                /**
                *  Whether the data sets should be shuffled or not
                * 
                * @property isShuffle
                * @type boolean
                * @default false
                */
                isShuffle: false,

                /**
                * Tootip width of help Elements.
                * Example
                * helpElemWidth: {
                *   datasetHelpWidth:100,
                *   addYourOwnHelpWidth:100,
                *   deleteHelpWidth:100
                * }
                * 
                * @property helpElemWidth
                * @type Object
                * @default {}
                */
                helpElemWidth: {},

                /**
                *  Stores reference to array of pre-defined data sets.
                * 
                * @property jsonData
                * @type Array
                * @default null
                */
                jsonData: null,

                /**
               *  Whether to show empty data sets or not
               * 
               * @property showEmptyDataSets
               * @type boolean
               * @default false
               */
                showEmptyDataSets:false
            };
        },

        /**
        * Samples and shuffles the dataSets
        * 
        * @method initialize
        */
        initialize: function initialize(options) {
            var self = this,
                sampledDataSets;

            self.set('userDataSets', self.get('dataSets'));
            if (self.get('isShuffle')) {
                sampledDataSets = _.sample(self.get('jsonData'), self.get('noOfSetsToSelect'));
            } else {
                sampledDataSets = _.first(self.get('jsonData'), self.get('noOfSetsToSelect'));
            }
            if (self.get('userDataSets') !== null) {
                sampledDataSets = sampledDataSets.concat(self.get('userDataSets'));
            }

            self.set('dataSets', new MathInteractives.Common.Components.Theme2.Collections.DataSetCollection(sampledDataSets));
        },

        /**
        * Gets data set by index in collection.
        * 
        * @method getDataSet
        * @public
        * @param {number} index data set index
        */
        getDataSet: function getDataSet(index) {
            return this.get('dataSets').getDataSetByIndex(index);
        },

        /**
        * Gets current save state data.
        * 
        * @method getCurrentStateData
        * @public
        */
        getCurrentStateData: function getCurrentStateData() {
            var self = this,
                result;

            if (self.get('dataSets') !== null) {
                self.set('userDataSets', self.get('dataSets').getUserDataSets());
            }

            result = JSON.stringify(self.toJSON(), self.getJSONAttributes);
            return $.parseJSON(result);
        },

        getHelpElementWidth: function () {
            return this.get('helpElemWidth');
        },

        /**
        * Exclude unwanted circular objects from json
        * @method getJSONAttributes
        */
        getJSONAttributes: function (key, value) {
            var result = value;
            switch (key) {
                case 'path':
                    result = undefined;
                    break;
                case 'manager':
                    result = undefined;
                    break;
                case 'player':
                    result = undefined;
                    break;
                case 'dataSets':
                    result = undefined;
                    break;
                case 'jsonData':
                    result = undefined;
                    break;
                case 'noOfSetsToSelect':
                    result = undefined;
                    break;
                case 'noOfPredefinedSets':
                    result = undefined;
                    break;
                case 'userDataSetLimit':
                    result = undefined;
                    break;
            }
            return result;
        }
    }, {
        /**
        * Compare two data sets
        * @method getChangesType
        * @param dataSet1 {Object} data set 1 to be compared.
        * @param dataSet2 {Object} data set 2 to be compared.
        * @return {Enum} change type 0 for no change, 1 for only label change, 2 for only data change, 3 for both changed.
        * @public
        */
        getChangesType: function getChangesType(dataSet1, dataSet2) {
            var thirdHeaderPresent = dataSet.tableHeader3Text && !dataSet.isSet2Empty ? true : false;
            if (JSON.stringify(dataSet1) === JSON.stringify(dataSet2)) {
                return modelClass.DATA_SET_CHNGE_TYPE.NO_CHANGE;
            }
            if (thirdHeaderPresent) {
                if (dataSet1.dataSetName !== dataSet2.dataSetName || dataSet1.tableHeader1Text !== dataSet2.tableHeader1Text || dataSet1.tableHeader2Text !== dataSet2.tableHeader2Text || dataSet1.tableHeader3Text !== dataSet2.tableHeader3Text) {
                    if (JSON.stringify(dataSet1.rowModelCollection) === JSON.stringify(dataSet2.rowModelCollection)) {
                        return modelClass.DATA_SET_CHNGE_TYPE.ONLY_LABLE_CHANGE;
                    } else {
                        return modelClass.DATA_SET_CHNGE_TYPE.LABEL_DATA_BOTH_CHANGE;
                    }
                }
                else if (JSON.stringify(dataSet1.rowModelCollection) !== JSON.stringify(dataSet2.rowModelCollection)) {
                    return modelClass.DATA_SET_CHNGE_TYPE.ONLY_DATA_CHANGE;
                }
            }
            else {
                if (dataSet1.dataSetName !== dataSet2.dataSetName || dataSet1.tableHeader1Text !== dataSet2.tableHeader1Text || dataSet1.tableHeader2Text !== dataSet2.tableHeader2Text) {
                    if (JSON.stringify(dataSet1.rowModelCollection) === JSON.stringify(dataSet2.rowModelCollection)) {
                        return modelClass.DATA_SET_CHNGE_TYPE.ONLY_LABLE_CHANGE;
                    } else {
                        return modelClass.DATA_SET_CHNGE_TYPE.LABEL_DATA_BOTH_CHANGE;
                    }
                }
                else if (JSON.stringify(dataSet1.rowModelCollection) !== JSON.stringify(dataSet2.rowModelCollection)) {
                    return modelClass.DATA_SET_CHNGE_TYPE.ONLY_DATA_CHANGE;
                }
            }
        },

        /**
        * Check if minimum rows are patially filled or not.
        * @method isMinRowPartiallyFilled
        * @param dataSet {Object} data set.
        * @param minRow {Number} minimum number of rows.
        * @return {Boolean} true if minimum number of rows are partially filled, false otherwise.
        * @public
        */
        isMinRowPartiallyFilled: function isMinRowPartiallyFilled(dataSet, minRow, columnOption) {
            var x = 'X', y = 'Y', columnCount = columnOption ? columnOption.length : 2,
                columnOption = columnOption ? columnOption : [x, y],
                rowsData = dataSet.rowModelCollection,
                count = 0;

            switch (columnCount) {
                case 2:
                    {
                        var attr1 = 'valueOf' + columnOption[0];
                        var attr2 = 'valueOf' + columnOption[1];
                        for (var i = 0; i < rowsData.length; i++) {
                            if (rowsData[i][attr1].toString().trim() !== "" || rowsData[i][attr2].toString().trim() !== "")
                            { count++; }
                            if (count == minRow) {
                                return true;
                            }
                        }
                    }
                    break;
                case 3: {
                    var attr1 = 'valueOf' + columnOption[0];
                    var attr2 = 'valueOf' + columnOption[1];
                    var attr3 = 'valueOf' + columnOption[2];
                    for (var i = 0; i < rowsData.length; i++) {
                        if (rowsData[i][attr1].toString().trim() !== "" || rowsData[i][attr2].toString().trim() !== "" || rowsData[i][attr3].toString().trim() !== "")
                        { count++; }
                        if (count == minRow) {
                            return true;
                        }
                    }
                }
                    break;
            }
            return false;
        },

        /**
        * Check if minimum rows are fully filled or not.
        * @method isMinRowFullyFilled
        * @param dataSet {Object} data set.
        * @param minRow {Number} minimum number of rows.
        * @return {Boolean} true if minimum number of rows are fully filled, false otherwise.
        * @public
        */
        isMinRowFullyFilled: function isMinRowFullyFilled(dataSet, minRow, columnOption) {
            var x = 'X', y = 'Y', columnCount = columnOption ? columnOption.length : 2,
               columnOption = columnOption ? columnOption : [x, y],
               rowsData = dataSet.rowModelCollection,
               count = 0;

            switch (columnCount) {
                case 1:
                    {
                        var attr1 = 'valueOf' + columnOption[0];
                        for (var i = 0; i < rowsData.length; i++) {
                            if (rowsData[i][attr1].toString().trim() !== "")
                            { count++; }
                            if (count === minRow) {
                                return true;
                            }
                        }
                    } break;
                case 2:
                    {
                        var attr1 = 'valueOf' + columnOption[0];
                        var attr2 = 'valueOf' + columnOption[1];
                        for (var i = 0; i < rowsData.length; i++) {
                            if (rowsData[i][attr1].toString().trim() !== "" && rowsData[i][attr2].toString().trim() !== "")
                            { count++; }
                            if (count === minRow) {
                                return true;
                            }
                        }
                    } break;
                case 3: {
                    var attr1 = 'valueOf' + columnOption[0];
                    var attr2 = 'valueOf' + columnOption[1];
                    var attr3 = 'valueOf' + columnOption[2];
                    for (var i = 0; i < rowsData.length; i++) {
                        if (rowsData[i][attr1].toString().trim() !== "" && rowsData[i][attr2].toString().trim() !== "" && rowsData[i][attr3].toString().trim() !== "")
                        { count++; }
                        if (count === minRow) {
                            return true;
                        }
                    }
                } break;
            }
            return false;
        },

        /**
        * Check if any row is patially filled.
        * @method isAnyARowPartiallyFilled
        * @param dataSet {Object} data set.
        * @return {Boolean} true if any row is partially filled, false otherwise.
        * @public
        */
        isAnyRowPartiallyFilled: function isAnyRowPartiallyFilled(dataSet, columnOption) {
            var x = 'X', y = 'Y', columnCount = columnOption ? columnOption.length : 2,
                columnOption = columnOption ? columnOption : [x, y],
                rowsData = dataSet.rowModelCollection,
                count = 0;

            switch (columnCount) {
                case 2:
                    {
                        var attr1 = 'valueOf' + columnOption[0];
                        var attr2 = 'valueOf' + columnOption[1];
                        for (var i = 0; i < rowsData.length; i++) {
                            if (rowsData[i][attr1].toString().trim() === "" || rowsData[i][attr2].toString().trim() === "") {
                                if (!(rowsData[i][attr1].toString().trim() === "" && rowsData[i][attr2].toString().trim() === "")) {
                                    return true;
                                }
                            }
                        }
                    }
                    break;
                case 3: {
                    var attr1 = 'valueOf' + columnOption[0];
                    var attr2 = 'valueOf' + columnOption[1];
                    var attr3 = 'valueOf' + columnOption[2];
                    for (var i = 0; i < rowsData.length; i++) {
                        if (rowsData[i][attr1].toString().trim() === "" || rowsData[i][attr2].toString().trim() === "" || rowsData[i][attr3].toString().trim() === "") {
                            if (!(rowsData[i][attr1].toString().trim() === "" && rowsData[i][attr2].toString().trim() === "" && rowsData[i][attr3].toString().trim() === "")) {
                                return true;
                            }
                        }
                    }
                } break;
            }
            return false;
        },

        /**
        * Trim data set by ignoring fully blank rows.
        * @method trimDataSet
        * @param dataSet {Object} data-set.
        * @param columnOption {Array} columns to be considered.
        * @return {Object} trimmed data set.
        * @public
        */
        trimDataSet: function trimDataSet(dataSet, columnOption) {
            if (dataSet.toJSON !== undefined) {
                dataSet = dataSet.toJSON();
            }
            var x = 'X', y = 'Y', columnCount = columnOption ? columnOption.length : 2,
                columnOption = columnOption ? columnOption : [x, y],
                rowsData = dataSet.rowModelCollection,
                trimmedRowsData = [];

            switch (columnCount) {
                case 1:
                    {
                        var attr1 = 'valueOf' + columnOption[0];
                        for (var i = 0; i < rowsData.length; i++) {
                            if (rowsData[i][attr1].toString().trim() !== "") {
                                trimmedRowsData[trimmedRowsData.length] = rowsData[i];
                            }
                        }
                    } break;
                case 2:
                    {
                        var attr1 = 'valueOf' + columnOption[0];
                        var attr2 = 'valueOf' + columnOption[1];
                        for (var i = 0; i < rowsData.length; i++) {
                            if (rowsData[i][attr1].toString().trim() !== "" || rowsData[i][attr2].toString().trim() !== "") {
                                trimmedRowsData[trimmedRowsData.length] = rowsData[i];
                            }
                        }
                    } break;
                case 3: {
                    var attr1 = 'valueOf' + columnOption[0];
                    var attr2 = 'valueOf' + columnOption[1];
                    var attr3 = 'valueOf' + columnOption[2];
                    for (var i = 0; i < rowsData.length; i++) {
                        if (rowsData[i][attr1].toString().trim() !== "" || rowsData[i][attr2].toString().trim() !== "" || rowsData[i][attr3].toString().trim() !== "") {
                            trimmedRowsData[trimmedRowsData.length] = rowsData[i];
                        }
                    }
                } break;
            }
            dataSet.rowModelCollection = trimmedRowsData;
            return dataSet;
        },

        /**
        * Check if any data out of range.
        * @method isAnyDataOutOfRange
        * @param dataSet {Object} data set.
        * @param data {Object} data about columns to be checked with it's range. Example : { 'X': { min: '-9999.999', max: '9999.999' }, 'Y': { min: '0', max: '9999.999' } };
        * @return {Object} editingIndex containing row(1 based) and column number(0 based). Example : 'editingIndex':{columnNumber: 0, rowNumber: 2}
        * @public
        */
        isAnyDataOutOfRange: function isAnyDataOutOfRange(dataSet, data) {
            var keys = _.keys(data),
                rowsData = dataSet.rowModelCollection,
                columnCount = keys.length,
                    retrunvalue = { rowNumber: -1, columnNumber: -1 };

            switch (columnCount) {
                case 1:
                    {
                        var attr1 = 'valueOf' + keys[0],
                            min1 = data[keys[0]].min,
                            max1 = data[keys[0]].max;
                        for (var i = 0; i < rowsData.length; i++) {
                            if (rowsData[i][attr1].toString().trim() !== "") {
                                var currentValue = parseFloat(rowsData[i][attr1]);
                                if (currentValue > max1 || currentValue < min1) {
                                    retrunvalue.rowNumber = i + 1;
                                    retrunvalue.columnNumber = 0;
                                    break;
                                }
                            }
                        }
                    } break;
                case 2:
                    {
                        var attr1 = 'valueOf' + keys[0], min1 = data[keys[0]].min, max1 = data[keys[0]].max,
                           attr2 = 'valueOf' + keys[1], min2 = data[keys[1]].min, max2 = data[keys[1]].max;
                        for (var i = 0; i < rowsData.length; i++) {
                            if (rowsData[i][attr1].toString().trim() !== "") {
                                var currentValue = parseFloat(rowsData[i][attr1]);
                                if (currentValue > max1 || currentValue < min1) {
                                    retrunvalue.rowNumber = i + 1;
                                    retrunvalue.columnNumber = 0;
                                    break;
                                }
                            }
                            if (rowsData[i][attr2].toString().trim() !== "") {
                                var currentValue = parseFloat(rowsData[i][attr2]);
                                if (currentValue > max2 || currentValue < min2) {
                                    retrunvalue.rowNumber = i + 1;
                                    retrunvalue.columnNumber = 1;
                                    break;
                                }
                            }
                        }
                    } break;
                case 3: {
                    var attr1 = 'valueOf' + keys[0], min1 = data[keys[0]].min, max1 = data[keys[0]].max,
                          attr2 = 'valueOf' + keys[1], min2 = data[keys[1]].min, max2 = data[keys[1]].max,
                          attr3 = 'valueOf' + keys[2], min3 = data[keys[2]].min, max3 = data[keys[2]].max;
                    for (var i = 0; i < rowsData.length; i++) {
                        if (rowsData[i][attr1].toString().trim() !== "") {
                            var currentValue = parseFloat(rowsData[i][attr1]);
                            if (currentValue > max1 || currentValue < min1) {
                                retrunvalue.rowNumber = i + 1;
                                retrunvalue.columnNumber = 0;
                                break;
                            }
                        }
                        if (rowsData[i][attr2].toString().trim() !== "") {
                            var currentValue = parseFloat(rowsData[i][attr2]);
                            if (currentValue > max2 || currentValue < min2) {
                                retrunvalue.rowNumber = i + 1;
                                retrunvalue.columnNumber = 1;
                                break;
                            }
                        }
                        if (rowsData[i][attr3].toString().trim() !== "") {
                            var currentValue = parseFloat(rowsData[i][attr3]);
                            if (currentValue > max3 || currentValue < min3) {
                                retrunvalue.rowNumber = i + 1;
                                retrunvalue.columnNumber = 2;
                                break;
                            }
                        }
                    }
                } break;
            }
            return retrunvalue;
        },

        /**
       * Check if character limit for for data.
       * @method checkCharacterLimitExceed
       * @param dataSet {Object} data set.
       * @param columnCount {Number} Number of columns in dataset.
       * @param maxDataSetnameChar {Number} Character limit for dataset name.
       * @param maxColumnHeaderChar {Number} Character limit for column header.
       * @param maxLabelChar {Number} Character limit for label.
       * @param maxXAxisLabelChar {Number} Character limit for x-axis label.
       * @return {Object} editingIndex containing index(1 based) row number(1 based) and column number(0 based). (index:1-dtaset name,2-column header, 3-label, 4-x-axis label) Example : 'editingIndex':{columnNumber: 0, rowNumber: 2}
       * @public
       */
        checkCharacterLimitExceed: function checkCharacterLimitExceed(dataSet, columnCount, maxDataSetnameChar, maxColumnHeaderChar, maxLabelChar, maxXAxisLabelChar) {
            var returnvalue = { index: -1, rowNumber: -1, columnNumber: -1 },
                rowCount = dataSet.rowModelCollection.length;
            if (maxDataSetnameChar !== -1) {
                if (dataSet.dataSetName.length > maxDataSetnameChar) {
                    returnvalue.index = 1;
                    return returnvalue;
                }
            }
            if (maxColumnHeaderChar !== -1) {
                var i, attr;
                for (i = 0; i < columnCount; i++) {
                    attr = 'tableHeader' + (i + 1) + 'Text';
                    if (dataSet[attr].length > maxColumnHeaderChar) {
                        returnvalue.index = 2;
                        returnvalue.rowNumber = 0;
                        returnvalue.columnNumber = i;
                        return returnvalue;
                    }
                }
            }
            if (maxLabelChar !== -1) {
                var i, attr = 'valueOfX', rowsData = dataSet.rowModelCollection;
                for (i = 0; i < rowCount; i++) {
                    if (rowsData[i][attr].length > maxLabelChar) {
                        returnvalue.index = 3;
                        returnvalue.rowNumber = i + 1;
                        returnvalue.columnNumber = 0;
                        return returnvalue;
                    }
                }
            }
            if (maxXAxisLabelChar !== -1) {
                if (dataSet.xAxisLabel.length > maxXAxisLabelChar) {
                    returnvalue.index = 4;
                    return returnvalue;
                }
            }
        },

        DATA_SET_CHNGE_TYPE: {
            NO_CHANGE: 0,
            ONLY_LABLE_CHANGE: 1,
            ONLY_DATA_CHANGE: 2,
            LABEL_DATA_BOTH_CHANGE: 3
        },

        /**
        * Default width of help elements
        * @property DATA_SET_HELP_ELEM_WIDTH
        * @static
        */
        DATA_SET_HELP_ELEM_WIDTH: {
            DATA_SET_HELP_WIDTH: 130,
            ADD_YOUR_OWN_HELP_WIDTH: 230
        }
    });
    modelClass = MathInteractives.Common.Components.Theme2.Models.DataSetSelectorModel;
})(window.MathInteractives);
