/* globals _, MathUtilities, paper, $, window  */

(function() {
    "use strict";
    var className = null;

    /*
     * @class Overview
     * @namespace MathUtilities.Components.ColorPicker.Views.ColorPicker
     * @extends Backbone.View.extend
     * @constructor
     */
    MathUtilities.Components.ColorPicker.Views.ColorPicker = Backbone.View.extend({
        /**
         * Holds the current paper scope
         * @property paperScope
         * @type Object
         * @default null
         */
        "paperScope": null,

        /**
         * Tool of paper object
         * @attribute currentTool
         * @type Object
         * @default null
         */
        "currentTool": null,

        /**
         * idPrefix of interactivity
         * @attribute idPrefix
         * @type Object
         * @default null
         */
        "idPrefix": null,

        /**
         * Holds paper object of color disk
         * @attribute colorDisk
         * @type Object
         * @default null
         */
        "colorDisk": null,

        /**
         * Holds the flag which tells whether to generate an alpha slider
         * @property createAlphaSlider
         * @type Boolean
         * @default null
         */
        "createAlphaSlider": null,

        /**
         * Holds paper object of ring used to show selected color
         * @attribute focusRing
         * @type Object
         * @default null
         */
        "focusRing": null,

        /**
         * Position of selected color
         * @attribute focusPoint
         * @type Object
         * @default null
         */
        "focusPoint": null,

        /**
         * View of close button tooltip
         * @attribute focusPoint
         * @type Object
         * @default null
         */
        "closeTooltipView": null,

        /**
         * Holds view of luminance slider
         * @attribute luminanceSliderView
         * @type Object
         * @default null
         */
        "luminanceSliderView": null,

        /**
         * Holds view of alpha(opacity) slider
         * @attribute alphaSliderView
         * @type Object
         * @default null
         */
        "alphaSliderView": null,

        "canvasAcc": null,

        "boundaryCheck": true,

        /**
         * Initialises Color Picker
         * @method initialize
         */
        "initialize": function() {
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.createAlphaSlider = this.model.get('createAlphaSlider');
            this.colorInstance = new MathUtilities.Components.ColorPicker.Models.Colors();
            this.render();
        },

        /**
         * Renders
         * @method render
         * @public
         */
        "render": function render() {
            this.generateColorPicker();
            this.setPaperScope();
            this._setInitialPositions();
            this.drawCircles();
            this.generateLuminanceSlider();
            this.renderLuminanceBar();
            if (this.createAlphaSlider) {
                this.generateAlphaSlider();
                this.renderAlphaBar();
            }
            this._bindEvents();
            this.renderCloseButton();
            this.manager.loadScreen('color-picker-screen');
            this._loadCanvasForAcc();
            this.handleColorPickerAcc();
            this.createCustomTooltip();
        },

        /**
         * generates color picker
         * @method generateColorPicker
         * @public
         */
        "generateColorPicker": function() {
            var options = {
                "idPrefix": this.idPrefix,
                "alpha": !this.createAlphaSlider ? "hide-alpha" : ""
            };
            this.$el.append(MathUtilities.Components.ColorPicker.templates.colorPicker(options).trim());
        },

        /**
         * Sets paper scope
         * @method setPaperScope
         * @public
         */
        "setPaperScope": function() {
            var myPaper = this.paperScope = new paper.PaperScope();
            myPaper.setup((this.idPrefix || '') + 'color-disk');
            this.currentTool = new myPaper.Tool();
            myPaper.activate();
        },

        /**
         * Draws circles
         * @method drawCircles
         * @public
         */
        "drawCircles": function() {
            this.colorDisk = this._drawCircle(className.CENTER_POINTS, className.DISK_RADIUS, className.DISK_STROKE_COLOR);
            this.focusRing = this._drawCircle(this.focusPoint, className.FOCUS_RING_RADIUS, '#000');
        },

        /**
         * Draw a circle.
         * @method _drawCircle
         * @private
         */
        "_drawCircle": function(position, radius, strokeColor) {
            this.paperScope.activate();
            var circle = this.paperScope.Path.Circle({
                "center": position,
                "radius": radius,
                "strokeColor": strokeColor,
                "fillColor": '#000'
            });
            circle.fillColor.alpha = 0;
            this.paperScope.view.draw();
            return circle;
        },

        /**
         * Renders luminance bar
         * @method renderLuminanceBar
         * @public
         */
        "renderLuminanceBar": function() {
            var luminanceBar = this.$('.luminance-slider canvas')[0],
                ctx = luminanceBar.getContext('2d'),
                gradient = ctx.createLinearGradient(0, 0, 0, 200);

            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, 'black');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 11, 230);
        },

        /**
         * generates luminance slider
         * @method generateLuminanceSlider
         * @public
         */
        "generateLuminanceSlider": function() {
            var luminanceSliderData = className.LUMINANCE_SLIDER,
                selectedValue = this.colorInstance.colors.RND.hsv.v,
                luminanceSliderKeyDown = _.bind(function(event) {
                    this.onSliderKeyDown(event, this.luminanceSliderView);
                }, this);
            this.luminanceSliderView = new MathUtilities.Components.Slider.Views.slider({
                "option": {
                    "min": luminanceSliderData.min,
                    "max": luminanceSliderData.max,
                    "val": selectedValue,
                    "orientation": 'vertical',
                    "valueDisplay": false,
                    "stepFunctionality": true,
                    "step": luminanceSliderData.step

                },
                "el": $('#' + this.idPrefix + 'luminance-slider-holder')
            });

            this.luminanceSliderView.$('.slider-container').on('slide', _.bind(this.onSlideLuminanceSlider, this))
                .on('slidestop', _.bind(this.onStopLuminanceSlider, this))
                .on('slidestart', _.bind(this.onStartLuminanceSlider, this))
                .find('.sliderH').on('keydown', luminanceSliderKeyDown);
        },

        /**
         * On slide luminance slider
         * @method onSlideLuminanceSlider
         * @public
         * @param {Object} event Event object
         * @param {Object} ui [[Description]]
         */
        "onSlideLuminanceSlider": function(event, ui) {
            var color = this.colorInstance.setColor({
                    "v": ui.value !== null ? ui.value : event //Changed for Accessibility 
                }, 'hsv'),
                colorObj = this.getColorString(color),
                movementData = {
                    "stop": false,
                    "start": false
                };
            if (this.createAlphaSlider) {
                this.renderAlphaBar(colorObj.hex);
            }
            this.model.set("colorObj", colorObj);
            this.trigger(className.EVENTS.COLOR_CHANGE, event, colorObj, movementData);
        },

        "onStopLuminanceSlider": function(event, ui) {
            var color = this.colorInstance.setColor({
                    "v": ui.value !== null ? ui.value : event //Changed for Accessibility 
                }, 'hsv'),
                colorObj = this.getColorString(color),
                movementData = {
                    "stop": true,
                    "start": false
                };
            this.model.set("colorObj", colorObj);
            this.trigger(className.EVENTS.COLOR_CHANGE, event, colorObj, movementData);
        },
        "onStartLuminanceSlider": function(event, ui) {
            var color = this.colorInstance.setColor({
                    "v": ui.value !== null ? ui.value : event //Changed for Accessibility 
                }, 'hsv'),
                colorObj = this.getColorString(color),
                movementData = {
                    "stop": false,
                    "start": true
                };
            this.model.set("colorObj", colorObj);
            this.trigger(className.EVENTS.COLOR_CHANGE, event, colorObj, movementData);
        },
        /**
         * On slide luminance slider handle key down
         * @method onSliderKeyDown
         * @public
         * @param {Object} event Event object
         * @param {Object} sliderView Slider object
         */
        "onSliderKeyDown": function(event, sliderView) {
            if (!(event && this.manager && sliderView && [9, 37, 38, 39, 40].indexOf(event.keyCode) !== -1)) {
                //Keycode are as follows:
                // 9 : TAB
                // 37 : LEFT ARROW
                // 38 : TOP ARROW
                // 39 : RIGHT ARROW
                // 40 : BOTTOM ARROW
                return;
            }
            var keyCode = event.keyCode,
                $slider = $(event.currentTarget),
                prevText = $slider.find(".acc-read-elem").text(),
                sliderId = $slider.attr('id'),
                manager = this.manager,
                currVal = sliderView.get("currValue"),
                maxVal = sliderView.get("max"),
                minVal = sliderView.get("min"),
                curText = "";

            switch (keyCode) {
                case 39: // code for right arrow key
                case 38: // code for top arrow key
                    if (currVal === maxVal) {
                        curText = manager.getAccMessage(sliderId, 3); // 3 for slider max value
                    } else {
                        curText = manager.getAccMessage(sliderId, 1); // 1 for slider value increase
                    }
                    break;

                case 37: // code for left arrow key
                case 40: // code for bottom arrow key
                    if (currVal === minVal) {
                        curText = manager.getAccMessage(sliderId, 4); // 4 for slider min value
                    } else {
                        curText = manager.getAccMessage(sliderId, 2); //2 for slider value decrease
                    }
                    break;
                case 9: // code for tab key
                    curText = manager.getAccMessage(sliderId, 0); // 0 for default slider text
                    break;
            }
            if (curText && curText !== "") {
                if (curText === prevText) {
                    curText += " ";
                }
                manager.setAccMessage(sliderId, curText);
                if (keyCode !== 9) { //9 for tab key
                    manager.setFocus("color-picker-temp");
                    manager.setFocus(sliderId, 10); //10 is delay
                }
            }
        },
        /**
         * Renders alpha bar
         * @method renderAlphaBar
         * @public
         */
        "renderAlphaBar": function(color) {
            var opacityBar = this.$('.opacity-slider').find('canvas')[0],
                ctx = opacityBar.getContext('2d'),
                gradient = ctx.createLinearGradient(200, 0, 0, 0);
            color = color || '#' + this.colorInstance.colors.HEX;

            gradient.addColorStop(0, color);
            gradient.addColorStop(1, '#fff');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 230, 11);
        },

        /**
         * generates alpha slider
         * @method generateAlphaSlider
         * @public
         */
        "generateAlphaSlider": function() {
            var alphaSliderData = className.ALPHA_SLIDER,
                selectedValue = this.colorInstance.colors.alpha;
            this.alphaSliderView = new MathUtilities.Components.Slider.Views.slider({
                "option": {
                    "min": alphaSliderData.min,
                    "max": alphaSliderData.max,
                    "val": selectedValue,
                    "orientation": 'horizontal',
                    "valueDisplay": false,
                    "stepFunctionality": false
                },
                "el": $('#' + this.idPrefix + 'opacity-bar-holder')
            });
            this.alphaSliderView.$('.slider-container').on('slide', _.bind(this.onSlideAlphaSlider, this));
        },

        /**
         * On slide alpha slider
         * @method onSlideAlphaSlider
         * @public
         * @param {Object} event Event Object
         * @param {Object} ui [[Description]]
         */
        "onSlideAlphaSlider": function(event, ui) {
            var color = this.colorInstance.setColor({}, 'alpha', ui.value !== null ? ui.value : event), //Changed for Accessibility
                colorObj = this.getColorString(color);
            this.model.set("colorObj", colorObj);
            this.trigger(className.EVENTS.ALPHA_CHANGE, event, colorObj);
        },

        /**
         * Sets initial positions
         * @method _setInitialPositions
         * @private
         */
        "_setInitialPositions": function() {
            var color = this.model.getColor(),
                colorObj = this.colorInstance.setColor(color),
                hsv = colorObj.RND.hsv;
            this.focusPoint = this._getRingPosition(hsv.h, hsv.s);
            this.$('.luminance-slider').css({
                'background-color': 'rgb(' + colorObj.hueRGB.r + ',' + colorObj.hueRGB.g + ',' + colorObj.hueRGB.b + ')'
            });
            this.$('.luminance-bar-white')[0].style.opacity = 1 - colorObj.hsv.s;
            this.model.set("colorObj", this.getColorString(colorObj));
        },

        /**
         * Gets ring position
         * @method _getRingPosition
         * @private
         * @param {Number} angle Angle between center and ring position
         * @param {Number} distance Distance of ring from center
         * @returns {Array} Co-ordinates of ring
         */
        "_getRingPosition": function(angle, distance) {
            var center = className.CENTER_POINTS,
                x = center[0] + distance * Math.cos(angle * Math.PI / 180),
                y = center[1] - distance * Math.sin(angle * Math.PI / 180);
            return [x, y];
        },

        /**
         * Binds events
         * @method _bindEvents
         * @private
         */
        "_bindEvents": function() {
            var colorDisk = this.colorDisk,
                focusRing = this.focusRing,
                $diskCanvas = this.$('.color-disk'),
                currentTool = this.currentTool;

            colorDisk.on('mousedown', _.bind(function(event) {
                this.diskMouseMove(event);
            }, this));
            colorDisk.on('mouseenter', function() {
                $diskCanvas.removeClass('default-cursor').addClass('crosshair-cursor');
            });
            colorDisk.on('mouseleave', function() {
                $diskCanvas.removeClass('crosshair-cursor').addClass('default-cursor');
            });
            colorDisk.on('mousedrag', _.bind(function(event) {
                this.diskMouseMove(event);
            }, this));

            focusRing.on('mousedrag', _.bind(function(event) {
                this.diskMouseMove(event);
            }, this));

            focusRing.on('mouseup', _.bind(function(event) {
                this.diskMouseUp(event);
            }, this));

            currentTool.on('mouseup', _.bind(function(event) {
                if (event.point.isInside(this.colorDisk)) {
                    $diskCanvas.removeClass('default-cursor').addClass('crosshair-cursor');
                }
            }, this));
            currentTool.on('mousedown', function() {
                $diskCanvas.removeClass('crosshair-cursor').addClass('default-cursor');
            });
            currentTool.on('mousedrag', function(event) {
                event.preventDefault();
            });

            this.$('.color-picker-container').on('mousedown', _.bind(function(event) {
                this._onContainerClick(event);
            }, this));
        },

        /**
         * disk mouse move
         * @method diskMouseMove
         * @public
         * @param {Object} event Event Object
         */
        "diskMouseMove": function(event) {
            if (event.event.which === 1 || event.event.which === 0) {
                var r = className.DISK_RADIUS,
                    centerDistance = className.CENTER_DISTANCE,
                    x, // color space
                    y, // color space
                    h, // color space
                    s, // saturation
                    color,
                    colorObj = null;

                this.boundaryCheck = true;
                x = event.point.x - centerDistance;
                y = event.point.y - centerDistance;
                h = 360 - ((Math.atan2(y, x) * 180 / Math.PI) + (y < 0 ? 360 : 0)); // 180: pi, 360: 2 pi
                if (event.point.isInside(this.colorDisk)) {
                    s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                } else {
                    if (this._angleOutOfBounds(h)) {
                        this.boundaryCheck = false;
                        if (event.currentTarget) {
                            this.manager.changeAccMessage(event.currentTarget.id, 2);
                            _.delay(_.bind(this._setFocusOnCanvas, this), 10); //To re focus on canvas
                        }
                    }
                    s = r;
                }
                color = this.colorInstance.setColor({
                    "h": h,
                    "s": s
                }, 'hsv');
                this.focusRing.position = this._getRingPosition(h, s);
                colorObj = this.getColorString(color);
                this.$('.luminance-slider').css({
                    "background-color": 'rgb(' + color.hueRGB.r + ',' + color.hueRGB.g + ',' + color.hueRGB.b + ')'
                });
                this.$('.luminance-bar-white')[0].style.opacity = 1 - color.hsv.s;
                if (this.createAlphaSlider) {
                    this.renderAlphaBar(colorObj.hex);
                }
                this.model.set("colorObj", colorObj);
                this.trigger(className.EVENTS.COLOR_CHANGE, event, colorObj, {
                    "stop": false,
                    "start": !this.setColor
                });
                if (!this.setColor) {
                    this.setColor = true;
                }
            }
        },
        "diskMouseUp": function(event) {
            this.setColor = false;
            this.trigger(className.EVENTS.COLOR_CHANGE, event, this.model.get("colorObj"), {
                "stop": true,
                "start": false
            });
        },
        "_angleOutOfBounds": function(angle) {
            angle %= 90; // 90: half pi
            return angle > 45 ? 90 - angle < 1 : angle < 1; // 45: quarter pi
        },

        /**
         * Gets color string
         * @method getColorString
         * @public
         * @param {Object} colorObj Object containing details of selected color
         * @returns {Object} Color details to be used
         */
        "getColorString": function(colorObj) {
            var RND = colorObj.RND;
            return {
                "rgba": 'rgba(' + RND.rgb.r + ',' + RND.rgb.g + ',' + RND.rgb.b + ',' + colorObj.alpha + ')',
                "hsva": 'hsva(' + RND.hsv.h + ',' + RND.hsv.s + ',' + RND.hsv.v + ',' + colorObj.alpha + ')',
                "hex": '#' + colorObj.HEX,
                "rgb": colorObj.rgb,
                "alpha": colorObj.alpha,
                "luminance": RND.hsv.v
            };
        },
        /**
         * Renders close button
         * @method renderCloseButton
         * @public
         */
        "renderCloseButton": function() {
            var $closeBtn = this.$('.close-button');
            $closeBtn.on('mouseenter', function() {
                    $(this).addClass('hover');
                })
                .on('mousedown', function() {
                    $(this).removeClass('hover').addClass('down');
                })
                .on('mouseup', function() {
                    $(this).removeClass('down').addClass('hover');
                })
                .on('mouseleave', function() {
                    $(this).removeClass('hover');
                });
            $(document).off('mouseup.removedownstate')
                .on('mouseup.removedownstate', function() {
                    $closeBtn.removeClass('down');
                });
        },
        /**
         * generates close tooltip
         * @method generateCloseTooltip
         * @public
         */
        "generateCloseTooltip": function() {
            var closeButtonAccObj,
                closeTooltipProps = {
                    "path": this.filePath,
                    "manager": this.manager,
                    "_player": this.player,
                    "idPrefix": this.idPrefix,
                    "id": this.idPrefix + 'close-tooltip',
                    "elementEl": this.idPrefix + 'close-button',
                    "text": this.getMessage('color-picker-messages', 0),
                    "arrowType": MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE
                };
            this.closeTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(closeTooltipProps);
            closeButtonAccObj = {
                "elementId": "close-button",
                "tabIndex": 4895,
                "acc": this.getMessage('color-picker-messages', 0),
                "role": "button"
            };
            this.createAccDiv(closeButtonAccObj);
        },

        /**
         * Shows the close button's tooltip
         * @method _onCloseTouchStart
         * @param {Object} event Event object
         * @private
         **/
        "_onCloseTouchStart": function _onCloseTouchStart() {
            this.closeTooltipView.showTooltip();
        },

        /**
         * Hides the close button's tooltip
         * @method _onCloseTouchEnd
         * @param {Object} event Event object
         * @private
         **/
        "_onCloseTouchEnd": function _onCloseTouchEnd() {
            this.closeTooltipView.hideTooltip();
        },

        /**
         * Destroys variables and clear memory
         * @method destroy
         * @public
         */
        "destroy": function() {

            this.paperScope = null;
            this.currentTool = null;
            this.idPrefix = null;
            this.colorDisk = null;
            this.focusRing = null;
            this.focusPoint = null;
            this.closeTooltipView = null;
            this.colorInstance = null;
            this.manager = null;
            this.eventManager = null;
            this.filePath = null;
            this.model = null;
            this.luminanceSliderView.remove();
            this.alphaSliderView.remove();
        },

        /**
         * On container click
         * @method _onContainerClick
         * @private
         * @param {[[Type]]} event [[Description]]
         */
        "_onContainerClick": function(event) {
            event.stopPropagation();
        },


        /*------ canvas accessibility ----*/
        /**
         * Loads the canvas
         *
         * @method _loadCanvasForAcc
         * @private
         */
        "_loadCanvasForAcc": function() {
            this._initAccessibility();
            this._bindAccessibilityListeners();
        },

        /**
         * Initializes accessibility
         *
         * @method _initAccessibility
         * @private
         */
        "_initAccessibility": function _initAccessibility() {
            if (this.canvasAcc) {
                this.canvasAcc.unbind();
                this.canvasAcc.model.destroy();
            }
            var canvasAccOption = {
                "canvasHolderID": this.idPrefix + "color-picker-acc-disk-container",
                "paperItems": [],
                "paperScope": this.paperScope,
                "accManager": this.manager
            };

            this.canvasAcc = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.initializeCanvasAcc(canvasAccOption);
            this.canvasAcc.updatePaperItems([this.focusRing]);
        },

        /**
         * Binds Keys on Canvas
         *
         * @method _bindAccessibilityListeners
         * @private
         */
        "_bindAccessibilityListeners": function _bindAccessibilityListeners() {
            var CanvasAcc = MathUtilities.Components.CanvasAcc.Models.CanvasAcc,
                KEY_EVENTS = CanvasAcc.CANVAS_KEY_EVENTS,
                KEY_UP_EVENTS = CanvasAcc.CANVAS_KEYUP_EVENTS,
                CANVAS_EVENTS = CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = this.$('#' + this.idPrefix + 'color-picker-acc-disk-container');

            $canvasHolder.off(KEY_EVENTS.ARROW)
                .on(KEY_EVENTS.ARROW, _.bind(function(event, data) {
                    this._arrowKeyPressed(event, data);
                    $canvasHolder.off(KEY_UP_EVENTS.ARROW_KEYUP).on(KEY_UP_EVENTS.ARROW_KEYUP, _.bind(function(event, data) {
                        data.item = arguments[3];
                        this._handleOnArrowKeyUp(event, data);
                        $canvasHolder.off(KEY_UP_EVENTS.ARROW_KEYUP);
                    }, this));
                }, this))
                .off(KEY_EVENTS.TAB)
                .on(KEY_EVENTS.TAB, _.bind(function(event) {
                    this.focusRing.strokeWidth = 2;
                    this.paperScope.view.draw();
                    this.manager.changeAccMessage(event.currentTarget.id, 3);
                    this._setFocusOnCanvas();
                }, this))
                .off(CANVAS_EVENTS.FOCUS_OUT)
                .on(CANVAS_EVENTS.FOCUS_OUT, _.bind(function(event) {
                    // Handle focus out
                    this.focusRing.strokeWidth = 1;
                    this.paperScope.view.draw();
                    this.manager.changeAccMessage(event.currentTarget.id, 0);
                }, this));

        },
        /**
         * Moves endpoint on arrow key movement
         *
         * @method _arrowKeyPressed
         * @param {Object} event Event object
         * @param {Object} data Data object
         * @private
         */
        "_arrowKeyPressed": function _arrowKeyPressed(event, data) {
            var pixel = 1;
            event.point = new this.paperScope.Point(
                data.point.x + data.directionX * pixel,
                data.point.y + data.directionY * pixel
            );
            event.event = {
                "which": data.event.which
            };
            event.target = data.item;
            event.isAccessible = true;
            this.manager.setAccMessage('color-picker-acc-disk-container', '');
            data.item.trigger('mousedrag', event);
            this.paperScope.view.draw();
        },

        /**
         * Handles Arrow Key Up
         *
         * @method _handleOnArrowKeyUp
         * @param {Object} event Event object
         * @param {Object} data Data object
         * @private
         */
        "_handleOnArrowKeyUp": function(event, data) {
            if (this.boundaryCheck) {
                this.manager.changeAccMessage(event.currentTarget.id, 1);
                data.item.trigger('mouseup', event);
                _.delay(_.bind(this._setFocusOnCanvas, this), 10); //To refocus canvas
            }
        },

        /**
         * Sets Focus on Canvas
         *
         * @method _setFocusOnCanvas
         * @public
         */
        "_setFocusOnCanvas": function() {
            this.canvasAcc.setSelfFocus();
        },

        "handleColorPickerAcc": function() {
            var idPrefix = this.idPrefix;
            this.$('#' + idPrefix + 'luminance-slider-holder').find('.sliderH').attr("id", idPrefix + "luminance-slider-handle");
            this.$('#' + idPrefix + 'opacity-bar-holder').find('.sliderH').attr("id", idPrefix + "opacity-slider-handle");
        },

        "_setFocusToCloseBtn": function _setFocusToCloseBtn(event) {
            if (event.keyCode === 9 && event.shiftKey) { // 9 key code for tab
                event.preventDefault();
                this.setFocus('close-button');
            }
        },

        "_setFocusToColorPicker": function _setFocusToColorPicker(event) {
            if (event.keyCode === 9 && !event.shiftKey) { // 9 key code for tab
                event.preventDefault();
                this.setFocus('color-picker-container');
            }
        },

        "_setFocusToHeaderSubtitle": function _setFocusToHeaderSubtitle(event) {
            if ($(event.target).parent().hasClass('color-picker-container') && event.keyCode === 9 && event.shiftKey) {
                event.preventDefault();
                this.setFocus('header-subtitle');
            }
        },

        "_setFocusToHeaderBtn": function _setFocusToHeaderBtn(event) {
            if (event.keyCode === 9 && !event.shiftKey) {
                event.preventDefault();
                var $btnSave = this.player.$('.custom-btn-type-save');
                if ($btnSave.length === 0) {
                    this.setFocus('help-btn');
                } else {
                    this.setFocus('save-btn');
                }
            }
        },

        "unbindColorPickerAcc": function unbindColorPickerAcc() {
            this.player.$('.custom-btn-type-help,.custom-btn-type-save,.header-subtitle,.color-picker-container,.close-button')
                .off('.colorPicker');
        },

        "getCurrentColor": function() {
            return this.model.get('colorObj');
        },

        "createCustomTooltip": function() {
            if (!this.manager) {
                return;
            }
            var idPrefix = this.idPrefix;
            this.$('#' + idPrefix + 'luminance-slider-holder').find('.sliderH').attr("id", idPrefix + "luminance-slider-handle");
            this.$('#' + idPrefix + 'opacity-bar-holder').find('.sliderH').attr("id", idPrefix + "opacity-slider-handle");
            var elemId = null,
                options = null,
                tooltipView = null,
                manager = this.manager,
                $el = this.$el,
                tooltipElems = [{
                    "elem": idPrefix + "luminance-slider-handle",
                    "selector": "#" + idPrefix + "luminance-slider-handle",
                    "position": "bottom"
                }, {
                    "elem": idPrefix + "opacity-slider-handle",
                    "selector": '#' + idPrefix + "opacity-slider-handle",
                    "position": "bottom"
                }],
                startEvents = "mouseenter",
                endEvents = "mouseleave mousedown";


            if ("ontouchstart" in window) {
                if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                    startEvents = "touchstart";
                    endEvents = "touchend";
                } else {
                    //touch and type device
                    startEvents += " touchstart";
                    endEvents += " touchend";
                }
            }
            for (elemId in tooltipElems) {
                options = {
                    "id": tooltipElems[elemId].elem + "-tooltip",
                    "text": manager.getMessage(tooltipElems[elemId].elem + "-tooltip", 0),
                    "position": tooltipElems[elemId].position,
                    "tool-holder": $el
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);

                this.$(tooltipElems[elemId].selector).on(startEvents, _.bind(tooltipView.showTooltip, tooltipView))
                    .on(endEvents, _.bind(tooltipView.hideTooltip, tooltipView));
            }
        }

    }, {

        /**
         * Creates color picker
         * @method createColorPicker
         * @public
         * @param {[[Type]]} options [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        "createColorPicker": function(options) {

            if (options) {
                var colorPickerModel = new MathUtilities.Components.ColorPicker.Models.ColorPicker(options),
                    colorPickerView = new MathUtilities.Components.ColorPicker.Views.ColorPicker({
                        "model": colorPickerModel,
                        "el": $(options.holderDiv)
                    });
                return colorPickerView;
            }
        },

        /**
         * Radius of color disk
         * @attribute DISK_RADIUS
         * @type Number
         * @default 105
         */
        "DISK_RADIUS": 105,
        /**
         * Radius of focus ring
         * @attribute FOCUS_RING_RADIUS
         * @type Number
         * @default 2
         */
        "FOCUS_RING_RADIUS": 2,
        /**
         * Stroke color of color disk
         * @attribute DISK_STROKE_COLOR
         * @type String
         * @default '#edecec'
         */
        "DISK_STROKE_COLOR": '#edecec',
        /**
         * Center points of Color Disk
         * @attribute CENTER_POINTS
         * @type Object
         * @default [105 105],
         */
        "CENTER_POINTS": [110, 110],
        /**
         * Distance of x or y coordinate of disk center from origin
         * @attribute CENTER_DISTANCE
         * @type Number
         * @default 110
         */
        "CENTER_DISTANCE": 110,

        /**
         * Custom Events
         * @attribute EVENTS
         * @type Object
         * @default {
         */
        "EVENTS": {
            "COLOR_CHANGE": 'color-change',
            "ALPHA_CHANGE": 'alpha-change',
            "ENABLE_HELP": 'enable-help',
            "CLOSE_COLOR_PICKER": 'close-color-picker'
        },
        /**
         * Luminance slider data
         * @attribute LUMINANCE_SLIDER
         * @type Object
         * @default {
         */
        "LUMINANCE_SLIDER": {
            "min": 0,
            "max": 100,
            "step": 5
        },
        /**
         * Alpha slider data
         * @attribute ALPHA_SLIDER
         * @type Object
         * @default {
         */
        "ALPHA_SLIDER": {
            "min": 0,
            "max": 1,
            "step": 0.01
        }
    });
    className = MathUtilities.Components.ColorPicker.Views.ColorPicker;
})();
