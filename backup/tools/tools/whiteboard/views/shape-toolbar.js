/* globals _, $, window */

(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;

    //shape toolbar view start **********************************************
    /**********************************************
    See BaseToolbar for getter and setters
    Some of base functionalities are defined there
    **********************************************/
    /**
     * View class that handles the menu items for shapes, propogates events to the controller if any regarding menu items selected.
     * @class Tools
     */
    WhiteboardTool.Views.ShapeToolbar = WhiteboardTool.Views.BaseToolbar.extend({
        //Default settings of a shape toolbar
        "defaultSettings": [{
            "tool-type": -1
        }],

        "_isRetrievingState": false,

        "initialize": function() {
            this.eventManager = new MathUtilities.Components.EventManager();
            this._bindEvents();
        },

        /**
         * Binds events on sketch pad.
         * @method _bindEvents
         * @private
         */
        "_bindEvents": function() {
            this.$(".shape-tool-menuitem").on("click", _.bind(this._onCurToolChange, this));
            this.$("#background-tool").on("click", _.bind(this._onBackgroundDropDownClick, this));
            this.$("#image-tool").on("click", _.bind(this._onImageDropDownClick, this));
            this.$("#edit-tool").on("click", _.bind(this._onEditDropDownClick, this));
            this.$("#graph-tool").on("click", _.bind(this._onGraphDropDownClick, this));
            this.$('.check-box-container').on('click', _.bind(this._onCheckboxClick, this));


            this.$(".shape-tool-menuitem[data-group=1]")
                .on("mousedown", _.bind(this._onCurToolMouseDown, this))
                .on("mouseup", _.bind(this._onCurToolMouseUp, this));

            this.eventManager.listenTo(this.$("#whiteboard-canvas")[0],
                MathUtilities.Components.EventManager.prototype.STATES.TOUCHSTART,
                function(event) {
                    this._onFloatTouchStart(event);
                }, this);
            // Listen a global window touch/click to hide all the open popups/drop down if any.
            this.$("#whiteboard").on("mousedown", _.bind(this._onFloatTouchStart, this));
            if (WhiteboardTool.Views.isAccessible) {
                this.$(".shape-tool-menuitem-container").on("keydown", _.bind(this._navigateShapePopup, this));
                this.$(".whiteboard-bg-list").on("keydown", _.bind(this._handleBackgroundOptionKeyDown, this));
            }
        },

        "_handleBackgroundOptionKeyDown": function(eventObject) {
            if (eventObject.keyCode === WhiteboardTool.Models.Sketchpad.ESCAPE_KEY) {
                WhiteboardTool.Views.accManagerView.setFocus("background-tool");
                this.hideBackgroundPopup();
            }
        },

        "_navigateShapePopup": function(eventObject) {
            var managerView = WhiteboardTool.Views.accManagerView,
                delegateTarget = eventObject.delegateTarget,
                keyCode = eventObject.keyCode;
            if (keyCode === WhiteboardTool.Models.Sketchpad.RIGHT_ARROW_KEY) {
                if (delegateTarget.nextElementSibling) {
                    managerView.setFocus(delegateTarget.nextElementSibling.id);
                } else if (delegateTarget.nextElementSibling === null) {
                    managerView.setFocus("arrow-shape");
                }
            } else if (keyCode === WhiteboardTool.Models.Sketchpad.LEFT_ARROW_KEY) {
                if (delegateTarget.previousElementSibling) {
                    managerView.setFocus(delegateTarget.previousElementSibling.id);
                } else if (delegateTarget.previousElementSibling === null) {
                    managerView.setFocus("hexagon-shape");
                }
            } else if (keyCode === WhiteboardTool.Models.Sketchpad.TAB_KEY || keyCode === WhiteboardTool.Models.Sketchpad.ESCAPE_KEY) {
                managerView.setFocus("shape-tool-focus-rect");
                this._enableShapePopup(false);
                this.hidePopup();
            }
        },

        /**
         * Gets fired when a menu Item on toolbar is clicked.
         * @event _enableShapePopup
         * @params {Boolean} enable : True to enable popup shapes, false to disable.
         * @private
         */
        "_enableShapePopup": function(enable) {
            var arrElem = ["arrow-shape", "circle-shape", "ellipse-shape", "etriangle-shape", "rtriangle-shape",
                "trapezoid-shape", "square-shape", "rectangle-shape", "parallelogram-shape", "pentagon-shape",
                "hexagon-shape"
            ];
            this.enableTab(arrElem, enable);
        },

        /**
         * Gets fired when a menu Item on toolbar is clicked.
         * @event _onCurToolChange
         * @params {Object} eventObject -- Event object that let the change in current tool.
         * @private
         */
        "_onCurToolChange": function(eventObject) {
            if ($(eventObject.delegateTarget).hasClass("button-disabled")) {
                eventObject.stopPropagation();
                return;
            }
            var managerView = WhiteboardTool.Views.accManagerView,
                focussedElemId = null,
                $target = $(eventObject.target),
                targetElem = eventObject.delegateTarget,
                data = this._createDatasetByElement(targetElem);

            if ($target.attr("data-fired-change") !== "false" && $target.parents(".shape-tool-menuitem").attr("data-fired-change") !== "false") {
                this._handleMenuItemClick(data);
            }

            //Set focus on selected shape
            if (targetElem.id === "shape-tool") {
                focussedElemId = this.$("#whiteboard-shapetool-popup .selected").attr("id");
                managerView.setFocus(focussedElemId);
            }
            //Set focus on selected line
            if (targetElem.id === "line-tool") {
                focussedElemId = this.$("#whiteboard-linetool-popup .selected").attr("id");
                managerView.setFocus(focussedElemId);
            }

            if (eventObject.isTrigger &&
                (this._isRetrievingState === false &&
                    ($(eventObject.delegateTarget).hasClass("shape-tool-menuitem-container") || ["text-tool", "pan-tool", "polygon-tool"].indexOf($(targetElem).attr("id")) > -1))) {
                this.trigger("trigger-canvas-click");
            }
        },

        /**
         * Gets fired on mousedown event fired on buttons with "data-group" = 1.
         * @event _onCurToolMouseDown
         * @params {Object} data -- Data object that holds the attribute data related to delegateTarget.
         * @private
         */
        "_onCurToolMouseDown": function(eventObject) {
            $(eventObject.delegateTarget).addClass("mousedown");
        },

        /**
         * Gets fired on mouseup event fired on buttons with "data-group" = 1.
         * @event _onCurToolMouseUp
         * @params {Object} data -- Data object that holds the attribute data related to delegateTarget.
         * @private
         */
        "_onCurToolMouseUp": function(eventObject) {
            $(eventObject.delegateTarget).removeClass("mousedown");
        },

        /**
         * Gets fired for buttons which doesn"t have attribute `data-posted` set to `false`.
         * @event _handleMenuItemClick
         * @params {Object} data -- Data object that holds the attribute data related to delegateTarget.
         * @private
         */
        "_handleMenuItemClick": function(data) {
            var toolElem = $(data.targetObj),
                $shapePopup = this.$("#whiteboard-shapetool-popup"),
                $shapeTool = this.$("#whiteboard-tools-container #shape-tool"),
                prevToolType = $shapeTool.attr("data-tool-type"),
                prevSelectedId = null,
                manager = null,
                currSelectedId = null,
                toolType = WhiteboardTool.Views.DrawingTool;

            if (toolElem.attr("data-posted") !== "false") {
                this.selectTool({
                    "tool-type": data.toolType,
                    "tool-group": data.toolGroup,
                    "bFireEvent": false
                });
            } else if (toolElem.attr("data-base-class") === "popup-menu-item") {
                this.$("#drop-down-icon-container").addClass("whiteboard-tool-dropdown-hidden");
                this.hidePopup();
                this.$("#whiteboard-linetool-popup").hide();
            }

            if (toolElem.attr("data-group") === MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Edit) {
                this.setEditState(data);
            }
            if (toolElem.attr("data-menu-item-type") === "4") {
                if (toolElem.attr("data-base-class") !== "popup-menu-item") {
                    if (this.$('#line-drop-down-icon-container').hasClass("whiteboard-tool-dropdown-hidden")) {
                        this._showLinePopup();
                    } else {
                        this._hideLinePopup();
                    }
                }
                this.setLineState({
                    "toolType": data.toolType
                });
            }
            if (toolElem.attr("data-menu-item-type") === "3" && toolElem.attr("data-base-class") !== "popup-menu-item") {
                this._onShapeDropDownClick();
            }

            if (toolElem.attr("data-group") === MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Graph) {
                this.setGraphState(data);
            }

            this._fireToolChange(toolElem);

            //resetting as apparently it is modified in fireToolChange
            toolType = WhiteboardTool.Views.DrawingTool;

            if (toolType !== WhiteboardTool.Views.ShapeType.None && toolElem.attr("data-menu-item-type") === "3") {

                //code to change accessibility acc message of selected tool
                if (WhiteboardTool.Views.isAccessible) {
                    prevSelectedId = $shapePopup.find(".shape-tool-menuitem[data-tool-type=" + prevToolType + "]").attr("id");
                    manager = WhiteboardTool.Views.accManagerView;
                    currSelectedId = $shapePopup.find(".shape-tool-menuitem[data-tool-type=" + toolType + "]").attr("id");
                    manager.changeAccMessage(prevSelectedId, 0);
                    manager.changeAccMessage(currSelectedId, 1);
                }
                this.setShapeState({
                    "toolType": toolType
                });
            }
        },
        "setShapeState": function(shapeState) {
            if (!shapeState) {
                return;
            }
            var toolTypes = {
                    "6": "arrow",
                    "1": "circle",
                    "3": "ellipse",
                    "5": "triangle",
                    "4": "right-angle-triangle",
                    "16": "trapezium",
                    "7": "square",
                    "14": "rectangle",
                    "15": "parallelogram",
                    "8": "pentagon",
                    "9": "hexagon"
                },
                $shapePopup = this.$("#whiteboard-shapetool-popup"),
                $shapeTool = this.$("#whiteboard-tools-container #shape-tool"),
                prevToolType = $shapeTool.attr("data-tool-type"),
                toolType = shapeState.toolType;

            $shapePopup.find(".shape-tool-menuitem[data-tool-type=" + prevToolType + "]").removeClass("selected item-selected");
            $shapePopup.find(".shape-tool-menuitem[data-tool-type=" + toolType + "]").addClass("selected item-selected")
                .removeClass("hovered");
            $shapeTool.attr("data-tool-type", toolType)
                .find("#shape-tool-icon")
                .removeClass("whiteboard-tool-" + toolTypes[prevToolType])
                .addClass("whiteboard-tool-" + toolTypes[toolType]);
        },

        "setEditState": function(editState) {
            if (!editState) {
                return;
            }
            var $editTool = this.$("#whiteboard-tools-container #edit-tool-menu"),
                prevEditoption = $editTool.attr("data-tool-type"),
                editOptions = {
                    "25": "copy",
                    "26": "cut",
                    "27": "paste"
                };
            $editTool.attr("data-tool-type", editState.toolType)
                .find("#edit-tool-icon")
                .removeClass("whiteboard-edit-" + editOptions[prevEditoption])
                .addClass("whiteboard-edit-" + editOptions[editState.toolType]);
        },

        "setLineState": function(lineState) {
            if (!lineState) {
                return;
            }

            var $lineTool = this.$("#whiteboard-tools-container #line-tool"),
                prevToolType = $lineTool.attr("data-tool-type"),

                lineOptions = {
                    "2": "line",
                    "32": "line-dashed",
                    "34": "line-arrow",
                    "33": "line-dashed-arrow"
                },
                $linePopup = this.$("#whiteboard-tools-container #whiteboard-linetool-popup");

            $linePopup.find(".shape-tool-menuitem[data-tool-type=" + prevToolType + "]").removeClass("selected item-selected");
            $linePopup.find(".shape-tool-menuitem[data-tool-type=" + lineState.toolType + "]")
                .addClass("selected item-selected").removeClass("hovered");

            $lineTool.find("#line-tool-icon").removeClass("whiteboard-tool-" + lineOptions[prevToolType])
                .addClass("whiteboard-tool-" + lineOptions[lineState.toolType]);
            $lineTool.attr("data-tool-type", lineState.toolType);
        },

        "setGraphState": function(graphState) {
            if (!graphState) {
                return;
            }
            var $graphTool = this.$("#whiteboard-tools-container #graph-tool-menu"),
                prevEditoption = $graphTool.attr("data-tool-type"),
                graphOptions = {
                    "28": "no",
                    "29": "cartesian",
                    "30": "polar"
                },
                prevToolType = $graphTool.attr("data-tool-type"),
                $graphPopup = this.$("#whiteboard-tools-container #graph-drop-down-container"),
                prevSelectedId, manager, currSelectedId;

            //code to change accessibility acc message of selected tool
            if (WhiteboardTool.Views.isAccessible) {
                prevSelectedId = $graphPopup.find(".shape-tool-menuitem[data-tool-type=" + prevToolType + "]").attr("id");
                manager = WhiteboardTool.Views.accManagerView;
                currSelectedId = $graphPopup.find(".shape-tool-menuitem[data-tool-type=" + graphState.toolType + "]").attr("id");
                manager.changeAccMessage(prevSelectedId, 0);
                manager.changeAccMessage(currSelectedId, 1);
            }
            $graphPopup.find(".shape-tool-menuitem[data-tool-type=" + prevToolType + "]").removeClass("selected item-selected");
            $graphPopup.find(".shape-tool-menuitem[data-tool-type=" + graphState.toolType + "]")
                .addClass("selected item-selected").removeClass("hovered");

            $graphTool.find("#graph-tool-icon").removeClass("whiteboard-graph-" + graphOptions[prevEditoption])
                .addClass("whiteboard-graph-" + graphOptions[graphState.toolType]);
            $graphTool.attr("data-tool-type", graphState.toolType);
        },


        "_showLinePopup": function() {
            var targetElem = $("#line-drop-down-icon-container"),
                $linepopup = $("#whiteboard-linetool-popup"),
                arrElem = ["line", "line-dashed", "line-dashed-arrow", "line-arrow"];

            targetElem.removeClass("whiteboard-tool-dropdown-hidden");
            $linepopup.show();
            if (WhiteboardTool.Views.isAccessible) {
                this.updateFocusRect(arrElem);
            }
        },

        "_hideLinePopup": function() {
            var targetElem = $("#line-drop-down-icon-container"),
                $linepopup = $("#whiteboard-linetool-popup");

            targetElem.addClass("whiteboard-tool-dropdown-hidden");
            $linepopup.hide();
        },

        /**
         * Called when a drop down arrow is clicked.
         * @event _onShapeDropDownClick
         * @private
         */
        "_onShapeDropDownClick": function() {
            var $targetElem = this.$('#shape-drop-down-icon-container'),
                DrawingTool = WhiteboardTool.Views.DrawingTool,
                prevToolType = $targetElem.parents("#shape-tool").attr("data-tool-type"),
                shapePopup = this.$("#whiteboard-shapetool-popup");

            if ($targetElem.attr("id") === "drop-down-icon") {
                $targetElem = $targetElem.parents("#drop-down-icon-container");
            }

            shapePopup.find(".shape-tool-menuitem[data-tool-type=" + prevToolType + "]").parent()
                .removeClass("selected item-selected");
            shapePopup.find(".shape-tool-menuitem[data-tool-type=" + DrawingTool + "]").parent()
                .addClass("selected item-selected").removeClass("hovered");
            if ($targetElem.hasClass("whiteboard-tool-dropdown-hidden")) {
                $targetElem.removeClass("whiteboard-tool-dropdown-hidden");
                this.showPopup();
            } else {
                $targetElem.addClass("whiteboard-tool-dropdown-hidden");
                this.hidePopup();
            }
        },

        "_onBackgroundDropDownClick": function(event) {
            event.stopPropagation();
            var $targetElem = this.$("#background-tool-drop-down-icon-container");

            if ($targetElem.hasClass("whiteboard-background-dropdown-hidden")) {
                $targetElem.removeClass("whiteboard-background-dropdown-hidden");
                this.showBackgroundPopup();
            } else {
                $targetElem.addClass("whiteboard-background-dropdown-hidden");
                this.hideBackgroundPopup();
            }
        },

        "_onImageDropDownClick": function(event) {
            var zeusSiteUpload,
                imgPreload;

            /*
            The tools are hosted on zeus site to showcase them to DE business team.
            In this version image selection is provided through user's machine

            zeusSiteupload flag is used to decide whether to open the imageReader popup or not.
            */
            zeusSiteUpload = false;

            if (zeusSiteUpload) {
                this.trigger('openImagePopup');
            } else if (event.shiftKey && event.altKey) {
                $("#image-asset-modal").modal();
            } else {
                $.de.browse({
                    "actionType": 'choose',
                    /* Searchable and Non-Searchable Images asset type guids */
                    "assetTypeGuid": "3123B3AD-3C2D-49CF-92CE-9927C3C09E64,1AA883F4-B310-4A5A-9D35-D07DC8CADF6C,7859E39F-7300-4A63-86C9-8446E5B32037,89CB88BC-1B04-4DE2-8986-E82F65DF2755",
                    "onComplete": _.bind(function(evt) {
                        if (evt) {
                            $.ajax({
                                "url": "/api:mediafiles/list/",
                                "data": {
                                    "assetGuidList": evt.content.guid,
                                    "typeidlist": "37,38"
                                }
                            }).always(_.bind(function(resp) {
                                imgPreload = new Image();
                                imgPreload.onload = _.bind(function() {
                                    this.trigger("assetImagePreloaded", {
                                        "img": imgPreload.src
                                    });
                                }, this);
                                imgPreload.src = resp.data[0].mediaFileUrl;
                            }, this));
                        }
                    }, this)
                });
            }
        },

        "_onEditDropDownClick": function(event) {
            var $targetElem = $(event.target),
                $editPopup = this.$("#edit-drop-down-icon-container"),
                isAccessible = WhiteboardTool.Views.isAccessible;

            if (isAccessible && $targetElem.is("#edit-focus-rect")) {
                $editPopup.removeClass("whiteboard-tool-dropdown-hidden");
                this.showEditPopup();
            } else if ($targetElem.is("#edit-drop-down-icon-container") ||
                $targetElem.parents("#edit-drop-down-icon-container").length !== 0) {
                if ($editPopup.hasClass("whiteboard-tool-dropdown-hidden")) {
                    $editPopup.removeClass("whiteboard-tool-dropdown-hidden");
                    this.showEditPopup();
                } else {
                    $editPopup.addClass("whiteboard-tool-dropdown-hidden");
                    this.hideEditPopup();
                }
            } else {
                $editPopup.addClass("whiteboard-tool-dropdown-hidden");
                this.hideEditPopup();
            }
        },

        "showEditPopup": function() {
            var arrElem = ["copy-tool", "cut-tool", "paste-tool"];
            this.$("#edit-drop-down-container").show();
            this.updateFocusRect(arrElem);

        },

        "hideEditPopup": function() {
            this.$("#edit-drop-down-container").addClass("whiteboard-tool-dropdown-hidden")
                .hide();
        },

        "_onGraphDropDownClick": function(event) {
            var $targetElem = $(event.target),
                isAccessible = WhiteboardTool.Views.isAccessible;
            if ($targetElem.parents().is('#grid-setting-text')) {
                return;
            }
            if (isAccessible && $targetElem.is("#graph-focus-rect") || $targetElem.is("#graph-tool-menu") ||
                $targetElem.parents("#graph-tool-menu").length !== 0) {
                if (this.$("#graph-drop-down-icon-container").hasClass("whiteboard-tool-dropdown-hidden")) {
                    this.showGraphPopup();
                } else {
                    this.hideGraphPopup();
                }
            } else {
                this.hideGraphPopup();
            }
        },

        "showGraphPopup": function() {
            var arrElem = ["no-graph-tool", "cartesian-graph-tool", "polar-graph-tool",
                "grid-setting-text", "show-grid-container", "show-axes-container", "show-labels-container"
            ];

            this.$("#graph-drop-down-icon-container").removeClass("whiteboard-tool-dropdown-hidden");
            this.$("#graph-drop-down-container").show();
            this.updateFocusRect(arrElem);

        },

        "hideGraphPopup": function() {
            this.$("#graph-drop-down-icon-container").addClass("whiteboard-tool-dropdown-hidden");
            this.$("#graph-drop-down-container").hide();
        },

        /************************************************
        Utility functions
        ************************************************/
        "hideMoreMenuPopup": function() {
            this.$(".math-utilities-whiteboard-tool .more-menu-properties").hide();
        },

        "hideColorPalettePopup": function() {
            this.$(".math-utilities-whiteboard-tool .color-palette").addClass('palette-hide');
        },

        /**
         * Shows the modal boxes.
         * @method showPopup
         */
        "showPopup": function() {
            var arrElem = ["arrow-shape", "circle-shape", "ellipse-shape", "etriangle-shape", "rtriangle-shape",
                "trapezoid-shape", "square-shape", "rectangle-shape", "parallelogram-shape", "pentagon-shape",
                "hexagon-shape"
            ];

            this.$("#whiteboard-shapetool-popup").show();
            this.updateFocusRect(arrElem);
        },

        /**
         * Hides the modal boxes.
         * @method hidePopup
         */
        "hidePopup": function() {
            this.$("#whiteboard-shapetool-popup").hide();
        },

        "showBackgroundPopup": function() {
            var arrElem = ["no-background", "numberline-labeled", "numberline-blank", "doublenumberline-blank",
                "polargrid-degrees", "polargrid-radians", "polargrid-blank", "coordinateplane-labeled",
                "coordinategrid-blank", "graphpaper-small", "graphpaper-large"
            ];

            this.$("#background-list-container").show();
            this.updateFocusRect(arrElem);
        },

        "hideBackgroundPopup": function() {
            var $dropDownIcon = this.$("#whiteboard.math-utilities-whiteboard-tool #background-tool-drop-down-icon-container");
            if (!$dropDownIcon.hasClass(".whiteboard-background-dropdown-hidden")) {
                $dropDownIcon.addClass("whiteboard-background-dropdown-hidden");
                this.$("#background-list-container").hide();
            }
        },

        /**
         * Gets fired when touchstart occurs on window. Hide the dropdowns or popups over here
         * @event _onFloatTouchStart
         * @private
         */
        "_onFloatTouchStart": function(event) {
            var $target = $(event.target),
                id = $target.attr("id");

            if ($target.attr("data-base-class") !== "popup-menu-item" &&
                id !== "shape-drop-down-icon" && id !== "shape-drop-down-icon-container" &&
                !$target.parents().is("#whiteboard-shapetool-popup .shape-tool-menuitem-container")) {
                this.$("#drop-down-icon-container").addClass("whiteboard-tool-dropdown-hidden");
                this.hidePopup();
            }
            if (id !== "background-tool" && !$target.parents("#background-tool").length) {
                this.$("#background-tool-drop-down-icon-container").addClass("whiteboard-background-dropdown-hidden");
                this.hideBackgroundPopup();
                if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                    //if shape type is background and before selecting any option if drop down is closed
                    this.trigger("triggerSelectTool");
                }
            }
            if ($target.attr("data-base-class") !== "popup-menu-item" && id !== "line-drop-down-icon" &&
                id !== "line-tool-icon" && id !== "line-drop-down-icon-container" && !$target.parents().is("#whiteboard-linetool-popup .shape-tool-menuitem-container")) {
                this._hideLinePopup();
            }
            if ($target.attr("data-base-class") !== "popup-menu-item" &&
                id !== "edit-drop-down-icon" &&
                id !== "edit-drop-down-icon-container" &&
                !$target.parents().is("#edit-drop-down-container .shape-tool-menuitem")) {
                this.$("#edit-drop-down-icon-container").addClass("whiteboard-tool-dropdown-hidden");
                this.hideEditPopup();
            }

            if (!$target.parents().is('#graph-tool')) {
                this.hideGraphPopup();
            }
            if (!$target.hasClass("more-menu-properties-container") &&
                $target.parents(".more-menu-properties-container").length === 0) {
                this.$(".more-menu-properties").hide();
            }
            if ($target.parents(".palette-main-div").length === 0) {
                this.hideColorPalettePopup();
            }
            if (id !== "change-opacity-text-box" && id !== "rotation-angle-text-box") {
                this.$("#rotation-angle-text-box, #change-opacity-text-box").blur();
            }
        },

        "getSyncData": function() {
            var selectedElement = this.$(".tool-menuitem.item-selected"),
                elemCounter = 0,
                elemLength = selectedElement.length,
                $curElem = null,
                popup = null,
                editState = this._createDatasetByElement(this.$("#edit-tool-menu")[0]),
                graphState = this._createDatasetByElement(this.$("#graph-tool-menu")[0]),
                lineState = this._createDatasetByElement(this.$("#line-tool")[0]),
                selectedShapeIds = {
                    "subMenuIds": [],
                    "menuIds": [],
                    "popup": {
                        "whiteboard-shapetool-popup": {
                            "triggerElemId": "drop-down-icon-container",
                            "isVisible": this.$("#whiteboard-shapetool-popup").is(":visible")
                        },
                        "background-list-container": {
                            "triggerElemId": "background-tool-drop-down-icon-container",
                            "isVisible": this.$("#background-list-container").is(":visible")
                        },
                        "edit-drop-down-container": {
                            "triggerElemId": "edit-drop-down-icon-container",
                            "isVisible": this.$("#edit-drop-down-container").is(":visible")
                        },
                        "graph-drop-down-container": {
                            "triggerElemId": "graph-drop-down-icon-container",
                            "isVisible": this.$("#graph-drop-down-container").is(":visible")
                        }
                    },
                    "visiblePopup": null,
                    "editState": {
                        "toolType": editState.toolType
                    },
                    "graphState": {
                        "toolType": graphState.toolType
                    },
                    "lineState": {
                        "toolType": lineState.toolType
                    },
                    "backgroundImage": {
                        "selected": this.$("#background-list-container .shape-tool-menuitem.background-option-selected").attr("id")
                    }
                };

            for (; elemCounter < elemLength; elemCounter++) {
                $curElem = $(selectedElement[elemCounter]);
                if ($curElem.attr("data-group") !== "3") {
                    if ($curElem.attr("data-base-class") !== "popup-menu-item") {
                        selectedShapeIds.menuIds.push($curElem.attr("id"));
                    } else {
                        selectedShapeIds.subMenuIds.push($curElem.attr("id"));
                    }
                }
            }

            for (popup in selectedShapeIds.popup) {
                if (selectedShapeIds.popup[popup].isVisible === true) {
                    selectedShapeIds.visiblePopup = popup;

                }
            }
            return {
                "selectedItem": selectedShapeIds
            };
        },

        "parseData": function(data) {
            if (!(data && data.selectedItem)) {
                return;
            }
            var selectedId = data.selectedItem.subMenuIds,
                elemCounter = 0,
                elemLength = selectedId.length,
                curElemId = null;

            for (elemCounter = 0; elemCounter < elemLength; elemCounter++) {
                curElemId = selectedId[elemCounter];
                this.$("#" + curElemId).trigger("click");
            }


            selectedId = data.selectedItem.menuIds;
            elemLength = selectedId.length;

            for (elemCounter = 0; elemCounter < elemLength; elemCounter++) {
                curElemId = selectedId[elemCounter];
                this.$("#" + curElemId).trigger("click");
            }

            //close all popup
            this._closeAllPopup();

            if (typeof data.selectedItem.visiblePopup !== "undefined") {
                this._showPopup(data.selectedItem.visiblePopup);
            }

            if (typeof data.selectedItem.editState !== "undefined") {
                this.setEditState(data.selectedItem.editState);
            }

            if (data.selectedItem.lineState !== void 0) {
                this.setLineState(data.selectedItem.lineState);
            }

            if (typeof data.selectedItem.graphState !== "undefined") {
                this.setGraphState(data.selectedItem.graphState);
            }

            //remove selection state for all background,add for no back-ground
            if (data.selectedItem.backgroundImage) {
                this.$("#background-list-container .shape-tool-menuitem").removeClass("background-option-selected");
                this.$("#background-list-container .shape-tool-menuitem#" + data.selectedItem.backgroundImage.selected)
                    .addClass("background-option-selected");
            }
        },

        "_closeAllPopup": function() {
            this.hideEditPopup();
            this.hideBackgroundPopup();
            this.hidePopup();
            this._hideLinePopup();
            this.hideGraphPopup();
        },

        "_showPopup": function(popup) {
            switch (popup) {
                case "whiteboard-shapetool-popup":
                    this.showPopup();
                    break;
                case "background-list-container":
                    this.showBackgroundPopup();
                    break;
                case "edit-drop-down-container":
                    this.showEditPopup();
                    break;
                case "graph-drop-down-container":
                    this.showGraphPopup();
                    break;
            }
        },

        "_onCheckboxClick": function(event) {
            if ($(event.currentTarget).hasClass("button-disabled")) {
                return false;
            }
            var $curTarget = $(event.currentTarget),
                chkboxName = $curTarget.attr('data-check-box-name'),
                isSelected = $curTarget.hasClass('checked'),
                triggerObj = {
                    "originalEvent": event,
                    "chkboxName": chkboxName,
                    "isChecked": !isSelected
                };

            this.setChkboxState(chkboxName, !isSelected);
            this.trigger('check-box-click', triggerObj);
        },

        "setChkboxState": function(chkboxName, isChecked) {
            var accManagerView = WhiteboardTool.Views.accManagerView,
                $chkBox = this.$('.check-box-container[data-check-box-name=\'' + chkboxName + '\']');
            $chkBox.toggleClass('checked', isChecked)
                .children().toggleClass('checked', isChecked);
            accManagerView.changeAccMessage($chkBox.attr('id'), isChecked ? 1 : 0); //if checked then selected message
        },

        "updateFocusRect": function(arrElem) {
            if (!arrElem) {
                return;
            }
            var managerView = WhiteboardTool.Views.accManagerView,
                elem = null;
            for (elem in arrElem) {
                managerView.updateFocusRect(arrElem[elem]);
            }
        },

        "enableTab": function(arrElem, isEnable) {
            if (!arrElem) {
                return;
            }
            var managerView = WhiteboardTool.Views.accManagerView,
                elem = null;
            for (elem in arrElem) {
                managerView.enableTab(arrElem[elem], isEnable);
            }
        },

        "enableGridOption": function(isEnable) {
            var $options = this.$('#graph-drop-down-container .check-box-container'),
                accManagerView = WhiteboardTool.Views.accManagerView;
            $options.toggleClass('button-disabled', !isEnable)
                .children().toggleClass('button-disabled', !isEnable)
                .toggleClass('checked', isEnable);
            _.each($options, function(key, value) {
                accManagerView.enableTab($(value).attr('id'), isEnable);
            });
        }
    });
    //shape toolbar view end **********************************************
})(window.MathUtilities);
