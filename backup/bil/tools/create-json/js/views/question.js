(function (JSONCreator) {
    var queTpl = JSONCreator.Templates.question;
    var Question = JSONCreator.Views.Base.extend({
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
            this.initLayouts();
        },

        constructor: function QuestionView() {
            return JSONCreator.Views.Base.prototype.constructor.apply(this, arguments);
        },

        events: function () {
            return {
                "click .add-new-layout": "addNewLayout",
                "click .delete-question": "onDeleteQuestionBtnClicked",
                "change .audio-id": "onAudioIDChanged",
                "change .caption": "onCaptionChanged",
                "change .validation": "onValidationChanged",
                "change .audio-resource-type": "onAudioTypeChanged",
                "click .clear-audio": "onClearBtnClicked"
            };
        },

        attachListeners: function () {
            this.model.get("layouts").on("add", this.createLayoutView.bind(this));
            this.listenTo(this.model, "change:caption", this.renderCaption);
            this.listenTo(this.model, "change:audioID", this.renderAudioID);
            this.listenTo(this.model, "change:validate", this.renderValidation);
            this.listenTo(this.model, "change:__audioIDType", this.renderAudioSelect);
        },

        addNewLayout: function () {
            this.model.get("layouts").addItem({});
        },

        onDeleteQuestionBtnClicked: function () {
            if (window.confirm("Are you sure you want to delete this Question? All the layouts and components in it will be deleted")) {
                this.rekt();
            }
        },

        rekt: function () {
            var layoutCollection = this.model.get("layouts");
            for (var i = 0; i < layoutCollection.models.length; i++) {
                layoutCollection.models[i].detonate();
            }
            this.onClearBtnClicked();
            this.getRekt("question", "questions");
        },

        render: function () {
            var tplData = this.model.toBackboneJSON();
            this.$el.append(queTpl(tplData));
            return this.renderCaption()
                .renderAudioID()
                .renderAudioSelect()
                .renderValidation()
                .setFileDetails();
        },

        renderCaption: function () {
            this.$(".control-wrapper .caption").val(this.model.get("caption"));
            return this;
        },

        renderAudioID: function () {
            // this.$(".control-wrapper .audio-id").val(this.model.get("audioID"));
            // this.$(".audio-id")[0].files[0] = this.model.get("audioID");
            if (this.model.get("audioID")) {
                var blobURL = URL.createObjectURL(this.model.get("audioID"));
                this.$("audio.audio-tag").attr("src", blobURL);
                this.enableInput(".audio-resource-type");
                this.enableInput(".caption");
                this.$(".audio-details .file-data").addClass("file-added");
                this.$(".audio-details .audio-data-text").html("Change audio: <b>" + this.model.get("audioID").name + "</b>");
            } else {
                this.$("audio.audio-tag").attr("src", "");
                this.disableInput(".audio-resource-type");
                this.disableInput(".caption");
                this.$(".audio-details .file-data").removeClass("file-added");
                this.$(".audio-details .audio-data-text").html("Add audio");
            }
            console.info("Audio changed", this.model.get("audioID"));

            return this;
        },

        renderAudioSelect: function () {
            this.$(".audio-resource-type").val(this.model.get("__audioIDType"));
            return this;
        },

        renderValidation: function () {
            this.$(".control-wrapper .validation").prop('checked', this.model.get("validate"));
            return this;
        },

        setFileDetails: function () {
            var file = this.model.get("audioID");
            if (file) {
                this.model.set("__audioFileChange", file.size + file.lastModified);
            } else {
                this.model.set("__audioFileChange", file);
            }
            return this;
        },

        createLayoutView: function () {
            var layoutCollection = this.model.get("layouts");
            var lModel = layoutCollection.models[layoutCollection.length - 1];
            var lView = new JSONCreator.Views.Layout({
                model: lModel
            });
            this.addImageChangeListener(lModel, lView);
            this.attachRektListener(lView);
            this.$(".layout-container").append(lView.$el);
        },

        initLayouts: function () {
            var layoutCollection = this.model.get("layouts");
            for (var i = 0; i < layoutCollection.models.length; i++) {
                var lView = new JSONCreator.Views.Layout({
                    model: layoutCollection.models[i]
                });
                this.addImageChangeListener(layoutCollection.models[i], lView);
                this.attachRektListener(lView);
                this.$(".layout-container").append(lView.$el);
            }
            if (layoutCollection.models.length === 0) {
                layoutCollection.addItem({});
            }
        },

        onAudioIDChanged: function () {
            this.model.set("audioID", this.$(".audio-id")[0].files[0], {
                silent: true
            });
            this.setFileDetails();
        },

        onCaptionChanged: function () {
            this.model.set("caption", this.$(".caption").val());
        },

        onValidationChanged: function () {
            this.model.set("validate", this.$(".validation").prop("checked"));
        },

        onAudioTypeChanged: function () {
            this.model.set("__audioIDType", this.$(".audio-resource-type").val());
        },

        onClearBtnClicked: function () {
            this.$(".audio-id").val("");
            this.model.set("audioID", void 0);
            this.model.set("caption", void 0);
        },

        addImageChangeListener: function (lModel, lView) {
            this.listenTo(lView, "image-changed", this.onImageCompImageChanged.bind(this));
            this.listenTo(lView, "type-changed", this.onCompTypeChanged.bind(this));
            this.listenTo(lView, "json-component-created", this.onJSONCompCreated.bind(this));
        },

        onImageCompImageChanged: function (constr, iModel) {
            this.trigger("image-changed", constr, iModel);
        },

        onJSONCompCreated: function (constr, jModel, cView) {
            this.trigger("json-component-created", constr, jModel, cView);
        },

        onCompTypeChanged: function(cModel, cView) {
            this.trigger("type-changed", cModel, cView);
        }
    }, {

    });
    Handlebars.registerHelper("question", function (data, opts) {
        return queTpl(data, opts);
    });

    JSONCreator.Views.Question = Question;
})(window.JSONCreator);