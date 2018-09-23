/*
* jQuery UI Slider 1.8.17
*
* Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* http://docs.jquery.com/UI/Slider
*
* Depends:
*	jquery.ui.core.js
*	jquery.ui.mouse.js
*	jquery.ui.widget.js
*/
(function ($, undefined) {

    // number of pages in a slider
    // (how many times can you page up/down to go through the whole range)

    //*********************** Edited by Rahul Majumdar - ZEUS Systems Pvt Ltd.
    //----- on 12/06/2012
    //to stop the slider handle at specific points, pass all the points in an array with option name points. 
    // ex. points : [2, 3, 6, 9, ...]

    //to give labels for any points in the slider, pass all the labels in an array with option name labels. 
    // ex. labels : ['Label1', 'Label2', 'LabeL3', 'Label4', ...]

    //if labels for any point in the slider is given, id's must also be passed so that their respective ui's can be customised.
    // ex. labelIDs : ['LabelID1', 'LabelID2', 'LabelID3', 'LabelID4', ...]

    //----- on 19/06/2012
    //accessibilty provided. slider can be moved to points specified in points array using up, down, left, right, home, end, page up, page down.

    //----- on 20/07/2012
    //accessibilty requirement -- checked trimAlign requirement in _value() fnc. No need to trim vals when points given.
    //points can be added externally. 
    // ex. $('#CustomSliderID').CustomSlider('options','points',arrayName); 
    // where arrayName can be [2, 3, 4, 5, ...] or [2.3, 4, 5.6, ...] or [] or null.
    //***********************
    if (typeof $.fn.CustomSlider !== 'undefined') {
        return;
    }

    var pages = 5;
    var stopped = false;
    $.widget("ui.CustomSlider", $.ui.mouse, {

        widgetEventPrefix: "slide",

        options: {
            animate: false,
            distance: 0,
            max: 100,
            min: 0,
            orientation: "horizontal",
            range: false,
            step: 1,
            value: 0,
            values: null
        },

        _create: function () {
            var self = this,
			o = this.options,
			existingHandles = this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),
			handle = "<div class='ui-slider-handle ui-state-default ui-corner-all'></div>",
			handleCount = (o.values && o.values.length) || 1,
			handles = [];

            this._keySliding = false;
            this._mouseSliding = false;
            this._animateOff = true;
            this._handleIndex = null;
            this._detectOrientation();
            this._mouseInit();

            this.element
			.addClass("ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" +
				(o.disabled ? " ui-slider-disabled ui-disabled" : ""));

            //*************
            if (o.labels !== undefined) {
                if (o.labelIDs === null) {
                    alert("if labels for any point in the slider is given, id's must also be passed so that their respective ui's can be customised. When creating the slider, pass the id's in the form of an array to an object named -- ' labelsIDs '");
                }
                if (o.labelIDs !== null) {
                    if (o.labelIDs.length !== o.labels.length) {
                        alert("Length of labels and their id's is not equal.");
                    }
                }
                if (o.orientation === "horizontal") {
                    for (var i = 0; i < o.labels.length; i++) {
                        var iDname = '';
                        if (o.labelIDs === null) {
                            iDname = '';
                        }
                        else {
                            iDname = ' id=' + o.labelIDs[i];
                            if (i >= o.labelIDs.length) {
                                iDname = '';
                            }
                        }
                        this.element.append('<div' + iDname + ' class="ui-slider-labels ui-slider-labels-' + o.orientation + (o.disabled ? " .ui-slider-labels-disabled" : "") + '">' + o.labels[i] + '</div>');
                    }

                }
                else {
                    for (var i = o.labels.length - 1; i >= 0; i--) {
                        var iDname = '';
                        if (o.labelIDs === null) {
                            iDname = '';
                        }
                        else {
                            iDname = ' id=' + o.labelIDs[i];
                            if (i >= o.labelIDs.length) {
                                iDname = '';
                            }
                        }
                        this.element.append('<div' + iDname + ' class="ui-slider-labels ui-slider-labels-' + o.orientation + (o.disabled ? " .ui-slider-labels-disabled" : "") + '">' + o.labels[i] + '</div>');
                    }
                }

                //$('.ui-slider-labels-horizontal').css('margin-left', ($('.ui-slider.ui-slider-horizontal.ui-widget.ui-widget-content.ui-corner-all').width() / (o.labels.length + 1)));
                //$('.ui-slider-labels-vertical').css('margin-bottom', ($('.ui-slider.ui-slider-vertical.ui-widget.ui-widget-content.ui-corner-all').height() / (o.labels.length + 1)));
            }
            //*************

            this.range = $([]);

            if (o.range) {
                if (o.range === true) {
                    if (!o.values) {
                        o.values = [this._valueMin(), this._valueMin()];
                    }
                    if (o.values.length && o.values.length !== 2) {
                        o.values = [o.values[0], o.values[0]];
                    }
                }

                this.range = $("<div></div>")
				.appendTo(this.element)
				.addClass("ui-slider-range" +
                // note: this isn't the most fittingly semantic framework class for this element,
                // but worked best visually with a variety of themes
				" ui-widget-header" +
				((o.range === "min" || o.range === "max") ? " ui-slider-range-" + o.range : ""));
            }

            for (var i = existingHandles.length; i < handleCount; i += 1) {
                handles.push(handle);
            }

            this.handles = existingHandles.add($(handles.join("")).appendTo(self.element));

            this.handle = this.handles.eq(0);

            this.handles.add(this.range).filter("div")
			.click(function (event) {
			    event.preventDefault();
			})
			.hover(function () {
			    if (!o.disabled) {
			        $(this).addClass("ui-state-hover");
			    }
			}, function () {
			    $(this).removeClass("ui-state-hover");
			})
			.focus(function () {
			    if (!o.disabled) {
			        $(".ui-slider .ui-state-focus").removeClass("ui-state-focus");
			        $(this).addClass("ui-state-focus");
			    } else {
			        $(this).blur();
			    }
			})
			.blur(function () {
			    $(this).removeClass("ui-state-focus");
			});

            this.handles.each(function (i) {
                $(this).data("index.ui-slider-handle", i);
            });

            this.handles
			.keydown(function (event) {
			    var ret = true,
					index = $(this).data("index.ui-slider-handle"),
					allowed,
					curVal,
					newVal,
					step;

			    if (self.options.disabled) {
			        return;
			    }

			    switch (event.keyCode) {
			        case $.ui.keyCode.HOME:
			        case $.ui.keyCode.END:
			        case $.ui.keyCode.PAGE_UP:
			        case $.ui.keyCode.PAGE_DOWN:
			        case $.ui.keyCode.UP:
			        case $.ui.keyCode.RIGHT:
			        case $.ui.keyCode.DOWN:
			        case $.ui.keyCode.LEFT:
			            ret = false;
			            if (!self._keySliding) {
			                self._keySliding = true;
			                $(this).addClass("ui-state-active");
			                allowed = self._start(event, index);
			                if (allowed === false) {
			                    return;
			                }
			            }
			            break;
			    }

			    step = self.options.step;
			    if (self.options.values && self.options.values.length) {
			        curVal = newVal = self.values(index);
			    } else {
			        curVal = newVal = self.value();
			    }

			    switch (event.keyCode) {
			        case $.ui.keyCode.HOME:
			            newVal = self._valueMin(true);
			            break;
			        case $.ui.keyCode.END:
			            newVal = self._valueMax(true);
			            break;
			        case $.ui.keyCode.PAGE_UP:
			            newVal = self._trimAlignValue(curVal + ((self._valueMax() - self._valueMin()) / pages));
			            break;
			        case $.ui.keyCode.PAGE_DOWN:
			            newVal = self._trimAlignValue(curVal - ((self._valueMax() - self._valueMin()) / pages));
			            break;
			        case $.ui.keyCode.UP:
			        case $.ui.keyCode.RIGHT:
			            if (curVal === self._valueMax()) {
			                return;
			            }
			            if (self.options.points) {
			                newVal = self.pointsValue(true);
			            }
			            else {
			                newVal = self._trimAlignValue(curVal + step);
			            }
			            break;
			        case $.ui.keyCode.DOWN:
			        case $.ui.keyCode.LEFT:
			            if (curVal === self._valueMin()) {
			                return;
			            }
			            if (self.options.points) {
			                newVal = self.pointsValue(false);
			            }
			            else {
			                newVal = self._trimAlignValue(curVal - step);
			            }
			            break;
			    }

			    self._slide(event, index, newVal);

			    return ret;

			})
			.keyup(function (event) {
			    var index = $(this).data("index.ui-slider-handle");

			    if (self._keySliding) {
			        self._keySliding = false;
			        self._stop(event, index);
			        self._change(event, index);
			        $(this).removeClass("ui-state-active");
			    }

			});

            this._refreshValue();

            this._animateOff = false;
        },

        destroy: function () {
            this.handles.remove();
            this.range.remove();

            this.element
			.removeClass("ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-slider-disabled" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all")
			.removeData("slider")
			.unbind(".slider");

            this._mouseDestroy();

            return this;
        },

        _mouseCapture: function (event) {

            var o = this.options,
			position,
			normValue,
			distance,
			closestHandle,
			self,
			index,
			allowed,
			offset,
			mouseOverHandle;

            if (o.disabled) {
                return false;
            }

            this.elementSize = {
                width: this.element.outerWidth(),
                height: this.element.outerHeight()
            };
            this.elementOffset = this.element.offset();

            position = { x: event.pageX, y: event.pageY };
            normValue = this._normValueFromMouse(position);
            distance = this._valueMax() - this._valueMin() + 1;
            self = this;
            this.handles.each(function (i) {
                var thisDistance = Math.abs(normValue - self.values(i));
                if (distance > thisDistance) {
                    distance = thisDistance;
                    closestHandle = $(this);
                    index = i;
                }
            });

            // workaround for bug #3736 (if both handles of a range are at 0,
            // the first is always used as the one with least distance,
            // and moving it is obviously prevented by preventing negative ranges)
            if (o.range === true && this.values(1) === o.min) {
                index += 1;
                closestHandle = $(this.handles[index]);
            }

            allowed = this._start(event, index);
            if (allowed === false) {
                return false;
            }
            this._mouseSliding = true;

            self._handleIndex = index;

            closestHandle
			.addClass("ui-state-active")
			.focus();

            offset = closestHandle.offset();
            mouseOverHandle = !$(event.target).parents().andSelf().is(".ui-slider-handle");
            this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
                left: event.pageX - offset.left - (closestHandle.width() / 2),
                top: event.pageY - offset.top -
				(closestHandle.height() / 2) -
				(parseInt(closestHandle.css("borderTopWidth"), 10) || 0) -
				(parseInt(closestHandle.css("borderBottomWidth"), 10) || 0) +
				(parseInt(closestHandle.css("marginTop"), 10) || 0)
            };

            if (!this.handles.hasClass("ui-state-hover")) {
                this._slide(event, index, normValue);
            }

            this._animateOff = true;
            return true;
        },

        _mouseStart: function (event) {

            return true;
        },

        _mouseDrag: function (event) {

            var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse(position);
            this._slide(event, this._handleIndex, normValue);

            return false;
        },

        _mouseStop: function (event) {

            this.handles.removeClass("ui-state-active");
            this._mouseSliding = false;
            //********
            this._animateOff = false;
            //********
            this._stop(event, this._handleIndex);
            this._change(event, this._handleIndex);

            this._handleIndex = null;
            this._clickOffset = null;
            this._animateOff = false;

            return false;
        },

        _detectOrientation: function () {
            this.orientation = (this.options.orientation === "vertical") ? "vertical" : "horizontal";
        },

        _normValueFromMouse: function (position) {

            var pixelTotal,
			    pixelMouse,
			    percentMouse,
			    valueTotal,
			    valueMouse;

            if (this.orientation === "horizontal") {
                pixelTotal = this.elementSize.width;
                pixelMouse = position.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0);
            } else {
                pixelTotal = this.elementSize.height;
                pixelMouse = position.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0);
            }

            percentMouse = (pixelMouse / pixelTotal);
            if (percentMouse > 1) {
                percentMouse = 1;
            }
            if (percentMouse < 0) {
                percentMouse = 0;
            }
            if (this.orientation === "vertical") {
                percentMouse = 1 - percentMouse;
            }

            valueTotal = this._valueMax() - this._valueMin();
            valueMouse = this._valueMin() + percentMouse * valueTotal;


            return this._trimAlignValue(valueMouse);
        },

        _start: function (event, index) {
            stopped = false;
            var uiHash = {
                handle: this.handles[index],
                value: this.value(),
                points: this.options.points
            };
            if (this.options.values && this.options.values.length) {
                uiHash.value = this.values(index);
                uiHash.values = this.values();
            }

            return this._trigger("start", event, uiHash);
        },

        _slide: function (event, index, newVal) {

            stopped = false;
            var otherVal,
			newValues,
			allowed;
            if (this.options.values && this.options.values.length) {
                otherVal = this.values(index ? 0 : 1);

                if ((this.options.values.length === 2 && this.options.range === true) &&
					((index === 0 && newVal > otherVal) || (index === 1 && newVal < otherVal))
				) {
                    newVal = otherVal;
                }

                if (newVal !== this.values(index)) {
                    newValues = this.values();
                    newValues[index] = newVal;
                    // A slide can be canceled by returning false from the slide callback
                    allowed = this._trigger("slide", event, {
                        handle: this.handles[index],
                        value: newVal,
                        values: newValues
                    });
                    otherVal = this.values(index ? 0 : 1);
                    if (allowed !== false) {
                        this.values(index, newVal, true);
                    }
                }
            } else {
                if (newVal !== this.value()) {
                    // A slide can be canceled by returning false from the slide callback

                    allowed = this._trigger("slide", event, {
                        handle: this.handles[index],
                        value: newVal
                    });
                    if (allowed !== false) {
                        this.value(newVal);
                    }
                }
            }
        },

        _stop: function (event, index) {

            stopped = true;
            var uiHash = {
                handle: this.handles[index],
                value: this.value(),
                points: this.options.points
            };
            if (this.options.values && this.options.values.length) {
                uiHash.value = this.values(index);
                uiHash.values = this.values();
            }

            this._trigger("stop", event, uiHash);
            //*************
            this._refreshValue();
            this._change(null, 0);
            //Shell.AddRemoveApplicationMode(true);
            //*************
        },

        _change: function (event, index) {

            if (!this._keySliding && !this._mouseSliding) {
                var uiHash = {
                    handle: this.handles[index],
                    value: this.value()
                };
                if (this.options.values && this.options.values.length) {
                    uiHash.value = this.values(index);
                    uiHash.values = this.values();
                }

                this._trigger("change", event, uiHash);
            }
        },

        value: function (newValue) {

            if (arguments.length) {
                this.options.value = this._trimAlignValue(newValue);
                this._refreshValue();
                this._change(null, 0);
                return;
            }
            //*************

            var tempVal = this._value();

            if (this.options.points !== undefined && stopped) {
                var extreme = false;
                for (var i = 0; i < this.options.points.length; i++) {
                    if (extreme) {
                        this.options.value = tempVal;
                        return tempVal;
                    }
                    if (tempVal > this.options.points[i] && tempVal < this.options.points[i + 1]) {
                        var x = tempVal - this.options.points[i];
                        var y = this.options.points[i + 1] - tempVal;
                        if (x >= y) {
                            tempVal = this.options.points[i + 1];
                        }
                        else if (x <= y) {
                            tempVal = this.options.points[i];
                        }
                        this.options.value = tempVal;
                        return tempVal;
                    }
                    else {
                        if (tempVal <= this.options.min || tempVal <= this.options.points[0]) {
                            tempVal = this.options.points[0];
                            extreme = true;
                        }
                        else if (tempVal >= this.options.max || tempVal >= this.options.points[this.options.points.length - 1]) {
                            tempVal = this.options.points[this.options.points.length - 1];
                            extreme = true;
                        }
                    }
                }
            }
            this.options.value = tempVal;

            return tempVal;
            //*************
        },
        //******************************************************************************
        pointsValue: function (upOrRight) {
            var tempVal = this._value();
            if (upOrRight) {

                var index = $.inArray(tempVal, this.options.points);

                if (index !== -1) {
                    if ((this.options.points.length - 1) === index) {
                        this.options.value = this.options.points[index];


                        return this.options.points[index];
                    }
                    else {
                        this.options.value = this.options.points[index + 1];


                        return this.options.points[index + 1];
                    }
                }
            }
            else {

                var index = $.inArray(tempVal, this.options.points);

                if (index !== -1) {
                    if (index === 0) {
                        this.options.value = this.options.points[index];

                        return this.options.points[index];
                    }
                    else {
                        this.options.value = this.options.points[index - 1];

                        return this.options.points[index - 1];
                    }
                }
            }
            return tempVal;
        },
        //******************************************************************************
        values: function (index, newValue) {
            var vals,
			    newValues,
			    i;

            if (arguments.length > 1) {
                this.options.values[index] = this._trimAlignValue(newValue);
                this._refreshValue();
                this._change(null, index);
                return;
            }

            if (arguments.length) {
                if ($.isArray(arguments[0])) {
                    vals = this.options.values;
                    newValues = arguments[0];
                    for (i = 0; i < vals.length; i += 1) {
                        vals[i] = this._trimAlignValue(newValues[i]);
                        this._change(null, i);
                    }
                    this._refreshValue();
                } else {
                    if (this.options.values && this.options.values.length) {
                        return this._values(index);
                    } else {
                        return this.value();
                    }
                }
            } else {
                return this._values();
            }
        },

        _setOption: function (key, value) {
            var i,
			    valsLength = 0;
            if ($.isArray(this.options.values)) {
                valsLength = this.options.values.length;
            }

            $.Widget.prototype._setOption.apply(this, arguments);

            switch (key) {
                case "disabled":
                    var disable = true;
                    if (value) {
                        this.handles.filter(".ui-state-focus").blur();
                        this.handles.removeClass("ui-state-hover");
                        disable = true;
                        this.element.addClass("ui-disabled");
                    } else {
                        disable = false;
                        this.element.removeClass("ui-disabled");
                    }

                    //Check for presence of propAttr method in jquery
                    if (typeof $.fn.propAttr !== 'undefined') {
                        this.handles.propAttr("disabled", disable);
                    } else {
                        this.handles.attr("disabled", disable);
                    }
                    break;
                case "orientation":
                    this._detectOrientation();
                    this.element
					.removeClass("ui-slider-horizontal ui-slider-vertical")
					.addClass("ui-slider-" + this.orientation);
                    this._refreshValue();
                    break;
                case "value":
                    this._animateOff = true;
                    this._refreshValue();
                    this._change(null, 0);
                    this._animateOff = false;
                    break;
                case "values":
                    this._animateOff = true;
                    this._refreshValue();
                    for (i = 0; i < valsLength; i += 1) {
                        this._change(null, i);
                    }
                    this._animateOff = false;
                    break;
                case "points":
                    this.options.points = value;
                    break;
            }
        },

        //internal value getter
        // _value() returns value trimmed by min and max, aligned by step
        _value: function () {
            var val = this.options.value;
            if (!this.options.points) {
                val = this._trimAlignValue(val);
            }
            return val;
        },

        //internal values getter
        // _values() returns array of values trimmed by min and max, aligned by step
        // _values( index ) returns single value trimmed by min and max, aligned by step
        _values: function (index) {
            var val,
			    vals,
			    i;

            if (arguments.length) {
                val = this.options.values[index];
                val = this._trimAlignValue(val);

                return val;
            } else {
                // .slice() creates a copy of the array
                // this copy gets trimmed by min and max and then returned
                vals = this.options.values.slice();
                for (i = 0; i < vals.length; i += 1) {
                    vals[i] = this._trimAlignValue(vals[i]);
                }

                return vals;
            }
        },

        // returns the step-aligned value that val is closest to, between (inclusive) min and max
        _trimAlignValue: function (val) {

            if (val <= this._valueMin()) {
                return this._valueMin();
            }
            if (val >= this._valueMax()) {
                return this._valueMax();
            }
            var step = (this.options.step > 0) ? this.options.step : 1,
			valModStep = (val - this._valueMin()) % step,
			alignValue = val - valModStep;

            if (Math.abs(valModStep) * 2 >= step) {
                alignValue += (valModStep > 0) ? step : (-step);
            }

            // Since JavaScript has problems with large floats, round
            // the final value to 5 digits after the decimal point (see #4124)
            return parseFloat(alignValue.toFixed(5));
        },

        _valueMin: function (bHomePressed) {
            var min = this.options.min;
            if (this.options.points && bHomePressed) {
                min = this.options.points[0];
            }
            return min;
        },

        _valueMax: function (endPressed) {
            var max = this.options.max;
            if (this.options.points && endPressed) {
                max = this.options.points[this.options.points.length - 1];
            }
            return max;
        },

        _refreshValue: function () {
            var oRange = this.options.range,
			    o = this.options,
			    self = this,
			    animate = (!this._animateOff) ? o.animate : false,
			    valPercent,
			    _set = {},
			    lastValPercent,
			    value,
			    valueMin,
			    valueMax;
            if (this.options.values && this.options.values.length) {
                this.handles.each(function (i, j) {
                    valPercent = (self.values(i) - self._valueMin()) / (self._valueMax() - self._valueMin()) * 100;
                    _set[self.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
                    $(this).stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
                    if (self.options.range === true) {
                        if (self.orientation === "horizontal") {
                            if (i === 0) {
                                self.range.stop(1, 1)[animate ? "animate" : "css"]({ left: valPercent + "%" }, o.animate);
                            }
                            if (i === 1) {
                                self.range[animate ? "animate" : "css"]({ width: (valPercent - lastValPercent) + "%" }, { queue: false, duration: o.animate });
                            }
                        } else {
                            if (i === 0) {
                                self.range.stop(1, 1)[animate ? "animate" : "css"]({ bottom: (valPercent) + "%" }, o.animate);
                            }
                            if (i === 1) {
                                self.range[animate ? "animate" : "css"]({ height: (valPercent - lastValPercent) + "%" }, { queue: false, duration: o.animate });
                            }
                        }
                    }
                    lastValPercent = valPercent;
                });
            } else {
                value = this.value();
                valueMin = this._valueMin();
                valueMax = this._valueMax();
                valPercent = (valueMax !== valueMin) ?
					(value - valueMin) / (valueMax - valueMin) * 100 :
					0;
                _set[self.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
                this.handle.stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
                if (oRange === "min" && this.orientation === "horizontal") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({ width: valPercent + "%" }, o.animate);
                }
                if (oRange === "max" && this.orientation === "horizontal") {
                    this.range[animate ? "animate" : "css"]({ width: (100 - valPercent) + "%" }, { queue: false, duration: o.animate });
                }
                if (oRange === "min" && this.orientation === "vertical") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({ height: valPercent + "%" }, o.animate);
                }
                if (oRange === "max" && this.orientation === "vertical") {
                    this.range[animate ? "animate" : "css"]({ height: (100 - valPercent) + "%" }, { queue: false, duration: o.animate });
                }
            }
        }

    });

    $.extend($.ui.CustomSlider, {
        version: "1.8.17"
    });
    //    $.extend($.ui.slider.prototype.options, {
    //        dragAnimate: true
    //    });

    //    var _mouseCapture = $.ui.slider.prototype._mouseCapture;
    //    $.widget("ui.slider", $.extend({}, $.ui.slider.prototype, {
    //        _mouseCapture: function (event) {
    //            _mouseCapture.apply(this, arguments);
    //            this.options.dragAnimate ? this._animateOff = false : this._animateOff = true;
    //            return true;
    //        }
    //    }))
}(jQuery));
