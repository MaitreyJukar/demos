(function () {
    'use strict';

    var viewNameSpace = MathInteractives.Common.Components.Views.EquationManager,
        modelNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point,
        scroll = viewNameSpace.TileView.scroll;

    /**
    * BaseExpTileView holds the data for the BASE EXPONENT type TileView.
    *
    * @class BaseExpTileView
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewNameSpace.BaseExpTileView = viewNameSpace.TileView.extend({

        initialize: function () {
            viewNameSpace.BaseExpTileView.__super__.initialize.apply(this, arguments);
        },

        render: function () {
        },

        _touchStartHandler: null,

        _touchMoveHandler: null,

        _touchEndHandler: null,

        _lastTap: null,

        events: {
            'mouseenter .base-container': 'addHoverClassBase',
            'mouseenter .exponent-container': 'addHoverClassExponent',
            'mouseleave .base-container': 'removeHoverClassBase',
            'mouseleave .exponent-container': 'removeHoverClassExponent'
        },

        createView: function () {
            var classes = viewNameSpace.TileView.CLASSES, $accBase, $accExponent,
                $template = null,
                templateString = null,
                baseValue = this.model.get('base'),
                baseStr = this.getValueText('base'),
                exponentValue = this.model.get('exponent'),
                exponentStr = this.getValueText('exponent'),
                binTileTypes = modelNameSpace.TileItem.BinTileType;

            //     $(MathInteractives.Common.Interactivities.ExponentAccordion.templates['tiles']({ 'tiles': tileNumberArray, 'idPrefix': this.idPrefix, 'type': type, 'tileType': tileType })
            //.trim()).appendTo(self.$('#' + idPrefix + 'parentheses-tile-dispenser'));

            templateString = MathInteractives.Common.Components.templates['baseExpTile']({
                'base': baseStr,
                'exponent': exponentStr,
                'base-class': classes.BASE,
                'exponent-class': classes.EXPONENT,
                'base-exponent-class': classes.BASE_EXPONENT,
                'baseTileType': binTileTypes.BASE,
                'expTileType': binTileTypes.EXPONENT,
                'idPrefix': this.idPrefix,
                'level': classes.Level + this.getLevel()
            });
            $template = $(templateString);


            this.$base = $template.find('.base-container');
            this.$exponent = $template.find('.exponent-container');

            if (baseValue === null || baseValue === undefined || baseValue === '') {
                this.$base.addClass('empty');
            }
            if (exponentValue === null || exponentValue === undefined || exponentValue === '') {
                this.$exponent.addClass('empty');
            }

            if (exponentValue === 0) {
                if(this.equationManager.isZeroGlowAllowed()) {
                    this.$exponent.addClass('zero-glow');
                }
            }
            //this.$base = $('<div></div>').addClass(classes.BASE + ' ' + classes.Level + this.getLevel()).html(baseValue);
            //if (baseValue === null || baseValue === undefined || baseValue === '') {
            //    this.$base.addClass('empty');
            //}

            //this.$exponent = $('<div></div>').addClass(classes.EXPONENT + ' ' + classes.Level + this.getLevel() + ' ' + classes.BASE_EXPONENT).html(this.model.get('exponent'));
            //if (exponentValue === null || exponentValue === undefined || exponentValue === '') {
            //    this.$exponent.addClass('empty');
            //}
            //$accExponent = $('<div></div>').addClass('acc-div ' + 'acc-read-elem math-utilities-manager-access').html(exponentValue).appendTo(this.$exponent);

            this.$el.append($template)
            .addClass(classes.TermContainer)
            .addClass(classes.BASE_EXPONENT)
            .addClass(classes.Level + this.getLevel())
            .attr('data-tiletype', binTileTypes.BASE_EXPONENT);

            return this.$el;
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
            var model = this.model;
            if (model.get('base') === null && model.get('exponent') === null) {
                return true;
            }
            return false;
        },

        isEmptyInView: function () {
            if (this.$base.hasClass('empty') && this.$exponent.hasClass('empty')) {
                return true;
            }
            return false;
        },

        hasChildView: function (tileView) {
            return false;
        },

        getBaseValue: function () {
            return this.model.get('base');
        },

        getExponentValue: function () {
            return this.model.get('exponent');
        },

        stopListeningEvents: function (bRecursive) {
            this.stopListening();
        },

        attachEvents: function () {
            var self = this,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
                tileTypes = modelNameSpace.BaseExpTile.TILE_TYPES,
                originalBaseValue = this.model.get('base'),
                originalExpValue = this.model.get('exponent');

            this.$base.on('click', $.proxy(this._onBaseClick, this));
            this.$exponent.on('click', $.proxy(this._onExponentClick, this));

            this.listenTo(this.model, 'change:operator', this._onOperatorChange);
            this.listenTo(this.model, 'change:exponent', this._onExponentChange);
            this.listenTo(this.model, 'change:base', this._onBaseChange);
            this.applyHandCursorToElem(this.$base);
            this.applyHandCursorToElem(this.$exponent);
            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                this.applyCloseCursorToElem(this.$el);
                //this.$exponent.on('mousedown', $.proxy(this._onExponentMouseDown, this));
                //this.$exponent.on('mouseup', $.proxy(this._onExponentMouseUp, this));
            }

            if ($.support.touch) {
                if (this.equationManager.isTouch()) {
                    delete this.events['mouseenter .base-container'];
                    delete this.events['mouseenter .exponent-container'];
                    delete this.events['mouseleave .base-container'];
                    delete this.events['mouseleave .exponent-container'];
                    this.delegateEvents(this.events);
                }

                MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$base, 600, this.addHoverClassBase, this.removeHoverClassBase, 'base-hold');
                MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$exponent, 600, this.addHoverClassExponent, this.removeHoverClassExponent, 'base-hold');

                this._touchStartHandler = $.proxy(this._onTouchStart, this);
                this._touchEndHandler = $.proxy(this._onTouchEnd, this);
                this._touchMoveHandler = $.proxy(this._onTouchMove, this);
                this.el.addEventListener('touchstart', this._touchStartHandler, false);
                //this.el.addEventListener('touchend', this._touchEndHandler, false);

                this.$el.on('mousedown', function (evt) {
                    return self._onMouseDownTile(evt);
                });

                this.$el.on('mouseup', function (evt) {
                    return self._onMouseUpTile(evt);
                });
            }
            else {
                this.$el.on('mousedown', function (evt) {
                    return self._onMouseDownTile(evt);
                });

                this.$el.on('mouseup', function (evt) {
                    return self._onMouseUpTile(evt);
                });
            }

            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                this.attachEventsOnBase();
                this.attachEventsOnExponent();
            }
            else if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                this.attachEventsOnTile();
            }

            this.$el.droppable({
                accept: this.model.get('strDroppables'),
                tolerance: 'pointer',
                greedy: true,
                drop: function (event, ui) {
                    if (!self.equationManager.getIsDropped()) {
                        var retVal = self.onTileDrop(event, ui);
                        self.$el.removeClass('white-border-left' + ' ' + 'white-border-right' + ' ' + 'white-border');
                        ui.draggable.removeData('cur-droppable');
                        self.equationManager.setIsDropped(true);
                        return retVal;
                    }
                    return false;
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

        /**
        * A boolean used to enable marquee on drag stop only if it were disabled on drag start.
        *
        * @property disablingMarquee
        * @type Boolean
        * @default false
        */
        disablingMarquee: false,

        attachEventsOnTile: function () {
            var self = this,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
                isDraggable = this.$el.is('.ui-draggable'),
                model = this.model,
                EVENTS = viewNameSpace.EquationManager.EVENTS,
                exponentConatiner;
            if (model.get('base') !== null && model.get('exponent') !== null) {
                if (!isDraggable) {
                    this.$el.draggable({
                        scroll: scroll.ENABLE,
                        distance: 10,
                        scrollSensitivity: scroll.SENSITIVITY,
                        scrollSpeed: scroll.SPEED,
                        revert: function (event) {
                            //self.equationManager.showHideOverlayDiv(true);
                            self.equationManager.trigger(EVENTS.REVERT_START);
                            if (!this.data('isDropped')) {
                                return true;
                            }
                            return false; // Always return true else it will call stop method first and onclick after. This will cause break-base to be fired.
                        },
                        zIndex: 1,
                        helper: (equationManagerMode === equationManagerModeTypes.BuildMode ? 'clone' : 'original'),
                        containment: this.equationManager.$draggableContainment,
                        cursorAt: { left: this.$el.width() / 2, top: this.$el.height() / 2 },
                        start: function (event, ui) {
                            self.equationManager.equationView.attachDetachDraggable(self.cid, true);
                            self.isDragging = true;
                            //self.$el.css('visibility', 'hidden');
                            ui.helper.addClass('current-draggable');
                            ui.helper.data({ 'cur-draggable': self });
                            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                                ui.helper.data('prevLocationData', null);
                            }
                            self.equationManager.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            self.$exponent.css({ 'top': '', 'box-shadow': '' });
                            if (!self.equationManager.marqueeView.isDisabled) {
                                self.disablingMarquee = true;
                                self.equationManager.marqueeView.disableMarquee();
                            }
                        },
                        drag: function (event, ui) {
                            var droppable = $(this).data('cur-droppable');
                            if (droppable) {
                                droppable.onMouseOver(event, ui);
                            }
                        },
                        stop: function (event, ui) {
                            self.equationManager.equationView.attachDetachDraggable(self.cid, false);
                            var $this = $(this);
                            setTimeout(function () {
                                self.isDragging = false;
                            }, 10);
                            //self.$el.css('visibility', '');
                            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                                ui.helper.removeData('prevLocationData');
                                if (!$this.data('isDropped')) {
                                    self.invertExponentText(true);
                                }
                            }
                            ui.helper.removeData(['cur-draggable', 'cur-droppable']);
                            $this.removeClass('current-draggable');
                            self.equationManager.resetContainment();

                            if (self.disablingMarquee) {
                                self.equationManager.marqueeView.enableMarquee();
                                self.disablingMarquee = false;
                            }
                            //self.equationManager.showHideOverlayDiv(false);
                            self.equationManager.refresh();
                            self.equationManager.trigger(EVENTS.REVERT_END);
                            self.equationManager.setIsDropped(false);
                            //self.$el.draggable('disable');
                        }
                    });
                }
                else {
                    this.$el.draggable('enable');
                }
            }
            else {
                if (isDraggable) {
                    this.$el.draggable('disable');
                }
            }
            //$.fn.EnableTouch(this.$el);

        },

        attachEventsOnBase: function () {
            var self = this,
                isDraggable = this.$base.is('.ui-draggable'),
                ptMouse,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
                EVENTS = viewNameSpace.EquationManager.EVENTS,
                bRemove = false;

            if (this.model.get('base') !== null) {
                if (!isDraggable) {
                    this.$base.draggable({
                        scroll: scroll.ENABLE,
                        scrollSensitivity: scroll.SENSITIVITY,
                        scrollSpeed: scroll.SPEED,
                        helper: 'clone',
                        cursorAt: { left: this.$base.width() / 2, top: this.$base.height() / 2 },
                        containment: this.equationManager.$draggableContainment,
                        revert: function (event) {
                            self.helper.css(self._getDefaultCursorCss());
                            if (this.data('isDropped') === true) {
                                return false;
                            }
                            else {
                                bRemove = self.equationManager.isTileRemovable(self, ptMouse);
                                if (bRemove) {
                                    return false;
                                }
                                else {
                                    self.equationManager.showHideOverlayDiv(true);
                                    self.equationManager.trigger(EVENTS.REVERT_START);
                                    return true;
                                }
                            }
                        },
                        start: function (event, ui) {
                            self.equationManager.equationView.attachDetachDraggable(self.cid, true);
                            bRemove = false;
                            var evt = event.originalEvent ? event.originalEvent : event;
                            self.isDragging = true;
                            ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                            self.helper = ui.helper;
                            ui.helper.addClass('current-draggable');
                            ui.helper.data({ 'cur-draggable': self }).css({ 'z-index': '3' });
                            self.$base.addClass('empty');
                            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                                self.equationManager.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            }
                            self.$el.droppable('disable');
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
                            self.isDragging = false;
                            ui.helper.css({ 'z-index': 'auto' });
                            ui.helper.removeClass('current-draggable');
                            if (!$(this).data('isDropped')) {
                                self.$base.removeClass('empty');
                                var evt = event.originalEvent ? event.originalEvent : event;

                                ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                                //bRemove = self.equationManager.isTileRemovable(self, ptMouse);
                                if (bRemove) {
                                    var data = { sourceTile: self, tiletype: modelNameSpace.TileItem.BinTileType.BASE, numOfTiles: 1 }
                                    self.equationManager.onDeleteTile(data);
                                }
                            }
                            $(this).removeData(['cur-draggable', 'isDropped']);
                            self.equationManager.showHideOverlayDiv(false);
                            self.$el.droppable('enable');
                            self.equationManager.trigger(EVENTS.REVERT_END);
                            self.equationManager.refresh();
                            self.equationManager.setIsDropped(false);
                            //self.$base.draggable('disable');
                            bRemove = false;
                        }
                    });
                }
                else {
                    this.$base.draggable('enable');
                }
            }
            else {
                if (isDraggable) {
                    this.$base.draggable('disable');
                }
            }

            //$.fn.EnableTouch(this.$base);
        },

        attachEventsOnExponent: function () {
            var self = this,
                isDraggable = this.$exponent.is('.ui-draggable'),
                ptMouse,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
                EVENTS = viewNameSpace.EquationManager.EVENTS,
                bRemove = false;
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
                            self.helper.css(self._getDefaultCursorCss());
                            if (this.data('isDropped') === true) {
                                return false;
                            }
                            else {
                                bRemove = self.equationManager.isTileRemovable(self, ptMouse);
                                if (bRemove) {
                                    return false;
                                }
                                else {
                                    self.equationManager.showHideOverlayDiv(true);
                                    self.equationManager.trigger(EVENTS.REVERT_START);
                                    return true;
                                }
                            }
                        },
                        start: function (event, ui) {
                            self.equationManager.equationView.attachDetachDraggable(self.cid, true);
                            bRemove = false;
                            self.isDragging = true;
                            ui.helper.addClass('current-draggable');
                            self.helper = ui.helper;
                            var evt = event.originalEvent ? event.originalEvent : event;
                            ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                            ui.helper.data({ 'cur-draggable': self }).css({ 'z-index': '3' });
                            self.$exponent.addClass('empty');
                            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                                self.equationManager.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            }
                            self.$el.droppable('disable');
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
                            self.isDragging = false;
                            ui.helper.css({ 'z-index': 'auto' });
                            ui.helper.removeClass('current-draggable');
                            if (!$(this).data('isDropped')) {
                                self.$exponent.removeClass('empty');
                                var evt = event.originalEvent ? event.originalEvent : event,
                                    data;
                                ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
                                //bRemove = self.equationManager.isTileRemovable(self, ptMouse);
                                if (bRemove) {
                                    data = { sourceTile: self, tiletype: modelNameSpace.TileItem.BinTileType.EXPONENT, numOfTiles: 1 }
                                    self.equationManager.onDeleteTile(data);
                                }
                            }
                            $(this).removeData(['cur-draggable', 'isDropped']);
                            self.equationManager.showHideOverlayDiv(false);
                            self.$el.droppable('enable');
                            self.equationManager.trigger(EVENTS.REVERT_END);
                            self.equationManager.refresh();
                            self.equationManager.setIsDropped(false);
                            //self.$exponent.draggable('disable');
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
            //$.fn.EnableTouch(this.$exponent);
        },

        onMouseOver: function (event, ui) {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES;

            this.equationManager.registerMouseOverTile(this, event, ui);

            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                var binTileTypes = modelNameSpace.TileItem.BinTileType,
                    draggedTile = ui.helper.data('cur-draggable'),
                    isTileFromBin = draggedTile ? true : false,
                    rectBase = new Rect(this.$base[0].getBoundingClientRect()),
                    rectExponent = new Rect(this.$exponent[0].getBoundingClientRect()),
                    evt = event.originalEvent ? event.originalEvent : event,
                    ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                    draggedTileType = ui.helper.data('tiletype');
                this.$base.removeClass('hover-border');
                this.$exponent.removeClass('hover-border');

                //this.setGreedyChilds(this.$el);

                //// don't do anything if user meant to drop on the marquee
                //if (this.equationManager.isPointInMarquee(ptMouse)) { return false; }

                if (draggedTile !== this) {
                    if (rectBase.isPointInRect(ptMouse) && draggedTileType === binTileTypes.BASE) {
                        this.$base.addClass('hover-border');
                    }
                    else if (rectExponent.isPointInRect(ptMouse) && draggedTileType === binTileTypes.EXPONENT) {
                        this.$exponent.addClass('hover-border');
                    }
                    else if (draggedTileType === binTileTypes.PARENTHESIS) {
                        this.$base.addClass('hover-border');
                        this.$exponent.addClass('hover-border');
                    }
                    else if (this.isEmpty() && draggedTileType === binTileTypes.MARQUEE) {
                        this.$base.addClass('hover-border');
                        this.$exponent.addClass('hover-border');
                    }
                }
            }
            else {
                this.$el.removeClass('white-border-left' + ' ' + 'white-border-right');
                this.$base.addClass('hover-border');
                this.$exponent.addClass('hover-border');
            }
        },

        _onTouchStart: function (evt) {
            var touches = evt.changedTouches,
		        first = touches[0],
                button = 0,
		        simulatedEvent = document.createEvent("MouseEvent"),
                mouseenterSimulatedEvent = $.Event('mouseenter');

            this._lastTap = first.target;
            simulatedEvent.initMouseEvent('mousedown', true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
            first.target.dispatchEvent(simulatedEvent);
            $(first.target).trigger(mouseenterSimulatedEvent);
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
        * Handler for MouseDown on whole tile
        *
        * @method _onMouseDownTile
        * @param {Object} evt Mouse event
        * @private
        */
        _onMouseDownTile: function (event) {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
                rectBase = new Rect(this.$base[0].getBoundingClientRect()),
                rectExponent = new Rect(this.$exponent[0].getBoundingClientRect()),
                evt = event.originalEvent ? event.originalEvent : event,
                ptMouse, isSourceBase, isSourceExponent,

                isBaseDraggable = this.$base.is('.ui-draggable'),
                isExpDraggable = this.$exponent.is('.ui-draggable'),
                isDraggable = this.$el.is('.ui-draggable');

            evt = (evt.type === 'touchstart') ? evt.touches[0] : evt;
            ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
            isSourceBase = rectBase.isPointInRect(ptMouse);
            isSourceExponent = rectExponent.isPointInRect(ptMouse);

            //isDraggable && this.$el.draggable('disable');
            //isBaseDraggable && this.$base.draggable('disable');
            //isExpDraggable && this.$exponent.draggable('disable');
            // don't propagate the event only if the click is on the exponent or the base
            // propagate otherwise so marquee can handle it
            if (isSourceBase || isSourceExponent) {
                event.stopPropagation && event.stopPropagation();
                event.preventDefault && event.preventDefault();
                //this.equationManager.hideMarquee();
                this.equationManager.removeMarquee();
                if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                    this.attachEventsOnTile();
                    this.equationManager.adjustContainment(this.$el);
                }
                else {
                    this.attachEventsOnBase();
                    this.attachEventsOnExponent();
                    if (isSourceBase) {
                        this.equationManager.adjustContainment(this.$base);
                    }
                    else if (isSourceExponent) {
                        this.equationManager.adjustContainment(this.$exponent);
                    }
                }
                return false;
            }
            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                isDraggable && this.$el.draggable('disable');
            }
            else {
                isSourceBase && isBaseDraggable && this.$base.draggable('disable');
                isExpDraggable && isExpDraggable && this.$exponent.draggable('disable');
            }
            return true;
        },

        /**
        * Handler for MouseUp on whole tile
        *
        * @method _onMouseUpTile
        * @param {Object} evt Mouse event
        * @private
        */
        _onMouseUpTile: function (evt) {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
                evt = evt.originalEvent ? evt.originalEvent : evt;
            //this.equationManager.showMarquee();
            this.equationManager.resetContainment();
            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                this.attachEventsOnTile();
            }
            else {
                this.attachEventsOnBase();
                this.attachEventsOnExponent();
            }
            //if ($.support.touch && !this.isDragging/* && !this.equationManager.isMarqueeStarted()*/) {
            //    //  evt.stopPropagation();
            //}
        },

        /**
        * DeActivate all events on Base and Exponent as well as on this el
        * For Build mode- DeActivate Drag-Drop on Base and Exponent
        * For Solve mode- DeActivate Drag-Drop on whole tile
        * DeActivate 'Click' on Base and Exponent
        * DeActivate MouseDown and MouseUp on whole el
        *
        * @method deActivateEventOnTiles
        * @param {Boolean} bRecursive True if recursively deActivate all tiles events
        * @public
        */
        deActivateEventOnTiles: function () {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES;
            this.$base.off('click');
            this.$exponent.off('click');
            this.$el.off('mousedown');
            this.$el.off('mouseup');
            if ($.support.touch) {
                this.el.removeEventListener('touchstart', this._touchStartHandler, false);
                this.el.removeEventListener('touchend', this._touchEndHandler, false);
                this._touchStartHandler = null;
                this._touchMoveHandler = null;
                this._touchEndHandler = null;
            }
            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                this.detachEventsOnBase();
                this.detachEventsOnExponent();
            }
            else if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                this.detachEventsOnTile();
            }
            this.$base.addClass('no-hover');
            this.$exponent.addClass('no-hover');
        },

        /**
        * DeActivate Drag-Drop on whole tile
        *
        * @method detachEventsOnTile
        * @public
        */
        detachEventsOnTile: function () {
            var isDraggable = this.$el.is('.ui-draggable'),
                model = this.model;
            if (isDraggable
                && model.get('base') !== null
                && model.get('exponent') !== null) {
                // Instead of disable, just destroy it...
                this.$el.draggable('destroy');
            }
        },

        /**
        * DeActivate Drag-Drop on Base tile
        *
        * @method detachEventsOnBase
        * @public
        */
        detachEventsOnBase: function () {
            var isDraggable = this.$base.is('.ui-draggable'),
                model = this.model;
            if (isDraggable
                && this.model.get('base') !== null) {
                // Instead of disable, just destroy it...
                this.$base.draggable('destroy');
            }
        },

        /**
        * DeActivate Drag-Drop on Exponent tile
        *
        * @method detachEventsOnBase
        * @public
        */
        detachEventsOnExponent: function () {
            var isDraggable = this.$exponent.is('.ui-draggable'),
                model = this.model;
            if (isDraggable
                && this.model.get('exponent') !== null) {
                // Instead of disable, just destroy it...
                this.$exponent.draggable('destroy');
            }
        },

        onMouseOut: function (event, data) {
            this.$el.removeClass('white-border');
            this.$base.removeClass('hover-border');
            this.$exponent.removeClass('hover-border');
        },

        onTileDrop: function (event, ui) {
            var draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                numOfTiles = 1,
                rectBase = new Rect(this.$base[0].getBoundingClientRect()),
                rectExp = new Rect(this.$exponent[0].getBoundingClientRect()),
                evt = event.originalEvent ? event.originalEvent : event,
                ptMouse = new Point({ left: evt.originalEvent.clientX, top: evt.originalEvent.clientY }),
                draggedTileType = draggedTileData['tiletype'],
                binTileTypes = modelNameSpace.TileItem.BinTileType,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
                isTileFromBin = true,
                bCommandResponse = false,
                commandExitCodes = modelNameSpace.CommandFactory.EXIT_CODE,
                data = {};

            if (draggedTileData.length) {
                numOfTiles = draggedTileData.length;
            }
            this.resetGreedyChild(ui.draggable);

            this.$el.removeClass('white-border-left' + ' ' + 'white-border-right' + ' ' + 'white-border');
            this.$base.removeClass('hover-border');
            this.$exponent.removeClass('hover-border');
            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                this.$base.removeClass('hover-border')
                this.$exponent.removeClass('hover-border');
                if (draggedTile) {
                    isTileFromBin = false;
                }
                if (isTileFromBin) {
                    if (draggedTileType === binTileTypes.BASE && rectBase.isPointInRect(ptMouse)) {
                        data = { sourceTile: ui.helper, destTile: this };
                        bCommandResponse = this.equationManager.onReplaceTile(data);
                        if (bCommandResponse === commandExitCodes.SUCCESS ||
                            bCommandResponse === commandExitCodes.NO_OPERATION) {
                            ui.draggable.data('isDropped', true);
                        }
                    }
                    else if (draggedTileType === binTileTypes.EXPONENT && rectExp.isPointInRect(ptMouse)) {
                        data = { sourceTile: ui.helper, destTile: this };
                        bCommandResponse = this.equationManager.onReplaceTile(data);
                        if (bCommandResponse === commandExitCodes.SUCCESS ||
                            bCommandResponse === commandExitCodes.NO_OPERATION) {
                            ui.draggable.data('isDropped', true);
                        }
                    }
                    else if (draggedTileType === binTileTypes.PARENTHESIS) {
                        data = { sourceTile: ui.helper, index: this.parent.getIndex(this), isDestDeno: this.model.get('bDenominator') };
                        bCommandResponse = this.equationManager.onAddTile(data);
                        if (bCommandResponse) {
                            ui.draggable.data('isDropped', true);
                        }
                    }
                }
                else {
                    if (draggedTile !== this) {
                        if (draggedTileType === binTileTypes.BASE && rectBase.isPointInRect(ptMouse)) {
                            data = { sourceTile: draggedTile, destTile: this, type: draggedTileType };
                            bCommandResponse = this.equationManager.onSwapTile(data);
                            if (bCommandResponse === commandExitCodes.SUCCESS ||
                                bCommandResponse === commandExitCodes.NO_OPERATION) {
                                ui.draggable.data('isDropped', true);
                            }
                        }
                        else if (draggedTileType === binTileTypes.EXPONENT && rectExp.isPointInRect(ptMouse)) {
                            data = { sourceTile: draggedTile, destTile: this, type: draggedTileType };
                            bCommandResponse = this.equationManager.onSwapTile(data);
                            if (bCommandResponse === commandExitCodes.SUCCESS ||
                                bCommandResponse === commandExitCodes.NO_OPERATION) {
                                ui.draggable.data('isDropped', true);
                            }
                        }
                        else if (draggedTileType === binTileTypes.PARENTHESIS) {
                            data = { sourceTile: draggedTile, destTile: this, isDestDeno: this.model.get('bDenominator') };
                            bCommandResponse = this.equationManager.onShiftParenthesis(data);
                            if (bCommandResponse) {
                                ui.draggable.data('isDropped', true);
                            }
                        }
                        else if (draggedTileType === binTileTypes.MARQUEE && !this.equationManager.isTileViewInsideMarquee(this) && this.isEmpty()) {
                            data = { sourceTile: draggedTile, destTile: this, isDestDeno: this.model.get('bDenominator'), isLeft: true, numOfTiles: numOfTiles };
                            bCommandResponse = this.equationManager.onRepositionTile(data);
                            if (bCommandResponse) {
                                ui.draggable.data('isDropped', true);
                            }
                        }
                    }
                }
            }
            else {
                if (draggedTile && !this.equationManager.isTileViewInsideMarquee(this)) {
                    data = { sourceTile: draggedTile, destTile: this, numOfTiles: numOfTiles };
                    bCommandResponse = this.equationManager.onCombineTiles(data);
                    if (bCommandResponse) {
                        ui.draggable.data('isDropped', true);
                    }
                }
            }

        },

        _onOperatorChange: function (model, operator) {
            this.parent.changeOperatorArray(model, operator);
        },


        _onBaseChange: function _onBaseChange(model, base) {
            var baseValueDiv = this.$base.find('.base-value'),
                baseStr = this.getValueText('base');
            if (base === undefined || base === null || base === '') {
                baseValueDiv.html();
                this.$base.addClass('empty');
            }
            else {
                baseValueDiv.html(baseStr);
                this.$base.removeClass('empty');
            }
            if (this.equationManager.model.get('mode') === modelNameSpace.EquationManager.MODES.BuildMode) {
                this.attachEventsOnBase();
            }
        },

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

            if(this.equationManager.isZeroGlowAllowed()) {
                if (exponent === 0 && this.$exponent) {
                    this.$exponent.addClass('zero-glow');
                } else if (this.$exponent) {
                    this.$exponent.removeClass('zero-glow');
                }
            }

            if (this.equationManager.model.get('mode') === modelNameSpace.EquationManager.MODES.BuildMode) {
                this.attachEventsOnExponent();
            }
        },

        _onBaseClick: function (event) {
            if (!this.isDragging) {
                this.equationManager.onBaseClick(this);
            }
        },

        _onExponentClick: function (event) {
            if (!this.isDragging) {
                this.equationManager.onExponentClick(this);
            }
        },

        _onExponentMouseDown: function _onExponentMouseDown(event) {
            if (!this.isDragging) {
                this.$exponent.css({'top': 5, 'box-shadow': 'none'});

            }
        },
        _onExponentMouseUp: function _onExponentMouseUp(event) {
            this.$exponent.css({ 'top': '', 'box-shadow': '' });
        },

        /**
        * Refreshes the tile attributes and removes all borders
        * @method refresh
        */
        refresh: function () {
            if (this.$base) {
                this.$base.removeClass('hover-border');
            }

            if (this.$exponent) {
                this.$exponent.removeClass('hover-border');
            }
        },

        /**
        * Pushes the elements inside the marquee div to the EquationManager
        * @method getElementsInsideMarquee
        * @param {Object} Event forwarded by marquee
        * @param {Object} Marquee view
        */
        getElementsInsideMarquee: function getElementsInsideMarquee(event, $marquee) {

            if (this.isTileInMarquee($marquee)) {
                this.equationManager.pushElementToSelection(this.parent.getIndex(this), this);
            }
        },

        /**
        * Checks if the tile is inside marquee and returns true or false
        * @method isTileInMarquee
        * @param {Object} Marquee view
        * @return {Boolean} Boolean representing if the tile is inside the marquee
        */
        isTileInMarquee: function ($marquee) {
            var tileRect = new Rect(this.$el[0].getBoundingClientRect()),
                marqueeRect = new Rect($marquee[0].getBoundingClientRect()),
                middleOfTile = tileRect.getMiddle(),
                threshold = 0.5;

            // tile center has to be inside marquee the width & height of marquee
            // should be atleast half of tile
            return marqueeRect.isPointInRect(middleOfTile) &&
                   marqueeRect.getWidth() > threshold * tileRect.getWidth() &&
                   marqueeRect.getHeight() > threshold * tileRect.getHeight();
        },

        /**
        * Adds a hand cursor to the passed element.
        * @method applyHandCursorToElem
        * @param {Object} Element to apply the cursor to
        * @return {Object} Copy of ...
        */
        applyHandCursorToElem: function applyHandCursorToElem($requiredElement) {

            var self = this,
                enter = 'mouseenter',
                leave = 'mouseleave';

            $requiredElement.on(enter, function () {
                if (self.isMarqueeDrawing() ||
                    self.$el.hasClass('ui-draggable-dragging')) { return; }
                if ($(this).hasClass('empty')) { return; }
                $requiredElement.css(self._getOpenHandCss());
                if (self.$el.parents('.ui-draggable-dragging').length > 0) {
                    $requiredElement.css(self._getClosedHandCss());
                }
            });

            $requiredElement.on(leave, function () {
                if (self.isMarqueeDrawing() ||
                    self.$el.hasClass('ui-draggable-dragging')) { return; }
                $requiredElement.css(self._getDefaultCursorCss());
            });
            $requiredElement.on('mousedown', function () {
                if ($(this).hasClass('empty')) { return; }
                $requiredElement.css(self._getClosedHandCss());
                self.equationManager.trigger(viewNameSpace.EquationManager.EVENTS.TILE_MOUSE_DOWN);
            });
            $requiredElement.on('mouseup', function () {
                if ($(this).hasClass('empty')) { return; }
                $requiredElement.css(self._getOpenHandCss());
            });
        },

        /**
        * Adds a hover class to the base-exp tile item view.
        * @method addHoverClassBase
        */
        addHoverClassBase: function () {
            if (this.$base.hasClass('no-hover')) {
                return;
            }
            this.$base.addClass('hover');
        },

        /**
        * Removes a hover class from the base-exp tile item view.
        * @method addHoverClassBase
        */
        removeHoverClassBase: function () {
            if (this.$base.hasClass('no-hover')) {
                return;
            }
            this.$base.removeClass('hover');
        },

        ///**
        //* Adds a hover class to the base-exp tile item view when touch and hold.
        //* @method addHoverClassBaseTouch
        //*/
        //addHoverClassBaseTouch: function () {
        //    if (this.$base.hasClass('no-hover')) {
        //        return;
        //    }
        //    this.$base.addClass('hover');
        //},

        ///**
        //* Removes a hover class from the base-exp tile item view when touch and hold.
        //* @method removeHoverClassBaseTouch
        //*/
        //removeHoverClassBaseTouch: function () {
        //    if (this.$base.hasClass('no-hover')) {
        //        return;
        //    }
        //    this.$base.removeClass('hover');
        //},

        /**
        * Adds a closed hand cursor to the passed element
        * @method applyCloseCursorToElem
        * @param {Object} Element to apply the cursor to
        */
        applyCloseCursorToElem: function ($requiredElement) {
            var self = this;

            $requiredElement.on('mousedown', function (event) {
                if ($(event.target).hasClass('empty')) { return; }
                self.$exponent.css(self._getClosedHandCss());
                self.$base.css(self._getClosedHandCss());
            });
            $requiredElement.on('mouseup', function (event) {
                if ($(event.target).hasClass('empty')) { return; }
                self.$exponent.css(self._getOpenHandCss());
                self.$base.css(self._getOpenHandCss());
            });
        },

        _getTutorialMouseEventPoint: function _getTutorialMouseEventPoint(clickPointEnum) {
            clickPointEnum = Number(clickPointEnum);
            var tile, tileRect, top, left, height, width, offsetX = 0, offsetY = 0;

            if (clickPointEnum === -1) { // Return whole tile
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
                    // Instead of only tile, send base and exponent with it
                    element: [tile, this.$('.base')[0], this.$('.exponent')[0]]
                };
            }
            else if (clickPointEnum === 0) { // base tile center
                tile = this.$('.base')[0];
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
                tile = this.$('.exponent')[0];
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
                return viewNameSpace.BaseExpTileView.__super__._getTutorialMouseEventPoint.apply(this, arguments);
            }
        },
        getTileContentInHtmlForm: function getTileContentInHtmlForm() {
            var model = this.model,
                operator = model.get('operator'),
                base = model.get('base'),
                exponent = model.get('exponent'),
                htmlString = '', negativeTile;
            if (base < 0) {
                negativeTile = '<span class="minus-sign-base">&minus;</span>' + Math.abs(base);
            }
            if (exponent < 0) {
                exponent = '<span class="minus-sign-exponent">&minus;</span>' + Math.abs(exponent);
            }
            if (operator === '*') {
                htmlString = htmlString + '<div class=\'operator-data-tab\'><div></div></div>';
            }
            if (base < 0) {
                htmlString += '<span class=\'base-exp-data-tab\'>(' + negativeTile + ')<div class=\'exponent-data-tab\'>' + exponent + '</div>' + '</span>';
            }
            else {
                htmlString += '<span class=\'base-exp-data-tab\'>' + base + '<div class=\'exponent-data-tab\'>' + exponent + '</div>' + '</span>';
            }

            return htmlString;
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
            var binTileType = modelNameSpace.TileItem.BinTileType,
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
                this.$base.removeClass('no-hover');
                this.$exponent.removeClass('no-hover');
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
                tileView.removeClass('custom-droppable-disabled');
                if (sEnable !== 'enable') {
                    tileView.find('.inactive').removeClass('inactive');
                    tileView.addClass('custom-droppable-disabled')
                            .find('.new-created-tile')
                            .removeClass('new-created-tile');;
                }
            }
        },

        /**
        * As per given action and offset, set event on view
        *
        * @method attachEventOnView
        * @param {Number} simulateAction Simulate action enum number which is to be bind
        * @param {Number} offset Offset 0 for Base and 1 for Exponent (Only for build mode)
        * @param {String} menuIndex Menu index
        * @public
        */
        attachEventOnView: function (simulateAction, offset, menuIndex) {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
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
                    // Click
                    if (offset === 0) {
                        this.$base.on('click', $.proxy(this._onBaseClick, this));
                    }
                    else {
                        this.$exponent.on('click', $.proxy(this._onExponentClick, this));
                    }
                    break;
                case 2:
                case 8:
                    // Double Click
                    // there is no double click event on BaseExponenet tile
                    break;
                case 3:
                case 9:
                    // Drag
                    this.$el.on('mousedown', function (evt) {
                        return self._onMouseDownTile(evt);
                    });

                    this.$el.on('mouseup', function (evt) {
                        return self._onMouseUpTile(evt);
                    });
                    if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                        if (offset === 0) {
                            this.attachEventsOnBase();
                        }
                        else {
                            this.attachEventsOnExponent();
                        }
                    }
                    else if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                        if (offset === 0) {
                            this.attachEventsOnBase();
                        }
                        else if (offset === 1) {
                            this.attachEventsOnExponent();
                        }
                        else {
                            this.attachEventsOnTile();
                        }
                    }
                    break;
                case 6:
                    // Marquee
                    this.$el.on('mousedown', $.proxy(this._onMouseDownTile, this));
                    this.$el.on('mouseup', $.proxy(this._onMouseUpTile, this));
                    break;
                default:
                    console.log('Please give proper event enum');
                    break;
            }
        },

        /**
        * Disable all droppables
        * For Build mode: disable Base and Exponent
        * For Solve mode: disable whole
        *
        * @method disableTiles
        * @public
        */
        disableTiles: function () {
            var equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES;

            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
                if (this.$base.is('.ui-draggable')) {
                    this.$base.draggable('disable');
                }
                if (this.$exponent.is('.ui-draggable')) {
                    this.$exponent.draggable('disable');
                }
            }
            else if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                if (this.$el.is('.ui-draggable')) {
                    this.$el.draggable('disable');
                }
            }
            // Make dsiable whole droppable tile
            if (this.$el.is('.ui-droppable')) {
                this.$el.droppable('disable').addClass('custom-droppable-disabled')
                    .find('.new-created-tile')
                    .removeClass('new-created-tile');;
            }
            // Remove class inactive from all child components to avoid double opacity
            this.$el.find('.inactive').removeClass('inactive');
        },

        attachDetachDraggable: function attachDetachDraggable(viewCid, enable) {
            var isDraggableEnable = enable ? 'disable' : 'enable',
                isDroppableEnable = enable ? 'enable' : 'disable';

            if (this.equationManager.model.get('mode') !== modelNameSpace.EquationManager.MODES.SolveMode || this.equationManager._tutorialMode) {
                return;
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

        enableAllOperator: function () {

        },

        startAcc: function startAcc (moveForward) {
            var ele = this.$el,
                elHeight = ele.height(),
                elWidth = ele.width();
            if(/*ele.css('visibility') === 'hidden' || ele.css('display') === 'none' ||*/ elWidth === 0 || elHeight === 0) {
                return false;
            }
            if(this.equationManager.tileSelected && this.equationManager.tileSelected === this ||
               this.equationManager.isMarqueeSelectedForOp && this.equationManager.isTileViewInsideMarquee(this)) {
                if(moveForward) {
                    this.getNextTileAcc();
                }
                else {
                    this.goPreviousAcc();
                }
            }
            else {
                var elPosition = ele.position(),
                    accDiv = $('<div class="acc-be"></div>'),
                    TYPES = modelNameSpace.TileItem.BinTileType;
                accDiv.css({position: 'absolute', top: elPosition.top + 2, left: elPosition.left + 6, width: elWidth, height: elHeight, outline: '2px dotted #aaa', 'font-size': 0, 'pointer-events': 'none'});
                if(this.equationManager._tutorialMode) {
                    accDiv.text(this.getTileAccString()  + this.equationManager.tutorialCustomTileString);
                }
                else {
                    accDiv.text(this.getTileAccString());
                }
                this.parent.getContainerToAppend(this.model.get('bDenominator')).append(accDiv);
                this.accDiv = accDiv;
                this.equationManager.setCurrentAccView(this);
                accDiv.attr('tabindex', -1);
                accDiv[0].focus();
                this.accTileType = TYPES.BASE_EXPONENT;
                this.attachEventsAcc();
                this.equationManager.model.trigger('change:currentAccView');
            }
        },

        buildStartAcc: function buildStartAcc() {
            this.buildStartAccBase();
        },

        buildStartAccBase: function buildStartAccBase() {
            var ele = this.$base,
                elPosition = ele.position(),
                elHeight = ele.height(),
                elWidth = ele.width(),
                accDiv = $('<div class="acc-base"></div>'),
                TYPES = modelNameSpace.TileItem.BinTileType,
                accTextString = '';
            accDiv.css({ position: 'absolute', top: elPosition.top + 2, left: elPosition.left + 3, width: elWidth + 2, height: elHeight + 4, outline: '2px dotted #aaa', 'font-size': 0, 'pointer-events': 'none' });
            accTextString = this.getBaseAccString() + ' ' + this.getExpAccString() + ' ' + this.getParentExpAccString();
            accDiv.text(accTextString.trim());
            this.$('.base-exponent-inner').append(accDiv);
            this.equationManager.setCurrentAccView(this);
            this.accDiv = accDiv;
            accDiv.attr('tabindex', -1);
            accDiv[0].focus();
            this.accTileType = TYPES.BASE;
            this.attachEventsAcc();
            // This is necessary because sometimes the current acc view doesn't change but
            // the focus changes from base to exp or exp to base
            this.equationManager.model.trigger('change:currentAccView');
        },

        buildStartAccExp: function buildStartAccExp() {
            var ele = this.$exponent,
                elPosition = ele.position(),
                elHeight = ele.height(),
                elWidth = ele.width(),
                accDiv = $('<div class="acc-exp"></div>'),
                TYPES = modelNameSpace.TileItem.BinTileType,
                accTextString = '';
            accDiv.css({ position: 'absolute', top: elPosition.top + 2, left: elPosition.left - 4, width: elWidth + 3, height: elHeight + 4, outline: '2px dotted #aaa', 'font-size': 0, 'pointer-events': 'none' });
            accTextString = this.getExpAccString() + ' ' + this.getBaseAccString() + ' ' + this.getParentExpAccString();
            accDiv.text(accTextString.trim());
            this.$('.base-exponent-inner').append(accDiv);
            this.equationManager.setCurrentAccView(this);
            this.accDiv = accDiv;
            accDiv.attr('tabindex', -1);
            accDiv[0].focus();
            this.accTileType = TYPES.EXPONENT;
            // This is necessary because sometimes the current acc view doesn't change but
            // the focus changes from base to exp or exp to base
            this.equationManager.model.trigger('change:currentAccView');
            this.attachEventsAcc();
        },

        continueAcc: function continueAcc(index) {
            this.removeAccDiv();
            this.getNextTileAcc();
        },

        buildContinueAcc: function buildContinueAcc(index) {
            if ($(document.activeElement).hasClass('acc-base')) {
                this.removeAccDiv();
                this.buildStartAccExp();
            }
            else {
                var nextTile = this.getNextTile();
                this.removeAccDiv();
                if (nextTile != undefined) {
                    nextTile.buildStartAcc();
                }
                else {
                    this.parent.buildStartAccOnNextTile();
                }
            }
        },

        getNextTileAcc: function getNextTileAcc() {
            var nextTile = this.getNextTile();
            if (nextTile != undefined) {
                nextTile.startAcc(true);
            }
            else {
                this.parent.startAccOnNextTile();
            }
        },

        goPreviousAcc: function goPreviousAcc() {
            var prevTile = this.getPrevTile();
            this.removeAccDiv();
            if (prevTile != undefined) {
                prevTile.shiftTabHandler(false);
            }
            else {
                this.parent.shiftTabHandler(true);
            }
        },

        buildGoPreviousAcc: function buildGoPreviousAcc() {
            if ($(document.activeElement).hasClass('acc-exp')) {
                this.removeAccDiv();
                this.buildStartAccBase();
            }
            else {
                var prevTile = this.getPrevTile();
                this.removeAccDiv();
                if (prevTile != undefined) {
                    prevTile.buildShiftTabHandler(false);
                }
                else {
                    this.parent.buildShiftTabHandler(true);
                }
            }
        },

        buildFocusDecider: function buildFocusDecider() {
            this.buildStartAccExp();
        },

        shiftTabHandler: function shiftTabHandler() {
            this.startAcc(false);
        },

        buildShiftTabHandler: function buildShiftTabHandler(bool) {
            this.buildStartAccExp();
        },

        buildSpacePressed: function () {
            //this.spacePressed();
        },

        spacePressed: function spacePressed() {
            var tileSelected = this.equationManager.tileSelected,
                isMarqueeSelectedForOp = this.equationManager.isMarqueeSelectedForOp;
            if (tileSelected == null & !isMarqueeSelectedForOp) {
                this.equationManager.tileSelected = this;
                this.continueAcc();
            }
            else {
                this.removeAccDiv();
                this.accCombineTiles();
                //this.setFocus('workspace-scrollable');
                this.equationManager.solveModeSetFocusOnTooltip();
                this.equationManager.removeMarqueeAcc();
                this.equationManager.tileSelected = null;
                this.equationManager.isMarqueeSelectedForOp = false;
            }
        },

        tutorialSpacePressed: function tutorialSpacePressed (isSelected) {
            if(isSelected === -1) {
                return;
            }
            if(isSelected) {
                this.removeAccDiv();
                this.accCombineTiles();
                this.equationManager.solveModeSetFocusOnTooltip();
                this.equationManager.removeMarqueeAcc();
                this.equationManager.tileSelected = null;
                this.equationManager.isMarqueeSelectedForOp = false;
            }
            else {
                this.removeAccDiv();
                this.equationManager.tileSelected = this;
                this.$el.trigger('dragstart');
            }
        },

        removeAccDiv: function removeAccDiv() {
            if(this.accDiv) {
                this.detachEventsAcc();
                this.accDiv.remove();
            }
        },

        ctxMenuOpenHandler: function () {
            this.hideAccDiv();
        },

        ctxMenuHideHandler: function (event, ui) {
            if (event) { event.stopPropagation(); }
            this.revertFocus();
        },

        revertFocus: function () {
            var TYPES = modelNameSpace.TileItem.BinTileType;
            this.removeAccDiv();
            switch (this.accTileType) {
                case TYPES.BASE:
                    this.buildStartAccBase();
                    break;
                case TYPES.EXPONENT:
                    this.buildStartAccExp();
                    break;
                default:
                    this.startAcc();
                    break;
            }
        },

        ctxMenuSelectHandler: function ctxMenuSelectHandler(event, ui) {
            event.stopPropagation();
            var currentTargetId = ui.currentTarget.id,
                contextMenuId = parseInt(currentTargetId.substring(currentTargetId.lastIndexOf('-') + 1), 10);

            switch (contextMenuId) {
                case 0:
                    this.performAccDeleteTile();
                    break;
                case 1:
                    this.addAccParenthesis(-1);
                    break;
                case 2:
                    this.addAccParenthesis(1);
                    break;
                case 3:
                    this.removeAccParenthesis();
                    break;
                case 4:
                    this.accCombineTermsCtx(false);
                    break;
                case 5: this.accCombineTermsCtx(true);
                    break;
                case 6:
                    this.accBreakBase();
                    break;
                case 7:
                case 8:
                    this.accBreakExponent();
                    break;
                case 9:
                    this.moveAccrossVinculum();
                    break;
            }
        },

        moveAccrossVinculum: function moveAccrossVinculum () {
            var location = this.model.get('bDenominator'),
                parent = this.parent,
                TYPES = modelNameSpace.TileItem.SolveTileType,
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

        accCombineTermsCtx: function accCombineTermsCtx (location) {
            this.removeAccDiv();
            this.equationManager.tileSelected = this;
            this.equationManager.tutorialCustomTileString = '',
            this.$el.trigger('dragstart');
            this.equationManager.accCombineOnFraction(location);
        },

        accBreakBase: function accBreakBase () {
            this.removeAccDiv();
            this.$base.trigger('click');
            //this.setFocus('workspace-scrollable');
            this.equationManager.solveModeSetFocusOnTooltip();
        },

        accBreakExponent: function accBreakExponent () {
            this.removeAccDiv();
            this.$exponent.trigger('click');
            //this.setFocus('workspace-scrollable');
            this.equationManager.solveModeSetFocusOnTooltip();
        },

        performAccDeleteTile: function performAccDeleteTile() {
            var data = {};

            this.removeAccDiv();
            data.tiletype = this.accTileType;
            data.numOfTiles = 1;
            data.sourceTile = this;
            this.equationManager.onDeleteTile(data);
            this.setFocus('droppable-region');
        },

        addAccParenthesis: function addAccParenthesis(bool) {
            var data = {};
            data.sourceTile = { tileType: modelNameSpace.TileItem.BinTileType.PARENTHESIS, tilevalue: bool };
            data.index = this.parent.getIndex(this);
            data.isDestDeno = this.model.get('bDenominator');
            var result = this.equationManager.onAddTile(data, true);
            /*if(result) {
                this.setFocus('droppable-region');
            }*/
            this.equationManager.buildModeSetFocusOnTooltip();
        },

        removeAccParenthesis: function removeAccParenthesis() {
            var data = {};
            this.removeAccDiv();
            data.tiletype = modelNameSpace.TileItem.BinTileType.PARENTHESIS;
            data.numOfTiles = 1;
            data.sourceTile = this.parent;
            this.equationManager.onDeleteTile(data);
            this.setFocus('droppable-region');
        },

        accCombineTiles: function accCombineTiles () {
            var equationManager = this.equationManager,
                tileSelected = equationManager.tileSelected,
                isMarqueeSelectedForOp = equationManager.isMarqueeSelectedForOp,
                data = {};
            if (isMarqueeSelectedForOp) {
                data.sourceTile = equationManager.marqueeSelectedItems[0];
                data.numOfTiles = equationManager.marqueeSelectedItems.length;
                equationManager.removeMarqueeAcc();
            } else if (tileSelected) {
                data.sourceTile = equationManager.tileSelected;
                data.numOfTiles = 1;
            }
            data.destTile = this;
            this.equationManager.onCombineTiles(data);
        },

        getTileItemIndex: function getTileItemIndex(type) {
            var base = this.model.get('base'),
                exponent = this.model.get('exponent'), emptyTile = null;

            /*if (base === null) {
                emptyTile = 'BASE';
            }
            if (exponent === null) {
                emptyTile = 'EXPONENT';
            }
            if (base === null && exponent === null) {
                emptyTile = 'BASE_EXPONENT';
            }*/

            switch (type) {
                    case 'BASE' : {
                        emptyTile = (base === null) ? type : null;

                        break;
                    }
                    case 'EXPONENT' : {
                        emptyTile = (exponent === null) ? type : null;
                        break;
                    }

                default: {
                    emptyTile = (exponent === null && base === null) ? type : null;
                    break;
                }
            }



            return { tileIndex: this.parent.getIndex(this), emptyTile: emptyTile }
        },

        getAccString: function getAccString() {
            var currentString = '',
                TYPES = modelNameSpace.TileItem.SolveTileType,
                model = this.model,
                base = model.get('base'),
                exp = model.get('exponent');
            if (model.get('operator')) {
                currentString = this.getMessage('base-exp-pair', 2);
            }
            else if(this.parent.model.get('type') === TYPES.FRACTION && model.get('bDenominator')) {
                currentString = this.getMessage('base-exp-pair', 1);
            }
            currentString = currentString + ' ' + this.getMessage('base-exp-pair', 0, [base ? base : this.getMessage('base-exp-pair', 4), exp !== null ? exp : this.getMessage('base-exp-pair', 4)]);
            return ' ' + currentString.trim();
        },

        /**
        * Returns the acc string for this particular tile i.e. for 5^4 it'll return
        * 'five raised to four'.
        * NOTE: This doesn't return anything unrelated to this tile.
        * @method getSelfAccString
        * @return {String} Acc string for this tile.
        */
        getSelfAccString: function () {
            var base = this.model.get('base'),
                exp = this.model.get('exponent');

            return this.getMessage('base-exp-pair', 0, [base ? base : this.getMessage('base-exp-pair', 4), exp !== null ? exp : this.getMessage('base-exp-pair', 4)]);
        },

        getBaseAccString: function getBaseAccString () {
            var base = this.model.get('base');
            return this.getMessage('base-exp-pair', 8, [base ? base : this.getMessage('base-exp-pair', 4)]);
        },

        getExpAccString: function getExpAccString () {
            var exp = this.model.get('exponent');
            return this.getMessage('base-exp-pair', 9, [exp !== null ? exp : this.getMessage('base-exp-pair', 4)]);
        },

        getParentExpAccString: function getParentExpAccString () {
            var TYPES = modelNameSpace.TileItem.SolveTileType,
                parModel = this.parent.model;

            if(parModel.get('type') === TYPES.PARENTHESIS) {
                return this.parent.getExpAccString();
            }
            return '';
        },

        getOperatorAccString: function getOperatorAccString () {
            if(this.model.get('operator')) {
                return this.getMessage('base-exp-pair', 2);
            }
            return '';
        },

        getTileAccString: function getTileAccString () {
            var TYPES = modelNameSpace.TileItem.SolveTileType,
                parModel = this.parent.model,
                accStr = '';

            accStr = this.getMessage('base-exp-pair', 0, [this.model.get('base'), this.model.get('exponent')]);

            if(parModel.get('type') === TYPES.PARENTHESIS) {
                if(this.parent.arrTileViews.length === 1) {
                    accStr += ' ' + this.getMessage('base-exp-pair', 19);
                }
                else {
                    accStr += ' ' + this.getMessage('base-exp-pair', 18);
                }
            }
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
            return accStr;
        },

        isPresentAsParent: function isPresentAsParent () {
            return this.parent.isPresentAsParent();
        }
    });

})();
