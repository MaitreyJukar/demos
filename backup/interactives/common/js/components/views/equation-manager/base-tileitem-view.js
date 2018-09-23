(function () {
    'use strict';

    var viewNameSpace = MathInteractives.Common.Components.Views.EquationManager,
        modelNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point,
        scroll = viewNameSpace.TileView.scroll;
    /**
    * BaseTileView represents view for BASE_ONLY type tile view.
    *
    * @class BaseTileView
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManager.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewNameSpace.BaseTileView = viewNameSpace.TileView.extend({

        initialize: function () {
            viewNameSpace.BaseTileView.__super__.initialize.apply(this, arguments);
        },

        render: function () {
        },

        events: {
            'mouseenter .base-container': 'addHoverClassBase',
            'mouseleave .base-container': 'removeHoverClassBase'
        },

        createView: function () {
            var classes = viewNameSpace.TileView.CLASSES, $accBase,
                $template = null,
                templateString = null,
                baseValue = this.model.get('base'),
                basStr = this.getValueText('base'),
                binTileTypes = modelNameSpace.TileItem.BinTileType;

            templateString = MathInteractives.Common.Components.templates['baseTile']({
                'base': basStr,
                'base-class': classes.BASE,
                'baseTileType': binTileTypes.BASE_ONLY,
                'idPrefix': this.idPrefix,
                'level': classes.Level + this.getLevel()
            });
            $template = $(templateString);


            this.$base = $template.find('.base-container');

            if (baseValue === null || baseValue === undefined || baseValue === '') {
                this.$base.addClass('empty');
            }
            this.$el.append($template)
            .addClass(classes.TermContainer)
            .addClass(classes.BASE_ONLY)
            .addClass(classes.Level + this.getLevel())
            .attr('data-tiletype', binTileTypes.BASE_ONLY);

            if (!this.model.get('isDraggable')) {
                this.$el.find('.box').hide();
            }

            if (this.model.get('ignoreMarquee')) {
                this.$el.addClass('ignore-marquee');
                this.$el.addClass('lone-one');
            }

            return this.$el;
        },

        isEmpty: function () {
            var model = this.model;
            if (model.get('base') === null) {
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

        stopListeningEvents: function (bRecursive) {
            this.stopListening();
        },

        attachEvents: function () {
            var self = this,
                equationManagerMode = this.equationManager.model.get('mode'),
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES,
                tileTypes = modelNameSpace.BaseExpTile.TILE_TYPES,
                originalBaseValue = this.model.get('base');

            if ($.support.touch) {
                if (this.equationManager.isTouch()) {
                    delete this.events['mouseenter .base-container'];
                    delete this.events['mouseleave .base-container'];
                    this.delegateEvents(this.events);
                }

                MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$base, 600, this.addHoverClassBase, this.removeHoverClassBase, 'base-hold');
                this._touchStartHandler = $.proxy(this._onTouchStart, this);
                this._touchEndHandler = $.proxy(this._onTouchEnd, this);
                this.el.addEventListener('touchstart', this._touchStartHandler, false);
            }

            this.applyHandCursorToElem(this.$base);
            this.listenTo(this.model, 'change:operator', this._onOperatorChange);
            this.listenTo(this.model, 'change:base', this._onBaseChange);

            this.$el.on('mousedown', function (evt) {
                return self._onMouseDownTile(evt);
            });

            this.$el.on('mouseup', function (evt) {
                return self._onMouseUpTile(evt);
            });

            this.attachEventsOnTile();

            if (this.model.get('isDroppable')) {
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
            }
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
                isDraggable = this.$el.is('.ui-draggable'),
                EVENTS = viewNameSpace.EquationManager.EVENTS;

            if (!this.model.get('isDraggable')) { return; }
            if (this.model.get('base') !== null) {
                if (!isDraggable) {
                    this.$el.draggable({
                        scroll: scroll.ENABLE,
                        scrollSensitivity: scroll.SENSITIVITY,
                        distance: 10,
                        scrollSpeed: scroll.SPEED,
                        revert: function (event) {
                            //self.equationManager.showHideOverlayDiv(true);
                            self.equationManager.trigger(EVENTS.REVERT_START);
                            return true; // Always return true else it will call stop method first and onclick after. This will cause break-base to be fired.
                        },
                        zIndex: 1,
                        helper: 'original',
                        containment: self.equationManager.$draggableContainment,
                        cursorAt: { left: this.$el.width() / 2, top: this.$el.height() / 2 },
                        start: function (event, ui) {
                            self.equationManager.equationView.attachDetachDraggable(self.cid, true);
                            self.isDragging = true;
                            ui.helper.addClass('current-draggable');
                            ui.helper.data({ 'cur-draggable': self });
                            if (!self.equationManager.marqueeView.isDisabled) {
                                self.disablingMarquee = true;
                                self.equationManager.marqueeView.disableMarquee();
                            }
                            self.equationManager.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                        },
                        drag: function (event, ui) {
                            var droppable = $(this).data('cur-droppable');
                            if (droppable) {
                                droppable.onMouseOver(event, ui);
                            }
                        },
                        stop: function (event, ui) {
                            self.equationManager.equationView.attachDetachDraggable(self.cid, false);
                            self.equationManager.trigger(EVENTS.REVERT_END);
                            var $this = $(this);
                            self.isDragging = false;
                            ui.helper.removeData(['cur-draggable', 'cur-droppable']);
                            $this.removeClass('current-draggable');
                            self.equationManager.resetContainment();
                            if (self.disablingMarquee) {
                                self.equationManager.marqueeView.enableMarquee();
                                self.disablingMarquee = false;
                            }
                            //self.equationManager.showHideOverlayDiv(false);
                            self.equationManager.refresh();
                            self.equationManager.setIsDropped(false);
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
            $.fn.EnableTouch(this.$el);

        },

        onMouseOver: function (event, ui) {
            this.equationManager.registerMouseOverTile(this, event, ui);
            this.$el.removeClass('white-border-left' + ' ' + 'white-border-right');
            this.$base.addClass('hover-border');
        },

        onMouseOut: function (event, data) {
            this.$el.removeClass('white-border');
            this.$base.removeClass('hover-border');
        },

        /**
        * Handler for MouseDown on whole tile
        *
        * @method _onMouseDownTile
        * @param {Object} evt Mouse event
        * @private
        */
        _onMouseDownTile: function (evt) {
            var isDraggable = this.$el.is('.ui-draggable'),
                rect = new Rect(this.el.getBoundingClientRect()),
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY });

            this.equationManager.adjustContainment(this.$el);
            // don't propagate the event only if the click is on the exponent or the base
            // propagate otherwise so marquee can handle it
            if (rect.isPointInRect(ptMouse)) {
                evt.stopPropagation();
                evt.preventDefault();
                this.equationManager.removeMarquee();
                this.attachEventsOnTile();
                return false;
            }
            isDraggable && this.$el.draggable('disable');
        },

        /**
        * Handler for MouseUp on whole tile
        *
        * @method _onMouseUpTile
        * @param {Object} evt Mouse event
        * @private
        */
        _onMouseUpTile: function (evt) {
            //this.equationManager.showMarquee();
            this.equationManager.resetContainment();
            this.attachEventsOnTile();
        },

        /**
        * Handler for touch start
        * @method _onTouchStart
        * @private
        * @param {Object} Event object
        */
        _onTouchStart: function (event) {
            var touches = event.changedTouches,
                first = touches[0],
                mouseenterEvt = $.Event('mouseenter');
            $(first.target).trigger(mouseenterEvt);
            this.el.addEventListener('touchend', this._touchEndHandler, false);
            event.stopPropagation && event.stopPropagation();
            event.preventDefault && event.preventDefault();
        },

        /**
        * Handler for touch start
        * @method _onTouchStart
        * @private
        * @param {Object} Event object
        */
        _onTouchEnd: function (event) {
            var touches = event.changedTouches,
                first = touches[0],
                mouseleaveEvt = $.Event('mouseleave');
            $(first.target).trigger(mouseleaveEvt);
            this.el.removeEventListener('touchend', this._touchEndHandler, false);
            event.stopPropagation && event.stopPropagation();
            event.preventDefault && event.preventDefault();
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
            this.$el.off('mousedown');
            this.$el.off('mouseup');
            this.$el.addClass('no-hover');
            if (equationManagerMode === equationManagerModeTypes.SolveMode) {
                this.detachEventsOnTile();
            }
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
                && model.get('base') !== null) {
                // Instead of disable, just destroy it...
                this.$el.draggable('destroy');
            }
        },

        onTileDrop: function (event, ui) {
            var draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                numOfTiles = 1,
                rect = new Rect(this.el.getBoundingClientRect()),
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
            this.$el.removeClass('white-border-left' + ' ' + 'white-border-right' + ' ' + 'hover-border');
            this.$base.removeClass('hover-border');
            if (equationManagerMode === equationManagerModeTypes.BuildMode) {
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
            this.attachEventsOnTile();
        },

        /**
        * Refreshes the tile attributes and removes all borders
        * @method refresh
        */
        refresh: function () {
            if (this.$base) {
                this.$base.removeClass('hover-border');
            }
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
                middleOfTile = null,
                i = 0,
                rect;

            rect = new MathInteractives.Common.Utilities.Models.Rect(this.el.getBoundingClientRect());
            middleOfTile = rect.getMiddle();

            if (marqueeRect.isPointInRect(middleOfTile)) {
                this.equationManager.pushElementToSelection(this.parent.getIndex(this), this);
            }


        },

        /**
        * Adds a hover class to the Base div
        * @method addHoverClassBase
        */
        addHoverClassBase: function () {
            if (!this.model.isOne() && !this.$el.hasClass('no-hover')) {
                this.$base.addClass('hover');
            }
        },

        /**
        * Remove a hover class from the Base div
        * @method addHoverClassBase
        */
        removeHoverClassBase: function () {
            if (!this.model.isOne() && !this.$el.hasClass('no-hover')) {
                this.$base.removeClass('hover');
            }
        },

        /**
        * Applies hand cursor to the elem on mouseenter, mouseleave, mousedown & mouseup
        * @method applyHandCursorToElem
        * @private
        * @param {Object} The element to which hand cursor is to be applied
        */
        applyHandCursorToElem: function applyHandCursorToElem($requiredElement) {

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
            $requiredElement.on(enter, function () {
                if (self.model.isOne()) { return; }
                if (self.isMarqueeDrawing() || self.$el.hasClass('ui-draggable-dragging')) { return; }
                if ($(this).hasClass('empty')) { return; }
                $requiredElement.css(self._getOpenHandCss());
            });

            $requiredElement.on(leave, function () {
                if (self.model.isOne()) { return; }
                if (self.isMarqueeDrawing() || self.$el.hasClass('ui-draggable-dragging')) { return; }
                $requiredElement.css(self._getDefaultCursorCss());
            });
            $requiredElement.on('mousedown', function () {
                if (self.model.isOne()) { return; }
                if ($(this).hasClass('empty')) { return; }
                $requiredElement.css(self._getClosedHandCss());
                self.equationManager.trigger(viewNameSpace.EquationManager.EVENTS.TILE_MOUSE_DOWN);
            });
            $requiredElement.on('mouseup', function () {
                if (self.model.isOne()) { return; }
                if ($(this).hasClass('empty')) { return; }
                $requiredElement.css(self._getOpenHandCss());
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
                htmlString = '',
                baseVal = base;
            if (baseVal < 0) {
                base = '<span class="minus-sign-base">&minus;</span>' + Math.abs(baseVal);
            }
            if (operator === '*') {
                htmlString = htmlString + '<div class=\'operator-data-tab\'><div></div></div>';
            }
            if(baseVal < 0) {
                htmlString += '<span class=\'base-exp-data-tab\'>(' + base + ')</span>';
            }
            else {
                htmlString += '<span class=\'base-exp-data-tab\'>' + base + '</span>';
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
            var sEnable = enable ? 'enable' : 'disable',
                tileView = this.$el;

            if (isDraggable) {
                if (tileView.is('.ui-draggable')) {
                    tileView.draggable(sEnable);
                }
                tileView.removeClass('custom-droppable-disabled');
                tileView.find('.inactive').removeClass('inactive');
            }
            if (enable) tileView.removeClass('no-hover');
        },

        /**
        * Disable all droppables
        * Call base method disable all class
        * Remove custom-droppable-disabled class and add inactive class
        *
        * @method disableTiles
        * @public
        */
        disableTiles: function (bRecursive) {
            viewNameSpace.BaseTileView.__super__.disableTiles.apply(this, arguments);
            // Remove class
            this.$el.removeClass('custom-droppable-disabled');

            // Add inactive class to base and exponent child
            this.$base.removeClass('inactive').addClass('inactive').removeClass('new-created-tile');
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
                equationManagerModeTypes = modelNameSpace.EquationManager.MODES;

            if ($.support.touch) {
                this._touchStartHandler = $.proxy(this._onTouchStart, this);
                this._touchEndHandler = $.proxy(this._onTouchEnd, this);
                this.el.addEventListener('touchstart', this._touchStartHandler, false);
            }

            switch (simulateAction) {
                case 1:
                case 2:
                case 8:
                    // Double Click
                    // there is no double click event on BaseExponenet tile
                    break;
                case 3:
                case 9:
                    // Drag
                    this.$el.on('mousedown', $.proxy(this._onMouseDownTile, this));
                    this.$el.on('mouseup', $.proxy(this._onMouseUpTile, this));
                    this.attachEventsOnTile();
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

        attachDetachDraggable: function attachDetachDraggable(viewCid, enable) {

            if (this.equationManager.model.get('mode') !== modelNameSpace.EquationManager.MODES.SolveMode || this.equationManager._tutorialMode) {
                return;
            }
            var isDraggableEnable = enable ? 'disable' : 'enable',
                isDroppableEnable = enable ? 'enable' : 'disable';

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
            if(/*this.$el.css('visibility') === 'hidden' || this.$el.css('display') === 'none' || */this.$el.width() === 0 || this.$el.height() === 0) {
                return;
            }
            if (this.equationManager.tileSelected && this.equationManager.tileSelected === this ||
                this.equationManager.isMarqueeSelectedForOp && this.equationManager.isTileViewInsideMarquee(this)) {
                if(moveForward) {
                    this.getNextTileAcc();
                }
                else {
                    this.goPreviousAcc();
                }
            }
            else {
                var ele = this.$('.base-container'),
                    elPosition = ele.position(),
                    elHeight = ele.height(),
                    elWidth = ele.width(),
                    accDiv = $('<div class="acc-bo"></div>');
                accDiv.css({position: 'absolute', top: elPosition.top + 2, left: elPosition.left + 3, width: elWidth + 2, height: elHeight + 4, outline: '2px dotted #aaa', 'font-size': 0, 'pointer-events': 'none'});
                if(this.equationManager._tutorialMode) {
                    accDiv.text(this.getTileAccString()  + this.equationManager.tutorialCustomTileString);
                }
                else {
                    accDiv.text(this.getTileAccString());
                }
                this.$('.base-inner').append(accDiv);
                //this.parent.getContainerToAppend(this.model.get('bDenominator')).append(accDiv);
                this.accDiv = accDiv;
                this.equationManager.setCurrentAccView(this);
                accDiv.attr('tabindex', -1);
                accDiv[0].focus();
                this.attachEventsAcc();
                this.equationManager.model.trigger('change:currentAccView');
            }
        },

        continueAcc: function continueAcc () {
            this.removeAccDiv();
            this.getNextTileAcc();
        },

        getNextTileAcc: function getNextTileAcc () {
            var nextTile = this.getNextTile();
            if(nextTile != undefined) {
                nextTile.startAcc(true);
            }
            else {
                this.parent.startAccOnNextTile();
            }
        },

        goPreviousAcc : function goPreviousAcc () {
            var prevTile = this.getPrevTile();
            this.removeAccDiv();
            if(prevTile != undefined) {
                prevTile.shiftTabHandler(false);
            }
            else {
                this.parent.shiftTabHandler(true);
            }
        },

        buildFocusDecider: function buildFocusDecider () {
            this.buildStartAcc();
        },

        shiftTabHandler: function shiftTabHandler () {
            this.startAcc(false);
        },

        buildShiftTabHandler: function buildShiftTabHandler (bool) {
            this.buildStartAcc();
        },

        buildSpacePressed: function buildSpacePressed () {
            //this.spacePressed();
        },

        spacePressed: function spacePressed () {
            var tileSelected = this.equationManager.tileSelected,
                isMarqueeSelectedForOp =  this.equationManager.isMarqueeSelectedForOp;
            if(this.model.get('isDraggable')) {
                if (tileSelected == null && !isMarqueeSelectedForOp) {
                    this.equationManager.tileSelected = this;
                    this.continueAcc();
                }
                else {
                    this.removeAccDiv();
                    this.accCombineTiles()
                    //this.setFocus('workspace-scrollable');
                    this.equationManager.solveModeSetFocusOnTooltip();
                    this.equationManager.isMarqueeSelectedForOp = false;
                    this.equationManager.tileSelected = null;
                }
            }
            else if(tileSelected != null) {
                this.removeAccDiv();
                this.equationManager.removeMarqueeAcc();
                this.equationManager.solveModeSetFocusOnTooltip();
                this.equationManager.isMarqueeSelectedForOp = false;
                this.equationManager.tileSelected = null;
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
            if (this.accDiv) {
                this.detachEventsAcc();
                this.accDiv.remove();
            }
        },

        revertFocus: function () {
            this.removeAccDiv();
            this.startAcc();
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
            equationManager.onCombineTiles(data);
        },

        ctxMenuOpenHandler: function () {
            this.hideAccDiv();
        },

        ctxMenuHideHandler: function (event, ui) {
            if (event) { event.stopPropagation(); }
            this.revertFocus();
        },

        ctxMenuSelectHandler: function ctxMenuSelectHandler(event, ui) {
            event.stopPropagation();
            var currentTargetId = ui.currentTarget.id,
                contextMenuId = parseInt(currentTargetId.substring(currentTargetId.lastIndexOf('-') + 1), 10);

            switch (contextMenuId) {
                case 4:
                    this.accCombineTermsCtx(false);
                    break;
                case 5: this.accCombineTermsCtx(true);
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
            this.equationManager.accCombineOnFraction(location);
        },

        getAccString: function getAccString (whichTab) {
            var currentString = '',
                TYPES = modelNameSpace.TileItem.SolveTileType;
            if (this.model.get('operator')) {
                currentString = this.getMessage('base-exp-pair', 2);
            }
            else if(this.parent.model.get('type') === TYPES.FRACTION && this.model.get('bDenominator')) {
                currentString = this.getMessage('base-exp-pair', 1);
            }
            currentString = currentString + ' ' + this.model.get('base');
            return ' ' + currentString.trim();
        },

        /**
        * Returns the acc string for this particular tile i.e. for 5 it'll return 'five'
        * NOTE: This doesn't return anything unrelated to this tile.
        * @method getSelfAccString
        * @return {String} Acc string for this tile.
        */
        getSelfAccString: function () {
            if(this.model.get('isDraggable')) {
                return this.model.get('base');
            }
            return this.model.get('base') + ' ' + this.getAccMessage('base-exp-pair', 28);
        },

        getTileAccString: function getTileAccString () {
            var TYPES = modelNameSpace.TileItem.SolveTileType,
                parModel = this.parent.model,
                accStr = '';

            if(this.model.get('isDraggable')) {
                accStr = this.model.get('base');
            }
            else {
                accStr = this.model.get('base') + '. ' + this.getAccMessage('base-exp-pair', 28);
            }

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
