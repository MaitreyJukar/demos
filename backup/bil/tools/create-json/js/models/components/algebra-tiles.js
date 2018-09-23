(function (JSONCreator) {
    var AlgebraTiles = JSONCreator.Models.Base.extend({
        defaults: function () {
            var prefilledObj = {};
            return {
                "modelID": _.uniqueId("algebra-tile-"),
                "type": "custom",
                "subType": "grid",
                "dataReference": {
                    "question": {
                        "operation": "Multiplication",
                        "type": "Inner",
                        "equations": [
                            {
                                "x": null,
                                "c": null
                            },
                            {
                                "x": null,
                                "c": null
                            }
                        ]
                    },
                    "showSolution": false,
                    "prefilled": prefilledObj
                },
                "__type": "Inner",
                "_vertXCoeff": null,
                "_vertXConst": null,
                "_horizXCoeff": null,
                "_horizXConst": null,
                "__showSolution": false,
                "__prefilled": prefilledObj
            };
        },

        constructor: function AlgebraTiles() {
            return JSONCreator.Models.Base.prototype.constructor.apply(this, arguments);
        },

        initialize: function AlgebraTiles() {
            var dataRef = this.get("dataReference");
            if (dataRef && dataRef.question) {
                this.set("_vertXCoeff", dataRef.question.equations[0].x);
                this.set("_vertXConst", dataRef.question.equations[0].c);
                this.set("_horizXCoeff", dataRef.question.equations[1].x);
                this.set("_horizXConst", dataRef.question.equations[1].c);
                this.set("__type", dataRef.question.type);
            }
            if (dataRef) {
                this.set("__showSolution", dataRef.showSolution);
                this.set("__prefilled", dataRef.prefilled);
            }
            this.on("change:_vertXCoeff", function () {
                var dataRef = this.get("dataReference");
                if (dataRef && dataRef.question) {
                    dataRef.question.equations[0].x = this.get("_vertXCoeff");
                    this.set("dataReference", dataRef);
                }
            });
            this.on("change:_vertXConst", function () {
                var dataRef = this.get("dataReference");
                if (dataRef && dataRef.question) {
                    dataRef.question.equations[0].c = this.get("_vertXConst");
                    this.set("dataReference", dataRef);
                }
            });
            this.on("change:_horizXCoeff", function () {
                var dataRef = this.get("dataReference");
                if (dataRef && dataRef.question) {
                    dataRef.question.equations[1].x = this.get("_horizXCoeff");
                    this.set("dataReference", dataRef);
                }
            });
            this.on("change:_horizXConst", function () {
                var dataRef = this.get("dataReference");
                if (dataRef && dataRef.question) {
                    dataRef.question.equations[1].c = this.get("_horizXConst");
                    this.set("dataReference", dataRef);
                }
            });
            this.listenTo(this, "change:__showSolution", function () {
                var dataRef = this.get("dataReference");
                dataRef.showSolution = this.get("__showSolution");
                this.set("dataReference", dataRef);
            });
            this.listenTo(this, "change:__type", function () {
                var dataRef = this.get("dataReference");
                if (dataRef && dataRef.question) {
                    dataRef.question.type = this.get("__type");
                    this.set("dataReference", dataRef);
                }
            });
        },

        toJSON: function () {
            var data = this.toBackboneJSON();
            delete data.data;
            delete data.dataModel;
            delete data._horizXCoeff;
            delete data._horizXConst;
            delete data._vertXCoeff;
            delete data._vertXConst;
            return data;
        }
    }, {
        JSON_FILE_PREFIX: "custom-algebra-tiles-"
    });

    JSONCreator.Models.AlgebraTiles = AlgebraTiles;
})(window.JSONCreator);