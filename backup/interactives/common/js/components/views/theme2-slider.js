
(function () {
    'use strict';

    /**
    * View for rendering Slider
    *
    * @class Slider
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.Slider = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Utils class for accessing static members
        * @property utils
        * @type Object
        * @default MathInteractives.Common.Utilities.Models.Utils
        * @public
        */
        utils: MathInteractives.Common.Utilities.Models.Utils,

        /**
        * Whether the increase and decrease acessibility message for slider handle is same or not
        * @property isIncDecMsgSame
        * @type Boolean
        * @default false
        * @public
        */
        isIncDecMsgSame: false,

        /**
        * jQuery object of slider container
        * @property _$sliderContainer
        * @type Object
        * @default null
        * @private
        */
        _$sliderContainer: null,

        /**
        * jQuery object of slider
        * @property _$slider
        * @type Object
        * @default null
        * @private
        */
        _$slider: null,

        /**
        * jQuery object of slider handle
        * @property _$sliderHandle
        * @type Object
        * @default null
        * @private
        */
        _$sliderHandle: null,

        /**
        * Whether the slider label is clicked or not
        * @property _isLabelClicked
        * @type Boolean
        * @default false
        * @private
        **/
        _isLabelClicked: false,

        /**
        * Tooltip view for the slider handle
        * @property handleTooltipView
        * @type Object
        * @default null
        **/
        handleTooltipView: null,

        /**
        * Boolean stores if screen id is present
        * @property isScreenIdPresent
        * @type Boolean
        * @default null
        **/
        isScreenIdPresent: null,

        /**
        * Stores value of top offset to position value div on vertical slider
        * @property topOffset
        * @type Number
        * @default null
        **/
        topOffset: null,

        /**
        * Stores value of left offset to position value div on horizontal slider
        * @property leftOffset
        * @type Number
        * @default null
        **/
        leftOffset: null,

        /**
        * Offset of value div to be set based on slider labels
        * @property labelOffset
        * @type Number
        * @default null
        **/
        labelOffset: null,

        /**
        * Offset of value div to be set based on slider labels during render
        * @property initialLabelOffset
        * @type Number
        * @default null
        **/
        initialLabelOffset: null,

        /**
        * Slider handle's previous accessibility text
        * @property prevAccText
        * @type String
        * @default ''
        * @private
        **/
        _prevAccText: '',

        /**
        * Slider bars previous cursor
        * @property sliderElemCursor
        * @type String
        * @default null
        * @private
        **/
        sliderElemCursor: null,

        /**
        * Slider handle's previous cursor
        * @property sliderHandleElemCursor
        * @type String
        * @default null
        * @private
        **/
        sliderHandleElemCursor: null,

        /**
        * Calls render
        * @method initialize
        **/
        initialize: function initialize() {
            var model = this.model;
            this.initializeDefaultProperties();
            var screenId = model.get('screenId');
            this.isScreenIdPresent = typeof screenId !== 'undefined' && screenId !== null;

            if (this.isScreenIdPresent) {
                this.loadScreen(screenId);
            }
            this.render();
            this._attachEvents();

        },

        /**
        * Renders the slider component
        * @method render
        **/
        render: function render() {
            var model = this.model,
                sliderId = this.idPrefix + model.get('sliderId'),
                $handle,
                stepValue = model.get('step'),
                selectedValue = model.get('selectedValue'),
                utilsClass = MathInteractives.Common.Utilities.Models.Utils,
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

            // Makes the handle movement smooth
            if (model.get('smoothSliding') === true) {
                stepValue = stepValue / MathInteractives.Common.Components.Theme2.Models.Slider.SLIDER_INTERVAL_DIVIDER;
            }

            // Create slider
            this._$slider = this.$('#' + sliderId).CustomSlider({
                min: model.get('minValue'),
                max: model.get('maxValue'),
                step: stepValue,
                value: selectedValue,
                animate: model.get('animate'),
                orientation: model.get('orientation')
            });

            // Set id of handle
            this.$('.ui-slider-handle').attr({
                'id': sliderId + '-handle'
            }).addClass('slider-handle');

            this._$sliderHandle = this.$('.slider-handle');

            if (model.get('sliderBackgroundImageId') !== null) {
                this._$slider.css({ 'background-image': 'url("' + this.filePath.getImagePath(model.get('sliderBackgroundImageId')) + '")' });
                this._$sliderHandle.addClass(model.get('colorType').classPrefix + '-handle');
            }
            else {
                this._addColor();
            }

            if (model.get('themeType') === MathInteractives.Common.Components.Theme2.Models.Slider.TYPE.TYPE2) {
                this._addType2SliderColor();
            }

            this._setSliderHandlePattern();
            //Generate tooltip
            this._generateTooltip();
            if (model.get('labelType') !== null) {
                this._appendLabels(model.get('labelType'));
            }
            if (model.get('showSliderValue') === true) {
                this._generateSliderValueContainer();
            }

            this.loadScreen('theme-2-slider-acc-text');

            var containerAccText = this.isScreenIdPresent ? this.getAccMessage(model.get('sliderId') + '-slider-handle', 0, [selectedValue]) : '',
                sliderAccText = null,
                customAccCallback = model.get('customAccCallback');

            if (customAccCallback !== null && typeof customAccCallback.fnc !== 'undefined' && customAccCallback.fnc !== null) {
                sliderAccText = customAccCallback.fnc.apply(customAccCallback.scope || this, [{
                    navigation: MathInteractives.Common.Components.Theme2.Models.Slider.NAVIGATION.DEFAULT,
                    prevValue: selectedValue,
                    nextValue: selectedValue
                }]);
            }
            else {
                sliderAccText = this.isScreenIdPresent ? this.getAccMessage(model.get('sliderId') + '-slider-handle', 1, [selectedValue]) : '';
            }
            this.isIncDecMsgSame = this.isScreenIdPresent && this.getAccMessage(model.get('sliderId') + '-slider-handle', 3) ? false : true;

            // Create Acc div for slider container
            this.createAccDiv({
                'elementId': model.get('containerId'),
                'tabIndex': model.get('tabIndex'),
                'acc': containerAccText
            });

            var containerId = model.get('containerId'),
                tabIndex = null;

            this.$el.on('keydown', $.proxy(this.accessSlider, this));
            tabIndex = parseInt(model.get('tabIndex'), 10) + 3;

            // Create Acc div for slider
            this.createAccDiv({
                'elementId': model.get('sliderId') + '-handle',
                'acc': sliderAccText,
                'tabIndex': tabIndex
            });
            this.restrictAccDivSize(model.get('containerId'));
            $handle = this.$('.ui-slider-handle');
            // Enable touch feature
            utilsClass.EnableTouch(this.$('.ui-slider-handle'), { specificEvents: utilsClass.SpecificEvents.DRAGGABLE });

            if (!BrowserCheck.isMobile) {
                $handle.css({
                    cursor: "url('" + this.filePath.getImagePath('open-hand') + "'), move"
                });
            }
            // add class for touch action none on container
            this.$el.addClass('touch-action-none');
        },

        /**
        * Sets the tab index of slider container and slider handle
        * @method setSliderTabIndex
        * @param {Number} tabIndex Tab index for the slider container
        * @public
        **/
        setSliderTabIndex: function setSliderTabIndex(tabIndex) {
            var model = this.model;
            model.set('tabIndex', tabIndex);
            this.setTabIndex(model.get('containerId'), tabIndex);
            this.setTabIndex(this._getAccId(), (tabIndex + 3));
        },

        /**
        * Sets tab index of the handle and its Acc Message when slider is accessed
        * @method accessSlider
        * @public
        * @param event {Object} the event object
        **/
        accessSlider: function accessSlider(event) {
            var model = this.model,
                sliderValue = model.get('selectedValue'),
                sliderId = model.get('sliderId'),
                keycode = (event.keyCode) ? event.keyCode : event.which;

            if (keycode === 9) {
                var customAccCallback = model.get('customAccCallback'),
                    sliderAccText;
                if (customAccCallback !== null && typeof customAccCallback.fnc !== 'undefined' && customAccCallback.fnc !== null) {
                    sliderAccText = customAccCallback.fnc.apply(customAccCallback.scope || this, [{
                        navigation: MathInteractives.Common.Components.Theme2.Models.Slider.NAVIGATION.DEFAULT,
                        prevValue: sliderValue,
                        nextValue: sliderValue
                    }]);
                }
                else {
                    sliderAccText = this.isScreenIdPresent ? this.getAccMessage(sliderId + '-slider-handle', 1, [sliderValue]) : '';
                }
                if (sliderAccText.trim() !== '') {
                    this.setAccMessage(sliderId + '-handle', sliderAccText);
                }
                this.player._refreshDOM();
            }

        },


        /**
        * Call generateTooltip function
        * @method _generateTooltip
        * @private
        **/
        _generateTooltip: function _generateTooltip() {
            var model = this.model;
            if (model.get('showHandleTooltip') === true) {

                if (this.handleTooltipView) {
                    this.handleTooltipView.removeTooltip();
                }

                var sliderId = this.idPrefix + model.get('sliderId'),
                    selectedValue = model.get('selectedValue'),
                    //roundedValue = this._numberPrecision(selectedValue, model.get('handleTooltipTextPrecision')),
                    roundedValue = this.updateMinusSign(selectedValue, model.get('handleTooltipTextPrecision')),
                    handleTooltipText = model.get('handleTooltipText'),
                    customTooltipCallback = model.get('customTooltipCallback'),
                    handleTooltipProps = {
                        path: this.filePath,
                        manager: this.manager,
                        _player: this.player,
                        idPrefix: this.idPrefix,
                        id: sliderId + '-handle-tooltip',
                        elementEl: sliderId + '-handle'
                    };
                $.extend(handleTooltipProps, model.get('tooltipProp'));

                if (customTooltipCallback !== null && typeof customTooltipCallback.fnc !== 'undefined' && customTooltipCallback.fnc !== null) {
                    handleTooltipText = customTooltipCallback.fnc.apply(customTooltipCallback.scope || this, [{
                        exactValue: selectedValue,
                        nearestValue: selectedValue
                    }]);
                }
                else {
                    handleTooltipText = (handleTooltipText === null) ? roundedValue : handleTooltipText.replace('%@$%', roundedValue);
                }

                handleTooltipProps.text = handleTooltipText;
                handleTooltipProps.type = handleTooltipProps.type || MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL;
                handleTooltipProps.arrowType = handleTooltipProps.arrowType || model.get('toolTipArrowType');
                handleTooltipProps.baseClass = handleTooltipProps.baseClass || model.get('handleTooltipCustomClass');

                this.handleTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(handleTooltipProps);
            }
        },

        /**
        * Creates slider value container to display slider value near slider handle
        * @method _generateSliderValueContainer
        * @private
        **/
        _generateSliderValueContainer: function _generateSliderValueContainer() {
            var model = this.model,
                orientation = model.get('orientation'),
                labelType = model.get('labelType'),
                valuePosition = model.get('valuePosition'),
                $valueContainer,
                $value;

            $valueContainer = $('<div>', { 'class': 'slider-value-container' });
            $value = $('<div>', { 'class': 'slider-value' });

            $valueContainer.empty().append($value);
            if (orientation === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.HORIZONTAL) {
                $value.addClass('horizontal');
                $valueContainer.addClass('horizontal');
                if (valuePosition === MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_POSITION.ABOVE) {
                    $valueContainer.insertBefore(this._$slider);
                    $valueContainer.addClass('above');
                }
                else if (valuePosition === MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_POSITION.BELOW) {
                    $valueContainer.insertAfter(this._$slider);
                    $valueContainer.addClass('below');
                }
            }
            else if (orientation === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.VERTICAL) {
                $value.addClass('vertical');
                $valueContainer.addClass('vertical');
                if (valuePosition === MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_POSITION.LEFT) {
                    $valueContainer.insertBefore(this._$slider);
                    $valueContainer.addClass('left');
                }
                else if (valuePosition === MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_POSITION.RIGHT) {
                    $valueContainer.insertAfter(this._$slider);
                    $valueContainer.addClass('right');
                }
            }
            switch (model.get('valueType')) {

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.EXACT_VALUE:
                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.NEAREST_VALUE:
                    this._setSliderValueInContainer(model.get('selectedValue'), true, true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_EXACT_VALUE:
                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_NEAREST_VALUE:
                    this._setSliderTextInContainer(model.get('selectedValue'), true, true);
                    this._setSliderValuePosition(model.get('selectedValue'), true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.ARBITRARY_TEXT:
                    this._setSliderTextInContainer(model.get('selectedValue'));
                    this._setSliderValuePosition(model.get('selectedValue'), true);
                    break;
            }
        },

        /**
        * Sets the value in slider value container
        * @method _setSliderValueInContainer
        * @param {Number} value Value to be set in slider value container
        * @private
        **/
        _setSliderValueInContainer: function _setSliderValueInContainer(value, isPositionBasedOnValue, isFirst) {
            if (this.model.get('showSliderValue') === false) {
                return;
            }
            var self = this;
            //this.$('.slider-value-container .slider-value').text(value.toFixed(this.model.get('valuePrecision')));
            this.$('.slider-value-container .slider-value').html(this.updateMinusSign(value, this.model.get('valuePrecision')));
            if (typeof isPositionBasedOnValue === 'undefined' || isPositionBasedOnValue === null || isPositionBasedOnValue === true) {
                self._setSliderValuePosition(value, isFirst);
            }
        },

        /**
        * Sets the text in slider value container
        * @method _setSliderTextInContainer
        * @param {Number}
        * @private
        **/
        _setSliderTextInContainer: function _setSliderTextInContainer(value, isPositionBasedOnValue, isTextWithValue) {
            if (this.model.get('showSliderValue') === false) {
                return;
            }
            var sliderText = this.model.get('valueText');
            if (typeof isTextWithValue !== 'undefined' && isTextWithValue !== null && isTextWithValue === true) {
                //var roundedValue = value.toFixed(this.model.get('valuePrecision'));
                var roundedValue = this.updateMinusSign(value, this.model.get('valuePrecision'));
                sliderText = sliderText.replace('%@$%', roundedValue);
            }
            this.$('.slider-value-container .slider-value').html(sliderText);
            if (typeof isPositionBasedOnValue === 'undefined' || isPositionBasedOnValue === null || isPositionBasedOnValue === true) {
                this._setSliderValuePosition(value);
            }
        },

        /**
        * Sets the position of slider value container near the slider handle
        * @method _setSliderValuePosition
        * @param {Number} value Value in slider value container on the basis of which position is determined
        * @private
        **/
        _setSliderValuePosition: function _setSliderValuePosition(value, isFirst) {
            var model = this.model;
            if (model.get('showSliderValue') === true) {
                var orientation = model.get('orientation'),
                    minValue = model.get('minValue'),
                    maxValue = model.get('maxValue'),
                    $sliderValueContainer = this.$('.slider-value-container'),
                    $sliderValue = this.$('.slider-value-container .slider-value');

                if (isFirst) {
                    this._setInitialValueDivOffsetValues();
                }

                if (orientation === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.HORIZONTAL) {
                    var sliderValueLeft;
                    if (isFirst) {
                        sliderValueLeft = this._$slider.width() / (maxValue - minValue) * (value - minValue) + this.handleOffset + this.leftOffset + model.get('initialLeftAdjustment') + this.labelOffset;
                    }
                    else {
                        sliderValueLeft = this.$('.slider-handle').position().left + this.handleOffset + this.leftOffset + this.labelOffset;
                    }
                    $sliderValueContainer.css('left', sliderValueLeft);

                }
                else if (orientation === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.VERTICAL) {
                    var sliderValueTop;
                    if (isFirst) {
                        var initialTopAdjustment = model.get('initialTopAdjustment') + this.initialLabelOffset + MathInteractives.Common.Components.Theme2.Models.Slider.INITIAL_LABEL_OFFSET;
                        sliderValueTop = this._$slider.height() / (maxValue - minValue) * (maxValue - value) - this.handleOffset + initialTopAdjustment + this.labelOffset;
                    }
                    else {
                        sliderValueTop = this.$('.slider-handle').position().top + this.handleOffset + this.topOffset + this.labelOffset + this.initialLabelOffset;
                    }
                    $sliderValueContainer.css('top', sliderValueTop);
                }
            }
        },

        /**
        * Sets the default offset values for slider div positioning
        * @method _setInitialValueDivOffsetValues
        * @private
        **/
        _setInitialValueDivOffsetValues: function () {
            var model = this.model,
                orientation = model.get('orientation'),
                minValue = model.get('minValue'),
                maxValue = model.get('maxValue'),
                $sliderValueContainer = this.$('.slider-value-container'),
                $sliderValue = this.$('.slider-value-container .slider-value');

            this.labelOffset = -10;
            this.initialLabelOffset = 0;

            if (orientation === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.HORIZONTAL) {
                if (model.get('labelType') === MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX_BESIDE_SLIDER) {
                    var sliderLabel = $('#' + model.get('idPrefix') + 'slider-label-1');
                    sliderLabel.css({
                        'visibility': 'hidden',
                        'display': 'block'
                    });
                    this.labelOffset = parseInt(sliderLabel.css('margin-right').replace('px', '')) + sliderLabel.width();
                    sliderLabel.css({
                        'visibility': '',
                        'display': ''
                    });
                }
                this.handleOffset = this.$('.slider-handle').width() / 2;
                this.leftOffset = model.get('sliderValueLeftOffset') + MathInteractives.Common.Components.Theme2.Models.Slider.INITIAL_LEFT_OFFSET;
            }
            else if (orientation === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.VERTICAL) {
                if (model.get('labelType') === MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX_BESIDE_SLIDER) {
                    var sliderLabel = $('#' + model.get('idPrefix') + 'slider-label-2');
                    sliderLabel.css({
                        'visibility': 'hidden',
                        'display': 'block'
                    });
                    this.labelOffset = parseFloat(sliderLabel.css('margin-bottom').replace('px', '')) + sliderLabel.height();
                    sliderLabel.css({
                        'visibility': '',
                        'display': ''
                    });
                    this.initialLabelOffset = $sliderValueContainer.height() - sliderLabel.height();
                }
                this.handleOffset = this.$('.slider-handle').height() / 2;
                this.topOffset = model.get('sliderValueTopOffset') + MathInteractives.Common.Components.Theme2.Models.Slider.INITIAL_TOP_OFFSET;
            }
        },

        /**
        * Sets the position of slider value container near the slider handle after certain delay
        * @method _setDelayedSliderValuePosition
        * @param value {Number} Value in slider value container on the basis of which position is determined
        * @private
        **/
        _setDelayedSliderValuePosition: function (value) {
            if (this.model.get('showSliderValue')) {
                var self = this,
                    triggerTimer = setTimeout(function () {
                        self._setSliderValuePosition(value);
                        clearTimeout(triggerTimer);
                    }, MathInteractives.Common.Components.Theme2.Models.Slider.SLIDER_TRIGGER_TIMER);
            }
        },

        /**
        * Adds background color to the slider and handle
        * @method _addColor
        * @private
        **/
        _addColor: function _addColor() {
            var classPrefix = this.model.get('colorType').classPrefix;
            this._$slider.addClass(classPrefix + '-slider' + ' ' + classPrefix + '-box-shadow');
            this._$sliderHandle.addClass(classPrefix + '-handle');
        },

        /**
        * Adds background color to the type2 slider
        * @method _addType2SliderColor
        * @private
        **/
        _addType2SliderColor: function _addType2SliderColor() {
            $('<div/>', { class: "slider-variable-mid" }).prependTo(this._$slider);
            this._setType2SliderSize(this.getSelectedValue());
        },

        /**
        * Sets the width-height of inner slider for type-2 slider
        * @method _setType2SliderSize
        * @private
        * @param {Number} sliderValue slider value
        **/
        _setType2SliderSize: function _setType2SliderSize(sliderValue) {
            var model = this.model,
                minValue = model.get('minValue'),
                maxValue = model.get('maxValue'),
                sliderWidth = this._$slider.width(),
                sliderHeight = this._$slider.height(),
                variableWidth,
                variableHeight,
                variableMidWidth,
                variableMidHeight;

            if (model.get('orientation') === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.HORIZONTAL) {
                variableWidth = (sliderWidth / (maxValue - minValue) * (sliderValue - minValue));
                variableWidth = this.utils.roundUpValue(variableWidth, 2);
                variableMidWidth = sliderWidth - variableWidth;
                this.$('.slider-variable-mid').css({
                    'width': variableMidWidth + 'px'
                });
            }
            else if (model.get('orientation') === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.VERTICAL) {
                variableHeight = (sliderHeight / (maxValue - minValue) * (sliderValue - minValue));
                variableHeight = this.utils.roundUpValue(variableHeight, 2);
                variableMidHeight = sliderHeight - variableHeight;
                this.$('.slider-variable-mid').css({
                    'height': variableMidHeight + 'px'
                });
            }
        },

        /**
        * Changes the styling of slider handle
        * @method _setSliderHandlePattern
        * @private
        **/
        _setSliderHandlePattern: function _setSliderHandlePattern() {
            var model = this.model,
                noOfDots = model.get('numberOfDots'),
                $slider = this._$slider,
                $sliderHandle = this._$sliderHandle,
                sliderWidth = $slider.width(),
                sliderHeight = $slider.height(),
                sliderHandleWidth = $sliderHandle.width(),
                sliderHandleHeight = $sliderHandle.height();

            $sliderHandle.html(MathInteractives.Common.Components.templates.sliderHandle({
                data: _.range(noOfDots),
                idPrefix: this.idPrefix,
                sliderId: model.get('sliderId')
            }).trim());

            //Aligns the handle properly on the slider based on slider orientation.
            if (model.get('orientation') === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.HORIZONTAL) {
                var top = (sliderHeight - sliderHandleHeight) / 2,
                    marginLeft = sliderHandleWidth / 2;
                $sliderHandle.css({
                    'top': top + 'px',
                    'margin-left': -marginLeft + 'px'
                });
                $sliderHandle.find('.box').addClass('horizontal');
            }
            else if (model.get('orientation') === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.VERTICAL) {
                var left = (sliderWidth - sliderHandleWidth) / 2,
                    marginBottom = sliderHandleHeight / 2;
                $sliderHandle.css({
                    'left': left + 'px',
                    'margin-bottom': -marginBottom + 'px'
                });
                $sliderHandle.find('.box').addClass('vertical');
            }

        },

        /**
        * Appends labels to slider based on label types
        * @method _appendLabels
        * @private
        * @param {String} labelType One of the label type from MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE
        **/
        _appendLabels: function _appendLabels(labelType) {
            var model = this.model,
                minValue = model.get('minValue'),
                maxValue = model.get('maxValue'),
                labelValues = null,
                labelTexts = model.get('labelTexts'),
                noOfLabels,
                $labelContainer;

            switch (labelType) {
                case MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX:
                case MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX_BESIDE_SLIDER:
                    {
                        labelValues = [minValue, maxValue];
                        model.set('labelValues', labelValues);
                    }
                    break;
                case MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MID_MAX:
                    {
                        var midValue = Math.floor((minValue + maxValue) / 2);
                        labelValues = [minValue, midValue, maxValue];
                        model.set('labelValues', labelValues);
                    }
                    break;
                case MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.CUSTOM:
                    {
                        labelValues = model.get('labelValues');
                    }
                    break;
            }
            noOfLabels = labelValues.length;
            if (labelValues !== null && labelTexts === null) {
                labelTexts = [];
                for (var i = 0; i < noOfLabels; i++) {
                    labelTexts[i] = this.updateMinusSign(labelValues[i]);
                }
                model.set('labelTexts', labelTexts);
            }
            if (labelValues !== null && typeof (labelValues) !== 'undefined' && noOfLabels > 0) {
                if (model.get('orientation') === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.HORIZONTAL) {
                    if (labelType === MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX_BESIDE_SLIDER) {
                        var $labelMin,
                            $labelMax,
                            sliderHandleMarginLeft = this._$sliderHandle.css('margin-left'),
                            labelHorzMargin = Math.abs(Number(sliderHandleMarginLeft.replace('px', ''))),
                            labelMarginTop = (this._$slider.height() - this._$sliderHandle.height()) / 2;

                        $labelMin = $('<div>', {
                            'id': this.idPrefix + 'slider-label-1',
                            'style': 'margin-right:' + labelHorzMargin + 'px;margin-top:' + labelMarginTop + 'px;',
                            'class': 'slider-labels-beside-slider typography-label',
                            'labelIndex': 0
                        }).html(labelTexts[0]);
                        $labelMin.insertBefore(this._$slider);
                        this._$slider.css('float', 'left');
                        $labelMax = $('<div>', {
                            'id': this.idPrefix + 'slider-label-2',
                            'style': 'margin-left:' + labelHorzMargin + 'px;margin-top:' + labelMarginTop + 'px;',
                            'class': 'slider-labels-beside-slider typography-label',
                            'labelIndex': 1
                        }).html(labelTexts[1]);
                        $labelMax.insertAfter(this._$slider);
                        if (model.get('allowLabelNavigation') === false) {
                            $labelMin.addClass('slider-labels-without-navigation');
                            $labelMax.addClass('slider-labels-without-navigation');
                        }
                    }
                    else {
                        var allowLabelNavigation = model.get('allowLabelNavigation'),
                            sliderWidth = this._$slider.width(),
                            distance = maxValue - minValue,
                            leftPosition,
                            $label;
                        $labelContainer = $('<div>', { 'class': 'slider-labels-container' });
                        for (var i = 0; i < noOfLabels; i++) {
                            leftPosition = (labelValues[i] - minValue) / distance * 100;
                            $label = $('<div>', {
                                'id': this.idPrefix + 'slider-label-' + (i + 1),
                                'style': 'left:' + leftPosition + '%',
                                'class': 'slider-labels typography-label',
                                'labelIndex': i
                            }).html(labelTexts[i]);
                            if (allowLabelNavigation === false) {
                                $label.addClass('slider-labels-without-navigation');
                            }
                            $labelContainer.append($label);
                        }
                        // Append labels container
                        this.$el.append($labelContainer);
                        this.$('.slider-labels-container').css('width', sliderWidth + 'px');
                    }
                }
                else if (model.get('orientation') === MathInteractives.Common.Components.Theme2.Models.Slider.ORIENTATION.VERTICAL) {
                    if (labelType === MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX_BESIDE_SLIDER) {
                        var $labelMin,
                            $labelMax,
                            sliderHandleMarginBottom = this._$sliderHandle.css('margin-bottom'),
                            labelVertMargin = Math.abs(Number(sliderHandleMarginBottom.replace('px', ''))),
                            labelMarginLeft = (this._$slider.width() - this._$sliderHandle.width()) / 2,
                                width = this._$slider.parent().width();

                        $labelMin = $('<div>', {
                            'id': this.idPrefix + 'slider-label-1',
                            'style': 'margin-top:' + labelVertMargin + 'px;width:' + width + 'px;text-align:center;',
                            'class': 'slider-labels-beside-slider typography-label',
                            'labelIndex': 0
                        }).html(labelTexts[0]);
                        this._$slider.css('float', 'left');
                        $labelMin.insertAfter(this._$slider);
                        this._$slider.css('margin-left', (width - this._$slider.width()) / 2);
                        $labelMax = $('<div>', {
                            'id': this.idPrefix + 'slider-label-2',
                            'style': 'margin-bottom:' + labelVertMargin + 'px;width:' + width + 'px;text-align:center;',
                            'class': 'slider-labels-beside-slider typography-label',
                            'labelIndex': 1
                        }).html(labelTexts[1]);
                        $labelMax.insertBefore(this._$slider);
                        if (model.get('allowLabelNavigation') === false) {
                            $labelMin.addClass('slider-labels-without-navigation');
                            $labelMax.addClass('slider-labels-without-navigation');
                        }
                    }
                }
            }

        },

        /**
        * Attaches events to elements in $el
        * @property events
        * @type Object
        **/
        events: {
            'click .slider-labels:not(.slider-labels-without-navigation)': '_labelClicked',
            'click .slider-labels-beside-slider:not(.slider-labels-without-navigation)': '_labelClicked'
        },

        /**
        * Attaches slide related events
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var self = this,
                model = this.model,
                $slider = this._$slider,
                $sliderHandle = this._$sliderHandle;

            // Functions to set rounded-off values in the model on sliding, and when sliding stops
            $slider.off('slidestart slidestop slide').on({
                'slidestart': $.proxy(this._slideStart, this),
                'slidestop': $.proxy(this._snapToNearestPoint, this),
                'slide': $.proxy(this._updateOnSlide, this),
                'click': $.proxy(this._updateOnClick, this)
            });

            $sliderHandle.off('click.slider').on({
                'click.slider': $.proxy(this._sliderHandleClicked, this)
            });

            //unbinds mouseenter and mouseleave of slider only for touch devices
            if ('ontouchstart' in window) {
                $sliderHandle.off('mouseenter.slider mouseleave.slider')
            }
            //Add Touchcancel to fix hover state perssisting issue on touch devices
            $sliderHandle.off('mouseenter.slider touchstart.slider mouseleave.slider touchend.slider touchcancel.slider').on({
                'mouseenter.slider touchstart.slider': $.proxy(this._mouseEnter, this),
                'mouseleave.slider touchend.slider touchcancel.slider': $.proxy(this._mouseLeave, this)
            });

            //unbinds the default key events of slider and adds new custom events
            $sliderHandle.off('keydown.slider keyup.slider');
            if (this.isAccessible() === true) {
                $sliderHandle.on({
                    'keydown.slider': $.proxy(this._moveUsingKeyboard, this),
                    'keyup.slider': $.proxy(this._keyUpOnHandle, this)
                })
            }
            model.off('change:nearestValue').on('change:nearestValue', this._triggerNearestValueChange, this);
            model.off('change:selectedValue').on('change:selectedValue', this._changeValue, this);
        },

        /**
        * Shows hover state of handle and pointer cursor
        * @method _mouseEnter
        * @private
        **/
        _mouseEnter: function _mouseEnter() {
            var $handle = this._$sliderHandle,
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

            $handle.addClass('slider-handle-hover ui-state-hover');

            // To prevent abrupt snapping of handle on touch devices, caused by setting pointer cursor.
            if (!BrowserCheck.isMobile && this.isSliderDisabled() === false) {
                $handle.addClass('slider-mouse-over-out');
            }
            else {
                if (!BrowserCheck.isMobile) {
                    $handle.removeClass('slider-mouse-over-out');
                }
            }
        },

        /**
        * Removes hover state of handle
        * @method _mouseLeave
        * @private
        **/
        _mouseLeave: function _mouseLeave() {
            this._$sliderHandle.removeClass('slider-handle-hover ui-state-hover slider-mouse-over-out');
        },

        /**
        * Triggers the slide start event of slider
        * @method _slideStart
        * @param {Object} event Event Object
        * @param {Object} ui UI object
        * @private
        **/
        _slideStart: function _slideStart(event, ui) {
            var self = this,
                sliderValue = ui.value,
                nearestValue = null,
                points = this.model.get('points'),
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

            // Allow only when the user slides using mouse
            if (this._isKeyBoardEvent(event) === true) {
                return;
            }

            if (!BrowserCheck.isMobile) {
                //Store slder bars cursor property
                this.sliderElemCursor = this.$el.find('.ui-slider').css('cursor');

                this.$el.find('.ui-slider').css({
                    cursor: "url('" + this.filePath.getImagePath('closed-hand') + "'), move"
                });

                $(ui.handle).css({
                    cursor: "url('" + this.filePath.getImagePath('closed-hand') + "'), move"
                });
            }
            this.hideTabDrawer();
            if (this.model.get('stopReadingOnInteraction')) {
                this.stopReading();
            }
            if (points !== null && typeof (points) !== 'undefined' && points.length > 0) {
                nearestValue = this._getNearestPointFromArray(sliderValue);
            }
            else {
                nearestValue = this._getNearestPoint(sliderValue);
            }

            switch (this.model.get('valueType')) {

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.EXACT_VALUE:
                    this._setSliderValueInContainer(ui.value);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.NEAREST_VALUE:
                    this._setSliderValueInContainer(nearestValue, false);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_EXACT_VALUE:
                    this._setSliderTextInContainer(ui.value, true, true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_NEAREST_VALUE:
                    this._setSliderTextInContainer(nearestValue, false, true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.ARBITRARY_TEXT:
                    break;

            }
            this._setDelayedSliderValuePosition(ui.value);

            this.model.set('nearestValue', nearestValue);
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDE_START, event, ui, nearestValue);
        },

        /**
        * Snaps the handle to the nearest point on stopping sliding
        * @method _snapToNearestPoint
        * @private
        * @param {Object} [event] Slide event
        * @param {Object} [ui] jQuery UI object
        **/
        _snapToNearestPoint: function _snapToNearestPoint(event, ui) {
            // Allow only when the user slides using mouse
            var BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            if (this._isKeyBoardEvent(event) === true) {
                return;
            }

            if (!BrowserCheck.isMobile) {
                // Set the slider bars original cursor property
                this.$el.find('.ui-slider').css({
                    cursor: this.sliderElemCursor
                });

                $(ui.handle).css({
                    cursor: "url('" + this.filePath.getImagePath('open-hand') + "'), move"
                });
            }

            var model = this.model,
                self = this,
                points = model.get('points'),
                sliderValue = ui.value,
                nearestValue = null,
                tooltipTimer = null;

            if (points !== null && typeof (points) !== 'undefined' && points.length > 0) {
                nearestValue = this._getNearestPointFromArray(sliderValue);
            }
            else {
                nearestValue = this._getNearestPoint(sliderValue);
            }
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDE_STOP, event, ui, nearestValue);

            switch (model.get('valueType')) {

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.EXACT_VALUE:
                    this._setSliderValueInContainer(ui.value);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.NEAREST_VALUE:
                    this._setSliderValueInContainer(nearestValue, false);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_EXACT_VALUE:
                    this._setSliderTextInContainer(ui.value, true, true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_NEAREST_VALUE:
                    this._setSliderTextInContainer(nearestValue, false, true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.ARBITRARY_TEXT:
                    break;

            }

            if (model.get('selectedValue') === nearestValue) {
                this._changeSliderValue(model, nearestValue);
            }
            else {
                this.setSelectedValue(nearestValue);
            }
            /** Fix to reposition tooltip on snap **/
            if (model.get('showHandleTooltip') === true) {
                self.handleTooltipView.showTooltip();
            }
            tooltipTimer = setTimeout(function () {
                if ((BrowserCheck.isMobile === true || !self._$sliderHandle.hasClass('slider-handle-hover')) && model.get('showHandleTooltip') === true && model.isSliderTooltipPermanent() !== true) {
                    clearTimeout(tooltipTimer);
                    self.handleTooltipView.hideTooltip();
                }
            }, 10);
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.FINAL_SLIDE_STOP, event, ui, nearestValue);
        },

        /**
        * Stores rounded-off values in the model and updates the width of variable-mid section,while sliding is in progress.
        * @method _updateOnSlide
        * @private
        * @param {Object} [event] Slide event
        * @param {Object} [ui] jQuery UI object
        **/
        _updateOnSlide: function _updateOnSlide(event, ui) {
            // Don't allow the execution while navigating with keyboard.
            // Causes issues while sliding using Page up and page down

            if (this._isKeyBoardEvent(event) === true) {
                return;
            }

            var model = this.model,
                self = this,
                nearestValue = null,
                sliderValue = ui.value,
                points = this.model.get('points');

            if (model.get('themeType') === MathInteractives.Common.Components.Theme2.Models.Slider.TYPE.TYPE2) {
                this._setType2SliderSize(sliderValue);
            }
            if (points !== null && typeof (points) !== 'undefined' && points.length > 0) {
                nearestValue = this._getNearestPointFromArray(sliderValue);
            }
            else {
                nearestValue = this._getNearestPoint(sliderValue);
            }

            switch (model.get('valueType')) {

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.EXACT_VALUE:
                    this._setSliderValueInContainer(sliderValue);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.NEAREST_VALUE:
                    this._setSliderValueInContainer(nearestValue, false);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_EXACT_VALUE:
                    this._setSliderTextInContainer(sliderValue, true, true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_NEAREST_VALUE:
                    this._setSliderTextInContainer(nearestValue, false, true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.ARBITRARY_TEXT:
                    break;

            }
            this._setDelayedSliderValuePosition(sliderValue);

            this._showHandleTooltip(sliderValue, nearestValue, true);
            model.set('nearestValue', nearestValue);
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDE, event, ui, nearestValue);
        },

        /**
        * Stores rounded-off values in the model on a click of slider and also updates the width of variable mid section.
        * @method _updateOnClick
        * @param {Object} [event] click event
        * @private
        **/
        _updateOnClick: function _updateOnClick(event) {
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDER_CLICK, event);
        },

        /**
        * Sets the value of slider and fires value change event
        * @method _changeValue
        * @param {Object} model Slider model
        * @param {Number} selectedValue Slider's selected value
        * @private
        **/
        _changeValue: function _changeValue(model, selectedValue) {
            this.hideTabDrawer();
            if (this.model.get('stopReadingOnInteraction')) {
                this.stopReading();
            }
            this._changeSliderValue(model, selectedValue);
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.VALUE_CHANGE, selectedValue, this._isLabelClicked);
            this._isLabelClicked = false;
        },

        /**
        * Triggers nearest value change event
        * @method _triggerNearestValueChange
        * @private
        **/
        _triggerNearestValueChange: function () {
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.NEAREST_VALUE_CHANGE);
        },

        /**
        * Sets the value of slider
        * @method _changeSliderValue
        * @param {Object} model Slider model
        * @param {Number} selectedValue Slider's selected value
        * @private
        **/
        _changeSliderValue: function _changeSliderValue(model, selectedValue) {
            this._showHandleTooltip(selectedValue, selectedValue);
            this._$slider.CustomSlider('value', selectedValue);
            if (model.get('themeType') === MathInteractives.Common.Components.Theme2.Models.Slider.TYPE.TYPE2) {
                this._setType2SliderSize(selectedValue);
            }

            switch (model.get('valueType')) {
                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.EXACT_VALUE:
                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.NEAREST_VALUE:
                    this._setSliderValueInContainer(selectedValue);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_EXACT_VALUE:
                    this._setSliderTextInContainer(selectedValue, true, true);
                    break;

                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.TEXT_WITH_NEAREST_VALUE:
                    this._setSliderTextInContainer(selectedValue, true, true);
                    break;
                case MathInteractives.Common.Components.Theme2.Models.Slider.VALUE_TYPE.ARBITRARY_TEXT:
                    break;
            }
            this._setDelayedSliderValuePosition(selectedValue);

            if (model.get('setDefaultMsgOnValueChange') === true) {
                this.setDefaultAccMessage();
            }
        },

        /**
        * Sets the default message for the slider container and handle
        * @method setDefaultAccMessage
        * @public
        **/
        setDefaultAccMessage: function setDefaultAccMessage() {
            var model = this.model,
                customAccCallback = model.get('customAccCallback'),
                selectedValue = model.get('selectedValue'),
                containerAccText = this.isScreenIdPresent ? this.getAccMessage(model.get('sliderId') + '-slider-handle', 0, [selectedValue]) : '',
                handleAccText;

            if (customAccCallback !== null && typeof customAccCallback.fnc !== 'undefined' && customAccCallback.fnc !== null) {
                handleAccText = customAccCallback.fnc.apply(customAccCallback.scope || this, [{
                    navigation: MathInteractives.Common.Components.Theme2.Models.Slider.NAVIGATION.DEFAULT,
                    prevValue: selectedValue,
                    nextValue: selectedValue
                }]);
            }
            else {
                handleAccText = this.isScreenIdPresent ? this.getAccMessage(model.get('sliderId') + '-slider-handle', 1, [selectedValue]) : '';
            }
            if (handleAccText.trim() !== '') {
                this.setAccMessage(model.get('sliderId') + '-handle', handleAccText);
            }
            if (containerAccText.trim() !== '') {
                this.setAccMessage(model.get('containerId'), containerAccText);
            }
        },

        /**
        * Provides for appropriate navigation along the slider using
        * arrow keys, Page up, Page down, Home, End keys.
        * @method _moveUsingKeyboard
        * @param {Object} [event] Keyboard event data
        * @private
        **/
        _moveUsingKeyboard: function _moveUsingKeyboard(event) {
            // Prevent slider movement if disabled
            if (this.isSliderDisabled() === true) {
                return;
            }

            var modelNameSpace = MathInteractives.Common.Components.Theme2.Models.Slider,
                model = this.model,
                sliderId = model.get('sliderId'),
                accId = this._getAccId(),
                points = model.get('points'),
                selectedValue = model.get('selectedValue'),
                step = model.get('step'),
                minValue = model.get('minValue'),
                maxValue = model.get('maxValue'),
                bSliderMoved = false,
                msgId = null,
                customAccCallback = model.get('customAccCallback'),
                navigation,
                nextValue,
                nearestValue;

            switch (event.keyCode) {
                // Increment value
                case 38: // Up arrow
                case 39: // Right arrow
                case 33: // Page up
                    {
                        if (points !== null && typeof (points) !== 'undefined' && points.length > 0) {
                            nextValue = this._getNextPoint();
                        }
                        else {
                            nearestValue = this.getUpperNearestPoint(selectedValue);
                            nextValue = (nearestValue > selectedValue) ? nearestValue : this.utils.addDecimalNumber(nearestValue, step);
                        }
                        navigation = modelNameSpace.NAVIGATION.INCREASE;
                        msgId = 2;
                        if (!(bSliderMoved = nextValue <= maxValue)) {
                            nextValue = selectedValue;
                            navigation = modelNameSpace.NAVIGATION.MAX;
                            msgId = 5;
                        }
                    }
                    break;

                    // Decrement value
                case 40: // Down arrow
                case 37: // Left arrow
                case 34: // Page down
                    if (points !== null && typeof (points) !== 'undefined' && points.length > 0) {
                        nextValue = this._getPreviousPoint();
                    }
                    else {
                        nearestValue = this.getLowerNearestPoint(selectedValue);
                        nextValue = (nearestValue < selectedValue) ? nearestValue : this.utils.subtractDecimalNumber(nearestValue, step);
                    }
                    navigation = modelNameSpace.NAVIGATION.DECREASE;
                    msgId = this.isIncDecMsgSame ? 2 : 3;
                    if (!(bSliderMoved = nextValue >= minValue)) {
                        nextValue = selectedValue;
                        navigation = modelNameSpace.NAVIGATION.MIN;
                        msgId = 4;
                    }
                    break;

                    // Snap to minimum value
                case 36: // Home key
                    nextValue = (points !== null && typeof (points) !== 'undefined' && points.length > 0) ? points[0] : minValue;
                    navigation = modelNameSpace.NAVIGATION.MIN;
                    msgId = 4;
                    bSliderMoved = (nextValue !== selectedValue);
                    break;

                    // Snap to maximum value
                case 35: // End key
                    nextValue = (points !== null && typeof (points) !== 'undefined' && points.length > 0) ? points[points.length - 1] : maxValue;
                    navigation = modelNameSpace.NAVIGATION.MAX;
                    msgId = 5;
                    bSliderMoved = (nextValue !== selectedValue);
                    break;
            }
            if (msgId !== null) {
                var containerAccText = this.isScreenIdPresent ? this.getAccMessage(sliderId + '-slider-handle', 0, [nextValue]) : '',
                    currentAccText = '';
                if (customAccCallback !== null && typeof customAccCallback.fnc !== 'undefined' && customAccCallback.fnc !== null) {
                    currentAccText = customAccCallback.fnc.apply(customAccCallback.scope || this, [{
                        navigation: navigation,
                        prevValue: selectedValue,
                        nextValue: nextValue
                    }]);
                }
                else {
                    currentAccText = this.isScreenIdPresent ? this.getAccMessage(sliderId + '-slider-handle', msgId, [nextValue]) : '';
                }
                this._prevAccText = (this._prevAccText === currentAccText) ? currentAccText + ' ' : currentAccText;
                if (this._prevAccText.trim() !== '') {
                    this.setAccMessage(sliderId + '-handle', this._prevAccText);
                }
                event.preventDefault();
                this._setSelfFocus();
                this._keyDownOnHandle(event);
                if (containerAccText.trim() !== '') {
                    this.setAccMessage(model.get('containerId'), containerAccText);
                }
                if (bSliderMoved === true) {
                    this.setSelectedValue(nextValue);
                }
            }
        },

        /**
        * Triggers handle clicked event
        * @method _handleClicked
        * @param {Object} [event] click event
        * @private
        **/
        _sliderHandleClicked: function _sliderHandleClicked(event) {
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDER_HANDLE_CLICK, event);
        },

        /**
        * Informs about key up on handle
        * @method _keyUpOnHandle
        * @param {Object} [event] key up event
        * @private
        **/
        _keyUpOnHandle: function _keyUpOnHandle(event) {
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDER_HANDLE_KEY_UP, event);
        },

        /**
        * Informs about key down on handle
        * @method _keyDownOnHandle
        * @param {Object} [event] key down event
        * @private
        **/
        _keyDownOnHandle: function _keyDownOnHandle(event) {
            this.trigger(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDER_HANDLE_KEY_DOWN, event);
        },

        /**
        * Finds the nearest value to label value from the slider's value set and sets the slider's selected value
        * @method _labelClicked
        * @param {Object} event click event object
        * @private
        **/
        _labelClicked: function _labelClicked(event) {
            if (this.isSliderDisabled() === true) {
                return;
            }
            var model = this.model,
                labelValues = model.get('labelValues'),
                value = labelValues[Number(this.$(event.currentTarget).attr('labelIndex'))],
                points = model.get('points');
            if (points !== null && typeof (points) !== 'undefined') {
                value = this._getNearestPointFromArray(value);
            }
            else {
                value = this._getNearestPoint(value);
            }
            this._isLabelClicked = true;
            this.setSelectedValue(value);
        },

        /**
        * Sets the minimum value of the slider
        * @method setMinValue
        * @param {Number} minValue Value to be set as slider's minimum value
        * @public
        **/
        setMinValue: function setMinValue(minValue) {
            this.model.set('minValue', minValue);
            this._$slider.CustomSlider('option', 'min', minValue);
            if (this.getSelectedValue() < minValue) {
                this.setSelectedValue(minValue);
            }
        },

        /**
        * Gets the minimum value of the slider
        * @method getMinValue
        * @return {Number} Slider's minimum value
        * @public
        **/
        getMinValue: function getMinValue() {
            return this.model.get('minValue');
        },

        /**
        * Sets the maximum value of the slider
        * @method setMaxValue
        * @param {Number} maxValue Value to be set as slider's maximum value
        * @public
        **/
        setMaxValue: function setMaxValue(maxValue) {
            this.model.set('maxValue', maxValue);
            this._$slider.CustomSlider('option', 'max', maxValue);
            if (this.getSelectedValue() > maxValue) {
                this.setSelectedValue(maxValue);
            }
        },

        /**
        * Gets the maximum value of the slider
        * @method getMaxValue
        * @return {Number} Slider's maximum value
        * @public
        **/
        getMaxValue: function getMaxValue() {
            return this.model.get('maxValue');
        },

        /**
        * Sets the step value of the slider
        * @method setStep
        * @param {Number} stepValue Value to be set as slider's step value
        * @public
        **/
        setStep: function setStep(stepValue) {
            this.model.set('step', stepValue);
            if (this.model.get('smoothSliding') === true) {
                stepValue = stepValue / MathInteractives.Common.Components.Theme2.Models.Slider.SLIDER_INTERVAL_DIVIDER;
            }
            this._$slider.CustomSlider('option', 'step', stepValue);
        },

        /**
        * Gets the step value of the slider
        * @method getStep
        * @return {Number} Slider's step value
        * @public
        **/
        getStep: function getStep() {
            return this.model.get('step');
        },

        /**
        * Sets the selected value of the slider
        * @method setSelectedValue
        * @param {Number} selectedValue Value to be set as slider's selected value
        * @public
        **/
        setSelectedValue: function setSelectedValue(selectedValue) {
            var minValue = this.model.get('minValue'),
                maxValue = this.model.get('maxValue');
            if (selectedValue < minValue) {
                selectedValue = minValue;
            }
            else if (selectedValue > maxValue) {
                selectedValue = maxValue;
            }

            this.model.set('nearestValue', selectedValue);
            this.model.set('selectedValue', selectedValue);
        },

        /**
        * Returns the currently selected value of the slider
        * @method getSelectedValue
        * @return {Number} Slider's selected value
        * @public
        **/
        getSelectedValue: function getSelectedValue() {
            return this.model.get('selectedValue');
        },

        /**
        * Returns the currently nearest value of the slider
        * @method getNearestValue
        * @return {Number} Slider's nearest value to slider handle
        * @public
        **/
        getNearestValue: function getNearestValue() {
            return this.model.get('nearestValue');
        },

        /**
        * Disables the slider and handles CSS
        * @method disableSlider
        * @public
        **/
        disableSlider: function disableSlider() {
            var model = this.model,
                $slider, $sliderHandle,
                labelClass,
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

            //Store slider bar and slider handle cursor properties
            $slider = this.$el.find('.ui-slider');
            $sliderHandle = this.$el.find('.ui-slider-handle');

            this.sliderElemCursor = $slider.css('cursor');
            this.sliderHandleElemCursor = $sliderHandle.css('cursor');

            this._$slider.CustomSlider('disable');
            this.$el.addClass('disabled');
            this._$slider.addClass('disabled');
            this._$sliderHandle.addClass('disabled');
            if (model.get('showHandleTooltip') === true) {
                this.handleTooltipView.removeTooltip();
            }
            labelClass = (model.get('labelType') === MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX_BESIDE_SLIDER)
                                ? 'slider-labels-beside-slider' : 'slider-labels';
            this.$('.' + labelClass).addClass('disabled');
            this.enableTab(model.get('containerId'), false);
            this.enableTab(this._getAccId(), false);

            if (!BrowserCheck.isMobile) {
                $slider.css({
                    cursor: "default"
                });

                $sliderHandle.css({
                    cursor: "default"
                });
            }

        },

        /**
        * Enables the slider
        * @public
        * @method enableSlider
        **/
        enableSlider: function enableSlider() {
            var model = this.model,
                $slider, $sliderHandle,
                labelClass,
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            this._$slider.CustomSlider('enable');
            this.$el.removeClass('disabled');
            this._generateTooltip();
            this._$slider.removeClass('disabled');
            this._$sliderHandle.removeClass('disabled');
            labelClass = (model.get('labelType') === MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX_BESIDE_SLIDER)
                                ? 'slider-labels-beside-slider' : 'slider-labels';
            this.$('.' + labelClass).removeClass('disabled');
            this.enableTab(model.get('containerId'), true);
            this.enableTab(this._getAccId(), true);

            if (!BrowserCheck.isMobile) {
                //Store slider bar and slider handle cursor properties
                $slider = this.$el.find('.ui-slider');
                $sliderHandle = this.$el.find('.ui-slider-handle');

                $slider.css({
                    cursor: this.sliderElemCursor
                });

                $sliderHandle.css({
                    cursor: "url('" + this.filePath.getImagePath('open-hand') + "'), move"
                });
            }
        },

        /**
        * Hides the slider
        * @method hideSlider
        * @public
        **/
        hideSlider: function hideSlider() {
            this.$el.hide();
        },

        /**
        * Shows the slider
        * @method showSlider
        * @public
        **/
        showSlider: function showSlider() {
            this.$el.show();
        },

        /**
        * Returns whether slider is disabled or not
        * @method isSliderDisabled
        * @public
        * @return {Boolean}
        **/
        isSliderDisabled: function isSliderDisabled() {
            return this._$slider.CustomSlider("option", 'disabled');
        },

        /**
        * Shows the slider handle tooltip text
        * @method _showHandleTooltip
        * @param {Number} exactValue Slider exact value
        * @param {Number} nearestValue Slider nearest value
        * @param {Boolean} isFromSlideEvent Boolean to check if event is from a slide event
        * @private
        **/
        _showHandleTooltip: function _showHandleTooltip(exactValue, nearestValue, isFromSlideEvent) {
            var model = this.model;
            if (model.get('showHandleTooltip') === true) {
                var customTooltipCallback = model.get('customTooltipCallback'),
                    handleTooltipText;
                if (customTooltipCallback !== null && typeof customTooltipCallback.fnc !== 'undefined' && customTooltipCallback.fnc !== null) {
                    handleTooltipText = customTooltipCallback.fnc.apply(customTooltipCallback.scope || this, [{
                        exactValue: exactValue,
                        nearestValue: nearestValue
                    }]);
                }
                else {
                    var handleTooltipValue,
                        roundedValue;
                    switch (model.get('handleTooltipValueType')) {
                        case MathInteractives.Common.Components.Theme2.Models.Slider.TOOLTIP_VALUE_TYPE.EXACT_VALUE:
                            handleTooltipValue = exactValue;
                            break;
                        case MathInteractives.Common.Components.Theme2.Models.Slider.TOOLTIP_VALUE_TYPE.NEAREST_VALUE:
                            handleTooltipValue = nearestValue;
                            break;
                    }
                    //roundedValue = this._numberPrecision(handleTooltipValue, model.get('handleTooltipTextPrecision'));
                    roundedValue = this.updateMinusSign(handleTooltipValue, model.get('handleTooltipTextPrecision'));
                    handleTooltipText = model.get('handleTooltipText');
                    handleTooltipText = (handleTooltipText === null) ? roundedValue : handleTooltipText.replace('%@$%', roundedValue);
                }
                this.handleTooltipView.changeText(handleTooltipText);

                if ((this._$sliderHandle.hasClass('slider-handle-hover') || isFromSlideEvent || model.isSliderTooltipPermanent() === true)) {
                    var self = this;
                    var tooltipTimer = setTimeout(function () {
                        self.handleTooltipView.showTooltip();
                        clearTimeout(tooltipTimer);
                    }, 1);

                }
            }
        },

        /**
       * Show or Hide Slider tooltip
       * @method showHideTooltip
       * @param {Boolean} isVisible Indicates to show or hide the tooltip
       * @public
       */
        showHideTooltip: function showHideTooltip(isVisible) {
            if (this.handleTooltipView !== null) {
                if (isVisible === true) {
                    this.handleTooltipView.showTooltip();
                }
                else {
                    this.handleTooltipView.hideTooltip();
                }
            }
        },

        /**
        * Manipulates the number by provided precision value
        * @method _numberPrecision
        * @param {Number} number Input number
        * @param {Number} precision precision value
        * @private
        */
        _numberPrecision: function (number, precision) {
            if (precision) {
                number = Number(number);
                precision = Number(precision);
                return Number(number.toFixed(precision));
            }
            else {
                return number;
            }
        },

        /**
        * Changes the slider handle tooltip text
        * @method changeHandleTooltipText
        * @param {String} handleTooltipText Slider handle tooltip text
        * @public
        **/
        changeHandleTooltipText: function changeHandleTooltipText(handleTooltipText) {
            this.model.setTooltipText(handleTooltipText);
        },

        /**
        * Changes acc message
        * @method changeAccMessage
        * @param {String} text
        * @public
        **/
        changeSliderAccMessage: function changeSliderAccMessage(text) {
            var accId = this._getAccId();
            this.setAccMessage(accId, text);
            this._setSelfFocus();
        },

        /* Set focus to same element through to temp div so text can be read by screen reader
        * @method _setSelfFocus
        * @private
        */
        _setSelfFocus: function _setSelfFocus() {
            var accId = this._getAccId();
            //Set Focus directly to dummy div since there is no hack div so setFocus() cannot be used
            this.$('.dummy-slider-focus-div').focus();
            this.setFocus(accId, 0);
        },

        /**
        * Returns accid of handle
        * @method _getAccId
        * @return {String} [accId]
        * @private
        **/
        _getAccId: function _getAccId() {
            var accId = this.model.get('sliderId') + '-handle';
            return accId;
        },

        /**
        * Rounds-off the given value
        * @method _getNearestPoint
        * @param {Number} [value] value to be rounded-off
        * @return {Number} [nearestValue] Rounded-off value
        * @private
        **/
        _getNearestPoint: function _getNearestPoint(value) {
            var step = this.model.get('step'),
                lowerValue = this.getLowerNearestPoint(value),
                upperValue = this.getUpperNearestPoint(value),
                lowerDistance = value - lowerValue,
                upperDistance = upperValue - value,
                nearestValue = (lowerDistance <= upperDistance) ? lowerValue : upperValue;

            if (nearestValue == 0) {
                nearestValue = Math.abs(nearestValue);
            }
            return nearestValue;
        },

        /**
        * Gets the nearest upper slider value from passed value according to step
        * @method getUpperNearestPoint
        * @param {Number} value value
        * @return {Number} Nearest upper slider value from passed value
        * @public
        **/
        getUpperNearestPoint: function getUpperNearestPoint(value) {
            var step = this.model.get('step'),
                lowerValue = this.getLowerNearestPoint(value),
                upperValue = (lowerValue === value) ? value : this.utils.addDecimalNumber(lowerValue, step);
            return upperValue;
        },

        /**
        * Gets the nearest lower slider value from passed value according to step
        * @method getLowerNearestPoint
        * @param {Number} value value
        * @return {Number} Nearest lower slider value from passed value
        * @public
        **/
        getLowerNearestPoint: function getLowerNearestPoint(value) {
            var step = this.model.get('step'),
                minValue = this.model.get('minValue'),
                counter = parseInt(this.utils.subtractDecimalNumber(value, minValue) / step),
                lowerValue = this.utils.addDecimalNumber(minValue, this.utils.multiplyDecimalNumber(counter, step));
            return lowerValue;
        },

        /**
        * Gets the nearest slider value from passed value according to step
        * @method getNearestPoint
        * @param {Number} value value
        * @return {Number} Nearest slider value from passed value
        * @public
        **/
        getNearestPoint: function getNearestPoint(value) {
            return this._getNearestPoint(value);
        },

        /**
        * Returns the point in the array that is closest to the slider value
        * @method _getNearestPointFromArray
        * @return {Number} [nearestValue]
        * @private
        **/
        _getNearestPointFromArray: function _getNearestPointFromArray(sliderValue) {
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
        * @param {Object} [event] keyboard event object
        * @private
        * @return {Boolean} [isKeyBoardEvent]
        **/
        _isKeyBoardEvent: function _isKeyBoardEvent(event) {
            var PAGE_UP_KEY = 33,
                   PAGE_DOWN_KEY = 34,
                   END_KEY = 35,
                   HOME_KEY = 36,
                   LEFT_ARROW_KEY = 37,
                   UP_ARROW_KEY = 38,
                   RIGHT_ARROW_KEY = 39,
                   DOWN_ARROW_KEY = 40;

            var isKeyNavigation = event.which === PAGE_UP_KEY ||
                                  event.which === PAGE_DOWN_KEY ||
                                  event.which === END_KEY ||
                                  event.which === HOME_KEY ||
                                  event.which === LEFT_ARROW_KEY ||
                                  event.which === UP_ARROW_KEY ||
                                  event.which === RIGHT_ARROW_KEY ||
                                  event.which === DOWN_ARROW_KEY;

            return isKeyNavigation;
        },

        /**
        * Finds the next point in the given array of points
        * @method _getNextPoint
        * @private
        * @return {Number} [newValue]
        **/
        _getNextPoint: function _getNextPoint() {
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
        * @private
        * @return {Number} [newValue]
        **/
        _getPreviousPoint: function _getPreviousPoint() {
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
        },

        updateMinusSign: function updateMinusSign(value, valuePrecision) {
            var utils = MathInteractives.Common.Utilities.Models.Utils,
                newValue,
                htmlString = '';

            if (typeof valuePrecision === 'undefined' || valuePrecision === null || typeof valuePrecision !== 'number') {
                //valuePrecision = 0;
                newValue = Math.abs(value);
            }
            else {
                newValue = Math.abs(value).toFixed(valuePrecision);
            }

            if (value < 0) {
                htmlString += utils.getOperatorHtml(utils.OPERATOR.MINUS);
            }

            htmlString += '<span class="text">' + newValue + '</span>';
            return htmlString;
        }

    }, {
        /**
        * Creates a model & view object for the slider given default model properties as a parameter and
        * returns the view object.
        * @method generateSlider
        * @param options {Object}
        * @return {Object} The slider view object.
        */
        generateSlider: function generateSlider(options) {
            if (options !== null && typeof (options) !== 'undefined') {
                var containerId,
                    slider,
                    sliderView;

                containerId = '#' + options.player.getIDPrefix() + options.containerId;
                slider = new MathInteractives.Common.Components.Theme2.Models.Slider(options);
                sliderView = new MathInteractives.Common.Components.Theme2.Views.Slider({ el: containerId, model: slider });

                return sliderView;
            }
        }
    });

    MathInteractives.global.Theme2.Slider = MathInteractives.Common.Components.Theme2.Views.Slider;

})();
