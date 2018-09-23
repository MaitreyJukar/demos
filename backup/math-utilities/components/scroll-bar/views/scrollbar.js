/* globals $, window, geomFunctions */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Components.ScrollBar = {};
    MathUtilities.Components.ScrollBar.Models = {};
    MathUtilities.Components.ScrollBar.Views = {};

    MathUtilities.Components.ScrollBar.Views.CanvasScrollBar = Backbone.View.extend({

        /**
         *Size of the rectangle which is kept open for observation. Expected a rectangle object.
         *@property _observableUniverse
         *@type {Object}
         */
        "_observableUniverse": null,


        /**
        Size of POV rectangle through which you observe the universe.
        **/
        /**
         *Size of POV rectangle through which you observe the universe.
         *@property _visibleDomain
         *@type {Object}
         */
        "_visibleDomain": Object,

        "_visibility": true,

        /**
         *Height of vertical scrollbar
         *@property _verticalScrollAreaHeight
         *@type {Number}
         */
        "_verticalScrollAreaHeight": null,

        /**
         *Width of horizontal scrollbar
         *@property _horizontalScrollAeraWidth
         *@type {Number}
         */
        "_horizontalScrollAeraWidth": null,

        /**
         *Width and height of scroll button
         *@property _scrollButtonSize
         *@type {Number}
         */
        "_scrollButtonSize": 15,

        /**
         *Vertical scrollbar object
         *@property _verticalScrollbar
         *@type {Object}
         */
        "_verticalScrollbar": null,


        /**
         *Contain Vertical scrollbar-group object
         *@property _verticalScrollbarGroup
         *@type {Object}
         */
        "_verticalScrollbarGroup": null,

        /**
         *Horizontal scrollbar object
         *@property _horizontalScrollbar
         *@type {Object}
         */
        "_horizontalScrollbar": null,
        /**
         *Total screen size
         *@property _screenSize
         *@type {Object}
         */
        /**
         *Contain Horizontal scrollbar-group object
         *@property _horizontalScrollbarGroup
         *@type {Object}
         */
        "_horizontalScrollbarGroup": null,

        /**
         *Total screen size
         *@property _screenSize
         *@type {Object}
         */
        "_screenSize": null,

        /**
         *Area of scroll
         *@property _scrollDomain
         *@type {Object}
         */
        "_scrollDomain": null,

        /**
         *Object of paper used to perform canvas operations
         *@property _paperScope
         *@type {Object}
         */
        "_paperScope": null,

        /**
         *Vertical scrollbar area
         *@property _verticalScrollbarArea
         *@type {Object}
         */
        "_verticalScrollbarArea": null,

        /**
         *Horizontal scrollbar area
         *@property _horizontalScrollbarArea
         *@type {Object}
         */
        "_horizontalScrollbarArea": null,

        /**
         *Max height of scrollbar
         *@property _maxScrollbarHeight
         *@type {Object}
         */
        "_maxScrollbarHeight": null,
        "_scrollBarEnabled": null,
        "_scrollbarCountableDomain": null,

        "_initialYDiff": null,
        "_initialXDiff": null,
        "onMouseMoveV": null,
        "onMouseMoveH": null,
        "onMouseUpH": null,
        "onMouseUpV": null,
        /**
         *Initiate scrollbar
         *@method initialize
         */
        "initialize": function initialize() {
            this._scrollBarEnabled = true;
            this.onMouseMoveV = $.proxy(function(event) {


                var delta, targetY;

                delta = event.delta.y;


                targetY = (this._verticalScroll.bounds.top + this._verticalScroll.bounds.bottom) / 2 + delta;

                geomFunctions.traceConsole('Domain:' + this._scrollbarCountableDomain.top + ' >> ' + this._scrollbarCountableDomain.bottom + ' <> ' + targetY + ' :: delta:' + delta);

                if (delta < 0 && targetY < this._scrollbarCountableDomain.top ||
                    delta > 0 && targetY > this._scrollbarCountableDomain.bottom) {

                    return;
                }


                this._verticalScrollTo(event);



            }, this);

            this.onMouseMoveH = $.proxy(function(event) {
                var delta, targetX;

                delta = event.delta.x;


                targetX = (this._horizontalScroll.bounds.left + this._horizontalScroll.bounds.right) / 2 + delta;

                geomFunctions.traceConsole('Domain:' + this._scrollbarCountableDomain.left + ' >> ' + this._scrollbarCountableDomain.right + ' <> ' + targetX + ' :: delta:' + delta);

                if (delta < 0 && targetX < this._scrollbarCountableDomain.left ||
                    delta > 0 && targetX > this._scrollbarCountableDomain.right) {
                    return;
                }

                this._horizontalScrollTo(event);
            }, this);
            this.onMouseUpH = $.proxy(function() {
                geomFunctions.traceConsole('Mouse Up ');
                this._paperScope.tool.detach('mousedrag', this.onMouseMoveH);
                this._paperScope.tool.detach('mouseup', this.onMouseUpH);
            }, this);
            this.onMouseUpV = $.proxy(function() {
                this._paperScope.tool.detach('mousedrag', this.onMouseMoveV);
                this._paperScope.tool.detach('mouseup', this.onMouseUpV);
            }, this);

        },
        /**
         *Set the area for scrollbar
         *@method setFrameSize
         *@param {Object} paperScope object of paperscope
         *@param {Object} visibleDomain the rectangle which is kept open for observation
         *@param {Object} screenSize size of screen/canvas
         */
        "setFrameSize": function(paperScope, visibleDomain, screenSize, $canvasElem) {
            var space = 4;
            this._visibleDomain = visibleDomain;
            this._screenSize = screenSize;
            this._paperScope = paperScope;
            this.$canvasElem = $canvasElem;

            this._verticalScrollbarArea = new this._paperScope.Rectangle(this._screenSize.width - this._scrollButtonSize,
                this._scrollButtonSize + space, this._scrollButtonSize, this._screenSize.height - 3 * this._scrollButtonSize - space);

            this._horizontalScrollbarArea = new this._paperScope.Rectangle(this._scrollButtonSize, this._screenSize.height - this._scrollButtonSize,
                this._screenSize.width - 3 * this._scrollButtonSize, this._scrollButtonSize);


            this._observableUniverse = {
                "xmin": visibleDomain.xmin - 0.1,
                "xmax": visibleDomain.xmax + 0.1,
                "ymin": visibleDomain.ymin - 0.1,
                "ymax": visibleDomain.ymax + 0.1
            };

            this._initialYDiff = this._observableUniverse.ymax - this._observableUniverse.ymin;
            this._initialXDiff = this._observableUniverse.xmax - this._observableUniverse.xmin;


            this._scrollbarCountableDomain = {};

            this._drawScroll();

            this.updateScrolls();
        },
        /**
         *vertical scroll bar
         *@property _verticalScroll
         *@type {Object}
         */
        "_verticalScroll": null,
        /**
         *horizontal scroll bar
         *@property _horizontalScroll
         *@type {Object}
         */
        "_horizontalScroll": null,
        /**
         *minimum height of scrollbar
         *@property _minimumScrollHeight
         *@type {Number}
         */
        "_minimumScrollHeight": 10,
        /**
         *Update scrollbar size and position
         *@method updateScrolls
         */
        "updateScrolls": function() {
            var observableYdiff, observableXdiff, scrollDomain = {},
                scrollbar = {},
                maxScrollHeight, maxScrollWidth;

            scrollDomain.ymin = Math.min(this._observableUniverse.ymin, this._visibleDomain.ymin);
            scrollDomain.ymax = Math.max(this._observableUniverse.ymax, this._visibleDomain.ymax);

            scrollDomain.xmin = Math.min(this._observableUniverse.xmin, this._visibleDomain.xmin);
            scrollDomain.xmax = Math.max(this._observableUniverse.xmax, this._visibleDomain.xmax);

            geomFunctions.traceConsole('Scrollable domain ' + scrollDomain.ymax + ' <> ' + scrollDomain.ymin);

            this._scrollDomain = scrollDomain;

            //V scrollbar

            observableYdiff = scrollDomain.ymax - scrollDomain.ymin;

            maxScrollHeight = this._verticalScrollbarArea.height;

            scrollbar.ymin = (this._visibleDomain.ymin - scrollDomain.ymin) / observableYdiff;
            scrollbar.ymax = (this._visibleDomain.ymax - scrollDomain.ymin) / observableYdiff;

            scrollbar.ymin *= maxScrollHeight;
            scrollbar.ymax *= maxScrollHeight;

            scrollbar.ymin = this._verticalScrollbarArea.height - scrollbar.ymin;
            scrollbar.ymax = this._verticalScrollbarArea.height - scrollbar.ymax;


            //H scrollbar


            observableXdiff = scrollDomain.xmax - scrollDomain.xmin;

            maxScrollWidth = this._horizontalScrollbarArea.width;

            scrollbar.xmin = (this._visibleDomain.xmin - scrollDomain.xmin) / observableXdiff;
            scrollbar.xmax = (this._visibleDomain.xmax - scrollDomain.xmin) / observableXdiff;


            scrollbar.xmin *= maxScrollWidth;
            scrollbar.xmax *= maxScrollWidth;


            this._verticalScroll.bounds.y = this._verticalScrollbarArea.y + scrollbar.ymin;
            this._verticalScroll.bounds.bottom = this._verticalScrollbarArea.y + scrollbar.ymax;

            this._horizontalScroll.bounds.x = this._horizontalScrollbarArea.x + scrollbar.xmin;
            this._horizontalScroll.bounds.right = this._horizontalScrollbarArea.x + scrollbar.xmax;


            this._maxScrollbarHeight = this._verticalScrollbarArea.height * (this._visibleDomain.ymax - this._visibleDomain.ymin) / (this._observableUniverse.ymax - this._observableUniverse.ymin);

            this._maxScrollbarWidth = this._horizontalScrollbarArea.width * (this._visibleDomain.xmax - this._visibleDomain.xmin) / (this._observableUniverse.xmax - this._observableUniverse.xmin);


            this._scrollbarCountableDomain.top = this._verticalScrollbarArea.top + this._maxScrollbarHeight / 2;
            this._scrollbarCountableDomain.bottom = this._verticalScrollbarArea.bottom - this._maxScrollbarHeight / 2;


            this._scrollbarCountableDomain.left = this._horizontalScrollbarArea.left + this._maxScrollbarWidth / 2;
            this._scrollbarCountableDomain.right = this._horizontalScrollbarArea.right - this._maxScrollbarWidth / 2;




        },

        "getScrollBarData": function() {
            return {
                "observableUniverse": this._observableUniverse,
                "visibleFrame": this._visibleDomain,
                "scrollDomain": this._scrollDomain
            };
        },

        "setVisibility": function(flag) {
            this._visibility = flag;

            if (this._verticalScrollGroup) {
                this._verticalScrollGroup.visible = flag;
            }
            if (this._horizontalScrollGroup) {
                this._horizontalScrollGroup.visible = flag;
            }
        },

        /**
         *Make changes into scrollbar as observable portion in canvas changes
         *@method updateObservableUniverse
         *@param {Object} domain total observable area
         */
        "updateObservableUniverse": function(domain) {
            var yDiff = domain.ymax - domain.ymin - (this._visibleDomain.ymax - this._visibleDomain.ymin),
                xDiff = domain.xmax - domain.xmin - (this._visibleDomain.xmax - this._visibleDomain.xmin);

            if (yDiff < 0) {
                domain.ymax += yDiff / 2;
                domain.ymin -= yDiff / 2;
            }

            if (xDiff < 0) {
                domain.xmax += xDiff / 2;
                domain.xmin -= xDiff / 2;
            }

            this._observableUniverse = domain;

            this.updateScrolls();
        },

        //if frame is not passed then it reverse updates from the scroll position
        /**
         *Set the frame to be display to user
         *@method updateVisibleFrame
         *@param {Object} visibleFrame area to be display to user
         */
        "updateVisibleFrame": function(visibleFrame) {

            if (visibleFrame) {
                if (!visibleFrame.xmin || !visibleFrame.xmax || !visibleFrame.ymin || !visibleFrame.ymax) {
                    return;
                }
                this._visibleDomain = visibleFrame;
                this.updateScrolls();
            } else {
                var XTargetDifference, YTargetDifference, panX, panY, observableYdiff, observableXdiff, scrollDomain = {},
                    scrollbar = {},
                    newVisibleDomain = {};
                scrollDomain.ymin = Math.min(this._observableUniverse.ymin, this._visibleDomain.ymin);
                scrollDomain.ymax = Math.max(this._observableUniverse.ymax, this._visibleDomain.ymax);
                scrollDomain.xmin = Math.min(this._observableUniverse.xmin, this._visibleDomain.xmin);
                scrollDomain.xmax = Math.max(this._observableUniverse.xmax, this._visibleDomain.xmax);

                scrollbar.ymin = this._verticalScroll.bounds.top;
                scrollbar.ymax = this._verticalScroll.bounds.bottom;
                scrollbar.xmin = this._horizontalScroll.bounds.left;
                scrollbar.xmax = this._horizontalScroll.bounds.right;


                observableYdiff = scrollDomain.ymax - scrollDomain.ymin;
                observableXdiff = scrollDomain.xmax - scrollDomain.xmin;

                newVisibleDomain.ymax = (this._verticalScrollbarArea.height - scrollbar.ymin) / this._verticalScrollbarArea.height * observableYdiff + scrollDomain.ymin;

                newVisibleDomain.ymin = (this._verticalScrollbarArea.height - scrollbar.ymax) / this._verticalScrollbarArea.height * observableYdiff + scrollDomain.ymin;


                newVisibleDomain.xmax = scrollbar.xmin / this._horizontalScrollbarArea.width * observableXdiff + scrollDomain.xmin;
                newVisibleDomain.xmin = scrollbar.xmax / this._horizontalScrollbarArea.width * observableXdiff + scrollDomain.xmin;




                geomFunctions.traceConsole('New visible domain is ' + newVisibleDomain.ymin + ' >> ' + newVisibleDomain.ymax + ' X:' + newVisibleDomain.xmin + ' >> ' + newVisibleDomain.xmax);

                //we give priority to vertical limits, so we adjust the horizontal limits to match vertical


                YTargetDifference = newVisibleDomain.ymax - newVisibleDomain.ymin - this._initialYDiff;


                XTargetDifference = newVisibleDomain.xmax - newVisibleDomain.xmin - this._initialXDiff;


                geomFunctions.traceConsole('Xerror:' + XTargetDifference + ' yError:' + YTargetDifference);


                newVisibleDomain.xmax -= XTargetDifference / 2;
                newVisibleDomain.xmin += XTargetDifference / 2;

                newVisibleDomain.ymax -= YTargetDifference / 2;
                newVisibleDomain.ymin += YTargetDifference / 2;


                geomFunctions.traceConsole('Post manipulation new visible domain is ' + newVisibleDomain.ymin + ' >> ' + newVisibleDomain.ymax + ' X:' + newVisibleDomain.xmin + ' >> ' + newVisibleDomain.xmax);



                panX = (newVisibleDomain.xmax + newVisibleDomain.xmin) / 2 - (this._visibleDomain.xmax + this._visibleDomain.xmin) / 2;
                panY = (newVisibleDomain.ymax + newVisibleDomain.ymin) / 2 - (this._visibleDomain.ymax + this._visibleDomain.ymin) / 2;
                geomFunctions.traceConsole('PanX:' + panX + ' PanY:' + panY);


                //this dimention is how much grid has to be shifted...this needs to be converted to how much Y does that means for the grid in terms of canvas


                this.parent.setLimits(newVisibleDomain.xmin, newVisibleDomain.xmax, newVisibleDomain.ymin, newVisibleDomain.ymax, 'scrollbar');
                this.parent.drawGraph();
            }


        },

        "_traceDomain": function(domain) {
            return '[xmin:' + domain.xmin + ' >> xmax:' + domain.xmax + ' ymin:' + domain.ymin + ' ymax:' + domain.ymax + ']';
        },

        "resizeFrameSize": function(visibleDomain, screenSize) {
            var space = 4,
                gap = 1,
                verticalScrollArea,
                horizontalScrollArea,
                verticalScrollGroup,
                horizonatalScrollGroup,
                verScrollBg,
                horScrollBg,
                lowerBtn,
                leftBtn,
                rightBtn,
                FOLDING_DOUBLING_FACTOR = 2,
                hiddenArea,
                NO_OF_BUTTONS = 3,
                upperBtn;
            this._visibleDomain = visibleDomain;
            this._screenSize = screenSize;

            verticalScrollGroup = this._verticalScrollGroup;
            horizonatalScrollGroup = this._horizontalScrollGroup;
            verticalScrollArea = this._verticalScrollbarArea = new this._paperScope.Rectangle(this._screenSize.width - this._scrollButtonSize,
                this._scrollButtonSize, this._scrollButtonSize, this._screenSize.height - NO_OF_BUTTONS * this._scrollButtonSize);
            horizontalScrollArea = this._horizontalScrollbarArea = new this._paperScope.Rectangle(this._scrollButtonSize,
                this._screenSize.height - this._scrollButtonSize, this._screenSize.width - NO_OF_BUTTONS * this._scrollButtonSize, this._scrollButtonSize);

            //update vertical scroll size and position
            this._verticalScroll.size = [verticalScrollArea.width - FOLDING_DOUBLING_FACTOR * gap, verticalScrollArea.height - space];
            this._verticalScroll.position = [verticalScrollArea.x + space + NO_OF_BUTTONS, verticalScrollArea.y + verticalScrollArea.height / FOLDING_DOUBLING_FACTOR];

            verScrollBg = verticalScrollGroup.children['vertical-scroll-background'];
            verScrollBg.bounds.size = [verticalScrollArea.width, verticalScrollArea.height];
            verScrollBg.position = [verticalScrollArea.x + space + NO_OF_BUTTONS, verticalScrollArea.y + verticalScrollArea.height / FOLDING_DOUBLING_FACTOR];

            upperBtn = verticalScrollGroup.children['upper-scroll-btn'];
            upperBtn.position = [verticalScrollArea.x + space + NO_OF_BUTTONS, verticalScrollArea.y - upperBtn.bounds.height / FOLDING_DOUBLING_FACTOR];

            lowerBtn = verticalScrollGroup.children['lower-scroll-btn'];
            lowerBtn.position = [verticalScrollArea.x + space + NO_OF_BUTTONS, verticalScrollArea.y + verticalScrollArea.height + lowerBtn.bounds.height / FOLDING_DOUBLING_FACTOR];
            hiddenArea = verticalScrollGroup.children['hidden-area'];
            hiddenArea.position = [lowerBtn.left + space + NO_OF_BUTTONS, lowerBtn.bottom + this._scrollButtonSize / FOLDING_DOUBLING_FACTOR + space];

            //update horizontal scroll size and position
            this._horizontalScroll.size = [horizontalScrollArea, horizontalScrollArea.height - FOLDING_DOUBLING_FACTOR * gap];
            this._horizontalScroll.position = [horizontalScrollArea.x + this._horizontalScrollbarArea.width / FOLDING_DOUBLING_FACTOR, horizontalScrollArea.y + space + NO_OF_BUTTONS];

            horScrollBg = horizonatalScrollGroup.children['horizontal-scroll-background'];
            horScrollBg.bounds.size = [horizontalScrollArea.width, horizontalScrollArea.height];
            horScrollBg.position = [horizontalScrollArea.x + horizontalScrollArea.width / FOLDING_DOUBLING_FACTOR, horizontalScrollArea.y + space + NO_OF_BUTTONS];

            leftBtn = horizonatalScrollGroup.children['left-scroll-btn'];
            leftBtn.position = [horizontalScrollArea.x - leftBtn.bounds.width / FOLDING_DOUBLING_FACTOR, horizontalScrollArea.y + space + NO_OF_BUTTONS];

            rightBtn = horizonatalScrollGroup.children['right-scroll-btn'];
            rightBtn.position = [horizontalScrollArea.x + horizontalScrollArea.width + rightBtn.bounds.width / FOLDING_DOUBLING_FACTOR, horizontalScrollArea.y + space + NO_OF_BUTTONS];

            this.updateScrolls();
        },

        /**
         *Draw scrollbar
         *@method _drawScroll
         */
        "_drawScroll": function() {
            var verScrollBg, horScrollBg, radius, verticalScrollRect, gap = 1,
                scrollButton1, scrollBGColor = '#a4a4a4',
                scrollColor = '#4a4a4a', self = this,
                scrollHover = '#686868',
                scrollButton2, spaceA = 4,
                spaceB = 6,
                arrowlineBottom, arrowlineTop, upperScrollBtn, lowerScrollBtn, canvasEle = this.$canvasElem,
                arrowColor = '#fff',
                scrollBtnColor = '#4a4a4a',
                scrollBtnHover = '#686868',
                scrollDistanceOnClick = 5,
                scrollButtonTimer, hiddenArea,
                leftScrollBtn, rightScrollBtn, arrowlineLeft, arrowlineRight;


            if (!this._verticalScrollbar) {
                verScrollBg = new this._paperScope.Path.Rectangle(this._verticalScrollbarArea);
                verScrollBg.strokeColor = scrollBGColor;
                verScrollBg.closed = true;
                verScrollBg.fillColor = scrollBGColor;
                verScrollBg.name = 'vertical-scroll-background';

                verScrollBg.onMouseEnter = function() {
                    if (self._scrollBarEnabled) {
                        canvasEle.addClass('hover-scrollbar');
                    }
                };
                verScrollBg.onMouseLeave = function() {
                    if (self._scrollBarEnabled) {
                        canvasEle.removeClass('hover-scrollbar');
                    }
                };

                radius = new this._paperScope.Size(2, 2);
                verticalScrollRect = new this._paperScope.Rectangle(this._verticalScrollbarArea.x + gap, this._verticalScrollbarArea.y, this._verticalScrollbarArea.width - 2 * gap, this._verticalScrollbarArea.height);
                this._verticalScroll = new this._paperScope.Path.RoundRectangle(verticalScrollRect, radius);
                this._verticalScroll.fillColor = scrollColor;
                this._verticalScroll.strokeColor = scrollColor;
                this._verticalScroll.name = 'vertical-scroll';

                this._verticalScroll.onMouseEnter = function() {
                    if (self._scrollBarEnabled) {
                        this.fillColor = scrollHover;
                        this.strokeColor = scrollHover;
                        canvasEle.addClass('hover-scrollbar');
                    }
                };
                this._verticalScroll.onMouseLeave = function() {
                    if (self._scrollBarEnabled) {
                        this.fillColor = scrollColor;
                        this.strokeColor = scrollColor;
                        canvasEle.removeClass('hover-scrollbar');
                    }
                };

                this._verticalScroll.onMouseDown = function(event) {
                    if (self._isValidClickEvent(event) === false) {
                        return;
                    }
                    self._paperScope.tool.attach('mousedrag', self.onMouseMoveV);
                    self._paperScope.tool.attach('mouseup', self.onMouseUpV);
                };

                hiddenArea = new this._paperScope.Path.Rectangle(this._verticalScrollbarArea.left, this._verticalScrollbarArea.bottom + this._scrollButtonSize, this._scrollButtonSize, this._scrollButtonSize);
                hiddenArea.strokeColor = 'white';
                hiddenArea.closed = true;
                hiddenArea.fillColor = 'white';
                hiddenArea.name = 'hidden-area';

                hiddenArea.onMouseEnter = function() {
                    canvasEle.addClass('hover-scrollbar');
                };
                hiddenArea.onMouseLeave = function() {
                    canvasEle.removeClass('hover-scrollbar');
                };
                upperScrollBtn = new this._paperScope.Group();
                upperScrollBtn.name = 'upper-scroll-btn';
                lowerScrollBtn = new this._paperScope.Group();
                lowerScrollBtn.name = 'lower-scroll-btn';
                this._verticalScrollbar = new this._paperScope.Group();


                scrollButton1 = new this._paperScope.Rectangle(this._verticalScrollbarArea.left, this._verticalScrollbarArea.top - this._scrollButtonSize, this._scrollButtonSize, this._scrollButtonSize);
                scrollButton1 = new this._paperScope.Path.RoundRectangle(scrollButton1, radius);
                scrollButton1.strokeColor = scrollBtnColor;
                scrollButton1.closed = true;
                scrollButton1.fillColor = scrollBtnColor;


                scrollButton2 = new this._paperScope.Rectangle(this._verticalScrollbarArea.left, this._verticalScrollbarArea.bottom, this._scrollButtonSize, this._scrollButtonSize);
                scrollButton2 = new this._paperScope.Path.RoundRectangle(scrollButton2, radius);
                scrollButton2.strokeColor = scrollBtnColor;
                scrollButton2.closed = true;
                scrollButton2.fillColor = scrollBtnColor;


                arrowlineBottom = new this._paperScope.Path();
                arrowlineBottom.add(new this._paperScope.Point(this._verticalScrollbarArea.left + spaceA, this._verticalScrollbarArea.bottom + spaceB),
                    new this._paperScope.Point(this._verticalScrollbarArea.left + this._scrollButtonSize / 2, this._verticalScrollbarArea.bottom + this._scrollButtonSize - spaceB),
                    new this._paperScope.Point(this._verticalScrollbarArea.left + this._scrollButtonSize - spaceA, this._verticalScrollbarArea.bottom + spaceB)
                );

                arrowlineBottom.strokeColor = arrowColor;
                arrowlineBottom.closed = true;
                arrowlineBottom.fillColor = arrowColor;


                arrowlineTop = new this._paperScope.Path();
                arrowlineTop.add(new this._paperScope.Point(this._verticalScrollbarArea.left + spaceA, this._verticalScrollbarArea.top - spaceB),
                    new this._paperScope.Point(this._verticalScrollbarArea.left + this._scrollButtonSize / 2, this._verticalScrollbarArea.top - this._scrollButtonSize + spaceB),
                    new this._paperScope.Point(this._verticalScrollbarArea.left + this._scrollButtonSize - spaceA, this._verticalScrollbarArea.top - spaceB)
                );

                arrowlineTop.strokeColor = arrowColor;
                arrowlineTop.closed = true;
                arrowlineTop.fillColor = arrowColor;

                upperScrollBtn.addChild(scrollButton1);
                upperScrollBtn.addChild(arrowlineTop);
                lowerScrollBtn.addChild(scrollButton2);
                lowerScrollBtn.addChild(arrowlineBottom);
                upperScrollBtn.onMouseEnter = function() {
                    if (self._scrollBarEnabled) {
                        this.children[0].fillColor = scrollBtnHover;
                        this.children[0].strokeColor = scrollBtnHover;
                        canvasEle.addClass('hover-scollbar-button');
                    }
                };
                upperScrollBtn.onMouseLeave = function() {
                    if (self._scrollBarEnabled) {
                        this.children[0].fillColor = scrollBtnColor;
                        this.children[0].strokeColor = scrollBtnColor;
                        canvasEle.removeClass('hover-scollbar-button');
                        if (scrollButtonTimer) {
                            clearInterval(scrollButtonTimer);
                        }
                    }
                };
                lowerScrollBtn.onMouseEnter = function() {
                    if (self._scrollBarEnabled) {
                        this.children[0].fillColor = scrollBtnHover;
                        this.children[0].strokeColor = scrollBtnHover;
                        canvasEle.addClass('hover-scollbar-button');
                    }
                };
                lowerScrollBtn.onMouseLeave = function() {
                    if (self._scrollBarEnabled) {
                        this.children[0].fillColor = scrollBtnColor;
                        this.children[0].strokeColor = scrollBtnColor;
                        canvasEle.removeClass('hover-scollbar-button');
                        if (scrollButtonTimer) {
                            clearInterval(scrollButtonTimer);
                        }
                    }
                };

                upperScrollBtn.onMouseDown = function(event) {
                    if (self._isValidClickEvent(event) === false) {
                        return;
                    }
                    self._verticalScrollBy(-scrollDistanceOnClick);
                    scrollButtonTimer = setInterval(function() {
                        self._verticalScrollBy(-scrollDistanceOnClick);
                    }, 100);
                };
                upperScrollBtn.onMouseUp = function() {

                    if (scrollButtonTimer) {
                        clearInterval(scrollButtonTimer);
                    }
                };
                lowerScrollBtn.onMouseDown = function(event) {
                    if (self._isValidClickEvent(event) === false) {
                        return;
                    }
                    self._verticalScrollBy(scrollDistanceOnClick);
                    scrollButtonTimer = setInterval(function() {
                        self._verticalScrollBy(scrollDistanceOnClick);
                    }, 100);
                };

                lowerScrollBtn.onMouseUp = function() {

                    if (scrollButtonTimer) {
                        clearInterval(scrollButtonTimer);
                    }

                };


                this._verticalScrollGroup = new this._paperScope.Group(verScrollBg, this._verticalScroll, upperScrollBtn, lowerScrollBtn, hiddenArea);

                this._verticalScroll.bringToFront();

            }

            if (!this._horizontalScroll) {

                horScrollBg = new this._paperScope.Path.Rectangle(this._horizontalScrollbarArea);
                horScrollBg.fillColor = scrollBGColor;
                horScrollBg.strokeColor = scrollBGColor;
                horScrollBg.name = 'horizontal-scroll-background';
                horScrollBg.onMouseEnter = function() {
                    if (self._scrollBarEnabled) {
                        canvasEle.addClass('hover-scrollbar');
                    }
                };
                horScrollBg.onMouseLeave = function() {
                    if (self._scrollBarEnabled) {
                        canvasEle.removeClass('hover-scrollbar');
                    }
                };
                this._horizontalScroll = new this._paperScope.Rectangle(this._horizontalScrollbarArea.x, this._horizontalScrollbarArea.y + gap, this._horizontalScrollbarArea.width, this._horizontalScrollbarArea.height - 2 * gap);
                this._horizontalScroll = new this._paperScope.Path.RoundRectangle(this._horizontalScroll, radius);

                this._horizontalScroll.strokeColor = scrollColor;
                this._horizontalScroll.fillColor = scrollColor;
                this._horizontalScroll.name = 'horizontal-scroll';
                this._horizontalScroll.onMouseEnter = function() {
                    if (self._scrollBarEnabled) {
                        this.fillColor = scrollHover;
                        this.strokeColor = scrollHover;
                        canvasEle.addClass('hover-scrollbar');
                    }
                };
                this._horizontalScroll.onMouseLeave = function() {
                    if (self._scrollBarEnabled) {
                        this.fillColor = scrollColor;
                        this.strokeColor = scrollColor;
                        canvasEle.removeClass('hover-scrollbar');
                    }
                };

                leftScrollBtn = new this._paperScope.Group();
                leftScrollBtn.name = 'left-scroll-btn';
                rightScrollBtn = new this._paperScope.Group();
                rightScrollBtn.name = 'right-scroll-btn';
                scrollButton1 = new this._paperScope.Rectangle(this._horizontalScrollbarArea.x - this._scrollButtonSize, this._horizontalScrollbarArea.y, this._scrollButtonSize, this._scrollButtonSize);
                scrollButton1 = new this._paperScope.Path.RoundRectangle(scrollButton1, radius);
                scrollButton1.strokeColor = scrollBtnColor;
                scrollButton1.fillColor = scrollBtnColor;

                scrollButton2 = new this._paperScope.Rectangle(this._horizontalScrollbarArea.x + this._horizontalScrollbarArea.width, this._horizontalScrollbarArea.y, this._scrollButtonSize, this._scrollButtonSize);
                scrollButton2 = new this._paperScope.Path.RoundRectangle(scrollButton2, radius);
                scrollButton2.strokeColor = scrollBtnColor;
                scrollButton2.fillColor = scrollBtnColor;

                arrowlineLeft = new this._paperScope.Path();
                arrowlineLeft.add(new this._paperScope.Point(this._horizontalScrollbarArea.x - spaceB, this._horizontalScrollbarArea.y + spaceA),
                    new this._paperScope.Point(this._horizontalScrollbarArea.x - this._scrollButtonSize + spaceB, this._horizontalScrollbarArea.y + this._scrollButtonSize / 2),
                    new this._paperScope.Point(this._horizontalScrollbarArea.x - spaceB, this._horizontalScrollbarArea.y + this._scrollButtonSize - spaceA)
                );
                arrowlineLeft.strokeColor = arrowColor;
                arrowlineLeft.closed = true;
                arrowlineLeft.fillColor = arrowColor;

                arrowlineRight = new this._paperScope.Path();
                arrowlineRight.add(new this._paperScope.Point(this._horizontalScrollbarArea.x + this._horizontalScrollbarArea.width + spaceB, this._horizontalScrollbarArea.y + spaceA),
                    new this._paperScope.Point(this._horizontalScrollbarArea.x + this._horizontalScrollbarArea.width + this._scrollButtonSize - spaceB, this._horizontalScrollbarArea.y + this._scrollButtonSize / 2),
                    new this._paperScope.Point(this._horizontalScrollbarArea.x + this._horizontalScrollbarArea.width + spaceB, this._horizontalScrollbarArea.y + this._scrollButtonSize - spaceA)
                );
                arrowlineRight.strokeColor = arrowColor;
                arrowlineRight.closed = true;
                arrowlineRight.fillColor = arrowColor;



                leftScrollBtn.addChild(scrollButton1);
                leftScrollBtn.addChild(arrowlineLeft);
                rightScrollBtn.addChild(scrollButton2);
                rightScrollBtn.addChild(arrowlineRight);
                leftScrollBtn.onMouseEnter = function() {
                    if (self._scrollBarEnabled) {
                        this.children[0].fillColor = scrollBtnHover;
                        this.children[0].strokeColor = scrollBtnHover;
                        canvasEle.addClass('hover-scollbar-button');
                    }
                };
                leftScrollBtn.onMouseLeave = function() {
                    if (self._scrollBarEnabled) {
                        this.children[0].fillColor = scrollBtnColor;
                        this.children[0].strokeColor = scrollBtnColor;
                        canvasEle.removeClass('hover-scollbar-button');
                        if (scrollButtonTimer) {
                            clearInterval(scrollButtonTimer);
                        }
                    }
                };
                rightScrollBtn.onMouseEnter = function() {
                    if (self._scrollBarEnabled) {
                        this.children[0].fillColor = scrollBtnHover;
                        this.children[0].strokeColor = scrollBtnHover;
                        canvasEle.addClass('hover-scollbar-button');
                    }
                };
                rightScrollBtn.onMouseLeave = function() {
                    if (self._scrollBarEnabled) {
                        this.children[0].fillColor = scrollBtnColor;
                        this.children[0].strokeColor = scrollBtnColor;
                        canvasEle.removeClass('hover-scollbar-button');
                        if (scrollButtonTimer) {
                            clearInterval(scrollButtonTimer);
                        }
                    }
                };
                leftScrollBtn.onMouseDown = function(event) {
                    if (self._isValidClickEvent(event) === false) {
                        return;
                    }
                    self._horizontalScrollBy(scrollDistanceOnClick);
                    scrollButtonTimer = setInterval(function() {
                        self._horizontalScrollBy(scrollDistanceOnClick);
                    }, 100);
                };
                rightScrollBtn.onMouseDown = function(event) {
                    if (self._isValidClickEvent(event) === false) {
                        return;
                    }
                    self._horizontalScrollBy(-scrollDistanceOnClick);
                    scrollButtonTimer = setInterval(function() {
                        self._horizontalScrollBy(-scrollDistanceOnClick);
                    }, 100);
                };

                rightScrollBtn.onMouseUp = function() {
                    if (scrollButtonTimer) {
                        clearInterval(scrollButtonTimer);
                    }
                };

                leftScrollBtn.onMouseUp = function() {
                    if (scrollButtonTimer) {
                        clearInterval(scrollButtonTimer);
                    }
                };




                this._horizontalScroll.onMouseDown = function(event) {
                    if (self._isValidClickEvent(event) === false) {
                        return;
                    }
                    geomFunctions.traceConsole('mouse down');
                    self._paperScope.tool.attach('mousedrag', self.onMouseMoveH);
                    self._paperScope.tool.attach('mouseup', self.onMouseUpH);
                };


                this._horizontalScrollGroup = new this._paperScope.Group(horScrollBg, this._horizontalScroll, rightScrollBtn, leftScrollBtn);

                this._horizontalScroll.bringToFront();


            }
        },
        /**
         *Set the horizontal scroll by given horizontal distance values
         *@method _horizontalScrollBy
         *@param {Number} delX horizontal distance
         */

        "_horizontalScrollBy": function(delX) {
            var canvasDelX, canvasDelta, scrollBarDelX, bounds, newGridDomain, left = this._horizontalScroll.bounds.left + delX,
                right = this._horizontalScroll.bounds.right + delX,
                currentWidth = this._horizontalScroll.bounds.width;



            if (left < this._horizontalScrollbarArea.left) {
                left = this._horizontalScrollbarArea.left;
            } else if (right > this._horizontalScrollbarArea.left + this._horizontalScrollbarArea.width) {
                left = this._horizontalScrollbarArea.left + this._horizontalScrollbarArea.width - currentWidth;
            }

            this._horizontalScroll.bounds.left = left;
            this._horizontalScroll.bounds.right = currentWidth + left;




            //get the new grid domain wrt scrollbars
            newGridDomain = {};


            bounds = this.parent.getLimits();


            //here scrollbar delY is to be calculated in terms of bar height and not entire scroll height...since the comparison has to be done for the visible area
            scrollBarDelX = (this._scrollDomain.xmax - this._scrollDomain.xmin) * delX / this._horizontalScrollbarArea.width;

            //grid will shift by scrollBarDelY
            newGridDomain.ymin = bounds.yLower;
            newGridDomain.ymax = bounds.yUpper;
            newGridDomain.xmin = bounds.xLower + scrollBarDelX;
            newGridDomain.xmax = bounds.xUpper + scrollBarDelX;


            canvasDelta = this.parent._getCanvasDistance([scrollBarDelX, 0]);

            canvasDelX = canvasDelta[0];

            geomFunctions.traceConsole('Pan by ' + scrollBarDelX + ' Canvas pan by ' + canvasDelX);
            if (this.customPanBy) {
                this.customPanBy(canvasDelX, 0);
            } else {
                this.parent._panBy(canvasDelX, 0);
            }
        },

        //x for horizontal, y for vertical
        "_convertBarToGrid": function(x, y) {
            var grid = [];

            grid[0] = 0;
            grid[1] = this._scrollDomain.ymin + (this._scrollDomain.ymax - this._scrollDomain.ymin) * (y - this._verticalScrollbarArea.top) / (this._verticalScrollbarArea.bottom - this._verticalScrollbarArea.top);

            return grid;
        },


        "_verticalScrollTo": function(event) {

            geomFunctions.traceConsole('V Scrolling...');

            this._verticalScrollBy(event.delta.y);

        },

        "_horizontalScrollTo": function(event) {

            geomFunctions.traceConsole('H Scrolling...');

            this._horizontalScrollBy(-event.delta.x);
        },


        "_verticalScrollBy": function(delY) {


            var oldTop = this._verticalScroll.bounds.top,
                oldBottom = this._verticalScroll.bounds.bottom,
                top = oldTop + delY,
                bounds, scrollBarDelY,
                bottom = oldBottom + delY,
                newGridDomain, canvasDelY, canvasDelta,
                currentHeight = this._verticalScroll.bounds.height;
            if (top < this._verticalScrollbarArea.top) {
                top = this._verticalScrollbarArea.top;
            } else if (bottom > this._verticalScrollbarArea.y + this._verticalScrollbarArea.height) {
                top = this._verticalScrollbarArea.top + this._verticalScrollbarArea.height - currentHeight;
            }

            this._verticalScroll.bounds.top = top;
            this._verticalScroll.bounds.bottom = currentHeight + top;

            //get the new grid domain wrt scrollbars
            newGridDomain = {};


            bounds = this.parent.getLimits();


            //here scrollbar delY is to be calculated in terms of bar height and not entire scroll height...since the comparison has to be done for the visible area
            scrollBarDelY = (this._scrollDomain.ymax - this._scrollDomain.ymin) * delY / this._verticalScrollbarArea.height;

            //grid will shift by scrollBarDelY
            newGridDomain.ymin = bounds.yLower + scrollBarDelY;
            newGridDomain.ymax = bounds.yUpper + scrollBarDelY;
            newGridDomain.xmin = bounds.xLower;
            newGridDomain.xmax = bounds.xUpper;

            //


            canvasDelta = this.parent._getCanvasDistance([0, scrollBarDelY]);

            canvasDelY = canvasDelta[1];

            geomFunctions.traceConsole('Pan by ' + scrollBarDelY + ' Canvas pan by ' + canvasDelY);
            if (this.customPanBy) {
                this.customPanBy(0, canvasDelY);
            } else {
                this.parent._panBy(0, canvasDelY);
            }
        },

        /**
        Paper layer to draw into.
        **/
        /**
         *Paper layer to draw into.
         *@property _scrollLayer
         *@type {Object}
         */
        "_scrollLayer": null,

        /**
        Drawing Rectangle size of the scrollbars all inclusive. Height will be used for vertical scroll and width will be used for horizontal scroll.
        **/
        /**
         *
         */
        "_scrollDrawSize": null,

        /**
         * Check if mouse down event is proper or not.
         * return false if right-click or more then one touches.
         * @method _isValidClickEvent
         * @param {object} paper mouse event
         */
        "_isValidClickEvent": function _isValidClickEvent(eventObject) {
            //event.which has value 3 for right click
            return !(eventObject.event.which === 3 ||
                eventObject.event.changedTouches !== void 0 && eventObject.event.changedTouches.length >= 1);
        },

        "enableDisableScrollBar": function enableDisableScrollBar(disableReason) {
            this._scrollBarEnabled = !disableReason;
        },

        /**
         * Check if scroll-bar is hit or not
         * @method isScrollHit
         * @return {Boolean} true if scroll is hit,else false.
         * @private
         */
        "isScrollHit": function isScrollHit(point) {
            var verticalScrollbarGroup = this._verticalScrollGroup,
                horizontalScrollbarGroup = this._horizontalScrollGroup,
                verticalHitTest = typeof verticalScrollbarGroup !== 'undefined' ? verticalScrollbarGroup.hitTest(point) : null,
                horizontalHitTest = typeof horizontalScrollbarGroup !== 'undefined' ? horizontalScrollbarGroup.hitTest(point) : null;

            if (verticalHitTest !== null && typeof verticalHitTest !== 'undefined' || horizontalHitTest !== null && typeof horizontalHitTest !== 'undefined') {
                return true;
            }
            return false;
        }
    });
}(window.MathUtilities));
