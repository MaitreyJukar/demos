(function () {
    'use strict';

    /**
    * Contains Custom Spinner data
    * @class CustomImageSpinner
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Theme2.Models.CustomImageSpinner = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * CustomSpinner ID
                * @property spinId
                * @type String
                * @defaults null
                */
                spinId: null,
                /**
                * Manager
                * @property manager
                * @type object
                * @defaults null
                */
                manager: null,
                /**
                * path for custom spinner
                * @property screenId
                * @type String
                * @default null
                */
                path: null,
                /**
                * Screen ID for custom spinner screen to be loaded
                * @property screenId
                * @type String
                * @default null
                */
                screenId: null,
                /**
                * Id Prefix for custom spinner screen to be loaded
                * @property idPrefix
                * @type String
                * @default null
                */
                idPrefix: null,
                /**
                * Height of spinner div
                * @property height
                * @type Number
                * @default 35
                */
                height: 35,
                /**
                * Width of spinner div
                * @property width
                * @type Number
                * @default 50
                */
                width: 50,
                /**
                * Value indicating text-box alignment with respect to the spinner buttons.
                * @property alignType
                * @type String
                * @default null
                */
                alignType: null,

                /**
               * Spinner Button color.
               * @property buttonFontColor
               * @type String
               * @default #FFFFFF
               */
                buttonFontColor: '#FFFFFF',

                /**
                * Button font size.
                * @property buttonFontSize
                * @type Number
                * @default 14
                */
                buttonFontSize: 14
            }
        },

        /**
        * @namespace MathInteractives.Common.Components.Models
        * @class CustomImageSpinner 
        * @constructor
        */
        initialize: function initialize() {
            //this.setButtonAccText();
        },


    },
    {
        /**
        * Constant specifying default image counter.
        * @property CUSTOM_IMAGE_STEPPER_COUNTER
        * @static
        */
        CUSTOM_IMAGE_STEPPER_COUNTER: 0,
        /**
        * Constant specifying default button width.
        * @property BUTTON_WIDTH
        * @static
        */
        BUTTON_WIDTH: 43,
        /**
        * Constant specifying default button height.
        * @property BUTTON_HEIGHT
        * @static
        */
        BUTTON_HEIGHT: 31,
        /**
        * Constant specifying Image holder default width.
        * @property IMAGE_HOLDER_WIDTH
        * @static
        */
        IMAGE_HOLDER_WIDTH: 39,
        /**
        * Constant specifying Image holder default height.
        * @property IMAGE_HOLDER_HEIGHT
        * @static
        */
        IMAGE_HOLDER_HEIGHT: 34,
        /**
        * Constant specifying default font awesome class for up button.
        * @property UP_BUTTON_FONT_AWESOME_CLASS
        * @static
        */
        UP_BUTTON_FONT_AWESOME_CLASS: 'sort-down',
        /**
        * Constant specifying default font awesome class for down button.
        * @property DOWN_BUTTON_FONT_AWESOME_CLASS
        * @static
        */
        DOWN_BUTTON_FONT_AWESOME_CLASS: 'sort-up',
    });
})();