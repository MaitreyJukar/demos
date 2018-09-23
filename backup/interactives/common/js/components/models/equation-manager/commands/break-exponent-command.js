(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Responsible for breaking tiles when a EXPONENT tile is double clicked
    * @class BreakExponentCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */

    namespace.BreakExponentCommand = namespace.BaseCommand.extend({

        /**
        * Source TileLocation object
        * @attribute source
        * @type Object
        * @default null
        **/
        source: null,

        /**
        * BASE of the added tile
        * @attribute base
        * @type Number
        * @default null
        **/
        base: null,

        /**
        * EXPONENT of the added tile
        * @attribute exponent
        * @type Number
        * @default null
        **/
        exponent: null,

        /**
        * Initializes the Break exponent command
        *
        * @method initialize
        */
        initialize: function () {
        },

        /**
        * Initialize the model instance attrs with the passed data
        *
        * @method _initializeInstanceAttributes
        * @chainable
        * @private
        */
        _initializeInstanceAttributes: function (data) {
            // save these for later. will be needed when undo
            this.source = data.source;
            return this;
        },

        /**
        * Executes the break exponent command
        *
        * @method execute
        */
        execute: function (rules, modelRef, data) {
            this._initializeInstanceAttributes(data);
            var sourceIndex = this.get('sourceIndex'),
                isDenominator = this.source.isDenominator,
                sourceIndexStr = this.source.index,              // e.g. "0.1.1.0"
                sourceWrtParent = this.getSourceWrtParent(sourceIndexStr),
                parentTile = modelRef.getItemFromIndex(this.getParentIndex(sourceIndexStr)),
                parentTileArray = parentTile.get('tileArray'),
                sourceTile = parentTile.getItemFromIndex(sourceWrtParent),
                operator = null,        //TODO. There will probably be a change in the way operators are stored.
                tileType = null,
                exponent = sourceTile.get('exponent'),
                base = sourceTile.get('base'),
                coeff = sourceTile.get('coefficient'),
                retVal = null,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE;
            tileType = sourceTile.get('type');

            if (tileType === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT) {           // exponent belongs to a simple base exponent pair
                retVal = this._breakBaseExponentTile(parentTile, sourceTile, sourceWrtParent);
            } else if (tileType === modelClassNameSpace.TileItem.SolveTileType.PARENTHESES) {     // exponent belongs to a parentheses
                if (sourceTile.areChildrenOnlyMultiplied()) {                             // Do this only if children has multiplication operator

                    // if there are fractions in the parentheses then hande it separately
                    if (sourceTile.hasFractionChild()) {
                        this._breakParenthesesFractionTile(parentTile, sourceTile, sourceWrtParent);
                    } else {    // if parentheses only has a single level i.e. no fraction inside
                        this._breakParenthesesTile(parentTile, sourceTile, sourceWrtParent);
                    }
                } else {
                    // TODO handle case where children have operators other than multiplication
                }
            }

            this.exponent = exponent;
            this.base = base;
            this.tileType = tileType;
            this.coeff = coeff;
            return retVal;
        },

        /**
        * Handles the case when the exponent on a base-exponent pair is clicked
        *
        * @method _breakBaseExponentTile
        * @private
        * @param {Object} Parent tile of the BASE-EXPONENT pair
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _breakBaseExponentTile: function (parentTile, sourceTile, sourceWrtParent) {
            var parentTileArray = parentTile.get('tileArray'),
                sign = sourceTile.getExponentSign(),
                exponent = parseInt(sourceTile.get('exponent'), 10),
                base = sourceTile.get('base'),
                newTile = null,
                isDenominator = sourceTile.get('bDenominator'),
                createdTiles = 0,
                coeff = sourceTile.get('coefficient'),
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE;

            if (coeff === 'i' && base === null && exponent === 2) {
                this._handleIota(parentTile, sourceTile, sourceWrtParent);
                return ;
            }

            if (Math.abs(exponent) === 1 && base !== -1 && base !== 1) { return EXIT_CODE.FAILURE; }

            parentTileArray.remove(sourceTile);
            this.removedTile = sourceTile;

            if (base === -1 || base === 1) {
                return this._handleOneBase(parentTile, sourceTile, sourceWrtParent);
            }

            // Handle case when a base with exponent 0 is clicked
            if (exponent === 0) {
                return this._handleZeroExponentTile(parentTile, sourceTile, sourceWrtParent);
            }

            for (var i = 0; i < Math.abs(exponent); i++) {
                newTile = sourceTile.clone();
                newTile.set('exponent', sign);
                newTile.set('isAnimate', true); //TODO: describe
                //newTile.setDenominator(isDenominator); // NO need to do this since it's already a clone
                if (parseInt(sourceWrtParent) + i !== 0) newTile.set('operator', '*');        // TODO operator

                parentTileArray.add(newTile, { at: parseInt(sourceWrtParent) + i })       // add new tiles at the end

                // if newTile is the 1st denominator tile then set it's operator to null
                if (this.isFirstDenominatorTile(newTile, parentTile)) {
                    newTile.set('operator', null);
                }

                createdTiles++;                                                     // Store no of tiles created. Set as instance attr later
            }

            this.createdTiles = createdTiles;
            return EXIT_CODE.SUCCESS;
        },

        /**
       * Handle the case when a base-exponent pair with exponent 2 is clicked with base i(iota).
       *
       * @method _handleIota
       * @private
       * @param {Object} Parent tile of the BASE-EXPONENT pair
       * @param {Object} Tile that was clicked
       * @param {String} Source position w.r.t. parent
       */
        _handleIota: function _handleIota(parentTile, sourceTile, sourceWrtParent) {
            var parentTileArray = parentTile.get('tileArray'),
                newTile = null;
            parentTileArray.remove(sourceTile);
            newTile = sourceTile.clone();
            newTile.set('exponent', 1);
            newTile.set('base', -1);
            parentTileArray.add(newTile, { at: parseInt(sourceWrtParent) })       // add new tiles at the end
            this.createdTiles = 1;
            return this;
        },

        /**
        * Handle the case when a base-exponent pair with exponent 0 is clicked.
        *
        * @method _handleZeroExponentTile
        * @private
        * @param {Object} Parent tile of the BASE-EXPONENT pair
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _handleZeroExponentTile: function (parentTile, sourceTile, sourceWrtParent) {
            var parentTileArray = parentTile.get('tileArray'),
                newTile = null,
                TYPES = modelClassNameSpace.TileItem.BinTileType,
                createTileItem = modelClassNameSpace.TileItem.createTileItem,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE;
            //parentTileArray.remove(sourceTile);
            newTile = createTileItem({
                type: TYPES.BASE_ONLY
            });
            newTile.set('base', 1);
            newTile.set('operator', sourceTile.get('operator'));
            newTile.set('bDenominator', sourceTile.get('bDenominator'));
            parentTileArray.add(newTile, { at: parseInt(sourceWrtParent) });       // add new tiles at the end
            this.zeroExpOperator = sourceTile.get('operator');
            this.zeroExpTile = sourceTile;
            this.createdTiles = 1;
            return EXIT_CODE.SUCCESS;
        },

        /**
        * Handle the case when a base-exponent pair with base -1 or 1 is clicked.
        *
        * @method _handleOneBase
        * @private
        * @param {Object} Parent tile of the BASE-EXPONENT pair
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _handleOneBase: function (parentTile, sourceTile, sourceWrtParent) {
            var parentTileArray = parentTile.get('tileArray'),
                newTile = null,
                TYPES = modelClassNameSpace.TileItem.BinTileType,
                createTileItem = modelClassNameSpace.TileItem.createTileItem,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE;

            newTile = createTileItem({
                type: TYPES.BASE_ONLY
            });
            if (sourceTile.get('base') === -1) {
                newTile.set('base', Math.abs(sourceTile.get('exponent')) % 2 === 0 ? 1 : -1);
            } else {
                newTile.set('base', 1);
            }
            newTile.set('operator', sourceTile.get('operator'));
            newTile.set('bDenominator', sourceTile.get('bDenominator'));
            parentTileArray.add(newTile, { at: parseInt(sourceWrtParent) });       // add new tiles at the end
            this.oneBaseOperator = sourceTile.get('operator');
            this.oneBaseTile = sourceTile;
            this.createdTiles = 1;
            return EXIT_CODE.SUCCESS;
        },

        /**
        * Handles the case when the exponent on a PARENTHESES tile is clicked
        *
        * @method _breakParenthesesTile
        * @private
        * @param {Object} Parent tile of the PARENTHESES tile
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _breakParenthesesTile: function (parentTile, sourceTile, sourceWrtParent) {
            var parentTileArray = parentTile.get('tileArray'),
                exponent = parseInt(sourceTile.get('exponent'), 10),
                posCounter = parseInt(sourceWrtParent),
                tilesToReplicate = null,
                newTile = null,
                isDenominator = sourceTile.get('bDenominator'),
                createdTiles = 0;

            parentTileArray.remove(sourceTile);                       // Remove & Save the removed tile for later use

            if (exponent > 0) {
                tilesToReplicate = sourceTile.get('tileArray');                      // collection
                for (var i = 0; i < exponent; i++) {                                      // replicate exponent no. of times
                    for (var j = 0; j < tilesToReplicate.length; j++) {
                        newTile = tilesToReplicate.at(j).deepClone();
                        if (posCounter + i !== 0) newTile.set('operator', '*');
                        newTile.set('bDenominator', isDenominator);
                        parentTileArray.add(newTile, { at: posCounter++ });               // Add new tile at the posCounter and increment posCounter
                        if (this.isFirstDenominatorTile(newTile, parentTile)) {
                            newTile.set('operator', null);
                        }
                        createdTiles++;
                    }
                }
            } else if (exponent < -1) {
                for (var i = 0; i < Math.abs(exponent) ; i++) {
                    newTile = sourceTile.deepClone();                        // Simply clone old tileItem &
                    newTile.set('exponent', -1);                              // set exponent to -1
                    newTile.set('bDenominator', isDenominator);
                    if (posCounter + i !== 0) newTile.set('operator', '*');
                    parentTileArray.add(newTile, { at: posCounter++ });
                    if (this.isFirstDenominatorTile(newTile, parentTile)) {
                        newTile.set('operator', null);
                    }
                    createdTiles++;
                }
            } else if (exponent === -1) {   // apply -1 exponent inside
                tilesToReplicate = sourceTile.get('tileArray');
                for (var i = 0; i < tilesToReplicate.length; i++) {
                    newTile = tilesToReplicate.at(i).deepClone();
                    if (posCounter + i !== 0) newTile.set('operator', '*');
                    newTile.set('bDenominator', isDenominator);
                    newTile.invertExponentSign();
                    parentTileArray.add(newTile, { at: posCounter++ });               // Add new tile at the posCounter and increment posCounter
                    if (this.isFirstDenominatorTile(newTile, parentTile)) {
                        newTile.set('operator', null);
                    }
                    createdTiles++;
                }
            }


            this.createdTiles = createdTiles;
            return this;
        },

        /**
        * Handle case where there is a FRACTION inside a PARENTHESES
        *
        * @method _breakParenthesesFractionTile
        * @private
        * @param {Object} Parent tile of the PARENTHESES tile
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _breakParenthesesFractionTile: function (parentTile, sourceTile, sourceWrtParent) {
            var parentTileArray = parentTile.get('tileArray'),
                fractionTile = sourceTile.get('tileArray').at(0),
                fractionTileArray = fractionTile.get('tileArray'),
                numTiles = fractionTile.get('tileArray').where({ bDenominator: false }),       // numerator tiles inside the parentheses
                denTiles = fractionTile.get('tileArray').where({ bDenominator: true }),
                numParenTile = null,
                denParenTile = null,
                tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
                exponent = sourceTile.get('exponent');

            this.createdTiles = 1
            parentTileArray.remove(sourceTile);

            // numerator parentheses tile
            numParenTile = new modelClassNameSpace.ParenthesisTile({
                bDenominator: false,
                type: tileItemTypes.PARENTHESES,
                exponent: exponent
            });
            // add old numerator tiles to this parentheses tile
            numParenTile.get('tileArray').add(numTiles);

            // denominator parentheses tile
            denParenTile = new modelClassNameSpace.ParenthesisTile({
                bDenominator: true,
                type: tileItemTypes.PARENTHESES,
                exponent: exponent
            });
            // add old denominator tiles to this parentheses tile
            denParenTile.get('tileArray').add(denTiles);



            // remove old tiles from the fraction tile
            fractionTileArray.remove(numTiles);
            fractionTileArray.remove(denTiles);

            // add newly created Parens Tiles to the fraction tile
            fractionTileArray.add(numParenTile);
            fractionTileArray.add(denParenTile);

            // and add this fraction tile where previously there was the parentheses tile
            parentTileArray.add(fractionTile, { at: parseInt(sourceWrtParent) });

            this.exponent = exponent;

            return this;
        },

        /**
        * Undoes the command according to the data passed
        *
        * @method undo
        */
        undo: function (modelRef) {

            var sourceIndexStr = this.source.index,              // e.g. "0.1.1.0"
                sourceWrtParent = this.getSourceWrtParent(sourceIndexStr),
                intSourceWrtParent = parseInt(sourceWrtParent, 10),
                parentTile = modelRef.getItemFromIndex(this.getParentIndex(sourceIndexStr)),
                parentTileArray = parentTile.get('tileArray'),
                sourceTile = parentTile.getItemFromIndex(sourceWrtParent),
                isDenominator = sourceTile.get('bDenominator'),
                tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
                operator = null,
                tileType = this.tileType,
                removedTile = null,
                exponent = this.exponent,
                coeff = this.coeff,
                base = this.base,
                tilesToRemove = [],
                i = null,
                j = null,
                posCounter = null,
                createdTiles = this.createdTiles,
                newTile,
                tile,
                sign = null,
                oldTile = null,
                oldTiles = [];

            // store all tiles to remove in an array.
            // No. of tiles to remove will be createdTiles
            for (i = 0; i < createdTiles; i++) {
                tilesToRemove.push(parentTileArray.at(intSourceWrtParent + i));
            }

            // remove tiles stored in tilesToRemove from the parentTileArray
            _.each(tilesToRemove, function (elem, index, list) {
                parentTileArray.remove(elem);
            });

            if (tileType === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT) {

                if (base === -1) {
                    this._handleUndoOneBase(parentTile, sourceTile, sourceWrtParent);
                    return true;
                }

                // handle undo of break zero exponent tile
                if (exponent === 0) {
                    this._handleUndoZeroExponent(parentTile, sourceTile, sourceWrtParent);
                    return true;
                }

                if (base === null && coeff === 'i') {
                    this._handleUndoIota(parentTile, sourceTile, sourceWrtParent);
                    return true;
                }

                oldTile = this.removedTile;
                parentTileArray.add(oldTile, { at: intSourceWrtParent });
            } else if (tileType === modelClassNameSpace.TileItem.SolveTileType.PARENTHESES) {

                // If there is a FRACTION in place of the sourceTile
                // => this is the case of undoing "Use EXPONENT"
                if (sourceTile.get('type') === modelClassNameSpace.TileItem.SolveTileType.FRACTION) {
                    this._undoBreakParenthesesFractionTile(parentTile, sourceTile, sourceWrtParent);
                    return;
                }

                if (exponent < -1) {
                    oldTile = tilesToRemove.pop().deepClone();
                    oldTile.set('exponent', exponent);
                    oldTile.set('bDenominator', isDenominator);
                    if (intSourceWrtParent !== 0) oldTile.set('operator', '*');
                    parentTileArray.add(oldTile, { at: intSourceWrtParent });
                    if (this.isFirstDenominatorTile(oldTile, parentTile)) {
                        oldTile.set('operator', null);
                    }
                } else if (exponent > 0) {
                    oldTiles = _.first(tilesToRemove, createdTiles / Math.abs(exponent));
                    oldTiles[0].set('operator', null);
                    tile = new modelClassNameSpace.ParenthesisTile({
                        bDenominator: isDenominator,
                        type: tileItemTypes.PARENTHESES
                    });
                    tile.get('tileArray').add(oldTiles);
                    tile.set('exponent', exponent);
                    if (intSourceWrtParent !== 0) tile.set('operator', '*');
                    parentTileArray.add(tile, { at: intSourceWrtParent });
                    if (this.isFirstDenominatorTile(tile, parentTile)) {
                        tile.set('operator', null);
                    }
                } else if (exponent = -1) {
                    oldTiles = _.first(tilesToRemove, createdTiles / Math.abs(exponent));
                    oldTiles[0].set('operator', null);
                    tile = new modelClassNameSpace.ParenthesisTile({
                        bDenominator: isDenominator,
                        type: tileItemTypes.PARENTHESES
                    });
                    tile.get('tileArray').add(oldTiles);
                    tile.set('exponent', exponent);
                    if (intSourceWrtParent !== 0) tile.set('operator', '*');
                    parentTileArray.add(tile, { at: intSourceWrtParent });
                    if (this.isFirstDenominatorTile(tile, parentTile)) {
                        tile.set('operator', null);
                    }
                }
            }
        },

        /**
        * Handles case where a base exponent raised to power 2 and base is i(iota) is clicked and needs to be undone
        *
        * @method _handleUndoIota
        * @private
        * @param {Object} Parent tile of the PARENTHESES tile
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _handleUndoIota: function _handleUndoIota(parentTile, sourceTile, sourceWrtParent) {
            var tile = null,
                isDenominator = this.source.isDenominator,
                coeff = this.coeff,
                exponent = this.exponent,
                tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
                parentTileArray = parentTile.get('tileArray');

            tile = new modelClassNameSpace.BaseExpTile({
                bDenominator: isDenominator,
                type: tileItemTypes.BASE_EXPONENT,
                exponent: exponent,
                coefficient: coeff
            });

            parentTileArray.add(tile, { at: sourceWrtParent });
            return this;
        },

        /**
        * Handles case where a base exponent raised to power 0 is clicked and needs to be undone
        *
        * @method _handleUndoZeroExponent
        * @private
        * @param {Object} Parent tile of the PARENTHESES tile
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _handleUndoZeroExponent: function (parentTile, sourceTile, sourceWrtParent) {
            var tile = null,
                isDenominator = sourceTile.get('bDenominator'),
                base = this.base,
                exponent = this.exponent,
                tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
                numLength = parentTile.where({ bDenominator: false }).length,
                parentTileArray = parentTile.get('tileArray');

            // if new tile is not 0th tile then set it's operator to *
            //if (parseInt(sourceWrtParent) !== 0 && parseInt(sourceWrtParent) !== numLength + 1) tile.set('operator', '*');
            //if (!parentTile.isFirstChild()) { tile.set('operator', '*'); }
            //tile.set('operator', this.zeroExpOperator);

            parentTileArray.add(this.zeroExpTile, { at: parseInt(sourceWrtParent) });

            return this;
        },

        /**
        * Handles case where a base exponent with base = -1 is clicked and needs to be undone
        *
        * @method _handleUndoOneBase
        * @private
        * @param {Object} Parent tile of the PARENTHESES tile
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _handleUndoOneBase: function (parentTile, sourceTile, sourceWrtParent) {
            var parentTileArray = parentTile.get('tileArray');

            parentTileArray.add(this.oneBaseTile, { at: parseInt(sourceWrtParent) });
            return this;
        },

        /**
        * Handle the undo case of breaking a PARENTHESES tile containing a fraction
        *
        * @method _undoBreakParenthesesFractionTile
        * @private
        * @param {Object} Parent tile of the PARENTHESES tile
        * @param {Object} Tile that was clicked
        * @param {String} Source position w.r.t. parent
        */
        _undoBreakParenthesesFractionTile: function (parentTile, sourceTile, sourceWrtParent) {
            var parentTileArray = parentTile.get('tileArray'),
               parensTile = null,
               numParens = sourceTile.get('tileArray').where({ bDenominator: false }),
               denParens = sourceTile.get('tileArray').where({ bDenominator: true }),
               numTiles = numParens[0].get('tileArray'),
               denTiles = denParens[0].get('tileArray'),
               tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
               exponent = this.exponent;

            // Remove parentheses tiles from fraction tile
            sourceTile.get('tileArray').remove(numParens);
            sourceTile.get('tileArray').remove(denParens);

            // Add child tiles to fraction tile
            sourceTile.get('tileArray').add(numTiles.models);
            sourceTile.get('tileArray').add(denTiles.models);

            // New parentheses tile to add
            parensTile = new modelClassNameSpace.ParenthesisTile({
                bDenominator: false,
                type: tileItemTypes.PARENTHESES,
                exponent: exponent
            });

            parensTile.get('tileArray').add(sourceTile);
            parentTileArray.add(parensTile);
        },

        /**
        * Returns a boolean representing whether the sourceTile is the first denominator tile, in which
        * case it should have an operator of null
        *
        * @method isFirstDenominatorTile
        * @param {Object} Parent tile of the PARENTHESES tile
        * @param {Object} Tile that was clicked
        * @return {Boolean} Boolean representing whether the sourceTile is the first denominator tile
        */
        isFirstDenominatorTile: function (tile, parentTile) {
            var parentTileArray = parentTile.get('tileArray'),
                firstDenominator = parentTileArray.findWhere({ bDenominator: true });

            return tile === firstDenominator ? true : false;
        }
    });

})();
