(function () {

    /**
    * Properties required for populating Number Line.
    *
    * @class AdvanceNumberLine
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.AdvanceNumberLine = MathInteractives.Common.Player.Models.BaseInteractive.extend({

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
            * Drag and Drop on numberline 
            * @property dragDrop
            * @type Object
            * @default null
            */
            dragDrop: null,


            /**
           * Interval Between ticks 
           * @property tickinterval
           * @type Number
           * @default 1
           */
            tickinterval: 1,

            /**
          * Unique Name for current Tab 
          * @property tabName
          * @type String
          * @default ''
          */
            tabName: '',

            /**
         * Marking range 
         * @property markingRange
         * @type Object
         * @default null
         */
            markingRange: null,

         /**
         * TabIndex primary
         * @property startTabIndex
         * @type number
         * @default 400
         */
            startTabIndex: 400

        },


        /**
       * Getter function for property path
       * @method getPath
       * return {String} path of Button
       */
        getPath: function getPath() {
            return this.get('path');
        }

  
    });
})();