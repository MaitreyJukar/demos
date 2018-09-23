(function(MathUtilities) {

    'use strict';

    /* Initialize TextTool Data */
    MathUtilities.Components.TextTool = {};

    /**
     * Packages all the models used in the TextTool module.
     * @module Models
     * @namespace MathUtilities.Components.TextTool
     **/
    MathUtilities.Components.TextTool.Models = {};

    /**
     * Packages all the views used in the TextTool module.
     * @module Views
     * @namespace MathUtilities.Components.TextTool
     **/
    MathUtilities.Components.TextTool.Views = {};

    /**
     * A customized Backbone.Model that intializes text tool.
     * @class TextTool
     * @constructor
     * @namespace Components.TextTool.Models
     * @module TextTool
     * @extends Backbone.Model
     */
    MathUtilities.Components.TextTool.Models.TextTool = Backbone.Model.extend({

        /**
         * @property defaults
         * @type Object
         */
        "defaults": function() {
            return {
                "textEditor": null,
                "counter": 0,
                "textEditorText": null,
                "height": null,
                "width": null,
                "top": null,
                "left": null,
                "offset": null,
                "canvasProp": { //set to default value
                    "width": 990,
                    "height": 491,
                    "left": 2,
                    "top": 64
                },
                "editorSize": { // store editor size when modal is close
                    "width": 0,
                    "height": 0
                }
            };
        },

        /**
         * Set canvas dimension,it is used to restrict text-tool in visible canvas area.
         * @method setCanvasProp
         * @param {Object} canvasProp,canvas dimension to be set
         */
        "setCanvasProp": function(canvasProp) {
            if (!canvasProp) {
                return;
            }
            var prevCanvasProp = this.get('canvasProp'),
                prop = null;
            for (prop in canvasProp) {
                if (prevCanvasProp.hasOwnProperty(prop) && typeof canvasProp[prop] === 'number') {
                    prevCanvasProp[prop] = canvasProp[prop];
                }
            }
        },

        /**
         * Set editor size,it is used to open editor in previous resized dimension.
         * @method setEditorSize
         * @param {Object} size, height and width of edior
         */
        "setEditorSize": function(size) {
            if (!size) {
                return;
            }
            var prevEditorSize = this.get('editorSize'),
                prop = null;
            for (prop in prevEditorSize) {
                if (prevEditorSize.hasOwnProperty(prop) && typeof prevEditorSize[prop] === 'number') {
                    prevEditorSize[prop] = size[prop];
                }
            }
        }
    });
}(window.MathUtilities));
