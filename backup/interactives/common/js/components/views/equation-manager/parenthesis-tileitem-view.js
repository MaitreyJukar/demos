(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point,
        scroll = viewClassNamespace.TileView.scroll;

    /**
    * ParenthesisTileView holds the data for the PARENTHESIS type TileView.
    *
    * @class ParenthesisTileView
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewClassNamespace.ParenthesisTileView = viewClassNamespace.TileView.extend({

        $coefficient: null,
        $leftBracket: null,
        $rightBracket: null,
        _iTreeHeight: null,
        parenthesisExponentId: null,

        _touchStartHandler: null,
        _touchMoveHandler: null,
        _touchEndHandler: null,
        _lastTap: null,

        setTreeHeight: function (iTreeHeight) {
            if (this._iTreeHeight !== iTreeHeight) {
                var preTreeHeight = this._iTreeHeight;
                this._iTreeHeight = iTreeHeight;
                this.onTreeHeightChange(preTreeHeight);
            }
        },

        initialize: function () {
            this.arrTileViews = [];
            this.$arrOperatorViews = [];
            this.setTreeHeight(1);
            viewClassNamespace.BaseExpTileView.__super__.initialize.apply(this, arguments);
            this.listenEvents();
        },

        render: function () {
            var arrTiles = this.model.get('tileArray'),
                i = 0;

            for (i = 0; i < arrTiles.length; i++) {
                this.arrTileViews[i] = viewClassNamespace.TileView.createTileItemView(arrTiles.at(i), this, this.equationManager, this.player, this.filePath, this.manager, this.idPrefix);
            }
        },

        events: {
            'mouseenter .parenthesis.exponent': 'addHoverClassExponent',
            'mouseleave .parenthesis.exponent': 'removeHoverClassExponent',
            'mouseenter .coefficient': 'addHoverClassCoefficient',
            'mouseleave .coefficient': 'removeHoverClassCoefficient'
        },

        createView: function () {
            var classes = viewClassNamespace.TileView.CLASSES, $accBase, $accExponent, $exponentValue, $coefficientValue, $accCoefficient,
                exponentValue = this.model.get('exponent'),
                exponentStr = this.getValueText('exponent'),
                coefficientValue = this.model.get('coefficient'),
                coefficientStr = this.getValueText('coefficient'),
                i = 0, $child, level = this.getLevel(), levelClass = classes.Level,
                binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                index;
            index = this.equationManager.equationView.model.getIndexFromItem(this.model);


            //$accTerm = $('<div></div>').addClass('acc-div ' + 'acc-read-elem math-utilities-manager-access').appendTo(this.$el);

            if (coefficientValue && coefficientValue < 0) {
                this.$coefficient = $('<div></div>').addClass(classes.COEFFICIENT + ' ' + classes.PARENTHESIS + ' ' + levelClass + this.getLevel());

                $coefficientValue = $('<div></div>').addClass('coefficient-value').html(coefficientStr).appendTo(this.$coefficient);
                this.$coefficient.append(this.createBoxTileView());
                $accCoefficient = $('<div></div>').addClass('acc-div ' + 'acc-read-elem math-utilities-manager-access').appendTo(this.$coefficient);
            }

            this.$leftBracket = $('<div></div>').addClass(classes.Bracket + ' ' + classes.LeftBracket + ' ' + levelClass + level);
            this.$rightBracket = $('<div></div>').addClass(classes.Bracket + ' ' + classes.RightBracket + ' ' + levelClass + level);
            this.$base = $('<div></div>').addClass(classes.BASE + ' ' + classes.PARENTHESIS + ' ' + levelClass + this.getLevel());
            $accBase = $('<div></div>').addClass('acc-div ' + 'acc-read-elem math-utilities-manager-access').appendTo(this.$base);

            this.$exponent = $('<div></div>').addClass(classes.EXPONENT + ' ' + levelClass + level + ' ' + classes.PARENTHESIS).attr({ 'data-tiletype': binTileTypes.EXPONENT });

            if (this.equationManager.model.get('mode') === modelClassNameSpace.EquationManager.MODES.SolveMode) {
                var expId = parseInt(this.equationManager.getExponentId());

                if (this.model.get('type') === modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS) {
                    this.equationManager.parenthesisAdded(this, 0, true);
                    expId = 0;
                }
                else {
                    this.equationManager.parenthesisAdded(this, expId);
                }
                this.$exponent.attr('id', this.equationManager.getIdPrefix() + 'exponent-' + expId);
                this.parenthesisExponentId = expId;
            }
            $exponentValue = $('<div></div>').addClass('exponent-value').appendTo(this.$exponent);
            if (exponentValue !== null && exponentValue !== undefined) {
                $exponentValue.html(exponentStr);
            }
            else {
                this.$exponent.addClass('empty');
            }

            if (exponentValue === 0) {
                if(this.equationManager.isZeroGlowAllowed()) {
                    this.$exponent.addClass('zero-glow');
                }
            }

            this.$exponent.append(this.createBoxTileView());
            $accExponent = $('<div></div>').addClass('acc-div ' + 'acc-read-elem math-utilities-manager-access').html(exponentValue).appendTo(this.$exponent);
            if (exponentValue === null || exponentValue === undefined || exponentValue === '') {
                this.$exponent.addClass('empty');
            }

            if (coefficientValue && coefficientValue < 0) {
                this.$base.append(this.$coefficient);
            }
            this.$base.append(this.$leftBracket);

            for (i = 0; i < this.arrTileViews.length; i++) {
                $child = this.arrTileViews[i].createView();
                this.$base.append($child);
            }

            this.$el.append(this.$base);
            this.$el.append(this.$exponent);
            this.$base.append(this.$rightBracket);
            this.$el.addClass(classes.TermContainer + ' ' + levelClass + level + ' ' + classes.PARENTHESIS).attr('data-tiletype', binTileTypes.PARENTHESIS);

            this.createOperatorView();
            this.refreshTreeHeight();
            return this.$el;
        },


        createBoxTileView: function () {
            return $('<div class="box"> \
<div class="inside-divs"></div> \
<div class="inside-divs"></div> \
<div class="inside-divs"></div> \
<div class="inside-divs"></div> \
<div class="inside-divs"></div> \
<div class="inside-divs"></div> \
</div>');
        },

        createOperatorView: function () {
            var i = 0, $operatorChild, operator, tileView,
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

        invertExponentText: function invertExponentText(bOriginal) {
            var exponentConatiner = this.$exponent.find('.exponent-value');
            if (this.model.get('exponent') === 0) {
                return;
            }
            if (bOriginal) {
                exponentConatiner.html(this.getValueText('exponent'));
            }
            else {
                exponentConatiner.html(this.invertText(exponentConatiner.text()));
            }
        },
        isEmpty: function () {
            return false;
        },

        createHelper: function createHelper() {
            var $helper = $('<div></div>').addClass('parentheses-drag-helper'),
                $helperValue = $('<div></div>').addClass('parentheses-drag-helper-value').appendTo($helper),
                $boxContainer = $('<div></div>').css({ 'display': 'block' }).appendTo($helper),
                $box = this.createBoxTileView().appendTo($boxContainer);
            return $helper;
        },

        getDraggbleHelper: function () {
            var binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                coefficientValue = this.model.get('coefficient'),
                $helper = this.createHelper(),
                $helperValue = $helper.find('.parentheses-drag-helper-value');

            if (coefficientValue && coefficientValue < 0) {
                $helperValue.html('&minus;( )');
            }
            else {
                $helperValue.html('( )');
            }

            $helper.attr({ 'data-tiletype': binTileTypes.PARENTHESIS, 'data-tilevalue': coefficientValue });
            $helper.css({ 'cursor': "url('" + this.getImagePath('closed-hand') + "'), move" });
            return $helper;
        },

        showHideContentAfterDrag: function (bShow) {
            if (bShow) {
                if (this.$coefficient) {
                    this.$coefficient.css('visibility', '');
                }
                this.$leftBracket.css('visibility', '');
                this.$rightBracket.css('visibility', '');
                this.$exponent.css('visibility', '');
            }
            else {
                if (this.$coefficient) {
                    this.$coefficient.css('visibility', 'hidden');
                }
                this.$leftBracket.css('visibility', 'hidden');
                this.$rightBracket.css('visibility', 'hidden');
                this.$exponent.css('visibility', 'hidden');
            }
        },

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

        refreshCursorAt: function () {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                self = this;

            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                window.setTimeout(function () {
                    if (self.$el.is('.ui-draggable')) {
                        self.$el.draggable('option', 'cursorAt', { left: self.$el.width() / 2, top: self.$el.height() / 2 });
                    }
                }, 0);
            }
        },

        refresh: function () {
            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right');
                this.curHoveredTile = null;
            }
            viewClassNamespace.ParenthesisTileView.__super__.refresh.apply(this, arguments);
        },

        listenEvents: function () {
            this.listenTo(this.model.get('tileArray'), 'add', this.onAddTile);
            this.listenTo(this.model.get('tileArray'), 'remove', this.onRemoveTile);
            this.listenTo(this.model, 'change:exponent', this._onExponentChange);
            this.listenTo(this.model, 'change:operator', this._onOperatorChange);
        },

        onTreeHeightChange: function (preTreeHeight) {
            this.$el.removeClass('depth-' + preTreeHeight).addClass('depth-' + this._iTreeHeight);
        },

        _onOperatorChange: function (model, operator) {
            this.parent.changeOperatorArray(model, operator);
        },




        onAddTile: function (model, collection, options) {
            var operator, $operatorChild,
                index = (options.at !== null && options.at !== undefined) ? options.at : collection.length - 1,
                arrTiles = this.model.get('tileArray'),
                tileView = viewClassNamespace.TileView.createTileItemView(model, this, this.equationManager, this.player, this.filePath, this.manager, this.idPrefix),
                $tileViewElm = tileView.createView(),
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                isAnimating = model.get('isAnimate');

            if (this.equationManager.restrictFirstTileAnimation === false) {
                if (isAnimating) {
                    $tileViewElm.css({ 'visibility': 'hidden' }).addClass('animated-tiles');
                }
            }

            if (index === 0) {
                $tileViewElm.insertAfter(this.$leftBracket);
            }
            else {
                $tileViewElm.insertAfter(this.arrTileViews[index - 1].$el);
            }
            if (this.equationManager.restrictFirstTileAnimation === true) {
                this.equationManager.firstTile = $tileViewElm;
            }
            $operatorChild = this.createOperator(tileView.model.get('operator'));
            if ($operatorChild !== null) {
                if (isAnimating === true) {
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
            this.refreshCursorAt();
            this.refreshTreeHeight();
            //if (equationManagerMode === equationManagerModeTypes.SolveMode) {
            //    this.equationManager.parenthesisAdded(this);
            //}
        },

        onRemoveTile: function (model, collection, options) {
            var index = options.index,
                tileView = this.arrTileViews[index],
                operatorView,
                operator = tileView.model.get('operator'),
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES;

            if (this.$arrOperatorViews[index] !== null) {
                operatorView = this.$arrOperatorViews[index];
            }
            this.$arrOperatorViews.splice(index, 1);

            //tileView.model.off(null, null, tileView);
            tileView.stopListeningEvents(true);

            setTimeout(function () {
                if (operatorView) {
                    operatorView.remove();
                }
                tileView.$el.remove();
                //tileView.off();
            }, 0);

            this.arrTileViews.splice(index, 1);
            this.refreshCursorAt();
            this.refreshTreeHeight();
            //if (equationManagerMode === equationManagerModeTypes.SolveMode) {
            //    this.equationManager.parenthesisRemoved(parseInt(this.$exponent.attr('id').replace(this.equationManager.getIdPrefix() + 'exponent-', '')));
            //}
        },

        attachEvents: function () {
            var i = 0, self = this,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                tileTypes = modelClassNameSpace.BaseExpTile.TILE_TYPES,
                exponentConatiner,
                sizeParenthesis = this.equationManager.getBuildModeParenthesisSize();

            this.$exponent.off('click').on('click', $.proxy(this._onExponentClick, this));
            //if (equationManagerMode === equationManagerModeTypes.SolveMode) {
            //    this.$exponent.off('mousedown').on('mousedown', $.proxy(this._onExponentMouseDown, this));
            //    this.$exponent.off('mouseup').on('mouseup', $.proxy(this._onExponentMouseUp, this));
            //}

            if ($.support.touch) {
                if (this.equationManager.isTouch()) {
                    delete this.events['mouseenter .parenthesis.exponent'];
                    delete this.events['mouseleave .parenthesis.exponent'];
                    delete this.events['mouseenter .coefficient'];
                    delete this.events['mouseleave .coefficient'];
                    this.delegateEvents(this.events);
                }

                MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$exponent, 600, this.addHoverClassExponent, this.removeHoverClassExponent, 'exponent-hold');
                if (this.$coefficient) {
                    MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$coefficient, 600, this.addHoverClassCoefficient, this.removeHoverClassCoefficient, 'coefficient-hold');
                }
                this._touchStartHandler = $.proxy(this._onTouchStart, this);
                this._touchEndHandler = $.proxy(this._onTouchEnd, this);
                this._touchMoveHandler = $.proxy(this._onTouchMove, this);
                this.el.addEventListener('touchstart', this._touchStartHandler, false);

                this.$el.off('mousedown').on('mousedown', function (evt) {
                    return self.onMouseDown(evt);
                });

                this.$el.off('mouseup').on('mouseup', function (evt) {
                    return self.onMouseUp(evt);
                });

                //this.$el.off('touchstart').on('touchstart', function (evt) {
                //    var result = self.onMouseDown(evt);
                //    return result;
                //});

                //this.$el.off('touchend').on('touchend', function (evt) {
                //    self.onMouseUp(evt);
                //});
            }
            else {
                this.$el.off('mousedown').on('mousedown', function (evt) {
                    return self.onMouseDown(evt);

                });

                this.$el.off('mouseup').on('mouseup', function (evt) {
                    return self.onMouseUp(evt);
                });
            }

            this.applyHandCursorToElem(this.$exponent);
            this.applyHandCursorToElem(this.$leftBracket);
            this.applyHandCursorToElem(this.$rightBracket);
            if (this.$coefficient) { this.applyHandCursorToElem(this.$coefficient); }

            for (i = 0; i < this.arrTileViews.length; i++) {
                this.arrTileViews[i].attachEvents();
            }

            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                this.attachEventsOnExponent();
            }

            // Attach drag events on tile
            this.attachEventsOnTile();

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
            //if (equationManagerMode === equationManagerModeTypes.SolveMode) {
            //    var index = this.parent.getIndex(this);
            //    this.equationManager.createTooltip(parseInt(this.$exponent.attr('id').replace(this.equationManager.getIdPrefix() + 'exponent-', '')), this);

            //}
            //$.fn.EnableTouch(this.$el);
        },

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
            var self = this,
                isDraggable = this.$el.is('.ui-draggable'),
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                sizeParenthesis = this.equationManager.getBuildModeParenthesisSize(),
                EVENTS = viewClassNamespace.EquationManager.EVENTS;

            if (!isDraggable) {
                this.$el.draggable({
                    scroll: scroll.ENABLE,
                    scrollSensitivity: scroll.SENSITIVITY,
                    scrollSpeed: scroll.SPEED,
                    distance: 10,
                    zIndex: 1,
                    containment: this.equationManager.$draggableContainment,
                    cursorAt: equationManagerMode === equationManagerModeTypes.SolveMode ? { left: this.$el.width() / 2, top: this.$el.height() / 2 } : { left: sizeParenthesis.width / 2, top: sizeParenthesis.height / 2 },
                    helper: function () {
                        if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                            return self.$el;
                        }
                        else {
                            return self.getDraggbleHelper();
                        }
                    },
                    revert: function (event) {
                        if (this.data('isDropped') === true) {
                            return false;
                        }
                        else {
                            var evt = event.originalEvent ? event.originalEvent : event,
                                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                                bRemove = self.equationManager.isTileRemovable(self, ptMouse);
                            if (bRemove) {
                                return false;
                            }
                            else {
                                //self.equationManager.showHideOverlayDiv(true);
                                self.equationManager.trigger(EVENTS.REVERT_START);
                                return true;
                            }
                        }
                    },
                    start: function (event, ui) {
                        self.equationManager.equationView.attachDetachDraggable(self.cid, true);
                        self.isDragging = true;

                        if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                            ui.helper.data('prevLocationData', null);
                            $(this).addClass('current-draggable');
                        }
                        else {
                            self.showHideContentAfterDrag(false);
                        }
                        self.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.TILE_DRAGGING_START);
                        self.$exponent.css({ 'top': '', 'box-shadow': '' });
                        ui.helper.data({ 'cur-draggable': self });
                        //self.equationManager.hideMarquee();
                    },
                    drag: function (event, ui) {
                        var droppable = $(this).data('cur-droppable'),
                            evt = event.originalEvent ? event.originalEvent : event,
                            ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                        //self.equationManager.isTileRemovable(ui.helper, ptMouse);
                        if (droppable) {
                            droppable.onMouseOver(event, ui);
                        }
                    },
                    stop: function (event, ui) {
                        self.equationManager.equationView.attachDetachDraggable(self.cid, false);
                        setTimeout(function () {
                            self.isDragging = false;
                        }, 10);
                        self._onDraggingStop(event, ui, $(this));
                        //self.equationManager.showHideOverlayDiv(false);
                        self.equationManager.refresh();
                        self.equationManager.trigger(EVENTS.REVERT_END);
                        self.equationManager.setIsDropped(false);
                    }
                });
            }
            else {
                this.$el.draggable('enable');
            }
        },

        /**
        * Detach all events on view
        *
        * @method _detachEvents
        * @private
        */
        _detachEvents: function () {
            this.$exponent.off('click');
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

        attachEventsOnExponent: function () {
            var self = this,
                isDraggable = this.$exponent.is('.ui-draggable'),
                ptMouse,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                EVENTS = viewClassNamespace.EquationManager.EVENTS,
                bRemove = false;
            if(this.equationManager.isParenthesisExponentDraggable()) {
                if (this.model.get('exponent') !== null) {
                    if (!isDraggable) {
                        this.$exponent.draggable({
                            scroll: scroll.ENABLE,
                            scrollSensitivity: scroll.SENSITIVITY,
                            scrollSpeed: scroll.SPEED,
                            helper: 'clone',
                            cursorAt: { left: this.$exponent.width() / 2, top: this.$exponent.height() / 2 },
                            containment: this.equationManager.$draggableContainment,
                            revert: function (event) {
                                if (this.data('isDropped') === true) {
                                    return false;
                                }
                                else {
                                    bRemove = self.equationManager.isTileRemovable(self, ptMouse);
                                    if (bRemove) {
                                        return false;
                                    }
                                    else {
                                        //self.equationManager.showHideOverlayDiv(true);
                                        self.equationManager.trigger(EVENTS.REVERT_START);
                                        return true;
                                    }
                                }
                            },
                            start: function (event, ui) {
                                //$(this).addClass('current-draggable');
                                self.equationManager.equationView.attachDetachDraggable(self.cid, true);
                                bRemove = false;
                                var evt = event.originalEvent ? event.originalEvent : event;
                                self.isDragging = true;
                                ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                                ui.helper.data({ 'cur-draggable': self }).css({ 'z-index': '3' });
                                self.$exponent.addClass('empty');
                                if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                                    self.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.TILE_DRAGGING_START);
                                }
                            },
                            drag: function (event, ui) {
                                var droppable = $(this).data('cur-droppable'),
                                    evt = event.originalEvent ? event.originalEvent : event;
                                ptMouse.setPoint({ left: evt.clientX, top: evt.clientY });
                                //self.equationManager.isTileRemovable(ui.helper, ptMouse);
                                if (droppable) {
                                    droppable.onMouseOver(event, ui);
                                }
                            },
                            stop: function (event, ui) {
                                self.equationManager.equationView.attachDetachDraggable(self.cid, false);
                                //setTimeout(function () {
                                self.isDragging = false;
                                //}, 10);
                                ui.helper.data('cur-draggable', self).css({ 'z-index': 'auto' });
                                //$(this).removeClass('current-draggable');
                                if (!$(this).data('isDropped')) {
                                    self.$exponent.removeClass('empty').find('.exponent-value').html(self.getValueText('exponent'));
                                    var evt = event.originalEvent ? event.originalEvent : event,
                                        data;
                                    ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                                    //bRemove = self.equationManager.isTileRemovable(self, ptMouse);
                                    if (bRemove) {
                                        data = { sourceTile: self, tiletype: modelClassNameSpace.TileItem.BinTileType.EXPONENT, numOfTiles: 1 }
                                        self.equationManager.onDeleteTile(data);
                                    }
                                }
                                $(this).removeData('isDropped');
                                //self.equationManager.showHideOverlayDiv(false);
                                self.equationManager.trigger(EVENTS.REVERT_END);
                                self.equationManager.refresh();
                                self.equationManager.setIsDropped(false);
                                bRemove = false;
                            }
                        });
                    }
                    else {
                        this.$exponent.draggable('enable');
                    }
                }
                else {
                    if (isDraggable) {
                        this.$exponent.draggable('disable');
                    }
                }
            }


            //$.fn.EnableTouch(this.$exponent);
        },

        /**
        * Detach event on exponent
        *
        * @method _detachEventOnExponent
        * @private
        */
        _detachEventOnExponent: function () {
            if (this.$exponent.is('.ui-draggable')) {
                this.$exponent.draggable('destroy');
            }
            this.$exponent.addClass('no-hover');
        },


        _onDraggingStop: function (event, ui, draggable) {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                draggableData = draggable.data(),
                isDropped = draggableData.isDropped;

            ui.helper.removeData('cur-draggable');
            draggable.removeClass('current-draggable');
            draggable.removeData('isDropped');
            //this.equationManager.showMarquee();
            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                ui.helper.removeData('prevLocationData');
                if (!draggableData['isDropped']) {
                    this.invertExponentText(true);
                }
            }
            if (!isDropped) {
                var evt = event.originalEvent ? event.originalEvent : event,
                    ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                    bRemove = this.equationManager.isTileRemovable(this, ptMouse);
                if (bRemove) {
                    var data = { sourceTile: this, tiletype: modelClassNameSpace.TileItem.BinTileType.PARENTHESIS, numOfTiles: 1 }
                    this.equationManager.onDeleteTile(data);
                }
                else {
                    this.showHideContentAfterDrag(true);
                }
            }
            this.equationManager.resetContainment();
        },

        onMouseDown: function onMouseDown(evt) {
            var domEvent = evt.originalEvent ? evt.originalEvent : evt,
                event = domEvent,
                rect = null, ptMouse,
                rectLeftBracket = new Rect(this.$leftBracket[0].getBoundingClientRect()),
                rectRightBracket = new Rect(this.$rightBracket[0].getBoundingClientRect()),
                rectExponent = new Rect(this.$exponent[0].getBoundingClientRect()),
                rectCoefficient, isExponentClicked,
                tileViews = this.arrTileViews || null,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                sizeParenthesis = this.equationManager.getBuildModeParenthesisSize(),
                //isDraggable = this.$el.is('.ui-draggable'),
                //isExponentDraggable = this.$exponent.is('.ui-draggable'),
                i = 0;

            event = (event.type === 'touchstart') ? event.touches[0] : event;
            ptMouse = new Point({ left: event.clientX, top: event.clientY });
            isExponentClicked = rectExponent.isPointInRect(ptMouse);
            if (this.$coefficient) {
                rectCoefficient = new Rect(this.$coefficient[0].getBoundingClientRect());
            }

            //isDraggable && this.$el.draggable('disable');
            //isExponentDraggable && this.$exponent.draggable('disable');
            if (isExponentClicked || rectLeftBracket.isPointInRect(ptMouse) || rectRightBracket.isPointInRect(ptMouse) || (rectCoefficient && rectCoefficient.isPointInRect(ptMouse))) {
                domEvent.stopPropagation && domEvent.stopPropagation();
                domEvent.preventDefault && domEvent.preventDefault();
                //this.equationManager.hideMarquee();
                this.equationManager.removeMarquee();
                if (isExponentClicked) {
                    if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                        this.equationManager.adjustContainment(this.$exponent);
                        this.attachEventsOnExponent();
                    }
                    else {
                        this.equationManager.adjustContainment(this.$el);
                        this.attachEventsOnTile();
                    }
                }
                else {
                    this.attachEventsOnTile();
                    if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                        this.equationManager.adjustContainment(new Rect({ left: 0, top: 0, width: sizeParenthesis.width, height: sizeParenthesis.height }));
                    }
                    else {
                        this.equationManager.adjustContainment(this.$el);
                    }
                }
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

        onMouseUp: function onMouseUp(event) {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES;
            this.$el.draggable('enable');
            //this.equationManager.showMarquee();
            this.equationManager.resetContainment();
        },


        onMouseOver: function (event, ui) {
            var tileViews = this.arrTileViews, i = 0,
                mulThresold = modelClassNameSpace.TileItem.MultiplicationThresold,
                addThresold = modelClassNameSpace.TileItem.AdditionThresold,
                evt = event.originalEvent ? event.originalEvent : event,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                rect = null,
                hoveredTile = null,
                isSourceDen = false,
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                draggedTileType = draggedTileData['tiletype'],
                binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                child;

            this.equationManager.registerMouseOverTile(this, event, ui);

            if (equationManagerMode === equationManagerModeTypes.SolveMode) {

                isSourceDen = draggedTile.model.get('bDenominator');
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
                    else { }
                    this.curHoveredTile = hoveredTile;
                }
            }
            else if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                var isTileFromBin = false,
                    rectExponent = new Rect(this.$exponent[0].getBoundingClientRect()),
                    rectLeftBracket,
                    rectRightBracket;
                if (!draggedTile) {
                    isTileFromBin = true;
                }

                if (this.curHoveredTile) {
                    this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
                }
                this.$exponent.removeClass('hover-border');

                if (draggedTileType === binTileTypes.PARENTHESIS) {
                    return;
                }
                else if (draggedTileType === binTileTypes.EXPONENT &&
                         rectExponent.isPointInRect(ptMouse)) {
                    this.$exponent.addClass('hover-border');
                    this.curHoveredTile = null;
                    return;
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
                        rectLeftBracket = new Rect(this.$leftBracket[0].getBoundingClientRect());
                        rectRightBracket = new Rect(this.$rightBracket[0].getBoundingClientRect());
                        if (firstTile !== draggedTile && !firstTile.isEmpty() && ptMouse.getLeft() < firstTileRect.getLeft() && ptMouse.getLeft() > rectLeftBracket.getRight()) {
                            firstTile.$el.removeClass('white-border-right white-border').addClass('white-border-left ');
                            hoveredTile = firstTile;
                        }
                        else if (lastTile !== draggedTile && !lastTile.isEmpty() && ptMouse.getLeft() > lastTileRect.getRight() && ptMouse.getLeft() < rectRightBracket.getLeft()) {
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
            this.$exponent.removeClass('hover-border');
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
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData.tiletype,
                length = ui.helper.data('length'),
                sourceIndex /*= draggedTile.parent.getIndex(draggedTile)*/,
                isSourceDeno /*= draggedTile.model.get('bDenominator')*/,
                isDestDeno = this.model.get('bDenominator'),
                countTiles = 1,
                child,
                binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                data,
                bCommandResponse = false,
                commandExitCodes = modelClassNameSpace.CommandFactory.EXIT_CODE;

            //// don't do anything if user meant to drop on the marquee
            //if (this.equationManager.isPointInMarquee(ptMouse)) { return false; }

            this.$el.removeClass('white-border-left white-border-right white-border');
            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
                this.curHoveredTile = null;
            }

            if (length) {
                countTiles = length;
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
            else {
                var isTileFromBin = false,
                    rectExponent = new Rect(this.$exponent[0].getBoundingClientRect()),
                    rectLeftBracket,
                    rectRightBracket;
                this.$exponent.removeClass('hover-border');

                if (!draggedTile) {
                    isTileFromBin = true;
                }
                for (i = 0; i < tileViews.length; i++) {
                    child = tileViews[i];
                    rect = new Rect(child.el.getBoundingClientRect());
                    rect = rect.inflateRect(mulThresold, 0);
                    if (rect.isPointInRect(ptMouse)) {
                        if (child === draggedTile) {
                            droppedTile = null;
                            break;
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
                        if (draggedTileType === binTileTypes.EXPONENT && rectExponent.isPointInRect(ptMouse)) {
                            if (isTileFromBin) {
                                data = { sourceTile: ui.helper, destTile: this };
                                bCommandResponse = this.equationManager.onReplaceTile(data);
                                if (bCommandResponse === commandExitCodes.SUCCESS ||
                                    bCommandResponse === commandExitCodes.NO_OPERATION) {
                                    ui.draggable.data('isDropped', true);
                                }
                            }
                            else if (draggedTile !== this) {
                                data = { sourceTile: draggedTile, destTile: this, type: draggedTileType };
                                bCommandResponse = this.equationManager.onSwapTile(data);
                                if (bCommandResponse === commandExitCodes.SUCCESS ||
                                    bCommandResponse === commandExitCodes.NO_OPERATION) {
                                    ui.draggable.data('isDropped', true);
                                }
                            }
                            return;
                        }
                        else {
                            var firstTile = tileViews[0],
                                firstTileRect = new Rect(firstTile.el.getBoundingClientRect());
                            rectLeftBracket = new Rect(this.$leftBracket[0].getBoundingClientRect());
                            rectRightBracket = new Rect(this.$rightBracket[0].getBoundingClientRect());
                            if (!firstTile.isEmpty() && ptMouse.getLeft() < firstTileRect.getLeft() && ptMouse.getLeft() > rectLeftBracket.getRight()) {
                                droppedTile = firstTile;
                                isLeft = true;
                            }
                            else {
                                var lastTile = tileViews[tileViews.length - 1],
                                    lastTileRect = new Rect(lastTile.el.getBoundingClientRect());
                                if (!lastTile.isEmpty() && ptMouse.getLeft() > lastTileRect.getRight() && ptMouse.getLeft() < rectRightBracket.getLeft()) {
                                    droppedTile = lastTile;
                                    isLeft = false;
                                }
                            }
                        }
                        index = tileViews.indexOf(droppedTile);
                    }
                }
                if (isTileFromBin) {
                    if (droppedTile && !droppedTile.isEmpty()) {
                        if (draggedTileType === binTileTypes.BASE || draggedTileType === binTileTypes.EXPONENT) {
                            isDestDeno = droppedTile.model.get('bDenominator');
                            data = { sourceTile: ui.helper, index: this.parent.getIndex(this) + '.' + index.toString(), isDestDeno: isDestDeno, strOperator: strOperator, isLeft: isLeft };
                            bCommandResponse = this.equationManager.onAddTile(data);
                            if (bCommandResponse) {
                                ui.draggable.data('isDropped', true);
                            }
                        }
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

        _onExponentClick: function (event) {
            if (!this.isDragging) {
                var counter,
                    equationManagerMode = this.equationManager.model.get('mode'),
                    equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES;
                if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                    counter = this.$exponent.attr('id').replace(this.equationManager.getIdPrefix() + 'exponent-', '');
                }
                this.equationManager.onExponentClick(this, parseInt(counter), true);
            }
        },

        _onExponentMouseDown: function _onExponentMouseDown(event) {
            if (!this.isDragging) {
                this.$exponent.css({ 'top': 5, 'box-shadow': 'none' });

            }
        },
        _onExponentMouseUp: function _onExponentMouseUp(event) {
            this.$exponent.css({ 'top': '', 'box-shadow': '' });
        },

        /**
        * Handler called when EXPONENT in the model changes. This handler updates the view accordingly
        *
        * @method _onExponentChange
        * @private
        * @param {Object} Model that is changed
        * @param {Number} Updated exponent value
        */
        _onExponentChange: function _onExponentChange(model, exponent) {
            var exponentValueDiv = this.$exponent.find('.exponent-value'),
                exponentStr = this.getValueText('exponent');
            if (exponent === undefined || exponent === null || exponent === '') {
                this.$exponent.addClass('empty');
            }
            else {
                exponentValueDiv.html(exponentStr);
                this.$exponent.removeClass('empty');
            }

            if(this.equationManager.isZeroGlowAllowed()) {
                if (exponent === 0 && this.$exponent) {
                    this.$exponent.addClass('zero-glow');
                } else if (this.$exponent) {
                    this.$exponent.removeClass('zero-glow');
                }
            }

            if (this.equationManager.model.get('mode') === modelClassNameSpace.EquationManager.MODES.BuildMode) {
                this.attachEventsOnExponent();
            }
        },

        /**
        * Adds hover class to coefficient.
        * @method addHoverClassCoefficient
        * @param {Object} Event
        */
        addHoverClassCoefficient: function (event) {
            if (this.$coefficient && !this.$el.hasClass('no-hover')) {
                this.$coefficient.addClass('hover');
            }
        },

        /**
        * Removes hover class to coefficient.
        * @method removeHoverClassCoefficient
        * @param {Object} Event
        */
        removeHoverClassCoefficient: function (event) {
            if (this.$coefficient && !this.$el.hasClass('no-hover')) {
                this.$coefficient.removeClass('hover');
            }
        },

        /**
        * Pushes the elements inside the marquee div to the EquationManager
        * @method getElementsInsideMarquee
        * @param {Object} Event forwarded by marquee
        * @param {Object} Marquee view
        */
        getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee) {
            var i = 0,
                arrTileViews = this.arrTileViews;

            if (this.isParenthesisInMarquee($marquee)) {
                this.equationManager.pushElementToSelection(this.parent.getIndex(this), this);
            } else {
                for (i = 0; i < arrTileViews.length; i++) {
                    this.arrTileViews[i].getElementsInsideMarquee(event, $marquee);
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
            var tileRect = new Rect(this.$el.find('.base')[0].getBoundingClientRect()),
                coeffRect = null,
                marqueeRect = new Rect($marquee[0].getBoundingClientRect()),
                middleOfTile = tileRect.getMiddle(),
                threshold = 0.5;

            // Fix rect if coefficient is present since it's not considered for middle point
            // calculation.
            if (this.$coefficient) {
                coeffRect = new Rect(this.$el.find('.coefficient')[0].getBoundingClientRect());
                tileRect.set('left', tileRect.getLeft() + coeffRect.getWidth());
                tileRect.set('width', tileRect.getWidth() - coeffRect.getWidth());
                middleOfTile = tileRect.getMiddle();
            }

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

        /**
        * Checks if marqee selection has started outside the parenthesis.
        * @method marqueeStartedOutside
        * @param {Object} Marquee end event
        * @return {Boolean} True if marquee selection started outside the parentheses
        */
        marqueeStartedOutside: function (event) {
            var leftBracketRect = new Rect(this.$leftBracket[0].getBoundingClientRect()),
                rightBracketRect = new Rect(this.$rightBracket[0].getBoundingClientRect()),
                startX = event.marqueeStartX;

            return startX < leftBracketRect.getLeft() || startX > rightBracketRect.getRight();
        },

        /**
        * Checks whether a rect is inside another rect.
        * @method isRectInside
        * @param {Object} Outer rect.
        * @param {Object} Inner rect.
        * @return {Boolesn} True if inner rect is completely inside the outer rect. False otherwise
        */
        isRectInside: function (outerRect, innerRect) {
            return outerRect.getLeft() < innerRect.getLeft() &&
                outerRect.getRight() > innerRect.getRight() &&
                outerRect.getBottom() > innerRect.getBottom() &&
                outerRect.getTop() < innerRect.getTop();
        },

        /**
        * Applies hand cursor to the elem on mouseenter, mouseleave, mousedown & mouseup
        * @method applyHandCursorToElem
        * @private
        * @param {Objecy} The element to which hand cursor is to be applied
        */
        applyHandCursorToElem: function applyHandCursorToElem($elem) {

            if ($elem.hasClass('empty') && !$elem.hasClass('exponent')) { return; }

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
                if (self.isMarqueeDrawing()) { return false; }
                if ($(this).hasClass('current-draggable')) { return; }
                $elem.css(self._getOpenHandCss());
            });

            $elem.on(leave, function () {
                if (self.isMarqueeDrawing()) { return false; }
                if ($(this).hasClass('current-draggable')) { return; }
                $elem.css(self._getDefaultCursorCss());
            });
            $elem.on('mousedown', function () {
                $elem.css(self._getClosedHandCss());
                self.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.TILE_MOUSE_DOWN);
            });
            $elem.on('mouseup', function () {
                $elem.css(self._getOpenHandCss());
            });
        },

        getTileContentInHtmlForm: function getTileContentInHtmlForm() {
            var model = this.model,
                operator = model.get('operator'),
                exponent = model.get('exponent'),
                coefficient = model.get('coefficient'),
                tileArray = this.arrTileViews,
                bigParenthesis = this.model.get('type') === modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS ? true : false,
                htmlString = '', index;

            if (operator === '*') {
                htmlString = htmlString + '<div class=\'operator-data-tab\'><div></div></div>';
            }
            //if parenthesis is bigger 1
            if (bigParenthesis) {
                htmlString += '<span class=\'big-parenthesis-container\'><span class=\'open-parenthesis-data-tab\'></span>';
            }

            //if parenthesis has coeffiecient -1
            if (coefficient === -1) {
                htmlString += '<span><span>-1(</span>';
            }
            else {
                if (!bigParenthesis) {
                    htmlString += '<span><span>(</span>';
                }
            }

            for (index = 0; index < tileArray.length; index++) {
                htmlString += tileArray[index].getTileContentInHtmlForm();
            }
            if (bigParenthesis) {
                htmlString += '<span class=\'big-parenthesis-close-container\'><span class=\'close-parenthesis-data-tab\'></span>';
            }
            else {
                htmlString += '<span>)</span>';
            }
            if (exponent < 0) {
                if (bigParenthesis) {
                    exponent = '<span class="minus-sign-exponent minus-sign-exponent-big-parenthesis">&minus;</span>' + Math.abs(exponent);
                }
                else {
                    exponent = '<span class="minus-sign-exponent">&minus;</span>' + Math.abs(exponent);
                }
            }
            if (bigParenthesis) {
                htmlString += '<div class=\'big-parenthesis-exponent-data-tab\'>' + exponent + '</div></span></span>';
            }
            else {
                htmlString += '<div class=\'parenthesis-exponent-data-tab exponent-data-tab\'>' + exponent + '</div></span>';
            }

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
            else if (clickPointEnum === 1) {
                tile = this.$exponent[0];
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
                return viewClassNamespace.ParenthesisTileView.__super__._getTutorialMouseEventPoint.apply(this, arguments);
            }
        },

        //getOperatorFromTileItem: function getOperatorFromTileItem(itemView) {
        //    var index = this.arrTileViews.indexOf(itemView);
        //    return this.$arrOperatorViews[index];
        //}

        /**
        * Deactivate all the events on child and also on itself
        *
        * @method deActivateEventOnTiles
        * @public
        */
        deActivateEventOnTiles: function (bRecursive) {
            // Call base method to deactivate all child controls
            viewClassNamespace.ParenthesisTileView.__super__.deActivateEventOnTiles.apply(this, arguments);
            // Detach all events on itself
            this._detachEvents();
            this._detachEventOnExponent();
        },

        /**
        * As per given action and offset, set event on view
        *
        * @method attachEventOnView
        * @param {Number} simulateAction Simulate action enum number which is to be bind
        * @param {Number} offset Offset if required like, BaseExp tile
        * @param {String} menuIndex Menu index
        * @public
        */
        attachEventOnView: function (simulateAction, offset, menuIndex) {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                self = this;


            if ($.support.touch) {
                this._touchStartHandler = $.proxy(this._onTouchStart, this);
                this._touchEndHandler = $.proxy(this._onTouchEnd, this);
                this._touchMoveHandler = $.proxy(this._onTouchMove, this);
                this.el.addEventListener('touchstart', this._touchStartHandler, false);
            }

            switch (simulateAction) {
                case 1:
                case 7:
                    // Set Click on exponent only
                    if (offset === 1) {
                        this.$exponent.off('click').on('click', $.proxy(this._onExponentClick, this));
                        this.$el.off('mousedown').on('mousedown', function (evt) {
                            return self._onExpMouseDown(evt);
                        });
                    }
                    if (menuIndex) {
                        this.equationManager.attachEventOnMenuItem(menuIndex, this.parenthesisExponentId, this);
                    }
                    break;
                case 2:
                case 8:
                    // Double Click
                    // there is no double click event on BaseExponent tile
                    break;
                case 3:
                case 9:
                    // Drag
                    this.$el.on('mousedown', function (evt) {
                        return self.onMouseDown(evt);
                    });

                    this.$el.on('mouseup', function (evt) {
                        return self.onMouseUp(evt);
                    });

                    if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                        if (offset === 1) {
                            this.attachEventsOnExponent();
                        }
                        else {
                            this.attachEventsOnTile();
                        }
                    }
                    break;
                case 6:
                    // Marquee
                    this.$el.on('mousedown', function (evt) {
                        return self.onMouseDown(evt);
                    });

                    this.$el.on('mouseup', function (evt) {
                        return self.onMouseUp(evt);
                    });
                    //if (equationManagerMode === equationManagerModeTypes.BuildMode) {

                    //}
                    break;
                default:
                    console.log('Please give proper event enum');
                    break;
            }
        },

        _onExpMouseDown: function (event) {
            var ptMouse = new Point({ left: event.clientX, top: event.clientY }),
                rectExponent = new Rect(this.$exponent[0].getBoundingClientRect());

            if (rectExponent.isPointInRect(ptMouse)) {
                event.stopPropagation();
                event.preventDefault();
                //this.equationManager.hideMarquee();
                this.equationManager.removeMarquee();

                return false; // Return false stops event from propagating
            }
            return true;   // Return true propagates event
        },

        /**
        * Enable/Disable tile item as per type
        *
        * @mehtod _enableDisableTile
        * @param {String} type Type of tile which is to be enable/disable
        * @param {Boolean} enable True if enable tile
        * @param {Boolean} isDraggable True if tile is draggable
        */
        _enableDisableTile: function (type, enable, isDraggable) {
            var binTileType = modelClassNameSpace.TileItem.BinTileType,
                sEnable = '',
                tileView = this.$el;
            if (type) {
                switch (type) {
                    case binTileType.BASE:
                        if (enable) this.$base.removeClass('no-hover');
                        this.$base.removeClass('inactive');
                        if (!tileView.hasClass('custom-droppable-disabled')
                            && !enable) {
                            this.$base.addClass('inactive').removeClass('new-created-tile');
                        }
                        break;
                    case binTileType.EXPONENT:
                        if (enable) this.$exponent.removeClass('no-hover');
                        this.$exponent.removeClass('inactive');
                        if (!tileView.hasClass('custom-droppable-disabled')
                            && !enable) {
                            this.$exponent.addClass('inactive').removeClass('new-created-tile');
                        }
                        break;
                }
            }
            else if (enable) {
                this.$base.find('.no-hover').removeClass('no-hover');
            }

            sEnable = !enable && this.$base.hasClass('inactive') && this.$exponent.hasClass('inactive') ? 'disable' : 'enable';

            if (isDraggable) {
                if (tileView.is('.ui-draggable')) {
                    tileView.draggable(sEnable);
                }
            }
            else {
                if (tileView.is('.ui-droppable')) {
                    tileView.droppable(sEnable);
                }
                if (type !== binTileType.EXPONENT) {
                    tileView.find('.inactive').removeClass('inactive');
                    tileView.find('.custom-droppable-disabled').removeClass('custom-droppable-disabled');
                    if (sEnable !== 'enable') {
                        tileView.addClass('custom-droppable-disabled')
                        .find('.new-created-tile')
                        .removeClass('new-created-tile');
                    }
                }
            }
        },

        /**
        * Disable all droppables
        * Call base method to disable all child
        * And apply inactive class to both base and exponent
        *
        * @method disableTiles
        * @public
        */
        disableTiles: function (bRecursive) {
            viewClassNamespace.ParenthesisTileView.__super__.disableTiles.apply(this, arguments);
            // Add inactive class to base and exponent child
            this.$base.removeClass('inactive').addClass('inactive').removeClass('new-created-tile');
            this.$exponent.removeClass('inactive').addClass('inactive').removeClass('new-created-tile');
            // Remove all disabled class from its child controls
            this.$el.find('.custom-droppable-disabled').removeClass('custom-droppable-disabled');
        },

        attachDetachDraggable: function attachDetachDraggable(viewCid, enable) {
            var index,
                tileArr = this.arrTileViews,
                isDraggableEnable = enable ? 'disable' : 'enable',
                isDroppableEnable = enable ? 'enable' : 'disable';

            if (this.equationManager.model.get('mode') !== modelClassNameSpace.EquationManager.MODES.SolveMode || this.equationManager._tutorialMode) {
                return;
            }

            for (index = 0; index < tileArr.length; index++) {
                tileArr[index].attachDetachDraggable(viewCid, enable);
            }
            if (viewCid) {
                if (viewCid === this.cid) {
                    if (this.$el.is('.ui-droppable')) {
                        this.$el.droppable(isDroppableEnable);
                    }
                    return;
                }
            }
            if (this.$el.is('.ui-draggable')) {
                this.$el.draggable(isDraggableEnable);
            }
            if (this.$el.is('.ui-droppable')) {
                this.$el.droppable(isDroppableEnable);
            }
        },

        startAcc: function startAcc (moveForward) {
            if (this.equationManager.tileSelected ||
                this.equationManager.isMarqueeSelectedForOp && this.equationManager.isTileViewInsideMarquee(this)) {
                if(moveForward) {
                    this.getNextTileAcc();
                }
                else {
                    this.goPreviousAcc();
                }
            }
            else {
                this.startAccExp();
            }
        },

        buildStartAcc: function buildStartAcc () {
            this.startAcc(true);
        },

        continueAcc: function continueAcc (index) {
            this.removeAccDiv();
            this.getNextTileAcc();
        },

        buildContinueAcc : function buildContinueAcc () {
            this.removeAccDiv();
            if(this.arrTileViews.length > 0) {
                this.arrTileViews[0].buildStartAcc();
            }
        },

        startAccExp: function startAccExp () {
            var ele = this.$exponent,
                elPosition = ele.position(),
                elHeight = ele.height(),
                elWidth = ele.width(),
                accDiv = $('<div class="acc-par"></div>'),
                mode = this.equationManager.model.get('mode'),
                MODE = modelClassNameSpace.EquationManager.MODES,
                accString = '';

            accDiv.css({position: 'absolute', top: elPosition.top + 2, left: elPosition.left + 4, width: elWidth + 3, height: elHeight + 4, outline: '2px dotted #aaa', 'font-size': 0, 'pointer-events': 'none'});
            this.removeAccDiv();
            if (mode === MODE.BuildMode) {
                accString = this.getExpAccString() + this.getChildrenAccString();
                accDiv.text(accString);
            }
            else {
                accDiv.text(this.getTileAccString());
            }
            this.$el.append(accDiv);
            this.accDiv = accDiv;
            this.equationManager.setCurrentAccView(this);
            accDiv.attr('tabindex', -1);
            accDiv[0].focus();
            // This is necessary because sometimes the current acc view doesn't change but
            // the focus changes from base to exp or exp to base
            this.equationManager.model.trigger('change:currentAccView');
            this.attachEventsAcc();
        },

        getNextTileAcc : function getNextTileAcc () {
            if(this.arrTileViews.length > 0) {
                this.arrTileViews[0].startAcc(true);
            }
        },

        startAccOnNextTile: function startAccOnNextTile () {
            var nextTile = this.getNextTile();
            this.currentAccLevel = null;
            if(nextTile != undefined) {
                nextTile.startAcc(true);
            }
            else {
                this.parent.startAccOnNextTile();
            }
        },

        buildStartAccOnNextTile: function buildStartAccOnNextTile () {
            var nextTile = this.getNextTile();
            this.currentAccLevel = null;
            if(nextTile != undefined) {
                nextTile.buildStartAcc();
            }
            else {
                this.parent.buildStartAccOnNextTile();
            }
        },

        getContainerToAppend: function getContainerToAppend () {
            return this.$el;
        },

        goPreviousAcc: function goPreviousAcc () {
            var prevTile = this.getPrevTile();
            this.removeAccDiv();
            if(prevTile != undefined) {
                prevTile.shiftTabHandler(false);
            }
            else {
                this.parent.shiftTabHandler(true);
            }
        },

        buildGoPreviousAcc: function buildGoPreviousAcc () {
            var prevTile = this.getPrevTile();
            this.removeAccDiv();
            if(prevTile != undefined) {
                prevTile.buildShiftTabHandler(false);
            }
            else {
                this.parent.buildShiftTabHandler(true);
            }
        },

        shiftTabHandler: function shiftTabHandler (bool) {
            if(bool) {
                this.startAcc(false);
            }
            else {
                var len = this.arrTileViews.length;
                if(len > 0) {
                    this.arrTileViews[len-1].shiftTabHandler(false);
                }
            }
        },

        buildShiftTabHandler: function buildShiftTabHandler (bool) {
            if(bool) {
                this.buildStartAcc();
            }
            else {
                var len = this.arrTileViews.length;
                if(len > 0) {
                    this.arrTileViews[len-1].buildFocusDecider();
                }
            }
        },

        buildSpacePressed: function buildSpacePressed () {
            //this.spacePressed();
        },

        spacePressed: function spacePressed () {
            this.hideAccDiv();
            this.$exponent.trigger('click');
            if (!this.equationManager.applyExponentBtnViews[this.parenthesisExponentId].$el.hasClass('disabled')) {
                this.setFocus('apply-exponent-button-' + this.parenthesisExponentId);
            }
            else if (!this.equationManager.changeSignBtnViews[this.parenthesisExponentId].$el.hasClass('disabled')) {
                this.setFocus('change-sign-button-' + this.parenthesisExponentId);
            }
        },

        tutorialSpacePressed: function tutorialSpacePressed () {
            this.spacePressed();
        },

        removeAccDiv: function removeAccDiv() {
            if(this.accDiv) {
                this.detachEventsAcc();
                this.accDiv.remove();
            }
        },

        revertFocus: function () {
            var mode = this.equationManager.model.get('mode'),
                MODE = modelClassNameSpace.EquationManager.MODES;
            this.removeAccDiv();
            if (mode === MODE.BuildMode) {
                this.buildStartAcc(true);
            } else {
                this.startAcc(true);
            }
        },

        ctxMenuOpenHandler: function () {
            this.hideAccDiv();
        },

        ctxMenuHideHandler: function (event, ui) {
            if(event){event.stopPropagation();}
            this.revertFocus();
        },

        ctxMenuSelectHandler: function ctxMenuSelectHandler (event, ui) {
            event.stopPropagation();
            var currentTargetId = ui.currentTarget.id,
                contextMenuId = parseInt(currentTargetId.substring(currentTargetId.lastIndexOf('-') + 1), 10),
                data = {};
            switch (contextMenuId) {
                case 0:
                    this.removeAccDiv();
                    data.tiletype = modelClassNameSpace.TileItem.BinTileType.EXPONENT;
                    data.numOfTiles = 1;
                    data.sourceTile = this;
                    this.equationManager.onDeleteTile(data);
                    //this.setFocus('droppable-region');
                    this.equationManager.buildModeSetFocusOnTooltip();
                    break;
                case 1:
                case 2:
                    this.addParenthesesAcc();
                    break;
                case 3:
                    this.removeParenthesesAcc();
                    break;
                case 9:
                    this.moveAccrossVinculum();
                    break;
            }
        },

        moveAccrossVinculum: function moveAccrossVinculum () {
            var location = this.model.get('bDenominator'),
                parent = this.parent,
                TYPES = modelClassNameSpace.TileItem.SolveTileType,
                data = {},
                numLength;

            if(parent.model.get('type') !== TYPES.FRACTION) {
                parent = parent.parent;
            }

            numLength = parent.getNumeratorLength(parent.arrTileViews);

            if(location) {
                data.index = parent.getIndex(parent.arrTileViews[numLength-1]);
            }
            else {
                data.index = parent.getIndex(parent.arrTileViews[parent.arrTileViews.length-1]);
            }

            data.sourceTile = this;
            data.isDestDeno = !location;
            data.isLeft = false;
            data.numOfTiles = 1;
            data.strOperator = '*';

            this.equationManager.onRepositionTile(data);
            this.equationManager.solveModeSetFocusOnTooltip();
        },

        removeParenthesesAcc: function () {
            var data = {};
            this.removeAccDiv();
            data.tiletype = modelClassNameSpace.TileItem.BinTileType.PARENTHESIS;
            data.numOfTiles = 1;
            data.sourceTile = this;
            this.equationManager.onDeleteTile(data);
            this.setFocus('droppable-region');
        },

        addParenthesesAcc: function (coeff) {
            this.equationManager.trigger(viewClassNamespace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE);
            this.equationManager.buildModeSetFocusOnTooltip();
        },

        getTileItemIndex: function getTileItemIndex(type) {
            var tileViews = this.arrTileViews,
                exponent = this.model.get('exponent'), i = 0, emptyTile = null,
                tileObj = null, item = null;
            for (; i < tileViews.length; i++) {
                tileObj = tileViews[i].getTileItemIndex(type);
                /*if (tileObj.emptyTile !== null && tileObj.emptyTile !== 'BASE') {
                    item = tileViews[i];
                    break;
                }*/
                if(tileObj.emptyTile !== null && (tileObj.emptyTile === type || tileObj.emptyTile === 'BASE_EXPONENT')) {
                    return tileObj;
                }
            }

            if (type === 'EXPONENT' && exponent === null) {
                emptyTile = 'EXPONENT';
                return { tileIndex: this.parent.getIndex(this), emptyTile: emptyTile }
            }
            return tileObj;
        },

        getAccString: function getAccString() {
            var currentString = '',
                TYPES = modelClassNameSpace.TileItem.SolveTileType,
                model = this.model,
                exp = model.get('exponent'),
                index;
            if (model.get('operator')) {
                currentString = this.getMessage('base-exp-pair', 2);
            }
            else if(this.parent.model.get('type') === TYPES.FRACTION && model.get('bDenominator')) {
                currentString = this.getMessage('base-exp-pair', 1);
            }

            if(this.model.get('coefficient') === -1) {
                currentString += ' ' + this.model.get('coefficient') + ' ' + this.getMessage('base-exp-pair', 2);
            }

            for(index=0; index<this.arrTileViews.length; index++) {
                currentString += this.arrTileViews[index].getAccString();
            }

            currentString = this.getMessage('base-exp-pair', 17, [currentString, exp !== null ? exp : this.getMessage('base-exp-pair', 4)]);
            return ' ' + currentString.trim();
        },

        /**
        * Returns the acc string for this particular tile i.e. for 5 it'll return 'five'
        * NOTE: This doesn't return anything unrelated to this tile.
        * @method getSelfAccString
        * @return {String} Acc string for this tile.
        */
        getSelfAccString: function () {
            var str = '',
                exp = this.model.get('exponent'),
                i = 0;

            for (i = 0; i < this.arrTileViews.length; i++) {
                str += this.arrTileViews[i].getAccString();
            }
            return this.getMessage('base-exp-pair', 17, [str, exp !== null ? exp : this.getMessage('base-exp-pair', 4)]);
        },

        getExpAccString: function getExpAccString () {
            var parModel = this.model,
                parExp = parModel.get('exponent'),
                parCoeff = parModel.get('coefficient');

            if(parCoeff === 1) {
                return this.getMessage('base-exp-pair', 10, [parExp !== null ? parExp : this.getMessage('base-exp-pair', 4)]);
            }
            return this.getMessage('base-exp-pair', 11, [parExp !== null ? parExp : this.getMessage('base-exp-pair', 4)]);
        },

        getChildrenAccString: function getChildrenAccString () {
            var index, accStr = '', currentView;
            for(index=0; index<this.arrTileViews.length; index++) {
                currentView = this.arrTileViews[index];
                accStr += ' ' + currentView.getOperatorAccString() + ' ' + currentView.getBaseAccString() + ' ' + currentView.getExpAccString();
            }
            return accStr;
        },

        getTileAccString: function getTileAccString () {
            var accStr = this.getMessage('base-exp-pair', 10, [this.model.get('exponent')]) ;

            if(this.isPresentAsParent()) { //true if fraction else false if equation view.
                if(this.model.get('bDenominator')) {
                    accStr += this.getMessage('base-exp-pair', 30);
                }
                else {
                    accStr += this.getMessage('base-exp-pair', 29);
                }
            }
            else {
                accStr += this.getMessage('base-exp-pair', 31);
            }
            if (this.equationManager._tutorialMode) {
                return accStr + ' ' + this.getMessage('base-exp-pair', 32);
            }
            return accStr + ' ' + this.getMessage('base-exp-pair', 20);
        },

        isPresentAsParent: function isPresentAsParent () {
            return this.parent.isPresentAsParent();
        }
    });
})();
