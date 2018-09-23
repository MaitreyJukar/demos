(function (MathInteractives) {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point;

    /**
    * EquationView holds the data for the Equation View.
    *
    * @class EquationView
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManagerPro.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    */
    viewClassNamespace.EquationView = viewClassNamespace.TileView.extend({

        /**
        * Array of tile views inside equation view
        * @property tileViews
        * @type Array
        * @default null
        */
        tileViews: null,

        /**
        * stores jquery objects of operators in tile views
        * @property $operatorViews
        * @type Array
        * @default null
        */
        $operatorViews: null,

        initialize: function () {
            this.tileViews = [];
            this.$operatorViews = [];
            viewClassNamespace.EquationView.__super__.initialize.apply(this, arguments);
            this.initializeDefaultProperties();
        },

        /**
        * reners equation view
        * @method $operatorViews
        * @public
        */
        render: function () {
            var arrTiles = this.model.get('tileArray'),
                i = 0;
            for (i = 0; i < arrTiles.length; i++) {
                this.tileViews[i] = new viewClassNamespace.TileView.createTileItemView(arrTiles.at(i), this, this.equationManager, this.player, this.isTutorialMode);
            }
        },


        /**
        * to check whether there is fraction present in expression
        * @method checkForFractionInExpression
        * @public
        */
        checkForFractionInExpression: function checkForFractionInExpression() {
            var tileViews = this.tileViews, i = 0;
            for (; i < tileViews.length; i++) {
                tileViews[i].checkForFractionInExpression();
            }
        },

        /**
         * Creates a Html template for equation view
         * @method createView
         * @public
         *
         */
        createView: function () {
            var templateString = MathInteractives.Common.Components.templates['equationViewTemplate']({
                'idPrefix': this.idPrefix + this.equationManager.postIdPrefixString,
                'isMobile': this.isMobile
            }),
            $equationView = $(templateString), $lhsExpression, $rhsExpression;


            $lhsExpression = $equationView.find('.lhs-expression-view-expression');
            $rhsExpression = $equationView.find('.rhs-expression-view-expression');

            var i = 0, arrEqViews = this.tileViews, $child;
            for (i = 0; i < arrEqViews.length; i++) {
                if (arrEqViews[i].model.get('isLHS') === true) {
                    $child = arrEqViews[i].createView();
                    $lhsExpression.append($child);
                }
                else {
                    $child = arrEqViews[i].createView();
                    $rhsExpression.append($child);
                }
            }
            this.$el.append($equationView);

        },
        /**
         * Sets El of the equation view
         * @method createView
         * @param {$element}
         * @public
         */
        setEquationContainer: function ($element) {
            this.setElement($element);
        },

        /**
         * attaches an events
         * @method attachEvents
         * @public
         */
        attachEvents: function () {

            var i = 0, arrEqViews = this.tileViews;
            for (i = 0; i < arrEqViews.length; i++) {
                arrEqViews[i].attachEvents();
            }
            //this.makeDroppable(true);
        },

        /**
         * recursive method to remove border
         * @method refresh
         * @public
         */
        refresh: function () {
            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right');
                this.curHoveredTile = null;
            }
            viewClassNamespace.EquationView.__super__.refresh.apply(this, arguments);
        },

        /**
         * recursive method to get index of tile item view
         * @method getIndex
         * @param {view} tile item view
         * @public
         */
        getIndex: function (view) {
            var childIndex = this.tileViews.indexOf(view);
            return childIndex.toString();
        },

        checkContainsParOrFraction: function checkContainsParOrFraction() {
            var tileViews = this.tileViews, i = 0, result;
            for (; i < tileViews.length; i++) {
                result = tileViews[i].checkContainsParOrFraction();
                if (result) {
                    return result;
                }
            }
        },

        isExpressionContainsParOrFraction: function isExpressionContainsParOrFraction() {
            var tileViews = this.tileViews, i = 0, result;
            for (; i < tileViews.length; i++) {
                result = tileViews[i].isExpressionContainsParOrFraction();
                if (result) {
                    return result;
                }
            }
        },

        isExpressionContainsParentheses: function isExpressionContainsParentheses() {
            var tileViews = this.tileViews, i = 0, result;
            for (; i < tileViews.length; i++) {
                result = tileViews[i].isExpressionContainsParentheses();
                if (result) {
                    return result;
                }
            }
        },


        /**
         * recursive method to get html structure of expression
         * @method getTileContentInHtmlForm
         * @return {htmlString} htmlString to parent
         * @public
         */
        getTileContentInHtmlForm: function getTileContentInHtmlForm(bigParenthesesColor) {
            var tileArray = this.tileViews,
                tileArrayLength = tileArray.length,
                index,
                htmlString = '', currentTile,
                bodyTemplateString = '';

            //htmlString += '<div class=\'header-expression-container\'><div class=\'header-expression equation-common\'>';

            currentTile = tileArray[0];
            //htmlString += currentTile.getTileContentInHtmlForm();
            bodyTemplateString += currentTile.getTileContentInHtmlForm(bigParenthesesColor);

            currentTile = tileArray[1];
            if(currentTile) {
                //htmlString += '<div class=\'equal-to-sign equation-common\'>=</div>';
                bodyTemplateString += MathInteractives.Common.Components.templates['mathematicalOperators']({
                    operator: {
                        'equals': true
                    }
                }).trim();
                //htmlString += currentTile.getTileContentInHtmlForm();
                bodyTemplateString += currentTile.getTileContentInHtmlForm(bigParenthesesColor);
            }

            ////for (index = 0; index < tileArrayLength; index++) {
            ////    currentTile = tileArray[index];
            ////    htmlString += currentTile.getTileContentInHtmlForm();
            ////}
            //htmlString += '</div></div>';

            htmlString = MathInteractives.Common.Components.templates['headerExprContainer']({
                'exprBody': bodyTemplateString
            });

            return htmlString;
        },

        getAccString: function getAccString(tabname) {
            var tileViews = this.tileViews,
                tileViewLength = tileViews.length,
                currentString = '',
                index = 0;

            for (; index < tileViewLength; index++) {
                currentString += tileViews[index].getAccString();
                if (index === 0 && tileViewLength > 1) {
                    currentString += this.manager.getAccMessage('prefixed-statements', 0);
                }
            }
            //if (tabname === viewClassNamespace.EquationManagerPro.DATA) {
            //    return this.getAccMessage('prefixed-statements', 1) + ' ' + currentString.trim() + '.';
            //}
            //else {
            //    return this.getAccMessage('prefixed-statements', 0) + ' ' + currentString.trim() + '.';
            //}

            return currentString.trim();

        },

        /**
        * Returns the elements that are inside the marquee drawn.
        * @method getElementsInsideMarquee
        * @param {Object} Marquee end event
        * @param {Object} Marquee div
        */
        getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee, marqueeIndex) {
            this.tileViews[marqueeIndex].getElementsInsideMarquee(event, $marquee);
        },

        getViewFromNode: function getViewFromNode(node) {
            return this.getViewFromIndex(this.model.getModelIndexFromNode(node));
        }

    }, {

    });

})(window.MathInteractives);
