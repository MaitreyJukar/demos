(function () {
    'use strict';

    /**
    * View for rendering ExplorerGraph
    *
    * @class ExplorerGraph
    * @constructor
    * @namespace MathInteractives.Common.Components.ExplorerGraph
    **/

    MathInteractives.Common.Components.Views.ExplorerGraph = MathInteractives.Common.Player.Views.Base.extend({



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
        * @property staticDataholderView
        * @type Object
        * @default null
        */
        staticDataholderView: null,

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

        /**
        * Holds the current snapping x coordinate
        *
        * @property snappedX
        * @type Object
        * @default null
        */
        snappedX: null,

        /**
        * Holds the current snapping y coordinate
        *
        * @property snappedY
        * @type Object
        * @default null
        */
        snappedY: null,

        /**
        * Holds the current graph origin point
        *
        * @property origin
        * @type Object
        * @default null
        */
        origin: null,


        /**
        * Holds the actual canvas x points
        *
        * @property actualSnappedPointX
        * @type Object
        * @default null
        */
        actualSnappedPointX: null,

        /**
        * Holds the actual canvas y points
        *
        * @property actualSnappedPointY
        * @type Object
        * @default null
        */

        actualSnappedPointY: null,


        /**
        * Calls render and set values of player and manager and attach events
        *
        * @method initialize
        **/

        initialize: function () {

            var model = this.model;

            this.idPrefix = model.get('idPrefix');
            this.manager = model.get('manager');
            this.filePath = model.get('filePath');
            this.player = model.get('player');
            this.staticDataholderView = MathInteractives.Common.Components.Views.ExplorerGraph;
            this._renderGraph();
            this._bindEvents();
        },



        /**
        * Renders graph
        *
        * @method _renderGraph
        * @private
        **/
        _renderGraph: function () {

            var self = this,
                model = self.model;

            self._appendCanvas();
            self._setPaperScope();
            self._setCanvasStyle();
            self._setMarginToCanvas();
            self._drawGrid();
            self._hideToolTip();


        },

        /**
        * attach events on various tool
        * @method _bindEvents
        * @private
        */
        _bindEvents: function () {

            var currentTool = this.currentTool,
                self = this;

            //currentTool.onMouseMove = function (event) {

            //    self._showMousemoveFeatures(event);

            //};


            currentTool.onMouseDown = function (event) {
                self._setSnappedpoints(event);
                console.log(self.actualSnappedPointX);
                console.log(self.actualSnappedPointY);
            }

            currentTool.onMouseUp = function (event) {
                self._setSnappedpoints(event);
                console.log(self.actualSnappedPointX);
                console.log(self.actualSnappedPointY);
            }
        },


        /**
        * show tooltip and other features on mousemove
        * @method _showMousemoveFeatures
        * @param {object} event its paper event
        * @private
        */
        _showMousemoveFeatures: function (event) {
            var model = this.model,
                showTooltip = model.getShowToolTip();

            this._setSnappedpoints(event);
            if (showTooltip) {
                this._showTooltip(event);
            }
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
        },

        //set paperscope and tool
        _setPaperScope: function () {

            var myPaper = this.paperScope = new paper.PaperScope();
            myPaper.setup(this.el.id + '-canvas-element');
            this.currentTool = new myPaper.Tool();
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

            })

            canvasElement.css({
                'background-color': canvasBackGrndColor

            })
        },


        /**
        * set canvas position inside its holder with the margin
        * @method _setMarginToCanvas
        * @private
        */
        _setMarginToCanvas: function () {

            var model = this.model,
                canvasMargin = model.getCannvasMargin(),
                $el = this.$el,
                containerId = $el.attr('id'),
                canvasElement = $el.find('#' + containerId + '-canvas-element');

            if (canvasMargin.left !== 0) {

                canvasElement.css({ 'margin-left': canvasMargin.left });
            }

            if (canvasMargin.right !== 0) {

                canvasElement.css({ 'margin-right': canvasMargin.right });
            }
            if (canvasMargin.top !== 0) {

                canvasElement.css({ 'margin-top': canvasMargin.top })
            }
            if (canvasMargin.bottom !== 0) {

                canvasElement.css({ 'margin-bottom': canvasMargin.bottom })
            }
        },




        _drawGrid: function () {

            var self = this;

            self._drawCenterPostionGrid();


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
                xUnitsPerGrid = model.getXUnitsPerGrid(),
                yUnitsPerGrid = model.getYUnitsPerGrid(),

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
                    dashArray = [3, 1]

                }
                else {
                    if (toggleGridColor === false) {
                        toggleGridColor = true;
                        gridColor = secondXAxisGridColor;
                        dashArray = [4, 1]
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
                        dashArray = [4, 1]
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

        //

        /**
        * hide tooltip when mouse is outside the canvas
        * @method _hideToolTip
        * @private
        */
        _hideToolTip: function () {
            var containerId = this.el.id;

            this.$('#' + containerId + '-canvas-tooltip').hide();
        },

        /**
        * show tooltip when mouse is inside the canvas
        * @method _showTooltip
        * @param {object} event paper event
        * @private
        */
        _showTooltip: function (event) {

            var origin = this.origin,
                model = this.model,
                canvasHeight = model.getCanvasHeight(),
                canvasWidth = model.getCanvasWidth(),
                containerId = this.el.id,
                $tooltip = this.$('#' + containerId + '-canvas-tooltip'),
                currentPoint = event.point,
                currentX = currentPoint.x,
                currentY = currentPoint.y,
                toolTipMarginTop = model.getToolTipMarginTop(),
                toolTipMarginLeft = model.getToolTipMarginLeft();

            if (currentX < canvasWidth && currentX > 0 && currentY < canvasHeight && currentY > 0) {//canvas bounds to show tooltip
                $tooltip.css({

                    top: currentY + toolTipMarginTop,
                    left: currentX + toolTipMarginLeft
                }).show();


                $tooltip.html(this.snappedX + ' ' + this.snappedY);
            }
            else {
                this._hideToolTip();

            }


        },

        /**
        * show tooltip points
        * @method _setSnappedpoints
        * @param {object} event paper event
        * @private
        */
        _setSnappedpoints: function (event) {

            var model = this.model,
                currentPoint = event.point,
                currentX = currentPoint.x,
                currentY = currentPoint.y,
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
        _calculateSnappedpoints: function (point) {

            var model = this.model,
                currentPoint = point,
                currentX = currentPoint.x,
                currentY = currentPoint.y,
                origin = model.get('originPosition'),
                originX = origin.x,
                originY = origin.y,
                snappedX = null,
                snappedY = null,
                xAxisGridSize = model.getGridSizeXAxis(),
                yAxisGridSize = model.getGridSizeYAxis(),
                xUnitsPerGrid = model.getXUnitsPerGrid(),
                yUnitsperGrid = model.getYUnitsPerGrid(),
                points = null,
                diffrence = null;

            diffrence = currentX - originX;

            snappedX = Math.round((Math.abs(diffrence) / xAxisGridSize)) * xUnitsPerGrid;


            if (currentX < originX) {

                snappedX = -snappedX;

            }

            diffrence = currentY - originY;

            snappedY = Math.round((Math.abs(diffrence) / yAxisGridSize)) * yUnitsperGrid;


            if (currentY > originY) {

                snappedY = -snappedY;

            }

            points = {
                'x': snappedX,
                'y': snappedY
            };

            return points;



        },

        /**
        * on extending this view into some other to call original initialize function
        * show tooltip points
        * @method _callBaseViewInitialize      
        * @private
        */
        _callBaseViewInitialize: function _callBaseViewInitialize() {

            MathInteractives.Common.Components.Views.ExplorerGraph.prototype.initialize.call(this)


        }
        //,


        //_super: function _super() {

        //    var callerFunction = _super.caller,
        //        strName = callerFunction.name || null,
        //        oThis = this,
        //        arrTemp = [],
        //        count = null;
        //    if (strName === null) {

        //        strName = callerFunction.toString().match(/function\s+([^\s\(]+)/)[1];
        //    }
        //    if (!strName) {
        //        throw new Error("Please assign a name to the anonymous function from where super is called " + callerFunction.toString());
        //    }
        //    while (oThis.constructor.__super__) {
        //        arrTemp.push(oThis);
        //        oThis = oThis.constructor.__super__;
        //    }
        //    for (count = arrTemp.length - 1; count >= 0; count--) {
        //        oThis = arrTemp[count];
        //        if (callerFunction === oThis[strName]) {
        //            break;
        //        }
        //    }
        //    oThis.constructor.__super__[strName].apply(this, arguments);
        //}


    },




    // static part starts from here
    {
        CUSTOM_EVENTS: {


        },
        /**
        * static function to create  explorer  graph
        *
        * @method createExplorerGraphView
        * @param {object} options to create view of graph 
        * @return {object} explorerGraphView view of graph
        **/
        createExplorerGraphView: function (options) {

            var model = options.model,
                        el = '#' + options.contanierId,
                        explorerGraphView = new MathInteractives.Common.Components.Views.ExplorerGraph({ el: el, model: model });

            return explorerGraphView;


        }



    })
})();