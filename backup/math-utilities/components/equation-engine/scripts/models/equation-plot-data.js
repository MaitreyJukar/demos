/* globals window */

(function(MathUtilities) {
    'use strict';
    /**
    Class to create plot data object to be used to contain plotting related data.

    @class MathUtilities.Components.PlotData
    **/
    MathUtilities.Components.EquationEngine.Models.PlotData = Backbone.Model.extend({

        "defaults": function() {
            return {
                /**
                    Boolean whether the plot is draggable or not.
        
                    @property _draggable
                    @type {Boolean}
                    @public
                **/
                "_draggable": false,

                /**
                    Contains data related to labels used in DGT drawables.
        
                    @property _labelData
                    @type {Object}
                    @public
                **/
                "_labelData": null,

                /**
                    The paper Group object of the plot.
        
                    @property _pathGroup
                    @type {Object}
                    @public
                **/
                "_pathGroup": null,

                /**
                    The locus of the current point.
        
                    @property _locus
                    @type {Object}
                    @public
                **/
                "_locus": null,

                /**
                    The paper Group object of the points.
        
                    @property _pointsGroup
                    @type {Object}
                    @public
                **/
                "_pointsGroup": null,

                /**
                    [EXPERIMENTAL] was introduced for optimization in plotting
        
                    @property _plotSessionCount
                    @type {Number}
                    @public
                **/
                "_plotSessionCount": 0,

                /**
                    Contains plot groups of the best fit lines,curve and exponent for a list of points used in Graphing Tool
        
                    @property _bestFit
                    @type {Object}
                    @public
                **/
                "_bestFit": null,

                /**
                    Contains paper raster object used by DGT.
        
                    @property _raster
                    @type {Object}
                    @public
                **/
                "_raster": null,
                "_rayPolygon": null,

                "_plot": null,

                "_inEqualititesPathGroup": null
            };
        },

        "removePathGroup": function() {
            if (this.get('_pathGroup')) {
                this.get('_pathGroup').remove();
            }
            this.set('_pathGroup', null);
        },

        "initialize": function() {
            this.set('_labelData', {
                "labelObject": null
            });
        },

        /**
            Flushes all properties of the object and set them to their default values.

            @public
            @method flush
        **/
        "flush": function() {
            this.set({
                "_bannerData": {},
                "_draggable": null,
                "_labelData": {
                    "labelObject": null
                },
                "_pathGroup": null,
                "_pointsGroup": null,
                "_plotSessionCount": null,
                "_raster": null
            });
        }

    }, {});
}(window.MathUtilities));
