(function () {
    'use strict';
    /**
    * Contains DragDropTile data
    * @class DragDropTile
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.DragDropTile = Backbone.Model.extend({
        defaults: {
            /**
            * Tile data
            * @property tileData
            * @type Array
            * @default null
            */
            tileData: null,
            /**
            * Footprint Data
            * @property footprintData
            * @type Array
            * @default null
            */
            footprintData: null,
            /**
            * Castor Data
            * @property castorData
            * @type Array
            * @default null 
            */
            castorData: null,

            /**
            * DropSlot Data
            * @property dropSlotData
            * @type Array
            * @default null
            */
            dropSlotData: null,

            /**
            * Drop Slot model data
            * @property dropSlotModelData
            * @type Array
            * @default null
            **/
            dropSlotModelData: null,

            /**
            * Draggable model data
            * @property dragModelData
            * @type Array
            * @default null
            **/
            dragModelData:null
        }
    },
    {
});
})();



