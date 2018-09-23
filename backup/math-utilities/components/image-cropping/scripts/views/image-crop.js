(function (MathUtilities) {
    'use strict';
    MathUtilities.Components.ImageCrop.Views.CropImage = Backbone.View.extend({

        
        _originalRaster: null,
        _relTopPosTL: undefined,
        _relBottomPosBL: undefined,
        _relTopPosTR: undefined,
        _relCropPosTL: undefined,
        _relCropPosTR: undefined,
        _relCropPosBl: undefined,
        _relCropPosBR: undefined,
        _circleTL: undefined,
        _circleTR: undefined,
        _circleBL: undefined,
        _circleBR: undefined,
        _circleGroup: undefined,
        _topPositionTL: undefined,
        _bottomPosBL: undefined,
        _bottomPosBR: undefined,
        _topPositionTR: undefined,
        borderGroup: [],
        _tempWidth: null,
        _tempHeight: null,
        _cropRect: null,
        _cropRectGroup: null,
        _rectOfRaster: null,
        _rectOfRasterGroup: undefined,
        _lastPossiblePosition: null,
        flag: 0,
        _offsetValueX: undefined,
        _offsetValueY: undefined,
        circleTl: undefined,
        circleTr: undefined,
        circleBr: undefined,
        circleBl: undefined,
        _pointGroup: undefined,
        _item2: undefined,
        _canvasRect: undefined,
        _flag2: 0,
        _flag3: 0,
        _scaledValueAtX: undefined,
        _scaledValueAtY: undefined,
        _pathGroup: undefined,
        _lastActiveLayer: undefined,

        initialize: function () {
            return this;


        },

        createLine: function (parentData, anchorData, creationMethod, params) {
            var seed = {}, delta, line1, point, pt1, pt2, dist;

            switch (creationMethod) {
                case 'perpendicular':
                    seed.a = -anchorData.b;
                    seed.b = anchorData.a;
                    seed.c = -anchorData.a * parentData[0][1] + anchorData.b * parentData[0][0];
                    seed.x1 = parentData[0][0];
                    seed.y1 = parentData[0][1];
                    dist = geomFunctions.distance2(anchorData.x1, anchorData.y1, anchorData.x2, anchorData.y2);
                    point = geomFunctions.getPointAtADistance(seed.a, seed.b, seed.c, seed.x1, seed.y1, dist);
                    seed.x2 = point[0][0];
                    seed.y2 = point[0][1];
                    break;

                default:
                    seed.a = parentData[0][1] - parentData[1][1];
                    seed.b = -(parentData[0][0] - parentData[1][0]);
                    seed.c = -seed.b * parentData[0][1] - seed.a * parentData[0][0];
                    seed.x1 = parentData[0][0];
                    seed.y1 = parentData[0][1];
                    seed.x2 = parentData[1][0];
                    seed.y2 = parentData[1][1];
            }


            return seed;
        },

        setCropRect: function setCropRect(raster) {
            var engine, item, transform, PaperPoint, PaperCircle, initialPosition,
                itemWidth, itemHeight, scaledValueAtX, scaledValueAtY, group, rectangle, canvasElement,
                paperscope = this.model.get('_paperscope'),
                transformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView;
            engine = this.model.get('_engine');
            if (engine !== null) {
                canvasElement = this.model.get('_canvasElem');
                if (typeof engine.grid !== 'undefined') {
                    this._lastActiveLayer = paperscope.project.activeLayer;
                    engine.grid._projectLayers.modalLayer.activate();
                }
                engine.isCroppingInProgress = true;
            }
            this._canvasRect = new paperscope.Path.Rectangle(new paperscope.Point(0, 0), [990, 500]);
            this._canvasRect.fillColor = 'black';
            this._canvasRect.opacity = 0.65;
            item = raster;
            transform = transformationGridView.getTransformationGridViewObject(undefined, undefined, item);
            PaperPoint = paperscope.Point;
            PaperCircle = paperscope.Path.Circle;
            rectangle = paperscope.Path.Rectangle;
            initialPosition = item.position;
            itemWidth = item.width;
            itemHeight = item.height;
            scaledValueAtX = this.distance(transform._tr.position, transform._tl.position);
            scaledValueAtY = this.distance(transform._tl.position, transform._bl.position);
            this._item2 = item.clone();
            this.borderGroup = [];
            this._rectOfRaster = null;
            this._rectOfRasterGroup = undefined;
            this._cropRectGroup = undefined;
            this._relTopPosTL = new PaperPoint(-itemWidth / 2, -itemHeight / 2);
            this._relTopPosTR = new PaperPoint(itemWidth / 2, -itemHeight / 2);
            this._relBottomPosBL = new PaperPoint(-itemWidth / 2, itemHeight / 2);
            this._relCropPosTL = new PaperPoint(-itemWidth / 4, -itemHeight / 4);
            this._relCropPosTR = new PaperPoint(itemWidth / 4, -itemHeight / 4);
            this._relCropPosBL = new PaperPoint(-itemWidth / 4, itemHeight / 4);
            this._relCropPosBR = new PaperPoint(itemWidth / 4, itemHeight / 4);

            this._circleTL = new PaperCircle(new paperscope.Point(10, 10), 15);
            this._circleTR = new PaperCircle(new paperscope.Point(10, 10), 15);
            this._circleBL = new PaperCircle(new paperscope.Point(10, 10), 15);
            this._circleBR = new PaperCircle(new paperscope.Point(10, 10), 15);
            this._circleGroup = new paperscope.Group({ children: [this._circleTL, this._circleTR, this._circleBL, this._circleBR] });
            this._circleGroup.fillColor = new paperscope.Color(0, 0, 0, 0);
            this._circleGroup.strokeWidth = 2;
            this._topPositionTL = new PaperPoint(10, 10);
            this._topPositionTR = new PaperPoint(10, 10);
            this._bottomPosBL = new PaperPoint(10, 10);
            this._bottomPosBR = transform._br.position;
            item.position = new PaperPoint(0, 0);
            this._cropRect = new paperscope.Path.Rectangle(new PaperPoint(-itemWidth / 4, -itemHeight / 4), [itemWidth / 2, itemHeight / 2]);
            this._cropRect.fillColor = new paperscope.Color(0, 0, 0, 0);
            this._item2.opacity = 0.9;
            this._cropRectGroup = new paperscope.Group([this._cropRect]);
            group = new paperscope.Group(this._cropRectGroup, this._item2);
            group.clipped = true;
            this._cropRectGroup.transformContent = false;
            this._locatePoints(item);
            item.position = initialPosition;
            this._locatePoints(item);
            this._cropRect.position = this.midPoint(this._circleBR.position, this._circleTL.position);
            this._cropRectGroup.position = this.midPoint(this._circleBR.position, this._circleTL.position);
            this._drawBorder(this._circleTL.position, this._circleTR.position);
            this._drawBorder(this._circleTR.position, this._circleBR.position);
            this._drawBorder(this._circleBL.position, this._circleTL.position);
            this._drawBorder(this._circleBR.position, this._circleBL.position);
            this._circleGroup.bringToFront();
            if (this._pathGroup !== undefined) {
                this._pathGroup.remove();
            }
            this.model.set('_item', item);
            this._uiPath();


            this._circleTL.onMouseDrag = $.proxy(function (event) {
                var intersectPointOnTopTLTR, result, finalIntersectPoint, arrayOfDist;
                if (this._isEventContainsInRect(event.point)) {
                    result = this._drag(event.point, this._circleTR.position, this._circleBL.position, this._circleBR.position, this._topPositionTL);
                    if (typeof result[0] !== 'undefined') {
                        this._circleTR.position = result[0];
                    }
                    if (typeof result[1] !== 'undefined') {
                        this._circleBL.position = result[1];
                    }

                }

                else {

                    finalIntersectPoint = this._intersectPtForCirclePos(event);
                    if (typeof finalIntersectPoint === 'undefined') {
                        arrayOfDist = this._distanceBtwnEventAndAllCornerPoint(event);
                        if (arrayOfDist[0] < arrayOfDist[1] && arrayOfDist[0] < arrayOfDist[2] && arrayOfDist[0] < arrayOfDist[3]) {

                            finalIntersectPoint = this._topPositionTL;
                        }

                    }
                    if (typeof finalIntersectPoint !== 'undefined') {
                        result = this._drag(finalIntersectPoint, this._circleTR.position, this._circleBL.position, this._circleBR.position, this._topPositionTL);
                        if (typeof result[0] !== 'undefined') {
                            this._circleTR.position = result[0];
                        }
                        if (typeof result[1] !== 'undefined') {
                            this._circleBL.position = result[1];
                        }
                    }
                }
                intersectPointOnTopTLTR = this._updateAdjacentPoint(this._circleBL.position, this._topPositionTL, this._topPositionTR);
                this._circleTL.position = this._updateAdjacentPoint(this._circleTR.position, intersectPointOnTopTLTR, this._circleBL.position);
                this._updateBorder();
                this._drawRect();
                this._pathGroup.remove();
                this._uiPath();



            }, this);
            this._circleTL.onMouseEnter = $.proxy(function () {
                canvasElement.addClass('se-resize');

            }, this);

            this._circleTL.onMouseLeave = $.proxy(function () {
                canvasElement.removeClass('se-resize');

            }, this);

            this._circleTR.onMouseDrag = $.proxy(function (event) {
                var intersectPointOnTopTLTR, result, finalIntersectPoint, arrayOfDist;
                if (this._isEventContainsInRect(event.point)) {
                    result = this._drag(event.point, this._circleTL.position, this._circleBR.position, this._circleBL.position, this._topPositionTR);
                    if (typeof result[0] !== 'undefined') {
                        this._circleTL.position = result[0];
                    }
                    if (typeof result[1] !== 'undefined') {
                        this._circleBR.position = result[1];
                    }

                }

                else {

                    finalIntersectPoint = this._intersectPtForCirclePos(event);
                    if (typeof finalIntersectPoint === 'undefined') {
                        arrayOfDist = this._distanceBtwnEventAndAllCornerPoint(event);
                        if (arrayOfDist[1] < arrayOfDist[0] && arrayOfDist[1] < arrayOfDist[2] && arrayOfDist[1] < arrayOfDist[3]) {

                            finalIntersectPoint = this._topPositionTR;
                        }

                    }
                    if (finalIntersectPoint !== undefined) {
                        result = this._drag(finalIntersectPoint, this._circleTL.position, this._circleBR.position, this._circleBL.position, this._topPositionTR);
                        if (typeof result[0] !== 'undefined') {
                            this._circleTL.position = result[0];
                        }
                        if (typeof result[1] !== 'undefined') {
                            this._circleBR.position = result[1];
                        }

                    }
                }
                intersectPointOnTopTLTR = this._updateAdjacentPoint(this._circleBR.position, this._topPositionTL, this._topPositionTR);
                this._circleTR.position = this._updateAdjacentPoint(this._circleTL.position, intersectPointOnTopTLTR, this._circleBR.position);
                this._updateBorder();
                this._drawRect();
                this._pathGroup.remove();
                this._uiPath();

            }, this);
            this._circleTR.onMouseEnter = $.proxy(function () {
                canvasElement.addClass('se-resize');

            }, this);

            this._circleTR.onMouseLeave = $.proxy(function () {
                canvasElement.removeClass('se-resize');

            }, this);
            this._circleBL.onMouseDrag = $.proxy(function (event) {
                var intersectPointOnTopBLBR, result, finalIntersectPoint, arrayOfDist;
                if (this._isEventContainsInRect(event.point)) {
                    result = this._drag(event.point, this._circleBR.position, this._circleTL.position, this._circleTR.position, this._bottomPosBL);
                    if (typeof result[0] !== 'undefined') {
                        this._circleBR.position = result[0];
                    }
                    if (typeof result[1] !== 'undefined') {
                        this._circleTL.position = result[1];
                    }

                }

                else {

                    finalIntersectPoint = this._intersectPtForCirclePos(event);
                    if (finalIntersectPoint === undefined) {
                        arrayOfDist = this._distanceBtwnEventAndAllCornerPoint(event);
                        if (arrayOfDist[3] < arrayOfDist[0] && arrayOfDist[3] < arrayOfDist[2] && arrayOfDist[3] < arrayOfDist[1]) {

                            finalIntersectPoint = this._bottomPosBL;
                        }

                    }
                    if (finalIntersectPoint !== undefined) {
                        result = this._drag(finalIntersectPoint, this._circleBR.position, this._circleTL.position, this._circleTR.position, this._bottomPosBL);
                        if (typeof result[0] !== 'undefined') {
                            this._circleBR.position = result[0];
                        }
                        if (typeof result[1] !== 'undefined') {
                            this._circleTL.position = result[1];
                        }

                    }
                }
                intersectPointOnTopBLBR = this._updateAdjacentPoint(this._circleTL.position, this._bottomPosBL, transform._br.position);
                this._circleBL.position = this._updateAdjacentPoint(this._circleBR.position, intersectPointOnTopBLBR, this._circleTL.position);
                this._updateBorder();
                this._drawRect();
                this._pathGroup.remove();
                this._uiPath();
            }, this);
            this._circleBL.onMouseEnter = $.proxy(function () {
                canvasElement.addClass('se-resize');

            }, this);

            this._circleBL.onMouseLeave = $.proxy(function () {
                canvasElement.removeClass('se-resize');

            }, this);


            this._circleBR.onMouseDrag = $.proxy(function (event) {
                var intersectPointOnTopBLBR, result, finalIntersectPoint, arrayOfDist;
                if (this._isEventContainsInRect(event.point)) {
                    result = this._drag(event.point, this._circleBL.position, this._circleTR.position, this._circleTL.position, transform._br.position);
                    if (result[0] !== undefined) {
                        this._circleBL.position = result[0];
                    }
                    if (result[1] !== undefined) {
                        this._circleTR.position = result[1];
                    }

                }

                else {

                    finalIntersectPoint = this._intersectPtForCirclePos(event);
                    if (finalIntersectPoint === undefined) {
                        arrayOfDist = this._distanceBtwnEventAndAllCornerPoint(event);
                        if (arrayOfDist[2] < arrayOfDist[0] && arrayOfDist[2] < arrayOfDist[3] && arrayOfDist[2] < arrayOfDist[1]) {

                            finalIntersectPoint = this._bottomPosBR;
                        }

                    }
                    if (finalIntersectPoint !== undefined) {
                        result = this._drag(finalIntersectPoint, this._circleBL.position, this._circleTR.position, this._circleTL.position, transform._br.position);
                        if (result[0] !== undefined) {
                            this._circleBL.position = result[0];
                        }
                        if (result[1] !== undefined) {
                            this._circleTR.position = result[1];
                        }

                    }
                }
                intersectPointOnTopBLBR = this._updateAdjacentPoint(this._circleTR.position, this._bottomPosBL, transform._br.position);
                this._circleBR.position = this._updateAdjacentPoint(this._circleBL.position, intersectPointOnTopBLBR, this._circleTR.position);
                this._updateBorder();
                this._drawRect();
                this._pathGroup.remove();
                this._uiPath();
            }, this);
            this._circleBR.onMouseEnter = $.proxy(function () {
                canvasElement.addClass('se-resize');

            }, this);

            this._circleBR.onMouseLeave = $.proxy(function () {
                canvasElement.removeClass('se-resize');

            }, this);

            group.onMouseDrag = $.proxy(function (event) {
                if (this._flag2 !== 1) {
                    return;
                }
                this._onMouseDrag(event, event.point, this._cropRectGroup);
            }, this);

            this._canvasRect.onMouseUp = $.proxy(function () {
                this._flag2 = 0;

            }, this);

            group.onMouseUp = $.proxy(function () {
                this._flag2 = 0;

            }, this);
            group.onMouseDown = $.proxy(function (event) {
                if (!this._cropRectGroup.contains(event.point)) {
                    return;
                }
                this._flag2 = 1;
                this._offsetValueX = this._cropRectGroup.position.x - event.point.x;
                this._offsetValueY = this._cropRectGroup.position.y - event.point.y;
            }, this);

            group.onMouseMove = $.proxy(function (event) {
                if (this._cropRectGroup.contains(event.point)) {
                    canvasElement.addClass('move');
                }
                else {
                    canvasElement.removeClass('move');
                }
            }, this);
        },


        _onMouseDrag: function _onMouseDrag(event, eventPoint, group) {
            var item, paperscope, transform, matrix, scaledValueAtX,
            scalingFactorX, scaledValueAtY, scalingFactorY, nextPos, tlPoint, trPoint,
            blPoint, brPoint, nextPossiblePos, intersectPointOnTop, intersectPointOnRight, intersectPointOnBottom, intersectPointOnLeft,
                arrayOfIntersectPoints, finalIntersectPoints = [], j, i, k = 0, finalIntersectPoint, distanceFromPoints = [], temp, m = 0,
				distanceFromTL, distanceFromTR, distanceFromBL, distanceFromBR, arrayOfDistance;

            
            item = this.model.get('_item');
            paperscope = this.model.get('_paperscope');
            transform = this.model.get('_transform');
            matrix = item.matrix.clone();
            scaledValueAtX = this.distance(this._topPositionTR, this._topPositionTL);
            scalingFactorX = item.width / scaledValueAtX;
            scaledValueAtY = this.distance(this._topPositionTL, this._bottomPosBL);
            scalingFactorY = item.height / scaledValueAtY;
            nextPos = new paperscope.Point(0, 0);
            this.flag = 0;
            if (this._rectOfRasterGroup === undefined) {
                this._rectOfRaster = new paperscope.Path.Rectangle(new paperscope.Point(this._topPositionTL), [(scaledValueAtX - (this.distance(this._circleTL.position, this._circleTR.position))) * scalingFactorX, (scaledValueAtY - (this.distance(this._circleTL.position, this._circleBL.position))) * scalingFactorY]);
                this._rectOfRaster.fillColor = new paperscope.Color(0, 0, 0, 0);
                tlPoint = new paperscope.Point(this._rectOfRaster.bounds.topLeft);
                trPoint = new paperscope.Point(this._rectOfRaster.bounds.topRight);
                blPoint = new paperscope.Point(this._rectOfRaster.bounds.bottomLeft);
                brPoint = new paperscope.Point(this._rectOfRaster.bounds.bottomRight);

                this.circleTl = new paperscope.Path.Circle(new paperscope.Point(10, 10), 1);
                this.circleTr = new paperscope.Path.Circle(new paperscope.Point(10, 10), 1);
                this.circleBr = new paperscope.Path.Circle(new paperscope.Point(10, 10), 1);
                this.circleBl = new paperscope.Path.Circle(new paperscope.Point(10, 10), 1);
                this._pointGroup = new paperscope.Group({ children: [this.circleTl, this.circleTr, this.circleBr, this.circleBl]/*, fillColor: 'rgb(138,87,222)'*/ });
                this._rectOfRasterGroup = new paperscope.Group([this._rectOfRaster]);
                this._rectOfRasterGroup.transformContent = false;
                this._rectOfRasterGroup.matrix = matrix;
                this._rectOfRasterGroup.position = this.midPoint(this._topPositionTR, this._bottomPosBL);
                this.circleTl.position = this.getPrimePositionsFromMatrix(this._rectOfRasterGroup.matrix, tlPoint);
                this.circleTr.position = this.getPrimePositionsFromMatrix(this._rectOfRasterGroup.matrix, trPoint);
                this.circleBl.position = this.getPrimePositionsFromMatrix(this._rectOfRasterGroup.matrix, blPoint);
                this.circleBr.position = this.getPrimePositionsFromMatrix(this._rectOfRasterGroup.matrix, brPoint);


                this._pointGroup.position = this._rectOfRasterGroup.position;
                this._rectOfRasterGroup.sendToBack();

            }
            nextPossiblePos = new paperscope.Point(event.point.x + this._offsetValueX, this._offsetValueY + event.point.y);

            if (this._rectOfRasterGroup.contains(nextPossiblePos)) {
                nextPos = nextPossiblePos;
            }
            else {

                intersectPointOnTop = this._updateAdjacentPoint(nextPossiblePos, this.circleTl.position, this.circleTr.position);
                intersectPointOnRight = this._updateAdjacentPoint(nextPossiblePos, this.circleTr.position, this.circleBr.position);
                intersectPointOnBottom = this._updateAdjacentPoint(nextPossiblePos, this.circleBr.position, this.circleBl.position);
                intersectPointOnLeft = this._updateAdjacentPoint(nextPossiblePos, this.circleBl.position, this.circleTl.position);
                arrayOfIntersectPoints = [intersectPointOnTop, intersectPointOnRight, intersectPointOnBottom, intersectPointOnLeft];

                for (i = 0; i < 4; i++) {
                    if (this._isPointOnRect(arrayOfIntersectPoints[i])) {
                        finalIntersectPoints[k] = arrayOfIntersectPoints[i];
                        k++;
                    }

                }
                if (finalIntersectPoints.length > 1) {

                    for (i = 0; i < finalIntersectPoints.length; i++) {
                        distanceFromPoints[i] = this.distance(nextPossiblePos, finalIntersectPoints[i]);
                    }

                    for (i = 0; i < distanceFromPoints.length; i++) {
                        for (m = i + 1; m < distanceFromPoints.length; m++) {
                            if (distanceFromPoints[i] > distanceFromPoints[m]) {

                                temp = distanceFromPoints[i];
                                distanceFromPoints[i] = distanceFromPoints[m];
                                distanceFromPoints[m] = temp;

                                temp = finalIntersectPoints[i];
                                finalIntersectPoints[i] = finalIntersectPoints[m];
                                finalIntersectPoints[m] = temp;

                            }
                        }
                    }

                    finalIntersectPoint = finalIntersectPoints[0];
                }

                if (typeof finalIntersectPoint !== 'undefined') {
                    nextPos = finalIntersectPoint;
                }

                else {

                    distanceFromTL = this.distance(nextPossiblePos, this.circleTl.position);
                    distanceFromTR = this.distance(nextPossiblePos, this.circleTr.position);
                    distanceFromBL = this.distance(nextPossiblePos, this.circleBl.position);
                    distanceFromBR = this.distance(nextPossiblePos, this.circleBr.position);
                    arrayOfDistance = [distanceFromTL, distanceFromTR, distanceFromBL, distanceFromBR];


                    for (i = 0; i < arrayOfDistance.length; i++) {
                        for (j = i + 1; j < arrayOfDistance.length; j++) {
                            if (arrayOfDistance[i] > arrayOfDistance[j]) {
                                temp = arrayOfDistance[i];
                                arrayOfDistance[i] = arrayOfDistance[j];
                                arrayOfDistance[j] = temp;
                            }
                        }

                    }
                    if (arrayOfDistance[0] === distanceFromTL) {
                        nextPos = this.circleTl.position;
                    }
                    if (arrayOfDistance[0] === distanceFromTR) {
                        nextPos = this.circleTr.position;
                    }
                    if (arrayOfDistance[0] === distanceFromBL) {
                        nextPos = this.circleBl.position;
                    }
                    if (arrayOfDistance[0] === distanceFromBR) {
                        nextPos = this.circleBr.position;
                    }
                }
            }

            this._cropRectGroup.position = nextPos;
            this._circleTL.position = this.getPrimePositionsFromMatrix(group.matrix, group.children[0].bounds.topLeft);
            this._circleTR.position = this.getPrimePositionsFromMatrix(group.matrix, group.children[0].bounds.topRight);
            this._circleBL.position = this.getPrimePositionsFromMatrix(group.matrix, group.children[0].bounds.bottomLeft);
            this._circleBR.position = this.getPrimePositionsFromMatrix(group.matrix, group.children[0].bounds.bottomRight);
            this._updateBorder();
            this._pathGroup.remove();
            this._uiPath();

        },

        _drawRect: function _drawRect() {
            var item, paperscope, transform, matrix, scaledValueAtX,
            scalingFactorX, scaledValueAtY, scalingFactorY, group, canvasElement;

            
            canvasElement = this.model.get('_canvasElem');
            item = this.model.get('_item');
            paperscope = this.model.get('_paperscope');
            transform = this.model.get('_transform');
            matrix = item.matrix.clone();
            scaledValueAtX = this.distance(this._topPositionTR, this._topPositionTL);
            scalingFactorX = item.width / scaledValueAtX;
            scaledValueAtY = this.distance(this._topPositionTL, this._bottomPosBL);
            scalingFactorY = item.height / scaledValueAtY;
            if (this._cropRectGroup !== undefined) {
                this._cropRectGroup.remove();
            }
            this._cropRect = new paperscope.Path.Rectangle(this._circleTL.position, [this.distance(this._circleTL.position, this._circleTR.position) * scalingFactorX, this.distance(this._circleTL.position, this._circleBL.position) * scalingFactorY]);
            this._cropRect.fillColor = new paperscope.Color(0, 0, 0, 0);
            this._cropRectGroup = new paperscope.Group([this._cropRect]);
            group = new paperscope.Group([this._cropRectGroup, this._item2]);
            group.clipped = true;
            this._cropRectGroup.transformContent = false;
            this._cropRectGroup.matrix = matrix;
            this._cropRect.position = this.midPoint(this._circleTL.position, this._circleBR.position);
            this._cropRectGroup.position = this.midPoint(this._circleTL.position, this._circleBR.position);
            this._circleGroup.bringToFront();
            this._rectOfRasterGroup = undefined;
            group.onMouseDrag = $.proxy(function (event) {
                if (this._flag2 !== 1) {
                    return;
                }
                this._onMouseDrag(event, event.point, this._cropRectGroup);
            }, this);
            group.onMouseUp = $.proxy(function () {
                this._flag2 = 0;
            }, this);
            group.onMouseDown = $.proxy(function (event) {
                if (!this._cropRectGroup.contains(event.point)) {
                    return;
                }
                this._flag2 = 1;
                this._offsetValueX = this._cropRectGroup.position.x - event.point.x;
                this._offsetValueY = this._cropRectGroup.position.y - event.point.y;
            }, this);
            group.onMouseMove = $.proxy(function (event) {
                if (this._cropRectGroup.contains(event.point)) {
                    canvasElement.addClass('move');
                }
                else {
                    canvasElement.removeClass('move');
                }
            }, this);
        },



        _locatePoints: function _locatePoints(item) {
            var matrix = item.matrix.clone();
            this._circleTL.position = this.getPrimePositionsFromMatrix(matrix, this._relCropPosTL);
            this._circleTR.position = this.getPrimePositionsFromMatrix(matrix, this._relCropPosTR);
            this._circleBL.position = this.getPrimePositionsFromMatrix(matrix, this._relCropPosBL);
            this._circleBR.position = this.getPrimePositionsFromMatrix(matrix, this._relCropPosBR);
            this._topPositionTL = this.getPrimePositionsFromMatrix(matrix, this._relTopPosTL);
            this._bottomPosBL = this.getPrimePositionsFromMatrix(matrix, this._relBottomPosBL);
            this._topPositionTR = this.getPrimePositionsFromMatrix(matrix, this._relTopPosTR);
            this._cropRectGroup.matrix = matrix;
        },

        _findIntersect: function _findIntersect(line1, line2) {
            var paperscope = this.model.get('_paperscope'),
              intersect = new paperscope.Point(0, 0),
                det = line1.a * line2.b - line2.a * line1.b;
            intersect.x = -(line2.b * line1.c - line1.b * line2.c) / det;
            intersect.y = -(line1.a * line2.c - line2.a * line1.c) / det;
            return intersect;
        },


        _updateAdjacentPoint: function _updateAdjacentPoint(currentPoint, adjacentPoint, oppositePoint) {
            var coordOfInitialAdjacentPoint = [adjacentPoint.x, adjacentPoint.y],
              coordOfOppositePoint = [oppositePoint.x, oppositePoint.y],
              arrayDataForLine = [coordOfInitialAdjacentPoint, coordOfOppositePoint],
              line = this.createLine(arrayDataForLine),
               perpendicularLine = this.createLine([[currentPoint.x, currentPoint.y]], line, 'perpendicular'),
              intersectPoint = this._findIntersect(line, perpendicularLine);
            return intersectPoint;

        },

        _drawBorder: function _drawBorder(pos1, pos2) {
            var border,
            paperscope = this.model.get('_paperscope');
            border = new paperscope.Path.Line(pos1.clone(), pos2.clone());
            border.dashArray = [6, 4];
            border.strokeColor = 'white';
            border.strokeWidth = 2;
            this.borderGroup.push(border);
            return border;

        },

        _isEventContainsInRect: function _isEventContainsInRect(eventPoint) {
            var transform = this.model.get('_transform');
            if (!transform._moveHit.contains(eventPoint)) {
                return false;
            }
            else {
                return true;
            }

        },



        _drag: function _drag(eventPoint, point1, point2, oppositePoint, pointOnBigRect) {
            var intersectPoint1 = this._updateAdjacentPoint(eventPoint, point1, oppositePoint),
            intersectPoint2 = this._updateAdjacentPoint(eventPoint, point2, oppositePoint),
            minWidth = this.distance(eventPoint, intersectPoint1), interSectPointOnAdjacentLine,
            minHeight = this.distance(eventPoint, intersectPoint2),
            arrayOfPoints = [], interSectPointOnOppositeLine, distanceOfIntersectPointToPointOnBigRect,
            disBtwnOppositeAndpointOnBigRect = this.distance(oppositePoint, pointOnBigRect);
            if (minWidth > 40) {
                interSectPointOnOppositeLine = this._updateAdjacentPoint(eventPoint, point2, oppositePoint),
                distanceOfIntersectPointToPointOnBigRect = this.distance(interSectPointOnOppositeLine, pointOnBigRect);
                if ((disBtwnOppositeAndpointOnBigRect - distanceOfIntersectPointToPointOnBigRect) > 0) {
                    arrayOfPoints[1] = interSectPointOnOppositeLine;
                }

            }

            if (minHeight > 40) {
                interSectPointOnAdjacentLine = this._updateAdjacentPoint(eventPoint, point1, oppositePoint),
                distanceOfIntersectPointToPointOnBigRect = this.distance(interSectPointOnAdjacentLine, pointOnBigRect);
                if ((disBtwnOppositeAndpointOnBigRect - distanceOfIntersectPointToPointOnBigRect) > 0) {
                    arrayOfPoints[0] = interSectPointOnAdjacentLine;
                }
            }
            return arrayOfPoints;
        },

        _isPointOnRect: function _isPointOnRect(intersectPoint) {
            var arrayOfX = [], arrayOfY = [], arrayOfCirclePos = [this.circleTl.position, this.circleTr.position, this.circleBr.position, this.circleBl.position, this.circleTl.position];
            if (arrayOfCirclePos[this.flag].x > arrayOfCirclePos[this.flag + 1].x) {
                arrayOfX[0] = Math.floor(arrayOfCirclePos[this.flag + 1].x);
                arrayOfX[1] = Math.floor(arrayOfCirclePos[this.flag].x);
            }
            else {
                arrayOfX[0] = Math.floor(arrayOfCirclePos[this.flag].x);
                arrayOfX[1] = Math.floor(arrayOfCirclePos[this.flag + 1].x);
            }
            if (arrayOfCirclePos[this.flag].y > arrayOfCirclePos[this.flag + 1].y) {
                arrayOfY[0] = Math.floor(arrayOfCirclePos[this.flag + 1].y);
                arrayOfY[1] = Math.floor(arrayOfCirclePos[this.flag].y);
            }
            else {
                arrayOfY[0] = Math.floor(arrayOfCirclePos[this.flag].y);
                arrayOfY[1] = Math.floor(arrayOfCirclePos[this.flag + 1].y);
            }

            if (Math.floor(intersectPoint.x) >= arrayOfX[0] && Math.floor(intersectPoint.x) <= arrayOfX[1] && Math.floor(intersectPoint.y) >= arrayOfY[0] && Math.floor(intersectPoint.y) <= arrayOfY[1]) {
                this.flag++;
                return true;
            }
            else {
                this.flag++;
                return false;
            }
        },

        _relocateBorder: function _relocateBorder(border, pos1, pos2) {
            border.firstSegment.point = pos1;
            border.lastSegment.point = pos2;

        },

        _updateBorder: function updateBorder() {
            this._relocateBorder(this.borderGroup[0], this._circleTL.position, this._circleTR.position);
            this._relocateBorder(this.borderGroup[1], this._circleTR.position, this._circleBR.position);
            this._relocateBorder(this.borderGroup[2], this._circleTL.position, this._circleBL.position);
            this._relocateBorder(this.borderGroup[3], this._circleBL.position, this._circleBR.position);
        },


        getCroppedRaster: function getCroppedRaster() {
            var item = this.model.get('_item'),
                paperScope = this.model.get('_paperscope'),
                valueAtX = this.distance(this._relTopPosTL, this._relTopPosTR),
                scaledValueAtX = this.distance(this._topPositionTR, this._topPositionTL),
                scalingFactorX = valueAtX / scaledValueAtX,
                valueAtY = this.distance(this._relTopPosTL, this._relBottomPosBL),
                scaledValueAtY = this.distance(this._topPositionTL, this._bottomPosBL),
                scalingFactorY = valueAtY / scaledValueAtY,
                intersectPoint = this._updateAdjacentPoint(this._circleTL.position, this._topPositionTL, this._bottomPosBL),
                cropPtX = this.distance(intersectPoint, this._circleTL.position) * scalingFactorX,
                cropPtY = this.distance(intersectPoint, this._topPositionTL) * scalingFactorY,
                cropPt = new paperScope.Point(cropPtX, cropPtY),
                intersectPoint2 = this._updateAdjacentPoint(this._circleBR.position, this._topPositionTL, this._bottomPosBL),
                cropPtX2 = this.distance(intersectPoint2, this._circleBR.position) * scalingFactorX,
                cropPtY2 = this.distance(intersectPoint2, this._topPositionTL) * scalingFactorY,
                cropPt2 = new paperScope.Point(cropPtX2, cropPtY2),
                cropRectTopLeft, cropRectBottomRight;

            cropRectTopLeft = cropPt;
            cropRectBottomRight = cropPt2;

            cropRectTopLeft.x = cropRectTopLeft.x < 0 ? 0 : cropRectTopLeft.x
            cropRectTopLeft.y = cropRectTopLeft.y < 0 ? 0 : cropRectTopLeft.y

            cropRectBottomRight.x = cropRectBottomRight.x > item.size._width ? item.size._width : cropRectBottomRight.x;
            cropRectBottomRight.y = cropRectBottomRight.y > item.size._height ? item.size._height : cropRectBottomRight.y;

            this.trigger('okClicked', cropRectTopLeft, cropRectBottomRight);
            this.clearCroppingObjects(item);
        },
        _intersectPtForCirclePos: function (event) {

            var intersectPointOnTop, intersectPointOnRight, intersectPointOnBottom, intersectPointOnLeft,
                arrayOfIntersectPoints, finalIntersectPoints = [], i, k = 0, finalIntersectPoint,
                nextPossiblePos = event.point, arrayOfCornerPoints, transform, distanceFromPoints = [], temp, m = 0;
            transform = this.model.get('_transform');
            this._flag3 = 0;
            arrayOfCornerPoints = [this._topPositionTL, this._topPositionTR, this._bottomPosBR, this._bottomPosBL];
            intersectPointOnTop = this._updateAdjacentPoint(nextPossiblePos, arrayOfCornerPoints[0], arrayOfCornerPoints[1]);
            intersectPointOnRight = this._updateAdjacentPoint(nextPossiblePos, arrayOfCornerPoints[1], arrayOfCornerPoints[2]);
            intersectPointOnBottom = this._updateAdjacentPoint(nextPossiblePos, arrayOfCornerPoints[2], arrayOfCornerPoints[3]);
            intersectPointOnLeft = this._updateAdjacentPoint(nextPossiblePos, arrayOfCornerPoints[3], arrayOfCornerPoints[0]);
            arrayOfIntersectPoints = [intersectPointOnTop, intersectPointOnRight, intersectPointOnBottom, intersectPointOnLeft];

            for (i = 0; i < 4; i++) {

                if (this._isIntersectPointForCirclePosOnRect(arrayOfIntersectPoints[i])) {

                    finalIntersectPoints[k] = arrayOfIntersectPoints[i];
                    k++;
                }
            }
            if (finalIntersectPoints.length > 1) {
                for (i = 0; i < finalIntersectPoints.length; i++) {
                    distanceFromPoints[i] = this.distance(nextPossiblePos, finalIntersectPoints[i]);
                }

                for (i = 0; i < distanceFromPoints.length; i++) {
                    for (m = i + 1; m < distanceFromPoints.length; m++) {
                        if (distanceFromPoints[i] > distanceFromPoints[m]) {

                            temp = distanceFromPoints[i];
                            distanceFromPoints[i] = distanceFromPoints[m];
                            distanceFromPoints[m] = temp;

                            temp = finalIntersectPoints[i];
                            finalIntersectPoints[i] = finalIntersectPoints[m];
                            finalIntersectPoints[m] = temp;

                        }
                    }
                }

                finalIntersectPoint = finalIntersectPoints[0];
            }
            return finalIntersectPoint;

        },
        //to find intersection point for circle pos when event is outside

        _isIntersectPointForCirclePosOnRect: function (intersectPoint) {
            var arrayOfX = [], arrayOfY = [], arrayOfCirclePos = [this._topPositionTL, this._topPositionTR, this._bottomPosBR, this._bottomPosBL, this._topPositionTL];
            if (arrayOfCirclePos[this._flag3].x > arrayOfCirclePos[this._flag3 + 1].x) {
                arrayOfX[0] = Math.round(arrayOfCirclePos[this._flag3 + 1].x);
                arrayOfX[1] = Math.round(arrayOfCirclePos[this._flag3].x);
            }
            else {
                arrayOfX[0] = Math.round(arrayOfCirclePos[this._flag3].x);
                arrayOfX[1] = Math.round(arrayOfCirclePos[this._flag3 + 1].x);
            }
            if (arrayOfCirclePos[this._flag3].y > arrayOfCirclePos[this._flag3 + 1].y) {
                arrayOfY[0] = Math.round(arrayOfCirclePos[this._flag3 + 1].y);
                arrayOfY[1] = Math.round(arrayOfCirclePos[this._flag3].y);
            }
            else {
                arrayOfY[0] = Math.round(arrayOfCirclePos[this._flag3].y);
                arrayOfY[1] = Math.round(arrayOfCirclePos[this._flag3 + 1].y);
            }
            if (Math.round(intersectPoint.x) >= arrayOfX[0] && Math.round(intersectPoint.x) <= arrayOfX[1] && Math.round(intersectPoint.y) >= arrayOfY[0] && Math.round(intersectPoint.y) <= arrayOfY[1]) {
                this._flag3++;
                return true;
            }
            else {
                this._flag3++;
                return false;
            }

        },


        _distanceBtwnEventAndAllCornerPoint: function (event) {
            var distFromTl, distFromTr, distFromBl, distFromBr, transform, arrayOfDist;
            transform = this.model.get('_transform');
            distFromTl = this.distance(event.point, this._topPositionTL);
            distFromTr = this.distance(event.point, this._topPositionTR);
            distFromBr = this.distance(event.point, this._bottomPosBR);
            distFromBl = this.distance(event.point, this._bottomPosBL);

            arrayOfDist = [distFromTl, distFromTr, distFromBr, distFromBl];
            return arrayOfDist;
        },


        clearCroppingObjects: function clearCroppingObjects() {
            var paperscope = this.model.get('_paperscope'), engine = this.model.get('_engine');
            this._item2.remove();

            if (typeof this._canvasRect !== 'undefined') {
                this._canvasRect.remove();
            }

            if (typeof this._circleGroup !== 'undefined') {
                this._circleGroup.remove();
                this.borderGroup[0].remove();
                this.borderGroup[1].remove();
                this.borderGroup[2].remove();
                this.borderGroup[3].remove();
                this._cropRectGroup.remove();
                this._pathGroup.remove();

            }
            if (typeof this._rectOfRasterGroup !== 'undefined') {
                this._rectOfRasterGroup.remove();
            }

            if (typeof this._pointGroup !== 'undefined') {
                this._pointGroup.remove();
            }
            if (engine !== null) {
                engine.isCroppingInProgress = false;
                if (typeof engine.grid !== 'undefined') {
                    this._lastActiveLayer.activate();
                }
            }
            paperscope.view.draw();
        },




        _uiPath: function () {
            var tlGroup, paperscope, pointForTL, trGroup, blGroup, brGroup,
            pointForTR, pointForBL, pointForBR, trLargeSegment, trSmallSegment, brLargeSegment,
            brSmallSegment, blSmallSegment, blLargeSegment, lDist, sDistHor, sDistVer,
             item, scaledValueAtX, matrix, scalingFactorX, scaledValueAtY, scalingFactorY, strokeLWidth, strokeSWidth,
             tlLargeSegment, tlSmallSegment, transform;
            item = this.model.get('_item');
            paperscope = this.model.get('_paperscope');
            transform = this.model.get('_transform');
            matrix = item.matrix.clone();
            scaledValueAtX = this.distance(this._topPositionTR, this._topPositionTL);
            scalingFactorX = item.width / scaledValueAtX;
            scaledValueAtY = this.distance(this._topPositionTL, this._bottomPosBL);
            scalingFactorY = item.height / scaledValueAtY;
            pointForTL = new paperscope.Point(this._circleTL.position.x, this._circleTL.position.y);
            pointForTR = new paperscope.Point(this._circleTR.position.x, this._circleTR.position.y);
            pointForBL = new paperscope.Point(this._circleBL.position.x, this._circleBL.position.y);
            pointForBR = new paperscope.Point(this._circleBR.position.x, this._circleBR.position.y);
            strokeLWidth = 3;
            strokeSWidth = 1;
            lDist = 8;
            sDistHor = 5;
            sDistVer = 4;

            tlLargeSegment = new paperscope.Path({
                segments: [[pointForTL.x * scalingFactorX, (pointForTL.y + lDist) * scalingFactorY], [pointForTL.x * scalingFactorX, pointForTL.y * scalingFactorY], [(pointForTL.x + lDist) * scalingFactorX, pointForTL.y * scalingFactorY]]
            });


            tlSmallSegment = new paperscope.Path({
                segments: [[(pointForTL.x - sDistHor) * scalingFactorX, pointForTL.y * scalingFactorY], [pointForTL.x * scalingFactorX, pointForTL.y * scalingFactorY], [pointForTL.x * scalingFactorX, (pointForTL.y - sDistVer) * scalingFactorY]]

            });
            tlLargeSegment.strokeWidth = strokeLWidth;
            tlSmallSegment.strokeWidth = strokeSWidth;
            tlGroup = new paperscope.Group({ children: [tlSmallSegment, tlLargeSegment], strokeColor: 'white' });
            tlGroup.matrix = matrix;
            tlGroup.position = pointForTL;

            trLargeSegment = new paperscope.Path({
                segments: [[(pointForTR.x - lDist) * scalingFactorX, (pointForTR.y) * scalingFactorY], [pointForTR.x * scalingFactorX, pointForTR.y * scalingFactorY], [(pointForTR.x) * scalingFactorX, (pointForTR.y + lDist) * scalingFactorY]]
            });

            trSmallSegment = new paperscope.Path({
                segments: [[(pointForTR.x + sDistHor) * scalingFactorX, pointForTR.y * scalingFactorY], [pointForTR.x * scalingFactorX, pointForTR.y * scalingFactorY], [pointForTR.x * scalingFactorX, (pointForTR.y - sDistVer) * scalingFactorY]]

            });
            trLargeSegment.strokeWidth = strokeLWidth;
            trSmallSegment.strokeWidth = strokeSWidth;
            trGroup = new paperscope.Group({ children: [trSmallSegment, trLargeSegment], strokeColor: 'white' });
            trGroup.matrix = matrix;
            trGroup.position = pointForTR;

            brLargeSegment = new paperscope.Path({
                segments: [[(pointForBR.x - lDist) * scalingFactorX, (pointForBR.y) * scalingFactorY], [pointForBR.x * scalingFactorX, pointForBR.y * scalingFactorY], [(pointForBR.x) * scalingFactorX, (pointForBR.y - lDist) * scalingFactorY]]
            });

            brSmallSegment = new paperscope.Path({
                segments: [[(pointForBR.x + sDistHor) * scalingFactorX, pointForBR.y * scalingFactorY], [pointForBR.x * scalingFactorX, pointForBR.y * scalingFactorY], [pointForBR.x * scalingFactorX, (pointForBR.y + sDistVer) * scalingFactorY]]

            });
            brLargeSegment.strokeWidth = strokeLWidth;
            brSmallSegment.strokeWidth = strokeSWidth;
            brGroup = new paperscope.Group({ children: [brSmallSegment, brLargeSegment], strokeColor: 'white' });
            brGroup.matrix = matrix;
            brGroup.position = pointForBR;


            blLargeSegment = new paperscope.Path({
                segments: [[(pointForBL.x) * scalingFactorX, (pointForBL.y - lDist) * scalingFactorY], [pointForBL.x * scalingFactorX, pointForBL.y * scalingFactorY], [(pointForBL.x + lDist) * scalingFactorX, (pointForBL.y) * scalingFactorY]]
            });

            blSmallSegment = new paperscope.Path({
                segments: [[(pointForBL.x - sDistHor) * scalingFactorX, pointForBL.y * scalingFactorY], [pointForBL.x * scalingFactorX, pointForBL.y * scalingFactorY], [pointForBL.x * scalingFactorX, (pointForBL.y + sDistVer) * scalingFactorY]]

            });
            blLargeSegment.strokeWidth = strokeLWidth;
            blSmallSegment.strokeWidth = strokeSWidth;
            blGroup = new paperscope.Group({ children: [blSmallSegment, blLargeSegment], strokeColor: 'white' });
            blGroup.matrix = matrix;
            blGroup.position = pointForBL;
            this._pathGroup = new paperscope.Group([tlGroup, trGroup, blGroup, brGroup]);
            this._circleGroup.bringToFront();
        },

        _isPointLiesBtwnGivenPts: function _isPointLiesBtwnGivenPts(pointForCheck, givenPoint1, givenPoint2) {
            var arrayOfX = [], arrayOfY = [];

            if (givenPoint1.x > givenPoint2.x) {
                arrayOfX[0] = Math.round(givenPoint2.x);
                arrayOfX[1] = Math.round(givenPoint1.x);
            }
            else {
                arrayOfX[0] = Math.round(givenPoint1.x);
                arrayOfX[1] = Math.round(givenPoint2.x);
            }
            if (givenPoint1.y > givenPoint2.y) {
                arrayOfY[0] = Math.round(givenPoint2.y);
                arrayOfY[1] = Math.round(givenPoint1.y);
            }
            else {
                arrayOfY[0] = Math.round(givenPoint1.y);
                arrayOfY[1] = Math.round(givenPoint2.y);
            }
            if (Math.round(pointForCheck.x) >= arrayOfX[0] && Math.round(pointForCheck.x) <= arrayOfX[1] && Math.round(pointForCheck.y) >= arrayOfY[0] && Math.round(pointForCheck.y) <= arrayOfY[1]) {
                return true;
            }
            else {
                return false;
            }


        },
        _ValidPointFromDistance: function _ValidPointFromDistance(point1, pointForDistance, distance, type) {
            var line, minPoint, dataForLine, pointsForLine, point1ForLine, point2ForLine, paperscope, transform;
            paperscope = this.model.get('_paperscope');
            transform = this.model.get('_transform');
            dataForLine = [[point1.x, point1.y], [pointForDistance.x, pointForDistance.y]];


            line = this.createLine(dataForLine);
            pointsForLine = geomFunctions.getPointAtADistance(line.a, line.b, line.c, pointForDistance.x, pointForDistance.y, distance);
            point1ForLine = new paperscope.Point(pointsForLine[0][0], pointsForLine[0][1]);
            point2ForLine = new paperscope.Point(pointsForLine[1][0], pointsForLine[1][1]);

            if (type === 'outside') {
                if ((this._isPointLiesBtwnGivenPts(point1ForLine, point1, pointForDistance)) === false) {
                    minPoint = point1ForLine;
                }
                else if ((this._isPointLiesBtwnGivenPts(point2ForLine, point1, pointForDistance)) === false) {
                    minPoint = point2ForLine;
                }
                return minPoint;
            }
            else {
                if ((this._isPointLiesBtwnGivenPts(point1ForLine, point1, pointForDistance)) === true) {
                    minPoint = point1ForLine;
                }
                else if ((this._isPointLiesBtwnGivenPts(point2ForLine, point1, pointForDistance)) === true) {
                    minPoint = point2ForLine;
                }
                return minPoint;
            }
        },

        /*transformation calculation functions*/
        distance: function distance(point1, point2) {
            return Math.sqrt((point2.y - point1.y) * (point2.y - point1.y) + (point2.x - point1.x) * (point2.x - point1.x));
        },

        midPoint: function midPoint(point1, point2) {
            var paperscope = this.model.get('_paperscope');
            return new paperscope.Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
        },

        getPrimePositionsFromMatrix: function getPrimePositionsFromMatrix(matrix, point) {

            var values = matrix.values, paperscope = this.model.get('_paperscope'),
                primePoint = new paperscope.Point(0, 0);
            primePoint.x = point.x * values[0] + point.y * values[2] + values[4];
            primePoint.y = point.x * values[1] + point.y * values[3] + values[5];

            return primePoint;
        }
    });
} (window.MathUtilities));