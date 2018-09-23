(function () {
    'use strict';
    var theme2NumberLineClass = null;
    /**
    * View for rendering the number line in canvas.
    * @class NumberLine
    * @constructor
    * @namespace MathInteractives.Common.Components.Theme2.Views
    */
    MathInteractives.Common.Components.Theme2.Views.NumberLine = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Manager class object
        *
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Unique interactivity id prefix
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * scope for canvas 
        * @property scope
        * @type object
        * @default null
        */
        scope: null,

        /**
        * Array which holds all tick's x-coordinates. 
        * @property tickPointsXCoordinateArray
        * @type object
        * @default null
        */
        tickPointsXCoordinateArray: null,

        /**
        * Array which holds all tick's y-coordinates. 
        * @property tickPointsYCoordinateArray
        * @type object
        * @default null
        */
        tickPointsYCoordinateArray: null,

        /**
        * Array which holds all tick's values 
        * @property tickNumbersArr
        * @type object
        * @default null
        */
        tickNumbersArr: null,

        /**
        * Array which holds all tick's values rounded upto required decimal value 
        * @property roundedTickNumbersArr
        * @type object
        * @default null
        */
        roundedTickNumbersArr: null,

        /**
        * start value of range 
        * @property rangeStratValue
        * @type number
        * @default null
        */
        rangeStratValue: null,

        /**
        * End value of range 
        * @property rangeEndValue
        * @type number
        * @default null
        */
        rangeEndValue: null,

        /**
        * Value displayed at ticks 
        * @property tickValue
        * @type number
        * @default null
        */
        tickValue: null,

        /**
        * Boolean for whether to display the number line or not. 
        * @property disableNumberLine
        * @type boolean
        * @default false
        */

        disableNumberLine: false,

        /**
        * Boolean for whether to show the fade In effect or not. 
        * @property fadeInEffect
        * @type boolean
        * @default false
        */

        fadeInEffect: false,

        /**
        * x-co-ordinate of zeroth point 
        * @property xCoordinateOfZerothPoint
        * @type number
        * @default null
        */
        xCoordinateOfZerothPoint: null,

        /**
        * check previous selected item for accessibility in paper(used for accessibility).
        * @property previousItem
        * @type object
        * @default null
        */
        previousItem: null,


        /**
        * Counter for the number of ticks
        * @property tickCounter
        * @type number
        * @default null
        */

        tickCounter: null,

        /**
        * Get data from model & set in view, Calls render
        *
        * @method initialize
        **/
        initialize: function () {
            var self = this;
            this.player = this.model.get('player');
            this.filePath = this.player.getPath();
            this.manager = this.player.getManager();
            this.idPrefix = this.player.getIDPrefix();
            this.accOn = this.isAccessible();
            this.hacDivId = this.model.get('hacDivId');
            this._isMobile = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
            this.tabName = this.model.get('tabName');
            this._render();

            this.model.off(theme2NumberLineClass.Events.NUMBERLINE_VALUES_CHANGED).on(theme2NumberLineClass.Events.NUMBERLINE_VALUES_CHANGED, $.proxy(this._renderNumberLine, this));
        },

        /**
        * Sets paper scope and renders DOM elements.
        *
        * @method _render
        * @private
        **/
        _render: function () {
            var self = this;
            var options = { idPrefix: this.idPrefix };
            this.$el.html(MathInteractives.Common.Components.templates.theme2NumberLine(options).trim());

            var scope = new paper.PaperScope();
            scope.setup(this.idPrefix + 'number-line-canvas');
            this.scope = scope;

            this._renderNumberLine();

            if (this.accOn) {
                this.hacDivId = this.model.get('hacDivId');
                this._loadCanvasAcc();
            }

        },

        /**
        * Renders the number line.
        *
        * @method _renderNumberLine
        * @private
        **/
        _renderNumberLine: function () {

            var animate = this.model.get('animate');
            if (animate === true) {
                this.startPanning();
                this.fadeInEffect = true;
                return;
            }

            var model = this.model,
                utils = MathInteractives.Common.Utilities.Models.Utils,
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
                constantToDecideTickLength = 3,
                constantToDecideCenterTickLength = 5,
                textPaddingFromNumberLine = 16,
                minValue = null,
                maxValue = null,
                lineColor = null,
                textColor = null,
                numberOfIntervals = null,
                lineLength = null,
                lineWidth = null,
                tickPath = null,
                lineText = null,
                tickHeight = null,
                centerTickHeight = null,
                tickHitAreaSize = null,
                tickHitAreaHeight = null,
                partsHitAreaSize = null,
                self = this,
                ticksClickable = null,
                partsClickable = null,
                tickShape = null,
                displayWholeNumOnly = null,
                wholeNumToDisplay = null,
                denominator = null,
                toFixedDecimal = null,
                tickColor = null,
                integerTickColor = null,
                tickWidth = null,
                distanceBetweenTwoSticks = null,
                displayNumber = null,
                centerTickStartY = null,
                centerTickEndY = null,
                centerTickHeightBigger = null,
                tickLength = null,
                tickLengthAdjustment = null,
                zerothTickLengthAdjustment = null,
                textPadding = null,
                textStyle = null,
                absDisplayNo = null,
                toFixedInteger = null,
                animate = null,
                clickedRangeStartXCoordinate = null,
                clickedRangeEndXCoordinate = null,
                layer = null,
                opacity = 0.1,
                count = null,
                fadeInTimer = null,
                layers = null,
                layerIndex = null,
                arrowWidth = null,
                startSegmnetStartX = null,
                fadeInTime = 17,
                highlightData = null,
                tickHitAreaDimentions = null,
                showTicks = null,
                showLable = null,
                showBaseLine = null,
                showAlternateLableWhenOverlap = null,
                showAlternateAlways = null,
                skipTickCount = null,
                isOverlapping = null,
                customArrowSize = null,
                leftArrowTickDistance = null,
                rightArrowTickDistance = null;

            minValue = model.get('minValue');
            maxValue = model.get('maxValue');
            numberOfIntervals = model.get('numberOfIntervals');
            lineWidth = model.get('width');
            lineLength = model.get('length');
            lineColor = model.get('color');
            textColor = model.get('textColor');
            ticksClickable = model.get('ticksClickable');
            partsClickable = model.get('partsClickable');
            tickShape = model.get('tickShape');
            displayWholeNumOnly = model.get('displayWholeNumOnly');
            denominator = model.get('denominator');
            toFixedDecimal = model.get('toFixedDecimal');
            toFixedInteger = model.get('toFixedInteger');
            distanceBetweenTwoSticks = model.get('distanceBetweenTwoSticks');
            tickColor = model.get('tickColor');
            tickWidth = model.get('tickWidth');
            centerTickHeightBigger = model.get('centerTickHeightBigger');
            tickLength = model.get('tickLength');
            textPadding = model.get('textPadding');
            textStyle = model.get('textStyle');
            clickedRangeStartXCoordinate = model.get('clickedRangeStartXCoordinate');
            clickedRangeEndXCoordinate = model.get('clickedRangeEndXCoordinate');
            centerTickHeight = model.get('centerTickHeight');
            arrowWidth = model.get('arrowWidth');
            highlightData = model.get('highlightData');
            tickHitAreaDimentions = model.get('tickHitAreaDimentions'),
            showTicks = model.get('showTicks'),
            showLable = model.get('showLable'),
            showBaseLine = model.get('showBaseLine');
            showAlternateLableWhenOverlap = model.get('showAlternateLableWhenOverlap');
            showAlternateAlways = model.get('showAlternateAlways');
            customArrowSize = model.get('customArrowSize');
            leftArrowTickDistance = model.get('leftArrowTickDistance');
            rightArrowTickDistance = model.get('rightArrowTickDistance');
            skipTickCount = model.get('skipTickCount');
            skipTickCount++; // Important. Increases the skipTickCount by one because it's default value is zero.

            model.set('skipTickCount', skipTickCount);

            this.numberOfIntervals = numberOfIntervals;

            if (leftArrowTickDistance === null) {
                leftArrowTickDistance = theme2NumberLineClass.LEFT_ARROWHEAD_DISTANCE_FROM_MIN_VALUE;
            }

            if (rightArrowTickDistance === null) {
                rightArrowTickDistance = theme2NumberLineClass.RIGHT_ARROWHEAD_DISTANCE_FROM_MAX_VALUE;
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
            this.scope.activate();


            startPointX = theme2NumberLineClass.START_POINT_X_COORDINATE;
            startPointY = theme2NumberLineClass.START_POINT_Y_COORDINATE;
            endPointY = theme2NumberLineClass.END_POINT_Y_COORDINATE;

            endPointX = lineLength;
            //creating new layer.
            layer = new this.scope.Layer();

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
            var startLineSegment = new this.scope.Path.Line({
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

            var tickRectanglePath, lineSegmentPath, partRectanglePath;
            this.ticksGroup = new this.scope.Group();
            /*
            partsHitAreaGroup = new this.scope.Group();
            ticksHitAreaGroup = new this.scope.Group();
            */
            /* temporary fix for removing hover effect of disabled number line's last hovered element
            TODO: probably store last hovered element as a property rather than the partsHitAreaGroup, ticksHitAreaGroup*/
            this.partsHitAreaGroup = new this.scope.Group();
            this.ticksHitAreaGroup = new this.scope.Group();
            this.lineSegmentGroup = new this.scope.Group();

            this.textGroup = new this.scope.Group();
            this.highlightRangeGroup = new this.scope.Group();

            if (displayWholeNumOnly === true) {
                this._calculateInitailTicks();
            }

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
                    if (tickShape === theme2NumberLineClass.LINE) {
                        if (showTicks) { // Check whether the tick is to be shown or not.
                            tickPath = new this.scope.Path.Line({
                                from: [newStartPoint, zerothStartPointY],
                                to: [newStartPoint, zerothEndPointY],
                                strokeColor: tickColor,
                                strokeWidth: tickWidth
                            });
                        }
                    }
                    else if (tickShape === theme2NumberLineClass.CIRCLE) {
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
                                lineText.content = displayNumber;
                            }
                            if (showTicks) {
                                tickPath.strokeColor = integerTickColor;
                            }
                        }
                    }
                    else {
                        if (showLable) {
                            lineText.content = +(numToDisplay.toFixed(toFixedDecimal));
                        }
                    }

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
                    if (tickShape === theme2NumberLineClass.LINE) {
                        if (showTicks) {
                            tickPath = new this.scope.Path.Line({
                                from: [newStartPoint, newStartPointY],
                                to: [newStartPoint, newEndPointY],
                                strokeColor: tickColor,
                                strokeWidth: tickWidth
                            });
                        }
                    }
                    else if (tickShape === theme2NumberLineClass.CIRCLE) {
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
                                lineText.content = displayNumber;
                            }
                            if (showTicks) {
                                tickPath.strokeColor = integerTickColor;
                            }
                        }
                    }
                    else {
                        if (showLable) {
                            lineText.content = +(numToDisplay.toFixed(toFixedDecimal));
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
                //                if (tickShape === theme2NumberLineClass.CIRCLE) {
                //                    tickHitAreaSize = (tickHeight * 2) + 2;
                //                }
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
                            //partRectanglePath = new this.scope.Path.Rectangle(((newStartPoint + (constantToDecideCenterTickLength - constantToDecideTickLength)) + (tickHitAreaSize / 2)), (startPointY - (tickHitAreaHeight / 2)), partsHitAreaSize, tickHitAreaHeight);
                            partRectanglePath = new this.scope.Path.Rectangle((newStartPoint + 1), (startPointY - (tickHitAreaHeight / 2)), divisionWidth - 2, tickHitAreaHeight);
                            partRectanglePath.fillColor = new this.scope.Color(255, 255, 255, 0);

                        }
                        else {
                            //partRectanglePath = new this.scope.Path.Rectangle(((newStartPoint) + (tickHitAreaSize / 2)), (startPointY - (tickHitAreaHeight / 2)), partsHitAreaSize, tickHitAreaHeight);
                            partRectanglePath = new this.scope.Path.Rectangle((newStartPoint + 1), (startPointY - (tickHitAreaHeight / 2)), divisionWidth - 2, tickHitAreaHeight);
                            partRectanglePath.fillColor = new this.scope.Color(255, 255, 255, 0);
                        }
                        this.partsHitAreaGroup.addChild(partRectanglePath);
                    }
                    //partRectanglePath.bringToFront();
                }
                this.tickNumbersArr.push(numToDisplay);
                this.roundedTickNumbersArr.push(utils.roundUpValue(numToDisplay, toFixedDecimal));
                this.tickPointsXCoordinateArray.push(newStartPoint);
                model.set('lastTickPointX', newStartPoint);
                newStartPoint = newStartPoint + divisionWidth;

                textStartPointX = textStartPointX + divisionWidth;
                numToDisplay = (numToDisplay * Math.pow(10, 8) + unitValueOfDivision * Math.pow(10, 8)) / Math.pow(10, 8);
                //                                    numToDisplay = +(numToDisplay + unitValueOfDivision).toFixed(3);

                if (displayWholeNumOnly === true) {
                    this.tickCounter++;
                    if (this.tickCounter === Math.abs(denominator)) {
                        this.tickCounter = 0;
                    }
                }

                //tickPath.bringToFront();
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
                self.model.trigger(theme2NumberLineClass.Events.FADEIN_START);
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
                        self.model.trigger(theme2NumberLineClass.Events.ANIMATION_COMPLETE);
                    }
                    self.model.trigger(theme2NumberLineClass.Events.FADEIN_PROGRESS);
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

            this.scope.view.draw();
        },

        /**
        * Checks whether any of the lables overlaps eachother.
        *
        * @method _isLablesOverlapping
        * @private
        * @return isOverLapping {boolean} true or false depending on whether atleast one of the lables overlaps the next lable.
        **/

        _isLablesOverlapping: function _isLablesOverlapping() {
            var setOfLables = this.textGroup.children,
                lineWidth = this.lineSegmentGroup.children[0].bounds.width,
                counter = 0,
                endValue = setOfLables.length - 2,
                isOverLapping = false,
                requiredWidth = null,
                remainingWidth = null;

            for (; counter < endValue; counter++) {
                requiredWidth = setOfLables[counter].bounds.width / 2 + setOfLables[counter + 1].bounds.width / 2;
                remainingWidth = lineWidth - requiredWidth;
                if (remainingWidth < 3) {
                    isOverLapping = true;
                    break;
                }
            }

            return isOverLapping;
        },

        /**
        * Hides the required lables by setting their opacity to zero.
        *
        * @method _hideAlternateLables
        * @private
        **/

        _hideAlternateLables: function _hideAlternateLables() {
            var model = this.model,
                setOfLables = this.textGroup.children,
                counter = 0,
                endValue = setOfLables.length,
                skipTickCount = model.get('skipTickCount');

            for (; counter < endValue; counter++) {
                if (counter % skipTickCount !== 0) {
                    setOfLables[counter].opacity = 0;
                }
            }
        },

        /**
        * Finds the nearest tick and returns the tickValue, & its position in the form of object.
        *
        * @method getNearestTicksDetails
        * @public
        * @param x {Number} x coordinate with respect to canvas
        * @param y {Number} y coordinate with respect to canvas
        * @param isRoundedTickValue {boolean} whether the tick value should be rounded or not.
        * @return nearestTickObject {Object} Contains the tickValue & position of the tick.
        **/

        getNearestTicksDetails: function getNearestTickDetails(x, y, isRoundedTickValue) {
            var nearestTickObject = {
                'x': null,
                'y': null,
                'tickValue': null
            },
                xCoordinateSet = this.tickPointsXCoordinateArray,
                yCoordinateSet = this.tickPointsYCoordinateArray,
                tickNumberSet = this.tickNumbersArr,
                roundedTickNumberSet = this.roundedTickNumbersArr,
                counter = 0,
                endValue = xCoordinateSet.length,
                index = null,
                leastXDistance = Math.pow(100, 10),
                currentDistance = null;

            if (typeof (isRoundedTickValue) === 'undefined') {
                isRoundedTickValue = true;
            }

            for (; counter < endValue; counter++) {
                currentDistance = Math.abs(xCoordinateSet[counter] - x);
                if (currentDistance < leastXDistance) {
                    leastXDistance = currentDistance;
                    index = counter;
                }
            }

            nearestTickObject.x = xCoordinateSet[index];
            nearestTickObject.y = yCoordinateSet[index];
            if (isRoundedTickValue === true) {
                nearestTickObject.tickValue = roundedTickNumberSet[index];
            }
            else {
                nearestTickObject.tickValue = tickNumberSet[index];
            }

            return nearestTickObject;

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
                incrementFactor = 15,
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
                textPaddingFromNumberLine = this.model.get('textPaddingFromNumberLine');

            //rangeStartValue = this.model.get('clickedRangeStartValue');
            //clickedRangeStartXCoordinate = this.model.get('clickedRangeStartXCoordinate');
            //clickedRangeEndXCoordinate = this.model.get('clickedRangeEndXCoordinate');

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
                            lineText.content = +(maxVal.toFixed(toFixedDecimal));

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
                            lineText.content = +(minVal.toFixed(toFixedDecimal));

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
                self.model.trigger(theme2NumberLineClass.Events.ANIMATION_PROGRESS, { pan: true, zoom: false });
            }, animationTime);
        },




        /**
        * Zooms number line.
        *
        * @method startZooming
        * @param rangeData {object} contains start and ened x-coordinates of clicked range after panning.
        * @public
        **/
        startZooming: function startZooming(rangeData) {
            var self = this,
                scope = self.getPaperScope(),
                ticks = self.ticksGroup.children,
                labels = self.textGroup.children,
                minLimit = self.model.get('firstTickPointX'),
                maxLimit = self.model.get('lastTickPointX'),
                tickPathsFromLR = [],
                textPathsFromLR = [],
                tickPathsFromRL = [],
                textPathsFromRL = [],
                xLRIncrement = 15,
                xRLIncrement = 15,
                ticksIndex,
                currentTickPath, currentTextPath,
                startX = rangeData.rangeStartXCoordinate, endX = rangeData.rangeEndXCoordinate,
                rangeMidpoint = (startX + endX) / 2, scaleFactor = 0,
                time = 17, totalTime = 3000;




            var zoomingTimer = setInterval(function () {

                //Reinitialize the array of path
                tickPathsFromLR = [];
                textPathsFromLR = [];
                tickPathsFromRL = [];
                textPathsFromRL = [];
                for (ticksIndex = 0; ticksIndex < ticks.length; ticksIndex++) {
                    currentTickPath = ticks[ticksIndex];
                    currentTextPath = labels[ticksIndex];
                    if (currentTickPath.position.x > rangeMidpoint) {
                        tickPathsFromLR.push(currentTickPath);
                        textPathsFromLR.push(currentTextPath);
                    } else {
                        tickPathsFromRL.push(currentTickPath);
                        textPathsFromRL.push(currentTextPath);
                    }
                }

                //Code for paths need to move from right to left
                if (xRLIncrement > 0) {
                    //Decrementing for min limit check
                    startX -= xRLIncrement;
                    //initialize scale factor between the ticks
                    scaleFactor = tickPathsFromRL.length;

                    //looping between text and ticks path to move
                    for (ticksIndex = 0; ticksIndex < tickPathsFromRL.length; ticksIndex++) {
                        currentTickPath = tickPathsFromRL[ticksIndex];
                        currentTextPath = textPathsFromRL[ticksIndex];

                        //moves the tick and text, also scaling factor change according to index
                        currentTickPath.position.x -= xRLIncrement * scaleFactor;
                        currentTextPath.position.x -= xRLIncrement * scaleFactor;

                        //once reached the minLimit setting increment factor to 0
                        if (startX <= minLimit) {
                            currentTickPath.position.x = minLimit;
                            currentTextPath.position.x = minLimit;
                            xRLIncrement = 0;
                        }

                        //check for minlimit and setting the opacity of paths to 0
                        if (currentTickPath.position.x <= minLimit) {
                            currentTickPath.remove();
                            currentTextPath.remove();
                        }

                        scaleFactor--;


                        scope.view.draw();
                    }
                }

                //Code for paths need to move from left to right
                if (xLRIncrement > 0) {
                    //Decrementing for max limit check
                    endX += xLRIncrement;
                    //initialize scale factor between the ticks
                    scaleFactor = tickPathsFromLR.length - 1;

                    //looping between text and ticks path to move
                    for (ticksIndex = 0; ticksIndex < tickPathsFromLR.length; ticksIndex++) {
                        currentTickPath = tickPathsFromLR[ticksIndex];
                        currentTextPath = textPathsFromLR[ticksIndex];

                        //moves the tick and text, also scaling factor change according to index
                        currentTickPath.position.x += xLRIncrement * (ticksIndex + 1);
                        currentTextPath.position.x += xLRIncrement * (ticksIndex + 1);


                        //once reached the maxLimit setting increment factor to 0
                        if (endX >= maxLimit) {
                            currentTickPath.position.x = maxLimit;
                            currentTextPath.position.x = maxLimit;

                            xLRIncrement = 0;
                        }

                        //check for maxlimit and setting the opacity of paths to 0
                        if (currentTickPath.position.x >= maxLimit) {
                            currentTickPath.remove();
                            currentTextPath.remove();
                        }


                        scaleFactor--;
                        scope.view.draw();
                    }

                }

                //Stops the timer when both the increment factor sets to 0
                if (xLRIncrement === 0 && xRLIncrement === 0) {
                    clearInterval(zoomingTimer);
                    //self.disableNumberLine = false;
                    self.model.set('animate', false);
                    self._renderNumberLine();
                    self.removeNumberLineHover();
                    //self.model.trigger(theme2NumberLineClass.Events.ANIMATION_COMPLETE);
                }

                self.model.trigger(theme2NumberLineClass.Events.ANIMATION_PROGRESS, { pan: false, zoom: true });
            }, time);

            scope.view.draw();
        },


        /**
        * Calculate the number of sticks before the first whole number to be displayed and the tick counter is set accordingly.
        *
        * @method _calculateInitailTicks
        * @private
        */

        _calculateInitailTicks: function _calculateInitailTicks() {
            var model = this.model,
                minValue = model.get('minValue'),
                unitValueOfDivision = model.get('tickInterval'),
                denominator = Math.abs(model.get('denominator')),
                tickNumber = 0,
                noToCheck,
                requiredDifference;

            noToCheck = Math.ceil(minValue);

            if (minValue === parseInt(minValue)) {
                this.tickCounter = 0;
            }
            else {
                requiredDifference = Math.abs(minValue) - Math.abs(noToCheck);
                tickNumber = Math.abs(Math.round(requiredDifference / unitValueOfDivision));
                this.tickCounter = denominator - tickNumber;
            }

        },

        /**
        * Draws arrowheads/triangles at both ends of number line
        *
        * @method _drawArrowHeadsAtNumberLineEnds
        * @param startPointX {Number} starting x-coordinate
        * @param startPointY {Number} starting y-coordinate
        * @param endPointX {Number} ending x-coordinate
        * @param endPointY {Number} ending y-coordinate
        * @param lineColor {String} Color of the line
        * @param tickHeight {Number} Height of the tick
        * @param constantToDecideTickLength {Number} contant value to decide length of tick.
        * @private
        **/
        _drawArrowHeadsAtNumberLineEnds: function (startPointX, startPointY, endPointX, endPointY, lineColor, tickHeight, constantToDecideTickLength) {

            var model = this.model,
                leftTriangle, rightTriangle, arrowWidth, leftArrowStartPoint, actualArrowWidth, rightArrowStartPoint,
                triangleColor = model.get('triangleColor');

            if (triangleColor === null) {
                triangleColor = lineColor;
            }
            //triangleSideLength = newEndPointY - newStartPointY;
            model.set('tickHeight', tickHeight);
            arrowWidth = this.model.get('arrowWidth', arrowWidth);
            if (arrowWidth) {
                actualArrowWidth = (arrowWidth * 2 / 3);
                leftArrowStartPoint = startPointX + (2 * arrowWidth / 3);
                rightArrowStartPoint = (endPointX - 1) - (2 * arrowWidth / 3);
            }
            else {
                actualArrowWidth = tickHeight - constantToDecideTickLength;
                leftArrowStartPoint = startPointX;
                rightArrowStartPoint = endPointX;
            }

            leftTriangle = new this.scope.Path.RegularPolygon(new this.scope.Point(leftArrowStartPoint, startPointY), theme2NumberLineClass.NUMBER_OF_POLYGON_SIDES, actualArrowWidth);
            leftTriangle.fillColor = triangleColor;
            leftTriangle.rotate(30);
            rightTriangle = new this.scope.Path.RegularPolygon(new this.scope.Point(rightArrowStartPoint, endPointY), theme2NumberLineClass.NUMBER_OF_POLYGON_SIDES, actualArrowWidth);
            rightTriangle.fillColor = triangleColor;
            rightTriangle.rotate(-30);
        },

        /**
        * Draws customized arrowheads/triangles at both ends of number line
        *
        * @method _drawCustomArrowHeadsAtNumberLineEnds
        * @param endPointY {Number} ending y-coordinate
        * @param lineColor {String} Color of the line
        * @param tickHeight {Number} Height of the tick
        * @param startLineSegment {Object} start line segment of number line.
        * @param endLineSegment {Object} end line segment of number line.
        * @private
        **/

        _drawCustomArrowHeadsAtNumberLineEnds: function _drawCustomArrowHeadsAtNumberLineEnds(endPointY, lineColor, tickHeight, startLineSegment, endLineSegment) {
            var model = this.model,
                _currentScope = this.scope,
                leftTrianglePath,
                rightTrianglePath,
                arrowWidth = model.get('arrowWidth', arrowWidth),
                leftArrowStartPoint,
                rightArrowStartPoint,
                triangleColor = model.get('triangleColor'),
                arrowHeight = model.get('arrowHeight');

            if (triangleColor === null) {
                triangleColor = lineColor;
            }
            model.set('tickHeight', tickHeight);
            if (arrowWidth === null) {
                arrowWidth = 10;
            }

            if (arrowHeight === null) {
                arrowHeight = arrowWidth;
            }

            leftArrowStartPoint = startLineSegment.firstSegment.point.x;
            rightArrowStartPoint = endLineSegment.lastSegment.point.x;

            leftTrianglePath = new _currentScope.Path();
            leftTrianglePath.fillColor = triangleColor;
            leftTrianglePath.add(new _currentScope.Point(leftArrowStartPoint, endPointY - arrowWidth / 2));
            leftTrianglePath.add(new _currentScope.Point(leftArrowStartPoint, endPointY + arrowWidth / 2));
            leftTrianglePath.add(new _currentScope.Point(leftArrowStartPoint - arrowHeight, endPointY));

            rightTrianglePath = new _currentScope.Path();
            rightTrianglePath.fillColor = triangleColor;
            rightTrianglePath.add(new _currentScope.Point(rightArrowStartPoint, endPointY - arrowWidth / 2));
            rightTrianglePath.add(new _currentScope.Point(rightArrowStartPoint, endPointY + arrowWidth / 2));
            rightTrianglePath.add(new _currentScope.Point(rightArrowStartPoint + arrowHeight, endPointY));
        },

        /**
        * Handles tick click.
        *
        * @method setTickClick
        * @public
        * @param numberOfIntervals {Number} Number of intervals
        * @param ticksHitAreaGroup {object} group of tick hit area
        * @param ticksGroup {object} group of ticks
        **/
        bindTickClick: function (numberOfIntervals, ticksHitAreaGroup, ticksGroup) {
            //if (this.player.getModalPresent() === true) { /* moved inside onClick method below */
            //    return;
            //}
            var count, tickValue, xCoordinateOfTick, yCoordinate, childElement, tickElement, self = this;

            for (count = 0; count <= numberOfIntervals; count++) {
                childElement = ticksHitAreaGroup.children[count];
                tickElement = ticksGroup.children[count];
                childElement.onClick = function (event) {
                    if (self.player.getModalPresent() === true || self.disableNumberLine === true || event.event.which !== 1) { /* moved inside */
                        return;
                    }
                    count = this.index;
                    tickValue = self.tickNumbersArr[count];
                    xCoordinateOfTick = self.tickPointsXCoordinateArray[count];
                    yCoordinate = self.tickPointsYCoordinateArray[count];
                    self.setStartValue(tickValue, xCoordinateOfTick, yCoordinate);
                }
                //tickElement.onClick = function (event) {
                //    if (self.player.getModalPresent() === true || self.disableNumberLine === true || event.event.which !== 1) { /* moved inside */
                //        return;
                //    }
                //    count = this.index;
                //    tickValue = self.tickNumbersArr[count];
                //    xCoordinateOfTick = self.tickPointsXCoordinateArray[count];
                //    yCoordinate = self.tickPointsYCoordinateArray[count];
                //    self.setStartValue(tickValue, xCoordinateOfTick, yCoordinate);
                //}
            }
        },
        /**
        * Unbinds tick click handlers
        *
        * @method unbindTickClick
        * @param numberOfIntervals {Number} Number of intervals
        * @param ticksHitAreaGroup {object} group of tick hit area
        * @param ticksGroup {object} group of ticks
        * @public
        **/
        unbindTickClick: function (numberOfIntervals, ticksHitAreaGroup, ticksGroup) {
            var count, childElement, tickElement, self = this,
                numberOfIntervals = this.model.get('numberOfIntervals');

            for (count = 0; count <= numberOfIntervals; count++) {
                childElement = self.ticksHitAreaGroup.children[count];
                tickElement = self.ticksGroup.children[count];
                childElement.off('click');
                //tickElement.off('click');
            }
        },
        /**
        * Bind click callback on range/part/interval.
        *
        * @method bindPartClick
        * @param numberOfIntervals {Number} Number of intervals
        * @param partsHitAreaGroup {object} group of parts hit area
        * @param lineSegmentGroup {object} group of line segments
        * @public
        **/
        bindPartClick: function (numberOfIntervals, partsHitAreaGroup, lineSegmentGroup) {
            var count, rangeStartValue, rangeEndValue, lineElement, rangeStartXCoordinate, clickedRangeObject, rangeEndXCoordinate, yCoordinate, childElement, rangeValues = [], self = this;
            for (count = 0; count < numberOfIntervals; count++) {
                childElement = partsHitAreaGroup.children[count];
                lineElement = lineSegmentGroup.children[count];
                childElement.onClick = function (event) {
                    if (self.disableNumberLine === true || event.event.which !== 1) {
                        return;
                    }
                    self.stopReading();
                    count = this.index;
                    rangeStartValue = self.tickNumbersArr[count];
                    rangeEndValue = self.tickNumbersArr[count + 1];
                    rangeStartXCoordinate = self.tickPointsXCoordinateArray[count];
                    rangeEndXCoordinate = self.tickPointsXCoordinateArray[count + 1];
                    yCoordinate = self.tickPointsYCoordinateArray[count];
                    clickedRangeObject = {
                        rangeStartValue: rangeStartValue,
                        rangeEndValue: rangeEndValue,
                        rangeStartXCoordinate: rangeStartXCoordinate,
                        rangeEndXCoordinate: rangeEndXCoordinate,
                        yCoordinate: yCoordinate
                    };
                    self.setRangeValues(clickedRangeObject);
                    //self.startPanning();
                }
                //lineElement.onClick = function (event) {
                //    if (self.disableNumberLine === true || event.event.which !== 1) {
                //        return;
                //    }
                //    self.stopReading();
                //    count = this.index;
                //    rangeStartValue = self.tickNumbersArr[count];
                //    rangeEndValue = self.tickNumbersArr[count + 1];
                //    rangeStartXCoordinate = self.tickPointsXCoordinateArray[count];
                //    rangeEndXCoordinate = self.tickPointsXCoordinateArray[count + 1];
                //    yCoordinate = self.tickPointsYCoordinateArray[count];
                //    clickedRangeObject = {
                //        rangeStartValue: rangeStartValue,
                //        rangeEndValue: rangeEndValue,
                //        rangeStartXCoordinate: rangeStartXCoordinate,
                //        rangeEndXCoordinate: rangeEndXCoordinate,
                //        yCoordinate: yCoordinate
                //    };
                //    self.setRangeValues(clickedRangeObject);
                //    //self.startPanning();
                //}
            }
        },
        /**
        * Unbinds click on range/part/interval.
        *
        * @method unbindPartClick
        * @public
        **/
        unbindPartClick: function () {
            var count, lineElement, childElement, self = this,
                numberOfIntervals = this.model.get('numberOfIntervals');
            for (count = 0; count < numberOfIntervals; count++) {
                childElement = self.partsHitAreaGroup.children[count];
                lineElement = self.lineSegmentGroup.children[count];
                childElement.off('click');
                //lineElement.off('click');
            }
        },

        /**
        * sets value of tick which is clicked.
        *
        * @method setStartValue
        * @param tickValue {Number} value of the tick
        * @param xCoordinateOfTick {Number} x-coordinate of the tick
        * @param yCoordinate {Number} y-coordinate of the tick
        * @public
        **/
        setStartValue: function (tickValue, xCoordinateOfTick, yCoordinate) {
            this.tickValue = tickValue;
            this.model.set('clickedTickValue', this.tickValue);
            this.model.trigger(theme2NumberLineClass.Events.TICK_CLICK, { tickValue: this.tickValue, xCoordinateOfTick: xCoordinateOfTick });
        },

        /**
        * sets start and end values of range which is clicked.
        *
        * @method setStartValue
        * @param clickedRangeObject {object} clicked range
        * @public
        **/
        setRangeValues: function (clickedRangeObject) {
            this.rangeStratValue = clickedRangeObject.rangeStartValue;
            this.rangeEndValue = clickedRangeObject.rangeEndValue;
            //            this.model.set('clickedRangeStartValue', rangeStartValue);
            //            this.model.set('clickedRangeEndValue', rangeEndValue);
            //            this.model.set('clickedRangeStartXCoordinate', rangeStartXCoordinate);
            //            this.model.set('clickedRangeEndXCoordinate', rangeEndXCoordinate);
            this.model.set('clickedRangeObject', clickedRangeObject);

            this.model.trigger(theme2NumberLineClass.Events.RANGE_CLICK, {
                startValue: clickedRangeObject.rangeStartValue,
                endValue: clickedRangeObject.rangeEndValue,
                rangeStartXCoordinate: clickedRangeObject.rangeStartXCoordinate,
                rangeEndXCoordinate: clickedRangeObject.rangeEndXCoordinate,
                yCoordinate: clickedRangeObject.yCoordinate
            });

        },



        /**
        * Sets highlight effect to ticks.
        *
        * @method setHighlightEffectForTicks
        * @param numberOfIntervals {Number} number of Intervals
        * @param ticksHitAreaGroup {object} group of tick hit area
        * @param ticksGroup {object} group of ticks
        * @param lineColor {String} color of the line
        * @param highlightData {object} Details of the highlighted part
        * @public
        **/
        setHighlightEffectForTicks: function (numberOfIntervals, ticksHitAreaGroup, ticksGroup, lineColor, highlightData) {
            var count, childElement, tickElement, blackTick, canvas, self = this, tickHitPath, highlightData,
                mouseEnterListener, mouseLeaveListener, supportTouch = $.support.touch;
            canvas = this.$('#' + this.idPrefix + 'number-line-canvas');
            highlightData = highlightData || {};

            for (count = 0; count <= numberOfIntervals; count++) {
                childElement = ticksHitAreaGroup.children[count];
                mouseEnterListener = function (event) {
                    if (self.player.getModalPresent() === true) {
                        return;
                    }
                    count = this.index;
                    blackTick = ticksGroup.children[count];
                    if (self.disableNumberLine === true) {
                        blackTick.fillColor = lineColor;
                        if (!supportTouch) {
                            canvas.css('cursor', 'pointer');
                        }
                    }
                    else {
                        if (highlightData.highlightPath) {
                            blackTick.fillColor = 'red';
                        }
                        else {
                            this.fillColor = highlightData.color;
                            this.opacity = highlightData.opacity;
                        }
                        //blackTick.fillColor = 'red';
                        if (!supportTouch) {
                            canvas.css('cursor', 'pointer');
                        }
                    }
                }
                if (supportTouch) {
                    childElement.onMouseDown = mouseEnterListener;
                } else {
                    childElement.onMouseEnter = mouseEnterListener;
                }


                mouseLeaveListener = function (event) {
                    /*if (self.player.getModalPresent() === true || self.disableNumberLine === true) {
                    return;
                    }*/
                    count = this.index;
                    blackTick = ticksGroup.children[count];
                    blackTick.fillColor = lineColor;
                    this.fillColor = new self.scope.Color(255, 255, 255, 0);
                    if (!supportTouch) {
                        canvas.css('cursor', 'default');
                    }
                }
                if (supportTouch) {
                    childElement.onMouseUp = mouseLeaveListener;
                    childElement.onMouseDrag = mouseLeaveListener;
                } else {
                    childElement.onMouseLeave = mouseLeaveListener;
                }
            }
            //for (count = 0; count <= numberOfIntervals; count++) {
            //    childElement = ticksGroup.children[count];
            //    childElement.onMouseEnter = function (event) {
            //        if (self.player.getModalPresent() === true) {
            //            return;
            //        }
            //        count = this.index;
            //        tickHitPath = ticksHitAreaGroup.children[count];
            //        if (self.disableNumberLine === true) {
            //            this.fillColor = lineColor;
            //            if (!supportTouch) {
            //                canvas.css('cursor', 'pointer');
            //            }
            //        }
            //        else {
            //            if (highlightData.highlightPath) {
            //                this.fillColor = 'red';
            //            }
            //            else {
            //                tickHitPath.fillColor = highlightData.color;
            //                tickHitPath.opacity = highlightData.opacity;
            //            }
            //            //this.fillColor = 'red';
            //            if (!supportTouch)
            //                canvas.css('cursor', 'pointer');
            //        }
            //    }
            //    childElement.onMouseLeave = function (event) {
            //        /*if (self.player.getModalPresent() === true || self.disableNumberLine === true) {
            //        return;
            //        }*/
            //        count = this.index;
            //        tickHitPath = ticksHitAreaGroup.children[count];
            //        this.fillColor = lineColor;
            //        tickHitPath.fillColor = new self.scope.Color(255, 255, 255, 0);
            //        if (!supportTouch) {
            //            canvas.css('cursor', 'pointer');
            //        }
            //    }
            //}
        },
        /**
        * Unsets highlight effect of ticks.
        *
        * @method unsetHighlightEffectForTicks
        * @param numberOfIntervals {Number} number of Intervals
        * @public
        **/
        unsetHighlightEffectForTicks: function (numberOfIntervals) {
            var count, childElement, self = this,
                canvas = this.$('#' + this.idPrefix + 'number-line-canvas'),
                numberOfIntervals = this.model.get('numberOfIntervals');

            for (count = 0; count <= numberOfIntervals; count++) {
                childElement = self.ticksHitAreaGroup.children[count];
                childElement.off('mouseenter');
                childElement.trigger('mouseleave');
                childElement.off('mouseleave');
            }
            //for (count = 0; count <= numberOfIntervals; count++) {
            //    childElement = self.ticksGroup.children[count];
            //    childElement.off('mouseenter');
            //    childElement.trigger('mouseleave');
            //    childElement.off('mouseleave');
            //}
        },
        /**
        * Sets highlight effect to line segments.
        *
        * @method setHighlightEffectForParts
        * @param numberOfIntervals {Number} number of Intervals
        * @param partsHitAreaGroup {object} group of parts hit area
        * @param lineSegmentGroup {object} group of line segments
        * @param lineWidth {Number} width of the line
        * @param lineColor {String} color of the line
        * @param highlightData {object} Details of the highlighted part
        * @public
        **/
        setHighlightEffectForParts: function (numberOfIntervals, partsHitAreaGroup, lineSegmentGroup, lineWidth, lineColor, highlightData) {
            var path, childElement, count, self = this, lineSegment, canvas, highlightData, rangeSegment,
                mouseEnterListener, mouseLeaveListener, supportTouch = this._isMobile;
            highlightData = highlightData || {};

            canvas = this.$('#' + this.idPrefix + 'number-line-canvas');

            for (count = 0; count < numberOfIntervals; count++) {
                childElement = partsHitAreaGroup.children[count];
                mouseEnterListener = function (event) {
                    if (self.player.getModalPresent() === true) {
                        return;
                    }
                    count = this.index;
                    lineSegment = lineSegmentGroup.children[count];
                    if (self.disableNumberLine === true) {
                        lineSegment.strokeColor = lineColor;
                        if (!supportTouch) {
                            canvas.css('cursor', 'default');
                        }
                    }
                    else {
                        if (highlightData.highlightPath) {
                            lineSegment.strokeColor = 'red';
                        }
                        else {
                            this.fillColor = highlightData.color;
                            this.opacity = highlightData.opacity;
                        }
                        if (!supportTouch) {
                            canvas.css('cursor', 'pointer');
                        }
                    }
                }
                //if (supportTouch) {
                //    childElement.onMouseDown = mouseEnterListener;
                //}
                //else {
                //    childElement.onMouseEnter = mouseEnterListener;
                //}

                mouseLeaveListener = function (event) {
                    /*if (self.player.getModalPresent() === true || self.disableNumberLine === true) {
                    return;
                    }*/
                    count = this.index;
                    lineSegment = lineSegmentGroup.children[count];
                    lineSegment.strokeColor = lineColor;
                    this.fillColor = new self.scope.Color(255, 255, 255, 0);
                    if (!supportTouch) {
                        canvas.css('cursor', 'default');
                    }
                    self.scope.view.draw();
                }

                childElement.onMouseLeave = mouseLeaveListener;
                childElement.onMouseEnter = mouseEnterListener;
                childElement.onMouseDrag = mouseLeaveListener;

                childElement.onMouseDown = mouseEnterListener;
                childElement.onMouseUp = mouseLeaveListener;

                //if (supportTouch) {
                //    childElement.onMouseUp = mouseLeaveListener;
                //    childElement.onMouseDrag = mouseLeaveListener;
                //}
                //else {
                //    childElement.onMouseLeave = mouseLeaveListener;
                //}
            }

            //for (count = 0; count < numberOfIntervals; count++) {
            //    childElement = lineSegmentGroup.children[count];

            //    childElement.onMouseEnter = function (event) {
            //        if (self.player.getModalPresent() === true) {
            //            return;
            //        }
            //        count = this.index;
            //        //lineSegment = lineSegmentGroup.children[count];
            //        rangeSegment = partsHitAreaGroup.children[count];
            //        if (self.disableNumberLine === true) {
            //            this.strokeColor = lineColor;
            //            if (!$.support.touch) {
            //                canvas.css('cursor', 'pointer');
            //            }
            //        }
            //        else {
            //            if (highlightData.highlightPath) {
            //                this.strokeColor = 'red';
            //            }
            //            else {
            //                rangeSegment.fillColor = highlightData.color;
            //                rangeSegment.opacity = highlightData.opacity;
            //            }
            //            canvas.css('cursor', 'pointer');
            //        } self.scope.view.draw();
            //    }
            //    childElement.onMouseLeave = function (event) {
            //        /*if (self.player.getModalPresent() === true || self.disableNumberLine === true) {
            //        return;
            //        }*/
            //        count = this.index;
            //        //lineSegment = lineSegmentGroup.children[count];
            //        rangeSegment = partsHitAreaGroup.children[count];
            //        this.strokeColor = lineColor;
            //        rangeSegment.fillColor = new self.scope.Color(255, 255, 255, 0);
            //        if (!$.support.touch) {
            //            canvas.css('cursor', 'pointer');
            //        } self.scope.view.draw();
            //    }
            //}
        },
        /**
        * Unsets highlight effect of line segments.
        *
        * @method unsetHighlightEffectForParts
        * @public
        **/
        unsetHighlightEffectForParts: function () {
            var childElement, count, self = this, canvas,
                numberOfIntervals = this.model.get('numberOfIntervals');

            canvas = this.$('#' + this.idPrefix + 'number-line-canvas');
            for (count = 0; count < numberOfIntervals; count++) {
                childElement = self.partsHitAreaGroup.children[count];
                childElement.off('mouseenter');
                childElement.trigger('mouseleave');
                childElement.off('mouseleave');
            }

            //for (count = 0; count < numberOfIntervals; count++) {
            //    childElement = self.lineSegmentGroup.children[count];
            //    childElement.off('mouseenter');
            //    childElement.trigger('mouseleave');
            //    childElement.off('mouseleave');
            //}
        },

        /**
        * Removes hover effects by triggering mouseleave of all ticks & part segments as a temporary fix 
        * @method removeNumberLineHover
        */
        removeNumberLineHover: function removeNumberLineHover() {
            var count,
                partsHitAreaGroup = this.partsHitAreaGroup,
                ticksHitAreaGroup = this.ticksHitAreaGroup;
            if (ticksHitAreaGroup.children.length) {
                for (count = this.numberOfIntervals; count >= 0; count--) {
                    ticksHitAreaGroup.children[count].trigger('mouseleave');
                }
            }
            if (partsHitAreaGroup.children.length) {
                for (count = this.numberOfIntervals - 1; count >= 0; count--) {
                    partsHitAreaGroup.children[count].trigger('mouseleave');
                }
            }
            this.scope.view.draw();
        },
        /**
        * Enables or disable the number-line and its events
        * @method enableDisableNumberLine
        * @param enable {Boolean} true to enable, false to disable
        * @param ticks {Boolean} true enables/disables ticks
        * @param parts {Boolean} true enables/disable parts
        * @public
        */
        enableDisableNumberLine: function (enable, ticks, parts) {
            if (ticks === null || ticks === undefined) ticks = true;
            if (parts === null || parts === undefined) parts = true;
            if (enable) {
                var numberOfIntervals = this.model.get('numberOfIntervals'),
                    lineWidth = this.model.get('lineWidth'),
                    lineColor = this.model.get('lineColor');
                if (parts) {
                    this.setHighlightEffectForParts(numberOfIntervals, this.partsHitAreaGroup, this.lineSegmentGroup, lineWidth, lineColor);
                    this.bindPartClick(numberOfIntervals, this.partsHitAreaGroup, this.lineSegmentGroup);
                }
                if (ticks) {
                    this.setHighlightEffectForTicks(numberOfIntervals, this.ticksHitAreaGroup, this.ticksGroup, lineColor);
                    this.bindTickClick(numberOfIntervals, this.ticksHitAreaGroup, this.ticksGroup);
                }
            }
            else {
                if (parts) {
                    this.unsetHighlightEffectForParts();
                    this.unbindPartClick();
                }
                if (ticks) {
                    this.unsetHighlightEffectForTicks();
                    this.unbindTickClick();
                }
            }
        },



        /**
        * Gets all current paper objects on canvas for Accessibility
        *     
        * @method getPaperObjects
        * @param {boolean} [isLineClickable] line is clickable or not.
        * return {Array} [paperObj] array of paper objects
        **/
        getPaperObjects: function (isLineClickable) {
            var parts, ticks, currSegment, count,
                ticksClickable, partsClickable,
                model = this.model,
                paperObj = [];

            ticksClickable = model.get('ticksClickable');
            partsClickable = model.get('partsClickable');

            if (isLineClickable) {
                if (ticksClickable) {
                    ticks = this.ticksHitAreaGroup.children;
                    for (count = 0; count < ticks.length; count++) {
                        paperObj.push(ticks[count]);
                    }
                }
                if (partsClickable) {
                    parts = this.partsHitAreaGroup.children;
                    for (count = 0; count < parts.length; count++) {
                        paperObj.push(parts[count]);
                    }
                }
            }
            return paperObj;
        },

        createNumberLineHacDiv: function (id) {
            this.hacDivId = id;
        },

        /**
        * Loads the canvas
        *
        * @method _loadCanvasAcc
        * @private
        **/
        _loadCanvasAcc: function () {
            /**
            * Used For Accessibility...
            **/
            this._initAccessibility();
            this._bindAccessibilityListeners();
        },
        /**
        * Initializes accessibility
        *
        * @method _initAccessibility
        * @private
        */
        _initAccessibility: function () {
            var self = this, canvasAccOption;

            canvasAccOption = {
                canvasHolderID: this.idPrefix + this.hacDivId,
                paperItems: [],
                paperScope: this.scope,
                manager: this.manager,
                player: this.player
            };

            this.canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc(canvasAccOption);
            this.canvasAcc.updatePaperItems(this.getPaperObjects(true));
            this.loadedAcc = true;
        },


        /**
        * bind listeners to accessibility
        *
        * @method _bindAccessibilityListeners
        * @private
        */
        _bindAccessibilityListeners: function () {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $('#' + this.idPrefix + this.hacDivId),
                self = this;

            // Handle tab
            $canvasHolder.off(keyEvents.TAB).on(keyEvents.TAB, function (event, data) {
                var item = data.item,
                    count = item.index,
                    isTab = false,
                    rangeStartValue = null,
                    rangeEndValue = null,
                    clickedRangeObject = null;

                item.fire('mouseenter', event);

                rangeStartValue = self.tickNumbersArr[count];
                rangeEndValue = self.tickNumbersArr[count + 1];
                if (self.previousItem && item.index > self.previousItem.index) {
                    isTab = true;
                }
                if (!self.previousItem) {
                    isTab = true;
                }
                clickedRangeObject = {
                    rangeStartValue: rangeStartValue,
                    rangeEndValue: rangeEndValue,
                    index: item.index,
                    isTab: isTab
                };

                if (self.previousItem) {
                    self.previousItem.fire('mouseleave', event);
                }
                self.previousItem = item;
                self.model.trigger(theme2NumberLineClass.Events.RANGE_TAB, clickedRangeObject);
            });

            // Handle space
            $canvasHolder.off(keyEvents.SPACE).on(keyEvents.SPACE, function (event, data) {
                var item = data.item;
                self.previousItem = item;
                event.event = {};
                event.event.which = 1;
                event.isSpace = true;
                item.fire('click', event);
            });

            // Handle focus out
            $canvasHolder.off(canvasEvents.FOCUS_OUT).on(canvasEvents.FOCUS_OUT, function (event, data) {
                if (self.previousItem) {
                    self.previousItem.fire('mouseleave', event);
                }
                self.removeNumberLineHover();
                self.model.trigger(theme2NumberLineClass.Events.FOCUS_OUT);
                self.previousItem = null;
            });
        },


        /**
        * Returns paper scope.
        *
        * @method getPaperScope
        * @return this.scope {object} scope of the paper.
        * @public
        **/
        getPaperScope: function () {
            return this.scope;
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
            FOCUS_OUT: 'focus-out'
        },

        generateNumberLine: function (options) {
            if (options) {
                var numberLineModel, numberLineView, el;
                el = options.containerId;
                numberLineModel = new MathInteractives.Common.Components.Theme2.Models.NumberLine(options);
                numberLineView = new MathInteractives.Common.Components.Theme2.Views.NumberLine({ model: numberLineModel, el: el });
                return numberLineView;
            }
        }
    });
    MathInteractives.global.Theme2.NumberLine = MathInteractives.Common.Components.Theme2.Views.NumberLine;
    theme2NumberLineClass = MathInteractives.Common.Components.Theme2.Views.NumberLine;
})();