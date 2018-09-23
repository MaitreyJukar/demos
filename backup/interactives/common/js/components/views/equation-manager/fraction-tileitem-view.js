(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point;

    /**
    * FractionTileView holds the data for the FRACTION type Tile View.
    *
    * @class FractionTileView
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager.TileItemView
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewClassNamespace.FractionTileView = viewClassNamespace.TileView.extend({

        $numeratorDiv: null,
        $denominatorDiv: null,
        $vinculumLine: null,

        _iNumTreeHeight: null,
        _iDenmTreeHeight: null,

        _$div1: null,
        $base: null,

        initialize: function () {
            this.arrTileViews = [];
            this.$arrOperatorViews = [];
            this._iNumTreeHeight = 0;
            this._iDenmTreeHeight = 0;
            viewClassNamespace.FractionTileView.__super__.initialize.apply(this, arguments);
            this.listenEvents();
        },

        render: function () {
            var arrTiles = this.model.get('tileArray'),
                i = 0;
            for (i = 0; i < arrTiles.length; i++) {
                this.arrTileViews[i] = new viewClassNamespace.TileView.createTileItemView(arrTiles.at(i), this, this.equationManager, this.player, this.filePath, this.manager, this.idPrefix);
            }
        },

        createView: function () {
            var classes = viewClassNamespace.TileView.CLASSES,
                i = 0, $child, iTreeHeight, tileView,
                equationManager = this.equationManager,
                templateString = null,
                $template = null,
                baseValue = 1,      // for div-one
                binTileTypes = modelClassNameSpace.TileItem.BinTileType;

            //$accTerm = $('<div></div>').addClass('acc-div ' + 'acc-read-elem math-utilities-manager-access').appendTo(this.$el);

            this.$base = $('<div></div>').addClass(classes.BASE);
            this.$numeratorDiv = $('<div></div>', { class: classes.FRACTION + '-' + classes.NUMERATOR + ' ' + classes.Level + this.getLevel() });
            this.$denominatorDiv = $('<div></div>').addClass(classes.FRACTION + '-' + classes.DENOMINATOR);
            this.$vinculumLine = $('<div></div>').addClass(classes.FRACTION + '-' + classes.VINICULUM);
            $('<div></div>').addClass('inner').appendTo(this.$vinculumLine);
            this.$base.append(this.$numeratorDiv).append(this.$vinculumLine).append(this.$denominatorDiv);
            this.$el.append(this.$base);
            this.$el.addClass(classes.FRACTION).addClass(classes.Level + this.getLevel());

            for (i = 0; i < this.arrTileViews.length; i++) {
                tileView = this.arrTileViews[i];
                if (tileView.model.get('bDenominator') === false) {
                    $child = tileView.createView();
                    this.$numeratorDiv.append($child);
                }
                else {
                    break;
                }
            }

            for (; i < this.arrTileViews.length; i++) {
                tileView = this.arrTileViews[i];
                if (tileView.model.get('bDenominator') === true) {
                    $child = tileView.createView();
                    this.$denominatorDiv.append($child);
                }
            }

            this._iNumTreeHeight = this.getNumeratorTreeHeight();
            this._iDenmTreeHeight = this.getDenominatorTreeHeight();

            //this.$numeratorDiv.addClass('tree-height-' + this._iNumTreeHeight);
            //this.$denominatorDiv.addClass('tree-height-' + this._iDenmTreeHeight);

            this.createOperatorView();

            // div-one creation
            templateString = MathInteractives.Common.Components.templates['baseTile']({
                'base': baseValue,
                'base-class': classes.BASE,
                'baseTileType': binTileTypes.BASE_ONLY,
                'idPrefix': this.idPrefix,
                'level': classes.Level + 1
            });
            $template = $(templateString);

            //this._$div1 = $('<div></div>').append($template)
            //                              .addClass('div-one')
            //                              .appendTo(this.$numeratorDiv)
            //                              .addClass(classes.TermContainer)
            //                              .addClass(classes.BASE_ONLY)
            //                              .addClass(classes.Level + 1)
            //                              .attr('data-tiletype', 1);
            //this._$div1.find('.box').hide();
            //this._onNumeratorHeightChange();
            this._onDenominatorHeightChange();

            return this.$el;
        },

        createOperatorView: function () {
            var i = 0, $operatorChild, tileView, operator,
                level = this.getLevel(),
                classes = viewClassNamespace.TileView.CLASSES;

            for (i = 0; i < this.arrTileViews.length; i++) {
                tileView = this.arrTileViews[i];
                operator = tileView.model.get('operator');
                if (tileView.model.get('bDenominator') === false) {
                    if (operator !== null) {
                        $operatorChild = this.createOperator(operator);
                        $operatorChild.insertBefore(tileView.$el);
                        this.$arrOperatorViews[i] = $operatorChild;
                    }
                    else {
                        this.$arrOperatorViews[i] = null;
                    }
                }
                else {
                    break;
                }
            }

            for (; i < this.arrTileViews.length; i++) {
                tileView = this.arrTileViews[i];
                operator = tileView.model.get('operator');
                if (tileView.model.get('bDenominator') === true) {
                    if (operator !== null) {
                        $operatorChild = this.createOperator(operator);
                        $operatorChild.insertBefore(tileView.$el);
                        this.$arrOperatorViews[i] = $operatorChild;
                    }
                    else {
                        this.$arrOperatorViews[i] = null;
                    }
                }
            }
        },

        createOperator: function (operator) {
            var operator, $operatorChild,
                level = this.getLevel(),
                classes = viewClassNamespace.TileView.CLASSES,
                $operatorDiv = $('<div></div>');
            if (operator !== null) {
                $operatorChild = $('<div></div>').addClass(classes.OperatorContainer + ' ' + classes.Level + level);
                if (operator === '+' || operator === '-') {
                    $operatorDiv.text(operator);
                }
                $operatorDiv.addClass(classes.Operator + ' ' + classes[operator] + ' ' + classes.Level + (level + 1)).appendTo($operatorChild);
                return $operatorChild;
            }
            return null;
        },

        /**
        * Returns a boolean whether the fraction is empty or not.
        * This is still WIP
        * @method isEmpty
        * @return {Boolean} True if the fraction is empty. False otherwise.
        */
        isEmpty: function () {
            return false;
        },

        getTreeHeight: function () {
            var i = 0, iTemp = 0, iMaxHeight = 0;
            for (i = 0; i < this.arrTileViews.length; i++) {
                iTemp = this.arrTileViews[i].getTreeHeight();
                if (iTemp > iMaxHeight) {
                    iMaxHeight = iTemp;
                }
            }
            return iMaxHeight + 1;
        },

        refresh: function () {
            this._iNumTreeHeight = this.getNumeratorTreeHeight();
            this._onNumeratorHeightChange();
            this._iDenmTreeHeight = this.getDenominatorTreeHeight();
            this._onDenominatorHeightChange();
            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right');
                this.curHoveredTile = null;
            }
            viewClassNamespace.FractionTileView.__super__.refresh.apply(this, arguments);
        },

        listenEvents: function () {
            this.listenTo(this.model.get('tileArray'), 'add', this.onAddTile);
            this.listenTo(this.model.get('tileArray'), 'remove', this.onRemoveTile);
            this.listenTo(this.model, 'change:operator', this._onOperatorChange);
        },

        _onOperatorChange: function (model, operator) {
            this.parent.changeOperatorArray(model, operator);
        },

        onAddTile: function (model, collection, options) {
            var operator, $operatorChild,
                index = (options.at !== null && options.at !== undefined) ? parseInt(options.at, 10) : this.arrTileViews.length,
                arrTiles = this.model.get('tileArray'),
                tileView = viewClassNamespace.TileView.createTileItemView(model, this, this.equationManager, this.player, this.filePath, this.manager, this.idPrefix),
                $tileViewElm = tileView.createView(),
                numLength = this.getNumeratorLength(this.arrTileViews),
                denLength = this.arrTileViews.length - numLength,
                isAnimating = model.get('isAnimate');

            if (this.equationManager.restrictFirstTileAnimation === false) {
                if (isAnimating) {
                    $tileViewElm.css({ 'visibility': 'hidden' }).addClass('animated-tiles');
                }
            }
            if (index === 0) {
                if (model.get('bDenominator') === false) {
                    this.$numeratorDiv.prepend($tileViewElm);
                }
                else {
                    this.$denominatorDiv.prepend($tileViewElm);
                }
            }
            else if (model.get('bDenominator') === false && numLength === 0) {
                this.$numeratorDiv.append($tileViewElm);
            }
            else if (model.get('bDenominator') === true && denLength === 0) {
                this.$denominatorDiv.append($tileViewElm);
            }
            else {
                if (index === numLength && model.get('bDenominator') === true) {
                    this.$denominatorDiv.prepend($tileViewElm);
                }
                else {
                    $tileViewElm.insertAfter(this.arrTileViews[index - 1].$el);
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
                this.$arrOperatorViews.splice(index, 0, $operatorChild);

            }
            else {
                this.$arrOperatorViews.splice(index, 0, null);
            }
            model.set('isAnimate', false);
            this.equationManager.restrictFirstTileAnimation = false;
            //tileView.fillRects();
            tileView.attachEvents();
            this.equationManager.tileAdded(tileView);
            this.arrTileViews.splice(index, 0, tileView);

            this.$numeratorDiv.removeClass('tree-height-' + this._iNumTreeHeight);
            this.$denominatorDiv.removeClass('tree-height-' + this._iDenmTreeHeight);

            this._iNumTreeHeight = this.getNumeratorTreeHeight();
            this._onNumeratorHeightChange();
            this._iDenmTreeHeight = this.getDenominatorTreeHeight();
            this._onDenominatorHeightChange();
            //this.$numeratorDiv.addClass('tree-height-' + this._iNumTreeHeight);
            //this.$denominatorDiv.addClass('tree-height-' + this._iDenmTreeHeight);

        },

        onRemoveTile: function (model, collection, options) {
            var index = options.index,
                tileView = this.arrTileViews[index],
                operatorView = null,
                operator = tileView.model.get('operator'),
                self = this;

            //this check is for parenthesis tooltip to be removed on corresponding parenthesis remove.
            if (this.equationManager.model.get('mode') === modelClassNameSpace.EquationManager.MODES.SolveMode) {
                if (model.get('type') === modelClassNameSpace.TileItem.SolveTileType.PARENTHESIS || model.get('type') === modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS) {
                    if (model.get('type') === modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS) {
                        this.equationManager.parenthesisRemoved(parseInt(tileView.$exponent.attr('id').replace(this.equationManager.getIdPrefix() + 'exponent-', '')), true);
                    }
                    else {
                        this.equationManager.parenthesisRemoved(parseInt(tileView.$exponent.attr('id').replace(this.equationManager.getIdPrefix() + 'exponent-', '')));

                    }
                }
            }
            if (self.$arrOperatorViews[index] !== null) {
                operatorView = this.$arrOperatorViews[index];
            }
            this.$arrOperatorViews.splice(index, 1);
            this.arrTileViews.splice(index, 1);

            this.$numeratorDiv.removeClass('tree-height-' + this._iNumTreeHeight);
            this.$denominatorDiv.removeClass('tree-height-' + this._iDenmTreeHeight);

            this._iNumTreeHeight = this.getNumeratorTreeHeight();
            this._onNumeratorHeightChange();
            this._iDenmTreeHeight = this.getDenominatorTreeHeight();
            this._onDenominatorHeightChange();
            //this.$numeratorDiv.addClass('tree-height-' + this._iNumTreeHeight);
            //this.$denominatorDiv.addClass('tree-height-' + this._iDenmTreeHeight);

            tileView.stopListeningEvents(true);

            if (operatorView) {
                operatorView.remove();
            }

            // Need to use setTimeout because sometimes the drop event is called
            // after the tileView has been removed.
            setTimeout(function () {

                tileView.$el.remove();
                //tileView.off();
            }, 0);
        },

        _onNumeratorHeightChange: function () {
            //if (this._iNumTreeHeight === 0) {
            //    this._$div1.css('display', 'inline-block');
            //}
            //else {
            //    this._$div1.css('display', 'none');
            //}
        },

        _onDenominatorHeightChange: function () {
            this.$vinculumLine.removeClass('dragging');
            if (this._iDenmTreeHeight === 0) {
                this.$vinculumLine.css('visibility', 'hidden');
                this.parent.$el.addClass('no-denominator');
            }
            else {
                this.$vinculumLine.css('visibility', '');
                this.parent.$el.removeClass('no-denominator');
            }
        },

        getNumeratorLength: function (tiles) {
            var index, count = 0,
                length = tiles.length;

            for (index = 0; index < length; index++) {
                if (tiles[index].model.get('bDenominator') === false) {
                    count++;
                }
            }
            return count;
        },

        getNumeratorTreeHeight: function () {
            var i = 0, iMaxHeight = 0, iTemp = 0, tileView;
            for (i = 0; i < this.arrTileViews.length; i++) {
                tileView = this.arrTileViews[i];
                if (tileView.model.get('bDenominator') === false) {
                    iTemp = tileView.getTreeHeight();
                    if (iTemp > iMaxHeight) {
                        iMaxHeight = iTemp;
                    }
                }
                else {
                    break;
                }
            }

            return iMaxHeight;
        },

        getDenominatorTreeHeight: function () {
            var i = 0, iMaxHeight = 0, iTemp = 0, tileView;
            for (i = 0; i < this.arrTileViews.length; i++) {
                tileView = this.arrTileViews[i];
                if (tileView.model.get('bDenominator') === true) {
                    iTemp = tileView.getTreeHeight();
                    if (iTemp > iMaxHeight) {
                        iMaxHeight = iTemp;
                    }
                }
            }

            return iMaxHeight;
        },

        attachEvents: function () {
            var i = 0, self = this;

            //            this.$exponent.on('dblclick', $.proxy(this._onExponentDoubleClick, this));

            for (i = 0; i < this.arrTileViews.length; i++) {
                this.arrTileViews[i].attachEvents();
            }

            this.$el.droppable({
                accept: this.model.get('strDroppables'),
                tolerance: 'pointer',
                greedy: true,
                drop: function (event, ui) {
                    if (!self.equationManager.getIsDropped()) {
                        self.onTileDrop(event, ui);
                        self.$el.removeClass('white-border-left' + ' ' + 'white-border-right' + ' ' + 'white-border');
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
        },


        _onExponentDoubleClick: function (event) {
        },

        onMouseOver: function (event, ui) {
            var tileViews = this.arrTileViews, i = 0,
                mulThresold = modelClassNameSpace.TileItem.MultiplicationThresold,
                addThresold = modelClassNameSpace.TileItem.AdditionThresold,
                evt = event.originalEvent ? event.originalEvent : event,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                rect = null,
                hoveredTile = null,
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                prevLocationData = draggedTileData['prevLocationData'],
                lengthNum = this.getNumeratorLength(tileViews),
                lengthDen = tileViews.length - lengthNum,
                countTiles = draggedTileData['length'] || 1,
                isSourceDen,
                rectNum = new Rect(this.$numeratorDiv[0].getBoundingClientRect()),
                rectDeno = new Rect(this.$denominatorDiv[0].getBoundingClientRect()),
                isDestDeno = !(ptMouse.getTop() <= rectNum.getBottom()),
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                draggedTileType = draggedTileData['tiletype'],
                binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                //expValueContainer = ui.helper.find('.exponent-value').last(),
                vinculumTop = this.$vinculumLine[0].getBoundingClientRect().top + 2,
                child, currentLocationData,
                firstTile, firstTileRect, lastTile, lastTileRect;


            this.equationManager.registerMouseOverTile(this, event, ui);

            if (equationManagerMode === equationManagerModeTypes.SolveMode) {

                if (draggedTileType === binTileTypes.BASE_EXPONENT || draggedTileType === binTileTypes.PARENTHESIS || draggedTileType === binTileTypes.MARQUEE) {
                    if (vinculumTop === 0) {
                        prevLocationData = currentLocationData = draggedTile.model.get('bDenominator');
                    }
                    else if (prevLocationData === null || prevLocationData === undefined) {
                        prevLocationData = currentLocationData = draggedTile.model.get('bDenominator');
                    }
                    else {
                        currentLocationData = vinculumTop > ptMouse.getTop() ? false : true;
                        if (currentLocationData !== prevLocationData) {
                            if(draggedTileType === binTileTypes.MARQUEE) {
                                this.equationManager.marqueeView.invertExponentText();
                            }
                            else {
                                draggedTile.invertExponentText(false);
                            }
                        }
                    }
                    ui.helper.data('prevLocationData', currentLocationData);
                }
                if (draggedTile && draggedTile.model) {
                    isSourceDen = draggedTile.model.get('bDenominator');
                }
                if (this.curHoveredTile) {
                    this.curHoveredTile.$el.removeClass('white-border-left white-border-right hover-border');
                }

                for (i = 0; i < tileViews.length; i++) {
                    child = tileViews[i];
                    if (child === draggedTile || this.equationManager.isTileViewInsideMarquee(child)) {
                        continue;
                    }
                    rect = new Rect(child.el.getBoundingClientRect());
                    rect = rect.inflateRect(mulThresold, 0);
                    if (rect.isPointInRect(ptMouse)) {
                        hoveredTile = child;
                        if (ptMouse.getLeft() < rect.getMiddle().getLeft()) {
                            hoveredTile.$el.addClass('white-border-left');
                        }
                        else {
                            hoveredTile.$el.addClass('white-border-right');
                        }
                        break;
                    }
                    else {
                        rect = rect.inflateRect(addThresold, 0);
                        if (rect.isPointInRect(ptMouse)) {
                            hoveredTile = child;
                            if (ptMouse.getLeft() < rect.getMiddle().getLeft()) {
                                hoveredTile.$el.addClass('white-border-left');
                            }
                            else {
                                hoveredTile.$el.addClass('white-border-right');
                            }
                            break;
                        }
                    }
                }

                if (hoveredTile !== null) {
                    this.$el.removeClass('white-border-left white-border-right hover-border');
                    this.curHoveredTile = hoveredTile;
                    if ((!isSourceDen && lengthDen === 0) || (isSourceDen && lengthDen === countTiles && tileViews.indexOf(draggedTile) !== -1)) {
                        if (!isDestDeno) {
                            this.$vinculumLine.css('visibility', 'hidden');
                        }
                        else {
                            if (!this.equationManager._tutorialMode) {
                                this.$vinculumLine.css('visibility', '').addClass('dragging');
                            }
                        }
                    }
                }
                else {
                    if (!this.hasChildView(draggedTile, true) && draggedTile.$el !== undefined) {
                        this.$el.removeClass('white-border-left white-border-right').addClass('hover-border');
                    }
                    else {
                        this.$el.removeClass('white-border-left white-border-right hover-border');
                        //if (!isSourceDen && lengthDen === 0) {
                        //    if (isDestDeno) {
                        //        this.$vinculumLine.show().addClass('dragging');
                        //    }
                        //    else {
                        //        this.$vinculumLine.hide();
                        //    }
                        //    hoveredTile = this;
                        //}
                        /*else*/ if ((!isSourceDen && lengthDen === 0) || (isSourceDen && lengthDen === countTiles && tileViews.indexOf(draggedTile) !== -1)) {
                            if (!isDestDeno) {
                                this.$vinculumLine.css('visibility', 'hidden');

                                firstTile = tileViews[0];
                                lastTile = tileViews[lengthNum - 1];
                                if (firstTile) {
                                    firstTileRect = new Rect(firstTile.el.getBoundingClientRect());
                                    if (draggedTile !== firstTile && ptMouse.getLeft() < firstTileRect.getLeft()) {
                                        firstTile.$el.removeClass('white-border-right white-border').addClass('white-border-left ');
                                        hoveredTile = firstTile;
                                    }
                                    else if (lastTile) {
                                        lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                                        if (draggedTile !== lastTile && ptMouse.getLeft() > lastTileRect.getRight()) {
                                            lastTile.$el.removeClass('white-border-left white-border').addClass('white-border-right ');
                                            hoveredTile = lastTile;
                                        }
                                    }
                                }
                            }
                            else {
                                if (!this.equationManager._tutorialMode) {
                                    this.$vinculumLine.css('visibility', '').addClass('dragging');
                                }
                            }
                        } else {
                            if (!isDestDeno) {
                                firstTile = tileViews[0];
                                lastTile = tileViews[lengthNum - 1];
                                if (firstTile) {
                                    firstTileRect = new Rect(firstTile.el.getBoundingClientRect());
                                    if (draggedTile !== firstTile && ptMouse.getLeft() < firstTileRect.getLeft()) {
                                        firstTile.$el.removeClass('white-border-right white-border').addClass('white-border-left ');
                                        hoveredTile = firstTile;
                                    }
                                    else if (lastTile) {
                                        lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                                        if (draggedTile !== lastTile && ptMouse.getLeft() > lastTileRect.getRight()) {
                                            lastTile.$el.removeClass('white-border-left white-border').addClass('white-border-right ');
                                            hoveredTile = lastTile;
                                        }
                                    }
                                }
                            }
                            else {
                                firstTile = tileViews[lengthNum];
                                lastTile = tileViews[this.arrTileViews.length - 1];

                                if (firstTile) {
                                    firstTileRect = new Rect(firstTile.el.getBoundingClientRect());
                                    if (draggedTile !== firstTile && ptMouse.getLeft() < firstTileRect.getLeft()) {
                                        firstTile.$el.removeClass('white-border-right white-border').addClass('white-border-left ');
                                        hoveredTile = firstTile;
                                    }
                                    else if (lastTile) {
                                        lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                                        if (draggedTile !== lastTile && ptMouse.getLeft() > lastTileRect.getRight()) {
                                            lastTile.$el.removeClass('white-border-left white-border').addClass('white-border-right ');
                                            hoveredTile = lastTile;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    this.curHoveredTile = hoveredTile;
                }
            }
            else if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                var isTileFromBin = false;
                if (!draggedTile) {
                    isTileFromBin = true;
                }

                if (draggedTileType === binTileTypes.PARENTHESIS) {
                    return;
                }

                if (this.curHoveredTile) {
                    this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
                }

                for (i = 0; i < tileViews.length; i++) {
                    child = tileViews[i];
                    if (child === draggedTile || child.isEmpty() || child.isEmptyInView()) {
                        continue;
                    }
                    rect = new Rect(child.el.getBoundingClientRect());
                    rect = rect.inflateRect(mulThresold, 0);
                    if (rect.isPointInRect(ptMouse)) {
                        hoveredTile = child;
                        if (ptMouse.getLeft() < rect.getMiddle().getLeft()) {
                            hoveredTile.$el.addClass('white-border-left');
                        }
                        else {
                            hoveredTile.$el.addClass('white-border-right');
                        }
                        break;
                    }
                    else {
                        rect = rect.inflateRect(addThresold, 0);
                        if (rect.isPointInRect(ptMouse)) {
                            hoveredTile = child;
                            if (ptMouse.getLeft() < rect.getMiddle().getLeft()) {
                                hoveredTile.$el.addClass('white-border-left');
                            }
                            else {
                                hoveredTile.$el.addClass('white-border-right');
                            }
                            break;
                        }
                    }
                }
                if (hoveredTile !== null) {
                    this.$el.removeClass('white-border-left white-border-right white-border');
                    this.curHoveredTile = hoveredTile;
                }
                else {
                    this.$el.removeClass('white-border-left white-border-right white-border');
                    if (isTileFromBin || !isTileFromBin) {
                        if (!isDestDeno) {
                            var firstTile = tileViews[0],
                                firstTileRect = new Rect(firstTile.el.getBoundingClientRect()),
                                lastTile = tileViews[lengthNum - 1],
                                lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                            if (!firstTile.isEmpty() && !firstTile.isEmptyInView() && ptMouse.getLeft() < firstTileRect.getLeft()) {
                                firstTile.$el.removeClass('white-border-right white-border').addClass('white-border-left ');
                                hoveredTile = firstTile;
                            }
                            else if (!lastTile.isEmpty() && !lastTile.isEmptyInView() && ptMouse.getLeft() > lastTileRect.getRight()) {
                                lastTile.$el.removeClass('white-border-left white-border').addClass('white-border-right ');
                                hoveredTile = lastTile;
                            }
                        }
                        else {
                            var firstTile = tileViews[lengthNum],
                                firstTileRect = new Rect(firstTile.el.getBoundingClientRect()),
                                lastTile = tileViews[this.arrTileViews.length - 1],
                                lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                            if (!firstTile.isEmpty() && !firstTile.isEmptyInView() && ptMouse.getLeft() < firstTileRect.getLeft()) {
                                firstTile.$el.removeClass('white-border-right white-border').addClass('white-border-left ');
                                hoveredTile = firstTile;
                            }
                            else if (!lastTile.isEmpty() && !lastTile.isEmptyInView() && ptMouse.getLeft() > lastTileRect.getRight()) {
                                lastTile.$el.removeClass('white-border-left white-border').addClass('white-border-right ');
                                hoveredTile = lastTile;
                            }
                        }
                    }
                    this.curHoveredTile = hoveredTile;
                }
            }
            if (hoveredTile) {
                this.equationManager.repositionBorderAdded(hoveredTile.$el);
            }
        },

        onMouseOut: function (event, ui) {
            var tileViews = this.arrTileViews,
                evt = event.originalEvent ? event.originalEvent : event,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                isSourceDen = true,
                lengthNum = this.getNumeratorLength(tileViews),
                lengthDen = tileViews.length - lengthNum,
                countTiles = draggedTileData['length'] || 1,
                rectNum = new Rect(this.$numeratorDiv[0].getBoundingClientRect()),
                isDestDeno = !(ptMouse.getTop() <= rectNum.getBottom()),
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES;

            viewClassNamespace.FractionTileView.__super__.onMouseOut.apply(this, arguments);
            this.$numeratorDiv.removeClass('white-border');
            this.$denominatorDiv.removeClass('white-border');

            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                isSourceDen = draggedTile.model.get('bDenominator');
                if (((isSourceDen && !isDestDeno && lengthDen === countTiles && tileViews.indexOf(draggedTile) !== -1) || (lengthDen === 0 && !isDestDeno))) {
                    this.$vinculumLine.css('visibility', 'hidden');
                }
            }
        },


        onTileDrop: function (event, ui) {
            var tileViews = this.arrTileViews, i = 0,
                mulThresold = modelClassNameSpace.TileItem.MultiplicationThresold,
                addThresold = modelClassNameSpace.TileItem.AdditionThresold,
                evt = event.originalEvent,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                rect = null,
                droppedTile = null,
                index = -1,
                isLeft = true,
                strOperator = '*',
                lengthNum = this.getNumeratorLength(tileViews),
                lengthDen = tileViews.length - lengthNum,
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData['tiletype'],
                length = draggedTileData['length'],
                sourceIndex,
                rectNum = new Rect(this.$numeratorDiv[0].getBoundingClientRect()),
                rectDeno = new Rect(this.$denominatorDiv[0].getBoundingClientRect()),
                isDestDeno = !(ptMouse.getTop() <= rectNum.getBottom()),
                countTiles = 1,
                parentIndex,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                child,
                data,
                bCommandResponse = false;

            if (length) {
                countTiles = length;
            }
            this.$el.removeClass('white-border-left white-border-right white-border');
            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
                this.curHoveredTile = null;
            }

            this.resetGreedyChild(ui.draggable);

            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                this.$numeratorDiv.removeClass('white-border');
                this.$denominatorDiv.removeClass('white-border');
                for (i = 0; i < tileViews.length; i++) {
                    child = tileViews[i];
                    if (child === draggedTile) {
                        continue;
                    }
                    rect = new Rect(child.el.getBoundingClientRect());
                    rect = rect.inflateRect(mulThresold, 0);
                    if (rect.isPointInRect(ptMouse)) {
                        droppedTile = child;
                        if (ptMouse.getLeft() < rect.getMiddle().getLeft()) {
                            index = i;
                            isLeft = true;
                        }
                        else {
                            index = i;
                            isLeft = false;
                        }
                        break;
                    }
                    else {
                        rect = rect.inflateRect(addThresold, 0);
                        if (rect.isPointInRect(ptMouse)) {
                            droppedTile = child;
                            if (ptMouse.getLeft() < rect.getMiddle().getLeft()) {
                                index = i;
                                isLeft = true;
                            }
                            else {
                                index = i;
                                isLeft = false;
                            }
                            strOperator = '+';
                            break;
                        }
                    }
                }

                if (droppedTile === null) {
                    if (lengthNum === 0 && !isDestDeno) {
                        index = 0;
                        droppedTile = this;
                        isLeft: true;
                    }
                    else if (lengthDen === 0 && isDestDeno) {
                        index = lengthNum - 1;
                        droppedTile = this;
                        isLeft = false;
                    }
                    else {
                        if (!isDestDeno) {
                            var firstTile = tileViews[0],
                                firstTileRect = new Rect(firstTile.el.getBoundingClientRect()),
                                lastTile = tileViews[lengthNum - 1],
                                lastTileRect = new Rect(lastTile.el.getBoundingClientRect());

                            if (draggedTile !== firstTile && ptMouse.getLeft() < firstTileRect.getLeft()) {
                                droppedTile = firstTile;
                                index = 0;
                                isLeft = true;
                            }
                            else if (draggedTile !== lastTile && ptMouse.getLeft() > lastTileRect.getRight()) {
                                droppedTile = lastTile;
                                index = lengthNum - 1;
                                isLeft = false;
                            }
                        }
                        else {
                            var firstTile = tileViews[lengthNum],
                               firstTileRect = new Rect(firstTile.el.getBoundingClientRect()),
                                lastTile = tileViews[this.arrTileViews.length - 1],
                                lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                            if (draggedTile !== firstTile && ptMouse.getLeft() < firstTileRect.getLeft()) {
                                droppedTile = firstTile;
                                index = lengthNum;
                                isLeft = true;
                            }
                            else if (draggedTile !== lastTile && ptMouse.getLeft() > lastTileRect.getRight()) {
                                droppedTile = lastTile;
                                index = lengthNum + lengthDen - 1;
                                isLeft = false;
                            }
                        }
                    }
                }
                if (droppedTile !== null && !this.equationManager.isTileViewInsideMarquee(droppedTile)) {
                    data = {
                        sourceTile: draggedTile, index: this.parent.getIndex(this) + '.' + index,
                        isDestDeno: isDestDeno, numOfTiles: countTiles, strOperator: strOperator, isLeft: isLeft
                    };
                    bCommandResponse = this.equationManager.onRepositionTile(data);
                    if (bCommandResponse) {
                        ui.draggable.data('isDropped', true);
                    }
                }
                else {
                    if (!this.hasChildView(draggedTile, true) && !this.equationManager.isTileViewInsideMarquee(this)) {
                        data = { sourceTile: draggedTile, destTile: this, numOfTiles: countTiles };
                        bCommandResponse = this.equationManager.onCombineTiles(data);
                        if (bCommandResponse) {
                            ui.draggable.data('isDropped', true);
                        }
                    }
                }
            }
            else if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                var isTileFromBin = false;
                if (!draggedTile) {
                    isTileFromBin = true;
                }
                for (i = 0; i < tileViews.length; i++) {
                    child = tileViews[i];
                    rect = new Rect(child.el.getBoundingClientRect());
                    rect = rect.inflateRect(mulThresold, 0);
                    if (rect.isPointInRect(ptMouse)) {
                        if (child === draggedTile || child.isEmptyInView()) {
                            continue;
                        }
                        droppedTile = child;
                        if (ptMouse.getLeft() < rect.getMiddle().getLeft()) {
                            index = i;
                            isLeft = true;
                        }
                        else {
                            index = i;
                            isLeft = false;
                        }
                        break;
                    }
                    else {
                        rect = rect.inflateRect(addThresold, 0);
                        if (rect.isPointInRect(ptMouse)) {
                            droppedTile = child;
                            if (ptMouse.getLeft() < rect.getMiddle().getLeft()) {
                                index = i;
                                isLeft = true;
                            }
                            else {
                                index = i;
                                isLeft = false;
                            }
                            strOperator = '+';
                            break;
                        }
                    }
                }

                if (droppedTile === null) {
                    if (isTileFromBin || !isTileFromBin) {
                        if (!isDestDeno) {
                            var firstTile = this.arrTileViews[0],
                                firstTileRect = new Rect(firstTile.el.getBoundingClientRect());
                            if (ptMouse.getLeft() < firstTileRect.getLeft() && !firstTile.isEmpty()) {
                                droppedTile = firstTile;
                                isLeft = true;
                            }
                            else {
                                var lastTile = this.arrTileViews[lengthNum - 1],
                                    lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                                if (ptMouse.getLeft() > lastTileRect.getRight() && !lastTile.isEmpty()) {
                                    droppedTile = lastTile;
                                    isLeft = false;
                                }
                            }
                        }
                        else {
                            var firstTile = this.arrTileViews[lengthNum],
                                firstTileRect = new Rect(firstTile.el.getBoundingClientRect());
                            if (ptMouse.getLeft() < firstTileRect.getLeft() && !firstTile.isEmpty()) {
                                droppedTile = firstTile;
                                isLeft = true;
                            }
                            else {
                                var lastTile = this.arrTileViews[this.arrTileViews.length - 1],
                                    lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                                if (ptMouse.getLeft() > lastTileRect.getRight() && !lastTile.isEmpty()) {
                                    droppedTile = lastTile;
                                    isLeft = false;
                                }
                            }
                        }
                        if (draggedTileType === binTileTypes.PARENTHESIS && droppedTile === draggedTile) {
                            droppedTile = null;
                        }
                        index = tileViews.indexOf(droppedTile);
                    }
                }
                if (isTileFromBin) {
                    if (droppedTile && !droppedTile.isEmpty()) {
                        if (draggedTileType === binTileTypes.BASE || draggedTileType === binTileTypes.EXPONENT) {
                            isDestDeno = droppedTile.model.get('bDenominator');
                            data = { sourceTile: ui.helper, index: this.parent.getIndex(this) + '.' + index, isDestDeno: isDestDeno, strOperator: strOperator, isLeft: isLeft };
                            bCommandResponse = this.equationManager.onAddTile(data);
                            if (bCommandResponse) {
                                ui.draggable.data('isDropped', true);
                            }
                        }
                    }
                    else {
                        ui.draggable.data('isDropped', false);
                    }
                }
                else {
                    if (droppedTile && !droppedTile.isEmpty() && !droppedTile.isEmptyInView()) {
                        if (draggedTileType === binTileTypes.BASE || draggedTileType === binTileTypes.EXPONENT) {
                            data = { sourceTile: draggedTile, tiletype: draggedTileType, destTile: droppedTile, numOfTiles: length, strOperator: strOperator, isLeft: isLeft };
                            bCommandResponse = this.equationManager.onRepositionIndividualTile(data);
                            if (bCommandResponse) {
                                ui.draggable.data('isDropped', true);
                            }
                        }
                        else if (draggedTileType === binTileTypes.MARQUEE && !this.equationManager.isTileViewInsideMarquee(droppedTile)) {
                            data = { sourceTile: draggedTile, destTile: droppedTile, numOfTiles: length, strOperator: strOperator, isLeft: isLeft };
                            bCommandResponse = this.equationManager.onRepositionTile(data);
                            if (bCommandResponse) {
                                ui.draggable.data('isDropped', true);
                            }
                        }
                    }
                }
            }

        },

        onChildParenthesisChangeSign: function (tileView) {
            var tileViews = this.arrTileViews,
                modelChild = tileView.model,
                isSourceNum = modelChild.get('bDenominator'),
                isDestDeno = !isSourceNum,
                data,
                lenNum = this.getNumeratorLength(tileViews),
                lenDeno = tileViews.length - lenNum,
                destIndex,
                isLeft = false,
                bCommandResponse;

            if (!isDestDeno) {
                if (lenNum === 0) {
                    destIndex = 0;
                    isLeft = true;
                }
                else {
                    destIndex = lenNum - 1;
                }
            }
            else {
                if (lenDeno === 0) {
                    destIndex = lenNum - 1;
                    isLeft = true;
                }
                else {
                    destIndex = lenNum + lenDeno - 1;
                }
            }
            data = {
                sourceTile: tileView, index: this.parent.getIndex(this) + '.' + destIndex,
                isDestDeno: isDestDeno, numOfTiles: 1, strOperator: '*', isLeft: false,
                isTooltipClick: true
            };
            bCommandResponse = this.equationManager.onRepositionTile(data);
        },

        /**
        * Returns the elements that are inside the marquee drawn.
        * @method getElementsInsideMarquee
        * @param {Object} Marquee end event
        * @param {Object} Marquee div
        */
        getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee) {
            var marqueeRect = new Rect($marquee[0].getBoundingClientRect()),
                middleOfRect = marqueeRect.getMiddle(), i = 0, rect, length,
                vinculumRect = new Rect(this.$vinculumLine[0].getBoundingClientRect()),
                currentTile = null,
                NUMERATOR_MARQUEE_CLASS = viewClassNamespace.EquationManager.NUMERATOR_MARQUEE_CLASS,
                DENOMINATOR_MARQUEE_CLASS = viewClassNamespace.EquationManager.DENOMINATOR_MARQUEE_CLASS,
                marqueeBDenominator = vinculumRect.get('top') < event.marqueeStartY,
                mouseUpPoint = new Point({ left: event.marqueeStartX, top: event.marqueeStartY });

            if (vinculumRect.isPointInRect(mouseUpPoint)) {
                marqueeBDenominator = event.clientY > event.marqueeStartY ? true : false;
            }

            if (this.$vinculumLine.css('visibility') === 'hidden') {
                marqueeBDenominator = false;
            }

            for (i = 0, length = this.arrTileViews.length; i < length; i++) {
                rect = new Rect(this.arrTileViews[i].$el[0].getBoundingClientRect());
                middleOfRect = rect.getMiddle(),
                currentTile = this.arrTileViews[i].model;

                if (currentTile.get('bDenominator') === marqueeBDenominator) {
                    this.arrTileViews[i].getElementsInsideMarquee(event, $marquee);
                }
            }

            $marquee.removeClass(DENOMINATOR_MARQUEE_CLASS)
                    .removeClass(NUMERATOR_MARQUEE_CLASS);
            marqueeBDenominator ? $marquee.addClass(DENOMINATOR_MARQUEE_CLASS) : $marquee.addClass(NUMERATOR_MARQUEE_CLASS);
        },

        getTileContentInHtmlForm: function getTileContentInHtmlForm() {
            var model = this.model,
                operator = model.get('operator'),
                exponent = model.get('exponent'),
                tileArray = this.arrTileViews,
                htmlString = '', index, vincullum,
                isNumeratorEmpty = true,
                isDenominatorEmpty = true,
                numeratorString,
                denominatorString,
                isFractionParentParenthesis = this.parent.model.get('type') === modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS ? true : false;

            if (operator === '*') {
                htmlString = htmlString + '<div class=\'operator-data-tab\'></div>';
            }
            if (isFractionParentParenthesis) {
                numeratorString = '<div class=\'fraction-data-tab adjust-bottom\'><div class=\'numerator\'>';
            }
            else {
                numeratorString = '<div class=\'fraction-data-tab\'><div class=\'numerator\'>';
            }


            htmlString += numeratorString;
            for (index = 0; index < tileArray.length; index++) {
                if (!tileArray[index].model.get('bDenominator')) {
                    htmlString += tileArray[index].getTileContentInHtmlForm();
                    isNumeratorEmpty = false;
                }
            }
            if (isNumeratorEmpty === true) {
                htmlString = htmlString.replace(numeratorString, '<div class=\'fraction-data-tab\'><div class=\'numerator numerator-empty\'>1');
            }

            htmlString += '</div><div class=\'vincullum\'></div>';
            denominatorString = '<div class=\'denominator\'>';
            htmlString += denominatorString;
            for (index = 0; index < tileArray.length; index++) {
                if (tileArray[index].model.get('bDenominator')) {
                    htmlString += tileArray[index].getTileContentInHtmlForm();
                    isDenominatorEmpty = false;
                }
            }
            if (isDenominatorEmpty === true) {
                htmlString = htmlString.replace(denominatorString, '<div class=\'denominator denominator-empty\'>');
            }

            htmlString += '</div></div>';
            return htmlString;
        },

        _getTutorialMouseEventPoint: function _getTutorialMouseEventPoint(clickPointEnum) {
            clickPointEnum = Number(clickPointEnum);
            var tile, tileRect, top, left, height, width, offsetX = 0, offsetY = 0;
            if (clickPointEnum === 0) { // tile center
                tile = this.el;
                tileRect = tile.getBoundingClientRect();
                height = tileRect.height;
                width = tileRect.width;
                top = tileRect.top;
                left = tileRect.left;
                offsetY += height / 2;
                offsetX += width / 2;
                return {
                    //point: { x: left + offsetX, y: top + offsetY },
                    offset: { x: offsetX, y: offsetY },
                    element: tile
                };
            }
            else {
                return viewClassNamespace.FractionTileView.__super__._getTutorialMouseEventPoint.apply(this, arguments);
            }
        },

        startAcc: function startaAcc() {
            this.getNextTileAcc();
        },

        buildStartAcc: function buildStartAcc() {
            if (this.arrTileViews.length > 0) {
                this.arrTileViews[0].buildStartAcc();
            }
        },
        buildContinueAcc: function buildContinueAcc(index) {
            if ($(document.activeElement).hasClass('acc-num')) {
                this.removeAccDiv();
                this.startAccDenominator();
            }
            else if ($(document.activeElement).hasClass('acc-den')) {
                this.removeAccDiv();
                if (this.parent.startExpToggle() === false) {
                    this.startAccNumerator();
                }
            }
        },
        getNextTileAcc: function getNextTileAcc() {
            if (this.arrTileViews.length > 0) {
                this.arrTileViews[0].startAcc(true);
            }
        },

        startAccOnNextTile: function startAccOnNextTile() {
            var equationManager = this.equationManager;
            if (this.accDiv) {
                this.removeAccDiv();
            }
            if (equationManager.isMarqueeSelectedForOp) {
                if (this.arrTileViews.length < equationManager.marqueeSelectedItems.length) {
                    equationManager.stopSpaceSelect();
                } else {
                    this.startAcc();
                }
            } else if (equationManager.tileSelected) {
                if (this.arrTileViews.length < 2) {
                    equationManager.tileSelected = null;
                    equationManager.getCurrentAccView().startAcc();
                }
                else {
                    this.startAcc();
                }
            }
            else {
                equationManager.setCurrentAccView(null);
                equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.SOLVE_TAB);
            }
        },

        buildStartAccOnNextTile: function startAccOnNextTile() {
            if (this.accDiv) {
                this.removeAccDiv();
            }
            this.equationManager.setCurrentAccView(null);
            this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.BUILD_TAB);
        },

        getNextDenoTileAcc: function getNextDenoTileAcc() {
            if (this.model.isDenominatorEmpty()) {
                return;
            }
            var numLength = this.getNumeratorLength(this.arrTileViews),
                firstDenTile = this.arrTileViews[numLength];
            firstDenTile.startAcc(true);
        },

        getContainerToAppend: function getContainerToAppend(bool) {
            if (bool) {
                return this.$denominatorDiv;
            }
            return this.$numeratorDiv;
        },

        goPreviousAcc: function goPreviousAcc(index) {
            this.parent.shiftTabHandler();
        },

        buildGoPreviousAcc: function buildGoPreviousAcc() {
            if ($(document.activeElement).hasClass('acc-den')) {
                this.removeAccDiv();
                this.startAccNumerator();

            }
            else if ($(document.activeElement).hasClass('acc-num')) {
                this.removeAccDiv();
                if (this.parent.startExpToggle() === false) {
                    this.startAccDenominator();
                }
            }
        },

        shiftTabHandler: function shiftTabHandler() {
            if (this.equationManager.tileSelected) {
                this.arrTileViews[this.arrTileViews.length - 1].shiftTabHandler(false);
            }
            else {
                this.parent.shiftTabHandler();
            }
        },

        spaceToDropTile: function (isContextMenu, isDenominator) {
            var arrTileViewsLen = this.arrTileViews.length,
                arrTiles = this.arrTileViews,
                index = this.parent.getIndex(this),
                numLength = this.getNumeratorLength(this.arrTileViews),
                denLength = arrTileViewsLen - numLength,
                data, start = 0, j = 0, tileObj = null,
                selectedTile = this.equationManager.selectedTile,
                tileData = selectedTile.data(),
                tileType = tileData.tiletype,
                tileValue = tileData.tilevalue, itemToReplace, parIndex, end, isSuccess;

            data = {
                index: index + '.' + (numLength - 1),
                isDestDeno: false,
                isLeft: false,
                sourceTile: selectedTile,
                strOperator: '*'
            };
            if (isContextMenu) {
                if (isDenominator) {
                    start = j = numLength;
                    data.index = index + '.' + (arrTileViewsLen - 1);
                    data.isDestDeno = true;
                    end = arrTileViewsLen;
                }
                else {
                    start = j = 0;
                    end = numLength;
                }
            }
            else {
                if ($(document.activeElement).hasClass('acc-num')) {
                    start = j = 0;
                    end = numLength;
                }
                else if ($(document.activeElement).hasClass('acc-den')) {
                    start = j = numLength;
                    data.index = index + '.' + (arrTileViewsLen - 1);
                    data.isDestDeno = true;
                    end = arrTileViewsLen;
                }
            }

            for (; j < end; j++) {
                tileObj = arrTiles[j].getTileItemIndex(tileType);
                if (tileObj.emptyTile !== null) {
                    itemToReplace = this.equationManager.equationView.getViewFromIndex(tileObj.tileIndex);
                    break;
                }
            }
            if ((tileObj.emptyTile === tileType || tileObj.emptyTile === 'BASE_EXPONENT') && tileType !== 'PARENTHESIS') {
                data.destTile = itemToReplace;
                isSuccess = this.equationManager.onReplaceTile(data);
                if (!isContextMenu) {
                    this.removeAccDiv();
                }
                //if (isSuccess) {
                //    this.setFocus('droppable-region');
                //}
            }
            else {
                if (tileType === 'PARENTHESIS') {
                    for (j = start; j < end; j++) {
                        if (this._isParenthesisPresent(j)) {
                            continue;
                        }
                        else {
                            data.index = index + '.' + j; // parenthesis will add on 1st index of num or den
                            break;
                        }
                    }
                    if (j === end) {
                        this.equationManager.trigger(viewClassNamespace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
                        if (!isContextMenu) {
                            this.removeAccDiv();
                        }
                        this.equationManager.buildModeSetFocusOnTooltip();
                        this.equationManager.selectedTile = null;
                        return false;
                    }
                }

                isSuccess = this.equationManager.onAddTile(data);
                //if (isSuccess) {
                //    this.setFocus('droppable-region');
                //}
                if (!isContextMenu) {
                    this.removeAccDiv();
                }
            }
            this.equationManager.selectedTile = null;
            this.equationManager.isSelectedTileExponent = false;
            this.equationManager.equationView.tileDroppedString = this.getAccMessage('base-exp-pair', 12, [tileValue]);
            this.equationManager.buildModeSetFocusOnTooltip();

        },

        _isParenthesisPresent: function _isParenthesisPresent(index) {
            var arrTiles = this.arrTileViews;
            if (arrTiles[index].model.get('type') === 'PARENTHESIS') {
                return true;
            }
            return false;
        },

        buildShiftTabHandler: function buildShiftTabHandler() {
            this.parent.buildShiftTabHandler();
        },

        //buildShiftTabHandler: function buildShiftTabHandler () {
        //    this.parent.buildShiftTabHandler();
        //},

        startAccNumerator: function startAccNumerator() {
            var ele = this.$numeratorDiv,
                elPosition = ele.position(),
                elHeight = ele.height(),
                elWidth = ele.width(),
                accDiv = $('<div class="acc-num"></div>');
            this.removeAccDiv();
            accDiv.css({ position: 'absolute', top: elPosition.top + 8, left: elPosition.left + 10, width: elWidth, height: elHeight, outline: '2px dotted #aaa', 'pointer-events': 'none', 'font-size': '0px' });
            accDiv.text(this.getAccMessage('base-exp-pair', 14));
            this.$base.append(accDiv);
            this.equationManager.setCurrentAccView(this);
            this.accDiv = accDiv;
            accDiv.attr('tabindex', -1);
            accDiv[0].focus();
        },

        startAccDenominator: function startAccDenominator() {
            if (this.model.isDenominatorEmpty()) {
                this.currentAccLevel = 1;
                this.getNextTileAcc();
                return;
            }
            var ele = this.$denominatorDiv,
                elPosition = ele.position(),
                elHeight = ele.height(),
                elWidth = ele.width(),
                accDiv = $('<div class="acc-den"></div>');
            this.removeAccDiv();
            accDiv.css({ position: 'absolute', top: elPosition.top + 3, left: elPosition.left + 10, width: elWidth, height: elHeight, outline: '2px dotted #aaa', 'pointer-events': 'none', 'font-size': '0px' });
            accDiv.text(this.getAccMessage('base-exp-pair', 15));
            this.$base.append(accDiv);
            this.equationManager.setCurrentAccView(this);
            this.accDiv = accDiv;
            accDiv.attr('tabindex', -1);
            accDiv[0].focus();

        },

        removeAccDiv: function removeAccDiv() {
            if (this.accDiv) {
                this.accDiv.remove();
            }
        },

        getAccString: function getAccString() {
            var currentString = '',
                index;

            for (index = 0; index < this.arrTileViews.length; index++) {
                currentString += this.arrTileViews[index].getAccString();
            }
            return ' ' + currentString.trim();
        },

        /**
         * Checks if present as parent
         * @method isPresentAsParent
         * @public
         *
         * @returns {Boolean} true to detect that its a fraction tile as some parent.
         */
        isPresentAsParent: function isPresentAsParent () {
            return true;
        }

    }, {

    });
})();
