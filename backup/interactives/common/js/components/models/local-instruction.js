
(function () {
    'use strict';

    /**
    * Conatins localInstruction data
    * @class LocalInstruction
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.LocalInstruction = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * LocalInstruction ID
                * @property id
                * @type String
                * @defaults Empty string
                */
                id: '',

                /**
                * Screen ID for LocalInstruction screen to be loaded
                * @property screenId
                * @type String
                * @default null
                */
                screenId: null
            }
        },

        /**
        * Getter function for property id
        * @method getId
        * return {String} The DOM id of local instruction to be displayed
        */
        getId: function getId() {
            return this.get('id');
        },

        /**
        * Setter function for property id
        * @method setId
        * param value {String} The DOM id of local instruction to be displayed
        */
        setId: function setId(value) {
            this.set('id', value);
        },

        /**
        * Getter function for property screenId
        * @method getScreenId
        * return {String} The screen ID of local instruction screen to be loaded
        */
        getScreenId: function getScreenId() {
            return this.get('screenId');
        },

        /**
        * Setter function for property screenId
        * @method setScreenId
        * param value {String} The screen ID of local instruction screen to be loaded
        */
        setScreenId: function setScreenId(value) {
            this.get('screenId', value);
        }
    });
})();