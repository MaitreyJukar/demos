(function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                            Property Tool Bar                    */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents PropertyToolBar.
     * @class MathUtilities.Tools.ConstructionTool.Models.PropertyToolBar
     * @constructor
     * @namespace Tools.ConstructionTool.Models
     * @module PropertyToolBar
     * @extends Backbone.Model
     */
    ConstructionTool.Models.PropertyToolBar = Backbone.Model.extend({
        "defaults": function() {
            return {
                "sliderValues": null,

                "drawingToolMenuItems": null,

                "strokeColorMapping": null,

                "properties": {
                    "curToolType": null,
                    "isVisible": null,
                    "strokeColor": null,
                    "strokeWidth": null,
                    "backgroundColor": null
                }
            };
        },

        "initialize": function initialize() {
            this.setDefaults();
        },

        /**
         * Sets defaults to properties residing inside.
         * @method setDefaults
         */
        "setDefaults": function setDefaults() {
            var blackColorCode = "#424242",
                blueColorCode = "#5d99eb",
                dataObject = {
                    "strokeColor": "#5d99eb",
                    "strokeWidth": 4,
                    "backgroundColor": "#fff",
                    "isVisible": false
                },
                sliderValues = {
                    "max": 10,
                    "min": 1,
                    "val": 4,
                    "step": 1,
                    "valueDisplay": false
                },
                drawingToolMenuItems = {},
                propertyItems = ConstructionTool.Views.PropertyMenuItems,
                currentElem = null,
                toolTypes = ConstructionTool.Views.ToolType,
                strokeColorMapping = {
                    "1": {
                        "toolType": toolTypes.StraightLiner,
                        "defaultColor": blackColorCode,
                        "currentColor": blackColorCode
                    },
                    "2": {
                        "toolType": toolTypes.Compass,
                        "defaultColor": blueColorCode,
                        "currentColor": blueColorCode
                    },
                    "3": {
                        "toolType": toolTypes.Pencil,
                        "defaultColor": blackColorCode,
                        "currentColor": blackColorCode
                    }
                };

            this.setOptions(dataObject);
            this.set("sliderValues", sliderValues);

            for (currentElem in propertyItems) {
                drawingToolMenuItems[currentElem] = propertyItems[currentElem];
            }
            this.set("drawingToolMenuItems", drawingToolMenuItems);
            this.set("strokeColorMapping", strokeColorMapping);
        },

        /**
         * Sets options passed into the internal properties.
         * @method setOptions
         */
        "setOptions": function setOptions(oDataObject) {
            if (typeof oDataObject === "undefined" || oDataObject === null) {
                return;
            }

            var curProperties = this.get("properties");

            if (typeof oDataObject.strokeColor !== "undefined") {
                curProperties.strokeColor = oDataObject.strokeColor;
            }
            if (typeof oDataObject.strokeWidth !== "undefined") {
                curProperties.strokeWidth = oDataObject.strokeWidth;
            }
            if (typeof oDataObject.backgroundColor !== "undefined") {
                curProperties.backgroundColor = oDataObject.backgroundColor;
            }
            if (typeof oDataObject.isVisible !== "undefined") {
                curProperties.isVisible = oDataObject.isVisible;
            }
            if (typeof oDataObject.curToolType !== "undefined") {
                curProperties.curToolType = oDataObject.curToolType;
            }
        },

        "getProperties": function getProperties() {
            var data = {},
                properties = this.get("properties");

            data.backgroundColor = properties.backgroundColor;
            data.curToolType = properties.curToolType;
            data.isVisible = properties.isVisible;
            data.strokeColor = properties.strokeColor;
            data.strokeWidth = properties.strokeWidth;

            return data;
        }
    });
}(window.MathUtilities));
