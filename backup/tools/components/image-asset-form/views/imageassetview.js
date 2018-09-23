
/* eslint new-cap:1 */
(function (MathUtilities) {
    "use strict";

    MathUtilities.Components.ImageAssetView = Backbone.View.extend({
        "events": {
            "submit form": "onAssetEntered",
            "click .image-asset": "onMediaSelected"
        },
        "initialize": function initialize() {
            $("body").append($('<div id="image-asset-modal-container"><div id="image-asset-modal" class="modal fade"></div></div>'));
            this.$el = $("#image-asset-modal");
            this.listenTo(this.model, 'change:data', this.render);
            this.render();
        },
        "render": function render() {
            this.$el.html($(MathUtilities.Components.ImageAsset.templates.PopupMenuTextInput(this.model.toJSON()).trim()));
            return this;
        },

        "open": function(){
            this.$el.find("#image-asset-guid-input").val("");
            this.$el.modal();
        },

        "onAssetEntered": function(e){
            this.model.fetch(
                {"data": {"assetGuidList": this.$el.find("#image-asset-guid-input").val(), "typeidlist": "37,38"}}
            );
            e.preventDefault();
        },
        "onMediaSelected": function(e){
            this.$el.modal('hide');
            this.trigger("assetImageSelected", {"img": $(e.currentTarget).find("img").attr("src")});
        }
    });

})(window.MathUtilities);
