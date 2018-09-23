(function () {
    'use strict';

    /**
    * Contains data required to generated Drag & Drops for number line
    *
    * @class DragDrop
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.DragDropPan = MathInteractives.Common.Player.Models.Base.extend({
       

        defaults: function () {
            return {

              

                containerId: null,

                /**
                * Holds the model of path for preloading files
                *
                * @property filePath
                * @type Object
                * @default null
                */
                filePath: null,

                /**
                * Manager class object
                *
                * @property manager
                * @type Object
                * @default null
                */
                manager: null,

                /*
                * Player instance
                * @property player
                * @default null
                */
                player: null,

                /*
                * Id prefix
                * @property idPrefix
                * @default null
                */
                idPrefix: null,

                /*
                * point of inequality true
                * @property xPoint
                * @default null
                */
                xPoint: null,


                /*
                * basePointOffset for Calculations
                * @property minPoint
                * @default -10
                */
                minPoint: -10,


                /*
                * Max Value of Number Line 
                * @property basePointOffset
                * @default 10
                */
                maxPoint: 10,


                /*
                * Sign of Equation
                * @property sign
                * @default '>'
                */
                sign: '>',


                /*
                * View of Number Line
                * @property numberLineView
                * @default null
                */
                numberLineView: null,

                /**
                * Update change in button state to notify parent element
                * @property buttonState
                * @type String
                * @default ''
                */
                buttonState: 'disabled',


                /**
                * Update change in feedback state to notify parent element
                * @property feedbackState
                * @type String
                * @default ''
                */
                feedbackState: 'show',

                
                /**
                * Unique Name for current Tab 
                * @property tabName
                * @type String
                * @default ''
                */
                tabName: '',


                /**
                * Interval Between ticks 
                * @property tickinterval
                * @type Number
                * @default 1
                */
                tickinterval: 1,


                /*
                * Circle Dropped
                * @property droppedCircleItem
                * @type String
                * @default ''
                */
                droppedCircleItem: '',

                /**
                * Equation 
                * @property equation
                * @type Object
                * @default null
                */
                equation: null,

                /**
               * Boolean signify element is dropped correctly 
               * @property correctEleDrop
               * @type Boolean
               * @default false
               */
                correctEleDrop: false
            }
        },

       

        /**
        * 
        * 
        * @method initialize
        */
        initialize: function initialize() {
            //this.setPlayer();
          
        },


        /**
        * getter for player
        */
        getPlayer: function getPlayer() {
            return this.get('player');
        },


        /**
        * setter for player
        */
        setPlayer: function setPlayer(player) {
            this.set('player', player);
        },

        /**
        * Getter function for buttonState
        * @method getButtonState
        * return {String} button state
        */
        getButtonState: function getButtonState() {
            return this.get('buttonState');
        },

        /**
        * Setter function for buttonState
        * @method setButtonState
        */
        setButtonState: function setButtonState(btnState) {
            this.set('buttonState', btnState);
        },


        /**
       * Getter function for  Feedback State
       * @method getFeedbackState
       * return {String} feedback State
       */
        getFeedbackState: function getFeedbackState() {
            return this.get('feedbackState');
        },

        /**
        * Setter function for Feedback State
        * @method setFeedbackState
        */
        setFeedbackState: function setFeedbackState(feedbackState) {
            this.set('feedbackState', feedbackState);
        },

        
        /**
       * Getter function to get boolean value of item correctly dropped
       * @method getCorrectDropValue
       * return {Boolean} of correct item drop
       */
        getCorrectDropValue: function getCorrectDropValue() {
            return this.get('correctEleDrop');
        },

        /**
        * Setter function to set boolean value of item correctly dropped
        * @method setCorrectDropValue
        */
        setCorrectDropValue: function setCorrectDropValue(correctEleDrop) {
            this.set('correctEleDrop', correctEleDrop);
        }


      
        
    });
})();