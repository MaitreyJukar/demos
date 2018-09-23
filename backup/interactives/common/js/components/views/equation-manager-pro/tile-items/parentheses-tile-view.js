(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point,
        Scroll = viewClassNamespace.TileView.Scroll;

    /**
    * ParenthesesTileView holds the data for the parentheses tile view.
    *
    * @class ParenthesesTileView
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManagerPro.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    */
    viewClassNamespace.ParenthesesTileView = viewClassNamespace.TileView.extend({

        $exponent: null,
        tileViews: null,
        $operatorViews: null,
        isDragging: false,


        initialize: function () {
            this.tileViews = [];
            this.$operatorViews = [];
            viewClassNamespace.ParenthesesTileView.__super__.initialize.apply(this, arguments);
            this.listenEvents();
            this.initializeDefaultProperties();

        },

        events: {
            'mouseenter .parentheses-exponent': 'addHoverClassBase',
            'mouseleave .parentheses-exponent': 'removeHoverClassBase',
        },


        /**
        * reners parentheses tile view
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
         * Creates a Html template for parentheses tile view
         * @method createView
         * @public
         *
         */
        createView: function (index) {
            var classes = viewClassNamespace.TileView.CLASSES,
                i = 0, $child,
                TileType = modelClassNamespace.TileItem.TileType, $template,
                exponentValue = this.model.get('exponent'),
                exponentStr = this.getValueText('exponent'),
                //currentTab = this.player.getCurrentActiveTab(),
                //color = (currentTab === 2) ? ParenthesesTileViewClass.WHITE : ParenthesesTileViewClass.BLACK,
                color = this.equationManager.parenthesesColor ? this.equationManager.parenthesesColor : viewClassNamespace.EquationManagerPro.WHITE,
                parenthesesOptions = {
                    'color': color
                },
                $bracket = MathInteractives.Common.Components.templates['parenthesesTemplate'](parenthesesOptions).trim();

            this.$leftBracket = $('<div>' + $bracket + '</div>').addClass(classes.LeftBracket);
            //$bracket = MathInteractives.Common.Components.templates['parenthesesTemplate']();
            this.$rightBracket = $('<div>' + $bracket + '</div>').addClass(classes.RightBracket);
            this.$base = $('<div></div>').addClass('parentheses-container');

            if (exponentValue) {
                $template = $(MathInteractives.Common.Components.templates['baseTilePro']({
                    'base': exponentStr,
                    'base-class': '',
                    'level': 'eqn-manager-tile',
                    'baseTileType': TileType.PARENTHESES_EXPONENT,
                    'idPrefix': this.idPrefix
                }));
                this.$exponent = $('<div></div>').addClass('parentheses-exponent').append($template);
                this.$el.addClass('parentheses-with-exponent');
            }

            this.$base.append(this.$leftBracket);

            for (i = 0; i < this.tileViews.length; i++) {
                $child = this.tileViews[i].createView(index + '.' + i);
                this.$base.append($child);
            }
            this.$base.append(this.$rightBracket).append(this.$exponent);
            this.$el.append(this.$base);
            this.$el.addClass(classes.PARENTHESES).attr('data-tiletype', TileType.PARENTHESES);
            this.createOperatorView();
            this.equationManager.setDeletedItemsInParenthesesFraction(index, this.model.get('type'));
            if (this.$el.find('.fraction-component').length > 0) {
                this.$leftBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color, isBigParentheses: true }).trim()).addClass('big-left-bracket');
                this.$rightBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color, isBigParentheses: true }).trim()).addClass('big-right-bracket');
                var exprIndex = this.model.get('isLHS') ? 0 : 1;
                this.equationManager.equationView.tileViews[exprIndex].$el.find('.expression-view').addClass('expression-with-big-parentheses');
            }
            return this.$el;
        },

        /**
        * to check whether there is fraction present in expression
        * @method checkForFractionInExpression
        * @public
        */
        checkForFractionInExpression: function checkForFractionInExpression() {
            var tileViews = this.tileViews, i = 0, result;
            for (; i < tileViews.length; i++) {
                if (tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.FRACTION) {
                    return true;
                }
                result = tileViews[i].checkForFractionInExpression();
                if (result) {
                    return result;
                }
            }
            return false;
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
         * show or hide content on drag start
         * @method showHideContentAfterDrag
         * @param {bShow} boolean to show or hide
         * @public
         */
        showHideContentAfterDrag: function (bShow) {
            if (bShow) {
                this.$leftBracket.css('visibility', '');
                this.$rightBracket.css('visibility', '');
            }
            else {
                this.$leftBracket.css('visibility', 'hidden');
                this.$rightBracket.css('visibility', 'hidden');
            }
        },


        /**
        * listener on collections of tile array
        * @method onAddTile
        * @public
        */
        onAddTile: function (model, collection, options) {
            var operator = model.get('operator'), $operatorChild,
                index = (options.at !== null && options.at !== undefined) ? options.at : collection.length - 1,
                tileView = viewClassNamespace.TileView.createTileItemView(model, this, this.equationManager, this.player, this.isTutorialMode),
                $tileViewElm = tileView.createView(this.parent.getIndex(this) + '.' + index),
                isAnimating = model.get('isAnimate'),
                color = this.equationManager.parenthesesColor ? this.equationManager.parenthesesColor : viewClassNamespace.EquationManagerPro.WHITE;

            if (this.equationManager.restrictFirstTileAnimation === false) {
                if (isAnimating) {
                    $tileViewElm.css({ 'visibility': 'hidden' }).addClass('animated-tiles');
                }
            }

            if (index === 0) {
                $tileViewElm.insertAfter(this.$leftBracket);
            }
            else {
                $tileViewElm.insertAfter(this.tileViews[index - 1].$el);
            }
            if (this.equationManager.restrictFirstTileAnimation === true) {
                this.equationManager.firstTile = $tileViewElm;
            }


            $operatorChild = this.createOperator(tileView.model.get('operator'), model.get('type'));
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

            var exprIndex = this.model.get('isLHS') ? 0 : 1;
            if (this.$el.find('.fraction-component').length > 0) {
                this.$leftBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color, isBigParentheses: true }).trim()).addClass('big-left-bracket');
                this.$rightBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color, isBigParentheses: true }).trim()).addClass('big-right-bracket');
                this.equationManager.equationView.tileViews[exprIndex].$el.find('.expression-view').addClass('expression-with-big-parentheses');
            }
            else {
                this.$leftBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color }).trim()).removeClass('big-left-bracket');
                this.$rightBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color }).trim()).removeClass('big-right-bracket');
                //this.equationManager.equationView.tileViews[exprIndex].$el.find('.expression-view').remove('expression-with-big-parentheses');
            }

            this.parent.trigger(viewClassNamespace.EquationManagerPro.EVENTS.PARENTHESES_REFLECTION);
            //tileView.fillRects();
            tileView.attachEvents();
            this.equationManager.tileAdded(tileView);
            this.tileViews.splice(index, 0, tileView);
            this.refreshCursorAt();
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
                operatorView,
                operator = tileView.model.get('operator'),
                type = model.get('type'),
                color = this.equationManager.parenthesesColor ? this.equationManager.parenthesesColor : viewClassNamespace.EquationManagerPro.WHITE;

            if (this.$operatorViews[index] !== null) {
                operatorView = this.$operatorViews[index];
            }
            this.$operatorViews.splice(index, 1);

            tileView.stopListeningEvents(true);
            if (operatorView) {
                if (operatorView.is('.ui-droppable')) {
                    //operatorView.droppable('disable');
                }
                operatorView.off();
                operatorView.remove();
            }
            tileView.$el.remove();

            this.equationManager.setDeletedItemsInParenthesesFraction(this.parent.getIndex(this), this.model.get('type'));
            var exprIndex = this.model.get('isLHS') ? 0 : 1;
            if (this.$el.find('.fraction-component').length > 0) {
                this.$leftBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color, isBigParentheses: true }).trim()).addClass('big-left-bracket');
                this.$rightBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color, isBigParentheses: true }).trim()).addClass('big-right-bracket');
                this.equationManager.equationView.tileViews[exprIndex].$el.find('.expression-view').addClass('expression-with-big-parentheses');
            }
            else {
                this.$leftBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color }).trim()).removeClass('big-left-bracket');
                this.$rightBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color }).trim()).removeClass('big-right-bracket');
                //this.equationManager.equationView.tileViews[exprIndex].$el.find('.expression-view').remove('expression-with-big-parentheses');
            }
            tileView.off();
            this.tileViews.splice(index, 1);
            this.refreshCursorAt();
            this.parent.trigger(viewClassNamespace.EquationManagerPro.EVENTS.PARENTHESES_REFLECTION);
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
            var self = this;
            this.listenTo(this.model.get('tileArray'), 'add', this.onAddTile);
            this.listenTo(this.model.get('tileArray'), 'remove', this.onRemoveTile);
            this.listenTo(this.model, 'change:operator', this._onOperatorChange);
            this.listenTo(this, viewClassNamespace.EquationManagerPro.EVENTS.PARENTHESES_REFLECTION, this._parenthesesReflection);
            //this.equationManager.off(viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT.PARENTHESES).on(viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT.PARENTHESES, function (tileView, $helper) {
            //    self._invertTileText(tileView, $helper);
            //});
        },


        _parenthesesReflection: function _parenthesesReflection() {
            var exprIndex = this.model.get('isLHS') ? 0 : 1,
                color = this.equationManager.parenthesesColor ? this.equationManager.parenthesesColor : viewClassNamespace.EquationManagerPro.WHITE;
            if (this.$el.find('.fraction-component').length > 0) {
                this.$leftBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color, isBigParentheses: true }).trim()).addClass('big-left-bracket');
                this.$rightBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color, isBigParentheses: true }).trim()).addClass('big-right-bracket');
                this.equationManager.equationView.tileViews[exprIndex].$el.find('.expression-view').addClass('expression-with-big-parentheses');
            }
            else {
                this.$leftBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color }).trim()).removeClass('big-left-bracket');
                this.$rightBracket.html(MathInteractives.Common.Components.templates['parenthesesTemplate']({ color: color }).trim()).removeClass('big-right-bracket');
                //this.equationManager.equationView.tileViews[exprIndex].$el.find('.expression-view').remove('expression-with-big-parentheses');
            }
        },


        /**
        * change sign across section
        * @method _invertTileText
        * @param {tileView} tile item view
        * @param {$helper} Jquery object of helper
        * @public
        */
        _invertTileText: function _invertTileText(tileView, $helper) {
            if ($helper.find('.parentheses-negate-tile').length > 0) {
                this.invertParenthesesText(false, $helper);
            }
            else {
                this.invertParenthesesText(true, $helper);
            }
        },

        /**
        * change sign across section
        * @method invertParenthesesText
        * @param {isInvert} boolean
        * @param {$element} Jquery object of element
        * @public
        */
        invertParenthesesText: function invertParenthesesText(isInvert, $element) {
            if (isInvert) {
                var baseStr = '−' + 1,
                templateString = MathInteractives.Common.Components.templates['baseTilePro']({
                    'base': baseStr,
                    'base-class': 'bin-tiles-base',
                    'level': 'eqn-manager-tile',
                    'baseTileType': modelClassNamespace.TileItem.TileType.BASE,
                    'idPrefix': this.idPrefix
                }),
                $template = $(templateString).addClass('parentheses-negate-tile');
                $element.prepend($template).addClass('parentheses-helper');
                $element.find('.parentheses-container').addClass('parentheses-helper');
                //this.equationManager.adjustContainment($element);
            }
            else {
                $element.find('.parentheses-negate-tile').remove();
                //this.equationManager.adjustContainment(this.$el);
            }
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

            if (this.isTutorialMode) {
                return;
            }

            //if ($.support.touch) {
            //if (this.equationManager.isTouch()) {
            //    delete this.events['mouseenter .base-container'];
            //    delete this.events['mouseleave .base-container'];
            //    this.delegateEvents(this.events);
            //}

            if (this.$exponent) {
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$exponent, { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });
            }

            //MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$exponent, 600, this.addHoverClassBase, this.removeHoverClassBase, 'exponent-hold');

            //this._touchStartHandler = $.proxy(this._onTouchStart, this);
            //this._touchEndHandler = $.proxy(this._onTouchEnd, this);
            //this._touchMoveHandler = $.proxy(this._onTouchMove, this);
            //this.el.addEventListener('touchstart', this._touchStartHandler, false);

            this.$el.off('mousedown').on('mousedown', function (evt) {
                return self.onMouseDown(evt);
            });

            this.$el.off('mouseup').on('mouseup', function (evt) {
                return self.onMouseUp(evt);
            });
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$('.base-container'), { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$el, { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });

            //}
            //else {
            //this.$el.off('mousedown').on('mousedown', function (evt) {
            //    return self.onMouseDown(evt);

            //});

            //this.$el.off('mouseup').on('mouseup', function (evt) {
            //    return self.onMouseUp(evt);
            //});
            //}

            if (this.$exponent) {
                this.$exponent.off('click').on('click', function (event) {
                    if (!self.$exponent.hasClass('disable') && self.isDragging === false) {
                        self.equationManager.onExponentClick(self);
                    }
                    self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DRAGGING_START);
                });
            }

            //applying hand cursor
            this.applyHandCursorToElem(this.$leftBracket);
            this.applyHandCursorToElem(this.$rightBracket);
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$leftBracket, { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$rightBracket, { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });
            if (this.$exponent) {
                this.applyHandCursorToElem(this.$exponent);
            }

            // Attach drag events on tile
            this.attachEventsOnTile();

        },

        /**
        * Adds a hover class to the term tile item view.
        * @method addHoverClassBase
        */
        addHoverClassBase: function () {
            if (this.$exponent.hasClass('disable') || this.equationManager.getIsMarqueeDrawing()) {
                return;
            }
            this.$exponent.addClass('hover');
        },

        /**
        * Removes a hover class from the term tile item view.
        * @method addHoverClassBase
        */
        removeHoverClassBase: function () {
            if (this.$exponent.hasClass('disable')) {
                return;
            }
            this.$exponent.removeClass('hover');
        },


        /**
        * mouse down event on parentheses
        * @method onMouseDown
        * @param {evt} event object
        * @public
        */
        onMouseDown: function onMouseDown(evt) {
            var domEvent = evt.originalEvent ? evt.originalEvent : evt,
                event = domEvent,
                rect = null, ptMouse,
                rectLeftBracket = new Rect(this.$leftBracket[0].getBoundingClientRect()),
                rectRightBracket = new Rect(this.$rightBracket[0].getBoundingClientRect()),
                tileViews = this.tileViews || null, rectExponent = null,
                i = 0;

            if (this.$exponent) {
                rectExponent = new Rect(this.$exponent[0].getBoundingClientRect());
            }
            this.refreshCursorAt();

            event = (event.type === 'touchstart') ? event.touches[0] : event;
            ptMouse = new Point({ left: event.clientX, top: event.clientY });

            if (rectLeftBracket.isPointInRect(ptMouse) || rectRightBracket.isPointInRect(ptMouse) || (rectExponent && rectExponent.isPointInRect(ptMouse))) {
                domEvent.stopPropagation && domEvent.stopPropagation();
                domEvent.preventDefault && domEvent.preventDefault();
                this.equationManager.mouseDownOnInteractive(event, true, true, false);
                this.attachEventsOnTile();
                this.equationManager.adjustContainment(this.$el);
                window.clearTimeout(this.equationManager.timerId);
                this.equationManager.getLhsRhsContainerRects();
                this.equationManager.enableDisableDroppables(evt);
                this.stopReading();
                return false; // Return false stops event from propagating
            }

            if (tileViews !== null) {
                for (; i < tileViews.length; i++) {
                    rect = new Rect(tileViews[i].el.getBoundingClientRect());
                    rect = rect.inflateRect(10, 10);
                    if (rect.isPointInRect(ptMouse)) {
                        this.$el.draggable('disable');
                        return true;
                        break;
                    }
                }
            }
            //event.stopPropagation();
            this.$el.draggable('disable');
            //return false;
            this.refreshCursorAt();
            return true;   // Return true propagates event
        },

        /**
        * mouse up event on parentheses
        * @method onMouseUp
        * @param {event} event object
        * @public
        */
        onMouseUp: function onMouseUp(event) {
            this.$el.draggable('enable');
        },


        /**
        * touch start event handler
        * @method _onTouchStart
        * @param {evt} event object
        * @private
        */
        _onTouchStart: function (evt) {
            var touches = evt.changedTouches,
                first = touches[0],
                button = 0,
                simulatedEvent = document.createEvent("MouseEvent"),
                mouseenterEvt = $.Event('mouseenter');
            this._lastTap = first.target;

            simulatedEvent.initMouseEvent('mousedown', true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
            first.target.dispatchEvent(simulatedEvent);
            $(first.target).trigger(mouseenterEvt);
            this.el.addEventListener('touchmove', this._touchMoveHandler, false);
            this.el.addEventListener('touchend', this._touchEndHandler, false);
            evt.stopPropagation && evt.stopPropagation();
            evt.preventDefault && evt.preventDefault();
        },

        _onTouchMove: function (evt) {
            var touches = evt.changedTouches,
                first = touches[0],
                button = 0,
                simulatedEvent = document.createEvent("MouseEvent");

            simulatedEvent.initMouseEvent('mousemove', true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, button, null);

            first.target.dispatchEvent(simulatedEvent);
            evt.stopPropagation && evt.stopPropagation();
            evt.preventDefault && evt.preventDefault();
        },

        /**
        * touch end event handler
        * @method _onTouchEnd
        * @param {evt} event object
        * @private
        */
        _onTouchEnd: function (evt) {
            var touches = evt.changedTouches,
                first = touches[0],
                button = 0,
                isDragged = this.isDragging,
                simulatedEvent = document.createEvent("MouseEvent"),
                mouseleaveEvt = $.Event('mouseleave'),
                ptMouse = new Point({ left: first.clientX, top: first.clientY }),
                rectLastTap = new Rect(this._lastTap.getBoundingClientRect());

            simulatedEvent.initMouseEvent('mouseup', true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, button, null);
            first.target.dispatchEvent(simulatedEvent);
            $(first.target).trigger(mouseleaveEvt);
            if (first.target === this._lastTap && !isDragged && rectLastTap.isPointInRect(ptMouse)) {
                simulatedEvent = document.createEvent("MouseEvent");

                simulatedEvent.initMouseEvent('click', true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
                first.target.dispatchEvent(simulatedEvent);
            }
            this._lastTap = null;

            this.el.removeEventListener('touchmove', this._touchMoveHandler, false);
            this.el.removeEventListener('touchend', this._touchEndHandler, false);
            evt.stopPropagation && evt.stopPropagation();
            evt.preventDefault && evt.preventDefault();
        },

        /**
        * Attach drag event on Tile
        *
        * @method attachEventsOnTile
        */
        attachEventsOnTile: function () {
            if (this.isTileDisabled) {
                return;
            }
            var self = this,
                isDraggable = this.$el.is('.ui-draggable'),
                scrollLeft = 0,
                EVENTS = viewClassNamespace.EquationManagerPro.EVENTS;

            if (!isDraggable) {
                this.$el.draggable({
                    scroll: Scroll.ENABLE,
                    scrollSensitivity: Scroll.SENSITIVITY,
                    scrollSpeed: Scroll.SPEED,
                    distance: 5,
                    zIndex: 1,
                    helper: 'clone',
                    appendTo: this.equationManager.$draggableContainment,
                    containment: this.equationManager.$draggableContainment,
                    cursorAt: { left: this.$el.width() / 2, top: this.$el.height() / 2 },
                    revert: function (event) {
                        self.equationManager._showHideDropslots(self.equationManager.equationView.$el, false);
                        return false;
                    },
                    start: function (event, ui) {
                        //self.equationManager.equationView.attachDetachDraggable(self.cid, true);

                        var $parent = $(this).parents('.expression-view-holder').length > 0 ? $(this).parents('.expression-view-holder') : null;
                        if ($parent) {
                            scrollLeft = $parent.scrollLeft();
                        }

                        self.isDragging = true;
                        ui.helper.data('prevLocationData', null);
                        ui.helper.addClass('current-draggable').css({ 'z-index': 10 });
                        self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DRAGGING_START);
                        self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.ANY_DRAG_START);
                        ui.helper.data({ 'cur-draggable': self });
                        $(this).css({ 'visibility': 'hidden' });
                        ui.helper.css(self._getClosedHandCss());
                    },
                    drag: function (event, ui) {
                        //if (!self.equationManager.onlyLHS) {
                        self.equationManager.enableDisableDroppables(event, ui, self);
                        //}
                    },
                    stop: function (event, ui) {
                        //self.equationManager.equationView.attachDetachDraggable(self.cid, false);
                        self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.ANY_DRAG_STOP);
                        if (!$(this).data('isDropped')) {
                            //Animating using jquery to fix #15951 and #16012

                            var $this = $(this),
                                $parent = $this.parents('.expression-view-holder').length > 0 ? $(this).parents('.expression-view-holder') : null,
                                position = ui.originalPosition,
                                positionLeft = position.left,
                                positionTop = position.top,
                                helperClone = ui.helper.clone(),
                                stopEvent = event;
                            ui.helper.parent().append(helperClone);
                            helperClone.css({ 'z-index': 5 });
                            self.equationManager.showHideOverlayDiv(true);

                            if ($parent) {
                                var scrollObj = self.equationManager.getScrollAmount($parent, $this);
                                if (scrollObj.scroll) {
                                    $parent.scrollLeft(scrollObj.scrollAmt);
                                }
                                scrollLeft -= $parent.scrollLeft();
                            }

                            helperClone.animate({
                                'top': positionTop, 'left': positionLeft + scrollLeft
                            }, 700, function () {
                                self._onStop(stopEvent, ui, $this);
                                helperClone.remove();
                            });
                        }
                        else {
                            self._onStop(event, ui, $(this));
                            self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DROP_SUCCESS);
                        }

                    }
                });
            }
            else {
                this.$el.draggable('enable');
            }
        },

        /**
       * Actions to be performed on complete stop of the tile
       * @method _onStop
       * @param {event} Object Stop Event Object
       * @param {ui} Object Jquery ui object which is being dragged
       * @param {$this} Object Original jquery object
       * @private
       */
        _onStop: function _onStop(event, ui, $this) {

            var self = this;

            self.isDragging = false;
            self._onDraggingStop(event, ui, $this);
            self.equationManager.refresh();
            self.equationManager.showHideOverlayDiv(false);
            self.equationManager.setIsDropped(false);
            $this.css({ 'visibility': '' });
            ui.helper.removeClass('current-draggable').css('z-index', '');
            self.equationManager.equationView.attachDetachDroppable(true);
            self.equationManager.resetContainment();
            self.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
        },
        /**
        * mouse over event on parantheses
        * @method onMouseOver
        * @param {event} event object
        * @param {ui} jquery ui object
        * @public
        */
        onMouseOver: function onMouseOver(event, ui) {
           // console.log('parentheses mouse over');
        },

        /**
        * mouse out event on parantheses
        * @method onMouseOut
        * @param {event} event object
        * @param {ui} jquery ui object
        * @public
        */
        onMouseOut: function onMouseOut(event, ui) {
         //   console.log('parentheses mouse out');
        },


        /**
        * drag stop event of parentheses tile view
        * @method _onDraggingStop
        * @param {event} event object
        * @param {ui} UI object of Jquery draggable
        * @param {draggable} draggable object
        * @private
        */
        _onDraggingStop: function (event, ui, draggable) {
            var draggableData = draggable.data(),
                isDropped = draggableData.isDropped;

            ui.helper.removeData('cur-draggable');
            draggable.removeClass('current-draggable');
            draggable.removeData('isDropped');
            //this.equationManager.showMarquee();
            ui.helper.removeData('prevLocationData');

            if (!isDropped) {
                var evt = event.originalEvent ? event.originalEvent : event,
                    ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                this.showHideContentAfterDrag(true);
            }
        },

        /**
        * refreshes the cursorAt option of draggable tile
        * @method refreshCursorAt
        * @public
        */
        refreshCursorAt: function () {
            var self = this;
            if (self.$el.is('.ui-draggable')) {
                self.$el.draggable('option', 'cursorAt', { left: self.$el.width() / 2, top: self.$el.height() / 2 });

            }
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
            viewClassNamespace.ParenthesesTileView.__super__.refresh.apply(this, arguments);
        },

        /**
        * Applies hand cursor to the elem on mouseenter, mouseleave, mousedown & mouseup
        * @method applyHandCursorToElem
        * @private
        * @param {Objecy} The element to which hand cursor is to be applied
        */
        applyHandCursorToElem: function applyHandCursorToElem($elem) {
            var self = this,
                enter, leave;
            if (!this.equationManager.isTouch()) {
                enter = 'mouseenter';
                leave = 'mouseleave';
            }
            else {
                enter = 'touchstart';
                leave = 'touchend';
            }
            $elem.on(enter, function (event) {
                if ($(this).hasClass('disable') || self.isMobile || self.equationManager.getIsMarqueeDrawing()) { return; }
                $elem.css(self._getOpenHandCss());
            });

            $elem.on(leave, function () {
                if (this.isMobile || self.equationManager.getIsMarqueeDrawing()) { return; }
                $elem.css(self._getDefaultCursorCss());
            });
            $elem.on('mousedown', function () {
                if (this.isMobile || $(this).hasClass('disable') || self.equationManager.getIsMarqueeDrawing()) { return; }
                $elem.css(self._getClosedHandCss());
                self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_MOUSE_DOWN);
            });
            $elem.on('mouseup', function () {
                if (this.isMobile || $(this).hasClass('disable') || self.equationManager.getIsMarqueeDrawing()) { return; }
                $elem.css(self._getOpenHandCss());
            });
        },

        /**
        * Detach all events on view
        *
        * @method _detachEvents
        * @private
        */
        _detachEvents: function () {
            this.$el.off('mousedown');
            this.$el.off('mouseup');
            if ($.support.touch) {
                this.el.removeEventListener('touchstart', this._touchStartHandler, false);
                //this.el.removeEventListener('touchend', this._touchEndHandler, false);
                this._touchStartHandler = null;
                this._touchMoveHandler = null;
                this._touchEndHandler = null;
            }
            if (this.$el.is('.ui-draggable')) {
                this.$el.draggable('destroy');
            }
            this.$el.addClass('no-hover');
            // Don't set droppable false. Because we allow to drop
            // But at the time of dropping, we check for valid drop
            //this.$el.droppable('disable');
        },

        hideOperatorOfParCoeff: function hideOperatorOfParCoeff() {
            var tileViews = this.tileViews, i = 0;
            for (; i < tileViews.length; i++) {
                if (tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES && tileViews[i + 1] && tileViews[i + 1].model.get('operator') === '*') {
                    this.$operatorViews[i + 1].find('.operator').hide();
                }
            }
        },


        checkContainsParOrFraction: function checkContainsParOrFraction() {
            var tileViews = this.tileViews, i = 0, index, result;
            for (; i < tileViews.length; i++) {
                if (tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.PARENTHESES || tileViews[i].model.get('type') === modelClassNamespace.TileItem.TileType.FRACTION) {
                    return true;
                }
            }
            return false;
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
                //bigParenthesis = this.model.get('type') === modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS ? true : false,
                bigParenthesis = this.checkContainsParOrFraction(),
                color = (!bigParenthesesColor) ? viewClassNamespace.EquationManagerPro.WHITE : bigParenthesesColor,
                parenthesesOptions = {
                    'color': color
                },
                htmlString = '', index, $bracket = MathInteractives.Common.Components.templates['parenthesesTemplate'](parenthesesOptions).trim(),
                parenthesesBody = '';

            //if (operator === '*') {
            //    htmlString = htmlString + '<div class=\'operator-data-tab\'><div></div></div>';
            //}
            switch (operator) {
                case '*': // The following line is commented because the multiplication operator is not supposed to be shown in case of paranthesis.
                    //htmlString = htmlString + '<div class=\'multiplication-operator equation-common\'></div>';
                    htmlString += MathInteractives.Common.Components.templates['mathematicalOperators']({
                        operator: {
                            'multiplication': true,
                            'hide': true
                        }
                    }).trim();
                    break;
                case '+':
                    //htmlString = htmlString + '<div class=\'addition-operator equation-common\'><div>&#43;</div></div>';
                    htmlString += MathInteractives.Common.Components.templates['mathematicalOperators']({
                        operator: {
                            'addition': true
                        }
                    }).trim();
                    break;
            }

            //if parenthesis is bigger 1
            //if (bigParenthesis) {
            //    htmlString += '<span class=\'big-parenthesis-container equation-common\'><span class=\'open-parentheses-data-tab\'>' + $bracket + '</span>';
            //}
            //else {
            //    htmlString += '<span class=\'equation-common\'><span class=\'equation-common\'>(</span>';
            //}

            for (index = 0; index < tileArray.length; index++) {
                //htmlString += tileArray[index].getTileContentInHtmlForm();
                parenthesesBody += tileArray[index].getTileContentInHtmlForm(bigParenthesesColor);
            }

            if (parenthesesBody.indexOf('fraction-data-tab') === -1) {
                bigParenthesis = false;
            }

            //if (bigParenthesis) {
            //    htmlString += '<span class=\'close-parentheses-data-tab equation-common\'>' + $bracket + '</span></span>';
            //}
            //else {
            //    htmlString += '<span class=\'equation-common\'>)</span></span>';
            //}
            //if (exponent) {
            //    if (exponent < 0) {
            //        if (bigParenthesis) {
            //            exponent = '<span class="minus-sign-exponent minus-sign-exponent-big-parenthesis equation-common">&minus;</span>' + Math.abs(exponent);
            //        }
            //        else {
            //            exponent = '<span class="minus-sign-exponent equation-common">&minus;</span>' + Math.abs(exponent);
            //        }
            //    }
            //    if (bigParenthesis) {
            //        htmlString += '<div class=\'big-parenthesis-exponent-data-tab equation-common\'>' + exponent + '</div></span></span>';
            //    }
            //    else {
            //        htmlString += '<div class=\'parenthesis-exponent-data-tab exponent-data-tab equation-common\'>' + exponent + '</div></span>';
            //    }
            //}

            htmlString += MathInteractives.Common.Components.templates['parenthesesExpr']({
                'bigParenthesis': bigParenthesis,
                'bracket': $bracket,
                'parenthesesBody': parenthesesBody,
                'exponent': exponent,
                'exponentNegative': exponent < 0,
                'absExponent': Math.abs(exponent)
            }).trim();

            return htmlString;
        },

        getAccString: function getAccString(avoidOperator) {
            var currentString = '',
                model = this.model,
                operator = model.get('operator'),
                tileViews = this.tileViews,
                tileViewsLength = tileViews.length,
                exp = model.get('exponent'),
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

            //if (model.get('operator')) {
            //    currentString = this.getMessage('base-exp-pair', 2);
            //}
            //else if (this.parent.model.get('type') === TYPES.FRACTION && model.get('bDenominator')) {
            //    currentString = this.getMessage('base-exp-pair', 1);
            //}

            //if (this.model.get('coefficient') === -1) {
            //    currentString += ' ' + this.model.get('coefficient') + ' ' + this.getMessage('base-exp-pair', 2);
            //}

            currentString += this.getAccMessage('prefixed-statements', 10);

            for (; index < tileViewsLength; index++) {
                currentString += this.tileViews[index].getAccString(avoidOperator);
            }

            currentString += this.getAccMessage('prefixed-statements', 11);

            if (exp) {
                currentString += this.getAccMessage('prefixed-statements', 12) + exp;
            }

            //currentString = this.getMessage('base-exp-pair', 17, [currentString, exp !== null ? exp : this.getMessage('base-exp-pair', 4)]);
            return ' ' + currentString.trim();
        },

        /**
        * Returns the elements that are inside the marquee drawn.
        * @method getElementsInsideMarquee
        * @param {Object} Marquee end event
        * @param {Object} Marquee div
        */
        getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee) {
            var i = 0,
                tileViews = this.tileViews;

            if (this.isParenthesisInMarquee($marquee)) {
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
                for (i = 0; i < tileViews.length; i++) {
                    this.tileViews[i].getElementsInsideMarquee(event, $marquee);
                }
            }
        },

        /**
        * Checks if the parenthesis is inside marquee and returns true or false
        * @method isParenthesisInMarquee
        * @param {Object} Marquee view
        * @return {Boolean} Boolean representing if the parenthesis is inside the marquee
        */
        isParenthesisInMarquee: function ($marquee) {
            var tileRect = new Rect(this.$el[0].getBoundingClientRect()),
                coeffRect = null,
                marqueeRect = new Rect($marquee[0].getBoundingClientRect()),
                middleOfTile = tileRect.getMiddle(),
                threshold = 0.5;

            return marqueeRect.isPointInRect(middleOfTile) &&
                this.eitherBracketInside($marquee) &&
                marqueeRect.getWidth() > threshold * tileRect.getWidth() &&
                marqueeRect.getHeight() > threshold * tileRect.getHeight();
        },

        /**
        * Checks whether either bracket of a parentheses tile item is inside a marquee or not.
        * @method eitherBracketInside
        * @param {Object} Marquee div
        * @return {Boolean} True if either bracket is inside the marquee div. False otherwise
        */
        eitherBracketInside: function ($marquee) {
            var marqueeRect = new Rect($marquee[0].getBoundingClientRect()),
                leftBracketRect = new Rect(this.$leftBracket[0].getBoundingClientRect()),
                rightBracketRect = new Rect(this.$rightBracket[0].getBoundingClientRect()),
                middleOfLeft = leftBracketRect.getMiddle(),
                middleOfRight = rightBracketRect.getMiddle();

            return marqueeRect.isPointInRect(middleOfLeft) || marqueeRect.isPointInRect(middleOfRight);
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
        }

    }, {

    });
})();
