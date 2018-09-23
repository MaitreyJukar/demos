(function (JSONCreator) {
    var Image = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("image-"),
                "altText": null,
                "containerCssClass": null,
                "data": null,
                "imgID": null,
                "type": "image",
                "__id": null,
                "__imageIDType": "common",
                "__imgFileDetails": null
            };
        },

        initialize: function () {
            this.listenTo(this, "change:__imgFileDetails", function() {
                this.trigger("change:imgID");
            });
        }
    }, {

    });

    JSONCreator.Models.Image = Image;
})(window.JSONCreator);