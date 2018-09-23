(function (MathInteractives) {
    'use strict';

    var DragSelect = null,
        ClassName = null,
        CurrentObject = null,
        emNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * Model for marquee
    *
    * @class Marquee
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    **/
    emNameSpace.Marquee = MathInteractives.Common.Player.Models.BaseInteractive.extend({

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
                ignoreClass: 'ignore-marquee',

                /**
                * Tolerance while determining selected items
                * @property tolerance
                * @type Number
                **/
                tolerance: 0,

                /**
                * Z index of marquee div
                * @property zIndex
                * @type Number
                **/
                zIndex: 3,

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
                * Padding between marquee sides and elements inside
                * @property padding
                * @type Number
                **/
                paddingTop: 4,

                /**
                * Padding between marquee sides and elements inside
                * @property padding
                * @type Number
                **/
                paddingRight: 2,

                /**
                * Padding between marquee sides and elements inside
                * @property padding
                * @type Number
                **/
                paddingBottom: 2,

                /**
                * Padding between marquee sides and elements inside
                * @property padding
                * @type Number
                **/
                paddingLeft: 4,

                scrollAmt: 0,

                type: 'MARQUEE'
            };
        }
    },
    {
        // Marquee styling
        MARQUEE_STYLE_DRAGGING: {
            //'outline': 'rgb(141, 141, 141) dashed 1px',
            'border': '1px dashed rgb(141, 141, 141)',
            'border-radius': '5px',
            'background-color': 'rgba(206, 206, 206, 0.4)'
        },

        MARQUEE_STYLE_AFTER_RELEASE: {
            'border': '1px dashed rgb(228, 228, 228)',
            'border-radius': '5px',
            // Opacity removed on release
            'background-color': 'rgba(206, 206, 206, 0.4)',
        },

        FAKE_MARQUEE_STYLE: {
            DRAGGING: {
                'border': '1px dashed rgb(141, 141, 141)',
                'border-radius': '5px',
                'background-color': 'rgba(0,0,0,0)'
            }
        }

    });

    //ClassName = namespace.Common.Components.Models.DragSelect;
})(window.MathInteractives);
