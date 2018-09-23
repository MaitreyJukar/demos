
(function () {
    'use strict';
    /**
     * A customized Backbone.Model that represents activity area associated with a tab
     * @class ActivityAreaModel
     * @constructor
     * @namespace MathInteractives.Common.Player.Models
     * @module Common
     * @submodule Player
     * @extends Backbone.Model
     */


    MathInteractives.Common.Player.Models.ActivityArea = Backbone.Model.extend({
        /**
        * @property defaults
        * @type Object
        */
        defaults: function(){
            return {
                /*
                * @property show
                * @type boolean
                * @default null
                */
                show: null,
            }

        },

        /**
        * Initialization
        * @method initialize
        */
        initialize: function () {

        },


    }, {


    });

})();