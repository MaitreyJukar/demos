/* globals _, MathUtilities, $  */

define("app4", function() {
    var App = MathUtilities.Tools.BaseApp.extend({
        "appFiles": null,
        "initialize": function() {
            var COMMON_PATH = "img/tools/common/tools/graphing-plotting/";
            App.__super__.initialize.apply(this, arguments);
            this.appFiles = {
                "arrResources": [{
                    "url": COMMON_PATH + "handle-rollover.png",
                    "type": 4,
                    "bRequireCompatible": false,
                    "loadInBackground": true
                }, {
                    "url": COMMON_PATH + "handle-up.png",
                    "type": 4,
                    "bRequireCompatible": false,
                    "loadInBackground": true
                }, {
                    "url": COMMON_PATH + "left-slider-base.png",
                    "type": 4,
                    "bRequireCompatible": false,
                    "loadInBackground": true
                }, {
                    "url": COMMON_PATH + "middle-slider-base.png",
                    "type": 4,
                    "bRequireCompatible": false,
                    "loadInBackground": true
                }, {
                    "url": COMMON_PATH + "right-slider-base.png",
                    "type": 4,
                    "bRequireCompatible": false,
                    "loadInBackground": true
                }, {
                    "url": COMMON_PATH + "small-grey-button-middle.png",
                    "type": 4,
                    "bRequireCompatible": false,
                    "loadInBackground": true
                }, {
                    "url": "img/tools/common/common/submenu-bar.png",
                    "type": 4,
                    "bRequireCompatible": false
                }]
            };
        },

        "setDefaults": function() {
            App.__super__.setDefaults.apply(this, arguments);
        },

        "preload": function(preloader) {
            // Loading the requirePreloader first with its dependencies, i.e backbone, and loading backbone with dependencies first jquery and underscore.
            // Keep this obj alive in closure.
            var arrPreloadFiles = null;
            require(["preloader"], _.bind(function(preloader) {

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
                            this._loadBodyTemplate,
                            this.initApp,
                            this._onError
                        );
                    } else {
                        var jsonPath = this._basePath + 'data/tools/common/tools/graphing-plotting/file-list.json';
                        $.getJSON(jsonPath, _.bind(
                            function(json) {
                                // We get json object, that contains an array of resources. Use them to preload files.
                                arrPreloadFiles = json.arrResources;
                                this._appendBaseUrl(arrPreloadFiles);

                                // Load the resources with Require Js.
                                preloader.preload(arrPreloadFiles, {
                                        "bRequireCompatible": false,
                                        "scope": this
                                    },
                                    null,
                                    null,
                                    this._loadBodyTemplate,
                                    this._onError
                                );
                            }, this));
                    }
                }, this),
                this._onError
            );
        },

        "initApp": function() {
            var graphingToolModel, graphingTool,
                keyboardHolderNotExists = true,
                retrieveJsonData;

            if (MathUtilities.Components.MathEditor.Keyboard.Instance) {
                keyboardHolderNotExists = false;
            }

            if (this._options._initialState && this._options._initialState.data) {
                retrieveJsonData = this._options._initialState.data;
            }

            this._toolId = '4';

            this._options.containerElement = $(this._options.containerElement);
            this._options.containerElement.append(MathUtilities.Tools.Graphing.templates.templates({
                "keyboardHolderNotExists": keyboardHolderNotExists
            }).trim());

            MathUtilities.Components.Graph.Models.plotterModel.BASEPATH = this._basePath;

            graphingToolModel = new MathUtilities.Tools.Graphing.Models.GraphingToolModel({
                "isAccessible": this._options.accessibility
            });

            MathUtilities.Tools.Graphing.Models.GraphingToolModel.BASEPATH = this._basePath;

            graphingTool = new MathUtilities.Tools.Graphing.Views.GraphingToolView({
                "el": $(this._options.containerElement),
                "model": graphingToolModel,
                "data": retrieveJsonData
            });
            this._appObj = graphingTool;
            this._onSuccess();

            return this;

        },

        "unload": function() {
            if (this._appObj && $('#tool-holder-' + this._toolId).length !== 0) {
                delete this._appObj;
                $('body').append($('.math-utilities-math-editor-keyboard'));
                $('#tool-holder-' + this._toolId).remove();
                $('.math-utilities-math-editor-keyboard').hide();
                this._onUnloadSuccess();
            } else {
                this._onUnloadError();
            }
        },

        "_loadBodyTemplate": function() {
            $.ajax({
                "url": this._basePath + 'data/tools/lang/' + this._options.lang + '/tools/graphing-plotting/acc-data.json',
                "success": _.bind(function(json) {
                    MathUtilities.Tools.Graphing.Models.GraphingToolModel.JSON_DATA = json;
                    this.initApp();

                }, this)
            });
        }
    });

    return App;

});
