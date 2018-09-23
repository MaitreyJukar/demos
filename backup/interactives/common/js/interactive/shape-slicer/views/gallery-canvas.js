(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.GalleryCanvas) {
        return;
    }
    var eventManager = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER,
        eventManagerModel = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer.EVENT_MANAGER_MODEL,
        mainModelNameSpace = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ShapeSlicer, viewClass;
    /*
     *
     *   [[D E S C R I P T I O N]]
     *
     * @class GalleryShapeSlicer
     * @namespace MathInteractives.Interactivities.ShapeSlicer.Views
     * @extends MathInteractives.Common.Player.Views.Base
     * @constructor
     */
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.GalleryCanvas = MathInteractives.Common.Player.Views.Base.extend({

        allShapesGroup: null,

        canvasID: null,
        paperScope: null,
        currentTool: null,

        initialize: function (options) {
            this.initializeDefaultProperties();
            this.allShapesGroup = options.shapeData;
            this.render();
        },

        render: function () {
            this._appendCanvas();
            this._setPaperScope();
        },

        _appendCanvas: function () {
            var $el = this.$el,
                containerId = this.el.id,
                model = this.model,
                canvasHeight = viewClass.HIGHT,
                canvasWidth = viewClass.WIDTH,
                $canvas = $('<canvas>', { id: containerId + '-canvas-element', class: 'gallery-canvas-element' });

            $el.empty().append($canvas);
            $el.find('.gallery-canvas-element').attr({ 'id': containerId + '-canvas-element', 'height': canvasHeight, 'width': canvasWidth });
            this.canvasID = containerId + '-canvas-element';
        },


        /**
        * Set up the paper-scope.
        * @method _setupPaperScope
        * @private
        */
        _setPaperScope: function () {
            this.paperScope = new paper.PaperScope();
            this.paperScope.setup(this.el.id + '-canvas-element');
            this.paperScope.activate();
        },

        loadShapes: function loadShapes(currentIndex) {
            this.paperScope.activate();
            var self = this,
                galleryObject = this.model.get('galleryObject'),
                currentGalleryIndex = currentIndex,
                shapeData = galleryObject[currentGalleryIndex].shapeData, position;
            if (this.allShapesGroup) {
                this.allShapesGroup.remove();
            }
            this.allShapesGroup = new this.paperScope.Group();
            this.allShapesGroup.importJSON(shapeData);
            position = this.allShapesGroup.position;
            position.x = position.x * viewClass.SCALE_FACTOR;
            position.y = position.y * viewClass.SCALE_FACTOR;
            this.allShapesGroup.scale(viewClass.SCALE_FACTOR);
            this.paperScope.view.draw();
        },

        removeShapes: function () {
            this.allShapesGroup = this.allShapesGroup || null;
            if (this.allShapesGroup !== null) {
                this.allShapesGroup.remove();
                this.paperScope.view.draw();
            }
        },

        destroy: function destroy() {
            this.allShapesGroup = null;
            this.canvasID = null;
            this.paperScope = null;
            this.currentTool = null;
        }

    }, {
        HIGHT: 158,
        WIDTH: 160,
        SCALE_FACTOR: 0.38,
        createGalleryCanvasView: function (options) {
            var model = options.model,
                        el = '#' + options.contanierId,
                        shapsGroup = options.shapsGroup,
                        canvasView = new MathInteractives.Common.Interactivities.ShapeSlicer.Views.GalleryCanvas({ el: el, model: model });

            return canvasView;
        },
    });
    viewClass = MathInteractives.Common.Interactivities.ShapeSlicer.Views.GalleryCanvas;
})();