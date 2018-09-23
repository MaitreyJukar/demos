(function () {
    'use strict';

    /**
    * Conatins badge data
    *
    * @class Badge
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.Badge = MathInteractives.Common.Player.Models.Base.extend({
        defaults: function () {
            return {
                /**
                * Container ID
                * 
                * @property containerId
                * @type String
                * @defaults Empty string
                */
                containerId: '',

                /**
                * ID for input/textfield
                * 
                * @property textId
                * @type String
                * @defaults Empty string
                */
                textId: '',

                /**
                * Loc text for cotainer message
                * 
                * @property messageText
                * @type String
                * @defaults Empty string
                */
                messageText: '',

                /**
                * Type of the container
                * 
                * @property type
                * @type String
                * @defaults TEXT_BOX
                */
                type: MathInteractives.Common.Components.Views.Badge.TYPES.TEXT_BOX
            }
        }
    });
})();