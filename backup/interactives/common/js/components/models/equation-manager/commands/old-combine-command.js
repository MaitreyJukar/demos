(function () {
    'use strict';

    var namespace = MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager,
        equationComponentNameSpace = MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Models.EquationComponent;
    
    /**
    * Comnine command is responsible fot the combinatioa and cancellation of tiles
    * @class CombineCommand
    * @module EquationManager
    * @namespace MathInteractives.Interactivities.ExponentAccordion.EquationManager.Models
    * @extends MathInteractives.Common.Player.Models.BaseCommand
    * @type Object
    * @constructor
    */
    
    namespace.Models.CombineCommand = namespace.Models.BaseCommand.extend({
        /**
        * Defaults values for the model attributes
        *
        * @attribute defaults
        * @type Object
        * @default {}
        **/
        defaults: {
            sourceObj: null,
			
			destObj: null
            
        },
        
        sourceRefTile: null,
		destRefTile: null,
        sourcePos: null,
        destPos: null,
		isInserted: false,
		numOfTiles: null,
        
        /**
        * Initializes the Break exponent command
        *
        * @method initialize
        */
        initialize: function () {
        },
		
		_initializeModelAttributes: function _initializeModelAttributes(data) {
			this.set('sourceObj', data.source);
			this.set('destObj', data.dest);
		},
		
		_getParentTiles: function _getParent(modelRef, index, length) {
			index = this.getParentIndex(index);
			return modelRef.getItemFromIndex(index).get('tileArray');	
		},
		
		_fillArrayCommands: function _fillArrayCommands (givenOperation) {
            var allowedCommands = [],
                allOperations = equationComponentNameSpace.Operations;
            
            allowedCommands[0] = givenOperation & allOperations.CANCEL_BASE_NO_EXP;
            allowedCommands[1] = givenOperation & allOperations.COMBINE_LIKE_BASE_WITH_EXP_1_EXP_N;
            allowedCommands[2] = givenOperation & allOperations.CANCEL_EQUAL_TERMS_ON_EVALUATION;
            allowedCommands[3] = givenOperation & allOperations.COMBINE_LIKE_BASE_DIFF_EXP;
            allowedCommands[4] = givenOperation & allOperations.PRIME_TO_COMPOSITE_EXP_1;
            allowedCommands[5] = givenOperation & allOperations.COMBINE_SIMILAR_TERMS_ONE_CANCELS_COMPLETELY;
            allowedCommands[6] = givenOperation & allOperations.COMBINE_DIFF_BASE_WITH_SAME_EXP; 
            
            return allowedCommands;
        },
		
        /**
        * Executes the Combine Command
        *
        * @method execute
        * @param {Object} consisting the allowed operation and prime limit
        * @param {Object} the model on which the operation is being performed
        * @param {Object} the data required to perform the Combine Command 
        **/
        execute: function (rules, modelRef, data) {
            
			this._initializeModelAttributes(data);
			
			var sourceObj = this.get('sourceObj'),
				sourceIndex = sourceObj.index,
				sourceIndexLength = sourceIndex.length,
				destObj = this.get('destObj'),
                destIndex = destObj.index,
                destIndexLength = destIndex.length,
				givenOperation = rules.allowedOperation,
				allowedCommands = [],
                index, length, sourceParentTiles, destParentTiles;

            //Populates the array, based on which commands are permitted
            allowedCommands = this._fillArrayCommands(givenOperation);
            
            this.sourcePos = parseInt(this.getSourceWrtParent(sourceIndex));
			this.destPos = parseInt(this.getSourceWrtParent(destIndex));

			sourceParentTiles = this._getParentTiles(modelRef, sourceIndex, sourceIndexLength);
			destParentTiles = this._getParentTiles(modelRef, destIndex, destIndexLength);
            
			// Storing reference of the dragged Tile and on which it was dropped
            this.sourceRefTile = sourceParentTiles.at(this.sourcePos);
            if(this.sourceRefTile.get('type') !== namespace.Models.TileItem.SolveTileType.BASE_EXPONENT) {
                return false;
            }
            this.destRefTile = destParentTiles.at(this.destPos);
            if(this.destRefTile.get('type') !== namespace.Models.TileItem.SolveTileType.BASE_EXPONENT) {
                return false;
            }
            //Calling the methods which are permitted
            for(index=0, length=allowedCommands.length; index<length; index++) {
                if(allowedCommands[index] !== 0) {
                    if(this['_execute'+allowedCommands[index]](sourceParentTiles, destParentTiles, rules)) {
                        return true;
                    }                  
                }
            }
            return false;
        },
        
        _isSameParent: function _isSameParent (sourceParentTiles, destParentTiles) {
			if(sourceParentTiles === destParentTiles) {
				return true;
			}
			return false;
		},
        
        _removeSourceDestInsertClone: function _removeSourceDestInsertClone (sourceParentTiles, destParentTiles, cloned) {
            cloned.set('operator', '*');
            destParentTiles.remove(destParentTiles.at(this.destPos));
            destParentTiles.add(cloned, {at: this.destPos});
            sourceParentTiles.remove(sourceParentTiles.at(this.sourcePos));
            
            if(this.sourcePos < this.destPos) {
                this.destPos -= 1;
            }
			this.isInserted = true;
			this.numOfTiles = 1;
        },
        
        
        _execute4: function _execute4 (sourceParentTiles, destParentTiles) {  //CANCEL_BASE_NO_EXP
            var sourceRefTile = this.sourceRefTile,
                destRefTile = this.destRefTile,
                sourceExp = sourceRefTile.get('exponent'),
                destExp = destRefTile.get('exponent'),
                sourceBase = sourceRefTile.get('base'),
                destBase = destRefTile.get('base'),
				sourceObj = this.get('sourceObj'),
				destObj = this.get('destObj'),
				sourceLocation = sourceObj.isDenominator,
				destLocation = destObj.isDenominator,
                cloned;
				
			if(sourceLocation === destLocation || sourceBase !== destBase || !this._isSameParent(sourceParentTiles, destParentTiles) || sourceExp < 0 || destExp < 0) {
                return false;
            }
			if (sourceExp === 1 || destExp === 1) {
			    cloned = destRefTile.deepClone();
			    cloned.set('exponent', 0);
                this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
				this._setOperators (sourceParentTiles, destParentTiles, false);
				return true;
			}
			return false;
        },
        
        
        _execute8: function _execute8(sourceParentTiles, destParentTiles) {  //COMBINE_LIKE_BASE_WITH_EXP_1_EXP_N
            var sourceRefTile = this.sourceRefTile,
                destRefTile = this.destRefTile,
                sourceExp = sourceRefTile.get('exponent'),
                destExp = destRefTile.get('exponent'),
                sourceBase = sourceRefTile.get('base'),
                destBase = destRefTile.get('base'),
				sourceObj = this.get('sourceObj'),
				destObj = this.get('destObj'),
				sourceLocation = sourceObj.isDenominator,
				destLocation = destObj.isDenominator,
				mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                cloned, newExponent, flag = false;
            
            if (sourceExp === 1 || destExp === 1) {
                flag = true;
            }

            if(sourceLocation !== destLocation || (sourceExp !== 1 && destExp !== 1) || sourceBase !== destBase || !this._isSameParent(sourceParentTiles, destParentTiles) || flag === false) {
                return false;
            }
            
            cloned = destRefTile.deepClone();
            newExponent = mathUtilClass.addExponents(sourceExp, destExp);
			if(Math.abs(newExponent)>99) { //TODO get 99 from somewhere
				return false;
			}
            cloned.set('exponent', newExponent);

            this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
			this._setOperators (sourceParentTiles, destParentTiles, false);
            return true;
        },
        
        
        _execute32: function _execute32 (sourceParentTiles, destParentTiles) {  //CANCEL_EQUAL_TERMS_ON_EVALUATION
            var sourceRefTile = this.sourceRefTile,
                destRefTile = this.destRefTile,
                sourceExp = sourceRefTile.get('exponent'),
                destExp = destRefTile.get('exponent'),
				sourceObj = this.get('sourceObj'),
				destObj = this.get('destObj'),
				sourceLocation = sourceObj.isDenominator,
				destLocation = destObj.isDenominator,
				mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                evalSource, evalDest, cloned;
            
            if(!mathUtilClass.isBaseCancellable(sourceExp, destExp, sourceLocation, destLocation) || !this._isSameParent(sourceParentTiles, destParentTiles)){
                return false;
            }
            
            evalSource = Math.pow(sourceRefTile.get('base'), Math.abs(sourceExp));
            evalDest = Math.pow(destRefTile.get('base'), Math.abs(destExp));
            
            if(evalSource !== evalDest) {
                return false;
            }
            
            cloned = destRefTile.deepClone();
            cloned.set('exponent', 0);
            this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
			this._setOperators (sourceParentTiles, destParentTiles, false);
            return true;
        },

        _execute64: function _execute64 (sourceParentTiles, destParentTiles) {  //COMBINE_LIKE_BASE_DIFF_EXP
            var sourceRefTile = this.sourceRefTile,
                destRefTile = this.destRefTile,
                sourceExp = sourceRefTile.get('exponent'),
                destExp = destRefTile.get('exponent'),
                sourceBase = sourceRefTile.get('base'),
                destBase = destRefTile.get('base'),
				sourceObj = this.get('sourceObj'),
				destObj = this.get('destObj'),
				sourceLocation = sourceObj.isDenominator,
				destLocation = destObj.isDenominator,
				mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                totalExp, cloned;
            
            if(sourceBase !== destBase || !this._isSameParent(sourceParentTiles, destParentTiles)) {
                return false;
            }
            
            totalExp = sourceLocation === destLocation ? mathUtilClass.addExponents(sourceExp, destExp) : mathUtilClass.subExponents(destExp, sourceExp)
            
			if(Math.abs(totalExp) > 99) { //TODO get 99 from somewhere
				return false;
			}
            cloned = destParentTiles.at(this.destPos).deepClone();
            cloned.set('exponent', totalExp);
            this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
			this._setOperators (sourceParentTiles, destParentTiles, false);
			
            return true;
        },
        
        
        _execute256: function _execute256 (sourceParentTiles, destParentTiles) {  //PRIME_TO_COMPOSITE_EXP_1
            var sourceRefTile = this.sourceRefTile,
                destRefTile = this.destRefTile,
                sourceExp = sourceRefTile.get('exponent'),
                destExp = destRefTile.get('exponent'),
                sourceBase = sourceRefTile.get('base'),
                destBase = destRefTile.get('base'),
				sourceObj = this.get('sourceObj'),
				destObj = this.get('destObj'),
				sourceLocation = sourceObj.isDenominator,
				destLocation = destObj.isDenominator;
            
            if(sourceLocation !== destLocation || sourceBase === destBase || sourceExp !== 1 || destExp !== 1 || !this._isSameParent(sourceParentTiles, destParentTiles)) {
                return false;
            }
            
            if(!this._combineDiffBases(sourceParentTiles, destParentTiles, sourceBase, destBase)) {
				return false;
			}
			this._setOperators (sourceParentTiles, destParentTiles, false);
			return true;
        },
        
        
        _execute512: function _execute512 (sourceParentTiles, destParentTiles, rules) {  //COMBINE_SIMILAR_TERMS_ONE_CANCELS_COMPLETELY
        	var sourceRefTile = this.sourceRefTile,
                destRefTile = this.destRefTile,
                sourceExp = sourceRefTile.get('exponent'),
                destExp = destRefTile.get('exponent'),
                sourceBase = sourceRefTile.get('base'),
                destBase = destRefTile.get('base'),
				sourceObj = this.get('sourceObj'),
				destObj = this.get('destObj'),
				sourceLocation = sourceObj.isDenominator,
				destLocation = destObj.isDenominator,
				mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
				k = 0,
				resultPrimes = [],
				sourcePrimes, destPrimes, sourceClassPrimes, destClassPrimes;
			
			if(sourceBase === destBase || !mathUtilClass.isBaseCancellable(sourceExp, destExp, sourceLocation, destLocation) || !this._isSameParent(sourceParentTiles, destParentTiles)){
                return false;
            }
			sourcePrimes = mathUtilClass.generatePrimeFactors(rules.primeNumberLimit, sourceBase);
			destPrimes = mathUtilClass.generatePrimeFactors(rules.primeNumberLimit, destBase);
			
			if(sourcePrimes.length === 0 && destPrimes.length === 0) {
				return false;
			} 
			
			sourcePrimes = this._checkPrimesLength(sourcePrimes, 'source');
			destPrimes = this._checkPrimesLength(destPrimes, 'dest');
			
			sourceClassPrimes = this._convertBaseExpClass(sourcePrimes, sourceExp);
			destClassPrimes = this._convertBaseExpClass(destPrimes, destExp);
			
			sourceClassPrimes = this._combineLikeBases(sourceClassPrimes);
			destClassPrimes = this._combineLikeBases(destClassPrimes);
			
			resultPrimes = this._getResultantPrimes(sourceClassPrimes, destClassPrimes);
			resultPrimes = this._convertToDestFormat(resultPrimes, destPrimes);
			resultPrimes = this._combineLikeBases(resultPrimes);
			
			this._updateModel(sourceParentTiles, destParentTiles, resultPrimes);
			this._setOperators (sourceParentTiles, destParentTiles, false);
			
			return true;
        },
        
		_updateModel: function _updateModel (sourceParentTiles, destParentTiles, resultPrimes) {
			var index, tileCloned, 
				resultTiles = [];
			if(this.sourcePos < this.destPos) {
                this.destPos -= 1;
            }
			
			sourceParentTiles.remove(sourceParentTiles.at(this.sourcePos));
			tileCloned = destParentTiles.at(this.destPos);
			destParentTiles.remove(tileCloned);
			
			for(index=0; index<resultPrimes.length; index++) {
				resultTiles[index] = tileCloned.deepClone();
				resultTiles[index].set('operator', '*');
				resultTiles[index].set('base', resultPrimes[index].base);
				resultTiles[index].set('exponent', resultPrimes[index].exp);
			}
			
			for(index=0; index<resultPrimes.length; index++) {
				destParentTiles.add(resultTiles[index], {at: this.destPos + index})	
			}

			this.isInserted = true;
			this.numOfTiles = resultPrimes.length;
		},
		
		_convertToDestFormat: function _convertToDestFormat (resultPrimes, destPrimes) {
			var resultLength = resultPrimes.length,
				destLength = destPrimes.length,
				count=0,
				exp, remExp,
				newResultPrimes = [],
				remResultPrimes = [],
				resultWithDestBase = [],
				currentPrime,
				sign,
				i, j, leastExp, tile;
			
			if(resultLength >= destLength) {
				for(i=0; i<resultLength; i++) {
					for(j=0; j<destLength; j++) {
						if(resultPrimes[i].base === destPrimes[j]) {
							newResultPrimes.push(resultPrimes[i]);
							break;
						}
					}
					if(j === destLength) {
						remResultPrimes.push(resultPrimes[i]);
					}
				}
			}
			else {
				for(i=0; i<resultLength; i++) {
					count = 0;
					currentPrime = resultPrimes[i];
					for(j=0; j<destLength; j++) {
						if(currentPrime.base === destPrimes[j]) {
							count++;
						}
					}
					sign = currentPrime.exp/Math.abs(currentPrime.exp);
					exp = Math.floor(Math.abs(currentPrime.exp) / count) * sign;
					remExp = Math.abs(currentPrime.exp) % count * sign;
					for(j=0; j<count; j++) {
						if(exp !== 0) {
							newResultPrimes.push(new namespace.Models.CombineCommand.BaseExp (currentPrime.base, exp));
						}
					}
					if(remExp !== 0){
						remResultPrimes.push(new namespace.Models.CombineCommand.BaseExp (currentPrime.base, remExp));	
					}
				}
			}
			
			if(newResultPrimes.length === destLength) {
				leastExp = this._getLeastExp(newResultPrimes);
				for(i=0; i<newResultPrimes.length; i++) {
					newResultPrimes[i].exp -= leastExp;
					if(newResultPrimes[i].exp !== 0) {
						resultWithDestBase.push(newResultPrimes[i]);
					}
				}
				tile = new namespace.Models.CombineCommand.BaseExp (this.destRefTile.get('base'), leastExp);
				resultWithDestBase.splice(0, 0, tile);
			}
			else {
				for(i=0; i<newResultPrimes.length; i++) {
					resultWithDestBase[i] = newResultPrimes[i];	
				}
			}
			for(i=0; i<remResultPrimes.length; i++) {
				resultWithDestBase.push(remResultPrimes[i]);
			}
			
			return resultWithDestBase;
		},
		
		_getLeastExp: function _getLeastExp(primes) {
			var index, length,
				min = Math.abs(primes[0].exp),
				sign = primes[0].exp/min;
			for(index=1, length=primes.length; index<length; index++) {
				if(Math.abs(primes[index].exp) < min) {
					min = Math.abs(primes[index].exp);
				}
			}
			return min * sign;
		},
		
		_checkPrimesLength: function _checkPrimesLength (primes, name) {
			if(primes.length === 0) {
				if(name === 'source') {
					primes.push(this.sourceRefTile.get('base'));
				}
				else if(name==='dest') {
					primes.push(this.destRefTile.get('base'));
				}
			}
			return primes;
		},
		
		_getResultantPrimes: function _getResultantPrimes (sourcePrimes, destPrimes) {
			var resultPrimes = [],
				sourceObj = this.get('sourceObj'),
				destObj = this.get('destObj'),
				sourceLocation = sourceObj.isDenominator,
				destLocation = destObj.isDenominator,
				mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
				newExp, newBase, i, j, k=0;
			
			for(i=0; i<sourcePrimes.length; i++) {
				for(j=0; j<destPrimes.length; j++) {
					if(sourcePrimes[i].base === destPrimes[j].base) {
						if(sourceLocation === destLocation) {
							newExp = mathUtilClass.addExponents(sourcePrimes[i].exp, destPrimes[j].exp);
						}
						else {
							newExp = mathUtilClass.subExponents(destPrimes[j].exp, sourcePrimes[i].exp);
						}
						newBase = sourcePrimes[i].base;
						resultPrimes[k] = new namespace.Models.CombineCommand.BaseExp (newBase, newExp);
						k += 1;
						break;
					}
				}
				if(j === destPrimes.length) { // if base present in source which is not present in dest
					resultPrimes[k] = sourcePrimes[i];
					if(sourceLocation !== destLocation) {
						resultPrimes[k].exp = mathUtilClass.invertSign(resultPrimes[k].exp);	
					}
					k += 1;
				}
			}
			for(i=0; i<destPrimes.length; i++) {
				for(j=0; j<resultPrimes.length; j++) {
					if(destPrimes[i].base === resultPrimes[j].base) {
						break;
					}
				}
				if(j === resultPrimes.length) { //if base present in dest which is not present in num
					resultPrimes[k] = destPrimes[i];
					k += 1;
				}
			}
			
			for(i=0; i<resultPrimes.length; i++) {
				if(resultPrimes[i].exp === 0) {
					resultPrimes.splice(i, 1);
				}
			}
			return resultPrimes;
		},					
							
		_combineLikeBases: function _combineLikeBases (primes) {
			var index = 1, 
				length;	
			
			while(true) {
				if(primes[index]) {
					if(primes[index-1].base === primes[index].base) {
						primes[index-1].exp = this._addExponents(primes[index-1], primes[index]);
						primes.splice(index, 1)
					}
					else {
						index++;
					}
				}
				else {
					break;
				}
			}
			return primes
		},
		
		_addExponents: function _addExponents (tile1, tile2) {
			return tile1.exp + tile2.exp;  
		},
		
        _convertBaseExpClass: function _convertBaseExpClass (primes, exp) {
			var index, length,
				primesClass = [];
			
			for(index=0, length=primes.length; index<length; index++) {
				primesClass[index] = new namespace.Models.CombineCommand.BaseExp (primes[index], exp);
			}
			
			return primesClass;
		},
		
        _execute2048: function _execute2048 (sourceParentTiles, destParentTiles) {  //COMBINE_DIFF_BASE_WITH_SAME_EXP
            var sourceRefTile = this.sourceRefTile,
                destRefTile = this.destRefTile,
                sourceExp = sourceRefTile.get('exponent'),
                destExp = destRefTile.get('exponent'),
                sourceBase = sourceRefTile.get('base'),
                destBase = destRefTile.get('base'),
				sourceObj = this.get('sourceObj'),
				destObj = this.get('destObj'),
				sourceLocation = sourceObj.isDenominator,
				destLocation = destObj.isDenominator;
            
            if(sourceLocation !== destLocation || sourceBase === destBase || sourceExp !== destExp || !this._isSameParent(sourceParentTiles, destParentTiles)) {
                return false;
            }
            if(!this._combineDiffBases(sourceParentTiles, destParentTiles, sourceBase, destBase)) {
				return false;
			}
			this._setOperators (sourceParentTiles, destParentTiles, false);
		    return true;
        },
        
        _combineDiffBases: function _combineDiffBases (sourceParentTiles, destParentTiles, sourceBase, destBase) { //prime to composite
            var baseProduct, cloned;
            baseProduct = sourceBase * destBase;
            if(Math.abs(baseProduct > 99)) { //TODO get 99 from somewhere
                return false;
            }
            cloned = destParentTiles.at(this.destPos).deepClone();
            cloned.set('base', baseProduct);
            
            this._removeSourceDestInsertClone(sourceParentTiles, destParentTiles, cloned);
            return true;    
        },
        
        /**
        * Undos the RepositionCommand
        *
        * @method undo
        * @param {Object} the model from which the command has to be indone
        **/
        undo: function (modelRef) {
			var sourceObj = this.get('sourceObj'),
				sourceIndex = sourceObj.index,
				sourceIndexLength = sourceIndex.length,
				destObj = this.get('destObj'),
                destIndex = destObj.index,
                destIndexLength = destIndex.length,
                index, sourceParentTiles, destParentTiles, concernedTiles = [];
			
			
			sourceParentTiles = this._getParentTiles(modelRef, sourceIndex, sourceIndexLength);
			destParentTiles = this._getParentTiles(modelRef, destIndex, destIndexLength);
			
			this._setOperators(sourceParentTiles, destParentTiles, true);
			
			if(this.isInserted === true) {
				for(index=0; index<this.numOfTiles; index++) {
					concernedTiles[index] = destParentTiles.at(this.destPos + index);
				}
				destParentTiles.remove(concernedTiles);
			}
			destParentTiles.add(this.destRefTile, {at: this.destPos});
			sourceParentTiles.add(this.sourceRefTile, {at: this.sourcePos});
			
			this._setOperators(sourceParentTiles, destParentTiles, false);
        }
    },{
		
		BaseExp: function BaseExp (base, exp) {
			this.base = base;
			this.exp = exp;
		}
		
	});
})();