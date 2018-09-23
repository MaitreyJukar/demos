(function () {
    'use strict';

    var namespace = MathInteractives.Common.Interactivities.ExponentAccordion.Views,
        equationManagerViewNamespace = MathInteractives.Common.Components.Views.EquationManager,
        equationManagerModelNamespace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Interactivity specific EquationManager for Build mode
    *
    * @class FormExpressionEquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager.EquationManager
    * @namespace MathInteractives.Common.Interactivities.ExponentAccordion.Views
    */
    namespace.FormExpressionEquationManager = equationManagerViewNamespace.FormExpressionEquationManager.extend({

        currentLevel : null,

        initialize: function () {
            namespace.FormExpressionEquationManager.__super__.initialize.apply(this, arguments);
        },

        setCurrentLevel: function setCurrentLevel (level) {
            this.currentLevel = level;
        },

        /*isBigParenthesisPresent: function isBigParenthesisPresent() {
            var model = this.equationView.model;

            if (model.getItemFromIndex('0').get('type') === equationManagerModelNamespace.TileItem.BinTileType.BIG_PARENTHESIS) {
                return true;
            }
            return false;
        },*/

        /**
        * Depending on the value passed will add/remove the big parenthesis
        * @param {Boolean} enable true: to add , false: to remove
        *
        * @method toggleBigParenthesis
        */
        toggleBigParenthesis: function toggleBigParenthesis(enable) {

            var cmdFactoryClass = equationManagerModelNamespace.CommandFactory,
                source = new cmdFactoryClass.TileLocation('0', false, 1),
                self = this,
                cmdData = {};

            cmdData.source = source;
            cmdData.type = equationManagerModelNamespace.TileItem.BinTileType.BIG_PARENTHESIS;
            this.$el.addClass('hide-overflow');
            if (enable) {
                this.fireCommand(cmdFactoryClass.COMMANDS.ADD_TILE, cmdData);
            }
            else {
                this.fireCommand(cmdFactoryClass.COMMANDS.DELETE_TILE, cmdData);
            }
            window.setTimeout(function () {
                self.$el.removeClass('hide-overflow')
            }, 0);



        },

        /**
        * Creates equation view structure.
        * @method createEquationView
        * @public
        * @param data {Object} equation data.
        * @param container {Object} equation view element.
        */
        setData: function (data, isSavedStateLoad) {
            namespace.FormExpressionEquationManager.__super__.setData.apply(this, arguments);
            this._bindEventsOnBuildMode();
        },

        _bindEventsOnBuildMode: function _bindEventsOnBuildMode() {
            this.listenTo(this.equationView.model, equationManagerModelNamespace.CommandFactory.EVENTS.BIG_PARENTHESIS_ADDED, this._onAddBigParenthesis);
            this.listenTo(this.equationView.model, equationManagerModelNamespace.CommandFactory.EVENTS.BIG_PARENTHESIS_REMOVED, this._onRemoveBigParenthesis);
        },

        _onAddBigParenthesis: function _onAddBigParenthesis() {
            this.trigger(namespace.FormExpressionEquationManager.EVENTS.BIG_PARENTHESIS_ADDED);
        },

        _onRemoveBigParenthesis: function _onRemoveBigParenthesis() {
            this.trigger(namespace.FormExpressionEquationManager.EVENTS.BIG_PARENTHESIS_REMOVED);
        },

        onRepositionTile: function onRepositionTile(data) {
            var cmdFactoryClass = equationManagerModelNamespace.CommandFactory,
                sourceTile = data.sourceTile,
                destTile = data.destTile,
                cmdData = {},
                bRetValue;
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }
            cmdData.source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile), sourceTile.model.get('bDenominator'), data.numOfTiles);
            cmdData.dest = new cmdFactoryClass.TileLocation(destTile.parent.getIndex(destTile), destTile.model.get('bDenominator'), 1);
            cmdData.isLeft = data.isLeft;
            cmdData.operator = '*';
            if (this._validateBuildModeReposition(cmdData.source, cmdData.dest) === false) {
                return false;
            }

            bRetValue = this.fireCommand(cmdFactoryClass.COMMANDS.BUILD_REPOSITION, cmdData);
            if (bRetValue) {
                this.removeMarquee();
            }
            return bRetValue;
        },

        onRepositionIndividualTile: function onRepositionTile(data) {
            var cmdFactoryClass = equationManagerModelNamespace.CommandFactory,
                sourceTile = data.sourceTile,
                destTile = data.destTile,
                tileType = data.tiletype,
                cmdData = {},
                bRetValue;
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }
            cmdData.source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile), sourceTile.model.get('bDenominator'), data.numOfTiles);
            cmdData.dest = new cmdFactoryClass.TileLocation(destTile.parent.getIndex(destTile), destTile.model.get('bDenominator'), 1);
            cmdData.type = tileType;
            cmdData.isLeft = data.isLeft;
            cmdData.operator = '*';
            if (this._validateBuildModeIndividualReposition(cmdData.source, cmdData.dest, tileType) === false) {
                return false;
            }
            bRetValue = this.fireCommand(cmdFactoryClass.COMMANDS.BUILD_REPOSITION_INDIVIDUAL_TILE, cmdData);
            if (bRetValue) {
                this.removeMarquee();
            }
            return bRetValue;
        },

        onAddTile: function onAddTile(data, accBool) {
            var bAllow = equationManagerViewNamespace.EquationManager.Operations.ADD_TILE_TO_CANVAS && this.model.get('allowManagerLevelOperations');
            if (bAllow) {
                if (!this._isValidDropElementForTutorial(data)) {
                    return false;
                }
                var cmdFactoryClass = equationManagerModelNamespace.CommandFactory,
                    source = new cmdFactoryClass.TileLocation(data.index, data.isDestDeno, data.numOfTiles),
                    sourceTile = data.sourceTile,
                    /*sourceTileData = sourceTile.data(),
                    tileType = sourceTileData.tiletype,*/
                    /*sourceTileData,*/ tileType, tileValue,
                    binTileTypes = equationManagerModelNamespace.TileItem.BinTileType,
                    cmdData = {},
                    bRetValue, indexes;

                if (accBool) {
                    //sourceTileData = { tiletype: sourceTile.tileType, tilevalue: sourceTile.tilevalue };
                    tileType = sourceTile.tileType;
                    tileValue = +sourceTile.tilevalue;
                }
                else {
                    //sourceTileData = sourceTile.data();
                    tileType = sourceTile.attr('data-tiletype');
                    tileValue = +sourceTile.attr('data-tilevalue');
                }


                cmdData.source = source;
                cmdData.type = tileType;
                cmdData.isLeft = data.isLeft;
                cmdData.operator = '*';

                if (tileType === binTileTypes.BASE) {
                    if (this.validateTileAddition(cmdData.source) === false) {
                        return false;
                    }
                    cmdData.base = tileValue;
                    if (!this.isBasePresent(cmdData.base, false)) {
                        return false;
                    }
                }
                else if (tileType === binTileTypes.EXPONENT) {
                    if (this.validateTileAddition(cmdData.source) === false) {
                        return false;
                    }
                    cmdData.exponent = tileValue;
                }
                else if (tileType === binTileTypes.PARENTHESIS) {
                    //if (data.numOfTiles > 2) {
                    //    this.trigger(equationManagerViewNamespace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                    //    this.removeMarquee();
                    //    return false;
                    //}

                    indexes = data.index.split('.');
                    indexes.pop();
                    if (this.equationView.model.getItemFromIndex(indexes.join('.')).get('type') === tileType) {
                        this.trigger(equationManagerViewNamespace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
                        return false;
                    }
                    if (this.validateMarqueeAndParenthesisAddition(cmdData.source) === false) {
                        //this.trigger(equationManagerViewNamespace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS);
                        this.removeMarquee();
                        return false;
                    } else if (this.validateMarqueeAndParenthesisAddition(cmdData.source) === false) {
                        //this.trigger(equationManagerViewNamespace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
                        this.removeMarquee();
                        return false;
                    }
                    cmdData.coefficient = tileValue;
                    if (this.isParenthesisDroppable(this.equationView.model.getItemFromIndex(data.index).get('bDenominator'), 1) === false) {
                        return false;
                    }
                }
                bRetValue = this.fireCommand(cmdFactoryClass.COMMANDS.ADD_TILE, cmdData);
                if (bRetValue) {
                    this.removeMarquee();
                }
            }
            return bRetValue;
        },

        onBaseClick: function (index, data) {
            return false;
        },

        onExponentClick: function (index) {
            return false;
        },

        wrapFractionTileItem: function wrapFractionTileItem(modelObj) {
            var tileType = equationManagerModelNamespace.TileItem.BinTileType,
                fractionTileObj = {
                    tileArray: [],
                    type: tileType.FRACTION
                };

            fractionTileObj.tileArray = modelObj.tileArray;
            modelObj.tileArray = [];
            modelObj.tileArray[0] = fractionTileObj;
            return modelObj;
        },

        undo: function () {
            var self = this;
            this.$el.addClass('hide-overflow');
            this.commandFactory.undo();
            window.setTimeout(function () {
                self.$el.removeClass('hide-overflow')
            }, 0);
            this.getEquationStatusModifyBin();
        },

        addTileForNegativeParCoeff: function addTileForNegativeParCoeff() {
            this._updateModelToAddCoefficientTile(this.equationView.model.get('tileArray'));
        },

        _updateModelToAddCoefficientTile: function (tileArray) {
            if (tileArray === null || tileArray.length === 0) {
                return;
            }
            var index, currentModel, sourceIndex,
                cmdData = {},
                tileType = equationManagerModelNamespace.TileItem.BinTileType,
                cmdFactoryClass = equationManagerModelNamespace.CommandFactory;
            for (index = 0; index < tileArray.length; index++) {
                currentModel = tileArray.at(index);
                if (currentModel.get('type') === tileType.PARENTHESIS) {
                    if (currentModel.get('coefficient') === -1) {
                        currentModel.set('coefficient', 1);
                        sourceIndex = this.equationView.model.getIndexFromItem(currentModel);
                        cmdData.source = new cmdFactoryClass.TileLocation(sourceIndex, currentModel.get('bDenominator'), 1);
                        cmdData.type = tileType.BASE_ONLY;
                        cmdData.base = -1;
                        cmdData.isLeft = true;
                        cmdData.operator = '*';
                        this.fireCommand(cmdFactoryClass.COMMANDS.ADD_TILE, cmdData);
                    }
                }
                this._updateModelToAddCoefficientTile(currentModel.get('tileArray'));
            }
        },

        /**
         * Checks if parenthesis exponent draggable
         * @method isParenthesisExponentDraggable
         * @public
         *
         * @returns {Boolean} Returns true after checking the current level and decides whether the parenthesis exponent is draggable
         */
        isParenthesisExponentDraggable: function isParenthesisExponentDraggable () {
            this.trigger(namespace.FormExpressionEquationManager.EVENTS.GET_CURRENT_LEVEL);
            if(this.currentLevel === 5) {
                return true;
            }
            return false;
        }

    }, {

        EVENTS: {
            BIG_PARENTHESIS_ADDED: 'big-parenthesis-added',
            BIG_PARENTHESIS_REMOVED: 'big-parenthesis-removed',
            GET_CURRENT_LEVEL : 'get-current-level'
        }

    });

})();
