( function () {
    'use strict';

    /**
    * Class for CanvasAccessibility, contains properties and methods of CanvasAccessibility
    * @class CanvasAccessibility
    * @module ShapeDecomposition
    * @namespace  MathInteractives.Common.Interactivities.ShapeDecomposition.Views
    * @extends  MathInteractives.Common.Interactivities.ShapeDecomposition.Views.ButtonClicks
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.ShapeDecomposition.Views.CanvasAccessibility = MathInteractives.Common.Interactivities.ShapeDecomposition.Views.ButtonClicks.extend( {

        canvasAcc: null,
        prevDataItemEvent: null,
        prevCoordinate: null,
        leftPos: 0,
        topPos: 0,
        selectedShapeCode: null,

        /**
        * @class CheckFunctions
        * @constructor
        **/
        initialize: function () {
            //this.listenTo( this.model, this.modelNameSpace.EVENTS.POLYGON_COMPLETE, this._unBindAccessibilityListenersForPolygonMake );
            //this.listenTo( this.model, this.modelNameSpace.EVENTS.DONE_CLICK_FOR_ACC, this._unbindAccessibilityListenersForPolygonDrag );
            //this.listenTo( this.model, this.modelNameSpace.EVENTS.DONE_CUTTING_CLICK_FOR_ACC, this._unBindAccessibilityListenersForPolygonDivide );
            //this.listenTo( this.model, this.modelNameSpace.EVENTS.CHANGE_CUT_CLICK_FOR_ACC, this._unBindAccessibilityListenersForPolygonEstimate );
            //this.listenTo( this.model, this.modelNameSpace.EVENTS.CHANGE_CUT_CLICK_FOR_ACC, this._initAccessibilityForPolygonMake );
            //this.listenTo( this.model, this.modelNameSpace.EVENTS.CHANGE_CUT_CLICK_FOR_ACC, this._bindAccessibilityListenersForPolygonDivide );
            //this.listenTo( this.model, this.modelNameSpace.EVENTS.UNDO_CLICK_POLYGON_CREATE_FOR_ACC, this.updatePositionOfObjects );
            //this.listenTo( this.model, this.modelNameSpace.EVENTS.SHIFT_STATE, this.shiftStates );


            //this.listenTo( this.model, this.modelNameSpace.EVENTS.TRY_ANOTHER_CLICK, this._unbinAllAccEvents );

            this._superwrapper( 'initialize', this );
            //this.initializeDefaultProperties();
        },

        loadAccessibility: function loadAccessibility() {
            this._initAccessibilityForSelectShape();
            this.bindAccessibilityListenersForSelectShape();
            var self = this;
            //$( '#' + this.idPrefix + 'polygon-canvas' ).on( 'click', function () {
            //    self.setFocus( 'polygon-composer-canvas-sibling-container' );
            //} );
        },

        /**
        * Initializes accessibility
        *
        * @method _initAccessibilityForPolygonMake
        * @private
        */
        _initAccessibilityForSelectShape: function () {
            if(this.canvasAcc === null){
                var canvasAccOption = {
                    canvasHolderID: this.idPrefix + 'left-panel-canvas-acc-container',
                    paperItems: [],
                    type: MathInteractives.Common.Player.Models.CanvasAcc.TYPE.NAVIGATE_LINE,
                    paperScope: this.workCanvasScope,
                    manager: this.manager,
                    player: this.player
                };
                this.canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc( canvasAccOption );
            }
        },

        /**
        * bind listeners to accessibility
        *
        * @method _bindAccessibilityListeners
        * @private
        */
        bindAccessibilityListenersForSelectShape: function () {
            this.canvasAcc.updatePaperItems( this.getPaperObjectsForSelectShape() );

            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $( '#' + this.idPrefix + 'left-panel-canvas-acc-container' ),
                self = this;

            $canvasHolder.off( keyEvents.TAB ).on( keyEvents.TAB, $.proxy( this.tabClickForSelectShape, this ) );
            $canvasHolder.off( keyEvents.SPACE ).on( keyEvents.SPACE, $.proxy( this.spaceClickForSelectShape, this ) );
            $canvasHolder.off( canvasEvents.FOCUS_OUT ).on( canvasEvents.FOCUS_OUT, $.proxy( this.focusOutForSelectShape, this ) );
        },

        /**
       * Gets all current paper objects on canvas
       *
       * @method getPaperObjects
       * @param {boolean} [isAngleSelectionMode] angle is in seleted mode or not
       * return {Array} [paperObj] array of paper objects
       **/
        getPaperObjectsForSelectShape: function () {
            var paperObj = [];
            for ( var i = 0; i < 5; i++ ) {
                paperObj.push( this.shapeGroup.children[i] );
            }
            paperObj.push( this.shapeGroup.children[7] );
            paperObj.push( this.shapeGroup.children[5] );
            paperObj.push( this.shapeGroup.children[6] );
            return paperObj;
        },

        /**
        * Calls When space click on canvas
        *
        * @method spaceClickForSelectShape
        * @private
        */
        spaceClickForSelectShape: function spaceClickForSelectShape( event, data ) {
            event.target = data.item;
            this.onMouseDownOnDefaultShapes( event );
        },

        /**
        * calls when tab clicks on paper objects
        *
        * @method tabClickForSelectShape
        * @private
        */
        tabClickForSelectShape: function tabClickForSelectShape( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.onMouseLeaveOnDefaultShapes( this.prevDataItemEvent );
                this.prevDataItemEvent = null;
            }
            event.target = data.item;
            this.prevDataItemEvent = event;
            this.onMouseEnterOnDefaultShapes( event );
        },

        /**
        * Calls When focus out from canvas
        *
        * @method focusOutForPolygonMake
        * @private
        */
        focusOutForSelectShape: function focusOutForSelectShape( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.onMouseLeaveOnDefaultShapes( this.prevDataItemEvent );
                if ( this.selectedShapeCode ) {
                    this.changeAccMessage( 'left-panel-canvas-acc-container', 1, [this.selectedShapeCode] );
                }
                else {
                    this.changeAccMessage( 'left-panel-canvas-acc-container', 0 );
                }
                this.prevDataItemEvent = null;
                this.workCanvasScope.view.draw();
            }
        },

        /**
        * unbind listeners to accessibility
        *
        * @method unBindAccessibilityListeners
        * @private
        */
        unBindAccessibilityListeners: function () {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $( '#' + this.idPrefix + 'left-panel-canvas-acc-container' ),
                self = this;
            $canvasHolder.off( keyEvents.TAB );
            $canvasHolder.off( keyEvents.SPACE );
            $canvasHolder.off( canvasEvents.FOCUS_OUT );
            $canvasHolder.off( keyEvents.ARROW );
            this.prevDataItemEvent = null;
        },

        /**
        * bind listeners to accessibility
        *
        * @method _bindAccessibilityListeners
        * @private
        */
        bindAccessibilityListenersForShapeResize: function () {
            this.unBindAccessibilityListeners();

            this.canvasAcc.updatePaperItems( this.getPaperObjectsForShapeResize() );
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $( '#' + this.idPrefix + 'left-panel-canvas-acc-container' ),
                self = this;
            //// Handle tab
            $canvasHolder.off( keyEvents.TAB ).on( keyEvents.TAB, $.proxy( this.tabClickForShapeResize, this ) );
            $canvasHolder.off( canvasEvents.FOCUS_OUT ).on( canvasEvents.FOCUS_OUT, $.proxy( this.focusOutForShapeResize, this ) );
            $canvasHolder.off( keyEvents.ARROW ).on( keyEvents.ARROW, $.proxy( this.arrowKeyPressedForShapeResize, this ) );
        },

        /**
        * Gets all current paper objects on canvas
        *
        * @method getPaperObjectsForShapeResize
        **/
        getPaperObjectsForShapeResize: function () {
            var paperObj = [];
            for ( var i = 0; i < this.handleGroup.children.length; i++ ) {
                paperObj.push( this.handleGroup.children[i] );
            }
            return paperObj;
        },

        /**
        * Calls When tab click on polygon drag
        *
        * @method tabClickForShapeResize
        * @private
        */
        tabClickForShapeResize: function tabClickForShapeResize( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.onMouseLeaveOnHandle( this.prevDataItemEvent );
                this.prevDataItemEvent.point = this.prevDataItemEvent.target.position.clone();
                this.onMouseUpOnHandle( this.prevDataItemEvent );
                this.prevDataItemEvent = null;
            }
            event.target = data.item;
            event.point = event.target.position.clone();
            this.onMouseDownOnHandle( event );
            this.prevDataItemEvent = event;
            this.onMouseEnterOnHandle( event );
            this.focusRect.position = event.target.position;
            this.focusRect.visible = true;
            this.workCanvasScope.view.draw();
        },

        /**
        * Calls When leaves canvas
        *
        * @method focusOutForShapeResize
        * @private
        */
        focusOutForShapeResize: function focusOutForShapeResize( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.onMouseLeaveOnHandle( this.prevDataItemEvent );
                this.prevDataItemEvent.point = this.prevDataItemEvent.target.position.clone();
                this.onMouseUpOnHandle( this.prevDataItemEvent );
                this.prevDataItemEvent = null;
                this.focusRect.visible = false;
                this.workCanvasScope.view.draw();
                this.changeAccMessage( 'left-panel-canvas-acc-container', 5, [this.handleGroup.children.length] );
            }
        },

        /**
        * Calls When arrow key pressed while moving object
        *
        * @method arrowKeyPressedForShapeResize
        * @private
        */
        arrowKeyPressedForShapeResize: function arrowKeyPressedForShapeResize( event, data ) {
            var bool = true, msgId, callfrom = 'canvasAcc', bool1 = true;
            event = $.extend( true, {}, this.prevDataItemEvent );
            event.point = event.target.position.clone();
            if ( data.directionX === -1 ) { event.point.x -= 24; this.changeAccMessage( 'left-panel-canvas-acc-container', 7, [event.target.handleNumber, this.getAccMessage( 'left-panel-canvas-acc-container', 'vertexText') + ' ' + this.getAccMessage( 'left-panel-canvas-acc-container', 'leftText' )] ); }
            if ( data.directionX === 1 ) { event.point.x += 24; this.changeAccMessage( 'left-panel-canvas-acc-container', 7, [event.target.handleNumber, this.getAccMessage( 'left-panel-canvas-acc-container', 'vertexText') + ' ' + this.getAccMessage( 'left-panel-canvas-acc-container', 'rightText' )] ); }
            if ( data.directionY === -1 ) { event.point.y -= 24; this.changeAccMessage( 'left-panel-canvas-acc-container', 7, [event.target.handleNumber, this.getAccMessage( 'left-panel-canvas-acc-container', 'upText' )] ); }
            if ( data.directionY === 1 ) { event.point.y += 24; this.changeAccMessage( 'left-panel-canvas-acc-container', 7, [event.target.handleNumber, this.getAccMessage( 'left-panel-canvas-acc-container', 'downText' )] ); }
            this.onMouseDragOnHandle( event );
            this.focusRect.position = event.target.position;
            this.workCanvasScope.view.draw();
        },

        /**
        * bind listeners to accessibility
        *
        * @method bindAccessibilityListenersForShapeMovement
        * @private
        */
        bindAccessibilityListenersForShapeMovement: function () {
            this.unBindAccessibilityListeners();

            this.canvasAcc.updatePaperItems( this.getPaperObjectsForShapeMovement() );
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $( '#' + this.idPrefix + 'left-panel-canvas-acc-container' ),
                self = this;
            //// Handle tab
            $canvasHolder.off( keyEvents.TAB ).on( keyEvents.TAB, $.proxy( this.tabClickForShapeMovement, this ) );
            $canvasHolder.off( keyEvents.SPACE ).on( keyEvents.SPACE, $.proxy( this.spaceClickForShapeMovement, this ) );
            $canvasHolder.off( canvasEvents.FOCUS_OUT ).on( canvasEvents.FOCUS_OUT, $.proxy( this.focusOutForShapeMovement, this ) );
            $canvasHolder.off( keyEvents.ARROW ).on( keyEvents.ARROW, $.proxy( this.arrowKeyPressedForShapeMovement, this ) );
        },

        /**
        * Gets all current paper objects on canvas
        *
        * @method getPaperObjectsForShapeMovement
        **/
        getPaperObjectsForShapeMovement: function ( callFor ) {
            var paperObj = [];
            for ( var i = 0; i < this.canvasShapes.length; i++ ) {
                paperObj.push( this.canvasShapes[i] );
            }
            return paperObj;
        },

        /**
        * Calls When tab click on polygon drag
        *
        * @method tabClickForShapeMovement
        * @private
        */
        tabClickForShapeMovement: function tabClickForShapeMovement( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.onMouseLeaveOnNewShapes( this.prevDataItemEvent, this.prevDataItemEvent.target );
                this.prevDataItemEvent.point = this.prevDataItemEvent.target.position.clone();
                //this.deSelectNewShape();
                this.prevDataItemEvent = null;
            }
            event.target = data.item;
            event.point = event.target.position.clone();
            this.prevDataItemEvent = event;
            var self = this;
            this.onMouseEnterOnNewShapes( event, event.target );
            if ( event.target.isOriginal ) {
                setTimeout(function(){
                    ( event.target.isSelected ) ? self.changeAccMessage( 'left-panel-canvas-acc-container', 11, [event.target.accNumber] ) : self.changeAccMessage( 'left-panel-canvas-acc-container', 10, [event.target.accNumber] );
                },0);
            }
            else {
                setTimeout(function(){
                    ( event.target.isSelected ) ? self.changeAccMessage( 'left-panel-canvas-acc-container', 23, [event.target.accNumber] ) : self.changeAccMessage( 'left-panel-canvas-acc-container', 22, [event.target.accNumber] );
                },0);
            }

        },

        /**
        * Calls When space is clicked on shape
        *
        * @method spaceClickForShapeMovement
        * @private
        */
        spaceClickForShapeMovement: function spaceClickForShapeMovement( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.deSelectNewShape();
            }
            event.target = data.item;
            event.point = event.target.position.clone();
            this.onMouseDownOnNewShapes( event, null, event.target );
            if ( event.target.isOriginal ) {
                ( event.target.isSelected ) ? this.changeAccMessage( 'left-panel-canvas-acc-container', 11, [event.target.accNumber] ) : this.changeAccMessage( 'left-panel-canvas-acc-container', 10, [event.target.accNumber] );
            }
            else {
                ( event.target.isSelected ) ? this.changeAccMessage( 'left-panel-canvas-acc-container', 23, [event.target.accNumber] ) : this.changeAccMessage( 'left-panel-canvas-acc-container', 22, [event.target.accNumber] );
            }
        },

        /**
        * Calls When leaves canvas
        *
        * @method focusOutForShapeMovement
        * @private
        */
        focusOutForShapeMovement: function focusOutForShapeMovement( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.onMouseLeaveOnNewShapes( this.prevDataItemEvent, this.prevDataItemEvent.target );
                this.prevDataItemEvent.point = this.prevDataItemEvent.target.position.clone();
                //this.onMouseUpOnHandle( this.prevDataItemEvent );
                this.prevDataItemEvent = null;
                this.workCanvasScope.view.draw();
            }
            var text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapeText' ),
                text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'isText' );
            if ( this.canvasShapes.length > 1 ) {
                text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapesText' ),
                    text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'areText' );
            }
            this.changeAccMessage( 'left-panel-canvas-acc-container', 9, [text1, text2] );
        },

        /**
        * Calls When arrow key pressed while moving object
        *
        * @method arrowKeyPressedForShapeMovement
        * @private
        */
        arrowKeyPressedForShapeMovement: function arrowKeyPressedForShapeMovement( event, data ) {
            var bool = true, msgId, callfrom = 'canvasAcc', bool1 = true, myPt;
            event = $.extend( true, {}, this.prevDataItemEvent );
            event.point = event.target.position.clone();
            myPt = event.target.position.clone();
            event.event = {};
            event.event.which = 1;
            this.currentEvent = this.selectedShapeEvent;
            this.onMouseDownOnNewShapes( event, null, this.prevDataItemEvent.target );
            if ( data.directionX === -1 ) { myPt.x -= 18; this.changeAccMessage( 'left-panel-canvas-acc-container', 21, [this.getAccMessage( 'left-panel-canvas-acc-container', 'leftText' )] ); }
            if ( data.directionX === 1 ) { myPt.x += 18; this.changeAccMessage( 'left-panel-canvas-acc-container', 21, [this.getAccMessage( 'left-panel-canvas-acc-container', 'rightText' )] ); }
            if ( data.directionY === -1 ) { myPt.y -= 24; this.changeAccMessage( 'left-panel-canvas-acc-container', 21, [this.getAccMessage( 'left-panel-canvas-acc-container', 'upText' )] ); }
            if ( data.directionY === 1 ) { myPt.y += 24; this.changeAccMessage( 'left-panel-canvas-acc-container', 21, [this.getAccMessage( 'left-panel-canvas-acc-container', 'downText' )] ); }
            event.point = myPt;
            this.onMouseDragOnNewShapes( event, event.target );
            this.currentEvent = null;
            this.deSelectNewShape();
        },

        /**
        * bind listeners to accessibility
        *
        * @method bindAccessibilityListenersForCutLine
        * @private
        */
        bindAccessibilityListenersForCutLine: function () {
            this.unBindAccessibilityListeners();

            this.canvasAcc.updatePaperItems( this.getPaperObjectsForCutLine() );
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $( '#' + this.idPrefix + 'left-panel-canvas-acc-container' ),
                self = this;
            //// Handle tab
            $canvasHolder.off( keyEvents.TAB ).on( keyEvents.TAB, $.proxy( this.tabClickForCutLine, this ) );
            $canvasHolder.off( canvasEvents.FOCUS_OUT ).on( canvasEvents.FOCUS_OUT, $.proxy( this.focusOutForCutLine, this ) );
            $canvasHolder.off( keyEvents.ARROW ).on( keyEvents.ARROW, $.proxy( this.arrowKeyPressedForCutLine, this ) );
        },

        /**
        * Gets all current paper objects on canvas
        *
        * @method getPaperObjectsForCutLine
        **/
        getPaperObjectsForCutLine: function () {
            var paperObj = [];
            for ( var i = 0; i < this.cutLineHandleGroup.children.length; i++ ) {
                paperObj.push( this.cutLineHandleGroup.children[i] );
            }
            return paperObj;
        },

        /**
        * Calls When tab click on polygon drag
        *
        * @method tabClickForCutLine
        * @private
        */
        tabClickForCutLine: function tabClickForCutLine( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.onMouseLeaveOnCutLineHandle( this.prevDataItemEvent );
                this.prevDataItemEvent.point = this.prevDataItemEvent.target.position.clone();
                // this.onMouseUpOnHandle( this.prevDataItemEvent );
                this.prevDataItemEvent = null;
            }
            event.target = data.item;
            event.point = event.target.position.clone();
            //this.onMouseDownOnHandle( event );
            this.prevDataItemEvent = event;
            this.onMouseEnterOnCutLineHandle( event );
            this.focusRect.position = event.target.position;
            this.focusRect.visible = true;
            this.workCanvasScope.view.draw();
            var text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'firstText' );
            if ( event.target.handleCode === 'b' ) {
                text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'secondText' );
            }
            this.changeAccMessage( 'left-panel-canvas-acc-container', 13, [text1] );
        },

        /**
        * Calls When leaves canvas
        *
        * @method focusOutForCutLine
        * @private
        */
        focusOutForCutLine: function focusOutForCutLine( event, data ) {
            if ( this.prevDataItemEvent ) {
                this.onMouseLeaveOnCutLineHandle( this.prevDataItemEvent );
                this.prevDataItemEvent.point = this.prevDataItemEvent.target.position.clone();
                // this.onMouseUpOnHandle( this.prevDataItemEvent );
                this.prevDataItemEvent = null;
                this.workCanvasScope.view.draw();
                if ( this.selectedShape ) {
                    this.setFocus( 'rotate-button-container' );
                }
                else {
                    this.setFocus( 'left-panel-canvas-acc-container' );
                }
                this.focusRect.visible = false;
                this.workCanvasScope.view.draw();
                // this.changeAccMessage( 'left-panel-canvas-acc-container', 5, [this.handleGroup.children.length] );
            }
            if ( this.validCutPointsObjects ) {
                if ( this.validCutPointsObjects.length === 0 ) {
                    this.enableTab( 'cut-line-button', false );
                }
                else {
                    this.enableTab( 'cut-line-button', true );
                }
            }
        },

        /**
        * Calls When arrow key pressed while moving object
        *
        * @method arrowKeyPressedForCutLine
        * @private
        */
        arrowKeyPressedForCutLine: function arrowKeyPressedForCutLine( event, data ) {
            var bool = true, msgId, callfrom = 'canvasAcc', bool1 = true;
            event = $.extend( true, {}, this.prevDataItemEvent );
            event.point = event.target.position.clone();
            if ( data.directionX === -1 ) { event.point.x -= 24; }// this.changeAccMessage( 'left-panel-canvas-acc-container', 7, [event.target.handleNumber, this.getAccMessage( 'left-panel-canvas-acc-container', 'leftText' )] ); }
            if ( data.directionX === 1 ) { event.point.x += 24; }//this.changeAccMessage( 'left-panel-canvas-acc-container', 7, [event.target.handleNumber, this.getAccMessage( 'left-panel-canvas-acc-container', 'rightText' )] ); }
            if ( data.directionY === -1 ) { event.point.y -= 24; }// this.changeAccMessage( 'left-panel-canvas-acc-container', 7, [event.target.handleNumber, this.getAccMessage( 'left-panel-canvas-acc-container', 'upText' )] ); }
            if ( data.directionY === 1 ) { event.point.y += 24; }//this.changeAccMessage( 'left-panel-canvas-acc-container', 7, [event.target.handleNumber, this.getAccMessage( 'left-panel-canvas-acc-container', 'downText' )] ); }
            event.data = {};
            event.data.directionData = data;
            this.onMouseDragOnCutLineHandle( event, this.prevDataItemEvent.target.position.clone() );
            this.onMouseUpOnCutLineHandle( event );
            this.focusRect.position = event.target.position;
            this.workCanvasScope.view.draw();
        }
    },
    {
    } )
} )()
