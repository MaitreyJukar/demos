(function () {
    'use strict';

    /**
    * Conatins DirectionText data
    *
    * @class DirectionText
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.DirectionText = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Direction Text ID
                * 
                * @property id
                * @type String
                * @default Empty string
                */
                id: '',

                /**
                * Text to be displayed in the Direction Text
                * 
                * @property text
                * @type String
                * @default null
                */
                text: null,

                /**
                * BackgroundColor
                * 
                * @property backgroundColor
                * @type String
                * @default null
                */

                backgroundColor: null,

                /**
                * textColor of the Direction text
                * 
                * @property textColor
                * @type String
                * @default White
                */
                textColor: null,

                /**
                * containerWidth
                * 
                * @property containerWidth
                * @type String
                * @default null
                */

                containerWidth: null,

                /**
                * containerHeight
                * 
                * @property containerHeight
                * @type String
                * @default null
                */

                containerHeight: null,
                /**
                * border color 
                * 
                * @property borderColor
                * @type String
                * @default null
                */

                borderColor: null,


                /**
                * accText for the Direction Text
                * 
                * @property accText
                * @type String
                * @default null
                */
                accText: null,

                /**
                * elementEl
                * 
                * @property elementEl
                * @type String
                * @default null
                */
                elementEl: null,
                /**
                * Holds the interactivity player reference
                * @property player
                * @default null
                * @private
                */
                player: null,
                /**
                * Holds the interactivity id prefix
                * @property idPrefix
                * @default null
                * @private
                */
                idPrefix: null,
                /**
                * sets whether or not to display button
                * 
                * @property showButton
                * @type boolean
                * @default null
                */
                showButton: null,
                /**
                * sets the text for the button
                * 
                * @property buttonText
                * @type String
                * @default null
                */
                buttonText: null,
                /**
                * sets the callback function of the button
                * 
                * @property clickCallback
                * @type Object
                * @default null
                */
                clickCallback: null,

                /**
                * It contain the containerId 
                * 
                * @property containerId
                * @type Object
                * @default null
                */
                containerId: null,

                /**
                * It contain the screenId
                * 
                * @property screenId
                * @type Object
                * @default null
                */
                screenId: null,

                /**
                * It contain the containment Background color
                * 
                * @property containmentBGcolor
                * @type Object
                * @default rgba(34,34,34,.2)
                */
                containmentBGcolor: 'rgba(34,34,34,.2)',

                /**
                * It contain the button Color Type
                * 
                * @property btnColorType
                * @type Object
                * @default MathInteractives.global.Theme2.Button.COLORTYPE.BLUE
                */
                btnColorType: MathInteractives.global.Theme2.Button.COLORTYPE.BLUE,


                /**
                * It contain the base class of button
                * 
                * @property btnBaseClass
                * @type String
                * @default undefined
                */
                btnBaseClass: undefined,

                /**
               * It contain the base class of tts button
               * 
               * @property ttsBaseClass
               * @type String
               * @default undefined
               */
                ttsBaseClass: undefined,


                /**
                * It contain the tabindex of hack div
                * 
                * @property tabIndex
                * @type Object
                * @default null
                */
                tabIndex: null,

                /**
                * It contain height of button
                * 
                * @property buttonHeight
                * @type Number
                * @default null
                */
                buttonHeight: null,


                /**
                * It contain class name for the direction text 
                * 
                * @property customClass
                * @type String
                * @default null
                */
                customClass: null,

                /**
                * It contains type of button
                * 
                * @property buttonType
                * @type object
                * @default null
                */
                buttonType: null,

                /**
                * It contains fa icon data for button
                * 
                * @property iconData
                * @type object
                * @default null
                */
                iconData: null,

                /**
                *It contains text position in button
                * 
                * @property buttonTextPosition
                * @type object
                * @default null
                */
                buttonTextPosition: null

            }
        }


    });
})();