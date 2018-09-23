define("app6", function() {
    var App = MathUtilities.Tools.BaseApp.extend({
        "initialize": function(appOptions) {
            App.__super__.initialize.apply(this, arguments);
        },

        "setDefaults": function() {
            App.__super__.setDefaults.apply(this, arguments);
        },

        "preload": function(preloader) {
            // Loading the requirePreloader first with its dependencies, i.e backbone, and loading backbone with dependencies first jquery and underscore.

            // Keep this obj alive in closure.
            var self = this,
                arrPreloadFiles = null;
            require(["preloader"], function(preloader) {
                    var jsonPath = self._basePath + 'data/tools/common/tools/matrix-tool/';
                    if (self.minify === true) {
                        jsonPath += 'app.json';
                        self.initApp();
                    } else {
                        jsonPath += 'file-list.json';
                        $.getJSON(jsonPath,
                            function(json) {
                                // We get json object, that contains an array of resources. Use them to preload files.
                                arrPreloadFiles = json.arrResources;
                                self._appendBaseUrl(arrPreloadFiles);

                                // Load the resources with Require Js.
                                preloader.preload(arrPreloadFiles, {
                                        "bRequireCompatible": true,
                                        "scope": self
                                    },
                                    null,
                                    null,
                                    self.initApp,
                                    self._onError
                                );
                            });
                    }
                },
                this._onError
            );
        },

        "initApp": function() {
            var self = this,
                matrixToolModel = null,
                matrixToolView = null,
                retrieveJsonData;

            this._toolId = '6';

            retrieveJsonData = this.data;

            $(this._options.containerElement).append(MathUtilities.Tools.MatrixTool.templates.matrixToolHolder().trim());

            //store basepath in MatrixToolHolder Model
            MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.MatrixToolHolder.BASEPATH = self._basePath;

            //store accessibility state
            

            $.ajax({
                "url": self._basePath + 'data/tools/lang/' + self._options.lang + '/tools/matrix-tool/acc-data.json',
                "success": function(accjson) {
                    matrixToolModel = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Models.MatrixToolHolder();
                    matrixToolView = new MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.MatrixToolHolder({
                        "model": matrixToolModel,
                        "el": $(self._options.containerElement),
                        "bAllowAccessibility": self._options.accessibility,
                        "accJsonData": accjson,
                        "startTabIndex": self._options.startTabIndex,
                        "data": retrieveJsonData
                    });
                    self._onSuccess();
                },
                "error": function(a, b, c) {}
            });

            self._appObj = matrixToolView;

            return this;

        },

        "unload": function() {
            if (this._appObj && $('#tool-holder-' + this._toolId).length !== 0) {
                delete this._appObj;
                $('#tool-holder-' + this._toolId).remove();
                this._onUnloadSuccess();
            } else {
                this._onUnloadError();
            }
        },

        "_loadBodyTemplate": function(strHtml) {
            this._onLoadBodyTemplate(MathUtilities.Tools.Calculator.templates.bodyTemplate());
        },

        "_onLoadBodyTemplate": function(strHtml) {
            var tempElem = document.createElement("div");
            tempElem.innerHTML = strHtml;
            this._options.containerElement.appendChild(tempElem);
            this._loadBaseJson();
        },

        "_loadBaseJson": function() {}
    });

    return App;

});