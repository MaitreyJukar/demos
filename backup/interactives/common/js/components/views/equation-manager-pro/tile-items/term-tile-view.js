(function (MathInteractives) {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point,
        Scroll = viewClassNamespace.TileView.Scroll;

    /**
    * holds the data for the term tile view.
    *
    * @class TermTileView
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManagerPro.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    */
    viewClassNamespace.TermTileView = viewClassNamespace.TileView.extend({

        /**
        * Array of tile views inside term tile view
        * @property tileViews
        * @type Array
        * @default null
        */
        tileViews: null,

        /**
        * whether tile is dragging
        * @property isDragging
        * @type boolean
        * @default false
        */
        isDragging: false,

        /**
       * Checks if the tile is disabled
       * @property isTileDisabled
       * @type boolean
       * @default false
       */
        isTileDisabled: false,

        negateTile: false,


        //isTextInverted: false,
        initialize: function () {

            viewClassNamespace.TermTileView.__super__.initialize.apply(this, arguments);
            this.initializeDefaultProperties();
            this.tileViews = [];
        },

        render: function () {

        },

        events: {
            'mouseenter .base-container': 'addHoverClassBase',
            'mouseleave .base-container': 'removeHoverClassBase',
        },

        /**
         * Creates a Html template for term tile view
         * @method createView
         * @public
         *
         */
        createView: function () {
            var classes = viewClassNamespace.TileView.CLASSES,
                $template = null,
                templateString = null,
                baseValue = this.model.get('base'),
                baseStr = this.getValueText('base'),
                iotaExponent = this.model.get('iotaExponent'),
                squareRootProps = this.model.get('squareRootProps'),
                isDraggable = this.model.get('isDraggable'),
                TileType = modelClassNamespace.TileItem.TileType, iValue, self = this;

            if (squareRootProps) {
                if (iotaExponent === 1) {
                    if (baseValue === -1) {
                        iValue = '<i class="iota-margin-adjust">&minus;i</i>';
                    }
                    else {
                        iValue = '<i class="iota-margin-adjust">i</i>';
                    }
                }
                else if (iotaExponent === 2) {
                    if (baseValue === -1) {
                        iValue = '<i>&minus;i</i><span class="iota-exponent">2</span>';
                    }
                    else {
                        iValue = '<i>i</i><span class="iota-exponent">2</span>';
                    }
                }
                if (squareRootProps.isNegative) {
                    baseStr = '&minus;' + (iValue !== undefined ? iValue : '') + '<span class="squareroot-img"></span><span class="squareroot-value">' + baseStr + '</span>';
                }
                else {
                    baseStr = (iValue !== undefined ? iValue : '') + '<span class="squareroot-img"></span><span class="squareroot-value">' + baseStr + '</span>';
                }
            }
            else if (iotaExponent === 1 && baseValue !== 1) {
                if (baseValue === -1) {
                    baseStr = '<span class="base-str"><i>&minus;i</i></span>';
                }
                else {
                    baseStr = '<span class="base-str">' + baseStr + '</span>' + '<i>i</i>';
                }
            }
            else if (iotaExponent === 1 && baseValue === 1) {
                baseStr = '<i>i</i>';
            }
            else if (iotaExponent === 2 && baseValue !== 1) {
                if (baseValue === -1) {
                    baseStr = '<i>&minus;i</i><span class="iota-exponent">2</span>';
                }
                else {
                    baseStr = '<span class="base-str">' + baseStr + '</span>' + '<i>i</i><span class="iota-exponent">2</span>';
                }
            }
            else if (iotaExponent === 2 && baseValue === 1) {
                baseStr = '<i>i</i><span class="iota-exponent">2</span>';
            }
            else {
                if (typeof (baseValue) === 'string') {
                    baseStr = '<span class="base-str"><i>' + baseStr + '</i></span>';
                }
                else {
                    baseStr = '<span class="base-str">' + baseStr + '</span>';
                }

            }

            if (baseValue !== null) {
                templateString = MathInteractives.Common.Components.templates['baseTilePro']({
                    'base': baseStr,
                    'base-class': 'bin-tiles-base',
                    'level': 'eqn-manager-tile',
                    'baseTileType': TileType.TERM_TILE,
                    'idPrefix': this.idPrefix
                });
                $template = $(templateString);
            }
            else {
                templateString = MathInteractives.Common.Components.templates['baseTilePro']({

                    'base': '',
                    'base-class': 'empty-tile',
                    'level': 'eqn-manager-tile',
                    'baseTileType': TileType.TERM_TILE,
                    'idPrefix': this.idPrefix
                });
                $template = $(templateString);
                this.$el.addClass('empty-dropslot');
            }

            if ((baseValue + '').length > 3 || ((baseValue + '').length === 3 && (baseValue + '').indexOf('-') === -1)) {
                $template.find('.base-value').addClass('decrease-font-size');
            }

            this.$base = $template.find('.base-container');

            this.$el.append($template)
            .addClass(classes.TermTile)
            .attr('data-tiletype', TileType.TERM_TILE);
            //this._reduceFontSize(squareRootProps);
            this._createNonDraggableTile();

            // this method call is in timeout because stop gets called after calling of following method when we combine tile, henve overlay div gets hidden
            window.setTimeout(function () { self._showFlashAnimation(); }, 100);
            return this.$el;
        },


        checkForFractionInExpression: function checkForFractionInExpression() {
            return false;
        },

        _reduceFontSize: function _reduceFontSize(squareRootProps) {
            if (squareRootProps && squareRootProps.isNegative) {
                this.$el.find('.base-value').addClass('reduced-font-size');
                this.$el.find('.squareroot-img').css({ 'height': '16px' });
            }
        },

        _createNonDraggableTile: function _createNonDraggableTile() {
            var isDraggable = this.model.get('isDraggable');
            if (!isDraggable) {
                this.$el.find('.box').hide();
                this.$base.addClass('non-draggable-tile');
                this.$el.addClass('ignore-marquee');
            }
        },


        _showFlashAnimation: function _showFlashAnimation() {
            var equationManager = this.equationManager, self = this, _hideOverlay;
            if (this.model.get('iotaExponent') === 2) {
                equationManager.showHideOverlayDiv(true);

                _hideOverlay = function _hideOverlay() {
                    equationManager.showHideOverlayDiv(false);
                    self.$el.removeClass('flashShadowTS animated');
                }

                if (equationManager._isIE9) {
                    this._flashShadowInIE9(this.$el);
                }
                else {
                    this.$el.addClass('flashShadowTS animated')
                            .one('webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd', _hideOverlay);
                }
            }
        },

        /**
        * Simulates flash shadow css animation using jquery for IE 9.
        *
        * @method _flashShadowInIE9
        * @param $element {Object} The jquery reference of the element to be animated.
        */
        _flashShadowInIE9: function _flashShadowInIE9($element) {
            $element = $element instanceof $ ? $element : $($element);
            var totalDuration = 2000,
                stepsCount = 6,
                stepDuration = totalDuration / stepsCount,
                _flashShadow, self = this;
            _flashShadow = function _flashShadow() {
                if (stepsCount === 0) {
                    $element.css({ 'box-shadow': '' });
                    self.equationManager.showHideOverlayDiv(false);
                    return;
                }
                window.setTimeout(function () {
                    $element.css({ 'box-shadow': '0px 0px 0px 3px rgba(255, 168, 0, 1), 0px 0px 0px 8px rgba(255, 168, 0, 0.3)' });
                    stepsCount--;
                    window.setTimeout(function () {
                        $element.css({ 'box-shadow': '0px 0px 0px 3px rgba(0,0,0,0)' });
                        stepsCount--;
                        _flashShadow();
                    }, stepDuration);
                }, stepDuration);
            };
            _flashShadow();
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
        * change sign across section
        * @method invertBaseText
        * @param {isInvert} boolean
        * @param {$element} Jquery object
        * @public
        */
        invertBaseText: function invertBaseText(isInvert, $element) {
            var baseConatiner = $element.find('.base-value');
            if (this.model.get('base') === 0) {
                return;
            }
            if (isInvert) {
                if (!baseConatiner.data('isNegate')) {
                    baseConatiner.html(this.invertText(baseConatiner.text()));
                }
                baseConatiner.data('isNegate', true);
            }
            else {
                baseConatiner.html(this.getValueText('base'));
                baseConatiner.data('isNegate', false);
            }
        },

        /**
        * attach events on view
        * @method attachEvents
        * @param fromEqnManager {boolean} boolean for attaching events on particular tile when called from equation manager
        * @public
        */
        attachEvents: function (fromEqnManager) {
            var self = this,
                TileType = modelClassNamespace.TileItem.TILE_TYPES,
                originalBaseValue = this.model.get('base');

            this.listenTo(this.model, 'change:operator', this._onOperatorChange);
            this.listenTo(this.model, 'change:endResult', this._renderEndResult);
            //this.equationManager.off(viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT.TERM_TILE).on(viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT.TERM_TILE, function (tileView, $helper) {
            //    self._invertTileText(tileView, $helper);
            //});
            this.applyHandCursorToElem(this.$base);

            if (this.isTutorialMode && !fromEqnManager) {
                return;
            }

            //this.listenTo(this.equationManager, viewClassNamespace.EquationManagerPro.EVENTS.INVERT_TILE_TEXT.TERM_TILE, this._invertTileText);




            this.$el.off('mousedown.tile').on('mousedown.tile', function (evt) {
                return self._onMouseDownTile(evt);
            });

            this.$el.off('mouseup.tile').on('mouseup.tile', function (evt) {
                return self._onMouseUpTile(evt);
            });

            this.$el.off('click.tile').on('click.tile', $.proxy(this._onBaseClick, this));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$base, { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.$el, { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });
            //if ($.support.touch) {
            //if (this.equationManager.isTouch()) {
            //    delete this.events['mouseenter .base-container'];
            //    delete this.events['mouseleave .base-container'];
            //    this.delegateEvents(this.events);
            //}

            //MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, this.$base, 600, this.addHoverClassBase, this.removeHoverClassBase, 'base-hold');

            //this._touchStartHandler = $.proxy(this._onTouchStart, this);
            //this._touchEndHandler = $.proxy(this._onTouchEnd, this);
            //this._touchMoveHandler = $.proxy(this._onTouchMove, this);
            //this.el.addEventListener('touchstart', this._touchStartHandler, false);

            //}

            this.attachEventsOnTile();
            this.attachDroppableOnTile();

        },


        _renderEndResult: function _renderEndResult(model, value) {
            var base = this.model.get('base'),
                equationManager = this.equationManager,
                $base = this.$base;
            if (value) {
                $base.addClass('end-result-tile');
                equationManager.removeHighlightTilesImmediate();
                this.enableDisableTiles(false);
                equationManager.enableDisableTabOnLHSContainer(false);
                equationManager.enableDisableTabOnRHSContainer(false);
                equationManager.disableMarquee(true, true);
                equationManager.changeDragHandleImg(base, value);
                equationManager.enableDisableBinTiles(false);
                this.enableTab('tile-module-bin-tile-container', false);
                if (typeof base !== 'string') {
                    $base.find('.base-str').text(base.toFixed(2));
                }
            }
            else {
                if (typeof base !== 'string') {
                    $base.find('.base-str').text(base);
                }
                $base.removeClass('end-result-tile');
                this.enableDisableTiles(true);
                equationManager.enableMarquee(true, true);
                equationManager.enableDisableTabOnLHSContainer(true);
                equationManager.enableDisableTabOnRHSContainer(true);
                equationManager.changeDragHandleImg(base, value);
                equationManager.enableDisableBinTiles(true);
                this.enableTab('tile-module-bin-tile-container', true);
            }
        },

        /**
        * Adds a hover class to the term tile item view.
        * @method addHoverClassBase
        */
        addHoverClassBase: function () {
            if (this.$base.hasClass('disable') || this.equationManager.getIsMarqueeDrawing()
                || this.$base.hasClass('non-draggable-tile')) {
                return;
            }
            this.$base.addClass('hover');
        },

        /**
        * Removes a hover class from the term tile item view.
        * @method addHoverClassBase
        */
        removeHoverClassBase: function () {
            if (this.$base.hasClass('disable')) {
                return;
            }
            this.$base.removeClass('hover');
        },

        /**
        * drop event on tile item
        * @method onTileDrop
        * @param {event} event object
        * @param {ui} jquery ui object
        * @public
        */
        onTileDrop: function onTileDrop(event, ui, fromAcc) {
            // If equation is unbalanced, then tile must be dropped in empty slot and should have the same value as the
            // tile dropped before it.
            var isEqnBalanced = this.equationManager.getTileAddedInExpression() === null,
                helperTileValue = ui ? ui.helper.data().tilevalue : fromAcc.tilevalue;

            if ((!isEqnBalanced && !this.isTutorialMode &&
                (!this.$el.hasClass('empty-dropslot') ||
                helperTileValue !== this.equationManager.getTileAddedFromBinValue())) || (!isEqnBalanced && fromAcc && fromAcc['cur-draggable'] && fromAcc['cur-draggable'].model && fromAcc['cur-draggable'].model.get('type') !== modelClassNamespace.TileItem.TileType.BIN_TILE)) {
                this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
                this.equationManager.equationNotBalancedFeedback();
                return;
            }

            var tileViews = this.tileViews, i = 0, tileViewsLen = tileViews.length,
               modelRef = this.equationManager.equationView.model,
               equationView = this.equationManager.equationView,
               draggedTileData = ui ? ui.helper.data() : fromAcc,
               draggedTile = draggedTileData['cur-draggable'],
               draggedTileType = draggedTileData['tiletype'],
               draggedTileValue = draggedTileData['tilevalue'],
               droppableTile = this,
               destTileModel = droppableTile.model,
               destTileLocation = destTileModel.get('isDenominator'),
               destTileSection = destTileModel.get('isLHS'),
               destTileIndex = modelRef.getIndexFromItemModel(destTileModel),
               index = destTileSection ? 0 : 1,
               expressionView = this.equationManager.equationView.tileViews[index],
               destNode, commonNode = null, data = {}, bCommandExecution, addTileIndex,
               arr = [], root = this.equationManager.getTreeRoot();

            if (this.equationManager.getFirstTileDrop() === false) {
                this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 19), this.getAccMessage('inline-feedback-text', 19));
                return;
            }

            this.equationManager._showHideDropslots(this.equationManager.equationView.$el, false);

            if (this.equationManager._checkForNestedLevelOfParentheses() && isEqnBalanced && draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                this.equationManager._showHideDropslots(expressionView.$el, false);
                this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 12), this.getAccMessage('inline-feedback-text', 12));
                return;
            }

            if (typeof draggedTileValue === 'string' && draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE && draggedTileValue.indexOf('x') !== -1 && this.equationManager.getTileAddedInExpression() === null) {
                this.equationManager._showHideDropslots(this.$el, false);
                this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 20), this.getAccMessage('inline-feedback-text', 20));
                return;
            }

            if (draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                if (destTileLocation) {
                    addTileIndex = expressionView.fractionIndex;
                    if (draggedTileValue === 't') {
                        var $equationView = this.equationManager.equationView.$el;
                        this.equationManager._showHideDropslots($equationView, false);
                        $equationView.find('.hover-border').removeClass('hover-border');
                        this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 15), this.getAccMessage('inline-feedback-text', 15));
                        return;
                    }
                }
                else {
                    addTileIndex = expressionView.multiplicationIndex;
                }
                data = {
                    isLHS: destTileSection,
                    isDenominator: destTileLocation,
                    index: expressionView.multiplicationIndex ? addTileIndex : expressionView.index,
                    operation: '*',
                    tileValue: draggedTileValue,
                    parenthesesAdded: expressionView.parenthesesAdded,
                    fractionAdded: expressionView.multiplicationIndex ? expressionView.fractionAdded : destTileLocation,
                    tilesToAddInFraction: expressionView.tilesToAddInFraction
                };
                if (this.equationManager.getTileAddedInExpression() !== null) {
                    if (this.model.get('operator') === '+') {
                        data.operation = '+';
                        data.index = destTileIndex
                    }
                    this.equationManager.setTileAddedInExpression();
                    this.equationManager.setTileAddedFromBinValue();
                    bCommandExecution = this.equationManager.onReplaceTile(data);
                }
                else {
                    bCommandExecution = this.equationManager.onAddTile(data);
                    this.equationManager.setTileAddedFromBinValue(draggedTileValue);
                    if (bCommandExecution) {
                        this.addNullTileCase(modelClassNamespace.TileItem.OPERATORS.MULTIPLICATION, data.tileValue);
                    }
                }
            }
            else {
                var sourceIndexStr = draggedTile.parent.getIndex(draggedTile),
                    sourceTileModel = draggedTile.model,
                    isInterLevel = this._isInterLevel(sourceIndexStr, destTileIndex),
                    length = draggedTileData['length'],
                    sourceParentModel, relativeSourceModelIndex,
                    sourceTileNodes,
                    sourceNodesParent,
                    sourceTileModels = [],
                    tilesInsideNode = [],
                    sourceNodePath = [], destNodePath = [], commandName = null, firstChild;


                if (!length) {
                    length = 1;
                }

                data.sourceNumOfTiles = length;
                data.sourceTile = draggedTile;
                data.destTile = droppableTile;


                sourceParentModel = this.getParentTiles(modelRef, sourceIndexStr);
                relativeSourceModelIndex = parseInt(this.getSourceWrtParent(sourceIndexStr), 10);
                destNode = this.tilesToNodes(root, [destTileModel])[0];
                for (index = 0; index < length; index++) {
                    sourceTileModels.push(sourceParentModel.at(relativeSourceModelIndex + index));
                }
                sourceTileNodes = this.tilesToNodes(root, sourceTileModels);
                sourceNodesParent = this.getCommonParentFromMultiple(sourceTileNodes);

                destNodePath = destNode.getPath();

                if (length === 1) {
                    sourceNodePath = sourceTileNodes[0].getPath();
                }
                else {
                    sourceTileNodes = modelClassNamespace.EquationManagerPro.Utils.getAllLeaves(sourceTileNodes[0]);
                    sourceNodePath = sourceTileNodes[0].getPath();
                    this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.MARQUEE_DROPPED);
                }

                if (sourceTileNodes[0].parent.data === destNode.parent.data && sourceTileNodes[0].parent === destNode.parent) {
                    //combine command
                    commandName = 'combine';
                    data.destNumOfTiles = 1;
                }
                else {
                    if (isInterLevel === true) {
                        arr = destNode.getPath();
                        commonNode = root;
                        commandName = 'combine';
                        if (destTileSection) {
                            firstChild = commonNode.children[0];
                        }
                        else {
                            firstChild = commonNode.children[1];
                        }
                        if (firstChild && (firstChild.data === '*' || firstChild.data === '/')) {
                            commonNode = firstChild;
                            if (commonNode.data === '/') {
                                data.destTile = equationView.getViewFromIndex(equationView.model.getIndexFromItemModel(commonNode.collectionData));
                                data.destNumOfTiles = 1;
                            }
                            else {
                                data.destNumOfTiles = commonNode.children.length;
                                data.destTile = equationView.getViewFromIndex(equationView.model.getIndexFromItemModel(commonNode.children[0].collectionData || commonNode.children[0].data));
                            }
                        }
                        else {
                            // case 5*6 + 6*7 = 8(5+2) => dragging 8 over 7
                            firstChild = this._getChildOfRoot(root, destNode);
                            if (firstChild.data === '*') {
                                data.destNumOfTiles = firstChild.children.length;
                                data.destTile = equationView.getViewFromIndex(equationView.model.getIndexFromItemModel(firstChild.children[0].collectionData || firstChild.children[0].data));
                            }
                            else {
                                data.destNumOfTiles = 1;
                                data.destTile = equationView.getViewFromIndex(equationView.model.getIndexFromItemModel(firstChild.collectionData || firstChild.data));
                            }
                        }
                    }
                    else {
                        var tempLen;
                        if (sourceNodePath.length > destNodePath.length) {
                            tempLen = sourceNodePath.length;
                        }
                        else {
                            tempLen = destNodePath.length;
                        }

                        for (; i < tempLen; i++) {
                            if (destNodePath[i] === sourceNodePath[i]) {
                                arr.push(destNodePath[i]);
                            }
                            else {
                                break;
                            }
                        }
                        commonNode = root.getChildAt(arr);
                        if (commonNode.data === '*' || commonNode.data === '+') {
                            var operators = this.getOperatorsBetween(sourceTileNodes[0], destNode);
                            if (this._isTakeOutCommon(operators) === true) {
                                if (commonNode.data === '*') {
                                    //takeout common
                                    commandName = 'takeOut';
                                }
                                //else { //Bugfix #15606 - Case 1 - Couldn't find a case for which this else is required
                                //    //combine commmand
                                //    commandName = 'combine';
                                //    var siblingBranchContainsDest = this._getSourceSiblingBranchContainsDest(sourceTileNodes[0], destNode, commonNode, root);
                                //    data.destNumOfTiles = siblingBranchContainsDest.children.length || 1;
                                //    data.destTile = equationView.getViewFromIndex(modelRef.getIndexFromItemModel(siblingBranchContainsDest.children[0].data));
                                //}
                            }
                            else {
                                //combine commmand
                                commandName = 'combine';
                                var siblingBranchContainsDest = this._getSourceSiblingBranchContainsDest(sourceTileNodes[0], destNode, commonNode, root);
                                if (siblingBranchContainsDest.data === '^' || siblingBranchContainsDest.data === '/') {
                                    data.destNumOfTiles = 1;
                                    data.destTile = equationView.getViewFromIndex(modelRef.getIndexFromItemModel(siblingBranchContainsDest.collectionData));
                                }
                                else {
                                    //if only tile will have children 0
                                    data.destNumOfTiles = siblingBranchContainsDest.children.length || 1;
                                    data.destTile = equationView.getViewFromIndex(modelRef.getIndexFromItemModel(
                                        this._getLeftMostChildModelFromNode(siblingBranchContainsDest)));
                                }

                            }

                        }
                        else if (commonNode.data === '/') {
                            commandName = 'combine';
                            //highlight all either denominator or numerator --> combine command
                            var fraction;
                            if (destTileLocation && commonNode.children[1].data === '+') {
                                fraction = commonNode.children[1];
                            }
                            else if ((!destTileLocation && commonNode.children[0].data === '+')) {
                                fraction = commonNode.children[0];
                            }
                            else {
                                fraction = destNode;
                            }
                            tilesInsideNode = this._getTilesModelsInsideNode(fraction);
                            data.destNumOfTiles = tilesInsideNode.length;
                            data.destTile = equationView.getViewFromIndex(modelRef.getIndexFromItemModel(tilesInsideNode[0]));
                        }
                    }
                }
                if (commandName === 'combine') {
                    bCommandExecution = this.equationManager.onCombineTile(data);
                }
                else if (commandName === 'takeOut') {
                    bCommandExecution = this.equationManager.onTakeOutCommonTile(data);
                }
            }
            if (bCommandExecution) {
                ui && ui.draggable.data('isDropped', true);
                if (fromAcc) {
                    this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DROP_SUCCESS);
                }
                this.equationManager.proceedToNextStep();
            }
            this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
        },

        /**
        * Returns the model of the leftmost child node of the node passed.
        *
        * @method _getLeftMostChildModelFromNode
        * @param node {Object}
        */
        _getLeftMostChildModelFromNode: function _getLeftMostChildModelFromNode(node) {
            var data = node.data,
                operators = modelClassNamespace.TileItem.OPERATORS;
            if (data === operators.PARENTHESES || data === operators.DIVISION) {
                // return node's model; no need to check further
                return node.collectionData;
            }
            else { // for multiplication & addition, return first child's model
                if (node.children.length)
                    return this._getLeftMostChildModelFromNode(node.children[0]);
                else return node.data; // for leaf node, return node's model
            }
        },

        /**
        * on click base
        * @method _onBaseClick
        * @private
        */
        _onBaseClick: function _onBaseClick() {
            if (this.model.get('base') === null) {
                return false;
            }
            if (this.equationManager.getFirstTileDrop() === false) {
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 19), this.getAccMessage('inline-feedback-text', 19));
                return false;
            }
            if (this.equationManager.getTileAddedInExpression() !== null) {
                this.equationManager._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 16), this.getAccMessage('inline-feedback-text', 16));
                return false;
            }
            if (!this.isTilesDisabled && this.isDragging === false && !this.$base.hasClass('disable')) {
                this.equationManager.onBaseClick(this);
            }
            this.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DRAGGING_START);
        },


        ///**
        //* Adds a closed hand cursor to the passed element
        //* @method applyCloseCursorToElem
        //* @param {Object} Element to apply the cursor to
        //*/
        //applyCloseCursorToElem: function ($requiredElement) {
        //    var self = this;

        //    $requiredElement.on('mousedown', function (event) {
        //        if ($(event.target).hasClass('empty-tile') || this.isMobile) { return; }
        //        self.$exponent.css(self._getClosedHandCss());
        //        self.$base.css(self._getClosedHandCss());
        //    });
        //    $requiredElement.on('mouseup', function (event) {
        //        if ($(event.target).hasClass('empty-tile') || this.isMobile) { return; }
        //        self.$exponent.css(self._getOpenHandCss());
        //        self.$base.css(self._getOpenHandCss());
        //    });
        //},

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
                if ((self.$el.hasClass('ui-droppable') && !self.$el.hasClass('ui-draggable')) || self.$el.hasClass('ui-draggable-dragging') || $(this).hasClass('empty-tile') || $(this).hasClass('disable') || $(this).hasClass('non-draggable-tile') || self.equationManager.getIsMarqueeDrawing()) { return; }
                $requiredElement.css(self._getOpenHandCss());
                if (self.$el.parents('.ui-draggable-dragging').length > 0) {
                    $requiredElement.css(self._getClosedHandCss());
                }
            });

            $requiredElement.on(leave, function () {
                if ((self.$el.hasClass('ui-droppable') && !self.$el.hasClass('ui-draggable')) || self.$el.hasClass('ui-draggable-dragging') || self.isMobile || self.equationManager.getIsMarqueeDrawing()) { return; }
                $requiredElement.css(self._getDefaultCursorCss());
            });
            $requiredElement.on('mousedown', function () {
                if ((self.$el.hasClass('ui-droppable') && !self.$el.hasClass('ui-draggable')) || $(this).hasClass('empty-tile') || $(this).hasClass('disable') || $(this).hasClass('non-draggable-tile') || self.isMobile || self.equationManager.getIsMarqueeDrawing()) { return; }
                $requiredElement.css(self._getClosedHandCss());
                /*self.equationManager.trigger(modelClassNamespace.EquationManagerPro.EVENTS.TILE_MOUSE_DOWN);*/
            });
            $requiredElement.on('mouseup', function () {
                if ((self.$el.hasClass('ui-droppable') && !self.$el.hasClass('ui-draggable')) || $(this).hasClass('empty-tile') || $(this).hasClass('disable') || $(this).hasClass('non-draggable-tile') || self.isMobile || self.equationManager.getIsMarqueeDrawing()) { return; }
                $requiredElement.css(self._getOpenHandCss());
            });
        },

        attachDroppableOnTile: function attachDroppableOnTile() {
            var self = this,
                isDroppable = this.$el.is('.ui-droppable');

            if (!isDroppable) {
                this.$el.droppable({
                    accept: this.model.get('strDroppables'),
                    tolerance: 'pointer',
                    greedy: true,
                    drop: function (event, ui) {
                        if (!self.equationManager.getIsDropped()) {
                            var retVal = self.onTileDrop(event, ui);
                            ui.draggable.removeData('cur-droppable');
                            self.equationManager.setIsDropped(true);
                            return retVal;
                        }
                        return false;
                    },
                    over: function (event, ui) {
                        //console.log('tile term mouse over');
                        ui.draggable.data('cur-droppable', self);
                        self.onMouseOver(event, ui);
                    },
                    out: function (event, ui) {
                        //console.log('tile term mouse out');
                        ui.draggable.removeData('cur-droppable');
                        self.onMouseOut(event, ui);
                    }
                });
            }
            else {
                this.$el.droppable('enable');
            }
        },
        /**
        * attach events on tile
        * @method attachEventsOnTile
        * @public
        */
        attachEventsOnTile: function () {
            if (this.isTileDisabled && !this.isTutorialMode) {
                return;
            }
            var self = this,
                scrollLeft = 0,
                isDraggable = this.$el.is('.ui-draggable'),
                model = this.model,
                EVENTS = viewClassNamespace.EquationManagerPro.EVENTS;
            if (model.get('base') !== null && model.get('isDraggable')) {
                if (!isDraggable) {
                    this.$el.draggable({
                        scroll: Scroll.ENABLE,
                        distance: 5,
                        scrollSensitivity: Scroll.SENSITIVITY,
                        scrollSpeed: Scroll.SPEED,
                        appendTo: this.equationManager.$draggableContainment,
                        refreshPositions: true,
                        revert: function (event) {
                            //self.equationManager.showHideOverlayDiv(true)
                            if (!this.data('isDropped')) {
                                self.equationManager._showHideDropslots(self.equationManager.equationView.$el, false);
                                self.equationManager.setIsDropped(false);
                                this.removeData('isDropped');
                            }
                            return false;
                        },
                        zIndex: 5,
                        helper: 'clone',
                        containment: this.equationManager.$draggableContainment,
                        cursorAt: { left: this.$el.width() / 2, top: this.$el.height() / 2 },
                        start: function (event, ui) {
                            //self.equationManager.equationView.attachDetachDraggable(self.cid, true);
                            var $parent = $(this).parents('.expression-view-holder').length > 0 ? $(this).parents('.expression-view-holder') : null;
                            if ($parent) {
                                scrollLeft = $parent.scrollLeft();
                            }

                            ui.helper.addClass('current-draggable');
                            ui.helper.data({ 'cur-draggable': self });
                            ui.helper.data('prevLocationData', null);
                            $(this).css({ 'visibility': 'hidden' });
                            self.isDragging = true;
                            self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DRAGGING_START);
                            self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.ANY_DRAG_START);
                            self._termTileDraggingStart(event, ui);
                        },
                        drag: function (event, ui) {
                            //if (!self.equationManager.onlyLHS) {
                            self.equationManager.enableDisableDroppables(event, ui, self);
                            if (!self.equationManager.onlyLHS) {
                                self._negateTile(event, ui);
                            }
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
                            //self.isTextInverted = false;
                            //self.equationManager.equationView.attachDetachDroppable(true);
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

            ui.helper.removeData('prevLocationData');
            ui.helper.removeData(['cur-draggable', 'cur-droppable']);
            $this.removeClass('current-draggable');
            self.equationManager.resetContainment();
            self.isDragging = false;
            self.equationManager.refresh();
            self.equationManager.showHideOverlayDiv(false);
            self.equationManager.setIsDropped(false);
            $this.css({ 'visibility': '' });
            self._termTileDraggingStop(event, ui);
            self.equationManager.resetContainment();
            self.negateTile = false;
            self.equationManager.trigger(viewClassNamespace.EquationManagerPro.EVENTS.TILE_DRAG_STOP);
            self.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
        },

        tileToNegate: function tileToNegate() {
            var treeRoot = this.equationManager.getTreeRoot(),
                sourceNodeRef = this.model.get('treeNodeRef'),
                sourceNodePath = sourceNodeRef.getPath(),
                rootChild = treeRoot.children[sourceNodePath[0]], i = 0;

            // case 3*1 / 4 dragging => 4
            for (; i < rootChild.children.length && rootChild.data !== '/' && rootChild.data !== '*'; i++) {
                if (rootChild.children[i].cid === sourceNodeRef.cid) {
                    this.negateTile = true;
                }
            }
            if (rootChild.children.length === 0) {
                this.negateTile = rootChild.cid === sourceNodeRef.cid ? true : false;
            }
        },

        _negateTile: function _negateTile(event, ui) {
            if (this.negateTile) {
                var isLHS = this.model.get('isLHS'),
                    //ptMouse = new Point({left: event.clientX, top: event.clientY}),
                    helperRect = new Rect(ui.helper[0].getBoundingClientRect()),
                    ptMouse = helperRect.getMiddle();

                if (this.equationManager.lhsRect.isPointInRect(ptMouse) && !isLHS) {
                    this.invertBaseText(true, $(ui.helper));
                }
                else if (this.equationManager.rhsRect.isPointInRect(ptMouse) > 0 && isLHS) {
                    this.invertBaseText(true, $(ui.helper));
                }
                else {
                    this.invertBaseText(false, $(ui.helper));
                }
            }
        },

        /**
        * In case of take-out-common, holds the $el of the tile that will get factored.
        *
        * @property _multipleInParenthesesTileElem
        * @private
        * @default null
        * @type Object
        */
        _multipleInParenthesesTileElem: null,

        /**
        * Adds a CSS class to the tile whose index is stored in dragged tile's "multipleInParentheses" model attribute
        * to indicate which tile will get affected on take-out-common command fire.
        *
        * @method _termTileDraggingStart
        * @param [event] {Object} Drag start event object.
        * @param [ui] {Object} jQuery UI draggable's on drag start event ui property.
        * @private
        */
        _termTileDraggingStart: function _termTileDraggingStart(event, ui) {
            this._multipleInParenthesesTileElem = null;
            var multipleInParenthesesIndex = this.model.get('multipleInParentheses'), tileView;
            if (typeof multipleInParenthesesIndex === 'string') {
                tileView = this.equationManager.equationView.getViewFromIndex(multipleInParenthesesIndex);
                if (tileView) {
                    this._multipleInParenthesesTileElem = tileView.$el.addClass('multiple-in-parentheses');
                }
            }
        },

        /**
        * Removes CSS class added on drag start.
        *
        * @method _termTileDraggingStop
        * @param [event] {Object} Drag start event object.
        * @param [ui] {Object} jQuery UI draggable's on drag start event ui property.
        * @private
        */
        _termTileDraggingStop: function _termTileDraggingStop(event, ui) {
            this._multipleInParenthesesTileElem && this._multipleInParenthesesTileElem.removeClass('multiple-in-parentheses');
        },


        ///**
        //* change sign across section
        //* @method _invertTileText
        //* @param {tileView} tile item view
        //* @param {$helper} Jquery object of helper
        //* @private
        //*/
        //_invertTileText: function _invertTileText(tileView, $helper) {
        //    console.log('invert base');
        //    tileView.invertBaseText(true, $helper);
        //},

        /**
        * change sign across section
        * @method onMouseOver
        * @param {event} event object
        * @param {ui} Jquery ui object
        * @public
        */
        onMouseOver: function (event, ui) {

            //if (this.isTutorialMode) {
            //    this.highlightTiles();
            //    return;
            //}
          //  console.log('over');
            if (this.equationManager.getFirstTileDrop() === false) {
                return;
            }

            if (this.equationManager.getTileAddedInExpression() !== null) {
                if (this.$el.hasClass('empty-dropslot') && ui.helper.data('tiletype') === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                    this.highlightTiles();
                    this.equationManager.enableDisableDroppables(event, ui);
                }
                return;
            }

            var tileViews = this.tileViews, i = 0, tileViewsLen = tileViews.length,
                modelRef = this.equationManager.equationView.model,
                equationView = this.equationManager.equationView,
                draggedTileData = ui.helper.data(),
                draggedTile = draggedTileData['cur-draggable'],
                draggedTileType = draggedTileData['tiletype'],
                root = this.equationManager.getTreeRoot(),
                droppableTile = this,
                destTileModel = droppableTile.model,
                destTileLocation = destTileModel.get('isDenominator'),
                destTileSection = destTileModel.get('isLHS'),
                destNode, commonNode = null, data = {},
                arr = [];

            if (draggedTileType === modelClassNamespace.TileItem.TileType.BIN_TILE) {
                destNode = this.tilesToNodes(root, [destTileModel])[0];
                arr = destNode.getPath();
                commonNode = root.getChildAt([arr[0]]);
                tilesInsideNode = this._getTilesModelsInsideNode(commonNode);
                for (i = 0; i < tilesInsideNode.length; i++) {
                    this._highlightTile(tilesInsideNode[i], modelRef, equationView);
                }
                ui.helper.data('add-tile-droppable', this);
            }
            else {
                var sourceIndexStr = draggedTile.parent.getIndex(draggedTile),
                    sourceTileModel = draggedTile.model,
                    sourceTileLocation = sourceTileModel.get('isDenominator'),
                    destTileIndex = modelRef.getIndexFromItemModel(destTileModel),
                    isInterLevel = this._isInterLevel(sourceIndexStr, destTileIndex),
                    length = draggedTileData['length'], // this attribute will get set in marquee
                    index = 0,
                    sourceParentModel, relativeSourceModelIndex,
                    sourceTileNodes,
                    sourceNodesParent,
                    sourceTileModels = [],
                    tilesInsideNode = [],
                    sourceNodePath = [], destNodePath = [], firstChild, isParenthesesAsCoeff = true, testNodeIndex;


                if (!length) {
                    length = 1;
                }

                //when num of source tiles is 1 then source tile itself is sourceParent
                sourceParentModel = this.getParentTiles(modelRef, sourceIndexStr);
                relativeSourceModelIndex = parseInt(this.getSourceWrtParent(sourceIndexStr), 10);
                destNode = this.tilesToNodes(root, [destTileModel])[0];
                for (; index < length; index++) {
                    sourceTileModels.push(sourceParentModel.at(relativeSourceModelIndex + index));
                }
                sourceTileNodes = this.tilesToNodes(root, sourceTileModels);
                sourceNodesParent = this.getCommonParentFromMultiple(sourceTileNodes);

                destNodePath = destNode.getPath();

                if (length === 1) {
                    sourceNodePath = sourceTileNodes[0].getPath();
                }
                else {
                    sourceTileNodes = modelClassNamespace.EquationManagerPro.Utils.getAllLeaves(sourceTileNodes[0]);
                    sourceNodePath = sourceTileNodes[0].getPath();
                }

                if (sourceTileNodes[0].parent.data === destNode.parent.data && sourceTileNodes[0].parent === destNode.parent) {
                    this.$el.addClass('hover-border');
                }
                else {
                    if (isInterLevel === true) {
                        arr = destNode.getPath();
                        commonNode = root;
                        if (destTileSection) {
                            firstChild = commonNode.children[0];
                        }
                        else {
                            firstChild = commonNode.children[1];
                        }
                        if (firstChild && (firstChild.data === '*' || firstChild.data === '/')) {
                            commonNode = firstChild;
                            tilesInsideNode = this._getTilesModelsInsideNode(commonNode);
                        }
                        else {
                            firstChild = this._getChildOfRoot(root, destNode);
                            tilesInsideNode = this._getTilesModelsInsideNode(firstChild);
                        }
                        for (i = 0; i < tilesInsideNode.length; i++) {
                            this._highlightTile(tilesInsideNode[i], modelRef, equationView);
                        }
                    }
                    else {
                        var tempLen;
                        if (sourceNodePath.length > destNodePath.length) {
                            tempLen = sourceNodePath.length;
                        }
                        else {
                            tempLen = destNodePath.length;
                        }

                        for (; i < tempLen; i++) {
                            if (destNodePath[i] === sourceNodePath[i]) {
                                arr.push(destNodePath[i]);
                            }
                            else {
                                break;
                            }
                        }
                        commonNode = root.getChildAt(arr);
                        if (commonNode.data === '*' || commonNode.data === '+') {
                            var operators = this.getOperatorsBetween(sourceTileNodes[0], destNode);
                            if (this._isTakeOutCommon(operators) === true) {
                                if (commonNode.data === '*') {
                                    //takeout common
                                    for (i = 0; i < commonNode.children.length; i++) {
                                        // case 1/2 * (4 + 5*7) * (8 + 5*6) => drag 8 on 7
                                        testNodeIndex = commonNode.children[i].getPath().join('.');
                                        if (testNodeIndex !== sourceNodePath.join('.').substring(0, testNodeIndex.length)) {
                                            tilesInsideNode = tilesInsideNode.concat(this._getTilesModelsInsideNode(commonNode.children[i]));
                                            isParenthesesAsCoeff = false;
                                        }
                                    }
                                    // case : (a + b) (c + d)
                                    if (isParenthesesAsCoeff) {
                                        var siblingBranchContainsDest = this._getSourceSiblingBranchContainsDest(sourceTileNodes[0], destNode, commonNode, root);
                                        tilesInsideNode = this._getTilesModelsInsideNode(siblingBranchContainsDest);
                                    }
                                }
                                else {
                                    //combine commmand
                                    var siblingBranchContainsDest = this._getSourceSiblingBranchContainsDest(sourceTileNodes[0], destNode, commonNode, root);
                                    tilesInsideNode = this._getTilesModelsInsideNode(siblingBranchContainsDest);
                                }
                            }
                            else {
                                //combine commmand
                                var siblingBranchContainsDest = this._getSourceSiblingBranchContainsDest(sourceTileNodes[0], destNode, commonNode, root);
                                tilesInsideNode = this._getTilesModelsInsideNode(siblingBranchContainsDest);
                            }

                        }
                        else if (commonNode.data === '/') {
                            //highlight all either denominator or numerator --> combine command
                            var fraction;
                            if (destTileLocation && commonNode.children[1].data === '+') {
                                fraction = commonNode.children[1];
                            }
                            else if ((!destTileLocation && commonNode.children[0].data === '+')) {
                                fraction = commonNode.children[0];
                            }
                            else {
                                fraction = destNode;
                            }
                            tilesInsideNode = this._getTilesModelsInsideNode(fraction);
                        }
                        for (i = 0; i < tilesInsideNode.length; i++) {
                            this._highlightTile(tilesInsideNode[i], modelRef, equationView);
                        }
                    }
                }
            }
            //// for marquee testing is required...
            //if (sourceNodesParent.data === destNode.parent.data) {
            //    this.$el.addClass('hover-border');
            //}
            //else {
            //    destNodeSiblings = destNode.parent.children;
            //    for (index = 0; index < destNodeSiblings.length; index++) {
            //        this._highlightTile(destNodeSiblings[index].data, modelRef, equationView);
            //    }
            //}

        },


        _getChildOfRoot: function _getChildOfRoot(root, destNode) {
            var destNodePath = destNode.getPath();
            if (destNodePath.length > 1) {
                return root.getChildAt([destNodePath[0], destNodePath[1]]);
            }
            else {
                return destNode;
            }
        },

        /**
        * check for take out common or combine command
        * @method _isTakeOutCommon
        * @param {operators} array of operators
        * @private
        */
        _isTakeOutCommon: function _isTakeOutCommon(operators) {
            var node1ToParentOperators = operators.node1ToParentOperators || [];
            if (node1ToParentOperators.length) {
                for (var i = node1ToParentOperators.length - 1; i >= 0; i--) {
                    if (node1ToParentOperators[i].data === '^') {
                        return true;
                    }
                }
                return false;
            }
            else {
                return false;
            }

        },

        /**
        * Get sibling branch which contains destination  item
        * @method _getSourceSiblingBranchContainsDest
        * @param {source} source node
        * @param {destNode} dest node
        * @param {commonParent} common parent
        * @param {root} root of the tree
        * @return {node} branch
        * @private
        */
        _getSourceSiblingBranchContainsDest: function _getSourceSiblingBranchContainsDest(source, destNode, commonParent, root) {
            var sourceNodePath = source.getPath(),
                destNodePath = destNode.getPath(),
                commonNodePath = commonParent.getPath(), tempLen,
                siblingBranch = commonNodePath;

            siblingBranch.push(destNodePath[commonNodePath.length]);
            return root.getChildAt(siblingBranch);
        },

        /**
        * Gets common parent of source and dest node
        * @method _getCommonParentOfSourceAndDest
        * @param {source} source node
        * @param {destNode} dest node
        * @param {root} root of the tree
        * @return {node} common parent
        * @private
        */
        _getCommonParentOfSourceAndDest: function _getCommonParentOfSourceAndDest(source, dest) {
            var destParent = dest.parent, result,
                sourceParent = source.parent;

            while (destParent !== sourceParent) {
                destParent = destParent.parent;
                sourceParent = sourceParent.parent;
            }
            return destParent;
        },

        /**
        * gets all leaf nodes (tile item models) under specified node
        * @method _getTilesModelsInsideNode
        * @param {node} node
        * @return {tileModels} array of tile models
        * @private
        */
        _getTilesModelsInsideNode: function _getTilesModelsInsideNode(node) {
            var parent = node.parent, tileModels = [], i = 0, data = node.data,
                children;

            if (typeof data === 'string' || data === null) {
                children = node.children;
                for (; i < children.length; i++) {
                    tileModels = tileModels.concat(this._getTilesModelsInsideNode(children[i]));
                }
            }
            else {
                tileModels.push(data);
            }
            return tileModels;
        },

        /**
        * hover effect of tile
        * @method _highlightTile
        * @param {tileModel} tile ite Model
        * @param {modelRef} equation view model
        * @param {equationView} equation view
        * @private
        */
        _highlightTile: function (tileModel, modelRef, equationView) {
            var tileIndex, tileView;
            tileIndex = modelRef.getIndexFromItemModel(tileModel);
            tileView = equationView.getViewFromIndex(tileIndex);
            tileView.highlightTiles();
        },

        /**
        * returns true if tile is repositioned across section
        * @method _isInterLevel
        * @param {sourceIndexStr} source index
        * @param {destTileIndex} dest index
        * @return {boolean}
        * @private
        */

        _isInterLevel: function _isInterLevel(sourceIndexStr, destTileIndex) {
            if (+sourceIndexStr.substr(0, 1) === +destTileIndex.substr(0, 1)) {
                return false;
            }
            return true;
        },

        getWhetherTermPresent: function getWhetherTermPresent(term) {
            if (term === this) {
                return true;
            }

            return false;
        },

        /***********************************************************************BASE COMMAND METHODS ******************************************/

        /**
         * Checks if the tile item given is a basic tile type. like term tile or base exponent
         * @method isBasicTileType
         * @public
         *
         * @param   {Object}  tile The model whose type is to be determined.
         * @returns {Boolean} true if it is the basic tile tile type else false.
         */
        isBasicTileType: function isBasicTileType(tile) {
            var tileType = tile.get('type'),
                tileClass = modelClassNamespace.TileItem.TileType;
            return tileType === tileClass.TERM_TILE || tileType === tileClass.BASE_EXPONENT;
        },

        /**
        * Returns the position of a tile inside the parent.
        * For a location string "0.1.2.3" the position of the parent is "0.1.2" and the position of the tile
        * with respect to parent is "3"
        *
        * @method getSourceWrtParent
        * @param {String} index of a tile
        * @return {String} index of tile with respect to parent
        */
        getSourceWrtParent: function (index) {
            var lastIndexSeparator = index.lastIndexOf(modelClassNamespace.CommandFactory.SEPARATOR);
            return index.substring(lastIndexSeparator + 1);
        },

        /**
        * Returns the index string of the parent.
        * For an index string "0.1.2.3" the position of the parent is "0.1.2"
        *
        * @method getParentIndex
        * @private
        * @param {String} index of a tile
        * @return {String} index string of parent
        */
        getParentIndex: function (index) {
            if (index.length === 1) {
                return "";
            }
            var lastIndexSeparator = index.lastIndexOf(modelClassNamespace.CommandFactory.SEPARATOR);
            return index.substring(0, lastIndexSeparator);
        },

        /**
         * Will return the parent tiles the givwn tile index
         * @param   {Object}   modelRef The reference to the equation view model
         * @param   {String}   index    The index string refering a tile
         * @param   {[[Type]]} length   [[Description]]
         *
         * @method getParentTiles
         */
        getParentTiles: function (modelRef, index) {
            index = this.getParentIndex(index);
            return modelRef.getModelFromIndex(index).get('tileArray');
        },

        /**
        * Return the common parent of the  two nodes
        *
        * @method getCommonParent
        * @param {Object} one node whose common parent is to be found
        * @param {Object} another node whose common parent is to be found
        * @return {Object} common parent of the two nodes i.e. node1 and node2
        */
        getCommonParent: function (node1, node2) {
            var node1Path = node1.getPath(),
                node2Path = node2.getPath(),
                root = node1.getTreeRoot(),
                length = Math.min(node1Path.length, node2Path.length),
                commonParentPos = [],       // root node
                i = 0;

            for (; i < length; i++) {
                if (node1Path[i] === node2Path[i]) {
                    commonParentPos[i] = node1Path[i];
                }
                else {
                    break;
                }
            }
            return root.getChildAt(commonParentPos);
        },

        /**
        * Return the common parent of the  multiple nodes
        *
        * @method getCommonParentFromMultiple
        * @param {Array} Nodes whose common parent is to be found
        * @return {Object} common parent of all the nodes
        */
        getCommonParentFromMultiple: function (nodes) {
            if (nodes.length === 1) {
                return nodes[0];
            }

            var currentCommonParent = this.getCommonParent(nodes[0], nodes[1]),
                i = 0;
            if (nodes.length === 2) {
                return currentCommonParent;
            }

            for (i = 2; i < nodes.length && !currentCommonParent.isRoot() ; i++) {
                currentCommonParent = this.getCommonParent(currentCommonParent, nodes[i]);
            }

            return currentCommonParent;
        },

        /**
        * Returns an array of operators between node 1 and node 2
        *
        * @method getOperatorsBetween
        * @param {Object} First node
        * @param {Object} Second node
        * @return {Array} Operator nodes between the two nodes
        */
        getOperatorsBetween: function (node1, node2) {
            var commonParent = this.getCommonParent(node1, node2),
                operators = {},
                operator = null,
                currentNode = node1,
                parentOperator,
                node1ToParentOperators = [],
                node2ToParentOperators = [];

            // add commonParent operator
            operators.commonParentOperator = commonParent;

            //  go from node1 to commonParent
            while (!_.isEqual(currentNode, commonParent) && !_.isEqual(currentNode.parent, commonParent)) {
                operator = currentNode.parent;
                node1ToParentOperators.push(operator);
                currentNode = currentNode.parent;
            }
            operators.node1ToParentOperators = node1ToParentOperators;

            currentNode = node2;
            //  go from node2 to commonParent
            while (!_.isEqual(currentNode, commonParent) && !_.isEqual(currentNode.parent, commonParent)) {
                operator = currentNode.parent;
                node2ToParentOperators.push(operator);
                currentNode = currentNode.parent;
            }
            operators.node2ToParentOperators = node2ToParentOperators;

            return operators;
        },

        /**
        * Returns operator strings between two nodes
        *
        * @method getOperatorStringsBetween
        * @param {Object} First node
        * @param {Object} Second node
        * @return {Array} Operator strings between the two nodes
        */
        getOperatorStringsBetween: function (node1, node2) {
            var operators = this.getOperatorsBetween(node1, node2),
                operatorStrings = [],
                i = 0;
            for (i = 0; i < operators.node1ToParentOperators.length; i++) {
                operatorStrings.push(operators.node1ToParentOperators[i].data);
            }
            operatorStrings.push(operators.commonParentOperator.data);
            for (i = operators.node2ToParentOperators.length - 1; i >= 0; i--) {
                operatorStrings.push(operators.node2ToParentOperators[i].data);
            }
            return operatorStrings;
        },

        /**
        * Converts an array of tiles to an array of nodes.
        *
        * @method tilesToNodes
        * @param {Object} Root node of the tree
        * @param {Array} Array of tiles
        * @return {Array} Array of nodes
        */
        tilesToNodes: function (root, tiles) {
            var nodes = [],
                i = 0;
            for (i = 0; i < tiles.length; i++) {
                nodes.push(this.searchInTree(root, tiles[i]));
            }
            return nodes;
        },

        /**
         * Searches for the given model in the tree
         * @param   {Object} root  The root node
         * @param   {Object} model The given model needed to be searched
         * @returns {Object} The tree node where that model resides
         */
        searchInTree: function (root, model) {
            var index, foundNode;
            if (root === null || root === undefined) {
                return null;
            }
            if (root.data === model || root.collectionData === model) {
                return root;
            }
            else {
                for (index = 0; index < root.children.length; index++) {
                    foundNode = this.searchInTree(root.children[index], model);
                    if (foundNode !== null && foundNode !== undefined) {
                        return foundNode;
                    }
                }
            }
        },

        /**
         * Gets model from tree node
         * @method getModelDataFromTreeNode
         * @public
         *
         * @param   {Object} child The tree node
         * @returns {Object} The model from the tree node
         */
        getModelDataFromTreeNode: function (child) {
            if (_.isString(child.data)) {
                if (child.collectionData) {
                    return child.collectionData
                }
            }
            return child.data;
        },

        /***********************************************************************BASE COMMAND METHODS END******************************************/



        /**
        * mouse out event on parantheses
        * @method onMouseOut
        * @param {event} event object
        * @param {ui} jquery ui object
        * @public
        */
        onMouseOut: function onMouseOut(event, ui) {
            this.equationManager.equationView.$el.find('.hover-border').removeClass('hover-border');
        },

        /**
        * Handler for MouseDown on whole tile
        *
        * @method _onMouseDownTile
        * @param {Object} evt Mouse event
        * @private
        */
        _onMouseDownTile: function (event) {
            var rectBase = new Rect(this.$el[0].getBoundingClientRect()),
                evt = event.originalEvent ? event.originalEvent : event,
                ptMouse, isSourceBase, isSourceExponent,
                isDraggable = this.$el.is('.ui-draggable');
            if (isDraggable) {
                this.$el.draggable('option', 'cursorAt', { left: this.$el.width() / 2, top: this.$el.height() / 2 });
            }

            evt = (evt.type === 'touchstart') ? evt.touches[0] : evt;
            ptMouse = new Point({ left: evt.clientX, top: evt.clientY });
            isSourceBase = rectBase.isPointInRect(ptMouse);

            //isDraggable && this.$el.draggable('disable');
            //isBaseDraggable && this.$base.draggable('disable');
            //isExpDraggable && this.$exponent.draggable('disable');
            // don't propagate the event only if the click is on the exponent or the base
            // propagate otherwise so marquee can handle it
            if (isSourceBase) {
                event.stopPropagation && event.stopPropagation();
                event.preventDefault && event.preventDefault();
                this.equationManager.mouseDownOnInteractive(event, true, true, false);
                this.attachEventsOnTile();
                this.equationManager.adjustContainment(this.$el);
                window.clearTimeout(this.equationManager.timerId);
                this.equationManager.getLhsRhsContainerRects();
                this.equationManager.enableDisableDroppables(event);
                //if (this.equationManager.getFirstTileDrop() && this.equationManager.getTileAddedInExpression() === null) {
                this.tileToNegate();
                //}
                this.stopReading();
                return false;
            }
            isDraggable && this.$el.draggable('disable');
            return true;
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
        * stops listening events
        * @method stopListeningEvents
        * @public
        */
        stopListeningEvents: function (bRecursive) {
            this.stopListening();
        },

        /**
        * Handler for MouseUp on whole tile
        *
        * @method _onMouseUpTile
        * @param {Object} evt Mouse event
        * @private
        */
        _onMouseUpTile: function (evt) {
            var evt = evt.originalEvent ? evt.originalEvent : evt;
            this.attachEventsOnTile();
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
                base = model.get('base'),
                //base = (base) ? base : '__',
                htmlString = '',
                baseVal = base,
                baseNotNull = true,
                isVariable = false;

            if (typeof base === 'string') {
                isVariable = true;
            }

            //multiplicationOperatiorClass = this.filePath.getFontAwesomeClass('dot');

            //if (baseVal < 0) {
            //    base = '<span class="minus-sign-base equation-common">&minus;</span>' + Math.abs(baseVal);
            //}
            //if (operator === '*') {
            //    htmlString = htmlString + '<div class=\'operator-data-tab\'><div></div></div>';
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
                    //htmlString = htmlString + '<div class=\'addition-operator equation-common\'><div>&#43;</div></div>';
                    htmlString += MathInteractives.Common.Components.templates['mathematicalOperators']({
                        operator: {
                            'addition': true
                        }
                    }).trim();
                    break;
            }

            //if (baseVal < 0) {
            //    if (base === null) {
            //        htmlString += '<div class=\'static-empty-tile empty-tile\'><div class=\'box\'><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div></div></div>';
            //    }
            //    else {
            //        htmlString += '<span class=\'base-exp-data-tab equation-common\'>(' + base + ')</span>';
            //    }
            //}
            //else {
            //    if (base === null) {
            //        htmlString += '<div class=\'static-empty-tile empty-tile\'><div class=\'box\'><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div><div class=\'inside-divs\'></div></div></div>';
            //    }
            //    else {
            //        htmlString += '<span class=\'base-exp-data-tab equation-common\'>' + base + '</span>';
            //    }
            //}

            if (base === null) {
                baseNotNull = false;
            }

            htmlString += MathInteractives.Common.Components.templates['termTileExpr']({
                'baseValNegative': _.isString(baseVal) ? baseVal.indexOf('-') !== -1 : baseVal < 0,
                'base': base,
                'absBase': _.isString(baseVal) ? baseVal.replace('-', '') : Math.abs(baseVal),
                'baseNotNull': baseNotNull,
                'isVariable': isVariable
            }).trim();

            return htmlString;
        },

        getAccString: function getAccString(avoidOperator) {
            var currentString = '',
                model = this.model,
                operator = model.get('operator'),
                base = model.get('base'),
                iotaExponent = model.get('iotaExponent'),
                squareRootProps = model.get('squareRootProps'),
                isDenominator = model.get('isDenominator'),
                operator = isDenominator && !operator ? '/' : operator,
                minusText = null,
                squareRootText = null,
                baseString = null,
                iText = null,
                iotaText = null,
                roundedBase = null;

            if (!avoidOperator) {
                switch (operator) {
                    case '*':
                        currentString += this.getAccMessage('operators-text', 0);
                        break;
                    case '+':
                        currentString += this.getAccMessage('operators-text', 1);
                        break;
                    case '/':
                        currentString += this.getAccMessage('operators-text', 2);
                        break;
                    default:
                        currentString += '';
                        break;
                }
            }

            //if (model.get('operator')) {
            //    currentString = this.getMessage('base-exp-pair', 2);
            //}
            //else if(this.parent.model.get('type') === TYPES.FRACTION && this.model.get('bDenominator')) {
            //    currentString = this.getMessage('base-exp-pair', 1);
            //}

            if (squareRootProps) {
                if (squareRootProps.isNegative) {
                    minusText = this.getAccMessage('comm19', 0);
                }
                squareRootText = this.getAccMessage('operators-text', 3);
            }

            if (iotaExponent) {
                baseString = base.toString();

                if (base === -1 || base === 1) {
                    iText = (baseString.indexOf('-') !== -1 ? this.getAccMessage('comm19', 0) + ' i' : 'i');
                }

                iotaText = (iText ? iText + (iotaExponent === 2 ? ' ' + this.getAccMessage('operators-text', 4) : '') :
                (squareRootProps ? '' : base) + (iotaExponent === 2 ? ' i ' + this.getAccMessage('operators-text', 4) : ' i'));
            }


            if (base === null) {
                //     base = this.getAccMessage('prefixed-statements', 6, [this.getAccMessage('equation-reading-text', (this.model.get('isLHS') ? 4 : 5))]);
                base = this.getAccMessage('prefixed-statements', 13);   //Bugfix #65923
            }

            if (iotaExponent || squareRootProps) {
                // i and square root cases

                if (minusText) {
                    currentString += ' ' + minusText;
                }

                currentString += ' ' + (iotaExponent ? iotaText : '') + (squareRootProps ? ' ' + squareRootText + ' ' + base : '');
            }
            else {
                if (isNaN(base)) {
                    roundedBase = base;
                }
                else {
                    roundedBase = Math.round(base * 100) / 100;
                }
                currentString = currentString + ' ' + roundedBase;
            }

            return ' ' + currentString.trim();
        },

        /**
        * Returns the elements that are inside the marquee drawn.
        * @method getElementsInsideMarquee
        * @param {Object} Marquee end event
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
            }

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
            this.$el.off('mousedown.tile')
                .off('mouseup.tile')
                .addClass('no-hover');
            this.detachEventsOnTile();
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

        /**
        * As per given action and offset, set event on view
        *
        * @method attachEventOnView
        * @param {Number} simulateAction Simulate action enum number which is to be bind
        * @param {Number} offset Offset 0 for Base and 1 for Exponent (Only for build mode)
        * @public
        */
        attachEventOnView: function (simulateAction) {
            var self = this;

            switch (simulateAction) {
                case 1:
                case 7:
                    // Click
                    this.$el.on('click', $.proxy(this._onBaseClick, this));
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
                    this.attachEventsOnTile();
                    break;
                case 6:
                    // Marquee
                    this.$el.on('mousedown', $.proxy(this._onMouseDownTile, this));
                    this.$el.on('mouseup', $.proxy(this._onMouseUpTile, this));
                    break;
                default:
                   // console.log('Please give proper event enum');
                    break;
            }
        }

    }, {

    });

})(window.MathInteractives);
