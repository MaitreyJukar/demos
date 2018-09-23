(function () {
    'use strict';

    /**
    * View for rendering Footprint.
    *
    * @class Footprint
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.Footprint = MathInteractives.Common.Player.Views.Base.extend({
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
        * Calls the initialize function
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
        * Renders the footprint component
        * @private
        * @method _render
        **/
        _render: function () {
            var $footprint = this.$el, $div;
            $footprint.css({
                'height': this.model.get('height'),
                'width': this.model.get('width')
            });
            $footprint.addClass('border-radius');
            if (this.model.get('imageId') === null) {
                $footprint.css({
                    'background-color': this.model.get('color'),
                    'box-shadow': 'inset 4px 4px ' + this.model.get('boxShadowColor')
                });
            } else {
                $footprint.css({
                    'background-image': 'url("' + this.filePath.getImagePath(this.model.get('imageId')) + '")'
                });
            }
            if (this.model.get('text') !== null) {
                var $div = $('<div></div>');
                $div.attr('id', this.$el.attr('id') + '-text')
                    .addClass(this.$el.attr('id') + '-text  text-div')
                    .html(this.model.get('text'));
                this.$el.addClass('display-property');
                this.$el.append($div);
            }

        }
    },
    {
        /**
        * Creates a model & view object for the footprint and returns the view object.
        * @method generateFootprint
        * @param {Object} options Properties required to generate a Foot Print
        * @return {Object} The footprint view object.
        */
        generateFootprint: function (options) {
            var footprintModel, footprintView, containerId;
            containerId = '#' + options.idPrefix + options.data.containerId;
            footprintModel = new MathInteractives.Common.Components.Theme2.Models.Footprint(options);
            footprintView = new MathInteractives.Common.Components.Theme2.Views.Footprint({ el: containerId, model: footprintModel });
            return footprintView;
        }
    });
    MathInteractives.global.Theme2.Footprint = MathInteractives.Common.Components.Theme2.Views.Footprint;
})();
