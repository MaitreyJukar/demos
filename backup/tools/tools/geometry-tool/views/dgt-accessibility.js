/*globals _, paper, $, window, geomFunctions, tinymce */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Views.DgtAccessibility = Backbone.View.extend({

        "initialize": function() {
            var DgtAccessibility = MathUtilities.Tools.Dgt.Views.DgtAccessibility,
                accManager = this.model.accManager;
            this.hoveredIndex = 0;
            this._previousArrowKeyDownCount = 0;
            this._currentArrowKeyDownCount = 0;
            this._lastArrowKeyUpEvent = null;
            this._keyUpInterval = null;
            this.focusRectEntity = null;
            this.keyDownEventsRef = _.bind(this.keyDownEvents, this);
            this.keyUpEventsRef = _.bind(this.keyUpEvents, this);
            this.keyDownEventsForPopupRef = _.bind(this.keyDownEventsForPopup, this);
            accManager.loadScreen('dgt-canvas');
            accManager.focusIn(DgtAccessibility.TITLE_DIV, _.bind(function() {
                if (tinymce && tinymce.activeEditor) {
                    tinymce.activeEditor.focus();
                    return false;
                }
                if (this.switchDivForJaws) {
                    return false;
                }
                this.hoveredIndex = -1;
            }, this));

            accManager.focusIn('math-tool-screenshot-btn-icon-8', _.bind(function() { // Focus should not go outside the text tool when it is open.
                if (tinymce && tinymce.activeEditor) {
                    tinymce.activeEditor.focus();
                    return false;
                }
            }, this));

            accManager.focusIn(DgtAccessibility.MENU_DIV, _.bind(function() {
                if (this.switchDivForJaws) {
                    return false;
                }
                this.hoveredIndex = this.model.allEntities.length;
            }, this));
            accManager.focusIn('canvas-event-listener', _.bind(function() {
                if (this.switchDivForJaws) {
                    return false;
                }
                this.model.dgtUI.$el.off('keydown', this.keyDownEventsRef).on('keydown', this.keyDownEventsRef)
                    .off('keyup', this.keyUpEventsRef, this).on('keyup', this.keyUpEventsRef);
                if (this.shiftToProperty) {
                    this.shiftToProperty = false;
                    return void 0;
                }
                if (!this.model._undergoingOperation) {
                    if (this.hoveredIndex <= 0) {
                        if (!this.hoverNextEntity()) {
                            this.hoveredIndex++;
                            accManager.setFocus(DgtAccessibility.MENU_DIV);
                        }
                    } else {
                        if (!this.hoverNextEntity(true)) {
                            this.hoveredIndex--;
                            accManager.setFocus(DgtAccessibility.TITLE_DIV);
                        }
                    }
                }
            }, this));
            accManager.focusOut('canvas-event-listener', _.bind(function() {
                var model = this.model;
                if (this.switchDivForJaws) {
                    return;
                }
                model.accManager.setAccMessage('canvas-event-listener', ''); // setting blank acc message.
                if (this.focusRect) {
                    this.removeFocusRect();
                    this.focusRectEntity = null;
                    model.grid.refreshView();
                }
                if (this.rolledOver) {
                    this.removeHoverState(this.rolledOver);
                }
                model.dgtUI.$el.off('keydown', this.keyDownEventsRef)
                    .off('keyup', this.keyUpEventsRef);
                if (this.shiftToProperty) {
                    return;
                }
                this.entityArray = model.allEntities;
                this.digIn = null;
                this.handleHovered = null;
            }, this));
            this.keyDownData = {};
            this.keyUpData = {};
            this.focusRect = null;
            this.dragDistance = 6;
            this.digIn = null;
            this.handleHovered = null;
            this.entityArray = this.model.allEntities;
            this.imageDown = null;
        },
        "shiftFromPopupToCanvas": function(type) {
            var dgtUI = this.model.dgtUI;
            this.model.accManager.setFocus('dgt-acc-shift'); // dgt-acc-shift is temp div.
            dgtUI.$el.off('keydown', this.keyDownEventsForPopupRef).on('keydown', this.keyDownEventsForPopupRef);
            this.hoveredIndex = -1;
            this.eventsForPopup = type;
            this.keyDownEventsForPopup({
                "which": dgtUI.model.keyCodeMap.SPECIAL_KEY_TAB
            });
            return false;
        },
        "keyDownEventsForPopup": function(event) {
            var keyCode = event.which || event.keyCode || event.charCode,
                entityArray = this.eventsForPopup === 'iterate' ? this.model.allEntities : this.model.measures,
                returnToPopup,
                dgtUI = this.model.dgtUI,
                incrementFactor = 1,
                curEntity,
                keyCodeMap = dgtUI.model.keyCodeMap;
            if (!this.eventsForPopup) {
                return void 0;
            }
            returnToPopup = _.bind(function() {
                dgtUI.$el.off('keydown', this.keyDownEventsForPopupRef);
                if (this.eventsForPopup === 'iterate') {
                    dgtUI.$('.red-border').removeClass('red-border');
                    if (this.rolledOver) {
                        this.rolledOver.equation.trigger('roll-out', this.rolledOver.equation);
                        this.rolledOver = null;
                    }
                    this.model.trigger('shift-focus-to-mappy');
                } else if (this.eventsForPopup === 'calculate') {
                    dgtUI.$('.red-border').trigger('mouseleave');
                    this.model.trigger('shift-focus-to-calculate');
                }
                this.eventsForPopup = null;
            }, this);
            switch (keyCode) {
                case keyCodeMap.SPECIAL_KEY_TAB:
                    if (this.rolledOver) {
                        this.rolledOver.equation.trigger('roll-out', this.rolledOver.equation);
                        this.rolledOver = null;
                    }
                    if (event.shiftKey) {
                        incrementFactor = -1;
                    }
                    this.hoveredIndex += incrementFactor;
                    curEntity = entityArray[this.hoveredIndex];
                    if (this.eventsForPopup !== 'iterate') {
                        while (curEntity && (curEntity.properties.binaryInvisibility || curEntity._incinerated || curEntity.isMeasurementAttribute())) {
                            this.hoveredIndex += incrementFactor;
                            curEntity = entityArray[this.hoveredIndex];
                        }
                    } else {
                        while (curEntity && this.hoveredIndex < entityArray.length && !this.model.selectionSteal.isValidSelection(curEntity)) {
                            this.hoveredIndex += incrementFactor;
                            curEntity = entityArray[this.hoveredIndex];
                        }
                    }
                    if (this.hoveredIndex === entityArray.length || this.hoveredIndex === -1) {
                        returnToPopup();
                        return false;
                    }
                    if (curEntity.division === 'measurement') {
                        if (this.eventsForPopup === 'iterate') {
                            dgtUI.$('.red-border').removeClass('red-border');
                            curEntity.$measureView.addClass('red-border');
                        } else {
                            dgtUI.$('.red-border').trigger('mouseleave');
                            curEntity.$measureView.trigger('mouseover');
                        }
                    } else {
                        curEntity.equation.trigger('roll-over', curEntity.equation);
                        this.rolledOver = curEntity;

                    }
                    this.setMessageForAccDiv(this.eventsForPopup + '-entity-hover', [this.getAccForEntity(curEntity)]);
                    return false;
                case keyCodeMap.ALPHABET_X:
                    if (event.shiftKey) {
                        returnToPopup();
                    }
                    return false;
                case keyCodeMap.SPECIAL_KEY_ENTER:
                case keyCodeMap.SPECIAL_KEY_SPACE:
                    curEntity = entityArray[this.hoveredIndex];
                    if (curEntity) {
                        if (curEntity.division === 'measurement') {
                            curEntity.$measureView.trigger('mousedown', event);
                        } else {
                            this.model._select(curEntity);
                        }
                        returnToPopup();
                    }
                    return false;

            }
        },
        "keyDownEvents": function(event) {
            var keyCode = event.which || event.keyCode || event.charCode,
                point, translation, entity, layerName, operation,
                keyCodeMap = this.model.dgtUI.model.keyCodeMap,
                angle,
                centerInCanvas, selected,
                DgtAccessibility = MathUtilities.Tools.Dgt.Views.DgtAccessibility,
                engine = this.model,
                ROTATION_ANGLE = 10,
                grid = engine.grid,
                transformationView, transformationView1,
                nextPoint, measurePosition,
                curPosition, dummyEvent, moveHitPosition,
                distance,
                curPositionGrid,
                onScheduledPointCreated;
            if (engine._undergoingOperation) { //Operation Mode
                point = engine._unsettledPoint || engine.dummyPoint;
                distance = grid.getAttribute().graphParameters.currentDistanceBetweenTwoVerticalLines;
                if (point) {
                    curPositionGrid = point.equation.getPoints()[0];
                    curPosition = grid._getCanvasPointCoordinates(curPositionGrid);
                }
                switch (keyCode) {
                    case keyCodeMap.ALPHABET_X:
                        if (event.shiftKey) {
                            this.shiftFromCanvasToProperty();
                        }
                        break;
                    case keyCodeMap.SPECIAL_KEY_LEFT_ARROW:
                    case keyCodeMap.SPECIAL_KEY_UP_ARROW:
                    case keyCodeMap.SPECIAL_KEY_RIGHT_ARROW:
                    case keyCodeMap.SPECIAL_KEY_DOWN_ARROW:
                        translation = this.getTranslationFactor(keyCode, curPosition);
                        engine.createPointMove({
                            "point": {
                                "x": curPosition[0] + translation[0],
                                "y": curPosition[1] + translation[1]
                            }
                        });
                        this.handleArrowUpTrigger();
                        return false;
                    case keyCodeMap.SPECIAL_KEY_SPACE:
                    case keyCodeMap.SPECIAL_KEY_ENTER:
                        onScheduledPointCreated = function() {
                            if (MathUtilities.Tools.Dgt.Models.DgtUiModel.fromKeyEvent) {
                                engine.createPointMove(dummyEvent);
                            }
                            engine.off('scheduledPointCreated', onScheduledPointCreated);
                        };
                        operation = engine._undergoingOperation;
                        if (keyCode === keyCodeMap.SPECIAL_KEY_ENTER && operation.agents.length === 1 &&
                            MathUtilities.Tools.Dgt.Models.DgtOperation.isAPredefinedShape(operation.operationRelationType) && point) {
                            grid.trigger('grid-layer-doubleclick', {
                                "point": {
                                    "x": curPosition[0],
                                    "y": curPosition[1]
                                },
                                "target": engine._undergoingOperation._substitutePoint || point
                            });
                            return false;
                        }
                        if (point) {
                            grid.trigger('point-layer-mousedown', {
                                "point": {
                                    "x": curPosition[0],
                                    "y": curPosition[1]
                                },
                                "target": engine._undergoingOperation._substitutePoint || point
                            });
                            nextPoint = this.getRandomPointInVicinity(curPosition[0], curPosition[1], distance);
                            dummyEvent = {
                                "point": {
                                    "x": nextPoint[0],
                                    "y": nextPoint[1]
                                }
                            };
                        }
                        if (engine._undergoingOperation.directive === 'drawPoint') {
                            // create Point directly instead of on mouse move for accessibility.
                            engine.createPointMove(dummyEvent);
                        } else {
                            // change position of point after it is created to make the shape visible.
                            engine.on('scheduledPointCreated', onScheduledPointCreated);
                        }
                        if (curPositionGrid) {
                            this.setMessageForAccDiv('point-placed', [
                                [curPositionGrid[0].toFixed(2), curPositionGrid[1].toFixed(2)]
                            ]);
                        }
                        return false;
                    case keyCodeMap.SPECIAL_KEY_TAB:
                        if (point) {
                            point.equation.setPoints([
                                [0, 0]
                            ]);
                        }
                        return false;
                }
            } else { //selection Mode
                switch (keyCode) {
                    case keyCodeMap.ALPHABET_X:
                        if (event.shiftKey) {
                            this.shiftFromCanvasToProperty(); // Hotkey = shift + X
                        }
                        break;
                    case keyCodeMap.SPECIAL_KEY_TAB:
                        if (event.shiftKey) {
                            if (!this.hoverNextEntity(true)) { // Reached first element go To previous Div.
                                this.hoveredIndex = -1;
                                engine.accManager.setFocus(DgtAccessibility.TITLE_DIV);
                            }
                        } else {
                            if (!this.hoverNextEntity()) { // Reached Last element go To next Div.
                                this.hoveredIndex++;
                                engine.accManager.setFocus(DgtAccessibility.MENU_DIV);
                            }
                        }
                        return false;
                    case keyCodeMap.SPECIAL_KEY_SPACE:
                    case keyCodeMap.SPECIAL_KEY_ENTER:
                        selected = engine.selected;
                        if (event.shiftKey) {
                            if (!this.digIn) {
                                this.digInEntity();
                            }
                        } else {
                            entity = engine.allEntities[this.hoveredIndex];

                            if (this.isDoubleClickPossible(entity) && keyCode === keyCodeMap.SPECIAL_KEY_ENTER) {
                                if (entity.species === 'text') {
                                    if (selected.indexOf(entity) === -1) {
                                        engine._select(entity);
                                    }
                                    transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope,
                                        engine, entity.equation.getRaster());
                                    transformationView._onDoubleClick({});
                                    this.removeFocusRect();
                                    if (this.focusRectEntity === entity) {
                                        this.focusRectEntity = null;
                                    }
                                } else if (entity.division === 'measurement') {
                                    entity.$measureView.find('.dgt-measurement').trigger('dblclick');
                                    this.removeHoverState(entity);
                                } else {
                                    layerName = entity.division;
                                    grid.trigger(layerName + '-layer-doubleclick', {
                                        "target": entity
                                    });
                                    if (!this.hoverNextEntity()) { //Giving focus to next entity
                                        this.hoveredIndex++;
                                        engine.accManager.setFocus(DgtAccessibility.MENU_DIV);
                                    }
                                }
                            } else {
                                engine._select(entity);
                                this.setMessageForAccDiv('entity-selected', [this.getAccForEntity(entity), selected.indexOf(entity) > -1 ? 'Selected' : 'Deselected']);
                            }
                        }
                        return false;
                    case keyCodeMap.SPECIAL_KEY_LEFT_ARROW:
                    case keyCodeMap.SPECIAL_KEY_UP_ARROW:
                    case keyCodeMap.SPECIAL_KEY_RIGHT_ARROW:
                    case keyCodeMap.SPECIAL_KEY_DOWN_ARROW:
                        if (this.handleHovered) {
                            entity = this.digIn;
                            transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope,
                                engine, entity.equation.getRaster());
                            if (this.handleHovered === 'rotate') {
                                if (keyCode === keyCodeMap.SPECIAL_KEY_LEFT_ARROW) {
                                    angle = -ROTATION_ANGLE;
                                } else if (keyCode === keyCodeMap.SPECIAL_KEY_RIGHT_ARROW) {
                                    angle = ROTATION_ANGLE;
                                } else {
                                    return void 0;
                                }
                                transformationView.model.movingTarget = transformationView._rotationPoint;
                                curPosition = transformationView._rotationPoint.position;
                                centerInCanvas = grid._getCanvasPointCoordinates([entity.x, entity.y]);
                                nextPoint = geomFunctions.rotatePoint(curPosition.x, curPosition.y, centerInCanvas[0], centerInCanvas[1], angle, true);
                                dummyEvent = {
                                    "point": {
                                        "x": nextPoint[0],
                                        "y": nextPoint[1]
                                    }
                                };
                            } else {
                                transformationView.model.movingTarget = transformationView._br;
                                transformationView._calculatePositions();
                                curPosition = transformationView.model.movingTarget.position;
                                nextPoint = this.getTranslationFactor(keyCode);
                                dummyEvent = {
                                    "point": {
                                        "x": curPosition.x + nextPoint[0],
                                        "y": curPosition.y + nextPoint[1]
                                    }
                                };
                            }
                            transformationView.trigger('transformation-resized', dummyEvent);
                            this.focusRect.position = transformationView.model.movingTarget.position;

                        } else if (engine.selected.length > 0) {
                            entity = engine.selected[0];
                            if (entity.division === 'iteration') {
                                entity = this.replaceIterateEntity(entity);
                                if (!entity) {
                                    return;
                                }
                            }
                            if (entity.division === 'measurement' && !entity.properties.locked) {
                                measurePosition = entity.$measureView.position();
                                entity.dragging = true;
                                nextPoint = this.getTranslationFactor(keyCode);
                                measurePosition.top += nextPoint[1];
                                measurePosition.left += nextPoint[0];
                                entity.$measureView.css({
                                    "top": measurePosition.top,
                                    "left": measurePosition.left
                                });
                            } else if (entity.division === 'image') {
                                if (entity.properties.locked) {
                                    return false;
                                }
                                nextPoint = this.getTranslationFactor(keyCode);
                                if (engine.selected.indexOf(engine._standardObjects.Xmirror) > -1 || engine.selected.indexOf(engine._standardObjects.Ymirror) > -1) {
                                    grid._panBy(nextPoint[0], nextPoint[1]);

                                } else {
                                    transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope,
                                        engine, entity.equation.getRaster());
                                    if (transformationView.model.movingTarget !== transformationView._moveHit) {
                                        transformationView.model.movingTarget = transformationView._moveHit;
                                        transformationView._calculatePositions();
                                    }
                                    moveHitPosition = transformationView._moveHit.position;
                                    dummyEvent = {
                                        "point": {
                                            "x": moveHitPosition.x,
                                            "y": moveHitPosition.y
                                        }
                                    };
                                    transformationView._recordTranslation(dummyEvent.point);
                                    dummyEvent = {
                                        "point": {
                                            "x": transformationView._moveHit.position.x + nextPoint[0],
                                            "y": transformationView._moveHit.position.y + nextPoint[1]
                                        }
                                    };
                                    transformationView.trigger('transformation-resized', dummyEvent);
                                    if (entity === this.focusRectEntity) {
                                        this.focusRect.position = transformationView.model.movingTarget.position;
                                    }
                                }
                            } else {
                                if (!this.keyDownData.position) {
                                    this.keyDownData.key = keyCode;
                                    this.keyDownData.position = entity.equation.getPoints() ? entity.equation.getPoints()[0] : [entity.seed.x1, entity.seed.y1];
                                }
                                curPosition = grid._getCanvasPointCoordinates(entity.equation.getPoints() ? entity.equation.getPoints()[0] : [entity.seed.x1, entity.seed.y1]);
                                this.dragTargetObject(this.getTranslationFactor(keyCode, curPosition));
                            }
                            if (engine.selected.indexOf(this.focusRectEntity) > -1) {
                                transformationView1 = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope,
                                    engine, this.focusRectEntity.equation.getRaster());
                                transformationView1.model.movingTarget = transformationView1._moveHit;
                                this.focusRect.position = transformationView1.model.movingTarget.position;
                            }
                        }
                        grid.refreshView();
                        this.handleArrowUpTrigger();
                        return false;
                }
            }
        },
        "deselectAllTriggered": function() {
            this.removeFocusRect();
            this.focusRectEntity = null;
            this.model.dgtUI.$('.dotted-border').removeClass('dotted-border');
        },
        "keyUpEvents": function(event) {
            var keyCode = event.which || event.keyCode || event.charCode,
                keyCodeMap = this.model.dgtUI.model.keyCodeMap;
            if ([keyCodeMap.SPECIAL_KEY_LEFT_ARROW, keyCodeMap.SPECIAL_KEY_UP_ARROW, keyCodeMap.SPECIAL_KEY_RIGHT_ARROW,
                    keyCodeMap.SPECIAL_KEY_DOWN_ARROW
                ].indexOf(keyCode) > -1) {
                this._lastArrowKeyUpEvent = event;
                return false;
            }
        },
        "_handleArrowKeyUp": function(event) {
            var point,
                engine = this.model,
                selected = engine.selected,
                entity, transformationView, dummyEvent,
                keyCode = event.which || event.keyCode || event.charCode;
            if (engine._undergoingOperation) {
                entity = engine._unsettledPoint || engine.dummyPoint;
                if (entity && engine.grid.isSnapToGridEnabled()) {
                    point = entity.equation.getPoints()[0];
                    this.setMessageForAccDiv('point-coordinate', [
                        [point[0].toFixed(2), point[1].toFixed(2)]
                    ]);
                }
                return false;
            }
            if (selected[0] && selected[0].division === 'measurement') {
                selected[0].$measureView.trigger('dragstop', {
                    "target": selected[0].$measureView
                });
            } else if (this.handleHovered || selected[0] && selected[0].division === 'image') {
                entity = this.digIn || selected[0];
                transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope,
                    this.model, entity.equation.getRaster());
                dummyEvent = {
                    "point": {
                        "x": entity.x,
                        "y": entity.y
                    }
                };
                transformationView.trigger('transformation-mouseup', dummyEvent);

            } else {
                entity = selected[0];
                if (entity && entity.division === 'iteration') {
                    entity = this.replaceIterateEntity(entity);
                    if (!entity) {
                        return;
                    }
                }
                if (entity && this.keyDownData.position && this.keyDownData.key === keyCode) {
                    this.keyUpData.position = entity.equation.getPoints() ? entity.equation.getPoints()[0] : [entity.seed.x1, entity.seed.y1];
                    this.postRelocate(entity);
                    this.setMessageForAccDiv('post-relocate', [
                        [(this.keyUpData.position[0] - this.keyDownData.position[0]).toFixed(1), (this.keyUpData.position[1] - this.keyDownData.position[1]).toFixed(1)]
                    ]);
                    this.keyDownData.position = null;
                    this.keyDownData.key = null;
                }
                engine.grid.updateVisibleDomain();
            }
        },
        "handleArrowUpTrigger": function() {
            var KEY_UP_TIMER = 300;
            this._previousArrowKeyDownCount = this._currentArrowKeyDownCount;
            this._currentArrowKeyDownCount++;
            if (this._previousArrowKeyDownCount === 0) {
                if (this._keyUpInterval) {
                    window.clearInterval(this._keyUpInterval);
                }
                this._keyUpInterval = window.setInterval(_.bind(function() {
                    if (this._previousArrowKeyDownCount === this._currentArrowKeyDownCount) {
                        window.clearInterval(this._keyUpInterval);
                        this._keyUpInterval = null;
                        this._previousArrowKeyDownCount = 0;
                        this._currentArrowKeyDownCount = 0;
                        this._handleArrowKeyUp(this._lastArrowKeyUpEvent);
                        this._lastArrowKeyUpEvent = null;
                    } else {
                        if (this._lastArrowKeyUpEvent) {
                            this._previousArrowKeyDownCount = this._currentArrowKeyDownCount;
                        }
                    }
                }, this), KEY_UP_TIMER);
            }
        },
        "replaceIterateEntity": function(entity) {
            if (entity.points && entity.points[0]) {
                return entity.points[0]; // Assigning 1st point of iteration as entity.
            }
            if (entity._childrenRelationships && entity._childrenRelationships.length) {
                return entity._childrenRelationships[0].offspring;
            }
        },
        "isDoubleClickPossible": function(entity) {
            return entity.division === 'point' || ['segment', 'ray', 'line', 'text', 'calculation', 'parameter'].indexOf(entity.species) > -1;
        },

        "getRandomPointInVicinity": function(x, y, dist) {

            var angle = Math.random() * 358 + 1, // finding random value for angle
                grid = this.model.grid,
                distance = grid.getAttribute().graphParameters.currentDistanceBetweenTwoHorizontalLines;
            return grid.isSnapToGridEnabled() ? grid.getClosestCanvasPoint([x + distance, y]) : geomFunctions.rotatePoint(x + dist, y, x, y, angle, true);
        },

        "postRelocate": function(target) {
            var dx, dy, relocateDataObject, pointPosition, grid = this.model.grid,
                pointGridPosition;
            pointGridPosition = target.equation.getPoints() ? target.equation.getPoints()[0] : [target.seed.x1, target.seed.y1];
            if (this.dragging && target.division === 'point' && target.getCreationMethod() !== 'pointOnObject') {
                pointPosition = grid._getCanvasPointCoordinates(pointGridPosition);
                this.lastPosition.x = pointPosition[0];
                this.lastPosition.y = pointPosition[1];
            }
            dx = this.keyUpData.position[0] - this.keyDownData.position[0];
            dy = this.keyUpData.position[1] - this.keyDownData.position[1];
            relocateDataObject = MathUtilities.Components.Graph.Views.GridGraph.createRelocateDataObject();
            relocateDataObject.equation = target.equation;
            relocateDataObject.delX = dx;
            relocateDataObject.delY = dy;
            relocateDataObject.position = grid._getCanvasPointCoordinates(pointGridPosition);
            relocateDataObject.eventName = 'up';
            target.equation.trigger('post-relocate', relocateDataObject);
        },
        "dragTargetObject": function(translation, object) {
            if (this.model.selected.length === 0 && !object) {
                return;
            }
            var postDragDataObject, dx = translation[0],
                gridPosition,
                position,
                engine = this.model,
                dy = translation[1];
            object = object || engine.selected[0];
            if (object.division === 'iteration') {
                object = this.replaceIterateEntity(object);
                if (!object) {
                    return;
                }
            }
            gridPosition = object.equation.getPoints() ? object.equation.getPoints()[0] : [object.seed.x1, object.seed.x2];
            position = engine.grid._getCanvasPointCoordinates(gridPosition);
            position[0] += dx;
            position[1] += dy;
            postDragDataObject = MathUtilities.Components.Graph.Views.GridGraph.createPostDragDataObject();
            postDragDataObject.equation = object.equation;
            postDragDataObject.deltaX = dx;
            postDragDataObject.deltaY = dy;
            postDragDataObject.position = position;
            postDragDataObject.eventName = 'drag';
            object.equation.trigger('post-drag', postDragDataObject);
        },

        "createAccText": function(text, replace) {
            var str = MathUtilities.Tools.Dgt.Models.DgtUiModel.canvasAccText[text],
                prevStr, curStr,
                DgtStatusMessage = MathUtilities.Tools.Dgt.Models.DgtStatusMessage;
            if (replace) {
                replace.unshift(str);
                curStr = DgtStatusMessage.replaceWords.apply(DgtStatusMessage, replace);
            } else {
                curStr = str;
            }
            prevStr = this.model.dgtUI.$('#canvas-event-listener').text();
            if (prevStr === curStr) {
                curStr += ' ';
            }
            this.model.accManager.setAccMessage('canvas-event-listener', curStr);
        },
        "hoverNextEntity": function(reverse) {
            if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) { // No focus on touch device
                return false;
            }
            var curEntity,
                pos, width, height, raster,
                engine = this.model,
                TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView,
                tl, tr, bl, br, bounds, matrix,
                factor = reverse ? -1 : 1;
            if (this.digIn && (this.hoveredIndex === 0 && reverse || this.hoveredIndex === this.entityArray.length - 1 && !reverse)) {
                this.entityArray = engine.allEntities;
                this.hoveredIndex = this.entityArray.indexOf(this.digIn);
                this.digIn = null;
                this.handleHovered = null;
            }
            if (this.digIn && this.digIn.division === 'image') {
                this.hoveredIndex += factor;
                this.hoverImageHandles(this.digIn, this.hoveredIndex, reverse);
                return true;
            }
            this.removeHoverState(this.entityArray[this.hoveredIndex]);
            do {
                if (!this.digIn && (this.hoveredIndex <= 0 && reverse || this.hoveredIndex >= engine.allEntities.length - 1 && !reverse)) {
                    return false;
                }
                this.hoveredIndex += factor;
                curEntity = this.entityArray[this.hoveredIndex];
            } while (curEntity.properties.binaryInvisibility !== 0 || curEntity._incinerated);
            if (curEntity.species === 'iteration') {
                curEntity = this.replaceIterateEntity(curEntity);
                if (!curEntity) {
                    return;
                }
            }
            if (curEntity.division === 'measurement') {
                curEntity.$measureView.addClass('dotted-border');
            } else if (curEntity.division === 'image') {
                raster = curEntity.equation.getRaster();
                if (raster) {
                    bounds = raster.size;
                    width = bounds.width;
                    height = bounds.height;
                    matrix = curEntity.matrix;
                    tl = TransformationGridView.getPrimePointCoordinates({
                        "x": -width / 2,
                        "y": -height / 2
                    }, matrix);
                    tr = TransformationGridView.getPrimePointCoordinates({
                        "x": width / 2,
                        "y": -height / 2
                    }, matrix);
                    bl = TransformationGridView.getPrimePointCoordinates({
                        "x": -width / 2,
                        "y": height / 2
                    }, matrix);
                    br = TransformationGridView.getPrimePointCoordinates({
                        "x": width / 2,
                        "y": height / 2
                    }, matrix);
                    this.focusRectEntity = curEntity;
                    this.createFocusRect([tl, tr, br, bl]);
                    pos = engine.grid._getCanvasPointCoordinates([curEntity.x, curEntity.y]);
                    this.focusRect.position.x = pos[0];
                    this.focusRect.position.y = pos[1];
                    engine.grid.refreshView();
                } else {
                    this.model.accManager.setFocus(MathUtilities.Tools.Dgt.Views.DgtAccessibility.MENU_DIV);
                }
            } else {
                curEntity.equation.trigger('roll-over', curEntity.equation);
            }
            this.rolledOver = curEntity;
            if (curEntity.division === 'measurement') {
                if (curEntity.species === 'measureIteration') {
                    this.setMessageForAccDiv('entity-hovered', [this.getAccForEntity(curEntity)]);
                } else {
                    this.setMessageForAccDiv('measure-hovered', [this.getAccForEntity(curEntity), curEntity.getDisplayedValueAsString()]);
                }
            } else {
                this.setMessageForAccDiv('entity-hovered', [this.getAccForEntity(curEntity)]);
            }
            return true;
        },
        "setMessageForAccDiv": function(str, replace) {
            this.switchDivForJaws = true;
            this.model.accManager.setFocus('dgt-acc-text');
            this.createAccText(str, replace);
            this.model.accManager.setFocus('canvas-event-listener');
            _.delay(_.bind(function() {
                this.switchDivForJaws = false;
            }, this), 0);
        },
        "hoverEntity": function(entity) {
            if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) { // NO focus on touch device
                return false;
            }
            var index = this.entityArray.indexOf(entity);
            if (index > -1) {
                this.removeHoverState(this.entityArray[this.hoveredIndex]);
                this.entityArray = this.model.allEntities;
                this.hoveredIndex = index - 1;
                this.hoverNextEntity();
                this.shiftToProperty = true;
                this.setFocusToCanvas();
            }
        },
        "hoverImageHandles": function(entity, index, reverse) {
            var transformationView, engine = this.model,
                scaleFactor = 1.5,
                bounds;
            if (engine.selected.indexOf(entity) === -1) {
                engine._select(entity);
            }
            transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope,
                engine, entity.equation.getRaster());
            if (index === 1 && !reverse || entity.species === 'text') {
                bounds = transformationView._rotationPoint.bounds;
                this.handleHovered = 'rotate';
            } else {
                bounds = transformationView._br.bounds;
                this.handleHovered = 'resize';
            }
            this.createFocusRect([bounds.topLeft, bounds.topRight, bounds.bottomRight, bounds.bottomLeft]);
            this.focusRect.scale(scaleFactor);
            this.focusRect.rotate(entity.matrix.rotation);
            this.setMessageForAccDiv(this.handleHovered + '-handle-hovered');
            engine.grid.refreshView();
        },
        "digInEntity": function() {
            var entity = this.entityArray[this.hoveredIndex],
                creator = entity.creator,
                equation = entity.equation;
            this.digIn = entity;
            if (entity.division === 'image') {
                if (entity.properties.locked) {
                    return;
                }
                this.hoverImageHandles(entity, 0);
                if (entity.species === 'text') {
                    this.entityArray = ['rotate'];
                } else {
                    this.entityArray = ['resize', 'rotate'];
                }
                this.hoveredIndex = 0;
                return;
            }
            if (creator && creator.sources.length > 0) {
                this.hoveredIndex = -1;
                this.entityArray = creator.sources;
            }
            equation.trigger('roll-out', equation);
            this.hoverNextEntity();
        },
        "getTranslationFactor": function(keyCode, curPosition) {
            var distX, distY, engine = this.model,
                grid = engine.grid,
                keyCodeMap = engine.dgtUI.model.keyCodeMap,
                graphParameters, graphDisplayValues,
                gridPosition, closerPoints, len,
                counter, isSnapped, canvasCoords,
                graphType = grid.getGraphType(),
                origin, canvas, canvasWidth, canvasHeight,
                rotationAngle, isReverse, isDegree = true,
                translatedPoint = [],
                closestGridPosition,
                rotatedPoint, distance,
                firstEndPoint, secondEndPoint,
                angle, translationFactor = [0, 0],
                THRESHOLD = 10e-10,
                xDist, yDist;

            if (grid.isSnapToGridEnabled() && curPosition) {

                graphDisplayValues = grid.getAttribute('._graphDisplayValues');
                graphParameters = graphDisplayValues.graphParameters;

                /* vertical and horizontal distance between gridLines */
                distX = graphParameters.currentDistanceBetweenTwoVerticalLines;
                distY = graphParameters.currentDistanceBetweenTwoHorizontalLines;

                gridPosition = grid._getGraphPointCoordinates(curPosition);
                closestGridPosition = grid.getClosestGridPoint(gridPosition);

                /* all closest grid points */
                closerPoints = grid.getCloserGraphPoints(gridPosition);
                len = closerPoints.length;

                for (counter = 0; counter < len; counter++) {
                    if (closerPoints[counter][0] === closestGridPosition[0] && closerPoints[counter][1] === closestGridPosition[1]) {
                        isSnapped = true;
                        break;
                    }
                }

                /* if current point is not snapped then select any one closerPoint
                and find its translationFactor */
                if (!isSnapped) {
                    canvasCoords = grid._getCanvasPointCoordinates(closerPoints[0]);
                    canvasCoords = grid.getClosestCanvasPoint(canvasCoords);
                    translationFactor[0] = canvasCoords[0] - curPosition[0];
                    translationFactor[1] = canvasCoords[1] - curPosition[1];
                    return translationFactor;
                }

                if (graphType === 'polar-graph') {

                    origin = graphDisplayValues.graphOrigin.currentOrigin;

                    canvas = grid._canvasSize;
                    canvasWidth = canvas.width;
                    canvasHeight = canvas.height;

                    /*rotationAngle is angle  between two grid lines*/
                    if (origin.x < canvasWidth && origin.x > 0 && origin.y < canvasHeight && origin.y > 0) {
                        rotationAngle = 15;
                    } else {
                        rotationAngle = 5;
                    }

                    /* angle of curPosition with respect to x-axis*/
                    angle = Math.atan2(gridPosition[1], gridPosition[0]);
                }
            } else {
                distX = distY = this.dragDistance;
            }
            if (grid.getGraphType() === 'polar-graph' && grid.isSnapToGridEnabled() && curPosition) {
                xDist = Math.abs(curPosition[0] - origin.x);
                yDist = Math.abs(curPosition[1] - origin.y);
                switch (keyCode) {
                    case keyCodeMap.SPECIAL_KEY_LEFT_ARROW:
                        if (xDist <= THRESHOLD && yDist <= THRESHOLD || yDist <= THRESHOLD) {
                            /* if point is at origin or point is on x-axis */
                            translationFactor[0] -= distY;
                            translationFactor[1] += 0;
                        } else if (Math.abs(xDist) <= THRESHOLD) {
                            /* if point is on y-axis */
                            isReverse = gridPosition[1] > 0 ? false : true;
                            translationFactor = this.calculateTranslationValue(gridPosition, curPosition, rotationAngle, isDegree, isReverse);
                        } else {
                            isReverse = angle > 0 ? false : true;
                            translationFactor = this.calculateTranslationValue(gridPosition, curPosition, rotationAngle, isDegree, isReverse);
                        }
                        break;
                    case keyCodeMap.SPECIAL_KEY_RIGHT_ARROW:
                        if (xDist <= THRESHOLD && yDist <= THRESHOLD || yDist <= THRESHOLD) {
                            /* if point is at origin or point is on x-axis */
                            translationFactor[0] += distY;
                            translationFactor[1] += 0;
                        } else if (xDist <= THRESHOLD) {
                            /* point is on y-axis */
                            isReverse = gridPosition[1] > 0 ? true : false;
                            translationFactor = this.calculateTranslationValue(gridPosition, curPosition, rotationAngle, isDegree, isReverse);
                        } else {
                            isReverse = angle > 0 ? true : false;
                            translationFactor = this.calculateTranslationValue(gridPosition, curPosition, rotationAngle, isDegree, isReverse);
                        }
                        break;
                    case keyCodeMap.SPECIAL_KEY_UP_ARROW:
                        if (xDist <= THRESHOLD && yDist <= THRESHOLD || xDist <= THRESHOLD) {
                            /* if point is at origin or y-axis */
                            translationFactor[0] += 0;
                            translationFactor[1] -= distY;
                        } else if (yDist <= THRESHOLD) {
                            /* if point is on x-axis */
                            isReverse = gridPosition[0] > 0 ? false : true;
                            translationFactor = this.calculateTranslationValue(gridPosition, curPosition, rotationAngle, isDegree, isReverse);
                        } else {
                            firstEndPoint = origin;
                            secondEndPoint = {
                                "x": curPosition[0],
                                "y": curPosition[1]
                            };
                            distance = geomFunctions.distance(firstEndPoint, secondEndPoint);
                            gridPosition = grid._getGraphPointCoordinates(curPosition);
                            distance = angle < 0 ? distance - distX : distance + distX;
                            translatedPoint = geomFunctions.findSegmentPointAtADistance(firstEndPoint, secondEndPoint, distance);
                            translationFactor[0] = translatedPoint[0] - curPosition[0];
                            translationFactor[1] = translatedPoint[1] - curPosition[1];
                        }
                        break;
                    case keyCodeMap.SPECIAL_KEY_DOWN_ARROW:
                        if (xDist <= THRESHOLD && yDist <= THRESHOLD || xDist <= THRESHOLD) {
                            /* if point is at origin or y-axis */
                            translationFactor[0] += 0;
                            translationFactor[1] += distY;
                        } else if (yDist <= THRESHOLD) {
                            /* if point is on x-axis */
                            isReverse = gridPosition[0] > 0 ? true : false;
                            translationFactor = this.calculateTranslationValue(gridPosition, curPosition, rotationAngle, isDegree, isReverse);
                        } else {
                            firstEndPoint = origin;
                            secondEndPoint = {
                                "x": curPosition[0],
                                "y": curPosition[1]
                            };
                            distance = geomFunctions.distance(firstEndPoint, secondEndPoint);
                            gridPosition = grid._getGraphPointCoordinates(curPosition);
                            distance = angle < 0 ? distance + distX : distance - distX;
                            translatedPoint = geomFunctions.findSegmentPointAtADistance(firstEndPoint, secondEndPoint, distance);
                            translationFactor[0] = translatedPoint[0] - curPosition[0];
                            translationFactor[1] = translatedPoint[1] - curPosition[1];
                        }
                        break;
                }
            } else {
                switch (keyCode) {
                    case keyCodeMap.SPECIAL_KEY_LEFT_ARROW:
                        translationFactor[0] += -distX;
                        translationFactor[1] += 0;
                        break;
                    case keyCodeMap.SPECIAL_KEY_UP_ARROW:
                        translationFactor[0] += 0;
                        translationFactor[1] += -distX;
                        break;
                    case keyCodeMap.SPECIAL_KEY_RIGHT_ARROW:
                        translationFactor[0] += distX;
                        translationFactor[1] += 0;
                        break;
                    case keyCodeMap.SPECIAL_KEY_DOWN_ARROW:
                        translationFactor[0] += 0;
                        translationFactor[1] += distX;
                        break;
                }
            }

            return translationFactor;
        },
        "calculateTranslationValue": function(gridPosition, curPosition, rotationAngle, isDegree, isReverse) {
            var grid = this.model.grid,
                rotatedPoint;
            rotatedPoint = geomFunctions.rotatePoint(gridPosition[0], gridPosition[1], 0, 0, rotationAngle, isDegree, isReverse);
            rotatedPoint = grid._getCanvasPointCoordinates(rotatedPoint);
            rotatedPoint = grid.getClosestCanvasPoint(rotatedPoint);
            return [rotatedPoint[0] - curPosition[0], rotatedPoint[1] - curPosition[1]];
        },
        "createFocusRect": function(positionArr) {
            var grid = this.model.grid;
            this.removeFocusRect();
            this.focusRect = new grid._paperScope.Path(positionArr);
            this.focusRect.strokeColor = '#000';
            this.focusRect.dashArray = [2, 2];
            this.focusRect.closed = true;
            grid.refreshView();
        },
        "removeFocusRect": function() {
            if (this.focusRect) {
                this.focusRect.remove();
            }
            this.model.grid.refreshView();
        },
        "removeHoverState": function(entity) {
            if (entity && !entity._incinerated) {
                if (entity.species === 'iteration') {
                    entity = this.replaceIterateEntity(entity);
                    if (!entity) {
                        return;
                    }
                }
                if (entity.division === 'measurement') {
                    entity.$measureView.removeClass('dotted-border');
                } else if (entity.division === 'image') {
                    this.removeFocusRect();
                    if (this.focusRectEntity === entity) {
                        this.focusRectEntity = null;
                    }
                } else {
                    entity.equation.trigger('roll-out', entity.equation);
                }
            }
            this.rolledOver = null;
        },
        "shiftFromCanvasToProperty": function() {
            var model = this.model;
            this.shiftToProperty = true;
            if (this.rolledOver) {
                this.removeHoverState(this.rolledOver);
            }
            this.trigger('focusOnPropertyMenu');
            if (model._undergoingOperation) {
                model._undergoingOperation.abort();
                model.dgtUI.model.dgtMenuView.selectMenu(0, null);
            }
        },

        "setFocusToCanvas": function() {
            this.model.accManager.setFocus('canvas-event-listener');
        },
        "getAccForEntity": function(entity) {
            if (entity.id === 'Xmirror') {
                return 'x axis';
            }
            if (entity.id === 'Ymirror') {
                return 'y axis';
            }
            return entity.species + ' ' + this.getAccLabelForEntity(entity);
        },
        "getAccLabelForEntity": function(entity) {
            var labelArr, looper = 0,
                accLabel = '';
            if (entity.division === 'measurement') {
                if (entity.species === 'parameter') {
                    return entity.deletePrefixedString(entity.properties.labelText);
                }
                if (entity.species === 'measureIteration') {
                    return entity.id;
                }
                if (entity.properties.labelType === 'current-label') {
                    return entity.getLabelDataText();
                }
                labelArr = entity.constructOriginalLabel(entity.creator)[1];
                for (; looper < labelArr.length; looper++) {
                    accLabel += labelArr[looper];
                }
                return accLabel.split('').join(' ');
            }
            if (entity.division === 'marking') {
                return 'marking';
            }
            return entity.getLabelDataText() ? entity.getLabelDataText().split('').join(' ') : '';
        }

    }, { //STATIC
        "TITLE_DIV": 'math-title-text-8',
        "MENU_DIV": 'point-highlighter'

    });
})(window.MathUtilities);
