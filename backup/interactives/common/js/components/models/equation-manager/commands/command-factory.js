(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager;
    /**
    * CommandFactory is responsible for creation, execution & undo commands.
    * CommandFactory follows the Command Patters and is useful for undoing previously performed commands. It is responsible for executing
    * commands and pushing them to the stack when that particular command needs to be executed. Similarly it pops the command and calls the
    * command object's undo method when the previous operation needs to be undone.
    * @class CommandFactory
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Player.Models.Base
    * @type Object
    * @constructor
    */
    namespace.CommandFactory = MathInteractives.Common.Player.Models.Base.extend({
        defaults: {

            /**
            * Stores a reference to the main interactivity model
            *
            * @attribute modelRef
            * @type Object
            * @default null
            **/
            modelRef: null,
            allowedOperation: null,
            maxPrimeLimit: null,

            /**
            * Stores a reference to the main interactivity model
            *
            * @attribute undoStack
            * @type Array
            * @default null
            **/
            undoStack: null
        },

        /**
        * Initializes the Command Factory model object
        *
        * @method initialize
        **/
        initialize: function () {
            this.set('undoStack', [])
        },

        setData: function (data) {
            this.set('modelRef', data.modelRef);
            this.set('allowedOperation', data.allowedOperation);
            this.set('maxPrimeLimit', data.maxPrimeLimit);
        },

        resetData: function () {
            this.set('modelRef', null);
            this.set('allowedOperation', null);
            this.set('maxPrimeLimit', null);
            this.resetUndoStack();
        },

        resetUndoStack: function resetUndoStack() {
            this.set('undoStack', []);
        },

        fireCommand: function () {

            /* var source, dest, data, repcmd, result, rules, numOfTiles;

             source = new namespace.CommandFactory.TileLocation('0.0');
             dest = new namespace.CommandFactory.TileLocation('0.3', true);
             numOfTiles = 1;
             data = {
                 source: source,
                 dest: dest,
                 numOfTiles: numOfTiles
             };

             rules = new namespace.CommandFactory.Rules(this.get('allowedOperation'), this.get('maxPrimeLimit'));
             repcmd = new namespace.RepositionCommand();
             result = repcmd.execute(rules, this.get('modelRef'), data);
             //repcmd.undo(this.get('modelRef'));*/


            /* BREAK BASE */
            //var source, data, bbcmd, result, rules;

            //source = new namespace.CommandFactory.TileLocation('0.0');
            //data = {
            //	source: source
            //};

            //rules = new namespace.CommandFactory.Rules(this.get('allowedOperation'), this.get('maxPrimeLimit'));
            //bbcmd = new namespace.BreakBaseCommand();
            //result = bbcmd.execute(rules, this.get('modelRef'), data);
            //bbcmd.undo(this.get('modelRef'));


            /**** COMBINE COMMAND ******/
            var source, dest, data, repcmd, result, rules, ccmd;


            source = new namespace.CommandFactory.TileLocation('0.1', true, 3);
            dest = new namespace.CommandFactory.TileLocation('0.0', true, 1);

            data = {
                source: source,
                dest: dest,
            };

            rules = new namespace.CommandFactory.Rules(this.get('allowedOperation'), this.get('maxPrimeLimit'));
            ccmd = new namespace.CombineCommand();
            result = ccmd.execute(rules, this.get('modelRef'), data);
            ccmd.undo(this.get('modelRef'));
        },


        /******* Add Tile Command **********/
        /*var source, data, rules, ccmd;
        source = new namespace.CommandFactory.TileLocation('0.2');
        rules = new namespace.CommandFactory.Rules(this.get('allowedOperation'), this.get('maxPrimeLimit'));
        data = {
            source: source
        };

        ccmd = new namespace.BreakExponentCommand();

        ccmd.execute(rules, this.get('modelRef'), data);

        //ccmd.undo(this.get('modelRef'));
    },*/

        /**
        * Executes the command passed in the param and adds it to the undo stack
        *
        * @method execute
        **/
        execute: function (cmdName, rules, data) {
            var cmdObj = new namespace.CommandFactory.COMMANDTOCLASS[cmdName](),
                EXIT_CODE = namespace.CommandFactory.EXIT_CODE,
                retVal = null;
            if ((retVal = cmdObj.execute(rules, this.get('modelRef'), data)) === EXIT_CODE.SUCCESS) {     // check if command returns false or true. Push only if returns true
                this.get('undoStack').push(cmdObj);
            }
            else {
                return retVal;
            }
            return retVal;
        },

        /**
        * Undos the command passed in the param and adds it to the undo stack
        *
        * @method execute
        **/
        undo: function () {
            var cmdObj = this.get('undoStack').pop();
            if (cmdObj) {
                cmdObj.undo(this.get('modelRef'));
            }
        },

        /**
         * It will return whether break base operation is permitted depending upon the rules
         * @returns {Boolean} whether allowed or not
         *
         * @method getIfOperationAllowed
         */
        getIfOperationAllowed: function getIfOperationAllowed () {
            var baseClass = namespace.EquationComponent.Operations;
            if((this.get('allowedOperation') & baseClass.BREAK_BASE_EXP_1) !== baseClass.BREAK_BASE_EXP_1) {
                return false;
            }
            return true;
        }
    },
    {
        SEPARATOR: '.',     // Separator used in the index string in TileLocation. eg. "0.1.2.2"
        COMMANDS: {
            REPOSITION: 'REPOSITION_COMMAND',
            COMBINE: 'COMBINE_COMMAND',
            BREAK_BASE: 'BREAK_BASE_COMMAND',
            BREAK_EXPONENT: 'BREAK_EXPONENT_COMMAND',
            ADD_TILE: 'ADD_TILE_COMMAND',
            DELETE_TILE: 'DELETE_TILE_COMMAND',
            REPLACE_TILE: 'REPLACE_TILE_COMMAND',
            SWAP_TILE: 'SWAP_TILE_COMMAND',
            BUILD_REPOSITION_INDIVIDUAL_TILE: 'BUILD_REPOSITION_INDIVIDUAL_TILE_COMMAND',
            BUILD_REPOSITION: 'BUILD_REPOSITION_COMMAND',
            SHIFT_PARENTHESES: 'SHIFT_PARENTHESES_COMMAND',
            APPLY_EXPONENT: 'APPLY_EXPONENT_COMMAND',
            CHANGE_SIGN: 'CHANGE_SIGN_COMMAND'
        },

        COMMANDTOCLASS: {
            REPOSITION_COMMAND: namespace.RepositionCommand,  // Move
            COMBINE_COMMAND: namespace.CombineCommand,        // Combine or Cancel
            BREAK_BASE_COMMAND: namespace.BreakBaseCommand,
            BREAK_EXPONENT_COMMAND: namespace.BreakExponentCommand,
            ADD_TILE_COMMAND: namespace.AddTileCommand,
            DELETE_TILE_COMMAND: namespace.DeleteTileCommand,
            REPLACE_TILE_COMMAND: namespace.ReplaceTileCommand,
            SWAP_TILE_COMMAND: namespace.SwapTileCommand,
            BUILD_REPOSITION_INDIVIDUAL_TILE_COMMAND: namespace.BuildRepositionIndividualTileCommand,
            BUILD_REPOSITION_COMMAND: namespace.BuildRepositionCommand,
            SHIFT_PARENTHESES_COMMAND: namespace.ShiftParenthesesCommand,
            APPLY_EXPONENT_COMMAND: namespace.ApplyExponentCommand,
            CHANGE_SIGN_COMMAND: namespace.ChangeSignCommand
        },

        EXIT_CODE: {
            FAILURE: 0,
            SUCCESS: 1,
            OUT_OF_RANGE_EXPONENT: 2,
            NO_OPERATION: 3,
            NOT_SAME_PARENT_COMBINE: 4,
            TILE_VALUE_EXCEEDING_COMBINE: 5,
            BASE_VALUE_EXCEEDING_COMBINE: 6,
            INVALID_COMBINE_WITH_MARQUEE: 7
        },

        Rules: function (allowedOperation, limit) {
            this.allowedOperation = allowedOperation;
            this.primeNumberLimit = limit;
        },

        TileLocation: function (index, isDenominator, numOfTiles) {
            this.index = index;
            this.numOfTiles = numOfTiles;
            this.isDenominator = isDenominator;
        },

        EVENTS: {
            'BIG_PARENTHESIS_ADDED': 'big-parenthesis-added',
            'BIG_PARENTHESIS_REMOVED': 'big-parenthesis-removed'
        }
    });
})();
