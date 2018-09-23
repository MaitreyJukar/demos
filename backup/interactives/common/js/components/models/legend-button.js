(function () {
    'use strict';

    /**
    * Conatins button data
    *
    * @class Button
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.LegendButton = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * chart object for which legend is created
                * @property chartContainerID
                * @type String
                * @defaults null
                */
                chartContainerID: null, //used for graphlegend

                /**
                * ID for graph series 
                * @property seriesID
                * @type String
                * @defaults null
                */
                seriesID: null, //used for graphlegend

                /**
                * customEvent for legend button
                * @property customEvent
                * @type boolean
                * @defaults false
                */
                customEvent: false//used for graphlegend
            }
        }
    });
})();