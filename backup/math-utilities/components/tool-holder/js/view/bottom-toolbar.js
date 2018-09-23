(function(MathUtilities) {
    'use strict';

    MathUtilities.Components.ToolHolder.Views.BottomToolbar = MathUtilities.Components.ToolHolder.Views.BaseToolbar.extend({
        "model": null,

        "el": '#math-tool-bottom-toolbar-' + MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID,

        "buttonView": null,

        "MENU_ITEMS": {
            "SAVE": "save",
            "OPEN": "open",
            "SCREENSHOT": "screenshot",
            "PRINT": "print",
            "CSV": "csv",
            "ZOOMIN": "zoomin",
            "ZOOMDEFAULT": "zoomdefault",
            "ZOOMOUT": "zoomout"
        },

        "initialize": function() {
            this.model = new MathUtilities.Components.ToolHolder.Models.BottomToolbar();
            this.MenuItemView = MathUtilities.Components.ToolHolder.Views.MenuItem;
            this.screenShotModal = new MathUtilities.Components.ToolHolder.Views.ScreenShotModal();
            this.listenTo(this.screenShotModal, "screenShotNameEntered", this._screenShotNameEntered);
            this._generateMenuItems();
        },

        "initUI": function() {
            this._generateMenuItems();
            this._bindEvents();
        },

        "_generateMenuItems": function() {
            var TOOL_ID = MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID;
            this.menuItems = {
                "save": new this.MenuItemView({
                    "el": '#math-tool-save-btn-container-' + TOOL_ID
                }),
                "open": new this.MenuItemView({
                    "el": '#math-tool-open-btn-container-' + TOOL_ID
                }),
                "screenShot": new this.MenuItemView({
                    "el": '#math-tool-screenshot-btn-container-' + TOOL_ID
                }),
                "print": new this.MenuItemView({
                    "el": '#math-tool-print-btn-container-' + TOOL_ID
                }),
                "csv": new this.MenuItemView({
                    "el": '#math-tool-csv-btn-container-' + TOOL_ID
                }),
                "zoomOut": new this.MenuItemView({
                    "el": '#math-tool-zoomout-btn-container-' + TOOL_ID
                }),
                "zoomDefault": new this.MenuItemView({
                    "el": '#math-tool-zoomdefault-btn-container-' + TOOL_ID
                }),
                "zoomIn": new this.MenuItemView({
                    "el": '#math-tool-zoomin-btn-container-' + TOOL_ID
                })
            };
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

        "getButtonState": function() {
            return this.menuItems;
        },

        "getToolbarTemplate": function() {
            return this.model.getHTML();
        },

        /**
         * Binds events on tool holder.
         * @method _bindEvents
         * @private
         */
        "_bindEvents": function() {
            $('.bottom-toolbar-btn').on('click', _.bind(this._onToolItemClicked, this));
        },

        /**
         * Triggers a bottomButtonClicked event for every button clicked at the bottom toolbar.
         * @method _onButtonClickedHandler
         */
        "_onToolItemClicked": function(eventObject) {
            var allowBubble = this._handleClick(eventObject);

            if (allowBubble) {
                this.trigger('bottomToolbarItemClicked', eventObject);
            }
        },

        "_handleClick": function(eventObject) {
            var targetEl = eventObject.delegateTarget,
                curItem = this.getMenuItem(targetEl);

            return curItem && !curItem.model.isDisabled;
        },

        "getMenuItem": function(targetEl) {
            var key = null,
                curItem;

            for (key in this.menuItems) {
                curItem = this.menuItems[key];
                if (curItem && curItem.$el.children()[0] === targetEl) {
                    return curItem;
                }
            }

            return null;
        },

        "setState": function(toolbarState) {
            this.model.setVisiblity(toolbarState.isVisible);
            this.model.setToolId(toolbarState.toolId);
            this.model.setScreenCaptureDiv(toolbarState.screenCaptureDiv);
            this.setButtonState(toolbarState.buttonProperty);
            this._setToolbarStates();
        },

        "_setToolbarStates": function(element) {
            var $element = $('#math-tool-bottom-toolbar-' + MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID);

            if (this.getState().isVisible === false) {
                $element.hide();
            } else {
                $element.show();
            }
        },

        "getState": function() {
            return {
                "isVisible": this.model.getVisiblity(),
                "buttonProperty": this.getButtonState(),
                "toolId": this.model.getToolId(),
                "screenCaptureDiv": this.model.getScreenCaptureDiv()
            };
        },

        "_screenShotNameEntered": function(eventData) {
            this.trigger("screenShotNameEntered", eventData);
        }
    });

})(window.MathUtilities);
