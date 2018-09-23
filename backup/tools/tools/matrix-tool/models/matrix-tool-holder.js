(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.Model that represents Matrix Tool.
    * @class MatrixTool
    * @constructor
    * @namespace Tools.MatrixTool.Models
    * @module MatrixTool
    * @extends Backbone.Model
    */
    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.MatrixToolHolder = Backbone.Model.extend({
        /**
        * @property defaults
        * @type Object
        */
        defaults: {
            abc: null,
            resultData: [],
            useResultView: null,
            firstMatrixList: [],
            actualData: [],
            resultDataArray: null,
            saveToolState: null,
            matData: null,

            /**
            * Stores the `JSON` data that is fetched from the JSON file of unit-converter,used for display.
            * 
            * @property accJsonData
            * @type Object
            * @defaults null
            */
            accJsonData: null,
        },

        /**
        * Calculates Inverse
        * @method _calculateInverse
        * @param firstArray {Object}
        * @return {Array} Array of inverse matrix elements
        */
        _calculateInverse: function _calculateInverse(firstArray) {
            var determinant,
                rows,
                inputMatrixElements,
                identityMatrixElements,
                identityMatrix,
                rowCounter,
                colCounter,
                identityMatrixData,
                inputData,
                dataArray,
                nextElement,
                pivotIndex,
                pivotElement;

            // return if determinant is zero
            try {
                determinant = firstArray.det();
            }
            catch (exception) {
                exception.message = 'The inverse of the matrix cannot be determined as it is not a square matrix.';
                throw exception;
            }
            if (parseFloat(determinant.toFixed(2)) === 0) {
                return;
            }

            rows = firstArray.rows();
            identityMatrix = MatrixData.eye(rows);
            inputMatrixElements = firstArray.___getElements();

            identityMatrixElements = identityMatrix.___getElements();
            inputData = this._getElementsInMultiDimensionalArray(inputMatrixElements, rows, rows);
            identityMatrixData = this._getElementsInMultiDimensionalArray(identityMatrixElements, rows, rows);
            for (colCounter = 1; colCounter <= rows; colCounter++) {
                pivotElement = inputData[colCounter][colCounter];
                if (pivotElement === 0) {
                    pivotIndex = colCounter;
                    // if pivot element is equal to zero
                    do {
                        pivotIndex = (pivotIndex + 1) % (rows + 1);
                        if (inputData[pivotIndex] === undefined) {
                            nextElement = 0;
                        }
                        else {
                            nextElement = inputData[pivotIndex][colCounter];
                        }
                    } while (nextElement === 0);
                    // nextElement = inputData[++pivotIndex%(rows+1)][pivotIndex];
                    if (nextElement !== 0) {
                        inputData[colCounter] = this._addTwoRows(inputData[colCounter], inputData[pivotIndex]);
                        identityMatrixData[colCounter] = this._addTwoRows(identityMatrixData[colCounter], identityMatrixData[pivotIndex]);
                    }
                    //console.log('row' + colCounter + ' = row' + colCounter + ' + ' + 'row' + pivotIndex);
                    pivotElement = inputData[colCounter][colCounter];
                }

                // make pivot element equal to 1
                //console.log('row' + colCounter + ' = row' + colCounter + ' / ' + pivotElement);
                inputData[colCounter] = this._divideRowBy(inputData[colCounter], pivotElement);
                identityMatrixData[colCounter] = this._divideRowBy(identityMatrixData[colCounter], pivotElement);

                // make other elements of the same column equal to zero
                for (rowCounter = 1; rowCounter <= rows; rowCounter++) {
                    if (rowCounter === colCounter) {
                        continue;
                    }
                    else {
                        //console.log('row' + rowCounter + ' = row' + rowCounter + ' - (row' + colCounter + ' * row' + rowCounter + colCounter + ')');
                        identityMatrixData[rowCounter] = this._rowTransform(identityMatrixData[rowCounter], identityMatrixData[colCounter], inputData[rowCounter][colCounter]);
                        inputData[rowCounter] = this._rowTransform(inputData[rowCounter], inputData[colCounter], inputData[rowCounter][colCounter]);
                    }
                }

            }
            dataArray = this._getElementsArray(identityMatrixData, rows, rows);
            return dataArray;
        },

        /**
        * Adds two rows
        * @method _addTwoRows
        * @param row1 {Array} Row 1
        * @param row2 {Array} Row 2
        * @return {Array} Sum of two given rows
        */
        _addTwoRows: function _addTwoRows(row1, row2) {
            var rowLength = row1.length,
                rowCounter;
            for (rowCounter = 1; rowCounter < rowLength; rowCounter++) {
                row1[rowCounter] = row1[rowCounter] + row2[rowCounter];
            }
            return row1;
        },

        /**
        * Converts multidimentional matrix into array of elements
        * @method _getElementsArray
        * @param inputData {Array} two dimentional matrix data
        * @param rows {Number} Number of rows
        * @param cols {Number} Number of cols
        * @return {Array} Array of elements
        */
        _getElementsArray: function _getElementsArray(inputData, rows, cols) {
            var rowCounter,
                colCounter,
                dataArray = [];
            for (rowCounter = 1; rowCounter <= rows; rowCounter++) {
                for (colCounter = 1; colCounter <= cols; colCounter++) {
                    dataArray.push(inputData[rowCounter][colCounter]);
                }
            }
            return dataArray;
        },

        /**
        * Performs standard row transformation
        * @method _rowTransform
        * @param row2 {Array}
        * @param row1 {Array}
        * @param element {Number}
        * @return {Array} row after transformation
        */
        _rowTransform: function _rowTransform(row2, row1, element) {
            var rowLength = row1.length,
                rowCounter;
            for (rowCounter = 1; rowCounter < rowLength; rowCounter++) {
                row2[rowCounter] = row2[rowCounter] - row1[rowCounter] * element;
            }
            return row2;
        },

        /**
        * Divides row by the given element 
        * @method _divideRowBy
        * @param row {Array} Row to be divided
        * @param divider {Number} number by which row is to be divided
        * @return {Array} Row after division
        */
        _divideRowBy: function _divideRowBy(row, divider) {
            var rowLength = row.length,
                rowCounter;
            for (rowCounter = 1; rowCounter < rowLength; rowCounter++) {
                row[rowCounter] = row[rowCounter] / divider;
            }
            return row;
        },

        /**
        * _getElementsInMultiDimensionalArray returns two dimensional array of given matrix data
        * @method _getElementsInMultiDimensionalArray
        * @param {Array} Array of matrix elements
        * @param {Number} Number of rows
        * @param {Number} Number of columns
        * @return {Array} two dimensional array
        */
        _getElementsInMultiDimensionalArray: function _getElementsInMultiDimensionalArray(inputData, rows, cols) {
            var multiDimensionalData = [],
                rowCounter,
                colCounter,
                index = 1,
                noOfElements = inputData.length;
            cols = undefined;
            for (colCounter = 1; colCounter <= noOfElements; colCounter += rows) {
                multiDimensionalData[index] = [];
                for (rowCounter = 1; rowCounter <= rows; rowCounter++) {
                    multiDimensionalData[index][rowCounter] = (inputData[(rowCounter - 1) + (colCounter - 1)]);
                }
                index++;
            }
            return multiDimensionalData;
        }

    }, {
        /**
        * @property BASEPATH
        * @static
        * @type string
        */
        BASEPATH: ''
    });
}(window.MathUtilities));