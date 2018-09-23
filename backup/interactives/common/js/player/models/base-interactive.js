(function () {
    'use strict';
    /**
    * Contains common functions of Model
    * @class BaseInteractive
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Player.Models
    **/
    MathInteractives.Common.Player.Models.BaseInteractive = MathInteractives.Common.Player.Models.Base.extend({
        /*
        * default call to function if user do not override for save/resume feature
        * @method getCurrentStateData
        * @public
        */
        getCurrentStateData: function () {
            console.log('please initialise getCurrentStateData function');
        },
    })
})();