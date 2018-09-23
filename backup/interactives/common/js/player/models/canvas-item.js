(function () {
    'use strict';
    /**
    **/
    MathInteractives.Common.Player.Models.CanvasItem = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                **/
                tabindex: null,

                /**
                **/
                paperItem: null

                ///**
                //**/
                //eventsToHandle:
                //    {
                //        focusIn: null,
                //        tab: null,
                //        spacebar: null,
                //        leftArrow: null,
                //        rightArrow: null,
                //        upArrow: null,
                //        downArrow: null
                //    }
            }
        },

        /**
        **/
        initialize: function (canvasAccID) {
            this.set("canvasAccId", canvasAccID);
        },

    });

    
})();