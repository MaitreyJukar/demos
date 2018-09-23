
(function() {
    'use strict';
    /**
    * A customized Backbone.Model that represents header of player
    * @class HeaderModel
    * @constructor
    * @namespace MathInteractives.Common.Player.Models
    * @module Common
    * @submodule Player
    * @extends Backbone.Model
    */


    MathInteractives.Common.Player.Models.Header = Backbone.Model.extend({

        /**
        * @property defaults
        * @type Object
        */
        defaults: function() {
            return {
                // All available buttons for player header
                buttons: {
                    theme1: [{ id: 'help-btn' }, { id: 'screen-shot-btn' }, { id: 'save-btn' }],
                    theme2: [{ id: 'mute-btn' }, { id: 'unmute-btn' }, { id: 'pop-out-btn' }, { id: 'screen-shot-btn' }, { id: 'help-btn' }, { id: 'save-btn'}]
                },
                
                
                //Temporary hiding of buttons for theme-1 on Zeus interactives on all pages that they appear on the site.
                //buttons: {
                //    theme1: [{ id: 'help-btn' }],
                //    theme2: [{ id: 'mute-btn' }, { id: 'unmute-btn' }, { id: 'pop-out-btn' }, { id: 'screen-shot-btn' }, { id: 'help-btn' }, { id: 'save-btn' }]
                //},

                currentTemplate: null,
                interactiveModel: null,
                helpScreenShowCallback: null,
                helpScreenCloseCallback: null,
                /*
                * Stores a boolean whether sound has been muted.
                * @property isMuted
                * @default false
                * @type Boolean
                */
                isMuted: false,
                isPoppedOut: false
            }
        },

        helpText: "This feature is currently unavailable.",

        /**
        * Initialization
        * @method initialize
        */
        initialize: function() {

        }


    }, {
        template: null
    });

})();