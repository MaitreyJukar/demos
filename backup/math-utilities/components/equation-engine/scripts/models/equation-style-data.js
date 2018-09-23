/* globals window */

(function(MathUtilities) {
    'use strict';

    /**
        Class to create equationData object to be used for plotting and parsing

        @class MathUtilities.Components.EquationEngine
    **/
    MathUtilities.Components.EquationEngine.Models.EquationStyleData = Backbone.Model.extend({
        "defaults": function() {
            return {
                /**
                     Color of the plot and points

                     @property _color
                     @type {String}
                    @private
                 **/
                "_color": null,

                "_fillColor": null,

                /**
                    Thickness of the hit area of plot and points

                    @property _dragHitThickness
                    @type {Number}
                    @private
                **/
                "_dragHitThickness": null,

                /**
                    Color of the hit area of plot and points

                    @property _dragHitColor
                    @type {String}
                    @private
                **/
                "_dragHitColor": null,

                /**
                    Visible opacity of plot and points

                    @property _opacity
                    @type {Number}
                    @private
                **/
                "_opacity": null,

                /**
                    Thickness of plot and points

                    @property _thickness
                    @type {Number}
                    @private
                **/
                "_thickness": null,

                /**
                    Thickness of plot and points on focus of the equation

                    @property _previousThickness
                    @type {Number}
                    @private
                **/
                "_previousThickness": null,

                /**
                    Boolean whether the plot and points should be visible or not

                    @property _visible
                    @type {Boolean}
                    @private
                **/
                "_visible": null,

                /**
                    Array of values of dash to be applied for plots and points

                    @property _dashArray
                    @type {Array}
                    @private
                **/
                "_dashArray": null,
                /**
                    Array of values of dash to be applied for inequalities

                    @property _inqualityDashArray
                    @type {Array}
                    @private
                **/
                "_inqualityDashArray": null,
                /**
                    Boolean whether the plot should be closed at the end or not

                    @property _closedPolygon
                    @type {Boolean}
                    @private
                **/
                "_closedPolygon": null,

                /**
                    Boolean whether the plot should be smoothen or not

                    @property _smoothPolygon
                    @type {Boolean}
                    @private
                **/
                "_smoothPolygon": null,

                "_dragHitAlpha": null

            };
        },

        /**

            Constructor function called on creation of new instance of EquationStyleData model

            @private
            @method initialize
        **/
        "initialize": function() {
            this._setInitialStyles();
        },

        /**
            Flushes all properties of the object and set them to their default values.

            @public
            @method flush
        **/
        "flush": function() {
            this._setInitialStyles();
        },

        "setVisible": function(visibility) {
            if (typeof visibility === 'object') {
                this.set('_visible', visibility);
            } else {
                var visible = this.get('_visible');
                visible.point = visible.curve = visibility;
            }
        },

        /**
            Set properties to default values

            @public
            @method _setInitialStyles
        **/
        "_setInitialStyles": function() {
            this.set({
                "_color": "#000",
                "_fillColor": null,
                "_dragHitThickness": 15,
                "_dragHitColor": "#f00",
                "_opacity": 1,
                "_thickness": 1,
                "_visible": {
                    "point": true,
                    "curve": true
                },
                "_dashArray": [],
                "_closedPolygon": false,
                "_smoothPolygon": false,
                "_dragHitAlpha": 0
            });
        }

    }, {});
}(window.MathUtilities));
