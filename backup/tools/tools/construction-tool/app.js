define('app9', function() {
    "use strict";
    var MathUtilities = window.MathUtilities || {},
        App;

    App = MathUtilities.Tools.BaseApp.extend({
        "appFiles": null,
        "initialize": function(appOptions) {
            App.__super__.initialize.apply(this, arguments);
            this.appFiles = {
                "arrResources": [{
                    "url": "css/common/tti/text-editor.combined.min.css",
                    "type": 2
                }, {
                    "url": "ttiBasicsAutoload",
                    "type": 6,
                    "bRequireCompatible": true
                }, {
                    "url": "TinyMCEAutoload",
                    "type": 6,
                    "bRequireCompatible": true
                }, {
                    "url": "img/tools/common/common/settings_purple_rollover.png",
                    "type": 4,
                    "bRequireCompatible": false,
                    "loadInBackground": true
                }, {
                    "url": "img/tools/common/common/submenu-bar.png",
                    "type": 4,
                    "bRequireCompatible": false
                }, {
                    "url": "vendor/font-awesome/css/font-awesome.min.css",
                    "type": 2
                }, {
                    "url": "img/tools/common/common/undo-redo.png",
                    "type": 4,
                    "bRequireCompatible": false
                }]
            };
        },

        "setDefaults": function() {
            App.__super__.setDefaults.apply(this, arguments);
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
            /**
             * Contain all menu-bar
             * @object
             * @namespace MathUtilities.Tools.ConstructionTool.Views
             */
            MathUtilities.Tools.ConstructionTool.Views.ToolType = {
                "None": '-1',
                "Select": 1,
                "StraightLiner": 2,
                "Compass": 3,
                "Pencil": 4,
                "Image": 5,
                "Text": 6,
                "Background": 7,
                "CanvasPan": 8,
                "Undo": 9,
                "Redo": 10,
                "ResetAll": 11,
                "Rectangle": 12
            };

            MathUtilities.Tools.ConstructionTool.Views.ModuleName = 'construction-tool';

            MathUtilities.Tools.ConstructionTool.Views.DOUBLE_TAP_THRESHOLD = 600;

            MathUtilities.Tools.ConstructionTool.Views.RulerType = {
                "StraightLiner": 1,
                "Compass": 2
            };

            MathUtilities.Tools.ConstructionTool.Views.PropertyMenuItems = {
                "-1": ['delete-button'],
                "4": ['stroke-color', 'stroke-size'],
                "7": ['background-color'],
                "2": ['stroke-color', 'stroke-size'],
                "3": ['stroke-color', 'stroke-size'],
                "6": ['delete-button'],
                "5": ['delete-button']
            };

            MathUtilities.Tools.ConstructionTool.Views.CursorType = {
                "Default": 'construction-tool-arrow-cursor',
                "Move": 'construction-tool-move-cursor',
                "Pencil": 'construction-tool-marker-cursor',
                "RotationStart": 'construction-tool-rotate-handler-cursor',
                "Rotation": 'construction-tool-rotate-handler-in-action-cursor',
                "Pointer": 'construction-tool-ruler-cursor',
                "ResizeLeft": 'construction-tool-resize-right-bottom-left-top-cursor',
                "ResizeRight": 'construction-tool-resize-left-bottom-right-top-cursor',
                "Text": 'construction-tool-text-cursor'
            };

            MathUtilities.Tools.ConstructionTool.Views.UndoRedoActions = {
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
                "RulerTransform": 14,
                "Reset": 15
            };
        },

        "preload": function(preloader) {
            // Keep this obj alive in closure.
            var arrPreloadFiles = null;
            require(['preloader'], _.bind(function(preloader) {
                    var jsonPath = this._basePath + 'data/tools/common/tools/construction-tool/';
                    if (this.minify === true) {
                        arrPreloadFiles = this.appFiles.arrResources;
                        this._appendBaseUrl(arrPreloadFiles);
                        // Load the resources with Require Js.
                        preloader.preload(arrPreloadFiles, {
                                "bRequireCompatible": true,
                                "scope": this
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
                                        "bRequireCompatible": true,
                                        "scope": this
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
            this._loadBodyTemplate();
        },

        "unload": function() {
            if (this._appObj.destroy) {
                this._appObj.destroy();
            }
        },

        "_loadBodyTemplate": function(strHtml) {
            var strHtml = MathUtilities.Tools.ConstructionTool.Views.templates.bodyTemplate().trim();
            this._onLoadBodyTemplate(strHtml);
        },

        "_onLoadBodyTemplate": function(strHtml) {
            // Append the template into the container element.
            var tempElem = document.createElement('div');
            tempElem.innerHTML = strHtml;
            this._options.containerElement.appendChild(tempElem);
            // Load Equation Json
            this._loadBaseJson();

        },

        "_loadBaseJson": function() {
            var constructionToolModel = new MathUtilities.Tools.ConstructionTool.Models.Sketchpad(),
                constructionToolView;
            MathUtilities.Tools.ConstructionTool.Models.Sketchpad.BASEPATH = this._basePath;
            constructionToolView = new MathUtilities.Tools.ConstructionTool.Views.Sketchpad({
                "model": constructionToolModel,
                "el": $(this._options.containerElement),
                "bAllowAccessibility": this._options.accessibility,
                "startTabIndex": this._options.startTabIndex
            });

            this._appObj = constructionToolView;

            $.ajax({
                "url": this._basePath + 'data/tools/lang/' + this._options.lang + '/tools/construction-tool/acc-data.json',
                "success": _.bind(function(accjson) {
                    constructionToolModel.set({
                        "jsonData": accjson
                    });

                    this._onSuccess([new Tools.ErrorLogger({
                        "strLogMsg": 'Construction-Tool :: Loaded config, template. App Initialization complete.'
                    })]);
                }, this)
            });

        },

        "_loadEqutionJson": function() {}
    });

    return App;

});
