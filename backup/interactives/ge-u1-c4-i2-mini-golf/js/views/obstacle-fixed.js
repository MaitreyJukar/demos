(function () {
    'use strict';
    var miniGolfModels = MathInteractives.Interactivities.MiniGolf.Models,
        modelClassName = miniGolfModels.Obstacle,
        miniGolfModel = miniGolfModels.MiniGolfData;
    /**
    * Obstacle holds the necessary structure for the obstacles.
    * @class ObstacleFixed
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.ObstacleFixed = MathInteractives.Interactivities.MiniGolf.Views.Obstacle.extend({


        /**
        * Holds the actual path of obstacle
        * @property actualObstaclePath
        * @default null
        * @private 
        */
        actualObstaclePath: null,
        /**
        * Holds the relflection path of obstacle
        * @property reflectionPath
        * @default null
        * @private 
        */
        reflectionPath: null,

        /**
        * Holds the group of actualObstaclePath and reflectionPath
        * @property obstacleOnPaper
        * @default null
        * @private 
        */
        obstacleOnPaper: null,

        /**
        * Renders the obstacle
        *
        * @method render
        */
        render: function render() {

            this._renderRectangles();

            this._setBaseViewProp();
            this._bindEvents();
            this._setObstaclePosition();

            this.model.trigger(miniGolfModel.EVENTS.OBSTACLE_RENDERED);

        },


        /**
        * Renders rectangle shape obstacles
        *
        * @method _renderRectangles
        * @private
        */
        _renderRectangles: function () {


            var actualObstaclePath = null,
                reflectionPath = null,
                paperScope = this.paperScope,
                model = this.model,
                rectangleData = model.get('rectangleData'),
                rectangleHeight = rectangleData.height,
                rectangleWidth = rectangleData.width,
                currentType = model.get('type'),
                obsTypes = modelClassName.TYPES;

            this.actualObstaclePath = actualObstaclePath = new paperScope.Path.Rectangle(0, 0, rectangleWidth, rectangleHeight);

            if (currentType === obsTypes.LEFT_FIXED || currentType === obsTypes.RIGHT_FIXED) {
                this.reflectionPath = reflectionPath = new paperScope.Path.Rectangle(0, 0, rectangleWidth + 18, rectangleHeight + 15);
            }
            else {
                this.reflectionPath = reflectionPath = new paperScope.Path.Rectangle(0, 0, rectangleWidth + 20, rectangleHeight + 20);
            }



            //actualObstaclePath.position = model.get('lastCorrectPosition');
            reflectionPath.position = actualObstaclePath.position;

            model.set('isInDispenser', false);// as this type of obs will always be in course
            //actualObstaclePath.selected = true;
            //reflectionPath.selected = true;

        },

        /**
        * set base obstacle view prop which are needed in some tasks
        *
        * @method _setBaseViewProp
        * @private
        */
        _setBaseViewProp: function () {

            var obstacleOnPaper = null,
                rotatingAngle = null,
                model = this.model,
                currentType = model.get('type'),
                obsTypes = modelClassName.TYPES,

                rotatingAngle = model.get('rotatingAngle');


            this.obstacleOnPaper = obstacleOnPaper = new this.paperScope.Group([this.reflectionPath, this.actualObstaclePath]);
            obstacleOnPaper.name = miniGolfModel.DRAGGABLE;
            if (currentType === obsTypes.LEFT_FIXED || currentType === obsTypes.RIGHT_FIXED) {
                obstacleOnPaper.rotate(rotatingAngle);
                this._setTranslatePosition();
            }
            //model.set('bridgeRasterPosition', model.get('modelStaticData').initialPosition);
        },

        /**
        * bind events on model 
        *
        * @method _bindEvents
        * @private
        */

        _bindEvents: function () {
            var model = this.model,
                self = this;

            model.on('change:lastCorrectPosition', function () {

                self._setObstaclePosition();
            })
        },


        /**
        * set obstacle position on bridge position change
        *
        * @method _setObstaclePosition
        * @private
        */
        _setObstaclePosition: function () {
            var obstacleOnPaper = this.obstacleOnPaper;

            obstacleOnPaper.position = this.model.get('lastCorrectPosition');
            this._setTranslatePosition();
            //   obstacleOnPaper.sendToBack();
        },

        /**
        * translate given obstacles by given data
        *
        * @method _setTranslatePosition
        * @private
        */
        _setTranslatePosition: function () {


            var model = this.model,
                currentType = model.get('type'),
                obsTypes = modelClassName.TYPES,
                rotatingAngle = model.get('rotatingAngle'),
                translateX = model.get('translateX'),
                translateY = model.get('translateY'),
                obstacleOnPaper = this.obstacleOnPaper;

            obstacleOnPaper.detach('mousedown');
            obstacleOnPaper.detach('mouseenter');
            obstacleOnPaper.detach('mouseleave');

            if (currentType === obsTypes.LEFT_FIXED || currentType === obsTypes.RIGHT_FIXED) {


                obstacleOnPaper.translate(translateX, translateY);

            }
        },

        /**
        * change position of obstacle to initial position on reset click
        * @method _setTranslatePosition
        * @private
        */
        revertToInitialPosition: function () {

            var model = this.model;

            model.set('lastCorrectPosition', model.get('initialPosition'));
            this._setObstaclePosition();

        }






    }, {});
})();