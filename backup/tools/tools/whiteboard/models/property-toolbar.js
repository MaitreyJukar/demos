/* globals window */

(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                       Property Toolbar                          */
    /*******************************************************************/
    WhiteboardTool.Models.PropertyToolbar = Backbone.Model.extend({

        "_menuItems": null,
        "_drawingToolMenuItems": null,
        "_defaultStroke": null,
        "_defaultFill": null,
        "_defaultStrokeWidth": null,
        "_sliderValues": null,

        "initialize": function() {
            this._setDefaults();
        },

        "_setDefaults": function() {
            var menuItems,
                MenuBarType = WhiteboardTool.Views.MenuBarType;
            this._defaultStroke = "#424242";
            this._defaultFill = "no-fill";
            this._defaultColorCode = "#424242";
            this._defaultStrokeWidth = 4;
            this._drawingToolMenuItems = {};
            this._menuItems = {
                "FillColor": 1,
                "StrokeColor": 2,
                "Thickness": 3,
                "FillOpacity": 4,
                "Rotate": 5,
                "BringToFront": 6,
                "SentToBack": 7,
                "Delete": 8
            };
            this._sliderValues = {
                "max": 10,
                "min": 1,
                "val": 4,
                "step": 1,
                "currValueHide": true
            };
            menuItems = this._menuItems;

            this._drawingToolMenuItems[MenuBarType.Select] = [];
            this._drawingToolMenuItems[MenuBarType.Marker] = [menuItems.StrokeColor, menuItems.Thickness];
            this._drawingToolMenuItems[MenuBarType.Shape] = [menuItems.FillColor, menuItems.StrokeColor, menuItems.Thickness,
                menuItems.FillOpacity, menuItems.Rotate
            ];

            this._drawingToolMenuItems[MenuBarType.Line] = [menuItems.StrokeColor,
                menuItems.Thickness, menuItems.Rotate
            ];

            this._drawingToolMenuItems[MenuBarType.Image] = [];
            this._drawingToolMenuItems[MenuBarType.Text] = [];

            this._drawingToolMenuItems[MenuBarType.Polygon] = [menuItems.FillColor, menuItems.StrokeColor, menuItems.Thickness,
                menuItems.FillOpacity, menuItems.Rotate
            ];
        }
    }, {});
})(window.MathUtilities);
