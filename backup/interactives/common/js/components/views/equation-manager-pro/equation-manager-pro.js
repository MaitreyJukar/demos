(function (MathInteractives) {
    'use strict';

    var viewNameSpace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point,
        BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

    /**
    * Tile Manager controls tile item activities.
    *
    * @class EquationManagerPro
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    */
    viewNameSpace.EquationManagerPro = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Reference of main equation view.
        * @property equationView
        * @type Object
        * @default null
        */
        equationView: null,

        /**
        * Reference of command factory
        * @property commandFactory
        * @type Object
        * @default null
        */
        commandFactory: null,

        /**
        * Jquery object for tile items containment container
        * @property $draggableContainment
        * @type Object
        * @default null
        */
        $draggableContainment: null,

        /**
        * boolean for not adding fanning animation class
        * @property restrictFirstTileAnimation
        * @type Boolean
        * @default false
        */
        restrictFirstTileAnimation: false,

        /**
        * Jquery object of first tile view
        * @property firstTile
        * @type Object
        * @default null
        */
        firstTile: null,

        /**
        * Jquery object of currently hovered tile
        * @property currentHoveredTile
        * @type Object
        * @default null
        */
        currentHoveredTile: null,

        /**
        * returns an id prefix
        * @method getIdPrefix
        * @return idPrefix {string}
        * @public
        */
        getIdPrefix: function () {
            return this.idPrefix;
        },

        /**
        * Root of the tree
        * @property root
        * @type Object
        * @default null
        */
        root: null,

        /**
        * stores whether a device is touch
        * @property _isTouch
        * @type Boolean
        * @default null
        */
        _isTouch: null,

        /**
        * whether a tile item is being dropped
        * @property _isDropped
        * @type Boolean
        * @default false
        */
        _isDropped: false,


        /**
        * status of an _isDropped
        * @method getIsDropped
        * @public
        */
        getIsDropped: function () {
            return this._isDropped;
        },

        /**
        * sets an _isDropped
        * @method setIsDropped
        * @param {value} boolean
        * @public
        */
        setIsDropped: function (value) {
            this._isDropped = value;
        },

        deletedItemsInParenthesesFraction: null,


        /**
        * Jquery object for the bin tile items containment container.
        * @property $binTileContainment
        * @type Object
        * @default null
        */
        $binTileContainment: null,

        /**
        * Holds the value for number of X tiles needde in the bin.
        * @property tileTextFrequencyArray
        * @type Number
        * @default 0
        */

        tileTextFrequencyArray: 0,

        /**
        * Holds the array of texts to be shown on tile.
        * @property tileTextArray
        * @type Number
        * @default 0
        */

        tileTextArray: null,

        /**
        * Reset button type.
        * @property resetButtonType
        * @type String
        * @default null
        */

        resetButtonType: null,

        /**
        * Undo button type.
        * @property undoButtonType
        * @type String
        * @default null
        */

        undoButtonType: null,

        /**
        * Holds the undo & reset button containers.
        * @property $buttonGroupContainer
        * @type String
        * @default null
        */

        $buttonGroupContainer: null,

        /**
        * Holds the reset button view.
        * @property resetButtonView
        * @type Object
        * @default null
        */

        resetButtonView: null,

        /**
        * Holds the undo button view.
        * @property undoButtonView
        * @type Object
        * @default null
        */

        undoButtonView: null,

        /**
        * Holds the
        *
        * @property numericTileArray
        * @type Array
        * @default null
        **/

        numericTileArray: null,

        timerId: null,

        /**
        * Holds the entire bin tile array.
        *
        * @property binTileArray
        * @type Array
        * @default null
        **/

        binTileArray: null,

        /**
        * Holds the button text color for the reset button.
        *
        * @property resetButtonTextColor
        * @type String
        * @default null
        **/

        resetButtonTextColor: null,

        /**
        * Holds the button text color for the undo button.
        *
        * @property undoButtonTextColor
        * @type String
        * @default null
        **/

        //addTileInExpression: null,

        //tileAddedFromBinValue: null,

        undoButtonTextColor: null,

        $lhsExprView: null,
        $rhsExprView: null,
        $lhsExprBgView: null,
        $rhsExprBgView: null,
        $showLhsExprBgView: null,
        $showRhsExprBgView: null,
        $lhsExprEqnHolder: null,
        $rhsExprEqnHolder: null,

        isTutorialMode: false,

        marqueeSelectedItems: null,

        marqueeSelectedRefNodes: null,

        marqueeNodes: null,


        marqueeView: null,
        marqueeViews: null,

        postIdPrefixString: '',

        resetPopUpTexts: null,

        showRightTooltip: false,

        showLeftTooltip: false,

        tabOrderArr: [],

        termTileConextMenuScreenId: null,

        /**
      * Contains index of first element to be selected by marquee in tutorial mode.
      *
      * @property _tutorialMarqueeFirstElementIndex
      * @type String
      * @default null
      * @private
      */
        _tutorialMarqueeFirstElementIndex: null,

        /**
        * Contains index of first element to be selected by marquee in tutorial mode.
        *
        * @property _tutorialMarqueeFirstElementIndex
        * @type String
        * @default null
        * @private
        */
        _tutorialMarqueeLastElementIndex: null,

        combineLikeBasesTooltip: null,


        //leftEquationTooltip: null,

        //rightEquationTooltip: null,

        tabIndex: null,

        $equationCOntainer: null,

        accDivOffset: null,

        ignoreChangeSignForTextTile: false,

        initialize: function () {
            var options = this.options,
                tileTextFrequencyArray = options.tileTextFrequencyArray,
                tileTextArray = options.tileTextArray,
                numericTileArray = options.numericTileArray,
                undefinedString = "undefined",
                defaultButtonType = MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                defaultButtonTextColor = '#ffffff',
                browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
                self = this,
                postIdPrefixString = options.postIdPrefixString,
                ignoreChangeSignForTextTile = options.ignoreChangeSignForTextTile,
                termTileContextMenuScreenId = options.termTileContextMenuScreenId;
            this.binTileArray = [];
            this.onlyLHS = options.onlyLHS;
            this.solveFractionToDecimal = this.model.get('isFractionToDecimalAllowed');
            this._isIE9 = browserCheck.isIE && browserCheck.browserVersion < 10;
            this.initializeDefaultProperties();

            this.marqueeViews = [];
            this.marqueeSelectedRefNodes = [];
            this.deletedItemsInParenthesesFraction = [];
            this.isBottomExpressionShown = this.options.isBottomExpressionShown;
            this._createCommandFactory({});
            this.parenthesesColor = options.parenthesesColor;
            if (options.$binTileDraggableContainment) {
                this.$binTileDraggableContainment = options.$binTileDraggableContainment;
            }
            if (options.draggableContainment) {
                this.$draggableContainment = options.draggableContainment;
            }
            if (options.binTileContainment) {
                this.$binTileContainment = options.binTileContainment;
            }
            if (typeof tileTextFrequencyArray !== undefinedString && tileTextFrequencyArray !== null) {
                this.tileTextFrequencyArray = tileTextFrequencyArray;
            }
            if (typeof tileTextArray !== undefinedString && tileTextArray !== null) {
                this.tileTextArray = tileTextArray;
            }
            if (typeof numericTileArray !== undefinedString && numericTileArray !== null) {
                this.updatesNumericTileArray(numericTileArray);
            }

            if (postIdPrefixString) {
                this.postIdPrefixString = postIdPrefixString;
            }
            if (options.tabIndex) {
                this.tabIndex = options.tabIndex;
            }
            if (options.accDivOffset) {
                this.accDivOffset = options.accDivOffset;
            }

            if (ignoreChangeSignForTextTile) {
                this.ignoreChangeSignForTextTile = ignoreChangeSignForTextTile;
            }

            if (termTileContextMenuScreenId) {
                this.termTileConextMenuScreenId = termTileContextMenuScreenId;
            }

            this.binTileArray = options.numericTileArray || [];

            this.setElement(options.element);
            this.$overlayDiv = $('<div></div>').addClass('overlay-div').hide();
            this.$overlayDiv2 = $('<div></div>').addClass('overlay-div overlay-div-2').hide();
            this.$el.append(this.$overlayDiv).append(this.$overlayDiv2);
            //if (this.isMobile) {
            //    this.$ipadScrollArea = $('<div></div>').addClass('swipe-region');
            //    this.$el.append(this.$ipadScrollArea);
            //}
            this._setNegativeSign();
            this.$equationContainer = this.$el;
            if (options.createTileBin === true) {
                //this.createTilesInBin();
                //this._attachHoverTileEvents(self);
                //this._attachNegateTileEvents(self);
                this.updateTilesInBin(options.isTutorial);
            }
            if (options.createButtonGroup === true) {
                this.buttonGroup = (options.buttonGroup) ? options.buttonGroup : [];
                this.resetButtonType = (options.resetButtonType) ? options.resetButtonType : defaultButtonType;
                this.undoButtonType = (options.resetButtonType) ? options.resetButtonType : defaultButtonType;
                this.resetButtonTextColor = (options.resetButtonTextColor) ? options.resetButtonTextColor : defaultButtonTextColor;
                this.undoButtonTextColor = (options.undoButtonTextColor) ? options.undoButtonTextColor : defaultButtonTextColor;
                this.undoButtonWidth = (options.undoButtonWidth) ? options.undoButtonWidth : null;
                this.resetButtonWidth = (options.resetButtonWidth) ? options.resetButtonWidth : null;
                this.$buttonGroupContainer = options.buttonGroupContainer;
                this._createResetUndoButtons();
            }

            if (options.resetPopUpTexts) {
                this.resetPopUpTexts = options.resetPopUpTexts;
            }

            this.loadScreen('equation-manager-pro-messages');
            this.marqueeContainer = options.marqueeDiv || this.$equationContainer || this.$el;

            

            /*
            if (this.isBottomExpressionShown) {
                this._createEquationTooltips(!options.isTutorial ? '' : 'tutorial-');
            }
            */


        },

        /**
        * Set the isTouch instance attribute.
        * @method _setIsTouch
        * @private
        */
        _setIsTouch: function () {
            var browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            this._isTouch = browserCheck.isAndroid || browserCheck.isIOS;
        },

        /**
        * Sets _isTouch attr in EM.
        * @method isTouch
        * @return {Boolean} True if device is Android or IOS. False otherwise.
        */
        isTouch: function () {
            if (this._isTouch === null) {
                this._setIsTouch();
            }
            return this._isTouch;
        },

        /**
        * Creates command factory.
        * @method render
        * @private
        */
        render: function (resetClicked) {
            this.equationView.createView(this.parenthesesColor);
            this.equationView.checkForFractionInExpression();
            this.equationView.hideOperatorOfParCoeff();
            this._checkOfIntroductionOfParenthesesOrFraction();
            this.isExpressionContainsParentheses();
            this._cacheWindowElements();
            this._attachEvents();
            if (this.options.createTileBin) {
                this._setDropSlotsForBinTiles();
            }
            if (this.isBottomExpressionShown) {
                this._updateBottomEquations();
            }
            this.getLhsRhsContainerRects();
            //reset array of fraction and parentheses rules check..
            this.setDeletedItemsInParenthesesFraction();
            this._createTooltips();

            this.marqueeViews = this._generateMarquee();
            this._handleTouchScroll();
            this.removeMarquee();
            this._firstTileDrop(resetClicked);
        },

        _firstTileDrop: function _firstTileDrop() {

        },



        /**
        * Adds the isTouch class to the el when it's a touch device &
        * add FA classes to the douvle angles.
        * @method _handleTouchScroll
        * @private
        */
        _handleTouchScroll: function () {
            var angleDoubleLeft, angleDoubleRight;
            if (!this.isMobile) {
                return;
            }

            this.$el.addClass('is-touch');

            angleDoubleLeft = this.filePath.getFontAwesomeClass('angle-double-left');
            angleDoubleRight = this.filePath.getFontAwesomeClass('angle-double-right');
            this.$('.double-angle-left').addClass(angleDoubleLeft);
            this.$('.double-angle-right').addClass(angleDoubleRight);
            this.$('.swipe-region-text').html(this.getMessage('swipe-region-text', 0));
        },


        /**
        * Creates command factory.
        * @method _createCommandFactory
        * @private
        */
        _createCommandFactory: function (data) {
            data = data || {};
            this.commandFactory = new modelClassNameSpace.CommandFactory(data);
        },

        /**
         * Creates equation view structure.
         * @method setData
         * @public
         * @param data {Object} equation data.
         */
        setData: function (data, isResetClick) {
            this.resetData();
            var modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro,
                equationModel = new modelClassNamespace.Equation(data.equationData),
                equationHtml = null, equationAccString = '';

            this.equationView = new viewNameSpace.EquationView({
                model: equationModel,
                equationManager: this,
                player: this.player
            });
            if (data.equationViewContainer) {
                this.equationView.setEquationContainer(data.equationViewContainer);
            }
            else {
                throw new Error('Provide EquationView container');
            }
            var obj = {
                modelRef: this.equationView.model,
                allowedOperation: data.cmdFactoryData.allowedOperation || this.model.get('allowedOperation')
            };
            if (!isResetClick) {
                if (this.isBottomExpressionShown) {
                    // get initial html form of string and trigger event for form expr
                    equationHtml = this.equationView.getTileContentInHtmlForm();
                    equationAccString = this.equationView.getAccString(viewNameSpace.EquationManagerPro.DATA);
                    this.trigger(viewNameSpace.EquationManagerPro.EVENTS.NEW_EXPRESSION_START, { equationHtml: equationHtml, equationAccString: equationAccString });
                }
            }
            this.commandFactory.setData(obj);
            this.setTreeRoot();

            if (this.undoButtonView) {
                //this._enableDisableButtons(this.undoButtonView, false);
                this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.UNDO_BUTTON, false);
            }
            if (this.resetButtonView) {
                //this._enableDisableButtons(this.resetButtonView, this.model.get('resetBtnStatus'));
                this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.RESET_BUTTON, this.model.get('resetBtnStatus'));
            }
        },

        /**
         * Resets data
         * @method resetData
         * @public
         */
        resetData: function () {
            if (this.equationView) {
                this.equationView.reset();
                this.equationView = null;
            }
            this.commandFactory.resetData();
        },

        resetBools: function resetBools() {
            this.setTileAddedFromBinValue();
            this.setTileAddedInExpression();
        },

        /**
         * attaches events
         * @method _attachEvents
         * @private
         */
        _attachEvents: function () {
            var self = this;
            //this.attachMouseWheelHandler();
            this.equationView.attachEvents();

            this.$overlayDiv && this.$overlayDiv.on('mousedown', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                return false;
            });

            this.$overlayDiv2 && this.$overlayDiv2.on('mousedown', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                return false;
            });

            this.$el.off('mousedown.eqnMgr').on('mousedown.eqnMgr', function () {
                self.stopReading();
            });
        },

        /**
         * adjust the containment of draggable
         * @method adjustContainment
         * @public
         */
        adjustContainment: function ($element) {
            if (this.model.get('adjustContainment') && this.$draggableContainment) {
                var elmWidth = ($element instanceof Rect) ? $element.getWidth() : $element.outerWidth(),
                    errorCorrection = -2,
                    inflateWidth = elmWidth / 2 + errorCorrection,
                    equationWidth = this.$equationContainer.width();
                this.$draggableContainment.css({ width: equationWidth + inflateWidth * 2, left: -inflateWidth });
                this.$equationContainer.css('max-width', equationWidth);
            }
        },

        /**
         * resets the containment of draggable
         * @method resetContainment
         * @public
         */
        resetContainment: function () {
            if (this.model.get('adjustContainment') && this.$draggableContainment) {
                this.$draggableContainment.css({ width: '', left: '' });
                this.$equationContainer.css('max-width', '');
            }
        },

        /**
         * whether to show or hide the overlay div
         * @method showHideOverlayDiv
         * @param {bShow} boolean
         * @public
         */
        showHideOverlayDiv: function (bShow) {
            if (bShow) {
                this.$overlayDiv && this.$overlayDiv.show();
            }
            else {
                this.$overlayDiv && this.$overlayDiv.hide();
            }
        },

        /**
         * whether to show or hide the second overlay div
         * @method showHideOverlayDiv2
         * @param {bShow} boolean
         * @public
         */
        showHideOverlayDiv2: function showHideOverlayDiv2(bShow) {
            if (bShow) {
                this.$overlayDiv2 && this.$overlayDiv2.show();
            }
            else {
                this.$overlayDiv2 && this.$overlayDiv2.hide();
            }
        },

        /**
         * recursive method to remove border of tiles
         * @method refresh
         * @public
         */
        refresh: function () {
            if (this.equationView) {
                this.equationView.refresh();
            }
        },


        /**
         * fannning animation of tiles
         * @method _animateTiles
         * @param {isSuccess} boolean
         * @private
         */
        _animateTiles: function _animateTiles(isSuccess) {
            if (isSuccess) {
                var firstTilePosLeft = this.firstTile.offset().left, self = this,
                    tiles = this.$('.animated-tiles'),
                    EVENTS = viewNameSpace.EquationManagerPro.EVENTS, tileOpacity;

                tiles.position({
                    my: 'left top',
                    at: 'left top',
                    of: this.firstTile,
                    collision: 'none'
                });
                self.showHideOverlayDiv(true);
                tiles.css({ 'visibility': '', 'opacity': 0 });

                tileOpacity = 1;

                tiles.animate({
                    left: 0,
                    opacity: tileOpacity
                }, 1000,
                _.once($.proxy(self.tilesAnimationComplete, self))
                );
            }
        },


        /**
         * On complete of tile fanning animation
         * @method tilesAnimationComplete
         * @public
         */
        tilesAnimationComplete: function () {
            var self = this;
            setTimeout(function () {
                self.$('.animated-tiles').css({ 'left': '', 'opacity': '' }).removeClass('animated-tiles');
                self.$('.invisible-operators').css({ 'visibility': '', 'opacity': 0 }).animate({
                    opacity: 1
                }, 150, _.once($.proxy(self.operatorsAnimationComplete, self))
                );
            }, 100);


        },

        changeDragHandleImg: function changeDragHandleImg(base, value) {
            var decPtLen;
            if (typeof base !== 'string' || value === false) {
                decPtLen = base.toString().split('.')[1] || [];
                decPtLen = value ? decPtLen : [];
                if (decPtLen.length > 2) {
                    this.trigger(viewNameSpace.EquationManagerPro.EVENTS.CHANGE_DRAG_HANDLE_IMG, true);
                }
                else {
                    //show normal img of drag handle
                    this.trigger(viewNameSpace.EquationManagerPro.EVENTS.CHANGE_DRAG_HANDLE_IMG, false);
                }
            }
        },


        /**
         * On complete of tile fading in operator animation
         * @method operatorsAnimationComplete
         * @public
         */
        operatorsAnimationComplete: function () {
            var self = this, EVENTS = viewNameSpace.EquationManagerPro.EVENTS;
            setTimeout(function () {
                self.$('.invisible-operators').css({ 'opacity': '' }).removeClass('invisible-operators');
                self.showHideOverlayDiv(false);
                self.trigger(EVENTS.FANNING_ANIMATION_COMPLETE);
            }, 100);
        },


        getLhsRhsContainerRects: function getLhsRhsContainerRects() {
            this.lhsRect = new Rect(this.equationView.$el.find('.lhs-expression-view-expression')[0].getBoundingClientRect());
            this.rhsRect = new Rect(this.equationView.$el.find('.rhs-expression-view-expression')[0].getBoundingClientRect());
            this.dragHandle = new Rect(this.equationView.$el.find('.equals-sign-container')[0].getBoundingClientRect());
        },


        enableDisableDroppables: function enableDisableDroppables(event, ui, isEqnMgrTile) {

            var pointRect = new Point({ left: event.clientX, top: event.clientY }),
                equationView = this.equationView,
                tileViews = equationView.tileViews, scrollingRegion = 50, scrollSpeed = 20, $expression;

            if (this.lhsRect.isPointInRect(pointRect)) {
                $expression = tileViews[0].$el;
                if (!this.onlyLHS) {
                    tileViews[0].attachDetachDroppable(true, true);
                    tileViews[1].attachDetachDroppable(false, true);
                }
                if (pointRect.getLeft() < this.lhsRect.getLeft() + scrollingRegion) {
                    $expression[0].scrollLeft = $expression[0].scrollLeft - scrollSpeed;
                }
                else if (pointRect.getLeft() > this.lhsRect.getRight() - scrollingRegion) {
                    $expression[0].scrollLeft = $expression[0].scrollLeft + scrollSpeed;
                }
                if (isEqnMgrTile && !isEqnMgrTile.model.get('isLHS')) {
                    this._showInsertionCursor(event, ui, $expression, isEqnMgrTile);
                }
            }
            else if (this.rhsRect.isPointInRect(pointRect)) {
                $expression = tileViews[1].$el;
                if (!this.onlyLHS) {
                    tileViews[1].attachDetachDroppable(true, true);
                    tileViews[0].attachDetachDroppable(false, true);
                }
                if (pointRect.getLeft() < this.rhsRect.getLeft() + scrollingRegion) {
                    $expression[0].scrollLeft = $expression[0].scrollLeft - scrollSpeed;
                }
                else if (pointRect.getLeft() > this.rhsRect.getRight() - scrollingRegion) {
                    $expression[0].scrollLeft = $expression[0].scrollLeft + scrollSpeed;
                }
                if (isEqnMgrTile && isEqnMgrTile.model.get('isLHS')) {
                    this._showInsertionCursor(event, ui, $expression);
                }
            }
            else if (this.dragHandle.isPointInRect(pointRect)) {
                tileViews[0].attachDetachDroppable(false, true);
                tileViews[1].attachDetachDroppable(false, true);
                if (this.getFirstTileDrop() === true) {
                    equationView.$el.find('.hover-border').removeClass('hover-border');
                    equationView.$el.find('.absolute-denominator, .absolute-vincullum, .virtual-numerator, .numerator-one-tile, .dropslots-vincullum, .virtual-denominator, .virtual-left-par, .virtual-right-par, .virtual-fraction-numerator, .virtual-fraction-denominator').css({ 'display': 'none' });
                    equationView.$el.find('.coefficient-tile').css({ 'top': '' });
                    equationView.$el.find('.virtual-big-bracket').length > 0 ? equationView.$el.find('.expression-view').removeClass('big-parentheses-to-expression') : '';
                    ui.helper.removeData('add-tile-droppable');
                }

                //if (isEqnMgrTile) {
                //    //hide insetion cursors
                //}
            }
        },

        _showInsertionCursor: function (event, ui, $expression) {
            if (this.getTileAddedInExpression() != null || !this.getFirstTileDrop()) {
                return false;
            }
            var $leftNullOpContainer = $expression.find('.null-operator-container').length > 0 ? $expression.find('.null-operator-container') : this._addRemoveFirstTile(true, $expression),
                $rightNullOpContainer = $expression.find('.right-null-operator-container').length > 0 ? $expression.find('.right-null-operator-container') : this._addRemoveFirstTile(false, $expression),
                $leftInsertionCursor = $leftNullOpContainer.find('.insertion-cursor, .add-sign-in-null-operator').hide(),
                $rightInsertionCursor = $rightNullOpContainer.find('.insertion-cursor, .add-sign-in-null-operator').hide(),
                leftNullOpContainerRect = new Rect($leftNullOpContainer[0].getBoundingClientRect()),
                rightNullOpContainerRect = new Rect($rightNullOpContainer[0].getBoundingClientRect()),
                helperRect = new Rect(ui.helper[0].getBoundingClientRect()),
                ptMouse = helperRect.getMiddle();

            if (leftNullOpContainerRect.getRight() > ptMouse.getLeft()) {
                this._showHideDropslots($expression, false);
                $leftInsertionCursor.show();
            }
            else if (rightNullOpContainerRect.getLeft() < ptMouse.getLeft()) {
                this._showHideDropslots($expression, false);
                $rightInsertionCursor.show();
            }
        },

        /**
         * add remove first tile and add it back. A PATCH FOR JS ERROR
         * @method _addRemoveFirstTile
         * @private
         *
         * @param   {Boolean} bool        Whether right or left
         * @param   {Object}  $expression The expression in which to find and return
         * @returns {Object}  The DOM element.
         */
        _addRemoveFirstTile: function _addRemoveFirstTile(bool, $expression) {
            var expressionModel = this.equationView.tileViews[bool === true ? 0 : 1].model,
                exprTiles = expressionModel.get('tileArray'),
                firstTile = exprTiles.at(0);
            exprTiles.remove(firstTile);
            exprTiles.add(firstTile, { at: 0 });
            this.removeHighlightTilesImmediate();
            return bool === true ? $expression.find('.null-operator-container') : $expression.find('.right-null-operator-container');
        },

        /**
         * draggable functionality of Bin tiles
         * @method makeBinTilesDraggable
         * @param {target} a classname or Jquery object
         * @public
         */
        makeBinTilesDraggable: function makeBinTilesDraggable(target) {
            var $element = typeof target === 'string' ? $(target) : target,
                self = this, i = 0;
            $element.draggable({
                start: function (event, ui) {
                    self.trigger(viewNameSpace.EquationManagerPro.EVENTS.BIN_DRAGGING_START);
                    self._binTileDragStart(event, ui, $(this));
                },
                drag: $.proxy(this._binTileDragHandler, this),
                revert: function (event) {
                    self.showHideOverlayDiv(true);
                    if (!this.data('isDropped')) {
                        this.removeData('isDropped');
                        if (self.getFirstTileDrop()) {
                            self._showHideDropslots(self.equationView.$el, false);
                        }
                        return true;
                    }
                    self.trigger(viewNameSpace.EquationManagerPro.EVENTS.TILE_DROP_SUCCESS);
                    return false;
                },
                refreshPositions: true,
                helper: 'clone',
                stop: function (event, ui) {
                    self._binTileDragStop(event, ui, $(this));
                    self.trigger(viewNameSpace.EquationManagerPro.EVENTS.BIN_DRAG_STOP);
                },
                containment: this.$binTileDraggableContainment,
                zIndex: 5,
                distance: 10,
                cursorAt: {
                    left: 24,
                    top: 24
                }
            });

            for (; i < $element.length; i++) {
                this.applyHandCursorToElem($($element[i]));
            }

            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($element, { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });
        },


        /**
         * bin tiles drag start event
         * @method _binTileDragStart
         * @param {event} event object
         * @param {ui} Jquery ui object
         * @param {$draggable} Jquery object of draggable
         * @private
         */
        _binTileDragStart: function _binTileDragStart(event, ui, $draggable) {
            this.stopReading();
            var helper = ui.helper;
            helper.data({ 'cur-draggable': $draggable });
            helper.addClass('current-draggable');
            //$(helper).addClass('bin-current-draggable');
            this.getLhsRhsContainerRects();
            this.enableDisableDroppables(event, ui);
            //this.equationView.attachDetachDraggable(null, true);

            /* ----------- Bugfix #15692 ----------- */
            // Issue: Over of droppable expression view was not getting fired.
            // Fix:  destroy expression view droppable and make it droppable again.
            this.equationView.tileViews[0].makeDroppable(false);
            this.equationView.tileViews[1] && this.equationView.tileViews[1].makeDroppable(false);

            this.equationView.tileViews[0].makeDroppable(true);
            this.equationView.tileViews[1] && this.equationView.tileViews[1].makeDroppable(true);
            /* -------- End of bugfix #15692 -------- */
        },

        /**
         * bin tiles drag event
         * @method _binTileDragHandler
         * @param {event} event object
         * @param {ui} Jquery ui object
         * @private
         */
        _binTileDragHandler: function _binTileDragHandler(event, ui) {
            var expressionViews = this.equationView.tileViews,
                helperRect = new Rect(ui.helper[0].getBoundingClientRect()),
                ptMouse = helperRect.getMiddle(), operatorRect;

            expressionViews[0].isDenominator = false;
            expressionViews[1].isDenominator = false;
            if (!this.getFirstTileDrop()) {
                var $virtualNumerator = expressionViews[0].$el.find('.virtual-numerator'),
                    virtualNumeratorRect = new Rect($virtualNumerator[0].getBoundingClientRect()),
                    //ptMouse = new Point({ left: event.clientX, top: event.clientY })
                    helperRect = new Rect(ui.helper[0].getBoundingClientRect()),
                    ptMouse = helperRect.getMiddle();
                if (virtualNumeratorRect.isPointInRect(ptMouse)) {
                    $virtualNumerator.find('.base-container').addClass('hover-border');
                }
                else {
                    $virtualNumerator.find('.base-container').removeClass('hover-border');
                }
                return;
            }
            if (this.getTileAddedInExpression() !== null) {
                this.enableDisableDroppables(event, ui);
                return;
            }
            var droppableView = ui.helper.data('add-tile-droppable'),
                isVariableTile = ui.helper.data('variable'), $operator;

            if (droppableView && !isVariableTile) {
                if (!droppableView.model) {
                    $operator = droppableView;
                    this._showHideDropslots(this.equationView.$el, false);
                    $operator.find('.insertion-cursor, .add-sign-in-null-operator').show();
                    //operatorRect = new Rect($operator[0].getBoundingClientRect());
                    //if (operatorRect.isPointInRect(ptMouse)) {

                    //}
                    return;
                }
                var droppableType = droppableView.model.get('type'),
                    isDenominator = droppableView.model.get('isDenominator'),
                    tileIndex = droppableView.parent.getIndex(droppableView).substring(0, 1),
                    expressionView = this.equationView.getViewFromIndex(tileIndex),
                    $expression = expressionView.$el,
                    $virtualNumerator = $expression.find('.virtual-numerator'),
                    $virtualDenominator = $expression.find('.virtual-denominator').length ? $expression.find('.virtual-denominator') : $expression.find('.absolute-denominator'),
                    $leftNullOpContainer = $expression.find('.null-operator-container'),
                    $rightNullOpContainer = $expression.find('.right-null-operator-container'),
                    $leftInsertionCursor = $leftNullOpContainer.find('.insertion-cursor, .add-sign-in-null-operator').hide(),
                    $rightInsertionCursor = $rightNullOpContainer.find('.insertion-cursor, .add-sign-in-null-operator').hide();

                var expressionRect = new Rect($expression[0].getBoundingClientRect()),
                    expressionTop = expressionRect.getTop(),
                    expressionBottom = expressionRect.getBottom(),
                    expressionRight = expressionRect.getRight(),
                    expressionLeft = expressionRect.getLeft(),
                    expressionHeight = expressionRect.getHeight(),
                    halfOfTileHeight = 24,
                    heightOfExpAreas = expressionHeight / 2 - halfOfTileHeight,
                    expressionArea1 = expressionTop + heightOfExpAreas,
                    expressionArea1Rect = new Rect({ top: expressionTop, right: expressionRight, left: expressionLeft, bottom: expressionArea1, height: heightOfExpAreas, width: expressionRect.getWidth() }),
                    expressionArea2 = expressionTop + expressionHeight / 2 + halfOfTileHeight,
                    expressionArea2Rect = new Rect({ top: expressionArea2, right: expressionRight, left: expressionLeft, bottom: expressionBottom, height: heightOfExpAreas, width: expressionRect.getWidth() }),
                    expressionUpperHalfRect = new Rect({ top: expressionTop, right: expressionRight, left: expressionLeft, bottom: expressionRect.getHeight() / 2, height: expressionRect.getHeight() / 2, width: expressionRect.getWidth() }),
                    expressionLowerHalfRect = new Rect({ top: expressionRect.getHeight() / 2, right: expressionRight, left: expressionLeft, bottom: expressionBottom, height: expressionRect.getHeight() / 2, width: expressionRect.getWidth() }),
                    leftNullOpContainerRect = new Rect($leftNullOpContainer[0].getBoundingClientRect()),
                    rightNullOpContainerRect = new Rect($rightNullOpContainer[0].getBoundingClientRect()),
                    virtualNumeratorRect = new Rect($virtualNumerator[0].getBoundingClientRect()),
                    virtualDenominatorRect = new Rect($virtualDenominator[0].getBoundingClientRect()), multiplication = true;



                if (expressionArea2Rect.isPointInRect(ptMouse)) {
                    //denominator
                    this._showHideDropslots($expression, true);
                    expressionView.isDenominator = true;
                  //  console.log('denominator');
                }
                else if (expressionArea1Rect.isPointInRect(ptMouse)) {
                    //numerator
                    this._showHideDropslots($expression, true, true);
                    expressionView.isDenominator = false;
               //     console.log('numerator');
                }
                else if (expressionRect.isPointInRect(ptMouse)) {
               //     console.log('blank');
                    //if mouseover on term tile
                    if (droppableType === modelClassNameSpace.TileItem.TileType.TERM_TILE) {
                        if (isDenominator) {
                            this._showHideDropslots($expression, true);
                        }
                        else {
                            this._showHideDropslots($expression, true, true);
                        }
                        expressionView.isDenominator = isDenominator;
                    }
                    else if (virtualNumeratorRect.isPointInRect(ptMouse)) {
                        this._showHideDropslots($expression, true, true);
                        expressionView.isDenominator = false;
                    }
                    else if (virtualDenominatorRect.isPointInRect(ptMouse)) {
                        this._showHideDropslots($expression, true);
                        expressionView.isDenominator = true;
                    }
                    else {
                        //show insertion cursor
                        if (leftNullOpContainerRect.getRight() > ptMouse.getLeft()) {
                            if (ui.helper.data('tilevalue') === 't') {
                                this._showHideDropslots(this.$el, false);
                                return;
                            }
                            this._showHideDropslots($expression, false);
                            $leftInsertionCursor.show();
                            multiplication = false;
                            expressionView.isDenominator = false;
                        }
                        else if (rightNullOpContainerRect.getLeft() < ptMouse.getLeft()) {
                            if (ui.helper.data('tilevalue') === 't') {
                                this._showHideDropslots(this.$el, false);
                                return;
                            }
                            this._showHideDropslots($expression, false);
                            $rightInsertionCursor.show();
                            multiplication = false;
                            expressionView.isDenominator = false;
                        }
                        if (multiplication) {
                            //divide whole expression in two parts and set numerator or denominator dropslots
                   //         console.log('blank area');
                            if (expressionUpperHalfRect.isPointInRect(ptMouse)) {
                                //numerator
                                this._showHideDropslots($expression, true, true);
                                expressionView.isDenominator = false;
                            }
                            else {
                                //denominator
                                this._showHideDropslots($expression, true);
                                expressionView.isDenominator = true;
                            }
                        }

                    }
                }
                else {
                    this._showHideDropslots($expression, false);
                }
                //}
            }
            this.enableDisableDroppables(event, ui);
            //this.equationView.enableOperators(false);
        },

        _showHideDropslots: function _showHideDropslots($expression, show, multiplication) {
            if (show) {
                if (multiplication) {
                    $expression.find('.virtual-denominator, .dropslots-vincullum, .numerator-one-tile, .virtual-fraction-denominator, .absolute-denominator, .absolute-vincullum, .insertion-cursor, .add-sign-in-null-operator').css({ 'display': 'none' }).removeClass('absolute-denominator-top absolute-vincullum-top');
                    $expression.find('.virtual-numerator, .virtual-left-par, .virtual-right-par, .virtual-fraction-numerator, .virtual-fraction-container').css({ 'display': '' });
                    $expression.find('.coefficient-tile, .virtual-fraction-container').css({ 'top': '' }).removeClass('coefficient-tile-top');
                    $expression.find('.virtual-big-bracket').length > 0 ? $expression.find('.expression-view').addClass('big-parentheses-to-expression') : '';
                }
                else {
                    $expression.find('.absolute-denominator').css({ 'display': '', 'top': '94px' }).addClass('absolute-denominator-top');
                    $expression.find('.virtual-denominator').css({ 'display': '' });
                    $expression.find('.dropslots-vincullum').css({ 'display': '' });
                    $expression.find('.absolute-vincullum').css({ 'display': '', 'top': '87px' }).addClass('absolute-vincullum-top');
                    $expression.find('.numerator-one-tile, .virtual-left-par, .virtual-right-par, .virtual-fraction-denominator, .virtual-fraction-container').css({ 'display': '' });
                    $expression.find('.virtual-numerator, .virtual-fraction-numerator, .insertion-cursor, .add-sign-in-null-operator').css({ 'display': 'none' });
                    $expression.find('.coefficient-tile').css({ 'top': '-30px' }).addClass('coefficient-tile-top');
                    $expression.find('.virtual-big-bracket').length > 0 ? $expression.find('.expression-view').addClass('big-parentheses-to-expression') : '';
                    //$expression.find('.virtual-fraction-container').css({ 'top': '-10px' });
                }
            }
            else {
                if (this.getFirstTileDrop()) {
                    $expression.find('.absolute-denominator, .absolute-vincullum, .virtual-numerator, .numerator-one-tile, .dropslots-vincullum, .virtual-denominator, .virtual-left-par, .virtual-right-par, .virtual-fraction-numerator, .virtual-fraction-denominator').css({ 'display': 'none' }).removeClass('absolute-denominator-top absolute-vincullum-top');
                    $expression.find('.coefficient-tile, .virtual-fraction-container').css({ 'top': '' }).removeClass('coefficient-tile-top');
                    $expression.find('.virtual-big-bracket').length > 0 ? $expression.find('.expression-view').removeClass('big-parentheses-to-expression') : '';
                }
                $expression.find('.virtual-fraction-container, .insertion-cursor, .add-sign-in-null-operator').css({ 'display': 'none' });
            }
        },



        /**
         * bin tiles dragging stop event
         * @method _binTileDragStop
         * @param {event} event object
         * @param {ui} Jquery ui object
         * @param {$draggable} Jquery object of draggable
         * @private
         */
        _binTileDragStop: function _binTileDragStop(event, ui, $draggable) {
            this.showHideOverlayDiv(false);
            this.setIsDropped(false);
            ui.helper.removeData(['cur-draggable', 'cur-droppable']);
            ui.helper.removeData('add-tile-droppable');
            $draggable.removeData('isDropped');
            this.equationView.attachDetachDroppable(true);
            this.equationView.enableOperators(true);
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
                if ($requiredElement.hasClass('ui-draggable-dragging') || $requiredElement.hasClass('disable')) { return; }
                $requiredElement.css(self.equationView._getOpenHandCss());
                if (self.$el.parents('.ui-draggable-dragging').length > 0) {
                    $requiredElement.css(self.equationView._getClosedHandCss());
                }
            });

            $requiredElement.on(leave, function () {
                $requiredElement.css(self.equationView._getDefaultCursorCss());
            });
            $requiredElement.on('mousedown', function () {
                if ($requiredElement.hasClass('disable')) { return; }
                $requiredElement.css(self.equationView._getClosedHandCss());
            });
            $requiredElement.on('mouseup', function () {
                if ($requiredElement.hasClass('disable')) { return; }
                $requiredElement.css(self.equationView._getOpenHandCss());
            });
        },





        /**
        * Stores new hovered tile and calls mouseOut of previously hovered tile.
        * @method registerMouseOverTile
        * @param tileView MathInteractives.Common.Interactivities.ExponentAccordion.EquationManagerPro.Models.TileItem
        * @public
        */
        registerMouseOverTile: function (tileView, event, ui) {
            if (this.currentHoveredTile) {
                if (this.currentHoveredTile !== tileView) {
                    this.currentHoveredTile.onMouseOut(event, ui);
                }
            }
            this.currentHoveredTile = tileView;
            this.showHideBorder(false);
        },

        /**
        * sets a tree root
        * @method setTreeRoot
        * @public
        */
        setTreeRoot: function setTreeRoot() {
            this.root = this.equationView.model.getTree();
            this.tabOrderArr = this.equationView.model.parseTree(this.root);
        },

        /**
        * gets a current tree root
        * @method getTreeRoot
        * @public
        */
        getTreeRoot: function getTreeRoot() {
            return this.root;
        },

        /**
        * Adds a highlight class to the tile exponent and base which is then removed after a timeout.
        * The removal has to be handled explicitly and not handled by this method.
        * @method tileAdded
        * @param {Object} Tile to highlight
        */
        tileAdded: function tileAdded(tileView) {
            var TYPE = modelClassNameSpace.TileItem.TileType,
                NEW_TILE_CLASS = 'new-created-tile',
                type = tileView.model.get('type'),
                i = 0;
            if (type === TYPE.TERM_TILE) {
                tileView.$el.addClass(NEW_TILE_CLASS);
            }
            else if (type === TYPE.FRACTION) {
                for (i = 0; i < tileView.tileViews.length; i++) {
                    this.tileAdded(tileView.tileViews[i]);
                }
            }
            else if (type === TYPE.PARENTHESES) {
                for (i = 0; i < tileView.tileViews.length; i++) {
                    this.tileAdded(tileView.tileViews[i]);
                }
            }
        },

        /**
        * Removes highlight on tiles after a timeout.
        * @method removeHighlightTiles
        */
        removeHighlightTiles: function removeHighlightTiles() {
            var self = this;
            window.clearTimeout(this.timerId);
            this.timerId = setTimeout(function () {
                self.$('.new-created-tile').removeClass('new-created-tile');
            }, 5000);
        },

        /**
        * Removes highlight on tiles immediately.
        * @method removeHighlightTilesImmediate
        */
        removeHighlightTilesImmediate: function () {
            this.$('.new-created-tile').removeClass('new-created-tile');
            window.clearTimeout(this.timerId);
        },


        _clearDropslots: function _clearDropslots() {
            this.equationView.$el.find('.virtual-numerator, .numerator-one-tile, .dropslots-vincullum, .virtual-denominator, .virtual-left-par, .virtual-right-par, .virtual-fraction-numerator, .virtual-fraction-denominator, .absolute-vincullum, .absolute-denominator, .virtual-fraction-container, .virtual-numerator-operator-container').remove();
            this.equationView.$el.find('.coefficient-tile').removeClass('coefficient-tile');
        },


        /**
        * Dropslots to be created on every command fire
        * These dropslots are to be shown on bin tiles are added to eqn manager
        * @method _setDropSlotsForBinTiles
        */
        _setDropSlotsForBinTiles: function _setDropSlotsForBinTiles() {
            this._clearDropslots();
            var i = 0, j = 0, firstChild, secondChild, tilesInsideNode = [], children, index,
                coeffTiles = [], expressionViews = this.equationView.tileViews, numTiles = [];
            for (; i < this.root.children.length; i++) {
                expressionViews[i].parenthesesAdded = false;
                expressionViews[i].fractionAdded = false;
                expressionViews[i].tilesToAddInFraction = 0;
                expressionViews[i].multiplicationIndex = null;
                expressionViews[i].fractionIndex = null;
                expressionViews[i].index = null;
                index = i + '.0';
                coeffTiles = [];
                if (this.root.children[i].data === '+') {
                    //console.log('add parentheses and tiles'); // case 1.2 + 2 + 3
                    expressionViews[i].parenthesesAdded = true;
                    expressionViews[i].fractionAdded = true;
                    if (this.root.children[i].children[0].data === '*') {
                        firstChild = this._getFirstChildNodeOfMultiplication(this.root.children[i].children[0]);
                        this._appendTilesAndParentheses(firstChild, true);
                    }
                    else if (this.root.children[i].children[0].data === '/') {
                        firstChild = this.root.children[i].children[0].collectionData;
                        this._appendTilesAndParentheses(firstChild, true);
                    }
                    else {
                        firstChild = this.root.children[i].children[0];
                        tilesInsideNode = this._getTilesModelsInsideNode(firstChild);
                        this._appendTilesAndParentheses(tilesInsideNode[0], true);
                    }
                }
                else if (this.root.children[i].data === '*') {
                    children = this.root.children[i].children;
                    if (typeof children[0].data === 'string') {
                        if (children[0].data === '/') { // case 4/3 * (x + 2)
                            firstChild = children[0].children[0];
                            tilesInsideNode = numTiles = this._getTilesModelsInsideNode(firstChild);
                            this._appendTilesAndParentheses(tilesInsideNode[0], false, 'num');
                            expressionViews[i].multiplicationIndex = index + '.0';
                            secondChild = children[0].children[1];
                            tilesInsideNode = this._getTilesModelsInsideNode(secondChild);
                            this._appendTilesAndParentheses(tilesInsideNode[0], false, 'den');
                            expressionViews[i].fractionIndex = index + '.' + (numTiles.length);
                        }
                        else if (children[0].data === '^') { // case (1/3 + 5/6) * (x + 2)
                            firstChild = children[0].collectionData;
                            this._appendTilesAndParentheses(firstChild, true, null, null, true);
                        }
                    }
                    else {
                        for (j = 0; j < children.length; j++) { // case 3 * 4 * 5
                            if (children[j].data !== '^') { // case 3* 4 (4 + 5)
                                var tile = this.equationView.getViewFromIndex(this.equationView.model.getIndexFromItemModel(children[j].data));
                                this._operatorsOfCoeffTiles(tile);
                                coeffTiles.push(tile.$el.addClass('coefficient-tile'));
                            }
                        }
                        expressionViews[i].tilesToAddInFraction = coeffTiles.length;
                        this._appendTilesAndParentheses(children[0].data, false, null, coeffTiles);
                    }
                }
                else if (this.root.children[i].data === '/') {
                    if (this.root.children[i].children[0].data !== '+') {
                        //console.log('add only tiles'); // case 2*3 / 4
                        firstChild = this.root.children[i].children[0] || this.root.children[i].children[0].children[0];
                        tilesInsideNode = numTiles = this._getTilesModelsInsideNode(firstChild);
                        this._appendTilesAndParentheses(tilesInsideNode[0], false, 'num');
                        expressionViews[i].multiplicationIndex = index + '.0';
                        secondChild = this.root.children[i].children[1] || this.root.children[i].children[1].children[0];
                        tilesInsideNode = this._getTilesModelsInsideNode(secondChild);
                        this._appendTilesAndParentheses(tilesInsideNode[0], false, 'den');
                        expressionViews[i].fractionIndex = index + '.' + (numTiles.length);
                    }
                    else {
                        // dont know will this case ever appear.. // This case does!!
                        //console.log('add parentheses and tiles'); // case 1 + 2 / 3
                        firstChild = this.root.children[i].collectionData;
                        expressionViews[i].parenthesesAdded = true;
                        this._appendTilesAndParentheses(firstChild, true);
                    }
                }
                else if (typeof this.root.children[i] !== 'string') {
                    //console.log('add only tiles'); // case 1*2 or 5
                    // case only single tile is present
                    var tile = this.equationView.getViewFromIndex(this.equationView.model.getIndexFromItemModel(this.root.children[i].data));
                    this._operatorsOfCoeffTiles(tile);
                    coeffTiles.push(tile.$el.addClass('coefficient-tile'));
                    this._appendTilesAndParentheses(this.root.children[i].data, false, null, coeffTiles);
                    expressionViews[i].tilesToAddInFraction = coeffTiles.length;
                    expressionViews[i].fractionAdded = true;
                }
                expressionViews[i].index = index;
            }
        },

        _operatorsOfCoeffTiles: function _operatorsOfCoeffTiles(tileView) {
            var operator = tileView.model.get('operator'),
                index = tileView.parent.tileViews.indexOf(tileView);
            if (operator) {
                tileView.parent.$operatorViews[index].addClass('coefficient-tile');
            }

        },


        _getFirstChildNodeOfMultiplication: function _getFirstChildNodeOfMultiplication(node) {
            var data = node.data;

            if (data === '*') {
                return this._getFirstChildNodeOfMultiplication(node.children[0]);
            }
            else {
                // if not string => model
                return typeof node.data !== 'string' ? node.data : node.collectionData;
            }
        },

        enableDisableTiles: function enableDisableTiles(isEnable, disableUndo) {
            var undoStack = this.commandFactory.get('undoStack');
            this.equationView.enableDisableTiles(isEnable);
            this.removeHighlightTilesImmediate();
            if (isEnable) {
                this.enableMarquee(true, true);
            }
            else {
                this.disableMarquee(true, true);
            }
            if (disableUndo) {
                isEnable = !isEnable;
            }
            if (undoStack.length === 0 && isEnable) {
                //this._enableDisableButtons(this.undoButtonView, !isEnable);
                this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.UNDO_BUTTON, !isEnable);
                //this._enableDisableButtons(this.resetButtonView, this.model.get('resetBtnStatus'));
                this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.RESET_BUTTON, this.model.get('resetBtnStatus'));
            }
            else {
                //this._enableDisableButtons(this.undoButtonView, isEnable);
                this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.UNDO_BUTTON, isEnable);
                //this._enableDisableButtons(this.resetButtonView, this.model.get('resetBtnStatus'));
                this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.RESET_BUTTON, this.model.get('resetBtnStatus'));
            }
        },

        enableDisableBinTiles: function enableDisableBinTiles(isEnable, $tile, options) {
            options = options || {};
            var $tiles = ($tile) ? $tile : this.$binTileContainment.find('.bin-tiles'), i = 0;
            if (isEnable) {
                $tiles.removeClass('disable');
                if (options.alterDraggable !== false) {
                    for (; i < this.numericTileArray.length; i++) {
                        if ($($tiles[i]).is('.ui-draggable')) {
                            $($tiles[i]).draggable('enable');
                        }
                    }
                }
            }
            else {
                $tiles.addClass('disable');
                if (options.alterDraggable !== false) {
                    for (; i < this.numericTileArray.length; i++) {
                        if ($($tiles[i]).is('.ui-draggable')) {
                            $($tiles[i]).draggable('disable');
                        }
                    }
                }
            }
        },

        getIsMarqueeDrawing: function getIsMarqueeDrawing() {
            return this.marqueeViews[0].isDrawing || this.marqueeViews[1].isDrawing;
        },

        /**
        * Appends tiles or parentheses depending on case
        * @method _appendTilesAndParentheses
        * @param {model} model of any tile item
        * @param {isApplyParentheses} boolean whether to append parentheses
        * @param {fraction} value could be 'num' or 'den'
        * @private
        */
        _appendTilesAndParentheses: function _appendTilesAndParentheses(model, isApplyParentheses, fraction, coeffTiles, doNotAddPar) {
            //case a + b + c
            if (isApplyParentheses) {
                this._dropslotsForParenthesesCase(model, isApplyParentheses, fraction, coeffTiles, doNotAddPar);
            }
            else if (fraction) {
                this._dropslotsForFractionCase(model, fraction, coeffTiles);
            }
            else if (coeffTiles) {
                this._dropslotsForCoefficientCase(model, coeffTiles);
            }

        },

        _dropslotsForParenthesesCase: function _dropslotsForParenthesesCase(model, isApplyParentheses, fraction, coeffTiles, doNotAddPar) {
            var tileIndex = this.equationView.model.getIndexFromItemModel(model),
                tileView = this.equationView.getViewFromIndex(tileIndex),
                expressionView = this.equationView.tileViews[+tileIndex[0]],
                $tile = tileView.$el,
                $expression = $tile.parents('.expression-view-holder'),
                $container = $('<div></div>').addClass('virtual-fraction-container').css({ 'display': 'none' }),
                templateString = MathInteractives.Common.Components.templates['baseTilePro']({
                    'base': '',
                    'base-class': 'empty-tile',
                    'level': 'eqn-manager-tile',
                    'baseTileType': modelClassNameSpace.TileItem.TileType.TERM_TILE,
                    'idPrefix': this.idPrefix
                }),
                $numTemplate = $(templateString).addClass('virtual-numerator').css({ 'display': 'none' }),
                isContains = expressionView.checkContainsParOrFraction();

            expressionView.$el.removeClass('expression-with-multiplication-only');
            if (!isContains) {
                expressionView.$el.addClass('expression-with-multiplication-only');
            }

            var $vincullumDiv = $('<div></div>').addClass('dropslots-vincullum').css({ 'display': 'none' }),
                templateString = MathInteractives.Common.Components.templates['baseTilePro']({
                    'base': '',
                    'base-class': 'empty-tile',
                    'level': 'eqn-manager-tile',
                    'baseTileType': modelClassNameSpace.TileItem.TileType.TERM_TILE,
                    'idPrefix': this.idPrefix
                }),
                $denTemplate = $(templateString).addClass('virtual-denominator').css({ 'display': 'none' }),
                $bracket = expressionView.$expression.hasClass('expression-with-fraction') ? MathInteractives.Common.Components.templates['parenthesesTemplate']({ 'color': this.parenthesesColor ? this.parenthesesColor : viewNameSpace.EquationManagerPro.WHITE, 'isBigParentheses': true }) : MathInteractives.Common.Components.templates['parenthesesTemplate']({ 'color': this.parenthesesColor ? this.parenthesesColor : viewNameSpace.EquationManagerPro.WHITE }),
                $virtualLeftPar, $virtualRightPar;

            $container.append($numTemplate).append($vincullumDiv).append($denTemplate);
            $container.insertAfter($expression.find('.null-operator-container'));

            $virtualLeftPar = $('<div>' + $bracket + '</div>').addClass('virtual-left-par left-bracket').css({ 'display': 'none' }),
            $virtualRightPar = $('<div>' + $bracket + '</div>').addClass('virtual-right-par right-bracket').css({ 'display': 'none' });

            if (expressionView.$expression.hasClass('expression-with-fraction')) {
                $virtualLeftPar.addClass('virtual-big-bracket');
                $virtualRightPar.addClass('virtual-big-bracket');
            }

            if (!doNotAddPar) {
                $virtualLeftPar.insertAfter($container);
                $virtualRightPar.insertBefore($expression.find('.right-null-operator-container'));
            }

            var $one = $('<div>1</div>').addClass('numerator-one-tile').css({ 'display': 'none' });
            $one.insertBefore($numTemplate);
        },

        _dropslotsForFractionCase: function _dropslotsForFractionCase(model, fraction, coeffTiles) {
            // 3/4 or 3*4/5*6
            var tileView = this.equationView.getViewFromIndex(this.equationView.model.getIndexFromItemModel(model)),
                    $tile = tileView.$el,
                    templateString = MathInteractives.Common.Components.templates['baseTilePro']({
                        'base': '',
                        'base-class': 'empty-tile',
                        'level': 'eqn-manager-tile',
                        'baseTileType': modelClassNameSpace.TileItem.TileType.TERM_TILE,
                        'idPrefix': this.idPrefix
                    }),
                    $template = $(templateString), $multiplicationOperator = $('<div></div>').addClass('virtual-numerator-operator'),
                    $multiplicationOperatorContainer = $('<div></div>').addClass('virtual-numerator-operator-container').hide().append($multiplicationOperator);
            if (fraction === 'num') {
                $template.insertBefore($tile).addClass('virtual-numerator').css({ 'display': 'none' });
                $multiplicationOperatorContainer.insertBefore($tile);
            }
            else {
                $template.insertBefore($tile).addClass('virtual-denominator').css({ 'display': 'none' });
            }
        },


        _dropslotsForCoefficientCase: function _dropslotsForCoefficientCase(model, coeffTiles) {
            var tileView = this.equationView.getViewFromIndex(this.equationView.model.getIndexFromItemModel(model)),
                actualTileSize = { width: 48, height: 48 },
                $tile = tileView.$el,
                tilesLen = coeffTiles.length,
                operatorMargin = tilesLen === 1 ? 3 * (tilesLen) : 3 * (tilesLen - 1),
                templateString = MathInteractives.Common.Components.templates['baseTilePro']({
                    'base': '',
                    'base-class': 'empty-tile',
                    'level': 'eqn-manager-tile',
                    'baseTileType': modelClassNameSpace.TileItem.TileType.TERM_TILE,
                    'idPrefix': this.idPrefix
                }),
                $numTemplate = $(templateString).addClass('virtual-numerator').css({ 'display': 'none' });

            $numTemplate.insertBefore($tile);

            var $vincullumDiv = $('<div></div>').addClass('absolute-vincullum').css({ 'display': 'none' }),
                templateString = MathInteractives.Common.Components.templates['baseTilePro']({
                    'base': '',
                    'base-class': 'empty-tile',
                    'level': 'eqn-manager-tile',
                    'baseTileType': modelClassNameSpace.TileItem.TileType.TERM_TILE,
                    'idPrefix': this.idPrefix
                }),
                $template = $(templateString).addClass('absolute-denominator').css({ 'display': 'none' });

            $vincullumDiv.insertAfter($tile);
            $template.insertAfter($vincullumDiv);

            window.setTimeout(function () {
                $vincullumDiv.css({ width: actualTileSize.width * tilesLen + (3 * (tilesLen - 1)) + 10, left: $tile.position().left - 5 });
                $template.css({ left: operatorMargin + (actualTileSize.width * (tilesLen - 1) / 2) + $tile.position().left - (3 * tilesLen) });
            }, 10);

        },




        /**
        * gets all leaf nodes(tiles) of the node
        * @method _getTilesModelsInsideNode
        * @param {node} a branch node of tree
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

        //setDeletedItemsInParentheses: function setDeletedItemsInParentheses(index) {
        //    if (index === undefined) {
        //        this.deletedItemsInParenthesesFraction = [];
        //    }
        //    else if (this.deletedItemsInParenthesesFraction.indexOf(index) === -1) {
        //        this.deletedItemsInParentheses.push({ index: index, type: 'PARENTHESES' });
        //    }
        //},

        //getDeletedItemsInParentheses: function getDeletedItemsInParentheses(index) {
        //    return this.deletedItemsInParentheses;
        //},

        //setDeletedItemsInFraction: function setDeletedItemsInFraction(index) {
        //    if (index === undefined) {
        //        this.deletedItemsInParenthesesFraction = [];
        //    }
        //    else if (this.deletedItemsInFraction.indexOf(index) === -1) {
        //        this.deletedItemsInFraction.push({index: index, type: 'FRACTION'});
        //    }
        //},

        //getDeletedItemsInFraction: function getDeletedItemsInFraction(index) {
        //    return this.deletedItemsInFraction;
        //},

        setDeletedItemsInParenthesesFraction: function setDeletedItemsInParenthesesFraction(index, type) {
            var isFound = false;
            if (index === undefined) {
                this.deletedItemsInParenthesesFraction = [];
            }
            else {
                for (var i = 0; i < this.deletedItemsInParenthesesFraction.length; i++) {
                    if (this.deletedItemsInParenthesesFraction[i].index === index) {
                        isFound = true;
                        break;
                    }
                }
                if (!isFound) {
                    this.deletedItemsInParenthesesFraction.push({ index: index, type: type });
                }
            }
        },

        getDeletedItemsInParenthesesFraction: function getDeletedItemsInParenthesesFraction() {
            return this.deletedItemsInParenthesesFraction;
        },



        /**
        * Fires a command
        * @method fireCommand
        * @param {cmdName} command name
        * @param {data} data needed for command
        * @public
        */
        fireCommand: function (cmdName, data) {
            var cmdFactoryClass = modelClassNameSpace.CommandFactory, result,
                rules = new cmdFactoryClass.Rules(this.commandFactory.get('allowedOperation'), this.model.get('isIotaPresent'), this.model.get('isFractionToDecimalAllowed')),
                deletedItemsInParenthesesFraction = this.getDeletedItemsInParenthesesFraction(),
                undoStack = this.commandFactory.get('undoStack'), equationHtml, equationAccString = '',
                self = this,
                isLHS = data.isLHS;

            this.$('.big-parentheses-to-expression').removeClass('big-parentheses-to-expression');

            if (!data.isLHS) {
                if (data.dest) {
                    if (data.dest.index.split('.')[0] === '0') {
                        isLHS = true;
                    }
                    else {
                        isLHS = false;
                    }
                }
                else if (data.source) {
                    if (data.source.index.split('.')[0] === '0') {
                        isLHS = true;
                    }
                    else {
                        isLHS = false;
                    }
                }
            }

            if (data.source.index === null || data.source.index.split('.').map(Number).indexOf(-1) !== -1) {
                return;
            }

            if (!(cmdName === cmdFactoryClass.COMMANDS.CHECK_PARENTHESES_RULES || cmdName === cmdFactoryClass.COMMANDS.CHECK_FRACTION_RULES || cmdName === cmdFactoryClass.COMMANDS.ADD_TILE)) {
                this.removeHighlightTilesImmediate();
            }
            //remove all highlights of takeout common
            this.equationView.$el.find('.multiple-in-parentheses').removeClass('multiple-in-parentheses');

            result = this.commandFactory.execute(cmdName, rules, data);
            if ([cmdFactoryClass.COMMANDS.PARENTHESES_EXPONENT_CLICK, cmdFactoryClass.COMMANDS.COMBINE,
                cmdFactoryClass.COMMANDS.TAKE_OUT_COMMON_COMMAND, cmdFactoryClass.COMMANDS.CHECK_PARENTHESES_RULES,
                cmdFactoryClass.COMMANDS.CHECK_FRACTION_RULES].indexOf(cmdName) === -1) {

                this.setDeletedItemsInParenthesesFraction();
                deletedItemsInParenthesesFraction = this.getDeletedItemsInParenthesesFraction();
            }
            //to retrun a number for feedback string.
            if (typeof result === 'number') {
                return result;
            }
            if (result || deletedItemsInParenthesesFraction.length) {
                this._undoResetBtnStatus();
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.COMMAND_SUCCESSFUL);
                this.setTreeRoot();
                this.equationView.$el.find('.multiplication-operator').show();

                deletedItemsInParenthesesFraction.sort(function (a, b) {
                    return self.versionCompare(a.index, b.index);
                });


                if (deletedItemsInParenthesesFraction.length) {
                    var obj = deletedItemsInParenthesesFraction.pop();
                    data = {
                        root: this.getTreeRoot(),
                        source: new cmdFactoryClass.TileLocation(obj.index, 1),
                    };
                    this.fireCommand(cmdFactoryClass.COMMANDS['CHECK_' + obj.type + '_RULES'], data);
                }

                if (this.isBottomExpressionShown) {
                    this._updateBottomEquations();
                }
                window.clearTimeout(this.timerId);
                this.removeHighlightTiles();
                this.equationView.checkForFractionInExpression();
                if (this.options.createTileBin) {
                    this._setDropSlotsForBinTiles();
                }
                this.equationView.hideOperatorOfParCoeff();
                this._checkOfIntroductionOfParenthesesOrFraction();
                this.isExpressionContainsParentheses();
                if (!(cmdName === cmdFactoryClass.COMMANDS.CHECK_PARENTHESES_RULES || cmdName === cmdFactoryClass.COMMANDS.CHECK_FRACTION_RULES || cmdName === cmdFactoryClass.COMMANDS.ADD_TILE)) {
                    // do not push data of commands like parentheses rules or fraction rules
                    // And equation is not balanced
                    equationHtml = this.equationView.getTileContentInHtmlForm(viewNameSpace.EquationManagerPro.BLACK);
                    equationAccString = this.equationView.getAccString(viewNameSpace.EquationManagerPro.DATA);
                    this.trigger(viewNameSpace.EquationManagerPro.EVENTS.ADD_STEP, { equationHtml: equationHtml, equationAccString: equationAccString });
                    if (cmdName === cmdFactoryClass.COMMANDS.BREAK_BASE) {
                        window.setTimeout(function () { self._scrollExpressionOnCommandSuccess(false, isLHS); }, 1100);
                    }
                    else {
                        this._scrollExpressionOnCommandSuccess(false, isLHS);
                    }
                    //if (this.options.createTileBin) {
                    //    this._checkForNestedLevelOfParentheses();
                    //}
                }

                if (cmdName === cmdFactoryClass.COMMANDS.ADD_TILE) {
                    this._scrollExpressionOnCommandSuccess(false, isLHS);
                }

                this._checkOfBigParentheses();

            }
            return result;
        },


        _checkOfBigParentheses: function _checkOfBigParentheses() {
            var isBigLeftBracket = null;
            this.equationView.tileViews.forEach(function (currentEqView) {
                isBigLeftBracket = (currentEqView.$expression.find('.big-left-bracket').length > 0 && currentEqView.$('.expression-with-big-parentheses').length > 0);
                if (isBigLeftBracket) {
                    return;
                }
                currentEqView.$('.expression-with-big-parentheses').removeClass('expression-with-big-parentheses');
            });
        },



        isExpressionContainsParentheses: function isExpressionContainsParentheses() {
            this.equationView.tileViews[0] && this.equationView.tileViews[0].isExpressionContainsParentheses();
            this.equationView.tileViews[1] && this.equationView.tileViews[1].isExpressionContainsParentheses();
        },

        _scrollExpressionOnCommandSuccess: function _scrollExpressionOnCommandSuccess(isUndoCalled, isLHS) {
            var expressionTileViews = this.equationView.tileViews,
                //$expression = (expressionTileViews[0].$el.find('.new-created-tile').length > 0 || this.options.onlyLHS) ? expressionTileViews[0].$el : expressionTileViews[1].$el,
                expressionTileView = (isLHS || this.options.onlyLHS) ? expressionTileViews[0] : expressionTileViews[1],
                $expression = expressionTileView.$el,
                $newTiles = $expression.find('.new-created-tile'),
                lastTileOffsetRight, firstTileOffsetLeft, scrollAmt = 0, self = this,
                expressionRect = new Rect($expression[0].getBoundingClientRect()), scrolling,
                scrollLeft = $expression.scrollLeft(),
                extraBuffer = null,
                rightMostTile = null,
                lastTilesParentElement = $($newTiles[$newTiles.length - 1]).parents('.fraction-component'),
                emptyDropSlotView = expressionTileView.containsNullTile(),
                dropSlotOffsetLeft = null,
                dropSlotOffsetRight = null;

            if ($newTiles.length > 0) {
                rightMostTile = this._findRightMostTile($newTiles);
                firstTileOffsetLeft = $newTiles[0].getBoundingClientRect().left;
                //if (lastTilesParentElement.length > 0) {
                //    lastTileOffsetRight = lastTilesParentElement[0].getBoundingClientRect().right;
                //}
                //else {
                //    lastTileOffsetRight = $newTiles[$newTiles.length - 1].getBoundingClientRect().right;
                //}
                lastTileOffsetRight = rightMostTile.getBoundingClientRect().right;

                if (emptyDropSlotView) {
                    dropSlotOffsetLeft = emptyDropSlotView.$el[0].getBoundingClientRect().left;
                    dropSlotOffsetRight = emptyDropSlotView.$el[0].getBoundingClientRect().right;
                    if (expressionRect.getLeft() > dropSlotOffsetLeft) {
                        scrollAmt = -(expressionRect.getLeft() - dropSlotOffsetLeft);
                        extraBuffer = -100;
                    }
                    else if (expressionRect.getRight() < dropSlotOffsetRight) {
                        scrollAmt = dropSlotOffsetRight - expressionRect.getRight();
                        extraBuffer = 100;
                    }
                }
                else {
                    if (expressionRect.getLeft() > firstTileOffsetLeft) {
                        scrollAmt = -(expressionRect.getLeft() - firstTileOffsetLeft);
                        extraBuffer = -10;
                    }
                    else if (expressionRect.getRight() < lastTileOffsetRight) {
                        //if ($($newTiles[0]).hasClass('empty-dropslot')) {
                        //    scrollAmt = (expressionRect.getLeft() - firstTileOffsetLeft);
                        //    extraBuffer = -10;
                        //}
                        //else {
                        scrollAmt = lastTileOffsetRight - expressionRect.getRight();
                        extraBuffer = 10;
                        //}
                        //scrollAmt = expressionRect.getRight() - lastTileOffsetRight;

                    }
                }

                //scrollAmt = lastTileOffsetLeft - 17;//width of null operator = 17px
                if (scrollLeft === scrollAmt) {
                    this.showHideOverlayDiv2(false);
                }
                else {
                    scrollAmt = scrollAmt + scrollLeft + extraBuffer;
                    if (!isUndoCalled) {
                        this.showHideOverlayDiv2(true);
                        $expression.animate({
                            scrollLeft: scrollAmt
                        }, 1000, function () {
                            self.showHideOverlayDiv2(false);
                        });
                    }
                    else {
                        $expression.scrollLeft(scrollAmt);
                    }
                }
            }
        },

        _findRightMostTile: function _findRightMostTile(newTilesArray) {
            var counter = newTilesArray.length - 1,
                endValue = 0,
                rightMostTile = newTilesArray[counter],
                rightMostTileRight = 0,
                currentTileRight = null;

            for (; counter >= endValue; counter--) {
                currentTileRight = newTilesArray[counter].getBoundingClientRect().right;
                if (currentTileRight > rightMostTileRight) {
                    rightMostTileRight = currentTileRight;
                    rightMostTile = newTilesArray[counter];
                }
                //else {
                //    break;
                //}
            }

            return rightMostTile;
        },

        _undoResetBtnStatus: function () {
            var undoStack = this.commandFactory.get('undoStack'),
                disabledState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED,
                undoButtonState = (this.undoButtonView) ? this.undoButtonView.getButtonState() : null,
                resetButtonState = (this.resetButtonView) ? this.resetButtonView.getButtonState() : null;

            if (this.undoButtonView || this.resetButtonView) {
                if (undoStack.length > 0) {
                    if (undoButtonState === disabledState) {
                        //this._enableDisableButtons(this.undoButtonView, true);
                        this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.UNDO_BUTTON, true);
                    }
                    if (resetButtonState === disabledState) {
                        //this._enableDisableButtons(this.resetButtonView, true);
                        this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.RESET_BUTTON, true);
                        this.model.set('resetBtnStatus', true);
                    }
                }
            }
        },

        versionCompare: function versionCompare(v1, v2, options) {
            var lexicographical = options && options.lexicographical,
                zeroExtend = options && options.zeroExtend,
                v1parts = v1.split('.'),
                v2parts = v2.split('.');

            function isValidPart(x) {
                return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
            }

            if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                return NaN;
            }

            if (zeroExtend) {
                while (v1parts.length < v2parts.length) v1parts.push("0");
                while (v2parts.length < v1parts.length) v2parts.push("0");
            }

            if (!lexicographical) {
                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);
            }

            for (var i = 0; i < v1parts.length; ++i) {
                if (v2parts.length == i) {
                    return 1;
                }

                if (v1parts[i] == v2parts[i]) {
                    continue;
                }
                else if (v1parts[i] > v2parts[i]) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            if (v1parts.length != v2parts.length) {
                return -1;
            }

            return 0;
        },

        _checkOfIntroductionOfParenthesesOrFraction: function _checkOfIntroductionOfParenthesesOrFraction() {
            this.equationView.isExpressionContainsParOrFraction();
        },



        _checkForNestedLevelOfParentheses: function _checkForNestedLevelOfParentheses() {
            var result = this.equationView.checkForNestedLevelOfParentheses();
            return result;
            //if (result) {
            //    //this.enableDisableBinTiles(false);
            //}
            //else {
            //    //this.enableDisableBinTiles(true);
            //}
        },

        equationNotBalancedFeedback: function equationNotBalancedFeedback() {
            var nullTile = this.equationView.containsNullTile();
            if (nullTile) {
                /*if (nullTile.model.get('operator') === modelClassNameSpace.TileItem.OPERATORS.ADDITION) {
                    //addition
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 16));
                }
                else if (nullTile.model.get('operator') === null && nullTile.model.get('isDenominator')) {
                    //fraction
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 18));
                }
                else if (nullTile.model.get('operator') === null && nullTile.model.get('isDenominator') === false) {
                    //multiplication
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 17));
                }*/
                this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 16), this.getAccMessage('inline-feedback-text', 16));
            }
        },



        scrollExpression: function scrollExpression(expressionView, scrollDirection) {
            var scrollAmt, $expression = expressionView.$el, self = this;
            if (scrollDirection === viewNameSpace.EquationManagerPro.SCROLL_DIRECTION.LEFT) {
                scrollAmt = 0;
            }
            else if (scrollDirection === viewNameSpace.EquationManagerPro.SCROLL_DIRECTION.RIGHT) {
                scrollAmt = $expression[0].scrollWidth;
            }
            this.showHideOverlayDiv2(true);
            $expression.animate({
                scrollLeft: scrollAmt
            }, 1000, function () {
                self.showHideOverlayDiv2(false);
            });
        },

        undo: function (isReplaceCommand) {
            var undoStack = this.commandFactory.get('undoStack'), nullTile;
            window.clearTimeout(this.timerId);
            this.removeHighlightTilesImmediate();
            this.commandFactory.undo(isReplaceCommand);
            nullTile = this.containsNullTile();
            if (nullTile && nullTile.model.get('tileToReplace') === 't') {
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.SET_FIRST_TILE_DROP);
            }
            this.equationView.checkForFractionInExpression();
            this.equationView.hideOperatorOfParCoeff();
            if (this.getTileAddedInExpression() !== null) {
                this.setTileAddedInExpression();
                this.undo(true);
            }
            else {
                if (!isReplaceCommand) {
                    this.trigger(viewNameSpace.EquationManagerPro.EVENTS.REMOVE_STEP);
                }
            }
            //this.tileAddedFromBinValue = null;
            this.setTileAddedFromBinValue();
            if (nullTile) {
                this.setTileAddedInExpression(true);
                this.setTileAddedFromBinValue(nullTile.model.get('tileToReplace'));
                //this.disableMarquee(true, true);
                if (this.options.createTileBin) {
                    if (this.getTileAddedFromBinValue() !== 't') {
                        this.enableDisableBinTiles(true);
                    }
                }
            }
            //else {
            //    if (this.options.createTileBin) {
            //        if (undoStack.length) {
            //            this._checkForNestedLevelOfParentheses();
            //        }
            //    }
            //}
            this.setDeletedItemsInParenthesesFraction();
            this._checkOfIntroductionOfParenthesesOrFraction();
            this.isExpressionContainsParentheses();

            this.removeHighlightTiles();
            this.setTreeRoot();
            this._scrollExpressionOnCommandSuccess(true, true);
            this._scrollExpressionOnCommandSuccess(true, false);
            if (this.options.createTileBin) {
                this._setDropSlotsForBinTiles();
            }
            if (undoStack.length === 0 && this.getTileAddedInExpression() === null && this.model.get('isTDropped') === false) {
                this.setFirstTileDrop(false);
                this._firstTileDrop();
            }

            this._checkOfBigParentheses();
        },

        containsNullTile: function containsNullTile() {
            return this.equationView.containsNullTile();
        },

        /**
        * Fires break base command on base click
        * @method onBaseClick
        * @param {sourceTile} Tile Item View of source tile
        * @param {data} data needed for command
        * @public
        */
        onBaseClick: function (sourceTile) {

            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile)),
                data = {
                    source: source,
                    root: this.getTreeRoot()
                },
                self = this, isSuccess,
                base = sourceTile.model.get('base'),
                squareRootProps = sourceTile.model.get('squareRootProps'),
                iotaExponent = sourceTile.model.get('iotaExponent');

            this.restrictFirstTileAnimation = true;
            sourceTile.$el.css({ 'visibility': 'hidden' });
            isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.BREAK_BASE, data);
            sourceTile.$el.css({ 'visibility': '' });
            if (base !== 0 && (squareRootProps || !iotaExponent || base !== 1) && (!squareRootProps || iotaExponent || squareRootProps.isNegative)) {
                this._animateTiles(isSuccess);
                if (isSuccess === true) {
                    self.trigger(viewNameSpace.EquationManagerPro.EVENTS.TILE_DROP_SUCCESS);
                }
            }
            else {
                this.$('.invisible-operators, .animated-tiles').css({ 'visibility': '' }).removeClass('invisible-operators animated-tiles');
            }
            return isSuccess;
        },

        onExponentClick: function onExponentClick(sourceTile) {
            if (sourceTile.isTilesDisabled === true) { return; }
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile)),
                data = {
                    source: source,
                    root: this.getTreeRoot()
                },
                self = this, isSuccess, animateTile = false;

            this.restrictFirstTileAnimation = true;
            //sourceTile.$el.css({ 'visibility': 'hidden' });
            if (this._checkPlusOpInPar(sourceTile) === true) {
                animateTile = true;
            }
            isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.PARENTHESES_EXPONENT_CLICK, data);
            //sourceTile.$el.css({ 'visibility': 'visible' });
            if (animateTile) {
                this._animateTiles(isSuccess);
                if (isSuccess === true) {
                    self.trigger(viewNameSpace.EquationManagerPro.EVENTS.TILE_DROP_SUCCESS);
                }
            }
            return isSuccess;
        },

        _checkPlusOpInPar: function _checkPlusOpInPar(tileView) {
            for (var i = 0; i < tileView.tileViews.length; i++) {
                if (tileView.tileViews[i].model.get('operator') === '+') {
                    return true;
                }
            }
            return false;
        },
        /**
        * Fires reposition command
        * @method onRepositionTile
        * @param {tileData} data needed for command
        * @public
        */
        onRepositionTile: function onRepositionTile(tileData) {
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                source = new cmdFactoryClass.TileLocation(tileData.sourceTile.parent.getIndex(tileData.sourceTile), tileData.numOfTiles),
                dest = new cmdFactoryClass.TileLocation(tileData.destTile.parent.getIndex(tileData.destTile)),
                data = {
                    source: source,
                    dest: dest,
                    root: this.getTreeRoot(),
                    bLeft: tileData.bLeft
                },
                isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.REPOSITION_COMMAND, data);
            return isSuccess;
        },

        /**
        * Fires take out common command
        * @method onTakeOutCommonTile
        * @param {tileData} data needed for command
        * @public
        */
        onTakeOutCommonTile: function onTakeOutCommonTile(tileData) {
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                source = new cmdFactoryClass.TileLocation(tileData.sourceTile.parent.getIndex(tileData.sourceTile), tileData.sourceNumOfTiles),
                dest = new cmdFactoryClass.TileLocation(tileData.destTile.parent.getIndex(tileData.destTile)),
                data = {
                    source: source,
                    dest: dest,
                    root: this.getTreeRoot()
                },
                isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.TAKE_OUT_COMMON_COMMAND, data);
            switch (isSuccess) {
                case cmdFactoryClass.EXIT_CODE.SIMPLIFY_TERMS_FIRST:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 1), this.getAccMessage('inline-feedback-text', 1));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.NOT_LIKE_TERMS:
                case cmdFactoryClass.EXIT_CODE.SIMPLIFY_TERM_TAKE_COMMON:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 5), this.getAccMessage('inline-feedback-text', 5));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.BREAK_IMAGINARY_NUMBER:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 6), this.getAccMessage('inline-feedback-text', 6));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.MINUS_ONE_COMMON_OUT:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 7), this.getAccMessage('inline-feedback-text', 7));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.NEGATIVE_NUMBER_COMMON_OUT:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 8, [this.getMinusSignLocText()]), this.getAccMessage('inline-feedback-text', 8, [this.getMinusSignLocText()]));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.ROOT_MAGNITUDE:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 9), this.getAccMessage('inline-feedback-text', 9));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.FACTOR_ONE_FROM_PARANTHESES:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 10), this.getAccMessage('inline-feedback-text', 10));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.APPLY_COEFFECIENTS:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 21), this.getAccMessage('inline-feedback-text', 21));
                    isSuccess = false;
                    break;
            }
            return isSuccess;
        },

        /**
        * Fires combine command
        * @method onCombineTile
        * @param {tileData} data needed for command
        * @public
        */
        onCombineTile: function onCombineTile(tileData) {
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                source = new cmdFactoryClass.TileLocation(tileData.sourceTile.parent.getIndex(tileData.sourceTile), tileData.sourceNumOfTiles),
                dest = new cmdFactoryClass.TileLocation(tileData.destTile.parent.getIndex(tileData.destTile), tileData.destNumOfTiles),
                data = {
                    source: source,
                    dest: dest,
                    root: this.getTreeRoot()
                },
                isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.COMBINE, data);
            switch (isSuccess) {
                case cmdFactoryClass.EXIT_CODE.NOT_LIKE_TERMS:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 0), this.getAccMessage('inline-feedback-text', 0));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.SIMPLIFY_TERMS_FIRST:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 1), this.getAccMessage('inline-feedback-text', 1));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.SIMPLIFY_IMAGINARY_NUMBER:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 2), this.getAccMessage('inline-feedback-text', 2));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.NOT_DISTRIBUTIVE:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 3), this.getAccMessage('inline-feedback-text', 3));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.MAX_VALUE_REACHED:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 11), this.getAccMessage('inline-feedback-text', 11));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.DIVIDE_ON_OTHER_SIDE:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 14), this.getAccMessage('inline-feedback-text', 14));
                    isSuccess = false;
                    break;
                case cmdFactoryClass.EXIT_CODE.APPLY_COEFFECIENTS:
                    this._changeTooltipTextAndShow(this.getMessage('inline-feedback-text', 21), this.getAccMessage('inline-feedback-text', 21));
                    isSuccess = false;
                    break;
            }
            return isSuccess;
        },

        /**
        * Fires add tile command
        * @method onAddTile
        * @param {tileData} data needed for command
        * @public
        */
        onAddTile: function onAddTile(tileData) {
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
               source = new cmdFactoryClass.TileLocation(tileData.index, 1),
               data = {
                   source: source,
                   root: this.getTreeRoot(),
                   isLHS: tileData.isLHS,
                   isDenominator: tileData.isDenominator,
                   operation: tileData.operation,
                   tileValue: tileData.tileValue,
                   dummyTileValue: tileData.dummyTileValue,
                   parenthesesAdded: tileData.parenthesesAdded,
                   fractionAdded: tileData.fractionAdded,
                   tilesToAddInFraction: tileData.tilesToAddInFraction
               },
               isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.ADD_TILE, data),
               operationPerformed = {
                   'operation': tileData.operation,
                   'isDenominator': tileData.isDenominator
               };

            this.model.set('operationPerformed', operationPerformed);

            return isSuccess;
        },


        onReplaceTile: function onReplaceTile(tileData) {
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
               source = new cmdFactoryClass.TileLocation(tileData.index, 1),
               data = {
                   source: source,
                   root: this.getTreeRoot(),
                   tileValue: tileData.tileValue
               },
               isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.REPLACE_TILE, data);

            //tile value is t then trigger
            if (data.tileValue === 't') {
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.RESET_FIRST_TILE_DROP);
            }
            return isSuccess;
        },

        setTileAddedInExpression: function setTileAddedInExpression(isLHS) {
            //tile added in <isLHS> section
            if (isLHS === undefined) {
                //this.addTileInExpression = null;
                this.model.set('addTileInExpression', null);
            }
            else {
                //this.addTileInExpression = isLHS;
                this.model.set('addTileInExpression', isLHS);
            }

        },

        getTileAddedInExpression: function getTileAddedInExpression() {
            return this.model.get('addTileInExpression');
        },

        setTileAddedFromBinValue: function setTileAddedFromBinValue(value) {
            if (value === undefined) {
                this.model.set('tileAddedFromBinValue', null);
            }
            else {
                this.model.set('tileAddedFromBinValue', value);
            }

        },

        getTileAddedFromBinValue: function getTileAddedFromBinValue() {
            return this.model.get('tileAddedFromBinValue');
        },

        getFirstTileDrop: function getFirstTileDrop() {
            return this.model.get('isFirstTileDrop');
        },

        setFirstTileDrop: function setFirstTileDrop(isDropped) {

        },

        /**
        * Updates the bottom equations.
        *
        * @method _updateBottomEquations
        * @private
        */

        _updateBottomEquations: function _updateBottomEquations() {
            var tileViews = this.equationView.tileViews,
                lhsExpr = null,
                rhsExpr = null,
                onlyLHS = this.options.onlyLHS;

            lhsExpr = tileViews[0].getTileContentInHtmlForm();
            this.$('.lhs-expression-container').html('').append(lhsExpr);

            this._handleCaseOfFraction(this.$('.lhs-expression-container'));

            if (!onlyLHS) {
                rhsExpr = tileViews[1].getTileContentInHtmlForm();
                this.$('.rhs-expression-container').html('').append(rhsExpr);
                this._handleCaseOfFraction(this.$('.rhs-expression-container'));
            }
            this._updateEquationPosition();
            /*      
                  this._addEquationInTooltip();
                  this._bindEquationTooltipEvents();
            */
        },


        _handleCaseOfFraction: function _handleCaseOfFraction($element) {


            if ($element.find('.fraction-data-tab').length > 0) {
                $element.find('.expression-common').addClass('expression-contains-fraction');
            }
            if ($element.find('.big-parenthesis-container').length === 0) {
                $element.find('.expression-common').addClass('expression-without-big-parentheses');
            }

        },



        updateBottomEquations: function updateBottomEquations() {
            this._updateBottomEquations();
        },

        updateTilesInBin: function updateTilesInBin(isTutorial) {
            var self = this;
            this.createTilesInBin(isTutorial);
            this._attachHoverTileEvents(self);
            this._attachNegateTileEvents(self);
        },

        /**
        * Creates tile in the bottom section.
        *
        * @method createTilesInBin
        * @public
        *
        */

        createTilesInBin: function createTilesInBin(isTutorial) {
            var numericTileArray = this.numericTileArray,
                tileArray = (numericTileArray) ? numericTileArray : [1, 2, 3, 4, 5, 6, 7, 8, 9],
                idPrefix = this.idPrefix,
                tileString = 'tile-',
                baseTileType = modelClassNameSpace.TileItem.TileType.BIN_TILE,
                counter = 0,
                endValue = tileArray.length,
                tileText = tileArray[counter],
                templateOptions = {
                    'base-class': 'bin-tiles-base',
                    'baseTileType': baseTileType,
                    'idPrefix': idPrefix
                },
                templateString = null,
                allTilesInBin = null,
                //binTileArray = (numericTileArray) ? tileArray : tileArray.reverse(),
                binTileArray = [],
                tileTextFrequencyArray = this.tileTextFrequencyArray,
                tileTextFrequencyArrayLength = (tileTextFrequencyArray) ? tileTextFrequencyArray.length : 0,
                tileTextArray = this.tileTextArray,
                binTileArrayTemplateOptions = null,
                tileTextCounter = 0,
                tileTextArrayLength = null,
                frequencyTile = [],
                counterOne = 0,
                counter = 1,
                binTilesInfoPair = {},
                currentTileValue;

            //if (tileTextFrequencyArrayLength > 0) {
            //    counter = 0;
            //    for (; counter < tileTextFrequencyArrayLength; counter++) {
            //        counterOne = 1;
            //        frequencyTile[counter] = [];
            //        for (; counterOne <= tileTextFrequencyArray[counter]; counterOne++) {
            //            frequencyTile[counter].push(counterOne)
            //        }
            //    }

            //}

            //binTileArray = this.binTileArray; // This line is commented because it was again resetting the binTileArray and previous bin tiles were shown again.

            counter = 0;
            for (; counter < endValue; counter++) {
                currentTileValue = tileArray[counter];
                if (typeof currentTileValue === 'number') {
                    binTilesInfoPair.className = Math.abs(currentTileValue);
                }
                else {
                    if (currentTileValue === 'x' || currentTileValue === '-x') {
                        binTilesInfoPair.className = 'x';
                    }
                    else if (currentTileValue === 't' || currentTileValue === '-t') {
                        binTilesInfoPair.className = 't';
                    }
                }
                binTilesInfoPair.value = tileArray[counter];
                binTileArray[counter] = binTilesInfoPair;
                binTilesInfoPair = {};
            }


            binTileArrayTemplateOptions = {
                'tileArray': binTileArray,
                'idPrefix': idPrefix,
                'tileType': 'BIN_TILE',
                "prefix": !isTutorial ? 'explore' : 'tutorial'
                //'tileOneText': tileTextArray[0],
                //'frequencyTile1': frequencyTile[0],
                //'tileTwoText': tileTextArray[1],
                //'frequencyTile2': frequencyTile[1],
            };

            allTilesInBin = MathInteractives.Common.Components.templates['binTileArray'](binTileArrayTemplateOptions);
            this.$binTileContainment.html('').append($(allTilesInBin));

            $(this.$binTileContainment.find('.bin-tiles')[endValue - 1]).addClass('last-tile-in-bin');

            counter = 0;
            endValue = binTileArray.length;
            //if (!numericTileArray) {
            //    tileArray.reverse();
            //}
            for (; counter < endValue; counter++) {
                //tileText = tileArray[counter];
                tileText = binTileArray[counter];
                if (typeof (tileText.value) === 'string') {
                    templateOptions.base = '<i>' + tileText.value + '</i>';
                }
                else {
                    if (tileText.value >= 0) {
                        templateOptions.base = tileText.value;
                    }
                    else {
                        templateOptions.base = this.minusSign + Math.abs(tileText.value);
                    }
                }

                templateOptions.level = '';
                templateString = MathInteractives.Common.Components.templates['baseTilePro'](templateOptions);
                this.$binTileContainment.find('.bin-tile-number-' + tileText.className).append($(templateString));
                if ((tileText.value + '').length > 3 || ((tileText.value + '').length === 3 && (tileText.value + '').indexOf('-') === -1)) {
                    this.$binTileContainment.find('.bin-tile-number-' + tileText.className).find('.base-value').addClass('decrease-font-size');
                }
            }

            //templateOptions.base = tileText;
            //templateOptions.level = '';

            //counter = 1;
            //if (this.tileTextArray) {
            //    tileTextArrayLength = this.tileTextArray.length;
            //    for (; tileTextCounter < tileTextArrayLength; tileTextCounter++) {
            //        counter = 1;
            //        tileText = this.tileTextArray[tileTextCounter];
            //        templateOptions.base = tileText;
            //        templateString = MathInteractives.Common.Components.templates['baseTile'](templateOptions);
            //        for (; counter <= tileTextFrequencyArray[tileTextCounter]; counter++) {
            //            this.$binTileContainment.find('.bin-tile-' + tileText + '-' + counter).append($(templateString)).attr('data-variable', true);
            //        }
            //    }
            //}
        },

        /**
        * Creates Reset & Undo buttons.
        *
        * @method _createResetUndoButtons
        * @private
        */

        _createResetUndoButtons: function _createResetUndoButtons() {
            var idPrefix = this.idPrefix,
                filePath = this.filePath,
                button = MathInteractives.global.Theme2.Button,
                resetButtonType = this.resetButtonType,
                undoButtonType = this.undoButtonType,
                elID = this.el.id,
                idPrefix = elID, // This may be removed later.
                options = {
                    'player': this.player,
                    'manager': this.manager,
                    'path': this.filePath,
                    'idPrefix': idPrefix,
                    'data': {
                        'id': idPrefix + 'reset-button-container',
                        'type': resetButtonType,
                        'baseClass': 'buttons-base-class',
                        'text': this.manager.getMessage('comm2', 0),
                        'textColor': this.resetButtonTextColor,
                        'height': 38,
                        'width': 42,
                        'icon': {
                            'faClass': filePath.getFontAwesomeClass('fixed-reset'),
                            'fontColor': this.resetButtonTextColor,
                            'fontSize': 22,
                            'height': 20,
                            'width': 25
                        }
                    }
                },
                optionsData = options.data,
                optionsDataIcon = optionsData.icon,
                templateOptions = {
                    'idPrefix': this.el.id
                },
                buttonGroupHTML = null,
                self = this,
                buttonGroup = this.buttonGroup || [],
                counter = 0,
                buttonGroupLength = buttonGroup.length,
                accEelmOptions = null;

            if (resetButtonType === button.TYPE.FA_ICONTEXT) {
                if (this.resetButtonWidth) {
                    optionsData.width = this.resetButtonWidth;
                }
                else {
                    delete optionsData.width;
                }
            }
            else {
                options.data.tooltipText = this.manager.getMessage('comm2', 0);
                options.data.tooltipType = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE;
            }
            this.$buttonGroupContainer.html('');
            for (; counter < buttonGroupLength; counter++) {
                templateOptions.buttonName = buttonGroup[counter];
                buttonGroupHTML = MathInteractives.Common.Components.templates['buttonGroup'](templateOptions);
                this.$buttonGroupContainer.append($(buttonGroupHTML));
            }

            this.resetButtonView = new button.generateButton(options);

            if (this.resetButtonView.el) {
                accEelmOptions = {
                    "elementId": this.resetButtonView.$el.attr('id').split(this.idPrefix)[1],// this.ideprefix is used specifically
                    "tabIndex": this.tabIndex + 410,
                    "acc": this.manager.getMessage('comm2', 0), // This is particularly taken as getMessage instead of getAccMessage. This is because the acc message for particular accId is different.
                    "role": 'button'
                }
                this.createAccDiv(accEelmOptions);

                //this._enableDisableButtons(this.resetButtonView, this.model.get('resetBtnStatus'));
                this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.RESET_BUTTON, this.model.get('resetBtnStatus'));

                this.resetButtonView.$el.off('click.resetButtonClick').on('click.resetButtonClick', function () {
                    self._resetButtonClickHandler();
                });
            }

            optionsData.id = idPrefix + 'undo-button-container';
            optionsDataIcon.faClass = filePath.getFontAwesomeClass('fixed-undo');
            optionsData.type = undoButtonType;
            optionsData.textColor = this.undoButtonTextColor;
            optionsData.icon.fontColor = this.undoButtonTextColor;
            optionsData.text = this.manager.getMessage('comm24', 0);

            if (undoButtonType === button.TYPE.FA_ICONTEXT) {
                if (this.undoButtonWidth) {
                    optionsData.width = this.undoButtonWidth;
                }
                else {
                    delete optionsData.width;
                }
            }
            else {
                options.data.tooltipText = this.manager.getMessage('comm24', 0);
                options.data.tooltipType = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE;
            }
            options.data.icon.height = 15;

            this.undoButtonView = new button.generateButton(options);

            accEelmOptions = {
                "elementId": this.undoButtonView.$el.attr('id').split(this.idPrefix)[1], // this.ideprefix is used specifically
                "tabIndex": this.tabIndex + 400,
                "acc": this.manager.getAccMessage('comm24', 0),
                "role": 'button'
            }

            this.createAccDiv(accEelmOptions);

            //this._enableDisableButtons(this.undoButtonView, false);
            this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.UNDO_BUTTON, false);
            this.undoButtonView.$el.off('click.undoButtonClick').on('click.undoButtonClick', function (event) {
                self._undoButtonClickHandler(event);
            });
            this.undoButtonView.$el.off('mousedown.undoButtonClick').on('mousedown.undoButtonClick', function (event) {
                self.mouseDownOnInteractive(event, true, true, true);
                return false;
            });



            //this.trigger(viewNameSpace.EquationManagerPro.EVENTS.SET_UNDO_RESET_BTN_TAB_INDEXES, { undoBtnTabIndex: this.tabIndex + 600, resetBtnTabIndex: this.tabIndex + 700 });
        },

        /**
        * Makes the equal to sign container element dragable.
        *
        * @method makeResizableContainerDraggable
        * @public
        *
        */

        makeResizableContainerDraggable: function makeResizableContainerDraggable() {
            var model = this.model,
                $draggableHandle = this.$('.equals-sign-container'), self = this;
            $draggableHandle.not('.ui-disabled').draggable({
                start: $.proxy(this._handleDragStart, this),
                drag: $.proxy(this._handleDragHandler, this),
                revert: false,
                stop: $.proxy(this._handleDragStop, this),
                containment: this.$('.drag-handle-containment'),
                axis: "x",
                cursor: 'col-resize',
                cursorAt: { left: this.$('.equals-sign-container').width() / 2 },
                refreshPositions: true
            });

            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($draggableHandle, { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.DRAGGABLE });
        },

        /**
        * Enables / disables the resize container's dragging.
        *
        * @method enableDisableResizableContainerDrag
        * @param [enable] {Boolean} Enables the dragging of the resize container. Disables if passed as false.
        */
        enableDisableResizableContainerDrag: function enableDisableResizableContainerDrag(enable) {
            var $draggableHandle = this.$('.equals-sign-container');
            if ($draggableHandle.is('.ui-draggable')) {
                if (enable === false) {
                    $draggableHandle.draggable('disable').css('cursor', 'default');
                }
                else {
                    $draggableHandle.draggable('enable').css('cursor', 'col-resize');
                }
            }
        },

        _handleDragStart: function _handleDragStart() {
            this.equationView.attachDetachDroppable(false, true);
            this.prevHandleLeft = this.$('.equals-sign-container').position().left;
        },

        /**
        * Handles the draggging of the equal to sign container element. Resizes the left and right side containers accordingly.
        *
        * @method _handleDragHandler
        * @private
        *
        */
        _handleDragHandler: function _handleDragHandler(event, ui) {

            var lhsWidth, rhsWidth, totalExprWidth = this.$el.width(),
                currentHandleLeft = ui.position.left;

            lhsWidth = Math.abs(this.$lhsExprView.position().left - currentHandleLeft);
            rhsWidth = totalExprWidth - lhsWidth - ui.helper.width();

            this.$lhsExprView.css('width', lhsWidth);
            this.$rhsExprView.css('width', rhsWidth);
            this.$lhsExprView.find('.expression-seperator-holder svg').css('transform', 'scale(' + (this.$lhsExprView.width() / 300) + ', 1)');
            this.$rhsExprView.find('.expression-seperator-holder svg').css('transform', 'scale(' + (this.$rhsExprView.width() / 300) + ', 1)');
            //console.log(lhsWidth, rhsWidth);

        },

        _updateEquationPosition: function _updateEquationPosition() {

            //var lhsWidth = this.$('.lhs-expression-view').width(),
            //    rhsWidth = this.$('.rhs-expression-view').width(),
            //    leftExpWidth = this.$el.find('.left-expression').width(),
            //   rightExpWidth = this.$el.find('.right-expression').width();

            ////if (lhsWidth > leftExpWidth) {
            ////    this.$el.find('.left-expression').css({ 'left': (lhsWidth - leftExpWidth) / 2 });
            ////}
            ////else {
            ////    this.$el.find('.left-expression').css({ 'left': 5 });
            ////}

            ////if (rhsWidth > rightExpWidth) {
            ////    this.$el.find('.right-expression').css({ 'left': (rhsWidth - rightExpWidth) / 2 });
            ////}
            ////else {
            ////    this.$el.find('.right-expression').css({ 'left': 5 });
            ////}

            //this.$el.find('.left-expression').css({ 'min-width': leftExpWidth + 1 });
            //this.$el.find('.right-expression').css({ 'min-width': rightExpWidth + 1 });
        },

        updateEquationPosition: function updateEquationPosition() {
            this._updateEquationPosition();
        },

        _handleDragStop: function _handleDragStop() {
            this.equationView.attachDetachDroppable(true);
            if (this.getFirstTileDrop() === true) {
                this._setDropSlotsForBinTiles();
            }
        },

        /**
        * Adds class 'hover' on mouseover and removes class 'hover' on mouseout.
        *
        * @method _attachHoverTileEvents
        * @private
        *
        */

        _attachHoverTileEvents: function _attachHoverTileEvents(self) {
            var $binTileContainment = this.$binTileContainment;
            if (BrowserCheck.isAndroid === false && BrowserCheck.isIOS === false) {
                $binTileContainment.find('.bin-tiles').off('mouseover.binTileMouseOver').on('mouseover.binTileMouseOver', function (event) {
                    self._onTileMouseOver(event);
                });
                $binTileContainment.find('.bin-tiles').off('mouseout.binTileMouseOut').on('mouseout.binTileMouseOut', function (event) {
                    self._onTileMouseOut(event);
                });
            }
            else {
                $binTileContainment.find('.bin-tiles').off('touchstart.binTileTouchStart').on('touchstart.binTileTouchStart', function (event) {
                    self._onTileTouchStart(event);
                });
                $binTileContainment.find('.bin-tiles').off('touchend.binTileTouchEnd').on('touchend.binTileTouchEnd', function (event) {
                    self._onTileTouchEnd(event);
                });
            }
        },

        /**
        * Adds the class 'hover' on hovering on the tiles.
        *
        * @method _onTileMouseOver
        * @private
        *
        */

        _onTileMouseOver: function _onTileMouseOver(event) {
            $(event.currentTarget).find('.bin-tiles-base').addClass('hover');
        },

        /**
        * Removes the class 'hover' on tile mouse out.
        *
        * @method _onTileMouseOut
        * @private
        *
        */

        _onTileMouseOut: function _onTileMouseOut(event) {
            $(event.currentTarget).find('.bin-tiles-base').removeClass('hover');
        },

        /**
        * Handles the hovering for touch screens.
        *
        * @method _onTileTouchStart
        * @private
        *
        */

        _onTileTouchStart: function _onTileTouchStart(event) {
            $(event.target).addClass('hover');
        },

        /**
        * Handles the hovering for touch screens.
        *
        * @method _onTileTouchEnd
        * @private
        *
        */

        _onTileTouchEnd: function _onTileTouchEnd(event) {
            $(event.target).removeClass('hover');
        },

        /**
        * Attach negate tile events.
        *
        * @method _attachNegateTileEvents
        * @private
        *
        */

        _attachNegateTileEvents: function _attachNegateTileEvents(self) {
            var $binTiles = self.$binTileContainment.find('.bin-tiles');
            $binTiles.off('click.binTileClick').on('click.binTileClick', function (event) {
                if (self.isAnimationRunning === true || $(event.currentTarget).hasClass('disable') || $(event.currentTarget).attr('data-tilevalue') === 't') {
                    return;
                }
                self._onBinTileClick(this);
            });

            $binTiles.off('mousedown.binTileDown').on('mousedown.binTileDown', function () {
                self.stopReading();
            });

        },

        /**
       * Handle click on bin tiles.
       *
       * @method _onBinTileClick
       * @private
       *
       */

        _onBinTileClick: function _onBinTileClick(tile) {
            var $tile,
                tileVlaueOrig,
                xvalue = null,
                tileValue,
                self = this,
                previousValue = null,
                tileId = tile.id.split(this.idPrefix)[1],
                changedValue = null;

            $tile = $(tile);

            tileVlaueOrig = $tile.attr('data-tilevalue');
            xvalue = null;

            tileValue = ((tileVlaueOrig !== 'x' && tileVlaueOrig !== '-x') && (tileVlaueOrig !== 't' && tileVlaueOrig !== '-t')) ? parseInt(tileVlaueOrig, 10) * -1 : tileVlaueOrig;

            if (typeof tileValue === 'number') {
                previousValue = tileValue * -1;
                if (tileValue > 0) {
                    $tile.find('.base-value').html(tileValue);
                }
                else {
                    $tile.find('.base-value').html('<span>&minus;</span>' + Math.abs(tileValue));
                    //$tile.find('.base-value').html(tileValue);
                }
                $tile.attr('data-tilevalue', tileValue);
                changedValue = tileValue;
            }
            else {
                previousValue = tileValue;
                if (tileValue === 'x') {
                    xvalue = this.minusSign + 'x';
                    $tile.attr('data-tilevalue', '-x');
                    changedValue = '-x'
                }
                else if (tileValue === '-x') {
                    xvalue = 'x';
                    $tile.attr('data-tilevalue', xvalue);
                    changedValue = xvalue;
                }
                if (tileValue === 't') {
                    xvalue = this.minusSign + 't';
                    $tile.attr('data-tilevalue', '-t');
                    changedValue = '-t';
                }
                else if (tileValue === '-t') {
                    xvalue = 't';
                    $tile.attr('data-tilevalue', xvalue);
                    changedValue = xvalue;
                }
                $tile.find('.base-value').html('<em>' + xvalue + '</em>');
            }

            if ($tile.hasClass('bin-tile-number-x') === true) {
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.COEFF_TILE_NEGATED, { changedValue: changedValue, previousValue: previousValue });
            }

            $tile.addClass('animated fadeIn');
            this.showHideOverlayDiv(true);
            this.isAnimationRunning = true;
            $tile.off('webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd');
            if (this._isIE9) {
                this._onAnimationEndAfterBinTileClick($tile);
            }
            else {
                $tile.one('webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd', function () {
                    self._onAnimationEndAfterBinTileClick($tile);
                });
            }

            if (!this.isTutorialMode) {
                this.setAccMessage(tileId, this._getTileText($tile));
            }

            if ($tile.hasClass('last-tile-in-bin') === true) {
                this.numberToReplaceInBin = changedValue;
                this.model.set('numberToReplaceInBin', changedValue);
            }

            this.trigger(viewNameSpace.EquationManagerPro.EVENTS.BIN_TILE_SIGN_CHANGED, { previousValue: previousValue, changedValue: changedValue });
        },

        /**
        * Removes animation class from tile, hides the overlay DIV and sets related properties.
        *
        * @method _onAnimationEndAfterBinTileClick
        * @param $tile {Object} The bin tile that was clicked.
        * @private
        */
        _onAnimationEndAfterBinTileClick: function ($tile) {
            $tile.removeClass('animated fadeIn');
            this.showHideOverlayDiv(false);
            this.isAnimationRunning = false;
        },

        /**
        * Stores the negative sign at view level variable.
        *
        * @method _setNegativeSign
        * @private
        *
        */

        _setNegativeSign: function _setNegativeSign(value) {
            this.minusSign = $('<span/>').html('&minus;').html();
        },

        /**
        * Updates the numericTileArray.
        *
        * @method updatesNumericTileArray
        * @params numericTileArray {Array} Array of numeric tiles.
        * @public
        *
        */

        updatesNumericTileArray: function updatesNumericTileArray(numericTileArray) {
            this.numericTileArray = numericTileArray;
        },

        /**
         * validates the equation depending upon the interactive rules.
         * This methid should be overridden at interactive level, in the derived manger.
         * @method _validateEquation
         * @public
         *
         * @returns {Boolean} Whether the equation is in the simplest form or not.
         */
        checkIfSimplestForm: function checkIfSimplestForm() {
            return false;
        },

        /**
         * mouse down on interactive
         * @method mouseDownOnInteractive
         * @public
         *
         * @param {Object}  event           The event of mouse down
         * @param {Boolean} toRemoveMarquee Whether to remove the marquee or not.
         * @param {Boolean} toTrigger       Whether to trigger drag start or not.
         */

        mouseDownOnInteractive: function mouseDownOnInteractive(event, toRemoveMarquee, toTrigger, notToRemoveHighlight) {

            if (!notToRemoveHighlight) {
                this.removeHighlightTilesImmediate();
            }
            //checking event for right click issue.
            if (toRemoveMarquee && event.which === 1) {
                if (_.intersection($(event.target), this.$('.expression-view-holder')).length === 0) {
                    this.removeMarquee();
                }
            }

            if ($(event.target).parents('.theme2-tooltip').length > 0) {
                return;
            }

            if (this.combineLikeBasesTooltip) {
                this.combineLikeBasesTooltip.hideTooltip();
            }
            if (toTrigger) {
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.MOUSEDOWN_ON_TILES);
            }
            this.trigger(viewNameSpace.EquationManagerPro.EVENTS.HIDE_TOOLTIP);
        },

        /**
         * Creates tooltips for inline feedbacks
         * @method _createTooltips
         * @private
         *
         */
        _createTooltips: function _createTooltips() {
            if (this.combineLikeBasesTooltip === null && this.options.inlineFeedbackConatiner) {
                var tooltipOpts = {
                    elementEl: this.options.inlineFeedbackConatiner,
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    _player: this.player,
                    text: '',
                    baseClass: 'tooltip-base-class',
                    type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION,
                    arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    path: this.filePath,
                    filePath: this.filePath,
                    isTts: true,
                    isArrow: false,
                    closeOnDocumentClick: true,
                    tabIndex: 4500,
                    accDivOffset: {
                        offsetTop: -5,
                        offsetLeft: -5
                    }
                };
                this.combineLikeBasesTooltip = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipOpts);
                this._attachTooltipAccEvents();
            }
        },

        /**
        * Binds ACC events on combinelikebases tooltip
        *
        * @method _attachTooltipAccEvents
        * @private
        */
        _attachTooltipAccEvents: function _attachTooltipAccEvents() {
            var self = this;
            this.combineLikeBasesTooltip.$('.text-container')
            .off('keydown.hideToolTip')
            .on('keydown.hideToolTip', function (event, data) {

                if (event.keyCode === 9 && event.shiftKey) {
                    event.preventDefault();
                    self._handleFocusOutOnToolTip(event, true);
                }
            });

            this.combineLikeBasesTooltip.$('.custom-btn-tts-blue')
           .on('keydown.hideToolTip', function (event, data) {

               if (event.keyCode === 9 && !event.shiftKey) {
                   event.preventDefault();
                   self._handleFocusOutOnToolTip(event, false);
               }
           });
        },

        /**
        * Handles focus out event on combine bases tooltip
        * 
        * @method _handleFocusOutOnToolTip
        * @private
        */
        _handleFocusOutOnToolTip: function _handleFocusOutOnToolTip(event) {
            this.stopReading();
            this.setFocusOnPreviousElement(event);
            this.combineLikeBasesTooltip.hideTooltip();
        },

        /**
         * Changes tooltip text and show
         * @method _changeTooltipTextAndShow
         * @private
         *
         * @param {String} message The message to be shown.
         */
        _changeTooltipTextAndShow: function _changeTooltipTextAndShow(message, accMessage) {

            if (this.combineLikeBasesTooltip) {
                this.combineLikeBasesTooltip.$el.css({ left: 0 });
                this.combineLikeBasesTooltip.changeText(message, accMessage);
                this.combineLikeBasesTooltip.showTooltip();
                this.setFocus(this.combineLikeBasesTooltip.$el.find('.text-container').attr('id').split(this.idPrefix)[1]);
            }
            else {
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.SHOW_INTERACTIVE_TOOLTIP, message, accMessage);
            }

            this.tooltipData = {
                isTooltipVisible: true,
                lastIndex: this.prevTileIndex,
                selectedTile: this.$selectedTile,
                isMarquee: this.marqueeNodes.length > 0
            }
        },

        /************************************************************************ MAERQUEE SECTION ************************************************************************************/
        /**
        * Generate & instantiate the marquee.
        *
        * @method _generateMarquee
        * @private
        * @return {Object} Created marquee view
        */
        _generateMarquee: function _generateMarquee() {
            var marqueeViews = [];
            if (this.player) {
                var className = MathInteractives.Common.Components.Views.EquationManagerPro.Marquee,
                    marqueeView, options;
                options = {
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    filePath: this.filePath,
                    player: this.player,
                    equationManager: this,
                    marqueeContainer: this.$('.lhs-expression-marquee-container'),
                    scrollContainer: this.$('.lhs-expression-view-holder'),
                    selectorClass: viewNameSpace.EquationManagerPro.TILE_DUMMY_CLASS,
                    el: this.el,
                    marqueeIndex: 0,
                    marqueeBGColor: this.options.marqueeBGColor || false
                };

                marqueeView = className.createMarquee(options);
                this.listenTo(marqueeView, className.EVENTS.start, this._marqueeStartHandler);
                this.listenTo(marqueeView, className.EVENTS.ChangeSelectorClass, this._changeSelectorClass);
                this.listenTo(marqueeView, className.EVENTS.end, this._onMarqueeDrawn);
                marqueeViews.push(marqueeView);

                options.marqueeContainer = this.$('.rhs-expression-marquee-container').length > 0 ? this.$('.rhs-expression-marquee-container') : this.$('.rhs-expression-view');
                options.scrollContainer = this.$('.rhs-expression-view-holder');
                options.marqueeIndex = 1;
                marqueeView = className.createMarquee(options);

                this.listenTo(marqueeView, className.EVENTS.start, this._marqueeStartHandler);
                this.listenTo(marqueeView, className.EVENTS.ChangeSelectorClass, this._changeSelectorClass);
                this.listenTo(marqueeView, className.EVENTS.end, this._onMarqueeDrawn);
                marqueeViews.push(marqueeView);

                this.marqueeSelectedItems = [];
                this.marqueeNodes = [];

                return marqueeViews;
            }
        },

        /**
        * This function is called on the end event of marquee.
        * @method _onMarqueeDrawn
        * @private
        */
        _onMarqueeDrawn: function _onMarqueeDrawn(event, items, params) {
            var marqueeSelectedItems = this.marqueeSelectedItems,
                subEquation = '',
                index = 0,
                marqueeSelectedItems = this.marqueeSelectedItems,
                endValue = marqueeSelectedItems.length,
                avoidOperator = null;
            //this._applyHeightCss(event.optionalParams.$marquee);
            if (!this.onlyLHS) {
                //if (this.getFirstTileDrop() && this.getTileAddedInExpression() === null) {
                if (!this._checkMarqueeContainsNullTile() && !(this.marqueeView.model.get('marqueeIndex') === 0 && this.getFirstTileDrop() === false)) {
                    this._marqueeSelectedItemsTreeNodeRefs(true);
                }
                //}
            }
            this._groupSelectedTileItems(event.optionalParams.$marquee, event.optionalParams.$scrollCntr);
            this._hideMarqueeSelectedItems();

            for (; index < endValue; index++) {
                avoidOperator = (index === 0) ? true : false;
                subEquation += marqueeSelectedItems[index].getAccString(avoidOperator);
            }

            //console.log(subEquation);

            /*if (this._isInvalidMarqueeForTutorial()) {
                this.marqueeView.marqueeContainerMouseDownHandler(event.originalEvent);
                this.marqueeView.marqueeMouseUpHandler(event.originalEvent, false, true);
            }
            else {
                this.$('.fake-marquee').remove();
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.MARQUEE_DRAWN);
                if (this.allEmptyInMarquee()) { this.removeMarquee(); }
            }*/
        },

        _marqueeSelectedItemsTreeNodeRefs: function _marqueeSelectedItemsTreeNodeRefs(isNegate) {
            var i = 0, valid = true;
            for (; i < this.marqueeSelectedItems.length; i++) {
                this.marqueeSelectedRefNodes.push(this.marqueeSelectedItems[i].model.get('treeNodeRef'));
            }

            if (this.marqueeSelectedRefNodes.length) {
                var commonParent = modelClassNameSpace.EquationManagerPro.Utils.getCommonParentFromMultiple(this.marqueeSelectedRefNodes),
                    root = this.getTreeRoot(),
                    operatorsInBetween = modelClassNameSpace.EquationManagerPro.Utils.getOperatorStringsBetween(commonParent, root);

                if (operatorsInBetween.indexOf('^') !== -1 || operatorsInBetween.indexOf('/') !== -1) {
                    valid = false;
                }
                else if (operatorsInBetween[0] === '*' && (operatorsInBetween[1] === '+' || operatorsInBetween[1] === '=')) {
                    valid = false;
                }
                else if (commonParent.data === '*' && commonParent.children.length !== this.marqueeSelectedRefNodes.length) {
                    valid = false;
                }

                if (valid) {
                    this._negateTilesInsideMarquee(this.marqueeSelectedRefNodes, isNegate);
                }
                else {
                    this.marqueeSelectedRefNodes = [];
                }
            }
        },

        _negateTilesInsideMarquee: function _negateTilesInsideMarquee(nodes, isNegate) {

            var commonParent = modelClassNameSpace.EquationManagerPro.Utils.getCommonParentFromMultiple(nodes), i, children;
            switch (commonParent.data) {
                case modelClassNameSpace.TileItem.OPERATORS.ADDITION:
                    this._tilesToNegate(commonParent.children, isNegate);
                    break;
                case modelClassNameSpace.TileItem.OPERATORS.MULTIPLICATION:
                    this._tilesToNegate(commonParent, isNegate);
                    break;
                case modelClassNameSpace.TileItem.OPERATORS.DIVISION:
                    this._negateTilesInsideMarquee(commonParent.children[0].children.length ? commonParent.children[0].children : [commonParent.children[0]], isNegate);
                    break;
                default:
                    this._tilesToNegate(commonParent, isNegate);
            }

        },

        _tilesToNegate: function _tilesToNegate(node, isNegate) {
            var data = node.data, i = 0, view, equationView = this.equationView;
            if (typeof data !== 'string') {
                for (; i < node.length && node.length > 1; i++) {
                    this._tilesToNegate(node[i], isNegate);
                }
            }
            if (data === modelClassNameSpace.TileItem.OPERATORS.MULTIPLICATION) {
                if (node.children[0].data === modelClassNameSpace.TileItem.OPERATORS.DIVISION) {
                    this._negateTilesInsideMarquee(node.children[0].children.length ? node.children[0].children : [node.children[0].children[0]], isNegate);
                }
                else if (node.children[0].data === modelClassNameSpace.TileItem.OPERATORS.PARENTHESES) {
                    this._negateTilesInsideMarquee(node.children[0].children[0].children.length ? node.children[0].children[0].children : [node.children[0].children[0]], isNegate);
                }
                else {
                    view = equationView.getViewFromIndex(equationView.model.getIndexFromItemModel(node.children[0].data));
                    if (this._checkTileInsideMarquee(view)) {
                        isNegate ? view.$el.attr({ 'data-negateTile': isNegate, 'data-originalValue': view.model.get('base') }) : view.$el.removeAttr('data-negateTile');
                    }
                }
            }
            else if (data === modelClassNameSpace.TileItem.OPERATORS.DIVISION) {
                this._negateTilesInsideMarquee(node.children[0].children.length ? node.children[0].children : [node.children[0]], isNegate);
            }
            else {
                if (node.data) {
                    view = equationView.getViewFromIndex(equationView.model.getIndexFromItemModel(node.data));
                    if (this._checkTileInsideMarquee(view)) {
                        isNegate ? view.$el.attr({ 'data-negateTile': isNegate, 'data-originalValue': view.model.get('base') }) : view.$el.removeAttr('data-negateTile');
                    }
                }
            }
        },


        _checkTileInsideMarquee: function _checkTileInsideMarquee(term) {
            var marqueeSelectedItems = this.marqueeSelectedItems,
                index;
            for (index = 0; index < marqueeSelectedItems.length; index++) {
                if (marqueeSelectedItems[index].getWhetherTermPresent(term) === true) {
                    return true;
                }
            }
            return false;
        },

        _checkMarqueeContainsNullTile: function _checkMarqueeContainsNullTile() {
            var marqueeSelectedItems = this.marqueeSelectedItems,
                index;
            for (index = 0; index < marqueeSelectedItems.length; index++) {
                if (marqueeSelectedItems[index].getMarqueeContainsNullTile() === true) {
                    return true;
                }
            }
            return false;
        },


        /**
        * Handler for ChangeSelectorClass event fired on mouse up before Marquee end event.
        * @method _changeSelectorClass
        * @private
        * @param {Object} Event object
        * @param {Object} Marquee div
        */
        _changeSelectorClass: function _changeSelectorClass(event, $marquee, marqueeIndex) {
            if (this.$el.find('.current-draggable').length !== 0) { return; }
            this._marqueeEndHandler(event, $marquee, marqueeIndex);
            this.marqueeSelectedItems = this._updateMarqueeForMulTiles(this.marqueeSelectedItems);
            this.marqueeSelectedItems = this._validateMarqueeItems(this.marqueeSelectedItems, event) || [];
            this.marqueeView.model.set('selectorClass', viewNameSpace.EquationManagerPro.TILE_CLASS);
        },


        /**
        * Set the index of first and last element to be selected by marquee for tutorial mode
        *
        * @method setTutorialMarqueeTargetsIndex
        * @param firstItemIndex {String} Index of first item in the list of selected items.
        * @param lastItemIndex {String} Index of last item in the list of selected items.
        * @public
        */
        setTutorialMarqueeTargetsIndex: function setTutorialMarqueeTargetsIndex(firstItemIndex, lastItemIndex) {

        },

        /**
        * Handler for Marquee drawing start event.
        * @method _marqueeStartHandler
        * @private
        * @param {Object} Event object
        */
        _marqueeStartHandler: function _marqueeStartHandler(customEventObj, marqueeIndex) {
            this.marqueeView = this.marqueeViews[marqueeIndex];
            this.trigger(viewNameSpace.EquationManagerPro.EVENTS.MARQUEE_START);
            this._showMarqueeSelectedItems();
            this.marqueeSelectedItems = [];
            this.marqueeNodes = [];
            self.$('.term-tile[data-negatetile=true]').removeAttr('data-negatetile data-originalvalue');
            //this._marqueeSelectedItemsTreeNodeRefs(false);
            this.marqueeSelectedRefNodes = [];
            this.termsToNegate = [];
            /*this.marqueeSelectedItemsIndex = [];*/
            //this.trigger(viewNameSpace.EquationManagerPro.EVENTS.start, customEventObj);
            //this.isDenominatorMarqueeStart = customEventObj.originalEvent.isDenominator;
            this.marqueeStartX = customEventObj.originalEvent.clientX;
            this.marqueeStartY = customEventObj.originalEvent.clientY;
            var marqueeElements = this.$el.find('.' + viewNameSpace.EquationManagerPro.TILE_CLASS);
            marqueeElements.removeClass(viewNameSpace.EquationManagerPro.TILE_CLASS);
            //marqueeElements.css({ 'visibility': 'visible' });
        },

        /**
        * Handler for Marquee drawing end event
        * @method _marqueeEndHandler
        * @param {Object} Event object
        */
        _marqueeEndHandler: function _marqueeEndHandler(event, $marquee, marqueeIndex) {
            //this.trigger(viewNameSpace.EquationManagerPro.EVENTS.end, customEventObj);
            this.endClientLeft = event.clientX,
                this.endClientTop = event.clientY;

            var marqueeWidth = this.endClientLeft - this.startClientLeft,
                marqueeHeight = this.endClientTop - this.startClientTop,
                $marqueeDiv = $marquee,
                eqnView = this.equationView,
                marqueeRect = new MathInteractives.Common.Utilities.Models.Rect($marqueeDiv[0].getBoundingClientRect()),
                middleOfMarqueeRect = marqueeRect.getMiddle(), fractionItem, rect, middleOfRect;

            //Go inside equation view and check each child(fraction item)
            event.marqueeStartX = this.marqueeStartX;
            event.marqueeStartY = this.marqueeStartY;
            this.equationView.getElementsInsideMarquee(event, $marqueeDiv, marqueeIndex);
        },


        /**
        * Hides the marquee items behind the marquee so that they are not visible.
        * @method _hideMarqueeSelectedItems
        * @private
        */
        _hideMarqueeSelectedItems: function () {
            this.$('.marquee-selected').css({ 'visibility': 'hidden' });
            var index;
            for (index = 0; index < this.marqueeSelectedItems.length; index++) {
                this.marqueeSelectedItems[index].attachDetachDroppable(false, true);
                this.marqueeSelectedItems[index].addClassForAllTilesInsideMarquee();
            }
            this.marqueeSelectedItems[0] && this.marqueeSelectedItems[0].enableOperator(true);

        },

        /**
        * Shows the marquee items behind the marquee so that they are visible.
        * @method _showMarqueeSelectedItems
        * @private
        */
        _showMarqueeSelectedItems: function () {
            this.$('.marquee-selected').css({ 'visibility': '' });
            this.$('.tile-inside-marquee').removeClass(viewNameSpace.EquationManagerPro.TILE_INSIDE_MARQUEE);
            if (this.marqueeSelectedItems) {
                var index;
                for (index = 0; index < this.marqueeSelectedItems.length; index++) {
                    this.marqueeSelectedItems[index].attachDetachDroppable(true, true);
                }
            }
        },

        /**
        * Returns boolean representing whether all items in the marquee are empty of not
        * @method allEmptyInMarquee
        * @return {Boolean} True if all items in the selection are empty. False otherwise
        */
        allEmptyInMarquee: function () {
            var i = 0,
                marqueeSelectedItems = this.marqueeSelectedItems;
            for (i = 0; i < marqueeSelectedItems.length; i++) {
                if (marqueeSelectedItems[i] instanceof Backbone.View && !marqueeSelectedItems[i].model.isEmpty()) {
                    return false;
                }
            }
            return true;
        },

        /**
        * Validates the elements in marquee i.e. if items seelcted in marquee are not
        * adjacent or are not neighbors then only select the ones on the left.
        * Also, if a tile is selected then add it's operator to the marquee div.
        * @method _validateMarqueeItems
        * @private
        * @param {Array} Array of marquee selected items.
        * @return {Array} Validate array of selected items. Only items that are validated are returned.
        */
        _validateMarqueeItems: function (items, event) {
            if (items.length === 0) return;

            var i = 0,
                item = null,
                TILE_CLASS = viewNameSpace.EquationManagerPro.TILE_CLASS,
                newSelectedItems = [],
                ignoreClass = this.marqueeView.model.get('ignoreClass'),
                dir = event.clientX > event.marqueeStartX ? 'ltr' : 'rtl',      // check if marquee is left to right or right to left
                step = dir === 'ltr' ? +1 : dir === 'rtl' ? -1 : null,
                startIndex = dir === 'ltr' ? 0 : dir === 'rtl' ? items.length - 1 : null,
                parent = items[startIndex].parent,
                $operator = null;

            for (i = startIndex; this._validateMarqueeLoopCond(dir, items, i) ; i = i + step) {
                if (items[i].parent === parent) {

                    if (items[i].$el.hasClass(ignoreClass)) {
                        continue;
                    }
                    newSelectedItems.push(items[i]);
                    items[i].$el.addClass(TILE_CLASS);

                    if (i > 0) {
                        this._addOperatorToMarquee(items[i]);
                    }

                    if (!this._validAdjacentTile(dir, items, i)) {
                        if (dir === 'rtl') { this._removeOperatorFromMarquee(items[i]); }     // remove last operator pushed
                        break;
                    }
                } else {
                    break;
                }
            }

            return dir === 'ltr' ? newSelectedItems : dir === 'rtl' ? newSelectedItems.reverse() : null;
        },

        /**
        * Adds the TILE_CLASS to the operator corresponding to the elem
        * @method _addOperatorToMarquee
        * @private
        * @param {Object} Element to which the TILE_CLASS should be added.
        */
        _addOperatorToMarquee: function (elem) {
            if (!elem) { return; }
            var $operator = this.$(this.getOperatorViewOfTileItem(elem)),
                TILE_CLASS = viewNameSpace.EquationManagerPro.TILE_CLASS;
            if ($operator.length !== 0) {
                $operator.addClass(TILE_CLASS);
            }
        },

        /**
        * Removes the TILE_CLASS from the operator corresponding to the elem
        * @method _removeOperatorFromMarquee
        * @private
        * @param {Object} Element from which the TILE_CLASS should be removed.
        */
        _removeOperatorFromMarquee: function (elem) {
            var $operator = this.$(this.getOperatorViewOfTileItem(elem)),
                TILE_CLASS = viewNameSpace.EquationManagerPro.TILE_CLASS;
            if ($operator.length !== 0) {
                $operator.removeClass(TILE_CLASS);
            }
        },

        /**
        * Checks if the tile at i'th location is valid to be added to the marquee.
        * @method _validAdjacentTile
        * @private
        * @param {String} Direction of marquee
        * @param {Array} Tiles in the marquee
        * @param {Number} Index of the loop
        * @return {Boolean} True if the tile at i'th location is a valid marquee tile. False otherwise.
        */
        _validAdjacentTile: function (dir, tiles, i) {
            // Check if the next tile in the selection is also the adjacent tile to
            // the last marquee selected tile.
            if (dir === 'ltr') {
                return tiles[i + 1] && tiles[i + 1] === tiles[i].getNextTile();
            } else if (dir === 'rtl') {
                return tiles[i - 1] && tiles[i - 1] === tiles[i].getPrevTile();
            }
        },

        /**
        * Condition for looping in _validateMarqueeLoopCond
        * @method _validateMarqueeLoopCond
        * @private
        * @param {String} Direction of marquee
        * @param {Array} Tiles in the marquee
        * @param {Number} Index of the loop
        * @return {Boolean} True if the loop should continue. False otherwise.
        */
        _validateMarqueeLoopCond: function (dir, tiles, i) {
            if (dir === 'ltr') {
                return i < tiles.length;
            } else if (dir === 'rtl') {
                return i >= 0;
            }
        },

        /**
        * Removes an item from the array. Removes in the reference array so nothing is returned.
        * @method removeFromArray
        * @param {Array} Array to remove elements from.
        * @param {Item} Element to delete from an array.
        */
        removeFromArray: function (arr, item) {
            var index = arr.indexOf(item);
            if (index !== -1) {
                arr.splice(index, 1);
            }
        },

        /**
        * Adds the marquee selected item clones to the marquee divs & position the cloned items.
        * @method _groupSelectedTileItems
        * @private
        * @param {Object} Marquee div
        */
        _groupSelectedTileItems: function _groupSelectedTileItems($marquee, $scrollCntr) {
            var $newDiv = $('<div/>'), $thisElement = null,
                marqueeSelectedItems = this.marqueeSelectedItems,
                newSelectedElements = $scrollCntr.find('.' + viewNameSpace.EquationManagerPro.TILE_CLASS),
                itemsLen = newSelectedElements.length;

            this.marqueeExponents = [];
            $newDiv.css({
                'position': 'relative',
                'z-index': 0,
                'left': '0px'
            });
            if (itemsLen !== 0) {
                this.marqueeView.groupSelectedElements($newDiv);
                this.marqueeView.makeGroupDraggable(this.marqueeSelectedItems[0], this.marqueeSelectedItems, this);
            }
            for (var i = 0; i < itemsLen; i++) {
                $thisElement = $(newSelectedElements[i]);
                // use withDataAndEvents  = false since it causes an issue when calling remove marquee
                // remove marquee internally calls cleanData which removes the deep copied events
                // removing the events on the actual tiles
                var $clone = $thisElement.clone(false).removeClass(viewNameSpace.EquationManagerPro.TILE_CLASS);

                //this._saveMarqueeExponents($clone);

                this.$el.find('.current-draggable').attr('style', '');
                $newDiv.append($clone);

                $clone.css('position', 'absolute')
                    .position({
                        my: 'left top',
                        at: 'left top',
                        of: $thisElement,
                        collision: 'none'
                    })
                    .removeClass('coefficient-tile');
            }
        },

        /**
        * Save the els of exponents  of tiles selected in marquee. This is
        * needed for inverting them when marquee crosses the vinculum.
        * @method _saveMarqueeExponents
        * @private
        * @param {Object} Clone of the tile selected.
        */
        _saveMarqueeExponents: function (clone) {
            var TYPE = modelClassNameSpace.TileItem.TileType,
                marqueeSelectedItems = this.marqueeSelectedItems,
                cloneType = clone.data('tiletype'),
                i = 0;

            if (cloneType === TYPE.TERM_TILE) {
                this.marqueeExponents.push(clone.find('.exponent > .exponent-value'));
            } else if (cloneType === TYPE.PARENTHESES) {
                this.marqueeExponents.push(clone.find('> .exponent > .exponent-value'));
            } else if (cloneType === TYPE.BASE_ONLY) {
                this.marqueeExponents.push(null);
            }
        },

        /**
        * Adds the item & the index to an array.
        * @method pushElementToSelection
        * @param {String} Index of the added item.
        * @param {Object} View of the added item.
        */
        pushElementToSelection: function pushElementToSelection(itemView, tileNode) {
            var parent, marqSelItemslen, $operator, $operatorEl;
            if (this.marqueeSelectedItems.indexOf(itemView) === -1) {
                this.marqueeSelectedItems.push(itemView);
                this.marqueeNodes.push(tileNode);
            }
            /*parent = this.marqueeSelectedItems[0].parent;
            marqSelItemslen = this.marqueeSelectedItems.length;
            if (parent === this.marqueeSelectedItems[marqSelItemslen - 1].parent) {
                if(this.marqueeSelectedItemsIndex.indexOf(itemView) === -1) {
                    this.marqueeSelectedItemsIndex.push(index);
                }
            }*/

        },

        /**
        * Removes the marquee from the screen.
        *
        * @method removeMarquee
        */
        removeMarquee: function removeMarquee() {
            var index;
            this._showMarqueeSelectedItems();
            this.marqueeSelectedItems = [];
            this.marqueeNodes = [];
            //this.marqueeView.$marqueeDiv.html('');
            for (index = 0; index < this.marqueeViews.length; index++) {
                this.marqueeViews[index].$marqueeDiv.empty();
                this.marqueeViews[index].$marqueeDiv.css('visibility', '');
                this.marqueeViews[index].collapseMarquee();
            }
            this.trigger(viewNameSpace.EquationManagerPro.EVENTS.MARQUEE_REMOVED);
        },

        isTileViewInsideMarquee: function (tile) {
            var selectedItems = this.marqueeSelectedItems,
                item,
                i = 0;
            if (selectedItems.indexOf(tile) !== -1) {
                return true;
            }

            for (; i < selectedItems.length; i++) {
                item = selectedItems[i];
                if (item instanceof Backbone.View && item.hasChildView(tile, true)) {
                    return true;
                }
            }

            return false;
        },

        // isTileViewInsideMarquee was error prone & going into an infinite loop
        isTileViewInsideMarqueeFixed: function (tile) {
            var marqueeViews = this.getAllMarqueeViews();
            return marqueeViews.indexOf(tile) > -1;
        },

        /**
        * Returns all views inside the marquee
        * @method getAllMarqueeViews
        * @return {Array} List of all marquee views. Even nested children.
        */
        getAllMarqueeViews: function () {
            var marqueeViews = [],
                i = 0;
            for (i = 0; i < this.marqueeSelectedItems.length; i++) {
                Array.prototype.push.apply(marqueeViews, this.marqueeSelectedItems[i].getChildViews());
            }
            return marqueeViews;
        },

        /************************************************************************ MAERQUEE SECTION ENDS************************************************************************************/

        getOperatorViewOfTileItem: function getOperatorViewOfTileItem(itemView) {
            var $operator = itemView.parent.getOperatorFromTileItem(itemView);
            return $operator;
        },

        getWhetherPlusOperatorPresent: function getWhetherPlusOperatorPresent(treeNode) {
            var marqueeElems = this.marqueeSelectedItems,
                marqueeNodes = this.marqueeNodes,
                index, commonNode;
            if (treeNode) {
                //pushing given tree node too, so that common parent comparision can happen.
                marqueeNodes.push(treeNode);
            }

            if (marqueeNodes.length) {
                commonNode = modelClassNameSpace.EquationManagerPro.Utils.getCommonParentFromMultiple(marqueeNodes);
                if (commonNode.data === modelClassNameSpace.TileItem.OPERATORS.ADDITION) {
                    if (treeNode) {
                        //removing last added node.
                        marqueeNodes.pop();
                    }
                    return true;
                }
            }
            if (treeNode) {
                //removing last added tile.
                marqueeNodes.pop();
            }
            return false;
        },

        _updateMarqueeForMulTiles: function _updateMarqueeForMulTiles(marqueeSelectedItems) {
            var marqueeNodes = this.marqueeNodes,
                TileItems = modelClassNameSpace.TileItem.TileType,
                newArray = [], parent;

            if (this.getWhetherPlusOperatorPresent(null) === true) {
                var currentTile, prevTile;
                currentTile = marqueeSelectedItems[0];
                prevTile = currentTile.getPrevTile();
                while (prevTile && currentTile.model.get('operator') === modelClassNameSpace.TileItem.OPERATORS.MULTIPLICATION) {
                    marqueeSelectedItems.unshift(prevTile);
                    currentTile = prevTile;
                    prevTile = prevTile.getPrevTile();
                }
            }
            if (marqueeSelectedItems.length > 0) {
                parent = marqueeSelectedItems[0].parent;
                /*if(parent.model.get('type') === TileItems.FRACTION) {
                    parent = parent.parent;
                }*/
                if (parent.model.get('type') === TileItems.PARENTHESES && parent.tileViews.length === marqueeSelectedItems.length && this._checkIfAllItemsBelongToSameParent(marqueeSelectedItems, parent)) {
                    marqueeSelectedItems = [];
                    marqueeSelectedItems.push(parent);
                }
            }
            return marqueeSelectedItems;
        },

        _checkIfAllItemsBelongToSameParent: function _checkIfAllItemsBelongToSameParent(items, parent) {
            var index;
            for (index = 1; index < items.length; index++) {
                if (items[index].parent !== parent) {
                    return false;
                }
            }
            return true;
        },

        _undoButtonClickHandler: function _undoButtonClickHandler(event) {
            var undoStack = this.commandFactory.get('undoStack'),
                undoStackLength = undoStack.length;

            if (this.undoButtonView.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                this.stopReading();
                this.undo();
                if (this.isBottomExpressionShown) {
                    this._updateBottomEquations();
                }
                if (undoStack.length === 0) {
                    //this._enableDisableButtons(this.undoButtonView, false);
                    this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.UNDO_BUTTON, false);
                    if (this.getFirstTileDrop() === false) {
                        //this._enableDisableButtons(this.resetButtonView, false);
                        this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.RESET_BUTTON, false);
                        this.model.set('resetBtnStatus', false);
                    }

                    this.trigger(viewNameSpace.EquationManagerPro.EVENTS.UNDO_STACK_EMPTY);
                }
                this.trigger(viewNameSpace.EquationManagerPro.EVENTS.UNDO_BUTTON_CLICKED);
                //this.mouseDownOnInteractive(event, true, true, true);
                this._setFocus();
            }
        },

        _showResetPopUp: function _showResetPopUp() {
            var resetPopUpTexts = this.resetPopUpTexts,
                titleText = null,
                titleAccText = null,
                bodyText = null,
                bodyAccText = null,
                popUpOptions,
                buttonTypeText = MathInteractives.global.Theme2.Button.TYPE.TEXT,
                manager = this.manager;

            if (resetPopUpTexts) {
                titleText = (resetPopUpTexts.titleText) ? resetPopUpTexts.titleText : manager.getMessage('comm32', 0);
                titleAccText = (resetPopUpTexts.titleAccText) ? resetPopUpTexts.titleAccText : manager.getAccMessage('comm32', 0);
                bodyText = (resetPopUpTexts.bodyText) ? resetPopUpTexts.bodyText : manager.getMessage('comm33', 0);
                bodyAccText = (resetPopUpTexts.bodyAccText) ? resetPopUpTexts.bodyAccText : manager.getAccMessage('comm33', 0);
            }
            else {
                titleText = manager.getMessage('comm32', 0);
                titleAccText = manager.getAccMessage('comm32', 0);
                bodyText = manager.getMessage('comm33', 0);
                bodyAccText = manager.getAccMessage('comm33', 0);
            }

            popUpOptions = {
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                tooltipColorType: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL,
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                //height: 170,
                //width: popUpWidth,
                containsTts: true,
                title: titleText,
                accTitle: titleAccText,
                text: bodyText,
                accText: bodyAccText,
                //titleTextColorClass: 'popup-feedback-text-color',
                //bodyTextColorClass: 'popup-feedback-text-color',
                buttons: [
                    {
                        id: 'popup-ok',
                        type: buttonTypeText,
                        text: manager.getMessage('theme2-pop-up-ok-btn-text', 0),
                        clickCallBack: {
                            fnc: this._resetOkButtonClickHandler,
                            scope: this
                        }
                    },
                    {
                        id: 'popup-cancel',
                        type: buttonTypeText,
                        text: manager.getMessage('comm23', 0),
                        clickCallBack: {
                            fnc: this._resetCancelButtonClickHandler,
                            scope: this
                        }
                    }
                ],
                closeCallback: {
                    fnc: function (response) {
                        if (response.buttonClicked === 'popup-ok') {
                            this._setFocus({ resetClicked: true });
                        }
                    },
                    scope: this
                }
            }

            MathInteractives.global.Theme2.PopUpBox.createPopup(popUpOptions);
        },

        _resetOkButtonClickHandler: function _resetOkButtonClickHandler() {
            this.stopReading();
            //this._enableDisableButtons(this.undoButtonView, false);
            this.enableDisableSpecificButton(viewNameSpace.EquationManagerPro.UNDO_BUTTON, false);
            this.model.set('resetBtnStatus', false);
            this.resetAllBinTiles();
            this.setTileAddedFromBinValue();
            this.setTileAddedInExpression();
            this.trigger(viewNameSpace.EquationManagerPro.EVENTS.RESET_BUTTON_CLICKED);
        },

        _resetCancelButtonClickHandler: function _resetCancelButtonClickHandler() {
            this.stopReading();
            var elementId = this.resetButtonView.$el.attr('id').split(this.idPrefix)[1];
            this.setFocus(elementId);
        },

        _resetButtonClickHandler: function _resetButtonClickHandler() {
            this.stopReading();
            if (this.resetButtonView.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                this._showResetPopUp();
            }
        },

        _enableDisableButtons: function _enableDisableButtons(buttonView, status) {
            if (buttonView) {
                if (status === true) {
                    buttonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                }
                else {
                    buttonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                }
            }
        },

        _cacheWindowElements: function _cacheWindowElements() {
            var idPrefix = this.idPrefix;
            this.$lhsExprView = this.$('.lhs-expression-view');
            this.$rhsExprView = this.$('.rhs-expression-view');
            this.$lhsExprBgView = this.$('.lhs-expression-view-bg-holder');
            this.$rhsExprBgView = this.$('.rhs-expression-view-bg-holder');
            this.$showLhsExprBgView = this.$('.show-lhs-expression-bg');
            this.$showRhsExprBgView = this.$('.show-rhs-expression-bg');
            this.$lhsExprEqnHolder = this.$('#' + idPrefix + 'workspace-expression-area').find('.lhs-expression-view-expression  .expression-view-holder');
            this.$rhsExprEqnHolder = this.$('#' + idPrefix + 'workspace-expression-area').find('.rhs-expression-view-expression  .expression-view-holder');
            this.$equationCOntainer = this.$('.equation-view-component');
        },

        resetAllBinTiles: function resetAllBinTiles() {
            var numericTileArray = this.numericTileArray,
                $binTileContainment = this.$binTileContainment,
                counter = 0,
                endValue = numericTileArray.length,
                $currentBinTile = null,
                dataTileValue = null,
                parsedDataTileValue = null,
                currentTileNum = null;

            for (; counter < endValue; counter++) {
                currentTileNum = numericTileArray[counter];
                if (typeof currentTileNum === 'number') {
                    currentTileNum = Math.abs(currentTileNum);
                }
                else {
                    if (currentTileNum === '-x') {
                        currentTileNum = 'x';
                    }
                    if (currentTileNum === '-t') {
                        currentTileNum === 't';
                    }
                }
                $currentBinTile = $binTileContainment.find('.bin-tile-number-' + currentTileNum);
                dataTileValue = $currentBinTile.attr('data-tilevalue');
                parsedDataTileValue = parseInt(dataTileValue);
                if (isNaN(parsedDataTileValue) === true) {
                    switch (dataTileValue) {
                        case '-x':
                            $currentBinTile.find('.base-value').html('<em>x</em>');
                            $currentBinTile.attr('data-tilevalue', 'x');
                            break;
                        case '-t':
                            $currentBinTile.find('.base-value').html('<em>t</em>');
                            $currentBinTile.attr('data-tilevalue', 't');
                            break;
                    }
                }
                else if (parsedDataTileValue < 0) {
                    parsedDataTileValue *= -1;
                    $currentBinTile.find('.base-value').html(parsedDataTileValue);
                    $currentBinTile.attr('data-tilevalue', parsedDataTileValue);
                }
            }
            //this.trigger(viewNameSpace.EquationManagerPro.EVENTS.BIN_TILE_RESET);
        },

        getBinTileUsingIndex: function getBinTileUsingIndex(numberOnTile) {
            return this.$binTileContainment.find('.bin-tile-number-' + numberOnTile);
        },

        enableDisableSpecificButton: function enableDisableSpecificButton(button, enable) {
            var equationManagerPro = viewNameSpace.EquationManagerPro;
            switch (button) {
                case equationManagerPro.UNDO_BUTTON:
                    if (this.undoButtonView) {  //Bugfix #65786
                        this._enableDisableButtons(this.undoButtonView, enable);
                        this.enableTab(this._getAccId(this.undoButtonView.$el), enable);
                    }
                    break;
                case equationManagerPro.RESET_BUTTON:
                    if (this.resetButtonView) {
                        this._enableDisableButtons(this.resetButtonView, enable);
                        this.enableTab(this._getAccId(this.resetButtonView.$el), enable);
                        this.model.set('resetBtnStatus', enable);
                    }
                    break;
            }
        },

        attachTutorialEventsOnTile: function attachTutorialEventsOnTile(index) {
            var tileView = this.equationView.getViewFromIndex(index);
            if (tileView) {
                tileView.attachEvents(true);
            }
        },

        detachDraggable: function detachDraggable(index) {
            var tileView = this.equationView.getViewFromIndex(index);
            if (tileView && tileView.$el.is('.ui-draggable')) {
                this.detachMouseEventsOfTile(tileView);
                tileView.$el.draggable('destroy');
            }
        },

        detachDroppable: function detachDroppable(index) {
            var tileView = this.equationView.getViewFromIndex(index);
            if (tileView && tileView.$el.is('.ui-droppable')) {
                this.detachMouseEventsOfTile(tileView);
                tileView.$el.droppable('destroy');
            }
        },

        detachMouseEventsOfTile: function detachMouseEventsOfTile(tileView) {
            if (tileView) {
                tileView.$el.off('mousedown.tile')
                    .off('mouseup.tile')
                     .off('click.tile').addClass('no-hover');
            }
        },

        proceedToNextStep: function proceedToNextStep() {

        },

        /**
        * Disable listeners on marquee
        *
        * @method detachListenersOnMarqueeContainment
        * @public
        */
        attachListenersOnMarqueeContainment: function (forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].attachListenersOnMarqueeContainment();
            }
            if (forRHS) {
                this.marqueeViews[1].attachListenersOnMarqueeContainment();
            }
        },

        /**
        * Disable listeners on marquee
        *
        * @method detachListenersOnMarqueeContainment
        * @public
        */
        detachListenersOnMarqueeContainment: function (forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].detachListenersOnMarqueeContainment();
            }
            if (forRHS) {
                this.marqueeViews[1].detachListenersOnMarqueeContainment();
            }
        },


        /**
       * Enables Marquee
       *
       * @method detachListenersOnMarqueeContainment
       * @public
       */
        enableMarquee: function enableMarquee(forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].enableMarquee();
            }
            if (forRHS) {
                this.marqueeViews[1].enableMarquee();
            }
        },

        /**
      * Disables Marquee
      *
      * @method disableMarquee
      * @public
      */
        disableMarquee: function disableMarquee(forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].disableMarquee();
            }
            if (forRHS) {
                this.marqueeViews[1].disableMarquee();
            }
        },

        /**
      * Shows Marquee
      *
      * @method showMarquee
      * @public
      */
        showMarquee: function showMarquee(forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].showMarquee();
            }
            if (forRHS) {
                this.marqueeViews[1].showMarquee();
            }
        },

        enableMarqueeDraggable: function enableMarqueeDraggable(forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].enableDisableMarqueeDraggable(true);
            }
            if (forRHS) {
                this.marqueeViews[1].enableDisableMarqueeDraggable(true);
            }
        },

        disableMarqueeDraggable: function disableMarqueeDraggable(forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].enableDisableMarqueeDraggable(false);
            }
            if (forRHS) {
                this.marqueeViews[1].enableDisableMarqueeDraggable(false);
            }
        },

        enableMarqueeDroppable: function enableMarqueeDroppable(forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].enableDisableMarqueeDroppable(true);
            }
            if (forRHS) {
                this.marqueeViews[1].enableDisableMarqueeDroppable(true);
            }
        },

        disableMarqueeDroppable: function disableMarqueeDroppable(forLHS, forRHS) {
            var index;
            if (forLHS) {
                this.marqueeViews[0].enableDisableMarqueeDroppable(false);
            }
            if (forRHS) {
                this.marqueeViews[1].enableDisableMarqueeDroppable(false);
            }
        },

        getMarqueeDiv: function getMarqueeDiv(forLHS) {
            return this.marqueeViews[forLHS ? 0 : 1].getMarqueeDiv();
        },

        /**
        * Returns the amount the scroll bar should be scrolled in case of a revert of a tile or marquee
        *
        * @method getScrollAmount
        * @param {parent} Object Jqeury Object which is the scrollable div i.e either l.hs or r.h.s
        * @param {original} Object Original Jquery object which is hidden in the workspace
        * @public
        */
        getScrollAmount: function getScrollAmount(parent, original) {

            var parentRect = parent[0].getBoundingClientRect(),
                originalRect = original[0].getBoundingClientRect(),
                scrollObj = {
                    scroll: false
                },
                scrollAmt;

            if (originalRect.width > parentRect.width) {
                //if (originalRect.left < parentRect.left) {
                //    scrollObj.scrollAmt = parentRect.width;
                //    scrollObj.scroll = true;
                //}
                //else if (originalRect.right > parentRect.right) {
                //    scrollObj.scrollAmt = 0;
                //    scrollObj.scroll = true;
                //}
                scrollObj.scrollAmt = 0;
                scrollObj.scroll = false;
            }
            else {
                if (originalRect.left < parentRect.left) {  //Dragged On left side of any container
                    scrollObj.scrollAmt = parent.scrollLeft() + originalRect.left - parentRect.left;
                    scrollObj.scroll = true;
                }
                else if (originalRect.right > parentRect.right) {    //Dragged On right side of any container
                    scrollObj.scrollAmt = parent.scrollLeft() + originalRect.right - parentRect.right;
                    scrollObj.scroll = true;
                }
            }
            return scrollObj;
        },

        updateContainerSizes: function updateContainerSizes(lhsContainerWidth, rhsContainerWidth, equalSignContainerLeft) {
            this.$lhsExprView.css('width', lhsContainerWidth);
            this.$rhsExprView.css('width', rhsContainerWidth);
            this.$('.equals-sign-container').css('left', equalSignContainerLeft);
            this.$lhsExprView.find('.expression-seperator-holder svg').css('transform', 'scale(' + (lhsContainerWidth / 300) + ', 1)');
            this.$rhsExprView.find('.expression-seperator-holder svg').css('transform', 'scale(' + (rhsContainerWidth / 300) + ', 1)');
        },


        _createEquationTooltips: function _createEquationTooltips(el) {

            var self = this,
                toolTipView = MathInteractives.Common.Components.Theme2.Views.Tooltip,
                toolTipOptions = {
                    _player: self.player,
                    idPrefix: self.idPrefix,
                    manager: self.manager,
                    path: self.filePath,
                    elementEl: self.idPrefix + el + 'lhs-expression-container',
                    type: toolTipView.TYPE.FORM_VALIDATION,
                    baseClass: 'equation-tooltip',
                    isArrow: true,
                    text: 'tooltip',
                    arrowType: toolTipView.ARROW_TYPE.TOP_MIDDLE
                };

            self.leftEquationTooltip = toolTipView.generateTooltip(toolTipOptions);
            toolTipOptions.elementEl = self.idPrefix + el + 'rhs-expression-container';
            self.rightEquationTooltip = toolTipView.generateTooltip(toolTipOptions);

        },

        _bindEquationTooltipEvents: function _bindEquationTooltipEvents() {

            var self = this,
                nameSpace = MathInteractives.Common.Utilities.Models.Utils,
                $leftExpression = this.$el.find('.left-expression-container'),
                $rightExpression = this.$el.find('.right-expression-container'),
                leftTimeout = null,
                rightTimeout = null;

            $leftExpression.off('.leftEquation')
            .on('mouseenter.leftEquation', function (event) {
                self.showLeftTooltip = true;
                leftTimeout = window.setTimeout(function (event) {
                    if (self.showLeftTooltip) {
                        self._showHideTooltips(true, true);
                    }
                }, 500);
            })
            .on('mouseleave.leftEquation', function (event) {
                self._showHideTooltips(true, false);
                self.showLeftTooltip = false;
                window.clearTimeout(leftTimeout);
            });

            $rightExpression.off('.rightEquation')
            .on('mouseenter.rightEquation', function (event) {
                self.showRightTooltip = true;
                rightTimeout = window.setTimeout(function (event) {
                    if (self.showRightTooltip) {
                        self._showHideTooltips(false, true);
                    }
                }, 500);
            })
           .on('mouseleave.rightEquation', function (event) {
               self._showHideTooltips(false, false);
               self.showRightTooltip = false;
               window.clearTimeout(rightTimeout);
           });

            nameSpace.EnableTouch($leftExpression);
            nameSpace.EnableTouch($rightExpression);

        },

        _showHideTooltips: function _showHideTooltips(left, show) {

            if (left && show) {
                this._adjustLeftTooltipPosition();
            }
            else if (left && !show) {
                this.leftEquationTooltip.hideTooltip();
            }
            else if (!left && show) {
                this._adjustRightTooltipPosition();
            }
            else {
                this.rightEquationTooltip.hideTooltip();
            }
        },

        _adjustLeftTooltipPosition: function _adjustLeftTooltipPosition() {

            var $equationContainer = this.$el.find('.lhs-expression-view'),
                equationContainerLeft,
                tooltipLeft,
                topOffset = 5,
                height = 50,
                bigParenthesesTop = -33,
                minLeft = 12;

            equationContainerLeft = 10 + $equationContainer.position().left + $equationContainer.width() / 2;
            if (equationContainerLeft - this.leftEquationTooltip.$el.width() / 2 < minLeft) {
                tooltipLeft = minLeft;
            }
            else {
                tooltipLeft = equationContainerLeft - this.leftEquationTooltip.$el.width() / 2;
            }


            if (this.leftEquationTooltip.$el.find('.big-parenthesis-container').length > 0) {
                this.leftEquationTooltip.$el.css({
                    'height': height
                });
                this.leftEquationTooltip.$el.find('.expression-contains-fraction').css({ 'top': bigParenthesesTop });
            }
            else {
                this.leftEquationTooltip.$el.css({
                    'height': 'auto'
                });
                this.leftEquationTooltip.$el.find('.expression-contains-fraction').css({ 'top': '' });
            }
            this.leftEquationTooltip.showTooltip();
            this.leftEquationTooltip.$el.css({
                'left': tooltipLeft,
                'top': this.leftEquationTooltip.$el.position().top + topOffset
            });

            this.leftEquationTooltip.$el.find('.arrow-div,.border-div').css({
                'left': equationContainerLeft - tooltipLeft - 10
            });

        },

        _adjustRightTooltipPosition: function _adjustRightTooltipPosition() {

            this.rightEquationTooltip.$el.css({ 'left': 0 });   //To fix right tooltip going down

            var $equationContainer = this.$el.find('.rhs-expression-view'),
                left = $equationContainer.position().left + 10,
                width = $equationContainer.width(),
                equationContainerLeft,
                tooltipLeft,
                topOffset = 5,
                height = 50,
                bigParenthesesTop = -33,
                maxLeft = left + width;

            equationContainerLeft = left + width / 2;
            if (equationContainerLeft + this.rightEquationTooltip.$el.width() / 2 > maxLeft) {
                tooltipLeft = maxLeft - this.rightEquationTooltip.$el.width();
            }
            else {
                tooltipLeft = equationContainerLeft - this.rightEquationTooltip.$el.width() / 2 + 1;
            }

            if (this.rightEquationTooltip.$el.find('.big-parenthesis-container').length > 0) {
                this.rightEquationTooltip.$el.css({
                    'height': height
                });
                this.rightEquationTooltip.$el.find('.expression-contains-fraction').css({ 'top': bigParenthesesTop });

            }
            else {
                this.rightEquationTooltip.$el.css({
                    'height': 'auto'
                });
                this.rightEquationTooltip.$el.find('.expression-contains-fraction').css({ 'top': '' });
            }
            this.rightEquationTooltip.showTooltip(); //To fix Top of tooltip
            this.rightEquationTooltip.$el.css({
                'left': tooltipLeft,
                'top': this.rightEquationTooltip.$el.position().top + topOffset
            });
            this.rightEquationTooltip.$el.find('.arrow-div,.border-div').css({
                'left': equationContainerLeft - tooltipLeft - 9
            });

        },

        _addEquationInTooltip: function _addEquationInTooltip() {
            this.leftEquationTooltip.$el.find('.text-container').html(this.$el.find('.left-expression-container').html());
            this.rightEquationTooltip.$el.find('.text-container').html(this.$el.find('.right-expression-container').html());
        },

        handleMarqueeAcc: function handleMarqueeAcc() {

        },

        showHideParticularBinTile: function showHideParticularBinTile(isShow, indexNumber) {
            if (isShow === true) {
                $(this.$binTileContainment.find('.bin-tiles')[indexNumber]).show();
            }
            else {
                $(this.$binTileContainment.find('.bin-tiles')[indexNumber]).hide();
            }
        },

        updateParticularBinTileData: function updateParticularBinTileData(indexNumber, newValue) {
            var $tile = $(this.$binTileContainment.find('.bin-tiles')[indexNumber]),
                $baseValue = $tile.find('.base-value').removeClass('decrease-font-size'),
                numberToReplaceInBin = (newValue) ? newValue : this.numberToReplaceInBin;

            $baseValue.html(numberToReplaceInBin > 0 ? numberToReplaceInBin : '&minus;' + Math.abs(numberToReplaceInBin));

            if (Math.abs(numberToReplaceInBin).toString().length > 2) {
                $baseValue.addClass('decrease-font-size');
            }
            $tile.attr('data-tilevalue', numberToReplaceInBin);
        },

        _getMaxTermsPerSide: function _getMaxTermsPerSide(isLeftSide) {
            var requiredTileViews = this.equationView.tileViews,
                maxTerms = null;
            if (isLeftSide === true) {
                return requiredTileViews[0].tileViews.length;
            }
            else {
                return requiredTileViews[1].tileViews.length;
            }
        }

    }, {

        TILE_CLASS: 'marquee-selected',
        TILE_DUMMY_CLASS: 'base',
        TILE_INSIDE_MARQUEE: 'tile-inside-marquee',

        /**
        * Events to be triggered
        * @property EVENTS
        * @type Object
        * @static
        */
        EVENTS: {
            'COMMAND_FIRED': 'command-fired',
            'TILE_DRAGGING_START': 'tile-dragging-start',
            'TILE_MOUSE_DOWN': 'tile-mouse-down',
            'MARQUEE_DRAG_START': 'marquee-drag-start',
            'MARQUEE_DROPPED': 'marquee-dropped',
            'REVERT_START': 'revert-start',
            'REVERT_END': 'revert-end',
            'NEW_EXPRESSION_START': 'new-expression-start',
            'INVERT_TILE_TEXT': {
                'PARENTHESES': 'parentheses',
                'TERM_TILE': 'term-tile',
                'MARQUEE': 'marquee'
            },
            'COMMAND_SUCCESSFUL': 'command-successful',
            'RESET_BUTTON_CLICKED': 'reset-button-clicked',
            'ADD_STEP': 'add-step',
            'REMOVE_STEP': 'remove-step',
            'RESET_FIRST_TILE_DROP': 'reset-first-tile-drop',
            'SET_FIRST_TILE_DROP': 'set-first-tile-drop',
            'FANNING_ANIMATION_COMPLETE': 'fanning-animation-complete',
            'MOUSEDOWN_ON_TILES': 'mouse-down-on-tiles',
            'HIDE_TOOLTIP': 'hide-tooltip',
            'BIN_TILE_SIGN_CHANGED': 'bin-tile-sign-changed',
            'BIN_TILE_RESET': 'bin-tile-reset',
            'TILE_DRAG_STOP': 'tile-drag-stop',
            'BIN_DRAGGING_START': 'bin-dragging-start',
            'BIN_DRAG_STOP': 'bin-drag-stop',
            'UNDO_STACK_EMPTY': 'undo-stack-empty',
            'SHOW_INTERACTIVE_TOOLTIP': 'show-interactive-tooltip',
            'ANY_DRAG_START': 'any-drag-start',
            'ANY_DRAG_STOP': 'any-drag-stop',
            'TILE_DROP_SUCCESS': 'tile-drop-success',
            'UNDO_BUTTON_CLICKED': 'undo-button-clicked',
            'PARENTHESES_REFLECTION': 'parentheses-reflection',
            'SET_UNDO_RESET_BTN_TAB_INDEXES': 'set-undo-reset-btn-tab-indexes',
            'CHANGE_DRAG_HANDLE_IMG': 'change-drag-handle-img',
            'TREE_ROOT_SET': 'tree-root-set',
            'COEFF_TILE_NEGATED': 'coeff-tile-negated',
            'FOCUS_SET_LHS': 'focus-set-lhs'
        },

        KEY: {
            TAB: 9,
            SPACE: 32,
            ENTER: 13,
            ESCAPE: 27,
            LEFTARROW: 37,
            UPARROW: 38,
            RIGHTARROW: 39,
            DOWNARROW: 40,
            DELETE: 68,
            ROTATE_CLOCKWISE: 82,
            ROTATE_ANTI_CLOCKWISE: 69
        },


        SCROLL_DIRECTION: {
            LEFT: 'scrollToLeft',
            RIGHT: 'scrollToRight'
        },

        'RESET_BUTTON': 'reset-button',
        'UNDO_BUTTON': 'undo-button',
        'BLACK': '#000000',
        'WHITE': '#FFFFFF',
        'DATA': 'data'

    });

})(window.MathInteractives);
