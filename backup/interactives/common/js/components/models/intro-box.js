
(function () {
    'use strict';

    /**
    * Conatins introbox data
    *
    * @class IntroBox
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.IntroBox = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Id of element in DOM {passed by user}
                * 
                * @property id
                * @type String
                * @defaults null
                */
                id: null,

                /**
                * Title of introduction
                * 
                * @property title
                * @type String
                * @defaults null
                */
                title: null,

                /**
                * Text to be displayed in the Introduction
                * 
                * @property text
                * @type String
                * @default null
                */
                text: null,

               /**
               * acc text of title of introduction
               * 
               * @property title
               * @type String
               * @defaults null
               */
                accTitle: null,

                /**
                * Acc text of Introduction
                * 
                * @property text
                * @type String
                * @default null
                */
                accText: null,

                /**
                * buttons array submitted from user
                *
                * structure:    buttons: [{
                *                  id: "btn-id",
                *                  type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,
                *                  text: "some text",
                *                  clickCallBack: { fnc: functionName, scope: this }
                *              }]
                *
                * @property buttons
                * @type Array
                * @default []
                */
                buttons: []
            }
        }
    });
})();