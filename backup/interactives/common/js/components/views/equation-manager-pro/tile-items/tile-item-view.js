(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro;


    /**
    * TileView acts as base class for all types of Tile Items.
    *
    * @class TileView
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewClassNamespace.TileView = MathInteractives.Common.Player.Views.Base.extend({

        initialize: function () {
            var options = this.options;
            this.parent = options.parent;
            this.player = options.player;
            this.equationManager = options.equationManager;
            this.isTutorialMode = options.isTutorialMode;
            this.render();
        },

        /**
         * recursive method to remove border
         * @method refresh
         * @public
         */
        refresh: function () {
            var tileViews = this.tileViews,
                i = 0;
            if (tileViews) {
                for (i = 0; i < tileViews.length; i++) {
                    tileViews[i].refresh();
                }
            }
        },

        /**
         * enables or disables operator of a tile item
         * @method enableOperator
         * @public
         *
         * @param {Boolean} enable Whether to enable or disable operators.
         */
        enableOperator: function enableOperator(enable) {
            var isDroppableEnable = enable ? 'enable' : 'disable',
                operator = this.parent.$operatorViews[this.parent.tileViews.indexOf(this)];

            if (operator && operator.is('.ui-droppable')) {
                operator.droppable(isDroppableEnable);
            }
        },

        /**
        * dettaching or attaching draggable functionality of tiles
        * @method attachDetachDraggable
        * @param {enable} boolean to enable dragggable
        * @public
        */
        attachDetachDroppable: function attachDetachDroppable(enable, toDisableOp) {
            var index, operator,
                tileArray = this.tileViews || [],
                operatorViews = this.$operatorViews || [],
                isDroppableEnable = enable ? 'enable' : 'disable',
                tileClassInMarquee = viewClassNamespace.EquationManagerPro.TILE_INSIDE_MARQUEE;
            if (tileArray.length > 0) {
                for (index = 0; index < tileArray.length; index++) {
                    tileArray[index].attachDetachDroppable(enable, toDisableOp);
                    if (toDisableOp) {
                        if (operatorViews[index] && operatorViews[index].is('.ui-droppable') && !operatorViews[index].hasClass(tileClassInMarquee)) {
                            operatorViews[index].droppable(isDroppableEnable);
                            if (!enable) {
                                operatorViews[index].find('.insertion-cursor').hide();
                                operatorViews[index].find('.add-sign-in-null-operator').hide();
                            }
                        }
                    }
                }
            }
            if (this.$el.is('.ui-droppable') && !this.$el.hasClass(tileClassInMarquee)) {
                operator = this.parent.$operatorViews[this.parent.tileViews.indexOf(this)];
                if (toDisableOp) {
                    if (operator && operator.is('.ui-droppable') && !operator.hasClass(tileClassInMarquee)) {
                        operator.droppable(isDroppableEnable);
                        if (!enable) {
                            operator.find('.insertion-cursor').hide();
                            operator.find('.add-sign-in-null-operator').hide();
                        }
                    }
                }

                if (this.model.get('type') !== modelClassNamespace.TileItem.TileType.EXPRESSION) {
                    this.$el.droppable(isDroppableEnable);
                }
                else {
                    operator = this.$('.right-null-operator-container');
                    if (operator && operator.is('.ui-droppable')) {
                        operator.droppable(isDroppableEnable);
                        if (!enable) {
                            operator.find('.insertion-cursor').hide();
                            operator.find('.add-sign-in-null-operator').hide();
                        }
                    }
                }
            }
        },

        enableOperators: function enableOperators(isEnable) {
            var tileViews = this.tileViews, operator, index,
                $nullOperatorContainer = null,
                isDroppableEnable = isEnable ? 'enable' : 'disable';

            if (this.parent) {
                operator = this.parent.$operatorViews[this.parent.tileViews.indexOf(this)];
            }
            if (operator && operator.is('.ui-droppable')) {
                operator.droppable(isDroppableEnable);
            }

            $nullOperatorContainer = this.$('.right-null-operator-container');
            if ($nullOperatorContainer.is('.ui-droppable')) {
                $nullOperatorContainer.droppable(isDroppableEnable);
            }

            for (index = 0; index < tileViews.length; index++) {
                tileViews[index].enableOperators(isEnable);
            }

        },

        getMarqueeContainsNullTile: function getMarqueeContainsNullTile() {
            var tileViews = this.tileViews, index, result;
            if (this.model.get('type') === modelClassNamespace.TileItem.TileType.TERM_TILE) {
                return (this.model.get('base') === null) ? true : false;
            }
            for (index = 0; index < tileViews.length; index++) {
                result = tileViews[index].getMarqueeContainsNullTile();
                if (result) { return result; }
            }
        },


        /**
         * add class for all tiles inside marquee
         * @method addClassForAllTilesInsideMarquee
         * @public
         *
         */
        addClassForAllTilesInsideMarquee: function addClassForAllTilesInsideMarquee() {
            var index,
                tileArray = this.tileViews || [],
                operatorViews = this.$operatorViews || [],
                operator;
            if (tileArray.length > 0) {
                for (index = 0; index < tileArray.length; index++) {
                    tileArray[index].addClassForAllTilesInsideMarquee();
                    if (operatorViews[index]) {
                        operatorViews[index].addClass(viewClassNamespace.EquationManagerPro.TILE_INSIDE_MARQUEE);
                    }
                }
            }

            operator = this.parent.$operatorViews[this.parent.tileViews.indexOf(this)];
            if (operator) {
                operator.addClass(viewClassNamespace.EquationManagerPro.TILE_INSIDE_MARQUEE);
            }
            this.$el.addClass(viewClassNamespace.EquationManagerPro.TILE_INSIDE_MARQUEE);
        },

        /**
        * Returns the css for closed hand cursor
        * @method _getClosedHandCss
        * @private
        * @return {Object} Object containing the cursor property set to closed hand cursor.
        */
        _getClosedHandCss: function () {
            if (this.equationManager.isTouch()) {
                return {};
            }
            return { 'cursor': "url('" + this.getImagePath('closed-hand') + "'), move" };
        },

        /**
        * Returns the css for open hand cursor
        * @method _getOpenHandCss
        * @private
        * @return {Object} Object containing the cursor property set to open hand cursor.
        */
        _getOpenHandCss: function () {
            if (this.equationManager.isTouch()) {
                return {};
            }
            return { 'cursor': "url('" + this.getImagePath('open-hand') + "'), move" };
        },

        /**
        * Returns the css for default cursor
        * @method _getDefaultCursorCss
        * @private
        * @return {Object} Object containing the cursor property set to default cursor.
        */
        _getDefaultCursorCss: function () {
            if (this.equationManager.isTouch()) {
                return {};
            }
            return { 'cursor': '' };
        },

        /**
        * Returns an index of an item
        * Call this method on any tile item's parent..
        * @method getIndex
        * @public
        * @return {Object} Object Backbone View
        */
        getIndex: function (view) {
            var childIndex = this.tileViews.indexOf(view);
            return this.parent.getIndex(this) + '.' + childIndex;
        },

        /**
        * Method to stop listening all events of views
        * Call this method on any tile item's parent..
        * @method getIndex
        * @public
        * @return {Object} Object Backbone View
        */
        stopListeningEvents: function (bRecursive) {
            if (bRecursive) {
                for (var i = 0; i < this.tileViews.length; i++) {
                    this.tileViews[i].stopListeningEvents(true);
                }
            }
            this.stopListening();
        },

        /**
        * listens an event on operator change on every tiles operator change and calls this method
        *
        * @method changeOperatorArray
        * @public
        * @param model {Object} Backbone Model of tile item
        * @param operator {string} value of operator either '*' or '+'
        */
        changeOperatorArray: function (model, operator) {
            var parentCollection, index, $operatorChild,
				currentView;
            //$nullOperator = this.$('.null-operator-container');
            parentCollection = this.model.get('tileArray');
            index = parentCollection.indexOf(model);
            currentView = this.$operatorViews[index];

            if (currentView) {
                if (currentView.is('.ui-droppable')) {
                    currentView.droppable('disable');
                }
                currentView.off();
                currentView.remove();
            }

            //if ($nullOperator) {
            //    $nullOperator.off().remove();
            //    if ($nullOperator.is('.ui-droppable')) {
            //        $nullOperator.droppable('disable');
            //    }
            //}

            if (this.model.get('type') !==  modelClassNamespace.TileItem.TileType.PARENTHESES && model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                $operatorChild = this.createOperator(operator, null, model.get('type'));
            }
            else if (this.model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES && model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                $operatorChild = this.createOperator(operator, model.get('type'));
            }
            else {
                $operatorChild = this.createOperator(operator);
            }
            if ($operatorChild !== null) {
                $operatorChild.insertBefore(this.tileViews[index].el);
                this.$operatorViews[index] = $operatorChild;
                if (operator === '*') {
                    this.tileViews[index].$el.addClass('multiplied-tile');
                }
                else {
                    this.attachEventsOnOperator($operatorChild);
                }
            }
            if ((this.$operatorViews[index].hasClass('multiplication-operator-container') || this.$operatorViews[index].hasClass('null-operator-container')) && operator === null) {
                this.tileViews[index].$el.removeClass('multiplied-tile');
            }
            this.$operatorViews.splice(index, 1, $operatorChild);
        },

        enableDisableTiles: function enableDisableTiles(isEnable) {
            var tileViews = this.tileViews, i = 0,
                type = this.model.get('type'),
                TileType = modelClassNamespace.TileItem.TileType, operator;

            for (; i < tileViews.length; i++) {
                tileViews[i].enableDisableTiles(isEnable);
            }
            if (this.parent) operator = this.parent.$operatorViews[this.parent.tileViews.indexOf(this)];
            if (isEnable) {
                if (operator) {
                    operator.removeClass('disable');
                }
                if (type === TileType.TERM_TILE || type === TileType.PARENTHESES) {
                    this.$base.removeClass('disable');
                    this.isTileDisabled = !isEnable;
                    if (type === TileType.PARENTHESES) {
                        if (this.$exponent) {
                            this.$exponent.removeClass('disable');
                        }
                        this.$leftBracket.removeClass('disable');
                        this.$rightBracket.removeClass('disable');
                    }
                    if (this.$el.is('.ui-draggable')) {
                        this.$el.draggable('enable');
                    }
                }
            }
            else {
                if (operator) {
                    operator.addClass('disable');
                }
                if (type === TileType.TERM_TILE || type === TileType.PARENTHESES) {
                    this.$base.addClass('disable');
                    this.isTileDisabled = !isEnable;
                    if (type === TileType.PARENTHESES) {
                        if (this.$exponent) {
                            this.$exponent.addClass('disable');
                        }
                        this.$leftBracket.addClass('disable');
                        this.$rightBracket.addClass('disable');
                    }
                    if (this.$el.is('.ui-draggable')) {
                        this.$el.draggable('disable');
                    }
                }
            }
        },

        /**
        * As per given index, enable draggable/droppable tile
        *
        * @method enableDisableTilesItem
        * @param {String} elementIndex Element index which is to be enable. Should be seperate by |
        * @param {Boolean} enable True to enable tiles
        * @public
        */
        enableDisableTilesItem: function (elementIndex, enable) {
            var tileView = null,
                isDraggable = false,
                arrElmIndex,
                childOperator;
            if (elementIndex) {
                arrElmIndex = elementIndex.split('|');
                tileView = this.getViewFromIndex(arrElmIndex[0]);
                if (tileView) {
                    tileView.enableDisableTiles(enable);
                    //// If view contains any operator, remove disable class
                    //childOperator = this.getOperatorFromTileItem(tileView);
                    //if (childOperator) {
                    //    enable ? childOperator.removeClass('disabled_operator') : childOperator.addClass('disabled_operator');
                    //}
                    tileView.attachDetachDroppable(true, true);
                }
            }
        },

        /**
        * Returns the text for the value to be displayed.
        * For e.g. if a base has value -5 calling tile.getValueText('base')
        * would return "&minus;5" i.e. the escaped string.
        * @method getValueText
        * @param {String} Attribute to fetch
        * @return {String} String to display
        */
        getValueText: function (attr) {
            var val = this.model.get(attr);
            if (typeof val === 'string' && val.indexOf('-') !== -1) {
                val = '<em>' + val + '</em>';
                return '&minus;' + val.replace('-', '');
            }
            if (val !== null && val !== undefined) {
                if (isNaN(val)) {
                    return val < 0 ? '&minus;' + Math.abs(val) : '<em>' + val.toString() + '</em>';
                }
                else {
                    return val < 0 ? '&minus;' + Math.abs(val) : val.toString();
                }
            }
            else {
                return val;
            }
        },

        /**
        * returns a tile item view from index
        * method to called from equation view
        *
        * @method getViewFromIndex
        * @public
        * @param {indexString} index of tile item view
        * @return {tileView} Backbone view of tile item
        */
        getViewFromIndex: function getViewFromIndex(indexString) {
            var toIndex = indexString.indexOf('.'),
                subStr;

            toIndex = toIndex === -1 ? this.tileViews.length : toIndex;
            subStr = parseInt(indexString.substring(0, toIndex));
            if (indexString.length > 1) {
                indexString = indexString.substring(toIndex + 1, indexString.length);
                if (indexString === "") {
                    return this.tileViews[subStr];
                }
                return this.tileViews[subStr].getViewFromIndex(indexString);
            }
            else {
                return this.tileViews[subStr];
            }
        },

        /**
        * resets a view
        * @method reset
        * @public
        */
        reset: function () {
            var tileViews = this.tileViews;
            for (var i = 0; i < tileViews.length; i++) {
                tileViews[i].reset();
            }
            this.$el.off().empty();
            this.off();
        },

        /**
        * adds hover effect of tile
        * @method highlightTiles
        * @public
        */
        highlightTiles: function highlightTiles() {
            var tileViews = this.tileViews, tileViewsLen = tileViews.length, i = 0;
            if (tileViewsLen !== 0) {
                for (; i < tileViewsLen; i++) {
                    tileViews[i].highlightTiles();
                }
            }
            else {
                this.$el.addClass('hover-border');
            }
        },

        /**
        * Given a text, this function either removes a minus sign or adds one.
        * e.g. invertText('−5') returns '5'
        * e.g. invertText('3') returns '−3'
        * @method invertText
        * @param {String} Text to invert
        * @return {String} Inverted text
        */
        invertText: function (text) {
            var minus = '−',
                parsedText = parseInt(text),
                textWithoutMinus = null;      // Unicode Character 'MINUS SIGN' (U+2212)
            if (text.indexOf(minus) === -1) {
                if (isNaN(parsedText)) {
                    return minus + '<em>' + text + '</em>';
                }
                else {
                    return minus + text;
                }
            } else {
                textWithoutMinus = text.substr(minus.length);
                if (isNaN(parseInt(textWithoutMinus))) {
                    return '<em>' + textWithoutMinus + '</em>';
                }
                else {
                    return textWithoutMinus;
                }
            }
        },


        addNullTileCase: function addNullTileCase(operation, dummyTileValue) {
            var expressionView, index, fractionAdded, data = {}, isLHS = this.model.get('isLHS');
            if (this.equationManager.getTileAddedInExpression() === null) {
                this.equationManager.setTileAddedInExpression(isLHS);
                //this.equationManager.disableMarquee(true, true);
                if (!isLHS) {
                    expressionView = this.equationManager.equationView.tileViews[0];
                    index = expressionView.multiplicationIndex;
                }
                else {
                    expressionView = this.equationManager.equationView.tileViews[1];
                    index = expressionView.fractionIndex;
                }
                if (operation === modelClassNamespace.TileItem.OPERATORS.ADDITION) {
                    data = {
                        operation: '+',
                        tileValue: null,
                        index: expressionView.parent.getIndex(expressionView).substr(0, 1) + '.' + expressionView.tileViews.length,
                        isLHS: !isLHS,
                        isDenominator: false,
                        dummyTileValue: dummyTileValue
                    };
                    this.equationManager.onAddTile(data);
                    this.equationManager.scrollExpression(expressionView, 'scrollToRight');
                }
                else {
                    if (this.isDenominator || this.model.get('isDenominator')) {
                        fractionAdded = true;
                        index = expressionView.fractionIndex;
                    }
                    else {
                        fractionAdded = false;
                        index = expressionView.multiplicationIndex;
                    }
                    data = {
                        isLHS: expressionView.model.get('isLHS'),
                        isDenominator: this.isDenominator || this.model.get('isDenominator'),
                        index: expressionView.multiplicationIndex ? index : expressionView.index,
                        operation: '*',
                        tileValue: null,
                        parenthesesAdded: expressionView.parenthesesAdded,
                        fractionAdded: expressionView.multiplicationIndex ? expressionView.fractionAdded : fractionAdded,
                        tilesToAddInFraction: expressionView.tilesToAddInFraction,
                        dummyTileValue: dummyTileValue
                    };
                    this.equationManager.onAddTile(data);
                    //this.equationManager.scrollExpression(expressionView, 'scrollToLeft');
                }

            }
            else {
                this.equationManager.setTileAddedInExpression();
            }
        },


        containsNullTile: function containsNullTile() {
            var tileViews = this.tileViews, i = 0, result;
            for (; i < tileViews.length; i++) {
                result = tileViews[i].containsNullTile();
                if (result) { return result; }
            }
            if (this.model.get('type') === modelClassNamespace.TileItem.TileType.TERM_TILE) {
                return (this.model.get('base') === null) ? this : false;
            }
        },

        /**
        * returns true if tile item has child view
        * @method hasChildView
        * @param {tileView} Tile item view
        * @param {bRecursive} boolean
        * @return {boolean}
        */
        hasChildView: function (tileView, bRecursive) {
            var tileViews = this.tileViews,
                i = 0;
            if (tileViews.indexOf(tileView) !== -1) {
                return true;
            }
            if (bRecursive) {
                for (; i < tileViews.length; i++) {
                    if (tileViews[i].hasChildView(tileView)) {
                        return true;
                    }
                }
            }
            return false;
        },


        checkForNestedLevelOfParentheses: function checkForNestedLevelOfParentheses() {
            var tileViews = this.tileViews, i = 0, index, result;
            if (this.model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                index = this.parent.getIndex(this);
                index = modelClassNamespace.EquationManagerPro.Utils.getParentIndex(index);
                if (this.equationManager.equationView.getViewFromIndex(index).model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                    return true;
                }
            }
            for (; i < tileViews.length; i++) {
                result = tileViews[i].checkForNestedLevelOfParentheses();
                if (result) { return result; }
            }
        },

        //checkContainsParOrFraction: function checkContainsParOrFraction() {
        //    var tileViews = this.tileViews, i = 0, index, result, type = this.model.get('type');
        //    for (; i < tileViews.length; i++) {
        //        result = tileViews[i].checkContainsParOrFraction();
        //        if (result) { return ++result; }
        //    }
        //    if (type === modelClassNamespace.TileItem.TileType.PARENTHESES || type === modelClassNamespace.TileItem.TileType.FRACTION) {
        //        return 1;
        //    }
        //},

        hideOperatorOfParCoeff: function hideOperatorOfParCoeff() {
            var tileViews = this.tileViews, i = 0, index, result;
            for (; i < tileViews.length; i++) {
                tileViews[i].hideOperatorOfParCoeff();
            }
        },

        /**
        * Returns the tile next to this tile. If it's the last tile return undefined.
        * @method getNextTile
        * @return {Object} Tile next to this
        */
        getNextTile: function () {
            if (!this.parent) { return; }

            var index = this.parent.tileViews.indexOf(this);
            if (this.parent.tileViews[index + 1]) { return this.parent.tileViews[index + 1]; }
        },

        /**
        * Returns the tile before this tile. If it's the first tile return undefined.
        * @method getPrevTile
        * @return {Object} Tile before this tile
        */
        getPrevTile: function () {
            if (!this.parent) { return; }

            var index = this.parent.tileViews.indexOf(this);
            if (this.parent.tileViews[index - 1]) { return this.parent.tileViews[index - 1]; }
        },

        /**
        * DeActivate all events for all draggable tiles
        *
        * @method deActivateEventOnTiles
        * @param {Boolean} bRecursive True if recursively deActivate all tiles events
        * @public
        */
        deActivateEventOnTiles: function (bRecursive) {
            var tilesView = this.tileViews,
                child,
                length = 0,
                tileItem = null;
            if (tilesView) {
                length = tilesView.length;
            }
            if (length > 0
                && bRecursive) {
                for (var i = 0; i < length; i++) {
                    child = tilesView[i];
                    child.deActivateEventOnTiles(bRecursive);
                }
            }
            else {
                // DeActivate event on tiles
            }
        },

        getOperatorFromTileItem: function getOperatorFromTileItem(itemView) {
            if (this.tileViews) {
                var index = this.tileViews.indexOf(itemView);
                return this.$operatorViews[index];
            }
            return null;
        },

        coefficientOfXWithFraction: function coefficientOfXWithFraction() {
            return false;
        }


    }, {

        /**
        * Creates TileItemView object.
        * @method createTileItemView
        * @static
        * @param model {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManagerPro.Models.TileItem} model of the view
        * @param parent {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManagerPro.Views.TileView} parent view
        * @param equationManager {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Views.EquationManagerPro} equation manager object
        */
        createTileItemView: function (model, parent, equationManager, player, isTutorialMode) {
            var itemTypes = modelClassNamespace.TileItem.TileType,
                itemView,
                commonData = {
                    model: model,
                    parent: parent,
                    equationManager: equationManager,
                    player: player,
                    isTutorialMode: isTutorialMode
                };
            switch (model.get('type')) {
                case itemTypes.TERM_TILE:
                    {
                        itemView = new viewClassNamespace.TermTileView(commonData);
                    }
                    break;
                case itemTypes.PARENTHESES:
                    {
                        itemView = new viewClassNamespace.ParenthesesTileView(commonData);
                    }
                    break;
                case itemTypes.FRACTION:
                    {
                        itemView = new viewClassNamespace.FractionTileView(commonData);
                    }
                    break;
                case itemTypes.SQUARED_PARENTHESES:
                    {
                        itemView = new viewClassNamespace.SquaredParenthesesTileView(commonData);
                    }
                    break;
                case itemTypes.EXPRESSION:
                    {
                        itemView = new viewClassNamespace.ExpressionTileView(commonData);
                    }
                    break;
                case itemTypes.EQUATION:
                    {
                        itemView = new viewClassNamespace.EquationView(commonData);
                    }
                    break;
                default:
                    {
                        throw new Error("Invalid tile type");
                    }
            }

            return itemView;
        },



        /**
        * Classes used for equation renndering.
        * @property CLASSES
        * @static
        */
        CLASSES: {
            TermTile: 'term-tile',
            BASE: 'base',
            EXPONENT: 'exponent',
            BASE_ONLY: 'base-only',
            Bracket: 'bracket',
            PARENTHESES: 'parentheses',
            LeftBracket: 'left-bracket',
            RightBracket: 'right-bracket',
            FRACTION: 'fraction-component',
            NUMERATOR: 'numerator',
            DENOMINATOR: 'denominator',
            VINICULUM: 'vinicullum',
            Level: 'level',
            OperatorContainer: 'operator-container',
            Operator: 'operator',
            '*': 'multiplication',
            '+': 'addition'
        },

        /**
        * Scroll settings used for draggable scrolling.
        * @property Scroll
        * @static
        */
        Scroll: {
            SENSITIVITY: 50,
            SPEED: MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile ? 40 : (function () {
                var BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
                if (BrowserCheck.isIE || BrowserCheck.isIE11) {
                    return true;
                }
                return false;
            })() ? 60 : 30,
            ENABLE: true
        }

    });

})();
