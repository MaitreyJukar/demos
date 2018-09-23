(function () {
    'use strict';
    /**
     * Contains events that are dispatched on `UndoManager` instance.
     *
     * @class Action
     * @constructor
     * @extends Backbone.Model
     * @namespace MathUtilities.Components.Undo.Models
     */
    MathUtilities.Components.Undo.Models.UndoRedoEvent = Backbone.Model.extend({}, {
        /**
        * Dispatched when any action is registered
        * 
        * @property ACTION_REGISTERED
        * @type String
        * @static
        */
        ACTION_REGISTERED: 'ACTION_REGISTERED',
        /**
        * Dispatched when undo is performed
        * 
        * @property ACTION_UNDONE
        * @type String
        * @static
        */
        ACTION_UNDONE: 'ACTION_REDONE',
        /**
        * Dispatched when redo is performed
        * 
        * @property ACTION_REDONE
        * @type String
        * @static
        */
        ACTION_REDONE: 'ACTION_REDONE'
    });
})();