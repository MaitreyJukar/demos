(function () {
    'use strict';
    /**
    * Contains ratio bar's data
    * @class RatioBar
    * @construtor
    * @extends 
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.RatioBar = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: {
            /**
            * Default color of ratio bar
            * @property defaultColorOfRatioBar
            * @private
            * @type String
            * @default '#A9A9A9'
            */
            defaultColorOfRatioBar: '#A9A9A9',

            /**
            * Default antecedent value
            * @property leftSideRatioCount
            * @private
            * @type Number
            * @default 0
            */
            leftSideRatioCount: 0,

            /**
            * Default consequent value
            * @property rightSideRatioCount
            * @private
            * @type Number
            * @default 0
            */
            rightSideRatioCount: 0,

            /**
            * Color for representing the antecedent on the bar
            * @property leftSideColor
            * @private
            * @type String
            * @default '#0087A7'
            */
            leftSideColor: '#0086A7',  //ask for default color

            /**
            * Color for representing the consequent on the bar
            * @property rightSideColor
            * @private
            * @type String
            * @default '#CB3D87'
            */
            rightSideColor: '#CB3E87', //ask for default color

            /**
            * Width of the ratio bar's container/el in pixels
            * @property widthOfRatioBar
            * @private
            * @type Number
            * @default null
            */
            widthOfRatioBar: 270,

            /**
            * Height of the ratio bar's container/el in pixels
            * @property heightOfRatioBar
            * @private
            * @type Number
            * @default null
            */
            heightOfRatioBar: 15,

            /**
            * Width of the line seperating the two colors in pixel
            * @property ratioSeparatorLineWidth
            * @private
            * @type Number
            * @default 3
            */
            ratioSeparatorLineWidth: 3,

            /**
            * Color for representing the line seperating the two colors
            * @property ratioSeperatorLineColor
            * @private
            * @type String
            * @default '#222'
            */
            ratioSeperatorLineColor: '#222',

            /**
            * Width of the line seperating the quants of same color in pixels
            * @property colorQuantLineWidth
            * @private
            * @type Number
            * @default 1
            */
            colorQuantLineWidth: 1,

            /**
            * Color for representing the line seperating the quants of same color
            * @property colorQuantLineColor
            * @private
            * @type String
            * @default '#222'
            */
            colorQuantLineColor: '#222',

            /**
            * value when antecedent divided by consequent
            * @property ratioValue
            * @private
            * @type String
            * @default null
            */
            ratioValue: null,

            /**
            * width of the left side to compare with other ratio bar
            * @property leftSideWidth
            * @private
            * @type Numbar
            * @default null
            */
            leftSideWidth: null,
        },

        /**
        * Getter method for defaultColorOfRatioBar
        * @method getDefaultColorOfRatioBar
        * @returns {String} The color of the ratio bar when the ratio is null.
        */
        getDefaultColorOfRatioBar: function () {
            return this.get('defaultColorOfRatioBar');
        },

        /**
        * Setter method for defaultColorOfRatioBar
        * @method setDefaultColorOfRatioBar
        * @param value {String} The color of the ratio bar when the ratio is null.
        */
        setDefaultColorOfRatioBar: function (value) {
            this.set('defaultColorOfRatioBar', value);
        },

        /**
        * Getter method for leftSideColor
        * @method getLeftSideColor
        * @returns {String} The color used to represent the antecedent of the ratio on the ratio bar.
        */
        getLeftSideColor: function () {
            return this.get('leftSideColor');
        },

        /**
        * Setter method for leftSideColor
        * @method setLeftSideColor
        * @param value {String} The color used to represent the antecedent of the ratio on the ratio bar.
        */
        setLeftSideColor: function (value) {
            this.set('leftSideColor', value);
        },

        /**
        * Getter method for rightSideColor
        * @method getRightSideColor
        * @returns {String} The color used to represent the consequent of the ratio on the ratio bar.
        */
        getRightSideColor: function () {
            return this.get('rightSideColor');
        },

        /**
        * Setter method for rightSideColor
        * @method setRightSideColor
        * @param value {String} The color used to represent the consequent of the ratio on the ratio bar.
        */
        setRightSideColor: function (value) {
            this.set('rightSideColor', value);
        },

        /**
        * Getter method for ratioSeperatorLineColor
        * @method getRatioSeperatorLineColor
        * @returns {String} The color of the line used to seperate the two colors.
        */
        getRatioSeperatorLineColor: function () {
            return this.get('ratioSeperatorLineColor');
        },

        /**
        * Setter method for ratioSeperatorLineColor
        * @method setRatioSeperatorLineColor
        * @param value {String} The color of the line used to seperate the two colors.
        */
        setRatioSeperatorLineColor: function (value) {
            this.set('ratioSeperatorLineColor', value);
        },

        /**
        * Getter method for 'colorQuantLineColor'
        * @method colorQuantLineColor
        * @returns {String} The color of the line used to seperate same color divs representing the antecedent or consequent value.
        */
        getColorQuantLineColor: function () {
            return this.get('colorQuantLineColor');
        },

        /**
        * Setter method for colorQuantLineColor
        * @method setColorQuantLineColor
        * @param value {String} The color of the line used to seperate same color divs representing the antecedent or consequent value.
        */
        setColorQuantLineColor: function (value) {
            this.set('colorQuantLineColor', value);
        },

        /**
        * Getter method for antecedent value.
        * @method getLeftSideRatioCount
        * @returns {Number} The antecedent value.
        */
        getLeftSideRatioCount: function getLeftSideRatioCount() {
            return this.get('leftSideRatioCount');
        },

        /**
        * Setter method for antecedent value.
        * @method setLeftSideRatioCount
        * @param value {Number} The antecedent value to be set.
        */
        setLeftSideRatioCount: function setLeftSideRatioCount(value) {
            this.set('leftSideRatioCount', Number(value));
        },

        /**
        * Getter method for consequent value.
        * @method getRightSideRatioCount
        * @returns {Number} The consequent value.
        */
        getRightSideRatioCount: function getRightSideRatioCount() {
            return this.get('rightSideRatioCount');
        },

        /**
        * Setter method for consequent value.
        * @method setRightSideRatioCount
        * @param value {Number} The consequent value to be set.
        */
        setRightSideRatioCount: function setRightSideRatioCount(value) {
            this.set('rightSideRatioCount', Number(value));
        },

        /**
        * Getter method for widthOfRatioBar
        * @method getWidthOfRatioBar
        * @returns {Number} The width of the ratio bar container / view's el.
        */
        getWidthOfRatioBar: function () {
            return this.get('widthOfRatioBar');
        },

        /**
        * Setter method for WidthOfRatioBar
        * @method setWidthOfRatioBar
        * @param value {Number} The width of the ratio bar container / view's el.
        */
        setWidthOfRatioBar: function (value) {
            this.set('WidthOfRatioBar', Number(value));
        },

        /**
        * Getter method for heightOfRatioBar
        * @method getHeightOfRatioBar
        * @returns {Number} The height of the ratio bar container / view's el.
        */
        getHeightOfRatioBar: function () {
            return this.get('heightOfRatioBar');
        },

        /**
        * Setter method for heightOfRatioBar
        * @method setHeightOfRatioBar
        * @param value {Number} The height of the ratio bar container / view's el.
        */
        setHeightOfRatioBar: function (value) {
            this.set('heightOfRatioBar', Number(value));
        },

        /**
        * Getter method for ratioSeparatorLineWidth
        * @method getRatioSeparatorLineWidth
        * @returns {Number} The width of the line used to seperate the two colors.
        */
        getRatioSeparatorLineWidth: function () {
            return this.get('ratioSeparatorLineWidth');
        },

        /**
        * Setter method for ratioSeparatorLineWidth
        * @method setRatioSeparatorLineWidth
        * @param value {Number} The width of the line used to seperate the two colors.
        */
        setRatioSeparatorLineWidth: function (value) {
            this.set('ratioSeparatorLineWidth', Number(value));
        },

        /**
        * Getter method for colorQuantLineWidth
        * @method getColorQuantLineWidth
        * @returns {Number} The width of the line used to seperate same color divs representing the antecedent or consequent value.
        */
        getColorQuantLineWidth: function () {
            return this.get('colorQuantLineWidth');
        },

        /**
        * Setter method for colorQuantLineWidth
        * @method setColorQuantLineWidth
        * @param value {Number} The width of the line used to seperate same color divs representing the antecedent or consequent value.
        */
        setColorQuantLineWidth: function (value) {
            this.set('colorQuantLineWidth', Number(value))
        },

        /**
        * Getter method for ratioValue
        * @method getRatioValue
        * @returns {Number} value stored for antecedent divided by consequent.
        */
        getRatioValue: function () {
            return this.get('ratioValue');
        },

        /**
        * Setter method for ratioValue
        * @method setRatioValue
        * @param value {Number} value got when antecedent divided by consequent.
        */
        setRatioValue: function (value) {
            this.set('ratioValue', Number(value));
        },

        /**
        * Getter method for leftSideWidth
        * @method getLeftSideWidth
        * @returns {Number} width calculated for left side of ratio bar.
        */
        getLeftSideWidth: function () {
            return this.get('leftSideWidth');
        },

        /**
        * Setter method for leftSideWidth
        * @method setLeftSideWidth
        * @param value {Number} width calculated for left side of ratio bar.
        */
        setLeftSideWidth: function (value) {
            this.set('leftSideWidth', Number(value));
        },

        /**
        * Checks the antecedent & consequent values and returns the type of ratio bar to be drawn
        * @method getBarType
        * @returns {String} The type of ratio bar to be drawn
        * @private
        */
        getBarType: function getBarType() {
            var antecedent,
                consequent,
                modelClass;
            antecedent = this.getLeftSideRatioCount();
            consequent = this.getRightSideRatioCount();
            modelClass = MathInteractives.Common.Components.Models.RatioBar;
            if (antecedent && consequent) {
                return modelClass.ratioBarTypes.twoRatioBar;
            }
            else if (antecedent) {
                return modelClass.ratioBarTypes.onlyLeftRatioBar;
            }
            else if (consequent) {
                return modelClass.ratioBarTypes.onlyRightRatioBar;
            }
            else {
                return modelClass.ratioBarTypes.defaultBar;
            }
        }
    }, // end of dynamic part of model
    {
        ratioBarTypes: {
            defaultBar: '00',
            twoRatioBar: '11',
            onlyLeftRatioBar: '10',
            onlyRightRatioBar: '01'
        }
    });
})();