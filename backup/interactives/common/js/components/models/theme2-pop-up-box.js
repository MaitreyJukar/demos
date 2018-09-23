(function () {
    'use strict';

    /**
    * Holds the business logic and data of the view
    * @class Theme2PopUp
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @submodule MathInteractives.Common.Components.Theme2.Models.Theme2PopUp
    * @namespace MathInteractives.Common.Components.Theme2.Models
    * @constructor
    */

    MathInteractives.Common.Components.Theme2.Models.Theme2PopUp = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                * Title text to be displayed in the pop-up                
                * @property title
                * @type String
                * @default null
                */
                title: null,
                /**
                * Title text to be read in accessibility
                * 
                * @property accTitle
                * @type String
                * @default null
                */
                accTitle: null,
                /**
                * Text to be displayed in the pop-up
                * 
                * @property text
                * @type String
                * @default null
                */
                text: null,
                /**
                * Text to be read in accessibility
                * 
                * @property accText
                * @type String
                * @default null
                */
                accText: null,
                /**
                * Boolean to determine if popup contains TTS
                * 
                * @property containsTts
                * @type Boolean
                * @default true
                */
                containsTts: true,
                /**
                * Stores buttons to be generated as per values specification
                * @property customButtons
                * @type {Object}
                * @default []
                */
                buttons: [],
                /**
                * Function to be called when pop-up is closed in given scope 
                * @property closeCallback
                * @type {Object}
                * @default null
                */
                closeCallback: null,

                /**
                * Function to be called when pop-up is shown in given scope 
                * @property showCallback
                * @type {Object}
                * @default null
                */
                showCallback: null,
                /**
                * hold the image details.
                * 
                * @property backgroundImage
                * @type object
                * @default null
                */
                backgroundImage: null,
                /**
                * hold the background image background position.
                * 
                * @property backgroundImage
                * @type string
                * @default null
                */
                backgroundImageBackgroundPosition: null,

                /**
                * hold the image details for the foreground image.
                * 
                * @property foregroundImage
                * @type object
                * @default null
                */
                foregroundImage: null,
                /**
                * hold the foreground image background  position.
                * 
                * @property foregroundImage
                * @type string
                * @default null
                */
                foregroundImageBackgroundPosition: null,

                /**
                * class to be applied to body text
                * 
                * @property bodyTextColorClass
                * @type class
                * @default null
                */
                bodyTextColorClass: null,
                /**
                * class to be applied to title text
                * 
                * @property titleTextColorClass
                * @type class
                * @default null
                */
                titleTextColorClass: null,
                /**
                * holds the width of popup dialogue
                * @property width
                * @type integer 
                * @default null
                */
                width: null,
                /**
                * holds the type of popup
                * @property popUpType
                * @type string 
                * @default null
                */
                type:null,
                /**
                * holds the score value
                * @property score
                * @type string 
                * @default null
                */
                score:null,

                /**
                * holds text for display score
                * @property scoreDisplayChild
                * @type string 
                * @default null
                */
                scoreDisplayChild: null,
                /**
                * foregound image id
                *
                * @property imageOnForegroundId
                * @type String     
                * @default null
                */
                imageOnForegroundId: null,
                /**
                * image position on foreground top and left
                *
                * @property imagePositionOnForeground
                * @type String     
                * @default { left: null, top: null }
                */
                imagePositionOnForeground: { left: null, top: null },
                /**
                * foreground image sprite position
                *
                * @property imagePositionOnForeground
                * @type String     
                * @default { left: null, top: null }
                */
                imageOnForegroundSpritePosition: { left: null, top: null },
                /**
                * Text on foreground image
                *
                * @property textOnForegroundImg
                * @type String     
                * @default null
                */
                textOnForegroundImg: null,
                /**
                * height and width of foreground img
                *
                * @property imageOnForegroundDimension
                * @type String     
                * @default {height: null, width: null}
                */
                imageOnForegroundDimension: {height: null, width: null},

                  /**
                * Define the tooltip type for button
                * @property tooltipColorType
                * @type Object
                * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL
                */
                   tooltipColorType: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL
        }
    }


});

})();