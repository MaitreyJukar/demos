(function () {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Tile Item holds the data for the tile Item View
    * ParenthesisTile holds data for any parethesis item
    *
    * @class TileItem
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Models.Base
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    */
    modelClassNameSpace.TileItem = MathInteractives.Common.Player.Models.Base.extend({
        defaults: {
            /**
            * Stores the value of the base
            *
            * @attribute base
            * @type Number
            * @default null
            **/
            base: null,

            /**
            * Stores the value of the exponent
            *
            * @attribute exponent
            * @type Number
            * @default null
            **/
            exponent: null,

            /**
            * Left operator of the tile.
            * e.g. for 2^3*(8^2*5^4) for the tile 5^4 operator is '*'
            * It is null for tiles that are the first elems in the parent tile
            *
            * @attribute operator
            * @type String
            * @default null
            **/
            operator: null,

            /**
            * Coefficient of tile
            * e.g. BASE can have a coefficient
            * When there is no coefficient default is null
            *
            * @attribute coefficient
            * @type String
            * @default null
            **/
            coefficient: null,
            /**
            * Stores an array of tiles
            *
            * @attribute tileArray
            * @type Array
            * @default null
            **/
            tileArray: null,

            strDroppables: '*',

            /**
            * Stores whether term is in the numerator or deniminator
            *
            * @attribute bDenominator
            * @Boolean
            * @default false
            **/
            bDenominator: false,


            /**
            * Stores the type of the tile: fraction, parenthesis, base-exp
            *
            * @attribute type
            * @type Number
            * @default null
            **/
            type: null,

            /**
            * Expression tree representing the expression stored in the tile item
            *
            * @attribute exprTree
            * @type Object
            * @default null
            **/
            exprTree: null
        },

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
        },

        /**
        * Get child item from index
        * @method getItemFromIndex
        * @param index {String} index of an item.
        * @return {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Models.TileItem}
        */
        getItemFromIndex: function (index) {
            throw new Error('Not implemented getItemFromIndex');
        },


        getIndexOfItem: function getIndexOfItem(point) {
            var counter = 0,
                tileArr = this.get('tileArray');
            for (; counter < tileArr.length; counter++) {
                if (point.getLeft() > tileArr.models[counter].get('rectTerm').getLeft()) {
                    return this.get('tileArray').at(counter).getIndexOfItem();
                }
                else {
                    return this;
                }
            }
            return null;
        },
        /**
        * Performs a deep copy and returns a clone of this object.
        *
        * @method deepClone
        * @return {Object} Deep copied clone of this object
        */
        deepClone: function () {
            // clones
            // exponent, type, base
            // but tileArray needs to be deep copied
            var clonedObj = this.clone(),
                i = null,
                tileArray = this.get('tileArray'),
                newTileArray = new Backbone.Collection(),
                newTile = null;

            // if tileArray is non-empty
            if (tileArray && tileArray.length > 0) {
                // iterate over tileArray and call each object's deepClone method
                for (i = 0; i < tileArray.length; i++) {
                    newTile = tileArray.at(i).deepClone();
                    newTileArray.add(newTile);
                }

                clonedObj.set('tileArray', newTileArray);
            }

            return clonedObj;
        },

        /**
         * Returns all bases present in the equation view
         * @returns {Array} An array consisting of all the bases
         *
         * @method getAllBases
         */
        getAllBases: function getAllBases() {
            var baseArray = [],
                parNumArray = [],
                parDenArray = [],
                tileArr = this.get('tileArray'),
                index, j, result = [], currentTile;

            for (index = 0; index < tileArr.length; index++) {
                currentTile = tileArr.at(index);
                result = currentTile.getAllBases();

                if (result !== undefined) {
                    for (j = 0; j < result.length; j++) {
                        if (result[j] !== undefined) {
                            baseArray.push(result[j]);
                        }
                    }
                }
            }
            return baseArray;
        },

        /**
         * Gets all the base locations whether in the numerator or denominaor
         * @returns {Array} Consisting od all base locations
         *
         * @mrthod getAllBaseLocations
         */
        getAllBaseLocations: function getAllBaseLocations() {
            var index,
                tileArray = this.get('tileArray'),
                locationArray = [],
                tileTypes = modelClassNameSpace.TileItem.SolveTileType,
                currentType, currentTile, base, exponent, location;

            for (index = 0; index < tileArray.length; index++) {
                currentTile = tileArray.at(index);
                currentType = currentTile.get('type');
                if ( currentType !== tileTypes.BASE_EXPONENT && currentType !== tileTypes.BASE_ONLY) {
                    locationArray = locationArray.concat(currentTile.getAllBaseLocations());
                }
                else {
                    base = currentTile.get('base');
                    exponent = currentTile.get('exponent');
                    location = currentTile.get('bDenominator');
                    if (base === null && exponent === null) {
                        if (location === false) {
                            locationArray.push(1);
                        }
                        else {
                            locationArray.push(-1);
                        }
                    }
                    else if (base !== null) {
                        locationArray.push(location);
                    }
                    else if (exponent !== null) {
                        locationArray.push(location);
                    }
                }
            }
            return locationArray;
        },

        /**
         * Gets all base located at the given location
         * @param   {Boolean} tileLocation Indicating either the numerator or denominator
         * @returns {Array}   Consisting of all other bases at the given location
         *
         * @method getBasesAtGivenLocation
         */
        getBasesAtGivenLocation: function getBasesAtGivenLocation (tileLocation) {
            var index,
                tileArray = this.get('tileArray'),
                locationArray = [],
                tileTypes = modelClassNameSpace.TileItem.SolveTileType,
                currentType, currentTile, location;

            for (index = 0; index < tileArray.length; index++) {
                currentTile = tileArray.at(index);
                currentType = currentTile.get('type');
                if ( currentType !== tileTypes.BASE_EXPONENT && currentType !== tileTypes.BASE_ONLY) {
                    locationArray = locationArray.concat(currentTile.getBasesAtGivenLocation(tileLocation));
                }
                else {
                    location = currentTile.get('bDenominator');

                    if (location === tileLocation) {
                        locationArray.push(location);
                    }
                }
            }
            return locationArray;
        },

        /**
         * It checks how many terms do not have a null base or a null exp
         * @returns {Array} The array consisting of all the complete tiles
         *
         * @method getTileStatus
         */
        getTileStatus: function getTileStatus() {
            var index,
                tileArray = this.get('tileArray'),
                baseArray = [0, 0],
                tileTypes = modelClassNameSpace.TileItem.SolveTileType,
                currentType,
                newArray = [],
                currentTile, base, exponent;

            for (index = 0; index < tileArray.length; index++) {
                currentTile = tileArray.at(index);
                currentType = currentTile.get('type');
                if ( currentType !== tileTypes.BASE_EXPONENT && currentType !== tileTypes.BASE_ONLY) {
                    newArray = currentTile.getTileStatus();
                    baseArray[0] += newArray[0];
                    baseArray[1] += newArray[1];
                }
                else {
                    base = currentTile.get('base');
                    exponent = currentTile.get('exponent');
                    if (currentTile.get('bDenominator') === false) {
                        if (base !== null && exponent !== null) {
                            baseArray[0]++;
                        }
                    }
                    else {
                        if (base !== null && exponent !== null) {
                            baseArray[1]++;
                        }
                    }
                }
            }
            return baseArray;
        },

        /**
         * To check whether this parenthesis exponent is not null
         * @returns {Boolean} true if it not else false
         *
         * @method checkParentesisExponent
         */
        checkParentesisExponent: function checkParentesisExponent() {
            var index, currentTile,
                tileArray = this.get('tileArray'),
                tileTypes = modelClassNameSpace.TileItem.SolveTileType,
                currentType;
            for (index = 0; index < tileArray.length; index++) {
                currentTile = tileArray.at(index);
                currentType = currentTile.get('type');
                if ( currentType !== tileTypes.BASE_EXPONENT && currentType !== tileTypes.BASE_ONLY) {
                    if (currentTile.checkParentesisExponent() === false) {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
         * To check whether this parenthesis exponent is negative
         * @returns {Boolean} true if it not else false
         *
         * @method isNegativeExpPresent
         */
        isNegativeExpPresent: function isNegativeExpPresent () {
            var index, currentTile,
                tileArray = this.get('tileArray');

            for (index = 0; index < tileArray.length; index++) {
                currentTile = tileArray.at(index);
                if (currentTile.isNegativeExpPresent() === false) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Will get hoe many ever parenthesis present in the given expression
         * @returns {Array} The array consisting of all parenthesis present
         *
         * @method getAllParenthesis
         */
        getAllParenthesis: function getAllParenthesis() {
            var index,
                tileArr = this.get('tileArray'),
                tileTypes = modelClassNameSpace.TileItem.SolveTileType,
                currentType,
                childArr = [], currentTile;
            for (index = 0; index < tileArr.length; index++) {
                currentTile = tileArr.at(index);
                currentType = currentTile.get('type');
                if ( currentType !== tileTypes.BASE_EXPONENT && currentType !== tileTypes.BASE_ONLY) {
                    childArr = childArr.concat(currentTile.getAllParenthesis());
                }
            }
            return childArr;
        },

        /**
         * To check if there is a term with exponent 1 or -1
         * @returns {Boolean} Return true if there is a term present else false
         *
         * @method isExpAbsOne
         */
        isExpAbsOne: function isExpAbsOne () {
            var index, currentTile,
                tileArray = this.get('tileArray');

            for (index = 0; index < tileArray.length; index++) {
                currentTile = tileArray.at(index);
                if (currentTile.isExpAbsOne() === true) {
                    return true;
                }
            }
            return false;
        },

        /**
         * To check whether this parenthesis does exist
         * @returns {Boolean} true if it does
         *
         * @method isParenthesisPresent
         */
        isParenthesisPresent: function isParenthesisPresent () {
            var index,
                tileArr = this.get('tileArray');

            for (index = 0; index < tileArr.length; index++) {
                if(tileArr.at(index).isParenthesisPresent() === true) {
                    return true;
                }
            }
            return false;
        },

        /**
        * Sets the bDenominator flag of the tile
        * @method setDenominator
        * @param {Boolean} Boolean representing whether the tile is a denominator
        */
        setDenominator: function (value) {
            this.set('bDenominator', value);
        },

        /**
        * Returns -1 if the exponent is negative & +1 if it's positive.
        *
        * @method getExponentSign
        * @return {Number} Sign of the exponent
        */
        getExponentSign: function () {
            var exponent = parseInt(this.get('exponent'), 10);

            return exponent < 0 ? -1 : +1;
        },

        /**
        * Returns a boolean indicating whether the children have only multiplication as operator
        *
        * @method areChildrenOnlyMultiplied
        * @return {Boolean} boolean indicating whether the children have only multiplication as operator
        */
        areChildrenOnlyMultiplied: function () {
            var multipliedChildren = this.get('tileArray').where({ operator: '+' });

            return multipliedChildren.length === 0;
        },

        /*getTree: function () {
            throw new Error('Not implemented Get Tree');
        },*/

        
        /**
        * Returns the tile next to this tile.
        * It uses Model.collection property which may not be reliable. Use this sparingly.
        * @method next
        * @return {Object} Tile next to this tile.
        */
        next: function () {
            var parent = this.collection,
                index = parent.indexOf(this);
            return parent.at(index + 1);
        },

        getIndexFromItem: function (item) {
            var tiles = this.get('tileArray'),
                index = null,
                TYPES = modelClassNameSpace.TileItem.SolveTileType,
                i = 0;

            index = tiles.indexOf(item);

            // tile found
            if (index !== -1) {
                return index + '';
            }
            else {
                for (i = 0; i < tiles.length; i++) {
                    index = tiles.at(i).getIndexFromItem(item);
                    if (index !== -1) return i + '.' + index + '';
                }
                return -1;
            }
        },

        /**
        * Inverts the bDenominator flag of itself and all child tiles recursively
        * @method invertBDenominator
        */
        invertBDenominator: function () {
            var isDenominator = this.get('bDenominator'),
                tiles = this.get('tileArray');

            if (tiles) {
                // call same function on children
                tiles.each(function (tile) {
                    tile.invertBDenominator();
                }, this);
            }

            if (_.isBoolean(isDenominator)) {
                this.set('bDenominator', !isDenominator);
            }
        },

        /**
        * Inverts the bDenominator flag of all child tiles recursively
        * @method invertChildBDenominator
        */
        invertChildBDenominator: function () {
            var tiles = this.get('tileArray');

            if (tiles) {
                // call same function on children
                tiles.each(function (tile) {
                    tile.invertBDenominator();
                }, this);
            }
        },

        /**
        * Inverts the exponent sign of itself and all child tiles
        * @method invertExponentSign
        */
        invertExponentSign: function () {
            var exponent = this.get('exponent'),
                tiles = this.get('tileArray');

            tiles.each(function (tile) {
                tile.invertExponentNonRecursive();
            }, this);

            this.invertExponentNonRecursive();
        },

        /**
        * Inverts the exponent sign of itself
        * @method invertExponentNonRecursive
        */
        invertExponentNonRecursive: function () {
            this.set('exponent', this.get('exponent') * -1)
        },

        /**
        * Multiplies each child exponent by a value. This is not recursive.
        * @method multiplyChildExponentsBy
        * @param {Number} Value to multiply by
        * @return {Boolean} true if successful else false
        */
        multiplyChildExponentsBy: function (value) {
            var tiles = this.get('tileArray'),
                isGreater = false,
                index, newExp, oldExp, oldBase, currentTile,
                oneIndices = [];

            for (index = 0; index < tiles.length; index++) {
                currentTile = tiles.at(index);
                oldExp = currentTile.get('exponent');
                if (oldExp) {
                    newExp = oldExp * value;
                    if (Math.abs(newExp) > 99) {
                        isGreater = true;
                    }
                    currentTile.set('exponent', newExp);
                }
                else {
                    oldBase = tiles.at(index).get('base');
                    if(oldBase === -1 && value % 2 === 0) {
                        currentTile.set('base', 1);
                        oneIndices.push(index);
                    }

                }
            }
            if(isGreater === true) {
                this.divideChildExponentsBy(1/value, oneIndices);
                return false;
            }
            return oneIndices;
        },

        /**
        * Divides each child exponent by a value. This is not recursive.
        * @method multiplyChildExponentsBy
        * @param {Number} Value to multiply by
        * @return {Boolean} true if successful else false
        */
        divideChildExponentsBy: function (value, oneIndices) {
            var tiles = this.get('tileArray'),
                index, newExp, oldExp, oldBase, currentTile;

            for (index = 0; index < tiles.length; index++) {
                currentTile = tiles.at(index);
                oldExp = currentTile.get('exponent');
                if (oldExp) {
                    newExp = oldExp * value;
                    currentTile.set('exponent', newExp);
                }
                else {
                    oldBase = tiles.at(index).get('base');
                    if(oldBase === 1 && value % 2 !== 0 && oneIndices.indexOf(index) !== -1) {
                        currentTile.set('base', -1);
                    }
                }
            }
            return true;
        },

        /**
        * Returns an array of all operators in the model
        *
        * @method getOperators
        * @return {Array} Array of all operators in the model
        */
        getOperators: function () {
            var operators = [],
                tiles = this.get('tileArray'),
                operator = this.get('operator');

            if (!tiles) return [operator];


            tiles.each(function (tile) {
                Array.prototype.push.apply(operators, tile.getOperators());
            }, this, operators);

            operators.push(operator);

            return _.compact(operators);
        },

        /**
        * Returns a boolean representing if all operators in the model are either * or /
        * This is only written with a single / in the model in mind.
        *
        * @method allOPeratorsMultiplicative
        * @return {Boolean} Boolean representing if all operators in the model are either * or /
        */
        allOperatorsMultiplicative: function () {
            var operators = this.getOperators(),
                i = 0;
            for (i = 0; i < operators.length; i++) {
                if (operators[i] !== '*' && operators[i] !== '/') return false;
            }
            return true;
        },

        /**
        * Checks if the base is empty or the exponent is empty or both depending on the type.
        *
        * @method isEmpty
        * @param {Object} Type denotes whether to check if only the base is empty or the exponent is empty or both
        * @return {Boolean} Boolean representing if the base is empty or the exponent is empty or both depending on the type.
        */
        isEmpty: function (type) {
            var exponent = this.get('exponent'),
                base = this.get('base'),
                TYPE = modelClassNameSpace.TileItem.BinTileType;

            switch (type) {
                case TYPE.BASE:
                    return base === null || base === undefined;
                    break;
                case TYPE.EXPONENT:
                    return exponent === null || exponent === undefined;
                    break;
                default:
                    return (exponent === null || exponent === undefined) &&
                   (base === null || base === undefined);
            };
        },

        /**
        * Returns the first tile in the Denominator
        *
        * @method getFirstDenominatorTile
        * @return {Object} First tile in the denominator
        */
        getFirstDenominatorTile: function () {
            var tiles = this.get('tileArray');
            if (tiles) {
                return tiles.findWhere({ bDenominator: true });
            } else { return void 0; }
        },

        /**
       * Returns true if the child is the first numerator element or first denominator element
       *
       * @method isFirstChild
       * @param {Object} Child of the fraction
       * @return {Boolean} True if the child is the first numerator element or first denominator element. False otherwise
       */
        isFirstChild: function (child) {
            return this.indexOf(child) === 0 || this.get('tileArray').findWhere({ bDenominator: true }) === child;
        },

        /**
        * Returns the element next to the tile passed
        *
        * @method nextTile
        * @param {Object} Child Element
        * @return {Object} Tile next to the next element
        */
        nextTile: function (tile) {
            return this.at(this.indexOf(tile) + 1);
        },

        /**
        * Returns a list of child denominator tiles
        * @method denominators
        * @return {Array} Array of child denominator tiles.
        */
        denominators: function () {
            return this.where({ bDenominator: tile.get('bDenominator') });
        },

        /**
        * This is just a wrapper for the child tileArray collection's remove function.
        * NOTE: There is no exception handling.
        *
        * @method remove
        * @param {Object | Array} Tile(s) to be removed
        * @param {Object} Options to forward to Collection.remove
        * @return {Object} Object removed
        */
        remove: function (tiles, options) {
            return this.get('tileArray').remove(tiles, options);
        },

        /**
        * Wrapper for the child tileArray collection's at function.
        * NOTE: There is no exception handling.
        *
        * @method at
        * @param {Number} Index of tile to be retrieved
        * @return {Object} Object at given index
        */
        at: function (index) {
            return this.get('tileArray').at(index);
        },

        /**
        * Wrapper for the child tileArray collection's add function.
        * NOTE: There is no exception handling.
        *
        * @method add
        * @param {Object | Array} Model(s) to be added
        * @return {Object} Added or existing models
        */
        add: function (models, options) {
            return this.get('tileArray').add(models, options);
        },

        /**
        * Wrapper for adding multiple tiles at once. This is required because when using Bacbone.Collection.add
        * it always passes { at: pos } for each new added tile causing the view to keep prepending the new tile views.
        * Here we manually loop and increment at so each tile view is added  to the intended position.
        *
        * @method addMultiple
        * @param {Array} Tile(s) to be added
        * @param {Number} Position to add the tile at
        */
        addMultiple: function (tiles, pos) {
            for (var i = 0; i < tiles.length; i++) {
                this.add(tiles[i], { at: pos + i });
            }
        },

        /**
        * Wrapper for the child tileArray collection's where function.
        *
        * @method where
        * @param {Object} Attributes to be passed
        * @return {Object} Found models
        */
        where: function (attributes) {

            if (this.get('tileArray')) {
                return this.get('tileArray').where(attributes);
            }

            return [];
        },

        /**
        * Wrapper for the child tileArray collection's indexOf function.
        *
        * @method indexOf
        * @param {Object} Model to find
        * @param {Boolesn} Pass true for binary search, for sorted collection
        * @return {Number} Index of found model
        */
        indexOf: function (value, isSorted) {
            return this.get('tileArray').indexOf(value, isSorted);
        },

        /**
        * Sets the bDenominator of itself & all child tiles
        * @method setBDenominator
        * @param {Boolean} Boolean to set the bDenominator to.
        */
        setBDenominator: function (bool) {
            this.set('bDenominator', bool);
            var tiles = this.get('tileArray'),
                i = 0;
            if (tiles) {
                for (i = 0; i < tiles.length; i++) {
                    tiles.at(i).set('bDenominator', bool);
                }
            }
        },

        getChildBases: function getChildBases(type) {
            if (this.get('type') === type) {
                return 1;
            }
            var ctr = 0, index,
                tileArr = this.get('tileArray'),
                currentTile;
            for (index = 0; index < tileArr.length; index++) {
                currentTile = tileArr.at(index);
                ctr += currentTile.getChildBases(type);
            }
            return ctr;
        },

        /**
        * Returns a boolean representing whether the tile is a Static unmovable '1' tile.
        * @method isOne
        * @return {Boolean} True if the tile is a static '1' tile when there is an empty numerator. False otherwise.
        */
        isOne: function () {
            return false;
        }

    },// End of model
    {
        SolveTileType: {
            NONE: 'NONE',
            BASE_EXPONENT: 'BASE_EXPONENT',
            BASE_ONLY: 'BASE_ONLY',
            PARENTHESIS: 'PARENTHESIS',
            BIG_PARENTHESIS: 'BIG_PARENTHESIS',
            FRACTION: 'FRACTION',
            EQUATION_COMPONENT: 'EQUATION_COMPONENT'
        },

        BinTileType: {
            BASE: 'BASE',
            EXPONENT: 'EXPONENT',
            BASE_EXPONENT: 'BASE_EXPONENT',
            BASE_ONLY: 'BASE_ONLY',
            PARENTHESIS: 'PARENTHESIS',
            BIG_PARENTHESIS: 'BIG_PARENTHESIS',
            FRACTION: 'FRACTION',
            EQUATION_COMPONENT: 'EQUATION_COMPONENT',
            MARQUEE: 'MARQUEE'
        },

        MultiplicationThresold: 5,
        AdditionThresold: 5,

        /**
             * Creates TileItem Model from data
             *
             * @method createTileItem
             * @static
             * @return {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Models.TileItem} Created model object.
             */
        createTileItem: function (data) {
            var itemModel,
                itemTypes = modelClassNameSpace.TileItem.SolveTileType;
            switch (data.type) {
                case itemTypes.BASE_EXPONENT:
                    {
                        itemModel = new modelClassNameSpace.BaseExpTile(data);
                    }
                    break;
                case itemTypes.PARENTHESIS:
                    {
                        itemModel = new modelClassNameSpace.ParenthesisTile(data);
                    }
                    break;
                case itemTypes.FRACTION:
                    {
                        itemModel = new modelClassNameSpace.FractionTile(data);
                    }
                    break;
                case itemTypes.BIG_PARENTHESIS:
                    {
                        itemModel = new modelClassNameSpace.BigParenthesisTile(data);
                    }
                    break;
                case itemTypes.BASE_ONLY:
                    {
                        itemModel = new modelClassNameSpace.BaseTile(data);
                    }
                    break;
                default:
                    {
                        throw new Error('Item Type does not exist');
                    }
                    break;
            }
            return itemModel;
        },

        /**
             * Class representing a Node in a Expression tree
             *
             * @method TreeNode
             * @param {Object} data - Contains the model of the node
             * @param {Object} leftChild - Root of the left subtree
             * @param {Object} rightChild - Root of the right subtree
             */
        TreeNode: function (data, collectionData) {
            this.data = data;
            this.collectionData = collectionData;
            this.children = [];
            this.parent = null;
        }

    }); // end of model

    /**
    * Returns true if the node is the leftmost child of the parent
    *
    * @method isLeftmostChild
    * @return {Boolean} Boolean indicating whether the node is the leftmost child of the parent
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.isLeftmostChild = function () {
        if (this.isRoot()) return false;
        return this === this.parent.children[0];
    };

    /**
    * Returns true if the node is the rightmost child of the parent
    *
    * @method isRightmostChild
    * @return {Boolean} Boolean indicating whether the node is the rightmost child of the parent
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.isRightmostChild = function () {
        if (this.isRoot()) return false;
        return this === _.last(this.parent.children);
    };

    /**
    * Returns the rightmost child of the parent
    *
    * @method getRightmostChild
    * @return {Object} Rightmost child of the parent
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.getRightmostChild = function () {
        return _.last(this.children);
    };

    /**
   * Returns the leftmost child of the parent
   *
   * @method getLeftmostChild
   * @return {Object} Leftmost child of the parent
   */
    modelClassNameSpace.TileItem.TreeNode.prototype.getLeftmostChild = function () {
        return this.children[0];
    };

    /**
    * Returns true if the node is the root node
    *
    * @method isRoot
    * @return {Boolean} Boolean indicating whether the node is the root
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.isRoot = function () {
        if (!this.parent) return true;
        else return false;
    };

    /**
    * Returns true if the node is a leaf node
    *
    * @method isLeaf
    * @return {Boolean} Boolean indicating whether the node is a leaf
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.isLeaf = function () {
        return this.children.length === 0;
    };

    /**
    * Returns the position array of this node
    *
    * @method getPath
    * @return {Array} Position array of the node
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.getPath = function () {
        var currentNode = this,
            index = null,
            position = [];

        // using push and reverse instead of unshift mainly for performance reasons
        while (!currentNode.isRoot()) {
            index = currentNode.parent.children.indexOf(currentNode);
            position.push(index);
            currentNode = currentNode.parent;
        }
        position.reverse();
        return position;
    };

    /**
    * Returns the root of the entire tree
    *
    * @method getTreeRoot
    * @return {Object} Root node of the entire tree
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.getTreeRoot = function () {
        var currentNode = this;

        while (!currentNode.isRoot()) {
            currentNode = currentNode.parent;
        }

        return currentNode;
    };

    /**
    * Returns the node at the given position
    *
    * @method get
    * @param {Array} Position array of the node
    * @return {Object} Node at the given position
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.get = function (pos) {
        var i = 0,
            currentNode = this;

        for (i = 0; i < pos.length; i++) {
            currentNode = currentNode.children[pos[i]];
        }

        return currentNode;
    };

    /**
    * Returns the total exponent of the node. Useful for nested base exponent nodes. In that case it returns the base-exponent's exponent
    * multiplied by the parent parenthesiss exponent
    *
    * @method getTotalExponent
    * @param {Object} Node upto which the exponent is to be found
    * @return {Number} Total exponent of a node
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.getTotalExponentUpto = function (node) {
        var currentNode = this,
            exponent = null;

        if (currentNode.data === '^') exponent = 1;
        else exponent = this.data.get('exponent');

        while (!currentNode.isRoot() && !_.isEqual(node, currentNode)) {
            if (currentNode.data === '^') {
                exponent *= currentNode.getRightmostChild().data;
            }
            currentNode = currentNode.parent;
        }

        if (currentNode.data === '^') exponent *= currentNode.getRightmostChild().data;

        return exponent;
    };

    /**
    * Deletes the node from the tree
    *
    * @method delete
    * @return {Object} Node removed
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.delete = function () {
        var children = this.parent.children,
            grandparent = this.parent.parent,
            index = children.indexOf(this);

        // remove element from parent node
        children.splice(index, 1);

        if (children.length <= 1) {
            // children.length will almost always be 1
            Array.prototype.push.apply(grandparent.children, children);
            children[0].parent = grandparent;   // this will fail when children.length is not 1.
        }

        // TODO cleanup code for removed node.
        // Removed node will have have references to nodes in the tree
        // which should probably be removed for safety.
        return this;
    };

    /**
    * Returns the operator of the node.
    * For e.g. (2^3) * 3^4
    * when invoked on 2^3 will return *
    *
    * @method getOperator
    * @return {String} Operator string
    */
    modelClassNameSpace.TileItem.TreeNode.prototype.getOperator = function () {
        var currentNode = this;
        while (!currentNode.isRoot()) {
            if (_.isString(currentNode.data) && currentNode.data !== '^') return currentNode.data;
            currentNode = currentNode.parent;
        }

        return currentNode.data;
    };


})();
