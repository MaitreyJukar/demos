/* globals window */

(function(MathUtilities) {
    'use strict';
    /**
    Class to create equation error data object for error related to equation

    @class MathUtilities.Components.EquationErrorData
    **/
    MathUtilities.Components.EquationEngine.Models.EquationErrorData = Backbone.Model.extend({
        "defaults": function() {
            return {
                "_errorCode": null,

                "_errorData": [],

                "_errorString": null

            };
        },

        /**
            Flushes all properties of the object and set them to their default values.

            @public
            @method flush
        **/
        "flush": function() {
             this.set({
                "_errorCode": null,
                "_errorData": null,
                "_errorString": null
            });
        }

    }, {});
}(window.MathUtilities));
