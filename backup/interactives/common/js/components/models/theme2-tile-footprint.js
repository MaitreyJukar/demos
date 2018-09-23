(function () {
    'use strict';
    /**
    * Contains Footprint data
    * @class Footprint
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.Footprint = Backbone.Model.extend({
        defaults: {
            /**
            * Footprint height
            * @property height
            * @type Number
            * @default null
            */
            height: null,
            /**
            * Footprint width
            * @property width
            * @type Number
            * @default null
            */
            width: null,
            /**
            * Specifies the color of Footprint tile
            * @property color
            * @type Object
            * @default null
            */
            color: null,
            /**
            * Specifies the color of boxshadow
            * @property boxShadowColor
            * @type Object
            * @default null
            */
            boxShadowColor: null,

            /**
            *Image id of Footprint tile
            * @property imageID
            * @type String
            * @default null
            */
            imageId: null,
            /**
            * Specifies the color of border
            * @property borderColor
            * @type Object
            * @default null
            */
            borderColor: null,
            /**
            * Specifies the text to be displayed in the footprint
            * @property text
            * @type String
            * @default null 
            */
            text: null

        },
        /**
        * Initializes the model properties
        * @public
        * @method initialize
        **/
        initialize: function () {
            var footPrintClass = MathInteractives.Common.Components.Theme2.Models.Footprint;
            if (typeof this.get('data').height !== 'undefined') {
                this.set('height', this.get('data').height);
            }
            else {
                this.set('height', footPrintClass.HEIGHT);
            }
            if (typeof this.get('data').width !== 'undefined') {
                this.set('width', this.get('data').width);
            }
            else {
                this.set('width', footPrintClass.WIDTH);
            }
            if (typeof this.get('data').color !== 'undefined') {
                this.set('color', this.get('data').color);
            }
            else {
                this.set('color', footPrintClass.BG_COLOR);
            }
            if (typeof this.get('data').boxShadowColor !== 'undefined') {
                this.set('boxShadowColor', this.get('data').boxShadowColor);
            }
            else {
                this.set('boxShadowColor', footPrintClass.BOX_SHADOW_COLOR);
            }
            if (typeof this.get('data').imageId !== 'undefined') {
                this.set('imageId', this.get('data').imageId);
            }
            if (typeof this.get('data').borderColor !== 'undefined') {
                this.set('borderColor', this.get('data').borderColor);
            }
            else {
                this.set('borderColor', footPrintClass.BORDER_COLOR);
            }
        }

    },
    {
        /**
        * Default Height of the FootPrint.
        * @property HEIGHT
        * @type number
        * @static
        */
        HEIGHT: 48,
        /**
        * Default Width of the FootPrint.
        * @property WIDTH
        * @type number
        * @static
        */
        WIDTH: 48,
        /**
        * Default BackGround Color of the FootPrint.
        * @property BG_COLOR
        * @type string
        * @static
        */
        BG_COLOR: '#BFBFBF',
        /**
        * Default Border Color of the FootPrint.
        * @property BORDER_COLOR
        * @type string
        * @static
        */
        BORDER_COLOR: '#aaa',
        /**
        * Default BoxShadow Color of the FootPrint.
        * @property BOX_SHADOW_COLOR
        * @type string
        * @static
        */
        BOX_SHADOW_COLOR: '#aaa'
    });

})();



