/* globals window */

(function(MathUtilities) {
    "use strict";
    if (MathUtilities.Components.Manager.Collections.Messages) {
        return;
    }

    /**
     * Collection for storing messages model for any element.
     * @module Manager
     * @class Messages
     * @namespace MathUtilities.Components.Manager.Collections
     * @constructor
     * @extends Backbone.COllection
     **/
    MathUtilities.Components.Manager.Collections.Messages = Backbone.Collection.extend({
        /**
         * @property model The model whose collection is to be stored in this structure.
         * @type Object
         **/
        "model": MathUtilities.Components.Manager.Models.Message
    });
}(window.MathUtilities));
