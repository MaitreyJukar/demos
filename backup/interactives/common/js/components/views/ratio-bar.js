(function () {
    'use strict';
    MathInteractives.Common.Components.Views.RatioBar = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Position of the line separating the two colors.
        * @property colorSeparatorPosition
        * @type Number
        * @default 0
        */
        colorSeparatorPosition: 0,

        initialize: function () {
            this._attachEvents();
            this._render();
        },

        /**
        * Binds model on change event to the view instance
        * @method _attachEvents
        * @private
        */
        _attachEvents: function () {
            var modelObject = this.model;
            this.listenTo(modelObject, 'change', this._render);
        },

        /**
        * Renders the ratio bar.
        * @method _render
        * @private
        */
        _render: function () {
            if (!(this.$el)) {
                return;
            }
            this.$('.ratio-bar-antecedent-divs').remove();
            this.$('.ratio-bar-consequent-divs').remove();
            this.$('.ratio-bar-separator').remove();

            var modelObject = this.model,
                widthOfRatioBar = modelObject.getWidthOfRatioBar(),
                heightOfRatioBar = modelObject.getHeightOfRatioBar();

            this.$el.css({ 'width': widthOfRatioBar, 'height': heightOfRatioBar });

            this._createRatioBar(modelObject.getBarType());
        },

        /**
        * Creates DIVs inside the ratio bar to represent the ratio.
        * @method _createRatioBar
        * @param barType {String} The type of ratio bar to be drawn
        * @private
        */
        _createRatioBar: function _createRatioBar(barType) {
            var modelObject = this.model,
                modelClass = MathInteractives.Common.Components.Models.RatioBar,

                defaultColorOfRatioBar = modelObject.getDefaultColorOfRatioBar(),
                leftSideColor = modelObject.getLeftSideColor(),
                rightSideColor = modelObject.getRightSideColor(),
                colorSeparatorLineColor = modelObject.getRatioSeperatorLineColor(),
                colorQuantLineColor = modelObject.getColorQuantLineColor(),

                leftSideRatioCount = modelObject.getLeftSideRatioCount(),
                rightSideRatioCount = modelObject.getRightSideRatioCount(),

                widthOfRatioBar = modelObject.getWidthOfRatioBar(),
                heightOfRatioBar = modelObject.getHeightOfRatioBar(),

                ratioSeparatorLineWidth = modelObject.getRatioSeparatorLineWidth(),
                colorQuantLineWidth = modelObject.getColorQuantLineWidth(),

                actualWidthToDivide,        // width excluding borders of individual divs and separator div's width.
                extraPixels,                // pixels remained after dividing actual width with total antecedent and consequent.

                count,
                $tempDiv,

                tempDivWidth,               // width of individual div after diving actual width.
                extraTempDivWidth,          // larger width to compensate extra pixels.
                divWidth;

            switch (barType) {

                case modelClass.ratioBarTypes.defaultBar:
                    this.$el.css({ 'background-color': defaultColorOfRatioBar });
                    this.colorSeparatorPosition = 0;
                    break;

                case modelClass.ratioBarTypes.onlyLeftRatioBar:
                    actualWidthToDivide = widthOfRatioBar - (colorQuantLineWidth * (leftSideRatioCount - 1));
                    extraPixels = actualWidthToDivide % leftSideRatioCount;

                    tempDivWidth = Math.floor(actualWidthToDivide / (leftSideRatioCount));
                    extraTempDivWidth = tempDivWidth + 1;

                    for (count = 0; count < leftSideRatioCount; count++) {
                        // compensate with last 'extraPixels' no. of div's incresed width
                        if (count > leftSideRatioCount - extraPixels - 1) {
                            divWidth = extraTempDivWidth;
                        }
                        else {
                            divWidth = tempDivWidth;
                        }

                        $tempDiv = $('<div></div>').addClass('ratio-bar-antecedent-divs')
                            .css({
                                'width': divWidth,
                                'border-right-width': colorQuantLineWidth,
                                'border-color': colorQuantLineColor,
                                'background-color': leftSideColor
                            })
                            .appendTo(this.$el);

                        // No right border for last div
                        if (count === leftSideRatioCount - 1) {
                            $tempDiv.css({ 'border-width': 0 });
                        }
                    }

                    this.colorSeparatorPosition = widthOfRatioBar;

                    break;

                case modelClass.ratioBarTypes.onlyRightRatioBar:
                    actualWidthToDivide = widthOfRatioBar - (colorQuantLineWidth * (rightSideRatioCount - 1));
                    extraPixels = actualWidthToDivide % rightSideRatioCount;

                    tempDivWidth = Math.floor(actualWidthToDivide / (rightSideRatioCount));
                    extraTempDivWidth = tempDivWidth + 1;

                    for (count = 0; count < rightSideRatioCount; count++) {
                        // compensate with last 'extraPixels' no. of div's incresed width
                        if (count > (rightSideRatioCount - extraPixels - 1)) {
                            divWidth = extraTempDivWidth;
                        }
                        else {
                            divWidth = tempDivWidth;
                        }

                        $tempDiv = $('<div></div>').addClass('ratio-bar-consequent-divs')
                            .css({
                                'width': divWidth,
                                'border-right-width': colorQuantLineWidth,
                                'border-color': colorQuantLineColor,
                                'background-color': rightSideColor
                            })
                            .appendTo(this.$el);

                        // No right border for last div
                        if (count === rightSideRatioCount - 1) {
                            $tempDiv.css({ 'border-width': 0 });
                        }
                    }

                    this.colorSeparatorPosition = 0;

                    break;

                case modelClass.ratioBarTypes.twoRatioBar:
                    var ratioValue,
                        relativeWidthRight = 1,     // right side width considered as 1
                        relativeWidthLeft = 0,      // left side width if considered relative right side
                        leftSideExtraPixels = 0,    // To be applied to left side divs
                        rightSideExtraPixels = 0,   // To be applied to left side divs
                        leftSideWidth = 0,          // To set separator's position
                        rightSideWidth = 0,         // To set separator's position
                        passOverPixels = 0,         // To Pass extra pixels to other side of ratio bar if ratioCount is less
                        adjustedDivWidth = null,    // To assign adjusted width
                        leftDivsWidth = 0,          // width of the small parts within left side
                        extraLeftDivsWidth = 0,     // width of the small parts within left side for compensating extra pixels
                        rightDivsWidth = 0,         // width of the small parts within right side
                        extraRightDivsWidth = 0;    // width of the small parts within right side for compensating extra pixels

                    actualWidthToDivide = widthOfRatioBar - ratioSeparatorLineWidth; // actual width is total width minus seperator width

                    ratioValue = (leftSideRatioCount / rightSideRatioCount).toFixed(3);

                    relativeWidthLeft = ratioValue * relativeWidthRight;

                    // relative left width plus relative right width is for actual width to divide so rightside width will be
                    rightSideWidth = Math.floor((actualWidthToDivide / (relativeWidthLeft + relativeWidthRight)) * relativeWidthRight);
                    // corresponding left side width
                    leftSideWidth = actualWidthToDivide - rightSideWidth;

                    if (typeof this.options.regulationModel !== 'undefined') {
                        var ratioValueToCompare = this.options.regulationModel.getRatioValue(),
                            leftSideWidthToCompare = this.options.regulationModel.getLeftSideWidth();
                        if (leftSideWidthToCompare === leftSideWidth) {
                            //console.log('same width');
                            if (ratioValue > ratioValueToCompare) {
                                rightSideWidth -= 1;
                            }
                            else if (ratioValue < ratioValueToCompare) {
                                rightSideWidth += 1;
                            }
                            leftSideWidth = actualWidthToDivide - rightSideWidth;
                        }
                    }

                    modelObject.set('ratioValue', ratioValue, { silent: true });
                    modelObject.set('leftSideWidth', leftSideWidth, { silent: true });
                    
                    leftSideExtraPixels = leftSideWidth % leftSideRatioCount;
                    rightSideExtraPixels = rightSideWidth % rightSideRatioCount;

                    leftDivsWidth = Math.floor(leftSideWidth / leftSideRatioCount);
                    extraLeftDivsWidth = leftDivsWidth + 1;

                    rightDivsWidth = Math.floor(rightSideWidth / rightSideRatioCount);
                    extraRightDivsWidth = rightDivsWidth + 1;

                    // Repeat procedure of assigning width for left and right parts as done for individual.
                    for (count = 0; count < leftSideRatioCount; count++) {
                        // compensate with last 'leftSideExtraPixels' no. of div's incresed width
                        if (count > (leftSideRatioCount - leftSideExtraPixels - 1)) {
                            divWidth = extraLeftDivsWidth;
                        }
                        else {
                            divWidth = leftDivsWidth;
                        }
                        // If border is included reduce width by one and add border except for last div which is without border
                        if (colorQuantLineWidth !== 0 && count !== leftSideRatioCount - 1) {
                            adjustedDivWidth = divWidth - 1;
                        } else {
                            // assign width directly
                            adjustedDivWidth = divWidth;
                        }
                        $tempDiv = $('<div></div>').addClass('ratio-bar-antecedent-divs')
                            .css({
                                'width': adjustedDivWidth,
                                'border-right-width': colorQuantLineWidth,
                                'border-color': colorQuantLineColor,
                                'background-color': leftSideColor
                            })
                            .appendTo(this.$el);

                        // No right border for last div
                        if (count === leftSideRatioCount - 1) {
                            $tempDiv.css({ 'border-width': 0 });
                        }
                    }
                    // Render div for color separator
                    $('<div></div>').addClass('ratio-bar-separator')
                        .css({ 'width': ratioSeparatorLineWidth, 'background-color': colorSeparatorLineColor })
                        .appendTo(this.$el);

                    for (count = 0; count < rightSideRatioCount; count++) {
                        // compensate with last 'leftSideExtraPixels' no. of div's incresed width
                        if (count > (rightSideRatioCount - rightSideExtraPixels - 1)) {
                            divWidth = extraRightDivsWidth;
                        }
                        else {
                            divWidth = rightDivsWidth;
                        }
                        // If border is included reduce width by one and add border except for last div which is without border
                        if (colorQuantLineWidth !== 0 && count !== rightSideRatioCount - 1) {
                            adjustedDivWidth = divWidth - 1;

                        } else {
                            // assign width directly
                            adjustedDivWidth = divWidth;
                        }
                        $tempDiv = $('<div></div>').addClass('ratio-bar-consequent-divs')
                            .css({
                                'width': adjustedDivWidth,
                                'border-right-width': colorQuantLineWidth,
                                'border-color': colorQuantLineColor,
                                'background-color': rightSideColor
                            })
                            .appendTo(this.$el);

                        // No right border for last div
                        if (count === rightSideRatioCount - 1) {
                            $tempDiv.css({ 'border-width': 0 });
                        }
                    }

                    this.colorSeparatorPosition = leftSideWidth;
                    break;
            }
        },

        /**
        * Returns the position of the line separating the two colors. In case of incomplete or null ratio, returns 0.
        * @method getPositionOfColorSeparator
        * @return {Number} The position of the color separating line.
        */
        getPositionOfColorSeparator: function getPositionOfColorSeparator() {
            return this.colorSeparatorPosition;
        }
    });
})();