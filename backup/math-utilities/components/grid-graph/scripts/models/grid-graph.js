/* globals window */


(function(MathUtilities) {
    'use strict';
    if (typeof MathUtilities.Components.Graph === 'undefined') {
        MathUtilities.Components.Graph = {};
        MathUtilities.Components.Graph.Models = {};
        MathUtilities.Components.Graph.Views = {};
    }
    /**
     *@class GridGraphModel
     *@extends Backbone.model
     */
    MathUtilities.Components.Graph.Models.GridGraphModel = Backbone.Model.extend({
        "defaults": function() {
            return {
                "_points": [],
                "_plots": [],
                "_images": [],

                "markerBounds": {
                    "max": {
                        "x": null,
                        "y": null,
                        "\\theta": null
                    },
                    "min": {
                        "x": null,
                        "y": null,
                        "\\theta": null
                    }
                },

                "_gridMode": 'Graph',

                "toolTipPrecision": MathUtilities.Components.Utils.Models.MathHelper.DEFAULT_PRECISION_VALUE_GRAPHING_TOOL,

                /**
                 * Contain ID's of Dom elements.
                 * @property  ID
                 * @type {Object}
                 * @static
                 */
                "ID": {
                    "canvasId": null,
                    "XLowerTextBox": null,
                    "XUpperTextBox": null,
                    "YLowerTextBox": null,
                    "YUpperTextBox": null,
                    "graphTypeButton": null,
                    "zoomInButton": null,
                    "zoomOutButton": null,
                    "restoreDefaultZooming": null,
                    "gridLineDisplayButton": null,
                    "labelLineDisplayButton": null,
                    "axesLinesDisplayButton": null,
                    "equalizeAxisScaleButton": null,
                    "equalizeAxisScaleLabel": null,
                    "projectorModeButton": null,
                    "xAxisLabelInRadian": null,
                    "xAxisLabelInDegree": null,
                    "yAxisLabelInRadian": null,
                    "yAxisLabelInDegree": null,
                    "polarAngleInDegree": null,
                    "polarAngleInRadian": null,
                    "polarAngleLinesButton": null,
                    "xAxisLableStyleButton": null,
                    "yAxisLabelStyleButton": null
                },

                "circleDrag": null,


                /**
                 * It is used to stop or start default graph zoom behavior.
                 * if value is true, then graph default zoom behavior is performed.
                 *
                 * @property  isGraphDefaultZoomBehaviourAllowed
                 * @type {Object}
                 */

                "_isGraphDefaultZoomBehaviourAllowed": null,

                /**
                 * It is used to stop or start default graph pan behavior.
                 * if value is true, then graph default pan behavior is performed.
                 *
                 * @property  isGraphDefaultPanBehaviourAllowed
                 * @type {Object}
                 */
                "_isGraphDefaultPanBehaviourAllowed": null,

                /**
                 * WIll be used in DGT. In this mode panning is done through scrollbars, for normal cases simple dragging will perform the panning.
                 *
                 *
                 */
                "_useScrollBarsForPanning": false,


                "_graphDisplayValues": {
                    "_graphDisplay": {
                        "isCartesionCurrentGraphType": true,
                        "isLabelShown": true,
                        "isGridLineShown": true,
                        "isAxisLinesShown": true,
                        "isProjectorModeOn": false,
                        "isXmarkerInRadians": false,
                        "isYmarkerInRadians": false,
                        "isPolarAngleInRadian": true,
                        "isEqualizeAtDefault": true
                    },
                    "_graphsAxisLimits": {
                        "defaultLimits": {
                            "xLower": null,
                            "xUpper": null,
                            "yLower": null,
                            "yUpper": null
                        },
                        "currentLimits": {
                            "xLower": null,
                            "xUpper": null,
                            "yLower": null,
                            "yUpper": null
                        },
                        "isXLastChangedLimit": null
                    },
                    "_graphOrigin": {
                        "currentOrigin": null,
                        "defaultOrigin": null,
                        "doubleClickedPoint": null,
                        "isOriginPositionChanged": null
                    },
                    "_graphParameters": {
                        "graphGridLine": null,
                        "yGridLine": null,
                        "xGridLine": null,
                        "totalVerticalLines": null,
                        "distanceBetweenTwoVerticalLines": null,
                        "totalHorizontalLines": null,
                        "distanceBetweenTwoHorizontalLines": null
                    },
                    "_zoomingFactor": {
                        "previousZoomAngle": null,
                        "zoomLevel": null,
                        "zoomFactorForGraphParameterModification": null,
                        "xZoomFactorForGraphParameterModification": null,
                        "yZoomFactorForGraphParameterModification": null,
                        "doubleClickZoomAllow": true,
                        "xCurrentFactor": null,
                        "yCurrentFactor": null,
                        "xZoomMultiplier": null,
                        "yZoomMultiplier": null,
                        "xTotalMultiplier": null,
                        "yTotalMultiplier": null
                    },
                    "_graphLimitTextBoxDomElement": {
                        "xLower": null,
                        "xUpper": null,
                        "yLower": null,
                        "yUpper": null
                    },
                    "_symbols": {
                        "xAxis": null,
                        "yAxis": null,
                        "xMarkerLines": null,
                        "yMarkerLines": null,
                        "xInnerGridLines": null,
                        "yInnerGridLines": null
                    }
                },

                "settingsOption": {
                    "XLowerTextBox": 'x-lower-text-box',
                    "XUpperTextBox": 'x-upper-text-box',
                    "YLowerTextBox": 'y-lower-text-box',
                    "YUpperTextBox": 'y-upper-text-box',
                    "graphTypeButton": 'change-graph-type',
                    "zoomInButton": 'zoom-graph',
                    "zoomOutButton": 'zoom-out-graph',
                    "restoreDefaultZooming": 'restore-default-zoom',
                    "gridLineDisplayButton": 'toggle-grid-line-display',
                    "labelLineDisplayButton": 'toggle-label-display',
                    "axesLinesDisplayButton": 'toggle-axes-display',
                    "equalizeAxisScaleButton": 'equalize-axis',
                    "equalizeAxisScaleLabel": 'equalize-axis-text',
                    "projectorModeButton": 'toggle-projector-mode',
                    "xAxisLabelInRadian": 'change-x-axis-label-to-radian',
                    "xAxisLabelInDegree": 'change-x-axis-label-to-degree',
                    "yAxisLabelInRadian": 'change-y-axis-label-to-radian',
                    "yAxisLabelInDegree": 'change-y-axis-label-to-degree',
                    "polarAngleInDegree": 'change-polar-angle-label-to-degree',
                    "polarAngleInRadian": 'change-polar-angle-label-to-radian',
                    "polarAngleLinesButton": 'toggle-polar-angle-label-style',
                    "xAxisLableStyleButton": 'toggle-x-axis-label-style',
                    "yAxisLabelStyleButton": 'toggle-y-axis-label-style'
                },
                "isRightClick": null,

                "gridLineStyle": {
                    "color": {
                        "xLine": {
                            "gridLine": [0.9, 0.9, 0.9],
                            "gridLineProjector": [0.8, 0.8, 0.8],
                            "markerLine": [0.7, 0.7, 0.7],
                            "markerLineProjector": [0.4, 0.4, 0.4],
                            "axisLine": [0, 0, 0],
                            "axisLineProjector": [0, 0, 0]
                        },

                        "yLine": {
                            "gridLine": [0.9, 0.9, 0.9],
                            "gridLineProjector": [0.8, 0.8, 0.8],
                            "markerLine": [0.7, 0.7, 0.7],
                            "markerLineProjector": [0.4, 0.4, 0.4],
                            "axisLine": [0, 0, 0],
                            "axisLineProjector": [0, 0, 0]
                        }
                    },
                    "size": {
                        "xLine": {
                            "gridLine": 1,
                            "gridLineProjector": 2,
                            "markerLine": 1,
                            "markerLineProjector": 2,
                            "axisLine": 1,
                            "axisLineProjector": 2
                        },

                        "yLine": {
                            "gridLine": 1,
                            "gridLineProjector": 2,
                            "markerLine": 1,
                            "markerLineProjector": 2,
                            "axisLine": 1,
                            "axisLineProjector": 2
                        }
                    }
                }
            };
        },

        "setModelAttribute": function(data) {

            var graphDisplayValues,
                markerBounds;

            this.set('_points', []);
            this.set('_plots', []);

            this.set('markerBounds', data.markerBounds);
            this.set('_useScrollBarsForPanning', data._useScrollBarsForPanning);
            graphDisplayValues = this.get('_graphDisplayValues');
            graphDisplayValues._graphDisplay = data.graphDisplay;

            graphDisplayValues._graphsAxisLimits.currentLimits.xLower = data.currentLimits.xLower;
            graphDisplayValues._graphsAxisLimits.currentLimits.xUpper = data.currentLimits.xUpper;
            graphDisplayValues._graphsAxisLimits.currentLimits.yLower = data.currentLimits.yLower;
            graphDisplayValues._graphsAxisLimits.currentLimits.yUpper = data.currentLimits.yUpper;

            markerBounds = this.get('markerBounds');

            markerBounds.max.x = data.currentLimits.xUpper;
            markerBounds.max.y = data.currentLimits.yUpper;
            markerBounds.min.x = data.currentLimits.xLower;
            markerBounds.min.y = data.currentLimits.yLower;


            graphDisplayValues._graphOrigin.currentOrigin.x = data.graphOrigin.currentOrigin.x;
            graphDisplayValues._graphOrigin.currentOrigin.y = data.graphOrigin.currentOrigin.y;

            graphDisplayValues._graphOrigin.isOriginPositionChanged = data.graphOrigin.isOriginPositionChanged;


            graphDisplayValues._graphParameters = data.graphParameters;

            graphDisplayValues._zoomingFactor = data.zoomingFactor;
        }
    }, {});

}(window.MathUtilities));
