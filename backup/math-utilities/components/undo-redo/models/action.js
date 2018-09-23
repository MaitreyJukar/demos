MathUtilities.Components.Undo = {};
MathUtilities.Components.Undo.Models = {};
MathUtilities.Components.Undo.Views = {};
(function () {
    'use strict';

    /**
     * Contains data related to any undo or redo action
     *
     * @class Action
     * @constructor
     * @extends Backbone.Model
     * @namespace MathUtilities.Components.Undo.Models
     */
    MathUtilities.Components.Undo.Models.Action = Backbone.Model.extend({
        defaults: {
            /**
             * Name of the action
             * 
             * @property name
             * @type String
             * @default null
             */
            name: null,
            /**
             * Data to pass in 'execute' function for undo/redo
             * 
             * @property data
             * @type Object
             * @default null
             */
            data: null,
            /**
             * Reference of the object whos 'execute' function will be called for undo/redo
             * 
             * @property data
             * @type Object
             * @default null
             */
            manager: null
        }
    });
})();