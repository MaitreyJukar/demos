(function () {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        viewClassNamespace = MathInteractives.Common.Components.Views.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point;

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
        arrTileViews: null,
        $arrOperatorViews: null,
        equationManager: null,
        parent: null,
        isDragging: false,
        level: null,
        getLevel: function () { return this.level; },
        setLevel: function (value, bTrigger) {
            if (value !== this.level) {
                var preLevel = this.level;
                this.level = value;
                if (bTrigger) {
                    this.onLevelChange(preLevel);
                }
            }
        },

        $base: null,
        $exponent: null,

        curHoveredTile: null,
        isTileDelete: false,

        initialize: function () {
            var options = this.options;
            this.player = options.player;
            this.filePath = options.filePath;
            this.manager = options.manager;
            this.idPrefix = options.idPrefix;
            this.parent = options.parent;
            this.equationManager = this.options.equationManager;
            this.curHoveredTile = null;
            if (this.parent !== null && this.parent !== undefined) {
                this.setLevel(this.parent.getLevel() + 1);
            }
            this.render();
        },

        render: function () {
            throw new Error('Render not implemented');
        },

        createView: function () {
            throw new Error('createView not implemented');
        },

        getIndex: function (view) {
            var childIndex = this.arrTileViews.indexOf(view);
            return this.parent.getIndex(this) + '.' + childIndex;
        },

        stopListeningEvents: function (bRecursive) {
            if (bRecursive) {
                for (var i = 0; i < this.arrTileViews.length; i++) {
                    this.arrTileViews[i].stopListeningEvents(true);
                }
            }
            this.stopListening();
        },

        getViewFromIndex: function getViewFromIndex(indexString) {
            var toIndex = indexString.indexOf('.'),
                subStr;

            toIndex = toIndex === -1 ? this.arrTileViews.length : toIndex;
            subStr = parseInt(indexString.substring(0, toIndex));
            if (indexString.length > 1) {
                indexString = indexString.substring(toIndex+1, indexString.length);
                if(indexString === "") {
                    return this.arrTileViews[subStr];
                }
                return this.arrTileViews[subStr].getViewFromIndex(indexString);
            }
            else {
                return this.arrTileViews[subStr];
            }
        },

        getTreeHeight: function () {
            return 1;
        },

        hasChildView: function (tileView, bRecursive) {
            var tileViews = this.arrTileViews,
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
        
        /**
        * Returns all the child views including itself.
        * @method getChildViews
        * @return {Array} List of all child views including itself.
        */
        getChildViews: function () {
            var children = [this],
                i = 0;
            if (this.arrTileViews && this.arrTileViews.length > 0) {
                for (i = 0; i < this.arrTileViews.length; i++) {
                    Array.prototype.push.apply(children, this.arrTileViews[i].getChildViews());
                }
            }
            return _.uniq(children);
        },

        refresh: function () {
            var tileViews = this.arrTileViews,
                i = 0;
            if (tileViews) {
                for (i = 0; i < tileViews.length; i++) {
                    tileViews[i].refresh();
                }
            }
        },

        isEmptyInView: function () {
            return false;
        },

        fillRects: function () {
            this.model.set('rectTerm', new Rect({ left: 0, top: 0, width: 0, height: 0 }));
            this.model.set('rectBase', new Rect({ left: 0, top: 0, width: 0, height: 0 }));
            this.model.set('rectExponent', new Rect({ left: 0, top: 0, width: 0, height: 0 }));
        },

        changeOperatorArray: function (model, operator) {
            var parentCollection, index, $operatorChild,
				currentView;
            parentCollection = this.model.get('tileArray');
            index = parentCollection.indexOf(model);
            currentView = this.$arrOperatorViews[index];

            if (currentView) {
                currentView.remove();
                currentView.off();
            }

            $operatorChild = this.createOperator(model.get('operator'));
            if ($operatorChild !== null) {
                $operatorChild.insertBefore(this.arrTileViews[index].el);
                this.$arrOperatorViews[index] = $operatorChild;
            }
        },

        onLevelChange: function (preLevel) {
            throw new Error('Not Implemented onLevelChange');
        },

        attachEvents: function () {

        },

        attachEventsAcc: function () {
            var ContextMenu = MathInteractives.global.ContextMenu,
                CTXMENU_EVENTS = {
                    HIDE: ContextMenu.CONTEXTMENU_HIDE,
                    OPEN: ContextMenu.CONTEXTMENU_OPEN,
                    SELECT: ContextMenu.CONTEXTMENU_SELECT
                };
            this.accDiv.off(CTXMENU_EVENTS.HIDE).on(CTXMENU_EVENTS.HIDE, $.proxy(this.ctxMenuHideHandler, this));
            this.accDiv.off(CTXMENU_EVENTS.OPEN).on(CTXMENU_EVENTS.OPEN, $.proxy(this.ctxMenuOpenHandler, this));
            this.accDiv.off(CTXMENU_EVENTS.SELECT).on(CTXMENU_EVENTS.SELECT, $.proxy(this.ctxMenuSelectHandler, this));
        },

        detachEventsAcc: function () {
            this.accDiv.off(MathInteractives.global.ContextMenu.CONTEXTMENU_HIDE);
            this.accDiv.off(MathInteractives.global.ContextMenu.CONTEXTMENU_OPEN);
        },

        ctxMenuHideHandler: function (event, ui) {
            //var ContextMenu = MathInteractives.global.ContextMenu,
            //    CTXMENU_EVENTS = {
            //        HIDE: ContextMenu.CONTEXTMENU_HIDE
            //    };

            ////if (this.equationManager) {
            ////    this.equationManager.trigger(CTXMENU_EVENTS.HIDE, event, ui);
            ////}
        },

        ctxMenuOpenHandler: function (event, ui) {

        },

        resetGreedyChild: function (element) {
            // PATCH
            // JQuery UI bug : http://bugs.jqueryui.com/ticket/10111
            // Solution : https://github.com/Mdonmounts/jquery-ui/blob/4e710037243026f37d51f161ac923ed63b8458bb/ui/droppable.js
            var elm = element || this.$el,
                scope = elm.draggable('option').scope,
                arrDroppables = ($.ui.ddmanager.droppables[scope] || []).slice();
            $.each(arrDroppables, function () {
                if (this.greedyChild) {
                    this.greedyChild = false;
                }
            });
        },

        setGreedyChilds: function (element) {
            // PATCH
            // JQuery UI bug : http://bugs.jqueryui.com/ticket/9337
            // Solution : http://bugs.jqueryui.com/ticket/9337
            // Not in use now
            var elm = element || this.$el,
             scope = elm.droppable('option').scope,
             arrDroppables = ($.ui.ddmanager.droppables[scope] || []);
            for (var i = 0; i < arrDroppables.length; i++) {
                if ($.contains(arrDroppables[i].element[0], elm[0])) {
                    arrDroppables[i].greedyChild = true;
                }
            }
            //$.each(arrDroppables, function () {
            //    this.greedyChild = true;
            //});
        },

        onMouseDown: function onMouseDown(event) {
            var ptMouse = new Point({ left: event.clientX, top: event.clientY }),
                rect = null,
                tileViews = this.arrTileViews || null, i = 0;

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
            return false;
        },

        onMouseUp: function onMouseUp(event) {
            this.$el.draggable('enable');
        },


        onMouseOver: function (event, ui) {
            var tileViews = this.arrTileViews, i = 0,
                mulThresold = modelClassNameSpace.TileItem.MultiplicationThresold,
                addThresold = modelClassNameSpace.TileItem.AdditionThresold,
                evt = event.originalEvent,
                ptMouse = new Point({ left: evt.clientX, top: evt.clientY }),
                rect = null,
                hoveredTile = null,
                draggedTile = ui.helper.data('cur-draggable');

            this.equationManager.registerMouseOverTile(this, event, ui);

            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
            }

            for (i = 0; i < tileViews.length; i++) {
                if (tileViews[i] === draggedTile) {
                    continue;
                }
                rect = new Rect(tileViews[i].el.getBoundingClientRect());
                rect = rect.inflateRect(mulThresold, 0);
                if (rect.isPointInRect(ptMouse)) {
                    hoveredTile = tileViews[i];
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
                        hoveredTile = tileViews[i];
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
                //if (tileViews.indexOf(draggedTile) === -1) {
                this.$el.removeClass('white-border-left white-border-right').addClass('white-border');
                //}
                //else {
                //this.$el.removeClass('white-border-left white-border-right white-border');
                //}
                this.curHoveredTile = null;
            }
        },

        onMouseOut: function (event, ui) {
            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
            }
            this.$el.removeClass('white-border-left white-border-right white-border');
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
                draggedTile = ui.helper.data('cur-draggable'),
               //draggableParent = ui.helper.data('draggable-parent'),
               length = ui.helper.data('length'),
               sourceIndex /*= draggedTile.parent.getIndex(draggedTile)*/,
               isSourceDeno /*= draggedTile.model.get('bDenominator')*/,
               isDestDeno /*=  this.model.get('bDenominator') */,
               countTiles = 1, parentIndex;

            if (length) {
                countTiles = length;
            }

            if (this.curHoveredTile) {
                this.curHoveredTile.$el.removeClass('white-border-left white-border-right white-border');
            }

            for (i = 0; i < tileViews.length; i++) {
                if (tileViews[i] === draggedTile) {
                    continue;
                }
                rect = new Rect(tileViews[i].el.getBoundingClientRect());
                rect = rect.inflateRect(mulThresold, 0);
                if (rect.isPointInRect(ptMouse)) {
                    droppedTile = tileViews[i];
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
                        droppedTile = tileViews[i];
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

            this.$el.removeClass('white-border-left white-border-right white-border');
            this.curHoveredTile = null;

            if (droppedTile !== null) {
                //if (draggedTile.$el === undefined) {
                //    parentIndex = this.getIndex(droppedTile);
                //   if (draggableParent) {
                //        parentIndex = draggableParent.parent.getIndex(draggableParent);
                //        isSourceDeno = draggableParent.model.get('bDenominator');
                //    }
                //    this.equationManager.onRepositionTile(sourceIndex, isDestDeno, parentIndex + index, draggedTile, parentIndex, isSourceDeno);
                //}
                //else {
                sourceIndex = draggedTile.parent.getIndex(draggedTile);
                isSourceDeno = draggedTile.model.get('bDenominator');
                isDestDeno = this.model.get('bDenominator');
                this.equationManager.onRepositionTile(sourceIndex, isSourceDeno, this.parent.getIndex(this) + '.' + index, isDestDeno, countTiles, strOperator);
                //}
            }
            else {
                this.equationManager.onCombineTiles(draggedTile, this, countTiles);
            }

        },

        getOperatorFromTileItem: function getOperatorFromTileItem(itemView) {
            if (this.arrTileViews) {
                var index = this.arrTileViews.indexOf(itemView);
                return this.$arrOperatorViews[index];
            }
            return null;
        },

        /**
        * Used to check if marquee drawing is in progress.
        * @method isMarqueeDrawing
        * @return {Boolean} Boolean whether marquee drawing is in progress
        */
        isMarqueeDrawing: function () {
            return this.equationManager.marqueeView.isDrawing;
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
            if (val !== null && val !== undefined) {
                return val < 0 ? '&minus;' + Math.abs(val) : val.toString();
            } else {
                return val;
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
            var minus = '−';      // Unicode Character 'MINUS SIGN' (U+2212)
            if (text.indexOf(minus) === -1) {
                return minus + text;
            } else {
                return text.substr(minus.length);
            }
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
            return { 'cursor': 'default' };
        },

        _getTutorialMouseEventPoint: function _getTutorialMouseEventPoint(clickPointEnum) {
            clickPointEnum = Number(clickPointEnum);
            var tile = this.el,
                tileRect = tile.getBoundingClientRect(),
                top = tileRect.top,
                left = tileRect.left,
                height = tileRect.height,
                width = tileRect.width,
                offsetX = 0,
                offsetY = 0;
            var temp = 10;
            switch (clickPointEnum) {
                case 2: // tile left
                    offsetX -= temp;
                    offsetY += height / 2;
                    break;
                case 3: // tile right
                    offsetX += width + temp;
                    offsetY += height / 2;
                    break;
                case 4: // tile top
                    offsetX += width / 2;
                    offsetY -= temp;
                    break;
                case 5: // tile bottom
                    offsetX += width / 2;
                    offsetY += height + temp;
                    break;
                case 6: // tile top left
                    offsetX -= temp - 1;
                    offsetY -= temp - 1;
                    break;
                case 7: // tile bottom right
                    offsetY += height + temp - 1;
                    offsetX += width + temp - 1;
                    break;
            }
            return {
                //point: { x: left + offsetX, y: top + offsetY },
                offset: { x: offsetX, y: offsetY },
                element: tile
            };
        },

        /**
        * Disabled itself and/or all child droppables
        *
        * @method disableTiles
        * @param {Boolean} bRecursive True if recursively disables all droppables
        */
        disableTiles: function disableTiles(bRecursive) {
            var tilesView = this.arrTileViews,
                child,
                childOperator,
                length = 0;
            if (tilesView) {
                length = tilesView.length;
            }
            if (length > 0
                && bRecursive) {
                for (var i = 0; i < length; i++) {
                    child = tilesView[i];
                    child.disableTiles(bRecursive);
                    childOperator = this.getOperatorFromTileItem(child);
                    if (childOperator) {
                        childOperator.addClass('disabled_operator');
                    }
                }
            }
            else if (this.$el.is('.ui-droppable')) {
                this.$el.droppable('disable')
                    .addClass('custom-droppable-disabled')
                    .find('.new-created-tile')
                    .removeClass('new-created-tile');
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
                    if (tileView.$exponent) {
                        isDraggable = tileView.$exponent.is('.ui-draggable');
                    }
                    else {
                        isDraggable = true;
                    }
                    tileView._enableDisableTile(arrElmIndex[1], enable, isDraggable);
                    // If view contains any operator, remove disable class
                    childOperator = this.getOperatorFromTileItem(tileView);
                    if (childOperator) {
                        enable ? childOperator.removeClass('disabled_operator') : childOperator.addClass('disabled_operator');
                    }
                }
            }
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
        },

        /**
        * DeActivate all events for all draggable tiles
        *
        * @method deActivateEventOnTiles
        * @param {Boolean} bRecursive True if recursively deActivate all tiles events
        * @public
        */
        deActivateEventOnTiles: function (bRecursive) {
            var tilesView = this.arrTileViews,
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

        /**
        * Iterate through all child, and enable all operators
        *
        * @method enableAllOperator
        * @param {Boolean} bRecursive True if call recursively
        * @public
        */
        enableAllOperator: function (bRecursive) {
            var tilesView = this.arrTileViews,
                child,
                length = 0,
                childOperator;
            if (tilesView) {
                length = tilesView.length;
            }
            if (length > 0
                && bRecursive) {
                for (var i = 0; i < length; i++) {
                    child = tilesView[i];
                    child.enableAllOperator(bRecursive);
                    childOperator = this.getOperatorFromTileItem(child);
                    if (childOperator) {
                        childOperator.removeClass('disabled_operator');
                    }
                }
            }
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

        },

        /**
        * Returns the tile next to this tile. If it's the last tile return undefined.
        * @method getNextTile
        * @return {Object} Tile next to this
        */
        getNextTile: function () {
            if (!this.parent) { return; }

            var index = this.parent.arrTileViews.indexOf(this);
            if (this.parent.arrTileViews[index + 1]) { return this.parent.arrTileViews[index + 1]; }
        },

        /**
        * Returns the tile before this tile. If it's the first tile return undefined.
        * @method getPrevTile
        * @return {Object} Tile before this tile
        */
        getPrevTile: function () {
            if (!this.parent) { return; }

            var index = this.parent.arrTileViews.indexOf(this);
            if (this.parent.arrTileViews[index - 1]) { return this.parent.arrTileViews[index - 1]; }
        },

        /**
        * Adds hover class to exponent.
        * @method addHoverClassExponent
        * @param {Object} Event
        */
        addHoverClassExponent: function (event) {
            if (!this.$exponent.hasClass('no-hover')) {
                this.$exponent.addClass('hover');
            }
            // Need to stop propogation since hovering on child tile (inside parens) used to
            // call the mouseover event of the parent parenthesis
            event.stopPropagation();
        },

        /**
        * Removes hover class from the exponent.
        * @method removeHoverClassExponent
        * @param {Object} Event
        */
        removeHoverClassExponent: function (event) {
            if (!this.$exponent.hasClass('no-hover')) {
                this.$exponent.removeClass('hover');
            }
            // Need to stop propogation since hovering on child tile (inside parens) used to
            // call the mouseover event of the parent parenthesis
            //event.stopPropagation();
        },

        /**
        * Returns a boolean representing whether this tile is inside a parentheses.
        * It's useful for checking for nested parentheses.
        * @method isInsideParentheses
        * @return {Boolean} True if tile is inside parentheses. False otherwise.
        */
        isInsideParentheses: function () {
            var parent = this.parent,
                TYPE = modelClassNameSpace.TileItem.BinTileType;
            if (this.model.get('type') === TYPE.PARENTHESIS) {
                return true;
            }

            if (parent) {
                return parent.isInsideParentheses();
            }

            return false;
        },

        attachDetachDraggable: function attachDetachDraggable (viewCid, enable) {
            var index,
                tileArray = this.arrTileViews;

            if(this.equationManager.model.get('mode') !== modelClassNameSpace.EquationManager.MODES.SolveMode || this.equationManager._tutorialMode) {
                return;
            }

            for(index=0; index<tileArray.length; index++) {
                tileArray[index].attachDetachDraggable(viewCid, enable);
            }
        },

        hideAccDiv: function () {
            if (this.accDiv) {
                this.accDiv.css('visibility', 'hidden');
            }
        },
        removeAccDiv: function removeAccDiv() {
            if (this.accDiv) {
                this.accDiv.remove();
            }
        }
    },
{
    /**
    * Creates TileItemView object.
    * @method createTileItemView MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Views.TileView
    * @static
    * @param model {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Models.TileItem} model of the view
    * @param parent {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Views.TileView} parent view
    * @param equationManager {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Views.EquationManager} equation manager object
    */
    createTileItemView: function (model, parent, equationManager, player, filePath, manager, idPrefix) {
        var itemTypes = modelClassNameSpace.TileItem.SolveTileType,
            itemView,
            commonData = {
                model: model,
                parent: parent,
                equationManager: equationManager,
                player: player,
                filePath: filePath,
                manager: manager,
                idPrefix: idPrefix
            };
        switch (model.get('type')) {
            case itemTypes.BASE_EXPONENT:
                {
                    itemView = new viewClassNamespace.BaseExpTileView(commonData);
                }
                break;
            case itemTypes.PARENTHESIS:
                {
                    itemView = new viewClassNamespace.ParenthesisTileView(commonData);
                }
                break;
            case itemTypes.FRACTION:
                {
                    itemView = new viewClassNamespace.FractionTileView(commonData);
                }
                break;
            case itemTypes.BIG_PARENTHESIS:
                {
                    itemView = new viewClassNamespace.BigParenthesisTileView(commonData);
                }
                break;
            case itemTypes.BASE_ONLY:
                {
                    itemView = new viewClassNamespace.BaseTileView(commonData);
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
        TermContainer: 'term-container',
        BASE: 'base',
        EXPONENT: 'exponent',
        BASE_ONLY: 'base-only',
        Bracket: 'bracket',
        PARENTHESIS: 'parenthesis',
        BASE_EXPONENT: 'base-exponent',
        COEFFICIENT: 'coefficient',
        LeftBracket: 'left-bracket',
        RightBracket: 'right-bracket',
        FRACTION: 'fraction-component',
        NUMERATOR: 'numerator',
        DENOMINATOR: 'denominator',
        VINICULUM: 'viniculum',
        Level: 'level',
        OperatorContainer: 'operator-container',
        Operator: 'operator',
        '*': 'multiplication',
        '+': 'addition',
        '-': 'addition',
        '/': 'multiplication'       // TODO change
    },

    /**
   * Scroll settings used for draggable scrolling.
   * @property static
   * @static
   */
    scroll: {
        SENSITIVITY: 50,
        SPEED: ($.support.touch) ? 40 : (function () {
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
