(function () {
	'use strict';

	/**
    * Comnine command is responsible fot the combinatioa and cancellation of tiles
    * @class CombineCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */

	 MathInteractives.Common.Components.Models.EquationManager.CombineCommand =  MathInteractives.Common.Components.Models.EquationManager.BaseCommand.extend({
		/**
        * Defaults values for the model attributes
        *
        * @attribute defaults
        * @type Object
        * @default {}
        **/
		defaults: {

            /**
            * The source Object containing all source related details
            *
            * @attribute sourceObj
            * @type Object
            * @default null
            **/
			sourceObj: null,

            /**
            * The dest Object containing all dest related details
            *
            * @attribute destObj
            * @type Object
            * @default null
            **/
			destObj: null
        },

        /**
        * An array of source Tiles
        *
        * @attribute sourceTiles
        * @type Array
        * @default null
        **/
		sourceTiles: null,

        /**
        * An array of dest Tiles
        *
        * @attribute destTiles
        * @type Array
        * @default null
        **/
		destTiles: null,

        /**
        * The source term position
        *
        * @attribute sourcePos
        * @type String
        * @default null
        **/
		sourcePos: null,

        /**
        * The dest term position
        *
        * @attribute destPos
        * @type String
        * @default null
        **/
		destPos: null,

        /**
        * A boolean indicated whether a term has been removed
        *
        * @attribute isInserted
        * @type Boolean
        * @default false
        **/
		isInserted: false,

        /**
        * Indicates ther number of tiles that are inserted
        *
        * @attribute numOfTilesInserted
        * @type Number
        * @default null
        **/
		numOfTilesInserted: null,


        exceedingExpLimit: false,

        exceedingBaseLimit: false,

        oneTile: null,

        directConvertZero: false,

		/**
        * Initializes the Break exponent command
        *
        * @method initialize
        */
		initialize: function () {
			this.sourceTiles = [];
			this.destTiles = [];
		},

		/**
		 * Initializes the default model attributes
		 *
		 * @param   {Object} modelRef It is the reference to the equation view model
		 * @param   {Object} root     The root of the tree
		 * @param   {Object} data     the data got by the command from the equation manager
		 * @returns {Object} An object containing the parent tiles of both the source and the destination
		 *
		 * @method _initializeModelAttributes
         * @private
		 */
		_initializeModelAttributes: function (modelRef, /*root,*/ data) {
			var sourceIndex = data.source.index,
				sourceTileCount = data.source.numOfTiles,
				destIndex = data.dest.index,
				destTileCount = 1, // TODO: data.dest.numOfTiles
				parentTileWrapper = {},
				index, firstTile, currentIndex;

			this.set('sourceObj', data.source);
			this.set('destObj', data.dest);

			this.sourcePos = parseInt(this.getSourceWrtParent(sourceIndex));
			this.destPos = parseInt(this.getSourceWrtParent(destIndex));

            parentTileWrapper.sourceParent =  modelRef.getItemFromIndex(this.getParentIndex(sourceIndex));
            parentTileWrapper.destParent =  modelRef.getItemFromIndex(this.getParentIndex(destIndex));

			parentTileWrapper.sourceParentTiles = parentTileWrapper.sourceParent.get('tileArray');
			parentTileWrapper.destParentTiles = parentTileWrapper.destParent.get('tileArray');

            currentIndex = parseInt(sourceIndex.substring(sourceIndex.lastIndexOf('.')+1, sourceIndex.length), 10);
            for(index=0; index<sourceTileCount; index++) {
                this.sourceTiles.push(parentTileWrapper.sourceParentTiles.at(currentIndex+index));
            }

            this.destTiles[0] = modelRef.getItemFromIndex(destIndex);

			return parentTileWrapper;

		},

		/**
        * Executes the Combine Command
        *
        * @param {Object} consisting the allowed operation and prime limit
        * @param {Object} the model on which the operation is being performed
        * @param {Object} the data required to perform the Combine Command
        *
        * @method execute
        **/
		execute: function (rules, modelRef, data) {
            if (modelRef.allOperatorsMultiplicative()) {
                var /*root = modelRef.getTree(),*/
                    parentTileWrapper = this._initializeModelAttributes(modelRef, /*root,*/ data),
                    modelNamespace = MathInteractives.Common.Components.Models.EquationManager,
                    commandFactoryClass = modelNamespace.CommandFactory,
                    currentClass = modelNamespace.CombineCommand.RETURN_VAL,
                    types = modelNamespace.TileItem.BinTileType,
                    flag;

                if(parentTileWrapper.sourceParentTiles === null) {
                    return false;
                }


                flag = this._performCombineOnCollection(parentTileWrapper, rules);

                if (parentTileWrapper.sourceParent.get('type') === types.FRACTION && parentTileWrapper.sourceParent.isNumeratorEmpty()) {
                    this._addOneTile(parentTileWrapper.sourceParent);
                }

                if(flag === currentClass.SUCCESS) {
                    return commandFactoryClass.EXIT_CODE.SUCCESS;
                }
                if(flag === currentClass.INVALID_COMBINE) {
                    return commandFactoryClass.EXIT_CODE.FAILURE;
                }
                if(flag === currentClass.NOT_SAME_PARENT) {
                    return commandFactoryClass.EXIT_CODE.NOT_SAME_PARENT_COMBINE;
                }
                if(flag === currentClass.TILE_VALUE_EXCEEDING_COMBINE) {
                    return commandFactoryClass.EXIT_CODE.TILE_VALUE_EXCEEDING_COMBINE;
                }
                if(flag === currentClass.BASE_VALUE_EXCEEDING_COMBINE) {
                    return commandFactoryClass.EXIT_CODE.BASE_VALUE_EXCEEDING_COMBINE;
                }
                if(flag === currentClass.INVALID_COMBINE_WITH_MARQUEE) {
                    return commandFactoryClass.EXIT_CODE.INVALID_COMBINE_WITH_MARQUEE;
                }
            }
		},

         /**
          * add one tile
          * @method _addOneTile
          * @private
          *
          * @param {Object} fraction The fraction tile item on which the one tile will be added
          */
         _addOneTile: function (fraction) {
            var modelNamespace = MathInteractives.Common.Components.Models.EquationManager,
                createTileItem = modelNamespace.TileItem.createTileItem,
                TYPES = modelNamespace.TileItem.BinTileType;
            this.oneTile = createTileItem({
                type: TYPES.BASE_ONLY,
                isDraggable: false,
                base: 1,
                ignoreMarquee: true,
                isDroppable: false
            });

            fraction.add(this.oneTile, { at: 0 });
        },

        /**
         * Will initialize the allowed commands for this interactive
         * @param   {Number} givenOperation The allowed operation level for the given interactive
         * @returns {Array}  An array consisting the level to which combine should be permitted
         *
         * @method _fillArrayCommands
         * @private
         */
        _fillArrayCommands: function _fillArrayCommands (givenOperation) {
            var allowedCommands = [],
                allOperations = MathInteractives.Common.Components.Models.EquationManager.EquationComponent.Operations;

            this.directConvertZero = givenOperation & allOperations.ZERO_EXP_DIRECT_CONVERT;

            allowedCommands[0] = givenOperation & allOperations.MARQUEE_SELECT_AND_COMBINE;
            allowedCommands[1] = givenOperation & allOperations.COMBINE_SAME_BASE;
            allowedCommands[2] = givenOperation & allOperations.DIVIDE_EQUAL_TERMS_HAVING_BASE_EXP_1_BASE_EXP_ANY;
            allowedCommands[3] = givenOperation & allOperations.DIVIDE_SIMILAR_TERMS_WITH_SAME_EXP;
            allowedCommands[4] = givenOperation & allOperations.PRIME_TO_COMPOSITE_EXP_ANY;

            return allowedCommands;
        },

        /**
         * It checks whether the tiles given are the same or not
         * @param   {Object}  sourceParentTiles The source parent Tiles
         * @param   {Object}  destParentTiles   The dest parent tiles
         * @returns {Boolean} true if they are the same else false
         *
         * @method _isSameParent
         * @private
         */
        _isSameParent: function _isSameParent (sourceParentTiles, destParentTiles) {
			if(sourceParentTiles === destParentTiles) {
				return true;
			}
			return false;
		},

        /**
         * it will remove the needed tiles out of the collection and add the combined term within
         * @param   {Object}  sourceParentTiles The source parent Tiles
         * @param   {Object}  destParentTiles   The dest parent tiles
         *
         * @method _removeSourceDestInsertClone
         */
        _removeSourceDestInsertClone: function _removeSourceDestInsertClone (sourceParentTiles, destParentTiles, cloned) {
            cloned.set('operator', '*');

            this._changeSourceDestPos();

            sourceParentTiles.remove(this.sourceTiles);
            destParentTiles.remove(this.destTiles);
            destParentTiles.add(cloned, {at: this.destPos});

			this.isInserted = true;
			this.numOfTilesInserted = 1;
        },


        /**
         * It checks the source and destPos and changes the dest Position accordingly.
         *
         * @method _changeSourceDestPos
         * @private
         */
        _changeSourceDestPos: function () {
			if(this.sourcePos < this.destPos) {
				this.destPos -= this.sourceTiles.length;
			}
		},


		/**
		 * It checks the limiting condition of the value of a number and whether its below 99
		 * @param   {Number}  number The value of the base or exponent
		 * @returns {Boolean} true if matches the condition
		 *
		 * @method _checkLimitingCondition
         * @private
		 */
		_checkLimitingCondition: function (number) {
			if(Math.abs(number) > 99) {
				return false;
			}
			return true;
		},

        /**
         * To check whether the given collection has all are of base-exp type or base-only type
         * @param   {Object}  tiles The collection of tiles passed
         * @returns {Boolean} true if it matches the given condition false otherwise
         *
         * @method _isBaseExp
         * @private
         */
        _isBaseExp: function _isBaseExp (tiles) {
            var index, type,
                namespace = MathInteractives.Common.Components.Models.EquationManager.TileItem.SolveTileType;
            for(index=0; index<tiles.length; index++) {
                type = tiles[index].get('type');
                if(type !== namespace.BASE_EXPONENT && type !== namespace.BASE_ONLY) {
                    return false;
                }
            }
            return true;
        },

         /**
         * To check whether the given collection has all are of base-exp type or base-only type
         * @param   {Object}  tiles The collection of tiles passed
         * @returns {Boolean} true if it matches the given condition false otherwise
         *
         * @method _isBaseExp
         * @private
         */
         /*_isBaseExpOnly: function _isBaseExpOnly (tiles) {
             var index, type,
                 namespace = MathInteractives.Common.Components.Models.EquationManager.TileItem.SolveTileType;
             for(index=0; index<tiles.length; index++) {
                 type = tiles[index].get('type');
                 if(type !== namespace.BASE_EXPONENT) {
                     return false;
                 }
             }
             return true;
         },*/

         makeTileBaseExp: function makeTilesBaseExp (tile) {
             var modelNamespace = MathInteractives.Common.Components.Models.EquationManager,
                 createTileItem = modelNamespace.TileItem.createTileItem,
                 namespace = MathInteractives.Common.Components.Models.EquationManager.TileItem.SolveTileType,
                 TYPES = modelNamespace.TileItem.BinTileType,
                 type;

             type = tile.get('type');
             if(type === namespace.BASE_ONLY) {
                 tile = createTileItem({
                     type: TYPES.BASE_EXPONENT,
                     base: tile.get('base'),
                     exponent: 1,
                     bDenominator: tile.get('bDenominator')
                 });
             }
             return tile;
         },

        /**
         * The wraaper method to perform combination on the coolection
         * @param   {Object} parentTileWrapper The object which will contain the parent information of the source and dest tiles
         * @param   {Object} rules             Contain data related the rules for the given operation
         * @returns {String} depending on the success or failure of the operation, and also indication where it failed
         *
         * @method _performCombineOnCollection
         * @private
         */
        _performCombineOnCollection: function _performCombineOnCollection (parentTileWrapper, rules) {
            var sourceParentTiles = parentTileWrapper.sourceParentTiles,
                destParentTiles = parentTileWrapper.destParentTiles,
                allowedOperation = rules.allowedOperation,
                allowedCommands = this._fillArrayCommands(allowedOperation),
                currentClass = MathInteractives.Common.Components.Models.EquationManager.CombineCommand.RETURN_VAL,
                index, length, isMarquee = false;

            if(this.sourceTiles.length === 0 || this.sourceTiles[0] == null || this.destTiles.length === 0 || this.destTiles[0] == null) {
                return currentClass.INVALID_COMBINE;
            }

            if(!this._isSameParent(sourceParentTiles, destParentTiles)) {
                return currentClass.NOT_SAME_PARENT;
            }

            if(!this._isBaseExp(this.sourceTiles) || !this._isBaseExp(this.destTiles)) {
                return currentClass.NOT_SAME_PARENT;
            }

            if(this.sourceTiles.length === 1) {
                if (this._performCombinationForBaseOne(sourceParentTiles, destParentTiles)) {
                    return currentClass.SUCCESS;
                }
            }

            /*if(!this._isBaseExpOnly(this.sourceTiles) || !this._isBaseExpOnly(this.destTiles)) {
                return currentClass.INVALID_COMBINE;
            }*/

            if(this.sourceTiles.length > 1) {
                if(allowedCommands[0] !== 0) {
                    if(this['_execute'+allowedCommands[0]](sourceParentTiles, destParentTiles)) {
                        return currentClass.SUCCESS;
                    }
                    isMarquee = true;
                }
            }
            else {
                //Calling the methods which are permitted
                for(index=1, length=allowedCommands.length; index<length; index++) {
                    if(allowedCommands[index] !== 0) {
                        if(this['_execute'+allowedCommands[index]](sourceParentTiles, destParentTiles)) {
                            return currentClass.SUCCESS;
                        }
                    }
                }
            }
            if(this.exceedingExpLimit === true) {
                return currentClass.TILE_VALUE_EXCEEDING_COMBINE;
            }

            if(this.exceedingBaseLimit === true) {
                return currentClass.BASE_VALUE_EXCEEDING_COMBINE;
            }
            if(isMarquee) {
                return currentClass.INVALID_COMBINE_WITH_MARQUEE;
            }
            else {
                return currentClass.INVALID_COMBINE;
            }
        },

        /**
         * It will perform combination on base-only tile which could have only 1 or -1 base
         * @param   {Object}  sourceParentTiles the collection of source Parent tiles
         * @param   {Object}  destParentTiles   The collection of destianation parent tiles
         * @returns {Boolean} If it was a successful operation or not
         *
         * @method _performCombinationForBaseOne
         * @private
         */
        _performCombinationForBaseOne: function _performCombinationForBaseOne (sourceParentTiles, destParentTiles) {
            var sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0],
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                sourceLocation = this.sourceTiles[0].get('bDenominator'),
                destLocation = destTile.get('bDenominator'),
                sourceExp = sourceTile.get('exponent'),
                destExp = destTile.get('exponent'),
                namespace = MathInteractives.Common.Components.Models.EquationManager.TileItem,
                cloned;


            if(sourceBase === 1 && sourceTile.get('type') === namespace.SolveTileType.BASE_ONLY) {
                cloned = destParentTiles.at(this.destPos).deepClone();
                this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
                this._setOperators (sourceParentTiles, destParentTiles, false);
                return true;
            }

            if(destBase === 1 && destTile.get('type') === namespace.SolveTileType.BASE_ONLY) {
                cloned = sourceParentTiles.at(this.sourcePos).deepClone();
                if(sourceLocation !== destLocation) {
                    cloned.set('bDenominator', destTile.get('bDenominator'));
                    cloned.set('exponent', sourceExp * -1);
                }
                this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
                this._setOperators (sourceParentTiles, destParentTiles, false);
                return true;
            }

            if(sourceBase === -1 && Math.abs(destExp) === 1 && sourceTile.get('type') === namespace.SolveTileType.BASE_ONLY) {
                cloned = destParentTiles.at(this.destPos).deepClone();
                cloned.set('base', destBase * -1);
                this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
                this._setOperators (sourceParentTiles, destParentTiles, false);
                return true;
            }
            if(destBase === -1 && Math.abs(sourceExp) === 1 && destTile.get('type') === namespace.SolveTileType.BASE_ONLY) {
                cloned = sourceParentTiles.at(this.sourcePos).deepClone();
                if(sourceLocation !== destLocation) {
                    cloned.set('bDenominator', destTile.get('bDenominator'));
                    cloned.set('exponent', sourceExp * -1);
                }
                cloned.set('base', sourceBase * -1);
                this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
                this._setOperators (sourceParentTiles, destParentTiles, false);
                return true;
            }
            if(destTile.get('type') === namespace.SolveTileType.BASE_ONLY && sourceTile.get('type') === namespace.SolveTileType.BASE_ONLY) {
                cloned = destParentTiles.at(this.destPos).deepClone();
                cloned.set('base', destBase * sourceBase);
                this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
                this._setOperators (sourceParentTiles, destParentTiles, false);
                return true;
            }
            return false;
        },

        /**
         * Performs combination for marquee select and combine operation
         * @param   {Object}  sourceParentTiles The source tiles parent collection
         * @param   {Object}  destParentTiles   The dest Tiles parent collection
         * @returns {Boolean} the status of the operation, whether successful or not
         *
         * @method _execute4
         * @private
         */
        _execute4 : function _execute4 (sourceParentTiles, destParentTiles) {     //MARQUEE_SELECT_AND COMBINE
            var sourceTiles = this.sourceTiles,
                sourceLocation = this.sourceTiles[0].get('bDenominator'),
                destTile = this.destTiles[0],
                destLocation = destTile.get('bDenominator'),
                destExp,
                destBase = destTile.get('base'),
                sourceExp, sourceBase,
                mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                cumulativeTerm, totalExp, cloned;

            cumulativeTerm = this._validateAndGetCumulative(sourceTiles);
            destTile = this.makeTileBaseExp(destTile);
            destExp = destTile.get('exponent');
            if(cumulativeTerm !== false) {
                //cumulativeTerm = this._getCumulativeTerm(sourceTiles);
                sourceBase = cumulativeTerm.get('base');
                sourceExp = cumulativeTerm.get('exponent');
                if(sourceBase !== destBase) {
                    return false;
                }
                totalExp = sourceLocation === destLocation ? mathUtilClass.addExponents(sourceExp, destExp) : mathUtilClass.subExponents(destExp, sourceExp);
                if(this.directConvertZero && totalExp === 0) {
                    var modelNamespace = MathInteractives.Common.Components.Models.EquationManager,
                        createTileItem = modelNamespace.TileItem.createTileItem,
                        TYPES = modelNamespace.TileItem.BinTileType;

                    cloned = createTileItem({
                        type: TYPES.BASE_ONLY,
                        base: 1,
                        bDenominator: destLocation
                    });
                }
                else {
                    if(!this._checkLimitingCondition(totalExp)) {
                        this.exceedingExpLimit = true;
                        return false;
                    }
                    cloned = destTile.deepClone();
                    cloned.set('exponent', totalExp);
                }
                this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
                this._setOperators (sourceParentTiles, destParentTiles, false);
                return true;
            }
            return false;
        },

        /**
         * The methd that used to validate the marquee selected terms and whether combination is possible on the or not
         * @param   {Array}   sourceTiles The array of the source Tiles
         * @returns {Boolean} the cloned object if operation possible else boolean false
         *
         * @method _validateAndGetCumulative
         * @private
         */
        _validateAndGetCumulative: function _validateAndGetCumulative (sourceTiles) {
            var index, currentTerm, staticBase,
                totalExp = 0,
                cloned = sourceTiles[0].deepClone();

            staticBase = cloned.get('base');

            for(index=0; index<sourceTiles.length; index++) {
                currentTerm = sourceTiles[index];
                if(currentTerm.get('base') !== staticBase) {
                    return false;
                }
                totalExp += currentTerm.get('exponent') == null ? 1 : currentTerm.get('exponent'); //1 in case of base only tile item. no need to make it into a base-exp
            }
            cloned.set('exponent', totalExp);
            return cloned;
        },

         /**
         * Performs combination combination of same bases
         * @param   {Object}  sourceParentTiles The source tiles parent collection
         * @param   {Object}  destParentTiles   The dest Tiles parent collection
         * @returns {Boolean} the status of the operation, whether successful or not
         *
         * @method _execute8
         * @private
         */
        _execute8 : function _execute8 (sourceParentTiles, destParentTiles) {  //COMBINE_SAME_BASE;
            var sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0],
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                sourceLocation = sourceTile.get('bDenominator'),
                destLocation = destTile.get('bDenominator'),
                mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                cloned, sourceExp, destExp, totalExp;

            if(sourceBase !== destBase) {
                return false;
            }
            sourceTile = this.makeTileBaseExp(sourceTile);
            destTile = this.makeTileBaseExp(destTile);

            sourceExp = sourceTile.get('exponent');
            destExp = destTile.get('exponent');

            totalExp = sourceLocation === destLocation ? mathUtilClass.addExponents(sourceExp, destExp) : mathUtilClass.subExponents(destExp, sourceExp);
            if(this.directConvertZero && totalExp === 0) {
                var modelNamespace = MathInteractives.Common.Components.Models.EquationManager,
                    createTileItem = modelNamespace.TileItem.createTileItem,
                    TYPES = modelNamespace.TileItem.BinTileType;

                cloned = createTileItem({
                    type: TYPES.BASE_ONLY,
                    base: 1,
                    bDenominator: destLocation
                });
            }
            else {
                if(!this._checkLimitingCondition(totalExp)) {
                    this.exceedingExpLimit = true;
                    return false;
                }
                cloned = destTile.deepClone();
                cloned.set('exponent', totalExp);
            }
            this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
			this._setOperators (sourceParentTiles, destParentTiles, false);

            return true;

        },

         /**
         * Performs combination for equal temrs on evaluation out of which one base shoud have the exponent as 1
         * @param   {Object}  sourceParentTiles The source tiles parent collection
         * @param   {Object}  destParentTiles   The dest Tiles parent collection
         * @returns {Boolean} the status of the operation, whether successful or not
         *
         * @method _execute32
         * @private
         */
        _execute128 : function _execute32 (sourceParentTiles, destParentTiles) { //DIVIDE_EQUAL_TERMS_HAVING_BASE_EXP_1_BASE_EXP_ANY
            var sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0],
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                sourceExp = sourceTile.get('exponent'),
                destExp = destTile.get('exponent'),
                sourceLocation = sourceTile.get('bDenominator'),
                destLocation = destTile.get('bDenominator'),
                mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                cloned, largerBase, newBase, evalSource, evalDest;

            if(sourceLocation === destLocation || !mathUtilClass.isBaseCancellable(sourceExp, destExp, sourceLocation, destLocation)) {
                return false;
            }

            if(sourceExp === 1 || destExp === 1) {
                newBase = Math.abs(sourceBase) > Math.abs(destBase) ? destBase : sourceBase;
                largerBase = Math.abs(sourceBase) > Math.abs(destBase) ? sourceBase : destBase;

                if(largerBase % newBase !== 0) {
                    return false;
                }

                evalSource = Math.pow(sourceBase, Math.abs(sourceExp));
                evalDest = Math.pow(destBase, Math.abs(destExp));

                if(evalSource !== evalDest) {
                    return false;
                }

                cloned = destTile.deepClone();
                cloned.set('exponent', 0);
                cloned.set('base', newBase);
                this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
                this._setOperators (sourceParentTiles, destParentTiles, false);
                return true;
            }
            return false;
        },

         /**
         * Performs combination for equal terms having equal exponents
         * @param   {Object}  sourceParentTiles The source tiles parent collection
         * @param   {Object}  destParentTiles   The dest Tiles parent collection
         * @returns {Boolean} the status of the operation, whether successful or not
         *
         * @method _execute64
         * @private
         */
        _execute256 : function _execute32 (sourceParentTiles, destParentTiles) {  //DIVIDE_SIMILAR_TERMS_WITH_SAME_EXP
            var sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0],
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                sourceExp = sourceTile.get('exponent'),
                destExp = destTile.get('exponent'),
                sourceLocation = sourceTile.get('bDenominator'),
                destLocation = destTile.get('bDenominator'),
                mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                cloned, totalExp, largerBase, smallerBase, newBase, evalSource, evalDest;

            if(sourceLocation === destLocation || !mathUtilClass.isBaseCancellable(sourceExp, destExp, sourceLocation, destLocation)) {
                return false;
            }

            if(sourceExp !== destExp) {
                return false;
            }

            smallerBase = Math.abs(sourceBase) > Math.abs(destBase) ? destBase : sourceBase;
            largerBase = Math.abs(sourceBase) > Math.abs(destBase) ? sourceBase : destBase;

            if(largerBase % smallerBase !== 0) {
                return false;
            }

            newBase = largerBase / smallerBase;

            cloned = destTile.deepClone();
            cloned.set('base', newBase);
            if(sourceBase === largerBase) {
                cloned.set('exponent', destExp * -1);
            }
            this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
            this._setOperators (sourceParentTiles, destParentTiles, false);
            return true;
        },

         /**
         * Performs combination of two different bases havinf same exponent
         * @param   {Object}  sourceParentTiles The source tiles parent collection
         * @param   {Object}  destParentTiles   The dest Tiles parent collection
         * @returns {Boolean} the status of the operation, whether successful or not
         *
         * @method _execute256
         * @private
         */
        _execute512 : function _execute256 (sourceParentTiles, destParentTiles) {  //PRIME_TO_COMPOSITE_EXP_ANY
            var sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0],
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                sourceExp = sourceTile.get('exponent'),
                destExp = destTile.get('exponent'),
                sourceLocation = sourceTile.get('bDenominator'),
                destLocation = destTile.get('bDenominator');

            if(sourceLocation !== destLocation || sourceBase === destBase || sourceExp !== destExp) {
                return false;
            }
            if(!this._combineDiffBases(sourceParentTiles, destParentTiles, sourceBase, destBase)) {
				return false;
			}
			this._setOperators (sourceParentTiles, destParentTiles, false);
		    return true;
        },

         /**
          * The method internally called by _execute256 to perform the combination of different bases having same exponents
          * @param   {Object}  sourceParentTiles The source tiles parent collection
          * @param   {Object}  destParentTiles   The dest Tiles parent collection
          * @param   {Number}  sourceBase        The value of the sourceTile base
          * @param   {Number}  destBase          The value of the dest Tile base
          * @returns {Boolean} whether the operation is successful or not
          *
          * @method _combineDiffBases
          * @private
          */
         _combineDiffBases: function _combineDiffBases (sourceParentTiles, destParentTiles, sourceBase, destBase) { //prime to composite
            var baseProduct, cloned;
            baseProduct = sourceBase * destBase;
            if(!this._checkLimitingCondition(baseProduct)) {
                this.exceedingBaseLimit = true;
                return false;
            }
            cloned = destParentTiles.at(this.destPos).deepClone();
            cloned.set('base', baseProduct);

            this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
            return true;
        },

		/**
        * Undos the Combine Command
        *
        * @method undo
        * @param {Object} the model from which the command has to be indone
        **/
		undo: function (modelRef) {
			var sourceObj = this.get('sourceObj'),
				sourceIndex = sourceObj.index,
				destObj = this.get('destObj'),
				destIndex = destObj.index,
				index, sourceParentTiles, destParentTiles, concernedTiles = [];

			sourceParentTiles = this.getParentTiles(modelRef, sourceIndex);
			destParentTiles = this.getParentTiles(modelRef, destIndex);

			this._setOperators(sourceParentTiles, destParentTiles, true);

            if(this.oneTile !== null) {
                sourceParentTiles.remove(this.oneTile);
            }

			if(this.isInserted === true) {
				for(index=0; index<this.numOfTilesInserted; index++) {
					concernedTiles[index] = destParentTiles.at(this.destPos + index);
				}
				destParentTiles.remove(concernedTiles);
			}
            for(index=0; index<this.destTiles.length; index++) {
                destParentTiles.add(this.destTiles[index], {at: this.destPos + index});
            }
            for(index=0; index<this.sourceTiles.length; index++) {
               sourceParentTiles.add(this.sourceTiles[index], {at: this.sourcePos + index});
            }
			this._setOperators(sourceParentTiles, destParentTiles, false);

		}
	},
    {
         RETURN_VAL: {
             TILE_VALUE_EXCEEDING_COMBINE: 0,
             SUCCESS: 1,
             INVALID_COMBINE: 2,
             NOT_SAME_PARENT: 3,
             BASE_VALUE_EXCEEDING_COMBINEL: 4,
             INVALID_COMBINE_WITH_MARQUEE: 5
         }

	});
})();
