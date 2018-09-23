(function () {
    'use strict';
    /**
    * Holds the business logic and data of the view
    * @class EmptyModal 
    * @extends MathInteractives.Common.Components.Theme2.Models.BaseInteractive
    * @submodule MathInteractives.Common.Components.Theme2.Models
    * @namespace MathInteractives.Common.Components.Theme2
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Models.Feedback = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Player object
                * @property player
                * @type Object
                * @default null
                **/
                player: null,

                /**
                * Manager object
                * @property manager
                * @type Object
                * @default null
                **/
                manager: null,

                /**
                * File-path object
                * @property filePath
                * @type Object
                * @default null
                **/
                filePath: null,

                /**
                * Id prefix of the interactivity
                * @property idPrefix
                * @type String
                * @default null
                **/
                idPrefix: null,

                /**
                * Id of the container which holds feedback.
                * @property feedbackContainerID
                * @type String
                * @default null
                **/
                feedbackContainerID: null,

                /**
                * Header Text to be displayed.
                * @property headerText
                * @type String
                * @default null
                **/
                headerText: null,

                /**
                * Acc Header Text to be read.
                * @property accHeaderText
                * @type String
                * @default null
                **/
                accHeaderText: null,

                /**
                * Text to be displayed.
                * @property text
                * @type String
                * @default null
                **/
                text: null,

                /**
                * Acc text to be read.
                * @property accText
                * @type String
                * @default null
                **/
                accText: null,

                /**
                * Tab index for the text.
                * @property tabIndex
                * @type Integer
                * @default null
                **/
                tabIndex: null,

                /**
                * Acc text to be read for button.
                * @property buttonAccText
                * @type String
                * @default null
                **/
                buttonAccText: null,
               
                ttsColorType:null,

                /**
                * Array of objects which are properties of the buttons necessary in the feedback
                * @property buttonPropertiesArray
                * @type Array
                * @default null
                **/
                buttonPropertiesArray: [],
            }
        },

        /**
        * @namespace MathInteractives.Common.Components.Theme2.Models
        * @method intialize
        * @constructor
        */
        initialize: function initialize() {

        },

        /**
        * Gets a player object
        * @method getPlayer
        * @return {Object} Player object
        * @public
        */
        getPlayer: function getPlayer() {
            return this.get('player');
        },

        /**
        * Gets a manager object
        * @method getManager
        * @return {Object} Manager object
        * @public
        */
        getManager: function getManager() {
            return this.get('manager');
        },

        /**
        * Gets a file-path object
        * @method getFilePath
        * @return {Object} File-path object
        * @public
        */
        getFilePath: function getFilePath() {
            return this.get('filePath');
        },

        /**
        * Gets an id prefix of the interactivity
        * @method getIdPrefix
        * @return {String} Id prefix of the interactivity
        * @public
        */
        getIdPrefix: function getIdPrefix() {
            return this.get('idPrefix');
        },

        /**
        * Gets feedbackContainerID
        * @method getFeedbackContainerID
        * @return {String} feedbackContainerID
        * @public
        */
        getFeedbackContainerID: function getIdPrefix() {
            return this.get('feedbackContainerID');
        }
    });
})(window.MathInteractives);