( function () {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*
	* @class ButtonClicks
	* @namespace MathInteractives.Common.Interactivities.ShapeDecomposition.Views
    * @extends MathInteractives.Common.Interactivities.ShapeDecomposition.Views.PaperEventFunctions
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeDecomposition.Views.ButtonClicks = MathInteractives.Common.Interactivities.ShapeDecomposition.Views.PaperEventFunctions.extend( {
        /**
        * Initialises PaperEventFunctions Class
        *
        * @method initialize
        **/
        initialize: function () {
            this._superwrapper( 'initialize', [] );
            //this.initializeDefaultProperties();
        },

        /**
        * Performs actions of left panel on done click.
        *
        * @method onDoneButtonClick
        * @private
        */
        onDoneButtonClick: function onDoneButtonClick() {
            this.stopReading();
            this.activateWorkCanvasScope();
            var actionEnum = this.modelNamespace.ACTION_ENUM,
                eventsEnum = this.modelNamespace.EVENTS;
            if ( this.model.get( 'type' ) === 2 ) { this.selectedShapeEvent.target.fillColor = this.getDefaultShapeColor( 'normal' ); this.selectedShapeEvent.target.isSelected = false }
            this.shapeGroup.visible = false;
            this.screenGroup.visible = true;
            this.drawShape( this.selectedShapeEvent );
            this.unbindPaperEvents( this.paperTool );
            this.unbindPaperEvents( this.shapeGroup );
            this.handleGroup.bringToFront();
            this.bindSelectedShapeEvent();
            this.currentEvent = null;
            this.selectedShapeEvent = null;
            this.unitLabelGroup.visible = true;
            this.unitLabelGroup.bringToFront();
            //this.$( '.left-panel-buttons-container' ).show();
            this.model.trigger( eventsEnum.CHANGE_DIRECTION_TEXT, 1 );
            this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.NEXT, false );
            this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.DONE, true );
            //this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.TRY_ANOTHER, false );
            if ( this.model.get( 'type' ) === 1 ) this._initAccessibilityForSelectShape();
            if ( this.model.get( 'type' ) === 2 ) this.unBindAccessibilityListeners();
            this.bindAccessibilityListenersForShapeResize();

//            this.player.enableHelpElement( 'work-canvas', 0, false );
            this.player.changeHelpElementText( 'left-panel-canvas-acc-container', 0, this.getMessage( 'canvas-help-texts', 1 ), this.getAccMessage( 'canvas-help-texts', 1 ) );
//            this.player.enableHelpElement( 'work-canvas', 1, true );
            this.setFocus( 'explore-instruction-bar-1-direction-text-text' );
            this.changeAccMessage( 'explore-tab-activity-holder', 1 );
            this.changeAccMessage( 'left-panel-canvas-acc-container', 5, [this.handleGroup.children.length] );
            this.workCanvasScope.view.draw();
        },

        /**
        * Performs actions of left panel on next click.
        *
        * @method onNextButtonClick
        * @public
        */
        onNextButtonClick: function onNextButtonClick() {
            this.stopReading();
            this.activateWorkCanvasScope();
            var myEvent = {},
                actionEnum = this.modelNamespace.ACTION_ENUM,
                eventsEnum = this.modelNamespace.EVENTS;
            if ( this.selectedShape.shapeUniqueCode === 7 ) {
                this.selectedShape.isOddShape = true;
                this.selectedShape.children[0].isOddShape = true;
                this.selectedShape.children[1].isOddShape = true;
            }
            else {
                this.selectedShape.isOddShape = false;
            }
            this.$( '.left-panel-buttons-container' ).show();
            this.addPropertiesToShape( this.selectedShape, true );
            this.selectedShape.shapeUniqueCode = this.uniqueNumber;
            this.uniqueNumber++;
            this.screenGroup.visible = false;
            this.unbindPaperEvents( this.paperTool );
            this.unbindPaperEvents( this.handleGroup );
            this.handleGroup.remove();
            this.handleGroup = null;
            myEvent.target = this.selectedShape;
            myEvent.target.isSelected = false;
            this.onMouseDownOnNewShapes( myEvent, 'callFromButtonClick', this.selectedShape );
            this.currentEvent = myEvent;
            this.canvasShapes.push( this.selectedShape );
            this.bindEventsToNewShape( this.canvasShapes );
            this.addAccNumber();
            this.paperTool.on( 'mouseup', $.proxy( this.deSelectNewShape, this ) );
            var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );
            if ( tempBool ) this.addLatticePointsOfSidesOfPolygon();
            this.model.trigger( eventsEnum.CHANGE_DIRECTION_TEXT, 2 );
            //this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.TRY_ANOTHER, false );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.COPY, false );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.REFLECT, false );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.ROTATE, false );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.UNDO, true );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.CHECK, true );
            this.model.trigger( eventsEnum.TABLE_DATA_EVENT, actionEnum.NEXT, { paperItem: this.selectedShape } );
            this.unBindAccessibilityListeners();
            this.changeAccMessage( 'explore-tab-activity-holder', 2 );
            var text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapeText' ),
                text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'isText' );
            this.changeAccMessage( 'left-panel-canvas-acc-container', 9, [text1, text2] );
            this.setFocus( 'explore-instruction-bar-2-direction-text-text' );

//            this.player.enableHelpElement( 'work-canvas', 1, false );
            this.player.enableHelpElement( 'actual-shape-table-wrapper', 3, true );
            this.player.changeHelpElementText( 'left-panel-canvas-acc-container', 0, this.getMessage( 'canvas-help-texts', 2 ), this.getAccMessage( 'canvas-help-texts', 2 ) );
//            this.player.enableHelpElement( 'work-canvas', 4, true );
            this.bindAccessibilityListenersForShapeMovement();
        },

        /**
        * Removes all points which are outside of polygon.
        * @method _removeOuterPolygonPoints
        * @public
        */
        addLatticePointsOfSidesOfPolygon: function addLatticePointsOfSidesOfPolygon() {
            var vertexArray = [],
                boundaryPointsArray = [];
            //Stores vertex index and boundary points of all shapes.
            for ( var i = 0; i < this.canvasShapes.length; i++ ) {
                var //vertexObject = {},
                    boundaryObject = {},
                    currentVertexArray = [],
                    currentVertexArray2 = [],
                    currentBoundaryPointsArray,
                    currentBoundaryPointsArray2;

                if ( this.canvasShapes[i].isOddShape ) {
                    var clonedShape = this.canvasShapes[i].clone();
                    for ( var j = 0; j < clonedShape.children.length; j++ ) {
                        for ( var k = 0; k < clonedShape.children[j].segments.length; k++ ) {
                            if ( j === 0 ) {
                                currentVertexArray.push( this.model.getIndexOfPoint( clonedShape.children[j].segments[k].point ) );
                            }
                            else {
                                currentVertexArray2.push( this.model.getIndexOfPoint( clonedShape.children[j].segments[k].point ) );
                            }
                        }
                    }
                    currentBoundaryPointsArray = this.getBoundaryPoints( currentVertexArray, clonedShape.children[0].segments );
                    currentBoundaryPointsArray2 = this.getBoundaryPoints( currentVertexArray2, clonedShape.children[1].segments );
                    boundaryObject.shapeUniqueCode = this.canvasShapes[i].shapeUniqueCode;

                    boundaryObject.boundaryPointArray = currentBoundaryPointsArray;
                    boundaryObject.boundaryPointArray2 = currentBoundaryPointsArray2;
                    clonedShape.remove();
                }
                else {
                    var clonedShape = this.canvasShapes[i].clone();
                    for ( var j = 0; j < clonedShape.segments.length; j++ ) {
                        currentVertexArray.push( this.model.getIndexOfPoint( clonedShape.segments[j].point ) );
                    }
                    currentBoundaryPointsArray = this.getBoundaryPoints( currentVertexArray, clonedShape.segments );
                    boundaryObject.shapeUniqueCode = this.canvasShapes[i].shapeUniqueCode;
                    boundaryObject.boundaryPointArray = currentBoundaryPointsArray;
                    clonedShape.remove();
                }
                boundaryPointsArray.push( $.extend( true, {}, boundaryObject ) );
                //vertexObject.shapeUniqueCode = this.canvasShapes[i].shapeUniqueCode;
                //vertexObject.vertexArray = $.extend( true, [], currentVertexArray );
                //vertexArray.push( $.extend( true, {}, vertexObject ) );
            }
            //var modelVertexArray = this.model.get( 'polygonVertexUndoStack' );
            //modelVertexArray.push( vertexArray );
            var modelSideArray = this.model.get( 'polygonBoundaryPointsUndoStack' );
            modelSideArray.push( boundaryPointsArray );
        },

        /**
        * returns Boundary points of shape
        * @method getBoundaryPoints
        * @public
        */
        getBoundaryPoints: function getBoundaryPoints( currentVertexArray, polygonVertex ) {
            var result = false,
                currentBoundaryPointsArray = [];
            for ( var j = 0; j < this.gridPoints.length; j++ ) {
                //Checks whether current point is coordinate or not.
                result = currentVertexArray.indexOf( j );
                if ( result !== -1 ) {
                    currentBoundaryPointsArray.push( this.gridPoints[j] );
                }

                //Checks whether current point is on sides of polygon.
                if ( result === -1 ) {
                    var result1;
                    result1 = this.modelNamespace.checkForOnLinePoint( this.gridPoints[j].x, this.gridPoints[j].y, polygonVertex );
                    if ( result1.bool === true ) {
                        currentBoundaryPointsArray.push( this.gridPoints[j] );
                    }
                }
            }
            currentBoundaryPointsArray = this.sortSidePoints( polygonVertex, currentBoundaryPointsArray );
            currentBoundaryPointsArray.pop();
            return currentBoundaryPointsArray;
        },

        /**
        * Sorts all points which are on sides of polygon from start to end order.
        * @method sortSidePoints
        * @public
        */
        sortSidePoints: function sortSidePoints( polygonVertex, currentBoundaryPointsArray ) {
            var x1, y1,
                x2, y2,
                x3, y3,
                slope1,
                slope2,
                diffX,
                diffY,
                boolX = false,
                boolY = false,
                spliceIndex = null,
                currentLength,
                isPointInBetween = false,
                tempPoints = [],
                tempPointOfSide = [],
                currentDiffX,
                currentDiffY,
                prevDiffX = null,
                prevDiffY = null;

            for ( var i = 0; i < polygonVertex.length; i++ ) {
                x1 = polygonVertex[i].point.x;
                y1 = polygonVertex[i].point.y;
                if ( ( i + 1 ) === polygonVertex.length ) {
                    x3 = polygonVertex[0].point.x;
                    y3 = polygonVertex[0].point.y;
                }
                else {
                    x3 = polygonVertex[i + 1].point.x;
                    y3 = polygonVertex[i + 1].point.y;
                }
                tempPoints.push( polygonVertex[i].point );
                currentLength = tempPoints.length;

                prevDiffX = null;
                prevDiffY = null;
                spliceIndex = null;
                for ( var j = 0; j < currentBoundaryPointsArray.length; j++ ) {
                    x2 = currentBoundaryPointsArray[j].x;
                    y2 = currentBoundaryPointsArray[j].y;
                    diffX = x2 - x1;
                    diffY = y2 - y1;
                    slope1 = diffY / diffX;
                    slope2 = ( y3 - y2 ) / ( x3 - x2 );

                    if ( slope1 === slope2 ) {
                        isPointInBetween = this.modelNamespace.checkForInBetween( x1, x2, x3, y1, y2, y3 );
                        if ( isPointInBetween ) {
                            if ( tempPoints.length > currentLength ) {
                                for ( var k = currentLength; k < tempPoints.length; k++ ) {
                                    currentDiffX = tempPoints[k].x - x1;
                                    currentDiffY = tempPoints[k].y - y1;
                                    if ( diffX > 0 ) {
                                        if ( prevDiffX !== null ) {
                                            if ( currentDiffX > prevDiffX ) boolX = true;
                                        }
                                        else if ( currentDiffX > diffX ) {
                                            boolX = true;
                                        }
                                    }
                                    else if ( diffX === 0 ) {
                                        if ( prevDiffX !== null ) {
                                            if ( currentDiffX === prevDiffX ) boolX = true;
                                        }
                                        else if ( currentDiffX === 0 ) {
                                            boolX = true;
                                        }
                                    }
                                    else {
                                        if ( prevDiffX !== null ) {
                                            if ( currentDiffX < prevDiffX ) boolX = true;
                                        }
                                        else if ( currentDiffX < diffX ) {
                                            boolX = true;
                                        }
                                    }

                                    if ( diffY > 0 ) {
                                        if ( prevDiffY !== null ) {
                                            if ( currentDiffY > prevDiffY ) boolY = true;
                                        }
                                        else if ( currentDiffY > diffY ) {
                                            boolY = true;
                                        }
                                    }
                                    else if ( diffY === 0 ) {
                                        if ( prevDiffY !== null ) {
                                            if ( currentDiffY === prevDiffY ) boolY = true;
                                        }
                                        else if ( currentDiffY === 0 ) {
                                            boolY = true;
                                        }
                                    }
                                    else {
                                        if ( prevDiffY !== null ) {
                                            if ( currentDiffY < prevDiffY ) boolY = true;
                                        }
                                        else if ( currentDiffY < diffY ) {
                                            boolY = true;
                                        }
                                    }
                                    if ( boolX === true && boolY === true ) {
                                        prevDiffX = currentDiffX;
                                        prevDiffY = currentDiffY;
                                        spliceIndex = k;
                                    }
                                    boolX = false;
                                    boolY = false;
                                }
                            }
                            isPointInBetween = false;
                            if ( spliceIndex !== null ) {
                                tempPoints.splice( spliceIndex, 0, currentBoundaryPointsArray[j] );
                            }
                            else {
                                tempPoints.push( currentBoundaryPointsArray[j] );
                            }
                            //tempPointOfSide.push(currentBoundaryPointsArray[j]);
                        }
                    }
                }
            }

            currentBoundaryPointsArray = [];
            for ( var i = 0; i < tempPoints.length; i++ ) {
                currentBoundaryPointsArray.push( this.model.getIndexOfPoint( tempPoints[i] ) );
            }
            return currentBoundaryPointsArray;
        },

        /**
        * Passes the canvas shapes array to the right panel for validating areas through an event.
        *
        * @method onCheckButtonClick
        */
        onCheckButtonClick: function onCheckButtonClick() {
            this.stopReading();
            this.activateWorkCanvasScope();
            var modelNamespace = this.modelNamespace,
                actionEnum = modelNamespace.ACTION_ENUM,
                eventsEnum = modelNamespace.EVENTS;
            this.deSelectNewShape();
            this.removeCutLine();
            this.isRemoveLabelRequired = true;
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.CUT, false );
            this.model.trigger( eventsEnum.TABLE_DATA_EVENT, actionEnum.CHECK, {
                shapes: this.canvasShapes,
                paperScope: this.workCanvasScope
            } );
        },

        /**
        * Creates a copy of the selected shape.
        *
        * @method copyButtonClick
        * @public
        */
        copyButtonClick: function copyButtonClick() {
            var self = this;
            this.stopReading();
            this.activateWorkCanvasScope();
            this._removeAllShapeLabels( false );
            var origShape = this.selectedShape,
                copiedShape = this._createCopy( origShape ),
                actionEnum = this.modelNamespace.ACTION_ENUM,
                eventsEnum = this.modelNamespace.EVENTS,
                myEvent = {};
            var undoStackTemp = this.model.get( 'undoStack' );
            undoStackTemp.pop();
            this.model.set( 'undoStack', undoStackTemp );
            var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );

            this._placeCopy( copiedShape, origShape );
            this.canvasShapes.push( copiedShape );

            this.bindEventsToNewShape( [copiedShape] );

            this.deSelectShape();
            myEvent.target = copiedShape;
            this.onMouseDownOnNewShapes( myEvent, 'callFromCopyClick', copiedShape );
            this.currentEvent = myEvent;
            var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );
            if ( tempBool ) this.addLatticePointsOfSidesOfPolygon();
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.UNDO, false );
            this.addAccNumber();
            this.model.trigger( eventsEnum.TABLE_DATA_EVENT, actionEnum.COPY, { paperItem: copiedShape } );
            this.removeCutLine();
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT, false );
            this.workCanvasScope.view.draw();
            this.bindAccessibilityListenersForShapeMovement();
            this.changeAccMessage( 'left-panel-canvas-acc-container', 17 );
            this.setFocus( 'left-panel-canvas-acc-container' );
            this.$el.one( 'focusout', '.left-panel-canvas-acc-container', function ( event ) { self.accContainerFocusOut( event ); } );
        },

        /**
        * Creates a clone of the shape passed, changes it's fill color so as to create a copy of shape.
        *
        * @method _createCopy
        * @param origShape {Object} Paper.js object of the shape to be copied.
        * @return {Object} Paper.js object of the copy created.
        * @private
        */
        _createCopy: function _createCopy( origShape ) {
            var copiedShape = origShape.clone();
            copiedShape.fillColor = this.getCopiedShapeColor( 'normal' );
            copiedShape.strokeColor = this.modelNamespace.SHAPE_STROKE_COLORS.COPY;
            this.addPropertiesToShape( copiedShape, false );
            copiedShape.shapeUniqueCode = origShape.shapeUniqueCode;
            if ( origShape.isOddShape ) {
                copiedShape.isOddShape = origShape.isOddShape;
                copiedShape.children[0].isOddShape = origShape.isOddShape;
                copiedShape.children[1].isOddShape = origShape.isOddShape;
            }
            else {
                copiedShape.isOddShape = origShape.isOddShape;
            }
            copiedShape.isSelected = false;
            return copiedShape;
        },

        /**
        * Places the copy of the copied shape next to it or over it if it overlaps.
        *
        * @method _placeCopy
        * @param copiedShape {Object} The paper.js oject of the original shape's clone that represents the copy.
        * @param origShape {Object} The paper.js object of the original shape.
        * @private
        */
        _placeCopy: function _placeCopy( copiedShape, origShape ) {
            var modelNamespace = this.modelNamespace,
                gridStepSize = modelNamespace.GAP_BETWEEN_POINTS,
                origBounds = origShape.bounds,
                shapeBottomRight = origBounds.bottomRight,
                isOverlapping;

            // check if original shape is at bottom right; place at top left
            if ( shapeBottomRight.x + gridStepSize > modelNamespace.BOUNDING_BOX_RIGHT &&
                shapeBottomRight.y + gridStepSize > modelNamespace.BOUNDING_BOX_BOTTOM ) {
                copiedShape.translate( -gridStepSize, -gridStepSize );
            }
            else {
                // if there's space in the right, place to the right
                if ( shapeBottomRight.x + gridStepSize <= modelNamespace.BOUNDING_BOX_RIGHT ) {
                    copiedShape.translate( gridStepSize, 0 );
                }
                // if there's space in the bottom, place to the bottom
                if ( shapeBottomRight.y + gridStepSize <= modelNamespace.BOUNDING_BOX_BOTTOM ) {
                    copiedShape.translate( 0, gridStepSize );
                }
            }
            copiedShape.defaultCenter = copiedShape.position;
        },

        /*
        * Checks if the passed shape overlaps with any shape in workAreaGroup.
        *
        * @method _checkIfIsOverlapping
        * @param shapeToCheck {Object} Paper.js object that needs to be checked.
        * @return {Boolean} True if it overlaps with any object, else false.
        * @private
        */
        _checkIfIsOverlapping: function _checkIfIsOverlapping( shapeToCheck ) {
            // works for compound path as well
            var intersection,
                shapesArray = this.canvasShapes,
                shape,
                index;
            for ( index in shapesArray ) {
                shape = shapesArray[index];
                intersection = shapeToCheck.intersect( shape );
                if ( intersection.area > 0 ) {
                    return true;
                }
            }
            return false;
        },

        /**
        * Performs actions of left panel on undo click.
        *
        * @method undoButtonClick
        * @public
        */
        undoButtonClick: function undoButtonClick( event ) {
            var self = this;
            this.stopReading();
            this.activateWorkCanvasScope();
            this._removeAllShapeLabels( true );
            if ( this.cutLineHandleGroup ) {
                this.removeCutLine();
                this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT, false );
                this.workCanvasScope.view.draw();
                this.changeAccMessage( 'left-panel-canvas-acc-container', 15 );
                this.setFocus( 'left-panel-canvas-acc-container' );
                return;
            }
            var undoStack = this.model.get( 'undoStack' ),
                newElements,
                modelNamespace = this.modelNamespace,
                eventsEnum = modelNamespace.EVENTS,
                actionEnum = modelNamespace.ACTION_ENUM,
                //polygonVertexUndoStack = this.model.get( 'polygonVertexUndoStack' ),
                undoneStep,
                polygonBoundaryPointsUndoStack = this.model.get( 'polygonBoundaryPointsUndoStack' );

            polygonBoundaryPointsUndoStack.pop();
            // polygonVertexUndoStack.pop();
            undoneStep = undoStack.pop();
            this.deSelectNewShape();
            if ( undoStack.length === 1 ) this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.UNDO, true );
            newElements = undoStack[undoStack.length - 1];
            this.removeCurrentElements();
            this._removeAllShapeLabels( true );
            this.addNewElementsOnCanvas( newElements );
            this.bindEventsToNewShape( this.canvasShapes );
            this.addAccNumber();
            this.model.trigger( eventsEnum.TABLE_DATA_EVENT, actionEnum.UNDO, {
                newShapes: this.canvasShapes,
                undoneStep: undoneStep
            } );
            this.removeCutLine();
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT, false );
            this.workCanvasScope.view.draw();
            this.bindAccessibilityListenersForShapeMovement();
            this.changeAccMessage( 'left-panel-canvas-acc-container', 16 );
            this.setFocus( 'left-panel-canvas-acc-container' );
            this.$el.one( 'focusout', '.left-panel-canvas-acc-container', function ( event ) { self.accContainerFocusOut( event ); } );
        },

        /**
        * Removes current element of canvas
        *
        * @method removeCurrentElements
        * @public
        */
        removeCurrentElements: function removeCurrentElements() {
            for ( var i = 0; i < this.canvasShapes.length; i++ ) {
                this.unbindPaperEvents( this.canvasShapes[i] );
                this.canvasShapes[i].remove();
            }
            this.canvasShapes = [];
        },

        /**
        * adds new elements on canvas
        *
        * @method addNewElementsOnCanvas
        * @public
        */
        addNewElementsOnCanvas: function addNewElementsOnCanvas( newElements ) {
            var path,
                color, strokeColor,
                shapeStrokeColors = this.modelNamespace.SHAPE_STROKE_COLORS,
                defaultStrokeColor = shapeStrokeColors.NORMAL,
                copyStrokeColor = shapeStrokeColors.COPY,
                shapePoints,
                myEvent = {};

            for ( var i = 0; i < newElements.length; i++ ) {
                shapePoints = newElements[i].shapePoints;
                if ( newElements[i].isOriginal ) {
                    color = this.getDefaultShapeColor( 'normal' );
                    strokeColor = defaultStrokeColor;
                }
                else {
                    color = this.getCopiedShapeColor( 'normal' );
                    strokeColor = copyStrokeColor;
                }
                if ( newElements[i].isOddShape ) {
                    var path1 = new this.workCanvasScope.Path(),
                        path2 = new this.workCanvasScope.Path();

                    for ( var j = 0; j < shapePoints[0].length; j++ ) {
                        path1.add( this.gridPoints[shapePoints[0][j]] );
                    }
                    for ( var j = 0; j < shapePoints[1].length; j++ ) {
                        path2.add( this.gridPoints[shapePoints[1][j]] );
                    }
                    path = this._createCompoundPath( path1, path2, color, strokeColor, 2 );
                    path.isOddShape = true;
                    path.children[0].isOddShape = true;
                    path.children[1].isOddShape = true;
                }
                else {
                    path = new this.workCanvasScope.Path();
                    for ( var j = 0; j < shapePoints.length; j++ ) {
                        path.add( this.gridPoints[shapePoints[j]] );
                    }
                    path.strokeColor = strokeColor;
                    path.strokeWidth = 2;
                    path.fillColor = color;
                    path.isOddShape = false;
                }
                this.addPropertiesToShape( path, newElements[i].isOriginal );
                path.shapeUniqueCode = newElements[i].shapeUniqueCode;
                var isSelected = newElements[i].isSelected;
                if ( isSelected ) {
                    myEvent.target = path;
                    myEvent.target.isSelected = false;
                    this.onMouseDownOnNewShapes( myEvent, 'callFromUndoClick', path );
                    this.currentEvent = myEvent;
                }
                else {
                    path.isSelected = false;
                }
                this.canvasShapes.push( path );
            }
        },

        /**
        * Performs actions of left panel on rotate click.
        *
        * @method rotateButtonClick
        * @public
        */
        rotateButtonClick: function rotateButtonClick( event ) {
            var self = this;
            this.stopReading();
            this.activateWorkCanvasScope();
            this._removeAllShapeLabels( false );
            var modelNamespace = this.modelNamespace,
                eventsEnum = modelNamespace.EVENTS,
                actionEnum = modelNamespace.ACTION_ENUM;
            var undoStackTemp = this.model.get( 'undoStack' );
            undoStackTemp.pop();
            this.model.set( 'undoStack', undoStackTemp );
            var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );

            this.selectedShape.rotate( 90 );
            if ( this.selectedShape.currentRotationCount === 3 ) {
                this.selectedShape.currentRotationCount = 0;
                this.selectedShape.position = this.selectedShape.defaultCenter;
            }
            else {
                this.selectedShape.currentRotationCount++;
            }
            this.checkBoundsOfShape();
            this.changePosition();
            var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );
            if ( tempBool ) this.addLatticePointsOfSidesOfPolygon();
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.UNDO, false );
            this.model.trigger( eventsEnum.TABLE_DATA_EVENT, actionEnum.ROTATE, { paperItem: this.selectedShape } );
            this.removeCutLine();
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT, false );
            this.workCanvasScope.view.draw();
            this.changeAccMessage( 'left-panel-canvas-acc-container', 19 );
            this.setFocus( 'left-panel-canvas-acc-container' );
            this.$el.one( 'focusout', '.left-panel-canvas-acc-container', function ( event ) { self.accContainerFocusOut( event ); } );
        },

        /**
        * Checks whther shape is outside or not of boundry
        *
        * @method checkBoundsOfShape
        * @public
        */
        checkBoundsOfShape: function checkBoundsOfShape() {
            var clone = this.selectedShape.clone(),
                topLeft = clone.bounds.getTopLeft(),
                bottomRight = clone.bounds.getBottomRight(),
                diffX = 0, diffY = 0;

            if ( topLeft.x < this.modelNamespace.BOUNDING_BOX_LEFT ) {
                diffX = this.modelNamespace.BOUNDING_BOX_LEFT - topLeft.x;
            }
            else if ( bottomRight.x > this.modelNamespace.BOUNDING_BOX_RIGHT ) {
                diffX = this.modelNamespace.BOUNDING_BOX_RIGHT - bottomRight.x;
            }

            if ( topLeft.y < this.modelNamespace.BOUNDING_BOX_TOP ) {
                diffY = this.modelNamespace.BOUNDING_BOX_TOP - topLeft.y;
            }
            else if ( bottomRight.y > this.modelNamespace.BOUNDING_BOX_BOTTOM ) {
                diffY = this.modelNamespace.BOUNDING_BOX_BOTTOM - bottomRight.y;
            }
            clone.remove();
            this.selectedShape.position.x += diffX;
            this.selectedShape.position.y += diffY;
        },

        /**
        * Performs changes position after rotating
        *
        * @method changePosition
        * @public
        */
        changePosition: function changePosition() {
            var diffX = 0, diffY = 0, newPoint, object, start = 1;
            if ( this.selectedShape ) {
                if ( this.selectedShape.isOddShape ) {
                    newPoint = this.gridPoints[( this.modelNamespace.getNearestPoint( this.selectedShape.children[0].segments[0].point, this.gridPoints ) ).index];
                    diffX = newPoint.x - Math.round( this.selectedShape.children[0].segments[0].point.x );
                    diffY = newPoint.y - Math.round( this.selectedShape.children[0].segments[0].point.y );
                    this.selectedShape.children[0].segments[0].point = newPoint;
                    for ( var i = 0; i < this.selectedShape.children.length; i++ ) {
                        if ( i === 1 ) start = 0;
                        for ( var j = start; j < this.selectedShape.children[i].segments.length; j++ ) {
                            this.selectedShape.children[i].segments[j].point.x += diffX;
                            this.selectedShape.children[i].segments[j].point.y += diffY;
                            object = this.modelNamespace.getNearestPoint( this.selectedShape.children[i].segments[j].point, this.gridPoints );
                            this.selectedShape.children[i].segments[j].point = this.gridPoints[object.index];
                        }
                    }
                }
                else {
                    newPoint = this.gridPoints[( this.modelNamespace.getNearestPoint( this.selectedShape.segments[0].point, this.gridPoints ) ).index]
                    diffX = newPoint.x - Math.round( this.selectedShape.segments[0].point.x );
                    diffY = newPoint.y - Math.round( this.selectedShape.segments[0].point.y );
                    this.selectedShape.segments[0].point = newPoint;
                    for ( var i = 1; i < this.selectedShape.segments.length; i++ ) {
                        this.selectedShape.segments[i].point.x += diffX;
                        this.selectedShape.segments[i].point.y += diffY;
                        object = this.modelNamespace.getNearestPoint( this.selectedShape.segments[i].point, this.gridPoints );
                        this.selectedShape.segments[i].point = this.gridPoints[object.index];
                    }
                }
                var modelNamespace = this.modelNamespace,
                    eventsEnum = modelNamespace.EVENTS,
                    actionEnum = modelNamespace.ACTION_ENUM;
                this.model.trigger( eventsEnum.TABLE_DATA_EVENT, actionEnum.TRANSLATE );
                this.workCanvasScope.view.draw();
            }
        },

        /**
        * Performs actions of left panel on reflect click.
        *
        * @method reflectButtonClick
        * @public
        */
        reflectButtonClick: function reflectButtonClick( event ) {
            var self = this;
            this.stopReading();
            this.activateWorkCanvasScope();
            this._removeAllShapeLabels( false );
            var modelNamespace = this.modelNamespace,
                eventsEnum = modelNamespace.EVENTS,
                actionEnum = modelNamespace.ACTION_ENUM;
            var undoStackTemp = this.model.get( 'undoStack' );
            undoStackTemp.pop();
            this.model.set( 'undoStack', undoStackTemp );
            var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );

            this.selectedShape.currentRotationCount = 0;
            this.selectedShape.defaultCenter = this.selectedShape.position;
            this.selectedShape.scale( -1, 1 );
            this.changePosition();
            var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );
            if ( tempBool ) this.addLatticePointsOfSidesOfPolygon();
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.UNDO, false );
            this.model.trigger( eventsEnum.TABLE_DATA_EVENT, actionEnum.REFLECT, { paperItem: this.selectedShape } );
            this.removeCutLine();
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT, false );
            this.workCanvasScope.view.draw();
            this.changeAccMessage( 'left-panel-canvas-acc-container', 18 );
            this.setFocus( 'left-panel-canvas-acc-container' );
            this.$el.one( 'focusout', '.left-panel-canvas-acc-container', function ( event ) { self.accContainerFocusOut( event ); } );
        },

        /**
        * Performs actions of left panel on cut click.
        *
        * @method cutButtonClick
        * @public
        */
        cutButtonClick: function cutButtonClick( event ) {
            this.stopReading();
            this.activateWorkCanvasScope();
            var radius = 11, // required radius 12 (10px radius + 2px border)
                circle,         // but paper draws one border pixel inside and one outside
                callFrom = 'normal',
                callFor = 'cutHandle',
                point1 = this.gridPoints[257],
                point2 = this.gridPoints[267],
                eventsEnum = this.modelNamespace.EVENTS,
                actionEnum = this.modelNamespace.ACTION_ENUM;

            //this.$( this.$( '.cut-line-button' )[0] ).css( { 'left': '267px', 'top': '193px' } );
            this._removeAllShapeLabels( false );
            this.cutLineHandleGroup = new this.workCanvasScope.Group();
            this.dottedCutLine = new this.workCanvasScope.Path.Line( point1, point2 );
            this.dottedCutLine.strokeColor = '#224c5c';
            this.dottedCutLine.strokeWidth = 3;
            this.dottedCutLine.dashArray = [2, 2];

            circle = new this.workCanvasScope.Path.Circle( point1, radius );
            circle.style = this.getCircleStyle( point1, callFrom, callFor );
            circle.handleCode = 'a';
            this.cutLineHandleGroup.addChild( circle );

            circle = new this.workCanvasScope.Path.Circle( point2, radius );
            circle.style = this.getCircleStyle( point2, callFrom, callFor );
            circle.handleCode = 'b';
            this.cutLineHandleGroup.addChild( circle );

            this.dummyRectangleOfCutButton = new this.workCanvasScope.Path.RegularPolygon( point1, 4, 28 );
            this.dummyRectangleOfCutButton.fillColor = 'white';
            this.dummyRectangleOfCutButton.opacity = 0.01;


            this.repositionButton();
            this.cutLineHandleGroup.bringToFront();
            this.bindCutLineHandleEvent();
            this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.CUT_LINE, false );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.CUT, true );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.UNDO, false );
            this.checkForIntersection();
            this.bindAccessibilityListenersForCutLine();
            var text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapeText' ),
                   text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'isText' );
            if ( this.canvasShapes.length > 1 ) {
                text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapesText' ),
                text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'areText' );
            }
            this.changeAccMessage( 'left-panel-canvas-acc-container', 12, [text1, text2] );
            this.setFocus( 'left-panel-canvas-acc-container' );
            this.enableTab( 'cut-line-button', false );
            this.workCanvasScope.view.draw();
        },

        addAccNumber: function addAccNumber() {
            var duplicateIndex = [];
            for ( var i = 0; i < this.canvasShapes.length; i++ ) {
                ( this.canvasShapes[i].isOriginal ) ? this.canvasShapes[i].accNumber = ( i + 1 ) : duplicateIndex.push( i );
            }
            for ( var i = 0; i < duplicateIndex.length; i++ ) {
                var currentObject = this.canvasShapes[duplicateIndex[i]];
                if ( !currentObject.isOriginal ) {
                    currentObject.accNumber = this.findAccOfOriginal( currentObject.shapeUniqueCode );
                }
            }
        },

        findAccOfOriginal: function findAccOfOriginal( currentCode ) {
            for ( var i = 0; i < this.canvasShapes.length; i++ ) {
                if ( this.canvasShapes[i].isOriginal ) {
                    if ( this.canvasShapes[i].shapeUniqueCode === currentCode ) {
                        return this.canvasShapes[i].accNumber;
                    }
                }
            }
        },

        isCutLineButtonClicked: false,
        /**
        * Performs actions of left panel on cut line button click
        *
        * @method cutLineButtonClick
        * @public
        */
        cutLineButtonClick: function cutLineButtonClick() {
            var self = this;
            this.stopReading();
            this.activateWorkCanvasScope();
            var shapeCoordinatesArray = [],
                shapeCoordinatesArrayForOddShape = [],
                newShapesArray = [], removedShapesCodes = [],
                currentShapeObject,
                overlapBool = this.checkForOverlappingOfshapes();
            var undoStackTemp = this.model.get( 'undoStack' ),
                self = this;
            this.isCutLineButtonClicked = true;
            undoStackTemp.pop();
            this.model.set( 'undoStack', undoStackTemp );
            this.model.addEntryToUndoStack( this.canvasShapes );
            var tempBool = false;
            if ( this.selectedShape ) {
                for ( var i = 0; i < this.validCutPointsObjects.length; i++ ) {
                    if ( this.validCutPointsObjects[i][0].shapeUniqueCode === this.selectedShape.shapeUniqueCode ) {
                        tempBool = true;
                        break;
                    }
                }
            }
            if ( tempBool ) this.deSelectNewShape( 'cutLine' );
            if ( !overlapBool ) {
                this._removeAllShapeLabels( false );
                for ( var i = 0; i < this.validCutPointsObjects.length; i++ ) {
                    var currentShapeObject = this.validCutPointsObjects[i],
                        ans;
                    if ( !currentShapeObject[0].isOddShape ) {
                        ans = this.divideNormalShape( currentShapeObject );
                        newShapesArray = newShapesArray.concat( this._createNewCutShapes( ans, [] ) );
                    }
                    else {
                        ans = this.divideOddShape( currentShapeObject );
                        newShapesArray = newShapesArray.concat( this._createNewCutShapes( ans[0], ans[1] ) );
                    }
                    removedShapesCodes.push( currentShapeObject[0].shapeUniqueCode );
                    this.removeSpecifiedElement( currentShapeObject[0].shapeUniqueCode );
                }

                this.addNewCutShapes( newShapesArray );
                this.addAccNumber();

                this.model.trigger( this.modelNamespace.EVENTS.TABLE_DATA_EVENT, this.modelNamespace.ACTION_ENUM.CUT, {
                    removedShapesCodes: removedShapesCodes,
                    newShapes: newShapesArray,
                    allShapes: self.canvasShapes
                } );
                this.removeCutLine();
                this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT, false );
                this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.UNDO, false );
                this.workCanvasScope.view.draw();
                this.bindAccessibilityListenersForShapeMovement();
                this.changeAccMessage( 'left-panel-canvas-acc-container', 24 );
                this.setFocus( 'left-panel-canvas-acc-container' );
                this.$el.one( 'focusout', '.left-panel-canvas-acc-container', function ( event ) { self.accContainerFocusOut( event ); } );
            }
            else {
                var text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapeText' ),
                        text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'isText' );
                if ( this.canvasShapes.length > 1 ) {
                    text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapesText' ),
                    text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'areText' );
                }
                this.changeAccMessage( 'left-panel-canvas-acc-container', 12, [text1, text2] );
                this._generateOverlapPopup();
            }
        },

        /**
        * Checks whether cut line passes thrught overlapping parts if shapes.
        *
        * @method checkForOverlappingOfshapes
        * @public
        */
        checkForOverlappingOfshapes: function checkForOverlappingOfshapes() {
            if ( this.validCutShapeIndex.length <= 1 ) return false;

            var shapeClone1, shapeClone2, shape3, intersectionPoints = [], shape3Area, shape1Area, shape2Area;
            for ( var i = 0; i < this.validCutShapeIndex.length - 1; i++ ) {
                shapeClone1 = this.canvasShapes[this.validCutShapeIndex[i]].clone();
                if ( this.canvasShapes[this.validCutShapeIndex[i]].isOddShape ) {
                    shapeClone1 = this.roundUpPositionValueOfSegment( shapeClone1, true );
                    shapeClone1 = this.getCloneOfShape( shapeClone1, true );
                    //shapeClone1.children[0].segments.pop();
                    //shapeClone1.children[1].segments.pop();
                    this.changeCommonSegment( shapeClone1.children[0].segments );
                    this.changeCommonSegment( shapeClone1.children[1].segments );
                }
                else {
                    shapeClone1 = this.roundUpPositionValueOfSegment( shapeClone1, false );
                    shapeClone1 = this.getCloneOfShape( shapeClone1, false );
                    //shapeClone1.segments.pop();
                    this.changeCommonSegment( shapeClone1.segments );
                }
                shapeClone1.closed = true;
                for ( var j = i + 1; j < this.validCutShapeIndex.length; j++ ) {
                    intersectionPoints = [];
                    shapeClone2 = this.canvasShapes[this.validCutShapeIndex[j]].clone();
                    if ( this.canvasShapes[this.validCutShapeIndex[j]].isOddShape ) {
                        shapeClone2 = this.roundUpPositionValueOfSegment( shapeClone2, true );
                        shapeClone2 = this.getCloneOfShape( shapeClone2, true );
                        this.changeCommonSegment( shapeClone2.children[0].segments );
                        this.changeCommonSegment( shapeClone2.children[1].segments );
                    }
                    else {
                        shapeClone2 = this.roundUpPositionValueOfSegment( shapeClone2, false );
                        shapeClone2 = this.getCloneOfShape( shapeClone2, false );
                        this.changeCommonSegment( shapeClone2.segments );
                    }
                    shapeClone2.closed = true;
                    shape3 = shapeClone1.intersect( shapeClone2 );

                    if ( shape3.area !== 0 ) {
                        intersectionPoints = shape3.getIntersections( this.dottedCutLine );
                    }
                    if ( intersectionPoints.length > 1 ) {
                        intersectionPoints.sort( this.modelNamespace.sortHorizontalIntersections );
                        for ( var m = 0; m < intersectionPoints.length - 1; m++ ) {
                            var pt = new this.workCanvasScope.Point(( intersectionPoints[m].point.x + intersectionPoints[m + 1].point.x ) / 2, ( intersectionPoints[m].point.y + intersectionPoints[m + 1].point.y ) / 2 ),
                                vertexCheckBool = false;
                            if ( this.canvasShapes[this.validCutShapeIndex[i]].isOddShape ) {
                                var isBreak = false;
                                for ( var n = 0; n < shapeClone1.children.length; n++ ) {
                                    if ( !this.checkForVertex( pt, shapeClone1.children[n].segments ) ) {
                                        vertexCheckBool = false;
                                        var obj = this.modelNamespace.checkForOnLinePoint( pt.x, pt.y, shapeClone1.children[n].segments );
                                        if ( obj.bool ) {
                                            shapeClone1.remove();
                                            shapeClone2.remove();
                                            shape3.remove();
                                            isBreak = true;
                                            break;
                                        }
                                    }
                                    else {
                                        vertexCheckBool = true;
                                    }
                                }
                                if ( isBreak ) {
                                    continue;
                                }
                            }
                            else {
                                if ( !this.checkForVertex( pt, shapeClone1.segments ) ) {
                                    var obj = this.modelNamespace.checkForOnLinePoint( pt.x, pt.y, shapeClone1.segments );
                                    if ( obj.bool ) {
                                        shapeClone1.remove();
                                        shapeClone2.remove();
                                        shape3.remove();
                                        continue;
                                    }
                                }
                                else {
                                    vertexCheckBool = true;
                                }
                            }

                            if ( this.canvasShapes[this.validCutShapeIndex[j]].isOddShape ) {
                                var isBreak = false;
                                for ( var n = 0; n < shapeClone2.children.length; n++ ) {
                                    vertexCheckBool = false;
                                    if ( !this.checkForVertex( pt, shapeClone2.children[n].segments ) ) {
                                        var obj = this.modelNamespace.checkForOnLinePoint( pt.x, pt.y, shapeClone2.children[n].segments );
                                        if ( obj.bool ) {
                                            shapeClone1.remove();
                                            shapeClone2.remove();
                                            shape3.remove();
                                            isBreak = true;
                                            break;
                                        }
                                    }
                                    else {
                                        vertexCheckBool = true;
                                    }
                                }
                                if ( isBreak ) {
                                    continue;
                                }
                            }
                            else {
                                if ( !vertexCheckBool ) {
                                    if ( !this.checkForVertex( pt, shapeClone2.segments ) ) {
                                        var obj = this.modelNamespace.checkForOnLinePoint( pt.x, pt.y, shapeClone2.segments );
                                        if ( obj.bool ) {
                                            shapeClone1.remove();
                                            shapeClone2.remove();
                                            shape3.remove();
                                            continue;
                                        }
                                    }
                                    else {
                                        vertexCheckBool = true;
                                    }
                                }
                            }

                            if ( !vertexCheckBool ) {
                                if ( this.modelNamespace.isPointInsideShape( shape3, pt, true ) ) {
                                    //shape3Area = Math.abs( shape3.area );
                                    //shape1Area = Math.abs( shapeClone1.area );
                                    //shape2Area = Math.abs( shapeClone2.area );
                                    var doNotCheck = false;
                                    if ( ( shapeClone1.position.x === shapeClone2.position.x && shapeClone1.position.y === shapeClone2.position.y ) && ( Math.abs( shapeClone1.area ) === Math.abs( shapeClone2.area ) ) ) {
                                        doNotCheck = true;
                                    }
                                    if ( !doNotCheck ) {
                                        var newBool = this.verifyOverlap( shapeClone1, shapeClone2 );
                                        shapeClone1.remove();
                                        shapeClone2.remove();
                                        shape3.remove();
                                        if ( !newBool ) {
                                            continue;
                                        }
                                    }
                                    //if ( ( shape3Area > shape1Area || shape3Area > shape2Area ) &&
                                    //    ( shape3Area !== ( shape1Area + shape2Area ) ) ) {  // congruent shape overlap, gives double area
                                    //    continue;
                                    //}
                                    return true;
                                }
                            }
                        }
                    }
                    else {
                        var handle1 = this.cutLineHandleGroup.children[0],
                            handle2 = this.cutLineHandleGroup.children[1];
                        if ( intersectionPoints.length === 1 ) {
                            if ( !( intersectionPoints[0].point.x === handle1.position.x && intersectionPoints[0].point.y === handle1.position.y ) && !( intersectionPoints[0].point.x === handle2.position.x && intersectionPoints[0].point.y === handle2.position.y ) ) {
                                if ( shape3.children ) {
                                    if ( shape3.children.length === 0 ) {
                                        shape3.remove();
                                        shapeClone2.remove();
                                        continue;
                                    }
                                }
                                if ( this.modelNamespace.isPointInsideShape( shape3, handle1.position, true ) || this.modelNamespace.isPointInsideShape( shape3, handle2.position, true ) ) {
                                    //shape3Area = Math.abs( shape3.area );
                                    //shape1Area = Math.abs( shapeClone1.area );
                                    //shape2Area = Math.abs( shapeClone2.area );
                                    var doNotCheck = false;
                                    if ( ( shapeClone1.position.x === shapeClone2.position.x && shapeClone1.position.y === shapeClone2.position.y ) && ( Math.abs( shapeClone1.area ) === Math.abs( shapeClone2.area ) ) ) {
                                        doNotCheck = true;
                                    }
                                    if ( !doNotCheck ) {
                                        var newBool = this.verifyOverlap( shapeClone1, shapeClone2 );
                                        shapeClone1.remove();
                                        shapeClone2.remove();
                                        shape3.remove();
                                        if ( !newBool ) {
                                            continue;
                                        }
                                    }
                                    //if ( ( shape3Area > shape1Area || shape3Area > shape2Area ) &&
                                    //    ( shape3Area !== ( shape1Area + shape2Area ) ) ) {  // congruent shape overlap, gives double area
                                    //    continue;
                                    //}
                                    return true;
                                }
                            }
                        }
                    }
                    shape3.remove();
                    shapeClone2.remove();
                }
                shapeClone1.remove();
            }
            return false;
        },


        getCloneOfShape: function getCloneOfShape( shapeObj, isOddShape ) {
            if ( !isOddShape ) {
                var newPoints = this.getVertexOfShapes( $.extend( [], true, shapeObj.segments ) );
                var path1 = new this.workCanvasScope.Path();
                for ( var i = 0; i < newPoints.length; i++ ) {
                    path1.add( newPoints[i] );
                }
                shapeObj.remove();
                return path1;
            }
            else {
                var newPoints1 = this.getVertexOfShapes( $.extend( [], true, shapeObj.children[0].segments ) ),
                    path1 = new this.workCanvasScope.Path(),
                    path2 = new this.workCanvasScope.Path();
                for ( var i = 0; i < newPoints1.length; i++ ) {
                    path1.add( newPoints1[i] );
                }
                var newPoints2 = this.getVertexOfShapes( $.extend( [], true, shapeObj.children[1].segments ) ),
                    path2 = new this.workCanvasScope.Path();
                for ( var i = 0; i < newPoints2.length; i++ ) {
                    path2.add( newPoints2[i] );
                }
                path1.closed = true;
                path2.closed = true;
                var compoundPath = new this.workCanvasScope.CompoundPath( {
                    children: [path1, path2]
                } );
                shapeObj.remove();
                return compoundPath;
            }
        },

        getVertexOfShapes: function getVertexOfShapes( segments ) {
            if ( segments[0].point.x === segments[segments.length - 1].point.x && segments[0].point.y === segments[segments.length - 1].point.y ) {
                segments.pop();
            }

            var segArray = [], i = 0, segLen = segments.length, j, isBreak = false;
            segArray.push( segments[0].point );
            while ( i < segments.length - 2 ) {
                for ( j = ( i + 1 ) ; j < segments.length - 1; j++ ) {
                    var x1 = segments[i].point.x,
                        y1 = segments[i].point.y,
                        x2 = segments[j].point.x,
                        y2 = segments[j].point.y,
                        x3 = segments[j + 1].point.x,
                        y3 = segments[j + 1].point.y,
                        slope1 = ( y2 - y1 ) / ( x2 - x1 ),
                        slope2 = ( y3 - y2 ) / ( x3 - x2 );

                    if ( slope1 !== slope2 ) {
                        //var bool = this.modelNamespace.checkForInBetween( x1, x2, x3, y1, y2, y3 );
                        //if ( !bool ) {
                        i = j;
                        segArray.push( segments[i].point );
                        isBreak = true;
                        break;
                        // }
                    }
                }
                if ( !isBreak ) {
                    i++;
                }
                else {
                    isBreak = false;
                }
            }

            i = segLen - 2;
            j = i + 1;
            var x1 = segments[i].point.x,
                y1 = segments[i].point.y,
                x2 = segments[j].point.x,
                y2 = segments[j].point.y,
                x3 = segments[0].point.x,
                y3 = segments[0].point.y,
                slope1 = ( y2 - y1 ) / ( x2 - x1 ),
                slope2 = ( y3 - y2 ) / ( x3 - x2 );
            if ( slope1 !== slope2 ) {
                //var bool = this.modelNamespace.checkForInBetween( x1, x2, x3, y1, y2, y3 );
                //if ( !bool ) {
                i = j;
                segArray.push( segments[i].point );
                //   }
            }
            var x1 = segments[i].point.x,
                y1 = segments[i].point.y,
                x2 = segments[0].point.x,
                y2 = segments[0].point.y,
                x3 = segments[1].point.x,
                y3 = segments[1].point.y,
                slope1 = ( y2 - y1 ) / ( x2 - x1 ),
                slope2 = ( y3 - y2 ) / ( x3 - x2 );
            if ( slope1 === slope2 ) {
                //var bool = this.modelNamespace.checkForInBetween( x1, x2, x3, y1, y2, y3 );
                //if ( bool ) {
                segArray.splice( 0, 1 );
                //}
            }

            return segArray;
        },

        verifyOverlap: function verifyOverlap( shape1, shape2 ) {
            var bool = false;
            if ( this.checkIsInside( shape1.position, shape2 ) ) return true;
            if ( this.checkIsInside( shape2.position, shape1 ) ) return true;
            if ( this.checkVertexPresentInOtherShape( shape1, shape2 ) ) return true;
            if ( this.checkVertexPresentInOtherShape( shape2, shape1 ) ) return true;
            if ( shape1.children ) {
                if ( this.checkOverlapUsingIntersectPoint( shape2, shape1 ) ) return true;
            }
            else {
                if ( shape1.area < shape2.area ) {
                    if ( this.checkOverlapUsingIntersectPoint( shape1, shape2 ) ) return true;
                }
                else {
                    if ( this.checkOverlapUsingIntersectPoint( shape2, shape1 ) ) return true;
                }
            }
            return false;
        },

        checkVertexPresentInOtherShape: function checkVertexPresentInOtherShape( shape1, shape2 ) {
            if ( shape1.children ) {
                for ( var i = 0; i < shape1.children.length; i++ ) {
                    for ( var j = 0; j < shape1.children[i].segments.length; j++ ) {
                        var pt = shape1.children[i].segments[j].point;
                        if ( this.checkIsInside( pt, shape2 ) ) {
                            return true;
                        }
                    }
                }
            }
            else {
                for ( var j = 0; j < shape1.segments.length; j++ ) {
                    var pt = shape1.segments[j].point;
                    if ( this.checkIsInside( pt, shape2 ) ) {
                        return true;
                    }
                }
            }
            return false;
        },

        checkIsInside: function checkIsInside( pt, shape ) {
            if ( !this.modelNamespace.isPointOnPath( pt, shape ) ) {
                if ( this.modelNamespace.isPointInsideShape( shape, pt, true ) ) {
                    return true;
                }
            }
            return false;
        },

        checkOverlapUsingIntersectPoint: function checkOverlapUsingIntersectPoint( shape1, shape2 ) {
            for ( var i = 0; i < shape1.segments.length - 1; i++ ) {
                var line = this.workCanvasScope.Path.Line( shape1.segments[i].point, shape1.segments[i + 1].point ),
                    intersectPt = line.getIntersections( shape2 );
                if ( intersectPt.length > 1 ) {
                    for ( var j = 0; j < intersectPt.length - 1; j++ ) {
                        var pt1 = intersectPt[j].point,
                            pt2 = intersectPt[j + 1].point,
                            centerPt = new this.workCanvasScope.Point(( pt1.x + pt2.x ) / 2, ( pt1.y + pt2.y ) / 2 );
                        if ( this.checkIsInside( centerPt, shape2 ) ) {
                            line.remove();
                            return true;
                        }
                    }
                }
                else if ( intersectPt.length === 1 ) {
                    var centerPt = new this.workCanvasScope.Point(( shape1.segments[i].point.x + shape1.segments[i + 1].point.x ) / 2, ( shape1.segments[i].point.y + shape1.segments[i + 1].point.y ) / 2 );
                    if ( this.checkIsInside( centerPt, shape2 ) ) {
                        line.remove();
                        return true;
                    }
                }
                line.remove();
            }
            return false;
        },

        roundUpPositionValueOfSegment: function roundUpPositionValueOfSegment( shapeObject, isOddShape ) {
            if ( isOddShape ) {
                for ( var i = 0; i < shapeObject.children.length; i++ ) {
                    for ( var j = 0; j < shapeObject.children[i].segments.length; j++ ) {
                        var pos = shapeObject.children[i].segments[j].point;
                        shapeObject.children[i].segments[j].point.x = Math.round( pos.x );
                        shapeObject.children[i].segments[j].point.y = Math.round( pos.y );
                    }
                }
            }
            else {
                for ( var i = 0; i < shapeObject.segments.length; i++ ) {
                    var pos = shapeObject.segments[i].point;
                    shapeObject.segments[i].point.x = Math.round( pos.x );
                    shapeObject.segments[i].point.y = Math.round( pos.y );
                }
            }
            return shapeObject;
        },

        changeCommonSegment: function changeCommonSegment( seg ) {
            for ( var i = 0; i < seg.length; i++ ) {
                for ( var j = i + 1; j < seg.length; j++ ) {
                    if ( seg[i].point.x == seg[j].point.x && seg[i].point.y == seg[j].point.y ) {
                        seg[i].point.x += 0.1;
                        seg[i].point.y += 0.1;
                        break;
                    }
                }
            }
        },

        checkForVertex: function checkForVertex( pt, segmentArray ) {
            for ( var m = 0; m < segmentArray.length; m++ ) {
                if ( segmentArray[m].point.x === pt.x && segmentArray[m].point.y === pt.y ) {
                    return true;
                }
            }
            return false;
        },
        /**
        * Generates pop up for overlapping shapes
        * @method _generateOverlapPopup
        * @private
        **/
        _generateOverlapPopup: function _generateOverlapPopup() {
            this.stopReading();
            var titleText = this.getMessage( 'explore-texts', 3 ),
                accTitleText = this.getAccMessage( 'explore-texts', 3 ),
                text = this.getMessage( 'explore-texts', 4 ),
                options,
                accText = this.getAccMessage( 'explore-texts', 4 ),
                buttonArray = [],
                okBtnObj = {
                    id: 'ok-win-button',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    text: this.getMessage( 'explore-texts', 'ok-button-text' ),
                    baseClass: 'popupButtonBaseClass',
                    textColor: '#222222',
                    clickCallBack: {
                        fnc: this._onOkButtonClick,
                        scope: this
                    },
                    response: { isPositive: true, buttonClicked: 'ok-win-button' }
                };

            buttonArray.push( okBtnObj );

            options = {
                title: titleText,
                accTitle: titleText,
                text: text,
                accText: accText,
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                containsTts: true,
                buttons: buttonArray,
                width: 422,
                height: 269,
                bodyTextColorClass: 'popup-body-text-class',
                titleTextColorClass: 'popup-title-text-class'
            };
            this.popupView = MathInteractives.global.Theme2.PopUpBox.createPopup( options );
            this.popupView.$( '.theme2-pop-up-dialogue' ).css( 'background-color', 'rgba( 0, 0, 0, 0.85 )' );
        },

        _onOkButtonClick: function _onOkButtonClick() {
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT_LINE, true );
            this.setFocus( 'undo-button-container' );
        },

        /**
        * Divides Odd shape into parts.
        *
        * @method divideOddShape
        * @param shapeCoordinatesArray {Array},currentShapeObject {Array}
        * @private
        */
        divideOddShape: function divideOddShape( currentShapeObject ) {
            var boundaryPosArrayObject = this.model.getBoundaryPointOfShapeObject( currentShapeObject[0].shapeUniqueCode ),
                boundaryPosArray1 = boundaryPosArrayObject.boundaryPointArray,
                boundaryPosArray2 = boundaryPosArrayObject.boundaryPointArray2,
                shapeCoordinatesArray = [],
                shapeCoordinatesArrayForOddShape = [];
            if ( currentShapeObject[0].isRemovingOddShape ) {
                var start = boundaryPosArray1.indexOf( currentShapeObject[0].start ),
                    end = boundaryPosArray1.indexOf( currentShapeObject[0].end ),
                    currentPoints1 = [],
                    currentPoints2 = [],
                    currentPoints3 = [],
                    currentPoints4 = [],
                    isSame = false;

                if ( start > end ) {
                    var temp = start;
                    start = end;
                    end = temp;
                }
                for ( var i = start; i <= end; i++ ) {
                    currentPoints1.push( boundaryPosArray1[i] );
                }
                for ( var i = end; i < boundaryPosArray1.length; i++ ) {
                    currentPoints2.push( boundaryPosArray1[i] );
                }
                for ( var i = 0; i <= start; i++ ) {
                    currentPoints2.push( boundaryPosArray1[i] );
                }
                /*******************************************************************************************************/
                start = boundaryPosArray2.indexOf( currentShapeObject[1].start );
                if ( currentShapeObject[1].start === currentShapeObject[1].end ) {
                    //( start === 0 ) ? end = boundaryPosArray2.length - 1 : end = start - 1;
                    isSame = true;
                }
                else {
                    end = boundaryPosArray2.indexOf( currentShapeObject[1].end );
                }

                if ( !isSame ) {
                    if ( start > end ) {
                        var temp = start;
                        start = end;
                        end = temp;
                    }
                    for ( var i = start; i <= end; i++ ) {
                        currentPoints3.push( boundaryPosArray2[i] );
                    }
                    //if ( isSame ) currentPoints3.push( boundaryPosArray2[start] );

                    for ( var i = end; i < boundaryPosArray2.length; i++ ) {
                        currentPoints4.push( boundaryPosArray2[i] );
                    }
                    for ( var i = 0; i <= start; i++ ) {
                        currentPoints4.push( boundaryPosArray2[i] );
                    }
                }
                else {
                    for ( var i = start; i < boundaryPosArray2.length; i++ ) {
                        currentPoints3.push( boundaryPosArray2[i] );
                    }
                    for ( var i = 0; i <= start; i++ ) {
                        currentPoints3.push( boundaryPosArray2[i] );
                    }
                    currentPoints4.push( boundaryPosArray2[start] );
                }

                //var pt = $.extend( {}, true, this.gridPoints[currentPoints3[1]] );
                //pt.x -= 1;
                //pt.y -= 1;

                var x1 = this.cutLineHandleGroup.children[0].position.x,
                    y1 = this.cutLineHandleGroup.children[0].position.y,
                    x3 = this.cutLineHandleGroup.children[1].position.x,
                    y3 = this.cutLineHandleGroup.children[1].position.y,
                    x2,
                    y2;

                var subX = x1 - x3,
                    subY = y1 - y3,
                    newarr = this.modelNamespace.getOnlinePoint( x1, x2, x3, y1, y2, y3, subX, subY, this.gridPoints );

                if ( newarr.indexOf( currentPoints3[1] ) === -1 ) {
                    if ( this.checkForPointInsideCurrentShape( this.gridPoints[currentPoints3[1]], currentPoints1 ) ) {
                        currentPoints1 = currentPoints1.concat( currentPoints3 );
                        currentPoints2 = currentPoints2.concat( currentPoints4 );
                    }
                    else {
                        currentPoints1 = currentPoints1.concat( currentPoints4 );
                        currentPoints2 = currentPoints2.concat( currentPoints3 );
                    }
                }
                else if ( newarr.indexOf( currentPoints4[1] ) === -1 ) {
                    if ( this.checkForPointInsideCurrentShape( this.gridPoints[currentPoints4[1]], currentPoints1 ) ) {
                        currentPoints1 = currentPoints1.concat( currentPoints4 );
                        currentPoints2 = currentPoints2.concat( currentPoints3 );
                    }
                    else {
                        currentPoints1 = currentPoints1.concat( currentPoints3 );
                        currentPoints2 = currentPoints2.concat( currentPoints4 );
                    }
                }
                shapeCoordinatesArray.push( currentPoints1 );
                shapeCoordinatesArray.push( currentPoints2 );
            }
            else {
                var start = boundaryPosArray1.indexOf( currentShapeObject[0].start ),
                    end = boundaryPosArray1.indexOf( currentShapeObject[0].end ),
                    currentPoints1 = [],
                    currentPoints2 = [],
                    bool = false;

                if ( start > end ) {
                    var temp = start;
                    start = end;
                    end = temp;
                }
                for ( var i = start; i <= end; i++ ) {
                    currentPoints1.push( boundaryPosArray1[i] );
                }
                for ( var i = end; i < boundaryPosArray1.length; i++ ) {
                    currentPoints2.push( boundaryPosArray1[i] );
                }
                for ( var i = 0; i <= start; i++ ) {
                    currentPoints2.push( boundaryPosArray1[i] );
                }
                if ( this.checkForPointInsideCurrentShape( this.gridPoints[boundaryPosArray2[0]], currentPoints1 ) ) {
                    bool = true;
                }
                if ( bool ) {
                    shapeCoordinatesArray.push( currentPoints2 );
                    shapeCoordinatesArrayForOddShape.push( currentPoints1 );
                }
                else {
                    shapeCoordinatesArray.push( currentPoints1 );
                    shapeCoordinatesArrayForOddShape.push( currentPoints2 );
                }
                shapeCoordinatesArrayForOddShape.push( boundaryPosArray2 );
            }
            return [shapeCoordinatesArray, shapeCoordinatesArrayForOddShape];
        },

        /**
        * Divides normal shape into parts.
        *
        * @method divideNormalShape
        * @param shapeCoordinatesArray {Array},currentShapeObject {Array}
        * @private
        */
        divideNormalShape: function divideNormalShape( currentShapeObject ) {
            var shapeCoordinatesArray = [];
            for ( var j = 0; j < currentShapeObject.length; j++ ) {
                var cutObject = currentShapeObject[j],
                    currentPoints = [],
                    boundaryPosArray,
                    start,
                    end;

                if ( j === 0 ) {
                    boundaryPosArray = this.model.getBoundaryPointOfShape( cutObject.shapeUniqueCode );
                    start = boundaryPosArray.indexOf( cutObject.start );
                    end = boundaryPosArray.indexOf( cutObject.end );
                }
                else {
                    for ( var k = 0; k < shapeCoordinatesArray.length; k++ ) {
                        start = shapeCoordinatesArray[k].indexOf( cutObject.start );
                        end = shapeCoordinatesArray[k].indexOf( cutObject.end );
                        if ( start !== -1 && end !== -1 ) {
                            boundaryPosArray = shapeCoordinatesArray[k];
                            shapeCoordinatesArray.splice( k, 1 );
                            break;
                        }
                    }
                }
                if ( start > end ) {
                    var temp = start;
                    start = end;
                    end = temp;
                }
                for ( var k = start; k <= end; k++ ) {
                    currentPoints.push( boundaryPosArray[k] );
                }
                shapeCoordinatesArray.push( currentPoints );

                var currentPoints = [];
                for ( var k = end; k < boundaryPosArray.length; k++ ) {
                    currentPoints.push( boundaryPosArray[k] );
                }
                for ( var k = 0; k <= start; k++ ) {
                    currentPoints.push( boundaryPosArray[k] );
                }
                shapeCoordinatesArray.push( currentPoints );
            }
            return shapeCoordinatesArray;
        },

        /**
        * Creates new shapes on canvas after cut action.
        *
        * @method _createNewCutShapes
        * @param shapeCoordinatesArray {Array}
        * @private
        */
        _createNewCutShapes: function _createNewCutShapes( shapeCoordinatesArray, shapeCoordinatesArrayForOddShape ) {
            var shapeArray = [],
                fillColor = this.getDefaultShapeColor( 'normal' ),
                strokeColor = this.modelNamespace.SHAPE_STROKE_COLORS.NORMAL;

            for ( var i = 0; i < shapeCoordinatesArray.length; i++ ) {
                var path = new this.workCanvasScope.Path();
                for ( var j = 0; j < shapeCoordinatesArray[i].length; j++ ) {
                    path.add( this.gridPoints[shapeCoordinatesArray[i][j]] );
                }
                path.add( this.gridPoints[shapeCoordinatesArray[i][0]] );
                path.strokeColor = strokeColor;
                path.fillColor = fillColor;
                path.strokeWidth = 2;
                path.isOddShape = false;
                path.isSelected = false;
                this.addPropertiesToShape( path, true );
                path.shapeUniqueCode = this.uniqueNumber;
                this.uniqueNumber++;
                shapeArray.push( path );
            }

            if ( shapeCoordinatesArrayForOddShape.length > 0 ) {
                var path1 = new this.workCanvasScope.Path(),
                    path2 = new this.workCanvasScope.Path();
                for ( var j = 0; j < shapeCoordinatesArrayForOddShape[0].length; j++ ) {
                    path1.add( this.gridPoints[shapeCoordinatesArrayForOddShape[0][j]] );
                }
                path1.add( this.gridPoints[shapeCoordinatesArrayForOddShape[0][0]] );

                for ( var j = 0; j < shapeCoordinatesArrayForOddShape[1].length; j++ ) {
                    path2.add( this.gridPoints[shapeCoordinatesArrayForOddShape[1][j]] );
                }
                path2.add( this.gridPoints[shapeCoordinatesArrayForOddShape[1][0]] );

                var compoundPath = new this.workCanvasScope.CompoundPath( {
                    children: [path1, path2],
                    fillColor: fillColor,
                    strokeColor: strokeColor,
                    strokeWidth: 2
                } );
                compoundPath.isOddShape = true;
                compoundPath.children[0].isOddShape = true;
                compoundPath.children[1].isOddShape = true;
                compoundPath.isSelected = false;
                this.addPropertiesToShape( compoundPath, true );
                compoundPath.shapeUniqueCode = this.uniqueNumber;
                this.uniqueNumber++;
                shapeArray.push( compoundPath );
            }
            shapeArray = this.repositionShapesAfterCut( shapeArray );
            return shapeArray;
        },

        /**
        * Shifts cut shapes away.
        *
        * @method repositionShapesAfterCut
        * @param shapeArray {Array} Array of newly created shapes on cut.
        * @public
        */
        repositionShapesAfterCut: function repositionShapesAfterCut( shapeArray ) {
            var shape1, shape2, intersectionPoints = [], lineAngle, radiusVector,
                shapeIndex1, shapeIndex2, seperateShapesObject, value, isVertical, bool;
            radiusVector = this.dottedCutLine.segments[0].point.subtract( this.dottedCutLine.segments[1].point );
            lineAngle = radiusVector.angle + 180;
            value = this.modelNamespace.GAP_BETWEEN_POINTS * -1;
            seperateShapesObject = this.seperateShapes( shapeArray, lineAngle );
            isVertical = seperateShapesObject.isVertical;
            shapeIndex1 = seperateShapesObject.shapeIndex1;
            shapeIndex2 = seperateShapesObject.shapeIndex2;
            bool = this.moveShapes( shapeArray, shapeIndex1, value, isVertical );
            if ( !bool ) this.moveShapes( shapeArray, shapeIndex2, ( value * -1 ), isVertical );
            return shapeArray;
        },

        /**
        * differentiates shapes into 2 catagories..(left/right) or (top/bottom)
        * returns 2 array in object
        * @method seperateShapes
        * @param shapeArray {array} stores array of objects of all newly created shapes,
        * lineAngles {integer} represents angle of line.
        * @public
        */
        seperateShapes: function seperateShapes( shapeArray, lineAngle ) {
            var isVertical = false, shapeIndex1 = [], shapeIndex2 = [], obj = {}, centroid, centroid1, centroid2, intersectionPoints,
                currShape, segments, finalCheck = false;
            if ( ( lineAngle >= 315 && lineAngle <= 360 ) || ( lineAngle >= 0 && lineAngle <= 45 ) || ( lineAngle >= 135 && lineAngle <= 225 ) ) {
                isVertical = true;
            }

            for ( var i = 0; i < shapeArray.length; i++ ) {
                finalCheck = false;
                currShape = shapeArray[i];
                intersectionPoints = currShape.getIntersections( this.dottedCutLine );
                if ( intersectionPoints.length > 1 ) {
                    ( isVertical ) ? intersectionPoints.sort( this.modelNamespace.sortHorizontalIntersections ) : intersectionPoints.sort( this.modelNamespace.sortVerticalIntersections );

                    for ( var m = 0; m < intersectionPoints.length - 1; m++ ) {
                        centroid = new this.workCanvasScope.Point(( intersectionPoints[m].point.x + intersectionPoints[m + 1].point.x ) / 2, ( intersectionPoints[m].point.y + intersectionPoints[m + 1].point.y ) / 2 );
                        centroid1 = $.extend( {}, true, centroid );
                        centroid2 = $.extend( {}, true, centroid );
                        ( isVertical ) ? centroid1.y = centroid.y - 1 : centroid1.x = centroid.x - 1;
                        ( isVertical ) ? centroid2.y = centroid.y + 1 : centroid2.x = centroid.x + 1;
                        ( currShape.isOddShape ) ? segments = currShape.children[0].segments : segments = currShape.segments;
                        var bool1 = this.modelNamespace.isPointInsideShape( currShape, centroid1, true ),
                            bool2 = this.modelNamespace.isPointInsideShape( currShape, centroid2, true );
                        if ( ( bool1 && bool2 ) || ( !bool1 && !bool2 ) ) {
                            continue;
                        }
                        if ( bool1 ) {
                            finalCheck = true;
                            break;
                        }
                        else if ( bool2 ) {
                            finalCheck = false;
                            break;
                        }
                        else if ( this.modelNamespace.isPointOnPath( centroid1, currShape ) ) {
                            finalCheck = true;
                            break;
                        }
                        else if ( this.modelNamespace.isPointOnPath( centroid2, currShape ) ) {
                            finalCheck = false;
                            break;
                        }
                    }
                }
                else if ( intersectionPoints.length === 1 ) {
                    centroid = $.extend( {}, true, intersectionPoints[0].point );
                    ( isVertical ) ? centroid.y -= 1 : centroid.x -= 1;
                    ( currShape.isOddShape ) ? segments = currShape.children[0].segments : segments = currShape.segments;
                    var bool = currShape.contains( centroid );
                    if ( bool ) {
                        finalCheck = true;
                    }
                    else if ( this.modelNamespace.isPointOnPath( centroid, currShape ) ) {
                        finalCheck = true;
                    }
                    else {
                        //check at mid point between intersection point and the cut handle on shape
                        centroid = intersectionPoints[0].point;
                        centroid1 = this.cutLineHandleGroup.children[0].position; // cutline handle 1
                        centroid2 = this.cutLineHandleGroup.children[1].position; // cutline handle 2
                        if ( this.modelNamespace.isPointOnPath( centroid1, currShape ) &&
                            !( centroid1.x === centroid.x && centroid1.y === centroid.y ) ) {
                            centroid2 = centroid;
                        }
                        else {
                            centroid1 = centroid;
                        }
                        centroid = new this.workCanvasScope.Point(( centroid1.x + centroid2.x ) / 2, ( centroid1.y + centroid2.y ) / 2 );
                        ( isVertical ) ? centroid.y -= 1 : centroid.x -= 1;
                        if ( currShape.contains( centroid ) ) {
                            finalCheck = true;
                        }
                        else if ( this.modelNamespace.isPointOnPath( centroid, currShape ) ) {
                            finalCheck = true;
                        }
                    }
                }
                ( finalCheck ) ? shapeIndex1.push( i ) : shapeIndex2.push( i );
            }
            obj.isVertical = isVertical;
            obj.shapeIndex1 = shapeIndex1;
            obj.shapeIndex2 = shapeIndex2;
            return obj;
        },

        /**
        * Moves shapes to up or down.
        * returns true if all shapes moves. Else return false if any one shapes fails
        * @method moveShapes
        * @param shapeArray {array} stores array of objects of all newly created shapes,
        * indexArray {array} stores current movable shape index,value {integer} number of pixel to be move,
        * isVertical {bool} true if move vertical else false.
        * @public
        */
        moveShapes: function moveShapes( shapeArray, indexArray, value, isVertical ) {
            var lastPos, isBreak = false, prevSelectedShape = this.selectedShape;
            for ( var i = 0; i < indexArray.length; i++ ) {
                ( isVertical ) ? shapeArray[indexArray[i]].position.y += value : shapeArray[indexArray[i]].position.x += value;
                if ( !this.isShapeInsideBoundaryOfcanvas( shapeArray[indexArray[i]] ) ) {
                    lastPos = i;
                    isBreak = true;
                    break;
                }
            }
            if ( isBreak ) {
                value *= -1;
                for ( var i = 0; i <= lastPos; i++ ) {
                    ( isVertical ) ? shapeArray[indexArray[i]].position.y += value : shapeArray[indexArray[i]].position.x += value;
                }
            }
            for ( var i = 0; i < indexArray.length; i++ ) {
                this.selectedShape = shapeArray[indexArray[i]];
                this.changePosition();
                this.selectedShape = null;
            }
            this.selectedShape = prevSelectedShape;
            return !isBreak;
        },

        /**
        * Checks whether shape is inside or outside of boundary of canvas.
        * returns true if it is inside canvas. and returns false if not.
        * @method isShapeInsideBoundaryOfcanvas
        * @param shapeObject {object} stores object of currently changed position.
        * @public
        */
        isShapeInsideBoundaryOfcanvas: function isShapeInsideBoundaryOfcanvas( shapeObject ) {
            var shapeClone = shapeObject.clone(),
                bounds = shapeClone.bounds;
            if ( bounds.left >= this.modelNamespace.BOUNDING_BOX_LEFT && bounds.top >= this.modelNamespace.BOUNDING_BOX_TOP && bounds.right <= this.modelNamespace.BOUNDING_BOX_RIGHT && bounds.bottom <= this.modelNamespace.BOUNDING_BOX_BOTTOM ) {
                shapeClone.remove();
                return true;
            }
            shapeClone.remove();
            return false;
        },

        /**
        * Adds new cut shapes on canvas.
        *
        * @method addNewCutShapes
        * @param shapeArray {Array} Array of newly created shapes on cut.
        * @public
        */
        addNewCutShapes: function addNewCutShapes( shapeArray ) {
            this.bindEventsToNewShape( shapeArray );
            this.canvasShapes = this.canvasShapes.concat( shapeArray );
            var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );
            if ( tempBool ) this.addLatticePointsOfSidesOfPolygon();
            this.workCanvasScope.view.draw();
        },

        /**
        * Removes current element of canvas
        *
        * @method removeSpecifiedElement
        * @public
        */
        removeSpecifiedElement: function removeSpecifiedElement( shapeCode ) {
            var indexArray = this.fetchPaperObjectIndex( shapeCode );
            indexArray.sort( function ( a, b ) { return b - a } );

            for ( var i = 0; i < indexArray.length; i++ ) {
                var object = this.canvasShapes.splice( indexArray[i], 1 );
                this.unbindPaperEvents( object[0] );
                object[0].remove();
            }
        },

        /**
        * Removes Cut Lines
        *
        * @method removeCutLine
        * @public
        */
        removeCutLine: function removeCutLine() {
            this.activateWorkCanvasScope();
            if ( this.cutLineHandleGroup ) {
                this.bindAccessibilityListenersForShapeMovement();
                this.unbindPaperEvents( this.cutLineHandleGroup );
                this.cutLineHandleGroup.remove();
                this.cutLineHandleGroup = null;

                this.dottedCutLine.remove();
                this.dottedCutLine = null;

                this.dummyRectangleOfCutButton.remove();
                this.dummyRectangleOfCutButton = null;
                this.model.trigger( this.modelNamespace.EVENTS.HIDE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT_LINE, true );
                var undoStack = this.model.get( 'undoStack' );
                if ( undoStack.length === 1 ) this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.UNDO, true );
            }
        },

        /**
        * Adds/removes a purple stroke color to the shape whose code is passed.
        *
        * @method _onShapeBorderColorChangeRequired
        * @param shapeCode {String} The code of the shape to identify it.
        * @param isOriginal {Boolean} A boolean indicating if the shape is original or a copy.
        * @param showEditBorder {Boolean} A boolean indicating if the purple border is to be shown or removed.
        * @private
        */
        _onShapeBorderColorChangeRequired: function _onShapeBorderColorChangeRequired( shapeCode, isOriginal, showEditBorder ) {
            var shape = this.fetchShapePaperObject( shapeCode, isOriginal ),
                strokeColors = this.modelNamespace.SHAPE_STROKE_COLORS;
            if ( !shape ) {
                return;
            }
            if ( showEditBorder ) {
                shape.strokeColor = strokeColors.SELECTED;
                this.deSelectNewShape();
                shape.bringToFront();
            }
            else {
                shape.strokeColor = ( isOriginal ) ? strokeColors.NORMAL : strokeColors.COPY;
            }
            this.workCanvasScope.view.draw();
        },


        accContainerFocusOut: function accContainerFocusOut() {
            var text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapeText' ),
                text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'isText' );
            if ( this.canvasShapes.length > 1 ) {
                text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapesText' ),
                text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'areText' );
            }
            this.changeAccMessage( 'left-panel-canvas-acc-container', 9, [text1, text2] );
        }

    } );
} )();
