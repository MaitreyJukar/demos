(function (MathUtilities) {
    'use strict';
    if (MathUtilities.Components.Manager.Collections.Elements) {
        return;
    }
    /**
     * Collection for storing element models.
     * @namespace MathUtilities.Collection
     * @module Manager
     * @namespace MathUtilities.Components.Manager.Collections
     * @class Elements
     * @constructor
     * @extends Backbone.Collection
     **/
    MathUtilities.Components.Manager.Collections.Elements = Backbone.Collection.extend({
        /**
         * @property model The model whose collection is to be stored in this structure.
         * @type Object
         **/
        model: MathUtilities.Components.Manager.Models.Element,
        /**
         * Managers' model with which this elements collection is associated
         * @property manager
         * @type Object
         **/
        manager: null,
        /**
         * Setter for class's manager property
         * @method setManager
         * @param {Object} manager Reference to the manager model, with which this
         * collection is associated
         **/
        setManager: function (manager) {
            this.manager = manager;
        },
        /**
         * Getter for the collections manager model.
         * @method getManager
         * @return {Object} manager model's reference
         **/
        getManager: function () {
            return this.manager;
        },
        /**
        * Stores element models reference depending on their ids and accIds 
        * @method processElements
        **/
        processElements: function () {
            var self = this;

            self.each(function (element) {
                if (element.id !== null) {
                    self.manager.elementsById[element.id] = element;
                }

                if (element.get('accId') !== null) {

                    self.manager.elementsByAccId[element.get('accId')] = element;
                }
                element.manager = self.manager;
            });
        }
    });
}(window.MathUtilities));
