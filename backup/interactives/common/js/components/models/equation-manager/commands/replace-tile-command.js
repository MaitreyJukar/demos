(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Replaces a tile in build mode.
    * @class ReplaceTileCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.ReplaceTileCommand = namespace.BaseCommand.extend({
        /**
        * Defaults values for the model attributes
        *
        * @attribute defaults
        * @type Object
        * @default {}
        **/
        defaults: {

        },

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
            this.base = data.base || null;
            this.exponent = data.exponent || null;
            this.type = data.type;
            this.source = data.source;
            return this;
        },

        /**
        * Executes the break exponent command
        *
        * @method execute
        */
        execute: function (rules, modelRef, data) {
            // store data in model instance attrs
            this._initializeInstanceAttributes(data);
            this._setAllowedExponents(rules);

            var type = this.type,
                base = this.base,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                TYPES = modelClassNameSpace.TileItem.SolveTileType,
                exponent = this.exponent,
                // two enums are named almost similarly and are ambiguously named.
                // dispenserTypes: base, exponent or parentheses
                // tileItemTypes : base-exponent, parentheses or fraction
                dispenserTypes = modelClassNameSpace.TileItem.BinTileType,
                tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
                index = this.source.index,
                tile = modelRef.getItemFromIndex(index);

            switch (type) {
                case dispenserTypes.EXPONENT:
                    this.oldExponent = tile.get('exponent');
                    if ((tile.get('type') === TYPES.PARENTHESIS || tile.get('type') === TYPES.BIG_PARENTHESIS)
                        && this.allowedExponents.indexOf(exponent) === -1) {
                        return EXIT_CODE.OUT_OF_RANGE_EXPONENT;
                    }

                    if (this.oldExponent === exponent) {
                        return EXIT_CODE.NO_OPERATION;
                    }
                    tile.set('exponent', exponent);
                    break;
                case dispenserTypes.BASE:
                    this.oldBase = tile.get('base');
                    if (this.oldBase === base) {
                        return EXIT_CODE.NO_OPERATION;
                    }
                    tile.set('base', base);
                    break;
            };

            this.tile = tile;
            return EXIT_CODE.SUCCESS;
        },

        /**
        * Undos the last replace operation
        *
        * @method undo
        */
        undo: function (modelRef) {
            var dispenserTypes = modelClassNameSpace.TileItem.BinTileType,
                tile = this.tile;

            switch (this.type) {
                case dispenserTypes.EXPONENT:
                    tile.set('exponent', this.oldExponent);
                    break;
                case dispenserTypes.BASE:
                    tile.set('base', this.oldBase);
                    break;
            }
            return true;

        },

        /**
        * Sets the allowed exponents for parens exponent based on Allowed operations.
        * @method _setAllowedExponents
        * @private
        * @param {Object} Rules for command. Containe allowedOperations
        */
        _setAllowedExponents: function (rules) {
            var OPERATION = modelClassNameSpace.EquationComponent.Operations;
            if ((rules.allowedOperation & OPERATION.PARENTHESIS_EXP_ALL) === 0) {
                this.allowedExponents = [1];
            } else {
                this.allowedExponents = [-3, -2, -1, 0, 1, 2, 3, null];
            }
        }
    });

})();