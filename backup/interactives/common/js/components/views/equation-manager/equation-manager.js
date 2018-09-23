(function () {
    'use strict';

    var viewNameSpace = MathInteractives.Common.Components.Views.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        Rect = MathInteractives.Common.Utilities.Models.Rect,
        Point = MathInteractives.Common.Utilities.Models.Point,
        BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

    /**
    * Tile Manager controls tile item activities.
    *
    * @class EquationManager
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views.EquationManager
    */
    viewNameSpace.EquationManager = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Reference of main equation view.
        * @property equationView
        * @type MathInteractives.Common.Components.Models.EquationManager.TileItem
        * @default null
        */
        equationView: null,

        commandFactory: null,

        marqueeSelectedItemsIndex: [],

        marqueeSelectedItems: [],

        parenthesisExponentTooltips: [],

        applyExponentBtnViews: [],

        changeSignBtnViews: [],

        counter: 0,

        arrCounter: [],

        marqueeDir: null,

        timerId: null,

        /**
        * Contains list of target view index
        *
        * @property _lstTutorialTargetViewIndex
        * @type Object
        * @default Empty Array
        * @private
        */
        _lstTutorialTargetViewIndex: [],

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

        /**
        * Stores reference of currently hovered tileitem view.
        * @property currentHoveredTile
        * @type MathInteractives.Common.Components.Models.EquationManager.TileItem
        * @default null
        */
        currentHoveredTile: null,

        isDragging: null,

        isPosParensEnabled: true,
        isNegParensEnabled: true,

        _isDropped: false,
        getIsDropped: function () {
            return this._isDropped;
        },
        setIsDropped: function (value) {
            this._isDropped = value;
        },

        $draggableContainment: null,

        $equationContainer: null,

        $overlayDiv: null,

        _strDroppables: null,
        setDroppables: function (strDroppables) {
            if (strDroppables !== this._strDroppables) {
                this._strDroppables = strDroppables;
                this.onDroppablesChange();
            }
        },
        getIdPrefix: function () { return this.idPrefix; },

        /**
        * Reference for tutorial mode
        *
        * @property _tutorialMode
        * @default false
        * @type Boolean
        * @private
        */
        _tutorialMode: false,

        /**
        * Reference for the tile that has been selcted for the combine operation
        *
        * @property tileSelected
        * @default null
        * @type Object
        * @public
        */
        tileSelected: null,

        /**
        * Reference for the tile that has been selcted from the bin to be dropped
        *
        * @property selectedTile
        * @default null
        * @type Object
        * @public
        */
        selectedTile: null,

        accTutSourceData: {},
        accTutDestData: {},

        animationOn: false,

        isSpaceKeyAllowed: true,

        /**
        * Maintains a list of immediate child exponents of the tiles selected in marquee.
        * @attribute marqueeExponents
        * @type Array
        * @default []
        **/
        marqueeExponents: [],

        /**
        * Boolean representing whether device is Android or IOS.
        * @attribute _isTouch
        * @type Boolean
        * @default null
        **/
        _isTouch: null,

        /**
        * Boolean representing whether acc is on.
        * @attribute _isAcc
        * @type Boolean
        * @default true
        **/
        _isAcc: true,

        /**
        * Returns whether acc is on or off.
        * @method isAcc
        * @return {Object} True if acc is on. False if it's off.
        **/
        isAcc: function () {
            return this._isAcc;
        },

        /**
        * Returns whether acc is on or off.
        * @method setIsAcc
        * @return {Object} True if acc is on. False if it's off.
        **/
        setIsAcc: function (isAcc) {
            this._isAcc = isAcc;
        },

        /**
        * Sets the currently focused acc view
        * @method setCurrentAccView
        * @param {Object} Currently foucsed view
        */
        setCurrentAccView: function (view) {
            this.model.set('currentAccView', view);
        },

        /**
        * Returns the currently focused view
        * @method getCurrentAccView
        * @return {Object} Currently focused view
        */
        getCurrentAccView: function () {
            return this.model.get('currentAccView');
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

        initialize: function () {
            this.initializeDefaultProperties();
            var model = this.model;

            this.parent = this.options.parent;

            if (!(this.options.tutorialMode === undefined
                || this.options.tutorialMode === null)) {
                this._tutorialMode = this.options.tutorialMode;
            }

            if (!(this.options.idPrefix === undefined
                || this.options.idPrefix === null)) {
                this.idPrefix = this.options.idPrefix;
            }

            if (this.options.strDroppables) {
                this._strDroppables = this.options.strDroppables;
            }
            else {
                this._strDroppables = '*';
            }

            if (this.options.draggableContainment) {
                this.$draggableContainment = this.options.draggableContainment;
            }
            this.setElement(this.options.element);
            this.$equationContainer = this.$el.find('.equation-container');
            this.$overlayDiv = this.$el.find('.overlay-div');
            this.showHideOverlayDiv(false);

            this.player = this.options.player;
            this.filePath = this.options.filePath;
            this.manager = this.options.manager;
            this.setIsAcc(this.isAccessible());
            this.marqueeContainer = this.options.marqueeDiv || this.$equationContainer || this.$el;
            this.marqueeView = this._generateMarquee();
            this.createCommandFactory({});
            if (!$.support.touch) {
                this.createContextMenu();
            }
            this.$el.attr('tabindex', -1); // TODO dynamic
            this.el.focus();
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
        * Creates command factory.
        * @method createCommandFactory
        * @public
        */
        createCommandFactory: function (data) {
            data = data || {};

            this.commandFactory = new modelClassNameSpace.CommandFactory(data);
        },

        render: function () {
            this.equationView.createView();
            this._attachEvents();
            if (!this._tutorialMode) {
                this.unloadScreen('expression-text');
                this.loadScreen('expression-text');
            }
            if (!$.support.touch) {
                this.model.set('currentAccView', null);
                this.attachAccessibilityEvents();
            }
        },

        /**
        * Create context menu for  equation manager tiles
        * @method createContextMenu
        */
        createContextMenu: function () {
            var ContextMenu = MathInteractives.Common.Interactivities.ExponentAccordion.Views.DerivedContextMenu;

            this.tileCtxMenu = ContextMenu.initContextMenu({
                el: this.player.$el,
                prefix: this.idPrefix,
                elements: [],
                screenId: 'em-tile-context-menu',
                contextMenuCount: 10,
                manager: this.manager,
                thisView: this
            });
            this.listenTo(this.model, 'change:currentAccView', this.currentAccViewChangeHandler);
        },

        setFocusToNumerator: function setFocusToNumerator(index, isEqnView) {
            var tileItem;
            if (isEqnView) {
                tileItem = this.equationView;
                this.model.set('currentAccView', tileItem);
                tileItem.buildStartAcc();
            }
            else {
                tileItem = this.equationView.getViewFromIndex(index);
                this.model.set('currentAccView', tileItem);
                tileItem.startAccNumerator();
            }
        },



        dropBinTileUsingContextMenu: function (index, isEqnView, isDenominator, isBigParenthesisExponent) {
            var tileItem;
            if (isBigParenthesisExponent) {
                tileItem = this.equationView.getViewFromIndex(index);
                this.model.set('currentAccView', tileItem);
                tileItem.spaceToDropTile(true);
            }
            else if (isEqnView) {
                tileItem = this.equationView;
                this.model.set('currentAccView', tileItem);
                tileItem.spaceToDropTile(true);
            }
            else {
                tileItem = this.equationView.getViewFromIndex(index);
                this.model.set('currentAccView', tileItem);
                tileItem.spaceToDropTile(true, isDenominator);
            }
        },


        attachAccessibilityEvents: function attachAccessibilityEvents() {
            var self = this,
                selectTile;
            this.$el.off('keydown.mine').on('keydown.mine', function (event) {
                var code = event.keyCode ? event.keyCode : event.charCode;
                if (self.animationOn || $('#' +self.idPrefix + 'animation-progress-div').css('display') === 'block') {
                    return;
                }
                if (self._tutorialMode) {
                    if (code === 9 && event.shiftKey !== true) {
                        event.preventDefault();
                        if (self.tileSelected == null) {
                            if (self.getCurrentAccView()) {
                                self.getCurrentAccView().removeAccDiv();
                            }
                            self.setFocus('solve-mode-replay-btn');
                        }
                    }
                    else if (code === 9 && event.shiftKey === true) {
                        event.preventDefault();
                        if (self.tileSelected == null) {
                            if (self.getCurrentAccView()) {
                                self.getCurrentAccView().removeAccDiv();
                            }
                            self.setFocus('main-activity-area-container');
                        }
                    }
                    else if (code === 32) {
                        event.preventDefault();
                        self.$el.trigger('mousedown').trigger('mouseup').trigger('click');
                        if(self.isSpaceKeyAllowed) {
                            self.isSpaceKeyAllowed = false;
                            self.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            self.equationView.tutorialSpacePressed(self.getCurrentAccView(), self.accTutSourceData, self.accTutDestData);
                        }
                    }
                    else if (code === 27) { //FOR ESC
                        event.preventDefault();
                        if (self.isMarqueeSelectedForOp) {
                            self.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            self.getCurrentAccView().removeAccDiv();
                            // order matters
                            self.isMarqueeSelectedForOp = false;
                            self.tileSelected = null;
                            self.setCurrentAccView(self.marqueeSelectedItems[0]);
                            self.marqueeView.focusAcc();
                            //self.marqueeSelectedItems[0].startAcc(true);
                            //self.removeMarqueeAcc();
                        } else if (self.tileSelected) {
                            self.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            selectTile = self.tileSelected;
                            self.getCurrentAccView().removeAccDiv();
                            self.tileSelected = null;
                            selectTile.startAcc();
                        }
                        else {
                            if(self.getCurrentAccView()) {
                                self.getCurrentAccView().removeAccDiv();
                            }
                            self.equationView.startAcc();
                        }
                    }
                }
                else {
                    if (code === 9 && event.shiftKey !== true) { //FOR TAB
                        event.preventDefault();
                        if (self.getCurrentAccView() === null) {
                            self.equationView.startAcc();
                        }
                        else {
                            self.equationView.continueAcc(self.getCurrentAccView());
                        }
                    }
                    else if (code === 9 && event.shiftKey === true) { //FOR SHIFT TAB
                        event.preventDefault();
                        self.equationView.goPreviousAcc(self.getCurrentAccView());
                    }

                    if (code === 32 && self.marqueeSelectedItems.length === 0) {  // FOR SPACE
                        event.preventDefault();
                        self.$el.trigger('mousedown').trigger('mouseup').trigger('click');
                        if(self.isSpaceKeyAllowed) {
                            self.isSpaceKeyAllowed = false;
                            self.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            self.equationView.spacePressed(self.getCurrentAccView());
                        }
                    }

                    if (code === 27) { //FOR ESC
                        event.preventDefault();
                        if (self.isMarqueeSelectedForOp) {
                            self.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            self.getCurrentAccView().removeAccDiv();
                            // order matters
                            self.isMarqueeSelectedForOp = false;
                            self.tileSelected = null;
                            self.setCurrentAccView(self.marqueeSelectedItems[0]);
                            self.marqueeView.focusAcc();
                            //self.marqueeSelectedItems[0].startAcc(true);
                            //self.removeMarqueeAcc();
                        } else if (self.tileSelected) {
                            self.trigger(viewNameSpace.EquationManager.EVENTS.TILE_DRAGGING_START);
                            selectTile = self.tileSelected;
                            self.getCurrentAccView().removeAccDiv();
                            self.tileSelected = null;
                            selectTile.startAcc();
                        }
                        else {
                            if(self.getCurrentAccView()) {
                                self.getCurrentAccView().removeAccDiv();
                            }
                            self.equationView.startAcc();
                        }
                    }
                }
            });

            this.$el.off('keyup.mine').on('keyup.mine', function (event) {
                var code = event.keyCode ? event.keyCode : event.charCode;
                if (code === 32) {
                    self.isSpaceKeyAllowed = true;
                }
            });

            this.player.$el.off('mousedown.mine').on('mousedown.mine', function (event) {
                if (self.getCurrentAccView() && event.which) {
                    //self.getCurrentAccView().removeAccDiv();
                }
            });
        },

        getContainerToAppend: function getContainerToAppend() {
            return this.$('.workspace-expression-area');
        },

        getLeftOffsetEquationView: function getLeftOffsetEquationView() {
            if (this._tutorialMode) {
                var type = this.equationView.arrTileViews[0].model.get('type');
                if ( type === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT || type === modelClassNameSpace.TileItem.SolveTileType.BASE_ONLY) {
                    return {
                        left: 4,
                        width: -16
                    };
                }
                else {
                    return {
                        left: 5,
                        width: 7
                    };
                }
            }
            else if (typeof this.getLeftOffsetEV === "function") {
                return this.getLeftOffsetEV();
            }
            else return {
                left: 2,
                width: 0
            };
        },

        accCombineOnFraction: function accCombineOnFraction(location) {
            var TYPE = modelClassNameSpace.TileItem.BinTileType,
                view = this.equationView.getViewFromIndex('0'),
                viewType = view.model.get('type');

            if (this._tutorialMode) {
                this.accTutDestData.sourceView.startAcc();
            }
            else {

                if (viewType === TYPE.BIG_PARENTHESIS) {
                    view = this.equationView.getViewFromIndex('0.0');
                } else if (viewType !== TYPE.FRACTION) {
                    view = this.equationView;
                }

                if (location === false) {
                    view.arrTileViews[0].startAcc(true);
                }
                else {
                    view.getNextDenoTileAcc();
                }
            }
        },

        events: {
            'keydown': 'keydownHandler'
        },

        /**
         * Creates equation view structure.
         * @method createEquationView
         * @public
         * @param data {Object} equation data.
         * @param container {Object} equation view element.
         */
        setData: function (data, isSavedStateLoad) {
            this.resetData();
            var modelClassNamespace = MathInteractives.Common.Components.Models.EquationManager,
                equationModel = new modelClassNamespace.EquationComponent(data.equationData),
                equationLatex = null,
                equationHtml = null,
                equationAccString = null;
            this.equationView = new viewNameSpace.EquationView({
                model: equationModel,
                equationManager: this,
                player: data.player,
                filePath: data.filePath,
                manager: data.manager,
                idPrefix: data.idPrefix
            });
            if (isSavedStateLoad !== true) {
                if (!this._tutorialMode) {
                    // add initial equation latex to stack
                    equationLatex = this.equationView.model.getEquationInLatexForm();
                    this.model.get('equationLatexStack').push(equationLatex);
                    // get initial html form of string and trigger event for form expr
                    equationHtml = this.equationView.getTileContentInHtmlForm();
                    equationAccString = this.equationView.getAccString(viewNameSpace.EquationManager.DATA);
                    this.trigger(viewNameSpace.EquationManager.EVENTS.NEW_EXPRESSION_START, {equationHtml: equationHtml, equationAccString: equationAccString});
                }
            }
            if (data.equationViewContainer) {
                this.equationView.setEquationContainer(data.equationViewContainer);
            }
            else {
                throw new Error('Provide EquationView container');
            }
            var obj = {
                modelRef: this.equationView.model,
                allowedOperation: data.cmdFactoryData.allowedOperation || this.model.get('allowedOperation'),
                maxPrimeLimit: data.cmdFactoryData.maxPrimeLimit || this.model.get('maxPrimeLimit')
            };
            this.commandFactory.setData(obj);
        },

        resetData: function () {
            if (this.equationView) {
                this.equationView.reset();
                this.equationView = null;
            }
            this.marqueeSelectedItemsIndex = [];
            this.marqueeSelectedItems = [];
            this.commandFactory.resetData();
            this._removeAllTooltips();
            this.model.set('currentAccView', null);
            this.tileSelected = null;
            this.selectedTile = null;
        },

        refresh: function () {
            if(this.equationView) {
                this.equationView.refresh();
            }
        },

        enableDroppableEquationView: function (bEnable) {
            this.equationView.attachDettachDroppable(bEnable);
        },

        /**
        * Generate & instantiate the marquee.
        *
        * @method _generateMarquee
        * @private
        * @return {Object} Created marquee view
        */
        _generateMarquee: function _generateMarquee() {
            if (this.player) {
                var className = MathInteractives.Common.Components.Views.EquationManager.Marquee;
                var marqueeView = className.createMarquee({
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    filePath: this.filePath,
                    player: this.player,
                    equationManager: this,
                    marqueeContainer: this.marqueeContainer, // $('#' + this.marqueeContainer[0].id),
                    selectorClass: viewNameSpace.EquationManager.TILE_DUMMY_CLASS
                    //ignoreClass: 'dispenser-tile'
                });
                this.listenTo(marqueeView, className.EVENTS.start, this._marqueeStartHandler);
                this.listenTo(marqueeView, className.EVENTS.ChangeSelectorClass, this._changeSelectorClass);
                this.listenTo(marqueeView, className.EVENTS.end, this._onMarqueeDrawn);
                marqueeView.disableMarquee();
                return marqueeView;
            }

        },

        /**
        * This function is called on the end event of marquee.
        * @method _onMarqueeDrawn
        * @private
        */
        _onMarqueeDrawn: function _onMarqueeDrawn(event, items, params) {
            var marqueeSelectedItems = this.marqueeSelectedItems;
            //this._applyHeightCss(event.optionalParams.$marquee);
            this._groupSelectedTileItems(event.optionalParams.$marquee);
            this._hideMarqueeSelectedItems();

            if (this._isInvalidMarqueeForTutorial()) {
                this.marqueeView.marqueeContainerMouseDownHandler(event.originalEvent);
                this.marqueeView.marqueeMouseUpHandler(event.originalEvent, false, true);
            }
            else {
                this.$('.fake-marquee').remove();
                this.trigger(viewNameSpace.EquationManager.EVENTS.MARQUEE_DRAWN);
                if (this.allEmptyInMarquee()) { this.removeMarquee(); }
            }
        },

        /**
        * Handler for ChangeSelectorClass event fired on mouse up before Marquee end event.
        * @method _changeSelectorClass
        * @private
        * @param {Object} Event object
        * @param {Object} Marquee div
        */
        _changeSelectorClass: function _changeSelectorClass(event, $marquee) {
            if (this.$el.find('.current-draggable').length !== 0) { return; }
            this._marqueeEndHandler(event, $marquee);
            this.marqueeSelectedItems = this._validateMarqueeItems(this.marqueeSelectedItems, event) || [];
            this.marqueeView.model.set('selectorClass', viewNameSpace.EquationManager.TILE_CLASS);
        },

        /**
        * Handler for Marquee drawing start event.
        * @method _marqueeStartHandler
        * @private
        * @param {Object} Event object
        */
        _marqueeStartHandler: function _marqueeStartHandler(customEventObj) {
            this.trigger(viewNameSpace.EquationManager.EVENTS.MARQUEE_START);
            this._showMarqueeSelectedItems();
            this.marqueeSelectedItems = [];
            this.marqueeSelectedItemsIndex = [];
            //this.trigger(viewNameSpace.EquationManager.EVENTS.start, customEventObj);
            //this.bDenominatorMarqueeStart = customEventObj.originalEvent.bDenominator;
            this.marqueeStartX = customEventObj.originalEvent.clientX;
            this.marqueeStartY = customEventObj.originalEvent.clientY;
            var marqueeElements = this.$el.find('.' + viewNameSpace.EquationManager.TILE_CLASS);
            marqueeElements.removeClass(viewNameSpace.EquationManager.TILE_CLASS);
            //marqueeElements.css({ 'visibility': 'visible' });
        },

        /**
        * Handler for Marquee drawing end event
        * @method _marqueeEndHandler
        * @param {Object} Event object
        */
        _marqueeEndHandler: function _marqueeEndHandler(event, $marquee) {
            //this.trigger(viewNameSpace.EquationManager.EVENTS.end, customEventObj);
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
            this.equationView.getElementsInsideMarquee(event, $marqueeDiv);
        },

        /**
        * Hides the marquee items behind the marquee so that they are not visible.
        * @method _hideMarqueeSelectedItems
        * @private
        */
        _hideMarqueeSelectedItems: function () {
            this.$('.marquee-selected').css({ 'visibility': 'hidden' });
        },

        /**
        * Shows the marquee items behind the marquee so that they are visible.
        * @method _showMarqueeSelectedItems
        * @private
        */
        _showMarqueeSelectedItems: function () {
            this.$('.marquee-selected').css({ 'visibility': '' });
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
                TILE_CLASS = viewNameSpace.EquationManager.TILE_CLASS,
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
                TILE_CLASS = viewNameSpace.EquationManager.TILE_CLASS;
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
                TILE_CLASS = viewNameSpace.EquationManager.TILE_CLASS;
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
        * Condition for looping in _validateMarqueeItems
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
        _groupSelectedTileItems: function _groupSelectedTileItems($marquee) {
            var $newDiv = $('<div/>'), $thisElement = null,
                marqueeSelectedItems = this.marqueeSelectedItems,
                newSelectedElements = this.$('.' + viewNameSpace.EquationManager.TILE_CLASS),
                itemsLen = newSelectedElements.length;

            this.marqueeExponents = [];
            $newDiv.css({
                'position': 'absolute',
                'z-index': 0,
                'left': '0px'
            });
            if (itemsLen !== 0) {
                this.marqueeView.groupSelectedElements($newDiv);
                this.marqueeView.makeGroupDraggable(this.marqueeSelectedItems[0], this.marqueeSelectedItemsIndex, this);
            }
            for (var i = 0; i < itemsLen; i++) {
                $thisElement = $(newSelectedElements[i]);
                // use withDataAndEvents  = false since it causes an issue when calling remove marquee
                // remove marquee internally calls cleanData which removes the deep copied events
                // removing the events on the actual tiles
                var $clone = $thisElement.clone(false).removeClass('marquee-selected');

                this._saveMarqueeExponents($clone);

                this.$el.find('.current-draggable').attr('style', '');
                $newDiv.append($clone);

                $clone.position({
                    my: 'left top',
                    at: 'left top',
                    of: $thisElement,
                    collision: 'none'
                });
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
            var TYPE = modelClassNameSpace.TileItem.BinTileType,
                marqueeSelectedItems = this.marqueeSelectedItems,
                cloneType = clone.data('tiletype'),
                i = 0;

            if (cloneType === TYPE.BASE_EXPONENT) {
                this.marqueeExponents.push(clone.find('.exponent > .exponent-value'));
            } else if (cloneType === TYPE.PARENTHESIS) {
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
        pushElementToSelection: function pushElementToSelection(index, itemView) {
            var parent, marqSelItemslen, $operator, $operatorEl;
            this.marqueeSelectedItems.push(itemView);
            parent = this.marqueeSelectedItems[0].parent;
            marqSelItemslen = this.marqueeSelectedItems.length;
            if (parent === this.marqueeSelectedItems[marqSelItemslen - 1].parent) {
                this.marqueeSelectedItemsIndex.push(index);
            }
        },

        /**
        * Removes the marquee from the screen.
        *
        * @method removeMarquee
        */
        removeMarquee: function removeMarquee() {
            this._showMarqueeSelectedItems();
            this.marqueeSelectedItems = [];
            //this.marqueeView.$marqueeDiv.html('');
            this.marqueeView.$marqueeDiv.empty();
            this.marqueeView.collapseMarquee();
            this.trigger(viewNameSpace.EquationManager.EVENTS.MARQUEE_REMOVED);
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

        /**
        * Returns all the BASE_EXPONENT & BASE_ONLY views in the expr.
        * It returns all that matches isDenominator. If no isDenominator is specified
        * it returns all BASE_EXPONENT & BASE_ONLY views.
        * @method getAllBaseViews
        * @param {Boolean} isDenominator of the views required
        * @return {Array} Array of BASE_EXPONENT & BASE_ONLY matching the isDenominator.
        *                 Returns all BASE_EXPONENT & BASE_ONLY if no isDenominator specified
        */
        getAllBaseViews: function (isDenominator) {
            var views = [],
                TYPE = modelClassNameSpace.TileItem.BinTileType;

            Array.prototype.push.apply(views, this.equationView.getChildViews());

            return _.filter(views, function (view) {
                if (view.model.get('type') === TYPE.BASE_EXPONENT || view.model.get('type') === TYPE.BASE_ONLY) {
                    if (isDenominator === undefined) {
                        return true
                    } else {
                        return view.model.get('bDenominator') === isDenominator;
                    }
                }
                return false;
            });
        },

        getOperatorViewOfTileItem: function getOperatorViewOfTileItem(itemView) {
            var $operator = itemView.parent.getOperatorFromTileItem(itemView);
            return $operator;
        },

        getBuildModeParenthesisSize: function () {
            return this.model.get('buildModeParenthesisSize');
        },

        _removeAllTooltips: function () {
            var i = 0;
            for (i = 0; i < this.parenthesisExponentTooltips.length; i++) {
                this.parenthesisExponentTooltips[i].remove();
                this.parenthesisExponentTooltips[i].$el.remove();
                this.applyExponentBtnViews[i].remove();
                this.applyExponentBtnViews[i].$el.off().remove();
                if (this.changeSignBtnViews.length) {
                    this.changeSignBtnViews[i].remove();
                    this.changeSignBtnViews[i].$el.off().remove();
                }
            }
            this.arrCounter = [];
            this.parenthesisExponentTooltips = [];
            this.applyExponentBtnViews = [];
            this.changeSignBtnViews = [];
            this.counter = 0;
        },

        adjustContainment: function ($element) {
            if (this.model.get('adjustContainment') && this.$draggableContainment) {
                var elmWidth = ($element instanceof Rect) ? $element.getWidth() : $element.outerWidth(),
                    // #3135 fix. Increase width by a few pixels so the mid point of the dragged div
                    // can go outside the bounding box, which it otherwise doesn't.
                    errorCorrection = 6,
                    inflateWidth = elmWidth / 2 + errorCorrection,
                    equationWidth = this.$equationContainer.width();
                this.$draggableContainment.css({ width: equationWidth + inflateWidth * 2, left: -inflateWidth });
                this.$equationContainer.css('max-width', equationWidth);
            }
        },

        resetContainment: function () {
            if (this.model.get('adjustContainment') && this.$draggableContainment) {
                this.$draggableContainment.css({ width: '', left: '' });
                this.$equationContainer.css('max-width', '');
            }
        },

        showHideOverlayDiv: function (bShow) {
            if (bShow) {
                this.$overlayDiv && this.$overlayDiv.show();
            }
            else {
                this.$overlayDiv && this.$overlayDiv.hide();
            }
        },

        /**
        * Stores new hovered tile and calls mouseOut of previously hovered tile.
        * @method registerMouseOverTile
        * @param tileView MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Models.TileItem
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

        isTileRemovable: function (tile, ptMouse) {
            var bAllow = viewNameSpace.EquationManager.Operations.DELETE_TILE & this.model.get('allowManagerLevelOperations');
            if (bAllow) {
                var rectEM = new Rect(this.el.getBoundingClientRect());
                if (!rectEM.isPointInRect(ptMouse)) {
                    this.showHideBorder(true);
                    return true;
                }
                return false;
                this.showHideBorder(false);
            }
            else {
                return false;
            }
        },

        showHideBorder: function (bShow) {
            bShow ? this.$el.addClass('delete-border') : this.$el.removeClass('delete-border');
        },

        getCurrentEquationJSON: function getCurrentEquationJSON() {
            if (this.equationView) {
                return JSON.parse(JSON.stringify(this.equationView.model));
            }
            return null;
        },

        undo: function () {
            var self = this;
            // Hide to prevent flickering
            this.$el.css('visibility', 'hidden');
            window.clearTimeout(this.timerId);
            this.$('.new-created-tile').removeClass('new-created-tile');
            this.commandFactory.undo();
            this.removeHighlightTiles();
            setTimeout(function () { self.$el.css('visibility', ''); }, 0);
            if (!this._tutorialMode) {
                this.model.get('equationLatexStack').pop();
                this.trigger(viewNameSpace.EquationManager.EVENTS.REMOVE_STEP);
            }
        },

        /**
         * Checks if glow allowed
         * @method isGlowAllowed
         * @public
         *
         * @returns {Boolean} Returns true.
         */
        isZeroGlowAllowed: function isGlowAllowed () {
            return true;
        },

        onBaseClick: function (sourceTile, data) {
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile)),
                data = { source: source },
                EVENTS = viewNameSpace.EquationManager.EVENTS,
                self = this, isSuccess,
                base = sourceTile.model.get('base'),
                allowedBaseClick;
            if (this.commandFactory.getIfOperationAllowed() === false) {
                return;
            }
            if (MathInteractives.Common.Utilities.Models.MathUtils.isPrime(base) && (Math.abs(base) === 1 || base / Math.abs(base) === 1)) {
                return;
            }
            this.trigger(EVENTS.ATTEMPT_OPERATION);
            if (this._checkNumberOfTilesPermitted(sourceTile.model.get('bDenominator'))) {
                this.restrictFirstTileAnimation = true;
                sourceTile.$el.css({ 'visibility': 'hidden' });
                isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.BREAK_BASE, data);
                sourceTile.$el.css({ 'visibility': 'visible' });
                this._animateTiles(isSuccess);
            }
            this.removeMarquee();
        },

        onExponentClick: function (sourceTile, counter, isParenthesisExponent) {
            var EVENTS = viewNameSpace.EquationManager.EVENTS,
                sourceBase = sourceTile.model.get('base'),
                sourceExp = sourceTile.model.get('exponent'),
                self = this;
            this.trigger(EVENTS.ATTEMPT_OPERATION);
            this.trigger(EVENTS.PARENTHESIS_EXPONENT_CLICK);
            if (isParenthesisExponent) {
                this._showParenthesisTooltip(counter);
                return;
            }
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile)),
                data = { source: source };
            if (Math.abs(sourceExp) === 1 && sourceBase !== -1 && sourceBase !== 1) {
                return;
            }
            if (sourceExp === 0 || Math.abs(sourceBase) === 1 || this._checkNumberOfTilesPermitted(sourceTile.model.get('bDenominator'))) {
                this.restrictFirstTileAnimation = true;
                sourceTile.$el.css({ 'visibility': 'hidden' });
                data.sourceExp = sourceExp;
                this.fireCommand(cmdFactoryClass.COMMANDS.BREAK_EXPONENT, data);
                if (sourceExp !== 0 && sourceBase !== -1 && sourceBase !== 1) {
                    this._animateTiles(true);
                }
            }
            this.removeMarquee();
        },

        _animateTiles: function _animateTiles(isSuccess) {
            if (isSuccess) {
                var firstTilePosLeft = this.firstTile.offset().left, self = this,
                    tiles = this.$('.animated-tiles'),
                    EVENTS = viewNameSpace.EquationManager.EVENTS, tileOpacity;

                tiles.position({
                    my: 'left top',
                    at: 'left top',
                    of: this.firstTile,
                    collision: 'none'
                });

                tiles.css({ 'visibility': '', 'opacity': 0 });
                this.trigger(EVENTS.FANNING_ANIMATION_START);

                if (this._tutorialMode) {
                    tileOpacity = 0.5;
                }
                else {
                    tileOpacity = 1;
                }

                tiles.animate({
                    left: 0,
                    opacity: tileOpacity
                }, 1000,
                _.once($.proxy(self.tilesAnimationComplete, self))
                );
            }
        },


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

        operatorsAnimationComplete: function () {
            var self = this, EVENTS = viewNameSpace.EquationManager.EVENTS;
            setTimeout(function () {
                self.$('.invisible-operators').css({ 'opacity': '' }).removeClass('invisible-operators');
                self.$('.disabled_operator').css({ 'opacity': '' });
                self.trigger(EVENTS.FANNING_ANIMATION_END);
            }, 100);
        },


        repositionBorderAdded: function ($tile) {
            if (this._tutorialMode) {
                $tile.removeClass('white-border-left white-border white-border-right');
            }
        },

        onAddTile: function onAddTile(data) {
            var bAllow = viewNameSpace.EquationManager.Operations.ADD_TILE_TO_CANVAS && this.model.get('allowManagerLevelOperations'),
                cmdFactoryClass, source, sourceTile, sourceTileData, tileType, binTileTypes, cmdData,
                EVENTS = viewNameSpace.EquationManager.EVENTS;
            this.trigger(EVENTS.ATTEMPT_OPERATION);
            if (bAllow) {
                if (!this._isValidDropElementForTutorial(data)) {
                    return false;
                }

                cmdFactoryClass = modelClassNameSpace.CommandFactory;
                source = new cmdFactoryClass.TileLocation(data.index, data.isDestDeno);
                sourceTile = data.sourceTile;
                sourceTileData = sourceTile.data();
                tileType = sourceTileData.tiletype;
                binTileTypes = modelClassNameSpace.TileItem.BinTileType;
                cmdData = {};

                cmdData.source = source;
                cmdData.type = tileType;
                cmdData.isLeft = data.isLeft;
                cmdData.operator = data.operator;
                if (tileType === binTileTypes.BASE) {
                    cmdData.base = sourceTileData.tilevalue;
                }
                else if (tileType === binTileTypes.EXPONENT) {
                    cmdData.exponent = sourceTileData.tilevalue;
                }
                else if (tileType === binTileTypes.PARENTHESIS) {
                    cmdData.coefficient = sourceTileData.tilevalue;
                }
                this.fireCommand(cmdFactoryClass.COMMANDS.ADD_TILE, cmdData);
                this.removeMarquee();
                this.getEquationStatusModifyBin();
            }
        },

        onDeleteTile: function onDeleteTile(data) {
            var EVENTS = viewNameSpace.EquationManager.EVENTS;
            this.trigger(EVENTS.ATTEMPT_OPERATION);
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }
            var bAllow = viewNameSpace.EquationManager.Operations.DELETE_TILE && this.model.get('allowManagerLevelOperations');
            if (bAllow) {
                var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                    sourceTile = data.sourceTile,
                    source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile), sourceTile.model.get('bDenominator'), data.numOfTiles),
                    cmdData = {};
                this.removeMarquee();
                cmdData.source = source;
                cmdData.type = data.tiletype;
                this.fireCommand(cmdFactoryClass.COMMANDS.DELETE_TILE, cmdData);
                this.getEquationStatusModifyBin();
            }
        },

        onRepositionTile: function (data) {
            var EVENTS = viewNameSpace.EquationManager.EVENTS;
            this.trigger(EVENTS.ATTEMPT_OPERATION);
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }

            var allowedOperation = this.model.get('allowManagerLevelOperations'),
                operations = viewNameSpace.EquationManager.Operations,
                strOperator = data.strOperator,
                eventsClass = viewNameSpace.EquationManager.EVENTS,
                oneToolTipShowed = false;
            if ((strOperator === '*' && operations.REORDER_MULTIPLICATION && allowedOperation) || (strOperator === '+' && operations.REORDER_ADDITION && allowedOperation)) {
                var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                    isSuccess,
                    sourceTile = data.sourceTile,
                    sourceLocation = sourceTile.model.get('bDenominator'),
                    destLocation = data.isDestDeno,
                    source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile),
                    sourceLocation, data.numOfTiles),
                    dest = new cmdFactoryClass.TileLocation(data.index, destLocation),
                    isLeft = data.isLeft,
                    cmdData = {
                        source: source,
                        dest: dest,
                        isLeft: isLeft,
                        operator: strOperator
                    },
                    destParent = this.equationView.model.getItemFromIndex(data.index.substring(0, data.index.lastIndexOf('.')));
                if (sourceLocation !== destLocation) {
                    if (destParent.get('type') === modelClassNameSpace.TileItem.SolveTileType.PARENTHESIS) {
                        this.trigger(eventsClass.INVALID_COMBINE_WITHIN_DIFF_PARENT);
                        oneToolTipShowed = true;
                    }
                    else if (this._checkNumberOfTilesPermitted(destLocation) === false) {
                        oneToolTipShowed = true;
                    }
                }
                if (oneToolTipShowed === false) {
                    isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.REPOSITION, cmdData);
                    if (isSuccess === cmdFactoryClass.EXIT_CODE.NOT_SAME_PARENT_COMBINE) {
                        this.trigger(eventsClass.INVALID_COMBINE_WITHIN_DIFF_PARENT);
                        oneToolTipShowed = true;
                        isSuccess = 0;
                    }
                }
            }

            if (isSuccess) {
                this.removeMarquee();
            }
            return isSuccess;
        },

        onCombineTiles: function (data) {
            var cmdFactoryClass = modelClassNameSpace.CommandFactory, isSuccess,
                eventsClass = viewNameSpace.EquationManager.EVENTS,
                sourceTile = data.sourceTile,
                destTile = data.destTile,
                source = new cmdFactoryClass.TileLocation(sourceTile.parent.getIndex(sourceTile),
                                                          sourceTile.model.get('bDenominator'),
                                                          data.numOfTiles),
                dest = new cmdFactoryClass.TileLocation(destTile.parent.getIndex(destTile),
                                                        destTile.model.get('bDenominator')),
                cmdData = {
                    source: source,
                    dest: dest,
                };
            this.trigger(eventsClass.ATTEMPT_OPERATION);
            if (!this._isValidDropElementForTutorial(data)) {
                return false;
            }
            isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.COMBINE, cmdData);
            if (cmdFactoryClass.EXIT_CODE.SUCCESS === isSuccess) {
                this.removeMarquee();
            }
            else if (cmdFactoryClass.EXIT_CODE.NOT_SAME_PARENT_COMBINE === isSuccess) {
                this.trigger(eventsClass.INVALID_COMBINE_WITHIN_DIFF_PARENT);
                isSuccess = 0;
            }
            else if (cmdFactoryClass.EXIT_CODE.FAILURE === isSuccess) {
                this.trigger(eventsClass.INVALID_COMBINE_WITHIN_SAME_PARENT);
                isSuccess = 0;
            }
            else if (cmdFactoryClass.EXIT_CODE.TILE_VALUE_EXCEEDING_COMBINE === isSuccess) {
                this.trigger(eventsClass.INVALID_COMBINE_FOR_TILE_VALUE_EXCEEDING);
                isSuccess = 0;
            }
            else if (cmdFactoryClass.EXIT_CODE.BASE_VALUE_EXCEEDING_COMBINE === isSuccess) {
                this.trigger(eventsClass.INVALID_COMBINE_FOR_BASE_VALUE_EXCEEDING);
                isSuccess = 0;
            }
            else if (cmdFactoryClass.EXIT_CODE.INVALID_COMBINE_WITH_MARQUEE === isSuccess) {
                this.trigger(eventsClass.INVALID_COMBINE_FOR_MARQUEE);
                isSuccess = 0;
            }
            return isSuccess;
        },

        _checkNumberOfTilesPermitted: function _checkNumberOfTilesPermitted(tileLocation) {
            var permittedTileCount = this.model.get('numOfTilesInNumDen'),
                model = this.equationView.model,
                locationCounter, locationArray;
            if (permittedTileCount) {
                locationArray = model.getBasesAtGivenLocation(tileLocation);
                if (locationArray.length < permittedTileCount) {
                    return true;
                }
                this.trigger(viewNameSpace.EquationManager.EVENTS.MAX_LIMIT_CROSSED_TOOLTIP);
                return false;
            }
            return true;
        },

        /**
        * Adds a highlight class to the tile exponent and base which is then removed after a timeout.
        * The removal has to be handled explicitly and not handled by this method.
        * @method tileAdded
        * @param {Object} Tile to highlight
        */
        tileAdded: function tileAdded(tileView) {
            var MODE = modelClassNameSpace.EquationManager.MODES,
                TYPE = modelClassNameSpace.TileItem.BinTileType,
                NEW_TILE_CLASS = 'new-created-tile',
                type = tileView.model.get('type'),
                i = 0;

            if (this.model.get('mode') === MODE.SolveMode) {
                if (tileView.$exponent) {
                    tileView.$exponent.addClass(NEW_TILE_CLASS);
                }
                if (type === TYPE.BASE_EXPONENT || type === TYPE.BASE_ONLY) {
                    tileView.$base.addClass(NEW_TILE_CLASS);
                } else if (type === TYPE.FRACTION) {
                    for (i = 0; i < tileView.arrTileViews.length; i++) {
                        this.tileAdded(tileView.arrTileViews[i]);
                    }
                }
            }
        },

        fireCommand: function (cmdName, data) {
            var equationLatex = null, equationHtml = null, equationAccString,
                cmdFactoryClass = modelClassNameSpace.CommandFactory, result,
                rules = new cmdFactoryClass.Rules(this.commandFactory.get('allowedOperation'), this.commandFactory.get('maxPrimeLimit')),
                eventsClass = viewNameSpace.EquationManager.EVENTS,
                self = this;
            // Hide to prevent flickering
            // this.$el.css('visibility', 'hidden');
            this.$('.new-created-tile').removeClass('new-created-tile');
            result = this.commandFactory.execute(cmdName, rules, data);
            //setTimeout(function () { self.$el.css('visibility', ''); }, 0);
            // todo: set acc text of solve mode workspace area
            if (result === cmdFactoryClass.EXIT_CODE.SUCCESS) {
                if (!this._tutorialMode) {
                    equationLatex = this.equationView.model.getEquationInLatexForm();
                    this.model.get('equationLatexStack').push(equationLatex);
                    equationHtml = this.equationView.getTileContentInHtmlForm();
                    equationAccString = this.equationView.getAccString(viewNameSpace.EquationManager.DATA);
                    data.equationHtml = equationHtml;
                    data.equationAccString = equationAccString;
                    this.trigger(eventsClass.ADD_STEP, data);
                }
                else {
                    if ((cmdName === cmdFactoryClass.COMMANDS.BREAK_EXPONENT && data.sourceExp !== 0) || cmdName === cmdFactoryClass.COMMANDS.BREAK_BASE) {
                        this.trigger(eventsClass.TUTORIAL_BREAK_COMMAND, data);
                    }
                    else {
                        this.trigger(eventsClass.TUTORIAL_ADD_STEP, data);
                    }
                }
                this.trigger(eventsClass.COMMAND_FIRED, result);
                window.clearTimeout(this.timerId);
                this.removeHighlightTiles();

                window.setTimeout(function () {
                    self.trigger(eventsClass.CHECK_PURE_SIMPLE);
                }, 150);
            }
            this.hideAllTooltips();
            return result;
        },

        /**
        * Removes highlight on tiles after a timeout.
        * @method removeHighlightTiles
        */
        removeHighlightTiles: function removeHighlightTiles() {
            var self = this;
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
        },

        _attachEvents: function () {
            var self = this;

            this.$el.scroll(function () {
                self.marqueeView.model.set('scrollAmt', this.scrollLeft);
            });

            this.attachMouseWheelHandler();

            this.equationView.attachEvents();

            // TODO :temp fix for tooltip hide on document click
            //$('.player').on('mousedown touchstart', function (event) {
            //    if (!($(event.target).parents('.white-button').length == 1)) {
            //        self.hideAllTooltips();
            //    }

            //});

            this.$overlayDiv && this.$overlayDiv.on('mousedown', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                return false;
            });

        },

        /**
        * Attach handler for wheel (mousewheel) event.
        * @method attachMouseWheelHandler
        */
        attachMouseWheelHandler: function () {
            var self = this,
                scrollSensitivity = 40,
                scrollAmt = null,
                marqueeEvtNamespace = this.marqueeView.namespace;
            if (BrowserCheck.isAndroid || BrowserCheck.isIOS) {
                return;
            }

            this.$el.on('wheel', $.proxy(this.mousewheelHandler, this));
        },

        /**
        * Handles mouse wheel event. Triggers mousemove internally so that the marquee drawing
        * and tile dragging works accordingly.
        * @method mousewheelHandler
        * @param {Object} Event object
        */
        mousewheelHandler: function (event) {
            event.preventDefault();
            var $el = this.$el,
                SENSITIVITY = 40,
                scrollAmt = $el.scrollLeft(),
                origEvt = event.originalEvent,
                customEvt = $.Event('mousemove');

            SENSITIVITY = origEvt.deltaY < 0 ? -SENSITIVITY : +SENSITIVITY;
            customEvt.which = origEvt.which;
            customEvt.pageX = origEvt.pageX;
            customEvt.pageY = origEvt.pageY;
            customEvt.clientX = origEvt.clientX;
            customEvt.clientY = origEvt.clientY;
            $el.scrollLeft(scrollAmt + SENSITIVITY);
            this.marqueeView.model.set('scrollAmt', $el.scrollLeft());
            this.$('.ui-draggable-dragging').removeData('cur-droppable');
            $el.trigger(customEvt);
        },

        hideMarquee: function hideMarquee() {
            this.removeMarquee();
            this.marqueeView.disableMarquee();
            this.marqueeSelectedItems = [];
        },

        showMarquee: function showMarquee() {
            this.marqueeView.enableMarquee();
        },

        /**
        * Disable listeners on marquee
        *
        * @method detachListenersOnMarqueeContainment
        * @public
        */
        detachListenersOnMarqueeContainment: function () {
            this.marqueeView.detachListenersOnContainment();
        },


        onTileDrop: function (event, ui) {

        },


        // Remove later
        //setCursor: function (type) {
        //    var $el = this.player.$el;
        //    if (type === 'open') {
        //        $el.css({ 'cursor': "url('" + this.getImagePath('open-hand') + "'), move" });
        //    } else if (type === 'closed') {
        //        $el.css({ 'cursor': "url('" + this.getImagePath('closed-hand') + "'), move" });
        //    } else if (type === 'default') {
        //        $el.css({ 'cursor': 'default' });
        //    }
        //},

        reInitialise: function reInitialise(isFractionMode) {
            if (this.equationView) {
                this.equationView.arrTileViews = [];
                this.equationView.createView();
            }
        },

        onDroppablesChange: function () { },

        _tutorialPlayer: null,

        /**
        * Creates the tutorial player view.
        *
        * @method createTutorialPlayer
        */
        createTutorialPlayer: function createTutorialPlayer() {
            var options, $tutorialEl, elId;
            options = {};
            elId = this.el.id;
            $tutorialEl = $('<div></div>', {
                'id': elId + '-cover',
                'class': elId.slice(this.idPrefix.length) + '-cover'
            }).appendTo(this.$el);
            this._tutorialPlayer = new MathInteractives.Common.Components.Theme2.Views.TutorialPlayer({ el: $tutorialEl, player: this.player });
            var model = this.model,
                tutorialNumber = model.get('currentTutorialLessonNumber'),
                tutorialData = model.get('tutorialLessons') || [],
                currentTutorialData = tutorialData[tutorialNumber];
            if (currentTutorialData) {
                this._tutorialPlayer.steps = currentTutorialData.steps;
            }
            //this.parseEventJsonForTutorial();
        },

        playTutorial: function playTutorial() {
            this._tutorialPlayer.off('parsedStepRequired').on('parsedStepRequired', $.proxy(this.parseEventJsonForTutorial, this));
            this._tutorialPlayer.play();
        },

        parseEventJsonForTutorial: function parseEventJsonForTutorial(eventJson) {
            var parsedStep = {},
                source, destination;
            if (eventJson) {
                parsedStep['action'] = eventJson.action;
                if (eventJson.source) {
                    source = this._getParsedLocation(eventJson.source);
                    parsedStep['target'] = source.target;
                    parsedStep['offset'] = source.offset;
                }
                if (eventJson.destination) {
                    destination = this._getParsedLocation(eventJson.destination);
                    parsedStep['nextTarget'] = destination.target;
                    parsedStep['nextOffset'] = destination.offset;
                }
            }
            this._tutorialPlayer.trigger('stepParsed', parsedStep);
        },

        _getParsedLocation: function _getParsedLocation(tileClickPointIndex) {
            tileClickPointIndex = tileClickPointIndex || '';
            tileClickPointIndex = tileClickPointIndex.split('#');
            var tileItem = this.equationView.getViewFromIndex(tileClickPointIndex[0]),
                clickPoint = tileItem._getTutorialMouseEventPoint(tileClickPointIndex[1]);
            return {
                target: clickPoint.element,
                offset: clickPoint.offset
            }
        },

        /**
        * Disabled all child droppables in equationView
        *
        * @method disableTiles
        * @param {Boolean} bRecursive True if recursively disables all droppables
        */
        disableTiles: function disableTiles(bRecursive) {
            if (this.equationView) {
                this.equationView.disableTiles(bRecursive);
            }
            if (this.marqueeView) {
                this.marqueeView.disableMarquee();
                this.marqueeView._detachListenersOnMarqueeContainment();
            }
        },

        /**
        * As per given index, enable draggable/droppable tile
        *
        * @method enableDisableTilesItems
        * @param {Array} arrIndex Array of element index which is to be enable
        * @param {Boolean} enable True to enable tiles
        * @public
        */
        enableDisableTilesItems: function (arrIndex, enable) {
            var len = 0,
                tileIndex;
            if (arrIndex) {
                len = arrIndex.length;
                for (var i = 0; i < len; i++) {
                    tileIndex = arrIndex[i];
                    if (tileIndex) {
                        this.equationView.enableDisableTilesItem(tileIndex, enable);
                    }
                }
            }
        },

        /**
        * Retrive a view from givrn index
        *
        * @method getViewFromIndex
        * @param {String} indexString Index of element in Tree form seperate by '.'
        * @return {Object} Tile view with given index
        */
        getViewFromIndex: function (indexString) {
            return this.equationView.getViewFromIndex(indexString);
        },

        /**
        * DeActivate all events for draggable tiles and Marquee view
        *
        * @method deActivateEventOnAllTiles
        * @param {Boolean} bRecursive True if recursively deActivate all events
        * @public
        */
        deActivateEventOnAllTiles: function (bRecursive) {
            if (this.equationView) {
                this.equationView.deActivateEventOnTiles(bRecursive);
            }
            this.detachEventOnAllApplyExponent();
            this.detachEventOnAllChangeSign();
        },

        /**
        * As per given list of element index along with action and offset, set event on view
        *
        * @method activateEventOnTiles
        * @param {Array} lstAllowTagetIndex List of element index along with action and offset
        * @public
        */
        activateEventOnTiles: function (lstAllowTagetIndex) {
            var data = {},
                elementIndexView,
                len = 0;
            if (lstAllowTagetIndex) {
                len = lstAllowTagetIndex.length;
                for (var counter = 0; counter < len; counter++) {
                    data = lstAllowTagetIndex[counter];
                    if (data) {
                        elementIndexView = this.getViewFromIndex(data.index);
                        if (elementIndexView) {
                            elementIndexView.attachEventOnView(data.simulateAction, data.offset, data.menuIndex);
                        }
                    }
                }
            }
        },

        /**
        * Validate target element from given data
        * data:
        *       {
        *           sourceTile: SourceTile jQuery object
        *           destTile: Destination Tile view
        *       }
        *
        * @method _isValidDropElementForTutorial
        * @param {Object} data Data of the draggable-droppable
        * @returns {Boolean} True if it is not tutorial mode and valid target element found for tutorial mode
        */
        _isValidDropElementForTutorial: function (data) {
            var len = this._lstTutorialTargetViewIndex.length,
                curViewIndex = null,
                curDropIndex = this._getCurrentDropIndex(data);
            // If it is not tutorial mode, just return true
            if (!this._tutorialMode) {
                return true;
            }
            // If no data found, return false
            if (!data) {
                return false;
            }
            for (var counter = 0; counter < len; counter++) {
                curViewIndex = this._lstTutorialTargetViewIndex[counter];
                if (curViewIndex === curDropIndex) {
                    if (data.sourceTile) {
                        if (data.sourceTile.data) {
                            // On source tile, set data isValidDrop true
                            data.sourceTile.data('isValidDrop', true);
                        }
                        else if (data.sourceTile.$el) {
                            data.sourceTile.$el.data('isValidDrop', true);
                        }
                    }
                    return true;
                }
            }
            if (curDropIndex === true) { // curDropIndex set to true in '_getCurrentDropIndex' for drop on marquee
                // and on tooltip click
                if (data.sourceTile) {
                    if (data.sourceTile.data) {
                        // On source tile, set data isValidDrop true
                        data.sourceTile.data('isValidDrop', true);
                    }
                    else if (data.sourceTile.$el) {
                        data.sourceTile.$el.data('isValidDrop', true);
                    }
                }
                return true;
            }
            return false;
        },

        /**
        * Validate marquee selection
        *
        * @method _isInvalidMarqueeForTutorial
        * @returns {Boolean} True if it is an invalid marquee selection in tutorial mode
        */
        _isInvalidMarqueeForTutorial: function () {
            // If it is not tutorial mode, just return true
            if (this._tutorialMode) {
                var marqueeSelectedItemsIndex = this.marqueeSelectedItemsIndex,
                    numberOfItemsSelected = marqueeSelectedItemsIndex.length;
                if (marqueeSelectedItemsIndex[0] === this._tutorialMarqueeFirstElementIndex &&
                    marqueeSelectedItemsIndex[numberOfItemsSelected - 1] === this._tutorialMarqueeLastElementIndex) {
                }
                else {
                    return true;
                }
            }
            return false;
        },

        /**
        * As par given data, get index of drop element
        *
        * @method _getCurrentDropIndex
        * @param {Object} data Data of the draggable-droppable
        * @private
        * @return {String} Index of Drop element if found, otherwise -1
        */
        _getCurrentDropIndex: function (data) {
            var curDrop = null;
            if (data) {
                curDrop = data.destTile;
                if (curDrop) {
                    return data.destTile.parent.getIndex(data.destTile);
                }
                // ToDo: if current droppable not found, fetch index in another way
                if (data.isDropOnMarquee) {
                    return true;
                }
                if (data.isTooltipClick) {
                    return true;
                }
            }
            return '-1';
        },

        /**
        * Set list of target view index for tutorial mode
        *
        * @method setTutorialTargetViewIndex
        * @param {Array} lstTargetViewIndex List of target index to be checked
        * @public
        */
        setTutorialTargetViewIndex: function (lstTargetViewIndex) {
            if (lstTargetViewIndex) {
                this._lstTutorialTargetViewIndex = lstTargetViewIndex;
            }
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
            if (firstItemIndex) {
                this._tutorialMarqueeFirstElementIndex = firstItemIndex;
                this._tutorialMarqueeLastElementIndex = lastItemIndex;
            }
        },


        getExponentId: function () {
            var index = this.arrCounter.indexOf(-1);
            if (index !== -1) {
                this.arrCounter[index] = index;
                return index;
            }
            this.arrCounter[this.counter] = this.counter;
            return this.counter++;
        },

        parenthesisRemoved: function (counter, isReset) {
            //delete tooltip
            var tooltip = this.parenthesisExponentTooltips[counter];
            if (isReset) {
                this._removeAllTooltips();
            }
            else {
                this.arrCounter[counter] = -1;
                this.parenthesisExponentTooltips[counter].remove();
                this.parenthesisExponentTooltips[counter].$el.remove();
                this.applyExponentBtnViews[counter].remove();
                this.applyExponentBtnViews[counter].$el.off().remove();
                if (this.changeSignBtnViews.length) {
                    this.changeSignBtnViews[counter].remove();
                    this.changeSignBtnViews[counter].$el.off().remove();
                }
                tooltip.$el.off();
                tooltip.remove();
            }

        },

        parenthesisAdded: function (view, index, isBigParenthesis) {
            //add tooltip
            if (isBigParenthesis) {
                this._removeAllTooltips();
                this.arrCounter[0] = this.counter;
                this.counter += 1;
            }
            this.createTooltip(index, view);
        },

        increamentCounter: function () {
            this.counter++;
        },

        createTooltip: function (counter, view) {
            var tooltipOpts = {
                elementEl: this.idPrefix + 'exponent-' + counter,
                idPrefix: this.idPrefix,
                manager: this.manager,
                _player: this.player,
                type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION,
                arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.RIGHT_MIDDLE,
                path: this.filePath,
                isTts: false,
                isArrow: true,
                closeOnDocumentClick: true,
                backgroundColor: '#6D6D6D',
                //baseClass: 'parenthesis-exponent-tooltip',
                borderColor: '#ffffff',
                containerEleId: 'tooltip-demo-container',
                position: 'right-middle',
                dynamicArrowPosition: true
            };
            tooltipOpts.text = this._getExponentTooltipHtml(counter);
            this.parenthesisExponentTooltips[counter] = MathInteractives.Common.Components.Views.BoundedTooltip.generateBoundedTooltip(tooltipOpts);
            this._generateButtonsInsideTooltip(counter, view);
        },


        getExponentClickedTooltip: function (index) {
            var i = this.arrCounter.indexOf(index);
            return this.parenthesisExponentTooltips[i];
        },



        _showParenthesisTooltip: function (counter) {
            var tooltip = this.getExponentClickedTooltip(counter),
                eventsClass = viewNameSpace.EquationManager.EVENTS;
            if (tooltip.$el.css('display') !== 'none') {
                return; // discontinue if already visible
            }
            this.hideAllTooltips();
            tooltip.showTooltip();
            var data = { tooltip: tooltip };
            if (this.applyExponentBtnViews[counter]) {
                data.applyExponent = this.applyExponentBtnViews[counter];
            }
            if (this.changeSignBtnViews[counter]) {
                data.changeSign = this.changeSignBtnViews[counter];
            }
            this.trigger(eventsClass.TOOLTIP_VISIBLE, data);
        },



        hideAllTooltips: function () {
            var i = 0,
                eventsClass = viewNameSpace.EquationManager.EVENTS;
            for (; i < this.parenthesisExponentTooltips.length; i++) {
                if (this.parenthesisExponentTooltips[i]) {
                    this.parenthesisExponentTooltips[i].hideTooltip();
                }
            }
            this.trigger(eventsClass.TOOLTIP_HIDE);
        },

        _getExponentTooltipHtml: function _getExponentTooltipHtml(index) {
            var $buttonsContainer = $('<div></div>').attr({ 'id': this.idPrefix + 'exponent-tooltip-buttons-container-' + index, 'class': 'exponent-tooltip-buttons-container' }),
                $applyExponentButton = $('<div></div>').attr({ 'id': this.idPrefix + 'apply-exponent-button-' + index, 'class': 'apply-exponent-button' }).appendTo($buttonsContainer),
                $changeSignButton = $('<div></div>').attr({ 'id': this.idPrefix + 'change-sign-button-' + index, 'class': 'change-sign-button' }).appendTo($buttonsContainer);
            return $buttonsContainer;
        },

        _generateButtonsInsideTooltip: function (index, view) {
            var buttonProperties, self = this,
            ButtonClass = MathInteractives.global.Theme2.Button,
            applyExponentViewsLen = this.applyExponentBtnViews.length,
            changeSignViewsLen = this.changeSignBtnViews.length;
            buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'apply-exponent-button-' + index,
                    text: this.getMessage('exponent-parenthesis-tooltip', 'apply-exponent'),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'white-button',
                    textColor: '#007ebf'
                }
            };
            this.applyExponentBtnViews[index] = new ButtonClass.generateButton(buttonProperties);
            this._createAccDivsOfButtons(buttonProperties.data.id, buttonProperties.data.text, 511);
            //this.applyExponentBtnViews[index].$el.off('click').on('click', null, { 'view': view }, function (event) {
            //    debugger
            //    self.applyExponentClick(event);
            //    self.solveModeSetFocusOnTooltip();
            //});

            this.applyExponentBtnViews[index].$el.off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 9 && self._tutorialMode) {
                    event.preventDefault();
                }
                else if (uniCode === 27) {
                    event.preventDefault();
                    var currentAccView = self.getCurrentAccView();
                    currentAccView.removeAccDiv();
                    currentAccView.startAcc();
                    self.hideAllTooltips();
                }
                else if (uniCode === 9 && self.currentLevel <= 2) {
                    event.preventDefault();
                }
            });

            buttonProperties.data.id = this.idPrefix + 'change-sign-button-' + index;
            buttonProperties.data.text = this.getMessage('exponent-parenthesis-tooltip', 'change-sign');
            buttonProperties.data.width = 173;
            this.changeSignBtnViews[index] = new ButtonClass.generateButton(buttonProperties);
            this._createAccDivsOfButtons(buttonProperties.data.id, buttonProperties.data.text, 512);
            //this.changeSignBtnViews[index].$el.off('click').on('click', null, { 'view': view }, function (event) {
            //    self.changeSignClick(event);
            //    self.solveModeSetFocusOnTooltip();
            //});

            this.changeSignBtnViews[index].$el.off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 9 && self._tutorialMode) {
                    event.preventDefault();
                }
                else if (uniCode === 27) {
                    event.preventDefault();
                    var currentAccView = self.getCurrentAccView();
                    currentAccView.removeAccDiv();
                    currentAccView.startAcc();
                    self.hideAllTooltips();
                }
            });
        },

        _createAccDivsOfButtons: function _createAccDivsOfButtons(id, accText, tabIndex) {
            var obj = {
                "elementId": id.replace(this.idPrefix, ''),
                "tabIndex": tabIndex,
                "acc": accText
            };
            this.createAccDiv(obj);
        },

        /**
        * As per given menu index, attach click event of Apply exponent and change sign on given element index and view
        *
        * @method attachEventOnMenuItem
        * @param {String} menuIndex Menu index
        * @param {Number} parenthesisExponentId Parenthesis exponent Id (stored in parenthesis view)
        * @param {Object} view View of the tile
        * @private
        */
        attachEventOnMenuItem: function (menuIndex, parenthesisExponentId, view) {
            if (menuIndex === '0') {
                this._attachEventOnApplyExponent(parenthesisExponentId, view);
            }
            else if (menuIndex === '1') {
                this._attachEventOnChangeSign(parenthesisExponentId, view);
            }
        },

        /**
        * Attach click event on given element index and view
        *
        * @method attachEventOnApplyExponent
        * @param {Number} parenthesisExponentId Parenthesis exponent Id (stored in parenthesis view)
        * @param {Object} view View of the tile
        * @private
        */
        _attachEventOnApplyExponent: function (parenthesisExponentId, view) {
            var applyExponentViewsLen = this.applyExponentBtnViews.length,
                self = this,
                counter = this._getCounterApplyExponent(parenthesisExponentId);
            if (counter !== -1) {
                this.applyExponentBtnViews[counter].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.applyExponentBtnViews[counter].$el.off('click.tutApplyExponent').on('click.tutApplyExponent', null, { 'view': view }, function (event) {
                    self.applyExponentClick(event);
                    self.solveModeSetFocusOnTooltip();
                });
            }
        },

        /**
        * Retrieve the counter of given element index with whom apply exponent is attached
        *
        * @method _getCounterApplyExponent
        * @param {Number} parenthesisExponentId Parenthesis exponent Id (stored in parenthesis view)
        * @private
        */
        _getCounterApplyExponent: function (parenthesisExponentId) {
            var len = this.applyExponentBtnViews.length,
                el = null;
            for (var i = 0; i < len; i++) {
                var view = this.applyExponentBtnViews[i];
                if (view) {
                    el = view.el;
                    if (el) {
                        var id = parseInt(el.id.replace(this.idPrefix + 'apply-exponent-button-', ''), 10);
                        if (id === parenthesisExponentId) {
                            return i;
                        }
                    }
                }
            }
            return -1;
        },

        /**
        * Detach click event on all apply exponent buttons
        *
        * @method detachEventOnAllApplyExponent
        * @public
        */
        detachEventOnAllApplyExponent: function () {
            var len = this.applyExponentBtnViews.length;
            for (var i = 0; i < len; i++) {
                this.applyExponentBtnViews[i].$el.off('click');
                this.applyExponentBtnViews[i].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
            }
        },

        /**
       * Attach click event on given element index and view
       *
       * @method attachEventOnChangeSign
       * @param {Number} parenthesisExponentId Parenthesis exponent Id (stored in parenthesis view)
       * @param {Object} view View of the tile
       * @private
       */
        _attachEventOnChangeSign: function (parenthesisExponentId, view) {
            var changeSignViewsLen = this.changeSignBtnViews.length,
                self = this,
                counter = this._getCounterChangeSign(parenthesisExponentId);
            if (counter !== -1) {
                this.changeSignBtnViews[counter].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.changeSignBtnViews[counter].$el.off('click.tutChangeSign').on('click.tutChangeSign', null, { 'view': view }, function (event) {
                    self.changeSignClick(event);
                    self.solveModeSetFocusOnTooltip();
                });
            }
        },

        /**
        * Retrieve the counter of given element index with whom change sign is attached
        *
        * @method _getCounterChangeSign
        * @param {Number} parenthesisExponentId Parenthesis exponent Id (stored in parenthesis view)
        * @private
        */
        _getCounterChangeSign: function (parenthesisExponentId) {
            var len = this.changeSignBtnViews.length,
                el = null;
            for (var i = 0; i < len; i++) {
                var view = this.changeSignBtnViews[i];
                if (view) {
                    el = view.el;
                    if (el) {
                        var id = parseInt(el.id.replace(this.idPrefix + 'change-sign-button-', ''), 10);
                        if (id === parenthesisExponentId) {
                            return i;
                        }
                    }
                }
            }
            return -1;
        },

        /**
        * Detach click event on all change sign buttons
        *
        * @method detachEventOnAllChangeSign
        * @public
        */
        detachEventOnAllChangeSign: function () {
            var len = this.changeSignBtnViews.length;
            for (var i = 0; i < len; i++) {
                this.changeSignBtnViews[i].$el.off('click');
                this.changeSignBtnViews[i].setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
            }
        },

        applyExponentClick: function (event) {
            var view = event.data.view,
                index = view.parent.getIndex(view),
                cmdFactoryClass = modelClassNameSpace.CommandFactory,
                eventsClass = viewNameSpace.EquationManager.EVENTS,
                isSuccess,
                self = this;
            this.trigger(eventsClass.ATTEMPT_OPERATION);
            var cmdFactoryClass = modelClassNameSpace.CommandFactory,
                source = new cmdFactoryClass.TileLocation(index),
                data = { source: source };
            this.$el.css('visibility', 'hidden');
            isSuccess = this.fireCommand(cmdFactoryClass.COMMANDS.APPLY_EXPONENT, data);
            window.setTimeout(function () { self.$el.css('visibility', ''); }, 0);
            if (cmdFactoryClass.EXIT_CODE.TILE_VALUE_EXCEEDING_COMBINE === isSuccess) {
                this.trigger(eventsClass.INVALID_COMBINE_FOR_TILE_VALUE_EXCEEDING);
                isSuccess = 0;
            }
            else {
                if (!event.which) {
                    window.setTimeout(function () { self.solveModeSetFocusOnTooltip(); }, 0);
                }
            }
            this.removeMarquee();
        },

        changeSignClick: function (event) {
            var view = event.data.view,
                parent = view.parent,
                cmdFactoryClass = modelClassNameSpace.CommandFactory,
                binTileTypes = modelClassNameSpace.TileItem.BinTileType,
                index = view.parent.getIndex(view),
                source = new cmdFactoryClass.TileLocation(index),
                data = { source: source },
                EVENTS = viewNameSpace.EquationManager.EVENTS,
                self = this;
            this.trigger(EVENTS.ATTEMPT_OPERATION);
            if (parent && parent.model.get('type') === binTileTypes.FRACTION) {
                parent.onChildParenthesisChangeSign(view);
            }
            else {
                this.$el.css('visibility', 'hidden');
                setTimeout(function () { self.$el.css('visibility', ''); }, 0);
                this.fireCommand(cmdFactoryClass.COMMANDS.CHANGE_SIGN, data);
                if (!event.which) {
                    window.setTimeout(function () { self.solveModeSetFocusOnTooltip(); }, 0);
                }
            }
            this.removeMarquee();
        },

        /**
        * Iterate through all child, and enable all operators
        *
        * @method enableAllOperator
        * @param {Boolean} bRecursive True if call recursively
        * @public
        */
        enableAllOperator: function (bRecursive) {
            if (this.equationView) {
                this.equationView.enableAllOperator(bRecursive);
            }
        },

        /**
        * Handler called when a key is pressed inside the equation manager. It handles the marquee selection
        * using arrow keys.
        * @method keydownHandler
        * @param {Object} Keydown event object.
        */
        keydownHandler: function (event) {
            if (!this.isAccessible()) {
                return;
            }
            event.preventDefault();
            if (!this.equationView) { return; }

            var marqueeSelectedItems = this.marqueeSelectedItems,
                marqueeSelectedItemsIndex = this.marqueeSelectedItemsIndex,
                marqueeLen = marqueeSelectedItems.length,
                tiles = this.equationView.arrTileViews,
                KEY = viewNameSpace.EquationManager.KEY,
                EVENT = viewNameSpace.EquationManager.EVENTS,
                _tutorialMode = this._tutorialMode,
                adjTile = null,
                removedTile = null,
                marqueeDir = null,
                ALLOWED_KEYS = [
                    KEY.RIGHTARROW,
                    KEY.LEFTARROW,
                    KEY.ESCAPE,
                    KEY.TAB,
                    KEY.SPACE
                ];

            if (ALLOWED_KEYS.indexOf(event.which) === -1) { return; }
            if ((event.which === KEY.RIGHTARROW || event.which === KEY.LEFTARROW) && this.isMarqueeSelectedForOp) {
                return;
            }
            this.setMarqueeDir(event);
            marqueeDir = this.marqueeDir;
            if (!_tutorialMode || _tutorialMode && this._isInvalidMarqueeForTutorial()) {
                //this._showMarqueeSelectedItems();
            }
            if (event.which === KEY.LEFTARROW || event.which === KEY.RIGHTARROW) {
                this.handleMarqueeAcc(event);
            } else if (this.isSecondSpacePress(event)) {
                this.equationView.spacePressed(this.getCurrentAccView());
                event.stopImmediatePropagation();       // FIX: find a better way to do this
                return;
            } else if (this.isSpacePressTut(event)) {
                this.spacePressTutHandler(event);
            }
        },

        /**
        * Handles selection of marquee in acc using arrow keys.
        * @method handleMarqueeAcc
        * @param {Object} Keydown event object
        */
        handleMarqueeAcc: function (event) {
            var marqueeSelectedItems = this.marqueeSelectedItems,
                marqueeSelectedItemsIndex = this.marqueeSelectedItemsIndex,
                marqueeLen = marqueeSelectedItems.length,
                tiles = this.equationView.arrTileViews,
                KEY = viewNameSpace.EquationManager.KEY,
                EVENT = viewNameSpace.EquationManager.EVENTS,
                MARQUEE_CLASS = viewNameSpace.EquationManager.TILE_CLASS,
                TUT_OP = MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE,
                _tutorialMode = this._tutorialMode,
                adjTile = null,
                removedTile = null,
                isAdded = false,
                marqueeDir = null,
                DISABLED_CLASS = 'custom-droppable-disabled',
                ALLOWED_KEYS = [
                    KEY.RIGHTARROW,
                    KEY.LEFTARROW
                    //KEY.ESCAPE,
                    //KEY.TAB,
                    //KEY.SPACE
                ];

            if (ALLOWED_KEYS.indexOf(event.which) === -1) { return; }
            if (this._tutorialMode && this.accTutSourceData.operation !== TUT_OP._promptUserToMarquee) {
                return;
            }
            this.setMarqueeDir(event);
            marqueeDir = this.marqueeDir;

            if (!_tutorialMode || _tutorialMode && this._isInvalidMarqueeForTutorial()) {
                this._showMarqueeSelectedItems();
            }

            if (event.shiftKey && event.which === KEY.RIGHTARROW && this.isTypeAllowedInMarquee()) {
                if (this.isMarqueeSelectedForOp) {
                    return;
                }

                if (marqueeDir === 'ltr' || marqueeLen <= 1) {
                    // push
                    adjTile = marqueeSelectedItems.length > 0 ? this.getAdjacentTile(marqueeDir) : this.getCurrentAccView();
                    if (!adjTile || adjTile.model.isOne() || adjTile.$el.hasClass(DISABLED_CLASS)) {
                        this.drawMarquee();
                        return;
                    }
                    marqueeSelectedItems.push(adjTile);
                    isAdded = true;
                    marqueeSelectedItemsIndex.push(adjTile.parent.getIndex(adjTile));
                    adjTile.$el.addClass(MARQUEE_CLASS);
                    this.scrollToTile(adjTile);
                    this._addOperatorToMarquee(adjTile);
                } else if (marqueeDir === 'rtl') {
                    // shift
                    removedTile = marqueeSelectedItems.shift();
                    isAdded = false;
                    marqueeSelectedItemsIndex.shift();
                    removedTile.$el.removeClass(MARQUEE_CLASS);
                    this.scrollToTile(removedTile.getNextTile());
                    this._removeOperatorFromMarquee(removedTile.getNextTile());
                }

            } else if (event.shiftKey && event.which === KEY.LEFTARROW && this.isTypeAllowedInMarquee()) {
                if (this.isMarqueeSelectedForOp) {
                    return;
                }

                if (marqueeDir === 'rtl' || marqueeLen <= 1) {
                    // unshift
                    adjTile = marqueeSelectedItems.length > 0 ? this.getAdjacentTile(marqueeDir) : this.getCurrentAccView();
                    if (!adjTile || adjTile.model.isOne() || adjTile.$el.hasClass(DISABLED_CLASS)) {
                        this.drawMarquee();
                        return;
                    }
                    this._addOperatorToMarquee(marqueeSelectedItems[0]);
                    marqueeSelectedItems.unshift(adjTile);
                    isAdded = true;
                    marqueeSelectedItemsIndex.unshift(adjTile.parent.getIndex(adjTile));
                    adjTile.$el.addClass(MARQUEE_CLASS);
                    this.scrollToTile(adjTile);
                } else if (marqueeDir === 'ltr') {
                    // pop
                    removedTile = marqueeSelectedItems.pop();
                    isAdded = false;
                    marqueeSelectedItemsIndex.pop();
                    removedTile.$el.removeClass(MARQUEE_CLASS);
                    this._removeOperatorFromMarquee(removedTile);
                    this.scrollToTile(removedTile.getPrevTile());
                }
            }

            if (this.$('.marquee-selected').eq(0).hasClass('operator-container')) {
                this.$('.marquee-selected').eq(0).removeClass('marquee-selected');
            }

            if (this.marqueeSelectedItems.length > 0) {
                this.drawMarquee();
                if (isAdded) {
                    this.setMarqueeText(adjTile, isAdded);
                } else {
                    // removed
                    this.setMarqueeText(removedTile, isAdded);
                }
                if (_tutorialMode && !this._isInvalidMarqueeForTutorial()) {
                    this.setFocus(this.$el.attr('id').replace(this.idPrefix, ''));
                    this.trigger(viewNameSpace.EquationManager.EVENTS.MARQUEE_DRAWN);
                }
            }
        },

        /**
        * Scrolls the EM workspace to the tile passed.
        * @method scrollToTile
        * @param {Object} The tile to scroll to.
        */
        scrollToTile: function (tile) {
            var $el = this.$el,
                tileEl = tile.$el,
                tileOffset = tileEl.offset(),
                tileLeft = tileOffset.left,
                tileRight = tileLeft + tileEl.width(),
                contLeft = $el.scrollLeft(),
                BUFFER = 20;    // To account for EM padding.

            if (tileLeft < 0) {
                $el.scrollLeft(contLeft + (tileLeft - BUFFER));
            } else if (tileRight > $el.width()) {
                $el.scrollLeft(contLeft + tileRight - $el.width() + BUFFER);
            }
        },

        /**
        * Checks whether this keypress is the second space press.
        * @method isSecondSpacePress
        * @param {Object} Event object.
        * @return {Boolean} True, if this keypress is the second space press. False otherwise.
        */
        isSecondSpacePress: function (event) {
            var KEY = viewNameSpace.EquationManager.KEY;
            return event.which === KEY.SPACE && this.isMarqueeSelectedForOp;
        },

        /**
        * Handles space press on EM in tut mode.
        * @method spacePressTutHandler
        * @param {Object} Keydown event object
        */
        spacePressTutHandler: function (event) {
            var MODE = modelClassNameSpace.EquationManager.MODES,
                mode = this.model.get('mode');

            if (mode === MODE.BuildMode && this.marqueeSelectedItems.length > 0) {
                this.getCurrentAccView().removeAccDiv();
                var cover = this.marqueeView.$marqueeDiv.find('.selected-elements-cover');
                cover.text(this.tutorialCustomTileString);
                this.marqueeView.focusAcc();
            }
        },

        /**
        * Checks the condition if it's the tutorial mode and a space is pressed.
        * @method isSpacePressTut
        * @param {Object} Event object
        * @return {Boolean} True if it's the tutorial mode and a space is pressed.
        */
        isSpacePressTut: function (event) {
            var KEY = viewNameSpace.EquationManager.KEY;
            return this._tutorialMode && event.which === KEY.SPACE;
        },

        startFirstSpaceOpTut: function () {
            var accTutDestData = this.accTutDestData,
                //accTutSourceData = this.accTutSourceData,
                //sourceView = accTutSourceData.sourceView,
                //sourceType = sourceView.model.get('type'),
                destView = accTutDestData.sourceView,
                destType = destView.model.get('type'),
                TYPE = modelClassNameSpace.TileItem.BinTileType;

            if (destType === TYPE.MARQUEE) {
                // marquee and space on em then focus on marquee
                destView.focusAcc();
            } else if (document.activeElement === this.marqueeView.$marqueeDiv[0]) {
                this.isMarqueeSelectedForOp = true;
                this.tileSelected = true;
                this.tutorialCustomTileString = "";
                destView.startAcc();
            }
        },

        /**
        * Removes the marquee. Should be used when ACC is on. It internaly calls the regular
        * removeMarquee method. The toRevertFocus denotes whether the revert is to be focused
        * on the last active tile.
        * @method removeMarqueeAcc
        * @param {Boolean} toRevertFocus - If true, the previous current acc tile is focused.
        */
        removeMarqueeAcc: function (toRevertFocus) {
            var TILE_CLASS = viewNameSpace.EquationManager.TILE_CLASS;
            this.removeMarquee();
            this.$('.' + TILE_CLASS).removeClass(TILE_CLASS);
            this.marqueeSelectedItems = [];
            this.isMarqueeSelectedForOp = false;
            if (toRevertFocus) {
                this.$el[0].focus();
                if (this.getCurrentAccView()) {
                    this.getCurrentAccView().revertFocus();
                }
            }
        },

        /**
        * Stops the space selection for marquee.
        * @method stopSpaceSelect
        */
        stopSpaceSelect: function () {
            this.isMarqueeSelectedForOp = false;
            this.tileSelected = null;
        },

        /**
        * Checks whether the current focused elem is allowed inside the marquee.
        * @method isTypeAllowedInMarquee
        * @return {Boolean} True if the current focused elem  is allowed inside marquee. False otherwise.
        */
        isTypeAllowedInMarquee: function () {
            var tile = this.getCurrentAccView(),
                TYPE = modelClassNameSpace.TileItem.BinTileType,
                ALLOWED_TYPES = [
                    TYPE.BASE_EXPONENT,
                    TYPE.PARENTHESIS,
                    TYPE.BASE_ONLY
                ];
            if (this.getCurrentAccView()) {
                return ALLOWED_TYPES.indexOf(tile.model.get('type')) > -1;
            }
        },

        /**
        * Draws the marquee on the `marqueeSelectedItems` and focuses the newly created marquee div.
        * @method drawMarquee
        */
        drawMarquee: function () {
            var marqueeView = this.marqueeView;
            if (this.marqueeSelectedItems.length === 1) {
                this.getCurrentAccView().removeAccDiv();
            }
            marqueeView.$marqueeDiv.empty();
            marqueeView._attachListenersOnMarqueeDiv();
            marqueeView.drawMarqueeOn(this.marqueeSelectedItems);
            this._groupSelectedTileItems(marqueeView.$marqueeDiv);
            this._hideMarqueeSelectedItems();
            marqueeView.marqueeFocusin();
            if (document.activeElement !== marqueeView.$marqueeDiv[0]) {
                marqueeView.focusAcc();
            }
        },

        /**
        * Sets the `marqueeDir` instace attribute to either 'ltr' or 'rtl' based on the key pressed
        * and the previous direction.
        * @method setMarqueeDir
        * @param {Object} Event object.
        */
        setMarqueeDir: function (event) {
            var KEY = viewNameSpace.EquationManager.KEY;
            if (this.marqueeSelectedItems.length !== 1) { return; }
            this.marqueeDir = event.which === KEY.RIGHTARROW ? 'ltr' : event.which === KEY.LEFTARROW ? 'rtl' : null;
        },

        /**
        * Adds the Marquee class to the tile and it's operator.
        * @method addMarqueeClasses
        * @param {Object} Tile to which the class should be applied.
        */
        addMarqueeClasses: function (tile) {
            tile.$el.addClass('marquee-selected');  // TODO dynamic
            this._addOperatorToMarquee(tile);
        },

        /**
        * Returns the tile adjacent to the last selected item in the marquee based on dir. This is the tile
        * that should be selected next inside the marquee.
        * @method getAdjacentTile
        * @param {String} dir - Direction of the marquee. Can be 'ltr' or 'rtl'
        * @return {Object} Next tile that should be selected in the marquee.
        */
        getAdjacentTile: function (dir) {
            var tile = null,
                marqueeSelectedItems = this.marqueeSelectedItems;
            if (dir === 'ltr') {
                tile = _.last(marqueeSelectedItems).getNextTile();
                if (!tile) { return null; }
                if (_.last(marqueeSelectedItems).model.get('bDenominator') !== tile.model.get('bDenominator')) {
                    return null;
                }
                return tile;
            } else if (dir === 'rtl') {
                tile = marqueeSelectedItems[0].getPrevTile();
                if (!tile) { return null; }
                if (marqueeSelectedItems[0].model.get('bDenominator') !== tile.model.get('bDenominator')) {
                    return null;
                }
                return tile;
            }
        },

        /**
        * Handler called the currently focussed view changes
        * @method currentAccViewChangeHandler
        */
        currentAccViewChangeHandler: function () {
            var curAccView = this.getCurrentAccView();

            if (!curAccView) {
                return;
            }

            if (this._tutorialMode) {
                this.updateCtxMenuRowsTut();
            } else {
                this.updateCtxMenuRows();
            }

            if (this.tileSelected) {
                this.setCtxElems([]);
                return;
            }

            if (curAccView && curAccView.accDiv) {
                this.setCtxElems([curAccView.accDiv]);
            }
        },

        /**
        * Updates the context menu rows whenever the focus is changed.
        * @method updateCtxMenuRows
        */
        updateCtxMenuRows: function () {
            var model = this.model,
                isParenthesesAllowed = model.get('isParenthesesAllowed'),
                currentAccTile = this.getCurrentAccView(),
                CTX_ITEM_ID = viewNameSpace.EquationManager.CTX_ITEM_ID,
                TYPE = modelClassNameSpace.TileItem.BinTileType,
                MODE = modelClassNameSpace.EquationManager.MODES,
                mode = this.model.get('mode'),
                self = this,
                type = null,
                rows = [],
                i = 0;

            if (!currentAccTile) {
                return;
            }
            type = currentAccTile.model.get('type');

            this.ignoreAllCtxRows();

            if (mode === MODE.BuildMode) {
                // TODO : fraction exp
                if (isParenthesesAllowed && type !== TYPE.BIG_PARENTHESIS) {
                    if (this.isPosParensEnabled) {
                        rows.push(CTX_ITEM_ID.ADD_POS_PARENS);
                    }
                    if (this.isNegParensEnabled) {
                        rows.push(CTX_ITEM_ID.ADD_NEG_PARENS);
                    }
                    if (currentAccTile.isInsideParentheses()) {
                        rows.push(CTX_ITEM_ID.REMOVE_PARENS);
                    }
                }

                if (this.toShowDeleteRow()) {
                    rows.push(CTX_ITEM_ID.DELETE_TILE);
                }
            } else {
                if (type === TYPE.BASE_EXPONENT || type === TYPE.BASE_ONLY && !currentAccTile.model.isOne()) {
                    if (!this.isNumeratorEmpty()) {
                        rows.push(CTX_ITEM_ID.COMBINE_NUM);
                    }
                    if (!this.isDenominatorEmpty()) {
                        rows.push(CTX_ITEM_ID.COMBINE_DEN);
                    }
                    rows.push(CTX_ITEM_ID.BREAK_BASE);
                }
                if (type === TYPE.BASE_EXPONENT) {
                    rows.push(CTX_ITEM_ID.BREAK_EXP);
                }

                if (type !== TYPE.BASE_ONLY && type !== TYPE.BIG_PARENTHESIS || type === TYPE.BASE_ONLY && !currentAccTile.model.isOne()) {
                    rows.push(CTX_ITEM_ID.REPOS_ACROSS_VINCULUM);
                }
            }

            // show allowed rows
            rows = _.map(rows, function (value, list) {
                return self.idPrefix + value;
            });
            this.tileCtxMenu.editContextMenu(rows, false);
        },

        /**
        * Updates the ctx menu of EM in tutorial based on what is required in the tutorial. It is
        * inferred from dest data, source data, mode etc.
        * @method updateCtxMenuRowsTut
        */
        updateCtxMenuRowsTut: function () {
            var model = this.model,
                isParenthesesAllowed = model.get('isParenthesesAllowed'),
                currentAccTile = this.getCurrentAccView(),
                CTX_ITEM_ID = viewNameSpace.EquationManager.CTX_ITEM_ID,
                TYPE = modelClassNameSpace.TileItem.BinTileType,
                TUT_OP = MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE,
                MODE = modelClassNameSpace.EquationManager.MODES,
                mode = this.model.get('mode'),
                accTutSourceData = this.accTutSourceData,
                accTutDestData = this.accTutDestData,
                sourceView = null,
                sourceType = null,
                destView = null,
                destType = null,
                self = this,
                type = null,
                rows = [],
                i = 0;

            this.ignoreAllCtxRows();

            if (!_.isEmpty(accTutSourceData)) {
                sourceView = accTutSourceData.sourceView;
                sourceType = sourceView.model.get('type');
            }

            if (!_.isEmpty(accTutDestData)) {
                destView = accTutDestData.sourceView;
                destType = destView.model.get('type');
            }

            // For the esoteric accTutSourceData.offset, see tutorial-form-expression.js
            if (accTutSourceData.offset === 1 && accTutSourceData.isBin === false &&
                accTutSourceData.operation === TUT_OP._promptUserToClick && sourceType !== TYPE.BIG_PARENTHESIS &&
                sourceType !== TYPE.PARENTHESIS) {
                if (sourceView.model.get('exponent') === 0 || Math.abs(sourceView.model.get('base')) === 1) {
                    rows.push(CTX_ITEM_ID.APPLY_EXP);
                } else {
                    rows.push(CTX_ITEM_ID.BREAK_EXP);
                }
            } else if (accTutSourceData.offset === 0 && accTutSourceData.isBin === false && accTutSourceData.operation === TUT_OP._promptUserToClick) {
                rows.push(CTX_ITEM_ID.BREAK_BASE);
            } else if (sourceType === TYPE.BASE_EXPONENT && accTutSourceData.operation === TUT_OP._promptUserToDrag && destType === TYPE.BASE_EXPONENT) {
                if (destView.model.get('bDenominator')) {
                    rows.push(CTX_ITEM_ID.COMBINE_DEN);
                } else {
                    rows.push(CTX_ITEM_ID.COMBINE_NUM);
                }
            } else if (sourceType === TYPE.BASE_ONLY && accTutSourceData.operation === TUT_OP._promptUserToDrag &&
                       destType === TYPE.BASE_EXPONENT && !destView.model.get('bDenominator')) {
                rows.push(CTX_ITEM_ID.COMBINE_NUM)
            }

            // show allowed rows
            rows = _.map(rows, function (value, list) {
                return self.idPrefix + value;
            });
            this.tileCtxMenu.editContextMenu(rows, false);
        },

        /**
        * Returns a boolean denoting numerator is empty.
        * @method isNumeratorEmpty
        * @return {Boolean} True if numerator is empty. False otherwise.
        */
        isNumeratorEmpty: function () {
            var TYPE = modelClassNameSpace.TileItem.BinTileType,
                equation = this.equationView,
                innerTiles = null,
                tiles = null;
            if (!equation) {
                return true;
            }
            tiles = equation.model.get('tileArray');
            if (tiles.at(0).get('type') === TYPE.BIG_PARENTHESIS) {
                innerTiles = tiles.at(0).at(0).get('tileArray');
            } else if (tiles.at(0).get('type') === TYPE.FRACTION) {
                innerTiles = tiles.at(0);
            } else {
                innerTiles = tiles;
            }

            return innerTiles.where({ 'bDenominator': false }).length === 0;
        },

        /**
        * Returns a boolean denoting denominator is empty.
        * @method isDenominatorEmpty
        * @return {Boolean} True if denominator is empty. False otherwise.
        */
        isDenominatorEmpty: function () {
            var TYPE = modelClassNameSpace.TileItem.BinTileType,
                equation = this.equationView,
                innerTiles = null,
                tiles = null;
            if (!equation) {
                return true;
            }
            tiles = equation.model.get('tileArray');
            if (tiles.at(0).get('type') === TYPE.BIG_PARENTHESIS) {
                innerTiles = tiles.at(0).at(0).get('tileArray');
            } else if (tiles.at(0).get('type') === TYPE.FRACTION) {
                innerTiles = tiles.at(0);
            } else {
                innerTiles = tiles;
            }

            return innerTiles.where({ 'bDenominator': true }).length === 0;
        },

        /**
        * Ignores and hides all rows of the ctx menu.
        * @method ignoreAllCtxRows
        */
        ignoreAllCtxRows: function () {
            var rows = [],
                CTX_ITEM_ID = viewNameSpace.EquationManager.CTX_ITEM_ID,
                self = this;

            // ignore all elems
            rows = _.map(CTX_ITEM_ID, function (value, key, obj) {
                return self.idPrefix + value;
            });
            this.tileCtxMenu.editContextMenu(rows, true);    // passing true ignores elements
        },

        buildModeSetFocusOnTooltip: function () {
            this.trigger(viewNameSpace.EquationManager.EVENTS.BUILD_SET_FOCUS_ON_TOOLTIP);
        },

        solveModeSetFocusOnTooltip: function () {
            this.trigger(viewNameSpace.EquationManager.EVENTS.SOLVE_SET_FOCUS_ON_TOOLTIP);
        },

        /**
        * Check if the delete tile row is to be shown in the context menu.
        * @method toShowDeleteRow
        * @return {Boolesn} True if delete tile row should be shown. False otherwise.
        */
        toShowDeleteRow: function () {
            var currentAccTile = this.getCurrentAccView(),
                TYPE = modelClassNameSpace.TileItem.BinTileType,
                type = currentAccTile.model.get('type'),
                OPERATION = modelClassNameSpace.EquationComponent.Operations,
                allowAllExponents = (this.model.get('allowedOperation') & OPERATION.PARENTHESIS_EXP_ALL) !== 0;
            // view isEmpty is buggy, so use model isEmpty
            return (type === TYPE.BASE_EXPONENT &&
                   (currentAccTile.accTileType === TYPE.BASE && !currentAccTile.model.isEmpty(TYPE.BASE) ||
                    currentAccTile.accTileType === TYPE.EXPONENT && !currentAccTile.model.isEmpty(TYPE.EXPONENT))) ||
                   (type === TYPE.PARENTHESIS || type === TYPE.BIG_PARENTHESIS) && !currentAccTile.model.isEmpty(TYPE.EXPONENT) && allowAllExponents;
        },

        /**
        * Sets the context menu rows to the ones passed
        * @method setCtxElems
        * @param {Array} Array of jquery elements to set to the context menu elements
        */
        setCtxElems: function (elems) {
            var tileCtxMenu = this.tileCtxMenu;

            tileCtxMenu.enableDisableContextMenu(tileCtxMenu.model.get('elements'), false);
            // This needs to be done because internally, context menu doesn't listen for
            // changes on the elements attribute. So manually disable & enable the elements.
            // Use a copy of the array as context menu changes the passed array.
            tileCtxMenu.enableDisableContextMenu(elems.slice(), false);
            tileCtxMenu.enableDisableContextMenu(elems.slice(), true);
        },

        /**
        * Set acc text for marquee selection
        * @method setMarqueeText
        * @param {Object} Tile whose text is to be set on marquee div.
        * @param {Boolean} Denotes if the tile is added. True if added. False if removed.
        */
        setMarqueeText: function (tile, isAdded) {
            if (!tile) {
                return;
            }
            var cover = this.marqueeView.$marqueeDiv.find('.selected-elements-cover');
            // Using the cover div as an acc div since it's empty and unused and
            // contains no text.
            if (cover) {
                if(this._tutorialMode) {
                    cover.text(tile.getSelfAccString(true) + '.' + this.tutorialCustomTileString);
                }
                else {
                    if (isAdded) {
                        cover.text(tile.getSelfAccString(true) + ' ' + this.getAccMessage('extra-messages', 5));
                    } else {
                        cover.text(tile.getSelfAccString(true) + ' ' + this.getAccMessage('extra-messages', 6));
                    }
                }
            } else {
                cover.text('');
            }
        },

        /**
        * Helper method to remove acc div from the equation manager. Delegates to
        * current acc elem's removeAccDiv method.
        * @method removeCurrentAccDiv
        */
        removeCurrentAccDiv: function () {
            if (this.getCurrentAccView()) {
                this.getCurrentAccView().removeAccDiv();
            }
        }
    }, {

        TILE_CLASS: 'marquee-selected',
        TILE_DUMMY_CLASS: 'base',
        NUMERATOR_MARQUEE_CLASS: 'marquee-numerator',
        DENOMINATOR_MARQUEE_CLASS: 'marquee-denominator',

        EVENTS: {
            'NEW_EXPRESSION_START': 'new-expression-start',
            'ADD_STEP': 'add-step',
            'REMOVE_STEP': 'remove-step',
            'MARQUEE_DRAWN': 'marquee-drawn',
            'MARQUEE_REMOVED': 'marquee-removed',
            'COMMAND_FIRED': 'command-fired',
            'TILE_DRAGGING_START': 'tile-dragging-start',
            'TILE_MOUSE_DOWN': 'tile-mouse-down',
            'MARQUEE_START': 'marquee-start',
            'PARENTHESIS_EXPONENT_CLICK': 'parenthesis-exponent-click',
            'MARQUEE_DRAG_START': 'marquee-drag-start',
            'CHECK_PURE_SIMPLE': 'check-pure-simple',
            'MAX_LIMIT_CROSSED_TOOLTIP': 'max-limit-crossed-tooltip',
            'INVALID_COMBINE_WITHIN_SAME_PARENT': 'invalid-combine-within-same-parent',
            'INVALID_COMBINE_WITHIN_DIFF_PARENT': 'invalid-combine-within-diff-parent',
            'INVALID_COMBINE_FOR_TILE_VALUE_EXCEEDING': 'invalid-combine-for-tile-value-exceeding',
            'INVALID_COMBINE_FOR_BASE_VALUE_EXCEEDING': 'invalid-combine-for-base-value-exceeding',
            'INVALID_COMBINE_FOR_MARQUEE': 'invalid-combine-for-marquee',
            'TUTORIAL_ADD_STEP': 'tutorial-add-step',
            'ATTEMPT_OPERATION': 'attempt-operation',
            'REVERT_START': 'revert-start',
            'REVERT_END': 'revert-end',
            'TOOLTIP_VISIBLE': 'tooltip-visible',
            'TOOLTIP_HIDE': 'tooltip-hide',
            'BUILD_TAB': 'build-tab',
            'BUILD_SHIFT_TAB': 'build-shift-tab',
            'SOLVE_TAB': 'solve-tab',
            'SOLVE_SHIFT_TAB': 'solve-shift-tab',
            'MARQUEE_HIDE_ACC': 'marquee-hide-acc',
            'BUILD_SET_FOCUS_ON_TOOLTIP': 'build-set-focus-on-tooltip',
            'SOLVE_SET_FOCUS_ON_TOOLTIP': 'solve-set-focus-on-tooltip',
            'TUTORIAL_STEP_CHANGE': 'tutorial-step-change',
            'FANNING_ANIMATION_START': 'fanning-animation-start',
            'FANNING_ANIMATION_END': 'fanning-animation-end',
            'TUTORIAL_BREAK_COMMAND': 'tutorial-break-command'
        },

        Operations: {
            ADD_TILE_TO_CANVAS: 1,
            SETUP_DIVISION: 2,
            SETUP_MULTIPLICATION: 4,
            SETUP_PARENTHESIS: 8,
            RAISE_TERM_TO_POWER: 16,
            NEGATIVE_MULTIPLIER: 32,
            REORDER_ADDITION: 64,
            REORDER_MULTIPLICATION: 128,
            DRAG_TERMS_INSIDE_PARENTHESIS: 256,
            MOVE_EXP_BASE_INDEPENDENTLY: 512,
            MOVE_BASE_EXP_UNIT: 1024,
            MOVE_EXP_TO_DENOMINATOR: 2048,
            DELETE_TILE: 4096
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

        CTX_ITEM_ID: {
            DELETE_TILE: 'em-tile-context-menu-0',
            ADD_NEG_PARENS: 'em-tile-context-menu-1',
            ADD_POS_PARENS: 'em-tile-context-menu-2',
            REMOVE_PARENS: 'em-tile-context-menu-3',
            COMBINE_NUM: 'em-tile-context-menu-4',
            COMBINE_DEN: 'em-tile-context-menu-5',
            BREAK_BASE: 'em-tile-context-menu-6',
            BREAK_EXP: 'em-tile-context-menu-7',
            APPLY_EXP: 'em-tile-context-menu-8',
            REPOS_ACROSS_VINCULUM: 'em-tile-context-menu-9'
        },

        DATA: 'data'

    });

})();
