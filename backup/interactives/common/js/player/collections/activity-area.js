(function () {
    'use strict';

    /**
     * Collection for storing tab models.
     * @module Common
     * @namespace  MathInteractives.Common.Player.Collections
     * @class Tabs
     * @constructor
     * @extends Backbone.Collection
     **/
    MathInteractives.Common.Player.Collections.ActivityAreas = Backbone.Collection.extend({
        /**
         * @property model The model whose collection is to be stored in this structure.
         * @type Object
         **/
        model: MathInteractives.Common.Player.Models.ActivityArea,
    });
}());
