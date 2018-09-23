/* globals MathUtilities */

(function() {
    'use strict';
    if (MathUtilities.Components.ColorPicker === void 0) {
        MathUtilities.Components.ColorPicker = {};
        MathUtilities.Components.ColorPicker.Models = {};
        MathUtilities.Components.ColorPicker.Views = {};
    }
    /**
     * Contains button data
     * @class Button
     * @constructor
     * @extends Backbone.Model
     * @namespace MathUtilities.Components.ColorPicker.Models.ColorPicker
     */
    MathUtilities.Components.ColorPicker.Models.ColorPicker = Backbone.Model.extend({

        "defaults": function() {
            return {
                /**
                 * Holds the model of manager
                 * @property manager
                 * @type Object
                 * @default null
                 */
                "manager": null,

                /**
                 * Holds the initial value of color
                 * @property color
                 * @type Object
                 * @default null
                 */
                "color": null,

                /**
                 * Holds the flag which tells whether to generate an alpha slider
                 * @property createAlphaSlider
                 * @type Boolean
                 * @default true
                 */
                "createAlphaSlider": true,

                /**
                 * Holds the opacity value
                 * @property mode
                 * @default null
                 */
                "alpha": null,

                /**
                 * Holds the luminance
                 * @property mode
                 * @default null
                 */
                "luminance": null,

                "colorObj": null
            };

        },

        "getColor": function() {
            return this.get('color');
        }
    }, {
        /**
         * @attribute INITIAL_VALUES
         * @type Object
         * @default {
         */
        "INITIAL_VALUES": {
            "ALPHA": 1,
            "LUMINANCE": 100,
            "COLOR": '#000',
            "MODE": 'HEX'
        },

        /**
         * @attribute MODES
         * @type Object
         * @default {
         */
        "MODES": {
            "RGB": 'rgb',
            "HEX": 'hex',
            "HSV": 'hsv'
        }
    });
})();
