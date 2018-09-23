(function () {

    /**
    * Properties required for populating Number Line.
    *
    * @class NumberLine
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.NumberLine = MathInteractives.Common.Player.Models.Base.extend({

        defaults: {

            /**
            * Manager class object
            *
            * @property manager
            * @type Object
            * @default null
            */
            manager: null,

            /**
            * Reference to player object
            * @property player
            * @type Object
            * @default null
            */
            player: null,

            /**
           * Container Id for number Line
           * @property containerId
           * @type String
           * @default null
           */
            containerId: '',

            /**
            * Minimum value on the number line
            * @property lineMinValue
            * @type Number
            * @default -10
            */
            lineMinValue: -10,

            /**
            * Maximum value on the number line
            * @property lineMaxValue
            * @type Number
            * @default 10
            */
            lineMaxValue: 10,


            /**
            * Line Width
            * @property lineWidth
            * @type Number
            * @default 400
            */
            lineWidth: 400,


            /**
            * path for number line
            * @property path
            * @type String
            * @default null
            */
            path: null,

 
            /**
            * Id Prefix
            * @property idPrefix
            * @type String
            * @default null
            */
            idPrefix: '',

             /**
            * Tick Mark Height
            * @property tickHeight
            * @type Number
            * @default 11
            */
            tickHeight: 11,

            /**
            * Center Tick Height
            * @property centerTickHeight
            * @type Number
            * @default 21
            */
            centerTickHeight: 21,

            /**
            * Tab Name 
            * @property tabName
            * @type String
            * @default null
            */
            tabName: '',

            /**
            * Elements on number line are clickable/not
            * @property clickableElements
            * @type Boolean
            * @default ''
            */
            clickableElements: false,

            /**
            * Boolean to add Slider handle on number line
            * @property sliderHandleOnArrowHead
            * @type Boolean
            * @default false
            */
            sliderHandleOnArrowHead: false,
            /**
            * Boolean to add Slider on number line
            * @property slider
            * @type Boolean
            * @default false
            */
            slider: false,

            /**
            * Updated Slider Value is set in sliderValue
            * @property sliderValue
            * @type Number
            * @default 1
            */
            sliderValue: 1,

            /**
           * Drag Drop Object
           * @property dragDrop
           * @type Object
           * @default null
           */
            dragDrop: null,

            /**
            * Equation 
            * @property equation
            * @type Object
            * @default null
            */
            equation: null,


            /**
            * Current Dot Item type selected
            * @property currentDotItemType
            * @type String
            * @default ""
            */
            currentDotItemType: '',

            /**
            * TabIndex primary
            * @property tabIndex
            * @type number
            * @default null
            */
            tabIndexMargin: 400,

        },


        /**
       * Getter function for property path
       * @method getPath
       * return {String} path of Button
       */
        getPath: function getPath() {
            return this.get('path');
        },


        /**
       * Getter function to get slider value
       * @method getSliderValue
       * return {String} slider value 
       */
        getSliderValue: function getSliderValue() {
            return this.get('sliderValue');
        },

        /**
        * Setter function to set slider value
        * @method setSliderValue
        */
        setSliderValue: function setSliderValue(sliderVal) {
            this.set('sliderValue', sliderVal);
        },

        /**
      * Getter function for currentDotItemType
      * @method getCurrentDotItemType
      * return {String} dot item type filled/unfilled
      */
        getCurrentDotItemType: function getCurrentDotItemType() {
            return this.get('currentDotItemType');
        },

        /**
        * Setter function for currentDotItemType
        * @method setCurrentDotItemType
        */
        setCurrentDotItemType: function setCurrentDotItemType(dotItemType) {
            this.set('currentDotItemType', dotItemType);
        },


  
    });
})();