
(function () {
    'use strict';

    /**
    * View for rendering Slider
    *
    * @class Slider
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.Slider = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * jQuery object of slider 
        * @property _$slider
        * @type Object
        * @defaults null
        */
        _$slider: null,

        /**
        * jQuery object of slider middle portion
        * @property _$sliderMid
        * @type Object
        * @defaults null
        */
        _$sliderMid: null,

        /**
        * jQuery object of slider left section
        * @property _$sliderLeft
        * @type Object
        * @defaults null
        */
        _$sliderLeft: null,

        /**
        * jQuery object of slider right section
        * @property _$sliderRight
        * @type Object
        * @defaults null
        */
        _$sliderRight: null,

        /**
        * jQuery object of slider handle
        * @property _$sliderHandle
        * @type Object
        * @defaults null
        */
        _$sliderHandle: null,

        /**
        * Whether or not the slider is disabled
        * @property _isDisabled
        * @type Boolean
        * @defaults false
        */
        _isDisabled: false,

        /**
        * Slider handle type.
        * @property _sliderHandleType
        * @type Number
        * @defaults 1
        */
        _sliderHandleType: null,

        /**
        * Calls render
        * @method initialize
        **/
        initialize: function initialize() {
            this.filePath = this.model.get('filePath');
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this._sliderHandleType = this.model.get('sliderHandleType');
            this.render();
            this._attachEvents();
            this._$sliderMid = this.$('.slider-mid');
            this._$sliderLeft = this.$('.slider-left');
            this._$sliderRight = this.$('.slider-right');
            this._$sliderHandle = this.$('.slider-handle');
        },

        /**
        * Renders the slider component
        * @method render
        **/
        render: function render() {
            var model = this.model,
                sliderId = this.idPrefix + model.get('sliderId'),
                stepValue = model.get('step'),
                points = model.get('points'),
                intervalGap = model.get('intervalGap') === null ? 1 : model.get('intervalGap'),
                minValue = model.get('minValue');

            // Makes the handle movement smooth
            if (model.get('smoothSliding')) {
                stepValue = stepValue / MathInteractives.Common.Components.Models.Slider.SLIDER_INTERVAL_DIVIDER;
            }
            // Sets minimum value as the default value in the model
            if (points) {
                this.model.updateSelectedValue(points[0]);
            }
            else {
                this.model.updateSelectedValue(minValue);
            }

            // Create slider
            this._$slider = this.$('#' + sliderId).CustomSlider({
                min: minValue,
                max: model.get('maxValue'),
                step: stepValue,
                value: model.get('selectedValue'),
                animate: model.get('animate')
            }).addClass('slider-component').css({ 'width': model.get('width') + 'px', 'height': model.get('height') });

            this._$slider = $('#' + sliderId);
            if (this.model.get('appendLabel')) {
                this._appendLabels();
            }
            if (this.model.get('showIntervals')) {
                this._$slider.each(function () {

                    //
                    // Add labels to slider whose values 
                    // are specified by min, max and whose
                    //

                    // Get the options for this slider
                    var customSlider = $(this).data().CustomSlider || $(this).data().uiCustomSlider;
                    var opt = customSlider.options;
                    // Get the number of possible values
                    var vals = opt.max - opt.min;

                    // Space out values
                    for (var i = opt.min; i <= opt.max - 1; i = i + intervalGap) {
                        if (opt.min < 0) {
                            var el = $('<label class="slider-labels typography-label">' + (i) + '</label >').css('left', (((i + Math.abs(opt.min)) / vals) * 100) + '%');
                        }
                        else if (opt.min > 0) {

                            var el = $('<label class="slider-labels typography-label">' + (i) + '</label >').css('left', ((i - opt.min) / vals * 100) + '%');
                        }
                        else {
                            var el = $('<label class="slider-labels typography-label">' + (i) + '</label >').css('left', ((i / vals) * 100) + '%');
                        }
                        $(this).siblings().append(el);
                    }

                })
            }
            // Set id of handle
            this.$('.ui-slider-handle').attr({
                'id': sliderId + '-handle'
            }).addClass('slider-handle');


            this._addImages();


            // Create Acc div for slider
            this.createAccDiv({
                'elementId': model.get('sliderId') + '-handle',
                'tabIndex': model.get('tabIndex'),
                'acc': ''
            });


            var $tempFocusDiv = $('<div>', {
                id: this.idPrefix + 'temp-focus-div',
                style: 'position: absolute; height: 1px; width: 1px; top: 1px; left: 1px;'
            });

            this.$el.append($tempFocusDiv);
            this.loadScreen('temp-focus-div-screen');
            this.setTabIndex('temp-focus-div', parseInt(this.model.get('tabIndex'), 10) + 1);
            this.enableTab('temp-focus-div', false);


            // Enable touch feature
            //$.fn.EnableTouch(this.$('.ui-slider-handle'));
        },

        /**
        * Adds background images to the slider
        * @method _addImages
        **/
        _addImages: function () {
            var imageDiv = '<div class="slider-left"></div> <div class="slider-mid"></div>'
                            + '<div class="slider-right"></div>',
                sliderWidth = this.model.get('width'),
                SliderModel = MathInteractives.Common.Components.Models.Slider,
                middlePortionWidth = sliderWidth - (SliderModel.LEFT_IMAGE_WIDTH + SliderModel.RIGHT_IMAGE_WIDTH);

            this._$slider.append(imageDiv);

            if (this.model.get('isBackgroundImage') === true) {
                this.$('.slider-mid').css({
                    'background-image': 'url("' + this.filePath.getImagePath('player-m') + '")'
                });
                this.$('.slider-left, .slider-right').css({
                    'background-image': 'url("' + this.filePath.getImagePath('player-lr') + '")'
                });
            }

            this.$('.slider-mid').css({
                'width': middlePortionWidth + 'px'
            });
            this.setSliderHandleImage();
        },

        /**
        * Changes the styling of slider handle
        * @method setSliderHandleImage
        **/
        setSliderHandleImage: function () {
            var $sliderHandle = this.$('.slider-handle');

            $sliderHandle.css({
                'background-image': 'url("' + this.filePath.getImagePath('player-lr') + '")'
            });

            switch (this._sliderHandleType) {
                case 1:
                    $sliderHandle.addClass('slider-handle-pink');
                    break

                case 2:
                    $sliderHandle.addClass('slider-handle-green');
                    break
            }
        },

        /**
        * Appends labels of minimum and maximum values 
        * @method _appendLabels
        **/
        _appendLabels: function () {
            var model = this.model,
                minValue = model.get('minValue'),
                maxValue = model.get('maxValue'),
            //$sliderDiv = this.$el.find('.demo-functions-slider-div'),
                sliderWidth = this.model.get('width'),
            //$maxLabel = null,
                labelContainer = '<div class="slider-labels-cont"></div>';
            //                                    + '<div class="slider-labels typography-label slider-label-min">'
            //                                    + minValue + '</div>'
            //                                    + '<div class="slider-labels typography-label slider-label-max">'
            //                                    + maxValue + '</div></div>';

            // Append labels container
            this.$el.append(labelContainer);
            var $sliderLabelCont = this.$('.slider-labels-cont');
            $sliderLabelCont.css('width', sliderWidth + 'px');
            if (!this.model.get('showIntervals')) {
                $sliderLabelCont.append($('<label class="slider-labels typography-label">' + minValue + '</label >').css('left', '0%'));
            }
            $sliderLabelCont.append($('<label class="slider-labels typography-label ">' + maxValue + '</label >').css('left', '100%'));
        },

        /**
        * Attaches events to elements in $el
        * @type Object
        **/
        events: {
            'click .slider-labels': '_labelClicked',
            'mouseover .ui-slider': '_sliderMouseOver',
            'mouseout .ui-slider': '_sliderMouseOut'
        },


        _sliderMouseOver: function () {
            this.$('.ui-slider').addClass('slider-mouse-over-out');

        },

        _sliderMouseOut: function _sliderMouseOut() {
            this.$('.ui-slider').removeClass('slider-mouse-over-out');

        },

        /**
        * Attaches slide related events
        * @method _attachEvents
        **/
        _attachEvents: function () {
            var self = this,
                model = this.model,
                $slider = this._$slider,
                $sliderHandle = null,
                utilsClass = MathInteractives.Common.Utilities.Models.Utils;

            // Functions to set rounded-off values in the model on sliding, and when sliding stops
            $slider.on({
                'slidestop': $.proxy(this._snapToNearestPoint, this),
                'slide': $.proxy(this._updateOnSlide, this)
            });

            if (model.get('onStart')) {
                $slider.on("slidestart", model.get('onStart'));
            }
            $sliderHandle = $('#' + this.idPrefix + model.get('sliderId') + '-handle');


            $sliderHandle.off('click.slider').on({
                'click.slider': $.proxy(this._sliderHandleClicked, this)
            });

            //unbinds mouseenter and mouseleave of slider only for touch devices
            //if ('ontouchstart' in window) {
            //    $sliderHandle.off('mouseenter mouseleave')
            //}
            $sliderHandle.on({
                'mouseenter': $.proxy(this._mouseEnter, this),
                'mouseleave': $.proxy(this._mouseLeave, this)
            });

            //unbinds the default key events of slider and adds new custom events
            $sliderHandle.off('keydown keyup');
            if (this.isAccessible() || this.model.get('isAllowKeyboardNavigation')) {
                $sliderHandle.off('keydown keyup').off('keydown.slider keyup.slider').on({
                    'keydown.slider': $.proxy(this._moveUsingKeyboard, this),
                    'keyup.slider': $.proxy(this._keyUpOnHandle, this)
                })
            }

            utilsClass.EnableTouch($sliderHandle, { specificEvents: utilsClass.SpecificEvents.DRAGGABLE });

        },

        /**
        * Shows hover state of handle and pointer cursor
        * @method _mouseEnter
        **/
        _mouseEnter: function () {
            var $handle = this._$sliderHandle,
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            $handle.addClass('slider-handle-hover ui-state-hover');

            // To prevent abrupt snapping of handle on touch devices, caused by setting pointer cursor.
            if (!BrowserCheck.isMobile && !this._isDisabled) {
                $handle.css('cursor', 'pointer');
            }
            else {
                if (!BrowserCheck.isMobile) {
                    $handle.css('cursor', 'default');
                }
            }
        },

        /**
        * Removes hover state of handle
        * @method _mouseLeave
        **/
        _mouseLeave: function () {
            this.$('.ui-slider-handle').removeClass('slider-handle-hover ui-state-hover');
        },

        /**
        * Snaps the handle to the nearest point on stopping sliding
        * @method _snapToNearestPoint
        * @param {Object} [event] Slide event
        * @param {Object} [ui] jQuery UI object
        **/
        _snapToNearestPoint: function (event, ui) {
            // Allow only when the user slides using mouse
            if (this._isKeyBoardEvent(event)) {
                return;
            }

            var points = this.model.get('points'),
                sliderValue = ui.value,
                nearestValue = null,
                slideStopCallback = this.model.get('onStop'),
                modifiedUiObj = null;

            if (points && points.length > 0) {
                nearestValue = this._getNearestPointFromArray(sliderValue);
            }
            else {
                nearestValue = this._getNearestPoint(sliderValue);
            }

            this._$slider.CustomSlider('value', nearestValue);
            this.model.updateSelectedValue(nearestValue);

            modifiedUiObj = { handle: ui.handle, value: nearestValue, points: ui.points };

            if (slideStopCallback) {
                slideStopCallback(event, modifiedUiObj);
            }

            this._fireChangeEvent(event, modifiedUiObj);
        },

        /**
        * Stores rounded-off values in the model, while sliding is in progress
        * @method _updateOnSlide
        * @param {Object} [event] Slide event
        * @param {Object} [ui] jQuery UI object
        **/
        _updateOnSlide: function (event, ui) {
            // Don't allow the execution while navigating with keyboard. 
            // Causes issues while sliding using Page up and page down
            if (this._isKeyBoardEvent(event)) {
                return;
            }

            var nearestValue = this._getNearestPoint(ui.value),
                slideCallback = this.model.get('onSlide');

            this.model.updateSelectedValue(nearestValue);

            if (slideCallback) {
                slideCallback(event, { handle: ui.handle, value: nearestValue });
            }
        },

        /**
        * Provides for appropriate navigation along the slider using 
        * arrow keys, Page up, Page down, Home, End keys.
        * @method _moveUsingKeyboard
        * @param {Object} [event] Keyboard event data
        **/
        _moveUsingKeyboard: function (event) {
            var model = this.model,
                selectedvalue = model.get('selectedValue'),
                step = model.get('step'),
                minValue = model.get('minValue'),
                maxValue = model.get('maxValue'),
                accId = this._getAccId(),
                points = model.get('points'),
                bSliderMoved = false,
                sliderAccMsg = '';

            this.setFocus(accId);

            // Prevent slider movement if disabled
            if (this.isSliderDisabled()) {
                return;
            }

            switch (event.keyCode) {
                // Increment value                                                                                                                                                                                                                    
                case 38: // Up arrow
                case 39: // Right arrow  
                case 33: // Page up
                    bSliderMoved = true;
                    if (points && points.length > 0) {
                        var nextPoint = this._getNextPoint();
                        this.setSelectedValue(nextPoint);
                    }
                    else {
                        if (selectedvalue < maxValue) {
                            this.setSelectedValue(selectedvalue + step);
                        }
                    }
                    break;

                // Decrement value                                                                                                                                                                                                                   
                case 40: // Down arrow
                case 37: // Left arrow  
                case 34: // Page down                   
                    bSliderMoved = true;
                    if (points && points.length > 0) {
                        var nextPoint = this._getPreviousPoint();
                        this.setSelectedValue(nextPoint);
                    }
                    else {
                        if (selectedvalue > minValue) {
                            this.setSelectedValue(selectedvalue - step);
                        }
                    }
                    break;

                // Snap to minimum value                                                                                                                                                                                                                  
                case 36: // Home key
                    bSliderMoved = true;
                    if (points && points.length > 0) {
                        this.setSelectedValue(points[0]);
                    }
                    else {
                        this.setSelectedValue(minValue);
                    }
                    break;

                // Snap to maximum value                                                                                                                                                                                                                         
                case 35: // End key
                    bSliderMoved = true;
                    if (points && points.length > 0) {
                        this.setSelectedValue(points[points.length - 1]);
                    }
                    else {
                        this.setSelectedValue(maxValue);
                    }
                    break;
            }

            if (bSliderMoved) {
                this._setSelfFocus();
                this.setFocus(accId);
                event.preventDefault();
                this._keyDownOnHandle();
            }
        },

        /**
        * Triggers handle clicked event
        * @method _handleClicked
        * @private
        **/
        _sliderHandleClicked: function () {
            this.trigger('onSlideHandleClick');
        },

        /**
        * Informs about key up on handle
        * @method _keyUpOnHandle
        **/
        _keyUpOnHandle: function () {
            this.trigger('onSlideHandleKeyUp');
        },

        /**
        * Informs about key down on handle
        * @method _keyDownOnHandle
        **/
        _keyDownOnHandle: function () {
            this.trigger('onSlideHandleKeyDown');
        },

        /**
        * Snaps the handle to max/ min value on click of label
        * @method _labelClicked
        * @param {Object} [event] 
        **/
        _labelClicked: function (event) {
            if (this._isDisabled) {
                return;
            }
            var $target = $(event.target);
            //model = this.model;

            //            if ($target.hasClass('slider-label-min')) {
            //                this.setSelectedValue(model.get('minValue'));
            //            }
            //            else if ($target.hasClass('slider-label-max')) {
            //                this.setSelectedValue(model.get('maxValue'));
            //            }
            this.setSelectedValue(parseInt($target.text()));
            var slideStopCallback = this.model.get('onStop');
            if (slideStopCallback) {
                slideStopCallback(event, null);
            }

        },

        /**
        * Triggers the 'onChange' event
        * As the selected value is rounded-off and re-set, 'slidechange' is triggered twice.
        * To handle the same, this function has been created.
        * @method _fireChangeEvent
        **/
        _fireChangeEvent: function (event, ui) {
            var changeEvent = this.model.get('onChange');

            if (changeEvent) {
                changeEvent(event, ui);
            }
        },

        /**
        * Sets the given value as the selected value of the slider and update the model
        * @method setSelectedValue
        * @param {Number} [newValue] Value to be set
        **/
        setSelectedValue: function (newValue) {
            this._$slider.CustomSlider('value', newValue);
            this.model.updateSelectedValue(newValue);
            this._fireChangeEvent(null, { value: newValue });
        },

        /**
        * Returns the currently selected value of the slider
        * @method getSelectedValue
        * @return {Number} 
        **/
        getSelectedValue: function () {
            return this.model.get('selectedValue');
        },

        /**
        * Disables the slider and handles CSS
        * @method disableSlider
        **/
        disableSlider: function () {
            this._isDisabled = true;

            this._$slider.CustomSlider('disable');

            this._$sliderMid.addClass('slider-mid-disabled');
            this._$sliderLeft.addClass('slider-left-disabled');
            this._$sliderRight.addClass('slider-right-disabled');
            this._$sliderHandle.addClass('slider-handle-disabled');

            this.$('.slider-labels').addClass('slider-labels-disabled');
            this.enableTab(this._getAccId(), false);
        },

        /**
        * Enables the slider
        * @method enableSlider
        **/
        enableSlider: function () {
            var model = this.model;
            this._isDisabled = false;

            this._$slider.CustomSlider('enable');

            this._$sliderMid.removeClass('slider-mid-disabled');
            this._$sliderLeft.removeClass('slider-left-disabled');
            this._$sliderRight.removeClass('slider-right-disabled');
            this._$sliderHandle.removeClass('slider-handle-disabled');

            this.$('.slider-labels').removeClass('slider-labels-disabled');
            this.enableTab(this._getAccId(), true);
        },

        /**
        * Returns whether slider is disabled or not
        * @method isSliderDisabled
        * @return {Boolean}
        **/
        isSliderDisabled: function () {
            return this._$slider.CustomSlider("option", 'disabled');
        },

        /**
        * Returns whether slider is disabled or not
        * @method isSliderDisabled
        * @return {Boolean}
        **/
        changeAccMessage: function (text) {
            var accId = this._getAccId();
            this.setAccMessage(accId, text);
            this._setSelfFocus();
        },

        /* Set focus to same element through to temp div so text can be read by screen reader
        * @method _setSelfFocus
        * @private
        */
        _setSelfFocus: function () {

            var accId = this._getAccId();
            this.enableTab('temp-focus-div', true);
            this.setTabIndex('temp-focus-div', parseInt(this.model.get('tabIndex'), 10) + 1);
            this.setFocus('temp-focus-div');
            this.setFocus(accId, 0);
            this.enableTab('temp-focus-div', false);

            // this.unloadScreen('temp-focus-div-screen');
            // $tempFocusDiv.remove();
        },

        /**
        * Returns accid of handle
        * @method _getAccId
        * @return {String} [accId]
        * @private
        **/
        _getAccId: function () {
            var accId = this.model.get('sliderId') + '-handle';
            return accId;
        },

        /**
        * Rounds-off the given value
        * @method _getNearestPoint
        * @param {Number} [value] value to be rounded-off
        * @return {Number} [nearestValue] Rounded-off value
        **/
        _getNearestPoint: function (value) {
            var model = this.model,
                step = model.get('step'),
                nearestValue = Math.round(value / step) * step;

            return nearestValue;
        },

        /**
        * Returns the point in the array that is closest to the slider value
        * @method _getNearestPointFromArray
        * @return {Number} [nearestValue]
        * @private
        **/
        _getNearestPointFromArray: function (sliderValue) {
            var points = this.model.get('points'),
                numOfPoints = points.length,
                nearestValue = points[0];

            for (var i = 0; i < numOfPoints; i++) {
                if (Math.abs(sliderValue - points[i]) < Math.abs(sliderValue - nearestValue))
                    nearestValue = points[i];
            }

            return nearestValue;
        },

        /**
        * Decides if the given event is keyboard event or not
        * @method _isKeyBoardEvent
        * @return {Boolean} [isKeyBoardEvent]
        **/
        _isKeyBoardEvent: function (event) {
            var isKeyBoardEvent = false;

            if (event.keyCode) {
                isKeyBoardEvent = true;
            }

            return isKeyBoardEvent;
        },

        /**
        * Finds the next point in the given array of points
        * @method _getNextPoint
        * @return {Number} [newValue]
        **/
        _getNextPoint: function () {
            var model = this.model,
                points = model.get('points'),
                currentValue = model.get('selectedValue'),
                currentValueIndex = points.indexOf(currentValue),
                newValue = null;

            switch (currentValueIndex) {
                case (points.length - 1):
                    newValue = points[points.length - 1];
                    break;

                case -1:
                    newValue = this._getNearestPointFromArray(currentValue);
                    break;

                default:
                    newValue = points[currentValueIndex + 1];
                    break;
            }

            return newValue;
        },

        /**
        * Finds the previous point in the given array of points
        * @method _getPreviousPoint
        * @return {Number} [newValue]
        **/
        _getPreviousPoint: function () {
            var model = this.model,
                points = model.get('points'),
                currentValue = model.get('selectedValue'),
                currentValueIndex = points.indexOf(currentValue),
                newValue = null;

            switch (currentValueIndex) {
                case 0:
                    newValue = points[0];
                    break;

                case -1:
                    newValue = this._getNearestPointFromArray(currentValue);
                    break;

                default:
                    newValue = points[currentValueIndex - 1];
                    break;
            }

            return newValue;
        }

    }, {

        /**
        * Creates a model & view object for the slider given default model properties as a parameter and
        * returns the view object.
        * @method generateSlider
        * @param options {Object} 
        * @return {Object} The slider view object.
        */
        generateSlider: function (options) {
            if (options) {
                var containerId, slider, sliderView;
                containerId = '#' + options.idPrefix + options.containerId;
                slider = new MathInteractives.Common.Components.Models.Slider(options);
                sliderView = new MathInteractives.Common.Components.Views.Slider({ el: containerId, model: slider });

                return sliderView;
            }
        }
    });

    MathInteractives.global.Slider = MathInteractives.Common.Components.Views.Slider;

})();