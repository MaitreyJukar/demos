(function () {
    'use strict';

    /**
    * Conatins button data
    *
    * @class RadioButton
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.RadioButton = MathInteractives.Common.Player.Models.Base.extend({
        defaults: {
            /**
            * Holds the model of path for preloading files
            *
            * @property filePath
            * @type Object
            * @default null
            */
            filePath: null,
            /**
            * The id of the screen that contains the radio button elements
            * @property screenID
            * @type String
            */
            screenID: null,
            /**
            * The id of the div in which the radio buttons have to be placed
            * @property id
            * @type String
            */
            id: null,
            /**
            * Holds the interactivity id prefix
            * @property idPrefix
            * @default null
            * @private
            */
            idPrefix: null,
            /**
            * Holds the interactivity manager reference
            * @property manager
            * @default null
            * @private
            */
            manager: null,
            /**
            * The direction in which the radio buttons should be aligned
            * @property direction
            * @type String
            */
            direction: 'vertical',
            /**
            * The gap between radio button containers
            * @property gapBetweenRadioButtonContainers
            * @type Number
            */
            gapBetweenRadioButtonContainers: null,
            /**
            * Whether the radio buttons are enabled
            * @property enabled
            * @type Boolean
            */
            enabled: true,
            /**
            * Collection of all the radio button properties
            * @property radioButtonCollection
            * @type Backbone.Collection
            */
            radioButtonCollection: null
        },
        initialize: function () {
            this.set({ 'radioButtonCollection': new MathInteractives.Common.Components.Models.RadioButton.RadioButtonCollectionData() });
        }
    }, {
        /**
        * Properties for each radio button container
        * @class RadioButtonData
        * @constructor
        * @extends Backbone.Model
        * @static
        */
        RadioButtonData: Backbone.Model.extend({
            defaults: {
                /**
                * The id to be assigned to the radio-button div
                * @property elementID
                * @type String
                */
                elementID: null,
                /**
                * The text to be displayed in the label corresponding to the radio button
                * @property text
                * @type String
                */
                text: null,
                /**
                * The value radio button
                * @property value
                * @type String
                */
                value: null,
                /**
                * Default selection of a radio button(not currently selected or not)
                * @property selected
                * @type Boolean
                */
                selected: false,
                /**
                * Width of the label accompanying the radio button (optional)
                * @property labelWidth
                * @type Number
                */
                labelWidth: null
            }
        }),
        /**
        * Properties for collection od radio button containers
        * @class RadioButtonCollectionData
        * @constructor
        * @extends Backbone.Collection
        * @static
        */
        RadioButtonCollectionData: Backbone.Collection.extend({
            initialize: function () {
                this.model = MathInteractives.Common.Components.Models.RadioButton.RadioButtonData;
            }
        })
    })
})();