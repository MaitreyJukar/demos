(function () {
    'use strict';

    MathUtilities.Components.ToolHolder.Models.TopToolbar = Backbone.Model.extend({
        _isVisible: true,

        MenuItem: null,

        menuItems: null,

        titleText: null,

        toolIconCSS: null,

        toolId:null,

        initialize: function () {
        },

        getHTML: function () {
            return MathUtilities.Components.ToolHolder.Templates.topToolbar({ 'tool-id': MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID }).trim();
        },

        setVisiblity: function (state) {
            if (state !== undefined) {
                this._isVisible = state;
            }
        },

        getVisiblity: function () {
            return this._isVisible;
        },

        setTitle: function (title) {
            if (title !== undefined) {
                this.titleText = title.titleText;
            }
        },

        getTitle: function () {
            return this.titleText;
        },

        setToolIcon: function (toolIcon) {
            if (toolIcon !== undefined) {
                this.toolIconCSS = toolIcon.toolIconCSS;
            }
        },

        getToolIcon: function () {
            return this.toolIconCSS;
        },

        setToolId: function (toolId) {
            if (toolId !== undefined) {
                this.toolId = toolId.toolIdText;
            }
        },

        getToolId: function () {
            return this.toolId;
        }

    }, {
        TOP_TOOLBAR_HEIGHT: 48
    });

})(); 