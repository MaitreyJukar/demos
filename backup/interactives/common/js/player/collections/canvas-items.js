(function () {
    'use strict';
    MathInteractives.Common.Player.Collections.CanvasItems = Backbone.Collection.extend({
        /**
        * @property model The model whose collection is to be stored in this structure.
        * @type Object
        **/
        model: MathInteractives.Common.Player.Models.CanvasItem,

        currentItem: null,

        initialize: function () {           
            
        },
        
        /* Return current collection item
        * @method getCurrentItem
        * @param null
        * @public 
        */
        getCurrentItem: function () {            
            return this.currentItem;
        },

        /* Return current collection item index
        * @method getCurrentItemIndex
        * @param null
        * @public 
        */
        getCurrentItemIndex: function () {           
            return this.indexOf(this.getCurrentItem("currentItem"));
        },

        /* Set current collection item
        * @method setCurrentItem
        * @param {Object} canvas-acc model object
        * @public 
        */
        setCurrentItem: function (model) {            
            if (typeof model === 'undefined') {
                model = null;
            }
            this.currentItem = model;
        },

        /* Set current item to next item and return it
        * @method next
        * @param null
        * @public 
        */
        next: function () {            
            var nextItem = null;
            nextItem = this.at(this.indexOf(this.getCurrentItem("currentItem")) + 1);
            this.setCurrentItem(nextItem);
            return nextItem;
        },

        /* Set current item to previous item and return it
        * @method prev
        * @param null
        * @public 
        */
        prev: function () {            
            var prevItem = null;
            prevItem = this.at(this.indexOf(this.getCurrentItem("currentItem")) - 1);
            this.setCurrentItem(prevItem);
            return prevItem;
        },

        /* Return boolean depending on next item availability in collection
        * @method hasNext
        * @param null
        * @public 
        */
        hasNext: function () {
            var hasNext = false,
                nextItemIndex = this.indexOf(this.getCurrentItem("currentItem")) + 1;
            if (nextItemIndex > 0 && nextItemIndex < this.length) {
                hasNext = true;
            }

            return hasNext;
        },

        /* Return boolean depending on previous item availability in collection
        * @method hasPrev
        * @param null
        * @public 
        */
        hasPrev: function () {
            var hasPrev = false;
            if ((this.indexOf(this.getCurrentItem("currentItem")) - 1) >= 0) {
                hasPrev = true;
            }

            return hasPrev;
        }
    });


})();