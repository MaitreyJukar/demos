define('app7', function() {
    "use strict";
    var MathUtilities = window.MathUtilities || {},
        App;
    App = MathUtilities.Tools.BaseApp.extend({
        "appFiles": null,
        "initialize": function(appOptions) {
            App.__super__.initialize.apply(this, arguments);
            this.appFiles = {
                "arrResources": [{
                    "url": "ttiBasicsAutoload",
                    "type": 6,
                    "bRequireCompatible": true
                }, {
                    "url": "TinyMCEAutoload",
                    "type": 6,
                    "bRequireCompatible": true
                },  {
                    "url": "css/common/tti/text-editor.combined.min.css",
                    "type": 2
                }]
            };
        },

        "preload": function(preloader) {
            // Keep this obj alive in closure.
            var arrPreloadFiles = null;
            require(['preloader'], _.bind(function(preloader) {
                    var jsonPath = this._basePath + 'data/tools/common/tools/whiteboard/';
                    if (this.minify === true) {
                        arrPreloadFiles = this.appFiles.arrResources;
                        this._appendBaseUrl(arrPreloadFiles);
                        // Load the resources with Require Js.
                        preloader.preload(arrPreloadFiles, {
                                'bRequireCompatible': true,
                                'scope': this
                            },
                            null,
                            null,
                            this.initApp,
                            this._onError
                        );
                    } else {
                        jsonPath += 'file-list.json';
                        $.getJSON(jsonPath,
                            _.bind(function(json) {
                                // We get json object, that contains an array of resources. Use them to preload files.
                                arrPreloadFiles = json.arrResources;
                                this._appendBaseUrl(arrPreloadFiles);
                                // Load the resources with Require Js.
                                preloader.preload(arrPreloadFiles, {
                                        'bRequireCompatible': false,
                                        'scope': this
                                    },
                                    null,
                                    null,
                                    this.initApp,
                                    this._onError
                                );
                            }, this));
                    }

                }, this),
                this._onError
            );
        },

        "initApp": function() {
            this._toolId = '7';

            var bodyHtml = MathUtilities.Tools.WhiteboardTool.Views.templates.BodyTemplate(),
                domEle = document.createElement('div'),
                retrieveJsonData;

            if (this._options._initialState && this._options._initialState.data) {
                retrieveJsonData = this._options._initialState.data;
            }

            domEle.innerHTML = bodyHtml;
            this._options.containerElement.appendChild(domEle.childNodes[0]);
            if (this._appObj && this._appObj.destroy) {
                this._appObj.destroy();
            }

            MathUtilities.Tools.WhiteboardTool.Models.Sketchpad.BASE_PATH = this._basePath;

            $.ajax({
                "url": MathUtilities.Tools.WhiteboardTool.Models.Sketchpad.BASE_PATH + 'data/tools/lang/en/tools/whiteboard/acc-data.json',
                "success": _.bind(function(json) {
                    MathUtilities.Tools.WhiteboardTool.Models.Sketchpad._jsonData = json;
                    this._appObj = new MathUtilities.Tools.WhiteboardTool.Views.Sketchpad({
                        "el": $(this._options.containerElement),
                        "data": retrieveJsonData,
                        "bAllowAccessibility": this._options.accessibility

                    });
                    this._onSuccess();
                }, this)
            });

        },

        "unload": function() {
            if (this._appObj && $('#tool-holder-' + this._toolId).length !== 0) {
                delete this._appObj;
                $('body').append($('.math-utilities-math-editor-keyboard'));
                $('.math-utilities-math-editor-keyboard').hide();
                $('#tool-holder-' + this._toolId).remove();

                this._onUnloadSuccess();
            } else {
                this._onUnloadError();
            }
        },

        "setDefaults": function() {
            App.__super__.setDefaults.apply(this, arguments);

            /**
             * Enum of the Actions supported for Undo/Redo in the application.
             */
            MathUtilities.Tools.WhiteboardTool.Views.UndoRedoActions = {
                "Add": 1,
                "Remove": 2,
                "Translate": 3,
                "Rotate": 4,
                "Resize": 5,
                "Transform": 7,
                "Color": 8,
                "Stroke": 9,
                "ColorAndStroke": 10,
                "BringForward": 11,
                "SendBack": 12,
                "CanvasPan": 13,
                "Reset": 14,
                "GraphChange": 15,
                "GraphOptChange": 16
            };

            /**
             * Global module name for the current application.
             */
            MathUtilities.Tools.WhiteboardTool.Views.ModuleName = "whiteboard";

            MathUtilities.Tools.WhiteboardTool.Views.ShapeType = {
                "None": -1,
                "Circle": 1,
                "LineSegment": 2,
                "Ellipse": 3,
                "RightTriangle": 4,
                "Triangle": 5,
                "Arrow": 6,
                "Square": 7,
                "Pentagon": 8,
                "Hexagon": 9,
                "BackgroundImage": 10,
                "Rectangle": 14,
                "Parallelogram": 15,
                "Trapezium": 16,
                "Point5Star": 17,
                "Point6Star": 18,
                "Pencil": 19,
                "Image": 20,
                "Text": 21,
                "CanvasPan": 24,
                "Polygon": 31,
                "DashedSegment":32,
                "DashedArrow":33,
                "SolidArrow":34
            };

            MathUtilities.Tools.WhiteboardTool.Views.ToolType = {
                "Delete": 3,
                "Undo": 9,
                "Redo": 10,
                "StrokeColor": 11,
                "FillColor": 12,
                "FillOpacity": 13,
                "Reset": 14,
                "SaveAll": 15,
                "Retrieve": 16,
                "BringToForward": 22,
                "SendToBack": 23,
                "Copy": 25,
                "Cut": 26,
                "Paste": 27,
                "NoGrid": 28,
                "CartesianGrid": 29,
                "PolarGrid": 30
            };

            MathUtilities.Tools.WhiteboardTool.Views.MenuBarType = {
                "Select": 1,
                "Marker": 2,
                "Shape": 3,
                "Line": 4,
                "Image": 5,
                "Text": 6,
                "Polygon": 7
            };

            MathUtilities.Tools.WhiteboardTool.Views.currentMenuTypeSelected = 1;

            MathUtilities.Tools.WhiteboardTool.Views.MenuItems = {
                "1": ['properties-right-menu'],
                "2": ['stroke-color', 'size', 'properties-right-menu'],
                "3": ['fill-color', 'stroke-color', 'size', 'more-menu-properties', 'properties-right-menu'],
                "4": ['stroke-color', 'size', 'rotate-shape', 'properties-right-menu'],
                "5": ['fill-opacity', 'rotate-shape', 'properties-right-menu'],
                "6": ['properties-right-menu'],
                "7": ['fill-color', 'stroke-color', 'size', 'more-menu-properties', 'properties-right-menu'] 
            };

            MathUtilities.Tools.WhiteboardTool.Views.AllowMultiSelect = false;

            MathUtilities.Tools.Toolbar = {};
            MathUtilities.Tools.Toolbar.WhiteboardTool = {};
            MathUtilities.Tools.Toolbar.WhiteboardTool.Views = {};
            MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group = {
                "Default": "1",
                "DrawingTool": "2",
                "UndoRedoReset": "3",
                "StrokeColor": "4",
                "FillColor": "5",
                "StrokeSize": "6",
                "FillOpacity": "7",
                "Rotate": "8",
                "Edit": "4",
                "Graph": "10"
            };

            MathUtilities.Tools.WhiteboardTool.Views.PaperScope = null;
        }
    });

    (function() {
        MathUtilities.Tools.WhiteboardTool = MathUtilities.Tools.WhiteboardTool || {};
        MathUtilities.Tools.WhiteboardTool.Models = MathUtilities.Tools.WhiteboardTool.Models || {};
        MathUtilities.Tools.WhiteboardTool.Views = MathUtilities.Tools.WhiteboardTool.Views || {};
        MathUtilities.Tools.WhiteboardTool.Collections = MathUtilities.Tools.WhiteboardTool.Collections || {};
    })();

    return App;



});
