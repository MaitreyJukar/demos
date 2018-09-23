(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.ColorPicker) {
        return;
    }
    /**
     * Conatins button data
     *
     * @class Button
     * @construtor
     * @extends Backbone.Model
     * @namespace MathInteractives.Common.Components.Models
     */
    MathInteractives.Common.Interactivities.ShapeSlicer.Models.ColorPicker = MathInteractives.Common.Player.Models.Base.extend({

        defaults: function () {
            return {
                /**
                 * Button ID
                 *
                 * @property id
                 * @type String
                 * @defaults Empty string
                 */
                idPrefix: '',

                /**
                 * Holds the model of player
                 *
                 * @property player
                 * @type Object
                 * @default null
                 */
                player: null,

                /**
                 * Holds the model of manager
                 *
                 * @property manager
                 * @type Object
                 * @default null
                 */
                manager: null,

                /**
                 * Holds the model of filePath
                 *
                 * @property filePath
                 * @type Object
                 * @default null
                 */
                filePath: null,

                /**
                 * Holds the initial value of color
                 *
                 * @property color
                 * @type Object
                 * @default null
                 */
                color: null,

                /**
                 * Holds the mode of color code
                 *
                 * @property mode
                 * @default null
                 */
                mode: null,
                /**
                 * Holds the opacity value
                 *
                 * @property mode
                 * @default null
                 */
                alpha: null,

                /**
                 * Holds the luminance
                 *
                 * @property mode
                 * @default null
                 */
                luminance: null,

                /**
                 * Holds the position of color picker
                 *
                 * @property position
                 * @type Object
                 * @default null
                 */
                position: null,

                eventManager: null

            };

        },
        getColor: function () {
            return this.get('color');
        }
    }, {
        /**
         * [[Description]]
         * @attribute INITIAL_VALUES
         * @type Object
         * @default {
         */
        INITIAL_VALUES: {
            ALPHA: 1,
            LUMINANCE: 100,
            COLOR: '#000',
            MODE: 'HEX'
        },

        /**
         * [[Description]]
         * @attribute MODES
         * @type Object
         * @default {
         */
        MODES: {
            RGB: 'rgb',
            HEX: 'hex',
            HSV: 'hsv'
        }
    });
})();
