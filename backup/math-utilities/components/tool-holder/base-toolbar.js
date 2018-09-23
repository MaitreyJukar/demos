(function () {
    'use strict';

    /**
    * Holds common base functionalities for toolbar.
    * @class Tools
    */
    MathUtilities.Tools.GeometryTool.View.BaseToolbar = Backbone.View.extend({

        _bVisible: true,

        initialize: function () {
        },


        /**
        * Sets the toolbar state.
        * @method setState
        */
        setState: function () {
        },

        /**
        * Returns toolbar's current state.
        * @method getState
        * @returns {Object} Current state of the toolbar.
        */
        getState: function () {
        },

        /**
        * Binds events on toolbar.
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

    }
    });

})(); 