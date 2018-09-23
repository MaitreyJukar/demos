/* globals _, $, window, geomFunctions  */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Graphing.Views.ImageTransformation = Backbone.View.extend({

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
        "lastMovePosition": null,

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
        "$canvas": null,

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
        "_imageHandlerView": null,

        "initialize": function() {
            this.id = MathUtilities.Components.EquationEngine.Models.MathFunctions.getGUID();
            this.model = new MathUtilities.Tools.Graphing.Models.ImageTransformation();
            this._paperScope = this.options.scope;
            this.model.isDragging = false;
            this._imageHandlerView = this.options.imageHandlerView;
            this.model.set('canvasContainer', this.options.canvasContainer);
            this.$canvas = this.options.canvasContainer.find('canvas');
            this.onMouseMove = _.bind(function(event) {
                if (this.model.get('_item') === void 0) {
                    return void 0;
                }
                var item = this.model.get('_item'),
                    movingTargetName = this.model.movingTarget.name,
                    centre = this._pivot.position,
                    canvasPosition = geomFunctions.getCanvasCoordinates(event),
                    currentPosition = new this._paperScope.Point(canvasPosition[0], canvasPosition[1]),
                    rotatePointPosition, rotationAngle;

                if (['tl', 'tr', 'br', 'bl', 'rotate', 'move'].indexOf(movingTargetName) > -1 && this.model.isDragging === false) {

                    this.model.isDragging = true;
                    if (['move', 'rotate'].indexOf(movingTargetName) > -1) {
                        item.equation.trigger('transformation-' + movingTargetName + '-start');
                    } else {
                        item.equation.trigger('transformation-resize-start');
                    }

                }
                switch (movingTargetName) {

                    case 'tl':

                        this._detLeft.c = this._detLeft.a * currentPosition.x + this._detLeft.b * currentPosition.y;
                        this._detTop.c = this._detTop.a * currentPosition.x + this._detTop.b * currentPosition.y;
                        this._updatePointsWRTMatrix(movingTargetName, event.isAccessible);
                        break;
                    case 'tr':

                        this._detRight.c = this._detRight.a * currentPosition.x + this._detRight.b * currentPosition.y;
                        this._detTop.c = this._detTop.a * currentPosition.x + this._detTop.b * currentPosition.y;

                        this._updatePointsWRTMatrix(movingTargetName, event.isAccessible);
                        break;

                    case 'br':

                        this._detRight.c = this._detRight.a * currentPosition.x + this._detRight.b * currentPosition.y;
                        this._detBottom.c = this._detBottom.a * currentPosition.x + this._detBottom.b * currentPosition.y;
                        this._updatePointsWRTMatrix(movingTargetName, event.isAccessible);

                        break;

                    case 'bl':

                        this._detLeft.c = this._detLeft.a * currentPosition.x + this._detLeft.b * currentPosition.y;
                        this._detBottom.c = this._detBottom.a * currentPosition.x + this._detBottom.b * currentPosition.y;
                        this._updatePointsWRTMatrix(movingTargetName, event.isAccessible);
                        break;

                    case 'rotate':

                        this.$canvas.addClass('rotation-cursor-in-action');
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

                    item.equation.trigger('transforming:graphing', event, 'dragging', this._pivot.position.getX(), this._pivot.position.getY(), this.model.get('_item').delta);
                } else if (['tl', 'tr', 'br', 'bl', 'rotate'].indexOf(movingTargetName) > -1) {
                    item.equation.trigger('transforming:graphing', event, 'transformation', this._pivot.position.getX(), this._pivot.position.getY());
                }
            }, this);

            this._onDoubleClick = _.bind(function(event) {

                event.target = this.model.get('_item');
                this._grid.trigger('image-layer-doubleclick', event);
            }, this);



            this.onMouseUp = _.bind(function onMouseUp(event) {
                var item = this.model.get('_item'),
                    movingTarget = this.model.movingTarget,
                    actionName,
                    imageCenter;
                if (movingTarget) {
                    movingTarget = this.model.movingTarget.name;
                }
                if (this._pivot) {
                    imageCenter = this._pivot.position;
                }
                this.$canvas.removeClass('rotation-cursor-in-action');
                this._grid.off('grid-graph-mousedrag', this.onMouseMove);

                this._grid.off('grid-graph-mouseup', this.onMouseUp);



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

                if (item && this.model.isDragging === true) {
                    item.equation.trigger('transformation-complete', event, imageCenter.getX(), imageCenter.getY(), true, actionName);
                }

                this.model.isDragging = false;
                delete this.lastMovePosition;
            }, this);

            this.onPlotComplete = _.bind(function onPlotComplete() {

                this._locatePoints();

            }, this);


        },


        /**
         it takes paper item that will be transformed.
        

        @method setTransformationObject
        @public
        @param item{Object} paper js item type can be Path, CompoundPath, Group, Layer and Raster.
        @param grid{Object} consists of grid data object
        @param flags{Number} consists of states of image rotated,scale rotated etc.
        @return Void
         **/
        "setTransformationObject": function(item, grid, flags) {
            var imgObject,
                initialPosition,
                bounds,
                ROTATION_PIVOT_X = -50,
                ROTATION_PIVOT_Y = 0,
                ImageTransformation = MathUtilities.Tools.Graphing.Views.ImageTransformation;
            imgObject = item.equation.getParent();
            if (imgObject.allowTransformation !== void 0 && imgObject.allowTransformation === false) {
                this._displayFlags = ImageTransformation.FLAG_NOSCALEROTATE;
            } else if (flags) {
                this._displayFlags = flags;
            } else {
                this._displayFlags = ImageTransformation.FLAG_SHOWROTATE;
            }
            this._layer = grid._projectLayers.serviceLayer;
            initialPosition = item.position;

            item.position = new this._paperScope.Point(0, 0);

            this._grid = grid;
            this.model.set('_item', item);
            if (!item) {
                return void 0;
            }
            item.transformContent = false;

            bounds = item._size;

            //FIXME implement a better way
            this._relPosTL = new this._paperScope.Point(-bounds.width / 2, -bounds.height / 2);
            this._relPosTR = new this._paperScope.Point(bounds.width / 2, -bounds.height / 2);
            this._relPosBL = new this._paperScope.Point(-bounds.width / 2, bounds.height / 2);
            this._relPosBR = new this._paperScope.Point(bounds.width / 2, bounds.height / 2);

            if (this._rotationPivot) {
                this._rotationPivotPoint = new this._paperScope.Point(ROTATION_PIVOT_X, ROTATION_PIVOT_Y);
            }
            this._renderGrid(grid);

            item.equation.off('plotComplete', this.onPlotComplete)
                .on('plotComplete', this.onPlotComplete);

            item.position = initialPosition;
            this._pivot.position = initialPosition;
            this._updateGridPositions();
            this._currentSelectedShape = item;

            if (ImageTransformation.occupiedTransformationViews.length > 1 && flags !== 4) {
                this.resetTransformationGridForMultipleSelectedObjects(ImageTransformation.FLAG_NOSCALEROTATEFORMULTIPLEIMAGESELECTION);
            }
            item.bringToFront();

            this._grid.refreshView();

        },

        "removeTransformation": function() {

            var item = this.model.get('_item'),
                ImageTransformation = MathUtilities.Tools.Graphing.Views.ImageTransformation;

            if (!item) {
                ImageTransformation.freedTransformationViews.push(this);
                if ($.inArray(this, ImageTransformation.occupiedTransformationViews) >= 0) {
                    ImageTransformation.occupiedTransformationViews.splice($.inArray(this, ImageTransformation.occupiedTransformationViews), 1);
                }
                return void 0;
            }

            item.equation.trigger('detach-transformation');
            this.model.set('_item');
            if (this._moveHit) {
                this._moveHit.remove();
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



            }

            this.$canvas.removeClass('move');
            this._currentSelectedShape = null;
            ImageTransformation.freedTransformationViews.push(this);
            if ($.inArray(this, ImageTransformation.occupiedTransformationViews) >= 0) {
                ImageTransformation.occupiedTransformationViews.splice($.inArray(this, ImageTransformation.occupiedTransformationViews), 1);
            }

            if (ImageTransformation.occupiedTransformationViews.length === 1) {
                ImageTransformation.occupiedTransformationViews[0].resetTransformationGridForMultipleSelectedObjects(3);
            }

            this._grid.refreshView();
        },

        "isSurroundedAroundImage": function() {
            var transformationGridPosition = this._pivot.position,
                imgPosition = this._currentSelectedShape.position;
            return transformationGridPosition.x === imgPosition.x && transformationGridPosition.y === imgPosition.y;
        },

        "resetTransformationGridForMultipleSelectedObjects": function(flags) {

            var occupiedTransformationViews = MathUtilities.Tools.Graphing.Views.ImageTransformation.occupiedTransformationViews,
                grid = this._grid,
                ctr, len;

            if (occupiedTransformationViews.length === 1) {
                flags = occupiedTransformationViews[0]._currentSelectedShape.equation.getParent().text ? 2 : 3;
                occupiedTransformationViews[0].setTransformationObject(occupiedTransformationViews[0]._currentSelectedShape, grid, flags);
            } else {
                len = occupiedTransformationViews.length;
                for (ctr = 0; ctr < len; ctr++) {
                    occupiedTransformationViews[ctr].setTransformationObject(occupiedTransformationViews[ctr]._currentSelectedShape, grid, flags);
                }
            }
        },

        "_manipulateCurrentPositionForAspectRatio": function(currentPosition, currentPointName) {
            var oppositePoint, targetPoint, sidePoint1, sidePoint2, sideOfCurrentPosition, sideOfPoint1, chosenPoint, line, diagonal, intersect;


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
                    return void 0;
            }


            sideOfCurrentPosition = this.isLeft(targetPoint, oppositePoint, currentPosition);
            sideOfPoint1 = this.isLeft(targetPoint, oppositePoint, sidePoint1);



            if (sideOfCurrentPosition === 0) {
                //point is on line so all is well
                return void 0;
            }
            if (sideOfCurrentPosition === sideOfPoint1) {
                chosenPoint = sidePoint2;
            } else {
                chosenPoint = sidePoint1;
            }


            line = this.getLine(chosenPoint, targetPoint, currentPosition);
            diagonal = this.getLine(targetPoint, oppositePoint);

            this.drawLineOnEquation(this._debugLine1, line);
            this.drawLineOnEquation(this._debugLine2, diagonal);


            intersect = this.findIntersect(diagonal, line);

            currentPosition.x = intersect.x;
            currentPosition.y = intersect.y;

        },

        "drawLineOnEquation": function(line, equation) {
            var x1 = 0,
                x2 = 800,
                y1,
                y2;


            if (equation.B === 0) {
                y1 = x1;
                y2 = x2;
                x1 = x2 = -equation.C / equation.A;
            } else if (equation.A === 0) {
                y1 = y2 = -equation.C / equation.B;

            } else {
                y1 = this.getPointOnLine(equation, x1);
                y2 = this.getPointOnLine(equation, x2);
            }


            line.firstSegment.point.x = x1;

            line.firstSegment.point.y = y1;
            line.lastSegment.point.x = x2;
            line.lastSegment.point.y = y2;

        },


        "getPointOnLine": function(equation, x) {
            return -(equation.C + equation.A * x) / equation.B;
        },

        "isLeft": function(a, b, c) {
            var val = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
            return val / Math.abs(val);
        },

        "updateBorder": function() {
            var createBorder;
            createBorder = _.bind(function(pos1, pos2) {
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

            if (this._dottedBorder) {
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
            } else {
                this._dottedBorder = [];
                this._dottedBorder.push(createBorder(this._tl.position, this._tr.position),
                    createBorder(this._br.position.clone(), this._tr.position.clone()),
                    createBorder(this._br.position, this._bl.position),
                    createBorder(this._bl.position.clone(), this._tl.position.clone()));
                this._tl.bringToFront();
                this._tr.bringToFront();
                this._br.bringToFront();
                this._bl.bringToFront();
            }
        },


        "_renderGrid": function() {
            var item = this.model.get('_item'),
                getCircleGroup,
                self = this,
                RADIUS_FACTOR = 3,
                itemQuestion,
                FLAG_SHOWSCALE,
                FLAG_SHOWROTATE,
                $canvasContainer, ctr, hitRectangle;


            if (!item) {
                return void 0;
            }


            this._layer.activate();


            if (this._moveHit) {
                this._moveHit.remove();
                this._moveHit = null;
            }
            hitRectangle = new this._paperScope.Path.Rectangle(new this._paperScope.Point(item._position.x - item._size.width / 2, item._position.y - item._size.height / 2), item._size);
            hitRectangle.fillColor = new this._paperScope.Color(0, 0, 0, 0);
            hitRectangle.alpha = 0;

            this._moveHit = new this._paperScope.Group([hitRectangle]);
            this._moveHit.transformContent = false;
            this._moveHit.onDoubleClick = this._onDoubleClick;
            itemQuestion = item.equation;
            this._moveHit.equation = itemQuestion;
            this._moveHit.transformationView = this;

            this._moveHit.sendToBack();

            if (!this._rotationPoint) {

                getCircleGroup = _.bind(function(rad, color, strokeColor, name, equation) {
                    var circle, tempGroup;

                    tempGroup = new this._paperScope.Group();
                    //hit area is reduced for pc browser and increased for tablets only
                    if ('ontouchstart' in window) {
                        circle = new this._paperScope.Path.Circle({
                            "center": new this._paperScope.Point(10, 10),
                            "radius": rad * RADIUS_FACTOR,
                            "fillColor": 'red'
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
                    if (equation) {
                        circle.equation = equation;
                    }
                    tempGroup.addChild(circle);
                    tempGroup.name = name;

                    return tempGroup;
                }, this);


                this._tl = getCircleGroup(this._pointRadius, this._rotationPointColor, this._strokeColor, 'tl', itemQuestion);

                this._tr = getCircleGroup(this._pointRadius, this._rotationPointColor, this._strokeColor, 'tr', itemQuestion);

                this._bl = getCircleGroup(this._pointRadius, this._rotationPointColor, this._strokeColor, 'bl', itemQuestion);

                this._br = getCircleGroup(this._pointRadius, this._rotationPointColor, this._strokeColor, 'br', itemQuestion);

                this._tl.transformationView = this;
                this._tr.transformationView = this;
                this._bl.transformationView = this;
                this._br.transformationView = this;

                this._tl.equation = itemQuestion;
                this._tr.equation = itemQuestion;
                this._bl.equation = itemQuestion;
                this._br.equation = itemQuestion;

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
                this._rotationDandi.equation = itemQuestion;
                this._rotationPoint.transformationView = this;
                this._rotationPoint.equation = itemQuestion;

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
                this._borderGroup.equation = itemQuestion;
            }
            FLAG_SHOWSCALE = Boolean(this._displayFlags & MathUtilities.Tools.Graphing.Views.ImageTransformation.FLAG_SHOWSCALE);
            FLAG_SHOWROTATE = Boolean(this._displayFlags & MathUtilities.Tools.Graphing.Views.ImageTransformation.FLAG_SHOWROTATE);
            this._tl.visible = FLAG_SHOWSCALE;
            this._tr.visible = FLAG_SHOWSCALE;
            this._bl.visible = FLAG_SHOWSCALE;
            this._br.visible = FLAG_SHOWSCALE;
            this._rotationPoint.visible = FLAG_SHOWROTATE;
            this._rotationDandi.visible = FLAG_SHOWROTATE;
            this._pivot.visible = false;


            this._pivot.strokeColor.alpha = 0;

            this._tl.bringToFront();
            this._tr.bringToFront();
            this._br.bringToFront();
            this._bl.bringToFront();

            this._tl.onMouseDown = this.onMouseDown;
            this._tr.onMouseDown = this.onMouseDown;
            this._bl.onMouseDown = this.onMouseDown;
            this._br.onMouseDown = this.onMouseDown;
            this._rotationPoint.onMouseDown = this.onMouseDown;
            hitRectangle.onMouseDown = this.onMouseDown;


            this._tl.name = 'tl';
            this._tr.name = 'tr';
            this._bl.name = 'bl';
            this._br.name = 'br';
            hitRectangle.name = "move";



            $canvasContainer = this.model.get('canvasContainer');
            hitRectangle.onMouseEnter = _.bind(function() {
                if (this._grid.getGridMode() === 'Graph') {
                    $canvasContainer.addClass('move');

                }
            }, this);
            hitRectangle.onMouseLeave = function() {
                $canvasContainer.removeClass('move');
            };
            this._tl.onMouseEnter = this._br.onMouseEnter = function() {
                if (self._grid.getGridMode() === 'Graph') {
                    $canvasContainer.addClass('se-resize');
                }
            };
            this._tl.onMouseLeave = this._br.onMouseLeave =
                function() {
                    $canvasContainer.removeClass('se-resize');
                };
            this._tr.onMouseEnter = this._bl.onMouseEnter = function() {
                if (self._grid.getGridMode() === 'Graph') {
                    $canvasContainer.addClass('sw-resize');
                }
            };
            this._tr.onMouseLeave = this._bl.onMouseLeave = function() {
                $canvasContainer.removeClass('sw-resize');
            };

            this._rotationPoint.onMouseEnter = function() {
                if (self._grid.getGridMode() === 'Graph') {
                    $canvasContainer.addClass('rotation-cursor');

                }
            };
            this._rotationPoint.onMouseLeave = function() {
                $canvasContainer.removeClass('rotation-cursor');
            };

            this._updateGridPositions();

        },


        "_recordTranslation": function(point) {
            if (!this.lastMovePosition) {
                this.lastMovePosition = point;
                return void 0;
            }

            var item = this.model.get('_item'),
                dx, dy, delta;

            dx = point.x - this.lastMovePosition.x;
            dy = point.y - this.lastMovePosition.y;
            delta = new this._paperScope.Point(dx, dy);

            item.translate(delta);

            this._moveHit.translate(delta);
            this.model.get('_item').delta = delta;

            this.lastMovePosition = point;
        },

        "_locatePoints": function() {

            var item = this.model.get('_item'),
                matrix;
            if (!item) {
                return void 0;
            }

            matrix = item.matrix.clone();


            this._tl.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._relPosTL), item.position);

            this._tr.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._relPosTR), item.position);

            this._bl.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._relPosBL), item.position);

            this._br.position = this.translateOrigin(this.getPrimePositionsFromMatrix(matrix, this._relPosBR), item.position);

            if (this._pivot) {

                this._pivot.position = item.position;
            }
            if (this._moveHit) {
                this._moveHit.matrix = matrix.clone();
            }

            this.locateRotationPoint();
            this.updateBorder();
        },

        "locateRotationPoint": function() {
            if (MathUtilities.Tools.Graphing.Views.ImageTransformation.FLAG_SHOWROTATE === 0) {
                return void 0;
            }
            var topRight = this._tr.position,
                topLeft = this._tl.position,
                bottomRight = this._br.position,
                bottomLeft = this._bl.position,
                ROTATION_POINT_SHIFT = 25,
                midPoint = geomFunctions.midPoint2(topLeft.x, topLeft.y, topRight.x, topRight.y),
                coord = geomFunctions.pointAtADistanceFromMidPointWithBetterName(topLeft.x, topLeft.y, topRight.x, topRight.y, bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y, ROTATION_POINT_SHIFT);


            this._rotationPoint.position = new this._paperScope.Point(coord[0], coord[1]);

            this._rotationDandi.firstSegment.point = new this._paperScope.Point(midPoint[0], midPoint[1]);
            this._rotationDandi.lastSegment.point = new this._paperScope.Point(coord[0], coord[1]);
        },

        "translateOrigin": function(point) {
            return point;
        },

        "_updatePointsWRTMatrix": function(movingTargetName, isAccessible) {

            var det1 = this._detRight.b * this._detTop.a - this._detTop.b * this._detRight.a,
                det2 = this._detLeft.b * this._detBottom.a - this._detBottom.b * this._detLeft.a,
                det3 = this._detLeft.b * this._detTop.a - this._detTop.b * this._detLeft.a,
                det4 = this._detRight.b * this._detBottom.a - this._detBottom.b * this._detRight.a,
                trPositionX = (this._detRight.b * this._detTop.c - this._detTop.b * this._detRight.c) / det1,
                trPositionY = (this._detTop.a * this._detRight.c - this._detRight.a * this._detTop.c) / det1,
                blPositionX = (this._detLeft.b * this._detBottom.c - this._detBottom.b * this._detLeft.c) / det2,
                blPositionY = (this._detBottom.a * this._detLeft.c - this._detLeft.a * this._detBottom.c) / det2,
                tlPositionX = (this._detLeft.b * this._detTop.c - this._detTop.b * this._detLeft.c) / det3,
                tlPositionY = (this._detTop.a * this._detLeft.c - this._detLeft.a * this._detTop.c) / det3,
                brPositionX = (this._detRight.b * this._detBottom.c - this._detBottom.b * this._detRight.c) / det4,
                brPositionY = (this._detBottom.a * this._detRight.c - this._detRight.a * this._detBottom.c) / det4,
                xDifference = Math.abs(trPositionX - tlPositionX),
                yDifference = Math.abs(trPositionY - brPositionY),
                MINIMUM_FLIP_DISTANCE = MathUtilities.Tools.Graphing.Views.ImageTransformation.MINIMUM_FLIP_DISTANCE;
            if ((xDifference > MINIMUM_FLIP_DISTANCE && yDifference > MINIMUM_FLIP_DISTANCE) || isAccessible) {
                this._tr.position.x = trPositionX;
                this._tr.position.y = trPositionY;
                this._bl.position.x = blPositionX;
                this._bl.position.y = blPositionY;
                this._tl.position.x = tlPositionX;
                this._tl.position.y = tlPositionY;
                this._br.position.x = brPositionX;
                this._br.position.y = brPositionY;
            } else {
                if (xDifference <= MINIMUM_FLIP_DISTANCE) {
                    if (movingTargetName.indexOf('l') !== -1) {
                        this._tr.position.x = trPositionX;
                        this._br.position.x = brPositionX;
                        this._tl.position.x = trPositionX + MINIMUM_FLIP_DISTANCE;
                        this._bl.position.x = brPositionX + MINIMUM_FLIP_DISTANCE;
                    } else {
                        this._tr.position.x = tlPositionX - MINIMUM_FLIP_DISTANCE;
                        this._br.position.x = blPositionX - MINIMUM_FLIP_DISTANCE;
                        this._tl.position.x = tlPositionX;
                        this._bl.position.x = blPositionX;
                    }
                    if (yDifference > MINIMUM_FLIP_DISTANCE) {
                        this._tr.position.y = trPositionY;
                        this._br.position.y = brPositionY;
                        this._tl.position.y = tlPositionY;
                        this._bl.position.y = blPositionY;
                    }
                }
                if (yDifference <= MINIMUM_FLIP_DISTANCE) {
                    if (movingTargetName.indexOf('t') !== -1) {
                        this._bl.position.y = blPositionY;
                        this._br.position.y = brPositionY;
                        this._tl.position.y = brPositionY + MINIMUM_FLIP_DISTANCE;
                        this._tr.position.y = brPositionY + MINIMUM_FLIP_DISTANCE;
                    } else {
                        this._bl.position.y = tlPositionY - MINIMUM_FLIP_DISTANCE;
                        this._br.position.y = tlPositionY - MINIMUM_FLIP_DISTANCE;
                        this._tl.position.y = tlPositionY;
                        this._tr.position.y = trPositionY;
                    }
                    if (xDifference > MINIMUM_FLIP_DISTANCE) {
                        this._bl.position.x = blPositionX;
                        this._br.position.x = brPositionX;
                        this._tl.position.x = tlPositionX;
                        this._tr.position.x = trPositionX;
                    }
                }
            }
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
                this._pivot.position = midpoint;
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
            if (this._pivot) {
                this._pivot.position = this.model.get('_item').position;
            }
            this._locatePoints();
            this.updateBorder();

        },

        "rotate": function() {
            return void 0;
        },



        //***************************** MATH FUNCTIONS ******************
        "midPoint": function(point1, point2) {
            return new this._paperScope.Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
        },


        "calculateAngle": function(point1, center, point2) {
            var dx1 = point1.x - center.x,
                dx2 = point2.x - center.x,
                dy1 = point1.y - center.y,
                dy2 = point2.y - center.y,
                DEGREE_FACTOR = 180 / Math.PI,
                angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);

            angle *= DEGREE_FACTOR;
            return angle;
        },

        "distance": function(point1, point2) {
            return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
        },

        "getPrimePositionsFromMatrix": function(matrix, point) {

            var values = matrix.values,
                primePoint = new this._paperScope.Point(0, 0);
            primePoint.x = point.x * values[0] + point.y * values[2] + values[4];
            primePoint.y = point.x * values[1] + point.y * values[3] + values[5];

            return primePoint;
        },

        "getLine": function(point1, point2, throughPoint) {
            var A = point2.y - point1.y,
                B = -(point2.x - point1.x),
                C;

            if (throughPoint === void 0) {
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
        },

        "getRasterDataForAcc": function() {
            if (this._br) {
                return {
                    "bottomRight": this._br.children[0],
                    "rectangle": this._moveHit
                };
            }
        }
    }, {
        "FLAG_SHOWSCALE": 1,
        "FLAG_SHOWROTATE": 0,
        "FLAG_NOSCALEROTATE": 0,
        "FLAG_NOSCALEROTATEFORMULTIPLEIMAGESELECTION": 4,

        "allTransformationViews": null,
        "occupiedTransformationViews": null,
        "freedTransformationViews": null,
        "MINIMUM_FLIP_DISTANCE": 5,


        "getTransformationGridViewObject": function(paperScope, imageHandlerView, item, canvasContainer) {
            var ImageTransformation = MathUtilities.Tools.Graphing.Views.ImageTransformation,
                allTransformationViews = ImageTransformation.allTransformationViews,
                occupiedTransformationViews = ImageTransformation.occupiedTransformationViews,
                freedTransformationViews = ImageTransformation.freedTransformationViews,
                transformationView, len, ctr;

            if (allTransformationViews === null) {
                ImageTransformation.allTransformationViews = allTransformationViews = [];
                ImageTransformation.occupiedTransformationViews = occupiedTransformationViews = [];
                ImageTransformation.freedTransformationViews = freedTransformationViews = [];
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
                transformationView = ImageTransformation.freedTransformationViews.shift();
                ImageTransformation.occupiedTransformationViews.push(transformationView);
            } else {
                transformationView = new MathUtilities.Tools.Graphing.Views.ImageTransformation({
                    "scope": paperScope,
                    "imageHandlerView": imageHandlerView,
                    "canvasContainer": canvasContainer
                });
                ImageTransformation.allTransformationViews.push(transformationView);
                ImageTransformation.occupiedTransformationViews.push(transformationView);
            }
            return transformationView;
        }
    });
}(window.MathUtilities));
