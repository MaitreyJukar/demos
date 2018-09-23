(function (MathInteractives) {
    'use strict';

    if (typeof MathInteractives.Common.Interactivities.ConicExplorer === 'undefined') {
        MathInteractives.Common.Interactivities.ConicExplorer = {};
        MathInteractives.Common.Interactivities.ConicExplorer.Views = {};
        MathInteractives.Common.Interactivities.ConicExplorer.Models = {};
    }

    /**
    * Top level model for all both (Explore and Data) tabs.
    * @module ConicPlotter
    * @namespace MathInteractives.Interactivities.ConicExplorer.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Common.Interactivities.ConicExplorer.Views.ConicPlotter = MathInteractives.Common.Player.Views.Base.extend({


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
        * Holds the current paper scope
        *
        * @property paperScope
        * @type Object
        * @default null
        */
        paperScope: null,


        /**
        * Holds the current paper tool
        *
        * @property currentTool
        * @type Object
        * @default null
        */
        currentTool: null,
        dummyTackPath1: null,
        dummyTackPath2: null,
        /**
        * Holds the current graph origin point
        *
        * @property origin
        * @type Object
        * @default null
        */
        origin: null,
        /**
        * Holds maximum number of elements to be generate.
        *
        * @property pointsRange
        * @type Object
        * @default null
        */
        pointsRange: null,
        /**
        * Holds main activity area dimension of canvas.
        * Dimensions are stored in sequence of left,top,width,height.
        *
        * @property areaDimension
        * @type array
        */
        areaDimension: [149, 102, 914, 523],
        /**
        * Holds Current Position of right Thmbtack before deleting.
        *
        * @property thumbTackPosition1
        * @type Object
        * @default null
        */
        thumbTackPosition1: null,

        /**
        * Holds the value of isFirstRun
        * @attribute isFirstRun
        * @private
        * @type boolean
        * @default true
        */

        isFirstRun: true,
        /**
        * Holds Current Position of left Thmbtack before deleting.
        *
        * @property thumbTackPosition2
        * @type Object
        * @default null
        */
        thumbTackPosition2: null,
        /**
        * Boolean to notify whether conic shape is across x-axis or y-axis
        * @property isVertical
        * @type Boolean
        * @default false
        */
        isVertical: false,
        focusRect: null,

        /**
        * Stores x co-ordinate of the foci after initial animation
        * @property fociCoordinateAfterAnimation
        * @type Number
        * @default null
        */
        fociCoordinateAfterAnimation: null, isCursorDefault: false,

        /**
        * Calls render and set values of player and manager and attach events
        *
        * @method initialize
        **/
        initialize: function () {

            var model = this.model;
            var self = this;
            this.idPrefix = model.get('idPrefix');
            this.manager = model.get('manager');
            this.filePath = model.get('filePath');
            this.player = model.get('player');
            this.viewStaticData = MathInteractives.Common.Interactivities.ConicExplorer.Views.ConicPlotter;
            this.pointsRange = 1800;
            this.isFirstRun = true;
            this._renderGraph();
            this.rasterPattern = {};
            this._appendDrawingLayer();
            this.hitOptions = { segments: true, stroke: true, fill: true, tolerance: 3 };

            this.paperScope2.activate();
            this.paperScope.view.draw();
            this._prepareColorStringRasters();
            this.on(this.viewStaticData.CUSTOM_EVENTS.initializationDone, function () {
                self._setInitialAnimationPosition();
            });
            this.thumbTackRaster = this.getSpritePartBase64URL('explore-shapes', 92, 54, 19, 39);
            this.focusRect = new this.paperScope2.Path.RegularPolygon(new this.paperScope2.Point(0, 0), 4, 30);
            this.focusRect.style = {
                strokeColor: '#aaaaaa',
                dashArray: [2, 2],
                strokeWidth: 2
            };
            this.focusRect.opacity = 0;

            this.loadScreen('conic-shape-acc-screen');
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
        * resumes the initialization
        *
        * @method _resumeInitialization
        * @private
        */

        _resumeInitialization: function () {
            var model = this.model,
                foci1 = null,
                foci2 = null,
                purpleStringRaster = null,
                redStringRaster = null,
                thumbTack1 = null,
                group1 = null,
                group2 = null,
                group3 = null,
                group4 = null,
                vertex1 = null,
                vertex2 = null,
                shapeCenter = null,
                dummyThumbTack1 = null,
                dummyThumbTack2 = null,
                thumbTack2 = null;
            this._render();
            this.paperScope.view.draw();
            this.paperScope2.activate();
            //this._bindEvents();

            this._snapAll();
            foci1 = model.get('foci1');
            foci2 = model.get('foci2');
            thumbTack1 = model.get('thumbTack1');
            thumbTack2 = model.get('thumbTack2');
            dummyThumbTack1 = model.get('dummyThumbTack1');
            dummyThumbTack2 = model.get('dummyThumbTack2');
            vertex1 = model.get('vertex1');
            vertex2 = model.get('vertex2');
            shapeCenter = model.get('shapeCenter');
            this.entireGroup = new this.paperScope2.Group();

            this._generateString('purple', purpleStringRaster, foci1.position, thumbTack1.position, false);
            group1 = model.get('purple');
            group1.moveAbove(model.get('thumbTack1'));
            this._generateString('red', redStringRaster, foci2.position, thumbTack1.position, false);
            group2 = model.get('red');
            group2.moveAbove(model.get('thumbTack1'));
            this._generateString('red', purpleStringRaster, foci1.position, thumbTack2.position, false);
            group3 = model.get('red');
            group3.moveAbove(model.get('thumbTack2'));
            this._generateString('purple', redStringRaster, foci2.position, thumbTack2.position, false);
            group4 = model.get('purple');
            group4.moveAbove(model.get('thumbTack2'));
            group1.name = 'purple-line1';
            group2.name = 'red-line1';
            group3.name = 'purple-line2';
            group4.name = 'red-line2';
            this.entireGroup.addChildren([foci1, foci2, thumbTack1, thumbTack2, dummyThumbTack1, dummyThumbTack2, vertex1, vertex2, shapeCenter, group1, group2, group3, group4]);
            //this._bindEvents();
            this._generateBar();
            this.paperScope2.view.draw();
            this._handleInitialAnimationStart();
            this.trigger(this.viewStaticData.CUSTOM_EVENTS.initializationDone);
        },

        /**
        * Sets initial position of all elements
        *
        * @method _setInitialAnimationPosition
        * @private
        */
        _setInitialAnimationPosition: function () {
            var model = this.model,
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                dummyThumbTack2 = model.get('dummyThumbTack2'),
                shapeCenter = model.get('shapeCenter'),
                positionOffset = model.get('gridSizeXAxis') * 8,
                xPosition = shapeCenter.position.x,
                yPosition = shapeCenter.position.y;
            this.paperScope2.activate();
            thumbTack1.position.x = xPosition;
            thumbTack1.position.y = yPosition;
            thumbTack2.position.x = xPosition;
            thumbTack2.position.y = yPosition;
            vertex1.position.x = xPosition;
            vertex1.position.y = yPosition;
            vertex2.position.x = xPosition;
            vertex2.position.y = yPosition;
            dummyThumbTack1.position.x = xPosition;
            dummyThumbTack1.position.y = yPosition;
            dummyThumbTack2.position.x = xPosition;
            dummyThumbTack2.position.y = yPosition;
            model.set('thumbTack1', thumbTack1);
            model.set('thumbTack2', thumbTack2);
            model.set('shapeCenter', shapeCenter);
            foci1.position.x = xPosition;
            foci1.position.y = yPosition - positionOffset / 2;
            foci2.position.x = xPosition;
            foci2.position.y = yPosition + positionOffset / 2;
            this._snapAll();
            this._redrawStringsAndUpdateGroup();
            this.paperScope2.view.draw();

        },

        /**
        * Renders graph
        *
        * @method _renderGraph
        * @private
        **/
        _renderGraph: function _renderGraph() {
            this._appendCanvas();
            this._setPaperScope();
            this._setCanvasStyle();
            this._drawGrid();
        },

        /**
        * Renders bubbles and shapes
        *
        * @method render
        * @private
        **/
        _render: function _render() {

            this.paperScope2.activate();
            var model = this.model,
                majorAxis = null,
                minorAxis = null,
                center = model.getOriginPosition(),
                foci1 = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 0, 54, 36, 36)),
                foci2 = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 46, 54, 36, 36)),
                vertex1 = null,
                vertex2 = null,
                myStyle1 = null,
                points = null,
                dummyThumbTack1 = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 80, 34, 19, 28)),
                dummyThumbTack2 = new this.paperScope2.Raster(this.getSpritePartBase64URL('explore-shapes', 80, 34, 19, 28)),
                thumbTack1 = null,
                dummyVertex1 = null,
                dummyVertex2 = null,
                thumbTack2 = null;

            var myPaper = this.paperScope2;

            this._getRandomMajorAxisAndFoci();
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('center', center);
            majorAxis = model.get('majorAxis');
            minorAxis = model.get('minorAxis');
            var myStyle = {
                strokeColor: '#555555',
                fillColor: {
                    gradient: {
                        stops: ['#ffffff', '#bcb5c5']
                    },
                    origin: new this.paperScope2.Point(center.x - (majorAxis) - 7, center.y - 7),
                    destination: new this.paperScope2.Point(center.x - (majorAxis) + 7, center.y + 7)
                },
                strokeWidth: 2
            };
            vertex1 = new this.paperScope2.Path.Circle(new this.paperScope2.Point(center.x - majorAxis, center.y), 7);
            vertex1.style = myStyle;
            vertex2 = new this.paperScope2.Path.Circle(new this.paperScope2.Point(center.x + majorAxis, center.y), 7);
            myStyle1 = myStyle;
            vertex2.style = {
                strokeColor: '#555555',
                fillColor: {
                    gradient: {
                        stops: ['#ffffff', '#bcb5c5']
                    },
                    origin: new this.paperScope2.Point(center.x + (majorAxis) - 7, center.y - 7),
                    destination: new this.paperScope2.Point(center.x + (majorAxis) + 7, center.y + 7)
                },
                strokeWidth: 2
            };
            vertex1.name = 'vertex1';
            vertex2.name = 'vertex2';
            dummyVertex1 = vertex1.clone();
            dummyVertex2 = vertex2.clone();
            dummyVertex1.opacity = 0;
            dummyVertex2.opacity = 0;
            if ($.support.touch) {
                dummyVertex2.bounds.width = 40; dummyVertex2.bounds.height = 40;
                dummyVertex1.bounds.width = 40; dummyVertex1.bounds.height = 40;
            } else {
                dummyVertex2.bounds.width = 20; dummyVertex2.bounds.height = 20;
                dummyVertex1.bounds.width = 20; dummyVertex1.bounds.height = 20;
            }
            dummyVertex1.name = 'vertex1';
            dummyVertex2.name = 'vertex2';
            model.set('dummyVertex1', dummyVertex1);
            model.set('dummyVertex2', dummyVertex2);

            this._setInitialPosition();
            model.set('vertex1', vertex1);
            this._calculateMajorAxisAndMinorAxis();
            majorAxis = this.model.get('majorAxis');
            minorAxis = this.model.get('minorAxis');
            points = this.returnHyperBolaPoints(center, majorAxis, minorAxis, this.pointsRange);
            this.model.set('points', points);
            thumbTack1 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack2 = new this.paperScope2.Raster(this.thumbTackRaster);
            var indexRight, indexLeft;
            for (var i = 0; i < this.pointsRange; i++) {
                if (parseInt(points.rightWing[i].y) === parseInt(center.y - 200)) {
                    thumbTack1.position = points.rightWing[i];
                    indexRight = i;
                }
                if (parseInt(points.leftWing[i].y) === parseInt(center.y + 200)) {
                    thumbTack2.position = points.leftWing[i];
                    indexLeft = i;
                }
            }


            dummyThumbTack1.position = thumbTack1.position;
            dummyThumbTack2.position = thumbTack2.position;
            dummyThumbTack1.opacity = 0;
            dummyThumbTack2.opacity = 0;

            thumbTack1.name = 'thumbTack1';
            thumbTack2.name = 'thumbTack2';
            dummyThumbTack1.name = 'thumbTack1';
            dummyThumbTack2.name = 'thumbTack2';
            model.set('thumbTack1', thumbTack1);
            model.set('thumbTack2', thumbTack2);
            model.set('dummyThumbTack1', dummyThumbTack1);
            model.set('dummyThumbTack2', dummyThumbTack2);
            model.set('vertex1', vertex1);
            model.set('vertex2', vertex2);

            this._drawDummyTackPath();
            if (this.model.getShowBubbles()) {

                this._setBoundsForBubbles();
                this.generateBubbles();
                this._setAnimateBubblesRaster();
            }
            this._addEquationHolderTemplate();
            this._showHideEquation(false);
        },

        _loadCanvasAcc: function () {
            this._initAccessibility();
            this._bindAccessibilityListeners();
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
                template = MathInteractives.Common.Interactivities.ConicExplorer.templates.conicExplorerGraph({ idPrefix: this.idPrefix, height: canvasHeight, width: canvasWidth }).trim();



            $el.html('').append(template);
            $el.find('.canvas-holder').attr('id', containerId + '-canvas-holder');
            $el.find('.canvas-element').attr('id', containerId + '-canvas-element');
            $el.find('.canvas-tooltip').attr('id', containerId + '-canvas-tooltip');
            $el.find('.conic-graph-acc-container').attr('id', containerId + '-conic-graph-acc-container');
        },

        //set paperscope and tool
        _setPaperScope: function () {

            var myPaper = this.paperScope = new paper.PaperScope();
            myPaper.setup(this.el.id + '-canvas-element');
            myPaper.activate();
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
                model = this.model,
                canvasParentHeight = model.getCanvasParentHeight(),
                canvasParentWidth = model.getCanvasParentWidth();


            canvasHolder.css({
                height: canvasParentHeight,
                width: canvasParentWidth

            });

        },

        _setInitialPosition: function _setInitialPosition(isVertical) {
            var model = this.model,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                center = model.get('center'),
                shapeCenter = model.get('shapeCenter'),
                fociCenterDist = model.get('foci'),
                dummyShapeCenter = model.get('dummyShapeCenter');
            if (isVertical) {
                foci1.position.y = center.y - fociCenterDist;
                foci1.position.x = center.x;
                foci2.position.y = center.y + fociCenterDist;
                foci2.position.x = center.x;
            } else {
                foci1.position.x = center.x - fociCenterDist;
                foci1.position.y = center.y;
                foci2.position.x = center.x + fociCenterDist;
                foci2.position.y = center.y;
            }

            shapeCenter = this.rasterPattern.arrowCenter;
            shapeCenter.position = center;
            shapeCenter.opacity = 1;
            dummyShapeCenter = shapeCenter.clone();
            dummyShapeCenter.name = 'shape-center';
            dummyShapeCenter.opacity = 0;
            if ($.support.touch) {
                dummyShapeCenter.bounds.height = 30;
                dummyShapeCenter.bounds.width = 30;
            }
            shapeCenter.name = 'shape-center';
            foci1.name = 'foci1';
            foci2.name = 'foci2';
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('shapeCenter', shapeCenter);
            model.set('dummyShapeCenter', dummyShapeCenter);

        },

        /**
        * Handle the start of the initial animation
        *
        * @method _handleInitialAnimationStart
        * @private
        */

        _handleInitialAnimationStart: function () {

            this.isAnimating = true;
            this.player.enableAllHeaderButtons(false);
            var $canvas = this.$('#' + this.idPrefix + 'graph-holder-canvas-element-extended');
            $canvas.css({ 'cursor': "default" });

        },

        _drawGrid: function _drawGrid() {
            this._drawCenterPostionGrid();
        },

        /**
        * draw grid with respect to origin
        * @method _drawCenterPostionGrid
        * @private
        */
        _drawCenterPostionGrid: function () {

            var model = this.model,
                myPaper = this.paperScope,
                canvasHeight = model.getCanvasHeight(),
                canvasWidth = model.getCanvasWidth(),
                gridSizeXAxis = model.getGridSizeXAxis(),
                gridSizeYAxis = model.getGridSizeYAxis(),
                xAxisLength = model.getXAxisLength(),
                yAxisLength = model.getYAxisLength(),

                origin = model.getOriginPosition(),
                startPointOfxAxis = (canvasWidth - xAxisLength) / 2,
                startPointOfyAxis = (canvasHeight - yAxisLength) / 2,
                endPointOfxAxis = startPointOfxAxis + xAxisLength,
                endPointOfyAxis = startPointOfyAxis + yAxisLength,

            xAxis = null,
            yAxis = null,
            positiveCounter = 0,
            negativeCounter = 0,

            currentLine = null,
            gridColor = null,
            dashArray = [2, 1],

            originX = origin.x,
            originY = origin.y,

            xAxisColor = model.getXAxisColor(),
            yAxisColor = model.getYAxisColor(),
            xAxisGridColor = model.getXAxisGridColor(),
            yAxisGridColor = model.getYAxisGridColor(),
            toggleGridColor = model.isToggleGridColor(),
            secondXAxisGridColor = model.getSecondXAxisGridColor(),
            secondYAxisGridColor = model.getSecondYAxisGridColor();


            this.origin = origin;

            gridColor = xAxisGridColor;
            positiveCounter = originY + gridSizeYAxis;
            negativeCounter = originY - gridSizeYAxis;

            while (positiveCounter < endPointOfyAxis || negativeCounter > startPointOfyAxis) { // while loop to draw x axis grid

                if (toggleGridColor === true) {
                    toggleGridColor = false;
                    gridColor = xAxisGridColor;
                    dashArray = [3, 1];

                }
                else {
                    if (toggleGridColor === false) {
                        toggleGridColor = true;
                        gridColor = secondXAxisGridColor;
                        dashArray = [4, 1];
                    }
                }

                if (positiveCounter < endPointOfyAxis) {
                    currentLine = new myPaper.Path({
                        segments: [[startPointOfxAxis, positiveCounter], [endPointOfxAxis, positiveCounter]],
                        strokeColor: gridColor,
                        strokeWidth: 1
                    });

                    currentLine.dashArray = dashArray;
                }
                if (negativeCounter > startPointOfyAxis) {
                    currentLine = new myPaper.Path({
                        segments: [[startPointOfxAxis, negativeCounter], [endPointOfxAxis, negativeCounter]],
                        strokeColor: gridColor,
                        strokeWidth: 1
                    });

                    currentLine.dashArray = dashArray;
                }
                positiveCounter = positiveCounter + gridSizeYAxis;
                negativeCounter = negativeCounter - gridSizeYAxis;

            }


            positiveCounter = originX + gridSizeXAxis;
            negativeCounter = originX - gridSizeXAxis;
            toggleGridColor = model.isToggleGridColor();
            gridColor = yAxisGridColor;

            while (positiveCounter < endPointOfxAxis || negativeCounter > startPointOfxAxis) { // while loop to draw y axis grid


                if (toggleGridColor === true) {
                    toggleGridColor = false;
                    gridColor = yAxisGridColor;
                    dashArray = [3, 1];
                }
                else {
                    if (toggleGridColor === false) {
                        toggleGridColor = true;
                        gridColor = secondYAxisGridColor;
                        dashArray = [4, 1];
                    }
                }

                if (positiveCounter < endPointOfxAxis) {
                    currentLine = new myPaper.Path({
                        segments: [[positiveCounter, startPointOfyAxis], [positiveCounter, endPointOfyAxis]],
                        strokeColor: gridColor,
                        strokeWidth: 1
                    });

                    currentLine.dashArray = dashArray;
                }
                if (negativeCounter > startPointOfxAxis) {
                    currentLine = new myPaper.Path.Line({
                        segments: [[negativeCounter, startPointOfyAxis], [negativeCounter, endPointOfyAxis]],
                        strokeColor: gridColor,
                        strokeWidth: 1
                    });
                    currentLine.dashArray = dashArray;
                }
                positiveCounter = positiveCounter + gridSizeXAxis;
                negativeCounter = negativeCounter - gridSizeXAxis;

                xAxis = new myPaper.Path({
                    segments: [[startPointOfxAxis, originY], [endPointOfxAxis, originY]],
                    strokeColor: xAxisColor,
                    strokeWidth: 1
                });



                yAxis = new myPaper.Path({
                    segments: [[originX, startPointOfyAxis], [originX, endPointOfyAxis]],

                    strokeColor: yAxisColor,
                    strokeWidth: 0.2
                });
            }

        },

        /**
        * generate bubbles on canvas
        * @method generateBubbles
        * @private
        */

        generateBubbles: function () {
            this.paperScope2.activate();
            this.isAnimating = true;

            var model = this.model,
                viewStaticData = this.viewStaticData,
                bubbleRadiusObject = viewStaticData.RADIUS_OF_BUBBLES,
                currentPositionArray = [],
                bubbleRadius = null,
                generateNewBubbles = model.get('generateNewBubbles'),
                currentPosition = null,
                myPaper = this.paperScope2,
                bubblesPresent = false,
                largeBubbleGroup = model.get('largeBubbleGroup'),
                currentGroup = null,
                allBubbleGroup = new myPaper.Group(),
                currentRandomNumber = null,
                currentLength = null,
                count = null,
                allPositionsArray = null,
                populateBubble = model.get('populateBubble'),
                totalArrayLength = null;




            this._showHideEquation(false);

            bubbleRadius = bubbleRadiusObject.largeBubbleRadius;
            if (largeBubbleGroup !== null) {
                bubblesPresent = true;
                model.set('intersectBubblesArray', null);
                this._clearBubbles();
                model.set('largeBubbleGroup', null);
                model.set('middleBubbleGroup', null);
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

            currentGroup = this._drawBubble(this.rasterPattern.largeBubble, currentPositionArray, bubbleRadius);
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


                model.set('currentMiddleBubblesPosition', currentPositionArray);
            }
            else {
                currentPositionArray = model.get('currentMiddleBubblesPosition');

            }

            currentGroup = this._drawBubble(this.rasterPattern.middleBubble, currentPositionArray, bubbleRadius);

            allBubbleGroup.addChild(currentGroup);
            model.set('middleBubbleGroup', currentGroup);


            bubbleRadius = bubbleRadiusObject.smallBubbleRadius;

            if (generateNewBubbles) {

                currentPositionArray = allPositionsArray;
                model.set('currentSmallBubblesPosition', currentPositionArray);

            }
            else {
                currentPositionArray = model.get('currentSmallBubblesPosition');
            }
            currentGroup = this._drawBubble(this.rasterPattern.smallBubble, currentPositionArray, bubbleRadius, true);

            model.set('smallBubbleGroup', currentGroup);
            allBubbleGroup.addChild(currentGroup);
            model.set('allBubbleGroup', allBubbleGroup);
            model.get('allBubbleGroup').sendToBack();
            if (populateBubble) {
                this._unbindEvents();
                this.populateBubble();
            }
        },

        /**
        * Clears the bubbles
        *
        * @method _clearBubbles
        * @private
        */

        _clearBubbles: function () {
            var model = this.model,
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

            var viewStaticData = this.viewStaticData,
                myPaper = this.paperScope2,
                canvasPointX = null,
                canvasPointY = null,
                count = null,
                currentInstance = null,
                populateBubble = this.model.get('populateBubble'),
                currentRaster = null,
                radiusObject = viewStaticData.RADIUS_OF_BUBBLES,
                largeBubbleRadius = radiusObject.largeBubbleRadius,
                smallBubbleRadius = radiusObject.smallBubbleRadius,
                middleBubbleRadius = radiusObject.middleBubbleRadius,
            //currentGroupArray = new Array(),
                currentGroup = new myPaper.Group(),
                currentCircle = null,
                positionArrayLength = positionArray.length;

            bubbleRadius = bubbleRadius || largeBubbleRadius;
            currentRaster = bubble;

            for (count = 0; count < positionArrayLength; count++) {

                canvasPointX = positionArray[count][0];
                canvasPointY = positionArray[count][1];

                if (bubbleRadius === largeBubbleRadius) {
                    currentCircle = new myPaper.Path.Circle({
                        radius: bubbleRadius,
                        center: [canvasPointX - 5, canvasPointY - 5]
                    });
                }
                else {
                    if (bubbleRadius === smallBubbleRadius) {
                        currentCircle = new myPaper.Path.Circle({
                            radius: bubbleRadius,
                            center: [canvasPointX - 3, canvasPointY - 3]
                        });
                    }
                    else {

                        currentCircle = new myPaper.Path.Circle({
                            radius: bubbleRadius,
                            center: [canvasPointX - 2, canvasPointY - 2]
                        });
                    }

                }

                currentInstance = currentRaster.clone(); // new myPaper.PlacedSymbol(currentSymbol);
                currentInstance.opacity = 1;
                currentInstance.position = [canvasPointX, canvasPointY];

                if (populateBubble) {

                    if (lastBubbleGroup && count === positionArrayLength - 1) {


                    }
                    else {


                    }
                }
                currentGroup.addChild(new myPaper.Group(currentCircle, currentInstance));
            }
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
                self = this,
                incrementor = null,
                count = null,
                allBubbleGroup = model.get('allBubbleGroup'),
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

                middleBubbleGroup = allBubbleGroup.children[1],
                middleBubbleBounds = middleBubbleGroup.children[0].children[1].bounds,
                middleBubbleWidth = middleBubbleBounds.width,

                largeBubbleGroup = allBubbleGroup.children[0],
                largeBubbleBounds = largeBubbleGroup.children[0].children[1].bounds,
                largeBubbleWidth = largeBubbleBounds.width;

            for (count = 0; count < bubbleGroupLength; count++) {

                currentGroupLength = allBubbleGroup.children[count].children.length;

                for (incrementor = 0; incrementor < currentGroupLength; incrementor++) {

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
                    if (smallBubbleGroup.children[0].children[1].bounds.width >= smallBubbleWidth * 4 / 10 && contract) {
                        for (count = 0; count < smallBubbleGroup.children.length; count++) {
                            smallBubbleGroup.children[count].children[1].scale(0.88);
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
                    if (largeBubbleGroup.children[0].children[1].bounds.width >= largeBubbleWidth * 6 / 10 && contractLarge) {
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

                    if (middleBubbleGroup.children[0].children[1].bounds.width >= middleBubbleWidth * 6 / 10 && contractMiddle) {
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
            }, 30);
        },

        /**
        * Initial animation
        *
        * @method _initialAniamtion
        * @private
        */
        _initialAniamtion: function () {
            var model = this.model,
                currentRandomNumber = null;

            if (!this.isFirstRun) {
                this.trigger(this.viewStaticData.CUSTOM_EVENTS.bubblePopulationAnimationEnd);
                this._handleInitialAnimationEnd();
                return false;
            }
            //this._unbindEvents();
            this._snapAll();
            this._handleInitialAnimationStart();
            this.fociCoordinateAfterAnimation = model.generateRandomNumber(this.viewStaticData.INITIAL_FOCI_MIN_LIMIT, this.viewStaticData.INITIAL_FOCI_MAX_LIMIT);
            currentRandomNumber = ((this.fociCoordinateAfterAnimation + this.viewStaticData.INITIAL_Y_START_COORDINATE) * model.get('gridSizeXAxis')) / this.viewStaticData.ANIMATION_SPEED_FACTOR;
            this._initialFociAnimation(currentRandomNumber);
        },

        /**
        * Animates the foci
        *
        * @method _initialFociAnimation
        * @param {Number} Distance to be animated
        * @private
        */
        _initialFociAnimation: function (distance) {
            var model = this.model,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                self = this,
                animationOffset = self.viewStaticData.ANIMATION_SPEED_FACTOR,
                randomNumber = null,
                verticalAnimation = true,
                fociTimer = null;

            fociTimer = setInterval(function () {
                self.paperScope2.activate();

                if (verticalAnimation && foci1.position.x === foci2.position.x) {
                    foci1.position.y += animationOffset;
                    foci2.position.y -= animationOffset;
                }
                else {
                    foci1.position.x -= animationOffset;
                    foci2.position.x += animationOffset;
                }

                self._redrawStringsAndUpdateGroup();

                if (foci1.position.x === foci2.position.x && foci1.position.y === foci2.position.y) {
                    verticalAnimation = false;
                }

                if (distance <= 0) {
                    self.model.set('showGraph', true);
                    self._snapAll();
                    clearInterval(fociTimer);
                    randomNumber = model.generateRandomNumber(self.viewStaticData.INITIAL_VERTEX_MIN_LIMIT, self.fociCoordinateAfterAnimation - 1);
                    self._initialVertexAnimation((randomNumber * model.get('gridSizeXAxis')) / animationOffset);
                }
                distance--;
                self.paperScope2.view.draw();
            }, 1);
        },

        /**
        * Animates the vertices
        *
        * @method _initialVertexAnimation
        * @param {Number} Distance to be animated
        * @private
        */
        _initialVertexAnimation: function (distance) {
            var model = this.model,
               thumbTack1 = model.get('thumbTack1'),
               thumbTack2 = model.get('thumbTack2'),
               vertex1 = model.get('vertex1'),
               vertex2 = model.get('vertex2'),
               self = this,
               animationOffset = self.viewStaticData.ANIMATION_SPEED_FACTOR,
               dummyVertex1 = model.get('dummyVertex1'),
               dummyVertex2 = model.get('dummyVertex2');

            var vertexTimer = setInterval(function () {

                self.paperScope2.activate();

                vertex1.position.x -= animationOffset;
                vertex2.position.x += animationOffset;
                thumbTack1.position.x = vertex1.position.x;
                thumbTack2.position.x = vertex2.position.x;
                self._redrawStringsAndUpdateGroup();

                if (distance <= 0) {
                    self.model.set('showGraph', true);
                    self._snapAll();
                    clearInterval(vertexTimer);
                    self._initialThumbTackAnimation(model.generateRandomNumber(self.viewStaticData.INITIAL_THUMBTACK_MIN_LIMIT / animationOffset, self.viewStaticData.INITIAL_THUMBTACK_MAX_LIMIT / animationOffset));
                    dummyVertex1.position = vertex1.position;
                    dummyVertex2.position = vertex2.position;
                }
                distance--;
                self.paperScope2.view.draw();
            }, 1);
        },

        /**
        * Animates the thumb-tacks
        *
        * @method _initialThumbTackAnimation
        * @param {Number} Distance to be animated
        * @private
        */
        _initialThumbTackAnimation: function (distance) {
            var model = this.model,
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                dummyThumbTack2 = model.get('dummyThumbTack2'),
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                prevLeftAngle = null,
                prevRightAngle = null,
                leftAngle = null, rightAngle = null,
                previousPointLeft = null,
                previousPointRight = null,
                self = this,
                animationOffset = self.viewStaticData.ANIMATION_SPEED_FACTOR,
                animationTimer, majorAxis, minorAxis, points,
                thumbTack1Path, thumbTack2Path, thumbTack1Position, thumbTack2Position,
                thumbTack1PositionIndex, thumbTack2PositionIndex, rot = true,
                shapeCenter = model.get('shapeCenter');

            this._calculateMajorAxisAndMinorAxis();
            majorAxis = this.model.get('majorAxis');
            minorAxis = this.model.get('minorAxis');
            points = self.returnHyperBolaPoints(shapeCenter.position, majorAxis, minorAxis, self.pointsRange);
            //            model.set('majorAxis', majorAxis);
            //            model.set('minorAxis', minorAxis);
            model.set('points', points);
            thumbTack1Path = points.rightWing;
            thumbTack2Path = points.leftWing;
            thumbTack1Position = self._getNearestPoint(thumbTack1.position, thumbTack1Path, thumbTack1);
            thumbTack2Position = self._getNearestPoint(thumbTack2.position, thumbTack2Path, thumbTack2);
            thumbTack1PositionIndex = thumbTack1Path.indexOf(thumbTack1Position);
            thumbTack2PositionIndex = thumbTack2Path.indexOf(thumbTack2Position);
            previousPointLeft = thumbTack2Path[thumbTack2PositionIndex];
            previousPointRight = thumbTack1Path[thumbTack1PositionIndex];
            this.paperScope2.activate();

            animationTimer = setInterval(function () {
                self.paperScope2.activate();
                thumbTack1.position.y = thumbTack1Path[thumbTack1PositionIndex].y;
                thumbTack1.position.x = thumbTack1Path[thumbTack1PositionIndex].x;
                thumbTack2.position.y = thumbTack2Path[thumbTack2PositionIndex].y;
                thumbTack2.position.x = thumbTack2Path[thumbTack2PositionIndex].x;
                self._redrawStringsAndUpdateGroup();
                if (distance <= 0) {
                    model.set('thumbTack1', thumbTack1);
                    model.set('thumbTack2', thumbTack2);
                    clearInterval(animationTimer);
                    self._snapAll();
                    self._redrawStringsAndUpdateGroup();
                    self.trigger(self.viewStaticData.CUSTOM_EVENTS.bubblePopulationAnimationEnd);
                    self._handleInitialAnimationEnd();
                    dummyThumbTack1.position = thumbTack1.position;
                    dummyThumbTack2.position = thumbTack2.position;
                    model.set('dummyThumbTack2', dummyThumbTack2);
                    model.set('dummyThumbTack1', dummyThumbTack1);
                }
                leftAngle = (previousPointLeft.subtract(thumbTack2Path[thumbTack2PositionIndex])).angle;
                rightAngle = (previousPointRight.subtract(thumbTack1Path[thumbTack1PositionIndex])).angle;
                if (prevLeftAngle || prevRightAngle) {
                    thumbTack1.rotate(rightAngle - prevRightAngle);
                    thumbTack2.rotate(leftAngle - prevLeftAngle);
                    if (rot) {
                        thumbTack1.rotate(180);
                        rot = false;
                    }
                }
                previousPointLeft = thumbTack2Path[thumbTack2PositionIndex];
                previousPointRight = thumbTack1Path[thumbTack1PositionIndex];
                prevLeftAngle = leftAngle;
                prevRightAngle = rightAngle;

                distance--;
                thumbTack1PositionIndex -= animationOffset;
                thumbTack2PositionIndex += animationOffset;
                self.paperScope2.view.draw();
            }, 1);
        },

        /**
        * Handle the end of the initial animation
        *
        * @method _handleInitialAnimationEnd
        * @private
        */
        _handleInitialAnimationEnd: function () {
            this.isFirstRun = false;
            this.player.enableAllHeaderButtons(true);
            this._bindEvents();
            if (!$.support.touch) {
                setTimeout($.proxy(this._simplifyPaths, this), 200);
            }
        },

        /**
        * Calculates & sets the intersecting bubbles
        *
        * @method _getInterSectingBubbles
        * @private
        */
        _getInterSectingBubbles: function () {
            var model = this.model,
             intersectionArray = null,
             tempArray = [],
             count = 0, //new code from here
             incrementor = 0,
             currentGroup = null,
             currentPath = null,
             removePathArray = [],
             allBubbleGroup = model.get('allBubbleGroup');

            for (count = 0; count < allBubbleGroup.children.length; count++) {
                currentGroup = allBubbleGroup.children[count];

                for (incrementor = 0; incrementor < currentGroup.children.length; incrementor++) {
                    currentPath = currentGroup.children[incrementor].children[0]; //currentPath
                    currentPath.bringToFront();
                    intersectionArray = currentPath.getIntersections(this.dummyLeftPath);
                    if (intersectionArray.length > 0) {
                        if (tempArray.indexOf(currentPath) === -1) {
                            tempArray.push(currentPath);
                            removePathArray.push(currentPath);
                        }
                    }
                    intersectionArray = currentPath.getIntersections(this.dummyRightPath);
                    if (intersectionArray.length > 0) {
                        if (tempArray.indexOf(currentPath) === -1) {
                            tempArray.push(currentPath);
                            removePathArray.push(currentPath);
                        }
                    }
                }

            }

            if (model.get('showPoppedBubbles')) {

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
        * sets the animation bubble raster
        *
        * @method _setAnimateBubblesRaster
        * @private
        */

        _setAnimateBubblesRaster: function () {
            var bubbleRasterArray = [];

            bubbleRasterArray.push(this.rasterPattern.animateMiddleBubble1);
            bubbleRasterArray.push(this.rasterPattern.animateMiddleBubble2);
            bubbleRasterArray.push(this.rasterPattern.animateMiddleBubble3);
            this.middleAnimateBubblesRasters = bubbleRasterArray;

            bubbleRasterArray = [];

            bubbleRasterArray.push(this.rasterPattern.animateSmallBubble1);
            bubbleRasterArray.push(this.rasterPattern.animateSmallBubble2);
            bubbleRasterArray.push(this.rasterPattern.animateSmallBubble3);
            this.smallAnimateBubblesRasters = bubbleRasterArray;

            bubbleRasterArray = [];

            bubbleRasterArray.push(this.rasterPattern.animateLargeBubble1);
            bubbleRasterArray.push(this.rasterPattern.animateLargeBubble2);
            bubbleRasterArray.push(this.rasterPattern.animateLargeBubble3);
            this.largeAnimateBubblesRasters = bubbleRasterArray;
        },

        /**
        * Draws the dummy tack path
        *
        * @method _drawDummyTackPath
        * @private
        */

        _drawDummyTackPath: function () {
            var thumbTack1 = this.model.get('thumbTack1'),
                thumbTack2 = this.model.get('thumbTack2'),
                thumbTack1Position = thumbTack1.position,
                thumbTack2Position = thumbTack2.position,
                dummyTackPath1 = this.dummyTackPath1,
                dummyTackPath2 = this.dummyTackPath2,
                myPaper = this.paperScope2;
            if (dummyTackPath1 !== null) {
                dummyTackPath1.remove();
            }
            if (dummyTackPath2 !== null) {
                dummyTackPath2.remove();
            }
            this.dummyTackPath1 = new myPaper.Path.Rectangle({
                from: [thumbTack1Position.x - 13, thumbTack1Position.y - 11],
                to: [thumbTack1Position.x + 1, thumbTack1Position.y + 9]
            });
            this.dummyTackPath2 = new myPaper.Path.Rectangle({
                from: [thumbTack2Position.x - 13, thumbTack2Position.y - 11],
                to: [thumbTack2Position.x + 1, thumbTack2Position.y + 9]
            });
        },

        /**
        * Sets the position of dummy thumbtack
        *
        * @method _setTackPosition
        * @private
        * @param position << {{object}} >> position of the thumbtack
        */

        _setTackPosition: function (position1, position2) {
            var tack1 = this.model.get('thumbTack1'),
                tack2 = this.model.get('thumbTack2'),
                tack1Position = position1 || tack1.position,
                tack2Position = position2 || tack2.position;

            this.dummyTackPath1.position = [tack1Position.x - 6, tack1Position.y];
            this.dummyTackPath1.sendToBack();
            this.dummyTackPath2.position = [tack2Position.x - 6, tack2Position.y];
            this.dummyTackPath2.sendToBack();
        },

        /**
        * Pops out the intersecting bubbles
        *
        * @method _popOutInterSectingBubbles
        * @private
        */

        _popOutInterSectingBubbles: function () {
            var model = this.model,
                 interSectingBubbles = model.get('intersectBubblesArray') || [],
                 bubbleRadius = null,
                 currentBubble = null,
                 bubbleRadiusObject = this.viewStaticData.RADIUS_OF_BUBBLES,
                 count = null,
                 bubbleRasterArray = [],
                 currentBubblePosition = null;

            for (count in interSectingBubbles) {
                currentBubble = interSectingBubbles[count];

                if (currentBubble.getIntersections(this.dummyTackPath1).length > 0 || currentBubble.getIntersections(this.dummyTackPath2).length > 0) {
                    bubbleRadius = this._getBubbleRadius(currentBubble);

                    if (bubbleRadius === bubbleRadiusObject.largeBubbleRadius) {
                        bubbleRasterArray = this.largeAnimateBubblesRasters;
                    }
                    else {
                        if (bubbleRadius === bubbleRadiusObject.middleBubbleRadius) {
                            bubbleRasterArray = this.middleAnimateBubblesRasters;
                        }
                        else {
                            bubbleRasterArray = this.smallAnimateBubblesRasters;
                        }
                    }

                    interSectingBubbles.splice(count, 1);
                    model.set('intersectBubblesArray', interSectingBubbles);
                    this.intersectBubblesArray = interSectingBubbles;
                    currentBubblePosition = currentBubble.position;
                    this._popBubble(currentBubblePosition, bubbleRasterArray, currentBubble.parent.children[0]);
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
                interval = null,
                expand = true,
                contract = true,
                ballWidth = ball.bounds.width;

            if ($.support.touch) {
                setTimeout(function () {
                    ball.scale(0.8);
                }, 1);
                setTimeout(function () {
                    ball.scale(1.2);
                }, 150);
                setTimeout(function () {
                    ball.scale(0.8);
                }, 250);
                setTimeout(function () {
                    ball.parent.remove();
                }, 400);
            }
            else {
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
                    self.paperScope2.view.draw();
                }, 30);
            }
            this.trigger(this.viewStaticData.CUSTOM_EVENTS.bubblePopAnimationStart);
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
            return currentBubblePath.bounds.height / 2;
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
        * Gets the image URL from sprite
        *
        * @method getImageURLFromSprite
        * @private || public
        * @param imageName << {{string}} >> name of color
        * @return  << {{object}} >> image URL
        */
        getImageURLFromSprite: function (imageName) {
            switch (imageName) {
                case 'red':
                    return this.getSpritePartBase64URL('hyperbola-images', 0, 15, 1100, 5);

                case 'purple':
                    return this.getSpritePartBase64URL('hyperbola-images', 0, 0, 1100, 5);

                case 'Barpurple':
                    return this.getSpritePartBase64URL('hyperbola-images', 0, 30, 1500, 10);

                case 'Barred':
                    return this.getSpritePartBase64URL('hyperbola-images', 0, 50, 1856, 10);

                case 'black':
                    return this.getSpritePartBase64URL('circle-explorer', 0, 0, 1100, 5);

                case 'largeBubble':
                    return this.getSpritePartBase64URL('explore-shapes', 0, 0, 44, 44);

                case 'smallBubble':
                    return this.getSpritePartBase64URL('explore-shapes', 96, 0, 24, 24);

                case 'middleBubble':
                    return this.getSpritePartBase64URL('explore-shapes', 54, 0, 32, 32);

                case 'animateLargeBubble1':
                    return this.getSpritePartBase64URL('explore-shapes', 130, 0, 44, 44);

                case 'animateLargeBubble2':
                    return this.getSpritePartBase64URL('explore-shapes', 184, 0, 44, 44);

                case 'animateLargeBubble3':
                    return this.getSpritePartBase64URL('explore-shapes', 238, 0, 44, 44);

                case 'animateSmallBubble1':
                    return this.getSpritePartBase64URL('explore-shapes', 130, 96, 24, 24);

                case 'animateSmallBubble2':
                    return this.getSpritePartBase64URL('explore-shapes', 164, 96, 24, 24);

                case 'animateSmallBubble3':
                    return this.getSpritePartBase64URL('explore-shapes', 198, 96, 24, 24);

                case 'animateMiddleBubble1':
                    return this.getSpritePartBase64URL('explore-shapes', 130, 54, 32, 32);

                case 'animateMiddleBubble2':
                    return this.getSpritePartBase64URL('explore-shapes', 172, 54, 32, 32);

                case 'animateMiddleBubble3':
                    return this.getSpritePartBase64URL('explore-shapes', 214, 54, 32, 32);

                case 'arrowCenter':
                    return this.getSpritePartBase64URL('explore-shapes', 232, 96, 21, 21);

                default:
                    return null;
            }
        },

        /**
        * Calculates & sets the random value for Major Axis.
        *
        * @method _getRandomMajorAxisAndFoci
        * @private 
        */
        _getRandomMajorAxisAndFoci: function _getRandomMajorAxisAndFoci() {
            var model = this.model,
                majorAxis = Math.floor(Math.random() * 3 + 3),
                minorAxis = null,
                foci = Math.floor(Math.random() * 3 + 4);

            if (majorAxis === foci) {
                majorAxis--;
            }
            if (majorAxis > foci) {
                majorAxis -= 2;
            }
            majorAxis = majorAxis * model.getGridSizeXAxis();
            foci = foci * model.getGridSizeXAxis();
            minorAxis = Math.sqrt((foci * foci) - (majorAxis * majorAxis)) * model.getGridSizeXAxis();
            model.set('majorAxis', majorAxis);
            model.set('foci', foci);
            model.set('minorAxis', minorAxis);

        },

        /**
        * Calculates & sets focicenterDist
        * @method _calculateFociCenterDist
        * @private
        */

        _calculateMajorAxisAndMinorAxis: function _calculateMajorAxisAndMinorAxis() {
            var model = this.model,
                shapeCenter = model.get('shapeCenter'),
                foci1 = model.get('foci1'),
                vertex1 = model.get('vertex1'),
                foci = null,
                majorAxis = null,
                minorAxis = null;

            majorAxis = this._getDistanceBetweenPoints(shapeCenter, vertex1);
            foci = this._getDistanceBetweenPoints(shapeCenter, foci1);
            minorAxis = Math.sqrt(foci * foci - majorAxis * majorAxis);
            model.set('majorAxis', majorAxis);
            model.set('minorAxis', minorAxis);
            return;
        },


        returnHyperBolaPoints: function returnHyperBolaPoints(center, major, minor, yLimit) {
            var scope = this.paperScope2,
                rightX = null,
                rightY = null,
                leftX = null,
                leftY = null,
                value1 = null, value3 = null, commonFunction = null, rightLeftPointObj = null,
                rightPoint = null,
                leftPoint = null;

            if (this.rightPath) {
                this.rightPath.remove();
                this.leftPath.remove();
                this.dummyRightPath.remove();
                this.dummyLeftPath.remove();
                this.dummyRightPathArray = [];
                this.dummyLeftPathArray = [];
            }
            this.rightPath = new scope.Path();
            this.rightPath.dashArray = [7, 8];
            //this.rightPath.strokeColor = '#555555';
            this.rightPath.strokeWidth = 2;
            this.leftPath = new scope.Path();
            //this.leftPath.strokeColor = '#555555';
            this.leftPath.dashArray = [7, 8];
            this.leftPath.strokeWidth = 2;
            this.dummyRightPath = new scope.Path();
            this.dummyLeftPath = new scope.Path();
            var pointRightWing = [],
                pointLeftWing = [],
                squareOfMinor = minor * minor,
                squareOfMajor = major * major;
            this.dummyRightPathArray = [];
            this.dummyLeftPathArray = [];
            //
            if (minor === 0) {
                value1 = minor;
                value3 = squareOfMajor;
                if (this.isVertical) {
                    commonFunction = this.returnHyperBolaPointsHelper1;
                } else {
                    commonFunction = this.returnHyperBolaPointsHelper2;
                }
            } else {
                value1 = major;
                value3 = squareOfMinor;
                if (this.isVertical) {
                    commonFunction = this.returnHyperBolaPointsHelper3;
                } else {
                    commonFunction = this.returnHyperBolaPointsHelper4;
                }
            }
            //
            for (var i = -yLimit / 2; i < yLimit / 2; i++) {
                rightLeftPointObj = commonFunction(center, value1, i, value3);
                rightX = rightLeftPointObj.rightX;
                rightY = rightLeftPointObj.rightY;
                leftX = rightLeftPointObj.leftX;
                leftY = rightLeftPointObj.leftY;
                rightPoint = new this.paperScope2.Point(rightX, rightY);
                leftPoint = new this.paperScope2.Point(leftX, leftY);
                pointRightWing.push(rightPoint);
                this.rightPath.add(rightPoint);
                pointLeftWing.push(leftPoint);
                this.leftPath.add(leftPoint);
                if (this._checkCurrentPointBounds(rightX, rightY)) {
                    this.dummyRightPath.add(rightPoint);
                    this.dummyRightPathArray.push(rightPoint);
                }

                if (this._checkCurrentPointBounds(leftX, leftY)) {
                    this.dummyLeftPath.add(leftPoint);
                    this.dummyLeftPathArray.push(leftPoint);
                }
            }
            this.rightPath.sendToBack();
            this.leftPath.sendToBack();
            scope.view.draw();
            return { 'rightWing': pointRightWing, 'leftWing': pointLeftWing };
        },

        returnHyperBolaPointsHelper1: function (center, value1, value2, value3) {
            var x = value1 * Math.sqrt(1 + value2 * value2 / value3),
                xValue = x,
                yValue = value2,
                rightX = xValue + center.x,
                rightY = yValue + center.y,
                leftX = -xValue + center.x,
                leftY = rightY;
            return { rightX: rightX, rightY: rightY, leftX: leftX, leftY: leftY }
        },

        returnHyperBolaPointsHelper2: function (center, value1, value2, value3) {
            var y = value1 * Math.sqrt(1 + value2 * value2 / value3),
                xValue = value2,
                yValue = y,
                rightX = xValue + center.x,
                rightY = yValue + center.y,
                leftX = rightX,
                leftY = -yValue + center.y;
            return { rightX: rightX, rightY: rightY, leftX: leftX, leftY: leftY }
        },

        returnHyperBolaPointsHelper3: function (center, value1, value2, value3) {
            var y = value1 * Math.sqrt(1 + value2 * value2 / value3),
                xValue = value2,
                yValue = y,
                rightX = xValue + center.x,
                rightY = yValue + center.y,
                leftX = rightX,
                leftY = -yValue + center.y;
            return { rightX: rightX, rightY: rightY, leftX: leftX, leftY: leftY }
        },

        returnHyperBolaPointsHelper4: function (center, value1, value2, value3) {
            var x = value1 * Math.sqrt(1 + value2 * value2 / value3),
                xValue = x,
                yValue = value2,
                rightX = xValue + center.x,
                rightY = yValue + center.y,
                leftX = -xValue + center.x,
                leftY = rightY;
            return { rightX: rightX, rightY: rightY, leftX: leftX, leftY: leftY }
        },

        _returnCorrespondingPoint: function (value1, value2, value3, isRight) {
            var center = this.model.get('shapeCenter').position,
                returnLeftRightObj = this.commonFunction(center, value1, value2, value3),
                xCoordinate = null, yCoordinate = null;

            if (isRight) {
                xCoordinate = returnLeftRightObj.rightX;
                yCoordinate = returnLeftRightObj.rightY;
            } else {
                xCoordinate = returnLeftRightObj.leftX;
                yCoordinate = returnLeftRightObj.leftY;
            }
            return new this.paperScope2.Point(xCoordinate, yCoordinate);
        },

        _simplifyPaths: function () {
            this.rightPath.simplify();
            this.leftPath.simplify();
        },

        /**
        * show tooltip points
        * @method _setSnappedpoints
        * @param {object} event paper event
        * @private
        */
        _setSnappedpoints: function (event) {
            var model = this.model,
                currentX = event.point.x,
                currentY = event.point.y,
                origin = model.get('originPosition'),
                originX = origin.x,
                originY = origin.y,
                snappedX = null,
                snappedY = null,
                actualSnappedPointX = null,
                actualSnappedPointY = null,
                xAxisGridSize = model.getGridSizeXAxis(),
                yAxisGridSize = model.getGridSizeYAxis(),
                xUnitsPerGrid = model.getXUnitsPerGrid(),
                yUnitsperGrid = model.getYUnitsPerGrid(),
                diffrence = null;

            diffrence = currentX - originX;

            snappedX = Math.round((Math.abs(diffrence) / xAxisGridSize)) * xUnitsPerGrid;
            actualSnappedPointX = originX + (snappedX * xAxisGridSize);

            if (currentX < originX) {
                actualSnappedPointX = originX - (snappedX * xAxisGridSize);
                snappedX = -snappedX;
            }

            diffrence = currentY - originY;

            snappedY = Math.round((Math.abs(diffrence) / yAxisGridSize)) * yUnitsperGrid;
            actualSnappedPointY = originY - snappedY * yAxisGridSize;

            if (currentY > originY) {
                actualSnappedPointY = originY + (snappedY * yAxisGridSize);
                snappedY = -snappedY;
            }

            this.snappedX = snappedX;
            this.snappedY = snappedY;
            this.actualSnappedPointX = actualSnappedPointX;
            this.actualSnappedPointY = actualSnappedPointY;

            model.set('snappedX', snappedX);
            model.set('snappedY', snappedX);
            model.set('actualSnappedPointX', actualSnappedPointX);
            model.set('actualSnappedPointY', actualSnappedPointY);
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
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                dummyVertex2 = model.get('dummyVertex2'),
                dummyVertex1 = model.get('dummyVertex1');
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
            temp.point = vertex1.position;
            this._setSnappedpoints(temp);
            vertex1.position = {
                x: this.model.get('actualSnappedPointX'),
                y: this.model.get('actualSnappedPointY')
            };
            temp.point = vertex2.position;
            this._setSnappedpoints(temp);
            vertex2.position = {
                x: this.model.get('actualSnappedPointX'),
                y: this.model.get('actualSnappedPointY')
            };
            dummyVertex2.position = vertex2.position;
            dummyVertex1.position = vertex1.position;
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('vertex1', vertex1);
            model.set('vertex2', vertex2);
            model.set('dummyVertex1', dummyVertex1);
            model.set('dummyVertex2', dummyVertex2);
            this.paperScope2.view.draw();
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
            var stringAngle = this._getStringAngle(start, end),
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
                red;

            if (color == 'purple') {
                purple = this._drawLine(options);
                this.model.set('purple', purple);
            }
            else if (color == 'red') {
                red = this._drawLine(options);
                this.model.set('red', red);
            }
        },

        /**
        * Calculates & returns the angle of the string
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
        * Returns the sliced string line
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
        * @method _drawLine
        * @private
        * @param args << {{object}} >> required data
        * @return  << {{object}} >> group
        */
        _drawLine: function _drawLine(args) {
            var paperScope2 = this.paperScope2,
                calX = 0,
                x = args[0].startingPoint.x,
                y = args[0].startingPoint.y,
                vector = args[0].startingPoint.subtract(args[0].endingPoint),
                height = args[0].height,
                group = null,
                isRatioBar = args[0].isRatioBar,
                length = Math.floor(vector.length),
                ratioBar1Height,
                    ratioBar2Height,
                    ratioBar1Width,
                    ratioBar2Width,
                    centerForRatioBar;

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
                } else {
                    lineLabel = new this.paperScope2.Group();
                    centerForRatioBar = ((ratioBar2Height - height) / 2) + (height / 2);
                    from = new paperScope2.Point(x, y - centerForRatioBar);
                    to = new paperScope2.Point(x, ((y - centerForRatioBar) + ratioBar2Height));
                    path1 = new paperScope2.Path.Line(from, to);
                    path1.strokeColor = 'black';
                    path1.strokeWidth = ratioBar1Width;
                    lineLabel.addChild(path1);
                    lineLabel.moveAbove(group);
                    group = new this.paperScope2.Group([group, lineLabel]);
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

            group.rotate(args[0].angle, new paperScope2.Point(x, y));
            return group;
        },

        _bindEvents: function _bindEvents() {
            if (this.entireGroup === null || typeof this.entireGroup === 'undefined') {
                return;
            }

            var self = this,
                $canvas = self.$('#' + self.idPrefix + 'graph-holder-canvas-element-extended');

            this.entireGroup.onMouseDown = function (event) {
                if (event.event.which === 1 || $.support.touch) {
                    if (!event.target.name) {
                        return;
                    }
                    if (self.model.get('draggingDisabled') && !(event.target.name === 'thumbTack1' || event.target.name === 'thumbTack2')) {
                        return;
                    }
                    self.entireGroup.currentItem = event.target.name;
                    MathInteractives.global.SpeechStream.stopReading();
                    if (!$.support.touch) {
                        $canvas.css({ 'cursor': "url('" + self.filePath.getImagePath('closed-hand') + "'), move" });
                    }
                }
            };

            this.entireGroup.onMouseUp = function (event) {
                if (event.event.which === 1) {
                    if (!event.target.name) {
                        return;
                    }
                    if (self.model.get('draggingDisabled') && !(event.target.name === 'thumbTack1' || event.target.name === 'thumbTack2')) {
                        return;
                    }
                    self._fixOverlappingElements();
                    //                    if (!(event.target.name === 'thumbTack1' || event.target.name === 'thumbTack2')) {
                    //                        setTimeout($.proxy(self._simplifyPaths, self), 200);
                    //                    }
                    MathInteractives.global.SpeechStream.stopReading();
                    self.isElementDragging = false;
                    if (!$.support.touch) {
                        $canvas.css({ 'cursor': "url('" + self.filePath.getImagePath('open-hand') + "'), move" });
                    }
                    self.isCursorDefault = true;
                }
            };

            this.currentTool.onMouseDrag = function (event) {
                if ((event.event.which === 1 || $.support.touch) && (self.entireGroup.currentItem)) {
                    self.dragHandler(event);
                }
            };

            this.currentTool.onMouseUp = function (event) {
                //upHandler(event);
                if (event.event.which === 1 || $.support.touch) {

                    //if (!self.entireGroup.currentItem) {
                    if (!$.support.touch && self.isCursorDefault !== true) {
                        $canvas.css({ 'cursor': "default" });
                    }
                    if (self.isCursorDefault === true && !$.support.touch) {
                        self.isCursorDefault = false;
                    }
                    //return;
                    //}
                    if (self.entireGroup.currentItem) {
                        self._setSnappedpointsOnMouseUp(event);
                        if (!(self.entireGroup.currentItem === 'thumbTack1' || self.entireGroup.currentItem === 'thumbTack2')) {
                            setTimeout($.proxy(self._simplifyPaths, self), 200);
                            //self._simplifyPaths();
                        }
                    }
                    self.entireGroup.currentItem = null;
                    self.isElementDragging = false;
                }
            };

            if (!$.support.touch) {
                this.entireGroup.onMouseEnter = function (event) {
                    if (!event.target.name) {
                        return;
                    }
                    if (self.model.get('draggingDisabled') && !(event.target.name === 'thumbTack1' || event.target.name === 'thumbTack2')) {
                        return;
                    }
                    if (!$.support.touch && self.isElementDragging !== true) {
                        $canvas.css({ 'cursor': "url('" + self.filePath.getImagePath('open-hand') + "'), move" });
                    }
                };

                this.entireGroup.onMouseDrag = function (event) {
                    if (event.event.which === 1) {
                        if (!event.target.name) {
                            return;
                        }
                        if (self.model.get('draggingDisabled') && !(event.target.name === 'thumbTack1' || event.target.name === 'thumbTack2')) {
                            return;
                        }
                        MathInteractives.global.SpeechStream.stopReading();
                        self.isElementDragging = true;
                    }
                };

                this.entireGroup.onMouseLeave = function (event) {
                    if (!event.target.name) {
                        return;
                    }
                    if (self.model.get('draggingDisabled') && !(event.target.name === 'thumbTack1' || event.target.name === 'thumbTack2')) {
                        return;
                    }
                    if (self.isElementDragging !== true) {
                        $canvas.css({ 'cursor': "default" });
                    }
                };
            }
        },

        _unbindEvents: function () {
            if (this.entireGroup === null || typeof this.entireGroup === 'undefined') {
                return;
            }
            if (!$.support.touch) {
                this.entireGroup.detach('mouseenter');
                this.entireGroup.detach('mousedrag');
                this.entireGroup.detach('mouseleave');
            }
            this.entireGroup.detach('mouseup');
            this.entireGroup.detach('mousedown');
            this.currentTool.detach('mousedrag');
            this.currentTool.detach('mouseup');
        },

        _setSnappedpointsOnMouseUp: function (event) {

            if (this.entireGroup.currentItem === 'thumbTack1' || this.entireGroup.currentItem === 'thumbTack2') {
                return;
            }
            var model = this.model,
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                xDistance = null,
                yDistance = null,
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                shapeCenter = model.get('shapeCenter'),
                dummyVertex1 = model.get('dummyVertex1'),
                dummyVertex2 = model.get('dummyVertex2'),
                dummyShapeCenter = model.get('dummyShapeCenter'),
                temp = {};

            if (this.entireGroup.currentItem === 'shape-center') {
                temp.point = shapeCenter.position;
                this._setSnappedpoints(temp);
                shapeCenter.position = {
                    x: this.model.get('actualSnappedPointX'),
                    y: this.model.get('actualSnappedPointY')
                };
                dummyShapeCenter.position = shapeCenter.position;
                this.model.set('shapeCenter', shapeCenter);
                this.model.set('center', shapeCenter.position);
                this.model.set('dummyShapeCenter', dummyShapeCenter);
                xDistance = temp.point.x - this.model.get('actualSnappedPointX');
                yDistance = temp.point.y - this.model.get('actualSnappedPointY');
                thumbTack1.position.x = thumbTack1.position.x - xDistance;
                thumbTack1.position.y = thumbTack1.position.y - yDistance;
                thumbTack2.position.x = thumbTack2.position.x - xDistance;
                thumbTack2.position.y = thumbTack2.position.y - yDistance;
                this._snapAll();
                this._calculateMinorAxisAndUpdateHyperbolaPoints(true, true);
            }
            else {
                if (this.entireGroup.currentItem === 'vertex1' || this.entireGroup.currentItem === 'vertex2') {

                    temp.point = vertex1.position;
                    this._setSnappedpoints(temp);
                    vertex1.position = {
                        x: this.model.get('actualSnappedPointX'),
                        y: this.model.get('actualSnappedPointY')
                    };
                    temp.point = vertex2.position;
                    this._setSnappedpoints(temp);
                    vertex2.position = {
                        x: this.model.get('actualSnappedPointX'),
                        y: this.model.get('actualSnappedPointY')
                    };
                    dummyVertex1.position = vertex1.position;
                    dummyVertex2.position = vertex2.position;
                    this.model.set('vertex1', vertex1);
                    this.model.set('vertex2', vertex2);
                    this.model.set('dummyVertex1', dummyVertex1);
                    this.model.set('dummyVertex2', dummyVertex2);
                    this._calculateMinorAxisAndUpdateHyperbolaPoints(true);
                }
                else {
                    if (this.entireGroup.currentItem === 'foci1' || this.entireGroup.currentItem === 'foci2') {

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
                        this.model.set('foci1', foci1);
                        this.model.set('foci2', foci2);
                        this._calculateMinorAxisAndUpdateHyperbolaPoints(true);
                    }
                }
            }
        },

        downHandler: function downHandler(event) {
        },

        dragHandler: function dragHandler(event) {
            //if(hyperBola.selected) {
            var currentItem = this.entireGroup.currentItem,
                model = this.model,
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2');
            this.model.set('showPopupOnTryAnother', true);
            if (currentItem === 'thumbTack1' || currentItem === 'thumbTack2') {
                if (currentItem === 'thumbTack1') {
                    if (this._checkCurrentPointBounds(thumbTack1.position.x, thumbTack1.position.y)) {
                        this.adjustThumbTackPosition(event);
                    }
                } else {
                    if (this._checkCurrentPointBounds(thumbTack2.position.x, thumbTack2.position.y)) {
                        this.adjustThumbTackPosition(event);
                    }
                }
                if (currentItem === 'thumbTack1') {
                    this.focusRect.position = model.get('thumbTack1').position;
                } else {
                    this.focusRect.position = model.get('thumbTack2').position;
                }
                return;
            }
            if (!(this.model.get('draggingDisabled'))) {
                event.point = this.adjustCurrentPointBounds(event.point);
                var currentPointX = event.point.x,
                    currentPointY = event.point.y;
                if (this._checkCurrentPointBounds(currentPointX, currentPointY)) {
                    switch (currentItem) {
                        case 'foci1':
                        case 'foci2':
                            this.adjustFociPosition(event);
                            if (currentItem === 'foci1') {
                                this.focusRect.position = model.get('foci1').position;
                            } else {
                                this.focusRect.position = model.get('foci2').position;
                            }
                            break;

                        case 'vertex1':
                        case 'vertex2':
                            this.adjustVertexPosition(event);
                            if (currentItem === 'vertex1') {
                                this.focusRect.position = model.get('vertex1').position;
                            } else {
                                this.focusRect.position = model.get('vertex2').position;
                            }
                            break;

                        case 'shape-center':
                            this.adjustEntireGroupPosition(event);
                            this.focusRect.position = model.get('shapeCenter').position;
                            break;
                    }
                    this.firstRotate = false;
                    //this.model.set('fociOutOfBounds', false);
                } else {
                    //this.model.set('fociOutOfBounds', true);
                }
            }
        },

        _checkCurrentPointBounds: function (currentX, currentY) {
            if ((currentX >= this.areaDimension[0]) && (currentX <= this.areaDimension[2]) && (currentY >= this.areaDimension[1]) && (currentY <= this.areaDimension[3])) {
                return true;
            }
            return false;
        },

        adjustCurrentPointBounds: function (point) {
            var currentX = point.x,
                currentY = point.y,
                isOutOfBounds = false;
            if (currentX < this.areaDimension[0]) {
                point.x = this.areaDimension[0];
                isOutOfBounds = true;
            }
            else if (currentX > this.areaDimension[2]) {
                point.x = this.areaDimension[2];
                isOutOfBounds = true;
            }
            if (currentY < this.areaDimension[1]) {
                point.y = this.areaDimension[1];
                isOutOfBounds = true;
            }
            else if (currentY > this.areaDimension[3]) {
                point.y = this.areaDimension[3];
                isOutOfBounds = true;
            }
            if (isOutOfBounds === true) {
                this.model.set('fociOutOfBounds', true);
            } else {
                this.model.set('fociOutOfBounds', false);
            }
            return point;
        },

        adjustEntireGroupPosition: function (event) {
            var model = this.model,
                shapeCenter = model.get('shapeCenter'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                xDistance = null,
                yDistance = null,
                addXDistance = 0,
                addYDistance = 0,
                finalFoci1Positionx = null,
                finalFoci1Positiony = null,
                finalFoci2Positionx = null,
                finalFoci2Positiony = null,
                newFoci1Positionx = null,
                newFoci1Positiony = null,
                newFoci2Positionx = null,
                isCenterOutOfBounds = false,
                newFoci2Positiony = null;

            this._setSnappedpoints(event);
            xDistance = event.point.x - shapeCenter.position.x;
            yDistance = event.point.y - shapeCenter.position.y;
            newFoci1Positionx = foci1.position.x + xDistance;
            newFoci1Positiony = foci1.position.y + yDistance;
            newFoci2Positionx = foci2.position.x + xDistance;
            newFoci2Positiony = foci2.position.y + yDistance;
            if ((newFoci1Positionx < this.areaDimension[0] || newFoci1Positionx > this.areaDimension[2]) || (newFoci1Positiony < this.areaDimension[1] || newFoci1Positiony > this.areaDimension[3])) {
                if (newFoci1Positionx < this.areaDimension[0]) {
                    addXDistance = this.areaDimension[0] - newFoci1Positionx;
                    isCenterOutOfBounds = true;
                }
                else {
                    if (newFoci1Positionx > this.areaDimension[2]) {
                        addXDistance = this.areaDimension[2] - newFoci1Positionx;
                        isCenterOutOfBounds = true;
                    }
                }
                if (newFoci1Positiony < this.areaDimension[1]) {
                    addYDistance = this.areaDimension[1] - newFoci1Positiony;
                    isCenterOutOfBounds = true;
                }
                else {
                    if (newFoci1Positiony > this.areaDimension[3]) {
                        addYDistance = this.areaDimension[3] - newFoci1Positiony;
                        isCenterOutOfBounds = true;
                    }
                }
            }
            else {
                if ((newFoci1Positionx >= this.areaDimension[0] && newFoci1Positionx <= this.areaDimension[2])) {
                    if ((newFoci2Positionx < this.areaDimension[0] || newFoci2Positionx > this.areaDimension[2]) || (newFoci2Positiony < this.areaDimension[1] || newFoci2Positiony > this.areaDimension[3])) {
                        if (newFoci2Positionx < this.areaDimension[0]) {
                            addXDistance = this.areaDimension[0] - newFoci2Positionx;
                            isCenterOutOfBounds = true;
                        }
                        else {
                            if (newFoci2Positionx > this.areaDimension[2]) {
                                addXDistance = this.areaDimension[2] - newFoci2Positionx;
                                isCenterOutOfBounds = true;
                            }
                        }
                        if (newFoci2Positiony < this.areaDimension[1]) {
                            addYDistance = this.areaDimension[1] - newFoci2Positiony;
                            isCenterOutOfBounds = true;
                        }
                        else {
                            if (newFoci2Positiony > this.areaDimension[3]) {
                                addYDistance = this.areaDimension[3] - newFoci2Positiony;
                                isCenterOutOfBounds = true;
                            }
                        }
                    }
                }
            }
            if (isCenterOutOfBounds === true) {
                this.model.set('isCenterOutOfBounds', true);
            } else {
                this.model.set('isCenterOutOfBounds', false);
            }
            finalFoci1Positionx = foci1.position.x + addXDistance + xDistance;
            finalFoci1Positiony = foci1.position.y + addYDistance + yDistance;
            finalFoci2Positionx = foci2.position.x + addXDistance + xDistance;
            finalFoci2Positiony = foci2.position.y + addYDistance + yDistance;

            if (!(this._checkCurrentPointBounds(finalFoci1Positionx, finalFoci1Positiony) && this._checkCurrentPointBounds(finalFoci2Positionx, finalFoci2Positiony))) {
                //this.model.set('isCenterOutOfBounds', true);
                return;
            } else {
                //this.model.set('isCenterOutOfBounds', false);
            }

            var thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                dummyThumbTack2 = model.get('dummyThumbTack2'),
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                dummyVertex1 = model.get('dummyVertex1'),
                dummyVertex2 = model.get('dummyVertex2'),
                dummyShapeCenter = model.get('dummyShapeCenter');

            shapeCenter.position = {
                x: event.point.x + addXDistance,
                y: event.point.y + addYDistance
            };
            dummyShapeCenter.position = shapeCenter.position;
            model.set('shapeCenter', shapeCenter);
            model.set('dummyShapeCenter', dummyShapeCenter);
            foci1.position.x = finalFoci1Positionx;
            foci1.position.y = finalFoci1Positiony;
            foci2.position.x = finalFoci2Positionx;
            foci2.position.y = finalFoci2Positiony;
            vertex1.position.x = vertex1.position.x + xDistance + addXDistance;
            vertex1.position.y = vertex1.position.y + yDistance + addYDistance;
            vertex2.position.x = vertex2.position.x + xDistance + addXDistance;
            vertex2.position.y = vertex2.position.y + yDistance + addYDistance;
            dummyVertex1.position = vertex1.position;
            dummyVertex2.position = vertex2.position;
            //this._snapAll();

            thumbTack1.position.x = thumbTack1.position.x + xDistance + addXDistance;
            thumbTack1.position.y = thumbTack1.position.y + yDistance + addYDistance;
            thumbTack2.position.x = thumbTack2.position.x + xDistance + addXDistance;
            thumbTack2.position.y = thumbTack2.position.y + yDistance + addYDistance;
            dummyThumbTack1.position = thumbTack1.position;
            dummyThumbTack2.position = thumbTack2.position;

            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('thumbTack1', thumbTack1);
            model.set('thumbTack2', thumbTack2);
            model.set('dummyThumbTack1', dummyThumbTack1);
            model.set('dummyThumbTack2', dummyThumbTack2);
            model.set('vertex1', vertex1);
            model.set('vertex2', vertex2);
            model.set('dummyVertex1', dummyVertex1);
            model.set('dummyVertex2', dummyVertex2);
            this._redrawStringsAndUpdateGroup();
            model.set('center', shapeCenter.position);
        },

        adjustThumbTackPosition: function (event) {
            var nearestPoint = null,
                currentItem = null,
                otherThumbTack = null,
                circumferencePath = null,
                OtherCircumferencePath = null,
                points = this.model.get('points'),
                thumbTack1 = this.model.get('thumbTack1'),
                thumbTack2 = this.model.get('thumbTack2'),
                dummyThumbTack2 = this.model.get('dummyThumbTack2'),
                dummyThumbTack1 = this.model.get('dummyThumbTack1'),
                currentDummyThumbTack = null,
                otherDummyThumbTack = null,
                position1 = null,
                position2 = null,
                minorAxis = this.model.get('minorAxis'),
                angleRight = null,
                isThumbTack1 = null,
                angleLeft = null;

            if (this.entireGroup.currentItem === 'thumbTack1') {
                currentItem = thumbTack1;
                otherThumbTack = thumbTack2;
                circumferencePath = points.rightWing;
                OtherCircumferencePath = points.leftWing;
                currentDummyThumbTack = dummyThumbTack1;
                otherDummyThumbTack = dummyThumbTack2;
            } else {
                currentItem = thumbTack2;
                otherThumbTack = thumbTack1;
                circumferencePath = points.leftWing;
                OtherCircumferencePath = points.rightWing;
                currentDummyThumbTack = dummyThumbTack2;
                otherDummyThumbTack = dummyThumbTack1;
            }
            var nearestPointObj = this._getNearestPointWithIndex(event.point, circumferencePath);
            nearestPoint = nearestPointObj.point;

            if (nearestPoint !== null && this._checkCurrentPointBounds(nearestPoint.x, nearestPoint.y)) {

                position1 = thumbTack1.position;
                position2 = thumbTack2.position;
                thumbTack1.remove();
                thumbTack2.remove();
                thumbTack1 = new this.paperScope2.Raster(this.thumbTackRaster);
                thumbTack2 = new this.paperScope2.Raster(this.thumbTackRaster);
                thumbTack1.position = position1;
                thumbTack2.position = position2;
                thumbTack1.name = 'thumbTack1';
                thumbTack2.name = 'thumbTack2';

                this.model.set('thumbTack1', thumbTack1);
                this.model.set('thumbTack2', thumbTack2);
                //this._redrawStringsAndUpdateGroup();

                if (this.entireGroup.currentItem === 'thumbTack1') {
                    currentItem = thumbTack1;
                    otherThumbTack = thumbTack2;
                    isThumbTack1 = true;
                } else {
                    currentItem = thumbTack2;
                    otherThumbTack = thumbTack1;
                    isThumbTack1 = false;
                }
                //differenceX = currentItem.position.x - nearestPoint.x;
                //differenceY = currentItem.position.y - nearestPoint.y;
                currentItem.position = nearestPoint;


                //var otherPoint = new this.paperScope.Point(otherThumbTack.position.x + differenceX, otherThumbTack.position.y + differenceY);
                //var otherNearestPointObj = self._getNearestPointWithIndex(otherPoint, OtherCircumferencePath);
                var otherNearestPoint = OtherCircumferencePath[this.pointsRange - nearestPointObj.index];
                otherThumbTack.position = otherNearestPoint;
                currentDummyThumbTack.position = currentItem.position;
                otherDummyThumbTack.position = otherThumbTack.position;


                //logic to rotate thumbtack
                var indexCurrent = nearestPointObj.index;
                var indexOther = this.pointsRange - nearestPointObj.index;

                if (isThumbTack1) {

                    angleRight = (nearestPoint.subtract(circumferencePath[indexCurrent - 1])).angle;
                    angleLeft = (OtherCircumferencePath[indexOther + 1].subtract(otherNearestPoint)).angle;
                }
                else {

                    angleLeft = (circumferencePath[indexCurrent + 1].subtract(nearestPoint)).angle;
                    angleRight = (otherNearestPoint.subtract(OtherCircumferencePath[indexOther - 1])).angle;
                }

                thumbTack2.rotate(angleLeft);
                thumbTack1.rotate(angleRight);
                if (this.isVertical) {
                    if (angleRight === 0) {
                        thumbTack1.rotate(90);
                    } else {
                        if (angleRight === 90) {
                            thumbTack1.rotate(-90);
                        } else {
                            thumbTack1.rotate(90);
                        }
                    }

                    if (angleLeft === 0) {
                        thumbTack2.rotate(-90);
                    } else {
                        if (angleLeft === 90) {
                            thumbTack2.rotate(90);
                        } else {
                            thumbTack2.rotate(-90);
                        }
                    }

                } else {
                    if (angleRight) {
                        thumbTack1.rotate(90);
                    } else {
                        if (angleRight === 0) {
                            thumbTack1.rotate(-90);
                        }
                    }

                    if (angleLeft) {
                        thumbTack2.rotate(-90);
                    } else {
                        if (angleLeft === 0) {
                            thumbTack2.rotate(90);
                        }
                    }
                }
                if (this.firstRotate === true && minorAxis === 0) {
                    thumbTack1.rotate(180);
                    thumbTack2.rotate(180);
                }
                this.model.set('isThumbTackOutOfBounds', false);
            } else {
                this.model.set('isThumbTackOutOfBounds', true);
            }
            this._redrawStringsAndUpdateGroup();
        },

        redrawShapeCenter: function redrawShapeCenter() {
            var shapeCenter = this.model.get('shapeCenter'),
                shapeCenterCircle = this.model.get('shapeCenterCircle'),
                asymptote1 = this.model.get('asymptote1'),
                asymptote2 = this.model.get('asymptote2'),
                thumbTack1 = this.model.get('thumbTack1'),
                thumbTack2 = this.model.get('thumbTack2'),
                position1 = null,
                position2 = null,
                center = null,
                majorAxis = null,
                minorAxis = null,
                points = null,
                nearRightEnd = null,
                endTarget = null,
                angleRight = null,
                angleLeft = null;

            shapeCenterCircle.opacity = 0;
            this.model.set('shapeCenterCircle', null);
            shapeCenter.opacity = 1;
            if (this.leftPath) {
                this.leftPath.remove();
                this.rightPath.remove();
            }
            if (asymptote1) {
                asymptote1.remove();
                asymptote2.remove();
            }
            center = this.model.get('center');
            majorAxis = this.model.get('majorAxis');
            minorAxis = this.model.get('minorAxis');
            points = this.returnHyperBolaPoints(center, majorAxis, minorAxis, this.pointsRange);
            nearRightEnd = this._getNearestPoint(thumbTack1.position, points.rightWing, thumbTack2);
            endTarget = points.rightWing.indexOf(nearRightEnd);
            angleRight = ((points.rightWing[endTarget]).subtract(points.rightWing[endTarget - 1])).angle;

            nearRightEnd = this._getNearestPoint(thumbTack2.position, points.leftWing, thumbTack2);
            endTarget = points.leftWing.indexOf(nearRightEnd);
            angleLeft = ((points.leftWing[endTarget + 1]).subtract(points.leftWing[endTarget])).angle;

            position1 = thumbTack1.position;
            position2 = thumbTack2.position;
            thumbTack1.remove();
            thumbTack2.remove();
            thumbTack1 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack2 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack1.position = position1;
            thumbTack2.position = position2;
            thumbTack1.name = 'thumbTack1';
            thumbTack2.name = 'thumbTack2';

            this.model.set('thumbTack1', thumbTack1);
            this.model.set('thumbTack2', thumbTack2);
            this._redrawStringsAndUpdateGroup();

            thumbTack1.rotate(angleRight, thumbTack1.position);

            thumbTack2.rotate(angleLeft, thumbTack2.position);


            if (this.isVertical) {
                if (angleRight === 0) {
                    thumbTack1.rotate(90);
                } else {
                    if (angleRight === 90) {
                        thumbTack1.rotate(-90);
                    } else {
                        thumbTack1.rotate(90);
                    }
                }

                if (angleLeft === 0) {
                    thumbTack2.rotate(-90);
                } else {
                    if (angleLeft === 90) {
                        thumbTack2.rotate(90);
                    } else {
                        thumbTack2.rotate(-90);
                    }
                }
            } else {
                if (angleRight) {
                    thumbTack1.rotate(90);
                } else {
                    if (angleRight === 0) {
                        thumbTack1.rotate(-90);
                    }
                }

                if (angleLeft) {
                    thumbTack2.rotate(-90);
                } else {
                    if (angleLeft === 0) {
                        thumbTack2.rotate(90);
                    }
                }
            }

            this.firstRotate = false;
        },

        _fixOverlappingElements: function () {

            var model = this.model,
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                dummyThumbTack2 = model.get('dummyThumbTack2'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                dummyVertex1 = model.get('dummyVertex1'),
                dummyVertex2 = model.get('dummyVertex2'),
                dummyShapeCenter = model.get('dummyShapeCenter'),
                shapeCenter = model.get('shapeCenter'),
                shapeCenterCircle = model.get('shapeCenterCircle');

            this.paperScope2.activate();
            shapeCenter.bringToFront();
            dummyShapeCenter.bringToFront();
            vertex1.bringToFront();
            vertex2.bringToFront();
            dummyVertex1.bringToFront();
            dummyVertex2.bringToFront();
            foci1.bringToFront();
            foci2.bringToFront();
            if (this.entireGroup._namedChildren.shapeCenterCircle) {
                shapeCenterCircle.bringToFront();
            }
            if (this.entireGroup._namedChildren.thumbTack1) {
                thumbTack1.bringToFront();
                thumbTack2.bringToFront();
                dummyThumbTack1.bringToFront();
                dummyThumbTack2.bringToFront();
            }
            this.paperScope2.view.draw();
        },

        _onPopUpClick: function _onPopUpClick() {
            var model = this.model,
                points = model.get('points'),
                center = model.get('center'),
                counterLeft = null,
                counterRight = null,
                target = null,
                circumferencePathLeft = points.leftWing,
                circumferencePathRight = points.rightWing,
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                dummyThumbTack2 = model.get('dummyThumbTack2'),
                shapeCenterCircle = model.get('shapeCenterCircle'),
                asymptote2 = null,
                asymptote1 = null,
                shapeCenter = model.get('shapeCenter'),
                centerPoint = null,
                self = this,
                animationOffset = self.viewStaticData.ANIMATION_SPEED_FACTOR,
                nearleft = null,
                nearLeftEnd = null,
                topLeft = null,
                bottomLeft = null,
                topRight = null,
                bottomRight = null,
                position1 = null,
                position2 = null,
                endTarget = null, nearRightEnd = null,
                nearRight = null, previousPointLeft = null, previousPointRight = null,
                minorAxis = model.get('minorAxis');

            model.set('showPopupOnTryAnother', true);
            centerPoint = new self.paperScope2.Point(shapeCenter.position.x, shapeCenter.position.y);
            if (shapeCenterCircle) {
                shapeCenterCircle.remove();
            }
            shapeCenterCircle = new self.paperScope2.Path.Circle({
                center: centerPoint,
                radius: 4,
                strokeColor: '#555555',
                fillColor: '#555555'
            });
            shapeCenterCircle.name = 'shapeCenterCircle';
            model.set('shapeCenterCircle', shapeCenterCircle);
            //shapeCenterCircle.position = centerPoint;
            shapeCenterCircle.opacity = 1;
            shapeCenter.opacity = 0;
            self._drawAsymptotes();
            self.rightPath.strokeWidth = 0;
            self.leftPath.strokeWidth = 0;
            asymptote2 = model.get('asymptote2');
            asymptote1 = model.get('asymptote1');

            asymptote1.strokeColor = '#a4a19d';
            asymptote2.strokeColor = '#a4a19d';
            model.set('draggingDisabled', true);
            self._unbindEvents();

            self.firstRotate = true;
            model.set('thumbTack1BeforePop', thumbTack1.position);
            model.set('thumbTack2BeforePop', thumbTack2.position);
            self._getInterSectingBubbles();
            if (self.isVertical === true) {
                circumferencePathLeft.reverse();
                if (minorAxis === 0) {
                    topLeft = center.y - self.dummyLeftPathArray[0].y;
                    bottomLeft = self.dummyLeftPathArray[self.dummyLeftPathArray.length - 1].y - center.y;
                    if (topLeft > bottomLeft) {
                        nearleft = self.dummyRightPathArray[0];
                        nearleft = self._getNearestPoint(nearleft, circumferencePathRight, thumbTack2);
                        target = circumferencePathRight.indexOf(nearleft);
                        endTarget = this.pointsRange - target;
                    }
                    else {
                        nearleft = self.dummyLeftPathArray[self.dummyLeftPathArray.length - 1];
                        nearleft = self._getNearestPoint(nearleft, circumferencePathLeft, thumbTack2);
                        target = circumferencePathLeft.indexOf(nearleft);
                        endTarget = this.pointsRange - target;
                    }
                }
                else {
                    topLeft = center.x - self.dummyLeftPathArray[0].x;
                    bottomLeft = center.x - self.dummyRightPathArray[0].x;
                    topRight = self.dummyLeftPathArray[self.dummyLeftPathArray.length - 1].x - center.x;
                    bottomRight = self.dummyRightPathArray[self.dummyRightPathArray.length - 1].x - center.x;

                    if (bottomLeft >= topRight) {
                        nearleft = self.dummyRightPathArray[0];
                        nearleft = self._getNearestPoint(nearleft, circumferencePathRight, thumbTack2);
                        target = circumferencePathRight.indexOf(nearleft);
                    }
                    else {
                        nearRight = self.dummyLeftPathArray[self.dummyLeftPathArray.length - 1];
                        nearRight = self._getNearestPoint(nearRight, circumferencePathLeft, thumbTack1);
                        target = circumferencePathLeft.indexOf(nearRight);
                    }
                    if (topLeft >= bottomRight) {
                        nearLeftEnd = self.dummyLeftPathArray[0];
                        nearLeftEnd = self._getNearestPoint(nearLeftEnd, circumferencePathLeft, thumbTack1);
                        endTarget = circumferencePathLeft.indexOf(nearLeftEnd);
                    }
                    else {
                        nearRightEnd = self.dummyRightPathArray[self.dummyRightPathArray.length - 1];
                        nearRightEnd = self._getNearestPoint(nearRightEnd, circumferencePathRight, thumbTack2);
                        endTarget = circumferencePathRight.indexOf(nearRightEnd);
                    }
                }
            }
            else {
                circumferencePathLeft.reverse();
                if (minorAxis === 0) {
                    topLeft = center.x - self.dummyLeftPathArray[0].x;
                    bottomLeft = self.dummyLeftPathArray[self.dummyLeftPathArray.length - 1].x - center.x;
                    if (topLeft > bottomLeft) {
                        nearleft = self.dummyRightPathArray[0];
                        nearleft = self._getNearestPoint(nearleft, circumferencePathRight, thumbTack2);
                        target = circumferencePathRight.indexOf(nearleft);
                        endTarget = this.pointsRange - target;
                    }
                    else {
                        nearleft = self.dummyLeftPathArray[self.dummyLeftPathArray.length - 1];
                        nearleft = self._getNearestPoint(nearleft, circumferencePathLeft, thumbTack2);
                        target = circumferencePathLeft.indexOf(nearleft);
                        endTarget = this.pointsRange - target;
                    }
                }
                else {
                    topLeft = center.y - self.dummyLeftPathArray[0].y;
                    bottomLeft = self.dummyLeftPathArray[self.dummyLeftPathArray.length - 1].y - center.y;
                    topRight = center.y - self.dummyRightPathArray[0].y;
                    bottomRight = self.dummyRightPathArray[self.dummyRightPathArray.length - 1].y - center.y;
                    if (bottomLeft >= topRight) {
                        nearleft = self.dummyLeftPathArray[self.dummyLeftPathArray.length - 1];
                        nearleft = self._getNearestPoint(nearleft, circumferencePathLeft, thumbTack2);
                        target = circumferencePathLeft.indexOf(nearleft);
                    }
                    else {
                        nearRight = self.dummyRightPathArray[0];
                        nearRight = self._getNearestPoint(nearRight, circumferencePathRight, thumbTack1);
                        target = circumferencePathRight.indexOf(nearRight);
                    }
                    if (topLeft >= bottomRight) {
                        nearLeftEnd = self.dummyLeftPathArray[0];
                        nearLeftEnd = self._getNearestPoint(nearLeftEnd, circumferencePathLeft, thumbTack2);
                        endTarget = circumferencePathLeft.indexOf(nearLeftEnd);
                    }
                    else {
                        nearRightEnd = self.dummyRightPathArray[self.dummyRightPathArray.length - 1];
                        nearRightEnd = self._getNearestPoint(nearRightEnd, circumferencePathRight, thumbTack2);
                        endTarget = circumferencePathRight.indexOf(nearRightEnd);
                    }
                }
            }
            position1 = thumbTack1.position;
            position2 = thumbTack2.position;
            thumbTack1.remove();
            thumbTack2.remove();
            thumbTack1 = new self.paperScope2.Raster(self.getSpritePartBase64URL('explore-shapes', 92, 54, 19, 39));
            thumbTack2 = new self.paperScope2.Raster(self.getSpritePartBase64URL('explore-shapes', 92, 54, 19, 39));
            thumbTack1.position = position1;
            thumbTack2.position = position2;
            thumbTack1.name = 'thumbTack1';
            thumbTack2.name = 'thumbTack2';

            model.set('thumbTack1', thumbTack1);
            model.set('thumbTack2', thumbTack2);
            self._redrawStringsAndUpdateGroup();
            thumbTack1.position = circumferencePathRight[target];
            previousPointRight = circumferencePathRight[target];
            thumbTack2.position = circumferencePathLeft[target];
            previousPointLeft = circumferencePathLeft[target];
            target++;

            self._redrawStringsAndUpdateGroup();
            self.paperScope2.view.draw();
            var prevLeftAngle, prevRightAngle, leftAngle, rightAngle;
            var leftInterval = setInterval(function () {

                leftAngle = (previousPointLeft.subtract(circumferencePathLeft[target])).angle;
                rightAngle = (previousPointRight.subtract(circumferencePathRight[target])).angle;
                if (prevLeftAngle || prevRightAngle) {
                    thumbTack1.rotate(rightAngle - prevRightAngle);
                    thumbTack2.rotate(leftAngle - prevLeftAngle);

                }
                else {


                    thumbTack1.rotate(rightAngle - 90);
                    thumbTack2.rotate(90 + leftAngle);
                    thumbTack2.rotate(180);

                }

                thumbTack1.position = circumferencePathRight[target];

                thumbTack2.position = circumferencePathLeft[target];

                previousPointLeft = circumferencePathLeft[target];
                previousPointRight = circumferencePathRight[target];


                prevLeftAngle = leftAngle;
                prevRightAngle = rightAngle;
                self._redrawStringsAndUpdateGroup();
                self._setTackPosition(circumferencePathRight[target - 2], circumferencePathLeft[target - 2]);
                self._popOutInterSectingBubbles();
                self.paperScope2.view.draw();
                target += animationOffset;
                counterRight += animationOffset;
                counterLeft += animationOffset;
                if (target > endTarget) {
                    self.paperScope2.activate();
                    self.rightPath.strokeColor = '#555555';
                    self.leftPath.strokeColor = '#555555';
                    self.rightPath.strokeWidth = 2;
                    self.leftPath.strokeWidth = 2;
                    self.model.set('finalThumbTack1Position', thumbTack1.position);
                    self.model.set('finalThumbTack2Position', thumbTack2.position);
                    self.trigger(MathInteractives.Common.Interactivities.ConicExplorer.Views.ConicPlotter.CUSTOM_EVENTS.animationComplete);
                    self._fixOverlappingElements();
                    self._showHideEquation(true);
                    self.drawLabel();
                    circumferencePathLeft.reverse();
                    clearInterval(leftInterval);
                    dummyThumbTack1.position = thumbTack1.position;
                    dummyThumbTack2.position = thumbTack2.position;
                    self.paperScope2.view.draw();
                    self._bindEvents();
                }
            }, 1);

        },

        adjustVertexPosition: function (event) {
            var xDistanceDragged = null,
                 yDistanceDragged = null,
                 model = this.model,
                 foci1 = model.get('foci1'),
                 foci2 = model.get('foci2'),
                 vertex1 = model.get('vertex1'),
                 vertex2 = model.get('vertex2'),
                 shapeCenter = model.get('shapeCenter'),
                 dummyVertex1 = model.get('dummyVertex1'),
                 dummyVertex2 = model.get('dummyVertex2'),
                 currentItem = null,
                 multiplier = 1,
                 currentFoci = null,
                 otherVertex = null,
                 currentItemString = null,
                 otherVertexString = null,
                 calculatePoints = true,
                 currDummyItem = null,
                otherDummyItem = null,
                currDummyItemString = null,
                 otherDummyItemString = null,
                 otherFoci = null;

            if (this.entireGroup.currentItem === 'vertex1') {
                currentItem = vertex1;
                otherVertex = vertex2;
                currentFoci = foci1;
                otherFoci = foci2;
                currentItemString = 'vertex1';
                otherVertexString = 'vertex2';
                currDummyItem = dummyVertex1;
                otherDummyItem = dummyVertex2;
                currDummyItemString = 'dummyVertex1';
                otherDummyItemString = 'dummyVertex2';
            } else {
                currentItem = vertex2;
                otherVertex = vertex1;
                currentFoci = foci2;
                otherFoci = foci1;
                currentItemString = 'vertex2';
                otherVertexString = 'vertex1';
                currDummyItem = dummyVertex2;
                otherDummyItem = dummyVertex1;
                currDummyItemString = 'dummyVertex2';
                otherDummyItemString = 'dummyVertex1';
            }
            xDistanceDragged = event.point.x - currentItem.position.x;
            yDistanceDragged = event.point.y - currentItem.position.y;
            multiplier = -1;
            if (!this.isVertical) {
                //if (Math.round(currentItem.position.y) === Math.round(shapeCenter.position.y)) {
                currentItem.position.x = event.point.x;
                otherVertex.position.x = otherVertex.position.x + multiplier * xDistanceDragged;
                //}
                if (this.entireGroup.currentItem === 'vertex1') {
                    if (foci1.position.x >= event.point.x) {
                        currentItem.position.x = currentFoci.position.x;
                        otherVertex.position.x = otherFoci.position.x;
                    } else {
                        if (event.point.x >= shapeCenter.position.x) {
                            currentItem.position.x = shapeCenter.position.x;
                            otherVertex.position.x = shapeCenter.position.x;
                        }
                    }
                } else {
                    if (foci2.position.x <= event.point.x) {
                        currentItem.position.x = currentFoci.position.x;
                        otherVertex.position.x = otherFoci.position.x;
                    } else {
                        if (event.point.x <= shapeCenter.position.x) {
                            currentItem.position.x = shapeCenter.position.x;
                            otherVertex.position.x = shapeCenter.position.x;
                        }
                    }
                }
            } else {
                //if (Math.round(currentItem.position.x) === Math.round(shapeCenter.position.x)) {
                currentItem.position.y = event.point.y;
                otherVertex.position.y = otherVertex.position.y + multiplier * yDistanceDragged;
                //}
                if (this.entireGroup.currentItem === 'vertex1') {
                    if (foci1.position.y >= event.point.y) {
                        currentItem.position.y = currentFoci.position.y;
                        otherVertex.position.y = otherFoci.position.y;
                    } else {
                        if (event.point.y >= shapeCenter.position.y) {
                            currentItem.position.y = shapeCenter.position.y;
                            otherVertex.position.y = shapeCenter.position.y;
                        }
                    }
                } else {
                    if (foci2.position.y <= event.point.y) {
                        currentItem.position.y = currentFoci.position.y;
                        otherVertex.position.y = otherFoci.position.y;
                    } else {
                        if (event.point.y <= shapeCenter.position.y) {
                            currentItem.position.y = shapeCenter.position.y;
                            otherVertex.position.y = shapeCenter.position.y;
                        }
                    }
                }
            }
            currDummyItem.position = currentItem.position;
            otherDummyItem.position = otherVertex.position;
            model.set(currentItemString, currentItem);
            model.set(otherVertexString, otherVertex);
            model.set(currDummyItemString, currDummyItem);
            model.set(otherDummyItemString, otherDummyItem);

            if (calculatePoints) {
                this._calculateMinorAxisAndUpdateHyperbolaPoints();
            } else {
                this._updateGroup();
            }
        },

        _calculateMinorAxisAndUpdateHyperbolaPoints: function (calculatePoints, isShapeCenter) {

            this._calculateMajorAxisAndMinorAxis();
            var majorAxis = this.model.get('majorAxis'),
                minorAxis = this.model.get('minorAxis'),
                squareOfMajor = majorAxis * majorAxis,
                squareOfMinor = minorAxis * minorAxis;
            if (minorAxis === 0 && majorAxis === 0) {
                this._updateGroup();
                this.trigger(this.viewStaticData.CUSTOM_EVENTS.hideHyderbola);
                return;
            }

            var center = this.model.get('center'),
                shapeCenter = this.model.get('shapeCenter'),
                vertex1 = this.model.get('vertex1'),
                foci1 = this.model.get('foci1'),
                foci2 = this.model.get('foci2'),
                thumbTack1 = this.model.get('thumbTack1'),
                thumbTack2 = this.model.get('thumbTack2'),
                dummyThumbTack1 = this.model.get('dummyThumbTack1'),
                dummyThumbTack2 = this.model.get('dummyThumbTack2'),
                points = null,
                thumbTack1Position = null,
                position1 = null,
                position2 = null,
                target = null,
                indexLeft = false,
                indexRight = null,
                angleRight = null,
                angleLeft = null,
                prevPoint = null,
                commonFunction = null, value1 = null, value3 = null,
                nextPoint = null;


            position1 = thumbTack1.position;
            position2 = thumbTack2.position;
            thumbTack1.remove();
            thumbTack2.remove();
            thumbTack1 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack2 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack1.position = position1;
            thumbTack2.position = position2;
            thumbTack1.name = 'thumbTack1';
            thumbTack2.name = 'thumbTack2';
            if (calculatePoints) {
                points = this.returnHyperBolaPoints(center, majorAxis, minorAxis, this.pointsRange);
                this.model.set('points', points);
            }
            if (minorAxis === 0) {
                value1 = minorAxis;
                value3 = squareOfMajor;
                if (this.isVertical) {
                    commonFunction = this.returnHyperBolaPointsHelper1;
                } else {
                    commonFunction = this.returnHyperBolaPointsHelper2;
                }
            } else {
                value1 = majorAxis;
                value3 = squareOfMinor;
                if (this.isVertical) {
                    commonFunction = this.returnHyperBolaPointsHelper3;
                } else {
                    commonFunction = this.returnHyperBolaPointsHelper4;
                }
            }
            this.commonFunction = commonFunction;
            if (!this.entireGroup._namedChildren.thumbTack1) {

                thumbTack1.position = this._returnCorrespondingPoint(value1, -200, value3, true);
                thumbTack2.position = this._returnCorrespondingPoint(value1, 200, value3, false);
                prevPoint = this._returnCorrespondingPoint(value1, -200 - 1, value3, true);
                nextPoint = this._returnCorrespondingPoint(value1, 200 + 1, value3, false);
                dummyThumbTack1.position = thumbTack1.position;
                dummyThumbTack2.position = thumbTack2.position;
                dummyThumbTack1.opacity = 0;
                dummyThumbTack2.opacity = 0;
            }

            if (this.isVertical === true) {

                if (parseInt(foci1.position.y) === parseInt(vertex1.position.y) && parseInt(foci1.position.x) === parseInt(vertex1.position.x)) {

                    thumbTack1.position = this._returnCorrespondingPoint(value1, thumbTack1.position.y - center.y, value3, true);
                    thumbTack2.position = this._returnCorrespondingPoint(value1, thumbTack2.position.y - center.y, value3, false);
                    prevPoint = this._returnCorrespondingPoint(value1, thumbTack1.position.y - center.y - 1, value3, true);
                    nextPoint = this._returnCorrespondingPoint(value1, thumbTack2.position.y - center.y + 1, value3, false);
                    indexLeft = true;
                } else if ((parseInt(shapeCenter.position.x) === parseInt(thumbTack1.position.x) || parseInt(shapeCenter.position.x) === parseInt(thumbTack2.position.x)) && !isShapeCenter) {

                    thumbTack1.position = this._returnCorrespondingPoint(value1, -200, value3, true);
                    thumbTack2.position = this._returnCorrespondingPoint(value1, 200, value3, false);
                    prevPoint = this._returnCorrespondingPoint(value1, -200 - 1, value3, true);
                    nextPoint = this._returnCorrespondingPoint(value1, 200 + 1, value3, false);
                    indexLeft = true;
                } else {

                    thumbTack1.position = this._returnCorrespondingPoint(value1, thumbTack1.position.x - center.x, value3, true);
                    thumbTack2.position = this._returnCorrespondingPoint(value1, thumbTack2.position.x - center.x, value3, false);
                    prevPoint = this._returnCorrespondingPoint(value1, thumbTack1.position.x - center.x - 1, value3, true);
                    nextPoint = this._returnCorrespondingPoint(value1, thumbTack2.position.x - center.x + 1, value3, false);
                    indexLeft = true;
                }
                if (indexLeft) {
                    //currPoint = points.rightWing[indexRight].x;
                    if (this._checkIfPointOutOfBounds(thumbTack1.position) && this._checkIfPointOutOfBounds(thumbTack2.position)) {
                        if (!calculatePoints) {
                            points = this.returnHyperBolaPoints(center, majorAxis, minorAxis, this.pointsRange);
                            this.model.set('points', points);
                        }
                        thumbTack1Position = this._getNearestPointWithIndex(thumbTack1.position, this.dummyRightPathArray).point;
                        var thumbTack1PositionObj = this._getNearestPointWithIndex(thumbTack1Position, points.rightWing);
                        target = thumbTack1PositionObj.index;
                        thumbTack1.position = points.rightWing[target];
                        thumbTack2.position = points.leftWing[points.leftWing.length - target];
                        prevPoint = points.rightWing[target - 1];
                        nextPoint = points.leftWing[points.leftWing.length - target + 1];
                    }

                    angleRight = ((thumbTack1.position).subtract(prevPoint)).angle;
                    thumbTack1.rotate(angleRight);
                    angleLeft = ((nextPoint).subtract(thumbTack2.position)).angle;
                    thumbTack2.rotate(angleLeft);

                    if (angleRight === 0) {
                        thumbTack1.rotate(90, thumbTack1.position);
                    } else {
                        if (angleRight === 90) {
                            thumbTack1.rotate(-90, thumbTack1.position);
                        } else {
                            thumbTack1.rotate(90, thumbTack1.position);
                        }
                    }

                    if (angleLeft === 0) {
                        thumbTack2.rotate(-90, thumbTack2.position);
                    } else {
                        if (angleLeft === 90) {
                            thumbTack2.rotate(90, thumbTack2.position);
                        } else {
                            thumbTack2.rotate(-90, thumbTack2.position);
                        }
                    }
                }
            }
            else {



                if (parseInt(foci1.position.y) === parseInt(vertex1.position.y) && parseInt(foci1.position.x) === parseInt(vertex1.position.x)) {

                    thumbTack1.position = this._returnCorrespondingPoint(value1, thumbTack1.position.x - center.x, value3, true);
                    thumbTack2.position = this._returnCorrespondingPoint(value1, thumbTack2.position.x - center.x, value3, false);
                    prevPoint = this._returnCorrespondingPoint(value1, thumbTack1.position.x - center.x - 1, value3, true);
                    nextPoint = this._returnCorrespondingPoint(value1, thumbTack2.position.x - center.x + 1, value3, false);
                    indexLeft = true;
                } else if ((parseInt(shapeCenter.position.y) === parseInt(thumbTack1.position.y) || parseInt(shapeCenter.position.y) === parseInt(thumbTack2.position.y)) && !isShapeCenter) {

                    thumbTack1.position = this._returnCorrespondingPoint(value1, -200, value3, true);
                    thumbTack2.position = this._returnCorrespondingPoint(value1, 200, value3, false);
                    prevPoint = this._returnCorrespondingPoint(value1, -200 - 1, value3, true);
                    nextPoint = this._returnCorrespondingPoint(value1, 200 + 1, value3, false);
                    indexLeft = true;
                } else {

                    thumbTack1.position = this._returnCorrespondingPoint(value1, thumbTack1.position.y - center.y, value3, true);
                    thumbTack2.position = this._returnCorrespondingPoint(value1, thumbTack2.position.y - center.y, value3, false);
                    prevPoint = this._returnCorrespondingPoint(value1, thumbTack1.position.y - center.y - 1, value3, true);
                    nextPoint = this._returnCorrespondingPoint(value1, thumbTack2.position.y - center.y + 1, value3, false);
                    indexLeft = true;
                }

                if (indexLeft) {
                    if (this._checkIfPointOutOfBounds(thumbTack1.position) && this._checkIfPointOutOfBounds(thumbTack2.position)) {
                        if (!calculatePoints) {
                            points = this.returnHyperBolaPoints(center, majorAxis, minorAxis, this.pointsRange);
                            this.model.set('points', points);
                        }
                        thumbTack1Position = this._getNearestPointWithIndex(thumbTack1.position, this.dummyRightPathArray).point;
                        var thumbTack1PositionObj = this._getNearestPointWithIndex(thumbTack1Position, points.rightWing);
                        target = thumbTack1PositionObj.index;
                        thumbTack1.position = points.rightWing[target];
                        thumbTack2.position = points.leftWing[points.leftWing.length - target];
                        prevPoint = points.rightWing[target - 1];
                        nextPoint = points.leftWing[points.leftWing.length - target + 1];
                    }


                    angleRight = ((thumbTack1.position).subtract(prevPoint)).angle;
                    thumbTack1.rotate(angleRight);
                    angleLeft = ((nextPoint).subtract(thumbTack2.position)).angle;
                    thumbTack2.rotate(angleLeft);

                    if (angleRight) {
                        thumbTack1.rotate(90, thumbTack1.position);
                    } else {
                        if (angleRight === 0) {
                            thumbTack1.rotate(-90, thumbTack1.position);
                        }
                    }

                    if (angleLeft) {
                        thumbTack2.rotate(-90, thumbTack2.position);
                    } else {
                        if (angleLeft === 0) {
                            thumbTack2.rotate(90, thumbTack2.position);
                        }
                    }
                }

            }

            dummyThumbTack1.position = thumbTack1.position;
            dummyThumbTack2.position = thumbTack2.position;

            this.model.set('thumbTack1', thumbTack1);
            this.model.set('thumbTack2', thumbTack2);
            this.model.set('dummyThumbTack1', dummyThumbTack1);
            this.model.set('dummyThumbTack2', dummyThumbTack2);
            this._redrawStringsAndUpdateGroup();
        },

        _checkIfPointOutOfBounds: function (point) {
            if ((point.x < this.areaDimension[0] || point.x > this.areaDimension[2]) || (point.y < this.areaDimension[1] || point.y > this.areaDimension[3])) {
                return true;
            } else {
                return false;
            }
        },

        _getDistanceBetweenPoints: function (start, end) {
            var startX = start.position.x,
                startY = start.position.y,
                endX = end.position.x,
                endY = end.position.y,
                xDifference = startX - endX,
                yDifference = startY - endY,
                distance = null;
            distance = Math.sqrt((xDifference * xDifference) + (yDifference * yDifference));
            return distance;
        },

        adjustFociPosition: function (event) {
            var xDistanceDragged = null,
                yDistanceDragged = null,
                xVertexFociDistance = null,
                yVertexFociDistance = null,
                model = this.model,
                foci1 = this.model.get('foci1'),
                foci2 = this.model.get('foci2'),
                vertex1 = this.model.get('vertex1'),
                vertex2 = this.model.get('vertex2'),
                currentItem = null,
                multiplier = 1,
                shapeCenter = model.get('shapeCenter'),
                currentVertex = null,
                otherVertex = null,
                currentItemString = null,
                otherFociString = null,
                calculatePoints = true,
                otherFoci = null,
                boundCheckDistanceX = null,
                boundCheckDistanceY = null,
                currentGroupItem = this.entireGroup.currentItem;

            if (currentGroupItem === 'foci1') {
                currentItem = foci1;
                otherFoci = foci2;
                currentVertex = vertex1;
                otherVertex = vertex2;
                currentItemString = 'foci1';
                otherFociString = 'foci2';
            } else {
                currentItem = foci2;
                otherFoci = foci1;
                currentVertex = vertex2;
                otherVertex = vertex1;
                currentItemString = 'foci2';
                otherFociString = 'foci1';
            }
            xDistanceDragged = event.point.x - currentItem.position.x;
            yDistanceDragged = event.point.y - currentItem.position.y;
            multiplier = -1;

            xVertexFociDistance = event.point.x - currentVertex.position.x;
            yVertexFociDistance = event.point.y - currentVertex.position.y;

            boundCheckDistanceX = otherFoci.position.x + multiplier * xDistanceDragged;

            if (boundCheckDistanceX < this.areaDimension[0] || boundCheckDistanceX > this.areaDimension[2]) {
                this.model.set('fociOutOfBounds', true);
                return;
            } else {
                //this.model.set('fociOutOfBounds', false);
            }

            var roundedShapeCenterPositionX = Math.round(shapeCenter.position.x),
                roundedShapeCenterPositionY = Math.round(shapeCenter.position.y),
                roundedItemPositionX = Math.round(currentItem.position.x),
                roundedItemPositionY = Math.round(currentItem.position.y);
            if (!this.isVertical) {
                currentItem.position.x = event.point.x;
                otherFoci.position.x = otherFoci.position.x + multiplier * xDistanceDragged;
                this.isVertical = false;
                this.model.set('isVertical', false);
                if ((currentGroupItem === 'foci1' && xVertexFociDistance >= 0) || (currentGroupItem === 'foci2' && xVertexFociDistance <= 0)) {
                    currentItem.position.x = currentVertex.position.x;
                    otherFoci.position.x = otherVertex.position.x;
                }
            }
            if (roundedShapeCenterPositionX === roundedItemPositionX && roundedShapeCenterPositionY === roundedItemPositionY) {
                this._updateGroup();
            }


            if (this.isVertical) {
                //if (roundedItemPositionX === roundedShapeCenterPositionX) {
                boundCheckDistanceY = otherFoci.position.y + multiplier * yDistanceDragged;

                if (boundCheckDistanceY < this.areaDimension[1] || boundCheckDistanceY > this.areaDimension[3]) {
                    this.model.set('fociOutOfBounds', true);
                    return;
                } else {
                    //this.model.set('fociOutOfBounds', false);
                }
                currentItem.position.y = event.point.y;
                otherFoci.position.y = otherFoci.position.y + multiplier * yDistanceDragged;
                this.isVertical = true;
                this.model.set('isVertical', true);
                //}
                if ((currentGroupItem === 'foci1' && yVertexFociDistance >= 0) || (currentGroupItem === 'foci2' && yVertexFociDistance <= 0)) {
                    currentItem.position.y = currentVertex.position.y;
                    otherFoci.position.y = otherVertex.position.y;
                }
            }
            if (roundedShapeCenterPositionX === roundedItemPositionX && roundedShapeCenterPositionY === roundedItemPositionY) {
                calculatePoints = false;
            }

            model.set(currentItemString, currentItem);
            model.set(otherFociString, otherFoci);

            if (calculatePoints) {
                this._calculateMinorAxisAndUpdateHyperbolaPoints();
                this.trigger(this.viewStaticData.CUSTOM_EVENTS.showHyderbola);
            } else {
                this._updateGroup();
                this.trigger(this.viewStaticData.CUSTOM_EVENTS.hideHyderbola);
            }
        },

        _updateGroup: function () {
            var model = this.model,
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                shapeCenter = model.get('shapeCenter'),
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                purpleBar1 = model.get('purpleBar1'),
                redBar1 = model.get('redBar1'),
                redBar2 = model.get('redBar2'),
                purpleBar2 = model.get('purpleBar2'),
                dummyVertex1 = model.get('dummyVertex1'),
                dummyVertex2 = model.get('dummyVertex2'),
                dummyShapeCenter = model.get('dummyShapeCenter');

            this.thumbTackPosition1 = thumbTack1.position;
            this.thumbTackPosition2 = thumbTack2.position;
            this.entireGroup.removeChildren();
            this.entireGroup.addChildren([foci1, foci2, vertex1, vertex2, shapeCenter, dummyShapeCenter, dummyVertex2, dummyVertex1]);
            this._fixOverlappingElements();
            if (purpleBar1) {
                purpleBar1.remove();
            }
            if (redBar1) {
                redBar1.remove();
            }
            if (purpleBar2) {
                purpleBar2.remove();
            }
            if (redBar2) {
                redBar2.remove();
            }
        },

        _redrawStringsAndUpdateGroup: function () {
            var model = this.model,
                foci1 = this.model.get('foci1'),
                foci2 = this.model.get('foci2'),
                thumbTack1 = this.model.get('thumbTack1'),
                thumbTack2 = this.model.get('thumbTack2'),
                dummyThumbTack1 = this.model.get('dummyThumbTack1'),
                dummyThumbTack2 = this.model.get('dummyThumbTack2'),
                vertex1 = this.model.get('vertex1'),
                vertex2 = this.model.get('vertex2'),
                dummyVertex1 = this.model.get('dummyVertex1'),
                dummyVertex2 = this.model.get('dummyVertex2'),
                redStringRaster = null,
                shapeCenter = model.get('shapeCenter'),
                dummyShapeCenter = model.get('dummyShapeCenter'),
                shapeCenterCircle = model.get('shapeCenterCircle'),
                purpleStringRaster = null;

            this.entireGroup.removeChildren();
            this._generateString('purple', purpleStringRaster, foci1.position, thumbTack1.position, false);
            var group1 = model.get('purple');
            group1.moveAbove(model.get('thumbTack1'));
            this._generateString('red', redStringRaster, foci2.position, thumbTack1.position, false);
            var group2 = model.get('red');
            group2.moveAbove(model.get('thumbTack1'));
            this._generateString('red', purpleStringRaster, foci1.position, thumbTack2.position, false);
            var group3 = model.get('red');
            group3.moveAbove(model.get('thumbTack2'));
            this._generateString('purple', redStringRaster, foci2.position, thumbTack2.position, false);
            var group4 = model.get('purple');
            group4.moveAbove(model.get('thumbTack2'));
            group1.name = 'purple-line1';
            group2.name = 'red-line1';
            group3.name = 'purple-line2';
            group4.name = 'red-line2';
            this._generateBar();
            var groupElements = [foci1, foci2, thumbTack1, thumbTack2, dummyThumbTack1, dummyThumbTack2, vertex1, vertex2, shapeCenter, group1, group2, group3, group4, dummyVertex1, dummyVertex2, dummyShapeCenter];
            if (shapeCenterCircle) {
                groupElements.push(shapeCenterCircle);
            }
            this.entireGroup.addChildren(groupElements);
            this._fixOverlappingElements();
        },

        /**
        * Calculates & returns the nearest point on the circumference path
        * @method _getNearestPoint
        * @private
        * @param currentPoint << {{object}} >> current point
        * @param circumferencePath << {{object}} >> Array of points on the circumference
        * @return  << {{object}} >> nearest point on the circumference
        */
        _getNearestPoint: function _getNearestPoint(currentPoint, circumferencePath, thumbTack) {

            var model = this.model,
            //circumferencePath = model.get('circumferencePath'),
                counter = 0,
                requiredPoint = null,
                nearestPointDistance = null,
                minDist = 10000;

            for (; counter < this.pointsRange; counter++) {

                nearestPointDistance = (currentPoint.subtract(circumferencePath[counter])).length;
                if (nearestPointDistance < minDist) {
                    minDist = nearestPointDistance;
                    requiredPoint = circumferencePath[counter];
                }
                if (nearestPointDistance === 0) {
                    return requiredPoint;
                }
            }
            return requiredPoint;
        },

        _getNearestPointWithIndex: function (currentPoint, pointsArray) {
            var currentTopElement = null,
                currentBottomElement = null,
                topArrayStart = 0,
                topArrayEnd = pointsArray.length / 2 | 0,
                topArrayMid = (topArrayStart + topArrayEnd) / 2 | 0,
                bottomArrayStart = topArrayEnd,
                bottomArrayEnd = pointsArray.length - 1,
                bottomArrayMid = (bottomArrayStart + bottomArrayEnd) / 2 | 0;

            while ((topArrayEnd - topArrayStart) !== 1 && (bottomArrayEnd - bottomArrayStart) !== 1) {
                currentTopElement = pointsArray[topArrayMid];
                currentBottomElement = pointsArray[bottomArrayMid];

                if ((currentPoint.subtract(currentTopElement)).length < (currentPoint.subtract(currentBottomElement)).length) {
                    bottomArrayEnd = topArrayEnd;
                    topArrayStart = topArrayStart;
                    topArrayEnd = topArrayMid;
                    bottomArrayStart = topArrayEnd;
                    topArrayMid = (topArrayStart + topArrayEnd) / 2 | 0;
                    bottomArrayMid = (bottomArrayStart + bottomArrayEnd) / 2 | 0;
                }
                else {
                    topArrayStart = bottomArrayStart;
                    bottomArrayEnd = bottomArrayEnd;
                    topArrayEnd = bottomArrayMid;
                    bottomArrayStart = bottomArrayMid;
                    topArrayMid = (topArrayStart + topArrayEnd) / 2 | 0;
                    bottomArrayMid = (bottomArrayStart + bottomArrayEnd) / 2 | 0;
                }
            }
            var distance1 = currentPoint.subtract(pointsArray[topArrayStart]).length;
            var distance2 = currentPoint.subtract(pointsArray[topArrayEnd]).length;
            var distance3 = currentPoint.subtract(pointsArray[bottomArrayEnd]).length;
            if (distance1 < distance2 && distance1 < distance3) {
                return { 'point': pointsArray[topArrayStart], 'index': topArrayStart };
            }
            else if (distance2 < distance3) {
                return { 'point': pointsArray[topArrayEnd], 'index': topArrayEnd };
            }
            else {
                return { 'point': pointsArray[bottomArrayEnd], 'index': bottomArrayEnd };
            }
        },

        _drawAsymptotes: function () {
            var model = this.model,
                center = model.get('center'),
                major = model.get('majorAxis'),
                minor = model.get('minorAxis'),
                asymptote2 = model.get('asymptote2'),
                asymptote1 = model.get('asymptote1'),
                asympoints = this._returnAsymptotesPoints(center, major, minor);

            this.paperScope2.activate();
            if (asymptote1) {
                asymptote1.remove();
                asymptote2.remove();
            }

            asymptote1 = new this.paperScope2.Path();
            asymptote1.add(asympoints.leftAsymptotesPoints[0]);
            asymptote1.add(asympoints.leftAsymptotesPoints[1]);
            //asymptote1.strokeColor = '#a4a19d';
            asymptote1.strokeWidth = 1;
            asymptote1.dashArray = [8, 8];
            model.set('asymptote1', asymptote1);

            asymptote2 = new this.paperScope2.Path();
            asymptote2.add(asympoints.rightAsymptotesPoints[0]);
            asymptote2.add(asympoints.rightAsymptotesPoints[1]);
            //asymptote2.strokeColor = '#a4a19d';
            asymptote2.strokeWidth = 1;
            asymptote2.dashArray = [8, 8];
            model.set('asymptote2', asymptote2);
            asymptote1.sendToBack();
            asymptote2.sendToBack();
        },

        _returnAsymptotesPoints: function (center, major, minor) {
            var y, x, leftAsymptotesPoints = [], rightAsymptotesPoints = [], temp = null;
            //point1 =new this.paperScope2.Point(0,0);
            if (this.isVertical) {
                temp = major;
                major = minor;
                minor = temp;
            }
            y = (minor / major) * (900);
            leftAsymptotesPoints.push(new this.paperScope2.Point(900 + center.x, y + center.y));
            //point1.y = -point1.y;
            rightAsymptotesPoints.push(new this.paperScope2.Point(900 + center.x, -y + center.y));
            //point1.x= 500;
            y = (minor / major) * (-900);
            leftAsymptotesPoints.push(new this.paperScope2.Point(-900 + center.x, y + center.y));
            //point1.y = -point1.y;
            rightAsymptotesPoints.push(new this.paperScope2.Point(-900 + center.x, -y + center.y));

            return { 'leftAsymptotesPoints': leftAsymptotesPoints, 'rightAsymptotesPoints': rightAsymptotesPoints };
        },

        /**
        * Generate the purple string, red string bar at the bottom
        * @method _generateBar
        * @private
        * @param <<paramName>> << {{param type }} >> <<description>>
        */
        _generateBar: function () {
            this.paperScope2.activate();
            var firstPointX,
                center,
                options,
                endPointX,
                secondBarendPointX,
                paperScope2 = this.paperScope2,
                pointY = 548,
                model = this.model,
                purpleBar1 = model.get('purpleBar1'),
                purpleStringBarRaster = null,
                redStringBarRaster = null,
                redBar1 = model.get('redBar1'),
                purpleBar2 = model.get('purpleBar2'),
                redBar2 = model.get('redBar2'),
                thumbTack1 = this.model.get('thumbTack1'),
                thumbTack2 = this.model.get('thumbTack2'),
                foci1 = this.model.get('foci1'),
                foci2 = this.model.get('foci2'),
                imgWidth = 6,
                diff = null,
                tack1ToFoci1 = null,
                tack1ToFoci2 = null,
                tack2ToFoci2 = null,
                tack2ToFoci1 = null;

            if (purpleBar1) {
                purpleBar1.remove();
            }
            if (redBar1) {
                redBar1.remove();
            }
            if (purpleBar2) {
                purpleBar2.remove();
            }
            if (redBar2) {
                redBar2.remove();
            }

            tack1ToFoci1 = Math.floor(this._getDistanceBetweenPoints(thumbTack1, foci1));
            tack1ToFoci2 = Math.floor(this._getDistanceBetweenPoints(thumbTack1, foci2));
            tack2ToFoci1 = tack1ToFoci2;
            tack2ToFoci2 = tack1ToFoci1;
            center = model.getOriginPosition();

            diff = tack1ToFoci1 - tack1ToFoci2;
            endPointX = Math.floor(center.x - (diff / 2));
            firstPointX = Math.floor(endPointX - tack1ToFoci2);

            options = [{
                'raster': redStringBarRaster,
                'startingPoint': new paperScope2.Point(firstPointX, pointY),
                'endingPoint': new paperScope2.Point(endPointX, pointY),
                'width': imgWidth,
                'height': 10,
                'angle': 0,
                'isRatioBar': true,
                'isRatioBar1': false,
                'isRatioBar2': true,
                'ratioBar2Height': 23,
                'ratioBar2Width': 3,
                'ratioBar1Height': 23,
                'ratioBar1Width': 1,
                'lineColor': 'red'
            }];
            redBar1 = this._drawLine(options);
            model.set('redBar1', redBar1);
            secondBarendPointX = endPointX + tack1ToFoci1;
            options = [{
                'raster': purpleStringBarRaster,
                'startingPoint': new paperScope2.Point(endPointX, pointY),
                'endingPoint': new paperScope2.Point(secondBarendPointX, pointY),
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
                'lineColor': 'purple'

            }];

            purpleBar1 = this._drawLine(options);
            model.set('purpleBar1', purpleBar1);

            pointY = 567;
            diff = tack2ToFoci1 - tack2ToFoci2;
            endPointX = Math.floor(center.x - (diff / 2));
            firstPointX = Math.floor(endPointX - tack2ToFoci2);

            options = [{
                'raster': purpleStringBarRaster,
                'startingPoint': new paperScope2.Point(firstPointX, pointY),
                'endingPoint': new paperScope2.Point(endPointX, pointY),
                'width': imgWidth,
                'height': 10,
                'angle': 0,
                'isRatioBar': true,
                'isRatioBar1': false,
                'isRatioBar2': true,
                'ratioBar2Height': 23,
                'ratioBar2Width': 3,
                'ratioBar1Height': 23,
                'ratioBar1Width': 1,
                'lineColor': 'purple'

            }];
            purpleBar2 = this._drawLine(options);
            model.set('purpleBar2', purpleBar2);
            secondBarendPointX = endPointX + tack2ToFoci1;
            options = [{
                'raster': redStringBarRaster,
                'startingPoint': new paperScope2.Point(endPointX, pointY),
                'endingPoint': new paperScope2.Point(secondBarendPointX, pointY),
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

            redBar2 = this._drawLine(options);
            model.set('redBar2', redBar2);
        },

        /**
        * sets the previous position to thumbtack
        * @method setPreviousPositionToThumbTack
        * @private || public
        * @param thumbTackPosition << {{object}} >> position of thumbtack
        * @param isPopAgain << {{boolean}} >> true or false
        */
        setPreviousPositionToThumbTack: function (thumbTack1Position, thumbTack2Position) {
            var model = this.model,
                thumbTack1 = model.get('thumbTack1'),
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                dummyThumbTack2 = model.get('dummyThumbTack2');
            this.previousThumbTack1 = thumbTack1.position;
            this.previousThumbTack2 = thumbTack2.position;
            if (thumbTack1Position) {
                thumbTack1.position = thumbTack1Position;
                dummyThumbTack1.position = thumbTack1Position;
                this.model.set('thumbTack1', thumbTack1);
                this.model.set('dummyThumbTack1', dummyThumbTack1);
            }
            if (thumbTack2Position) {
                thumbTack2.position = thumbTack2Position;
                dummyThumbTack2.position = thumbTack2Position;
                this.model.set('thumbTack2', thumbTack2);
                this.model.set('dummyThumbTack2', dummyThumbTack2);
            }
            this._redrawStringsAndUpdateGroup();
        },

        /**
        * Resets the shape at the center of the graph
        * @method tryAnother
        * @public
        */
        tryAnother: function tryAnother() {

            this.paperScope2.activate();
            // this._snapAll();
            var model = this.model,
                center = model.get('center'),
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                dummyThumbTack2 = model.get('dummyThumbTack2'),
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                dummyVertex2 = model.get('dummyVertex2'),
                dummyVertex1 = model.get('dummyVertex1'),
                majorAxis,
                minorAxis,
                points,
                position1 = null,
                position2 = null,
                dummyShapeCenter = model.get('dummyShapeCenter');

            var shapeCenter = this.model.get('shapeCenter'),
                shapeCenterCircle = this.model.get('shapeCenterCircle'),
                asymptote1 = this.model.get('asymptote1'),
                asymptote2 = this.model.get('asymptote2');
            if (shapeCenterCircle) {
                shapeCenterCircle.opacity = 0;
                model.set('shapeCenterCircle', null);
            }
            shapeCenter.opacity = 1;
            if (this.leftPath) {
                this.leftPath.remove();
                this.rightPath.remove();
            }
            if (asymptote1) {
                asymptote1.remove();
                asymptote2.remove();
            }


            this._getRandomMajorAxisAndFoci();
            majorAxis = model.get('majorAxis');
            minorAxis = model.get('minorAxis');
            center = model.getOriginPosition();
            shapeCenter = model.get('shapeCenter');
            model.set('center', center);
            shapeCenter.position = center;
            dummyShapeCenter.position = shapeCenter.position;
            vertex1.position = new this.paperScope2.Point(center.x - majorAxis, center.y);
            vertex2.position = new this.paperScope2.Point(center.x + majorAxis, center.y);
            this._setInitialPosition();
            this._snapAll();
            this._calculateMajorAxisAndMinorAxis();
            majorAxis = this.model.get('majorAxis');
            minorAxis = this.model.get('minorAxis');

            this.isVertical = false;
            this.model.set('isVertical', false);
            points = this.returnHyperBolaPoints(center, majorAxis, minorAxis, this.pointsRange);
            this.model.set('points', points);
            var indexRight, indexLeft;
            for (var i = 0; i < this.pointsRange; i++) {
                if (parseInt(points.rightWing[i].y) === parseInt(center.y - 200)) {
                    thumbTack1.position = points.rightWing[i];
                    indexRight = i;
                }
                if (parseInt(points.leftWing[i].y) === parseInt(center.y + 200)) {
                    thumbTack2.position = points.leftWing[i];
                    indexLeft = i;
                }
            }

            position1 = thumbTack1.position;
            position2 = thumbTack2.position;
            thumbTack1.remove();
            thumbTack2.remove();
            thumbTack1 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack2 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack1.position = position1;
            thumbTack2.position = position2;
            thumbTack1.name = 'thumbTack1';
            thumbTack2.name = 'thumbTack2';

            this.model.set('thumbTack1', thumbTack1);
            this.model.set('thumbTack2', thumbTack2);
            this.model.set('dummyThumbTack1', dummyThumbTack1);
            this.model.set('dummyThumbTack2', dummyThumbTack2);
            this._redrawStringsAndUpdateGroup();

            dummyThumbTack1.position = thumbTack1.position;
            dummyThumbTack2.position = thumbTack2.position;
            dummyThumbTack1.opacity = 0;
            dummyThumbTack2.opacity = 0;

            var angleRight = ((points.rightWing[indexRight]).subtract(points.rightWing[indexRight - 1])).angle;

            thumbTack1.rotate(angleRight);
            thumbTack1.rotate(90);

            var angleLeft = ((points.leftWing[indexLeft + 1]).subtract(points.leftWing[indexLeft])).angle;

            thumbTack2.rotate(angleLeft);
            thumbTack2.rotate(-90);
            this._redrawStringsAndUpdateGroup();

            model.set('thumbTack1', thumbTack1);
            model.set('thumbTack2', thumbTack2);
            model.set('dummyThumbTack1', dummyThumbTack1);
            model.set('dummyThumbTack2', dummyThumbTack2);
            model.set('vertex1', vertex1);
            model.set('vertex2', vertex2);

            this._drawDummyTackPath();

            model.set('showPopupOnTryAnother', false);
        },

        /**
        * Resets the shape at the center of the graph
        * @method tryAnother
        * @public
        */
        changeToHorizontalOrVertical: function changeToHorizontalOrVertical(isVertical) {

            this.paperScope2.activate();
            // this._snapAll();
            var model = this.model,
                center = model.get('center'),
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                dummyThumbTack2 = model.get('dummyThumbTack2'),
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                dummyVertex2 = model.get('dummyVertex2'),
                dummyVertex1 = model.get('dummyVertex1'),
                gridSize = model.getGridSizeXAxis(),
                majorAxis,
                minorAxis,
                points,
                foci,
                position1 = null,
                position2 = null,
                dummyShapeCenter = model.get('dummyShapeCenter');

            var shapeCenter = this.model.get('shapeCenter'),
                shapeCenterCircle = this.model.get('shapeCenterCircle'),
                asymptote1 = this.model.get('asymptote1'),
                asymptote2 = this.model.get('asymptote2');
            if (shapeCenterCircle) {
                shapeCenterCircle.opacity = 0;
            }
            shapeCenter.opacity = 1;
            if (this.leftPath) {
                this.leftPath.remove();
                this.rightPath.remove();
            }
            if (asymptote1) {
                asymptote1.remove();
                asymptote2.remove();
            }

            majorAxis = this.viewStaticData.MAJOR_AXIS_DEFAULT * gridSize;
            minorAxis = this.viewStaticData.MINOR_AXIS_DEFAULT * gridSize;
            foci = this.viewStaticData.FOCI_DEFAULT * gridSize;
            model.set('majorAxis', majorAxis);
            model.set('foci', foci);
            model.set('minorAxis', minorAxis);
            center = model.getOriginPosition();
            shapeCenter = model.get('shapeCenter');
            model.set('center', center);
            shapeCenter.position = center;
            dummyShapeCenter.position = shapeCenter.position;
            if (isVertical) {
                vertex1.position = new this.paperScope2.Point(center.x, center.y - majorAxis);
                vertex2.position = new this.paperScope2.Point(center.x, center.y + majorAxis);
                this._setInitialPosition(true);
                this.isVertical = true;
                this.model.set('isVertical', true);
            } else {
                vertex1.position = new this.paperScope2.Point(center.x - majorAxis, center.y);
                vertex2.position = new this.paperScope2.Point(center.x + majorAxis, center.y);
                this._setInitialPosition();
                this.isVertical = false;
                this.model.set('isVertical', false);
            }
            this._snapAll();
            this._calculateMajorAxisAndMinorAxis();
            majorAxis = this.model.get('majorAxis');
            minorAxis = this.model.get('minorAxis');

            //this.isVertical = false;
            //this.model.set('isVertical', false);
            points = this.returnHyperBolaPoints(center, majorAxis, minorAxis, this.pointsRange);
            this.model.set('points', points);
            var indexRight, indexLeft;
            if (isVertical) {
                for (var i = 0; i < this.pointsRange; i++) {
                    if (parseInt(points.rightWing[i].x) === parseInt(center.x - 200)) {
                        thumbTack1.position = points.rightWing[i];
                        indexRight = i;
                    }
                    if (parseInt(points.leftWing[i].x) === parseInt(center.x + 200)) {
                        thumbTack2.position = points.leftWing[i];
                        indexLeft = i;
                    }
                }
            } else {
                for (var i = 0; i < this.pointsRange; i++) {
                    if (parseInt(points.rightWing[i].y) === parseInt(center.y - 200)) {
                        thumbTack1.position = points.rightWing[i];
                        indexRight = i;
                    }
                    if (parseInt(points.leftWing[i].y) === parseInt(center.y + 200)) {
                        thumbTack2.position = points.leftWing[i];
                        indexLeft = i;
                    }
                }
            }

            position1 = thumbTack1.position;
            position2 = thumbTack2.position;
            thumbTack1.remove();
            thumbTack2.remove();
            thumbTack1 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack2 = new this.paperScope2.Raster(this.thumbTackRaster);
            thumbTack1.position = position1;
            thumbTack2.position = position2;
            thumbTack1.name = 'thumbTack1';
            thumbTack2.name = 'thumbTack2';

            this.model.set('thumbTack1', thumbTack1);
            this.model.set('thumbTack2', thumbTack2);
            this.model.set('dummyThumbTack1', dummyThumbTack1);
            this.model.set('dummyThumbTack2', dummyThumbTack2);
            this._redrawStringsAndUpdateGroup();

            dummyThumbTack1.position = thumbTack1.position;
            dummyThumbTack2.position = thumbTack2.position;
            dummyThumbTack1.opacity = 0;
            dummyThumbTack2.opacity = 0;

            var angleRight = ((points.rightWing[indexRight]).subtract(points.rightWing[indexRight - 1])).angle;

            thumbTack1.rotate(angleRight);
            thumbTack1.rotate(90);

            var angleLeft = ((points.leftWing[indexLeft + 1]).subtract(points.leftWing[indexLeft])).angle;

            thumbTack2.rotate(angleLeft);
            thumbTack2.rotate(-90);
            this._redrawStringsAndUpdateGroup();

            model.set('thumbTack1', thumbTack1);
            model.set('thumbTack2', thumbTack2);
            model.set('dummyThumbTack1', dummyThumbTack1);
            model.set('dummyThumbTack2', dummyThumbTack2);
            model.set('vertex1', vertex1);
            model.set('vertex2', vertex2);

            this._drawDummyTackPath();

            model.set('showPopupOnTryAnother', false);
        },

        /**
        * Adds ellipse equation template holder
        * @method _addEllipseEquationHolderTemplate
        * @private
        */
        _addEquationHolderTemplate: function () {

            var template = MathInteractives.Common.Interactivities.ConicExplorer.templates.equationHolder({
                idPrefix: this.idPrefix

            }).trim();
            this.$el.append(template);
        },

        /**
        * Shows/Hides the ellipse equation
        * @method _showHideEquation
        * @private
        * @param showEquation << {{boolean}} >> true or false
        */
        _showHideEquation: function (showEquation) {
            if (showEquation === true) {
                var model = this.model,
                  $el = this.$el,
                  idPrefix = this.idPrefix,
                  equationEllipseA = model.get('majorAxis'),
                  equationEllipseB = model.get('minorAxis'),
                  snappedX = null,
                  gridSizeXAxis = model.get('gridSizeXAxis'),
                  snappedY = null,
                  shapeCenter = model.get('shapeCenter'),
                  center = model.getOriginPosition(),
                  firstEquation,
                  secondEquation,
                  firstDenomenator,
                  equationPadding = null,
                  secondDenomenator,
                  vertex1 = model.get('vertex1'),
                  vertex2 = model.get('vertex2'),
                  foci1 = model.get('foci1');
                equationEllipseA = (equationEllipseA / gridSizeXAxis).toFixed(2);
                equationEllipseB = (equationEllipseB / gridSizeXAxis).toFixed(2);
                snappedX = Math.round((shapeCenter.position.x - center.x) / gridSizeXAxis);
                snappedY = Math.round((center.y - shapeCenter.position.y) / gridSizeXAxis);
                if (vertex1.position.x === vertex2.position.x && vertex1.position.y === vertex2.position.y && (Math.round(equationEllipseB) === 0 || Number(equationEllipseA) === 0)) {
                    if (snappedX < 0) {
                        snappedX = '&minus;' + Math.abs(snappedX);
                    }
                    if (snappedY < 0) {
                        snappedY = '&minus;' + Math.abs(snappedY);
                    }
                    equationPadding = 40;
                    if (this.isVertical === false) {
                        $el.find('#' + idPrefix + 'degenerated-x').html('x');
                        $el.find('#' + idPrefix + 'degenerated-y').html(snappedX);
                    } else {
                        $el.find('#' + idPrefix + 'degenerated-x').html('y');
                        $el.find('#' + idPrefix + 'degenerated-y').html(snappedY);
                    }
                    $el.find('#' + this.idPrefix + 'graph-normal-formula').hide();
                    $el.find('#' + this.idPrefix + 'degenerated-formula').show();
                }
                else if (foci1.position.x === vertex1.position.x && (Math.round(equationEllipseB) === 0 || Number(equationEllipseA) === 0)) {
                    if (snappedX < 0) {
                        snappedX = '&minus;' + Math.abs(snappedX);
                    }
                    if (snappedY < 0) {
                        snappedY = '&minus;' + Math.abs(snappedY);
                    }
                    equationPadding = 40;
                    if (this.isVertical === false) {
                        $el.find('#' + idPrefix + 'degenerated-x').html('y');
                        $el.find('#' + idPrefix + 'degenerated-y').html(snappedY);
                    } else {
                        $el.find('#' + idPrefix + 'degenerated-x').html('x');
                        $el.find('#' + idPrefix + 'degenerated-y').html(snappedX);
                    }
                    $el.find('#' + this.idPrefix + 'graph-normal-formula').hide();
                    $el.find('#' + this.idPrefix + 'degenerated-formula').show();
                }
                else {

                    if (snappedX < 0) {
                        firstEquation = "(<em>x</em> &minus; (" + ' &minus;' + Math.abs(snappedX) + "))<sup>2</sup>";
                    }
                    else {
                        firstEquation = "(<em>x</em> &minus; " + snappedX + ")<sup>2</sup>";
                    }
                    if (snappedY < 0) {
                        secondEquation = "(<em>y</em> &minus; (" + '&minus;' + Math.abs(snappedY) + "))<sup>2</sup>";
                    }
                    else {
                        secondEquation = "(<em>y</em> &minus; " + snappedY + ")<sup>2</sup>";
                    }
                    firstDenomenator = equationEllipseA + "<sup>2</sup>";
                    secondDenomenator = equationEllipseB + "<sup>2</sup>";
                    if (this.isVertical) {
                        $el.find('#' + idPrefix + 'graph-first-numerator').html(secondEquation);
                        $el.find('#' + idPrefix + 'graph-second-numerator').html(firstEquation);
                    } else {
                        $el.find('#' + idPrefix + 'graph-first-numerator').html(firstEquation);
                        $el.find('#' + idPrefix + 'graph-second-numerator').html(secondEquation);
                    }
                    $el.find('#' + idPrefix + 'graph-first-denominator').html(firstDenomenator);
                    $el.find('#' + idPrefix + 'graph-second-denominator').html(secondDenomenator);
                    $el.find('#' + this.idPrefix + 'graph-normal-formula').show();
                    $el.find('#' + this.idPrefix + 'degenerated-formula').hide();
                }
                this._setEquationPosition(equationPadding);
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
        * @method _setEquationPosition
        * @private
        * @param paddingForDegenaratedEllipse << {{Number}} >> padding value for degenerated ellipse
        */
        _setEquationPosition: function (paddingForDegenaratedEllipse) {
            var model = this.model,
                shapeCenter = model.get('shapeCenter').position,
                shapeCenterX = shapeCenter.x,
                shapeCenterY = shapeCenter.y,
                activityAreaStartPoint = model.get('activityAreaStartPoint'),
                activityAreaStartPointX = activityAreaStartPoint.xCoordinate,
                activityAreaStartPointY = activityAreaStartPoint.yCoordinate,
                equationPadding = paddingForDegenaratedEllipse || 75,
                $equationContainer = this.$('#' + this.idPrefix + 'graph-formula'),
                equationWidth = $equationContainer.width(),
                equationHeight = $equationContainer.height(),
                minorAxis = model.get('minorAxis'),
                majorAxis = model.get('majorAxis'),
                foci1X = model.get('foci1').position.x,
                foci2X = model.get('foci2').position.x,
                equationLine = null,
                dashedShaped = this.dummyLeftPath,
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
                padding = 30;

            if (foci1X === foci2X) {
                tempVar = majorAxis;
                majorAxis = minorAxis;
                minorAxis = tempVar;
            }
            if (shapeCenterY + minorAxis / 2 + equationPadding + equationHeight <= activityAreaEndPointY && endBoundryConditionX && startBoundryConditionX) {// show equation at the center
                $equationContainer.css({
                    top: shapeCenterY + minorAxis / 2 + equationPadding,
                    left: shapeCenterX - equationWidth / 2
                });
            }
            else {
                currentYPosition = shapeCenterY + padding + equationHeight;
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
                    });
                }
                else {
                    if (shapeCenterY - minorAxis / 2 - equationPadding - equationHeight >= activityAreaStartPointY && endBoundryConditionX && startBoundryConditionX) {
                        $equationContainer.css({
                            top: shapeCenterY - (minorAxis / 2 + equationPadding + equationHeight),
                            left: shapeCenterX - equationWidth / 2
                        });
                    }
                    else {
                        if (shapeCenterX - majorAxis / 2 - equationPadding - equationWidth >= activityAreaStartPointX && endBoundryConditionY && startBoundryConditionY) {// at the left
                            $equationContainer.css({
                                top: shapeCenterY - equationHeight / 2,
                                left: shapeCenterX - majorAxis / 2 - (equationPadding + equationWidth)
                            });
                        } else {
                            if (shapeCenterX + majorAxis / 2 + equationPadding + equationWidth <= activityAreaEndPointX && endBoundryConditionY && startBoundryConditionY) {// at right
                                $equationContainer.css({
                                    top: shapeCenterY - equationHeight / 2,
                                    left: shapeCenterX + majorAxis / 2 + equationPadding
                                });
                            }
                            else {
                                // at some sectors
                                if (shapeCenterX - (equationPadding + equationWidth + majorAxis) >= activityAreaStartPointX && shapeCenterY - (equationPadding + equationHeight + minorAxis) >= activityAreaStartPointY) {
                                    $equationContainer.css({
                                        top: shapeCenterY - (equationPadding + minorAxis / 2 + equationHeight / 2),
                                        left: shapeCenterX - (equationPadding + majorAxis / 3 + equationWidth / 2)
                                    });
                                }
                                else if (shapeCenterX - (equationPadding + equationWidth + majorAxis) >= activityAreaStartPointX && shapeCenterY + (equationPadding + equationHeight + minorAxis) <= activityAreaEndPointY) {
                                    $equationContainer.css({
                                        top: shapeCenterY + (equationPadding + minorAxis + equationHeight / 4),
                                        left: shapeCenterX - (equationPadding + majorAxis / 2 + equationWidth / 4)
                                    });
                                }
                                else if (shapeCenterX + (equationPadding + equationWidth + majorAxis) <= activityAreaEndPointX && shapeCenterY + (equationPadding + equationHeight + minorAxis) <= activityAreaEndPointY) {
                                    $equationContainer.css({
                                        top: shapeCenterY + (equationPadding + minorAxis + equationHeight / 4),
                                        left: shapeCenterX + (equationPadding + majorAxis / 2 + equationWidth / 4)
                                    });
                                }
                                else if (shapeCenterX + (equationPadding + equationWidth + majorAxis) <= activityAreaEndPointX && shapeCenterY - (equationPadding + equationHeight + minorAxis) >= activityAreaStartPointY) {
                                    $equationContainer.css({
                                        top: shapeCenterY - (equationPadding + minorAxis + equationHeight / 4),
                                        left: shapeCenterX + (equationPadding + majorAxis / 2 + equationWidth / 4)
                                    });
                                }
                                else {
                                    $equationContainer.css({
                                        top: model.getOriginPosition().y - equationHeight / 2,
                                        left: model.getOriginPosition().x - equationWidth / 2
                                    });
                                }
                            }
                        }
                    }
                }
            }
        },

        /**
        * Draws the dashed lines representing the major & minor axis with their labels
        * @method drawLabel
        * @private
        */
        drawLabel: function () {
            var model = this.model,
               foci1 = model.get('foci1'),
               foci2 = model.get('foci2'),
               center = model.getOriginPosition(),
               shapeCenter = model.get('shapeCenter'),
               gridSizeXAxis = model.get('gridSizeXAxis'),
               startingPoint,
               position,
               paperScope = this.paperScope2,
               centerCoordinate = null,
               foci1Cordinate = null,
               foci2Coordinate = null,
               snappedX = null,
               snappedY = null;

            snappedX = Math.round((shapeCenter.position.x - center.x) / gridSizeXAxis);
            snappedY = Math.round((center.y - shapeCenter.position.y) / gridSizeXAxis);
            startingPoint = new paperScope.Point(shapeCenter.position.x, shapeCenter.position.y);

            position = new paperScope.Point(startingPoint.x - 15, startingPoint.y + 25);
            centerCoordinate = this.renderString(snappedX, snappedY, position, 0);

            snappedX = Math.round((foci1.position.x - center.x) / gridSizeXAxis);
            snappedY = Math.round((center.y - foci1.position.y) / gridSizeXAxis);
            startingPoint = new paperScope.Point(foci1.position.x, foci1.position.y);

            position = new paperScope.Point(startingPoint.x - 15, startingPoint.y + 25);
            foci1Cordinate = this.renderString(snappedX, snappedY, position, 0);

            snappedX = Math.round((foci2.position.x - center.x) / gridSizeXAxis);
            snappedY = Math.round((center.y - foci2.position.y) / gridSizeXAxis);
            startingPoint = new paperScope.Point(foci2.position.x, foci2.position.y);

            position = new paperScope.Point(startingPoint.x - 15, startingPoint.y + 25);
            foci2Coordinate = this.renderString(snappedX, snappedY, position, 0);

            model.set('centerCoordinate', centerCoordinate);
            model.set('foci1Cordinate', foci1Cordinate);
            model.set('foci2Coordinate', foci2Coordinate);
        },

        /**
        * Create & display the required point text label
        * @method renderString
        * @private
        * @param text << {{string}} >> text to be displayed on point text
        * @param position << {{object}} >> position of the point text
        * @param angle << {{number}} >> angle by which the point text to be rotated
        * @return  << {{object}} >> created label
        */
        renderString: function (snappedX, snappedY, position, angle) {
            var label;


            label = new this.paperScope2.PointText({ position: { x: position.x, y: position.y } });
            if (snappedX < 0) {
                snappedX = '\u2212' + Math.abs(snappedX);
            }
            if (snappedY < 0) {
                snappedY = '\u2212' + Math.abs(snappedY);
            }
            label.content = '(' + snappedX + ', ' + snappedY + ')';
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

        clearElementsOnCanvas: function () {
            var model = this.model,
                centerCoordinate = model.get('centerCoordinate'),
                foci1Cordinate = model.get('foci1Cordinate'),
                foci2Coordinate = model.get('foci2Coordinate');
            if (centerCoordinate) {
                centerCoordinate.remove();
            }
            if (foci1Cordinate) {
                foci1Cordinate.remove();
            }
            if (foci2Coordinate) {
                foci2Coordinate.remove();
            }
            return;
        },

        loadRequiredState: function loadRequiredState(options) {
            var model = this.model,
                shapeCenter = model.get('shapeCenter'),
                shapeCenterCircle = model.get('shapeCenterCircle'),
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                majorAxis = null,
                minorAxis = null,
                points = null,
                dummyThumbTack1 = model.get('dummyThumbTack1'),
                dummyThumbTack2 = model.get('dummyThumbTack2'),
                asymptote2 = null,
                asymptote1 = null,
                foci = null,
                removePathArray = null,
                count = null,
                currItem = null,
                dummyVertex2 = model.get('dummyVertex2'),
                dummyVertex1 = model.get('dummyVertex1'),
                currstring = null,
                dummyShapeCenter = model.get('dummyShapeCenter');


            shapeCenter.position = options.shapeCenter;
            shapeCenterCircle.position = options.shapeCenter;
            dummyShapeCenter.position = options.position;
            vertex1.position = options.vertex1;
            vertex2.position = options.vertex2;
            dummyVertex2.position = vertex2.position;
            dummyVertex1.position = vertex1.position;
            foci1.position = options.foci1;
            foci2.position = options.foci2;
            thumbTack1.position = options.finalThumbTack1Position;
            thumbTack2.position = options.finalThumbTack2Position;
            dummyThumbTack1.position = options.finalThumbTack1Position;
            dummyThumbTack2.position = options.finalThumbTack2Position;
            //this.isVertical = false;
            this.isVertical = options.isVertical;
            model.set('shapeCenter', shapeCenter);
            model.set('dummyShapeCenter', dummyShapeCenter);
            model.set('vertex1', vertex1);
            model.set('foci1', foci1);
            this._calculateMajorAxisAndMinorAxis();
            majorAxis = this.model.get('majorAxis');
            minorAxis = this.model.get('minorAxis');
            points = this.returnHyperBolaPoints(options.shapeCenter, majorAxis, minorAxis, this.pointsRange);
            model.set('points', points);
            model.set('center', options.shapeCenter);
            this._drawAsymptotes();
            asymptote2 = model.get('asymptote2');
            asymptote1 = model.get('asymptote1');
            model.set('shapeCenter', shapeCenter);
            model.set('vertex1', vertex1);
            model.set('vertex2', vertex2);
            model.set('foci1', foci1);
            model.set('foci2', foci2);
            model.set('thumbTack1', thumbTack1);
            model.set('thumbTack2', thumbTack2);

            model.set('dummyVertex2', dummyVertex2);
            model.set('dummyVertex1', dummyVertex1);
            this._redrawStringsAndUpdateGroup();
            this.rightPath.strokeColor = '#555555';
            this.leftPath.strokeColor = '#555555';
            asymptote1.strokeColor = '#a4a19d';
            asymptote2.strokeColor = '#a4a19d';

            this.drawLabel();
            this.generateBubbles();
            this._showHideEquation(true);
            this._getInterSectingBubbles();
            var temp = {};
            if ((thumbTack1.position.x >= this.areaDimension[0] && thumbTack1.position.x <= this.areaDimension[2]) && (thumbTack1.position.y >= this.areaDimension[1] && thumbTack1.position.y <= this.areaDimension[3])) {
                currItem = thumbTack1;
                currstring = 'thumbTack1';
            } else {
                currItem = thumbTack2;
                currstring = 'thumbTack2';
            }
            temp.point = currItem.position;
            this.entireGroup.currentItem = currstring;
            this.adjustThumbTackPosition(temp);
            this.entireGroup.currentItem = null;
        },

        /**
        * Initializes accessibility
        *
        * @method _initAccessibility
        * @private
        */
        _initAccessibility: function () {
            var canvasAccOption = {
                canvasHolderID: this.el.id + '-conic-graph-acc-container',
                paperItems: [],
                paperScope: this.paperScope2,
                manager: this.manager,
                player: this.player
            };

            this.canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc(canvasAccOption);
            this.updateCanvasElement(true);

        },
        updateCanvasElement: function (value) {
            if (this.canvasAcc) {
                if (value) {
                    this.canvasAcc.updatePaperItems(this.getPaperObjects());
                }
                else {
                    this.canvasAcc.updatePaperItems();
                }
                this.currentIndex = null;
            }
        },
        /**
        * Gets all current paper objects on canvas
        *     
        * @method getPaperObjects
        * return {Array} [paperObj] array of paper objects
        **/
        getPaperObjects: function () {

            var model = this.model,
                shapeCenter = model.get('shapeCenter'),
                vertex1 = model.get('vertex1'),
                vertex2 = model.get('vertex2'),
                foci1 = model.get('foci1'),
                foci2 = model.get('foci2'),
                thumbTack1 = model.get('thumbTack1'),
                thumbTack2 = model.get('thumbTack2'),
                draggingDisabled = model.get('draggingDisabled'),
                paperObj = [];

            if (!draggingDisabled) {

                paperObj.push(shapeCenter, foci1, foci2, vertex1, vertex2);
            }
            //if (isThumbTackMovable === true) {
            //thumbTack = model.get('thumbTack');
            paperObj.push(thumbTack1, thumbTack2);
            //}
            return paperObj;

        },
        _bindAccessibilityListeners: function () {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                 canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                 $canvasHolder = $('#' + this.el.id + '-conic-graph-acc-container'),
                 self = this,
                 item = null,
                 eventData = null;

            // Handle tab
            $canvasHolder.on(keyEvents.TAB, function (event, data) {

                eventData = null;

                item = data.item;
                if (item.name === 'thumbTack1') {
                    data.item = self.model.get('thumbTack1');
                } else if (item.name === 'thumbTack2') {
                    data.item = self.model.get('thumbTack2');
                }
                item = data.item;
                eventData = [event, data];
                self.currentItem = item;
                if (self.previousItem) {
                    self.previousItem.fire('mouseleave', event);
                    self.previousItem.fire('mouseup', event);
                }
                if (!self.entireGroup._namedChildren.thumbTack1 && (item.name === 'thumbTack1' || item.name === 'thumbTack2')) {
                    self.previousItem = null;
                    self.focusRect.visible = false;
                    self.focusRect.opacity = 0;

                    self.trigger(self.viewStaticData.CUSTOM_EVENTS.focusOut, eventData);
                    self.paperScope2.view.draw();
                    self.canvasAcc.canvasFocusOut();

                } else {
                    self.previousItem = item;
                    self.focusRect.position = item.position;
                    self.focusRect.visible = true;
                    self.focusRect.opacity = 1;
                    self.trigger(self.viewStaticData.CUSTOM_EVENTS.tabKeyPressed, eventData);
                }
            });

            // Handle space
            $canvasHolder.on(keyEvents.SPACE, function (event, data) {

                eventData = null;
                eventData = [event, data];
                item = data.item;
                if (item.name === 'thumbTack1') {
                    data.item = self.model.get('thumbTack1');
                } else if (item.name === 'thumbTack2') {
                    data.item = self.model.get('thumbTack2');
                }
                item = data.item;
                eventData = [event, data];
                self.currentItem = item;
                self.previousItem = item;
                self.focusRect.position = item.position;
                self.focusRect.visible = true;
                self.focusRect.opacity = 1;
                self.trigger(self.viewStaticData.CUSTOM_EVENTS.spaceKeyPressed, eventData);



            });


            // Handle focus out
            $canvasHolder.on(canvasEvents.FOCUS_OUT, function (event, data) {

                eventData = null;
                eventData = [event, data];
                item = data.item;
                if (self.previousItem) {

                    self.previousItem.fire('mouseleave', event);
                    self.previousItem.fire('mouseup', event);
                }
                self.previousItem = null;
                self.focusRect.visible = false;
                self.focusRect.opacity = 0;

                self.trigger(self.viewStaticData.CUSTOM_EVENTS.focusOut, eventData);
                self.paperScope2.view.draw();


            });

            $canvasHolder.on('focusin', function (event, data) {

                self.trigger(self.viewStaticData.CUSTOM_EVENTS.focusIn, eventData);
                self.paperScope2.view.draw();
            });

            $canvasHolder.off(keyEvents.ARROW).on(keyEvents.ARROW, $.proxy(this.arrowKeyPressed, this));
        },


        arrowKeyPressed: function arrowKeyPressed(event, data) {
            var eventData = null,
                item = data.item;

            if (item.name === 'thumbTack1') {
                data.item = this.model.get('thumbTack1');
            } else if (item.name === 'thumbTack2') {
                data.item = this.model.get('thumbTack2');
            }
            eventData = [event, data];
            this.draggableElement = item;
            this.trigger(this.viewStaticData.CUSTOM_EVENTS.arrowKeyPressed, eventData);
            this.paperScope2.view.draw();


        }

    }, {
        ADD_X_POSITION: {
            'red': 500,
            'purple': 500,
            'Barred': 900,
            'Barpurple': 700,
            'black': 400
        },
        CUSTOM_EVENTS: {
            animationComplete: 'animationComplete',
            bubblePopAnimationStart: 'bubblePopAnimationStart',
            bubblePopAnimationEnd: 'bubblePopAnimationEnd',
            bubblePopulationAnimationEnd: 'bubblePopulationAnimationEnd',
            bubblePopulationAnimationStart: 'bubblePopulationAnimationStart',
            initializationDone: 'initializationDone',
            hideHyderbola: 'hideHyderbola',
            showHyderbola: 'showHyderbola',
            arrowKeyPressed: 'arrowKeyPressed',
            tabKeyPressed: 'tabKeyPressed',
            spaceKeyPressed: 'spaceKeyPressed',
            focusOut: "focusOut",
            focusIn: 'focusIn'
        },

        /**
        * store radius of bubbles
        * @type object   
        */
        RADIUS_OF_BUBBLES: {
            largeBubbleRadius: 20,
            smallBubbleRadius: 11,
            middleBubbleRadius: 15
        },

        ANIMATION_SPEED_FACTOR: 5,

        INITIAL_FOCI_MIN_LIMIT: 4,

        INITIAL_FOCI_MAX_LIMIT: 6,

        INITIAL_VERTEX_MIN_LIMIT: 3,

        INITIAL_VERTEX_MAX_LIMIT: 5,

        INITIAL_Y_START_COORDINATE: 4,

        INITIAL_THUMBTACK_MIN_LIMIT: 60,

        INITIAL_THUMBTACK_MAX_LIMIT: 200,

        MINOR_AXIS_DEFAULT: 4,

        MAJOR_AXIS_DEFAULT: 3,

        FOCI_DEFAULT: 5,
        /**
        * Create explorer shape model for given options
        * @method createExplorerShapeView
        * @param {object} options
        */
        createExplorerShapeView: function (options) {
            var model = options.model,
                el = '#' + options.contanierId,
                explorerShapeView = new MathInteractives.Common.Interactivities.ConicExplorer.Views.ConicPlotter({ el: el, model: model });

            return explorerShapeView;
        }
    });
})(window.MathInteractives);