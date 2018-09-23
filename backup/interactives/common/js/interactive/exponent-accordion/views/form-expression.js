(function () {
    'use strict';

    var namespace = MathInteractives.Common.Interactivities.ExponentAccordion.Views,
        modelNameSpace = MathInteractives.Common.Interactivities.ExponentAccordion.Models,
        equationManagerModelNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        equationManagerNamespace = MathInteractives.Common.Components.Views.EquationManager;

    /**
    * Class for EXPONENT Accordion main view ,contains properties and methods of EXPONENT Accordion main view.
    * @class FormExpression
    * @module ExponentAccordion
    * @namespace MathInteractives.Interactivities.ExponentAccordion.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    namespace.FormExpression = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Array of BASE EXPONENT Parent Views
        *
        * @property baseExponentTileViews
        * @type Object
        * @default null
        **/
        baseExponentTileViews: [],

        /**
        * view for random expression button
        *
        * @property randomExpressionBtnView
        * @type Object
        * @default null
        **/
        randomExpressionBtnView: null,

        /**
        * view for done button
        *
        * @property doneButtonView
        * @type Object
        * @default null
        **/
        doneButtonView: null,

        /**
        * view for direction text
        *
        * @property directionBoxView
        * @type Object
        * @default null
        **/
        directionBoxView: null,


        /**
        * view for toggle button
        *
        * @property toggleButtonView
        * @type Object
        * @default null
        **/
        toggleButtonView: null,

        /**
        * reference to the equation manager view
        *
        * @property _equationManager
        * @type Object
        * @default null
        **/
        _equationManager: null,

        /**
        * reference to the form equation manager view
        *
        * @property _formEquationManager
        * @type Object
        * @default null
        **/
        _formEquationManager: null,

        /**
        * Stores how many of the currently dropped tiles have a base and an exponent.
        * an Array of length 2-at 0: filled tiles of numerator, and at 1: filled Tiles of denominator
        *
        * @property tileStatus
        * @type Array
        * @default null
        **/
        tileStatus: [],

        /**
        * Stores integer denoting which level of exponent accordion is being run
        *
        * @property accordionLevel
        * @type Number
        * @default null
        **/
        accordionLevel: 4,
        /**
        * Array of models of dropslots
        *
        * @property dropSlotModelArray
        * @type Object
        * @default null
        **/
        dropSlotModelArray: null,

        /**
        * Array of models of draggables
        *
        * @property dragModelArray
        * @type Object
        * @default null
        **/
        dragModelArray: null,


        //expressionIncompleteTooltip: null,
        combineLikeBasesTooltip: null,
        maxBasesAllowedTooltip: null,
        //maxUniqueBasesLimitReached: null,
        parenthesisExponentTooltip: null,

        /**
        * The base draggables created in the bin
        *
        * @property baseTilesViews
        * @type Array
        * @default null
        **/
        baseTilesViews: null,

        /**
        * The exponent draggables created in the bin
        *
        * @property exponentTilesViews
        * @type Array
        * @default null
        **/
        exponentTilesViews: null,

        /**
        * The base draggables created in the bin
        *
        * @property parenthesisTilesViews
        * @type Array
        * @default null
        **/
        parenthesisTilesViews: null,

        /**
        * A boolean deciding whether the toggle was called by the user or system generated.
            - If want to toggle the button by the system and ONLY update the model then internal toggle = false
        *
        * @property internalToggle
        * @type Boolean
        * @default true
        **/
        internalToggle: true,

        /**
        * A boolean deciding whether whether the reset button was clicked. Also a check for the toggle button click
            - If want to toggle the button, but dont not want to update the model also, the set it to true
        *
        * @property resetClicked
        * @type Boolean
        * @default false
        **/
        resetClicked: false,

        _$elmDroppableRegionParent: null,

        _$elmStartDropRegionMultiplicationContainer: null,

        _$elmStartDropRegionDivisionContainer: null,

        _$elmStartDropRegionMultiplication: null,

        _$elmStartDropRegionDivision: null,

        //_$elmRaisedToPowerImgContainer: null,

        //_$elmRaisedToPowerDroppable: null,

        _$elmFormExpDropRegion: null,

        $elmFormExpressionContainer: null,

        $elmWorkspaceContainer: null,

        tutorialView: null,

        _$elmTutorialContainer: null,

        //animationProgressing: false,

        /**
        * Undo button in the build mode
        *
        * @attribute buildModeUndoButtonView
        * @type Object
        * @default null
        **/
        buildModeUndoButtonView: null,

        /**
        * Undo button in the solve mode
        *
        * @attribute solveModeUndoButtonView
        * @type Object
        * @default null
        **/
        solveModeUndoButtonView: null,

        /**
        * Reset button in the solve mode
        *
        * @attribute solveModeResetButtonView
        * @type Object
        * @default null
        **/
        solveModeResetButtonView: null,

        /**
        * Reset button in the build mode
        *
        * @attribute buildModeResetButtonView
        * @type Object
        * @default null
        **/
        buildModeResetButtonView: null,

        /**
        * Check for tutorial mode is on/off
        *
        * @property _tutorialMode
        * @type Boolean
        * @default false
        */
        _tutorialMode: false,

        _isLoadComplete: false,

        /**
        * Boolean whether the device is a touch device or not.
        * @attribute _isTouch
        * @type Boolean
        * @default null
        **/
        _isTouch: null,

        stopEvent: false,

        /**
        * Contains a list of selectors that are exceptions. Clicking on these divs
        * will not remove the marquee. Clicking anywhere else will remove the marquee
        * @attribute _marqueeRemoveExceptions
        * @type Array
        **/
        _marqueeRemoveExceptions: [
            '.parenthesis-tile-dispenser',
            '.droppable-region-holder',
            '.workspace-scrollable'
        ],

        /**
        * Reference for IE
        *
        * @property _isIE
        * @default false
        * @type Boolean
        */
        _isIE: false,

        /**
        * Reference for IE9
        *
        * @property _isIE9
        * @default false
        * @type Boolean
        */
        _isIE9: false,

        /**
        * To check double click of popup
        *
        * @property isPopupExist
        * @default false
        * @type Boolean
        */
        isPopupExist:false,

        /**
        * Initializes the Form Expression View
        *
        * @method initialize
        **/
        initialize: function () {
            this.accordionLevel = this.model.get('accordionLevel');
            var self = this,
                checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck,
                ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;
            this._isIE9 = (checkBrowser.isIE === true && checkBrowser.browserVersion === '9.0');
            this._isIE = (checkBrowser.isIE === true || checkBrowser.isIE11 === true);
            this.initializeDefaultProperties();
            this.loadScreen('direction-text-screen');
            this.loadScreen('form-expression-screen');
            this._cacheDomElements();
            this._renderDirectionText();
            this.createFormEquationManager();
            this.model.on('change:clearAllData', this.fireTryAnother, this);
            this.model.on('change:dataTabTryAnotherClick', this.fireTryAnother, this);
            this.model.on('change:tryAnotherBtnStatus', this.tryAnotherBtnStatus, this);
            this.model.on('change:raisedToPower', this.raisedToPowerChange, this);
            this.model.on('change:tileDropped', this.tileDroppedChangeAccessibilityText, this);
            this.listenTo(this.model, 'change:exploreView', this.updateAccessibilityTextForActivityArea, this);
            this.listenTo(this.model, 'change:buildModeDoneButtonStatus', this.updateDoneButtonState, this);

            this.tryAnotherBtnStatus(this.model, this.model.get('tryAnotherBtnStatus'));
            this.render();
            this.loadScreen('tooltip-screen');

            this._bindEventsOnButtons();
            this.loadScreen('swipe-region-screen');
            this._handleTouchScroll();
            //this._fractionModeChange(this.model.get('fractionMode'));

            this._createContextMenu();

        },

        _cacheDomElements: function () {
            this.$elmFormExpressionContainer = this.$('.form-expression-container');
            this.$elmWorkspaceContainer = this.$('#' + this.idPrefix + 'workspace-container');
            this._$elmStartDropRegionMultiplicationContainer = this.$('#' + this.idPrefix + 'droppable-region-start-multiplication');
            this._$elmStartDropRegionDivisionContainer = this.$('#' + this.idPrefix + 'droppable-region-start-division');
            this._$elmStartDropRegionMultiplication = this.$('#' + this.idPrefix + 'multiplication-img');
            this._$elmStartDropRegionDivision = this.$('#' + this.idPrefix + 'division-img');
            //this._$elmRaisedToPowerImgContainer = this.$('#' + this.idPrefix + 'raised-to-power-container');
            //this._$elmRaisedToPowerDroppable = this.$('#' + this.idPrefix + 'raised-to-power-img');
            this._$elmStartHorizontalSaperator = this.$('.horizontal-saperator');
            this._$elmFormExpDropRegion = this.$('#' + this.idPrefix + 'droppable-region');
            this._$elmTutorialContainer = this.$('#' + this.idPrefix + 'tutorial-container');
            this._$elmParanthesesDispenserContainer = this.$('.parenthesis-tile-dispenser-container');
            this._$elmToggleBtnContainer = this.$('.raised-to-power-toggle-button-container');
            this._$animationDiv = this.$('.animation-progress-div').hide();
            this._$angleDoubleLeft = this.$('.double-angle-left');
            this._$angleDoubleRight = this.$('.double-angle-right');
            this._$droppableTitleText = this.$('.droppable-region-title-text');
        },

        /**
        * Renders main view
        *
        * @method render
        * @public
        **/
        render: function () {
            var currentViewClass = modelNameSpace.ExponentAccordion.CURRENT_VIEW,
                exploreViewClass = modelNameSpace.ExponentAccordion.EXPLORE_VIEW,
                equationData = this.model.get('equationData');
            this._renderBackground();
            this._createAllDraggableTiles();
            this._createFormExpressionDroppable();
            this._renderButtons();
            this._$elmFormExpDropRegion.hide();
            this._$droppableTitleText.hide();
            this.$elmFormExpressionContainer.show();
            this.$elmWorkspaceContainer.hide();
            this._createTooltips();
            //this.loadScreen('bin-tiles-screen');
            if (equationData === null) {
                this.model.set('exploreView', exploreViewClass.FORMATION);
            }
            this.player.bindTabChange(function (data) {
                this.model.set('currentTab', 2);
                this.model.set('currentView', currentViewClass.EXPLORE);
                if (!this._isLoadComplete && equationData !== null) {
                    this._loadFromSaveState();
                }
                this._isLoadComplete = true;

                this._updatesFocusRects();

                this.unloadScreen('bin-tiles-screen');
                this.loadScreen('bin-tiles-screen');
                this.tileDroppedChangeAccessibilityText(this.model, this.model.get('tileDropped'));
                this.updateAccessibilityTextForActivityArea(this.model, this.model.get('exploreView'));
                this._bindAccEvents();


                this.updateFocusRect('direction-text-container-direction-text-text');
                if (this.model.get('expolreBtnClick') || this.model.get('backButtonClick') || this.model.get('dataTabTryAnotherClick')) {
                    this.setFocus('header-subtitle', 20);
                }
                else {
                    this.setFocus('direction-text-container-direction-text-text');
                }
                this.model.set('backButtonClick', false);
                this.model.set('expolreBtnClick', false);
            }, this, 2);
        },

        _updatesFocusRects: function () {
            this.updateFocusRect('base-tile-dispenser-container');
            this.updateFocusRect('exponents-tile-dispenser-container');
            this.updateFocusRect('parenthesis-tile-dispenser-container');

            this.setTabIndex('main-activity-area-container', 504);

            this.enableTab('base-tile-dispenser-container', true);
            this.enableTab('exponents-tile-dispenser-container', true);
            this.enableTab('parenthesis-tile-dispenser-container', true);
        },


        _createContextMenu: function () {
            var draggableBaseTiles = this.$('.base-draggable-tiles'),
                draggableExponentTiles = this.$('.exponent-draggable-tiles'),
                draggableParenthesisTiles = this.$('.parenthesis-draggable-tiles'),
                draggableTiles = this.$('.base-draggable-tiles, .exponent-draggable-tiles, .parenthesis-draggable-tiles'), j,
              self = this,
            _CONTEXTMENU = MathInteractives.global.ContextMenu,
            strHideEvent = _CONTEXTMENU.CONTEXTMENU_HIDE,
            strSelectEvent = _CONTEXTMENU.CONTEXTMENU_SELECT, accordionLevel = this.model.get('accordionLevel');

            var option = {
                el: this.player.$el,
                prefix: this.idPrefix,
                elements: [],
                screenId: 'bin-base-tiles-context-menu',
                contextMenuCount: 4,
                manager: this.manager,
                thisView: this
            };
            for (j = 0; j < draggableBaseTiles.length; j++) {
                option.elements.push($(draggableBaseTiles[j]));
            }
            this.binBaseTilesContextMenuView = _CONTEXTMENU.initContextMenu(option);

            option.screenId = 'bin-exponent-tiles-context-menu';
            option.elements = [];
            for (j = 0; j < draggableExponentTiles.length; j++) {
                option.elements.push($(draggableExponentTiles[j]));
            }
            option.contextMenuCount = 5;
            this.binExponentTilesContextMenuView = _CONTEXTMENU.initContextMenu(option);

            option.screenId = 'bin-parenthesis-tiles-context-menu';
            option.elements = [];
            for (j = 0; j < draggableParenthesisTiles.length; j++) {
                option.elements.push($(draggableParenthesisTiles[j]));
            }
            option.contextMenuCount = 4;
            this.binParenthesisTilesContextMenuView = _CONTEXTMENU.initContextMenu(option);

            this._updateContextMenu(true);
            //this._editContextMenus(accordionLevel);
            this._contextMenuSelectEvent(draggableTiles, strSelectEvent);

            draggableTiles.off(strHideEvent).on(strHideEvent, function (event, ui) {
                self.setFocus(event.target.id.replace(self.idPrefix, ''));
            });
        },

        _contextMenuSelectEvent: function (draggableTiles, strSelectEvent) {
            var self = this;
            draggableTiles.off(strSelectEvent).on(strSelectEvent, function (event, ui) {
                var currentTargetId = ui.currentTarget.id, $selectedTile = $(event.currentTarget),
                    contextMenuId = parseInt(currentTargetId.substring(currentTargetId.lastIndexOf('-') + 1), 10);
                switch (contextMenuId) {
                    case 0:
                        //Negate Tile
                        var target = event.currentTarget, $tile = $(target);
                        self._tileClickEvent(self, $tile);
                        self.setFocus(target.id.replace(self.idPrefix, ''), 600);
                        break;
                    case 1:
                        //Multiplication
                        if (self._formEquationManager.$el.css('display') !== 'none') {
                            self._formEquationManager.selectedTile = $selectedTile;
                            self._dropBinTileUsingContextMenu(false);
                        }
                        else {
                            var $droppable = self._$elmStartDropRegionMultiplication;
                            self._onTileDropForAcc(event, ui, $droppable, false, '0', $selectedTile);
                        }
                        break;
                    case 2:
                        //Division Numerator
                        if (self._formEquationManager.$el.css('display') === 'none') {
                            var $droppable = self._$elmStartDropRegionDivision;
                            self._onTileDropForAcc(event, ui, $droppable, true, '0.0', $selectedTile);
                        } else {
                            self._formEquationManager.selectedTile = $selectedTile;
                            self._dropBinTileUsingContextMenu(false);
                        }
                        break;
                    case 3:
                        //Division Denominator
                        if (self._formEquationManager.$el.css('display') === 'none') {
                            var $droppable = self._$elmStartDropRegionDivision;
                            self._onTileDropForAcc(event, ui, $droppable, true, '0.1', $selectedTile);
                        } else {
                            self._formEquationManager.selectedTile = $selectedTile;
                            self._dropBinTileUsingContextMenu(true);
                        }
                        break;
                    case 4:
                        //Big Parenthesis Exponent
                        self._formEquationManager.selectedTile = $selectedTile;
                        self._dropBinTileUsingContextMenu(false, true);
                        break;
                }
            });
        },

        /**
         * update accessibility text for activity area
         * @method updateAccessibilityTextForActivityArea
         * @public
         *
         * @param {Object} model   The view's model
         * @param {String} value   The current screen
         * @param {Object} options The options passed along
         */
        updateAccessibilityTextForActivityArea: function updateAccessibilityTextForActivityArea (model, value, options) {
            if(value === modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE) {
                this.changeAccMessage('main-activity-area-container', 1);
            }
        },

        /**
         * This method is called every time the screen is loaded or when the value of tile
         * dropped has changes in the model in order to get the correct accessibility text
         *
         * @method tileDroppedChangeAccessibilityText
         * @public
         *
         * @param {Object}  model   The model in which the attribute has changed
         * @param {Boolean} value   Whether a tile has been dropped or not on the equation view
         * @param {Object}  options Options
         */
        tileDroppedChangeAccessibilityText: function tileDroppedChangeAccessibilityText (model, value, options) {
            if(value === modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE) {
                return;
            }
            var equationCategoryMain = model.get('buildModeDivisionMode') ? this.getAccMessage('extra-messages', 1) : this.getAccMessage('extra-messages', 0),
                equationCategorySub = model.get('buildModeDivisionMode') ? this.getAccMessage('extra-messages', 3) : this.getAccMessage('extra-messages', 2);

            if(value === true) {
                this.setAccMessage('main-activity-area-container', this.getAccMessage('main-activity-area-container', 0)+this.getAccMessage('main-activity-area-container', 2, [equationCategoryMain])+this.getAccMessage('main-activity-area-container', 4));
                this.changeAccMessage('parenthesis-tile-dispenser-container', 1, [equationCategorySub]);
                if(model.get('accordionLevel') > 2) {
                    this.setAccMessage('exponents-tile-dispenser-container', this.getAccMessage('exponents-tile-dispenser-container', 1, [equationCategorySub])+this.getAccMessage('exponents-tile-dispenser-container', 2));
                    this.setAccMessage('base-tile-dispenser-container', this.getAccMessage('base-tile-dispenser-container', 1, [equationCategorySub])+this.getAccMessage('base-tile-dispenser-container', 2));
                }
                else {
                    this.setAccMessage('exponents-tile-dispenser-container', this.getAccMessage('exponents-tile-dispenser-container', 0, [equationCategorySub])+this.getAccMessage('exponents-tile-dispenser-container', 2));
                    this.setAccMessage('base-tile-dispenser-container', this.getAccMessage('base-tile-dispenser-container', 0, [equationCategorySub])+this.getAccMessage('base-tile-dispenser-container', 2));
                }
            }
            else {
                this.setAccMessage('main-activity-area-container', this.getAccMessage('main-activity-area-container', 0)+this.getAccMessage('main-activity-area-container', 3)+this.getAccMessage('main-activity-area-container', 4));
                this.changeAccMessage('parenthesis-tile-dispenser-container', 0);

                this.setAccMessage('exponents-tile-dispenser-container', this.getAccMessage('exponents-tile-dispenser-container', 0)+this.getAccMessage('exponents-tile-dispenser-container', 2));
                this.setAccMessage('base-tile-dispenser-container', this.getAccMessage('base-tile-dispenser-container', 0)+this.getAccMessage('base-tile-dispenser-container', 2));
            }
        },

        raisedToPowerChange: function (model, value, options) {
            if (value) {
                this._updateContextMenu();
                this.setAccMessage('raised-to-power-toggle-button-toggle-button-containment', this.getAccMessage('toggle-button-text', 1));
                if (this._formEquationManager.equationView) {
                    this._formEquationManager.equationView.tileDroppedString = this.getMessage('base-exp-pair', 21);
                }
            }
            else {
                this._updateContextMenu();
                this.setAccMessage('raised-to-power-toggle-button-toggle-button-containment', this.getAccMessage('toggle-button-text', 2));
                if (this._formEquationManager.equationView) {
                    this._formEquationManager.equationView.tileDroppedString = this.getMessage('base-exp-pair', 22);
                }
            }
            this._enableDisableTabsOfBinTiles('parenthesis', false);
        },


        //_editContextMenus: function _editContextMenus(accordionLevel) {
        //    switch (accordionLevel) {
        //        case 1:
        //            this.binBaseTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-base-tiles-context-menu-0', this.idPrefix + 'bin-base-tiles-context-menu-2', this.idPrefix + 'bin-base-tiles-context-menu-3'], true);
        //            this.binExponentTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-exponent-tiles-context-menu-0', this.idPrefix + 'bin-exponent-tiles-context-menu-2', this.idPrefix + 'bin-exponent-tiles-context-menu-3'], true);
        //            break;
        //        case 2:
        //            this.binBaseTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-base-tiles-context-menu-2', this.idPrefix + 'bin-base-tiles-context-menu-3'], true);
        //            this.binExponentTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-exponent-tiles-context-menu-0', this.idPrefix + 'bin-exponent-tiles-context-menu-2', this.idPrefix + 'bin-exponent-tiles-context-menu-3'], true);
        //            break;
        //        case 3: case 4:
        //            this.binExponentTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-exponent-tiles-context-menu-0'], true);
        //            break;
        //            //case 5:
        //            //    break;
        //    }
        //},

        /**
             * To load data and render it if loading from saved state
             *
             * @method _loadFromSaveState
             * @private
             */

        _loadFromSaveState: function _loadFromSaveState() {
            var currentViewClass = modelNameSpace.ExponentAccordion.EXPLORE_VIEW,
                disabledState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED,
                stepCount = this.model.get('stepCount');
            if (this.model.get('exploreView') === currentViewClass.FORMATION || this.model.get('previousView') === currentViewClass.FORMATION) {
                this._setNewEquation(this._formEquationManager, this.$('#' + this.idPrefix + 'form-expression-area'), JSON.parse(JSON.stringify(this.model.get('equationData'))), true, true);
                if (this.model.get('buildModeDivisionMode') === false) {
                    this._$elmFormExpDropRegion.removeClass('division').addClass('multiplication');
                }
                else {
                    this._$elmFormExpDropRegion.removeClass('multiplication').addClass('division');
                }
                this._showHideFormEquationView(true);
                this._formEquationManager.getEquationStatusModifyBin();
                this._setUndoResetButtonStatus();
                this._formEquationManager.removeMarquee();
                //this._setDirectionTextOfExplore(modelNameSpace.ExponentAccordion.EXPLORE_VIEW.FORMATION);
            }
            else if (this.model.get('exploreView') === currentViewClass.WORKSPACE || this.model.get('previousView') === currentViewClass.WORKSPACE) {
                this._showHideEquationManager(true);
                this._createEquationManager();
                this._setNewEquation(this._equationManager,
                                     this.$('#' + this.idPrefix + 'workspace-expression-area'),
                                     this.model.get('equationDataSolveMode'),
                                     true, true);
                this._renderOriginalExpression();
                this._equationManager.showMarquee();
                //this._setDirectionTextOfExplore(modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE);
                if (stepCount === 0) {
                    //this.solveModeResetButtonView.setButtonState(disabledState);
                    this._disableEnableButtons(this.solveModeResetButtonView, false);
                }
                //this.solveModeUndoButtonView.setButtonState(disabledState);
                this._disableEnableButtons(this.solveModeUndoButtonView, false);
            }
        },

        _createTooltips: function _createTooltips() {
            //this._expressionIncompleteTooltip();
            this._maxBasesAllowedTooltip();
            this._combineLikeBasesTooltip();
        },

        /**
        * Computes and returns the bin element at passed index location.
        *
        * @method _getBinElementFromIndex
        * @param indexString {String} The index string used to locate the bin element.
        * @return {Object} The bin element.
        */
        _getBinElementFromIndex: function _getBinElementFromIndex(indexString) {
            var subStr = parseInt(indexString.substring(0, 1)),
                isTile = false,
                firstSeperatorIndex,
                returnObj = {};
            returnObj.element = this._getBinElementViewFromIndex(indexString);
            if (indexString.length > 1) {
                indexString = indexString.substring(2, indexString.length);
                switch (subStr) {
                    case 0: // Base tiles
                        returnObj.groupTitle = namespace.FormExpression.BASE_TYPE;
                        returnObj.isTile = true;
                        break;
                    case 1: // Exponent tiles
                        returnObj.groupTitle = namespace.FormExpression.EXPONENT_TYPE;
                        returnObj.isTile = true;
                        break;
                    case 2: // Parenthesis tiles
                        returnObj.groupTitle = namespace.FormExpression.PARENTHESIS_TYPE;
                        returnObj.isTile = true;
                        break;
                    case 3: // Other components like buttons
                        firstSeperatorIndex = indexString.indexOf('.');
                        if (firstSeperatorIndex > 0) {
                            subStr = indexString.substring(firstSeperatorIndex + 1);
                            returnObj.toggleOn = (subStr !== '0');
                            indexString = indexString.substring(0, firstSeperatorIndex);
                        }
                        if (indexString === '0') {
                            returnObj.groupTitle = namespace.FormExpression.RAISE_FRACTION;
                            returnObj.isToggle = true;
                        }
                        break;
                }
            }
            return returnObj;
        },

        /**
        * Returns the element's view whose index is passed as a parameter.
        *
        * @method _getBinElementViewFromIndex
        * @param indexString {String} The index of the element.
        */
        _getBinElementViewFromIndex: function (indexString) {
            var firstSeperatorIndex = indexString.indexOf('.'),
                indexStringLength = indexString.length,
                subStr = parseInt(indexString.substring(0, firstSeperatorIndex)),
                binElement = null;

            if (indexStringLength > 1) {
                indexString = indexString.substring(firstSeperatorIndex + 1, indexStringLength);
                switch (subStr) {
                    case 0: // Base tiles
                        binElement = this.baseTilesViews.dragButtonViews[indexString];
                        break;
                    case 1: // Exponent tiles
                        binElement = this.exponentTilesViews.dragButtonViews[indexString];
                        break;
                    case 2: // Parenthesis tiles
                        binElement = this.parenthesisTilesViews.dragButtonViews[indexString];
                        break;
                    case 3: // Buttons
                        firstSeperatorIndex = indexString.indexOf('.');
                        if (firstSeperatorIndex > 0) {
                            indexStringLength = indexString.length;
                            indexString = parseInt(indexString.substring(0, firstSeperatorIndex));
                        }
                        binElement = this._getButtonFromIndex(indexString);
                        break;
                }
            }
            return binElement;
        },

        /**
        * Returns the button's el whose index is passed as a parameter.
        *
        * @method _getButtonFromIndex
        * @param indexString {String} The index of the button.
        */
        _getButtonFromIndex: function _getButtonFromIndex(indexString) {
            var subStr = Number(indexString),
                buttonViewInstance = null;
            switch (subStr) {
                case 4: // done button
                    buttonViewInstance = this.doneButtonView;
                    break;
                case 3: // random button
                    buttonViewInstance = this.randomExpressionBtnView;
                    break;
                case 2: // reset button
                    buttonViewInstance = this.buildModeResetButtonView;
                    break;
                case 1: // undo button
                    buttonViewInstance = this.buildModeUndoButtonView;
                    break;
                case 0: // fraction button
                    buttonViewInstance = this.toggleButtonView;
                    break;
                case 7: // view data button
                    buttonViewInstance = this.solveModeViewDataButtonView;
                    break;
                case 6: // solve mode reset button
                    buttonViewInstance = this.solveModeResetButtonView;
                    break;
                case 5: // solve mode undo button
                    buttonViewInstance = this.solveModeUndoButtonView;
                    break;
            }
            return buttonViewInstance;
        },

        /**
        * Calculates the offset for mouse event for the passed view's el depending on the offset enum passed.
        *
        * @method _getBinElementOffsetFromView
        * @param elementView {Object} View instance of the bin element.
        * @param offset {Number} The offset enum - 0: center, 8: toggle switch off, 9: toggle switch on.
        * @return {Object} The element and the offset calculated.
        * @private
        */
        _getBinElementOffsetFromView: function _getBinElementOffsetFromView(elementView, offset) {
            return this._getElementOffsetFromElement(elementView.el, offset);
        },

        _getElementOffsetFromElement: function (element, offset) {
            offset = Number(offset);
            var elementRect = element.getBoundingClientRect(),
                top = elementRect.top,
                left = elementRect.left,
                height = elementRect.height,
                width = elementRect.width,
                offsetX = 0,
                offsetY = 0;
            switch (offset) {
                case 8: // toggle off
                    offsetX += width / 4;
                    offsetY += height / 2;
                    break;
                case 9: // toggle on
                    offsetX += width / 4 * 3;
                    offsetY += height / 2;
                    break;
                default: // center
                    offsetX += width / 2;
                    offsetY += height / 2;
                    break;
            }
            return {
                x: offsetX,
                y: offsetY
            };
        },

        /**
        * Create a list of data as per requirement
        * Syntax: Bin=0/EquationManager=1
        *
        * @method _getListOfElements
        * @param {Array} arrIndex Array of index given in config file
        * @returns {Object} Returns object which contains array of index for bin and equationManager
        */
        _getListOfElements: function _getListOfElements(arrIndex) {
            var arrLength = 0,
                returnList = {},
                index,
                elementIndex;
            returnList.bin = [];
            returnList.equationManager = [];
            if (arrIndex) {
                arrLength = arrIndex.length;
                for (var i = 0; i < arrLength; i++) {
                    index = arrIndex[i].split(namespace.FormExpression.SEPERATOR_ELEMENT_INDEX);
                    if (index[1]) {
                        elementIndex = index[1];

                        if (index[0] === '0') {
                            returnList.bin.push(elementIndex);
                        }
                        else {
                            returnList.equationManager.push(elementIndex);
                        }
                    }
                }
            }
            return returnList;
        },

        /**
        * Validate target element
        * Check its presence in DOM
        *
        * @method _validTargetElement
        * @param {String} targetElementIdx Target element index with # seperate
        * @private
        */
        _validTargetElement: function _validTargetElement(targetElementIdx) {
            // Here, check for valid target element
            if (targetElementIdx) {
                return true;
            }
            return false;
        },

        /**
        * Disables all buttons.
        *
        * @method _disableAllButtons
        */
        _disableAllButtons: function _disableAllButtons() {
            var buttonDisabledState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this.randomExpressionBtnView.setButtonState(buttonDisabledState);
            this.doneButtonView.setButtonState(buttonDisabledState);
            this.buildModeUndoButtonView.setButtonState(buttonDisabledState);
            this.buildModeResetButtonView.setButtonState(buttonDisabledState);
            this.solveModeUndoButtonView.setButtonState(buttonDisabledState);
            this.solveModeResetButtonView.setButtonState(buttonDisabledState);
            this.solveModeViewDataButtonView.setButtonState(buttonDisabledState);
        },

        createFormEquationManager: function () {
            var strDroppables, options;
            strDroppables = '*';
            options = {
                'player': this.player,
                'allowedOperation': this.model.get('allowedOperation'),
                'maxPrimeLimit': this.model.get('maxPrimeLimit'),
                'fractionMode': this.model.get('fractionMode'),
                isParenthesesAllowed: this.model.get('isParenthesesAllowed'),
                adjustContainment: true,
                mode: equationManagerModelNameSpace.EquationManager.MODES.BuildMode,
                buildModeParenthesisSize: namespace.FormExpression.BUILD_MODE_PARENTHESIS_SIZE
            };
            this._formEquationManager = new namespace.FormExpressionEquationManager({
                element: this.$('#' + this.idPrefix + 'droppable-region'),
                draggableContainment: this.$('#' + this.idPrefix + 'form-expression-draggable-containment'),
                strDroppables: strDroppables,
                marqueeDiv: '#' + this.idPrefix + 'droppable-region-holder',
                model: new equationManagerModelNameSpace.EquationManager(options),
                tutorialMode: false,
                player: this.player,
                filePath: this.filePath,
                manager: this.manager
            });
            this._attchBinEvents();
        },

        _createFormExpressionDroppable: function _createFormExpressionDroppable() {
            var self = this,
                binTileTypes = equationManagerModelNameSpace.TileItem.BinTileType;

            this._$elmStartDropRegionMultiplication.droppable({
                accept: function (ui) {
                    var tileType = ui.data('tile-type');
                    if (tileType === binTileTypes.PARENTHESIS) {
                        return false;
                    }
                    return true;
                },
                drop: function (event, ui) {
                    self._onTileDrop(event, ui, this, false);
                },
                hoverClass: 'drop-over'
            });

            this._$elmStartDropRegionDivision.droppable({
                accept: function (ui) {
                    var tileType = ui.data('tile-type');
                    if (tileType === binTileTypes.PARENTHESIS) {
                        return false;
                    }
                    return true;
                },
                drop: function (event, ui) {
                    self._onTileDrop(event, ui, this, true);
                },
                hoverClass: 'drop-over'
            });

            /*this._$elmRaisedToPowerDroppable.droppable({
                accept: function (ui) {
                    var tileType = ui.data('tile-type');
                    if (tileType === binTileTypes.PARENTHESIS) {
                        return false;
                    }
                    return true;
                },
                drop: function (event, ui) {
                    self._onTileDrop(event, ui, this, true);
                },
                hoverClass: 'drop-over'
            });*/
        },

        /**
        * generates done and random exoression buttons
        *
        * @method _renderButtons
        * @private
        **/
        _renderButtons: function _renderButtons() {

            var ButtonClass, buttonProperties;
            ButtonClass = MathInteractives.global.Theme2.Button;
            buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'random-expression-button',
                    text: this.getMessage('random-expression-button-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'btn-yellow',
                    textColor: '#222222'
                }
            };
            this.randomExpressionBtnView = new ButtonClass.generateButton(buttonProperties);

            buttonProperties.data.id = this.idPrefix + 'done-button';
            buttonProperties.data.text = this.getMessage('done-button-text', 0);
            this.doneButtonView = new ButtonClass.generateButton(buttonProperties);
            //this._toggleDoneButton(this.model.get('buildModeDoneButtonStatus'));

            this._createBuildModeUndoButton();
            this._createBuildModeResetButton();
            this._createSolveModeUndoButton();
            this._createSolveModeResetButton();
            this._createSolveModeViewDataButton();
            this.loadScreen('build-mode-buttons-screen');

            this._disableEnableButtons(this.doneButtonView, this.model.get('buildModeDoneButtonStatus'));
            this._disableEnableButtons(this.buildModeUndoButtonView, false);
            this._disableEnableButtons(this.buildModeResetButtonView, false);
        },


        _createSolveModeUndoButton: function _createSolveModeUndoButton() {
            var self = this;
            this.solveModeUndoButtonView = new MathInteractives.global.Theme2.Button.generateButton({
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'solve-mode-undo-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                    'baseClass': 'btn-yellow',
                    'height': 38,
                    'tooltipText': this.getMessage('button-tooltip-text', 'undo'),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    'icon': {
                        'faClass': self.filePath.getFontAwesomeClass('reply'),
                        'fontColor': '#222222',
                        'fontSize': 22,
                        'fontWeight': 'bold',
                        'width': 35,
                        'height': 30
                    }
                }
            });
            return this;
        },

        _createSolveModeResetButton: function _createSolveModeResetButton() {
            var self = this;
            this.solveModeResetButtonView = new MathInteractives.global.Theme2.Button.generateButton({
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'solve-mode-reset-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                    'baseClass': 'btn-yellow',
                    'height': 38,
                    'tooltipText': this.getMessage('button-tooltip-text', 'reset'),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    'icon': {
                        'faClass': self.filePath.getFontAwesomeClass('reset'),
                        'fontColor': '#222222',
                        'fontSize': 22,
                        'fontWeight': 'bold',
                        'width': 35,
                        'height': 30
                    }
                }
            });
            return this;
        },


        _createSolveModeViewDataButton: function _createSolveModeViewDataButton() {
            var ButtonClass, buttonProperties;
            ButtonClass = MathInteractives.global.Theme2.Button;
            buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'view-data-button',
                    text: this.getMessage('view-data-button-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'btn-yellow',
                    textColor: '#222222'
                }
            };
            this.solveModeViewDataButtonView = new ButtonClass.generateButton(buttonProperties);

        },



        /**
        * Creates the undo button in the Build mode
        *
        * @method _createBuildModeUndoButton
        * @private
        * @chainable
        */
        _createBuildModeUndoButton: function () {
            var self = this;
            this.buildModeUndoButtonView = new MathInteractives.global.Theme2.Button.generateButton({
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'build-mode-undo-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                    'baseClass': 'btn-yellow',
                    'height': 38,
                    'tooltipText': this.getMessage('button-tooltip-text', 'undo'),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    'icon': {
                        'faClass': self.filePath.getFontAwesomeClass('reply'),
                        'fontColor': '#222222',
                        'fontSize': 22,
                        'fontWeight': 'bold',
                        'height': 30,
                        'width': 35
                    }
                }
            });
            //this.buildModeUndoButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);

            return this;
        },

        /**
        * Creates the reset button in the Build mode
        *
        * @method _createBuildModeResetButton
        * @private
        * @chainable
        */
        _createBuildModeResetButton: function () {
            var self = this;
            this.buildModeResetButtonView = new MathInteractives.global.Theme2.Button.generateButton({
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'build-mode-reset-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                    'baseClass': 'btn-yellow',
                    'height': 38,
                    'tooltipText': this.getMessage('button-tooltip-text', 'reset'),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    'icon': {
                        'faClass': self.filePath.getFontAwesomeClass('reset'),
                        'fontColor': '#222222',
                        'fontSize': 22,
                        'fontWeight': 'bold',
                        'width': 35,
                        'height': 30
                    }
                }
            });
            //this.buildModeResetButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);

            return this;
        },

        _createEquationManager: function () {
            var options = {
                allowedOperation: this.model.get('allowedOperation'),
                maxPrimeLimit: this.model.get('maxPrimeLimit'),
                allowManagerLevelOperations: 4095,
                player: this.player,
                filePath: this.filePath,
                fractionMode: this.model.get('fractionMode'),
                isParenthesesAllowed: this.model.get('isParenthesesAllowed'),
                adjustContainment: true,
                numOfTilesInNumDen: this.model.get('numOfTilesInNumDen'),
                mode: equationManagerModelNameSpace.EquationManager.MODES.SolveMode
            };
            this._equationManager = new namespace.EquationManager({
                model: new equationManagerModelNameSpace.EquationManager(options),
                element: this.$('#' + this.idPrefix + 'workspace-scrollable'),
                draggableContainment: this.$('#' + this.idPrefix + 'workspace-draggable-containment'),
                tutorialMode: false,
                player: this.player,
                filePath: this.filePath,
                manager: this.manager
            });

            this._isIE && this._equationManager.$el.addClass('ie');
            this._attachDataEvents();
        },

        _setNewEquation: function _setNewEquation(equationManager, equationViewContainer, equationJSON, bRender, isSavedStateLoad) {
            var data = {};
            data = {
                cmdFactoryData: {
                    allowedOperation: this.model.get('allowedOperation'),
                    maxPrimeLimit: this.model.get('maxPrimeLimit'),
                    undoStack: []
                },
                equationData: equationJSON,
                equationViewContainer: equationViewContainer
            };

            data.player = this.player;
            data.filePath = this.filePath;
            data.manager = this.manager;
            data.idPrefix = this.idPrefix;
            equationManager.setData(data, isSavedStateLoad);
            if (bRender) {
                equationManager.render();
            }
            this._enableDisableEquationViewDroppable(equationManager);
        },

        /**
        * Enables / disables the equation view droppable depending on the mode and division-mode boolean.
        *
        * @method _enableDisableEquationViewDroppable
        * @param equationManager {Object} Equation manager view instance
        * @private
        */
        _enableDisableEquationViewDroppable: function (equationManager) {
            var equationManagerModeTypes = equationManagerModelNameSpace.EquationManager.MODES;
            if (equationManager.model.get('mode') === equationManagerModeTypes.BuildMode) {
                if (this.model.get('buildModeDivisionMode')) {
                    equationManager.enableDroppableEquationView(false);
                }
                else {
                    equationManager.enableDroppableEquationView(true);
                }
            }
            else {
                if (this.model.get('solveModeDivisionMode')) {
                    equationManager.enableDroppableEquationView(false);
                }
                else {
                    equationManager.enableDroppableEquationView(true);
                }
            }
        },

        /**
         *
         * @method _createAllDraggableTiles
         * @private
         **/
        _createAllDraggableTiles: function _createAllDraggableTiles() {
            var model = this.model,
                allowedCase = model.get('allowedCases'),
                accordionLevel = model.get('accordionLevel'),
                ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;

            this._$elmStartDropRegionDivisionContainer.hide();
            this._$elmStartHorizontalSaperator.hide();
            //this._$elmRaisedToPowerImgContainer.hide();
            this._generateBaseTiles();

            this._generateExponentTiles();

            if (allowedCase & ExponentAccordionModel.IS_PARENTHESIS_ALLOWED) {
                this._generateParanthesesTile();
                this.disabledParIndexes = [0, 1];
                this._disableParenthesis(this.disabledParIndexes);
            }
            else {
                this._$elmParanthesesDispenserContainer.hide();
            }


            if (allowedCase & ExponentAccordionModel.IS_DIVISION_ALLOWED) {
                this._$elmStartDropRegionDivisionContainer.show();
                this._$elmStartHorizontalSaperator.show();
            }

            if (allowedCase & ExponentAccordionModel.IS_RAISED_TO_POWER_ALLOWED) {
                this._generateRaisedToPowerToggle();
                //this._$elmStartDropRegionMultiplicationContainer.hide();
                //this._$elmRaisedToPowerImgContainer.hide();
                //this._$elmStartDropRegionDivisionContainer.show().addClass('align-center');
            }
            else {
                this._$elmToggleBtnContainer.hide();
            }
        },

        _generateBaseTiles: function _generateBaseTiles() {
            var idPrefix = this.idPrefix, model = this.model, minTileValue, maxTileValue, tileNumberArray, colorType, height, width, type, baseClass,
                allowedCase = this.model.get('allowedCases'),
                tileTexts,
                tileType = equationManagerModelNameSpace.TileItem.BinTileType.BASE,
                ExponentAccordionModel = modelNameSpace.ExponentAccordion, tileObjects;
            minTileValue = namespace.FormExpression.BASE_TILE_MIN_VALUE;
            maxTileValue = namespace.FormExpression.BASE_TILE_MAX_VALUE;
            tileNumberArray = this._getArrayInRange(minTileValue, maxTileValue);
            tileObjects = this._getNegationsFromModel(tileNumberArray, this.model.get('isBinBaseNegated'));
            tileNumberArray = tileObjects.newArray;
            tileTexts = tileObjects.textForTiles;
            colorType = MathInteractives.global.Theme2.Button.COLORTYPE.DRAGGABLE_BLUE;
            height = width = namespace.FormExpression.BIN_BASE_TILE_WIDTH_HEIGHT;
            this._insertTileDivInDOM(namespace.FormExpression.BASE_TYPE, '#' + idPrefix + 'base-tile-dispenser', tileNumberArray, colorType, height, width, tileType, tileTexts);
            if (allowedCase & ExponentAccordionModel.IS_NEGATIVE_BASES_ALLOWED) {
                this._attachBaseEvents();
            }
        },

        _getNegationsFromModel: function _getNegationsFromModel(tileNumberArray, isNegated) {
            var index,
                newArray = [], value, textForTiles = [];
            for (index = 0; index < tileNumberArray.length; index++) {
                value = tileNumberArray[index] * isNegated[index];
                newArray[index] = value;
                if (value < 0) {
                    textForTiles[index] = '<span class="tile-number"> &minus; ' + Math.abs(value) + '</span>';
                }
                else {
                    textForTiles[index] = '<span class="tile-number">' + value + '</span>';
                }
            }
            return { newArray: newArray, textForTiles: textForTiles };

        },

        _generateExponentTiles: function _generateExponentTiles() {
            var idPrefix = this.idPrefix, model = this.model, minTileValue, maxTileValue,
                tileNumberArray, colorType, height, width, type, baseClass, tileObjects, tileTexts,
                allowedCase = this.model.get('allowedCases'),
                tileType = equationManagerModelNameSpace.TileItem.BinTileType.EXPONENT,
                ExponentAccordionModel = modelNameSpace.ExponentAccordion;
            minTileValue = namespace.FormExpression.POSITIVE_EXPONENT_TILE_MIN_VALUE;
            maxTileValue = namespace.FormExpression.POSITIVE_EXPONENT_TILE_MAX_VALUE;
            tileNumberArray = this._getArrayInRange(minTileValue, maxTileValue);
            tileObjects = this._getNegationsFromModel(tileNumberArray, this.model.get('isBinExpNegated'));
            tileNumberArray = tileObjects.newArray;
            tileTexts = tileObjects.textForTiles;
            colorType = MathInteractives.global.Theme2.Button.COLORTYPE.DRAGGABLE_GREEN;
            height = width = namespace.FormExpression.BIN_EXPONENT_TILE_WIDTH_HEIGHT;
            this._insertTileDivInDOM(namespace.FormExpression.EXPONENT_TYPE, '#' + idPrefix + 'exponents-tile-dispenser', tileNumberArray, colorType, height, width, tileType, tileTexts);
            if (allowedCase & ExponentAccordionModel.IS_NEGATIVE_EXPONENTS_ALLOWED) {
                this._attachExponentEvents();
            }
        },
        _generateParanthesesTile: function _generateParanthesesTile() {
            var idPrefix = this.idPrefix, model = this.model, minTileValue, maxTileValue, tileNumberArray, colorType, height, width, type, baseClass, self = this,
                tileType = equationManagerModelNameSpace.TileItem.BinTileType.PARENTHESIS,
                allowedCase = this.model.get('allowedCases'),
                ExponentAccordionModel = modelNameSpace.ExponentAccordion;
            tileNumberArray = [1, -1];
            height = width = namespace.FormExpression.BIN_BASE_TILE_WIDTH_HEIGHT;
            colorType = MathInteractives.global.Theme2.Button.COLORTYPE.DRAGGABLE_BLACK;
            this._insertTileDivInDOM(namespace.FormExpression.PARENTHESIS_TYPE, '#' + idPrefix + 'parenthesis-tile-dispenser', tileNumberArray, colorType, height, width, tileType);
        },

        /**
         * Inserts Tile Divs in DOM and Call function to make them draggable
         *
         * @method _insertTileDivInDOM
         * @param type {String} Type of tile
         * @param container {String} Selector of the container to which to append / dispenser container
         * @param tileNumberArray {Object} Array of numbers to appear on tile.
         * @private
         **/
        _insertTileDivInDOM: function _insertTileDivInDOM(type, container, tileNumberArray, colorType, height, width, tileType, tileTexts) {
            $(MathInteractives.Common.Interactivities.ExponentAccordion.templates['tiles']({ 'tiles': tileNumberArray, 'idPrefix': this.idPrefix, 'type': type, 'tileType': tileType })
              .trim()).appendTo(self.$(container));
            this._convertToDraggables(type, tileNumberArray, colorType, height, width, tileTexts);
        },

        _generateRaisedToPowerToggle: function _generateRaisedToPowerToggle() {
            var toggleButtonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton,
                options = {
                    path: this.filePath,
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    player: this.player,
                    id: this.idPrefix + 'raised-to-power-toggle-button',
                    baseClass: 'toggle-button-class',
                    text: [this.getMessage('toggle-button-state', 0), this.getMessage('toggle-button-state', 1)],
                    type: toggleButtonClass.TYPE.GENERAL,
                    isDraggable: true,
                    tabIndex: 720
                };
            this.toggleButtonView = toggleButtonClass.generateToggleButton(options);
            this.loadScreen('toggle-button-screen');
            this._attachToggleBtnHandleEvents();
            if (this.model.get('raisedToPower')) {
                this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_ON);
                this.setAccMessage('raised-to-power-toggle-button-toggle-button-containment', this.getAccMessage('toggle-button-text', 1));
            }
            else {
                this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_OFF);
                this.setAccMessage('raised-to-power-toggle-button-toggle-button-containment', this.getAccMessage('toggle-button-text', 2));
                this._enableDisableToggleButtonState(false);
            }

            this.listenTo(this.toggleButtonView, 'changeState', this._changeToggleState);
        },

        _attachToggleBtnHandleEvents: function _attachToggleBtnHandleEvents() {
            var self = this, enter, leave;
            //if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
            //    enter = 'touchstart';
            //    leave = 'touchend';
            //}
            //else {
                enter = 'mouseenter';
                leave = 'mouseleave';
            //}

            this.toggleButtonView.$el.find('.handle').off(enter).on(enter, function () {
                if (!self.toggleButtonView.$el.hasClass('disabled')) {
                    $(this).addClass('hover');
                }
            });

            this.toggleButtonView.$el.find('.handle').off(leave).on(leave, function () {
                $(this).removeClass('hover');
            });
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(this.toggleButtonView.$el.find('.handle'));
        },


        _convertToDraggables: function _convertToDraggables(type, tileNumberArray, colorType, height, width, tileTexts) {
            var id,
                self = this,
                data,
                text,
                dragTileData = [],
                dropSlotData, counter,
                dragDropClass = MathInteractives.Common.Components.Models.DragDrop,
                btnType = MathInteractives.global.Theme2.Button.TYPE.DRAGGABLE_TILE,
                dragDroptileData = {
                    'player': this.player,
                    'manager': this.manager,
                    'filePath': this.filePath,
                    'idPrefix': this.idPrefix
                };

            if (type === 'exponent') {
                btnType.fontSize = 14;
            }
            else {
                btnType.fontSize = 20;
            }
            dragDropClass.SETUP_SCOPE(this.idPrefix, this.manager, this.player);
            // draggable tiles data
            $.each(tileNumberArray, function (index, tileNumber) {
                if (type === 'base' || type === 'exponent') {
                    id = self.idPrefix + type + '-tile-value' + tileNumber;
                    text = tileTexts[index];
                }
                else if (type === 'parenthesis') {
                    id = self.idPrefix + type + '-tile-value' + tileNumberArray[index];
                    if (tileNumberArray[index] === 1) {
                        text = '( )';
                    }
                    else {
                        text = '&minus;( )';
                    }
                }
                data = {
                    'id': id,
                    'type': btnType,
                    'colorType': colorType,
                    'text': text,
                    'height': height,
                    'width': width,
                    'helper': 'clone',
                    containment: self.$('.bin-tile-containment'),
                    options: {
                        revert: function (ui) {
                            if (this.data('isDropped')) {
                                return false;
                            }
                            self.stopEvent = false;
                            self.animationStart();
                            return true;
                        }
                    }
                };
                dragTileData.push(data);
            });
            dragDroptileData.tileData = dragTileData;
            // Patch to make dragdropcontrol to work properly.
            // Patch starts..
            dropSlotData = [];
            dropSlotData.push({
                'containerId': this.idPrefix + 'dummy-droppable',
                'width': 0,
                'height': 0,
                'color': 'none',
                'boxShadowColor': 'none',
                'borderColor': 'none',
                'preventDefaultFunctionality': true,
                'options': {

                }
            });
            dragDroptileData.dropSlotData = dropSlotData;
            // Patch ends..

            if (type === 'base') {
                this.baseTilesViews = MathInteractives.global.Theme2.DragDropTile.generateDragDropTile(dragDroptileData);
                this.baseTilesViews.addOptionsForDraggable({
                    cursorAt: { left: namespace.FormExpression.BIN_BASE_TILE_WIDTH_HEIGHT / 2, top: namespace.FormExpression.BIN_BASE_TILE_WIDTH_HEIGHT / 2 },
                    distance: 10
                });
                this._attachBinBaseTileListeners();
            }
            else if (type === 'exponent') {
                this.exponentTilesViews = MathInteractives.global.Theme2.DragDropTile.generateDragDropTile(dragDroptileData);
                this.exponentTilesViews.addOptionsForDraggable({
                    cursorAt: { left: namespace.FormExpression.BIN_EXPONENT_TILE_WIDTH_HEIGHT / 2, top: namespace.FormExpression.BIN_EXPONENT_TILE_WIDTH_HEIGHT / 2 },
                    distance: 10
                });
                this._attachBinExponentTileListeners();
            }
            else {
                this.parenthesisTilesViews = MathInteractives.global.Theme2.DragDropTile.generateDragDropTile(dragDroptileData);
                this.parenthesisTilesViews.addOptionsForDraggable({
                    cursorAt: { left: namespace.FormExpression.BIN_BASE_TILE_WIDTH_HEIGHT / 2, top: namespace.FormExpression.BIN_BASE_TILE_WIDTH_HEIGHT / 2 },
                    distance: 10
                });
                this._attachBinParenthesisTileListeners();
            }
        },

        _maxBasesAllowedTooltip: function maxBasesAllowedTooltip() {
            var self = this;
            if (this.maxBasesAllowedTooltip === null) {
                var tooltipOpts = {
                    elementEl: this.idPrefix + 'droppable-region',
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    _player: this.player,
                    type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION,
                    arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_MIDDLE,
                    path: this.filePath,
                    filePath: this.filePath,
                    isTts: false,
                    isArrow: false,
                    closeOnDocumentClick: true,
                    baseClass: 'build-mode-inline-feedback'
                }, self = this;
                tooltipOpts.text = '<div id="' + this.idPrefix + 'build-text-in-tooltip" class="text-in-tooltip"></div><div id="' + this.idPrefix + 'build-close-btn-in-tooltip" class="close-btn-in-tooltip"></div>';
                this.maxBasesAllowedTooltip = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipOpts);
                this._attachTooltipEvents();


                this.closeBtnView = new MathInteractives.global.Theme2.Button.generateButton({
                    'player': this.player,
                    'manager': this.manager,
                    'path': this.filePath,
                    'idPrefix': this.idPrefix,
                    'data': {
                        'id': this.idPrefix + 'build-close-btn-in-tooltip',
                        'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                        'height': 17,
                        'baseClass': 'close-btn-base-class',
                        'tooltipText': this.getMessage('button-tooltip-text', 'close'),
                        'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                        'icon': {
                            'faClass': self.filePath.getFontAwesomeClass('close'),
                            'fontColor': '#744b11',
                        }
                    }
                });

                this.closeBtnView.$el.off('click').on('click', function () {
                    self.maxBasesAllowedTooltip.hideTooltip();
                    //self.setFocus('droppable-region');
                });

                this.closeBtnView.$el.off('keydown').on('keydown', function (event) {
                    var uniCode = event.keyCode ? event.keyCode : event.charCode;
                    if (uniCode === 32) {
                        setTimeout(function () { self.setFocus('droppable-region'); }, 5);
                    }
                });

                this._attachCloseButtonEvents(this.closeBtnView.$el);
            }
        },

        _attachCloseButtonEvents: function _attachCloseButtonEvents($givenEl) {
            var self = this,
                enter, leave,
                $requiredElement = $givenEl.find('.fa-times');

            //if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                enter = 'mouseenter';
                leave = 'mouseleave';
            //}
            //else {
            //    enter = 'touchstart';
            //    leave = 'touchend';
            //}

            $givenEl.on(enter, function () {
                $requiredElement.css({ color: '#a46409' });
            });

            $givenEl.on(leave, function () {
                $requiredElement.css({ color: '#744b11' });
            });
            $givenEl.on('mousedown', function () {
                $requiredElement.css({ color: '#5b3601' });
            });
            $givenEl.on('mouseup', function () {
                $requiredElement.css({ color: '#744b11' });
            });
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($givenEl);
        },

        _setMaxBasesTooltipText: function _setMaxBasesTooltipText() {
            var accordionLevel = this.model.get('accordionLevel');

            switch (accordionLevel) {
                case 1:
                case 2:
                    return {
                        loc: this.getMessage('max-bases-allowed-tooltip-text', 1),
                        acc: this.getAccMessage('max-bases-allowed-tooltip-text', 1)
                    }
                    break;
                case 3:
                case 4:
                case 5:
                    if (this.model.get('buildModeDivisionMode')) {
                        return {
                            loc: this.getMessage('max-bases-allowed-tooltip-text', 2),
                            acc: this.getAccMessage('max-bases-allowed-tooltip-text', 2)
                        }
                    }
                    else {
                        return {
                            loc: this.getMessage('max-bases-allowed-tooltip-text', 1),
                            acc: this.getAccMessage('max-bases-allowed-tooltip-text', 1)
                        }
                    }
                    break;
            }
        },

        _setUniqueBaseLimitReachedText: function _setUniqueBaseLimitReachedText() {
            return {
                loc: this.getMessage('max-bases-allowed-tooltip-text', 4),
                acc: this.getAccMessage('max-bases-allowed-tooltip-text', 4)
            }
        },

        _nestedParenthesisNotAllowedText: function _nestedParenthesisNotAllowedText() {
            return {
                loc: this.getMessage('max-bases-allowed-tooltip-text', 5),
                acc: this.getAccMessage('max-bases-allowed-tooltip-text', 5)
            }
        },

        _maxNoOfParenthesisAllowedText: function _maxNoOfParenthesisAllowedText() {
            return {
                loc: this.getMessage('max-bases-allowed-tooltip-text', 7),
                acc: this.getAccMessage('max-bases-allowed-tooltip-text', 7)
            }
        },

        /**
        * Returns the text for the case when an out of range exponent is added to
        * the parentheses.
        * @method _exponentOutOfRangeText
        * @private
        * @return {String} Error message for the case when an out of range exponent is added to the parentheses.
        */
        _exponentOutOfRangeText: function () {
            return this.getMessage('error-tooltip-text', 1);
        },

        _maxLimitCrossedTooltipText: function _maxLimitCrossedTooltipText() {
            return this.getMessage('combine-like-bases-tooltip-text', 0);
        },

        _invalidCombineWithinSameParentText: function _invalidCombineWithinSameParentText() {
            var accordionLevel = this.model.get('accordionLevel');
            if (accordionLevel > 3) {
                return this.getMessage('combine-like-bases-tooltip-text', 3);
            }
            return this.getMessage('combine-like-bases-tooltip-text', 2);
        },

        _invalidCombineWithinDiffParentText: function _invalidCombineWithinDiffParentText() {
            return this.getMessage('combine-like-bases-tooltip-text', 1);
        },

        _invalidCombineForTileValueExceedingText: function _invalidCombineForTileValueExceedingText() {
            return this.getMessage('combine-like-bases-tooltip-text', 4);
        },

        _invalidCombineForBaseValueExceedingText: function _invalidCombineForBaseValueExceedingText() {
            return this.getMessage('combine-like-bases-tooltip-text', 5);
        },

        _invalidCombineForMarquee: function _invalidCombineForMarquee () {
            return this.getMessage('combine-like-bases-tooltip-text', 6);
        },

        _maxNoOfTermsInsideParenthesisText: function _maxNoOfTermsInsideParenthesisText() {

            return {
                loc: this.getMessage('max-bases-allowed-tooltip-text', 6),
                acc: this.getAccMessage('max-bases-allowed-tooltip-text', 6)
            }
        },

        //_parenthesisExponentTooltip: function _parenthesisExponentTooltip() {
        //    if (this.parenthesisExponentTooltip === null) {
        //        var tooltipOpts = {
        //            elementEl: this.idPrefix + 'solve-mode-reset-button',
        //            idPrefix: this.idPrefix,
        //            manager: this.manager,
        //            _player: this.player,
        //            type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION,
        //            arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.RIGHT_MIDDLE,
        //            path: this.filePath,
        //            isTts: false,
        //            isArrow: true,
        //            closeOnDocumentClick: true,
        //            backgroundColor: '#6D6D6D',
        //            //baseClass: 'parenthesis-exponent-tooltip',
        //            borderColor: '#ffffff'
        //        };
        //        tooltipOpts.text = this._getExponentTooltipHtml();
        //        this.parenthesisExponentTooltip = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipOpts);
        //        this._generateButtonsInsideTooltip();
        //    }
        //    //this.parenthesisExponentTooltip.showTooltip();
        //},

        _getExponentTooltipHtml: function _getExponentTooltipHtml() {
            var $buttonsContainer = $('<div></div>').attr({ 'id': this.idPrefix + 'exponent-tooltip-buttons-container', 'class': 'exponent-tooltip-buttons-container' }),
                $applyExponentButton = $('<div></div>').attr({ 'id': this.idPrefix + 'apply-exponent-button', 'class': 'apply-exponent-button' }).appendTo($buttonsContainer),
                $changeSignButton = $('<div></div>').attr({ 'id': this.idPrefix + 'change-sign-button', 'class': 'change-sign-button' }).appendTo($buttonsContainer);
            return $buttonsContainer;
        },

        _generateButtonsInsideTooltip: function () {
            var ButtonClass, buttonProperties;
            ButtonClass = MathInteractives.global.Theme2.Button;
            buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'apply-exponent-button',
                    text: 'Apply Exponent',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'white-button',
                    textColor: '#007ebf'
                }
            };
            this.applyExponentBtnView = new ButtonClass.generateButton(buttonProperties);

            buttonProperties.data.id = this.idPrefix + 'change-sign-button';
            buttonProperties.data.text = 'Change Sign';
            buttonProperties.data.width = 173;
            this.changeSignBtnView = new ButtonClass.generateButton(buttonProperties);
        },

        /*_expressionIncompleteTooltip: function _expressionIncompleteTooltip() {
            if (this.expressionIncompleteTooltip === null) {
                var tooltipOpts = {
                    elementEl: this.idPrefix + 'done-button',
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    _player: this.player,
                    type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION,
                    arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_LEFT,
                    path: this.filePath,
                    isTts: true,
                    isArrow: true,
                    text: this.getMessage('expression-incomplete-tooltip-text', 0),
                    closeOnDocumentClick: true,
                    baseClass: 'expression-incomplete-base-class',
                    backgroundColor: '#ffffff',
                    textColor: '#222222',
                    borderColor: '#ffffff'
                };
                this.expressionIncompleteTooltip = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipOpts);
            }
            //this.expressionIncompleteTooltip.showTooltip();
            this._bindEventOnExpressionIncompleteTooltip();

        },*/


        _renderOriginalExpression: function _renderOriginalExpression() {

            //var $originalExpr = this._equationManager.equationView.getTileContentInHtmlForm(),
            var $originalExpr = this._getOriginalExpression(),
                raisedToPower = this.model.get('raisedToPower'),
                $ogExpressionHolder = this.$('.original-expression-holder').html($originalExpr),
                path = this.filePath,
                operatorClass = path.getFontAwesomeClass('dot');

            $ogExpressionHolder.find('.operator-data-tab div').addClass(operatorClass);
            if ($ogExpressionHolder.find('.denominator').hasClass('denominator-empty')) {
                $ogExpressionHolder.find('.vincullum').hide();
            }

        },

        _getOriginalExpression: function () {
            var originalExprData = $.extend(true, {}, this.model.get('equationData')), tileArray;
            return this._getExpression(originalExprData.tileArray, originalExprData.type, '');
        },

        _getExpression: function (tile, type) {
            var i = 0, htmlString = '';
            if (type === 'EQUATION_COMPONENT') {
                htmlString += '<div class=\'header-expression-container\'><div class=\'header-expression\'>';
                for (; i < tile.length; i++) {
                    htmlString += this._getExpression(tile[i], tile[i].type);
                }
                htmlString += '</div></div>';
                return htmlString;
            }
            else if (type === 'FRACTION') {
                var isDenominatorEmpty = true,
                    isNumeratorEmpty = true, numeratorString, denominatorString, negativeTile;

                numeratorString = '<div class=\'fraction-data-tab\'><div class=\'numerator\'>';

                htmlString += numeratorString;
                for (; i < tile.tileArray.length; i++) {
                    if (!tile.tileArray[i].bDenominator) {
                        htmlString += this._getExpression(tile.tileArray[i], tile.tileArray[i].type);
                        isNumeratorEmpty = false;
                    }
                }

                if (isNumeratorEmpty === true) {
                    htmlString = htmlString.replace(numeratorString, '<div class=\'fraction-data-tab\'><div class=\'numerator numerator-empty\'>1');
                }
                htmlString += '</div><div class=\'vincullum\'></div>';
                denominatorString = '<div class=\'denominator\'>';
                htmlString += denominatorString;
                for (i = 0; i < tile.tileArray.length; i++) {
                    if (tile.tileArray[i].bDenominator) {
                        htmlString += this._getExpression(tile.tileArray[i], tile.tileArray[i].type);
                        isDenominatorEmpty = false;
                    }
                }
                if (isDenominatorEmpty === true) {
                    htmlString = htmlString.replace(denominatorString, '<div class=\'denominator denominator-empty\'>');
                }
                htmlString += '</div></div>';
                return htmlString;
            }
            else if (type === 'PARENTHESIS') {
                if (tile.operator) {
                    htmlString += '<div class=\'operator-data-tab\'><div></div></div>';
                }
                if (tile.exponent < 0) {
                    tile.exponent = '<span class="minus-sign-exponent">&minus;</span>' + Math.abs(tile.exponent);
                }
                htmlString += '<span><span>(</span>';
                for (; i < tile.tileArray.length; i++) {
                    htmlString += this._getExpression(tile.tileArray[i], tile.tileArray[i].type);
                }
                htmlString += '<span>)</span>';
                htmlString += '<div class=\'parenthesis-exponent-data-tab exponent-data-tab\'>' + tile.exponent + '</div></span>';
                return htmlString;
            }
            else if (type === 'BIG_PARENTHESIS') {
                htmlString += '<span class=\'big-parenthesis-container\'><span class=\'open-parenthesis-data-tab\'></span>';
                if (tile.exponent < 0) {
                    tile.exponent = '<span class="minus-sign-exponent minus-sign-exponent-big-parenthesis">&minus;</span>' + Math.abs(tile.exponent);
                }
                for (; i < tile.tileArray.length; i++) {
                    htmlString += this._getExpression(tile.tileArray[i], tile.tileArray[i].type);
                }
                htmlString += '<span class=\'big-parenthesis-close-container\'><span class=\'close-parenthesis-data-tab\'></span>';
                htmlString += '<div class=\'big-parenthesis-exponent-data-tab\'>' + tile.exponent + '</div></span></span>';

                //add class to fraction tile adjust bottom in case of big parenthesis
                htmlString = htmlString.replace('<div class=\'fraction-data-tab\'><div class=\'numerator\'>', '<div class=\'fraction-data-tab adjust-bottom\'><div class=\'numerator\'>');
                return htmlString;
            }
            else if (type === 'BASE_EXPONENT') {
                if (tile.base < 0) {
                    negativeTile = '<span class="minus-sign-base">&minus;</span>' + Math.abs(tile.base);
                }
                if (tile.exponent < 0) {
                    tile.exponent = '<span class="minus-sign-exponent">&minus;</span>' + Math.abs(tile.exponent);
                }
                if (tile.operator) {
                    htmlString = htmlString + '<div class=\'operator-data-tab\'><div></div></div>';
                }
                if (tile.base < 0) {
                    htmlString += '<span class=\'base-exp-data-tab\'>(' + negativeTile + ')<div class=\'exponent-data-tab\'>' + tile.exponent + '</div>' + '</span>';
                }
                else {
                    htmlString += '<span class=\'base-exp-data-tab\'>' + tile.base + '<div class=\'exponent-data-tab\'>' + tile.exponent + '</div>' + '</span>';
                }
                return htmlString;
            }
            else if (type === 'BASE_ONLY') {
                var tileVal = tile.base;
                if (tileVal < 0) {
                    tile.base = '<span class="minus-sign-base">&minus;</span>' + Math.abs(tileVal);
                }
                if (tile.operator) {
                    htmlString = htmlString + '<div class=\'operator-data-tab\'><div></div></div>';
                }
                if(tileVal < 0) {
                    htmlString += '<span class=\'base-exp-data-tab\'>(' + tile.base + ')</span>';
                }
                else {
                    htmlString += '<span class=\'base-exp-data-tab\'>' + tile.base + '</span>';
                }
                return htmlString;
            }
        },

        _combineLikeBasesTooltip: function _combineLikeBasesTooltip() {
            if (this.combineLikeBasesTooltip === null) {
                var tooltipOpts = {
                    elementEl: this.idPrefix + 'inline-feedback-container',
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    _player: this.player,
                    type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION,
                    arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_MIDDLE,
                    path: this.filePath,
                    filePath: this.filePath,
                    isTts: false,
                    isArrow: false,
                    closeOnDocumentClick: true
                }, self = this;
                tooltipOpts.text = '<div id="' + this.idPrefix + 'solve-text-in-tooltip" class="text-in-tooltip"></div><div id="' + this.idPrefix + 'solve-close-btn-in-like-bases-tooltip" class="close-btn-in-tooltip"></div>';
                this.combineLikeBasesTooltip = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipOpts);

                this.closeBtnViewCombineBasesTooltip = new MathInteractives.global.Theme2.Button.generateButton({
                    'player': this.player,
                    'manager': this.manager,
                    'path': this.filePath,
                    'idPrefix': this.idPrefix,
                    'data': {
                        'id': this.idPrefix + 'solve-close-btn-in-like-bases-tooltip',
                        'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                        'baseClass': 'close-btn-base-class',
                        'height': 17,
                        'tooltipText': this.getMessage('button-tooltip-text', 'close'),
                        'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                        'icon': {
                            'faClass': self.filePath.getFontAwesomeClass('close'),
                            'fontColor': '#744b11',
                        }
                    }
                });
                this.closeBtnViewCombineBasesTooltip.$el.on('click', function (event) {
                    self._hideCombineLikeBasesTooltip();
                    //self.setFocus('workspace-scrollable');

                });
                this.closeBtnViewCombineBasesTooltip.$el.off('keydown').on('keydown', function (event) {
                    var uniCode = event.keyCode ? event.keyCode : event.charCode;
                    if (uniCode === 32) {
                        setTimeout(function () { self.setFocus('workspace-scrollable'); }, 5);
                    }
                });
                this._attachCloseButtonEvents(this.closeBtnViewCombineBasesTooltip.$el);
            }
        },

        _bindAccEvents: function _bindAccEvents() {
            var self = this, accordionLevel = this.model.get('accordionLevel');

            this._enableDisableTabsOfBinTiles('base', false);
            this._enableDisableTabsOfBinTiles('exponent', false);
            this._enableDisableTabsOfBinTiles('parenthesis', false);

            this.$('.base-tile-dispenser-container').off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode,
                    disabledBases = self._formEquationManager.getBaseArray();
                if (uniCode === 27) {
                    self.setFocus('base-tile-dispenser-container');
                }
                if ($(event.target).parent().hasClass('base-tile-dispenser-container') === false) {
                    return;
                }
                if (uniCode === 32) {
                    event.preventDefault();
                    self.$el.trigger('mousedown').trigger('mouseup').trigger('click');
                    //enables all base tiles
                    //self._enableDisableTabsOfBinTiles('base', true);
                    self._enableDisableTabsOfBinTiles('base', true, disabledBases);
                    //setfocus to first enable element
                    //self.setFocus('base-tile-value2', 200);
                    self.spaceRegistered = true;
                }
            });

            this.$('.exponents-tile-dispenser-container').off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 27) {
                    self.setFocus('exponents-tile-dispenser-container');
                }
                if ($(event.target).parent().hasClass('exponents-tile-dispenser-container') === false) {
                    return;
                }
                if (uniCode === 32) {
                    event.preventDefault();
                    self.$el.trigger('mousedown').trigger('mouseup').trigger('click');
                    self._enableDisableTabsOfBinTiles('exponent', true);
                    self.setFocus('exponent-tile-value1');
                    self.spaceRegistered = true;
                }
            });

            this.$('.parenthesis-tile-dispenser-container').off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 27) {
                    self.setFocus('parenthesis-tile-dispenser-container');
                }
                if ($(event.target).parent().hasClass('parenthesis-tile-dispenser-container') === false) {
                    return;
                }
                if (uniCode === 32) {
                    event.preventDefault();
                    self.$el.trigger('mousedown').trigger('mouseup').trigger('click');
                    self._enableDisableTabsOfBinTiles('parenthesis', true, self.disabledParIndexes);
                    //self.setFocus('parenthesis-tile-value1', 200);
                    self.spaceRegistered = true;
                }

            });

            this.$('.multiplication-img, .division-numerator, .division-denominator').off('keydown').on('keydown', function (event) {
                var $target = $(event.currentTarget),
                    uniCode = event.keyCode ? event.keyCode : event.charCode, $selectedTile = self.selectedTile, $droppable, accordionLevel = self.model.get('accordionLevel');
                if (uniCode === 32) {
                    event.preventDefault();
                    if ($target.hasClass('multiplication-img')) {
                        $droppable = self._$elmStartDropRegionMultiplication;
                        self._onTileDropForAcc(event, null, $droppable, false, '0', $selectedTile);
                    }
                    else if ($target.hasClass('division-numerator')) {
                        $droppable = self._$elmStartDropRegionMultiplication;
                        self._onTileDropForAcc(event, null, $droppable, true, '0.0', $selectedTile);
                    }
                    else if ($target.hasClass('division-denominator')) {
                        $droppable = self._$elmStartDropRegionMultiplication;
                        self._onTileDropForAcc(event, null, $droppable, true, '0.1', $selectedTile);
                    }
                    self.selectedTile = null;
                    self._formEquationManager.selectedTile = null;
                }
               /* else if (uniCode === 9 && event.shiftKey) {
                    if ($target.hasClass('multiplication-img')) {
                        if (self.selectedTile !== null) {
                            event.preventDefault();
                            self.setFocus('division-denominator');
                        }
                    }
                }
                else if (uniCode === 9) {
                    if ($target.hasClass('division-denominator')) {
                        if (self.selectedTile !== null) {
                            event.preventDefault();
                            self.setFocus('multiplication-img');
                        }
                    }
                    else {
                        if (accordionLevel <= 2) {
                            if ($target.hasClass('multiplication-img')) {
                                if (self.selectedTile !== null) {
                                    event.preventDefault();
                                }
                            }
                        }
                    }

                }*/
                else if (uniCode === 27) {
                    self.setFocus(self.selectedTile.attr('id').replace(self.idPrefix, ''));
                    self.selectedTile = null;
                    self._formEquationManager.selectedTile = null;
                }
            });

            this.focusOut('base-tile-dispenser-container', function () {
                if (self.spaceRegistered) {
                    self.spaceRegistered = false;
                    return;
                }
                self._enableDisableTabsOfBinTiles('base', false);
            });
            this.focusOut('exponents-tile-dispenser-container', function () {
                if (self.spaceRegistered) {
                    self.spaceRegistered = false;
                    return;
                }
                self._enableDisableTabsOfBinTiles('exponent', false);
            });
            this.focusOut('parenthesis-tile-dispenser-container', function () {
                if (self.spaceRegistered) {
                    self.spaceRegistered = false;
                    return;
                }
                self._enableDisableTabsOfBinTiles('parenthesis', false);
            });
            this.focusIn('base-tile-dispenser-container', function () {
                self._enableDisableTabsOfBinTiles('base', false);
                self._disableDroppables();
            });
            this.focusIn('exponents-tile-dispenser-container', function () {
                self._enableDisableTabsOfBinTiles('base', false);
                self._enableDisableTabsOfBinTiles('exponent', false);
                self._disableDroppables();
            });
            this.focusIn('parenthesis-tile-dispenser-container', function () {
                self._enableDisableTabsOfBinTiles('exponent', false);
                self._enableDisableTabsOfBinTiles('parenthesis', false);
                self._disableDroppables();
            });

            this.focusIn('random-expression-button', function () {
                self._enableDisableTabsOfBinTiles('parenthesis', false);
            });

            this.focusIn('raised-to-power-toggle-button-toggle-button-containment', function () {
                self._enableDisableTabsOfBinTiles('parenthesis', false);
            });

            this.focusIn('save-btn', function () {
                self._enableDisableTabsOfBinTiles('exponent', false);
                self._enableDisableTabsOfBinTiles('parenthesis', false);
            });

            this.$('.base-draggable-tiles, .exponent-draggable-tiles, .parenthesis-draggable-tiles').off('focusin').on('focusin', function () {
                self._disableDroppables();
            });
            this.focusIn('droppable-region', function (event) {
                self._formEquationManager.equationView.buildStartAcc();
            });
            this.focusIn('workspace-scrollable', function (event) {
                self._equationManager.equationView.startAcc();
            });
            if (accordionLevel <= 4) {
                var tileClasses;
                if (accordionLevel === 1) {
                    tileClasses = '.base-draggable-tiles, .exponent-draggable-tiles';
                }
                else {
                    tileClasses = '.exponent-draggable-tiles';
                }
                this.$(tileClasses).off('keydown').on('keydown', function (event) {
                    var $tile = $(event.currentTarget),
                        uniCode = event.keyCode ? event.keyCode : event.charCode;
                    if (uniCode === 32) {
                        event.preventDefault();
                        self.selectedTile = $tile;
                        self._formEquationManager.selectedTile = $tile;
                        if (self._formEquationManager.$el.css('display') !== 'none') {
                            self._setFocusToNumerator();
                        }
                        else {
                            self._enableDroppables($tile);
                        }
                    }
                });
            }

            this.$('.parenthesis-draggable-tiles').off('keydown').on('keydown', function (event) {
                var $tile = $(event.currentTarget),
                    uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 32) {
                    event.preventDefault();
                    self.selectedTile = $tile;
                    self._formEquationManager.selectedTile = $tile;
                    self._setFocusToNumerator();
                }
            });

            this.$('.solve-mode-undo-button').off('keydown').on('keydown', function (event) {
                self._setFocusToWorkspaceScrollable(event);
            });

            this.$('.raised-to-power-toggle-button').off('keydown').on('keydown', function (event) {
                window.setTimeout (function () {self._setFocusToDroppableRegion(event); }, 500 );
            });

            this.$('.random-expression-button').off('keydown').on('keydown', function (event) {
                self._setFocusToDroppableRegion(event);
            });

        },

        _setFocusToWorkspaceScrollable: function (event) {

            var uniCode = event.keyCode ? event.keyCode : event.charCode, self = this;
            if (uniCode === 32) {
                setTimeout(function () {
                    self.setFocus('workspace-scrollable');
                }, 5);
            }
        },

        _setFocusToDroppableRegion: function (event) {

            var uniCode = event.keyCode ? event.keyCode : event.charCode, self = this;
            if (uniCode === 32) {
                setTimeout(function () {
                    self.setFocus('droppable-region');
                }, 5);
            }
        },

        _enableDisableTabsOfBinTiles: function _enableTabsOfBinTiles(tileType, isEnable, tilesArrayToEnableDisable) {
            var i = 0;
            if (tileType === 'base') {
                var baseTileButtonViews = this.baseTilesViews.dragButtonViews;
                if (tilesArrayToEnableDisable === undefined || tilesArrayToEnableDisable.length === 0) {
                    //disable or enable all tiles
                    for (; i < baseTileButtonViews.length; i++) {
                        this.enableTab(baseTileButtonViews[i].$el.attr('id').replace(this.idPrefix, ''), isEnable);
                    }
                    if (isEnable) {
                        this.setFocus(baseTileButtonViews[0].$el.attr('id').replace(this.idPrefix, ''));
                    }
                }
                else {
                    //disable or enable selected tiles
                    for (; i < tilesArrayToEnableDisable.length; i++) {
                        if (baseTileButtonViews[Math.abs(tilesArrayToEnableDisable[i]) - 2].$el.attr('data-tilevalue') !== tilesArrayToEnableDisable[i]) {
                            this.enableTab(baseTileButtonViews[Math.abs(tilesArrayToEnableDisable[i]) - 2].$el.attr('id').replace(this.idPrefix, ''), isEnable);
                        }
                    }
                    if (isEnable) {
                        this.setFocus(baseTileButtonViews[Math.abs(tilesArrayToEnableDisable[0]) - 2].$el.attr('id').replace(this.idPrefix, ''));
                    }

                }

            }
            else if (tileType === 'exponent') {
                var exponentTileButtonViews = this.exponentTilesViews.dragButtonViews;
                for (; i < exponentTileButtonViews.length; i++) {
                    this.enableTab(exponentTileButtonViews[i].$el.attr('id').replace(this.idPrefix, ''), isEnable);
                }
            }
            else if (tileType === 'parenthesis') {
                if (this.parenthesisTilesViews !== null) {
                    var parenthesisTileButtonViews = this.parenthesisTilesViews.dragButtonViews, temp;
                    if (tilesArrayToEnableDisable === undefined || tilesArrayToEnableDisable.length === 0) {
                        //disable or enable all tiles
                        for (; i < parenthesisTileButtonViews.length; i++) {
                            this.enableTab(parenthesisTileButtonViews[i].$el.attr('id').replace(this.idPrefix, ''), isEnable);
                        }
                        if (isEnable) {
                            this.setFocus(parenthesisTileButtonViews[0].$el.attr('id').replace(this.idPrefix, ''));
                        }

                    }
                    else {
                        //disable or enable selected tiles
                        for (; i < tilesArrayToEnableDisable.length; i++) {
                            this.enableTab(parenthesisTileButtonViews[tilesArrayToEnableDisable[i]].$el.attr('id').replace(this.idPrefix, ''), !isEnable);
                        }
                        if (isEnable && tilesArrayToEnableDisable.length === 1) {
                            temp = tilesArrayToEnableDisable[0];
                            if (temp === 1) {
                                temp = 0;
                            }
                            else {
                                temp = 1;
                            }
                            this.setFocus(parenthesisTileButtonViews[temp].$el.attr('id').replace(this.idPrefix, ''));
                        }

                    }
                }
            }
        },

        /**
        * Updates the context menu rows based on those required.
        * @method _updateContextMenu
        * @private
        */
        _updateContextMenu: function _updateContextMenu() {
            var accordionLevel = this.model.get('accordionLevel'),
                isFraction = this.model.get('buildModeDivisionMode'),
                isTileDropped = this.model.get('tileDropped'),
                raisedToPower = this.model.get('raisedToPower'),
                BASE_CTX_ITEM_ID = namespace.FormExpression.BASE_CTX_ITEM_ID,
                EXP_CTX_ITEM_ID = namespace.FormExpression.EXP_CTX_ITEM_ID,
                PARENS_CTX_ITEM_ID = namespace.FormExpression.PARENS_CTX_ITEM_ID,
                base_rows = [],
                exp_rows = [],
                parens_rows = [],
                self = this;


            // ignore all elems
            this.ignoreAllCtxRows();

            if (accordionLevel >= 1) {
                if (!isFraction && isTileDropped) {
                    base_rows.push(BASE_CTX_ITEM_ID.ADD_MUL);
                    exp_rows.push(EXP_CTX_ITEM_ID.ADD_MUL);
                    parens_rows.push(PARENS_CTX_ITEM_ID.ADD_EXPR);
                } else if (isFraction && isTileDropped) {
                    parens_rows.push(PARENS_CTX_ITEM_ID.ADD_NUM);
                    parens_rows.push(PARENS_CTX_ITEM_ID.ADD_DEN);
                } else {
                    // no tile dropped
                    base_rows.push(BASE_CTX_ITEM_ID.ADD_MUL);
                    exp_rows.push(EXP_CTX_ITEM_ID.ADD_MUL);
                    parens_rows.push(PARENS_CTX_ITEM_ID.ADD_EXPR);
                    parens_rows.push(PARENS_CTX_ITEM_ID.ADD_NUM);
                    parens_rows.push(PARENS_CTX_ITEM_ID.ADD_DEN);
                }
            }

            if (accordionLevel >= 2) {
                base_rows.push(BASE_CTX_ITEM_ID.CHANGE_SIGN);
            }

            if (accordionLevel >= 3) {
                if (isFraction) {
                    base_rows.push(BASE_CTX_ITEM_ID.ADD_NUM_DIV);
                    exp_rows.push(EXP_CTX_ITEM_ID.ADD_NUM_DIV);
                    base_rows.push(BASE_CTX_ITEM_ID.ADD_DEN_DIV);
                    exp_rows.push(EXP_CTX_ITEM_ID.ADD_DEN_DIV);
                }
            }

            if (accordionLevel >= 5) {
                exp_rows.push(EXP_CTX_ITEM_ID.CHANGE_SIGN);
                if (raisedToPower) {
                    exp_rows.push(EXP_CTX_ITEM_ID.RAISE_TO_FRACTION);
                }
            }

            // show allowed rows
            base_rows = _.map(base_rows, function (value, list) {
                return self.idPrefix + value;
            });
            this.binBaseTilesContextMenuView.editContextMenu(base_rows, false);
            exp_rows = _.map(exp_rows, function (value, list) {
                return self.idPrefix + value;
            });
            this.binExponentTilesContextMenuView.editContextMenu(exp_rows, false);
            parens_rows = _.map(parens_rows, function (value, list) {
                return self.idPrefix + value;
            });
            this.binParenthesisTilesContextMenuView.editContextMenu(parens_rows, false);
        },

        /**
        * Ignores and hides all rows of the ctx menu.
        * @method ignoreAllCtxRows
        */
        ignoreAllCtxRows: function () {
            var BASE_CTX_ITEM_ID = namespace.FormExpression.BASE_CTX_ITEM_ID,
                EXP_CTX_ITEM_ID = namespace.FormExpression.EXP_CTX_ITEM_ID,
                PARENS_CTX_ITEM_ID = namespace.FormExpression.PARENS_CTX_ITEM_ID,
                rows = [],
                self = this;

            // ignore all elems
            rows = _.map(BASE_CTX_ITEM_ID, function (value, key, obj) {
                return self.idPrefix + value;
            });
            this.binBaseTilesContextMenuView.editContextMenu(rows, true);    // passing true ignores elements

            rows = [];
            rows = _.map(EXP_CTX_ITEM_ID, function (value, key, obj) {
                return self.idPrefix + value;
            });
            this.binExponentTilesContextMenuView.editContextMenu(rows, true);    // passing true ignores elements

            rows = [];
            rows = _.map(PARENS_CTX_ITEM_ID, function (value, key, obj) {
                return self.idPrefix + value;
            });
            this.binParenthesisTilesContextMenuView.editContextMenu(rows, true);    // passing true ignores elements
        },

        _bindEventsOnButtons: function _bindEventsOnButtons() {
            var self = this;
            this.randomExpressionBtnView.$el.off('click').on('click', function (event) {
                if ($(this).hasClass('clickEnabled')) {
                    self._randomExpressionButtonClick(event);
                }
            });
            this.doneButtonView.$el.off('click').on('click', function (event) {
                if ($(this).hasClass('clickEnabled')) {
                    self._doneButtonClick(event);
                }
            });
            this.solveModeUndoButtonView.$el.off('click').on('click', function (event) {
                if ($(this).hasClass('clickEnabled')) {
                    self._solveModeUndoBtnClick(event);
                }
            });
            this.buildModeUndoButtonView.$el.off('click').on('click', function (event) {
                if ($(this).hasClass('clickEnabled')) {
                    self._buildModeUndoClickHandler(event);
                }
            });
            this.solveModeViewDataButtonView.$el.off('click').on('click', function (event) {
                if ($(this).hasClass('clickEnabled')) {
                    self._onClickViewData(event);
                }
            });
            this.buildModeResetButtonView.$el.off('click').on('click', function (event) {
                if ($(this).hasClass('clickEnabled')) {
                    self._onClickBuildModeResetButton(event);
                }
            });
            this.solveModeResetButtonView.$el.off('click').on('click', function (event) {
                if ($(this).hasClass('clickEnabled')) {
                    self._solveModeResetButtonClick(event);
                }
            });

            this.$el.off('mousedown').on('mousedown', function (event) {
                self.onMouseDown(event);
            });
            this.$('.animation-progress-div').off('mousedown').on('mousedown', function (event) {
                self._stopPropagationOnAnimation(event);
            });
        },

        _attachBaseEvents: function () {
            this._attachNegateTileEvents('.base-draggable-tiles.clickEnabled');
        },


        _attachExponentEvents: function _attachExponentEvents() {
            this._attachNegateTileEvents('.exponent-draggable-tiles');
        },

        _negateParenthesis: function _negateParenthesis() {
            this._attachNegateTileEvents('.parenthesis-draggable-tiles');
        },

        _attachNegateTileEvents: function _attachNegateTileEvents(tileclass) {
            var self = this, accordionLevel = this.model.get('accordionLevel');
            this.$(tileclass).off('click.bintiles').on('click.bintiles', function (event, options) {
                if (self.isAnimationRunning) {
                    return;
                }
                var $tile = $(this);
                if ((!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile && event.which) || (options && options.isTutorialUndoTrigger)) {
                        self._tileClickEvent(self, $tile);
                }
                else {
                    if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                        self.selectedTile = $tile;
                        self._formEquationManager.selectedTile = $tile;
                        if (self._formEquationManager.$el.css('display') !== 'none') {
                            if (self.model.get('raisedToPower') && accordionLevel === 5 && $tile.attr('data-tiletype') === 'EXPONENT') {
                                self._setFocusToExponentBigParenthesis($tile);
                            }
                            else {
                                self._setFocusToNumerator();
                            }
                        }
                        else {
                            self._enableDroppables($tile);
                        }
                    }
                    else {
                        self._tileClickEvent(self, $tile);
                    }
                }
            });
        },

        _setFocusToExponentBigParenthesis: function _setFocusToExponentBigParenthesis($tile) {
            var isSelectedTileExponent = false;
            if ($tile === true || $tile.attr('data-tiletype') === 'EXPONENT') {
                isSelectedTileExponent = true;
            }
            this._formEquationManager.setFocusToExponentBigParenthesis('0', isSelectedTileExponent);
        },


        _setFocusToNumerator: function () {
            var isFractionItem = this.model.get('buildModeDivisionMode'),
                isRaisedToPower = this.model.get('raisedToPower'), index, isEqnView = false;
            if (isFractionItem && isRaisedToPower) {
                index = '0.0';
            }
            else if (isFractionItem) {
                index = '0';
            }
            else {
                index = '0';
                isEqnView = true;
            }
            this._formEquationManager.setFocusToNumerator(index, isEqnView);

        },

        _dropBinTileUsingContextMenu: function _dropBinTileUsingContextMenu(isDenominator, isBigParenthesisExponent) {
            var isFractionItem = this.model.get('buildModeDivisionMode'),
                isRaisedToPower = this.model.get('raisedToPower'), index, isEqnView = false;

            if (isBigParenthesisExponent) {
                index = '0';
            }
            else if (isFractionItem && isRaisedToPower) {
                index = '0.0';
            }
            else if (isFractionItem) {
                index = '0';
            }
            else {
                index = '0';
                isEqnView = true;
            }

            this._formEquationManager.dropBinTileUsingContextMenu(index, isEqnView, isDenominator, isBigParenthesisExponent);

        },


        _enableDroppables: function _enableDroppables($tile) {
            var tileId = $tile.attr('id').replace(this.idPrefix, ''),
                tileTabIndex = this.getTabIndex(tileId);

            this.setTabIndex('multiplication-img', tileTabIndex + 2);
            this.setTabIndex('division-numerator', tileTabIndex + 4);
            this.setTabIndex('division-denominator', tileTabIndex + 6);
            this.setFocus('multiplication-img');
        },

        _disableDroppables: function _disableDroppables() {
            this.enableTab('multiplication-img', false);
            this.enableTab('division-numerator', false);
            this.enableTab('division-denominator', false);
        },

        _activateClickEventsOnTiles: function () {
            var allowedCase = this.model.get('allowedCases'),
             ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;

            if (allowedCase & ExponentAccordionModel.IS_NEGATIVE_BASES_ALLOWED) {
                this._attachNegateTileEvents('.base-draggable-tiles');
            }
            if (allowedCase & ExponentAccordionModel.IS_NEGATIVE_EXPONENTS_ALLOWED) {
                this._attachNegateTileEvents('.exponent-draggable-tiles');
            }

        },

        /**
        * Attach events on tooltip
        * @method _attachTooltipEvents
        * @private
        */
        _attachTooltipEvents: function () {
            var TOOLTIP_EVENTS = MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS,
                MARQUEE_EVENTS = equationManagerNamespace.Marquee.EVENTS;

            this.listenTo(this.maxBasesAllowedTooltip, TOOLTIP_EVENTS.TOOLTIP_HIDE_ON_CLOSEBTN_CLICK, this._removeMarqueeOnTooltipClick);
            this.listenTo(this._formEquationManager.marqueeView, MARQUEE_EVENTS.MARQUEE_MOUSEDOWN, this._hideTooltip);
            this.maxBasesAllowedTooltip.$el.on('mousedown', $.proxy(this._removeMarqueeOnTooltipClick, this));
        },

        /**
        * Detach click event on given tile class
        *
        * @method _detachNegateTileEvents
        * @param {String} tileClass Tile class to be removed
        * @private
        */
        _detachNegateTileEvents: function (tileClass) {
            this.$(tileClass).off('click');
        },

        _tileClickEvent: function (scope, tile) {
            var $tile = tile,
                tileValue = parseInt($tile.attr('data-tilevalue'), 10) * -1,
                $tileText = $tile.find('.custom-btn-text'),
                tileText,
                self = this;

            if ($tile.hasClass('disabled') || this.stopEvent === true) {
                this.stopEvent = false;
                return;
            }
            this.model.set('tryAnotherBtnStatus', true);
            if (tileValue > 0) {
                tileText = '<span class="tile-number">' + tileValue + '</span>';
            } else {
                tileText = '<span class="tile-number">&minus;' + Math.abs(tileValue) + '</span>';
            }

            $tileText.html(tileText);
            $tile.attr('data-tilevalue', tileValue);

            $tile.addClass('animated fadeIn');
            this.animationStart();
            this.isAnimationRunning = true;
            //this._enableDisableAllBinTiles(false);
            $tile.off('webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd');
            this._updateTileValueInModel($tile, tileValue);
            if (this._isIE9) {
                $tile.removeClass('animated fadeIn');
                self.animationEnd();
                self.isAnimationRunning = false;
            }
            else {
                $tile.one('webkitAnimationEnd oanimationend msAnimationEnd animationend MSAnimationEnd', function () {
                    $tile.removeClass('animated fadeIn');
                    self.animationEnd();
                    self.isAnimationRunning = false;
                    //self._enableDisableAllBinTiles(true);
                });
            }
        },

        /**
        * Update the tile negated value in model
        *
        * @method _updateTileValueInModel
        * @param {Object} $tile Tile which value has been changed
        * @private
        */
        _updateTileValueInModel: function ($tile, tileValue) {
            var binTileType = $tile.data('tiletype'),
                binTileTypes = equationManagerModelNameSpace.TileItem.BinTileType,
                tileValue = parseInt($tile.attr('data-tilevalue'), 10),
                negatedArray;
            if (binTileType === binTileTypes.BASE) {
                negatedArray = this.model.get('isBinBaseNegated');
                negatedArray[Math.abs(tileValue) - 2] *= -1;
                this.model.set('isBinBaseNegated', negatedArray);
                if(tileValue > 0) {
                    this.setAccMessage('base-tile-value'+tileValue, this.getAccMessage('base-tile-value'+tileValue, 0));
                }
                else {
                    this.setAccMessage('base-tile-value'+Math.abs(tileValue), this.getAccMessage('extra-messages', 4) +' '+ this.getAccMessage('base-tile-value'+Math.abs(tileValue), 0));
                }
            }
            else if (binTileType === binTileTypes.EXPONENT) {
                negatedArray = this.model.get('isBinExpNegated');
                negatedArray[Math.abs(tileValue) - 1] *= -1;
                this.model.set('isBinExpNegated', negatedArray);
                if(tileValue > 0) {
                    this.setAccMessage('exponent-tile-value'+tileValue, this.getAccMessage('exponent-tile-value'+tileValue, 0));
                }
                else {
                    this.setAccMessage('exponent-tile-value'+Math.abs(tileValue), this.getAccMessage('extra-messages', 4) +' '+ this.getAccMessage('exponent-tile-value'+Math.abs(tileValue), 0));
                }
            }
        },

        _attachBinBaseTileListeners: function () {
            var i,
                dragEvents = MathInteractives.Common.Components.Models.DragDrop.EVENTS.DRAG,
                dragModelArray = this.baseTilesViews.getDragModelArr();
            for (i = 0; i < dragModelArray.length; i++) {
                this.listenTo(dragModelArray[i], dragEvents.START, $.proxy(this._onBinTileDragStart, this));
                this.listenTo(dragModelArray[i], dragEvents.DRAG, $.proxy(this._onBinTileDragging, this));
                this.listenTo(dragModelArray[i], dragEvents.STOP, $.proxy(this._onBinTileDragStop, this));
                this.applyHandCursor(this.baseTilesViews.dragButtonViews[i].$el);
            }
        },

        _attachBinExponentTileListeners: function () {
            var i,
                dragEvents = MathInteractives.Common.Components.Models.DragDrop.EVENTS.DRAG,
                dragModelArray = this.exponentTilesViews.getDragModelArr();
            for (i = 0; i < dragModelArray.length; i++) {
                this.listenTo(dragModelArray[i], dragEvents.START, $.proxy(this._onBinTileDragStart, this));
                this.listenTo(dragModelArray[i], dragEvents.DRAG, $.proxy(this._onBinTileDragging, this));
                this.listenTo(dragModelArray[i], dragEvents.STOP, $.proxy(this._onBinTileDragStop, this));
                this.applyHandCursor(this.exponentTilesViews.dragButtonViews[i].$el);
            }
        },

        _attachBinParenthesisTileListeners: function () {
            var i,
                dragEvents = MathInteractives.Common.Components.Models.DragDrop.EVENTS.DRAG,
                dragModelArray = this.parenthesisTilesViews.getDragModelArr();
            for (i = 0; i < dragModelArray.length; i++) {
                this.listenTo(dragModelArray[i], dragEvents.START, $.proxy(this._onBinTileDragStart, this));
                this.listenTo(dragModelArray[i], dragEvents.DRAG, $.proxy(this._onBinTileDragging, this));
                this.listenTo(dragModelArray[i], dragEvents.STOP, $.proxy(this._onBinTileDragStop, this));
                this.applyHandCursor(this.parenthesisTilesViews.dragButtonViews[i].$el);
            }

        },


        _onBinTileDragStart: function (eventData) {
            //$('body').append('Start');
            this.deActivateClickEventsOnTiles();
            this.stopReading();
            var $element = eventData.$element,
                tiletype = $element.data('tiletype'),
                binTileTypes = equationManagerModelNameSpace.TileItem.BinTileType,
                $helper = $(eventData.ui.helper);

            if (tiletype !== binTileTypes.PARENTHESIS) {
                this._formEquationManager.removeMarquee();
                if (this._isTouch) {
                    this.stopEvent = true;
                }
            }

            $element.removeData('isDropped');
            $helper.addClass('bin-tiles-dragging-ui');
        },

        _onBinTileDragging: function (eventData) {
            var $element = eventData.$element,
                droppable = $element.data('cur-droppable');
            if (droppable) {
                droppable.onMouseOver(eventData.originalEvent, eventData.ui);
            }
        },

        _onBinTileDragStop: function (eventData) {
            this._activateClickEventsOnTiles();
            var ui = eventData.ui,
                $element = eventData.$element,
                tiletype = $element.data('tiletype'),
                binTileTypes = equationManagerModelNameSpace.TileItem.BinTileType,
                allowedCase = this.model.get('allowedCases'),
                ExponentAccordionModel = modelNameSpace.ExponentAccordion;

            if (this._formEquationManager) {
                this._formEquationManager.setIsDropped(false);
                this._formEquationManager.refresh();
            }
            if (tiletype === binTileTypes.BASE && !(allowedCase & ExponentAccordionModel.IS_NEGATIVE_BASES_ALLOWED)) {
                this.stopEvent = false;
            }
            else if (tiletype === binTileTypes.EXPONENT && !(allowedCase & ExponentAccordionModel.IS_NEGATIVE_EXPONENTS_ALLOWED)) {
                this.stopEvent = false;
            }

            ui.helper.removeData('cur-droppable');
            $element.removeData('isDropped');
            this.animationEnd();
            //$element.removeClass('bin-tiles-dragging-ui');
        },

        _onClickViewData: function _onClickViewData() {
            this.stopReading();
            this.model.set('viewDataBtnClick', true);
            this.player.switchToTab(3);
        },

        _onClickBuildModeResetButton: function _onClickBuildModeResetButton() {
            this.stopReading();
            this._showResetPopup();
        },

        _showResetPopup: function _showResetPopup() {
            var self = this;
            if (this.isPopupExist) {
                return ;
            }
            this.resetPopupView = MathInteractives.global.Theme2.PopUpBox.createPopup({
                text: this.getMessage('reset-popup', 'text'),
                accText: this.getAccMessage('reset-popup', 'text'),
                title: this.getMessage('reset-popup', 'title'),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                buttons: [{
                    id: 'yes-btn',
                    text: this.getMessage('reset-popup', 'yes'),
                    response: { isPositive: true, buttonClicked: this.idPrefix + 'yes-btn' },
                    clickCallBack: {
                        fnc: this._resetScreen,
                        scope: this
                    }
                },
                          {
                              id: 'cancel-btn',
                              text: this.getMessage('reset-popup', 'cancel'),
                              response: { isPositive: false, buttonClicked: this.idPrefix + 'cancel-btn' },
                              clickCallBack: {
                                  fnc: this._onClickCancelOfResetInBuildMode,
                                  scope: this
                              }
                          }]
            });

            this.resetPopupView.$('#' + this.idPrefix + 'yes-btn').off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 32) {
                    var currentView = self.model.get('exploreView'),
                        ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;

                    if (currentView === ExponentAccordionModel.EXPLORE_VIEW.FORMATION) {
                        setTimeout(function () { self.setFocus('droppable-region'); }, 5);
                    }
                    else if (currentView === ExponentAccordionModel.EXPLORE_VIEW.WORKSPACE) {
                        setTimeout(function () { self.setFocus('workspace-scrollable'); }, 5);
                    }
                }
            });
            this.isPopupExist = true;
        },

        _resetScreen: function _resetScreen() {
            this.isPopupExist = false;
            var currentView = this.model.get('exploreView'),
             ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;

            if (currentView === ExponentAccordionModel.EXPLORE_VIEW.FORMATION) {
                this._resetBuildModeScreen();
            }
            else if (currentView === ExponentAccordionModel.EXPLORE_VIEW.WORKSPACE) {
                this._resetSolveModeScreen();
            }
        },


        _resetBuildModeScreen: function _resetBuildModeScreen() {
            var exprJSON = this._getResetJson(),
                disableState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED,
                buttonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton,
                raisedToPower = this.model.get('raisedToPower');

            this.resetClicked = true;
            this._setNewEquation(this._formEquationManager, this.$('#' + this.idPrefix + 'form-expression-area'), JSON.parse(JSON.stringify(exprJSON)), true, false);
            this._enableDisableAllBinTiles(true);
            //this.buildModeUndoButtonView.setButtonState(disableState);
            this._disableEnableButtons(this.buildModeUndoButtonView, false);
            //this.buildModeResetButtonView.setButtonState(disableState);
            this._disableEnableButtons(this.buildModeResetButtonView, false);
            this._resetAllBinTiles();
            if (raisedToPower === true) {
                this.toggleButtonView.changeStateOfToggleButton(buttonClass.TOGGLEBUTTON_STATE_ON);
                this.model.set('raisedToPower', true);
            }
            else if (this.toggleButtonView !== null) {
                this.toggleButtonView.changeStateOfToggleButton(buttonClass.TOGGLEBUTTON_STATE_OFF);
                this.model.set('raisedToPower', false);
                if (this.model.get('buildModeDivisionMode') === false) {
                    //this.toggleButtonView.changeStateOfToggleButton(buttonClass.TOGGLEBUTTON_STATE_DISABLED);
                    this._enableDisableToggleButtonState(false);
                }
            }

            this._formEquationManager.resetTileCounters();
            this._formEquationManager.getEquationStatusModifyBin();
            this.resetClicked = false;
            this.model.set('tileDropped', false);
            this.model.set('randomExprButtonClick', false);
            this._formEquationManager.equationView.tileDroppedString = this.getMessage('base-exp-pair', 23);
            //this.setFocus('droppable-region');
        },

        _resetSolveModeScreen: function _resetSolveModeScreen() {
            if (this._equationManager === null) {
                this._createEquationManager();
            }
            this._setNewEquation(this._equationManager,
                                     this.$('#' + this.idPrefix + 'workspace-expression-area'),
                                     this.model.get('equationData'),
                                     true, true);
            this._resetAccordionData();
            this.animationEnd();
            //this.setFocus('workspace-scrollable');
        },

        _getResetJson: function _getResetJson() {
            var exprJSON,
                tileType = equationManagerModelNameSpace.TileItem.BinTileType;

            if (this.model.get('raisedToPower') === true) {
                exprJSON = {
                    tileArray: [
                        {
                            "bDenominator": false,
                            "base": null,
                            "exponent": null,
                            "operator": null,
                            "tileArray": [
                                {
                                    "tileArray": [
                                        {
                                            "type": "BASE_EXPONENT",
                                            "base": null,
                                            "bDenominator": false,
                                            "exponent": null
                                        },
                                        {
                                            "type": "BASE_EXPONENT",
                                            "base": null,
                                            "exponent": null,
                                            "bDenominator": true
                                        }
                                    ],
                                    "type": "FRACTION",
                                    "bDenominator": false
                                }
                            ],
                            "type": "BIG_PARENTHESIS"
                        }
                    ],
                    "type": "EQUATION_COMPONENT",
                    "bDenominator": false
                }
            }
            else if (this.model.get('buildModeDivisionMode')) {
                exprJSON = {
                    tileArray: [
                        {
                            tileArray: [
                                {
                                    base: null,
                                    exponent: null,
                                    type: tileType.BASE_EXPONENT
                                },
                                {
                                    base: null,
                                    exponent: null,
                                    bDenominator: true,
                                    type: tileType.BASE_EXPONENT
                                }
                            ],
                            type: tileType.FRACTION
                        }
                    ],
                    "type": "EQUATION_COMPONENT",
                    "bDenominator": false
                };
            }
            else {
                exprJSON = {
                    tileArray: [
                        {
                            base: null,
                            exponent: null,
                            type: tileType.BASE_EXPONENT

                        },
                        {
                            base: null,
                            exponent: null,
                            operator: '*',
                            type: tileType.BASE_EXPONENT

                        }
                    ],
                    "type": "EQUATION_COMPONENT",
                    "bDenominator": false
                };
            }
            return exprJSON;
        },


        _onClickCancelOfResetInBuildMode: function _onClickCancelOfResetInBuildMode() {
            this.isPopupExist = false;
            var currentView = this.model.get('exploreView'),
             ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;

            if (currentView === ExponentAccordionModel.EXPLORE_VIEW.FORMATION) {
                this.setFocus('build-mode-reset-button');
            }
            else if (currentView === ExponentAccordionModel.EXPLORE_VIEW.WORKSPACE) {
                this.setFocus('solve-mode-reset-button');
            }
        },

        _solveModeResetButtonClick: function _solveModeResetButtonClick() {
            this.stopReading();
            this._showResetPopup();
        },

        /*_bindEventOnExpressionIncompleteTooltip: function _bindEventOnExpressionIncompleteTooltip() {
            var self = this,
                documentClickEvent = MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_DOCUMENT_CLICK;
            this.expressionIncompleteTooltip.off(documentClickEvent).on(documentClickEvent, function () {
                self.doneButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            });
        },*/

        /**
        * Handler called on mouse down.
        * @method onMouseDown
        * @param {Object} Event object
        */
        onMouseDown: function (event) {
            this._removeMarquee(event);
            this._hideTooltip();
            this._hideCombineLikeBasesTooltip();

        },

        /**
        * Removes highlight on tiles.
        * @method removeHighlightTiles
        */
        removeHighlightTiles: function () {
            if (this._equationManager) {
                this._equationManager.removeHighlightTilesImmediate();
            }
        },

        /**
        * Handler called whenever the el is clicked. It checks if the clicked element was an exception.
        * If yes it returns. Otherwise it removes the marquee.
        * @method _removeMarquee
        * @private
        * @param {Object} Event object
        * @return {Boolean} Exit status. True if marquee is removed. False otherwise.
        */
        _removeMarquee: function (event) {
            var $target = $(event.target),
                exceptions = this._marqueeRemoveExceptions,
                i = 0;
            for (i = 0; i < exceptions.length; i++) {

                if (_.intersection($target, $(exceptions[i])).length > 0 ||
                    _.intersection($target.parents(exceptions[i]), $(exceptions[i])).length > 0) {
                    return;
                }
            }

            if (this._formEquationManager) { this._formEquationManager.removeMarquee() };
            if (this._equationManager) { this._equationManager.removeMarquee(); }
            return true;
        },

        /**
        * Called when close button on the feedback tooltip is clicked.
        * @method _removeMarqueeOnTooltipClick
        * @private
        */
        _removeMarqueeOnTooltipClick: function () {
            this._formEquationManager.removeMarquee();
        },

        /**
        * Hide the max bases allowed tooltip
        * @method _hideTooltip
        * @private
        */
        _hideTooltip: function () {
            this.maxBasesAllowedTooltip.hideTooltip();
        },

        /**
        * Hides the combine like bases tooltip
        * @method _hideCombineLikeBasesTooltip
        * @private
        */
        _hideCombineLikeBasesTooltip: function () {
            this.combineLikeBasesTooltip.hideTooltip();
            this.combineLikeBasesTooltip.$el.css({left: '0px'});
        },

        /**
        * random expretion click handler
        *
        * @method _randomExpressionButtonClick
        * @private
        **/
        _randomExpressionButtonClick: function _randomExpressionButtonClick() {
            this.stopReading();
            this.model.set('tryAnotherBtnStatus', true);
            this.model.set('randomExprButtonClick', true);
            //isFraction, maxUniqueBasesAllowed, isNegBaseAllowed, isNegExpAllowed, isParenthesisAllowed, isNegParenthesisAllowed, isRaiseToPower
            var allowedOperations = this.model.get('allowedCases'),
                ExponentAccordionModel = modelNameSpace.ExponentAccordion,
                exprJSON,
                randomExpr = new MathInteractives.Common.Interactivities.ExponentAccordion.Models.RandomExpression(),
                isFraction = ((allowedOperations & ExponentAccordionModel.IS_DIVISION_ALLOWED) === ExponentAccordionModel.IS_DIVISION_ALLOWED),
                isRaiseToPower = ((allowedOperations & ExponentAccordionModel.IS_RAISED_TO_POWER_ALLOWED) === ExponentAccordionModel.IS_RAISED_TO_POWER_ALLOWED),
                toggleButtonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton;

            if (this.toggleButtonView) {
                this.resetClicked = true;
                this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_OFF);
                //this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_DISABLED);
                this._enableDisableToggleButtonState(false);
                this.model.set('raisedToPower', false);
                this.resetClicked = false;
            }
            //sp. case for ea 3 and 4 where user can generate multiplication or division expression.
            if (this.model.get('manualTileDrop') === true) {
                if (!this.model.get('userSelectedMode')) {
                    isFraction = false;
                    isRaiseToPower = false;
                }
                else if (MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(0, 1) == 1) {
                    isRaiseToPower = false;
                }
            }
            else {
                if (isFraction) {
                    if (MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(0, 1) == 1) {
                        isFraction = false;
                        isRaiseToPower = false;
                    }
                }
                if (isFraction !== false && isRaiseToPower) {
                    if (MathInteractives.Common.Utilities.Models.Utils.getRandomIntegerNumber(0, 1) == 1) {
                        isRaiseToPower = false;
                    }
                }
            }

            exprJSON = randomExpr.getExpression(
                isFraction,
                this.model.get('noOfBasesAllowed'),
                this.model.get('isAbsolute'),
                (allowedOperations & ExponentAccordionModel.IS_NEGATIVE_BASES_ALLOWED) === ExponentAccordionModel.IS_NEGATIVE_BASES_ALLOWED,
                (allowedOperations & ExponentAccordionModel.IS_NEGATIVE_EXPONENTS_ALLOWED) === ExponentAccordionModel.IS_NEGATIVE_EXPONENTS_ALLOWED,
                (allowedOperations & ExponentAccordionModel.IS_PARENTHESIS_ALLOWED) === ExponentAccordionModel.IS_PARENTHESIS_ALLOWED,
                (allowedOperations & ExponentAccordionModel.IS_NEGATIVE_PARENTHESIS_ALLOWED) === ExponentAccordionModel.IS_NEGATIVE_PARENTHESIS_ALLOWED,
                isRaiseToPower,
                this.model.get('accordionLevel'));

            if (this.toggleButtonView && this.toggleButtonView.getButtonState() === toggleButtonClass.TOGGLEBUTTON_STATE_DISABLED && isFraction) {
                this.resetClicked = true;
                this._enableDisableToggleButtonState(true);
                //this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_ENABLED);
                this.resetClicked = false;
            }

            if (this.toggleButtonView && this.toggleButtonView.getButtonState() !== toggleButtonClass.TOGGLEBUTTON_STATE_DISABLED) { //DO NOT CACHE button state
                this.toggleBigParenthesisButton(isRaiseToPower);
            }


            if (!isFraction) {
                this._$elmFormExpDropRegion.removeClass('division').addClass('multiplication');
                this.model.set('buildModeDivisionMode', false);
            }
            else {
                this._$elmFormExpDropRegion.removeClass('multiplication').addClass('division');
                this.model.set('buildModeDivisionMode', true);
            }
            //this._$elmRaisedToPowerImgContainer.hide();
            this.model.set('tileDropped', true);
            this.model.set('buildModeDoneButtonStatus', true);
            this._setNewEquation(this._formEquationManager, this.$('#' + this.idPrefix + 'form-expression-area'), JSON.parse(exprJSON), true, false);
            this._showHideFormEquationView(true);
            this._formEquationManager.getEquationStatusModifyBin();
            this._formEquationManager.commandFactory.resetUndoStack();
            //this.buildModeResetButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            this._disableEnableButtons(this.buildModeResetButtonView, true);
            this._updateContextMenu(false);
            this.updateFocusRect('droppable-region');
        },

        /**
        * done button click handler
        *
        * @method _doneButtonClick
        * @private
        **/
        _doneButtonClick: function _doneButtonClick() {
            var modelToObj,
                disableState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this.stopReading();
            if (this._validateExpression()) {
                if (this._equationManager) {
                    this._equationManager.resetData();
                }

                this._formEquationManager.addTileForNegativeParCoeff();
                modelToObj = JSON.parse(JSON.stringify(this._formEquationManager.equationView.model.toJSON()));
                this.model.set('equationData', modelToObj);
                this.model.set('equationDataSolveMode', $.extend(true, {}, modelToObj));
                this.model.set('solveModeDivisionMode', this.model.get('buildModeDivisionMode'));

                if (!this.model.get('buildModeDivisionMode') && this.model.get('accordionLevel') > 2) {
                    modelToObj = this._formEquationManager.wrapFractionTileItem(modelToObj);
                    this.model.set('solveModeDivisionMode', true);
                }

                this._formEquationManager.resetData();

                this._showHideEquationManager(true);
                this._createEquationManager();
                this._setNewEquation(this._equationManager,
                                     this.$('#' + this.idPrefix + 'workspace-expression-area'),
                                     modelToObj,
                                     true, false);
                //this._equationManager.render();
                this._renderOriginalExpression();
                this.model.set('exploreView', modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE);
                this._equationManager.showMarquee();
                this._equationManager.removeMarquee();      // Remove marquee explicitly #2879
                //this.solveModeUndoButtonView.setButtonState(disableState);
                this._disableEnableButtons(this.solveModeUndoButtonView, false);
                //this.solveModeResetButtonView.setButtonState(disableState);
                this._disableEnableButtons(this.solveModeResetButtonView, false);
                this._setDirectionTextOfExplore(modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE);
                this.setFocus('direction-text-container-direction-text-text');
            }
            else {
                if (this.model.get('buildModeDivisionMode')) {
                    if (this.tileStatus[0] >= 1 && this.tileStatus[1] >= 1) {
                        this._renderExpressionIncomplete();
                    }
                    else {
                        this._renderExpressionNotFilledFractionMode();
                    }
                }
                else {
                    if (this.tileStatus[0] >= 2) {
                        this._renderExpressionIncomplete();
                    }
                    else {
                        this._renderExpressionNotFilled();
                    }
                }
                this._setFocusToMaxBasesAllowedTooltip();
            }

            this.updateFocusRect('workspace-scrollable');
            //this.updateFocusRect('solve-mode-undo-button');
            //this.updateFocusRect('solve-mode-reset-button');
            //this.updateFocusRect('view-data-button');
        },

        _setDirectionTextOfExplore: function _setDirectionTextOfExplore(exploreView) {
            if (exploreView === modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE) {
                this.directionBoxView.changeDirectionText(this.getMessage('direction-text', 3), false);
            }
            else if (exploreView === modelNameSpace.ExponentAccordion.EXPLORE_VIEW.FORMATION) {
                this.directionBoxView.changeDirectionText(this.getMessage('direction-text', 0), false);
            }

        },

        /**
        * Show/Hide equation manager
        * And also hide Drop region
        *
        * @method _showHideEquationManager
        * @param {Boolean} show True to show equation manager
        * @private
        */
        _showHideEquationManager: function (show) {
            if (show) {
                this.$elmFormExpressionContainer.hide();
                this.$elmWorkspaceContainer.show();
                this._$elmFormExpDropRegion.hide();
                this._$droppableTitleText.hide();
            }
            else {
                this.$elmFormExpressionContainer.show();
                this.$elmWorkspaceContainer.hide();
                this._$elmFormExpDropRegion.show();
                this._$droppableTitleText.show();
            }
        },

        _solveModeUndoBtnClick: function _solveModeUndoBtnClick(event) {
            var self = this;
            this.stopReading();

            this._equationManager.undo();

            window.setTimeout(function () {
                if (event.which == undefined) {
                    self.setFocus('workspace-scrollable');
                }
            }, 0);
        },


        _showHideInitialScreen: function _showHideInitialScreen(show) {
            if (show) {
                this.$elmFormExpressionContainer.hide();
                this.$elmWorkspaceContainer.show();
            }
            else {
                this.$elmFormExpressionContainer.show();
                this.$elmWorkspaceContainer.hide();
            }
        },


        /**
        * handler for state change of toggle button
        *
        * @method _changeToggleState
        * @private
        **/
        _changeToggleState: function _changeToggleState() {
            this.stopReading();
            var buttonState = this.toggleButtonView.getButtonState(),
                togglebuttonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton;
            if (this.resetClicked === true) {
                return;
            }
                /*if (this.tileDropped === false) {
                        if (buttonState === togglebuttonClass.TOGGLEBUTTON_STATE_ON) {
                            this._$elmStartDropRegionDivisionContainer.hide();
                            this._$elmRaisedToPowerImgContainer.show();
                            this.model.set('raisedToPower', true);
                        }
                        else if (buttonState === togglebuttonClass.TOGGLEBUTTON_STATE_OFF) {
                            this._$elmRaisedToPowerImgContainer.hide();
                            this._$elmStartDropRegionDivisionContainer.show();
                            this.model.set('raisedToPower', false);
                        }
                    }*/
            else {
                if (buttonState === togglebuttonClass.TOGGLEBUTTON_STATE_ON) { //if state is on after click
                    this._changeToggleStateOnOrOff(true);
                }
                else if (buttonState === togglebuttonClass.TOGGLEBUTTON_STATE_OFF) {
                    this._changeToggleStateOnOrOff(false);
                }
            }
        },

        /**
        * Calls form-equation manager's toggleBigParenthesis method if it's an internal toggle and sets raisedToPower
        * boolean in model
        *
        * @method _changeToggleStateOnOrOff
        * @param on {Boolean} If toggle button is switched to on, then true. If off then, false.
        * @private
        */
        _changeToggleStateOnOrOff: function (on) {
            if (this.internalToggle === true) {
                this._formEquationManager.toggleBigParenthesis(on);
            }
            this.model.set('raisedToPower', on);
        },

        toggleBigParenthesisButton: function toggleBigParenthesisButton(enable) {
            this.internalToggle = false;
            var ToggleButtonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton;
            if (enable) {
                this.toggleButtonView.changeStateOfToggleButton(ToggleButtonClass.TOGGLEBUTTON_STATE_ON);
            }
            else {
                this.toggleButtonView.changeStateOfToggleButton(ToggleButtonClass.TOGGLEBUTTON_STATE_OFF);
            }
            this.internalToggle = true;
        },

        _enableDisableToggleButtonState: function _enableDisableToggleButtonState(enable) {
            var elementId = 'raised-to-power-toggle-button-container',
                toggleButtonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton;
            if (this.toggleButtonView) {
                if (enable) {
                    this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_ENABLED);
                    this.player.enableHelpElement(elementId, 0, true);
                }
                else {
                    this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_DISABLED);
                    this.player.enableHelpElement(elementId, 0, false);
                }
            }
        },

        _disableEnableButtons: function _disableEnableButtons(btnView, enable) {
            var elementId = btnView.$el.attr('id').split(this.idPrefix)[1],
                buttonClass = MathInteractives.global.Theme2.Button;
            if (enable) {
                btnView.setButtonState(buttonClass.BUTTON_STATE_ACTIVE);
                this.player.enableHelpElement(elementId, 0, true);
            }
            else {
                btnView.setButtonState(buttonClass.BUTTON_STATE_DISABLED);
                this.player.enableHelpElement(elementId, 0, false);
            }
        },

        _onTileDrop: function (event, ui, $droppable, isFractionOn) {
            var evt = event.originalEvent ? event.originalEvent : event,
                rectClass = MathInteractives.Common.Utilities.Models.Rect,
                ptMouse = new MathInteractives.Common.Utilities.Models.Point({ left: evt.clientX, top: evt.clientY }),
                equationData = {},
                data = {},
                baseExpTileType = equationManagerModelNameSpace.TileItem.SolveTileType['BASE_EXPONENT'],
                numTileData = { type: baseExpTileType, bDenominator: false, base: null, exponent: null },
                numTileData2 = { type: baseExpTileType, bDenominator: false, base: null, exponent: null, operator: '*' },
                denoTileData = { type: baseExpTileType, bDenominator: true, base: null, exponent: null },
                tileData = ui.helper.data(),
                tileValue = tileData.tilevalue,
                tileType = tileData.tiletype,
                fractionMode = isFractionOn,
                type,
                destIndex = null,
                replaceTileData = { sourceTile: ui.helper }, accordionLevel = this.model.get('accordionLevel');
            this.model.set('buildModeDivisionMode', fractionMode);
            this.model.set('manualTileDrop', true);
            this.model.set('userSelectedMode', fractionMode);

            equationData = {
                tileArray:
                [
                    {
                        tileArray: [],
                        arrOperators: []
                    }
                ],
                arrOperators: []
            };
            equationData.type = equationManagerModelNameSpace.TileItem.SolveTileType.EQUATION_COMPONENT;
            //FRACTION Mode On and Off
            if (fractionMode) {
                var rectDroppable = new rectClass($droppable.getBoundingClientRect()),
                    middleOfDroppable = rectDroppable.getMiddle();

                equationData.tileArray[0].tileArray[0] = numTileData;
                equationData.tileArray[0].tileArray[1] = denoTileData;
                type = equationManagerModelNameSpace.TileItem.SolveTileType.FRACTION;
                equationData.tileArray[0].type = type;
                if (ptMouse.getTop() <= middleOfDroppable.getTop()) {
                    destIndex = '0.0';
                }
                else {
                    destIndex = '0.1';
                }
                this._$elmFormExpDropRegion.removeClass('multiplication').addClass('division');
                this.model.set('buildModeDivisionMode', true);
                if (this.toggleButtonView !== null) {
                    this.resetClicked = true;
                    //this.toggleButtonView.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ENABLED);
                    this._enableDisableToggleButtonState(true);
                    this.resetClicked = false;
                    this.toggleBigParenthesisButton(false);
                }
            }
            else {
                equationData.tileArray[0] = numTileData;
                equationData.tileArray[1] = numTileData2;
                destIndex = '0';
                this._$elmFormExpDropRegion.removeClass('division').addClass('multiplication');
                this.model.set('buildModeDivisionMode', false);
            }
            this._showHideFormEquationView(true);
            data = {
                cmdFactoryData: {
                    allowedOperation: this.model.get('allowedOperation'),
                    maxPrimeLimit: this.model.get('maxPrimeLimit'),
                    undoStack: [],
                },
                equationData: equationData,
                equationViewContainer: this.$('#' + this.idPrefix + 'form-expression-area'),
                player: this.player,
                filePath: this.filePath,
                manager: this.manager,
                idPrefix: this.idPrefix
            }
            if (this._formEquationManager == null) {
                this.createFormEquationManager();
            }
            this._formEquationManager.setData(data);
            this._formEquationManager.render();

            replaceTileData.destTile = this._formEquationManager.getViewFromIndex(destIndex);
            this._formEquationManager.onReplaceTile(replaceTileData);
            if (fractionMode === true) {
                this._formEquationManager.enableDroppableEquationView(false);
            }
            else {
                this._formEquationManager.enableDroppableEquationView(true);
            }
            ui.draggable.data('isDropped', true);
            ui.helper.isDropped = true;

            this.model.set('tileDropped', true);
            this.model.set('buildModeDoneButtonStatus', true);
            this._formEquationManager.getEquationStatusModifyBin();
            //this.buildModeResetButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            this._disableEnableButtons(this.buildModeResetButtonView, true);
            this.model.set('tryAnotherBtnStatus', true);

            this._updateContextMenu(false);
            this.updateFocusRect('droppable-region');
            //this._editContextMenus(accordionLevel);

        },

        _onTileDropForAcc: function _onTileDropForAcc(event, ui, $droppable, isFractionOn, destIndex, $selectedTile) {
            var equationData = {},
                data = {},
                baseExpTileType = equationManagerModelNameSpace.TileItem.SolveTileType['BASE_EXPONENT'],
                numTileData = { type: baseExpTileType, bDenominator: false, base: null, exponent: null },
                numTileData2 = { type: baseExpTileType, bDenominator: false, base: null, exponent: null, operator: '*' },
                denoTileData = { type: baseExpTileType, bDenominator: true, base: null, exponent: null },
                target = $selectedTile || $(event.currentTarget),
                tileData = target.data(),
                tileValue = tileData.tilevalue,
                tileType = tileData.tiletype,
                fractionMode = isFractionOn,
                type,
                destIndex,
                replaceTileData = { sourceTile: target };
            this.model.set('buildModeDivisionMode', fractionMode);
            this.model.set('manualTileDrop', true);
            this.model.set('userSelectedMode', fractionMode);

            equationData = {
                tileArray:
                [
                    {
                        tileArray: [],
                        arrOperators: []
                    }
                ],
                arrOperators: []
            };
            equationData.type = equationManagerModelNameSpace.TileItem.SolveTileType.EQUATION_COMPONENT;
            //FRACTION Mode On and Off
            if (fractionMode) {
                equationData.tileArray[0].tileArray[0] = numTileData;
                equationData.tileArray[0].tileArray[1] = denoTileData;
                type = equationManagerModelNameSpace.TileItem.SolveTileType.FRACTION;
                equationData.tileArray[0].type = type;
                //if (ptMouse.getTop() <= middleOfDroppable.getTop()) {
                //destIndex = '0.0';
                //}
                //else {
                //destIndex = '0.1';
                //}
                this._$elmFormExpDropRegion.removeClass('multiplication').addClass('division');
                this.model.set('buildModeDivisionMode', true);
                if (this.toggleButtonView !== null) {
                    this.resetClicked = true;
                    //this.toggleButtonView.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ENABLED);
                    this._enableDisableToggleButtonState(true);
                    this.resetClicked = false;
                    this.toggleBigParenthesisButton(false);
                }
            }
            else {
                equationData.tileArray[0] = numTileData;
                equationData.tileArray[1] = numTileData2;
                destIndex = '0';
                this._$elmFormExpDropRegion.removeClass('division').addClass('multiplication');
                this.model.set('buildModeDivisionMode', false);
            }
            this._showHideFormEquationView(true);
            data = {
                cmdFactoryData: {
                    allowedOperation: this.model.get('allowedOperation'),
                    maxPrimeLimit: this.model.get('maxPrimeLimit'),
                    undoStack: [],
                },
                equationData: equationData,
                equationViewContainer: this.$('#' + this.idPrefix + 'form-expression-area'),
                player: this.player,
                filePath: this.filePath,
                manager: this.manager,
                idPrefix: this.idPrefix
            }
            if (this._formEquationManager == null) {
                this.createFormEquationManager();
            }
            this._formEquationManager.setData(data);
            this._formEquationManager.render();

            replaceTileData.destTile = this._formEquationManager.getViewFromIndex(destIndex);
            this._formEquationManager.onReplaceTile(replaceTileData);
            if (fractionMode === true) {
                this._formEquationManager.enableDroppableEquationView(false);
            }
            else {
                this._formEquationManager.enableDroppableEquationView(true);
            }
            target.data('isDropped', true);
            //ui.helper.isDropped = true;

            this.model.set('tileDropped', true);
            this.model.set('buildModeDoneButtonStatus', true);
            this._formEquationManager.getEquationStatusModifyBin();
            //this.buildModeResetButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            this._disableEnableButtons(this.buildModeResetButtonView, true);
            this.model.set('tryAnotherBtnStatus', true);
            this._updateContextMenu(false);
            this.updateFocusRect('droppable-region');
            this._formEquationManager.equationView.tileDroppedString = this.getAccMessage('base-exp-pair', 5, [tileValue]);
            this.setFocus('droppable-region');
        },

        /**
        * Handler called when the undo button in build mode is clicked
        *
        * @method _buildModeUndoClickHandler
        * @private
        * @chainable
        */
        _buildModeUndoClickHandler: function (event) {
            this.stopReading();
            this._formEquationManager.undo();

            if (event.which == undefined) {
                this.setFocus('droppable-region');
            }

            return this;
        },

        /**
        * Renders the background
        *
        * @method _renderBackground
        * @private
        **/
        _renderBackground: function () {
            this.$el.css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' }).addClass('bg');
            this._$elmStartDropRegionMultiplicationContainer.find('.multiplication-img').css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' });
            this._$elmStartDropRegionDivisionContainer.find('.division-img').css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' });
            //this._$elmRaisedToPowerImgContainer.find('.raised-to-power-img').css({ 'background-image': 'url("' + this.filePath.getImagePath('raised-to-power') + '")' });
        },

        /**
        * Renders direction text
        *
        * @method _renderDirectionText
        * @private
        **/
        _renderDirectionText: function _renderDirectionText() {
            if (this.directionBoxView === null) {
                var options = {
                    idPrefix: this.idPrefix,
                    containerId: this.idPrefix + 'direction-text-container',
                    manager: this.manager,
                    player: this.player,
                    path: this.filePath,
                    text: '',
                    accText: '',
                    btnBaseClass: 'btn-yellow',
                    ttsBaseClass: 'tts-yellow',
                    showButton: true,
                    btnColorType: MathInteractives.global.Theme2.Button.COLORTYPE.HEADER_BLUE,
                    btnTextColor: '#222222',
                    buttonText: this.getMessage('try-another-text', 0),
                    clickCallback: {
                        fnc: this._clickedTryAnother,
                        scope: this
                    },
                    textColor: '#FFFFFF',
                    //btnTextColor: '#1F0C01',
                    containmentBGcolor: '#282828',
                    buttonTabIndex: 760,
                    tabIndex: 501
                };
                if (this.model.get('exploreView') === modelNameSpace.ExponentAccordion.EXPLORE_VIEW.FORMATION) {
                    options.text = this.getAccMessage('direction-text', 0);
                    options.accText = this.getAccMessage('direction-text', 0);
                }
                else if (this.model.get('exploreView') === modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE) {
                    options.text = this.getAccMessage('direction-text', 3);
                    options.accText = this.getAccMessage('direction-text', 3);
                }
                this.directionBoxView = new MathInteractives.global.Theme2.DirectionText.generateDirectionText(options);
            }

        },

        _showHideFormEquationView: function (bShow) {
            var marqueeView = this._formEquationManager.marqueeView,
                accordionLevel = this.model.get('accordionLevel'),
                toggleButtonState = false;

            if (this.toggleButtonView !== null) {
                toggleButtonState = this.toggleButtonView.getButtonState() === MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ON ? true : false;
            }

            if (bShow) {
                if (this._$elmStartDropRegionMultiplicationContainer) {
                    this._$elmStartDropRegionMultiplicationContainer.hide();
                }
                if (this._$elmStartDropRegionDivisionContainer) {
                    this._$elmStartDropRegionDivisionContainer.hide();
                    this._$elmStartHorizontalSaperator.hide();
                }
                /*if (this._$elmRaisedToPowerImgContainer) {
                    this._$elmRaisedToPowerImgContainer.hide();
                }*/
                if (this._$elmStartDropRegionDivisionContainer) {
                    this._$elmStartDropRegionDivisionContainer.hide();
                    this._$elmStartHorizontalSaperator.hide();
                }

                if (this._$elmFormExpDropRegion) {
                    this._$elmFormExpDropRegion.show();
                }
                if (this._$droppableTitleText) {
                    this._$droppableTitleText.show();
                }
                if (marqueeView) {
                    marqueeView.enableMarquee();
                }
                this._showHideEquationManager(false);

            } else if (bShow === false) {
                if (marqueeView) {
                    marqueeView.disableMarquee();
                }

                if (this._$elmStartDropRegionMultiplicationContainer) {
                    this._$elmStartDropRegionMultiplicationContainer.show();
                }
                if (accordionLevel > 2) {
                    if (this._$elmStartDropRegionDivisionContainer) {
                        this._$elmStartDropRegionDivisionContainer.show();
                        this._$elmStartHorizontalSaperator.show();
                    }
                }
                if (toggleButtonState) {
                    this.resetClicked = true;
                    //this.toggleButtonView.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_DISABLED);
                    this._enableDisableToggleButtonState(false);
                    this.model.set('raisedToPower', false);
                    this.resetClicked = false;
                }


                if (this._$elmFormExpDropRegion) {
                    this._$elmFormExpDropRegion.hide();
                }
                if (this._$droppableTitleText) {
                    this._$droppableTitleText.hide();
                }

            }
        },

        /**
        * try another click handler
        *
        * @method _clickedTryAnother
        * @private
        **/
        _clickedTryAnother: function _clickedTryAnother() {
            this.stopReading();
            this._showTryAnotherPopup();

        },


        _showTryAnotherPopup: function _showTryAnotherPopup() {
            var currentView = this.model.get('exploreView'),
             ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion,
            text;

            if (currentView === ExponentAccordionModel.EXPLORE_VIEW.FORMATION) {
                text = this.getMessage('try-another-popup', 'text-formation');
            }
            else if (currentView === ExponentAccordionModel.EXPLORE_VIEW.WORKSPACE) {
                text = this.getMessage('try-another-popup', 'text-workspace');
            }

            this.tryAnotherPopupView = MathInteractives.global.Theme2.PopUpBox.createPopup({
                text: text,
                title: this.getMessage('try-another-popup', 'title'),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                buttons: [{
                    id: this.idPrefix + 'yes-btn',
                    text: this.getMessage('try-another-popup', 'yes'),
                    response: { isPositive: true, buttonClicked: this.idPrefix + 'yes-btn' },
                    clickCallBack: {
                        fnc: this._goToIntialScreen,
                        scope: this
                    }
                },
                          {
                              id: this.idPrefix + 'cancel-btn',
                              text: this.getMessage('try-another-popup', 'cancel'),
                              response: { isPositive: false, buttonClicked: this.idPrefix + 'cancel-btn' },
                              clickCallBack: {
                                  fnc: this._onClickCancelOfTryAnotherBuildMode,
                                  scope: this
                              }
                          }]
            });
        },

        /**
        * try another triggered from data tab.
        * @method fireTryAnother
        **/
        fireTryAnother: function () {
            if (this.model.get('clearAllData')) {
                this._goToIntialScreen();
                this.model.set('clearAllData', false);
            }
            if (this.model.get('dataTabTryAnotherClick')) {
                this._goToIntialScreen();
                this.model.set('dataTabTryAnotherClick', false);
            }
        },

        tryAnotherBtnStatus: function (model, value, options) {
            var elementId = 'direction-text-container-direction-text-buttonholder';
            if (value === true) {
                this.directionBoxView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.player.enableHelpElement(elementId, 0, true);
            }
            else {
                this.directionBoxView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                this.player.enableHelpElement(elementId, 0, false);
            }
        },



        _goToIntialScreen: function _goTointialScreen() {
            var accordionLevel = this.model.get('accordionLevel'),
                disableState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED,
                allowedCase = this.model.get('allowedCases'),
                ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion,
                toggleButtonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton;


            this._enableDisableAllBinTiles(true);
            //this.buildModeUndoButtonView.setButtonState(disableState);
            this._disableEnableButtons(this.buildModeUndoButtonView, false);
            //this.buildModeResetButtonView.setButtonState(disableState);
            this._disableEnableButtons(this.buildModeResetButtonView, false);
            this._resetAllBinTiles();
            if (allowedCase & ExponentAccordionModel.IS_PARENTHESIS_ALLOWED) {
                this.disabledParIndexes = [0, 1];
                this._disableParenthesis(this.disabledParIndexes);
            }
            if (this.toggleButtonView !== null) {
                this.internalToggle = false;
                this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_OFF);
                //this.toggleButtonView.changeStateOfToggleButton(toggleButtonClass.TOGGLEBUTTON_STATE_DISABLED);
                this._enableDisableToggleButtonState(false);
                this.internalToggle = true;
            }
            this._showHideFormEquationView(false);
            if (this._formEquationManager) {
                this._formEquationManager.resetData();
                this._formEquationManager.resetTileCounters();
            }
            if (this._equationManager) {
                this._equationManager.resetData();
            }
            this.model.set('tileDropped', false);
            this.model.set('buildModeDivisionMode', true);
            this.model.set('manualTileDrop', false);
            this.model.set('userSelectedMode', null);
            this.model.set('equationData', null);
            this.model.set('exploreView', modelNameSpace.ExponentAccordion.EXPLORE_VIEW.FORMATION);
            this._showHideInitialScreen(false);
            this.model.set('pureAndSimpleShown', false);
            this.model.set('tryAnotherBtnStatus', false);
            this.model.set('randomExprButtonClick', false);
            this.model.set('buildModeDoneButtonStatus', false);
            this._setDirectionTextOfExplore(modelNameSpace.ExponentAccordion.EXPLORE_VIEW.FORMATION);
            this._updateContextMenu(true);
            //this._editContextMenus(accordionLevel);
            this.updateFocusRect('base-tile-dispenser-container');
            this.updateFocusRect('exponents-tile-dispenser-container');
            this.updateFocusRect('parenthesis-tile-dispenser-container');
            if (this.model.get('dataTabTryAnotherClick')) {
                this.setFocus('header-subtitle', 20);
            } else {
                this.setFocus('direction-text-container-direction-text-text');
            }
        },

        _resetAllBinTiles: function _resetAllBinTiles() {
            var baseTileButtons = this.baseTilesViews.dragButtonViews,
                exponentTileButtons = this.exponentTilesViews.dragButtonViews, i, staticData = namespace.FormExpression, $text;
            for (i = 0; i < baseTileButtons.length; i++) {
                $text = baseTileButtons[i].$el.find('.custom-btn-text');
                $text.find('.tile-number').text(staticData.BASE_TILES_RESET_ARRAY[i]);
                baseTileButtons[i].$el.attr({ 'data-tilevalue': staticData.BASE_TILES_RESET_ARRAY[i] });
            }
            for (i = 0; i < exponentTileButtons.length; i++) {
                $text = exponentTileButtons[i].$el.find('.custom-btn-text');
                $text.find('.tile-number').text(staticData.EXPONENT_TILES_RESET_ARRAY[i]);
                exponentTileButtons[i].$el.attr({ 'data-tilevalue': staticData.EXPONENT_TILES_RESET_ARRAY[i] });
            }
            this.model.set('isBinBaseNegated', [1, 1, 1, 1, 1, 1, 1, 1]);
            this.model.set('isBinExpNegated', [1, 1, 1, 1, 1, 1, 1, 1, 1]);
        },


        _onClickCancelOfTryAnotherBuildMode: function _onClickCancelOfTryAnotherBuildMode() {
            this.setFocus('direction-text-container-direction-text-buttonholder');
        },

        //_setAllowedBases: function _setAllowedBases(tileValue) {
        //    var allowedBases = this.model.get('allowedBases'),
        //        staticData = namespace.FormExpression,
        //        allowedBasesLen = staticData.ALLOWED_BASES, len;

        //    if (allowedBases.indexOf(tileValue) === -1) {
        //        len = allowedBases.length;
        //        if (len < allowedBasesLen) {
        //            allowedBases.push(tileValue);
        //            this.model.set('allowedBases', allowedBases);
        //            if (allowedBasesLen === len + 1) {
        //                this._disableBaseTiles(allowedBases);
        //            }
        //        }
        //    }
        //},

        //_disableBaseTiles: function _disableBaseTiles(allowedBases) {
        //    this.$('.base-draggable-tiles').draggable('disable');
        //    var tileData = this.$('.base-draggable-tiles'),
        //        counter = 0;
        //    for (; counter < tileData.length; counter++) {
        //        if (allowedBases.indexOf($(tileData[counter]).data('tilevalue')) !== -1) {
        //            $(tileData[counter]).draggable('enable');
        //        }
        //    }
        //},

        /**
        * Enables/disables bin tiles passed in tileIndices array depending on boolean passed.
        *
        * @method _enableDisableSpecificBinElements
        * @param elementIndices {Object} Array of tile string-indices.
        * @param {Boolean} isEnableEvent True if enable drag-drop event
        * @param enable {Boolean} True to enable.
        */
        _enableDisableSpecificBinElements: function _enableDisableSpecificBinElements(elementIndices, enable, isEnableEvent) {
            enable = (enable !== false);
            var index,
                btnNamespace = MathInteractives.global.Theme2.Button,
                buttonState = enable ? btnNamespace.BUTTON_STATE_ACTIVE : btnNamespace.BUTTON_STATE_DISABLED,
                binElement;
            for (index = 0; index < elementIndices.length; index++) {
                binElement = this._getBinElementFromIndex(elementIndices[index]);
                if (binElement.isTile) {
                    binElement.element.setButtonState(buttonState/*, {
                    $dragTile: binElement.element.$el
                }*/);
                    if ((enable && isEnableEvent) || !enable) {
                        binElement.element.$el.draggable(enable ? 'enable' : 'disable');
                    }
                    if (enable) {
                        binElement.element.$el.removeClass('inactive');
                    }
                }
                else if (binElement.isToggle) {
                    this.resetClicked = true;
                    if (enable) {
                        //this.toggleButtonView.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ENABLED);
                        this._enableDisableToggleButtonState(true);
                        this.toggleButtonView.$el.removeClass('inactive on-inactive off-inactive');
                    }
                    else {
                        // todo: probably set to inactive state rather than disabled.
                        //this.toggleButtonView.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_DISABLED);
                        this._enableDisableToggleButtonState(false);
                        this._enableBinGroupTitleText(binElement.groupTitle, enable);
                    }
                    this.resetClicked = false;
                }
                else {
                    binElement.element.setButtonState(buttonState);
                }
                if (enable) {
                    this._enableBinGroupTitleText(binElement.groupTitle);
                }
            }
        },

        /**
        * Inactivates bin elements whose string indices are passed in the array.
        *
        * @method _inactivateSpecificBinElement
        * @param tileIndices {Object} Array of tile string-indices.
        */
        _inactivateSpecificBinElement: function _inactivateSpecificBinElement(tileIndices) {
            var index,
                groupTitlesToDisable = [],
                elementFound,
                buttonState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED,
                binElement;
            for (index = 0; index < tileIndices.length; index++) {
                binElement = this._getBinElementFromIndex(tileIndices[index]);
                elementFound = binElement.element;
                if (binElement.isTile) {
                    elementFound.setButtonState(buttonState/*, {
                    $dragTile: elementFound.$el,
                    isCenterAlign: true
                }*/);
                    elementFound.$el.draggable('disable')
                        .addClass('inactive');
                }
                    // todo: inactive toggle button
                else if (binElement.isToggle) {
                    elementFound.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_DISABLED);
                    if (binElement.toggleOn) {
                        elementFound.$el.addClass('inactive on-inactive');
                    }
                    else {
                        elementFound.$el.addClass('inactive off-inactive');
                    }
                }
                else {
                    elementFound.setButtonState(buttonState);
                }
                if (groupTitlesToDisable.indexOf(binElement.groupTitle) === -1) {
                    groupTitlesToDisable.push(binElement.groupTitle);
                }
            }
            for (index = 0; index < groupTitlesToDisable.length; index++) {
                this._enableBinGroupTitleText(binElement.groupTitle, false);
            }
        },

        /*
        * @method _getArrayInRange
        * @param min {Number} Starting Integer of array
        * @param max {Number} Ending Integer of array
        * @private
        **/
        _getArrayInRange: function _getArrayInRange(min, max) {
            return _.range(min, max + 1);
        },

        _attchBinEvents: function _attchBinEvents() {
            var _formEquationManager = this._formEquationManager;
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.DISABLE_ENABLE_BIN_BASES, this._binBaseTileStatus);
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.DISABLE_ENABLE_BIN_PARENTHESIS, this._binParenthesisStatus);
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.STACK_STATUS, this._undoStackStatus);
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.MAX_UNIQUE_BASES_LIMIT_REACHED, this._maxUniqueBasesLimitReached);
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.MAX_BASE_REACHED_IN_NUM_DEN, this._maxBasesInNumAndDenLimitReached);
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.DONE_BUTTON_STATUS, this._checkDoneButtonStaus);
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.NESTED_PARENTHESIS_CASE, this._nestedParenthesisCase);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.MARQUEE_DRAWN, this._addMarqueeScope);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.MARQUEE_REMOVED, this._removeMarqueeScope);
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.MAX_TERMS_ALLOWED_IN_PARENTHESIS, this._maxNoOfTermsInsideParenthesisCase);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.COMMAND_FIRED, this._checkErrors);
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.MAX_PARENTHESIS_REACHED, this._noOfParenthesisAllowedLimitReached);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.TILE_DRAGGING_START, this._tileDraggingStart);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.MARQUEE_START, this.onMarqueeStart);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.MARQUEE_DRAG_START, this.onMarqueeDragStart);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.REVERT_START, this._onTileRevertingStart);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.REVERT_END, this._onTileRevertingEnd);

            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.TILE_MOUSE_DOWN, this.onTileMouseDown);

            this.listenTo(_formEquationManager, namespace.FormExpressionEquationManager.EVENTS.BIG_PARENTHESIS_ADDED, this._onAddBigParenthesis);
            this.listenTo(_formEquationManager, namespace.FormExpressionEquationManager.EVENTS.BIG_PARENTHESIS_REMOVED, this._onRemoveBigParenthesis);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.BUILD_TAB, this._buildTabPressed);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.BUILD_SHIFT_TAB, this._buildShiftTabPressed);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.BUILD_SET_FOCUS_ON_TOOLTIP, this._setFocusToMaxBasesAllowedTooltip);

            this.listenTo(_formEquationManager, namespace.FormExpressionEquationManager.EVENTS.GET_CURRENT_LEVEL, this.setCurrentLevelOfFormEquationManager);

            this.listenTo(this.model, modelNameSpace.ExponentAccordion.EVENTS.UPDATE_EQUATION_DATA, this._updateEquationData);
        },

        setCurrentLevelOfFormEquationManager: function setCurrentLevelOfFormEquationManager () {
            this._formEquationManager.setCurrentLevel(this.model.get('accordionLevel'));
        },

        _buildTabPressed: function _buildTabPressed() {
            if (this.maxBasesAllowedTooltip.$el.css('display') !== 'none') {
                this.setFocus('build-text-in-tooltip');
            }
            else if (this.buildModeUndoButtonView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                this.setFocus('build-mode-undo-button');
            }
            else if (this.buildModeResetButtonView.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                this.setFocus('build-mode-reset-button');
            }
            else {
                this.setFocus('done-button');
            }
        },

        _buildShiftTabPressed: function _buildShiftTabPressed() {
            var accordionLevel = this.model.get('accordionLevel');
            if (accordionLevel <= 4) {
                if (accordionLevel === 1) {
                    this.setFocus('exponents-tile-dispenser-container');
                }
                else {
                    this.setFocus('parenthesis-tile-dispenser-container');
                }
            }
            else {
                if (this.toggleButtonView.getButtonState() !== MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_DISABLED) {
                    this.setFocus('raised-to-power-toggle-button-toggle-button-containment');
                }
                else {
                    this.setFocus('parenthesis-tile-dispenser-container');
                }
            }

        },


        onTileMouseDown: function () {
            this.stopReading();
            this.maxBasesAllowedTooltip.hideTooltip();
        },

        _onTileRevertingStart: function _onTileRevertingStart() {
            this.animationStart();
        },

        _onTileRevertingEnd: function _onTileRevertingEnd() {
            this.animationEnd();
        },

        /**
        * Called when marquee dragging starts i.e. dragging of marquee div starts. (Not marquee drawing)
        * @method onMarqueeDragStart
        * @private
        */
        onMarqueeDragStart: function () {
            this.stopReading();
            this.maxBasesAllowedTooltip.hideTooltip();
        },

        onMarqueeStart: function onMarqueeStart() {
            this.stopReading();
        },

        /**
         * On saved state button clicked, this method will update the model for the current equation built.
         *
         * @method _updateEquationData
         */
        _updateEquationData: function _updateEquationData() {
            var model = this.model,
                currentViewClass = modelNameSpace.ExponentAccordion.EXPLORE_VIEW;
            if (model.get('exploreView') === currentViewClass.FORMATION || model.get('previousView') === currentViewClass.FORMATION) {
                if (this._formEquationManager) {
                    model.set('equationData', this._formEquationManager.getCurrentEquationJSON());
                }
            }
            else if (model.get('exploreView') === currentViewClass.WORKSPACE || model.get('previousView') === currentViewClass.WORKSPACE) {
                if (this._equationManager) {
                    model.set('equationDataSolveMode', this._equationManager.getCurrentEquationJSON());
                }
            }
            model.getAccordionDataFromSaveState(false);
        },

        /**
         * An event handler for the addition of the big parenthesis
         *
         * @method _onAddBigParenthesis
         * @private
         */
        _onAddBigParenthesis: function _onAddBigParenthesis() {
            if (this.toggleButtonView.getButtonState() !== MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ON) {
                this.internalToggle = false;
                this.toggleButtonView.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ON);
                this.model.set('raisedToPower', true);
                this.internalToggle = true;
            }
        },

        /**
        * An event handler for the removal of the big parenthesis
        *
        * @method _onAddBigParenthesis
        * @private
        */
        _onRemoveBigParenthesis: function _onRemoveBigParenthesis() {
            if (this.toggleButtonView.getButtonState() === MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ON) {
                this.internalToggle = false;
                this.toggleButtonView.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_OFF);
                this.model.set('raisedToPower', false);
                this.internalToggle = true;
            }
        },

        _tileDraggingStart: function _tileDraggingStart() {
            this.maxBasesAllowedTooltip.hideTooltip();
            this.stopReading();
        },

        /**
        * Adds scope to the draggable tiles. Useful when there is a marquee selection
        * and parentheses are dragged from the bin and dropped on the marquee. In that
        * case a unique scope is applied to the parentheses tile and the marquee div
        * so it cannot be dropped anywhere else and no other tile can be dropped on
        * the marquee.
        * @method _addMarqueeScope
        * @private
        */
        _addMarqueeScope: function () {
            if (this.parenthesisTilesViews) {
                this.parenthesisTilesViews.addOptionsForDraggable({ 'scope': 'marquee-scope' });
            }
        },

        /**
        * Removes scope from the draggable tiles.
        * @method _addMarqueeScope
        * @private
        */
        _removeMarqueeScope: function () {
            if (this.parenthesisTilesViews) {
                this.parenthesisTilesViews.addOptionsForDraggable({ 'scope': "default" });
            }
        },

        /**
        * Called whenever a command is fired. It checks if the EXIT_CODE was an error.
        * If yes, then it displays an inline feedback.
        * @method _checkErrors
        * @private
        * @param {Integer} EXIT_CODE returned by the command
        */
        _checkErrors: function (errorCode) {
            var msg = "",
                ERROR_CODE = equationManagerModelNameSpace.CommandFactory.EXIT_CODE;

            switch (errorCode) {
                case ERROR_CODE.OUT_OF_RANGE_EXPONENT:
                    msg = this._exponentOutOfRangeText();
                    break;
            }
            if (msg.length > 0 /*errorCode !== ERROR_CODE.SUCCESS && _.isNumber(errorCode)*/) {
                //this.maxBasesAllowedTooltip.changeText(msg);
                this._changeMaxBasesAllowedTooltipText(msg);
                this._changeMaxBasesAllowedTooltipWidth(msg);
                this.maxBasesAllowedTooltip.showTooltip();
                //this._setFocusToMaxBasesAllowedTooltip();
            }
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
        * Adds the isTouch class to the el when it's a touch device &
        * add FA classes to the douvle angles.
        * @method _handleTouchScroll
        * @private
        */
        _handleTouchScroll: function () {
            var angleDoubleLeft, angleDoubleRight;
            if (this._isTouch === null) { this._setIsTouch(); }
            if (this._isTouch) {
                this.$el.addClass('is-touch');
            }

            angleDoubleLeft = this.filePath.getFontAwesomeClass('angle-double-left');
            angleDoubleRight = this.filePath.getFontAwesomeClass('angle-double-right');
            this._$angleDoubleLeft.addClass(angleDoubleLeft);
            this._$angleDoubleRight.addClass(angleDoubleRight);
        },

        _changeMaxBasesAllowedTooltipText: function (msg, accMsg) {
            //var $textContainer = this.maxBasesAllowedTooltip.$el.find('.text-in-tooltip');
            //$textContainer.text(msg);
            var orphanFixMsg = this.orphanFix(msg);
            this.setMessage('build-text-in-tooltip', orphanFixMsg);
            if(accMsg) {
                this.setAccMessage('build-text-in-tooltip', accMsg);
            }
            else {
                this.setAccMessage('build-text-in-tooltip', msg);
            }
        },

        /**
        * Puts an &nbsp; between the last two words in a tooltip to remove orphan words
        *
        * @method orphanFix
        * @param {String} String potentially having orphan word
        * @return {String} String with orphan word removed
        */
        orphanFix: function (str) {
            var words = str.split(' ');
            if (words.length > 1) {
                words[words.length - 2] += "&nbsp;" + words[words.length - 1];
                words.pop();
            }

            return words.join(' ');
        },

        _changeCombineLikeBasesTooltipText: function (msg) {
            //var $textContainer = this.combineLikeBasesTooltip.$el.find('.text-in-tooltip');
            //$textContainer.text(msg);
            this.setMessage('solve-text-in-tooltip', msg);
            this.setAccMessage('solve-text-in-tooltip', msg);
            this.updateFocusRect('solve-text-in-tooltip');
        },


        _noOfParenthesisAllowedLimitReached: function _noOfParenthesisAllowedLimitReached() {
            var text = this._maxNoOfParenthesisAllowedText();
            //this.maxBasesAllowedTooltip.changeText(text);
            this._changeMaxBasesAllowedTooltipText(text.loc, text.acc);
            this._changeMaxBasesAllowedTooltipWidth(true);
            this.maxBasesAllowedTooltip.showTooltip();
            //this._setFocusToMaxBasesAllowedTooltip();
        },

        _nestedParenthesisCase: function _nestedParenthesisCase() {
            var text = this._nestedParenthesisNotAllowedText();
            //this.maxBasesAllowedTooltip.changeText(text);
            this._changeMaxBasesAllowedTooltipText(text.loc, text.acc);
            this._changeMaxBasesAllowedTooltipWidth(text.loc);
            this.maxBasesAllowedTooltip.showTooltip();
            //this._setFocusToMaxBasesAllowedTooltip();
        },

        _maxNoOfTermsInsideParenthesisCase: function _maxNoOfTermsInsideParenthesisCase() {
            var text = this._maxNoOfTermsInsideParenthesisText();
            this._changeMaxBasesAllowedTooltipText(text.loc, text.acc);
            this._changeMaxBasesAllowedTooltipWidth(true);
            //this._changeMaxBasesAllowedTooltipWidth(text);
            this.maxBasesAllowedTooltip.showTooltip();
            //this._setFocusToMaxBasesAllowedTooltip();
        },

        /**
        * A check done on the click of the done button, whether all the tiles are complete
        *
        * @method _validateExpression
        * @private
        */
        _validateExpression: function _validateExpression() {
            var tileStatus = this.tileStatus,
                baseLocations = this._formEquationManager.baseLocations,
                totalTiles = tileStatus[0] + tileStatus[1];

            if (totalTiles === baseLocations.length && baseLocations.length >= 2) {
                if (this._formEquationManager.checkParenthesisExponent()) {
                    return true;
                }
            }
            else return false;
        },

        _renderExpressionNotFilled: function _renderExpressionNotFilled() {
            var text = this.getMessage('expression-incomplete-tooltip-text', 0),
                accText = this.getAccMessage('expression-incomplete-tooltip-text', 0);
            //this.maxBasesAllowedTooltip.changeText(text);
            this._changeMaxBasesAllowedTooltipText(text, accText);
            this._changeMaxBasesAllowedTooltipWidth(true);
            this.maxBasesAllowedTooltip.showTooltip();
            //this._setFocusToMaxBasesAllowedTooltip();
        },

        _renderExpressionNotFilledFractionMode: function _renderExpressionNotFilledFractionMode () {
            var text = this.getMessage('expression-incomplete-tooltip-text', 3),
                accText = this.getAccMessage('expression-incomplete-tooltip-text', 3);
            //this.maxBasesAllowedTooltip.changeText(text);
            this._changeMaxBasesAllowedTooltipText(text, accText);
            this._changeMaxBasesAllowedTooltipWidth(true);
            this.maxBasesAllowedTooltip.showTooltip();
            //this._setFocusToMaxBasesAllowedTooltip();
        },

        _renderExpressionIncomplete: function _renderExpressionIncomplete() {
            var text = this.getMessage('expression-incomplete-tooltip-text', 1),
                accText = this.getAccMessage('expression-incomplete-tooltip-text', 1);
            //this.maxBasesAllowedTooltip.changeText(text);
            this._changeMaxBasesAllowedTooltipText(text, accText);
            this._changeMaxBasesAllowedTooltipWidth(text);
            this.maxBasesAllowedTooltip.showTooltip();
            //this._setFocusToMaxBasesAllowedTooltip();
        },

        _setFocusToMaxBasesAllowedTooltip: function () {
            if (this._formEquationManager.getCurrentAccView()) {
                this._formEquationManager.getCurrentAccView().removeAccDiv();
            }
            if (this.maxBasesAllowedTooltip.$el.css('display') !== 'none') {
                this.updateFocusRect('build-text-in-tooltip');
                this.setFocus('build-text-in-tooltip');
            }
            else {
                this.setFocus('droppable-region');
            }
        },

        _setFocusToCombineLikeBasesTooltip: function () {
            if (this._equationManager.getCurrentAccView()) {
                this._equationManager.getCurrentAccView().removeAccDiv();
            }
            if (this.combineLikeBasesTooltip.$el.css('display') !== 'none') {
                this.updateFocusRect('solve-text-in-tooltip');
                this.setFocus('solve-text-in-tooltip');
            }
            else {
                this.setFocus('workspace-scrollable');
            }
        },

        _checkDoneButtonStaus: function _checkDoneButtonStaus() {
            var tileStatus = this._formEquationManager.getTileStatus();

            this.tileStatus = tileStatus;

            /*if (this.model.get('buildModeDivisionMode')) {
                if (tileStatus[0] >= 1 && tileStatus[1] >= 1) {
                    this._toggleDoneButton(true);
                }
                else {
                    this._toggleDoneButton(false);
                }
            }
            else {
                if (tileStatus[0] >= 2) {
                    this._toggleDoneButton(true);
                }
                else {
                    this._toggleDoneButton(false);
                }
            }*/
        },

        updateDoneButtonState: function updateDoneButtonState(model, value, options) {
            this._disableEnableButtons(this.doneButtonView, value);
        },

        /*_toggleDoneButton: function _toggleDoneButton(enable) {
            var button = MathInteractives.global.Theme2.Button;
            if (enable) {
                this.doneButtonView.setButtonState(button.BUTTON_STATE_ACTIVE);
            }
            else {
                this.doneButtonView.setButtonState(button.BUTTON_STATE_DISABLED);
            }
        },*/


        _maxBasesInNumAndDenLimitReached: function _maxBasesInNumAndDenLimitReached() {
            var text = this._setMaxBasesTooltipText();
            //this.maxBasesAllowedTooltip.changeText(text);
            this._changeMaxBasesAllowedTooltipText(text.loc, text.acc);
            if (this.model.get('buildModeDivisionMode')) {
                this._changeMaxBasesAllowedTooltipWidth(true);
            }
            else {
                this._changeMaxBasesAllowedTooltipWidth(text.loc);
            }
            this.maxBasesAllowedTooltip.showTooltip();
            //this._setFocusToMaxBasesAllowedTooltip();
        },

        _maxUniqueBasesLimitReached: function _maxUniqueBasesLimitReached() {
            var text = this._setUniqueBaseLimitReachedText();
            //this.maxBasesAllowedTooltip.changeText(text);
            this._changeMaxBasesAllowedTooltipText(text.loc, text.acc);
            this._changeMaxBasesAllowedTooltipWidth(text.loc);
            this.maxBasesAllowedTooltip.showTooltip();
            //this._setFocusToMaxBasesAllowedTooltip();
        },

        _undoStackStatus: function _undoStackStatus(undoStack) {
            var buttonClass = MathInteractives.global.Theme2.Button;
            if (undoStack.length === 0) {
                //this.buildModeUndoButtonView.setButtonState(buttonClass.BUTTON_STATE_DISABLED);
                this._disableEnableButtons(this.buildModeUndoButtonView, false);
                if (this.model.get('randomExprButtonClick') === false) {
                    //this.buildModeResetButtonView.setButtonState(buttonClass.BUTTON_STATE_DISABLED);
                    this._disableEnableButtons(this.buildModeResetButtonView, false);
                }
            }
            else {
                //this.buildModeUndoButtonView.setButtonState(buttonClass.BUTTON_STATE_ACTIVE);
                this._disableEnableButtons(this.buildModeUndoButtonView, true);
                //this.buildModeResetButtonView.setButtonState(buttonClass.BUTTON_STATE_ACTIVE);
                this._disableEnableButtons(this.buildModeResetButtonView, true);
            }
        },

        _setUndoResetButtonStatus: function _setUndoResetButtonStatus() {
            if (this.model.get('tileDropped')) {
                //this.buildModeResetButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this._disableEnableButtons(this.buildModeResetButtonView, true);
            }
        },

        /**
         * The event handler to check the status of bin parenthesis tiles. Decies whether to enable them or disable them
         * @param {Array} parArray An array containing the values
         *                         1: positive parenthesis in numerator
         *                         -1: negative parenthesis in numerator
         *                         2: positive parenthesis in denominator
         *                         -2: negative parenthesis in the denominator
         * @method _binParenthesisStatus
         * @private
         */
        _binParenthesisStatus: function _binParenthesisStatus(parArray) { //par === parenthesis, Den = Denominator, Num = Numerator
            var staticNameSpace = modelNameSpace.ExponentAccordion.NUMBER_OF_PARENTHESIS,
                inNumerator = staticNameSpace.NUMERATOR,
                inDenominator = staticNameSpace.DENOMINATOR,
                negativePar = staticNameSpace.NEGATIVE,
                totalPar = inDenominator + inNumerator,
                _formEquationManager = this._formEquationManager,
                buttonViews;
            this.disabledParIndexes = [];
            if (this.parenthesisTilesViews !== null) {
                buttonViews = this.parenthesisTilesViews.dragButtonViews;
                this._enableDraggables(buttonViews, 'parentheses');
            }
            _formEquationManager.isPosParensEnabled = true;
            _formEquationManager.isNegParensEnabled = true;
            /*if (parArray.length === 0) {
                return;
            }*/
            this._checkNegativeParNumber(parArray, negativePar);

            if (this.model.get('buildModeDivisionMode')) {
                if (parArray.length === totalPar) {
                    this.disabledParIndexes = [0, 1];
                    _formEquationManager.isPosParensEnabled = false;
                    _formEquationManager.isNegParensEnabled = false;
                    this._disableParenthesis(this.disabledParIndexes);
                }
            }
            else {
                if (parArray.length === inNumerator) {
                    this.disabledParIndexes = [0, 1];
                    _formEquationManager.isPosParensEnabled = false;
                    _formEquationManager.isNegParensEnabled = false;
                    this._disableParenthesis(this.disabledParIndexes);
                }
            }
            this._formEquationManager.setParArray(parArray);
        },

        /**
         * Counts the number of negative parenthesis presenmt in the equation
         * @param {Array}  parArray           The array containing the information of the parenthesis present
         * @param {Number} maxNegativeAllowed The max number of negative parenthesis allowed
         *
         * @method _checkNegativeParNumber
         * @private
         */
        _checkNegativeParNumber: function _checkNegativeParNumber(parArray, maxNegativeAllowed) {
            if (this.parenthesisTilesViews === null) {
                return;
            }
            var index,
                negativeParCount = 0,
                buttonViews = this.parenthesisTilesViews.dragButtonViews,
                length = parArray.length,
                _formEquationManager = this._formEquationManager;

            this._enableDraggables(buttonViews, 'parentheses');
            this.player.enableHelpElement('parenthesis-tile-container-value-1', 0, true);

            for (index = 0; index < length; index++) {
                if (parArray[index] / Math.abs(parArray[index]) === -1) {
                    negativeParCount += 1;
                }
            }
            if (negativeParCount === maxNegativeAllowed) {
                this.disabledParIndexes = [1];
                _formEquationManager.isNegParensEnabled = false;
                this._disableParenthesis([1]);
            }
        },

        /**
         * Disables the parenthesis tile items
         * @param {Array} parIndexToDisable Containing the indexes of the parenthesis draggables to disable
         *
         * @method _disableParenthesis
         * @private
         */
        _disableParenthesis: function _disableParenthesis(parIndexToDisable) {
            var buttonViews = this.parenthesisTilesViews.dragButtonViews,
                index, currentIndex, btnEl;
            for (index = 0; index < parIndexToDisable.length; index++) {
                currentIndex = parIndexToDisable[index];
                btnEl = buttonViews[parIndexToDisable[index]].$el;
                buttonViews[parIndexToDisable[index]].setButtonState('disabled'/*, {
                    $dragTile: btnEl,
                    isCenterAlign: true
                }*/);

                btnEl.draggable("disable");
                //this.enableTab(btnEl.attr('id').replace(this.idPrefix, ''), false);
            }
            if (index === 2) {
                this.player.enableHelpElement('parenthesis-tile-container-value-1', 0, false);
                var equationCategorySub = this.model.get('buildModeDivisionMode') ? this.getAccMessage('extra-messages', 3) : this.getAccMessage('extra-messages', 2);
                this.changeAccMessage('parenthesis-tile-dispenser-container', 2, [equationCategorySub]);
            }
        },

        /**
         * An event handler which determines the unique bases already used by the user and checks the limiting factor for the nu7mber of unique bases allowed
         * @param {Array} baseArray Containing all the bases in the equation
         *
         * @method _binBaseTileStatus
         * @private
         */
        _binBaseTileStatus: function _binBaseTileStatus(baseArray) {
            var uniqueTiles = this._findUniqueTiles(baseArray),
                allowedBases = this.model.get('noOfBasesAllowed'),
                IsAbsolute = this.model.get('isAbsolute'),
                buttonViews = this.baseTilesViews.dragButtonViews;

            this._enableDraggables(buttonViews, 'base');
            if (uniqueTiles.length === allowedBases) {
                this._disableBaseDraggables(buttonViews, uniqueTiles);
            }
            else if (IsAbsolute && uniqueTiles.length + 1 === allowedBases) {
                uniqueTiles = uniqueTiles.concat([uniqueTiles[0] * -1]);
                this._disableBaseDraggables(buttonViews, uniqueTiles);
            }

        },

        /**
         * Disables the draggable bases
         * @param {Array} buttonViews An array of all the base draggables present in the bin
         * @param {Array} uniqueTiles An array of the bases that are not supposed to be disabled
         *
         * @method _disableBaseDraggables
         * @private
         */
        _disableBaseDraggables: function _disableBaseDraggables(buttonViews, uniqueTiles) {
            var index;
            for (index = 0; index < buttonViews.length; index++) {
                if (this._findAbsoluteTermInArray(index + 2, uniqueTiles) === false) {
                    buttonViews[index].setButtonState('disabled'/*, {
                        //$dragTile: buttonViews[index].$el,
                        isCenterAlign: true
                    }*/);
                    buttonViews[index].$el.draggable("disable");
                }
            }
            this._formEquationManager.setBaseArray(uniqueTiles);
        },

        /**
         * Enables of the draggble nature of all the tiles given
         * @param {Array}  buttonViews The array of the draggabels to enable the dragging
         * @param {String} str         A string prefix used to determine which is the draggable tile of which the dragging needs to be enabled
         *
         * @method _enableDraggables
         * @private
         */
        _enableDraggables: function _enableDraggables(buttonViews, str) {
            var index;
            for (index = 0; index < buttonViews.length; index++) {
                buttonViews[index].setButtonState('active', {
                    $dragTile: buttonViews[index].$el
                });
                buttonViews[index].$el.draggable("enable");
            }
            if (str === 'base') {
                this._formEquationManager.setBaseArray([]);
            }
            if(str === 'parentheses') {
                var equationCategorySub = this.model.get('buildModeDivisionMode') ? this.getAccMessage('extra-messages', 3) : this.getAccMessage('extra-messages', 2);
                this.changeAccMessage('parenthesis-tile-dispenser-container', 1, [equationCategorySub]);
            }
        },

        /**
        * Enables / disables all bin tiles and associated title texts.
        *
        * @method _enableDisableAllBinTiles
        * @private
        */
        _enableDisableAllBinTiles: function _enableDisableAllBinTiles(enable) {
            var buttonState,
                dragButtonsArray = [],
                btnNamespace = MathInteractives.global.Theme2.Button,
                toggleBtnNamespace = MathInteractives.Common.Components.Theme2.Views.ToggleButton,
                toggleBtnState, tempDragButtonsArray;
            buttonState = enable ? btnNamespace.BUTTON_STATE_ACTIVE : btnNamespace.BUTTON_STATE_DISABLED;
            toggleBtnState = enable ? toggleBtnNamespace.TOGGLEBUTTON_STATE_ON : toggleBtnNamespace.TOGGLEBUTTON_STATE_DISABLED;

            dragButtonsArray = (this.baseTilesViews) ? this.baseTilesViews.dragButtonViews : [];
            tempDragButtonsArray = (this.exponentTilesViews) ? this.exponentTilesViews.dragButtonViews : [];
            dragButtonsArray = dragButtonsArray.concat(tempDragButtonsArray);
            tempDragButtonsArray = (this.parenthesisTilesViews) ? this.parenthesisTilesViews.dragButtonViews : [];
            dragButtonsArray = dragButtonsArray.concat(tempDragButtonsArray);

            dragButtonsArray.forEach(function (element, index, array) {
                element.setButtonState(buttonState, {
                    $dragTile: element.$el
                });
                element.$el.draggable(enable ? 'enable' : 'disable');
            }, this);

            this.internalToggle = false;
            this.toggleButtonView && this.toggleButtonView.changeStateOfToggleButton(toggleBtnState);
            this.internalToggle = true;

            this._enableDisableAllButtonGroupTitleText(enable);
        },

        /**
        * Enables / disables title text of all button groups in bin.
        *
        * @method _enableDisableAllButtonGroupTitleText
        * @param enable {Boolean} Disables the text if false.
        */
        _enableDisableAllButtonGroupTitleText: function _enableDisableAllButtonGroupTitleText(enable) {
            this.enableDisableBaseTilesTitle(enable);
            this.enableDisableExponentTilesTitle(enable);
            this.enableDisableParanthesisTilesTitle(enable);
            this.enableDisableRaiseToPowerTitle(enable);
        },

        /**
        * Enables the title text for the group type passed.
        *
        * @method _enableBinGroupTitleText
        * @param groupType {String} The type of elements' group which is to be enabled.
        * @param enable {Boolean} If false, will disable the group title.
        * @private
        */
        _enableBinGroupTitleText: function _enableBinGroupTitleText(groupType, enable) {
            enable = (enable !== false);
            switch (groupType) {
                case namespace.FormExpression.BASE_TYPE:
                    this.enableDisableBaseTilesTitle(enable);
                    break;
                case namespace.FormExpression.EXPONENT_TYPE:
                    this.enableDisableExponentTilesTitle(enable);
                    break;
                case namespace.FormExpression.PARENTHESIS_TYPE:
                    this.enableDisableParanthesisTilesTitle(enable);
                    break;
                case namespace.FormExpression.RAISE_FRACTION:
                    this.enableDisableRaiseToPowerTitle(enable);
                    break;
            }
        },

        /**
        * Activates / inactivates all bin tiles and associated title texts.
        *
        * @method _activateAllBinTiles
        * @private
        */
        _activateAllBinTiles: function _activateAllBinTiles(enable) {
            var buttonState,
                tempDragButtonsArray,
                dragButtonsArray = [],
                btnNamespace = MathInteractives.global.Theme2.Button,
                toggleBtnNamespace = MathInteractives.Common.Components.Theme2.Views.ToggleButton,
                toggleBtnState;
            buttonState = enable ? btnNamespace.BUTTON_STATE_ACTIVE : btnNamespace.BUTTON_STATE_DISABLED;
            toggleBtnState = enable ? toggleBtnNamespace.TOGGLEBUTTON_STATE_ENABLED : toggleBtnNamespace.TOGGLEBUTTON_STATE_DISABLED;

            dragButtonsArray = (this.baseTilesViews) ? this.baseTilesViews.dragButtonViews : [];
            tempDragButtonsArray = (this.exponentTilesViews) ? this.exponentTilesViews.dragButtonViews : [];
            dragButtonsArray = dragButtonsArray.concat(tempDragButtonsArray);
            tempDragButtonsArray = (this.parenthesisTilesViews) ? this.parenthesisTilesViews.dragButtonViews : [];
            dragButtonsArray = dragButtonsArray.concat(tempDragButtonsArray);

            dragButtonsArray.forEach(function (element, index, array) {
                element.setButtonState(buttonState);
                element.$el.draggable(enable ? 'enable' : 'disable');
                if (enable) {
                    element.$el.removeClass('inactive');
                }
                else {
                    element.$el.addClass('inactive');
                }
            }, this);

            this.internalToggle = false;
            if (this.toggleButtonView) {
                // Tutorial calls _activateAllBinTiles(false) and requires toggle button in off state intially.
                //this.toggleButtonView.changeStateOfToggleButton(toggleBtnNamespace.TOGGLEBUTTON_STATE_ENABLED);
                this._enableDisableToggleButtonState(true);
                this.toggleButtonView.changeStateOfToggleButton(toggleBtnNamespace.TOGGLEBUTTON_STATE_OFF);
                this.toggleButtonView.changeStateOfToggleButton(toggleBtnState);
            }
            this.internalToggle = true;

            this._enableDisableAllButtonGroupTitleText(enable);
        },

        /**
        * Enabled draggable tiles in Bin
        *
        * @method _enabledBinTiles
        * @param Array arrIndex Array of index of draggable tiles which needs to be enabled
        * @private
        */
        _enabledBinTiles: function _enabledBinTiles(arrIndex) {
            var activeButtonState, dragButtonsArray;
            activeButtonState = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE;
            dragButtonsArray = this.baseTilesViews.dragButtonViews.concat(
                this.exponentTilesViews.dragButtonViews.concat(
                    this.parenthesisTilesViews.dragButtonViews
                )
            );

            dragButtonsArray.forEach(function (element, index, array) {
                element.setButtonState(activeButtonState, {
                    $dragTile: element.$el
                });
                element.$el.draggable("enable");
                element.$el.removeClass('inactive');
            }, this);

            this.enableDisableBaseTilesTitle(true);
        },

        /**
        * Enable/disables the base tiles' title text depending on boolean passed.
        *
        * @method enableDisableBaseTilesTitle
        * @param enable {Boolean} Disables the text if false.
        */
        enableDisableBaseTilesTitle: function enableDisableBaseTilesTitle(enable) {
            var $titleHolder = this.$('.base-tile-dispenser-title');
            if (enable === false) {
                $titleHolder.addClass('disabled-bin-title');
            }
            else {
                $titleHolder.removeClass('disabled-bin-title');
            }
        },

        /**
        * Enable/disables the exponent tiles' title text depending on boolean passed.
        *
        * @method enableDisableExponentTilesTitle
        * @param enable {Boolean} Disables the text if false.
        */
        enableDisableExponentTilesTitle: function enableDisableExponentTilesTitle(enable) {
            var $titleHolder = this.$('.exponents-tile-dispenser-title');
            if (enable === false) {
                $titleHolder.addClass('disabled-bin-title');
            }
            else {
                $titleHolder.removeClass('disabled-bin-title');
            }
        },

        /**
        * Enable/disables the parenthesis tiles' title text depending on boolean passed.
        *
        * @method enableDisableParanthesisTilesTitle
        * @param enable {Boolean} Disables the text if false.
        */
        enableDisableParanthesisTilesTitle: function enableDisableParanthesisTilesTitle(enable) {
            var $titleHolder = this.$('.parenthesis-tile-dispenser-title');
            if (enable === false) {
                $titleHolder.addClass('disabled-bin-title');
            }
            else {
                $titleHolder.removeClass('disabled-bin-title');
            }
        },

        /**
        * Enable/disables the raise-to-power button's title text depending on boolean passed.
        *
        * @method enableDisableRaiseToPowerTitle
        * @param enable {Boolean} Disables the text if false.
        */
        enableDisableRaiseToPowerTitle: function enableDisableRaiseToPowerTitle(enable) {
            var $titleHolder = this.$('.raised-to-power-toggle-button-title');
            if (enable === false) {
                $titleHolder.addClass('disabled-bin-title');
            }
            else {
                $titleHolder.removeClass('disabled-bin-title');
            }
        },

        /**
         * Finds unique numbers in an array
         * @param   {Array} baseArray The given array
         * @returns {Array} Containing only the unique numbers present
         *
         * @method _findUniqueTiles
         * @private
         */
        _findUniqueTiles: function _findUniqueTiles(baseArray) {
            var index,
                uniqueTiles = [];
            for (index = 0; index < baseArray.length; index++) {
                if (this._findTermInArray(baseArray[index], uniqueTiles) === false) {
                    uniqueTiles.push(baseArray[index]);
                }
            }
            return uniqueTiles;
        },

        /**
         * It determines whether the absolute value of a given number is present in the array or not
         * @param   {Number}  term  The number whose absolute value is to be found out
         * @param   {Array}   array The array in which the term has to be searched
         * @returns {Boolean} true if found false otherwise
         *
         * @method _findAbsoluteTermInArray
         * @private
         */
        _findAbsoluteTermInArray: function _findAbsoluteTermInArray(term, array) {
            var index;
            for (index = 0; index < array.length; index++) {
                if (Math.abs(array[index]) === term) {
                    return true;
                }
            }
            return false;
        },

        /**
         * It determines whether the a term is present in the array or not
         * @param   {Number}  term  The term be found out
         * @param   {Array}   array The array in which the term has to be searched
         * @returns {Boolean} true if found false otherwise
         *
         * @method _findTermInArray
         * @private
         */
        _findTermInArray: function _findTermInArray(term, array) {
            var index;
            for (index = 0; index < array.length; index++) {
                if (array[index] === term) {
                    return true;
                }
            }
            return false;
        },

        /**
         * It attaches the events related to the data in the accordion
         *
         * @method _attachDataEvents
         * @private
         */
        _attachDataEvents: function _attachDataEvents() {
            var eventClass = equationManagerNamespace.EquationManager.EVENTS;
            this.listenTo(this._equationManager, namespace.EquationManager.GET_CURRENT_LEVEL, this.setCurrentLevelOfEquationManager);

            this.listenTo(this._equationManager, eventClass.NEW_EXPRESSION_START, this._addDataForNewExpression);
            this.listenTo(this._equationManager, eventClass.ADD_STEP, this._addDataForNewStep);
            this.listenTo(this._equationManager, eventClass.REMOVE_STEP, this._removeDataForNewStep);
            this.listenTo(this._equationManager, eventClass.CHECK_PURE_SIMPLE, this._checkPureAndSimple);
            this.listenTo(this._equationManager, eventClass.MAX_LIMIT_CROSSED_TOOLTIP, this._showMaxLimitCrossedToolTip);
            this.listenTo(this._equationManager, eventClass.INVALID_COMBINE_WITHIN_DIFF_PARENT, this._showInvalidCombineWithinDiffParentTooltip);
            this.listenTo(this._equationManager, eventClass.INVALID_COMBINE_WITHIN_SAME_PARENT, this._showInvalidCombineWithinSameParentTooltip);
            this.listenTo(this._equationManager, eventClass.INVALID_COMBINE_FOR_TILE_VALUE_EXCEEDING, this._showInvalidCombineForTileValueExceeding);
            this.listenTo(this._equationManager, eventClass.INVALID_COMBINE_FOR_BASE_VALUE_EXCEEDING, this._showInvalidCombineForBaseValueExceeding);
            this.listenTo(this._equationManager, eventClass.INVALID_COMBINE_FOR_MARQUEE, this._showInvalidCombineForMarquee);
            this.listenTo(this._equationManager, eventClass.TILE_DRAGGING_START, this._tileDragStart);
            this.listenTo(this._equationManager, eventClass.MARQUEE_START, this._marqueeDrawingStart);
            this.listenTo(this._equationManager, eventClass.MARQUEE_DRAG_START, this._onMarqueeDragging);
            this.listenTo(this._equationManager, eventClass.PARENTHESIS_EXPONENT_CLICK, this._parenthesisExponentClick);
            this.listenTo(this._equationManager, eventClass.REVERT_START, this.onTileItemRevertStart);
            this.listenTo(this._equationManager, eventClass.REVERT_END, this.onTileItemRevertEnd);
            this.listenTo(this._equationManager, eventClass.ATTEMPT_OPERATION, this._hideCombineLikeBasesTooltip);
            this.listenTo(this._equationManager, eventClass.TILE_MOUSE_DOWN, this._tileMouseDown);
            this.listenTo(this._equationManager, eventClass.SOLVE_TAB, this._solveTabPressed);
            this.listenTo(this._equationManager, eventClass.SOLVE_SHIFT_TAB, this._solveShiftTabPressed);
            this.listenTo(this._equationManager, eventClass.SOLVE_SET_FOCUS_ON_TOOLTIP, this._setFocusToCombineLikeBasesTooltip);
            this.listenTo(this._equationManager, eventClass.FANNING_ANIMATION_START, this.animationStart);

            this.listenTo(this._equationManager, eventClass.FANNING_ANIMATION_END, this.animationEnd);

            // Remove highlight tiles
            this.listenTo(this._equationManager, eventClass.TILE_DRAGGING_START, this.removeHighlightTiles);
            this.listenTo(this._equationManager, eventClass.TILE_MOUSE_DOWN, this.removeHighlightTiles);
            this.listenTo(this._equationManager, eventClass.MARQUEE_START, this.removeHighlightTiles);
            this.listenTo(this._equationManager, eventClass.MARQUEE_DRAG_START, this.removeHighlightTiles);
            this.listenTo(this._equationManager, eventClass.PARENTHESIS_EXPONENT_CLICK, this.removeHighlightTiles);

        },

        _solveTabPressed: function _solveTabPressed() {
            var activeBtnState = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE;
            if (this.combineLikeBasesTooltip.$el.css('display') !== 'none') {
                this.setFocus('solve-text-in-tooltip');
            }
            else if (this.solveModeUndoButtonView.getButtonState() === activeBtnState) {
                this.setFocus('solve-mode-undo-button');
            }
            else if (this.solveModeResetButtonView.getButtonState() === activeBtnState) {
                this.setFocus('solve-mode-reset-button');
            }
            else {
                this.setFocus('view-data-button');
            }
        },

        _solveShiftTabPressed: function _solveShiftTabPressed() {
            this.setFocus('main-activity-area-container');
        },

        onTileItemRevertStart: function () {
            this.animationStart();
        },

        onTileItemRevertEnd: function () {
            this.animationEnd();
        },

        _parenthesisExponentClick: function _parenthesisExponentClick() {
            this.stopReading();
        },

        setCurrentLevelOfEquationManager: function setCurrentLevelOfEquationManager() {
            this._equationManager.setCurrentLevel(this.model.get('accordionLevel'));
        },

        _onMarqueeDragging: function () {
            this.stopReading();
            this._hideCombineLikeBasesTooltip();
        },

        _marqueeDrawingStart: function () {
            this.stopReading();
            this._hideCombineLikeBasesTooltip();
        },


        _tileDragStart: function () {
            this.stopReading();
            this._hideCombineLikeBasesTooltip();
            this._equationManager.hideAllTooltips();
        },

        _tileMouseDown: function _tileMouseDown() {
            this.stopReading();
            this._hideCombineLikeBasesTooltip();
        },


        _showInvalidCombineForTileValueExceeding: function _showInvalidCombineForTileValueExceeding() {
            var text = this._invalidCombineForTileValueExceedingText();
            this._changeCombineLikeBasesTooltipText(text);
            this.combineLikeBasesTooltip.showTooltip();
            //this._setFocusToCombineLikeBasesTooltip();
        },

        _showInvalidCombineForBaseValueExceeding: function _showInvalidCombineForBaseValueExceeding() {
            var text = this._invalidCombineForBaseValueExceedingText();
            this._changeCombineLikeBasesTooltipText(text);
            this.combineLikeBasesTooltip.showTooltip();
            //this._setFocusToCombineLikeBasesTooltip();
        },

        _showInvalidCombineForMarquee: function _showInvalidCombineForMarquee () {
            var text = this._invalidCombineForMarquee();
            this._changeCombineLikeBasesTooltipText(text);
            this.combineLikeBasesTooltip.showTooltip();
        },

        _showMaxLimitCrossedToolTip: function _showMaxLimitCrossedToolTip() {
            var text = this._maxLimitCrossedTooltipText();
            this._changeCombineLikeBasesTooltipText(text);
            this.combineLikeBasesTooltip.showTooltip();
            //this._setFocusToCombineLikeBasesTooltip();
        },

        _showInvalidCombineWithinSameParentTooltip: function _showInvalidCombineWithinSameParentTooltip() {
            var text = this._invalidCombineWithinSameParentText();
            this._changeCombineLikeBasesTooltipText(text);
            this.combineLikeBasesTooltip.showTooltip();
            //this._setFocusToCombineLikeBasesTooltip();
        },

        _showInvalidCombineWithinDiffParentTooltip: function _showInvalidCombineWithinDiffParentTooltip() {
            var text = this._invalidCombineWithinDiffParentText();
            this._changeCombineLikeBasesTooltipText(text);
            this.combineLikeBasesTooltip.showTooltip();
            //this._setFocusToCombineLikeBasesTooltip();
        },

        /**
         * Resets the accordion data
         *
         * @method _resetAccordionData
         */
        _resetAccordionData: function _resetWorkspaceData() {
            var model = this.model,
                equationData = model.get('accordionEquationData'),
                currentDataIndex = model.get('currentEquationDataIndex'),
                dataObj = equationData[currentDataIndex],
                disableState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;

            if (dataObj) {
                dataObj.steps = [];
            }

            model.set('stepCount', 0);
            this.model.set('isAccordionEqnDataChanged', true);
            model.set('accordionEquationData', equationData);
            model.set('pureAndSimpleShown', false);

            //this.solveModeUndoButtonView.setButtonState(disableState);
            this._disableEnableButtons(this.solveModeUndoButtonView, false);
            //this.solveModeResetButtonView.setButtonState(disableState);
            this._disableEnableButtons(this.solveModeResetButtonView, false);
        },

        /**
         * Checks whether the criterion have reached to show pure and simple pop-up
         *
         * @method _checkPureAndSimple
         */
        _checkPureAndSimple: function _checkPureAndSimple() {
            var numSteps = this.model.get('stepCount'),
                bases = [],
                uniqueBases = [],
                onePresent = false,
                negOnePresent = false,
                equViewModel, negExpFlag;

            if (this.model.get('pureAndSimpleShown') === true) {
                return;
            }

            if (this._equationManager && this._equationManager.equationView) {
                equViewModel = this._equationManager.equationView.model;
                bases = equViewModel.getAllBases();
                negExpFlag = equViewModel.isNegativeExpPresent();
                if (equViewModel.isParenthesisPresent() || negExpFlag === false) {
                    return;
                }

                if (bases.length === 1) {
                    var self = this;
					window.setTimeout(function () {self._showPureAndSimple();} , 200 );
                    this.animationStart();
                }
                else {
                    uniqueBases = this._findUniqueTiles(bases);
                    if (uniqueBases.indexOf(1) !== -1) {
                        onePresent = true;
                    }
                    if (uniqueBases.indexOf(-1) !== -1) {
                        if (equViewModel.isExpAbsOne() === true) {
                            negOnePresent = true;
                        }
                    }
                    if (uniqueBases.length === bases.length &&
                       numSteps >= namespace.FormExpression.RULES.MIN_NUM_STEPS &&
                       onePresent === false &&
                        negOnePresent === false
                      ) {
                        var self = this;
                        window.setTimeout(function () {self._showPureAndSimple();} , 200 );
                        this.animationStart();
                    }
                }
            }
        },

        _showPureAndSimple: function _showPureAndSimple() {
            if(this._equationManager) {
                this._equationManager.removeCurrentAccDiv();
            }
            this._showPureAndSimplePopup();
            this.model.set('pureAndSimpleShown', true);
        },

        _showPureAndSimplePopup: function () {
            var self = this;
            var popupProps = {
                title: this.getMessage('pure-and-simple-popup', 'title'),
                text: this.getMessage('pure-and-simple-popup', 'text'),
                accText: this.getAccMessage('pure-and-simple-popup', 'text'),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                width: 462,
                //backgroundImageBackgroundPosition: '0 -712px',
                containsTts: true,
                buttons: [{
                    id: 'pure-and-simple-continue',
                    text: this.getMessage('pure-and-simple-popup', 'continue'),
                    response: { isPositive: true, buttonClicked: this.idPrefix + 'pure-and-simple-continue' },
                    baseClass: 'btn-yellow',
                    textColor: '#222222',
                    clickCallBack: {
                        fnc: this.onClickContinue,
                        scope: this
                    }
                },
                {
                    id: 'pure-and-simple-try-again',
                    text: this.getMessage('pure-and-simple-popup', 'try-again'),
                    response: { isPositive: true, buttonClicked: this.idPrefix + 'pure-and-simple-try-again' },
                    baseClass: 'btn-yellow',
                    textColor: '#222222',
                    clickCallBack: {
                        fnc: this._resetSolveModeScreen,
                        scope: this
                    }
                }]
            };

            this.pureAndSimplePopup = MathInteractives.global.Theme2.PopUpBox.createPopup(popupProps);
            this.setFocus('theme2-pop-up-title-text-combined-acc', 500);
            this.pureAndSimplePopup.$el.find('.theme2-pop-up-text.theme2-pop-up-text-defaultType').addClass('pure-and-simple-body-text');
            this.pureAndSimplePopup.$el.find('.theme2-pop-up-title-text').addClass('pure-and-simple-title-text');

            this.pureAndSimplePopup.$el.find('.btn-yellow').off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 32) {
                    setTimeout(function () { self.setFocus('workspace-scrollable'); }, 5);
                }
            });

        },

        onClickContinue: function onClickContinue() {
            this.setFocus('workspace-scrollable');
            this.animationEnd();
        },

        onClickTryAgain: function onClickTryAgain() {
            this._goToIntialScreen();
        },

        /**
         * The handler to be called when a new equation is to be created
         * @param {String} htmlString The html string that needs to be stored in order to be displayed
         *
         * @method _addDataForNewExpression
         * @private
         */
        _addDataForNewExpression: function _addDataForNewExpression(headerObj) {
            var model = this.model,
                currentDataIndex = model.get('currentEquationDataIndex'),
                accordionData = model.get('accordionEquationData'),
                dataObj = {};

            currentDataIndex += 1;

            dataObj.header = headerObj.equationHtml;
            dataObj.headerAccString = headerObj.equationAccString;
            dataObj.steps = [];
            accordionData.push(dataObj);
            model.set('currentEquationDataIndex', currentDataIndex);
            model.set('accordionEquationData', accordionData);

            this.model.set('isAccordionEqnDataChanged', true);
            this.model.set('stepCount', 0);
        },

        /**
         * The handler to be called when a a command is performed on the existing equation
         * @param {String} htmlString The html string that needs to be stored in order to be displayed
         *
         * @method _addDataForNewStep
         * @private
         */
        _addDataForNewStep: function _addDataForNewStep(data) {
            var model = this.model,
                accordionData = model.get('accordionEquationData'),
                currentDataIndex = model.get('currentEquationDataIndex'),
                dataObj = accordionData[currentDataIndex],
                steps = dataObj.steps,
                stepObj = {},
                enableState = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE,
                stepCount = model.get('stepCount');

            stepCount += 1;
            model.set('stepCount', stepCount);

            stepObj.htmlString = data.equationHtml;
            stepObj.accString = data.equationAccString;
            steps.push(stepObj);

            accordionData = this._getTotalAccordionTupleCount(accordionData, currentDataIndex);
            this.model.set('isAccordionEqnDataChanged', true);
            model.set('accordionEquationData', accordionData);

            if (stepCount >= 1) {
                //this.solveModeResetButtonView.setButtonState(enableState);
                this._disableEnableButtons(this.solveModeResetButtonView, true);
                //this.solveModeUndoButtonView.setButtonState(enableState);
                this._disableEnableButtons(this.solveModeUndoButtonView, true);
            }
        },

        /**
         * It checks for the limiting condition. The max tuples permitted. If greater than the limit it will start deleting previous added headers to bring down the tuple count.
         * @param   {Object}    accordionData    The accordion data from the model
         * @param   {Number}   currentDataIndex the current data index of the accordion
         * @returns {Object} The new accordion data
         */
        _getTotalAccordionTupleCount: function _getTotalAccordionTupleCount(accordionData, currentDataIndex) {
            var totalCount = 0,
                maxTupleCount = this.model.get('accordionMaxTupleCount'),
                index, k = 0;

            for (index = 0; index < accordionData.length; index++) {
                totalCount += accordionData[index].steps.length;
            }

            while (totalCount > maxTupleCount) {
                if (k == currentDataIndex) {
                    break;
                }
                totalCount -= accordionData[k].steps.length + 1;
                accordionData.shift();
                currentDataIndex -= 1;
                this.model.set('accordionRowsToDelete', this.model.get('accordionRowsToDelete') + 1);
                k++;
            }
            this.model.set('currentEquationDataIndex', currentDataIndex);
            return accordionData;
        },


        /**
         * The handler to be called when a a command is undone on the existing equation
         *
         * @method _removeDataForNewStep
         * @private
         */
        _removeDataForNewStep: function _removeDataForNewStep() {
            var model = this.model,
                accordionData = model.get('accordionEquationData'),
                currentDataIndex = model.get('currentEquationDataIndex'),
                dataObj = accordionData[currentDataIndex],
                steps = dataObj.steps,
                disabledState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED,
                stepCount = model.get('stepCount');

            steps.pop();
            this.model.set('isAccordionEqnDataChanged', true);
            model.set('accordionEquationData', accordionData);
            stepCount -= 1;
            this.model.set('stepCount', stepCount);

            if (stepCount === 0) {
                //this.solveModeUndoButtonView.setButtonState(disableState);
                this._disableEnableButtons(this.solveModeUndoButtonView, false);
                //this.solveModeResetButtonView.setButtonState(disableState);
                this._disableEnableButtons(this.solveModeResetButtonView, false);
            }

        },

        _changeMaxBasesAllowedTooltipWidth: function _changeMaxBasesAllowedTooltipWidth(isWidth) {
            var width, closeBtnWidth = 22;
            if (isWidth === true) {
                this.maxBasesAllowedTooltip.changeContainerWidth(562);
                this.maxBasesAllowedTooltip.$el.find('.text-in-tooltip').css({ 'width': 562 - closeBtnWidth });
            }
            else {
                width = this.player.getTextHeightWidth(isWidth).width + 20;
                this.maxBasesAllowedTooltip.changeContainerWidth(width + closeBtnWidth);
                this.maxBasesAllowedTooltip.$el.find('.text-in-tooltip').css({ 'width': width });
            }
        },

        animationStart: function animationStart() {
            //if (!this._isIE9) {
            this._$animationDiv.show();
            //}
        },

        animationEnd: function animationEnd() {
            this._$animationDiv.hide();
        },

        /**
        * Needed because animation div used to propagate events to the divs beneath.
        * So stop all propagation on animation div.
        * @method _stopPropagationOnAnimation
        * @private
        * @param {Object} Event
        */
        _stopPropagationOnAnimation: function (event) {
            event.stopPropagation();
        },

        /**
        * As per given list of element index along with action and offset, set event on view
        *
        * @method activateEventOnTiles
        * @param {Array} lstTargetIndex List of element index along with action and offset
        * @public
        */
        activateEventOnTiles: function (lstTargetIndex) {
            var data = {},
                binElement,
                len = 0;
            if (lstTargetIndex) {
                len = lstTargetIndex.length;
                for (var counter = 0; counter < len; counter++) {
                    data = lstTargetIndex[counter];
                    if (data) {
                        binElement = this._getBinElementFromIndex(data.index);
                        if (binElement) {
                            if (binElement.isTile) {
                                this._attachEventOnBinTiles(binElement, data.simulateAction);
                            }
                        }
                    }
                }
            }
        },

        /**
        * Deactivate all click events on BIN tiles
        *
        * @method deActivateClickEventsOnTiles
        * @public
        */
        deActivateClickEventsOnTiles: function () {
            this._detachNegateTileEvents('.base-draggable-tiles');
            this._detachNegateTileEvents('.exponent-draggable-tiles');
            this._detachNegateTileEvents('.parenthesis-draggable-tiles');
        },

        /**
        * As per given Bin element index along with data-tilevalue and elementGroupTitle, set event on view
        *
        * @method _attachEventOnBinTiles
        * @param {Object} binElement Bin element on which event is bind
        * @param {Number} simulateAction Action to be bind
        * @private
        */
        _attachEventOnBinTiles: function (binElement, simulateAction) {
            switch (simulateAction) {
                case 1:
                case 7:
                case 11:
                    // Click
                    var tileValue = binElement.element.el.getAttribute('data-tilevalue'),
                        tileValueClass = '',
                        tileClass = '';
                    //namespace.FormExpression.BASE_TYPE
                    if (binElement.groupTitle === namespace.FormExpression.BASE_TYPE) {
                        tileClass = '.base-draggable-tiles';
                        tileValueClass = '.tile-value' + Math.abs(parseInt(tileValue, 10));
                    }
                    else if (binElement.groupTitle === namespace.FormExpression.EXPONENT_TYPE) {
                        tileClass = '.exponent-draggable-tiles';
                        tileValueClass = '.tile-value' + Math.abs(parseInt(tileValue, 10));
                    }
                    else if (binElement.groupTitle === namespace.FormExpression.PARENTHESIS_TYPE) {
                        tileClass = '.parenthesis-draggable-tiles';
                        tileValueClass = '.tile-value' + tileValue;
                    }
                    this._attachNegateTileEvents(tileClass + tileValueClass + '.clickEnabled');
                    break;
                case 2:
                case 8:
                    // Double Click
                    // there is no double click event on Bin tiles
                    break;
                case 3:
                case 9:
                    // Drag
                    binElement.element.$el.draggable('enable');
                    break;
                case 6:
                    // Marquee
                    // there is no marquee event on Bin tiles
                    break;
                default:
                    console.log('Error: Please give proper event enum');
                    break;
            }
        },

        /**
         * Will attach mouse/touch events to the draggable containers
         * @param {Object} $elem Is the required element on which these events need to be bound
         *
         * @method applyHandCursor
         */
        applyHandCursor: function ($elem) {
            var self = this,
                enter, leave;

            if (this._isTouch === null) { this._setIsTouch(); }
            if (this._isTouch) {
                return;
            }

            enter = 'mouseenter';
            leave = 'mouseleave';

            /*-_ Override theme2-button event handlers preventing them to change cursor _-*/
            /* Using theme2-button code to add and remove hover class */
            $elem.off('mouseover').on('mouseover', function () {
                // if element is disabled or inactive
                if ($elem.hasClass('disabled') || $elem.hasClass('inactive')) {
                    return;
                }

                if (this._isTouch) {
                    $elem.removeClass('down').addClass('hover');
                } else {
                    $elem.addClass('hover');
                }
            })
                .off('mouseout').on('mouseout', function () {
                    if (this._isTouch) {
                        $elem.removeClass('hover');
                    } else {
                        $elem.removeClass('hover');
                    }
                });
            /*-_ End of override _-*/

            $elem.off(enter)
                .on(enter, function () {
                    // if element is disabled or inactive
                    if ($elem.hasClass('disabled') || $elem.hasClass('inactive')) {
                        return;
                    }
                    $elem.css({ 'cursor': "url('" + self.getImagePath('open-hand') + "'), move" });
                })
                .off(leave)
                .on(leave, function () {
                    // if element is disabled or inactive
                    if ($elem.hasClass('disabled') || $elem.hasClass('inactive')) {
                        return;
                    }
                    $elem.css({ 'cursor': 'default' });
                })
                .off('mousedown.cursor-change')
                .on('mousedown.cursor-change', function () {
                    // if element is disabled or inactive
                    if ($elem.hasClass('disabled') || $elem.hasClass('inactive')) {
                        return;
                    }
                    $elem.css({ 'cursor': "url('" + self.getImagePath('closed-hand') + "'), move" });
                })
                .off('mouseup.cursor-change')
                .on('mouseup.cursor-change', function () {
                    // if element is disabled or inactive
                    if ($elem.hasClass('disabled') || $elem.hasClass('inactive')) {
                        return;
                    }
                    $elem.css({ 'cursor': "url('" + self.getImagePath('open-hand') + "'), move" });
                });
        }

    }, {
        BASE_TILE_MIN_VALUE: 2,
        BASE_TILE_MAX_VALUE: 9,
        POSITIVE_EXPONENT_TILE_MIN_VALUE: 1,
        POSITIVE_EXPONENT_TILE_MAX_VALUE: 9,
        BASE_TYPE: 'base',
        EXPONENT_TYPE: 'exponent',
        PARENTHESIS_TYPE: 'parenthesis',
        RAISE_FRACTION: 'fraction',
        ALLOWED_BASES: 3,
        SEPERATOR_ELEMENT_INDEX: '$',
        SEPERATOR_MENU_INDEX: '|',
        BASE_TILES_RESET_ARRAY: [2, 3, 4, 5, 6, 7, 8, 9],
        EXPONENT_TILES_RESET_ARRAY: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        BIN_BASE_TILE_WIDTH_HEIGHT: 48,
        BIN_EXPONENT_TILE_WIDTH_HEIGHT: 36,
        BUILD_MODE_PARENTHESIS_SIZE: { width: 48, height: 48 },

        RULES: {
            MIN_NUM_STEPS: 1
        },

        BASE_CTX_ITEM_ID: {
            CHANGE_SIGN: 'bin-base-tiles-context-menu-0',
            ADD_MUL: 'bin-base-tiles-context-menu-1',
            ADD_NUM_DIV: 'bin-base-tiles-context-menu-2',
            ADD_DEN_DIV: 'bin-base-tiles-context-menu-3'
        },

        EXP_CTX_ITEM_ID: {
            CHANGE_SIGN: 'bin-exponent-tiles-context-menu-0',
            ADD_MUL: 'bin-exponent-tiles-context-menu-1',
            ADD_NUM_DIV: 'bin-exponent-tiles-context-menu-2',
            ADD_DEN_DIV: 'bin-exponent-tiles-context-menu-3',
            RAISE_TO_FRACTION: 'bin-exponent-tiles-context-menu-4'
        },

        PARENS_CTX_ITEM_ID: {
            NOT_USED: 'bin-parenthesis-tiles-context-menu-0',
            ADD_EXPR: 'bin-parenthesis-tiles-context-menu-1',
            ADD_NUM: 'bin-parenthesis-tiles-context-menu-2',
            ADD_DEN: 'bin-parenthesis-tiles-context-menu-3'
        }
    });
})();
