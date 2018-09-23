(function () {
    'use strict';

    var viewNameSpace = MathInteractives.Common.Components.Views.EquationManager,
        modelNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Tile Manager controls tile item activities.
    *
    * @class FormExpressionEquationManager
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewNameSpace.FormExpressionEquationManager = viewNameSpace.EquationManager.extend({

        /**
        * The unique bases that have been take in the formed expression
        * @property takenBases
        * @type Array
        * @default empty
        */
        takenBases: [],

        /**
         * All the bases that have been utilized in the given expression
         * @property allBases
         * @type Array
         * @default empty
         */
        allBases: [],

        /**
        * The parenthesis present in the numerator
        * @property takenParNum
        * @type Array
        * @default empty
        */
        takenParNum: [],

        /**
        * The parenthesis present in the denominator
        * @property takenParDen
        * @type Array
        * @default empty
        */
        takenParDen: [],

        /**
        * The locations of all the bases present
        * @property baseLocations
        * @type Array
        * @default empty
        */
        baseLocations: [],

        isSelectedTileExponent: false,
        tutorialCustomTileString: '',


        /**
         * Initializes the form-expression manager
         *
         8 @method initialize
         */
        initialize: function () {
            viewNameSpace.FormExpressionEquationManager.__super__.initialize.apply(this, arguments);
        },


        attachAccessibilityEvents: function attachAccessibilityEvents() {
            var self = this,
                OPERATION = MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE;
            this.$el.off('keydown.mine').on('keydown.mine', function (event) {
                var code = event.keyCode ? event.keyCode : event.charCode;
                if (self._tutorialMode) {
                    if(self.animationOn || $('#' + self.idPrefix + 'animation-progress-div').css('display') === 'block') {
                        return;
                    }
                    if (code === 9 && event.shiftKey !== true) {
                        event.preventDefault();
                        if(self.accTutSourceData.isBin && self.accTutSourceData.sourceView && self.selectedTile === null && self.accTutSourceData.index.charAt(0) !== '2') {
                            self.getCurrentAccView().removeAccDiv();
                            self.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.TUT_SPACE_PRESSED_GO_TO_BIN, self.accTutSourceData);
                        } else {
                            self.getCurrentAccView().removeAccDiv();
                            self.setFocus('tutorial-replay-btn');
                        }
                    }
                    else if (code === 9 && event.shiftKey === true) {
                        event.preventDefault();
                    }
                    else if (code === 32) {
                        event.preventDefault();
                        self.$el.trigger('mousedown').trigger('mouseup').trigger('click');
                        self.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                        self.equationView.tutorialBuildSpacePressed(self.getCurrentAccView(), self.accTutSourceData);
                    }
                    else if (code === 27) {
                        event.preventDefault();
                        var tile = self.selectedTile;
                        if (self.getCurrentAccView()) {
                            self.getCurrentAccView().removeAccDiv();
                        }
                        if (tile) {
                            self.selectedTile = null;
                            self.setFocus(tile.attr('id').replace(self.idPrefix, ''));
                        }
                        else {
                            self.equationView.buildStartAcc();
                        }
                    }
                }
                else {
                    if (code === 9 && event.shiftKey !== true) {
                        event.preventDefault();
                        if (self.getCurrentAccView() === null) {
                            self.equationView.buildStartAcc();
                        }
                        else {
                            self.equationView.buildContinueAcc(self.getCurrentAccView());
                        }
                    }
                    else if (code === 9 && event.shiftKey === true) {
                        event.preventDefault();
                        self.equationView.buildGoPreviousAcc(self.getCurrentAccView());
                    }
                    else if (code === 32) {
                        self.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.TILE_DRAGGING_START);
                        event.preventDefault();
                        self.$el.trigger('mousedown').trigger('mouseup').trigger('click');
                        self.equationView.buildSpacePressed(self.getCurrentAccView());
                    }
                    else if (code === 27) {
                        event.preventDefault();
                        var tile = self.selectedTile;
                        if (self.getCurrentAccView()) {
                            self.getCurrentAccView().removeAccDiv();
                        }
                        if (tile) {
                            self.selectedTile = null;
                            self.setFocus(tile.attr('id').replace(self.idPrefix, ''));
                        }
                        else {
                            self.equationView.buildStartAcc();
                        }
                    }
                }
            });

            this.player.$el.off('mousedown.mine').on('mousedown.mine', function (event) {
                if (self.getCurrentAccView() && event.which) {
                    //self.getCurrentAccView().removeAccDiv();
                }
            });
        },

        setFocusToExponentBigParenthesis: function setFocusToExponentBigParenthesis(index, isSelectedTileExponent) {
            var tileItem = this.equationView.getViewFromIndex(index);
            this.model.set('currentAccView', tileItem);
            this.isSelectedTileExponent = isSelectedTileExponent;
            tileItem.startAcc();
        },

        getContainerToAppend: function getContainerToAppend() {
            return this.$el;
        },

        onRepositionTile: function onRepositionTile(data) {

        },

        onRepositionIndividualTile: function onRepositionTile(data) {

        },

        onReplaceTile: function (data) {
            var cmdFactoryClass = modelNameSpace.CommandFactory,
                sourceTile = data.sourceTile,
                destTile = data.destTile,
                sourceTileData = sourceTile.data(),
                sourceTileType = sourceTile.attr('data-tiletype'),
                sourceTileValue = parseInt(sourceTile.attr('data-tilevalue'), 10),
                binTileTypes = modelNameSpace.TileItem.BinTileType,
                source = new cmdFactoryClass.TileLocation(destTile.parent.getIndex(destTile), destTile.model.get('bDenominator')),
                cmdData = {},
                isTileFromBin = true,
                bRetValue = false;

            if (sourceTile.data('cur-draggable')) {
                isTileFromBin = false;
            }
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }
            if (isTileFromBin) {
                if (sourceTileType === binTileTypes.BASE) {
                    cmdData.base = sourceTileValue;
                    cmdData.type = sourceTileType;
                    if (!this.isBasePresent(cmdData.base, true, destTile.model.get('base'))) {
                        return false;
                    }
                }
                else if (sourceTileType === binTileTypes.EXPONENT) {
                    cmdData.exponent = sourceTileValue;
                    cmdData.type = sourceTileType;
                }
            }
            cmdData.source = source;
            bRetValue = this.fireCommand(cmdFactoryClass.COMMANDS.REPLACE_TILE, cmdData);

            return bRetValue;
        },

        onSwapTile: function (data) {
            var cmdFactoryClass = modelNameSpace.CommandFactory,
                sourceTile = data.sourceTile,
                destTile = data.destTile,
                cmdData = {},
                bRetValue = false;
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }
            cmdData.source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile), 1, sourceTile.model.get('bDenominator'));
            cmdData.dest = new cmdFactoryClass.TileLocation(destTile.parent.getIndex(destTile), 1, destTile.model.get('bDenominator'));
            cmdData.type = data.type;
            bRetValue = this.fireCommand(cmdFactoryClass.COMMANDS.SWAP_TILE, cmdData);

            return bRetValue;
        },

        onCombineTiles: function onCombineTiles(draggedTile, destTile, countTiles) {
            //if (draggedTile.$el) {
            //    viewNameSpace.FormExpressionEquationManager.__super__.onCombineTiles.apply(this, arguments);
            //    return;
            //}
            var data = draggedTile.data(),
                destIndex = destTile.parent.getIndex(destTile),
                destLoc = destTile.model.get('bDenominator'), parentIndex, newSourceIndex, newDestIndex;
            // ToDo: Instead of getting all these data, combine all this stuff in data object
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }
            if (data.tiletype === modelNameSpace.TileItem.BinTileType['PARENTHESES']) {
                data.isDenominator = destLoc;
                this.onAddTile(data, destIndex);
            }
            else {
                //TO DO : replace tile command
                if (data.tiletype === modelNameSpace.TileItem.BinTileType['BASE']) {
                    data.base = data.tilevalue;
                }
                else if (data.tiletype === modelNameSpace.TileItem.BinTileType['EXPONENT']) {
                    data.exponent = data.tilevalue;
                }
                data.type = data.tiletype;
                //if (data.droppedtile) {
                //    parentIndex = draggableParent.parent.getIndex(draggableParent);
                //    data.isDenominator = draggableParent.model.get('bDenominator');
                //    this.onDeleteTile(data, parentIndex);
                //    delete data.source;
                //    draggedTile.remove();

                //    //newSourceIndex = this.calculateIndex(parentIndex);
                //    //newDestIndex = this.calculateIndex(destIndex);

                //    //if (newSourceIndex < newDestIndex && !(destTile.model.get('base') || destTile.model.get('exponent'))) {
                //    //    newDestIndex -= 1; //TODO: num of tiles
                //    //}
                //    //destIndex = this.calculateStringIndex(destIndex, newDestIndex);
                //}
                //data.isDenominator = destLoc;
                //this.onReplaceTile(data, destIndex);

            }
        },

        onShiftParenthesis: function (data) {
            var cmdFactoryClass = modelNameSpace.CommandFactory,
                sourceTile = data.sourceTile,
                destTile = data.destTile,
                cmdData = {},
                bRetValue = false, indexes,
                sourceLocation = sourceTile.model.get('bDenominator'),
                destLocation = destTile.model.get('bDenominator');
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }
            cmdData.source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile), 1, sourceLocation);
            cmdData.dest = new cmdFactoryClass.TileLocation(destTile.parent.getIndex(destTile), 1, destLocation);
            indexes = destTile.parent.getIndex(destTile).split('.');
            indexes.pop();
            if (this.equationView.model.getItemFromIndex(indexes.join('.')).get('type') === modelNameSpace.TileItem.BinTileType.PARENTHESIS) {
                this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
                return false;
            }
            if (sourceLocation !== destLocation) {
                if (this.isParenthesisDroppable(destTile.model.get('bDenominator'), 1) === false) {
                    return false;
                }
            }
            bRetValue = this.fireCommand(cmdFactoryClass.COMMANDS.SHIFT_PARENTHESES, cmdData);

            return bRetValue;
        },

        undo: function () {
            this.commandFactory.undo();
            this.getEquationStatusModifyBin();
        },

        /**
        * Creates equation view structure.
        * @method createEquationView
        * @public
        * @param data {Object} equation data.
        * @param container {Object} equation view element.
        */
        setData: function (data, isSavedStateLoad) {
            this.resetData();
            var modelClassNamespace = MathInteractives.Common.Components.Models.EquationManager,
                equationModel = new modelClassNamespace.EquationComponent(data.equationData),
                equationLatex = null,
                equationHtml = null;
            this.equationView = new viewNameSpace.EquationView({
                model: equationModel,
                equationManager: this,
                player: data.player,
                filePath: data.filePath,
                manager: data.manager,
                idPrefix: data.idPrefix
            });
            if (isSavedStateLoad !== true) {
                // add initial equation latex to stack
                equationLatex = this.equationView.model.getEquationInLatexForm();
                this.model.get('equationLatexStack').push(equationLatex);
            }
            if (data.equationViewContainer) {
                this.equationView.setEquationContainer(data.equationViewContainer);
            }
            else {
                throw new Error('Provide EquationView container');
            }
            var obj = {
                modelRef: this.equationView.model,
                allowedOperation: data.cmdFactoryData.allowedOperation || this.model.get('allowedOperation'),
                maxPrimeLimit: data.cmdFactoryData.maxPrimeLimit || this.model.get('maxPrimeLimit')
            };
            this.commandFactory.setData(obj);
        },

        resetData: function () {
            if (this.equationView) {
                this.equationView.reset();
                this.equationView = null;
            }
            this.marqueeSelectedItemsIndex = [];
            this.marqueeSelectedItems = [];
            this.commandFactory.resetData();
            this._removeAllTooltips();
            this.model.set('currentAccView', null);
            this.tileSelected = null;
            this.selectedTile = null;
        },

        fireCommand: function (cmdName, data) {
            var equationLatex = null, equationHtml = null,
                cmdFactoryClass = modelNameSpace.CommandFactory, result,
                rules = new cmdFactoryClass.Rules(this.commandFactory.get('allowedOperation'), this.commandFactory.get('maxPrimeLimit'));
            result = this.commandFactory.execute(cmdName, rules, data);
            // todo: set acc text of solve mode workspace area
            if (result) {
                this.getEquationStatusModifyBin();
                equationLatex = this.equationView.model.getEquationInLatexForm();
                this.model.get('equationLatexStack').push(equationLatex);
                equationHtml = this.equationView.getTileContentInHtmlForm();
                this.trigger(viewNameSpace.EquationManager.EVENTS.COMMAND_FIRED, result);
            }
            //this._hideAllTooltips();
            return result;
        },

        /**
         * Checks if parenthesis exponent draggable
         * @method isParenthesisExponentDraggable
         * @public
         *
         * @returns {Boolean} Returns true
         */
        isParenthesisExponentDraggable: function isParenthesisExponentDraggable () {
            return true;
        },

        /**
         * Fired after every command, sets the BIN status reflecting the equation
         *
         * @method getEquationStatusModifyBin
         */
        getEquationStatusModifyBin: function getEquationStatusModifyBin() {
            var model = this.equationView.model,
                baseArray = model.getAllBases(),
                baseLocations = model.getAllBaseLocations(),
                parArray = model.getAllParenthesis();
            this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.STACK_STATUS, this.commandFactory.get('undoStack'));

            this.baseLocations = baseLocations;
            this.allBases = baseArray;

            this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.DISABLE_ENABLE_BIN_BASES, baseArray);
            this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.DISABLE_ENABLE_BIN_PARENTHESIS, parArray);
            this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.DONE_BUTTON_STATUS);
        },

        /**
         * Assigns the number of complete tiles thats a base-exp pair
         *
         * @method getTileStatus
         */
        getTileStatus: function getTileStatus() {
            var model = this.equationView.model;
            return model.getTileStatus();
        },


        /**
         * sets the taken bases
         *
         * @method setBaseArray
         */
        setBaseArray: function setBaseArray(basesTaken) {
            this.takenBases = basesTaken;
        },

        getBaseArray: function getBaseArray() {
            return this.takenBases;
        },

        /**
         * Resets the properties of the veiw to its default
         *
         * @method resetTileCounters
         */

        resetTileCounters: function () {
            this.takenBases = [];

            this.takenParNum = [];

            this.takenParDen = [];

            this.baseLocations = [];
        },

        /**
         * sets the parenthesis array in num and den
         * @param {Array} parArray The array containing the details of the parenthesis
         *
         * @method setParArray
         */
        setParArray: function setParArray(parArray) {
            var index;
            this.takenParDen = [];
            this.takenParNum = [];
            for (index = 0; index < parArray.length; index++) {
                if (parArray[index] % 2 === 0) {
                    this.takenParDen.push(parArray[index] / 2);
                }
                else {
                    this.takenParNum.push(parArray[index]);
                }
            }
        },

        /**
         * Decides whether the parenthesis can be dropped or not
         * @param   {Boolean} location The location of the tile denominator or numerator
         * @param   {Number}  number   The number of parenthesis to be added
         * @returns {Boolean} true if can be dropped else not
         *
         * @method isParenthesisDroppable
         */
        isParenthesisDroppable: function isParenthesisDroppable(location, number) {
            if (number === undefined || number === null) {
                number = 1;
            }
            if (location === true) {
                if (this.takenParDen.length + number > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_PARENTHESIS_DEN) {
                    this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_PARENTHESIS_REACHED);
                    return false;
                }
                return true;
            }
            else {
                if (this.takenParNum.length + number > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_PARENTHESIS_NUM) {
                    this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_PARENTHESIS_REACHED);
                    return false;
                }
                return true;
            }
        },


        /**
         * Whther that base can be dropped or not
         * @param   {Number}  value    The value of the base
         * @returns {Boolean} If the base is present in the array then true
         *
         * @method isBasePresent
         */
        isBasePresent: function isBasePresent(value, isDestinationPresent, destBase) {
            var baseOccurs;
            if (this.takenBases.length === 0) {
                return true;
            }
            if (this.takenBases.indexOf(value) === -1) {
                if (isDestinationPresent) {
                    baseOccurs = _.countBy(this.allBases, function (base) {
                        return base === destBase ? 'presence' : 'others'
                    });
                    if (baseOccurs.presence <= 1) {
                        return true;
                    }
                }
                this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_UNIQUE_BASES_LIMIT_REACHED);
                return false;
            }
            return true;
        },

        /**
         * check ther number of bases in the numerator and the denominator
         * @param   {Boolean} location      The location of the tile
         * @param   {Number}  numberOfTiles The number of tiles
         * @returns {Boolean} true if those tiles can be dropped
         *
         * @method checkBaseLocations
         */
        checkBaseLocations: function checkBaseLocations(location, numberOfTiles, countToDecrement) {
            var baseLocations = this.baseLocations,
                index, numCounter = 0, denCounter = 0, nullNum = 0, nullDen = 0,
                currentBaseLocation;

            countToDecrement = (countToDecrement) ? countToDecrement : 0;

            for (index = 0; index < baseLocations.length; index++) {
                currentBaseLocation = baseLocations[index];
                if (currentBaseLocation === false) {
                    numCounter++;
                }
                else if (currentBaseLocation === true) {
                    denCounter++;
                }
                else if (currentBaseLocation === 1) {
                    nullNum++;
                }
                else {
                    nullDen++;
                }
            }
            if (location === false && numCounter + numberOfTiles + nullNum + countToDecrement > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.NUMERATOR) {
                this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_BASE_REACHED_IN_NUM_DEN);
                return false;
            }
            else if (location === true && denCounter + numberOfTiles + nullDen + countToDecrement > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.DENOMINATOR) {
                this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_BASE_REACHED_IN_NUM_DEN);
                return false;
            }
            return true;
        },

        /**
         * to check if the parenthesis' exp is null or not
         * @returns {Array} the exponents of thr parenthesis
         */
        checkParenthesisExponent: function checkParenthesisExponent() {
            return this.equationView.model.checkParentesisExponent();
        },

        /**
         * validate function of the reposition of tiles
         * @param   {Object}  sourceObj The source tiles to be repositioned
         * @param   {Object}  destObj   The dest tiles to be repositioned
         * @returns {Boolean} true if valid else false
         *
         * @method _validateBuildModeReposition
         */
        _validateBuildModeReposition: function _validateBuildModeReposition(sourceObj, destObj) {
            var sourceIndex = sourceObj.index,
                destIndex = destObj.index,
                sourceLocation = sourceObj.isDenominator,
                destLocation = destObj.isDenominator,
                sourceNumOfTiles = sourceObj.numOfTiles,
                modelRef = this.equationView.model,
                sourceType, destType, sourceParentType, destParentType, numberOfParenthesisInsideMarquee,
                sourceParentTiles, destParentTiles, sourceTile, sourceParent, destParent, destTile;

            sourceTile = modelRef.getItemFromIndex(sourceIndex);
            destTile = modelRef.getItemFromIndex(destIndex);

            sourceParent = this._getParentTiles(modelRef, sourceIndex);
            destParent = this._getParentTiles(modelRef, destIndex);

            sourceParentTiles = sourceParent.get('tileArray');
            destParentTiles = destParent.get('tileArray');

            sourceType = sourceTile.get('type');
            destType = destTile.get('type');

            sourceParentType = sourceParent.get('type');
            destParentType = destParent.get('type');

            numberOfParenthesisInsideMarquee = this._isAnyTileOtherThanBaseExpPresent(sourceIndex, sourceNumOfTiles);

            if (sourceLocation === destLocation) {
                if (sourceParentTiles === destParentTiles) {
                    return true;
                }
                else {
                    if (destParentType === modelNameSpace.TileItem.BinTileType.PARENTHESIS) {
                        if (numberOfParenthesisInsideMarquee > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_NESTED_PARENTHESIS) {
                            this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
                            return false;
                        }
                        if (destTile.get('base') !== null || destTile.get('exponent') !== null) {
                            if (sourceNumOfTiles + destParentTiles.length > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_BASES_INSIDE_PARENTHESIS) {
                                this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                                return false;
                            }
                        }
                        else {
                            if (sourceNumOfTiles > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_BASES_INSIDE_PARENTHESIS) {
                                this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                                return false;
                            }
                            else {
                                return this.checkBaseLocations(destLocation, 0, -1);
                            }
                        }
                    }
                    if (sourceParentType === modelNameSpace.TileItem.BinTileType.PARENTHESIS) {
                        if (sourceNumOfTiles === sourceParentTiles.length) {
                            return this.checkBaseLocations(destLocation, 1);
                        }
                        else {
                            return this.checkBaseLocations(destLocation, 0);
                        }
                    }
                }
            }
            else {
                if (destParentType === modelNameSpace.TileItem.BinTileType.PARENTHESIS) {
                    if (numberOfParenthesisInsideMarquee > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_NESTED_PARENTHESIS) {
                        this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
                        return false;
                    }
                    if (destTile.get('base') !== null || destTile.get('exponent') !== null) {
                        if (sourceNumOfTiles + destParentTiles.length > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_BASES_INSIDE_PARENTHESIS) {
                            this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                            return false;
                        }
                    }
                    else {
                        if (sourceNumOfTiles > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_BASES_INSIDE_PARENTHESIS) {
                            this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                            return false;
                        }
                        else {
                            return this.checkBaseLocations(destLocation, sourceNumOfTiles, -1);
                        }
                    }

                }
                if (destType === modelNameSpace.TileItem.BinTileType.BASE_EXPONENT) {
                    if (destTile.get('base') === null && destTile.get('exponent') === null) {
                        return this.checkBaseLocations(destLocation, sourceNumOfTiles, -1);
                    }
                }
                if (numberOfParenthesisInsideMarquee > 0) {
                    sourceNumOfTiles = this._baseExpTilesInMarquee(sourceIndex, sourceNumOfTiles);
                    if (this.isParenthesisDroppable(destLocation, numberOfParenthesisInsideMarquee) === true) {
                        return this.checkBaseLocations(destLocation, sourceNumOfTiles);
                    }
                    return false;
                }

                return this.checkBaseLocations(destLocation, sourceNumOfTiles);
            }

        },

        /**
         * validate function of the reposition of individual tiles
         * @param   {Object}  sourceObj The source tiles to be repositioned
         * @param   {Object}  destObj   The dest tiles to be repositioned
         * @param   {String}  tileType  the type of the tile item
         * @returns {Boolean} true if valid else false
         *
         * @method _validateBuildModeIndividualReposition
         */
        _validateBuildModeIndividualReposition: function _validateBuildModeIndividualReposition(sourceObj, destObj, tileType) {
            var sourceIndex = sourceObj.index,
                destIndex = destObj.index,
                sourceLocation = sourceObj.isDenominator,
                destLocation = destObj.isDenominator,
                sourceNumOfTiles = 1,
                modelRef = this.equationView.model,
                flag = false,
                sourceType, destType, sourceParentType, destParentType,
                sourceParentTiles, destParentTiles, sourceTile, sourceParent, destParent;

            sourceTile = modelRef.getItemFromIndex(sourceIndex);

            sourceParent = this._getParentTiles(modelRef, sourceIndex);
            destParent = this._getParentTiles(modelRef, destIndex);

            sourceParentTiles = sourceParent.get('tileArray');
            destParentTiles = destParent.get('tileArray');

            sourceType = sourceTile.get('type');
            destType = destParent.get('type');

            sourceParentType = sourceParent.get('type');
            destParentType = destParent.get('type');


            if ((sourceTile.get('base') === null || sourceTile.get('exponent') === null) && sourceType === modelNameSpace.TileItem.BinTileType.BASE_EXPONENT) {
                flag = true;
            }

            if (sourceLocation === destLocation) {
                if (sourceParentTiles === destParentTiles) {
                    if (flag === true) {
                        return true;
                    }
                    return this.checkBaseLocations(destLocation, sourceNumOfTiles);
                }
                else {
                    if (destParentType === modelNameSpace.TileItem.BinTileType.PARENTHESIS) {
                        if (sourceNumOfTiles + destParentTiles.length > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_BASES_INSIDE_PARENTHESIS) {
                            this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                            return false;
                        }
                    }
                    if (sourceParentType === modelNameSpace.TileItem.BinTileType.PARENTHESIS) {
                        if (sourceNumOfTiles === sourceParentTiles.length) {
                            return this.checkBaseLocations(destLocation, sourceNumOfTiles);
                        }
                        else {
                            if (flag === true) {
                                return this.checkBaseLocations(destLocation, 0);
                            }
                            return this.checkBaseLocations(destLocation, sourceNumOfTiles);
                        }
                    }
                    if (flag === true) {
                        return this.checkBaseLocations(destLocation, 0);
                    }
                    return this.checkBaseLocations(destLocation, sourceNumOfTiles);
                }
            }
            else {
                if (destParentType === modelNameSpace.TileItem.BinTileType.PARENTHESIS) {
                    if (sourceNumOfTiles + destParentTiles.length > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_BASES_INSIDE_PARENTHESIS) {
                        this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                        return false;
                    }
                }
                return this.checkBaseLocations(destLocation, sourceNumOfTiles);
            }
        },

        /**
         * validate function of the addition of tiles
         * @param   {Object}  sourceObj The source tiles to be repositioned
         * @returns {Boolean} true if valid else false
         *
         * @method _validateBuildModeReposition
         */
        validateTileAddition: function validateTileAddition(sourceObj) {
            var sourceIndex = sourceObj.index,
                modelRef = this.equationView.model,
                sourceNumOfTiles = 1,
                sourceLocation = sourceObj.isDenominator,
                sourceParentTiles, sourceTile, sourceParent, sourceParentType;

            sourceParent = this._getParentTiles(modelRef, sourceIndex);
            sourceParentTiles = sourceParent.get('tileArray');
            sourceParentType = sourceParent.get('type');

            if (sourceParentType === modelNameSpace.TileItem.BinTileType.PARENTHESIS) {
                if (sourceNumOfTiles + sourceParentTiles.length > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_BASES_INSIDE_PARENTHESIS) {
                    this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                    return false;
                }
            }
            return this.checkBaseLocations(sourceLocation, sourceNumOfTiles);
        },

        validateMarqueeAndParenthesisAddition: function validateMarqueeAndParenthesisAddition(sourceObj) {
            var sourceIndex = sourceObj.index,
                modelRef = this.equationView.model,
                sourceNumOfTiles = sourceObj.numOfTiles;

            if (sourceNumOfTiles > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_BASES_INSIDE_PARENTHESIS) {
                this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                return false;
            }

            if (this._isAnyTileOtherThanBaseExpPresent(sourceIndex, sourceNumOfTiles) > viewNameSpace.FormExpressionEquationManager.NUM_OF_TILES.MAX_NESTED_PARENTHESIS) {
                this.trigger(viewNameSpace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
                return false;
            }
            return true;

        },

        _baseExpTilesInMarquee: function _baseExpTilesInMarquee(sourceIndex, sourceNumOfTiles) {
            var i, last,
                indexes = [],
                baseCtr = 0,
                currentItem;

            for (i = 0; i < sourceNumOfTiles; i++) {
                indexes = sourceIndex.split('.');
                last = parseInt(indexes[indexes.length - 1], 10);
                indexes.pop();
                indexes.push('' + (last + i));
                currentItem = this.equationView.model.getItemFromIndex(indexes.join('.'));
                baseCtr += currentItem.getChildBases(modelNameSpace.TileItem.BinTileType.BASE_EXPONENT);
            }
            return baseCtr;

        },

        _isAnyTileOtherThanBaseExpPresent: function _isAnyTileOtherThanBaseExpPresent(sourceIndex, sourceNumOfTiles) {
            var i, last,
                indexes = [],
                parCounter = 0;

            for (i = 0; i < sourceNumOfTiles; i++) {
                indexes = sourceIndex.split('.');
                last = parseInt(indexes[indexes.length - 1], 10);
                indexes.pop();
                indexes.push('' + (last + i));
                if (this.equationView.model.getItemFromIndex(indexes.join('.')).get('type') !== modelNameSpace.TileItem.BinTileType.BASE_EXPONENT) {
                    parCounter++;
                }
            }
            return parCounter;

        },

        /**
		 * Will return the parent tiles the givwn tile index
		 * @param   {Object}   modelRef The reference to the equation view model
		 * @param   {String}   index    The index string refering a tile
		 * @param   {[[Type]]} length   [[Description]]
		 *
		 * @method _getParentTiles
		 */
        _getParentTiles: function (modelRef, index) {
            index = this.getParentIndex(index);
            return modelRef.getItemFromIndex(index);
        },

        /**
        * Returns the index string of the parent.
        * For an index string "0.1.2.3" the position of the parent is "0.1.2"
        *
        * @method getParentIndex
        * @private
        * @param {String} index of a tile
        * @return {String} index string of parent
        */
        getParentIndex: function (index) {
            if (index.length === 1) {
                return "";
            }
            var lastIndexSeparator = index.lastIndexOf('.');
            return index.substring(0, lastIndexSeparator);
        },

    }, {

        EVENTS: {
            DISABLE_ENABLE_BIN_BASES: 'disable-enable-bin-bases',
            DISABLE_ENABLE_BIN_PARENTHESIS: 'disable-enable-bin-parenthesis',
            STACK_STATUS: 'stack-status',
            MAX_UNIQUE_BASES_LIMIT_REACHED: 'max-base-limit-reached',
            MAX_BASE_REACHED_IN_NUM_DEN: 'max-base-reached-in-num-den',
            DONE_BUTTON_STATUS: 'done-btn-status',
            NESTED_PARENTHESIS_CASE: 'nested-parenthesis-case',
            MAX_PARENTHESIS_REACHED: 'max-parenthesis-reached',
            MAX_TERMS_ALLOWED_IN_PARENTHESIS: 'max-terms-allowed-in-parenthesis',
            UPDATE_EQUATION_DATA: 'update-equation-data',
            TUT_SPACE_PRESSED_GO_TO_BIN: 'tut-space-pressed-go-to-bin'
        },

        NUM_OF_TILES: {
            NUMERATOR: 3,
            DENOMINATOR: 3,
            MAX_PARENTHESIS_NUM: 2,
            MAX_PARENTHESIS_DEN: 2,
            MAX_NESTED_PARENTHESIS: 0,
            MAX_BASES_INSIDE_PARENTHESIS: 2
        }
    });

})();
