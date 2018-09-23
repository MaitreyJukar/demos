/* globals MathUtilities */

(function() {
    'use strict';

    MathUtilities.Components.CanvasAcc.Collections.CanvasItems = Backbone.Collection.extend({
        /**
         * @property model The model whose collection is to be stored in this structure.
         * @type Object
         **/
        "model": MathUtilities.Components.CanvasAcc.Models.CanvasItem,

        "currentItem": null,

        /* Return current collection item
         * @method getCurrentItem
         * @param null
         * @public 
         */
        "getCurrentItem": function() {
            return this.currentItem;
        },

        /* Return current collection item index
         * @method getCurrentItemIndex
         * @param null
         * @public 
         */
        "getCurrentItemIndex": function() {
            return this.indexOf(this.getCurrentItem("currentItem"));
        },

        "getAllItems": function() {
            var items = [],
                models = this.models,
                modelsLength = models.length,
                counter = 0;
            for (; counter < modelsLength; counter++) {
                items.push(models[counter].get('paperItem'));
            }
            return items;
        },
        /* Set current collection item
         * @method setCurrentItem
         * @param {Object} canvas-acc model object
         * @public 
         */
        "setCurrentItem": function(model) {
            if (model === void 0) {
                model = null;
            }
            this.currentItem = model;
        },

        /* Set current item to next item and return it
         * @method next
         * @param null
         * @public 
         */
        "next": function() {
            var nextItem = this.at(this.indexOf(this.getCurrentItem("currentItem")) + 1);
            this.setCurrentItem(nextItem);
            return nextItem;
        },

        /* Set current item to previous item and return it
         * @method prev
         * @param null
         * @public 
         */
        "prev": function() {
            var prevItem = this.at(this.indexOf(this.getCurrentItem("currentItem")) - 1);
            this.setCurrentItem(prevItem);
            return prevItem;
        },

        /* Return boolean depending on next item availability in collection
         * @method hasNext
         * @param null
         * @public 
         */
        "hasNext": function() {
            var nextItemIndex = this.indexOf(this.getCurrentItem("currentItem")) + 1;
            return nextItemIndex > 0 && nextItemIndex < this.length;
        },

        /* Return boolean depending on previous item availability in collection
         * @method hasPrev
         * @param null
         * @public 
         */
        "hasPrev": function() {
            return this.indexOf(this.getCurrentItem("currentItem")) - 1 >= 0;
        }
    });


})();
