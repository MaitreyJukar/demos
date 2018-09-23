(function () {
    'use strict';

    var namespace = MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager;
    
    /**
    * Reposition command is responsible for the repositioning of the tiles
    * @class RepositionCommand
    * @module EquationManager
    * @namespace MathInteractives.Interactivities.ExponentAccordion.EquationManager.Models
    * @extends MathInteractives.Common.Player.Models.BaseCommand
    * @type Object
    * @constructor
    */
    
    namespace.Models.RepositionCommand = namespace.Models.BaseCommand.extend({
        
        defaults: {
            
            sourceObj: null,
			
			destObj: null,
            
        },
        
        /**
		* The number of tiles that are selected by the user to reposition
		*
		* @attribute length
		* @type Number
		* @default null
		**/
        numOfTiles: null,

        /**
        * The Position of the the source tile w.r.t its parent collection
        *
        * @attribute sourcePos
        * @type Number
        * @default null
        **/
        sourcePos: null,

        /**
        * The Position of the the dest tile w.r.t its parent collection
        *
        * @attribute destPos
        * @type Number
        * @default null
        **/
        destPos: null,
        
        /**
        * Initialises RepositionCommand Model
        *
        * @method initialize
        **/
        initialize: function() {
        },
        
        /**
        * Initialize the model instance attrs with the passed data
        *
        * @method _initializeModelAttributes
        * @chainable
        * @private
        */
		_initializeModelAttributes: function _initializeModelAttributes(data) {
			this.set('sourceObj', data.source);
			this.set('destObj', data.dest);
			this.numOfTiles = data.numOfTiles;
		},
		
        /**
        * Finds the parent collection of the requied tile item
        *
        * @method _getParentTiles
        * @private
        * @param {Object} the model in which the parent itme will be in
        * @param {Object} The index of the child
        * @param {Object} the number of tiles
        * @return {Object} the parent collection 
        */
        _getParentTiles: function _getParent(modelRef, index, length) {
			if(length === 1) {
				return modelRef.getItemFromIndex("").get('tileArray');
			}
			else {
				return modelRef.getItemFromIndex(index.substring(0, length-2)).get('tileArray');
			}		
		},
		
		
		/**
        * Executes the RepositionCommand
        *
        * @method execute
        * @param {Object} consisting the allowed operation and prime limit
        * @param {Object} the model on which the operation is being performed
        * @param {Object} the data required to perform the reposition cmd
        **/
        execute: function (rules, modelRef, data) {
            
			this._initializeModelAttributes(data);
			
			var sourceObj = this.get('sourceObj'),
				sourceIndex = sourceObj.index,
				sourceLocation = sourceObj.isDenominator,
				sourceIndexLength = sourceIndex.length,
				destObj = this.get('destObj'),
                destIndex = destObj.index,
                destIndexLength = destIndex.length,
                destLocation = destObj.isDenominator,
                numOfTiles = this.get('length'),
				givenOperation = rules.allowedOperation,
				baseClass = namespace.Models.EquationComponent.Operations,
                index, sourceParentTiles, destParentTiles;
            
            this.sourcePos = parseInt(sourceIndex.substring(sourceIndexLength-1, sourceIndexLength));
			this.destPos = parseInt(destIndex.substring(destIndexLength-1, destIndexLength));

			sourceParentTiles = this._getParentTiles(modelRef, sourceIndex, sourceIndexLength);
			destParentTiles = this._getParentTiles(modelRef, destIndex, destIndexLength);
			
			if(givenOperation & baseClass.REPOSITION_TILE) { //REPOSITION IN SINGLE PARENT AND MULTIPLICATION CASE ONLY
			
				if(sourceParentTiles !== destParentTiles) { //check for same parent
					return false;
				}
				
				if(this.sourcePos < this.destPos) {
					this.destPos -= this.numOfTiles;
				}
				
				return this._executeReposition(sourceParentTiles, sourceLocation, destParentTiles, destLocation);
			}
			else {
				//TODO: other cases for repositioning, like diff parents and diff operators
			}
        },
        
        /**
        * It performs the reposition and updates the model
        *
        * @method _executeReposition
        * @private
        * @param {Object} the parent collectioon of the tile present at source index
        * @param {Object} Whether the source tile is in the numerator or denominator
        * @param {Object} the parent collectioon of the tile present at dest index
        * @param {Object} Whether the source tile is in the numerator or denominator 
        */
        _executeReposition: function _executeReposition (sourceParentTiles, sourceLocation, destParentTiles, destLocation) {
            var concernedTiles = [],
				index, length; 
            
			this._setOperators(sourceParentTiles, destParentTiles, true);
			
			if(sourceLocation === destLocation) { //TODO: handle nested fractions
                for(index = 0; index<this.numOfTiles; index++) {
					concernedTiles[index] = sourceParentTiles.at(this.sourcePos + index);
					concernedTiles[index].set('operator', '*');
                }
            }
            else {
                for(index = 0; index<this.numOfTiles; index++) {
                    concernedTiles[index] = sourceParentTiles.at(this.sourcePos + index);
					concernedTiles[index].set('operator', '*');
					this._invertLocation(concernedTiles[index]);
				}
            }
            
			sourceParentTiles.remove(concernedTiles);
            
			for(index=0, length = concernedTiles.length; index<length; index++) {
				destParentTiles.add(concernedTiles[index], { at: this.destPos + index });	
			}

			this._setOperators(sourceParentTiles, destParentTiles, false);
			
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
				sourceLocation = sourceObj.isDenominator,
				sourceIndexLength = sourceIndex.length,
				destObj = this.get('destObj'),
                destIndex = destObj.index,
                destIndexLength = destIndex.length,
                destLocation = destObj.isDenominator,
				concernedTiles = [],
                index, sourceParentTiles, destParentTiles;
			
			sourceParentTiles = this._getParentTiles(modelRef, sourceIndex, sourceIndexLength);
			destParentTiles = this._getParentTiles(modelRef, destIndex, destIndexLength);
			
			this._setOperators(sourceParentTiles, destParentTiles, true);
			
			if(sourceLocation === destLocation) { //TODO: handle nested fractions
                for(index = 0; index<this.numOfTiles; index++) {
					concernedTiles[index] = destParentTiles.at(this.destPos + index);
					concernedTiles[index].set('operator', '*');
                }
            }
            else {
                for(index = 0; index<this.numOfTiles; index++) {
                    concernedTiles[index] = destParentTiles.at(this.destPos + index);
					concernedTiles[index].set('operator', '*');
					this._invertLocation(concernedTiles[index]);
				}
            }
			
			destParentTiles.remove(concernedTiles);
            
			for(index=0, length = concernedTiles.length; index<length; index++) {
				sourceParentTiles.add(concernedTiles[index], {at: this.sourcePos + index});
			}
            
			this._setOperators(sourceParentTiles, destParentTiles, false);
        },
		
        /**
        * It negates the exponent in case of it moving from numerator to denominator or vica-versa
        *
        * @method _invertLocation
        * @private
        * @param {Object} The tile of which the exp has to be inverted
        */
		_invertLocation: function _invertLocation (tile) {
			var mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils;
			
			tile.set('exponent', mathUtilClass.invertSign(tile.get('exponent'))); //invert exp
			tile.set('bDenominator', !tile.get('bDenominator'));
		}
    });
})();