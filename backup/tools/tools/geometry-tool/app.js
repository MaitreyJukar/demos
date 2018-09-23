/* globals MathUtilities, $ */

define("app8", function() {
    'use strict';
    var App = MathUtilities.Tools.BaseApp.extend({
        "appFiles": null,
        "initialize": function() {
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
                    "url": "css/webfonts/NotoSans/regular-italic/noto-sans-italic.woff2",
                    "type": 5,
                    "name": "Noto-Sans-Italic"
                }]
            };
        },


        "preload": function() {
            // Keep this obj alive in closure.
            var arrPreloadFiles = null;
            require(["preloader"], _.bind(function(preloader) {
                    var jsonPath = this._basePath + 'data/tools/common/tools/geometry-tool/';
                    if (this.minify) {
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
            var dgtUiModel, dgtTool,
                retrieveJsonData,
                onAjaxCallSuccess;
            if (typeof this.data !== 'undefined') {
                retrieveJsonData = this.data;
            }
            this._toolId = '8';

            $(this._options.containerElement).append(MathUtilities.Tools.Dgt.templates.BodyTemplate().trim()); //add template for the same
            MathUtilities.Components.Graph.Models.plotterModel.BASEPATH = this._basePath;
            onAjaxCallSuccess = _.bind(function(accjson) {
                dgtUiModel = new MathUtilities.Tools.Dgt.Models.DgtUiModel(this._basePath, retrieveJsonData);
                dgtUiModel.set('jsonData', accjson);

                dgtTool = new MathUtilities.Tools.Dgt.Views.DgtUi({
                    "el": $(this._options.containerElement),
                    "model": dgtUiModel,
                    "data": retrieveJsonData,
                    "bAllowAccessibility": this._options.accessibility
                });
                this._appObj = dgtTool;
                this._onSuccess();
            }, this);
            $.ajax({
                "url": this._basePath + 'data/tools/lang/' + this._options.lang + '/tools/geometry-tool/acc-data.json',
                "success": onAjaxCallSuccess
            });


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
            this._onLoadBodyTemplate(MathUtilities.Tools.Calculator.templates.bodyTemplate());
        },

        "_onLoadBodyTemplate": function(strHtml) {
            var tempElem = document.createElement("div");
            tempElem.innerHTML = strHtml;
            this._options.containerElement.appendChild(tempElem);
        }
    });

    return App;

});
