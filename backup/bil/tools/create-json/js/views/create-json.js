(function (JSONCreator) {
    var CreateJSON = JSONCreator.Views.Base.extend({
        _customJSONCounts: {

        },

        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
            this.initResources();
            this.initQuestion();
            window.mainApp = this;
        },

        constructor: function AuthoringToolView() {
            return JSONCreator.Views.Base.prototype.constructor.apply(this, arguments);
        },

        events: function () {
            return {
                "click .add-new-question": "addNewQuestion",
                "click .add-new-json": "addNewJSON",
                "click .add-new-image": "addNewImage",
                "click .add-new-audio": "addNewAudio",
                "change #exp-name": "updateExpID",
                "change .additional-info-container .add-info-title": "onAInfoTitleChanged",
                "change .additional-info-container .add-info-content": "onAInfoContentChanged",
                "change .additional-info-container .post-image-content": "onAInfoPostImgContentChanged",
                "change .additional-info-container .add-info-position": "onAInfoPositionChanged",
                "change .additional-info-container .has-tooltip": "onTooltipCheckboxClicked",
                "change .has-custom-css": "onCustCSSCheckboxClicked",
                "change .has-add-info-img": "onHasImageCheckboxClicked",
                "change .add-img-id": "onImgIDChanged",
                "change .add-img-alt": "onImgAltChanged",
                "change .add-img-file": "onImgFileChanged",
                "change .tooltip-image-type": "onTooltipImageType",
                "change .audio-holder .audio-id": "onAudioFileChanged"
            };
        },

        attachListeners: function () {
            var res = this.model.get("resources");
            this.model.get("questions").on("add", this.createQuestionView.bind(this));
            res.json.on("add", this.createJSONResView.bind(this));
            res.media.images.on("add", this.createImageResView.bind(this));
            res.media.images.on("destroy", function (event) {
                console.info("something was destroyed", event);
            });
            res.media.audio.on("add", this.createAudioResView.bind(this));
            this.listenTo(this.model, "change:explorationID", this.renderExpID);
            this.listenTo(this.model, "change:__title", this.renderATitle);
            this.listenTo(this.model, "change:__content", this.renderAContent);
            this.listenTo(this.model, "change:__postImgContent", this.renderAPostImageContent);
            this.listenTo(this.model, "change:__position", this.renderAPosition);
            this.listenTo(this.model, "change:__hasAdditionalInfo", this.renderACheckbox);
            this.listenTo(this.model, "change:useCustomStyle", this.renderCustCSSCheckbox);
            this.listenTo(this.model, "change:__hasAdditionalInfoImg", this.renderAIImageCheckbox);
            this.listenTo(this.model, "change:__addImgID", this.renderImgID);
            this.listenTo(this.model, "change:__addImgAltTxt", this.renderImgAlt);
            this.listenTo(this.model, "change:__tooltipImgFile", this.renderTooltipImgFile);
            this.listenTo(this.model, "change:__tooltipImgType", this.renderTooltipImgType);
            this.listenTo(this.model, "change:__tooltipAudioFile", this.renderAudioFile);
            this.listenTo(this.model, "change:__tooltipAudioType", this.renderAudioType);
        },

        addNewQuestion: function () {
            this.model.get("questions").addItem({});
        },

        addNewJSON: function (type) {
            if (type === void 0) { type = "EXPLORATION_COMMON_JSON"; }
            var res = this.model.get("resources");
            res.json.addItem({
                type: type
            });
        },

        addNewImage: function (type) {
            if (type === void 0) { type = "EXPLORATION_COMMON_IMAGE"; }
            var res = this.model.get("resources");
            res.media.images.addItem({
                type: type
            });
        },

        addNewAudio: function (type) {
            if (type === void 0) { type = "EXPLORATION_LANG_AUDIO"; }
            var res = this.model.get("resources");
            res.media.audio.addItem({
                type: type
            });
        },

        updateExpID: function () {
            this.model.set("explorationID", this.$("#exp-name").val());
        },

        onAInfoTitleChanged: function () {
            this.model.set("__title", this.$(".additional-info-container .add-info-title").val());
        },

        onAInfoContentChanged: function () {
            this.model.set("__content", this.$(".additional-info-container .add-info-content").val());
        },

        onAInfoPostImgContentChanged: function () {
            this.model.set("__postImgContent", this.$(".additional-info-container .post-image-content").val());
        },

        onAInfoPositionChanged: function () {
            this.model.set("__position", this.$(".additional-info-container .add-info-position").val());
        },

        onTooltipCheckboxClicked: function () {
            this.model.set("__hasAdditionalInfo", this.$(".additional-info-container .has-tooltip").prop("checked"));
        },

        onCustCSSCheckboxClicked: function () {
            this.model.set("useCustomStyle", this.$(".has-custom-css").prop("checked"));
        },

        onHasImageCheckboxClicked: function () {
            this.model.set("__hasAdditionalInfoImg", this.$(".has-add-info-img").prop("checked"));
        },

        onImgIDChanged: function () {
            this.model.set("__addImgID", this.$(".add-img-id").val());
        },

        onImgAltChanged: function () {
            this.model.set("__addImgAltTxt", this.$(".add-img-alt").val());
        },

        onImgFileChanged: function () {
            this.model.set("__tooltipImgFile", this.$(".add-img-file")[0].files[0], { silent: true });
            this.setFileDetails();
            console.info("Tooptip image changed");
        },

        onTooltipImageType: function () {
            this.model.set("__tooltipImgType", this.$(".tooltip-image-type").val());
        },

        onAudioFileChanged: function () {
            this.model.set("__tooltipAudioFile", this.$(".audio-holder .audio-id")[0].files[0], {
                silent: true
            });
            this.setAudioFileDetails();
        },

        setFileDetails: function () {
            var file = this.model.get("__tooltipImgFile");
            if (file) {
                this.model.set("__tooltipImgFileDetails", file.size + file.lastModified);
            } else {
                this.model.set("__tooltipImgFileDetails", file);
            }
            return this;
        },

        setAudioFileDetails: function () {
            var file = this.model.get("__tooltipAudioFile");
            if (file) {
                this.model.set("__tooltipAudioFileDetails", file.size + file.lastModified);
            } else {
                this.model.set("__tooltipAudioFileDetails", file);
            }
        },

        render: function () {
            var modelToJSON = this.model.toBackboneJSON();
            var tpl = JSONCreator.Templates.base(modelToJSON);
            this.$el.html(tpl);
            return this.renderExpID()
                .renderATitle()
                .renderAContent()
                .renderAPostImageContent()
                .renderAPosition()
                .renderACheckbox()
                .renderCustCSSCheckbox()
                .renderAIImageCheckbox()
                .renderImgID()
                .renderImgAlt()
                .renderTooltipImgFile()
                .renderTooltipImgType()
                .renderAudioFile()
                .renderAudioType()
                .renderDebug();
        },

        renderAudioFile: function () {
            var audioFile = this.model.get("__tooltipAudioFile");
            if (audioFile) {
                var blobURL = URL.createObjectURL(audioFile);
                this.$(".audio-holder audio.audio-tag").attr("src", blobURL);
                this.enableInput(".audio-resource-type");
                this.enableInput(".caption");
                this.$(".audio-holder .file-data").addClass("file-added");
                this.$(".audio-holder .audio-data-text").html("Change audio: <b>" + audioFile.name + "</b>");
            } else {
                this.$(".audio-holder audio.audio-tag").attr("src", "");
                this.disableInput(".audio-resource-type");
                this.disableInput(".caption");
                this.$(".audio-holder .file-data").removeClass("file-added");
                this.$(".audio-holder .audio-data-text").html("Add audio");
            }
            this.onTooltipAudioInfoChanged();
            return this;
        },

        renderExpID: function () {
            this.$("#exp-name").val(this.model.get("explorationID"));
            return this;
        },

        renderATitle: function () {
            this.$(".additional-info-container .add-info-title").val(this.model.get("__title"));
            return this;
        },

        renderAContent: function () {
            this.$(".additional-info-container .add-info-content").val(this.model.get("__content"));
            return this;
        },

        renderAPostImageContent: function() {
            this.$(".additional-info-container .post-image-content").val(this.model.get("__postImgContent"));
            return this;
        },

        renderAPosition: function () {
            this.$(".additional-info-container .add-info-position").val(this.model.get("__position"));
            return this;
        },

        renderACheckbox: function () {
            var isChecked = this.model.get("__hasAdditionalInfo");
            this.$(".additional-info-container .has-tooltip").prop("checked", isChecked);
            if (isChecked) {
                this.enableInput(".additional-info-container .add-info-title")
                    .enableInput(".additional-info-container .add-info-content")
                    .enableInput(".additional-info-container .add-info-position")
                    .enableInput(".additional-info-container .audio-holder .audio-id")
                    .enableInput(".additional-info-container .audio-holder .audio-type");
            } else {
                this.disableInput(".additional-info-container .add-info-title")
                    .disableInput(".additional-info-container .add-info-content")
                    .disableInput(".additional-info-container .add-info-position")
                    .disableInput(".additional-info-container .audio-holder .audio-id")
                    .disableInput(".additional-info-container .audio-holder .audio-type");
                this.model.set("__hasAdditionalInfoImg", false);
            }
            return this;
        },

        renderCustCSSCheckbox: function () {
            var isChecked = this.model.get("useCustomStyle");
            this.$(".has-custom-css").prop("checked", isChecked);
            return this;
        },

        renderAIImageCheckbox: function () {
            var isChecked = this.model.get("__hasAdditionalInfoImg");
            this.$(".has-add-info-img").prop("checked", isChecked);
            if (isChecked) {
                this.enableInput(".additional-info-container .add-img-id")
                    .enableInput(".additional-info-container .add-img-file")
                    .enableInput(".additional-info-container .add-img-alt")
                    .enableInput(".additional-info-container .tooltip-image-type")
                    .enableInput(".additional-info-container .post-image-content");
                this.model.set("__hasAdditionalInfo", isChecked);
            } else {
                this.disableInput(".additional-info-container .add-img-id")
                    .disableInput(".additional-info-container .add-img-file")
                    .disableInput(".additional-info-container .add-img-alt")
                    .disableInput(".additional-info-container .tooltip-image-type")
                    .disableInput(".additional-info-container .post-image-content");
            }
            return this;
        },

        renderImgID: function () {
            this.$(".add-img-id").val(this.model.get("__addImgID"));
            return this;
        },

        renderImgAlt: function () {
            this.$(".add-img-alt").val(this.model.get("__addImgAltTxt"));
            return this;
        },

        renderTooltipImgFile: function () {
            if (this.model.get("__tooltipImgFile")) {
                this.enableInput(".add-img-alt")
                    .enableInput(".tooltip-image-type");
                this.$(".img-file-container .file-data").addClass("file-added");
                this.$(".img-file-container .image-data-text").html("Change image: <b>" + this.model.get("__tooltipImgFile").name + "</b>");
            } else {
                this.disableInput(".add-img-alt")
                    .disableInput(".tooltip-image-type");
                this.$(".img-file-container .file-data").removeClass("file-added");
                this.$(".img-file-container .image-data-text").html("Add image");
            }
            this.onTooltipImageInfoChanged();
            return this;
        },

        renderTooltipImgType: function () {
            this.$(".tooltip-image-type").val(this.model.get("__tooltipImgType"));
            this.onTooltipImageInfoChanged();
            return this;
        },

        renderAudioType: function () {
            this.$(".audio-holder .audio-type").val(this.model.get("__tooltipAudioType"));
            this.onTooltipAudioInfoChanged();
            return this;
        },

        renderDebug: function () {
            var mothodName = (this.model.get("__DEBUG")) ? "show" : "hide";
            this.$(".resource-container")[mothodName]();
            return this;
        },

        createQuestionView: function (event) {
            var questionCollection = this.model.get("questions");
            var model = questionCollection.models[questionCollection.length - 1];
            var qView = new JSONCreator.Views.Question({
                model: model
            });
            this.attachRektListener(qView);
            this.$(".added-questions").append(qView.$el);
            this.listenTo(model, "change:audioID change:__audioIDType", this.onQModelAudioDetailsChanged.bind(this, model));
            this.listenTo(qView, "image-changed", this.onImageInfoChanged.bind(this));
            this.listenTo(qView, "type-changed", this.onQCompTypeChanged.bind(this));
            this.listenTo(qView, "json-component-created", this.onJSONCompCreated.bind(this));
        },

        onJSONCompCreated: function (constr, jModel, cView) {
            console.info("onJSONCompCreated", constr, jModel, cView);
            this._customJSONCounts[constr.JSON_FILE_PREFIX] = this._customJSONCounts[constr.JSON_FILE_PREFIX] || 0;
            this._customJSONCounts[constr.JSON_FILE_PREFIX]++;
            var type = "EXPLORATION_COMMON_JSON";
            var res = this.model.get("resources");
            res.json.addItem({
                __extID: cView.model.get("modelID"),
                _sType: "JSON",
                type: type,
                id: constr.JSON_FILE_PREFIX + this._customJSONCounts[constr.JSON_FILE_PREFIX],
                url: constr.JSON_FILE_PREFIX + this._customJSONCounts[constr.JSON_FILE_PREFIX] + ".json"
            });
        },

        onImageInfoChanged: function (cView, iModel) {
            var modelID = cView.model.get("modelID");
            var imageFile = iModel.get("imgID");
            var imageType = iModel.get("__imageIDType");
            var imageRes = this.model.get("resources").media.images;
            console.info("onImageInfoChanged", cView, iModel, imageRes);
            if (imageFile) {
                var model = imageRes.getModelByID(modelID);
                if (model) {
                    // update vals.
                    var oldType = model.get("type");
                    model.set("type", imageType);
                    if (oldType === imageType) {
                        if (imageFile.name) {
                            model.set("resourceURL", imageFile.name);
                            model.set("resourceID", _.uniqueId(imageFile.name.split(".")[0] + "-"));
                        } else {
                            model.set("resourceURL", _.uniqueId("image-") + "png");
                            model.set("resourceID", _.uniqueId("image-id-"));
                        }
                    }
                    cView.model.get("dataModel").set("__id", model.get("resourceID"));
                } else {
                    // create new model.
                    var url, id;
                    if (imageFile.name) {
                        url = imageFile.name;
                        id = _.uniqueId(imageFile.name.split(".")[0] + "-");
                    } else {
                        url = _.uniqueId("image-") + "png";
                        id = _.uniqueId("image-id-");
                    }
                    imageRes.addItem({
                        __extID: modelID,
                        type: "EXPLORATION_" + imageType.toUpperCase() + "_IMAGE",
                        url: url,
                        id: id
                    });
                    cView.model.get("dataModel").set("__id", id);
                }
            } else {
                // remove existing model.
                imageRes.removeByID(modelID);
            }
        },

        onTooltipImageInfoChanged: function () {
            var iModel = this.model;
            var modelID = this.model.get("modelID");
            var imageFile = iModel.get("__tooltipImgFile");
            var imageType = iModel.get("__tooltipImgType");
            var imageRes = this.model.get("resources").media.images;
            console.info("onTooltipImageInfoChanged", this, iModel, imageRes);
            if (imageFile) {
                var model = imageRes.getModelByID(modelID);
                if (model) {
                    // update vals.
                    var oldType = model.get("type");
                    model.set("type", imageType);
                    if (oldType === imageType) {
                        if (imageFile.name) {
                            model.set("resourceURL", imageFile.name);
                            model.set("resourceID", _.uniqueId(imageFile.name.split(".")[0] + "-"));
                        } else {
                            model.set("resourceURL", _.uniqueId("image-") + "png");
                            model.set("resourceID", _.uniqueId("image-id-"));
                        }
                    }
                    this.model.set("__tooltipImgFileID", model.get("resourceID"));
                } else {
                    // create new model.
                    var url, id;
                    if (imageFile.name) {
                        url = imageFile.name;
                        id = _.uniqueId(imageFile.name.split(".")[0] + "-");
                    } else {
                        url = _.uniqueId("image-") + "png";
                        id = _.uniqueId("image-id-");
                    }
                    imageRes.addItem({
                        __extID: modelID,
                        type: "EXPLORATION_" + imageType.toUpperCase() + "_IMAGE",
                        url: url,
                        id: id
                    });
                    this.model.set("__tooltipImgFileID", id);
                }
            } else {
                // remove existing model.
                imageRes.removeByID(modelID);
            }
        },

        onTooltipAudioInfoChanged: function () {
            var tModel = this.model;
            var modelID = tModel.get("modelID");
            var audioFile = tModel.get("__tooltipAudioFile");
            var audioType = tModel.get("__tooltipAudioType");
            var audioRes = tModel.get("resources").media.audio;
            if (audioFile) {
                var model = audioRes.getModelByID(modelID);
                var fileName = this.model.getAudioFileID();
                this.$(".audio-holder .file-data .audio-data-text b").html(fileName + ".mp3");
                this.$(".audio-holder .media-wrapper .audio-id").attr("title", fileName + ".mp3");
                if (model) {
                    // update vals.
                    var oldType = model.get("type");
                    model.set("type", audioType);
                    if (oldType === audioType) {
                        model.set("resourceURL", fileName + ".mp3");
                        model.set("resourceID", fileName);
                    }
                    tModel.set("__tooltipAudioID", model.get("resourceID"));
                } else {
                    // create new model.
                    var url, id;
                    url = fileName + ".mp3";
                    id = fileName;
                    audioRes.addItem({
                        __extID: modelID,
                        type: "EXPLORATION_" + audioType.toUpperCase() + "_AUDIO",
                        url: url,
                        id: id
                    });
                    tModel.set("__tooltipAudioID", id);
                }
            } else {
                // remove existing model.
                this.$(".audio-holder .media-wrapper .audio-id").attr("title", "No file chosen");
                audioRes.removeByID(modelID);
            }
        },

        onQModelAudioDetailsChanged: function (qModel) {
            var modelID = qModel.get("modelID");
            var audioFile = qModel.get("audioID");
            var audioType = qModel.get("__audioIDType");
            var audioRes = this.model.get("resources").media.audio;
            var questColl = this.model.get("questions");
            var queIndex = questColl.getModelIndex(qModel);
            if (audioFile) {
                var fileName = this.model.getAudioFileID(queIndex + 1);
                this.$(".question-wrapper .audio-details").eq(queIndex).find(".audio-data-text b").html(fileName + ".mp3");
                this.$(".question-wrapper .audio-details").eq(queIndex).find(".audio-id").attr("title", fileName + ".mp3");
                var model = audioRes.getModelByID(modelID);
                if (model) {
                    // update vals.
                    var oldType = model.get("type");
                    model.set("type", audioType);
                    if (oldType === audioType) {
                        model.set("resourceURL", fileName + ".mp3");
                        model.set("resourceID", fileName);
                    }
                } else {
                    // create new model.
                    var url, id;
                    url = fileName + ".mp3";
                    id = fileName;
                    audioRes.addItem({
                        __extID: modelID,
                        type: "EXPLORATION_" + audioType.toUpperCase() + "_AUDIO",
                        url: url,
                        id: id
                    });
                }
            } else {
                // remove existing model.
                this.$(".question-wrapper .audio-details").eq(queIndex).find(".audio-id").attr("title", "No file chosen");
                audioRes.removeByID(modelID);
            }
        },

        rekt: function () {
            var questionCollection = this.model.get("questions");
            for (var i = 0; i < questionCollection.models.length; i++) {
                questionCollection.models[i].detonate();
            }
        },

        createJSONResView: function () {
            var res = this.model.get("resources");
            var jsonCollection = res.json;
            var JSONModel = jsonCollection.models[jsonCollection.length - 1];
            var JSONExtraData = JSONCreator.Models.CreateJSON.JSONExtraData;
            for (var key in JSONExtraData) {
                if (JSONExtraData.hasOwnProperty(key)) {
                    JSONModel.set(key, JSONExtraData[key]);
                }
            }

            var rView = new JSONCreator.Views.Resource({
                model: JSONModel
            });
            this.$(".added-jsons").append(rView.$el);
            this.attachRektListener(rView);
        },

        createImageResView: function () {
            var res = this.model.get("resources");
            var imageCollection = res.media.images;
            var imageModel = imageCollection.models[imageCollection.length - 1];
            var ImageExtraData = JSONCreator.Models.CreateJSON.ImageExtraData;
            for (var key in ImageExtraData) {
                if (ImageExtraData.hasOwnProperty(key)) {
                    imageModel.set(key, ImageExtraData[key]);
                }
            }

            var rView = new JSONCreator.Views.Resource({
                model: imageModel
            });
            this.$(".added-images").append(rView.$el);
            this.attachRektListener(rView);
        },

        createAudioResView: function () {
            var res = this.model.get("resources");
            var audioCollection = res.media.audio;
            var audioModel = audioCollection.models[audioCollection.length - 1];
            var AudioExtraData = JSONCreator.Models.CreateJSON.AudioExtraData;
            for (var key in AudioExtraData) {
                if (AudioExtraData.hasOwnProperty(key)) {
                    audioModel.set(key, AudioExtraData[key]);
                }
            }

            var rView = new JSONCreator.Views.Resource({
                model: audioModel
            });
            this.$(".added-audios").append(rView.$el);
            this.attachRektListener(rView);
        },

        initQuestion: function () {
            var questionCollection = this.model.get("questions");
            var resources = this.model.get("resources");
            var audioRes = resources.media.audio;
            for (var i = 0; i < questionCollection.models.length; i++) {
                var qModel = questionCollection.models[i];
                var qView = new JSONCreator.Views.Question({
                    model: qModel
                });
                if (qModel.get("audioID") || qModel.get("__id")) {
                    var audioResModel = audioRes.getModelByMainID(qModel.get("__id"));
                    if (audioResModel) {
                        audioResModel.set("__extID", qModel.get("modelID"));
                    } else {
                        console.warn("[Model not found] Audio Res Model not found while creating question.", { qModelID: qModel.get("modelID") });
                    }
                }
                this.listenTo(qModel, "change:audioID change:__audioIDType", this.onQModelAudioDetailsChanged.bind(this, qModel));
                this.listenTo(qView, "image-changed", this.onImageInfoChanged.bind(this));
                this.listenTo(qView, "type-changed", this.onQCompTypeChanged.bind(this));
                this.listenTo(qView, "json-component-created", this.onJSONCompCreated.bind(this));
                this.attachRektListener(qView);
                this.$(".added-questions").append(qView.$el);
            }
            if (questionCollection.models.length === 0) {
                console.info("No questions found, creating empty..");
                questionCollection.addItem({});
            }
        },

        onQCompTypeChanged: function (cModel, cView) {
            var resources = this.model.get("resources");
            var imgRes = resources.media.images;
            var jsonRes = resources.json;
            var oldImgModel = imgRes.getModelByID(cModel.get("modelID"));
            var oldJSONModel = jsonRes.getModelByID(cModel.get("modelID"));
            if (cModel.get("type") === "image") {
                console.info("type changed to image..", cModel, oldImgModel);
                if (oldImgModel) {
                    // assign modelID
                } else {
                    var imageFile = cModel.get("dataModel").get("imgID");
                    var id, url;
                    if (imageFile && imageFile.name) {
                        url = imageFile.name;
                        id = _.uniqueId(imageFile.name.split(".")[0] + "-");
                    } else {
                        url = _.uniqueId("image-") + "png";
                        id = _.uniqueId("image-id-");
                    }
                    imgRes.addItem({
                        type: "EXPLORATION_" + cModel.get("type").toUpperCase() + "_IMAGE",
                        __extID: cModel.get("modelID"),
                        url: url,
                        id: id
                    });
                    cModel.get("dataModel").set("__id", id);
                }
            } else if (oldImgModel) {
                console.info("type changed to other than image..", cModel, oldImgModel);
                oldImgModel.detonate();
            } else if (oldJSONModel) {
                console.info("type changed to other than image..", cModel, oldJSONModel);
                oldJSONModel.detonate();
            }
        },

        initResources: function () {
            var resources = this.model.get("resources");
            var jsonRes = resources.json;
            var imgRes = resources.media.images;
            var audioRes = resources.media.audio;

            for (var i = 0; i < jsonRes.models.length; i++) {
                var rView = new JSONCreator.Views.Resource({
                    model: jsonRes.models[i]
                });
                this.$(".added-jsons").append(rView.$el);
                this.attachRektListener(rView);
            }
            for (i = 0; i < imgRes.models.length; i++) {
                var rView = new JSONCreator.Views.Resource({
                    model: imgRes.models[i]
                });
                this.$(".added-images").append(rView.$el);
                this.attachRektListener(rView);
            }
            for (i = 0; i < audioRes.models.length; i++) {
                var rView = new JSONCreator.Views.Resource({
                    model: audioRes.models[i]
                });
                this.$(".added-audios").append(rView.$el);
                this.attachRektListener(rView);
            }
        }
    }, {

    });
    Handlebars.registerHelper("componentData", function (data, opts) {
        return "";
    });
    JSONCreator.Views.CreateJSON = CreateJSON;
})(window.JSONCreator);