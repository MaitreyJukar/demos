/* globals _, $, window  */

(function(MathUtilities) {
    'use strict';


    /**
     * A customized Backbone.View that holds the logic behind the presentation of CoustomSlider.
     * @class sliderView
     * @constructor
     * @namespace  MathUtilities.Components.Slider.Views
     * @extends Backbone.View
     */
    MathUtilities.Components.Slider.Views.slider = Backbone.View.extend({

        /**
         * @property model
         * @type Object
         * @default null
         */
        "model": null,

        /**
         * Instantiates slider model and Triggers render call.
         * @method initialize
         */
        "initialize": function initialize() {

            var optionValues = this.options.option,
                min = optionValues.min,
                max = optionValues.max,
                val = optionValues.val,
                step = optionValues.step,
                currValueHide = optionValues.currValueHide,
                sliderName = optionValues.sliderName,
                orientation = optionValues.orientation,
                valueDisplay = optionValues.valueDisplay,
                stepFunctionality = optionValues.stepFunctionality,
                ellipsesLimit = optionValues.ellipsesLimit;

            this.model = new MathUtilities.Components.Slider.Models.slider();

            if (typeof min !== 'undefined') {
                this.model.set({
                    "min": min
                });
            }

            if (typeof val !== 'undefined') {
                this.model.set({
                    "val": val
                });
                this.model.set('currValue', val);
            }
            if (typeof step !== 'undefined') {
                this.model.set({
                    "step": step
                });
            }
            if (typeof max !== 'undefined') {
                this.model.set({
                    "max": max
                });
            }
            if (currValueHide === true) {
                this.model.set({
                    "currValueHide": true
                });
            }
            if (typeof sliderName !== 'undefined') {
                this.model.set({
                    "sliderName": sliderName
                });
            }
            if (typeof orientation !== "undefined") {
                this.model.set({
                    "orientation": orientation
                });
            }
            if (typeof valueDisplay !== 'undefined') {
                this.model.set({
                    "valueDisplay": valueDisplay
                });
            }
            if (typeof stepFunctionality !== 'undefined') {
                this.model.set({
                    "stepFunctionality": stepFunctionality
                });
            }
            if (typeof ellipsesLimit !== 'undefined') {
                this.model.set({
                    "ellipsesLimit": ellipsesLimit
                });
            }
            this.render();
        },

        /**
         * Inserts slider into DOM and binds event on the min and max value of slider and trigger custom event change.
         * Insert current Value display div in the Dom.
         * @method render
         * @chainable
         * @return {Object}
         */
        "render": function() {

            var $el = this.$el,
                model = this.model,
                min = model.get('min'),
                max = model.get('max'),
                val = model.get('val'),
                orientation = model.get('orientation'),
                valueDisplay = model.get('valueDisplay'),
                stepFunctionality = model.get('stepFunctionality'),
                noOfDigitsToShow = model.get('ellipsesLimit'),
                $minValue, $maxValue,
                $sliderContainer,
                sliderBackground,
                sliderBackgroundClass,
                $sliderHandleContainer,
                STEP_MIN = 0.99,
                self = this,
                SliderTemplateNamespace = MathUtilities.Components.Slider.templates;


            if (min > max) {

                min = -10;
                max = 10;
                val = 0;
            }

            if (orientation === 'vertical') {
                $el.append(SliderTemplateNamespace.slider({
                    "val": val,
                    "min": min,
                    "max": max,
                    "orientClass": 'slider-vertical',
                    "min-value": 'min-value-vertical',
                    "max-value": 'max-value-vertical'
                }).trim());
            } else {
                $el.append(SliderTemplateNamespace.slider({
                    "val": val,
                    "min": min,
                    "max": max,
                    "orientClass": 'slider-horizontal',
                    "min-value": 'min-value-horizontal',
                    "max-value": 'max-value-horizontal'
                }).trim());
            }

            if (!valueDisplay) {
                this.$('.limit-value').hide();
            }

            if (this.model.get('currValueHide') === true) {
                this.$('.curr-slider-value').hide();
            }
            /*eslint-disable new-cap*/
            $.fn.EnableTouch($el);
            $sliderContainer = this.$('.slider-container');
            $sliderContainer.CustomSlider({

                "value": model.get('val'),
                "orientation": model.get('orientation'),
                "min": model.get('min'),
                "max": model.get('max'),
                "step": model.get('step'),
                "stop": _.bind(function() {

                    var currValue = $sliderContainer.CustomSlider('option', 'value'),
                        step = model.get('step'),
                        maxValue = model.get('max'),
                        minValue = model.get('min');
                    if (step > STEP_MIN) {
                        currValue = Math.round(currValue / step) * step;
                    } else {
                        currValue = Math.ceil(currValue / step) * step;
                        currValue = parseFloat(currValue).toFixed(String(step).length - 1);
                        currValue = Number(currValue);
                    }
                    if (currValue > maxValue) {
                        currValue = maxValue;
                    } else if (currValue < minValue) {
                        currValue = minValue;
                    }

                    model.set({
                        "currValue": currValue
                    });
                    $sliderContainer.CustomSlider('option', 'value', currValue);
                    $el.trigger('change').trigger('stop').trigger('slider-stop');

                }, this),

                "start": _.bind(function() {

                    var currValue = $sliderContainer.CustomSlider('option', 'value');
                    model.set({
                        "currValue": currValue
                    });
                    $el.trigger('change').trigger('start').trigger('slider-start');
                }, this),

                "slide": _.bind(function() {

                    _.delay(_.bind(function() {

                        var currValue = $sliderContainer.CustomSlider('option', 'value'),
                            step = model.get('step'),
                            maxValue = model.get('max'),
                            minValue = model.get('min'),
                            decimalDigits;
                        $sliderContainer.CustomSlider('option', 'value', currValue);

                        if (step > STEP_MIN) {

                            currValue = Math.round(currValue / step) * step;
                            decimalDigits = String(step).split('.')[1] || '';
                            decimalDigits = decimalDigits.length;

                            if (decimalDigits) {
                                currValue = parseFloat(currValue).toFixed(decimalDigits);
                            }
                            currValue = Number(currValue);
                        } else {

                            currValue = Math.ceil(currValue / step) * step;
                            currValue = parseFloat(currValue).toFixed(String(step).length - 1);
                            currValue = Number(currValue);
                        }

                        if (currValue > maxValue) {
                            currValue = maxValue;
                        } else if (currValue < minValue) {
                            currValue = minValue;
                        }
                        model.set({
                            "currValue": currValue
                        });
                        this.$('.curr-slider-value').html(currValue);
                        $el.trigger('change').trigger('slide').trigger('slider-slide', true);
                    }, this), 0);
                }, this)
            });
            $.fn.EnableTouch($el);
            $sliderHandleContainer = this.$('.slider-container .ui-slider-handle');
            sliderBackground = this.options.option.sliderBackground;
            sliderBackgroundClass = this.options.option.addClass;
            $sliderHandleContainer.html(SliderTemplateNamespace['slider-handle']({
                "val": val,
                "min": min,
                "max": max
            }).trim());
            $.support.touch = true;
            $.fn.EnableTouch(".sliderH");
            if (stepFunctionality) {
                this.$('.limit-value').on('click', _.bind(this.showMinMax, this));
            }

            if (typeof sliderBackground !== 'undefined') {

                if (sliderBackground.isSliderContainerImageSlice) {
                    if (orientation === 'vertical') {
                        $sliderContainer.append(SliderTemplateNamespace['slider-image-container']({
                            "type": 'vertical'
                        }).trim());
                    } else {
                        $sliderContainer.append(SliderTemplateNamespace['slider-image-container']({
                            "type": 'horizontal'
                        }).trim({
                            "type": 'horizontal'
                        }));
                    }
                    this.$('.image-container-left').css('background-image', 'url(' + sliderBackground.sliderContainerLeftImage + ')');
                    this.$('.image-container-middle').css('background-image', 'url(' + sliderBackground.sliderContainerMiddleImage + ')');
                    this.$('.image-container-right').css('background-image', 'url(' + sliderBackground.sliderContainerRightImage + ')');
                } else {
                    if (typeof sliderBackground.sliderContainerImage !== 'undefined') {
                        $sliderContainer.css('background-image', 'url(' + this.options.option.sliderBackground.sliderContainerImage + ')');
                    }
                }
                if (typeof sliderBackground.sliderHeaderImage !== 'undefined') {
                    this.$('.sliderH').css('background-image', 'url(' + this.options.option.sliderBackground.sliderHeaderImage + ')');
                }
                if (typeof sliderBackground.sliderHeaderImageOnMouseOver !== 'undefined') {
                    this.$('.sliderH').mouseover(function() {
                            $(this).css('background-image', 'url(' + self.options.option.sliderBackground.sliderHeaderImageOnMouseOver + ')');
                        })
                        .mouseout(function() {
                            $(this).css('background-image', 'url(' + self.options.option.sliderBackground.sliderHeaderImage + ')');
                        });
                }
            } else if (sliderBackgroundClass) {
                if (orientation === 'vertical') {
                    $sliderContainer.append(SliderTemplateNamespace['slider-image-container']({
                        "type": 'vertical'
                    }).trim());
                } else {
                    $sliderContainer.append(SliderTemplateNamespace['slider-image-container']({
                        "type": 'horizontal'
                    }).trim({
                        "type": 'horizontal'
                    }));
                }
                this.$('.sliderH,.image-container-left,.image-container-middle,.image-container-right').addClass(sliderBackgroundClass);

            }
            $minValue = this.$('.min-value');
            $maxValue = this.$('.max-value');
            this.addEllipsesToText($minValue, noOfDigitsToShow);
            this.addEllipsesToText($maxValue, noOfDigitsToShow);
            return this;
            /*eslint-enable new-cap*/
        },

        /**
         * Gives the option to change lower and upper limit of slider, hide the slider, add the limit-change div to the dom  and binds event on the keypress.
         * @method showMinMax
         * @private
         * @param {Object} current Event
         * @chainable
         */
        "showMinMax": function showMinMax(event) {

            var $el = this.$el,
                prevMinValue = this.model.get('min'),
                prevMaxValue = this.model.get('max'),
                prevStepValue = this.model.get('step'),
                maxValueChange,
                minValueChange,
                stepValueChange,
                sliderName = this.model.get('sliderName');


            this.$('.slider-div').hide();
            this.$('.limit-change').remove();
            $el.append(MathUtilities.Components.Slider.templates['limit-change']({
                "min": prevMinValue,
                "max": prevMaxValue,
                "sliderName": sliderName
            }).trim());

            maxValueChange = this.$('.max-value-change').val(prevMaxValue);
            minValueChange = this.$('.min-value-change').val(prevMinValue);
            stepValueChange = this.$('.slider-step').val(prevStepValue);

            maxValueChange.off('click', this._setFocusToInput).on('click', this._setFocusToInput).off('focusout.slider')
                .on('focusout.slider', _.bind(this.changeLimitsOfSlider, this));
            minValueChange.off('click', this._setFocusToInput).on('click', this._setFocusToInput).off('focusout.slider')
                .on('focusout.slider', _.bind(this.changeLimitsOfSlider, this));
            stepValueChange.off('click', this._setFocusToInput).on('click', this._setFocusToInput).off('focusout.slider')
                .on('focusout.slider', _.bind(this.changeLimitsOfSlider, this));
            if ($(event.target).hasClass('min-value')) {
                minValueChange.select();
            } else {
                maxValueChange.select();
            }
            $el.trigger('limitChangeStart');
            this.$('.limit-change').on('keypress', _.bind(this.changeLimitsOfSlider, this));

        },

        "_setFocusToInput": function _setFocusToInput() {
            $(this).focus();
        },

        /**
         * On enterKey changes the value changes the limits of slider and trigger custom event change
         * @method changeLimitsOfSlider
         * @private
         * @param {Object} current Event
         */
        "changeLimitsOfSlider": function(event) {
            if (event.keyCode === 13 || event.type === 'focusout') { //keycode '13' is for Enter key

                var $el = this.$el,
                    val = null,
                    $target = $(event.target).parents('.limit-change'),
                    min = $target.find('.min-value-change').val(),
                    max = $target.find('.max-value-change').val(),
                    step = $target.find('.slider-step').val(),
                    sliderContainer = null,
                    $minValue,
                    STEP_MIN = 0.0001,
                    STEP_MAX = 0.1,
                    $maxValue, NO_OF_DIGITS_TO_SHOW = 4,
                    sliderName = this.model.get('sliderName');
                if (step <= 0) {
                    return;
                }
                if (step === '') {
                    step = STEP_MAX;
                } else {
                    if (step > STEP_MIN) {
                        step = Number(step);
                    }
                }

                if (isNaN(min) === false && isNaN(max) === false) {

                    if (min !== '' && max !== '') {

                        max = Number(max);
                        min = Number(min);


                        if (min < max && step < max - min) {

                            sliderContainer = this.$('.slider-container');
                            val = sliderContainer.CustomSlider('option', 'value');
                            if (val > max) {
                                val = max;
                            }
                            if (val < min) {
                                val = min;
                            }
                            this.model.parseData(min, max, step, val);

                            this.model.set({
                                "currValue": val
                            });
                            $el.trigger('change').trigger('limitChangeStop');


                            sliderContainer.CustomSlider('option', 'min', min);
                            sliderContainer.CustomSlider('option', 'max', max);
                            sliderContainer.CustomSlider('option', 'value', val);
                            // to avoid snapping with large step values
                            if (step < STEP_MAX && step > STEP_MIN) {
                                sliderContainer.CustomSlider('option', 'step', step);
                            }
                            $minValue = this.$('.min-value');
                            $maxValue = this.$('.max-value');
                            $minValue.html(min);
                            $maxValue.html(max);
                            this.$('.curr-slider-value').html(val);
                            this.addEllipsesToText($minValue, NO_OF_DIGITS_TO_SHOW);
                            this.addEllipsesToText($maxValue, NO_OF_DIGITS_TO_SHOW);
                        }
                    }
                }
                this.model.set('sliderName', sliderName);
                if (event.type !== 'focusout') {
                    this.$('.limit-change').remove();
                    this.$('.slider-div').show();
                }
            }

        },

        /**
         * Adds ellipses on big file names.
         *
         */
        "addEllipsesToText": function addEllipsesToText(oJqueryObjToTrim, noOfDigitsToShow) {
            var $currentOption = $(oJqueryObjToTrim),
                currentOptionValue = $currentOption.html(),
                valueLength = null,
                newOptionValue = null;
            $currentOption.removeAttr('actual-value');
            $currentOption.removeClass('ellipses-text');
            if (currentOptionValue !== null && typeof currentOptionValue !== 'undefined') {
                valueLength = currentOptionValue.length;
                newOptionValue = currentOptionValue;
                if (currentOptionValue.indexOf('-') !== -1) {
                    noOfDigitsToShow++;
                }
                if (valueLength >= noOfDigitsToShow) {
                    $currentOption.addClass('ellipses-text');
                    $currentOption.attr('actual-value', currentOptionValue);
                    newOptionValue = $currentOption.html();
                    newOptionValue = newOptionValue.substring(0, noOfDigitsToShow - 1) + '...';
                    $currentOption.html(newOptionValue);
                    $currentOption.addClass('min-value-ellipses');
                }
            }
        },

        /**      
         * return the value based on the input parameter string.
         * @method get
         * @public
         * @param string getValue
         * @return Integer
         */
        "get": function(getValue) {

            switch (getValue) {

                case 'min':
                    return this.model.get('min');
                case 'max':
                    return this.model.get('max');
                case 'val':
                    return this.model.get('val');
                case 'step':
                    return this.model.get('step');
                case 'currValue':
                    return this.model.get('currValue');

            }
        },

        /**   
         * set the position for slider-header.
         * @method set
         * @public
         * @param Integer setValue
         */
        "set": function(setValue, suppressEvent) {

            var $el = this.$el;
            this.model.set({
                "val": setValue
            });
            this.model.set('currValue', setValue);
            this.$('.slider-container').CustomSlider('option', 'value', setValue);
            this.$('.curr-slider-value').html(setValue);
            if (!suppressEvent) {
                $el.trigger('change').trigger('slide').trigger('slider-slide');
            }
        },

        /**   
         * To set the min,max,step values of slider.
         * @method setLimits
         * @public
         * @param {object} array of values.
         */
        "setLimits": function setLimits(limitValues) {
            var $el = this.$el,
                ellipsesLimit = this.model.get('ellipsesLimit'),
                sliderContainer,
                val = this.get('val');
            this.model.parseData(limitValues[0], limitValues[1], limitValues[2], val);

            sliderContainer = this.$('.slider-container');

            this.model.set({
                "currValue": val
            });
            sliderContainer.CustomSlider('option', 'val', val);
            sliderContainer.CustomSlider('option', 'min', limitValues[0]);
            sliderContainer.CustomSlider('option', 'max', limitValues[1]);
            if (limitValues[2] !== void 0) {
                sliderContainer.CustomSlider('option', 'step', limitValues[2]);
            }
            this.set(val, true);
            this.$('.min-value').html(limitValues[0]);
            this.$('.max-value').html(limitValues[1]);
            this.addEllipsesToText(this.$('.min-value'), ellipsesLimit);
            this.addEllipsesToText(this.$('.max-value'), ellipsesLimit);
            $el.trigger('change');
        }
    });
}(window.MathUtilities));
