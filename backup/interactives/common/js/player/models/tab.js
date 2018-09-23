
(function () {
    'use strict';

    /**
    * A customized Backbone.Model that represents single tab of player
    * @class Tab
    * @constructor
    * @namespace MathInteractives.Common.Player.Models
    * @module Common
    * @submodule Player
    * @extends Backbone.Model
    */

    MathInteractives.Common.Player.Models.Tab = Backbone.Model.extend({
        /**
        * @property defaults
        * @type Object
        */
        defaults: function () {
            return {
                active: null,
                enable: true,
                isHelpScreenShown: null,
                isHelpEnabled: true
            }
        },

        /**
        * Initialization
        * @method initialize
        */
        initialize: function () {

        }

    }, {

        /**
        * Attach events to tab items
        * @property ATTACH_EVENTS
        * @namespace MathInteractives.Common.Player.Models.Tab
        * @static
        **/
        ATTACH_EVENTS: 'attach-events'
    });

})();