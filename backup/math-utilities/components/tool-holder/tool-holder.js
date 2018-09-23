(function () {
    'use strict';

    /**
    * Holds functionalities for tool holder.
    * @class Tools
    */
    MathUtilities.Tools.GeometryTool.View.ToolHolder = Backbone.View.extend({

        _bVisible: true,
        _toolBars : null,
        TOOLBARS : { TOP_TOOLBAR : "top_toolbar", BOTTOM_TOOLBAR:"bottom_toolbar"},

        initialize: function () {
        },


        /**
        * Sets the toolholder's state.
        * @method setState
        */
        setState: function () {
            /*
         = {
            BOTTOM_TOOLBAR : {
                visibile : false
                }
            };
            this._toolBars[TOOLBARS.TOP_TOOLBAR].setState(a.TOP_TOOLBAR);
            */
        },

        /**
        * Returns toolbar's current state.
        * @method getState
        * @returns {Object} Current state of the toolbar.
        */
        getState: function () {
        },

        /**
        * Returns all the toolholders.
        * @method getToolbars
        * @returns {Object} Returns all the toolbars available.
        */
        getToolbars : function(){
        },

        /**
        * Binds events on tool holder.
        * @method _bindEvents
        * @private
        */
        _bindEvents: function () {
        },

        /**
        * Shows/Hides the toolbar.
        * @method show
        * @params {Boolean} bShow : True to show the toolbar, false to hide it.
        * @params {Object}  [objOptions] : Optional parameter for the showing or hiding of the toolbar, e.g animating it while showing/hiding.
        */
        show: function (bShow, objOptions) {

        },

        isVisible: function () {
            return this._bVisible;
        }

    },
    {
        ToolGroup: {
            Default : -1,
            ShapeSelector : 1,
            UndoRedo : 2,
            ColorSelector : 3,
            StrokeSelector : 4,
        },

        ToolType : {
            Undo : 1,
            Redo : 2,
            DeleteShape : 3,
            Clear : 4
        }
    });

})(); 