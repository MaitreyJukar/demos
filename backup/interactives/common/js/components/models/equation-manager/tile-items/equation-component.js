(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        tileItemNameSpace = MathInteractives.Common.Components.Models.EquationManager.TileItem;

    /**
    * Properties required for populating ExponentAccordion releted data.
    *
    * @class EquationComponent
    * @construtor
    * @extends MathInteractives.Common.Components.Models.EquationManager.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    */
    namespace.EquationComponent = namespace.TileItem.extend({

        defaults: $.extend(true, {}, tileItemNameSpace.prototype.defaults, {

            type: tileItemNameSpace.SolveTileType.EQUATION_COMPONENT
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
		    namespace.EquationComponent.__super__.initialize.apply(this, arguments);
            var arrEquation, i = 0, lstEquation = [],
                baseClass = namespace.TileItem;
            if (this.get('tileArray') === null) {
                this.set('tileArray', []);
            }

            arrEquation = this.get('tileArray');

            for (i = 0; i < arrEquation.length; i++) {
                lstEquation[i] = baseClass.createTileItem(arrEquation[i]);
            }

            this.set('tileArray', new Backbone.Collection(lstEquation));
        },

        /**
        * Get child item from index
        * @method getItemFromIndex
        * @param index {String} index of an item.
        * @return {MathInteractives.Common.Components.Models.EquationManagers.TileItem}
        */
		getItemFromIndex: function (itemIndex) {
		    var indexes, index,
                tiles = this.get('tileArray');
		    if (itemIndex) {
		        indexes = itemIndex.split('.');
		        index = parseInt(indexes[0], 10);
		        indexes.splice(0, 1);
		        if (tiles.at(index)) {
		            return this.get('tileArray').at(index).getItemFromIndex(indexes.join('.'));
		        }
		        else {
		            return null;
		        }
		    }
		    else if (itemIndex === '') {
		        return this;
		    }
		    return null;
        },

        /**
        * Fetches the equation and returns it in latex form.
        *
        * @method getEquationInLatexForm
        * @return {Object} Returns an object containing a string depicting the equation's latex form
        */
        getEquationInLatexForm: function getEquationInLatexForm() {
            var tileArray = this.get('tileArray'),
                tileArrayLength = tileArray.length,
                index = 0,
                currentTile = null,
                type = null,
                operator = null,
                exponent = null,
                base = null,
                equationLatexString = '',
                equationAccText = '',
                equationValue = null;

            for (index = 0; index < tileArrayLength; index++) {
                currentTile = tileArray.models[index];
                equationLatexString += currentTile.getTileContentInLatexForm();
            }

            //equationAccText = MathInteractives.Common.Utilities.Models.MathquillMSCR.getEquationAccText(equationLatexString);
            //equationValue =

            return {
                equationLatexString: equationLatexString,
                //accessibilityText: equationAccText,
                //equationValue: equationValue
            }
        },

		/*getTree: function () {
			var index, j,
				tiles = this.get('tileArray'),
				currentSymbol,
				currentTile,
                types = tileItemNameSpace.SolveTileType,
				childTiles = [],
				exprTreeRoot,
				length = tiles.length;

			this.operatorStack = [];
			this.postfixModels = [];

            // for each child in children
			for(index = 0; index<length; index++) {
				currentTile = tiles.at(index);
				currentSymbol = currentTile.get('operator');
				if (currentTile.get('type') === types.BASE_EXPONENT || currentTile.get('type') === types.BASE_ONLY) {
					if(currentSymbol === null) {
						while(this.operatorStack.length !== 0) {
							this.postfixModels.push(this.operatorStack.pop());
						}
						this.postfixModels.push(currentTile);
					}
					else {
						while(this.operatorStack.length > 0 && this.isPrecedent(this.operatorStack[this.operatorStack.length - 1], currentSymbol))
						{
							this.postfixModels.push(this.operatorStack.pop());
						}
						this.operatorStack.push(currentSymbol);
						this.postfixModels.push(currentTile);
					}
				}
				else {
					if(currentSymbol !== null) {
						while(this.operatorStack.length > 0 && this.isPrecedent(this.operatorStack[this.operatorStack.length - 1], currentSymbol))
						{
							this.postfixModels.push(this.operatorStack.pop());
						}
						this.operatorStack.push(currentSymbol);
					}
					childTiles = currentTile.getTree();
					for(j = 0; j<childTiles.length; j++) {
						this.postfixModels.push(childTiles[j]);
					}
				}
			}
			while(this.operatorStack.length > 0)
			{
				this.postfixModels.push(this.operatorStack.pop());
			}

			exprTreeRoot = this._createTree(this.postfixModels);
			return exprTreeRoot;
	 	},

        isPrecedent: function (top, current) {
            switch (top) {
                case '+':
                case '-':
                    {
                        if (current == '+' || current == '-')
                            return true;
                        if (current == '*' || current == '/')
                            return false;
                    }
                case '*':
                case '/':
                    {
                        if (current == '+' || current == '-' || current == '/' || current == '*')
                            return true;
                    }
            }
            return true;
        },


		_createTree: function (postfixModels) {
			var operandStack = [],
				treeNode, treeNode1, treeNode2,
				currentSymbol,
				treeRoot,
				index, length;
			for(index=0, length = postfixModels.length; index<length; index++) {
				currentSymbol = postfixModels[index];
				if(currentSymbol === '^' || currentSymbol === '/') { // TODO: for sin cos etc
					treeNode = new tileItemNameSpace.TreeNode(currentSymbol, postfixModels[index+1]);
					index +=1;
				}
				else {
					treeNode = new tileItemNameSpace.TreeNode(currentSymbol, null);
				}
				if(typeof(currentSymbol) !== "string") {
					operandStack.push(treeNode);
				}
				else {
					treeNode2 = operandStack.pop();
					treeNode1 = operandStack.pop();
					if(treeNode1.data === treeNode.data) {
						treeNode1.children.push(treeNode2);
						treeNode2.parent = treeNode1;
						operandStack.push(treeNode1);
					}
					else {
						treeNode.children.push(treeNode1);
						treeNode.children.push(treeNode2);
						treeNode1.parent = treeNode;
						treeNode2.parent = treeNode;
						operandStack.push(treeNode);
					}
				}
			}
			treeRoot = operandStack.pop();
			return treeRoot;
		},*/

        /**
        * Prints a string representation of the current expression
        *
        * @method printExpr
        * @return {String} String representation of the current expression
        */
		printExpr: function () {
		    var tiles = this.get('tileArray'),
		        i = 0,
		        str = '';

		    for (i = 0; i < tiles.length; i++) {
		        str = str + tiles.at(i).printExpr();
		    }

		    return str;
		}

    }, {
        Operations: { //NOTE:  any changes in the ENUM values will cause a chenge in the combine command
            'REPOSITION_TILE': 1,
            'CLICK_EXP': 2,
            'MARQUEE_SELECT_AND_COMBINE': 4,
            'COMBINE_SAME_BASE': 8,
            'BREAK_BASE_EXP_1': 16,
            'ZERO_EXP_DIRECT_CONVERT': 32,
            'ZERO_EXP_SHOW': 64,
            'DIVIDE_EQUAL_TERMS_HAVING_BASE_EXP_1_BASE_EXP_ANY': 128,
            'DIVIDE_SIMILAR_TERMS_WITH_SAME_EXP': 256,
            'PRIME_TO_COMPOSITE_EXP_ANY': 512,
            'BREAK_BASE_EXP_ANY': 1024,
            'PARENTHESIS_EXP_ALL': 2048
        },

        // TODO: This shouldn't be here and should come from config
        ALLOWED_EXPONENTS: [
            -3,
            -2,
            -1,
            2,
            3
        ]
    });
})();
