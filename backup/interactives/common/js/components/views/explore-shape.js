(function () {
    'use strict';


    /**
   * View for rendering bubbles and diffrent shapes i.e. ellipse and circle
   * @class ExplorerShape
   * @constructor
   * @namespace MathInteractives.Common.Components.Views
   **/

    MathInteractives.Common.Components.Views.ExplorerShape = MathInteractives.Common.Components.Views.ExplorerGraph.extend({



        /**
       
       * Holds the interactivity id prefix
       * @property idPrefix
       * @default null
       * @private
       */
        idPrefix: null,


        /**
        * Holds the interactivity manager reference
        * @property manager
        * @default null
        * @private
        */
        manager: null,


        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,


        /**
        * Holds the model of player for interactivity purpose
        *
        * @property player
        * @type Object
        * @default null
        */
        player: null,



        /**
        * Holds the current view static data
        *
        * @property viewStaticData
        * @type Object
        * @default null
        */
        viewStaticData: null,


        /**
        * Holds the min x limit of bubbles
        *
        * @property minXBubbleBound
        * @type Object
        * @default null
        */
        minXBubbleBound: null,


        /**
        * Holds the min y limit of bubbles
        *
        * @property minYBubbleBound
        * @type Object
        * @default null
        */
        minYBubbleBound: null,

        /**
        * Holds the max x limit of bubbles
        *
        * @property maxXBubblebound
        * @type Object
        * @default null
        */
        maxXBubblebound: null,

        /**
        * Holds the max y limit of bubbles
        *
        * @property maxYBubbleBound
        * @type Object
        * @default null
        */
        maxYBubbleBound: null,


        /**
        * Holds the bubbles area center 
        *
        * @property bubblesBoundsCenter
        * @type Object
        * @default null
        */
        bubblesBoundsCenter: {},

        /**
        * Holds the value of isRedCircleShown
        * @attribute isRedCircleShown
        * @private
        * @type boolean
        * @default true
        */

        isRedCircleShown: null,

        /**
        * Holds the value of hitOptions
        * @attribute hitOptions
        * @private
        * @type object
        * @default null
        */

        hitOptions: null,

        /**
        * Holds the value of hitResult
        * @attribute hitResult
        * @private
        * @type object
        * @default null
        */

        hitResult: null,

        /**
        * Holds the value of currentImage
        * @attribute currentImage
        * @private
        * @type object
        * @default null
        */

        currentImage: null,

        /**
        * Holds the value of lastIndexChanged
        * @attribute lastIndexChanged
        * @private
        * @type boolean
        * @default false
        */

        lastIndexChanged: false,

        /**
        * Holds the value of dummyTackPath
        * @attribute dummyTackPath
        * @private
        * @type object
        * @default null
        */

        dummyTackPath: null,

        /**
        * Holds the value of interval
        * @attribute interval
        * @private
        * @type number
        * @default null
        */

        interval: null,

        /**
        * Holds the value of dummyEllipse
        * @attribute dummyEllipse
        * @private
        * @type object
        * @default null
        */

        dummyEllipse: null,

        /**
        * Holds the value of deltaGroup
        * @attribute deltaGroup
        * @private
        * @type object
        * @default null
        */

        deltaGroup: null,

        /**
        * Holds the value of shapeCenter
        * @attribute shapeCenter
        * @private
        * @type object
        * @default null
        */

        shapeCenter: {
            x: null,
            y: null
        },

        /**
        * Holds the value of thumbTackPositionAdded
        * @attribute thumbTackPositionAdded
        * @private
        * @type object
        * @default 0
        */

        thumbTackPositionAdded: {
            x: 0,
            y: 0
        },

        /**
        * Holds the value of isFirstRun
        * @attribute isFirstRun
        * @private
        * @type boolean
        * @default true
        */

        isFirstRun: true,

        /**
        * Holds the value of largeBubbleImageRaster
        * @attribute largeBubbleImageRaster
        * @private
        * @type object
        * @default null
        */

        largeBubbleImageRaster: null,

        /**
        * Holds the value of smallBubbleImageRaster
        * @attribute smallBubbleImageRaster
        * @private
        * @type object
        * @default null
        */

        smallBubbleImageRaster: null,

        /**
        * Holds the value of middlebubbleimageraster
        * @attribute middlebubbleimageraster
        * @private
        * @type object
        * @default null
        */

        middlebubbleimageraster: null,

        /**
        * Holds the value of largeAnimateBubblesRasters
        * @attribute largeAnimateBubblesRasters
        * @private
        * @type object
        * @default null
        */

        largeAnimateBubblesRasters: null,

        /**
        * Holds the value of middleAnimateBubblesRasters
        * @attribute middleAnimateBubblesRasters
        * @private
        * @type object
        * @default null
        */

        middleAnimateBubblesRasters: null,

        /**
        * Holds the value of smallAnimateBubblesRasters
        * @attribute smallAnimateBubblesRasters
        * @private
        * @type object
        * @default null
        */

        smallAnimateBubblesRasters: null,

        /**
        * Holds the value of dashedShapeGroup
        * @attribute dashedShapeGroup
        * @private
        * @type object
        * @default null
        */

        dashedShapeGroup: null,

        /**
        * Holds the value of initialAnimationInterval
        * @attribute initialAnimationInterval
        * @private
        * @type number
        * @default null
        */

        initialAnimationInterval: null,
         /**
        * Holds the canvas acc view
        * @attribute canvasAcc
        * @private
        * @type object
        * @default null
        */
        canvasAcc:null,
        /**
        * show the focus rect on canvas
        * @attribute focusRect
        * @private
        * @type object
        * @default null
        */
        focusRect:null,
        /**
        * hold the previous item for accessibility
        * @attribute previousItem
        * @private
        * @type object
        * @default null
        */
        previousItem:null,
        /**
        * hold the current item is selcted in the accessibiltiy
        * @attribute currentItem
        * @private
        * @type object
        * @default null
        */
        currentItem:null,
         /**
        * holds the which arrow is pressed 
        * @attribute arrow
        * @private
        * @type object
        * @default null
        */
        arrow:null,
        thumbTackHeight:28,
        thumbTackWidth:19,
        currentIndex:null,
        afterFirstAnimate:false,
        /**
        * Calls render and set values of player and manager
        *
        * @method initialize
        **/

        initialize: function () {
            /* 
            p.s.
            do not use parent view function name since this component is derived from graph view,
            please go through the view extention
           
            */
            this.redBarLoded = false;
            this.rasterPattern = {};
            this.isFirstRun = true;
            var model = this.model,
                showGraph = model.getShowGraph(),
                self = this;

            this.initialAnimationInterval = 1;
            this.idPrefix = model.get('idPrefix');
            this.manager = model.get('manager');
            this.filePath = model.get('filePath');
            this.player = model.get('player');

            this.viewStaticData = MathInteractives.Common.Components.Views.ExplorerShape;
            this.timeOutInterval = this.viewStaticData.ANIMATION_DURATION / 90;
            if (showGraph) {

                this._callBaseViewInitialize(); // since the initilize function of parent is overriden here so parent function wont be called. to call base class constructor call the another base call function  _callParentOverridenFunctionInitialize

            }
            else {
                this._appendCanvas();
                this._setpaperScope();
                this._setCanvasStyle();
                this._bindEvents();
            }
            this._appendDrawingLayer();
            //purpleStringPath = this.filePath.getImagePath('purpleString');
            //this.model.set('purpleStringPath', purpleStringPath);
            //redStringPath = this.filePath.getImagePath('purpleString');
            //this.model.set('redStringPath', redStringPath);


            //this.paperScope2 = this.paperScope;
            this.hitOptions = { segments: true, stroke: true, fill: true, tolerance: 3 };
            this.paperScope2.activate();
            this.paperScope.view.draw();
            this._prepareColorStringRasters();
            
            this.on(MathInteractives.Common.Components.Views.ExplorerShape.CUSTOM_EVENTS.initializationDone, function () {
                self._setInitialAnimationPosition();
            });
          
        },

        /**
        * Sets the initial animation position
        *
        * @method _setInitialAnimationPosition
        * @private
        */

        _setInitialAnimationPosition: function () {
            var model = this.model,
                shape = model.get('shape'),
                thumbTack = model.get('thumbTack'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                dummyThumbTack = model.get('dummyThumbTack'),
                shapeCenter = model.get('shapeCenter'),
                positionOffset = model.get('gridSizeXAxis') * 8,
                tackToFoci1, tackToFoci2;
            this.paperScope2.activate();
            //shapeCenter.position.x -= positionOffset;
            //shapeCenter.position.y += positionOffset;
            thumbTack.position.x = shapeCenter.position.x,//+ 10,//+ positionOffset + 20;
            thumbTack.position.y = shapeCenter.position.y,//- 10,//- positionOffset / 2 - 20;
            dummyThumbTack.position.x = thumbTack.position.x;
            dummyThumbTack.position.y = thumbTack.position.y;
            this.model.set('thumbTack', thumbTack);
            this.model.set('shapeCenter', shapeCenter);
            if (shape === 'ellipse') {
                foci1.position.x = shapeCenter.position.x;
                foci1.position.y = shapeCenter.position.y - positionOffset / 2;
                foci2.position.x = shapeCenter.position.x;
                foci2.position.y = shapeCenter.position.y + positionOffset / 2;
                var event = {};
                event.event = {};
                event.event.which = 1;
                event.point = new this.paperScope2.Point(0, 0);
                this._snapAll();
                this._showShapeMouseDownFeatures(event);
                this._showShapeMouseUpFeatures(event);
                this.redBarLoded = false;
                if (this.model.get('shape') === 'ellipse') {
                    this._redrawBar();
                }
            }
            else {
                thumbTack.position.x = shapeCenter.position.x + 57;
                thumbTack.position.y = shapeCenter.position.y - 57;
                var event = {};
                event.event = {};
                event.event.which = 1;
                foci1.position.x = shapeCenter.position.x;
                foci1.position.y = shapeCenter.position.y;
                foci2.position.x = shapeCenter.position.x;
                foci2.position.y = shapeCenter.position.y;
                this.model.set('foci1', foci1);
                this.model.set('foci2', foci2);
                this._snapAll();
                event.point = new this.paperScope2.Point(shapeCenter.position.x, shapeCenter.position.y);
                this._showShapeMouseUpFeatures(event);
            }
            this.paperScope2.view.draw();
        },

        /**
        * Initial animation
        *
        * @method _initialAniamtion
        * @private
        */

        _initialAniamtion: function () {
            var self = this,
                model = self.model,
                shapeType = model.get('shape'),
                thumbTack = model.get('thumbTack'),
                currentRandomNumber = null;

            if (!this.isFirstRun) {
                this.trigger(self.viewStaticData.CUSTOM_EVENTS.bubblePopulationAnimationEnd);
                self._bringShapeToFront(shapeType);
                this._handleInitialAnimationEnd();
                return false;
            }
            this._snapAll();
            this._handleInitialAnimationStart();
            this.draggableElement = thumbTack;
            //this._animateCenter(this.model.get('gridSizeXAxis') * 8 / 2 - 1);
            if (shapeType === 'circle') {
                currentRandomNumber = model.generateRandomNumber(60, 100);
                this._initialCircleAnimation(currentRandomNumber);
            }
            else {
                if (shapeType === 'ellipse') {
                    // thumbTack.position.x += 20;
                    currentRandomNumber = model.generateRandomNumber(150, 250);
                    self._initialEllipseAnimation(currentRandomNumber);
                }
            }
            self._bringShapeToFront(shapeType);
            //
        },

        /**
        * Handle the start of the initial animation
        *
        * @method _handleInitialAnimationStart
        * @private
        */

        _handleInitialAnimationStart: function () {
            var model = this.model,
                event = {};
            event.point = model.get('shapeCenter').position;
            this._showShapeMouseDownFeatures(event);
            this._showShapeMouseUpFeatures(event);
            this.isAnimating = true;
            this._unbindEventsOnDraggables(model.get('thumbTack'));
            this._unbindEventsOnDraggables(model.get('foci1'));
            this._unbindEventsOnDraggables(model.get('foci2'));
            this._unbindEventsOnDraggables(model.get('shapeCenter'));
            this._unbindEventsOnDraggables(model.get('dummyThumbTack'));
            this._bringShapeToFront(model.get('shape'));
            this.player.enableAllHeaderButtons(false);
            var $canvas = this.$('#' + this.idPrefix + 'graph-holder-canvas-element-extended');
            $canvas.css({ 'cursor': "default" });

        },

        /**
        * Handle the end of the initial animation
        *
        * @method _handleInitialAnimationEnd
        * @private
        */

        _handleInitialAnimationEnd: function () {
            var self = this,
                model = self.model;
         //   self._bindEventsOnDraggables(model.get('thumbTack'));
            self._bindEventsOnDraggables(model.get('foci1'));
            self._bindEventsOnDraggables(model.get('foci2'));
            self._bindEventsOnDraggables(model.get('shapeCenter'));
            self._bindEventsOnDraggables(model.get('dummyThumbTack'));
            self.isAnimating = false;
            self.draggableElement = null;
            self.isFirstRun = false;
            this.player.enableAllHeaderButtons(true);
        },

        /**
       * Initial animation for circle
       *
       * @method _initialCircleAnimation
       * @private
       * @param count << {{number}} >> number of times the animation should continue
       */

        _initialCircleAnimation: function (count) {
            var model = this.model,
                shape = model.get('shape'),
                thumbTack = model.get('thumbTack'),
                event = {},
                self = this, j, k = 0,
                shapeCenter = model.get('shapeCenter');


            event.event = {};
            event.event.which = 1;
            this.paperScope2.activate();

            setTimeout(function () {
                event.point = thumbTack.position.clone();
                self._showShapeMouseDownFeatures(event);
                self.draggableElement = thumbTack;
                event.point.y -= 1;

                event.point.x += 0.4;

                self.paperScope2.activate();
                self._showShapeMouseDragFeatures(event);
                if (shape === 'circle') {
                    self.model.get('black').bringToFront();
                }
                else {
                    self.model.get('purple').bringToFront();
                    self.model.get('red').bringToFront();
                }
                self._bringShapeToFront(self.model.get('shape'));
                if (count === 0) {
                    self.isFirstRun = false;
                    self._showShapeMouseUpFeatures(event);
                    shapeCenter = self.model.get('shapeCenter');
                    event.point = shapeCenter.position;
                    self._showShapeMouseDownFeatures(event);
                    self._showShapeMouseUpFeatures(event);
                    self.trigger(self.viewStaticData.CUSTOM_EVENTS.bubblePopulationAnimationEnd);
                    self._bringShapeToFront(shape);
                    self._handleInitialAnimationEnd();
                    self.model.set('showPopupOnTryAnother', false);
                }
                else {
                    self._initialCircleAnimation(count - 1);
                }
                self.paperScope2.view.draw();
            }, this.initialAnimationInterval);

        },

        /**
       * Initial animation for ellipse
       *
       * @method _initialEllipseAnimation
       * @private
       * @param distance << {{number}} >> number of times the animation should continue
       */

        _initialEllipseAnimation: function (distance) {
            var model = this.model,
               shape = model.get('shape'),
               thumbTack = model.get('thumbTack'),
               foci1 = model.get('foci1'),
               foci2 = model.get('foci2'),
               dummyThumbTack = model.get('dummyThumbTack'),
               circumferencePath,
               tackToFoci1,
               tackToFoci2,
               event = {},
               self = this, j, k = 0,
               shapeCenter = model.get('shapeCenter'),
               verticalAnimation = true;

            j = 1;
            event.event = {};
            event.event.which = 1;
            setTimeout(function () {

                var foci1 = self.model.get('foci1'),
                    foci2 = self.model.get('foci2'),
                    event = {};
                event.event = {};
                event.event.which = 1;
                self.model.set('showGraph', false);
                event.point = foci1.position.clone();
                self.paperScope2.activate();
                self._showShapeMouseDownFeatures(event);
                self.draggableElement = model.get('foci1');

                if (verticalAnimation && foci1.position.x === foci2.position.x) {
                    event.point.y += j;

                }
                else {
                    event.point.x -= j;
                }

                self._showShapeMouseDragFeatures(event);
                model.get('purple').bringToFront();
                model.get('red').bringToFront();
                self._bringShapeToFront(self.model.get('shape'));
                if (foci1.position.x === foci2.position.x && foci1.position.y === foci2.position.y) {

                    verticalAnimation = false;
                    foci1.position.x -= 10;
                    foci2.position.x += 10;
                }

                if (distance === 0) {
                    self.model.set('showGraph', true);

                    self._showShapeMouseUpFeatures(event);
                    self._initialCircleAnimation(model.generateRandomNumber(60, 100));
                }
                else if (distance > 0) {
                    self._initialEllipseAnimation(distance - 1);
                }
                self.paperScope2.view.draw();
            }, this.initialAnimationInterval);

        },

        /**
        * Animates the center
        *
        * @method _animateCenter
        * @private
        * @param positionOffset << {{number}} >> number of times the animation should continue
        */

        _animateCenter: function (positionOffset) {
            var model = this.model,
                shape = model.get('shape'),
                event = {},
                self = this, k = 0,
                shapeCenter = model.get('shapeCenter');

            setTimeout(function () {
                var shapeCenter = self.model.get('shapeCenter').position.clone(),
                    event = {};

                k++;
                event.event = {};
                event.event.which = 1;
                event.point = shapeCenter;
                self.paperScope2.activate();
                self._showShapeMouseDownFeatures(event);
                event.point = shapeCenter;
                event.point.x += 2; event.point.y -= 2;

                self._showShapeMouseDragFeatures(event);
                if (shape === 'circle') {
                    model.get('black').bringToFront();
                }
                else {
                    model.get('purple').bringToFront();
                    model.get('red').bringToFront();
                }
                self._bringShapeToFront(self.model.get('shape'));
                self.paperScope2.view.draw();
                if (positionOffset > 0) {
                    self._animateCenter(positionOffset - 1);
                }
                else {
                    self._showShapeMouseUpFeatures(event);
                    if (shape === 'ellipse') {
                        self._initialEllipseAnimation(200);
                    }
                    if (shape === 'circle') {
                        self._initialCircleAnimation(40);
                    }
                }
            }, this.initialAnimationInterval);
        },

        /**
        * Prepares the color string rasters
        *
        * @method _prepareColorStringRasters
        * @private
        */

        _prepareColorStringRasters: function () {
            var imageURL, raster,
                images = ['red', 'purple', 'Barpurple', 'Barred', 'black', 'largeBubble', 'smallBubble', 'middleBubble',
                          'animateLargeBubble1', 'animateLargeBubble2', 'animateLargeBubble3',
                          'animateSmallBubble1', 'animateSmallBubble2', 'animateSmallBubble3',
                          'animateMiddleBubble1', 'animateMiddleBubble2', 'animateMiddleBubble3', 'arrowCenter'],
                length = images.length,
                imageCount = length,
                self = this;

            for (var i = 0; i < length; i++) {

                var currentImage = images[i];


                imageURL = this.getImageURLFromSprite(currentImage);
                if (imageURL === null) {
                    imageCount--;
                    if (imageCount === 0) {
                        self._resumeInitialization();
                    }
                    continue;
                }

                raster = new this.paperScope2.Raster(imageURL);
                raster.onLoad = function () {
                    imageCount--;
                    if (imageCount === 0) {
                        self._resumeInitialization();
                    }
                };
                this.rasterPattern[currentImage] = raster;
                this.rasterPattern[currentImage].opacity = 0;
            }
        },

        /**
        * resumes the initialization
        *
        * @method _resumeInitialization
        * @private
        */

        _resumeInitialization: function () {

            this._render();
            this.paperScope.view.draw();
            this.paperScope2.activate();
            this._bindEvents();
            var event = {};
            event.event = {};
            event.event.which = 1;
            event.point = new this.paperScope2.Point(0, 0);
            this._snapAll();
            this._showShapeMouseDownFeatures(event);
            this._showShapeMouseUpFeatures(event);
            this.redBarLoded = false;
            if (this.model.get('shape') === 'ellipse') {
                this._redrawBar();
            }
            this.paperScope2.view.draw();
            this._handleInitialAnimationStart();
            this.trigger(MathInteractives.Common.Components.Views.ExplorerShape.CUSTOM_EVENTS.initializationDone);
        },

        /**
        * Appends the drawing layer
        *
        * @method _appendDrawingLayer
        * @private
        */

        _appendDrawingLayer: function () {
            this.$('canvas').css({
                'position': 'absolute',
                'top': '0px',
                'left': '0px'
            });
            this.$el.find('.canvas-holder').css('position', 'relative')
                .append('<canvas class = "canvas-element" style="position:absolute;" id = "' + this.idPrefix + 'graph-holder-canvas-element-extended" height="599" width="928"> ');

            this.paperScope2 = new paper.PaperScope();
            this.paperScope2.setup(this.idPrefix + 'graph-holder-canvas-element-extended');
            this.currentTool = new this.paperScope2.Tool();
            this.paperScope2.activate();
        },

        /**
        * binds events for cursor
        *
        * @method bindEventsForCursor
        * @private
        */

        bindEventsForCursor: function () {
            var model = this.model,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                shapeCenter = model.get('shapeCenter');
            this._bindEventsOnDraggables(foci1);
            this._bindEventsOnDraggables(foci2);
            this._bindEventsOnDraggables(shapeCenter);
        },

        /**
        * _append canvas to the el from commmon template 
        * @method _appendCanvas
        * @private
        */
        _appendCanvas: function () {

            var $el = this.$el,
                containerId = this.el.id,
                model = this.model,
                canvasHeight = model.getCanvasHeight(),
                canvasWidth = model.getCanvasWidth(),
                template = MathInteractives.Common.Components.templates.explorerGraph({ idPrefix: this.idPrefix, height: canvasHeight, width: canvasWidth }).trim();

            $el.html('').append(template);
            $el.find('.canvas-holder').attr('id', containerId + '-canvas-holder');
            $el.find('.canvas-element').attr('id', containerId + '-canvas-element');
            $el.find('.canvas-tooltip').attr('id', containerId + '-canvas-tooltip');
            $el.find('.explore-graph-acc-container').attr('id', containerId + '-explore-graph-acc-container');
        },




        /**
        * set styling to canvas and its parent div
        * @method _setCanvasStyle
        * @private
        */
        _setCanvasStyle: function () {

            var $el = this.$el,
                containerId = this.el.id,
                canvasHolder = $el.find('#' + containerId + '-canvas-holder'),
                canvasElement = canvasHolder.find('#' + containerId + '-canvas-element'),
                model = this.model,
                canvasParentHeight = model.getCanvasParentHeight(),
                canvasParentWidth = model.getCanvasParentWidth(),
                canvasHeight = model.getCanvasHeight(),
                canvasBackGrndColor = model.getcanvasBackgroundColor(),
                canvasWidth = model.getCanvasWidth();


            canvasHolder.css({
                height: canvasParentHeight,
                width: canvasParentWidth

            });
//            canvasElement.css({
//                'background-color': canvasBackGrndColor

//            });
        },

        //render function to view


        /**
        * Renders bubbles and shapes
        *
        * @method render
        * @private
        **/
        _render: function () {


            this.paperScope2.activate();
            var tempDiv = $('<div id="temo-div" class="temp-div"\>'), // remove this after some time just a rough work
                $el = this.$el,
                model = this.model,
                startPoint = model.getStartPointBubble(),
                endPoint = model.getEndPointBubble(),
                minXBound = startPoint.xCoordinate,
                minYBound = startPoint.yCoordinate,
                maxXbound = endPoint.xCoordinate,
                showBubbles = model.getShowBubbles(),
                maxYBound = endPoint.yCoordinate,
                self = this;

            this.currentImage = this.getImagePath('explore-shapes');
            //this.ellpseSprite = this.getImagePath('ellipse-explorer');
            this.isAnimating = false;

            /****/

            var model = this.model,
                majorAxis = model.get('majorAxis'),
                minorAxis = model.get('minorAxis'),
                center = model.getOriginPosition(),
                imageRaster = this._createRaster(0, 0),
                tackToFoci1,
                tackToFoci2,
                foci1 = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 0, 54, 36, 36)),
                foci2 = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 46, 54, 36, 36)),
//                foci1 = this.getSpritePartBase64URL('explore-shapes', 0, 54, 30, 30),
//                foci2 = this.getSpritePartBase64URL('explore-shapes', 40, 42, 30, 30),
                circleCenter = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 77, 103, 36, 36)),
                thumbTack = null,
                dummyThumbTack = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 80, 34, 19, 28)),
                //purpleStringRaster = imageRaster.getSubRaster(47, 94, 5, 4),
               // redStringRaster = imageRaster.getSubRaster(32, 94, 5, 4),
                blackStringRaster = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 62, 94, 5, 5)),
              //  purpleStringBarRaster = imageRaster.getSubRaster(16, 94, 6, 10),
              //  redStringBarRaster = imageRaster.getSubRaster(0, 94, 6, 10),
                shape = model.get('shape'),
                vector,
                fociDist,
                circumferencePath,
                lastIndex,
                shapeCenter,
                circumferencePath,
                showEquation = model.get('showEquation');

            if (shape === 'circle') {
                foci1.opacity = 0;
                foci2.opacity = 0;
            }

            // this.isRedCircleShown = false;
            var myPaper = this.paperScope2,
              // purpleStringRaster = this.getSpritePartBase64URL(this.currentImage, 40, 42, 30, 30),
              // redStringRaster = this.getSpritePartBase64URL(this.currentImage, 32, 94, 5, 4),
                blackStringRaster = this.getSpritePartBase64URL('explore-shapes', 62, 94, 5, 5);

            // this.redStringRaster = new myPaper.Raster(this.filePath.getImagePath('red-pattern'));

            // this.purpleStringRaster = new myPaper.Raster(this.filePath.getImagePath('purple-pattern'))

            this.blackStringRaster = new myPaper.Raster({
                source: blackStringRaster

            });
            if (model.get('shape') === 'ellipse') {
                circleCenter.opacity = 0;
            }
            /***/
            this._getRandomMajorMinorAxis();
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('center', center);
            this._calculateFociCenterDist();
            //model.set('fociCenterDist', fociCenterDist);
            /***/
            // model.set('redStringRaster', redStringRaster);
            //model.set('purpleStringRaster', purpleStringRaster);
            //  model.set('redStringRaster', redStringRaster);
            // model.set('purpleStringRaster', purpleStringRaster);
            // model.set('redStringBarRaster', redStringBarRaster);
            //  model.set('purpleStringBarRaster', purpleStringBarRaster);
            imageRaster.remove();

            this._setCircumferencePath();
            circumferencePath = model.get('circumferencePath');
            //            circumferencePath = this._getPointsOnCircumference(center, majorAxis / 2, minorAxis / 2);
            //            //model.set('circumferencePath', circumferencePath);

            thumbTack = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 92, 54, 19, 39));
            thumbTack.position = circumferencePath[70];
            // dummyThumbTack = new this.paperScope2.Raster(this.filePath.getImagePath('thumb-tack'));
            dummyThumbTack.position = circumferencePath[70];
            dummyThumbTack.opacity = 0;
            model.set('dummyThumbTack', dummyThumbTack);
            // dummyThumbTack.position = circumferencePath[70];
            // dummyThumbTack.opacity = 0;
            // thumbTack = new this.paperScope2.Group([thumbTack, dummyThumbTack]);
            //thumbTack.opacity = 0;
            model.set('thumbTack', thumbTack);
            model.set('circleCenter', circleCenter);

            this._setInitialPosition();

            if (showBubbles) {

                this._setBoundsForBubbles();
                this.generateBubbles();
                this._setAnimateBubblesRaster()
            }


            //            if (shape === 'ellipse') {




            //                var showEquation = model.get('showEquation');
            //                if (showEquation) {
            //                    this._addEquationHolderTemplate();


            //                }


            //                foci1.position.x = center.x - fociCenterDist;
            //                foci1.position.y = center.y;
            //                foci2.position.x = center.x + fociCenterDist;
            //                foci2.position.y = center.y;

            //                shapeCenter = new this.paperScope2.Path.Circle({
            //                    center: center,
            //                    radius: 5,
            //                    strokeColor: 'black',
            //                    fillColor: 'black'
            //                });

            //                shapeCenter.name = 'shape-center';
            //                shapeCenter.bringToFront();
            //                //                shapeCenter._class = 'shape-center';
            //                model.set('shapeCenter', shapeCenter);



            //                self._generateString('purple', purpleStringRaster, foci1.position, thumbTack.position, false);
            //                self._generateString('red', redStringRaster, foci2.position, thumbTack.position, false);
            //                //this._generateBar();
            //            }
            //            else if (shape === 'circle') {
            //                foci1.position.x = center.x;
            //                foci1.position.y = center.y;
            //                foci2.position = foci1.position;

            //                shapeCenter = circleCenter;
            //                shapeCenter.position = center;
            //                shapeCenter.name = 'shape-center';
            //                shapeCenter.bringToFront();
            //                model.set('shapeCenter', shapeCenter);
            //                foci1.sendToBack();
            //                foci2.sendToBack();
            //                self._generateString('black', blackStringRaster, shapeCenter.position, thumbTack.position, false);



            //            }

            vector = foci1.position.subtract(foci2.position);
            fociDist = vector.length;

            foci1.name = 'ellipse-foci1';
            foci2.name = 'ellipse-foci2';
            thumbTack.name = 'thumb-tack';
            dummyThumbTack.name = 'thumb-tack';
            //            foci1._class = 'ellipse-foci1';
            //            foci2._class = 'ellipse-foci2';
            //            thumbTack._class = 'thumb-tack';

            model.set('fociDist', fociDist);
            model.set('fociCenterDist', fociDist / 2);
            model.set('center', center);
            //            circumferencePath = this._getPointsOnCircumference(center, majorAxis / 2, minorAxis / 2);
            //            //model.set('circumferencePath', circumferencePath);
            //            thumbTack.position = circumferencePath[70];






            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('thumbTack', thumbTack);
            model.set('dummyThumbTack', dummyThumbTack);
            //model.set('dummyThumbTack', rect);
            //         
            //            self._generateString('purple', purpleStringRaster, foci1.position, thumbTack.position, false);
            //            self._generateString('red', redStringRaster, foci2.position, thumbTack.position, false);

            model.set('lastIndex', circumferencePath.length);

            //self._calculateAngleBisectorPoint(thumbTack.position, foci1.position, foci2.position);
            tackToFoci1 = (thumbTack.position.subtract(foci1.position)).length;
            tackToFoci2 = (thumbTack.position.subtract(foci2.position)).length;
            //            /***/
            //            tackToFoci1 = parseInt(tackToFoci1.toFixed(1));
            //            tackToFoci2 = parseInt(tackToFoci2.toFixed(1));
            //            /***/
            self.model.set('tackToFoci1', tackToFoci1);
            self.model.set('tackToFoci2', tackToFoci2);
            this._drawDummyTackPath();

            if (shape === 'ellipse') {
                this.redBarLoded = false;
                this._generateBar();
                self.model.get('thumbTack').bringToFront();
                this._bringShapeToFront('ellipse')


               
                if (showEquation) {
                    this._addEllipseEquationHolderTemplate();
                    this._showHideEllipseEquation(false);
                }
            }
            else {
                if (shape === 'circle') {
                    if ('showEquation') {

                        this._setRadiusLabel(tackToFoci1);
                        this._bringShapeToFront('circle')
                        this._addCircleEquationHolderTemplate();
                        this._showHideCircleEquation(false);
                    }
                }
            }

            //shapeCenter.bringToFront();

            //this._drawDummyEllipseShape();
            //this._getInterSectingBubbles();



            this._bindEventsOnDraggables(dummyThumbTack);
            this._bindEventsOnDraggables(foci1);
            this._bindEventsOnDraggables(foci2);

            //self.player.enableAllHeaderButtons(true);
            // this._initialAniamtion();


            /****/

        },

        /**
        * sets the animation bubble raster
        *
        * @method _setAnimateBubblesRaster
        * @private
        */

        _setAnimateBubblesRaster: function () {
            var bubbleRasterArray = [];

            bubbleRasterArray.push(this.rasterPattern['animateMiddleBubble1']);
            bubbleRasterArray.push(this.rasterPattern['animateMiddleBubble2']);
            bubbleRasterArray.push(this.rasterPattern['animateMiddleBubble3']);
            this.middleAnimateBubblesRasters = bubbleRasterArray;

            bubbleRasterArray = [];

            bubbleRasterArray.push(this.rasterPattern['animateSmallBubble1']);
            bubbleRasterArray.push(this.rasterPattern['animateSmallBubble2']);
            bubbleRasterArray.push(this.rasterPattern['animateSmallBubble3']);
            this.smallAnimateBubblesRasters = bubbleRasterArray;

            bubbleRasterArray = [];

            bubbleRasterArray.push(this.rasterPattern['animateLargeBubble1']);
            bubbleRasterArray.push(this.rasterPattern['animateLargeBubble2']);
            bubbleRasterArray.push(this.rasterPattern['animateLargeBubble3']);
            this.largeAnimateBubblesRasters = bubbleRasterArray;

        },



        /**
        * Brings the item to front
        *
        * @method _bringShapeToFront
        * @private
        * @param shapeType << {{string}} >> type of shape
        */

        _bringShapeToFront: function (shapeType) {
            var model = this.model,
                radiusLabel = model.get('radiusLabel');
                if (this.dummyGroup) {
                this.dummyGroup.bringToFront();
            }
            model.get('thumbTack').bringToFront();
            if (shapeType === 'circle') {
                model.get('black').bringToFront();
            }
            else {
                if (shapeType === 'ellipse') {


                    model.get('purple').bringToFront();
                    model.get('red').bringToFront();
                }
            }
            model.get('foci1').bringToFront();
            model.get('foci2').bringToFront();

          
            if (radiusLabel) {
                radiusLabel.bringToFront();
            }
            model.get('shapeCenter').bringToFront();
              model.get('dummyThumbTack').bringToFront();
        },

        /**
        * Binds the events
        *
        * @method _bindEventsOnDraggables
        * @private
        * @param item << {{object}} >> item on which events needs to be bind
        */

        _bindEventsOnDraggables: function (item) {

            var $canvas = this.$('#' + this.idPrefix + 'graph-holder-canvas-element-extended'),
                self = this;

            this._unbindEventsOnDraggables(item);

            item.onMouseMove = function () {

                if (!self.isElementDragging) {
                    $canvas.css({ 'cursor': "url('" + self.filePath.getImagePath('open-hand') + "'), move" });
                }
            };

            item.onMouseDown = function (event) {
                MathInteractives.global.SpeechStream.stopReading();
                $canvas.css({ 'cursor': "url('" + self.filePath.getImagePath('closed-hand') + "'), move" });
            };

            item.onMouseDrag = function (event) {
                MathInteractives.global.SpeechStream.stopReading();
                self.isElementDragging = true;
            };
            item.onMouseUp = function (event) {
                MathInteractives.global.SpeechStream.stopReading();
                self.isElementDragging = false;
                $canvas.css({ 'cursor': "url('" + self.filePath.getImagePath('open-hand') + "'), move" });
            };
            item.onMouseLeave = function (event) {
                if (!self.isElementDragging) {
                    $canvas.css({ 'cursor': "default" });
                }
            };
        },

        /**
        * Unbinds the events
        *
        * @method _unbindEventsOnDraggables
        * @private
        * @param item << {{object}} >> item on which events needs to be unbind
        */

        _unbindEventsOnDraggables: function (item) {

            item.detach('mouseenter');
            item.detach('mousemove');
            item.detach('mousedown');
            item.detach('mousedrag');
            item.detach('mouseup');
            item.detach('mouseleave');
        },

        /**
        * Draws the dummy tack path
        *
        * @method _drawDummyTackPath
        * @private
        */

        _drawDummyTackPath: function () {

            var circumferencePath = this.model.get('circumferencePath'),
                currentCircumferencePath = circumferencePath[70],
               dummyTackPath = this.dummyTackPath,
                myPaper = this.paperScope2;
            if (dummyTackPath !== null) {
                dummyTackPath.remove();
            }
            this.dummyTackPath = new myPaper.Path.Rectangle({
                from: [currentCircumferencePath.x - 13, currentCircumferencePath.y - 11],
                to: [currentCircumferencePath.x + 1, currentCircumferencePath.y + 9]



            });

        },

        /**
        * Adds ellipse equation template holder
        *
        * @method _addEllipseEquationHolderTemplate
        * @private
        */

        _addEllipseEquationHolderTemplate: function () {
        
            var template = MathInteractives.Common.Components.templates.explorerShapeEllipse({
                idPrefix: this.idPrefix

            }).trim();
            this.$el.append(template);
            this.loadScreen('explorer-shape-ellipse-equation-screen');
        },

        /**
        * Adds circle equation template holder
        *
        * @method _addCircleEquationHolderTemplate
        * @private
        */

        _addCircleEquationHolderTemplate: function () {


            var template = MathInteractives.Common.Components.templates.explorerShapeCircle({
                idPrefix: this.idPrefix

            }).trim();
            this.$el.append(template);
            this.loadScreen('explorer-shape-circle-equation-screen');

        },


        /**
        * Resets the shape at the center of the graph
        *
        * @method tryAnother
        * @public
        */

        tryAnother: function tryAnother() {

            this.paperScope2.activate();
            // this._snapAll();
            var model = this.model,
                shape = model.get('shape'),
                thumbTack = model.get('thumbTack'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                dummyThumbTack = model.get('dummyThumbTack'),
                circumferencePath,
                tackToFoci1,
                tackToFoci2;

            this._getRandomMajorMinorAxis();
            this._setCircumferencePath();
            circumferencePath = model.get('circumferencePath');
            thumbTack.position = circumferencePath[70];
            dummyThumbTack.position = circumferencePath[70];
            //            model.set('majorAxis', 200);
            //            model.set('minorAxis', 100);
            model.set('thumbTack', thumbTack);
            // this._snapAll();
            this._calculateFociCenterDist();

            if (shape === 'ellipse') {
                var purple = model.get('purple'),
                    red = model.get('red');
                if (purple) {
                    purple.removeChildren();
                    purple.remove();

                }
                if (red) {
                    red.removeChildren();
                    red.remove();
                }
            }
            else if (shape === 'circle') {
                var black = model.get('black'),
                    centerCoordinate = model.get('centerCoordinate');
                if (black) {
                    black.remove();
                }

                if (centerCoordinate) {
                    centerCoordinate.remove();
                }

            }

            this._setInitialPosition();
            this._snapAll();
            tackToFoci1 = (thumbTack.position.subtract(foci1.position)).length;
            tackToFoci2 = (thumbTack.position.subtract(foci2.position)).length;
            model.set('tackToFoci1', tackToFoci1);
            model.set('tackToFoci2', tackToFoci2);

            //this._generateBar();

            model.set('shapeCenterSnapX', 0);
            model.set('shapeCenterSnapY', 0);

            var event = {};
            event.event = {};
            event.event.which = 1;
            event.point = new this.paperScope2.Point(0, 0);
            this._showShapeMouseDownFeatures(event);
            this._showShapeMouseUpFeatures(event);
            this.redBarLoded = false;
            if (shape === 'ellipse') {
                this._redrawBar();
            }
            else if (shape === 'circle') {
                this._setRadiusLabel(tackToFoci1);
                this._displayCircleCenterCoordinates();
            }
            model.set('showPopupOnTryAnother', false);
            if (typeof this.collisionCircles !== 'undefined' && this.collisionCircles !== null) {
                this.collisionCircles.removeChildren();
            }
            this.isAnimating = false;
            this.isRedCircleShown = false;
            this.trigger(this.viewStaticData.CUSTOM_EVENTS.onRedCircle, { isHidden: this.isRedCircleShown });

        },

        /**
        * Sets the snapped positions to all elements
        *
        * @method _snapAll
        * @private
        */

        _snapAll: function () {
            this.paperScope2.activate();
            var model = this.model,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                temp = {},
                tackToFoci1,
                tackToFoci2,
                thumbTack = model.get('thumbTack'),
                dummyThumbTack = model.get('dummyThumbTack');
            temp.point = foci1.position;
            this._setSnappedpoints(temp);
            foci1.position = {
                x: this.model.get('actualSnappedPointX'),
                y: this.model.get('actualSnappedPointY')
            };
            temp.point = foci2.position;
            this._setSnappedpoints(temp);
            foci2.position = {
                x: this.model.get('actualSnappedPointX'),
                y: this.model.get('actualSnappedPointY')
            };
            temp.point = thumbTack.position;
            this._setSnappedpoints(temp);
            thumbTack.position = {
                x: this.model.get('actualSnappedPointX'),
                y: this.model.get('actualSnappedPointY')
            };
            dummyThumbTack.position.x = thumbTack.position.x;
            dummyThumbTack.position.y = thumbTack.position.y;
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('thumbTack', thumbTack);
            model.set('dummyThumbTack', dummyThumbTack);
            this._calculateFociCenterDist();
            this._calculateMajorAxis();
            this._calculateMinorAxis();
            this.paperScope2.view.draw();
        },


        /**
        * Calculates & sets the random value for Major Axis.
        *
        * @method _getRandomMajorMinorAxis
        * @private 
        */

        _getRandomMajorMinorAxis: function _getRandomMajorMinorAxis() {
            var model = this.model,
        //                value = Math.round(Math.random() * 100) + 200,
                value = Math.floor(Math.random() * (300 - 57) + 200),
                majorAxis = value,
                minorAxis,
                shape = model.get('shape');

            if (shape === 'ellipse') {
                minorAxis = 200;
            }
            else if (shape === 'circle') {
                minorAxis = value;
            }

            model.set('majorAxis', majorAxis);
            model.set('minorAxis', minorAxis);


        },

        /**
        * Calculates & sets focicenterDist
        * @method _calculateFociCenterDist
        * @private
        */

        _calculateFociCenterDist: function () {
            var model = this.model,
                majorAxis = model.get('majorAxis'),
                minorAxis = model.get('minorAxis'),
                fociCenterDist = Math.sqrt(((majorAxis / 2) * (majorAxis / 2)) - ((minorAxis / 2) * (minorAxis / 2)));

            model.set('fociCenterDist', fociCenterDist);
        },

        /**
        * Sets the circumference path into model
        *
        * @method _setCircumferencePath
        * @private
        */

        _setCircumferencePath: function _setCircumferencePath() {
            var model = this.model,
                majorAxis = model.get('majorAxis'),
                minorAxis = model.get('minorAxis'),
                center = model.get('center'),
                circumferencePath = this._getPointsOnCircumference(center, majorAxis / 2, minorAxis / 2);
            model.set('circumferencePath', circumferencePath);
        },

        /**
        * Displays the radius label
        *
        * @method _setRadiusLabel
        * @private
        * @param value << {{Number}} >> Radius of Circle
        */

        _setRadiusLabel: function _setRadiusLabel(value) {
            var model = this.model,
                paperScope = this.paperScope2,
                center = model.get('center'),
                radiusLabel = model.get('radiusLabel'),
                shapeCenter = model.get('shapeCenter'),
                thumbTack = model.get('thumbTack'),
                point = shapeCenter.position.subtract(thumbTack.position),
                requiredPoint = new paperScope.Point(),
                tempPoint = new paperScope.Point(),
                lableLine = new paperScope.Path(),
                angle = point.angle,
                gridSizeXAxis = model.get('gridSizeXAxis'),
                restrictMovementAlongCircumference = model.get('restrictMovementAlongCircumference'),
                diffAngle;
            this.paperScope2.activate();
            //            value = Math.round((value / gridSizeXAxis) * 10) / 10;
            value = Math.round(value);
            value = parseInt((value / gridSizeXAxis) * 10) / 10;
            diffAngle = 15 * (10 / value);

            if (value < 3.7) {
                if (radiusLabel) {
                    radiusLabel.remove();
                }
                model.set('radiusLabel', null);
                return;
            }

            lableLine.moveTo(shapeCenter.position);
            lableLine.lineTo(thumbTack.position);
            tempPoint = {
                x: thumbTack.position.x,
                y: shapeCenter.position.y
            };

            requiredPoint = {
                x: (thumbTack.position.x + shapeCenter.position.x) / 2,
                y: (thumbTack.position.y + shapeCenter.position.y) / 2
            };

            if (radiusLabel) {
                radiusLabel.remove();
            }

            var tAngle = (angle + 360) % 360;
            tAngle = tAngle + ((restrictMovementAlongCircumference && ((tAngle > 90 && tAngle < 180) || (tAngle > 270 && tAngle < 360))) ? -diffAngle : diffAngle);
            //console.log(tAngle);            
            var distance2 = Math.sqrt(Math.pow(thumbTack.position.x - shapeCenter.position.x, 2) + Math.pow(thumbTack.position.y - shapeCenter.position.y, 2));
            var displayPoint = new paperScope.Point(0, 0);
            tAngle = tAngle * Math.PI / 180;
            displayPoint.x = shapeCenter.position.x - distance2 / 2 * Math.cos(tAngle);
            displayPoint.y = shapeCenter.position.y - distance2 / 2 * Math.sin(tAngle);
            radiusLabel = new paperScope.PointText({
                content: 'r = ' + value,
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily: 'verdana',
                fillColor: '#555555',
                strokeColor:'#555555'
            });

            radiusLabel.position = displayPoint;
            radiusLabel.bringToFront();

            angle = (point.angle + 360) % 360;
            radiusLabel.rotate(angle + (angle > 90 && angle <= 180 ? 180 : 0) + (angle > 180 && angle < 270 ? 180 : 0));
            var deletaXLineLabel = this.model.get('deletaXLineLabel');
            if (deletaXLineLabel) {
                if (deletaXLineLabel.position.y > shapeCenter.position.y && radiusLabel.position.y > shapeCenter.position.y) {
                    radiusLabel.position.y -= 40;
                }
                if (deletaXLineLabel.position.y < shapeCenter.position.y && radiusLabel.position.y < shapeCenter.position.y) {
                    radiusLabel.position.y += 40;
                }
            }
            model.set('radiusLabel', radiusLabel);
            lableLine.remove();
        },


        /**
        * Sets initial position of shape
        * @method _setInitialPosition
        * @private
        */

        _setInitialPosition: function _setInitialPosition() {
            var model = this.model,
                shape = model.get('shape'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                center = model.get('center'),
                thumbTack = model.get('thumbTack'),
                fociCenterDist = model.get('fociCenterDist'),
                shapeCenter = model.get('shapeCenter'),

                purpleStringRaster = null,
                redStringRaster = null,
                blackStringRaster = model.get('blackStringRaster');




            if (shape === 'ellipse') {

                var showEquation = model.get('showEquation');



                foci1.position.x = center.x - fociCenterDist;
                foci1.position.y = center.y;
                foci2.position.x = center.x + fociCenterDist;
                foci2.position.y = center.y;

                if (shapeCenter === null) {

                    shapeCenter = this.rasterPattern['arrowCenter'];
                    shapeCenter.position = center;
                    shapeCenter.opacity = 1



                    this._bindEventsOnDraggables(shapeCenter);
                }

                //                shapeCenter.name = 'shape-center';
                //                shapeCenter.bringToFront();
                //                shapeCenter._class = 'shape-center';


                this._generateString('purple', purpleStringRaster, foci1.position, thumbTack.position, false);
                this._generateString('red', redStringRaster, foci2.position, thumbTack.position, false);
                //this._generateBar();
            }
            else if (shape === 'circle') {
                var showEquation = model.get('showEquation');



                var circleCenter = model.get('circleCenter');
                foci1.position.x = center.x;
                foci1.position.y = center.y;
                foci2.position = foci1.position;

                shapeCenter = circleCenter;
                shapeCenter.position = center;
                shapeCenter.name = 'shape-center';
                //                shapeCenter.bringToFront();
                //model.set('shapeCenter', shapeCenter);
                foci1.sendToBack();
                foci2.sendToBack();
                this._generateString('black', blackStringRaster, shapeCenter.position, thumbTack.position, false);
                this._bindEventsOnDraggables(shapeCenter);

            }

            shapeCenter.position = center;
            shapeCenter.name = 'shape-center';
            shapeCenter.bringToFront();
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('thumbTack', thumbTack);

            model.set('shapeCenter', shapeCenter);

            this._calculateAngleBisectorPoint(thumbTack.position, foci1.position, foci2.position);
        },

        /**
        * Binds the events
        *
        * @method _bindEvents
        * @private
        */

        _bindEvents: function () {
            if (this.paperScope2 === null || typeof this.paperScope2 === 'undefined') {
                return;
            }

            var self = this,
                currentTool = self.currentTool,
                model = this.model,
                shapeType = model.get('shape'),
                $canvas = self.$('canvas'),
                showGraph = model.get('showGraph');

            if (this.dummyGroup) {
                this.dummyGroup.remove();
            }

            this.dummyGroup = new this.paperScope2.Group([model.get('foci1'), model.get('foci2'), model.get('shapeCenter'),
            model.get('thumbTack'), model.get('dummyThumbTack')]);

            //currentTool.onMouseMove = function (event) {

            //    self._showShapeMouseMoveFeatures(event);
            //    if (showGraph) {
            //        self._showMousemoveFeatures(event);

            //    }

            //};


            currentTool.onMouseUp = function (event) {
                if (event.event.which !== 1 && event.event.which !== 0) {

                    return;
                }
                if (self.isAnimating === true) {
                    return;
                }
               
                self.mouseUpCheck = true;
                self.isElementDragging = false;
                $canvas.css({ 'cursor': "default" });

                if (self.draggableElement === null || typeof self.draggableElement === 'undefined') {
                    return;
                }
                self._setSnappedpoints(event);
                self._showShapeMouseUpFeatures(event);
                self.draggableElement = null;
            },



             currentTool.onMouseDrag = function (event) {
                 if (event.event.which !== 1 && event.event.which !== 0) {

                     return;
                 }
                 if (self.draggableElement === null || typeof self.draggableElement === 'undefined') {
                     return;
                 }
                 if (self.isAnimating === true) {
                     return;
                 }
                 self._setSnappedpoints(event);
                 self._showShapeMouseDragFeatures(event);
                 self._bringShapeToFront(shapeType);
             },
             
            currentTool.onMouseDown = function (event) {
                if (self.isAnimating === true) {
                    return;
                }
                if (event.event.which !== 1 && event.event.which !== 0) {

                    return;
                }
                self._setSnappedpoints(event);
                self._showShapeMouseDownFeatures(event);

            }
//            $canvas.on('mouseenter',function (event) {
//               if (!$.support.touch && self.mouseUpCheck === true) {
//                    $canvas.css({ 'cursor': "default" });
//                }
//            });
           

        },

        /**
        * Contains mouse move features
        *
        * @method _showShapeMouseMoveFeatures
        * @private
        */

        _showShapeMouseMoveFeatures: function () {

            var self = this,
                showGraph = this.model.get('showGraph');
            if (showGraph) {
                //this._setSnappedpoints(event);
            };

            self.hitResult = self.paperScope2.project.hitTest(event.point, self.hitOptions);
            self.paperScope2.project.activeLayer.selected = false;
            if (self.hitResult && self.hitResult.item) {
                self.hitResult.item.selected = true;
            }
        },

        /**
        * Sets the latest position of elements on mouse up
        *
        * @method _showShapeMouseUpFeatures
        * @private
        * @param event << {{object}} >> current event
        */

        _showShapeMouseUpFeatures: function (event) {
            //if(event.event.which === 1) {

            var self = this,
                model = this.model,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                thumbTack = model.get('thumbTack'),
                dummyThumbTack = model.get('dummyThumbTack'),
                majorAxis = model.get('majorAxis'),
                minorAxis = model.get('minorAxis'),
                center = model.get('center'),
                shapeCenter = model.get('shapeCenter'),
                fociCenterDist = model.get('fociCenterDist'),
                vector = foci1.position.subtract(foci2.position),
                bigger, smaller, circumferencePath,
                restrictMovementAlongCircumference = model.get('restrictMovementAlongCircumference'),
                showGraph = model.get('showGraph'),
                dashedShape = model.get('dashedShape'),
                lableA = model.get('lableA'),
                lableB = model.get('lableB'),
                lineA = model.get('lineA'),
                lineB = model.get('lineB'),
                isValid = model.isPointValid(event.point),
                minX = model.get('activityAreaStartPoint').xCoordinate,
                minY = model.get('activityAreaStartPoint').yCoordinate,
                maxX = model.get('activityAreaEndPoint').xCoordinate,
                maxY = model.get('activityAreaEndPoint').yCoordinate,
                foci1Position = foci1.position,
                foci2Position = foci2.position,
                actualSnappedPointX = this.actualSnappedPointX,
                actualSnappedPointY = this.actualSnappedPointY,
                thumbTackPosition = thumbTack.position,
                isFociMovable = model.get('isFociMovable'),
                tackToFoci1 = model.get('tackToFoci1'),
                tackToFoci2 = model.get('tackToFoci2'),
                isCenterMovable = model.get('isCenterMovable'),
                isThumbTackMovable = model.get('isThumbTackMovable'),
                shapeType = model.get('shape'),
                animationStarted = model.get('animationStarted'),
                circumferenceAlongFoci1 = model.get('circumferenceAlongFoci1'),
                circumferenceAlongFoci2 = model.get('circumferenceAlongFoci2'),
                isPointSnapped = true;

            if (showGraph) {
                this._setSnappedpoints(event);
            }

            model.set('fociDist', vector.length);
            model.set('fociCenterDist', (vector.length) / 2);

            if (foci1Position.y == foci2Position.y) {
                bigger = majorAxis;
                smaller = minorAxis;
            }
            else if (foci1Position.x == foci2Position.x) {
                bigger = minorAxis;
                smaller = majorAxis;
            }

            if ((self.draggableElement.name === 'thumb-tack') && restrictMovementAlongCircumference === false) {
                if (isFociMovable) {
                    var vector3 = event.point.subtract(foci1.position).length,
                        vector4 = event.point.subtract(foci2.position).length,
                        vector5 = event.point.subtract(shapeCenter.position).length,
                        pointX = event.point.x,
                        pointY = event.point.y,
                        draggableElement = self.draggableElement,
                        draggableElementBound = draggableElement.bounds,
                        draggableElementHeight = self.thumbTackHeight,
                        draggableElementWidth = self.thumbTackWidth;


                    if ((pointX > minX + draggableElementWidth / 2) && (pointX < maxX - draggableElementWidth / 2) && (pointY > minY + draggableElementHeight / 2) && (pointY < maxY - draggableElementHeight / 2) && vector3 >= 57 && vector4 >= 57 && vector5 >= 57) {

                        self.draggableElement.position.x = actualSnappedPointX;
                        self.draggableElement.position.y = actualSnappedPointY;
                    }
                    else {
                        pointX = self.draggableElement.position.x;
                        pointY = self.draggableElement.position.y;
                        if (pointX < minX + draggableElementWidth / 2) {

                            pointX = minX + 15;
                        }
                        else {

                            if (pointX > maxX - draggableElementWidth / 2) {

                                pointX = maxX - 10;
                            }

                        }
                        if (pointY < minY + draggableElementHeight / 2) {
                            pointY = minY + 10;

                        }
                        else if (pointY > maxY - draggableElementHeight / 2) {

                            pointY = maxY - 10;
                        }
                        self.draggableElement.position = [pointX, pointY];
                    }
                }
            }


            if (self.draggableElement.name === 'shape-center' && restrictMovementAlongCircumference === false) {
                if (true || isCenterMovable) {
                    if ((event.point.x + fociCenterDist > maxX || event.point.x - fociCenterDist < minX) && foci1.position.y === foci2.position.y) {

                    }
                    if ((event.point.y + fociCenterDist > maxY || event.point.y - fociCenterDist < minY) && foci1.position.x === foci2.position.x) {
                    }
                    var temp = {};
                    temp.point = shapeCenter.position;
                    this._setSnappedpoints(temp);
                    shapeCenter.position = {
                        x: this.model.get('actualSnappedPointX'),
                        y: this.model.get('actualSnappedPointY')
                    };
                    model.set('shapeCenter', shapeCenter);
                    model.set('shapeCenterSnapX', this.snappedX);
                    model.set('shapeCenterSnapY', this.snappedY);
                    var diff = temp.point;
                    diff = { x: diff.x - shapeCenter.position.x, y: diff.y - shapeCenter.position.y };
                    foci1.position.x = foci1.position.x - diff.x;
                    foci1.position.y = foci1.position.y - diff.y;
                    foci2.position.x = foci2.position.x - diff.x;
                    foci2.position.y = foci2.position.y - diff.y;
                    thumbTack.position.x = thumbTack.position.x - diff.x;
                    thumbTack.position.y = thumbTack.position.y - diff.y;
                    model.set('foci1', foci1);
                    model.set('foci2', foci2);
                    model.set('thumbTack', thumbTack);
                }
            }

            var temp = {};
            temp.point = foci1.position;
            if (showGraph) {
                this._setSnappedpoints(temp);
            }
            foci1.position = {
                x: this.model.get('actualSnappedPointX'),
                y: this.model.get('actualSnappedPointY')
            };
            temp.point = foci2.position;
            if (showGraph) {
                this._setSnappedpoints(temp);
            }
            foci2.position = {
                x: this.model.get('actualSnappedPointX'),
                y: this.model.get('actualSnappedPointY')
            };
            if (!restrictMovementAlongCircumference) {
                temp.point = thumbTack.position;
                this._setSnappedpoints(temp);
                thumbTack.position = {
                    x: this.model.get('actualSnappedPointX'),
                    y: this.model.get('actualSnappedPointY')
                };
                model.set('thumbTack', thumbTack);
            }
            model.set('foci1', foci1);
            model.set('foci2', foci2);

            tackToFoci1 = (thumbTack.position.subtract(foci1.position)).length;
            tackToFoci2 = (thumbTack.position.subtract(foci2.position)).length;

            model.set('tackToFoci1', tackToFoci1);
            model.set('tackToFoci2', tackToFoci2);
            this._calculateMajorAxis();
            this._calculateMinorAxis();
            majorAxis = this.model.get('majorAxis');
            minorAxis = this.model.get('minorAxis');
            if (foci1Position.y == foci2Position.y) {
                bigger = majorAxis;
                smaller = minorAxis;
            }
            else if (foci1Position.x == foci2Position.x) {
                bigger = minorAxis;
                smaller = majorAxis;
            }
            circumferencePath = self._getPointsOnCircumference(shapeCenter.position, bigger / 2, smaller / 2);
            model.set('circumferencePath', circumferencePath);
            self._calculateAngleBisectorPoint(thumbTackPosition, foci1Position, foci2Position);
            shapeCenter.bringToFront();
            self._drawDummyEllipseShape();
            self._getInterSectingBubbles();
            self._setTackPosition();
            self._redrawStrings();
            if (!animationStarted) {
                model.set('isFociMovable', true);
                model.set('isCenterMovable', true);
            }

            if (dashedShape) {
                model.set('isCenterMovable', false);
                model.set('isFociMovable', false);
            }
            this._bringShapeToFront(shapeType);

            if (shapeType === 'circle') {
                self._setRadiusLabel(tackToFoci1);
                self._displayCircleCenterCoordinates();
            }
            this.redBarLoded = false;
            if (this.model.get('shape') === 'ellipse') {
                this._redrawBar();
            }
            if (restrictMovementAlongCircumference === false && this.isAnimating === false) {
                self.isRedCircleShown = self._showCollisionCircle();
            }
            self.trigger(self.viewStaticData.CUSTOM_EVENTS.onRedCircle, { isHidden: self.isRedCircleShown });

        },

        /**
        * Moves the foci alongwith the center
        *
        * @method _moveFociAlongwithcenter
        * @private
        * @param foci1 << {{object}} >> Foci 1
        * @param foci2 << {{object}} >> Foci 2
        * @param fociCenterDist << {{Number}} >> Distance between focus & center
        */

        _moveFociAlongwithcenter: function _moveFociAlongwithcenter(foci1, foci2, fociCenterDist) {

            var model = this.model,
                isFociMovable = model.get('isFociMovable'),
                foci1Position = foci1.position,
                foci2Position = foci2.position,
                draggableElementPosition = this.draggableElement.position,
                minX = model.get('activityAreaStartPoint').xCoordinate,
                minY = model.get('activityAreaStartPoint').yCoordinate,
                maxX = model.get('activityAreaEndPoint').xCoordinate,
                maxY = model.get('activityAreaEndPoint').yCoordinate,
                flag = true;
            if (isFociMovable) {
                if (foci1Position.y == foci2Position.y) {
                    if (((draggableElementPosition.x - fociCenterDist) > minX) && ((draggableElementPosition.x - fociCenterDist) < maxX)) {
                        foci1.position.x = draggableElementPosition.x - fociCenterDist;
                    }
                    else {
                        model.set('isFociMovable', false);
                        model.set('isCenterMovable', false);
                    }
                    if (((draggableElementPosition.y) > minY) && ((draggableElementPosition.y) < maxY)) {
                        foci1.position.y = draggableElementPosition.y;
                    }
                    else {
                        model.set('isFociMovable', false);
                        model.set('isCenterMovable', false);
                    }
                    if (((draggableElementPosition.x + fociCenterDist) > minX) && ((draggableElementPosition.x + fociCenterDist) < maxX)) {
                        foci2.position.x = draggableElementPosition.x + fociCenterDist;
                    }
                    else {
                        model.set('isFociMovable', false);
                        model.set('isCenterMovable', false);
                    }
                    if (((draggableElementPosition.y) > minY) && ((draggableElementPosition.y) < maxY)) {
                        foci2.position.y = draggableElementPosition.y;
                    }
                    else {
                        model.set('isFociMovable', false);
                        model.set('isCenterMovable', false);
                    }
                }
                if (foci1Position.x == foci2Position.x) {
                    if (((draggableElementPosition.y - fociCenterDist) > minY) && ((draggableElementPosition.y - fociCenterDist) < maxY)) {
                        foci1.position.y = draggableElementPosition.y - fociCenterDist;
                    }
                    else {
                        model.set('isFociMovable', false);
                        model.set('isCenterMovable', false);
                    }
                    if (((draggableElementPosition.x) > minX) && ((draggableElementPosition.x) < maxX)) {
                        foci1.position.x = draggableElementPosition.x;
                    }
                    else {
                        model.set('isFociMovable', false);
                        model.set('isCenterMovable', false);
                    }
                    if (((draggableElementPosition.y + fociCenterDist) > minY) && ((draggableElementPosition.y + fociCenterDist) < maxY)) {
                        foci2.position.y = draggableElementPosition.y + fociCenterDist;
                    }
                    else {
                        model.set('isFociMovable', false);
                        model.set('isCenterMovable', false);
                    }
                    if (((draggableElementPosition.x) > minX) && ((draggableElementPosition.x) < maxX)) {
                        foci2.position.x = draggableElementPosition.x;
                    }
                    else {
                        model.set('isFociMovable', false);
                        model.set('isCenterMovable', false);
                    }
                }
            }
            model.set('foci1', foci1);
            model.set('foci2', foci2);
        },

        /**
        * Sets the draggable element on mouse down
        *
        * @method _showShapeMouseDownFeatures
        * @private
        * @param event << {{object}} >> current event
        */

        _showShapeMouseDownFeatures: function (event) {
            //if(event.event.which === 1) {

            var self = this,
                shapeType = this.model.get('shape'),
                showGraph = this.model.get('showGraph');
            if (showGraph) {
                this._setSnappedpoints(event);
            };

            self.hitResult = self.paperScope2.project.hitTest(event.point, self.hitOptions);
            if (self.hitResult) {
                if (self.hitResult.item.name === 'thumb-tack') {
                    self.draggableElement = self.model.get('thumbTack');
                }
                else {
                    self.draggableElement = self.hitResult.item;
                }
                self.shapeCenter = {
                    x: self.draggableElement.position.x,
                    y: self.draggableElement.position.y
                }
            }


            this._bringShapeToFront(shapeType);
            //}
        },

        /**
        * Drags the selected element on mouse drag & update its position in the model
        *
        * @method _showShapeMouseDragFeatures
        * @private
        * @param event << {{object}} >> current event
        */

        _showShapeMouseDragFeatures: function (event) {
            //if(event.event.which === 1) {
            var self = this,
                model = self.model,
                thumbTack = model.get('thumbTack'),
                dummyThumbTack = model.get('dummyThumbTack'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                tackToFoci1 = model.get('tackToFoci1'),
                tackToFoci2 = model.get('tackToFoci2'),
                shapeCenter = model.get('shapeCenter'),
                dashedShape = model.get('dashedShape'),
                paperScope2=this.paperScope2,
                vector = foci1.position.subtract(foci2.position),
                vectorLength = vector.length,
                nearestPoint,
                restrictMovementAlongCircumference = model.get('restrictMovementAlongCircumference'),
                shape = model.get('shape'),
                showGraph = model.get('showGraph'),
                isValid,
                minX = model.get('activityAreaStartPoint').xCoordinate,
                minY = model.get('activityAreaStartPoint').yCoordinate,
                maxX = model.get('activityAreaEndPoint').xCoordinate,
                maxY = model.get('activityAreaEndPoint').yCoordinate,
                draggableElementPosition = self.draggableElement.position,
                thumbTackPosition = thumbTack.position,
                isFociMovable,
                isCenterMovable = model.get('isCenterMovable'),
                isThumbTackMovable = model.get('isThumbTackMovable'),
                circumferencePath = model.get('circumferencePath'),
                circumferenceAlongFoci1 = model.get('circumferenceAlongFoci1'),
                circumferenceAlongFoci2 = model.get('circumferenceAlongFoci2'),
                currentPosition = null,
                thumbTackAcc=false,
                centerAcc=false,
                fociAcc=null,
                origPos=null,
                diff=null,
                bounds=null,path=null,
                foci1Rect=null,
                foci2Rect=null,
                thumbTackRect=null,
                dummyThumbTackRect=null,
                shapeCenterRect=null;

            if (showGraph) {
                this._setSnappedpoints(event);
            };
            
            isFociMovable = model.get('isFociMovable');
            model.set('fociDist', vectorLength);
            model.set('fociCenterDist', vectorLength / 2);
            isValid = model.isPointValid(event.point);
            if (self.draggableElement.name == 'thumb-tack') {
                model.set('showPopupOnTryAnother', true);
                if (isThumbTackMovable) {
                    if (restrictMovementAlongCircumference === false) {
                        var vector3 = event.point.subtract(foci1.position).length,
                            vector4 = event.point.subtract(foci2.position).length,
                            vector5 = event.point.subtract(shapeCenter.position).length,
                            pointX = event.point.x,
                            pointY = event.point.y,
                            draggableElement = self.draggableElement,
                            draggableElementBound = draggableElement.bounds,
                            draggableElementHeight = self.thumbTackHeight,
                            draggableElementWidth = self.thumbTackWidth;
//                        if ((pointY > minY + draggableElementHeight / 2) && (pointY < maxY - draggableElementHeight / 2)) {
//                        thumbTackAcc=false;
//                        }
//                        else {
//                            if ((vector3 >= 57) && (vector4 >= 57) && (vector5 >= 57) && (pointX > minX + draggableElementWidth / 2) && (pointX < maxX - draggableElementWidth / 2)) {
//                                self.draggableElement.position.x = event.point.x;
//                                dummyThumbTack.position.x = event.point.x;
//                            }
//                            else{
//                            thumbTackAcc=true;
//                            }
//                        }

//                        if ((pointX > minX + draggableElementWidth / 2) && (pointX < maxX - draggableElementWidth / 2)) {
//                            thumbTackAcc=false;
//                        }
//                        else {
//                            if ((vector3 >= 57) && (vector4 >= 57) && (vector5 >= 57) && (pointY > minY + draggableElementHeight / 2) && (pointY < maxY - draggableElementHeight / 2)) {
//                                self.draggableElement.position.y = event.point.y;
//                                dummyThumbTack.position.y = event.point.y;
//                            }
//                            else
//                            {
//                            thumbTackAcc=true;
//                            }
//                        }
//                        if ((pointX > minX + draggableElementWidth / 2) && (pointX < maxX - draggableElementWidth / 2) && (pointY > minY + draggableElementHeight / 2) && (pointY < maxY - draggableElementHeight / 2)) {

//                            //if ((vector3 >= 57) && (vector4 >= 57) && (vector5 >= 57)) {
//                            self.draggableElement.position = event.point;
//                            dummyThumbTack.position = event.point;
//                            //}

//                        }
                         if((vector3 >=57) && (vector4>=57) && (vector5>=57)){
                                if((pointX > minX + draggableElementWidth/2) && (pointX < maxX - draggableElementWidth/2))
                                {
                                 self.draggableElement.position.x = event.point.x;
                                 dummyThumbTack.position.x = event.point.x;
                                }
                                else
                                {
                                thumbTackAcc=true;
                                }
                                if((pointY > minY + draggableElementHeight/2) && (pointY < maxY - draggableElementHeight/2))
                                {
                                 self.draggableElement.position.y = event.point.y;
                                 dummyThumbTack.position.y = event.point.y;
                                }
                                else
                                {
                                thumbTackAcc=true;
                                }
                         }
                         else
                         {
                             if((pointX > minX + draggableElementWidth/2) && (pointX < maxX - draggableElementWidth/2)&&(pointY > minY + draggableElementHeight/2) && (pointY < maxY - draggableElementHeight/2))
                                {
                                
                                     self.draggableElement.position = event.point;
                                       dummyThumbTack.position = event.point;
                                   
                                }
                                else
                                {
                                thumbTackAcc=true;
                                }
                         }
                        self._calculateMajorAxis();
                        self._calculateMinorAxis();
                    }
                    else {

                        nearestPoint = self._getNearestPoint(event.point, circumferencePath);
                        if (nearestPoint !== null) {
                            self.draggableElement.position = nearestPoint;
                            dummyThumbTack.position = nearestPoint;
                        }
                        if (shape === 'circle') {
                            this.circleDrawLabel();
                        }
                    }
                }
                if(thumbTackAcc===false && self.afterFirstAnimate===true)
                {
                    self.focusRect.position=thumbTack.position;
                }
                this.model.set('thumbTackAcc',thumbTackAcc);
            }

            if (self.draggableElement.name == 'ellipse-foci1' || self.draggableElement.name == 'ellipse-foci2') {

                model.set('showPopupOnTryAnother', true);
                self._adjustFociPosition(event, self.draggableElement);
                fociAcc=model.get('fociAcc');
                if(fociAcc===false)
               {
                if(self.draggableElement.name === 'ellipse-foci1' && self.afterFirstAnimate===true)
                {
                    self.focusRect.position=foci1.position;
                }
                else if(self.draggableElement.name === 'ellipse-foci2' && self.afterFirstAnimate===true)
                {
                    self.focusRect.position=foci2.position;
                }
               }
            }

            if (self.draggableElement.name == 'shape-center' && !dashedShape) {
                model.set('showPopupOnTryAnother', true);
                if (isCenterMovable) {
                    if (this.dummyGroup) {
                        this.dummyGroup.remove();
                        this.dummyGroup = new paperScope2.Group([foci1, foci2, thumbTack, dummyThumbTack, shapeCenter]);
                    }
                    origPos = shapeCenter.position.clone();
                    diff = { x: origPos.x - event.point.x, y: origPos.y - event.point.y };
                   
                    this.dummyGroup.position.x -= diff.x;
                    this.dummyGroup.position.y -= diff.y;
                    foci1Rect= paperScope2.Path.Rectangle({
                            x: foci1.position.x-foci1.width/2,
                            y: foci1.position.y-foci1.height/2,
                            width:foci1.width,
                            height: foci1.height
                           });
                    foci2Rect= paperScope2.Path.Rectangle({
                            x: foci2.position.x-foci2.width/2,
                            y: foci2.position.y-foci2.height/2,
                            width:foci2.width,
                            height: foci2.height
                         });
                    thumbTackRect= paperScope2.Path.Rectangle({
                            x: thumbTack.position.x-self.thumbTackWidth/2,
                            y: thumbTack.position.y-self.thumbTackHeight/2,
                            width:self.thumbTackWidth,
                            height: self.thumbTackHeight
                         });
                    dummyThumbTackRect= paperScope2.Path.Rectangle({
                            x: foci1.position.x-self.thumbTackWidth/2,
                            y: foci1.position.y-self.thumbTackHeight/2,
                            width:self.thumbTackWidth,
                            height: self.thumbTackHeight
                         });
                    shapeCenterRect= paperScope2.Path.Rectangle({
                           x: shapeCenter.position.x-shapeCenter.width/2,
                            y: shapeCenter.position.y-shapeCenter.height/2,
                            width:shapeCenter.width,
                            height: shapeCenter.height
                         });
                    path = new paperScope2.Group([foci1Rect, foci2Rect, thumbTackRect, dummyThumbTackRect, shapeCenterRect]);
                   
                    bounds = path.bounds;

                   if(diff.x !== 0){
                        if (bounds.x < minX) {
                            this.dummyGroup.position.x -= bounds.x - minX;
                            centerAcc=true;
                        }
                        if (bounds.x + bounds.width > maxX) {
                            this.dummyGroup.position.x -= bounds.x + bounds.width - maxX;
                            centerAcc=true;
                        }
                    }
                    if(diff.y !== 0){
                        if (bounds.y < minY) {
                            this.dummyGroup.position.y -= bounds.y - minY;
                            centerAcc=true;
                        }
                        if (bounds.y + bounds.height > maxY) {
                            this.dummyGroup.position.y -= bounds.y + bounds.height - maxY;
                            centerAcc=true;
                        }
                    }
                    
//                    bounds = this.dummyGroup.bounds;
//                   
//                    if (bounds.x > minX && bounds.x + bounds.width < maxX && bounds.y > minY && bounds.y + bounds.height < maxY) {
//                        this.dummyGroup.position.x -= diff.x;
//                        this.dummyGroup.position.y -= diff.y;
//                    }
//                    else{
//                        centerAcc=true;
//                    }
//                    
                    var temp= {};
                    temp.point = shapeCenter.position;
                    this._setSnappedpoints(temp);
                    model.set('shapeCenterSnapX', this.snappedX);
                    model.set('shapeCenterSnapY', this.snappedY);
                    model.set('centerAcc',centerAcc);
                    path.remove();
                    foci1Rect.remove();
                    foci2Rect.remove();
                    thumbTackRect.remove();
                    dummyThumbTackRect.remove();
                    shapeCenterRect.remove();

                }
                if(centerAcc===false && self.afterFirstAnimate===true)
                {
                self.focusRect.position=shapeCenter.position;
                }
            }

            tackToFoci1 = (thumbTack.position.subtract(foci1.position)).length;
            tackToFoci2 = (thumbTack.position.subtract(foci2.position)).length;

            model.set('tackToFoci1', tackToFoci1);
            model.set('tackToFoci2', tackToFoci2);
            model.set('thumbTack', thumbTack);
            model.set('shapeCenter', shapeCenter);
            self._calculateMajorAxis();
            self._calculateMinorAxis();
            self._redrawStrings();
            if (shape === 'ellipse') {
                self._redrawBar();
            }
            else if (shape === 'circle') {
                self._setRadiusLabel(tackToFoci1);
                self._displayCircleCenterCoordinates();
            }
            self._calculateAngleBisectorPoint(thumbTack.position, foci1.position, foci2.position);
            if (restrictMovementAlongCircumference === false && this.isAnimating === false) {
                self.isRedCircleShown = self._showCollisionCircle();
            }

            // }

        },

        /**
        * Draws the red circle when the distance between thumbtack & center or foci1 or foci2 reduces to minimum value
        *
        * @method _showCollisionCircle
        * @private
        * @param <<paramName>> << {{param type }} >> <<description>>
        * @return  << {{boolean}} >> true or false
        */

        _showCollisionCircle: function () {
            var model = this.model,
                shape = model.get('shape'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                shapeCenter = model.get('shapeCenter'),
                thumbTack = model.get('thumbTack'),
                vector1 = thumbTack.position.subtract(foci1.position).length,
                vector2 = null,
                vector3 = null,
                isCollision = false;
            if (typeof this.collisionCircles === 'undefined') {
                this.collisionCircles = new this.paperScope2.Group();

            }
            this.collisionCircles.removeChildren();
            if (shape === 'ellipse') {
                vector2 = thumbTack.position.subtract(foci2.position).length;
                vector3 = thumbTack.position.subtract(shapeCenter.position).length;
            }
            if (shape === 'ellipse') {
                if (vector1 < 57) {
                    this.drawRedCircle(foci1.position);
                    isCollision = true;
                }
                if (vector2 < 57) {
                    this.drawRedCircle(foci2.position);
                    isCollision = true;
                }
                if (vector3 < 57) {
                    this.drawRedCircle(shapeCenter.position);
                    isCollision = true;
                }
            }
            else if (shape === 'circle') {
                if (vector1 < 57) {
                    this.drawRedCircle(foci1.position);
                    isCollision = true;
                }
            }
            this.trigger(MathInteractives.Common.Components.Views.ExplorerShape.CUSTOM_EVENTS.onInsideCollisionCircle, isCollision);
            return isCollision;
        },

        /**
        * Draws the red circle when the distance between thumbtack & center or foci1 or foci2 reduces to minimum value
        *
        * @method drawRedCircle
        * @private
        * @param point << {{object}} >> position of the red circle
        */

        drawRedCircle: function (point) {
            var redCircle = new this.paperScope2.Path.Circle({
                center: point,
                radius: 56,
                fillColor: '#ff0000',
                opacity: 0.35
            });
            this.collisionCircles.addChild(redCircle);
        },

        /**
        * Draws the dummy shape for the ellipse
        *
        * @method _drawDummyEllipseShape
        * @private
        */

        _drawDummyEllipseShape: function () {


            var self = this,
                model = this.model,
                myPaper = self.paperScope2,
                majorAxis = model.get('majorAxis'),
                minorAxis = model.get('minorAxis'),
                shapeCenter = model.get('shapeCenter'),
                thumpTac = model.get('thumbTack'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                size = [majorAxis, minorAxis],
                center = null,
                dummyEllipse = self.dummyEllipse;

            if (shapeCenter !== null) {
                center = shapeCenter.position;

            }
            else {
                center = model.get('originPosition');

            }

            if (dummyEllipse !== null) {

                this.dummyEllipse.remove();
            }

            if (foci1.position.x === foci2.position.x) {

                size = [minorAxis, majorAxis]
            }
            this.dummyEllipse = new myPaper.Path.Ellipse({

                center: [center.x, center.y],
                size: size,
                strokeWidth: 10

            });


            this.dummyEllipse.sendToBack();
            //            thumpTac.bringToFront();
            //            foci1.bringToFront();
            //            foci2.bringToFront();



        },

        /**
        * Calculates & sets the intersecting bubbles
        *
        * @method _getInterSectingBubbles
        * @private
        */

        _getInterSectingBubbles: function () {

            var self = this,
             model = self.model,
             dummyEllipse = this.dummyEllipse,
             currentBubblePath = null,
             intersectionArray = null,
             intersectionArray2 = null,
             intersectionArea = null,
             intersectionArea2 = null,
             tempArray = [],
             count = 0,//new code from here
             smallBubbleGroup = model.get('smallBubbleGroup'),
             largeBubbleGroup = model.get('largeBubbleGroup'),
             middleBubbleGroup = model.get('middleBubbleGroup'),
             incrementor = 0,
             currentGroup = null,
             currentPath = null,
             tempArray = [],
             removeBubble = model.get('showPoppedBubbles'),
             removePathArray = new Array(),
             allBubbleGroup = model.get('allBubbleGroup');


            for (count = 0; count < allBubbleGroup.children.length; count++) {
                currentGroup = allBubbleGroup.children[count];

                for (incrementor = 0; incrementor < currentGroup.children.length; incrementor++) {
                    //for (incrementor in currentGroup.children) {
                    currentPath = currentGroup.children[incrementor].children[0];//currentPath
                    currentPath.bringToFront();
                    intersectionArray = currentPath.getIntersections(dummyEllipse);
                    intersectionArray2 = dummyEllipse.getIntersections(currentPath);
                    intersectionArea = currentPath.intersect(dummyEllipse);
                    intersectionArea2 = dummyEllipse.intersect(currentPath);
                    currentPath.sendToBack();
                    if (intersectionArray.length > 0 || intersectionArray2.length > 0) {
                        tempArray.push(currentPath);
                        removePathArray.push(currentPath);
                        //if (removeBubble) {
                        //    //
                        //    currentPath.parent.remove();

                        //}
                    }
                    intersectionArea.remove();
                    intersectionArea2.remove();

                }

            }

            if (removeBubble) {

                for (count = 0; count < removePathArray.length; count++) {

                    removePathArray[count].parent.remove();
                }
            }
            model.set('intersectBubblesArray', tempArray);
            model.set('noOfBubblesToPop', tempArray.length);

        },

        /**
        * set min,max limts for bubbles also set the value of center of bubble area
        * @method _setBoundsForBubbles
        * @private
        */

        _setBoundsForBubbles: function () {

            var model = this.model,
                startPoint = model.getStartPointBubble(),
                endPoint = model.getEndPointBubble(),
                startXCoordinate = startPoint.xCoordinate,
                startYCoordinate = startPoint.yCoordinate,
                endXCoordinate = endPoint.xCoordinate,
                endYCoordinate = endPoint.yCoordinate,
                paddingFromEndPoints = 15,
                bubblesBoundsCenter = {};


            this.minXBubbleBound = startXCoordinate + paddingFromEndPoints;
            this.minYBubbleBound = startYCoordinate + paddingFromEndPoints;
            this.maxXBubblebound = endXCoordinate - paddingFromEndPoints;
            this.maxYBubbleBound = endYCoordinate - paddingFromEndPoints;



            bubblesBoundsCenter.x = (endXCoordinate - startXCoordinate) / 2 + startXCoordinate;
            bubblesBoundsCenter.y = (endYCoordinate - startYCoordinate) / 2 + startYCoordinate;
            this.bubblesBoundsCenter = bubblesBoundsCenter; // bounds of canvas will get divided into four quadrants           
            model.set('bubblesBoundsCenter', bubblesBoundsCenter);

        },

        /**
        *generate bubbles on canvas
        * @method generateBubbles
        * @private
        */

        generateBubbles: function () {
            this.paperScope2.activate();
            this.isAnimating = true;

            var model = this.model,
                viewStaticData = this.viewStaticData,
                bubbleRadiusObject = viewStaticData.RADIUS_OF_BUBBLES,
                bubblePositions = viewStaticData.POSITION_OF_BUBBLE,
                positionOfBubbleInSprite = null,
                currentPositionArray = [],
                currentGroupArray = null,
                bubbleRadius = null,
                generateNewBubbles = model.get('generateNewBubbles'),
                currentPosition = null,
                myPaper = this.paperScope2,
                bubblesPresent = false,
                dummyBubblePathArray = new Array(),
                largeBubbleGroup = model.get('largeBubbleGroup'),
                shapeType = model.get('shape'),
                currentGroup = null,
                allBubbleGroup = new myPaper.Group(),
                showEquation = model.get('showEquation'),
                currentRandomNumber = null,
                currentLength = null,
                count = null,
                allPositionsArray = null,
                populateBubble = model.get('populateBubble'),
                totalArrayLength = null;

            this._unbindEventsOnDraggables(model.get('foci1'));
            this._unbindEventsOnDraggables(model.get('foci2'));
            this._unbindEventsOnDraggables(model.get('shapeCenter'));
            this._unbindEventsOnDraggables(model.get('thumbTack'));
            this._unbindEventsOnDraggables(model.get('dummyThumbTack'));


            if (typeof this.bubbleGroup === 'undefined') {
                this.bubbleGroup = new this.paperScope2.Group();
            }

            if (showEquation && shapeType === 'ellipse') {
                this._showHideEllipseEquation(false);

            }
            if (showEquation && shapeType === 'circle') {

                this._showHideCircleEquation(false);
            }

            bubbleRadius = bubbleRadiusObject.largeBubbleRadius;




            if (largeBubbleGroup !== null) {
                bubblesPresent = true;
                model.set('intersectBubblesArray', null);
                this._clearBubbles();
                model.set('largeBubbleGroup', null)
                model.set('middleBubbleGroup', null)
                model.set('smallBubbleGroup', null);
                model.set('dummyBubblePath', []);

            }



            if (generateNewBubbles) {

                allPositionsArray = model.setPositionsOfBubbles();

                totalArrayLength = allPositionsArray.length;
                currentLength = Math.floor(totalArrayLength / 3);

                currentPositionArray = [];

                for (count = 0; count < currentLength; count++) {

                    currentRandomNumber = model.generateRandomNumber(0, allPositionsArray.length - 2);
                    currentPositionArray.push(allPositionsArray[currentRandomNumber]);
                    allPositionsArray.splice(currentRandomNumber, 1);


                }

                model.set('currentLargeBubblesPosition', currentPositionArray);
            }
            else {
                currentPositionArray = model.get('currentLargeBubblesPosition');

            }



            currentGroup = this._drawBubble(this.rasterPattern['largeBubble'], currentPositionArray, bubbleRadius);


            allBubbleGroup.addChild(currentGroup);
            model.set('largeBubbleGroup', currentGroup);

            bubbleRadius = bubbleRadiusObject.middleBubbleRadius;



            if (generateNewBubbles) {

                currentPositionArray = [];

                for (count = 0; count < currentLength; count++) {

                    currentRandomNumber = model.generateRandomNumber(0, allPositionsArray.length - 2);
                    currentPositionArray.push(allPositionsArray[currentRandomNumber]);

                    allPositionsArray.splice(currentRandomNumber, 1);

                }

                //currentPositionArray = model.setPositionsOfBubbles();
                model.set('currentMiddleBubblesPosition', currentPositionArray);
            }
            else {
                currentPositionArray = model.get('currentMiddleBubblesPosition');

            }

            currentGroup = this._drawBubble(this.rasterPattern['middleBubble'], currentPositionArray, bubbleRadius);

            allBubbleGroup.addChild(currentGroup);
            model.set('middleBubbleGroup', currentGroup)


            bubbleRadius = bubbleRadiusObject.smallBubbleRadius;

            if (generateNewBubbles) {

                currentPositionArray = allPositionsArray;
                model.set('currentSmallBubblesPosition', currentPositionArray);

            }
            else {
                currentPositionArray = model.get('currentSmallBubblesPosition');
            }





            currentGroup = this._drawBubble(this.rasterPattern['smallBubble'], currentPositionArray, bubbleRadius, true);

            model.set('smallBubbleGroup', currentGroup);
            allBubbleGroup.addChild(currentGroup);
            model.set('allBubbleGroup', allBubbleGroup);
            model.get('allBubbleGroup').sendToBack();
            this._drawDummyEllipseShape();
            this._drawDummyTackPath();
            this._setTackPosition();
            this._getInterSectingBubbles();
            model.get('thumbTack').bringToFront();
            this._bringShapeToFront(shapeType);

            if (populateBubble) {
                this.trigger(viewStaticData.CUSTOM_EVENTS.bubblePopulationAnimationStart);
                this.populateBubble();
            }

        },

        /**
        * draw  given size bubbles on given position
        * @method _generateBubbles
        * @private
        */

        _createRaster: function (x, y) {
            var self = this,
                imageRaster = null;

            imageRaster = new self.paperScope2.Raster({
                source: self.currentImage,
                position: [x, y]

            });

            return imageRaster;
        },

        /**
        * Clears the bubbles
        *
        * @method _clearBubbles
        * @private
        */

        _clearBubbles: function () {

            var self = this,
                model = self.model,
                allBubbleGroup = model.get('allBubbleGroup');

            allBubbleGroup.remove();
            model.set('allBubbleGroup', null);

        },

        /**
        * draw  given size bubbles on given position
        * @method _drawBubble
        * @private
        * @param {array} positionOfBubbleInSprite position of bubble in sprite 
        * @param {array} array of array which store the x and y cordinate of bubble
        * @param {integer} bubbleRadius to determine which bubble need to draw
        * @return {array} currentGroupArray bubble and circle 
        */

        //_drawBubble: function (positionOfBubbleInSprite, positionArray, bubbleRadius, lastBubbleGroup) {

        _drawBubble: function (bubble, positionArray, bubbleRadius, lastBubbleGroup) {

            var self = this,
                viewStaticData = this.viewStaticData,
                myPaper = this.paperScope2,
                model = this.model,
                canvasPointX = null,
                canvasPointY = null,
                count = null,
                incrementMentor = null,
                currentInstance = null,
                imageRaster = null,
                populateBubble = model.get('populateBubble'),

                instance = null,
                currentRaster = null,
                imageRaser = null,
                currentSymbol = null,
                currentDummyPath = null,
                viewStaticData = this.viewStaticData,
                radiusObject = viewStaticData.RADIUS_OF_BUBBLES,
                largeBubbleRadius = radiusObject.largeBubbleRadius,
                smallBubbleRadius = radiusObject.smallBubbleRadius,
                middleBubbleRadius = radiusObject.middleBubbleRadius,
                //currentGroupArray = new Array(),
                currentGroup = new myPaper.Group(),
                bubbleRadius = bubbleRadius || largeBubbleRadius,
                currentCircle = null,
                positionArrayLength = positionArray.length;

            //imageRaster = this._createRaster(0, 0);
            //currentRaster = imageRaster.getSubRaster(positionOfBubbleInSprite);

            //currentRaster = this.getSpritePartBase64URL(this.currentImage, positionOfBubbleInSprite[0], positionOfBubbleInSprite[1], positionOfBubbleInSprite[2], positionOfBubbleInSprite[3]);

            //currentSymbol = new myPaper.Symbol(currentRaster);
            //imageRaster.remove();
            // currentRaster.remove();
            //currentRaster = new myPaper.Raster({
            //    source: bubble
            //})
            currentRaster = bubble;
            // this.player.enableAllHeaderButtons(false);
            for (count = 0; count < positionArrayLength; count++) {

                canvasPointX = positionArray[count][0];
                canvasPointY = positionArray[count][1];

                if (bubbleRadius === largeBubbleRadius) {
                    currentCircle = new myPaper.Path.Circle({

                        radius: bubbleRadius,
                        center: [canvasPointX - 5, canvasPointY - 5]


                    })
                }
                else {
                    if (bubbleRadius === smallBubbleRadius) {
                        currentCircle = new myPaper.Path.Circle({

                            radius: bubbleRadius,
                            center: [canvasPointX - 3, canvasPointY - 3]


                        })
                    }
                    else {

                        currentCircle = new myPaper.Path.Circle({

                            radius: bubbleRadius,
                            center: [canvasPointX - 2, canvasPointY - 2]


                        })
                    }

                }

                currentInstance = currentRaster.clone()// new myPaper.PlacedSymbol(currentSymbol);
                currentInstance.opacity = 1
                //currentSymbol.remove();
                currentInstance.position = [canvasPointX, canvasPointY];

                if (populateBubble) {

                    if (lastBubbleGroup && count === positionArrayLength - 1) {

                        // self.populateBubble(currentInstance, { x: canvasPointX, y: canvasPointY }, true);
                    }
                    else {

                        // self.populateBubble(currentInstance, { x: canvasPointX, y: canvasPointY });
                    }
                }
                //model.setDummyBubblePath(currentCircle);
                //currentGroupArray.push(new myPaper.Group(currentCircle, currentInstance))
                currentGroup.addChild(new myPaper.Group(currentCircle, currentInstance));
                //this.bubbleGroup.addChild(bubble);
            }
            // for (var count = 0; count < currentGroup.children.length - 1; count++) {
            //self.populateBubble(currentGroup, { x: canvasPointX, y: canvasPointY }, true);
            //  }
            return currentGroup;

        },


        /**
        * animate bubble from top of the activity area to base and then at their final position
        * @method populateBubble
        * @private
        * @param {object} ball raster to move
        * @param {object} destPosition co-ordinates
        */

        populateBubble: function () {

            var model = this.model,
                scaleY = null,
                ballPositionY = null,

                self = this,
                incrementor = null,
                count = null,

                allBubbleGroup = model.get('allBubbleGroup'),
                firstBall = null,

                currentGroupLength = null,
                expand = true,
                myPaper = this.paperScope2,
                paperView = myPaper.view,
                bubbleGroupLength = allBubbleGroup.children.length,
                contract = true,
                expandMiddle = true,
                contractMiddle = true,
                expandLarge = true,
                contractLarge = true,

                smallBubbleGroup = allBubbleGroup.children[2],
                smallBubbleBounds = smallBubbleGroup.children[0].children[1].bounds,
                smallBubbleWidth = smallBubbleBounds.width,
                smallBubbleHeight = smallBubbleBounds.height,

                middleBubbleGroup = allBubbleGroup.children[1],
                middleBubbleBounds = middleBubbleGroup.children[0].children[1].bounds,
                middleBubbleWidth = middleBubbleBounds.width,
                middleBubbleHeight = middleBubbleBounds.height,


                largeBubbleGroup = allBubbleGroup.children[0],
                largeBubbleBounds = largeBubbleGroup.children[0].children[1].bounds,
                largeBubbleWidth = largeBubbleBounds.width,
                largeBubbleHeight = largeBubbleBounds.height;



            for (count = 0; count < bubbleGroupLength; count++) {

                currentGroupLength = allBubbleGroup.children[count].children.length;

                for (incrementor = 0; incrementor < currentGroupLength ; incrementor++) {

                    allBubbleGroup.children[count].children[incrementor].children[1].scale(0.3);
                }
            }



            var interval = setInterval(function () {
           
                if (smallBubbleGroup.children[0].children[1].bounds.width <= smallBubbleWidth && expand) {
                    for (count = 0; count < smallBubbleGroup.children.length; count++) {


                        smallBubbleGroup.children[count].children[1].scale(1.12);
                    }
                }



                else {
                    expand = false;

                    if (smallBubbleGroup.children[0].children[1].bounds.width >= smallBubbleWidth * 7 / 10 && contract) {
                        for (count = 0; count < smallBubbleGroup.children.length; count++) {
                            smallBubbleGroup.children[count].children[1].scale(0.88)
                        }


                    }
                    else {
                        expand = true;
                        contract = false;

                    }

                }


                //small bubble ended here

                if (largeBubbleGroup.children[0].children[1].bounds.width <= largeBubbleWidth && expandLarge) {
                    for (count = 0; count < largeBubbleGroup.children.length; count++) {


                        largeBubbleGroup.children[count].children[1].scale(1.1);
                    }
                }
                else {
                    expandLarge = false;
                    if (largeBubbleGroup.children[0].children[1].bounds.width >= largeBubbleWidth * 7 / 10 && contractLarge) {
                        for (count = 0; count < largeBubbleGroup.children.length; count++) {


                            largeBubbleGroup.children[count].children[1].scale(0.9);
                        }


                    }
                    else {
                        expandLarge = true;
                        contractLarge = false;

                    }
                }


                //large bubble end here

                if (middleBubbleGroup.children[0].children[1].bounds.width <= middleBubbleWidth && expandMiddle) {
                    for (count = 0; count < middleBubbleGroup.children.length; count++) {


                        middleBubbleGroup.children[count].children[1].scale(1.09);

                    }
                }



                else {
                    expandMiddle = false;
                    if (!contractMiddle) {

                        model.set('populateBubble', false);
                        model.set('generateNewBubbles', false);

                        
                        self.generateBubbles();
                        self.player.enableAllHeaderButtons(true);
                        self._initialAniamtion();

                        clearInterval(interval);
                    }

                    if (middleBubbleGroup.children[0].children[1].bounds.width >= middleBubbleWidth * 7 / 10 && contractMiddle) {
                        for (count = 0; count < middleBubbleGroup.children.length; count++) {

                            middleBubbleGroup.children[count].children[1].scale(0.91);
                        }


                    }
                    else {
                        expandMiddle = true;
                        contractMiddle = false;
                    }

                }


                paperView.draw();
            }, 30)


        },

        /**
        * Calculates & returns the nearest point on the circumference path
        *
        * @method _getNearestPoint
        * @private
        * @param currentPoint << {{object}} >> current point
        * @param circumferencePath << {{object}} >> Array of points on the circumference
        * @return  << {{object}} >> nearest point on the circumference
        */

        _getNearestPoint: function _getNearestPoint(currentPoint, circumferencePath) {
            var model = this.model,
                //circumferencePath = model.get('circumferencePath'),
                counter = 0,
                thumbTackBounds = model.get('thumbTack').bounds,
                thumbTackHeight = thumbTackBounds.height,
                thhumbTackWidth = thumbTackBounds.width,
                requiredPoint = null,
                nearestPointDistance,
                minDist = 10000,
                activityAreaStartPoint = model.get('activityAreaStartPoint'),
                activityAreaEndPoint = model.get('activityAreaEndPoint'),
                minXBound = activityAreaStartPoint.xCoordinate,
                minYBound = activityAreaStartPoint.yCoordinate,
                maxXBound = activityAreaEndPoint.xCoordinate,

                maxYBound = activityAreaEndPoint.yCoordinate;

            for (; counter <= 360; counter++) {

                nearestPointDistance = (currentPoint.subtract(circumferencePath[counter])).length;
                if (nearestPointDistance < minDist) {
                    minDist = nearestPointDistance;
                    requiredPoint = circumferencePath[counter];
                }
            }
            if (!requiredPoint) {
                return requiredPoint = null;

            }


            if (minXBound + thhumbTackWidth / 2 > requiredPoint.x || maxXBound - thhumbTackWidth / 2 < requiredPoint.x || minYBound + thumbTackHeight / 2 > requiredPoint.y || maxYBound - thumbTackHeight / 2 < requiredPoint.y) {
                //if (minXBound > requiredPoint.x || maxXBound < requiredPoint.x || minYBound > requiredPoint.y || maxYBound < requiredPoint.y) {

                // requiredPoint = model.get('thumbTack').position;
                return requiredPoint = null;

            }

            return requiredPoint;
        },


        /*
        * Updates the distance between thumbtack & each foci
        *
        * @method _updateFociToTackDistance
        * @private
        */

        _updateFociToTackDistance: function _updateFociToTackDistance() {

            var model = this.model,
                tackTofoci1,
                tackToFoci2,
                thumbTack,
                foci1,
                foci2;

            foci1 = model.get('foci1');
            foci2 = model.get('foci2');
            thumbTack = model.get('thumbTack');
            tackToFoci1 = (thumbTack.position.subtract(foci1.position)).length;
            tackToFoci2 = (thumbTack.position.subtract(foci2.position)).length;

            model.set('tackToFoci1', tackToFoci1);
            model.set('tackToFoci2', tackToFoci2);

        },

        /**
        * Updates position of both the foci's
        *
        * @private
        * @params {Object} event
        */

        _adjustFociPosition: function _adjustFociPosition(event, draggableElement) {

            var model = this.model,
                shape = model.get('shape'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                center = model.get('center'),
                shapeCenter = model.get('shapeCenter'),
                isFociMovable = model.get('isFociMovable'),
                minX = model.get('activityAreaStartPoint').xCoordinate,
                minY = model.get('activityAreaStartPoint').yCoordinate,
                maxX = model.get('activityAreaEndPoint').xCoordinate,
                maxY = model.get('activityAreaEndPoint').yCoordinate,
                draggableElementPosition = draggableElement.position,
                draggableElementHeight=(draggableElement.bounds.height)/2,
                draggableElementWidth=(draggableElement.bounds.width)/2,
                otherFociPosition,
                fociAcc=false;

            //model.set('isFociMovable', true);

            if (shape == 'ellipse') {
                if (isFociMovable === true) {
                    var xDistance = event.point.x - draggableElement.position.x,
                        ydistance = event.point.y - draggableElement.position.y,
                        otherfoci,
                        fociDist = model.get('fociDsit');

                    if (draggableElement.name == 'ellipse-foci1') {
                        
                        otherfoci = foci2;
                        otherFociPosition = otherfoci.position;
                    }
                    else if (draggableElement.name == 'ellipse-foci2') {
                   
                        otherfoci = foci1;
                        otherFociPosition = otherfoci.position;
                    }

                    if (draggableElement.type == 'raster') {

                        if (otherfoci.position.x > minX +draggableElementWidth && otherfoci.position.x < maxX -draggableElementWidth && otherfoci.position.y > minY + draggableElementWidth && otherfoci.position.y < maxY -draggableElementWidth) {
                            if (Math.round(draggableElement.position.y) == Math.round(shapeCenter.position.y)) {
                                if (((draggableElementPosition.x + xDistance) >= minX +draggableElementWidth) && ((draggableElementPosition.x + xDistance) < maxX-draggableElementWidth)) {
                                  
                                    if (otherfoci) {
                                        if (((otherFociPosition.x - xDistance) > minX+draggableElementWidth) && ((otherFociPosition.x - xDistance) < maxX-draggableElementWidth)) {
                                        
                                            draggableElement.position.x = draggableElement.position.x + xDistance;
                                            otherfoci.position.x = otherfoci.position.x - xDistance;
                                         
                                        }     else
                                             {
                                              fociAcc=true;
                                              
                                             }
                                        
//                                        else {
//                                            isFociMovable = false;
//                                            model.set('isFociMovable', false);
//                                        }
                                    }

                                    /***/


                                }
                                 else
                                     {
                                      fociAcc=true;
                                      
                                     }

                                if (this.isFociDraggable(draggableElement, true) === false) {
                                
                                    draggableElement.position = shapeCenter.position;
                                    if (otherfoci) {
                                      
                                        otherfoci.position = shapeCenter.position;
                                    }
                                }

                            }
                            if (Math.round(draggableElement.position.x) == Math.round(shapeCenter.position.x)) {
                                if (((draggableElementPosition.y + ydistance) > minY + draggableElementHeight) && ((draggableElementPosition.y + ydistance) < maxY-draggableElementHeight)) {
                                
                                    if (otherfoci) {
                                        if (((otherFociPosition.y - ydistance) > minY +draggableElementHeight) && ((otherFociPosition.y - ydistance) < maxY -draggableElementHeight)) {
                               
                                            draggableElement.position.y = draggableElement.position.y + ydistance;
                                            otherfoci.position.y = otherfoci.position.y - ydistance;
                                        }
                                         else
                                             {
                                              fociAcc=true;
                                              
                                             }
//                                        else {
//                                            isFociMovable = false;
//                                            model.set('isFociMovable', false);
//                                        }
                                    }
                                    }
                                     else
                                             {
                                              fociAcc=true;
                                              
                                             }

                                if (this.isFociDraggable(draggableElement) === false) {
                                
                                    draggableElement.position = shapeCenter.position;
                                    if (otherfoci) {
                                        
                                        otherfoci.position = shapeCenter.position;
                                    }
                                }
                            
                            //}
                        }


                    }
                    else
                    {
                     fociAcc=true;
                     
                    }
//                    else
//                    {
//                    isFociMovable = false;
//                    model.set('isFociMovable', false);
//                    }
                    shapeCenter.bringToFront();
                }
            }
            else if (shape == 'circle') {
                foci1.position = shapeCenter.position;
                foci2.position = shapeCenter.position;
                //                foci1.position = center;
                //                foci2.position = center;
                //                model.set('foci1', foci1);
                //                model.set('foci2', foci2);
                shapeCenter.bringToFront();
                //                center.bringToFront();
            }
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('fociAcc',fociAcc);
           }
        },

        /**
        * Sees whether the foci is draggable or not
        *
        * @method isFociDraggable
        * @private
        * @param draggableElement << {{object}} >> one of the foci
        * @param isPointOnXaxis << {{boolean}} >> true or false
        * @return  << {{boolean}} >> true or false
        */

        isFociDraggable: function (draggableElement, isPointOnXaxis) {
            var model = this.model,
                shape = model.get('shape'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                shapeCenter = model.get('shapeCenter'),
                center = shapeCenter.position,
                otherfoci = null,
                currentFoci = null;

            if (isPointOnXaxis === true) {
                if (draggableElement.name === 'ellipse-foci1' && foci1.position.x <= center.x) {
                    return true;
                }
                else if (draggableElement.name === 'ellipse-foci2' && foci2.position.x >= center.x) {
                    return true;
                }
            }
            else {
                if (draggableElement.name === 'ellipse-foci1' && foci1.position.y <= center.y) {
                    return true;
                }
                else if (draggableElement.name === 'ellipse-foci2' && foci2.position.y >= center.y) {
                    return true;
                }

            }
            return false;
        },

        /**
        * Updates center of the shape
        *
        * @method _updateCenter
        * @private
        * @params center {object} center of shape
        */

        _updateCenter: function _updateCenter(center) {
            this.set('center', center);
        },

        /**
        * Calculates & updates the value of major axis
        *
        * @method _calculateMajorAxis
        * @private
        */

        _calculateMajorAxis: function _calculateMajorAxis() {
            var model = this.model,
                tackToFoci1,
                tackToFoci2,
                majorAxis;

            tackToFoci1 = model.get('tackToFoci1');
            tackToFoci2 = model.get('tackToFoci2');

            majorAxis = tackToFoci1 + tackToFoci2;

            model.set('majorAxis', majorAxis);

        },

        /**
        * Calculates & updates the value of minor axis
        *
        * @method _calculateMinorAxis
        * @private
        */

        _calculateMinorAxis: function _calculateMinorAxis() {

            var model = this.model,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                distBetFoci = (foci1.position.subtract(foci2.position)).length,
                tackToFoci1 = model.get('tackToFoci1'),
                tackToFoci2 = model.get('tackToFoci2'),
                aPlusb = tackToFoci1 + tackToFoci2,
                minorAxis = Math.sqrt((aPlusb * aPlusb) - (distBetFoci * distBetFoci));

            model.set('minorAxis', minorAxis);

        },

        /**
        * Calculates & returns the points on the circumference
        *
        * @method _getPointsOnCircumference
        * @private
        * @params center {Object} Center point of shape
        * @parmss major {number} Length of major axis
        3* @params minor {number} length of minor axis
        * @return requiredPoints {Array} required points in reversed form so that it can give anti-clock wise rotation
        */

        _getPointsOnCircumference: function _getPointsOnCircumference(center, major, minor) {
            var model = this.model,
                requiredPoints = new Array(),
                angle = 0,
                piBy180 = Math.PI / 180;
            //center = model.get('center');

            for (; angle <= 360; angle++) {
                var singlePoint = new this.paperScope2.Point(0, 0);
                singlePoint.x = center.x + major * Math.cos(angle * piBy180);
                singlePoint.y = center.y + minor * Math.sin(angle * piBy180);
                requiredPoints.push(singlePoint);
                //singlePoint.remove();
            }
            requiredPoints = requiredPoints.reverse()
            model.set('circumferencePath', requiredPoints);
            return requiredPoints;

        },
         _getPointIndex: function _getPointIndex(currentPoint) {
            var model = this.model,
                counter = 0,
                currentIndex,
                nearestPointDistance,
                thumbTack=model.get('thumbTack'),
                minimumDistance = 10000,
                circumferencePath = model.get('circumferencePath');

                for (; counter <= 360; counter++) {
                    if (circumferencePath[counter].x === thumbTack.position.x && circumferencePath[counter].y===thumbTack.position.y) {
     
                        currentIndex = counter;
                    }
             
            }

            return currentIndex;
        },

        /**
        * Returns current point index
        * 
        * @method _getCurrentPointIndex
        * @private
        * @params currentPoint {object} current point of thumbTack
        * @return {Number} current point index
        */

        _getCurrentPointIndex: function _getCurrentPointIndex(currentPoint) {
            var model = this.model,
                counter = 0,
                currentIndex,
                nearestPointDistance,
                minimumDistance = 10000,
                circumferencePath = model.get('circumferencePath');

            if (typeof (currentIndex) == 'undefined') {
                counter = 0;
                for (; counter <= 360; counter++) {
                    nearestPointDistance = (currentPoint.subtract(circumferencePath[counter])).length;
                    if (nearestPointDistance < minimumDistance) {
                        minimumDistance = nearestPointDistance;
                        currentIndex = counter;
                    }
                }
            }

            return currentIndex;
        },

        /**
        * Calculates angle bisector of angle between purple & red string, rotates the thumbTack with appropiate angle so thats its perpendicular to the angle bisector.
        * 
        * @method _calculateAngleBisectorPoint
        * @private
        */

        _calculateAngleBisectorPoint: function _calculateAngleBisectorPoint() {
            var model = this.model,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                thumbTack = model.get('thumbTack'),
                dummyThumbTack = model.get('dummyThumbTack'),
                center = model.get('center'),
                shapeCenter = model.get('shapeCenter'),
                shapeType = model.get('shape'),
                vector1 = foci1.position.subtract(thumbTack.position),
                vector2 = foci2.position.subtract(thumbTack.position),
                angle,
        //                angle = Math.abs(Math.abs(vector1.angle) - Math.abs(vector2.angle)),
                _angle,
                angleBisector = new this.paperScope2.Path(),
                start,
                pathVector,
                prevAngle = model.get('prevAngle'),
                initialAngle;

            angleBisector.strokeColor = 'black';
            start = thumbTack.position;
            angleBisector.moveTo(start);
            angleBisector.lineTo(foci2.position);

            if (shapeType === 'ellipse') {
                initialAngle = -81;
            }
            else if (shapeType === 'circle') {
                initialAngle = -75;
            }

            if (Math.round(foci1.position.y) == Math.round(foci2.position.y)) {
                angle = Math.abs(Math.abs(vector1.angle) - Math.abs(vector2.angle));
                if (thumbTack.position.y > shapeCenter.position.y) {
                    //                if (thumbTack.position.y > center.y) {
                    _angle = -angle / 2;
                }
                else {
                    _angle = angle / 2;
                }
            }
            else {

                foci1.position.x = foci2.position.x;
                if (Math.round(foci1.position.x) == Math.round(foci2.position.x)) {

                    /*
                    angle = Math.abs(Math.abs(vector1.angle) + Math.abs(vector2.angle));
                        if (thumbTack.position.x > shapeCenter.position.x) {
            //                angle = 360 - angle;
                            //                if (thumbTack.position.x > center.x) {
                            if (angle / 2 > 90) {
                            angle = 360 - angle;
                                _angle = angle / 2;
                            }
                            else {
                                _angle = angle / 2;
                            }
                        }
                        else {
                            _angle = -angle / 2;
                            //self.path.rotate(-angle/2,self.thumbTack.position);
                        }
                        */


                    /**Another try*/

                    if (thumbTack.position.x > shapeCenter.position.x) {
                        if ((thumbTack.position.y < foci1.position.y) && (thumbTack.position.y < foci2.position.y)) {
                            angle = Math.abs(Math.abs(vector1.angle) - Math.abs(vector2.angle));
                        }
                        else if ((thumbTack.position.y >= foci1.position.y) && (thumbTack.position.y <= foci2.position.y)) {
                            angle = 360 - Math.abs(Math.abs(vector1.angle) + Math.abs(vector2.angle));
                        }
                        else if ((thumbTack.position.y > foci1.position.y) && (thumbTack.position.y > foci2.position.y)) {
                            angle = Math.abs(Math.abs(vector2.angle) - Math.abs(vector1.angle));
                        }
                    }
                    else {
                        if ((thumbTack.position.y < foci1.position.y) && (thumbTack.position.y < foci2.position.y)) {
                            angle = Math.abs(Math.abs(vector2.angle) - Math.abs(vector1.angle));
                        }
                        else if ((thumbTack.position.y >= foci1.position.y) && (thumbTack.position.y <= foci2.position.y)) {
                            angle = Math.abs(Math.abs(vector1.angle) + Math.abs(vector2.angle));
                        }
                        else if ((thumbTack.position.y > foci1.position.y) && (thumbTack.position.y > foci2.position.y)) {
                            angle = Math.abs(Math.abs(vector1.angle) - Math.abs(vector2.angle));
                        }

                    }

                    if (thumbTack.position.x > shapeCenter.position.x) {
                        _angle = angle / 2;
                    }
                    else {
                        _angle = -angle / 2;
                    }
                }
                /***/

            }

            if (this.model.get('minorAxis') === 0) {
                if (this.prevPosition === null || typeof this.prevPosition === 'undefined') {
                    this.prevPosition = thumbTack.position;
                }

                _angle = ((this.prevPosition.y > thumbTack.position.y) || (this.prevPosition.x > thumbTack.position.x)) ? 90 : 270;
                this.prevPosition = thumbTack.position;
            }

            if (isNaN(thumbTack.position.x) || isNaN(thumbTack.position.y)) {

            }

            angleBisector.rotate(_angle, thumbTack.position);

            pathVector = angleBisector.segments[1].point.subtract(angleBisector.segments[0].point);

            if (prevAngle != null) {
                if (isNaN(pathVector.angle - prevAngle)) {

                }
                if (this.model.get('minorAxis') === 0 && pathVector.angle - prevAngle === 90) {
                    pathVector.angle = prevAngle;
                }
                thumbTack.rotate(pathVector.angle - prevAngle);
                dummyThumbTack.rotate(pathVector.angle - prevAngle);
                // console.log(pathVector.angle - prevAngle);
            }
            else {
                thumbTack.rotate(initialAngle);
                dummyThumbTack.rotate(initialAngle);
            }
            model.set('prevAngle', pathVector.angle);
            //thumbTack.bringToFront();
            dummyThumbTack.bringToFront();
            if (angleBisector) {
                angleBisector.remove();
            }
        },

        /**
        * Moves the thumbtack along the circumference 
        *
        * @method _animateAlongCircumference
        * @private
        */

        _animateAlongCircumference: function _animateAlongCircumference() {

            this.paperScope2.activate();
            var model = this.model, tackToFoci1, tackToFoci2,
                thumbTack = model.get('thumbTack'),
                dummyThumbTack = model.get('dummyThumbTack'),
                currentPoint = thumbTack.position,
                currentPointIndex = model.get('currentPointIndex'),
                positionCounter,
                lastIndex = model.get('lastIndex'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                circumferencePath = model.get('circumferencePath'),
                self = this,
                shapeCenter = model.get('shapeCenter'),
                restrictMovementAlongCircumference = model.get('restrictMovementAlongCircumference'),
                isFociMovable = model.get('isFociMovable'),
                toContinue = true,
                showEquation = model.get('showEquation'),
                shape = model.get('shape');





            if (!currentPointIndex && currentPointIndex != 0) {
                currentPointIndex = this._getCurrentPointIndex(currentPoint);
                if (typeof (currentPointIndex) == 'undefined') {
                    currentPointIndex = 0;
                }
                model.set('positionCounter', currentPointIndex);
                model.set('currentPointIndex', currentPointIndex);
            }

            positionCounter = model.get('positionCounter');

            if (positionCounter <= lastIndex) {
                if (typeof circumferencePath[positionCounter] === 'undefined') {
                    positionCounter = circumferencePath.length - 1;
                }
                this._calculateAngleBisectorPoint(thumbTack.position, foci1.position, foci2.position);

                thumbTack.position = circumferencePath[positionCounter];
                dummyThumbTack.position = circumferencePath[positionCounter];
                self._setTackPosition(circumferencePath[positionCounter - 2]);
                self._popOutInterSectingBubbles();


                model.set('positionCounter', positionCounter + 4);

                //console.log(positionCounter +' & ' + (positionCounter + 4));
                if (this.lastIndexChanged === true && ((positionCounter + 4) >= lastIndex)) {
                    this.isAnimating = false;
                    thumbTack.position = circumferencePath[lastIndex];
                    dummyThumbTack.position = circumferencePath[lastIndex];
                    self._setTackPosition(circumferencePath[positionCounter - 2]);
                    this._drawShape();

                    restrictMovementAlongCircumference = true;
                    model.set('restrictMovementAlongCircumference', restrictMovementAlongCircumference);
                    isFociMovable = false;
                    model.set('isFociMovable', isFociMovable);
                    if (showEquation && shape === 'ellipse') {
                        this._showHideEllipseEquation(true);
                    }
                    if (showEquation && shape === 'circle') {
                        this._showHideCircleEquation(true);
                        //model.set('isCenterMovable', true);
                    }

                    this._bindEventsOnDraggables(dummyThumbTack);
                    // this._bindEventsOnDraggables(foci1);
                    // this._bindEventsOnDraggables(foci2);
                    //this._bindEventsOnDraggables(shapeCenter);
                    //                    this._calculateAngleBisectorPoint(thumbTack.position, foci1.position, foci2.position);





                    toContinue = false;
                }

                if (toContinue === true) {
                    if (this.interval !== null) {
                        clearTimeout(this.interval);
                        this.interval = null;
                    }

                    this.interval = setTimeout(function () {
                        self._animateAlongCircumference();
                    }, this.timeOutInterval);
                }

            }
            else {
                if (lastIndex != currentPointIndex) {
                    model.set('positionCounter', 0);
                    model.set('lastIndex', currentPointIndex);
                    this.lastIndexChanged = true;

                    if (this.interval !== null) {
                        clearTimeout(this.interval);
                        this.interval = null;
                    }
                    if (this.animateFirstTime === true) {
                        self._animateAlongCircumference();
                        this.animateFirstTime = false;
                    }
                    else {
                        this.interval = setTimeout(function () {
                            self._animateAlongCircumference();
                        }, this.timeOutInterval);
                    }
                }
            }
            tackToFoci1 = (thumbTack.position.subtract(foci1.position)).length;
            tackToFoci2 = (thumbTack.position.subtract(foci2.position)).length;

            //            /***/
            //            tackToFoci1 = parseInt(tackToFoci1.toFixed(1));
            //            tackToFoci2 = parseInt(tackToFoci2.toFixed(1));
            //            /***/

            model.set('tackToFoci1', tackToFoci1);
            model.set('tackToFoci2', tackToFoci2);
            this._redrawStrings();
            if (shape === 'ellipse') {

                this._redrawBar();
                this.redBarLoded = true;

            }
            else if (shape === 'circle') {
                this._setRadiusLabel(tackToFoci1);
            }
            this._bringShapeToFront(shape);
            if (toContinue === false) {
                this.redBarLoded = false;
                model.set('animationStarted', false);
                model.set('isThumbTackMovable', true);
                this._calculateAngleBisectorPoint(thumbTack.position, foci1.position, foci2.position);
                if (shape === 'ellipse') {
                    this.ellipseDrawLabel();
                }
                this.interval = setTimeout(function () {
                    self.trigger(MathInteractives.Common.Components.Views.ExplorerShape.CUSTOM_EVENTS.animationCompleate);
                }, 0);
                this._bringShapeToFront(shape);
            }

            this.paperScope2.view.draw();
        },

        /**
        * Draws the dashed lines representing the major & minor axis with their labels
        *
        * @method ellipseDrawLabel
        * @private
        */

        ellipseDrawLabel: function () {
            var model = this.model,
               majorAxis = model.get('majorAxis'),
               minorAxis = model.get('minorAxis'),
               center = model.get('center'),
               shapeCenter = model.get('shapeCenter'),
               size,
               foci1 = model.get('foci1'),
               foci2 = model.get('foci2'),
               tackToFoci1 = model.get('tackToFoci1'),
               tackToFoci2 = model.get('tackToFoci2'),
               shape,
               typeShape = model.get('shape'),
               startingPoint,
               endingPoint,
               vector,
               position,
               paperScope = this.paperScope2,
               lableA,
               lableB,
               lineA,
               lineB,
               temp = null,
               strokeColor = '#555555',
               ellipseCenterCoordinate = null,
               shapeCenterSnapX = model.get('shapeCenterSnapX'),
               shapeCenterSnapY = model.get('shapeCenterSnapY');

            if (typeShape === 'ellipse') {
                if (foci1.position.x === foci2.position.x) {
                    temp = majorAxis;
                    majorAxis = minorAxis;
                    minorAxis = temp;
                }

                startingPoint = new paperScope.Point(shapeCenter.position.x, shapeCenter.position.y);
                endingPoint = new paperScope.Point(shapeCenter.position.x, (shapeCenter.position.y - (minorAxis / 2)));
                vector = startingPoint.subtract(endingPoint);

                position = new paperScope.Point(startingPoint.x - 15, startingPoint.y + 25);
                ellipseCenterCoordinate = this.renderString('(' + shapeCenterSnapX + ', ' + shapeCenterSnapY + ')', position, 0);

                lineA = this._drawDashedLine(startingPoint, endingPoint);

                position = new paperScope.Point(startingPoint.x - 20, (startingPoint.y - (vector.length / 2)));
                if (foci1.position.x === foci2.position.x) {
                    lableA = this.renderString(this.getMessage('diagram-label-ellipse', 0), position, 0);
                }
                else {
                    lableA = this.renderString(this.getMessage('diagram-label-ellipse', 1), position, 0);
                }
                startingPoint = new paperScope.Point(shapeCenter.position.x, shapeCenter.position.y);
                endingPoint = new paperScope.Point((shapeCenter.position.x + (majorAxis / 2)), shapeCenter.position.y);
                vector = startingPoint.subtract(endingPoint);


                lineB = this._drawDashedLine(startingPoint, endingPoint);
                position = new paperScope.Point(startingPoint.x + (vector.length / 2), endingPoint.y + 20);
                if (foci1.position.x === foci2.position.x) {
                    lableB = this.renderString(this.getMessage('diagram-label-ellipse', 1), position, 0);
                }
                else {
                    lableB = this.renderString(this.getMessage('diagram-label-ellipse', 0), position, 0);
                }





                model.set('lineA', lineA);
                model.set('lineB', lineB);
                model.set('lableA', lableA);
                model.set('lableB', lableB);
                model.set('ellipseCenterCoordinate', ellipseCenterCoordinate);
            }
        },

        /**
        * Draws the dashed shape after the animation is complete
        *
        * @method _drawShape
        * @private
        */

        _drawShape: function _drawShape() {
            this.paperScope2.activate();
            var model = this.model,
                majorAxis = model.get('majorAxis'),
                minorAxis = model.get('minorAxis'),
                center = model.get('center'),
                shapeCenter = model.get('shapeCenter'),
                size,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                tackToFoci1 = model.get('tackToFoci1'),
                tackToFoci2 = model.get('tackToFoci2'),
                shape,
                typeShape = model.get('shape'),
                startingPoint,
                endingPoint,
                vector,
                position,
                paperScope = this.paperScope2,
                lableA,
                lableB,
                lineA,
                lineB,
                centerPoint=null,
                temp = null,
                strokeColor = '#555555',
                ellipseCenterCoordinate = null,
                shapeCenterSnapX = model.get('shapeCenterSnapX'),
                shapeCenterCircle = model.get('shapeCenterCircle'),
                shapeCenterSnapY = model.get('shapeCenterSnapY');

            if (foci1.position.x === foci2.position.x) {
                size = [(minorAxis), (majorAxis)];
            }
            else if (foci1.position.y === foci2.position.y) {
                size = [(majorAxis), (minorAxis)];
            }
            //show red Circle for radius less than 60 has been removed
            //if ((Math.round(foci1.position.x)) === Math.round((foci2.position.x)) && (Math.round(foci1.position.y) === Math.round(foci2.position.y)) && tackToFoci1 < 60 && tackToFoci2 < 60) {
            //    strokeColor = 'red';
            //}

            /*shape = new this.paperScope2.Path.Ellipse({
                point: center,
                //                    size: [(majorAxis), (minorAxis)],
                size: size,
        
                strokeColor: strokeColor,
                dashArray: [3, 5]
            });*/


            this.dashedShapeGroup = this._drawEllipse(center, majorAxis, minorAxis);
            this.dashedShapeGroup.strokeColor = 'gray';
            shape = this.dashedShapeGroup;
            shape.opacity = 0.4;
            shape.bounds.center = [shapeCenter.position.x, shapeCenter.position.y];
            shape.sendToBack();
            //this._drawDummyEllipseShape();
            //this._getInterSectingBubbles();


            model.set('dashedShape', shape);




            if (typeShape === 'circle') {
                this.circleDrawLabel();


            }
           

            //            dummyShape.bounds.center = center;




        },

        /**
        * Draws the ellipse
        *
        * @method _drawEllipse
        * @private
        * @param center << {{object}} >> Center of the ellipse
        * @param major << {{object}} >> Major axis of the ellipse
        * @param minor << {{object}} >> Minor axis of the ellipse
        * @return  << {{object}} >> returns the group of lines which forms ellipse
        */

        _drawEllipse: function (center, major, minor) {
            var i,
                scope = this.paperScope2,
                group = new this.paperScope2.Group(),
                line, x, y, angle, incr, gridUnits,
                gridSizeXAxis = this.model.get('gridSizeXAxis');

            major = major / 2;
            minor = minor / 2;

            if (this.model.get('foci1').position.x === this.model.get('foci2').position.x) {
                var temp = major;
                major = minor;
                minor = temp;
            }

            if (this.model.get('shape') === 'circle') {
                gridUnits = Math.round((major / gridSizeXAxis) * 10) / 10;
            }
            else {
                gridUnits = Math.round((Math.max(major, minor) / gridSizeXAxis) * 10) / 10;
            }
            incr = 4 * (10 / gridUnits);
            for (i = 0 ; i < 360; i += incr) {
                line = new scope.Path();
                angle = i * Math.PI / 180;
                x = center.x + major * Math.cos(angle);
                y = center.y + minor * Math.sin(angle);
                line.add(new scope.Point(x, y));
                angle = (i + incr / 2) * Math.PI / 180;
                x = center.x + major * Math.cos(angle);
                y = center.y + minor * Math.sin(angle);
                line.add(new scope.Point(x, y));
                line.closed = true;
                group.addChild(line);
            }
            return group;
        },

        /**
        * Displays the co-ordinates of the center for the circle
        *
        * @method _displayCircleCenterCoordinates
        * @private
        */

        _displayCircleCenterCoordinates: function _displayCircleCenterCoordinates() {
            var model = this.model,
                shapeCenter = model.get('shapeCenter'),
                thumbTack = model.get('thumbTack'),
                paperScope = this.paperScope2,
                angle = this._getStringAngle(shapeCenter.position, thumbTack.position),
                position,
                centerCoordinate = model.get('centerCoordinate'),
                shapeCenterSnapX = model.get('shapeCenterSnapX'),
                shapeCenterSnapY = model.get('shapeCenterSnapY'),
            startingPointDeltaX = new paperScope.Point(shapeCenter.position.x, shapeCenter.position.y),
            endingPointDeltaX = new paperScope.Point(thumbTack.position.x, shapeCenter.position.y);

            if (centerCoordinate) {
                centerCoordinate.remove();
            }

            if (angle >= 0) {
                position = new paperScope.Point(startingPointDeltaX.x - 12, endingPointDeltaX.y - 18);
                centerCoordinate = this.renderString('(' + shapeCenterSnapX + ', ' + shapeCenterSnapY + ')', position, 0);
            }
            else {
                position = new paperScope.Point(startingPointDeltaX.x - 12, endingPointDeltaX.y + 25);
                centerCoordinate = this.renderString('(' + shapeCenterSnapX + ', ' + shapeCenterSnapY + ')', position, 0);
            }

            model.set('centerCoordinate', centerCoordinate);


        },

        /**
        * Draws the delta X, delta Y lines & their labels, as well as the co-ordinates of the thumbTack & the projected point on the X-axis
        *
        * @method circleDrawLabel
        * @private
        */

        circleDrawLabel: function () {
            var startingPointDeltaX,
                startingPointDeltaY,
                model = this.model,
                endingPointDeltaY,
                endingPointDeltaX,
                vectorDeltax,
                center = model.get('center'),
                vectorDeltay,
                thumbTack = model.get('thumbTack'),
                shapeCenter = model.get('shapeCenter'),
                deletaXLine,
                deletaXLineLabel,
                deltaYLine,
                deletaYLineLabel,
                paperScope = this.paperScope2,
                position,
                circlePoint = model.get('circlePoint'),
                centerCoordinate = model.get('centerCoordinate'),
                circlePointCoordinate,
                thumbTackCoordinate,
                radiusString,
                 angle = this._getStringAngle(shapeCenter.position, thumbTack.position),
                gridSize = model.get('gridSizeYAxis'),
                shapeCenterSnapX = model.get('shapeCenterSnapX'),
                shapeCenterSnapY = model.get('shapeCenterSnapY'),
                circlePointsCoordinateObject = null,
                thumbTackCoordinateObject = null,
                restrictMovementAlongCircumference = model.get('restrictMovementAlongCircumference'),
                thumbTackCoordinateObjectTextX,
                thumbTackCoordinateObjectTextY,
                circlePointsCoordinateObjectTextX,
                circlePointsCoordinateObjectTextY,
                thumbTackPosition = thumbTack.position,
                temp=null,
                shapeCenterPosition = shapeCenter.position;


            if (this.deltaGroup !== null) {
                this.deltaGroup.remove()
            }

            if (circlePoint) {
                circlePoint.remove();
            }

            if (centerCoordinate) {
                centerCoordinate.remove();
            }

            startingPointDeltaX = new paperScope.Point(shapeCenter.position.x, shapeCenter.position.y);
            endingPointDeltaX = new paperScope.Point(thumbTack.position.x, shapeCenter.position.y);
            deletaXLine = this._drawDashedLine(startingPointDeltaX, endingPointDeltaX);
            vectorDeltax = startingPointDeltaX.subtract(endingPointDeltaX);
            model.set('circleDeltaX', Math.round(vectorDeltax.length / gridSize));
            //            if(restrictMovementAlongCircumference === false) {
            //                circlePointsCoordinateObject = this._calculateSnappedpoints(endingPointDeltaX);
            //            }
            //            else {
            circlePointsCoordinateObject = endingPointDeltaX;
            circlePointsCoordinateObjectTextX = (circlePointsCoordinateObject.x - shapeCenterPosition.x) / gridSize;
            circlePointsCoordinateObjectTextY = (circlePointsCoordinateObject.y - shapeCenterPosition.y) / gridSize;

            //                circlePointsCoordinateObjectTextX = parseInt(circlePointsCoordinateObjectTextX * 100) / 100;

            //                circlePointsCoordinateObjectTextY = parseInt(circlePointsCoordinateObjectTextY * 100) / 100;
            circlePointsCoordinateObjectTextX = parseInt(circlePointsCoordinateObjectTextX * 10) / 10;

            circlePointsCoordinateObjectTextY = parseInt(circlePointsCoordinateObjectTextY * 10) / 10;

            var uptoTwoDecimal = parseInt((circlePointsCoordinateObjectTextX * 100)) / 100,
                wholeNumber = Math.round(uptoTwoDecimal),
                requiredNumber = Math.abs(uptoTwoDecimal - wholeNumber);

            if ((requiredNumber < 1 && requiredNumber > 0.90) || (requiredNumber > 0 && requiredNumber < 0.10)) {
                circlePointsCoordinateObjectTextX = wholeNumber;
            }

            uptoTwoDecimal = parseInt((circlePointsCoordinateObjectTextY * 100)) / 100,
            wholeNumber = Math.round(uptoTwoDecimal),
            requiredNumber = Math.abs(uptoTwoDecimal - wholeNumber);

            if ((requiredNumber < 1 && requiredNumber > 0.90) || (requiredNumber > 0 && requiredNumber < 0.10)) {
                circlePointsCoordinateObjectTextY = wholeNumber;
            }

            //            }

            circlePoint = new this.paperScope2.Path.Circle({
                center: endingPointDeltaX,
                radius: 5,
                strokeColor: '#555555',
                fillColor: '#555555'
            });



            startingPointDeltaY = new paperScope.Point(thumbTack.position.x, thumbTack.position.y);
            endingPointDeltaY = endingPointDeltaX;
            deltaYLine = this._drawDashedLine(endingPointDeltaY, startingPointDeltaY);
            vectorDeltay = startingPointDeltaY.subtract(endingPointDeltaY);
            model.set('circleDeltaY', Math.round(vectorDeltay.length / gridSize));
            //            if(restrictMovementAlongCircumference === false) {
            //                thumbTackCoordinateObject = this._calculateSnappedpoints(startingPointDeltaY);
            //            }
            //            else {
            thumbTackCoordinateObject = thumbTack.position;
            thumbTackCoordinateObjectTextX = (thumbTackCoordinateObject.x - shapeCenter.position.x) / gridSize;
            thumbTackCoordinateObjectTextY = (shapeCenter.position.y - thumbTackCoordinateObject.y) / gridSize;

            temp = Number(thumbTackCoordinateObjectTextX.toFixed(1));
            if(temp===0)
            {
            thumbTackCoordinateObjectTextX=temp;
            }

            temp =  Number(thumbTackCoordinateObjectTextY.toFixed(1));

            if(temp===0) {
                thumbTackCoordinateObjectTextY=temp;
            }
            //                thumbTackCoordinateObjectTextX = parseInt(thumbTackCoordinateObjectTextX * 100) / 100;

            //                thumbTackCoordinateObjectTextY = parseInt(thumbTackCoordinateObjectTextY * 100) / 100;
            thumbTackCoordinateObjectTextX = parseInt(thumbTackCoordinateObjectTextX * 10) / 10;

            thumbTackCoordinateObjectTextY = parseInt(thumbTackCoordinateObjectTextY * 10) / 10;

            var uptoTwoDecimal = parseInt((thumbTackCoordinateObjectTextX * 100)) / 100,
                wholeNumber = Math.round(uptoTwoDecimal),
                requiredNumber = Math.abs(uptoTwoDecimal - wholeNumber);

            if ((requiredNumber < 1 && requiredNumber > 0.90) || (requiredNumber > 0 && requiredNumber < 0.10)) {
                thumbTackCoordinateObjectTextX = wholeNumber;
            }

            uptoTwoDecimal = parseInt((thumbTackCoordinateObjectTextY * 100)) / 100,
            wholeNumber = Math.round(uptoTwoDecimal),
            requiredNumber = Math.abs(uptoTwoDecimal - wholeNumber);

            if ((requiredNumber < 1 && requiredNumber > 0.90) || (requiredNumber > 0 && requiredNumber < 0.10)) {
                thumbTackCoordinateObjectTextY = wholeNumber;
            }

            //            }

            if (angle >= 0) {
                position = new paperScope.Point(startingPointDeltaX.x - 15, endingPointDeltaX.y - 18);
                //                centerCoordinate = this.renderString('(' + shapeCenterSnapX + ', ' + shapeCenterSnapY + ')', position, 0);

                position = new paperScope.Point(endingPointDeltaX.x - 15, endingPointDeltaX.y - 18);
                //                circlePointCoordinate = this.renderString('(' + circlePointsCoordinateObject.x + ', ' + circlePointsCoordinateObject.y + ')', position, 0);
                circlePointCoordinate = this.renderString('(' + circlePointsCoordinateObjectTextX + ', ' + circlePointsCoordinateObjectTextY + ')', position, 0);

                position = new paperScope.Point(startingPointDeltaY.x - 15, startingPointDeltaY.y + 25);

                //                thumbTackCoordinate = this.renderString('(' + thumbTackCoordinateObject.x + ', ' + thumbTackCoordinateObject.y + ')', position, 0);
                thumbTackCoordinate = this.renderString('(' + thumbTackCoordinateObjectTextX + ', ' + thumbTackCoordinateObjectTextY + ')', position, 0);



                if (angle > 90) {
                    position = new paperScope.Point(startingPointDeltaX.x - (vectorDeltax.length / 2), endingPointDeltaX.y - 18);
                    deletaXLineLabel = this.renderString(this.getMessage('diagram-label-circle', 0), position, 0);

                    position = new paperScope.Point(endingPointDeltaY.x - 28, startingPointDeltaY.y - (vectorDeltay.length / 2));
                    deletaYLineLabel = this.renderString(this.getMessage('diagram-label-circle', 1), position, 0);


                }
                else {
                    position = new paperScope.Point(startingPointDeltaX.x + (vectorDeltax.length / 2), endingPointDeltaX.y - 18);
                    deletaXLineLabel = this.renderString(this.getMessage('diagram-label-circle', 0), position, 0);

                    position = new paperScope.Point(endingPointDeltaY.x + 18, startingPointDeltaY.y - (vectorDeltay.length / 2));
                    deletaYLineLabel = this.renderString(this.getMessage('diagram-label-circle', 1), position, 0);

                }

            }
            if (angle < 0) {
                position = new paperScope.Point(startingPointDeltaX.x - 15, endingPointDeltaX.y + 25);
                //                centerCoordinate = this.renderString('(' + shapeCenterSnapX + ', ' + shapeCenterSnapY + ')', position, 0);

                position = new paperScope.Point(endingPointDeltaX.x - 15, endingPointDeltaX.y + 25);
                //                circlePointCoordinate = this.renderString('(' + circlePointsCoordinateObject.x + ', ' + circlePointsCoordinateObject.y + ')', position, 0);
                circlePointCoordinate = this.renderString('(' + circlePointsCoordinateObjectTextX + ', ' + circlePointsCoordinateObjectTextY + ')', position, 0);

                position = new paperScope.Point(startingPointDeltaY.x - 15, startingPointDeltaY.y - 18);

                //                thumbTackCoordinate = this.renderString('(' + thumbTackCoordinateObject.x + ', ' + thumbTackCoordinateObject.y + ')', position, 0);
                thumbTackCoordinate = this.renderString('(' + thumbTackCoordinateObjectTextX + ', ' + thumbTackCoordinateObjectTextY + ')', position, 0);

                if (angle > -90) {
                    position = new paperScope.Point(startingPointDeltaX.x + (vectorDeltax.length / 2), endingPointDeltaX.y + 25);
                    deletaXLineLabel = this.renderString(this.getMessage('diagram-label-circle', 0), position, 0);

                    position = new paperScope.Point(endingPointDeltaY.x + 18, startingPointDeltaY.y + (vectorDeltay.length / 2));
                    deletaYLineLabel = this.renderString(this.getMessage('diagram-label-circle', 1), position, 0);


                }
                else {
                    position = new paperScope.Point(startingPointDeltaX.x - (vectorDeltax.length / 2), endingPointDeltaX.y + 25);
                    deletaXLineLabel = this.renderString(this.getMessage('diagram-label-circle', 0), position, 0);

                    position = new paperScope.Point(endingPointDeltaY.x - 28, startingPointDeltaY.y + (vectorDeltay.length / 2));
                    deletaYLineLabel = this.renderString(this.getMessage('diagram-label-circle', 1), position, 0);

                }



            }

            model.set('deletaXLine', deletaXLine);
            model.set('circlePoint', circlePoint);
            model.set('deletaXLineLabel', deletaXLineLabel);
            model.set('centerCoordinate', centerCoordinate);
            model.set('circlePointCoordinate', circlePointCoordinate);
            model.set('deltaYLine', deltaYLine);
            model.set('deletaYLineLabel', deletaYLineLabel);
            model.set('thumbTackCoordinate', thumbTackCoordinate);

            this.deltaGroup = new paperScope.Group(deletaXLine, circlePoint, deletaXLineLabel, centerCoordinate, circlePointCoordinate, deltaYLine, deletaYLineLabel, thumbTackCoordinate);

            circlePoint.moveBelow(thumbTack);

        },


        /**
        * clears the canvas
        *
        * @method clearElementsOnCanvas
        * @public
        */

        clearElementsOnCanvas: function () {
            var model = this.model,
                    shape = model.get('shape'),
                    lableA = model.get('lableA'),
                    lableB = model.get('lableB'),
                    lineA = model.get('lineA'),
                    lineB = model.get('lineB'),
                    dashedShape = model.get('dashedShape'),
                    deletaXLine = model.get('deletaXLine'),
                    deletaXLineLabel = model.get('deletaXLineLabel'),
                    deltaYLine = model.get('deltaYLine'),
                    deletaYLineLabel = model.get('deletaYLineLabel'),
                     circlePoint = model.get('circlePoint'),
                    centerCoordinate = model.get('centerCoordinate'),
                    circlePointCoordinate = model.get('circlePointCoordinate'),
                    thumbTackCoordinate = model.get('thumbTackCoordinate'),
                    radiusString = model.get('radiusString'),
                    shapeCenterCircle = model.get('shapeCenterCircle'),
                    shapeCenter = model.get('shapeCenter'),
                    isReplay = model.get('isReplay'),
                    ellipseCenterCoordinate = model.get('ellipseCenterCoordinate');

            this.redBarLoded = false;

            if (shape === 'ellipse') {
                if (dashedShape) {
                    if (lableA) {
                        lableA.remove();
                    }
                    if (lableB) {
                        lableB.remove();
                    }
                    if (lineA) {
                        lineA.remove();
                    }
                    if (lineB) {
                        lineB.remove();
                    }
                    if (ellipseCenterCoordinate) {
                        ellipseCenterCoordinate.remove();
                    }
                    if (!isReplay) {
                        shapeCenterCircle.opacity = 0;
                        shapeCenter.opacity = 1;
                        shapeCenterCircle.sendToBack();
                        shapeCenter.bringToFront();

                    }
                    dashedShape.remove();
                }
                model.set('lableA', null);
                model.set('lableB', null);
                model.set('lineA', null);
                model.set('lineB', null);
                model.set('dashedShape', null);
                model.set('ellipseCenterCoordinate', null);
                model.set('isCenterMovable', true);

            }
            if (shape === 'circle') {
                if (dashedShape) {
                    dashedShape.remove();
                    if (deletaXLine) {
                        deletaXLine.remove();
                    }
                    if (deletaXLineLabel) {
                        deletaXLineLabel.remove();
                    }
                    if (deltaYLine) {
                        deltaYLine.remove();
                    }
                    if (deletaYLineLabel) {
                        deletaYLineLabel.remove();
                    }
                    if (circlePoint) {
                        circlePoint.remove();
                    }
                    if (centerCoordinate) {
                        centerCoordinate.remove();
                    }
                    if (circlePointCoordinate) {
                        circlePointCoordinate.remove();
                    }
                    if (thumbTackCoordinate) {
                        thumbTackCoordinate.remove();
                    }
                    //radiusString.remove();
                }
                model.set('dashedShape', null);
                model.set('deletaXLine', null);
                model.set('deletaXLineLabel', null);
                model.set('deltaYLine', null);
                model.set('deletaYLineLabel', null);
                model.set('circlePoint', null);
                //model.set('centerCoordinate', null);
                model.set('circlePointCoordinate', null);
                model.set('thumbTackCoordinate', null);
                model.set('radiusString', null);
            }


        },

        /**
        * pops the intersecting bubbles
        *
        * @method _popAllIntersectingBubbles
        * @private
        */

        _popAllIntersectingBubbles: function () {

            var circumPath = this.model.get('circumferencePath');
            for (var i = 0; i < circumPath.length ; i++) {
                this.dummyTackPath.position = circumPath[i];
                this._calculateAngleBisectorPoint();
                this.dummyTackPath.sendToBack();
                this._popOutInterSectingBubbles();
            }

        },


        /**
        * Renders the current attempts related view
        * 
        * @model renderRequiredView
        * @param options {{object}} Required data of the required view
        */

        renderRequiredView: function renderRequiredView(options) {

            var model = this.model,
                dummyThumbTack = null,
                shape,
                foci1,
                foci2,
                shapeCenter,
                thumbTack,
                purpleStringRaster,
                redStringRaster,
                blackStringRaster,
                tackToFoci1,
                tackToFoci2,
                center,
                majorAxis,
                minorAxis,
                circumferencePath,
                showEquation = model.get('showEquation'),
               shapeCenterSnapX,
                shapeCenterSnapY,
                centerPoint,
                shapeCenterCircle=model.get('shapeCenterCircle');

            shape = options.shape;
            foci1 = model.get('foci1');
            foci1.position = options.foci1;
            foci2 = model.get('foci2');
            foci2.position = options.foci2;
            purpleStringRaster = null;
            redStringRaster = null;
            blackStringRaster = model.get('blackStringRaster');
            shapeCenter = model.get('shapeCenter');
            shapeCenter.position = options.shapeCenter;
            thumbTack = model.get('thumbTack');
            dummyThumbTack = model.get('dummyThumbTack');
            thumbTack.position = options.thumbTack;
            dummyThumbTack.position = options.thumbTack;

            shapeCenterSnapX = options.shapeCenterSnapX;
            shapeCenterSnapY = options.shapeCenterSnapY;
            if (foci1.position.y === foci2.position.y) {
                majorAxis = options.majorAxis;
                minorAxis = options.minorAxis;
            }
            else if (foci1.position.x === foci2.position.x) {
                majorAxis = options.minorAxis;
                minorAxis = options.majorAxis;
            }
            circumferencePath = this._getPointsOnCircumference(shapeCenter.position, majorAxis / 2, minorAxis / 2);

            model.set('shape', shape);
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('shapeCenter', shapeCenter);
            model.set('thumbTack', thumbTack);
            model.set('dummyThumbTack', dummyThumbTack);
            model.set('tackToFoci1', options.tackToFoci1);
            model.set('tackToFoci2', options.tackToFoci2);
            model.set('center', options.center);
            model.set('majorAxis', options.majorAxis);
            model.set('minorAxis', options.minorAxis);
            model.set('circumferencePath', circumferencePath);
            model.set('shapeCenterSnapX', shapeCenterSnapX);
            model.set('shapeCenterSnapY', shapeCenterSnapY);
            model.set('showPoppedBubbles', true);


            //this._popAllIntersectingBubbles();
            this.paperScope2.view.draw();
            this.generateBubbles();
            if (shape === 'ellipse') {
                var purple = model.get('purple'),
                    red = model.get('red'),
                    purpleStringBarRaster = model.get('purpleStringBarRaster'),
                    redStringBarRaster = model.get('redStringBarRaster');

                if (purple) {
                    purple.remove();
                }
                if (red) {
                    red.remove();
                }

                if (purpleStringBarRaster) {
                    purpleStringBarRaster.remove();
                }
                if (redStringBarRaster) {
                    redStringBarRaster.remove();
                }

                this._generateString('purple', purpleStringRaster, foci1.position, thumbTack.position, false);
                this._generateString('red', redStringRaster, foci2.position, thumbTack.position, false);
                //this._generateBar();
                this._redrawBar();
            }
            else if (shape === 'circle') {
                var black = model.get('black');

                if (black) {
                    black.remove();
                }
                this._generateString('black', blackStringRaster, foci2.position, thumbTack.position, false);
                tackToFoci1 = model.get('tackToFoci1');
                this._setRadiusLabel(tackToFoci1);
                this._displayCircleCenterCoordinates();
            }
            this._calculateAngleBisectorPoint(thumbTack.position, foci1.position, foci2.position);

            this._drawShape();
            if (shape === 'ellipse') {
                this.ellipseDrawLabel();
                centerPoint= new this.paperScope2.Point(shapeCenter.position.x,shapeCenter.position.y)
                if (shapeCenterCircle) {
                    shapeCenterCircle.remove();
                    
                }
                shapeCenterCircle = new this.paperScope2.Path.Circle({
                        center:centerPoint,
                        radius: 4,
                        strokeColor: '#555555',
                        fillColor: '#555555'
                    });
                    model.set('shapeCenterCircle', shapeCenterCircle);
                //shapeCenterCircle.position = centerPoint;
                shapeCenterCircle.opacity = 1;
                shapeCenter.opacity = 0;

     
            }

            if (showEquation && shape === 'ellipse') {
                this._showHideEllipseEquation(true);
            }
            if (showEquation && shape === 'circle') {
                this._showHideCircleEquation(true);

            }


            this._bringShapeToFront(shape);
            this.paperScope2.activate();
            this._handleInitialAnimationEnd();
            this._unbindEventsOnDraggables(foci1);
            this._unbindEventsOnDraggables(foci2);
            this._unbindEventsOnDraggables(shapeCenter);
            this.paperScope2.view.draw();

        },

        /**
        * Create & display the required point text label
        *
        * @method renderString
        * @private
        * @param text << {{string}} >> text to be displayed on point text
        * @param position << {{object}} >> position of the point text
        * @param angle << {{number}} >> angle by which the point text to be rotated
        * @return  << {{object}} >> created label
        */

        renderString: function (text, position, angle) {
            var label;


            label = new this.paperScope2.PointText({ position: { x: position.x, y: position.y } });
            label.content = text;
            label.strokeColor = '#555555';
            label.strokeWidth = 1;
            label.style = {
                font: 'verdana',
                fontSize: 12,
                fillColor: '#555555'
            };
            label.rotate(angle);
            return label;
        },

        /**
        * Shows/Hides the ellipse equation
        *
        * @method _showHideEllipseEquation
        * @private
        * @param showEquation << {{boolean}} >> true or false
        */

        _showHideEllipseEquation: function (showEquation) {


            if (showEquation === true) {

                var self = this,
                  model = self.model,
                  $el = this.$el,
                  idPrefix = self.idPrefix,
                  equationEllipseA = model.get('majorAxis'),
                  equationEllipseB = model.get('minorAxis'),
                  snappedX = model.get('shapeCenterSnapX'),
                  gridSizeXAxis = model.get('gridSizeXAxis'),
                  snappedY = model.get('shapeCenterSnapY'),
                  shapeCenter = model.get('shapeCenter'),
                  thumbTack = model.get('thumbTack'),
                  firstEquation,
                  secondEquation,
                  firstDenomenator,
                  equationPadding = null,
                  secondDenomenator,
                  temp,
                  foci1 = model.get('foci1'),
                  foci2 = model.get('foci2');
                equationEllipseA = Math.round(((equationEllipseA / gridSizeXAxis) / 2) * 100) / 100;
                equationEllipseB = Math.round(((equationEllipseB / gridSizeXAxis) / 2) * 100) / 100;
                if (foci1.position.y === foci2.position.y && foci1.position.y === shapeCenter.position.y && foci1.position.y === thumbTack.position.y && equationEllipseB === 0) {
                    equationPadding = 30;
                    $el.find('#' + idPrefix + 'degenerated-x').html('y');

                    $el.find('#' + idPrefix + 'degenerated-y').html(snappedY);
                    $el.find('#' + this.idPrefix + 'graph-normal-formula').hide();
                    $el.find('#' + this.idPrefix + 'degenerated-formula').show();
                }
                else if (foci1.position.x === foci2.position.x && foci1.position.x === shapeCenter.position.x && foci1.position.x === thumbTack.position.x && equationEllipseB === 0) {
                    equationPadding = 30;
                    $el.find('#' + idPrefix + 'degenerated-x').html('x');
                    $el.find('#' + idPrefix + 'degenerated-y').html(snappedX);
                    $el.find('#' + this.idPrefix + 'graph-normal-formula').hide();
                    $el.find('#' + this.idPrefix + 'degenerated-formula').show();
                }
                else {

                    if (snappedX < 0) {
                        firstEquation = "(<em>x</em> - (" + snappedX + "))<sup>2</sup>";
                    }
                    else {
                        firstEquation = "(<em>x</em> - " + snappedX + ")<sup>2</sup>";
                    }
                    if (snappedY < 0) {
                        secondEquation = "(<em>y</em> - (" + snappedY + "))<sup>2</sup>";
                    }
                    else {
                        secondEquation = "(<em>y</em> - " + snappedY + ")<sup>2</sup>";
                    }



                    if (foci1.position.x === foci2.position.x) {
                        temp = equationEllipseA;
                        equationEllipseA = equationEllipseB;
                        equationEllipseB = temp;
                    }

                    //                equationEllipseA = Math.round(equationEllipseA / gridSizeXAxis);
                    //                equationEllipseB = Math.round(equationEllipseB / gridSizeXAxis);
                    firstDenomenator = equationEllipseA + "<sup>2</sup>";
                    secondDenomenator = equationEllipseB + "<sup>2</sup>";

                    $el.find('#' + idPrefix + 'graph-first-numerator').html(firstEquation);
                    $el.find('#' + idPrefix + 'graph-first-denominator').html(firstDenomenator);
                    $el.find('#' + idPrefix + 'graph-second-numerator').html(secondEquation);
                    $el.find('#' + idPrefix + 'graph-second-denominator').html(secondDenomenator);
                    $el.find('#' + this.idPrefix + 'graph-normal-formula').show();
                    $el.find('#' + this.idPrefix + 'degenerated-formula').hide();
                }
                this._setEllipseEquationPosition(equationPadding);
                $el.find('#' + this.idPrefix + 'graph-formula').show();
                model.set('equationEllipseB', equationEllipseB);
                model.set('equationEllipseA', equationEllipseA);


            }
            else {

                this.$el.find('#' + this.idPrefix + 'graph-formula').hide();
            }


        },

        /**
        * Sets the position of the equation for ellipse
        *
        * @method _setEllipseEquationPosition
        * @private
        * @param paddingForDegenaratedEllipse << {{Number}} >> padding value for degenerated ellipse
        */

        _setEllipseEquationPosition: function (paddingForDegenaratedEllipse) {
            var model = this.model,
                shapeCenter = model.get('shapeCenter').position,
                shapeCenterX = shapeCenter.x,
                shapeCenterY = shapeCenter.y,

                activityAreaStartPoint = model.get('activityAreaStartPoint'),
                activityAreaStartPointX = activityAreaStartPoint.xCoordinate,
                activityAreaStartPointY = activityAreaStartPoint.yCoordinate,

                viewStaticData = this.viewStaticData,
                equationPadding = paddingForDegenaratedEllipse || 30,
                //equationHeight = viewStaticData.HEIGHT_OF_ELLIPSE_EQUATION,
                //equationWidth = viewStaticData.WIDTH_OF_ELLPSE_EQUATION,

                $equationContainer = this.$('#' + this.idPrefix + 'graph-formula'),
                equationWidth = $equationContainer.width(),
                equationHeight = $equationContainer.height(),

                minorAxis = model.get('minorAxis'),
                majorAxis = model.get('majorAxis'),
                foci1X = model.get('foci1').position.x,
                foci2X = model.get('foci2').position.x,
                equationLine = null,
                interSection = null,
                dashedShaped = this.dummyEllipse,
                ellipseToAxisDistance = null,
                currentYPosition = null,
                interSection = null,
                interSectionPoint = null,
                tempVar = null,

                activityAreaEndPoint = model.get('activityAreaEndPoint'),
                activityAreaEndPointX = activityAreaEndPoint.xCoordinate,
                activityAreaEndPointY = activityAreaEndPoint.yCoordinate,

                endBoundryConditionX = shapeCenterX + equationWidth / 2 <= activityAreaEndPointX,
                endBoundryConditionY = shapeCenterY + equationHeight / 2 <= activityAreaEndPointY,
                startBoundryConditionX = shapeCenterX - equationWidth / 2 >= activityAreaStartPointX,
                startBoundryConditionY = shapeCenterY - equationHeight / 2 >= activityAreaStartPointY,

                //$equationContainer = this.$('#' + this.idPrefix + 'graph-formula'),
                padding = 30,
                shapeType = model.get('shape');

            if (shapeType === 'circle') {
                $equationContainer = this.$('#' + this.idPrefix + 'graph-circle-formula');
                minorAxis = majorAxis;
                equationWidth = $equationContainer.width();
                equationHeight = $equationContainer.height();
                endBoundryConditionX = shapeCenterX + equationWidth / 2 <= activityAreaEndPointX;
                endBoundryConditionY = shapeCenterY + equationHeight / 2 <= activityAreaEndPointY;
                startBoundryConditionX = shapeCenterX - equationWidth / 2 >= activityAreaStartPointX;
                startBoundryConditionY = shapeCenterY - equationHeight / 2 >= activityAreaStartPointY;
            }

            if (foci1X === foci2X) {

                tempVar = majorAxis;
                majorAxis = minorAxis;
                minorAxis = tempVar;


            }
            if (shapeCenterY + minorAxis / 2 + equationPadding + equationHeight <= activityAreaEndPointY && endBoundryConditionX && startBoundryConditionX) {// show equation at the center

                $equationContainer.css({
                    top: shapeCenterY + minorAxis / 2 + equationPadding,
                    left: shapeCenterX - equationWidth / 2
                })

            }
            else {

                currentYPosition = shapeCenterY + padding + equationHeight
                equationLine = new this.paperScope2.Path.Line({

                    from: [shapeCenterX, currentYPosition],
                    to: [-500, currentYPosition]

                });
                interSection = dashedShaped.getIntersections(equationLine);
                if (interSection.length > 0) {

                    interSectionPoint = interSection[0].point.x;
                    ellipseToAxisDistance = shapeCenterX - interSectionPoint;
                }
                else {

                    ellipseToAxisDistance = equationWidth / 2 - 1;
                }


                if (minorAxis / 2 > equationHeight + equationPadding && ellipseToAxisDistance >= equationWidth / 2 && endBoundryConditionX && endBoundryConditionY && startBoundryConditionX && startBoundryConditionY && (equationHeight + equationPadding + shapeCenterY) <= activityAreaEndPointY) {


                    $equationContainer.css({
                        top: shapeCenterY + padding,
                        left: shapeCenterX - equationWidth / 2

                    })

                }
                else {


                    if (shapeCenterY - minorAxis / 2 - equationPadding - equationHeight >= activityAreaStartPointY && endBoundryConditionX && startBoundryConditionX) {

                        $equationContainer.css({

                            top: shapeCenterY - (minorAxis / 2 + equationPadding + equationHeight),
                            left: shapeCenterX - equationWidth / 2

                        })
                    }
                    else {
                        if (shapeCenterX - majorAxis / 2 - equationPadding - equationWidth >= activityAreaStartPointX && endBoundryConditionY && startBoundryConditionY) {// at the left

                            $equationContainer.css({

                                top: shapeCenterY - equationHeight / 2,
                                left: shapeCenterX - majorAxis / 2 - (equationPadding + equationWidth)

                            })

                        } else {
                            if (shapeCenterX + majorAxis / 2 + equationPadding + equationWidth <= activityAreaEndPointX && endBoundryConditionY && startBoundryConditionY) {// at right

                                $equationContainer.css({
                                    top: shapeCenterY - equationHeight / 2,
                                    left: shapeCenterX + majorAxis / 2 + equationPadding
                                })
                            }
                            else {
                                // at some sectors
                                if (shapeCenterX - (equationPadding + equationWidth + majorAxis) >= activityAreaStartPointX && shapeCenterY - (equationPadding + equationHeight + minorAxis) >= activityAreaStartPointY) {
                                    $equationContainer.css({
                                        top: shapeCenterY - (equationPadding + minorAxis + equationHeight / 4),
                                        left: shapeCenterX - (equationPadding + majorAxis / 2 + equationWidth / 4)
                                    })
                                }
                                else if (shapeCenterX - (equationPadding + equationWidth + majorAxis) >= activityAreaStartPointX && shapeCenterY + (equationPadding + equationHeight + minorAxis) <= activityAreaEndPointY) {
                                    $equationContainer.css({
                                        top: shapeCenterY + (equationPadding + minorAxis + equationHeight / 4),
                                        left: shapeCenterX - (equationPadding + majorAxis / 2 + equationWidth / 4)
                                    })
                                }
                                else if (shapeCenterX + (equationPadding + equationWidth + majorAxis) <= activityAreaEndPointX && shapeCenterY + (equationPadding + equationHeight + minorAxis) <= activityAreaEndPointY) {
                                    $equationContainer.css({
                                        top: shapeCenterY + (equationPadding + minorAxis + equationHeight / 4),
                                        left: shapeCenterX + (equationPadding + majorAxis / 2 + equationWidth / 4)
                                    })
                                }
                                else if (shapeCenterX + (equationPadding + equationWidth + majorAxis) <= activityAreaEndPointX && shapeCenterY - (equationPadding + equationHeight + minorAxis) >= activityAreaStartPointY) {
                                    $equationContainer.css({
                                        top: shapeCenterY - (equationPadding + minorAxis + equationHeight / 4),
                                        left: shapeCenterX + (equationPadding + majorAxis / 2 + equationWidth / 4)
                                    })
                                }
                                else {
                                        if(shapeType==='circle'){
                                                 if (shapeCenterY + equationPadding + equationHeight > activityAreaEndPointY) {

                                                     $equationContainer.css({

                                                         top: shapeCenterY - (equationPadding + equationHeight),
                                                         left: shapeCenterX - equationWidth / 2

                                                     })
                                                   }
                                                   else
                                                   {

                                                    $equationContainer.css({
                                                          top: shapeCenterY + padding,
                                                          left: shapeCenterX - equationWidth / 2

                                                      })
                                            }
                                        }
                                        else if(shapeType==='ellipse')
                                        {
                                               $equationContainer.css({
                                                   top: model.getOriginPosition().y - equationHeight / 2,
                                                   left: model.getOriginPosition().x - equationWidth / 2
                                                })
                                   }

                                }
                            }

                        }
                    }

                }
            }
        },

        /**
        * Shows/Hides the circle equation
        *
        * @method _showHideCircleEquation
        * @private
        * @param showEquation << {{boolean}} >> true or false
        */

        _showHideCircleEquation: function (showEquation) {


            if (showEquation) {

                var self = this,
                   model = self.model,
                   $el = this.$el,
                   idPrefix = self.idPrefix,
                   gridSizeXAxis = model.get('gridSizeXAxis'),
                   radius = model.get('majorAxis') / 2,
                   center = model.get('shapeCenter'),
                   centerX = model.get('shapeCenterSnapX'),
                   centerY = model.get('shapeCenterSnapY'),
                   firstEquation,
                   secondEquation, radiusEquation,
                    uAgent = navigator.userAgent,
                    oscpu = uAgent.substr(13, 14);
                if (centerX < 0) {
                    firstEquation = "(<em>x</em> - (" + centerX + "))<sup>2</sup>";
                }
                else {
                    firstEquation = "(<em>x</em> - " + centerX + ")<sup>2</sup>";
                }
                if (centerY < 0) {
                    secondEquation = "(<em>y</em> - (" + centerY + "))<sup>2</sup>";
                }
                else {
                    secondEquation = "(<em>y</em> - " + centerY + ")<sup>2</sup>";
                }


                radius = Math.round((radius / gridSizeXAxis) * 10) / 10;
                radiusEquation = radius + "<sup>2</sup>";

                $el.find('#' + idPrefix + 'graph-circle-first-numerator').html(firstEquation);
                $el.find('#' + idPrefix + 'graph-circle-second-numerator').html(secondEquation);
                $el.find('#' + idPrefix + 'graph-circle-r-square').html(radiusEquation);
                model.set('circleRadius', radius);

                this._setEllipseEquationPosition();
                $el.find('#' + this.idPrefix + 'graph-circle-formula').show();
                 if (MathInteractives.Common.Utilities.Models.BrowserCheck.isFirefox && (oscpu && (oscpu === 'Windows NT 6.1' || oscpu === 'Windows NT 6.2'))) {
                this.$('.graph-circle-plus').css('margin-top', '4px');
                this.$('.graph-circle-equal-to').css('margin-top', '4px');
                
                
                }
            }
            else {

                this.$el.find('#' + this.idPrefix + 'graph-circle-formula').hide();
            }



        },

        /**
        * Sets the position of the equation for circle
        *
        * @method _setCircleEquationPosition
        * @private
        */

        _setCircleEquationPosition: function () {





            var model = this.model,
               shapeCenter = model.get('shapeCenter').position,
               shapeCenterX = shapeCenter.x,
               shapeCenterY = shapeCenter.y,

               activityAreaStartPoint = model.get('activityAreaStartPoint'),
               activityAreaStartPointX = activityAreaStartPoint.xCoordinate,
               activityAreaStartPointY = activityAreaStartPoint.yCoordinate,

               viewStaticData = this.viewStaticData,
               equationPadding = viewStaticData.PADDING_FROM_SHAPE,
               equationHeight = viewStaticData.HEIGHT_OF_CIRCLE_EQUATION,
               equationWidth = viewStaticData.WIDTH_OF_CIRCLE_EQUATION,



               radius = model.get('majorAxis'),
               equationLine = null,
               interSection = null,
               dashedShaped = model.get('dashedShape'),
               ellipseToAxisDistance = null,
               currentYPosition = null,
               interSection = null,
               interSectionPoint = null,


               activityAreaEndPoint = model.get('activityAreaEndPoint'),
               activityAreaEndPointX = activityAreaEndPoint.xCoordinate,
               activityAreaEndPointY = activityAreaEndPoint.yCoordinate,

               endBoundryConditionX = shapeCenterX + equationWidth / 2 <= activityAreaEndPointX,
               endBoundryConditionY = shapeCenterY + equationHeight / 2 <= activityAreaEndPointY,
               startBoundryConditionX = shapeCenterX - equationWidth / 2 >= activityAreaStartPointX,
               startBoundryConditionY = shapeCenterY - equationHeight / 2 >= activityAreaStartPointY,

               $equationContainer = this.$('#' + this.idPrefix + 'graph-circle-formula');


            if (shapeCenterY + radius + equationPadding + equationHeight <= activityAreaEndPointY && endBoundryConditionX && startBoundryConditionX) {// show equation at the center

                $equationContainer.css({
                    top: shapeCenterY + radius + equationPadding,
                    left: shapeCenterX - equationWidth / 2
                })

            }
            else {
                currentYPosition = shapeCenterY + equationPadding + equationHeight
                equationLine = new this.paperScope2.Path.Line({

                    from: [shapeCenterX, currentYPosition],
                    to: [0, currentYPosition]

                });
                interSection = dashedShaped.getIntersections(equationLine);
                if (interSection.length > 0) {

                    interSectionPoint = interSection[0].point.x;
                    ellipseToAxisDistance = shapeCenterX - interSectionPoint;
                }
                else {

                    ellipseToAxisDistance = equationWidth / 2 - 1;
                }


                if (radius > equationHeight + equationPadding && ellipseToAxisDistance >= equationWidth / 2 && endBoundryConditionX && endBoundryConditionY && startBoundryConditionX && startBoundryConditionY) {

                    $equationContainer.css({
                        top: shapeCenterY + equationPadding,
                        left: shapeCenterX - equationWidth / 2

                    })

                }
                else {


                    if (shapeCenterY - radius - equationPadding - equationHeight >= activityAreaStartPointY && endBoundryConditionX && startBoundryConditionX) {


                        $equationContainer.css({

                            top: shapeCenterY - radius - equationPadding,
                            left: shapeCenterX - equationWidth / 2

                        })
                    }
                    else {

                        if (shapeCenterX - radius - equationPadding - equationWidth >= activityAreaStartPointX && endBoundryConditionY && startBoundryConditionY) {// at the left

                            $equationContainer.css({

                                top: shapeCenterY - equationHeight / 2,
                                left: shapeCenterX - radius - equationPadding

                            })

                        }
                        if (shapeCenterX + radius + equationPadding + equationWidth <= activityAreaEndPointX && endBoundryConditionY && startBoundryConditionY) {// at right

                            $equationContainer.css({
                                top: shapeCenterY - equationHeight / 2,
                                left: shapeCenterX + radius + equationPadding
                            })
                        }
                        else {
                            // at some sectors

                        }
                    }

                }
            }


        },

        /**
        * Generates the string between foci1 & thumbtack, foci2 7 thumbtack, center of circle & thumbtack, one at a time
        *
        * @method _generateString
        * @private
        * @param color << {{string}} >> color of the string
        * @param raster << {{object}} >> image raster
        * @param start << {{object}} >> starting point
        * @param end << {{object}} >> ending point
        * @param isRatioBar << {{boolean}} >> whether ratio bar required with the string or not. Trur or false
        * @return  << {{return type }} >> <<description>>
        */

        _generateString: function _generateString(color, raster, start, end, isRatioBar) {

            var model = this.model,
                shape = model.get('shape'),
                //imageRaster = this._createRaster(0, 0),
                purpleStringRaster,
                redStringRaster,
                blackStringRaster,
                myPaper = this.paperScope2,
                stringAngle = this._getStringAngle(start, end),
                options = [{
                    'raster': raster,
                    'startingPoint': start,
                    'endingPoint': end,
                    'width': 5,
                    'height': 5,
                    'angle': stringAngle,
                    'isRatioBar': isRatioBar,
                    'lineColor': color
                }],
                purple,
                red,
                black;
            if (shape === 'ellipse') {
                //console.log(this.getCurrentTime());
                if (color == 'purple') {
                    //  model.set('purpleStringRaster', purpleStringRaster);
                    //  purpleStringRaster = imageRaster.getSubRaster(47, 94, 5, 4);
                    //options[0].raster = purpleStringRaster;


                    //purpleStringRaster = this.getSpritePartBase64URL(this.currentImage, 47, 94, 5, 4);
                    //purpleStringRaster = new myPaper.Raster({
                    //    source: purpleStringRaster
                    //})
                    //options[0].raster = this.purpleStringRaster;
                    //currentRaster = new myPaper.Raster({
                    //    source: bubbleImage

                    //});

                    purple = this._drawLine(options);
                    //purple.sendToBack();

                    model.set('purple', purple);
                }
                else if (color == 'red') {
                    //model.set('redStringRaster', redStringRaster);
                    //redStringRaster = imageRaster.getSubRaster(32, 94, 5, 4);
                    //options[0].raster = redStringRaster;

                    //options[0].raster = this.redStringRaster;

                    red = this._drawLine(options);
                    // red.sendToBack();
                    model.set('red', red);
                }
                //   group.moveAbove(this.model.get('thumbTack'));
            }
            else if (shape === 'circle') {
                if (color == 'black') {

                    // model.set('blackStringRaster', blackStringRaster);
                    // blackStringRaster = imageRaster.getSubRaster(62, 94, 5, 5);
                    // options[0].raster = blackStringRaster;
                    black = this._drawLine(options);
                    black.sendToBack();
                    model.set('black', black);
                }
            }
            //imageRaster.remove();
        },

        /**
        * Calculates & returns the angle of the string
        *
        * @method _getStringAngle
        * @private
        * @param point1 << {{object}} >> One of the point
        * @param point2 << {{object}} >> One of the point
        * @return  << {{number}} >> angle of the string
        */

        _getStringAngle: function _getStringAngle(point1, point2) {
            var vector = point2.subtract(point1);

            return vector.angle;
        },

        /**
        * Makes initial arrangements before calling _animateAlongCircumference function
        *
        * @method animate
        * @public
        * @param <<paramName>> << {{param type }} >> <<description>>
        */

        animate: function animate() {
            this.paperScope2.activate();
            var model = this.model,
                circumferencePath = model.get('circumferencePath'),
                self = this,
                typeShape=model.get('shape'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                shapeCenter = model.get('shapeCenter'),
                thumbTack = model.get('thumbTack'),
                centerPoint=null,
                shapeCenterCircle=model.get('shapeCenterCircle'),
                dummyThumbTack = model.get('dummyThumbTack');
            this.lastIndexChanged = false;
            model.set('restrictMovementAlongCircumference', false);
            model.set('isFociMovable', true);
            model.set('currentPointIndex', null);
            model.set('positionCounter', 0);
            model.set('lastIndex', circumferencePath.length);
            model.set('showPopupOnTryAnother', true);
            this._unbindEventsOnDraggables(foci1);
            this._unbindEventsOnDraggables(foci2);
            this._unbindEventsOnDraggables(shapeCenter);
            this._unbindEventsOnDraggables(thumbTack);
            this._unbindEventsOnDraggables(dummyThumbTack);
            this.isAnimating = true;
            this.isRedCircleShown = null;
            //if (this.interval !== null) {
            //    clearTimeout(this.interval);
            //    this.interval = null;
            //}

            //this.interval = setTimeout(function () {

            self._setTackPosition();
            this.animateFirstTime = true;
            this.redBarLoded = false;
            model.set('animationStarted', true);
            model.set('isCenterMovable', false);
            model.set('isFociMovable', false);
            model.set('isThumbTackMovable', false);
            if (typeShape === 'ellipse') {
                centerPoint= new this.paperScope2.Point(shapeCenter.position.x,shapeCenter.position.y)
                if (shapeCenterCircle) {
                    shapeCenterCircle.remove();
                    
                }
                shapeCenterCircle = new this.paperScope2.Path.Circle({
                        center:centerPoint,
                        radius: 4,
                        strokeColor: '#555555',
                        fillColor: '#555555'
                    });
                    model.set('shapeCenterCircle', shapeCenterCircle);
                //shapeCenterCircle.position = centerPoint;
                shapeCenterCircle.opacity = 1;
                shapeCenter.opacity = 0;

            }
            self._animateAlongCircumference();
            // self.interval = null;
            //console.log('animation');
            // });
        },

        /**
        * sets the previous position to thumbtack
        *
        * @method setPreviousPositionToThumbTack
        * @private || public
        * @param thumbTackPosition << {{object}} >> position of thumbtack
        * @param isPopAgain << {{boolean}} >> true or false
        */

        setPreviousPositionToThumbTack: function (thumbTackPosition, isPopAgain) {
            var model = this.model,
                shape = model.get('shape'),
                thumbTack = model.get('thumbTack'),
                dummyThumbTack = model.get('dummyThumbTack');
            if (typeof thumbTackPosition !== 'undefined' && thumbTackPosition !== null) {
                thumbTack.position = thumbTackPosition;
                dummyThumbTack.position = thumbTackPosition;
                this.model.set('thumbTack', thumbTack);
                this.model.set('dummyThumbTack', dummyThumbTack);
            }
            if (isPopAgain === true) {
                this.draggableElement = thumbTack;
                this._showShapeMouseDragFeatures({ point: new this.paperScope2.Point({ x: thumbTack.position.x, y: thumbTack.position.y }) });
                this.draggableElement = null;
                //this._setTackPosition();
                //this._calculateMajorAxis();
                //this._calculateMinorAxis();
                //this._redrawStrings();
                //if (shape === 'ellipse') {
                //    this.redBarLoded = false;
                //    this._redrawBar();
                //}
                //this._calculateAngleBisectorPoint();
            }
            this._bringShapeToFront(this.model.get('shape'));
        },

        /**
        * Sets the position of dummy thumbtack
        *
        * @method _setTackPosition
        * @private
        * @param position << {{object}} >> position of the thumbtack
        */

        _setTackPosition: function (position) {

            var tack = this.model.get('thumbTack'),
                tackPosition = position || tack.position;

            this.dummyTackPath.position = [tackPosition.x - 6, tackPosition.y];
            this.dummyTackPath.sendToBack();
        },

        /**
        * Pops out the intersecting bubbles
        *
        * @method _popOutInterSectingBubbles
        * @private
        */

        _popOutInterSectingBubbles: function () {

            var self = this,
                 model = self.model,
                 interSectingBubbles = model.get('intersectBubblesArray') || [],
                 interSectingBubblesLength = interSectingBubbles.length,
                 bubbleRadius = null,
                 currentBubble = null,
                 viewStaticData = self.viewStaticData,
                 bubbleRadiusObject = viewStaticData.RADIUS_OF_BUBBLES,
                 bubblePositions = viewStaticData.POSITION_OF_BUBBLE,
                 currentPosition = null,
                 dummyThumbTac = this.dummyTackPath,
                 dummyThumbTacPosition = dummyThumbTac.position,

                 xDistance = null,
                 yDistance = null,
                 count = null,
                 bubbleRasterArray = [],
                 currentBubblePosition = null,
                 removeGeneratedBubbles = model.get('removeGeneratedBubbles');



            for (count in interSectingBubbles) {

                currentBubble = interSectingBubbles[count];



                if (currentBubble.getIntersections(dummyThumbTac).length > 0) {
                    bubbleRadius = self._getBubbleRadius(currentBubble);

                    if (bubbleRadius === bubbleRadiusObject.largeBubbleRadius) {

                        bubbleRasterArray = this.largeAnimateBubblesRasters;

                    }
                    else {
                        if (bubbleRadius === bubbleRadius.middleBubbleRadius) {

                            bubbleRasterArray = this.middleAnimateBubblesRasters;


                        }
                        else {
                            bubbleRasterArray = this.smallAnimateBubblesRasters;

                        }
                    }


                    interSectingBubbles.splice(count, 1);
                    model.set('intersectBubblesArray', interSectingBubbles);
                    self.intersectBubblesArray = interSectingBubbles;
                    currentBubblePosition = currentBubble.position;
                    self._popBubble(currentBubblePosition, bubbleRasterArray, currentBubble.parent.children[1]);
                    // currentBubble.parent.remove();

                }
            }



        },





        /**
        * Pops the bubble. one at a time.
        *
        * @method _popBubble
        * @private
        * @param positionOfBubble << {{object}} >> position of the bubble
        * @param bubbleRasterArray << {{object}} >> raster related to animation
        */

        _popBubble: function (positionOfBubble, bubbleRasterArray, ball) {//rasterPositionsOFBubble is array of objects


            var self = this,
                animateRaster1 = bubbleRasterArray[0].clone(),
                animateRaster2 = bubbleRasterArray[1].clone(),
                animateRaster3 = bubbleRasterArray[2].clone(),
                customEvents = this.viewStaticData.CUSTOM_EVENTS,
                paperView = self.paperScope2.view,
                interval = null,

                animateRaster1Bounds = animateRaster1.bounds,
                animateRaster1Width = animateRaster1Bounds.width,
                animateRaster1Height = animateRaster1Bounds.height,

                animateRaster2Bounds = animateRaster2.bounds,
                animateRaster2Width = animateRaster2Bounds.width,
                animateRaster2Height = animateRaster2Bounds.height,

                animateRaster3Bounds = animateRaster3.bounds,
                animateRaster3Width = animateRaster3Bounds.width,
                animateRaster3Height = animateRaster3Bounds.height,



                currentBounds = ball.bounds,
                expand = true,
                contract = true,
                ballHeight = currentBounds.height,
                ballWidth = currentBounds.width,
                count = null;

            interval = setInterval(function () {

                if (ball.bounds.width > ballWidth * 8 / 10 && contract) {

                    ball.scale(0.8);

                }
                else {
                    contract = false;
                    if (!expand) {
                        ball.parent.remove();
                        clearInterval(interval);
                    }
                    if (ball.bounds.width < ballWidth && expand) {
                        ball.scale(1.2);
                    }
                    else {

                        expand = false;
                        contract = true;
                    }

                }
                paperView.draw();
            }, 30);
            //animateRaster1.position = positionOfBubble;
            //animateRaster2.position = positionOfBubble;
            //animateRaster3.position = positionOfBubble;





            //animateRaster1.opacity = 1;



            //interval = setInterval(function () {

            //    currentBounds = animateRaster1.bounds;

            //    if (animateRaster1Width > currentBounds.width) {
            //        animateRaster1.scale(1.1)
            //    }
            //    else {

            //        clearInterval(interval);
            //    }
            //    paperView.draw();
            //}, 17)


            //animateRaster1.remove();
            //animateRaster2.opacity = 0.01;


            //setTimeout(function () {
            //    animateRaster1.remove();
            //    animateRaster2.opacity = 1;
            //}, 30)

            ////animateRaster2.opacity = 1;
            ////animateRaster2.remove();
            ////animateRaster3.opacity = 0.01;

            //setTimeout(function () {
            //    animateRaster2.remove();
            //    animateRaster3.opacity = 1;
            //}, 70)



            //setTimeout(function () {

            //    animateRaster3.remove();
            //    paperView.draw();
            //    self.trigger(customEvents.bubblePopAnimationEnd);
            //}, 100)


            self.trigger(customEvents.bubblePopAnimationStart);
        },





        /**
        * Calculates
        *
        * @method _getBubbleRadius
        * @private
        * @param currentBubblePath << {{object}} >> data of current bubble
        * @return  << {{number}} >> radius of the bubble
        */

        _getBubbleRadius: function (currentBubblePath) {

            return currentBubblePath.bounds.height / 2

        },

        /**
        * Redraws the purple, red strings at the bottom bar
        *
        * @method _redrawBar
        * @private
        */

        _redrawBar: function () {

            var _model = this.model, purpleBar = _model.get('purpleBar'), redBar = _model.get('redBar'),
                  foci1 = _model.get('foci1'),
                 foci2 = _model.get('foci2'),
                 thumbTack = _model.get('thumbTack');

            if (purpleBar) {
                purpleBar.remove();
            }
            if (redBar && this.redBarLoded === false) {
                redBar.remove();
            }
            this._generateBar();

        },

        /**
        * Generate the purple string, red string bar at the bottom
        *
        * @method _generateBar
        * @private
        * @param <<paramName>> << {{param type }} >> <<description>>
        */

        _generateBar: function () {
            this.paperScope2.activate();
            var tackToFoci1,
                  tackToFoci2,
                  firstPointX,
                  center,
                  majorAxis,
                  options,
                  endPointX,
                  secondBarendPointX,
                  paperScope2 = this.paperScope2,
                  pointY = 551,
                  model = this.model,
                  purpleBar,
                  purpleStringBarRaster = null,
                  redStringBarRaster = null,
                  redBar,
                  imgWidth = 6, vector;


            //if (purpleStringBarRaster) {
            //    purpleStringBarRaster.remove();
            //}
            //if (redStringBarRaster) {
            //    redStringBarRaster.remove();
            //}
            tackToFoci1 = Math.floor(model.get('tackToFoci1'));
            tackToFoci2 = Math.floor(model.get('tackToFoci2'));
            center = model.getOriginPosition();
            majorAxis = model.get('majorAxis');


            firstPointX = Math.floor(center.x - (majorAxis / 2));
            endPointX = Math.floor(firstPointX + majorAxis);



            // redStringBarRaster = imageRaster.getSubRaster(0, 94, 6, 10),
            //   _model.set('redStringBarRaster', redStringBarRaster);

            if (this.redBarLoded === false) {
                options = [{
                    'raster': redStringBarRaster,
                    'startingPoint': new paperScope2.Point(firstPointX, pointY),
                    'endingPoint': new paperScope2.Point(endPointX, pointY),
                    'width': imgWidth,
                    'height': 10,
                    'angle': 0,
                    'isRatioBar': true,
                    'isRatioBar1': true,
                    'isRatioBar2': true,
                    'ratioBar1Height': 23,
                    'ratioBar1Width': 1,
                    'ratioBar2Height': 23,
                    'ratioBar2Width': 1,
                    'lineColor': 'red'
                }];

                redBar = this._drawLine(options);
                model.set('redBar', redBar);
            }

            secondBarendPointX = firstPointX + tackToFoci1;
            // purpleStringBarRaster = imageRaster.getSubRaster(16, 94, 6, 10),
            // _model.set('purpleStringBarRaster', purpleStringBarRaster);
            options = [{
                'raster': purpleStringBarRaster,
                'startingPoint': new paperScope2.Point(firstPointX, pointY),
                'endingPoint': new paperScope2.Point(secondBarendPointX, pointY),
                'width': imgWidth,
                'height': 10,
                'angle': 0,
                'isRatioBar': true,
                'isRatioBar1': false,
                'isRatioBar2': true,
                'ratioBar2Height': 23,
                'ratioBar2Width': 3,
                'lineColor': 'purple'

            }];
            purpleBar = this._drawLine(options);
            model.set('purpleBar', purpleBar);


            // imageRaster.remove();

        },

        /**
        * Redraws the purple string, red string between foci & thumbtack
        *
        * @method _redrawStrings
        * @private
        */

        _redrawStrings: function _redrawStrings() {

            var model = this.model,
                purple = model.get('purple'),
                red = model.get('red'),
                black = model.get('black'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                thumbTack = model.get('thumbTack'),
                purpleStringRaster = null,
                redStringRaster = null,
                blackStringRaster = model.get('blackStringRaster'),
                shape = model.get('shape', shape),
                shapeCenter = model.get('shapeCenter', shapeCenter),
                adjustedPoint = new this.paperScope2.Point(0, 0),
                tX = thumbTack.position.x,
                tY = thumbTack.position.y,
                scX = shapeCenter.position.x,
                scY = shapeCenter.position.y;

            //if (tY <= scY) {
            //    if (tX >= scX) {
            //        adjustedPoint.x = thumbTack.position.x + (thumbTack.bounds.rightCenter.x - thumbTack.bounds.center.x) / 2;
            //        adjustedPoint.y = thumbTack.position.y;
            //    }
            //    else if (tX < scX) {
            //        adjustedPoint.x = thumbTack.position.x + (thumbTack.bounds.rightCenter.x - thumbTack.bounds.center.x) / 3;
            //        adjustedPoint.y = thumbTack.position.y - (thumbTack.bounds.rightCenter.x - thumbTack.bounds.center.x) / 3;
            //    }
            //}
            //else if (tY > scY) {
            //    if (tX <= scX) {
            //        adjustedPoint.x = thumbTack.position.x - (thumbTack.bounds.rightCenter.x - thumbTack.bounds.center.x) / 2;
            //        adjustedPoint.y = thumbTack.position.y;
            //    }
            //    else if (tX > scX) {
            //        adjustedPoint.x = thumbTack.position.x - (thumbTack.bounds.rightCenter.x - thumbTack.bounds.center.x) / 3;
            //        adjustedPoint.y = thumbTack.position.y + (thumbTack.bounds.rightCenter.x - thumbTack.bounds.center.x) / 3;
            //    }
            //}

            adjustedPoint.x = thumbTack.position.x;
            adjustedPoint.y = thumbTack.position.y;


            if (shape === 'ellipse') {
                if (purple) {
                    purple.remove();

                }
                if (red) {
                    red.remove();
                }



                this._generateString('purple', purpleStringRaster, foci1.position, adjustedPoint, false);
                this._generateString('red', redStringRaster, foci2.position, adjustedPoint, false);

                //                this._generateString('purple', purpleStringRaster, foci1.position, this.dummyTackPath.position, false);
                //                this._generateString('red', redStringRaster, foci2.position, this.dummyTackPath.position, false);

                //                this._generateString('purple', purpleStringRaster, foci1.position, thumbTack.position, false);
                //                this._generateString('red', redStringRaster, foci2.position, thumbTack.position, false);
            }
            else if (shape === 'circle') {
                if (black) {
                    black.remove();
                }

                this._generateString('black', blackStringRaster, shapeCenter.position, thumbTack.position, false);
            }

        },

        /**
        * Draws the dashed line
        *
        * @method _drawDashedLine
        * @private
        * @param startPoint << {{object}} >> staring point
        * @param endPoint << {{object}} >> ending point
        * @return  << {{object}} >> dashed line
        */

        _drawDashedLine: function (startPoint, endPoint) {
            var path = null, paperScope2 = this.paperScope2;
            path = new paperScope2.Path.Line(startPoint, endPoint);
            path.strokeColor = '#555555';
            path.dashArray = [3, 5];
            return path;
        },

        /**
        * Gets the image URL from sprite
        *
        * @method getImageURLFromSprite
        * @private || public
        * @param imageName << {{string}} >> name of color
        * @return  << {{object}} >> image URL
        */

        getImageURLFromSprite: function (imageName) {
            var imgURL = null
            if (imageName === 'red') {
                imgURL = this.getSpritePartBase64URL('ellipse-explorer', 0, 15, 1100, 5);
            }
            else if (imageName === 'purple') {
                imgURL = this.getSpritePartBase64URL('ellipse-explorer', 0, 0, 1100, 5);
            }
            else if (imageName === 'Barpurple') {
                imgURL = this.getSpritePartBase64URL('ellipse-explorer', 0, 30, 1500, 10);
            }
            else if (imageName === 'Barred') {
                imgURL = this.getSpritePartBase64URL('ellipse-explorer', 0, 50, 1856, 10);
            }
            else if (imageName === 'black') {
                imgURL = this.getSpritePartBase64URL('circle-explorer', 0, 0, 1100, 5);
            } else if (imageName === 'largeBubble') {

                imgURL = this.getSpritePartBase64URL('explore-shapes', 0, 0, 44, 44);
            }
            else if (imageName === 'smallBubble') {

                imgURL = this.getSpritePartBase64URL('explore-shapes', 96, 0, 24, 24);
            }
            else if (imageName === 'middleBubble') {

                imgURL = this.getSpritePartBase64URL('explore-shapes', 54, 0, 32, 32);
            }




            else if (imageName === 'animateLargeBubble1') {

                imgURL = this.getSpritePartBase64URL('explore-shapes', 130, 0, 44, 44);
            }
            else if (imageName === 'animateLargeBubble2') {
                imgURL = this.getSpritePartBase64URL('explore-shapes', 184, 0, 44, 44);

            } else if (imageName === 'animateLargeBubble3') {

                imgURL = this.getSpritePartBase64URL('explore-shapes', 238, 0, 44, 44);

            } else if (imageName === 'animateSmallBubble1') {

                imgURL = this.getSpritePartBase64URL('explore-shapes', 130, 96, 24, 24);
            }
            else if (imageName === 'animateSmallBubble2') {
                imgURL = this.getSpritePartBase64URL('explore-shapes', 164, 96, 24, 24);

            } else if (imageName === 'animateSmallBubble3') {

                imgURL = this.getSpritePartBase64URL('explore-shapes', 198, 96, 24, 24);
            } else if (imageName === 'animateMiddleBubble1') {

                imgURL = this.getSpritePartBase64URL('explore-shapes', 130, 54, 32, 32);
            }
            else if (imageName === 'animateMiddleBubble2') {
                imgURL = this.getSpritePartBase64URL('explore-shapes', 172, 54, 32, 32);

            } else if (imageName === 'animateMiddleBubble3') {
                imgURL = this.getSpritePartBase64URL('explore-shapes', 214, 54, 32, 32);

            }
            else if (imageName === 'arrowCenter') {
                imgURL = this.getSpritePartBase64URL('explore-shapes', 232, 96, 21, 21);

            }




            return imgURL;
        },

        /**
        * Returns the sliced string line
        *
        * @method renderImagePattern
        * @private || public
        * @param startPt << {{object}} >> starting point
        * @param endPt << {{object}} >> ending point
        * @param color << {{string}} >> color
        * @param lineWidth << {{number}} >> width
        * @return  << {{object}} >> sliced string line
        */

        renderImagePattern: function (startPt, endPt, color, lineWidth) {
            if (typeof this.rasterPattern[color] === 'undefined') {
                var imageURL = this.getImageURLFromSprite(color);
                this.rasterPattern[color] = new this.paperScope2.Raster(imageURL);
                this.rasterPattern[color].opacity = 0;
            }
            var stringLine = new this.paperScope2.Path({
                strokeColor: 'red'
            }),
            p3 = { x: startPt.x, y: startPt.y + lineWidth },
            p4 = { x: endPt.x, y: endPt.y + lineWidth },
            raster = this.rasterPattern[color].clone();
            stringLine.add(startPt);
            stringLine.add(endPt);
            stringLine.add(p4);
            stringLine.add(p3);
            stringLine.closed = true;
            raster.opacity = 1;
            raster.position = startPt;
            raster.position.y = startPt.y + lineWidth / 2;
            raster.position.x = startPt.x + this.viewStaticData.ADD_X_POSITION[color];
            var slicedStringLine = new this.paperScope2.Group([stringLine, raster]);
            slicedStringLine.clipped = true;
            slicedStringLine.position = raster.position;
            slicedStringLine.position.y -= lineWidth / 2;
            return slicedStringLine;
        },

        /**
        * Draws the purple, red, black line as & when required
        *
        * @method _drawLine
        * @private
        * @param args << {{object}} >> required data
        * @return  << {{object}} >> group
        */

        _drawLine: function _drawLine(args) {
            //this.scope.activate();
            var raster = args[0].raster, vector,
                paperScope2 = this.paperScope2,
                calX = 0, calY = 0,
                x = args[0].startingPoint.x,
                y = args[0].startingPoint.y,
                x1 = args[0].endingPoint.x,
                y1 = args[0].endingPoint.y,
                vector = args[0].startingPoint.subtract(args[0].endingPoint),
                height = args[0].height,
                group = null,
                isRatioBar = args[0].isRatioBar, length, loop, ratioBar1Height,
                    ratioBar2Height,
                    ratioBar1Width,
                    ratioBar2Width,
                    centerForRatioBar,
                width = args[0].width;
            //this.scope.view.draw();
            //view.draw();
            length = Math.floor(vector.length);
            //  length += width - length%width;

            //                var symBol=new paperScope2.Symbol(raster);


            if (isRatioBar === true) {
                calX = x + length;
                group = this.renderImagePattern({
                    x: x,
                    y: y
                },
                 {
                     x: calX,
                     y: y
                 },
                 'Bar' + args[0].lineColor,
                 10
                );
                var from, to, path, path1,
                    lineLabel = null;
                ratioBar1Height = args[0].ratioBar1Height;
                ratioBar2Height = args[0].ratioBar2Height;
                ratioBar1Width = args[0].ratioBar1Width;
                ratioBar2Width = args[0].ratioBar2Width;

                if (args[0].isRatioBar1 === true) {
                    lineLabel = new this.paperScope2.Group();
                    centerForRatioBar = ((ratioBar1Height - height) / 2) + (height / 2);
                    from = new paperScope2.Point(x - ratioBar1Width, y - centerForRatioBar);
                    to = new paperScope2.Point(x - ratioBar1Width, ((y - centerForRatioBar) + ratioBar1Height));
                    path = new paperScope2.Path.Line(from, to);
                    path.strokeColor = 'black';
                    path.strokeWidth = ratioBar1Width;
                    lineLabel.addChild(path);
                    lineLabel.moveAbove(group);
                    group = new this.paperScope2.Group([group, lineLabel]);
                    // group.appendTop(path);
                }
                if (args[0].isRatioBar2 === true) {
                    lineLabel = new this.paperScope2.Group();
                    centerForRatioBar = ((ratioBar2Height - height) / 2) + (height / 2);
                    from = new paperScope2.Point(calX, y - centerForRatioBar);
                    to = new paperScope2.Point(calX, ((y - centerForRatioBar) + ratioBar2Height));
                    path1 = new paperScope2.Path.Line(from, to);
                    path1.strokeColor = 'black';
                    path1.strokeWidth = ratioBar2Width;
                    lineLabel.addChild(path1);
                    lineLabel.moveAbove(group);
                    group = new this.paperScope2.Group([group, lineLabel]);
                    //group.appendTop(path1);

                }
            }
            else {
                group = this.renderImagePattern({
                    x: x,
                    y: y
                },
                 {
                     x: x + length,
                     y: y
                 },
                 args[0].lineColor,
                 6
                );
            }
            // raster.visible = false;
            group.rotate(args[0].angle, new paperScope2.Point(x, y));
            if (isRatioBar !== true) {
                group.moveAbove(this.model.get('thumbTack'));
            }
            // this.model.get('thumbTack').children[1].moveAbove(group);
            return group;
        },

        /**
        * Calculates distance between points
        *     
        * @method _getPointDistance
        * @param point1 {Object} point 1
        * @param point2 {Object} point 2
        * @return distance {Number} distance between two points       
        * @private
        **/

        _getPointDistance: function (point1, point2) {
            return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        },

              /**
      * Loads the canvas
      *
      * @method _loadCanvas
      * @private
      **/
        _loadCanvas: function () {
            var  style = {
                    strokeColor: '#aaaaaa',
                    dashArray: [2, 2],
                    strokeWidth: 2
                    },
                    paperScope2=this.paperScope2,
                    point= new paperScope2.Point(0, 0),
                    shape=this.model.get('shape');
            this.focusRect = new this.paperScope2.Path.RegularPolygon(point, 4, 30);
            this.focusRect.style = style;
            this.focusRect.opacity = 0;
            /**
            * Used For Accessibility...
            **/
            this._initAccessibility();
            this._bindAccessibilityListeners();
            this.afterFirstAnimate=true;
          //  this.loadScreen('explore-shape-acc-screen');
//            if(shape==='ellipse')
//               {
//                this.changeAccMessage('graph-holder-explore-graph-acc-container', 0);
//               }
//            else if(shape==='circle')
//                {
//                this.changeAccMessage('graph-holder-explore-graph-acc-container', 1);
//                }
//            this.$('.canvas-element').on('click', function () {
//                self.setFocus('graph-holder-explore-graph-acc-container');

//            });
        },

        /**
        * Initializes accessibility
        *
        * @method _initAccessibility
        * @private
        */
        _initAccessibility: function () {
            var canvasAccOption = {
                canvasHolderID: this.el.id + '-explore-graph-acc-container',
                paperItems: [],
                paperScope: this.paperScope2,
                manager: this.manager,
                player: this.player
            };

            this.canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc(canvasAccOption);
            this.updateCanvasElement(true);

        },
        updateCanvasElement:function(value){
        if(value=true)
        {
            this.canvasAcc.updatePaperItems(this.getPaperObjects());
        }
        else
        {
        this.canvasAcc.updatePaperItems();
        }
            this.currentIndex=null;
        },
        /**
        * Gets all current paper objects on canvas
        *     
        * @method getPaperObjects
        * return {Array} [paperObj] array of paper objects
        **/
        getPaperObjects: function () {
            var currSegment,
                model=this.model,
                shape=model.get('shape'),
                foci1=null,
                foci2=null,
                shapeCenter=null,
                thumbTack=null,
                isFociMovable=model.get('isFociMovable'),
                isCenterMovable=model.get('isCenterMovable'),
                isThumbTackMovable=model.get('isThumbTackMovable'),


                paperObj = [];
                switch (shape) {
                    case 'ellipse':
                        if(isCenterMovable===true)
                        {
                         shapeCenter=model.get('shapeCenter');
                         paperObj.push(shapeCenter);
                        }
                        if(isFociMovable===true)
                        {
                          foci1=model.get('foci1');
                          foci2=model.get('foci2');   
                          paperObj.push(foci1,foci2);
                        }
                        if(isThumbTackMovable===true)
                        {
                            thumbTack=model.get('thumbTack');
                            paperObj.push(thumbTack);
                        }
                        return paperObj;
                        break;
               
                    case 'circle':
                        if (isCenterMovable === true) {
                            shapeCenter = model.get('shapeCenter');
                            paperObj.push(shapeCenter);
                        }
                        if (isThumbTackMovable === true) {
                            thumbTack = model.get('thumbTack');
                            paperObj.push(thumbTack);
                        }
                        return paperObj;
                            break;
                default:    break;
                }
           
        },
          _bindAccessibilityListeners: function () {
           var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $('#' + this.el.id + '-explore-graph-acc-container'),
                self = this,
                item=null,
                shapeCenter=null,
                foci1=null,
                foci2=null,
                thumbTack=null,
                isFociMovable=null,
                isCenterMovable=null,
                isThumbTackMovable=null,
                eventData=null,
                item=null,
                isRotate=null;

            // Handle tab
            $canvasHolder.on(keyEvents.TAB, function (event, data) {
                   
                    eventData=null;
                    
                    item = data.item;
                    eventData=[event,data];
                    self.currentItem = item;
                    if (self.previousItem) {
                        self.previousItem.fire('mouseleave', event);
                        self.previousItem.fire('mouseup', event);
                    }
                    self.previousItem = item;
                      self.focusRect.position = item.position;
                      self.focusRect.visible = true;
                       self.focusRect.opacity = 1;
                    self.trigger(self.viewStaticData.CUSTOM_EVENTS.tabKeyPressed,eventData);
                                       

            });

            // Handle space
            $canvasHolder.on(keyEvents.SPACE, function (event, data) {
             
                eventData=null;
                eventData=[event,data];
                    item = data.item;
                 self.currentItem = item;
                  self.previousItem = item;
                   self.focusRect.position = item.position;
                      self.focusRect.visible = true;
                       self.focusRect.opacity = 1;
                self.trigger(self.viewStaticData.CUSTOM_EVENTS.spaceKeyPressed,eventData);
                

                
            });


            // Handle focus out
            $canvasHolder.on(canvasEvents.FOCUS_OUT, function (event, data) {
                  
                  eventData=null;
                 eventData=[event,data];
                 item = data.item;
                  if (self.previousItem) {

                self.previousItem.fire('mouseleave', event);
                self.previousItem.fire('mouseup', event);
                }
                self.previousItem = null;
                self.focusRect.visible = false;
                self.focusRect.opacity = 0;
                
                self.trigger(self.viewStaticData.CUSTOM_EVENTS.focusOut,eventData);
                self.paperScope2.view.draw();
                

            });

            $canvasHolder.off(keyEvents.ARROW).on(keyEvents.ARROW, $.proxy(this.arrowKeyPressed, this));
            $canvasHolder.off(keyEvents.ROTATE_CLOCKWISE).on(keyEvents.ROTATE_CLOCKWISE, $.proxy(this.rotateClockWise, this));
            $canvasHolder.off(keyEvents.ROTATE_ANTI_CLOCKWISE).on(keyEvents.ROTATE_ANTI_CLOCKWISE, $.proxy(this.rotateAntiClockWise, this));


           
        },


         arrowKeyPressed: function arrowKeyPressed(event, data) {
         var eventData=[event,data],
         self=this,
         item = data.item;

                 self.draggableElement = item;
                 self.trigger(self.viewStaticData.CUSTOM_EVENTS.arrowKeyPressed,eventData);
                 self.paperScope2.view.draw();


        },
          rotateClockWise: function (event, data) {
          var eventData=[event,data],
             self=this,
             item = data.item,
             eventpoint = item.position,
            circumferencePath = self.model.get('circumferencePath'),
            currentIndex = null,
            isRotate=this.model.get('isRotate'),
            thumbTack=this.model.get('thumbTack'),
            step = self.model.get('gridSizeXAxis');
            self.draggableElement = item;
            if(item===thumbTack && isRotate===true)
            {
           
            if (this.currentIndex === null) {
                this.currentIndex = self._getCurrentPointIndex(eventpoint, circumferencePath)
            }
            currentIndex = this.currentIndex;
             event.target = item;
             event.target.name = item.name;
             event.event = event;
             event.event.which = 1;
             console.log(currentIndex - 4);
             if (currentIndex-4 < 0) {
                 currentIndex=currentIndex-0;
                 switch(currentIndex)
                 {
                     case 0: currentIndex =356;
                         break;
                     case 1: currentIndex = 357;
                         break;
                     case 2: currentIndex = 358;
                         break;
                     case 3: currentIndex = 359;
                         break;
                 }
             }

             console.log(currentIndex);
             event.point = new self.paperScope2.Point(circumferencePath[currentIndex - 4]);
             this.currentIndex= currentIndex - 4;
             console.log(currentIndex - 4);
            // if(this.model.get('minorAxis')===0){
            //    if(currentIndex<=180 && currentIndex >=0){
            //        event.point.y -= 10;
            
            //    }
            //    else
            //    {
            //        event.point.y += 10;
            
            //    }
             
            //}

            
             self._showShapeMouseDragFeatures(event);
             self._showShapeMouseUpFeatures(event);
             item.fire('mousedown', event);
             item.fire('mousedrag', event);
             self.paperScope2.view.draw();
             self.trigger(self.viewStaticData.CUSTOM_EVENTS.rotateClockWise,eventData);
            }

        },
          rotateAntiClockWise: function (event, data) {
               var eventData=[event,data],
             self=this,
             item = data.item,
             eventpoint = item.position,
            circumferencePath = self.model.get('circumferencePath'),
            currentIndex = null,
             isRotate=this.model.get('isRotate'),
             thumbTack=this.model.get('thumbTack'),
            step = self.model.get('gridSizeXAxis');
            self.draggableElement = item;
             if(item===thumbTack && isRotate===true)
            {
            if (this.currentIndex === null) {
                this.currentIndex = self._getCurrentPointIndex(eventpoint, circumferencePath)
            }
            currentIndex = this.currentIndex;
              event.target = item;
              event.target.name = item.name;
              event.event = event;
              event.event.which = 1;
              if (currentIndex + 4 >= 360) {
                  currentIndex=360-currentIndex;
                  switch (currentIndex){
                      case 0: currentIndex = -4;
                          break;
                      case 1: currentIndex = -1;
                          break;
                      case 2: currentIndex = -2;
                          break;
                      case 3: currentIndex = -3;
                          break;
                    }
                
            }
            event.point = new self.paperScope2.Point(circumferencePath[currentIndex + 4]);
             this.currentIndex= currentIndex + 4;
            self._showShapeMouseDragFeatures(event);
            self._showShapeMouseUpFeatures(event);
            item.fire('mousedown', event);
            item.fire('mousedrag', event);
            self.paperScope2.view.draw();
            self.trigger(self.viewStaticData.CUSTOM_EVENTS.rotateAntiClockWise, eventData);
          }
        },
      

    },



    {
        ADD_X_POSITION: {
            'red': 500,
            'purple': 500,
            'Barred': 900,
            'Barpurple': 700,
            'black': 400,
        },
        ANIMATION_DURATION: 4000,
        CUSTOM_EVENTS: {

            animationCompleate: 'animationCompleate',
            bubblePopAnimationStart: 'bubblePopAnimationStart',
            bubblePopAnimationEnd: 'bubblePopAnimationEnd',
            bubblePopulationAnimationEnd: 'bubblePopulationAnimationEnd',
            bubblePopulationAnimationStart: 'bubblePopulationAnimationStart',
            onRedCircle: 'onRedCircleShown',
            onInsideCollisionCircle: 'onInsideCollisionCircle',
            initializationDone: "initializationDone",
            arrowKeyPressed:"arrowKeyPressed",
            tabKeyPressed:"tabKeyPressed",
            spaceKeyPressed:"spaceKeyPressed",
            rotateClockWise:"rotateClockWise",
            rotateAntiClockWise:"rotateAntiClockWise",
            focusOut:"focusOut"

        },
        /**
        * store radius of bubbles
        * @type object   
        */

        RADIUS_OF_BUBBLES: {
            largeBubbleRadius: 19,
            smallBubbleRadius: 11,
            middleBubbleRadius: 15

        },

        HEIGHT_OF_ELLIPSE_EQUATION: 65,
        WIDTH_OF_ELLPSE_EQUATION: 240,
        HEIGHT_OF_CIRCLE_EQUATION: 50,
        WIDTH_OF_CIRCLE_EQUATION: 240,
        PADDING_FROM_SHAPE: 30,
        /**
        * store positiotn of bubbles inside sprite
        * @type object   
        */
        POSITION_OF_BUBBLE: {
            largeBubble: [0, 0, 44, 44],
            smallBubble: [96, 0, 24, 24],
            middleBubble: [54, 0, 32, 32],


            largeAnimateBubbles: {
                bubble1: [130, 0, 44, 44],
                bubble2: [184, 0, 44, 44],
                bubble3: [238, 0, 44, 44]

            },
            middleAnimateBubbles: {
                bubble1: [130, 54, 32, 32],
                bubble2: [172, 54, 32, 32],
                bubble3: [214, 54, 32, 32]

            },
            smallAnimateBubbles: {
                bubble1: [130, 96, 24, 24],
                bubble2: [164, 96, 24, 24],
                bubble3: [198, 96, 24, 24]

            }


        },

        /**
        * Create explorer shape model for given options
        * @method createExplorerShapeView
        * @param {object} options
        */

        createExplorerShapeView: function (options) {

            var model = options.model,
                el = '#' + options.contanierId,
                explorerShapeView = new MathInteractives.Common.Components.Views.ExplorerShape({ el: el, model: model });

            return explorerShapeView;


        }

    })
})()