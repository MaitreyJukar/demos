(function () {
    'use strict';

    /**
    * Properties required for individual Piece
    *
    * @class 
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Interactivities.PicturePerfect.Models
    */
    MathInteractives.Interactivities.PicturePerfect.Models.Shape = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: {
            /**
            * Name of the shape
            *
            * @attribute name
            * @type String
            * @default null
            */
            name: null,

            /**
            * Array of segments of shape
            *
            * @attribute segments
            * @type Object
            * @default null
            */
            segments: null,

            /**
            * Segment Object with Name for Each Segment
            *
            * @attribute segmentsGroup
            * @type Object
            * @default null
            */
            segmentsGroup: null,

            /**
            * Array of objects to which this shape going to snap
            *
            * @attribute snapIndices
            * @type Object
            * @default null
            */
            snapIndices: null,

            /**
            * Current rotation degree
            *
            * @attribute rotation
            * @type Number
            * @default null
            */
            rotation: null,

            /**
            * Current position of shape
            *
            * @attribute position
            * @type Object
            * @default null
            */
            position: null,

            /**
            * Angles at all points in shape
            *
            * @attribute angles
            * @type Object
            * @default null
            */
            angles: null,

            /**
            * Whether shape is selected or not
            *
            * @attribute isSelected
            * @type Boolean
            * @default false
            */
            isSelected: false,

            /**
            * Type of shape i.e Shape.SHAPE_TYPE
            *
            * @attribute type
            * @type Number
            * @default null
            */
            type: null,

            /**
            * Whether shape is usable or not
            *
            * @attribute notUsable
            * @type Boolean
            * @default false
            */
            notUsable: false,

            /**
            * Whether shape is snapped to road or not
            *
            * @attribute isSnappedToRoad
            * @type Boolean
            * @default false
            */
            isSnappedToRoad: false,

            /**
            * Contains The Paper Group of The Shape
            *
            * @attribute paperGroupElem
            * @type Object
            * @default null
            */
            paperGroupElem: null,

            /**
            * Stores the Name of the group with which the model is grouped
            *
            * @attribute isGroupedWith
            * @type String
            * @default null
            */
            isGroupedWith: null,

            /**
            * To check if snapped horizontally
            *
            * @attribute snappedToX
            * @type Boolean
            * @default false
            */
            snappedToX: false,

            /**
            * To check if snapped vertically
            *
            * @attribute snappedToY
            * @type Boolean
            * @default false
            */
            snappedToY: false,

            /**
            * To check if snapped to path
            *
            * @attribute snappedToPath
            * @type Boolean
            * @default false
            */
            snappedToPath: false,

            /**
           * To check if snapped to wrong path horizontally
           *
           * @attribute snappedToWrongX
           * @type Boolean
           * @default false
           */
            snappedToWrongX: false,

            /**
            * To check if snapped to wrong path vertically
            *
            * @attribute snappedToWrongY
            * @type Boolean
            * @default false
            */
            snappedToWrongY: false,

            /**
            * To check if snapped to wrong path
            *
            * @attribute snappedToWrongPath
            * @type Boolean
            * @default false
            */
            snappedToWrongPath: false,
        },

        /**
        * Initializes the model properties.
        *
        * @method initialize
        * @constructor
        */
        initialize: function () {
            
        }

    }, {
        /**
        * The types of Shape
        *
        * @property SHAPE_TYPE
        * @static
        */
        SHAPE_TYPE: {
            TRIANGULAR: 0,
            QUADRILATERAL: 1,
            CORNER: 3
        },
    });

})();