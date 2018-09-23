(function () {
    'use strict';

    /**
    * Conatins pan data
    * @class Tile
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.Pan = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Id of pan
                * @property id
                * @type String
                * @defaults null
                */
                id: null,

                /**
                * Number of rows pan contains to drop tile
                * @property rows
                * @type Number
                * @defaults null
                */
                rows: null,

                /**
                * Number of columns pan contains to drop tile
                * @property columns
                * @type Number
                * @defaults null
                */
                columns: null,

                /**
                * Height of pan
                * @property height
                * @type Number
                * @defaults null
                */
                height: null,

                /**
                * Width of pan
                * @property width
                * @type Number
                * @defaults null
                */
                width: null,

                /**
                * Class containing position CSS properties and other properties related to pan
                * @property positionClass
                * @type String
                * @defaults null
                */
                positionClass: null,

                /**
                * An array of elements dropped in pan
                * @property droppedElements
                * @type Array
                * @defaults empty array
                */
                droppedElements: []
            }
        }
    });
})();