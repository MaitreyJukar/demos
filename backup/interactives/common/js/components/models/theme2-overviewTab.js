(function () {
    'use strict';

    /**
    * Holds the business logic and data of the view
    * @class OverviewTab
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @submodule MathInteractives.Common.Components.Theme2.Models.OverviewTab
    * @namespace MathInteractives.Common.Components.Theme2.Models
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Models.OverviewTab = Backbone.Model.extend({
        defaults: {
            /**
            * The id of the screen that contains the overview tab elements
            * @property screenID
            * @type String
            * @default null
            */
            screenID: null,
            /**
            * The id of the image for the left hand container
            * @property leftImageContainerID
            * @type String
            * @default null
            */
            leftImageContainerID: null,
            /**
            * Stores a boolean to check whether focus must be set to the header
            * @property focusOnHeader
            * @type Boolean
            * @default true
            */
            focusOnHeader: true

        },
        initialize: function () {
        }

    });
})();