(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManager,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point;;

    /**
    * EquationView holds the data for the Equation View.
    *
    * @class EquationView
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewClassNamespace.EquationView = viewClassNamespace.TileView.extend({

        // $equationContainer: null,
        equationManager: null,
        _iTreeHeight: null,

        $equationViewDiv: null,

        tileDroppedString: '',
        customTutorialString: '',

        initialize: function () {
            if (this.arrTileViews === null) {
                this.arrTileViews = [];
            }
            if (this.$arrOperatorViews === null) {
                this.$arrOperatorViews = [];
            }
            this.setLevel(-1);
            viewClassNamespace.EquationView.__super__.initialize.apply(this, arguments);
            this.listenEvents();
        },

        render: function () {
            var equationArr = this.model.get('tileArray'),
                equationModel, i = 0;

            for (i; i < equationArr.length; i++) {
                this.arrTileViews[i] = viewClassNamespace.TileView.createTileItemView(equationArr.at(i), this, this.equationManager, this.player, this.filePath, this.manager, this.idPrefix);
            }
        },

        setEquationContainer: function ($element) {
            this.setElement($element);
        },

        reset: function () {
            this.$el.empty();
        },

        createView: function () {
            this.$equationViewDiv = $('<div></div>').attr('id', this.equationManager.getIdPrefix() + 'workspace-expression-area-equation-view')
            .addClass('equation-view-component').addClass('level' + this.getLevel());

            this.$el.append(this.$equationViewDiv);
            this.$el.addClass('equation-view').addClass('level' + this.getLevel());

            var i = 0, arrEqViews = this.arrTileViews, $child;
            for (i = 0; i < arrEqViews.length; i++) {
                $child = arrEqViews[i].createView();
                this.$equationViewDiv.append($child);
            }
            //$accTerm = $('<div></div>').addClass('acc-div ' + 'acc-read-elem math-utilities-manager-access').appendTo(this.$el);
            this.createOperatorView();
            //this.fillRects();
        },

        createOperatorView: function () {
            var i = 0, $operatorChild, tileView, operator,
                level = this.getLevel(),
                classes = viewClassNamespace.TileView.CLASSES;

            for (i = 0; i < this.arrTileViews.length; i++) {
                tileView = this.arrTileViews[i];
                operator = tileView.model.get('operator');
                if (operator !== null) {
                    $operatorChild = this.createOperator(operator);
                    $operatorChild.insertBefore(tileView.$el);
                    this.$arrOperatorViews[i] = $operatorChild;
                }
                else {
                    this.$arrOperatorViews[i] = null;
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

        //fillRects: function () {
        //    var i = 0, arrEqViews = this.arrTileViews;
        //    for (i = 0; i < arrEqViews.length; i++) {
        //        arrEqViews[i].fillRects();
        //    }
        //    this.model.set('rectTerm', new Rect(this.el.getBoundingClientRect()));
        //},

        getTreeHeight: function () {
            var i = 0, iTemp = 0, iMaxHeight = 0;
            for (i = 0; i < this.arrTileViews.length; i++) {
                iTemp = this.arrTileViews[i].getTreeHeight();
                if (iTemp > iMaxHeight) {
                    iMaxHeight = iTemp;
                }
            }
            this.setTreeHeight(iMaxHeight);
            return iMaxHeight + 1;
        },

        refreshTreeHeight: function () {
            this.getTreeHeight();
        },

        refresh: function () {
            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right');
                this.curHoveredTile = null;
            }
            viewClassNamespace.EquationView.__super__.refresh.apply(this, arguments);
        },

        attachDettachDroppable: function (bEnable) {
            this.makeDroppable(bEnable);
        },

        listenEvents: function () {
            this.listenTo(this.model.get('tileArray'), 'add', this.onAddTile);
            this.listenTo(this.model.get('tileArray'), 'remove', this.onRemoveTile);
        },

        onAddTile: function (model, collection, options) {
            var operator, $operatorChild,
                index = (options.at !== null && options.at !== undefined) ? parseInt(options.at, 10) : this.arrTileViews.length,
                arrTiles = this.model.get('tileArray'),
                tileView = viewClassNamespace.TileView.createTileItemView(model, this, this.equationManager, this.player, this.filePath, this.manager, this.idPrefix),
                $tileViewElm = tileView.createView(),
                noOfTiles = this.arrTileViews.length,
                isAnimating = model.get('isAnimate');

            if (this.equationManager.restrictFirstTileAnimation === false) {
                if (isAnimating) {
                    $tileViewElm.css({ 'visibility': 'hidden' }).addClass('animated-tiles');
                }
            }
            if (index === 0) {
                this.$equationViewDiv.prepend($tileViewElm);
            }
            else if (noOfTiles === 0) {
                this.$equationViewDiv.append($tileViewElm);
            }
            else {
                //if (index !== noOfTiles) {
                $tileViewElm.insertAfter(this.arrTileViews[index - 1].$el);
                //}
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

            //this.$el.removeClass('tree-height-' + this._iTreeHeight);

            this._iTreeHeight = this.getItemTreeHeight();

        },

        onRemoveTile: function (model, collection, options) {
            // TODO : remaining.
            // Will be same as parenthesis and fraction.

            var index = options.index,
                tileView = this.arrTileViews[index],
                operatorView = this.$arrOperatorViews[index],
                operator = tileView.model.get('operator');
            //this check is for parenthesis tooltip to be removed on corresponding parenthesis remove.
            if (this.equationManager.model.get('mode') === modelClassNamespace.EquationManager.MODES.SolveMode) {
                if (model.get('type') === modelClassNamespace.TileItem.SolveTileType.PARENTHESIS || model.get('type') === modelClassNamespace.TileItem.SolveTileType.BIG_PARENTHESIS) {
                    if (model.get('type') === modelClassNamespace.TileItem.SolveTileType.BIG_PARENTHESIS) {
                        this.equationManager.parenthesisRemoved(parseInt(tileView.$exponent.attr('id').replace(this.equationManager.getIdPrefix() + 'exponent-', '')), true);
                    }
                    else {
                        this.equationManager.parenthesisRemoved(parseInt(tileView.$exponent.attr('id').replace(this.equationManager.getIdPrefix() + 'exponent-', '')));
                    }
                }
            }

            if (this.$arrOperatorViews[index] !== null) {
                this.$arrOperatorViews[index].remove();
            }
            this.$arrOperatorViews.splice(index, 1);

            tileView.stopListeningEvents(true);

            setTimeout(function () {
                if (operatorView) {
                    operatorView.remove();
                }
                tileView.$el.remove();
                //tileView.off();
            }, 0)

            this.arrTileViews.splice(index, 1);

            //this.$el.removeClass('tree-height-' + this._iTreeHeight);
            this._iTreeHeight = this.getItemTreeHeight();
        },


        getItemTreeHeight: function () {
            var i = 0, iMaxHeight = 0, iTemp = 0, tileView;
            for (i = 0; i < this.arrTileViews.length; i++) {
                tileView = this.arrTileViews[i];
                iTemp = tileView.getTreeHeight();
                if (iTemp > iMaxHeight) {
                    iMaxHeight = iTemp;
                }
            }

            return iMaxHeight;
        },

        attachEvents: function () {
            var i = 0, arrEqViews = this.arrTileViews;
            for (i = 0; i < arrEqViews.length; i++) {
                arrEqViews[i].attachEvents();
            }
            this.makeDroppable(true);
        },

        makeDroppable: function (bEnable) {
            if (bEnable) {
                var self = this;
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
            }
            else {
                this.$el.droppable('destroy');
            }
        },

        onMouseOver: function (event, ui) {
            var tileViews = this.arrTileViews, i = 0,
                mulThresold = modelClassNamespace.TileItem.MultiplicationThresold,
                addThresold = modelClassNamespace.TileItem.AdditionThresold,
                evt = event.originalEvent ? event.originalEvent : event,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                rect = null,
                hoveredTile = null,
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNamespace.EquationManager.MODES,
                draggedTileType = draggedTileData['tiletype'],
                binTileTypes = modelClassNamespace.TileItem.BinTileType,
                child,
                firstTile, rectFirstTile, lastTile, rectLastTile;

            this.equationManager.registerMouseOverTile(this, event, ui);

            if (equationManagerMode === equationManagerModeTypes.SolveMode) {

                if (this.curHoveredTile) {
                    this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
                }

                for (i = 0; i < tileViews.length; i++) {
                    child = tileViews[i];
                    if (child === draggedTile) {
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
                    if (!this.hasChildView(draggedTile, true) && draggedTile.$el !== undefined) {
                        this.$el.removeClass('white-border-left white-border-right').addClass('white-border');
                    }
                    else {
                        firstTile = tileViews[0];
                        lastTile = tileViews[tileViews.length - 1];

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
                    if (child === draggedTile || child.isEmpty()) {
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
                        var firstTile = tileViews[0],
                            firstTileRect = new Rect(firstTile.el.getBoundingClientRect()),
                            lastTile = tileViews[tileViews.length - 1],
                            lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                        if (!firstTile.isEmpty() && ptMouse.getLeft() < firstTileRect.getLeft()) {
                            firstTile.$el.removeClass('white-border-right white-border').addClass('white-border-left ');
                            hoveredTile = firstTile;
                        }
                        else if (!lastTile.isEmpty() && ptMouse.getLeft() > lastTileRect.getRight()) {
                            lastTile.$el.removeClass('white-border-left white-border').addClass('white-border-right ');
                            hoveredTile = lastTile;
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
            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
            }

            this.$el.removeClass('white-border-left white-border-right white-border');
        },

        onTileDrop: function onTileDrop(event, ui) {
            var tileViews = this.arrTileViews, i = 0,
                mulThresold = modelClassNamespace.TileItem.MultiplicationThresold,
                addThresold = modelClassNamespace.TileItem.AdditionThresold,
                evt = event.originalEvent,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                rect = null,
                droppedTile = null,
                index = -1,
                isLeft = true,
                strOperator = '*',
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData['tiletype'],
                length = ui.helper.data('length'),
                sourceIndex,
                isSourceDeno,
                isDestDeno = this.model.get('bDenominator'),
                countTiles = 1,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNamespace.EquationManager.MODES,
                binTileTypes = modelClassNamespace.TileItem.BinTileType,
                bCommandResponse = false,
                child,
                data;

            //// don't do anything if user meant to drop on the marquee
            //if (this.equationManager.isPointInMarquee(ptMouse)) { return false; }

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
                    var firstTile = tileViews[0],
                        firstTileRect = new Rect(firstTile.el.getBoundingClientRect()),
                        lastTile = tileViews[tileViews.length - 1],
                        lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                    if (draggedTile !== firstTile && ptMouse.getLeft() < firstTileRect.getLeft()) {
                        droppedTile = firstTile;
                        index = 0;
                        isLeft = true;
                    }
                    else if (draggedTile !== lastTile && ptMouse.getLeft() > lastTileRect.getRight()) {
                        droppedTile = lastTile;
                        index = tileViews.length - 1;
                        isLeft = false;
                    }
                }

                if (droppedTile !== null) {
                    data = {
                        sourceTile: draggedTile, index: index.toString(),
                        isDestDeno: isDestDeno, numOfTiles: countTiles, strOperator: strOperator, isLeft: isLeft
                    };
                    bCommandResponse = this.equationManager.onRepositionTile(data);
                    if (bCommandResponse) {
                        ui.draggable.data('isDropped', true);
                    }
                }
                else {
                    if (!this.hasChildView(draggedTile, true) /*tileViews.indexOf(draggedTile) === -1*/) {
                        data = { sourceTile: draggedTile, destTile: this, numOfTiles: countTiles };
                        bCommandResponse = this.equationManager.onCombineTiles(data);
                        if (bCommandResponse) {
                            ui.draggable.data('isDropped', true);
                        }
                    }
                }

            } //end if solve mode
            else if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                var isTileFromBin = draggedTile ? false : true;

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
                    else {  // mouse outside rect
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
                        var firstTile = tileViews[0],
                            firstTileRect = new Rect(firstTile.el.getBoundingClientRect());
                        if (ptMouse.getLeft() < firstTileRect.getLeft()) {
                            droppedTile = firstTile;
                            isLeft = true;
                        }
                        else {
                            var lastTile = tileViews[tileViews.length - 1],
                                lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                            if (ptMouse.getLeft() > lastTileRect.getRight()) {
                                droppedTile = lastTile;
                                isLeft = false;
                            }
                        }
                        index = tileViews.indexOf(droppedTile);
                    }
                }
                if (isTileFromBin) {
                    if (droppedTile && !droppedTile.isEmpty()) {
                        if (draggedTileType === binTileTypes.BASE || draggedTileType === binTileTypes.EXPONENT) {
                            data = { sourceTile: ui.helper, index: index.toString(), isDestDeno: isDestDeno, strOperator: strOperator, isLeft: isLeft };
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
                    if (droppedTile && !droppedTile.isEmpty()) {
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

        getIndex: function (view) {
            var childIndex = this.arrTileViews.indexOf(view);
            return childIndex.toString();
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

            for (length = this.arrTileViews.length; i < length; i++) {
                rect = new Rect(this.arrTileViews[i].$el[0].getBoundingClientRect());
                middleOfRect = rect.getMiddle();

                this.arrTileViews[i].getElementsInsideMarquee(event, $marquee);
            }

        },

        getTileContentInHtmlForm: function getTileContentInHtmlForm() {
            var tileArray = this.arrTileViews,
                tileArrayLength = tileArray.length,
                index,
                htmlString = '', currentTile;

            htmlString += '<div class=\'header-expression-container\'><div class=\'header-expression\'>';
            for (index = 0; index < tileArrayLength; index++) {
                currentTile = tileArray[index];
                htmlString += currentTile.getTileContentInHtmlForm();
            }
            htmlString += '</div></div>';
            return htmlString;
        },

        getTileAccesibilityText: function getTileAccesibilityText() {
            var tileArray = this.arrTileViews,
                tileArrayLength = tileArray.length,
                index,
                accString = '', currentTile;

            //accString += '';
            for (index = 0; index < tileArrayLength; index++) {
                currentTile = tileArray[index];
                accString += currentTile.getTileAccesibilityText();
            }
            accString += '';
            return accString;
        },

        startAcc: function startaAcc() {
            if (!this.isAccessible()) {
                return;
            }
            if (this.equationManager.tileSelected) {
                this.spacePressed(this);
            }
            else {
                var ele = this.$('.equation-view-component'),
                    elPosition = ele.position(),
                    elHeight = ele.height(),
                    elWidth = ele.width(),
                    accDiv = $('<div class="acc-eq"></div>'),
                    offsetObj = this.equationManager.getLeftOffsetEquationView(),
                    leftOffset = offsetObj.left,
                    widthOffset = offsetObj.width;
                this.removeAccDiv();

                accDiv.css({ position: 'absolute', top: elPosition.top - 3, left: elPosition.left + leftOffset, width: elWidth - widthOffset, height: elHeight, outline: '2px dotted #aaa', 'font-size': 0, 'pointer-events': 'none' });
                if(this.equationManager._tutorialMode) {
                    accDiv.text(this.getAccString() + this.customTutorialString);
                }
                else {
                    accDiv.text(this.getAccString() + this.getMessage('base-exp-pair', 26));
                }
                this.equationManager.getContainerToAppend().append(accDiv);
                this.equationManager.setCurrentAccView(this);
                this.accDiv = accDiv;
                accDiv.attr('tabindex', -1);
                accDiv[0].focus();
            }
        },

        buildStartAcc: function buildStartAcc() {
            var ele = this.$('.equation-view-component'),
                elPosition = ele.position(),
                elHeight = ele.height(),
                elWidth = ele.width(),
                accDiv = $('<div class="acc-eq"></div>');
            this.removeAccDiv();

            accDiv.css({ position: 'absolute', top: elPosition.top, left: elPosition.left, width: elWidth, height: elHeight, outline: '2px dotted #aaa', 'font-size': 0, 'pointer-events': 'none' });
            if (this.equationManager.selectedTile !== null) {
                accDiv.text(this.getAccMessage('base-exp-pair', 13));
            }
            else {
                if(this.equationManager._tutorialMode) {
                    accDiv.text(this.tileDroppedString + this.getAccString() + this.customTutorialString);
                }
                else {
                    accDiv.text(this.tileDroppedString + this.getAccString() + this.getMessage('base-exp-pair', 5));
                }
                this.tileDroppedString = '';
            }
            this.equationManager.getContainerToAppend().append(accDiv);
            this.equationManager.setCurrentAccView(this);
            this.accDiv = accDiv;
            accDiv.attr('tabindex', -1);
            accDiv[0].focus();
        },

        continueAcc: function continueAcc(index) {
            if (index === this) {
                this.removeAccDiv();
                this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.SOLVE_TAB);
            }
            else {
                var element = index;
                element.continueAcc(index);
            }
        },

        buildContinueAcc: function buildContinueAcc(index) {
            if (index === this) {
                if(this.equationManager.selectedTile) {
                    return;
                }
                this.removeAccDiv();
                this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.BUILD_TAB);
            }
            else {
                var element = index;
                element.buildContinueAcc(index);
            }

        },

        getContainerToAppend: function getContainerToAppend() {
            return this.$('.equation-view-component');
        },

        startAccOnNextTile: function startAccOnNextTile() {
            var equationManager = this.equationManager;
            this.removeAccDiv();

            if (equationManager.isMarqueeSelectedForOp) {
                if (this.arrTileViews.length === equationManager.marqueeSelectedItems.length) {
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

        goPreviousAcc: function goPreviousAcc(index) {
            if (index) {
                if (index === this) {
                    this.removeAccDiv();
                    this.equationManager.setCurrentAccView(null);
                    this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.SOLVE_SHIFT_TAB);
                }
                else {
                    var element = index;
                    element.goPreviousAcc(index);
                }
            }
            else {
                this.removeAccDiv();
                this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.SOLVE_SHIFT_TAB);
            }
        },

        buildGoPreviousAcc: function buildGoPreviousAcc(index) {
            if (index) {
                if (index === this) {
                    if(this.equationManager.selectedTile) {
                        return;
                    }
                    this.removeAccDiv();
                    this.equationManager.setCurrentAccView(null);
                    this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.BUILD_SHIFT_TAB);
                }
                else {
                    var element = index;
                    element.buildGoPreviousAcc(index);
                }
            }
            else {

                this.removeAccDiv();
                this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.BUILD_SHIFT_TAB);
            }
        },

        spacePressed: function spacePressed(index) {
            if(index) {
                if (index === this) {
                    this.removeAccDiv();
                    this.arrTileViews[0].startAcc(true);
                }
                else {
                    index.spacePressed();
                }
            }
        },

        buildSpacePressed: function buildSpacePressed(index) {
            if(index) {
                if (this.equationManager.selectedTile === null) {
                    if (index === this) {
                        this.removeAccDiv();
                        this.arrTileViews[0].buildStartAcc();
                    }
                    else {
                        index.buildSpacePressed();
                    }
                }
                else {
                    //this._spaceToDropTile();
                    // Space handling to drop a tile inside eqn manager from bin tiles
                    index.spaceToDropTile();

                }
            }
        },

        tutorialBuildSpacePressed: function tutorialBuildSpacePressed(index, sourceObj) {
            if (this.equationManager.selectedTile) {
                index.removeAccDiv();
                index.spaceToDropTile();
            }
            else {
                if (index === this && sourceObj.isBin === false && sourceObj.sourceView) {
                    index.removeAccDiv();
                    sourceObj.sourceView.startAcc();
                }
            }
        },

        tutorialSpacePressed: function tutorialSpacePressed(index, sourceData, destData) {
            var TYPE = modelClassNamespace.TileItem.BinTileType;
            if (index === this) {
                if (sourceData.sourceView.model.get('type') === TYPE.MARQUEE) {
                    this.removeAccDiv();
                    var cover = sourceData.sourceView.$el.find('.selected-elements-cover');
                    cover.text(this.equationManager.tutorialCustomTileString);
                    sourceData.sourceView.focusAcc();
                }
                else {
                    var result = sourceData.sourceView.startAcc();
                    if(result !== false) {
                        this.removeAccDiv();
                    }
                }
            }
            else {
                if (this.equationManager.tileSelected) {
                    destData.sourceView.tutorialSpacePressed(true);
                }
                else {
                    if (sourceData.operation === 9) { //TODO: replace with static string
                        this.equationManager.tutorialCustomTileString = "";
                        sourceData.sourceView.tutorialSpacePressed(false);
                        destData.sourceView.startAcc();
                    }
                    else {
                        sourceData.sourceView.tutorialSpacePressed(-1);
                    }
                }
            }
        },


        spaceToDropTile: function spaceToDropTile(isContextMenu) {
            var arrTileViewsLen = this.arrTileViews.length,
                arrTiles = this.arrTileViews,
                //index = '0', //index of equation view
                data, j = 0, tileObj = null,
                selectedTile = this.equationManager.selectedTile,
                tileData = selectedTile.data(),
                tileType = tileData.tiletype,
                tileValue = tileData.tilevalue,
                itemToReplace, parIndex,
                tileObjects = [], commandExecuted = false, isSuccess;

            data = {
                index: (arrTileViewsLen - 1) + '',
                isDestDeno: false,
                isLeft: false,
                sourceTile: selectedTile,
                strOperator: '*'
            };


            for (; j < arrTileViewsLen; j++) {
                tileObj = arrTiles[j].getTileItemIndex(tileType);
                if (tileObj.emptyTile !== null) {
                    itemToReplace = this.equationManager.equationView.getViewFromIndex(tileObj.tileIndex);
                    tileObj.itemToReplace = itemToReplace;
                    tileObjects.push(tileObj);
                    //break;
                }
            }

            for (j = 0; j < tileObjects.length; j++) {
                if ((tileObjects[j].emptyTile === tileType || tileObjects[j].emptyTile === 'BASE_EXPONENT') && tileType !== 'PARENTHESIS') {
                    data.destTile = tileObjects[j].itemToReplace;
                    isSuccess = this.equationManager.onReplaceTile(data);
                    //if (isSuccess) {
                    //    this.setFocus('droppable-region');
                    //}
                    if (!isContextMenu) {
                        this.removeAccDiv();
                    }
                    commandExecuted = true;
                    break;
                }

            }
            if (commandExecuted === false) {
                if (tileType === 'PARENTHESIS') {
                    for (j = 0; j < arrTileViewsLen; j++) {
                        if (this._isParenthesisPresent(j)) {
                            continue;
                        }
                        else {
                            data.index = j + ''; // parenthesis will add on 1st index of num or den
                            break;
                        }
                    }
                    if (j === arrTileViewsLen) {
                        this.equationManager.trigger(viewClassNamespace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
                        if (!isContextMenu) {
                            this.removeAccDiv();
                        }
                        //this.setFocus('droppable-region');//set focus to feedback
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

        shiftTabHandler: function shiftTabHandler() {
            if (this.equationManager.tileSelected) {
                this.arrTileViews[this.arrTileViews.length - 1].shiftTabHandler(false);
            }
            else {
                this.startAcc();
            }
        },

        buildShiftTabHandler: function buildShiftTabHandler() {
            this.buildStartAcc();
        },

        removeAccDiv: function removeAccDiv() {
            if (this.accDiv) {
                this.accDiv.remove();
            }
        },
        startExpToggle: function () {
            return false;
        },

        getAccString: function getAccString(whichTab) {
            var currentString = '',
                index;

            for (index = 0; index < this.arrTileViews.length; index++) {
                currentString += this.arrTileViews[index].getAccString();
            }
            if(whichTab === viewClassNamespace.EquationManager.DATA) {
                return this.getMessage('base-exp-pair', 25) + ' ' + currentString.trim() + '.';
            }
            return this.getMessage('base-exp-pair', 6) + ' ' + currentString.trim() + '.';
        },

        /**
         * Checks if present as parent
         * @method isPresentAsParent
         * @public
         *
         * @returns {Boolean} false to indicate that its equation view (expression) as parent and not fraction
         */
        isPresentAsParent: function isPresentAsParent () {
            return false;
        }
    });

})();
