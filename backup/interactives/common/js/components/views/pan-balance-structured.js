(function () {
    'use strict';
    var viewClassName = null;
    /**
    * View for rendering pan balance and its related events
    * Currently all variable labels are considered as X, for any other label, change
    * @class PanBalanceStructured
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.PanBalanceStructured = MathInteractives.Common.Player.Views.Base.extend({
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
        * An id counter to assign id for static tile
        *
        * @property staticTileId
        * @type Number
        * @default 0
        */
        staticTileId: 0,

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
        * A boolean to force animate pan-balance ignoring 'x' state
        *
        * @property forceAnimate
        * @type boolean
        * @default null
        */
        forceAnimate: null,

        /**
        * A boolean to store the fading effect status
        *
        * @property isFading
        * @type boolean
        * @default false
        */
        isFading: false,

        /**
        * Holds the value of variable
        *
        * @property draggableVariableValue
        * @type int
        * @default 1
        */
        draggableVariableValue: 1,

        dispenserTiles: [],

        marqueeView: null,

        marqueeDragStartPoint: null,

        tabIndex: null,

        tileContainer: [],

        panTabIndexes: null,

        panPosition: null,

        currentDroppedTileSelected: null,

        currentSelectedDispenserTile: null,

        tilesToNullify: 0,

        marqueeMoveOut: false,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {
            var model = this.model,
                panTilesTabIndexes;
            this.prependID = model.get('prependID');
            this.idPrefix = model.get('idPrefix');
            this.idPrefix = this.idPrefix + this.prependID;
            this.manager = model.get('manager');
            this.filePath = model.get('path');
            this.player = model.get('player');
            this.isDraggable = model.get('isDraggable');
            this.dispenserData = model.get('dispenserData');
            this.isFilled = model.get('isFilled');
            this.enableDispenser = model.get('enableDispenser');
            this.defaultData = model.get('defaultData');
            this.trashCanID = model.get('trashCanID');
            this.containmentID = model.get('containmentID');
            this.marqueeContainer = model.get('marqueeContainer') ? model.get('marqueeContainer') : this.$el;
            this.forceAnimate = model.get('forceAnimate');
            this._setDraggableVariableValue(model.get('draggableVariableValue'));
            this.tabIndex = model.get('tabIndex');

            this.panTabIndexes = {
                leftPanVariable: {
                    row3: this.tabIndex + 25,
                    row2: this.tabIndex + 30,
                    row1: this.tabIndex + 35,
                    row0: this.tabIndex + 40
                },
                leftPanNumber: {
                    row3: this.tabIndex + 45,
                    row2: this.tabIndex + 65,
                    row1: this.tabIndex + 85,
                    row0: this.tabIndex + 115
                },
                rightPanVariable: {
                    row3: this.tabIndex + 137,
                    row2: this.tabIndex + 140,
                    row1: this.tabIndex + 145,
                    row0: this.tabIndex + 150
                },
                rightPanNumber: {
                    row3: this.tabIndex + 155,
                    row2: this.tabIndex + 175,
                    row1: this.tabIndex + 195,
                    row0: this.tabIndex + 215
                },
                leftTemporaryBin: {
                    row2: this.tabIndex + 255,
                    row1: this.tabIndex + 295,
                    row0: this.tabIndex + 335,
                },
                rightTemporaryBin: {
                    row2: this.tabIndex + 375,
                    row1: this.tabIndex + 415,
                    row0: this.tabIndex + 455,
                }
            };

            model.setPanTilesTabIndexes(this.panTabIndexes);

            this.render();
            this.marqueeView = this._generateMarquee();
            this.$('.pan-balance-draggable-tile-text-container').on('focusout', $.proxy(this.setDefaultTileAccText, this));
            return;
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

            var panBalanceHtml = MathInteractives.Common.Components.templates['panBalanceStructured'](panBalanceProps).trim();
            this.$el.append(panBalanceHtml);
            this._setBackgroundImage('.left-pan,.right-pan,.small-rod,.base,.center-rod');
            this._attachEvents();

            this._createHackScreenForDispenser();
            this.renderDispenser();

            if (this.model.get('isDraggable')) {
                this._initializeDroppableContainers();
                if (this.defaultData) {
                    this._renderDefaultTiles(this.defaultData);
                }
                this._renderTemporaryTrashCan();
            }


            this._activateTrashCan(this.trashCanID);

            //this.setPansData({ left: { a: 7, b: 2 }, right: { c: 9 } });
        },


        setDefaultTileAccText: function setDefaultTileAccText(event) {
            var self = this,
                index = null,
                dispenserTiles = self.dispenserTiles,
                selected = false,
                length = dispenserTiles.length,
                isSelected,
                accId = null,//event.currentTarget.id,//self.$(this).find('.pan-balance-draggable-tile-text-container').attr('id'),
                tileSign = null,
                tileText = null;//tileSign + (($(this).data('type') === 'Var') ? 'x' : 1);

            

            //self.$('#' + self.idPrefix + accId + '-acc-elem').blur();

            for (index = 0; index < length; index++) {
                accId = dispenserTiles[index].$el.find('.pan-balance-draggable-tile-text-container').attr('id');
                accId = accId.slice(self.idPrefix.length);
                selected = dispenserTiles[index].isSelected;
                tileSign = (dispenserTiles[index].tileData.dataIsVarNegative) ? self.getAccMessage('negative', 0) + ' ' : '';
                tileText = tileSign + ((dispenserTiles[index].dataType === 'Var') ? 'x' : 1);

                tileText += ' ' + this.getAccMessage('tile', 0);

                if (selected) {
                    tileText += ' ' + this.getAccMessage('tile', 1);
                }

                this.setAccMessage(accId, tileText);
            }

            // self.setFocus(accId);
        },

        //events: {
        //    'keypress #' + this.idPrefix + '-left-accessibility-dynamic-wrapper-acc-elem': 
        //},

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
            this.model.on('pan-forceAnimate-change', $.proxy(this.eventHandlers._panForceAnimateChangeEvent, this));

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
            if (this._skipAnimation) {
                return;
            }

            if (this.marqueeView) {
                this.marqueeView.disableMarquee();
            }

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
                domRefreshElements = [],
                animate = false;

            this.model.set('stepRotateObject', $.extend({}, { rotate: this.currentAngle }));

            if (self.currentAngle === rotateAngle) {
                if (this.isAnimationOn() === true) {
                    animate = true;
                }
                else {
                    self.model.set('isAnimation', false);
                }
                if (!self._getIsDisabled()) {
                    if (self.marqueeView) {
                        self.marqueeView.enableMarquee();
                    }
                }
            }
            else {
                animate = true;
            }

            if (animate) {
                this.model.set('isAnimation', true);
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
                        if (!self._getIsDisabled()) {
                            if (self.marqueeView) {
                                self.marqueeView.enableMarquee();
                            }
                        }
                    },
                    duration: duration
                });
            }

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
            var self = this,
                currentPanData = this.model.getCurrentPansData(),
                leftPan = currentPanData.left,
                rightPan = currentPanData.right, $panContainer, $panContainer1, noOfTiles = 0, rowCount, colCount,
                $leftPanParentContainer = this.$('.left-tile-container .static-container'),
                $rightPanParentContainer = this.$('.right-tile-container .static-container'), leftRowColCount, rightRowColCount,
                maxXAllowed = 4;



            if (!this.isDraggable && this.isFilled) {
                leftRowColCount = this._calculateRowsCols(Math.abs(leftPan.a), (Math.abs(leftPan.b) + Math.abs(leftPan.c)));
                rightRowColCount = this._calculateRowsCols(Math.abs(rightPan.a), (Math.abs(rightPan.b) + Math.abs(rightPan.c)));
                this._resetData(leftRowColCount, rightRowColCount);

                //adding left pan elements
                $panContainer = this._createTilesContainer(leftRowColCount);
                leftPan.a = leftPan.a > maxXAllowed ? maxXAllowed : leftPan.a;
                $leftPanParentContainer.show().empty().append($panContainer);
                self.addElementsToPan($panContainer, leftPan.a, leftRowColCount, true, 'LEFT');
                self.addElementsToPan($panContainer, leftPan.b, leftRowColCount, false, 'LEFT');
                self.addElementsToPan($panContainer, leftPan.c, leftRowColCount, false, 'LEFT');

                //adding right pan elements

                $panContainer1 = this._createTilesContainer(rightRowColCount);
                rightPan.a = rightPan.a > maxXAllowed ? maxXAllowed : rightPan.a;
                $rightPanParentContainer.show().empty().append($panContainer1);
                self.addElementsToPan($panContainer1, rightPan.a, rightRowColCount, true, 'RIGHT');
                self.addElementsToPan($panContainer1, rightPan.b, rightRowColCount, false, 'RIGHT');
                self.addElementsToPan($panContainer1, rightPan.c, rightRowColCount, false, 'RIGHT');

                self._adjustTablePosition();
                self._displayEquation();
            }

            //this._createHackScreenForLeftDynamicPan($leftPanParentContainer);
        },


        /*
        * Create container in which tiles will be stored
        * @method _createTilesContainer
        * @private
        * @return Object jquery object of container
        */
        _createTilesContainer: function _createTilesContainer(rowColCount, _$parent) {
            var rowCountObject = rowColCount,
                rowCount = rowCountObject.rowCount,
                colCount = rowCountObject.colCount,
                $parent = _$parent ? _$parent : $('<div>', {
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

        _createStaticTileSlices: function _createTilesContainer($tile) {
            if ($tile) {
                var rowCount = 1,
                    colCount = 3,
                    $parent = $tile,
                    $row, $col, rowIndex, colIndex;

                for (colIndex = 0; colIndex < colCount; colIndex++) {
                    $col = $('<div>', {
                        'class': 'static-tile ' + 'static-cell-' + colIndex
                    });
                    $parent.append($col);
                }

                return $parent;
            }
        },

        /*
        * Calculate no of rows and columns of tiles container
        * @method _calculateRowsCols
        * @private
        * @return Object object of columns and rows
        */
        _calculateRowsCols: function _calculateRowsCols(coEfficientOfX, constants) {
            var maxRowCount = 4, maxColCount = 5, rowCount, colCount, maxNumber;

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
            var coefficientValue = length,
                self = this,
                classToAdd = 'coefficients',
                index = 0,
                coefficient = 1,
                rowCount = rowColCount.rowCount, colCount = rowColCount.colCount, xRow, xCol,
                buttonType = MathInteractives.Common.Components.Views.Button.TYPE.CUSTOM;

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
                    var buttonData = {
                        id: 'static-' + self._getStaticTileId(),
                        imagePathIds: ['pan-balance-green-right', 'pan-balance-green-mid', 'pan-balance-green-left']
                    };
                    var $div = $('<div>', {
                        'class': classToAdd + ' xCoefficient'
                    });


                    var sign = coefficientValue < 0 ? '-' : '+'; //length is the 'a' value of equation ax+b=c

                    $panContainer.find('.row-' + rowIndex + ' .cell-' + colIndex).append($div);

                    self._createStaticTileButton(coefficient, $div, sign);

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
                    if (colIndex <= 4) {
                        var sign = coefficient < 0 ? '-' : '+';
                        $panContainer.find('.row-' + (rowIndex) + ' .cell-' + colIndex).append($div);
                        self._createStaticTileButton(coefficient, $div, sign);

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
                dataForLeftPan = '', dataForRightPan = '',
                maxXAllowed = 4;
            leftPan.a = leftPan.a > maxXAllowed ? maxXAllowed : leftPan.a;
            rightPan.a = rightPan.a > maxXAllowed ? maxXAllowed : rightPan.a;

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
        setXValue: function setXValue(xValue) {
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
        * forces pan balance to animate, ignoring x is shown or hidden
        * @method forceAnimatePanBalance
        */
        forceAnimatePanBalance: function forceAnimatePanBalance() {
            this.model.setForceAnimate(true);
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

                if (!this.model.getIsForceAnimation() && !this.model.getShowX()) {
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


                if ((pansData.left.a < 0 || pansData.right.a < 0) && xValue < 0) {
                    xValue = '(-' + Math.abs(xValue) + ')';
                }

                xValue = pansData.left.a > 0 ? xValue : (typeof xValue === 'string') ? '-' + xValue : -1 * xValue;
                this.$('.left-tile-container .xCoefficient .static-cell-1').html(xValue);
                xValue = pansData.right.a > 0 ? xValue : (typeof xValue === 'string') ? '-' + xValue : -1 * xValue;
                this.$('.right-tile-container .xCoefficient .static-cell-1').html(xValue);
                this.animatePanBalance(this.model.getHeavierPan());
            }
        },
        /*
        * Creates static Tiles
        * @method _createStaticTileButton
        * @private
        */
        _createStaticTileButton: function _createStaticTileButton(text, $tile, sign) {
            if (typeof (text) !== 'undefined' && $tile) {
                var self = this,
                    color = sign === '-' ? 'red' : 'green',
                    $imagSliceDivs = self._createStaticTileSlices($tile);
                $imagSliceDivs.find('.static-cell-0').css({ 'background-image': 'url("' + self.filePath.getImagePath('pan-balance-' + color + '-left-right') + '")' });
                $imagSliceDivs.find('.static-cell-1').css({ 'background-image': 'url("' + self.filePath.getImagePath('pan-balance-' + color + '-mid') + '")' }).html(text);
                $imagSliceDivs.find('.static-cell-2').css({ 'background-image': 'url("' + self.filePath.getImagePath('pan-balance-' + color + '-left-right') + '")' });
                //                this._incrementStaticTileId();
                return
            }
        },

        /****************************************DYNAMIC PAN BALANCE********************************************/

        _createHackScreenForDispenser: function _createHackScreenForDispenser() {
            var self = this,
                dispenserHackScreenProp,
                option,
                    msgId = (this.model.get('negativeTiles') === false) ? 1 : 0;

            this.loadScreen('pan-balance');

            dispenserHackScreenProp = {
                elementId: '-dispenser-container',
                tabIndex: self.tabIndex,
                acc: self.getAccMessage('dispenser', msgId)
            };

            this.createAccDiv(dispenserHackScreenProp);
        },


        /*
        * Displays the dispenser
        * @method renderDispenser
        */

        renderDispenser: function renderDispenser(dispenserData) {
            if (!this.enableDispenser) {
                return;
            }

            this.dispenserTiles = [];
            var self = this,
                viewClassName = MathInteractives.Common.Components.Views.PanBalanceStructured,
                dispenserDataArray = dispenserData ? dispenserData : this.dispenserData,
                dispenserDataArrayLength = dispenserDataArray.length,
                index = (this.model.get('negativeTiles') === false) ? 2 : 0,
                $dispenserContainer = this.$('.dispenser-container').show(),
                $row1 = this.$('.dispenser-row-1'),
                $row2 = this.$('.dispenser-row-2'),
                $parent,
                draggableObject = {
                    revert: 'invalid',
                    zIndex: 999,
                    helper: "clone",
                    start: function (event, ui) {
                        var BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
                        if (BrowserCheck.isFirefox) {

                            ui.helper.children().find('.green-tile-border-shadow').removeClass('green-tile-border-shadow');
                            ui.helper.children().find('.red-tile-border-shadow').removeClass('red-tile-border-shadow');
                        }
                        else {
                            ui.helper.children().find('.green-tile-border').removeClass('green-tile-border');
                            ui.helper.children().find('.red-tile-border').removeClass('red-tile-border');
                        }
                        self._removeMarqueeOnTileDrag();
                        self.trigger(viewClassName.TILE_DRAG);
                        $(this).draggable('option', 'revert', 'invalid');
                        ui.helper.find('.green-tile-border').removeClass('green-tile-border');
                        ui.helper.find('.red-tile-border').removeClass('red-tile-border');
                    },
                    cancel: ".var-tile-right-shadow,.num-tile-right-shadow,.var-tile-bottom-shadow,.num-tile-bottom-shadow",
                    containment: self._getContainmentSelector(),
                    appendTo: self._getContainmentSelector()
                },
                $tile = null,
                $dynamicTileDroppableContainer = this.$('.dynamic-container');

            for (; index < dispenserDataArrayLength; index++) {
                if (dispenserDataArray[index].isVarNegative) {
                    $parent = $row1;
                }
                else {
                    $parent = $row2;
                }

                if (this.model.get('negativeTiles') === false) {
                    this.$($row1).remove();
                }
                //dispenserDataArray[index].isDisabled = bIsDisabled;
                //if (dispenserDataArray[index].type === 'Var') {
                //    if (dispenserDataArray[index].isVarNegative) {
                //        dispenserDataArray[index].text = '-' + dispenserDataArray[index].text;
                //    }
                //    dispenserDataArray[index].text = '<span class="italic">' + dispenserDataArray[index].text + '</span>'
                //}
                $tile = this._createDraggableTiles($parent, dispenserDataArray[index], this.idPrefix + 'dispenser-tile-', index, true, true);
                //$.fn.EnableTouch('.' + viewClassName.TILE_CLASS);
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.' + viewClassName.TILE_CLASS), {
                    specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE |
                        MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.STOP_PROPAGATION
                });

                $tile.draggable(draggableObject);
                $tile.off('touchmove.forStopPropogation').on('touchmove.forStopPropogation', function (event) {
                    event.stopPropagation();
                });
                self._makeContextMenuForDraggable($tile, 'dispenser', false);
            }
        },

        /**
        * Creates a context menu for the tile depending on it's current holder & presence of temporary bins.
        *
        * @method _makeContextMenuForDraggable
        * @param $tile {Object} Jquery reference of the tile to be dropped using context menu.
        * @param from {String} String indicating the tile's pan container - 'left', 'right' or 'dispenser'.
        * @param binPresent {Boolean} True if temporary bins are present.
        * @private
        */
        _makeContextMenuForDraggable: function _makeContextMenuForDraggable($tile, from, binPresent) {
            var self = this,
                contextMenuView,
                options = {
                    el: self.player.$el,
                    prefix: self.idPrefix,
                    contextMenuCount: 5,
                    manager: self.manager,
                    thisView: self,
                    nestedMenuData: {},
                    elements: [$tile],
                    screenId: 'pan-balance-context-menu'
                },
                isDispenser = (from === 'dispenser');
            contextMenuView = MathInteractives.global.ContextMenu.initContextMenu(options);
            var ignoreOptions = self._getIgnoreOptionsForTile($tile, from, binPresent);
            contextMenuView.editContextMenu(ignoreOptions, true);
            $tile.data({ 'contextMenu': contextMenuView });
            $tile.on(MathInteractives.global.ContextMenu.CONTEXTMENU_SELECT, $.proxy(this._onContextMenuSelect, this, $tile, isDispenser));
            $tile.on(MathInteractives.global.ContextMenu.CONTEXTMENU_HIDE, $.proxy(this._onContextMenuHide, this, $tile));
            $tile.off('keyup.deleteFromPan').on('keyup.deleteFromPan', function (e) {
                e = (e) ? e : window.event;
                var charCode = (e.keyCode) ? e.keyCode : e.which;
                if (charCode === 68) {
                    self._throwAwayTile($tile);
                }
            });
        },

        /**
        * Event handler for CONTEXTMENU_HIDE; it sets the focus to the draggable tile
        *
        * @method _onContextMenuHide
        * @param $tile {Object} The jquery reference of the draggable tile to be re-placed.
        * @param event {Object} The CONTEXTMENU_SELECT event object.
        * @param args {Object} Event object fired on pressing space on a context menu option.
        * @private
        */
        _onContextMenuHide: function _onContextMenuHide($tile, event, args) {
            var tileAccId = $tile[0].id.slice(this.idPrefix.length) + '-draggable-tile-text-container';
            this.setFocus(tileAccId);
        },

        /**
        * Event handler for CONTEXTMENU_SELECT; it drops the draggable tile on the option selected in the context menu.
        *
        * @method _onContextMenuSelect
        * @param $tile {Object} The jquery reference of the draggable tile to be re-placed.
        * @param isDispenser {Boolean} Boolean indicating that the drop is from a dispenser so that a copy is dropped.
        * @param event {Object} The CONTEXTMENU_SELECT event object.
        * @param args {Object} Event object fired on pressing space on a context menu option.
        * @private
        */
        _onContextMenuSelect: function ($tile, isDispenser, event, args) {
            var selectedOptionId = args.currentTarget.id,
                droppableNumber = selectedOptionId.charAt(selectedOptionId.length - 1),
                $container,
                isClickAndClick = (isDispenser === true),
                isTemporaryBin = false;
            switch (droppableNumber) {

                case '0': $container = this.$('#' + this.idPrefix + '-left-dynamic-wrapper');
                    break;
                case '1': $container = this.$('#' + this.idPrefix + '-right-dynamic-wrapper');
                    break;
                case '2': $container = null; // trash-can
                    break;
                case '3': $container = this.$('#' + this.idPrefix + '-left-temporary-bin');
                    isTemporaryBin = true;
                    break;
                case '4': $container = this.$('#' + this.idPrefix + '-right-temporary-bin');
                    isTemporaryBin = true;
                    break;
            }
            if ($container) {
                this._addTileInContainer($tile, $container, isClickAndClick, isTemporaryBin);
                if (droppableNumber === '3') {
                    this.setFocus('-left-temporary-bin');
                }
                else if (droppableNumber === '4') {
                    this.setFocus('-right-temporary-bin');
                }
            }
            else { // trash can - delete tile
                this._throwAwayTile($tile);
            }
        },

        /*
        * Create pan balance with specified options
        * @method _ Tiles
        * @param {object} $parent
        * @param {object} dispenserTileData
        * @param String identifierString
        * @param String suffixIndex
        */
        _createDraggableTiles: function _createDraggableTiles($parent, dispenserTileData, identifierString, suffixIndex, isDefaultTile, isDispenserTile) {
            var _isDefaultTile = isDefaultTile ? isDefaultTile : false,
                _isDispenserTile = isDispenserTile ? isDispenserTile : false,
                bIsDisabled = dispenserTileData.isDisabled ? dispenserTileData.isDisabled : this._getIsDisabled(),
                dataIsVarNegative = dispenserTileData.isVarNegative ? dispenserTileData.isVarNegative : false,
                dataText = dispenserTileData.text,
                dataType = dispenserTileData.type,
                dataValue = dispenserTileData.type === 'Var' ? this.draggableVariableValue : dispenserTileData.value,
                buttonType = MathInteractives.Common.Components.Views.Button.TYPE.CUSTOM,
                imagePathIds = dataIsVarNegative ? ['pan-balance-red-draggable-left-right', 'pan-balance-red-draggable-mid'] : ['pan-balance-green-draggable-left-right', 'pan-balance-green-draggable-mid'],
                constantHeight = 41,
                widthOfTile = 82,
                filePath = this.filePath,
                idString = identifierString,
                classString = null,
                $draggableTile = null,
                filePath = this.filePath,
                buttonData = null,
                equationText,
                self = this;

            if (typeof (suffixIndex) !== 'undefined') {
                idString = idString + suffixIndex;
            }

            classString = identifierString + ' ' + viewClassName.TILE_CLASS + ' draggable-tile' + dataType;
            classString = isDispenserTile ? classString + ' dispenser-tile' : classString;


            $draggableTile = $('<div>', {
                'id': idString,
                'class': classString
            });


            if (dataType === 'Num') {
                widthOfTile = 41;
            }


            if (_isDefaultTile) {
                if (dataText.indexOf(viewClassName.NEGATIVE_TILE_INDICATOR) === -1) {// '–' is en dash char and it decides if the char is negative
                    if (dataType === 'Var') {
                        if (dataIsVarNegative) {
                            dataText = viewClassName.NEGATIVE_TILE_INDICATOR + dataText;
                        }
                        dataText = '<i>' + dataText + '</i>'
                    }
                    if (dataType === 'Num' && dataIsVarNegative) {
                        dataText = viewClassName.NEGATIVE_TILE_INDICATOR + dataText;
                    }
                }
            }
            buttonData = {
                id: idString,
                type: buttonType,
                path: filePath,
                text: dataText,
                width: widthOfTile,
                imagePathIds: imagePathIds,
                height: constantHeight,
                isDraggable: true,
                isDisabled: bIsDisabled,
                dataIsVarNegative: dataIsVarNegative
            };

            $parent.append($draggableTile);

            //var newTile = this._generateTileButton(buttonData);

            var newTile = new MathInteractives.Common.Components.Views.PanBalanceDraggableTile({
                el: $draggableTile,
                buttonData: buttonData,
                filePath: filePath,
                viewClassName: viewClassName,
                dataType: dataType,
                dataText: dataText,
                dataValue: dataValue
            });

            if (isDispenserTile) {
                this._createHackScreenForDispenserTiles({
                    $draggableTile: $draggableTile,
                    dataText: dispenserTileData.text,
                    tileNegative: buttonData.dataIsVarNegative
                });

                this.dispenserTiles.push(newTile);
                $draggableTile.on('click', function () {
                    if (self._getIsDisabled()) {
                        return;
                    }
                    var index = null,
                        dispenserTiles = self.dispenserTiles,
                        length = dispenserTiles.length,
                        isSelected,
                        accId = self.$(this).find('.pan-balance-draggable-tile-text-container').attr('id'),
                        tileSign = $(this).data('isVarNegative') ? self.getAccMessage('negative', 0) + ' ' : '',
                        tileText = tileSign + (($(this).data('type') === 'Var') ? 'x' : 1);

                    accId = accId.slice(self.idPrefix.length);

                    self.$('#' + self.idPrefix + accId + '-acc-elem').blur();

                    for (index = 0; index < length; index++) {
                        if (dispenserTiles[index] === newTile) {
                            continue;
                        }
                        dispenserTiles[index].removeBorder();
                        self._changeDispenserTileAccMsg(dispenserTiles[index].$el, false);
                    }
                    isSelected = newTile.showBorder();
                    self._changeDispenserTileAccMsg(newTile.$el, isSelected);

                    self._removeMarqueeOnTileDrag();

                    self.setFocus(accId);

                    // Set pan acc text to say "Use space bar to drop the tile"
                    self._setPanAccText(tileText);
                    // Set temp bin acc text to say "You may only delete tiles from the %@$% pan using this bin."
                    self._setTempBinAccText();

                    self.trigger(viewClassName.DISPENSER_TILE_CLICKED, { newTile: newTile });
                    self.currentSelectedDispenserTile = newTile;
                    // self.marqueeView.enableMarquee();
                })
            }
            //else {
            //    this._createHackScreenForPanTiles({
            //        newTile: newTile,
            //        draggableTile: $draggableTile, 
            //        dataText: dataText,
            //        dataType: dataType
            //    });
            //}

            this._handleMarqueeShowHide(newTile.$el);

            return $draggableTile.data({
                'value': dataValue,
                'type': dataType,
                'text': dataText,
                'isVarNegative': dataIsVarNegative,
                isDisabled: bIsDisabled
            });
        },

        /**
        * Called on click on dispenser tile it changes the message of the tile to selected or not.
        *
        * @method _changeDispenserTileAccMsg
        * @param _$dispenserTile {Object} dispenser tile
        * @param selected {Boolean} Set to true if the tile is selected.
        * @private
        */
        _changeDispenserTileAccMsg: function _changeDispenserTileAccMsg(_$dispenserTile, selected) {
            var accDivId = _$dispenserTile.find('.pan-balance-draggable-tile-text-container').attr('id'),
                accText = _$dispenserTile.data('isVarNegative') ? this.getAccMessage('negative', 0) + ' ' : '';

            accDivId = accDivId.slice(this.idPrefix.length);
            accText += (_$dispenserTile.data('type') === 'Var') ? 'x' : 1;
            accText += ' ' + this.getAccMessage('tile', 0);

            if (selected) {
                accText += ' ' + this.getAccMessage('tile', 1);
            }
            else {
                accText += ' ' + this.getAccMessage('tile', 2);
            }

            this.setAccMessage(accDivId, accText);
        },

        changeDispenserTileAccMsg: function changeDispenserTileAccMsg($dispenserTile, selected) {
            this._changeDispenserTileAccMsg($dispenserTile, selected);
        },

        _setPanAccText: function _setPanAccText(tileText, deletedTileText) {
            var self = this,
                newAccMsgForLeftPan = null,
                newAccMsgForRightPan = null,
                equationText,
                dispenserTile = self._getCurrentSelectedDispenserTile(),
                tileSign,
                leftPanTileCount = self.getTileCountInPan('left'),
                rightPanTileCount = self.getTileCountInPan('right'),
                prependText,
                equationTextForLeftPan,
                equationTextForRightPan,
                prependTextForLeftPan,
                prependTextForRightPan;

            if (dispenserTile === null) {
                self._enableDisableDroppedTile(true);
                if ((leftPanTileCount === 0 && !deletedTileText) || (leftPanTileCount === 0 && deletedTileText)) {
                    newAccMsgForLeftPan = self.getAccMessage('left-dynamic-pan', 0);
                }
                else {
                    newAccMsgForLeftPan = self.getAccMessage('left-dynamic-pan', 2);
                    equationTextForLeftPan = self._getAccTextForEquation('left');
                    if (!deletedTileText) {
                        newAccMsgForLeftPan = self.getAccMessage('pan-state', 'current-equation', [equationTextForLeftPan]) + ' ' + newAccMsgForLeftPan;
                    }
                }
                if ((rightPanTileCount === 0 && !deletedTileText) || (rightPanTileCount === 0 && deletedTileText)) {
                    newAccMsgForRightPan = self.getAccMessage('right-dynamic-pan', 0);
                }
                else {
                    newAccMsgForRightPan = self.getAccMessage('right-dynamic-pan', 2);
                    equationTextForRightPan = self._getAccTextForEquation('right');
                    if (!deletedTileText) {
                        newAccMsgForRightPan = self.getAccMessage('pan-state', 'current-equation', [equationTextForRightPan]) + ' ' + newAccMsgForRightPan;
                    }
                }
            }
            else {
                self._enableDisableDroppedTile(false);

                if (!tileText) {
                    tileSign = dispenserTile.data('isVarNegative') ? self.getAccMessage('negative', 0) + ' ' : '';
                    tileText = tileSign + (dispenserTile.data('type') === 'Var' ? 'x' : '1');
                }

                if ((leftPanTileCount === 0 && !deletedTileText) || (leftPanTileCount === 1 && deletedTileText)) {
                    newAccMsgForLeftPan = self.getAccMessage('left-dynamic-pan', 1, [tileText]);
                }
                else {
                    equationText = self._getAccTextForEquation('left');
                    newAccMsgForLeftPan = self.getAccMessage('left-dynamic-pan', 3, [equationText, tileText]);
                }

                if ((rightPanTileCount === 0 && !deletedTileText) || (rightPanTileCount === 1 && deletedTileText)) {
                    newAccMsgForRightPan = self.getAccMessage('right-dynamic-pan', 1, [tileText]);
                }
                else {
                    equationText = self._getAccTextForEquation('right');
                    newAccMsgForRightPan = self.getAccMessage('right-dynamic-pan', 3, [equationText, tileText]);
                }
            }
            if (deletedTileText) {
                if (equationTextForLeftPan === undefined) {
                    prependTextForLeftPan = self.getAccMessage('tile-delete-text', 1, [deletedTileText]);
                }
                else {
                    prependTextForLeftPan = self.getAccMessage('tile-delete-text', 0, [deletedTileText, equationTextForLeftPan]);
                }
                newAccMsgForLeftPan = prependTextForLeftPan + newAccMsgForLeftPan;

                if (equationTextForRightPan === undefined) {
                    prependTextForRightPan = self.getAccMessage('tile-delete-text', 1, [deletedTileText]);
                }
                else {
                    prependTextForRightPan = self.getAccMessage('tile-delete-text', 0, [deletedTileText, equationTextForRightPan]);
                }
                newAccMsgForRightPan = prependTextForRightPan + newAccMsgForRightPan;
            }
            self.setAccMessage('-left-dynamic-wrapper', newAccMsgForLeftPan);
            self.setAccMessage('-right-dynamic-wrapper', newAccMsgForRightPan);
        },

        _getAccTextForEquation: function _getAccTextForEquation(pan) {
            var equationCoefficients = this.getEquationCoefficients(pan),
                accText, coefficientOfXText, constantText, plusMinusText;

            if (equationCoefficients.constant === 0) {
                if (equationCoefficients.variable === 1) {
                    accText = 'x';
                }
                else if (equationCoefficients.variable === -1) {
                    accText = this.getMessage('pan-equation-text', 'minus') + ' x';
                }
                else {
                    accText = this.getMessage('pan-equation-text', 0, [equationCoefficients.variable]);
                }
            }
            else {
                if (equationCoefficients.variable === 0) {
                    accText = equationCoefficients.constant;
                }
                else {
                    if (equationCoefficients.variable === 1) {
                        coefficientOfXText = '';
                    }
                    else if (equationCoefficients.variable === -1) {
                        coefficientOfXText = this.getMessage('pan-equation-text', 'minus');
                    }
                    else {
                        coefficientOfXText = equationCoefficients.variable;
                    }

                    if (equationCoefficients.constant < 0) {
                        plusMinusText = this.getMessage('pan-equation-text', 'minus');
                        constantText = Math.abs(equationCoefficients.constant);
                    }
                    else {
                        plusMinusText = this.getMessage('pan-equation-text', 'plus');
                        constantText = equationCoefficients.constant;
                    }
                    accText = this.getMessage('pan-equation-text', 1, [coefficientOfXText, plusMinusText, constantText]);
                }
            }

            return accText;
        },

        _enableDisableDroppedTile: function _enableDisableDroppedTile(state) {
            var self = this;
            self.$('.pan-dropped').each(function () {
                var tileId = $(this).find('.pan-balance-draggable-tile-text-container').attr('id').slice(self.idPrefix.length);

                if (tileId) {
                    self.enableTab(tileId, state);
                    if (state === true) {
                        self._reassignTabIndexesToPanTiles(0, 'left');
                        self._reassignTabIndexesToPanTiles(0, 'right');
                    }
                }
            })
        },

        _createHackScreenForDispenserTiles: function _createHackScreenForDispenserTiles(dispenserTileObj) {
            var accDivId = dispenserTileObj.$draggableTile.find('.pan-balance-draggable-tile-text-container').attr('id'),
                accText = dispenserTileObj.tileNegative ? this.getAccMessage('negative', 0) + ' ' : '';

            accDivId = accDivId.slice(this.idPrefix.length);
            accText = accText + (dispenserTileObj.dataText === '1' ? '1' : dispenserTileObj.dataText);

            this.tabIndex += 2;

            var dispenserTileHackScreenProp = {
                elementId: accDivId,
                tabIndex: this.tabIndex,
                acc: accText + ' ' + this.getAccMessage('tile', 0)
            };

            this.createAccDiv(dispenserTileHackScreenProp);
        },

        _createHackScreenForPanTiles: function _createHackScreenForPanTiles(draggableDataObject) {
            var accDivId = draggableDataObject.newTile.find('.pan-balance-draggable-tile-text-container').attr('id'),
                panPosition = draggableDataObject.panPosition,
                type = draggableDataObject.newTile.data().type,
                text = (type === 'Var') ? 'x' : '1', //draggableDataObject.newTile.data().text,
                row = draggableDataObject.newTile.attr('rowNo'),
                col = draggableDataObject.newTile.attr('colNo'),
                tabIndex;

            if (draggableDataObject.newTile.data().isVarNegative) {
                text = this.getAccMessage('negative', 0) + ' ' + text;
            }

            accDivId = accDivId.slice(this.idPrefix.length);

            if (panPosition === 'left') {
                if (type === 'Var') {
                    tabIndex = this._getTabIndexForVar(row, 'leftPanVariable');
                }
                else {
                    tabIndex = this._getTabIndexForNum(row, col, 'leftPanNumber', panPosition);
                }
            }
            else {
                if (type === 'Var') {
                    tabIndex = this._getTabIndexForVar(row, 'rightPanVariable');
                }
                else {
                    tabIndex = this._getTabIndexForNum(row, col, 'rightPanNumber', panPosition);
                }
            }
            var panTilesHackScreenProp = {
                elementId: accDivId,
                tabIndex: tabIndex,
                acc: text + ' ' + this.getAccMessage('tile', 0)
            };

            this.createAccDiv(panTilesHackScreenProp);

            if (this._getCurrentSelectedDispenserTile() !== null) {
                this.enableTab(accDivId, false);
            }
        },

        _getTabIndexForVar: function (row, panVarOrNum) {

            var tabIndex;

            switch (parseInt(row)) {
                case 3:
                    tabIndex = this.panTabIndexes[panVarOrNum].row3;
                    break;
                case 2:
                    tabIndex = this.panTabIndexes[panVarOrNum].row2;
                    break;
                case 1:
                    tabIndex = this.panTabIndexes[panVarOrNum].row1;
                    break;
                case 0:
                    tabIndex = this.panTabIndexes[panVarOrNum].row0;
                    break;
            }

            return tabIndex;
        },

        _getTabIndexForNum: function (row, col, panVarOrNum, panPosition) {
            var tabIndex, length, count = 0, len, self = this, id;

            var dispenserTile = self._getCurrentSelectedDispenserTile();
            if (dispenserTile === null) {
                self._reassignTabIndexesToPanTiles(parseInt(row) + 1, panPosition);

                count = 0;
                length = this.$('.' + panPosition + '-tile-container').find('.Num-table').find('.row-' + row).children().length;

                for (var i = 0; i < length - 1; i++) {
                    var $id = $(this.$('.' + panPosition + '-tile-container').find('.Num-table').find('.row-' + row).children()[i]);
                    id = $id.find('.pan-balance-draggable-tile-text-container').attr('id').slice(this.idPrefix.length);
                    this.setTabIndex(id, this.panTabIndexes[panVarOrNum]['row' + row] + count);
                    count += 5;
                }
            }
            switch (parseInt(row)) {
                case 3:
                    tabIndex = this._getTabIndexForNumAccordingToRowLen('row3', length, panVarOrNum);
                    break;
                case 2:
                    tabIndex = this._getTabIndexForNumAccordingToRowLen('row2', length, panVarOrNum);
                    break;
                case 1:
                    tabIndex = this._getTabIndexForNumAccordingToRowLen('row1', length, panVarOrNum);
                    break;
                case 0:
                    tabIndex = this._getTabIndexForNumAccordingToRowLen('row0', length, panVarOrNum);
                    break;
            }

            return tabIndex;
        },

        _getTabIndexForNumAccordingToRowLen: function (row, len, panVarOrNum) {
            var tabIndex;

            switch (parseInt(len)) {
                case 1:
                    tabIndex = this.panTabIndexes[panVarOrNum][row];
                    break;
                case 2:
                    tabIndex = this.panTabIndexes[panVarOrNum][row] + 5;
                    break;
                case 3:
                    tabIndex = this.panTabIndexes[panVarOrNum][row] + 10;
                    break;
                case 4:
                    tabIndex = this.panTabIndexes[panVarOrNum][row] + 15;
                    break;
            }

            return tabIndex;
        },

        _reassignTabIndexesToPanTiles: function _reassignTabIndexesToPanTiles(row, panPosition) {
            var count, len, id, self = this;
            for (var j = row; j <= 3; j++) {
                count = 0;
                len = this.$('.' + panPosition + '-tile-container').find('.Num-table').find('.row-' + j).children().length;//each(function () {
                for (var k = 0; k < len; k++) {
                    var $id = $(this.$('.' + panPosition + '-tile-container').find('.Num-table').find('.row-' + j).children()[k]);
                    id = $id.find('.pan-balance-draggable-tile-text-container').attr('id').slice(this.idPrefix.length);
                    self.setTabIndex(id, self.panTabIndexes[panPosition + 'PanNumber']['row' + j] + count);
                    count += 5;
                }
            }
        },

        _createHackScreenForTemporaryBinTiles: function _createHackScreenForTemporaryBinTiles(draggableTile) {
            if (this.isMarqueeDrop) {
                return;
            }
            var panContainer = draggableTile.attr('panContainer'),
                row = draggableTile.attr('rowNo'),
                text = (draggableTile.data().type === 'Var') ? 'x' : '1',//draggableTile.data().text,
                self = this,
                binPosition, accDivId,
                noOfTilesInCurrentRow = draggableTile.parent().children().length,
                tabIndex;

            //accDivId = accDivId.slice(this.idPrefix.length);

            if (draggableTile.data().isVarNegative) {
                text = this.getAccMessage('negative', 0) + ' ' + text;
            }

            if (panContainer === 'left') {
                binPosition = 'leftTemporaryBin';
            }
            else {
                binPosition = 'rightTemporaryBin';
            }

            for (var i = 0; i < noOfTilesInCurrentRow; i++) {
                accDivId = $(draggableTile.parent().children()[i]).find('.pan-balance-draggable-tile-text-container').attr('id');
                accDivId = accDivId.slice(this.idPrefix.length);

                tabIndex = this.panTabIndexes[binPosition]['row' + row] + (5 * i);

                var temporaryBinTilesHackScreenProp = {
                    elementId: accDivId,
                    tabIndex: tabIndex,
                    acc: this.getAccMessage('temporaryTrashCanTile', 0) + ' ' + text
                };

                this.createAccDiv(temporaryBinTilesHackScreenProp);
            }

        },

        /*
        * Initializes the droppable contaners with required data
        * @method _initializeDroppableContainers
        * @private
        */
        _initializeDroppableContainers: function _initializeDroppableContainers() {

            var self = this,
                temporaryDroppedClass = 'temporary-dropped',
                $dynamicTileDroppableContainer = this.$('.dynamic-container'),
                $rowStrucureForConstants = null,
                $rowStrucureForVariables = null,
                maxRows = viewClassName.MAX_ROWS,
                maxCols = viewClassName.MAX_COLS;

            //this.panTabIndexes = $.extend(true, {}, this.model.getPanTilesTabIndexes());

            $rowStrucureForConstants = this._createTilesContainer({ rowCount: maxRows, colCount: 0 }).addClass('Num-table');
            $rowStrucureForVariables = this._createTilesContainer({ rowCount: maxRows, colCount: 0 }).addClass('Var-table');
            $dynamicTileDroppableContainer.find('.dynamic-wrapper').append($rowStrucureForVariables).append($rowStrucureForConstants);

            self._attachHandlerForClickAndClick();

            //var $leftPanParentContainer = this.$('.left-tile-container'),
            //    $rightPanParentContainer = this.$('.right-tile-container');
            //this._createHackScreenForLeftDynamicPan($leftPanParentContainer);
            //this._createHackScreenForRightDynamicPan($rightPanParentContainer);

            $dynamicTileDroppableContainer.show().droppable({
                drop: function (event, ui) {
                    self._panDropHandler(event, ui, $(this).find('.dynamic-wrapper'));
                }
            });

            var $leftPanParentContainer = this.$('.left-tile-container'),
                $rightPanParentContainer = this.$('.right-tile-container');
            this._createHackScreenForLeftDynamicPan($leftPanParentContainer);
            this._createHackScreenForRightDynamicPan($rightPanParentContainer);

            this._createHackScreenForAccessibilityPans($leftPanParentContainer);
            this._createHackScreenForAccessibilityPans($rightPanParentContainer);
            self._attachHandlersForAccessibilityHelperPans();
        },

        _attachHandlersForAccessibilityHelperPans: function _attachHandlersForAccessibilityHelperPans() {
            var self = this,
                $tile = null,
                leftAccessibilityPanId = '-left-accessibility-dynamic-wrapper',
                rightAccessibilityPanId = '-right-accessibility-dynamic-wrapper',
                leftAccessibilityTrashCanId = '-left-accessibility-temporary-bin',
                rightAccessibilityTrashCanId = '-right-accessibility-temporary-bin',
                $leftAccessibilityPan = this.$('#' + this.idPrefix + leftAccessibilityPanId),
                $rightAccessibilityPan = this.$('#' + this.idPrefix + rightAccessibilityPanId),
                $leftAccessibilityTrashCan = this.$('#' + this.idPrefix + leftAccessibilityTrashCanId),
                $rightAccessibilityTrashCan = this.$('#' + this.idPrefix + rightAccessibilityTrashCanId),
                leftPanId = '-left-dynamic-wrapper',
                rightPanId = '-right-dynamic-wrapper',
                leftTrashCanId = '-left-temporary-bin',
                rightTrashCanId = '-right-temporary-bin',
                $leftPan = this.$('#' + this.idPrefix + leftPanId),
                $rightPan = this.$('#' + this.idPrefix + rightPanId),
                $leftTrashCan = this.$('#' + this.idPrefix + leftTrashCanId),
                $rightTrashCan = this.$('#' + this.idPrefix + rightTrashCanId),
                keyCode;

            $leftAccessibilityPan.off('click').on('click', function (event) {
                $tile = self.currentDroppedTileSelected;
                self._addTileInContainer($tile, $leftPan, false, false);
                self._disableTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', '-right-accessibility-temporary-bin');
            });

            $rightAccessibilityPan.off('click').on('click', function (event) {
                $tile = self.currentDroppedTileSelected;
                self._addTileInContainer($tile, $rightPan, false, false);
                self._disableTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', '-left-accessibility-temporary-bin');
            });

            $leftAccessibilityTrashCan.off('click').on('click', function (event) {
                $tile = self.currentDroppedTileSelected;
                self._addTileInContainer($tile, $leftTrashCan, false, true);
                self.setFocus('-left-temporary-bin');
                self._disableTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', '-left-accessibility-temporary-bin');
            });

            $rightAccessibilityTrashCan.off('click').on('click', function (event) {
                $tile = self.currentDroppedTileSelected;
                self._addTileInContainer($tile, $rightTrashCan, false, true);
                self.setFocus('-right-temporary-bin');
                self._disableTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', '-right-accessibility-temporary-bin');
            });

            self.$('#' + self.idPrefix + leftPanId + '-acc-elem').off('keydown.pan-balance')
                .on('keydown.pan-balance', $.proxy(self._setPanAccTextOnTab, self));
            self.$('#' + self.idPrefix + rightPanId + '-acc-elem').off('keydown.pan-balance')
                .on('keydown.pan-balance', $.proxy(self._setPanAccTextOnTab, self));

            self.focusOut(leftPanId, function () { self._setPanAccText(); });
            self.focusOut(rightPanId, function () { self._setPanAccText(); });
        },

        _setPanAccTextOnTab: function _setPanAccTextOnTab(e) {
            e = (e) ? e : window.event;
            var charCode = (e.keyCode) ? e.keyCode : e.which;
            if (charCode === 9) {
                this._setPanAccText();
            }
        },

        _attachHandlerForClickAndClick: function _attachHandlerForClickAndClick() {
            var self = this,
                 temporaryDroppedClass = 'temporary-dropped',
                 $dynamicTileDroppableContainer = this.$('.dynamic-container');


            $dynamicTileDroppableContainer.off('click').on('click', function (event) {
                var $currentSelectedTile = self._getCurrentSelectedDispenserTile();
                if ($currentSelectedTile && !self.isFading) {
                    self._addTileInContainer($currentSelectedTile, $(this).find('.dynamic-wrapper'), true, false);
                    // self.marqueeView.enableMarquee();
                }

            })
        },

        _detachHandlerForClickAndClick: function _detachHandlerForClickAndClick() {
            var $dynamicTileDroppableContainer = this.$('.dynamic-container');
            $dynamicTileDroppableContainer.off('click');
        },

        _addTileInContainer: function _addTileInContainer($tile, $container, isClickAndClick, isTemporaryBin, suppressEvents) {
            //TODO

            var self = this,
                ui = { draggable: $tile, helper: $tile },
                dropHandler = isTemporaryBin ? self._onTemporaryBinDrop : self._panDropHandler;
            dropHandler.call(self, null, ui, $container, isClickAndClick, suppressEvents);
        },

        _panDropHandler: function _panDropHandler(event, ui, $droppableContainer, isClickAndClick, suppressEvents) {
            if (ui.draggable.hasClass('marquee-div')) {
                this._marqueeDrop(event, ui, $droppableContainer);
                return;
            }

            var self = this,
                temporaryDroppedClass = 'temporary-dropped',
                $helper = ui.helper,
                $draggable = ui.draggable,
                $this = $droppableContainer,
                panPosition = $this.data().pos,
                dataObject = $draggable.data(),
                cloneDataObject = {
                    'value': dataObject.value,
                    'type': dataObject.type,
                    'text': dataObject.text,
                    'isVarNegative': dataObject.isVarNegative
                },
                $clone = ui.helper.clone(),
                attrPanContainer = $clone.attr('panContainer'),
                attrRowNo = Number($clone.attr('rowNo')),
                panWrapperClass = attrPanContainer + '-pan-wrapper',
                draggingClass = 'ui-draggable-dragging',
                $draggedFromTemporaryTrashCan = self.$('.' + attrPanContainer + '-temporary-bin'),
                newTile = null,
                $currentBin,
                fireEvents = true;

            self.panPosition = panPosition;
            $clone.removeClass(draggingClass).data(cloneDataObject);

            var id = $droppableContainer.attr('id').slice(self.idPrefix.length),
                isNullified = false;


            //self.panTabIndexes = $.extend(true, {}, self.model.getPanTilesTabIndexes());
            if ($draggable.hasClass(temporaryDroppedClass)) {//tile is from temporary bin
                if ($draggable.attr('pancontainer') === panPosition) {
                    newTile = self._handleTilesPositionInContainer($this, $clone);
                    if (newTile) {

                        self._createHackScreenForPanTiles({
                            newTile: newTile,
                            panPosition: newTile.attr('panContainer')
                        });

                        //self.setFocus(id);

                        self._makeTileDraggableAfterDrop(newTile);
                        self._makeContextMenuForDraggable(newTile, newTile.attr('panContainer'), true);
                        self.animateDynamicPan();
                        $draggable.remove();
                        isNullified = self._nullifyTileAfterDrop($this, newTile);

                        //Arrange all tiles in temporary trash can with a timeout of 1 ms to allow tile to drop and then rearrange
                        setTimeout(function () {
                            self._arrangeTilesInTemporaryTrashCans($draggedFromTemporaryTrashCan, 3);
                        }, 1);
                        //self._arrangeTilesInTemporaryTrashCans($draggedFromTemporaryTrashCan, attrRowNo);
                    } else {
                        $draggable.draggable("option", "revert", true);
                    }

                } else {
                    $draggable.draggable("option", "revert", true);
                }
            }
            else {//tile is from other pan
                newTile = self._handleTilesPositionInContainer($this, $clone);
                if (newTile && (!$this.parents('.pan-wrapper').hasClass(panWrapperClass))) {

                    self._createHackScreenForPanTiles({
                        newTile: newTile,
                        panPosition: newTile.attr('panContainer')
                    });


                    if (panPosition === 'left') {
                        $currentBin = this.$('.left-temporary-bin');
                    }
                    else {
                        $currentBin = this.$('.right-temporary-bin');
                    }
                    var isBinFull = self.isTemporaryBinFull($currentBin, newTile);
                    //patch for removing acual tile
                    /*if ($helper.hasClass('pan-dropped')) {
                        $draggable.remove();
                    }*/
                    if (attrPanContainer) {
                        var $draggedFromWrappr = self.$('.' + panWrapperClass).find('.dynamic-wrapper');
                        $draggedFromWrappr.find('#' + $draggable[0].id).remove();
                        self._arrangeTilesInPan($draggedFromWrappr, attrRowNo, false, $draggedFromWrappr.find('.' + dataObject.type + '-table'));
                    }

                    self._makeTileDraggableAfterDrop(newTile);
                    var tempBinPresent = (this.$('#' + this.idPrefix + '-left-temporary-bin').css('display') === 'block');
                    self._makeContextMenuForDraggable(newTile, newTile.attr('panContainer'), tempBinPresent);
                    /*if (!isBinFull) {
                        self.animateDynamicPan();
                    }*/
                }
                else {//if it is dropped in same pan, it should revert
                    // pan is full
                    self.$('#' + self.idPrefix + id + '-acc-elem').blur();
                    var tileType = (dataObject.isVarNegative) ? self.getAccMessage('negative', 0) + ' ' : '',
                        pan, panFullMsg, equationText,
                        formedEquationAccText,
                        equationCoefficient = this.getEquationCoefficients(panPosition),
                            costantCount=equationCoefficient.constant,
                            variableCount = equationCoefficient.variable;

                    tileType = tileType + ((dataObject.type == 'Num') ? '1' : 'x');
                    equationText = self._getAccTextForEquation(panPosition);
                    formedEquationAccText = self.getAccMessage('pan-state', 'current-equation', [equationText]);

                    if (panPosition === 'right') {
                        pan = self.getAccMessage('right', 0);

                        if ((variableCount >= viewClassName.MAX_VARIABLE) && (costantCount >= viewClassName.MAX_CONSTANT)) {
                             panFullMsg = self.getAccMessage('pan-state', 'full', [pan, equationText]);
                        }
                        else if (variableCount >= viewClassName.MAX_VARIABLE) {
                            panFullMsg = self.getAccMessage('pan-state', 'variable-full') + ' ' + formedEquationAccText;
                        }
                        else if (costantCount >= viewClassName.MAX_CONSTANT) {
                            panFullMsg = self.getAccMessage('pan-state', 'constant-full') + ' ' + formedEquationAccText;
                        }
                        
                        self.setAccMessage('-right-dynamic-wrapper', panFullMsg);
                    }
                    else {
                        pan = self.getAccMessage('left', 0);
                        //equationText = self._getAccTextForEquation(panPosition);
                        //panFullMsg = self.getAccMessage('pan-state', 'full', [pan, equationText]);
                        if ((variableCount >= viewClassName.MAX_VARIABLE) && (costantCount >= viewClassName.MAX_CONSTANT)) {
                            panFullMsg = self.getAccMessage('pan-state', 'full', [pan, equationText]);
                        }
                        else if (variableCount >= viewClassName.MAX_VARIABLE) {
                            panFullMsg = self.getAccMessage('pan-state', 'variable-full') + ' ' + formedEquationAccText;
                        }
                        else if (costantCount >= viewClassName.MAX_CONSTANT) {
                            panFullMsg = self.getAccMessage('pan-state', 'constant-full') + ' ' + formedEquationAccText;
                        }
                        self.setAccMessage('-left-dynamic-wrapper', panFullMsg);
                    }
                    self.setFocus(id);

                    $(newTile).remove();
                    newTile = null;
                    $draggable.draggable("option", "revert", true);
                    fireEvents = false;

                }
                if (newTile) {
                    // 3rd parameter passed to drop nullified tile into temp bin
                    $draggable.draggable();
                    $draggable.draggable('option', 'revert', true);

                    isNullified = self._nullifyTileAfterDrop($this, newTile, $draggable.hasClass('dispenser-tile'));

                    if ((isNullified === viewClassName.TILE_NOT_NULLIFIED || isNullified === viewClassName.TILE_NULLIFIED) && !isClickAndClick) {
                        $helper.remove();
                        if ($helper.hasClass('pan-dropped')) {
                            $draggable.remove();
                        }
                        //this._updateEquationForDynamicPanBalance();
                        //this.animateDynamicPan();
                    }
                    else if (!isClickAndClick && isNullified === viewClassName.PAN_FULL) {
                        newTile.remove();
                        $draggable.draggable('option', 'revert', true);
                        if ($helper.hasClass('pan-dropped')) {
                            $draggable.remove();
                        }
                        //this._updateEquationForDynamicPanBalance();
                        //this.animateDynamicPan();
                    }
                    this._updateEquationForDynamicPanBalance();
                    this.animateDynamicPan();
                }

            }
            if (fireEvents && !suppressEvents) {
                var tileSign = (dataObject.isVarNegative) ? self.getAccMessage('negative', 0) + ' ' : '',
                    tileType = '',
                    equation = self._getAccTextForEquation(panPosition),
                    leftPanWeight = self.getPanWeight('left'),
                    rightPanWeight = self.getPanWeight('right'),
                    leftPanName = self.getAccMessage('left', 0),
                    rightPanName = self.getAccMessage('right', 0),
                    lighterPan, heavierPan,
                    leftPanCoeff, rightPanCoeff, equationToModel,
                    newAccMsg, balanceMsg = '',
                    skipToStep2 = false;
                if (leftPanWeight > rightPanWeight) {
                    lighterPan = rightPanName;
                    heavierPan = leftPanName;
                    balanceMsg = self.getAccMessage('balance', 0, [heavierPan, lighterPan]);
                }
                else if (leftPanWeight < rightPanWeight) {
                    lighterPan = leftPanName;
                    heavierPan = rightPanName;
                    balanceMsg = self.getAccMessage('balance', 0, [heavierPan, lighterPan]);
                }
                else {
                    leftPanCoeff = self.getEquationCoefficients('left');
                    rightPanCoeff = self.getEquationCoefficients('right');
                    equationToModel = self.getEquationToModel();
                    if (rightPanCoeff.variable === 0 && rightPanCoeff.constant === equationToModel.c &&
                        leftPanCoeff.variable === equationToModel.a && leftPanCoeff.constant === equationToModel.b
                        && (self.$('#' + self.idPrefix + '-left-temporary-bin').css('display') != 'block')) {
                        skipToStep2 = true;
                    }
                    balanceMsg = self.getAccMessage('balance', 1);
                }
                tileType = (dataObject.type == 'Num') ? '1' : 'x';
                if (panPosition === 'right') {
                    if (!skipToStep2) {
                        self.$('#' + self.idPrefix + id + '-acc-elem').blur();
                        newAccMsg = self.getAccMessage('right-dynamic-pan', 4, [tileSign + tileType, equation]);
                        if (isNullified) {
                            newAccMsg = self.getAccMessage('right-dynamic-pan', 5, [tileType, tileType, equation]);
                        }
                        newAccMsg = newAccMsg + ' ' + balanceMsg;
                        self.setAccMessage(id, newAccMsg);
                        self.setFocus(id);
                    }
                    self.trigger(viewClassName.RIGHT_PAN_DROP, cloneDataObject);
                }
                else {
                    if (!skipToStep2) {
                        self.$('#' + self.idPrefix + id + '-acc-elem').blur();
                        newAccMsg = self.getAccMessage('left-dynamic-pan', 4, [tileSign + tileType, equation]);
                        if (isNullified) {
                            newAccMsg = self.getAccMessage('left-dynamic-pan', 5, [tileType, tileType, equation]);
                        }
                        newAccMsg = newAccMsg + ' ' + balanceMsg;
                        self.setAccMessage(id, newAccMsg);
                        self.setFocus(id);
                    }
                    self.trigger(viewClassName.LEFT_PAN_DROP, cloneDataObject);
                }
                self.trigger(viewClassName.PAN_DROP, cloneDataObject);
            }




            //var $leftPanParentContainer = this.$('.left-tile-container'),
            //    $rightPanParentContainer = this.$('.right-tile-container');
            //this._createHackScreenForLeftDynamicPan($leftPanParentContainer);
            //this._createHackScreenForRightDynamicPan($rightPanParentContainer);


        },

        _getTileBinTilesValue: function ($tempBin) {
            var $tilesInBin = $tempBin.find('.' + viewClassName.TILE_CLASS),
                numOfTiles = $tilesInBin.length,
                totalValueOfBinTiles = null,
                tileType = null;

            for (var i = 0; i < numOfTiles; i++) {
                tileType = $($tilesInBin[i]).data().type;

                switch (tileType) {
                    case 'Var':
                        totalValueOfBinTiles = totalValueOfBinTiles + 2;
                        break;
                    case 'Num':
                        totalValueOfBinTiles++;
                        break;
                }
            }

            return totalValueOfBinTiles;
        },

        _marqueeDrop: function _marqueeDrop(event, ui, $droppableContainer) {
            this.isOnDroppable = true;

            var self = this;
            var $tiles = ui.draggable.find('.' + viewClassName.TILE_CLASS);
            var pan = $droppableContainer.data().pos;
            var otherPan = pan === 'left' ? 'right' : 'left';
            var marqueeVarTiles = 0;
            var marqueeNumTiles = 0;
            var panVarTiles = Math.abs(self.getVariableCount(pan));
            var panNumTiles = Math.abs(self.getConstantsCount(pan));
            var $this = null, isTempBin = $droppableContainer.hasClass('temporary-bin'), currentTileCont = $tiles.attr('pancontainer'),
                isCurrentTileTempDropped = $tiles.hasClass('temporary-dropped'),
                $tempBin = this.$('.' + pan + '-temporary-bin'),
                isBinFull = false,
                panPositiveNumTiles = 0, panNegativeNumTiles = 0, panPositiveVarTiles = 0, panNegativeVarTiles = 0,
                marqPositiveNumTiles = 0, marqNegativeNumTiles = 0, marqPositiveVarTiles = 0, marqNegativeVarTiles = 0,
                binTilesValue = this._getTileBinTilesValue($tempBin),
                tileData = null,
                $panTiles = $droppableContainer.find('.' + viewClassName.TILE_CLASS),
                $tempBinTiles = $tempBin.find('.' + viewClassName.TILE_CLASS),
                maxBinCapacity = viewClassName.BIN_CAPACITY;


            this.isMarqueeDrop = true;
            $tiles.each(function () {
                $this = $(this);
                tileData = $this.data();
                if (tileData.type === 'Var') {
                    marqueeVarTiles++;
                    if (tileData.isVarNegative) {
                        marqNegativeVarTiles++;
                    }
                    else {
                        marqPositiveVarTiles++;
                    }
                }
                else {
                    marqueeNumTiles++;

                    if (tileData.isVarNegative) {
                        marqNegativeNumTiles++;
                    }
                    else {
                        marqPositiveNumTiles++;
                    }
                }
            });

            $panTiles.each(function () {
                $this = $(this);
                tileData = $this.data();
                if (tileData.type === 'Var') {

                    if (tileData.isVarNegative) {
                        panNegativeVarTiles++;
                    }
                    else {
                        panPositiveVarTiles++;
                    }
                }
                else {

                    if (tileData.isVarNegative) {
                        panNegativeNumTiles++;
                    }
                    else {
                        panPositiveNumTiles++;
                    }
                }
            });

            // Reverts the marquee for following checks
            // 1. if the droppable is temp bin and the pan position is not same i.e. right pan can drop inside righ temp bin
            // 2. If it the droppable is not temp bin and the Number tiles are greater than 16 or var tiles are greater than 4
            //      or the currentPan of tile is equal to the droppbale pan position and the dragged tile is not from the temp bin
            // 3. Revert if droppbale is temp bin and the tiles are from temp bin only
            // 4. Revert if the tiles is from the temp bin and the pan in which is to be dropped is nt matching
            // 5. If temp bin has place only for one 'Num' tile and 'Var' tiles in marquee and pan are cancellable
            // 6. If temp bin is full and tiles in marquee and pan are cancellable
            // 7. If temp bin cannot accomodate all marquee tiles

            if ((isTempBin && currentTileCont !== pan) ||
                (!isTempBin && (marqueeNumTiles + panNumTiles > 16 || marqueeVarTiles + panVarTiles > 4 || (currentTileCont === pan && !isCurrentTileTempDropped)))
                || (isTempBin && isCurrentTileTempDropped)
                || (isCurrentTileTempDropped && currentTileCont !== pan)
                || (binTilesValue === (maxBinCapacity - 1) && ((marqNegativeVarTiles > 0 && panPositiveVarTiles > 0)
                                            || (panNegativeVarTiles > 0 && marqPositiveVarTiles > 0)))
                || ((maxBinCapacity / 2) - Math.round(binTilesValue / 2) < Math.min(marqNegativeVarTiles, panPositiveVarTiles))
                || ((maxBinCapacity / 2) - Math.round(binTilesValue / 2) < Math.min(panNegativeVarTiles, marqPositiveVarTiles))
                || (maxBinCapacity - binTilesValue < Math.min(marqNegativeNumTiles, panPositiveNumTiles))
                || (maxBinCapacity - binTilesValue < Math.min(panNegativeNumTiles, marqPositiveNumTiles))
                || (isTempBin && !isCurrentTileTempDropped && binTilesValue + marqNegativeNumTiles + marqPositiveNumTiles + 2 * (marqNegativeVarTiles + marqPositiveVarTiles) > 24)
                ) {

                ui.draggable.draggable('option', 'revert', function (a) {
                    var $this = $(this), currentOffset = $this.offset(),
                        left = currentOffset.left,
                        top = currentOffset.top;

                    $({ left: left, top: top }).animate(self.marqueeView.getOriginalOffset(), {
                        step: function (value, data) {
                            if (data.prop === 'top') {
                                top = value;
                            } else {
                                left = value;
                            }
                            $this.offset({ left: left, top: top });
                        },
                        duration: 500
                    });
                });
                self.trigger(viewClassName.MARQUEE_DROP, false);
            }
            else {
                this.tilesToNullify = 0;
                ui.draggable.draggable('option', 'revert', 'invalid');
                var length = $tiles.length;
                for (var i = 0; i < length - 1; i++) {
                    self._addTileInContainer($($tiles[i]), $droppableContainer, false, isTempBin, true);
                }
                self._addTileInContainer($($tiles[i]), $droppableContainer, false, isTempBin, false);

                self._updateEquationForDynamicPanBalance();
                if (self.marqueeView) {
                    self.marqueeView.collapseMarquee();
                    // self.marqueeView.enableMarquee();
                    self.marqueeView.breakGroup();
                }
                self.trigger(viewClassName.MARQUEE_DROP, true);
            }
            return;
        },

        /*
        * Removes marquee div and its contents
        * @method _removeMarqueeOnTileDrag
        * @private
        */
        _removeMarqueeOnTileDrag: function () {
            if (this.marqueeView) {
                this.marqueeView.collapseMarquee();
                this.marqueeView.breakGroup();
            }
        },

        _getCurrentSelectedDispenserTile: function _getCurrentSelectedDispenserTile(returnView) {
            var dispenserTiles = this.dispenserTiles;
            var length = dispenserTiles.length;
            var index = null;
            for (index = 0; index < length; index++) {
                if (dispenserTiles[index].isSelected === true) {
                    if (returnView) {
                        return dispenserTiles[index];
                    }
                    else {
                        return dispenserTiles[index].$el;
                    }
                }
            }

            return null;
        },
        /*
        * Creates hack screen for left dynamic pan wrapper.
        * @method _createHackScreenForLeftDynamicPan
        * @private
        */
        _createHackScreenForLeftDynamicPan: function _createHackScreenForLeftDynamicPan(leftPanParentContainer) {
            if (this.isMarqueeDrop) {
                return;
            }
            var accDivId = leftPanParentContainer.find('.dynamic-wrapper').attr('id');
            accDivId = accDivId.slice(this.idPrefix.length);
            //this.tabIndex += 20;
            var leftDynamicPanHackScreenProp = {
                elementId: accDivId,
                tabIndex: this.tabIndex + 12,
                acc: this.getAccMessage('left-dynamic-pan', 0)
            };

            this.createAccDiv(leftDynamicPanHackScreenProp);
        },

        enableDisableFocusOnPansAndTempBins: function enableDisableFocusOnPansAndTempBins(state) {
            var leftTileContainer = this.$('.left-tile-container'),
                rightTileContainer = this.$('.right-tile-container'),
                leftContainerAccDivId = leftTileContainer.find('.dynamic-wrapper').attr('id').slice(this.idPrefix.length),
                rightContainerAccDivId = rightTileContainer.find('.dynamic-wrapper').attr('id').slice(this.idPrefix.length),
                leftTempBinId = '-left-temporary-bin',
                rightTempBinId = '-right-temporary-bin';

            this.enableTab(leftContainerAccDivId, state);
            this.enableTab(rightContainerAccDivId, state);
            this.enableTab(leftTempBinId, state);
            this.enableTab(rightTempBinId, state);
        },

        /*
        * Creates hack screen for right dynamic pan wrapper.
        * @method _createHackScreenForRightDynamicPan
        * @private
        */
        _createHackScreenForRightDynamicPan: function _createHackScreenForRightDynamicPan(rightPanParentContainer) {
            if (this.isMarqueeDrop) {
                return;
            }
            var accDivId = rightPanParentContainer.find('.dynamic-wrapper').attr('id');
            accDivId = accDivId.slice(this.idPrefix.length);
            //this.tabIndex += 50;
            var rightDynamicPanHackScreenProp = {
                elementId: accDivId,
                tabIndex: this.tabIndex + 128,
                acc: this.getAccMessage('right-dynamic-pan', 0)
            };

            this.createAccDiv(rightDynamicPanHackScreenProp);
        },

        _createHackScreenForAccessibilityPans: function _createHackScreenForAccessibilityPans(panParentContainer) {
            var accDivId = panParentContainer.find('.accessibility-dynamic-wrapper').show().attr('id');
            accDivId = accDivId.slice(this.idPrefix.length);
            //this.tabIndex += 50;
            var accessibilityPanHackScreenProp = {
                elementId: accDivId,
                tabIndex: -1,
                acc: 'Acc temp bin'
            };

            this.createAccDiv(accessibilityPanHackScreenProp);
            this.enableTab(accDivId, false);
            panParentContainer.find('.accessibility-dynamic-wrapper').hide();
        },

        _createHackScreenForAccessibilityTemporaryPans: function _createHackScreenForAccessibilityTemporaryPans(pan) {
            var temporaryBinContainerId = '-' + pan + '-accessibility-temporary-bin',
                messageId = (pan === 'left') ? 0 : 1;

            var temporaryBinHackScreenProp = {
                elementId: temporaryBinContainerId,
                tabIndex: -1,
                acc: 'Temp Acc trash can'
            };

            this.createAccDiv(temporaryBinHackScreenProp);

            this.enableTab(temporaryBinContainerId, false);
        },

        /*
        * Creates hack screen for dynamic pans.
        * @method createHackScreenForDynamicPans
        * @public
        */
        createHackScreenForDynamicPans: function _createHackScreenForDynamicPans() {
            var self = this,
                $leftPanParentContainer = this.$('.left-tile-container'),
                $rightPanParentContainer = this.$('.right-tile-container');

            self._createHackScreenForLeftDynamicPan($leftPanParentContainer);
            self._createHackScreenForRightDynamicPan($rightPanParentContainer);

            self._createHackScreenForAccessibilityPans($leftPanParentContainer);
            self._createHackScreenForAccessibilityPans($rightPanParentContainer);

            self._attachHandlersForAccessibilityHelperPans();

        },

        _$currentBin: null,

        _$tileToNullify: null,

        _$tilesToNullify: [],

        //        _addNewTileAndMakeItDraggable: function _addNewTileAndMakeItDraggable(event, ui) {
        //        },

        _nullifyTileAfterDrop: function _nullifyTileAfterDrop($pan, $lastAddedTile, isFromDispenser) {
            var self = this,
                panPosition = $pan.data().pos,
                MAX_ROWS = viewClassName.MAX_ROWS,
                type = $lastAddedTile.data().type,
                lastAddedTileIsVarNegative = $lastAddedTile.data().isVarNegative,
                tileAddedInRow = Number($lastAddedTile.attr('rowNo')),
                nextRowNo = (tileAddedInRow + 1),
                $tableStructure = $pan.find('.' + type + '-table'),
                $tileToNullify = null,
                $allTiles = null,
                $currentBin = null,
                index = null;

            switch (type) {
                case 'Var':
                    $allTiles = $tableStructure.find('.' + viewClassName.TILE_CLASS);
                    $allTiles.each(function (index, value) {
                        var $this = $(this);
                        var isVarNegative = $this.data().isVarNegative;
                        if (lastAddedTileIsVarNegative !== isVarNegative && $this.data().isFading !== true) {
                            $tileToNullify = $this;
                            self.tilesToNullify++;
                            return false;
                        }
                    });
                    break;

                case 'Num':
                    var ifBreakOuterLoop = false;
                    for (index = tileAddedInRow; index < MAX_ROWS; index++) {
                        var $rowTiles = $tableStructure.find('.row-' + index).children();
                        if (ifBreakOuterLoop) {
                            break;
                        }
                        $($rowTiles.get().reverse()).each(function () {
                            var $this = $(this);
                            var isVarNegative = $this.data().isVarNegative;
                            if (lastAddedTileIsVarNegative !== isVarNegative && $this.data().isFading !== true) {
                                $tileToNullify = $this;
                                ifBreakOuterLoop = true;
                                self.tilesToNullify++;
                                return false;
                            }
                        });
                    }
                    break;
                default: return false;
                    break;
            }

            if (panPosition === 'left') {
                $currentBin = this.$('.left-temporary-bin');
            }
            else {
                $currentBin = this.$('.right-temporary-bin');
            }
            self._$currentBin = $currentBin;
            if ($tileToNullify) {
                self._$tilesToNullify.push($tileToNullify.clone(true))
            }
            //self._$tileToNullify = ($tileToNullify) ? $tileToNullify.clone(true) : null;


            if ($tileToNullify && $tileToNullify.length > 0) {
                $lastAddedTile.draggable('option', 'revert', true);
                if (!self.isTemporaryBinFull(self._$currentBin, self._$tilesToNullify[self._$tilesToNullify.length - 1])) {
                    self._fadeAndRemoveTiles($tileToNullify, $lastAddedTile, function () {
                        self.tilesToNullify--;

                        if (self.tilesToNullify === 0) {
                            self._arrangeTilesInPan($pan, 3);
                        }

                        //if (panPosition === 'right') {
                        //    self.trigger(viewClassName.RIGHT_PAN_DROP, $tileToNullify.data());
                        //} else {
                        //    self.trigger(viewClassName.LEFT_PAN_DROP, $tileToNullify.data());
                        //}
                        //self.trigger(viewClassName.PAN_DROP, $tileToNullify.data());

                        /*if (self._$tileToNullify) {
                            if (self.$('#' + self.idPrefix + '-left-temporary-bin').css('display') === 'block') {
                                self._addTileInContainer(self._$tileToNullify, self._$currentBin, false, true);
                            }
                            self._$tileToNullify = null;
                        }*/
                        var length = self._$tilesToNullify.length;
                        for (var i = 0; i < length; i++) {
                            if (self.$('#' + self.idPrefix + '-left-temporary-bin').css('display') === 'block') {
                                self._addTileInContainer(self._$tilesToNullify[i], self._$currentBin, false, true);
                            }
                            self._$tilesToNullify.splice(i, 1);
                            length = self._$tilesToNullify.length;
                        }
                    });
                    return viewClassName.TILE_NULLIFIED;
                }
                else {
                    self._$tilesToNullify.splice(0, 1);
                    $lastAddedTile.remove();
                    return viewClassName.PAN_FULL;
                }
            }
            return viewClassName.TILE_NOT_NULLIFIED;
        },


        /*
        * Handles the fade animation of tiles
        * @method _fadeAndRemoveTiles
        * @param object $tile1
        * @param object $tile2
        * @private
        */
        _fadeAndRemoveTiles: function _fadeAndRemoveTiles($tile1, $tile2, callback) {
            var fadeOutTimer = null, opacity = 1, opacityDecr = 0.1;
            $tile1.data().isFading = true;
            $tile2.data().isFading = true;

            $tile1.draggable();
            $tile1.draggable('option', 'disable', true);
            $tile2.draggable();
            $tile2.draggable('option', 'disable', true);
            this.isFading = true;
            fadeOutTimer = setInterval($.proxy(function () {

                $tile1.css({
                    opacity: opacity,
                });
                $tile2.css({
                    opacity: opacity,
                })
                if (opacity <= 0) {
                    clearInterval(fadeOutTimer);
                    this.isFading = false;

                    $tile1.remove();
                    $tile2.remove();

                    this._updateEquationForDynamicPanBalance();
                    this.animateDynamicPan();

                    if (callback) {
                        callback();
                    }
                    this.trigger(viewClassName.TILE_FADEOUT);
                }
                opacity -= opacityDecr;
            }, this), viewClassName.FADE_TILES_DURATION)
            return;
        },

        /*
        * Renders the temporary trash cans
        * @method _renderTemporaryTrashCan
        * @private
        */
        _renderTemporaryTrashCan: function _renderTemporaryTrashCan() {
            var maxRows = viewClassName.MAX_ROWS - 1,
                $rowStrucureForTempBins = null,
                $trashCans = this.$('.temporary-bin'),
                rowColCount = { rowCount: maxRows, colCount: 0 },
                leftTrashCanId = '-left-temporary-bin',
                rightTrashCanId = '-right-temporary-bin',
                self = this;

            $trashCans.css({ 'background-image': 'url("' + this.filePath.getImagePath('temporary-bin') + '")' });
            $rowStrucureForTempBins = this._createTilesContainer(rowColCount);
            $trashCans.append($rowStrucureForTempBins);
            this._makeTemporaryTrashCansDroppable();

            this._createHackScreenForTemporaryTrashCans('left');
            this._createHackScreenForTemporaryTrashCans('right');

            this._createHackScreenForAccessibilityTemporaryPans('left');
            this._createHackScreenForAccessibilityTemporaryPans('right');

            self.$('#' + self.idPrefix + leftTrashCanId + '-acc-elem').off('keydown.pan-balance')
                .on('keydown.pan-balance', $.proxy(self._setPanAccTextOnTab, self));
            self.$('#' + self.idPrefix + rightTrashCanId + '-acc-elem').off('keydown.pan-balance')
                .on('keydown.pan-balance', $.proxy(self._setPanAccTextOnTab, self));

            self.focusOut(leftTrashCanId, function () { self._setTempBinAccText(); });
            self.focusOut(rightTrashCanId, function () { self._setTempBinAccText(); });
            return;
        },

        /*
        * Makes the temporary trash cans droppable
        * @method _makeTemporaryTrashCansDroppable
        * @private
        */
        _makeTemporaryTrashCansDroppable: function _makeTemporaryTrashCansDroppable() {
            var self = this,
                temporaryDroppedClass = 'temporary-dropped',
                $trashCans = this.$('.temporary-bin'),
                newTile = null,
                $draggable = null,
                $this = null,
                attrPanContainer = null,
                fireEvents = false,
                $draggableData = null,
                droppableObjectForTemporaryBins = {
                    drop: function temporaryBinDropHandler(event, ui) {
                        self._onTemporaryBinDrop(event, ui, $(this));
                    }
                };

            $trashCans.droppable(droppableObjectForTemporaryBins);
            return;
        },

        _onTemporaryBinDrop: function (event, ui, $droppableContainer, suppressEvent) {
            if (ui.draggable.hasClass('marquee-div')) {
                this._marqueeDrop(event, ui, $droppableContainer);
                return;
            }

            var self = this,
                temporaryDroppedClass = 'temporary-dropped',
                $trashCans = this.$('.temporary-bin'),
                newTile = null,
                $draggable = null,
                $this = null,
                attrPanContainer = null,
                fireEvents = false,
                $draggableData = null,
                tileSign, tileText,
                $pan;

            $draggable = ui.draggable;
            $draggableData = $draggable.data(),
            $this = $droppableContainer;
            attrPanContainer = $draggable.attr('pancontainer');
            $pan = self.$('.' + attrPanContainer + '-pan-wrapper').find('.dynamic-container');
            if ($draggable.hasClass(temporaryDroppedClass)) {
                $draggable.draggable('option', 'revert', true);
            }
            else {
                if ($this.data().pos !== attrPanContainer) {
                    $draggable.draggable('option', 'revert', true);
                    return;
                }
                newTile = self._temporaryBinDropHandler($this, $draggable);


                if (newTile) {
                    if ($draggable.hasClass('pan-dropped')) {
                        $draggable.remove();
                    }

                    $pan.find('.dynamic-wrapper #' + $draggable[0].id).remove();

                    //Arrange all tiles in pans with a timeout of 1 ms to allow tiles to drop in temporary bins and then rearrange the pans
                    setTimeout(function () {
                        self._arrangeTilesInPan($pan.find('.dynamic-wrapper'), Number($draggable.attr('rowNo')));
                    }, 1);

                    self._createHackScreenForTemporaryBinTiles(newTile);

                    self._makeTileDraggableAfterDrop(newTile);
                    self.animateDynamicPan();
                    self._makeContextMenuForDraggable(newTile, newTile.attr('panContainer'), true);
                    self._addHoverEffectToNewTileInTemporaryTrashCan(newTile);
                    $draggable.draggable();
                    $draggable.draggable('option', 'revert', 'invalid');
                    fireEvents = true;
                } else {

                    $draggable.draggable('option', 'revert', true);
                }

                if (fireEvents && !suppressEvent) {
                    tileSign = newTile.data('isVarNegative') ? self.getAccMessage('negative', 0) + ' ' : '';
                    tileText = tileSign + ((newTile.data('type') === 'Var') ? 'x' : 1);
                    self._setTempBinAccText(tileText, null, newTile.attr('panContainer'));
                    self.trigger(viewClassName.TRASH_DROP, $draggableData);
                }

            }
        },

        _createHackScreenForTemporaryTrashCans: function _createHackScreenForTemporaryTrashCans(pan) {
            var temporaryBinContainerId = '-' + pan + '-temporary-bin',
                tabIndex = (pan === 'left') ? this.tabIndex + 242 : this.tabIndex + 367,
                params = (pan === 'left') ? this.getAccMessage('left', 0) : this.getAccMessage('right', 0);

            var temporaryBinHackScreenProp = {
                elementId: temporaryBinContainerId,
                tabIndex: tabIndex,
                acc: this.getAccMessage('temporary-trash-can', 0, [params])
            };

            this.createAccDiv(temporaryBinHackScreenProp);
        },

        /*
        * Handles the drop functionality on temporary trash
        * @method _temporaryBinDropHandler
        * @param Object $panWrapper
        * @param Object $currentTile
        * @private
        */
        _temporaryBinDropHandler: function _temporaryBinDropHandler($panWrapper, $currentTile) {
            var maxAllowedWeightPerRow = 4,
                index = 0,
                self = this,
                rowCounter = viewClassName.MAX_ROWS - 2, //as possible rows are 0,1,2,3; 3 being the lowest
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
                $tileTable = $panWrapper,
                rowData = null,
                newTile = null;


            if ($currentTile.data().type === 'Var') {
                dataValue = 2; //for variable tiles
            }

            for (; rowCounter >= 0; rowCounter--) {
                $currentrow = $tileTable.find('.row-' + rowCounter);
                rowData = self._isRowFull($currentrow, dataValue, dataType, true);
                isCurrentRowFull = rowData.isRowFull;

                if (!isCurrentRowFull) {
                    newTile = self._createDraggableTiles($currentrow, tileData, idString, '', true);
                    newTile.addClass(viewClassName.TILE_CLASS + ' temporary-hover pan-dropped temporary-dropped dropped-in-bin')
                  .attr({
                      'colNo': rowData.colNo,
                      'rowNo': rowCounter,
                      'panContainer': $panWrapper.data().pos
                  });

                    self._incrementDroppedTileId();

                    return newTile;
                }
            }
            if (rowCounter < 0) {
                $currentTile.draggable('option', 'revert', true);
            }
            return;

        },

        _addHoverEffectToNewTileInTemporaryTrashCan: function _addHoverEffectToNewTileInTemporaryTrashCan(newTile) {
            if (newTile) {
                var temporaryDroppedClass = 'temporary-hover';
                var checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck;
                if (checkBrowser.isIOS || checkBrowser.isAndroid) {
                    newTile.on('touchend', function () { $(this).addClass(temporaryDroppedClass) });
                    newTile.on('touchstart', function (event) {
                        var $target = $(event.target);
                        if ($target.hasClass('pan-balance-draggable-tile-right-shadow') || $target.hasClass('pan-balance-draggable-tile-bottom-shadow')) {
                            return;
                        }
                        $(this).removeClass(temporaryDroppedClass)
                    });
                }
                else {
                    newTile.on('mouseover', function (event) {
                        var $target = $(event.target);
                        if ($target.hasClass('pan-balance-draggable-tile-right-shadow') || $target.hasClass('pan-balance-draggable-tile-bottom-shadow')) {
                            return;
                        }
                        $(this).removeClass(temporaryDroppedClass)
                    });
                    newTile.on('mouseout', function () {
                        $(this).addClass(temporaryDroppedClass)
                    });
                }
            }
            return;
        },

        /*
        * Arranges tiles in the temporary trash cans
        * @method _arrangeTilesInPan
        * @param Object $panWrapper
        * @param Number rowNoToStartArrangementFrom
        * @param Boolean isDisabled
        */
        _arrangeTilesInTemporaryTrashCans: function _arrangeTilesInTemporaryTrashCans($panWrapper, rowNoToStartArrangementFrom, isDisabled, $tileTable) {
            var self = this;
            var bIsdisabled = isDisabled ? isDisabled : this._getIsDisabled();
            var rowNo = rowNoToStartArrangementFrom,
            $pan = $panWrapper,
            tileData = null,
            $thisTile = null,
            newTile = null,
            index = null;

            for (index = --rowNo; index > -1; index--) {
                var $rowTiles = $tileTable ? $tileTable.find('.row-' + index).children() : $pan.find('.row-' + index).children();
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
                    newTile = self._temporaryBinDropHandler($pan, $thisTile.data(tileData));

                    self._createHackScreenForTemporaryBinTiles(newTile);

                    self._makeTileDraggableAfterDrop(newTile);
                    self._makeContextMenuForDraggable(newTile, newTile.attr('panContainer'),true);
                    self._addHoverEffectToNewTileInTemporaryTrashCan(newTile);
                });
            }
        },

        /*
        * Handles the position of tiles in the droppable container
        * @method _handleTilesPositionInContainer
        * @param object $panWrapper
        * @param object $currentTile
        * @param boolean isDefaultTile
        * @return object newTile
        */
        _handleTilesPositionInContainer: function _handleTilesPositionInContainer($panWrapper, $currentTile, isDefaultTile) {
            var _isDefaultTile = isDefaultTile ? isDefaultTile : false,
                maxAllowedWeightPerRow = 4,
                index = 0,
                self = this,
                rowCounter = viewClassName.MAX_ROWS - 1, //as possible rows are 0,1,3; 3 being the lowest
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
                $tileTable = $panWrapper.find('.' + dataType + '-table'),
                rowData = null,
                newTile = null;


            if ($currentTile.data().type === 'Var') {
                dataValue = 1; //for variable tiles
                maxAllowedWeightPerRow = 1;
            }

            for (; rowCounter >= 0; rowCounter--) {
                $currentrow = $tileTable.find('.row-' + rowCounter);
                rowData = self._isRowFull($currentrow, dataValue, dataType);
                isCurrentRowFull = rowData.isRowFull;

                if (!isCurrentRowFull) {
                    newTile = self._createDraggableTiles($currentrow, tileData, idString, '', _isDefaultTile);
                    newTile.addClass(viewClassName.TILE_CLASS + ' pan-dropped')
                    .attr({
                        'colNo': rowData.colNo,
                        'rowNo': rowCounter,
                        'panContainer': $panWrapper.data().pos
                    });


                    //self._createHackScreenForPanTiles({
                    //    newTile: newTile,
                    //    panPosition: $panWrapper.find('.dynamic-wrapper').attr('data-pos')
                    //});

                    self._incrementDroppedTileId();
                    if (bIsDisabled === false) {
                        //                        newTile.on('dblclick', function () {
                        //                            self._doubleClickOnTileHandler($(this));
                        //                        });
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
                };

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
                    self._makeContextMenuForDraggable(newTile, '_doubleClickOnTileHandler');

                }

            }
            this.trigger(viewClassName.DOUBLE_CLICK_TILE, oldTileData);
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
                temporaryDroppedClass = 'temporary-dropped',
                hasReverted = false,
                draggableObjectAfterDrop = null,
                droppableObjectForNullification = null;
            //this.panTabIndexes = $.extend(true, {}, this.model.getPanTilesTabIndexes());

            draggableObjectAfterDrop = {
                revert: function () {
                    self.$('.ui-draggable-dragging').remove();
                    self._deleteOnRevertHandler($(this));
                    self._attachHandlerForClickAndClick();
                },
                zIndex: 9999,
                helper: "clone",
                start: function (event, ui) {
                    self._removeMarqueeOnTileDrag();
                    self.trigger(viewClassName.TILE_DRAG);
                    $(this).css({ 'visibility': 'hidden' });
                    self._detachHandlerForClickAndClick();
                },
                stop: function (event, ui) {
                    //   self.marqueeView.enableMarquee();
                    var $this = $(this);
                    $this.css({ 'visibility': 'visible' });
                    $this.draggable();
                    $this.draggable('option', 'revert', function () { self._deleteOnRevertHandler($(this)) });
                    self._attachHandlerForClickAndClick();
                },
                cancel: ".var-tile-right-shadow,.num-tile-right-shadow,.var-tile-bottom-shadow,.num-tile-bottom-shadow",
                containment: self._getContainmentSelector(), appendTo: self._getContainmentSelector()
            };

            if (!$tile.hasClass(temporaryDroppedClass)) {
                droppableObjectForNullification = {
                    greedy: true,
                    drop: function (event, ui) {
                        if (ui.draggable.hasClass('marquee-div')) {
                            var $tileOverlapped = $(this),
                                tilePan = $tileOverlapped.attr('pancontainer'),
                                $tileParents = $tileOverlapped.parents(),
                                $droppable = null;

                            $tileParents.each(function () {
                                if ($(this).attr('data-pos') === tilePan) {
                                    $droppable = $(this);
                                    self._marqueeDrop(null, ui, $droppable);
                                }
                            });
                            return;
                        }
                        var $draggable = ui.draggable,
                            draggableData = $draggable.data(),
                            draggedFromPan = $draggable.attr('panContainer'),
                            $droppable = $(this),
                            droppableData = $droppable.data(),
                            droppedInPan = $droppable.attr('panContainer'),
                            $pan = self.$('.' + droppedInPan + '-pan-wrapper').find('.dynamic-container'),
                            draggedFromRow = Number($draggable.attr('rowno')),
                            droppedInRow = Number($droppable.attr('rowno')),
                            nullifyStatus,
                            $helper = ui.helper,
                            newTile = null;

                        if ($draggable.hasClass('temporary-dropped')) {//from temporary trash
                            if (draggedFromPan === droppedInPan) {//from same temp trash
                                if (draggableData.type === droppableData.type && droppableData.isVarNegative !== draggableData.isVarNegative) {

                                    var $actualDraggable = ui.draggable.hasClass('pan-dropped') ? ui.draggable : ui.helper;
                                    self._$tileToNullify = $droppable.clone(true);
                                    self._$currentBin = (droppedInPan === 'right') ? self.$('.right-temporary-bin') : self.$('.left-temporary-bin');


                                    if (!self.isTemporaryBinFull(self._$currentBin, self._$tileToNullify)) {
                                        self._fadeAndRemoveTiles($droppable, $actualDraggable, function () {

                                            self._arrangeTilesInPan($pan.find('.dynamic-wrapper'), droppedInRow);
                                            self._arrangeTilesInTemporaryTrashCans(self.$('.' + draggedFromPan + '-temporary-bin'), draggedFromRow);
                                            self._updateEquationForDynamicPanBalance();
                                            self.animateDynamicPan();

                                            // adds tile in temporary bin on nullify
                                            if (self.$('#' + self.idPrefix + '-left-temporary-bin').css('display') === 'block') {
                                                self._addTileInContainer(self._$tileToNullify, self._$currentBin, false, true);
                                                self._$tileToNullify = null;
                                            }

                                            if (droppedInPan === 'right') {
                                                self.trigger(viewClassName.RIGHT_PAN_DROP, $actualDraggable.data());
                                            } else {
                                                self.trigger(viewClassName.LEFT_PAN_DROP, $actualDraggable.data());
                                            }
                                            self.trigger(viewClassName.PAN_DROP, $actualDraggable.data());

                                        });
                                        ui.draggable.draggable('option', 'revert', '');
                                    }
                                    else {
                                        ui.draggable.draggable('option', 'revert', true);
                                    }
                                }
                                else {
                                    newTile = self._handleTilesPositionInContainer($pan, $draggable);

                                    if (newTile) {
                                        newTile.attr('panContainer', droppedInPan);

                                        self._createHackScreenForPanTiles({
                                            newTile: newTile,
                                            panPosition: newTile.attr('panContainer')
                                        });
                                        $draggable.remove();
                                        self._arrangeTilesInTemporaryTrashCans(self.$('.' + draggedFromPan + '-temporary-bin'), draggedFromRow);
                                        newTile = self._makeTileDraggableAfterDrop(newTile);
                                        self._makeContextMenuForDraggable(newTile, '_makeTileDraggableAfterDrop');
                                        self._updateEquationForDynamicPanBalance();
                                        self._nullifyTileAfterDrop($pan, newTile);
                                        $draggable.draggable();// this line has been added because cannot call methods on draggable prior to initialization, to fix issue #13091
                                        $draggable.draggable('option', 'revert', 'invalid');
                                        self.animateDynamicPan();

                                        if (droppedInPan === 'right') {
                                            self.trigger(viewClassName.RIGHT_PAN_DROP, $draggable.data());
                                        } else {
                                            self.trigger(viewClassName.LEFT_PAN_DROP, $draggable.data());
                                        }
                                        self.trigger(viewClassName.PAN_DROP, $draggable.data());
                                    }
                                    else {
                                        $draggable.draggable('option', 'revert', true);
                                    }
                                }
                            }
                            else {//from different temp trash
                                $draggable.draggable('option', 'revert', true);
                                return;
                            }
                        }
                        else {//from pan or dispenser
                            if ($draggable.hasClass('pan-dropped')) {//from pan
                                if (draggedFromPan !== droppedInPan) {//different pan
                                    if (draggableData.type === droppableData.type && droppableData.isVarNegative !== draggableData.isVarNegative) {

                                        var $actualDraggable = ui.draggable.hasClass('pan-dropped') ? ui.draggable : ui.helper;
                                        self._$tileToNullify = $droppable.clone(true);
                                        self._$currentBin = (droppedInPan === 'right') ? self.$('.right-temporary-bin') : self.$('.left-temporary-bin');

                                        ui.draggable.draggable('option', 'revert', false);
                                        if (!self.isTemporaryBinFull(self._$currentBin, self._$tileToNullify)) {
                                            self._fadeAndRemoveTiles($droppable, $actualDraggable, function () {
                                                self._arrangeTilesInPan($pan.find('.dynamic-wrapper'), droppedInRow);
                                                self._arrangeTilesInPan(self.$('.' + draggedFromPan + '-pan-wrapper').find('.dynamic-wrapper'), draggedFromRow);
                                                self._updateEquationForDynamicPanBalance();
                                                self.animateDynamicPan();

                                                // adds tile in temporary bin on nullify
                                                if (self.$('#' + self.idPrefix + '-left-temporary-bin').css('display') === 'block') {
                                                    self._addTileInContainer(self._$tileToNullify, self._$currentBin, false, true);
                                                    self._$tileToNullify = null;
                                                }

                                                if (droppedInPan === 'right') {
                                                    self.trigger(viewClassName.RIGHT_PAN_DROP, $actualDraggable.data());
                                                } else {
                                                    self.trigger(viewClassName.LEFT_PAN_DROP, $actualDraggable.data());
                                                }
                                                self.trigger(viewClassName.PAN_DROP, $actualDraggable.data());
                                            });
                                            ui.draggable.draggable('option', 'revert', false);
                                        }
                                        else {
                                            ui.draggable.draggable('option', 'revert', true);
                                        }
                                    }
                                    else {

                                        newTile = self._handleTilesPositionInContainer($pan, $draggable);

                                        if (newTile) {
                                            newTile.attr('panContainer', droppedInPan);
                                            self._createHackScreenForPanTiles({
                                                newTile: newTile,
                                                panPosition: newTile.attr('panContainer')
                                            });
                                            $draggable.remove();
                                            self._arrangeTilesInPan(self.$('.' + draggedFromPan + '-pan-wrapper').find('.dynamic-wrapper'), draggedFromRow);
                                            newTile = self._makeTileDraggableAfterDrop(newTile);
                                            self._makeContextMenuForDraggable(newTile, '_makeTileDraggableAfterDrop');
                                            self._updateEquationForDynamicPanBalance();
                                            nullifyStatus = self._nullifyTileAfterDrop($pan, newTile);
                                            $draggable.draggable();
                                            $draggable.draggable('option', 'revert', 'invalid');
                                            self.animateDynamicPan();

                                            if (droppedInPan === 'right') {
                                                self.trigger(viewClassName.RIGHT_PAN_DROP, $draggable.data());
                                            } else {
                                                self.trigger(viewClassName.LEFT_PAN_DROP, $draggable.data());
                                            }
                                            self.trigger(viewClassName.PAN_DROP, $draggable.data());
                                        }
                                        else {
                                            $draggable.draggable('option', 'revert', true);
                                            return;
                                        }

                                    }
                                }
                                else {
                                    $draggable.draggable('option', 'revert', true);
                                    return;
                                }
                            } else {//from dispenser
                                if (draggableData.type === droppableData.type && droppableData.isVarNegative !== draggableData.isVarNegative) {

                                    var $actualDraggable = ui.draggable.hasClass('pan-dropped') ? ui.draggable : ui.helper;

                                    ui.draggable.draggable('option', 'revert', false);

                                    // set to drop nullified tile into temporary bin
                                    self._$tileToNullify = $droppable.clone(true);
                                    self._$currentBin = (droppedInPan === 'right') ? self.$('.right-temporary-bin') : self.$('.left-temporary-bin');

                                    if (!self.isTemporaryBinFull(self._$currentBin, self._$tileToNullify)) {
                                        self._fadeAndRemoveTiles($droppable, $actualDraggable, function () {
                                            self._arrangeTilesInPan($pan.find('.dynamic-wrapper'), draggedFromRow > droppedInRow ? draggedFromRow : droppedInRow);
                                            self._updateEquationForDynamicPanBalance();
                                            self.animateDynamicPan();

                                            // adds tile in temporary bin on nullify
                                            if (self.$('#' + self.idPrefix + '-left-temporary-bin').css('display') === 'block') {
                                                self._addTileInContainer(self._$tileToNullify, self._$currentBin, false, true);
                                                self._$tileToNullify = null;
                                            }

                                            if (droppedInPan === 'right') {
                                                self.trigger(viewClassName.RIGHT_PAN_DROP, $actualDraggable.data());
                                            } else {
                                                self.trigger(viewClassName.LEFT_PAN_DROP, $actualDraggable.data());
                                            }
                                            self.trigger(viewClassName.PAN_DROP, $actualDraggable.data());
                                        });
                                    }
                                    else {
                                        ui.draggable.draggable('option', 'revert', true);
                                    }
                                }
                                else {

                                    newTile = self._handleTilesPositionInContainer($pan, $draggable);

                                    if (newTile) {
                                        newTile.attr('panContainer', droppedInPan);

                                        self._createHackScreenForPanTiles({
                                            newTile: newTile,
                                            panPosition: newTile.attr('panContainer')
                                        });

                                        newTile = self._makeTileDraggableAfterDrop(newTile);
                                        self._makeContextMenuForDraggable(newTile, '_makeTileDraggableAfterDrop');
                                        self._updateEquationForDynamicPanBalance();
                                        nullifyStatus = self._nullifyTileAfterDrop($pan, newTile);
                                        /*if (nullifyStatus === viewClassName.TILE_NOT_NULLIFIED || nullifyStatus === viewClassName.TILE_NULLIFIED) {
                                            $helper.remove();
                                            if ($helper.hasClass('pan-dropped')) {
                                                $draggable.remove();
                                            }
                                        }
                                        else*/ if (nullifyStatus === viewClassName.PAN_FULL) {
                                            newTile.remove();
                                            $draggable.draggable('option', 'revert', true);
                                            if ($helper.hasClass('pan-dropped')) {
                                                $draggable.remove();
                                            }
                                        }
                                        //$draggable.draggable('option', 'revert', 'invalid');
                                        self.animateDynamicPan();

                                        if (droppedInPan === 'right') {
                                            self.trigger(viewClassName.RIGHT_PAN_DROP, $draggable.data());
                                        } else {
                                            self.trigger(viewClassName.LEFT_PAN_DROP, $draggable.data());
                                        }
                                        self.trigger(viewClassName.PAN_DROP, $draggable.data());
                                    }
                                    else {
                                        $draggable.draggable('option', 'revert', true);
                                    }

                                }
                            }
                        }
                    }
                };

                $tile.droppable(droppableObjectForNullification);
            }

            $tile.draggable(draggableObjectAfterDrop);
            $tile.off('click').on('click', $.proxy(self._tileClickHandler, self, $tile))
            $tile.off('touchmove.forStopPropogation').on('touchmove.forStopPropogation', function (event) {
                event.stopPropagation();
            });
            //$.fn.EnableTouch('.' + viewClassName.TILE_CLASS);
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.' + viewClassName.TILE_CLASS), {
                specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE |
                        MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.STOP_PROPAGATION
            });
            if (bIsDraggable) {
                $tile.draggable("disable");
            }
            return $tile;
        },

        isTemporaryBinFull: function isTemporaryBinFull($currentBin, $tileToAdd) {
            var rowCounter = viewClassName.MAX_ROWS - 2,
                self = this,
                dataValue = $tileToAdd.data().value,
                dataType = $tileToAdd.data().type,
                isCurrentRowFull,
                $currentrow,
                rowData;
            for (; rowCounter >= 0; rowCounter--) {
                $currentrow = $currentBin.find('.row-' + rowCounter);
                if (dataType === 'Var') {
                    dataValue = 2;
                }
                else {
                    dataValue = 1;
                }
                rowData = self._isRowFull($currentrow, dataValue, dataType, true);
                isCurrentRowFull = rowData.isRowFull;

                if (!isCurrentRowFull) {
                    return isCurrentRowFull;
                }
            }

            return true;
        },

        _tileClickHandler: function _tileClickHandler($tile, event) {
            var self = this,
                tileContainer = self._getTileContainer($tile),
                tileOnWhichPan = tileContainer.attr('data-pos'),
                tileSign, tileText, panSide,
                equationText,
                idOfAccElementOfTile, tabIndexOfTile;

            this._removeMarqueeOnTileDrag();
            this.trigger('tile_click');

            tileSign = $tile.data('isVarNegative') ? self.getAccMessage('negative', 0) + ' ' : '';
            tileText = tileSign + ($tile.data('type') === 'Var' ? 'x' : '1');

            self.currentDroppedTileSelected = $tile;
            if (tileContainer.hasClass('temporary-bin')) {
                if (tileOnWhichPan === 'left') {

                    this.$('#' + this.idPrefix + '-left-accessibility-dynamic-wrapper').show();
                    idOfAccElementOfTile = $($tile).find('.pan-balance-draggable-tile-text-container').attr('id').slice(this.idPrefix.length);
                    tabIndexOfTile = this.getTabIndex(idOfAccElementOfTile);

                    self._setTabIndexToTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', null, tabIndexOfTile);

                    // set '-left-accessibility-dynamic-wrapper' text
                    self._setAccTextForAccDynamicWrapper('left', tileText);
                    this.focusIn('-left-accessibility-dynamic-wrapper', function () {
                        self._setTabIndexToTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', null, tabIndexOfTile);
                        self.player._refreshDOM();
                    });
                    this.focusOut('-left-accessibility-dynamic-wrapper', function () {
                        self._disableTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', null);
                    });

                    this.setFocus('-left-accessibility-dynamic-wrapper');
                }
                else {

                    this.$('#' + this.idPrefix + '-right-accessibility-dynamic-wrapper').show();
                    idOfAccElementOfTile = $($tile).find('.pan-balance-draggable-tile-text-container').attr('id').slice(this.idPrefix.length);
                    tabIndexOfTile = this.getTabIndex(idOfAccElementOfTile);

                    // set '-right-accessibility-dynamic-wrapper' text
                    self._setAccTextForAccDynamicWrapper('right', tileText);

                    self._setTabIndexToTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', null, tabIndexOfTile);

                    this.focusIn('-right-accessibility-dynamic-wrapper', function () {
                        self._setTabIndexToTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', null, tabIndexOfTile);
                        self.player._refreshDOM();
                    });
                    this.focusOut('-right-accessibility-dynamic-wrapper', function () {
                        self._disableTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', null);
                    });

                    this.setFocus('-right-accessibility-dynamic-wrapper');
                }
            }
            else {
                panSide = self.getAccMessage(tileOnWhichPan, 0);
                if (tileOnWhichPan === 'left') {
                    this.$('#' + this.idPrefix + '-right-accessibility-dynamic-wrapper').show();

                    idOfAccElementOfTile = $($tile).find('.pan-balance-draggable-tile-text-container').attr('id').slice(this.idPrefix.length);
                    tabIndexOfTile = this.getTabIndex(idOfAccElementOfTile);

                    if (this.$('#' + this.idPrefix + '-left-temporary-bin').css('display') === 'block') {
                        this.$('#' + this.idPrefix + '-left-accessibility-temporary-bin').show();
                        // Sets text of '-left-accessibility-temporary-bin' to "Use spacebar to place the %@$% tile in the %@$% bin."
                        self.setAccMessage('-left-accessibility-temporary-bin', self.getAccMessage('temporary-trash-can', 2, [tileText, panSide]));
                        // set '-right-accessibility-dynamic-wrapper' text
                        self._setAccTextForAccDynamicWrapper('right', tileText);

                        self._setTabIndexToTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', '-left-accessibility-temporary-bin', tabIndexOfTile);

                        this.focusIn('-right-accessibility-dynamic-wrapper', function () {
                            self._setTabIndexToTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', '-left-accessibility-temporary-bin', tabIndexOfTile);
                            self.player._refreshDOM();
                        });
                        this.focusOut('-right-accessibility-dynamic-wrapper', function () {
                            self._disableTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', '-left-accessibility-temporary-bin');
                        });
                        this.focusIn('-left-accessibility-temporary-bin', function () {
                            self._setTabIndexToTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', '-left-accessibility-temporary-bin', tabIndexOfTile);
                            self.player._refreshDOM();
                        });
                        this.focusOut('-left-accessibility-temporary-bin', function () {
                            self._disableTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', '-left-accessibility-temporary-bin');
                        });
                    }
                    else {
                        self._setTabIndexToTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', null, tabIndexOfTile);
                        // set '-right-accessibility-dynamic-wrapper' text
                        self._setAccTextForAccDynamicWrapper('right', tileText);


                        this.focusIn('-right-accessibility-dynamic-wrapper', function () {
                            self._setTabIndexToTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', null, tabIndexOfTile);
                            self.player._refreshDOM();
                        });
                        this.focusOut('-right-accessibility-dynamic-wrapper', function () {
                            self._disableTempAccessibilityDivs('-right-accessibility-dynamic-wrapper', null);
                        });
                    }
                    this.setFocus('-right-accessibility-dynamic-wrapper');

                }
                else {
                    this.$('#' + this.idPrefix + '-left-accessibility-dynamic-wrapper').show();

                    idOfAccElementOfTile = $($tile).find('.pan-balance-draggable-tile-text-container').attr('id').slice(this.idPrefix.length);
                    tabIndexOfTile = this.getTabIndex(idOfAccElementOfTile);

                    if (this.$('#' + this.idPrefix + '-right-temporary-bin').css('display') === 'block') {
                        this.$('#' + this.idPrefix + '-right-accessibility-temporary-bin').show();
                        // Sets text of '-right-accessibility-temporary-bin' to "Use spacebar to place the %@$% tile in the %@$% bin."
                        self.setAccMessage('-right-accessibility-temporary-bin', self.getAccMessage('temporary-trash-can', 2, [tileText, panSide]));

                        // set '-left-accessibility-dynamic-wrapper' text
                        self._setAccTextForAccDynamicWrapper('left', tileText);

                        self._setTabIndexToTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', '-right-accessibility-temporary-bin', tabIndexOfTile);

                        this.focusIn('-left-accessibility-dynamic-wrapper', function () {
                            self._setTabIndexToTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', '-right-accessibility-temporary-bin', tabIndexOfTile);
                            self.player._refreshDOM();
                        });
                        this.focusOut('-left-accessibility-dynamic-wrapper', function () {
                            self._disableTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', '-right-accessibility-temporary-bin');
                        });
                        this.focusIn('-right-accessibility-temporary-bin', function () {
                            self._setTabIndexToTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', '-right-accessibility-temporary-bin', tabIndexOfTile);
                            self.player._refreshDOM();
                        });
                        this.focusOut('-right-accessibility-temporary-bin', function () {
                            self._disableTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', '-right-accessibility-temporary-bin');
                        });
                    }
                    else {
                        self._setTabIndexToTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', null, tabIndexOfTile);
                        // set '-left-accessibility-dynamic-wrapper' text
                        self._setAccTextForAccDynamicWrapper('left', tileText);

                        this.focusIn('-left-accessibility-dynamic-wrapper', function () {
                            self._setTabIndexToTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', null, tabIndexOfTile);
                            self.player._refreshDOM();
                        });
                        this.focusOut('-left-accessibility-dynamic-wrapper', function () {
                            self._disableTempAccessibilityDivs('-left-accessibility-dynamic-wrapper', null);
                        });
                    }
                    this.setFocus('-left-accessibility-dynamic-wrapper');
                }
            }
        },

        /**
        * Sets accessibility text for left and/or right accessibility-dynamic-wrapper
        *
        * @method _setAccTextForAccDynamicWrapper
        * @param side {String} The side whose text is to be updated - 'left' or 'right'
        * @param tileText {String} Text describing the tile.
        */
        _setAccTextForAccDynamicWrapper: function _setAccTextForAccDynamicWrapper(side, tileText) {
            var self = this,
                equationText;
            switch (side) {
                case 'left':
                    if (self.getPanWeight('left') === 0) {
                        self.setAccMessage('-left-accessibility-dynamic-wrapper', self.getAccMessage('left-dynamic-pan', 1), [tileText]);
                    }
                    else {
                        equationText = self._getAccTextForEquation('left');
                        self.setAccMessage('-left-accessibility-dynamic-wrapper', self.getAccMessage('left-dynamic-pan', 3), [equationText, tileText]);
                    }
                    break;
                case 'right':
                    if (self.getPanWeight('right') === 0) {
                        self.setAccMessage('-right-accessibility-dynamic-wrapper', self.getAccMessage('right-dynamic-pan', 1), [tileText]);
                    }
                    else {
                        equationText = self._getAccTextForEquation('right');
                        self.setAccMessage('-right-accessibility-dynamic-wrapper', self.getAccMessage('right-dynamic-pan', 3), [equationText, tileText]);
                    }
                    break;
            }
        },

        _setTabIndexToTempAccessibilityDivs: function _setTabIndexToTempAccessibilityDivs(panAccDiv, tempBinAccDiv, tabIndex) {
            if (panAccDiv) {
                this.setTabIndex(panAccDiv, tabIndex + 1);
            }
            if (tempBinAccDiv) {
                this.setTabIndex(tempBinAccDiv, tabIndex + 2);
            }
        },

        _disableTempAccessibilityDivs: function _disableTempAccessibilityDivs(panAccDiv, tempBinAccDiv) {
            if (panAccDiv) {
                this.enableTab(panAccDiv, false);
            }
            if (tempBinAccDiv) {
                this.enableTab(tempBinAccDiv, false);
            }
        },

        hideTempAccessibilityDivs: function hideTempAccessibilityDivs() {
            this.$('#' + this.idPrefix + '-left-accessibility-dynamic-wrapper').hide();
            this.$('#' + this.idPrefix + '-right-accessibility-dynamic-wrapper').hide();
            this.$('#' + this.idPrefix + '-left-accessibility-temporary-bin').hide();
            this.$('#' + this.idPrefix + '-right-accessibility-temporary-bin').hide();
        },

        _enableDisablePanDroppedTiles: function _enableDisablePanDroppedTiles(whichPan, state) {

            var self = this,
                panContainer = self.idPrefix + '-' + whichPan + '-dynamic-wrapper';

            self.$('#' + panContainer).find('.pan-balance-draggable-tile-text-container').each(function () {
                var tileId = $(this).attr('id').slice(self.idPrefix.length);

                if (tileId) {
                    self.enableTab(tileId, state);
                }
            });
        },

        _enableDisableTemporaryBinDroppedTiles: function _enableDisableTemporaryBinDroppedTiles(whichBin, state) {
            var self = this,
                temporaryBinContainer = self.idPrefix + '-' + whichBin + '-temporary-bin';

            self.$('#' + temporaryBinContainer).find('.pan-balance-draggable-tile-text-container').each(function () {
                var tileId = $(this).attr('id').slice(self.idPrefix.length);

                if (tileId) {
                    self.enableTab(tileId, state);
                }
            });
        },

        _handleMarqueeShowHide: function _handleMarqueeShowHide($tile) {
            var self = this;
            $tile.on('mousedown', function (event) {
                event.stopPropagation();
                //self.marqueeView.disableMarquee();
                self._removeMarqueeOnTileDrag();
                self.trigger('tile_click');
            });

        },
        /*
        * Deletes the tile if dropped out of the pan
        * @method _deleteOnRevertHandler
        * @param Object $tile
        */
        _deleteOnRevertHandler: function _deleteOnRevertHandler($tile) {
            if ($tile && $('#' + $tile[0].id).length !== 0) {
                var draggededFromPan = $tile.attr('panContainer'),
                    draggedFromRow = Number($tile.attr('rowno')),
                    $pan = this.$('.' + draggededFromPan + '-pan-wrapper').find('.dynamic-container'),
                    dataObject = $tile.data(),
                    dataValue = dataObject.value,
                    dataType = dataObject.type,
                    dataText = dataObject.text,
                    dataIsVarNegative = dataObject.isVarNegative,
                    bIsDisabled = dataObject.isDisabled,
                    tileDataObject = {
                        'value': dataValue ? dataValue : 1,
                        'type': dataType ? dataType : 'Num',
                        'text': dataText ? dataText : '2',
                        'isVarNegative': dataIsVarNegative ? dataIsVarNegative : false,
                        isDisabled: bIsDisabled ? bIsDisabled : false
                    },
                    fireEvent = false;
                //if ($tile.css('display') !== '') {
                //    fireEvent = true;
                //}
                $tile.remove();

                var self = this;

                if (!self.marqueeMoveOut) {
                    fireEvent = true;
                }

                if (fireEvent && !self.marqueeMoveOut) {
                    setTimeout(function () { self._arrangeTilesInPan($pan.find('.dynamic-wrapper'), draggedFromRow); }, 1);

                    if ($tile.hasClass('temporary-dropped')) {
                        setTimeout(function () {
                            self._arrangeTilesInTemporaryTrashCans(self.$('.' + draggededFromPan + '-temporary-bin'), draggedFromRow);
                        }, 1);
                    }

                    this._updateEquationForDynamicPanBalance();
                    this.animateDynamicPan();
                    this.trigger(viewClassName.TRASH_DROP, tileDataObject);
                }
            }
        },

        /*
        * Check if the row is full
        * @method _isRowFull
        * @param Object $row
        * @param Number afterAddingWeight
        * @param String tileType
        */
        _isRowFull: function _isRowFull($row, afterAddingWeight, tileType, ignoreType) {
            var maxAllowedWeightPerRow = ignoreType ? 8 : 4; /*---change for increasing row limit*/
            var sumOfWeight = 0,
                isRowFull = false,
                $tiles = $row.find('.' + viewClassName.TILE_CLASS),
                $this = null,
                $variableTiles = null;
            if (!ignoreType) {
                if (tileType === 'Var') {
                    maxAllowedWeightPerRow = 1;
                }
            }

            $tiles.each(function () {
                $this = $(this);
                var weight = Math.abs($this.data().value);
                if ($this.data().type === 'Var') {
                    if (ignoreType) {
                        weight = 2
                    }
                    else {
                        weight = 1;
                    }
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
        * Increments variable staticTileId
        * @method _incrementStaticTileId
        */
        _incrementStaticTileId: function _incrementStaticTileId() {
            this.staticTileId++;
            return;
        },

        /*
        * Returns variable staticTileId
        * @method _getStaticTileId
        */
        _getStaticTileId: function _getStaticTileId() {
            return this.staticTileId;
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

                    leftTemporaryBinDataArray = defaultData.leftTemporaryBin ? defaultData.leftTemporaryBin : [],
                    leftTemporaryBinDataArrayLength = leftTemporaryBinDataArray.length,
                    rightTemporaryBinDataArray = defaultData.rightTemporaryBin ? defaultData.rightTemporaryBin : [],
                    rightTemporaryBinDataArrayLength = rightTemporaryBinDataArray.length,

                    index = null,
                    $parent,
                    newTile = null,
                    $leftDynamicTileDroppableContainer = this.$('.left-pan-wrapper').find('.dynamic-container'),
                    $rightDynamicTileDroppableContainer = this.$('.right-pan-wrapper').find('.dynamic-container'),

                    $leftTemporaryBin = this.$('.left-temporary-bin'),
                    $rightTemporaryBin = this.$('.right-temporary-bin');

                this.panTabIndexes = $.extend(true, {}, this.model.getPanTilesTabIndexes());

                for (index = 0; index < leftDefaultDataArrayLength; index++) {
                    var $draggableTile = $('<div>');
                    leftDefaultDataArray[index].isDisabled = bIsDisabled;
                    $draggableTile.data(leftDefaultDataArray[index]);

                    newTile = self._handleTilesPositionInContainer($leftDynamicTileDroppableContainer, $draggableTile, _isDefaultTile);

                    newTile.attr('panContainer', 'left');

                    if (!bIsDisabled) {
                        self._createHackScreenForPanTiles({
                            newTile: newTile,
                            panPosition: newTile.attr('panContainer')
                        });
                    }

                    newTile = self._makeTileDraggableAfterDrop(newTile, bIsDisabled);
                    self._makeContextMenuForDraggable(newTile, newTile.attr('panContainer'), true);
                }

                for (index = 0; index < rightDefaultDataArrayLength; index++) {
                    var $draggableTile = $('<div>');
                    rightDefaultDataArray[index].isDisabled = bIsDisabled;
                    $draggableTile.data(rightDefaultDataArray[index]);
                    newTile = self._handleTilesPositionInContainer($rightDynamicTileDroppableContainer, $draggableTile, _isDefaultTile);
                    newTile.attr('panContainer', 'right');

                    if (!bIsDisabled) {
                        self._createHackScreenForPanTiles({
                            newTile: newTile,
                            panPosition: newTile.attr('panContainer')
                        });
                    }

                    newTile = self._makeTileDraggableAfterDrop(newTile, bIsDisabled);
                    self._makeContextMenuForDraggable(newTile, newTile.attr('panContainer'), true);
                }

                self._setPanAccText();

                for (index = 0; index < leftTemporaryBinDataArrayLength; index++) {
                    var $draggableTile = $('<div>');
                    leftTemporaryBinDataArray[index].isDisabled = bIsDisabled;
                    $draggableTile.data(leftTemporaryBinDataArray[index]);
                    newTile = self._temporaryBinDropHandler($leftTemporaryBin, $draggableTile);
                    self._makeTileDraggableAfterDrop(newTile, bIsDisabled);
                    self._makeContextMenuForDraggable(newTile, '_toggleDisableTiles leftTemporaryBinDataArrayLength');
                    if (!bIsDisabled) {
                        self._addHoverEffectToNewTileInTemporaryTrashCan(newTile);
                        self._createHackScreenForTemporaryBinTiles(newTile);
                    }
                    newTile.attr('panContainer', 'left');
                }

                for (index = 0; index < rightTemporaryBinDataArrayLength; index++) {
                    var $draggableTile = $('<div>');
                    rightTemporaryBinDataArray[index].isDisabled = bIsDisabled;
                    $draggableTile.data(rightTemporaryBinDataArray[index]);
                    newTile = self._temporaryBinDropHandler($rightTemporaryBin, $draggableTile);
                    self._makeTileDraggableAfterDrop(newTile, bIsDisabled);
                    self._makeContextMenuForDraggable(newTile, '_toggleDisableTiles rightTemporaryBinDataArrayLength');
                    if (!bIsDisabled) {
                        self._addHoverEffectToNewTileInTemporaryTrashCan(newTile);
                        self._createHackScreenForTemporaryBinTiles(newTile);
                    }
                    newTile.attr('panContainer', 'right');
                }

                if (defaultDataArray.position) {
                    self.animatePanBalance(defaultDataArray.position);
                }
                else {
                    self.animateDynamicPan();
                }
            }
        },

        //_renderTilesInContainerWithGivenData: function _renderTilesInContainerWithDataArray($container, dataArray, rightOrLeft, panOrTemporaryBin) {
        //    if ($container && dataArray && rightOrLeft && panOrTemporaryBin) {
        //        var self = this,
        //            bIsDisabled = isDisabled ? isDisabled : this._getIsDisabled(),
        //            arrayLength = dataArray.length ? dataArray.length : null,
        //            index = null;

        //        for (index = 0; index < arrayLength; index++) {
        //            var $draggableTile = $('<div>');
        //        }
        //    }
        //    return;
        //},


        _renderDefaultTiles: function (defaultDataObject) {
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
                self._onDropInTrashCan(event, ui);
            });
        },

        /**
        * Called using context menu & pressing 'd' key; it calls the _onDropInTrashCan method to delete the tile.
        *
        * @method _throwAwayTile
        * @param $tile {Object} Jquery refernce of the tile to be deleted
        * @private
        */
        _throwAwayTile: function _throwAwayTile($tile) {
            var id,
                ui = {
                    draggable: $tile,
                    helper: $tile
                },
                tileSign = $tile.data('isVarNegative') ? this.getAccMessage('negative', 0) + ' ' : '',
                tileText = tileSign + ($tile.data('type') === 'Var' ? 'x' : '1');
            this._onDropInTrashCan(null, ui);
            if ($tile.hasClass('dropped-in-bin')) {
                this._setTempBinAccText(null, tileText, $tile.attr('pancontainer'));
                if ($tile.attr('pancontainer') === 'left') {
                    id = '-left-temporary-bin';
                }
                else {
                    id = '-right-temporary-bin';
                }
                this.setFocus(id);
            }
            else {
                this._setPanAccText(null, tileText, $tile.attr('pancontainer'));
                if ($tile.attr('pancontainer') === 'left') {
                    id = '-left-dynamic-wrapper';
                }
                else {
                    id = '-right-dynamic-wrapper';
                }
                this.setFocus(id);
            }
        },

        /**
        * Deletes the tiles
        *
        * @method _onDropInTrashCan
        * @param event {Object} Drop event object
        * @param ui {Object} The ui object of draggable tile
        * @private
        */
        _onDropInTrashCan: function _onDropInTrashCan(event, ui) {
            var self = this;
            if (!ui.draggable.hasClass('pan-dropped')) {
                return;
            }

            //patch for removing acual tile
            if (ui.helper.hasClass('pan-dropped')) {
                ui.draggable.remove();
            }

            var dataObject = ui.draggable.data(),
                cloneDataObject = {
                    'value': dataObject.value,
                    'type': dataObject.type,
                    'text': dataObject.text,
                    'isVarNegative': dataObject.isVarNegative
                },
                helper = ui.helper.remove(),
                $draggedFromWrappr = self.$('.' + helper.attr('panContainer') + '-pan-wrapper').find('.dynamic-wrapper'),
                rowNo = Number(helper.attr('rowNo'));

            self.animateDynamicPan();
            self._arrangeTilesInPan($draggedFromWrappr, rowNo);

            if (ui.draggable.hasClass('temporary-dropped')) {
                var $draggedFromBin = self.$('.' + ui.draggable.attr('panContainer') + '-temporary-bin'),
                    draggedFromRow = Number(ui.draggable.attr('rowNo'));

                self._arrangeTilesInTemporaryTrashCans($draggedFromBin, draggedFromRow);
            }

            self.trigger(viewClassName.TRASH_DROP, cloneDataObject);
        },

        /*
        * Returns equation in string format
        * @method _getEquation
        * @param String pan
        * @return String equationString
        */
        _getEquation: function (pan, asCoefficients) {
            if (typeof (pan) === 'undefined') {
                return;
            }
            var _asCoefficients = asCoefficients ? asCoefficients : false,
                VARIABLE_LABEL = viewClassName.VARIABLE_LABEL,
                $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $tiles = $pan.find('.' + viewClassName.TILE_CLASS),
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
                if (!$this.hasClass('ui-draggable-dragging')) {
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
        * @return String containmentSelector
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

        /*
        * Arranges tiles in the pan
        * @method _arrangeTilesInPan
        * @param Object $panWrapper
        * @param Number rowNoToStartArrangementFrom
        * @param Boolean isDisabled
        */
        _arrangeTilesInPan: function _arrangeTilesInPan($panWrapper, rowNoToStartArrangementFrom, isDisabled, $tileTable) {
            var self = this;
            var bIsdisabled = isDisabled ? isDisabled : this._getIsDisabled();
            var rowNo = rowNoToStartArrangementFrom,
                $pan = $panWrapper,
                tileData = null,
                $thisTile = null,
                newTile = null,
                index = null, count, id, len,
                panPosition = $pan.attr('data-pos');

            //self.panTabIndexes = $.extend(true, {}, self.model.getPanTilesTabIndexes());

            for (index = --rowNo; index > -1; index--) {
                var $rowTiles = $tileTable ? $tileTable.find('.row-' + index).children() : $pan.find('.row-' + index).children();
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

                    self._createHackScreenForPanTiles({
                        newTile: newTile,
                        panPosition: newTile.attr('panContainer')
                    });


                    self._makeTileDraggableAfterDrop(newTile);
                    var tempBinPresent = (self.$('#' + self.idPrefix + '-left-temporary-bin').css('display') === 'block');
                    self._makeContextMenuForDraggable(newTile, newTile.attr('panContainer'), tempBinPresent);
                });
            }

            var dispenserTile = self._getCurrentSelectedDispenserTile();
            if (dispenserTile === null) {
                self._reassignTabIndexesToPanTiles(0, panPosition);
            }
        },

        /*
        * Get the tile data of pan
        * @method _getTileDataForPan
        * @param String pan
        * @return Array panDataArray
        */
        _getTileDataForPan: function _getTileDataForPan(pan) {
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $panRows = $pan.find('.pan-row'),
                panDataArray = [],
                dataIsVarNegative = null,
                $this = null,
                $thisRowTiles = null,
                dataObject = null,
                tileData = null,
                saveStateObject = null;


            $($panRows.get().reverse()).each(function () {
                $thisRowTiles = $(this).find('.' + viewClassName.TILE_CLASS);
                $thisRowTiles.each(function () {
                    $this = $(this);
                    if (!$this.hasClass('ui-draggable-dragging')) {
                        dataObject = $this.data();
                        if (dataObject.type === 'Var') {
                            dataObject.text = $(dataObject.text).html() ? $(dataObject.text).html() : dataObject.text;
                        }
                        tileData = {
                            'type': dataObject.type,
                            'text': dataObject.text.toString().replace(viewClassName.NEGATIVE_TILE_INDICATOR, ''),
                            'value': dataObject.value,
                            'isVarNegative': dataObject.isVarNegative,
                            'isDisabled': dataObject.isDisabled
                        };
                        panDataArray.push(tileData);
                    }
                });
            });

            return panDataArray;

        },

        _getTileDataForTemporaryBin: function _getTileDataForTemporaryBin(temporaryBin) {
            var $pan = this.$('.temporary-bins-container').find('.' + temporaryBin + '-temporary-bin'),
                $panRows = $pan.find('.pan-row'),
                panDataArray = [],
                dataIsVarNegative = null,
                $this = null,
                $thisRowTiles = null,
                dataObject = null,
                tileData = null,
                saveStateObject = null;

            $($panRows.get().reverse()).each(function () {
                $thisRowTiles = $(this).find('.' + viewClassName.TILE_CLASS);
                $thisRowTiles.each(function () {
                    $this = $(this);
                    if (!$this.hasClass('ui-draggable-dragging')) {
                        dataObject = $this.data();
                        if (dataObject.type === 'Var') {
                            dataObject.text = $(dataObject.text).html() ? $(dataObject.text).html() : dataObject.text;
                        }
                        tileData = {
                            'type': dataObject.type,
                            'text': dataObject.text.toString().replace(viewClassName.NEGATIVE_TILE_INDICATOR, ''),
                            'value': dataObject.value,
                            'isVarNegative': dataObject.isVarNegative,
                            'isDisabled': dataObject.isDisabled
                        };
                        panDataArray.push(tileData);
                    }
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

        /*
        * Gets the specific tile count
        * @method _getSpecificTypeTileCount
        * @param String pan
        * @param String type
        * @param Boolean ignoreNullification
        * @return Number count
        */
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
        * Gets the specific tile count
        * @method _updateEquationForDynamicPanBalance
        * @param String pan
        */
        _updateEquationForDynamicPanBalance: function _updateEquationForDynamicPanBalance(pan) {
            var $labelContainer = null,
                equation = null;

            if (typeof (pan) === 'undefined') {
                $labelContainer = this.$('.left-pan-wrapper').find('.pan-label');
                equation = this._getEquation('left');
                $labelContainer.html(equation);
                $labelContainer = this.$('.right-pan-wrapper').find('.pan-label');
                equation = this._getEquation('right');
                $labelContainer.html(equation);
            }
            else {
                $labelContainer = this.$('.' + pan + '-pan-wrapper').find('.pan-label');
                equation = this._getEquation(pan);
                $labelContainer.html(equation);
            }

            return;

        },

        /*
        * Sets the property draggableVariableValue
        * @method _setDraggableVariableValue
        * @param String arg 
        */
        _setDraggableVariableValue: function _setDraggableVariableValue(arg) {
            //TODO
            if (arg) {
                this.draggableVariableValue = arg;
            }
            return;
        },

        /*
        * Gets the property draggableVariableValue
        * @method _getDraggableVariableValue
        * @return Number draggableVariableValue 
        */
        _getDraggableVariableValue: function _getDraggableVariableValue() {
            return this.draggableVariableValue;
        },

        _generateMarquee: function _generateMarquee() {
            if (this.player) {
                var marqueeView = MathInteractives.global.Marquee.createMarquee({
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    filePath: this.filePath,
                    player: this.player,
                    marqueeContainer: this.marqueeContainer, // $('#' + this.marqueeContainer[0].id),
                    selectorClass: viewClassName.TILE_CLASS,
                    ignoreClass: 'dispenser-tile'
                });

                marqueeView.on(MathInteractives.global.Marquee.EVENTS.resize, $.proxy(this._marqueeResizeHandler, this))
                marqueeView.on(MathInteractives.global.Marquee.EVENTS.start, $.proxy(this._marqueeStartHandler, this))
                marqueeView.on(MathInteractives.global.Marquee.EVENTS.end, $.proxy(function () {
                    setTimeout($.proxy(this._attachHandlerForClickAndClick, this), 1);
                }, this))

                marqueeView.on(MathInteractives.global.Marquee.EVENTS.move, $.proxy(function () {
                    this._detachHandlerForClickAndClick();
                }, this))

                return marqueeView;
            }

        },

        _marqueeResizeHandler: function _marqueeResizeHandler(customEventObject) {
            this.trigger(viewClassName.MARQUEE_RESIZE, customEventObject);
        },

        _marqueeStartHandler: function _marqueeStartHandler(customEventObject) {
            var originalEvent = customEventObject.originalEvent,
                point = {
                    x: originalEvent.pageX,
                    y: originalEvent.pageY
                }

            this.marqueeDragStartPoint = point;
            this.trigger(viewClassName.MARQUEE_START, customEventObject);
        },

        _getTileContainer: function _getTileContainer($tile) {
            var $temporaryBin = null,
                $pan = null;

            $temporaryBin = $tile.parents('.temporary-bin');
            if ($temporaryBin.length) {
                return $temporaryBin;
            }
            else {
                $pan = $tile.parents('.dynamic-wrapper');
                return $pan
            }

        },

        getCurrentSelectedDispenserTileView: function getCurrentSelectedDispenserTileView() {
            return this._getCurrentSelectedDispenserTile(true);
        },

        setDispenserTileSelected: function setDispenserTileSelected(dispenserTileData) {

            if (dispenserTileData.tileType === null) {
                if (this.currentSelectedDispenserTile) {
                    this.currentSelectedDispenserTile.removeBorder();
                }
                return;
            }

            this.$('.dispenser-wrapper').find('.dispenser-tile').each(function () {
                var tileData = $(this).data().type,
                    isNegative = $(this).data().isVarNegative;

                if (tileData === dispenserTileData.tileType && isNegative === dispenserTileData.isVarNegative) {
                    $(this).trigger('click');
                }
            });
        },

        highlightTiles: function highlightTiles(pan, type, enableButton, saveState) {
            //return;
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $tileContainer = $pan.find('.' + type + '-table'),
                $tiles = $tileContainer.find('.' + viewClassName.TILE_CLASS),
                $this = null,
                enableButton = enableButton,
                length = $tiles.length,
                isTileColorGreen = true;
            if ($tiles[0]) {
                isTileColorGreen = $($tiles[0]).data().isVarNegative ? false : true;
            }

            $tiles.each(function (index) {
                $this = $(this);
                if (index === length - 1) {
                    if (!saveState) {
                        MathInteractives.Common.Components.Views.PanBalanceDraggableTile.showPulse($this, isTileColorGreen, enableButton);
                    }
                    else {
                        MathInteractives.Common.Components.Views.PanBalanceDraggableTile.showHighlightedPulse($this, isTileColorGreen);
                        enableButton();
                    }
                } else {
                    if (!saveState) {
                        MathInteractives.Common.Components.Views.PanBalanceDraggableTile.showPulse($this, isTileColorGreen);
                    }
                    else {
                        MathInteractives.Common.Components.Views.PanBalanceDraggableTile.showHighlightedPulse($this, isTileColorGreen);
                    }
                }
            });
        },

        hideHighlightOfTiles: function hideHighlightOfTiles(pan, type) {
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $tileContainer = $pan.find('.' + type + '-table'),
                $tiles = $tileContainer.find('.' + viewClassName.TILE_CLASS),
                $this = null;

            $tiles.each(function () {
                $this = $(this);
                MathInteractives.Common.Components.Views.PanBalanceDraggableTile.hidePulse($this);
            });
        },

        customFitMarqueeToBounds: function customFitMarqueeToBounds(bounds, selectedElements) {
            if (this.marqueeView) {
                return this.marqueeView.customFitMarqueeToBounds(bounds, selectedElements);
            }
        },

        setDraggableVariableValue: function setDraggableVariableValue(arg) {
            this._setDraggableVariableValue(arg);
            return;
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
            return;
        },

        /**
        * Boolean set to true to skip animation
        * @property _skipAnimation
        * @default false
        * @type Boolean
        * @private
        */
        _skipAnimation: false,

        /*
        * Disable tile dragging
        * @method disableDraggable
        */
        disableDraggable: function () {
            //            return;
            var self = this;
            this.$('.ui-draggable').draggable("disable");
            this._setIsDisabled(true);
            var saveStateObject = this.getSaveState();
            this._skipAnimation = true;
            this._renderDefaultTiles(saveStateObject);
            this._updateEquationForDynamicPanBalance();
            this._skipAnimation = false;
            var length = this.dispenserTiles.length;
            if (this.currentSelectedDispenserTile) {
                this.currentSelectedDispenserTile.removeBorder();
            }
            this.$('.dispenser-wrapper').find('.pan-balance-draggable-tile-text-container').each(function () {
                var id = $(this).attr('id').slice(self.idPrefix.length);
                self.enableTab(id, false);
            });

            var $dispenserContainer = this.$('.dispenser-container');
            var dispenserContainerId = $dispenserContainer.attr('id').slice(this.idPrefix.length);

            this.enableTab(dispenserContainerId, false);
            this.enableDisableFocusOnPansAndTempBins(false);
            for (var counter = 0; counter < length; counter++) {
                this.dispenserTiles[counter].disableTile();
            }
            return;
        },

        /*
        * Enable tile dragging
        * @method disableDraggable
        */
        enableDraggable: function () {
            var self = this;
            this.$('.ui-draggable').draggable("enable");
            this._setIsDisabled(false);
            var saveStateObject = this.getSaveState();
            this._renderDefaultTiles(saveStateObject);
            this._updateEquationForDynamicPanBalance();
            var length = this.dispenserTiles.length;
            this.$('.dispenser-wrapper').find('.pan-balance-draggable-tile-text-container').each(function () {
                var id = $(this).attr('id').slice(self.idPrefix.length);
                self.enableTab(id, true);
            });

            var $dispenserContainer = this.$('.dispenser-container');
            var dispenserContainerId = $dispenserContainer.attr('id').slice(this.idPrefix.length);

            this.enableTab(dispenserContainerId, true);
            this.enableDisableFocusOnPansAndTempBins(true);
            for (var counter = 0; counter < length; counter++) {
                this.dispenserTiles[counter].enableTile();
            }
            return;
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
            return;
        },

        /*
        * Hides the label of pans
        * @method hidePanLabel
        */
        hidePanLabel: function hidePanLabel() {
            this.$('.pan-label').hide();
            return;
        },

        /*
        * Displays the Dispenser
        * @method showDispenser
        */
        showDispenser: function showDispenser() {
            this.$('.dispenser-container').css({ top: '-120px' }).show();
            return;
        },

        /*
        * Hides the Dispenser
        * @method hideDispenser
        */
        hideDispenser: function hideDispenser() {
            this.$('.dispenser-container').hide();
            return;
        },


        animateDispenser: function animateDispenser(callback, duration) {
            this.$('.dispenser-container').show().animate({
                top: '-45px'
            }, {
                duration: typeof (duration) === 'number' ? duration : 500,
                complete: function () {
                    if (typeof (callback) === 'function') {
                        callback();
                    }
                }
            });
        },

        showTemporaryTrashCans: function showTemporaryTrashCans() {
            var $trashCans = this.$('.temporary-bin');
            $trashCans.fadeIn();
            this._updateContextMenus(true);
            return;
        },

        hideTemporaryTrashCans: function hideTemporaryTrashCans() {
            var $trashCans = this.$('.temporary-bin');
            $trashCans.hide();
            this._updateContextMenus(false);
            return;
        },

        /**
        * Updates the context menu options of all tiles present
        *
        * @method _updateContextMenus
        * @param binPresent {Boolean} True if temporary trash cans are to be displayed in the context menu options
        * @private
        */
        _updateContextMenus: function _updateContextMenus(binPresent) {
            var index,
                tiles = this.$('.pan-dropped'),
                tilesCount = tiles.length,
                $tile,
                tileContextMenuView,
                screenPartialId = this.idPrefix + 'pan-balance-context-menu-',
                unignoreOptionsList = [],
                ignoreOptions = [];
            for (index = 0; index < 5; index++) {
                unignoreOptionsList.push(screenPartialId + index);
            }
            for (index = 0; index < tiles.length; index++) {
                $tile = $(tiles[index]);
                if ($tile[0].id.search(this.idPrefix) !== -1) {
                    tileContextMenuView = $tile.data('contextMenu');
                    tileContextMenuView.editContextMenu(unignoreOptionsList, false);
                    ignoreOptions = this._getIgnoreOptionsForTile($tile, $tile.attr('pancontainer'), binPresent);
                    tileContextMenuView.editContextMenu(ignoreOptions, true);
                }
            }
        },

        /**
        * Calculates and returns the element id in context menu's screen of options that are not to be displayed in the
          context menu of the given tile.
        *
        * @method _getIgnoreOptionsForTile
        * @param $tile {Object} Jquery object of the tile whose context menu is to be edited.
        * @param from {String} The container of the tile from where it will be dragged. Possible values - 'dispenser',
         'left', 'right'.
        * @param binPresent {Boolean} True if temporary trash cans are to be included in the context menu options
        * @return {Array} An array of strings holding the option-to-be-ignored's id in context-menu's screen.
        * @private
        */
        _getIgnoreOptionsForTile: function _getIgnoreOptionsForTile($tile, from, binPresent) {
            var screen = this.idPrefix + 'pan-balance-context-menu',
                ignoreOptions = [];
            switch (from) {
                case 'dispenser': ignoreOptions = [screen + '-2', screen + '-3', screen + '-4'];
                    break;
                case 'left': ignoreOptions = [screen + '-0', screen + '-3', screen + '-4'];
                    if (binPresent) {
                        ignoreOptions = [screen + '-0', screen + '-4'];
                        if ($tile.hasClass('temporary-dropped')) {
                            ignoreOptions = [screen + '-1', screen + '-3', screen + '-4'];
                        }
                    }
                    break;
                case 'right': ignoreOptions = [screen + '-1', screen + '-3', screen + '-4'];
                    if (binPresent) {
                        ignoreOptions = [screen + '-1', screen + '-3'];
                        if ($tile.hasClass('temporary-dropped')) {
                            ignoreOptions = [screen + '-0', screen + '-3', screen + '-4'];
                        }
                    }
                    break;
                default: break;
            }
            return ignoreOptions;
        },

        /*
        * Checkes if the given pan is empty or not
        * @method isPanEmpty
        * @param String pan
        */
        isPanEmpty: function isPanEmpty(pan) {
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $tiles = $pan.find('.' + viewClassName.TILE_CLASS),
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
        * @return Number sum
        */
        getPanWeight: function getPanWeight(pan) {
            var $pan = this.$('.' + pan + '-pan-wrapper').find('.dynamic-container'),
                $tiles = $pan.find('.' + viewClassName.TILE_CLASS),
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

        /**
        * Get the count of tiles present in pan
        * @method getTileCountInPan
        * @param side {String} 'left' or 'right'
        * @return {Number} The number of tiles in the given side's pan.
        */
        getTileCountInPan: function getTileCountInPan(side) {
            var $pan = this.$('.' + side + '-pan-wrapper').find('.dynamic-container'),
                $tiles = $pan.find('.' + viewClassName.TILE_CLASS);
            return $tiles.length;
        },

        /**
        * Get the count of tiles present in temp bin
        * @method getTileCountInTempBin
        * @param side {String} 'left' or 'right'
        * @return {Number} The number of tiles in the given side's temporary bin.
        */
        getTileCountInTempBin: function getTileCountInTempBin(side) {
            var $bin = this.$('.' + side + '-temporary-bin'),
                $tiles = $bin.find('.' + viewClassName.TILE_CLASS);
            return $tiles.length;
        },

        /**
        * Sets accessibility text for temporary bins depending on the number of tiles in the temporary bin
          and whether or not any dispenser tile is selected.
        *
        * @method _setTempBinAccText
        * @param [tileText] {String} Accessibilty text describing the type of tile dropped into the temporary bin.
        * @param [droppedTileText] {String} Accessibilty text describing the type of tile deleted from the temporary bin.
        * @private
        */
        _setTempBinAccText: function _setTempBinAccText(tileText, deletedTileText, panSide) {
            var self = this,
                prependText = '',
                newAccMsgForLeftBin = null,
                newAccMsgForRightBin = null,
                dispenserTileSelected = null,
                selectedTile = null,
                left = self.getAccMessage('left', 0),
                right = self.getAccMessage('right', 0),
                leftBinTileCount = self.getTileCountInTempBin('left'),
                rightBinTileCount = self.getTileCountInTempBin('right');
            dispenserTileSelected = this._getCurrentSelectedDispenserTile();
            if (dispenserTileSelected) {
                newAccMsgForLeftBin = self.getAccMessage('temporary-trash-can', 1, [left]);
                newAccMsgForRightBin = self.getAccMessage('temporary-trash-can', 1, [right]);
            }
            else {
                if ((leftBinTileCount && !(deletedTileText)) || (deletedTileText && leftBinTileCount > 1)) {
                    newAccMsgForLeftBin = self.getAccMessage('temporary-trash-can', 3, [left]);
                }
                else {
                    newAccMsgForLeftBin = self.getAccMessage('temporary-trash-can', 0, [left]);
                }
                if ((rightBinTileCount && !(deletedTileText)) || (deletedTileText && rightBinTileCount > 1)) {
                    newAccMsgForRightBin = self.getAccMessage('temporary-trash-can', 3, [right]);
                }
                else {
                    newAccMsgForRightBin = self.getAccMessage('temporary-trash-can', 0, [right]);
                }
            }
            if (deletedTileText) {
                prependText = self.getAccMessage('tile-delete-text', 1, [deletedTileText]);
            }
            if (tileText) {
                prependText = self.getAccMessage('temporary-trash-can', 4, [tileText]);
            }
            newAccMsgForLeftBin = prependText + newAccMsgForLeftBin;
            newAccMsgForRightBin = prependText + newAccMsgForRightBin;
            if (panSide === 'left') {
                self.setAccMessage('-left-temporary-bin', newAccMsgForLeftBin);
            }
            else if (panSide === 'right') {
                self.setAccMessage('-right-temporary-bin', newAccMsgForRightBin);
            }
            else {
                self.setAccMessage('-left-temporary-bin', newAccMsgForLeftBin);
                self.setAccMessage('-right-temporary-bin', newAccMsgForRightBin);
            }
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
            return;
        },

        /*
        * Clear Both pans
        * @method clearPans
        */
        clearPans: function clearPans() {
            this.$('.dynamic-wrapper').find('.' + viewClassName.TILE_CLASS).remove();
            this.$('.temporary-bins-container').find('.' + viewClassName.TILE_CLASS).remove();
            this._updateEquationForDynamicPanBalance();
            this._setPanAccText();
            this.animateDynamicPan();
            return;
        },


        /*
        * Get the variables in pan
        * @method getVariableCount
        * @param String pan
        * @return Number count
        */
        getVariableCount: function getVariableCount(pan) {
            return this._getSpecificTypeTileCount(pan, 'Var');
        },

        /*
        * Get the absolute variables (ignoring nullification) in pan
        * @method getAbsoluteVariableCount
        * @param String pan
        * @return Number count
        */
        getAbsoluteVariableCount: function getAbsoluteVariableCount(pan) {
            return this._getSpecificTypeTileCount(pan, 'Var', true);
        },

        /*
        * Get the constants in pan
        * @method getConstantsCount
        * @param String pan
        * @return Number count
        */
        getConstantsCount: function getConstantsCount(pan) {
            return this._getSpecificTypeTileCount(pan, 'Num');
        },

        /*
        * Get the equation co-efficients in pan
        * @method getEquationCoefficients
        * @param String pan
        * @return Number count
        */
        getEquationCoefficients: function (pan) {
            return this._getEquation(pan, true);
        },

        /*
        * Modify the dispenser tiles
        * @method modifyDispenser
        * @param object tilesData
        */
        modifyDispenser: function modifyDispenser(tilesData) {
            var $tiles = this.$('.dispenser-container').find('.' + viewClassName.TILE_CLASS);
            $tiles.remove();
            this.renderDispenser(tilesData);
            return;
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
                leftTemporaryBin: self._getTileDataForTemporaryBin('left'),
                rightTemporaryBin: self._getTileDataForTemporaryBin('right'),
                isDisabled: self._getIsDisabled()
            };
            return saveStateObject;
        },

        highlightTile: function highlightTile() {

        },

        /*
        * Returns equation to be modeled
        * @public
        * @method getEquationToModel
        * @return
        */
        getEquationToModel: function getEquationToModel() {
            return this.model.get('equationToModel');
        },

        /*
        * sets equation to be modeled
        * @public
        * @method setEquationToModel
        * @param value {Object} The value to be set as equation to be modeled
        */
        setEquationToModel: function setEquationToModel(value) {
            this.model.set('equationToModel', value);
        },

        marqueeMovedOut: function (elements) {
            var numOfelements = elements.length;
            this.marqueeMoveOut = true;

            for (var i = 0; i < numOfelements - 1; i++) {
                this._deleteOnRevertHandler(elements[i]);
            }
            this.marqueeMoveOut = false;
            this._deleteOnRevertHandler(elements[i]);
            this._removeMarqueeOnTileDrag();
        }

    }, {
        LEFT_PAN_DROP: 'left_pan_drop',
        RIGHT_PAN_DROP: 'right_pan_drop',
        PAN_DROP: 'pan_drop',
        TRASH_DROP: 'trash_drop',
        DOUBLE_CLICK_TILE: 'double_click_tile',
        TILE_DRAG: 'tile_drag',
        TILE_FADEOUT: 'tile_fadeout',
        MARQUEE_RESIZE: 'pan_marquee_resize',
        MARQUEE_START: 'pan_marquee_start',
        MARQUEE_DROP: 'pan_marquee_drop',
        PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER: 'pan-balance-draggable-tile-text-container',
        PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_LEFT_PART: 'pan-balance-draggable-tile-text-container-left-part',
        PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_MIDDLE_PART: 'pan-balance-draggable-tile-text-container-middle-part',
        PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_RIGHT_PART: 'pan-balance-draggable-tile-text-container-right-part',
        PAN_BALANCE_DRAGGABLE_TILE_TEXT: 'pan-balance-draggable-tile-text',
        PAN_BALANCE_DRAGGABLE_TILE_DOTS: 'pan-balance-draggable-tile-dots',
        PAN_BALANCE_DRAGGABLE_TILE_LEFT_SHADOW: 'pan-balance-draggable-tile-left-shadow',
        PAN_BALANCE_DRAGGABLE_TILE_RIGHT_SHADOW: 'pan-balance-draggable-tile-right-shadow',
        PAN_BALANCE_DRAGGABLE_TILE_BOTTOM_SHADOW: 'pan-balance-draggable-tile-bottom-shadow',
        TILE_CLASS: 'pan-draggable-dispenser-tile',
        RED_TILE: 'red-tile',
        GREEN_TILE: 'green-tile',
        DISPENSER_TILE_CLICKED: 'dispenser-tile-clicked',

        NEGATIVE_TILE_INDICATOR: '-',

        VARIABLE_LABEL: 'x',
        CONSTANT_PADDING_VALUE: 4,

        TILE_TYPE: {
            VAR: 'Var',
            NUM: 'Num'
        },

        MAX_ROWS: 4,
        MAX_COLS: 5,
        MAX_VARIABLE: 4,
        MAX_CONSTANT:4,

        TILE_NOT_NULLIFIED: 0,
        PAN_FULL: 1,
        TILE_NULLIFIED: 2,

        FADE_TILES_DURATION: 17,

        // Maximum number of 'Num' tiles that can be placed in the bin
        BIN_CAPACITY: 24,

        /*
        * Create pan balance with specified options
        * @method createPanBalance
        * @param {object} panBalanceProps
        */
        createPanBalance: function (panBalanceProps) {
            var panBalanceID;
            if (panBalanceProps) {
                panBalanceID = '#' + panBalanceProps.containerId;
                var panBalanceModel = new MathInteractives.Common.Components.Models.PanBalanceStructured(panBalanceProps);
                var panBalanceView = new MathInteractives.Common.Components.Views.PanBalanceStructured({ el: panBalanceID, model: panBalanceModel });
                return panBalanceView;
            }
        },
        Position: {
            LEFT: 0,
            CENTRE: 1,
            RIGHT: 2
        }
    });

    MathInteractives.global.PanBalanceStructured = MathInteractives.Common.Components.Views.PanBalanceStructured;
    viewClassName = MathInteractives.Common.Components.Views.PanBalanceStructured;
})();