( function () {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*
	* @class PaperEventFunctions
	* @namespace MathInteractives.Common.Interactivities.ShapeDecomposition.Views
    * @extends MathInteractives.Common.Interactivities.ShapeDecomposition.Views.LeftPanel
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeDecomposition.Views.PaperEventFunctions = MathInteractives.Common.Interactivities.ShapeDecomposition.Views.LeftPanel.extend( {

        /**
        * Initialises PaperEventFunctions Class
        *
        * @method initialize
        **/
        initialize: function () {
            this._superwrapper( 'initialize', [] );
        },

        /**
        * binds the event to shapes.
        * @method _bindShapeEvent
        * @private
        */
        _bindShapeEvent: function () {
            var self = this;
            this.shapeGroup.on( {
                mousedown: function ( event ) {
                    self.stopReading();
                    if ( !self.player.getModalPresent() && ( ( $.support.touch ) ? true : event.event.which === 1 ) ) {
                        self.onMouseDownOnDefaultShapes( event );
                    }
                },
                mouseenter: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        self.onMouseEnterOnDefaultShapes( event );
                    }
                },
                mouseleave: function ( event ) {
                    if ( !self.player.getModalPresent() && !$.support.touch ) {
                        self.onMouseLeaveOnDefaultShapes( event );
                    }
                },
                mouseup: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        //if ( event.target.shapeUniqueCode === self.currentEvent.target.shapeUniqueCode ) {
                        //}
                    }
                }
            } );

            this.paperTool.on( {
                mouseup: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        if ( self.currentEvent === null && self.selectedShapeEvent ) {
                            self.currentEvent = self.selectedShapeEvent;
                        }
                        else {
                            self.deSelectShape();
                        }
                    }
                }
            } );
        },


        /**
        * Calls On Mouse Enter On Default Shape
        *
        * @method onMouseEnterOnDefaultShapes
        * @public
        */
        onMouseEnterOnDefaultShapes: function onMouseEnterOnDefaultShapes( event ) {
            if ( !$.support.touch ) {
                var shapeCode = event.target.shapeUniqueCode + 1;
                if ( shapeCode === 8 ) {
                    shapeCode = 6;
                }
                else if ( shapeCode === 6 ) {
                    shapeCode = 7;
                }
                else if ( shapeCode === 7 ) {
                    shapeCode = 8;
                }
                if ( !event.target.isSelected ) {
                    this.$( '.work-canvas' ).css( { 'cursor': 'pointer' } );
                    var fillColor = this.getDefaultShapeColor( 'hover' );
                    event.target.fillColor = fillColor;
                    this.changeAccMessage( 'left-panel-canvas-acc-container', 2, [shapeCode] );
                }
                else {
                    this.changeAccMessage( 'left-panel-canvas-acc-container', 4, [shapeCode] );
                }
            }
        },

        /**
        * Calls On Mouse Down On Default Shape
        *
        * @method onMouseDownOnDefaultShapes
        * @public
        */
        onMouseDownOnDefaultShapes: function onMouseDownOnDefaultShapes( event ) {
            this.stopReading();
            this.activateWorkCanvasScope();
            if ( this.selectedShapeEvent ) {
                this.deSelectShape();
            }
            if ( !event.target.isSelected ) {
                var fillColor = this.getDefaultShapeColor( 'selected' );
                event.target.fillColor = fillColor;
                event.target.isSelected = true;
                this.selectedShapeEvent = event;
                this.currentEvent = null;
                this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.DONE, false );
                var shapeCode = event.target.shapeUniqueCode + 1;
                if ( shapeCode === 8 ) {
                    shapeCode = 6;
                }
                else if ( shapeCode === 6 ) {
                    shapeCode = 7;
                }
                else if ( shapeCode === 7 ) {
                    shapeCode = 8;
                }
                this.selectedShapeCode = shapeCode;
                this.changeAccMessage( 'left-panel-canvas-acc-container', 3, [shapeCode] );
            }
        },

        /**
        * Calls On Mouse Leave On Default Shape
        *
        * @method onMouseLeaveOnDefaultShapes
        * @public
        */
        onMouseLeaveOnDefaultShapes: function onMouseLeaveOnDefaultShapes( event ) {
            this.$( '.work-canvas' ).css( { 'cursor': 'default' } );
            if ( !event.target.isSelected && !$.support.touch ) {
                var fillColor = this.getDefaultShapeColor( 'normal' );
                event.target.fillColor = fillColor;
            }
        },

        /**
        * Calls for deselecting selected shape
        *
        * @method deSelectShape
        * @public
        */
        deSelectShape: function deSelectShape() {
            if ( this.selectedShapeEvent ) {
                var isCopy = ( this.selectedShapeEvent.target.isOriginal === false ),
                    fillColor = isCopy ? this.getCopiedShapeColor( 'normal' ) : this.getDefaultShapeColor( 'normal' );
                this.selectedShapeEvent.target.fillColor = fillColor;
                this.selectedShapeEvent.target.isSelected = false;
                this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.DONE, true );
            }
            this.selectedShapeEvent = null;
            this.currentEvent = null;
        },

        /******************************************End With Default Shape Event************************************************/

        /*************************************Start With Selected shape event*************************************/
        /**
        * binds the event to shapes.
        * @method _bindShapeEvent
        * @public
        */
        bindSelectedShapeEvent: function () {
            var self = this,
                isMouseLeave = false,
                isMouseDrag = false;
            this.handleGroup.on( {
                mousedown: function ( event ) {
                    self.stopReading();
                    if ( !self.player.getModalPresent() && ( ( $.support.touch ) ? true : event.event.which === 1 ) ) {
                        if ( $.support.touch ) { self.onMouseEnterOnHandle( event ); };
                        self.onMouseDownOnHandle( event );
                        isMouseLeave = false;
                    }
                },
                mousedrag: function ( event ) {
                    if ( !self.player.getModalPresent() && ( ( $.support.touch ) ? true : event.event.which === 1 ) ) {
                        self.onMouseDragOnHandle( event );
                        isMouseDrag = true;
                    }
                },
                mouseenter: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        if ( !$.support.touch ) {
                            self.onMouseEnterOnHandle( event );
                            self.$( '.work-canvas' ).css( { 'cursor': 'url("' + self.filePath.getImagePath( 'open-hand' ) + '"), move' } );
                            isMouseLeave = false;
                        }
                    }
                },
                mouseleave: function ( event ) {
                    if ( !self.player.getModalPresent() && !$.support.touch ) {
                        self.onMouseLeaveOnHandle( event );
                        if ( !isMouseDrag ) self.$( '.work-canvas' ).css( { 'cursor': 'default' } );
                        isMouseLeave = true;
                    }
                },
                mouseup: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        //self.onMouseUpOnHandle( event );
                    }
                }
            } );

            this.paperTool.on( {
                mouseup: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        if ( isMouseLeave && self.currentEvent ) {
                            self.$( '.work-canvas' ).css( { 'cursor': 'default' } );
                        }
                        else if ( !isMouseLeave && self.currentEvent ) {
                            self.$( '.work-canvas' ).css( { 'cursor': 'url("' + self.filePath.getImagePath( 'open-hand' ) + '"), move' } );
                        }

                        self.onMouseUpOnHandle( event );

                        isMouseLeave = false;
                        isMouseDrag = false;
                        //if ( $.support.touch ) self.onMouseLeaveOnHandle();
                        //  self.$( '.work-canvas' ).css( { 'cursor': 'url("' + self.filePath.getImagePath( 'closed-hand' ) + '"), move' } );
                    }
                }
            } );
        },

        /**
        * Calls On Mouse Enter On selected Shape Handle
        *
        * @method onMouseEnterOnHandle
        * @public
        */
        onMouseEnterOnHandle: function onMouseEnterOnHandle( event ) {
            var callFrom = 'hover',
                callFor = 'vertex';
            // this.currentEvent = event;
            event.target.style = this.getCircleStyle( event.target.position, callFrom, callFor );
            this.changeAccMessage( 'left-panel-canvas-acc-container', 6, [event.target.handleNumber] );
        },

        /**
        * Calls On Mouse Down On selected Shape Handle
        *
        * @method mouseDownOnHandle
        * @public
        */
        onMouseDownOnHandle: function onMouseDownOnHandle( event ) {
            this.stopReading();
            this.activateWorkCanvasScope();
            //this.currentX = [];
            //this.currentY = [];
            //this.dependendSegment = [];
            this.currentEvent = event;
            this.$( '.work-canvas' ).css( { 'cursor': 'url("' + this.filePath.getImagePath( 'closed-hand' ) + '"), move' } );
            var data = this.model.getDataOfShape( this.selectedShape.shapeUniqueCode )[event.target.handleCode];
            var segmentObj = {};
            segmentObj.handleCode = event.target.handleCode;
            segmentObj.segmentNumber = this.getSegmentOfShape( event.target.position );
            this.dependendSegment.push( segmentObj );

            //Adding related coordinates object into array
            for ( var i = 0; i < this.handleGroup.children.length; i++ ) {
                var currentCode = this.handleGroup.children[i].handleCode;
                if ( data.horizontal.indexOf( currentCode ) !== -1 ) {
                    this.currentX.push( this.handleGroup.children[i] );
                    var segmentObj = {};
                    segmentObj.handleCode = currentCode;
                    segmentObj.segmentNumber = this.getSegmentOfShape( this.handleGroup.children[i].position );
                    this.dependendSegment.push( segmentObj );
                }
                else if ( data.vertical.indexOf( currentCode ) !== -1 ) {
                    this.currentY.push( this.handleGroup.children[i] );
                    var segmentObj = {};
                    segmentObj.handleCode = currentCode;
                    segmentObj.segmentNumber = this.getSegmentOfShape( this.handleGroup.children[i].position );
                    this.dependendSegment.push( segmentObj );
                }
            }
            this.mouseDownPoint = event.point;
        },

        /**
        * Calls On Mouse Drag On selected Shape Handle
        *
        * @method onMouseDragOnHandle
        * @public
        */
        onMouseDragOnHandle: function onMouseDragOnHandle( event ) {
            this.activateWorkCanvasScope();
            event.preventDefault();
            var currentPoint = event.point,
                diffX = currentPoint.x - this.mouseDownPoint.x,
                diffY = currentPoint.y - this.mouseDownPoint.y,
                restrictdata = this.model.getRestrictedPoints( this.selectedShape.shapeUniqueCode );

            this.mouseDownPoint.x = this.moveHorizontal( event, diffX, restrictdata );
            this.mouseDownPoint.y = this.moveVertical( event, diffY, restrictdata );
            this.changeSegmentPosition();
            //this.mouseDownPoint = currentPoint;
            this.$( '.work-canvas' ).css( { 'cursor': 'url("' + this.filePath.getImagePath( 'closed-hand' ) + '"), move' } );
            this.workCanvasScope.view.draw();
        },

        /**
        * Changes all segment positions
        *
        * @method changeSegmentPosition
        * @public
        */
        changeSegmentPosition: function changeSegmentPosition() {
            if ( this.selectedShape.shapeUniqueCode === 7 ) {
                var firstChildrenLength = this.selectedShape.children[0].segments.length;
                for ( var i = 0; i < this.dependendSegment.length; i++ ) {
                    if ( this.dependendSegment[i].segmentNumber < firstChildrenLength ) {
                        this.selectedShape.children[0].segments[this.dependendSegment[i].segmentNumber].point = this.getPositionOfHandle( this.dependendSegment[i].handleCode );
                        if ( this.dependendSegment[i].segmentNumber === 0 ) {
                            this.selectedShape.children[0].segments[firstChildrenLength - 1].point = this.getPositionOfHandle( this.dependendSegment[i].handleCode );
                        }
                    }
                    else {
                        var currentSegNumber = this.dependendSegment[i].segmentNumber - firstChildrenLength;
                        this.selectedShape.children[1].segments[currentSegNumber].point = this.getPositionOfHandle( this.dependendSegment[i].handleCode );
                        if ( currentSegNumber === 0 ) {
                            this.selectedShape.children[1].segments[this.selectedShape.children[1].segments.length - 1].point = this.getPositionOfHandle( this.dependendSegment[i].handleCode );
                        }
                    }
                }
            }
            else {
                for ( var i = 0; i < this.dependendSegment.length; i++ ) {
                    this.selectedShape.segments[this.dependendSegment[i].segmentNumber].point = this.getPositionOfHandle( this.dependendSegment[i].handleCode );
                    if ( this.dependendSegment[i].segmentNumber === 0 ) {
                        this.selectedShape.segments[this.selectedShape.segments.length - 1].point = this.getPositionOfHandle( this.dependendSegment[i].handleCode );
                    }
                }
            }
        },

        /**
        * Moves Handle horizontally
        *
        * @method moveHorizontal
        * @public
        */
        moveHorizontal: function moveHorizontal( event, xPoints, restrictdata ) {
            var bool = true,
                targetHandleCode = event.target.handleCode;
            //Checking for Condition for Horizontal movement
            bool = this.checkHorizontal( targetHandleCode, restrictdata, event.target.position.x + xPoints, targetHandleCode );
            if ( !bool ) { this.changeAccMessage( 'left-panel-canvas-acc-container', 8, [event.target.handleNumber] ); return this.mouseDownPoint.x; }
            for ( var i = 0; i < this.currentX.length; i++ ) {
                bool = this.checkHorizontal( this.currentX[i].handleCode, restrictdata, this.currentX[i].position.x + xPoints, targetHandleCode );
                if ( !bool ) { this.changeAccMessage( 'left-panel-canvas-acc-container', 8, [event.target.handleNumber] ); return this.mouseDownPoint.x; }
            }

            //Current Point is valid, So changing positions.
            event.target.position.x += xPoints;
            for ( var i = 0; i < this.currentX.length; i++ ) {
                this.currentX[i].position.x += xPoints;
            }
            return event.point.x;
        },

        /**
        * Checks handles while dragging horizontally
        *
        * @method checkHorizontal
        * @public
        */
        checkHorizontal: function checkHorizontal( handleCode, restrictdata, newX, targetHandleCode ) {
            var restrictSideX = restrictdata[handleCode].restrictX,
                bool = true,
                isPresent = false;

            //Checking whether related dragging coordinates are in check condition or not.
            //If it is any related coordinate is present then we should skip that point.
            //Checking for left boundary
            for ( var i = 0; i < this.currentX.length; i++ ) {
                for ( var m = 0; m < restrictSideX[0].length; m++ ) {
                    if ( restrictSideX[0][m] === this.currentX[i].handleCode ) {
                        isPresent = true;
                        break;
                    }
                }
            }
            if ( restrictSideX[0].length > 0 ) {
                for ( var m = 0; m < restrictSideX[0].length; m++ ) {
                    if ( restrictSideX[0][m] !== targetHandleCode && !isPresent ) {
                        if ( newX < this.getPositionOfHandle( restrictSideX[0][m] ).x + this.modelNamespace.GAP_BETWEEN_POINTS ) bool = false;
                    }
                }
            }
            else {
                if ( newX < this.modelNamespace.MIN_X_FOR_RESIZE ) bool = false;
            }

            //Checking whether related dragging coordinates are oin check condition or not.
            //If it is any related coordinate is present then we should skip that point.
            //Checking for right boundary
            isPresent = false;
            for ( var i = 0; i < this.currentX.length; i++ ) {
                for ( var m = 0; m < restrictSideX[1].length; m++ ) {
                    if ( restrictSideX[1][m] === this.currentX[i].handleCode ) {
                        isPresent = true;
                        break;
                    }
                }
            }
            if ( restrictSideX[1].length > 0 ) {
                for ( var m = 0; m < restrictSideX[1].length; m++ ) {
                    if ( restrictSideX[1][m] !== targetHandleCode && !isPresent ) {
                        if ( newX > this.getPositionOfHandle( restrictSideX[1][m] ).x - this.modelNamespace.GAP_BETWEEN_POINTS ) bool = false;
                    }
                }
            }
            else {
                if ( newX > this.modelNamespace.MAX_X_FOR_RESIZE ) bool = false;
            }
            return bool;
        },

        /**
        * Moves Handle Verttically
        *
        * @method moveVertical
        * @public
        */
        moveVertical: function moveVertical( event, yPoints, restrictdata ) {
            var bool = true,
                targetHandleCode = event.target.handleCode;
            //Checking for Condition for Horizontal movement
            bool = this.checkVertical( targetHandleCode, restrictdata, event.target.position.y + yPoints, targetHandleCode );
            if ( !bool ) { this.changeAccMessage( 'left-panel-canvas-acc-container', 8, [event.target.handleNumber] ); return this.mouseDownPoint.y; }
            for ( var i = 0; i < this.currentY.length; i++ ) {
                bool = this.checkVertical( this.currentY[i].handleCode, restrictdata, this.currentY[i].position.y + yPoints, targetHandleCode );
                if ( !bool ) { this.changeAccMessage( 'left-panel-canvas-acc-container', 8, [event.target.handleNumber] ); return this.mouseDownPoint.y; }
            }

            //Current Point is valid, So changing positions.
            event.target.position.y += yPoints;
            for ( var i = 0; i < this.currentY.length; i++ ) {
                this.currentY[i].position.y += yPoints;
            }
            return event.point.y;
        },

        /**
        * Checks all handles while dragging vertically
        *
        * @method checkVertical
        * @public
        */
        checkVertical: function checkVertical( handleCode, restrictdata, newY, targetHandleCode ) {
            var restrictSideY = restrictdata[handleCode].restrictY,
                bool = true,
                isPresent = false;

            //Checking whether related dragging coordinates are oin check condition or not.
            //If it is any related coordinate is present then we should skip that point.
            //Checking for top boundary
            for ( var i = 0; i < this.currentY.length; i++ ) {
                for ( var m = 0; m < restrictSideY[0].length; m++ ) {
                    if ( restrictSideY[0][m] === this.currentY[i].handleCode ) {
                        isPresent = true;
                        break;
                    }
                }
            }
            if ( restrictSideY[0].length > 0 ) {
                for ( var m = 0; m < restrictSideY[0].length; m++ ) {
                    if ( restrictSideY[0][m] !== targetHandleCode && !isPresent ) {
                        if ( newY < this.getPositionOfHandle( restrictSideY[0][m] ).y + this.modelNamespace.GAP_BETWEEN_POINTS ) bool = false;
                    }
                }
            }
            else {
                if ( newY < this.modelNamespace.MIN_Y_FOR_RESIZE ) bool = false;
            }

            //Checking whether related dragging coordinates are oin check condition or not.
            //If it is any related coordinate is present then we should skip that point.
            //Checking for bottom boundary
            isPresent = false;
            for ( var i = 0; i < this.currentY.length; i++ ) {
                for ( var m = 0; m < restrictSideY[1].length; m++ ) {
                    if ( restrictSideY[1][m] === this.currentY[i].handleCode ) {
                        isPresent = true;
                    }
                }
            }
            if ( restrictSideY[1].length > 0 ) {
                for ( var m = 0; m < restrictSideY[1].length; m++ ) {
                    if ( restrictSideY[1][m] !== targetHandleCode && !isPresent ) {
                        if ( newY > this.getPositionOfHandle( restrictSideY[1][m] ).y - this.modelNamespace.GAP_BETWEEN_POINTS ) bool = false;
                    }
                }
            }
            else {
                if ( newY > this.modelNamespace.MAX_Y_FOR_RESIZE ) bool = false;
            }
            return bool;
        },

        /**
        * Returns positions of handles
        *
        * @method getPositionOfHandle
        * @public
        */
        getPositionOfHandle: function getPositionOfHandle( handleCode ) {
            for ( var i = 0; i < this.handleGroup.children.length; i++ ) {
                if ( this.handleGroup.children[i].handleCode === handleCode ) {
                    return this.handleGroup.children[i].position;
                }
            }
        },

        /**
        * Returns segment of specified position.
        *
        * @method getSegmentOfShape
        * @public
        */
        getSegmentOfShape: function getSegmentOfShape( currentPoint ) {
            if ( this.selectedShape.shapeUniqueCode === 7 ) {
                for ( var i = 0; i < this.selectedShape.children.length; i++ ) {
                    for ( var j = 0; j < this.selectedShape.children[i].segments.length; j++ ) {
                        var segmentPoint = this.selectedShape.children[i].segments[j].point;
                        if ( segmentPoint.x === currentPoint.x && segmentPoint.y === currentPoint.y ) {
                            if ( i === 0 ) {
                                return j;
                            }
                            else {
                                return this.selectedShape.children[0].segments.length + j;
                            }
                        }
                    }
                }
            }
            else {
                for ( var i = 0; i < this.selectedShape.segments.length; i++ ) {
                    var segmentPoint = this.selectedShape.segments[i].point;
                    if ( segmentPoint.x === currentPoint.x && segmentPoint.y === currentPoint.y ) {
                        return i;
                    }
                }
            }
        },

        /**
        * Calls On Mouse Leave On selected Shape Handle
        *
        * @method onMouseLeaveOnHandle
        * @public
        */
        onMouseLeaveOnHandle: function onMouseLeaveOnHandle( event ) {
            var callFrom = 'normal',
                callFor = 'vertex';
            event.target.style = this.getCircleStyle( event.target.position, callFrom, callFor );
            // this.$( '.work-canvas' ).css( { 'cursor': 'default' } );
        },

        /**
        * Calls On Mouse Up On selected Shape Handle
        *
        * @method onMouseUpOnHandle
        * @public
        */
        onMouseUpOnHandle: function onMouseUpOnHandle( event ) {
            this.activateWorkCanvasScope();
            if ( this.currentEvent ) {
                //this.$( '.work-canvas' ).css( { 'cursor': 'url("' + this.filePath.getImagePath( 'open-hand' ) + '"), move' } );
                var nearestPoint = this.modelNamespace.getNearestPoint( this.currentEvent.target.position, this.gridPoints );
                this.currentEvent.target.position = this.gridPoints[nearestPoint.index];

                for ( var i = 0; i < this.currentX.length; i++ ) {
                    nearestPoint = this.modelNamespace.getNearestPoint( this.currentX[i].position, this.gridPoints );
                    this.currentX[i].position = this.gridPoints[nearestPoint.index];
                }
                for ( var i = 0; i < this.currentY.length; i++ ) {
                    nearestPoint = this.modelNamespace.getNearestPoint( this.currentY[i].position, this.gridPoints );
                    this.currentY[i].position = this.gridPoints[nearestPoint.index];
                }

                this.changeSegmentPosition();
                this.currentX = [];
                this.currentY = [];
                this.dependendSegment = [];
                if ( $.support.touch ) this.onMouseLeaveOnHandle( this.currentEvent );
                this.currentEvent = null;
            }
            this.workCanvasScope.view.draw();
        },

        /*************************************End With Selected shape event*************************************/

        /*************************************Start With Shapes Action Events*************************************/

        /**
        * Binds an event to new shapes.
        *
        * @method bindEventsToNewShape
        * @public
        */
        bindEventsToNewShape: function bindEventsToNewShape( shapesArray ) {
            var self = this;
            for ( var i = 0; i < shapesArray.length; i++ ) {
                shapesArray[i].on( 'mousedown', function ( event ) {
                    self.onMouseDownOnNewShapes( event, null, this );
                } );
                shapesArray[i].on( 'mouseup', function ( event ) {
                    self.onMouseUpOnNewShapes( event, this );
                } );
                shapesArray[i].on( 'mousedrag', function ( event ) {
                    self.onMouseDragOnNewShapes( event, this );
                } );
                shapesArray[i].on( 'mouseenter', function ( event ) {
                    self.onMouseEnterOnNewShapes( event, this );
                } );
                shapesArray[i].on( 'mouseleave', function ( event ) {
                    self.onMouseLeaveOnNewShapes( event, this );
                } );
                //shapesArray[i].on( 'mouseup', $.proxy( this.onMouseUpOnNewShapes, this ) );
                //shapesArray[i].on( 'mousedrag', $.proxy( this.onMouseDragOnNewShapes, this ) );
                //shapesArray[i].on( 'mouseenter', $.proxy( this.onMouseEnterOnNewShapes, this ) );
                //shapesArray[i].on( 'mouseleave', $.proxy( this.onMouseLeaveOnNewShapes, this ) );
            }
        },

        _cancelMouseUpLabelRemoval: false,
        //isMouseDownOnNewShape: false,

        onMouseUpOnNewShapes: function onMouseUpOnNewShapes( event, target ) {
            if ( !this.player.getModalPresent() ) {
                if ( $.support.touch ) {
                    if ( this._tapNHoldTimer ) {
                        window.clearTimeout( this._tapNHoldTimer );
                    }
                    var tooltipIndex = target.shapeUniqueCode + '|' + target.isOriginal,
                        tooltipView = this.shapesTooltipViews[tooltipIndex];
                    if ( tooltipView ) {
                        tooltipView.hideTooltip();
                    }
                }
                if ( this._cancelMouseUpLabelRemoval !== true ) {
                    this._removeAllShapeLabels( false ); // wont be called if tooltip is shown
                }
                this._cancelMouseUpLabelRemoval = false;
            }
        },

        /**
        * Calls On Mouse Enter On New Shape
        *
        * @method onMouseEnterOnNewShapes
        * @public
        */
        onMouseEnterOnNewShapes: function onMouseEnterOnNewShapes( event, target ) {
            if ( !this.player.getModalPresent() ) {
                if ( !$.support.touch ) {
                    var tooltipIndex = target.shapeUniqueCode + '|' + target.isOriginal,
                        tooltipView = this.shapesTooltipViews[tooltipIndex];
                    if ( tooltipView ) {
                        tooltipView.setElGeometry( this.cloneHandle );
                        tooltipView.showTooltip();
                    }
                    if ( !target.isSelected ) {
                        this.$( '.work-canvas' ).css( { 'cursor': 'pointer' } );
                        var isCopy = ( target.isOriginal === false ),
                            fillColor = isCopy ? this.getCopiedShapeColor( 'hover' ) : this.getDefaultShapeColor( 'hover' );
                        target.fillColor = fillColor;
                        this.workCanvasScope.view.draw();
                    }
                    else {
                        this.$( '.work-canvas' ).css( { 'cursor': 'url("' + this.filePath.getImagePath( 'open-hand' ) + '"), move' } );
                    }
                }
            }
        },

        /**
        * Calls On Mouse Down On New Shape
        *
        * @method onMouseDownOnNewShapes
        * @public
        */
        onMouseDownOnNewShapes: function onMouseDownOnNewShapes( event, callFrom, target ) {
            if ( !this.player.getModalPresent() ) {
                this.stopReading();
                var actionEnum = this.modelNamespace.ACTION_ENUM,
                    eventsEnum = this.modelNamespace.EVENTS,
                    shapeLabelIndex, shapeCode, shapeLabel,
                    self = this, _showTooltip,
                    bool = true;
                this.activateWorkCanvasScope();
                //this.isMouseDownOnNewShape = false;
                //if ( target.isOddShape ) {
                //    if ( !target.children ) {
                //        return;
                //    }
                //}
                //this.isMouseDownOnNewShape = true;
                event.target = target;
                target.bringToFront();
                if ( callFrom !== 'callFromButtonClick' && callFrom !== 'callFromCopyClick' && callFrom !== 'callFromUndoClick' ) {
                    event.preventDefault();
                    //event.stopPropagation();
                    this.$( '.work-canvas' ).css( { 'cursor': 'url("' + this.filePath.getImagePath( 'closed-hand' ) + '"), move' } );
                }
                this.mouseDownPoint = event.point;
                if ( this.selectedShapeEvent ) {
                    this.deSelectNewShape( 'mouseDown' );
                }

                if ( $.support.touch && callFrom !== 'callFromButtonClick' && callFrom !== 'callFromCopyClick' && callFrom !== 'callFromUndoClick' ) {
                    var tooltipIndex = target.shapeUniqueCode + '|' + target.isOriginal,
                        tooltipView = this.shapesTooltipViews[tooltipIndex];
                    _showTooltip = function () {
                        event.preventDefault();
                        self._cancelMouseUpLabelRemoval = true;
                        if ( tooltipView ) {
                            tooltipView.setElGeometry( self.cloneHandle );
                            tooltipView.showTooltip();
                        }
                    };

                    this._tapNHoldTimer = window.setTimeout( function () {
                        _showTooltip();
                    }, 800 );
                }
                this.isCurrentShapeIntersecting = false;
                if ( this.dottedCutLine ) {
                    var arr = target.getIntersections( this.dottedCutLine );
                    if ( arr.length > 0 ) this.isCurrentShapeIntersecting = true;
                }
                if ( !target.isSelected ) {
                    target.bringToFront();
                    //  target.on( 'mouseup', $.proxy( this.onMouseUpOnNewShapes, this ) );
                    shapeCode = target.shapeUniqueCode;
                    if ( this._shapeLabels && this._shapeLabels[shapeCode] ) {
                        shapeLabelIndex = target.isOriginal ? 0 : 1;
                        shapeLabel = this._shapeLabels[shapeCode][shapeLabelIndex];
                        if ( shapeLabel ) {
                            shapeLabel.bringToFront();
                        }
                    }
                    var isCopy = ( target.isOriginal === false ),
                        fillColor = isCopy ? this.getCopiedShapeColor( 'selected' ) : this.getDefaultShapeColor( 'selected' );
                    target.fillColor = fillColor;
                    target.isSelected = true;
                    if ( target.isOddShape ) {
                        if ( target.children ) {
                            target.children[0].isSelected = true;
                            target.children[1].isSelected = true;
                        }
                    }
                    this.selectedShapeEvent = event;
                    this.selectedShape = target;
                    this.currentEvent = null;
                    if ( !target.isOriginal ) {
                        bool = true;
                    }
                    else {
                        bool = this.checkForCopyPresent( target.shapeUniqueCode );
                    }
                    this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.COPY, bool );
                    this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.REFLECT, false );
                    this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.ROTATE, false );
                    this.workCanvasScope.view.draw();
                }
            }
        },

        /**
        * Checks whther the copy is present or not.
        *
        * @method checkForCopyPresent
        * @public
        */
        checkForCopyPresent: function checkForCopyPresent( shapeCode ) {
            var undoStack = this.model.get( 'undoStack' ),
                undoCurrentArray;

            if ( undoStack.length > 0 ) {
                undoCurrentArray = undoStack[undoStack.length - 1];
                for ( var i = 0; i < undoCurrentArray.length; i++ ) {
                    if ( undoCurrentArray[i].shapeUniqueCode === shapeCode ) {
                        if ( !undoCurrentArray[i].isOriginal ) return true;
                    }
                }
            }
            return false;
        },

        /**
        * Calls On Mouse Drag On New Shape
        *
        * @method onMouseDragOnNewShapes
        * @public
        */
        onMouseDragOnNewShapes: function onMouseDragOnNewShapes( event, target ) {
            if ( !this.player.getModalPresent() ) {
                //if ( !this.isMouseDownOnNewShape ) {
                //    return;
                //}
                this.activateWorkCanvasScope();
                var rightClick = false;
                if ( !$.support.touch ) {
                    if ( event.event.which !== 1 ) rightClick = true;
                }
                event.preventDefault();
                if ( !rightClick ) {
                    this.$( '.work-canvas' ).css( { 'cursor': 'url("' + this.filePath.getImagePath( 'closed-hand' ) + '"), move' } );
                    if ( $.support.touch ) {
                        if ( this._tapNHoldTimer ) {
                            window.clearTimeout( this._tapNHoldTimer );
                        }
                    }
                    if ( this.isRemoveLabelRequired ) {
                        this.isRemoveLabelRequired = false;
                        this._removeAllShapeLabels( false );
                    }
                    if ( target.isOddShape ) {
                        if ( target.children ) {
                            if ( target.children.length <= 0 ) {
                                return;
                            }
                        }
                        else {
                            return;
                        }
                    }
                    var diffX = event.point.x - this.mouseDownPoint.x,
                        diffY = event.point.y - this.mouseDownPoint.y;
                    target.position.x += diffX;
                    target.position.y += diffY;
                    this.mouseDownPoint = this.checkForBoundaryOfShape( event, diffX, diffY, target );
                    //this.mouseDownPoint = event.point;
                    this.isShapeDragged = true;
                    if ( this.isCurrentShapeIntersecting ) {
                        this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT_LINE, true );
                    }
                }
            }
        },

        /**
        * Checks whether shape is going outside or not.
        *
        * @method checkForBoundaryOfShape
        * @public
        */
        checkForBoundaryOfShape: function checkForBoundaryOfShape( event, diffX, diffY, target ) {
            var clone = target.clone(),
                topLeft = clone.bounds.getTopLeft(),
                bottomRight = clone.bounds.getBottomRight();

            if ( topLeft.x < this.modelNamespace.BOUNDING_BOX_LEFT ) {
                target.position.x -= diffX;
                event.point.x = this.mouseDownPoint.x;
                this.changeAccMessage( 'left-panel-canvas-acc-container', 20 );
            }
            else if ( bottomRight.x > this.modelNamespace.BOUNDING_BOX_RIGHT ) {
                target.position.x -= diffX;
                event.point.x = this.mouseDownPoint.x;
                this.changeAccMessage( 'left-panel-canvas-acc-container', 20 );
            }

            if ( topLeft.y < this.modelNamespace.BOUNDING_BOX_TOP ) {
                target.position.y -= diffY;
                event.point.y = this.mouseDownPoint.y;
                this.changeAccMessage( 'left-panel-canvas-acc-container', 20 );
            }
            else if ( bottomRight.y > this.modelNamespace.BOUNDING_BOX_BOTTOM ) {
                target.position.y -= diffY;
                event.point.y = this.mouseDownPoint.y;
                this.changeAccMessage( 'left-panel-canvas-acc-container', 20 );
            }
            clone.remove();
            return event.point;
        },

        /**
        * Calls On Mouse Leave On New Shape
        *
        * @method onMouseLeaveOnNewShapes
        * @public
        */
        onMouseLeaveOnNewShapes: function onMouseLeaveOnNewShapes( event, target ) {
            if ( !this.player.getModalPresent() ) {
                this.$( '.work-canvas' ).css( { 'cursor': 'default' } );
                if ( !$.support.touch ) {
                    var tooltipIndex = target.shapeUniqueCode + '|' + target.isOriginal,
                        tooltipView = this.shapesTooltipViews[tooltipIndex];
                    if ( tooltipView ) {
                        tooltipView.hideTooltip();
                    }
                    if ( !target.isSelected ) {
                        var isCopy = ( target.isOriginal === false ),
                            fillColor = isCopy ? this.getCopiedShapeColor( 'normal' ) : this.getDefaultShapeColor( 'normal' );
                        target.fillColor = fillColor;
                    }
                    this.workCanvasScope.view.draw();
                }
            }
        },

        /**
        * Calls for deselecting selected shape
        *
        * @method deSelectNewShape
        * @public
        */
        deSelectNewShape: function deSelectNewShape( callFrom ) {
            if ( !this.player.getModalPresent() ) {
                if ( $.support.touch ) {
                    var tempEvent = null;
                    if ( this.currentEvent ) {
                        tempEvent = this.currentEvent;
                    }
                    else if ( this.selectedShapeEvent ) {
                        tempEvent = this.selectedShapeEvent;
                    }
                    if ( tempEvent ) {
                        var tooltipIndex = tempEvent.target.shapeUniqueCode + '|' + tempEvent.target.isOriginal,
                            tooltipView = this.shapesTooltipViews[tooltipIndex];
                        if ( tooltipView ) {
                            tooltipView.hideTooltip();
                        }
                    }
                }
                var actionEnum = this.modelNamespace.ACTION_ENUM,
                    eventsEnum = this.modelNamespace.EVENTS;

                if ( this.isShapeDragged ) {
                    this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.UNDO, false );
                    this.changePosition();
                    this.selectedShape.defaultCenter = this.selectedShape.position;
                    this.selectedShape.currentRotationCount = 0;
                    var tempBool = this.model.addEntryToUndoStack( this.canvasShapes );
                    if ( tempBool ) this.addLatticePointsOfSidesOfPolygon();
                    if ( this.dottedCutLine ) this.checkForIntersection();
                    this.isShapeDragged = false;
                }
                if ( this.currentEvent === null && this.selectedShapeEvent ) {
                    this.currentEvent = this.selectedShapeEvent;
                    this.$( '.work-canvas' ).css( { 'cursor': 'url("' + this.filePath.getImagePath( 'open-hand' ) + '"), move' } );
                }
                else {
                    if ( this.cutLineHandleGroup && callFrom !== 'mouseDown' && callFrom !== 'cutLine' ) {
                        console.log( 'Entered Return' );
                        return;
                    }
                    if ( this.selectedShapeEvent ) {
                        var isCopy = ( this.selectedShapeEvent.target.isOriginal === false ),
                            fillColor = isCopy ? this.getCopiedShapeColor( 'normal' ) : this.getDefaultShapeColor( 'normal' );
                        this.selectedShapeEvent.target.fillColor = fillColor;
                        this.selectedShapeEvent.target.isSelected = false;
                        if ( this.selectedShapeEvent.target.isOddShape ) {
                            if ( this.selectedShapeEvent.target.children ) {
                                this.selectedShapeEvent.target.children[0].isSelected = false;
                                this.selectedShapeEvent.target.children[1].isSelected = false;
                            }
                        }
                        this.selectedShape = null;
                        this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.COPY, true );
                        this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.REFLECT, true );
                        this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.ROTATE, true );
                    }
                    this.selectedShapeEvent = null;
                    this.currentEvent = null;
                }
                this.bringCutLineToFront();
                this.workCanvasScope.view.draw();
            }
        },


        /*************************************End With Shapes Action Events*************************************/

        /*************************************Start With Cut Line Handle event*************************************/
        /**
        * binds the event to cut line handles;
        * @method bindCutLineHandleEvent
        * @public
        */
        bindCutLineHandleEvent: function bindCutLineHandleEvent() {
            var self = this,
                isMouseLeave = false,
                isMouseDrag = false,
                mouseDownPoint = null,
                handleEvent;
            this.cutLineHandleGroup.on( {
                mousedown: function ( event ) {
                    self.stopReading();
                    if ( !self.player.getModalPresent() && ( ( $.support.touch ) ? true : event.event.which === 1 ) ) {
                        if ( $.support.touch ) { self.onMouseEnterOnCutLineHandle( event ); };
                        self.onMouseDownOnCutLineHandle( event );
                        handleEvent = event;
                        mouseDownPoint = event.point;
                        self.$( '.work-canvas' ).css( { 'cursor': 'url("' + self.filePath.getImagePath( 'closed-hand' ) + '"), move' } );
                        isMouseLeave = false;
                    }
                },
                mousedrag: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        self.onMouseDragOnCutLineHandle( event, mouseDownPoint );
                        mouseDownPoint = event.target.position;
                        handleEvent = event;
                        isMouseDrag = true;
                    }
                },
                mouseenter: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        if ( !$.support.touch ) {
                            self.onMouseEnterOnCutLineHandle( event );
                            self.$( '.work-canvas' ).css( { 'cursor': 'url("' + self.filePath.getImagePath( 'open-hand' ) + '"), move' } );
                            isMouseLeave = false;
                        }
                    }
                },
                mouseleave: function ( event ) {
                    if ( !self.player.getModalPresent() && !$.support.touch ) {
                        self.onMouseLeaveOnCutLineHandle( event );
                        self.$( '.work-canvas' ).css( { 'cursor': 'default' } );
                        isMouseLeave = true;
                    }
                },
                mouseup: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        //self.onMouseUpOnHandle( event );
                        self.$( '.work-canvas' ).css( { 'cursor': 'url("' + self.filePath.getImagePath( 'open-hand' ) + '"), move' } );
                    }
                }
            } );

            this.paperTool.on( {
                mouseup: function ( event ) {
                    if ( !self.player.getModalPresent() ) {
                        if ( handleEvent ) {
                            if ( isMouseDrag ) {
                                self.onMouseUpOnCutLineHandle( handleEvent );
                            }
                            if ( $.support.touch ) self.onMouseLeaveOnCutLineHandle( handleEvent );
                            isMouseLeave = false;
                            isMouseDrag = false;
                            handleEvent = null;
                        }
                    }
                }
            } );
        },

        /**
        * Calls On Mouse Enter On cut line Handles.
        *
        * @method onMouseEnterOnCutLineHandle
        * @public
        */
        onMouseEnterOnCutLineHandle: function onMouseEnterOnCutLineHandle( event ) {
            var callFrom = 'hover',
                callFor = 'cutHandle';
            event.target.style = this.getCircleStyle( event.target.position, callFrom, callFor );
        },

        /**
        * Calls On Mouse Down On cut line Handles.
        *
        * @method onMouseDownOnCutLineHandle
        * @public
        */
        onMouseDownOnCutLineHandle: function onMouseDownOnCutLineHandle( event ) {
            this.stopReading();
            this.activateWorkCanvasScope();
            //event.target.position = event.point;
            //event.target.position = event.point;
            this.repositionLine( event );
            this.repositionButton();
        },

        /**
        * Calls On Mouse Drag On cut line Handles.
        *
        * @method onMouseDragOnCutLineHandle
        * @public
        */
        onMouseDragOnCutLineHandle: function onMouseDragOnCutLineHandle( event, mouseDownPoint ) {
            this.activateWorkCanvasScope();
            event.preventDefault();
            this.$( '.work-canvas' ).css( { 'cursor': 'url("' + this.filePath.getImagePath( 'closed-hand' ) + '"), move' } );
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT_LINE, true );
            var curPosX = event.target.position.x,
                curPosY = event.target.position.y,
                newPth,
                topLeft,
                bottomRight,
                diffX = event.point.x - mouseDownPoint.x,
                diffY = event.point.y - mouseDownPoint.y;

            //topLeft = event.target.bounds.topLeft;
            //bottomRight = event.target.bounds.bottomRight;

            //Check For X position
            event.target.position.x += diffX;
            newPth = this.cutLineHandleGroup.children[0].intersect( this.cutLineHandleGroup.children[1] );
            if ( ( event.target.position.x < this.modelNamespace.BOUNDING_BOX_LEFT || event.target.position.x > this.modelNamespace.BOUNDING_BOX_RIGHT ) || newPth.area !== 0 ) {
                event.target.position.x = curPosX;
            }
            newPth.remove();

            //Check For Y position
            event.target.position.y += diffY;
            newPth = this.cutLineHandleGroup.children[0].intersect( this.cutLineHandleGroup.children[1] );
            if ( ( event.target.position.y < this.modelNamespace.BOUNDING_BOX_TOP || event.target.position.y > this.modelNamespace.BOUNDING_BOX_BOTTOM ) || newPth.area !== 0 ) {
                event.target.position.y = curPosY;
            }
            newPth.remove();
            this.repositionLine( event );
            this.repositionButton();
        },

        /**
       * Repositions the button as cut line moves.
       *
       * @method repositionButton
       * @public
       */
        repositionButton: function repositionButton() {
            var len = this.dottedCutLine.length / 2,
                point = this.dottedCutLine.getPointAt( len ),
                normal = this.dottedCutLine.getNormalAt( len ),
                newPoint,
                normalLen = 30,
                bool = false,
                xCheck = false;

            normal.length = normalLen;
            newPoint = point.add( normal );
            this.dummyRectangleOfCutButton.position = newPoint;
            ////newPoint.x -= 22;
            ////newPoint.y -= 19;
            this.dummyRectangleOfCutButton.bringToFront();

            if ( ( newPoint.y - 19 ) < this.modelNamespace.BOUNDING_BOX_TOP ) {
                normalLen *= -1;
                normal.length = normalLen;
                newPoint = point.add( normal );
                bool = true;
            }

            if ( ( newPoint.x + 22 ) > this.modelNamespace.BOUNDING_BOX_RIGHT ) {
                if ( bool === true ) {
                    normalLen *= 1;
                }
                else {
                    normalLen *= -1;
                    xCheck = true;
                }
                normal.length = normalLen;
                newPoint = point.add( normal );
            }
            else if ( ( newPoint.x - 22 ) < this.modelNamespace.BOUNDING_BOX_LEFT ) {
                if ( bool === true ) {
                    normalLen *= 1;
                }
                else {
                    normalLen *= -1;
                    xCheck = true;
                }
                normal.length = normalLen;
                newPoint = point.add( normal );
            }

            if ( ( newPoint.y + 19 ) > this.modelNamespace.BOUNDING_BOX_BOTTOM + 24 ) {
                ( xCheck ) ? normalLen *= 1 : normalLen *= -1;
                normal.length = normalLen;
                newPoint = point.add( normal );
            }

            //normal.length = len;
            //newPoint = point.add( normal );
            this.dummyRectangleOfCutButton.position = newPoint;
            newPoint.x -= 22;
            newPoint.y -= 19;
            this.dummyRectangleOfCutButton.bringToFront();
            this.$( this.$( '.cut-line-button' )[0] ).css( { 'top': ( newPoint.y ) + 'px', 'left': ( newPoint.x ) + 'px' } );
        },

        /**
        * Calls On Mouse Leave On cut line Handles.
        *
        * @method onMouseLeaveOnCutLineHandle
        * @public
        */
        onMouseLeaveOnCutLineHandle: function onMouseLeaveOnCutLineHandle( event ) {
            var callFrom = 'normal',
                callFor = 'cutHandle';
            event.target.style = this.getCircleStyle( event.target.position, callFrom, callFor );
        },

        /**
        * Calls On Mouse Up On cut line Handles.
        *
        * @method onMouseUpOnCutLineHandle
        * @public
        */
        onMouseUpOnCutLineHandle: function onMouseUpOnCutLineHandle( event ) {
            if ( event ) {
                var nearestPoint = this.modelNamespace.getNearestPoint( event.target.position, this.gridPoints );
                event.target.position = this.gridPoints[nearestPoint.index];
                this.repositionLine( event );
                this.repositionButton();
                this.checkForIntersection();
                this.bringCutLineToFront();
                if(event.data){
                    if(event.data.directionData.directionX === -1 && event.target.position.x === 13){
                        this.changeAccMessage('left-panel-canvas-acc-container', 25);
                    }
                    if(event.data.directionData.directionX === 1 && event.target.position.x === 589){
                        this.changeAccMessage('left-panel-canvas-acc-container', 25);
                    }
                    if(event.data.directionData.directionY === -1 && event.target.position.y === 13){
                        this.changeAccMessage('left-panel-canvas-acc-container', 25);
                    }
                    if(event.data.directionData.directionY === 1 && event.target.position.y === 469){
                        this.changeAccMessage('left-panel-canvas-acc-container', 25);
                    }
                }
            }
        },

        /**
        * Brings dotted line to front.
        *
        * @method bringCutLineToFront
        * @public
        */
        bringCutLineToFront: function bringCutLineToFront() {
            if ( this.dottedCutLine ) {
                this.dottedCutLine.bringToFront();
                this.cutLineHandleGroup.bringToFront();
            }
        },

        /**
        * Repositions line as per handle placement
        *
        * @method repositionLine
        * @public
        */
        repositionLine: function repositionLine( event ) {
            if ( event.target.handleCode === 'a' ) {
                this.dottedCutLine.segments[0].point = event.target.position;
            }
            else if ( event.target.handleCode === 'b' ) {
                this.dottedCutLine.segments[1].point = event.target.position;
            }
        },

        validCutShapeIndex: null,
        /**
        * Checks whether cut line intersecting or not.
        *
        * @method checkForIntersection
        * @public
        */
        checkForIntersection: function checkForIntersection() {
            var intersectedObjectIndex = [],
                intersectedObjectPoints,
                bool,
                point,
                handlePos1 = this.cutLineHandleGroup.children[0].position,
                handlePos2 = this.cutLineHandleGroup.children[1].position,
                handleindex1 = this.model.getIndexOfPoint( handlePos1 ),
                handleindex2 = this.model.getIndexOfPoint( handlePos2 );
            this.validCutPointsObjects = [];
            this.validCutshapes = [];
            this.validCutShapeIndex = [];
            for ( var i = 0; i < this.canvasShapes.length; i++ ) {
                intersectedObjectPoints = [];
                if ( this.canvasShapes[i].isOriginal ) {
                    this.validCutshapes.push( this.canvasShapes[i] );
                    var intersectingPointsArray = this.canvasShapes[i].getIntersections( this.dottedCutLine );
                    if ( this.checkForHandleOutsideCurrenShape( handlePos1, handlePos2, handleindex1, handleindex2, this.canvasShapes[i].shapeUniqueCode ) ) {
                        if ( intersectingPointsArray.length > 0 ) this.validCutShapeIndex.push( i );
                        if ( intersectingPointsArray.length > 1 ) {
                            for ( var j = 0; j < intersectingPointsArray.length; j++ ) {
                                point = intersectingPointsArray[j].point;
                                var index = this.model.getIndexOfPoint( point );
                                if ( index !== -1 ) {
                                    intersectedObjectPoints.push( index );
                                }
                            }
                            intersectedObjectPoints.sort( function ( a, b ) { return a - b } );
                            if ( intersectedObjectPoints.length > 1 ) {
                                if ( this.canvasShapes[i].isOddShape ) {
                                    var validPoints = this.checkForInInvalidPointsForOddShape( intersectedObjectPoints, this.canvasShapes[i].shapeUniqueCode, intersectingPointsArray.length, this.canvasShapes[i] );
                                    if ( validPoints.length > 0 ) { this.validCutPointsObjects.push( validPoints ); }
                                }
                                else {
                                    var validPoints = this.checkForInInvalidPointsForNormalShape( intersectedObjectPoints, this.canvasShapes[i].shapeUniqueCode, this.canvasShapes[i] );
                                    if ( validPoints.length > 0 ) { this.validCutPointsObjects.push( validPoints ); }
                                }
                            }
                        }
                    }
                    else {
                        if ( intersectingPointsArray.length > 0 ) this.validCutShapeIndex.push( i );
                    }
                }
            }
            var text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'disabledText' );
            if ( this.validCutPointsObjects.length === 0 ) {
                this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT_LINE, true );
                this.enableTab( 'cut-line-button', false );
            }
            else {
                this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CUT_LINE, false );
                text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'enabledText' );
                this.enableTab( 'cut-line-button', true );
            }

            this.changeAccMessage( 'left-panel-canvas-acc-container', 14, [text1] );
        },

        /**
        * Checks whether handles are outside shape or not
        *
        * @method checkForHandleOutsideCurrenShape
        * @public
        */
        checkForHandleOutsideCurrenShape: function checkForHandleOutsideCurrenShape( handlePos1, handlePos2, handleindex1, handleindex2, shapeCode ) {
            var boundaryPointsArray = this.model.getBoundaryPointOfShape( shapeCode ),
                bool1 = false,
                bool2 = false;

            if ( boundaryPointsArray.indexOf( handleindex1 ) !== -1 ) bool1 = true;
            if ( boundaryPointsArray.indexOf( handleindex2 ) !== -1 ) bool2 = true;

            if ( !bool1 ) {
                var ans = this.checkForPointInsideCurrentShape( handlePos1, boundaryPointsArray );
                if ( !ans ) bool1 = true;
            }
            if ( !bool2 ) {
                var ans = this.checkForPointInsideCurrentShape( handlePos2, boundaryPointsArray );
                if ( !ans ) bool2 = true;
            }

            return ( bool1 && bool2 ) ? true : false;
        },

        /**
        * Checks whether points invalid or not for odd shape.
        *
        * @method checkForInInvalidPointsForOddShape
        * @public
        */
        checkForInInvalidPointsForOddShape: function checkForInInvalidPointsForOddShape( intersectedObjectPoints, shapeCode, intersectingPointsArrayLength, shapeObject ) {
            var validPoints = [],
                addNumber = 3;
            var boundaryPosArrayObject = this.model.getBoundaryPointOfShapeObject( shapeCode ),
                boundaryPosArray1 = boundaryPosArrayObject.boundaryPointArray;

            this.modelNamespace.removeSameNumbersFromArray( intersectedObjectPoints );
            if ( intersectedObjectPoints.length === 3 ) {
                // var intersectingPointsArray = this.canvasShapes[shapeNumber].getIntersections( this.dottedCutLine );
                if ( intersectingPointsArrayLength !== 4 ) {
                    intersectedObjectPoints.splice( 1, 0, intersectedObjectPoints[1] );
                }
            }

            if ( intersectedObjectPoints.length === 4 ) {
                var pt = new this.workCanvasScope.Point(( this.gridPoints[intersectedObjectPoints[0]].x + this.gridPoints[intersectedObjectPoints[1]].x ) / 2, ( this.gridPoints[intersectedObjectPoints[0]].y + this.gridPoints[intersectedObjectPoints[1]].y ) / 2 );
                if ( !shapeObject.contains( pt ) ) {
                    return validPoints;
                }
                var pt = new this.workCanvasScope.Point(( this.gridPoints[intersectedObjectPoints[2]].x + this.gridPoints[intersectedObjectPoints[3]].x ) / 2, ( this.gridPoints[intersectedObjectPoints[2]].y + this.gridPoints[intersectedObjectPoints[3]].y ) / 2 );
                if ( !shapeObject.contains( pt ) ) {
                    return validPoints;
                }
                for ( var i = 0; i < 2; i++ ) {
                    var obj = {};
                    if ( i == 0 ) {
                        obj.start = intersectedObjectPoints[i];
                        obj.end = intersectedObjectPoints[i + addNumber];
                    }
                    else {
                        obj.start = intersectedObjectPoints[i];
                        obj.end = intersectedObjectPoints[i + addNumber];
                    }
                    obj.shapeUniqueCode = shapeCode;
                    obj.isOddShape = true;
                    obj.isRemovingOddShape = true;
                    validPoints.push( obj );
                    addNumber -= 2;
                }
            }
            else {
                if ( boundaryPosArray1.indexOf( intersectedObjectPoints[0] ) !== -1 && boundaryPosArray1.indexOf( intersectedObjectPoints[1] ) !== -1 ) {
                    //  var intersectingPointsArray = this.canvasShapes[shapeNumber].getIntersections( this.dottedCutLine );
                    if ( intersectingPointsArrayLength === 4 ) return validPoints;
                    if ( intersectingPointsArrayLength === 2 ) {
                        var pt = new this.workCanvasScope.Point(( this.gridPoints[intersectedObjectPoints[0]].x + this.gridPoints[intersectedObjectPoints[1]].x ) / 2, ( this.gridPoints[intersectedObjectPoints[0]].y + this.gridPoints[intersectedObjectPoints[1]].y ) / 2 );
                        if ( !this.modelNamespace.isPointOnPath( pt, shapeObject ) ) {
                            var obj = {};
                            obj.start = intersectedObjectPoints[0];
                            obj.end = intersectedObjectPoints[intersectedObjectPoints.length - 1];
                            obj.shapeUniqueCode = shapeCode;
                            obj.isOddShape = true;
                            obj.isRemovingOddShape = false;
                            validPoints.push( obj );
                        }
                    }
                }
            }
            return validPoints;
        },

        /**
        * Checks whether points invalid or not.
        *
        * @method checkForInInvalidPointsForNormalShape
        * @public
        */
        checkForInInvalidPointsForNormalShape: function checkForInInvalidPointsForNormalShape( intersectedObjectPoints, shapeCode, shapeObject ) {
            var boundaryPointsArray = this.model.getBoundaryPointOfShape( shapeCode ),
                validPoints = [];

            for ( var i = 0; i < intersectedObjectPoints.length - 1; i++ ) {
                var start = boundaryPointsArray.indexOf( intersectedObjectPoints[i] ),
                    end = boundaryPointsArray.indexOf( intersectedObjectPoints[i + 1] );

                if ( end < start ) {
                    var temp = start;
                    start = end;
                    end = temp;
                }

                if ( start === end ) continue;
                if ( ( start + 1 ) === end ) continue;
                if ( start === 0 ) {
                    if ( boundaryPointsArray.length - 1 === end ) continue;
                }
                else if ( start > 0 ) {
                    if ( ( start - 1 ) === end ) continue;
                }

                var startVal = intersectedObjectPoints[i],
                    endVal = intersectedObjectPoints[i + 1];
                if ( !this.checkAllPointsOnCutLine( startVal, endVal, shapeObject, boundaryPointsArray ) ) {
                    continue;
                }

                //var startVal = intersectedObjectPoints[i],
                //    endVal = intersectedObjectPoints[i + 1],
                //    x1 = this.gridPoints[startVal].x,
                //    y1 = this.gridPoints[startVal].y,
                //    x3 = this.gridPoints[endVal].x,
                //    y3 = this.gridPoints[endVal].y,
                //    subX = x1 - x3,
                //    subY = y1 - y3,
                //    onlinePointsArray = [],
                //    x2,
                //    y2;

                //onlinePointsArray = this.modelNamespace.getOnlinePoint( x1, x2, x3, y1, y2, y3, subX, subY, this.gridPoints );

                //if ( onlinePointsArray.length > 0 ) {
                //    var index = boundaryPointsArray.indexOf( onlinePointsArray[0] );
                //    if ( index !== -1 ) {
                //        continue;
                //    }
                //    else {
                //        var boolVal = this.checkForPointInsideCurrentShape( this.gridPoints[onlinePointsArray[0]], boundaryPointsArray );
                //        if ( !boolVal ) {
                //            continue;
                //        }
                //    }
                //}
                //else {
                //    if ( !this.checkAllPointsOnCutLine( startVal, endVal, shapeObject, boundaryPointsArray ) ) {
                //        continue;
                //    }
                //}
                var obj = {};
                obj.start = intersectedObjectPoints[i];
                obj.end = intersectedObjectPoints[i + 1];
                obj.shapeUniqueCode = shapeCode;
                obj.isOddShape = false;
                validPoints.push( obj );
            }
            return validPoints;
        },

        /**
        * Checks whether point on line are getting outside or not.
        * @method checkAllPointsOnCutLine
        * @private
        */
        checkAllPointsOnCutLine: function checkAllPointsOnCutLine( startVal, endVal, shapeObject, boundaryPointsArray ) {
            var newLinePath = new this.workCanvasScope.Path(),
                intersectionPoints = [];
            newLinePath.add( this.gridPoints[startVal] );
            newLinePath.add( this.gridPoints[endVal] );
            intersectionPoints = newLinePath.getIntersections( shapeObject );
            newLinePath.remove();

            if ( intersectionPoints.length > 0 ) {
                for ( var i = 0; i < intersectionPoints.length - 1; i++ ) {
                    var pt = new this.workCanvasScope.Point(( intersectionPoints[i].point.x + intersectionPoints[i + 1].point.x ) / 2, ( intersectionPoints[i].point.y + intersectionPoints[i + 1].point.y ) / 2 );
                    if ( this.modelNamespace.isPointOnPath( pt, shapeObject ) ) {
                        return false;
                    }
                    if ( !this.modelNamespace.isPointInsideShape( shapeObject, pt, true ) ) {
                        return false;
                    }
                }
            }
            else {
                var pt = new this.workCanvasScope.Point(( this.gridPoints[startVal].x + this.gridPoints[endVal].x ) / 2, ( this.gridPoints[startVal].y + this.gridPoints[endVal].y ) / 2 );
                if ( this.modelNamespace.isPointOnPath( pt, shapeObject ) ) {
                    return false;
                }
                if ( !this.modelNamespace.isPointInsideShape( shapeObject, pt, true ) ) {
                    return false;
                }
            }
            return true;
        },

        /**
        * Checks whether point is inside polygon or not.
        * @method _checkForPointInsideCurrentShape
        * @private
        */
        checkForPointInsideCurrentShape: function checkForPointInsideCurrentShape( pt, shapeCoordinateArray ) {
            for ( var c = false, i = -1, l = shapeCoordinateArray.length, j = l - 1; ++i < l; j = i )
                ( ( this.gridPoints[shapeCoordinateArray[i]].y <= pt.y && pt.y < this.gridPoints[shapeCoordinateArray[j]].y ) || ( this.gridPoints[shapeCoordinateArray[j]].y <= pt.y && pt.y < this.gridPoints[shapeCoordinateArray[i]].y ) )
                    && ( pt.x < ( this.gridPoints[shapeCoordinateArray[j]].x - this.gridPoints[shapeCoordinateArray[i]].x ) * ( pt.y - this.gridPoints[shapeCoordinateArray[i]].y ) / ( this.gridPoints[shapeCoordinateArray[j]].y - this.gridPoints[shapeCoordinateArray[i]].y ) + this.gridPoints[shapeCoordinateArray[i]].x )
                    && ( c = !c );
            return c;
        },

        /**
        * Checks whether point is inside polygon or not.
        * @method checkForPointInsideCurrentShapeUsingSegments
        * @private
        */
        checkForPointInsideCurrentShapeUsingSegments: function checkForPointInsideCurrentShapeUsingSegments( pt, shapeSegments ) {
            for ( var c = false, i = -1, l = shapeSegments.length, j = l - 1; ++i < l; j = i )
                ( ( shapeSegments[i].point.y <= pt.y && pt.y < shapeSegments[j].point.y ) || ( shapeSegments[j].point.y <= pt.y && pt.y < shapeSegments[i].point.y ) )
                    && ( pt.x < ( shapeSegments[j].point.x - shapeSegments[i].point.x ) * ( pt.y - shapeSegments[i].point.y ) / ( shapeSegments[j].point.y - shapeSegments[i].point.y ) + shapeSegments[i].point.x )
                    && ( c = !c );
            return c;
        },
        /*************************************End With Cut Line Handle event*************************************/

        /**
        * Unbinds Paper Events
        *
        * @method unbindPaperEvents
        **/
        unbindPaperEvents: function unbindPaperEvents( object ) {
            object.off( 'mousedown' );
            object.off( 'mouseup' );
            object.off( 'mousedrag' );
            object.off( 'mouseenter' );
            object.off( 'mouseleave' );
        }

    } );
} )();
