/* global MathUtilities, Tools */
(function() {
    'use strict';

    MathUtilities.Components.ToolHolder.Models.BottomToolbar = Backbone.Model.extend({
        "_isVisible": true,

        "MenuItem": null,

        "menuItems": null,

        "toolId": null,

        "screenCaptureDiv": null,

        "childView": null,

        "initialize": function() {
            this.MenuItem = MathUtilities.Components.ToolHolder.Models.MenuItem;
            this._generateMenuItems();
        },

        "_defaultButtonStateProp": {
            "isVisible": true,
            "isDisabled": false,
            "isPressed": false
        },

        "_defaultCSS": null,

        "_generateMenuItems": function() {
            /* eslint dot-notation: 0 */
            this.menuItems = {};
            this.menuItems["save"] = new this.MenuItem();
            this.menuItems["open"] = new this.MenuItem();
            this.menuItems["screenShot"] = new this.MenuItem();
            this.menuItems["print"] = new this.MenuItem();
            this.menuItems["csv"] = new this.MenuItem();
            this.menuItems["zoomIn"] = new this.MenuItem();
            this.menuItems["zoomDefault"] = new this.MenuItem();
            this.menuItems["zoomOut"] = new this.MenuItem();
            return this.menuItems;
        },

        "setButtonState": function(buttonState) {
            var curKey = null;

            if (buttonState) {
                for (curKey in buttonState) {
                    this.menuItems[curKey].setData(buttonState[curKey]);
                }
            }
        },

        "geButtontState": function(buttons) {
            return this.MENU_ITEM;
        },

        "getHTML": function() {
            return MathUtilities.Components.ToolHolder.Templates.bottomToolbar({
                "tool-id": MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID,
                "isPreAuthoringEnv": Tools.DeApi.isPreAuthoringEnv
            }).trim();
        },

        "setVisiblity": function(state) {
            if (!_.isUndefined(state)) {
                this._isVisible = state;
            }
        },

        "getVisiblity": function() {
            return this._isVisible;
        },

        "setToolId": function(toolId) {
            if (!_.isUndefined(toolId)) {
                this.toolId = toolId.toolIdText;
            }
        },

        "getToolId": function() {
            return this.toolId;
        },

        "setScreenCaptureDiv": function(screenCaptureDiv) {
            if (!_.isUndefined(screenCaptureDiv)) {
                this.screenCaptureDiv = $(screenCaptureDiv.screenCaptureHolder);
            }
        },

        "getScreenCaptureDiv": function() {
            return this.screenCaptureDiv;
        },

        "setChildView": function(childView) {
            this.childView = childView;
        },

        "getChildView": function() {
            return this.childView;
        }
    }, {
        "BOTTOM_TOOLBAR_HEIGHT": 50
    });

})();
