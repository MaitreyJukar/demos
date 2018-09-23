/* globals _, window, $  */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.DgtEventManager = Backbone.Model.extend({
        "initialize": function(engineObj) {
            this.engine = engineObj.engine;
            this.down = false;
            this.up = true;
            this.downTimeStamp = null;
            this._selectionRectMode = false;
            this.zoomPanMode = false;
            this.dragging = null;
            this.downTimeStamp = null;
            this._mouseDownSteal = null;
            this.specialEntityDown = {};
            this.triggeredDown = null;
            this.canvasMouseMoveFunction = null;
            this.measurementLabelDown = false;
            this.downPosition = null;
            this.lastPosition = null;
            this._gestureStartEvent = null;
            this.zooming = false;
            this.pointerTouches = {};
            this._clickTracker = {
                "moveTime": [],
                "downTime": [],
                "upTime": [],
                "dragTime": []
            };
            this._addEvents(this.engine.dgtUI.$('#canvas-event-listener'));
        },


        "_addEvents": function($canvasElement) {
            var engine = this.engine,
                gridGraph = engine.grid,
                demon, expecting = 'DC',
                DOUBLE_CLICK_INTERVAL = 350,
                sessionTimestamp,
                MIN_DRAG_DISTANCE = 5,
                funcOnMouseDrag, funcOnMouseDown, funcOnMouseUp, funcOnMouseMove, canvasMouseMoveFunction,
                dragTime = this._clickTracker.dragTime,
                downTime = this._clickTracker.downTime,
                upTime = this._clickTracker.upTime,
                moveTime = this._clickTracker.moveTime,
                processEvent, curPopupShown, canvasOffset,
                sessionStats = {
                    "dragged": false
                },
                currentEventObject, previousEventObject,
                sessionDraggedX, sessionDraggedY, sessionDragStart,
                isTouchDevice = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile,
                pointerDownEvent, pointerMoveEvent;

            funcOnMouseDown = _.bind(function(event) {
                this.engine.dgtUI.setKeyBoolean(false);
                if (event.which === 2 || event.which === 3) { // Identifying mouse click
                    return;
                }
                if (this._mouseDownSteal) {
                    this._mouseDownSteal.call(event, event);
                    this._mouseDownSteal = null;
                    return;
                }
                sessionDraggedX = 0;
                sessionDraggedY = 0;
                sessionDragStart = false;

                if (!event.touches && event.data && event.data.touches) {
                    event.touches = event.data.touches;
                }

                if (gridGraph.getGridMode() === 'Graph' && event.touches && event.touches[0] && event.touches[1]) {
                    canvasOffset = $canvasElement.offset();
                    gridGraph._pinchZoomDistance = Math.sqrt(Math.pow(event.touches[0].pageX - canvasOffset.left - (event.touches[1].pageX - canvasOffset.left), 2) +
                        Math.pow(event.touches[0].pageY - canvasOffset.top - (event.touches[1].pageY - canvasOffset.top), 2));
                    this.zooming = true;
                    if (this.engine._selectionRect) {
                        this.engine._selectionRect.remove();
                        this.engine._selectionRect = null;
                    }
                    return;
                }
                event.point = this.getMousePos($canvasElement, event);
                if (!event.point) {
                    return;
                }
                this.downTimeStamp = sessionTimestamp = event.timeStamp;
                event.sessionTimestamp = sessionTimestamp;
                expecting = gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_DOUBLE_CLICK) ? 'DC' : 'drag';

                this.eventDispatcher('down-sensed', event);

                if (downTime.length === 0) {
                    if (!previousEventObject) {
                        previousEventObject = event;
                    }
                    currentEventObject = event;

                    if (!curPopupShown && (gridGraph.getGridMode() !== 'drawing' || gridGraph.getGridMode() === 'SelectionRect')) {
                        this.attachMouseMoveFunction(funcOnMouseDrag);
                    }
                    if (isTouchDevice) {
                        $(window).off('touchend', funcOnMouseUp).on('touchend', funcOnMouseUp);
                    } else {
                        $(window).off('mouseup', funcOnMouseUp).on('mouseup', funcOnMouseUp);
                        MathUtilities.Components.Utils.TouchSimulator.enableTouch($(window), {
                            "specificEvents": MathUtilities.Components.Utils.TouchSimulator.SPECIFIC_EVENTS.TAP |
                                MathUtilities.Components.Utils.TouchSimulator.SPECIFIC_EVENTS.MULTI_TOUCH

                        });
                    }

                    gridGraph.isDragInProgress = true;

                }
                if ((gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_DOUBLE_CLICK) || gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_FIRST_CLICK)) && !demon) {
                    demon = setInterval(function() {
                        processEvent('timeout', event);

                    }, gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_DOUBLE_CLICK) ? DOUBLE_CLICK_INTERVAL : DOUBLE_CLICK_INTERVAL / 2);
                }

                processEvent('down', event);
            }, this);

            funcOnMouseMove = _.bind(function(event) {
                event.point = this.getMousePos($canvasElement, event);
                if (!event.point) {
                    return;
                }
                if (['select', 'nonGeometricDrawing'].indexOf(engine.getOperationMode()) > -1 && 
                    downTime.length === 0 || ['properties', 'iterate', 'iterateToDepth', 'calculator'].indexOf(curPopupShown) > -1) {
                    processEvent('move', event);
                    return;
                }

                if (previousEventObject) {
                    previousEventObject = currentEventObject;
                } else {
                    previousEventObject = event;
                }
                currentEventObject = event;

                event.delta = {
                    "x": currentEventObject.point.x - previousEventObject.point.x,
                    "y": currentEventObject.point.y - previousEventObject.point.y
                };

                if (Math.abs(event.delta.x) > 1 || Math.abs(event.delta.y) > 1) {
                    processEvent('move', event);
                    if (downTime.length !== upTime.length) {
                        this.attachMouseMoveFunction(funcOnMouseDrag);
                    }

                }
            }, this);

            funcOnMouseDrag = _.bind(function(event) {
                event.point = this.getMousePos($canvasElement, event);
                if (!event.point) {
                    return;
                }
                if (previousEventObject) {
                    previousEventObject = currentEventObject;
                } else {
                    previousEventObject = event;
                }
                currentEventObject = event;

                event.delta = {
                    "x": currentEventObject.point.x - previousEventObject.point.x,
                    "y": currentEventObject.point.y - previousEventObject.point.y
                };

                if (!sessionDragStart && Math.abs(sessionDraggedX) < MIN_DRAG_DISTANCE && Math.abs(sessionDraggedY) < MIN_DRAG_DISTANCE) {
                    sessionDraggedX += event.delta.x;
                    sessionDraggedY += event.delta.y;
                    dragTime.push({
                        "time": new Date().getTime(),
                        "event": event
                    });
                } else {
                    sessionDragStart = true;
                    processEvent('drag', event);

                }
            }, this);

            funcOnMouseUp = _.bind(function(event) {
                if (!(downTime && downTime[0])) {
                    return;
                }

                event.point = this.getMousePos($canvasElement, event);
                if (!event.point) {
                    return;
                }
                processEvent('up', event);
                if (expecting === 'DC' && !sessionDragStart && downTime.length === 1 && downTime.length === upTime.length) {
                    this.attachMouseMoveFunction(funcOnMouseMove);
                }
            }, this);

            canvasMouseMoveFunction = _.bind(function(event) {
                if (!MathUtilities.Tools.Dgt.Models.DgtEngine.measurementDragInProgress) {
                    event.stopPropagation();
                }
                if ('ontouchstart' in window) {
                    event.preventDefault();
                }
                curPopupShown = engine.dgtUI.model.dgtPopUpView.model.curPopupShown;

                if (!event.touches && event.data && event.data.touches) {
                    event.touches = event.data.touches;
                }

                if (!curPopupShown && this.zooming && event.touches && event.touches[0] && event.touches[1]) {
                    this._gestureStartEvent = {};
                    this._gestureStartEvent.pageX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                    this._gestureStartEvent.pageY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                    gridGraph._gestureStartEvent = this._gestureStartEvent;
                    gridGraph._pinchZoom(event);
                    event.preventDefault();
                    return;
                }
                if (this.canvasMouseMoveFunction) {
                    this.canvasMouseMoveFunction.call(event, event);
                    return;
                }
                if (['select', 'nonGeometricDrawing'].indexOf(engine.getOperationMode()) > -1 ||
                    ['properties', 'iterate', 'iterateToDepth'].indexOf(curPopupShown) > -1) {
                    this.attachMouseMoveFunction(funcOnMouseMove);
                    this.canvasMouseMoveFunction.call(event, event);
                }
            }, this);


            function cancelInterval() {
                if (demon) {
                    clearInterval(demon);
                    demon = null;
                }
            }

            processEvent = _.bind(function(eventName, event) {
                var flushEvents = _.bind(function() {
                        cancelInterval();
                        sessionStats.dragged = null;
                        sessionStats.downTriggerred = null;

                        while (this._clickTracker.dragTime.length) {
                            this._clickTracker.dragTime.pop();
                        }

                        while (this._clickTracker.downTime.length) {
                            this._clickTracker.downTime.pop();
                        }

                        while (this._clickTracker.upTime.length) {
                            this._clickTracker.upTime.pop();
                        }

                        while (this._clickTracker.moveTime.length) {
                            this._clickTracker.moveTime.pop();
                        }

                        expecting = gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_DOUBLE_CLICK) ? 'DC' : 'drag';

                        if (isTouchDevice) {
                            $(window).off('touchend', funcOnMouseUp);
                        } else {
                            $(window).off('mouseup', funcOnMouseUp);
                            window.tempNamespace.DisableTouch($(window));
                        }

                        gridGraph.isDragInProgress = false;
                        sessionTimestamp = null;
                        this.triggeredDown = null;
                        this._gestureStartEvent = null;
                        this.zooming = false;
                        gridGraph._pinchZoomDistance = null;
                        this.pointerTouches = {};
                    }, this),
                    time = new Date().getTime(),
                    clickInterval = DOUBLE_CLICK_INTERVAL / 2,
                    finish = false;
                switch (eventName) {
                    case 'up':
                        if (!gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_DOUBLE_CLICK) && !gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_FIRST_CLICK)) {

                            cancelInterval();
                            this.eventDispatcher('up', event);
                            this.triggeredDown = false;

                            finish = true;
                            break;
                        }
                        if (upTime.length + 1 !== downTime.length || !demon) {
                            this.eventDispatcher('up', event);
                            this.triggeredDown = false;
                            finish = true;
                            break;
                        }
                        upTime.push({
                            "t": time,
                            "event": event
                        });

                        if (expecting === 'DC' && upTime.length === 2 && time - downTime[0].t < DOUBLE_CLICK_INTERVAL) {
                            this.eventDispatcher('doubleClick', downTime[0].event);
                            this.triggeredDown = false;
                            finish = true;
                        } else if (!gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_DOUBLE_CLICK) && gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_FIRST_CLICK) && time - downTime[0].t < DOUBLE_CLICK_INTERVAL / 2) {
                            cancelInterval();
                            this.eventDispatcher('click', event);
                            this.triggeredDown = false;
                            finish = true;
                        } else if (!gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_FIRST_CLICK) && expecting === 'drag' && sessionStats.dragged) {
                            this.eventDispatcher('up', event);
                            this.triggeredDown = false;
                            finish = true;
                        }
                        break;

                    case 'down':
                        downTime.push({
                            "t": time,
                            "event": event
                        });
                        if (!gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_DOUBLE_CLICK) && !gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_FIRST_CLICK)) {
                            cancelInterval();
                            this.eventDispatcher('down', event);
                            this.triggeredDown = true;
                        }
                        break;

                    case 'drag':
                        cancelInterval();
                        if (downTime.length === 0 || downTime.length === upTime.length) {
                            return;
                        }
                        if (expecting === 'DC') {
                            if (!this.triggeredDown) {
                                this.eventDispatcher('down', downTime[0].event);
                                this.triggeredDown = true;
                            }
                            this.eventDispatcher('dragBegin', downTime[0].event);
                            expecting = 'drag';
                        }
                        sessionStats.dragged = true;
                        while (dragTime.length > 0) {
                            this.eventDispatcher('drag', dragTime.shift().event);

                        }
                        this.eventDispatcher('drag', event);


                        break;

                    case 'move':
                        if (['select', 'nonGeometricDrawing'].indexOf(engine.getOperationMode()) > -1 ||
                         ['properties', 'iterate', 'iterateToDepth', 'calculator'].indexOf(curPopupShown) > -1) {
                            this.eventDispatcher('move', event);
                            return;
                        }
                        if (expecting === 'DC' && downTime.length !== upTime.length) {
                            break;
                        }
                        if (demon) {
                            cancelInterval();
                        }
                        moveTime.push({
                            "t": time,
                            "event": event
                        });
                        //if uptime is zero that means drag begin is not correct
                        if (expecting === 'DC' && upTime.length === 0) {
                            if (!this.triggeredDown) {
                                this.eventDispatcher('down', downTime[0].event);
                                this.triggeredDown = true;
                            }
                            this.eventDispatcher('dragBegin', downTime[0].event);
                            expecting = 'drag';
                        } else if (upTime.length > 0) {
                            if (downTime.length > 0 && !this.triggeredDown) {
                                this.eventDispatcher('down', downTime[0].event);
                                this.triggeredDown = true;
                            }
                            this.eventDispatcher('up', upTime[upTime.length - 1].event);
                            this.triggeredDown = false;
                            finish = true;
                        }

                        break;

                    case 'timeout':
                        cancelInterval();
                        if (upTime.length === 1) {
                            //removing check for DC...why do we need to check with DC?? removed for BZ26053
                            //after timeout check if the interval is sufficient for click
                            if (upTime[0].t - downTime[0].t <= clickInterval && gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_FIRST_CLICK)) {
                                event = downTime[0].event;
                                this.eventDispatcher('click', event);
                                this.triggeredDown = false;
                            } else {
                                //otherwise break and dispatch individual events
                                this.eventDispatcher('down', downTime[0].event);
                                this.triggeredDown = true;
                                this.eventDispatcher('up', event);
                                this.triggeredDown = false;
                            }
                            finish = true;
                        } else if (upTime.length === 2 || upTime.length === 0 && (gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_DOUBLE_CLICK) && gridGraph.isInputModeEnabled(gridGraph.INPUT_MODE_FIRST_CLICK) && downTime.length > 0)) {
                            this.eventDispatcher('down', downTime[0].event);
                            this.triggeredDown = true;
                        }

                        break;

                    default:
                        return;

                }

                if (finish) {
                    flushEvents();
                }
            }, this);

            if (isTouchDevice) {
                $canvasElement[0].ontouchstart = funcOnMouseDown;
                $canvasElement[0].ontouchmove = canvasMouseMoveFunction;
            } else {

                $canvasElement[0].onmousedown = funcOnMouseDown;
                $canvasElement[0].onmousemove = canvasMouseMoveFunction;

                MathUtilities.Components.Utils.TouchSimulator.enableTouch($canvasElement[0], {
                    "specificEvents": MathUtilities.Components.Utils.TouchSimulator.SPECIFIC_EVENTS.MOUSEMOVE |
                        MathUtilities.Components.Utils.TouchSimulator.SPECIFIC_EVENTS.MULTI_TOUCH
                });

                if (window.navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0) {
                    if (window.navigator.maxTouchPoints > 0) {
                        pointerDownEvent = 'pointerdown.pinchzoom';
                        pointerMoveEvent = 'pointermove.pinchZoom';
                    } else {
                        pointerDownEvent = 'MSPointerDown.pinchzoom';
                        pointerMoveEvent = 'MSPointerMove.pinchzoom';
                    }
                    $canvasElement.on(pointerDownEvent, _.bind(function(event) {
                        curPopupShown = engine.dgtUI.model.dgtPopUpView.model.curPopupShown;
                        if (gridGraph.getGridMode() !== 'Graph' || curPopupShown) {
                            return;
                        }
                        var objectKeys, originalEvent1, originalEvent2;

                        if (['touch', event.originalEvent.MSPOINTER_TYPE_TOUCH].indexOf(event.originalEvent.pointerType) > -1 && !objectKeys) {
                            this.pointerTouches[event.originalEvent.pointerId] = event;

                            if (objectKeys && objectKeys.length === 1 && event.isPrimary) {
                                objectKeys = null;
                                return;
                            }

                            objectKeys = Object.keys(this.pointerTouches);

                            if (objectKeys.length === 2) {
                                canvasOffset = $canvasElement.offset();

                                originalEvent1 = this.pointerTouches[objectKeys[0]].originalEvent;
                                originalEvent2 = this.pointerTouches[objectKeys[1]].originalEvent;

                                gridGraph._pinchZoomDistance = Math.sqrt(Math.pow(originalEvent1.pageX - canvasOffset.left - (originalEvent2.pageX - canvasOffset.left), 2) +
                                    Math.pow(originalEvent1.pageY - canvasOffset.top - (originalEvent2.pageY - canvasOffset.top), 2));
                                this.zooming = true;
                                if (this.engine._selectionRect) {
                                    this.engine._selectionRect.remove();
                                    this._selectionRectMode = false;
                                    this.engine._selectionRect = null;
                                }
                            }
                        }
                    }, this));

                    $canvasElement.on(pointerMoveEvent, _.bind(function(event) {
                        curPopupShown = engine.dgtUI.model.dgtPopUpView.model.curPopupShown;
                        if (gridGraph.getGridMode() !== 'Graph' || curPopupShown || !this.zooming) {
                            return;
                        }

                        if (['touch', event.originalEvent.MSPOINTER_TYPE_TOUCH].indexOf(event.originalEvent.pointerType) > -1) {

                            this.pointerTouches[event.originalEvent.pointerId] = event;

                            var objectKeys = Object.keys(this.pointerTouches),
                                originalEvent1, originalEvent2;

                            if (this.zooming && objectKeys.length === 2) {
                                originalEvent1 = this.pointerTouches[objectKeys[0]].originalEvent;
                                originalEvent2 = this.pointerTouches[objectKeys[1]].originalEvent;

                                this._gestureStartEvent = {};
                                this._gestureStartEvent.pageX = (originalEvent1.pageX + originalEvent2.pageX) / 2;
                                this._gestureStartEvent.pageY = (originalEvent1.pageY + originalEvent2.pageY) / 2;
                                gridGraph._gestureStartEvent = this._gestureStartEvent;

                                event.touches = [];
                                event.touches[0] = {
                                    "pageX": originalEvent1.pageX,
                                    "pageY": originalEvent1.pageY
                                };
                                event.touches[1] = {
                                    "pageX": originalEvent2.pageX,
                                    "pageY": originalEvent2.pageY
                                };

                                gridGraph._pinchZoom(event);
                            }
                        }
                    }, this));
                }
            }

        },
        "notationEvents": function(name, event) {

            var grid = this.engine.grid,
                hits, canvasPosition,
                layerName = MathUtilities.Tools.Dgt.Models.DgtEventManager.EntityLayerMap[this.annotateDown.division],
                customEvent = this.getCustomEvent(event, this.annotateDown);

            switch (name) {
                case 'down':
                    grid.trigger(layerName + '-layer-annotate-start', customEvent);
                    this.downPosition = this.lastPosition = this.getMousePos(this.engine.dgtUI.$('#canvas-event-listener'), event);
                    break;
                case 'up':
                    if (this.annotateDown.division === 'notation') {
                        this.postRelocate(customEvent, this.annotateDown);
                    } else {
                        grid.trigger(layerName + '-layer-annotate-end', customEvent);
                    }
                    this.annotateDown = null;
                    this.attachMouseMoveFunction(null);
                    break;
                case 'drag':
                    if (this.notationFromShape) {
                        canvasPosition = [event.point.x, event.point.y];
                        hits = this.engine.checkHitTestForAllObjects(canvasPosition, 'shapes', true, false, true);
                        if (hits && ['segment', 'ray', 'line'].indexOf(hits[0].species) > -1 && !this.currentRollOverShape) {
                            this.currentRollOverShape = hits[0];
                            customEvent = this.getCustomEvent(event, hits[0]);
                            hits[0].equation.trigger('annotation-roll-over', hits[0].equation, customEvent);
                        } else if ((!hits || hits[0] !== this.currentRollOverShape) && this.currentRollOverShape) {
                            customEvent = this.getCustomEvent(event, this.annotateRollOverShape);
                            this.currentRollOverShape.equation.trigger('annotation-roll-out', this.currentRollOverShape.equation, customEvent);
                            this.currentRollOverShape = null;
                        }
                    } else if (this.annotateDown.division === 'notation') {
                        this.dragTargetObject(customEvent, this.annotateDown, true);
                    } else {
                        grid.trigger('grid-graph-mousedrag', customEvent);
                    }
                    event.preventDefault();
                    break;
                case 'click':
                    grid.trigger('shape' + '-layer-annotate', customEvent);
                    // falls through
                case 'doubleClick':
                    this.annotateDown = null;
                    break;

            }

        },
        "zoomPanEvents": function(name, event) {
            if (!event.shiftKey) {
                this.zoomPanMode = false;
                this.attachMouseMoveFunction(null);
                return;
            }
            event.event = {
                "shiftKey": true
            };
            switch (name) {
                case 'drag':

                    this.engine.grid.onMouseDrag(event);
                    event.preventDefault();
                    break;

                case 'up':
                case 'click':
                case 'doubleClick':
                    this.zoomPanMode = false;
                    this.attachMouseMoveFunction(null);

            }

        },
        "annotationEvents": function(name, event) {
            var grid = this.engine.grid,
                hits, mousePosition, customEvent;
            if (event.point && name === 'down-sensed') {
                mousePosition = [event.point.x, event.point.y];
                hits = this.engine.checkHitTestForAllObjects(mousePosition, 'all', true, false, true);
            }
            if (this.annotateDown) {
                this.notationEvents(name, event);
                return;
            }

            if (hits && this.notationPossible(hits[0])) {
                customEvent = this.getCustomEvent(event, hits[0]);
                this.annotateDown = hits[0];
                this.notationEvents(name, customEvent);
                return;
            }

            switch (name) {
                case 'down':
                    grid.trigger('grid-layer-annotate-start', event);
                    this.lastPosition = this.getMousePos(this.engine.dgtUI.$('#canvas-event-listener'), event);
                    break;
                case 'up':
                    if (event.target && event.target.id === 'canvas-event-listener') {
                        grid.trigger('grid-layer-annotate-end', event);
                    }
                    this.attachMouseMoveFunction(null);
                    break;
                case 'drag':
                    if (this._clickTracker.downTime.length !== this._clickTracker.upTime.length) {
                        grid.trigger('grid-layer-annotate-drag', event);
                    }
                    event.preventDefault();
                    break;
                case 'move':

                    if (this._clickTracker.downTime.length === 0) {
                        mousePosition = [event.point.x, event.point.y];
                        this.manageRollOverAndRollOut(event, mousePosition);
                    }
                    event.preventDefault();
                    break;
            }
        },
        "labelEvents": function(event, target, name) {
            var customEvent = this.getCustomEvent(event, target),
                grid = this.engine.grid,
                equation = target.equation;
            switch (name) {
                case 'drag':
                    equation.trigger('label-drag-begin', event, equation);
                    grid._updateLabelPosition(equation);
                    grid.refreshView();
                    event.preventDefault();
                    break;
                case 'doubleClick':

                    if (equation.getParent()) {
                        if (equation.getParent().properties.locked) {
                            return;
                        }
                        grid.trigger('label-layer-doubleclick', customEvent);
                    }
                    this.specialEntityDown = {};
                    break;

                case 'up':
                case 'click':
                    this.specialEntityDown = {};
                    this.attachMouseMoveFunction(null);
                    break;
            }
        },
        "transformationViewEvents": function(event, target, name) {

            var customEvent = this.getCustomEvent(event, target),
                isDragging = false,
                engine = this.engine,
                grid = engine.grid,
                transformationView = target.transformationView,
                hits;
            switch (name) {
                case 'drag':
                    if (target.equation.getParent().properties.locked) {
                        return;
                    }
                    if (engine.selected.indexOf(engine._standardObjects.Xmirror) > -1 ||
                        engine.selected.indexOf(engine._standardObjects.Ymirror) > -1 && target.name === 'move') {
                        grid._panBy(event.delta.x, event.delta.y);
                    } else {
                        transformationView.trigger('transformation-resized', customEvent);
                    }
                    event.preventDefault();
                    break;
                case 'up':
                    isDragging = transformationView.model.isDragging;
                    transformationView.trigger('transformation-mouseup', customEvent);
                    this.specialEntityDown = {};
                    if (!this.selectedOnDown && !isDragging) {
                        grid.trigger('service-layer-click', customEvent);
                    } else {
                        this.selectedOnDown = false;
                    }
                    grid.updateVisibleDomain();
                    break;
                case 'doubleClick':
                    transformationView._onDoubleClick(customEvent);
                    // falls through
                case 'click':
                    if (!this.selectedOnDown) {
                        grid.trigger('service-layer-click', customEvent);
                    }
                    this.selectedOnDown = false;
                    this.specialEntityDown = {};
                    break;
                case 'dragBegin':
                    if (target) {
                        if (target.equation.getParent().properties.locked) {
                            return;
                        }
                        target.equation.trigger('drag-begin', event.point, target.equation, event);

                        hits = engine.checkHitTestForAllObjects(event.point, 'image', false, false);
                        if (hits && ['tl', 'tr', 'bl', 'br', 'rotate', 'move'].indexOf(hits[0].name) > -1) {
                            if (engine.dgtUI.model.dgtPopUpView.model.curPopupShown) {
                                return;
                            }
                            this.specialEntityDown.entity = hits[0];
                            hits[0].transformationView.model.movingTarget = hits[0];
                            this.specialEntityDown.type = 'transformation';
                            hits[0].equation = hits[0].transformationView.model.get('_item').equation;
                            hits[0].transformationView._calculatePositions();
                        }
                    }
                    break;

            }
            grid.refreshView();
        },
        "scrollEvents": function(event, target, name) {
            var scrollBarManager = this.engine.grid._scrollBarManager;
            event.event = event;
            if (this.engine.getOperationMode() === "nonGeometricDrawing" && (name === 'down' || name === 'drag')) {
                this.attachMouseMoveFunction(null);
                return;
            }
            switch (name) {
                case 'down':
                    target.onMouseDown(event);
                    break;

                case 'drag':
                    if (target.name === 'vertical-scroll') {
                        scrollBarManager.onMouseMoveV(event);
                    } else if (target.name === 'horizontal-scroll') {
                        scrollBarManager.onMouseMoveH(event);
                    }
                    break;
                case 'click':
                case 'doubleClick':
                    target.onMouseDown(event);
                    // falls through
                case 'up':
                    if (target.name === 'vertical-scroll') {
                        scrollBarManager.onMouseUpV(event);
                    } else if (target.name === 'horizontal-scroll') {
                        scrollBarManager.onMouseUpH(event);
                    } else {
                        target.onMouseUp(event);
                    }
                    this.specialEntityDown = {};
                    this.attachMouseMoveFunction(null);
                    break;

            }
        },
        "eventDispatcher": function(name, event) {

            if (name !== 'up' && event.target.id !== 'canvas-event-listener') {
                return;
            }
            if (this.engine.grid.getGridMode() === 'annotation-mode') {
                this.annotationEvents(name, event);
                return;
            }
            if (this.specialEntityDown.type === 'label') {
                this.labelEvents(event, this.specialEntityDown.entity, name);
                return;
            }
            if (this.specialEntityDown.type === 'transformation') {
                this.transformationViewEvents(event, this.specialEntityDown.entity, name);
                return;
            }
            if (this.specialEntityDown.type === 'scroll') {
                this.scrollEvents(event, this.specialEntityDown.entity, name);
                return;
            }
            if (this.zoomPanMode === true) {
                this.zoomPanEvents(name, event);
                return;
            }

            var engine = this.engine,
                hits, index, mousePosition,
                layerName, target,
                grid = engine.grid,
                SEL_RECT_DEFAULT_WIDTH = 50,
                rect,
                tempPoint = engine._unsettledPoint || engine.dummyPoint,
                customEvent = {},
                $eventCanvas = engine.dgtUI.$('#canvas-event-listener'),
                isTouchDevice = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile ||
                event.originalEvent && event.originalEvent.data && event.originalEvent.data.simulatedEvent,
                curPopupShown = engine.dgtUI.model.dgtPopUpView.model.curPopupShown;

            if (curPopupShown === 'calculator') {
                return;
            }

            event.point = this.getMousePos($eventCanvas, event);
            event.sessionTimestamp = this.downTimeStamp;
            mousePosition = [event.point.x, event.point.y];
            if (grid.isSnapToGridEnabled() && engine.getOperationMode() !== 'select') {
                mousePosition = grid.getClosestCanvasPoint(mousePosition);
            }


            switch (name) {
                case 'click':
                    if (curPopupShown && ['properties', 'iterate', 'iterateToDepth'].indexOf(curPopupShown) > -1) {
                        hits = engine.checkHitTestForAllObjects(mousePosition, 'all', false, false, true);
                        if (hits) {
                            this.selectByDepth(hits, 'click', event.timeStamp);
                        }
                        break;
                    }
                    if (engine.getOperationMode() !== 'select') {
                        hits = engine.checkHitTestForAllObjects(mousePosition, 'all', true, false, true);
                        if (isTouchDevice && hits && hits[0].division === 'shape') {
                            target = hits[0];
                            layerName = 'shape';
                        } else if (hits && hits[0].division === 'point') {
                            target = hits[0];
                            layerName = 'point';
                        } else if (tempPoint && tempPoint.properties.binaryInvisibility === 0) {
                            target = tempPoint;
                            layerName = 'point';
                        }
                        if (!layerName) {
                            layerName = 'grid';
                        }
                        if (grid.getGridMode() === 'SelectionRect') {
                            rect = new grid._paperScope.Path.Rectangle(mousePosition, [SEL_RECT_DEFAULT_WIDTH, SEL_RECT_DEFAULT_WIDTH]);
                            grid.trigger('selection-rect-complete', rect.bounds);
                            rect.remove();
                        }
                        customEvent = this.getCustomEvent(event, target);
                        grid.trigger(layerName + '-layer-mousedown', customEvent);


                    } else {
                        hits = engine.checkHitTestForAllObjects(mousePosition, 'all', false, false, true);
                        this._selectionRectMode = false;
                        if (engine._selectionRect) {
                            engine.selectionRectComplete();
                            this.attachMouseMoveFunction(null);
                            return;
                        }
                        if (hits) {
                            this.selectByDepth(hits, 'click', event.timeStamp);
                            this.attachMouseMoveFunction(null);
                        }
                        this.attachMouseMoveFunction(null);

                    }
                    break;
                case 'down-sensed':
                    hits = engine.checkHitTestForAllObjects(mousePosition, 'all', false, false, true);
                    if (engine.getOperationMode() === 'select' || curPopupShown && ['properties', 'iterate', 'iterateToDepth'].indexOf(curPopupShown) > -1) {
                        if (hits) {
                            if (hits[0].type === 'point-text') {
                                if (curPopupShown) {
                                    return;
                                }
                                this.specialEntityDown.entity = hits[0];
                                this.specialEntityDown.type = 'label';
                                return;
                            }
                            if (['tl', 'tr', 'bl', 'br', 'rotate', 'move'].indexOf(hits[0].name) > -1) {
                                if (curPopupShown) {
                                    return;
                                }
                                this.specialEntityDown.entity = hits[0];
                                hits[0].transformationView.model.movingTarget = hits[0];
                                this.specialEntityDown.type = 'transformation';
                                hits[0].equation = hits[0].transformationView.model.get('_item').equation;
                                hits[0].transformationView._calculatePositions();
                                return;
                            }
                            if (hits && this.isScrollBarHit(hits[0])) {
                                this.specialEntityDown.entity = hits[0];
                                this.specialEntityDown.type = 'scroll';
                                return;
                            }
                            index = this.getSelectedIndex(hits);
                            if (typeof index === 'undefined') {
                                layerName = MathUtilities.Tools.Dgt.Models.DgtEventManager.EntityLayerMap[hits[0].division];
                                engine._select(hits[0], null, event.timeStamp);
                                this.selectedOnDown = true;

                            } else {
                                this.selectedOnDown = false;
                            }
                            if (hits[0].division === 'image' && !curPopupShown) {
                                hits = engine.checkHitTestForAllObjects(mousePosition, 'image', true, false);
                                if (hits && ['tl', 'tr', 'bl', 'br', 'rotate', 'move'].indexOf(hits[0].name) > -1) {
                                    this.specialEntityDown.entity = hits[0];
                                    hits[0].transformationView.model.movingTarget = hits[0];
                                    this.specialEntityDown.type = 'transformation';
                                    hits[0].equation = hits[0].transformationView.model.get('_item').equation;
                                    hits[0].transformationView._calculatePositions();
                                    return;
                                }
                            }

                            this._selectionRectMode = false;
                        } else if (event.shiftKey) {
                            this.zoomPanMode = true;
                        } else {
                            if (!engine.dgtUI.model.dgtPopUpView.model.curPopupShown) {
                                engine.deselectAll();
                                this._selectionRectMode = true;
                            }
                        }
                    } else if (hits && this.isScrollBarHit(hits[0])) {
                        this.specialEntityDown.entity = hits[0];
                        this.specialEntityDown.type = 'scroll';
                        return;
                    }
                    break;
                case 'down':

                    if (engine.getOperationMode() !== 'select') {
                        hits = engine.checkHitTestForAllObjects(mousePosition, 'all', true, false, true);
                        if (isTouchDevice && hits && hits[0].division === 'shape') {
                            target = hits[0];
                            layerName = 'shape';
                        } else if (hits && hits[0].division === 'point') {
                            target = hits[0];
                            layerName = 'point';
                        } else if (tempPoint && tempPoint.properties.binaryInvisibility === 0) {
                            target = tempPoint;
                            layerName = 'point';
                        } else {
                            layerName = 'grid';
                        }
                        customEvent = this.getCustomEvent(event, target);
                        grid.trigger(layerName + '-layer-mousedown', customEvent);
                        this._selectionRectMode = engine.getOperationMode() === "nonGeometricDrawing";
                    }
                    $eventCanvas = engine.dgtUI.$('#canvas-event-listener');
                    this.downPosition = this.getMousePos($eventCanvas, event);
                    this.lastPosition = this.downPosition;
                    break;
                case 'up':

                    if (curPopupShown && ['properties', 'iterate', 'iterateToDepth'].indexOf(curPopupShown) > -1) {
                        hits = engine.checkHitTestForAllObjects(mousePosition, 'all', false, false);
                        if (hits) {
                            this.selectByDepth(hits, 'click', event.timeStamp);
                        }
                        break;
                    }

                    hits = engine.checkHitTestForAllObjects(mousePosition, 'all', true, false, true);
                    if (this.dragging) {
                        this.postRelocate(event, this.dragging);
                        this.attachMouseMoveFunction(null);
                    }
                    this.dragging = null;
                    if (engine._selectionRect) {
                        engine.selectionRectComplete();
                        this.attachMouseMoveFunction(null);
                        return;
                    }
                    if (engine.getOperationMode() === 'select') {
                        this.selectByDepth(hits, 'up', event.timeStamp);
                        this.attachMouseMoveFunction(null);
                    } else {

                        if (hits && hits[0].division === 'point') {
                            target = hits[0];
                            layerName = 'point';
                        } else if (tempPoint && tempPoint.properties.binaryInvisibility === 0) {
                            target = tempPoint;
                            layerName = 'point';
                        } else {
                            layerName = 'grid';
                        }
                        customEvent = this.getCustomEvent(event, target);
                        grid.trigger(layerName + '-layer-mouseup', customEvent);
                    }

                    this.selectedOnDown = false;
                    break;
                case 'mousewheel':
                    event.originalEvent = {
                        'wheelDelta': event.wheelDelta
                    };
                    if (event.shiftKey) {
                        grid._functionAttacher(event, event.wheelDelta);
                    } else {
                        grid.onMouseDrag(event);
                    }
                    break;
                case 'doubleClick':
                    hits = engine.checkHitTestForAllObjects(mousePosition, 'all', true, false, true);
                    this.selectedOnDown = false;
                    if (hits && engine.getOperationMode() !== 'select') {
                        this.attachMouseMoveFunction(null);
                        return;
                    }
                    if (hits) {
                        index = this.getSelectedIndex(hits);
                        if (typeof index === 'undefined') {
                            index = 0;
                        }
                        layerName = MathUtilities.Tools.Dgt.Models.DgtEventManager.EntityLayerMap[hits[index].division];
                        target = hits[index];
                        customEvent = this.getCustomEvent(event, target);
                        grid.trigger(layerName + '-layer-doubleclick', customEvent);

                    } else {
                        if (engine._selectionRect) {
                            engine.selectionRectComplete();
                            this.attachMouseMoveFunction(null);
                            return;
                        }
                        grid.trigger('grid-layer-doubleclick', event);
                    }
                    break;
                case 'drag':

                    if (!engine._selectionRect && this.dragIfPossible(event)) {
                        event.preventDefault();
                        return;
                    }
                    if (this._selectionRectMode) {
                        customEvent = this.getCustomEvent(event, target);
                        customEvent.downPoint = this.downPosition;
                        engine.createSelectionRect(customEvent);
                        event.preventDefault();
                        return;
                    }
                    customEvent = this.getCustomEvent(event, target);
                    customEvent.type = 'mousedrag';
                    if (grid.getGridMode() !== 'drawing') {
                        grid.trigger(layerName + '-layer-mousedrag', customEvent);
                    } else if (layerName === 'grid') {
                        grid.trigger('grid-graph-mousedrag', customEvent);
                    }
                    event.preventDefault();
                    break;
                case 'move':

                    if ((engine.getOperationMode() === 'select' || ['properties', 'iterate', 'iterateToDepth'].indexOf(curPopupShown) > -1) && this._clickTracker.downTime.length === 0) {
                        this.manageRollOverAndRollOut(event, mousePosition);
                    }
                    event.preventDefault();
                    break;
                case 'dragBegin':
                    hits = engine.checkHitTestForAllObjects(mousePosition, 'all', true, false);
                    if (hits && hits[0].equation) {

                        hits[0].equation.trigger('drag-begin', event.point, hits[0].equation, event);
                    }
                    break;

            }
            grid.refreshView();
        },
        "isScrollBarHit": function(hit) {
            return ['upper-scroll-btn', 'lower-scroll-btn', 'left-scroll-btn', 'right-scroll-btn', 'horizontal-scroll', 'vertical-scroll'].indexOf(hit.name) > -1;
        },
        "postRelocate": function(event, target) {
            var dx, dy, relocateDataObject, pointPosition;
            if (this.dragging && target.division === 'point' && target.getCreationMethod() !== 'pointOnObject') {
                pointPosition = this.engine.grid._getCanvasPointCoordinates(target.equation.getPoints()[0]);
                this.lastPosition.x = pointPosition[0];
                this.lastPosition.y = pointPosition[1];
            }
            dx = this.lastPosition.x - this.downPosition.x;
            dy = this.lastPosition.y - this.downPosition.y;
            relocateDataObject = MathUtilities.Components.Graph.Views.GridGraph.createRelocateDataObject();
            relocateDataObject.equation = target.equation;
            relocateDataObject.delX = this.engine.grid._getGridDistance([dx, 0])[0];
            relocateDataObject.delY = this.engine.grid._getGridDistance([0, dy])[1];
            relocateDataObject.position = [event.point.x, event.point.y];
            relocateDataObject.eventName = 'up';
            target.equation.trigger('post-relocate', relocateDataObject);
        },
        "manageRollOverAndRollOut": function(event, mousePosition) {
            var engine = this.engine,
                hits, curPopupShown,
                downTimeLength = this._clickTracker.downTime.length;

            curPopupShown = engine.dgtUI.model.dgtPopUpView.model.curPopupShown;

            if (engine.getOperationMode() === 'select' && downTimeLength === 0) {
                hits = engine.checkHitTestForAllObjects(mousePosition, 'all', true, false, true);
            } else if (engine.getOperationMode() === 'nonGeometricDrawing' && downTimeLength === 0) {
                hits = engine.checkHitTestForAllObjects(mousePosition, 'notations', true, false);
            } else if (['properties', 'iterate', 'iterateToDepth'].indexOf(curPopupShown) > -1 && downTimeLength === 0) {
                hits = engine.checkHitTestForAllObjects(mousePosition, 'popupOptions', true, false);
            }
            if (hits && this.currentRollOverShape && hits[0] !== this.currentRollOverShape || !hits && this.currentRollOverShape) {
                if (this.currentRollOverShape._incinerated === true || this.currentRollOverShape.properties && this.currentRollOverShape.properties.binaryInvisibility !== 0) {
                    this.currentRollOverShape = null;

                } else {
                    this.rollOutOfObjects(event, this.currentRollOverShape);
                }

            }
            if (hits && !this.currentRollOverShape) {
                this.rollOverOfObjects(event, hits);
            }
        },
        "rollOverOfObjects": function(event, hits) {
            this.currentRollOverShape = hits[0];
            if (['shape', 'point', 'interior', 'annotation'].indexOf(hits[0].division) > -1) {
                hits[0].equation.trigger('roll-over', hits[0].equation);
            } else if (['tl', 'tr', 'bl', 'br', 'rotate', 'move'].indexOf(hits[0].name) > -1 || this.isScrollBarHit(hits[0])) {
                hits[0].onMouseEnter();
            } else if (hits[0].division === 'notation') {
                hits[0].trigger('roll-over');
                this.engine.grid.refreshView();
            }
        },

        "rollOutOfObjects": function(event, hit) {
            if (['shape', 'point', 'interior', 'annotation'].indexOf(hit.division) > -1) {
                hit.equation.trigger('roll-out', hit.equation);
            } else if (['tl', 'tr', 'bl', 'br', 'rotate', 'move'].indexOf(hit.name) > -1 || this.isScrollBarHit(hit)) {
                hit.onMouseLeave();
            } else if (hit.division === 'notation') {
                hit.trigger('roll-out');
                this.engine.grid.refreshView();
            }
            this.currentRollOverShape = null;
        },
        "dragIfPossible": function(event) {
            var hits, index, target, mousePosition;
            if (this.engine.getOperationMode() !== 'select') {
                return null;
            }
            if (this.dragging) {
                this.dragTargetObject(event, this.dragging);
                return true;
            }
            mousePosition = [this.downPosition.x, this.downPosition.y];
            hits = this.engine.checkHitTestForAllObjects(mousePosition, 'all', false, false);
            if (hits) {
                index = this.getSelectedIndex(hits);
                if (typeof index !== 'undefined') {
                    target = hits[index];
                } else {

                    target = hits[0];
                }
                this.dragTargetObject(event, target);
                this.dragging = target;
                return true;
            }
            return false;
        },
        "notationPossible": function(entity) {
            if (entity.division === 'point' || entity.division === 'notation' || entity.division === 'shape' && ['parabola', 'hyperbola', 'ellipse'].indexOf(entity.species) === -1) {
                return true;
            }
        },
        "selectByDepth": function(hits, type, timeStamp) {
            var index, nextElement, engine = this.engine;
            if (hits) {
                index = this.getSelectedIndex(hits);
                if (typeof index !== 'undefined' && !this.selectedOnDown) {
                    engine._select(hits[index], null, timeStamp);
                    if (hits.length > 1) {
                        nextElement = hits[(index + 1) % hits.length];
                        if (nextElement._universe && nextElement.division !== 'measurement') {
                            nextElement = nextElement._universe;
                        }
                        if (engine.selected.indexOf(nextElement) === -1) {
                            engine._select(hits[(index + 1) % hits.length], null, timeStamp); // Select Next Element.
                        }
                    }
                }
            }
        },
        "getCustomEvent": function(event, target) {
            return {
                "point": event.point,
                "type": event.type,
                "target": target,
                "sessionTimestamp": event.sessionTimestamp
            };
        },
        "indexOfSelectedDwarfAHitObject": function(shapes, iterationObj) {
            var ctr, dwarfCount = 0,
                len;
            // Remove dwarfs of same iteration
            for (ctr = 0; ctr < shapes.length; ctr++) {
                if (shapes[ctr]._universe && shapes[ctr]._universe === iterationObj) {
                    if (dwarfCount === 0) {
                        dwarfCount = 1;
                        continue;
                    }
                    shapes.splice(ctr, 1);
                    ctr--;
                }
            }
            len = shapes.length;
            for (ctr = 0; ctr < len; ctr++) {
                if (shapes[ctr]._universe && shapes[ctr]._universe === iterationObj) {
                    return ctr;
                }
            }
        },
        "getSelectedIndex": function(shapes) {

            if (!shapes) {
                return null;
            }
            var looper, selected = this.engine.selected,
                index;
            for (looper = 0; looper < selected.length; looper++) {
                if (selected[looper].division === 'iteration') {
                    index = this.indexOfSelectedDwarfAHitObject(shapes, selected[looper]);
                } else {
                    index = shapes.indexOf(selected[looper]);
                }
                if (index > -1) {
                    return index;
                }
            }
        },
        "getMousePos": function(canvas, evt) {
            var rect = canvas[0].getBoundingClientRect();
            if (evt.point) {
                return evt.point;
            }
            if (typeof evt.clientX !== 'undefined') {
                return {
                    "x": evt.clientX - rect.left,
                    "y": evt.clientY - rect.top
                };
            }
            if (evt.changedTouches) {
                return {
                    "x": evt.changedTouches[0].clientX - rect.left,
                    "y": evt.changedTouches[0].clientY - rect.top
                };
            }
            if (evt.originalEvent) {
                return {
                    "x": evt.originalEvent.changedTouches[0].clientX - rect.left,
                    "y": evt.originalEvent.changedTouches[0].clientY - rect.top
                };
            }

        },
        "dragTargetObject": function(event, target, isNotationDrag) {
            var postDragDataObject, point = event.point,
                delX = point.x - this.lastPosition.x,
                delY = point.y - this.lastPosition.y,
                engine = this.engine;
            if (engine.selected.indexOf(engine._standardObjects.Xmirror) > -1 ||
                engine.selected.indexOf(engine._standardObjects.Ymirror) > -1) {
                engine.grid._panBy(delX, delY);
                this.lastPosition = point;
                this.selectedOnDown = true;
                return;
            }
            if (target.division === 'image') {
                engine.grid.trigger('image-layer-mousedrag', event, target.equation.getRaster());
                return;
            }
            postDragDataObject = MathUtilities.Components.Graph.Views.GridGraph.createPostDragDataObject();
            postDragDataObject.equation = target.equation;
            postDragDataObject.deltaX = delX;
            postDragDataObject.deltaY = delY;
            postDragDataObject.position = [point.x, point.y];
            postDragDataObject.eventName = 'drag';
            if (isNotationDrag) {
                target.equation.trigger('annotate-drag', postDragDataObject);

            } else {
                target.equation.trigger('post-drag', postDragDataObject);
            }
            this.lastPosition = point;
            this.selectedOnDown = true;
        },

        "stealNextMouseDown": function(func) {
            this._mouseDownSteal = func;
        },

        "attachMouseMoveFunction": function(func) {
            this.canvasMouseMoveFunction = func;
        }


    }, { //STATIC
        "EntityLayerMap": {
            "shape": "shape",
            "interior": "shape",
            "point": "point",
            "image": "image",
            "notation": "notation"
        }
    });


    /***************************************** Start Code for handling Touch and Type ******************************************************/
    window.window.tempNamespace = {};
    window.tempNamespace.DisableTouch = function(className) {
        if (className === document) {
            $(document).off('.simulateTouch');
        } else {
            $(className).each(function() {
                $(this).off('.simulateTouch');
            });
        }
    };

    /***************************************** End Code for handling Touch and Type ******************************************************/


})(window.MathUtilities);
