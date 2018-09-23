(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;
        

    /**
    * Adds a new tile to the workspace
    * @class AddTileCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.AddTileCommand = namespace.BaseCommand.extend({

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
        * BASE of the added tile
        * @attribute base
        * @type Number
        * @default null
        **/
        base: null,

        /**
        * Denotes whether the added tile is added on the left of a tile
        * @attribute isLeft
        * @type Boolean
        * @default null
        **/
        isLeft: null,

        /**
        * EXPONENT of the added tile
        * @attribute exponent
        * @type Number
        * @default null
        **/
        exponent: null,

        /**
        * Type of the added tile
        * @attribute type
        * @type Number
        * @default null
        **/
        type: null,

        /**
        * Operator of the added tile
        * @attribute operator
        * @type String
        * @default null
        **/
        operator: null,

        /**
        * Number of tiles added. It equals the number of tiles in marquee in case of adding Parentheses over selected tiles
        * @attribute numOfTiles
        * @type Number
        * @default 1
        **/
        numOfTiles: 1,

        /**
        * Source TileLocation object
        * @attribute source
        * @type Object
        * @default null
        **/
        source: null,

        /**
        * Coefficient of the added tile. Only for Parenthesis.
        * @attribute coefficient
        * @type Number
        * @default null
        **/
        coefficient: null,

        /**
        * Tile added. Useful for undo.
        * @attribute addedTile
        * @type Object
        * @default null
        **/
        addedTile: null,

        /**
        * Parent of the tile added. Useful for undo.
        * @attribute parentTile
        * @type Object
        * @default null
        **/
        parentTile: null,



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
            this.base = data.base;
            this.isLeft = data.isLeft;
            this.exponent = data.exponent;
            this.type = data.type;
            this.operator = data.operator;
            this.source = data.source;
            this.coefficient = data.coefficient;
            this.numOfTiles = data.source.numOfTiles || 1;
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
            var type = this.type,
                base = this.base,
                exponent = this.exponent,
                dispenserTypes = modelClassNameSpace.TileItem.BinTileType,
                tile = null,
                nextTile = null,
                isLeft = this.isLeft,
                createTileItem = modelClassNameSpace.TileItem.createTileItem,
                newTileType = null,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                sourceIndexStr = this.source.index,
                sourceWrtParent = this.getSourceWrtParent(sourceIndexStr),
                parentTile = modelRef.getItemFromIndex(this.getParentIndex(sourceIndexStr)),
                sourceTile = parentTile.getItemFromIndex(sourceWrtParent),
                isDenominator = sourceTile.get('bDenominator'),
                operator = this.operator;

            sourceWrtParent = parseInt(sourceWrtParent, 10);


            // for exponent or base, just create a new tile and add it to the location
            if (type === dispenserTypes.EXPONENT || type === dispenserTypes.BASE || type === dispenserTypes.BASE_ONLY) {

                // if added on right then insert at next index
                if (!isLeft) { sourceWrtParent++; }

                switch (type) {
                    case dispenserTypes.BASE_ONLY:
                        newTileType = dispenserTypes.BASE_ONLY;
                        break;
                    default:
                        newTileType = dispenserTypes.BASE_EXPONENT;
                        break;
                }


                tile = createTileItem({
                    exponent: exponent,
                    base: base,
                    bDenominator: isDenominator,
                    type: newTileType
                })

                // add left operator. no left operator if 1st elem
                // TODO parseInt sourceWrtParent
                parentTile.get('tileArray').add(tile, { at: sourceWrtParent });
                if (!isLeft) {
                    if (sourceWrtParent !== 0) { tile.set('operator', operator); }
                } else {
                    nextTile = parentTile.at(sourceWrtParent + 1);
                    tile.set('operator', nextTile.get('operator'));
                    nextTile.set('operator', operator);
                }
                this.addedTile = tile;
            }
            else if (type === dispenserTypes.PARENTHESIS || type === dispenserTypes.BIG_PARENTHESIS) {           // PARENTHESES tile
                data.sourceTile = sourceTile;
                data.parentTile = parentTile;
                data.sourceWrtParent = sourceWrtParent;
                data.rules = rules;
                this._handleParenthesis(type, data);
            }
            
            // Save this for undo
            this.parentTile = parentTile;
            return EXIT_CODE.SUCCESS;

        },

        /**
        * Undoes the command according to the data passed
        *
        * @method undo
        */
        undo: function (modelRef) {
            var type = this.type,
               dispenserTypes = modelClassNameSpace.TileItem.BinTileType,
               sourceWrtParent = parseInt(this.getSourceWrtParent(this.source.index), 10),
               parentTile = this.parentTile,
               addedTile = this.addedTile,
               EVENTS = modelClassNameSpace.CommandFactory.EVENTS,
               innerTiles = null;

            if (type === dispenserTypes.EXPONENT || type === dispenserTypes.BASE) {
                parentTile.remove(addedTile);
                this._setFirstTileOperator(parentTile);
            } else {
                innerTiles = addedTile.get('tileArray').models;
                parentTile.remove(addedTile);
                parentTile.addMultiple(innerTiles, sourceWrtParent);
                innerTiles[0].set('operator', this.operator);

                if (type === dispenserTypes.BIG_PARENTHESIS) { modelRef.trigger(EVENTS.BIG_PARENTHESIS_REMOVED); }
            }
        },

        /**
        * Sets the first operator of the denominator and the numerator to null
        *
        * @method _setFirstTileOperator
        * @param {Object} Parent whose first operators should be set to null
        */
        _setFirstTileOperator: function (parent) {
            var firstNum = parent.at(0),
                firstDen = parent.getFirstDenominatorTile();
            firstNum.set('operator', null);
            if (firstDen) { firstDen.set('operator', null); }
        },

        /**
        * Handles the case when a Parenthesis or Big Parenthesis is added.
        * @method _handleParenthesis
        * @private
        * @param {String} Type of the parenthesis
        * @param {Object} Data object passed to the command
        */
        _handleParenthesis: function (type, data) {
            var i = 0,
                tilesToAdd = [],
                operator = this.operator,
                sourceTile = data.sourceTile,
                tile = null,
                parentTile = data.parentTile,
                givenOperation = data.rules.allowedOperation,
                OPERATION = modelClassNameSpace.EquationComponent.Operations,
                isDenominator = sourceTile.get('bDenominator'),
                dispenserTypes = modelClassNameSpace.TileItem.BinTileType,
                createTileItem = modelClassNameSpace.TileItem.createTileItem,
                sourceWrtParent = data.sourceWrtParent;

            for (i = 0; i < this.numOfTiles; i++) {
                tilesToAdd.push(parentTile.at(sourceWrtParent + i));
            }
            operator = sourceTile.get('operator');
            sourceTile.set('operator', null);                         // once sourcetile is moved in parens it'll always be 1st tile. so remove operator
            
            tile = createTileItem({
                bDenominator: isDenominator,
                type: type
            });
            
            tile.set('coefficient', this.coefficient);
            tile.set('operator', operator);
            tile.set('bDenominator', isDenominator);
            if ((givenOperation & OPERATION.PARENTHESIS_EXP_ALL) === 0) {
                tile.set('exponent', 1)
            }
            this.operator = operator;
            parentTile.get('tileArray').remove(tilesToAdd);           // remove original tile from array
            tile.get('tileArray').add(tilesToAdd);
            parentTile.get('tileArray').add(tile, { at: sourceWrtParent });        // insert newly created parens tile
            this.addedTile = tile;
        }
    });

})();
