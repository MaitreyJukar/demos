define("app2", function() {
    var MathUtilities = window.MathUtilities || {},
        App;

    App = MathUtilities.Tools.BaseApp.extend({
        "initialize": function(appOptions) {
            App.__super__.initialize.apply(this, arguments);
        },

        "setDefaults": function() {
            App.__super__.setDefaults.apply(this, arguments);
        },

        "preload": function(preloader) {
            // Keep this obj alive in closure.
            var self = this,
                arrPreloadFiles = null;
            require(["preloader"], function(preloader) {
                    var jsonPath = self._basePath + 'data/tools/common/tools/unit-converter/';
                    if (self.minify === true) {
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
            this._loadBodyTemplate();
        },

        "unload": function() {

            delete this._appObj;
            $('.math-utilities-tools-unit-converter').remove();
            MathUtilities.undoManager.clearModule('unit-converter')
            this._onUnloadSuccess();
        },

        "_loadBodyTemplate": function(strHtml) {
            var strHtml = MathUtilities.Tools.UnitConverter.Views.bodyTemplate();
            this._onLoadBodyTemplate(strHtml);
        },

        "_onLoadBodyTemplate": function(strHtml) {
            // Append the template into the container element.
            var tempElem = document.createElement("div");
            this._options.containerElement.appendChild(tempElem);
            $(tempElem).attr('id', 'unit-converter-holder').hide().html(strHtml);

            // Load Equation Json
            this._loadEqutionJson();

        },

        "_loadBaseJson": function() {
            var self = this;

            // Fetching JSON
            $.getJSON(this._basePath + 'data/tools/common/tools/unit-converter/unit-conversion-config.json',
                function(json) {

                    //fetch accesibility JSON
                    $.ajax({
                        "url": self._basePath + 'data/tools/lang/' + self._options.lang + '/tools/unit-converter/acc-data.json',
                        "type": 'get',
                        "success": function(accjson) {

                            $('#unit-converter-holder').show();

                            var converter = new MathUtilities.Tools.UnitConverter.Models.UnitConverter({
                                "jsonData": json,
                                "accJsonData": accjson
                            }),
                            converterView;
                            MathUtilities.Tools.UnitConverter.Models.UnitConverter.BASEPATH = self._basePath;
                            converterView = new MathUtilities.Tools.UnitConverter.Views.UnitConverter({
                                "model": converter,
                                "bAllowAccessibility": self._options.accessibility,
                                "startTabIndex": self._options.startTabIndex
                            });

                            self._onSuccess([new Tools.ErrorLogger({
                                "strLogMsg": "Unit-converter :: Loaded config, template. App Initialization complete."
                            })]);

                            self._appObj = converterView;
                        }
                    });

                },
                $.proxy(this._onError, this)
            );
        },

        "_loadEqutionJson": function() {
            var self = this;
            $.ajax({
                "url": this._basePath + 'data/components/math-editor/equation.json',
                "dataType": "html",
                "type": 'get'
            }).done(
                function(js) {
                    eval(js);
                    self._loadBaseJson();
                }).fail($.proxy(function() {}, this));

        }
    });

    return App;

});