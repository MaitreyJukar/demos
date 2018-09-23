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

    MathInteractives.Common.Interactivities.ShapeDecomposition.Views.RightPanel = MathInteractives.Common.Interactivities.ShapeDecomposition.Views.ExploreClass.extend( {
        /**
        * Holds model namespace
        * @property modelNamespace
        * @type Object
        * @default null
        **/
        modelNamespace: MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData,

        /**
        * Jquery reference of the DIV storing table for actual shapes.
        *
        * @property _$actualTable
        * @type Object
        * @default null
        * @private
        */
        _$actualTable: null,

        /**
        * Jquery reference of the DIV storing table for copied shapes.
        *
        * @property _$duplicatesTable
        * @type Object
        * @default null
        * @private
        */
        _$duplicatesTable: null,

        /**
        * An object storing input box component views for each entry in actual shape's table.
        *
        * @property actualShapeInputBoxes
        * @type Object
        * @default null
        */
        actualShapeInputBoxes: null,

        /**
        * An object storing input box component views for each entry in duplicate shape's table.
        *
        * @property duplicateShapeInputBoxes
        * @type Object
        * @default null
        */
        duplicateShapeInputBoxes: null,

        /**
        * Stores a list of views' cid for all input boxes that needs to be checked.
        *
        * @property _inputBoxesToCheck
        * @type Array
        * @default null
        * @private
        */
        _inputBoxesToCheck: null,

        /**
        * A boolean indicating if all input boxes are to be checked
        *
        * @property _checkAll
        * @type Boolean
        * @default false
        * @private
        */
        _checkAll: false,

        /**
        * Jqeury reference of the DIV where total sum of actual shapes' area is displayed.
        *
        * @property _$totalArea
        * @type Object
        * @default null
        * @private
        */
        _$totalArea: null,

        /**
        * Jqeury reference of the DIV where a red cross or green tick badge is displayed for the total area.
        *
        * @property _$totalBadge
        * @type Object
        * @default null
        * @private
        */
        _$totalBadge: null,
        /**
        * holds tabIndex of actual textboxes.
        *
        * @property actualTextboxTabIndex
        * @type integer
        * @default null
        * @private
        */
        actualTextboxTabIndex: null,
        /**
        * holds tabIndex of duplicate textboxes.
        *
        * @property duplicateTextboxTabIndex
        * @type integer
        * @default null
        * @private
        */
        duplicateTextboxTabIndex: null,
        screenObj: null,

        /**
        * Initialises Explore Class
        *
        * @method initialize
        **/
        initialize: function () {
            this.actualTextboxTabIndex = 1350;
            this.duplicateTextboxTabIndex = 1600;
            this.screenObj = {};
            this.screenObj.id = 'text-box-screen';
            this.screenObj.name = 'text-box-screen';
            this.screenObj.elements = [];

            this.initializeDefaultProperties();
            this.initializeVariables();
            this._bindEvents();
            this.loadScreen( 'right-panel-screen' );
            this._$tablesContainer.addClass( 'invisible' );
        },

        /**
        * Initialises all variables with default value
        *
        * @method initializeVariables
        **/
        initializeVariables: function initializeVariables() {
            var shapeTypes = this.modelNamespace.SHAPE_TYPES,
                $actualTableFooter;
            this._$tablesContainer = this.$( '.right-panel-table-container' );
            this._$actualTable = this.$( '.' + shapeTypes.ACTUAL + '-shape-table' );
            this._$duplicatesTable = this.$( '.' + shapeTypes.DUPLICATE + '-shape-table' );
            this.actualShapeInputBoxes = {};
            this.duplicateShapeInputBoxes = {};
            this._inputBoxesToCheck = [];
            $actualTableFooter = this.$( '.actual-shape-table-footer' );
            $actualTableFooter.find( '.total-text' ).text( this.getMessage( 'explore-texts', 'total-text' ) );
            $actualTableFooter.find( '.unit-text' ).text( this.getMessage( 'explore-texts', 'area-unit-text' ) );
            this._$totalArea = $actualTableFooter.find( '.total-area-box' );
            this._$totalBadge = $actualTableFooter.find( '.footer-cell-1' );
        },

        /**
        * Binds events and event handlers that this view listens to.
        * @method _bindEvents
        * @private
        **/
        _bindEvents: function _bindEvents() {
            var self = this,
                eventsEnum = this.modelNamespace.EVENTS;
            this.$el.on( 'click', '.done-button-container:not(".disabled")', function ( event ) { self._onDoneClick( event ); } );
            this.$el.on( 'click', '.next-button-container:not(".disabled")', function ( event ) { self._onNextClick( event ); } );
            this.$el.on( 'click', '.check-button-container:not(".disabled")', function ( event ) { self._onCheckClick( event ); } );

            this.listenTo( this.model, eventsEnum.TABLE_DATA_EVENT, this._onTableDataEvent );
            this.listenTo( this.model, eventsEnum.TRY_ANOTHER_CLICK, this._resetRightPanel );
        },

        /**
        * Call on done button click
        *
        * @method _onDoneClick
        * @private
        */
        _onDoneClick: function _onDoneClick() {
            this.model.trigger( this.modelNamespace.EVENTS.DONE_BUTTON_CLICK );
        },

        /**
        * Call on next button click
        *
        * @method _onNextClick
        * @private
        */
        _onNextClick: function _onNextClick() {
            this.model.trigger( this.modelNamespace.EVENTS.NEXT_BUTTON_CLICK );
        },

        /**
        * Call on check button click
        *
        * @method _onCheckClick
        * @private
        */
        _onCheckClick: function _onCheckClick( event, inputBoxView ) {
            if ( inputBoxView ) { // fix for when accessibility is off
                inputBoxView.inputEle.blur();
            }
            this.model.trigger( this.modelNamespace.EVENTS.CHECK_BUTTON_CLICK );
        },

        /**
        * Empties the tables and hides them.
        *
        * @method _resetRightPanel
        * @private
        */
        _resetRightPanel: function _resetRightPanel() {
            this.showTables( false );
            this._emptyTable();
            this.actualTextboxTabIndex = 1350;
            this.duplicateTextboxTabIndex = 1600;
            this.screenObj.elements = [];
            //this.unloadScreen( 'text-box-screen' );
//            this.unloadScreen( 'right-panel-screen' );
        },

        /**
        * Depending on the action passed, calls methods to update the tables.
        *
        * @method _onTableDataEvent
        * @param action {String} String literal from ACTION_ENUM depending on the action performed.
        * @param eventData {Object} Additional data to help identify and update the row/rows that corresponds to the
        * shapes changed.
        * @private
        */
        _onTableDataEvent: function _onTableDataEvent( action, eventData ) {
            var actionEnum = this.modelNamespace.ACTION_ENUM;
            switch ( action ) {
                case actionEnum.NEXT:
                    this._render( eventData.paperItem );
                    break;
                case actionEnum.COPY:
                    this._addEntryInTable( eventData.paperItem );
                    this._createAccesibilityOfTextbox( [eventData.paperItem] );
                    break;
                case actionEnum.ROTATE:
                case actionEnum.REFLECT:
                    this._updateImageForShape( eventData.paperItem );
                    this._storeInputBoxValuesInUndoStack();
                    break;
                case actionEnum.TRANSLATE:
                    this._storeInputBoxValuesInUndoStack();
                    break;
                case actionEnum.UNDO:
                    this.actualTextboxTabIndex = 1350;
                    this.duplicateTextboxTabIndex = 1600;
                    this.screenObj.elements = [];
                    this._updateTableOnUndo( eventData.newShapes, eventData.undoneStep );
                    this._createAccesibilityOfTextbox( eventData.newShapes );
                    this._changeTextOfFieldTextboxes( eventData.newShapes );
                    this._enableDisableCheckBtn();
                    break;
                case actionEnum.CHECK:
                    this._checkInputBoxValues( eventData.shapes, eventData.paperScope );
                    break;
                case actionEnum.CUT:
                    this._removeEntriesForShapes( eventData.removedShapesCodes );
                    this._addEntriesForShapes( eventData.newShapes );
                    this.actualTextboxTabIndex = 1350;
                    this.duplicateTextboxTabIndex = 1600;
                    this.screenObj.elements = [];
                    this._createAccesibilityOfTextbox( eventData.allShapes );
                    this._changeTextOfFieldTextboxes( eventData.allShapes );
                    this._$totalBadge.css( 'background-image', 'none' );
                    this._$totalBadge.removeClass( 'correct incorrect' );
                    break;
                case actionEnum.REMOVE_ALL_BADGES:
                    this._removeAllInputBoxBadges( eventData.shapes );
                    break;
                default:
                    console.log( 'ERROR: THIS ACTION CASE NOT HANDLED YET!!!' );
                    break;
            }
        },

        /**
        * Called on reaching the last screen of Explore tab. It hides the next, check button and adds the first entry
        * in the actual shapes table after displaying it.
        *
        * @method _render
        * @param paperItem {Object} Paper.js object representing the polygon that user wants to decompose.
        * @private
        */
        _render: function _render( paperItem ) {
            this.model.trigger( this.modelNamespace.EVENTS.HIDE_BUTTON, this.modelNamespace.ACTION_ENUM.NEXT, true );
            this.model.trigger( this.modelNamespace.EVENTS.HIDE_BUTTON, this.modelNamespace.ACTION_ENUM.CHECK, false );
            this.showTables( true );
            this.actualTextboxTabIndex = 1350;
            this.duplicateTextboxTabIndex = 1600;
            this._addEntryInTable( paperItem );
            this.unloadScreen( 'right-panel-screen' );
            this.loadScreen( 'right-panel-screen' );
            this.changeAccMessage( 'actual-shape-table-footer-cell-1', 0, [0] );
            this._createAccesibilityOfTextbox( [paperItem], 'renderCall' );
        },

        /**
        * Renders the tables' container visible
        *
        * @method showTables
        * @private
        */
        showTables: function showTables( show ) {
            if ( show === false ) {
                this._$tablesContainer.addClass( 'invisible' );
            }
            else {
                this._$tablesContainer.removeClass( 'invisible' );
            }
        },

        /**
        * Adds entries for shapes in table for passed shapes objects in array as parameter.
        *
        * @method _addEntriesForShapes
        * @param newShapes {Array} Array of paper.js objects of newly created shapes after cut.
        * @private
        */
        _addEntriesForShapes: function _addEntriesForShapes( newShapes ) {
            for ( var index in newShapes ) {
                this._addEntryInTable( newShapes[index] );
            }
        },

        _createAccesibilityOfTextbox: function _createAccesibilityOfTextbox( newShapes, callFrom ) {
            var actualOrDuplicate,
                tabIndex,
                shapeCode,
                id,
                textBoxScreen;
            for ( var index in newShapes ) {
                shapeCode = newShapes[index].shapeUniqueCode;
                if ( newShapes[index].isOriginal ) {
                    actualOrDuplicate = 'actual';
                    tabIndex = this.actualTextboxTabIndex;
                    this.actualTextboxTabIndex++;
                    id = actualOrDuplicate + '-shape-input-box-' + shapeCode;
                }
                else {
                    actualOrDuplicate = 'duplicate';
                    tabIndex = this.duplicateTextboxTabIndex;
                    this.duplicateTextboxTabIndex++;
                    id = actualOrDuplicate + '-shape-input-box-' + shapeCode;
                }
                textBoxScreen = this._createScreenForTextBoxes( id, tabIndex, actualOrDuplicate, newShapes[index].accNumber );
                this.screenObj.elements.push( textBoxScreen );
            }
            if ( callFrom !== 'renderCall' ) this.unloadScreen( 'text-box-screen' );
            this.manager.model.parse( [this.screenObj] );
            this.loadScreen( 'text-box-screen' );
        },


        _changeTextOfFieldTextboxes: function _changeTextOfFieldTextboxes( newShapes ) {
            var currentShape,
                isOriginal,
                inputBoxView,
                input,
                accId,
                shapeCode,
                $inputBoxContainer;

            for ( var index in newShapes ) {
                currentShape = newShapes[index];
                shapeCode = currentShape.shapeUniqueCode;
                isOriginal = currentShape.isOriginal;
                inputBoxView = ( isOriginal ) ? this.actualShapeInputBoxes[shapeCode] : this.duplicateShapeInputBoxes[shapeCode];
                input = inputBoxView.getCurrentInputValue();
                accId = inputBoxView.$el.children()[0].id.replace( this.idPrefix, '' );
                $inputBoxContainer = inputBoxView.$el.parents( '.input-box-container' );
                if ( $inputBoxContainer.hasClass( 'correct' ) ) {
                    this.changeAccMessage( accId, 2, [Number( input ), currentShape.accNumber, 'correct'] );
                }
                else if ( $inputBoxContainer.hasClass( 'incorrect' ) ) {
                    this.changeAccMessage( accId, 2, [Number( input ), currentShape.accNumber, 'incorrect'] );
                }
                else {
                    if ( input !== null ) {
                        // for non-empty input boxes
                        this.changeAccMessage( accId, 1 );
                    }
                    else {
                        this.changeAccMessage( accId, 0 );
                    }
                }
            }
        },

        /**
        * Given a shape's paper item, the method adds an entry for the shape at the end of the table
        *
        * @method _addEntryInTable
        * @param shape {Object} Paper item of the shape whose entry is to be added in the table. The paper item must
        * contain the shape's code "shapeUniqueCode" and a boolean "isOriginal" indicating if it's a copy or not.
        * @param [insertAfter] {Number} The unique code of the shape after which the row is to be inserted. If the row
        * is to be added at the top, pass -1. If not passed, row will be inserted at the bottom.
        * @private
        */
        _addEntryInTable: function _addEntryInTable( shape, insertAfter ) {
            var imageData, shapeCode, actualOrDuplicate, _rowEntry, imageHeight, maxImageHeight, margin,
                value, index, undoStack, currentElements, elementsCount, shapeInfoInUndoStack,
                $tableToInsertIn,
                modelNamespace, shapeTypes, tabIndex;
            modelNamespace = this.modelNamespace;
            shapeTypes = modelNamespace.SHAPE_TYPES;
            maxImageHeight = modelNamespace.MINI_SHAPE_MAX_IMAGE_HEIGHT;
            imageData = this._getScaledImageOfPaperItem( shape, maxImageHeight, modelNamespace.MINI_SHAPE_MAX_IMAGE_WIDTH );
            imageHeight = Math.ceil( imageData.height );
            margin = Math.floor(( maxImageHeight - imageHeight ) / 2 ) + 'px auto';
            shapeCode = shape.shapeUniqueCode;
            if ( shape.isOriginal ) {
                actualOrDuplicate = shapeTypes.ACTUAL;
            }
            else {
                actualOrDuplicate = shapeTypes.DUPLICATE;
            }
            _rowEntry = MathInteractives.Common.Interactivities.ShapeDecomposition.templates.tableRow( {
                idPrefix: this.idPrefix,
                actualOrDuplicate: actualOrDuplicate,
                shapeCode: shapeCode,
                imageURL: imageData.url,
                imageWidth: Math.ceil( imageData.width ) + 'px',
                imageHeight: imageHeight + 'px',
                margin: margin,
                unitText: this.getMessage( 'explore-texts', 'area-unit-text' )
            } ).trim();
            undoStack = this.model.get( 'undoStack' );
            currentElements = undoStack[undoStack.length - 1];
            elementsCount = currentElements.length;
            for ( index = 0; index < elementsCount; index++ ) {
                shapeInfoInUndoStack = currentElements[index];
                if ( shapeInfoInUndoStack.shapeUniqueCode === shapeCode && shapeInfoInUndoStack.isOriginal === shape.isOriginal ) {
                    value = shapeInfoInUndoStack.userInput;
                    break;
                }
            }
            if ( insertAfter === null || typeof insertAfter === 'undefined' ) {
                if ( shape.isOriginal ) {
                    this._$actualTable.append( _rowEntry );
                }
                else {
                    this._$duplicatesTable.parent().parent().show();
                    this._$duplicatesTable.append( _rowEntry );
                }
            }
            else {
                if ( shape.isOriginal ) {
                    $tableToInsertIn = this._$actualTable;
                }
                else {
                    this._$duplicatesTable.parent().parent().show();
                    $tableToInsertIn = this._$duplicatesTable;
                }
                if ( insertAfter === -1 ) {
                    $tableToInsertIn.prepend( _rowEntry );
                }
                else {
                    $( _rowEntry ).insertAfter( $tableToInsertIn.find( '.shape-table-row-' + insertAfter ) );
                }
            }
            // add input box
            this._addInputBoxInRow( shapeCode, actualOrDuplicate, value );
            this.$( '.actual-shape-table-conatiner' ).scrollTop( 12000 );
            this.$( '.duplicate-shape-table-conatiner' ).scrollTop( 12000 );
        },

        /**
        * Called from within the _addEntryInTable method; it adds an input box view in the table for the shape whose
        * shapeCode is passed.
        *
        * @method _addInputBoxInRow
        * @param shapeCode {String} The shape's unique code as stored in it's paper item.
        * @param actualOrDuplicate {String} 'actual' if it is to be added in the table for actual shapes; else
        * 'duplicate'.
        * @param value {String} The input box value as entered by the user.
        * @private
        */
        _addInputBoxInRow: function _addInputBoxInRow( shapeCode, actualOrDuplicate, value ) {

            var self, options, InputBoxClass, inputBoxView, id = actualOrDuplicate + '-shape-input-box-' + shapeCode;
            self = this;
            options = {
                filePath: this.filePath,
                idPrefix: this.idPrefix,
                containerId: this.idPrefix + id,
                inputType: MathInteractives.Common.Components.Theme2.Views.InputBox.INPUT_TYPE_CUSTOM,
                maxCharLength: 5,
                player: this.player,
                manager: this.manager,
                allowNegative: false,
                width: '67',
                height: '35',
                precision: 2,
                previousValue: 0,
                // 1st alternative: 0-3 digits
                // 2nd alternative: 0-2 digits, followed by a dot, followed by 1-2 digits
                // 3rd alternative: 0-3 digits, followed by a dot, followed by 0-1 digits
                regexString: /^(\d{0,3}|\d{0,2}\.\d{1,2}|\d{0,3}\.\d{0,1})$/,
                //unit: unitText + ' ' + String.fromCharCode(58),
                //unitElementPosition: 'left',
                //unitColor: 'textBoxStyle',
                defaultInput: '',
                defaultTextOnEmptyInputBox: '',
                defaultValue: ''
                // unitAccText: this.getAccMessage( 'estimate-input-text', 0 )
            };
            InputBoxClass = MathInteractives.global.Theme2.InputBox;
            inputBoxView = InputBoxClass.createInputBox( options );

            this.listenTo( inputBoxView, inputBoxView.containerId + InputBoxClass.ENTER_PRESS_EVENT_NAME,
                function ( event ) {
                    if(inputBoxView.getCurrentInputValue() === null){
                        return;
                    }
                    self._onCheckClick( event, inputBoxView );
                }
            );
            this.listenTo( inputBoxView, InputBoxClass.INPUT_TYPE_BLUR_EVENT, function ( inputBoxString, event, isValidInput ) {
                self._onInputBoxBlur( event, inputBoxView );
            } );

            this.listenTo( inputBoxView, InputBoxClass.INPUT_TYPE_FOCUS_EVENT, function ( event ) {
                self._onInputBoxFocus( event, inputBoxView );
            } );

            //this.listenTo( inputBoxView, options.containerId + InputBoxClass.CUSTOM_CHANGE_EVENT_NAME,
            //    function ( event, charCode, validInput, androidDevicePreviousValue ) {
            //        if ( validInput ) {
            //            self._onInputChange( event, inputBoxView );
            //        }
            //    }
            //);

            // Using input event and checking for change at interactive level
            //  as input box component was not triggering change for inputs "5", "5.", "05", "05.", "05.0"
            //this.listenTo( inputBoxView, options.containerId + InputBoxClass.INPUT_EVENT_NAME,
            this.listenTo( inputBoxView, options.containerId + InputBoxClass.KEYUP_EVENT_NAME,
                function ( event, charcode, isInputValid, resultantString ) {
                    var prevValue = inputBoxView.model.getPreviousValue(),
                        currValue = inputBoxView.getCurrentInputValue();
                    if ( currValue === null ) currValue = '';
                    if ( prevValue === null ) prevValue = '';
                    if ( prevValue !== currValue ) {
                        self._onInputChange( event, inputBoxView );
                    }
                }
            );

            inputBoxView.setCurrentInputValue( value );

            if ( actualOrDuplicate === this.modelNamespace.SHAPE_TYPES.ACTUAL ) {
                this.actualShapeInputBoxes[shapeCode] = inputBoxView;
            }
            else {
                this.duplicateShapeInputBoxes[shapeCode] = inputBoxView;
            }
        },

        _createScreenForTextBoxes: function _createScreenForTextBoxes( id, tabIndex, type, shapeNumber ) {
            var tempObj = {
                "accId": id + 'textbox',
                "id": id + 'textbox',
                "type": "text",
                "tabIndex": tabIndex,
                "messages": []
            };
            if ( type === 'actual' ) {
                tempObj.messages.push(
                {
                    "id": 0,
                    "isAccTextSame": false,
                    "message": {
                        "loc": '',
                        "acc": this.getAccMessage( 'textbox-texts', 0, [shapeNumber, shapeNumber] )
                    }
                },
                {
                    "id": 1,
                    "isAccTextSame": false,
                    "message": {
                        "loc": '',
                        "acc": this.getAccMessage( 'textbox-texts', 2, [shapeNumber, shapeNumber] )
                    }
                },
                {
                    "id": 2,
                    "isAccTextSame": false,
                    "message": {
                        "loc": '',
                        "acc": this.getAccMessage( 'textbox-texts', 4 )
                    }
                } );
            }
            else {
                tempObj.messages.push(
                {
                    "id": 0,
                    "isAccTextSame": false,
                    "message": {
                        "loc": '',
                        "acc": this.getAccMessage( 'textbox-texts', 1, [shapeNumber, shapeNumber] )
                    }
                },
                {
                    "id": 1,
                    "isAccTextSame": false,
                    "message": {
                        "loc": '',
                        "acc": this.getAccMessage( 'textbox-texts', 3, [shapeNumber, shapeNumber] )
                    }
                },
                {
                    "id": 2,
                    "isAccTextSame": false,
                    "message": {
                        "loc": '',
                        "acc": this.getAccMessage( 'textbox-texts', 4 )
                    }
                } );
            }
            return tempObj
        },


        /**
        * Called on blur event of input box; used to store values of input box in model.
        *
        * @method _onInputBoxBlur
        * @private
        */
        _onInputBoxBlur: function _onInputBoxBlur( event, inputBoxView ) {
            var input, $inputBoxRow, inputBoxRowId, shapeCode, isOriginal,
                id = this.$( event.target ).parent()[0].id.replace( this.idPrefix, '' );
            input = inputBoxView.getCurrentInputValue();
            if ( input !== null ) {
                // for non-empty input boxes
                input = Number( input );
                if ( isNaN( input ) ) {
                    input = 0;
                }
                inputBoxView.setCurrentInputValue( input.toString() );
                this.changeAccMessage( id, 1 );
            }
            else {
                this.changeAccMessage( id, 0 );
            }
            this._storeInputBoxValuesInUndoStack();
            $inputBoxRow = $( event.target ).parents( '.shape-table-row' );
            $inputBoxRow.removeClass( 'editing' );
            inputBoxRowId = $inputBoxRow[0].id;
            shapeCode = inputBoxRowId.slice( inputBoxRowId.lastIndexOf( '-' ) + 1 );
            isOriginal = ( event.target.id.indexOf( 'actual' ) !== -1 );
            this.model.trigger( this.modelNamespace.EVENTS.CHANGE_SHAPE_BORDER_COLOR, shapeCode, isOriginal, false );
        },

        /**
        * On input box focus, remove input box container's styles, remove badges.
        *
        * @mehtod _onInputBoxFocus
        * @param event {Object} Event object.
        * @param inputBoxView {Object} The backbone view instance of the input box that was focused.
        */
        _onInputBoxFocus: function _onInputBoxFocus( event, inputBoxView ) {
            this.stopReading();
            // add input box view cid in list of input boxes to check
            if ( this._inputBoxesToCheck.indexOf( inputBoxView.cid ) === -1 ) {
                this._inputBoxesToCheck.push( inputBoxView.cid );
            }
            var $inputBoxRow, $inputBoxContainer, $badge,
                eventsEnum = this.modelNamespace.EVENTS,
                inputBoxId, shapeCode, isOriginal;
            $inputBoxRow = inputBoxView.$el.parents( '.shape-table-row' );
            $inputBoxContainer = $inputBoxRow.find( '.input-box-container' );
            $badge = $inputBoxContainer.find( '.input-box-badge' );

            $inputBoxRow.addClass( 'editing' );
            $inputBoxContainer.removeClass( 'correct incorrect' );
            // $badge.css( 'background-image', 'none' );

            inputBoxId = inputBoxView.el.id;
            shapeCode = inputBoxId.slice( inputBoxId.lastIndexOf( '-' ) + 1 );
            isOriginal = ( inputBoxId.indexOf( 'actual' ) !== -1 );

            if ( isOriginal ) {
                this._$totalBadge.removeClass( 'correct incorrect' );
                //this._$totalBadge.css( 'background-image', 'none' );
            }
            this.model.trigger( eventsEnum.ADD_REMOVE_SHAPE_LABEL, false, { shapeCode: shapeCode, isOriginal: isOriginal } );
            this.model.trigger( eventsEnum.CHANGE_SHAPE_BORDER_COLOR, shapeCode, isOriginal, true );
        },

        /**
        * Event handler for event fired by input box view when the content of the input box is changed.
        *
        * @method _onInputChange
        * @param inputBoxView {Object} The input box view instance.
        * @private
        */
        _onInputChange: function _onInputChange( event, inputBoxView ) {
            this._updateTotal();
            if ( this._inputBoxesToCheck.indexOf( inputBoxView.cid ) === -1 ) {
                this._inputBoxesToCheck.push( inputBoxView.cid );
            }
            if ( inputBoxView.getCurrentInputValue() === null ) {
                this._inputBoxesToCheck.splice( this._inputBoxesToCheck.indexOf( inputBoxView.cid ), 1 );
            }
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CHECK, ( this._inputBoxesToCheck.length === 0 ) );
        },

        /**
        * Updates the total of actual shapes' input boxes.
        *
        * @method _updateTotal
        * @private
        */
        _updateTotal: function _updateTotal() {
            var sum = 0,
                index,
                input,
                showNull = true,
                inputBoxes = this.actualShapeInputBoxes;
            for ( index in inputBoxes ) {
                input = inputBoxes[index].getCurrentInputValue();
                if ( input !== null ) {
                    showNull = false;
                }
                input = +input;
                if ( !isNaN( input ) ) {
                    sum += input;
                }
            }
            if ( showNull ) {
                sum = '';
                this.changeAccMessage( 'actual-shape-table-footer-cell-1', 0, [0] );
                this.$('.footer-cell-1').removeClass('correct incorrect');
            }
            else {
                sum = +sum.toFixed( 2 );
                this.changeAccMessage( 'actual-shape-table-footer-cell-1', 0, [sum] );
            }
            this._$totalArea.text( sum );
            this._$tablesContainer.find( '.footer-cell-0' ).width(
                this.$( '.actual-shape-table-wrapper' ).width() - this._$tablesContainer.find( '.footer-cell-1' ).width() -
                this._$tablesContainer.find( '.footer-cell-2' ).outerWidth( true )
            );
        },

        /**
        * Stores the values of input boxes in the undo stack in model.
        *
        * @method _storeInputBoxValuesInUndoStack
        * @private
        */
        _storeInputBoxValuesInUndoStack: function _storeInputBoxValuesInUndoStack() {
            var index, actualInputBoxes, duplicateInputBoxes, inputBoxView, value,
                undoStack, currentElements, elementsCount, shape, shapeCode;
            actualInputBoxes = this.actualShapeInputBoxes;
            duplicateInputBoxes = this.duplicateShapeInputBoxes;
            undoStack = this.model.get( 'undoStack' );
            currentElements = undoStack[undoStack.length - 1];
            elementsCount = currentElements.length;
            for ( index = 0; index < elementsCount; index++ ) {
                shape = currentElements[index];
                shapeCode = shape.shapeUniqueCode;
                inputBoxView = shape.isOriginal ? actualInputBoxes[shapeCode] : duplicateInputBoxes[shapeCode];
                value = inputBoxView.getCurrentInputValue();
                shape['userInput'] = value;
            }
        },

        /**
        * Updates table on undo by empting it and re-entering the new update rows.
        *
        * @method _updateTableOnUndo
        * @param newShapes {Array} An array of paper.js objects of all current shapes on the working canvas.
        * @param undoneStep {Object} Data from the undo stack about the last step undone.
        */
        _updateTableOnUndo: function _updateTableOnUndo( newShapes, undoneStep ) {
            /*
            var index, newShapesCount = newShapes.length, newShape,
                shapeTypes = this.modelNamespace.SHAPE_TYPES, actualOrDuplicate;
            this._emptyTable();
            for ( index = 0; index < newShapesCount; index++ ) {
                newShape = newShapes[index];
                actualOrDuplicate = newShape.isOriginal ? shapeTypes.ACTUAL : shapeTypes.DUPLICATE;
                this._addEntryInTable( newShape );
            }
            this._updateTotal();
            */
            var count, newShapesCount = newShapes.length,
                undoStack = this.model.get( 'undoStack' ),
                stepToDisplay = undoStack[undoStack.length - 1],
                newShape, newShapeCode, isOriginal,
                _updateAddEntryInTable, self = this,
                existingActualShapes, existingCopies,
                actualTableInsertAfter = -1, copyTableInsertAfter = -1;
            existingActualShapes = _.keys( this.actualShapeInputBoxes );
            existingCopies = _.keys( this.duplicateShapeInputBoxes );

            // updates row entry if already exists, adds the row if it didn't
            _updateAddEntryInTable = function ( shapeCode, isNotCopy, checkInList, insertAfter ) {
                if ( checkInList.indexOf( shapeCode ) !== -1 ) { //if exists
                    var existingShapeData, existingValue, index, i;
                    for ( index = 0; index < undoneStep.length; index++ ) {
                        existingShapeData = undoneStep[index];
                        if ( existingShapeData.shapeUniqueCode.toString() === shapeCode &&
                            existingShapeData.isOriginal === isNotCopy ) {
                            for ( i = 0; i < stepToDisplay.length; i++ ) {
                                if ( stepToDisplay[i].shapeUniqueCode.toString() === shapeCode &&
                                    stepToDisplay[i].isOriginal === isNotCopy ) {
                                    existingValue = stepToDisplay[i].userInput;
                                    break;
                                }
                            }
                            // remove data of traversed shape so as to reduce the next traversal
                            undoneStep.splice( index, 1 );
                            break;
                        }
                    }
                    self._updateEntry( newShape, existingValue );
                }
                else {
                    self._addEntryInTable( newShape, insertAfter );
                }
            };

            // traverse through shapes to be displayed
            // update or add entries depending on whether they exist or not
            for ( count = 0; count < newShapesCount; count++ ) {
                newShape = newShapes[count];
                newShapeCode = newShape.shapeUniqueCode.toString();
                isOriginal = newShape.isOriginal;
                if ( isOriginal ) {
                    _updateAddEntryInTable( newShapeCode, isOriginal, existingActualShapes, actualTableInsertAfter );
                    actualTableInsertAfter = newShapeCode;
                }
                else {
                    _updateAddEntryInTable( newShapeCode, isOriginal, existingCopies, copyTableInsertAfter );
                    copyTableInsertAfter = newShapeCode;
                }
            }
            // traverse through remaining existing entries
            // deleting them
            for ( count = 0; count < undoneStep.length; count++ ) {
                this._removeEntryFromTable( undoneStep[count].shapeUniqueCode, undoneStep[count].isOriginal );
            }
            this._updateTotal();
        },

        /**
        * The method removes all entries from the table by calling '_removeEntryFromTable' method in a loop.
        *
        * @method _emptyTable
        * @private
        */
        _emptyTable: function _emptyTable() {
            var shapeCode, actualShapeInputBoxes = this.actualShapeInputBoxes;
            for ( shapeCode in actualShapeInputBoxes ) {
                this._removeEntryFromTable( shapeCode );
            }
            this._updateTotal();
        },

        /**
        * Removes entries from tables for shapes whose codes are passed in an array as parameter.
        *
        * @method _removeEntriesForShapes
        * @param shapesCodes {Array} Array of shapes' unique codes that need to be removed from the table.
        * @private
        */
        _removeEntriesForShapes: function _removeEntriesForShapes( shapesCodes ) {
            for ( var index in shapesCodes ) {
                this._removeEntryFromTable( shapesCodes[index] );
            }
            this._updateTotal();
        },

        /**
        * Given a shape's code, this method removes the corresponding entry of the shape from both the table.
        *
        * @method _removeEntryFromTable
        * @param shapeCode {String} The shape's unique code as stored in the shape's paper item.
        * @param [removeFromOriginalTable] {Boolean} If true, will remove the entry from the actual shapes' table. If
        * false, will remove entry from the duplicates' table. If not passed, will remove the entry from both the
        * tables.
        * @private
        */
        _removeEntryFromTable: function _removeEntryFromTable( shapeCode, removeFromOriginalTable ) {
            // remove input box views
            var inputBoxView,
                removeBoth = ( removeFromOriginalTable === null || typeof removeFromOriginalTable === 'undefined' ),
                $removeFrom = this.$el;
            if ( removeBoth || removeFromOriginalTable === true ) {
                inputBoxView = this.actualShapeInputBoxes[shapeCode];
                if ( inputBoxView ) {
                    inputBoxView.remove();
                    delete this.actualShapeInputBoxes[shapeCode];
                }
                this._$actualTable.find( '.shape-table-row-' + shapeCode ).remove();
            }
            if ( removeBoth || removeFromOriginalTable === false ) {
                inputBoxView = this.duplicateShapeInputBoxes[shapeCode];
                if ( inputBoxView ) {
                    inputBoxView.remove();
                    delete this.duplicateShapeInputBoxes[shapeCode];
                }
                this._$duplicatesTable.find( '.shape-table-row-' + shapeCode ).remove();
                // hide duplicate's table if no copy is present
                if ( this._$duplicatesTable.find( '.shape-table-row' ).length === 0 ) {
                    this._$duplicatesTable.parent().parent().hide();
                }
            }
            if ( this._inputBoxesToCheck.length ) this._inputBoxesToCheck = [];
        },

        /**
        * Updates the row entry of the shape passed by calling _updateImageForShape method and setting the passed value
        * in input box.
        *
        * @method _updateEntry
        * @param shape {Object} Paper.js object of the shape whose entry needs to be updated.
        * @param userInput {String} The value to be shown in the input box of the row.
        * @private
        */
        _updateEntry: function _updateEntry( shape, userInput ) {
            this._updateImageForShape( shape );
            if ( shape.isOriginal ) {
                this.actualShapeInputBoxes[shape.shapeUniqueCode].setCurrentInputValue( userInput );
                if(userInput === null || typeof userInput === 'undefined'){
                    this.actualShapeInputBoxes[shape.shapeUniqueCode].$el.parent().removeClass('incorrect correct');
                }
            }
            else {
                this.duplicateShapeInputBoxes[shape.shapeUniqueCode].setCurrentInputValue( userInput );
                if(userInput === null || typeof userInput === 'undefined'){
                    this.duplicateShapeInputBoxes[shape.shapeUniqueCode].$el.parent().removeClass('incorrect correct');
                }
            }
        },

        /**
        * Updates the miniature image of given shape in table.
        *
        * @method _updateImageForShape
        * @param shape {Object} The paper.js object of the shape whose image is to be updated in the table.
        * @private
        */
        _updateImageForShape: function _updateImageForShape( shape ) {
            var shapeCode = shape.shapeUniqueCode,
                modelNamespace = this.modelNamespace,
                shapeTypes = modelNamespace.SHAPE_TYPES,
                isOriginal = shape.isOriginal,
                _$table = ( isOriginal ) ? this._$actualTable : this._$duplicatesTable,
                _$row = _$table.find( '.shape-table-row-' + shapeCode ),
                _$shapeDiv = _$row.find( '.shape-miniature' ),
                _$shapeDivDuringEdit = _$row.find( '.shape-miniature-during-edit' ),
                maxImageHeight = modelNamespace.MINI_SHAPE_MAX_IMAGE_HEIGHT,
                scaledImageData = this._getScaledImageOfPaperItem( shape, maxImageHeight, modelNamespace.MINI_SHAPE_MAX_IMAGE_WIDTH ),
                imageHeight = scaledImageData.height,
                margin = Math.floor(( maxImageHeight - imageHeight ) / 2 ) + 'px auto';
            _$shapeDiv.css( {
                'background-image': 'url(' + scaledImageData.url + ')',
                'width': scaledImageData.width,
                'height': imageHeight,
                'margin': margin
            } );
        },

        /**
        * Returns base-64 data url of a scaled down image of the paper item passed.
        *
        * @method _getScaledImageOfPaperItem
        * @param paperItem {Object} Paper item whose scaled down image is required.
        * @param [maxScaledHeight] {Number} The maximum height that the resultant image could have.
        * @param [maxScaledWidth] {Number} The maximum width that the resultant image could have.
        * @return {String} Base 64 data URL of the scaled down image.
        * @private
        */
        _getScaledImageOfPaperItem: function _getScaledImageOfPaperItem( paperItem, maxScaledHeight, maxScaledWidth ) {
            var isOriginal = paperItem.isOriginal,
                fillColor = isOriginal ? this.model.get( 'defaultShapeColors' )['normal'] : this.model.get( 'copiedShapeColors' )['normal'],
                itemBounds, boundingHeight, boundingWidth,
                scalingFactor,
                raster, base64ImageUrl;
            itemBounds = paperItem.getStrokeBounds();
            boundingHeight = itemBounds.height;
            boundingWidth = itemBounds.width;

            maxScaledHeight = maxScaledHeight || boundingHeight;
            maxScaledWidth = maxScaledWidth || boundingWidth;

            // add a fix for resize issue on rasterize
            maxScaledHeight = maxScaledHeight || boundingHeight;
            maxScaledWidth = maxScaledWidth || boundingWidth;

            scalingFactor = Math.min( maxScaledHeight / boundingHeight, maxScaledWidth / boundingWidth );
            raster = paperItem.clone( false );
            raster.fillColor = fillColor;
            raster.applyMatrix( false );

            raster.scale( scalingFactor );

            raster = raster.rasterize();
            base64ImageUrl = raster.toDataURL();
            raster.remove();
            return {
                url: base64ImageUrl,
                height: boundingHeight * scalingFactor,
                width: boundingWidth * scalingFactor
            };
        },

        /**
        * Compares and checks the area entered by the user to the actual area of the shapes on canvas. If found correct
        * add a green badge and if incorrect add a red badge.
        *
        * @method _checkInputBoxValues
        * @param shapes {Array} An array of paper.js objects representing the shapes on the canvas.
        * @param paperScope {Object} The paper.js paper scope.
        * @private
        */
        _checkInputBoxValues: function _checkInputBoxValues( shapes, paperScope ) {
            if ( this.$el.find( '.check-button-container' ).hasClass( 'disabled' ) ) {
                return;
            }
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CHECK, true );
            var index, numberOfShapes, currentShape,
                modelNamespace = this.modelNamespace,
                strokeColors = modelNamespace.SHAPE_STROKE_COLORS,
                correctStrokeColor = strokeColors.CORRECT,
                incorrectStrokeColor = strokeColors.INCORRECT,
                area, input,
                tolerance,
                gridStepSize, conversionFactor,
                isOriginal, shapeCode,
                inputBoxView,
                $inputBoxContainer, $badge,
                correctTotal = true, checkTotal = false,
                accId, firstId,
            correctBadgeImageUrl, wrongBadgeImageUrl;
            numberOfShapes = shapes.length;
            gridStepSize = modelNamespace.GAP_BETWEEN_POINTS;
            conversionFactor = 1 / ( gridStepSize * gridStepSize );

            correctBadgeImageUrl = 'url(' + modelNamespace.LABEL_URL.CORRECT + ')';
            //wrongBadgeImageUrl = 'url(' + modelNamespace.LABEL_URL.INCORRECT + ')';

            for ( index = 0; index < numberOfShapes; index++ ) {
                currentShape = shapes[index];
                shapeCode = currentShape.shapeUniqueCode;
                isOriginal = currentShape.isOriginal;
                inputBoxView = ( isOriginal ) ? this.actualShapeInputBoxes[shapeCode] : this.duplicateShapeInputBoxes[shapeCode];
                input = inputBoxView.getCurrentInputValue();
                accId = inputBoxView.$el.children()[0].id.replace( this.idPrefix, '' );
                if ( index === 0 ) {
                    firstId = accId;
                }
                // if input box is empty, continue to next input box
                if ( input === null || input.length === 0 ) {
                    if ( isOriginal ) {     //if original shape input box is empty, then total must be wrong
                        correctTotal = false;
                    }
                    continue;
                }

                // for non-empty input boxes
                input = Number( input );
                if ( isNaN( input ) ) {
                    input = 0;
                }
                inputBoxView.setCurrentInputValue( input.toString() );
                area = Math.abs( currentShape.area ) * conversionFactor;

                if ( isOriginal && !checkTotal ) {
                    checkTotal = true;
                }

                if ( this._checkAll === false && this._inputBoxesToCheck.indexOf( inputBoxView.cid ) === -1 ) {
                    if ( isOriginal && input !== area ) {
                        correctTotal = false;
                    }
                    //continue;
                }

                $inputBoxContainer = inputBoxView.$el.parents( '.input-box-container' );
                $badge = $inputBoxContainer.find( '.input-box-badge' );


                if ( input === area ) {
                    this.model.trigger( modelNamespace.EVENTS.ADD_REMOVE_SHAPE_LABEL, true, {
                        shape: currentShape,
                        inputValue: input,
                        correctLabel: true
                    } );
                    $inputBoxContainer.addClass( 'correct' ).removeClass( 'incorrect' );
                    this.changeAccMessage( accId, 2, [input, currentShape.accNumber, 'correct'] );
                    $badge.css( 'background-image', correctBadgeImageUrl );
                }
                else {
                    if ( isOriginal ) {
                        correctTotal = false;
                    }
                    currentShape.strokeColor = incorrectStrokeColor;
                    this.model.trigger( modelNamespace.EVENTS.ADD_REMOVE_SHAPE_LABEL, true, {
                        shape: currentShape,
                        inputValue: input,
                        correctLabel: false
                    } );
                    $inputBoxContainer.addClass( 'incorrect' ).removeClass( 'correct' );
                    this.changeAccMessage( accId, 2, [input, currentShape.accNumber, 'incorrect'] );
                    // $badge.css( 'background-image', wrongBadgeImageUrl );
                }
            }
            if ( checkTotal ) {
                if ( correctTotal ) {
                    this._$totalBadge.addClass( 'correct' ).removeClass( 'incorrect' );
                    this.changeAccMessage( 'actual-shape-table-footer-cell-1', 1, [Number( this._$totalArea.text() ), 'correct'] );
                    // this._$totalBadge.css( 'background-image', correctBadgeImageUrl );
                }
                else {
                    this._$totalBadge.addClass( 'incorrect' ).removeClass( 'correct' );
                    this.changeAccMessage( 'actual-shape-table-footer-cell-1', 1, [Number( this._$totalArea.text() ), 'incorrect'] );
                    //this._$totalBadge.css( 'background-image', wrongBadgeImageUrl );
                }
            }
            this.setFocus( firstId );
            this._inputBoxesToCheck = [];
            this._checkAll = false;
            paperScope.view.draw();
        },

        /**
        * Enables/disables the check button depending on whether there's any value in the tables' input boxes.
        *
        * @method _enableDisableCheckBtn
        * @private
        */
        _enableDisableCheckBtn: function _enableDisableCheckBtn() {
            var disable = true, index, $inputBoxes, value;
            $inputBoxes = this._$tablesContainer.find( 'input' );
            for ( index = $inputBoxes.length - 1; index >= 0; index-- ) {
                value = $inputBoxes[index].value;
                if ( value !== '' && value !== null ) {
                    disable = false;
                    break;
                }
            }
            this.model.trigger( this.modelNamespace.EVENTS.DISABLE_BUTTON, this.modelNamespace.ACTION_ENUM.CHECK, disable );
        },

        /**
        * Removes the badges from the input boxes and resets the border color of the shapes.
        *
        * @method _removeAllInputBoxBadges
        * @param shapes {Array} A list of paper objects representing all the shapes on the canvas.
        * @private
        */
        _removeAllInputBoxBadges: function _removeAllInputBoxBadges( shapes ) {
            var index, shape,
                inputBoxView,
                isOriginal, shapeCode,
                strokeColors = this.modelNamespace.SHAPE_STROKE_COLORS,
                defaultStrokeColor = strokeColors.NORMAL,
                copyStrokeColor = strokeColors.COPY,
                strokeColor,
                $inputBoxContainer, $badge;

            for ( index in shapes ) {
                shape = shapes[index];
                shapeCode = shape.shapeUniqueCode;
                isOriginal = shape.isOriginal;
                if ( isOriginal ) {
                    strokeColor = defaultStrokeColor;
                    inputBoxView = this.actualShapeInputBoxes[shapeCode];
                }
                else {
                    strokeColor = copyStrokeColor;
                    inputBoxView = this.duplicateShapeInputBoxes[shapeCode];
                }
                $inputBoxContainer = inputBoxView.$el.parents( '.input-box-container' );
                $badge = $inputBoxContainer.find( '.input-box-badge' );

                //$badge.css( 'background-image', 'none' );
                $inputBoxContainer.removeClass( 'correct incorrect' );
                shape.strokeColor = strokeColor;
            }
            //this._$totalBadge.css( 'background-image', 'none' );
            this._$totalBadge.removeClass( 'correct incorrect' );
            this._checkAll = true;
            this._enableDisableCheckBtn();
        }
    } );
} )();
