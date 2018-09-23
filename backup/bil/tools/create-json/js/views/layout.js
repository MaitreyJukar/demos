(function (JSONCreator) {
    var layoutTpl = JSONCreator.Templates.layout;
    var Layout = JSONCreator.Views.Base.extend({
        className: "layout-el container",
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
            this.initComponents();
        },

        constructor: function LayoutView() {
            return JSONCreator.Views.Base.prototype.constructor.apply(this, arguments);
        },

        events: function () {
            return {
                "click .add-new-component": "onAddNewCompClicked",
                "click .delete-layout": "onDeleteBtnClicked",
                "change .layout-type": "updateType",
                "change .left-width": "onLeftWidthChanged",
                "change .right-width": "onRightWidthChanged"
            };
        },

        attachListeners: function () {
            this.model.get("components").on("add", this.createComponentView.bind(this));
            this.model.get("lcomponents").components.on("add", this.createLComponentView.bind(this));
            this.model.get("rcomponents").components.on("add", this.createRComponentView.bind(this));
            this.listenTo(this.model, "change:multi", this.renderMulti);
            this.listenTo(this.model, "change:_lwidth", this.renderLWidth);
            this.listenTo(this.model, "change:_rwidth", this.renderRWidth);
        },

        render: function () {
            var dataTpl = JSON.parse(JSON.stringify(this.model.toBackboneJSON()));
            this.$el.html(layoutTpl(dataTpl));
            return this.renderMulti()
                .renderLWidth()
                .renderRWidth();
        },

        renderMulti: function () {
            var isMulti = this.model.get("multi");
            var selector = (isMulti) ? "multi" : "single";
            this.$(".control-wrapper .layout-type." + selector).prop('checked', true);

            if (isMulti) {
                this.$(".multi-component-container-wrapper").removeClass("hide");
                this.$(".component-container-wrapper").addClass("hide");
            } else {
                this.$(".multi-component-container-wrapper").addClass("hide");
                this.$(".component-container-wrapper").removeClass("hide");
            }
            return this;
        },

        renderLWidth: function () {
            this.$(".left-width").val(this.model.get("_lwidth"));
            return this;
        },

        renderRWidth: function () {
            this.$(".right-width").val(this.model.get("_rwidth"));
            return this;
        },

        updateType: function (event) {
            this.model.set("multi", $(event.currentTarget).hasClass("multi"));
        },

        onAddNewCompClicked: function (event) {
            var layoutType = $(event.currentTarget).attr("data-layout-type");
            this.addNewComponent(layoutType);
        },

        onDeleteBtnClicked: function () {
            if (window.confirm("Are you sure you want to delete this Layout? All the components in it will be deleted")) {
                this.rekt();
            }
        },

        rekt: function () {
            var compCollection = this.model.get("components");
            var lCompCollection = this.model.get("lcomponents").components;
            var rCompCollection = this.model.get("rcomponents").components;
            for (var i = 0; i < compCollection.models.length; i++) {
                compCollection.models[i].detonate();
            }
            for (var i = 0; i < lCompCollection.models.length; i++) {
                lCompCollection.models[i].detonate();
            }
            for (var i = 0; i < rCompCollection.models.length; i++) {
                rCompCollection.models[i].detonate();
            }
            this.getRekt("layout", "layouts");
        },

        onLeftWidthChanged: function () {
            this.model.set("_lwidth", this.$(".left-width").val());
        },

        onRightWidthChanged: function () {
            this.model.set("_rwidth", this.$(".right-width").val());
        },

        addNewComponent: function (layoutType, compType) {
            if (compType === void 0) { compType = "learnosity"; }
            var collec;
            var __path;
            switch (layoutType) {
                case "left-component":
                    collec = this.model.get("lcomponents").components;
                    __path = "lcomponents.components";
                    break;
                case "right-component":
                    collec = this.model.get("rcomponents").components;
                    __path = "rcomponents.components";
                    break;
                case "sing-component":
                    collec = this.model.get("components");
                    __path = "components";
                    break;
                default:
                    console.warn("[Unknown Layout Type] Unknown layout type was found", layoutType);
            }
            collec.addItem({
                type: compType,
                __path: __path
            });
        },

        createComponentView: function () {
            var componentsCollection = this.model.get("components");
            var cModel = componentsCollection.models[componentsCollection.length - 1];
            var cView = new JSONCreator.Views.Component({
                model: cModel
            });
            this.addImageChangeListener(cModel, cView);
            this.attachRektListener(cView);
            this.$(".component-container").append(cView.$el);
        },

        createLComponentView: function () {
            var lComponentsCollection = this.model.get("lcomponents").components;
            var cModel = lComponentsCollection.models[lComponentsCollection.length - 1];
            var cView = new JSONCreator.Views.Component({
                model: cModel
            });
            this.addImageChangeListener(cModel, cView);
            this.attachRektListener(cView);
            this.$(".left-component-container").append(cView.$el);
        },

        createRComponentView: function () {
            var rComponentsCollection = this.model.get("rcomponents").components;
            var cModel = rComponentsCollection.models[rComponentsCollection.length - 1];
            var cView = new JSONCreator.Views.Component({
                model: cModel
            });
            this.addImageChangeListener(cModel, cView);
            this.attachRektListener(cView);
            this.$(".right-component-container").append(cView.$el);
        },

        initComponents: function () {
            /* console.info("initComponents", this.model); */
            var comps = this.model.get("components");
            var lComps = this.model.get("lcomponents").components;
            var rComps = this.model.get("rcomponents").components;
            for (var i = 0; i < comps.models.length; i++) {
                var cView = new JSONCreator.Views.Component({
                    model: comps.models[i]
                });
                this.addImageChangeListener(comps.models[i], cView);
                this.attachRektListener(cView);
                this.appendCompView(cView, ".component-container");
            }
            for (i = 0; i < lComps.models.length; i++) {
                var cView = new JSONCreator.Views.Component({
                    model: lComps.models[i]
                });
                this.addImageChangeListener(lComps.models[i], cView);
                this.attachRektListener(cView);
                this.appendCompView(cView, ".left-component-container");
            }
            for (i = 0; i < rComps.models.length; i++) {
                var cView = new JSONCreator.Views.Component({
                    model: rComps.models[i]
                });
                this.addImageChangeListener(rComps.models[i], cView);
                this.attachRektListener(cView);
                this.appendCompView(cView, ".right-component-container");
            }

            if (comps.models.length === 0) {
                this.addNewComponent("sing-component");
            }
            if (lComps.models.length === 0) {
                this.addNewComponent("left-component");
            }
            if (rComps.models.length === 0) {
                this.addNewComponent("right-component");
            }
        },

        addImageChangeListener: function (cModel, cView) {
            this.listenTo(cView, "image-changed", this.onImageCompImageChanged.bind(this));
            this.listenTo(cView, "type-changed", this.onCompTypeChanged.bind(this, cModel, cView));
            this.listenTo(cView, "json-component-created", this.onJSONCompCreated.bind(this));
        },

        onJSONCompCreated: function (constr, jModel, cView) {
            this.trigger("json-component-created", constr, jModel, cView);
        },

        onImageCompImageChanged: function (cView, iModel) {
            this.trigger("image-changed", cView, iModel);
        },

        onCompTypeChanged: function (cModel, cView) {
            this.trigger("type-changed", cModel, cView);
        },

        appendCompView: function (view, selector) {
            this.$(selector).append(view.$el);
        }
    }, {

    });
    Handlebars.registerHelper("layout", function (data, opts) {
        return layoutTpl(data, opts);
    });

    JSONCreator.Views.Layout = Layout;
})(window.JSONCreator);