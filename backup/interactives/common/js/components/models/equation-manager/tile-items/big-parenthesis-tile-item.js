(function () {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * ParenthesisTile holds data for any parethesis item
    *
    * @class ParenthesisTile
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManager.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    */
    modelClassNameSpace.BigParenthesisTile = modelClassNameSpace.ParenthesisTile.extend({
        defaults: $.extend(true, {}, modelClassNameSpace.TileItem.prototype.defaults, {

            arrChilds: null,

            type: modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS
        }),

        /**
        * Stores the array of operatiors
        *
        * @attribute operatorStack
        * @type Array
        * @default empty
        **/
        operatorStack: [],

        /**
        * To convert the given colllection into postfix models
        *
        * @attribute postfixModels
        * @type Array
        * @default empty
        **/
        postfixModels: [],

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelClassNameSpace.BigParenthesisTile.__super__.initialize.apply(this, arguments);
            var arrTiles = [], i, lstTiles = [];
            if (this.get('tileArray') === null) {
                this.set('tileArray', []);
            }
            arrTiles = this.get('tileArray');

            // Enter the for loop if arrTiles is an array.
            // This check needs to be done since this.clone() sets arrTiles to a Backbone.Collection which
            // causes an exception is this case.
            if (arrTiles instanceof Array) {
                for (i = 0; i < arrTiles.length; i++) {
                    lstTiles[i] = modelClassNameSpace.TileItem.createTileItem(arrTiles[i]);
                }
                this.set('tileArray', new Backbone.Collection(lstTiles));
            }

            //this.listenTo(this.get('tileArray'), 'remove', this.onRemoveTiles);
        },

        getAllParenthesis : function getAllParenthesis () {
            var index,
                tileArr = this.get('tileArray'),
                types = modelClassNameSpace.TileItem.SolveTileType,
                childArr = [], currentTile, currentType;
            for(index=0; index<tileArr.length; index++) {
                currentTile = tileArr.at(index);
                currentType = currentTile.get('type');
                if(currentType !== types.BASE_EXPONENT && currentType !== types.BASE_ONLY) {
                    childArr = childArr.concat(currentTile.getAllParenthesis());
                }
            }
            return childArr;
        },

        /**
         * To check whether this parenthesis does exist
         * @returns {Boolean} true if it does
         *
         * @method isParenthesisPresent
         */
        isParenthesisPresent: function isParenthesisPresent () {
            return true;
        },

        /**
         * To check whether this parenthesis exponent is not null
         * @returns {Boolean} true if it not else false
         *
         * @method checkParentesisExponent
         */
        checkParentesisExponent: function () {
            if(this.get('exponent') === null)
                return false;
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
            if(this.get('exponent') <= 0) {
                return false;
            }
            var index, currentTile,
                tileArray = this.get('tileArray');

            for (index = 0; index < tileArray.length; index++) {
                currentTile = tileArray.at(index);
                if (currentTile.isNegativeExpPresent() === false) {
                    return false;
                }
            }
            return true;
        }
    });

})();
