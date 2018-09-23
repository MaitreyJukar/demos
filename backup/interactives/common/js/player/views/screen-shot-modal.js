(function () {
    /* global MathUtilities */
    'use strict';


    MathInteractives.Common.Player.Views.ScreenShotModal = Backbone.View.extend({
        /*
        * stores base64 image data
        * @property base64Img
        * @type string
        * @default null
        **/
        base64Img: null,

        /*
        * flag to indicate whether modal is opened or not
        * @property isOpened
        * @type boolean
        * @default false
        **/
        isOpened: false,

        "events": {
            'submit form': 'onSubmit'
        },

        "initialize": function () {
            var $newHtml = $(MathInteractives.Common.Player.templates.screenShotModal());
            $("body").append($newHtml);
            this.$el = $("#save-screen-shot-modal");
            $('body').on('shown.bs.modal', '.modal', function () {
                $("input[name='saveStateName']").focus();
            })
        },

        "open": function (imgData) {
            this.isOpened = true;
            this.$el.find("input[name='saveStateName']").val("");
            this.$el.find("div.control-group").removeClass("error");
            this.$el.modal();
            this.base64Img = imgData;
        },

        "onSubmit": function (event) {
            if (!this.isOpened) {
                return;
            }
            event.preventDefault();
            var value = $(event.target).find("input[name='saveStateName']").val();
            if (value === "") {
                this.$el.find("div.control-group").addClass("error");
            } else {
                this.$el.modal('hide');
                this.trigger("screenShotNameEntered", { fileName: value, base64Image: this.base64Img });
            }
            this.isOpened = false;
        }
    });

})();
