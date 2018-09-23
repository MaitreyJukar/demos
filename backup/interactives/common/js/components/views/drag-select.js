(function (namespace) {
    'use strict';
    var DragSelect = null,
        ClassName = null;

    /**
    * View for rendering drag to select component (Marquee)
    * @class DragSelect
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    namespace.Common.Components.Views.DragSelect = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Holds the interactivity manager reference
        * @property manager
        * @default null
        * @private
        */
        manager: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * jQuery object of marquee parent div
        *
        * @property $marqueeContainer
        * @type Object
        * @default null
        */
        $marqueeContainer: null,

        /**
        * Namespace used for jQuery .on() and .off()
        *
        * @property namespace
        * @type String
        * @default null
        */
        namespace: null,

        /**
        * jQuery object of marquee div
        *
        * @property $marqueeDiv
        * @type Object
        * @default null
        */
        $marqueeDiv: null,

        /**
        * Stores the marquee's original offset
        * @property _marqueeOriginalPosition
        * @type object
        * @default null
        */
        _marqueeOriginalPosition: null,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {
            var model = this.model,
                marqueeContainer = model.get('marqueeContainer'),
                $marqueeContainer = null;

            this.idPrefix = model.get('idPrefix');
            this.manager = model.get('manager');
            this.filePath = model.get('filePath');

            $marqueeContainer = typeof (marqueeContainer) === 'string' ? this.$(marqueeContainer) : marqueeContainer;
            this.marqueeContainerSelector = $marqueeContainer[0].id === '' ? Math.random().toPrecision(1) : $marqueeContainer[0].id;

            this.namespace = this.idPrefix + this.marqueeContainerSelector;
            this.$marqueeContainer = $marqueeContainer;
            this.$marqueeDiv = this.createMarqueeDiv();
            this._attachListenersOnMarqueeContainment();
            return;
        },

        /**
        * Creates and appends the marquee div in DOM
        *
        * @method createMarqueeDiv
        **/
        createMarqueeDiv: function createMarqueeDiv() {
            var scope = this.namespace,
                $containment = this.$marqueeContainer,
                zIndex = this.model.get('zIndex'),
                $marqueeDiv = $('<div>', { 'class': scope + 'marquee-div marquee-div' });

            $marqueeDiv.css({
                'position': 'absolute',
                'z-index': zIndex
            });

            // Setting the background color and outline
            $marqueeDiv.css(namespace.Common.Components.Models.DragSelect.MARQUEE_STYLE_DRAGGING);

            $containment.append($marqueeDiv);
            return $marqueeDiv
        },

        /**
        * Attach listeners
        * @method _attachListenersOnMarqueeContainment
        * @return Object jquery object of container
        * @private
        */
        _attachListenersOnMarqueeContainment: function _attachListenersOnMarqueeContainment() {
            var self = this,
                Utils=MathInteractives.Common.Utilities.Models.Utils,
                scope = this.namespace,
                $marqueeDiv = this.$marqueeDiv,
                $marqueeContainment = this.$marqueeContainer,
                isTouch = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            //$.fn.EnableTouch($marqueeDiv);



            // Attach touch events
            // if (isTouch) {
            //$marqueeContainment.off('touchstart.' + scope)
            //                   .on('touchstart.' + scope, function marqueeMouseDown(event) {
            //                       self.marqueeMouseDownHandler(event);
            //                   });
            //$marqueeDiv.off('touchstart.' + scope)
            //           .on('touchstart.' + scope, function marqueeMouseDown(event) {
            //               event.stopPropagation();
            //               self.marqueeMouseDownHandler(event);

            //           });

            //$marqueeContainment.off('touchend.' + scope)
            //                   .on('touchend.' + scope, function marqueeMouseUp(event) {
            //                       var selectedElements;
            //                       if (self.model.get('isForCanvas')) {
            //                           selectedElements = self.marqueeCanvasMouseUpHandler(event, true);
            //                       }
            //                       else {
            //                           selectedElements = self.marqueeMouseUpHandler(event, true, false);
            //                       }
            //                   });

            //$marqueeDiv.off('touchend.' + scope)
            //           .on('touchend.' + scope, function marqueeMouseUp(event) {
            //               event.stopPropagation();
            //               var selectedElements;
            //               if (self.model.get('isForCanvas')) {
            //                   selectedElements = self.marqueeCanvasMouseUpHandler(event, true);
            //               }
            //               else {
            //                   selectedElements = self.marqueeMouseUpHandler(event, true, false);
            //               }
            //           });
            //  return;
            //}




            // Attach mouse events
            $marqueeContainment.off('mousedown.' + scope)
                          .on('mousedown.' + scope, function marqueeMouseDown(event) {
                              self.marqueeMouseDownHandler(event);
                          });

            $marqueeDiv.off('mousedown.' + scope)
                          .on('mousedown.' + scope, function marqueeMouseDown(event) {
                              self.marqueeMouseDownHandler(event);

                          });

            $marqueeContainment.off('mouseup.' + scope)
                          .on('mouseup.' + scope, function marqueeMouseUp(event) {
                              var selectedElements;
                              if (self.model.get('isForCanvas')) {
                                  selectedElements = self.marqueeCanvasMouseUpHandler(event, true);
                              }
                              else {
                                  selectedElements = self.marqueeMouseUpHandler(event, true, false);
                              }
                          });

            $marqueeDiv.off('mouseup.' + scope)
                          .on('mouseup.' + scope, function marqueeMouseUp(event) {
                              var selectedElements;
                              if (self.model.get('isForCanvas')) {
                                  selectedElements = self.marqueeCanvasMouseUpHandler(event, true);
                              }
                              else {
                                  selectedElements = self.marqueeMouseUpHandler(event, true, false);
                              }
                          });

            Utils.EnableTouch($marqueeDiv, { specificEvents: Utils.SpecificEvents.MOUSEMOVE | Utils.SpecificEvents.STOP_PROPAGATION });
            Utils.EnableTouch($marqueeContainment, { specificEvents: Utils.SpecificEvents.MOUSEMOVE | Utils.SpecificEvents.STOP_PROPAGATION });


        },

        /**
        * Removes event listeners
        *
        * @method _detachListenersOnMarqueeContainment
        * @private
        **/
        _detachListenersOnMarqueeContainment: function _detachListenersOnMarqueeContainment() {
            var self = this,
                scope = this.namespace,
                $marqueeDiv = null,
                $marqueeContainment = null;

            $marqueeDiv = this.$marqueeDiv;
            $marqueeContainment = this.$marqueeContainer;

            // Detach all the events
            $marqueeContainment.off('mousedown.' + scope);
            $marqueeDiv.off('mousedown.' + scope);
            $marqueeContainment.off('mouseup.' + scope);
            $marqueeDiv.off('mouseup.' + scope);

            $marqueeContainment.off('touchstart.' + scope);
            $marqueeDiv.off('touchstart.' + scope);
            $marqueeContainment.off('touchend.' + scope);
            $marqueeDiv.off('touchend.' + scope);
        },

        /**
        * Returns the point in event. This is considered while starting, 
        * drawing and ending marquee
        *
        * @method _getPoint
        * @param {Object} [event] jQuery event
        * @private
        **/
        _getPoint: function (event) {
            var point = {
                x: event.pageX,
                y: event.pageY
            }

            return point;
        },

        /**
        * Stores the point where marquee drawing started and 
        * attaches touchmove and mouse move events
        *
        * @method marqueeMouseDownHandler
        * @param {Object} [event] jQuery event
        **/
        marqueeMouseDownHandler: function marqueeMouseDownHandler(event) {
            var $marqueeDiv, $marqueeContainment,
                scope = this.namespace,
                self = this, isTouch = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            //if (isTouch) {
              //  event = event.originalEvent;

                //if (event.touches.length > 0) {
                    // For android devices. Compulsory.
                  //  event = event.touches[0];
                //}
            //}

            // Prevent new marquee drawing on old marquee, if marquee is draggable
            if ($(event.target).hasClass('selected-elements-cover')) {
                return;
            }

            $marqueeDiv = this.$marqueeDiv;

            // Collapse previous marquee
            this.collapseMarquee();
            // Remove children of previous draggable marquee
            while ($marqueeDiv[0].hasChildNodes()) {
                $marqueeDiv[0].removeChild($marqueeDiv[0].lastChild);
            }

            $marqueeDiv.show();
            $marqueeContainment = this.$marqueeContainer;

            this.dragging = true;
            this.startPoint = this._getPoint(event);

            //if (isTouch) {
                //$marqueeContainment.on('touchmove.' + scope, function marqueeMouseMove(event) {
                //    event.preventDefault();
                //    self.marqueeMouseMoveHandler(event);
                //});

                //$marqueeDiv.on('touchmove.' + scope, function marqueeMouseMove(event) {
                //    event.preventDefault();
                //    event.stopPropagation();
                //});

                //$(document).off('touchend.' + scope)
                //         .on('touchend.' + scope, function marqueeMouseUp(event) {
                //             var selectedElements;
                //             if (self.model.get('isForCanvas')) {
                //                 selectedElements = self.marqueeCanvasMouseUpHandler(event, true);
                //             }
                //             else {
                //                 selectedElements = self.marqueeMouseUpHandler(event, true, false);
                //             }
                //         });
           // } else {
                $marqueeContainment.on('mousemove.' + scope, function marqueeMouseMove(event) {
                    self.marqueeMouseMoveHandler(event);
                });

                $marqueeDiv.on('mousemove.' + scope, function marqueeMouseMove(event) {
                    self.marqueeMouseMoveHandler(event);
                });

                // Call marquee mouseup even if released outside marquee container
                $(document).off('mouseup.' + scope)
                         .on('mouseup.' + scope, function marqueeMouseUp(event) {
                             var selectedElements;
                             if (self.model.get('isForCanvas')) {
                                 selectedElements = self.marqueeCanvasMouseUpHandler(event, true);
                             }
                             else {
                                 selectedElements = self.marqueeMouseUpHandler(event, true, false);
                             }
                         });
           // }

            self.trigger(ClassName.EVENTS.start, ClassName.createCustomEventObject(event));
            return;
        },

        /**
        * Adjusts marquee as per mouse drag
        *
        * @method marqueeMouseMoveHandler
        * @param {Object} [event] jQuery event
        **/
        marqueeMouseMoveHandler: function (event) {
            //if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
            //    event = event.originalEvent;

            //    if (event.touches.length > 0) {
            //        event = event.touches[0];
            //    }
            //}

            var idPrefix = this.idPrefix,
                point = this._getPoint(event),
                pointX = point.x,
                pointY = point.y,
                startPoint = this.startPoint,
                startX = startPoint.x,
                startY = startPoint.y,
                width = Math.abs(pointX - startX),
                height = Math.abs(pointY - startY),
                $marqueeDiv, marqueeTop, marqueeLeft, $marqueeContainment, marqueeContainmentOffset;

            $marqueeDiv = this.$marqueeDiv;
            $marqueeContainment = this.$marqueeContainer;
            marqueeContainmentOffset = $marqueeContainment.offset();

            marqueeLeft = (pointX < startX) ? (startX - width) : startX;
            marqueeTop = (pointY < startY) ? (startY - height) : startY;

            $marqueeDiv.css({
                'width': Math.round(width),
                'height': Math.round(height),
                'top': Math.round(marqueeTop - marqueeContainmentOffset.top) + 1 + 'px',    // +1 is for outline in firefox
                'left': Math.round(marqueeLeft - marqueeContainmentOffset.left) + 1 + 'px', // +1 is for outline in firefox
            });
            $marqueeDiv.css(namespace.Common.Components.Models.DragSelect.MARQUEE_STYLE_DRAGGING);

            this.trigger(ClassName.EVENTS.move, ClassName.createCustomEventObject(event));
        },

        /**
        * Ends marquee drawing and calls validating functions and resizes marquee
        *
        * @method marqueeMouseUpHandler
        * @param {Object} [event] jQuery event
        * @param {Boolean} [fireEvent] Whether or not to fire events
        * @param {Boolean} [isTriggeredExternally] True if the function is called programmatically
        **/
        marqueeMouseUpHandler: function marqueeMouseUpHandler(event, fireEvent, isTriggeredExternally) {
            if (!isTriggeredExternally) {
                if (!this.dragging) {
                    return;
                }
            }

            if (this.model.get('isForCanvas')) {
                return;
            }
            var scope = this.namespace,
                $marqueeContainment = this.$marqueeContainer,
                marqueeContainmentOffset = $marqueeContainment.offset(),
                $marqueeDiv = this.$marqueeDiv;

            if (this.dragging) {
                $marqueeContainment.off('mousemove.' + scope);
                $marqueeContainment.off('mousemove');
                $marqueeDiv.off('mousemove.' + scope);
                $marqueeDiv.off('mousemove');
                this.dragging = false;
                $(document).off('mouseup.' + scope);
            }

            var self = this,
                selectedElements = [],
                scope = this.namespace,
                selectorClass = self.model.get('selectorClass'),
                ignoreClass = self.model.get('ignoreClass'),
                tolerance = self.model.get('tolerance'),
                $itemsToSelect = typeof (selectorClass) === 'string' ? $('.' + selectorClass) : selectorClass,
                $this = null,
                thisOffset = null,
                thisTop = null,
                thisLeft = null,
                thisHeight = null,
                thisWidth = null,
                thisData = null,
                objData = null,
                isInsideMarquee = null,
                temporaryBounds = {
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0
                },
                isFirstSelected = true,
                resizeEventObject = null;

            $itemsToSelect.each(function (index) {
                $this = $(this);
                if ($this.hasClass(ignoreClass)) {
                    return;
                }

                thisOffset = $this.offset();
                thisTop = thisOffset.top;
                thisLeft = thisOffset.left;
                thisHeight = $this.outerHeight();
                thisWidth = $this.outerWidth();
                thisData = {
                    top: thisTop,
                    left: thisLeft,
                    height: thisHeight,
                    width: thisWidth
                },
                isInsideMarquee = self._checkIsInsideMarquee(thisData, tolerance);
                $this.data().isInsideMarquee = isInsideMarquee;

                if (isFirstSelected && isInsideMarquee) {
                    temporaryBounds.top = thisTop;
                    temporaryBounds.left = thisLeft;
                    temporaryBounds.height = thisHeight;
                    temporaryBounds.width = thisWidth;
                    isFirstSelected = false;
                    selectedElements.push($this);
                }
                else
                    if (isInsideMarquee) {
                        selectedElements.push($this);
                        temporaryBounds = self._adjustMarqueeBounds(temporaryBounds, thisData);
                    }
            });

            temporaryBounds.top = temporaryBounds.top - marqueeContainmentOffset.top;
            temporaryBounds.left = temporaryBounds.left - marqueeContainmentOffset.left;

            var data = this._getMarqueeData();

            if (fireEvent) {
                self.trigger(ClassName.EVENTS.end, ClassName.createCustomEventObject(event, selectedElements, { marqueeData: data }));
            }

            resizeEventObject = self._resizeMarquee(temporaryBounds, selectedElements, fireEvent);

            if (isTriggeredExternally) {
                return resizeEventObject;
            }

            return;
        },

        /**
        * Ends marquee drawing and calls validating functions and resizes marquee for canvas using paper.js
        *
        * @method marqueeCanvasMouseUpHandler
        * @param {Object} [event] jQuery event
        * @param {Boolean} [fireEvent] Whether or not to fire events
        * @param {Boolean} [isTriggeredExternally] True if the function is called programmatically
        **/
        marqueeCanvasMouseUpHandler: function marqueeCanvasMouseUpHandler(event, fireEvent, isTriggeredExternally) {
            if (!isTriggeredExternally) {
                if (!this.dragging) {
                    return;
                }
            }

            var scope = this.namespace,
                $marqueeContainment = this.$marqueeContainer,
                marqueeContainmentOffset = $marqueeContainment.offset(),
                $marqueeDiv = this.$marqueeDiv;

            if (this.dragging) {
                $marqueeContainment.off('mousemove.' + scope);
                $marqueeDiv.off('mousemove.' + scope);
                this.dragging = false;
            }

            var self = this,
                model = this.model,
                itemsToSelect = model.get('paperObjects'),
                numOfItems = itemsToSelect.length,
                thisTop = null,
                thisLeft = null,
                thisHeight = null,
                thisWidth = null,
                objData = null,
                itemBounds = null,
                isInsideMarquee = null,
                tolerance = model.get('tolerance'),
                itemOffset = model.get('itemsDefaultOffset'),
                temporaryBounds = {
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0
                },
                isFirstSelected = true,
                currItem = null,
                selectedElements = [];

            for (var i = 0; i < numOfItems; i++) {
                currItem = itemsToSelect[i];
                itemBounds = currItem.bounds;

                thisTop = marqueeContainmentOffset.top + itemBounds.y + itemOffset.top;
                thisLeft = marqueeContainmentOffset.left + itemBounds.x + itemOffset.left;
                thisHeight = itemBounds.height;
                thisWidth = itemBounds.width;

                objData = {
                    top: thisTop,
                    left: thisLeft,
                    height: thisHeight,
                    width: thisWidth
                }

                isInsideMarquee = self._checkIsInsideMarquee(objData, tolerance);

                if (isFirstSelected && isInsideMarquee) {
                    temporaryBounds.top = thisTop;
                    temporaryBounds.left = thisLeft;
                    temporaryBounds.height = thisHeight;
                    temporaryBounds.width = thisWidth;
                    isFirstSelected = false;
                    selectedElements.push(currItem);
                }
                else {
                    if (isInsideMarquee) {
                        temporaryBounds = self._adjustMarqueeBounds(temporaryBounds, objData);
                        selectedElements.push(currItem);
                    }
                }
            }

            temporaryBounds.top = temporaryBounds.top - marqueeContainmentOffset.top;
            temporaryBounds.left = temporaryBounds.left - marqueeContainmentOffset.left;

            var data = this._getMarqueeData();

            if (fireEvent) {
                self.trigger(ClassName.EVENTS.end, ClassName.createCustomEventObject(event, selectedElements, { marqueeData: data }));
            }

            var resizeEventObject = self._resizeMarquee(temporaryBounds, selectedElements, fireEvent);

            if (isTriggeredExternally) {
                return resizeEventObject;
            }
        },

        /**
        * Returns css properties of marquee
        *
        * @method _getMarqueeData
        * @return {Object} [marqueeData]
        * @private
        **/
        _getMarqueeData: function () {
            var $marquee = this.$marqueeDiv,
                marqueeData = {
                    height: $marquee.outerHeight(),
                    width: $marquee.outerWidth(),
                    position: $marquee.position(),
                    offset: $marquee.offset()
                };

            return marqueeData;
        },

        /**
        * Determines the marquee bounds as per the selected elements
        *
        * @method _adjustMarqueeBounds
        * @param {temporaryBounds} Temporary bounds of marquee
        * @param {objData} height, width, top and left of element
        * @return {Object} [temporaryBounds]
        * @private
        **/
        _adjustMarqueeBounds: function (temporaryBounds, objData) {
            var elemTop = objData.top,
                elemLeft = objData.left,
                elemHeight = objData.height,
                elemWidth = objData.width;

            if (elemTop >= temporaryBounds.top && elemLeft >= temporaryBounds.left) {
                //console.log('4');
                temporaryBounds.height = elemTop + elemHeight > temporaryBounds.top + temporaryBounds.height ? elemTop + elemHeight - temporaryBounds.top : temporaryBounds.height;
                temporaryBounds.width = elemLeft + elemWidth > temporaryBounds.left + temporaryBounds.width ? elemLeft + elemWidth - temporaryBounds.left : temporaryBounds.width;
            }
            else {
                if (elemTop <= temporaryBounds.top && elemLeft <= temporaryBounds.left) {
                    //console.log('2');
                    temporaryBounds.height = temporaryBounds.top + temporaryBounds.height - elemTop;
                    temporaryBounds.width = temporaryBounds.left + temporaryBounds.width - elemLeft;
                    temporaryBounds.top = elemTop;
                    temporaryBounds.left = elemLeft;
                }
                if (elemTop >= temporaryBounds.top && elemLeft <= temporaryBounds.left) {
                    //console.log('3');
                    temporaryBounds.height = temporaryBounds.top + temporaryBounds.height < elemTop + elemHeight ? elemTop + elemHeight - temporaryBounds.top : temporaryBounds.height;
                    temporaryBounds.width = temporaryBounds.left + temporaryBounds.width - elemLeft;
                    temporaryBounds.left = elemLeft;
                }
                if (elemTop <= temporaryBounds.top && elemLeft >= temporaryBounds.left) {
                    //console.log('1');
                    temporaryBounds.height = temporaryBounds.top + temporaryBounds.height - elemTop;
                    temporaryBounds.width = temporaryBounds.left + temporaryBounds.width < elemLeft + elemWidth ? elemLeft + elemWidth - temporaryBounds.left : temporaryBounds.width;
                    temporaryBounds.top = elemTop;
                }
            }

            return temporaryBounds;
        },

        /**
        * Checks if the given item is within marquee region
        *
        * @method _checkIsInsideMarquee
        * @param {Object} Item data
        * @param {Nummber} [tolerance] tolerance while checking
        * @return {Boolean} [isInsideMarquee]
        * @private
        **/
        _checkIsInsideMarquee: function (itemData, tolerance) {
            if (!itemData) {
                return;
            }

            var isInsideMarquee = false,
                tolerance = tolerance,
                $marquee = this.$marqueeDiv,
                marqueeOffset = $marquee.offset(),
                marqueeTop = marqueeOffset.top,
                marqueeLeft = marqueeOffset.left,
                marqueeHeight = $marquee.outerHeight(),
                marqueeWidth = $marquee.outerWidth(),
                marqueeAreaHeight = marqueeOffset.top + marqueeHeight,
                marqueeAreaWidth = marqueeOffset.left + marqueeWidth,
                itemTop = itemData.top,
                itemLeft = itemData.left,
                itemHeight = itemData.height,
                itemWidth = itemData.width,
                itemArea = itemHeight * itemWidth,
                itemAreaHeight = itemTop + itemHeight,
                itemAreaWidth = itemLeft + itemWidth,
                overLappingHeight = 0,
                overLappingWidth = 0,
                areaCoveredDimensions = {
                    height: 0,
                    width: 0
                },
                totalAreaCovered = 0;

            overLappingHeight = Math.max(Math.min(marqueeAreaHeight, itemAreaHeight) - Math.max(marqueeTop, itemTop), 0);
            overLappingWidth = Math.max(Math.min(marqueeAreaWidth, itemAreaWidth) - Math.max(marqueeLeft, itemLeft), 0);

            areaCoveredDimensions.height = overLappingHeight;
            areaCoveredDimensions.width = overLappingWidth;

            totalAreaCovered = areaCoveredDimensions.height * areaCoveredDimensions.width;

            if ((marqueeLeft < itemAreaWidth && marqueeAreaWidth > itemLeft)
                && (marqueeTop < itemAreaHeight && marqueeAreaHeight > itemTop)) {

                if (totalAreaCovered / itemArea > tolerance) {
                    isInsideMarquee = true;
                }
            }

            return isInsideMarquee
        },

        /**
        * Resizes marquee to given bounds
        *
        * @method _resizeMarquee
        * @param {Object} Marquee top, left, height, width
        * @param {Array} [selectedElements] Array of selected elements
        * @param {Boolean} [fireEvent]
        * @return {Object} [customEventObject]
        * @private
        **/
        _resizeMarquee: function _resizeMarquee(dimensionsObject, selectedElements, fireEvent) {
            if (dimensionsObject) {
                var self = this, event = null,
                    $marquee = this.$marqueeDiv,
                    padding = this.model.get('padding'),
                    defaultOffset = this.model.get('marqueeDefaultOffset'),
                    customEventObject = null;

                $marquee.css({
                    top: Math.round(dimensionsObject.top - padding + defaultOffset.top),
                    left: Math.round(dimensionsObject.left - padding + defaultOffset.left),
                    height: Math.round(dimensionsObject.height ? dimensionsObject.height + (padding * 2) : 1),
                    width: Math.round(dimensionsObject.width ? dimensionsObject.width + (padding * 2) : 1)
                });

                if (dimensionsObject.height === 1 || dimensionsObject.width === 1) {
                    $marquee.css({ 'outline': 'none' });
                }

                var data = this._getMarqueeData(),
                    elemsPos = [], customEventObject = null,
                    numSelected = null;

                if (!this.model.get('isForCanvas')) {
                    numSelected = selectedElements.length;
                    for (var i = 0; i < numSelected; i++) {
                        elemsPos.push(this._getElementData(selectedElements[i]));
                    }
                }

                customEventObject = ClassName.createCustomEventObject(event, selectedElements, { marqueeData: data, elementPositions: elemsPos });
                if (fireEvent) {
                    self.trigger(ClassName.EVENTS.resize, customEventObject);
                }
            }

            return customEventObject;
        },

        /**
        * Returns the position of element w.r.t. marquee
        * @method _getElementData
        * @param {Object} [$elem] jQuery object of element
        * @return {Object} [data] Object of top and left of element 
        * @private
        */
        _getElementData: function ($elem) {
            var elemOffset = $elem.offset(),
                marqueeOffset = this.$marqueeDiv.offset(),
                data = {
                    relativeTop: elemOffset.top - marqueeOffset.top,
                    relativeLeft: elemOffset.left - marqueeOffset.left
                }

            return data;
        },

        /**
        * Disables marquee drawing
        * @method disableMarquee
        */
        disableMarquee: function disableMarquee() {
            this.hideMarquee();
            this._detachListenersOnMarqueeContainment();
        },

        /**
        * Enables marquee drawing
        * @method enableMarquee
        */
        enableMarquee: function enableMarquee() {
            this.showMarquee();
            this._attachListenersOnMarqueeContainment();
        },

        /**
        * Hides marquee
        * @method hideMarquee
        */
        hideMarquee: function hideMarquee() {
            this.$marqueeDiv.hide();
        },

        /**
        * Shows marquee
        * @method showMarquee
        */
        showMarquee: function showMarquee() {
            this.$marqueeDiv.show();
        },

        /**
        * Collapses the marquee div
        * @method collapseMarquee
        */
        collapseMarquee: function collapseMarquee() {
            this._resizeMarquee({ top: 0, left: 0, width: 0, height: 0 }, false);
        },

        /**
        * To draw marquee programmatically
        * @method customFitMarqueeToBounds
        * @param {Object} [bounds] Object of top, left, height and width of marquee
        * @param {Array} [selectedElements] 
        */
        customFitMarqueeToBounds: function (bounds, selectedElements) {
            this._resizeMarquee(bounds, selectedElements, false);

            if (this.model.get('isForCanvas')) {
                return this.marqueeCanvasMouseUpHandler(null, null, true);
            }
            else {
                return this.marqueeMouseUpHandler(null, null, true);
            }
        },

        /**
        * Updates the paper objects in the model
        * @method updatePaperObjects
        * @param {Array} [paperObjs] 
        */
        updatePaperObjects: function (paperObjs) {
            this.model.set('paperObjects', paperObjs);
        },

        /**
        * Inserts given html into marquee div
        * @method groupSelectedElements
        * @param {Object} [elementsHolder] jQuery object of div containing the HTML
          to be appended in the marquee div
        */
        groupSelectedElements: function (elementsHolder) {
            var $marquee = this.$marqueeDiv,
                $groupCover = $('<div/>');

            $marquee.append(elementsHolder);

            $marquee.append($groupCover);
            $groupCover.attr('class', 'selected-elements-cover')
                       .css({
                           'position': 'absolute',
                           'height': $marquee.outerHeight(),
                           'width': $marquee.outerWidth(),
                           'top': 0,
                           'left': 0,
                           'z-index': 2,
                           'cursor': function () {
                               if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                                   return 'none';
                               }
                               return 'pointer';
                           }
                       });

            $marquee.css(namespace.Common.Components.Models.DragSelect.MARQUEE_STYLE_AFTER_RELEASE);
        },

        /**
        * Makes the marquee div draggable
        * @method makeGroupDraggable
        */
        makeGroupDraggable: function () {
            var self = this;
            this.$marqueeDiv.draggable({
                containment: this.$marqueeContainer,
                start: function (event, ui) {
                    self._marqueeOriginalPosition = $(this).offset();
                }
            });
        },

        /**
        * Remove the children of draggable marquee
        * @method breakGroup
        */
        breakGroup: function () {
            var marqueeNode = this.$marqueeDiv[0];
            while (marqueeNode.hasChildNodes()) {
                marqueeNode.removeChild(marqueeNode.lastChild);
            }
        },

        /**
        * Returns marquee original offset
        * @method getOriginalOffset
        * @returns {object} marquee offset
        */
        getOriginalOffset: function getOriginalOffset() {
            return this._marqueeOriginalPosition;
        }

    }, {

        /**
        * Instantiates marquee model and view
        * @method createMarquee
        * @param {Object} [options]
        */
        createMarquee: function (options) {
            if (options) {
                var Components = MathInteractives.Common.Components,
                    marquee = new Components.Models.DragSelect(options),
                    marqueeView = new Components.Views.DragSelect({ model: marquee, el: options.player.$el });

                return marqueeView;
            }
        },

        /**
        * Static event object
        */
        EVENTS: {
            resize: 'marquee-resize',
            move: 'marquee-move',
            start: 'marquee-select-start',
            end: 'marquee-end'
        },

        /**
        * Returns custom event object for marquee related data
        * @method createCustomEventObject
        * @param {Object} [originalEvent] jQuery event data
        * @param {Object} [selectedItems] Elements in the marquee selection
        * @param {Object} [optionalParams] Marquee position, offset
        */
        createCustomEventObject: function createCustomEventObject(originalEvent, selectedItems, optionalParams) {
            return {
                originalEvent: originalEvent,
                selectedItems: selectedItems,
                optionalParams: optionalParams
            }
        }
    });

    ClassName = namespace.Common.Components.Views.DragSelect;
    namespace.global.Marquee = ClassName;

})(MathInteractives);