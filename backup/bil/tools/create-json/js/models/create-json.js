(function (JSONCreator) {
    var CreateJSON = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("main-app-"),
                "explorationID": "",
                "useCustomStyle": false,
                "questions": new JSONCreator.Collections.Question(),
                "resources": {
                    "json": new JSONCreator.Collections.Resource(),
                    "media": {
                        "images": new JSONCreator.Collections.Resource(),
                        "audio": new JSONCreator.Collections.Resource()
                    }
                },
                "additionalInfo": {
                    "title": null,
                    "content": null,
                    "position": null,
                    "postImgContent": null,
                    "image": {
                        "imgID": null,
                        "altText": null
                    },
                    "audioID": null
                },
                "__title": null,
                "__content": null,
                "__postImgContent": null,
                "__position": null,
                "__hasAdditionalInfo": false,
                "__hasAdditionalInfoImg": false,
                "__addImgID": null,
                "__addImgAltTxt": null,
                "__tooltipImgFile": null,
                "__tooltipImgFileDetails": null,
                "__tooltipImgFileID": null,
                "__tooltipImgType": "common",
                "__tooltipAudioID": null,
                "__tooltipAudioType": "lang",
                "__tooltipAudioFile": null,
                "__tooltipAudioFileDetails": null,
                "__DEBUG": false
            };
        },

        constructor: function AuthoringToolModel() {
            return JSONCreator.Models.Base.prototype.constructor.apply(this, arguments);
        },

        initialize: function () {
            this.parseCollections();
            this.addSelfListeners();

            var additionalInfo = this.get("additionalInfo");
            additionalInfo = additionalInfo || {};
            this.set("__title", additionalInfo.title);
            this.set("__content", additionalInfo.content);
            this.set("__postImgContent", additionalInfo.postImgContent);
            this.set("__position", additionalInfo.position);

            this.set("__tooltipAudioFile", additionalInfo.audioID);
            this.set("__tooltipAudioID", additionalInfo.__id);
            if (additionalInfo.audioID) {
                var audioColl = this.get("resources").media.audio;
                for (var i = 0; i < audioColl.models.length; i++) {
                    if (audioColl.models[i].get("id") === additionalInfo.__id) {
                        audioColl.models[i].set("__extID", this.get("modelID"));
                        break;
                    }
                }
            }

            this.listenTo(this, "change:__postImgContent", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.postImgContent = this.get("__postImgContent");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__tooltipImgFileDetails", function () {
                this.trigger("change:__tooltipImgFile");
                if (this.get("__tooltipImgFile")) {
                    this.set("__hasAdditionalInfoImg", true);
                } else {
                    this.set("__hasAdditionalInfoImg", false);
                }
            });
            this.listenTo(this, "change:__tooltipAudioFileDetails", function () {
                this.trigger("change:__tooltipAudioFile");
            });
            this.listenTo(this, "change:__hasAdditionalInfoImg", function () {
                if (!this.get("__hasAdditionalInfoImg")) {
                    this.set("__tooltipImgFile", void 0);
                }
            });
            this.listenTo(this, "change:__tooltipImgFileID", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.image = addInfo.image || {};
                addInfo.image.imgID = this.get("__tooltipImgFileID");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__tooltipAudioID", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.__id = this.get("__tooltipAudioID");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__tooltipAudioFile", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.audioID = this.get("__tooltipAudioFile");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__addImgAltTxt", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.image = addInfo.image || {};
                addInfo.image.altText = this.get("__addImgAltTxt");
                this.set("additionalInfo", addInfo);
            });

            if (additionalInfo.title !== null) {
                this.set("__hasAdditionalInfo", true);
                if (!additionalInfo.image) {
                    additionalInfo.image = {
                        "imgID": null,
                        "altText": null
                    };
                    this.set("additionalInfo", additionalInfo);
                }
            }
            if (additionalInfo.image && additionalInfo.image.imgID) {
                this.set("__addImgID", additionalInfo.image.imgID);
                this.set("__addImgAltTxt", additionalInfo.image.altText);
                this.set("__hasAdditionalInfoImg", true);
            }
        },

        parseCollections: function () {
            this.parseQuestions();
            this.parseMedia();
        },

        addSelfListeners: function () {
            this.listenTo(this, "change:__title", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.title = this.get("__title");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__content", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.content = this.get("__content");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__position", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.position = this.get("__position");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__content", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.content = this.get("__content");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__addImgID", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.image.imgID = this.get("__addImgID");
                this.set("additionalInfo", addInfo);
            });
            this.listenTo(this, "change:__addImgAltTxt", function () {
                var addInfo = this.get("additionalInfo");
                addInfo.image.altText = this.get("__addImgAltTxt");
                this.set("additionalInfo", addInfo);
            });
        },

        parseQuestions: function () {
            this.set("questions", this.toCollection(this.get("questions"), JSONCreator.Collections.Question, JSONCreator.Models.Question));
        },

        parseMedia: function () {
            var resources = this.get("resources");
            resources.json = this.toCollection(resources.json, JSONCreator.Collections.Resource, JSONCreator.Models.Resource, JSONCreator.Models.CreateJSON.JSONExtraData);
            if (resources.media) {
                resources.media.audio = this.toCollection(resources.media.audio, JSONCreator.Collections.Resource, JSONCreator.Models.Resource, JSONCreator.Models.CreateJSON.ImageExtraData);
                resources.media.images = this.toCollection(resources.media.images, JSONCreator.Collections.Resource, JSONCreator.Models.Resource, JSONCreator.Models.CreateJSON.AudioExtraData);
            }
        },

        toJSON: function () {
            var __hasAdditionalInfo = this.get("__hasAdditionalInfo");
            var audioRes = this.get("resources").media.audio.models;
            var hasAddInfoImg = this.get("__hasAdditionalInfoImg");
            for (var i = 0; i < audioRes.length; i++) {
                var id = audioRes[i].get("id");
                var qID = audioRes[i].get("__extID");
                var qModel = this.get("questions").getQuestionByModelID(qID);
                if (qModel) {
                    qModel.set("__id", id);
                }
            }
            var data = JSONCreator.Models.Base.prototype.toJSON.apply(this, arguments);
            /* data = JSON.parse(JSON.stringify(data)); */
            if (!hasAddInfoImg) {
                delete data.additionalInfo.image;
            }
            if (!__hasAdditionalInfo) {
                delete data.additionalInfo;
            }
            console.info("main", data);
            return data;
        },

        getAudioFileID: function (queID) {
            var queIDStr = (queID === void 0) ? "" : "_q" + queID;
            var expID = (this.get("explorationID")) ? this.get("explorationID") : "exploration";
            return expID.replace("19NA_", "").replace("_int_exploration", "") + queIDStr;
        }
    }, {
        JSONExtraData: {
            idTitle: "Use 'custom-algebra-tiles-#' For Algebra tiles",
            typeTitle: "For JSON, please use 'Common' as Type",
            urlPlaceholder: "**.json"
        },
        ImageExtraData: {
            typeTitle: "For Image, plase use 'Common' as Type",
            urlPlaceholder: "**.png / **.jpg"
        },
        AudioExtraData: {
            typeTitle: "For Audio, plase use 'Lang' as Type",
            urlPlaceholder: "**.mp3"
        }
    });

    JSONCreator.Models.CreateJSON = CreateJSON;
})(window.JSONCreator);