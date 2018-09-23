(function () {
    'use strict';
    /**
    * Properties required for populating area model player.
    * @class ConicSectionExplorerData
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Interactivities.ConicSectionExplorer.Models
    */
    MathInteractives.Interactivities.ConicSectionExplorer.Models.ConicSectionExplorerData = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: {
            /**
            * Array of help elements to be set in js file.
            * @property helpElements
            * @type Array
            * @default null
            */
            helpElements: null,

            /**
            * Current selected tab.
            * @property currentTab
            * @type Number
            * @default null
            */
            currentTab: null,

            /**
            * Plane Slop
            * @property planeSlop
            * @type Number
            * @default null
            */
            planeSlop: null,

            /**
            * Plane Offset
            * @property planeOffset
            * @type Number
            * @default null
            */
            planeOffset: null,

            /**
            * Cone Height
            * @property coneHeight
            * @type Number
            * @default null
            */
            coneHeight: null,

            /**
            * Cone Slop
            * @property coneSlop
            * @type Number
            * @default null
            */
            coneSlop: null,

            /**
            * Cone Radius
            * @property coneRadius
            * @type Number
            * @default null
            */
            coneRadius: null,

            /**
            * Height factor
            * @property heightFactor
            * @type Number
            * @default 20
            */
            heightFactor: 20,

            /**
            * Consist values of equation constants
            * @property equationConstants
            * @type Object
            * @default null
            */
            equationConstants: null,

            /**
            * Graph wrapper Model
            * @property graphWrapperModel
            * @type Backbone.Model
            * @default null
            */
            graphWrapperModel: null,

            /**
            * Graph limits
            * @property limits
            * @type Object
            * @default null
            */
            limits: {
                xLower: -5,
                xUpper: 5,
                yLower: -5,
                yUpper: 5
            },

            /**
            * Array of predefined zooming levels
            * @property zoomingFactors
            * @type Array
            * @default null
            */
            zoomingFactors: [0.5, 1.01, 5, 10, 20, 50, 100, 200.1, 500],

            /**
            * Current zooming factor
            * @property currentZoomingFactor
            * @type Number
            * @default 5
            */
            currentZoomingFactor: 5,

            /**
            * Equation Object
            * @property equationObject
            * @type Object
            * @default null
            */
            equationObject: null,

            /**
            * Point Equation Object
            * @property pointEquationObject
            * @type Object
            * @default null
            */
            pointEquationObject: null,

            /**
            * Holds the current cursor
            * @attribute cursor
            * @type string
            * @default 'pointer'
            */
            cursor: 'pointer',

            /**
            * To show pop up on try another button click
            * @attribute showPopupOnTryAnother
            * @type Boolean
            * @default null
            */
            showPopupOnTryAnother: null
        },

        /**
        * Initializes the model properties.
        * @method initialize
        */
        initialize: function () {
            this.set('helpElements', []);
            this.resetConeParameters();
        },

        /**
        * to be called on save state triggered.
        * @method getCurrentStateData
        */
        getCurrentStateData: function () {
            var result = JSON.stringify(this, this.getJSONAttributes);
            return result;
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
                case 'jsonData':
                    result = undefined;
            }

            return result;
        },

        /**
        * Calculate the radius and set the attribute
        * @method setRadius
        */
        setRadius: function () {
            var heightFactor = this.get("heightFactor"),
                coneHeight = this.get('coneHeight'),
                coneSlop = this.get('coneSlop'),
                radius = (coneHeight * heightFactor / 2) / coneSlop;
            this.set('coneRadius', radius);
        },

        /**
        * Reset the cone parameters
        * @method resetConeParameters
        */
        resetConeParameters: function () {
            this.set('planeSlop', 0);
            this.set('planeOffset', 1);
            this.set('coneHeight', 10);
            this.set('coneSlop', 1);
            this.setRadius();
        },
    });

})();