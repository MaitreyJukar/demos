/* globals _, window */

(function(MathUtilities) {
    "use strict";
    if (MathUtilities.Components.Manager.Collections.Nodes) {
        return;
    }
    /**
     * Collection to store multiple node model instances.
     * @module Manager
     * @class Nodes
     * @namespace MathUtilities.Components.Manager.Collections
     * @constructor
     * @extends Backbone.COllection
     **/
    MathUtilities.Components.Manager.Collections.Nodes = Backbone.Collection.extend({
        /**
         * @property model The model whose collection is to be stored in this structure.
         * @type Object
         **/
        "model": MathUtilities.Components.Manager.Models.Node,
        /**
         * @property The reference of parents model.
         * @type Object
         **/
        "parent": null,

        /**
         * Adds the node to collection.
         * @method addNodes
         * @param jsonData
         * @param parent {object} Reference to parents model.
         * @return {Object} Returns an object of collection.
         **/
        "addNodes": function(jsonData, parent) {
            var existingNode = null,
                mergedElements = null,
                addedNode = null;

            this.parent = parent;

            _.each(jsonData, function(currentNode) {
                existingNode = this.get(currentNode.id);

                if (existingNode) {
                    existingNode.elements.add(currentNode.elements, {
                        "silent": true,
                        "merge": true
                    });
                    mergedElements = existingNode.elements.toJSON();

                    existingNode.set("elements", mergedElements);
                    existingNode.setParent(parent);
                    existingNode.updateElements();
                } else {
                    this.add(currentNode);
                    addedNode = this.at(this.length - 1);
                    addedNode.setParent(parent);
                    addedNode.updateElements();
                }
            }, this);

            return this;
        }
    });
}(window.MathUtilities));
