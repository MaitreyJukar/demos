(function () {
    'use strict';

    /**
     * Manages undo and redo for different modules.
     *
     * @class UndoManager
     * @constructor
     * @extends Backbone.Model
     * @namespace MathUtilities.Components.Undo.Models
     */
    MathUtilities.Components.Undo.Models.UndoManager = Backbone.Model.extend({

        defaults: {
            /**
             * Maximum number of undos that can be registered in each module
             * 
             * @property maxStackSize
             * @type Number
             * @default 100
             */
            maxStackSize: 100
        },
        /**
         * Contains undo and redo stacks mapped on module names
         * 
         * @property _undoRedoStackMap
         * @type Object
         * @default null
         * @private
         */
        _undoRedoStackMap: null,

        /**
         * Automatically called by backbone.js when UndoManager object is instantiated.
         * 
         * @method initialize
         * @public
         * @param {Number} [maxStackSize] Maximum number of undos that can be registered in each module.
         */
        initialize: function () {
            this._undoRedoStackMap = {};
        },

        _moduleState: {},

        registerModule: function (moduleName) {
            var curModuleStateObj = this._moduleState[moduleName];
            if (curModuleStateObj === undefined) {
                curModuleStateObj = { 
                    isEnabled: true ,
                    lastFocusOn: null
                };
                this._moduleState[moduleName] = curModuleStateObj;
            }
        },

        /**
         * Registers an action for undo/redo
         * 
         * @method registerAction
         * @public
         * @param {String} [moduleName] Name of the module for which the action is being registered
         * @param {Action} [undoAction] Object of Action class containing the data for undo action
         * @param {Action} [redoAction] Object of Action class containing the data for redo action
         */
        registerAction: function registerAction(moduleName, undoAction, redoAction) {
            if (!moduleName || !undoAction || !redoAction) {
                throw new Error('UndoManager: Please provide valid moduleName, undoAction and redoAction');
            }
            
            this.registerModule(moduleName);

            if (!this._isEnabled(moduleName)) {
                return;
            }

            //obtain stack object mapped on moduleName in _undoRedoStackMap
            //stack object contains undo and redo stacks (stack.undo & stack.redo)
            var stack = this._undoRedoStackMap[moduleName],
                actionData = {},
                undoStack;
            //if stack is not mapped, it means its a new module. So create one and map it in _undoRedoStackMap on moduleName
            if (!stack) {
                stack = {};
                stack.undo = [];
                this._undoRedoStackMap[moduleName] = stack;
            }
            //whenever a new action is registered, clear the redo stack
            stack.redo = [];
            undoStack = stack.undo;
            //if undo stack has reached its limit, remove the least recent action entry(0th element of undo stack)
            if (undoStack.length === this.get('maxStackSize')) {
                undoStack.shift();
            }
            //create an object that contains both undo and redo action data, and push it in undo stack
            actionData.undo = undoAction;
            actionData.redo = redoAction;
            undoStack.push(actionData);
            $(this).trigger(MathUtilities.Components.Undo.Models.UndoRedoEvent.ACTION_REGISTERED, {
                moduleName: moduleName
            });
        },

        /**
         * Undo a registered action in a module
         * 
         * @method undo
         * @public
         * @param {String} [moduleName] Name of the module for which the undo action needs to be executed
         */
        undo: function undo(moduleName) {
            var success = this._performUndoRedo(moduleName, 'undo');
            if (success === true) {
                $(this).trigger(MathUtilities.Components.Undo.Models.UndoRedoEvent.ACTION_UNDONE, {
                    moduleName: moduleName
                });
            }
            return success;
        },

        /**
         * Redo an undone action registered in a module
         * 
         * @method redo
         * @public
         * @param {String} [moduleName] Name of the module for which the redo action needs to be executed
         */
        redo: function redo(moduleName) {
            var success = this._performUndoRedo(moduleName, 'redo');
            if (success === true) {
                $(this).trigger(MathUtilities.Components.Undo.Models.UndoRedoEvent.ACTION_REDONE, {
                    moduleName: moduleName
                });
            }
            return success;
        },

        /**
         * Performs undo or redo depending on `actionType`
         * 
         * @method _performUndoRedo
         * @private
         * @param {String} [moduleName] Name of the module for which the undo/redo action needs to be executed
         * @param {String} [actionType] If this param is 'undo' then undo action is performed, for any other value, redo is performed
         * @return {Boolean} If `true` the undo/redo was successful, else `false`.
         */
        _performUndoRedo: function _performUndoRedo(moduleName, actionType) {
            var stack = this._undoRedoStackMap[moduleName], //get stack of the module
                popFrom, pushTo, popStack, actionData;
            if (!stack) {
                return false;
            }
            //if the actionType is 'undo', pop the action entry from undo stack of the module, perform the undo action,
            //and push the action to redo stack
            //else if the actionType is 'redo', do vice versa
            if (actionType === 'undo') {
                popFrom = 'undo';
                pushTo = 'redo';
            } else {
                popFrom = 'redo';
                pushTo = 'undo';
            }
            //get the stack to pop action from
            popStack = stack[popFrom];
            if (popStack.length === 0) {
                return false;
            }
            
            //popped action is stored in actionData which contains data about both undo and redo actions
            actionData = popStack.pop();
            //perform the undo/redo action by calling the 'execute' function of respective manager
            actionData[popFrom].get('manager').execute(actionData[popFrom].get('name'), actionData[popFrom].get('data'), true);

            //push the popped action in pushTo stack
            stack[pushTo].push(actionData);
            return true;
        },

        /**
         * Clears the undo and redo stacks for the given module name
         * 
         * @method clearModule
         * @public
         * @param {String} [moduleName] Name of the module for which the undo/redo record needs to be cleared
         */
        clearModule: function clearModule(moduleName) {
            delete this._undoRedoStackMap[moduleName];
        },

        /**
         * Clears the undo and redo stacks for for all modules
         * 
         * @method clearAll
         * @public 
         */
        clearAll: function clearAll() {
            this._undoRedoStackMap = [];
        },

        /**
         * Returns a boolean indicating wether undo is available or not
         * 
         * @method isUndoAvailable
         * @public
         * @param {String} [moduleName] Name of the module
         * @return {Boolean} `true` if undo is available, else `false`
         */
        isUndoAvailable: function isUndoAvailable(moduleName) {
            var stack = this._undoRedoStackMap[moduleName];
            return Boolean(stack && stack.undo.length > 0);
        },

        /**
         * Returns a boolean indicating wether redo is available or not
         * 
         * @method isRedoAvailable
         * @public
         * @param {String} [moduleName] Name of the module
         * @return {Boolean} `true` if redo is available, else `false`
         */
        isRedoAvailable: function isRedoAvailable(moduleName) {
            var stack = this._undoRedoStackMap[moduleName];
            return Boolean(stack && stack.redo.length > 0);
        },

        setEnabled: function (moduleName, bEnable) {
            var curModuleStateObj = this._moduleState[moduleName];
            if ( curModuleStateObj ) {
                curModuleStateObj.isEnabled= bEnable;
                this._moduleState[moduleName] = curModuleStateObj;
            }
        },

        _isEnabled: function (moduleName) {
            var curModuleStateObj = this._moduleState[moduleName];
            if ( curModuleStateObj ) {
                return curModuleStateObj.isEnabled;
            }

            return false;
        },
    });
})();