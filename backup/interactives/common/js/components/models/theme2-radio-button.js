(function () {
    'use strict';

    /**
    * Conatins button data
    *
    * @class RadioButton
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.RadioButton = Backbone.Model.extend({
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
            radioButtonCollection: null,
            /**
            * The background color of entire radio button container
            * @property entireContainerBackgroundColor
            * @type String
            */
            entireContainerBackgroundColor: 'transparent',
            /**
            * The background color of entire disabled radio button container 
            * @property disabledEntireContainerBackgroundColor
            * @type String
            */
            disabledEntireContainerBackgroundColor: 'transparent',
            /**
            * The background color of entire radio button container on hover
            * @property hoverEntireContainerBackgroundColor
            * @type String
            */
            hoverEntireContainerBackgroundColor: 'transparent',
            /**
            * border color of dot container
            * @property dotContainerBorderColor
            * @type String
            */
            dotContainerBorderColor: '#A3A4A6',
            /**
            * disabled border color of dot container
            * @property disabledDotContainerBorderColor
            * @type String
            */
            disabledDotContainerBorderColor: '#C4C5C6',
            /**
            * hover border color of dot container
            * @property hoverDotContainerBorderColor
            * @type String
            */
            hoverDotContainerBorderColor: '#949595',
            /**
            * background color of dot
            * @property dotBackgroundColor
            * @type String
            */
            dotBackgroundColor: '#4C1787',
            /**
            * The tab index of radio button container
            * @property tabIndex
            * @type Number
            */
            tabIndex: null,
            /**
            * disabled background color of dot
            * @property disabledDotBackgroundColor
            * @type String
            */
            disabledDotBackgroundColor: '#B3B3B3',
            /**
            * hover background color of dot
            * @property hoverDotBackgroundColor
            * @type String
            */
            hoverDotBackgroundColor: '#4C1787'
        },

        /**
        * intialize radio button collection data
        *
        * @method initialize
        * @public
        **/
        initialize: function (radioButtonProps) {
            var namespace = MathInteractives.Common.Components.Theme2.Models.RadioButton,
                radioButtonCollectionData = null;
            this.set({ 'radioButtonCollection': new namespace.RadioButtonCollectionData() });
            radioButtonCollectionData = this.get('radioButtonCollection');
            for (var i = 0; i < radioButtonProps.elementData.length; i++) {
                radioButtonCollectionData.add(radioButtonProps.elementData[i]);
            }
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
                this.model = MathInteractives.Common.Components.Theme2.Models.RadioButton.RadioButtonData;
            }
        })
    })
})();