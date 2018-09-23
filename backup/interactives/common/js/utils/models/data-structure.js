(function () {
    'use strict';
    var Point = Backbone.Model.extend({
        defaults: {
            /**
            * Holds left value of point.
            *          
            * @attribute left
            * @type Number
            * @default 0
            */
            left: 0,
            /**
            * Holds top value of point.
            *          
            * @attribute top
            * @type Number
            * @default 0
            */
            top: 0
        },

        /**
        * Get left value of point.
        *
        * @method getLeft
        * @return  {Number} 
        */
        getLeft: function () {
            return this.get('left');
        },

        /**
        * Set left value of point.
        *
        * @method setLeft
        * @param {Object} value
        */
        setLeft: function (value) {
            this.set('left', value);
        },

        /**
        * Get top value of point.
        *
        * @method getTop
        * @return  {Number} 
        */
        getTop: function () {
            return this.get('top');
        },

        /**
        * Set left value of point.
        *
        * @method setTop
        * @param  {Object}  value
        */
        setTop: function (value) {
            this.set('top', value);
        },

        setPoint: function (data) {
            this.setLeft(data.left);
            this.setTop(data.top);
        }

    });
    /**
    * Point class
    * @class Point
    * @module Utilities
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Utilities.Models
    * @constructor
    */
    MathInteractives.Common.Utilities.Models.Point = Point;

    var Rect = Backbone.Model.extend({
        defaults: {
            /**
            * Holds left value of rect.
            *          
            * @attribute left
            * @type Number
            * @default 0
            */
            left: 0,
            /**
            * Holds top value of rect.
            *          
            * @attribute top
            * @type Number
            * @default 0
            */
            top: 0,
            /**
            * Holds width of rect.
            *          
            * @attribute width
            * @type Number
            * @default 0
            */
            width: 0,
            /**
            * Holds height of rect.
            *          
            * @attribute height
            * @type Number
            * @default 0
            */
            height: 0
        },

        /**
        * Get left value of rect.
        *
        * @method getLeft
        * @return  {Number} 
        */
        getLeft: function () {
            return this.get('left');
        },

        /**
        * Get left value of rect.
        *
        * @method getTop
        * @return  {Number} 
        */
        getTop: function () {
            return this.get('top');
        },

        /**
        * Get right value of rect.
        *
        * @method getRight
        * @return  {Number} 
        */
        getRight: function () {
            return this.get('left') + this.get('width');
        },

        /**
        * Get bottom value of rect.
        *
        * @method getBottom
        * @return  {Number} 
        */
        getBottom: function () {
            return this.get('top') + this.get('height');
        },

        /**
        * Get width of rect.
        *
        * @method getWidth
        * @return  {Number} 
        */
        getWidth: function () {
            return this.get('width');
        },

        /**
        * Get height of rect.
        *
        * @method getHeight
        * @return  {Number} 
        */
        getHeight: function () {
            return this.get('height');
        },

        /**
        * Get middle x point of rect.
        *
        * @method getMiddleX
        * @return  {Number} 
        */
        getMiddleX: function () {
            var midX = Math.floor(this.get('left') + this.get('width') / 2);
            return midX;
        },
        /**
        * Get middle y point of rect.
        *
        * @method getMiddleY
        * @return  {Number} 
        */
        getMiddleY: function () {
            var midY = Math.floor(this.get('top') + this.get('height') / 2);
            return midY;
        },


        /**
        * Get middle point of rect.
        *
        * @method getMiddle
        * @return  {Number} 
        */
        getMiddle: function () {
            var midX = this.getMiddleX(),
                midY = this.getMiddleY();
            return new Point({ left: midX, top: midY });
        },

        /**
        * Checks if point is within rect.
        *
        * @method isPointInRect
        * @param point {MathInteractives.Common.Utilities.Models.Point} point to be checked.
        * @return  {Boolean} true if point is within rect else false.
        */
        isPointInRect: function (point) {
            var x = point.getLeft(),
                y = point.getTop();
            if (x >= this.getLeft() && x <= this.getRight() &&
                    y >= this.getTop() && y <= this.getBottom()) {
                return true;
            }
            return false;
        },

        /**
        * Inflate rect.
        *
        * @method inflateRect
        * @param valueX {Number} value by which inflate rect horizontally.
        * @param valueY {Number} value by which inflate rect vertically.
        * @return  {MathInteractives.Common.Utilities.Models.Rect} Inflated rect.
        */
        inflateRect: function (valueX, valueY) {
            return new Rect({
                left: this.getLeft() - valueX,
                top: this.getTop() - valueY,
                width: this.getWidth() + 2 * valueX,
                height: this.getHeight() + 2 * valueY
            });
        }

    });
    /**
    * Rect class.
    * @class Rect
    * @module Utilities
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Utilities.Models
    * @constructor
    */
    MathInteractives.Common.Utilities.Models.Rect = Rect;
}());