(function () {
    'use strict';

    /**
    * View for rendering Droppable Slot.
    *
    * @class DropSlot
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.DropSlot = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @type String
        * @default null
        */
        idPrefix: null,
        /**
        * Reference to the manager object
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,
        /**
        * Reference to player
        * @property _player
        * @type Object
        * @default null
        */
        player: null,
        /**
        * Holds the model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Calls _render
        * @public
        * @method initialize
        **/
        initialize: function () {
            this.filePath = this.model.get('filePath');
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this._render();
        },
        /**
        * Renders the dropSlot component
        * @private
        * @method _render
        **/
        _render: function () {
            var $dropSlot = $('<div/>', { class: 'drop-slot' }).appendTo(this.$el),
                border = null;

            $dropSlot.css({
                'height': this.model.get('height'),
                'width': this.model.get('width')
            });


            if (this.model.get('borderColor') === 'none') {
                border = 'none'
            }
            else {
                border = '2px solid ' + this.model.get('borderColor');
            }

            if (this.model.get('imageId') === null) {
                $dropSlot.css({
                    'background-color': this.model.get('color'),
                    'border': border,
                    'box-shadow': 'inset 2px 2px 2px' + this.model.get('boxShadowColor')
                });
            } else {
                $dropSlot.css({
                    'background-image': 'url("' + this.filePath.getImagePath(this.model.get('imageId')) + '")'
                });
            }
            this.$el.css({
                'height': $dropSlot.outerHeight(),
                'width': $dropSlot.outerWidth()
            });

        }
    },
    {
        /**
        * Creates a model & view object for the dropSlot and returns the view object.
        * @method generateDropSlot
        * @public
        * @param {Object} options Properties required to generate a drop slot.
        * @return {Object} The dropSlot view object.
        */
        generateDropSlot: function (options) {
            var dropSlotModel, dropSlotView, containerId;
            containerId = '#' + options.idPrefix + options.data.containerId;
            dropSlotModel = new MathInteractives.Common.Components.Theme2.Models.DropSlot(options);
            dropSlotView = new MathInteractives.Common.Components.Theme2.Views.DropSlot({ el: containerId, model: dropSlotModel });
            return dropSlotView;
        }
    });

    MathInteractives.global.Theme2.DropSlot = MathInteractives.Common.Components.Theme2.Views.DropSlot;

})();
