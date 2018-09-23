(function (JSONCreator) {
    var compTpl = JSONCreator.Templates.component;
    var Component = JSONCreator.Views.Base.extend({
        className: "view-ele",
        _mainCompnent: null,

        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
            this.initComponent();
        },

        constructor: function ComponentView() {
            return JSONCreator.Views.Base.prototype.constructor.apply(this, arguments);
        },

        events: function () {
            return {
                "change .component-type": "onTypeChanged",
                "click .delete-compo": "onCompDeleteBtnClicked"
            };
        },

        attachListeners: function () {
            this.listenTo(this.model, "change:type", this.renderCType);
        },

        render: function () {
            var dataTpl = JSON.parse(JSON.stringify(this.model.toBackboneJSON()));
            this.$el.html(compTpl(dataTpl));
            return this.renderCType();
        },

        renderCType: function () {
            this.$(".component-type").val(this.model.getType());
            if (this._mainCompnent !== null) {
                this.createEmptyComponent();
            }
            return this;
        },

        onTypeChanged: function (event) {
            this.model.setType(this.$(".component-type").val());
        },

        onCompDeleteBtnClicked: function (event) {
            if (window.confirm("Are you sure you want to delete this " + this.model.getType() + " component?")) {
                this.rekt();
            }
        },

        rekt: function () {
            if (this.model.get("dataModel") && typeof this.model.get("dataModel").detonate === "function") {
                this.model.get("dataModel").detonate();
            }
            this.getRekt("component", this.model.get("__path"));
        },

        initComponent: function () {
            var type = this.model.get("type");
            var subType = this.model.get("subType");
            var ModelConstructor, ViewConstructor;
            var constructors = this.getModelViewConstructors(type, subType);
            ModelConstructor = constructors.ModelConstructor;
            ViewConstructor = constructors.ViewConstructor;
            var model, view;

            var dataToSet = this.model.toBackboneJSON();
            delete dataToSet.modelID;
            delete dataToSet.dataModel;
            model = new ModelConstructor(dataToSet);
            if (ModelConstructor === JSONCreator.Models.Image) {
                this.listenTo(model, "change:imgID change:__imageIDType", (function (iModel) {
                    this.trigger("image-changed", this, iModel);
                }).bind(this, model));
            }
            view = new ViewConstructor({
                model: model,
                el: this.$(".component-data")
            });

            /* console.info("initComponent: view:", type, view); */
            this._mainCompnent = view;
            this.model.set("dataModel", model);
        },

        createEmptyComponent: function () {
            if (this._mainCompnent) {
                this._mainCompnent.boom();
            }
            var type = this.model.get("type");
            var subType = this.model.get("subType");
            var constructors = this.getModelViewConstructors(type, subType);
            var model, view;

            if (this.$(".component-data").length === 0) {
                this.$(".component-details").append("<div class=\"component-data\"></div>");
            }
            model = new constructors.ModelConstructor();
            view = new constructors.ViewConstructor({
                model: model,
                el: this.$(".component-data")
            });
            this._mainCompnent = view;
            this.model.set("dataModel", model);
            this.trigger("type-changed");
            if (constructors.ModelConstructor === JSONCreator.Models.Image) {
                this.listenTo(model, "change:imgID change:__imageIDType", (function (iModel) {
                    this.trigger("image-changed", this, iModel);
                }).bind(this, model));
            } else if (constructors.ModelConstructor === JSONCreator.Models.AlgebraTiles) {
                this.trigger("json-component-created", JSONCreator.Models.AlgebraTiles, model, this);
            }
        },

        getModelViewConstructors: function (type, subType) {
            var ModelConstructor, ViewConstructor;
            switch (type) {
                case "learnosity":
                    ModelConstructor = JSONCreator.Models.Learnosity;
                    ViewConstructor = JSONCreator.Views.Learnosity;
                    break;
                case "html":
                    ModelConstructor = JSONCreator.Models.HTML;
                    ViewConstructor = JSONCreator.Views.HTML;
                    break;
                case "controls":
                    ModelConstructor = JSONCreator.Models.Controls;
                    ViewConstructor = JSONCreator.Views.Controls;
                    break;
                case "image":
                    ModelConstructor = JSONCreator.Models.Image;
                    ViewConstructor = JSONCreator.Views.Image;
                    break;
                case "custom":
                    switch (subType) {
                        case "grid":
                            ModelConstructor = JSONCreator.Models.AlgebraTiles;
                            ViewConstructor = JSONCreator.Views.AlgebraTiles;
                            break;
                        default:
                            console.info("Custom Component Sub Type not found:", subType, this.model);
                    }
                    break;
                case "desmos":
                    ModelConstructor = JSONCreator.Models.Desmos;
                    ViewConstructor = JSONCreator.Views.Desmos;
                    break;
                default:
                    console.info("Component Type not found:", type, this.model);
            }
            return {
                ModelConstructor: ModelConstructor,
                ViewConstructor: ViewConstructor
            };
        }
    }, {

    });
    Handlebars.registerHelper("component", function (data, opts) {
        return compTpl(data, opts);
    });

    JSONCreator.Views.Component = Component;
})(window.JSONCreator);