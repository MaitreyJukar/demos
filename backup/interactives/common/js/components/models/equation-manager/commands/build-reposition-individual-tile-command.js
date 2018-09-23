(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Replaces a tile in build mode.
    * @class BuildRepositionIndividualTileCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.BuildRepositionIndividualTileCommand = namespace.BaseCommand.extend({
        /**
        * Defaults values for the model attributes
        *
        * @attribute defaults
        * @type Object
        * @default {}
        **/
        defaults: {

        },

        _commandStack: [],

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
            this.source = data.source;
            this.dest = data.dest;
            this.type = data.type;
            this.operator = data.operator;
            this.isLeft = data.isLeft;
            this.sourcePos = parseInt(this.getSourceWrtParent(this.source.index), 10)
        },

        /**
        * Executes the break exponent command. The data must always contain dest isDenominator
        * and the source isDenominator.
        *
        * @method execute
        */
        execute: function (rules, modelRef, data) {
            var sourceIndexStr = data.source.index,
                destIndexStr = data.dest.index,
                binTypes = modelClassNameSpace.TileItem.BinTileType,
                addTileCommand = new namespace.CommandFactory.COMMANDTOCLASS['ADD_TILE_COMMAND'](),
                deleteTileCommand = new namespace.CommandFactory.COMMANDTOCLASS['DELETE_TILE_COMMAND'](),
                sourceTile = modelRef.getItemFromIndex(sourceIndexStr),
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                sourceParent = modelRef.getItemFromIndex(this.getParentIndex(sourceIndexStr)),
                destParent = modelRef.getItemFromIndex(this.getParentIndex(destIndexStr)),
                deletePosIndex = data.source.index,
                exitCode = null,
                addPos = data.dest;

            switch (data.type) {
                case binTypes.BASE:
                    data.base = sourceTile.get('base');
                    break;
                case binTypes.EXPONENT:
                    data.exponent = sourceTile.get('exponent');
                    break;
                default:
                    console.log('something went wrong');
                    break;
            }

            if (this._handleNoOperation(modelRef, data, sourceParent, destParent) === EXIT_CODE.FAILURE) {
                return EXIT_CODE.FAILURE
            }

            data.source = addPos;
            if ((exitCode = addTileCommand.execute(rules, modelRef, data)) === EXIT_CODE.SUCCESS) {
                this._commandStack.push(addTileCommand);
            } else { return exitCode; }

            deletePosIndex = modelRef.getIndexFromItem(sourceTile);

            data.source.index = deletePosIndex;
            if ((exitCode = deleteTileCommand.execute(rules, modelRef, data)) === EXIT_CODE.SUCCESS) {
                this._commandStack.push(deleteTileCommand);
            } else { return exitCode; }

            return EXIT_CODE.SUCCESS;
        },

        /**
        * Undos the last replace operation
        *
        * @method undo
        * @return {Object} Copy of ...
        */
        undo: function (modelRef) {
            this._commandStack.pop().undo(modelRef);
            this._commandStack.pop().undo(modelRef);
        },

        /**
        * Check if there is no physical change after the reposition. If there is no change then 
        * return FAILURE. Otherwise return nothing.
        * @method _handleNoOperation
        * @private
        * @param {Object} Equation model
        * @param {Object} Data sent to the command
        * @param {Object} Parent of the source tile
        * @param {Object} Parent of the destination tile
        * @return {Number} Return a FAILURE exit code if no operation should be performed. Return nothing otherwise.
        */
        _handleNoOperation: function (modelRef, data, sourceParent, destParent) {
            var sourceIndexStr = data.source.index,
                destIndexStr = data.dest.index,
                sourceLoc = data.source.isDenominator,
                destLoc = data.dest.isDenominator,
                sourceTile = modelRef.getItemFromIndex(sourceIndexStr),
                sourcePos = parseInt(this.getSourceWrtParent(sourceIndexStr), 10),
                destPos = parseInt(this.getSourceWrtParent(destIndexStr), 10),
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                isLeft = data.isLeft,
                TYPES = modelClassNameSpace.TileItem.BinTileType;
            if (data.base && _.isNumber(sourceTile.get('exponent')) ||
                data.exponent && _.isNumber(sourceTile.get('base'))) {
                return;
            }

            if (sourceParent !== destParent) { return; }

            if (destLoc !== sourceLoc) { return; }

            if (destPos === sourcePos - 1 && !isLeft ||
                destPos === sourcePos && sourceTile.get('type') === TYPES.BASE_EXPONENT ||
                destPos === sourcePos + 1 && isLeft) {
                return EXIT_CODE.FAILURE;
            }
        }
    });

})();