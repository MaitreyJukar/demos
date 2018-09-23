(function () {
    'use strict';

    /**
    * View for rendering pan balance and its related events
    * Currently all variable labels are considered as X, for any other label, change
    * @class PanBalance
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.PanBalance = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Holds the interactivity manager reference
        * @property manager
        * @default null
        * @private
        */
        manager: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Holds the bool value weather draggable is enabled or not
        *
        * @property isDraggable
        * @type Bool
        * @default false
        */
        isDraggable: false,

        /**
        * Holds the bool value which decide the Pan to be filled or not
        *
        * @property isDraggable
        * @type Bool
        * @default false
        */
        isFilled: true,

        /**
        * Holds the current rotation angle of balance
        *
        * @property currentAngle
        * @type int
        * @default 0
        */
        currentAngle: 0,

        /**
        * Holds the row,column co-ordinaes for tiles of 'x' added till now in the right pan
        *
        * @property xAddedTill_R
        * @type Object
        * @default { row: 3, col: 0 }
        */
        xAddedTill_R: { row: 3, col: 0 },
        /**
        * Holds the row,column co-ordinates to start filling co-efficient tiles in right pan
        *
        * @property startOthertilesFrom_R
        * @type Object
        * @default { row: 3, col: 0 }
        */
        startOthertilesFrom_R: { row: 0, col: 0 },
        /**
        * Holds the row,column co-ordinaes for tiles of 'x' added till now in the left pan
        *
        * @property xAddedTill_L
        * @type Object
        * @default { row: 3, col: 0 }
        */
        xAddedTill_L: { row: 3, col: 0 },
        /**
        * Holds the row,column co-ordinates to start filling co-efficient tiles in left pan
        *
        * @property startOthertilesFrom_L
        * @type Object
        * @default { row: -1, col: 0 }
        */
        startOthertilesFrom_L: { row: 0, col: 0 },

        /**
        * Boolean to show dispenser or not
        *
        * @property enableDispenser
        * @type boolean
        * @default false
        */
        enableDispenser: false,

        /**
        * Boolean for storing animation on/off
        *
        * @property isAnimation
        * @type boolean
        * @default false
        */
        isAnimation: false,

        /**
        * An id counter to assign id after drop
        *
        * @property droppedTileId
        * @type Number
        * @default 0
        */
        droppedTileId: 0,


        /**
        * An object to perform balance rotation
        *
        * @property stepRotateObject
        * @type Object
        * @default { rotate: 0 }
        */
        stepRotateObject: { rotate: 0 },


        /**
        * A string identifying the trash can
        *
        * @property trashCanID
        * @type String
        * @default null
        */
        trashCanID: null,

        /**
        * A string identifying the containment element
        *
        * @property containmentID
        * @type String
        * @default null
        */
        containmentID: null,

        /**
        * A boolean to identify the disabled/enabled state of pan balance
        *
        * @property isPanDisabled
        * @type Boolean
        * @default false
        */
        isPanDisabled: false,

        /**
        * A string to prepend for id to enable multiple instances of pan-balance
        *
        * @property prependID
        * @type String
        * @default null
        */
        prependID: null,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {

            this.prependID = this.model.get('prependID');
            this.idPrefix = this.model.get('idPrefix');
            this.idPrefix = this.idPrefix + this.prependID;
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('path');
            this.isDraggable = this.model.get('isDraggable');
            this.dispenserData = this.model.get('dispenserData');
            this.isFilled = this.model.get('isFilled');
            this.enableDispenser = this.model.get('enableDispenser');
            this.defaultData = this.model.get('defaultData');
            this.trashCanID = this.model.get('trashCanID');
            this.containmentID = this.model.get('containmentID');
            this.render();
        },

        /**
        * Renders pan balance view
        *
        * @method render
        **/
        render: function render() {
            var panBalanceProps = {
                idPrefix: this.idPrefix
            };

            var panBalanceHtml = MathInteractives.Common.Components.templates['panBalance'](panBalanceProps).trim();
            this.$el.append(panBalanceHtml);
            this._setBackgroundImage('.left-pan,.right-pan,.small-rod,.base,.center-rod');
            this._attachEvents();
            this.renderDispenser();

            if (this.model.get('isDraggable')) {
                this._initializeDroppableContainers();
                if (this.defaultData) {
                    this._renderDefaultTiles(this.defaultData);
                }
            }


            this._activateTrashCan(this.trashCanID);
            //this.setPansData({ left: { a: 7, b: 2 }, right: { c: 9 } });
        },

        /*
        * Resets variables used in rendering pan
        * @method _resetData
        */
        _resetData: function _resetData(leftRowColCount, rightRowColCount) {
            this.xAddedTill_R = { row: 3, col: 0 };

            this.startOthertilesFrom_R = { row: rightRowColCount.rowCount - 1, col: 0 };

            this.xAddedTill_L = { row: 3, col: 0 };

            this.startOthertilesFrom_L = { row: leftRowColCount.rowCount - 1, col: 0 };
        },
        /*
        * Attach Events
        * @method _attachEvents
        * @private
        */
        _attachEvents: function _attachEvents() {
            this.model.on('pan-data-change', $.proxy(this.eventHandlers._panDataChangeEvent, this));
            this.model.on('pan-showX-change', $.proxy(this.eventHandlers._panShowXChangeEvent, this));
        },


        /**
        * Sets Background Image For Pan Components
        * @method setBackgroundImage
        * @param {String} jQuerySelector 
        */
        _setBackgroundImage: function _setBackgroundImage(jQuerySelector) {
            if (jQuerySelector) {
                var panImagePath = this.filePath.getImagePath('pan-balance');
                this.$(jQuerySelector).css({ 'background-image': 'url(' + panImagePath + ')' });
            }
        },


        /**
        * Animates Pan Balance
        * @method animatePanBalance
        * @param {String} position 
        */
        animatePanBalance: function animatePanBalance(animatePosition) {
            var rotateAngle = 0;
            switch (animatePosition) {
                case 'LEFT':
                    rotateAngle = -5;
                    break;
                case 'RIGHT':
                    rotateAngle = 5;
                    break;

            };

            var duration = 1000, self = this,
                rodlength = parseInt(this.$('.center-rod').css('width').split('px')[0]),
                distFromCent = rodlength / 2,
                prevDistTravelled = 0,
                $rod = self.$('.center-rod'),
                $lpanWrapper = self.$('.left-pan-wrapper'),
                $rpanWrapper = self.$('.right-pan-wrapper'),
                distanceToMoveUp = null,
                $domRefreshDiv = null,
                domRefreshElements = [];

            this.model.set('isAnimation', true);
            this.model.set('stepRotateObject', $.extend({}, { rotate: this.currentAngle }));

            $(this.model.get('stepRotateObject')).stop().animate(
            { rotate: rotateAngle },
            {
                step: function (rotateAngle) {
                    distanceToMoveUp = Math.sin(Math.PI / 180 * rotateAngle) * distFromCent;
                    $lpanWrapper.css('top', -distanceToMoveUp + 'px');
                    $rpanWrapper.css('top', distanceToMoveUp + 'px');
                    $rod.css({
                        '-webkit-transform': 'rotate(' + rotateAngle + 'deg)',
                        '-moz-transform': 'rotate(' + rotateAngle + 'deg)',
                        '-ms-transform': 'rotate(' + rotateAngle + 'deg)',
                        'transform': 'rotate(' + rotateAngle + 'deg)'
                    });

                    $domRefreshDiv = $('<span></span>');
                    $('body').append($domRefreshDiv);
                    domRefreshElements.push($domRefreshDiv.get(0));

                    self.currentAngle = rotateAngle;
                },
                complete: function () {
                    self.model.set('isAnimation', false);
                    $(domRefreshElements).remove();
                },
                duration: duration
            });

        },


        /**
        * Renders Pans and add tiles to pan 
        *
        * @method renderPan
        **/
        renderPan: function renderPan() {
            if (this.enableDispenser) {
                return;
            }
            var currentPanData = this.model.getCurrentPansData(),
                leftPan = currentPanData.left,
                rightPan = currentPanData.right, $panContainer, noOfTiles = 0, rowCount, colCount,
                $leftPanParentContainer = this.$('.left-tile-container .static-container'),
                $rightPanParentContainer = this.$('.right-tile-container .static-container'), leftRowColCount, rightRowColCount;



            if (!this.isDraggable && this.isFilled) {
                leftRowColCount = this._calculateRowsCols(Math.abs(leftPan.a), (Math.abs(leftPan.b) + Math.abs(leftPan.c)));
                rightRowColCount = this._calculateRowsCols(Math.abs(rightPan.a), (Math.abs(rightPan.b) + Math.abs(rightPan.c)));
                this._resetData(leftRowColCount, rightRowColCount);

                //adding left pan elements
                $panContainer = this._createTilesContainer(leftRowColCount);
                this.addElementsToPan($panContainer, leftPan.a, leftRowColCount, true, 'LEFT');
                this.addElementsToPan($panContainer, leftPan.b, leftRowColCount, false, 'LEFT');
                this.addElementsToPan($panContainer, leftPan.c, leftRowColCount, false, 'LEFT');
                $leftPanParentContainer.show().html($panContainer);

                //adding right pan elements

                $panContainer = this._createTilesContainer(rightRowColCount);
                this.addElementsToPan($panContainer, rightPan.a, rightRowColCount, true, 'RIGHT');
                this.addElementsToPan($panContainer, rightPan.b, rightRowColCount, false, 'RIGHT');
                this.addElementsToPan($panContainer, rightPan.c, rightRowColCount, false, 'RIGHT');
                $rightPanParentContainer.show().html($panContainer);
                this._adjustTablePosition();
                this._displayEquation();
            }


        },

        /*
        * Create container in which tiles will be stored
        * @method _createTilesContainer
        * @private
        * @return Object jquery object of container
        */
        _createTilesContainer: function _createTilesContainer(rowColCount) {
            var rowCountObject = rowColCount,
                rowCount = rowCountObject.rowCount,
                colCount = rowCountObject.colCount;

            var $parent = $('<div>', {
                'class': 'pan-table'
            }), $row, $col, rowIndex, colIndex;

            for (rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                $row = $('<div>', {
                    'class': 'pan-row row-' + rowIndex
                });
                $parent.append($row);
                for (colIndex = 0; colIndex < colCount; colIndex++) {
                    $col = $('<div>', {
                        'class': 'pan-cell cell-' + colIndex
                    });
                    $row.append($col);
                }
            }
            return $parent;
        },

        /*
        * Calculate no of rows and columns of tiles container
        * @method _calculateRowsCols
        * @private
        * @return Object object of columns and rows
        */
        _calculateRowsCols: function _calculateRowsCols(coEfficientOfX, constants) {
            var maxRowCount = 3, maxColCount = 5, rowCount, colCount, maxNumber;

            maxNumber = coEfficientOfX > constants ? coEfficientOfX : constants;

            rowCount = maxNumber > 3 ? maxRowCount : maxNumber;
            colCount = Math.ceil(coEfficientOfX / rowCount) + Math.ceil(constants / rowCount);

            if (colCount > 5) { colCount = 5 }

            return {
                colCount: colCount,
                rowCount: rowCount
            }
        },


        /**
        * Adding tiles to pan
        *
        * @method addElementsToPan
        **/
        addElementsToPan: function addElementsToPan($panContainer, length, rowColCount, isX, pan) {
            //TODO: Adding elements to  Pan
            var classToAdd = 'coefficients',
                index = 0,
                coefficient = 1,
                rowCount = rowColCount.rowCount, colCount = rowColCount.colCount, xRow, xCol;


            //Adding style class for X
            if (isX) {
                classToAdd = 'coefficients-x';
                coefficient = this.model.getXValue();
            }

            //Changing coefficient depending on length
            if (length < 0) {
                coefficient = (coefficient === 0) ? 0 : (typeof coefficient === 'string') ? ('-' + coefficient) : (-1 * coefficient);
                length = Math.abs(length);
            }

            if (isX && length !== 0) {
                var colIndex = 0, rowIndex = rowCount - 1;
                for (; index < length; index++) {

                    if (rowIndex < 0) {
                        colIndex++;
                        rowIndex = rowCount - 1;
                    }
                    var $div = $('<div>', {
                        'class': classToAdd + ' xCoefficient'
                    });
                    $div.html(coefficient);
                    $panContainer.find('.row-' + rowIndex + ' .cell-' + colIndex).append($div);

                    rowIndex--;
                }
                if (pan === 'LEFT') {
                    this.xAddedTill_L = { row: (rowIndex + 1), col: colIndex };
                    this.startOthertilesFrom_L = { row: rowCount - 1, col: colIndex + 1 };
                }
                else {
                    this.xAddedTill_R = { row: (rowIndex + 1), col: colIndex };
                    this.startOthertilesFrom_R = { row: (rowCount - 1), col: colIndex + 1 };
                }

            } else {

                if (pan === 'LEFT') {
                    xRow = this.xAddedTill_L.row - 1;
                    xCol = this.xAddedTill_L.col;
                }
                else {
                    xRow = this.xAddedTill_R.row - 1;
                    xCol = this.xAddedTill_R.col;
                }
                var colIndex = (pan === 'LEFT') ? this.startOthertilesFrom_L.col : this.startOthertilesFrom_R.col,
                    rowIndex = (pan === 'LEFT') ? this.startOthertilesFrom_L.row : this.startOthertilesFrom_R.row;
                for (; index < length; index++) {

                    if (rowIndex < 0) {
                        colIndex++;
                        rowIndex = rowCount - 1;
                    }
                    var $div = $('<div>', {
                        'class': classToAdd
                    });
                    $div.html(coefficient);
                    if (colIndex > 4) {
                        $panContainer.find('.row-' + xRow + ' .cell-' + xCol).append($div);
                        xRow--;
                    }
                    else {
                        $panContainer.find('.row-' + (rowIndex) + ' .cell-' + colIndex).append($div);
                    }
                    rowIndex--;
                }
                if (pan === 'LEFT') {
                    this.startOthertilesFrom_L = { row: rowIndex, col: colIndex };
                }
                else {
                    this.startOthertilesFrom_R = { row: rowIndex, col: colIndex };
                }
            }




        },

        /**
        * Adjusts Table position vertically
        *
        * @method _adjustTablePosition
        **/
        _adjustTablePosition: function _adjustTablePosition() {

            var $leftStaticContainer = this.$('.left-tile-container .static-container'),
                $rightStaticContainer = this.$('.right-tile-container .static-container'),
                $rightTable = $rightStaticContainer.find('.pan-table'),
                $leftTable = $leftStaticContainer.find('.pan-table');

            $rightTable.css({
                top: $rightStaticContainer.height() - $rightTable.height()
            });
            $leftTable.css({
                top: $leftStaticContainer.height() - $leftTable.height()
            })
        },

        /**
        * Displays equations on the pan
        *
        * @method _displayEquation
        **/
        _displayEquation: function _displayEquation() {

            var currentPanData = this.model.getCurrentPansData(),
                leftPan = currentPanData.left,
                rightPan = currentPanData.right,
                $leftPaneEquationCont = this.$('.left-pan .pan-data'),
                $rightPaneEquationCont = this.$('.right-pan .pan-data'),
                dataForLeftPan = '', dataForRightPan = '';

            dataForLeftPan = (leftPan.a === 0) ? '' : (leftPan.a + '<i>x</i>');
            if (Math.abs(leftPan.a) === 1) {
                dataForLeftPan = '<i>x</i>';
                if (leftPan.a < 0) {
                    dataForLeftPan = '-<i>x</i>';
                }
            }
            dataForLeftPan += (leftPan.b === 0) ? '' : (leftPan.b > 0) ? ' + ' + leftPan.b : ' - ' + Math.abs(leftPan.b);
            dataForLeftPan += (leftPan.c === 0) ? '' : (leftPan.c > 0) ? ' + ' + leftPan.c : ' - ' + Math.abs(leftPan.c);

            dataForRightPan = (rightPan.a === 0) ? '' : (rightPan.a + '<i>x</i>');
            if (Math.abs(rightPan.a) === 1) {
                dataForRightPan = '<i>x</i>';
                if (rightPan.a < 0) {
                    dataForRightPan = '-<i>x</i>';
                }
            }
            dataForRightPan += (rightPan.b === 0) ? '' : (rightPan.b > 0) ? ' + ' + rightPan.b : ' - ' + Math.abs(rightPan.b);
            dataForRightPan += (rightPan.c === 0) ? '' : (rightPan.c > 0) ? ' + ' + rightPan.c : ' - ' + Math.abs(rightPan.c);
            if (rightPan.a === 0 && rightPan.b === 0) {
                dataForRightPan = Number(dataForRightPan.replace(/\s/g, ''));
            }

            if (leftPan.a === 0 && leftPan.b === 0) {
                dataForLeftPan = Number(dataForLeftPan.replace(/\s/g, ''));
            }

            $leftPaneEquationCont.html(dataForLeftPan);
            $rightPaneEquationCont.html(dataForRightPan);
        },

        /**
        * Setting currents Pan's Data to model
        *
        * @method setPansData
        **/
        setPansData: function setPansData(data) {
            var dataToPass = {
                left: {},
                right: {}
            };

            dataToPass.left.a = data.left.a || 0;
            dataToPass.left.b = data.left.b || 0;
            dataToPass.left.c = data.left.c || 0;

            dataToPass.right.a = data.right.a || 0;
            dataToPass.right.b = data.right.b || 0;
            dataToPass.right.c = data.right.c || 0;

            this.model.setCurrentPansData(dataToPass);
        },

        /**
        * Setting X value
        *
        * @method setXValue
        **/
        setXValue: function setPansData(xValue) {
            this.model.setXValue(xValue);
        },

        /*
        * shows X/value, depeneding on param
        * @method showX
        */
        showX: function showX(show) {
            this.model.setShowX(show);
        },


        /*
        * Return bool for Animation on/off
        * @method isAnimationOn
        */
        isAnimationOn: function isAnimationOn() {
            return this.model.get('isAnimation');
        },


        /*
        * Stores event handlers for the current view
        * @public
        */
        eventHandlers: {
            /*
            * Handles change event for model attr currentPansData
            * @event
            * @method _panDataChangeEvent
            * @private
            */
            _panDataChangeEvent: function _panDataChangeEvent() {
                //TODO: Render Pans as per new Data
                this.renderPan();
                if (!this.model.getShowX()) {
                    this.currentAngle = 0;
                }
                this.animatePanBalance(this.model.getHeavierPan());
            },

            /*
            * Handles change event for model attr showX
            * @event
            * @method _panShowXChangeEvent
            * @private
            */
            _panShowXChangeEvent: function () {
                var xValue = this.model.getXValue(), pansData = this.model.getCurrentPansData();
                xValue = pansData.left.a > 0 ? xValue : (typeof xValue === 'string') ? '-' + xValue : -1 * xValue;
                this.$('.left-tile-container .xCoefficient').html(xValue);
                xValue = pansData.right.a > 0 ? xValue : (typeof xValue === 'string') ? '-' + xValue : -1 * xValue;
                this.$('.right-tile-container .xCoefficient').html(xValue);
                this.animatePanBalance(this.model.getHeavierPan());
            }
        },

        /*
        * Displays the dispenser
        * @method renderDispenser
        */

        renderDispenser: function renderDispenser(dispenserData) {
            if (!this.enableDispenser) {
                return;
            }
            var self = this,
                viewClassName = MathInteractives.Common.Components.Views.PanBalance,
                dispenserDataArray = dispenserData ? dispenserData : this.dispenserData,
            //                bIsDisabled = dispenserDataArray.isDisabled ? dispenserDataArray.isDisabled : false,
                dispenserDataArrayLength = dispenserDataArray.length,
                index = 0,
                $dispenserContainer = this.$('.dispenser-container').show(),
                $row1 = this.$('.dispenser-row-1'),
                $row2 = this.$('.dispenser-row-2'),
                $parent,
                draggableObject = {
                    revert: 'invalid',
                    zIndex: 999,
                    helper: "clone",
                    start: function (event, ui) {
                        self.trigger(viewClassName.TILE_DRAG);
                    },
                    containment: self._getContainmentSelector()
                },
                $tile = null,
                $dynamicTileDroppableContainer = this.$('.dynamic-container');
            for (; index < dispenserDataArrayLength; index++) {
                if (dispenserDataArray[index].type === 'Num' && dispenserDataArray[index].value > 1) {
                    $parent = $row2;
                }
                else {
                    $parent = $row1;
                }
                //                dispenserDataArray[index].isDisabled = bIsDisabled;
                //                if (dispenserDataArray[index].type === 'Var') {
                //                    if (dispenserDataArray[index].isVarNegative) {
                //                        dispenserDataArray[index].text = '-' + dispenserDataArray[index].text;
                //                    }
                //                    dispenserDataArray[index].text = '<span class="italic">' + dispenserDataArray[index].text + '</span>'
                //                }
                $tile = this._createDraggableTiles($parent, dispenserDataArray[index], this.idPrefix + 'dispenser-tile-', index, true);
                $.fn.EnableTouch('.pan-draggable-dispenser-tile');
                $tile.draggable(draggableObject);
            }


        },

        /*
        * Create pan balance with specified options
        * @method _createDraggableTiles
        * @param {object} $parent
        * @param {object} dispenserTileData
        * @param String identifierString
        * @param String suffixIndex
        */
        _createDraggableTiles: function _createDraggableTiles($parent, dispenserTileData, identifierString, suffixIndex, isDefaultTile) {
            var _isDefaultTile = isDefaultTile ? isDefaultTile : false;
            var bIsDisabled = dispenserTileData.isDisabled ? dispenserTileData.isDisabled : this._getIsDisabled();
            var dataIsVarNegative = dispenserTileData.isVarNegative ? dispenserTileData.isVarNegative : false;
            var className = MathInteractives.Common.Components.Views.PanBalance,
                dataText = dispenserTileData.text,
                dataType = dispenserTileData.type,
                dataValue = dispenserTileData.value,
                buttonType = MathInteractives.Common.Components.Views.Button.TYPE.DRAGGABLE_BLUE,
                constantTileWidth = 46,
                constantHeight = 40,
                widthOfTile = constantTileWidth,
                filePath = this.filePath,
                idString = identifierString,
                classString = null;
            if (typeof (suffixIndex) !== 'undefined') {
                idString = idString + suffixIndex;
            }
            classString = identifierString + ' pan-draggable-dispenser-tile draggable-tile' + dataType;
            var $draggableTile = $('<div>', {
                'id': idString,
                'class': classString
            }),
                buttonData = null;
            if (dataType === 'Num') {
                widthOfTile = constantTileWidth * Math.abs(dataValue);
            }
            else {
                widthOfTile = 54;
            }

            //            if (dataType === 'Var' && dataIsVarNegative) {
            //                dataText = '-' + dataText;
            //            }

            if (_isDefaultTile) {
                if (dataText.indexOf(className.NEGATIVE_TILE_INDICATOR) === -1) {// '–' is en dash char and it decides if the char is negative
                    if (dataType === 'Var') {
                        if (dataIsVarNegative) {
                            dataText = className.NEGATIVE_TILE_INDICATOR + dataText;
                        }
                        dataText = '<i>' + dataText + '</i>'
                    }
                    if (dataType === 'Num' && dataIsVarNegative) {
                        dataText = className.NEGATIVE_TILE_INDICATOR + dataText;
                    }
                }
            }
            buttonData = {
                id: idString,
                type: buttonType,
                path: filePath,
                text: dataText,
                width: widthOfTile,
                //height: constantHeight,
                isDisabled: bIsDisabled
            };

            $parent.append($draggableTile);
            var newTile = this._generateTileButton(buttonData);
            return $draggableTile.data({
                'value': dataValue,
                'type': dataType,
                'text': dataText,
                'isVarNegative': dataIsVarNegative,
                isDisabled: bIsDisabled
            });
        },

        /*
        * Generates a blue tile button
        * @method _generateTileButton
        * @param {object} buttonData
        */
        _generateTileButton: function _generateTileButton(buttonData) {
            //            var buttonType = MathInteractives.Common.Components.Views.Button.TYPE.DRAGGABLE_BLUE;
            var newTile = MathInteractives.global.Button.generateButton(buttonData);
            if (buttonData.isDisabled) {
                newTile.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
                newTile.setDraggableIcon(!buttonData.isDisabled)
            }
            return newTile;

        },

        /*
        * Initializes the droppable contaners with required data
        * @method _initializeDroppableContainers
        */
        _initializeDroppableContainers: function _initializeDroppableContainers() {

            var self = this,
                $dynamicTileDroppableContainer = this.$('.dynamic-container'),
                $rowStrucure = null,
                viewClassName = MathInteractives.Common.Components.Views.PanBalance;

            $rowStrucure = this._createTilesContainer({ rowCount: 3, colCount: 0 });
            $dynamicTileDroppableContainer.find('.dynamic-wrapper').append($rowStrucure);

            $dynamicTileDroppableContainer.show().droppable({
                drop: function (event, ui) {
                    var $this = $(this).find('.dynamic-wrapper'),
                        panPosition = $this.data().pos,
                        dataObject = ui.draggable.data(),
                        cloneDataObject = {
                            'value': dataObject.value,
                            'type': dataObject.type,
                            'text': dataObject.text,
                            'isVarNegative': dataObject.isVarNegative
                        },
                        clone = ui.helper.clone(),
                        newTile = null,
                        fireEvents = true;



                    clone.removeClass('ui-draggable-dragging')
                    .data(cloneDataObject);
                    newTile = self._handleTilesPositionInContainer($this, clone);
                    if (newTile && !$this.parents('.pan-wrapper').hasClass(clone.attr('panContainer') + '-pan-wrapper')) {

                        //patch for removing acual tile
                        if (ui.helper.hasClass('pan-dropped')) {
                            ui.draggable.remove();
                        }

                        self._makeTileDraggableAfterDrop(newTile);
                        var helper = ui.helper.remove(),
                            $draggedFromWrappr = self.$('.' + helper.attr('panContainer') + '-pan-wrapper').find('.dynamic-wrapper'),
                            rowNo = Number(helper.attr('rowNo'));
                        self.animateDynamicPan();
                        if (helper.attr('panContainer')) {
                            self._arrangeTilesInPan($draggedFromWrappr, rowNo);
                        }

                    }
                    else {//if it is dropped in same pan, it should revert
                        $(newTile).remove();
                        ui.draggable.draggable("option", "revert", true);
                        fireEvents = false;
                    }

                    if (fireEvents) {
                        if (panPosition === 'right') {
                            self.trigger(viewClassName.RIGHT_PAN_DROP, cloneDataObject);
                        } else {
                            self.trigger(viewClassName.LEFT_PAN_DROP, cloneDataObject);
                        }
                        self.trigger(viewClassName.PAN_DROP, cloneDataObject);
                    }
                }

            });


        },

        /*
        * Handles the position of tiles in the droppable container
        * @method _handleTilesPositionInContainer
        */
        _handleTilesPositionInContainer: function _handleTilesPositionInContainer($panWrapper, $currentTile, isDefaultTile) {
            var _isDefaultTile = isDefaultTile ? isDefaultTile : false;
            var maxAllowedWeightPerRow = 5;
            var CONSTANT_PADDING_VALUE = MathInteractives.Common.Components.Views.PanBalance.CONSTANT_PADDING_VALUE;
            var index = 0,
                self = this,
                orderedTiles = [],
                alltiles = $panWrapper.find('.pan-draggable-dispenser-tile'),
                rowCounter = 2, //as possible rows are 0,1,2; 2 being the lowest
                $currentrow = null,
                isCurrentRowFull = null,
                $tiles = null,
                bIsDisabled = $currentTile.data().isDisabled ? $currentTile.data().isDisabled : this._getIsDisabled(),
                dataValue = $currentTile.data().value,
                dataType = $currentTile.data().type,
                dataText = $currentTile.data().text,
                dataIsVarNegative = $currentTile.data().isVarNegative,
                droppedTileId = this._getDroppedTileId(),
                idString = this.idPrefix + 'dropped-tile-' + droppedTileId,
                tileData = {
                    'type': dataType,
                    'text': dataText,
                    'value': dataValue,
                    'isVarNegative': dataIsVarNegative,
                    'isDisabled': bIsDisabled
                },
            rowData = null;

            var newTile = null;


            if ($currentTile.data().type === 'Var') {
                dataValue = 1;
            }

            for (; rowCounter >= 0; rowCounter--) {
                $currentrow = $panWrapper.find('.row-' + rowCounter);
                rowData = self._isRowFull($currentrow, dataValue);
                isCurrentRowFull = rowData.isRowFull;

                if (!isCurrentRowFull) {
                    newTile = self._createDraggableTiles($currentrow, tileData, idString, '', _isDefaultTile);
                    newTile.addClass('pan-draggable-dispenser-tile pan-dropped')
                    .attr({
                        'colNo': rowData.colNo,
                        'rowNo': rowCounter,
                        'panContainer': $panWrapper.data().pos
                    });
                    if (dataType === 'Num') {
                        newTile.css({
                            'margin-left': (CONSTANT_PADDING_VALUE * Math.abs(dataValue)) + 'px',
                            'margin-right': (CONSTANT_PADDING_VALUE * Math.abs(dataValue)) + 'px'
                        });
                    }
                    self._incrementDroppedTileId();
                    if (bIsDisabled === false) {
                        newTile.on('dblclick', function () {
                            self._doubleClickOnTileHandler($(this));
                        });
                    }
                    return newTile;
                }
            }


        },

        /*
        * Handles the doubleclick event on tiles
        * @method _doubleClickOnTileHandler
        * @param Object $tile
        */
        _doubleClickOnTileHandler: function _doubleClickOnTileHandler($tile) {
            if (this._getIsDisabled()) {
                return;
            }
            var dataType = $tile.data().type,
                dataValue = $tile.data().value,
                dataText = $tile.data().text,
                dataIsVarNegative = $tile.data().isVarNegative,
                bIsDisabled = $tile.data().isDisabled,
                oldTileData = {
                    'value': dataValue,
                    'type': dataType,
                    'text': dataText,
                    'isVarNegative': dataIsVarNegative,
                    isDisabled: bIsDisabled
                },
                className = MathInteractives.Common.Components.Views.PanBalance;

            if (dataType === 'Num' && dataValue > 1) {
                var self = this,
                    dataText = $tile.data().text,
                    index = null,
                    newTile = null,
                    newTileData = {
                        type: dataType,
                        text: '1',
                        value: 1
                    },
                    panContainer = $tile.attr('panContainer'),
                    $pan = self.$('.' + panContainer + '-pan-wrapper').find('.dynamic-wrapper');

                $tile.remove();
                for (index = 0; index < dataValue; index++) {
                    var $draggableTile = $('<div>');
                    $draggableTile.data(newTileData);
                    newTile = self._handleTilesPositionInContainer($pan, $draggableTile);
                    self._makeTileDraggableAfterDrop(newTile);

                }

            }
            this.trigger(className.DOUBLE_CLICK_TILE, oldTileData);
        },

        /*
        * Handles the drag and drop functionality of the tile after dropping it on the pan
        * @method _makeTileDraggableAfterDrop
        * @param Object $tile
        * @param Boolean isDraggable
        */
        _makeTileDraggableAfterDrop: function _makeTileDraggableAfterDrop($tile, isDraggable) {
            var bIsDraggable = isDraggable ? isDraggable : false;
            var self = this,
                hasReverted = false,
                viewClassName = MathInteractives.Common.Components.Views.PanBalance,
                draggableObjectAfterDrop = {
                    revert: 'invalid',
                    zIndex: 999,
                    helper: "clone",
                    start: function (event, ui) {
                        //debugger;
                        $(this).css({ 'visibility': 'hidden' });
                        self.trigger(viewClassName.TILE_DRAG);
                    },
                    stop: function (event, ui) {
                        $(this).css({ 'visibility': 'visible' });
                    },
                    containment: self._getContainmentSelector()
                };
            $.fn.EnableTouch('.pan-draggable-dispenser-tile');

            $tile.draggable(draggableObjectAfterDrop);
            if (bIsDraggable) {
                return $tile.draggable("disable");
            }
        },

        /*
        * Check if the row is full
        * @method _isRowFull
        * @param Object $row
        * @param Number afterAddingWeight
        */
        _isRowFull: function _isRowFull($row, afterAddingWeight) {
            var maxAllowedWeightPerRow = 5; /*---change for increasing row limit*/
            var sumOfWeight = 0,
               isRowFull = false,
               $tiles = $row.find('.pan-draggable-dispenser-tile'),
               $this = null;
            $tiles.each(function () {
                $this = $(this);
                var weight = Math.abs($this.data().value);
                if ($this.data().type === 'Var') {
                    weight = 1;
                }
                if (!$this.hasClass('ui-draggable-dragging')) {
                    sumOfWeight = sumOfWeight + weight;
                }
            });
            sumOfWeight = sumOfWeight + Math.abs(afterAddingWeight);
            if (sumOfWeight > maxAllowedWeightPerRow) {
                isRowFull = true;
            }
            return {
                isRowFull: isRowFull,
                colNo: sumOfWeight
            }
        },

        /*
        * Increments variable droppedTileId
        * @method _incrementDroppedTileId
        */
        _incrementDroppedTileId: function _incrementDroppedTileId() {
            this.droppedTileId++;
        },

        /*
        * Returns variable droppedTileId
        * @method _getDroppedTileId
        */
        _getDroppedTileId: function _getDroppedTileId() {
            return this.droppedTileId;
        },


        /*
        * Renders some default tiles in pans
        * @method _toggleDisableTiles
        */
        _toggleDisableTiles: function _toggleDisableTiles(defaultData, isDisabled, isDefaultTile) {
            if (typeof (defaultData) !== 'undefined') {
                var _isDefaultTile = isDefaultTile ? isDefaultTile : false;
                var self = this,
                    bIsDisabled = isDisabled ? isDisabled : this._getIsDisabled(),
                    defaultDataArray = defaultData,
                    leftDefaultDataArray = defaultData.leftPan ? defaultData.leftPan : [],
                    leftDefaultDataArrayLength = leftDefaultDataArray.length,
                    rightDefaultDataArray = defaultData.rightPan ? defaultData.rightPan : [],
                    rightDefaultDataArrayLength = rightDefaultDataArray.length,
                    index = null,
                    $parent,
                    newTile = null,
                    $leftDynamicTileDroppableContainer = this.$('.left-pan-wrapper').find('.dynamic-container'),
                    $rightDynamicTileDroppableContainer = this.$('.right-pan-wrapper').find('.dynamic-container');

                for (index = 0; index < leftDefaultDataArrayLength; index++) {
                    var $draggableTile = $('<div>');
                    leftDefaultDataArray[index].isDisabled = bIsDisabled;
                    $draggableTile.data(leftDefaultDataArray[index]);
                    newTile = self._handleTilesPositionInContainer($leftDynamicTileDroppableContainer, $draggableTile, _isDefaultTile);
                    newTile.attr('panContainer', 'left');
                    newTile = self._makeTileDraggableAfterDrop(newTile, bIsDisabled);
                }

                for (index = 0; index < rightDefaultDataArrayLength; index++) {
                    var $draggableTile = $('<div>');
                    rightDefaultDataArray[index].isDisabled = bIsDisabled;
                    $draggableTile.data(rightDefaultDataArray[index]);
                    newTile = self._handleTilesPositionInContainer($rightDynamicTileDroppableContainer, $draggableTile, _isDefaultTile);
                    newTile.attr('panContainer', 'right');
                    newTile = self._makeTileDraggableAfterDrop(newTile, bIsDisabled);
                }


                if (defaultDataArray.position) {
                    self.animatePanBalance(defaultDataArray.position);
                }
                else {
                    self.animateDynamicPan();
                }
            }
        },



        _renderDefaultTiles: function (defaultDataObject) {
            //            var bIsDisabled = defaultDataObject.isDisabled ? defaultDataObject.isDisabled : this._getIsDisabled();
            var bIsDisabled = null;
            if (typeof (defaultDataObject.isDisabled) === 'undefined') {
                bIsDisabled = this._getIsDisabled();
            }
            else {
                bIsDisabled = defaultDataObject.isDisabled;
            }
            var self = this;
            self.clearPans();
            self._toggleDisableTiles(defaultDataObject, bIsDisabled, true);
        },



        /*
        * Activates the trash can
        * @method _activateTrashCan
        * @param String trashCanId
        */
        _activateTrashCan: function _activateTrashCan(trashCanId) {
            var self = this;
            $('#' + trashCanId).off("drop").on("drop", function (event, ui) {
                if (!ui.draggable.hasClass('pan-dropped')) {
                    ui.draggable.draggable("option", "revert", true);
                    return;
                }
                //patch for removing acual tile
                if (ui.helper.hasClass('pan-dropped')) {
                    ui.draggable.remove();
                }

                var viewClassName = MathInteractives.Common.Components.Views.PanBalance,
                    dataObject = ui.draggable.data(),
                    cloneDataObject = {
                        'value': dataObject.value,
                        'type': dataObject.type,
                        'text': dataObject.text,
                        'isVarNegative': dataObject.isVarNegative
                    };

                var helper = ui.helper.remove(),
                    $draggedFromWrappr = self.$('.' + helper.attr('panContainer') + '-pan-wrapper').find('.dynamic-wrapper'),
                    rowNo = Number(helper.attr('rowNo'));

                self.animateDynamicPan();
                self._arrangeTilesInPan($draggedFromWrappr, rowNo);
                self.trigger(viewClassName.TRASH_DROP, cloneDataObject);
            });

        },

        /*
        * Returns equation in string format
        * @method _getEquation
        * @param String pan
        */
        _getEquation: function (pan, asCoefficients) {
            if (typeof (pan) === 'undefined') {
                return;
            }
            var _asCoefficients = asCoefficients ? asCoefficients : false;
            var VARIABLE_LABEL = MathInteractives.Common.Components.Views.PanBalance.VARIABLE_LABEL;
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $tiles = $pan.find('.pan-draggable-dispenser-tile'),
                constantsArray = [],
                $constantsArray = null,
                constantsSum = 0,
                variablesSum = 0,
                $this = null,
                dataObject = null,
                values = null,
                equationString = '',
                isConstantsSumPsitive = true;

            $tiles.each(function () {
                $this = $(this);
                dataObject = $this.data(),
                values = {
                    'value': dataObject.value,
                    'type': dataObject.type,
                    'text': dataObject.text,
                    'isVarNegative': dataObject.isVarNegative
                };
                if (values.type === 'Num') {
                    if (dataObject.isVarNegative) {
                        values.value = -1 * values.value;
                    }
                    constantsArray.push(values.value);
                }
            });

            $constantsArray = $(constantsArray);

            $constantsArray.each(function (index, value) {
                constantsSum = constantsSum + value;
            });

            if (constantsSum < 0) {
                isConstantsSumPsitive = false;
            }

            variablesSum = this.getVariableCount(pan);

            if (_asCoefficients) {
                var coEfficientsObj = {
                    constant: constantsSum,
                    variable: variablesSum
                };
                return coEfficientsObj;
            }


            if (variablesSum === 0) {
                equationString = constantsSum.toString();
            }
            else if (constantsSum === 0) {
                if (variablesSum === 1) {
                    variablesSum = '';
                } else if (variablesSum === -1) {
                    variablesSum = '-';
                }
                equationString = variablesSum + '<span class="italic">' + VARIABLE_LABEL + '</span>';
            } else {
                if (variablesSum === 1) {
                    variablesSum = '';
                } else if (variablesSum === -1) {
                    variablesSum = '-';
                }
                equationString = isConstantsSumPsitive ? variablesSum + '<span class="italic">' + VARIABLE_LABEL + '</span>' + ' + ' + constantsSum : variablesSum + '<span class="italic">' + VARIABLE_LABEL + '</span>' + ' - ' + Math.abs(constantsSum);
            }



            return equationString;

        },

        /*
        * Returns Containment selector
        * @method _getContainmentSelector
        */
        _getContainmentSelector: function _getContainmentSelector() {
            var containmentSelector = this.containmentID;
            if (typeof (containmentSelector) === 'string') {
                containmentSelector = '#' + containmentSelector;
            }
            else if (typeof (containmentSelector) === 'object') {
                containmentSelector = containmentSelector;
            }

            return containmentSelector;
        },

        _arrangeTilesInPan: function _arrangeTilesInPan($panWrapper, rowNoToStartArrangementFrom, isDisabled) {
            var self = this;
            var bIsdisabled = isDisabled ? isDisabled : this._getIsDisabled();
            var rowNo = rowNoToStartArrangementFrom,
                $pan = $panWrapper,
                tileData = null,
                $thisTile = null,
                newTile = null,
                index = null;

            for (index = --rowNo; index > -1; index--) {
                var $rowTiles = $pan.find('.row-' + index).children();
                $rowTiles.each(function () {
                    $thisTile = $(this);
                    tileData = {
                        'type': $thisTile.data().type,
                        'text': $thisTile.data().text,
                        'value': $thisTile.data().value,
                        'isVarNegative': $thisTile.data().isVarNegative,
                        'isDisabled': bIsdisabled
                    };
                    $thisTile.remove();
                    newTile = self._handleTilesPositionInContainer($pan, $thisTile.data(tileData));
                    self._makeTileDraggableAfterDrop(newTile);
                });
            }
        },

        /*
        * Get the tile data of pan
        * @method _getTileDataForPan
        * @param String pan
        */
        _getTileDataForPan: function _getTileDataForPan(pan) {
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $panRows = $pan.find('.pan-row'),
                panDataArray = [],
                className = MathInteractives.Common.Components.Views.PanBalance,
                dataIsVarNegative = null,
                $this = null,
                $thisRowTiles = null,
                dataObject = null,
                tileData = null,
                saveStateObject = null;


            $($pan.find('.pan-row').get().reverse()).each(function () {
                $thisRowTiles = $(this).find('.pan-draggable-dispenser-tile');
                $thisRowTiles.each(function () {
                    $this = $(this);
                    dataObject = $this.data();
                    if (dataObject.type === 'Var') {
                        dataObject.text = $(dataObject.text).html() ? $(dataObject.text).html() : dataObject.text;
                    }
                    tileData = {
                        'type': dataObject.type,
                        'text': dataObject.text.toString().replace(className.NEGATIVE_TILE_INDICATOR, ''),
                        'value': dataObject.value,
                        'isVarNegative': dataObject.isVarNegative,
                        'isDisabled': dataObject.isDisabled
                    };
                    panDataArray.push(tileData);
                });
            });

            return panDataArray;

        },

        /*
        * Set the isPanDisabled flag
        * @method _setIsDisabled
        * @param Boolean isDisabled
        */
        _setIsDisabled: function _setIsDisabled(isDisabled) {
            if (isDisabled) {
                this.isPanDisabled = isDisabled
            }
            else {
                this.isPanDisabled = false
            }
        },

        /*
        * Get the isPanDisabled flag
        * @method _getIsDisabled
        */
        _getIsDisabled: function _getIsDisabled() {
            return this.isPanDisabled
        },

        _getSpecificTypeTileCount: function _getSpecificTypeTileCount(pan, type, ignoreNullification) {
            if (typeof (type) === 'undefined' || typeof (pan) === 'undefined') {
                return;
            }

            var saveStateObject = this.getSaveState(),
                dataArray = saveStateObject[pan + 'Pan'],
                arrayLength = dataArray.length,
                index = null,
                thisObject = null,
                count = 0,
                dataIsVarNegative = false,
                _ignoreNullification = ignoreNullification ? ignoreNullification : false;
            for (index = 0; index < arrayLength; index++) {
                thisObject = dataArray[index];

                if (!_ignoreNullification) {
                    dataIsVarNegative = thisObject.isVarNegative ? thisObject.isVarNegative : false;
                }
                if (thisObject.type === type) {
                    if (dataIsVarNegative) {
                        count--;
                    }
                    else {
                        count++;
                    }
                }
            }
            return count;

        },


        /*
        * Render default tiles in pan
        * @method renderDefaultTiles
        * @param Object saveStateObject
        */
        renderDefaultTiles: function renderDefaultTiles(saveStateObject) {
            if (saveStateObject) {
                this._renderDefaultTiles(saveStateObject);
            }
        },
        /*
        * Disable tile dragging
        * @method disableDraggable
        */
        disableDraggable: function () {
            //            return;
            this.$('.ui-draggable').draggable("disable");
            this._setIsDisabled(true);
            var saveStateObject = this.getSaveState();
            this._renderDefaultTiles(saveStateObject);
        },

        /*
        * Enable tile dragging
        * @method disableDraggable
        */
        enableDraggable: function () {
            this.$('.ui-draggable').draggable("enable");
            this._setIsDisabled(false);
            var saveStateObject = this.getSaveState();
            this._renderDefaultTiles(saveStateObject);
        },

        /*
        * Displays the label of pans
        * @method showPanLabel
        * @param String pan
        * @param String label
        */
        showPanLabel: function showPanLabel(pan, label) {
            if (typeof (pan) === 'undefined') {
                return;
            }
            var $labelContainer = this.$('.' + pan + '-pan-wrapper').find('.pan-label'),
                equation = null;
            if (typeof (label) === 'undefined') {
                equation = this._getEquation(pan);
            } else {
                equation = label;
            }

            $labelContainer.show().html(equation);

        },

        /*
        * Hides the label of pans
        * @method hidePanLabel
        */
        hidePanLabel: function hidePanLabel() {
            this.$('.pan-label').hide();
        },

        /*
        * Displays the Dispenser
        * @method showDispenser
        */
        showDispenser: function showDispenser() {
            this.$('.dispenser-container').show();

        },

        /*
        * Hides the Dispenser
        * @method hideDispenser
        */
        hideDispenser: function hideDispenser() {
            this.$('.dispenser-container').hide();
        },

        /*
        * Checkes if the given pan is empty or not
        * @method isPanEmpty
        * @param String pan
        */
        isPanEmpty: function isPanEmpty(pan) {
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $tiles = $pan.find('.pan-draggable-dispenser-tile'),
                isPanEmpty = false;
            if ($tiles.length === 0) {
                isPanEmpty = true;
            }
            return isPanEmpty;
        },
        /*
        * Get the current pan weight
        * @method getPanWeight
        * @param String pan
        */
        getPanWeight: function getPanWeight(pan) {
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $tiles = $pan.find('.pan-draggable-dispenser-tile'),
                sum = 0,
                $this = null,
                value = null;
            $tiles.each(function () {
                $this = $(this);
                var isNegShown = 1;
                if ($this.data().isVarNegative) {
                    isNegShown = -1;
                }
                if (!$this.hasClass('ui-draggable-dragging')) {
                    value = $this.data().value;
                    sum = sum + (value * isNegShown);
                }
            });
            return sum;
        },

        /*
        * Animate Dynamic pan
        * @method animateDynamicPan
        */
        animateDynamicPan: function animateDynamicPan() {
            var heavierPan = 'LEFT',
                leftPanWeight = this.getPanWeight('left'),
                rightPanWeight = this.getPanWeight('right');

            if (leftPanWeight < rightPanWeight) {
                heavierPan = 'RIGHT';
            }
            if (leftPanWeight === rightPanWeight) {
                heavierPan = 'CENTER';
            }
            this.animatePanBalance(heavierPan);
        },

        /*
        * Clear Both pans
        * @method clearPans
        */
        clearPans: function clearPans() {
            this.$('.dynamic-wrapper').find('.pan-draggable-dispenser-tile').remove();
            this.animateDynamicPan();
        },


        /*
        * Get the variables in pan
        * @method getVariableCount
        * @param String pan
        */
        getVariableCount: function getVariableCount(pan) {

            return this._getSpecificTypeTileCount(pan, 'Var');
        },
        getAbsoluteVariableCount: function getAbsoluteVariableCount(pan) {
            return this._getSpecificTypeTileCount(pan, 'Var', true);
        },
        getConstantsCount: function getConstantsCount(pan) {
            return this._getSpecificTypeTileCount(pan, 'Num');
        },
        getEquationCoefficients: function (pan) {
            return this._getEquation(pan, true);
        },

        modifyDispenser: function modifyDispenser(tilesData) {
            var $tiles = this.$('.dispenser-container').find('.pan-draggable-dispenser-tile');
            $tiles.remove();
            this.renderDispenser(tilesData);
        },

        /*
        * Get the no. and types of tiles in both pans for maintaining the state
        * @method getSaveState
        */
        getSaveState: function getSaveState() {
            var self = this,
                saveStateObject = null;
            saveStateObject = {
                leftPan: self._getTileDataForPan('left'),
                rightPan: self._getTileDataForPan('right'),
                isDisabled: self._getIsDisabled()
            };
            return saveStateObject;
        }


    }, {
        LEFT_PAN_DROP: 'left_pan_drop',
        RIGHT_PAN_DROP: 'right_pan_drop',
        PAN_DROP: 'pan_drop',
        TRASH_DROP: 'trash_drop',
        DOUBLE_CLICK_TILE: 'double_click_tile',
        TILE_DRAG: 'tile_drag',

        NEGATIVE_TILE_INDICATOR: '–',

        VARIABLE_LABEL: 'x',
        CONSTANT_PADDING_VALUE: 4,
        /*
        * Create pan balance with specified options
        * @method createPanBalance
        * @param {object} panBalanceProps
        */
        createPanBalance: function (panBalanceProps) {
            var panBalanceID;
            if (panBalanceProps) {
                panBalanceID = '#' + panBalanceProps.containerId;
                var panBalanceModel = new MathInteractives.Common.Components.Models.PanBalance(panBalanceProps);
                var panBalanceView = new MathInteractives.Common.Components.Views.PanBalance({ el: panBalanceID, model: panBalanceModel });
                return panBalanceView;
            }
        },
        Position: {
            LEFT: 0,
            CENTRE: 1,
            RIGHT: 2
        }
    });


    MathInteractives.global.PanBalance = MathInteractives.Common.Components.Views.PanBalance;
})();