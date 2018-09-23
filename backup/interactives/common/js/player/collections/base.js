(function () {
    'use strict';

    /**
     * Collection for storing base models. Extend This module only if you require serialization otherwise don't
     * @module Common
     * @namespace  MathInteractives.Common.Player.Collections
     * @class Tabs
     * @constructor
     * @extends Backbone.Collection
     **/
    MathInteractives.Common.Player.Collections.Base = Backbone.Collection.extend({
        /**
         * @property model The model whose collection is to be stored in this structure.
         * @type Object
         **/
        model: MathInteractives.Common.Player.Models.Base,
        toJSON: function () {
            // check to perform serialization (Extra safety)
            if (this.serializationRequired === true) {
                MathInteractives.Common.Player.Models.Base.serializeCollection(this);
            }
            var attrArr = [];
            for (var i = 0; i < this.models.length; i++) {
                attrArr.push(this.models[i].attributes);
            }
            if (this.serializationRequired === true) {
                attrArr.push({ 'instanceType': 'Collection', 'collectionName': this.collectionName });
            }
            return attrArr;

        }
    });
}());