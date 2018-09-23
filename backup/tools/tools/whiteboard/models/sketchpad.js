(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                           Sketchpad                             */
    /*******************************************************************/
    WhiteboardTool.Models.Sketchpad = Backbone.Model.extend({
        "_points": null,
        "_currentSelectedBackground": null,
        "_bgRaster": null,
        "_basePath": null,
        "_jsonData": null,
        "defaults": function() {
            return {
                "_data": {
                    "documentData": {},
                    "drawingSettingsData": {},
                    "currentSettingsData": {}
                },
                "resetToolState": null,

                "copyData": null
            };
        },

        /**
         * Initializer of the application.
         * @method initialize
         */
        "initialize": function() {
            this.setDefaults();
        },

        /**
         * Sets defaults to properties residing inside.
         * @method setDefaults
         */
        "setDefaults": function() {
            var data = this.get("_data"),
                drawingSettingsData;

            drawingSettingsData = data.drawingSettingsData;
            drawingSettingsData.nDefaultShape = WhiteboardTool.Views.ShapeType.None;
            drawingSettingsData.strStrokeColor = "brown";
            drawingSettingsData.nStrokeWidth = 8;
            drawingSettingsData.strFillColor = "orange";
            drawingSettingsData.nFillAlpha = 1;
        },

        /**
         * Sets options passed into the internal properties.
         * @method setOptions
         */
        "setOptions": function(oDataObject) {
            var curData = this.getCurrentSettings();

            if (typeof oDataObject.nStrokeWidth !== "undefined") {
                curData.nStrokeWidth = oDataObject.nStrokeWidth;
            }
            if (typeof oDataObject.bElementLocked !== "undefined") {
                curData.bElementLocked = oDataObject.bElementLocked;
            }
            if (typeof oDataObject.strFillColor !== "undefined") {
                curData.strFillColor = oDataObject.strFillColor;
            }
            if (typeof oDataObject.strStrokeColor !== "undefined") {
                curData.strStrokeColor = oDataObject.strStrokeColor;
            }
            if (typeof oDataObject.nFillAlpha !== "undefined") {
                curData.nFillAlpha = oDataObject.nFillAlpha;
            }
            if (typeof oDataObject.bVisible !== "undefined") {
                curData.bVisible = oDataObject.bVisible;
            }
            if (typeof oDataObject.nVersion !== "undefined") {
                curData.nVersion = oDataObject.nVersion;
            }
            if (typeof oDataObject.bSelected !== "undefined") {
                curData.bSelected = oDataObject.bSelected;
            }
            if (typeof oDataObject.zIndex !== "undefined") {
                curData.zIndex = oDataObject.zIndex;
            }
            if (typeof oDataObject.nSelectionStrokeColor !== "undefined") {
                curData.nSelectionStrokeColor = oDataObject.nSelectionStrokeColor;
            }
        },

        "getCurrentSettings": function() {
            return this.get("_data").currentSettingsData;
        },

        "getDefaultSettings": function() {
            return this.get("_data").drawingSettingsData;
        }
    }, {
        "BASE_PATH": null,
        "LEFT_ARROW_KEY": 37,
        "RIGHT_ARROW_KEY": 39,
        "TOP_ARROW_KEY": 38,
        "BOTTOM_ARROW_KEY": 40,
        "ENTER_KEY": 13,
        "TAB_KEY": 9,
        "ESCAPE_KEY": 27,
        "DELETE_KEY": 46,
        "BACKSPACE_KEY": 8,
        "ALPHABET_A_KEY": 65,
        "ALPHABET_C_KEY": 67,
        "ALPHABET_X_KEY": 88,
        "ALPHABET_V_KEY": 86,
        "SPACE_BAR_KEY": 32,
        "ACC_DIV_PADDING": 2,
        "UNDO_REDO_STACK_MAX": 20,
        "LAYERS_NAME": {
            "SHAPE": "customShape",
            "IMAGE": "image",
            "BACKGROUND": "intermediate",
            "GRAPH": "grid",
            "SERVICE": "service"
        },
        "GRAPH_TYPE": {
            "NOGRID": "no-grid",
            "CARTESIAN": "cartesian-graph",
            "POLAR": "polar-graph"
        },
        "Retrieve_Codes": { //for pre-author data, as some of json data are as per old login
            "New": 1, //always refere to current logic, current login depends on grid-graph
            "CanvasCood": 2, //retrieve json data co-ordinate is in canvas system, directly convert to graph-co to fit in current logic
            "GraphCoodWithWrongOrigin": 3, //json data co-ordinate is in graph co-ordinate system, but default origin is at (0,0) position,very rare but possible case, due to Mathtab 1983 wrong data storing
            "GraphCoodEqualRation": 4 //json data co-ordinate is in graph co-ordinate system, but in equal ratio with canvas co-ordinate, data before grid-graph

        }
    });
})(window.MathUtilities);
