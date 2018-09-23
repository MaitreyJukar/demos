(function () {
    /* global MathUtilities */
    'use strict';


    MathUtilities.Components.ToolHolder.Views.ScreenShotModal = Backbone.View.extend({

        "events": {
            'submit form': 'onSubmit'
        },

        "initialize": function(){
            var $newHtml = $(MathUtilities.Components.ToolHolder.Templates.screenShotModal());
            $("body").append($newHtml);
            this.$el = $("#save-screen-shot-modal");
        },

        "open": function(){
            this.$el.find("input[name='saveStateName']").val("");
            this.$el.find("div.control-group").removeClass("error");
            this.$el.modal();
        },

        "onSubmit": function (event) {
            event.preventDefault();
            var value = $(event.target).find("input[name='saveStateName']").val();
            if (value === ""){
                this.$el.find("div.control-group").addClass("error");
            } else {
                this.$el.modal('hide');
                this.trigger("screenShotNameEntered", value);
            }
        }
    });

})();
