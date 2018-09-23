(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManagerPro;
    /**
    * CommandFactory is responsible for creation, execution & undo commands.
    * CommandFactory follows the Command Patters and is useful for undoing previously performed commands. It is responsible for executing
    * commands and pushing them to the stack when that particular command needs to be executed. Similarly it pops the command and calls the
    * command object's undo method when the previous operation needs to be undone.
    * @class CommandFactory
    * @module EquationManagerPro
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
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

            /**
            * Either operation is valid or not
            *
            * @attribute allowedOperation
            * @type Number
            * @default null
            **/
            allowedOperation: null,

            /**
            * Stores an array of operations performed
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
            this.set('undoStack', []);

        },

        /**
        * Resets undo stack
        *
        * @method resetUndoStack
        * @public
        **/
        resetUndoStack: function resetUndoStack() {
            this.set('undoStack', []);
        },

        /**
        * sets a data from equation manager
        *
        * @method setData
        * @public
        **/
        setData: function (data) {
            this.set('modelRef', data.modelRef);
            this.set('allowedOperation', data.allowedOperation);
        },
        /**
        * Resets a data from equation manager
        *
        * @method resetData
        * @public
        **/
        resetData: function () {
            this.set('modelRef', null);
            this.set('allowedOperation', null);
            this.resetUndoStack();
        },

        //only for testing purpose till view does not get created.
        fireCommand: function (index1, index2) {
            var source, dest, data, repcmd, result, rules, ccmd;

            source = new namespace.CommandFactory.TileLocation(index1 || '1.1', 1);
            dest = new namespace.CommandFactory.TileLocation(index2 || '1.2', 1);

            data = {
                source: source,
                dest: dest,
                root: this.get('modelRef').getTree()
            };

            rules = new namespace.CommandFactory.Rules(this.get('allowedOperation'));
            ccmd = new namespace.CombineCommand();
            result = ccmd.execute(rules, this.get('modelRef'), data);
            //ccmd.undo(this.get('modelRef'));
        },
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
                if (cmdObj.isDummyCommand) {
                    this.undo();
                }
            }
        },

    },
    {
        SEPARATOR: '.',     // Separator used in the index string in TileLocation. eg. "0.1.2.2"
        COMMANDS: {
            COMBINE: 'COMBINE_COMMAND',
            BREAK_BASE: 'BREAK_BASE',
            REPOSITION_COMMAND: 'REPOSITION_COMMAND',
            TAKE_OUT_COMMON_COMMAND: 'TAKE_OUT_COMMON_COMMAND',
            CHECK_PARENTHESES_RULES: 'CHECK_PARENTHESES_RULES',
            CHECK_FRACTION_RULES: 'CHECK_FRACTION_RULES',
            PARENTHESES_EXPONENT_CLICK: 'PARENTHESES_EXPONENT_CLICK',
            ADD_TILE: 'ADD_TILE',
            REPLACE_TILE: 'REPLACE_TILE'
        },

        COMMANDTOCLASS: {
            COMBINE_COMMAND: namespace.CombineCommand,
            BREAK_BASE: namespace.BreakBase,
            REPOSITION_COMMAND: namespace.RepositionCommand,
            TAKE_OUT_COMMON_COMMAND: namespace.TakeOutCommonCommand,
            CHECK_PARENTHESES_RULES: namespace.CheckParenthesesRules,
            CHECK_FRACTION_RULES: namespace.CheckFractionRules,
            PARENTHESES_EXPONENT_CLICK: namespace.ParenthesesExpClick,
            ADD_TILE: namespace.AddTile,
            REPLACE_TILE: namespace.ReplaceTile
        },

        EXIT_CODE: {
            FAILURE: false,
            SUCCESS: true,
            NOT_LIKE_TERMS: 2,
            SIMPLIFY_TERMS_FIRST: 3,
            SIMPLIFY_IMAGINARY_NUMBER: 4,
            NOT_DISTRIBUTIVE: 5,
            PARENTHESES_EXPONENT_PRESENT: 6,
            SIMPLIFY_TERM_TAKE_COMMON: 7,
            BREAK_IMAGINARY_NUMBER: 8,
            MINUS_ONE_COMMON_OUT: 9,
            NEGATIVE_NUMBER_COMMON_OUT: 10,
            ROOT_MAGNITUDE: 11,
            FACTOR_ONE_FROM_PARANTHESES: 12,
            MAX_VALUE_REACHED: 13,
            DIVIDE_ON_OTHER_SIDE: 14,
            APPLY_COEFFECIENTS: 15
        },
        Rules: function (allowedOperation, isIotaAllowed, fractionToDecimalAllowed) {
            this.allowedOperation = allowedOperation;
            this.isIotaAllowed = isIotaAllowed === true ? isIotaAllowed : false;
            this.fractionToDecimalAllowed = fractionToDecimalAllowed === true ? fractionToDecimalAllowed : false;
        },

        TileLocation: function (index, numOfTiles) {
            this.index = index;
            this.numOfTiles = numOfTiles;
        }
    });
})();
