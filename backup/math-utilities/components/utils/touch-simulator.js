/* globals MathUtilities, window, navigator, $  */


(function(MathUtilities) {
    'use strict';
    MathUtilities.Components.Utils = MathUtilities.Components.Utils || {};

    // TouchSimulator exposes the enableTouch and disableTouch methods
    var TouchSimulator = null,
        /**
         * A touch manager that holds the necessary information for TouchSimulator.
         * @class TouchManager
         * @static
         */
        TouchManager = {
            /**
             * Enum for the specific instructions.
             *
             * @attribute SPECIFIC_EVENTS
             * @type Object
             */
            "SPECIFIC_EVENTS": {
                "TAP": 0,
                "MOUSEENTER": 1,
                "MOUSEOVER": 2,
                "HOVER": 3,
                "MOUSEMOVE": 4,
                "DRAGGABLE": 7,
                "RIGHT_CLICK": 8,
                "POINTER_EVENTS": 16,
                "PAPER_JS": 32,
                "MULTI_TOUCH": 64,
                "STOP_PROPAGATION": 128,
                "ALL": 127, // DEPRICATED
                "ALL_BUT_MULTI_TOUCH": 191
            },
            /**
             * Threshold in pixels for which we ignore the mousemove.
             *
             * @attribute MOVE_THRESHOLD
             * @default 15
             * @type Number
             */
            "MOVE_THRESHOLD": 15,
            /**
             * Enum for the timeout values.
             *
             * @attribute TIME_OUT_VALUES
             * @type Object
             */
            "TIME_OUT_VALUES": {
                "RIGHT_CLICK": 650,
                "CANCEL_TAP": 600,
                "TAP_AND_HOLD": 600
            },

            /**
             * Namespace for the touch events.
             *
             * @attribute SIMULATION_EVENT_NAMESPACE
             * @default simulateTouch
             * @type Object
             */
            "SIMULATION_EVENT_NAMESPACE": 'simulateTouch',

            /**
             * Tap and hold tracker for hover effects.
             *
             * @attribute tapAndHold
             * @default false
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
             * Flag for the context menu dispatching, lets us decide if we want to fire the click too.
             *
             * @attribute contextMenuDispatched
             * @default false
             * @type Boolean
             */
            "contextMenuDispatched": false,
            /**
             * Prevents a mouse up after double click.
             *
             * @attribute cancelMouseup
             * @default false
             * @type Boolean
             */
            "cancelMouseup": false,
            /**
             * Will contain the clientX and clientY where the last mousemove was dispatched.
             *
             * @attribute lastMoveCoordinates
             * @default null
             */
            "lastMoveCoordinates": null,

            /**
             * Will contain the first touch information.
             *
             * @attribute firstTouch
             * @type Object
             */
            "firstTouch": {},

            /**
             * Checks if the client supports pointer events.
             *
             * @method hasPointerSupport
             */
            "hasPointerSupport": function() {
                return !!(window.navigator.msPointerEnabled || window.navigator.pointerEnabled);
            },

            /**
             * Checks if the allowed threshold for mousemove has been crossed
             * @method hasCrossedThreshold
             * @param {Object} currentCoords The current coordinates of mousemove.
             * @public
             */
            "hasCrossedThreshold": function(currentCoords, threshold) {
                var firstTouchCoords = TouchManager.firstTouch.coordinates;

                if (firstTouchCoords) {
                    return Math.abs(currentCoords.x - firstTouchCoords.x) > threshold ||
                        Math.abs(currentCoords.y - firstTouchCoords.y) > threshold;
                }
                // In case we prevent touch start and get touch move
                TouchManager.firstTouch.coordinates = currentCoords;
                return false;
            },

            /**
             * Cancels the possibility of a tap and hold.
             * @method cancelTapAndHold
             * @public
             */
            "cancelTapAndHold": function() {
                if (TouchManager.tapAndHold) {
                    TouchManager.tapAndHold = false;
                    window.clearTimeout(TouchManager.tapAndHoldTimeout);
                }
            },

            /**
             * Cancels the possibility of a double-click.
             * @method cancelTap
             * @public
             */
            "cancelTap": function() {
                TouchManager.tapValid = false;
            },

            /**
             * Releases the hover effects by dispatching mouseleave and mouseout events.
             * @method releaseHover
             * @public
             * @param {Object} element The element on which we will fire mouseout and mouseleave.
             * @param {Object} event The original event triggered on the element.
             */
            "releaseHover": function(element, event) {
                var sglClickDetail = 1, // Single click
                    lButton = 0, // Left button
                    eventObj = null;

                if (TouchManager.tapAndHold) {
                    TouchManager.cancelTapAndHold();
                } else {
                    //Dispatch a mouseout
                    eventObj = TouchManager.createEventObj(element, {
                        "detail": sglClickDetail,
                        "button": lButton,
                        "type": 'mouseout',
                        "data": {
                            "touches": event.touches
                        }
                    });
                    TouchManager.dispatcher(eventObj);
                    //Dispatch a mouseleave
                    eventObj = TouchManager.createEventObj(element, {
                        "detail": sglClickDetail,
                        "button": lButton,
                        "type": 'mouseleave',
                        "data": {
                            "touches": event.touches
                        }
                    });
                    TouchManager.dispatcher(eventObj);
                }
            },

            /**
             * Applies the hover effects by dispatching mouseenter and mouseover events.
             * @method applyHover
             * @param {Object} element The element on which we will fire mouseenter and mouseover.
             * @param {Object} event The original event triggered on the element.
             * @public
             */
            "applyHover": function(element, event) {
                var sglClickDetail = 1, // Single click
                    lButton = 0, // Left button
                    eventObj = null;

                // Dispatch a mouseenter
                eventObj = TouchManager.createEventObj(element, {
                    "detail": sglClickDetail,
                    "button": lButton,
                    "type": 'mouseenter',
                    "data": {
                        "touches": event.touches
                    }
                });
                TouchManager.dispatcher(eventObj);

                // Dispatch a mouseover
                eventObj = TouchManager.createEventObj(element, {
                    "detail": sglClickDetail,
                    "button": lButton,
                    "type": 'mouseover',
                    "data": {
                        "touches": event.touches
                    }
                });
                TouchManager.dispatcher(eventObj);
                TouchManager.cancelTapAndHold();
            },


            /**
             * Cancels the timer for context menu(long press).
             * @method cancelHold
             * @public
             */
            "cancelHold": function() {
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
            "startHold": function(event) {
                if (TouchManager.rightClickPending) {
                    return;
                }
                // We could be performing a right click.
                TouchManager.rightClickPending = true;
                TouchManager.rightClickEvent = event.changedTouches[0];

                if (event.data.specificEvents & TouchManager.SPECIFIC_EVENTS.RIGHT_CLICK) {
                    // Add a setTimeout for long press.
                    TouchManager.holdTimeout = window.setTimeout(function() {
                        TouchManager.doRightClick(event);
                    }, TouchManager.TIME_OUT_VALUES.RIGHT_CLICK);
                }
            },

            /**
             * Performs the right click action.
             * @method doRightClick
             * @param {Object} event The original event triggered on the element.
             * @public
             */
            "doRightClick": function(event) {
                TouchManager.rightClickPending = false;

                var first = TouchManager.rightClickEvent,
                    eventObj = {},
                    lButton = 0,
                    rButton = 2,
                    sglClickDetail = 1; // Single click

                // Dispatch mouseup with L-button
                eventObj = TouchManager.createEventObj(first, {
                    "detail": sglClickDetail,
                    "button": lButton,
                    "type": 'mouseup',
                    "data": {
                        "touches": event.touches
                    }
                });
                TouchManager.dispatcher(eventObj);

                // Emulate a right click.
                // Dispatch mousedown with R-button.
                eventObj = TouchManager.createEventObj(first, {
                    "detail": sglClickDetail,
                    "button": rButton,
                    "type": 'mousedown',
                    "data": {
                        "touches": event.touches
                    }
                });
                TouchManager.dispatcher(eventObj);

                // Dispatch show a context menu.
                eventObj = TouchManager.createEventObj(first, {
                    "detail": sglClickDetail,
                    "button": rButton,
                    "type": 'contextmenu',
                    "data": {
                        "touches": event.touches
                    }
                });
                TouchManager.dispatcher(eventObj);
                TouchManager.contextMenuDispatched = true;
                TouchManager.rightClickEvent = null;
            },


            /**
             * Initiates the long press timeout.
             * @method initiateTap
             * @public
             * @param {Object} target The target element that has been tapped.
             * @param {Object} event The event object provided by the browser.
             */
            "initiateTap": function(target, event) {
                if (!(event.data.specificEvents & TouchManager.SPECIFIC_EVENTS.MULTI_TOUCH)) {
                    // Update the lastTap to the current element to check for double click.
                    TouchManager.lastTap = target;
                    TouchManager.tapValid = true;
                    TouchManager.cancelMouseup = false;
                    // Add a setTimeout to cancel the tap.
                    TouchManager.tapTimeout = window.setTimeout(TouchManager.cancelTap, TouchManager.TIME_OUT_VALUES.CANCEL_TAP);
                    TouchManager.startHold(event);
                }
            },

            /**
             * Handles the touch start event.
             * @method touchStartHandler
             * @public
             * @param {Object} event The event object provided by the browser.
             */
            "touchStartHandler": function(event) {
                var first = event.changedTouches[0],
                    eventObj,
                    sglClickDetail = 1, // Single click
                    dblClickDetail = 2, // Double click
                    lButton = 0; // Left button

                TouchManager.firstTouch.coordinates = {
                    "x": first.clientX,
                    "y": first.clientY
                };

                TouchManager.firstTouch.crossedThreshold = false;

                // Dispatch a mousedown.
                eventObj = TouchManager.createEventObj(first, {
                    "detail": sglClickDetail,
                    "button": lButton,
                    "type": 'mousedown',
                    "data": {
                        "touches": event.touches
                    }
                });
                TouchManager.dispatcher(eventObj);

                if (event.data.specificEvents & TouchManager.SPECIFIC_EVENTS.HOVER) {
                    TouchManager.tapAndHold = true;
                    // Add a setTimeout for tap and hold.
                    TouchManager.tapAndHoldTimeout = window.setTimeout(function() {
                        TouchManager.applyHover(first, event);
                    }, TouchManager.TIME_OUT_VALUES.TAP_AND_HOLD);
                }

                // Handles double click
                if (TouchManager.tapValid) {
                    window.clearTimeout(TouchManager.tapTimeout);
                    // If a double tap is still a possibility and the elements are the same
                    // then perform a double click.
                    if (first.target === TouchManager.lastTap) {
                        TouchManager.lastTap = null;
                        TouchManager.tapValid = false;
                        TouchManager.cancelMouseup = true;
                        // Dispatch a mouseup
                        eventObj = TouchManager.createEventObj(first, {
                            "detail": sglClickDetail,
                            "button": lButton,
                            "type": 'mouseup',
                            "data": {
                                "touches": event.touches
                            }
                        });
                        TouchManager.dispatcher(eventObj);
                        //Dispatch a click.
                        eventObj = TouchManager.createEventObj(first, {
                            "detail": sglClickDetail,
                            "button": lButton,
                            "type": 'click',
                            "data": {
                                "touches": event.touches
                            }
                        });
                        TouchManager.dispatcher(eventObj);
                        //Dispatch a dblclick.
                        eventObj = TouchManager.createEventObj(first, {
                            "detail": dblClickDetail,
                            "button": lButton,
                            "type": 'dblclick',
                            "data": {
                                "touches": event.touches
                            }
                        });
                        TouchManager.dispatcher(eventObj);
                    } else {
                        TouchManager.initiateTap(first.target, event);
                    }
                } else {
                    TouchManager.initiateTap(first.target, event);
                }
            },

            /**
             * Handles the touch events of the Touch Events API
             * @method touchHandler
             * @public
             * @param {Object} event The event object provided by the browser.
             */
            "touchHandler": function(event) {
                var type = null,
                    data = event.data,
                    hasCrossedThreshold = null,
                    originalEvent = event.originalEvent, // The original DOM mouseevent reference provided by jQuery.
                    first = originalEvent.changedTouches[0],
                    originalEventTouches = originalEvent.touches,
                    totalTouches = originalEventTouches.length, //multitouch
                    sglClickDetail = 1, //Single click
                    specificEvents = data.specificEvents,
                    moveThreshold = data.customMoveThreshold || TouchManager.MOVE_THRESHOLD,
                    eventObj = {},
                    lButton = 0, // Left button
                    rButton = 2; // Right button

                /* If original event has been simulated, then it won't be simulated when caught by parent after
                    propagation. */
                if ((data.specificEvents & TouchManager.SPECIFIC_EVENTS.STOP_PROPAGATION) &&
                    (originalEvent.data && originalEvent.data.isTouchSimulated)) {
                    return false;
                }

                originalEvent.data = data;
                data.isTouchSimulated = true;

                if (originalEvent.data.specificEvents & TouchManager.SPECIFIC_EVENTS.PAPER_JS) {
                    originalEvent.stopImmediatePropagation();
                }

                if (!(originalEvent.data.specificEvents & TouchManager.SPECIFIC_EVENTS.MULTI_TOUCH) && totalTouches > 1) {
                    return void 0;
                }

                // Switches to dispatch necessary mouse events.
                switch (originalEvent.type) {
                    case 'touchstart':
                        if ($(first.target).is('select')) {
                            return void 0;
                        }
                        TouchManager.touchStartHandler(originalEvent);
                        originalEvent.preventDefault();
                        return false;
                    case 'touchmove':
                        type = 'mousemove';
                        originalEvent.preventDefault();
                        break;
                    case 'touchcancel':
                    case 'touchend':
                        //Reset last move coordinates
                        TouchManager.lastMoveCoordinates = {};
                        if (TouchManager.contextMenuDispatched) {
                            TouchManager.contextMenuDispatched = false;
                            if (originalEvent.data.specificEvents & TouchManager.SPECIFIC_EVENTS.HOVER) {
                                TouchManager.releaseHover(first, originalEvent);
                            }
                            eventObj = TouchManager.createEventObj(first, {
                                "detail": sglClickDetail,
                                "button": rButton,
                                "type": 'mouseup',
                                "data": {
                                    "touches": originalEventTouches
                                }
                            });
                            TouchManager.dispatcher(eventObj);
                            originalEvent.preventDefault();
                            return false;
                        }
                        TouchManager.cancelHold();
                        type = 'mouseup';
                        break;
                    default:
                        return false;
                }

                if (type === 'mousemove') {
                    // Check if the threshold has been crossed before we dispatch a mousemove.
                    if (TouchManager.firstTouch.crossedThreshold) {
                        if (!TouchManager.contextMenuDispatched && (specificEvents & TouchManager.SPECIFIC_EVENTS.MOUSEMOVE) &&
                            (TouchManager.lastMoveCoordinates.x !== first.clientX || TouchManager.lastMoveCoordinates.y !== first.clientY)) {

                            // Update coords
                            TouchManager.lastMoveCoordinates = {
                                "x": first.clientX,
                                "y": first.clientY
                            };
                            eventObj = TouchManager.createEventObj(first, {
                                "detail": sglClickDetail,
                                "button": lButton,
                                "type": type,
                                "data": {
                                    "touches": originalEventTouches
                                }
                            });
                            TouchManager.dispatcher(eventObj);
                        }
                    } else {
                        hasCrossedThreshold = TouchManager.hasCrossedThreshold({
                            "x": first.clientX,
                            "y": first.clientY
                        }, moveThreshold);
                        if (hasCrossedThreshold) {
                            TouchManager.firstTouch.crossedThreshold = true;

                            // Clear the long press possibility
                            TouchManager.cancelHold();

                            // Clear the possibility of a click
                            TouchManager.cancelTap();
                            window.clearTimeout(TouchManager.tapTimeout);

                            // If threshold has been crossed, apply hover if the user has registered for one.
                            if (TouchManager.tapAndHold && specificEvents & TouchManager.SPECIFIC_EVENTS.HOVER) {
                                TouchManager.applyHover(first, originalEvent);
                            }
                            if (!TouchManager.contextMenuDispatched && specificEvents & TouchManager.SPECIFIC_EVENTS.MOUSEMOVE) {
                                TouchManager.lastMoveCoordinates = {
                                    "x": first.clientX,
                                    "y": first.clientY
                                };
                                eventObj = TouchManager.createEventObj(first, {
                                    "detail": sglClickDetail,
                                    "button": lButton,
                                    "type": type,
                                    "data": {
                                        "touches": originalEventTouches
                                    }
                                });
                                TouchManager.dispatcher(eventObj);
                            }
                        }
                    }

                } else {
                    // If its a mouse up and was instructed to simulate hover events, release them here.
                    if (specificEvents & TouchManager.SPECIFIC_EVENTS.HOVER) {
                        TouchManager.releaseHover(first, originalEvent);
                    }

                    // This actually emulates the ipads default behavior (which we prevented). This check avoids click being emulated on a double tap.
                    if (TouchManager.tapValid) {
                        eventObj = TouchManager.createEventObj(first, {
                            "detail": sglClickDetail,
                            "button": lButton,
                            "type": type,
                            "data": {
                                "touches": originalEventTouches
                            }
                        });
                        TouchManager.dispatcher(eventObj);

                        if (first.target === TouchManager.lastTap) {
                            // Dispatch a click
                            eventObj = TouchManager.createEventObj(first, {
                                "detail": sglClickDetail,
                                "button": lButton,
                                "type": 'click',
                                "data": {
                                    "touches": originalEventTouches
                                }
                            });
                            TouchManager.dispatcher(eventObj);
                        }
                    } else {
                        if (!TouchManager.cancelMouseup) {
                            eventObj = TouchManager.createEventObj(first, {
                                "detail": sglClickDetail,
                                "button": lButton,
                                "type": type,
                                "data": {
                                    "touches": originalEventTouches
                                }
                            });
                            TouchManager.dispatcher(eventObj);
                        }
                    }
                }
            },

            /**
             * Handles the pointer events available in IE.
             * @method pointerHandler
             * @public
             * @param {Object} event The event object provided by the browser.
             */
            "pointerHandler": function(event) {
                var type = ['pointerdown', 'MSPointerDown'].indexOf(event.type) > -1 ? 'mousedown' : 'mouseup',
                    originalEvent = event.originalEvent, // The actual mouse event reference
                    target = originalEvent.target,
                    sglClickDetail = 1, //Single click
                    lButton = 0, // Left button
                    data = null,
                    eventObj = null;

                // Dispatch only if the original event is a touch event.
                if (["touch", originalEvent.MSPOINTER_TYPE_TOUCH].indexOf(originalEvent.pointerType) > -1) {
                    //to make it compatible for createEventObj
                    data = {
                        "target": target,
                        "screenX": originalEvent.screenX,
                        "screenY": originalEvent.screenY,
                        "clientX": originalEvent.clientX,
                        "clientY": originalEvent.clientY
                    };
                    eventObj = TouchManager.createEventObj(data, {
                        "detail": sglClickDetail,
                        "button": lButton,
                        "type": type
                    });
                    TouchManager.dispatcher(eventObj);
                }
            },

            /**
             * Creates a hash for event properties.
             * @method createEventObj
             * @public
             * @param {Object} element The target element.
             * @param {Object} data Properties to override.
             */
            "createEventObj": function(element, data) {
                var eventObj = {
                    "target": element.target,
                    "canBubble": true,
                    "cancelable": true,
                    "view": window,
                    "screenX": element.screenX,
                    "screenY": element.screenY,
                    "clientX": element.clientX,
                    "clientY": element.clientY,
                    "ctrlKey": false,
                    "altKey": false,
                    "shiftKey": false,
                    "metaKey": false,
                    "relatedTarget": null
                };

                eventObj = $.extend(eventObj, data);
                return eventObj;
            },

            /**
             * Dispatches mouse events with given properties.
             * @method dispatcher
             * @public
             * @param {Object} event The event to be dispatched.
             */
            "dispatcher": function(event) {

                var simulatedEvent = document.createEvent('MouseEvent');

                simulatedEvent.initMouseEvent(event.type, event.canBubble, event.cancelable, event.view, event.detail, event.screenX,
                    event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, event.relatedTarget);
                simulatedEvent.data = event.data || {};
                simulatedEvent.data.simulatedEvent = true;
                event.target.dispatchEvent(simulatedEvent);
            },

            /**
             * Binds the pointer events to the element
             * @method bindPointerEvents
             * @public
             * @param {Object} $obj jQuery object of the element.
             * @param {Object} instructions The processing instructions.
             */
            "bindPointerEvents": function($obj, instructions) {
                var data = $obj.data(),
                    pointerDown = null,
                    pointerUp = null;

                // Check if the events are already being simulated
                if (data.hasSimulation) {
                    return false;
                }

                TouchSimulator.disableTouch($obj);

                //Check for unprefixed events
                if (navigator.pointerEnabled) {
                    pointerDown = 'pointerdown';
                    pointerUp = 'pointerup';
                } else {
                    pointerDown = 'MSPointerDown';
                    pointerUp = 'MSPointerUp';
                }
                $obj.on(pointerDown + '.' + TouchManager.SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.pointerHandler)
                    .on(pointerUp + '.' + TouchManager.SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.pointerHandler);

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
            "bindTouchEvents": function($obj, instructions) {
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

                $obj.on('touchstart.' + TouchManager.SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.touchHandler)
                    .on('touchmove.' + TouchManager.SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.touchHandler)
                    .on('touchend.' + TouchManager.SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.touchHandler)
                    .on('touchcancel.' + TouchManager.SIMULATION_EVENT_NAMESPACE, instructions, TouchManager.touchHandler);

                data.hasSimulation = true;
                data.simulationInstructions = $.extend(true, {}, instructions);
            },
            /**
             * Disables the simulation of touch events on the given element.
             * @method disableTouch
             * @public
             * @param {String||Array||Object} element jQuery selector or list.
             */
            "disableTouch": function(element) {
                var data = null,
                    $obj = null;
                $(element).each(function() {
                    if ([window, document, document.documentElement, document.body].indexOf(this) > -1) {
                        // Skip this iteration, we don't want to disable simulation on global items.
                        return true;
                    }
                    $obj = $(this);
                    data = $obj.data();
                    $obj.off('.' + TouchManager.SIMULATION_EVENT_NAMESPACE);
                    data.hasSimulation = false;
                    data.simulationInstructions = null;
                });
            }

        };

    /**
     * A touch simulator that dispatches mouse events for touch interaction.
     * @class TouchSimulator
     * @static
     */
    TouchSimulator = {
        /**
         * Enables the simulation of touch events on the given element.
         * @method enableTouch
         * @public
         * @param {String||Array||Object} element jQuery selector or list.
         * @param {Object} [instructions={}] Instructions related to dispatching events, if enable right click etc.
         * @param {Number} [instructions.specificEvents=TouchSimulatorSPECIFIC_EVENTS.HOVER] Specifies which events it simulates specifically.
         * @param {Number} [instructions.customMoveThreshold=15] Specifies custom threshold value to dispath mousemove events.
         * For eg. If we need only mouseenter, we set the value to 1
         * For eg. If we need mouseover + mousemove, we set the value to 6 (2+4).
         * For eg. If we need mouseenter + mouseover + right-click, we set the value to 11 (1+2+8).
         * Note that mouseenter implies mouseleave and mouseover implies mouseout.
         */
        "enableTouch": function(element, instructions) {
            var hasPointerSupport = TouchManager.hasPointerSupport();
            if ($.type(instructions) === 'object') {
                instructions = $.extend(true, {}, instructions);
            } else {
                instructions = {};
            }

            if ($.type(instructions.specificEvents) !== 'number') {
                instructions.specificEvents = TouchManager.SPECIFIC_EVENTS.HOVER;
            }

            if (element === document) {
                // Avoid looping if the element is document.
                if (hasPointerSupport && instructions.specificEvents & TouchManager.SPECIFIC_EVENTS.POINTER_EVENTS) {
                    TouchManager.bindPointerEvents($(document), instructions);
                } else {
                    TouchManager.bindTouchEvents($(document), instructions);
                }
            } else {
                if (hasPointerSupport && instructions.specificEvents & TouchManager.SPECIFIC_EVENTS.POINTER_EVENTS) {
                    $(element).each(function() {
                        TouchManager.bindPointerEvents($(this), instructions);
                    });
                } else {
                    $(element).each(function() {
                        TouchManager.bindTouchEvents($(this), instructions);
                    });
                }
            }
        },

        /**
         * Disables the simulation of touch events on the given element.
         * @method disableTouch
         * @public
         * @param {String||Array||Object} element jQuery selector or list.
         */
        "disableTouch": function(element) {
            TouchManager.disableTouch(element);
        },


        /**
        * An enum for specific event dispatching
        *
        * @attribute SPECIFIC_EVENTS
        * @type Object
        * @default {
            "TAP": 0,
            "MOUSEENTER": 1,
            "MOUSEOVER": 2,
            "HOVER": 3,
            "MOUSEMOVE": 4,
            "DRAGGABLE": 7,
            "RIGHT_CLICK": 8,
            "POINTER_EVENTS": 16,
            "PAPER_JS": 32,
            "MULTI_TOUCH": 64,
            "STOP_PROPAGATION": 128,
            "ALL": 127, // DEPRICATED
            "ALL_BUT_MULTI_TOUCH": 191
        }
        */
        "SPECIFIC_EVENTS": TouchManager.SPECIFIC_EVENTS,

        /**
         * Exports TouchManager globally for unit testing.
         * @method __export__
         * @param {Function} testCode A function that can test closure variables .
         * @private
         */
        "__export__": function(testCode) {
            if (testCode) {
                MathUtilities.Components.Utils.TouchManager = TouchManager;
                testCode();
                delete MathUtilities.Components.Utils.TouchManager;
            }
        }
    };

    MathUtilities.Components.Utils.TouchSimulator = TouchSimulator;

}(window.MathUtilities));
