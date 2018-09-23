(function () {
    'use strict';

    /**
    * Contains Overview tab Data
    * @class OverviewTab
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Interactivities.DemoInteractive.Models
    */
    MathInteractives.Common.Components.Theme2.Models.Help = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                * Index of current help tooltip displayed
                * @property currentIndex
                * @default 1
                * @public
                */
                currentIndex: 1,
                /**
                * Total number of help items
                * @property totalHelpItems
                * @default 0
                * @public
                */
                totalHelpItems: 0,
                /**
                * IDs of elements for which help is to be displayed
                * @property helpElements
                * @default blank array
                * @public
                */
                helpElements: [],
                /**
                * Default height of tooltip
                * @property tooltipHeight
                * @default 110
                * @public
                */
                tooltipHeight: 110,
                /**
                * Default width of tooltip
                * @property tooltipWidth
                * @default 260
                * @public
                */
                tooltipWidth: 260,
                /**
                * Default line height of tooltip
                * @property lineHeight
                * @default 30
                * @public
                */
                lineHeight: 30,
                /**
                * Specific position for help tooltips
                * @property positionArray
                * @default blank array
                * @public
                */
                positionArray: []
            };
        },

        /**
        * intialize help elements
        *
        * @method initialize
        * @public
        **/
        initialize: function () {
            this.updateItemList(this.get('helpElements'));
        },

        /**
        * Updates parameters.
        *
        * @method updateItemList
        * @param {Array} help elements
        */
        updateItemList: function (itemList) {
            this.set('currentIndex', itemList.length === 0 ? 0 : 1);
            this.set('totalHelpItems', itemList.length);
            this.set('helpElements', itemList);
        }
    });
})();