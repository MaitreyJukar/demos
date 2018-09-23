(function (MathInteractives) {
    'use strict';
    /**
    * Collection for Data Sets
    * @class DataSetCollection
    * @module DataSetSelector
    * @namespace MathInteractives.Common.Interactivities.DataSetSelector.Collections
    * @extends Backbone.Collection
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Collections.DataSetCollection = Backbone.Collection.extend({

        model: MathInteractives.Common.Player.Models.BaseInteractive,

        /**
        * Get data sets matching CID.
        *
        * @method getDataSetByCID
        * @public
        * @param {string} cid unique cid of data set 
        **/
        getDataSetByCID: function getDataSetByCID(cid) {
            return this.get(cid);
        },

        /**
        * Get user defined data sets.
        *
        * @method getUserDataSets
        * @public 
        **/
        getUserDataSets: function getUserDataSets() {
            return this.where({ isUserData: true });
        },

        /**
        * Get data sets matching index in a collection.
        *
        * @method getDataSetByIndex
        * @public
        * @param {number} index 
        **/
        getDataSetByIndex: function getDataSetByIndex(index) {
            return this.at(index);
        }

    });
})(window.MathInteractives);
