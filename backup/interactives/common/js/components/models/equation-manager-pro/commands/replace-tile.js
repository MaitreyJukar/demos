(function (MathInteractives) {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro,
        utilityMethods = modelClassNameSpace.EquationManagerPro.Utils;

    /**
    * Replaces a tile in build mode.
    * @class ReplaceTileCommand
    * @module EquationManagerPro
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.BaseCommand
    * @type Object
    * @constructor
    */
    modelClassNameSpace.ReplaceTile = modelClassNameSpace.BaseCommand.extend({

        /**
		* Stores the deleted tile, the one to be replaced
		*
		* @attribute tileToReplace
		* @type Object
		* @default null
		**/
        tileToReplace: null,

        /**
		* Stores the position/index of the target.
		*
		* @attribute sourceIndex
		* @type String
		* @default null
		**/
        sourceIndex: null,

        /**
		* Stores the relative position of the target tile wrt to its parent.
		*
		* @attribute sourcePos
		* @type Number
		* @default null
		**/
        sourcePos: null,

        /**
         * Initializes
         * @method initialize
         * @public
         *
         */
        initialize: function () {
        },

        /**
         * execute's the replace command
         * @method execute
         * @public
         *
         * @param   {Object}  rules    The rules to be followed during the operation
         * @param   {Object}  modelRef The model of equation
         * @param   {Object}  data     The data given to perform the operaton.
         * @returns {Boolean} The success of the command.
         */
        execute: function (rules, modelRef, data) {
            var sourceIndex = data.source.index,
                sourceParent, sourceParentTiles,
                base = data.tileValue,
                cloned, refTile;

            this.sourceIndex = sourceIndex;
            this.sourcePos = parseInt(utilityMethods.getSourceWrtParent(sourceIndex));

            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            sourceParentTiles = sourceParent.get('tileArray');

            refTile = sourceParentTiles.at(this.sourcePos);
            //replace only if the base null.
            if(refTile.get('base') !== null) {
                return false;
            }

            this.tileToReplace = refTile;
            cloned = refTile.deepClone();
            cloned.set('base', base);
            cloned.set('tileToReplace', null);

            sourceParentTiles.remove(refTile);
            sourceParentTiles.add(cloned, {at: this.sourcePos});
            return true;
        },

        /**
         * undo s the replace tile commmand
         * @method undo
         * @public
         *
         * @param {Object} modelRef The equation model.
         */
        undo: function (modelRef) {
            var sourceIndex = this.sourceIndex,
                sourceParentTiles;

            sourceParentTiles = utilityMethods.getParentTiles(modelRef, sourceIndex);
            sourceParentTiles.remove(sourceParentTiles.at(this.sourcePos));
            sourceParentTiles.add(this.tileToReplace, {at: this.sourcePos});
        }
    });

})(window.MathInteractives);
