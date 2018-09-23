/* globals _, $, window */

(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;

    /**********************************************
    property tool bar view start
    See BaseToolbar for getter and setters
    Some of base functionalities are defined there
    **********************************************/

    /**
     * View class that handles the menu items for shapes, propagates events to the controller if any regarding menu items selected.
     * @class Tools
     */
    WhiteboardTool.Views.PropertyToolbar = WhiteboardTool.Views.BaseToolbar.extend({
        //Default settings of a property toolbar
        "defaultSettings": [{
            "tool-type": 11,
            "tool-value": "#424242",
            "bSelected": true
        }, {
            "tool-type": 12,
            "tool-value": "#424242",
            "bSelected": true
        }, {
            "tool-type": 13,
            "tool-value": "6",
            "bSelected": true
        }],

        "sliderViewObject": null,

        "initialize": function() {
            this.model = new WhiteboardTool.Models.PropertyToolbar();
            this.sliderViewObject = this._createThicknessSlider();
            this.createFnReference();
        },

        "createFnReference": function() {
            //This function are bind and unbind at multiple places,
            //To unbind them using off we create reference & used this reference.
            this.onPaletteDropdownClickFn = _.bind(this._onPaletteDropdownClick, this);
            this.increaseSliderValFn = _.bind(this._increaseSliderVal, this);
            this.decreaseSliderValFn = _.bind(this._decreaseSliderVal, this);
            this.onColorSelectorChangeFn = _.bind(this._onColorSelectorChange, this);
            this.onChangeOpacityButtonClickFn = _.bind(this._onChangeOpacityButtonClick, this);
            this.onFillOpacityTextBoxEnterFn = _.bind(this._onFillOpacityTextBoxEnter, this);
            this.onRotateButtonClickFn = _.bind(this._onRotateButtonClick, this);
            this.onRotateTextBoxEnterFn = _.bind(this._onRotateTextBoxEnter, this);
        },

        "_onPaletteDropdownClick": function(event) {
            var $currentTarget = $(event.currentTarget),
                managerView = WhiteboardTool.Views.accManagerView,
                $colorPaletteContainer = $currentTarget.parents('.color-palette');

            if ($colorPaletteContainer.hasClass('palette-hide')) {
                $colorPaletteContainer.parents('#math-utilities-properties-menu-container').find('.color-palette:not(.palette-hide)').addClass('palette-hide');
                $colorPaletteContainer.removeClass('palette-hide');
                managerView.unloadScreen('color-picker-screen');
                managerView.loadScreen('color-picker-screen');
                if ($colorPaletteContainer.find('.fill-color').hasClass('no-fill')) {
                    this.enableDisableTabIndexForPalette('fill', false);
                    managerView.setFocus('no-fill-check-holder');
                } else {
                    managerView.setFocus('fill-color-picker-acc-disk-container');
                }
                if ($colorPaletteContainer.find('.stroke-color').hasClass('no-stroke')) {
                    this.enableDisableTabIndexForPalette('stroke', false);
                    managerView.setFocus('no-stroke-check-holder');
                } else {
                    managerView.setFocus('stroke-color-picker-acc-disk-container');
                }
            } else {
                $colorPaletteContainer.addClass('palette-hide');
            }
        },

        "enableDisableTabIndexForPalette": function(palette, enable) {
            var $propertiesMenuContainer = this.$("#math-utilities-properties-menu-container"),
                managerView = WhiteboardTool.Views.accManagerView;
            managerView.enableTab(palette + "-color-picker-acc-disk-container", enable);
            managerView.enableTab(palette + "-luminance-bar-holder", enable);
            managerView.enableTab(palette + "-luminance-slider-handle", enable);
        },
        /**
         * hides properties tool bar
         * @method hidePropertiesToolBar
         */
        "hidePropertiesToolBar": function() {
            this.$("#whiteboard-properties-toolbar").hide();
        },

        "_increaseSliderVal": function() {
            var currVal = this.sliderViewObject.get("currValue"),
                sliderOptions = this.model._sliderValues,
                newVal = currVal + 1;
            if (newVal <= sliderOptions.max) {
                this.sliderViewObject.set(newVal);
            }
        },

        "_decreaseSliderVal": function() {
            var currVal = this.sliderViewObject.get("currValue"),
                sliderOptions = this.model._sliderValues,
                newVal = currVal - 1;
            if (newVal >= sliderOptions.min) {
                this.sliderViewObject.set(newVal);
            }
        },

        "_onFillOpacityTextBoxEnter": function(eventObject) {
            if (eventObject.keyCode === WhiteboardTool.Models.Sketchpad.ENTER_KEY) {
                var $toolElement = $(eventObject.delegateTarget),
                    data = {},
                    managerView = WhiteboardTool.Views.accManagerView;

                if ($toolElement.val() !== "") {
                    data.nFillAlpha = Number($toolElement.val()) / 100; //100 is used as nFillAlpha is in percentage.
                    data.toolValue = $toolElement.attr("data-value");
                    data.toolGroup = $toolElement.attr("data-group");
                    this.trigger("propertychange", data);
                    this.selectTool({
                        "tool-value": data.toolValue,
                        "tool-group": data.toolGroup
                    });

                    if (data.nFillAlpha === 0.5) { //0.5 to check 50% opacity
                        managerView.changeAccMessage("change-opacity-button", 1);
                    } else {
                        managerView.changeAccMessage("change-opacity-button", 0);
                    }
                }
            }
        },

        "_onChangeOpacityButtonClick": function(eventObject) {
            var data = {},
                $toolElement = null,
                managerView = WhiteboardTool.Views.accManagerView,
                accText = managerView.getAccMessage("change-opacity-button", 1);

            this.$("#change-opacity-text-box").val(50); //set to 50 for 50% opacity
            $toolElement = $(eventObject.delegateTarget);
            data.nFillAlpha = 0.5; //0.5 is 50% opacity
            data.toolValue = $toolElement.attr("data-value");
            data.toolGroup = $toolElement.attr("data-group");
            this.trigger("propertychange", data);
            this.selectTool({
                "tool-value": data.toolValue,
                "tool-group": data.toolGroup
            });

            if (this.$("#change-opacity-button-acc-elem").text() === accText) { //compare prev acc text with accText
                accText += " ";
            }
            managerView.setAccMessage("change-opacity-button", accText);
            managerView.setFocus("whiteboard-temp-focus");
            managerView.setFocus("change-opacity-button");
        },

        /**
         * Function called when an object is selected and rotate button is clicked from navigation properties bar
         * @event _onRotateButtonClick
         * @params {Object} eventObject -- Jquery event object
         * @private
         */
        "_onRotateButtonClick": function(eventObject) {
            var data = {},
                CHANGE_ANGLE_FACTOR = 15,
                $toolElement = null;

            $toolElement = $(eventObject.delegateTarget);
            data.angle = -CHANGE_ANGLE_FACTOR;
            data.toolValue = $toolElement.attr("data-value");
            data.toolGroup = $toolElement.attr("data-group");
            this.$("#rotation-angle-text-box").val(CHANGE_ANGLE_FACTOR);
            this.trigger("propertychange", data);
            this.selectTool({
                "tool-value": data.toolValue,
                "tool-group": data.toolGroup
            });
        },

        "_onRotateTextBoxEnter": function(eventObject) {
            if (eventObject.keyCode === WhiteboardTool.Models.Sketchpad.ENTER_KEY) {
                var data = {},
                    $toolElement = $(eventObject.delegateTarget);

                if ($toolElement.val() === "") {
                    $toolElement.val();
                }
                data.angle = -1 * Number($toolElement.val());
                data.toolValue = $toolElement.attr("data-value");
                data.toolGroup = $toolElement.attr("data-group");
                this.trigger("propertychange", data);
                this.selectTool({
                    "tool-value": data.toolValue,
                    "tool-group": data.toolGroup
                });
            }
        },

        /**
         * Gets fired when a menu Item on toolbar is clicked.
         * @event _onCurPropertyChange
         * @params {Object} eventObject -- Event object that let the change in current property tool.
         * @private
         */
        "_onColorSelectorChange": function(eventObject) {
            var data = {},
                $toolElement = $(eventObject.delegateTarget);

            if (!$toolElement.hasClass("disable-toolbar-menuitem")) {
                data.toolType = $toolElement.attr("data-tool-type");
                data.toolValue = $toolElement.attr("data-value"); // Optional
                data.toolGroup = $toolElement.attr("data-group");
                data.targetObj = eventObject.delegateTarget; // Optional

                this.trigger("propertychange", data);
                this.selectTool({
                    "tool-type": data.toolType,
                    "tool-value": data.toolValue,
                    "tool-group": data.toolGroup
                });
            }
        },

        "setStrokeColor": function(colorCode, movementData) {
            var data = {},
                $toolElement = this.$(".stroke-color");
            if (!$toolElement.hasClass("disable-toolbar-menuitem")) {
                $toolElement.attr("data-value", colorCode).css({
                    "background-color": colorCode
                });
                data.toolType = $toolElement.attr("data-tool-type");
                data.toolValue = $toolElement.attr("data-value"); // Optional
                data.toolGroup = $toolElement.attr("data-group");
                if (movementData) {
                    data.registerToStack = movementData.stop;
                    data.dontStorePrvState = !movementData.start;
                }

                this.trigger("propertychange", data);
                this.selectTool({
                    "tool-type": data.toolType,
                    "tool-value": data.toolValue,
                    "tool-group": data.toolGroup
                });
            }
        },
        "setFillColor": function(colorCode, movementData) {
            var data = {},
                $toolElement = this.$(".fill-color");
            if (!$toolElement.hasClass("disable-toolbar-menuitem")) {
                $toolElement.attr("data-value", colorCode).css({
                    "background-color": colorCode
                });
                data.toolType = $toolElement.attr("data-tool-type");
                data.toolValue = $toolElement.attr("data-value"); // Optional
                data.toolGroup = $toolElement.attr("data-group");
                if (movementData) {
                    data.registerToStack = movementData.stop;
                    data.dontStorePrvState = !movementData.start;
                }
                this.trigger("propertychange", data);
                this.selectTool({
                    "tool-type": data.toolType,
                    "tool-value": data.toolValue,
                    "tool-group": data.toolGroup
                });
            }
        },

        /**
         * Gets fired on slider change.
         * @event _onStrokeWidthChange, function is called when thickness slider is move, it trigger appropriate event
         * @param {Object} eventObject, Jquery event object
         * @private
         */
        "_onStrokeWidthChange": function(eventObject) {
            var data = {
                "toolValue": this.sliderViewObject.get("currValue"), // Optional
                "toolGroup": $(eventObject.delegateTarget).attr("data-group"),
                "registerToStack": false,
                "dontStorePrvState": true
            };
            this.trigger("propertychange", data);
            this.selectTool({
                "tool-value": data.toolValue,
                "tool-group": data.toolGroup
            });
        },

        /**
         * Gets fired on opacity value change.
         * @method _onFillOpacityChange, call when opacity of shape change, it fire event for as property.
         * @param {Object} eventObject, Jquery event object
         * @param {Number} opacity, optional, change opacity value
         * @private
         */
        "_onFillOpacityChange": function(eventObject, opacity) {
            var data = {
                "toolValue": opacity, // Optional
                "toolGroup": $(eventObject.delegateTarget).attr("data-group")
            };

            this.trigger("propertychange", data);
            this.selectTool({
                "tool-value": data.toolValue,
                "tool-group": data.toolGroup
            });

        },
        /**
         * Creates thickness Slider view
         * @method _createThicknessSlider, function to create slider to change thickness.
         * @param {Object} sliderContainer, optional , Jquery dom element
         * @return {Object} slider view object
         */
        "_createThicknessSlider": function(sliderContainer) {
            var sliderView,
                sliderOptions = this.model._sliderValues;
            if (!sliderContainer) {
                sliderContainer = this.$("#size-slider-container");
            }
            sliderContainer.attr("data-group", "6");
            sliderView = new MathUtilities.Components.Slider.Views.slider({
                "option": sliderOptions,
                "el": sliderContainer
            });
            this.sliderViewObject = sliderView;
            sliderContainer.on("change", _.bind(this._onStrokeWidthChange, this))
                .on("start", _.bind(this._onSliderDragStart, this))
                .on("stop", _.bind(this._onSliderDragEnd, this));
            sliderContainer.find(".sliderH").addClass("whiteboard-tool-image-sprite whiteboard-tool-slider-handle-up whiteboard-non-selectable-labels")
                .attr("id", "slider-Handle");
            return sliderView;
        },

        "getDefaultFillColor": function() {
            return this.model._defaultFill;
        },

        "getDefaultStrokeColor": function() {
            return this.model._defaultStroke;
        },

        "getDefaultStrokeWidth": function() {
            return this.model._defaultStrokeWidth;
        },
        "getDefaultColorCode": function() {
            return this.model._defaultColorCode;
        },

        "_onSliderDragStart": function(eventObject) {
            var data = {
                "toolValue": this.sliderViewObject.get("currValue"), // Optional
                "toolGroup": $(eventObject.delegateTarget).attr("data-group"),
                "registerToStack": false,
                "dontStorePrvState": false
            };

            this.trigger("propertychange", data);
            this.selectTool({
                "tool-value": data.toolValue,
                "tool-group": data.toolGroup
            });
        },
        "_onSliderDragEnd": function(eventObject) {
            var data = {
                "toolValue": this.sliderViewObject.get("currValue"), // Optional
                "toolGroup": $(eventObject.delegateTarget).attr("data-group"),
                "registerToStack": true,
                "dontStorePrvState": true
            };
            this.trigger("propertychange", data);
            this.selectTool({
                "tool-value": data.toolValue,
                "tool-group": data.toolGroup
            });
        }

    });

    //property toolbar view end **********************************************

})(window.MathUtilities);
