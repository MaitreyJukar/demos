(function () {
    'use strict';
    /**
    * Obstacle holds properties and methods required for a obstacle.
    *
    * @class Obstacle
    * @module MiniGolf
    * @type Object
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Interactivities.MiniGolf.Models
    */
    MathInteractives.Interactivities.MiniGolf.Models.Obstacle = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: function () {
            return {

                /*
                * The course number to which the obstacle belongs
                *
                * @attribute courseNumber
                * @type Number
                * @default null
                */
                courseNumber: null,

                /*
                * The obstacle number, used for fetching static data from the interactive's main model.
                *
                * @attribute obstacleNumber
                * @type Number
                * @default null
                */
                obstacleNumber: null,

                /**
                * The position of the obstacle when placed inside the drag slot.
                *
                * @attribute initialPosition
                * @type Object
                * @default null
                */
                initialPosition: null,

                /**
                * The position of the obstacle when placed on the course.
                *
                * @attribute position
                * @type Object
                * @default null
                */
                position: null,

                /**
                * The angle by which the obstacle in a valid state is rotated from it's initial position; useful for
                * reverting to last orientation.
                *
                * @attribute position
                * @type Number
                * @default null
                */
                angle: null,

                /**
                * The current angle by which the obstacle is rotated at the moment from it's initial position.
                *
                * @attribute currentAngle
                * @type Number
                * @default null
                */
                currentAngle: null,

                /**
                * A boolean indicating if the obstacle is draggable.
                *
                * @attribute isDraggable
                * @type Boolean
                * @default true
                */
                isDraggable: true,

                numberOfBallsAttached: 0,

                /**
                * A object to store event point
                *
                * @attribute eventPoint
                * @type object
                * @default null
                */
                eventPoint: null,

                /**
                * A object to store last correct position of obstacle
                *
                * @attribute lastCorrectPosition
                * @type object
                * @default null
                */
                lastCorrectPosition: null,

                /**
                * A object to store current bridge position
                *
                * @attribute bridgeRasterPosition
                * @type object
                * @default null
                */
                bridgeRasterPosition: null,

                /**
                * An boolean to store if the obstacle is in dispenser or not
                *
                * @attribute isInDispenser
                * @type boolean
                * @default true
                */
                isInDispenser: true,


                isObstacleDropped: true,

               

                focusRectHeight: null,

                focusRectWidth: null






            };
        },

        /**
        * Initialises obstacle Model
        *
        * @method initialize
        **/
        initialize: function (options) {
            this.on('change:numberOfBallsAttached', function (a, b) { this.log(b); });
            this.set('position', this.get('position') || this.get('intialPosition'));
            this.set('angle', this.get('angle') || 0);
            this.set('currentAngle', this.get('currentAngle') || this.get('angle'));
        }
    }, {

        generateObstacleOfType: function generateObstacleOfType(options) {

            var types = this.TYPES,
                type = options.type,
                ViewClass = null,
                DefaultViewClass = MathInteractives.Interactivities.MiniGolf.Views.Obstacle,

                leftBridgeWall = types.LEFT_BRIDGE_WALL,
                rightBridgeWall = types.RIGHT_BRIDGE_WALL,
                leftRiver = types.LEFT_RIVER,
                rightRiver = types.RIGHT_RIVER,

                viewObject = null;
            switch (type) {
                case types.LEFT_FIXED:
                case types.RIGHT_FIXED:
                case types.FIXED:
                    ViewClass = MathInteractives.Interactivities.MiniGolf.Views.ObstacleFixed || DefaultViewClass;
                    viewObject = new ViewClass(options.viewProperties);

                    viewObject.render(options.viewProperties);
                    break;
                case leftRiver:
                case rightRiver:
                    options.viewProperties.type = type;
                    ViewClass = MathInteractives.Interactivities.MiniGolf.Views.RiverObstacle || DefaultViewClass;
                    viewObject = new ViewClass(options.viewProperties);
                    // viewObject.render();
                    break;
                case leftBridgeWall:
                case rightBridgeWall:
                    break;

                case types.DEFAULT:
                default:
                    ViewClass = DefaultViewClass;
                    viewObject = new ViewClass(options.viewProperties);
                    viewObject.addObstacleImages();
                    break;
            }
            return viewObject;
        },


        RIGHT_SIDE_RIVER_POINTS: {
            START_POINT: {
                x: 767,
                y: 149
            },
            END_POINT: {
                x: 768,
                y: 180
            }
        },


        LEFT_SIDE_RIVER_POINT: {
            START_POINT: {
                x: 397,
                y: 264
            },
            END_POINT: {

                x: 425,
                y: 282
            }
        },

        TYPES: {
            DEFAULT: 'default',
            FIXED: 'fixed',
            RIGHT_BRIDGE_WALL: 'right_bridge_wall',
            LEFT_BRIDGE_WALL: 'left-bridge-wall',
            LEFT_RIVER: 'left-river',
            RIGHT_RIVER: 'right-river',
            LEFT_FIXED: 'left-fixed',
            RIGHT_FIXED: 'right-fixed'
        },

        OBSTACLE_DROPSLOT_INTERSECTION_AREA_TOLERANCE: 3,

        OBSTACLE_HOLE_INTERSECTION_AREA_TOLERANCE: 4,
        DRAG_DISTANCE_ACC: 3,
        ACC_ROTATION_ANGLE: 2,
        /**
        * Collection of obstacles
        * @class Obstacles
        * @module MiniGolf
        * @type Object
        * @extends Backbone.Collection
        * @namespace MathInteractives.Interactivities.MiniGolf.Models.Carousel
        * @constructor
        * @static
        */
        Obstacles: Backbone.Collection.extend({

            model: this,

            /**
            * Intialize the collection of table rows.
            * @method initialize
            * @constructor
            */
            initialize: function () {
                this.model = MathInteractives.Interactivities.MiniGolf.Models.Obstacle;
            }
        })
    });
})();