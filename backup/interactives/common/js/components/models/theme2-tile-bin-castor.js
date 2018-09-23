(function () {
    'use strict';
    /**
    * Contains BinCastor data
    * @class BinCastor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.BinCastor = Backbone.Model.extend({
        defaults: {
            /**
            * DropSlot height
            * @property height
            * @type Number
            * @default null
            */
            height:null,
            /**
            * DropSlot width
            * @property width
            * @type Number
            * @default null
            */
            width: null,
            /**
            * Specifies the color of tile
            * @property color
            * @type Object
            * @default null
            */
            color: null,

            /**
            *Image id of tile
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
        * @method initialize
        **/
        initialize: function () {
        var binCastorClass= MathInteractives.Common.Components.Theme2.Models.BinCastor;
            if (typeof this.get('data').height !== 'undefined') {
                this.set('height', this.get('data').height);
            }
            else {
             this.set('height', binCastorClass.HEIGHT);
            }
            if (typeof this.get('data').width !== 'undefined') {
                this.set('width', this.get('data').width);
            }
            else {
              this.set('width', binCastorClass.WIDTH);
            }
            if (typeof this.get('data').color !== 'undefined') {
                this.set('color', this.get('data').color);
            }
            else {
             this.set('color', binCastorClass.BG_COLOR);
            }
            if (typeof this.get('data').imageId !== 'undefined') {
                this.set('imageId', this.get('data').imageId);
            }
            if (typeof this.get('data').borderColor !== 'undefined') {
                this.set('borderColor', this.get('data').borderColor);
            }
            else {
            this.set('borderColor', binCastorClass.BORDER_COLOR);
            }

        }

    },
    {
        /**
        * Default Height of the BinCastor.
        * @property HEIGHT
        * @type number
        * @static
        */
        HEIGHT: 50,
        /**
        * Default Width of the BinCastor.
        * @property WIDTH
        * @type number
        * @static
        */
        WIDTH: 200,
        /**
        * Default BackGround Color of the BinCastor.
        * @property BG_COLOR
        * @type string
        * @static
        */
        BG_COLOR: '#FFFFFF',
        /**
        * Default Border Color of the BinCastor.
        * @property BORDER_COLOR
        * @type string
        * @static
        */
        BORDER_COLOR: '#aaa',
       
});

})();




