(function (MathUtilities) {
    'use strict';
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
        model: MathUtilities.Components.Manager.Models.Node,
        /**
        * @property The reference of parents model.
        * @type Object
        **/
        parent: null,
        /**
        * Adds the node to collection.
        * @method addNodes
        * @param jsonData
        * @param parent {object} Reference to parents model.
        * @return {Object} Returns an object of collection.
        **/
        addNodes: function (jsonData, parent) {
            var nodes = new MathUtilities.Components.Manager.Collections.Nodes(),
                self = this;
            self.parent = parent;

            nodes.add(jsonData);

            nodes.each(function (currentNode) {
                var currentNodeId = currentNode.id,
                    existingNode = null,
                    mergedElements = null, elementsJson;

                existingNode = self.get(currentNodeId);

                if (existingNode !== null && existingNode !== undefined) {
                    elementsJson = currentNode.elements.toJSON();

                    existingNode.elements.add(elementsJson, {
                        silent: true,
                        merge: true
                    });
                    mergedElements = existingNode.elements.toJSON();

                    existingNode.set('elements', mergedElements);
                    existingNode.setParent(parent);
                    existingNode.updateElements();
                } else {
                    self.add(currentNode);
                    currentNode.setParent(parent);
                    currentNode.updateElements();
                }
            });

            return self;
        }
    });
}(window.MathUtilities));
