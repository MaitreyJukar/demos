(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point,
        scroll = viewClassNamespace.TileView.scroll;
    /**
    * ParenthesisTileView holds the data for the BIG_PARENTHESIS type TileView.
    *
    * @class BigParenthesisTileView
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewClassNamespace.BigParenthesisTileView = viewClassNamespace.ParenthesisTileView.extend({

        initialize: function () {
            viewClassNamespace.BigParenthesisTileView.__super__.initialize.apply(this, arguments);
            this.$el.addClass('big-parenthesis');
        },



        listenEvents: function () {
            //this.listenTo(this.model.get('tileArray'), 'add', this.onAddTile);
            //this.listenTo(this.model.get('tileArray'), 'remove', this.onRemoveTile);
            this.listenTo(this.model, 'change:exponent', this._onExponentChange);
            //this.listenTo(this.model, 'change:operator', this._onOperatorChange);
        },

        attachEvents: function () {
            var i = 0, self = this,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                tileTypes = modelClassNameSpace.BaseExpTile.TILE_TYPES;

            if ($.support.touch) {
                MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$exponent, 600, this.addHoverClassExponent, this.removeHoverClassExponent, 'exponent-hold');
                this._touchStartHandler = $.proxy(this._onTouchStart, this);
                this._touchEndHandler = $.proxy(this._onTouchEnd, this);
                this._touchMoveHandler = $.proxy(this._onTouchMove, this);
                this.el.addEventListener('touchstart', this._touchStartHandler, false);

                this.$el.off('mousedown').on('mousedown', function (evt) {
                    return self._onExpMouseDown(evt);
                });

                this.$el.off('mouseup').on('mouseup', function (evt) {
                    return self._onExpMouseUp(evt);
                });
            }
            else {
                this.$el.off('mousedown').on('mousedown', function (evt) {
                    return self._onExpMouseDown(evt);
                });

                this.$el.off('mouseup').on('mouseup', function (evt) {
                    return self._onExpMouseUp(evt);
                });
            }

            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                this.applyHandCursorToElem(this.$exponent);
            } else {
                this.$exponent.css({
                    cursor: 'pointer'
                });
            }

            for (i = 0; i < this.arrTileViews.length; i++) {
                this.arrTileViews[i].attachEvents();
            }

            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                this.attachEventsOnExponent();
                //this.$exponent.off('mousedown').on('mousedown', function (evt) {
                //    return self._onExpMouseDown(evt);
                //});

                //this.$el.off('mouseup').on('mouseup', function (evt) {
                //    return self._onExpMouseUp(evt);
                //});
            } else {
                this.$exponent.off('click').on('click', $.proxy(this._onExponentClick, this));
                //this.$exponent.off('mousedown').on('mousedown', $.proxy(this._onExponentMouseDown, this));
                //this.$exponent.off('mouseup').on('mouseup', $.proxy(this._onExponentMouseUp, this));
                //this.$exponent.off('mousedown').on('mousedown', function (evt) {
                //    return self._onExpMouseDown(evt);
                //});
            }

            this.$exponent.droppable({
                accept: this.model.get('strDroppables'),
                tolerance: 'pointer',
                greedy: true,
                drop: function (event, ui) {
                    self.onTileDrop(event, ui);
                    ui.draggable.removeData('cur-droppable');
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

            //$.fn.EnableTouch(this.$exponent);
            //if (equationManagerMode === equationManagerModeTypes.SolveMode) {
            //    var index = this.parent.getIndex(this);
            //    this.equationManager.createTooltip(parseInt(this.$exponent.attr('id').replace(this.equationManager.getIdPrefix() + 'exponent-', '')), this);

            //}
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

        attachEventsOnExponent: function () {
            var self = this,
                isDraggable = this.$exponent.is('.ui-draggable'),
                ptMouse,
                EVENTS = viewClassNamespace.EquationManager.EVENTS.ADD_STEP,
                bRemove = false;
            if (this.model.get('exponent') !== null) {
                if (!isDraggable) {
                    this.$exponent.draggable({
                        scroll: scroll.ENABLE,
                        scrollSensitivity: scroll.SENSITIVITY,
                        scrollSpeed: scroll.SPEED,
                        helper: 'clone',
                        containment: this.equationManager.$draggableContainment,
                        cursorAt: { left: this.$exponent.width() / 2, top: this.$exponent.height() / 2 },
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
                                    self.equationManager.trigger(EVENTS.REVERT_START);
                                    return true;
                                }
                            }
                        },
                        start: function (event, ui) {
                            //$(this).addClass('current-draggable');
                            var evt = event.originalEvent ? event.originalEvent : event;
                            bRemove = false;
                            ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                            ui.helper.data({ 'cur-draggable': self }).css({ 'z-index': '3' });
                            self.$exponent.addClass('empty').find('.exponent-value').html();
                            self.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            this.isDraggaing = true;
                        },
                        drag: function (event, ui) {
                            var droppable = $(this).data('cur-droppable'),
                                evt = event.originalEvent ? event.originalEvent : event;
                            ptMouse.setPoint({ left: evt.clientX, top: evt.clientY });
                            self.equationManager.isTileRemovable(ui.helper, ptMouse);
                            if (droppable) {
                                droppable.onMouseOver(event, ui);
                            }
                        },
                        stop: function (event, ui) {
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
                            self.equationManager.trigger(EVENTS.REVERT_END);
                            self.equationManager.setIsDropped(false);
                            self.equationManager.refresh();
                            this.isDragging = false;
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

        //_onExpMouseDownSolve: function (event) {
        //    event.preventDefault();
        //    event.stopPropagation();
        //    return false;
        //},

        _onExpMouseUp: function onMouseUp(event) {
            this.equationManager.showMarquee();
            //event.stopPropagation();
            //event.preventDefault();
        },

        onMouseOver: function (event, ui) {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES;

            this.equationManager.registerMouseOverTile(this, event, ui);

            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                var evt = event.originalEvent ? event.originalEvent : event,
                    ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                    draggedTileData = ui.helper.data(),
                    draggedTileType = draggedTileData['tiletype'],
                    binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                    rectExponent = new Rect(this.$exponent[0].getBoundingClientRect());

                this.$exponent.removeClass('hover-border');

                if (draggedTileType === binTileTypes.EXPONENT && rectExponent.isPointInRect(ptMouse)) {
                    this.$exponent.addClass('hover-border');
                }
            }
        },

        onMouseOut: function (event, ui) {
            this.$exponent.removeClass('hover-border');
        },

        onTileDrop: function (event, ui) {
            var evt = event.originalEvent,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData.tiletype,
                binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelClassNameSpace.EquationManager.MODES,
                data,
                bCommandResponse = false,
                commandExitCodes = modelClassNameSpace.CommandFactory.EXIT_CODE;

            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                var isTileFromBin = false,
                    rectExponent = new Rect(this.$exponent[0].getBoundingClientRect());
                this.$exponent.removeClass('hover-border');

                if (!draggedTile) {
                    isTileFromBin = true;
                }
                if (draggedTileType === binTileTypes.EXPONENT && rectExponent.isPointInRect(ptMouse)) {
                    if (isTileFromBin) {
                        data = { sourceTile: ui.helper, destTile: this };
                        bCommandResponse = this.equationManager.onReplaceTile(data);
                    }
                    else {
                        data = { sourceTile: draggedTile, destTile: this, type: draggedTileType };
                        bCommandResponse = this.equationManager.onSwapTile(data);
                    }
                    if (bCommandResponse === commandExitCodes.SUCCESS ||
                            bCommandResponse === commandExitCodes.NO_OPERATION) {
                        ui.draggable.data('isDropped', true);
                    }
                }
            }
        },

        _onExponentClick: function _onExponentClick(event) {
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
                MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$exponent, 600, this.addHoverClassExponent, this.removeHoverClassExponent, 'exponent-hold');
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
                    this.$el.off('mousedown').on('mousedown', function (evt) {
                        return self._onExpMouseDown(evt);
                    });

                    this.$el.off('mouseup').on('mouseup', function (evt) {
                        return self._onExpMouseUp(evt);
                    });
                    // there is no drag event on big parenthesis view
                    break;
                case 6:
                    // Marquee
                    this.$el.off('mousedown').on('mousedown', function (evt) {
                        return self._onExpMouseDown(evt);
                    });

                    this.$el.off('mouseup').on('mouseup', function (evt) {
                        return self._onExpMouseUp(evt);
                    });
                    //if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                    //    this.$el.off('mousedown').on('mousedown', function (evt) {
                    //        return self._onExpMouseDown(evt);
                    //    });

                    //    this.$el.off('mouseup').on('mouseup', function (evt) {
                    //        self._onExpMouseUp(evt);
                    //    });
                    //}
                    break;
                default:
                    console.log('Please give proper event enum');
                    break;
            }
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
                exponentValueDiv.html();
                this.$exponent.addClass('empty');
            }
            else {
                exponentValueDiv.html(exponentStr);
                this.$exponent.removeClass('empty');
            }

            if (this.equationManager.model.get('mode') === modelClassNameSpace.EquationManager.MODES.BuildMode) {
                this.attachEventsOnExponent();
            }
        },

        /**
        * Applies hand cursor to the elem on mouseenter, mouseleave, mousedown & mouseup
        * @method applyHandCursorToElem
        * @private
        * @param {Object} The element to which hand cursor is to be applied
        */
        applyHandCursorToElem: function applyHandCursorToElem($elem) {

            if (!$elem.hasClass('exponent')) { return; }

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

                if ($elem.data('tiletype') === modelClassNameSpace.TileItem.BinTileType.EXPONENT &&
                    self.equationManager.model.get('mode') === modelClassNameSpace.EquationManager.MODES.SolveMode) {
                    $elem.css('cursor', 'pointer');
                }
                else {
                    $elem.css(self._getOpenHandCss());
                }
                if ($(this).hasClass('empty')) {
                    $elem.css(self._getDefaultCursorCss());
                }
            });

            $elem.on(leave, function () {
                if (self.isMarqueeDrawing()) { return false; }
                if ($(this).hasClass('current-draggable')) { return; }
                if ($(this).hasClass('empty')) {
                    $elem.css(self._getDefaultCursorCss());
                }
            });
            $elem.on('mousedown', function () {
                $elem.css(self._getClosedHandCss());
                if ($(this).hasClass('empty')) {
                    $elem.css(self._getDefaultCursorCss());
                }
                self.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.TILE_MOUSE_DOWN);
            });
            $elem.on('mouseup', function () {
                $elem.css(self._getOpenHandCss());
                if ($(this).hasClass('empty')) {
                    $elem.css(self._getDefaultCursorCss());
                }
            });
        },

        /**
        * Returns the elements inside the marquee div.
        *
        * @method getElementsInsideMarquee
        * @param {Object} Event object
        * @param {Object} Marquee div
        */
        getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee) {
            var marqueeRect = new MathInteractives.Common.Utilities.Models.Rect($marquee[0].getBoundingClientRect()),
            middleOfMarqueeRect = marqueeRect.getMiddle(), i = 0, rect, length,
            arrTileViews = this.arrTileViews,
            firstBaseExpItem = this.arrTileViews[0],
            lastBaseExpItem = _.last(this.arrTileViews),
            firstItemRect = new MathInteractives.Common.Utilities.Models.Rect(firstBaseExpItem.el.getBoundingClientRect()),
            lastItemRect = new MathInteractives.Common.Utilities.Models.Rect(lastBaseExpItem.el.getBoundingClientRect()),
            parenthesisRect = new MathInteractives.Common.Utilities.Models.Rect(this.$el[0].getBoundingClientRect()),
            middleOfRect = parenthesisRect.getMiddle();

            for (length = arrTileViews.length; i < length; i++) {
                this.arrTileViews[i].getElementsInsideMarquee(event, $marquee);
            }

        },

        /**
        * Disable all droppables
        * Call base method disable all class
        * Remove all inactive class of child controls, and add inactive class to base and exponent
        *
        * @method disableTiles
        * @public
        */
        disableTiles: function (bRecursive) {
            viewClassNamespace.ParenthesisTileView.__super__.disableTiles.apply(this, arguments);
            // Remove all inactive class from its child controls
            this.$el.find('.inactive').removeClass('inactive');

            // Add inactive class to base and exponent child
            this.$base.removeClass('inactive').addClass('inactive').removeClass('new-created-tile');
            this.$exponent.removeClass('inactive').addClass('inactive').removeClass('new-created-tile');
        },

        startAcc: function startaAcc() {
            this.startAccExp();
        },

        startAccExp: function startAccExp() {
            var ele = this.$exponent,
                elPosition = ele.position(),
                elHeight = ele.height(),
                elWidth = ele.width(),
                accDiv = $('<div class="acc-big-par"></div>'),
                mode = this.equationManager.model.get('mode'),
                MODE = modelClassNameSpace.EquationManager.MODES,
                accString = '';
            accDiv.css({ position: 'absolute', top: elPosition.top + 2, left: elPosition.left + 4, width: elWidth + 3, height: elHeight + 4, outline: '2px dotted #aaa', 'font-size': 0, 'pointer-events': 'none' });
            if (this.equationManager.isSelectedTileExponent) {
                accDiv.text(this.getMessage('base-exp-pair', 16));
            }
            else {
                accString = this.getMessage('base-exp-pair', 7, [this.model.get('exponent')]);
                if (mode === MODE.SolveMode) {
                    if(this.equationManager._tutorialMode) {
                        accString += ' ' + this.getMessage('base-exp-pair', 32);
                    }
                    else {
                        accString += ' ' + this.getMessage('base-exp-pair', 20);
                    }
                }
                accDiv.text(accString);
            }
            this.$el.append(accDiv);
            this.accDiv = accDiv;
            this.equationManager.setCurrentAccView(this);
            accDiv.attr('tabindex', -1);
            accDiv[0].focus();
            this.attachEventsAcc();
        },

        buildStartAcc: function buildStartAcc() {
            this.startAcc();
        },

        continueAcc: function continueAcc(index) {
            this.removeAccDiv();
            this.getNextTileAcc();
        },

        buildContinueAcc: function buildContinueAcc(index) {
            this.removeAccDiv();
            if (this.arrTileViews.length > 0) {
                if (this.equationManager.selectedTile) {
                    this.arrTileViews[0].startAccNumerator();
                }
                else {
                    this.arrTileViews[0].buildStartAcc();
                }

            }
        },

        getNextTileAcc: function getNextTileAcc() {
            if (this.arrTileViews.length > 0) {
                this.arrTileViews[0].startAcc();
            }
        },

        startAccOnNextTile: function startAccOnNextTile() {
            if (this.accDiv) {
                this.removeAccDiv();
            }
            this.equationManager.setCurrentAccView(null);
            this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.SOLVE_TAB);

        },

        buildStartAccOnNextTile: function startAccOnNextTile() {
            if (this.accDiv) {
                this.removeAccDiv();
            }
            this.equationManager.setCurrentAccView(null);
            this.equationManager.trigger(viewClassNamespace.EquationManager.EVENTS.BUILD_TAB);
        },

        getContainerToAppend: function getContainerToAppend() {
            return this.$el;
        },

        goPreviousAcc: function goPreviousAcc(index) {
            this.removeAccDiv();
            this.parent.shiftTabHandler();
        },

        buildGoPreviousAcc: function buildGoPreviousAcc() {
            this.removeAccDiv();
            if (this.equationManager.selectedTile) {
                this.arrTileViews[0].startAccDenominator();
            }
            else {
                this.parent.buildShiftTabHandler();
            }

        },

        shiftTabHandler: function shiftTabHandler() {
            this.startAcc();
        },

        buildShiftTabHandler: function buildShiftTabHandler() {
            this.buildStartAcc();
        },

        buildSpacePressed: function buildSpacePressed() {
            //this.spacePressed();
        },

        //spacePressed: function spacePressed() {
        //    this.removeAccDiv();
        //    this.$exponent.trigger('click');
        //    if (this.equationManager.$('#' + this.idPrefix + 'apply-exponent-button-' + this.parenthesisExponentId).hasClass('disabled')) {
        //        this.setFocus('apply-exponent-button-' + this.parenthesisExponentId);
        //    }
        //    else if (this.equationManager.$('#' + this.idPrefix + 'change-sign-button-' + this.parenthesisExponentId).hasClass('disabled')) {
        //        this.setFocus('change-sign-button-' + this.parenthesisExponentId);
        //    }
        //},

        tutorialSpacePressed: function tutorialSpacePressed() {
            this.spacePressed();
        },

        removeAccDiv: function removeAccDiv() {
            if (this.accDiv) {
                this.accDiv.remove();
            }
        },

        startExpToggle: function () {
            if (this.equationManager.isSelectedTileExponent) {
                this.buildStartAcc();
            }
            else {
                return false;
            }
        },

        spaceToDropTile: function (isContextMenu) {
            var selectedTile = this.equationManager.selectedTile,
                data = {
                    sourceTile: selectedTile,
                    destTile: this
                };
            this.equationManager.onReplaceTile(data);
            this.equationManager.selectedTile = null;
            this.equationManager.isSelectedTileExponent = false;
            this.removeAccDiv();
            this.equationManager.equationView.tileDroppedString = this.getAccMessage('base-exp-pair', 12, [selectedTile.attr('data-tilevalue')]);
            this.equationManager.buildModeSetFocusOnTooltip();
        },

        getAccString: function getAccString () {
            var currentString = '',
                exp = this.model.get('exponent'),
                index;

            for(index=0; index<this.arrTileViews.length; index++) {
                currentString += this.arrTileViews[index].getAccString();
            }
            currentString += ' ' + this.getMessage('base-exp-pair', 3, [exp !== null ? exp : this.getMessage('base-exp-pair', 4)]);
            return currentString;
        }

    });
})();
