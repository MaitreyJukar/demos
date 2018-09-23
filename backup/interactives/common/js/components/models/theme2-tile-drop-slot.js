(function () {
    'use strict';
    /**
    * Contains DropSlot data
    * @class DropSlot
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.DropSlot = Backbone.Model.extend({
        defaults: {
            /**
            * DropSlot height
            * @property height
            * @type Number
            * @default null
            */
            height: null,
            /**
            * DropSlot width
            * @property width
            * @type Number
            * @default null
            */
            width: null,
            /**
            * Specifies the color of dropslot
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
            * Image id of tile
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
            borderColor: null
        },
        /**
        * Initializes the model properties
        * @public
        * @method initialize
        **/
        initialize: function () {
            var dropSlotCLass = MathInteractives.Common.Components.Theme2.Models.DropSlot;
            if (typeof this.get('data').height !== 'undefined') {
                this.set('height', this.get('data').height);
            }
            else {
                this.set('height', dropSlotCLass.HEIGHT);
            }
            if (typeof this.get('data').width !== 'undefined') {
                this.set('width', this.get('data').width);
            }
            else {
                this.set('width', dropSlotCLass.WIDTH);
            }
            if (typeof this.get('data').color !== 'undefined') {
                this.set('color', this.get('data').color);
            }
            else {
                this.set('color', dropSlotCLass.BG_COLOR);
            }
            if (typeof this.get('data').boxShadowColor !== 'undefined') {
                this.set('boxShadowColor', this.get('data').boxShadowColor);
            }
            else {
                this.set('boxShadowColor', dropSlotCLass.BOX_SHADOW_COLOR);
            }
            if (typeof this.get('data').imageId !== 'undefined') {
                this.set('imageId', this.get('data').imageId);
            }
            if (typeof this.get('data').borderColor !== 'undefined') {
                this.set('borderColor', this.get('data').borderColor);
            }
            else {
                this.set('borderColor', dropSlotCLass.BORDER_COLOR);
            }
        }
    },
    {
        /**
        * Default Height of the Drop Slot.
        * @property HEIGHT
        * @type number
        * @static
        */
        HEIGHT: 44,
        /**
        * Default Width of the Drop Slot.
        * @property WIDTH
        * @type number
        * @static
        */
        WIDTH: 44,
        /**
        * Default BackGround Color of the Drop Slot.
        * @property BG_COLOR
        * @type string
        * @static
        */
        BG_COLOR: '#FFFFFF',
        /**
        * Default Border Color of the Drop Slot.
        * @property BORDER_COLOR
        * @type string
        * @static
        */
        BORDER_COLOR: '#aaa',
        /**
        * Default BoxShadow Color of the Drop Slot.
        * @property BOX_SHADOW_COLOR
        * @type string
        * @static
        */
        BOX_SHADOW_COLOR: '#aaa'
    });

})();



