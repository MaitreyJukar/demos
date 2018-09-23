    (function(MathUtilities) {
        "use strict";
        /* Initialize MathUtilities Data */
        MathUtilities.Tools.ConstructionTool = MathUtilities.Tools.ConstructionTool || {};
        
        var ConstructionTool = MathUtilities.Tools.ConstructionTool;

        /**
         * Packages all the models used in the ConstructionTool module.
         * @module Models
         * @namespace MathUtilities.Tools.ConstructionTool
         **/
        ConstructionTool.Models = ConstructionTool.Models || {};

        /**
         * Packages all the views used in the ConstructionTool module.
         * @module Views
         * @namespace MathUtilities.Tools.ConstructionTool
         **/
        ConstructionTool.Views = ConstructionTool.Views || {};

        /**
         * Packages all the collection used in the ConstructionTool module.
         * @module Views
         * @namespace MathUtilities.Tools.ConstructionTool
         **/
        ConstructionTool.Collections = ConstructionTool.Collections || {};
        /*******************************************************************/
        /*                           Sketch Pad                           */
        /*******************************************************************/
        /**
         * A customized Backbone.Model that represents ConstructionTool.
         * @class MathUtilities.Tools.ConstructionTool.Models.Sketchpad
         * @constructor
         * @namespace Tools.ConstructionTool.Models
         * @module ConstructionTool
         * @extends Backbone.Model
         */
        ConstructionTool.Models.Sketchpad = Backbone.Model.extend({
            "_points": null,
            "_currentSelectedBackground": null,
            "_bgRaster": null,
            "_basePath": null,
            "_jsonData": null,
            "defaults": function() {
                return {
                    /**
                     * Stores the `JSON` data that is fetched from the JSON file of construction-tool ,used for display.
                     * @property jsonData
                     * @type Object
                     * @defaults ''
                     */
                    "jsonData": "",

                    /**
                     * store menu-bar element's data.
                     * @property menuBarData
                     * @type Object
                     * @default null
                     */
                    "menuBarData": null,

                    /**
                     * Hold action to be perform on selecting menu-bar element.
                     * @property toolMenuBarActionMap
                     * @type Object
                     * @default null
                     */
                    "toolMenuBarActionMap": null,

                    "_data": {
                        "documentData": {},
                        "drawingSettingsData": {},
                        "currentSettingsData": {}
                    },

                    "scrollbarData": {
                        "visibleFrame": {
                            "xmin": null,
                            "xmax": null,
                            "ymin": null,
                            "ymax": null
                        },
                        "observableUniverse": {
                            "xmin": null,
                            "xmax": null,
                            "ymin": null,
                            "ymax": null
                        },
                        "defaultUniverse": {
                            "xmin": null,
                            "xmax": null,
                            "ymin": null,
                            "ymax": null
                        }
                    },
                    /**
                     * Indicate default tool-state.
                     * @method resetToolState
                     * @type Object
                     */
                    "resetToolState": null,

                    "isRetrieveState": false,

                    /**
                     * indicate scroll-bar visibility
                     * @property isScrollbarVisible
                     * @type {Boolean}
                     * @default true
                     */
                    "isScrollbarVisible": true
                };
            },

            /**
             * Initializer of the application.
             * @method initialize
             */
            "initialize": function initialize() {
                this.setDefaults();
            },

            "setDefaults": function setDefaults() {
                var toolMenuBarActionMap = {
                        "0": {
                            "-1": ConstructionTool.Views.ToolType.Select
                        },
                        "1": {
                            "-1": ConstructionTool.Views.ToolType.StraightLiner
                        },
                        "2": {
                            "-1": ConstructionTool.Views.ToolType.Compass
                        },
                        "3": {
                            "-1": ConstructionTool.Views.ToolType.Pencil
                        },
                        "4": {
                            "-1": ConstructionTool.Views.ToolType.Image
                        },
                        "5": {
                            "-1": ConstructionTool.Views.ToolType.Text
                        },
                        "6": {
                            "-1": ConstructionTool.Views.ToolType.Background
                        },
                        "7": {
                            "-1": ConstructionTool.Views.ToolType.CanvasPan
                        },
                        "8": {
                            "-1": "" /*for seperator*/
                        },
                        "9": {
                            "-1": ConstructionTool.Views.ToolType.Undo
                        },
                        "10": {
                            "-1": ConstructionTool.Views.ToolType.Redo
                        },
                        "11": {
                            "-1": "" /*for seperator*/
                        },
                        "12": {
                            "-1": ConstructionTool.Views.ToolType.ResetAll
                        }
                    },
                    menuBarData = [{
                        "toolId": "select-tool",
                        "align": "left"
                    }, {
                        "toolId": "straight-liner-tool",
                        "align": "left"
                    }, {
                        "toolId": "compass-tool",
                        "align": "left"
                    }, {
                        //porting discovery change
                        "toolId": "pencil-tool",
                        "align": "left"
                    }, {
                        "toolId": "image-tool",
                        "align": "left"
                    }, {
                        "toolId": "text-tool",
                        "align": "left"
                    }, {
                        "toolId": "background-tool",
                        "align": "left"
                    }, {
                        "toolId": "canvas-pan-tool",
                        "align": "left"
                    }, {
                        "seperator": "right"
                    }, {
                        "toolId": "undo",
                        "hideSelection": true,
                        "align": "right"
                    }, {
                        "toolId": "redo",
                        "hideSelection": true,
                        "align": "right"
                    }, {
                        "seperator": "right"
                    }, {
                        "toolId": "refresh",
                        "hideSelection": true,
                        "align": "right"
                    }],
                    data = this.get("_data"),
                    drawingSettingsData = null;

                this.set("toolMenuBarActionMap", toolMenuBarActionMap);
                this.set("menuBarData", menuBarData);

                drawingSettingsData = data.drawingSettingsData;
                drawingSettingsData.nDefaultShape = ConstructionTool.Views.ToolType.None;
                drawingSettingsData.strokeColor = "brown";
                drawingSettingsData.strokeWidth = 8;
                drawingSettingsData.fillColor = "orange";
                drawingSettingsData.fillAlpha = 1;

                this.defaultMenuBarState = {
                    "selectedMenuIndex": 0,
                    "selectedSubMenuIndices": [-1, -1, -1, -1, 0, -1, -1, -1],
                    "singleMenuIndices": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                };
                this.menubarCurrentState = {
                    "selectedMenuIndex": this.defaultMenuBarState.selectedMenuIndex,
                    "selectedSubMenuIndices": this.defaultMenuBarState.selectedSubMenuIndices,
                    "singleMenuIndices": this.defaultMenuBarState.singleMenuIndices
                };
                this.menubarLastState = {};
            },

            /**
             * Sets options passed into the internal properties.
             * @method setOptions
             */
            "setOptions": function(oDataObject) {
                var curData = this.get("_data").currentSettingsData;

                if (typeof oDataObject.strokeWidth !== "undefined") {
                    curData.strokeWidth = oDataObject.strokeWidth;
                }
                if (typeof oDataObject.isElementLocked !== "undefined") {
                    curData.isElementLocked = oDataObject.isElementLocked;
                }
                if (typeof oDataObject.fillColor !== "undefined") {
                    curData.fillColor = oDataObject.fillColor;
                }
                if (typeof oDataObject.strokeColor !== "undefined") {
                    curData.strokeColor = oDataObject.strokeColor;
                }
                if (typeof oDataObject.fillAlpha !== "undefined") {
                    curData.fillAlpha = oDataObject.fillAlpha;
                }
                if (typeof oDataObject.isVisible !== "undefined") {
                    curData.isVisible = oDataObject.isVisible;
                }
                if (typeof oDataObject.isSelected !== "undefined") {
                    curData.isSelected = oDataObject.isSelected;
                }
                if (typeof oDataObject.zIndex !== "undefined") {
                    curData.zIndex = oDataObject.zIndex;
                }
                if (typeof oDataObject.selectionStrokeColor !== "undefined") {
                    curData.selectionStrokeColor = oDataObject.selectionStrokeColor;
                }
            }
        }, {
            "BASEPATH": null,
            "ESCAPE_KEY": 27,
            "DELETE_KEY": 46,
            "BACKSPACE_KEY": 8,
            "ALPHABET_A_KEY": 65,
            "LEFT_ARROW_KEY": 37,
            "RIGHT_ARROW_KEY": 39,
            "TOP_ARROW_KEY": 38,
            "BOTTOM_ARROW_KEY": 40,
            "ENTER_KEY": 13,
            "TAB_KEY": 9,
            "SPACE_BAR_KEY": 32,
            "ACC_PADDING": 2,
            "SCROLL_DISPLACEMENT_FACTOR": 10,
            "SCROLL_BUFFER_SPACE": 15 //SCROLL-WIDTH
        });
    }(window.MathUtilities));
