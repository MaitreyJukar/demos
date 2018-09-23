(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point;

    /**
    * FractionTileView holds the data for the fraction tile view.
    *
    * @class FractionTileView
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManagerPro.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    */
    viewClassNamespace.FractionTileView = viewClassNamespace.TileView.extend({
        initialize: function () {
            this.tileViews = [];
            this.$operatorViews = [];
            viewClassNamespace.FractionTileView.__super__.initialize.apply(this, arguments);
            this.listenEvents();
            this.initializeDefaultProperties();
        },

        /**
        * reners fraction tile view
        * @method render
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
         * Creates a Html template for fraction tile view
         * @method createView
         * @public
         *
         */
        createView: function (index) {
            var classes = viewClassNamespace.TileView.CLASSES,
                i = 0, $child, tileView, $numeratorContainer, $denominatorContainer;

            this.$base = $('<div></div>').addClass('fraction-component');
            $numeratorContainer = $('<div></div>', { class: 'numerator-container' });
            this.$numeratorDiv = $('<div></div>', { class: classes.NUMERATOR });
            $denominatorContainer = $('<div></div>', { class: 'denominator-container' });
            this.$denominatorDiv = $('<div></div>').addClass(classes.DENOMINATOR);
            this.$vinculumLine = $('<div></div>').addClass(classes.VINICULUM);
            this.$base.append($numeratorContainer.append(this.$numeratorDiv)).append(this.$vinculumLine).append($denominatorContainer.append(this.$denominatorDiv));
            this.$el.append(this.$base);
            this.$el.addClass(classes.FRACTION);

            for (i = 0; i < this.tileViews.length; i++) {
                tileView = this.tileViews[i];
                if (tileView.model.get('isDenominator') === false) {
                    $child = tileView.createView(index + '.' + i);
                    this.$numeratorDiv.append($child);
                }
                else {
                    break;
                }
            }

            for (; i < this.tileViews.length; i++) {
                tileView = this.tileViews[i];
                if (tileView.model.get('isDenominator') === true) {
                    $child = tileView.createView(index + '.' + i);
                    this.$denominatorDiv.append($child);
                }
            }
            this.createOperatorView();
            this.equationManager.setDeletedItemsInParenthesesFraction(index, this.model.get('type'));
            return this.$el;
        },

        /**
         * renders an operator
         * @method createOperatorView
         * @public
         *
         */
        createOperatorView: function () {
            var i = 0, $operatorChild, operator, tileView, type;

            for (; i < this.tileViews.length; i++) {
                tileView = this.tileViews[i];
                operator = tileView.model.get('operator');
                type = tileView.model.get('type');
                if (operator !== null) {
                    if (operator === '*') {
                        $operatorChild = this.createOperator(operator, type);
                        $operatorChild.insertBefore(tileView.$el);
                        // check for parentheses operator
                        //if (type !== modelClassNamespace.TileItem.TileType.PARENTHESES) {
                        tileView.$el.addClass('multiplied-tile');
                        //}
                    }
                    else {
                        $operatorChild = this.createOperator(operator);
                        $operatorChild.insertBefore(tileView.$el);
                        this.attachEventsOnOperator($operatorChild);
                    }
                    this.$operatorViews[i] = $operatorChild;
                }
                else {
                    this.$operatorViews[i] = null;
                }
            }
        },

        /**
         * create an operator if there any
         * @method createOperator
         * @param {operator} type of operator
         * @param {tileType} type of tile item
         * @public
         */
        createOperator: function (operator, tileType) {
            var operator, $operatorChild,
                classes = viewClassNamespace.TileView.CLASSES,
                $operatorDiv = $('<div></div>'), $insertionCursor;
            if (operator !== null) {
                $operatorChild = $('<div></div>').addClass(classes.OperatorContainer);
                if (operator === '+') {
                    $operatorDiv.html('&#43;');
                }
                else if (operator === '*' && tileType === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                    $operatorDiv.addClass('parentheses-coefficient-operator');
                    $operatorChild.addClass('parentheses-coefficient-operator-container');
                }
                else if (operator === '*') {
                    $operatorDiv.addClass('multiplication-operator');
                    $operatorChild.addClass('multiplication-operator-container');
                }
                $operatorDiv.addClass(classes.Operator).appendTo($operatorChild);
                $insertionCursor = $('<div></div>').addClass('insertion-cursor').hide().appendTo($operatorChild);
                return $operatorChild;
            }
            return null;
        },

        /**
        * listener on collections of tile array
        * @method onAddTile
        * @public
        */
        onAddTile: function (model, collection, options) {
            var operator = model.get('operator'), $operatorChild,
                index = (options.at !== null && options.at !== undefined) ? parseInt(options.at, 10) : this.tileViews.length,
                tileView = viewClassNamespace.TileView.createTileItemView(model, this, this.equationManager, this.player, this.isTutorialMode),
                $tileViewElm = tileView.createView(this.parent.getIndex(this) + '.' + index),
                numLength = this.getNumeratorLength(this.tileViews),
                denLength = this.tileViews.length - numLength,
                isAnimating = model.get('isAnimate');



            if (this.equationManager.restrictFirstTileAnimation === false) {
                if (isAnimating) {
                    $tileViewElm.css({ 'visibility': 'hidden' }).addClass('animated-tiles');
                }
            }
            if (index === 0) {
                if (model.get('isDenominator') === false) {
                    this.$numeratorDiv.prepend($tileViewElm);
                }
                else {
                    this.$denominatorDiv.prepend($tileViewElm);
                }
            }
            else if (model.get('isDenominator') === false && numLength === 0) {
                this.$numeratorDiv.append($tileViewElm);
            }
            else if (model.get('isDenominator') === true && denLength === 0) {
                this.$denominatorDiv.append($tileViewElm);
            }
            else {
                if (index === numLength && model.get('isDenominator') === true) {
                    this.$denominatorDiv.prepend($tileViewElm);
                }
                else {
                    $tileViewElm.insertAfter(this.tileViews[index - 1].$el);
                }
            }
            if (this.equationManager.restrictFirstTileAnimation === true) {
                this.equationManager.firstTile = $tileViewElm;
            }
            $operatorChild = this.createOperator(tileView.model.get('operator'));
            if ($operatorChild !== null) {
                if (isAnimating === true && this.equationManager.restrictFirstTileAnimation === false) {
                    $operatorChild.css('visibility', 'hidden').addClass('invisible-operators');
                }
                $operatorChild.insertBefore(tileView.$el);
                this.$operatorViews.splice(index, 0, $operatorChild);
                if (operator === '*') {
                    tileView.$el.addClass('multiplied-tile');
                }
                else {
                    this.attachEventsOnOperator($operatorChild);
                }
            }
            else {
                this.$operatorViews.splice(index, 0, null);
            }

            model.set('isAnimate', false);
            this.equationManager.restrictFirstTileAnimation = false;
            //tileView.fillRects();
            tileView.attachEvents();
            this.equationManager.tileAdded(tileView);
            this.tileViews.splice(index, 0, tileView);

        },

        /**
        * listener on collections of tile array
        * @method onRemoveTile
        * @param {model} model to be removed
        * @param {collection} collection from which the model is getting removed
        * @param {options} options of model
        * @public
        */
        onRemoveTile: function (model, collection, options) {
            var index = options.index,
                tileView = this.tileViews[index],
                operatorView = null,
                self = this;

            if (self.$operatorViews[index] !== null) {
                operatorView = this.$operatorViews[index];
            }
            this.equationManager.setDeletedItemsInParenthesesFraction(this.parent.getIndex(this), this.model.get('type'));
            this.$operatorViews.splice(index, 1);
            this.tileViews.splice(index, 1);

            tileView.stopListeningEvents(true);

            if (operatorView) {
                if (operatorView.is('.ui-droppable')) {
                    //operatorView.droppable('disable');
                }
                operatorView.off();
                operatorView.remove();
            }
            tileView.$el.remove();
            tileView.off();
        },


        /**
        * attach events on operator
        * @method attachEventsOnOperator
        * @public
        */
        attachEventsOnOperator: function attachEventsOnOperator($operatorChild) {
            if (this.isTutorialMode) {
                return;
            }

            var self = this;
            $operatorChild.droppable({
                accept: this.model.get('strDroppables'),
                tolerance: 'pointer',
                greedy: true,
                drop: function (event, ui) {
                    self.onDropOperator(event, ui);
                },
                over: function (event, ui) {
                    self.onMouseOverOperator(event, ui);
                    ui.draggable.data('cur-droppable', self);
                },
                out: function (event, ui) {
                    self.onMouseOutOperator(event, ui);
                    ui.draggable.removeData('cur-droppable');
                }
            });
        },


        /**
        * mouse over event on operator
        * @method onMouseOverOperator
        * @public
        */
        onMouseOverOperator: function (event, ui) {
            var helper = ui.helper;
            if (this.equationManager.getTileAddedInExpression() !== null || helper.data('tilevalue') === 't' || this.equationManager.getFirstTileDrop() === false) {
                return;
            }
            //if (helper.data('tiletype') !== modelClassNamespace.TileItem.TileType.BIN_TILE) {
            $(event.target).find('.insertion-cursor').show();
            //}
            ui.helper.data('add-tile-droppable', $(event.target));
        },

        /**
        * mouse out event on operator
        * @method onMouseOutOperator
        * @public
        */
        onMouseOutOperator: function (event, ui) {
            $(event.target).find('.insertion-cursor').hide();
        },

        /**
        * drop event on operator
        * @method onDropOperator
        * @public
        */
        onDropOperator: function onDropOperator(event, ui) {
            var $target = $(event.target),
               $insCur = $target.find('.insertion-cursor').hide();

            if (this.equationManager.getTileAddedInExpression() !== null) {
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 16), this.getAccMessage('inline-feedback-text', 16));
                return;
            }
            if (ui.helper.data('tiletype') === modelClassNamespace.TileItem.TileType.BIN_TILE || ui.helper.data('tilevalue') === 't') {
                return;
            }
            var tileViews = this.tileViews, i = 0, tileViewsLen = tileViews.length,
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData['tiletype'],
                draggableTileIndex = tileViews.indexOf(draggedTile),
                length = draggedTileData['length'], // this attribute will get set in marquee
                numOfTiles = 1,
                destTileView,
                operatorIndex, bResponse,
                data = {};

            if (length) {
                numOfTiles = length;
            }
            else {
                numOfTiles = 1;
            }

            for (; i < tileViewsLen + 1; i++) {
                if (this.$operatorViews[i] && (this.$operatorViews[i].get(0) === $target.get(0))) {
                    operatorIndex = i;
                    break;
                }
                if ($target.hasClass('right-null-operator-container')) {
                    operatorIndex = tileViewsLen;
                    break;
                }
                else if (this.$operatorViews[i] === null && $target.hasClass('null-operator-container')) {
                    operatorIndex = i;
                    break;
                }
            }

            if (draggableTileIndex + 1 === operatorIndex || draggableTileIndex === operatorIndex) {
                return;
            }

            if (operatorIndex < tileViewsLen) {
                destTileView = tileViews[operatorIndex];
                data.bLeft = true;
            }
            else if (operatorIndex === tileViewsLen) {
                destTileView = tileViews[operatorIndex - 1];
                data.bLeft = false;
            }

            if (draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                data = {
                    tileValue: draggedTileData['tilevalue'],
                    operation: '+',
                    index: destTileView.parent.getIndex(destTileView),
                    isDenominator: destTileView.model.get('isDenominator'),
                    isLHS: destTileView.model.get('isLHS'),
                    bLeft: data.bLeft
                };
                bResponse = this.equationManager.onAddTile(data);
            }
            else {
                data = {
                    sourceTile: draggedTile,
                    destTile: destTileView,
                    numOfTiles: numOfTiles,
                    bLeft: data.bLeft
                };
                bResponse = this.equationManager.onRepositionTile(data);
            }

            if (bResponse) {
                ui.draggable.data('isDropped', true);
            }
        },

        /**
        * change event listener of operator in fraction
        * @method _onOperatorChange
        * @param {model} Model of tile item
        * @param {operator} type of operator
        * @private
        */
        _onOperatorChange: function (model, operator) {
            this.parent.changeOperatorArray(model, operator);
        },


        /**
        * listen events on model collections
        * @method listenEvents
        * @public
        */
        listenEvents: function listenEvents() {
            this.listenTo(this.model.get('tileArray'), 'add', this.onAddTile);
            this.listenTo(this.model.get('tileArray'), 'remove', this.onRemoveTile);
            this.listenTo(this.model, 'change:operator', this._onOperatorChange);
            if (this.equationManager.solveFractionToDecimal) {
                this.listenTo(this.model, modelClassNamespace.FractionTile.SOLVE_FRACTION_TO_DECIMAL, this._solveFractionToDecimal);
            }
        },

        _solveFractionToDecimal: function _solveFractionToDecimal() {
            this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 22));
        },

        /**
         * returns length numerator tile items
         * @method getNumeratorLength
         * @param {tiles} tile array
         * @public
         */
        getNumeratorLength: function (tiles) {
            var index, count = 0,
                length = tiles.length;

            for (index = 0; index < length; index++) {
                if (tiles[index].model.get('isDenominator') === false) {
                    count++;
                }
            }
            return count;
        },

        /**
        * attach events on view and its children views
        * @method attachEvents
        * @public
        */
        attachEvents: function () {
            var i = 0, self = this;

            for (i = 0; i < this.tileViews.length; i++) {
                this.tileViews[i].attachEvents();
            }
            //this.$el.droppable({
            //    accept: this.model.get('strDroppables'),
            //    tolerance: 'pointer',
            //    greedy: true,
            //    drop: function (event, ui) {
            //        if (!self.equationManager.getIsDropped()) {
            //            ui.draggable.removeData('cur-droppable');
            //            self.equationManager.setIsDropped(true);
            //        }
            //    },
            //    over: function (event, ui) {
            //        ui.draggable.data('cur-droppable', self);
            //    },
            //    out: function (event, ui) {
            //        //self.onMouseOut(event, ui);
            //        ui.draggable.removeData('cur-droppable');
            //    }
            //});
        },

        hideOperatorOfParCoeff: function hideOperatorOfParCoeff() {
            var tileViews = this.tileViews, i = 0;
            for (; i < tileViews.length; i++) {
                if (tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES && tileViews[i + 1] && tileViews[i + 1].model.get('operator') === '*') {
                    this.$operatorViews[i + 1].hide();
                }
            }
        },

        /**
         * gets html structure of each term
         * @method getTileContentInHtmlForm
         * @return {htmlString} htmlString to parent
         * @public
         */
        getTileContentInHtmlForm: function getTileContentInHtmlForm(bigParenthesesColor) {
            var model = this.model,
                operator = model.get('operator'),
                exponent = model.get('exponent'),
                tileArray = this.tileViews,
                htmlString = '', index, vincullum,
                isNumeratorEmpty = true,
                isDenominatorEmpty = true,
                numeratorString,
                denominatorString,
                isFractionParentParenthesis = false,
                numBody = '',
                denBody = '';
            //multiplicationOperatiorClass = this.filePath.getFontAwesomeClass('dot');
            //isFractionParentParenthesis = this.parent.model.get('type') === modelClassNamespace.TileItem.SolveTileType.BIG_PARENTHESIS ? true : false;

            //if (operator === '*') {
            //    htmlString = htmlString + '<div class=\'operator-data-tab\'></div>';
            //}

            switch (operator) {
                case '*':
                    //htmlString = htmlString + '<div class=\'multiplication-operator equation-common\'></div>';
                    htmlString += MathInteractives.Common.Components.templates['mathematicalOperators']({
                        operator: {
                            'multiplication': true
                        }
                    }).trim();
                    break;
                case '+':
                    //htmlString = htmlString + '<div class=\'addition-operator equation-common\'>&#43;</div>';
                    htmlString += MathInteractives.Common.Components.templates['mathematicalOperators']({
                        operator: {
                            'addition': true
                        }
                    }).trim();
                    break;
            }

            //if (isFractionParentParenthesis) {
            //    numeratorString = '<div class=\'fraction-data-tab adjust-bottom equation-common\'><div class=\'numerator equation-common\'>';
            //}
            //else {
            //    numeratorString = '<div class=\'fraction-data-tab equation-common\'><div class=\'numerator equation-common\'>';
            //}


            //htmlString += numeratorString;
            for (index = 0; index < tileArray.length; index++) {
                if (!tileArray[index].model.get('isDenominator')) {
                    //htmlString += tileArray[index].getTileContentInHtmlForm();
                    numBody += tileArray[index].getTileContentInHtmlForm(bigParenthesesColor);
                    isNumeratorEmpty = false;
                }
            }
            //if (isNumeratorEmpty === true) {
            //    htmlString = htmlString.replace(numeratorString, '<div class=\'fraction-data-tab equation-common\'><div class=\'numerator numerator-empty equation-common\'>1');
            //}

            //htmlString += '</div><div class=\'vinicullum\'></div>';
            //denominatorString = '<div class=\'denominator equation-common\'>';
            //htmlString += denominatorString;
            for (index = 0; index < tileArray.length; index++) {
                if (tileArray[index].model.get('isDenominator')) {
                    //htmlString += tileArray[index].getTileContentInHtmlForm();
                    denBody += tileArray[index].getTileContentInHtmlForm(bigParenthesesColor);
                    isDenominatorEmpty = false;
                }
            }
            //if (isDenominatorEmpty === true) {
            //    htmlString = htmlString.replace(denominatorString, '<div class=\'denominator denominator-empty equation-common\'>');
            //}

            //htmlString += '</div></div>';

            htmlString += MathInteractives.Common.Components.templates['fractionExpr']({
                'isNumeratorEmpty': isNumeratorEmpty,
                'isFractionParentParenthesis': isFractionParentParenthesis,
                'numeratorBody': numBody,
                'isDenominatorEmpty': isDenominatorEmpty,
                'denominatorBody': denBody
            }).trim();

            return htmlString;
        },

        getAccString: function getAccString(avoidOperator) {
            var currentString = '',
                model = this.model,
                tileViews = this.tileViews,
                tileViewLength = tileViews.length,
                operator = model.get('operator'),
                index = 0;

            if (!avoidOperator) {
                switch (operator) {
                    case '*':
                        currentString += this.getAccMessage('operators-text', 0);
                        break;
                    case '+':
                        currentString += this.getAccMessage('operators-text', 1);
                        break;
                    default:
                        currentString += '';
                        break;
                }
            }
            else {
                avoidOperator = false;
            }

            for (; index < tileViewLength; index++) {
                currentString += tileViews[index].getAccString(avoidOperator);
            }
            return ' ' + currentString.trim();
        },

        /**
        * Returns the elements that are inside the marquee drawn.
        * @method getElementsInsideMarquee
        * @param {Object} Marquee end event
        * @param {Object} Marquee div
        */
        /* getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee) {
             var marqueeRect = new Rect($marquee[0].getBoundingClientRect()),
                 middleOfRect = marqueeRect.getMiddle(), i = 0, rect, length,
                 vinculumRect = new Rect(this.$vinculumLine[0].getBoundingClientRect()),
                 currentTile = null,
                 //NUMERATOR_MARQUEE_CLASS = viewClassNamespace.EquationManager.NUMERATOR_MARQUEE_CLASS,
                 //DENOMINATOR_MARQUEE_CLASS = viewClassNamespace.EquationManager.DENOMINATOR_MARQUEE_CLASS,
                 marqueeBDenominator = vinculumRect.get('top') < event.marqueeStartY,
                 mouseUpPoint = new Point({ left: event.marqueeStartX, top: event.marqueeStartY });

             if (vinculumRect.isPointInRect(mouseUpPoint)) {
                 marqueeBDenominator = event.clientY > event.marqueeStartY ? true : false;
             }

             if (this.$vinculumLine.css('visibility') === 'hidden') {
                 marqueeBDenominator = false;
             }

             for (i = 0, length = this.tileViews.length; i < length; i++) {
                 rect = new Rect(this.tileViews[i].$el[0].getBoundingClientRect());
                 middleOfRect = rect.getMiddle();
                 currentTile = this.tileViews[i].model;

                 if (currentTile.get('isDenominator') === marqueeBDenominator) {
                     this.tileViews[i].getElementsInsideMarquee(event, $marquee);
                 }
             }

             //$marquee.removeClass(DENOMINATOR_MARQUEE_CLASS)
                 //.removeClass(NUMERATOR_MARQUEE_CLASS);
             marqueeBDenominator ? $marquee.addClass(DENOMINATOR_MARQUEE_CLASS) : $marquee.addClass(NUMERATOR_MARQUEE_CLASS);
         },*/

        /**
        * Returns the elements that are inside the marquee drawn.
        * @method getElementsInsideMarquee
        * @param {Object} Marquee end event
        * @param {Object} Marquee div
        */
        getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee) {
            var i = 0, currentTile,
                mouseUpPoint = new Point({ left: event.marqueeStartX, top: event.marqueeStartY }),
                vinculumRect = new Rect(this.$vinculumLine[0].getBoundingClientRect()),
                marqueeBDenominator = vinculumRect.get('top') < event.marqueeStartY,
                tileViews = this.tileViews;

            if (this.isFractionInMarquee($marquee)) {
                if (this.equationManager.getWhetherPlusOperatorPresent(this.model.get('treeNodeRef'))) {
                    var firstTileInMultGroup = this,
                        nextTile;
                    while (firstTileInMultGroup && firstTileInMultGroup.model.get('operator') === modelClassNamespace.TileItem.OPERATORS.MULTIPLICATION) {
                        firstTileInMultGroup = firstTileInMultGroup.getPrevTile();
                    }
                    this.equationManager.pushElementToSelection(firstTileInMultGroup, firstTileInMultGroup.model.get('treeNodeRef'));
                    nextTile = firstTileInMultGroup.getNextTile();
                    while (nextTile && nextTile.model.get('operator') === modelClassNamespace.TileItem.OPERATORS.MULTIPLICATION) {
                        this.equationManager.pushElementToSelection(nextTile, nextTile.model.get('treeNodeRef'));
                        nextTile = nextTile.getNextTile();
                    }
                }
                else {
                    this.equationManager.pushElementToSelection(this, this.model.get('treeNodeRef'));
                }
            } else {
                if (vinculumRect.isPointInRect(mouseUpPoint)) {
                    marqueeBDenominator = event.clientY > event.marqueeStartY ? true : false;
                }
                if (this.$vinculumLine.css('visibility') === 'hidden') {
                    marqueeBDenominator = false;
                }
                for (i = 0; i < tileViews.length; i++) {
                    currentTile = tileViews[i].model;
                    if (currentTile.get('isDenominator') === marqueeBDenominator) {
                        this.tileViews[i].getElementsInsideMarquee(event, $marquee);
                    }
                }
            }
        },

        /**
        * Checks if the parenthesis is inside marquee and returns true or false
        * @method isParenthesisInMarquee
        * @param {Object} Marquee view
        * @return {Boolean} Boolean representing if the parenthesis is inside the marquee
        */
        isFractionInMarquee: function ($marquee) {
            var tileRect = new Rect(this.$el[0].getBoundingClientRect()),
                marqueeRect = new Rect($marquee[0].getBoundingClientRect()),
                middleOfTile = tileRect.getMiddle(),
                threshold = 0.5;

            return marqueeRect.isPointInRect(middleOfTile) &&
                marqueeRect.getWidth() > threshold * tileRect.getWidth() &&
                marqueeRect.getHeight() > threshold * tileRect.getHeight();
        },

        getWhetherTermPresent: function getWhetherTermPresent(term) {
            if (term === this) {
                return true;
            }
            var tileViews = this.tileViews,
                index;
            for (index = 0; index < tileViews.length; index++) {
                if (tileViews[index].getWhetherTermPresent(term) === true) {
                    return true;
                }
            }
            return false;
        },

        coefficientOfXWithFraction: function coefficientOfXWithFraction() {
            var index = 0;
            if (this.tileViews.length !== 2) {
                return false;
            }
            for (; index < this.tileViews.length; index++) {
                if (typeof this.tileViews[index].model.get('base') === 'string') {
                    return false;
                }

            }
            return true;
        }

    }, {

    });

})();
