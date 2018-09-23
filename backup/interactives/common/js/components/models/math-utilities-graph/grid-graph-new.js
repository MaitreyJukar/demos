(function (MathInteractives) {
    'use strict';    
    /**
    *@class GridGraphModel
    *@extends Backbone.model
    */    
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.GridGraphModel = Backbone.Model.extend({
        defaults: {
            _points: null,
            _plots: null,
            _images: null,

            circleDrag: null,
            positionBox: null,
            xCoOrdinateBase: null,
            xCoOrdinatePower: null,
            yCoOrdinatePower: null,
            yCoOrdinateBase: null,
            coOrdinateSeparator: null,
            path: null,

            markerBounds: null,
            _graphDisplayValues: null
        },
        initialize: function () {
            var attr = this.attributes,
                displayProperty;


            attr._points = [];
            attr._plots = [];
            attr._images = [];


            attr.markerBounds = {
                max: {
                    x: null,
                    y: null,
                    '\\theta': null
                },
                min: {
                    x: null,
                    y: null,
                    '\\theta': null
                }
            };
            attr._graphDisplayValues = {
                _graphDisplay: null,
                _graphsAxisLimits: null,
                _graphOrigin: null,
                _graphParameters: null,
                _zoomingFactor: null,
                _graphLimitTextBoxDomElement: null,
                _symbols: null
            };

            displayProperty = attr._graphDisplayValues;
            displayProperty._graphDisplay = {
                isCartesionCurrentGraphType: true,
                isLabelShown: true,
                isGridLineShown: true,
                isAxisLinesShown: true,
                isProjectorModeOn: false,
                isXmarkerInRadians: false,
                isYmarkerInRadians: false,
                isPolarAngleInRadian: true
            };

            displayProperty._graphsAxisLimits = {
                defaultLimits: {
                    xLower: null,
                    xUpper: null,
                    yLower: null,
                    yUpper: null
                },
                currentLimits: {
                    xLower: null,
                    xUpper: null,
                    yLower: null,
                    yUpper: null
                },
                isXLastChangedLimit: null
            };

            displayProperty._graphOrigin = {
                currentOrigin: null,
                defaultOrigin: null,
                doubleClickedPoint: null,
                isOriginPositionChanged: null
            };
            displayProperty._graphParameters = {
                graphGridLine: null,
                yGridLine: null,
                xGridLine: null,
                totalVerticalLines: null,
                distanceBetweenTwoVerticalLines: null,
                currentDistanceBetweenTwoVerticalLines: null,
                totalHorizontalLines: null,
                distanceBetweenTwoHorizontalLines: null,
                currentDistanceBetweenTwoHorizontalLines: null
            };

            displayProperty._zoomingFactor = {
                previousZoomAngle: null,
                zoomLevel: null,
                zoomFactorForGraphParameterModification: null,
                xZoomFactorForGraphParameterModification: null,
                yZoomFactorForGraphParameterModification: null,
                zoomAngle: null,
                zoomDistance: null,
                doubleClickZoomAllow: true,
                xCurrentFactor: null,
                yCurrentFactor: null,
                xZoomMultiplier: null,
                yZoomMultiplier: null,
                xTotalMultiplier: null,
                yTotalMultiplier: null,
                xZoomLevel: null,
                currentXZoomLevel: null,
                yZoomLevel: null,
                currentYZoomLevel: null,
                zoomCounter: null
            };
            displayProperty._graphLimitTextBoxDomElement = {
                xLower: null,
                xUpper: null,
                yLower: null,
                yUpper: null
            };
            displayProperty._symbols = {
                xAxis: null,
                yAxis: null,
                xMarkerLines: null,
                yMarkerLines: null,
                xInnerGridLines: null,
                yInnerGridLines: null
            };
        },
        setModelAttribute: function (data) {
            var attr = this.attributes;

            attr._points = [];
            attr._plots = [];

            attr.markerBounds = data.markerBounds;
            attr._graphDisplayValues._graphDisplay = data.graphDisplay;

            attr._graphDisplayValues._graphsAxisLimits.currentLimits.xLower = data.currentLimits.xLower;
            attr._graphDisplayValues._graphsAxisLimits.currentLimits.xUpper = data.currentLimits.xUpper;
            attr._graphDisplayValues._graphsAxisLimits.currentLimits.yLower = data.currentLimits.yLower;
            attr._graphDisplayValues._graphsAxisLimits.currentLimits.yUpper = data.currentLimits.yUpper;

            attr.markerBounds.max.x = data.currentLimits.xUpper;
            attr.markerBounds.max.y = data.currentLimits.yUpper;
            attr.markerBounds.min.x = data.currentLimits.xLower;
            attr.markerBounds.min.y = data.currentLimits.yLower;


            attr._graphDisplayValues._graphOrigin.currentOrigin.x = data.graphOrigin.currentOrigin.x;
            attr._graphDisplayValues._graphOrigin.currentOrigin.y = data.graphOrigin.currentOrigin.y;

            attr._graphDisplayValues._graphOrigin.defaultOrigin.x = data.graphOrigin.defaultOrigin.x;
            attr._graphDisplayValues._graphOrigin.defaultOrigin.y = data.graphOrigin.defaultOrigin.y;

            attr._graphDisplayValues._graphOrigin.isOriginPositionChanged = data.graphOrigin.isOriginPositionChanged;


            attr._graphDisplayValues._graphParameters = data.graphParameters;

            attr._graphDisplayValues._zoomingFactor = data.zoomingFactor;
        }
    }, {});

}(window.MathInteractives));
