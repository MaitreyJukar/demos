(function () {
    'use strict';

    /**
    * View for rendering ExplorerGraph
    *
    * @class ExplorerGraph
    * @constructor
    * @namespace MathInteractives.Common.Components.ExplorerGraph
    **/

    MathInteractives.Common.Components.Models.ExplorerGraph = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {

                /** Stores canvas parent height
                * @type Number
                * @default 599
                */
                canvasParentHeight: 599,

                /** Stores canvas parent width
                * @type Number
                * @default 928
                */
                canvasParentWidth: 928,

                /** Stores canvas height
                * @type Number
                * @default 599
                */
                canvasHeight: 599,

                /** Stores canvas width
                * @type Number
                * @default 928
                */
                canvasWidth: 928,

                /** Stores grid width
                * @type Number
                * @default 15
                */
                gridSizeXAxis: 15,

                /** Stores grid height
                * @type Number
                * @default 15
                */
                gridSizeYAxis: 15,

                /** Stores x axis length
                * @type Number
                * @default 928
                */
                xAxisLength: 928,

                /** Stores y axis length
                * @type Number
                * @default 599
                */
                yAxisLength: 599,

                /** Stores x axis units per grid
                * @type Number
                * @default 1
                */
                xUnitsPerGrid: 1,

                /** Stores y axis units per grid
                * @type Number
                * @default 1
                */
                yUnitsPerGrid: 1,

                /** Stores tooltip margin from top
                * @type Number
                * @default 15
                */
                toolTipMarginTop: 15,

                /** Stores tooltip margin from left
                * @type Number
                * @default -15
                */
                toolTipMarginLeft: -15,


                /** store the  x axis color
                * @type string
                * @default #777777
                */
                xAxisColor: '#777777',

                /** store the  y axis color
                * @type string
                * @default #777777
                */
                yAxisColor: '#777777',

                /** store the  x axis grid color
                * @type string
                * @default #E6E3DD
                */
                xAxisGridColor: '#c8c5c0',

                /** store the  y axis grid color
                * @type string
                * @default #E6E3DD
                */
                yAxisGridColor: '#c8c5c0',

                /** store the  canvas background color
                * @type string
                * @default #FFFCF5
                */
                canvasBackgroundColor: '#FFFCF5',

                /**
               * weather to toggle grid color
               * @type Bool
               * @default null
               */
                toggleGridColor: null,

                /**
                * second x axis grid color if toogle grid color is true
                * @type string
                * @default #C8C5C0
                */
                secondXAxisGridColor: '#C8C5C0',

                /**
                * second y axis grid color if toogle grid color is true
                * @type string
                * @default #C8C5C0
                */
                secondYAxisGridColor: '#C8C5C0',

                /**
                * weather toshow tooltip or not
                * @type Bool
                * @default true
                */
                showToolTip: true,

                /**
                * store the origin position for graph
                * @type object
                * @default x =479, y328 relative to canvas
                */
                originPosition: {
                    x: 479,
                    y: 328

                },

                /** Stores tooltip margin from top
                * @type Number
                * @default 15
                */
                snappedX: 0,

                /** Stores tooltip x value
                * @type Number
                * @default 0
                */
                snappedY: 0,
                /** Stores Stores snapped x value
                * @type Number
                * @default 0
                */
                actualSnappedPointX: 0,

                /** Stores snapped y value
                * @type Number
                * @default 0
                */
                actualSnappedPointY: 0,

                /**
                * set margin to canvas relative to its parent
                * @type object
                * @default top=0,right=0,bottom=0,left=0
                */
                cannvasMargin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            }
        },

        initialize: function () {
            this.setActualSnappingPointValues();
        },
        /*getter and setter of model*/

        setActualSnappingPointValues: function () {

            var originPosition = this.get('originPosition');

            this.set('actualSnappedPointX', originPosition.x);
            this.set('actualSnappedPointY', originPosition.y);
        },

        getCanvasParentHeight: function () {

            return this.get('canvasParentHeight')

        },

        setCanvasParentHeight: function (value) {

            this.set('canvasParentHeight', value);
        },

        getCanvasParentWidth: function () {

            return this.get('canvasParentWidth')

        },

        setCanvasParentWidth: function (value) {

            this.set('canvasParentWidth', value);
        },

        getCanvasWidth: function () {

            return this.get('canvasWidth')

        },

        setCanvasWidth: function (value) {

            return this.set('canvasWidth', value)

        },
        getCanvasHeight: function () {

            return this.get('canvasHeight')

        },

        setCanvasHeight: function (value) {

            return this.set('canvasHeight', value)

        },

        getCannvasMargin: function () {

            return this.get('cannvasMargin')
        },

        getGridSizeXAxis: function () {

            return this.get('gridSizeXAxis');
        },

        setGridSizeXAxis: function (value) {

            this.set('gridSizeXAxis', value)
        },

        getGridSizeYAxis: function () {

            return this.get('gridSizeYAxis');
        },

        setGridSizeYAxis: function (value) {

            this.set('gridSizeYAxis', value)
        },

        getXUnitsPerGrid: function () {

            return this.get('xUnitsPerGrid');
        },

        setXUnitsPerGrid: function (value) {

            this.set('xUnitsPerGrid', value)
        },
        getYUnitsPerGrid: function () {

            return this.get('yUnitsPerGrid');
        },

        setYUnitsPerGrid: function (value) {

            this.set('yUnitsPerGrid', value)
        },
        getXAxisLength: function () {

            return this.get('xAxisLength');
        },

        setXAxisLength: function (value) {

            this.set('xAxisLength');
        },

        getYAxisLength: function () {

            return this.get('yAxisLength');
        },

        setYAxisLength: function (value) {

            this.set('yAxisLength');
        },
        getcanvasBackgroundColor: function () {

            return this.get('canvasBackgroundColor');
        },

        setCanvasBackgroundColor: function (value) {
            this.set('canvasBackgroundColor', value)

        },

        getXAxisColor: function () {

            return this.get('xAxisColor')
        },

        setXAxisColor: function (value) {

            this.set('xAxisColor', value);
        },

        getYAxisColor: function () {

            return this.get('yAxisColor')
        },

        setYAxisColor: function (value) {

            this.set('yAxisColor', value);
        },

        getXAxisGridColor: function () {

            return this.get('xAxisGridColor');
        },
        setXAxisGridColor: function (value) {

            this.set('xAxisGridColor', value);
        },

        getYAxisGridColor: function () {

            return this.get('yAxisGridColor');
        },
        setYAxisGridColor: function (value) {

            this.set('yAxisGridColor', value);
        },
        getSecondXAxisGridColor: function () {

            return this.get('secondXAxisGridColor');
        },

        setSecondXAxisGridColor: function (value) {
            this.set('secondXAxisGridColor', value)

        },


        getSecondYAxisGridColor: function () {

            return this.get('secondYAxisGridColor');
        },

        setSecondYAxisGridColor: function (value) {
            this.set('secondYAxisGridColor', value)

        },
        getOriginPosition: function () {

            return this.get('originPosition');
        },

        setOriginPosition: function (value) {

            this.set('originPosition', value);
        },

        setCanvasMargin: function () {

            var argumentLength = arguments.length,
                canvasMargin = this.getCannvasMargin(),
                currentMargin = null;

            if (argumentLength = 1) {

                currentMargin = arguments[0];
                canvasMargin.left = currentMargin;
                canvasMargin.right = currentMargin;
                canvasMargin.top = currentMargin;
                canvasMargin.bottom = currentMargin;

            }
            else {

                if (argumentLength === 2) {

                    currentMargin = arguments[0];
                    canvasMargin.top = currentMargin;
                    canvasMargin.bottom = currentMargin;

                    currentMargin = arguments[1];
                    canvasMargin.right = currentMargin;
                    canvasMargin.left = currentMargin;


                }
                else {

                    if (argumentLength === 3) {

                        canvasMargin.top = arguments[0];
                        canvasMargin.right = arguments[1];
                        canvasMargin.bottom = arguments[2];

                    }
                    else {

                        if (argumentLength === 4) {

                            canvasMargin.top = arguments[0];
                            canvasMargin.right = arguments[1];
                            canvasMargin.bottom = arguments[2];
                            canvasMargin.left = arguments[3];

                        }
                    }

                }
            }


        },



        isToggleGridColor: function () {

            return this.get('toggleGridColor')
        },

        getToolTipMarginTop: function () {

            return this.get('toolTipMarginTop');
        },

        setToolTipMarginTop: function (value) {

            this.set('toolTipMarginTop', value)
        },


        getToolTipMarginLeft: function () {
            return this.get('toolTipMarginLeft');

        },

        setToolTipMarginLeft: function (value) {

            this.set('toolTipMarginLeft', value)
        },
        getShowToolTip: function () {

            return this.get('showToolTip');
        },

        setShowToolTip: function (value) {

            this.set('showToolTip', value);
        }

    },

    // static part starts from here
    {

        CUSTOM_EVENTS: {


        },
        /**
       * static function to create  explorer graph model
       *
       * @method createExplorerGraphModel
       * @param {object} options to create model of graph 
       * @return {object} explorerGraphModel model of graph
       **/
        createExplorerGraphModel: function (options) {


            return new MathInteractives.Common.Components.Models.ExplorerGraph(options);




        }



    })
})();