/* global MathUtilities */
(function () {
    'use strict';

    MathUtilities.Components.ToolHolder.Views.MenuItem = Backbone.View.extend({
        "model": null,

        "initialize": function () {
            this.model = new MathUtilities.Components.ToolHolder.Models.MenuItem();
        },

        "getData": function () {
            return {
                "isVisible": this.isVisible,
                "isDisabled": this.isDisabled,
                "isPressed": this.isPressed
            };
        },

        "setData": function (objConstruct) {
            if (objConstruct) {

                if (!_.isUndefined(objConstruct.isVisible)) {
                    this.model.isVisible = objConstruct.isVisible;

                    if (!this.model.isVisible) {
                        this.$el.addClass('hide');
                    }
                }

                if (!_.isUndefined(objConstruct.isDisabled)) {
                    this.model.isDisabled = objConstruct.isDisabled;
                    // Disable logic
                }

                if (!_.isUndefined(objConstruct.isPressed)) {
                    this.model.isPressed = objConstruct.isPressed;
                }

            }
        }
    });

})();
