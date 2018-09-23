(function (MathInteractives) {
    'use strict';
    var ClassName = null,
        viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point;

    /**
    * View for rendering drag to select component (Marquee)
    * @class Marquee
    * @module EquationManagerPro
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    **/

    viewClassNamespace.Marquee = MathInteractives.Common.Player.Views.Base.extend({

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
        * Stores the reference of the equation manager
        * @property equationManager
        * @type object
        * @default null
        */
        equationManager: null,

        /**
        * Boolean representing whether marquee drawing is in progress
        * @attribute isDrawing
        * @type Boolean
        * @default false
        **/
        isDrawing: false,

        /**
        * Boolean representing whether marquee dragging is in progress
        * @attribute isDragging
        * @type Boolean
        * @default false
        **/
        isDragging: false,

        /**
        * Represents if acc mode is on
        * @attribute _isAcc
        * @type Boolean
        * @default true
        **/
        _isAcc: true,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {
            var model = this.model,
                marqueeContainer = model.get('marqueeContainer'),
                $marqueeContainer = null,
                equationManager = this.options.equationManager,
                $scrollContainer = model.get('scrollContainer'),
                TYPE = modelClassNamespace.TileItem.TileType;

            if (!viewClassNamespace.Marquee.bDocumentEventAttached) {
                viewClassNamespace.Marquee.bDocumentEventAttached = true;
                //MathInteractives.Common.Utilities.Models.Utils.EnableTouch((document));
            }


            this.idPrefix = model.get('idPrefix');
            this.manager = model.get('manager');
            this.filePath = model.get('filePath');
            this.player = model.get('player');
            this._isAcc = this.isAccessible();

            if (equationManager) {
                this.equationManager = equationManager;
            }

            this.model.set('type', TYPE.MARQUEE);
            $marqueeContainer = typeof (marqueeContainer) === 'string' ? this.$(marqueeContainer) : marqueeContainer;
            this.marqueeContainerSelector = $marqueeContainer[0].id === '' ? Math.random().toPrecision(1) : $marqueeContainer[0].id;
            this.namespace = this.idPrefix + this.marqueeContainerSelector;
            this.$marqueeContainer = $marqueeContainer;
            this.$scrollContainer = $scrollContainer;
            //this.$marqueeContainer = this.$('.lhs-expression-marquee-container');

            this.$marqueeDiv = this.createMarqueeDiv();
            this.attachListenersOnMarqueeContainment();
            this._attachListenersOnMarqueeDiv();
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

            if (this._isAcc) {
                $marqueeDiv.attr('tabindex', -1);
            }
            $marqueeDiv.css({
                'position': 'absolute',
                'z-index': zIndex
            });

            // Setting the background color and outline
            $marqueeDiv.css(modelClassNamespace.Marquee.MARQUEE_STYLE_DRAGGING);
            if(this.model.get('marqueeBGColor')) {
                $marqueeDiv.css('background-color', this.model.get('marqueeBGColor'));
            }

            $containment.append($marqueeDiv);
            return $marqueeDiv;
        },

        /**
        * Attach listeners
        * @method attachListenersOnMarqueeContainment
        * @return Object jquery object of container
        * @private
        */
        attachListenersOnMarqueeContainment: function attachListenersOnMarqueeContainment() {
            var self = this,
                scope = this.namespace,
                $marqueeDiv = this.$marqueeDiv,
                $marqueeContainment = this.$marqueeContainer,
                isTouch = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($marqueeDiv);

            // Mouse events required for simulation bu tutorial and thus left attached even for touch devices
            // dettached at the start of touch event.
            $marqueeContainment.off('mousedown.' + scope)
                .on('mousedown.' + scope, function marqueeMouseDown(event) {
                    self.marqueeContainerMouseDownHandler(event);
                });

            //if (isTouch) {
            //    // Attach touch events
            //    $marqueeContainment.off('touchstart.' + scope)
            //    .on('touchstart.' + scope, function marqueeMouseDown(event) {
            //        // detaching mousedown 'cause it is fired by touch devices too on touch start
            //        //$marqueeContainment.off('mousedown.' + scope);
            //        self.marqueeContainerMouseDownHandler(event);
            //    });
            //}
            //else {
            //    // Mouse events required for simulation bu tutorial and thus left attached even for touch devices
            //    // dettached at the start of touch event.
            //    $marqueeContainment.off('mousedown.' + scope)
            //        .on('mousedown.' + scope, function marqueeMouseDown(event) {
            //            self.marqueeContainerMouseDownHandler(event);
            //        });
            //}
            this.applyHandCursorToElem($marqueeDiv);
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($marqueeContainment, {
                specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE
            });
        },

        _attachListenersOnMarqueeDiv: function () {
            this.$marqueeDiv.off('keydown.acc').on('keydown.acc', $.proxy(this.keydownHandler, this));
        },


        /**
        * Handler for keydown event on marquee
        * @method keydownHandler
        * @param {Object} Event object
        */
        keydownHandler: function (event) {
            event.preventDefault();
            event.stopPropagation();
            var KEY = viewClassNamespace.EquationManager.KEY,
                equationManager = this.equationManager;
            if (!this.$marqueeDiv.is(':visible')) { return; }

            switch (event.which) {
                case KEY.LEFTARROW:
                case KEY.RIGHTARROW:
                    this.equationManager.handleMarqueeAcc(event);
                    break;
                //case KEY.ESCAPE:
                //    if (equationManager._tutorialMode) {
                //        this.handleEscMarqueeTutorial();
                //        break;
                //    }
                //case KEY.TAB:
                //    if (equationManager._tutorialMode) {
                //        this.handleTabMarqueeTutorial();
                //        break;
                //    }
                //    this.equationManager.removeMarqueeAcc(true);
                //    break;
                //case KEY.SPACE:
                //    this._handleSpaceMarqueeAcc(event);
                //    break;
            }
        },

        /**
        * Removes event listeners
        *
        * @method detachListenersOnMarqueeContainment
        * @private
        **/
        detachListenersOnMarqueeContainment: function detachListenersOnMarqueeContainment() {
            var scope = this.namespace,
                $marqueeDiv = null,
                $marqueeContainment = null;

            $marqueeDiv = this.$marqueeDiv;
            $marqueeContainment = this.$marqueeContainer;

            // Detach all the events
            $marqueeContainment.off('mousedown.' + scope);
            $marqueeDiv.off('mousedown.' + scope);

            $marqueeContainment.off('mouseup.' + scope);
            $marqueeDiv.off('mouseup.' + scope);

            //$marqueeContainment.off('touchstart.' + scope);
            //$marqueeDiv.off('touchstart.' + scope);
            //$marqueeContainment.off('touchend.' + scope);
            //$marqueeDiv.off('touchend.' + scope);

            //$marqueeContainment.off('touchmove.' + scope);
            //$marqueeDiv.off('touchmove.' + scope);
            //MathInteractives.Common.Utilities.Models.Utils.DisableTouch($marqueeContainment);
            //MathInteractives.Common.Utilities.Models.Utils.DisableTouch($marqueeDiv);
        },

        _detachAllExceptMouseDown: function _detachAllExceptMouseDown() {
            var scope = this.namespace,
                $marqueeDiv = null,
                $marqueeContainment = null;

            $marqueeDiv = this.$marqueeDiv;
            $marqueeContainment = this.$marqueeContainer;

            // Detach all the events
            $marqueeContainment.off('mouseup.' + scope);
            $marqueeDiv.off('mouseup.' + scope);

            //$marqueeContainment.off('touchstart.' + scope);
            //$marqueeDiv.off('touchstart.' + scope);
            //$marqueeContainment.off('touchend.' + scope);
            //$marqueeDiv.off('touchend.' + scope);

            //$marqueeContainment.off('touchmove.' + scope);
            //$marqueeDiv.off('touchmove.' + scope);
            //MathInteractives.Common.Utilities.Models.Utils.DisableTouch($marqueeContainment);
            //MathInteractives.Common.Utilities.Models.Utils.DisableTouch($marqueeDiv);
        },

        /**
        * Disable listeners on marquee
        *
        * @method detachListenersOnMarqueeContainment
        * @public
        */
        detachListenersOnContainment: function () {
            this.detachListenersOnMarqueeContainment();
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
                x: event.pageX + this.model.get('scrollAmt'),
                y: event.pageY
            };
            return point;
        },

        /**
        * Stores the point where marquee drawing started and
        * attaches touchmove and mouse move events
        *
        * @method marqueeContainerMouseDownHandler
        * @param {Object} [event] jQuery event
        **/
        marqueeContainerMouseDownHandler: function marqueeContainerMouseDownHandler(event) {
            if (this.isDragging) {
                return;
            }

            this.resetCursor();
            this.isDrawing = true;
            var $marqueeDiv = this.$marqueeDiv,
                isTouch = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile,
                rectLHS = new Rect(this.$marqueeContainer[0].getBoundingClientRect()),
                evt = event,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY });


            /*if(rectLHS.isPointInRect(ptMouse)) {
                this.$marqueeContainer = this.$('.lhs-expression-marquee-container');
            }
            else {
                return false;
            }*/

            // Prevent new marquee drawing on old marquee, if marquee is draggable
            //if ($(event.target).hasClass('selected-elements-cover')) {
            //    return;
            //}
            //else {
            //    if (isTouch) {

            //    }
            //}

            if (!isTouch && event.which !== 1) {
                return;
            }

            // Mouse events required for simulation bu tutorial and thus left attached even for touch devices
            // dettached at the start of touch event.
            this._marqueeMouseUpAndMoveEvents();
            if (isTouch) {
                evt = event.originalEvent;
                if (evt.touches && evt.touches.length > 0) {
                    // For android devices. Compulsory.
                    evt = evt.touches[0];
                }
                this._marqueeTouchEndAndMoveEvents();
            }

            //$marqueeDiv = this.$marqueeDiv;

            // Collapse previous marquee and remove its children
            this.collapseMarquee(evt);
            // Remove children of previous draggable marquee
            while ($marqueeDiv[0].hasChildNodes()) {
                $marqueeDiv[0].removeChild($marqueeDiv[0].lastChild);
            }

            $marqueeDiv.show();
            //$marqueeContainment = this.$marqueeContainer;

            this.dragging = true;
            this.startPoint = this._getPoint(evt);
            this.trigger(ClassName.EVENTS.start, ClassName.createCustomEventObject(evt), this.model.get('marqueeIndex'));

            this.$marqueeDiv.css({'z-index': this.model.get('zIndex')});
            event.preventDefault();

            return;
        },

        marqueeMouseDownHandler: function marqueeMouseDownHandler(event) {
            this.trigger(ClassName.EVENTS.MARQUEE_MOUSEDOWN);
            event.stopPropagation();
            event.preventDefault();
        },



        _detachUpAndMoveEvents: function _detachMarqueeContainerUpAndMoveEvents() {
            var scope = this.namespace;
            //$(document).off('touchend.' + scope);
            //$(document).off('touchmove.' + scope);

            //this.player.$el.off('touchend.' + scope)
            //               .off('touchmove.' + scope);

            $(document).off('mouseup.' + scope);
            $(document).off('mousemove.' + scope);
            MathInteractives.Common.Utilities.Models.Utils.DisableTouch(this.player.$el);
            //MathInteractives.Common.Utilities.Models.Utils.DisableTouch(document);
        },



        _marqueeMouseUpAndMoveEvents: function _marqueeMouseUpAndMoveEvents() {
            var scope = this.namespace,
                self = this;
            $(document).off('mouseup.' + scope)
                .on('mouseup.' + scope, function marqueeMouseUp(event) {
                    var selectedElements;
                    selectedElements = self.marqueeMouseUpHandler(event, true, false);
                });

            $(document).on('mousemove.' + scope, function marqueeMouseMove(event) {
                event.preventDefault();
                event.stopPropagation();
                self.marqueeMouseMoveHandler(event);
            });

        },

        _marqueeTouchEndAndMoveEvents: function _marqueeMouseUpAndMoveEvents() {
            var scope = this.namespace,
                self = this,
                marqueeMouseUp, marqueeMouseMove;
            marqueeMouseUp = function marqueeMouseUp(event) {
                //$(document).off('touchend.' + scope)
                //.on('touchend.' + scope, function marqueeMouseUp(event) {
                event.stopPropagation();
                //    // detaching mouse up
                $(document).off('mouseup.' + scope);
                var selectedElements;
                selectedElements = self.marqueeMouseUpHandler(event, true, false);
                //    // todo: for chrome book - rebind mousedown for the device
                //    //self.$marqueeContainer/*.off('mousedown.' + scope)*/
                //    //  .on('mousedown', function marqueeMouseDown(event) {
                //    //      self.marqueeContainerMouseDownHandler(event);
                //    //  });
                //});
            };
            marqueeMouseMove = function marqueeMouseMove(event) {
                event.preventDefault();
                event.stopPropagation();
                //    // detaching mousemove
                //    //$(document).off('mousemove.' + scope);
                self.marqueeMouseMoveHandler(event);
                //});
                //MathInteractives.Common.Utilities.Models.Utils.DisableTouch((document));
            };

            //$(document).off('touchend.' + scope)
            //.on('touchend.' + scope, marqueeMouseUp);

            //this.player.$el.off('touchend.' + scope)
            //.on('touchend.' + scope, marqueeMouseUp);

            //$(document).on('touchmove.' + scope, marqueeMouseMove);
            //this.player.$el.on('touchmove.' + scope, marqueeMouseMove);
            //MathInteractives.Common.Utilities.Models.Utils.DisableTouch((document));
            MathInteractives.Common.Utilities.Models.Utils.DisableTouch(this.player.$el);
            //MathInteractives.Common.Utilities.Models.Utils.EnableTouch((document));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.player.$el);
        },

        /**
        * Adjusts marquee as per mouse drag
        *
        * @method marqueeMouseMoveHandler
        * @param {Object} [event] jQuery event
        **/
        marqueeMouseMoveHandler: function (event) {
            var evt = event;
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                evt = event.originalEvent;

                if (evt.touches && evt.touches.length > 0) {
                    evt = evt.touches[0];
                }
            }

            var scrollAmt = this.model.get('scrollAmt'),
                point = this._getPoint(evt),
                pointX = point.x,
                pointY = point.y,
                startPoint = this.startPoint,
                startX = startPoint.x,
                startY = startPoint.y,
                width = Math.abs(pointX - startX),
                height = Math.abs(pointY - startY),
                $marqueeDiv, marqueeTop, marqueeLeft, $marqueeContainment, marqueeContainmentOffset,
                marqueeContLeft, marqueeContTop, marqueeContWidth, marqueeContHeight, contRect,
                tolerance = 30,
                scrollSensitivity = 15,
                errorDist = 4;

            $marqueeDiv = this.$marqueeDiv;
            $marqueeContainment = this.$marqueeContainer;
            marqueeContainmentOffset = $marqueeContainment.offset();
            marqueeContLeft = marqueeContainmentOffset.left + scrollAmt;
            marqueeContTop = marqueeContainmentOffset.top;
            marqueeContHeight = $marqueeContainment.height();
            marqueeContWidth = $marqueeContainment.width();
            contRect = new Rect(this.$scrollContainer[0].getBoundingClientRect());

            marqueeLeft = (pointX < startX) ? (startX - width) : startX;
            marqueeTop = (pointY < startY) ? (startY - height) : startY;

            // limit marquee drawing to the marquee container
            if (pointX < marqueeContLeft) {
                marqueeLeft = marqueeContLeft;
                width = startX - marqueeContLeft;
            } else if (pointX > marqueeContLeft + marqueeContWidth) {
                width = marqueeContLeft + marqueeContWidth - startX - errorDist;    // marquee goes outside bounds by 2 pixels
            }

            if (pointY < marqueeContTop) {
                marqueeTop = marqueeContTop;
                height = startY - marqueeContTop;
            } else if (pointY > marqueeContTop + marqueeContHeight) {
                height = marqueeContTop + marqueeContHeight - startY - errorDist;   // marquee goes outside bounds by 2 pixels
            }

            // scroll when out of container
            if (pointX - scrollAmt > contRect.getRight() - tolerance) {
                this.$scrollContainer.scrollLeft(scrollAmt + scrollSensitivity);
            } else if (pointX - scrollAmt < contRect.getLeft() + tolerance) {
                this.$scrollContainer.scrollLeft(scrollAmt - scrollSensitivity);
            }

            $marqueeDiv.css({
                'width': Math.round(width),
                'height': Math.round(height),
                'top': Math.round(marqueeTop - marqueeContTop) + 0 + 'px',    // +1 is for outline in firefox
                'left': Math.round(marqueeLeft - marqueeContLeft) + 0 + 'px', // +1 is for outline in firefox
            });

            if (event.originalEvent && event.originalEvent.isSimulated) {
                $marqueeDiv.css(modelClassNamespace.Marquee.FAKE_MARQUEE_STYLE.DRAGGING);
            }
            else {
                $marqueeDiv.css(modelClassNamespace.Marquee.MARQUEE_STYLE_DRAGGING);
                if(this.model.get('marqueeBGColor')) {
                    $marqueeDiv.css('background-color', this.model.get('marqueeBGColor'));
                }
            }

            this.trigger(ClassName.EVENTS.move, ClassName.createCustomEventObject(evt));
            event.preventDefault();
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

            var $fakeMarqueeDiv,
                $marqueeContainment = this.$marqueeContainer,
                marqueeContainmentOffset = $marqueeContainment.offset(),
                $marqueeDiv = this.$marqueeDiv;

            this.applyHandCursorToElem($marqueeDiv);
            this.isDrawing = false;
            // if simulated marquee, convert to fake marquee
            if (event.isSimulated || event.originalEvent.isSimulated) {
                $fakeMarqueeDiv = $marqueeDiv.clone().removeAttr('class')
                    .addClass('fake-marquee').insertAfter($marqueeDiv);
                //this.dragging = false;
                this.collapseMarquee(event);
                event.preventDefault();
                this._detachUpAndMoveEvents();
                return;
            }

            this.trigger(ClassName.EVENTS.ChangeSelectorClass, event, $marqueeDiv, this.model.get('marqueeIndex'));

            if (this.dragging) {
                //$marqueeContainment.off('mousemove.' + scope);
                //$marqueeContainment.off('mousemove');
                //$marqueeDiv.off('mousemove.' + scope);
                //$marqueeDiv.off('mousemove');
                this.dragging = false;
                //$(document).off('mouseup.' + scope);
            }

            var self = this,
                selectedElements = [],
                selectorClass = self.model.get('selectorClass'),
                ignoreClass = self.model.get('ignoreClass'),
                tolerance = self.model.get('tolerance'),
                $itemsToSelect = typeof (selectorClass) === 'string' ? this.$scrollContainer.find('.' + selectorClass) : selectorClass,
                $this = null,
                thisOffset = null,
                thisTop = null,
                thisLeft = null,
                thisHeight = null,
                thisWidth = null,
                thisData = null,
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
                };
                //isInsideMarquee = self._checkIsInsideMarquee(thisData, tolerance);
                $this.data().isInsideMarquee = true;

                if (isFirstSelected /*&& isInsideMarquee*/) {
                    temporaryBounds.top = thisTop;
                    temporaryBounds.left = thisLeft;
                    temporaryBounds.height = thisHeight;
                    temporaryBounds.width = thisWidth;
                    isFirstSelected = false;
                    selectedElements.push($this);
                }
                else
                    //if (isInsideMarquee) {
                    selectedElements.push($this);
                temporaryBounds = self._adjustMarqueeBounds(temporaryBounds, thisData);
                //}
            });

            temporaryBounds.top = temporaryBounds.top - marqueeContainmentOffset.top;
            temporaryBounds.left = temporaryBounds.left - marqueeContainmentOffset.left;

            var data = this._getMarqueeData();

            resizeEventObject = self._resizeMarquee(temporaryBounds, selectedElements, fireEvent, event);

            //if (isTriggeredExternally) {
            //    return resizeEventObject;
            //}

            // also resize cover
            if (this.$groupCover) {
                this.$groupCover.css({
                    'height': this.$marqueeDiv.outerHeight(true),
                    'width': this.$marqueeDiv.outerWidth(true)
                });
            }

            this.marqueeInitRect = new Rect($marqueeDiv[0].getBoundingClientRect());

            if (fireEvent) {
                self.trigger(ClassName.EVENTS.end, ClassName.createCustomEventObject(event, selectedElements, { marqueeData: data, $marquee: $marqueeDiv, $scrollCntr: this.$scrollContainer }));

            }
            //for the requirement of showing the dot-operator above marquee.
            this.$marqueeDiv.css({'z-index' : 0});
            event.preventDefault();
            this._detachUpAndMoveEvents();
            return;
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
                temporaryBounds.height = elemTop + elemHeight > temporaryBounds.top + temporaryBounds.height ? elemTop + elemHeight - temporaryBounds.top : temporaryBounds.height;
                temporaryBounds.width = elemLeft + elemWidth > temporaryBounds.left + temporaryBounds.width ? elemLeft + elemWidth - temporaryBounds.left : temporaryBounds.width;
            }
            else {
                if (elemTop <= temporaryBounds.top && elemLeft <= temporaryBounds.left) {
                    temporaryBounds.height = temporaryBounds.top + temporaryBounds.height - elemTop;
                    temporaryBounds.width = temporaryBounds.left + temporaryBounds.width - elemLeft;
                    temporaryBounds.top = elemTop;
                    temporaryBounds.left = elemLeft;
                }
                else if (elemTop >= temporaryBounds.top && elemLeft <= temporaryBounds.left) {
                    temporaryBounds.height = temporaryBounds.top + temporaryBounds.height < elemTop + elemHeight ? elemTop + elemHeight - temporaryBounds.top : temporaryBounds.height;
                    temporaryBounds.width = temporaryBounds.left + temporaryBounds.width - elemLeft;
                    temporaryBounds.left = elemLeft;
                }
                else if (elemTop <= temporaryBounds.top && elemLeft >= temporaryBounds.left) {
                    temporaryBounds.height = elemHeight < temporaryBounds.height ? temporaryBounds.top + temporaryBounds.height - elemTop : elemHeight;
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
                $marquee = this.$marqueeDiv,
                marqueeOffset = $marquee.offset(),
                marqueeTop = marqueeOffset.top,
                marqueeLeft = marqueeOffset.left,
                marqueeHeight = $marquee.outerHeight(true),
                marqueeWidth = $marquee.outerWidth(true),
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

            if ((marqueeLeft < itemAreaWidth && marqueeAreaWidth > itemLeft) &&
                (marqueeTop < itemAreaHeight && marqueeAreaHeight > itemTop)) {

                if (totalAreaCovered / itemArea > tolerance) {
                    isInsideMarquee = true;
                }
            }

            return isInsideMarquee;
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
        _resizeMarquee: function _resizeMarquee(dimensionsObject, selectedElements, fireEvent, event) {
            var self = this,
                $marquee = this.$marqueeDiv,
                padding = null,     // remove this var
                paddingTop = this.model.get('paddingTop'),
                paddingRight = this.model.get('paddingRight'),
                paddingBottom = this.model.get('paddingBottom'),
                paddingLeft = this.model.get('paddingLeft'),
                defaultOffset = this.model.get('marqueeDefaultOffset'),
                customEventObject = null, leftAdjust = 0, scrollAmt = 0;

            if (dimensionsObject) {
                // if mouse down point is after scroll then subtract scrollable amt to left of resized div
                if (scrollAmt) {
                    // probably dead code. remove later
                    leftAdjust = scrollAmt;
                    $marquee.css({
                        top: Math.round(dimensionsObject.top - padding + defaultOffset.top),
                        left: Math.round(dimensionsObject.left - padding + defaultOffset.left) + leftAdjust,
                        height: Math.round(dimensionsObject.height ? dimensionsObject.height + (padding * 2) : 0),
                        width: Math.round(dimensionsObject.width ? dimensionsObject.width + (padding * 2) : 0)
                    });
                }
                else {
                    $marquee.css({
                        top: /*Math.round*/(dimensionsObject.top - paddingTop + defaultOffset.top),
                        left: /*Math.round*/(dimensionsObject.left - paddingLeft/* - paddingLeft + defaultOffset.left*/),
                        height: Math.round(dimensionsObject.height ? dimensionsObject.height + (paddingTop + paddingBottom) : 0),
                        width: Math.round(dimensionsObject.width ? dimensionsObject.width + (paddingRight + paddingLeft) /*+ (paddingLeft + paddingRight) - 1*/ : 0) + scrollAmt
                    });
                }


                if (dimensionsObject.height === 1 || dimensionsObject.width === 1) {
                    $marquee.css({ 'outline': 'none' });
                }

                var data = this._getMarqueeData(),
                    elemsPos = [],
                    numSelected = null;

                numSelected = selectedElements.length;
                //for (var i = 0; i < numSelected; i++) {
                //    elemsPos.push(this._getElementData(selectedElements[i]));
                //}

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
                };

            return data;
        },

        /**
        * A boolean indicating if the marquee is disabled. Set to true while disabling the marquee and to true while
        * enabling it.
        *
        * @property isDisabled
        * @type Boolean
        * @default true
        */
        isDisabled: false,

        /**
        * Disables marquee drawing
        * @method disableMarquee
        */
        disableMarquee: function disableMarquee() {
            var $marqueeDiv = this.$marqueeDiv;
            this.hideMarquee();
            this.detachListenersOnMarqueeContainment();
            this.isDisabled = true;
            if ($marqueeDiv.is('.ui-draggable')) { $marqueeDiv.draggable('disable'); }
            if ($marqueeDiv.is('.ui-droppable')) { $marqueeDiv.droppable('disable'); }
        },

        /**
        * Enables Marquee Draggable if passed true
        * @method enableDisableMarqueeDraggable
        */
        enableDisableMarqueeDraggable: function enableMarqueeDraggable(enable) {
            if (this.$marqueeDiv.is('.ui-draggable')) {
                this.$marqueeDiv.draggable(enable ? 'enable' : 'disable');
            }
        },

        /**
        * Enables Marquee Droppable if passed true
        * @method enableDisableMarqueeDroppable
        */
        enableDisableMarqueeDroppable: function enableDisableMarqueeDroppable(enable) {
            if (this.$marqueeDiv.is('.ui-droppable')) {
                this.$marqueeDiv.droppable(enable ? 'enable' : 'disable');
            }
        },

        /**
        * Enables marquee drawing
        * @method enableMarquee
        */
        enableMarquee: function enableMarquee() {
            this.isDisabled = false;
            this.showMarquee();
            this.attachListenersOnMarqueeContainment();
            this._attachListenersOnMarqueeDiv();
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
        * Returns Marquee Div
        * @method getMarqueeDiv
        */
        getMarqueeDiv: function getMarqueeDiv() {
            return this.$marqueeDiv;
        },

        /**
        * Collapses the marquee div
        * @method collapseMarquee
        */
        collapseMarquee: function collapseMarquee(event) {
            var $marqueeDiv = this.$marqueeDiv;
            this.marqueeInitRect = null;
            this._resizeMarquee({ top: 0, left: 0, width: 0, height: 0 }, false, true, event);
            $marqueeDiv.css({ 'border': 'none', 'background-color': 'rgba(0, 0, 0, 0);' });
            setTimeout(function () {
                $marqueeDiv.off();
                // Check whether perticular item is draggable/droppable and then apply destroy method otherwise it will throw an exception on VM-INLINE
                // Causes problem with jQuery UI - v1.10.3 but works fine with jQuery UI -v1.8.16
                if ($marqueeDiv.is('.ui-draggable')) { $marqueeDiv.draggable('destroy'); }
                if ($marqueeDiv.is('.ui-droppable')) { $marqueeDiv.droppable('destroy'); }
            }, 10);
        },

        /**
        * To draw marquee programmatically
        * @method customFitMarqueeToBounds
        * @param {Object} [bounds] Object of top, left, height and width of marquee
        * @param {Array} [selectedElements]
        */
        customFitMarqueeToBounds: function (bounds, selectedElements) {
            this._resizeMarquee(bounds, selectedElements, false);
            //return this.marqueeMouseUpHandler(null, null, true);
        },

        /**
        * Useful for drawing marquee programmatically over elements. Only need to pass a list of elems to draw
        * marquee over.
        * @method drawMarqueeOn
        * @param {Array} Array of elems to draw marquee over.
        */
        drawMarqueeOn: function (elems) {
            var i = 0,
                tileRect = null,
                marqueeRect = null,
                marqueeContOffset = this.$marqueeContainer.offset(),
                offset = null,
                currentElem = null;

            for (i = 0; i < elems.length; i++) {
                currentElem = elems[i].$el;
                offset = currentElem.offset();
                tileRect = {
                    left: offset.left - marqueeContOffset.left,
                    top: offset.top - marqueeContOffset.top,
                    width: currentElem.outerWidth(),
                    height: currentElem.outerHeight(),
                };
                tileRect.right = tileRect.left + tileRect.width;
                tileRect.bottom = tileRect.top + tileRect.height;

                if (!marqueeRect) {
                    marqueeRect = $.extend({}, tileRect);
                }

                marqueeRect = {
                    left: Math.min(marqueeRect.left, tileRect.left),
                    top: Math.min(marqueeRect.top, tileRect.top),
                    right: Math.max(marqueeRect.right, tileRect.right),
                    bottom: Math.max(marqueeRect.bottom, tileRect.bottom),
                };

                marqueeRect.width = marqueeRect.right - marqueeRect.left;
                marqueeRect.height = marqueeRect.bottom - marqueeRect.top;
            }

            this.customFitMarqueeToBounds(marqueeRect, elems);
            this.$marqueeDiv.css(modelClassNamespace.Marquee.MARQUEE_STYLE_AFTER_RELEASE);
            if(this.model.get('marqueeBGColor')) {
                this.$marqueeDiv.css('background-color', this.model.get('marqueeBGColor'));
            }
        },

        /**
        * Inserts given html into marquee div
        * @method groupSelectedElements
        * @param {Object} [elementsHolder] jQuery object of div containing the HTML
          to be appended in the marquee div
        */
        groupSelectedElements: function (elementsHolder) {
            var $marquee = this.$marqueeDiv,
                self = this,
                scope = this.namespace,
                isTouch = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
            this.$groupCover = $('<div/>');
            $marquee.append(elementsHolder);

            $marquee.append(this.$groupCover);


            this.$groupCover.attr('class', 'selected-elements-cover')
                .css({
                    'position': 'absolute',
                    'height': $marquee.outerHeight(),
                    'width': $marquee.outerWidth(),
                    'top': '0px',
                    'left': '0px',
                    'z-index': 0
                });
            if (this._isAcc) {
                this.$groupCover.attr('tabindex', -1);
            }


            $marquee.css(MathInteractives.Common.Components.Models.EquationManagerPro.Marquee.MARQUEE_STYLE_AFTER_RELEASE);
            if(this.model.get('marqueeBGColor')) {
                $marquee.css('background-color', this.model.get('marqueeBGColor'));
            }
            // Attach touch events on Marquee div
            //if (isTouch) {
            //    $marquee.off('touchstart.' + scope)
            //    .on('touchstart.' + scope, function marqueeMouseDown(event) {
            //        self.marqueeMouseDownHandler(event);
            //})
            //.off('touchmove.' + scope)
            //.on('touchmove.' + scope, function (e) { e.stopPropagation();});
            $marquee.off('mousedown.' + scope)
                .on('mousedown.' + scope, function marqueeMouseDown(event) {
                    self.marqueeMouseDownHandler(event);
                });
            // }
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($marquee);

        },

        /**
        * Makes the marquee div draggable
        * @method makeGroupDraggable
        */
        makeGroupDraggable: function (marqueeSourceItem, marqueeSelectedItemsIndices, equationManager) {
            var self = this,
                scrollLeft = 0,
                length = marqueeSelectedItemsIndices.length,
                binTileTypes = modelClassNamespace.TileItem.TileType,
                ptMouse,
                EVENTS = viewClassNamespace.EquationManagerPro.EVENTS;

            //if ($.support.touch) {
            //    this.$marqueeDiv.on('touchstart', function (evt) {
            //        equationManager.adjustContainment($(this));
            //    });

            //    this.$marqueeDiv.on('touchend', function (evt) {
            //        equationManager.resetContainment();
            //    });
            //}
            //else {
            this.$marqueeDiv.on('mousedown', function (evt) {
                equationManager.adjustContainment($(this));
                equationManager.mouseDownOnInteractive(evt, false, true, false);
                evt.stopPropagation();
            });

            this.$marqueeDiv.on('mouseup', function (evt) {
                equationManager.resetContainment();
            });
            //}


            this.$marqueeDiv.draggable({
                scroll: true,
                scrollSensitivity: 50,
                distance: 10,
                refreshPositions: true,
                scrollSpeed: (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) ? 40 : 30,
                appendTo: this.equationManager.$el.find('.equation-view-component'),
                containment: equationManager.$draggableContainment,

                revert: function () {
                    self.$marqueeDiv.css({ 'cursor': 'default' });
                    if (this.data('isDropped') === true) {
                        self.equationManager.$('.term-tile[data-negatetile=true]').removeAttr('data-negatetile data-originalvalue');
                        return false;
                    }
                    else {
                        self.equationManager._showHideDropslots(self.equationManager.equationView.$el, false);
                        self.equationManager.showHideOverlayDiv(true);
                        equationManager.trigger(EVENTS.REVERT_START);
                        return false;
                    }
                },
                zIndex: 5,
                cursorAt: { left: self.$marqueeDiv.width() / 2, top: self.$marqueeDiv.height() / 2 },
                helper: 'clone',
                start: function (event, ui) {
                    var evt = event.originalEvent ? event.originalEvent : event,
                        EVENTS = viewClassNamespace.EquationManagerPro.EVENTS,
                        $parent = $(this).parents('.expression-view-holder').length > 0 ? $(this).parents('.expression-view-holder') : null;
                    if ($parent) {
                        scrollLeft = $parent.scrollLeft();
                    }

                    self.stopReading();
                    $(this).css({ 'visibility': 'hidden' });
                    //equationManager.equationView.attachDetachDraggable(-1, true);
                    self.isDragging = true;
                    ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                    ui.helper.addClass('current-draggable');
                    ui.helper.data({ 'cur-draggable': marqueeSourceItem, 'length': length, 'prevLocationData': marqueeSourceItem.model.get('isLHS') });
                    equationManager.trigger(EVENTS.MARQUEE_DRAG_START);
                    equationManager.trigger(EVENTS.ANY_DRAG_START);
                    equationManager.getLhsRhsContainerRects();
                },
                drag: function (event, ui) {
                    self.equationManager.enableDisableDroppables(event, ui, self.equationManager.marqueeSelectedItems[0]);
                    if (!self.equationManager.onlyLHS) {
                        self._negateTile(event, ui);
                    }
                    var marqueeSelectedTileViews = self.equationManager.marqueeSelectedItems, tileView;
                    if (marqueeSelectedTileViews.length === 1) {
                        tileView = marqueeSelectedTileViews[0];
                        if (tileView.model.get('type') === modelClassNamespace.TileItem.TileType.TERM_TILE) {
                            tileView._termTileDraggingStart();
                        }
                    }
                },
                stop: function (event, ui) {
                    equationManager.trigger(EVENTS.ANY_DRAG_STOP);
                    var marqueeSelectedTileViews = self.equationManager.marqueeSelectedItems, tileView;
                    if (marqueeSelectedTileViews.length === 1) {
                        tileView = marqueeSelectedTileViews[0];
                        if (tileView.model.get('type') === modelClassNamespace.TileItem.TileType.TERM_TILE) {
                            tileView._termTileDraggingStop();
                        }
                    }

                    if (!$(this).data('isDropped')) {

                        //Animating using jquery to fix #15951 and #16012

                        var $this = $(this),
                            $parent = $this.parents('.expression-view-holder').length > 0 ? $(this).parents('.expression-view-holder') : null,
                            position = ui.originalPosition,
                            positionLeft = position.left,
                            positionTop = position.top,
                            helperClone = ui.helper.clone(),
                            stopEvent = event;

                        ui.helper.parent().append(helperClone);
                        helperClone.css({ 'z-index': 5 });
                        self.equationManager.showHideOverlayDiv(true);

                        if ($parent) {
                            var scrollObj = equationManager.getScrollAmount($parent, $this);
                            if (scrollObj.scroll) {
                                $parent.scrollLeft(scrollObj.scrollAmt);
                            }
                            scrollLeft -= $parent.scrollLeft();
                        }

                        helperClone.animate({
                            'top': positionTop, 'left': positionLeft + scrollLeft
                        }, 700, function () {
                            self._onStop(equationManager, ui, $this);
                            $this.css({ 'visibility': '' });
                            helperClone.remove();
                        });
                    }
                    else {
                        equationManager.removeMarquee();
                        self._onStop(equationManager, ui, $(this));
                        equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DROP_SUCCESS);
                    }


                }
            }).attr({ 'data-tiletype': binTileTypes.MARQUEE });

            // create ctx menu everytime marquee is drawn because
            // all events are removed on collapseMarquee.
            /*this.createCtxMenu();
            this.attachEventsAcc();*/
        },

        /**
       * Actions to be performed on complete stop of the marquee
       * @method _onStop
       * @param {equationManager} Object Equation Manager
       * @param {ui} Object Jquery ui object which is being dragged
       * @param {$this} Object Original jquery object
       * @private
       */
        _onStop: function _onStop(equationManager, ui, $this) {

            var EVENTS = viewClassNamespace.EquationManagerPro.EVENTS;

            this.isDragging = false;
            //equationManager.equationView.attachDetachDraggable(-1, false);
            ui.helper.removeData('cur-draggable');
            ui.helper.removeClass('current-draggable');
            ui.helper.removeData('prevLocationData');
            ui.helper.removeData('length');
            $this.removeData('isDropped');
            equationManager.resetContainment();
            equationManager.showHideOverlayDiv(false);
            equationManager.refresh();
            equationManager.trigger(EVENTS.REVERT_END);
            equationManager.setIsDropped(false);
            equationManager.refresh();
            equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
        },

        _negateTile: function _negateTile(event, ui) {
            var isLHS = this.model.get('marqueeIndex') === 0 ? true: false,
                //ptMouse = new Point({ left: event.clientX, top: event.clientY }),
                helperRect = new Rect(ui.helper[0].getBoundingClientRect()),
                ptMouse = helperRect.getMiddle();

            var $elementsToNegate = this.$('.term-tile[data-negatetile=true]'),
                elementsToNegateLen = $elementsToNegate.length / 3, i, isNegate = false;


            if (this.equationManager.lhsRect.isPointInRect(ptMouse) && !isLHS) {
                isNegate = true;

            }
            else if (this.equationManager.rhsRect.isPointInRect(ptMouse) && isLHS) {
                isNegate = true;
            }
            else {
                isNegate = false;
            }

            for (i = $elementsToNegate.length; i > $elementsToNegate.length - elementsToNegateLen; i--) {
                this.invertBaseText(isNegate, $($elementsToNegate[i-1]));
            }
        },

        /**
        * change sign across section
        * @method invertBaseText
        * @param {isInvert} boolean
        * @param {$element} Jquery object
        * @public
        */
        invertBaseText: function invertBaseText(isInvert, $element) {
            var baseConatiner = $element.find('.base-value');
            if (baseConatiner.find('.base-str') === 0) {
                return;
            }
            if (isInvert) {
                if (!baseConatiner.data('isNegate')) {
                    baseConatiner.html(this.invertText(baseConatiner.text()));
                }
                baseConatiner.data('isNegate', true);
            }
            else {
                baseConatiner.html(this.getValueText($element.data('originalvalue')));
                baseConatiner.data('isNegate', false);
            }
        },

        /**
        * Given a text, this function either removes a minus sign or adds one.
        * e.g. invertText('−5') returns '5'
        * e.g. invertText('3') returns '−3'
        * @method invertText
        * @param {String} Text to invert
        * @return {String} Inverted text
        */
        invertText: function (text) {
            var minus = '−',
                parsedText = parseInt(text),
                textWithoutMinus = null;      // Unicode Character 'MINUS SIGN' (U+2212)
            if (text.indexOf(minus) === -1) {
                if (isNaN(parsedText)) {
                    return minus + '<em>' + text + '</em>';
                }
                else {
                    if (text === '0') {
                        return text;
                    }
                    else {
                        return minus + text;
                    }
                }
            } else {
                textWithoutMinus = text.substr(minus.length);
                if (isNaN(parseInt(textWithoutMinus))) {
                    return '<em>' + textWithoutMinus + '</em>';
                }
                else {
                    return textWithoutMinus;
                }
            }
        },


        /**
        * Returns the text for the value to be displayed.
        * For e.g. if a base has value -5 calling tile.getValueText('base')
        * would return "&minus;5" i.e. the escaped string.
        * @method getValueText
        * @param {String} Attribute to fetch
        * @return {String} String to display
        */
        getValueText: function (originalvalue) {
            var val = originalvalue;
            if (typeof val === 'string' && val.indexOf('-') !== -1) {
                val = '<em>' + val + '</em>';
                return '&minus;' + val.replace('-', '');
            }

            if (val !== null && val !== undefined) {
                if (isNaN(val)) {
                    return val < 0 ? '&minus;' + Math.abs(val) : '<em>' + val.toString() + '</em>';
                }
                else {
                    return val < 0 ? '&minus;' + Math.abs(val) : val.toString();
                }
            }
            else {
                return val;
            }
        },


        /*onMouseOver: function (event, ui) {
            this.equationManager.registerMouseOverTile(this, event, ui);
            this.$marqueeDiv.addClass('hover-class');
        },

        onMouseOut: function (event, ui) {
            this.$marqueeDiv.removeClass('hover-class');
        },

        onTileDrop: function (event, ui, params) {
            var draggedTileData = ui.helper.data(),
                draggedTileType = draggedTileData.tiletype,
                marqueeSourceItem = params.marqueeSourceItem,
                numOfTiles = params.length,
                binTileTypes = modelClassNamespace.TileItem.BinTileType,
                data = {};
            if (draggedTileType === binTileTypes.PARENTHESES) {
                data = {
                    sourceTile: ui.helper,
                    index: marqueeSourceItem.parent.getIndex(marqueeSourceItem),
                    numOfTiles: numOfTiles,
                    isDropOnMarquee: true
                };
                this.equationManager.onAddTile(data);
                ui.draggable.data('isDropped', true);
            }
        },*/


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
        },


        /**
        * Applies hand cursor to element
        * @method applyHandCursorToElem
        * @param {Object} jQuery object to which cursor has to be applied
        */
        applyHandCursorToElem: function applyHandCursorToElem($elem) {
            if (this.equationManager.isTouch()) {
                return;
            }
            var enter, leave;
            //if (!this.equationManager.isTouch()) {
            enter = 'mouseenter';
            leave = 'mouseleave';
            //}
            //else {
            //enter = 'touchstart';
            //leave = 'touchend';
            //}
            $elem.on(enter, $.proxy(this._setOpenCursor, this));
            $elem.on(leave, $.proxy(this._setDefaultCursor, this));
            $elem.on('mousedown', $.proxy(this._setClosedCursor, this));
            $elem.on('mouseup', $.proxy(this._setOpenCursor, this));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($elem);
        },

        /**
        * Applies Open hand cursor to the marquee div
        * @method _setOpenCursor
        * @private
        */
        _setOpenCursor: function () {
            if (this.equationManager.isTouch()) {
                return;
            }
            var $marqueeDiv = this.$marqueeDiv;
            if ($marqueeDiv.hasClass('current-draggable')) { return; }
            $marqueeDiv.css({ 'cursor': "url('" + this.getImagePath('open-hand') + "'), move" });
        },

        /**
        * Applies Closed hand cursor to the marquee div
        * @method _setClosedCursor
        * @private
        */
        _setClosedCursor: function () {
            if (this.equationManager.isTouch()) {
                return;
            }
            var $marqueeDiv = this.$marqueeDiv;
            if ($marqueeDiv.hasClass('current-draggable')) { return; }
            $marqueeDiv.css({ 'cursor': "url('" + this.getImagePath('closed-hand') + "'), move" });
        },

        /**
        * Applies Default cursor to the marquee div
        * @method _setDefaultCursor
        * @private
        */
        _setDefaultCursor: function () {
            if (this.equationManager.isTouch()) {
                return;
            }
            var $marqueeDiv = this.$marqueeDiv;
            if ($marqueeDiv.hasClass('current-draggable')) { return; }
            $marqueeDiv.css({ 'cursor': 'default' });
        },

        /**
        * Removes all cursor handlers from marquee div.
        * @method resetCursor
        * @private
        */
        resetCursor: function () {
            if (this.equationManager.isTouch()) {
                return;
            }
            var $marqueeDiv = this.$marqueeDiv, enter, leave;

            //if (!this.equationManager.isTouch()) {
            enter = 'mouseenter';
            leave = 'mouseleave';
            //}
            //else {
            //    enter = 'touchstart';
            //    leave = 'touchend';
            //}
            $marqueeDiv.off(enter, this._setOpenCursor);
            $marqueeDiv.off(leave, this._setDefaultCursor);
            $marqueeDiv.off('mousedown', this._setClosedCursor);
            $marqueeDiv.off('mouseup', this._setOpenCursor);
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($marqueeDiv);
        },

        //invertExponentText: function invertExponentText(bOriginal) {
        //    var exponentsToInvertDOM = this.equationManager.marqueeExponents,
        //        marqueeSelectedItems = this.equationManager.marqueeSelectedItems,
        //        index, exponentConatiner;

        //    for (index = 0; index < exponentsToInvertDOM.length; index++) {
        //        exponentConatiner = exponentsToInvertDOM[index];
        //        if (exponentConatiner) {
        //            if (marqueeSelectedItems[index] && marqueeSelectedItems[index].model.get('exponent') !== 0) {
        //                if (bOriginal) {
        //                    exponentConatiner.html(marqueeSelectedItems[index].getValueText('exponent'));
        //                }
        //                else {
        //                    exponentConatiner.html(marqueeSelectedItems[index].invertText(exponentConatiner.text()));
        //                }
        //            }
        //        }
        //    }
        //}

    }, {

        /**
        * Instantiates marquee model and view
        * @method createMarquee
        * @param {Object} [options]
        */
        createMarquee: function (options) {
            if (options) {
                var marquee = new MathInteractives.Common.Components.Models.EquationManagerPro.Marquee(options),
                    marqueeView = new MathInteractives.Common.Components.Views.EquationManagerPro.Marquee({ model: marquee, el: options.el || options.player.$el, equationManager: options.equationManager });
                return marqueeView;
            }
        },

        /**
        * Static event object
        */
        EVENTS: {
            MARQUEE_MOUSEDOWN: 'marquee-mousedown',
            resize: 'marquee-resize',
            move: 'marquee-move',
            start: 'marquee-select-start',
            end: 'marquee-end',
            ChangeSelectorClass: 'change-selector-class'
        },

        /**
        * Static classes for numerator div and denominator div
        */
        FRACTION_CLASSES: {
            NUMERATOR: 'fraction-component-numerator',
            DENOMINATOR: 'fraction-component-denominator'
        },

        /*
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
            };
        },

        bDocumentEventAttached: false,

        CTX_ITEM_ID: {
            DELETE_TILE: 'marquee-context-menu-0',
            ADD_NEG_PARENS: 'marquee-context-menu-1',
            ADD_POS_PARENS: 'marquee-context-menu-2',
            REMOVE_PARENS: 'marquee-context-menu-3',
            COMBINE_NUM: 'marquee-context-menu-4',
            COMBINE_DEN: 'marquee-context-menu-5',
            REPOS_ACROSS_VINCULUM: 'marquee-context-menu-6'
        }
    });

    ClassName = viewClassNamespace.Marquee;
    //namespace.global.Marquee = ClassName;

})(window.MathInteractives);
