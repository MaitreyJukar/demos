/* globals MathUtilities */

(function() {
    'use strict';

    MathUtilities.Components.Spinner = {};

    MathUtilities.Components.Spinner.Models = {};

    MathUtilities.Components.Spinner.Views = {};

    MathUtilities.Components.Spinner.templates = {};

    MathUtilities.Components.Spinner.Models.Spinner = Backbone.Model.extend({
        "defaults": function() {
            return {
                "spinId": null,
                "minValue": -10,
                /**
                 * Upper limit of the spinning range
                 * @attribute maxValue
                 * @type Number
                 * @default 0
                 */
                "maxValue": 10,

                "title": null,
                /**
                 * Value of spinner input box
                 * @attribute defaultValue
                 * @type Number
                 * @default null
                 */
                "defaultValue": null,
                /**
                 * Step size of increment/decrement on single spin click
                 * @attribute step
                 * @type Number
                 * @default 1
                 */
                "step": 1,
                "limitTextboxView": null,
                /**
                 * A boolean indicating whether to show positive or negative sign before the spinner input box value
                 * @attribute showSign
                 * @type Boolean
                 * @default false
                 */
                "showSign": false,
                /**
                 * Update change in button state to notify parent element
                 * @attribute buttonState
                 * @type String
                 * @default 'disabled'
                 */
                "buttonState": 'disabled',
                /**
                 * Boolean indicating whether the spinner is editable
                 * @attribute isEditable
                 * @type Boolean
                 * @default false
                 */
                "isEditable": false,
                /**
                 * Precision allowed after decimal point.
                 * @attribute inputPrecision
                 * @type Number
                 * @default null
                 */
                "inputPrecision": null,
                /**
                 * Maximum charecter allowed in the input box
                 * @attribute maxCharLength
                 * @type Number
                 * @default 4
                 */
                "maxCharLength": 4,
                "inputType": null,
                /**
                 * Custom class to be applied to spinner input box.
                 * @attribute inputCustomClass
                 * @type String
                 * @default null
                 */
                "inputCustomClass": null,
                /**
                 * Text for spinner text box when its value is null/empty.
                 * @attribute defaultText
                 * @type String
                 * @default '----'
                 */
                "defaultText": '----'
            };
        }
    }, {
        /**
        * Precision value for spinner
        * @default 8
        */
        "PRECISION_VALUE": 8
    });
})();
