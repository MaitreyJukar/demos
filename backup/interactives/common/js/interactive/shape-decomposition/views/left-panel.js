( function () {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*
	* @class ExploreClass
	* @namespace MathInteractives.Common.Interactivities.ShapeDecomposition.Views
    * @extends MathInteractives.Common.Player.Views.Base
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeDecomposition.Views.LeftPanel = MathInteractives.Common.Player.Views.Base.extend( {
        /**
        * Stores all points of grid
        * @property gridPoints
        * @type array
        * @default null
        **/
        gridPoints: null,
        /**
        * Holds scope of grid canvas
        * @property gridCanvasScope
        * @type Object
        * @default null
        **/
        gridCanvasScope: null,
        /**
        * Holds scope of work canvas
        * @property workCanvasScope
        * @type Object
        * @default null
        **/
        workCanvasScope: null,
        /**
        * Holds group of all shapes
        * @property shapeGroup
        * @type Object
        * @default null
        **/
        shapeGroup: null,
        /**
        * Holds group of draggable handles of cut line
        * @property cutLineHandleGroup
        * @type Object
        * @default null
        **/
        cutLineHandleGroup: null,
        /**
        * Holds group of elements to draw screen
        * @property screenGroup
        * @type Object
        * @default null
        **/
        screenGroup: null,
        /**
        * Holds group of unit label
        * @property unitLabelGroup
        * @type Object
        * @default null
        **/
        unitLabelGroup: null,
        /**
        * holds object of dotted cut line
        * @property dottedCutLine
        * @type Object
        * @default null
        **/
        dottedCutLine: null,
        /**
        * Holds group of handles of shape.
        * @property handleGroup
        * @type Object
        * @default null
        **/
        handleGroup: null,
        /**
        * Holds tool object of canvas
        * @property paperTool
        * @type Object
        * @default null
        **/
        paperTool: null,
        /**
        * Holds current event
        * @property currentEvent
        * @type Object
        * @default null
        **/
        currentEvent: null,
        /**
        * selected shape event
        * @property selectedShapeEvent
        * @type Object
        * @default null
        **/
        selectedShapeEvent: null,
        /**
        * Holds selected shape object
        * @property selectedShape
        * @type Object
        * @default null
        **/
        selectedShape: null,
        /**
        * Holds mouse down point
        * @property mouseDownPoint
        * @type Object
        * @default null
        **/
        mouseDownPoint: null,
        /**
        * dependend horizontal vertices object array.
        * @property currentX
        * @type array
        * @default null
        **/
        currentX: null,
        /**
        * dependend vertical vertices object array.
        * @property currentY
        * @type array
        * @default null
        **/
        currentY: null,
        /**
        * dependend segaments required while resizing shape
        * @property dependendSegment
        * @type array
        * @default null
        **/
        dependendSegment: null,
        /**
        * Stores all canvas shapes. Shapes Are changing all time when  any action is performed like cut copy etc.
        * @property canvasShapes
        * @type array
        * @default null
        **/
        canvasShapes: null,
        /**
        * This number is uniquly assigned to each shape when it will generate fro cut/copy/reflect etc.
        * @property uniqueNumber
        * @type number
        * @default null
        **/
        uniqueNumber: null,
        /**
        * This tells that is shape dragged or not. true if dragged,and false if not.
        * @property isShapeDragged
        * @type bool
        * @default null
        **/
        isShapeDragged: null,
        /**
        * stores cut point objects.
        * @property validCutPointsObjects
        * @type array
        * @default null
        **/
        validCutPointsObjects: null,
        /**
        * stores object of shapes which are currently going to cut.
        * @property validCutshapes
        * @type array
        * @default null
        **/
        validCutshapes: null,
        /**
        * stores paper object of rectangle which is always on back side of cut button.
        * @property dummyRectangleOfCutButton
        * @type object
        * @default null
        **/
        dummyRectangleOfCutButton: null,
        /**
        * holds all object of tooltips
        * @property shapesTooltipViews
        * @type Object
        * @default null
        **/
        shapesTooltipViews: null,
        /**
        * Holds model namespace
        * @property modelNamespace
        * @type Object
        * @default null
        **/
        modelNamespace: MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData,
        /**
        * Holds utility view namespace
        * @property utilityNamespace
        * @type Object
        * @default null
        **/
        utilityNamespace: MathInteractives.Common.Interactivities.ShapeDecomposition.Views.UtilityFunctions,

        /**
        * A list of paper objects that point to shape's label at index shape's unique code.
        *
        * @property _shapeLabels
        * @type Object
        * @default null
        * @private
        */
        _shapeLabels: null,

        /**
        * A jquery reference for DIV used to calculate the tooltip content's dimensions.
        *
        * @property _$tempTooltipContentHolder
        * @type Object
        * @default null
        * @private
        */
        _$tempTooltipContentHolder: null,

        /**
        * A boolean indicating if the shape's labels need to be removed on shape's drag.
        *
        * @property isRemoveLabelRequired
        * @type Boolean
        * @default false
        */
        isRemoveLabelRequired: false,
        /**
        * A boolean indicating if current shape is intersecting cut line or not while dragging.
        *
        * @property isCurrentShapeIntersecting
        * @type Boolean
        * @default false
        */
        isCurrentShapeIntersecting: null,
        /**
        * Stores paper object of focus rect
        *
        * @property focusRect
        * @type Object
        * @default false
        */
        focusRect: null,
        /**
        * Initialises Explore Class
        *
        * @method initialize
        **/
        initialize: function () {
            this.initializeDefaultProperties();
            this.initializeVariables();
            this.loadCanvas();
            this.render();
            this._bindEvents();
        },

        /**
        * Initialises all varriables with default value
        *
        * @method initializeVariables
        **/
        initializeVariables: function initializeVariables() {
            this.gridPoints = [];
            this.currentX = [];
            this.currentY = [];
            this.dependendSegment = [];
            this.canvasShapes = [];
            this.shapesTooltipViews = {};
            this.uniqueNumber = 0;
            this.isShapeDragged = false;
            this._shapeLabels = {};
            this._$tempTooltipContentHolder = this.$( '.temporary-tooltip-content-holder' );
        },

        /**
        * Renders the view of explore tab
        * @method render
        * @public
        **/
        render: function render() {
            var startX = this.modelNamespace.GRID_START_X, startY = this.modelNamespace.GRID_START_Y,
                gapBetweenPoints = this.modelNamespace.GAP_BETWEEN_POINTS,
                numberOfPointsX = this.modelNamespace.NUMBER_OF_X_POINTS,
                numberOfPointsY = this.modelNamespace.NUMBER_OF_Y_POINTS,
                event = null,
                actionEnum = this.modelNamespace.ACTION_ENUM,
                eventsEnum = this.modelNamespace.EVENTS;
            this.generateGrid( startX, startY, gapBetweenPoints, numberOfPointsX, numberOfPointsY );
            //Removing grid scope and activating work scope
            this.gridCanvasScope.remove();

            this.activateWorkCanvasScope();

            //Creating Tool Event
            this.paperTool = new this.workCanvasScope.Tool();
            //Creating Group Of Shapes
            this.shapeGroup = new this.workCanvasScope.Group();
            this.screenGroup = new this.workCanvasScope.Group();
            // Storing color objects for shapes in model
            this.setDefaultShapeColor();
            this.setCopiedShapeColor();

            this.drawSelectedShapeWindow();
            this._drawUnitScaleLabel();
            this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.CUT_LINE, true );
            if ( this.model.get( 'type' ) === 2 ) {
                this._renderShapes();
                this._bindShapeEvent();
                this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.NEXT, true );
//                this.player.enableHelpElement( 'work-canvas', 1, false );
            }
            else {
                event = {};
                event.target = {};
                event.target.shapeUniqueCode = 9;
                this.selectedShapeEvent = event;
                this.onDoneButtonClick();
//                this.player.enableHelpElement( 'work-canvas', 0, false );
            }
            this.$( '.left-panel-buttons-container' ).hide();
            this.listenTo( this.model, eventsEnum.TRY_ANOTHER_CLICK, this._resetInteractivity );
            this.listenTo( this.model, eventsEnum.DONE_BUTTON_CLICK, this.onDoneButtonClick );
            this.listenTo( this.model, eventsEnum.NEXT_BUTTON_CLICK, this.onNextButtonClick );
            this.listenTo( this.model, eventsEnum.CHECK_BUTTON_CLICK, this.onCheckButtonClick );
            this.listenTo( this.model, eventsEnum.CHANGE_SHAPE_BORDER_COLOR, this._onShapeBorderColorChangeRequired );
            this.listenTo( this.model, eventsEnum.ADD_REMOVE_SHAPE_LABEL, this._addRemoveShapeLabel );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.UNDO, true );
            //this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.TRY_ANOTHER, true );
            this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.CHECK, true );

            this.player.enableHelpElement( 'actual-shape-table-wrapper', 3, false );
//            this.player.enableHelpElement( 'work-canvas', 4, false );

            this.correctLabelIcon = new this.workCanvasScope.Raster( this.modelNamespace.LABEL_URL.CORRECT, { x: -20, y: -20 } );
            this.incorrectLabelIcon = new this.workCanvasScope.Raster( this.modelNamespace.LABEL_URL.INCORRECT, { x: -20, y: -20 } );
            this.loadScreen( 'buttons-screen' );
            if ( this.model.get( 'type' ) === 2 ) {
                this.loadAccessibility();
                this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.DONE, true );
            }
            this.focusRect = new this.workCanvasScope.Path.RegularPolygon( new this.workCanvasScope.Point( 100, 100 ), 4, 30 );
            this.focusRect.strokeColor = 'black';
            this.focusRect.strokeWidth = 1;
            this.focusRect.dashArray = [2, 2];
            this.focusRect.visible = false;
        },

        /**
       * Loads canvas.
       *
       * @method loadCanvas
       * @public
       */
        loadCanvas: function loadCanvas() {
            paper.install( this );
            //Contains Background static part of canvas
            var gridCanvasScope = new paper.PaperScope();
            gridCanvasScope.setup( this.$el.find( '#' + this.idPrefix + 'grid-canvas' )[0] );
            this.gridCanvasScope = gridCanvasScope;
            this.gridCanvasScope.activate();

            //working canvas
            var workCanvasScope = new paper.PaperScope();
            workCanvasScope.setup( this.$el.find( '#' + this.idPrefix + 'work-canvas' )[0] );
            this.workCanvasScope = workCanvasScope;
        },

        /**
        * Activates the work area canvas' paper-scope.
        *
        * @method activateWorkCanvasScope
        * @public
        */
        activateWorkCanvasScope: function activateWorkCanvasScope() {
            if ( this.workCanvasScope ) {
                this.workCanvasScope.activate();
            }
        },

        /**
       * Binds events and event handlers that this view listens to.
       * @method _bindEvents
       * @private
       **/
        _bindEvents: function _bindEvents() {
            var self = this;
            this.$el.on( 'click', '.cut-button-container:not(".disabled")', function ( event ) { self.cutButtonClick( event ); } );
            this.$el.on( 'click', '.copy-button-container:not(".disabled")', function ( event ) { self.copyButtonClick( event ); } );
            this.$el.on( 'click', '.reflect-button-container:not(".disabled")', function ( event ) { self.reflectButtonClick( event ); } );
            this.$el.on( 'click', '.rotate-button-container:not(".disabled")', function ( event ) { self.rotateButtonClick( event ); } );
            this.$el.on( 'click', '.undo-button-container:not(".disabled")', function ( event ) { self.undoButtonClick( event ); } );
            this.$el.on( 'click', '.cut-line-button:not(".disabled")', function ( event ) { self.cutLineButtonClick( event ); } );
            this.$el.on( 'focusout', '.cut-line-button:not(".disabled")', function ( event ) { self.cutLineButtonFocusOut( event ); } );
            this.$el.on( 'keydown', '.cut-line-button:not(".disabled")', function ( event ) { self.cutLineButtonKeyDown( event ); } );
        },

        /**
        * Genarates points.
        *
        * @method generatePoints
        * @private
        */
        generateGrid: function generateGrid( startX, startY, gapBetweenPoints, numberOfPointsX, numberOfPointsY ) {
            var originalStartX = startX, point;

            this.gridCanvasScope.activate();
            //Creates Grid Points
            for ( var i = 0; i < numberOfPointsY; i++ ) {
                startX = originalStartX;
                for ( var j = 0; j < numberOfPointsX; j++ ) {
                    point = new this.gridCanvasScope.Point( startX, startY );
                    this.gridPoints.push( point );
                    startX += gapBetweenPoints;
                }
                startY += gapBetweenPoints;
            }

            //for ( var j = 0; j < this.gridPoints.length; j++ ) {
            //    var text = new this.gridCanvasScope.PointText( this.gridPoints[j] );
            //    text.justification = 'center';
            //    text.fillColor = 'black';
            //    text.content = j;
            //}

            //Draws Grid Lines
            this._drawLines( numberOfPointsX, numberOfPointsY );
            this.gridCanvasScope.view.draw();
        },

        /**
        * Draws Horizontal and vertical lines.
        *
        * @method _drawLines
        * @private
        */
        _drawLines: function _drawLines( numberOfPointsX, numberOfPointsY ) {
            var countX = numberOfPointsX, i;
            for ( i = 0; i < numberOfPointsX; i++ ) {
                this._makeLine( this.gridPoints[i], this.gridPoints[this.gridPoints.length - ( countX - i )], '#acacac', 1, false );
            }

            i = 0;
            do {
                this._makeLine( this.gridPoints[i], this.gridPoints[i + countX - 1], '#acacac', 1, false );
                i += countX;
            } while ( i < this.gridPoints.length );
        },

        /**
        * Draws line and returns object of line
        *
        * @method _makeLine
        * @private
        */
        _makeLine: function _makeLine( firstPt, secondPt, strokeColor, strokeWidth, isDashArray ) {
            this.gridCanvasScope.activate();
            var path = new this.gridCanvasScope.Path.Line( firstPt, secondPt );
            path.strokeColor = strokeColor;
            //path.strokeWidth = strokeWidth;
            return path;
        },

        /**
        * Draws predefined shapes
        *
        * @method _renderShapes
        * @private
        */
        _renderShapes: function _renderShapes() {
            var startIndexArray = this.model.getShapesStartIndex( 'render' ),
                prevPath,
                shapesArr,
                currentIndex = 0,
                strokeColor = this.modelNamespace.SHAPE_STROKE_COLORS.NORMAL,
                fillColor = this.getDefaultShapeColor( 'normal' );

            //Taking Start Point of each shape
            for ( var i = 0; i < startIndexArray.length; i++ ) {
                var path = new this.workCanvasScope.Path();
                currentIndex = startIndexArray[i];
                path.add( this.gridPoints[currentIndex] );

                //Taking next points positions of particular shape
                shapesArr = this.model.getDefaultShapes( i );

                for ( var j = 0; j < shapesArr.length; j++ ) {
                    //Adding value from array to get next position
                    currentIndex += shapesArr[j];
                    path.add( this.gridPoints[currentIndex] );
                }

                if ( i < startIndexArray.length - 2 ) {
                    //This is used to draw normal shape
                    path.shapeUniqueCode = i;
                    path.isSelected = false;
                    path.strokeColor = strokeColor;
                    path.strokeWidth = 2;
                    path.fillColor = fillColor;
                    this.shapeGroup.addChild( path );
                }
                else if ( i === startIndexArray.length - 2 ) {
                    prevPath = path;
                }
                else {
                    var compoundPath = this._createCompoundPath( prevPath, path, fillColor, strokeColor, 2 );
                    compoundPath.shapeUniqueCode = i - 1;
                    compoundPath.isSelected = false;
                    this.shapeGroup.addChild( compoundPath );
                }
            }
            this.workCanvasScope.view.draw();
        },

        /**
        * Creates compound shape
        * @method _createCompoundPath
        * @private
        */
        _createCompoundPath: function _createCompoundPath( path1, path2, fillColor, strokeColor, strokeWidth ) {
            var compoundPath = new this.workCanvasScope.CompoundPath( {
                children: [path1, path2],
                fillColor: fillColor,
                strokeColor: strokeColor,
                strokeWidth: strokeWidth
            } );
            return compoundPath;
        },

        /**
        * Draws selected shapes window
        *
        * @method _drawSelectedShapeWindow
        * @public
        */
        drawSelectedShapeWindow: function drawSelectedShapeWindow() {
            var shapesArr = this.model.getSelectedShapeWindowCoordinates(),
                fillColor = new this.workCanvasScope.Color( 0.25, 0.25, 0.25, 0.4 ),
                path1, path2, path3, rect, pt = {};

            pt.x = this.gridPoints[476].x + 12;
            pt.y = this.gridPoints[476].y + 12;
            rect = new this.workCanvasScope.Path.RegularPolygon( pt, 4, 16 );

            for ( var i = 0; i < shapesArr.length; i++ ) {
                if ( i === 0 ) {
                    path1 = new this.workCanvasScope.Path()
                    for ( var j = 0; j < shapesArr[i].length; j++ ) {
                        path1.add( this.gridPoints[shapesArr[i][j]] )
                    }
                }
                else {
                    path2 = new this.workCanvasScope.Path();
                    path3 = new this.workCanvasScope.Path();
                    path3.strokeColor = '#414141';
                    path3.strokeWidth = 2;
                    path3.dashArray = [10, 3];
                    for ( var j = 0; j < shapesArr[i].length; j++ ) {
                        path2.add( this.gridPoints[shapesArr[i][j]] );
                        path3.add( this.gridPoints[shapesArr[i][j]] );
                    }
                }
            }
            var compoundPath = new this.workCanvasScope.CompoundPath( {
                children: [path1, path2, rect],
                fillColor: fillColor
            } );
            path3.bringToFront();

            this.screenGroup.addChild( compoundPath );
            this.screenGroup.addChild( path3 );
            this.screenGroup.visible = false;
            this.workCanvasScope.view.draw();
        },

        /**
        * Draws unit labels at the bottom of canvas.
        *
        * @method _drawUnitScaleLabel
        * @public
        */
        _drawUnitScaleLabel: function _drawUnitScaleLabel() {
            var pt = {}, rect, pt1 = {}, text1, text2;
            pt.x = this.gridPoints[476].x + 12;
            pt.y = this.gridPoints[476].y + 12;
            pt1.x = this.gridPoints[478].x + 12;
            pt1.y = this.gridPoints[478].y + 12;


            rect = new this.workCanvasScope.Path.RegularPolygon( pt, 4, 16 );
            rect.strokeColor = '#4a4a4a';
            rect.strokeWidth = 2;

            text1 = new this.gridCanvasScope.PointText( pt1 );
            text1.font = 'Montserrat';
            text1.justification = 'center';
            text1.fillColor = '#222222';
            text1.content = '= 1 ' + this.getMessage( 'explore-texts', 'area-unit-text' );
            text1.strokeWidth = 1;
            text1.fontSize = 14;
            text1.position.y += 4;
            text1.position.x -= 7;

            text2 = new this.gridCanvasScope.PointText( text1.bounds.topRight );
            text2.font = 'Montserrat';
            text2.justification = 'center';
            text2.fillColor = '#222222';
            text2.strokeWidth = 1;
            text2.fontSize = 8;
            text2.content = '2';
            text2.position.x += 3;
            text2.position.y += 7;
            this.unitLabelGroup = new this.workCanvasScope.Group();
            this.unitLabelGroup.addChild( rect );
            this.unitLabelGroup.addChild( text1 );
            this.unitLabelGroup.addChild( text2 );
            this.unitLabelGroup.visible = false;
        },

        /**
        * draws selected shape
        * @method drawShape
        * @public
        */
        drawShape: function drawShape( event ) {
            var uniqueCode = event.target.shapeUniqueCode,
                startIndex = this.model.getShapesStartIndex( 'selected' )[uniqueCode],
                fillColor = this.getDefaultShapeColor( 'normal' ),
                strokeColor = this.modelNamespace.SHAPE_STROKE_COLORS.NORMAL,
                currentIndex = startIndex,
                shapesArr,
                prevPath,
                path,
                handleCode = 97,
                handleNumber = 1;

            //Creating new group for handles
            this.handleGroup = new this.workCanvasScope.Group();

            path = new this.workCanvasScope.Path();
            path.add( this.gridPoints[startIndex] );
            this.drawHandlesOfShape( this.gridPoints[startIndex], handleCode, handleNumber );
            handleNumber++;
            //Taking next points positions of particular shape
            shapesArr = this.model.getDefaultShapes( uniqueCode );

            for ( var j = 0; j < shapesArr.length; j++ ) {
                handleCode++;
                //Adding value from array to get next position
                currentIndex += shapesArr[j];
                path.add( this.gridPoints[currentIndex] );
                if ( j < shapesArr.length - 1 ) { this.drawHandlesOfShape( this.gridPoints[currentIndex], handleCode, handleNumber ); handleNumber++; }
            }

            if ( uniqueCode === 7 ) {
                var path1 = new this.workCanvasScope.Path();
                startIndex = this.model.getShapesStartIndex( 'selected' )[8];
                currentIndex = startIndex;
                path1.add( this.gridPoints[startIndex] );
                this.drawHandlesOfShape( this.gridPoints[startIndex], handleCode, handleNumber );
                handleNumber++;
                //Taking next points positions of particular shape
                shapesArr = this.model.getDefaultShapes( 8 );

                for ( var j = 0; j < shapesArr.length; j++ ) {
                    handleCode++;
                    //Adding value from array to get next position
                    currentIndex += shapesArr[j];
                    path1.add( this.gridPoints[currentIndex] );
                    if ( j < shapesArr.length - 1 ) { this.drawHandlesOfShape( this.gridPoints[currentIndex], handleCode, handleNumber ); handleNumber++; }
                }
                this.selectedShape = this._createCompoundPath( path, path1, fillColor, strokeColor, 2 );
            }
            else {
                path.strokeColor = strokeColor;
                path.strokeWidth = 2;
                path.fillColor = fillColor;
                this.selectedShape = path;
            }
            this.selectedShape.shapeUniqueCode = uniqueCode;
            this.workCanvasScope.view.draw();
        },

        /**
        * draws selected shape
        * @method drawShape
        * @public
        */
        drawHandlesOfShape: function drawHandlesOfShape( position, handleCode, handleNumber ) {
            var radius = 11,    // required radius 10px + 2px border
                callFrom = 'normal',    // but paper draws one border pixel inside and one outside
                callFor = 'vertex';
            var circle = new this.workCanvasScope.Path.Circle( position, radius );
            circle.style = this.getCircleStyle( position, callFrom, callFor );
            circle.handleCode = String.fromCharCode( handleCode );
            circle.handleNumber = handleNumber;
            this.handleGroup.addChild( circle );
        },

        /**
        * returns style of circle
        * @method getCircleStyle
        * @public
        */
        getCircleStyle: function getCircleStyle( position, callFrom, callFor ) {
            var gradientStops,
                strokeColor;
            ( callFrom === 'hover' ) ? gradientStops = ['#ffffff', '#749098'] : gradientStops = ['#749098', '#ffffff'];
            if ( callFor === 'vertex' ) {
                strokeColor = '#224c5c';
            }
            else if ( callFor === 'cutHandle' ) {
                strokeColor = '#501b83';
            }

            var top = new this.workCanvasScope.Point( position.x, position.y - 9 ),
                bottom = new this.workCanvasScope.Point( position.x, position.y + 9 ),
                myStyle = {
                    strokeColor: strokeColor,
                    fillColor: {
                        gradient: {
                            stops: gradientStops
                        },
                        origin: bottom,
                        destination: top
                    },
                    strokeWidth: 2,
                    shadowColor: '#000',
                    shadowBlur: 6,
                    shadowOffset: { x: 1, y: 1 }
                };
            return myStyle;
        },

        /**
        * returns default shape fill color depending on the state passed
        *
        * @method getDefaultShapeColor
        * @param callFor {String} The state of the shape (normal, hover, selected)
        * @return {Object} Paper.js color object for the shape.
        */
        getDefaultShapeColor: function getDefaultShapeColor( callFor ) {
            return this.model.get( 'defaultShapeColors' )[callFor];
        },

        /**
        * Stores the paper.js color objects for default shape's fill color in different states (normal, hover, selected).
        *
        * @method setDefaultShapeColor
        */
        setDefaultShapeColor: function setDefaultShapeColor() {
            var defaultShapeColors = {
                normal: new this.workCanvasScope.Color( 0.29, 0.74, 0.92, 0.5 ),
                hover: new this.workCanvasScope.Color( 0.56, 0.86, 0.98, 0.5 ),
                selected: new this.workCanvasScope.Color( 0.29, 0.92, 0.54, 0.5 )
            };
            this.model.set( 'defaultShapeColors', defaultShapeColors );
        },

        /**
        * returns copied shape fill color depending on the state passed
        *
        * @method getCopiedShapeColor
        * @param callFor {String} The state of the shape (normal, hover, selected)
        * @return {Object} Paper.js color object for the shape.
        */
        getCopiedShapeColor: function getCopiedShapeColor( callFor ) {
            return this.model.get( 'copiedShapeColors' )[callFor];
        },

        /**
        * Stores the paper.js color objects for copied shape's fill color in different states (normal, hover, selected).
        *
        * @method setCopiedShapeColor
        */
        setCopiedShapeColor: function setCopiedShapeColor() {
            var copiedShapeColors = {
                normal: new this.workCanvasScope.Color( 0.741, 0.737, 0.737, 0.5 ),
                hover: new this.workCanvasScope.Color( 0.886, 0.886, 0.886, 0.5 ),
                selected: new this.workCanvasScope.Color( 0.729, 0.659, 0.078, 0.5 )
            };
            this.model.set( 'copiedShapeColors', copiedShapeColors );
        },

        /**
        * returns copied shape fill color depending on the state passed
        *
        * @method addPropertiesToShape
        * @param object{} The Paper object
        */
        addPropertiesToShape: function addPropertiesToShape( object, isOriginal ) {
            //object.shapeUniqueCode = this.uniqueNumber;
            object.isOriginal = isOriginal;
            object.currentRotationCount = 0;
            object.miterLimit = 1;
            object.defaultCenter = object.position;
            // this.uniqueNumber++;
        },

        /**
        * Fetches the paper.js object of the shape whose code is passed.
        *
        * @method fetchShapePaperObject
        * @param shapeCode {String} The shape's code.
        * @param findOriginal {Boolean} If true, the actual shape's paper.js object will be returned. If false, the
        * copy will be returned.
        * @return {Object} The paper.js object of the shape.
        */
        fetchShapePaperObject: function fetchShapePaperObject( shapeCode, findOriginal ) {
            shapeCode = Number( shapeCode );
            var returnObj, index, currentShape, allCanvasShapes, numberOfShapes, count, indexArray = [];
            allCanvasShapes = this.canvasShapes;
            numberOfShapes = allCanvasShapes.length;
            returnObj = {};
            count = 0;
            for ( index = 0; index < numberOfShapes; index++ ) {
                currentShape = allCanvasShapes[index];
                if ( currentShape.shapeUniqueCode === shapeCode && currentShape.isOriginal === findOriginal ) {
                    return currentShape;
                }
            }
        },

        /**
        * Fetches the index of the shape and it's copy, if any.
        *
        * @method fetchPaperObjectIndex
        * @param shapeCode {String} The shape's code.
        * @return {Array} An array of indices where the shape & it's copy were found.
        */
        fetchPaperObjectIndex: function fetchPaperObjectIndex( shapeCode ) {
            var returnObj, index, currentShape, allCanvasShapes, numberOfShapes, count, indexArray;
            indexArray = [];
            allCanvasShapes = this.canvasShapes;
            numberOfShapes = allCanvasShapes.length;
            count = 0;
            for ( index = 0; index < numberOfShapes; index++ ) {
                currentShape = allCanvasShapes[index];
                if ( currentShape.shapeUniqueCode === shapeCode ) {
                    indexArray.push( index );
                    count++;
                    if ( count === 2 ) { // restrict furthur search as their can be max 2 shapes (original & copy)
                        return indexArray;  // with same code
                    }
                }
            }
            return indexArray;
        },

        /**
        * resets interactivity
        *
        * @method _resetInteractivity
        **/
        _resetInteractivity: function _resetInteractivity() {
            this.activateWorkCanvasScope();
            this._removeAllShapeLabels( true );
            var modelNamespace = this.modelNamespace,
                eventsEnum = modelNamespace.EVENTS,
                actionEnum = modelNamespace.ACTION_ENUM,
                event,
                index;
            this.selectedShapeCode = null,
            this.currentX = [];
            this.currentY = [];
            this.dependendSegment = [];

            this.currentEvent = null;
            this.selectedShapeEvent = null;
            this.mouseDownPoint = null;

            if ( this.model.get( 'type' ) === 2 ) {
                this.screenGroup.visible = false;
                this.shapeGroup.visible = true;
            }
            else {
                this.screenGroup.visible = true;
            }
            if ( this.selectedShape ) { this.selectedShape.remove(); }
            if ( this.handleGroup ) { this.unbindPaperEvents( this.handleGroup ); this.handleGroup.remove(); this.handleGroup = null; }
            this.removeCutLine();
            //this.handleGroup.removeChildren();
            this.unbindPaperEvents( this.paperTool );
            if ( this.model.get( 'type' ) === 2 ) {
                this._bindShapeEvent();
                this.unitLabelGroup.visible = false;
                this.player.changeHelpElementText( 'left-panel-canvas-acc-container', 0, this.getMessage( 'canvas-help-texts', 0 ), this.getAccMessage( 'canvas-help-texts', 0 ) );
//                this.player.enableHelpElement( 'work-canvas', 0, true );
//                this.player.enableHelpElement( 'work-canvas', 1, false );
            }
            this.$( '.left-panel-buttons-container' ).hide();
            this.model.trigger( eventsEnum.CHANGE_DIRECTION_TEXT, 0 );
            this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.NEXT, true );
            this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.CHECK, true );
            this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.DONE, false );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.DONE, true );
            this.model.trigger( eventsEnum.DISABLE_BUTTON, actionEnum.CUT, false );
            this.model.set( 'undoStack', [] );
            this.model.set( 'polygonVertexUndoStack', [] );
            this.model.set( 'polygonBoundaryPointsUndoStack', [] );
            //removing canvas shapes of action screen
            for ( index = 0; index < this.canvasShapes.length; index++ ) {
                this.unbindPaperEvents( this.canvasShapes[index] );
                this.canvasShapes[index].remove();
            }
            this.canvasShapes = [];
            this.uniqueNumber = 0;

            this.unBindAccessibilityListeners();
            if ( this.model.get( 'type' ) === 1 ) {
                event = {};
                event.target = {};
                event.target.shapeUniqueCode = 9;
                this.selectedShapeEvent = event;
                this.onDoneButtonClick();
                this.player.changeHelpElementText( 'left-panel-canvas-acc-container', 0, this.getMessage( 'canvas-help-texts', 1 ), this.getAccMessage( 'canvas-help-texts', 1 ) );
//                this.player.enableHelpElement( 'work-canvas', 1, true );
                this.setFocus( 'explore-instruction-bar-1-direction-text-text' );
            }
            else {
                this.bindAccessibilityListenersForSelectShape();
                this.changeAccMessage( 'explore-tab-activity-holder', 0 );
                this.changeAccMessage( 'left-panel-canvas-acc-container', 0 );
                this.setFocus( 'explore-instruction-bar-0-direction-text-text' );
            }
            this.player.enableHelpElement( 'actual-shape-table-wrapper', 3, false );
//            this.player.enableHelpElement( 'work-canvas', 4, false );
            //this.model.trigger( eventsEnum.HIDE_BUTTON, actionEnum.TRY_ANOTHER, true );
            this.workCanvasScope.view.draw();
        },

        /**
        * Adds / removes the label of the shape.
        *
        * @method _addRemoveShapeLabel
        * @param isLabelToBeAdded {Boolean} True, if label is to be added. Else, false.
        * @param [options] {Object} If label is to be added then additional data needs to be passed.
        * @param [options.shape] {Object} Paper.js object of the shape, required if the label is to be added.
        * @param [options.inputValue] {String} The input as entered by the user, required if the label is to be added.
        * @param [options.correctLabel] {Boolean} True, if a green label for correct input is to be displayed; else,
        * false. Required if the label is to be added.
        * @param [options.shapeCode] {String} The shape's unique code if it is to be removed.
        * @param [options.isOriginal] {Boolean} A boolean indicating if the shape is a copy or is original. Required if
        * the shape is to be removed.
        * @private
        */
        _addRemoveShapeLabel: function _addRemoveShapeLabel( isLabelToBeAdded, options ) {
            var labelIndex, labelGroup, label, input, shape, shapeCode,
                strokeColors = this.modelNamespace.SHAPE_STROKE_COLORS,
                correctStrokeColor = strokeColors.CORRECT,
                incorrectStrokeColor = strokeColors.INCORRECT;
            if ( isLabelToBeAdded ) {
                shape = options.shape;
                //shapeCode = shape.shapeUniqueCode;
                //labelIndex = ( shape.isOriginal ) ? 0 : 1;
                //label = ( this._shapeLabels[shapeCode] ) ? this._shapeLabels[shapeCode][labelIndex] : null;
                //if ( label ) {
                //    if ( label.needsTooltip ) {
                //        this.removeTooltip( shapeCode + '|' + options.isOriginal );
                //    }
                //    label.remove();
                //    delete this._shapeLabels[shapeCode][labelIndex];
                //}
                if ( options.correctLabel ) {
                    shape.strokeColor = correctStrokeColor;
                }
                else {
                    shape.strokeColor = incorrectStrokeColor;
                }
                //labelGroup = this._createLabel( options.inputValue, options.correctLabel );
                //label = this._positionLabel( labelGroup, shape );
                //label.insertAbove( shape );
                //if ( label.needsTooltip ) {
                //    this.generateTooltip( shape, options.inputValue );
                //}
                //if ( !this._shapeLabels[shape.shapeUniqueCode] ) {
                //    this._shapeLabels[shape.shapeUniqueCode] = {};
                //}
                //this._shapeLabels[shape.shapeUniqueCode][labelIndex] = label;
            }
            //else {
            //labelIndex = ( options.isOriginal ) ? 0 : 1;
            //shapeCode = options.shapeCode;
            //label = ( this._shapeLabels[shapeCode] ) ? this._shapeLabels[shapeCode][labelIndex] : null;
            //if ( label ) {
            //    if ( label.needsTooltip ) {
            //        this.removeTooltip( shapeCode + '|' + options.isOriginal );
            //    }
            //    label.remove();
            //    delete this._shapeLabels[shapeCode][labelIndex];
            //}
            //}
        },

        /**
        * Removes all area labels from the canvas shapes.
        *
        * @method _removeAllShapeLabels
        * @private
        */
        _removeAllShapeLabels: function _removeAllShapeLabels( removeTabelBadges ) {
            var shapeCode, shapeLabel, labelIndex, label,
                strokeColors = this.modelNamespace.SHAPE_STROKE_COLORS,
                defaultStrokeColor = strokeColors.NORMAL,
                copyStrokeColor = strokeColors.COPY,
                eventsEnum = this.modelNamespace.EVENTS,
                actionEnum = this.modelNamespace.ACTION_ENUM;
            //for ( shapeCode in this._shapeLabels ) {
            //    shapeLabel = this._shapeLabels[shapeCode]; // contains label for both shape and its copy
            //    for ( labelIndex in shapeLabel ) {
            //        label = shapeLabel[labelIndex];
            //        label.remove();
            //        delete shapeLabel[labelIndex];
            //    }
            //    delete this._shapeLabels[shapeCode];
            //}
            for ( var index = 0; index < this.canvasShapes.length; index++ ) {
                this.canvasShapes[index].strokeColor = ( this.canvasShapes[index].isOriginal ) ?
                    defaultStrokeColor : copyStrokeColor;
            }
            //this.removeTooltip();
            //if ( removeTabelBadges ) {
            //    this.model.trigger( eventsEnum.TABLE_DATA_EVENT, actionEnum.REMOVE_ALL_BADGES, {
            //        shapes: this.canvasShapes
            //    } );
            //}
        },

        /**
        * Creates the label for the shape.
        *
        * @method _createLabel
        * @param input {String} The value as entered by the user.
        * @param isCorrect {Boolean} True, if a green label with tick mark is to be shown. Else, a red label with cross
        * will be displayed.
        * @return {Object} Paper.js group item that represents the label.
        * @private
        */
        _createLabel: function _createLabel( input, isCorrect ) {
            var labelText1, labelText2, label, labelUrl, labelGroup;
            labelText1 = new this.workCanvasScope.PointText( {
                justification: 'center',
                font: 'Montserrat',
                //fontWeight: 'bold',
                fontSize: 14,
                fillColor: '#222222',
                content: input + ' ' + this.getMessage( 'explore-texts', 'area-unit-text' )
            } );
            labelText2 = new this.workCanvasScope.PointText( {
                font: 'Montserrat',
                //fontWeight: 'bold',
                fontSize: 8,
                fillColor: '#222222',
                point: labelText1.bounds.topRight,
                content: '2'
            } );
            labelText2.translate( 0, labelText2.bounds.height / 2 );
            //labelUrl = ( isCorrect ) ? this.modelNamespace.LABEL_URL.CORRECT : this.modelNamespace.LABEL_URL.INCORRECT;
            //label = new this.workCanvasScope.Raster( labelUrl, labelText2.bounds.bottomRight );
            label = ( isCorrect ) ? this.correctLabelIcon.clone() : this.incorrectLabelIcon.clone();
            label.position = labelText2.bounds.bottomRight;
            label.translate( label.bounds.width / 2 + 5, 0 );
            labelGroup = new this.workCanvasScope.Group( [labelText1, labelText2, label] );
            labelGroup.guide = true;
            return labelGroup;
        },

        /**
        * Positions the label at the centroid or if it can't be placed at the centroid, then searches and positions it at the valid
        * position closest to the centriod.
        *
        * @method _positionLabel
        * @param labelGroup {Object} Paper.js group object that contains the shape's label text and image.
        * @param shape {Object} Paper.js path object that represents the shape.
        * @private
        */
        _positionLabel: function _positionLabel( labelGroup, shape ) {
            var gridStepSize = this.modelNamespace.GAP_BETWEEN_POINTS,
                labelWidth = labelGroup.bounds.width,
                labelIcon,
                shapeBounds = shape.clone( false ).bounds,
                centroid, x, y,
                labelRect,
                iterationCount,
                rows, rowCounter,
                rowStepFactor,
                blockCheckResult,
                rowCheckResult, rowCheckResultDistance,
                validPosition, validPositionDistance,
                validPositionForIcon,
                validPositionsFound = 0,
                UtilsClass = MathInteractives.Common.Utilities.Models.Utils,
                gridStartX = this.modelNamespace.GRID_START_X,
                gridStartY = this.modelNamespace.GRID_START_Y;

            labelRect = new this.workCanvasScope.Path.Rectangle( labelGroup.bounds );

            centroid = this.modelNamespace.calcCenterOfMass( shape );

            // snap to cell center
            x = Math.floor(( centroid.x - gridStartX ) / gridStepSize ) * gridStepSize + gridStepSize / 2 + gridStartX;
            y = Math.floor(( centroid.y - gridStartY ) / gridStepSize ) * gridStepSize + gridStepSize / 2 + gridStartY;

            // if label fits at centriod, position label and return.
            blockCheckResult = this.modelNamespace.positionAndCheckBlock( labelRect, shape, x, y, this.workCanvasScope );
            if ( blockCheckResult.isValidForLabel ) {
                labelGroup.position = { x: x, y: y };
                labelRect.remove();
                return labelGroup;
            }

            // skip furthur checks if shape is thinner than the label
            if ( shapeBounds.width > gridStepSize ) {

                // If label can't be placed at centriod,
                //      check whole row for a valid position
                //      if no valid position is found, check one row at the bottom and the next at the top of centroid row.
                rows = shapeBounds.height / gridStepSize;

                for ( rowCounter = 0, iterationCount = 0, rowStepFactor = -1; rowCounter < rows; iterationCount++, rowStepFactor *= -1 ) {
                    y += gridStepSize * iterationCount * rowStepFactor;
                    if ( y < shapeBounds.top || y > shapeBounds.bottom ) {
                        continue;
                    }
                    else {
                        rowCounter++;
                    }
                    // check the row having y co-ordinate 'y'
                    rowCheckResult = this._checkRow( labelRect, shape, y, centroid );
                    if ( rowCheckResult ) {
                        if ( rowCheckResult.validPointForLabel ) {
                            // If check returned a valid position
                            //      compare with previous valid position and choose the one
                            //      closest to the centroid.
                            if ( validPosition ) {
                                rowCheckResultDistance = UtilsClass.getPointDistance( centroid, rowCheckResult.validPointForLabel );
                                if ( rowCheckResultDistance < validPositionDistance ) {
                                    validPosition = rowCheckResult.validPointForLabel;
                                    validPositionDistance = UtilsClass.getPointDistance( centroid, validPosition );
                                }
                            }
                            else {
                                validPosition = rowCheckResult.validPointForLabel;
                                validPositionDistance = UtilsClass.getPointDistance( centroid, validPosition );
                            }
                            // For optimization stop search after 3 valid positions were found.
                            // one for centroid row and one each for a row above and below it
                            validPositionsFound++;
                            if ( validPositionsFound === 3 ) {
                                break;
                            }
                        }
                        if ( rowCheckResult.validPointForIcon ) {
                            if ( validPositionForIcon ) {
                                if ( UtilsClass.getPointDistance( centroid, rowCheckResult.validPointForIcon ) <
                                    UtilsClass.getPointDistance( centroid, validPositionForIcon ) ) {
                                    validPositionForIcon = rowCheckResult.validPointForIcon;
                                }
                            }
                            else {
                                validPositionForIcon = rowCheckResult.validPointForIcon;
                            }
                        }
                    }
                }
                if ( validPosition ) {
                    labelGroup.position = validPosition;
                    labelRect.remove();
                    return labelGroup;
                }
            }
            // No valid position found for placing shape label
            labelIcon = labelGroup.lastChild;
            labelIcon.guide = true;
            labelGroup.remove();
            this.workCanvasScope.project.activeLayer.addChild( labelIcon );
            if ( validPositionForIcon ) {
                labelIcon.position = validPositionForIcon;
            }
            else {  // search for a block to position the label icon
                this._positionLabelIcon( shape, labelIcon );
            }
            labelRect.remove();
            labelIcon.needsTooltip = true;
            return labelIcon;
        },

        /**
        * Checks all grid cells inside the shape at the row whose y co-ordinate is passed, and returns the valid position closest to the
        * centroid.
        *
        * @method _checkRow
        * @param labelRect {Object} Paper.js rectanglular object of label's size.
        * @param shape {Object} Paper.js object of the shape.
        * @param y {Number} The y co-ordinate of the location to be checked.
        * @param centroid {Object} The center of mass of the polygonal shape.
        * @return {Object} The valid position in the row where the label can be placed. If no such position is found the returns false.
        * @private
        */
        _checkRow: function _checkRow( labelRect, shape, y, centroid ) {
            var clonedShape = shape.clone( false ),
                shapeBounds = clonedShape.bounds,
                gridStepSize = this.modelNamespace.GAP_BETWEEN_POINTS,
                lineStart = new this.workCanvasScope.Point( this.modelNamespace.BOUNDING_BOX_LEFT - this.modelNamespace.GRID_START_X, 0 ),
                lineEnd = new this.workCanvasScope.Point( this.modelNamespace.BOUNDING_BOX_RIGHT + this.modelNamespace.GRID_START_X, 0 ),
                topLine = new this.workCanvasScope.Path.Line( lineStart, lineEnd ),
                bottomLine = new this.workCanvasScope.Path.Line( lineStart, lineEnd ),
                topIntersections, bottomIntersections, intersections,
                intersectionsCase,
                topIntersectionsCount, bottomIntersectionsCount,

                intersectionsMidPoints, intersectionsMidPointsStatus,

                isIntersectionsMidPoint0Inside, isIntersectionsMidPoint1Inside,

                validPoint, checkResult, partOfIntersections,
                validPointForIcon,
                UtilsClass = MathInteractives.Common.Utilities.Models.Utils;
            topLine.position.y = y - gridStepSize / 2;
            bottomLine.position.y = y + gridStepSize / 2;
            topIntersections = clonedShape.getIntersections( topLine );
            bottomIntersections = clonedShape.getIntersections( bottomLine );
            topLine.remove();
            bottomLine.remove();

            topIntersectionsCount = topIntersections.length;
            bottomIntersectionsCount = bottomIntersections.length;

            // case (1,*):
            // case (*,1): not even a single block available
            if ( topIntersectionsCount === 1 || bottomIntersectionsCount === 1 ) {
                return false;
            }

            topIntersections.sort( this.modelNamespace.sortHorizontalIntersections );
            bottomIntersections.sort( this.modelNamespace.sortHorizontalIntersections );

            return this.modelNamespace.handleIntersectionCase( {
                shape: shape,
                topIntersections: topIntersections,
                bottomIntersections: bottomIntersections,
                labelRect: labelRect,
                centroid: centroid,
                y: y,
                paperscope: this.workCanvasScope
            } );
        },

        /**
        * Positions label icon in the cell that occupies the largest area.
        *
        * @method _positionLabelIcon
        * @param shape {Object} Paper.js object of the polygonal shape.
        * @param labelIcon {Object} Paper.js object of the label icon to be placed.
        * @private
        */
        _positionLabelIcon: function _positionLabelIcon( shape, labelIcon ) {
            var shapeBounds, shapeWidth, shapeHeight,
                gridStepSize,
                rows, cols, indexX, indexY,
                startX, startY, checkX, checkY,
                finalPosition,
                iconRect, intersection, area;
            shapeBounds = shape.bounds;
            shapeWidth = shapeBounds.width;
            shapeHeight = shapeBounds.height;
            gridStepSize = this.modelNamespace.GAP_BETWEEN_POINTS;
            rows = shapeHeight / gridStepSize;
            cols = shapeWidth / gridStepSize;
            startX = shapeBounds.left + gridStepSize / 2;
            startY = shapeBounds.top + gridStepSize / 2;
            area = 0;
            iconRect = new this.workCanvasScope.Path.Rectangle( labelIcon.bounds );
            for ( indexY = 0; indexY < rows; indexY++ ) {
                checkY = startY + indexY * gridStepSize;
                for ( indexX = 0; indexX < cols; indexX++ ) {
                    checkX = startX + indexX * gridStepSize;
                    iconRect.position = { x: checkX, y: checkY };
                    intersection = shape.intersect( iconRect );
                    if ( intersection.area > area ) {
                        area = intersection.area;
                        finalPosition = { x: checkX, y: checkY };
                    }
                    intersection.remove();
                }
            }
            iconRect.remove();
            labelIcon.position = finalPosition;
        },

        /**
        * Generates tooltip for paper object
        *
        * @method generateTooltip
        * @param object {Object} Paper.js object of the polygonal shape.
        * @param input {String} The value entered by the user.
        * @public
        */
        generateTooltip: function generateTooltip( object, input ) {
            var tooltipContent = this._generateTooltipContent( input ),
                nameSpace = MathInteractives.Common.Components.Views.CanvasTooltip,
                tooltipNameSpace = MathInteractives.global.Theme2.Tooltip,
                props = {
                    elementEl: this.idPrefix + 'psuedo-element-' + object.shapeUniqueCode + '-' + object.isOriginal,
                    paperObject: object,
                    baseClass: 'shape-tooltip',
                    _player: this.player,
                    manager: this.manager,
                    filePath: this.filePath,
                    idPrefix: this.idPrefix,
                    type: tooltipNameSpace.TYPE.GENERAL,
                    arrowType: tooltipNameSpace.ARROW_TYPE.BOTTOM_MIDDLE,
                    position: 'top-middle',
                    backgroundColor: '#ffffff',
                    dynamicArrowPosition: true,
                    isTts: false,
                    padding: 10,
                    containerHeight: tooltipContent.height,
                    containerEleId: 'left-panel-canvas-container',
                    text: tooltipContent.html,
                    containerWidth: tooltipContent.width,
                    isTooltipPermanent: false

                };

            this.shapesTooltipViews[object.shapeUniqueCode + '|' + object.isOriginal] = nameSpace.generateCanvasTooltip( props );
        },

        /**
        * Removes All tooltip.
        *
        * @method removeTooltip
        * @param [tooltipIndex] {String} The tooltip index - a combination of shape's unique code and the isOriginal
        * boolean seperated by '|'.
        * @public
        */
        removeTooltip: function removeTooltip( tooltipIndex ) {
            var shapeTooltipView, index;
            if ( tooltipIndex && this.shapesTooltipViews[tooltipIndex] ) {
                shapeTooltipView = this.shapesTooltipViews[tooltipIndex];
                shapeTooltipView.removeTooltip();
                shapeTooltipView.remove();
                shapeTooltipView.$pseudoElement.remove();
                delete this.shapesTooltipViews[tooltipIndex];
            }
            else {
                for ( index in this.shapesTooltipViews ) {
                    shapeTooltipView = this.shapesTooltipViews[index];
                    shapeTooltipView.removeTooltip();
                    shapeTooltipView.remove();
                    shapeTooltipView.$pseudoElement.remove();
                    delete this.shapesTooltipViews[index];
                }
            }
        },

        /**
        * Given the input, it returns the html string for the tooltip and the height, width of the content.
        *
        * @method _generateTooltipContent
        * @param input {String} The area entered by the user for the shape to which the tooltip is to be added.
        * @return {Object} An object containing the html string for the tooltip content, it's width and height.
        * @private
        */
        _generateTooltipContent: function _generateTooltipContent( input ) {
            var $tempDiv, width, height,
                unitsText = this.getMessage( 'explore-texts', 'area-unit-text' ),
                returnObj = {};
            input += ' ' + unitsText;
            $tempDiv = $( '<div></div>', { 'class': 'tooltip-content' } ).html( input + '<span>2</span>' )
                .appendTo( this._$tempTooltipContentHolder );
            returnObj = {
                html: $tempDiv.html(),
                width: $tempDiv.width() + 10,  // adding 10 cause tooltip is creating a div 10px smaller
                height: $tempDiv.height() + 10 // adding 10 cause tooltip is creating a div 10px smaller
            };
            $tempDiv.remove();
            return returnObj;
        },

        isShiftKeyPress: null,
        cutLineButtonKeyDown: function cutLineButtonKeyDown( event ) {
            this.isShiftKeyPress = event.shiftKey;
        },

        cutLineButtonFocusOut: function cutLineButtonFocusOut( event ) {
            this.enableTab( 'cut-line-button', false );
            if ( !this.isCutLineButtonClicked ) {
                var text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapeText' ),
                       text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'isText' );
                if ( this.canvasShapes.length > 1 ) {
                    text1 = this.getAccMessage( 'left-panel-canvas-acc-container', 'shapesText' ),
                    text2 = this.getAccMessage( 'left-panel-canvas-acc-container', 'areText' );
                }
                this.changeAccMessage( 'left-panel-canvas-acc-container', 12, [text1, text2] );
                if ( this.isShiftKeyPress ) {
                    this.setFocus( 'left-panel-canvas-acc-container' );
                }
            }
            this.isCutLineButtonClicked = false;
        },
    } );
} )();
