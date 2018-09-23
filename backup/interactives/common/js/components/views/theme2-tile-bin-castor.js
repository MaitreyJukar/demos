


(function () {
    'use strict';

    /**
    * View for rendering Tile Bin Castor.
    *
    * @class BinCastor
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.BinCastor = MathInteractives.Common.Player.Views.Base.extend({
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
        * Renders the binCastor component
        * @method _render
        **/
        _render: function () {
            var $binCastor = this.$el;            
            $binCastor.addClass('bin-castor');
            $binCastor.css({
                'height': this.model.get('height'),                
                'min-width': this.model.get('width')
            });
            if (this.model.get('imageId') === null) {
                $binCastor.css({
                    'background-color': this.model.get('color'),
                    'border': '2px solid' + this.model.get('borderColor')
                });
            }
            else {
               $binCastor.css({
                    'background-image': 'url("' + this.filePath.getImagePath(this.model.get('imageId')) + '")'
                });
            }
        }
    },
    {
        /**
        * Creates a model & view object for the binCastor and returns the view object.
        * @method generateBinCastor
        * @param  {Object} options Properties required to generate a Bin Castor
        * @return {Object} The binCastor view object.
        */
        generateBinCastor: function (options) {
            var binCastorModel, binCastorView, containerId;
            containerId = '#' + options.idPrefix + options.data.containerId;
            binCastorModel = new MathInteractives.Common.Components.Theme2.Models.BinCastor(options);
            binCastorView = new MathInteractives.Common.Components.Theme2.Views.BinCastor({ el: containerId, model: binCastorModel });
            return binCastorView;
        }
    });
    MathInteractives.global.Theme2.BinCastor = MathInteractives.Common.Components.Theme2.Views.BinCastor;
})();
