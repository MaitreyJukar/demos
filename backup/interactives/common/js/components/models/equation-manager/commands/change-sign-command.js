(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Changes the sign of a fraction tile item. It moves the numerator to the denominator
    * and the denominator to the numerator
    * @class ChangeSignCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.ChangeSignCommand = namespace.BaseCommand.extend({

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
        * Source TileLocation object
        * @attribute source
        * @type Object
        * @default null
        **/
        source: null,

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
            var EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE;
            this._execute(modelRef);
            
            return EXIT_CODE.SUCCESS;
        },

        /**
        * Undoes the command according to the data passed
        *
        * @method undo
        */
        undo: function (modelRef) {
            this._execute(modelRef);
        },

        /**
        * Inverts the sign of all tiles at the first level. It inverts the 
        * bDenominator and the exponent.
        * @method invert
        * @param {Object} Tile on which change sign is called
        */
        invert: function (tile) {
            tile.invertChildBDenominator();
            tile.invertExponentNonRecursive();
        },

        /**
        * Internal execute method that performs the actual handling of change sign.
        * @method _execute
        * @private
        * @param {Object} Equation model
        */
        _execute: function (modelRef) {
            var tile = modelRef.getItemFromIndex(this.source.index),
                fraction = tile.at(0),
                numerators = [],
                denominators = [],
                tiles = fraction.get('tileArray').models.slice(0);

            numerators = fraction.where({ bDenominator: false });
            denominators = fraction.where({ bDenominator: true });

            this.invert(tile);
            
            // this is required because the view listens only for add and remove events
            // so for it to know that the bDenominator has changed we need to remove all
            // tiles and add them again
            // adding denominators again also changes the order properly
            fraction.remove(tiles);
            fraction.addMultiple(denominators, 0);
            fraction.addMultiple(numerators, denominators.length);

            this._handleEmptyNumerator(fraction);
            this._handleOneDenominator(fraction);
        },

        /**
        * Handle the case when there is an empty numerator, in which case it adds 
        * an single tile with base = 1 and which is not draggable nor droppable.
        * Also handle undo and if there is a stored this.oneTile then remove it.
        * @method _handleEmptyNumerator
        * @private
        * @param {Object} Fraction tile on which change sign is called.
        */
        _handleEmptyNumerator: function (fraction) {
            var createTileItem = modelClassNameSpace.TileItem.createTileItem,
                TYPES = modelClassNameSpace.TileItem.BinTileType;

            if (this.oneTile) {
                fraction.remove(this.oneTile);
                return;
            }

            if (fraction.isNumeratorEmpty()) {
                this.oneTile = createTileItem({
                    type: TYPES.BASE_ONLY,
                    isDraggable: false,
                    isDroppable: false,
                    base: 1,
                    ignoreMarquee: true
                });
                fraction.add(this.oneTile, { at: 0 });
            }
        },

        /**
        * Handle the case when there is a static one tile in the denominator. In that case
        * it should be removed since there is no need to show it in  the denominator. Also
        * handle undo i.e. if a one tile was removed, then restore it later.
        * @method _handleOneDenominator
        * @private
        * @param {Object} Fraction tile on which change sign is called.
        */
        _handleOneDenominator: function (fraction) {
            var tiles = fraction.get('tileArray'),
                denominators = fraction.where({ bDenominator: true });

            if (this.denominatorOne) {
                fraction.remove(this.denominatorOne);
                return;
            }

            if (denominators.length === 1 && denominators[0].isOne()) {
                this.denominatorOne = denominators[0];
                fraction.remove(this.denominatorOne);
            }
        }
    });

})();