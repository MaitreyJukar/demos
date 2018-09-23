
(function (MathUtilities) {

    // TouchSimulator exposes the enableTouch and disableTouch methods
    var TouchSimulator = null,
        // Enum for the specific instructions.
        // It indicates which mouse events should be dispatched by the TouchManager.
        SPECIFIC_EVENTS = {
            "MOUSEENTER": 1,
            "MOUSEOVER": 2,
            "HOVER": 3,
            "DEFAULT": 3,
            "MOUSEMOVE": 4,
            "DRAGGABLE": 7,
            "RIGHT_CLICK": 8,
            "POINTER_EVENTS": 16,
            "ALL": 31
        },

        // Enum for the timeout values.
        TIME_OUT_VALUES = {
            "RIGHT_CLICK": 650,
            "CANCEL_TAP": 600,
            "TAP_AND_HOLD": 600
        },

        // The event namespace for the touch events.
        SIMULATION_EVENT_NAMESPACE = 'simulateTouch',
        userAgent = navigator.userAgent.toLowerCase(),
        isIE = userAgent.indexOf('msie') > -1,
        isIE11 = userAgent.indexOf('trident') > -1;

    /**
     * A touch manager that holds the necessary information for TouchSimulator.
     * @class TouchManager
     * @static
     * @extends Backbone.Model
     */
    TouchManager = Backbone.Model.extend({}, {
        /**
        * Tap and hold tracker for hover effects.
        *
        * @attribute tapAndHold
        * @default true
        * @type Boolean
        */
        "tapAndHold": false,
        /**
        * The timeout reference.
        *
        * @attribute tapAndHoldTimeout
        * @default null
        */
        "tapAndHoldTimeout": null,
        /**
        * Holds last tapped element (so we can compare for double tap).
        *
        * @attribute lastTap
        * @default null
        * @type Object
        */
        "lastTap": null,
        /**
        * Are we still in the .6 second window where a double tap can occur.
        *
        * @attribute tapValid
        * @default false
        * @type Boolean
        */
        "tapValid": false,
        /**
        * The timeout reference.
        *
        * @attribute tapTimeout
        * @default null
        */
        "tapTimeout": null,
        /**
        * Is a right click still feasible.
        *
        * @attribute rightClickPending
        * @default false
        * @type Boolean
        */
        "rightClickPending": false,
        /**
        * The original event.
        *
        * @attribute rightClickEvent
        * @default null
        * @type Object
        */
        "rightClickEvent": null,
        /**
        * The timeout reference.
        *
        * @attribute holdTimeout
        * @default null
        */
        "holdTimeout": null,
        /**
        * Prevents a click from occurring as we want the context menu.
        *
        * @attribute cancelMouseUp
        * @default false
        * @type Boolean
        */
        "cancelMouseUp": false,
        /**
        * Will contain the clientX and clientY where the last mousemove was dispatched.
        *
        * @attribute lastMoveCoordinates
        * @type Object
        */
        "lastMoveCoordinates": {},

        /**
         * Cancels the possibility of a tap and hold.
         * @method cancelTapAndHold
         * @public
         */
        "cancelTapAndHold": function cancelTapAndHold() {
            TouchManager.tapAndHold = false;
            if (TouchManager.tapAndHoldTimeout) {
                window.clearTimeout(TouchManager.tapAndHoldTimeout);
            }
        },

        /**
         * Cancels the possibility of a doubleclick.
         * @method cancelTap
         * @public
         */
        "cancelTap": function cancelTap() {
            TouchManager.tapValid = false;
        },

        /**
         * Releases the hover effects by dispatching mouseleave and mouseout events.
         * @method startHold
         * @public
         * @param {Object} first The first touch in the touch list.
         * @param {Number} specificEvents The value which indicates the emulated methods.
         * @param [Boolean] fireMouseUp A flag indicating if we need to dispatch a mouseup or not.
         */
        "releaseHover": function releaseHover(first, specificEvents, fireMouseUp) {
            var detail = 1, // Single click
                button = 0; // Left

            if ((specificEvents & SPECIFIC_EVENTS.MOUSEOVER) === SPECIFIC_EVENTS.MOUSEOVER) {
                //Dispatch a mouseout
                TouchManager.dispatcher(first.target, 'mouseout', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                    false, false, false, false, button, null);
            }
            if ((specificEvents & SPECIFIC_EVENTS.MOUSEENTER) === SPECIFIC_EVENTS.MOUSEENTER) {
                //Dispatch a mouseleave
                TouchManager.dispatcher(first.target, 'mouseleave', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                    false, false, false, false, button, null);
            }

            //Sometimes we might want to undo the down states.
            if (fireMouseUp) {
                //Dispatch a mouseup.
                TouchManager.dispatcher(first.target, 'mouseup', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                    false, false, false, false, button, null);
            }

            TouchManager.cancelTapAndHold();
        },


        /**
         * Cancels the timer for context menu(long press).
         * @method cancelHold
         * @public
         */
        "cancelHold": function cancelHold() {
            if (TouchManager.rightClickPending) {
                window.clearTimeout(TouchManager.holdTimeout);
                TouchManager.rightClickPending = false;
                TouchManager.rightClickEvent = null;
            }
        },

        /**
         * Starts the timer to wait for a context menu(long press).
         * @method startHold
         * @public
         * @param {Object} event The event object provided by the browser.
         */
        startHold: function startHold(event) {
            if (TouchManager.rightClickPending) {
                return;
            }
            // We could be performing a right click.
            TouchManager.rightClickPending = true;
            TouchManager.rightClickEvent = event.changedTouches[0];

            if ((event.data.specificEvents & SPECIFIC_EVENTS.RIGHT_CLICK) === SPECIFIC_EVENTS.RIGHT_CLICK) {
                TouchManager.holdTimeout = window.setTimeout(TouchManager.doRightClick, TIME_OUT_VALUES.RIGHT_CLICK);
            }
        },

        /**
         * Performs the right click action.
         * @method doRightClick
         * @public
         */
        "doRightClick": function doRightClick() {
            TouchManager.rightClickPending = false;

            var first = TouchManager.rightClickEvent,
                lButton = 0,
                rButton = 2,
                detail = 1; // Single click

            // Dispatch mouseup with L-button.
            TouchManager.dispatcher(first.target, 'mouseup', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                false, false, false, false, lButton, null);

            // Emulate a right click.
            // Dispatch mousedown with R-button.
            TouchManager.dispatcher(first.target, 'mousedown', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                false, false, false, false, rButton, null);

            // Dispatch show a context menu.
            TouchManager.dispatcher(first.target, 'contextmenu', true, true, window, detail, first.screenX + 50, first.screenY + 5, first.clientX + 50, first.clientY + 5,
                false, false, false, false, rButton, null);

            TouchManager.cancelMouseUp = true;
            TouchManager.rightClickEvent = null;
        },


        /**
         * Initiates the long press timeout.
         * @method initiateLongPress
         * @public
         * @param {Object} target The target element that has been tapped.
         * @param {Object} event The event object provided by the browser.
         */
        "initiateLongPress": function initiateLongPress(target, event) {
            // Update the lastTap to the current element to check for dblclick.
            TouchManager.lastTap = target;
            TouchManager.tapValid = true;
            TouchManager.tapTimeout = window.setTimeout(TouchManager.cancelTap, TIME_OUT_VALUES.CANCEL_TAP);
            TouchManager.startHold(event);
        },

        /**
         * Handles the touch start event.
         * @method touchStartHandler
         * @public
         * @param {Object} event The event object provided by the browser.
         */
        "touchStartHandler": function touchStartHandler(event) {
            var touches = event.changedTouches,
                first = touches[0],
                detail = 1, // Single click
                dblClickDetail = 2, // Double click
                button = 0, // Left button
                specificEvents = event.data.specificEvents;

            // Dispatch a mousedown.
            TouchManager.dispatcher(first.target, 'mousedown', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                false, false, false, false, button, null);

            if ((specificEvents & SPECIFIC_EVENTS.HOVER) === SPECIFIC_EVENTS.HOVER) {
                TouchManager.tapAndHold = true;
                TouchManager.tapAndHoldTimeout = window.setTimeout(function tapAndHoldHandler() {

                    if ((specificEvents & SPECIFIC_EVENTS.MOUSEENTER) === SPECIFIC_EVENTS.MOUSEENTER) {
                        // Dispatch a mouseenter
                        TouchManager.dispatcher(first.target, 'mouseenter', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                            false, false, false, false, button, null);
                    }

                    if ((specificEvents & SPECIFIC_EVENTS.MOUSEOVER) === SPECIFIC_EVENTS.MOUSEOVER) {
                        // Dispatch a mouseover.
                        TouchManager.dispatcher(first.target, 'mouseover', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                            false, false, false, false, button, null);
                    }

                    TouchManager.tapAndHold = false;
                    TouchManager.tapAndHoldTimeout = null;

                }, TIME_OUT_VALUES.TAP_AND_HOLD);
            }

            // Handles double click and long press.
            if (!TouchManager.tapValid) {
                TouchManager.initiateLongPress(first.target, event);
            } else {
                window.clearTimeout(TouchManager.tapTimeout);
                // If a double tap is still a possibility and the elements are the same
                // then perform a double click.
                if (first.target === TouchManager.lastTap) {
                    TouchManager.lastTap = null;
                    TouchManager.tapValid = false;
                    //Dispatch a click.
                    TouchManager.dispatcher(first.target, 'click', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                        false, false, false, false, button, null);

                    //Dispatch a dblclick.
                    TouchManager.dispatcher(first.target, 'dblclick', true, true, window, dblClickDetail, first.screenX, first.screenY, first.clientX, first.clientY,
                        false, false, false, false, button, null);
                } else {
                    TouchManager.initiateLongPress(first.target, event);
                }
            }
        },

        /**
         * Handles the touch events of the Touch Events API
         * @method touchHandler
         * @public
         * @param {Object} event The event object provided by the browser.
         */
        "touchHandler": function (event) {
            if (event.originalEvent.touches.length > 1) {
                return;
            }

            var type = null,
                data = event.data,
                fireMouseUp = true,
                originalEvent = event.originalEvent,
                touches = originalEvent.changedTouches,
                first = touches[0],
                detail = 1, //Single click
                specificEvents = event.data.specificEvents,
                button = 0; // Left button

            originalEvent.data = data;

            // Switches to dispatch necessary mouse events.
            switch (originalEvent.type) {
                case 'touchstart':
                    if ($(originalEvent.changedTouches[0].target).is('select')) {
                        return;
                    }
                    TouchManager.touchStartHandler(originalEvent);
                    originalEvent.preventDefault();
                    return false;
                case 'touchmove':
                    if ((originalEvent.data.specificEvents & SPECIFIC_EVENTS.RIGHT_CLICK) !== SPECIFIC_EVENTS.RIGHT_CLICK) {
                        TouchManager.cancelHold();
                    }
                    type = 'mousemove';
                    originalEvent.preventDefault();
                    break;
                case 'touchend':
                    if (TouchManager.cancelMouseUp) {
                        TouchManager.cancelMouseUp = false;
                        TouchManager.cancelTapAndHold();
                        TouchManager.releaseHover(originalEvent.changedTouches[0], originalEvent.data.specificEvents, fireMouseUp);
                        originalEvent.preventDefault();
                        return false;
                    }
                    TouchManager.cancelHold();
                    TouchManager.cancelTapAndHold();
                    type = 'mouseup';
                    break;
                default:
                    return;
            }

            if (type === 'mousemove') {
                if ((specificEvents & SPECIFIC_EVENTS.MOUSEMOVE) === SPECIFIC_EVENTS.MOUSEMOVE && (TouchManager.lastMoveCoordinates && (TouchManager.lastMoveCoordinates.x !== first.clientX || TouchManager.lastMoveCoordinates.y !== first.clientY))) {
                    // Update coords
                    TouchManager.lastMoveCoordinates = {
                        "x": first.clientX,
                        "y": first.clientY
                    };
                    TouchManager.dispatcher(first.target, type, true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                        false, false, false, false, button, null);
                }
            } else {
                TouchManager.dispatcher(first.target, type, true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                    false, false, false, false, button, null);
            }

            // If its a mouse up and was instructed to simulate hover events, release them here.
            if (type === 'mouseup' && (specificEvents & SPECIFIC_EVENTS.HOVER) === SPECIFIC_EVENTS.HOVER) {
                TouchManager.releaseHover(first, specificEvents);
            }

            // This actually emulates the ipads default behavior (which we prevented).This check avoids click being emulated on a double tap.
            if (type === 'mouseup' && TouchManager.tapValid && first.target === TouchManager.lastTap) {
                TouchManager.dispatcher(first.target, 'click', true, true, window, detail, first.screenX, first.screenY, first.clientX, first.clientY,
                    false, false, false, false, button, null);
            }
        },

        /**
         * Handles the pointer events available in IE.
         * @method pointerHandler
         * @public
         * @param {Object} event The event object provided by the browser.
         */
        "pointerHandler": function (event) {
            var type = event.type === 'pointerdown' || event.type === 'MSPointerDown' ? 'mousedown' : 'mouseup',
                originalEvent = event.originalEvent,
                first = originalEvent.target,
                detail = 1, //Single click
                button = 0; // Left button

            // Dispatch only if the original event is a touch event.
            if (originalEvent.pointerType === "touch" || originalEvent.pointerType === originalEvent.MSPOINTER_TYPE_TOUCH) {
                TouchManager.dispatcher(first, type, true, true, window, detail, originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY,
                    false, false, false, false, button, null);
            }
        },


        /**
         * Dispatches mouse events with given properties.
         * @method dispatcher
         * @public
         * @param {Object} target DOM Element on which the event needs to be dispatched.
         * @param {String} type The type of event, for eg. mousedown, mouseup etc.
         * @param {Boolean} canBubble Whether or not the event can bubble.
         * @param {Boolean} cancelable Whether or not the event's default action can be prevented..
         * @param {Object} view The event's AbstractView.
         * @param {Number} detail The event's mouse click count.
         * @param {Number} screenX The event's screen x coordinate.
         * @param {Number} screenY The event's screen y coordinate.
         * @param {Number} clientX The event's client x coordinate.
         * @param {Number} clientY The event's client y coordinate.
         * @param {Boolean} ctrlKey Whether or not control key was depressed during the Event.
         * @param {Boolean} altKey Whether or not alt key was depressed during the Event.
         * @param {Boolean} shiftKey Whether or not shift key was depressed during the Event.
         * @param {Boolean} metaKey Whether or not meta key was depressed during the Event.
         * @param {Number} button The event's mouse button.
         * @param {Object} relatedTarget The event's related EventTarget.
         */
        "dispatcher": function (target, type, canBubble, cancelable, view, detail, screenX, screenY,
            clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {

            var simulatedEvent = document.createEvent('MouseEvent');

            simulatedEvent.initMouseEvent(type, canBubble, cancelable, view, detail, screenX,
                screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);

            simulatedEvent.data = {};
            simulatedEvent.data.simulatedEvent = true;
            target.dispatchEvent(simulatedEvent);
        },

        /**
         * Binds the pointer events to the element
         * @method bindPointerEvents
         * @public
         * @param {Object} $obj jQuery object of the element.
         * @param {Object} instructions The processing instructions.
         */
        "bindPointerEvents": function bindPointerEvents($obj, instructions) {
            var data = $obj.data();

            // Check if the events are already being simulated
            if (data.hasSimulation) {
                return false;
            }

            var pointerDown = null,
                pointerUp = null;

            TouchSimulator.disableTouch($obj);

            //Check for unprefixed events
            if (navigator.pointerEnabled) {
                pointerDown = 'pointerdown';
                pointerUp = 'pointerup';
            } else {
                pointerDown = 'MSPointerDown';
                pointerUp = 'MSPointerUp';
            }
            $obj.on(pointerDown + '.' + SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.pointerHandler)
                .on(pointerUp + '.' + SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.pointerHandler);

            data.hasSimulation = true;
            data.simulationInstructions = $.extend(true, {}, instructions);
        },

        /**
         * Binds the touch events to the element
         * @method bindTouchEvents
         * @public
         * @param {Object} $obj jQuery object of the element.
         * @param {Object} instructions The processing instructions.
         */
        "bindTouchEvents": function bindTouchEvents($obj, instructions) {
            var data = $obj.data(),
                hasSimulation = data.hasSimulation,
                simulationInstructions = data.simulationInstructions;

            // Check if the events are already being simulated
            if (hasSimulation && simulationInstructions && simulationInstructions.specificEvents === instructions.specificEvents) {
                return false;
            }
            if (hasSimulation && simulationInstructions) {
                instructions.specificEvents = simulationInstructions.specificEvents | instructions.specificEvents;
                TouchSimulator.disableTouch($obj);
            }

            $obj.on('touchstart.' + SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.touchHandler)
                .on('touchmove.' + SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.touchHandler)
                .on('touchend.' + SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.touchHandler)
                .on('touchcancel.' + SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.touchHandler);

            data.hasSimulation = true;
            data.simulationInstructions = $.extend(true, {}, instructions);
        }

    });

    /**
     * A touch simulator that dispatches mouse events for touch interaction.
     * @class TouchSimulator
     * @static
     * @extends Backbone.Model
     */
    TouchSimulator = Backbone.Model.extend({}, {
        /**
         * Enables the simulation of touch events on the given element.
         * @method enableTouch
         * @public
         * @param {String||Array} className jQuery selector or list.
         * @param {Object} [instructions={}] Instructions related to dispatching events, if enable right click etc.
         * @param {Number} [instructions.specificEvents=TouchSimulatorSPECIFIC_EVENTS.DEFAULT] Specifies which events it simulates specifically.
         * For eg. If we need only mouseenter, we set the value to 1
         * For eg. If we need mouseover + mousemove, we set the value to 6 (2+4).
         * For eg. If we need mouseenter + mouseover  +right-click, we set the value to 11 (1+2+8).
         * Note that mouseenter implies mouseleave and mouseover implies mouseout
         */
        "enableTouch": function enableTouch(className, instructions) {
            if ($.type(instructions) !== 'object') {
                instructions = {};
            } else {
                instructions = $.extend(true, {}, instructions);
            }

            if ($.type(instructions.specificEvents) !== 'number') {
                instructions.specificEvents = SPECIFIC_EVENTS.DEFAULT;
            }

            // Avoid looping if the element is document.
            if (className === document) {
                if ((isIE || isIE11) &&
                    (instructions.specificEvents & SPECIFIC_EVENTS.POINTER_EVENTS) === SPECIFIC_EVENTS.POINTER_EVENTS) {
                    TouchManager.bindPointerEvents($(document), instructions);
                } else {
                    TouchManager.bindTouchEvents($(document), instructions);
                }
            } else {
                if ((isIE || isIE11) &&
                    (instructions.specificEvents & SPECIFIC_EVENTS.POINTER_EVENTS) === SPECIFIC_EVENTS.POINTER_EVENTS) {
                    $(className).each(function attachPointerEvents() {
                        TouchManager.bindPointerEvents($(this), instructions);
                    });
                } else {
                    $(className).each(function attachTouchEvents() {
                        TouchManager.bindTouchEvents($(this), instructions);
                    });
                }
            }
        },

        /**
         * Disables the simulation of touch events on the given element.
         * @method disableTouch
         * @public
         * @param {String||Array} className jQuery selector or list.
         */
        "disableTouch": function disableTouch(className) {
            var data = null,
                $obj = null;
            if (className === document) {
                $obj = $(document);
                data = $obj.data();
                $obj.off('.' + SIMULATION_EVENT_NAMESPACE);
                data.hasSimulation = false;
                data.simulationInstructions = null;
            } else {
                $(className).each(function () {
                    $obj = $(this);
                    data = $obj.data();
                    $obj.off('.' + SIMULATION_EVENT_NAMESPACE);
                    data.hasSimulation = false;
                    data.simulationInstructions = null;
                });
            }
        },


        /**
        * An enum for specific event dispatching
        *
        * @attribute SPECIFIC_EVENTS
        * @type Object
        * @default {
            "MOUSEENTER": 1,
            "MOUSEOVER": 2,
            "HOVER": 3,
            "DEFAULT": 3,
            "MOUSEMOVE": 4,
            "DRAGGABLE": 7,
            "RIGHT_CLICK": 8,
            "POINTER_EVENTS": 16,
            "ALL": 31
        }
        */
        "SPECIFIC_EVENTS": SPECIFIC_EVENTS

    });

})(window.MathUtilities);