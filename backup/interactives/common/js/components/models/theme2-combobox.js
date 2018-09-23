(function () {
    'use strict';
    /**
    * Contains Combobox data
    *
    * @class Combobox    
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.Combobox = Backbone.Model.extend({
        

        defaults: {
            /**
            * Holds the id prefix of this model
            * @attribute idPrefix
            * @private
            * @type Object
            * @default null
            */
            idPrefix: null,
            /**
            * Holds object of player 
            * @attribute player
            * @private
            * @type Object
            * @default null 
            */
            player: null,
            /**
            * Holds object of manager
            * @attribute manager
            * @private
            * @type Object
            * @default null 
            */
            manager: null,
            /**
            * Holds the model of path for preloading files
            * @attribute path
            * @private
            * @type Object
            * @default null
            */
            path: null,
            /**
            * Enable disable indicator for combobox
            * @attribute bEnabled
            * @private
            * @type Boolean
            * @default true
            */
            bEnabled: true,

            /**
            * Screen Id for combobox
            * @attribute screenId
            * @private
            * @type String
            * @default null
            */
            screenId: null,

            /**
            * Container ID for combobox
            * @attribute containerId
            * @private
            * @type String
            * @default null
            */
            containerId: null,

            /**
            * Specifies the color of border
            * @attribute borderColor
            * @private
            * @type String
            * @default '#aaa'
            */
            borderColor: '#aaa',

            /**
            * Stores the option list for the combobox
            * @attribute options
            * @private
            * @type Object
            * @default ['JavaScript', 'jQuery', 'Backbone', 'Angular']
            */
            options: ['JavaScript', 'jQuery', 'Backbone', 'Angular'],

            /**
            * Selected option from available options in combobox
            * @attribute selectedOptionData
            * @private
            * @type String
            * @default Null
            */
            selectedOptionData: null,

            /**
            * Holds selected options index within option array
            * @attribute selectedOptionIndex
            * @private
            * @type Number
            * @default Null
            */
            selectedOptionIndex: null,

            /**
            * Holds default Option type of combobox
            * @attribute defaultOptionType
            * @private
            * @type Number
            * @default Null
            */
            defaultOptionType: null,

            /**
            * Stores the text that will be displayed first time in combobox if defaultOptionType is set to DEFAULT_TEXT
            * @attribute defaultText
            * @private
            * @type String
            * @default Empty string
            */
            defaultText: '',

            /**
            * Stores the text of option that will be selected if defaultOptionType is set to PASSED_OPTION_TEXT
            * @attribute defaultOptionText
            * @private
            * @type String
            * @default Null
            */
            defaultOptionText: null,

            /**
            * Stores the index of option that will be selected if defaultOptionType is set to PASSED_OPTION_INDEX
            * @attribute defaultOptionIndex
            * @private
            * @type Number
            * @default 0
            */
            defaultOptionIndex: 0,

            /**
            * Holds custom combobox template string
            * And it gets append to combobox if isCustomComboBoxTemplate attribute is true
            * @attribute customComboBoxTemplate
            * @private
            * @type String
            * @default null
            */
            customComboBoxTemplate: null,

            /**
            * Indicates whether to append custom template to combobox or not
            * @attribute isCustomComboBoxTemplate
            * @private
            * @type Boolean
            * @default null
            */
            isCustomComboBoxTemplate: null,

            /**
           * Stores custom class for down state of dropdown option.
           * @attribute dropDownDownStateClass
           * @private
           * @type String
           * @default null
           */
            dropDownDownStateClass: null,

            /**
            * Bool that stores whether multiple selection is allowed in the combo-box (In this case drop down will not close unless clicked outside)
            * @attribute hasMultipleSelection
            * @private
            * @type Boolean
            * @default null
            */
            hasMultipleSelection: null,

            /**
            * Stores whether selection should be changed on pressing arrow key. Selection will not be changed if this is set to false
            * @attribute handleArrowKeys
            * @private
            * @type Boolean
            * @default true
            */
            handleArrowKeys: true

        },

        /**
        * Set attributes of model
        *
        * @namespace MathInteractives.Common.Components.Models
        * @class Combobox 
        * @constructor
        */
        initialize: function initialize() {
            if (this.get('defaultOptionType') === null) {
                this.set('defaultOptionType', MathInteractives.Common.Components.Theme2.Models.Combobox.DEFAULT_OPTION_TYPES.FIRST_OPTION);
            }
        },

        /**
        * Adds options to the combo box
        *
        * @method addOptions
        * @public
        * @param option{String} The option that has to be added
        * @param index{Number} The index at which the option has to be inserted        
        */
        addOptions: function (option, index) {
            var newOptions, originalOptions;

            newOptions = [];
            originalOptions = this.get('options');
            $.merge(newOptions, originalOptions)
            if (!index) {
                newOptions.push(option);
            }
            else {
                newOptions.splice(index, 0, option);
            }

            this.set('options', newOptions);

            return;
        },

        /**
        * Removes all the options from the combo box
        *
        * @method removeAllOptions
        * @public
        */
        removeAllOptions: function () {
            this.set('options', []);
            return;
        },

        /**
        * Removes option at a particular index
        *
        * @method removeIndexAt
        * @public
        * @param index{Number} the index from which the option has to be removed        
        */
        removeIndexAt: function (index) {
            var newOptions, originalOptions;

            newOptions = [];
            originalOptions = this.get('options');

            $.merge(newOptions, originalOptions)

            newOptions.splice(index, 1);
            this.set('options', newOptions);

            return;
        }


    }, {
        /**
        * The default option types
        * @property DEFAULT_OPTION_TYPES
        * @static
        * @type Object
        */
        DEFAULT_OPTION_TYPES: {
            /**
            * The first option type
            * @property FIRST_OPTION
            * @static
            * @type Number
            * @default 1
            */
            FIRST_OPTION: 1,
            /**
            * The default text
            * @property DEFAULT_TEXT
            * @static
            * @type Number
            * @default 2
            */
            DEFAULT_TEXT: 2,
            /**
            * The passed option text
            * @property PASSED_OPTION_TEXT
            * @static
            * @type Number
            * @default 3
            */
            PASSED_OPTION_TEXT: 3,
            /**
            * The passed option index
            * @property PASSED_OPTION_INDEX
            * @static
            * @type Number
            * @default 4
            */
            PASSED_OPTION_INDEX: 4
        }
    });

})();



