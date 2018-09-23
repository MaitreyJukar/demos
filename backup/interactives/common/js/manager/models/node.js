(function(MathUtilities) {
    'use strict';
    if (MathUtilities.Components.Manager.Models.Node) {
        return;
    }
    /**
     * Model for node (screen). It stores the collection of elements for the current node.
     * @module Models
     * @class Node
     * @constructor
     * @extends Backbone.model
     * @namespace MathUtilities.Components.Manager.Models
     **/
    MathUtilities.Components.Manager.Models.Node = Backbone.Model.extend({
        /**
         * Initialize node to its defaults.
         * @method dfaults
         * @return {Object} node defaults. Type: 0 - Normal node type. Type: 1 - Modal node.
         **/
        defaults: function() {
            return {
                id: '',
                type: 0
            };
        },
        /**
        * @property parent {Object} Reference to parent model.
        **/
        parent: null,
        /**
        * Initialise elements collection.
        * @method initialize
        **/
        initialize: function() {
            var self = this,
                elementsData = self.get('elements');
            self.elements = new MathUtilities.Components.Manager.Collections.Elements();
            self.elements.add(elementsData);
        },
        /**
        * Setter for the class's parent property.
        * @method setParent
        * @param parent {Object} Parent models reference.
        **/
        setParent: function(parent) {
            this.parent = parent;
        },
        /**
        * Getter for the class's parent property
        * @method getParent
        * @return {Object} Returns the parent models reference.
        **/ 
        getParent: function() {
            return this.parent;
        },
        /**
        * @method updateElements
        **/
        updateElements: function() {
            var self = this;
            self.elements.setManager(this.parent);
            self.elements.processElements();
        }
    });
}(window.MathUtilities));
