/* globals _, $, window, geomFunctions  */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Views.TransformationGridView = Backbone.View.extend({

        "model": null,

        "_rotationPoint": null,
        "_tl": null,
        "_tr": null,
        "_bl": null,
        "_br": null,
        "_moveHit": null,

        "_relPosTL": null,
        "_relPosTR": null,
        "_relPosBL": null,
        "_relPosBR": null,

        "_currentSelectedShape": null,
        "_lastMovePosition": null,

        "_movePointColor": '#6b37bf',
        "_rotationPointColor": '#e6e6e6',
        "_strokeColor": '#000',
        "_pointRadius": 6,

        "_rotationPivot": null,
        "_grid": null,
        "_rotationPivotPoint": null,
        "_rotationDandi": null,
        "_rotationLine": null,
        "_pivot": null,

        "_lockAspect": false,

        "_debugLine1": null,
        "_debugLine2": null,

        "_dottedBorder": null,
        "_borderGroup": null,
        "_displayFlags": null,

        "_layer": null,

        "_detTop": {
            "a": null,
            "b": null,
            "c": null
        },

        "_detBottom": {
            "a": null,
            "b": null,
            "c": null
        },

        "_detLeft": {
            "a": null,
            "b": null,
            "c": null
        },

        "_detRight": {
            "a": null,
            "b": null,
            "c": null
        },

        "_paperScope": null,

        "initialize": function() {
            this.id = MathUtilities.Components.EquationEngine.Models.MathFunctions.getGUID();
            this.model = new MathUtilities.Tools.Dgt.Models.TransformationGridModel();
            this._paperScope = this.options.scope;
            this.model.isDragging = false;
            this.model.engine = this.options.engine;

            this.onMouseMove = _.bind(function(event) {
                if (typeof this.model.get('_item') === 'undefined') {
                    return;
                }
                var model = this.model,
                    item = model.get('_item'),
                    movingTargetName = model.movingTarget.name,
                    centre = this._pivot.position,
                    canvasPosition = geomFunctions.getCanvasCoordinates(event),
                    currentPosition = new this._paperScope.Point(canvasPosition[0], canvasPosition[1]),
                    rotatePointPosition, rotationAngle;

                if (['tl', 'tr', 'bl', 'br', 'move', 'rotate'].indexOf(movingTargetName) > -1) {
                    if (model.isDragging === false) {
                        model.isDragging = true;
                        if (['move', 'rotate'].indexOf(movingTargetName) > -1) {
                            item.equation.trigger('transformation-' + movingTargetName + '-start');
                        } else {
                            item.equation.trigger('transformation-resize-start');
                        }
                    }
                }
                switch (movingTargetName) {

                    case 'tl':

                        this._detLeft.c = this._detLeft.a * currentPosition.x + this._detLeft.b * currentPosition.y;
                        this._detTop.c = this._detTop.a * currentPosition.x + this._detTop.b * currentPosition.y;
                        this._updatePointsWRTMatrix();
                        break;

                    case 'tr':

                        this._detRight.c = this._detRight.a * currentPosition.x + this._detRight.b * currentPosition.y;
                        this._detTop.c = this._detTop.a * currentPosition.x + this._detTop.b * currentPosition.y;
                        this._updatePointsWRTMatrix();
                        break;

                    case 'br':

                        this._detRight.c = this._detRight.a * currentPosition.x + this._detRight.b * currentPosition.y;
                        this._detBottom.c = this._detBottom.a * currentPosition.x + this._detBottom.b * currentPosition.y;
                        this._updatePointsWRTMatrix();
                        break;

                    case 'bl':

                        this._detLeft.c = this._detLeft.a * currentPosition.x + this._detLeft.b * currentPosition.y;
                        this._detBottom.c = this._detBottom.a * currentPosition.x + this._detBottom.b * currentPosition.y;
                        this._updatePointsWRTMatrix();
                        break;

                    case 'rotate':

                        model.engine.dgtUI.$('#dgt-canvas-container').addClass('rotation-cursor-in-action');
                        rotatePointPosition = this._rotationPoint.position;
                        rotationAngle = this.calculateAngle(rotatePointPosition, centre, currentPosition);

                        item.rotate(rotationAngle, centre);

                        this._moveHit.rotate(rotationAngle, centre);
                        this._locatePoints();
                        break;

                    case 'move':

                        this._recordTranslation(currentPosition);
                        this._locatePoints();
                        break;
                }

                if (movingTargetName === 'move') {
                    item.equation.trigger('transforming', event, 'dragging', this._pivot.position.getX(), this._pivot.position.getY());
                } else if (['tl', 'tr', 'bl', 'br', 'rotate'].indexOf(movingTargetName) > -1) {
                    item.equation.trigger('transforming', event, 'transformation', this._pivot.position.getX(), this._pivot.position.getY());
                }
            }, this);

            this._onDoubleClick = _.bind(function(event) {
                var item = this.model.get('_item');
                event.target = item.equation.getParent();
                if(event.target.properties.locked) {
                    return;
                }
                this._grid.trigger('image-layer-doubleclick', event);
            }, this);

            this.onMouseUp = _.bind(function onMouseUp(event) {
                var model = this.model,
                    item = model.get('_item'),
                    movingTarget = model.movingTarget.name,
                    actionName,
                    imageCenter = this._pivot.position;

                model.engine.dgtUI.$('#dgt-canvas-container').removeClass('rotation-cursor-in-action');

                model.engine.eventListenerCanvas.attachMouseMoveFunction(null);

                switch (movingTarget) {
                    case 'move':
                        actionName = 'dragging';
                        break;
                    case 'rotate':
                        actionName = 'rotate';
                        break;
                    case 'tl':
                    case 'tr':
                    case 'bl':
                    case 'br':
                        actionName = 'resize';
                        break;
                }

                if (item && model.isDragging) {
                    item.equation.trigger('transformation-complete', event, imageCenter.getX(), imageCenter.getY(), true, actionName);
                }
                model.isDragging = false;
                delete this._lastMovePosition;
            }, this);

            this.onPlotComplete = _.bind(function() {
                this._locatePoints();
            }, this);

            this.off('transformation-mouseup', this.onMouseUp)
                .on('transformation-mouseup', this.onMouseUp)
                .off('transformation-resized', this.onMouseMove)
                .on('transformation-resized', this.onMouseMove);
        },

        /**
             it takes paper item that will be transformmed.


            @method setTransformationObject
            @public
            @param item{Object} paper js item type can be Path, CompoundPath, Group, Layer and Raster.
            @return Void
             **/
        "setTransformationObject": function(item, grid, flags) {
            var initialPosition, bounds,
                TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView,
                imgObject = item.equation.getParent();

            if (typeof imgObject.allowTransformation !== 'undefined' && imgObject.allowTransformation === false) {
                this._displayFlags = TransformationGridView.FLAG_NOSCALEROTATE;
            } else if (_.isNumber(flags)) {
                this._displayFlags = flags;
            } else {
                this._displayFlags = TransformationGridView.FLAG_SHOWROTATE;
            }
            this._layer = grid._projectLayers.serviceLayer;
            initialPosition = item.position;

            item.position = new this._paperScope.Point(0, 0);

            this._grid = grid;
            this.model.set('_item', item);
            if (!item) {
                return;
            }
            item.transformContent = false;

            bounds = item._size;

            //FIXME implement a better way
            this._relPosTL = new this._paperScope.Point(-bounds.width / 2, -bounds.height / 2);
            this._relPosTR = new this._paperScope.Point(bounds.width / 2, -bounds.height / 2);
            this._relPosBL = new this._paperScope.Point(-bounds.width / 2, bounds.height / 2);
            this._relPosBR = new this._paperScope.Point(bounds.width / 2, bounds.height / 2);
            this._renderGrid(grid);

            item.equation.off('plotComplete', this.onPlotComplete)
                .on('plotComplete', this.onPlotComplete);

            item.position = initialPosition;
            this._updateGridPositions();
            this._currentSelectedShape = item;

            if (TransformationGridView.occupiedTransformationViews.length > 1 && flags !== TransformationGridView.FLAG_NOSCALEROTATEFORMULTIPLEIMAGESELECTION) {
                this.resetTransformationGridForMultipleSelectedObjects(TransformationGridView.FLAG_NOSCALEROTATEFORMULTIPLEIMAGESELECTION);
            }

            this._grid.refreshView();

        },

        "removeTransformation": function() {

            var item = this.model.get('_item'),
                TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView,
                occupiedTransformationViews = TransformationGridView.occupiedTransformationViews;

            if (!item) {
                TransformationGridView.freedTransformationViews.push(this);
                if ($.inArray(this, occupiedTransformationViews) >= 0) {
                    occupiedTransformationViews.splice($.inArray(this, occupiedTransformationViews), 1);
                }
                return;
            }

            item.equation.trigger('detach-transformation');

            item.equation.off('transformation-complete')
                .off('transformation-complete')
                .off('transformation-rotate-start transformation-resize-start transformation-move-start')
                .off('plotComplete', this.onPlotComplete);

            this.model.set('_item');
            if (this._moveHit) {
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this._grid.removeDrawingObject(this._moveHit);
                this._moveHit = null;
            }

            if (this._rotationPoint) {

                this._tl.visible = false;
                this._tr.visible = false;
                this._bl.visible = false;
                this._br.visible = false;
                this._rotationPoint.visible = false;
                this._rotationDandi.visible = false;
                this._pivot.visible = false;

                this._dottedBorder[0].visible = false;
                this._dottedBorder[1].visible = false;
                this._dottedBorder[2].visible = false;
                this._dottedBorder[3].visible = false;

                this._tl.onMouseDown = null;
                this._tr.onMouseDown = null;
                this._bl.onMouseDown = null;
                this._br.onMouseDown = null;
                this._rotationPoint.onMouseDown = null;

                this._tl.onMouseDown = null;
                this._tr.onMouseDown = null;
                this._bl.onMouseDown = null;
                this._br.onMouseDown = null;
                this._rotationPoint.onMouseDown = null;
            }

            this.model.engine.dgtUI.$('#dgt-canvas').removeClass('move');

            this._currentSelectedShape = null;

            TransformationGridView.freedTransformationViews.push(this);
            if ($.inArray(this, occupiedTransformationViews) >= 0) {
                occupiedTransformationViews.splice($.inArray(this, occupiedTransformationViews), 1);
            }

            if (occupiedTransformationViews.length === 1) {
                occupiedTransformationViews[0].resetTransformationGridForMultipleSelectedObjects(3);
            }

            this._grid.refreshView();
        },

        "isSurroundedAroundImage": function() {
            var transformationGridPosition, imgPosition;
            transformationGridPosition = this._pivot.position;
            imgPosition = this._currentSelectedShape.position;
            return transformationGridPosition.x === imgPosition.x && transformationGridPosition.y === imgPosition.y;
        },

        "resetTransformationGridForMultipleSelectedObjects": function(flags) {

            var engine = this.model.engine,
                occupiedTransformationViews = MathUtilities.Tools.Dgt.Views.TransformationGridView.occupiedTransformationViews,
                ctr, len, imgObject;

            if (occupiedTransformationViews.length === 1) {
                imgObject = occupiedTransformationViews[0]._currentSelectedShape.equation.getParent();
                /* Sets flag depending on the shape selected, to enable rotate and/or resize handlers */
                flags = imgObject.properties.locked ? 0 : imgObject.text ? 2 : 3;
                occupiedTransformationViews[0].setTransformationObject(occupiedTransformationViews[0]._currentSelectedShape, engine.grid, flags);
            } else {
                len = occupiedTransformationViews.length;
                for (ctr = 0; ctr < len; ctr++) {
                    occupiedTransformationViews[ctr].setTransformationObject(occupiedTransformationViews[ctr]._currentSelectedShape, engine.grid, flags);
                }
            }
        },

        "_manipulateCurrentPositionForAspectRatio": function(currentPosition, currentPointName) {
            var oppositePoint, targetPoint, sidePoint1, sidePoint2,
                sideOfCurrentPosition, sideOfPoint1, chosenPoint,
                line, diagonal, intersect;

            switch (currentPointName) {
                case 'tr':
                    oppositePoint = this._bl.position;
                    targetPoint = this._tr.position;
                    sidePoint1 = this._tl.position;
                    sidePoint2 = this._br.position;
                    break;

                case 'tl':
                    oppositePoint = this._br.position;
                    targetPoint = this._tl.position;
                    sidePoint1 = this._bl.position;
                    sidePoint2 = this._tr.position;
                    break;

                case 'bl':
                    oppositePoint = this._tr.position;
                    targetPoint = this._bl.position;
                    sidePoint1 = this._tl.position;
                    sidePoint2 = this._br.position;
                    break;

                case 'br':
                    oppositePoint = this._tl.position;
                    targetPoint = this._br.position;
                    sidePoint1 = this._tr.position;
                    sidePoint2 = this._bl.position;
                    break;

                default:
                    return;
            }

            sideOfCurrentPosition = this.isLeft(targetPoint, oppositePoint, currentPosition);
            sideOfPoint1 = this.isLeft(targetPoint, oppositePoint, sidePoint1);

            if (sideOfCurrentPosition === 0) {
                //point is on line so all is well
                return;
            }
            if (sideOfCurrentPosition === sideOfPoint1) {
                chosenPoint = sidePoint2;
            } else {
                chosenPoint = sidePoint1;
            }

            line = this.getLine(chosenPoint, targetPoint, currentPosition);
            diagonal = this.getLine(targetPoint, oppositePoint);

            intersect = this.findIntersect(diagonal, line);

            currentPosition.x = intersect.x;
            currentPosition.y = intersect.y;
        },

        "getPointOnLine": function(equation, x) {
            return -(equation.C + equation.A * x) / equation.B;
        },

        "isLeft": function(a, b, c) {
            var val = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
            return val / Math.abs(val);
        },

        "updateBorder": function() {
            var createBorder = _.bind(function createBorder(pos1, pos2) {
                var border;
                border = new this._paperScope.Path.Line(pos1.clone(), pos2.clone());
                border.dashArray = [10, 4];
                border.strokeColor = '#000';
                border.strokeWidth = 1.5;
                return border;
            }, this);

            function relocateBorder(border, pos1, pos2) {
                border.firstSegment.point = pos1;
                border.lastSegment.point = pos2;
            }

            if (!this._dottedBorder) {
                this._dottedBorder = [];
                this._dottedBorder.push(createBorder(this._tl.position, this._tr.position),
                    createBorder(this._br.position.clone(), this._tr.position.clone()),
                    createBorder(this._br.position, this._bl.position),
                    createBorder(this._bl.position.clone(), this._tl.position.clone()));

                this._tl.bringToFront();
                this._tr.bringToFront();
                this._br.bringToFront();
                this._bl.bringToFront();
            } else {
                if (!this._dottedBorder[0].visible) {
                    this._dottedBorder[0].visible = true;
                    this._dottedBorder[1].visible = true;
                    this._dottedBorder[2].visible = true;
                    this._dottedBorder[3].visible = true;
                }
                relocateBorder(this._dottedBorder[0], this._tl.position, this._tr.position);
                relocateBorder(this._dottedBorder[1], this._br.position, this._tr.position);
                relocateBorder(this._dottedBorder[2], this._br.position, this._bl.position);
                relocateBorder(this._dottedBorder[3], this._bl.position, this._tl.position);
            }
        },

        "_renderGrid": function() {
            var item = this.model.get('_item'),
                getCircleGroup,
                ctr, hitRectangle,
                $dgtCanvasContainer = this.model.engine.dgtUI.$('#dgt-canvas-container'),
                TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView;

            if (!item) {
                return;
            }
            this._layer.activate();

            if (this._moveHit) {
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this._grid.removeDrawingObject(this._moveHit);
                this._moveHit = null;
            }
            hitRectangle = new this._paperScope.Path.Rectangle(new this._paperScope.Point(item._position.x - item._size.width / 2, item._position.y - item._size.height / 2), item._size);
            hitRectangle.fillColor = new this._paperScope.Color(0, 0, 0, 0);
            hitRectangle.alpha = 0;

            this._moveHit = new this._paperScope.Group([hitRectangle]);
            this._moveHit.transformContent = false;
            this._moveHit.onDoubleClick = this._onDoubleClick;

            this._moveHit.equation = item.equation;
            this._moveHit.transformationView = this;

            this._moveHit.sendToBack();

            if (!this._rotationPoint) {

                getCircleGroup = _.bind(function(rad, color, strokeColor, name) {
                    var circle, tempGroup;

                    tempGroup = new this._paperScope.Group();
                    //hit area is reduced for pc browser and increased for tablets only
                    if ('ontouchstart' in window) {
                        circle = new this._paperScope.Path.Circle({
                            "center": new this._paperScope.Point(10, 10),
                            "radius": rad * 3,
                            "fillColor": '#f00'
                        });
                        circle.name = name;
                        tempGroup.addChild(circle);
                        circle.fillColor.alpha = 0;
                    }
                    circle = new this._paperScope.Path.Circle({
                        "center": new this._paperScope.Point(10, 10),
                        "radius": rad,
                        "fillColor": color,
                        "strokeColor": strokeColor
                    });
                    circle.name = name;
                    tempGroup.addChild(circle);
                    tempGroup.name = name;

                    return tempGroup;
                }, this);

                this._tl = getCircleGroup(this._pointRadius, this._rotationPointColor, this._strokeColor, 'tl');

                this._tr = getCircleGroup(this._pointRadius, this._rotationPointColor, this._strokeColor, 'tr');

                this._bl = getCircleGroup(this._pointRadius, this._rotationPointColor, this._strokeColor, 'bl');

                this._br = getCircleGroup(this._pointRadius, this._rotationPointColor, this._strokeColor, 'br');

                this._tl.transformationView = this;
                this._tr.transformationView = this;
                this._bl.transformationView = this;
                this._br.transformationView = this;

                this._tl.equation = item.equation;
                this._tr.equation = item.equation;
                this._bl.equation = item.equation;
                this._br.equation = item.equation;

                this._tl.bringToFront();
                this._tr.bringToFront();
                this._bl.bringToFront();
                this._br.bringToFront();

                this._rotationDandi = new this._paperScope.Path.Line(new this._paperScope.Point(0, 0), new this._paperScope.Point(100, 100));
                this._rotationDandi.strokeColor = '#000';
                this._rotationDandi.strokeWidth = 2;

                this._rotationLine = new this._paperScope.Group([this._rotationDandi]);

                this._rotationPoint = getCircleGroup(this._pointRadius, this._movePointColor, this._strokeColor, 'rotate');
                this._rotationDandi.transformationView = this;
                this._rotationDandi.equation = item.equation;
                this._rotationPoint.transformationView = this;
                this._rotationPoint.equation = item.equation;

                this._pivot = new this._paperScope.Path.Circle({
                    "center": new this._paperScope.Point(10, 10),
                    "radius": this._pointRadius,
                    "strokeColor": '#000'
                });
                this.updateBorder();

                this._borderGroup = new this._paperScope.Group();
                for (ctr = 0; ctr < this._dottedBorder.length; ctr++) {
                    this._borderGroup.addChild(this._dottedBorder[ctr]);
                }
                this._borderGroup.transformationView = this;
                this._borderGroup.equation = item.equation;
            }

            this._tl.visible = Boolean(this._displayFlags & TransformationGridView.FLAG_SHOWSCALE);
            this._tr.visible = Boolean(this._displayFlags & TransformationGridView.FLAG_SHOWSCALE);
            this._bl.visible = Boolean(this._displayFlags & TransformationGridView.FLAG_SHOWSCALE);
            this._br.visible = Boolean(this._displayFlags & TransformationGridView.FLAG_SHOWSCALE);
            this._rotationPoint.visible = Boolean(this._displayFlags & TransformationGridView.FLAG_SHOWROTATE);
            this._rotationDandi.visible = Boolean(this._displayFlags & TransformationGridView.FLAG_SHOWROTATE);
            this._pivot.visible = false;

            this._pivot.strokeColor.alpha = 0;

            this._tl.bringToFront();
            this._tr.bringToFront();
            this._br.bringToFront();
            this._bl.bringToFront();

            this._grid.refreshView();

            this._tl.onMouseDown = this.onMouseDown;
            this._tr.onMouseDown = this.onMouseDown;
            this._bl.onMouseDown = this.onMouseDown;
            this._br.onMouseDown = this.onMouseDown;
            this._rotationPoint.onMouseDown = this.onMouseDown;
            this._moveHit.onMouseDown = this.onMouseDown;

            this._tl.name = 'tl';
            this._tr.name = 'tr';
            this._bl.name = 'bl';
            this._br.name = 'br';
            this._moveHit.name = 'move';

            this._moveHit.onMouseEnter = _.bind(function() {
                if (this.model.engine.grid.getGridMode() === 'Graph') {
                    if (!this.model.get('_item').equation.getParent().properties.locked) {
                        $dgtCanvasContainer.addClass('move');
                    }
                    if (typeof this.model.get('_item').equation.getParent().text !== 'undefined' &&
                        this.model.get('_item').equation.getParent().text !== null) {
                        MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'text', 'deselect');
                    } else {
                        MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'image', 'deselect');
                    }
                }
            }, this);

            this._moveHit.onMouseLeave = _.bind(function() {
                $dgtCanvasContainer.removeClass('move');
                MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'grid', this.model.engine.selected.length);
            }, this);

            this._tl.onMouseEnter = this._tr.onMouseEnter = this._bl.onMouseEnter = this._br.onMouseEnter = _.bind(function() {
                if (this.model.engine.grid.getGridMode() === 'Graph') {
                    $dgtCanvasContainer.addClass('se-resize');
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'image-resize');
                }
            }, this);

            this._tl.onMouseLeave = this._tr.onMouseLeave = this._bl.onMouseLeave = this._br.onMouseLeave = _.bind(function() {
                $dgtCanvasContainer.removeClass('se-resize');
                MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'leave');
            }, this);

            this._rotationPoint.onMouseEnter = _.bind(function() {
                if (this.model.engine.grid.getGridMode() === 'Graph') {
                    $dgtCanvasContainer.addClass('rotation-cursor');
                    if (typeof this.model.get('_item').equation.getParent().text !== 'undefined' &&
                        this.model.get('_item').equation.getParent().text !== null) {
                        MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'text-rotate');
                    } else {
                        MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'image-rotate');
                    }
                }
            }, this);

            this._rotationPoint.onMouseLeave = _.bind(function() {
                $dgtCanvasContainer.removeClass('rotation-cursor');
                MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'leave');
            }, this);

            this._updateGridPositions();
        },

        "_recordTranslation": function(point) {
            if (!this._lastMovePosition) {
                this._lastMovePosition = point;
                return;
            }

            var item = this.model.get('_item'),
                dx = point.x - this._lastMovePosition.x,
                dy = point.y - this._lastMovePosition.y,
                delta = new this._paperScope.Point(dx, dy);

            item.translate(delta);

            this._moveHit.translate(delta);

            this._lastMovePosition = point;
        },

        "_locatePoints": function() {

            var item = this.model.get('_item'),
                matrix = item.matrix.clone(),
                padding = 1;

            this._tl.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._relPosTL), item.position);
            this._tl.position.x -= padding;
            this._tl.position.y -= padding;

            this._tr.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._relPosTR), item.position);
            this._tr.position.x += padding;
            this._tr.position.y -= padding;

            this._bl.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._relPosBL), item.position);
            this._bl.position.x -= padding;
            this._bl.position.y += padding;

            this._br.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._relPosBR), item.position);
            this._br.position.x += padding;
            this._br.position.y += padding;

            if (this._rotationPivot) {
                this._rotationPivot.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._rotationPivotPoint), item.position);
            }
            if (this._pivot) {
                this._pivot.position = item.position;
            }
            this._moveHit.matrix = matrix.clone();

            this.locateRotationPoint();
            this.updateBorder();
        },

        "locateRotationPoint": function() {
            var topRight = this._tr.position,
                topLeft = this._tl.position,
                bottomRight = this._br.position,
                bottomLeft = this._bl.position,
                ROTATION_POINT_SHIFT = 25,
                midPoint = geomFunctions.midPoint2(topLeft.x, topLeft.y, topRight.x, topRight.y),
                coord = geomFunctions.pointAtADistanceFromMidPointWithBetterName(topLeft.x, topLeft.y, topRight.x, topRight.y,
                    bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y, ROTATION_POINT_SHIFT);

            this._rotationPoint.position = new this._paperScope.Point(coord[0], coord[1]);

            this._rotationDandi.firstSegment.point = new this._paperScope.Point(midPoint[0], midPoint[1]);
            this._rotationDandi.lastSegment.point = new this._paperScope.Point(coord[0], coord[1]);
        },

        "translateOrigin": function(point) {
            return point;
        },

        "_updatePointsWRTMatrix": function() {

            var det1 = this._detRight.b * this._detTop.a - this._detTop.b * this._detRight.a,
                det2 = this._detLeft.b * this._detBottom.a - this._detBottom.b * this._detLeft.a,
                det3 = this._detLeft.b * this._detTop.a - this._detTop.b * this._detLeft.a,
                det4 = this._detRight.b * this._detBottom.a - this._detBottom.b * this._detRight.a;

            this._tr.position.x = (this._detRight.b * this._detTop.c - this._detTop.b * this._detRight.c) / det1;
            this._tr.position.y = (this._detTop.a * this._detRight.c - this._detRight.a * this._detTop.c) / det1;

            this._bl.position.x = (this._detLeft.b * this._detBottom.c - this._detBottom.b * this._detLeft.c) / det2;
            this._bl.position.y = (this._detBottom.a * this._detLeft.c - this._detLeft.a * this._detBottom.c) / det2;

            this._tl.position.x = (this._detLeft.b * this._detTop.c - this._detTop.b * this._detLeft.c) / det3;
            this._tl.position.y = (this._detTop.a * this._detLeft.c - this._detLeft.a * this._detTop.c) / det3;

            this._br.position.x = (this._detRight.b * this._detBottom.c - this._detBottom.b * this._detRight.c) / det4;
            this._br.position.y = (this._detBottom.a * this._detRight.c - this._detRight.a * this._detBottom.c) / det4;

            this.locateRotationPoint();
            this._fitObjectInNewGridPoints();
            this.updateBorder();
        },

        "_fitObjectInNewGridPoints": function() {

            var midpoint = new this._paperScope.Point(0, 0),
                a, b, c, d, originalWidth, originalHeight, item, matrix, matrix2;

            midpoint.x = (this._tl.position.x + this._br.position.x) / 2;
            midpoint.y = (this._tl.position.y + this._br.position.y) / 2;

            originalWidth = this.distance(this._relPosTL, this._relPosTR);
            originalHeight = this.distance(this._relPosTL, this._relPosBL);

            a = (this._tr.position.x - this._tl.position.x) / originalWidth;
            b = (this._tr.position.y - this._tl.position.y) / originalWidth;
            c = (this._bl.position.x - this._tl.position.x) / originalHeight;
            d = (this._bl.position.y - this._tl.position.y) / originalHeight;

            item = this.model.get('_item');

            matrix = new this._paperScope.Matrix(a, b, c, d, midpoint.x, midpoint.y);
            matrix2 = new this._paperScope.Matrix(a, b, c, d, midpoint.x, midpoint.y);

            item.matrix = matrix;

            this._moveHit.matrix = matrix2;

            if (this._pivot) {
                this._pivot.position = item.position;
            }
            if (this._rotationPivot) {
                this._rotationPivot.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._rotationPivotPoint), item.position);
            }
        },

        "_calculatePositions": function() {
            //HERE
            this._detTop.a = -(this._tl.position.y - this._tr.position.y);
            this._detTop.b = this._tl.position.x - this._tr.position.x;
            this._detTop.c = this._tr.position.y * this._detTop.b + this._tr.position.x * this._detTop.a;

            this._detBottom.a = -(this._bl.position.y - this._br.position.y);
            this._detBottom.b = this._bl.position.x - this._br.position.x;
            this._detBottom.c = this._br.position.y * this._detBottom.b + this._br.position.x * this._detBottom.a;

            this._detLeft.a = -(this._tl.position.y - this._bl.position.y);
            this._detLeft.b = this._tl.position.x - this._bl.position.x;
            this._detLeft.c = this._bl.position.y * this._detLeft.b + this._bl.position.x * this._detLeft.a;

            this._detRight.a = -(this._tr.position.y - this._br.position.y);
            this._detRight.b = this._tr.position.x - this._br.position.x;
            this._detRight.c = this._br.position.y * this._detRight.b + this._br.position.x * this._detRight.a;
        },

        "_updateGridPositions": function() {
            var item = this.model.get('_item');

            if (this._pivot) {
                this._pivot.position = item.position;
            }
            this._locatePoints();
            this.updateBorder();
        },

        //***************************** MATH FUNCTIONS ******************
        "midPoint": function(point1, point2) {
            return new this._paperScope.Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
        },

        "calculateAngle": function(point1, center, point2) {
            return (Math.atan2(point2.y - center.y, point2.x - center.x) - Math.atan2(point1.y - center.y, point1.x - center.x)) * 180 / Math.PI;
        },

        "distance": function(point1, point2) {
            return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
        },

        "getPrimePositionsFromMatrix": function(matrix, point) {

            var primePoint = new this._paperScope.Point(0, 0),
                values = MathUtilities.Tools.Dgt.Views.TransformationGridView.getPrimePointCoordinates(point, matrix);
            primePoint.x = values.x;
            primePoint.y = values.y;
            return primePoint;
        },

        "getLine": function(point1, point2, throughPoint) {
            var A = point2.y - point1.y,
                B = -(point2.x - point1.x),
                C;

            if (!throughPoint) {
                throughPoint = point1;
            }
            C = A * throughPoint.x + B * throughPoint.y;

            return {
                "A": A,
                "B": B,
                "C": C,
                "toString": function() {
                    return 'A:' + this.A + ' B:' + this.B + ' C:' + this.C;
                }
            };
        },

        "findIntersect": function(line1, line2) {
            var intersect = new this._paperScope.Point(0, 0),
                det = line1.A * line2.B - line2.A * line1.B;
            intersect.x = (line2.B * line1.C - line1.B * line2.C) / det;
            intersect.y = (line1.A * line2.C - line2.A * line1.C) / det;

            return intersect;
        }

    }, {
        "FLAG_SHOWSCALE": 1,
        "FLAG_SHOWROTATE": 2,
        "FLAG_NOSCALEROTATE": 0,
        "FLAG_NOSCALEROTATEFORMULTIPLEIMAGESELECTION": 4,

        "allTransformationViews": null,
        "occupiedTransformationViews": null,
        "freedTransformationViews": null,

        "getTransformationGridViewObject": function(dgtPaperScope, engine, item) {
            var TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView,
                allTransformationViews = TransformationGridView.allTransformationViews,
                occupiedTransformationViews = TransformationGridView.occupiedTransformationViews,
                freedTransformationViews = TransformationGridView.freedTransformationViews,
                transformationView, len, ctr;

            if (allTransformationViews === null) {
                TransformationGridView.allTransformationViews = allTransformationViews = [];
                TransformationGridView.occupiedTransformationViews = occupiedTransformationViews = [];
                TransformationGridView.freedTransformationViews = freedTransformationViews = [];
            }
            len = occupiedTransformationViews.length;
            if (len > 0) {
                for (ctr = 0; ctr < len; ctr++) {
                    if (occupiedTransformationViews[ctr]._currentSelectedShape === item) {
                        break;
                    }
                }
                if (ctr !== len) {
                    return occupiedTransformationViews[ctr];
                }
            }

            if (freedTransformationViews.length > 0) {
                transformationView = freedTransformationViews.shift();
                occupiedTransformationViews.push(transformationView);
            } else {
                transformationView = new MathUtilities.Tools.Dgt.Views.TransformationGridView({
                    "scope": dgtPaperScope,
                    "engine": engine
                });
                allTransformationViews.push(transformationView);
                occupiedTransformationViews.push(transformationView);
            }
            return transformationView;
        },
        "getPrimePointCoordinates": function(point, matrix) {
            var values = matrix.values;
            return {
                "x": point.x * values[0] + point.y * values[2] + values[4],
                "y": point.x * values[1] + point.y * values[3] + values[5]
            };
        }
    });
}(window.MathUtilities));
