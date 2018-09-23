(function () {
    'use strict';
    var ClassName = null,
        viewClassNamespace = MathInteractives.Common.Components.Views.EquationManager,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point;

    /**
    * View for rendering drag to select component (Marquee)
    * @class Marquee
    * @module EquationManager
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views.EquationManager
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

        // TODO YUIDoc
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
                TYPE = modelClassNamespace.TileItem.BinTileType;

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
            this.$marqueeDiv = this.createMarqueeDiv();
            this.createCtxMenu();
            this._attachListenersOnMarqueeContainment();
            this._attachListenersOnMarqueeDiv();
            this.attachEventsAcc();
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

            $containment.append($marqueeDiv);
            return $marqueeDiv;
        },

        createCtxMenu: function () {
            var ContextMenu = MathInteractives.Common.Interactivities.ExponentAccordion.Views.DerivedContextMenu;;
            this.ctxMenu = null;
            this.ctxMenu = ContextMenu.initContextMenu({
                el: this.player.$el,
                prefix: this.idPrefix,
                elements: [this.$marqueeDiv],
                screenId: 'marquee-context-menu',
                contextMenuCount: 7,
                manager: this.manager,
                thisView: this
            });
            this.equationManager._tutorialMode ? this.updateCtxMenuRowsTut() : this.updateCtxMenuRows();
        },

        /**
        * Attach listeners
        * @method _attachListenersOnMarqueeContainment
        * @return Object jquery object of container
        * @private
        */
        _attachListenersOnMarqueeContainment: function _attachListenersOnMarqueeContainment() {
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
                specificEvents:MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE
            });
        },

        _attachListenersOnMarqueeDiv: function () {
            this.$marqueeDiv.off('keydown.acc').on('keydown.acc', $.proxy(this.keydownHandler, this));
        },

        /**
        * Attach events related to accessibility
        * @method attachEventsAcc
        */
        attachEventsAcc: function () {
            if (!this.isAccessible()) {
                return;
            }
            var ContextMenu = MathInteractives.global.ContextMenu,
                EVENT = viewClassNamespace.EquationManager.EVENTS,
                CTXMENU_EVENTS = {
                    HIDE: ContextMenu.CONTEXTMENU_HIDE,
                    OPEN: ContextMenu.CONTEXTMENU_OPEN,
                    SELECT: ContextMenu.CONTEXTMENU_SELECT
                },
                MARQUEE_NS = 'marquee';
            this.$marqueeDiv.off(CTXMENU_EVENTS.HIDE).on(CTXMENU_EVENTS.HIDE, $.proxy(this.ctxMenuHideHandler, this));
            this.$marqueeDiv.off(CTXMENU_EVENTS.SELECT).on(CTXMENU_EVENTS.SELECT, $.proxy(this.ctxMenuSelectHandler, this));
            if (this.equationManager._tutorialMode) {
                this.listenTo(this.equationManager, EVENT.TUTORIAL_STEP_CHANGE, this.updateCtxMenuRowsTut);
            }
            this.$marqueeDiv.off('focusin.' + MARQUEE_NS).on('focusin.' + MARQUEE_NS, $.proxy(this.marqueeFocusin, this));
            this.$marqueeDiv.off('focusout.' + MARQUEE_NS).on('focusout.' + MARQUEE_NS, $.proxy(this.marqueeFocusout, this));
        },

        /**
        * Removes event listeners
        *
        * @method _detachListenersOnMarqueeContainment
        * @private
        **/
        _detachListenersOnMarqueeContainment: function _detachListenersOnMarqueeContainment() {
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
            this._detachListenersOnMarqueeContainment();
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
                evt = event;

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
            this.trigger(ClassName.EVENTS.start, ClassName.createCustomEventObject(evt));
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
            contRect = new Rect(this.equationManager.$el[0].getBoundingClientRect());

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
                this.equationManager.$el.scrollLeft(scrollAmt + scrollSensitivity);
            } else if (pointX - scrollAmt < contRect.getLeft() + tolerance) {
                this.equationManager.$el.scrollLeft(scrollAmt - scrollSensitivity);
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

            this.trigger(ClassName.EVENTS.ChangeSelectorClass, event, $marqueeDiv);

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
                $itemsToSelect = typeof (selectorClass) === 'string' ? $('.' + selectorClass) : selectorClass,
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



            resizeEventObject = self._resizeMarquee(temporaryBounds, selectedElements, fireEvent, event);

            //if (isTriggeredExternally) {
            //    return resizeEventObject;
            //}

            // also resize cover
            if (this.$groupCover) {
                this.$groupCover.css({
                    'height': this.$marqueeDiv.outerHeight(),
                    'width': this.$marqueeDiv.outerWidth()
                });
            }

            this.marqueeInitRect = new Rect($marqueeDiv[0].getBoundingClientRect());

            if (fireEvent) {
                self.trigger(ClassName.EVENTS.end, ClassName.createCustomEventObject(event, selectedElements, { marqueeData: data, $marquee: $marqueeDiv }));

            }

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
                if (elemTop >= temporaryBounds.top && elemLeft <= temporaryBounds.left) {
                    temporaryBounds.height = temporaryBounds.top + temporaryBounds.height < elemTop + elemHeight ? elemTop + elemHeight - temporaryBounds.top : temporaryBounds.height;
                    temporaryBounds.width = temporaryBounds.left + temporaryBounds.width - elemLeft;
                    temporaryBounds.left = elemLeft;
                }
                if (elemTop <= temporaryBounds.top && elemLeft >= temporaryBounds.left) {
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
                        top: Math.round(dimensionsObject.top - paddingTop + defaultOffset.top),
                        left: Math.round(dimensionsObject.left - paddingLeft + defaultOffset.left),
                        height: Math.round(dimensionsObject.height ? dimensionsObject.height + (paddingTop + paddingBottom) - 1: 0),
                        width: Math.round(dimensionsObject.width ? dimensionsObject.width + (paddingLeft + paddingRight) - 1: 0) + scrollAmt
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
            this._detachListenersOnMarqueeContainment();
            this.isDisabled = true;
            if ($marqueeDiv.is('.ui-draggable')) { $marqueeDiv.draggable('disable'); }
            if ($marqueeDiv.is('.ui-droppable')) { $marqueeDiv.droppable('disable'); }
        },

        /**
        * Enables marquee drawing
        * @method enableMarquee
        */
        enableMarquee: function enableMarquee() {
            this.isDisabled = false;
            this.showMarquee();
            this._attachListenersOnMarqueeContainment();
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
                    bottom : Math.max(marqueeRect.bottom, tileRect.bottom),
                };

                marqueeRect.width = marqueeRect.right - marqueeRect.left;
                marqueeRect.height = marqueeRect.bottom - marqueeRect.top;
            }

            this.customFitMarqueeToBounds(marqueeRect, elems);
            this.$marqueeDiv.css(modelClassNamespace.Marquee.MARQUEE_STYLE_AFTER_RELEASE);
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


            $marquee.css(MathInteractives.Common.Components.Models.EquationManager.Marquee.MARQUEE_STYLE_AFTER_RELEASE);
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
                length = marqueeSelectedItemsIndices.length,
                binTileTypes = modelClassNamespace.TileItem.BinTileType,
                ptMouse,
                EVENTS = viewClassNamespace.EquationManager.EVENTS,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNamespace.EquationManager.MODES;

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
                scrollSpeed: (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) ? 40 : 30,
                containment: equationManager.$draggableContainment,
                revert: function (event) {
                    self.$marqueeDiv.css({ 'cursor': 'default' });
                    if (this.data('isDropped') === true) {
                        return false;
                    }
                    else {
                        var bRemove = self.equationManager.isTileRemovable(self, ptMouse);
                        if (bRemove) {
                            return false;
                        }
                        else {
                            self.equationManager.showHideOverlayDiv(true);
                            equationManager.trigger(EVENTS.REVERT_START);
                            return true;
                        }
                    }
                },
                zIndex: 1,
                cursorAt: { left: self.$marqueeDiv.width() / 2, top: self.$marqueeDiv.height() / 2 },
                //helper: function () {
                //    return $('<div></div>');
                //},
                start: function (event, ui) {
                    var evt = event.originalEvent ? event.originalEvent : event,
                        EVENTS = viewClassNamespace.EquationManager.EVENTS;
                    equationManager.equationView.attachDetachDraggable(-1, true);
                    self.isDragging = true;
                    ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                    $(this).addClass('current-draggable');
                    if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                        ui.helper.data({ 'cur-draggable': marqueeSourceItem, 'length': length, 'prevLocationData': marqueeSourceItem.model.get('bDenominator') });
                    }
                    else {
                        ui.helper.data({ 'cur-draggable': marqueeSourceItem , 'length': length});
                    }
                    equationManager.trigger(EVENTS.MARQUEE_DRAG_START);
                },
                drag: function (event, ui) {
                    var evt = event.originalEvent ? event.originalEvent : event;
                    ptMouse.setPoint({ left: evt.clientX, top: evt.clientY });
                    var droppable = $(this).data('cur-droppable');
                    if (droppable) {
                        droppable.onMouseOver(event, ui);
                    }
                },
                stop: function (event, ui) {
                    self.isDragging = false;
                    equationManager.equationView.attachDetachDraggable(-1, false);
                    ui.helper.removeData('cur-draggable');
                    $(this).removeClass('current-draggable');

                    if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                        ui.helper.removeData('prevLocationData');
                        ui.helper.removeData('length');
                        if (!$(this).data('isDropped')) {
                            self.invertExponentText(true);
                        }
                    }

                    if (!$(this).data('isDropped')) {
                        var evt = event.originalEvent ? event.originalEvent : event,
                            ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                            bRemove = equationManager.isTileRemovable(self, ptMouse);
                        if (bRemove) {
                            var data = { sourceTile: marqueeSourceItem, numOfTiles: length };
                            equationManager.onDeleteTile(data);
                        }
                    }


                    $(this).removeData('isDropped');
                    equationManager.resetContainment();
                    equationManager.showHideOverlayDiv(false);
                    equationManager.refresh();
                    equationManager.trigger(EVENTS.REVERT_END);
                    equationManager.setIsDropped(false);
                    equationManager.refresh();
                }
            }).attr({ 'data-tiletype': binTileTypes.MARQUEE });

            this.$marqueeDiv.droppable({
                accept: '*',
                tolerance: 'pointer',
                greedy: true,
                scope: 'marquee-scope',
                drop: function (event, ui) {
                    if (!equationManager.getIsDropped()) {
                        self.onTileDrop(event, ui, { marqueeSourceItem: marqueeSourceItem, length: length });
                        self.$el.removeClass('white-border-left' + ' ' + 'white-border-right' + ' ' + 'white-border');
                        equationManager.setIsDropped(true);
                        return true;
                    }
                },
                over: function (event, ui) {
                    self.onMouseOver(event, ui);
                    ui.draggable.data('cur-droppable', self);
                },
                out: function (event, ui) {
                    self.onMouseOut(event, ui);
                    ui.draggable.removeData('cur-droppable');
                }
            });

            // create ctx menu everytime marquee is drawn because
            // all events are removed on collapseMarquee.
            this.createCtxMenu();
            this.attachEventsAcc();
        },

        onMouseOver: function (event, ui) {
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
            if (draggedTileType === binTileTypes.PARENTHESIS) {
                data = {
                    sourceTile: ui.helper,
                    index: marqueeSourceItem.parent.getIndex(marqueeSourceItem),
                    numOfTiles: numOfTiles,
                    isDropOnMarquee: true
                };
                this.equationManager.onAddTile(data);
                ui.draggable.data('isDropped', true);
            }
        },

        /**
        * Delete tiles when 'Delete tiles' row is selected in context menu
        * @method deleteTilesAcc
        */
        deleteTilesAcc: function () {
            var marqueeSelectedItems = this.equationManager.marqueeSelectedItems,
                data = {
                    sourceTile: marqueeSelectedItems[0],
                    numOfTiles: marqueeSelectedItems.length
                };

            this.equationManager.onDeleteTile(data);
            this.setFocus('droppable-region');
        },

        /**
        * Add Parentheses to tiles when 'Add ()' or 'Add -()' row is selected in context menu
        * @param {Number} Coefficient of parentheses tile
        * @method addParenthesesAcc
        */
        addParenthesesAcc: function (coefficient) {
            var data = {},
                firstTile = this.equationManager.marqueeSelectedItems[0];
            data.sourceTile = {
                tileType: modelClassNamespace.TileItem.BinTileType.PARENTHESIS,
                tilevalue: coefficient,
            };
            data.numOfTiles = this.equationManager.marqueeSelectedItems.length;
            data.index = firstTile.parent.getIndex(firstTile);
            data.isDestDeno = firstTile.model.get('bDenominator');
            data.isDropOnMarquee = true;
            this.equationManager.onAddTile(data, true);
            this.equationManager.buildModeSetFocusOnTooltip();
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

        invertExponentText: function invertExponentText (bOriginal) {
            var exponentsToInvertDOM = this.equationManager.marqueeExponents,
                marqueeSelectedItems = this.equationManager.marqueeSelectedItems,
                index, exponentConatiner;

            for(index=0; index<exponentsToInvertDOM.length; index++) {
                exponentConatiner = exponentsToInvertDOM[index];
                if(exponentConatiner) {
                    if(marqueeSelectedItems[index] && marqueeSelectedItems[index].model.get('exponent') !== 0) {
                        if (bOriginal) {
                            exponentConatiner.html(marqueeSelectedItems[index].getValueText('exponent'));
                        }
                        else {
                            exponentConatiner.html(marqueeSelectedItems[index].invertText(exponentConatiner.text()));
                        }
                    }
                }
            }
        },

        /**
        * Update the context menu rows based on various params such as mode, current focused tile etc.
        * @method updateCtxMenuRows
        */
        updateCtxMenuRows: function () {
            var equationManager = this.equationManager,
                MODE = modelClassNamespace.EquationManager.MODES,
                mode = equationManager.model.get('mode'),
                isParenthesesAllowed = equationManager.model.get('isParenthesesAllowed'),
                isDenominator = null,
                CTX_ITEM_ID = viewClassNamespace.Marquee.CTX_ITEM_ID,
                self = this,
                rows = [];

            if (equationManager.marqueeSelectedItems.length === 0) {
                return;
            }
            isDenominator = equationManager.marqueeSelectedItems[0].model.get('bDenominator');

            // ignore all elems
            rows = _.map(CTX_ITEM_ID, function (value, key, obj) {
                return self.idPrefix + value;
            });
            this.ctxMenu.editContextMenu(rows, true);    // passing true ignores elements
            rows = [];

            if (mode === MODE.BuildMode) {
                if (!equationManager.allEmptyInMarquee()) {
                    rows.push(CTX_ITEM_ID.DELETE_TILE);
                }
                if (isParenthesesAllowed) {
                    if (this.equationManager.isPosParensEnabled) {
                        rows.push(CTX_ITEM_ID.ADD_POS_PARENS);
                    }
                    if (this.equationManager.isNegParensEnabled) {
                        rows.push(CTX_ITEM_ID.ADD_NEG_PARENS);
                    }
                }
            } else {
                if (!equationManager.isNumeratorEmpty() &&
                    (!isDenominator && this.tilesAvailableForCombine() || isDenominator)) {
                    rows.push(CTX_ITEM_ID.COMBINE_NUM);
                }
                if (!equationManager.isDenominatorEmpty() &&
                    (isDenominator && this.tilesAvailableForCombine() || !isDenominator)) {
                    rows.push(CTX_ITEM_ID.COMBINE_DEN);
                }
                if (this.toShowMoveAcrossVinculum()) {
                    rows.push(CTX_ITEM_ID.REPOS_ACROSS_VINCULUM);
                }
            }

            // show allowed rows
            rows = _.map(rows, function (value, list) {
                return self.idPrefix + value;
            });
            this.ctxMenu.editContextMenu(rows, false);
        },

        /**
        * Returns a boolean whether there are tiles available for the marquee for combining.
        * @method tilesAvailableForCombine
        * @param {Boolean} True if both numerator & denominator tiles to check. If False, only those
                           with isDenominator same as marqueeSelectedItems are checked.
        * @return {Boolean} True if tiles are available for combination. False otherwise.
        */
        tilesAvailableForCombine: function (numAndDenTiles) {
            var em = this.equationManager,
                isDenominator = em.marqueeSelectedItems[0].model.get('bDenominator');
            if (numAndDenTiles) {
                return _.difference(_.uniq(em.getAllBaseViews()), _.uniq(em.getAllMarqueeViews())).length !== 0;
            }
            return _.difference(_.uniq(em.getAllBaseViews(isDenominator)),_.uniq( em.getAllMarqueeViews())).length !== 0;
        },

        /**
        * Returns a boolean representing whether the option for REPOS_ACROSS_VINCULUM should be shown.
        * @method toShowMoveAcrossVinculum
        * @return {Boolean} True if Repositin across vinculum option is to be shown in ctx menu. False otherwise.
        */
        toShowMoveAcrossVinculum: function () {
            var TYPE = modelClassNamespace.TileItem.BinTileType,
                equation = this.equationManager.equationView.model,
                firstTileType = equation.at(0).get('type');
            return firstTileType === TYPE.FRACTION || firstTileType === TYPE.BIG_PARENTHESIS;
        },

        /**
        * Update the context menu rows based on various params in tutorial such as mode, sourceData, destData etc.
        * @method updateCtxMenuRowsTut
        */
        updateCtxMenuRowsTut: function () {
            var equationManager = this.equationManager,
                MODE = modelClassNamespace.EquationManager.MODES,
                mode = equationManager.model.get('mode'),
                CTX_ITEM_ID = viewClassNamespace.Marquee.CTX_ITEM_ID,
                accTutSourceData = equationManager.accTutSourceData,
                accTutDestData = equationManager.accTutDestData,
                destView = null,
                destType = null,
                sourceView = null,
                sourceType = null,
                TYPE = modelClassNamespace.TileItem.BinTileType,
                TUT_OP = MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE,
                self = this,
                rows = [];

            if (!_.isEmpty(accTutDestData)) {
                destView = accTutDestData.sourceView;
                destType = destView.model.get('type');
            }

            if (!_.isEmpty(accTutSourceData)) {
                sourceView = accTutSourceData.sourceView;
                sourceType = sourceView.model.get('type');
            }

            // ignore all elems
            rows = _.map(CTX_ITEM_ID, function (value, key, obj) {
                return self.idPrefix + value;
            });
            this.ctxMenu.editContextMenu(rows, true);    // passing true ignores elements
            rows = [];

            if (mode === MODE.BuildMode && destType === TYPE.MARQUEE && accTutSourceData.operation === TUT_OP._promptUserToDrag) {
                // TODO: refine condition
                rows.push(CTX_ITEM_ID.ADD_NEG_PARENS);
            } else if (mode === MODE.SolveMode && destType === TYPE.BASE_EXPONENT &&
                       accTutSourceData.operation === TUT_OP._promptUserToDrag && sourceType === TYPE.MARQUEE &&
                       !destView.model.get('bDenominator')) {
                rows.push(CTX_ITEM_ID.COMBINE_NUM);
            }

            // show allowed rows
            rows = _.map(rows, function (value, list) {
                return self.idPrefix + value;
            });
            this.ctxMenu.editContextMenu(rows, false);
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
                case KEY.ESCAPE:
                    if (equationManager._tutorialMode) {
                        this.handleEscMarqueeTutorial();
                        break;
                    }
                case KEY.TAB:
                    if (equationManager._tutorialMode) {
                        this.handleTabMarqueeTutorial();
                        break;
                    }
                    this.equationManager.removeMarqueeAcc(true);
                    break;
                case KEY.SPACE:
                    this._handleSpaceMarqueeAcc(event);
                    break;
            }
        },

        /**
        * Handler for space keydown on marquee div
        * @method _handleSpaceMarqueeAcc
        * @private
        * @param {Object} Event object
        */
        _handleSpaceMarqueeAcc: function (event) {
            if (this.isFirstSpacePress(event)) {
                this.equationManager._tutorialMode ?this.startFirstSpaceOpTut(event) : this.startFirstSpaceOp(event);
            }
        },

        /**
        * Checks whether this keypress is the first space press.
        * @method isFirstSpacePress
        * @param {Object} Event object.
        * @return {Boolean} True, if this keypress is the first space press. False otherwise.
        */
        isFirstSpacePress: function (event) {
            var KEY = viewClassNamespace.EquationManager.KEY,
                equationManager = this.equationManager;
            return event.which === KEY.SPACE && !equationManager.isMarqueeSelectedForOp && equationManager.marqueeSelectedItems.length > 0;
        },

        /**
        * Performs the operations to be performed when the first space is pressed on marquee.
        * @method startFirstSpaceOp
        */
        startFirstSpaceOp: function () {
            var adjTile = null,
                equationManager = this.equationManager,
                MODE = modelClassNamespace.EquationManager.MODES,
                mode = equationManager.model.get('mode'),
                marqueeSelectedItems = equationManager.marqueeSelectedItems;

            if (mode === MODE.BuildMode || !this.tilesAvailableForCombine(true)) {
                return;
            }

            equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.TILE_DRAGGING_START);
            equationManager.isMarqueeSelectedForOp = true;
            equationManager.tileSelected = true;
            equationManager.tutorialCustomTileString = "";
            marqueeSelectedItems[0].continueAcc();
        },

        /**
        * Performs the operations to be performed when the first space is pressed on marquee in tutorial mode.
        * The operation depends mainly on source data, dest data, mode etc.
        * @method startFirstSpaceOp
        */
        startFirstSpaceOpTut: function () {
            var equationManager = this.equationManager,
                MODE = modelClassNamespace.EquationManager.MODES,
                mode = equationManager.model.get('mode'),
                accTutSourceData = equationManager.accTutSourceData,
                accTutDestData = equationManager.accTutDestData,
                destView = null,
                destType = null,
                sourceView = null,
                sourceType = null;

            if (mode === MODE.BuildMode) {
                return;
            }

            if (equationManager._isInvalidMarqueeForTutorial()) {
                return;
            }

            if (!_.isEmpty(accTutDestData)) {
                destView = accTutDestData.sourceView;
                destType = destView.model.get('type');
            }

            if (!_.isEmpty(accTutSourceData)) {
                sourceView = accTutSourceData.sourceView;
                sourceType = sourceView.model.get('type');
            }

            equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.TILE_DRAGGING_START);
            equationManager.isMarqueeSelectedForOp = true;
            equationManager.tileSelected = true;
            equationManager.tutorialCustomTileString = "";
            destView.startAcc(true);
            this.$marqueeDiv.trigger('dragstart');
        },

        /**
        * Handle condition when Tab is pressed in tutorial mode on a marquee.
        * @method handleTabMarqueeTutorial
        */
        handleTabMarqueeTutorial: function () {
            var equationManager = this.equationManager,
                MODE = modelClassNamespace.EquationManager.MODES,
                mode = equationManager.model.get('mode');
            if (mode === MODE.BuildMode) {
                this.setFocus('tutorial-replay-btn');
            } else {
                this.setFocus('tutorial-solve-mode-replay-btn');
            }
        },

        /**
        * Handle condition when Escape is pressed in tutorial mode on a marquee.
        * @method handleEscMarqueeTutorial
        */
        handleEscMarqueeTutorial: function () {
            var equationManager = this.equationManager,
                MODE = modelClassNamespace.EquationManager.MODES,
                mode = equationManager.model.get('mode');
            if (mode === MODE.BuildMode) {
                this.setFocus('tutorial-droppable-region');
            } else {
                this.setFocus('workspace-scrollable');
            }
            if (equationManager._isInvalidMarqueeForTutorial()) {
                equationManager.removeMarqueeAcc();
            }
        },

        /**
        * Handler called when ctx menu on marquee is hidden.
        * @method ctxMenuHideHandler
        */
        ctxMenuHideHandler: function () {
            this.$marqueeDiv.find('.selected-elements-cover').focus();
        },

        /**
        * Handler when an option in ctx menu is selected.
        * @method ctxMenuSelectHandler
        * @param {Object} Event object. See ctx menu api for more info.
        * @param {Object} UI Object. See ctx menu api for more info.
        * @return {Object} Copy of ...
        */
        ctxMenuSelectHandler: function (event, ui) {
            var currentTargetId = ui.currentTarget.id,
                ctxMenuId = parseInt(currentTargetId.substring(currentTargetId.lastIndexOf('-') + 1), 10);

            switch (ctxMenuId) {
                case 0:
                    this.deleteTilesAcc();
                    break;
                case 1:
                    this.addParenthesesAcc(-1);
                    break;
                case 2:
                    this.addParenthesesAcc(1);
                    break;
                case 4:
                    this.combineCtxAcc(false);
                    break;
                case 5:
                    this.combineCtxAcc(true);
                    break;
                case 6:
                    this.moveAcrossVinculumAcc();
                    this.equationManager.removeMarqueeAcc();
                    break;
            }


        },

        /**
        * Moves the marquee selected items across the vinculum.
        * @method moveAcrossVinculumAcc
        */
        moveAcrossVinculumAcc: function moveAccrossVinculum() {
            var equationManager = this.equationManager,
                marqueeSelectedItems = equationManager.marqueeSelectedItems,
                isDenominator = marqueeSelectedItems[0].model.get('bDenominator'),
                parent = marqueeSelectedItems[0].parent,
                TYPE = modelClassNamespace.TileItem.SolveTileType,
                data = {},
                numLength;

            if (parent.model.get('type') !== TYPE.FRACTION) {
                parent = parent.parent;
            }

            numLength = parent.getNumeratorLength(parent.arrTileViews);

            if (isDenominator) {
                data.index = parent.getIndex(parent.arrTileViews[numLength - 1]);
            }
            else {
                data.index = parent.getIndex(parent.arrTileViews[parent.arrTileViews.length - 1]);
            }

            data.sourceTile = marqueeSelectedItems[0];
            data.isDestDeno = !isDenominator;
            data.isLeft = false;
            data.numOfTiles = marqueeSelectedItems.length;
            data.strOperator = '*';

            equationManager.onRepositionTile(data);
            equationManager.solveModeSetFocusOnTooltip();
        },

        /**
        * Handler called when ctx menu Combine option is selected
        * @method combineCtxAcc
        * @param {Boolean} Location representing bDenominator
        */
        combineCtxAcc: function (location) {
            var equationManager = this.equationManager,
                MODE = modelClassNamespace.EquationManager.MODES,
                mode = equationManager.model.get('mode'),
                marqueeSelectedItems = equationManager.marqueeSelectedItems;

            equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.TILE_DRAGGING_START);
            equationManager.isMarqueeSelectedForOp = true;
            equationManager.tileSelected = true;
            equationManager.tutorialCustomTileString = "";
            equationManager.accCombineOnFraction(location);
            // Trigger dragstart to start the animation on dest view in marquee.
            this.$marqueeDiv.trigger('dragstart');
        },

        /**
        * Focus the marquee cover in acc
        * @method focusAcc
        */
        focusAcc: function () {
            var cover = this.$marqueeDiv.find('.selected-elements-cover');
            if (cover.length > 0) {
                cover.focus();
            }
        },

        /**
        * Handler when focusin evt of marquee is called.
        * Mainly responsible for creating focus rect on the marquee.
        *
        * @method marqueeFocusin
        * @param {Object} Event obj
        */
        marqueeFocusin: function (event) {
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                return;
            }
            if (this.focusRect) {
                this.focusRect.remove();
            }
            if (this._isAcc) {
                this.focusRect = $('<div class="marquee-focus-rect"></div>').appendTo(this.$marqueeDiv);

                var $marqueeDiv = this.$marqueeDiv,
                    focusRect = this.focusRect,
                    SPACE = 4;

                focusRect.css({
                    width: $marqueeDiv.width() + SPACE,
                    height: $marqueeDiv.height() + SPACE,
                    outline: 'rgb(170, 170, 170) dotted 2px'
                });

                focusRect.position({
                    my: 'center',
                    at: 'center',
                    of: $marqueeDiv
                });
                this.setMarqueeText();
            }
        },

        /**
        * Handler when focusout evt of marquee is called.
        * Responsible for removing the focus div.
        *
        * @method marqueeFocusout
        * @param {Object} Event object
        */
        marqueeFocusout: function (event) {
            if (this.focusRect) {
                this.focusRect.remove();
            }
        },

        /**
        * Set acc text for complete marquee selection
        * @method setMarqueeText
        */
        setMarqueeText: function () {
            var em = this.equationManager,
                tiles = em.marqueeSelectedItems,
                cover = this.$marqueeDiv.find('.selected-elements-cover'),
                i = 0,
                str = '';
            if (cover.length > 0) {
                for (i = 0; i < tiles.length; i++) {
                    str += tiles[i].getSelfAccString();
                    if (i !== tiles.length - 1) {
                        // don't append 'into' for last loop
                        str += ' ' + this.getMessage('base-exp-pair', 2) + ' ';
                    }
                }
                cover.text(str);
            }
        },

    }, {

        /**
        * Instantiates marquee model and view
        * @method createMarquee
        * @param {Object} [options]
        */
        createMarquee: function (options) {
            if (options) {
                var marquee = new MathInteractives.Common.Components.Models.EquationManager.Marquee(options),
                    marqueeView = new MathInteractives.Common.Components.Views.EquationManager.Marquee({ model: marquee, el: options.player.$el, equationManager: options.equationManager });
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

})();
