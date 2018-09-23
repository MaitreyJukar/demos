/* globals _, MathUtilities, $ */

define("app1", function() {
    var App = MathUtilities.Tools.BaseApp.extend({

        "equationJson": null,
        "keysJson": null,
        "initialize": function(appOptions) {
            MathUtilities.Tools.BaseApp.prototype.initialize.call(this, arguments);
            this.keysJson = {
                "common": [{
                    "state": [{
                        "keyType": "allClear",
                        "keyClass": "common-key",
                        "id": "allClear"
                    }]
                }],
                "scientific": [{
                    "state": [{
                        "display": "Inv",
                        "keyType": "inverse",
                        "keyClass": "inverse-key first small-btn-down-margin base-small-btn scientific-panel-child",
                        "id": "inverse"
                    }]
                }, {
                    "state": [{
                        "display": "",
                        "keyClass": "blank-key small-btn-down-margin small-btn-left-margin",
                        "id": "blank"

                    }]
                }, {
                    "state": [{
                        "id": "radianSelect",
                        "display": "Rad",
                        "keyType": "degreeRadian",
                        "keyClass": "deg-rad-key active small-btn-down-margin small-btn-left-margin scientific-panel-child"
                    }]
                }, {
                    "state": [{
                        "id": "degreeSelect",
                        "display": "Deg",
                        "keyType": "degreeRadian",
                        "keyClass": "deg-rad-key small-btn-down-margin small-btn-left-margin scientific-panel-child"
                    }]
                }, {
                    "state": [{
                        "display": "x<sup class='sup'>y</sup>",
                        "keyType": "power",
                        "keyClass": "normal xBasedFunction small-btn-down-margin base-small-btn scientific-panel-child",
                        "data": "\\left(\\right)^{}",
                        "latexWithPlaceHolder": "\\left(placeHolder\\right)^{}",
                        "id": "yth-power"
                    }]
                }, {
                    "state": [{
                        "display": "",
                        "keyType": "root",
                        "data": "\\sqrt[]{ }",
                        "keyClass": "first inverse xBasedFunction small-btn-down-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\sqrt[]{\\left(placeHolder\\right)}",
                        "id": "yth-root"
                    }]
                }, {
                    "state": [{
                        "display": "x<sup class='sup'>2</sup>",
                        "keyType": "square",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "data": "\\left(\\right)^2",
                        "latexWithPlaceHolder": "\\left(placeHolder\\right)^2",
                        "id": "square"
                    }]
                }, {
                    "state": [{
                        "display": "v",
                        "keyType": "squareRoot",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\sqrt\\left(placeHolder\\right)",
                        "id": "square-root"
                    }]
                }, {
                    "state": [{
                        "display": "1/x",
                        "keyType": "reciprocal",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "data": "\\frac{1}{}",
                        "latexWithPlaceHolder": "\\frac{1}{placeHolder}",
                        "id": "reciprocal"
                    }]
                }, {
                    "state": [{
                        "display": "sin",
                        "keyType": "sin",
                        "data": "\\sin\\left(\\right)",
                        "keyClass": "first normal xBasedFunction small-btn-down-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\sin\\left(placeHolder\\right)",
                        "id": "sin"
                    }]
                }, {
                    "state": [{
                        "display": "",
                        "keyType": "sin1",
                        "data": "\\sin^{-1}\\left(\\right)",
                        "keyClass": "first inverse xBasedFunction small-btn-down-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\sin^{-1}\\left(placeHolder\\right)",
                        "id": "sin-inv"
                    }]
                }, {
                    "state": [{
                        "display": "x!",
                        "keyType": "factorial",
                        "data": "!",
                        "keyClass": "small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "placeHolder!",
                        "id": "factorial"

                    }]
                }, {
                    "state": [{
                        "display": "p",
                        "keyType": "pi",
                        "data": "\\pi",
                        "keyClass": "small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "id": "pi"
                    }]
                }, {
                    "state": [{
                        "display": "%",
                        "keyType": "percentage",
                        "data": "%",
                        "latexWithPlaceHolder": "placeHolder%",
                        "keyClass": "small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "id": "percentage"
                    }]
                }, {
                    "state": [{
                        "display": "cos",
                        "keyType": "cos",
                        "data": "\\cos\\left(\\right)",
                        "keyClass": "first normal xBasedFunction small-btn-down-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\cos\\left(placeHolder\\right)",
                        "id": "cos"
                    }]
                }, {
                    "state": [{
                        "display": "",
                        "keyType": "cos1",
                        "data": "\\cos^{-1}\\left(\\right)",
                        "keyClass": "first inverse xBasedFunction small-btn-down-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\cos^{-1}\\left(placeHolder\\right)",
                        "id": "cos-inv"
                    }]
                }, {
                    "state": [{
                        "display": "log",
                        "keyType": "log",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "data": "\\log\\left(\\right)",
                        "latexWithPlaceHolder": "\\log\\left(placeHolder\\right)",
                        "id": "log"
                    }]
                }, {
                    "state": [{
                        "display": "e",
                        "keyType": "euler",
                        "data": "e",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "id": "euler"
                    }]
                }, {
                    "state": [{
                        "display": "ABS",
                        "keyType": "absolute",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "data": "\\left\\lpipe\\right\\rpipe",
                        "latexWithPlaceHolder": "\\left\\lpipeplaceHolder\\right\\rpipe",
                        "id": "absolute"
                    }]
                }, {
                    "state": [{
                        "display": "tan",
                        "keyType": "tan",
                        "data": "\\tan\\left(\\right)",
                        "keyClass": "normal xBasedFunction small-btn-down-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\tan\\left(placeHolder\\right)",
                        "id": "tan"

                    }]
                }, {
                    "state": [{
                        "display": "",
                        "keyType": "tan1",
                        "data": "\\tan^{-1}\\left(\\right)",
                        "keyClass": "first inverse xBasedFunction small-btn-down-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\tan^{-1}\\left(placeHolder\\right)",
                        "id": "tan-inv"
                    }]
                }, {
                    "state": [{
                        "display": "ln",
                        "keyType": "naturalLog",
                        "data": "\\ln\\left(\\right)",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "latexWithPlaceHolder": "\\ln\\left(placeHolder\\right)",
                        "id": "naturalLog"

                    }]
                }, {
                    "state": [{
                        "display": "ENG",
                        "keyType": "eng",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "id": "eng"
                    }]
                }, {
                    "state": [{
                        "display": "EXP",
                        "keyType": "exp",
                        "keyClass": "xBasedFunction small-btn-down-margin small-btn-left-margin base-small-btn scientific-panel-child",
                        "data": "\\cdot10^{}",
                        "latexWithPlaceHolder": "placeHolder\\cdot10^{}",
                        "id": "exp"
                    }]
                }],

                "standard": [{
                    "state": [{
                        "keyClass": "first standard-btn-down-margin standard-key large-key",
                        "keyType": "fd",
                        "id": "frac-decimal"
                    }]
                }, {
                    "state": [{
                        "display": "( )",
                        "keyType": "bracket",
                        "keyClass": "standard-btn-left-margin large-key standard-key bracket-key xBasedFunction standard-panel-child",
                        "id": "bracket"
                    }]
                }, {
                    "state": [{
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key miscellaneous-key standard-panel-child",
                        "keyType": "backspace",
                        "id": "backspace"
                    }]
                }, {
                    "state": [{
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key operator-key standard-panel-child",
                        "keyType": "plusminus",
                        "id": "plus-minus"
                    }]
                }, {
                    "state": [{
                        "display": "7",
                        "keyClass": "first standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "7",
                        "id": "key-seven"
                    }]
                }, {
                    "state": [{
                        "display": "8",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "8",
                        "id": "key-eight"
                    }]
                }, {
                    "state": [{
                        "display": "9",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "9",
                        "id": "key-nine"
                    }]
                }, {
                    "state": [{
                        "display": "÷",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key operator-key standard-panel-child",
                        "keyType": "divide",
                        "id": "divide"
                    }]
                }, {
                    "state": [{
                        "display": "4",
                        "keyClass": "first standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "4",
                        "id": "key-four"
                    }]
                }, {
                    "state": [{
                        "display": "5",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "5",
                        "id": "key-five"
                    }]
                }, {
                    "state": [{
                        "display": "6",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "6",
                        "id": "key-six"
                    }]
                }, {
                    "state": [{
                        "display": "×",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key operator-key standard-panel-child",
                        "data": "\\cdot",
                        "id": "multiply"
                    }]
                }, {
                    "state": [{
                        "display": "1",
                        "keyClass": "first standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "1",
                        "id": "key-one"
                    }]
                }, {
                    "state": [{
                        "display": "2",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "2",
                        "id": "key-two"
                    }]
                }, {
                    "state": [{
                        "display": "3",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "3",
                        "id": "key-three"
                    }]
                }, {
                    "state": [{
                        "display": "-",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key operator-key standard-panel-child",
                        "data": "-",
                        "id": "minus"
                    }]
                }, {
                    "state": [{
                        "display": "0",
                        "keyClass": "first standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": "0",
                        "id": "key-zero"
                    }]
                }, {
                    "state": [{
                        "display": ".",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key number-key standard-panel-child",
                        "data": ".",
                        "id": "dot"
                    }]
                }, {
                    "state": [{
                        "display": "=",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key equal-key standard-panel-child",
                        "keyType": "equal",
                        "id": "equal"
                    }]
                }, {
                    "state": [{
                        "display": "+",
                        "keyClass": "standard-btn-left-margin standard-btn-down-margin large-key standard-key operator-key standard-panel-child",
                        "data": "+",
                        "id": "plus"
                    }]
                }]
            };

            /*
            All magical numbers reference is given below.
            8730: square root character √
            32: space character
            39: Down Arrow
            61: Equal sign character
            67: character 'C'
            85: character 'P'
            92: backslash \
            97: character 'a'
            98: character 'b'
            99: character 'c'
            100: character 'd'
            101: character 'e'
            102: character 'f'
            103: character 'g'
            104: character 'h'
            105: character 'i'
            108: character 'l'
            109: character 'm'
            110: character 'n'
            111: character 'o'
            112: character 'p'
            114: character 'r'
            115: character 's'
            116: character 't'
            117: character 'u'
            120: character 'x'
            */
            this.equationJson = {
                "sqrt": {
                    "keyCode": "8730",
                    "render": true
                },

                "arcsin": {
                    "keyCode": "92,97,114,99,115,105,110,32",
                    "render": true
                },
                "sinh": {
                    "keyCode": "92,115,105,110,104,32",
                    "render": true
                },
                "sin": {
                    "keyCode": "92,115,105,110,32",
                    "render": true
                },

                "arccos": {
                    "keyCode": "92,97,114,99,99,111,115,32",
                    "render": true
                },
                "cosh": {
                    "keyCode": "92,99,111,115,104,32",
                    "render": true
                },
                "cos": {
                    "keyCode": "92,99,111,115,32",
                    "render": true
                },

                "arctan": {
                    "keyCode": "92,97,114,99,116,97,110,32",
                    "render": true
                },
                "tanh": {
                    "keyCode": "92,116,97,110,104,32",
                    "render": true
                },
                "tan": {
                    "keyCode": "92,116,97,110,32",
                    "render": true
                },

                "arccsc": {
                    "keyCode": "92,97,114,99,99,115,99,32",
                    "render": true
                },
                "csch": {
                    "keyCode": "92,99,115,99,104,32",
                    "render": true
                },
                "csc": {
                    "keyCode": "92,99,115,99,32",
                    "render": true
                },

                "arcsec": {
                    "keyCode": "92,97,114,99,115,101,99,32",
                    "render": true
                },
                "sech": {
                    "keyCode": "92,115,101,99,104,32",
                    "render": true
                },
                "sec": {
                    "keyCode": "92,115,101,99,32",
                    "render": true
                },

                "arccot": {
                    "keyCode": "92,97,114,99,99,111,116,32",
                    "render": true
                },
                "coth": {
                    "keyCode": "92,99,111,116,104,32",
                    "render": true
                },
                "cot": {
                    "keyCode": "92,99,111,116,32",
                    "render": true
                },

                "phi": {
                    "keyCode": "92,112,104,105,32",
                    "render": true
                },
                "pi": {
                    "keyCode": "92,112,105,32",
                    "render": true
                },

                "theta": {
                    "keyCode": "92,116,104,101,116,97,32",
                    "render": true
                },

                "ln": {
                    "keyCode": "92,108,110,32",
                    "render": true
                },

                "log": {
                    "keyCode": "92,108,111,103,32",
                    "render": true
                },

                "ceil": {
                    "keyCode": "92,108,99,101,105,108,32",
                    "render": true
                },

                "floor": {
                    "keyCode": "92,108,102,108,111,111,114,32",
                    "render": true
                },
                "min": {
                    "keyCode": "92,109,105,110,32",
                    "render": true
                },

                "max": {
                    "keyCode": "92,109,97,120,32",
                    "render": true
                },

                "lcm": {
                    "keyCode": "92,108,99,109,32",
                    "render": true
                },

                "gcd": {
                    "keyCode": "92,103,99,100,32",
                    "render": true
                },

                "mod": {
                    "keyCode": "92,109,111,100,32",
                    "render": true
                },
                "sum": {
                    "keyCode": "92,115,117,109,32,39,110,61",
                    "render": true
                },

                "prod": {
                    "keyCode": "92,112,114,111,100,32,39,110,61",
                    "render": true
                },
                "exp": {
                    "keyCode": "92,101,120,112,32",
                    "render": true
                },
                "round": {
                    "keyCode": "92,114,111,117,110,100,32",
                    "render": true
                },
                "abs": {
                    "keyCode": "92,97,98,115,32",
                    "render": true
                },
                "nCr": {
                    "keyCode": "92,110,67,114,32",
                    "render": true
                },
                "nPr": {
                    "keyCode": "92,110,80,114,32",
                    "render": true
                },
                "ncr": {
                    "keyCode": "92,110,99,114,32",
                    "render": true
                },
                "npr": {
                    "keyCode": "92,110,112,114,32",
                    "render": true
                },
                "fracdec": {
                    "keyCode": "92,102,114,97,99,100,101,99,32",
                    "render": true
                }

            };

        },

        "setDefaults": function() {
            MathUtilities.Tools.BaseApp.prototype.setDefaults.call(this, arguments);
        },

        "preload": function(preloader) {
            /*Loading the requirePreloader first with its dependencies,
             i.e backbone, and loading backbone with dependencies first jquery and underscore.*/
            // Keep this obj alive in closure.
            var arrPreloadFiles = null;
            require(["preloader"], _.bind(function(preloader) {
                    var jsonPath = this._basePath + 'data/tools/common/tools/calculator/';
                    if (this.minify) {
                        this._loadBodyTemplate();
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
                                    this._loadBodyTemplate,
                                    this._onError
                                );
                            }, this));
                    }
                }, this),
                this._onError
            );
        },

        "initApp": function(json) {
            var calculatorModel, calculatorView;

            calculatorModel = new MathUtilities.Tools.Calculator.Models.Calculator();
            calculatorModel.parseData(json);
            calculatorView = new MathUtilities.Tools.Calculator.Views.Calculator({
                "model": calculatorModel,
                "el": '#calculator',
                "bAllowAccessibility": this._options.accessibility,
                "startTabIndex": this._options.startTabIndex
            });
            /* Apply here the initial state. Access it as this._initialState . It is defined in baseApp i.e app.js
            Properties will be
            {
                 bAllowAccessibility : false;    Whether accessibility is allowed or not.  This property is common to all tool.
                 ndefaultView        : 1         1 for standard, 2 for scientific as default view. If nothing
                                                 passed, default is 1. This property is specific to Calculator
                 bDisplaySwitchButtons: true     Defaults to true to show switch buttons below, false to hide them.
            } */
            calculatorView.setOptions(this._options._initialState || {});
            calculatorView.$el.removeClass('hide-calculator');
            this._appObj = calculatorView;

            return this;
        },

        "unload": function() {
            if (this._appObj && $('#calculator').length !== 0) {
                delete this._appObj;
                $('#calculator').remove();
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

        "_switchView": function() {
            this._appObj.setOptions(this._options._initialState || {});
            this._appObj.$el.removeClass('hide-calculator');
        },

        "_loadBaseJson": function() {
            $.ajax({
                "url": this._basePath + 'data/math-utilities/components/math-editor/equation.js',
                "dataType": "text",
                "success": _.bind(function(data) {
                    // The data in the json file is not in actual JSON format. Kindly do that, so that this eval can be removed.
                    // or put the js file in preload function below.
                    if (data) {
                        eval(data);
                    }
                    var inputParams = {
                        "holderDiv": $('#math-quill-holder'),
                        "editorCall": true,
                        "basePath": this._basePath
                    };

                    //fetch accessibility JSON
                    $.ajax({
                        "url": this._basePath + 'data/tools/lang/' + this._options.lang + '/tools/calculator/acc-data.json',
                        "success": _.bind(function(json) {
                            MathUtilities.Tools.Calculator.Models.Calculator.JSON_DATA = json;

                            MathUtilities.Components.MathEditor.Models.Application.init(inputParams);
                            this.initApp(this.keysJson);

                        }, this),
                        "error": function(a, b, c) {}
                    });
                    this._onSuccess([new Tools.ErrorLogger({
                        "strLogMsg": "Calculator :: Loaded config json, template.. App initialization complete."
                    })]);
                }, this),
                "error": _.bind(this._onError, this)
            });
        }
    });

    return App;

});
