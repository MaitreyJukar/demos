/* globals $, window */

(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //base toolbar view start **********************************************
    /**
     * Holds common base functionalities for toolbar.
     * @class Tools
     */
    WhiteboardTool.Views.BaseToolbar = Backbone.View.extend({
        "_bVisible": true,

        /**
         * Sets the toolbar state.
         * @method setState
         */
        "setState": function(stateData) {
            var menuItemCounter = 0,
                menuItemLen = null;

            if (!stateData || stateData && !stateData.menuItems) {
                return;
            }

            // Handling of individual items over here
            menuItemLen = stateData.menuItems.length;
            for (; menuItemCounter < menuItemLen; menuItemCounter++) {
                this._setMenuItemState(stateData.menuItems[menuItemCounter]);
            }

            // Handling of the tool over here
            // Check if enable, show hide flag is passed for affecting the entire toolbar.
            if (typeof stateData.bShow !== "undefined") {
                this.show(stateData.bShow);
            }

            // Check for enabling and disbaling the tool bar.
            if (typeof stateData.bEnabled !== "undefined") {
                this.enable(stateData.bEnabled);
            }
        },

        "getSyncData": function() {
            return {};
        },

        /**
         * Changes button state on click.
         * @event selectTool
         * @params {Object} elemAttributes -- Holds tool-type of clicked element.
         * @params elemAttributes["tool-type"] -- denotes a tool uniquely or combined with tool-value, fetched from element's attributes
         * @params elemAttributes["tool-group"] -- Group to which the tool belongs. Default if not given is taken as default group.
         * @params elemAttributes["bFireEvent"] -- True/undefined are treated as to fire event "toolchange", false to suppress the event being fired.
         */
        "selectTool": function(elemAttributes) {
            var toolGroup = elemAttributes["tool-group"],
                toolValue = elemAttributes["tool-value"],
                elem = null,
                baseClass,
                prevSelectedId = null,
                manager = null;

            elem = this.getElementByDataset(elemAttributes);
            if (toolGroup !== "1") {
                if (elem.attr("class")) {
                    baseClass = elem.attr("class").split(" ")[0];
                    if (toolValue) {
                        elem.css("background-color", toolValue);
                    }
                    if (elemAttributes["tool-group"] !== MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Graph) {
                        //when graph type change, no need to change previous selection
                        $("." + baseClass + "[data-group!=" + MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Graph + "]")
                            .not('.shape-tool-menuitem-container').removeClass("selected item-selected");
                    }
                    elem.not("[data-fired-change=\"false\"]").addClass("selected item-selected").removeClass("hovered");
                }
                if (baseClass === "stroke-color") {
                    $("#whiteboard #min-strokeWidth,#max-strokeWidth").css("background-color", elemAttributes["tool-value"]);
                }
            }

            if (elemAttributes.bFireEvent !== false && elem.length) {
                this._fireToolChange(elem);
            }

            return elem;
        },

        "getElementByDataset": function(elemAttributes) {
            var toolType = elemAttributes["tool-type"],
                toolValue = elemAttributes["tool-value"],
                toolGroup = elemAttributes["tool-group"],
                elem;

            if (typeof toolValue !== "undefined") {
                elem = $("[data-tool-type=" + toolType + "]");
            } else {
                elem = $("[data-tool-type=" + toolType + "][data-group=" + toolGroup + "][data-base-class = whiteboard-tool]");
            }
            return elem;
        },

        "isVisible": function() {
            return this._bVisible;
        },

        /**
         * Shows/Hides the individual tool item/menu item.
         * @method show
         * @params {Boolean} bShow : True to show the tool, false to hide it.
         */
        "_showMenuItem": function(shapeData) {
            var element = this.getElementByDataset(shapeData);

            if (element) {
                if (shapeData.bShow) {
                    element.show();
                } else {
                    element.hide();
                }
            }
        },

        /**
         * Enables/Disables the individual tool item/menu item.
         * @method show
         * @params {Boolean} bShow : True to show the tool, false to hide it.
         */
        "_enableMenuItem": function(shapeData) {
            var element = this.getElementByDataset(shapeData);

            if (element) {
                element.toggleClass("disable-toolbar-menuitem", !shapeData.bEnabled);
            }
        },

        /**
         * Set the state/data for the individual menu item.
         * Selecting a mneuItem, disabling, etc is possible by this method.
         * @method _setMenuItemState
         */
        "_setMenuItemState": function(stateData) {
            if (!stateData) {
                return;
            }

            // Enabling, selection, disabling , display , hide happens here...
            if (typeof stateData.bShow !== "undefined") {
                // To be created method
                this._showMenuItem(stateData);
            }

            if (typeof stateData.bEnabled !== "undefined") {
                this._enableMenuItem(stateData);
            }

            if (typeof stateData["tool-type"] !== "undefined" && typeof stateData.bSelected !== "undefined") {
                this.selectTool(stateData);
            }

        },

        "_fireToolChange": function(toolElement) {
            var data = this._createDatasetByElement(toolElement);

            this.trigger("toolchange", data);
        },


        /**
         * Not to be used loosely for every element. Used for toolMenuItem only, where it returns the dataset containing attributes.
         * @method _createDatasetByElement
         */
        "_createDatasetByElement": function(toolElement) {
            if (!toolElement) {
                return {};
            }

            toolElement = $(toolElement);
            var data = {};
            // Check for group first
            data.toolType = Number(toolElement.attr("data-tool-type"));
            data.toolGroup = toolElement.attr("data-group");
            data.toolMenuType = toolElement.attr("data-menu-item-type");
            if (toolElement.attr("class")) {
                data.baseClass = toolElement.attr("class").split(" ")[0];
            }
            if (!data.toolGroup) {
                data.toolGroup = MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Default;
            }

            data.toolValue = toolElement.attr("data-value"); // Optional
            data.targetObj = toolElement; // Optional

            return data;
        }
    }, {
        "ToolGroup": {
            "Default": -1,
            "ShapeSelector": 1,
            "UndoRedo": 2,
            "ColorSelector": 3,
            "StrokeSelector": 4
        },

        "ToolType": {
            "Undo": 1,
            "Redo": 2,
            "DeleteShape": 3,
            "Clear": 4
        }
    });

    //base tool bar view end **********************************************
})(window.MathUtilities);
