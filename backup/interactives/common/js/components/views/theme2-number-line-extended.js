(function () {
    'use strict';
    var numberLineClass;
    /**
    * View for rendering the number line in canvas.
    * @class NumberLine
    * @constructor
    * @namespace MathInteractives.Common.Components.Theme2.Views
    */
    MathInteractives.Common.Components.Theme2.Views.NumberLineExtended = MathInteractives.Common.Components.Theme2.Views.NumberLine.extend({

        currentLayer: null,

        zommInOutDataStack: [],

        leftCloneTicksGroup: null,
        leftCloneLabelsGroup: null,
        rightCloneTicksGroup: null,
        trightCloneLabelsGroup: null,
        leftPanElmtsGrp: null,
        rightPanElmtsGrp: null,

        visibleLabelsIndexArr: [],

        midVal: null,

        zoomIn: false,

        zoomOut: false,

        skipTickCount: null,

        /**
        * Get data from model & set in view, Calls render
        *
        * @method initialize
        **/
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, arguments);

            this.model.off(numberLineClass.Events.ZOOM_OUT_START).on(numberLineClass.Events.ZOOM_OUT_START, $.proxy(this.fadeOutTicksOnLine, this));
            this.model.off(numberLineClass.Events.FADEOUT_COMPLETE).on(numberLineClass.Events.FADEOUT_COMPLETE, $.proxy(this._startZoomingOut, this));
        },


        /**
        * Renders the number line.
        *
        * @method _renderNumberLine
        * @private
        **/
        _renderNumberLine: function () {

            this.scope.activate();
            var animate = this.model.get('animate');
            if (animate === true) {
                this.startPanning();
                this.fadeInEffect = true;
                return;
            }

            var model = this.model,
                utils = MathInteractives.Common.Utilities.Models.Utils,
                self = this,
                startPointX = null,
                endPointX = null,
                startPointY = null,
                endPointY = null,
                newStartPoint = null,
                newEndPoint = null,
                newStartPointY = null,
                newEndPointY = null,
                divisionWidth = null,
                zerothPoint = null,
                numToDisplay = null,
                textStartPointX = null,
                textStartPointY = null,
                unitValueOfDivision = null,
                zerothStartPointY = null,
                zerothEndPointY = null,
                tickPath = null,
                lineText = null,
                tickHeight = null,
                tickHitAreaSize = null,
                tickHitAreaHeight = null,
                partsHitAreaSize = null,
                wholeNumToDisplay = null,
                integerTickColor = null,
                displayNumber = null,
                centerTickStartY = null,
                centerTickEndY = null,
                tickLengthAdjustment = null,
                zerothTickLengthAdjustment = null,
                absDisplayNo = null,
                animate = null,
                layer = null,
                opacity = 0.1,
                count = null,
                fadeInTimer = null,
                layers = null,
                layerIndex = null,
                startSegmnetStartX = null,
                fadeInTime = 17,
                isOverlapping = null,
                tickRectanglePath,
                lineSegmentPath,
                partRectanglePath,
                constantToDecideTickLength = 3,
                constantToDecideCenterTickLength = 5,
                textPaddingFromNumberLine = 16,
                minValue = model.get('minValue'),
                maxValue = model.get('maxValue'),
                lineColor = model.get('color'),
                textColor = model.get('textColor'),
                numberOfIntervals = model.get('numberOfIntervals'),
                lineLength = model.get('length'),
                lineWidth = model.get('width'),
                centerTickHeight = model.get('centerTickHeight'),
                ticksClickable = model.get('ticksClickable'),
                partsClickable = model.get('partsClickable'),
                tickShape = model.get('tickShape'),
                displayWholeNumOnly = model.get('displayWholeNumOnly'),
                denominator = model.get('denominator'),
                toFixedDecimal = model.get('toFixedDecimal'),
                tickColor = model.get('tickColor'),
                tickWidth = model.get('tickWidth'),
                distanceBetweenTwoSticks = model.get('distanceBetweenTwoSticks'),
                centerTickHeightBigger = model.get('centerTickHeightBigger'),
                tickLength = model.get('tickLength'),
                textPadding = model.get('textPadding'),
                textStyle = model.get('textStyle'),
                toFixedInteger = model.get('toFixedInteger'),
                clickedRangeStartXCoordinate = model.get('clickedRangeStartXCoordinate'),
                clickedRangeEndXCoordinate = model.get('clickedRangeEndXCoordinate'),
                arrowWidth = model.get('arrowWidth'),
                highlightData = model.get('highlightData'),
                tickHitAreaDimentions = model.get('tickHitAreaDimentions'),
                showTicks = model.get('showTicks'),
                showLable = model.get('showLable'),
                showBaseLine = model.get('showBaseLine'),
                showAlternateLableWhenOverlap = model.get('showAlternateLableWhenOverlap'),
                showAlternateAlways = model.get('showAlternateAlways'),
                skipTickCount = model.get('skipTickCount'),
                customArrowSize = model.get('customArrowSize'),
                leftArrowTickDistance = model.get('leftArrowTickDistance'),
                rightArrowTickDistance = model.get('rightArrowTickDistance'),
                addCommaInLabel = model.get('addCommaInLabel');

            skipTickCount++; // Important. Increases the skipTickCount by one because it's default value is zero.


            this.setCanvasSize();
            this.skipTickCount = skipTickCount;
            model.set('skipTickCount', skipTickCount);

            this.numberOfIntervals = numberOfIntervals;

            if (leftArrowTickDistance === null) {
                leftArrowTickDistance = numberLineClass.LEFT_ARROWHEAD_DISTANCE_FROM_MIN_VALUE;
            }

            if (rightArrowTickDistance === null) {
                rightArrowTickDistance = numberLineClass.RIGHT_ARROWHEAD_DISTANCE_FROM_MAX_VALUE;
            }


            if (!tickColor) {
                tickColor = lineColor;
                model.set('tickColor', tickColor);
            }

            if (!integerTickColor) {
                integerTickColor = lineColor;
                model.set('integerTickColor', integerTickColor);
            }

            if (!tickWidth) {
                tickWidth = lineWidth;
                model.set('tickWidth', tickWidth);
            }


            if (textPadding) {
                if (textStyle && textStyle.fontSize) {
                    textPaddingFromNumberLine = textPadding + (textStyle.fontSize - 12);
                }
                else {
                    textPaddingFromNumberLine = textPadding + 1;
                }
            }
            model.set('textPadding', textPaddingFromNumberLine);


            this.tickPointsXCoordinateArray = [];
            this.tickPointsYCoordinateArray = [];
            this.tickNumbersArr = [];
            this.roundedTickNumbersArr = [];

            //this.scope.project.layers[0].removeChildren();
            //this.scope.project.layers = [];
            //this.scope.view.draw();


            startPointX = numberLineClass.START_POINT_X_COORDINATE;
            startPointY = numberLineClass.START_POINT_Y_COORDINATE;
            endPointY = numberLineClass.END_POINT_Y_COORDINATE;

            endPointX = lineLength;
            //creating new layer.
            layer = new this.scope.Layer();
            this.currentLayer = layer;

            //setting number-line opacity to zero initially for fade in effect.
            if (this.fadeInEffect === true) {
                layer.opacity = 0;
            }


            //decides height of center tick and other ticks.
            if (startPointY === endPointY) {

                if (tickLength !== null) {
                    tickLengthAdjustment = tickLength / 2;
                }
                else {
                    tickLengthAdjustment = (lineWidth + constantToDecideTickLength);
                }
                // code for center tick. This code should NOT be moved above tickLengthAdjustment calculations.
                if (centerTickHeightBigger === true) {
                    if (tickLength) {
                        zerothTickLengthAdjustment = tickLengthAdjustment + 2;
                    }
                    else {
                        zerothTickLengthAdjustment = (lineWidth + constantToDecideCenterTickLength);
                    }
                }
                else {
                    zerothTickLengthAdjustment = tickLengthAdjustment;
                }

                //calculation for start and end points' y-co-ordinates of ticks.
                newStartPointY = startPointY - tickLengthAdjustment;
                newEndPointY = startPointY + tickLengthAdjustment;
                if (centerTickHeight) {
                    zerothStartPointY = startPointY - (centerTickHeight / 2);
                    zerothEndPointY = startPointY + (centerTickHeight / 2);
                }
                else {
                    zerothStartPointY = startPointY - zerothTickLengthAdjustment;
                    zerothEndPointY = startPointY + zerothTickLengthAdjustment;
                }
                model.set('newStartPointY', newStartPointY);
                model.set('newEndPointY', newEndPointY);
            }



            if (tickLength !== null) {
                tickHeight = tickLength;
            }
            else {
                tickHeight = newEndPointY - newStartPointY;
            }

            if (arrowWidth) {
                endPointX = startPointX + lineLength;
                startSegmnetStartX = startPointX + arrowWidth - 1;
                newStartPoint = startPointX + arrowWidth + leftArrowTickDistance;
                newEndPoint = newEndPoint - (arrowWidth + rightArrowTickDistance);

                lineLength = (endPointX - startPointX) - (leftArrowTickDistance + rightArrowTickDistance + (arrowWidth * 2));
            }
            else {
                arrowWidth = tickHeight - constantToDecideTickLength;
                startSegmnetStartX = startPointX;
                newStartPoint = startPointX + leftArrowTickDistance;
                newEndPoint = newEndPoint - rightArrowTickDistance;
                lineLength = (endPointX - startPointX) - (leftArrowTickDistance + rightArrowTickDistance);
            }


            //Decides start and end point co-ordinates of line.

            model.set('firstTickPointX', newStartPoint);

            //draws line.
            this.startLineSegment = new this.scope.Path.Line({
                from: [startSegmnetStartX, startPointY],
                to: [newStartPoint, endPointY],
                strokeColor: lineColor,
                strokeWidth: lineWidth
            });

            if (showBaseLine === false) {
                startLineSegment.opacity = 0;
            }

            //decides point positions where text is to be placed.
            textStartPointX = newStartPoint;
            textStartPointY = newEndPointY + textPaddingFromNumberLine;
            model.set('textPaddingFromNumberLine', textPaddingFromNumberLine);


            divisionWidth = lineLength / numberOfIntervals;
            this.divisionWidth = divisionWidth;

            zerothPoint = (numberOfIntervals / 2);

            //calculates unit value of each interval and sets it to model.

            unitValueOfDivision = (maxValue - minValue) / numberOfIntervals;
            model.set('tickInterval', unitValueOfDivision);

            numToDisplay = minValue;

            /* temporary fix for removing hover effect of disabled number line's last hovered element
            TODO: probably store last hovered element as a property rather than the partsHitAreaGroup, ticksHitAreaGroup*/
            this.ticksGroup = new this.scope.Group();
            this.partsHitAreaGroup = new this.scope.Group();
            this.ticksHitAreaGroup = new this.scope.Group();
            this.lineSegmentGroup = new this.scope.Group();
            this.textGroup = new this.scope.Group();
            this.highlightRangeGroup = new this.scope.Group();

            if (displayWholeNumOnly === true) {
                this._calculateInitailTicks();
            }

            this.visibleLabelsIndexArr = [];
            //for loop renders ticks and assigns respective text to them.
            for (count = 0; count <= numberOfIntervals; count++) {

                //when the lables are required to be displayed alternately
                if (showAlternateAlways) {
                    if (count % skipTickCount === 0) {
                        showLable = true;
                    }
                    else {
                        showLable = false;
                    }
                }

                if (count === zerothPoint) {
                    if (tickShape === numberLineClass.LINE) {
                        if (showTicks) { // Check whether the tick is to be shown or not.
                            tickPath = new this.scope.Path.Line({
                                from: [newStartPoint, zerothStartPointY],
                                to: [newStartPoint, zerothEndPointY],
                                strokeColor: tickColor,
                                strokeWidth: tickWidth
                            });
                        }
                    }
                    else if (tickShape === numberLineClass.CIRCLE) {
                        if (showTicks) {
                            tickPath = new this.scope.Path.Circle(new this.scope.Point(newStartPoint, startPointY), tickHeight / 2);
                            tickPath.fillColor = lineColor;
                        }
                    }
                    //sets x co-ordinate value of zeroth point.
                    this.xCoordinateOfZerothPoint = newStartPoint;

                    lineText = new this.scope.PointText(new this.scope.Point(textStartPointX, textStartPointY));
                    lineText.justification = 'center';
                    lineText.fillColor = textColor;
                    if (!textColor) {
                        lineText.fillColor = lineColor;
                    }
                    if (textStyle) {
                        lineText.style = textStyle;
                    }

                    if (displayWholeNumOnly === true) {
                        if (this.tickCounter === 0) {
                            displayNumber = parseInt(numToDisplay.toFixed(toFixedInteger));
                            absDisplayNo = Math.abs(parseInt(displayNumber, 10));
                            if (absDisplayNo === 0) {
                                displayNumber = absDisplayNo;
                            }
                            if (showLable) {
                                displayNumber = (addCommaInLabel === true) ? this.getNumWithCommasAdded(displayNumber) : this.getDisplayNumber(displayNumber);
                                lineText.content = displayNumber;
                                this.visibleLabelsIndexArr.push(count);
                            }
                            if (showTicks) {
                                tickPath.strokeColor = integerTickColor;
                            }
                        }
                    }
                    else {
                        if (showLable) {
                            displayNumber = +(numToDisplay.toFixed(toFixedDecimal));
                            displayNumber = (addCommaInLabel === true) ? this.getNumWithCommasAdded(displayNumber) : this.getDisplayNumber(displayNumber);
                            lineText.content = displayNumber;
                            this.visibleLabelsIndexArr.push(count);
                        }
                    }
                    this.midVal = +(numToDisplay.toFixed(toFixedDecimal));

                    if (!centerTickHeight) {
                        centerTickHeight = zerothEndPointY - zerothStartPointY;
                    }
                    model.set('centerTickHeight', centerTickHeight);

                    tickHitAreaSize = tickHeight + 5;
                    tickHitAreaHeight = centerTickHeight + 7;
                    if (tickHitAreaDimentions) {
                        tickHitAreaSize = tickHitAreaDimentions.width;
                        tickHitAreaHeight = tickHitAreaDimentions.height;
                    }
                    partsHitAreaSize = divisionWidth - tickHitAreaSize;
                    this.tickPointsYCoordinateArray.push(zerothStartPointY);
                }
                else {
                    if (tickShape === numberLineClass.LINE) {
                        if (showTicks) {
                            tickPath = new this.scope.Path.Line({
                                from: [newStartPoint, newStartPointY],
                                to: [newStartPoint, newEndPointY],
                                strokeColor: tickColor,
                                strokeWidth: tickWidth
                            });
                        }
                    }
                    else if (tickShape === numberLineClass.CIRCLE) {
                        if (showTicks) {
                            tickPath = new this.scope.Path.Circle(new this.scope.Point(newStartPoint, startPointY), tickHeight / 2);
                            tickPath.fillColor = lineColor;
                        }
                    }

                    lineText = new this.scope.PointText(new this.scope.Point(textStartPointX, textStartPointY));
                    lineText.justification = 'center';
                    lineText.fillColor = textColor;
                    if (!textColor) {
                        lineText.fillColor = lineColor;
                    }
                    if (textStyle) {
                        lineText.style = textStyle;
                    }

                    if (displayWholeNumOnly === true) {
                        if (this.tickCounter === 0) {
                            displayNumber = parseInt(numToDisplay.toFixed(toFixedInteger));
                            absDisplayNo = Math.abs(parseInt(displayNumber, 10));
                            if (absDisplayNo === 0) {
                                displayNumber = absDisplayNo;
                            }
                            if (showLable) {
                                displayNumber = (addCommaInLabel === true) ? this.getNumWithCommasAdded(displayNumber) : this.getDisplayNumber(displayNumber);
                                lineText.content = displayNumber;
                                this.visibleLabelsIndexArr.push(count);
                            }
                            if (showTicks) {
                                tickPath.strokeColor = integerTickColor;
                            }
                        }
                    }
                    else {
                        if (showLable) {
                            displayNumber = +(numToDisplay.toFixed(toFixedDecimal));
                            displayNumber = (addCommaInLabel === true) ? this.getNumWithCommasAdded(displayNumber) : this.getDisplayNumber(displayNumber);
                            lineText.content = displayNumber;
                            this.visibleLabelsIndexArr.push(count);
                        }
                    }

                    if (!tickLength) {
                        tickHeight = newEndPointY - newStartPointY;
                    }
                    tickHitAreaSize = tickHeight + 5;
                    tickHitAreaHeight = tickHeight + 7;
                    if (tickHitAreaDimentions) {
                        tickHitAreaSize = tickHitAreaDimentions.width;
                        tickHitAreaHeight = tickHitAreaDimentions.height;
                    }
                    partsHitAreaSize = divisionWidth - tickHitAreaSize;
                    this.tickPointsYCoordinateArray.push(newStartPointY);
                }
                if (ticksClickable) {
                    if (count === zerothPoint) {
                        tickRectanglePath = new this.scope.Path.Rectangle(((newStartPoint + (constantToDecideCenterTickLength - constantToDecideTickLength)) - (tickHitAreaSize / 2)), (startPointY - (tickHitAreaHeight / 2)), tickHitAreaSize, tickHitAreaHeight);
                        if (tickLength) {
                            tickRectanglePath = new this.scope.Path.Rectangle((newStartPoint - (tickHitAreaSize / 2)), (startPointY - (tickHitAreaHeight / 2)), tickHitAreaSize, tickHitAreaHeight);
                        }
                        tickRectanglePath.fillColor = new this.scope.Color(255, 255, 255, 0);
                    }
                    else {
                        tickRectanglePath = new this.scope.Path.Rectangle((newStartPoint - (tickHitAreaSize / 2)), (startPointY - (tickHitAreaHeight / 2)), tickHitAreaSize, tickHitAreaHeight);
                        tickRectanglePath.fillColor = new this.scope.Color(255, 255, 255, 0);
                    }
                    this.ticksHitAreaGroup.addChild(tickRectanglePath);
                }
                if (count < numberOfIntervals) {
                    if (showTicks) {
                        lineSegmentPath = new this.scope.Path.Line({
                            from: [newStartPoint, startPointY],
                            to: [newStartPoint + divisionWidth, endPointY],
                            strokeColor: lineColor,
                            strokeWidth: lineWidth
                        });
                    }
                    else {
                        lineSegmentPath = new this.scope.Path.Line({
                            from: [newStartPoint, startPointY],
                            to: [newStartPoint + divisionWidth + tickWidth, endPointY],
                            strokeColor: lineColor,
                            strokeWidth: lineWidth
                        });
                    }
                    if (showBaseLine === false) {
                        lineSegmentPath.opacity = 0;
                    }
                    if (partsClickable) {
                        if (highlightData) {
                            tickHitAreaHeight = highlightData.height;
                        }
                        if (count === zerothPoint) {
                            partRectanglePath = new this.scope.Path.Rectangle((newStartPoint + 1), (startPointY - (tickHitAreaHeight / 2)), divisionWidth - 2, tickHitAreaHeight);
                            partRectanglePath.fillColor = new this.scope.Color(255, 255, 255, 0);

                        }
                        else {
                            partRectanglePath = new this.scope.Path.Rectangle((newStartPoint + 1), (startPointY - (tickHitAreaHeight / 2)), divisionWidth - 2, tickHitAreaHeight);
                            partRectanglePath.fillColor = new this.scope.Color(255, 255, 255, 0);
                        }
                        this.partsHitAreaGroup.addChild(partRectanglePath);
                    }
                }
                this.tickNumbersArr.push(numToDisplay);
                this.roundedTickNumbersArr.push(utils.roundUpValue(numToDisplay, toFixedDecimal));
                this.tickPointsXCoordinateArray.push(newStartPoint);
                model.set('lastTickPointX', newStartPoint);
                newStartPoint = newStartPoint + divisionWidth;

                textStartPointX = textStartPointX + divisionWidth;
                numToDisplay = (numToDisplay * Math.pow(10, 8) + unitValueOfDivision * Math.pow(10, 8)) / Math.pow(10, 8);

                if (displayWholeNumOnly === true) {
                    this.tickCounter++;
                    if (this.tickCounter === Math.abs(denominator)) {
                        this.tickCounter = 0;
                    }
                }
                if (showTicks) {
                    this.ticksGroup.addChild(tickPath);
                }
                this.textGroup.addChild(lineText);
                this.lineSegmentGroup.addChild(lineSegmentPath);
                this.partsHitAreaGroup.bringToFront();
            }
            this.ticksGroup.bringToFront();
            this.ticksHitAreaGroup.bringToFront();
            var endLineSegment = new this.scope.Path.Line({
                from: [newStartPoint - divisionWidth, startPointY],
                to: [(newStartPoint - divisionWidth) + rightArrowTickDistance, endPointY],
                strokeColor: lineColor,
                strokeWidth: lineWidth
            });

            if (showBaseLine === false) {
                endLineSegment.opacity = 0;
            }

            isOverlapping = this._isLablesOverlapping();
            if (isOverlapping === true & showAlternateLableWhenOverlap === true) {
                this._hideAlternateLables();
            }

            if (ticksClickable === true) {
                this.setHighlightEffectForTicks(numberOfIntervals, this.ticksHitAreaGroup, this.ticksGroup, lineColor, highlightData);
                this.bindTickClick(numberOfIntervals, this.ticksHitAreaGroup, this.ticksGroup);
            }

            if (partsClickable === true) {
                this.setHighlightEffectForParts(numberOfIntervals, this.partsHitAreaGroup, this.lineSegmentGroup, lineWidth, lineColor, highlightData);
                this.bindPartClick(numberOfIntervals, this.partsHitAreaGroup, this.lineSegmentGroup);
            }

            if (customArrowSize === true) {
                this._drawCustomArrowHeadsAtNumberLineEnds(endPointY, lineColor, tickHeight, startLineSegment, endLineSegment);
            }
            else {
                this._drawArrowHeadsAtNumberLineEnds(startPointX, startPointY, endPointX, endPointY, lineColor, tickHeight, constantToDecideTickLength);
            }

            //Gives fade in effect to number line.
            layers = this.scope.project.layers;
            layerIndex = layers.length - 2;
            if (this.fadeInEffect === true) {
                self.model.trigger(numberLineClass.Events.FADEIN_START);
                fadeInTimer = setInterval(function () {
                    opacity = opacity + 0.1;
                    opacity = +(opacity.toFixed(1));
                    layer.opacity = opacity;
                    self.scope.view.draw();
                    if (opacity === 1) {
                        clearInterval(fadeInTimer);
                        for (; layerIndex >= 0; layerIndex--) {
                            layers[layerIndex].remove();
                        }
                        self.scope.view.draw();
                        self.fadeInEffect = false;
                        self.model.trigger(numberLineClass.Events.ANIMATION_COMPLETE, { zoomIn: self.zoomIn, zoomOut: self.zoomOut });
                    }
                    self.model.trigger(numberLineClass.Events.FADEIN_PROGRESS);
                }, fadeInTime);
            }
            else {
                for (; layerIndex >= 0; layerIndex--) {
                    layers[layerIndex].remove();
                }
            }

            if (this.loadedAcc && this.accOn === true) {
                this.canvasAcc.updatePaperItems(this.getPaperObjects(true));
            }
            this.zommInOutDataStack.push({
                minVal: minValue,
                maxVal: maxValue,
                midVal: this.midVal,
                numberOfIntervals: numberOfIntervals,
                ticksGroup: this.ticksGroup,
                lineSegmentGroup: this.lineSegmentGroup,
                textGroup: this.textGroup,
                tickPointsXCoordinateArray: this.tickPointsXCoordinateArray,
                tickPointsYCoordinateArray: this.tickPointsYCoordinateArray,
                tickNumbersArr: this.tickNumbersArr
            });
            this.scope.view.draw();
        },

        addCommas: function addCommas(number) {
            var temp, temp1, temp2;
            number += '';
            temp = number.split('.');
            temp1 = temp[0];
            temp2 = temp.length > 1 ? '.' + temp[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(temp1)) {
                temp1 = temp1.replace(rgx, '$1' + ',' + '$2');
            }
            return temp1 + temp2;
        },

        getNumWithCommasAdded: function getNumWithCommasAdded(origNum) {
            var displayNum,
                number = Number(origNum);
            var minus = $('<div/>').html('&#8722;').html();
            var formattedNum = this.addCommas(Math.abs(origNum));
            if (formattedNum !== null && formattedNum !== undefined) {
                displayNum = number < 0 ? displayNum = minus + formattedNum : displayNum = formattedNum;
            }
            else {
                displayNum = number < 0 ? displayNum = minus + Math.abs(number) : displayNum = number;
            }
            return displayNum;
            //return formattedNum;
        },

        getDisplayNumber: function getDisplayNumber(origNum) {
            var number = Number(origNum),
                minus = $('<div/>').html('&#8722;').html(),
                displayNum;

            displayNum = number < 0 ? minus + Math.abs(number) : number;
            return displayNum;
        },

        setClickedRangeObject: function setClickedRangeObject(rangeIndex) {
            var self = this;
            var count = rangeIndex,
            rangeStartValue = self.tickNumbersArr[count],
            rangeEndValue = self.tickNumbersArr[count + 1],
            rangeStartXCoordinate = self.tickPointsXCoordinateArray[count],
            rangeEndXCoordinate = self.tickPointsXCoordinateArray[count + 1],
            yCoordinate = self.tickPointsYCoordinateArray[count],
            clickedRangeObject = {
                rangeStartValue: rangeStartValue,
                rangeEndValue: rangeEndValue,
                rangeStartXCoordinate: rangeStartXCoordinate,
                rangeEndXCoordinate: rangeEndXCoordinate,
                yCoordinate: yCoordinate
            };
            this.rangeStratValue = clickedRangeObject.rangeStartValue;
            this.rangeEndValue = clickedRangeObject.rangeEndValue;
            this.model.set('clickedRangeObject', clickedRangeObject);
            return clickedRangeObject;
        },

        setValuesInModel: function setValuesInModel(object) {
            if (this.isValue(object.skipTickCount)) {
                this.model.set('skipTickCount', object.skipTickCount);
            }
            if (this.isValue(object.showAlternateAlways)) {
                this.model.set('showAlternateAlways', object.showAlternateAlways);
            }
            if (this.isValue(object.numberOfIntervals)) {
                this.model.set('numberOfIntervals', object.numberOfIntervals);
            }
            if (this.isValue(object.minValue)) {
                this.model.set('minValue', object.minValue);
            }
            if (this.isValue(object.maxValue)) {
                this.model.set('maxValue', object.maxValue);
            }
            if (this.isValue(object.addCommaInLabel)) {
                this.model.set('addCommaInLabel', object.addCommaInLabel);
            }
        },

        isValue: function isValue(obj) {
            return (typeof obj !== 'undefined' && obj !== null);
        },

        setCanvasSize: function setCanvasSize() {
            var canvas = this.$('#' + this.idPrefix + 'number-line-canvas');
            var width = this.model.get('canvasWidth'), height = this.model.get('canvasHeight');
            if (width !== null && typeof (width) !== 'undefined' && height !== null && typeof (height) !== 'undefined') {
                canvas.attr('width', Number(width));
                canvas.attr('height', Number(height));
                this.scope.view.viewSize = [Number(width) - 1, Number(height)];
                this.scope.view.viewSize = [Number(width), Number(height)];
            }
        },

        /**
        * Pans number line after clicking particular range.
        *
        * @method startPanning
        * @public
        **/
        startPanning: function () {
            var ticksGrp = this.ticksGroup,
                count = 0,
                rangeMidPoint,
                textGrp = this.textGroup,
                self = this,
                tickPath,
                textStartPointY,
                lineText,
                rangeStartValue,
                animationTime = 17,
                clickedRangeObject,
                clickedRangeStartXCoordinate,
                clickedRangeEndXCoordinate,
                incrementFactor = 25,
                panningTimer = null,
                maxVal = this.model.get('maxValue'),
                minVal = this.model.get('minValue'),
                toFixedDecimal = this.model.get('toFixedDecimal'),
                newStartPointY = this.model.get('newStartPointY'),
                newEndPointY = this.model.get('newEndPointY'),
                startPoint = this.model.get('firstTickPointX'),
                lastPoint = this.model.get('lastTickPointX'),
                unitValueOfDivision = this.model.get('tickInterval'),
                tickColor = this.model.get('tickColor'),
                textColor = this.model.get('textColor'),
                lineColor = this.model.get('color'),
                tickWidth = this.model.get('tickWidth'),
                textPadding = this.model.get('textPadding'),
                textStyle = this.model.get('textStyle'),
                clickedRangeObject = this.model.get('clickedRangeObject'),
                textPaddingFromNumberLine = this.model.get('textPaddingFromNumberLine'),
                showAlternateAlways = this.model.get('showAlternateAlways');

            this.zoomIn = true;
            this.zoomOut = false;
            //sets x-co-ordinates of start and end points of clicked range.
            clickedRangeStartXCoordinate = clickedRangeObject.rangeStartXCoordinate;
            clickedRangeEndXCoordinate = clickedRangeObject.rangeEndXCoordinate;

            //midpoint of clicked range.
            rangeMidPoint = (clickedRangeStartXCoordinate + clickedRangeEndXCoordinate) / 2;

            panningTimer = setInterval(function () {

                //boolean to know whether animation started.
                self.disableNumberLine = true;

                //Panning from right to left..
                if (rangeMidPoint > self.xCoordinateOfZerothPoint) {

                    ticksGrp.position.x = self.ticksGroup.position.x - incrementFactor;
                    textGrp.position.x = self.textGroup.position.x - incrementFactor;
                    rangeMidPoint = rangeMidPoint - incrementFactor;
                    clickedRangeEndXCoordinate = clickedRangeEndXCoordinate - incrementFactor;
                    clickedRangeStartXCoordinate = clickedRangeStartXCoordinate - incrementFactor;

                    //removes ticks beyond end point and add ticks to opposite end..
                    if (startPoint > self.ticksGroup.children[0].position.x) {

                        self.ticksGroup.children[0].remove();
                        self.textGroup.children[0].remove();
                        if (count > 0) {
                            tickPath = new self.scope.Path.Line({
                                from: [lastPoint, newStartPointY],
                                to: [lastPoint, newEndPointY],
                                strokeColor: tickColor,
                                strokeWidth: tickWidth
                            });
                            maxVal = maxVal + unitValueOfDivision;

                            textStartPointY = newEndPointY + textPaddingFromNumberLine;
                            lineText = new self.scope.PointText(new self.scope.Point(lastPoint, textStartPointY));
                            lineText.justification = 'center';
                            lineText.fillColor = textColor;

                            if (!textColor) {
                                lineText.fillColor = lineColor;
                            }
                            if (textStyle) {
                                lineText.style = textStyle;
                            }
                            if (showAlternateAlways === true) {
                                if (count % self.skipTickCount === 0 && self.skipTickCount !== 0) {
                                    lineText.content = +(minVal.toFixed(toFixedDecimal));
                                }
                            }
                            else {
                                lineText.content = +(maxVal.toFixed(toFixedDecimal));
                            }
                            self.ticksGroup.addChild(tickPath);
                            self.textGroup.addChild(lineText);
                        }
                        count++;
                    }
                    //stops panning..
                    if (rangeMidPoint <= self.xCoordinateOfZerothPoint) {
                        clearInterval(panningTimer);
                        self.startZooming({ rangeStartXCoordinate: clickedRangeStartXCoordinate, rangeEndXCoordinate: clickedRangeEndXCoordinate });
                    }

                }
                    //Panning from left to right..
                else if (rangeMidPoint < self.xCoordinateOfZerothPoint) {

                    ticksGrp.position.x = self.ticksGroup.position.x + incrementFactor;
                    textGrp.position.x = self.textGroup.position.x + incrementFactor;
                    rangeMidPoint = rangeMidPoint + incrementFactor;
                    clickedRangeEndXCoordinate = clickedRangeEndXCoordinate + incrementFactor;
                    clickedRangeStartXCoordinate = clickedRangeStartXCoordinate + incrementFactor;

                    //removes ticks beyond start point and add ticks to opposite end..
                    if (lastPoint < self.ticksGroup.lastChild.position.x) {

                        self.ticksGroup.lastChild.remove();
                        self.textGroup.lastChild.remove();
                        if (count > 0) {
                            tickPath = new self.scope.Path.Line({
                                from: [startPoint, newStartPointY],
                                to: [startPoint, newEndPointY],
                                strokeColor: tickColor,
                                strokeWidth: tickWidth
                            });
                            minVal = minVal - unitValueOfDivision;
                            textStartPointY = newEndPointY + textPaddingFromNumberLine;
                            lineText = new self.scope.PointText(new self.scope.Point(startPoint, textStartPointY));
                            lineText.justification = 'center';
                            lineText.fillColor = textColor;
                            if (!textColor) {
                                lineText.fillColor = lineColor;
                            }
                            if (textStyle) {
                                lineText.style = textStyle;
                            }
                            if (showAlternateAlways === true) {
                                if (count % self.skipTickCount === 0 && self.skipTickCount !== 0) {
                                    lineText.content = +(minVal.toFixed(toFixedDecimal));
                                }
                            }
                            else {
                                lineText.content = +(maxVal.toFixed(toFixedDecimal));
                            }
                            self.ticksGroup.appendBottom(tickPath);
                            self.textGroup.appendBottom(lineText);
                        }
                        count++;
                    }
                    //stops panning..
                    if (rangeMidPoint >= self.xCoordinateOfZerothPoint) {
                        clearInterval(panningTimer);
                        self.startZooming({ rangeStartXCoordinate: clickedRangeStartXCoordinate, rangeEndXCoordinate: clickedRangeEndXCoordinate });
                    }
                }
                self.scope.view.draw();
                self.model.trigger(numberLineClass.Events.ANIMATION_PROGRESS, { pan: true, zoom: false });
            }, animationTime);
        },



        /**
        * Pans number line while in zoom out.
        *
        * @method startPanningOutWithDefaultValues
        * @public
        **/
        startPanningOutWithDefaultValues: function (panningData) {
            var count = 0,
                rangeMidPoint, self = this,
                animationTime = 17,
                incrementFactor = 15,
                panningTimer = null,
                maxVal = this.model.get('maxValue'),
                minVal = this.model.get('minValue'),
                toFixedDecimal = this.model.get('toFixedDecimal'),
                unitValueOfDivision = this.model.get('tickInterval'),
                showAlternateAlways = this.model.get('showAlternateAlways'),
                panningComplete = false;


            this.leftPanElmtsGrp = new this.scope.Group();
            this.rightPanElmtsGrp = new this.scope.Group();

            if (panningData !== null && typeof panningData !== 'undefined') {
                var zoomLineData = panningData.zoomLineData,
                    panningData = panningData,
                    panningDirectionDecidingVal = zoomLineData.midVal,
                    totalTickCntPrevLine = zoomLineData.tickPointsXCoordinateArray.length;
            }
            if (totalTickCntPrevLine > 0) {
                for (var ticksIndex = 0; ticksIndex < zoomLineData.tickNumbersArr.length; ticksIndex++) {
                    if (zoomLineData.tickNumbersArr[ticksIndex] === minVal) {
                        var minIndex = ticksIndex;
                    }
                    if (zoomLineData.tickNumbersArr[ticksIndex] === maxVal) {
                        var maxIndex = ticksIndex;
                    }
                }
                var distBetnTwoTicks = Math.abs(zoomLineData.tickPointsXCoordinateArray[0] - zoomLineData.tickPointsXCoordinateArray[1]);

            }
            this.leftPanElmtsGrp.addChildren([panningData.currentLTickPath, panningData.currentLTextPath, panningData.leftCloneTicksGroup, panningData.leftCloneLabelsGroup]);
            this.rightPanElmtsGrp.addChildren([panningData.currentRTickPath, panningData.currentRTextPath, panningData.rightCloneTicksGroup, panningData.rightCloneLabelsGroup]);

            panningTimer = setInterval(function () {

                if (Math.abs(panningData.currentLTickPath.position.x - panningData.currentRTickPath.position.x) < distBetnTwoTicks) {
                    self.leftPanElmtsGrp.position.x -= 1;
                    self.rightPanElmtsGrp.position.x += 1;
                }
                //Pan from right to left
                if (minVal <= panningDirectionDecidingVal && maxVal <= panningDirectionDecidingVal && panningComplete === false) {
                    if (panningData.currentLTickPath.position.x > zoomLineData.tickPointsXCoordinateArray[minIndex] ||
                        panningData.currentRTickPath.position.x > zoomLineData.tickPointsXCoordinateArray[maxIndex]) {
                        self.leftPanElmtsGrp.position.x -= incrementFactor;
                        self.rightPanElmtsGrp.position.x -= incrementFactor;
                    }
                    else {
                        clearInterval(panningTimer);
                        self.setValuesInModel({
                            skipTickCount: 4,
                            showAlternateAlways: true,
                            numberOfIntervals: zoomLineData.numberOfIntervals,
                            minValue: zoomLineData.minVal,
                            maxValue: zoomLineData.maxVal
                        });
                        self.fadeInEffect = true;
                        self.scope.project.layers[0].remove();
                        self.scope.view.draw();
                        self._renderNumberLine();
                        panningComplete = true;
                    }
                }
                    //pan from left to right
                else if (minVal >= panningDirectionDecidingVal && maxVal >= panningDirectionDecidingVal && panningComplete === false) {
                    if (panningData.currentLTickPath.position.x < zoomLineData.tickPointsXCoordinateArray[minIndex] ||
                        panningData.currentRTickPath.position.x < zoomLineData.tickPointsXCoordinateArray[maxIndex]) {
                        self.leftPanElmtsGrp.position.x += incrementFactor;
                        self.rightPanElmtsGrp.position.x += incrementFactor;
                    }
                    else {
                        clearInterval(panningTimer);
                        self.setValuesInModel({
                            skipTickCount: 4,
                            showAlternateAlways: true,
                            numberOfIntervals: zoomLineData.numberOfIntervals,
                            minValue: zoomLineData.minVal,
                            maxValue: zoomLineData.maxVal,
                        });
                        self.fadeInEffect = true;
                        self.scope.project.layers[0].remove();
                        self.scope.view.draw();
                        self._renderNumberLine();
                        panningComplete = true;
                    }
                }
                count++;
                self.scope.view.draw();
                self.model.trigger(numberLineClass.Events.ZOOMING_OUT_ANIMATION_PROGRESS, { pan: true, zoom: false });
            }, animationTime);

        },



        /**
        * Pans number line while in zoom out.
        *
        * @method startPanningOutWithGivenValues
        * @public
        **/
        startPanningOutWithGivenValues: function startPanningOutWithGivenValues(panningData) {
            var count = 0,
                rangeMidPoint, self = this,
                animationTime = 17,
                incrementFactor = 15,
                panningTimer = null,
                maxVal = this.model.get('maxValue'),
                minVal = this.model.get('minValue'),
                toFixedDecimal = this.model.get('toFixedDecimal'),
                unitValueOfDivision = this.model.get('tickInterval'),
                showAlternateAlways = this.model.get('showAlternateAlways'),
                lineLength = this.model.get('length'),
                toFixedDecimal = this.model.get('toFixedDecimal'),
                panningComplete = false,
                leftArrowTickDistance = this.model.get('leftArrowTickDistance'),
                rightArrowTickDistance = this.model.get('rightArrowTickDistance'),
                addCommaInLabel = this.model.get('addCommaInLabel'),
                rightCnt = 0,
                leftCnt = 0,
                maxLabelVal = maxVal,
                minLabelVal = minVal;

            this.leftPanElmtsGrp = new this.scope.Group();
            this.rightPanElmtsGrp = new this.scope.Group();

            if (panningData !== null && typeof panningData !== 'undefined') {
                var zoomLineData = panningData.zoomLineData,
                    panningData = panningData,
                    panningDirectionDecidingVal = zoomLineData.midVal;
            }

            if (leftArrowTickDistance && rightArrowTickDistance) {
                var distBetnTwoTicks = Math.round((lineLength - (leftArrowTickDistance + rightArrowTickDistance)) / zoomLineData.numberOfIntervals);
            }
            else {
                var distBetnTwoTicks = Math.round((lineLength - 40) / zoomLineData.numberOfIntervals);
            }
            var unitValueOfDivision = (zoomLineData.maxVal - zoomLineData.minVal) / zoomLineData.numberOfIntervals,
                zoomeLineElements = [],
                numToDisplay = zoomLineData.minVal;

            for (var i = 0; i < zoomLineData.numberOfIntervals; i++) {
                numToDisplay = (numToDisplay * Math.pow(10, 8) + unitValueOfDivision * Math.pow(10, 8)) / Math.pow(10, 8);
                zoomeLineElements.push(numToDisplay);
            }

            this.leftPanElmtsGrp.addChildren([panningData.currentLTickPath, panningData.currentLTextPath, panningData.leftCloneTicksGroup, panningData.leftCloneLabelsGroup]);
            this.rightPanElmtsGrp.addChildren([panningData.currentRTickPath, panningData.currentRTextPath, panningData.rightCloneTicksGroup, panningData.rightCloneLabelsGroup]);
            var fixedRgtTicksGrpLength = panningData.rightCloneTicksGroup.children.length,
                fixedLftTicksGrpLength = panningData.leftCloneTicksGroup.children.length;


            panningTimer = setInterval(function () {

                if (Math.abs(panningData.currentLTickPath.position.x - panningData.currentRTickPath.position.x) < distBetnTwoTicks) {
                    self.leftPanElmtsGrp.position.x -= 1;
                    self.rightPanElmtsGrp.position.x += 1;
                }
                //Pan from right to left
                if (minVal <= panningDirectionDecidingVal && maxVal <= panningDirectionDecidingVal && panningComplete === false) {
                    var panningStopPointIndex = zoomeLineElements.indexOf(maxVal);

                    if (panningData.currentLTickPath.position.x > (panningStopPointIndex * distBetnTwoTicks)) {
                        self.leftPanElmtsGrp.position.x -= incrementFactor;
                        self.rightPanElmtsGrp.position.x -= incrementFactor;
                        var minXPos = self.tickPointsXCoordinateArray[0],
                            LeftGrpLength = self.leftCloneTicksGroup.children.length;
                        if (LeftGrpLength > 0) {
                            if (self.leftCloneTicksGroup.children[LeftGrpLength - 1].position.x < minXPos) {
                                self.leftCloneTicksGroup.children[LeftGrpLength - 1].remove();
                                self.leftCloneLabelsGroup.children[LeftGrpLength - 1].remove();
                            }
                        }
                        else {
                            panningData.currentLTickPath.opacity = 0;
                            panningData.currentLTextPath.opacity = 0;
                        }
                        if (LeftGrpLength === 0) {
                            var rightGrpLength = self.rightCloneTicksGroup.children.length;
                            if (self.rightCloneTicksGroup.children[0].position.x < minXPos) {
                                self.rightCloneTicksGroup.children[0].remove();
                                self.rightCloneLabelsGroup.children[0].remove();
                            }
                        }
                        var rightGrpLength = self.rightCloneTicksGroup.children.length,
                            rgtTickClone = self.rightCloneTicksGroup.children[rightGrpLength - 1],
                            rgtLabelClone = self.rightCloneLabelsGroup.children[rightGrpLength - 1];
                        var maxXPos = self.tickPointsXCoordinateArray[self.tickPointsXCoordinateArray.length - 1];
                        //add ticks from right
                        if ((Math.abs(rgtTickClone.position.x - maxXPos) > distBetnTwoTicks)) {
                            rgtTickClone = rgtTickClone.clone();
                            rgtLabelClone = rgtLabelClone.clone();
                            rgtTickClone.position.x = rgtTickClone.position.x + distBetnTwoTicks;
                            rgtLabelClone.position.x = rgtTickClone.position.x;
                            rightCnt++;

                            //calculates number to display on line
                            maxLabelVal = maxLabelVal + unitValueOfDivision;
                        }
                        self.addRightCloneTicksWithLabels(rgtTickClone, rgtLabelClone, maxLabelVal, (fixedRgtTicksGrpLength + rightCnt));
                    }
                    else {
                        clearInterval(panningTimer);
                        self.setValuesInModel({
                            skipTickCount: 4,
                            showAlternateAlways: true,
                            numberOfIntervals: zoomLineData.numberOfIntervals,
                            minValue: zoomLineData.minVal,
                            maxValue: zoomLineData.maxVal
                        });
                        self.fadeInEffect = true;
                        self.scope.project.layers[0].remove();
                        self.scope.view.draw();
                        self._renderNumberLine();
                        panningComplete = true;
                    }
                }
                //pan from left to right
                else if (minVal >= panningDirectionDecidingVal && maxVal >= panningDirectionDecidingVal && panningComplete === false) {
                    var panningStopPointIndex = zoomeLineElements.indexOf(minVal);

                    if (panningData.currentLTickPath.position.x < (panningStopPointIndex * distBetnTwoTicks)) {
                        self.leftPanElmtsGrp.position.x += incrementFactor;
                        self.rightPanElmtsGrp.position.x += incrementFactor; var minXPos = self.tickPointsXCoordinateArray[0];
                        var maxXPos = self.tickPointsXCoordinateArray[self.tickPointsXCoordinateArray.length - 1];
                        var rightGrpLength = self.rightCloneTicksGroup.children.length;
                        if (rightGrpLength > 0) {
                            if (self.rightCloneTicksGroup.children[rightGrpLength - 1].position.x > maxXPos) {
                                self.rightCloneTicksGroup.children[rightGrpLength - 1].remove();
                                self.rightCloneLabelsGroup.children[rightGrpLength - 1].remove();
                            }
                        }

                        //add ticks from right
                        var LeftGrpLength = self.leftCloneTicksGroup.children.length,
                            lftTickClone = self.leftCloneTicksGroup.children[LeftGrpLength - 1],
                            lftLabelClone = self.leftCloneLabelsGroup.children[LeftGrpLength - 1],
                            minXPos = self.tickPointsXCoordinateArray[0];

                        if ((Math.abs(lftTickClone.position.x - minXPos) > distBetnTwoTicks)) {
                            lftTickClone = lftTickClone.clone();
                            lftLabelClone = lftLabelClone.clone();
                            lftTickClone.position.x = lftTickClone.position.x - distBetnTwoTicks;
                            lftLabelClone.position.x = lftTickClone.position.x;
                            leftCnt++;
                            //calculates number to display on line
                            minLabelVal = minLabelVal - unitValueOfDivision;
                        }
                        self.addLeftCloneTicksWithLabels(lftTickClone, lftLabelClone, minLabelVal, (fixedLftTicksGrpLength + leftCnt));
                    }
                    else {
                        clearInterval(panningTimer);
                        self.setValuesInModel({
                            skipTickCount: 4,
                            showAlternateAlways: true,
                            numberOfIntervals: zoomLineData.numberOfIntervals,
                            minValue: zoomLineData.minVal,
                            maxValue: zoomLineData.maxVal
                        });
                        self.fadeInEffect = true;
                        self.scope.project.layers[0].remove();
                        self.scope.view.draw();
                        self._renderNumberLine();
                        panningComplete = true;
                    }
                }
                count++;
                self.scope.view.draw();
                self.model.trigger(numberLineClass.Events.ZOOMING_OUT_ANIMATION_PROGRESS, { pan: true, zoom: false });
            }, animationTime);

        },


        addRightCloneTicksWithLabels: function addRightCloneTicksWithLabels(tickClone, labelClone, maxVal, rightCnt) {
            var self = this,
                toFixedDecimal = this.model.get('toFixedDecimal'),
                unitValueOfDivision = this.model.get('tickInterval'),
                showAlternateAlways = this.model.get('showAlternateAlways'),
                toFixedDecimal = this.model.get('toFixedDecimal'),
                addCommaInLabel = this.model.get('addCommaInLabel');


            var rgtLabelClone = labelClone,
                rgtTickClone = tickClone,
                maxVal = maxVal,
                rightCnt = rightCnt;
            var maxXPos = self.tickPointsXCoordinateArray[self.tickPointsXCoordinateArray.length - 1];
            //Show label depending on the requirement whether to show continuously or skipping few ticks
            if (rgtLabelClone) {
                if (showAlternateAlways === true) {
                    if (addCommaInLabel === true) {
                        ((rightCnt + 1) % self.skipTickCount === 0 && self.skipTickCount !== 0) ?
                        rgtLabelClone.content = self.getNumWithCommasAdded(+(maxVal.toFixed(toFixedDecimal))) : rgtLabelClone.content = '';
                    }
                    else {
                        ((rightCnt + 1) % self.skipTickCount === 0 && self.skipTickCount !== 0) ?
                        rgtLabelClone.content = self.getDisplayNumber(+(maxVal.toFixed(toFixedDecimal))) : rgtLabelClone.content = '';
                    }
                }
                else {
                    if (addCommaInLabel === true) {
                        rgtLabelClone.content = self.getNumWithCommasAdded(+(maxVal.toFixed(toFixedDecimal)));
                    }
                    else {
                        rgtLabelClone.content = self.getDisplayNumber(+(maxVal.toFixed(toFixedDecimal)));
                    }
                }
            }

            //Adds tick and label clones to respective groups
            if (rgtTickClone) {
                if (rgtTickClone.position.x < maxXPos) {
                    //Adds tick and label clones to respective groups
                    self.rightCloneTicksGroup.addChild(rgtTickClone);
                    self.rightCloneLabelsGroup.addChild(rgtLabelClone);
                }
            }
            self.scope.view.draw();
        },

        

        addLeftCloneTicksWithLabels: function addLeftCloneTicksWithLabels(tickClone, labelClone, minVal, leftCnt ) {
            var self = this,
                toFixedDecimal = this.model.get('toFixedDecimal'),
                unitValueOfDivision = this.model.get('tickInterval'),
                showAlternateAlways = this.model.get('showAlternateAlways'),
                toFixedDecimal = this.model.get('toFixedDecimal'),
                addCommaInLabel = this.model.get('addCommaInLabel');

            var lftLabelClone = labelClone,
                lftTickClone = tickClone,
                minVal = minVal,
                leftCnt = leftCnt;
            var minXPos = self.tickPointsXCoordinateArray[0];
            //Show label depending on the requirement whether to show continuously or skipping few ticks
            if (lftLabelClone) {
                if (showAlternateAlways === true) {
                    if (addCommaInLabel === true) {
                        ((leftCnt + 1) % self.skipTickCount === 0 && self.skipTickCount !== 0) ?
                        lftLabelClone.content = self.getNumWithCommasAdded(+(minVal.toFixed(toFixedDecimal))) : lftLabelClone.content = '';
                    }
                    else {
                        ((leftCnt + 1) % self.skipTickCount === 0 && self.skipTickCount !== 0) ?
                        lftLabelClone.content = self.getDisplayNumber(+(minVal.toFixed(toFixedDecimal))) : lftLabelClone.content = '';
                    }
                }
                else {
                    if (addCommaInLabel === true) {
                        lftLabelClone.content = self.getNumWithCommasAdded(+(minVal.toFixed(toFixedDecimal)));
                    }
                    else {
                        lftLabelClone.content = self.getDisplayNumber(+(minVal.toFixed(toFixedDecimal)));
                    }
                }
            }

            if (lftTickClone) {
                if (lftTickClone.position.x > minXPos) {
                    //Adds tick and label clones to respective groups
                    self.leftCloneTicksGroup.addChild(lftTickClone);
                    self.leftCloneLabelsGroup.addChild(lftLabelClone);
                }
            }
            self.scope.view.draw();
        },


        /**
        * Zooms out number line.
        *
        * @method startZoomingOut
        * @param event {object} contains minValue, maxValue, and intervals of the line to which current line is to be zoomed.
        * @private
        **/
        _startZoomingOut: function _startZoomingOut(event) {
            var self = this,
                model = this.model,
                scope = self.getPaperScope(),
                ticks = self.ticksGroup.children,
                labels = self.textGroup.children,
                minLimit = model.get('firstTickPointX'),
                maxLimit = model.get('lastTickPointX'),
                clickedRangeObject = model.get('clickedRangeObject'),
                numberOfIntervals = model.get('numberOfIntervals'),
                lineLength = model.get('length'),
                unitValueOfDivision = model.get('tickInterval'),
                showAlternateAlways = model.get('showAlternateAlways'),
                maxVal = model.get('maxValue'),
                minVal = model.get('minValue'),
                toFixedDecimal = model.get('toFixedDecimal'),
                addCommaInLabel = model.get('addCommaInLabel'),
                xLRIncrement = 15,
                xRLIncrement = 15,
                ticksIndex,
                currentLTickPath, currentLTextPath, currentRTickPath, currentRTextPath,
                startX = ticks[0].position.x, endX = ticks[ticks.length - 1].position.x,
                rangeMidpoint = (startX + endX) / 2, scaleFactor = 0,
                time = 17,
                lftTickClone, lftLabelClone, rgtTickClone, rgtLabelClone,
                leftCnt = 0,
                rightCnt = 0,
                numToDisplay,
                zoomEnd = false,
                leftCloneTickscount,
                rightCloneTickscount,
                minXPos,
                maxXPos,
                isSkipTick,
                lCnt = 0,
                rCnt = 0;

            this.zoomIn = false;
            this.zoomOut = true;

            this.leftCloneTicksGroup = new this.scope.Group();
            this.leftCloneLabelsGroup = new this.scope.Group();
            this.rightCloneTicksGroup = new this.scope.Group();
            this.rightCloneLabelsGroup = new this.scope.Group();


            //maxXPos = zoomLineData.tickPointsXCoordinateArray[zoomLineData.tickPointsXCoordinateArray.length - 1];
            currentLTickPath = ticks[0];
            currentLTextPath = labels[0];
            currentRTickPath = ticks[ticks.length - 1];
            currentRTextPath = labels[labels.length - 1];

            if (event !== null && typeof event !== 'undefined') {
                var zoomLineData = event;
                zoomLineData.midVal = +(((zoomLineData.minVal + zoomLineData.maxVal) / 2).toFixed(toFixedDecimal));
                isSkipTick = zoomLineData.isSkipTick;
                if (isSkipTick === true) {
                    if (zoomLineData.visibleLabelsIndexArr.indexOf(zoomLineData.minValIndex) === -1) {
                        currentLTextPath.content = '';
                    }
                    if (zoomLineData.visibleLabelsIndexArr.indexOf(zoomLineData.maxValIndex) === -1) {
                        currentRTextPath.content = '';
                    }
                    isSkipTick = false;
                    self.scope.view.draw();
                }
            }
            else {
                var zoomLineData = this.zommInOutDataStack.pop();
                if (zoomLineData.minVal === minVal && zoomLineData.maxVal === maxVal) {
                    var zoomLineData = this.zommInOutDataStack.pop();
                }
            }

            //Few calculations required for positioning ticks and labels
            if (zoomLineData.numberOfIntervals !== numberOfIntervals) {
                var divisionWidth = lineLength / zoomLineData.numberOfIntervals;
            }
            else {
                var divisionWidth = self.divisionWidth;
            }
            unitValueOfDivision = (zoomLineData.maxVal - zoomLineData.minVal) / zoomLineData.numberOfIntervals;

            var zoomingTimer = setInterval(function () {
                //starts zooming out
                /* ******** LEFT TO RIGHT ***** */
                //Add clone ticks from left to right
                if (startX < rangeMidpoint && Math.abs(startX - rangeMidpoint) > xLRIncrement) {
                    currentLTickPath.position.x += xLRIncrement;
                    currentLTextPath.position.x += xLRIncrement;
                    startX += xLRIncrement;

                    //Move newly addes clone ticks group from left to right(towards the center of line from left)
                    if (self.leftCloneTicksGroup.children.length > 0) {
                        self.leftCloneTicksGroup.position.x += xLRIncrement;
                    }
                    if (self.leftCloneLabelsGroup.children.length > 0) {
                        self.leftCloneLabelsGroup.position.x += xLRIncrement;
                    }

                    minXPos = self.tickPointsXCoordinateArray[0];

                    if (lCnt === 0 && (Math.abs(currentLTickPath.position.x - minXPos) > divisionWidth)) {
                        //ticks[0].visible = false;
                        lftTickClone = ticks[0].clone();
                        //ticks[0].visible = true;
                        lftLabelClone = labels[0].clone();
                        lftTickClone.position.x = currentLTickPath.position.x - divisionWidth;
                        lftLabelClone.position.x = lftTickClone.position.x;
                        lCnt++;
                        leftCnt++;
                        //calculates number to display on line
                        minVal = minVal - unitValueOfDivision;
                    }
                    if (lftTickClone) {
                        if ((Math.abs(lftTickClone.position.x - minXPos) > divisionWidth)) {
                            //lftTickClone.visible = false;
                            lftTickClone = lftTickClone.clone();
                            //lftTickClone.visible = true;
                            lftLabelClone = lftLabelClone.clone();
                            lftTickClone.position.x = lftTickClone.position.x - divisionWidth;
                            lftLabelClone.position.x = lftTickClone.position.x;
                            leftCnt++;
                            //calculates number to display on line
                            minVal = minVal - unitValueOfDivision;
                        }
                        self.addLeftCloneTicksWithLabels(lftTickClone, lftLabelClone, minVal, leftCnt);
                    }
                    self.scope.view.draw();
                }

                /* ******** RIGHT TO LEFT ***** */
                //Add clone ticks from right to left
                if (endX > rangeMidpoint && Math.abs(endX - rangeMidpoint) > xRLIncrement) {
                    currentRTickPath.position.x -= xRLIncrement;
                    currentRTextPath.position.x -= xRLIncrement;
                    endX -= xRLIncrement;

                    //Move newly addes clone ticks group from right to left(towards the center of line from right)
                    if (self.rightCloneTicksGroup.children.length > 0) {
                        self.rightCloneTicksGroup.position.x -= xRLIncrement;
                    }
                    if (self.rightCloneLabelsGroup.children.length > 0) {
                        self.rightCloneLabelsGroup.position.x -= xRLIncrement;
                    }

                    var maxXPos = self.tickPointsXCoordinateArray[self.tickPointsXCoordinateArray.length - 1];

                    //Adds clone ticks from right to left
                    if (rCnt === 0 && (Math.abs(currentRTickPath.position.x - maxXPos) > divisionWidth)) {
                        rgtTickClone = ticks[ticks.length - 1].clone();
                        rgtLabelClone = labels[labels.length - 1].clone();
                        rgtTickClone.position.x = currentRTickPath.position.x + divisionWidth;
                        rgtLabelClone.position.x = rgtTickClone.position.x;
                        rCnt++;
                        rightCnt++;
                        //calculates number to display on line
                        maxVal = maxVal + unitValueOfDivision;
                    }
                    if (rgtTickClone) {
                        if ((Math.abs(rgtTickClone.position.x - maxXPos) > divisionWidth)) {
                            rgtTickClone = rgtTickClone.clone();
                            rgtLabelClone = rgtLabelClone.clone();
                            rgtTickClone.position.x = rgtTickClone.position.x + divisionWidth;
                            rgtLabelClone.position.x = rgtTickClone.position.x;
                            rightCnt++;

                            //calculates number to display on line
                            maxVal = maxVal + unitValueOfDivision;
                        }
                        self.addRightCloneTicksWithLabels(rgtTickClone, rgtLabelClone, maxVal, rightCnt);
                    }
                }

                if (Math.abs(startX - rangeMidpoint) < xLRIncrement && Math.abs(endX - rangeMidpoint) < xRLIncrement && zoomEnd === false) {
                    clearInterval(zoomingTimer);
                    self.model.trigger(numberLineClass.Events.ZOOMING_OUT_ANIMATION_END);
                    self.startPanningOutWithGivenValues({
                        zoomLineData: zoomLineData,
                        leftCloneTicksGroup: self.leftCloneTicksGroup,
                        leftCloneLabelsGroup: self.leftCloneLabelsGroup,
                        rightCloneTicksGroup: self.rightCloneTicksGroup,
                        rightCloneLabelsGroup: self.rightCloneLabelsGroup,
                        currentLTickPath: currentLTickPath,
                        currentLTextPath: currentLTextPath,
                        currentRTickPath: currentRTickPath,
                        currentRTextPath: currentRTextPath
                    });
                    zoomEnd = true;
                }
                scope.view.draw();
                self.model.trigger(numberLineClass.Events.ZOOMING_OUT_ANIMATION_PROGRESS, { pan: false, zoom: true });
            }, time);

        },

        fadeOutTicksOnLine: function fadeOutTicksOnLine(event) {
            var self = this,
                opacity = 1,
                ticks = this.ticksGroup.children,
                labels = this.textGroup.children,
                fadeOutTime = 17,
                fadeOutTimer = null,
                ticksIndex = null;

            this.model.trigger(numberLineClass.Events.FADEOUT_START);
            fadeOutTimer = setInterval(function () {
                opacity = opacity - 0.1;
                opacity = +(opacity.toFixed(1));

                for (ticksIndex = 0; ticksIndex < ticks.length; ticksIndex++) {
                    ticks[ticksIndex].opacity = opacity;;
                    labels[ticksIndex].opacity = opacity;;
                }
                self.scope.view.draw();
                if (opacity === 0) {
                    clearInterval(fadeOutTimer);
                    ticks[0].opacity = 1;
                    ticks[ticks.length - 1].opacity = 1;
                    labels[0].opacity = 1;
                    labels[ticks.length - 1].opacity = 1;
                    self.scope.view.draw();
                    self.model.trigger(numberLineClass.Events.FADEOUT_COMPLETE, event);
                }
                self.model.trigger(numberLineClass.Events.FADEOUT_PROGRESS);
            }, fadeOutTime);
        }

    }, {
        START_POINT_X_COORDINATE: 15,
        START_POINT_Y_COORDINATE: 20,
        END_POINT_Y_COORDINATE: 20,
        LEFT_ARROWHEAD_DISTANCE_FROM_MIN_VALUE: 32,
        RIGHT_ARROWHEAD_DISTANCE_FROM_MAX_VALUE: 32,
        NUMBER_OF_POLYGON_SIDES: 3,
        LINE: 'line',
        CIRCLE: 'circle',

        Events: {
            NUMBERLINE_VALUES_CHANGED: 'numberline-values-changed',
            TICK_CLICK: 'tick-click',
            RANGE_CLICK: 'range-click',
            ANIMATION_COMPLETE: 'animation-complete',
            ANIMATION_PROGRESS: 'animation-progress',
            FADEIN_PROGRESS: 'fade-in-progress',
            FADEIN_START: 'fade-in-start',
            RANGE_TAB: 'range-tab',
            FOCUS_OUT: 'focus-out',
            ZOOM_OUT_START: 'zoom-out-start',
            FADEOUT_START: 'fade-out-start',
            FADEOUT_PROGRESS: 'fade-out-progress',
            FADEOUT_COMPLETE: 'fade-out-complete',
            ZOOMING_OUT_ANIMATION_PROGRESS: 'zooming-out-animation-progress'
        },
        generateNumberLine: function (numberLineProps) {
            var containerId = '',
                numberLineModel = null,
                numberLineView = null;
            if (numberLineProps) {
                containerId = numberLineProps.containerId;
                numberLineModel = new MathInteractives.Common.Components.Theme2.Models.NumberLine(numberLineProps);
                numberLineView = new MathInteractives.Common.Components.Theme2.Views.NumberLineExtended({ el: containerId, model: numberLineModel });
            }
            return numberLineView;
        }
    });
    MathInteractives.global.Theme2.NumberLineExtended = MathInteractives.Common.Components.Theme2.Views.NumberLineExtended;
    numberLineClass = MathInteractives.Common.Components.Theme2.Views.NumberLineExtended;
})(window.MathInteractives);