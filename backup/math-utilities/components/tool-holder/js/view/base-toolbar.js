(function () {
    'use strict';

    MathUtilities.Components.ToolHolder = {};

    MathUtilities.Components.ToolHolder.Models = {};

    MathUtilities.Components.ToolHolder.Views = {};

    MathUtilities.Components.ToolHolder.Templates = {};

    /**
    * Holds common base functionalities for toolbar.
    * @class Tools
    */
    MathUtilities.Components.ToolHolder.Views.BaseToolbar = Backbone.View.extend({

//        _isVisible: true,

        initialize: function () {

        },


        /**
        * Sets the toolbar state.
        * @method setState
        */
        setState: function (toolbarState) {
            this.model.setVisiblity(toolbarState.isVisible);
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
        * @params {Boolean} showToolbar : True to show the toolbar, false to hide it.
        * @params {Object}  [options] : Optional parameter for the showing or hiding of the toolbar, e.g animating it while showing/hiding.
        */
        show: function (showToolbar, options) {

        }

//        isVisible: function () {
//            return this._isVisible;
//        }


    });

})(); 