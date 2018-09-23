(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Replaces a tile in build mode.
    * @class ShiftParenthesesCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.ShiftParenthesesCommand = namespace.BaseCommand.extend({
        /**
        * Defaults values for the model attributes
        *
        * @attribute defaults
        * @type Object
        * @default {}
        **/
        defaults: {

        },

        _commandStack : [],

        /**
        * Initializes the Break exponent command
        *
        * @method initialize
        */
        initialize: function () {
        },

        /**
        * Executes the break exponent command
        *
        * @method execute
        */
        execute: function (rules, modelRef, data) {
            var addParensCommand = new namespace.CommandFactory.COMMANDTOCLASS['ADD_TILE_COMMAND'](),
                deleteParensCommand = new namespace.CommandFactory.COMMANDTOCLASS['DELETE_TILE_COMMAND'](),
                parensTile = modelRef.getItemFromIndex(data.source.index),
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                coefficient = parensTile.get('coefficient'),
                deletePos = data.source,
                addPos = data.dest;
            data.type = namespace.TileItem.BinTileType.PARENTHESIS;

            data.source = addPos;
            data.coefficient = coefficient;
            if (addParensCommand.execute(rules, modelRef, data)) {
                this._commandStack.push(addParensCommand);
            } else { return EXIT_CODE.FAILURE; }

            data.source = deletePos;
            if (deleteParensCommand.execute(rules, modelRef, data)) {
                this._commandStack.push(deleteParensCommand);
            } else { return EXIT_CODE.FAILURE; }
            
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


    });

})();