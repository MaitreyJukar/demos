(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                        Property Tool Bar                        */
    /*******************************************************************/
    /**
     * A customized Backbone.view that represents PropertyToolBar.
     * @class MathUtilities.Tools.ConstructionTool.Views.PropertyToolBar
     * @constructor
     * @namespace Tools.ConstructionTool.Views
     * @module PropertyToolBar
     * @extends Backbone.View
     */
    ConstructionTool.Views.PropertyToolBar = Backbone.View.extend({
        /**
         * holds property tool-bar object
         * @property commonPropertyToolbar
         * @type {object}
         */
        "commonPropertyToolbar": null,

        /**
         * Holds stroke-width slider object
         * @property strokeWidthSlider
         * @type {Object}
         */
        "strokeWidthSlider": null,

        /**
         * Stores the temporary undo redo states.
         * @property _undoRedoStates
         * @type {Object}
         * @private
         */
        "_undoRedoState": null,

        /**
         * Initializer of the application.
         * @method initialize
         */
        "initialize": function() {
            this.initModel();
            this._createCommonPropertyToolBar();
            this._createThicknessSlider();
            this._bindEvents();

            this._undoRedoState = {};
            this._undoRedoState.oldState = {};
            this._undoRedoState.newState = {};

            this._createPropertyBarTooltip();
        },

        /**
         * Initialize model of property Tool bar view.
         * @model initModel
         */
        "initModel": function() {
            this.model = new ConstructionTool.Models.PropertyToolBar();
        },

        /**
         * Create common property tool bar object, also attach function to events.
         * @method _createCommonPropertyToolBar
         * @privates
         */
        "_createCommonPropertyToolBar": function() {
            //create common property tool-bar
            this.commonPropertyToolbar = new MathUtilities.Components.PropertiesBar.Views.MenuBar({
                "el": this.el
            });
            this.commonPropertyToolbar.show(["propertiesMenu"], ConstructionTool.Views.templates);
            this.commonPropertyToolbar.on("properties-bar-hidden", $.proxy(this.onPropertyBarHide, this));

            this._updatePropertyToolBarSize();
        },

        "_updatePropertyToolBarSize": function() {
            var $propertybar = this.$el,
                gap = 0;

            if (this.options.isScrollVisible === true) {
                gap = ConstructionTool.Views.PropertyToolBar.RIGHT_PADDING;
            }

            $propertybar.width($propertybar.parent().width() - gap);
        },

        /**
         * Show property tool-bar.
         * @method show
         */
        "show": function show(shapeType) {
            var propertyItems = this.model.get("drawingToolMenuItems")[shapeType],
                propertyLength = propertyItems ? propertyItems.length : 0,
                property = null,
                iLooper = 0;

            this.model.setOptions({
                "curToolType": shapeType,
                "isVisible": true
            });
            this.commonPropertyToolbar.show();

            if (propertyLength === 0) {
                this.hide();
            } else {
                this.$("[data-property]").hide();
                for (; iLooper < propertyLength; iLooper++) {
                    property = this.$("[data-property=\"" + propertyItems[iLooper] + "\"]");
                    property.show();
                }
                this._setStrokeColor();
                this._selectPropertyValue();
                this._changeStrokeWidthColor();
            }
        },

        /**
         * Depending upon model object values, apply selected class to element.
         * @method _selectPropertyValue
         * @private
         */
        "_selectPropertyValue": function _selectPropertyValue() {
            var properties = this.model.get("properties"),
                $background = this.$(".background-color-item[data-value=" + properties.backgroundColor + "]"),
                $stroke = this.$(".stroke-color-item[data-value=" + properties.strokeColor + "]"),
                accManagerView = ConstructionTool.Views.accManagerView,
                $strokeColorElem = this.$(".stroke-color-item"),
                $backgroundColorElem = this.$(".background-color-item");

            this.$(".property-menu-item").removeClass("selected");
            //for background color
            //accesibility text change
            $.each($backgroundColorElem, function(key, value) {
                accManagerView.changeAccMessage($(value).attr("id"), 0);
            });
            $background.addClass("selected");
            accManagerView.changeAccMessage($background.attr("id"), 1);

            //for stroke color
            //accesibility text change
            $.each($strokeColorElem, function(key, value) {
                accManagerView.changeAccMessage($(value).attr("id"), 0);
            });
            $stroke.addClass("selected");
            accManagerView.changeAccMessage($stroke.attr("id"), 1);

            //set stroke-width slider value
            this.strokeWidthSlider.set(properties.strokeWidth);
        },

        "_createPropertyBarTooltip": function _createPropertyBarTooltip() {
            var tooltipElems = null,
                elemId = null,
                options = null,
                tooltipView = null,
                accManagerView = ConstructionTool.Views.accManagerView,
                $toolholder = this.$el;

            tooltipElems = {
                "delete-button": {
                    "tooltipHolder": "delete-button",
                    "position": "bottom"
                },
                "math-utilities-properties-collapse-button": {
                    "tooltipHolder": "math-utilities-properties-collapse-button",
                    "position": "bottom",
                    "align": "right"
                },
                "resize-image": {
                    "tooltipHolder": "resize-image",
                    "position": "bottom",
                    "align": "left"
                }
            };

            for (elemId in tooltipElems) {
                options = {
                    "id": tooltipElems[elemId].tooltipHolder + "-tooltip",
                    "text": accManagerView.getMessage(elemId + "-tooltip", 0),
                    "position": tooltipElems[elemId].position,
                    "align": tooltipElems[elemId].align,
                    "tool-holder": $toolholder
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);
                if ("ontouchstart" in window) {
                    $("#" + elemId).on("touchstart", $.proxy(tooltipView.showTooltip, tooltipView)).on("touchend", $.proxy(tooltipView.hideTooltip, tooltipView));
                } else {
                    $("#" + elemId).on("mouseenter", $.proxy(tooltipView.showTooltip, tooltipView)).on("mouseleave click", $.proxy(tooltipView.hideTooltip, tooltipView));
                }
            }
        },

        /**
         * Change stroke-width element background-color as stroke-color.
         * @method _changeStrokeWidthColor
         * @private
         */
        "_changeStrokeWidthColor": function _changeStrokeWidthColor() {
            this.$(".max-stroke-width,.min-stroke-width").css({
                "background-color": this.model.get("properties").strokeColor
            });
        },

        /**
         * Hide property tool-bar.
         * @method hide
         */
        "hide": function hide() {
            this.model.setOptions({
                "curToolType": null,
                "isVisible": false
            });
            this.commonPropertyToolbar.hide({
                "supressEvent": true
            });
        },

        "onPropertyBarHide": function onPropertyBarHide() {
            this.trigger("property-toolbar-hide");
            this.model.setOptions({
                "isVisible": false
            });
        },

        /**
         * bind function to property tool bar
         * @method _bindEvents
         */
        "_bindEvents": function _bindEvents() {
            //on Stroke-color change
            this.$(".stroke-color-item").on("click", $.proxy(this._onStrokeColorChange, this));
            this.$(".min-stroke-width").on("click", $.proxy(this._decreaseSliderVal, this));
            this.$(".max-stroke-width").on("click", $.proxy(this._increaseSliderVal, this));
            this.$(".resize-shape").on("click", $.proxy(this._onResizeClick, this));
            this.$(".delete-button").on("click", $.proxy(this._onDeleteClick, this));
            this.$(".background-color-item").on("click", $.proxy(this._onBackgroundColorChange, this));
        },

        /**
         * Trigger when stroke-color change
         * @method _onStrokeColorChange
         * @param {object} event
         */
        "_onStrokeColorChange": function _onStrokeColorChange(event) {
            var prevColor = this.model.get("properties").strokeColor,
                $target = $(event.currentTarget),
                curColor = $target.attr("data-value"),
                $strokeColorElem = this.$(".stroke-color-item"),
                accManager = ConstructionTool.Views.accManagerView,
                targetId = $target.attr("id");

            if (prevColor !== curColor) {
                $strokeColorElem.removeClass("selected");
                $target.addClass("selected");
                this._setStrokeColor(curColor);
                this._changeStrokeWidthColor();

                //accesibility text change
                $.each($strokeColorElem, function(key, value) {
                    accManager.changeAccMessage($(value).attr("id"), 0);
                });

                this.refocusElem(targetId, accManager.getAccMessage(targetId, 1), 10);

                this.trigger("propertyToolChanged", {
                    "changeProperty": ConstructionTool.Views.PropertyToolBar.PROPERTY.STROKE_COLOR_CHANGE,
                    "toolValue": curColor,
                    "prevToolValue": prevColor
                });
            }
        },
        "_setStrokeColor": function _setStrokeColor(color) {
            var toolType = this.model.get("properties").curToolType,
                mapping = this.model.get("strokeColorMapping"),
                element;

            for (element in mapping) {
                if (mapping[element].toolType === toolType) {
                    if (typeof color !== "undefined") {
                        mapping[element].currentColor = color;
                    }
                    this.model.setOptions({
                        "strokeColor": mapping[element].currentColor
                    });
                }
            }
        },

        /**
         * Creates thickness Slider view
         * @method _createThicknessSlider
         * @return {Object} slider view object
         */
        "_createThicknessSlider": function _createThicknessSlider() {
            var sliderView,
                sliderOptions = this.model.get("sliderValues"),
                sliderContainer = this.$(".slider-container");

            sliderView = new MathUtilities.Components.Slider.Views.slider({
                "option": sliderOptions,
                "el": sliderContainer
            });

            sliderContainer.on("change", $.proxy(this._onStrokeWidthChange, this));
            sliderContainer.find(".sliderH").addClass("construction-tool-sprite construction-tool-slider-handle-up").attr("id", "slider-Handle").on("keydown", $.proxy(this.onSliderKeyPress, this));

            this.strokeWidthSlider = sliderView;
        },

        /**
         * Trigger when slider value change.
         * @method _onStrokeWidthChange
         * @private
         */
        "_onStrokeWidthChange": function() {
            var prevStrokeWidth = this.model.get("properties").strokeWidth,
                curStrokeWidth = this.strokeWidthSlider.get("currValue");

            if (prevStrokeWidth !== curStrokeWidth) {
                this.model.setOptions({
                    "strokeWidth": curStrokeWidth
                });
                this.trigger("propertyToolChanged", {
                    "changeProperty": ConstructionTool.Views.PropertyToolBar.PROPERTY.STROKE_WIDTH_CHANGE,
                    "toolValue": curStrokeWidth,
                    "prevToolValue": prevStrokeWidth
                });
            }
        },

        "onSliderKeyPress": function onSliderKeyPress(event) {
            var keyCode = event.keyCode,
                manager = ConstructionTool.Views.accManagerView,
                sketchPadModel = ConstructionTool.Models.Sketchpad,
                allowedKeyCode = [sketchPadModel.RIGHT_ARROW_KEY, sketchPadModel.TOP_ARROW_KEY, sketchPadModel.LEFT_ARROW_KEY, sketchPadModel.BOTTOM_ARROW_KEY, sketchPadModel.TAB_KEY],
                curSliderValue = this.model.get("properties").strokeWidth,
                curText = "",
                sliderId = "slider-Handle",
                textAfteRefocus = manager.getAccMessage(sliderId, 0),
                isArrowPressed = true;

            if (allowedKeyCode.indexOf(keyCode) === -1) {
                return;
            }

            switch (keyCode) {
                case sketchPadModel.RIGHT_ARROW_KEY:
                case sketchPadModel.TOP_ARROW_KEY:
                    if (curSliderValue === 10) {
                        curText = manager.getAccMessage(sliderId, 3);
                    } else {
                        curText = manager.getAccMessage(sliderId, 1);
                    }
                    break;
                case sketchPadModel.LEFT_ARROW_KEY:
                case sketchPadModel.BOTTOM_ARROW_KEY:
                    if (curSliderValue === 1) {
                        curText = manager.getAccMessage(sliderId, 4);
                    } else {
                        curText = manager.getAccMessage(sliderId, 2);
                    }
                    break;
                case sketchPadModel.TAB_KEY:
                    isArrowPressed = false;
                    manager.setAccMessage(sliderId, textAfteRefocus);
                    break;
            }
            if (isArrowPressed === true) {
                this.refocusElem(sliderId, curText, 10);
            }
        },

        /**
         * increase slider value.
         * @method _increaseSliderVal
         */
        "_increaseSliderVal": function _increaseSliderVal() {
            var currVal = this.strokeWidthSlider.get("currValue"),
                sliderOptions = this.model.get("sliderValues"),
                newVal = currVal + 1;
            if (newVal <= sliderOptions.max) {
                this.strokeWidthSlider.set(newVal);
            }
        },

        /**
         * decrease slider value.
         * @method _decreaseSliderVal
         */
        "_decreaseSliderVal": function _decreaseSliderVal() {
            var currVal = this.strokeWidthSlider.get("currValue"),
                sliderOptions = this.model.get("sliderValues"),
                newVal = currVal - 1;
            if (newVal >= sliderOptions.min) {
                this.strokeWidthSlider.set(newVal);
            }
        },

        /**
         * Return Stroke-color value.
         * @method getStrokeColor
         * @return {string} stroke-color value
         */
        //getter is given as it is going to use as public function
        "getStrokeColor": function getStrokeColor() {
            return this.model.get("properties").strokeColor;
        },

        /**
         * Set Stroke-color value.
         * @method setStrokeColor
         * @param {string} stroke-color value
         */
        //setter is given as it is going to use as public function
        "setStrokeColor": function setStrokeColor(strokeColor) {
            this.model.setOptions({
                "strokeColor": strokeColor
            });
            this._selectPropertyValue();
        },

        /**
         * Return Stroke-width value.
         * @method getStrokeWidth
         * @return {string} stroke-width value
         */
        //getter is given as it is going to use as public function
        "getStrokeWidth": function getStrokeWidth() {
            return this.model.get("properties").strokeWidth;
        },

        /**
         * Set Stroke-width value.
         * @method setStrokeWidth
         * @param {string} stroke-width value
         */
        //setter is given as it is going to use as public function
        "setStrokeWidth": function setStrokeWidth(strokeWidth) {
            this.model.setOptions({
                "strokeWidth": strokeWidth
            });
            this._selectPropertyValue();
        },

        /**
         * Trigger when resize button is click
         * @method _onResizeClick
         * @private
         */
        "_onResizeClick": function _onResizeClick() {
            this.trigger("propertyToolChanged", {
                "changeProperty": ConstructionTool.Views.PropertyToolBar.PROPERTY.RESIZE_CLICK
            });
        },


        /**
         * Trigger when delete button click
         * @method _onDeleteClick
         * @private
         */
        "_onDeleteClick": function _onDeleteClick() {
            this.trigger("propertyToolChanged", {
                "changeProperty": ConstructionTool.Views.PropertyToolBar.PROPERTY.DELETE_CLICK
            });
        },

        /**
         * Trigger when background-color change
         * @method _onBackgroundColorChange
         * @param {object} event
         */
        "_onBackgroundColorChange": function _onBackgroundColorChange(event) {
            var prevColor = this.model.get("properties").backgroundColor,
                $target = $(event.currentTarget),
                curColor = $target.attr("data-value"),
                $backgroundColorElem = this.$(".background-color-item"),
                targetId = $target.attr("id"),
                accManager = ConstructionTool.Views.accManagerView,
                oldState = {},
                curState = {};

            if (prevColor !== curColor) {
                //Save previous state in undo redo stack.
                oldState = this.model.getProperties();
                this._savePreviousState(oldState);

                $backgroundColorElem.removeClass("selected");
                $target.addClass("selected");
                this.model.setOptions({
                    "backgroundColor": curColor
                });

                //Save current(changed) state in undo redo stack.
                curState = this.model.getProperties();
                this._saveCurrentState(curState);

                //accesibility text change
                $.each($backgroundColorElem, function(key, value) {
                    accManager.changeAccMessage($(value).attr("id"), 0);
                });
                this.refocusElem(targetId, accManager.getAccMessage(targetId, 1), 10);

                this.trigger("propertyToolChanged", {
                    "changeProperty": ConstructionTool.Views.PropertyToolBar.PROPERTY.BACKGROUND_COLOR_CHANGE,
                    "toolValue": curColor
                });
            }
        },

        /**
         * Return backgroundColor value.
         * @method getBackgroundColor
         * @return {string} stroke-width value
         */
        //getter is given as it is going to use as public function
        "getBackgroundColor": function getStrokeWidth() {
            return this.model.get("properties").backgroundColor;
        },

        /**
         * Set backgroundColor value.
         * @method setBackgroundColor
         * @param {string} stroke-width value
         */
        //setter is given as it is going to use as public function
        "setBackgroundColor": function setStrokeWidth(backgroundColor) {
            this.model.setOptions({
                "backgroundColor": backgroundColor
            });
            this._selectPropertyValue();
        },

        /**
         * Return object require for saving state.
         * @method getSyncData
         */
        "getSyncData": function getSyncData() {
            var propertyData = this.model.get("properties"),
                cloneData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(propertyData);
            cloneData.strokeColor = "";
            return cloneData;
        },

        "parseToolbarData": function parseToolbarData(dataObject) {
            if (typeof dataObject === "undefined") {
                return;
            }
            var properties = this.model.get("properties");

            this.model.setOptions(dataObject);

            if (properties.isVisible === true) {
                this.show(properties.curToolType);
            } else {
                this.hide();
            }
        },

        /*************************************************************************************
        Undo redo state saves, getters and mor...
        *************************************************************************************/
        "_savePreviousState": function(data) {
            this._undoRedoState.oldState = data;
        },

        "_getPreviousState": function() {
            return this._undoRedoState.oldState;
        },

        "_saveCurrentState": function(data) {
            this._undoRedoState.newState = data;
        },

        "_getCurrentState": function() {
            return this._undoRedoState.newState;
        },
        "setToDefaultState": function setToDefaultState() {
            this.model.setDefaults();
        },

        "refocusElem": function(id, accText, delay, textAfterFocus) {
            var accManager = ConstructionTool.Views.accManagerView,
                $accElem = this.$("#" + id).find(".acc-read-elem"),
                prevText = $accElem.text();

            if (accText) {
                if (prevText === accText) {
                    accText += " ";
                }
                accManager.setAccMessage(id, accText);
            }

            accManager.setFocus("construction-temp-focus");
            accManager.setFocus(id, delay);

            if (textAfterFocus) {
                setTimeout(function() {
                    accManager.setAccMessage(id, textAfterFocus);
                }, delay + 10);
            }

        }
    }, {
        "PROPERTY": {
            "STROKE_WIDTH_CHANGE": "stroke-width-change",
            "STROKE_COLOR_CHANGE": "stroke-color-change",
            "RESIZE_CLICK": "resize-click",
            "DELETE_CLICK": "delete-click",
            "BACKGROUND_COLOR_CHANGE": "background-color-change"
        },
        "RIGHT_PADDING": 15 //vertical scroll bar size

    });
}(window.MathUtilities));
