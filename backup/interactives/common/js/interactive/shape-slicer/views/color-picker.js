(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Views.ColorPicker) {
        return;
    }
    var className = null,
        modelClass = null,
        isMobile = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

    /*
     *
     *   D E S C R I P T I O N
     *
     * @class Overview
     * @namespace MathInteractives.Interactivities.ShapeSlicer.Views
     * @extends MathInteractives.Common.Player.Views.Base.extend
     * @constructor
     */
    MathInteractives.Common.Interactivities.ShapeSlicer.Views.ColorPicker = MathInteractives.Common.Player.Views.Base.extend({
        /**
         * Holds the current paper scope
         *
         * @property paperScope
         * @type Object
         * @default null
         */
        paperScope: null,

        /**
         * Tool of paper object
         * @attribute currentTool
         * @type Object
         * @default null
         */
        currentTool: null,

        /**
         * idPrefix of interactivity
         * @attribute idPrefix
         * @type Object
         * @default null
         */
        idPrefix: null,

        /**
         * Player object
         * @attribute player
         * @type Object
         * @default null
         */
        player: null,

        /**
         * Holds paper object of color disk
         * @attribute colorDisc
         * @type Object
         * @default null
         */
        colorDisc: null,

        /**
         * Holds paper object of ring used to show selected color
         * @attribute focusRing
         * @type Object
         * @default null
         */
        focusRing: null,

        /**
         * Position of selected color
         * @attribute focusPoint
         * @type Object
         * @default null
         */
        focusPoint: null,

        /**
         * View of close button tooltip
         * @attribute focusPoint
         * @type Object
         * @default null
         */
        closeTooltipView: null,
        /**
         * Holds view of luminance slider
         * @attribute luminanceSliderView
         * @type Object
         * @default null
         */
        luminanceSliderView: null,

        /**
         * Holds view of alpha(opacity) slider
         * @attribute alphaSliderView
         * @type Object
         * @default null
         */
        alphaSliderView: null,

        canvasAcc: null,

        boundaryCheck: true,

        /**
         * Initialises Color Picker
         * @method initialize
         */
        initialize: function () {
            this.idPrefix = this.model.get('idPrefix');
            this.player = this.model.get('player');
            this.manager = this.model.get('manager');
            this.eventManager = this.model.get('eventManager');
            this.filePath = this.model.get('filePath');
            this.colorInstance = new MathInteractives.Common.Interactivities.ShapeSlicer.Models.Colors();
            this.loadScreen('color-picker-messages-screen');
            this.player.off(MathInteractives.global.PlayerModel.BEFORE_TAB_SWITCH_EVENT).once(MathInteractives.global.PlayerModel.BEFORE_TAB_SWITCH_EVENT, this._removePopup, this);
            this.render();
        },

        /**
         * Renders
         * @method render
         * @public
         */
        render: function render() {
            this.generateColorPicker();
            this.setPaperScope();
            this._setInitialPositions();
            this.drawCircles();
            this.generateLuminanceSlider();
            this.renderLuminanceBar();
            this.generateAlphaSlider();
            this.renderAlphaBar();
            this._setBackGroundImages();
            this._bindEvents();
            this.renderCloseButton();
            this.loadScreen('color-picker-screen');
            this._loadCanvasForAcc();
            this.handleColorPickerAcc();
        },

        /**
         * generates color picker
         * @method generateColorPicker
         * @public
         */
        generateColorPicker: function () {
            var options = {
                idPrefix: this.idPrefix,
                type: 'color-picker'
            },
                colorPickerPosition = this.model.get('position') || null,
                $player = null;

            this.$el.append(MathInteractives.Common.Interactivities.ShapeSlicer.templates.colorPicker(options).trim());
            $player = this.player.$el;
            $player.append(this.el);
            //this.player.setModalPresent(true);
            if (colorPickerPosition !== null) {
                this.$('.color-picker-container').css({
                    'top': colorPickerPosition.top,
                    'left': colorPickerPosition.left
                });
            }
            this.generateCloseTooltip();
        },

        /**
         * Sets back ground images
         * @method _setBackGroundImages
         * @private
         */
        _setBackGroundImages: function () {
            this.backGroundImagePath = this.getImagePath('color-picker');
            this.$('.disk-holder').css({
                'background-image': 'url("' + this.backGroundImagePath + '")'
            });
            this.$('.box.vertical').css({
                'background-image': 'url("' + this.backGroundImagePath + '")'
            });
            this.$('.box.horizontal').css({
                'background-image': 'url("' + this.backGroundImagePath + '")'
            });
        },

        /**
         * Sets paper scope
         * @method setPaperScope
         * @public
         */
        setPaperScope: function () {
            var myPaper = this.paperScope = new paper.PaperScope();
            myPaper.setup(this.idPrefix + 'color-disk');
            this.currentTool = new myPaper.Tool();
            myPaper.activate();
        },

        /**
         * Draws circles
         * @method drawCircles
         * @public
         */
        drawCircles: function () {
            var position = className.CENTER_POINTS,
                radius = className.DISC_RADIUS,
                strokeColor = className.DISC_STROKE_COLOR,
                ringRadius = className.FOCUS_RING_RADIUS,
                ringPosition = this.focusPoint,
                ringStrokeColor = '#000';
            this.colorDisc = this._drawCircle(position, radius, strokeColor);
            this.focusRing = this._drawCircle(ringPosition, ringRadius, ringStrokeColor);

        },

        /**
         * Draw a circle.
         * @method _drawCircles
         * @private
         */
        _drawCircle: function (position, radius, strokeColor) {
            this.paperScope.activate();
            var circle = this.paperScope.Path.Circle({
                center: position,
                radius: radius,
                strokeColor: strokeColor,
                fillColor: '#000'
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
        renderLuminanceBar: function () {
        
            var luminanceBar = this.$('.luminance-slider').find('canvas')[0],
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
        generateLuminanceSlider: function () {
            var self = this,
                sliderModel = MathInteractives.Common.Components.Theme2.Models.Slider,
                sliderEvents = sliderModel.EVENTS,
                sliderView = MathInteractives.global.Theme2.Slider,
                luminanceSliderData = className.LUMINANCE_SLIDER,
                selectedValue = self.colorInstance.colors.RND.hsv.v;
            this.luminanceSliderView = sliderView.generateSlider({
                containerId: 'luminance-slider-holder',
                sliderId: 'luminance-slider',
                idPrefix: this.idPrefix,
                manager: this.manager,
                player: this.player,
                selectedValue: selectedValue,
                minValue: luminanceSliderData.min,
                maxValue: luminanceSliderData.max,
                numberOfDots: 0,
                colorType: sliderModel.COLOR_TYPE.CUSTOM,
                orientation: sliderModel.ORIENTATION.VERTICAL,
                showHandleTooltip: true,
                handleTooltipText: this.getMessage('color-picker-messages', 1),
                toolTipArrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.RIGHT_MIDDLE,
                screenId: 'luminance-slider-container-screen',
                tabIndex: 860
            });
            this.luminanceSliderView.on(sliderEvents.SLIDE, $.proxy(this.onSlideLuminanceSlider, this));
            this.luminanceSliderView.on(sliderEvents.VALUE_CHANGE, $.proxy(this.onSlideLuminanceSlider, this));
        },

        /**
         * On slide luminance slider
         * @method onSlideLuminanceSlider
         * @public
         * @param {Object} event Event object
         * @param {Object} ui [[Description]]
         */
        onSlideLuminanceSlider: function (event, ui) {
            var color = null,
                colorObj;
            color = this.colorInstance.setColor({
                v: ui.value != null ? ui.value : event      //Changed for Accessibility 
            }, 'hsv');
            colorObj = this.getColorString(color);
            this.renderAlphaBar(colorObj.hex);
            this.trigger(className.EVENTS.COLOR_CHANGE, event, colorObj);
        },

        /**
         * Renders alpha bar
         * @method renderAlphaBar
         * @public
         */
        renderAlphaBar: function (color) {
          
            var opacityBar = this.$('.opacity-slider').find('canvas')[0],
                ctx = opacityBar.getContext('2d'),
                gradient = ctx.createLinearGradient(200, 0, 0, 0);
            color = color || '#' + this.colorInstance.colors.HEX;

            gradient.addColorStop(0, color);
            gradient.addColorStop(1, '#FFFFFF');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 230, 11);
        },

        /**
         * generates alpha slider
         * @method generateAlphaSlider
         * @public
         */
        generateAlphaSlider: function () {
            var self = this,
                sliderModel = MathInteractives.Common.Components.Theme2.Models.Slider,
                sliderEvents = sliderModel.EVENTS,
                sliderView = MathInteractives.global.Theme2.Slider,
                alphaSliderData = className.ALPHA_SLIDER,
                selectedValue = self.colorInstance.colors.alpha;
            this.alphaSliderView = sliderView.generateSlider({
                containerId: 'opacity-bar-holder',
                sliderId: 'opacity-slider',
                idPrefix: this.idPrefix,
                manager: this.manager,
                player: this.player,
                selectedValue: selectedValue,
                minValue: alphaSliderData.min,
                maxValue: alphaSliderData.max,
                step: alphaSliderData.step,
                numberOfDots: 0,
                colorType: sliderModel.COLOR_TYPE.CUSTOM,
                orientation: sliderModel.ORIENTATION.HORIZONTAL,
                showHandleTooltip: true,
                handleTooltipText: this.getMessage('color-picker-messages', 2),
                screenId: 'opacity-slider-container-screen',
                tabIndex: 880
            });
            this.alphaSliderView.on(sliderEvents.SLIDE, $.proxy(this.onSlideAlphaSlider, this));
            this.alphaSliderView.on(sliderEvents.VALUE_CHANGE, $.proxy(this.onSlideAlphaSlider, this));
        },

        /**
         * On slide alpha slider
         * @method onSlideAlphaSlider
         * @public
         * @param {Object} event Event Object
         * @param {Object} ui [[Description]]
         */
        onSlideAlphaSlider: function (event, ui) {
            var color = null,
                colorObj;
            color = this.colorInstance.setColor({}, 'alpha', ui.value != null ? ui.value : event);  //Changed for Accessibility 
            colorObj = this.getColorString(color);
            this.trigger(className.EVENTS.ALPHA_CHANGE, event, colorObj);
        },

        /**
         * Sets initial positions
         * @method _setInitialPositions
         * @private
         */
        _setInitialPositions: function () {
            var color = this.model.getColor(),
                colorObj = null,
                hsv = null;
            colorObj = this.colorInstance.setColor(color);
            hsv = colorObj.RND.hsv;
            this.focusPoint = this._getRingPosition(hsv.h, hsv.s);
            this.$('.luminance-slider').css({
                'background-color': 'rgb(' + colorObj.hueRGB.r + ',' + colorObj.hueRGB.g + ',' + colorObj.hueRGB.b + ')'
            });
            this.$('.luminance-bar-white')[0].style.opacity = 1 - colorObj.hsv.s;
        },

        /**
         * Gets ring position
         * @method _getRingPosition
         * @private
         * @param {Number} angle Angle between center and ring position
         * @param {Number} distance Distance of ring from center
         * @returns {Array} Co-ordiantes of ring
         */
        _getRingPosition: function (angle, distance) {
            var x,
                y,
                center = className.CENTER_POINTS;
            x = center[0] + distance * Math.cos(angle * Math.PI / 180);
            y = center[1] - distance * Math.sin(angle * Math.PI / 180);
            return [x, y];
        },

        /**
         * Binds events
         * @method _bindEvents
         * @private
         */
        _bindEvents: function () {
            var self = this,
                colorDisc = this.colorDisc,
                focusRing = this.focusRing,
                $dicsCanvas = self.$('.color-disc'),
                $modal = this.$('.theme2-pop-up-modal-color-picker'),
                currentToool = this.currentTool;

            colorDisc.on('mousedown', function (event) {
                self.diskMouseMove(event);
            });

            colorDisc.on('mouseenter', function () {
                $dicsCanvas.removeClass('default-cursor').addClass('crosshair-cursor');
            });

            colorDisc.on('mouseleave', function () {
                $dicsCanvas.removeClass('crosshair-cursor').addClass('default-cursor');
            });

            colorDisc.on('mousedrag', function (event) {
                self.diskMouseMove(event);
            });

            focusRing.on('mousedrag', function (event) {
                self.diskMouseMove(event);
            });

            currentToool.on('mouseup', function (event) {
                if (event.point.isInside(self.colorDisc)) {
                    $dicsCanvas.removeClass('default-cursor').addClass('crosshair-cursor');
                }
            });

            currentToool.on('mousedown', function () {
                $dicsCanvas.removeClass('crosshair-cursor').addClass('default-cursor');
            });

            currentToool.on('mousedrag', function (event) {
                event.preventDefault();
            });

            this.$('.color-picker-container').on('mousedown', function (event) {
                self._onContainerClick(event);
            });
            if (isMobile) {
                $modal.on('click', function () {
                    self._onModalClick();
                });
            } else {
                $modal.on('mousedown', function (event) {
                    if (event.which === 1) {
                        self._onModalClick();
                    }
                });
            }
        },

        /**
         * disk mouse move
         * @method diskMouseMove
         * @public
         * @param {Object} event Event Object
         */
        diskMouseMove: function (event) {
            if (event.event.which === 1 || event.event.which === 0) {
                var r = className.DISC_RADIUS,
                    self = this,
                    centerDistance = className.CENTER_DISTANCE,
                    x,
                    y,
                    h,
                    s,
                    color,
                    colorObj = null;

                this.boundaryCheck = true;
                x = event.point.x - centerDistance,
                y = event.point.y - centerDistance,
                h = 360 - ((Math.atan2(y, x) * 180 / Math.PI) + (y < 0 ? 360 : 0));
                if (event.point.isInside(this.colorDisc)) {
                    s = Math.sqrt((x * x) + (y * y));
                } else {
                    if (this._angleOutOfBounds(h)) {
                        this.boundaryCheck = false;
                        this.changeAccMessage('color-picker-acc-disk-container', 2);
                        window.setTimeout($.proxy(self._setFocusOnCanvas, self), 10);
                    }
                    s = r;
                }
                color = this.colorInstance.setColor({
                    h: h,
                    s: s
                }, 'hsv');
                this.focusRing.position = this._getRingPosition(h, s);
                colorObj = this.getColorString(color);
                this.$('.luminance-slider').css({
                    'background-color': 'rgb(' + color.hueRGB.r + ',' + color.hueRGB.g + ',' + color.hueRGB.b + ')'
                });
                this.$('.luminance-bar-white')[0].style.opacity = 1 - color.hsv.s;

                this.renderAlphaBar(colorObj.hex);
                this.trigger(className.EVENTS.COLOR_CHANGE, event, colorObj);
            }
        },

        _angleOutOfBounds: function (angle) {
            angle = angle % 90;
            return angle > 45 ? 90 - angle < 1 : angle < 1;
        },

        /**
         * Gets color string
         * @method getColorString
         * @public
         * @param {Object} colorObj Object containing details of selected color
         * @returns {Object} Color details to be used
         */
        getColorString: function (colorObj) {
            var RND = colorObj.RND,
                color;
            color = {
                rgba: 'rgba(' + RND.rgb.r + ',' + RND.rgb.g + ',' + RND.rgb.b + ',' + colorObj.alpha + ')',
                hsva: 'hsva(' + RND.hsv.h + ',' + RND.hsv.s + ',' + RND.hsv.v + ',' + colorObj.alpha + ')',
                hex: '#' + colorObj.HEX,
                rgb: colorObj.rgb,
                alpha: colorObj.alpha,
                luminance: RND.hsv.v
            };
            return color;
        },
        /**
         * Renders close button
         * @method renderCloseButton
         * @public
         */
        renderCloseButton: function () {
            var $closeBtn = this.$('.close-button'),
                self = this;
            $closeBtn.addClass(this.getFontAwesomeClass('close'));

            $closeBtn.on('mouseenter', function () {
                $(this).addClass('hover');
            });
            $closeBtn.on('mousedown', function () {
                $(this).removeClass('hover').addClass('down');
            });
            $closeBtn.on('mouseup', function () {
                $(this).removeClass('down').addClass('hover');
            });
            $closeBtn.on('mouseleave', function () {
                $(this).removeClass('hover');
            });

            $closeBtn.on('click', function () {
                self._removePopup();
            });
            $(document).off('mouseup.removedownstate').on('mouseup.removedownstate', function () {
                self.$('.close-button').removeClass('down');
            });
        },
        /**
         * generates close tooltip
         * @method generateCloseTooltip
         * @public
         */
        generateCloseTooltip: function () {
            var closeButtonAccObj,
                closeTooltipProps = {
                    path: this.filePath,
                    manager: this.manager,
                    _player: this.player,
                    idPrefix: this.idPrefix,
                    id: this.idPrefix + 'close-tooltip',
                    elementEl: this.idPrefix + 'close-button',
                    text: this.getMessage('color-picker-messages', 0),
                    arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE
                };
            this.closeTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(closeTooltipProps);
            closeButtonAccObj = {
                'elementId': 'close-button',
                'tabIndex': 4895,
                'acc': this.getMessage('color-picker-messages', 0),
                'role': 'button'
            };
            this.createAccDiv(closeButtonAccObj);
        },

        /**
         * Shows the close button's tooltip
         * @method _onCloseTouchStart
         * @param {Object} event Event object
         * @private
         **/
        _onCloseTouchStart: function _onCloseTouchStart() {
            this.closeTooltipView.showTooltip();
        },

        /**
         * Hides the close button's tooltip
         * @method _onCloseTouchEnd
         * @param {Object} event Event object
         * @private
         **/
        _onCloseTouchEnd: function _onCloseTouchEnd() {
            this.closeTooltipView.hideTooltip();
        },

        /**
         * Destroys variables and clear memory
         * @method destroy
         * @public
         */
        destroy: function () {

            this.paperScope = null;
            this.currentTool = null;
            this.idPrefix = null;
            this.colorDisc = null;
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
         * Removes popup
         * @method _removePopup
         * @private
         */
        _removePopup: function _removePopup() {
            this.player.off(MathInteractives.global.PlayerModel.BEFORE_TAB_SWITCH_EVENT, this._removePopup);
            this.unbindColorPickerAcc();
            this.closeTooltipView.remove();
            this.luminanceSliderView.handleTooltipView.remove();
            this.alphaSliderView.handleTooltipView.remove();
            this.$('.theme2-tooltip tooltip-general-container').remove();
            this.closeTooltipView.unbind();
            this.trigger(className.EVENTS.ENABLE_HELP);
            this.trigger(className.EVENTS.CLOSE_COLOR_PICKER);
            //this.player.setModalPresent(false);
            this.destroy();
            this.unbind();
            this.remove();

        },
        /**
         * On modal click
         * @method _onModalClick
         * @private
         * @param {[[Type]]} event [[Description]]
         */
        _onModalClick: function () {
            this._removePopup();
        },
        /**
         * On container click
         * @method _onContainerClick
         * @private
         * @param {[[Type]]} event [[Description]]
         */
        _onContainerClick: function (event) {
            event.stopPropagation();
        },


        /*------ canvas accessibility ----*/
        /**
        * Loads the canvas
        *
        * @method _loadCanvasForAcc
        * @private
        */
        _loadCanvasForAcc: function _loadCanvasForAcc() {
            var self = this;
            this._initAccessibility();
            this._bindAccessibilityListeners();
        },

        /**
        * Initializes accessibility
        *
        * @method _initAccessibility
        * @private
        */
        _initAccessibility: function _initAccessibility() {
            if (this.canvasAcc) {
                this.canvasAcc.unbind();
                this.canvasAcc.model.destroy();
            }
            var canvasAccOption = {
                canvasHolderID: this.idPrefix + 'color-picker-acc-disk-container',
                paperItems: [],
                paperScope: this.paperScope,
                manager: this.manager,
                player: this.player
            };

            this.canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc(canvasAccOption);
            this.canvasAcc.updatePaperItems([this.focusRing]);
        },

        /**
        * Binds Keys on Canvas
        *
        * @method _bindAccessibilityListeners
        * @private
        */
        _bindAccessibilityListeners: function _bindAccessibilityListeners() {
            var self = this,
                keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                keyUpEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEYUP_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = this.$('#' + this.idPrefix + 'color-picker-acc-disk-container');

            $canvasHolder.off(keyEvents.ARROW).on(keyEvents.ARROW, function (event, data) {
                self._arrowKeyPressed(event, data);
                $canvasHolder.off(keyUpEvents.ARROW_KEYUP).on(keyUpEvents.ARROW_KEYUP, function (event, data) {
                    self._handleOnArrowKeyUp(event, data);
                    $canvasHolder.off(keyUpEvents.ARROW_KEYUP);
                });
            });

            $canvasHolder.off(keyEvents.TAB).on(keyEvents.TAB, function (event, data) {
                self.focusRing.strokeWidth = 2;
                self.paperScope.view.draw();
                self.changeAccMessage('color-picker-acc-disk-container', 3);
                self._setFocusOnCanvas();
            });

            // Handle focus out
            $canvasHolder.off(canvasEvents.FOCUS_OUT).on(canvasEvents.FOCUS_OUT, function (event, data) {
                self.focusRing.strokeWidth = 1;
                self.paperScope.view.draw();
                self.changeAccMessage('color-picker-acc-disk-container', 0);
            });

        },

        /**
        * Moves endpoint on arrow key movement
        *
        * @method _arrowKeyPressed
        * @param {Object} event Event object
        * @param {Object} data Data object
        * @private
        */
        _arrowKeyPressed: function _arrowKeyPressed(event, data) {

            var self = this,
                pixel = 1;
            event.point = new this.paperScope.Point(
                data.point.x + data.directionX * pixel,
                data.point.y + data.directionY * pixel
            );
            event.event = { which: data.event.which };
            event.target = data.item;
            event.isAccessible = true;
            this.setAccMessage('color-picker-acc-disk-container', '');
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
        _handleOnArrowKeyUp: function (event, data) {
            if (this.boundaryCheck) {
                var self = this;
                this.changeAccMessage('color-picker-acc-disk-container', 1);
                window.setTimeout($.proxy(self._setFocusOnCanvas, self), 10);
            }
        },

        /**
        * Sets Focus on Canvas
        *
        * @method _setFocusOnCanvas
        * @public
        */
        _setFocusOnCanvas: function () {
            this.canvasAcc.setSelfFocus();
        },

        handleColorPickerAcc: function handleColorPickerAcc() {
            var $btnSave = this.player.$('.custom-btn-type-save');
            if ($btnSave.length === 0) {
                this.player.$('.custom-btn-type-help').on('keydown.colorPicker', $.proxy(this._setFocusToCloseBtn, this));
            } else {
                $btnSave.on('keydown.colorPicker', $.proxy(this._setFocusToCloseBtn, this));
            }
            this.player.$('.header-subtitle').on('keydown.colorPicker', $.proxy(this._setFocusToColorPicker, this));
            this.$('.color-picker-container').on('keydown.colorPicker', $.proxy(this._setFocusToHeaderSubtitle, this));
            this.$('.close-button').on('keydown.colorPicker', $.proxy(this._setFocusToHeaderBtn, this));
        },

        _setFocusToCloseBtn: function _setFocusToCloseBtn(event) {
            if (event.keyCode === 9 && event.shiftKey) {
                event.preventDefault();
                this.setFocus('close-button');
            }
        },

        _setFocusToColorPicker: function _setFocusToColorPicker(event) {
            if (event.keyCode === 9 && !event.shiftKey) {
                event.preventDefault();
                this.setFocus('color-picker-container');
            }
        },

        _setFocusToHeaderSubtitle: function _setFocusToHeaderSubtitle(event) {
            if ($(event.target).parent().hasClass('color-picker-container') && event.keyCode === 9 && event.shiftKey) {
                event.preventDefault();
                this.setFocus('header-subtitle');
            }
        },

        _setFocusToHeaderBtn: function _setFocusToHeaderBtn(event) {
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

        unbindColorPickerAcc: function unbindColorPickerAcc() {
            this.player.$('.custom-btn-type-help,.custom-btn-type-save,.header-subtitle,.color-picker-container,.close-button').off('.colorPicker');
        }

    }, {

        /**
         * Creates color picker
         * @method createColorPicker
         * @public
         * @param {[[Type]]} options [[Description]]
         * @returns {[[Type]]} [[Description]]
         */
        createColorPicker: function (options) {

            if (options) {
                var colorPickerModel = new MathInteractives.Common.Interactivities.ShapeSlicer.Models.ColorPicker(options),
                    colorPickerView = new MathInteractives.Common.Interactivities.ShapeSlicer.Views.ColorPicker({
                        model: colorPickerModel
                    });
                return colorPickerView;
            }
        },

        /**
         * Radius of color disc
         * @attribute DISC_RADIUS
         * @type Number
         * @default 105
         */
        DISC_RADIUS: 105,
        /**
         * Radius of focus ring
         * @attribute FOCUS_RING_RADIUS
         * @type Number
         * @default 2
         */
        FOCUS_RING_RADIUS: 2,
        /**
         * Stroke color of color disk
         * @attribute DISC_STROKE_COLOR
         * @type String
         * @default '#edecec'
         */
        DISC_STROKE_COLOR: '#edecec',
        /**
         * Center points of Color Disc
         * @attribute CENTER_POINTS
         * @type Object
         * @default [105 105],
         */
        CENTER_POINTS: [110, 110],
        /**
         * Distance of x or y cordinate of disk center from origin
         * @attribute CENTER_DISTANCE
         * @type Number
         * @default 110
         */
        CENTER_DISTANCE: 110,

        /**
         * Custom Events
         * @attribute EVENTS
         * @type Object
         * @default {
         */
        EVENTS: {
            COLOR_CHANGE: 'color-change',
            ALPHA_CHANGE: 'alpha-change',
            ENABLE_HELP: 'enable-help',
            CLOSE_COLOR_PICKER: 'close-color-picker'
        },
        /**
         * Luminance slider data
         * @attribute LUMINANCE_SLIDER
         * @type Object
         * @default {
         */
        LUMINANCE_SLIDER: {
            min: 0,
            max: 100,
            step: 1
        },
        /**
         * Alpha slider data
         * @attribute ALPHA_SLIDER
         * @type Object
         * @default {
         */
        ALPHA_SLIDER: {
            min: 0,
            max: 1,
            step: 0.01
        }
    });
    className = MathInteractives.Common.Interactivities.ShapeSlicer.Views.ColorPicker;
    modelClass = MathInteractives.Common.Interactivities.ShapeSlicer.Models.ColorPicker;
})();
