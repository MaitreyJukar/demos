(function (MathInteractives) {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point;

    /**
    * holds the data for the Expression View.
    *
    * @class ExpressionTileView
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManagerPro.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    */
    viewClassNamespace.ExpressionTileView = viewClassNamespace.TileView.extend({

        /**
        * Array of tile views inside expression view
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

        /**
        * currently hovered tile
        * @property curHoveredTile
        * @type Object
        * @default null
        */
        curHoveredTile: null,

        /**
        * stores Jquery object of an expression element
        * @property $expression
        * @type Object
        * @default null
        */
        $expression: null,


        initialize: function () {
            this.tileViews = [];
            this.$operatorViews = [];
            viewClassNamespace.EquationView.__super__.initialize.apply(this, arguments);
            this.initializeDefaultProperties();
            this.listenEvents();
        },

        /**
        * reners expression view
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
         * Creates a Html template for equation view
         * @method createView
         * @public
         *
         */
        createView: function () {
            var isLHS = this.model.get('isLHS') ? 'lhs-' : 'rhs-';
            this.$el.addClass('expression-view-holder ' + isLHS + 'expression-view-holder');
            var i = 0, arrEqViews = this.tileViews, $child,
                $expression = $('<div></div>').addClass('expression-view'),
                $marqueeContainer = $('<div></div>').addClass('expression-marquee-container ' + isLHS + 'expression-marquee-container');

            $marqueeContainer.append($expression);

            this.$el.append($marqueeContainer);

            for (i = 0; i < arrEqViews.length; i++) {
                $child = arrEqViews[i].createView(this.parent.getIndex(this) + '.' + i);
                $expression.append($child);
            }
            this.$expression = $expression;
            this.createOperatorView();
            return this.$el;
        },


        /**
        * to check whether there is fraction present in expression
        * @method checkForFractionInExpression
        * @public
        */
        checkForFractionInExpression: function checkForFractionInExpression() {
            var tileViews = this.tileViews, i = 0, isParenthesesHasFraction,
                $expressionView = this.$el.find('.expression-view'),
                tileType = modelClassNamespace.TileItem.TileType;
            $expressionView.removeClass('expression-with-fraction expression-without-fraction')
            for (; i < tileViews.length; i++) {
                if (tileViews[i].model.get('type') === tileType.FRACTION) {
                    $expressionView.addClass('expression-with-fraction');
                    break;
                }
                else if (tileViews[i].model.get('type') === tileType.PARENTHESES) {
                    isParenthesesHasFraction = tileViews[i].checkForFractionInExpression();
                    if (isParenthesesHasFraction) {
                        $expressionView.addClass('expression-with-fraction');
                        break;
                    }
                }
            }
            if (i === tileViews.length) {
                $expressionView.addClass('expression-without-fraction');
            }
        },

        /**
         * renders an operator
         * @method createOperatorView
         * @public
         *
         */
        createOperatorView: function () {
            var i = 0, $operatorChild, tileView, operator, type;
            for (i = 0; i < this.tileViews.length; i++) {
                tileView = this.tileViews[i];
                operator = tileView.model.get('operator'),
                type = tileView.model.get('type');
                if (operator !== null) {
                    if (operator === '*') {
                        $operatorChild = this.createOperator(operator, null, type);
                        $operatorChild.insertBefore(tileView.$el);
                        // check for parentheses operator
                        //if (type === modelClassNamespace.TileItem.TileType.PARENTHESES) {
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
                    $operatorChild = this.createOperator(operator);
                    $operatorChild.insertBefore(tileView.$el);
                    this.$operatorViews[i] = null;
                    this.attachEventsOnOperator($operatorChild);
                }
            }
            //extra operator to show + sign on right
            $operatorChild = this.createOperator(null, true);
            $operatorChild.insertAfter(tileView.$el);
            this.attachEventsOnOperator($operatorChild);
        },

        /**
         * create an operator if there any
         * @method createOperator
         * @public
         *
         */
        createOperator: function (operator, isRightSideOperator, tileType) {
            var $operatorChild, $insertionCursor,
                classes = viewClassNamespace.TileView.CLASSES,
                $operatorDiv = $('<div></div>'), $addSign,
                browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
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
            }
            else if (operator === null && !isRightSideOperator) {
                this.$('.null-operator-container').remove();
                $operatorChild = $('<div></div>').addClass(classes.OperatorContainer + ' ' + 'null-operator-container');
                $operatorDiv.addClass(classes.Operator + ' ' + 'null-operator').appendTo($operatorChild);
                $addSign = $('<div>&#43;</div>').addClass('add-sign-in-null-operator').hide();
                $addSign.appendTo($operatorChild);
            }
            else if (isRightSideOperator) {
                $operatorChild = $('<div></div>').addClass(classes.OperatorContainer + ' ' + 'right-null-operator-container');
                $operatorDiv.addClass(classes.Operator + ' ' + 'right-null-operator').appendTo($operatorChild);
                $addSign = $('<div>&#43;</div>').addClass('add-sign-in-null-operator').hide();
                $addSign.appendTo($operatorChild);
            }
            $insertionCursor = $('<div></div>').addClass('insertion-cursor').hide().appendTo($operatorChild);
            if (browserCheck.isIE || browserCheck.isIE11 || browserCheck.isFirefox) {
                $insertionCursor.addClass('insertion-cursor-ie-ff');
            }
            return $operatorChild;
        },

        /**
        * listener on collections of tile array
        * @method onAddTile
        * @public
        */
        onAddTile: function onAddTile(model, collection, options) {
            var operator = model.get('operator'), $operatorChild,
                noOfTiles = this.tileViews.length,
                index = (options.at !== null && options.at !== undefined) ? parseInt(options.at, 10) : noOfTiles,
                tileView = viewClassNamespace.TileView.createTileItemView(model, this, this.equationManager, this.player, this.isTutorialMode),
                $tileViewElm = tileView.createView(this.parent.getIndex(this) + '.' + index),
                isAnimating = model.get('isAnimate'),
                 $nullPointer = null;

            if (this.equationManager.restrictFirstTileAnimation === false) {
                if (isAnimating) {
                    $tileViewElm.css({ 'visibility': 'hidden' }).addClass('animated-tiles');
                }
            }

            if (index === 0) {

                $nullPointer = this.$expression.find('.null-operator-container');

                if ($nullPointer) {

                    if ($nullPointer.is('.ui-droppable')) {
                        $nullPointer.droppable('disable');
                    }

                    $nullPointer.off()
                              .remove();
                }

                this.$expression.prepend($tileViewElm);
            }
            else if (noOfTiles === 0) {
                this.$expression.append($tileViewElm);
            }
            else {
                $tileViewElm.insertAfter(this.tileViews[index - 1].$el);
            }

            if (this.equationManager.restrictFirstTileAnimation === true) {
                this.equationManager.firstTile = $tileViewElm;
            }
            if (model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                $operatorChild = this.createOperator(operator, null, model.get('type'));
            }
            else {
                $operatorChild = this.createOperator(operator);
            }

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
            tileView.attachEvents();
            this.equationManager.tileAdded(tileView);
            this.tileViews.splice(index, 0, tileView);

            //if (this.$('.expression-view').find('.expression-contains-only-parentheses').length === 0) {
            //    this.$('.expression-view').removeClass('expression-with-big-parentheses');
            //}
        },

        /**
        * listener on collections of tile array
        * @method onRemoveTile
        * @param {model} model to be removed
        * @param {collection} collection from which the model is getting removed
        * @param {options} options of model
        * @public
        */
        onRemoveTile: function onRemoveTile(model, collection, options) {
            var index = options.index,
                 tileView = this.tileViews[index],
                 operatorView = null,
                 self = this;

            if (self.$operatorViews[index] !== null) {
                operatorView = this.$operatorViews[index];
            }
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

            //if (this.$('.expression-view').find('.expression-contains-only-parentheses').length === 0) {
            //    this.$('.expression-view').removeClass('expression-with-big-parentheses');
            //}

        },

        /**
        * listen events on model collections
        * @method listenEvents
        * @public
        */
        listenEvents: function listenEvents() {
            this.listenTo(this.model.get('tileArray'), 'add', this.onAddTile);
            this.listenTo(this.model.get('tileArray'), 'remove', this.onRemoveTile);
        },

        /**
        * attach events on view and its children views
        * @method attachEvents
        * @public
        */
        attachEvents: function () {
            var i = 0, arrExpViews = this.tileViews, self = this,
                exprIndex = this.parent.tileViews.indexOf(this);
            for (i = 0; i < arrExpViews.length; i++) {
                arrExpViews[i].attachEvents();
            }
            if (this.isTutorialMode) {
                return;
            }
            this.makeDroppable(true);

            this.$el.scroll(function () {
                self.equationManager.marqueeViews[exprIndex].model.set('scrollAmt', this.scrollLeft);
            });
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
            $(event.target).find('.insertion-cursor, .add-sign-in-null-operator').show();
            //}
            ui.helper.data('add-tile-droppable', $(event.target));
        },

        /**
        * mouse out event on operator
        * @method onMouseOutOperator
        * @public
        */
        onMouseOutOperator: function (event, ui) {
            $(event.target).find('.insertion-cursor, .add-sign-in-null-operator').hide();
        },

        /**
        * drop event on operator
        * @method onDropOperator
        * @public
        */
        onDropOperator: function onDropOperator(event, ui, fromAcc) {
            if (this.equationManager.getTileAddedInExpression() !== null) {
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 16), this.getAccMessage('inline-feedback-text', 16));
                return;
            }

            if (ui && (ui.helper.data('tilevalue') === 't' ||
                ui.helper.hasClass('equals-sign-container'))) {
                if (this.equationManager.getFirstTileDrop() === false) {
                    this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 19), this.getAccMessage('inline-feedback-text', 19));
                }
                return;
            }

            var $target = fromAcc && fromAcc.target ? fromAcc.target : $(event.target),
                tileViews = this.tileViews, i = 0, tileViewsLen = tileViews.length,
                draggedTileData = ui ? ui.helper.data() : fromAcc,
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData['tiletype'],
                draggedTileValue = draggedTileData['tilevalue'],
                draggableTileIndex = tileViews.indexOf(draggedTile),
                length = draggedTileData['length'], // this attribute will get set in marquee
                numOfTiles = 1,
                destTileView,
                operatorIndex, bResponse,
                data = {}, index;

            if (this.equationManager._checkForNestedLevelOfParentheses() && draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                this.equationManager._showHideDropslots(this.$el, false);
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 12), this.getAccMessage('inline-feedback-text', 12));
                return;
            }

            if (this.equationManager.getFirstTileDrop() === false) {
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 19), this.getAccMessage('inline-feedback-text', 19));
                return;
            }

            $target.find('.insertion-cursor, .add-sign-in-null-operator').hide();

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
                if (!(($target.hasClass('null-operator-container') && draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) || ($target.hasClass('right-null-operator-container') && draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE)) && (draggedTile.model && (draggedTile.model.get('isLHS') === this.model.get('isLHS')))) {
                    return;
                }
            }

            if (operatorIndex < tileViewsLen) {
                destTileView = tileViews[operatorIndex];
                data.bLeft = true;
            }
            else if (operatorIndex === tileViewsLen) {
                destTileView = tileViews[operatorIndex - 1];
                data.bLeft = false;
                index = destTileView.parent.getIndex(destTileView).substr(0, 1) + '.' + tileViewsLen;
            }

            if (draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                data = {
                    tileValue: draggedTileValue,
                    operation: '+',
                    index: data.bLeft ? destTileView.parent.getIndex(destTileView) : index,
                    isDenominator: destTileView.model.get('isDenominator'),
                    isLHS: destTileView.model.get('isLHS')
                    //bLeft: data.bLeft
                };
                bResponse = this.equationManager.onAddTile(data);
                this.equationManager.setTileAddedFromBinValue(draggedTileValue);
                if (bResponse) {
                    this.addNullTileCase(data.operation, data.tileValue);
                }
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
                ui && ui.draggable.data('isDropped', true);
                if (fromAcc) {
                    this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DROP_SUCCESS);
                }
            }
        },

        /**
        * makes expression view droppable
        * @method makeDroppable
        * @param {bEnable} boolean to enable droppable
        * @public
        */
        makeDroppable: function (bEnable) {
            if (bEnable) {
                var self = this;
                if (!this.$el.hasClass('ui-droppable')) {
                    this.$el.droppable({
                        accept: this.model.get('strDroppables'),
                        tolerance: 'pointer',
                        greedy: true,
                        drop: function (event, ui) {
                            if (!self.equationManager.getIsDropped()) {
                                self.onTileDrop(event, ui);
                                ui.draggable.removeData('cur-droppable');
                                self.equationManager.setIsDropped(true);
                            }
                        },
                        over: function (event, ui) {
                            self.onMouseOver(event, ui);
                            ui.draggable.data('cur-droppable', self);
                        },
                        out: function (event, ui) {
                            self.onMouseOut(event, ui);
                            ui.draggable.removeData('cur-droppable');
                        }
                    });
                }
            }
            else {
                if (this.$el.hasClass('ui-droppable')) {
                    this.$el.droppable('destroy');
                }
            }
        },

        /**
        * mouse over event on expression
        * @method onMouseOver
        * @param {event} event object
        * @param {ui} jquery ui object
        * @public
        */
        onMouseOver: function (event, ui) {
            //console.log('mouse over in expression');
            //console.log('expression over');
            //            this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
            var draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData['tiletype'],
                exprViews = this.equationManager.equationView.tileViews,
                index = this.model.get('isLHS') ? 1 : 0,
                exprView = exprViews[index] || null;

            if (this.equationManager.getFirstTileDrop() && !this.equationManager.onlyLHS) {
                this.equationManager._showHideDropslots(exprViews[index].$el, false);
            }
            exprView && exprView.$('.hover-border').removeClass('hover-border');

            if (draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                //ui.helper.removeData('add-tile-droppable');
                ui.helper.data('add-tile-droppable', this);
            }
            else {
                if (!draggedTile) {
                    return;
                }
                //var model = draggedTile.model,
                //isLHS = model.get('isLHS');

                //if (this.$el.parents('.lhs-expression-view-expression').length > 0 && !isLHS) {
                //    this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT[draggedTileType], draggedTile, $(ui.helper));
                //}
                //else if (this.$el.parents('.rhs-expression-view-expression').length > 0 && isLHS) {
                //    this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT[draggedTileType], draggedTile, $(ui.helper));
                //}
            }
            //this.attachDetachDroppable(true, true);
        },


        /**
        * mouse out event on expression
        * @method onMouseOut
        * @param {event} event object
        * @param {ui} jquery ui object
        * @public
        */
        onMouseOut: function (event, ui) {
            //console.log('mouse out in expression');
            var draggedTileData = ui.helper.data(),
               draggedTile = draggedTileData['cur-draggable'],
               draggedTileType = draggedTileData['tiletype'];

            if (draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                //if (ui.helper.data('add-tile-droppable') === this) {
                //    //ui.helper.removeData('add-tile-droppable');
                //}
                //this.equationManager._showHideDropslots(this.$el, false);
            }
            else {
                if (!draggedTile) {
                    return;
                }
                var model = draggedTile.model,
                isLHS = model.get('isLHS');

                if (this.$el.parents('.lhs-expression-view-expression').length > 0 && !isLHS) {
                    this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT[draggedTileType], draggedTile, $(ui.helper));
                }
                else if (this.$el.parents('.rhs-expression-view-expression').length > 0 && isLHS) {
                    this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT[draggedTileType], draggedTile, $(ui.helper));
                }
            }
            //console.log('disable all droppable of section = ', this.model.get('isLHS'));
            //this.attachDetachDroppable(false);
        },

        /**
        * drop event in expression
        * @method onTileDrop
        * @param {event} event object
        * @param {ui} jquery ui object
        * @public
        */
        onTileDrop: function onTileDrop(event, ui, fromAcc) {
            if (this.equationManager.getTileAddedInExpression() !== null) {
                this.equationManager.equationNotBalancedFeedback();
                return;
            }

            if (this.equationManager.getFirstTileDrop() === false) {
                var $droppableT = this.$('.virtual-numerator'),
                 droppableTRect = new Rect($droppableT[0].getBoundingClientRect()),
                 //ptMouse = new Point({ left: event.clientX, top: event.clientY });
                 helperRect = new Rect(ui ? ui.helper[0].getBoundingClientRect() : fromAcc.target[0].getBoundingClientRect()),
                 ptMouse = helperRect && helperRect.getMiddle(),
                 tileValue = ui ? ui.helper.data('tilevalue') : fromAcc.tilevalue;

                if (droppableTRect.isPointInRect(ptMouse) === false || (droppableTRect.isPointInRect(ptMouse) === true && tileValue !== 't') || this.model.get('isLHS') === false) {
                    this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
                    this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 19), this.getAccMessage('inline-feedback-text', 19));
                    return false;
                }
                this.$('.virtual-numerator-operator-container').remove();
                this.$('.drop-t-case-tile, drop-t-case-empty').removeClass('drop-t-case-tile drop-t-case-empty');
            }

            var draggedTileData = ui ? ui.helper.data() : fromAcc,
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData['tiletype'],
                draggedTileValue = draggedTileData['tilevalue'],
                data, fractionAdded = false, index = null,
                isSuccess;

            if (draggedTileType !== modelClassNamespace.TileItem.TileType.BIN_TILE) {
                if (draggedTile.model.get('isLHS') !== this.model.get('isLHS')) {
                    this._repositionTermTile(event, ui);
                    return;
                }
                this._takeOutCommonCommandCall(event, ui);
                return;
            }

            if (!this.equationManager.onlyLHS) {
                if ( ui && !ui.helper.data('add-tile-droppable')) {
                    return;
                }
            }

            var droppableView = this,
                droppableType = droppableView.model.get('type'),
                tileIndex = droppableView.parent.getIndex(droppableView).substring(0, 1),
                expressionView = this,
                $expression = expressionView.$el,
                $virtualNumerator = $expression.find('.virtual-numerator'),
                $virtualDenominator = $expression.find('.virtual-denominator').length ? $expression.find('.virtual-denominator') : $expression.find('.absolute-denominator'),
                $leftNullOpContainer = $expression.find('.null-operator-container'),
                $rightNullOpContainer = $expression.find('.right-null-operator-container'),
                //ptMouse = new Point({ left: event.clientX, top: event.clientY }),
                helperRect = new Rect(ui ? ui.helper[0].getBoundingClientRect() : fromAcc.target[0].getBoundingClientRect()),
                ptMouse = helperRect.getMiddle(),
                expressionRect = new Rect($expression[0].getBoundingClientRect()),
                expressionTop = expressionRect.getTop(),
                expressionBottom = expressionRect.getBottom(),
                expressionRight = expressionRect.getRight(),
                expressionLeft = expressionRect.getLeft(),
                expressionArea1 = expressionTop + Math.abs(expressionTop - expressionBottom) / 2 - 24,
                expressionArea1Rect = new Rect({ top: expressionTop, right: expressionRight, left: expressionLeft, bottom: expressionArea1, height: 65, width: expressionRect.getWidth() }),
                expressionArea2 = expressionTop + Math.abs(expressionTop - expressionBottom) / 2 + 24,
                expressionArea2Rect = new Rect({ top: expressionArea2, right: expressionRight, left: expressionLeft, bottom: expressionBottom, height: 65, width: expressionRect.getWidth() }),
                leftNullOpContainerRect = new Rect($leftNullOpContainer[0].getBoundingClientRect()),
                rightNullOpContainerRect = new Rect($rightNullOpContainer[0].getBoundingClientRect()),
                virtualNumeratorRect = new Rect($virtualNumerator[0].getBoundingClientRect()),
                virtualDenominatorRect = new Rect($virtualDenominator[0].getBoundingClientRect()), multiplication = true, operation = '*', additionIndex,
                isDenominator = droppableView.model.get('isDenominator');

            if (this.equationManager._checkForNestedLevelOfParentheses() && draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                this.equationManager._showHideDropslots(this.$el, false);
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 12), this.getAccMessage('inline-feedback-text', 12));
                return;
            }

            if ($virtualDenominator.css('display') !== 'none' || (fromAcc && fromAcc.isDenominator === true)) {
                //denominator
               // console.log('denominator');
                fractionAdded = true;
                index = this.fractionIndex;
                this.isDenominator = true;
                if (draggedTileValue === 't') {
                    this.equationManager._showHideDropslots(this.$el, false);
                    this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 15), this.getAccMessage('inline-feedback-text', 15));
                    return;
                }
            }
            else if ($virtualNumerator.css('display') !== 'none' || (fromAcc && fromAcc.isDenominator === false)) {
                // Add isDenominator=false to fix call from context menu issue where the operator was not visible 

                //numerator
             //   console.log('numerator');
                fractionAdded = false;
                index = this.multiplicationIndex;
                this.isDenominator = false;
            }
            else if (expressionRect.isPointInRect(ptMouse)) {
             //   console.log('blank');
                //if mouseover on term tile
                if (droppableType === modelClassNamespace.TileItem.TileType.TERM_TILE) {
                    if (isDenominator) {
                        //denominator
                        fractionAdded = true;
                        index = this.fractionIndex;
                        if (draggedTileValue === 't') {
                            this.equationManager._showHideDropslots(this.$el, false);
                            return;
                        }
                    }
                    else {
                        //numerator
                        fractionAdded = false;
                        index = this.multiplicationIndex;
                    }
                }
                else {
                    //show insertion cursor
                    if (leftNullOpContainerRect.getRight() > ptMouse.getLeft()) {
                        //add to left
                        if (draggedTileValue === 't') {
                            this.equationManager._showHideDropslots(this.$el, false);
                            return;
                        }
                        multiplication = false;
                        operation = '+';
                        additionIndex = tileIndex + '.' + '0';
                        this.parenthesesAdded = false;
                        this.fractionAdded = false;
                    }
                    else if (rightNullOpContainerRect.getLeft() < ptMouse.getLeft()) {
                        //add to right
                        if (draggedTileValue === 't') {
                            this.equationManager._showHideDropslots(this.$el, false);
                            return;
                        }
                        multiplication = false;
                        operation = '+';
                        additionIndex = tileIndex + '.' + this.tileViews.length;
                        this.parenthesesAdded = false;
                        this.fractionAdded = false;
                    }
                    if (multiplication) {
                        //numerator
                        fractionAdded = false;
                        index = this.multiplicationIndex;
                    }
                }
            }

            data = {
                isLHS: this.model.get('isLHS'),
                isDenominator: this.isDenominator,
                index: this.multiplicationIndex ? index : this.index,
                operation: operation,
                tileValue: draggedTileValue,
                parenthesesAdded: this.parenthesesAdded,
                fractionAdded: this.multiplicationIndex ? this.fractionAdded : fractionAdded,
                tilesToAddInFraction: this.tilesToAddInFraction
            };
            if (operation === '+') {
                data.index = additionIndex;
            }
            if (this.equationManager.getFirstTileDrop() === false) {
                data.index = '0.0.1';
                this.equationManager.setFirstTileDrop(true);
            }
            //console.log('add tile command fire');
            if (typeof draggedTileValue === 'string' && draggedTileValue.indexOf('x') !== -1 && operation === '*') {
                this.equationManager._showHideDropslots(this.$el, false);
                this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 20), this.getAccMessage('inline-feedback-text', 20));
                return;
            }
            isSuccess = this.equationManager.onAddTile(data);
            this.equationManager.setTileAddedFromBinValue(draggedTileValue);
            if (isSuccess) {
                ui && ui.draggable.data('isDropped', true);
                this.addNullTileCase(operation, data.tileValue);
                if (fromAcc) {
                    this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DROP_SUCCESS);
                }
            }
            this.equationManager._showHideDropslots(this.$el, false);
        },

        _takeOutCommonCommandCall: function (event, ui) {
            var draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                isSuccess,
                parenthesesView = draggedTile.parent, index, targetView, data = {}, length = draggedTileData['length'],
                parenthesesRect, ptMouse = new Point({ left: event.clientX, top: event.clientY });

            if (parenthesesView.model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES ||
                parenthesesView.model.get('type') === modelClassNamespace.TileItem.TileType.FRACTION) {
                if (parenthesesView.model.get('type') === modelClassNamespace.TileItem.TileType.FRACTION) {
                    parenthesesView = parenthesesView.parent;
                    if (parenthesesView.model.get('type') !== modelClassNamespace.TileItem.TileType.PARENTHESES) {
                        return;
                    }
                }
                //now fire takeout common
                parenthesesRect = new Rect(parenthesesView.$el[0].getBoundingClientRect());
                if ((parenthesesRect.getLeft() < ptMouse.getLeft() && parenthesesRect.getRight() > ptMouse.getLeft()) ||
                    parenthesesView.parent.model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                    return;
                }
                index = parenthesesView.parent.tileViews.indexOf(parenthesesView);
                targetView = parenthesesView.parent.tileViews[index - 1] || parenthesesView.parent.tileViews[index + 1];
                if (targetView && targetView.model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                    targetView = targetView.tileViews[0];
                }
                if (targetView) {
                    data.destTile = targetView;
                    data.sourceTile = draggedTile;
                    data.sourceNumOfTiles = length || 1;
                    isSuccess = this.equationManager.onTakeOutCommonTile(data);
                }
                    //parentheses has an exponent.
                else if (parenthesesView.model.get('exponent')) {
                    this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 13), this.getAccMessage('inline-feedback-text', 13));
                }
                if (isSuccess) {
                    ui.draggable.data('isDropped', true);
                }
            }
        },

        _repositionTermTile: function _repositionTermTile(event, ui) {
            var draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData['tiletype'],
                length = draggedTileData['length'], data = {}, tileViews = this.tileViews, result;

            data = {
                sourceTile: draggedTile,
                numOfTiles: length || 1,
                bLeft: data.bLeft
            };

            if (this.$('.null-operator-container').find('.insertion-cursor').css('display') !== 'none') {
                data.destTile = tileViews[0];
                data.bLeft = true;
                result = this.equationManager.onRepositionTile(data);
            }
            else if (this.$('.right-null-operator-container').find('.insertion-cursor').css('display') !== 'none') {
                data.destTile = tileViews[tileViews.length - 1];
                data.bLeft = false;
                result = this.equationManager.onRepositionTile(data);
            }

            if (result) {
                ui.draggable.data('isDropped', true);
            }
            this.equationManager._showHideDropslots(this.$el, false);
        },


        hideOperatorOfParCoeff: function hideOperatorOfParCoeff() {
            var tileViews = this.tileViews, i = 0;
            for (; i < tileViews.length; i++) {
                if (tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES && tileViews[i + 1] && tileViews[i + 1].model.get('operator') === '*') {
                    this.$operatorViews[i + 1].find('.operator').hide();
                    if (this.tileViews[i + 1].model.get('type') === modelClassNamespace.TileItem.TileType.TERM_TILE) {
                        this.tileViews[i + 1].$el.addClass('multiplied-tile-term-tile');
                    }
                }
                else if (tileViews[i].model.get('type') !== modelClassNamespace.TileItem.TileType.PARENTHESES && tileViews[i + 1] && tileViews[i + 1].model.get('operator') === '*') {
                    if (this.tileViews[i + 1].model.get('type') === modelClassNamespace.TileItem.TileType.TERM_TILE) {
                        this.tileViews[i + 1].$el.removeClass('multiplied-tile-term-tile');
                    }
                }
            }
        },

        checkContainsParOrFraction: function checkContainsParOrFraction() {
            var tileViews = this.tileViews, i = 0, index,
                $expressionView = this.$el.find('.expression-view');
            for (; i < tileViews.length; i++) {
                if (tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES || tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.FRACTION) {
                    return true;
                }
            }
            return false;
        },


        isExpressionContainsParOrFraction: function isExpressionContainsParOrFraction() {
            var tileViews = this.tileViews, i = 0, index,
                    $expressionView = this.$el.find('.expression-view');
            for (; i < tileViews.length; i++) {
                $expressionView.removeClass('expression-contains-parentheses');
                if (tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES || tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.FRACTION) {
                    $expressionView.addClass('expression-contains-parentheses');
                    return true;
                }
            }
            return false;
        },

        isExpressionContainsParentheses: function isExpressionContainsParentheses() {
            var tileViews = this.tileViews, i = 0, index,
                    $expressionView = this.$el.find('.expression-view');
            for (; i < tileViews.length; i++) {
                $expressionView.removeClass('expression-contains-only-parentheses');
                if (tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES) {
                    $expressionView.addClass('expression-contains-only-parentheses');
                    return true;
                }
            }
            return false;
        },

        checkCoefficientOfXForm: function checkCoefficientOfXForm() {
            var tileViews = this.tileViews, index = 0;
            if (tileViews.length > 2) {
                return false;
            }

            for (index ; index < tileViews.length; index++) {
                if (tileViews[index].model.get('type') !== modelClassNamespace.TileItem.TileType.TERM_TILE) {
                   //if (!tileViews[index].coefficientOfXWithFraction()) {
                        return false;
                    //}
                }
            }
            //hard code check of operator a* x = b Or b = a * x
            // case added: b can also be a fraction..
            if (tileViews[1]) {
                if (tileViews[1].model.get('operator') === modelClassNamespace.TileItem.OPERATORS.MULTIPLICATION &&
                    typeof tileViews[1].model.get('base') === 'string' &&
                    Math.abs(tileViews[0].model.get('base')) > 9) {
                    this.equationManager.numberToReplaceInBin = tileViews[0].model.get('base');
                    return true;
                }
                else {
                    return false;
                }
            }
            return true;
        },


        /**
         * recursive method to get html structure of expression
         * @method getTileContentInHtmlForm
         * @return {htmlString} htmlString to parent
         * @public
         */
        getTileContentInHtmlForm: function getTileContentInHtmlForm(bigParenthesesColor) {
            var model = this.model,
                tileArray = this.tileViews,
                isLHS = model.get('isLHS'),
                counter = 0,
                tileArrayLength = tileArray.length,
                currentTile = null,
                htmlString = '',
                bodyTemplateString = '';

            //if (isLHS === true) {
            //    htmlString += '<div class=\'left-expression-container equation-common\'><div class=\'left-expression equation-common\'>';
            //}
            //else {
            //    htmlString += '<div class=\'right-expression-container equation-common\'><div class=\'right-expression equation-common\'>';
            //}

            for (; counter < tileArrayLength; counter++) {
                currentTile = tileArray[counter];
                //htmlString += currentTile.getTileContentInHtmlForm();
                bodyTemplateString += currentTile.getTileContentInHtmlForm(bigParenthesesColor);
            }
            //htmlString += '</div></div>';

            htmlString = MathInteractives.Common.Components.templates['exprContainer']({
                'isLHS': isLHS,
                'exprBody': bodyTemplateString
            });

            return htmlString;
        },

        getAccString: function getAccString(tabName) {
            var currentString = '',
                model = this.model,
                tileViews = this.tileViews,
                tileViewsLength = tileViews.length,
                exp = model.get('exponent'),
                index = 0;

            for (; index < tileViewsLength; index++) {
                currentString += tileViews[index].getAccString();
            }

            return currentString;

        },

        /**
        * Returns the elements that are inside the marquee drawn.
        * @method getElementsInsideMarquee
        * @param {Object} Marquee end event
        * @param {Object} Marquee div
        */
        getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee) {
            var marqueeRect = new Rect($marquee[0].getBoundingClientRect()),
                middleOfRect = marqueeRect.getMiddle(), i = 0, rect, length;

            for (length = this.tileViews.length; i < length; i++) {
                rect = new Rect(this.tileViews[i].$el[0].getBoundingClientRect());
                middleOfRect = rect.getMiddle();

                this.tileViews[i].getElementsInsideMarquee(event, $marquee);
            }
        }
    }, {

    });

})(window.MathInteractives);
