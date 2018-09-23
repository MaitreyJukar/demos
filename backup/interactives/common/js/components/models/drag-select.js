(function (namespace) {

    var DragSelect = null,
        ClassName = null,
        CurrentObject = null;

    /**
    * Model for marquee
    *
    * @class DragSelect
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Common.Components.Models
    **/
    namespace.Common.Components.Models.DragSelect = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {

            return {
                /**
                * Stores ID prefix of the activity
                * @property idPrefix
                * @default null
                **/
                idPrefix: null,

                /**
                * Stores manager instance
                * @property manager
                * @default null
                **/
                manager: null,

                /**
                * Stores filepath 
                * @property filePath
                * @default null
                **/
                filePath: null,

                /**
                * Stores player instance
                * @property player
                * @default null
                **/
                player: null,

                /**
                * Marquee parent
                * @property marqueeContainer
                * @type Object/ String
                **/
                marqueeContainer: null,

                /**
                * Class of divs allowed for marquee selection
                * @property selectorClass
                * @type String
                **/
                selectorClass: null,

                /**
                * The class of divs to be ignored
                * @property ignoreClass
                * @type String
                **/
                ignoreClass: null,

                /**
                * Tolerance while determining selected items
                * @property tolerance
                * @type Number
                **/
                tolerance: 0.5,

                /**
                * Z index of marquee div
                * @property zIndex
                * @type Number
                **/
                zIndex: 10,

                /**
                * Marquee offset w.r.t its parent
                * @property marqueeDefaultOffset
                * @default Object
                **/
                marqueeDefaultOffset: { top: 0, left: 0 },

                /**
                * Offset of items w.r.t marquee's parent
                * @property itemsDefaultOffset
                * @type Object
                **/
                itemsDefaultOffset: { top: 0, left: 0 },

                /**
                * Whether marquee is implemented for canvas
                * @property isForCanvas
                * @type Boolean
                **/
                isForCanvas: false,

                /**
                * Array of paper objects selectable by marquee
                * @property paperObjects
                * @type Array
                **/
                paperObjects: [],

                /**
                * Padding between marquee sides and elements inside
                * @property padding
                * @type Number
                **/
                padding: 5
            }
        }
    },
    {
        // Marquee styling
        MARQUEE_STYLE_DRAGGING: {
            'outline': 'rgb(141, 141, 141) dashed 1px',
            'background-color': 'rgba(206, 206, 206, 0.4)'
        },

        MARQUEE_STYLE_AFTER_RELEASE: {
            'outline': 'rgb(141, 141, 141) dashed 1px',
            // Opacity removed on release
            'background-color': 'rgb(206, 206, 206)'
        }

    });

    ClassName = namespace.Common.Components.Models.DragSelect;
})(MathInteractives);