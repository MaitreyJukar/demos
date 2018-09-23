(function () {
    'use strict';
    var numberlineClass = null;
    /**
    * Class for number line generation ,contains properties and methods for generating number-line.
    * @namespace MathInteractives.Common.Interactivities.VirusZapper.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.VirusZapper.Views.NumberLine = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores filepaths for resources , value set on initialize
        *   
        * @property filePath 
        * @type Object
        * @default null
        **/
        filePath: null,


        /**
        * Stores manager instance for using common level functions , value set on initialize
        *
        * @property manager 
        * @type Object
        * @default null
        **/
        manager: null,

        /**
        * Stores reference to player , value set on initialize
        * 
        * @property player 
        * @type Object
        * @default null
        **/
        player: null,

        /**
        * id-prefix of the interactive , value set on initialize
        * 
        * @property idPrefix 
        * @type String
        * @default null
        **/
        idPrefix: null,


        /**
        * store theme2 number line view
        * 
        * @property theme2NumberLineView 
        * @type object
        * @default null
        **/
        theme2NumberLineView: null,

        /**
        * Minimum value on the number line
        * @property minValue
        * @type Number
        * @default null
        */
        minValue: null,

        /**
        * Maximum value on the number line
        * @property maxValue
        * @type Number
        * @default null
        */
        maxValue: null,


        /**
        * Line Width
        * @property lineLength
        * @type Number
        * @default null
        */
        lineLength: null,

        /**
        * Line Length
        * @property lineWidth
        * @type Number
        * @default null
        */
        lineWidth: null,

        /**
        * Tick Mark Height
        * @property tickHeight
        * @type Number
        * @default 11
        */
        tickHeight: null,


        /**
        * Center Tick Height
        * @property centerTickHeight
        * @type Number
        * @default 21
        */
        centerTickHeight: null,

        /**
        * Interval Between ticks 
        * @property tickInterval
        * @type Number
        * @default null
        */
        tickInterval: null,

        /**
        * Total number of parts/divisions of line.
        * @property numberOfIntervals
        * @type number
        * @default ''
        */
        numberOfIntervals: null,

        /**
        * line color
        * @property lineColor
        * @type string
        * @default null
        */
        lineColor: null,

        /**
        * text color
        * @property textColor
        * @type string
        * @default null
        */
        textColor: null,

        /**
        * Stores whether the range on number line is clicked or not.
        * @property isRangeclicked
        * @type Boolean
        * @default null
        */
        isRangeclicked: false,


        /**
        * Stores levels in virus zapper 2.
        * @property level
        * @type number
        * @default null
        */
        level: 2,

        /**
        * Stores virus zapper events.
        * @property virusZapperEvents
        * @type object
        * @default null
        */
        virusZapperEvents: null,

        /**
        * Stores virus zapper class.
        * @property virusZapperClass
        * @type object
        * @default null
        */
        virusZapperClass: null,

        /**
        * Check for which toolTip is first or not.
        * @property firstToolTip
        * @type number
        * @default false
        */
        firstToolTip: false,

        /**
        * Stores views of generated tooltips.
        * @property toolTipViewArray
        * @type array
        * @default null
        */
        toolTipViewArray: null,

        /**
        * Stores position for all tooltips.
        * @property toolTipPosition
        * @type array
        * @default null
        */
        toolTipPosition: null,
        toolTipData: {},
        toolTipLevel4Data: {},
        toolTipPlacedPoints: null,
        /**
        * stores clicked minimum value
        *
        * @property clickMinVal
        * @type number
        * @default null
        **/
        clickMinVal: null,
        /**
        * stores clicked maximum value
        *
        * @property clickMaxVal
        * @type number
        * @default null
        **/
        clickMaxVal: null,

        level4CornerClickSecondLastDigit: 0,
        /**
        * Initializes number line
        *
        * @method initialize
        * @public 
        **/
        initialize: function () {
            this.player = this.model.get('player');
            this.filePath = this.player.getPath();
            this.manager = this.player.getManager();
            this.idPrefix = this.player.getIDPrefix();
            this.virusZapperClass = MathInteractives.Common.Interactivities.VirusZapper.Views.VirusZapper;
            this.virusZapperEvents = this.virusZapperClass.Events;
            this.render();
            if (this.isAccessible()) {
                this.loadScreen('number-line-acc-screen');
            }
        },

        /**
        * Renders the view of number line
        *
        * @method render
        * @public 
        **/
        render: function () {
            var options, $numberLineContainer;
            options = { idPrefix: this.idPrefix };
            $numberLineContainer = this.$el;
            $numberLineContainer.append(MathInteractives.Common.Interactivities.VirusZapper.templates.numberLine(options).trim());
            //            var img1 = this.filePath.getImagePath('star');
            //            this.starImg = img1;
            $numberLineContainer.find('.zapped-virus').hide();
            this.textStyle = {
                strokeWidth: 1,
                strokeColor: '#222222',
                fontSize: 14,
                font: 'Verdana'
            };

            this.numberOfIntervals = this.model.get('numberOfIntervals');
            this.lineWidth = this.model.get('lineWidth');
            this.lineLength = this.model.get('lineLength');
            this.lineColor = this.model.get('color');
            this.textColor = this.model.get('textColor');
            this.tickHeight = this.model.get('tickHeight');
            this.centerTickHeight = this.model.get('centerTickHeight');
            this.showInitialNumberLine();

            this.loadScreen('number-line-acc-screen');
            this.toolTipViewArray = [];
            this.toolTipId = 0;
            //theme2NumberLine.model.changeNumberLine({color: 'green', textColor : 'blue', numberOfIntervals : 2});

        },

        /**
        * Renders number line with specified parameters.
        *
        * @method showInitialNumberLine
        * @public 
        **/
        showInitialNumberLine: function () {
            this.numberOfIntervals = 20;
            var $theme2NumberLineContainer, theme2NumberLine, highlightData;
            $theme2NumberLineContainer = $('#' + this.idPrefix + 'line-container');
            theme2NumberLine = MathInteractives.Common.Components.Theme2.Views.NumberLine;
            if (this.theme2NumberLineView && this.theme2NumberLineView.canvasAcc) {
                var $canvasEl = this.theme2NumberLineView.canvasAcc.el;
                $($canvasEl).find('#' + this.idPrefix + 'number-line-acc-divtemp-focus-div').remove();
                this.theme2NumberLineView.canvasAcc.remove();
                this.$el.before($canvasEl);
            }
            this.theme2NumberLineView = new theme2NumberLine.generateNumberLine({
                player: this.player,
                containerId: $theme2NumberLineContainer,
                length: this.lineLength,
                ticksClickable: false,
                color: this.lineColor,
                textColor: this.textColor,
                tickHeight: this.tickHeight,
                centerTickHeight: this.centerTickHeight,
                textStyle: this.textStyle,
                tickLength: 12,
                tickWidth: 3,
                arrowWidth: 13,
                textPadding: 16,
                hacDivId: 'number-line-acc-div',
                highlightData: { height: 30, color: '#ff0000', opacity: 0.2, highlightPath: false, highlightHitArea: true },
                tickHitAreaDimentions: { width: 30, height: 30 }
            });
            //Appending holder for star
            var $starHolder = $('<div id="' + this.idPrefix + 'starHolder" class="starHolder"></div>');
            var $helpHolder = $('<div id="' + this.idPrefix + 'help-center" class="help-center"></div>');
            $helpHolder.prependTo($theme2NumberLineContainer);
            $starHolder.appendTo($theme2NumberLineContainer);


            this.minValue = this.theme2NumberLineView.model.get('minValue');
            this.maxValue = this.theme2NumberLineView.model.get('maxValue');

            this._attachEvents();
        },

        /**
        * Binds events on elements
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var self = this;
            var theme2NumberLine = MathInteractives.Common.Components.Theme2.Views.NumberLine;
            this.theme2NumberLineView.model.off(theme2NumberLine.Events.RANGE_CLICK).on(theme2NumberLine.Events.RANGE_CLICK, $.proxy(this.generteZoomedLine, this));
            this.theme2NumberLineView.model.off(theme2NumberLine.Events.TICK_CLICK).on(theme2NumberLine.Events.TICK_CLICK, $.proxy(this.checkAnswer, this));
            this.theme2NumberLineView.model.off(theme2NumberLine.Events.RANGE_TAB).on(theme2NumberLine.Events.RANGE_TAB, $.proxy(this.changeNumberLineAcc, this));
            this.theme2NumberLineView.model.off(theme2NumberLine.Events.FOCUS_OUT).on(theme2NumberLine.Events.FOCUS_OUT, $.proxy(this.setNumberLineAccOnFocusOut, this));
            this.theme2NumberLineView.model.off(theme2NumberLine.Events.ANIMATION_COMPLETE)
                .on(theme2NumberLine.Events.ANIMATION_COMPLETE, $.proxy(this.createPopup, this))
                .on(theme2NumberLine.Events.ANIMATION_COMPLETE, $.proxy(function (event) {
                    this.model.trigger('animation-complete');
                    this.setAccMessage('number-line-acc-div', this.accMsgAfterPopup);
                }, this));
            this.theme2NumberLineView.model.off(theme2NumberLine.Events.ANIMATION_PROGRESS)
                .on(theme2NumberLine.Events.ANIMATION_PROGRESS, $.proxy(function (event) {
                    this.model.trigger('animation-progress', $.extend(event, { minValue: self.clickMinVal, maxValue: self.clickMaxVal, startVal: self.minValue, endVal: self.maxValue }));
                }, this));
            //this.theme2NumberLineView.model.off(theme2NumberLine.Events.ANIMATION_COMPLETE)
            //    .on(theme2NumberLine.Events.ANIMATION_COMPLETE, $.proxy(function (event) {
            //        this.model.trigger('animation-complete');
            //    }, this));
            this.theme2NumberLineView.model.off(theme2NumberLine.Events.FADEIN_START)
               .on(theme2NumberLine.Events.FADEIN_START, $.proxy(function (event) {
                   this.model.trigger('fade-in-start');
               }, this));
        },



        /**
        * Disables number line's click.
        *
        * @method triggerNumberLineDisableClick
        * @public 
        **/
        triggerNumberLineDisableClick: function () {
            var theme2NumberLine = MathInteractives.Common.Components.Theme2.Views.NumberLine;
            this.theme2NumberLineView.model.off(theme2NumberLine.Events.RANGE_CLICK);
        },

        /**
        * disables number line
        * @method disableNumberLine
        * @public
        */
        disableNumberLine: function () {
            this.theme2NumberLineView.disableNumberLine = true;
        },

        /**
        * Enables number line
        * @method enableNumberLine
        * @public
        */
        enableNumberLine: function () {
            this.theme2NumberLineView.disableNumberLine = false;
        },

        /**
        * Generates new number line with its changed min and max value.
        *
        * @method generteZoomedLine
        * @public 
        **/
        generteZoomedLine: function (event) {
            if (this.model.get('firstClick') === true) {
                this.model.set('firstClick', false);
            }
            var theme2NumberLine, minVal,
            maxVal, isTickClickable, isRangeClickable, shape, textStyle,
            isPositiveNumber, rangeStartXCoordinate, rangeEndXCoordinate, yCoordinate, animate, minimumVal, maximumVal, tickLength, highlightData;

            minVal = +(event.startValue).toFixed(3);
            maxVal = +(event.endValue).toFixed(3);
            this.clickMinVal = minVal;
            this.clickMaxVal = maxVal;

            this.model.set('minValue', minVal);
            this.model.set('maxValue', maxVal);
            //            minVal = event.startValue;
            //            maxVal = event.endValue;
            rangeStartXCoordinate = Math.round(event.rangeStartXCoordinate);
            rangeEndXCoordinate = Math.round(event.rangeEndXCoordinate);
            yCoordinate = event.yCoordinate;

            isPositiveNumber = true;
            if (minVal < 0 || maxVal < 0) {
                isPositiveNumber = false;
            }
            isTickClickable = false;
            isRangeClickable = true;
            animate = true;
            shape = numberlineClass.LINE;
            minimumVal = Math.abs(minVal);
            maximumVal = Math.abs(maxVal);
            this.model.trigger(this.virusZapperEvents.GET_ANSWER_VALUE, { isPositive: isPositiveNumber });
            this.isSpace = event.isSpace;
            switch (this.isRangeclicked) {
                case numberlineClass.FALSE:
                    {
                        switch (this.interactivityType) {
                            case this.virusZapperClass.INTERACTIVITY_TYPE_1:
                                {
                                    if (Math.floor(this.ansValue) === minVal
                                        || (Math.ceil(this.ansValue) === Math.abs(minVal)
                                        && this.root === 2 && isPositiveNumber === false)) {
                                        this.enableDisableButton(false);
                                        this.removeToolTip();
                                        this.theme2NumberLineView.model.changeNumberLine({
                                            numberOfIntervals: 2,
                                            minValue: minVal,
                                            maxValue: maxVal,
                                            animate: animate,
                                            textStyle: this.textStyle,
                                            tickLength: 12,
                                            tickWidth: 3,
                                            centerTickHeight: this.centerTickHeight,
                                            arrowWidth: 13,
                                            textPadding: 16,
                                            color: '#222222',
                                            hacDivId: 'number-line-acc-div'
                                        });
                                        this.numberOfIntervals = 2;
                                        this.disableNumberLine();
                                        this.theme2NumberLineView.removeNumberLineHover();
                                        this.removeToolTip();
                                        this.isRangeclicked = true;
                                        this.isPositive = isPositiveNumber;
                                        //this.model.trigger(this.virusZapperEvents.GENERATE_POPUP, { popupNumber: numberlineClass.BONUS_ROUND_POPUP });
                                        //this.model.trigger(this.virusZapperEvents.INCREMENT_HEALTH_METER);
                                        //this.model.trigger(this.virusZapperEvents.CHANGE_DIRECTION_TEXT, { gameLevel: numberlineClass.VIRUS_ZAPPER_1_BONUS_LEVEL });
                                        //this.model.trigger(this.virusZapperEvents.DISPLAY_FIRST_DIGIT, { isPositive: isPositiveNumber });
                                        //virus Animation
                                        var d = this.getAccMessage('number-line-acc-div', 1, [minVal, maxVal]);
                                        this.setAccMessage('number-line-acc-div', '');
                                        this.accMsgAfterPopup = d;
                                        this.model.trigger(this.virusZapperEvents.MOVE_VIRUSES, { minValue: minVal, maxValue: maxVal, startVal: this.minValue, endVal: this.maxValue });

                                    }
                                    else {
                                        this.toolTipData = { isLevel4: false, minVal: minVal, maxVal: maxVal, yCoordinate: yCoordinate, ansValue: this.ansValue, rangeStartXCoordinate: rangeStartXCoordinate, rangeEndXCoordinate: rangeEndXCoordinate, level: this.level };
                                        //this.addToolTip(minVal, maxVal, yCoordinate, this.ansValue, rangeStartXCoordinate, rangeEndXCoordinate, this.level);
                                        //this.model.trigger(this.virusZapperEvents.DECREMENT_HEALTH_METER);
                                        this.setAccMessage('number-line-acc-div', '');
                                        this.generateStar(rangeStartXCoordinate, rangeEndXCoordinate);
                                    }
                                }
                                break;
                            case this.virusZapperClass.INTERACTIVITY_TYPE_2:
                                {
                                    var answerMin, conditionToCheck;
                                    switch (this.level) {
                                        case numberlineClass.VIRUS_ZAPPER_2_SECOND_LEVEL:
                                            answerMin = Math.floor(this.ansValue);
                                            break;
                                        case numberlineClass.VIRUS_ZAPPER_2_THIRD_LEVEL:
                                            answerMin = Math.floor((this.ansValue * 10)) / 10;
                                            break;
                                        case numberlineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL:
                                            answerMin = Math.floor((this.ansValue * 100)) / 100;
                                            break;
                                    }

                                    conditionToCheck = (this.ansValue > 0) ? (minVal <= this.ansValue && maxVal > this.ansValue) : (minVal < this.ansValue && maxVal >= this.ansValue)
                                    if (conditionToCheck) {
                                        tickLength = 12;
                                        if (this.level === numberlineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL) {
                                            //this.model.trigger(this.virusZapperEvents.GENERATE_POPUP, { popupNumber: numberlineClass.ALMOST_THERE_POPUP });
                                            isTickClickable = true;
                                            isRangeClickable = false;
                                            shape = numberlineClass.CIRCLE;
                                            this.isRangeclicked = true;
                                            tickLength = 7;
                                            highlightData = { height: 30, color: '#ff0000', opacity: 0.2, highlightPath: false };
                                        }
                                        this.isPositive = isPositiveNumber;
                                        this.enableDisableButton(false);
                                        this.removeToolTip();
                                        this.disableNumberLine();
                                        this.theme2NumberLineView.model.changeNumberLine({
                                            numberOfIntervals: 10,
                                            minValue: minVal,
                                            maxValue: maxVal,
                                            ticksClickable: isTickClickable,
                                            partsClickable: isRangeClickable,
                                            tickShape: shape,
                                            animate: animate,
                                            textStyle: this.textStyle,
                                            tickLength: tickLength,
                                            tickWidth: 3,
                                            centerTickHeight: this.centerTickHeight,
                                            arrowWidth: 13,
                                            textPadding: 16,
                                            color: '#222222',
                                            hacDivId: 'number-line-acc-div'
                                        });
                                        this.numberOfIntervals = 10;



                                        this.theme2NumberLineView.removeNumberLineHover();
                                        //this.model.trigger(this.virusZapperEvents.RENDER_NEXT_LEVEL, { level: this.level, isPositive: isPositiveNumber });
                                        //this.level = this.level + 1;

                                        //virus Animation
                                        var a = null, b = null, c = null, d = null, e = null, f = null, g = null, setMessage = true;
                                        if (minVal < 0) {
                                            g = maxVal;
                                        } else {
                                            g = minVal;
                                        }
                                        switch (this.level) {
                                            case numberlineClass.VIRUS_ZAPPER_2_SECOND_LEVEL:
                                                a = this.getAccMessage('number-line-acc-div', 9, [g]);
                                                b = this.getAccMessage('number-line-acc-div', 11);
                                                c = this.getAccMessage('number-line-acc-div', 10, [minVal, maxVal, '']);
                                                break;
                                            case numberlineClass.VIRUS_ZAPPER_2_THIRD_LEVEL:
                                                a = this.getAccMessage('number-line-acc-div', 14, [g]);
                                                b = this.getAccMessage('number-line-acc-div', 12);
                                                e = this.getAccMessage('number-line-acc-div', 16);
                                                c = this.getAccMessage('number-line-acc-div', 10, [minVal, maxVal, e]);
                                                break;
                                            case numberlineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL:
                                                a = this.getAccMessage('number-line-acc-div', 15, [g]);
                                                b = this.getAccMessage('number-line-acc-div', 13);
                                                e = this.getAccMessage('number-line-acc-div', 16);
                                                c = this.getAccMessage('number-line-acc-div', 10, [minVal, maxVal, e + ' ' + e]);
                                                setMessage = false;
                                                break;
                                        }
                                        f = this.getAccMessage('number-line-acc-div', 17);
                                        d = a + ' ' + b + ' ' + c + ' ' + f;
                                        this.accMsgAfterPopup = d;
                                        if (setMessage) {
                                            this.setAccMessage('number-line-acc-div', d);
                                        } else {
                                            this.setAccMessage('number-line-acc-div', '');
                                        }
                                        this.model.trigger(this.virusZapperEvents.MOVE_VIRUSES, { minValue: minVal, maxValue: maxVal, startVal: this.minValue, endVal: this.maxValue });

                                    }
                                    else {
                                        this.toolTipData = { isLevel4: false, minVal: minVal, maxVal: maxVal, yCoordinate: yCoordinate, ansValue: this.ansValue, rangeStartXCoordinate: rangeStartXCoordinate, rangeEndXCoordinate: rangeEndXCoordinate, level: this.level };
                                        //this.addToolTip(minVal, maxVal, yCoordinate, this.ansValue, rangeStartXCoordinate, rangeEndXCoordinate, this.level);
                                        //this.model.trigger(this.virusZapperEvents.DECREMENT_HEALTH_METER, { status: false });
                                        this.setAccMessage('number-line-acc-div', '');
                                        this.generateStar(rangeStartXCoordinate, rangeEndXCoordinate);
                                        //alert('wrong click' + minVal + "    " + maxVal + '    ' + (rangeStartXCoordinate + rangeEndXCoordinate) / 2);

                                    }
                                }
                                break;
                        }
                    }
                    break;
                case numberlineClass.TRUE:
                    {
                        var roundValueOfAns, correctVirusXCoordinate, $zappedVirus;
                        roundValueOfAns = Math.round(this.ansValue);
                        this.disableNumberLine();
                        this.theme2NumberLineView.removeNumberLineHover();
                        if (roundValueOfAns === minVal || roundValueOfAns === maxVal || roundValueOfAns === Math.abs(minVal) || roundValueOfAns === Math.abs(maxVal)) {
                            correctVirusXCoordinate = this.getCorrectVirusXCoordinate(rangeStartXCoordinate, rangeEndXCoordinate, isPositiveNumber);
                            $zappedVirus = this.animateZappedVirus(correctVirusXCoordinate, yCoordinate);
                            this.zappedVirus = $zappedVirus;
                            this.model.trigger(this.virusZapperEvents.DISPLAY_ENTIRE_ANSWER, { gotBonus: true, isPositive: isPositiveNumber });
                            //this.model.trigger(this.virusZapperEvents.GENERATE_POPUP, { status: true, popupNumber: numberlineClass.GOT_BONUS_POPUP, $zappedVirus: $zappedVirus });
                        }
                        else {
                            correctVirusXCoordinate = this.getCorrectVirusXCoordinate(rangeStartXCoordinate, rangeEndXCoordinate, isPositiveNumber);
                            //this.generateStar(rangeStartXCoordinate, rangeEndXCoordinate);
                            this.model.trigger(this.virusZapperEvents.DISPLAY_ENTIRE_ANSWER, { gotBonus: false, isPositive: isPositiveNumber });
                            this.model.trigger(this.virusZapperEvents.GENERATE_POPUP, { status: false, popupNumber: numberlineClass.NO_BONUS_POPUP });
                        }
                        this.setAccMessage('number-line-acc-div', '');
                        this.isRangeclicked = false;
                    }
                    break;
            }
        },

        changeNumberLineAcc: function (event) {
            var rangeStartValue = event.rangeStartValue,
                rangeEndValue = event.rangeEndValue,
                accMsg = null,
                rootString = null,
                toolTipText = null,
                toolTipPoint = null,
                toolTipPointIndex = null;

            switch (this.interactivityType) {
                case this.virusZapperClass.INTERACTIVITY_TYPE_1:
                    {
                        accMsg = this.getAccMessage('number-line-acc-div', 2, [rangeStartValue, rangeEndValue]);
                        if (event.isTab) {
                            toolTipPoint = rangeEndValue;
                        } else {
                            toolTipPoint = rangeStartValue;
                        }
                        if (this.toolTipPlacedPoints && this.toolTipPlacedPoints.indexOf(toolTipPoint) !== -1) {
                            accMsg += ' ';
                            if (this.root === numberlineClass.SQUARE_ROOT) {
                                rootString = this.getAccMessage('number-line-acc-div', 4);
                                toolTipText = toolTipPoint * toolTipPoint;
                            }
                            else {
                                rootString = this.getAccMessage('number-line-acc-div', 5);
                                toolTipText = toolTipPoint * toolTipPoint * toolTipPoint;
                            }
                            toolTipText = Number(toolTipText.toFixed(3));
                            accMsg += this.getAccMessage('number-line-acc-div', 3, [rootString, toolTipText, toolTipPoint]);
                        }
                    }
                    break;
                case this.virusZapperClass.INTERACTIVITY_TYPE_2:
                    {
                        rangeStartValue = Number(rangeStartValue.toFixed(3));

                        if (this.level === numberlineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL + 1) {
                            accMsg = this.getAccMessage('number-line-acc-div', 6, [rangeStartValue]);
                            toolTipPoint = rangeStartValue;
                            toolTipPointIndex = event.index;
                        } else {
                            rangeEndValue = Number(rangeEndValue.toFixed(3));
                            accMsg = this.getAccMessage('number-line-acc-div', 2, [rangeStartValue, rangeEndValue]);

                            if (event.isTab) {
                                toolTipPoint = rangeEndValue;
                            } else {
                                toolTipPoint = rangeStartValue;
                            }
                            toolTipPointIndex = toolTipPoint;
                        }
                        if (this.toolTipPlacedPoints && this.toolTipPlacedPoints.indexOf(toolTipPointIndex) !== -1) {
                            accMsg += ' ';
                            if (this.root === numberlineClass.SQUARE_ROOT) {
                                rootString = this.getAccMessage('number-line-acc-div', 4);
                                toolTipText = toolTipPoint * toolTipPoint;
                            }
                            else {
                                rootString = this.getAccMessage('number-line-acc-div', 5);
                                toolTipText = toolTipPoint * toolTipPoint * toolTipPoint;
                            }
                            toolTipText = Number(toolTipText.toFixed(3));
                            accMsg += this.getAccMessage('number-line-acc-div', 3, [rootString, toolTipText, toolTipPoint]);
                        }
                    }
                    break;
            }
            this.setAccMessage('number-line-acc-div', accMsg);
        },

        setNumberLineAccOnFocusOut: function () {
            switch (this.interactivityType) {
                case this.virusZapperClass.INTERACTIVITY_TYPE_1:
                    {
                        if (this.numberOfIntervals === numberlineClass.VIRUS_ZAPPER_1_BONUS_LEVEL) {
                            this.changeAccMessage('number-line-acc-div', 1, [this.minValue, this.maxValue]);
                        } else {
                            this.changeAccMessage('number-line-acc-div', 0);
                        }
                    }
                    break;
                case this.virusZapperClass.INTERACTIVITY_TYPE_2:
                    {
                        var a = null, b = null, c = null, d = null, e = null, answerMin = null;
                        switch (this.level - 1) {
                            case numberlineClass.VIRUS_ZAPPER_2_SECOND_LEVEL:
                                answerMin = Math.floor(this.ansValue);
                                a = this.getAccMessage('number-line-acc-div', 9, [answerMin]);
                                b = this.getAccMessage('number-line-acc-div', 11);
                                c = this.getAccMessage('number-line-acc-div', 10, [this.minValue, this.maxValue, '']);
                                d = a + ' ' + b + ' ' + c;
                                break;
                            case numberlineClass.VIRUS_ZAPPER_2_THIRD_LEVEL:
                                answerMin = Math.floor((this.ansValue * 10)) / 10;
                                a = this.getAccMessage('number-line-acc-div', 14, [answerMin]);
                                b = this.getAccMessage('number-line-acc-div', 12);
                                e = this.getAccMessage('number-line-acc-div', 16);
                                c = this.getAccMessage('number-line-acc-div', 10, [this.minValue, this.maxValue, e]);
                                d = a + ' ' + b + ' ' + c;
                                break;
                            case numberlineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL:
                                answerMin = Math.floor((this.ansValue * 100)) / 100;
                                a = this.getAccMessage('number-line-acc-div', 15, [answerMin]);
                                b = this.getAccMessage('number-line-acc-div', 13);
                                e = this.getAccMessage('number-line-acc-div', 16);
                                c = this.getAccMessage('number-line-acc-div', 10, [this.minValue, this.maxValue, e + ' ' + e]);
                                d = a + ' ' + b + ' ' + c;
                                break;
                            default:
                                d = this.getAccMessage('number-line-acc-div', 0);
                                break;
                        }

                        this.setAccMessage('number-line-acc-div', d);
                    }
                    break;
            }
        },

        createPopup: function () {
            var self = this;
            self.minValue = self.model.get('minValue');
            self.maxValue = self.model.get('maxValue');
            switch (this.interactivityType) {
                case this.virusZapperClass.INTERACTIVITY_TYPE_1:
                    {
                        this.disableNumberLine();
                        this.model.trigger(this.virusZapperEvents.GENERATE_POPUP, { popupNumber: numberlineClass.BONUS_ROUND_POPUP });
                        this.model.trigger(this.virusZapperEvents.INCREMENT_HEALTH_METER);
                        this.model.trigger(this.virusZapperEvents.CHANGE_DIRECTION_TEXT, { gameLevel: numberlineClass.VIRUS_ZAPPER_1_BONUS_LEVEL });
                        this.model.trigger(this.virusZapperEvents.DISPLAY_FIRST_DIGIT, { isPositive: self.isPositive });
                    }
                    break;
                case this.virusZapperClass.INTERACTIVITY_TYPE_2:
                    {
                        if (this.level === numberlineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL) {
                            this.disableNumberLine();
                            this.model.trigger(this.virusZapperEvents.GENERATE_POPUP, { popupNumber: numberlineClass.ALMOST_THERE_POPUP });
                        }
                        else {
                            this.enableDisableButton(true);
                            this.enableNumberLine();
                        }
                        this.model.trigger(this.virusZapperEvents.RENDER_NEXT_LEVEL, { level: self.level, isPositive: self.isPositive });
                        this.level = this.level + 1;
                    }
                    break;
            }
            this.theme2NumberLineView.model.set('animate', false);
        },

        /**
        * Creates star on wrong click and aimates it.
        *
        * @method generateStar
        * @public 
        **/
        generateStar: function (rangeStartXCoordinate, rangeEndXCoordinate) {
            var xPos = (rangeEndXCoordinate + rangeStartXCoordinate) / 2;
            var i = 0, idPrefix = this.idPrefix, self = this;
            var $starHolder = this.$('#' + this.idPrefix + 'starHolder');
            xPos = xPos - 15;

            self.disableNumberLine();
            $starHolder.css({
                left: xPos
            });

            this.enableDisableButton(false);
            //this.$('#' + idPrefix + 'starHolder').addClass('tada').addClass('animated');
            $starHolder.show().animate({
                '-webkit-transform': 'scale(' + i + ')',
                '-ms-transform': 'scale(' + i + ')',
                '-moz-transform': 'scale(' + i + ')'
            }, {
                duration: 500,
                start: function () {
                },
                complete: function () {
                    var BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
                    // var minVal = minVal;
                    if (!(BrowserCheck.isIE === true && parseInt(BrowserCheck.browserVersion) === 9)) {
                        //MathInteractives.global.Theme2.Help.off('animationEnd').on('animationEnd', $.proxy(this.starAnimationComplete, this));
                        $starHolder.addClass('tada animated').on('webkitAnimationEnd animationend mozAnimationEnd MSAnimationEnd oanimationend', function (event) {
                            $starHolder.removeClass('tada animated');
                            $starHolder.hide();
                            self.enableDisableButton(true);
                            if (self.toolTipData.isLevel4 === false) {
                                self.addToolTip();
                                self.model.trigger(self.virusZapperEvents.DECREMENT_HEALTH_METER, { status: true });
                                //console.log('addToolTip');
                            }
                            if (self.toolTipLevel4Data.isLevel4 === true) {
                                self.addLevel4ToolTip();
                                self.model.trigger(self.virusZapperEvents.DECREMENT_HEALTH_METER, { status: false });
                                //console.log('addLevel4ToolTip');
                            }
                            self.enableNumberLine();
                            if (self.isAccessible() === true && self.isSpace) {
                                self.theme2NumberLineView.removeNumberLineHover();
                            }
                            self.setAccOnWrongClick(self.currTickVal);
                        });
                    }
                    else {
                        $starHolder.hide();
                        self.enableDisableButton(true);
                        if (self.toolTipData.isLevel4 === false) {
                            self.addToolTip();
                            self.model.trigger(self.virusZapperEvents.DECREMENT_HEALTH_METER, { status: true });
                        }
                        if (self.toolTipLevel4Data.isLevel4 === true) {
                            self.addLevel4ToolTip();
                            self.model.trigger(self.virusZapperEvents.DECREMENT_HEALTH_METER, { status: false });
                        }
                        self.enableNumberLine();
                        if (self.isAccessible() === true && self.isSpace) {
                            self.theme2NumberLineView.removeNumberLineHover();
                        }
                        self.setAccOnWrongClick(self.currTickVal);
                    }
                },
                step: function (now, fx) {
                    if (i <= 1) {
                        $starHolder.css({
                            '-webkit-transform': 'scale(' + fx.pos + ')',
                            '-ms-transform': 'scale(' + fx.pos + ')',
                            '-moz-transform': 'scale(' + fx.pos + ')'
                        });
                    }
                }
            });

        },

        setAccOnWrongClick: function (minVal) {
            var self = this,
                value = null,
                square = null,
                msg = null, rootString = null;

            //            value = self.toolTipPlacedPoints[self.toolTipPlacedPoints.length - 1];
            //            value = Number(value.toFixed(3));
            //            square = Number((value * value).toFixed(3));
            switch (this.interactivityType) {
                case this.virusZapperClass.INTERACTIVITY_TYPE_1:
                    {
                        value = self.toolTipPlacedPoints[self.toolTipPlacedPoints.length - 1];
                        value = Number(value.toFixed(3));
                        if (this.root === numberlineClass.SQUARE_ROOT) {
                            rootString = this.getAccMessage('number-line-acc-div', 4);
                            square = Number((value * value).toFixed(3));
                        }
                        else {
                            rootString = this.getAccMessage('number-line-acc-div', 5);
                            square = Number((value * value * value).toFixed(3));
                        }
                        msg = self.getAccMessage('number-line-acc-div', 6, [rootString, square, value]);

                    }
                    break;
                case this.virusZapperClass.INTERACTIVITY_TYPE_2:
                    {
                        if (numberlineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL === this.level - 1) {
                            value = Number(minVal.toFixed(3));
                            square = Number((value * value).toFixed(3));
                            msg = self.getAccMessage('number-line-acc-div', 8, [square, value]);
                        } else {
                            value = self.toolTipPlacedPoints[self.toolTipPlacedPoints.length - 1];
                            value = Number(value.toFixed(3));
                            square = Number((value * value).toFixed(3));
                            msg = self.getAccMessage('number-line-acc-div', 7, [square, value]);
                        }
                    }
                    break;
            }

            self.setAccMessage('number-line-acc-div', msg);
            self.setFocus('number-line-acc-divtemp-focus-div');
            self.setFocus('number-line-acc-div');
        },

        /**
        * EnableDisable all the buttons during animation.
        *
        * @method enableDisableButton
        * @public 
        **/

        enableDisableButton: function (status) {

            this.model.trigger(this.virusZapperEvents.ENABLE_DISABLE, { status: status });

        },


        /**
        * Generates tooltips on incorrect clicked number range
        *
        * @method addToolTip
        * @public 
        **/

        addToolTip: function () {
            var toolTipXPos, toolTipYPos, tempMin, tempMax, toolTipText, toolTipPlacedNo, toolTipPos;
            var $canvasHolder = this.$('.canvas-holder');
            var minVal = this.toolTipData.minVal, maxVal = this.toolTipData.maxVal, yPos = this.toolTipData.yPos,
             ansValue = this.toolTipData.ansValue, rangeStartXCoordinate = this.toolTipData.rangeStartXCoordinate, rangeEndXCoordinate = this.toolTipData.rangeEndXCoordinate, level = this.toolTipData.level;
            this.toolTipId++;
            var $toolTipHolder = $('<div id="' + this.idPrefix + 'toolTipHolder' + this.toolTipId + '"></div>');
            var id = this.idPrefix + 'toolTipHolder' + this.toolTipId;

            //Checking type of root, as if it is 2 then answer can be on either side of the numberline
            tempMax = maxVal;
            tempMin = minVal;


            //For placing the toolTip on proper number of the range
            if ((ansValue - tempMax) < (ansValue - tempMin)) {
                //Checks which point from the clicked range is closer to answer range
                if (ansValue > (tempMax + tempMin) / 2) {
                    toolTipXPos = rangeEndXCoordinate;
                    if (this.root === numberlineClass.SQUARE_ROOT) {
                        toolTipText = maxVal * maxVal;
                    }
                    else {
                        toolTipText = maxVal * maxVal * maxVal;
                    }
                    toolTipPlacedNo = maxVal;
                }
                else {
                    toolTipXPos = rangeStartXCoordinate;
                    if (this.root === numberlineClass.SQUARE_ROOT) {
                        toolTipText = minVal * minVal;
                    }
                    else {
                        toolTipText = minVal * minVal * minVal;
                    }
                    toolTipPlacedNo = minVal;
                }
            }
            else {//When the answer is at left side of the clicked range
                if (ansValue > (tempMax + tempMin) / 2) {
                    toolTipXPos = rangeStartXCoordinate;
                    if (this.root === numberlineClass.SQUARE_ROOT) {
                        toolTipText = minVal * minVal;
                    }
                    else {
                        toolTipText = minVal * minVal * minVal;
                    }
                    toolTipPlacedNo = minVal;
                }
                else {
                    toolTipXPos = rangeEndXCoordinate;
                    if (this.root === numberlineClass.SQUARE_ROOT) {
                        toolTipText = maxVal * maxVal;
                    }
                    else {
                        toolTipText = maxVal * maxVal * maxVal;
                    }
                    toolTipPlacedNo = maxVal;
                }
            }

            //For setting positions of all the tooltips on first click
            if (this.firstToolTip === false) {
                this.firstToolTip = true;
                this.toolTipViewArray = [];
                this.setToolTipPosition(toolTipPlacedNo, level);
            }

            var index, noExists = false;
            if (this.toolTipPlacedPoints.indexOf(toolTipPlacedNo) === -1) {
                noExists = false
                this.toolTipPlacedPoints.push(toolTipPlacedNo);
            }
            else {
                noExists = true;
            }

            if (noExists) {
                this.toolTipData = {};
                return;
            }

            //Setting index depending on the levels

            toolTipPlacedNo = +toolTipPlacedNo.toFixed(3);
            if (level === numberlineClass.SQUARE_ROOT) {
                index = 10;
            }
            else {
                index = 0;
                if (level === 3) {
                    toolTipPlacedNo = toolTipPlacedNo * 10 % 10;
                }
                if (level === 4) {
                    toolTipPlacedNo = toolTipPlacedNo * 100;
                    toolTipPlacedNo = Math.round(toolTipPlacedNo) % 10;
                }
            }
            //For positioning the tooltip's holder

            if (this.toolTipPosition[toolTipPlacedNo + index] === 'top') {
                $toolTipHolder.prependTo($canvasHolder);
                toolTipPos = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE;
                toolTipYPos = 10;
            }
            else {
                $toolTipHolder.appendTo($canvasHolder);
                toolTipPos = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_MIDDLE;
                toolTipYPos = 45;
            }
            this.$('#' + this.idPrefix + 'toolTipHolder' + this.toolTipId).css({
                top: toolTipYPos,
                left: toolTipXPos,
                'position': 'absolute'
            });
            toolTipText = +(toolTipText).toFixed(3);
            var templateData =
            {
                symbol: '√',
                qsn: toolTipText,
                sqrCubeClass: 'tooltip-square-cube-type',
                symbolClass: 'base64-symbol-tooltip',
                qsn1Class: 'tooltip-qsn'
            };
            if (this.root === numberlineClass.SQUARE_ROOT) {
                templateData['squareCubeType'] = '';
                toolTipText = MathInteractives.Common.Interactivities.VirusZapper.templates.qsnDisplay(templateData).trim(); //'<span class="tooltip-square-cube-type"></span><span class="sqrt-symbol">√</span><span class="qsn">' + toolTipText + '</span>';
            }
            else {
                templateData['squareCubeType'] = '3';
                toolTipText = MathInteractives.Common.Interactivities.VirusZapper.templates.qsnDisplay(templateData).trim(); //'<span class="tooltip-square-cube-type">' + this.root + '</span><span class="sqrt-symbol">√</span><span class="qsn">' + toolTipText + '</span>';
            }
            var options = {
                idPrefix: this.idPrefix,
                manager: this.manager,
                _player: this.player,
                path: this.filePath,
                textColor: '#FFFFFF',
                backgroundColor: '#000000',
                elementEl: this.idPrefix + 'toolTipHolder' + this.toolTipId,
                arrowType: toolTipPos,
                text: toolTipText,
                identityClass: 'toolTip-index',
                type: MathInteractives.global.Theme2.Tooltip.TYPE.CUSTOM
            };
            this.tooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(options);
            this.tooltipView.showTooltip();

            this.toolTipViewArray.push(this.tooltipView);
            //this.tooltipView.removeTooltip();
            this.toolTipData = {};

        },

        /**
        * Removes tooltips views and makes toolTipViewArray empty
        *
        * @method removeToolTip
        * @public 
        **/

        removeToolTip: function () {
            var toolTipView;
            for (var i = 0; i < this.toolTipViewArray.length; i++) {
                toolTipView = this.toolTipViewArray[i];
                toolTipView.removeTooltip();
            }
            //Removes all tooltips and their correspondig views from the array
            this.toolTipViewArray = [];
            //Reset variables for next level
            this.firstToolTip = false;
            this.toolTipId = 0;
            this.level4CornerClickSecondLastDigit = 0;
        },

        /**
        * Sets position of the tolltips on click of first range
        *
        * @method setToolTipPosition
        * @public 
        **/

        setToolTipPosition: function (toolTipPlacedNo, level) {
            this.toolTipPosition = [];
            this.toolTipPlacedPoints = [];
            var index;
            if (level === numberlineClass.SQUARE_ROOT) {
                index = 10;
            }
            else {
                index = 0;
                //Getting position of the number on which toolTip has to be placed
                if (level === numberlineClass.VIRUS_ZAPPER_2_THIRD_LEVEL) {
                    toolTipPlacedNo = toolTipPlacedNo * 10 % 10;
                }
                if (level === numberlineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL) {
                    toolTipPlacedNo = toolTipPlacedNo * 100;
                    toolTipPlacedNo = Math.round(toolTipPlacedNo) % 10;
                }
            }
            this.toolTipPosition[(toolTipPlacedNo) + index] = 'top';
            //Variable c used for alternating positions
            var c = 0, i;
            //Sets positions of all the tooltips which will be at left clicked point
            for (i = toolTipPlacedNo - 1; i >= -10; i--) {
                if (c == 0) {
                    this.toolTipPosition[i + index] = numberlineClass.BOTTOM;
                    c = 1;
                }
                else {
                    //toolTipPlacedNo = toolTipPlacedNo * 10
                    c = 0;
                    this.toolTipPosition[i + index] = numberlineClass.TOP;
                }

            }
            c = 0;
            //Sets positions for all the tolltips which will be placed at the right side of the clicked range
            for (i = toolTipPlacedNo + 1; i <= 10; i++) {
                if (c == 0) {
                    this.toolTipPosition[i + index] = numberlineClass.BOTTOM;
                    c = 1;
                }
                else {
                    c = 0;
                    this.toolTipPosition[i + index] = numberlineClass.TOP;
                }
            }
        },

        /**
        * Checks the answer clicked by the user
        *
        * @method checkAnswer
        * @param event {Object}
        * @public 
        **/
        checkAnswer: function (event) {
            var answer, $zappedVirus, tickValue;
            tickValue = event.tickValue;
            tickValue = +(tickValue.toFixed(3));

            answer = +(this.ansValue).toFixed(3);
            answer = Math.abs(answer);
            if ((Math.abs(tickValue) * 1000) === (answer * 1000)) {
                $zappedVirus = this.animateZappedVirus(event.xCoordinateOfTick);
                this.model.trigger(this.virusZapperEvents.DISPLAY_THOUSANDTH_PLACE);
                //this.model.trigger(this.virusZapperEvents.GENERATE_POPUP, { popupNumber: numberlineClass.GOT_BONUS_POPUP, $zappedVirus: $zappedVirus, status: true });
                this.theme2NumberLineView.removeNumberLineHover();
                this.setAccMessage('number-line-acc-div', '');
            }
            else {
                //TODO: 
                this.toolTipLevel4Data = { isLevel4: true, xCoordinateOfTick: event.xCoordinateOfTick, answer: answer, tickValue: tickValue };
                //this.addLevel4ToolTip(event.xCoordinateOfTick, answer, tickValue);
                this.currTickVal = tickValue;
                this.generateStar(event.xCoordinateOfTick, event.xCoordinateOfTick);
                //this.model.trigger(this.virusZapperEvents.DECREMENT_HEALTH_METER, { status: false });
            }
        },

        /**
        * Generates tooltips for level 4
        *
        * @method addLevel4ToolTip
        * @public 
        **/

        addLevel4ToolTip: function () {
            var $canvasHolder = this.$('.canvas-holder');
            this.toolTipId++;

            var $toolTipHolder = $('<div id=' + this.idPrefix + 'toolTipHolder' + this.toolTipId + '></div>');
            var xCoordinateOfTick = this.toolTipLevel4Data.xCoordinateOfTick, answer = this.toolTipLevel4Data.answer, tickValue = this.toolTipLevel4Data.tickValue;
            var toolTipPlacedNo = Math.round((tickValue * 1000)) % 10, toolTipPos, toolTipYPos, toolTipText, toolTipXPos;
            toolTipXPos = xCoordinateOfTick;
            //Sets positions of all the toolTips depending on the first toolTip
            if (this.firstToolTip === false) {
                this.firstToolTip = true;
                this.toolTipViewArray = [];
                this.setLevel4ToolTipPosition(toolTipPlacedNo);
            }
            //Adding div depending upon the position of the toolTips
            if (this.toolTipPosition[toolTipPlacedNo - 1] === 'top') {
                $toolTipHolder.prependTo($canvasHolder);
                toolTipPos = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE;
                toolTipYPos = 10;
            }
            else {
                $toolTipHolder.appendTo($canvasHolder);
                toolTipPos = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_MIDDLE;
                toolTipYPos = 50;
            }

            //Setting position of the toolTip
            $('#' + this.idPrefix + 'toolTipHolder' + this.toolTipId).css({
                top: toolTipYPos,
                left: toolTipXPos,
                'position': 'absolute'
            });
            toolTipText = tickValue * tickValue;
            toolTipText = +(toolTipText).toFixed(3);
            var noExists = false;
            if (this.toolTipPlacedPoints.indexOf(toolTipPlacedNo) === -1) {
                noExists = false
                this.toolTipPlacedPoints.push(toolTipPlacedNo);
            }
            else {
                noExists = true;
            }

            if (noExists) {
                if (toolTipPlacedNo === 0) {
                    if (this.level4CornerClickSecondLastDigit === 0) {
                        this.level4CornerClickSecondLastDigit = Math.round((tickValue * 100)) % 10;
                    }
                    else {
                        if (this.level4CornerClickSecondLastDigit === Math.round((tickValue * 100)) % 10) {
                            this.toolTipData = {};
                            return;
                        }
                    }
                }
                else {
                    this.toolTipData = {};
                    return;
                }
            }
            //            var templateData =
            //            {
            //                symbol: '√',
            //                qsn: toolTipText,
            //                sqrCubeClass: 'tooltip-square-cube-type',
            //                symbolClass: 'sqrt-symbol',
            //                qsn1Class: 'tooltip-qsn'
            //            };
            var templateData =
            {
                symbol: '√',
                qsn: toolTipText,
                sqrCubeClass: 'tooltip-square-cube-type',
                symbolClass: 'base64-symbol-tooltip',
                qsn1Class: 'tooltip-qsn'
            };
            templateData['squareCubeType'] = '';
            toolTipText = MathInteractives.Common.Interactivities.VirusZapper.templates.qsnDisplay(templateData).trim();
            //toolTipText = '<span class="tooltip-square-cube-type"></span><span class="sqrt-symbol">√</span><span class="qsn">' + toolTipText + '</span>';

            var options = {
                idPrefix: this.idPrefix,
                manager: this.manager,
                _player: this.player,
                path: this.filePath,
                textColor: '#FFFFFF',
                backgroundColor: '#000000',
                elementEl: this.idPrefix + 'toolTipHolder' + this.toolTipId,
                arrowType: toolTipPos,
                text: toolTipText,
                identityClass: 'toolTip-index'
            };
            this.tooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(options);
            this.tooltipView.showTooltip();
            this.toolTipViewArray.push(this.tooltipView);
            this.toolTipLevel4Data = {};
        },

        /**
        * Sets position for the tooltips of the level 4
        *
        * @method setLevel4ToolTipPosition
        * @public 
        **/
        setLevel4ToolTipPosition: function (toolTipPlacedNo) {
            this.toolTipPosition = [];
            this.toolTipPlacedPoints = [];
            //Setting position of the toolTip
            this.toolTipPosition[(toolTipPlacedNo) - 1] = 'top';
            var c = 0, i;
            //Setting position of all the toolTips which are left to the first toolTip
            for (i = toolTipPlacedNo - 2; i >= -1; i--) {
                if (c == 0) {
                    this.toolTipPosition[i] = numberlineClass.BOTTOM;
                    c = 1;
                }
                else {
                    c = 0;
                    this.toolTipPosition[i] = numberlineClass.TOP;
                }

            }
            //Setting position of all the toolTips which are right to the first toolTip
            c = 0;
            for (i = toolTipPlacedNo; i <= 10; i++) {
                if (c == 0) {
                    this.toolTipPosition[i] = numberlineClass.BOTTOM;
                    c = 1;
                }
                else {
                    c = 0;
                    this.toolTipPosition[i] = numberlineClass.TOP;
                }
            }
        },

        /**
        * Returns x-coordinate of correct virus position.
        *
        * @method getCorrectVirusXCoordinate
        * @param rangeStartXCoordinate {number}
        * @param rangeEndXCoordinate {number}
        * @param isPositiveNumber {boolean}
        * @return currentXCoordinate {number}
        * @public 
        **/
        getCorrectVirusXCoordinate: function (rangeStartXCoordinate, rangeEndXCoordinate, isPositiveNumber) {
            var averageDist, currentXCoordinate, avgDistWithRespectToHundredthPlace, avgDistWithRespectToThousandthPlace;
            averageDist = (Math.round(rangeEndXCoordinate) - Math.round(rangeStartXCoordinate)) / 5;
            avgDistWithRespectToHundredthPlace = Math.round(averageDist) / 10;
            avgDistWithRespectToThousandthPlace = Math.round(avgDistWithRespectToHundredthPlace) / 10;

            if (this.tenthPlaceValue < 5 && this.root === 2 && isPositiveNumber === false) {
                currentXCoordinate = rangeEndXCoordinate - (averageDist * this.tenthPlaceValue);
            }
            else if (this.tenthPlaceValue < 5) {
                currentXCoordinate = rangeStartXCoordinate + (averageDist * this.tenthPlaceValue);
            }
            else if (this.tenthPlaceValue > 5 && this.root === 2 && isPositiveNumber === false) {
                currentXCoordinate = rangeEndXCoordinate - (averageDist * (this.tenthPlaceValue - 5));
            }
            else if (this.tenthPlaceValue === 5 && this.root === 2 && isPositiveNumber === false) {
                currentXCoordinate = rangeEndXCoordinate;
            }
            else {
                currentXCoordinate = rangeStartXCoordinate + (averageDist * (this.tenthPlaceValue - 5));
            }
            if (isPositiveNumber === false) {
                currentXCoordinate = currentXCoordinate - ((avgDistWithRespectToHundredthPlace * this.hundredthPlaceValue) + (avgDistWithRespectToThousandthPlace * this.thousandthPlaceValue));
            }
            else {
                currentXCoordinate = currentXCoordinate + ((avgDistWithRespectToHundredthPlace * this.hundredthPlaceValue) + (avgDistWithRespectToThousandthPlace * this.thousandthPlaceValue));
            }
            return currentXCoordinate;
        },

        /**
        * Places virus at correct position.
        *
        * @method animateZappedVirus
        * @param correctVirusXCoordinate {number}
        * @param yCoordinate {number}
        * @return $zappedVirus {object}
        * @public 
        **/
        animateZappedVirus: function (correctVirusXCoordinate, yCoordinate) {
            var self = this, leftPos, $zappedVirus, virusPosition, $numberLineContainer;
            $numberLineContainer = this.$el;
            leftPos = $numberLineContainer.css('left');
            //virusPosition = parseInt(leftPos) + correctVirusXCoordinate - 110;
            virusPosition = correctVirusXCoordinate - 110;
            //            if (this.tenthPlaceValue > 5) {
            //                virusPosition = correctVirusXCoordinate - 110;
            //            }
            var templateData = {
                idPrefix: this.idPrefix,
                templateType: this.template,
                virusNo: 1,
                gradient1Id: 'number-line-bonus-virus-gradient1',
                gradient2Id: 'number-line-bonus-virus-gradient2'
            };
            $zappedVirus = $numberLineContainer.find('.zapped-virus').addClass('zapped-virus');
            $zappedVirus.html(MathInteractives.Common.Interactivities.VirusZapper.templates.bonusVirus(templateData).trim());
            $zappedVirus.css({
                'left': virusPosition + 'px',
                //   'background': 'url("' + this.filePath.getImagePath('virus-image') + '")',
                '-webkit-transform-origin': '50% 50%',
                '-webkit-transform': 'scale(0)',
                '-ms-transform-origin': '50% 50%',
                '-ms-transform': 'scale(0)',
                '-moz-transform-origin': '50% 50%',
                '-moz-transform': 'scale(0)'


            });
            self.removeToolTip();
            $zappedVirus.show();
            var i = 0;
            self.disableNumberLine();
            this.enableDisableButton(false);
            $zappedVirus.animate({
                '-webkit-transform': 'scale(' + i + ')',
                '-ms-transform': 'scale(' + i + ')',
                '-moz-transform': 'scale(' + i + ')'
            }, {
                duration: 500,
                start: function () {
                },
                complete: function () {
                    $zappedVirus.hide();
                    self.enableDisableButton(true);
                    //self.enableNumberLine();
                    self.model.trigger(self.virusZapperEvents.GENERATE_POPUP, {
                        status: true,
                        popupNumber: numberlineClass.GOT_BONUS_POPUP,
                        $zappedVirus: $zappedVirus
                    });
                },
                step: function (now, fx) {
                    if (i <= 1) {
                        self.$('.zapped-virus').css({
                            '-webkit-transform': 'scale(' + fx.pos + ')',
                            '-ms-transform': 'scale(' + fx.pos + ')',
                            '-moz-transform': 'scale(' + fx.pos + ')'
                        });
                    }

                }
            });

            return $zappedVirus;
        }
    },
    {
        BONUS_ROUND_POPUP: 1,
        NO_BONUS_POPUP: 2,
        GOT_BONUS_POPUP: 3,
        ALMOST_THERE_POPUP: 4,
        CIRCLE: 'circle',
        LINE: 'line',
        VIRUS_ZAPPER_2_SECOND_LEVEL: 2,
        VIRUS_ZAPPER_2_THIRD_LEVEL: 3,
        VIRUS_ZAPPER_2_FOURTH_LEVEL: 4,
        VIRUS_ZAPPER_1_FIRST_LEVEL: 1,
        VIRUS_ZAPPER_1_BONUS_LEVEL: 2,
        SQUARE_ROOT: 2,
        BOTTOM: 'bottom',
        TOP: 'top',
        FALSE: false,
        TRUE: true,

        /**
        * Generates the number-line
        *
        * @method generateNumberLine
        * @param numberLineObj {Object} Model values to be passed to the numberLineView
        * @return numberLineView {Object} View of the generated number-line
        * @public 
        **/
        generateNumberLine: function (numberLineObj) {
            if (numberLineObj) {
                var numberLineModel, numberLineView, el;
                el = numberLineObj.containerId;
                numberLineModel = new MathInteractives.Common.Interactivities.VirusZapper.Models.NumberLine(numberLineObj);
                numberLineView = new MathInteractives.Common.Interactivities.VirusZapper.Views.NumberLine({ model: numberLineModel, el: el });
                return numberLineView;
            }
        }
    });
    numberlineClass = MathInteractives.Common.Interactivities.VirusZapper.Views.NumberLine;
})()