(function () {
    'use strict';

    var Utils = MathInteractives.Common.Utilities.Models.Utils;

    //Global parameters: MathInteractives, Backbone


    /**
    * Creates a view for the piece.
    * @class Piece
    * @namespace MathInteractives.Interactivities.PicturePerfect
    * @submodule MathInteractives.Interactivities.PicturePerfect.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.PicturePerfect.Views.Shape = MathInteractives.Common.Player.Views.Base.extend({

        boundingBox: null,
        /**
        * Reference to Circle Group of The View
        * @property circleGroup
        * @type Object
        * @default null
        */
        circleGroup: null,
        /**
        * Reference to Pivot
        * @property pivot
        * @type Object
        * @default null
        */
        pivot: null,
        /**
        * Reference to Repair Roads View
        * @property repairRoadsView
        * @type Backbone.View
        * @default null
        */
        repairRoadsView: null,
        /**
       * Reference to Paper Scope
       * @property paperScope
       * @type Object 
       * @default null
       */
        paperScope: null,
        /**
      * Reference to Current Tool
      * @property currentTool
      * @type Object 
      * @default null
      */
        currentTool: null,
        /**
      * Collection of models
      * @property collection
      * @type Backbone.Collection 
      * @default null
      */
        collection: null,
        /**
         *Path of Arrow Image
         * @property arrowImagePath
         * @type String 
         * @default null
         */
        arrowImagePath: null,

        entirePath: null,

        /**
         * Stores removed angle group for future use
         * @property removedAngleGroup
         * @type Object 
         * @default null
         */
        removedAngleGroup: {},

        /**
         * If shape is snapped or not on mouse up
         * @property isSnapped
         * @type Bool 
         * @default false
         */
        isSnapped: false,

        cursors: MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.CURSOR_TYPE,

        /**
         * If mouse up happen on the shape then change the cursor accordingly
         * @property isMouseupOnShape
         * @type Bool 
         * @default true
         */
        isMouseupOnShape: false,

        /**
         * If shape is dragging then change the cursor accordingly on mouseenter and mouseleave
         * @property isShapeDragged
         * @type Bool 
         * @default false
         */
        isShapeDragged: false,

        tooltipMode: -1,

        angleLabels: null,

        /**
      * Initializes the Piece view and calls render.
      *
      * @method initialize
      * @constructor 
      **/
        initialize: function (options) {

            var self = this,
                model = this.model;

            this.paperScope = this.options.paperScope;
            this.currentTool = this.options.currentTool;
            this.collection = this.options.collection;
            this.repairRoadsView = this.options.repairRoadsView;
            this.arrowImagePath = this.repairRoadsView.getSpritePartBase64URL('picture-perfect-image', 480, 2400, 28, 28);
            this.entirePath = this.options.entirePath;
            this._createShape();
            this.render();
        },
        /**
        * Renders the view 
        * @method render
        * @private
        */
        render: function () {

        },

        /**
       * Creates the Shapes
       * @method _createShape
       * @private
       */
        _createShape: function () {

            var groupElem = this.model.get('paperGroupElem');
            if (groupElem !== null) {
                // For saved state, import paper group element from json object.
                var paperGroup = new this.paperScope.Group();
                paperGroup.importJSON(groupElem);
                this.model.set('paperGroupElem', paperGroup);

                // Subsequently get the segments from paperGroupElement
                var segments, shape, nameOfShapeForSegmentGroup,
                    children = paperGroup.children,
                    childrenLength = children.length,
                    segmentObject = {};

                for (var i = 0; i < childrenLength ; i++) {
                    var shapeGroup = children[i];
                    if (shapeGroup) {
                        shape = shapeGroup.children[0];
                    }
                    if (shape) {
                        segments = shape.segments;
                    }
                    if (segments) {
                        nameOfShapeForSegmentGroup = shapeGroup.name;
                        var model = (this.collection.where({ name: nameOfShapeForSegmentGroup }))[0];
                        model.set('segments', segments);
                        //For Storing Reference of Snap Indices so that they can be updated whenever Saved State is Used
                        segmentObject[nameOfShapeForSegmentGroup] = model.get('snapIndices');
                        this.model.set('segmentsGroup', segmentObject);
                    }
                }

                var isRoadComplete = this.repairRoadsView.model.get('roadComplete');
                if (!(isRoadComplete))
                    this._bindShapeEvents();
            }
            else {
                var shape = new this.paperScope.Path();
                var pointsArray = this.model.get('segments').slice();
                shape.strokeColor = 'white';
                shape.fillColor = '#FFB400';
                shape.strokeWidth = 2;
                shape.addSegments(pointsArray);
                shape.closed = true;
                shape.strokeJoin = 'round';
                shape.name = 'shape';
                //this.model.set('rotation', 0);
                this.model.set('segments', shape.segments);
                var segmentObject = {};
                segmentObject[this.model.get('name')] = this.model.get('snapIndices');
                this.model.set('segmentsGroup', segmentObject);
                var shapeGroup = new this.paperScope.Group(shape);
                shapeGroup.name = this.model.get('name');
                var entireGroup = new this.paperScope.Group(shapeGroup);
                this.model.set('paperGroupElem', entireGroup);
                this._setEndPoints(pointsArray);
                //entireGroup.rotate(this.model.get('rotation'));
                this.model.set('rotation', 0);
                //entireGroup.position = this.model.get('position');
                this._drawAngles();
                this._bindShapeEvents();
            }

        },

        /**

       * Resets The Shape
       * @method _resetShape
       * @private
       */
        _resetShape: function () {
            this.currentTool.detach('mouseup');
            this.model.get('paperGroupElem').fillColor = '#FFB400';
            this._removeBoundingBox();
            this.model.set('isSelected', false);

            if (this.isSnapped) {
                // if shape is snapped then redraw all angles
                this._removeAngleGroup();
                this._drawAngles();
                this.isSnapped = false;
            } else {
                this.setCurrentLabelsColor();
            }
        },

        /**
        * Binds The Events on Shape for Dragging 
        * @method _bindShapeEvents
        * @private
        */
        _bindShapeEvents: function () {
            var self = this,
                shape = this.model.get('paperGroupElem');

            shape.off('mousedown');

            shape.on('mousedown', function (event) {
                if (!self.model.get('isSelected')) {
                    self.repairRoadsView.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_CLICKED);
                    self._selectCurrentShape();

                    self.listenToOnce(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_CLICKED, function () {
                        self._resetShape();
                    });

                    self.listenToOnce(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_SNAPPED, function () {
                        self._resetShape();
                        self.repairRoadsView.showTooltip(self.tooltipMode);
                        self.repairRoadsView.currentSnappedShapeView = self;
                    });

                    self.listenToOnce(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.BACKGROUND_CLICKED, function () {
                        self._resetShape();
                    });
                }
                self.previousPosition = self._getDifference(event.point, this.position);
                self._removeBoundingBox();

                var cursor = self.cursors.CLOSE_HAND;
                self.repairRoadsView.model.set('cursor', cursor);
                self.isMouseupOnShape = false;

                self.currentTool.on('mouseup', function (event) {

                    if (!self.isMouseupOnShape) {
                        self._setCursor(self.cursors.DEFAULT);
                    }
                    self.isShapeDragged = false;

                    self._drawBoundingBox();
                    this.position = self._getDifference(event.point, self.previousPosition);
                    self._checkSnap();
                    self._checkPathSnap();
                    if (shape.children.length === self.collection.length) {
                        self.repairRoadsView.model.set('roadComplete', true);
                        shape.opacity = 0.9;
                        self._unbindShapeEvents();
                        self.repairRoadsView.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.COMPLETE_PATH_SNAPPED);
                    }
                    self.currentTool.detach('mouseup');
                });

                shape.on('mouseup', function () {
                    self.isMouseupOnShape = true;
                    self._setCursor(self.cursors.OPEN_HAND);
                    shape.detach('mouseup');
                });

            });

            shape.off('mousedrag');
            shape.on('mousedrag', function (event) {

                var prevPosition = this.position,
                    tempPosition = self._getDifference(event.point, self.previousPosition);
                tempPosition = self._fitInBounds(this, tempPosition);
                this.position = tempPosition;

                self.isShapeDragged = true;
            });

            shape.on('mouseenter', function () {
                var cursor = self.cursors.OPEN_HAND;

                if (self.isShapeDragged) {
                    cursor = self.cursors.CLOSE_HAND;
                }

                self._setCursor(cursor);
            });

            shape.on('mouseleave', function () {
                if (!self.isShapeDragged) {
                    self._setCursor(self.cursors.DEFAULT);
                }
            });

        },

        /**
        * Set cursor value to the repair road model.
        * @method _setCursor
        * @param cursor {Number} Type of cursor
        * @private
        */
        _setCursor: function (cursor) {
            this.repairRoadsView.model.set('cursor', cursor);
        },

        /**
        * Fits the given shape within the bounds of the canvas during dragging
        * @method _fitInBounds
        * @param shape {Object} Reference to the paper element being dragged
        * @param position {Object} Reference to the updated position of the element being dragged
        * @private
        */
        _fitInBounds: function (shape, position) {
            var shapePosition = shape.position,
                positionOffset = this._getDifference(position, shapePosition),
                shapeTop = shape.bounds.topCenter.y + positionOffset.y,
                shapeBottom = shape.bounds.bottomCenter.y + positionOffset.y,
                shapeLeft = shape.bounds.leftCenter.x + positionOffset.x,
                shapeRight = shape.bounds.rightCenter.x + positionOffset.x,
                maxX = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.CANVAS_SIZE.WIDTH,
                maxY = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.CANVAS_SIZE.HEIGHT,
                minX = 0,
                minY = 0;

            if (shapeTop < minY) {
                position.y = minY + (shapePosition.y - shape.bounds.top);
            }
            else if (shapeBottom > maxY) {
                position.y = maxY - (shape.bounds.bottom - shapePosition.y);
            }

            if (shapeLeft < minX) {
                position.x = minX + (shapePosition.x - shape.bounds.left);
            }
            else if (shapeRight > maxX) {
                position.x = maxX - (shape.bounds.right - shapePosition.x);
            }
            return position;
        },
        /**
       * Unbinds The Events on Shape
       * @method _unbindShapeEvents
       * @private
       */
        _unbindShapeEvents: function () {
            var self = this,
                shape = this.model.get('paperGroupElem');

            shape.off('mousedown');
            shape.off('mousedrag');
            shape.off('mouseenter');
            shape.off('mouseleave');
            self.currentTool.off('mouseup');
            self._setCursor(self.cursors.DEFAULT);
        },
        /**
      * Selects the Current Shape
      * @method _selectCurrentShape
      * @private
      */
        _selectCurrentShape: function () {
            var self = this,
                groupElem = this.model.get('paperGroupElem');
            this.model.set('isSelected', true);
            groupElem.fillColor = '#07a1ab';
            groupElem.bringToFront();
            this._setAngleSelection();

            this._drawBoundingBox();
        },

        /**
       * Binds The Events on Circle for rotation
       * @method _bindCircleEvents
       * @param circleGroup Group of Circles on which events are to be binded
       * @private
       */
        _bindCircleEvents: function (circleGroup) {
            var shape = this.model.get('paperGroupElem'),
                boundingBoxGroup,
                nameOfShape,
                rotationObject,
                firstPoint,
                previousAngle,
                circleHovered,
                self = this;

            self._bindMouseEnterEvent(circleGroup);

            this.circleGroup.on('mousedown', function (event) {
                self.circleGroup.detach('mouseenter');
                (self.circleGroup.children[event.target.name]).visible = false;
                firstPoint = event.point;
                self.pivot = self.boundingBox.position;
                var xAxisPoint = new self.paperScope.Point(self.pivot.x + 10, self.pivot.y);
                previousAngle = self._findAngle(firstPoint, self.pivot, xAxisPoint, true);
                self.currentTool.on('mouseup', function (event) {
                    self._drawAngles();
                    self._checkSnap();
                    self._checkPathSnap();
                    self._bindMouseEnterEvent(circleGroup);
                    self.currentTool.detach('mouseup');
                });
            });

            this.circleGroup.on('mousedrag', function (event) {
                self._removeBoundingBox();
                var xAxisPoint = new self.paperScope.Point(self.pivot.x + 10, self.pivot.y),
                    angle = self._findAngle(event.point, self.pivot, xAxisPoint, true),
                    rotateAngle = previousAngle - angle;
                previousAngle = angle;
                firstPoint = self.circleGroup.position;
                shape.rotate(rotateAngle, self.pivot);
                self.boundingBoxGroup = new self.paperScope.Group(self.boundingBox, self.circleGroup)
                self.boundingBoxGroup.rotate(rotateAngle, self.pivot);
                self.model.set('rotation', (self.model.get('rotation') + rotateAngle));
                self._removeAngleGroup();
            });

        },
        _bindMouseEnterEvent: function (circleGroup) {

            var circleHovered;

            this.circleGroup.on('mouseenter', function (event) {

                circleHovered = (this.children[event.target.name]);
                circleHovered.visible = true;

                event.target.on('mouseleave', function (event) {
                    circleHovered.visible = false;
                    event.target.detach('mouseleave');
                });

            });
        },
        /**
       *Calculates the Angle
       * @method _findAngle
       * @private
       */
        _findAngle: function (A, B, C, degrees) {
            var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2)),
                BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2)),
                AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2)),
                inv = A.y < B.y ? 1 : -1;
            if (degrees) {
                return inv * Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180 / Math.PI;
            }
            return inv * Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
        },

        /**
        * Draws The Bounding Box
        * @method _drawBoundingBox
        * @private
        */
        _drawBoundingBox: function () {
            var shape = this.model.get('paperGroupElem'),
                radius = 6,
                offset = 5,
                topLeftShape = shape.bounds.topLeft,
                bottomRightShape = shape.bounds.bottomRight,
                topRightShape = shape.bounds.topRight,
                bottomLeftShape = shape.bounds.bottomLeft,
                shapeBoundWidth = shape.bounds.width,
                shapeBoundHeight = shape.bounds.height,
                topLeftRect = new this.paperScope.Point(shape.bounds.x - offset, shape.bounds.y - offset),
                rectSize = new this.paperScope.Size(shapeBoundWidth + (2 * offset), shapeBoundHeight + (2 * offset)),
                self = this;

            this.boundingBox = new this.paperScope.Path.Rectangle(topLeftRect, rectSize);
            this.boundingBox.style = {
                strokeColor: '#ffffff',
                dashArray: [3, 3],
                strokeWidth: 2
            };
            var topleftcircle = new this.paperScope.Shape.Circle({
                center: this._getDifference(topLeftShape, new this.paperScope.Point(offset, offset)),
                radius: radius,
                name: 'circle1'
            }),
             topleftcircleraster = new this.paperScope.Raster({
                 source: this.arrowImagePath,
                 position: this._getDifference(topleftcircle.bounds.topLeft, new this.paperScope.Point(offset, offset)),
                 name: 'circle1',
                 visible: false
             }),
             bottomleftcircle = new this.paperScope.Shape.Circle({
                 center: new this.paperScope.Point(bottomLeftShape.x - offset, bottomLeftShape.y + offset),
                 radius: radius,
                 name: 'circle2'
             }),
             bottomleftcircleraster = new this.paperScope.Raster({
                 source: this.arrowImagePath,
                 position: this._getDifference(bottomleftcircle.bounds.bottomLeft, new this.paperScope.Point(offset, -offset)),
                 name: 'circle2',
                 visible: false
             }),

             toprightcircle = new this.paperScope.Shape.Circle({
                 center: new this.paperScope.Point(topRightShape.x + offset, topRightShape.y - offset),
                 radius: radius,
                 name: 'circle3'
             }),
             toprightcircleraster = new this.paperScope.Raster({
                 source: this.arrowImagePath,
                 position: this._getDifference(toprightcircle.bounds.topRight, new this.paperScope.Point(-offset, offset)),
                 name: 'circle3',
                 visible: false
             }),
             bottomrightcircle = new this.paperScope.Shape.Circle({
                 center: this._getDifference(bottomRightShape, new this.paperScope.Point(-offset, -offset)),
                 radius: radius,
                 name: 'circle4'
             }),
            bottomrightcircleraster = new this.paperScope.Raster({
                source: this.arrowImagePath,
                position: this._getDifference(bottomrightcircle.bounds.bottomRight, new this.paperScope.Point(-offset, -offset)),
                name: 'circle4',
                visible: false
            });

            topleftcircleraster.rotate(270);
            bottomleftcircleraster.rotate(180);
            bottomrightcircleraster.rotate(90);

            this.circleGroup = new this.paperScope.Group(topleftcircle, bottomleftcircle, toprightcircle, bottomrightcircle, topleftcircleraster, bottomleftcircleraster, toprightcircleraster, bottomrightcircleraster);
            this.circleGroup.style = {
                fillColor: '#ffffff',
                strokeWidth: 2,
                strokeColor: '#4c1787'
            };
            this._bindCircleEvents(this.circleGroup, shape);
        },

        /**
        * Removes The Bounding Box
        * @method _removeBoundingBox
        * @private
        */
        _removeBoundingBox: function () {
            var self = this;
            if (this.boundingBox !== undefined) {
                self.boundingBox.remove();
                self.circleGroup.remove();
            }
        },

        _isNeighbour: function (name1, name2) {
            var pathDisplayed = this.repairRoadsView.model.get('pathDisplayed');
            var self = this;
            var indexOfName1 = self.collection.indexOf((self.collection.where({ name: name1 }))[0]);
            var indexOfName2 = self.collection.indexOf((self.collection.where({ name: name2 }))[0]);
            if (pathDisplayed === MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ROADTYPES.RECTANGLESHAPED) {
                if (((indexOfName1 === 15) && (indexOfName2 === 0)) || ((indexOfName2 === 15) && (indexOfName1 === 0))) {
                    return true;
                }
                else {
                    if ((Math.abs(indexOfName1 - indexOfName2)) === 1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            else {
                if ((Math.abs(indexOfName1 - indexOfName2)) === 1) {
                    return true;
                }
                else {
                    return false;
                }
            }

        },

        /**
        * Returns the Distance For Snapping
        * @method _getDistance
        * @param draggedModel Model which is Dragged
        * @param comparedModel Model which is to be compared
        * @param nameOfComparedModel Name of Shape from the Compared Model
        * @param segmentIndex Segment Index (0 or 1)
        * @private
        */
        _getDistance: function (draggedModel, comparedModel, nameOfComparedModel, comparedsegmentIndex, segmentIndex, removeSegmentFlag) {

            var nameOfDraggedShape,
                nameOfShapeToBeCompared,
                segment1,
                draggedModelSegmentsArray,
                comparedModelSegmentsArray,
                segment2,
                draggedSnappingIndices,
                self = this;

            nameOfDraggedShape = draggedModel.get('name');
            nameOfShapeToBeCompared = comparedModel.get('name');

            //Get the SegmentsGroup of the shape to be compared i.e the neighbours of the shape
            var comparedSnappingIndices = (comparedModel.get('segmentsGroup'))[nameOfShapeToBeCompared],
                 leftHandSideOfIndices = Object.keys(comparedSnappingIndices),
                 leftHandSideOfIndicesLength = leftHandSideOfIndices.length;

            for (var i = 0; i < leftHandSideOfIndicesLength; i++) {
                if (self._isNeighbour(leftHandSideOfIndices[i], nameOfComparedModel)) {
                    //For each neighbour obtained above
                    draggedSnappingIndices = (draggedModel.get('segmentsGroup'))[(self._getNameOfComparedModel(leftHandSideOfIndices[i])).get('name')];

                    if (draggedSnappingIndices) {
                        segment1 = draggedSnappingIndices[nameOfComparedModel];
                        segment2 = comparedSnappingIndices[leftHandSideOfIndices[i]];
                        //Get the segments of the shape to be compared and dragged
                        //This is not the model of the group but a particular shape
                        draggedModelSegmentsArray = ((self.collection.where({ name: leftHandSideOfIndices[i] }))[0]).get('segments');
                        comparedModelSegmentsArray = ((self.collection.where({ name: nameOfComparedModel }))[0]).get('segments');

                        if (segment1 && (segment1.length > 0) && segment2 && (segment2.length > 0)) {
                            var segmentOfDragged = draggedModelSegmentsArray[parseInt(segment1[segmentIndex])],
                                segmentOfCompared = comparedModelSegmentsArray[parseInt(segment2[comparedsegmentIndex])];

                            if (segmentOfDragged && segmentOfCompared) {
                                var x1 = segmentOfDragged.point.x,
                                    y1 = segmentOfDragged.point.y,
                                    x2 = segmentOfCompared.point.x,
                                    y2 = segmentOfCompared.point.y;

                                var distance = {};
                                distance.value = Math.sqrt((Math.pow((x2 - x1), 2)) + (Math.pow((y2 - y1), 2)));
                                distance.diff = {};
                                distance.draggedShapeName = nameOfDraggedShape;
                                distance.diff.x = x1 - x2;
                                distance.diff.y = y1 - y2;
                                distance.segmentIndex = {};
                                distance.segmentIndex.dragged = segment1[segmentIndex];
                                distance.segmentIndex.compared = segment2[comparedsegmentIndex];
                                distance.nameOfDraggedShape = leftHandSideOfIndices[i];
                                if (removeSegmentFlag) {
                                    delete comparedSnappingIndices[leftHandSideOfIndices[i]];
                                    comparedModel.set('snapIndices', comparedSnappingIndices);
                                }
                                return distance;
                            }
                        }
                    }
                }
            }
        },

        /**
        * Check Snapping Of groups
        * @method _checkSnap
        * @private
        */
        _checkSnap: function () {
            var d1,
                d2,
                shapetobecomparedwith,
                spliceIndex,
                newShape,
                indexOfDraggedShape,
                indexOfShapeToBeComparedWith, paperGroupOfDragged, angleGroupOfDragged, angleGroupOfCompared,
                angle1OfDragged, angle2OfDragged, angle1OfCompared, angle2OfCompared, modelChildrenLength, prevModel;

            var self = this, removeSnapIndiceFlag = true, removeSegmentFlag = false, removeSnapIndiceFlagForCompared = true, changeSegmentFlag = false,
             shapeFromShapeArrayToCompare, nameOfShapeForUpdation,
             shape = self.model.get('paperGroupElem'),
             nameOfDraggedModel = self.model.get('name'),
             draggedModel = self.collection.where({ name: nameOfDraggedModel }),
             snapped = false,
             collectionLength = this.collection.length,
             draggedModelLength = shape.children.length,
             isComplementary = false,
             isSupplementary = false;

            self.angleLabels = [];

            var snappingIndices = draggedModel[0].get('segmentsGroup')[nameOfDraggedModel],
                leftHandSideOfIndices = Object.keys(snappingIndices),
                leftHandSideOfIndicesLength = leftHandSideOfIndices.length;
            if (draggedModelLength !== collectionLength) {
                for (var i = 0; i < leftHandSideOfIndicesLength; i++) {

                    var nameOfComparedModel = leftHandSideOfIndices[i],
                     comparedModel = self._getNameOfComparedModel(nameOfComparedModel);
                    modelChildrenLength = draggedModel[0].get('paperGroupElem').children.length;
                    if ((draggedModel[0].get('name') !== comparedModel.get('name')) || (collectionLength === modelChildrenLength)) {

                        var snappingIndicesLength = snappingIndices[leftHandSideOfIndices[i]].length;

                        //For Comparing Single Piece at the End
                        if (snappingIndicesLength === 4)
                            removeSnapIndiceFlag = false;

                        //For Dragging Single Piece at the End and Snapping Second Time
                        //And Checking if It is a Single Piece Case
                        if ((draggedModel[0].get('name') === comparedModel.get('name')) && (draggedModelLength === 1)) {
                            comparedModel = prevModel;
                            removeSnapIndiceFlagForCompared = false;
                        }

                        for (var k = 0; k < snappingIndicesLength; k += 2) {
                            //For Dragging Single Piece at the End and Snapping Second Time
                            if (!removeSnapIndiceFlagForCompared) {
                                k = 2;
                                removeSnapIndiceFlagForCompared = true;
                                d1 = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, k, 0, removeSegmentFlag);
                                d2 = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, k + 1, 1, removeSegmentFlag);
                                changeSegmentFlag = true;
                            }
                            else {
                                d1 = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, 0, k, removeSegmentFlag);
                                d2 = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, 1, k + 1, removeSegmentFlag);
                            }

                            if (d1 && d2) {
                                if ((d1.value <= 20) && (d2.value <= 20)) {
                                    //  Snapped
                                    prevModel = comparedModel;
                                    var angleToBeRotatedBy = comparedModel.get('rotation') - draggedModel[0].get('rotation');
                                    shape.rotate(angleToBeRotatedBy);
                                    draggedModel[0].set('rotation', comparedModel.get('rotation'));

                                    if (comparedModel.get('paperGroupElem').children.length !== 15) {
                                        removeSegmentFlag = true;
                                    }
                                    else {
                                        removeSnapIndiceFlagForCompared = false;
                                        removeSegmentFlag = false;
                                    }

                                    if (changeSegmentFlag) {
                                        var d = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, k, 0, removeSegmentFlag);
                                    }
                                    else {
                                        var d = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, 0, k, removeSegmentFlag);
                                    }
                                    removeSegmentFlag = false;
                                    shape.position.x -= d.diff.x;
                                    shape.position.y -= d.diff.y;
                                    self._addInGroup(draggedModel[0], comparedModel, leftHandSideOfIndices[i], d.nameOfDraggedShape, removeSnapIndiceFlag, removeSnapIndiceFlagForCompared);
                                    removeSnapIndiceFlag = true;
                                    removeSnapIndiceFlagForCompared = true;
                                    paperGroupOfDragged = draggedModel[0].get('paperGroupElem');

                                    angleGroupOfDragged = (paperGroupOfDragged.children[d1.nameOfDraggedShape]).children[2];
                                    angleGroupOfCompared = (paperGroupOfDragged.children[nameOfComparedModel]).children[2];

                                    angle1OfDragged = angleGroupOfDragged.children[d1.segmentIndex.dragged];
                                    angle2OfDragged = angleGroupOfDragged.children[d2.segmentIndex.dragged];
                                    angle1OfCompared = angleGroupOfCompared.children[d1.segmentIndex.compared];
                                    angle2OfCompared = angleGroupOfCompared.children[d2.segmentIndex.compared];

                                    // Set the fill color of angle label according to its type
                                    var angles = [angle1OfDragged, angle1OfCompared, angle2OfDragged, angle2OfCompared];
                                    for (var j = 0; j < angles.length; j += 2) {
                                        var angle1 = parseInt(angles[j]._content);
                                        var angle2 = parseInt(angles[j + 1]._content);

                                        if (angle1 + angle2 === 180) {
                                            angles[j].data.fillColor = '#174471';
                                            angles[j + 1].data.fillColor = '#174471';

                                            angles[j].data.isSupplementary = true;
                                            angles[j + 1].data.isSupplementary = true;

                                            self.angleLabels.push(angles[j]);
                                            self.angleLabels.push(angles[j + 1]);

                                            isSupplementary = true;
                                        }
                                        else if (angle1 + angle2 === 90) {
                                            angles[j].data.fillColor = '#aa00b5';
                                            angles[j + 1].data.fillColor = '#aa00b5';

                                            angles[j].data.isComplementary = true;
                                            angles[j + 1].data.isComplementary = true;

                                            self.angleLabels.push(angles[j]);
                                            self.angleLabels.push(angles[j + 1]);

                                            isComplementary = true;
                                        }
                                    }
                                    self.isSnapped = true;
                                    self._updateSymbols();
                                }
                            }
                        }

                    }

                }
            }
            // If two or more shapes are snapped then trigger the event
            if (self.isSnapped) {
                var ANGLES_TYPE = MathInteractives.Interactivities.PicturePerfect.Views.Shape.ANGLES_TYPE;

                // Set the tooltip mode.
                if (isSupplementary && isComplementary) {
                    this.tooltipMode = ANGLES_TYPE.BOTH;
                }
                else if (isComplementary) {
                    this.tooltipMode = ANGLES_TYPE.COMPLEMENTARY;
                }
                else if (isSupplementary) {
                    this.tooltipMode = ANGLES_TYPE.SUPPLEMENTARY;
                }

                self.repairRoadsView.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_SNAPPED);
            }
        },


        _checkPathSnap: function () {
            var self = this,
                shape = self.model.get('paperGroupElem'),
                endPoints = shape.getItems({
                    name: 'endpoint-symbol'
                }),
                totalEndPoints = endPoints.length,
                insidePath;


            var shapes = shape.getItems({
                name: 'shape'
            });

            for (var i = 0; i < shapes.length; i++) {
                if (this.entirePath.getIntersections(shapes[i]).length > 1) {
                    return false;
                };
            }

            if (this._isInsidePath(shapes[0].position)) {
                //try path snapping
            }

            /*
            for (var i = 0; i < totalEndPoints; i++) {
                insidePath = this._isInsidePath(endPoints[i].position);
            }
            */
        },


        _isInsidePath: function (point) {
            var modelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;
            if (this.repairRoadsView.model.get('pathDisplayed') === modelNamespace.ROADTYPES.RECTANGLESHAPED) {
                return this._isInsideRectanglePath(point);
            }
            else {
                return this._isInsideZigzagPath(point);
            }
        },

        _isInsideRectanglePath: function (point) {
            var rectPathCoordinates = this.repairRoadsView.model.get('rectPathCoordinates');

            if ((point.y < rectPathCoordinates.outerRectCoordinates[0].y) ||
                (point.y > rectPathCoordinates.outerRectCoordinates[2].y) ||
                (point.x < rectPathCoordinates.outerRectCoordinates[0].x) ||
                (point.x > rectPathCoordinates.outerRectCoordinates[1].x)) {
                return false;
            }

            if ((point.x > rectPathCoordinates.innerRectCoordinates[0].x) &&
                (point.x < rectPathCoordinates.innerRectCoordinates[1].x) &&
                (point.y > rectPathCoordinates.innerRectCoordinates[0].y) &&
                (point.y < rectPathCoordinates.innerRectCoordinates[2].y)) {
                return false;
            }
            return true;
        },

        _isInsideZigzagPath: function (point) {


        },

        /**
        * Returns the Model with which the parameter passed is Grouped with
        * @method _getNameOfComparedModel
        * @param nameOfComparedModel Name of Shape whose parent is to be returned
        * @private
        */
        _getNameOfComparedModel: function (nameOfComparedModel) {
            var self = this;
            var comparedModel = (self.collection.where({ name: nameOfComparedModel }))[0];

            if (comparedModel.get('notUsable') === true) {
                while (true) {
                    comparedModel = self.collection.where({ name: comparedModel.get('isGroupedWith') })[0];
                    if (comparedModel.get('notUsable') === false) {
                        break;
                    }
                }
            }
            return comparedModel;
        },

        /**
        * Adds the Children Of one Compared Model to Dragged Model
        * @method _addInGroup
        * @param draggedModel Model which is Dragged
        * @param comparedModel Model which is to be compared
        * @param nameOfRemovedShape Shape which is to be removed from Segments Group
        * @param nameOfDraggedShape Shape of the Dragged Model which is to be compared
        * @private
        */
        _addInGroup: function (draggedModel, comparedModel, nameOfRemovedShape, nameOfDraggedShape, removeSnapIndiceFlag, removeSnapIndiceFlagForCompared) {

            var self = this,
                comparedShapeGroup = comparedModel.get('paperGroupElem'),
                draggedShapeGroup = draggedModel.get('paperGroupElem'),
                comparedShapeGroupLength = comparedShapeGroup.children.length;
            for (var i = 0; i < comparedShapeGroupLength; i++) {
                var x = comparedShapeGroup.children[0];
                draggedShapeGroup.addChild(x);
            }
            var tempJSONDragged = draggedModel.get('snapIndices'),
                tempJSONCompared = comparedModel.get('snapIndices');

            var draggedModelSegmentGroup = draggedModel.get('segmentsGroup'),
                comparedModelSegmentGroup = comparedModel.get('segmentsGroup');

            if (removeSnapIndiceFlag) {
                delete tempJSONDragged[nameOfRemovedShape];
            }
            if (removeSnapIndiceFlagForCompared) {
                delete tempJSONCompared[nameOfDraggedShape];
            }

            $.extend(draggedModelSegmentGroup, comparedModelSegmentGroup);

            for (var k in tempJSONCompared) {
                if (tempJSONDragged[k] === undefined) {
                    tempJSONDragged[k] = tempJSONCompared[k];
                }
                else {
                    tempJSONDragged[k] = tempJSONCompared[k].concat(tempJSONDragged[k]);
                }
            }

            draggedModel.set('segmentsGroup', draggedModelSegmentGroup);
            comparedModel.set('segmentsGroup', comparedModelSegmentGroup);
            draggedModel.set('snapIndices', tempJSONDragged);
            comparedModel.set('snapIndices', tempJSONCompared);

            comparedModel.set('isGroupedWith', draggedModel.get('name'));
            comparedModel.set('notUsable', true);

        },

        /**
        * Gives the New Coordinates after Subtraction
        * @method _getDifference
        * @param point1{Point} First Point
        * @param point2{Point} Second Point
        * @private
        */
        _getDifference: function (point1, point2) {
            return new this.paperScope.Point(point1.x - point2.x, point1.y - point2.y);
        },

        /**
        * Places symbols on end points
        * @method _setEndPoints
        * @private
        */
        _setEndPoints: function (points) {
            var group = this.model.get("paperGroupElem"),
                groupChildren = group.children,
                endPointsGroup,
                endPointSymbol = this._createEndPointSymbol();


            for (var i in groupChildren) {
                var shapeGroup = groupChildren[i];
                if (shapeGroup.children.length < 2) {

                    var model = this.collection.where({ name: shapeGroup.name })[0];
                    var segments = model.get("segments");

                    endPointsGroup = new this.paperScope.Group();
                    var length = segments.length;

                    for (var i = 0; i < length; i++) {
                        var symbolInstance = endPointSymbol.place(segments[i].point);

                        this._nameSymbol(symbolInstance, segments[i].point);

                        endPointsGroup.addChild(symbolInstance);
                    }
                    shapeGroup.addChild(endPointsGroup);
                }
            }
        },

        _createEndPointSymbol: function () {
            var path = new this.paperScope.Path.Star(new this.paperScope.Point(0, 0), 6, 5, 13);
            path.style = {
                fillColor: 'white',
                strokeColor: 'black'
            };

            var symbol = new this.paperScope.Symbol(path);

            path.remove();

            return symbol;
        },


        _nameSymbol: function (symbol, position) {
            var pathDisplayed = this.repairRoadsView.model.get('pathDisplayed'),
                parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;
            if (pathDisplayed === parentModelNamespace.ROADTYPES.RECTANGLESHAPED) {
                this._nameRectangleSymbol(symbol, position);
            }
            else {
                this._nameZigzagSymbol(symbol, position);
            }
        },

        _nameRectangleSymbol: function (symbol, position) {
            var parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                outerRectWidth = parentModelNamespace.OUTERROADWIDTH,
                outerRectHeight = parentModelNamespace.OUTERROADHEIGHT,
                innerRectWidth = parentModelNamespace.INNERROADWIDTH,
                innerRectHeight = parentModelNamespace.INNERROADHEIGHT,
                roadHeight = (outerRectHeight - innerRectHeight) / 2,
                roadWidth = (outerRectWidth - innerRectWidth) / 2,
                outerRectLeft = 10,
                outerRectTop = 10,
                outerRectRight = outerRectLeft + outerRectWidth,
                outerRectBottom = outerRectTop + outerRectHeight,
                innerRectLeft = outerRectLeft + roadWidth,
                innerRectTop = outerRectTop + roadHeight,
                innerRectRight = innerRectLeft + innerRectWidth,
                innerRectBottom = innerRectTop + innerRectHeight;

            symbol.data = 'rectangle-endpoint-symbol';
            if (position.x === outerRectLeft && position.y === outerRectTop) {
                symbol.name = 'outer-left-point+outer-top-point+corner';
            }
            else if (position.x === outerRectLeft && position.y === outerRectBottom) {
                symbol.name = 'outer-left-point+outer-bottom-point+corner';
            }
            else if (position.x === outerRectRight && position.y === outerRectBottom) {
                symbol.name = 'outer-right-point+outer-bottom-point+corner';
            }
            else if (position.x === outerRectRight && position.y === outerRectTop) {
                symbol.name = 'outer-right-point+outer-top-point+corner';
            }
            else if (position.x === innerRectLeft && position.y === innerRectTop) {
                symbol.name = 'inner-left-point+inner-top-point+corner';
            }
            else if (position.x === innerRectLeft && position.y === innerRectBottom) {
                symbol.name = 'inner-left-point+inner-bottom-point+corner';
            }
            else if (position.x === innerRectRight && position.y === innerRectBottom) {
                symbol.name = 'inner-right-point+inner-bottom-point+corner';
            }
            else if (position.x === innerRectRight && position.y === innerRectTop) {
                symbol.name = 'inner-right-point+inner-top-point+corner';
            }
            else if (position.y === outerRectTop) {
                symbol.name = 'outer-top-point';
            }
            else if (position.y === outerRectBottom) {
                symbol.name = 'outer-bottom-point';
            }
            else if (position.y === innerRectTop) {
                symbol.name = 'inner-top-point';
            }
            else if (position.y === innerRectBottom) {
                symbol.name = 'inner-bottom-point';
            }
            else if (position.x === outerRectLeft) {
                symbol.name = 'outer-left-point';
            }
            else if (position.x === outerRectRight) {
                symbol.name = 'outer-right-point';
            }
            else if (position.x === innerRectLeft) {
                symbol.name = 'inner-left-point';
            }
            else if (position.x === innerRectRight) {
                symbol.name = 'inner-right-point';
            }
            else {
                symbol.name = 'endpoint-symbol';
            }
        },

        _updateSymbols: function () {
            var pathDisplayed = this.repairRoadsView.model.get('pathDisplayed'),
                parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;
            if (pathDisplayed === parentModelNamespace.ROADTYPES.RECTANGLESHAPED) {
                this._updateRectangleSymbols();
            }
            else {
                this._updateZigzagSymbols();
            }
        },

        _updateRectangleSymbols: function () {
            var shape = this.model.get('paperGroupElem'),
                symbols = shape.getItems({
                    data: 'rectangle-endpoint-symbol'
                }),
                xPositionArray = [],
                yPositionArray = [];

            for (var i = 0; i < symbols.length; i++) {
                var position = symbols[i].position,
                    xPosition = Math.round(position.x),
                    yPosition = Math.round(position.y),
                    index = [];
                this.findIndex(xPositionArray, xPosition, index);
                if (index.length === 0) {
                    xPositionArray.push(xPosition);
                    yPositionArray.push(yPosition);
                }
                else {
                    var found = false;
                    for (var k = 0; k < index.length; k++) {
                        if (yPositionArray[index[k]] === yPosition) {
                            symbols[i].remove();
                            found = true;
                        }
                    }
                    if (!found) {
                        xPositionArray.push(xPosition);
                        yPositionArray.push(yPosition);
                    }
                }
            }
            this._updateRectangleBounds();
        },

        _updateRectangleBounds: function () {
            var shape = this.model.get('paperGroupElem'),
                symbols = shape.getItems({
                    data: 'rectangle-endpoint-symbol'
                }),
                totalSymbols = symbols.length,
                allSymbols = {};
            for (var i = 0; i < totalSymbols; i++) {
                var currentSymbolName = symbols[i].name,
                    symbolNames = [];
                if (currentSymbolName.indexOf('corner') > -1) {
                    currentSymbolName = currentSymbolName.replace('+corner', '');
                    symbolNames = currentSymbolName.split('+');
                }
                else {
                    symbolNames[0] = currentSymbolName;
                }
                var symbolNamesLength=symbolNames.length;
                for (var j = 0; j < symbolNamesLength; j++) {
                    var currentSymbol = symbolNames[j];
                    if (typeof allSymbols[currentSymbol] === 'undefined' || allSymbols[currentSymbol] === null) {
                        allSymbols[currentSymbol] = [];
                    }
                    allSymbols[currentSymbol].push(symbols[i]);
                    if (allSymbols[currentSymbol].length > 2) {
                        this.removeMiddleValue(allSymbols[currentSymbol]);
                    }
                }
            }
        },


        findIndex: function (array, search, index) {
            var idx = array.indexOf(search);
            while (idx !== -1) {
                index.push(idx);
                idx = array.indexOf(search, idx + 1);
            }
        },

        removeMiddleValue: function (array) {
            var elements = array.length,
                xSame = false,
                maxX = array[0].position.x,
                maxY = array[0].position.y,
                minX = array[0].position.x,
                minY = array[0].position.y,
                maxIndex = 0,
                minIndex = 0,
                middleElemIndex = 0;
            for (var i = 1; i < elements; i++) {
                if (array[i].position.x === maxX) {
                    xSame = true;
                    break;
                }
                else if (array[i].position.x > maxX) {
                    maxX = array[i].position.x;
                    middleElemIndex = maxIndex;
                    maxIndex = i;
                }
                else if (array[i].position.x < minX) {
                    minX = array[i].position.x;
                    middleElemIndex = minIndex;
                    minIndex = i;
                }
                else {
                    middleElemIndex = i;
                }
            }
            if (xSame) {
                for (var i = 1; i < elements; i++) {
                    if (array[i].position.y > maxY) {
                        maxY = array[i].position.y;
                        middleElemIndex = maxIndex;
                        maxIndex = i;
                    }
                    else if (array[i].position.y < minY) {
                        minY = array[i].position.y;
                        middleElemIndex = minIndex;
                        minIndex = i;
                    }
                    else {
                        middleElemIndex = i;
                    }
                }
            }
            array[middleElemIndex].remove();
            array.splice(middleElemIndex, 1);
        },

        /**
        * Draw the angles at all points in this shape view.
        * @method _drawAngles
        * @private
        */
        _drawAngles: function () {
            var group = this.model.get("paperGroupElem"),
                groupChildren = group.children;
            var angleGroup;

            for (var i in groupChildren) {
                var shapeGroup = groupChildren[i];

                if (shapeGroup.children.length < 3) {
                    var model = this.collection.where({ name: shapeGroup.name })[0];
                    var segments = model.get("segments");
                    var angles = model.get("angles");

                    angleGroup = new this.paperScope.Group();
                    var length = segments.length;

                    for (var i = 0; i < length; i++) {
                        if (i > 3) {
                            break;
                        }
                        var angle = Math.round(angles[i]);

                        var A = segments[i - 1 < 0 ? length - 1 : i - 1].point,
                            B = segments[i].point,
                            C = segments[(i + 1) % length].point;

                        var point = this._getLabelStartPoint(B, A, C, angle);

                        var text = new this.paperScope.PointText();
                        var dimensionTextStyle = {
                            fontSize: 12,
                            font: 'MontserratRegular'
                        };

                        var fillColor = '#222222',
                            opacity = 1;

                        var data = this._getPointTextData(shapeGroup.name, i);
                        if (data) {
                            if (data.fillColor) {
                                fillColor = data.fillColor;
                            }
                            if (data.opacity) {
                                opacity = data.opacity;
                            }
                            text.data = data;
                        }
                        // var fillColor = this._getFillColor(shapeGroup.name, i);// '#222222';
                        text.content = angle;
                        text.fillColor = fillColor;
                        text.position = point;
                        text.characterStyle = dimensionTextStyle;
                        text.opacity = opacity;

                        text.data.fillColor = fillColor;
                        text.data.opacity = opacity;

                        angleGroup.addChild(text);
                    }
                    shapeGroup.addChild(angleGroup);
                }
            }
            // Reset the map of removed angle group
            this.removedAngleGroup = {};

            if (this.model.get('isSelected')) {
                this._setAngleSelection();
            }

        },

        /**
        * Get the data for particular angle label if it is being removed previously
        * @method data
        * @param name{String} Shape name of which angle color required
        * @param index{Number} Index of angle
        * @private
        */
        _getPointTextData: function (name, index) {
            var data = null;

            if (this.removedAngleGroup) {
                var angleGroup = this.removedAngleGroup[name];
                if (angleGroup) {
                    var textObj = angleGroup.children[index];
                    if (textObj.data) {
                        data = textObj.data;
                    }

                }
            }
            return data;
        },

        /**
        * Get the position of angle label for anglePoint
        * @method _getLabelStartPoint
        * @param anglePoint{Number} Angle point for which position is to be find
        * @param point2{Number} Next point of the anglePoint
        * @param point3{Number} Prev point of the anglePoint
        * @param angle{Number} Angle value
        * @private
        */
        _getLabelStartPoint: function _drawAngleLabel(anglePoint, point2, point3, angle) {
            var model = this.model,
                labelRadius,
                from,
                to,
                through,
                labelPoint;

            if (angle < 30) {
                labelRadius = 40;
            }
            else if (angle < 55) {
                labelRadius = 30;
            }
            else if (angle < 70) {
                labelRadius = 25;
            }
            else if (angle < 100) {
                labelRadius = 20;
            }
            else {
                labelRadius = 20;
            }

            from = Utils.getPointOnLine(anglePoint, point2, labelRadius, 0, true);
            to = Utils.getPointOnLine(anglePoint, point3, labelRadius, 0, true);
            if (from === null && to === null) {
                return;
            }
            if (from === null && to !== null) {
                from = to;
            }
            else if (from !== null && to === null) {
                to = from;
            }
            through = Utils.getPointOnLine(Utils.getMidPoint(from, to), anglePoint, labelRadius, 0, false);

            if (through === null) {
                through = to;
            }
            labelPoint = Utils.getPointOnLine(anglePoint, through, labelRadius, 0, true);

            return labelPoint;
        },

        /**
        * Set the color to the angle labels when shape is selected
        * @method _setAngleSelection
        * @private
        */
        _setAngleSelection: function () {
            this._setAngleLabelsColor('#ffffff');
        },

        /**
        * Reset the color to the angle labels when shape is deselected
        * @method _resetAngleSelection
        * @private
        */
        _resetAngleSelection: function () {
            this._setAngleLabelsColor('#222222');
        },

        /**
        * Set the color to the all angle labels for all shapes in group
        * @method _resetAngleSelection
        * @param color{String} Color string
        * @private
        */
        _setAngleLabelsColor: function (color) {
            var group = this.model.get("paperGroupElem"),
                groupChildren = group.children;

            for (var i in groupChildren) {
                var shapeGroup = groupChildren[i];

                if (shapeGroup.children.length > 1) {
                    var angleGroup = shapeGroup.children[2];
                    angleGroup.fillColor = color;
                }
            }
        },

        /**
        * Set the current label color
        * @method setCurrentLabelsColor
        * @private
        */
        setCurrentLabelsColor: function () {
            var group = this.model.get("paperGroupElem"),
                groupChildren = group.children,
                length = groupChildren.length;

            for (var i = 0; i < length; i++) {
                var shapeGroup = groupChildren[i];

                if (shapeGroup.children.length > 1) {
                    var angleGroup = shapeGroup.children[2];

                    if (angleGroup) {
                        var textObj = angleGroup.children;
                        for (var j in textObj) {
                            textObj[j].fillColor = textObj[j].data.fillColor;
                        }
                    }
                }
            }
        },

        /**
        * Remove all the angle labels
        * @method _removeAngleGroup
        * @private
        */
        _removeAngleGroup: function () {
            var group = this.model.get("paperGroupElem"),
            groupChildren = group.children,
            length = groupChildren.length;

            for (var i = 0; i < length; i++) {
                var shapeGroup = groupChildren[i];

                if (shapeGroup.children.length > 2) {
                    var angleGroup = shapeGroup.children[2];
                    this.removedAngleGroup[shapeGroup.name] = angleGroup;
                    angleGroup.remove();
                }
            }
        },
    },
{
    ANGLES_TYPE: {
        COMPLEMENTARY: 0,
        SUPPLEMENTARY: 1,
        BOTH: 2
    }
});

})();