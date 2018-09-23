(function (JSONCreator) {
    var imgTpl = JSONCreator.Templates.image;
    var Image = JSONCreator.Views.Base.extend({
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
        },

        events: function () {
            return {
                "change .alt-text-class": "onAltTextChanged",
                "change .container-css-class": "onContainerCSSClassChanged",
                "change .container-image-file": "onImageFileChanged",
                "change .image-resource-type": "onImageTypeChanged"
            };
        },

        attachListeners: function () {
            this.listenTo(this.model, "change:altText", this.onAltTextChanged);
            this.listenTo(this.model, "change:containerCssClass", this.renderContainerCssClass);
            this.listenTo(this.model, "change:imgID", this.renderImageIDClass);
            this.listenTo(this.model, "change:__imageIDType", this.renderImageIDType);
        },

        rekt: function() {
            this.boom();
        },

        render: function () {
            var dataTpl = JSON.parse(JSON.stringify(this.model.toBackboneJSON()));
            this.$el.html(imgTpl(dataTpl));
            return this.renderAltText()
                .renderContainerCssClass()
                .renderImageIDClass()
                .renderImageIDType()
                .setFileDetails();
        },

        renderAltText: function () {
            this.$(".alt-text-class").val(this.model.get("altText"));
            return this;
        },

        renderContainerCssClass: function () {
            this.$(".container-css-class").val(this.model.get("containerCssClass"));
            return this;
        },

        renderImageIDClass: function () {
            // this.$(".img-id-class").val(this.model.get("imgID"));
            if (this.model.get("imgID")) {
                this.enableInput(".container-css-class")
                    .enableInput(".image-resource-type")
                    .enableInput(".alt-text-class");
                this.$(".file-data").addClass("file-added");
                this.$(".image-data-text").html("Change image: <b>" + this.model.get("imgID").name + "</b>");
            } else {
                this.disableInput(".container-css-class")
                    .disableInput(".image-resource-type")
                    .disableInput(".alt-text-class");
                this.$(".file-data").removeClass("file-added");
                this.$(".image-data-text").html("Add image");
            }
            console.info("Image changed", this.model.get("imgID"));
            return this;
        },

        renderImageIDType: function () {
            this.$(".image-resource-type").val(this.model.get("__imageIDType"));
            return this;
        },

        setFileDetails: function () {
            var file = this.model.get("imgID");
            if (file) {
                this.model.set("__imgFileDetails", file.size + file.lastModified);
            } else {
                this.model.set("__imgFileDetails", file);
            }
            return this;
        },

        onAltTextChanged: function () {
            this.model.set("altText", this.$(".alt-text-class").val());
        },

        onContainerCSSClassChanged: function () {
            this.model.set("containerCssClass", this.$(".container-css-class").val());
        },

        onImageFileChanged: function () {
            this.model.set("imgID", this.$(".container-image-file")[0].files[0], { silent: true });
            this.setFileDetails();
        },

        onImageTypeChanged: function () {
            this.model.set("__imageIDType", this.$(".image-resource-type").val());
        }
    }, {

    });

    JSONCreator.Views.Image = Image;
})(window.JSONCreator);