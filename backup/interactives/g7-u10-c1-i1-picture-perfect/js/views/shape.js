(function () {
    'use strict';

    var Utils = MathInteractives.Common.Utilities.Models.Utils;

    /**
    * Creates a view for the piece.
    * @class Piece
    * @namespace MathInteractives.Interactivities.PicturePerfect
    * @submodule MathInteractives.Interactivities.PicturePerfect.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.PicturePerfect.Views.Shape = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores the event code on mouse down
        *
        * @property eventCode
        * @type Object
        * @default null
        */
        eventCode: null,

        /**
        * Reference to Pivot
        *
        * @property pivot
        * @type Object
        * @default null
        */
        pivot: null,

        /**
        * Reference to Repair Roads Backbone View
        *
        * @property repairRoadsView
        * @type Object
        * @default null
        */
        repairRoadsView: null,

        /**
        * Reference to Paper Scope
        *
        * @property paperScope
        * @type Object 
        * @default null
        */
        paperScope: null,

        /**
        * Reference to Current Tool
        *
        * @property currentTool
        * @type Object 
        * @default null
        */
        currentTool: null,

        /**
        * Backbone Collection of models
        *
        * @property collection
        * @type Object
        * @default null
        */
        collection: null,

        /**
        * Path of Arrow Image
        *
        * @property arrowImagePath
        * @type String 
        * @default null
        */
        arrowImagePath: null,

        /**
        * Path of Arrow Image
        *
        * @property entirePath
        * @type String 
        * @default null
        */
        entirePath: null,

        /**
        * Stores removed angle group for future use
        *
        * @property removedAngleGroup
        * @type Object 
        * @default null
        */
        removedAngleGroup: {},

        /**
        * If shape is snapped or not on mouse up
        *
        * @property isSnapped
        * @type Boolean 
        * @default false
        */
        isSnapped: false,

        /**
        * Stores the type of Cursor
        *
        * @property cursors
        * @type Object 
        * @default  MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.CURSOR_TYPE
        */
        cursors: MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.CURSOR_TYPE,

        /**
        * If mouse up happen on the shape then change the cursor accordingly
        *
        * @property isMouseupOnShape
        * @type Boolean 
        * @default false
        */
        isMouseupOnShape: false,

        /**
        * If mouse up happen on the circle then change the cursor accordingly
        *
        * @property isMouseupOnCircle
        * @type Boolean 
        * @default false
        */
        isMouseupOnCircle: false,

        /**
        * If shape is dragging then change the cursor accordingly on mouseenter and mouseleave
        *
        * @property isShapeDragged
        * @type Boolean 
        * @default false
        */
        isShapeDragged: false,

        /**
        * If Circle is dragging then change the cursor accordingly on mouseenter and mouseleave
        *
        * @property isCircleDragged
        * @type Boolean
        * @default false
        */
        isCircleDragged: false,

        /**
        * Stores a number whether to show complementary, supplementary or both angles type
        *
        * @property tooltipMode
        * @type Number
        * @default -1
        */
        tooltipMode: -1,

        /**
        * Stores the end points of the group
        *
        * @property allSymbols
        * @type Object
        * @default {}
        */
        allSymbols: {},

        /**
        * Stores the point text data of the group
        *
        * @property angleLabels
        * @type Object
        * @default null
        */
        angleLabels: null,


        /**
        * Initializes the Piece view and calls render.
        *
        * @method initialize
        * @constructor 
        * @param options {Object} contains properties of repair roads view
        */
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
            this.removedAngleGroup = {};
        },

        /**
        * Renders the view 
        *
        * @method render
        * @private
        */
        render: function () {
            var self = this;
            this.listenToOnce(this.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACTIVITY_COMPLETE, $.proxy(self._onActivityComplete, self));

        },

        /**
        * Creates the Shapes
        *
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
                    segmentObject = {},
                    currNamespace = MathInteractives.Interactivities.PicturePerfect.Views.Shape;;

                for (var i = 0; i < childrenLength ; i++) {
                    var shapeGroup = children[i];
                    if (shapeGroup) {
                        shape = shapeGroup.children[currNamespace.GROUP_ELEMENT_INDEX.SHAPE];
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

                var isActivityComplete = this.repairRoadsView.model.get('activityComplete');
                if (!isActivityComplete) {
                    this._bindShapeEvents();
                    var shape = this.model.get('paperGroupElem');
                    if (this.model.get('isSelected')) {
                        this.listenToOnce(this.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_GENERATION_COMPLETE, function () {
                            this.model.set('isSelected', false);
                            shape.trigger('mousedown', { event: { which: 1 }, point: shape.position });
                            this.currentTool.trigger('mouseup', { event: { which: 1 }, point: shape.position }, true);
                        });
                    }
                }
                this._updateSymbols();

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

                this.model.set('segments', shape.segments);
                var segmentObject = {};
                segmentObject[this.model.get('name')] = this.model.get('snapIndices');
                this.model.set('segmentsGroup', segmentObject);
                var shapeGroup = new this.paperScope.Group(shape);
                shapeGroup.name = this.model.get('name');
                var entireGroup = new this.paperScope.Group(shapeGroup);
                entireGroup.name = this.model.get('groupName');
                this.model.set('paperGroupElem', entireGroup);
                this._setEndPoints(pointsArray);
                this._drawAngles(true);
                this._removeAngleGroup();
                this.model.set('rotation', this._fixRotationAngle(this.model.get('rotation')));
                entireGroup.rotate(this.model.get('rotation'));
                //this.model.set('rotation', 0);
                entireGroup.position = this.model.get('position');
                this._drawAngles();
                this._bindShapeEvents();
                this.repairRoadsView.model.get('orderOfShapeGroups').push(entireGroup.name);
                this.repairRoadsView.model.get('numberOfShapeGroupChildren')[entireGroup.name] = 1;
            }

        },

        /**
        * Resets The Shape
        *
        * @method _resetShape
        * @private
        */
        _resetShape: function () {
            this.currentTool.detach('mouseup');

            this._removeBoundingBox();
            this.stopListening(this.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACCESSIBILITY_ROTATE);
            this.stopListening(this.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACCESSIBILITY_ROTATE_UP);
            this.stopListening(this.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_CLICKED);
            this.stopListening(this.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_SNAPPED);
            this.model.set('isSelected', false);
            this._changeHoverStateOfShape(false);

            this._removeAngleGroup();
            this._drawAngles();
            if (this.isSnapped) {
                // if shape is snapped then redraw all angles
                this.isSnapped = false;
            } else {
                this.setCurrentLabelsColor();
            }
        },

        /**
        * Bind the change event of the model attributes
        *
        * @method bindChangeEvents
        * @private 
        */
        bindChangeEvents: function () {
            var self = this;
            this.model.on('change:snappedToX', $.proxy(self.changeSnappedPath, self));
            this.model.on('change:snappedToY', $.proxy(self.changeSnappedPath, self));
            this.model.on('change:snappedToWrongX', $.proxy(self.changeSnappedToWrongPath, self));
            this.model.on('change:snappedToWrongY', $.proxy(self.changeSnappedToWrongPath, self));
        },


        /**
        * Set the snappedToPath attribute
        *
        * @method changeSnappedPath
        * @private
        */
        changeSnappedPath: function () {
            this.model.set('snappedToPath', this.model.get('snappedToX') && this.model.get('snappedToY'));
        },

        /**
        * Set the snappedToWrongPath attribute
        *
        * @method changeSnappedToWrongPath
        * @private
        */
        changeSnappedToWrongPath: function () {
            this.model.set('snappedToWrongPath', this.model.get('snappedToWrongX') && this.model.get('snappedToWrongY'));
        },

        /**
        * Binds The Events on Shape for Dragging 
        *
        * @method _bindShapeEvents
        * @private
        */
        _bindShapeEvents: function () {
            var self = this,
                shape = this.model.get('paperGroupElem'),
                positionChanged = false;

            shape.off('mousedown');
            shape.on('mousedown', function (event) {
                self.eventCode = event.event.which;
                if (((self.eventCode === 1 || self.eventCode === 0 || MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) && (!self.repairRoadsView.isMouseDownOnElement) && !self.isCircleDragged)) {

                    MathInteractives.global.SpeechStream.stopReading();
                    if (!self.model.get('isSelected')) {
                        self.repairRoadsView._orderShapes();
                        self.repairRoadsView.orderShapesCalled = true;
                        self.repairRoadsView.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_CLICKED);
                        self._selectCurrentShape();
                        self.repairRoadsView.model.set('lastSelectedShapeGroup', self.model.get('groupName'));
                        self.repairRoadsView.updateOrderOfFirstElement();

                        self.listenToOnce(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_CLICKED, function () {
                            self._resetShape();
                        });

                        self.listenToOnce(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_SNAPPED, function () {
                            self._resetShape();
                            self.repairRoadsView.showTooltip(self.tooltipMode);
                            self.repairRoadsView.currentSnappedShapeView = self;
                            self._addPulseEffect();
                            self.repairRoadsView.canvasAcc.updatePaperItems(self.repairRoadsView.getPaperObjects(), true);
                            self.repairRoadsView.previousItem = shape;
                        });

                        self.listenToOnce(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.BACKGROUND_CLICKED, function () {
                            self._resetShape();
                            self.repairRoadsView._orderShapes();
                        });
                    }
                    positionChanged = false;
                    if (!event.isRotate) {
                        if (event.isAccessible) {
                            self._drawBoundingBox();
                        }
                        else {
                            self._removeBoundingBox();
                        }
                    }
                    self.updateAnglesToBeRead();
                    self.repairRoadsView.previousItemModel = self.model;
                    self.repairRoadsView.isMouseDownOnElement = true;
                    self.isMouseDownOnThisShape = true;
                    self.previousPosition = self._getDifference(event.point, this.position);

                    var cursor = self.cursors.CLOSE_HAND;
                    self._setCursor(cursor);
                    self._changeHoverStateOfShape(true);
                    self.isMouseupOnShape = false;

                    self.currentTool.on('mouseup', function (event, fromSavedState) {
                        if (!self.repairRoadsView.model.get('activityComplete')) {
                            if (!self.isMouseupOnShape) {
                                self._changeHoverStateOfShape(false);
                            }
                            self.repairRoadsView.isMouseDownOnElement = false;
                            self.isMouseDownOnThisShape = false;
                            self.isShapeDragged = false;
                            self._setCursor(self.cursors.DEFAULT);

                            if (!event.isRotate) {
                                self._drawBoundingBox();
                            }
                            if (!fromSavedState) {
                                if (!event.fromTabKey) {
                                    self._checkSnapOnUp();
                                }
                                self.currentTool.off('mouseup');
                                shape.off('mouseup');
                                if (positionChanged || self.repairRoadsView.accessibilityFlagForSnapping) {
                                    self.repairRoadsView.accessibilityFlagForSnapping = true;
                                }
                                else {
                                    self.repairRoadsView.accessibilityFlagForSnapping = false;
                                }

                                self._bringInBounds();
                            }
                        }
                    });

                    shape.on('mouseup', function () {

                        if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                            self._changeHoverStateOfShape(false);
                        }
                        self.isMouseupOnShape = true;
                        self._setCursor(self.cursors.DEFAULT);

                    });

                }
            });

            shape.off('mousedrag');
            shape.on('mousedrag', function (event) {
                if ((self.eventCode === 1 || self.eventCode === 0 || MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) && (!self.repairRoadsView.isMouseDownOnElement || self.isMouseDownOnThisShape) && !self.isCircleDragged) {
                    var tempPosition = self._getDifference(event.point, self.previousPosition);
                    tempPosition = self._fitInBounds(tempPosition);
                    this.position = tempPosition;
                    if (self.repairRoadsView.accessibilityFlagForSnapping) {
                        positionChanged = true;
                    }
                    else {
                        positionChanged = false;
                    }

                    self.isShapeDragged = true;
                    if (event.isAccessible) {
                        self._removeBoundingBox();
                    }
                    self._resetModelSnappingValues();

                }
            });
            if (!(MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile)) {
                shape.off('mouseenter');
                shape.on('mouseenter', function () {
                    if (((!(self.repairRoadsView.player.getModalPresent())) && (!self.repairRoadsView.isMouseDownOnElement))) {
                        self._changeHoverStateOfShape(true);
                        var cursor = self.cursors.OPEN_HAND;

                        if (self.isShapeDragged) {
                            cursor = self.cursors.CLOSE_HAND;
                        }

                        self._setCursor(cursor);
                    }
                });
                shape.off('mouseleave');
                shape.on('mouseleave', function () {
                    if (((!(self.repairRoadsView.player.getModalPresent())) && (!self.repairRoadsView.isMouseDownOnElement))) {
                        self._changeHoverStateOfShape(false);
                        if (!self.isShapeDragged) {
                            self._setCursor(self.cursors.DEFAULT);
                        }
                    }
                });
                shape.off('mousemove');
                shape.on('mousemove', function () {

                    if ((!(self.repairRoadsView.player.getModalPresent())) && (!self.repairRoadsView.isMouseDownOnElement)) {
                        if (self.isShapeDragged) {
                            return;
                        }

                        self._setCursor(self.cursors.OPEN_HAND);
                    }
                });
            }
        },

        /**
        * Resets the Model snapping values
        *
        * @method _resetModelSnappingValues
        * @private
        */
        _resetModelSnappingValues: function () {
            this.repairRoadsView.model.set('snappedToX', false);
            this.repairRoadsView.model.set('snappedToY', false);
            this.model.set('snappedToX', false);
            this.model.set('snappedToY', false);
            this.repairRoadsView.model.set('snappedToWrongX', false);
            this.repairRoadsView.model.set('snappedToWrongY', false);
            this.model.set('snappedToWrongX', false);
            this.model.set('snappedToWrongY', false);
        },

        /**
        * Changes Color on Hover
        *
        * @method _changeHoverStateOfShape
        * @param isMouseEnter {Boolean} If mouse entered or not
        * @private
        */
        _changeHoverStateOfShape: function (isMouseEnter) {
            var shape = this.model.get('paperGroupElem'),
                 shapeArray = shape.getItems({ name: 'shape' }),
                 shapeLength = shapeArray.length,
                 notSelectedLeaveColor = '#ffb400',
                 selectedEnterColor = '#14bfca',
                 notSelectedEnterColor = '#ffc438',
                 selectedLeaveColor = '#07a1ab',
                 currColor,
                 isSelected;

            isSelected = this.model.get('isSelected');
            if (isSelected) {
                if (isMouseEnter) {
                    currColor = selectedEnterColor;
                }
                else {
                    currColor = selectedLeaveColor;
                }
            }
            else {
                if (isMouseEnter) {
                    currColor = notSelectedEnterColor;
                }
                else {
                    currColor = notSelectedLeaveColor;
                }
            }
            for (var i = 0; i < shapeLength; i++) {
                shapeArray[i].fillColor = currColor;
            }
        },

        /**
        * Triggered when the whole activity is complete.
        * Changes the opacity of the shapes to represent disabled state
        *
        * @method _onActivityComplete
        * @private
        */
        _onActivityComplete: function () {
            var self = this,
                shape = this.model.get('paperGroupElem'),
                shapes = shape.getItems({
                    name: 'shape'
                });
            var lengthOfShapes = shapes.length;
            if (lengthOfShapes > 0) {
                this._unbindShapeEvents();
                this._resetShape();
                for (var i = 0; i < lengthOfShapes; i++) {
                    shapes[i].fillColor.alpha = 0.5;
                }
            }
        },

        /**
        * Set cursor value to the repair road model.
        *
        * @method _setCursor
        * @param cursor {Number} Type of cursor
        * @private
        */
        _setCursor: function (cursor) {
            this.repairRoadsView.model.set('cursor', cursor);
        },

        /**
        * Fits the given shape within the bounds of the canvas during dragging
        *
        * @method _fitInBounds
        * @param position {Object} Reference to the updated position of the element being dragged
        * @private
        */
        _fitInBounds: function (position) {
            var shape = this.model.get('paperGroupElem'),
                shapePosition = shape.position,
                positionOffset = this._getDifference(position, shapePosition),
                shapeTop = shape.bounds.topCenter.y + positionOffset.y,
                shapeBottom = shape.bounds.bottomCenter.y + positionOffset.y,
                shapeLeft = shape.bounds.leftCenter.x + positionOffset.x,
                shapeRight = shape.bounds.rightCenter.x + positionOffset.x,
                shapeHorizontalOffset = shape.bounds.width / 6,
                shapeVerticalOffset = shape.bounds.height / 6,
                maxX = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.CANVAS_SIZE.WIDTH,
                maxY = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.CANVAS_SIZE.HEIGHT,
                minX = 0,
                minY = 0,
                positionChanged = false;

            /*     if (shapeTop < minY) {
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
              */
            if (position.y < minY + shapeVerticalOffset) {
                position.y = minY + shapeVerticalOffset;
                positionChanged = true;
            }
            else if (position.y > maxY - shapeVerticalOffset) {
                position.y = maxY - shapeVerticalOffset;
                positionChanged = true;
            }

            if (position.x < minX + shapeHorizontalOffset) {
                position.x = minX + shapeHorizontalOffset;
                positionChanged = true;
            }
            else if (position.x > maxX - shapeHorizontalOffset) {
                position.x = maxX - shapeHorizontalOffset;
                positionChanged = true;
            }

            if (positionChanged) {
                this.repairRoadsView.accessibilityFlagForSnapping = true;
                this.repairRoadsView.changeAccMessage('canvas-acc-container', 10);
                this.repairRoadsView._setFocusOnCanvas();
            }
            else {
                this.repairRoadsView.accessibilityFlagForSnapping = false;
            }

            return position;
        },

        /**
        * Fits the given shape within the bounds if it goes out from top and bottom
        *
        * @method _bringInBounds
        * @private
        */
        _bringInBounds: function () {
            var shape = this.model.get('paperGroupElem'),
                yDelta = 10,
                shapeTop = shape.bounds.top - yDelta,
                shapeBottom = shape.bounds.bottom + yDelta,
                maxX = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.CANVAS_SIZE.WIDTH,
                maxY = MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.CANVAS_SIZE.HEIGHT,
                minX = 0,
                minY = 0;

            if (shapeTop < minY && shapeBottom > maxY) {
                shape.position.y = minY + (shape.position.y - shapeTop);
                this._drawBoundingBox();
            }
        },

        /**
        * Unbinds The Events on Shape
        *
        * @method _unbindShapeEvents
        * @private
        */
        _unbindShapeEvents: function () {
            var self = this,
                shape = this.model.get('paperGroupElem');

            shape.off('mousedown');
            shape.off('mousedrag');

            if (!(MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile)) {
                shape.off('mouseenter');
                shape.off('mouseleave');
                shape.off('mousemove');
            }
            self.currentTool.off('mouseup');
            self.currentTool.detach('mouseup');
            self.stopListening(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.BACKGROUND_CLICKED);
            self._setCursor(self.cursors.DEFAULT);
        },

        /**
        * Selects the Current Shape
        *
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
        *
        * @method _bindCircleEvents
        * @private
        */
        _bindCircleEvents: function () {
            var shape = this.model.get('paperGroupElem'),
                nameOfShape,
                rotationObject,
                firstPoint,
                previousAngle,
                circleHovered,
                circleGroupChild,
                self = this;
            if (!(MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile)) {
                self._bindMouseEnterEvent();
            }
            this.stopListening(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACCESSIBILITY_ROTATE);
            this.listenTo(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACCESSIBILITY_ROTATE, $.proxy(self._rotateShapeForAccessibility, self));
            this.stopListening(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACCESSIBILITY_ROTATE_UP);
            this.listenTo(self.repairRoadsView, MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ACCESSIBILITY_ROTATE_UP, $.proxy(self._rotateUpShapeForAccessibility, self));

            this.repairRoadsView.circleGroup.on('mousedown', function (event) {
                self.eventCode = event.event.which;
                if ((self.eventCode === 1 || self.eventCode === 0 || MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) && (!self.repairRoadsView.isMouseDownOnElement)) {

                    MathInteractives.global.SpeechStream.stopReading();
                    self.isMouseupOnCircle = false;
                    self.repairRoadsView.isMouseDownOnElement = true;
                    self.isMouseDownOnThisShape = true;
                    circleGroupChild = this.children[event.target.name];
                    self._changeHoverState('#ffffff', '#b9b9b9', circleGroupChild);

                    circleHovered = (self.repairRoadsView.rasterCircleGroup.children[event.target.name]);
                    if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                        circleHovered.visible = true;
                    }
                    else {
                        circleHovered.visible = false;
                    }
                    circleHovered.sendToBack();
                    circleGroupChild.bringToFront();
                    firstPoint = event.point;
                    self.pivot = self.repairRoadsView.boundingBox.position;
                    var xAxisPoint = new self.paperScope.Point(self.pivot.x + 10, self.pivot.y);
                    previousAngle = self._findAngle(firstPoint, self.pivot, xAxisPoint, true);

                    if (self.repairRoadsView.boundingBoxGroup) {
                        self.repairRoadsView.boundingBoxGroup.remove();
                    }
                    self.repairRoadsView.boundingBoxGroup = new self.paperScope.Group(self.repairRoadsView.boundingBox, self.repairRoadsView.circleGroup, self.repairRoadsView.rasterCircleGroup);
                    var cursor = self.cursors.CLOSE_HAND;
                    self._setCursor(cursor);

                    self.repairRoadsView.circleGroup.on('mouseup', function () {

                        self.isMouseupOnCircle = true;
                        self._setCursor(self.cursors.DEFAULT);
                        if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                            circleHovered.visible = false;
                            self._changeHoverState('#b9b9b9', '#ffffff', circleGroupChild);
                        }
                        else {
                            circleHovered.visible = true;
                            circleHovered.sendToBack();
                            this.bringToFront();
                        }

                        self.repairRoadsView.circleGroup.off('mouseup');
                    });

                    self.currentTool.on('mouseup', function (event) {


                        self._drawAngles();
                        self.repairRoadsView.isMouseDownOnElement = false;
                        self.isMouseDownOnThisShape = false;
                        self._bindMouseEnterEvent();
                        self._checkSnapOnUp();

                        if (!self.isMouseupOnCircle || MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                            self._setCursor(self.cursors.DEFAULT);
                            self._changeHoverState('#b9b9b9', '#ffffff', circleGroupChild);
                            circleHovered.visible = false;

                        }
                        else {
                            circleHovered.visible = true;
                        }

                        self.isCircleDragged = false;
                        self.currentTool.off('mouseup');
                        self.repairRoadsView.circleGroup.off('mouseup');
                        self._bringInBounds();
                    });

                }
            });
            this.repairRoadsView.circleGroup.off('mousedrag');
            this.repairRoadsView.circleGroup.on('mousedrag', function (event) {
                if ((self.eventCode === 1 || self.eventCode === 0 || MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) && (!self.repairRoadsView.isMouseDownOnElement || self.isMouseDownOnThisShape)) {
                    if (!self.isCircleDragged) {
                        circleHovered.visible = false;
                    }
                    self.isCircleDragged = true;
                    var xAxisPoint, angle, rotateAngle;

                    xAxisPoint = new self.paperScope.Point(self.pivot.x + 10, self.pivot.y);
                    angle = self._findAngle(event.point, self.pivot, xAxisPoint, true);
                    rotateAngle = previousAngle - angle;
                    previousAngle = angle;

                    firstPoint = self.repairRoadsView.circleGroup.position;
                    shape.rotate(rotateAngle, self.pivot);
                    self.repairRoadsView.boundingBoxGroup.rotate(rotateAngle, self.pivot);
                    self.model.set('rotation', self._fixRotationAngle((self.model.get('rotation') + rotateAngle)));
                    self._removeAngleGroup();
                    self._resetModelSnappingValues();
                }
            });
            this.repairRoadsView.circleGroup.off('mousemove');
            this.repairRoadsView.circleGroup.on('mousemove', function () {

                if ((!(self.repairRoadsView.player.getModalPresent())) && (!self.repairRoadsView.isMouseDownOnElement)) {
                    if (self.isCircleDragged) {
                        return;
                    }
                    self._setCursor(self.cursors.OPEN_HAND);
                }
            });

        },


        /**
        * Checks Snapping of Piece and Road on Up
        *
        * @method _checkSnapOnUp
        * @private
        */
        _checkSnapOnUp: function () {
            var self = this;
            var shape = this.model.get('paperGroupElem');

            if (!self.repairRoadsView.model.get('roadComplete')) {
                self._checkSnap();
            }

            if (self.repairRoadsView.model.get('checkPathSnap')) {
                self._checkPathSnap();
            }
            else if (shape.children.length === self.collection.length) {
                self._checkPathSnap();
                self._removeBoundingBox();
                self.repairRoadsView.model.set('checkPathSnap', true);
            }
            else {
                self.repairRoadsView.model.set('checkPathSnap', true);
                self.repairRoadsView.model.set('snappedToX', self.model.get('snappedToX'));
                self.repairRoadsView.model.set('snappedToY', self.model.get('snappedToY'));
                self.repairRoadsView.model.set('snappedToWrongX', self.model.get('snappedToWrongX'));
                self.repairRoadsView.model.set('snappedToWrongY', self.model.get('snappedToWrongY'));
            }
        },

        /**
        * Rotation for Accessibility
        *    
        * @method _rotateShapeForAccessibility
        * @param event{Object} Event for rotation
        * @private
        */
        _rotateShapeForAccessibility: function (event) {
            var shape = this.model.get('paperGroupElem'),
                self = this;
            self.pivot = self.repairRoadsView.boundingBox.position;
            shape.rotate(event.rotateAngle, self.pivot);
            self.repairRoadsView.boundingBox.rotate(event.rotateAngle, self.pivot);
            self.repairRoadsView.circleGroup.rotate(event.rotateAngle, self.pivot);
            self.repairRoadsView.rasterCircleGroup.rotate(event.rotateAngle, self.pivot);
            self.model.set('rotation', self._fixRotationAngle(self.model.get('rotation') + event.rotateAngle));
            self._removeAngleGroup();
            self._resetModelSnappingValues();
        },

        /**
        * Rotation Up for Accessibility
        *
        * @method _rotateUpShapeForAccessibility
        * @param event{Object} Event for rotation
        * @private
        */
        _rotateUpShapeForAccessibility: function (event) {
            this._drawAngles();
            this.paperScope.view.draw();
            this.repairRoadsView.isMouseDownOnElement = false;
            this.isMouseDownOnThisShape = false;
            this._checkSnapOnUp();
            this._bringInBounds();

            this.repairRoadsView.accessibilityFlagForSnapping = false;
        },

        /**
        * Binds The Mouse Entere and Leave Events on Circle 
        *
        * @method _bindMouseEnterEvent
        * @private
        */
        _bindMouseEnterEvent: function () {

            var circleHovered,
                circleGroupChild,
                self = this;
            this.repairRoadsView.circleGroup.off('mouseenter');
            this.repairRoadsView.circleGroup.on('mouseenter', function (event) {
                if (((!(self.repairRoadsView.player.getModalPresent())) && (!self.repairRoadsView.isMouseDownOnElement))) {
                    circleHovered = (self.repairRoadsView.rasterCircleGroup.children[event.target.name]);
                    circleHovered.visible = true;
                    circleHovered.sendToBack();
                    this.bringToFront();
                    circleGroupChild = this.children[event.target.name];
                    self._changeHoverState('#ffffff', '#b9b9b9', circleGroupChild);
                    var cursor = self.cursors.OPEN_HAND;

                    if (self.isCircleDragged) {
                        cursor = self.cursors.CLOSE_HAND;
                    }

                    self._setCursor(cursor);
                    this.off('mouseleave');
                    this.on('mouseleave', function (event) {
                        if (((!(self.repairRoadsView.player.getModalPresent())) && (!self.repairRoadsView.isMouseDownOnElement))) {
                            circleHovered.visible = false;

                            if (!self.isCircleDragged) {
                                self._setCursor(self.cursors.DEFAULT);
                                self._changeHoverState('#b9b9b9', '#ffffff', circleGroupChild);
                            }
                        }
                    });
                }
            });
        },

        /**
        * Calculates the Angle
        *
        * @method _findAngle
        * @param A{Object} First point
        * @param B{Object} Second point
        * @param C{Object} Third point which lies on the line from pivot which is parallel to X-axis or Y-axis depending on the boolean compareWithY  
        * @param degrees{Boolean} true if angle required in degree and false if required in radians
        * @param compareWithY {Boolean} color code 
        * @return angle{Number} which may be positive or negative
        * @private
        */
        _findAngle: function (A, B, C, degrees, compareWithY) {
            var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2)),
                BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2)),
                AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2)),
                inv = compareWithY ? A.x < B.x ? 1 : -1 : A.y < B.y ? 1 : -1;
            if (degrees) {
                return inv * Math.acos(+((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)).toFixed(10)) * 180 / Math.PI;
            }
            return inv * Math.acos(+((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)).toFixed(10));
        },

        /*
        *  It sets the hover color to the Circle
        *
        * @method _changeHoverState 
        * @param color1 {String} color code
        * @param color2 {String} color code
        * @param context {Object} object of circle
        * @private
        */
        _changeHoverState: function (color1, color2, context) {

            context.fillColor = {
                gradient: {
                    stops: [color1, color2]
                },
                origin: context.bounds.bottomCenter,
                destination: context.bounds.topCenter
            };
        },

        /**
        * Draws The Bounding Box
        *
        * @method _drawBoundingBox
        * @private
        */
        _drawBoundingBox: function () {

            var shape = this.model.get('paperGroupElem'),
                radius = 6,
                dummyRadius = 15,
                offset = 5,
                rasterOffset = 0,
                topLeftShape = shape.bounds.topLeft,
                bottomRightShape = shape.bounds.bottomRight,
                topRightShape = shape.bounds.topRight,
                bottomLeftShape = shape.bounds.bottomLeft,
                shapeBoundWidth = shape.bounds.width,
                shapeBoundHeight = shape.bounds.height,
                topLeftRect = new this.paperScope.Point(shape.bounds.x - offset, shape.bounds.y - offset),
                rectSize = new this.paperScope.Size(shapeBoundWidth + (2 * offset), shapeBoundHeight + (2 * offset)),
                self = this, rasterCircle, rasterSymbol, circle, dummyCircle,
                rasterSymbolObject = {}, circleObject = {}, circleObjectLength, rasterSymbolObjectLength;
            if (this.repairRoadsView.boundingBox) {
                this._removeBoundingBox();
            }
            this.repairRoadsView.boundingBox = new this.paperScope.Path.Rectangle(topLeftRect, rectSize);
            this.repairRoadsView.boundingBox.style = {
                strokeColor: '#ffffff',
                dashArray: [3, 3],
                strokeWidth: 2,
                shadowColor: '#000000',
                shadowBlur: 3,
                shadowOffset: new this.paperScope.Point(2, 2)
            };
            this.repairRoadsView.boundingBox.shadowColor.alpha = 0.38;

            rasterCircle = new this.paperScope.Raster({
                source: this.arrowImagePath
            }),
            rasterSymbol = new this.paperScope.Symbol(rasterCircle),

             circle = new this.paperScope.Path.Circle({
                 radius: radius,
                 center: new this.paperScope.Point(0, 0),
                 strokeWidth: 2,
                 strokeColor: '#4c1787',
                 shadowColor: new this.paperScope.Color(0, 0, 0),
                 shadowBlur: 3,
                 shadowOffset: new this.paperScope.Point(2, 2)
             });
            circle.shadowColor.alpha = 0.68;

            self._changeHoverState('#b9b9b9', '#ffffff', circle);

            circleObject = [
               {
                   name: 'circle1',
                   center: this._getDifference(topLeftShape, new this.paperScope.Point(offset, offset))

               },
               {
                   name: 'circle2',
                   center: new this.paperScope.Point(bottomLeftShape.x - offset, bottomLeftShape.y + offset)

               },
                {
                    name: 'circle3',
                    center: new this.paperScope.Point(topRightShape.x + offset, topRightShape.y - offset)

                },
               {
                   name: 'circle4',
                   center: this._getDifference(bottomRightShape, new this.paperScope.Point(-offset, -offset))

               }];

            rasterCircle.remove();

            this.repairRoadsView.rasterCircleGroup = new this.paperScope.Group();
            this.repairRoadsView.circleGroup = new this.paperScope.Group();

            circleObjectLength = circleObject.length;
            for (var i = 0; i < circleObjectLength; i++) {
                var instanceOfCircle = circle.clone();
                instanceOfCircle.position = (circleObject[i]).center;
                instanceOfCircle.name = (circleObject[i]).name;
                this.repairRoadsView.circleGroup.addChild(instanceOfCircle);
            }
            circle.remove();

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                dummyCircle = new this.paperScope.Path.Circle({
                    radius: dummyRadius,
                    center: new this.paperScope.Point(0, 0),
                    fillColor: '#ffffff',
                    opacity: 0
                });

                for (var i = 0; i < circleObjectLength; i++) {
                    var instanceOfDummyCircle = dummyCircle.clone();
                    instanceOfDummyCircle.position = (circleObject[i]).center;
                    instanceOfDummyCircle.name = (circleObject[i]).name;
                    this.repairRoadsView.circleGroup.addChild(instanceOfDummyCircle);
                }
            }

            rasterSymbolObject = [
            {
                name: 'circle1',
                position: this._getDifference(this.repairRoadsView.circleGroup.children[0].bounds.topLeft, new this.paperScope.Point(rasterOffset, rasterOffset)),
                rotate: 270
            },
            {
                name: 'circle2',
                position: this._getDifference(this.repairRoadsView.circleGroup.children[1].bounds.bottomLeft, new this.paperScope.Point(rasterOffset, -rasterOffset)),
                rotate: 180
            },
             {
                 name: 'circle3',
                 position: this._getDifference(this.repairRoadsView.circleGroup.children[2].bounds.topRight, new this.paperScope.Point(-rasterOffset, rasterOffset)),
                 rotate: 0
             },
            {
                name: 'circle4',
                position: this._getDifference(this.repairRoadsView.circleGroup.children[3].bounds.bottomRight, new this.paperScope.Point(-rasterOffset, -rasterOffset)),
                rotate: 90
            }];

            rasterSymbolObjectLength = rasterSymbolObject.length;
            for (var i = 0; i < rasterSymbolObjectLength; i++) {
                var instance = rasterSymbol.place();
                instance.position = (rasterSymbolObject[i]).position;
                instance.name = (rasterSymbolObject[i]).name;
                instance.rotate((rasterSymbolObject[i]).rotate);
                instance.visible = false;
                this.repairRoadsView.rasterCircleGroup.addChild(instance);
            }
            this._bindCircleEvents(this.repairRoadsView.circleGroup, shape);

        },

        /**
        * Removes The Bounding Box
        *
        * @method _removeBoundingBox
        * @private
        */
        _removeBoundingBox: function () {
            var self = this;
            if (this.repairRoadsView.boundingBox !== undefined && this.repairRoadsView.boundingBox !== null) {
                self.repairRoadsView.circleGroup.off('mouseenter');
                self.repairRoadsView.boundingBox.remove();
                self.repairRoadsView.circleGroup.remove();
                self.repairRoadsView.rasterCircleGroup.remove();
            }
        },

        /**
        * Checks if the shapes are neighbours of each other or not
        *
        * @method _isNeighbour
        * @param name1 {string} Name of first shape
        * @param name2 {string}  Name of second shape
        * @return {Boolean} if the shapes are neighbour then true or else false
        * @private
        */
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
        *
        * @method _getDistance
        * @param draggedModel {Object} Backbone Model which is Dragged
        * @param comparedModel {Object} Backbone Model which is to be compared
        * @param nameOfComparedModel {String} Name of Shape from the Compared Model
        * @param comparedsegmentIndex {Number} Compared Segment Index 
        * @param segmentIndex {Number} Dragged Segment Index 
        * @param removeSegmentFlag {Boolean} If the segment is to be removed.True when the third call to the function is made
        * @param lastPieceFlag {Boolean} Flag for snapping of last piece 
        * @return {Object} Distance Object which contains value along with the segments 
        * @private
        */
        _getDistance: function (draggedModel, comparedModel, nameOfComparedModel, comparedsegmentIndex, segmentIndex, removeSegmentFlag, lastPieceFlag) {

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

                        if ((segment1 && (segment1.length > 0) && segment2 && (segment2.length > 0)) || (lastPieceFlag)) {


                            var segmentOfCompared = comparedModelSegmentsArray[parseInt(segment2[comparedsegmentIndex])],
                                segmentOfDragged = draggedModelSegmentsArray[parseInt(segment1[segmentIndex])];

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
                                distance.segmentIndex.compared = segment2[comparedsegmentIndex];
                                distance.segmentIndex.dragged = segment1[segmentIndex];
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
        *
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
                angle1OfDragged, angle2OfDragged, angle1OfCompared, angle2OfCompared, modelChildrenLength, snapIndices, prevModel, firstindexForLastPiece, secondindexForLastPiece, lastPieceFlag = false;

            var self = this, removeSnapIndiceFlag = true, removeSegmentFlag = false, removeSnapIndiceFlagForCompared = true, changeSegmentFlag = false,
             shapeFromShapeArrayToCompare, nameOfShapeForUpdation,
             shape = self.model.get('paperGroupElem'),
             nameOfDraggedModel = self.model.get('name'),
             draggedModel = self.collection.where({ name: nameOfDraggedModel }),
             snapped = false,
             collectionLength = this.collection.length,
             draggedModelLength = shape.children.length, y = 0,
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
                        if (snappingIndicesLength === 4) {
                            removeSnapIndiceFlag = false;
                        }

                        //For Dragging Single Piece at the End and Snapping Second Time
                        //And Checking if It is a Single Piece Case
                        if (((draggedModel[0].get('name') === comparedModel.get('name')) || (comparedModel.get('paperGroupElem').children.length === 15)) && (draggedModelLength === 1)) {
                            if ((draggedModel[0].get('name') === comparedModel.get('name'))) {
                                comparedModel = prevModel;
                                removeSnapIndiceFlagForCompared = true;

                            }
                            else {
                                removeSnapIndiceFlagForCompared = false;
                            }

                            lastPieceFlag = true;
                            snapIndices = (comparedModel.get('snapIndices'))[nameOfDraggedModel];

                            var tempModel = ((self.collection.where({ name: nameOfComparedModel })[0].get('snapIndices'))[nameOfDraggedModel]);
                            if (tempModel.length != 4) {
                                firstindexForLastPiece = tempModel[0];
                                secondindexForLastPiece = tempModel[1];
                            }
                            else {
                                firstindexForLastPiece = tempModel[2];
                                secondindexForLastPiece = tempModel[3];
                            }
                        }

                        for (var k = 0; k < snappingIndicesLength; k += 2) {
                            //For Dragging Single Piece at the End and Snapping Second Time
                            if (lastPieceFlag) {
                                k = 2;
                                d1 = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, snapIndices.indexOf(firstindexForLastPiece), 0, removeSegmentFlag);
                                d2 = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, snapIndices.indexOf(secondindexForLastPiece), 1, removeSegmentFlag);
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
                                    self.repairRoadsView._updateShapeChildrenCount(draggedModel[0].get('groupName'), comparedModel.get('groupName'));
                                    shape.rotate(angleToBeRotatedBy);
                                    draggedModel[0].set('rotation', comparedModel.get('rotation'));
                                    draggedModel[0].set('snappedToX', comparedModel.get('snappedToX'));
                                    draggedModel[0].set('snappedToY', comparedModel.get('snappedToY'));
                                    draggedModel[0].set('snappedToWrongX', comparedModel.get('snappedToWrongX'));
                                    draggedModel[0].set('snappedToWrongY', comparedModel.get('snappedToWrongY'));

                                    if (comparedModel.get('paperGroupElem').children.length !== 15) {
                                        removeSegmentFlag = true;
                                    }
                                    else {
                                        removeSnapIndiceFlagForCompared = false;
                                        removeSegmentFlag = false;
                                        removeSnapIndiceFlag = false;
                                    }

                                    if (lastPieceFlag) {
                                        var d = self._getDistance(draggedModel[0], comparedModel, nameOfComparedModel, snapIndices.indexOf(firstindexForLastPiece), 0, removeSegmentFlag);
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

                                    angleGroupOfDragged = (paperGroupOfDragged.children[d1.nameOfDraggedShape]).children[MathInteractives.Interactivities.PicturePerfect.Views.Shape.GROUP_ELEMENT_INDEX.ANGLE_GROUP];
                                    angleGroupOfCompared = (paperGroupOfDragged.children[nameOfComparedModel]).children[MathInteractives.Interactivities.PicturePerfect.Views.Shape.GROUP_ELEMENT_INDEX.ANGLE_GROUP];

                                    if (angleGroupOfDragged && angleGroupOfCompared) {
                                        if (angleGroupOfDragged.children.length > 0 && angleGroupOfCompared.children.length > 0) {
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
                                            self._updateAngles();
                                        }
                                    }
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

                var stringForAccessibility = '', endPart;

                for (var i = 0; i < self.angleLabels.length; i = i + 2) {
                    if (i + 2 !== self.angleLabels.length) {
                        if (i + 4 === self.angleLabels.length) {
                            // and
                            endPart = self.repairRoadsView.getAccMessage('end-tag-for-angle', 0);
                        }
                        else {
                            // ,
                            endPart = self.repairRoadsView.getAccMessage('end-tag-for-angle', 1);
                        }
                    }
                    else {
                        // .
                        endPart = self.repairRoadsView.getAccMessage('end-tag-for-angle', 2);
                    }

                    if (self.angleLabels[i].data.isComplementary) {
                        stringForAccessibility = stringForAccessibility + self.repairRoadsView.getAccMessage('canvas-acc-container', 4, [self.angleLabels[i]._content, self.angleLabels[i + 1]._content, endPart]);
                    }
                    else if (self.angleLabels[i].data.isSupplementary) {
                        stringForAccessibility = stringForAccessibility + self.repairRoadsView.getAccMessage('canvas-acc-container', 5, [self.angleLabels[i]._content, self.angleLabels[i + 1]._content, endPart]);
                    }
                }

                this.repairRoadsView.accessibilityFlagForSnapping = true;
                self.repairRoadsView.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.SHAPE_SNAPPED);
                self.repairRoadsView.model.set('checkPathSnap', false);

                if (shape.children.length === self.collection.length) {
                    self.repairRoadsView.model.set('roadComplete', true);
                    if (!self.repairRoadsView.model.get('activityComplete')) {
                        stringForAccessibility = stringForAccessibility + self.repairRoadsView.getAccMessage('canvas-acc-container', 9);
                    }
                }
                else {
                    stringForAccessibility = stringForAccessibility + self.repairRoadsView.getAccMessage('canvas-acc-container', 1, self.repairRoadsView._readAnglesOfShape(self.model.get('paperGroupElem')));
                }
                this.repairRoadsView.setAccMessage('canvas-acc-container', stringForAccessibility);
                this.repairRoadsView._setFocusOnCanvas();

            }

        },

        /**
        * Sets Accessibility Text for Snapping on Path
        *
        * @method _setPathSnapAccessibilityText
        * @param snappedToPath{Boolean} Boolean for path snapping on road
        * @private
        */
        _setPathSnapAccessibilityText: function (snappedToPath) {
            if (snappedToPath) {
                this.repairRoadsView.accessibilityFlagForSnapping = true;
                this.repairRoadsView.changeAccMessage('canvas-acc-container', 8);
                this.repairRoadsView._setFocusOnCanvas();
            }
        },

        /**
        * Check Snapping Of groups with the path
        *
        * @method _checkPathSnap
        * @private
        */
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
            if (!this.entirePath.contains(shapes[0].position)) {
                this._trySnapping();
            }
        },

        /**
        * Checks the type of path and tries snapping the shape on the respective path
        *
        * @method _trySnapping
        * @private
        */
        _trySnapping: function () {
            var pathDisplayed = this.repairRoadsView.model.get('pathDisplayed'),
                parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;
            if (pathDisplayed === parentModelNamespace.ROADTYPES.RECTANGLESHAPED) {
                this._tryRectangleSnapping(true);
                this._tryRectangleSnapping(false);
            }
            else {
                this._tryZigzagSnapping(true);
                this._tryZigzagSnapping(false);
            }
        },

        /**
        * Tries snapping the shape on the rectangle path
        *
        * @method _tryRectangleSnapping
        * @param snapToY {Boolean} If true, path snapping is checked with all horizontal path sides
        * @private
        */
        _tryRectangleSnapping: function (snapToY) {

            var allSymbols = this.allSymbols,
                outerSymbolKeys = Object.keys(allSymbols).filter(function (element) {
                    return element.indexOf('outer') > -1;
                }),
                innerSymbolKeys = Object.keys(allSymbols).filter(function (element) {
                    return element.indexOf('inner') > -1;
                }),
                outerKeysLength = outerSymbolKeys.length,
                innerKeysLength = innerSymbolKeys.length,
                snappedToPath = false;

            for (var i = 0; i < outerKeysLength; i++) {
                if (!snappedToPath) {
                    if (allSymbols[outerSymbolKeys[i]].length === 2) {
                        snappedToPath = this._snapToRectanglePath(allSymbols[outerSymbolKeys[i]], snapToY);
                    }
                }
                else {
                    break;
                }
            }

            if (!snappedToPath) {
                for (var i = 0; i < innerKeysLength; i++) {
                    if (!snappedToPath) {
                        if (allSymbols[innerSymbolKeys[i]].length === 2) {
                            snappedToPath = this._snapToRectanglePath(allSymbols[innerSymbolKeys[i]], snapToY);
                        }
                    }
                    else {
                        break;
                    }
                }
            }

        },

        /**
        * Tries snapping the shape on the rectangle path
        *
        * @method _tryZigzagSnapping
        * @param snapToY {Boolean} If true, path snapping is checked with all horizontal path sides
        * @private
        */
        _tryZigzagSnapping: function (snapToY) {
            var allSymbols = this.allSymbols,
                upperSymbolKeys = Object.keys(allSymbols).filter(function (element) {
                    return element.indexOf('upper') > -1;
                }),
                lowerSymbolKeys = Object.keys(allSymbols).filter(function (element) {
                    return element.indexOf('lower') > -1;
                }),
                middleSymbolKeys = Object.keys(allSymbols).filter(function (element) {
                    return element.indexOf('middle') > -1;
                }),
                upperKeysLength = upperSymbolKeys.length,
                lowerKeysLength = lowerSymbolKeys.length,
                middleKeysLength = middleSymbolKeys.length,
                snappedToPath = false;

            for (var i = 0; i < upperKeysLength; i++) {
                if (!snappedToPath) {
                    if (allSymbols[upperSymbolKeys[i]].length === 2) {
                        snappedToPath = this._snapToZigzagPath(allSymbols[upperSymbolKeys[i]], snapToY);
                    }
                }
                else {
                    break;
                }
            }

            if (!snappedToPath) {
                for (var i = 0; i < lowerKeysLength; i++) {
                    if (!snappedToPath) {
                        if (allSymbols[lowerSymbolKeys[i]].length === 2) {
                            snappedToPath = this._snapToZigzagPath(allSymbols[lowerSymbolKeys[i]], snapToY);
                        }
                    }
                    else {
                        break;
                    }
                }
            }

            if (!snappedToPath) {
                for (var i = 0; i < middleKeysLength; i++) {
                    if (!snappedToPath) {
                        if (allSymbols[middleSymbolKeys[i]].length === 2) {
                            snappedToPath = this._snapToZigzagPath(allSymbols[middleSymbolKeys[i]], snapToY);
                        }
                    }
                    else {
                        break;
                    }
                }
            }

        },

        /**
        * Snaps the shape to the rectangle path
        *
        * @method _snapToRectanglePath
        * @param symbols {Array} Array of endpoints of the side of the shape to be snapped to the path
        * @param snapToY {Boolean} If true, path snapping is checked with all horizontal path sides
        * @private
        */
        _snapToRectanglePath: function (symbols, snapToY) {
            var parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                outerRectWidth = parentModelNamespace.OUTERROADWIDTH,
                outerRectHeight = parentModelNamespace.OUTERROADHEIGHT,
                innerRectWidth = parentModelNamespace.INNERROADWIDTH,
                innerRectHeight = parentModelNamespace.INNERROADHEIGHT,
                roadHeight = (outerRectHeight - innerRectHeight) / 2,
                roadWidth = (outerRectWidth - innerRectWidth) / 2,
                outerRectLeft = parentModelNamespace.RECTROAD_OFFSET.LEFT,
                outerRectTop = parentModelNamespace.RECTROAD_OFFSET.TOP,
                outerRectRight = outerRectLeft + outerRectWidth,
                outerRectBottom = outerRectTop + outerRectHeight,
                innerRectLeft = outerRectLeft + roadWidth,
                innerRectTop = outerRectTop + roadHeight,
                innerRectRight = innerRectLeft + innerRectWidth,
                innerRectBottom = innerRectTop + innerRectHeight,
                symbol1 = symbols[0],
                symbol2 = symbols[1],
                symbol1Position = symbol1.position,
                symbol2Position = symbol2.position,
                pathSnapOffset = parentModelNamespace.PATH_SNAP_OFFSET,
                snappedToPath = false;
            if (snapToY) {
                if (Math.abs(symbol1Position.y - outerRectTop) < pathSnapOffset &&
                    Math.abs(symbol2Position.y - outerRectTop) < pathSnapOffset) {

                    this._snapToPath(symbols, 'outer-top', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.y - outerRectBottom) < pathSnapOffset &&
                    Math.abs(symbol2Position.y - outerRectBottom) < pathSnapOffset) {

                    this._snapToPath(symbols, 'outer-bottom', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.y - innerRectTop) < pathSnapOffset &&
                    Math.abs(symbol2Position.y - innerRectTop) < pathSnapOffset &&
                    symbol1Position.x < innerRectRight &&
                    symbol1Position.x > innerRectLeft &&
                    symbol2Position.x < innerRectRight &&
                    symbol2Position.x > innerRectLeft) {

                    this._snapToPath(symbols, 'inner-top', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.y - innerRectBottom) < pathSnapOffset &&
                    Math.abs(symbol2Position.y - innerRectBottom) < pathSnapOffset &&
                    symbol1Position.x < innerRectRight &&
                    symbol1Position.x > innerRectLeft &&
                    symbol2Position.x < innerRectRight &&
                    symbol2Position.x > innerRectLeft) {

                    this._snapToPath(symbols, 'inner-bottom', snapToY);
                    snappedToPath = true;
                }
                this._setPathSnapAccessibilityText(snappedToPath);
                this.repairRoadsView.model.set('snappedToY', snappedToPath);
                this.model.set('snappedToY', snappedToPath);
            }
            else {
                if (Math.abs(symbol1Position.x - outerRectRight) < pathSnapOffset &&
                    Math.abs(symbol2Position.x - outerRectRight) < pathSnapOffset) {

                    this._snapToPath(symbols, 'outer-right', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.x - outerRectLeft) < pathSnapOffset &&
                    Math.abs(symbol2Position.x - outerRectLeft) < pathSnapOffset) {

                    this._snapToPath(symbols, 'outer-left', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.x - innerRectRight) < pathSnapOffset &&
                    Math.abs(symbol2Position.x - innerRectRight) < pathSnapOffset &&
                    symbol1Position.y > innerRectTop &&
                    symbol1Position.y < innerRectBottom &&
                    symbol2Position.y > innerRectTop &&
                    symbol2Position.y < innerRectBottom) {

                    this._snapToPath(symbols, 'inner-right', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.x - innerRectLeft) < pathSnapOffset &&
                    Math.abs(symbol2Position.x - innerRectLeft) < pathSnapOffset &&
                    symbol1Position.y > innerRectTop &&
                    symbol1Position.y < innerRectBottom &&
                    symbol2Position.y > innerRectTop &&
                    symbol2Position.y < innerRectBottom) {

                    this._snapToPath(symbols, 'inner-left', snapToY);
                    snappedToPath = true;
                }
                this._setPathSnapAccessibilityText(snappedToPath);
                this.repairRoadsView.model.set('snappedToX', snappedToPath);
                this.model.set('snappedToX', snappedToPath);
            }
            return snappedToPath;
        },

        /**
        * Snaps the shape to the zigzag path
        *
        * @method _snapToZigzagPath
        * @param symbols {Array} Array of endpoints of the side of the shape to be snapped to the path
        * @param snapToY {Boolean} If true, path snapping is checked with all horizontal path sides
        * @private
        */
        _snapToZigzagPath: function (symbols, snapToY) {

            var nameSpace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                xOffset = nameSpace.ZROAD_OFFSET.LEFT,
                yOffset = nameSpace.ZROAD_OFFSET.TOP,
                snapOffset = nameSpace.ZROAD_OFFSET.SNAP,
                roadWidth = nameSpace.ZROADWIDTH,
                totalWidth = nameSpace.ZROADTOTALWIDTH,
                totalHeight = nameSpace.ZROADTOTALHEIGHT,
                bottomPathWidth = nameSpace.ZROAD_BOTTOM_PATH_WIDTH,
                topPathWidth = nameSpace.ZROAD_TOP_PATH_WIDTH,
                bottomRoadTop = yOffset + totalHeight - roadWidth,
                bottomRoadBottom = yOffset + totalHeight,
                bottomRoadLeft = xOffset,
                bottomRoadRight = xOffset + bottomPathWidth,
                topRoadTop = yOffset,
                topRoadBottom = yOffset + roadWidth,
                topRoadLeft = xOffset + totalWidth - topPathWidth,
                topRoadRight = xOffset + totalWidth,
                verticalRoadLeft = topRoadLeft,
                verticalRoadRight = bottomRoadRight,
                symbol1 = symbols[0],
                symbol2 = symbols[1],
                symbol1Position = symbol1.position,
                symbol2Position = symbol2.position,
                pathSnapOffset = nameSpace.PATH_SNAP_OFFSET,
                snappedToPath = false,
                snappedToWrongPath = false;

            if (snapToY) {
                if (Math.abs(symbol1Position.y - topRoadTop) < pathSnapOffset &&
                    Math.abs(symbol2Position.y - topRoadTop) < pathSnapOffset) {

                    this._snapToPath(symbols, 'upper-top', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.y - topRoadBottom) < pathSnapOffset &&
                    Math.abs(symbol2Position.y - topRoadBottom) < pathSnapOffset &&
                    (symbol1Position.x > verticalRoadRight &&
                    symbol2Position.x > verticalRoadRight)) {

                    this._snapToPath(symbols, 'upper-bottom', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.y - bottomRoadTop) < pathSnapOffset &&
                    Math.abs(symbol2Position.y - bottomRoadTop) < pathSnapOffset &&
                    (symbol1Position.x < verticalRoadLeft &&
                    symbol2Position.x < verticalRoadLeft)) {

                    this._snapToPath(symbols, 'lower-top', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.y - bottomRoadBottom) < pathSnapOffset &&
                    Math.abs(symbol2Position.y - bottomRoadBottom) < pathSnapOffset) {

                    this._snapToPath(symbols, 'lower-bottom', snapToY);
                    snappedToPath = true;
                }
                this._setPathSnapAccessibilityText(snappedToPath);

                if (Math.abs(this.model.get('rotation')) > 90 && Math.abs(this.model.get('rotation')) < 270) {
                    if (snappedToPath) {
                        snappedToWrongPath = true;
                    }
                    snappedToPath = false;
                    /*
                    if (this.model.get('paperGroupElem').children.length === this.collection.length && this.repairRoadsView.flagForWrongPath) {
                        this.repairRoadsView.flagForWrongPath = false;
                        this.repairRoadsView.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.ZSHAPE_WRONG_ACTIVITY_COMPLETE);
                    }
                    */
                }
                this.repairRoadsView.model.set('snappedToY', snappedToPath);
                this.model.set('snappedToY', snappedToPath);
                this.repairRoadsView.model.set('snappedToWrongY', snappedToWrongPath);
                this.model.set('snappedToWrongY', snappedToWrongPath);
            }
            else {
                if (Math.abs(symbol1Position.x - topRoadRight) < pathSnapOffset &&
                    Math.abs(symbol2Position.x - topRoadRight) < pathSnapOffset) {

                    this._snapToPath(symbols, 'upper-right', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.x - topRoadLeft) < pathSnapOffset &&
                    Math.abs(symbol2Position.x - topRoadLeft) < pathSnapOffset) {

                    this._snapToPath(symbols, 'upper-left', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.x - bottomRoadRight) < pathSnapOffset &&
                    Math.abs(symbol2Position.x - bottomRoadRight) < pathSnapOffset) {

                    this._snapToPath(symbols, 'lower-right', snapToY);
                    snappedToPath = true;
                }

                else if (Math.abs(symbol1Position.x - bottomRoadLeft) < pathSnapOffset &&
                    Math.abs(symbol2Position.x - bottomRoadLeft) < pathSnapOffset) {

                    this._snapToPath(symbols, 'lower-left', snapToY);
                    snappedToPath = true;
                }
                this._setPathSnapAccessibilityText(snappedToPath);
                if (Math.abs(this.model.get('rotation')) > 90 && Math.abs(this.model.get('rotation')) < 270) {
                    if (snappedToPath) {
                        snappedToWrongPath = true;
                    }
                    snappedToPath = false;
                }
                this.repairRoadsView.model.set('snappedToX', snappedToPath);
                this.model.set('snappedToX', snappedToPath);
                this.repairRoadsView.model.set('snappedToWrongX', snappedToWrongPath);
                this.model.set('snappedToWrongX', snappedToWrongPath);
            }
            return snappedToPath || snappedToWrongPath;
        },

        /**
        * Snaps the shape to the path
        *
        * @method _snapToPath
        * @param symbols {Array} Array of endpoints of the side of the shape to be snapped to the path
        * @param side {String} Type of side of path to which the shape is to be snapped
        * @param snapToY {Boolean} If true, path snapping is checked with all horizontal path sides
        * @private
        */
        _snapToPath: function (symbols, side, snapToY) {
            var symbol1 = symbols[0],
                symbol2 = symbols[1],
                symbol1Position = symbol1.position,
                symbol2Position = symbol2.position,
                xOffset = symbol1Position.x > symbol2Position.x ? 10 : -10,
                yOffset = symbol1Position.y > symbol2Position.y ? 10 : -10,
                thirdPointX = snapToY ? symbol2Position.x + xOffset : symbol2Position.x,
                thirdPointY = snapToY ? symbol2Position.y : symbol2Position.y + yOffset,
                inverse = snapToY ? symbol1Position.y > symbol2Position.y ? 1 : -1 : symbol1Position.x > symbol2Position.x ? -1 : 1,
                thirdPoint = new this.paperScope.Point(thirdPointX, thirdPointY),
                rotationAngle = inverse * this._findAngle(symbol1Position, symbol2Position, thirdPoint, true, snapToY),
                shape = this.model.get('paperGroupElem'),
                pathDisplayed = this.repairRoadsView.model.get('pathDisplayed'),
                parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;
            this._removeAngleGroup();
            shape.rotate(rotationAngle);
            this.model.set('rotation', this._fixRotationAngle(this.model.get('rotation') + rotationAngle));
            this._drawAngles();
            if (pathDisplayed === parentModelNamespace.ROADTYPES.RECTANGLESHAPED) {
                this._snapToRectangleSide(side, symbol1.position);
            }
            else {
                this._snapToZigzagSide(side, symbol1.position);
            }

        },

        /**
        * Snaps the shape to the rectangle path side
        *
        * @method _snapToRectangleSide
        * @param side {String} Type of side of path to which the shape is to be snapped
        * @param position {Object} Position of one of the endpoint of the side of the shape to be snapped to the path
        * @private
        */
        _snapToRectangleSide: function (side, position) {
            var parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                outerRectWidth = parentModelNamespace.OUTERROADWIDTH,
                outerRectHeight = parentModelNamespace.OUTERROADHEIGHT,
                innerRectWidth = parentModelNamespace.INNERROADWIDTH,
                innerRectHeight = parentModelNamespace.INNERROADHEIGHT,
                roadHeight = (outerRectHeight - innerRectHeight) / 2,
                roadWidth = (outerRectWidth - innerRectWidth) / 2,
                outerRectLeft = parentModelNamespace.RECTROAD_OFFSET.LEFT,
                outerRectTop = parentModelNamespace.RECTROAD_OFFSET.TOP,
                outerRectRight = outerRectLeft + outerRectWidth,
                outerRectBottom = outerRectTop + outerRectHeight,
                innerRectLeft = outerRectLeft + roadWidth,
                innerRectTop = outerRectTop + roadHeight,
                innerRectRight = innerRectLeft + innerRectWidth,
                innerRectBottom = innerRectTop + innerRectHeight,
                shape = this.model.get('paperGroupElem'),
                top = position.y,
                bottom = position.y,
                left = position.x,
                right = position.x,
                xDelta = 0,
                yDelta = 0,
                snapOffset = 3;

            switch (side) {
                case 'outer-top':
                    yDelta = outerRectTop - top - snapOffset;
                    break;
                case 'inner-top':
                    yDelta = innerRectTop - bottom - snapOffset;
                    break;
                case 'outer-bottom':
                    yDelta = outerRectBottom - bottom - snapOffset;
                    break;
                case 'inner-bottom':
                    yDelta = innerRectBottom - top - snapOffset;
                    break;
                case 'outer-left':
                    xDelta = outerRectLeft - left - snapOffset;
                    break;
                case 'inner-left':
                    xDelta = innerRectLeft - right - snapOffset;
                    break;
                case 'outer-right':
                    xDelta = outerRectRight - right - snapOffset;
                    break;
                case 'inner-right':
                    xDelta = innerRectRight - left - snapOffset;
                    break;
            }
            if (xDelta !== 0) {
                shape.position.x += xDelta;
            }
            if (yDelta !== 0) {
                shape.position.y += yDelta;
            }
            this._drawBoundingBox();
        },

        /**
        * Snaps the shape to the zigzag path side
        *
        * @method _snapToZigzagSide
        * @param side {String} Type of side of path to which the shape is to be snapped
        * @param position {Object} Position of one of the endpoint of the side of the shape to be snapped to the path
        * @private
        */
        _snapToZigzagSide: function (side, position) {

            var nameSpace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                xOffset = nameSpace.ZROAD_OFFSET.LEFT,
                yOffset = nameSpace.ZROAD_OFFSET.TOP,
                snapOffset = nameSpace.ZROAD_OFFSET.SNAP,
                roadWidth = nameSpace.ZROADWIDTH,
                totalWidth = nameSpace.ZROADTOTALWIDTH,
                totalHeight = nameSpace.ZROADTOTALHEIGHT,
                bottomPathWidth = nameSpace.ZROAD_BOTTOM_PATH_WIDTH,
                topPathWidth = nameSpace.ZROAD_TOP_PATH_WIDTH,
                bottomRoadTop = yOffset + totalHeight - roadWidth,
                bottomRoadBottom = yOffset + totalHeight,
                bottomRoadLeft = xOffset,
                bottomRoadRight = xOffset + bottomPathWidth,
                topRoadTop = yOffset,
                topRoadBottom = yOffset + roadWidth,
                topRoadLeft = xOffset + totalWidth - topPathWidth,
                topRoadRight = xOffset + totalWidth,
                verticalRoadLeft = topRoadLeft,
                verticalRoadRight = bottomRoadRight,
                shape = this.model.get('paperGroupElem'),
                top = position.y,
                bottom = position.y,
                left = position.x,
                right = position.x,
                xDelta = 0,
                yDelta = 0,
                snapOffset = 3;

            //Constants have been added to adjust the pieces according to the provided image
            switch (side) {
                case 'upper-top':
                    yDelta = topRoadTop - top - snapOffset + 2;
                    break;
                case 'lower-top':
                    yDelta = bottomRoadTop - top - snapOffset + 2;
                    break;
                case 'upper-bottom':
                    yDelta = topRoadBottom - bottom - snapOffset + 2;
                    break;
                case 'lower-bottom':
                    yDelta = bottomRoadBottom - bottom - snapOffset + 2;
                    break;
                case 'upper-left':
                    xDelta = topRoadLeft - left - snapOffset + 3;
                    break;
                case 'lower-left':
                    xDelta = bottomRoadLeft - left - snapOffset + 3;
                    break;
                case 'upper-right':
                    xDelta = topRoadRight - right - snapOffset + 1;
                    break;
                case 'lower-right':
                    xDelta = bottomRoadRight - right - snapOffset + 2;
                    break;
            }

            if (xDelta !== 0) {
                shape.position.x += xDelta;
            }
            if (yDelta !== 0) {
                shape.position.y += yDelta;
            }
            this._drawBoundingBox();
        },

        /**
        * Returns the Model with which the parameter passed is Grouped with
        *
        * @method _getNameOfComparedModel
        * @param nameOfComparedModel Name of Shape whose parent is to be returned
        * @return {Object} Backbone Model which is to be compared
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
        *
        * @method _addInGroup
        * @param draggedModel{Object} Backbone Model which is Dragged
        * @param comparedModel{Object} Backbone Model which is to be compared
        * @param nameOfRemovedShape{String} Shape which is to be removed from Segments Group
        * @param nameOfDraggedShape{String} Shape of the Dragged Model which is to be compared
        * @param removeSnapIndiceFlag{Boolean} Flag for removing snap indices of dragged model
        * @param removeSnapIndiceFlagForCompared{Boolean} Flag for removing snap indices of compared model
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
            if (comparedShapeGroupLength !== self.collection.length) {
                comparedShapeGroup.remove();
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

                $.extend(draggedModelSegmentGroup, comparedModelSegmentGroup);

                for (var k in tempJSONCompared) {
                    if (tempJSONDragged[k] === undefined) {
                        tempJSONDragged[k] = tempJSONCompared[k];
                    }
                    else {
                        tempJSONDragged[k] = tempJSONCompared[k].concat(tempJSONDragged[k]);
                    }
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
        *
        * @method _getDifference
        * @param point1{Object} Paper object of First Point
        * @param point2{Object} Paper object of Second Point
        * @return {Object}  Paper object of new Point
        * @private
        */
        _getDifference: function (point1, point2) {
            return new this.paperScope.Point(point1.x - point2.x, point1.y - point2.y);
        },

        /**
        * Places symbols on end points
        *
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
                    var anglesForAccessibility = model.get('angles');

                    endPointsGroup = new this.paperScope.Group();
                    var length = segments.length;

                    for (var i = 0; i < length; i++) {
                        /*
                        var symbolInstance = endPointSymbol.place(segments[i].point);
                        */
                        var symbolInstance = endPointSymbol.clone();
                        symbolInstance.position = segments[i].point;
                        this._nameSymbol(symbolInstance, segments[i].point, anglesForAccessibility[i]);

                        endPointsGroup.addChild(symbolInstance);
                    }
                    shapeGroup.addChild(endPointsGroup);
                }
            }
            this._updateSymbols();
        },

        /**
        * Creates an instance of the symbol/path to be placed on the endpoints of the shape
        *
        * @method _createEndPointSymbol
        * @private
        */
        _createEndPointSymbol: function () {
            var path = new this.paperScope.Path.Circle(new this.paperScope.Point(0, 0), 1);

            path.opacity = 0;

            return path;
            /*
            var symbol = new this.paperScope.Symbol(path);

            path.remove();

            return symbol;
            */
        },

        /**
        * Names the symbols placed on the endpoints of shapes based on the respective path type
        *
        * @method _nameSymbol
        * @param symbol {Object} Paper Object reference of the symbol/path placed on the endpoint
        * @param position {Object} Reference to the position of the symbol to be placed
        * @private
        */
        _nameSymbol: function (symbol, position, angleForAccessibility) {
            var pathDisplayed = this.repairRoadsView.model.get('pathDisplayed'),
                parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;
            if (pathDisplayed === parentModelNamespace.ROADTYPES.RECTANGLESHAPED) {
                this._nameRectangleSymbol(symbol, position, angleForAccessibility);
            }
            else {
                this._nameZigzagSymbol(symbol, position, angleForAccessibility);
            }
        },

        /**
        * Names the symbols placed on the endpoints of shapes of the rectangle path
        *
        * @method _nameRectangleSymbol
        * @param symbol {Object} Paper Object reference of the symbol/path placed on the endpoint
        * @param position {Object} Reference to the position of the symbol to be placed
        * @private
        */
        _nameRectangleSymbol: function (symbol, position, anglesForAccessibility) {
            var parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                outerRectWidth = parentModelNamespace.OUTERROADWIDTH,
                outerRectHeight = parentModelNamespace.OUTERROADHEIGHT,
                innerRectWidth = parentModelNamespace.INNERROADWIDTH,
                innerRectHeight = parentModelNamespace.INNERROADHEIGHT,
                roadHeight = (outerRectHeight - innerRectHeight) / 2,
                roadWidth = (outerRectWidth - innerRectWidth) / 2,
                outerRectLeft = parentModelNamespace.RECTROAD_OFFSET.LEFT,
                outerRectTop = parentModelNamespace.RECTROAD_OFFSET.TOP,
                outerRectRight = outerRectLeft + outerRectWidth,
                outerRectBottom = outerRectTop + outerRectHeight,
                innerRectLeft = outerRectLeft + roadWidth,
                innerRectTop = outerRectTop + roadHeight,
                innerRectRight = innerRectLeft + innerRectWidth,
                innerRectBottom = innerRectTop + innerRectHeight;

            symbol.data = 'rectangle-endpoint-symbol';
            symbol.angle = anglesForAccessibility;
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

        /**
        * Names the symbols placed on the endpoints of shapes of the zigzag path
        *
        * @method _nameZigzagSymbol
        * @param symbol {Object} Paper Object reference of the symbol/path placed on the endpoint
        * @param position {Object} Reference to the position of the symbol to be placed
        * @private
        */
        _nameZigzagSymbol: function (symbol, position, anglesForAccessibility) {
            var nameSpace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                xOffset = nameSpace.ZROAD_OFFSET.LEFT,
                yOffset = nameSpace.ZROAD_OFFSET.TOP,
                snapOffset = nameSpace.ZROAD_OFFSET.SNAP,
                roadWidth = nameSpace.ZROADWIDTH,
                totalWidth = nameSpace.ZROADTOTALWIDTH,
                totalHeight = nameSpace.ZROADTOTALHEIGHT,
                bottomPathWidth = nameSpace.ZROAD_BOTTOM_PATH_WIDTH,
                topPathWidth = nameSpace.ZROAD_TOP_PATH_WIDTH,
                bottomRoadTop = yOffset + totalHeight - roadWidth,
                bottomRoadBottom = yOffset + totalHeight,
                bottomRoadLeft = xOffset,
                bottomRoadRight = xOffset + bottomPathWidth,
                topRoadTop = yOffset,
                topRoadBottom = yOffset + roadWidth,
                topRoadLeft = xOffset + totalWidth - topPathWidth,
                topRoadRight = xOffset + totalWidth,
                verticalRoadLeft = topRoadLeft,
                verticalRoadRight = bottomRoadRight;

            symbol.data = 'zigzag-endpoint-symbol';
            symbol.angle = anglesForAccessibility;
            // Start of corner naming
            if (position.x === bottomRoadLeft && position.y === bottomRoadTop) {
                symbol.name = 'lower-left-point+lower-top-point+corner';
            }
            else if (position.x === bottomRoadLeft && position.y === bottomRoadBottom) {
                symbol.name = 'lower-left-point+lower-bottom-point+corner';
            }
            else if (position.x === bottomRoadRight && position.y === bottomRoadBottom) {
                symbol.name = 'lower-bottom-point+middle-right-point+corner';
            }
            else if (position.x === verticalRoadLeft && position.y === bottomRoadTop) {
                symbol.name = 'lower-top-point+middle-left-point+corner';
            }
            else if (position.x === topRoadRight && position.y === topRoadTop) {
                symbol.name = 'upper-right-point+upper-top-point+corner';
            }
            else if (position.x === topRoadRight && position.y === topRoadBottom) {
                symbol.name = 'upper-right-point+upper-bottom-point+corner';
            }
            else if (position.x === topRoadLeft && position.y === topRoadTop) {
                symbol.name = 'upper-top-point+middle-left-point+corner';
            }
            else if (position.x === verticalRoadRight && position.y === topRoadBottom) {
                symbol.name = 'upper-bottom-point+middle-right-point+corner';
            }
                // End of corner naming
            else if (position.y === topRoadTop) {
                symbol.name = 'upper-top-point';
            }
            else if (position.y === topRoadBottom) {
                symbol.name = 'upper-bottom-point';
            }
            else if (position.y === bottomRoadTop) {
                symbol.name = 'lower-top-point';
            }
            else if (position.y === bottomRoadBottom) {
                symbol.name = 'lower-bottom-point';
            }
            else if (position.x === verticalRoadLeft) {
                symbol.name = 'middle-left-point';
            }
            else if (position.x === topRoadRight) {
                symbol.name = 'upper-right-point';
            }
            else if (position.x === bottomRoadLeft) {
                symbol.name = 'lower-left-point';
            }
            else if (position.x === verticalRoadRight) {
                symbol.name = 'middle-right-point';
            }
            else {
                symbol.name = 'endpoint-symbol';
            }
        },

        /**
        * Updates all symbols/paths placed on the enpoints of the selected shape
        *
        * @method _updateSymbols
        * @private
        */
        _updateSymbols: function () {
            var pathDisplayed = this.repairRoadsView.model.get('pathDisplayed'),
                parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                symbols = null,
                shape = this.model.get('paperGroupElem'),
                xPositionArray = [],
                yPositionArray = [];
            if (pathDisplayed === parentModelNamespace.ROADTYPES.RECTANGLESHAPED) {
                symbols = shape.getItems({
                    data: 'rectangle-endpoint-symbol'
                });
            }
            else {
                symbols = shape.getItems({
                    data: 'zigzag-endpoint-symbol'
                });
            }
            for (var i = 0, length = symbols.length; i < length; i++) {
                var position = symbols[i].position,
                    xPosition = Math.round(position.x),
                    yPosition = Math.round(position.y),
                    index = [];
                this._findIndex(xPositionArray, xPosition, index);
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
            this._updateBounds();
        },

        /**
        * Updates bounds of the shape. Removes any intermediate symbols lying on the same side of the shape
        *
        * @method _updateBounds
        * @private
        */
        _updateBounds: function () {
            var pathDisplayed = this.repairRoadsView.model.get('pathDisplayed'),
                parentModelNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                shape = this.model.get('paperGroupElem'),
                symbols = null;
            if (pathDisplayed === parentModelNamespace.ROADTYPES.RECTANGLESHAPED) {
                symbols = shape.getItems({
                    data: 'rectangle-endpoint-symbol'
                });
            }
            else {
                symbols = shape.getItems({
                    data: 'zigzag-endpoint-symbol'
                });
            }
            var totalSymbols = symbols.length,
                allSymbols = {};

            for (var i = 0; i < totalSymbols; i++) {
                var currentSymbolName = symbols[i].name,
                    symbolNames = [];
                if (currentSymbolName.indexOf('corner') > -1) {
                    currentSymbolName = currentSymbolName.replace('+corner', '');
                }
                symbolNames = currentSymbolName.split('+');
                var symbolNamesLength = symbolNames.length;
                for (var j = 0; j < symbolNamesLength; j++) {
                    var currentSymbol = symbolNames[j];
                    if (typeof allSymbols[currentSymbol] === 'undefined' || allSymbols[currentSymbol] === null) {
                        allSymbols[currentSymbol] = [];
                    }
                    _.compact(allSymbols[currentSymbol]);
                    allSymbols[currentSymbol].push(symbols[i]);
                    if (allSymbols[currentSymbol].length > 2) {
                        this._removeMiddleValue(allSymbols[currentSymbol]);
                    }
                }
            }
            this.allSymbols = allSymbols;
        },

        /**
        * Finds indexes of all instances of the search value in the given array
        *
        * @method _findIndex
        * @param array {Array} Array in which index is to be searched
        * @param search {Mixed} Value to be searched within the array
        * @param index {Array} An empty array in which the indexes will be pushed
        * @private
        */
        _findIndex: function (array, search, index) {
            var idx = array.indexOf(search);
            while (idx !== -1) {
                index.push(idx);
                idx = array.indexOf(search, idx + 1);
            }
        },

        /**
        * Removes the middle point from points lying on the same line
        *
        * @method _removeMiddleValue
        * @param array {Array} Array having references to paper objects lying on the same line
        * @private
        */
        _removeMiddleValue: function (array) {
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
            delete array[middleElemIndex];
            array.splice(middleElemIndex, 1);
        },

        /**
       * Fixes a rotation angle between 0 to 360
       *
       * @method _fixRotationAngle
       * @param angle{Integer} Angle to be fixed
       * @return angle{Integer} Fixed Angle
       * @private
       */
        _fixRotationAngle: function (angle) {
            if (angle > 0) {
                return angle % 360;
            }
            else {
                return (angle % 360) + 360;
            }
        },

        /**
        * Draw the angles at all points in this shape view.
        *
        * @method _drawAngles
        * @private
        */
        _drawAngles: function (isFirst) {
            var group = this.model.get("paperGroupElem"),
                groupChildren = group.children,
                allAngles = this.repairRoadsView.model.get('numberOfAngles');
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
                            font: 'Montserrat',
                        };

                        var fillColor = '#222222',
                            opacity = 1,
                            toBeRead = true,
                            typeOfAngle = null,
                            isCorner = null;

                        var data = this._getPointTextData(shapeGroup.name, i);
                        if (data) {
                            if (data.fillColor) {
                                fillColor = data.fillColor;
                            }
                            if (data.opacity) {
                                opacity = data.opacity;
                            }

                            if (data.toBeRead !== null && typeof data.toBeRead !== 'undefined') {
                                toBeRead = data.toBeRead;
                            }
                            text.data = data;

                            if (data.typeOfAngle) {
                                typeOfAngle = data.typeOfAngle;
                            }

                            if (data.isCorner !== null && typeof data.isCorner !== 'undefined') {
                                isCorner = data.isCorner;
                            }
                        }
                        // var fillColor = this._getFillColor(shapeGroup.name, i);// '#222222';
                        text.content = angle;
                        text.fillColor = fillColor;
                        text.position = point;
                        text.characterStyle = dimensionTextStyle;
                        text.opacity = opacity;

                        text.data.fillColor = fillColor;
                        text.data.opacity = opacity;
                        text.data.toBeRead = toBeRead;
                        text.toBeRead = toBeRead;
                        text.data.typeOfAngle = typeOfAngle;
                        text.typeOfAngle = typeOfAngle;
                        text.data.isCorner = isCorner;
                        text.isCorner = isCorner;

                        if (isFirst) {
                            var key = 'angle-at-x-' + Math.round(B.x) + '-y-' + Math.round(B.y);
                            if (allAngles[key]) {
                                allAngles[key]++;
                            }
                            else {
                                allAngles[key] = 1;
                            }
                            text.data.typeOfAngle = key;
                            text.typeOfAngle = key;

                            var isCorner = this._checkCornerAngle(B);
                            text.data.isCorner = isCorner;
                            text.isCorner = isCorner;
                        }

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
        * Updates angles to be read for accessibility
        *
        * @method _updateAngles
        * @private
        */
        _updateAngles: function () {
            var shape = this.model.get('paperGroupElem'),
                allAngles = this.repairRoadsView.model.get('numberOfAngles');

            for (var i in allAngles) {
                var angles = shape.getItems({
                    typeOfAngle: i
                });
                var totalAngles = angles.length;
                if (totalAngles >= allAngles[i]) {
                    for (var j = 0; j < totalAngles; j++) {
                        if (!angles[j].isCorner) {
                            angles[j].data.toBeRead = false;
                            angles[j].toBeRead = false;
                        }
                    }
                }
            }

            this.updateAnglesToBeRead();
        },

        /**
        * Updates angles to be read for accessibility in the repair roads model
        *
        * @method updateAnglesToBeRead
        * @private
        */
        updateAnglesToBeRead: function () {
            var shape = this.model.get('paperGroupElem'),
                angles = shape.getItems({
                    toBeRead: true
                }),
                anglesToBeRead = {},
                totalAngles = angles.length;

            for (var i = 0; i < totalAngles; i++) {
                var key = angles[i].typeOfAngle;
                if (anglesToBeRead[key]) {
                    anglesToBeRead[key].push(angles[i]._content);
                }
                else {
                    anglesToBeRead[key] = [angles[i]._content];
                }
            }

            this.repairRoadsView.model.set('anglesToBeRead', anglesToBeRead);
        },

        /**
       * Checks Corner Angles
       *
       * @method _checkCornerAngle
       * @param angle{Integer} Angle to be fixed
       * @return angle{Integer} Fixed Angle
       * @private
       */
        _checkCornerAngle: function (point) {
            var isCorner = false;
            if (this.repairRoadsView.model.get('pathDisplayed') === MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ROADTYPES.ZSHAPED) {
                var nameSpace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                xOffset = nameSpace.ZROAD_OFFSET.LEFT,
                yOffset = nameSpace.ZROAD_OFFSET.TOP,
                roadWidth = nameSpace.ZROADWIDTH,
                totalWidth = nameSpace.ZROADTOTALWIDTH,
                totalHeight = nameSpace.ZROADTOTALHEIGHT,
                bottomRoadTop = yOffset + totalHeight - roadWidth,
                bottomRoadBottom = yOffset + totalHeight,
                bottomRoadLeft = xOffset,
                topRoadTop = yOffset,
                topRoadBottom = yOffset + roadWidth,
                topRoadRight = xOffset + totalWidth;

                if ((point.x === bottomRoadLeft && point.y === bottomRoadTop) ||
                    (point.x === bottomRoadLeft && point.y === bottomRoadBottom) ||
                    (point.x === topRoadRight && point.y === topRoadTop) ||
                    (point.x === topRoadRight && point.y === topRoadBottom)) {
                    isCorner = true;
                }
            }
            return isCorner;
        },

        /**
        * Get the data for particular angle label if it is being removed previously
        *
        * @method data
        * @param name{String} Shape name of which angle color required
        * @param index{Number} Index of angle
        * @return {Object} Point text data of a Shape
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
        *
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

            if (angle < 31) {
                labelRadius = 45;
            }
            else if (angle < 41) {
                labelRadius = 40;
            }
            else if (angle < 55) {
                labelRadius = 30;
            }
            else if (angle < 70) {
                labelRadius = 25;
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
        *
        * @method _setAngleSelection
        * @private
        */
        _setAngleSelection: function () {
            this._setAngleLabelsColor('#ffffff');
        },

        /**
        * Reset the color to the angle labels when shape is deselected
        *
        * @method _resetAngleSelection
        * @private
        */
        _resetAngleSelection: function () {
            this._setAngleLabelsColor('#222222');
        },

        /**
        * Set the color to the all angle labels for all shapes in group
        *
        * @method _resetAngleSelection
        * @param color{String} Color string
        * @private
        */
        _setAngleLabelsColor: function (color) {
            var group = this.model.get("paperGroupElem"),
                groupChildren = group.children,
                currNamespace = MathInteractives.Interactivities.PicturePerfect.Views.Shape;

            for (var i in groupChildren) {
                var shapeGroup = groupChildren[i];

                if (shapeGroup.children.length > 1) {
                    var angleGroup = shapeGroup.children[currNamespace.GROUP_ELEMENT_INDEX.ANGLE_GROUP];
                    angleGroup.fillColor = color;

                }
            }
        },

        /**
        * Set the current label color
        *
        * @method setCurrentLabelsColor
        * @private
        */
        setCurrentLabelsColor: function () {
            var group = this.model.get("paperGroupElem"),
                groupChildren = group.children,
                length = groupChildren.length,
                currNamespace = MathInteractives.Interactivities.PicturePerfect.Views.Shape;

            for (var i = 0; i < length; i++) {
                var shapeGroup = groupChildren[i];

                if (shapeGroup.children.length > 1) {
                    var angleGroup = shapeGroup.children[currNamespace.GROUP_ELEMENT_INDEX.ANGLE_GROUP];

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
        *
        * @method _removeAngleGroup
        * @private
        */
        _removeAngleGroup: function () {
            var group = this.model.get("paperGroupElem"),
            groupChildren = group.children,
            length = groupChildren.length,
            currNamespace = MathInteractives.Interactivities.PicturePerfect.Views.Shape;

            for (var i = 0; i < length; i++) {
                var shapeGroup = groupChildren[i];

                if (shapeGroup.children.length > 2) {
                    var angleGroup = shapeGroup.children[currNamespace.GROUP_ELEMENT_INDEX.ANGLE_GROUP];
                    this.removedAngleGroup[shapeGroup.name] = angleGroup;
                    angleGroup.remove();
                }
            }
        },

        /**
        * Add pulse effect to the angle text which are snapped together
        *
        * @method _addPulseEffect
        * @private
        */
        _addPulseEffect: function () {
            var group = this.model.get("paperGroupElem"),
                groupChildren = group.children,
                length = groupChildren.length,
                currNamespace = MathInteractives.Interactivities.PicturePerfect.Views.Shape;

            for (var i = 0; i < length; i++) {
                var shapeGroup = groupChildren[i];

                if (shapeGroup.children.length > 1) {
                    // Get the Angle Group.
                    var angleGroup = shapeGroup.children[currNamespace.GROUP_ELEMENT_INDEX.ANGLE_GROUP];

                    if (angleGroup) {
                        var textObj = angleGroup.children;
                        for (var j = 0; j < textObj.length; j++) {
                            if ((textObj[j].data.isSupplementary || textObj[j].data.isComplementary) && textObj[j].opacity === 1) {
                                textObj[j].data.increase = true;
                                textObj[j].data.frame = 1;

                                var self = this;

                                textObj[j].onFrame = function () {
                                    var frame = this.data.frame;

                                    if (frame % 5 === 0) {
                                        var scaling = this.fontSize,
                                            increase = this.data.increase;

                                        if (increase && scaling < 16) {
                                            scaling++;
                                        }
                                        else if (!increase && scaling > 11) {
                                            scaling--;
                                        }
                                        this.fontSize = scaling;

                                        if (scaling === 15) {
                                            this.data.increase = false;
                                        }

                                        if (!increase && scaling === 12) {
                                            this.fontSize = 12;
                                            this.detach('frame');
                                            //self.repairRoadsView.trigger(MathInteractives.Interactivities.PicturePerfect.Views.RepairRoadTab.EVENTS.PULSE_ANIMATION_COMPLETE);
                                            return;
                                        }

                                        self.paperScope.view.draw();
                                    }
                                    frame++;
                                    this.data.frame = frame;
                                }

                            }
                        }
                    }
                }
            }
        },

    },
{
    /**
    * The types of Angles
    *
    * @property ANGLES_TYPE
    * @static
    */
    ANGLES_TYPE: {
        COMPLEMENTARY: 0,
        SUPPLEMENTARY: 1,
        BOTH: 2
    },
    /**
    * Index of shapes,symbol group and angle group in the paperGroupElement
    *
    * @property GROUP_ELEMENT_INDEX
    * @static
    */
    GROUP_ELEMENT_INDEX: {
        SHAPE: 0,
        SYMBOL_GROUP: 1,
        ANGLE_GROUP: 2
    }
});

})();