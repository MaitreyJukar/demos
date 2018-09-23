(function () {
    'use strict';
    var namespace = MathInteractives.Common.Interactivities.ExponentAccordion.Views,
        equationManagerModelNameSpace = MathInteractives.Common.Components.Models.EquationManager,
        equationManagerNamespace = MathInteractives.Common.Components.Views.EquationManager;

    /**
    * Class for Tutorial EXPONENT Accordion main view ,contains properties and methods of Tutorial EXPONENT Accordion main view.
    * @class TutorialFormExpression
    * @module ExponentAccordion
    * @namespace MathInteractives.Interactivities.ExponentAccordion.Views
    * @extends MathInteractives.Common.Interactivities.ExponentAccordion.Views.FormExpression
    * @type Object
    * @constructor
    */
    namespace.TutorialFormExpression = namespace.FormExpression.extend({

        /**
        * Contains current step data
        * [<data>]
        * Where data = {
		*                   SimulateActionEnum : ActionEnum,
		*                   Target: {object},
		*                   NextTarget : {object}
	    *              }
        * And Target = {
        *                   Element: element
		*                   Offset : offset in x and y form
		*                   Animation: className
        *              }
        *
        * @property _parseStep
        * @default null
        * @private
        * @type Array
        */
        _parseStep: null,

        /**
        * Handle current mode of the screen
        * Don't use model data to fetch for current mode
        * Because we always start from start mode, so no need to check for it
        *
        * @property  _currentMode
        * @default null
        * @private
        */
        _currentMode: null,

        /**
        * Reference to check if bin tiles is click or not
        *
        * @property  _isClickToNegate
        * @default false
        * @type Boolean
        * @private
        */
        _isClickToNegate: false,


        _setNegateTile: false,
        /**
        * Reference of the Got it popup view
        *
        * @property  _gotItPopupView
        * @default null
        * @type Object
        * @private
        */
        _gotItPopupView: null,

        /**
        * Total action which has to be done in 1 step
        *
        * @property _totalAction
        * @default -1
        * @type Number
        * @private
        */
        _totalAction: -1,

        /**
        * Holds data required to update events (attach required and dettach events) on Equation Manager tiles for
        * current tutorial step.
        *
        * @property _EMOptions
        * @type Object
        * @default {}
        */
        _EMOptions: {},

        /**
        * Menu item to be animate while openinig tooltip
        *
        * @property _menuItem
        * @type Element
        * @default null
        */
        _menuItem: null,

        _isScrollInSolveMode: null,

        accTutSourceData: {},
        accTutDestData: {},

        /**
        * Backbone events object
        *
        * @property events
        * @public
        **/
        //events: function () {
        //    var _events = namespace.TutorialFormExpression.__super__.events.apply(this, arguments);
        //    _events = $.extend({}, _events, {
        //        'click .replay-btn.active': '_onReplayBtnClick'
        //    });
        //    delete _events['mousedown'];
        //    return _events;
        //},
        _bindEventsOnButtons: function () {
            namespace.TutorialFormExpression.__super__._bindEventsOnButtons.apply(this, arguments);
            var self = this;
            this.$el.off('click', '.replay-btn.clickEnabled').on('click', '.replay-btn.clickEnabled', function (event) {
                self._onReplayBtnClick(event);
            });
            this.$el.off('mousedown');
            //if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
            //    this.$('#' + this.idPrefix + 'workspace-equation-container').on('touchstart', function (event) {
            //        event.preventDefault();
            //    });
            //}
        },
        /**
        * Replay button click handler; calls tutorial player's playStep method.
        *
        * @method _onReplayBtnClick
        **/
        _onReplayBtnClick: function _onReplayBtnClick() {
            this.stopReading();
            this.$('.fake-marquee').remove();
            this._setNegateTile = false;
            this.tutorialView.playParsedStep();
        },

        /**
        * Enables/ disabled the replay buttons depending on the boolean passed.
        *
        * @method enableDisableReplayBtn
        * @param enable {Boolean} Enable the buttons if true, disable it false.
        */
        enableDisableReplayBtn: function enableDisableReplayBtn(enable) {
            var ButtonNamespace = MathInteractives.global.Theme2.Button,
                buttonState = (enable) ? ButtonNamespace.BUTTON_STATE_ACTIVE : ButtonNamespace.BUTTON_STATE_DISABLED;
            this.buildModeReplayBtn.setButtonState(buttonState);
            this.solveModeReplayBtn.setButtonState(buttonState);
        },

        /**
        * Initializes the Tutorial Form Expression View
        *
        * @method initialize
        **/
        initialize: function () {
            this.$el.removeClass('form-expression-tab');
            this.accordionLevel = this.model.get('accordionLevel');
            var currentView = this.model.get('currentView'),
                self = this,
                checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck,
                ExponentAccordionModel = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;
            this._isIE9 = (checkBrowser.isIE === true && checkBrowser.browserVersion === '9.0');
            this._isIE = (checkBrowser.isIE === true || checkBrowser.isIE11 === true);
            this.initializeDefaultProperties();
            if (this.options.idPrefix) {
                this.idPrefix = this.options.idPrefix;
            }
            if (!(this.options.tutorialMode === null
                  || this.options.tutorialMode === undefined)) {
                this._tutorialMode = this.options.tutorialMode;
            }
            this.loadScreen('direction-text-screen');
            this.loadScreen('form-expression-screen');
            this._cacheDomElements();
            this._renderDirectionText();
            this.createFormEquationManager();
            this.render();
            this._bindAccEvents();
            this._bindEventsOnButtons();
            this.loadScreen('swipe-region-screen');
            this._handleTouchScroll();
            this._createContextMenu();
            this.listenTo(this.model, 'change:tutorialDataSelectorView', this.setAccessibilityTextForMainActivityArea, this);
            //this._fractionModeChange(this.model.get('fractionMode'));
        },


        /**
        * Create a Form equation manager with tutorial mode on
        *
        * @method createFormEquationManager
        * @public
        */
        createFormEquationManager: function () {
            var strDroppables, options;
            strDroppables = '*';
            options = {
                'player': this.player,
                'allowedOperation': this.model.get('allowedOperation'),
                'maxPrimeLimit': this.model.get('maxPrimeLimit'),
                'fractionMode': this.model.get('fractionMode'),
                isParenthesesAllowed: this.model.get('isParenthesesAllowed'),
                adjustContainment: false,
                mode: equationManagerModelNameSpace.EquationManager.MODES.BuildMode,
                buildModeParenthesisSize: namespace.FormExpression.BUILD_MODE_PARENTHESIS_SIZE
            };
            this._formEquationManager = new namespace.FormExpressionEquationManager({
                element: this.$('#' + this.idPrefix + 'droppable-region'),
                strDroppables: strDroppables,
                'marqueeDiv': '#' + this.idPrefix + 'droppable-region-holder',
                model: new equationManagerModelNameSpace.EquationManager(options),
                tutorialMode: true,
                player: this.player,
                filePath: this.filePath,
                manager: this.manager
            });
            this._attchBinEvents();
            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this._attachAccEvents();
            }
            this._currentMode = equationManagerModelNameSpace.EquationManager.MODES.BuildMode;
        },

        /**
        * Create a Equation manager with tutorial mode on
        *
        * @method _createEquationManager
        * @private
        */
        _createEquationManager: function () {
            if (!this._equationManager) {
                var options = {
                    allowedOperation: this.model.get('allowedTutorialOperation'),
                    maxPrimeLimit: this.model.get('maxPrimeLimit'),
                    allowManagerLevelOperations: 4095,
                    player: this.player,
                    filePath: this.filePath,
                    manager: this.manager,
                    fractionMode: this.model.get('fractionMode'),
                    isParenthesesAllowed: this.model.get('isParenthesesAllowed'),
                    numOfTilesInNumDen: this.model.get('numOfTilesInNumDen'),
                    adjustContainment: true,
                    mode: equationManagerModelNameSpace.EquationManager.MODES.SolveMode
                };
                this._equationManager = new namespace.EquationManager({
                    model: new equationManagerModelNameSpace.EquationManager(options),
                    element: this.$('#' + this.idPrefix + 'workspace-scrollable'),
                    draggableContainment: this.$('#' + this.idPrefix + 'workspace-draggable-containment'),
                    tutorialMode: true,
                    player: this.player,
                    filePath: this.filePath,
                    idPrefix: this.idPrefix,
                    manager: this.manager
                });
                this._attachDataEvents();
                this._currentMode = equationManagerModelNameSpace.EquationManager.MODES.SolveMode;
            }
        },

        _setNewEquation: function _setNewEquation(equationManager, equationViewContainer, equationJSON, bRender, isSavedStateLoad) {
            var data = {};
            data = {
                cmdFactoryData: {
                    allowedOperation: this.model.get('allowedTutorialOperation'),
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
                //Id prefix different :(
                this.unloadScreen('expression-text');
                this.loadScreen('expression-text');
            }
            this._enableDisableEquationViewDroppable(equationManager);
        },

        /**
        * Play tutorial mode from screen 0
        *
        * @method playTutorialMode
        * @public
        */
        playTutorialMode: function () {
            if (this._tutorialMode) {
                // Play first step
                if (this.tutorialView) {

                    this.tutorialView.play();
                }
            }
        },

        /**
        * An array of cursor enums that are needed in one animating step; set while parsing the step data.
        *
        * @property _cursorEnumsForStep
        * @type Array
        * @default null
        * @private
        */
        _cursorEnumsForStep: null,

        /**
        * A counter for the _cursorEnumsForStep array; reset at the start of animation and incremented in the method
        * _onCursorChangeRequired.
        *
        * @property _cursorChangeCounter
        * @type Number
        * @default 0
        * @private
        */
        _cursorChangeCounter: 0,

        /**
        * Creates the tutorial player view
        *
        * @method _createTutorialPlayer
        * @param arrSteps {Object} Array of steps data.
        * @private
        */
        _createTutorialPlayer: function _createTutorialPlayer(arrSteps) {
            var TutorialModelClass = MathInteractives.Common.Components.Theme2.Models.TutorialPlayer,
                tutorialEvents = TutorialModelClass.EVENTS,
                tutorialModel = new TutorialModelClass({
                    steps: arrSteps
                });
            this.tutorialView = new MathInteractives.Common.Components.Theme2.Views.TutorialPlayer({
                player: this.player,
                idPrefix: this.idPrefix,
                model: tutorialModel
            });
            this.tutorialView.off(tutorialEvents.ALL_STEPS_COMPLETED)
            .on(tutorialEvents.ALL_STEPS_COMPLETED, $.proxy(this._allStepsCompleted, this));;
        },

        /**
        * Sets the $el of the tutorial player view and renders the view.
        *
        * @method _setTutorialPlayerEl
        * @param $ele {Object} The jquery element to be set as the view's $el.
        * @private
        */
        _setTutorialPlayerEl: function _setTutorialPlayerEl($ele) {
            this.tutorialView.setElement($ele);
            this.tutorialView.render();
        },

        /**
        * Generates buttons for the view.
        *
        * @method _renderButtons
        * @private
        **/
        _renderButtons: function _renderButtons() {
            namespace.TutorialFormExpression.__super__._renderButtons.apply(this, arguments);
            this._renderReplayAnimationButtons();
            this.loadScreen('tutorial-buttons-screen');
        },

        /**
        * Creates and renders the replay animation buttons, one each in build and solve mode.
        *
        * @method _renderReplayAnimationButtons
        * @private
        */
        _renderReplayAnimationButtons: function _renderReplayAnimationButtons() {
            var ButtonClass, buttonProperties;
            ButtonClass = MathInteractives.global.Theme2.Button;
            buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'replay-btn',
                    text: this.getMessage('replay-button-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'btn-yellow',
                    textColor: '#222222'
                }
            };
            this.buildModeReplayBtn = new ButtonClass.generateButton(buttonProperties);

            buttonProperties.data.id = this.idPrefix + 'solve-mode-replay-btn';
            this.solveModeReplayBtn = new ButtonClass.generateButton(buttonProperties);
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
                index, currentIndex;
            for (index = 0; index < parIndexToDisable.length; index++) {
                currentIndex = parIndexToDisable[index];
                buttonViews[parIndexToDisable[index]].setButtonState('disabled'/*, {
                    $dragTile: buttonViews[parIndexToDisable[index]].$el,
                    isCenterAlign: true
                }*/);
                buttonViews[parIndexToDisable[index]].$el.draggable("disable");
            }
            if (index === 2) {
                this.player.enableHelpElement('parenthesis-tile-container-value-1', 0, false);
            }
        },

        /**
        * Model attribute 'buildModeDivisionMode' equivalent boolean for tutorial's equation data used in done
        * button click handler.
        *
        * @property _tutorialBuildModeDivisionMode
        * @type Boolean
        * @default false
        */
        _tutorialBuildModeDivisionMode: false,

        /**
        * Model attribute 'solveModeDivisionMode' equivalent boolean for tutorial's equation data used in done
        * button click handler.
        *
        * @property _tutorialSolveModeDivisionMode
        * @type Boolean
        * @default false
        */
        _tutorialSolveModeDivisionMode: false,

        /**
        * Renders the tutorial view
        * Update form-expression-equation-manager
        * Create tutorial view
        *
        * @method updateViewForTutorialMode
        * @public
        */
        updateViewForTutorialMode: function updateViewForTutorialMode() {
            var model = this.model,
                tutorialEvents = MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.EVENTS,
                eqnData,
                tutorialView = model.get('tutorialView'),
                tutorialLessons = model.get('tutorialLessons'),
                tutorialNumber = model.get('currentTutorialLessonNumber'),
                textMessageID = 'tutorial-' + tutorialNumber;
            this.$el.addClass('tutorial-area')
            .removeClass('tutorial-0 tutorial-1 tutorial-2 tutorial-3 tutorial-4 tutorial-5')
            .addClass('tutorial-' + tutorialNumber);

            this._renderDirectionText();
            // Reset Equation manager to its initial state
            // Because we don't allow to start tutorial steps in between
            //this.unloadScreen('bin-tiles-screen');
            //this.loadScreen('bin-tiles-screen');

            this.unloadScreen('tutorial-bin-tiles-screen');
            this.loadScreen('tutorial-bin-tiles-screen');

            //this.updateAccessibilityTextForBinTiles();

            /*this.enableTab('base-tile-dispenser-container', false);
            this.enableTab('exponents-tile-dispenser-container', false);
            this.enableTab('parenthesis-tile-dispenser-container', false);*/
            this.enableTab('droppable-region', false);



            this.binBaseTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-base-tiles-context-menu-0', this.idPrefix + 'bin-base-tiles-context-menu-1', this.idPrefix + 'bin-base-tiles-context-menu-2', this.idPrefix + 'bin-base-tiles-context-menu-3', this.idPrefix + 'bin-base-tiles-context-menu-4', this.idPrefix + 'bin-base-tiles-context-menu-5'], false);
            this.binExponentTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-exponent-tiles-context-menu-0', this.idPrefix + 'bin-exponent-tiles-context-menu-1', this.idPrefix + 'bin-exponent-tiles-context-menu-2', this.idPrefix + 'bin-exponent-tiles-context-menu-3', this.idPrefix + 'bin-exponent-tiles-context-menu-4', this.idPrefix + 'bin-exponent-tiles-context-menu-5', this.idPrefix + 'bin-exponent-tiles-context-menu-6'], false);
            switch (tutorialNumber) {
                case 0:
                    this.binBaseTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-base-tiles-context-menu-0', this.idPrefix + 'bin-base-tiles-context-menu-2', this.idPrefix + 'bin-base-tiles-context-menu-3', this.idPrefix + 'bin-base-tiles-context-menu-4', this.idPrefix + 'bin-base-tiles-context-menu-5'], true);
                    this.binExponentTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-exponent-tiles-context-menu-0', this.idPrefix + 'bin-exponent-tiles-context-menu-2', this.idPrefix + 'bin-exponent-tiles-context-menu-3', this.idPrefix + 'bin-exponent-tiles-context-menu-4', this.idPrefix + 'bin-exponent-tiles-context-menu-5', this.idPrefix + 'bin-exponent-tiles-context-menu-6'], true);
                    break;
                case 1:
                    this.binBaseTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-base-tiles-context-menu-1', this.idPrefix + 'bin-base-tiles-context-menu-2', this.idPrefix + 'bin-base-tiles-context-menu-3', this.idPrefix + 'bin-base-tiles-context-menu-4', this.idPrefix + 'bin-base-tiles-context-menu-5'], true);
                    this.binExponentTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-exponent-tiles-context-menu-0', this.idPrefix + 'bin-exponent-tiles-context-menu-2', this.idPrefix + 'bin-exponent-tiles-context-menu-3', this.idPrefix + 'bin-exponent-tiles-context-menu-4', this.idPrefix + 'bin-exponent-tiles-context-menu-5', this.idPrefix + 'bin-exponent-tiles-context-menu-6'], true);
                    break;
                case 5:
                    this.binExponentTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-exponent-tiles-context-menu-1', this.idPrefix + 'bin-exponent-tiles-context-menu-2', this.idPrefix + 'bin-exponent-tiles-context-menu-3', this.idPrefix + 'bin-exponent-tiles-context-menu-4', this.idPrefix + 'bin-exponent-tiles-context-menu-5', this.idPrefix + 'bin-exponent-tiles-context-menu-6'], true);
                    break;
            }


            if (tutorialView === null || tutorialView === ExponentAccordionModel.EXPLORE_VIEW.FORMATION) {
                this._resetAllBinTiles();
                this._activateAllBinTiles(false);
            }
            this._disableAllButtons();

            // Generate equation data accordingly
            if (tutorialLessons[tutorialNumber]) {
                if (this.tutorialView === null) {
                    this._createTutorialPlayer(tutorialLessons[tutorialNumber].steps);
                    this._setTutorialPlayerEl(this._$elmTutorialContainer);
                }
                else {
                    this.tutorialView.updateSteps(tutorialLessons[tutorialNumber].steps);
                }

                if (tutorialLessons[tutorialNumber].equationData) {
                    eqnData = tutorialLessons[tutorialNumber].equationData;
                    this._currentMode = eqnData.startMode;
                    if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                        this.tileDropped = true;
                        if (eqnData.tileArray[0].type === equationManagerModelNameSpace.TileItem.BinTileType.FRACTION) {
                            this._$elmFormExpDropRegion.addClass('division').removeClass('multiplication');
                            this._tutorialBuildModeDivisionMode = true;
                        }
                        else {
                            this._$elmFormExpDropRegion.removeClass('division').addClass('multiplication');
                            this._tutorialBuildModeDivisionMode = false;
                        }
                        this._setNewEquation(this._formEquationManager,
                                             this.$('#' + this.idPrefix + 'form-expression-area'), eqnData, true);
                        this._showHideFormEquationView(true);
                    }
                    else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                        this._createEquationManager();
                        //if (eqnData.tileArray[0].type === equationManagerModelNameSpace.TileItem.BinTileType.FRACTION) {
                        //    this._tutorialSolveModeDivisionMode = true;
                        //}
                        //else {
                        //    this._tutorialSolveModeDivisionMode = false;
                        //}
                        this._tutorialSolveModeDivisionMode = (this.model.get('accordionLevel') > 2);
                        this._setNewEquation(this._equationManager,
                                             this.$('#' + this.idPrefix + 'workspace-expression-area'), eqnData, true);
                        this._renderInitialExpression(eqnData);
                        this._showHideEquationManager(true);
                    }
                    if (this._isTouch) {
                        this._isScrollInSolveMode = eqnData.scrollMode;
                        if (this._isScrollInSolveMode) {
                            this._setScrollForSolveMode();
                        }
                        else {
                            this._resetScrollForSolveMode();
                        }
                    }
                }
                this.tutorialView.off(tutorialEvents.PARSED_STEP_REQUIRED)
                .on(tutorialEvents.PARSED_STEP_REQUIRED, this._parsedStepRequired, this)
                .off(tutorialEvents.ANIMATION_START)
                .on(tutorialEvents.ANIMATION_START, $.proxy(this._onTutorialAnimationStart, this))
                .off(tutorialEvents.STEP_ANIMATION_END)
                .on(tutorialEvents.STEP_ANIMATION_END, $.proxy(this._onTutorialStepAnimationComplete, this))
                .off(tutorialEvents.HANDLE_CSS_ANIMATION_FOR_IE9)
                .on(tutorialEvents.HANDLE_CSS_ANIMATION_FOR_IE9, $.proxy(this._handleIe9CssAnimation, this))
                .off(tutorialEvents.CURSOR_CHANGE_REQUIRED)
                .on(tutorialEvents.CURSOR_CHANGE_REQUIRED, $.proxy(this._onCursorChangeRequired, this));
                // Hide Raised to power image
                //this._$elmRaisedToPowerImgContainer.hide();

                this.$('.fake-marquee').remove();
                if (this.toggleButtonView) {
                    this.toggleButtonView.$el.removeClass('inactive on-inactive off-inactive');
                }
            }

            if (this._equationManager) { this._equationManager.removeMarquee(); }
            if (this._formEquationManager) { this._formEquationManager.removeMarquee(); }
        },

        updateAccessibilityTextForBinTiles: function updateAccessibilityTextForBinTiles () {
            this.setAccMessage('base-tile-value2', this.getAccMessage('base-tile-value2', 0) + this.getAccMessage('tutorial-base-exp-messages', 0) + this.getAccMessage('tutorial-base-exp-messages', 2));
            this.setAccMessage('base-tile-value4', this.getAccMessage('base-tile-value4', 0) + this.getAccMessage('tutorial-base-exp-messages', 0) + this.getAccMessage('tutorial-base-exp-messages', 2));
            this.setAccMessage('exponent-tile-value1', this.getAccMessage('exponent-tile-value1', 0) + this.getAccMessage('tutorial-base-exp-messages', 0) + this.getAccMessage('tutorial-base-exp-messages', 1));
            this.setAccMessage('exponent-tile-value2', this.getAccMessage('exponent-tile-value2', 0) + this.getAccMessage('tutorial-base-exp-messages', 0) + this.getAccMessage('tutorial-base-exp-messages', 1));
            this.setAccMessage('exponent-tile-value6', this.getAccMessage('exponent-tile-value6', 0) + this.getAccMessage('tutorial-base-exp-messages', 0) + this.getAccMessage('tutorial-base-exp-messages', 1));
        },

        /**
         * Sets accessibility text for main activity area on the change of the current tutorial view and also on click of the done button
         * @method setAccessibilityTextForMainActivityArea
         * @public
         *
         * @param {Object} model The view's model
         * @param {String} view  The screen
         */
        setAccessibilityTextForMainActivityArea: function (model, screenView) {
            if(screenView !== MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.TUTORIAL_VIEW.TUTORIAL_SCREEN) {
                return;
            }

            if(this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                this.setAccMessage('main-activity-area-container', this.getAccMessage('tutorial-acc-container', 5) + this.getAccMessage('tutorial-acc-container', 1));
                return;
            }
            switch(model.get('currentTutorialLessonNumber')) {
                case 0: {
                    this.setAccMessage('main-activity-area-container', this.getAccMessage('tutorial-acc-container', 0) + this.getAccMessage('tutorial-acc-container', 1));
                    break;
                }
                case 1:
                case 5:{
                    this.setAccMessage('main-activity-area-container', this.getAccMessage('tutorial-acc-container', 0) + this.getAccMessage('tutorial-acc-container', 2) +this.getAccMessage('tutorial-acc-container', 1));
                    break;
                }
            }
        },

        /**
        * Set scrollbar in Solve mode for tutorial
        *
        * @method _setScrollForSolveMode
        * @private
        */
        _setScrollForSolveMode: function () {
            var bottomContainer = this.$el.find('.workspace-bottom-container');
            bottomContainer.removeClass('withScroll').addClass('withScroll');
            var replayBtnContainer = this.$el.find('.replay-btn-container');
            replayBtnContainer.removeClass('withScroll').addClass('withScroll');
            this._showHideScrollRegion(true);
        },

        /**
        * Reset scrollbar in Solve mode for tutorial
        *
        * @method _resetScrollForSolveMode
        * @private
        */
        _resetScrollForSolveMode: function () {
            var bottomContainer = this.$el.find('.workspace-bottom-container');
            bottomContainer.removeClass('withScroll');
            var replayBtnContainer = this.$el.find('.replay-btn-container');
            replayBtnContainer.removeClass('withScroll');
            this._showHideScrollRegion(false);
        },

        /**
        * Show/Hide scroll region
        *
        * @method _showHideScrollRegion
        * @param {Boolean} show True to show scroll region
        * @private
        */
        _showHideScrollRegion: function (show) {
            var scrollRegion = this.$el.find('.swipe-region');
            if (show) {
                scrollRegion.show();
            }
            else {
                scrollRegion.hide();
            }
        },

        /**
        * Render the intial expression for tutorial starting directly in solve mode.
        *
        * @method _renderInitialExpression
        * @param equationData {Object} Equation data coming from config json.
        */
        _renderInitialExpression: function _renderInitialExpression(equationData) {
            var originalExprTileArrayData = $.extend(true, {}, equationData).tileArray,
                $originalExpr = this._getExpression(originalExprTileArrayData, equationData.type),
                $ogExpressionHolder = this.$('.original-expression-holder').html($originalExpr),
                path = this.filePath,
                operatorClass = path.getFontAwesomeClass('dot');

            $ogExpressionHolder.find('.operator-data-tab').addClass(operatorClass);
            if ($ogExpressionHolder.find('.denominator').hasClass('denominator-empty')) {
                $ogExpressionHolder.find('.vincullum').hide();
            }
        },

        _getOriginalExpression: function _getOriginalExpression() {
            var equationJson = this._equationManager.getCurrentEquationJSON(),
                originalExprData = {
                    tileArray: equationJson.tileArray,
                    type: equationJson.type
                };
            return this._getExpression(originalExprData.tileArray, originalExprData.type, '');
        },

        /**
        * Call when all steps completed
        * Show Got it modal
        *
        * @method _allStepsCompleted
        * @private
        */
        _allStepsCompleted: function () {
            // To prevent JS error "cannot call methods on draggable prior to initialization" on Next button click
            this._EMOptions = {};
            this._updateEventOnEquationManager();

            // When all steps completed, show Hack div to avoid any user selection
            var self = this;
            window.setTimeout(function () { self.animationStart() }, 100);
            // Disable Replay Animation button
            this.enableDisableReplayBtn(false);
            var currentEquationManager = null;
            if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                currentEquationManager = this._formEquationManager;
            }
            else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                currentEquationManager = this._equationManager;
            }
            // DeActivate all the tiles in equation manager
            currentEquationManager.deActivateEventOnAllTiles(true);

            // Remove all inactive class
            this.$el.find('.custom-droppable-disabled').removeClass('custom-droppable-disabled');
            this.$el.find('.inactive').removeClass('inactive');

            // After some time, show popup
            window.setTimeout($.proxy(this._showGotItPopup, this),
                              namespace.TutorialFormExpression.ANIMATION_DURATIONS.PAUSE_BETWEEN_ANIMATIONS);
        },

        /**
        * Called on tutorial player's animation start event, it disables the replay button
        *
        * @method _onTutorialAnimationStart
        */
        _onTutorialAnimationStart: function _onTutorialAnimationStart() {
            var currentEquationManager;

            this.player.enableAllHeaderButtons(false);
            this.enableDisableReplayBtn(false);
            this._isTutorialPlaying = true;
            this._cursorChangeCounter = 0;
            if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                currentEquationManager = this._formEquationManager;
            }
            else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                currentEquationManager = this._equationManager;
            }
            /*if (!currentEquationManager.getCurrentAccView()) {
                this.activeElem = document.activeElement;
                this.tutorialView.el.focus();
            }*/
            currentEquationManager.animationOn = true;
        },

        /**
        * Event handler for tutorial event CURSOR_CHANGE_REQUIRED; it updates the tutorial's cursor depending
        * on the _cursorChangeCounter using the _cursorEnumsForStep array set while parsing step.
        *
        * @method _onCursorChangeRequired
        */
        _onCursorChangeRequired: function _onCursorChangeRequired() {
            var cursorToUseEnum = this._cursorEnumsForStep[this._cursorChangeCounter],
                cursorInfo;
            if (cursorToUseEnum === null && typeof cursorToUseEnum === 'undefined') {
                cursorToUseEnum = 0;
            }
            cursorInfo = this._getCursorInfo(cursorToUseEnum);
            this.tutorialView.updateCursor(cursorInfo);
            this._cursorChangeCounter++;
        },

        /**
        * Maps the cursor enum passed to the cursor information from view's static part.
        *
        * @method _getCursorInfo
        * @param cursorEnum {String} The cursor enum indicating the cursor image to be set.
        * @return {String} The cursor's information like image's url to be set as the background-image, image size,
        * interaction-point.
        */
        _getCursorInfo: function _getCursorInfo(cursorEnum) {
            var returnObj,
                cursorEnumMap = namespace.TutorialFormExpression.CURSORS,
                cursorInfo = cursorEnumMap[cursorEnum];
            returnObj = {
                cursorImage: '',
                interactionPointOffset: { x: 0, y: 0 },
            };
            switch (cursorEnum) {
                case '0': // no cursor
                    break;
                case '1': // default cursor
                case '2': // open hand cursor
                case '3': // closed-hand cursor
                case '4': // pointer cursor
                    returnObj.cursorImage = 'url(\'data:image/png;base64,' + cursorInfo.BASE_64 + '\')';
                    //returnObj.interactionPointOffset = cursorInfo.INTERACTION_POINT;
                    returnObj.size = { width: cursorInfo.WIDTH + 'px', height: cursorInfo.HEIGHT + 'px' };
                    break;
            }
            return returnObj;
        },

        /**
        * Parse and validate the steps
        *
        * @method _parsedStepRequired
        * @param stepToBeParsed {Object} The step to be parsed.
        * @private
        */
        _parsedStepRequired: function _parsedStepRequired(stepToBeParsed) {
            // got the current step to be render
            var actionSeperator = namespace.TutorialFormExpression.SEPERATOR_ACTION,
                dataSeperator = namespace.TutorialFormExpression.SEPERATOR_DATA,
                targetSeperator = namespace.TutorialFormExpression.SEPERATOR_TARGET,
                tutorialEvents = MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.EVENTS,
                action = null,
                actionLen = 0,
                arrAction = null,
                data = null,
                arrData = null,
                dataLen = 0,
                target = null,
                arrTarget = null,
                elementIndex = null,
                menuIndex = null,
                offset = null,
                animation = null,
                isMarqueeDraggable = null,
                isMarqueeDroppable = null,
                enabledTiles = null,
                disabledTiles = null,
                stepParser = [],
                lstTargetIndex = [],
                lstAllowTargetIndexEM = [],
                lstAllowTargetIndexBin = [],
                eachStepParser = null,
                tutorialIndex = {},
                allowTarget = {},
                stepTarget = null,
                options = {},
                animationArr = [],
                dynamicGenElemAnimationArr = [],
                animationClass = null,
                nextToJump = -1,
                isMenuIndex = false,
                currentEquationManager = null,
                self = this,
                accArray = [];

            this.stepContainsMarquee = false;

            // If any stepToBeParsed is given
            if (stepToBeParsed) {
                action = stepToBeParsed.action;
                // If action is found, then only go further
                if (action) {
                    arrAction = action.split(actionSeperator);
                    actionLen = parseInt(arrAction, 10);
                    this._totalAction = actionLen;
                    // Loop through no of action given in 1st index
                    for (var counter = 1; counter <= actionLen; counter++) {
                        eachStepParser = {};
                        data = arrAction[counter];
                        // If data is found, go further
                        if (data) {
                            arrData = data.split(dataSeperator);
                            if (arrData) {
                                nextToJump = parseInt(arrData[0], 10);
                                // If it is NaN, make it -1
                                eachStepParser.nextStepToJump = isNaN(nextToJump) ? -1 : nextToJump;
                                eachStepParser.simulateActionEnum = parseInt(arrData[1], 10);
                                accArray.push(eachStepParser.simulateActionEnum);
                                // For Simulate Action Enum - arrData[0];
                                dataLen = arrData.length;
                                for (var dataCounter = 2; dataCounter < dataLen; dataCounter++) {
                                    stepTarget = {};
                                    allowTarget = {};
                                    // Get target element from 2nd index onwards
                                    target = arrData[dataCounter];
                                    if (target) {
                                        arrTarget = target.split(targetSeperator);
                                        // If array of target found, extract it
                                        if (arrTarget) {
                                            // 0th index contains element index
                                            elementIndex = arrTarget[0];
                                            // 1st index contains element offset
                                            offset = arrTarget[1];
                                            if ($.type(offset) === "string") {
                                                offset = Number(offset);
                                            }
                                            if (elementIndex) {
                                                var arrElementIndex = elementIndex.split('|');
                                                if (arrElementIndex.length === 2) {
                                                    // We found menu index
                                                    isMenuIndex = true;
                                                }
                                                if (this._validTargetElement(arrElementIndex[0])) {
                                                    tutorialIndex = this._getTutorialElementIndex(arrElementIndex[0]);
                                                    var oTarget = this._getViewWithOffset(tutorialIndex, offset);
                                                    accArray.push(tutorialIndex, offset);
                                                    if (oTarget) {
                                                        if (oTarget.element.length) {
                                                            if (dataCounter === 2) {
                                                                // Target element
                                                                stepTarget.element = oTarget.element[0];
                                                            }
                                                            else {
                                                                // Next target element
                                                                stepTarget.element = oTarget.element.slice(1);
                                                            }
                                                        }
                                                        else {
                                                            stepTarget.element = oTarget.element;
                                                        }
                                                        stepTarget.offset = oTarget.offset;
                                                        stepTarget.isButton = oTarget.isButton;
                                                        // commented the following line cause the tutorial needs not know about a bin's presence
                                                        //stepTarget.isBin = tutorialIndex.isBin;
                                                    }
                                                    allowTarget.index = tutorialIndex.elementIndex;
                                                    allowTarget.simulateAction = eachStepParser.simulateActionEnum;
                                                    allowTarget.offset = offset;
                                                    if (isMenuIndex) {
                                                        // Allow menu click only in solve mode for equation manager only
                                                        // As, it is only click event, no need to implement in nextTarget object
                                                        allowTarget.menuIndex = arrElementIndex[1];
                                                    }
                                                    if (tutorialIndex.isBin) {
                                                        lstAllowTargetIndexBin.push($.extend({}, allowTarget));
                                                    }
                                                    else {
                                                        if (dataCounter === 2) {
                                                            if (tutorialIndex.isNotTile) {
                                                                isMarqueeDraggable = true;
                                                            }
                                                            else {
                                                                lstAllowTargetIndexEM.push($.extend({}, allowTarget));
                                                            }
                                                        }
                                                        else {
                                                            if (tutorialIndex.isNotTile) {
                                                                isMarqueeDroppable = true;
                                                            }
                                                            else {
                                                                lstTargetIndex.push(tutorialIndex.elementIndex);
                                                            }
                                                        }

                                                        if (tutorialIndex.isNotTile && !this.stepContainsMarquee) {
                                                            this.stepContainsMarquee = true;
                                                        }
                                                    }
                                                }
                                                else {
                                                    console.log('%cError: Please give valid target element index', 'color: red');
                                                }
                                            }

                                            // 2nd index contains animation related info
                                            animation = arrTarget[2];
                                            if (animation) {
                                                animationArr = animation.split(namespace.FormExpression.SEPERATOR_MENU_INDEX);
                                                this._dynamicGenElemAnimationData = [];
                                                for (var index = 1; index < animationArr.length; index++) {
                                                    this._dynamicGenElemAnimationData[index - 1] = this._getParsedAnimationObject(animationArr[index]);
                                                }
                                                stepTarget.animation = this._getParsedAnimationObject(animationArr[0]);
                                                stepTarget.animation.isButton = stepTarget.isButton;
                                            }

                                            // As per index, set target or next target
                                            // Right now, allow only 2 target
                                            if (dataCounter === 2) {
                                                eachStepParser.target = $.extend({}, stepTarget);
                                            }
                                            else if (dataCounter === 3) {
                                                eachStepParser.nextTarget = $.extend({}, stepTarget);
                                            }
                                        }
                                        else {
                                            console.log('%cError: Please give proper target with proper seperator', 'color: red');
                                        }
                                    }
                                    else {
                                        console.log('%cError: Please give target, Dont give only seperators', 'color: red');
                                    }
                                }
                                stepParser.push($.extend({}, eachStepParser));
                            }
                            else {
                                console.log('%cError: Please give proper data', 'color: red');
                            }
                        }
                        else {
                            console.log('%cError: Please give valid action index', 'color: red');
                        }
                    }
                }
                else {
                    console.log('%cError: Please give action', 'color: red');
                }

                this._resetSimulatedStep = !!(stepToBeParsed.requiresUndo);

                this._cursorEnumsForStep = (stepToBeParsed.cursor) ? stepToBeParsed.cursor.split('.') : [];

                this._parseStep = stepParser;

                if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                    currentEquationManager = this._formEquationManager;
                }
                else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                    currentEquationManager = this._equationManager;
                }
                // DeActivate all the click events on tiles in BIN
                this.deActivateClickEventsOnTiles();
                this._enableDisableToggleButtonState(false);
                // DeActivate all the tiles in equation manager
                currentEquationManager.deActivateEventOnAllTiles(true);
            }
            window.setTimeout(function () {
                options = {};
                if (stepParser[0]) {
                    options.actionEnum = stepParser[0].simulateActionEnum;
                }
                options.lstTargetIndex = lstTargetIndex;
                options.lstAllowTargetIndexEM = lstAllowTargetIndexEM;
                //this._lstAllowTargetIndexEM = lstAllowTargetIndexEM;
                options.isMarqueeDraggable = isMarqueeDraggable;
                options.isMarqueeDroppable = isMarqueeDroppable;
                self._EMOptions = options;
                self._updateEventOnEquationManager();

                if (stepToBeParsed) {
                    // Enabled tiles
                    enabledTiles = stepToBeParsed.enable;
                    self._enableDisableTiles(enabledTiles, true, false);

                    // disabled tiles
                    disabledTiles = stepToBeParsed.disable;
                    self._enableDisableTiles(disabledTiles, false);
                }

                self._updateEventOnBin(lstAllowTargetIndexBin);

                self.tutorialView.trigger(tutorialEvents.STEP_PARSED, stepParser);
                self.animationEnd();
            }, 300);

            //start of with accessibility
            if(stepToBeParsed) {
                this.accGetFocusOnRequiredElements(accArray);
            }
        },

        _attachAccEvents: function _attachAccEvents() {
            this.listenTo(this._formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.TUT_SPACE_PRESSED_GO_TO_BIN, this.accTutorialSetFocusToBinElement);

        },

        accGetFocusOnRequiredElements: function accGetFocusOnRequiredElements (accArray) {
            var currentOp = accArray[0],
                tutorialPlayerNameSpace = MathInteractives.Common.Components.Theme2.Models,
                EVENT = equationManagerNamespace.EquationManager.EVENTS,
                currentEquationMgr,
                sourceObj, sourceOffset, sourceView,
                destObj, destOffset, destView;

            if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                currentEquationMgr = this._formEquationManager;
            }
            else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                currentEquationMgr = this._equationManager;
            }

            sourceObj = accArray[1];
            sourceOffset = accArray[2];

            //sourceView = sourceObj.isBin ? this._getBinElementViewFromIndex(sourceObj.elementIndex) : currentEquationMgr.getViewFromIndex(sourceObj.elementIndex);
            if(sourceObj.isBin) {
                sourceView = this._getBinElementViewFromIndex(sourceObj.elementIndex);
                //this.accTutorialSetFocusToBinElement(sourceView.el);
                this.accTutSourceData = currentEquationMgr.accTutSourceData = {
                    sourceView: sourceView,
                    isBin: true,
                    offset: sourceOffset,
                    operation: currentOp,
                    index: sourceObj.elementIndex
                }
                if(this.model.get('currentTutorialLessonStepNumber') === 0) {
                    this.accTutorialSetFocusToBinElement(this.accTutSourceData, true);
                }
            }
            else {
                if (sourceObj.isNotTile) {
                    sourceView = currentEquationMgr.marqueeView;
                }
                else {
                    sourceView = currentEquationMgr.getViewFromIndex(sourceObj.elementIndex);
                }
                this.accTutSourceData = currentEquationMgr.accTutSourceData = {
                    sourceView: sourceView,
                    isBin: false,
                    offset: sourceOffset,
                    operation: currentOp,
                    index: sourceObj.elementIndex
                }
            }

            if(currentOp === tutorialPlayerNameSpace.TutorialPlayer.METHOD_ENUM_INVERSE._promptUserToDrag) {
                destObj = accArray[3];
                destOffset = accArray[4];
                if(destObj.isNotTile){
                    destView = currentEquationMgr.marqueeView;
                }
                else {
                    destView = currentEquationMgr.getViewFromIndex(destObj.elementIndex);
                }
                this.accTutDestData = currentEquationMgr.accTutDestData = {
                    sourceView: destView,
                    isBin: false,
                    offset: destOffset,
                    index: destObj.elementIndex
                }
            }

            if(this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                switch(currentOp) {
                    case 6: {
                        currentEquationMgr.equationView.customTutorialString = this.getAccMessage('build-equation-manager', 0);
                        currentEquationMgr.tutorialCustomTileString = this.getAccMessage('build-equation-manager', 1);
                        break;
                    }
                    case 9: {
                        if(sourceObj.elementIndex.charAt(0) === '2') {
                            currentEquationMgr.equationView.customTutorialString = this.getAccMessage('build-equation-manager', 0);
                            currentEquationMgr.tutorialCustomTileString = this.getAccMessage('build-equation-manager', 2);
                        }
                        else {
                            currentEquationMgr.equationView.customTutorialString = "";
                            currentEquationMgr.tutorialCustomTileString = "";
                        }
                        break;
                    }
                    default: {
                        currentEquationMgr.equationView.customTutorialString = "";
                        currentEquationMgr.tutorialCustomTileString = "";
                        break;
                    }
                }
            }
            else {
                currentEquationMgr.equationView.customTutorialString = this.getAccMessage('build-equation-manager', 0);
                switch(currentOp) {
                        // 6 means emulate marquee
                    case 6: {
                        currentEquationMgr.tutorialCustomTileString = this.getAccMessage('build-equation-manager', 1);
                        break;
                    }
                        // 7means click
                    case 7: {
                        // 1 for exp 0 for base
                        currentEquationMgr.tutorialCustomTileString = sourceOffset === 1 ? this.getAccMessage('build-equation-manager', 3) : this.getAccMessage('build-equation-manager', 4);
                        break;
                    }
                        //drag
                    case 9: {
                        currentEquationMgr.tutorialCustomTileString = this.getAccMessage('build-equation-manager', 5);
                        break;
                    }
                    default: {
                        currentEquationMgr.tutorialCustomTileString = "";
                        break;
                    }
                }
            }

            currentEquationMgr.trigger(EVENT.TUTORIAL_STEP_CHANGE);

        },

        accTutorialSetFocusToBinElement: function accTutorialSetFocusToBinElement (element, notToSetFocus) {
            var elementId = element.sourceView.$el.attr('id').replace(this.idPrefix, ''),
                operation = element.operation;

            if(operation === 9 || operation === 11) {
                var elementValue = element.sourceView.$el.attr('data-tilevalue'),
                    accMessage = +element.index.charAt(0) === 1 ? 1 : 2, //element index is '0.X' for bases and '1.X' for exponents.
                    accMessageBaseSelect;
                if(elementValue.indexOf('-') === -1) {
                    accMessageBaseSelect = +element.index.charAt(0) === 1 ? 5 : 4;
                }
                else {
                    accMessageBaseSelect = +element.index.charAt(0) === 1 ? 7 : 6;
                }

                if(operation === 9) {
                    this.setAccMessage(elementId, this.getAccMessage('tutorial-base-exp-messages', accMessageBaseSelect, [Math.abs(+elementValue)]) + this.getAccMessage('tutorial-base-exp-messages', 0) + this.getAccMessage('tutorial-base-exp-messages', accMessage));
                }
                if(operation === 11) {
                    this.setAccMessage(elementId, this.getAccMessage('tutorial-base-exp-messages', accMessageBaseSelect, [Math.abs(+elementValue)]) + this.getAccMessage('tutorial-base-exp-messages', 3));
                }
            }
            if(notToSetFocus !== true) {
                this.setFocus(elementId);
            }
        },

        _contextMenuSelectEvent: function (draggableTiles, strSelectEvent) {
            var self = this;
            draggableTiles.off(strSelectEvent).on(strSelectEvent, function (event, ui) {
                var currentTargetId = ui.currentTarget.id, $selectedTile = $(event.currentTarget),
                    contextMenuId = parseInt(currentTargetId.substring(currentTargetId.lastIndexOf('-') + 1), 10);
                switch (contextMenuId) {
                    case 0:
                        //Negate Tile
                        var target = event.currentTarget, $tile = $(target), elementId = target.id.replace(self.idPrefix, '');
                        self._tileClickEvent(self, $tile);
                        window.setTimeout(function () {self.setFocus(elementId);}, 1020 );

                        self.binBaseTilesContextMenuView.editContextMenu([self.idPrefix + 'bin-base-tiles-context-menu-0', self.idPrefix + 'bin-base-tiles-context-menu-1', self.idPrefix + 'bin-base-tiles-context-menu-2', self.idPrefix + 'bin-base-tiles-context-menu-3', self.idPrefix + 'bin-base-tiles-context-menu-4', self.idPrefix + 'bin-base-tiles-context-menu-5'], false);
                        self.binBaseTilesContextMenuView.editContextMenu([self.idPrefix + 'bin-base-tiles-context-menu-0', self.idPrefix + 'bin-base-tiles-context-menu-2', self.idPrefix + 'bin-base-tiles-context-menu-3', self.idPrefix + 'bin-base-tiles-context-menu-4', self.idPrefix + 'bin-base-tiles-context-menu-5'], true);
                        if (self.model.get('currentTutorialLessonNumber') === 5 && $tile.attr('data-tiletype') === 'EXPONENT') {
                            self.binExponentTilesContextMenuView.editContextMenu([self.idPrefix + 'bin-exponent-tiles-context-menu-0', self.idPrefix + 'bin-exponent-tiles-context-menu-1', self.idPrefix + 'bin-exponent-tiles-context-menu-2', self.idPrefix + 'bin-exponent-tiles-context-menu-3', self.idPrefix + 'bin-exponent-tiles-context-menu-4', self.idPrefix + 'bin-exponent-tiles-context-menu-5', self.idPrefix + 'bin-exponent-tiles-context-menu-6'], false);
                            self.binExponentTilesContextMenuView.editContextMenu([self.idPrefix + 'bin-exponent-tiles-context-menu-0', self.idPrefix + 'bin-exponent-tiles-context-menu-1', self.idPrefix + 'bin-exponent-tiles-context-menu-2', self.idPrefix + 'bin-exponent-tiles-context-menu-3', self.idPrefix + 'bin-exponent-tiles-context-menu-4', self.idPrefix + 'bin-exponent-tiles-context-menu-5'], true);
                        }
                        break;
                    case 1:
                        //Multiplication
                        if (self._formEquationManager.$el.css('display') !== 'none') {
                            self._formEquationManager.selectedTile = $selectedTile;
                            self._dropBinTileUsingContextMenu(false);
                            if (self.model.get('currentTutorialLessonNumber') === 1) {
                                self.binBaseTilesContextMenuView.editContextMenu([self.idPrefix + 'bin-base-tiles-context-menu-0', self.idPrefix + 'bin-base-tiles-context-menu-1', self.idPrefix + 'bin-base-tiles-context-menu-2', self.idPrefix + 'bin-base-tiles-context-menu-3', self.idPrefix + 'bin-base-tiles-context-menu-4', self.idPrefix + 'bin-base-tiles-context-menu-5'], false);
                                self.binBaseTilesContextMenuView.editContextMenu([self.idPrefix + 'bin-base-tiles-context-menu-1', self.idPrefix + 'bin-base-tiles-context-menu-2', self.idPrefix + 'bin-base-tiles-context-menu-3', self.idPrefix + 'bin-base-tiles-context-menu-4', self.idPrefix + 'bin-base-tiles-context-menu-5'], true);
                            }
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

        _bindAccEvents: function () {
            var self = this;
            this.$('.base-draggable-tiles, .exponent-draggable-tiles').off('keyup').on('keyup', function (event) {
                if((self._formEquationManager && self._formEquationManager.animationOn) || self._$animationDiv.css('display') === 'block') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return false;
                }
            });

            this.$('.base-draggable-tiles, .exponent-draggable-tiles').off('keydown').on('keydown', function (event) {
                if((self._formEquationManager && self._formEquationManager.animationOn) || self._$animationDiv.css('display') === 'block') {
                    event.preventDefault();
                    return false;
                }
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 32) {
                    event.preventDefault();
                    self.$el.trigger('mousedown').trigger('mouseup').trigger('click');
                    if (self.accTutSourceData.operation === 9) {
                        self._formEquationManager.selectedTile = $(this);
                        $(this).trigger('dragstart');
                        //select tile to drop
                        if (self.model.get('currentTutorialLessonNumber') === 5 && self.accTutDestData.offset === 1) {
                            self._setFocusToExponentBigParenthesis(true);
                        }
                        else {
                            self._setFocusToNumerator();
                        }
                    } else if (self.accTutSourceData.operation === 11) {
                        event.preventDefault();
                    }
                }
                else if(uniCode === 13) {
                    event.preventDefault();
                }

            });

            this.$('.raised-to-power-toggle-button').off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 32) {
                    if (self._formEquationManager.equationView) {
                        self._formEquationManager.equationView.tileDroppedString = self.getMessage('base-exp-pair', 21);
                    }
                    setTimeout(function () { self.setFocus('droppable-region'); }, 500);
                }
            });

            this.$('.replay-btn').off('keydown').on('keydown', function (event) {
                var uniCode = event.keyCode ? event.keyCode : event.charCode;
                if (uniCode === 32) {
                    setTimeout(function () { self.setFocusToAnimatingElement(); }, 5);
                }
            });

            this.focusIn('workspace-scrollable', function () {
                self._equationManager.equationView.startAcc();
            });

            this.focusIn('droppable-region', function (event) {
                self._formEquationManager.equationView.buildStartAcc();
            });
        },

        setFocusToAnimatingElement: function setFocusToAnimatingElement () {
            if (this.accTutSourceData.isBin === true && this.accTutSourceData.index.charAt(0) !== '2') {
                this.accTutorialSetFocusToBinElement(this.accTutSourceData);
            }
            else {
                if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                    this.setFocus('droppable-region');
                }
                else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                    this.setFocus('workspace-scrollable');
                }
            }
        },

        _setFocusToNumerator: function () {
            var isFractionItem = this._tutorialBuildModeDivisionMode,
                isRaisedToPower = this.model.get('currentTutorialLessonNumber') === 5, index, isEqnView = false;
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
            var isFractionItem = this._tutorialBuildModeDivisionMode,
                isRaisedToPower = this.model.get('currentTutorialLessonNumber') === 5, index, isEqnView = false;
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



        _setFocusToMaxBasesAllowedTooltip: function () {
            if (this._formEquationManager.getCurrentAccView()) {
                this._formEquationManager.getCurrentAccView().removeAccDiv();
            }
            if (this.model.get('currentTutorialLessonNumber') === 1) {
                this.binBaseTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-base-tiles-context-menu-0', this.idPrefix + 'bin-base-tiles-context-menu-1', this.idPrefix + 'bin-base-tiles-context-menu-2', this.idPrefix + 'bin-base-tiles-context-menu-3', this.idPrefix + 'bin-base-tiles-context-menu-4', this.idPrefix + 'bin-base-tiles-context-menu-5'], false);
                this.binBaseTilesContextMenuView.editContextMenu([this.idPrefix + 'bin-base-tiles-context-menu-1', this.idPrefix + 'bin-base-tiles-context-menu-2', this.idPrefix + 'bin-base-tiles-context-menu-3', this.idPrefix + 'bin-base-tiles-context-menu-4', this.idPrefix + 'bin-base-tiles-context-menu-5'], true);
            }
            if (this._parseStep[0].nextTarget) {
                var nextTarget = this._parseStep[0].nextTarget;
                if (nextTarget.animation && nextTarget.animation.className) {
                    $(nextTarget.element).removeClass(nextTarget.animation.className).removeClass('animated');
                }
            }
            this.setFocus('droppable-region');
            this._proceedToNextStep();

        },

        /**
        * Retrive a view with its offset
        *
        * @method _getViewWithOffset
        * @param {String} sIndex Index of element in Tree form seperate by '.'
        * @param {Enum} offset Offset enum
        * @return {Object} Object which contain element and offset as a key
        */
        _getViewWithOffset: function (targetElementIndex, offset) {
            var index,
                elementIndex,
                firstSeperatorIndex, subString, buttonIndex,
                currentEquationMgr,
                elementView,
                returnElement = null, returnOffset = null,
                returnObj = null,
                isButton = false;

            if (targetElementIndex) {
                if (targetElementIndex.isBin) {
                    // Get element from Bin
                    elementView = this._getBinElementViewFromIndex(targetElementIndex.elementIndex);
                    returnElement = elementView.el;
                    returnOffset = this._getBinElementOffsetFromView(elementView, offset);

                    // patch to handle toggle button drag
                    //      required the handle div inside the view, not the view's el.
                    elementIndex = targetElementIndex.elementIndex;
                    firstSeperatorIndex = elementIndex.indexOf('.');
                    subString = elementIndex.substring(0, firstSeperatorIndex);
                    if (subString === '3') {    // buttons around bin
                        subString = elementIndex.substring(firstSeperatorIndex + 1, elementIndex.length);
                        firstSeperatorIndex = subString.indexOf('.');
                        if (firstSeperatorIndex > 0) {
                            buttonIndex = subString.substring(0, firstSeperatorIndex);
                            if (buttonIndex === '0') {  // toggle button
                                subString = subString.substring(firstSeperatorIndex + 1, subString.length);
                                if (subString === '1') {
                                    returnElement = elementView.$('.handle')[0];
                                    returnOffset = this._getElementOffsetFromElement(returnElement, offset);
                                }
                            }
                        }
                        else {
                            isButton = true;
                        }
                    }

                    returnObj = {
                        element: returnElement,
                        offset: returnOffset,
                        isButton: isButton
                    };
                }
                else {
                    // Get element from Equation manager
                    if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                        currentEquationMgr = this._formEquationManager;
                    }
                    else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                        currentEquationMgr = this._equationManager;
                    }
                    if (targetElementIndex.isNotTile) {
                        returnElement = currentEquationMgr.marqueeView.$marqueeDiv[0];
                        returnObj = {
                            element: returnElement,
                            offset: this._getElementOffsetFromElement(returnElement, 0),
                            isButton: isButton
                        };
                    }
                    else {
                        elementView = currentEquationMgr.getViewFromIndex(targetElementIndex.elementIndex);
                        if (elementView) {
                            returnObj = elementView._getTutorialMouseEventPoint(offset);
                        }
                    }
                }
            }
            return returnObj;
        },

        /**
        * Update event on Bin tiles as per given list
        *
        * @method _updateEventOnBin
        * @param {Array} lstTargetIndex
        * @private
        */
        _updateEventOnBin: function (lstTargetIndex) {
            this.activateEventOnTiles(lstTargetIndex);
        },

        /**
        * Update event on Equation manager tiles as per given list
        *
        * @method _updateEventOnEquationManager
        * @private
        */
        _updateEventOnEquationManager: function () {//lstTargetIndex, lstAllowTargetIndex) {
            var options = this._EMOptions,
                lstTargetIndex, lstAllowTargetIndex, tutorialActionEnum,
                currentEquationManager,
                marqueeFirstItemIndex, marqueeLastItemIndex;
            lstTargetIndex = options.lstTargetIndex || [];
            lstAllowTargetIndex = options.lstAllowTargetIndexEM || [];
            tutorialActionEnum = MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE;
            if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                currentEquationManager = this._formEquationManager;
            }
            else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                currentEquationManager = this._equationManager;
            }
            currentEquationManager.disableTiles(true);
            switch (options.actionEnum) {
                case tutorialActionEnum._promptUserToMarquee:
                    currentEquationManager.marqueeView.enableMarquee();
                    marqueeFirstItemIndex = lstAllowTargetIndex[0].index;
                    marqueeLastItemIndex = lstTargetIndex[0];
                    currentEquationManager.setTutorialMarqueeTargetsIndex(marqueeFirstItemIndex, marqueeLastItemIndex);
                    break;
                default:
                    if (this.stepContainsMarquee) {
                        currentEquationManager.marqueeView.showMarquee();
                        if (options.isMarqueeDraggable) {
                            currentEquationManager.marqueeView.$marqueeDiv.draggable('enable');
                        }
                        if (options.isMarqueeDroppable) {
                            currentEquationManager.marqueeView.$marqueeDiv.droppable('enable');
                        }
                    }
                    // Set drop target element in equation manager
                    currentEquationManager.setTutorialTargetViewIndex(lstTargetIndex);
                    // Activate only target tiles
                    currentEquationManager.activateEventOnTiles(lstAllowTargetIndex);
                    break;
            };
        },

        /**
        * Retrieve the element index with $ seperator
        *
        * @method _getTutorialElementIndex
        * @param {String} sIndex Index with seperator $
        * @return {Object} Object contains {elementIndex, isBin} Element index with BIN tile is true or false
        * @private
        */
        _getTutorialElementIndex: function (sIndex) {
            var index,
                elementIndex,
                returnObj = {};

            if (sIndex) {
                index = sIndex.split(namespace.FormExpression.SEPERATOR_ELEMENT_INDEX);
                if (index[1]) {
                    elementIndex = index[1];
                    returnObj.elementIndex = elementIndex;
                    switch (index[0]) {
                        case '0':
                            returnObj.isBin = true;
                            break;
                        case '2':
                            returnObj.isNotTile = true;
                        default:
                            returnObj.isBin = false;
                            break;
                    }
                }
            }
            return returnObj;
        },

        /**
        * Parses and returns the animation data. Adds interactive specific data like number of times an animation is to
        * be played, duration for which it is to be played.
        *
        * @method _getParsedAnimationObject
        * @param animationData {Object} The animation data that needs to be parsed.
        * @return {Object} The parsed object.
        */
        _getParsedAnimationObject: function _getParsedAnimationObject(animationData) {
            animationData = animationData.split(namespace.FormExpression.SEPERATOR_ELEMENT_INDEX);
            var className = animationData[0],
                returnObj = {
                    className: className,
                    isNotStandard: !!(animationData[1])
                };
            switch (className) {
                case 'bounce':
                    //returnObj.value = 30;
                    //returnObj.duration = 300;
                    break;
                case 'pulse':
                    returnObj.times = 3;
                    returnObj.duration = namespace.TutorialFormExpression.ANIMATION_DURATIONS.PULSE_3_TIMES;
            }
            return returnObj;
        },

        /**
        * Calls the method that corresponds to the animation class that is to be simulated using jquery for IE 9.
        *
        * @method _handleIe9CssAnimation
        * @param $element {Object} The jquery reference of the element to be animated.
        * @param animationClass {String} The animation class name.
        * @param callBack {Object} The call back function to be called at the end of the animation.
        */
        _handleIe9CssAnimation: function _handleIe9CssAnimation($element, animationClass, callBack) {
            switch (animationClass) {
                case 'flashBorder':
                    this._flashBorderInIE9($element, callBack);
                    break;
                case 'flashShadow':
                    this._flashShadowInIE9($element, callBack);
                    break;
                case 'flashShadowReverse':
                    this._flashShadowInIE9Reverse($element, callBack);
                    break;
                default:
                    console.log('Non standard CSS animation must be handled by the interactive.')
                    break;
            }
        },

        /**
        * Simulates flash border css animation using jquery for IE 9.
        *
        * @method _flashBorderInIE9
        * @param $element {Object} The jquery reference of the element to be animated.
        * @param callBack {Object} The call back function to be called at the end of the animation.
        */
        _flashBorderInIE9: function _flashBorderInIE9($element, callBack) {
            $element = $element instanceof $ ? $element : $($element);
            var totalDuration = namespace.TutorialFormExpression.ANIMATION_DURATIONS.FLASH_BORDER,
                stepsCount = 6,
                stepDuration = totalDuration / stepsCount,
                _flashBorder;
            _flashBorder = function _flashBorder() {
                if (stepsCount === 0) {
                    if (callBack) {
                        callBack.apply(arguments);
                    }
                    return;
                }
                window.setTimeout(function () {
                    $element.css({ 'border-color': '#ffc000' });
                    stepsCount--;
                    window.setTimeout(function () {
                        $element.css({ 'border-color': 'rgba(0,0,0,0)' });
                        stepsCount--;
                        _flashBorder();
                    }, stepDuration);
                }, stepDuration);
            };
            _flashBorder();
        },

        /**
        * Simulates flash shadow css animation using jquery for IE 9.
        *
        * @method _flashShadowInIE9
        * @param $element {Object} The jquery reference of the element to be animated.
        * @param callBack {Object} The call back function to be called at the end of the animation.
        */
        _flashShadowInIE9: function _flashShadowInIE9($element, callBack) {
            $element = $element instanceof $ ? $element : $($element);
            var totalDuration = namespace.TutorialFormExpression.ANIMATION_DURATIONS.FLASH_BORDER,
                stepsCount = 6,
                stepDuration = totalDuration / stepsCount,
                _flashShadow;
            _flashShadow = function _flashShadow() {
                if (stepsCount === 0) {
                    if (callBack) {
                        callBack.apply(arguments);
                    }
                    return;
                }
                window.setTimeout(function () {
                    $element.css({ 'box-shadow': 'inset 0px -5px 0px 0px rgba(0,0,0,0.42)' });
                    stepsCount--;
                    window.setTimeout(function () {
                        $element.css({ 'box-shadow': '0px 0px 15px 0px rgba(255,255,255,1), inset 0px -5px 0px 0px rgba(0,0,0,0.42)' });
                        stepsCount--;
                        _flashShadow();
                    }, stepDuration);
                }, stepDuration);
            };
            _flashShadow();
        },

        /**
        * Simulates flash shadow css animation using jquery for IE 9 with the shadow disappearing after animation.
        *
        * @method _flashShadowInIE9Reverse
        * @param $element {Object} The jquery reference of the element to be animated.
        * @param callBack {Object} The call back function to be called at the end of the animation.
        */
        _flashShadowInIE9Reverse: function _flashShadowInIE9Reverse($element, callBack) {
            $element = $element instanceof $ ? $element : $($element);
            var totalDuration = namespace.TutorialFormExpression.ANIMATION_DURATIONS.FLASH_BORDER,
                stepsCount = 6,
                stepDuration = totalDuration / stepsCount,
                _flashShadow;
            _flashShadow = function _flashShadow() {
                if (stepsCount === 0) {
                    if (callBack) {
                        callBack.apply(arguments);
                    }
                    return;
                }
                window.setTimeout(function () {
                    $element.css({ 'box-shadow': '0px 0px 0px 4px #ffc000' });
                    stepsCount--;
                    window.setTimeout(function () {
                        $element.css({ 'box-shadow': 'none' });
                        stepsCount--;
                        _flashShadow();
                    }, stepDuration);
                }, stepDuration);
            };
            _flashShadow();
        },

        /**
        * Called on tutorial player animation end, enables the replay button.
        * @method _onTutorialStepAnimationComplete
        */
        _onTutorialStepAnimationComplete: function _onTutorialStepAnimationComplete(animatedStep) {
            var self = this,
                currentEquationManager, text;
            if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                currentEquationManager = this._formEquationManager;
            }
            else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                currentEquationManager = this._equationManager;
            }
            window.setTimeout (function () {currentEquationManager.animationOn = false;}, 200);
            // if required undo the step performed - mostly in simulated action cases.
            if (self._resetSimulatedStep) {
                self.tutorialView.$el.show();
                window.setTimeout(function () {
                    if (self._parseStep[0].simulateActionEnum === MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE._simulateToggleButtonToggle) {

                        self.toggleButtonView.changeStateOfToggleButton(MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_OFF);
                    }
                    else if (self._parseStep[0].simulateActionEnum === MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE._simulateTileClick) {
                        self._setNegateTile = false;
                        $(self._parseStep[0].nextTarget.element).trigger('click', [{ isTutorialUndoTrigger: true }]);
                    }
                    self.player.enableAllHeaderButtons(true);
                    self.player.enableHelp(false);
                    self.tutorialView.$el.hide();
                    self._isTutorialPlaying = false;
                    self.enableDisableReplayBtn(true);
                    currentEquationManager.deActivateEventOnAllTiles(true);
                    self._updateEventOnEquationManager();
                }, namespace.TutorialFormExpression.ANIMATION_DURATIONS.PAUSE_BETWEEN_ANIMATIONS_FOR_TOGGLE_BUTTON);
            }
            else {
                if (animatedStep[0].simulateActionEnum === MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE._promptUserToMarquee) {
                    text = this.getMessage('prompt-user-to-marquee-tooltip-text', 0);
                    if (self._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                        self._changeMaxBasesAllowedTooltipText(text);
                        // Don't set any tooltip width
                        //self._changeMaxBasesAllowedTooltipWidth(text);
                        self.maxBasesAllowedTooltip.showTooltip();
                        this.updateFocusRect('build-text-in-tooltip');
                    }
                    else if (self._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                        self.$('.marquee-inline-feedback-container').removeClass('show-at-top');
                        if (self.model.get('currentTutorialLessonNumber') === 2) {
                            self.$('.marquee-inline-feedback-container').addClass('show-at-top');
                        }
                        self.solveModeMarqueeTooltip.showTooltip();
                    }
                }
                self.player.enableAllHeaderButtons(true);
                self.player.enableHelp(false);
                self._isTutorialPlaying = false;
                self.enableDisableReplayBtn(true);
            }

            /*if (!currentEquationManager.getCurrentAccView()) {
                if(this.activeElem) {
                    this.activeElem.focus();
                }
            }*/
        },

        /**
        * Generates the raise-to-power toggle button for tutorial screen and binds a handler for the toggle button's
        * ACTION_COMPLETE_EVENT event.
        *
        * @method _generateRaisedToPowerToggle
        * @private
        */
        _generateRaisedToPowerToggle: function _generateRaisedToPowerToggle() {
            namespace.TutorialFormExpression.__super__._generateRaisedToPowerToggle.apply(this, arguments);
            var ToggleButtonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton;
            this.listenTo(this.toggleButtonView, ToggleButtonClass.ACTION_COMPLETE_EVENT, this._onToggleStateChangeComplete);
        },

        /**
        * Event handler for the toggle button's event ACTION_COMPLETE_EVENT.
        *
        * @method _onToggleStateChangeComplete
        * @param state {String} The state of the toggle button after the switch action.
        * @private
        */
        _onToggleStateChangeComplete: function _onToggleStateChangeComplete(state) {
            this.stopReading();
            var TogglebuttonClass = MathInteractives.Common.Components.Theme2.Views.ToggleButton;
            if (this.resetClicked === true) {
                return;
            }
            if (state === TogglebuttonClass.TOGGLEBUTTON_STATE_ON) { //if state is on after click
                if (this.internalToggle === true && this.tileDropped === true) {
                    if (!this._isTutorialPlaying) {
                        this._proceedToNextStep();
                    }
                }
            }
            else {
                if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                    this._formEquationManager.deActivateEventOnAllTiles(true);
                }
                else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                    this._equationManager.deActivateEventOnAllTiles(true);
                }
                this._updateEventOnEquationManager();
            }
        },

        /**
        * Calls form-equation manager's toggleBigParenthesis method if it's an internal toggle but doesn't sets
        * raisedToPower boolean in model
        *
        * @method _changeToggleStateOnOrOff
        * @param on {Boolean} If toggle button is switched to on, then true. If off then, false.
        * @private
        */
        _changeToggleStateOnOrOff: function (on) {
            if (this.internalToggle === true) {
                this._formEquationManager.toggleBigParenthesis(on);
            }
            //this.buildModeUndoButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
        },

        _createFormExpressionDroppable: function _createFormExpressionDroppable() {
            // Make it empty
            // As no first droppable needed
        },

        _tileClickEvent: function (scope, tile) {
            // As we allow only events to do, no need to check for validation on click
            // Set true to click to negate tile
            if (this._parseStep[0].simulateActionEnum === MathInteractives.Common.Components.Theme2.Models.TutorialPlayer.METHOD_ENUM_INVERSE._simulateTileClick) {
                if (this._setNegateTile) {
                    this._isClickToNegate = true;
                    // DeActivate all the click events on tiles in BIN
                    this.deActivateClickEventsOnTiles();
                }
                this._setNegateTile = true;
            }
            var tryAnotherStatus = this.model.get('tryAnotherBtnStatus');
            namespace.TutorialFormExpression.__super__._tileClickEvent.apply(this, arguments);
            this.model.set('tryAnotherBtnStatus', tryAnotherStatus);
        },

        animationEnd: function () {
            namespace.TutorialFormExpression.__super__.animationEnd.apply(this, arguments);
            if (this._isClickToNegate) {
                if (this._parseStep[0].target
                    && this._isIE) {
                    this.forceRefreshElementInDOM(this._parseStep[0].target.element);
                }
                this._proceedToNextStep();
                this._isClickToNegate = false;
                this._setNegateTile = false;
            }
        },

        /**
        * Changes the passed elemens visibility to hidden, trick it and after reverts all changes.
        *
        * @method forceRefreshElementInDOM
        * @param element {Object} Javascript HTML object of the element to be repainted.
        * @public
        */
        forceRefreshElementInDOM: function forceRefreshElementInDOM(element) {
            if (!element) {
                return;
            }
            var disp = element.style.visibility, trick;
            element.style.visibility = 'hidden';
            trick = element.style.clientWidth;
            element.style.visibility = disp;
        },

        _onBinTileDragStart: function (eventData) {
            namespace.TutorialFormExpression.__super__._onBinTileDragStart.apply(this, arguments);
        },

        _addMarqueeScope: function _addMarqueeScope() {
            namespace.TutorialFormExpression.__super__._addMarqueeScope.apply(this, arguments);
            this.$('.fake-marquee').remove();
            if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                this._formEquationManager.detachListenersOnMarqueeContainment();
            }
            else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                this._equationManager.detachListenersOnMarqueeContainment();
            }
            this._proceedToNextStep();
        },

        _createTooltips: function _createTooltips() {
            namespace.TutorialFormExpression.__super__._createTooltips.apply(this, arguments);
            this._createSolveModeMarqueeTooltip();
        },

        /**
        * Stores the refernce of tooltip view created in _createSolveModeMarqueeTooltip method
        *
        * @property solveModeMarqueeTooltip
        * @type Object
        * @default null
        */
        solveModeMarqueeTooltip: null,

        /**
        * Creates an inline feedback tooltip for tutorial to prompt user to draw a marquee in solve mode.
        *
        * @method _createSolveModeMarqueeTooltip
        * @private
        */
        _createSolveModeMarqueeTooltip: function _createSolveModeMarqueeTooltip() {
            if (this.solveModeMarqueeTooltip === null) {
                var tooltipOpts = {
                    elementEl: this.idPrefix + 'marquee-inline-feedback-container',
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
                tooltipOpts.text = '<div class="text-in-tooltip">' + this.getMessage('prompt-user-to-marquee-tooltip-text', 0) + '</div><div id="' + this.idPrefix + 'close-btn-in-marquee-tooltip" class="close-btn-in-tooltip"></div>';
                this.solveModeMarqueeTooltip = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipOpts);

                this.solveModeMarqueeTooltipCloseBtn = new MathInteractives.global.Theme2.Button.generateButton({
                    'player': this.player,
                    'manager': this.manager,
                    'path': this.filePath,
                    'idPrefix': this.idPrefix,
                    'data': {
                        'id': this.idPrefix + 'close-btn-in-marquee-tooltip',
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
                this.solveModeMarqueeTooltipCloseBtn.$el.on('click', function () {
                    self.solveModeMarqueeTooltip.hideTooltip();
                });

                this._attachCloseButtonEvents(this.solveModeMarqueeTooltipCloseBtn.$el);
            }
        },

        /**
        * Call when Bin tile dropped
        * Check for valid drop and if found, go for next step otherwise snap back
        *
        * @method _onBinTileDragStop
        * @param {Object} eventData Event data
        * @private
        */
        _onBinTileDragStop: function (eventData) {
            // As no drop event occur for Drop on BIN, don't check for it
            // Just check for Equation Manager Drop events
            if (this._formEquationManager) {
                this._formEquationManager.setIsDropped(false);
            }
            if (eventData.ui) {
                if (eventData.ui.helper.data('isValidDrop')) {
                    // removes animation class from marquee for tutorial 2,
                    // in case user drops the parenthesis tile on the marquee during animation
                    if (this._parseStep[0].nextTarget) {
                        var nextTarget = this._parseStep[0].nextTarget;
                        if (nextTarget.animation && nextTarget.animation.className) {
                            $(nextTarget.element).removeClass(nextTarget.animation.className).removeClass('animated');
                        }
                    }
                    this._proceedToNextStep();
                }
            }
            var ui = eventData.ui,
                $element = eventData.$element;
            ui.helper.removeData('cur-droppable');
            $element.removeData('isDropped');
            this.animationEnd();
            //$element.removeClass('bin-tiles-dragging-ui');
        },

        /**
         * The handler to be called when a a command is performed on the existing equation
         * @param {String} htmlString The html string that needs to be stored in order to be displayed
         *
         * @method _tutorialAddDataForNewStep
         * @private
         */
        _tutorialAddDataForNewStep: function _tutorialAddDataForNewStep(data) {
            this._proceedToNextStep(data);
        },

        _tutorialBreakCommand: function (data) {
            var self = this,
                // create a temp animation div because during this animation user shouldn't
                // be allowed to do anything.
                // Fix for Bug #8993
                $tempAnimDiv = this._$animationDiv.clone().appendTo(this.$el).show();
            window.setTimeout(function ()
                              {
                self._proceedToNextStep(data);
                $tempAnimDiv.remove();
            }, 2000);
        },

        /**
        * Proceed to next step as per action frame jump
        *
        * @method _proceedToNextStep
        * @param {Object} data Data from command factory
        * @private
        */
        _proceedToNextStep: function (data) {
            // Every valid action come here, proceed to next step
            var counter = this._parseStep[0].nextStepToJump;
            if (this._parseStep.length > 1) {
                // Set framejump for which action is done
                var index = this._getActionCount(data);
                if (index !== -1) {
                    counter = this._parseStep[index].nextStepToJump;
                }
            }
            this.animationStart();
            this.enableDisableReplayBtn(false);
            this.stopEvent = false;
            this.tutorialView.proceedToNextStep(counter);
            this.removeHighlightDisabledTiles();
        },

        /**
        * Return action count from list of stored data
        * It is used only for Solve mode (No need to check for Build mode)
        *
        * @method _getActionCount
        * @param {Object} data Data which is came from command factory
        * @private
        */
        _getActionCount: function (data) {
            var index = '',
                curTarget = null;
            if (data) {
                if (data.source) {
                    index = data.source.index;
                    var len = this._EMOptions.lstAllowTargetIndexEM.length;
                    for (var counter = 0; counter < len; counter++) {
                        curTarget = this._EMOptions.lstAllowTargetIndexEM[counter];
                        if (curTarget) {
                            if (curTarget.index === index) {
                                return counter;
                            }
                        }
                    }
                }
            }
            return -1;
        },

        /**
        * Renders direction text
        *
        * @method _renderDirectionText
        * @private
        **/
        _renderDirectionText: function _renderDirectionText() {
            var model = this.model,
                tutorialLessonNummber = model.get('currentTutorialLessonNumber') === -1 ? 0 : model.get('currentTutorialLessonNumber'),
                textMessageId = 'tutorial-' + tutorialLessonNummber,
                locText = this.getMessage('direction-text', textMessageId),
                accText = this.getAccMessage('direction-text', textMessageId),
                tutorialLessons = model.get('tutorialLessons'),
                tutLength = tutorialLessons.length,
                showButton = false;
            if (this.directionBoxView === null) {
                if (tutLength > 1) {
                    // For more than 1 tutorial, show button
                    showButton = true;
                }
                this.directionBoxView = new MathInteractives.global.Theme2.DirectionText.generateDirectionText({
                    idPrefix: this.idPrefix,
                    containerId: this.idPrefix + 'direction-text-container',
                    manager: this.manager,
                    player: this.player,
                    path: this.filePath,
                    text: locText,
                    accText: accText,
                    btnBaseClass: 'btn-yellow',
                    ttsBaseClass: 'tts-yellow',
                    showButton: showButton,
                    btnColorType: MathInteractives.global.Theme2.Button.COLORTYPE.HEADER_BLUE,
                    btnTextColor: '#222222',
                    buttonText: this.getMessage('try-another-text', 'tutorial'),
                    clickCallback: {
                        fnc: this._onClickPickTutorial,
                        scope: this
                    },
                    textColor: '#FFFFFF',
                    containmentBGcolor: '#282828',
                    buttonTabIndex: 3000,
                    tabIndex: 501
                });
            }
            else {
                this.directionBoxView.changeDirectionText(locText, false, accText);
            }
        },

        _attchBinEvents: function _attchBinEvents() {
            var _formEquationManager = this._formEquationManager;
            this.listenTo(_formEquationManager, equationManagerNamespace.FormExpressionEquationManager.EVENTS.DONE_BUTTON_STATUS,
                          this._checkDoneButtonStaus);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.MARQUEE_DRAWN,
                          this._addMarqueeScope);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.MARQUEE_REMOVED,
                          this._removeMarqueeScope);
            this.listenTo(_formEquationManager, namespace.FormExpressionEquationManager.EVENTS.BIG_PARENTHESIS_ADDED,
                          this._onAddBigParenthesis);
            this.listenTo(_formEquationManager, namespace.FormExpressionEquationManager.EVENTS.BIG_PARENTHESIS_REMOVED,
                          this._onRemoveBigParenthesis);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.BUILD_SET_FOCUS_ON_TOOLTIP, this._setFocusToMaxBasesAllowedTooltip);
            this.listenTo(_formEquationManager, equationManagerNamespace.EquationManager.EVENTS.TILE_DRAGGING_START, this._tileDraggingStart);
        },

        _tileDraggingStart: function _tileDraggingStart () {
            this.maxBasesAllowedTooltip.hideTooltip();
            this.stopReading();
        },

        /**
         * It attaches the events related to the data in the accordion
         *
         * @method _attachDataEvents
         * @private
         */
        _attachDataEvents: function _attachDataEvents() {
            var eventClass = equationManagerNamespace.EquationManager.EVENTS;
            namespace.TutorialFormExpression.__super__._attachDataEvents.apply(this, arguments);
            this.listenTo(this._equationManager, eventClass.MARQUEE_DRAWN, this._onMarqueeDrawn);
            this.listenTo(this._equationManager, eventClass.TUTORIAL_ADD_STEP, this._tutorialAddDataForNewStep);
            this.listenTo(this._equationManager, eventClass.TUTORIAL_BREAK_COMMAND, this._tutorialBreakCommand);
            this.listenTo(this._equationManager, eventClass.TOOLTIP_VISIBLE, this._tooltipVisible);
            this.listenTo(this._equationManager, eventClass.TOOLTIP_HIDE, this._tooltipHide);
            this.listenTo(this._equationManager, eventClass.SOLVE_SET_FOCUS_ON_TOOLTIP, this._setFocusToCombineLikeBasesTooltip);
            this.listenTo(this._equationManager, eventClass.TILE_DRAGGING_START, this._tileDragStart);
        },

        _tileDragStart: function _tileDragStart () {
            this.solveModeMarqueeTooltip.hideTooltip();
            this._equationManager.hideAllTooltips();
            this.stopReading();
        },

        _setFocusToCombineLikeBasesTooltip: function () {
            if (this._equationManager.getCurrentAccView()) {
                this.setFocus('workspace-scrollable');
            }
        },

        /**
        * Handler when Tooltip is visible
        *
        * @method _tooltipVisible
        * @param {Object} data Data in the form of tooltip- Whole tooltip view, applyExponent- Apply exponent button, changeSign- Change sign button
        * @private
        */
        _tooltipVisible: function (data) {
            var lstAllowTarget = this._EMOptions.lstAllowTargetIndexEM,
                target = null,
                menuItem = null;
            if (lstAllowTarget
                && lstAllowTarget.length > 0) {
                target = lstAllowTarget[0];
                if (target) {
                    if (target.menuIndex === '0') {
                        menuItem = data.applyExponent;
                    }
                    else if (target.menuIndex === '1') {
                        menuItem = data.changeSign;
                    }
                }
            }

            if (menuItem) {
                // Send it to tutorial to highlight
                this.tutorialView.animateDynamicGeneratedElements([{
                    element: menuItem.el,
                    animation: this._dynamicGenElemAnimationData[0]
                }]);
                this._menuItem = menuItem;
            }
        },

        _dynamicGenElemAnimationData: null,

        /**
        * Handler when Tooltip is hide
        * Remove flash box shadow aroud the menu item
        *
        * @method _tooltipHide
        * @private
        */
        _tooltipHide: function () {
            if (this._menuItem) {
                this._menuItem = null;
            }
        },

        /**
        * Assuming correct marquee drawn, proceed tutorial to next step.
        *
        * @method _onMarqueeDrawn
        * @private
        */
        _onMarqueeDrawn: function _onMarqueeDrawn() {
            this.$('.fake-marquee').remove();
            if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                this._formEquationManager.detachListenersOnMarqueeContainment();
            }
            else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                this._equationManager.detachListenersOnMarqueeContainment();
            }
            this._proceedToNextStep();
        },

        /**
        * Parse through list of given tile index (in string form with $ seperator)
        *
        * @method enableDisableTiles
        * @param {Array} tilesIndex List of element index
        * @param {Boolean} enable True if enable draggables
        * @param {Boolean} isEnableEvent True if enable drag-drop event
        * @private
        */
        _enableDisableTiles: function (tilesIndex, enable, isEnableEvent) {
            var listTiles = null;
            if (tilesIndex) {
                listTiles = this._getListOfElements(tilesIndex);
                if (this._validTargetElement(listTiles)) {
                    // Enabled all tiles which is required for next step
                    if (enable) {
                        this._enableDisableSpecificBinElements(listTiles.bin, true, isEnableEvent);
                    }
                    else {
                        this._inactivateSpecificBinElement(listTiles.bin);
                    }

                    if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.BuildMode) {
                        this._formEquationManager.enableDisableTilesItems(listTiles.equationManager, enable);
                    }
                    else if (this._currentMode === equationManagerModelNameSpace.EquationManager.MODES.SolveMode) {
                        this._equationManager.enableDisableTilesItems(listTiles.equationManager, enable);
                    }
                }
                else {
                    console.log('Error: Please give valid element index');
                }
            }
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
                if (this._tutorialBuildModeDivisionMode) {
                    equationManager.enableDroppableEquationView(false);
                }
                else {
                    equationManager.enableDroppableEquationView(true);
                }
            }
            else {
                if (this._tutorialSolveModeDivisionMode) {
                    equationManager.enableDroppableEquationView(false);
                }
                else {
                    equationManager.enableDroppableEquationView(true);
                }
            }
        },

        /**
        * Call when Click on Done button
        * Proceed to next step
        *
        * @method _doneButtonClick
        * @private
        */
        _doneButtonClick: function () {
            this._currentMode = equationManagerModelNameSpace.EquationManager.MODES.SolveMode;
            this.setAccessibilityTextForMainActivityArea(this.model, this.model.get('tutorialDataSelectorView'));
            var modelToObj,
                disableState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this.stopReading();
            if (this._equationManager) {
                this._equationManager.resetData();
            }

            this._formEquationManager.addTileForNegativeParCoeff();
            modelToObj = JSON.parse(JSON.stringify(this._formEquationManager.equationView.model.toJSON()));
            ////this.model.set('equationData', modelToObj);
            ////this.model.set('equationDataSolveMode', $.extend(true, {}, modelToObj));
            ////this.model.set('solveModeDivisionMode', this.model.get('buildModeDivisionMode'));
            this._tutorialSolveModeDivisionMode = this._tutorialBuildModeDivisionMode;

            if (this._tutorialBuildModeDivisionMode === false && this.model.get('accordionLevel') > 2) {
                modelToObj = this._formEquationManager.wrapFractionTileItem(modelToObj);
                ////this.model.set('solveModeDivisionMode', true);
                this._tutorialSolveModeDivisionMode = true;
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
            ////this.model.set('exploreView', modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE);
            this._equationManager.showMarquee();
            this._equationManager.removeMarquee();      // Remove marquee explicitly #2879
            //this.solveModeUndoButtonView.setButtonState(disableState);
            /*this._disableEnableButtons(this.solveModeUndoButtonView, false);
            //this.solveModeResetButtonView.setButtonState(disableState);
            this._disableEnableButtons(this.solveModeResetButtonView, false);*/
            ////this._setDirectionTextOfExplore(modelNameSpace.ExponentAccordion.EXPLORE_VIEW.WORKSPACE);
            // Proceed to next step when click on Done button
            this._proceedToNextStep();
            this.setFocus('direction-text-container-direction-text-text');
        },

        /**
        * Show Got it popup after all action complete
        *
        * @method _showGotItPopup
        * @private
        */
        _showGotItPopup: function () {
            var buttons = [];
            var currentTutorialIndex = this.model.get('currentTutorialLessonNumber'),
                tutorialLessons = this.model.get('tutorialLessons'),
                tutLength = tutorialLessons.length,
                titleText = this.getMessage('got-it-popup', 'title'),
                bodyText = this.getMessage('got-it-popup', 'msg'),
                width = null;
            if(this._equationManager) {
                this._equationManager.removeCurrentAccDiv();
            }

            if (tutLength > 0) {
                if (currentTutorialIndex < (tutLength - 1)) {
                    buttons.push({
                        id: this.idPrefix + 'next-btn',
                        width: 169,
                        text: this.getMessage('got-it-popup', 'next'),
                        type: MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                        icon: {
                            faClass: this.getFontAwesomeClass('fixed-next'),
                            fontColor: '#222222',
                            fontWeight: 'bold',
                            height: 15,
                            width: 9
                        },
                        response: { isPositive: true, buttonClicked: this.idPrefix + 'next-btn' },
                        clickCallBack: {
                            fnc: this._onClickNext,
                            scope: this
                        },
                        textPosition: 'left',
                        baseClass: 'btn-yellow',
                        //width: 115
                    });
                }

                buttons.push({
                    id: 'try-btn',
                    width: 169,
                    text: this.getMessage('got-it-popup', 'try'),
                    response: { isPositive: true, buttonClicked: this.idPrefix + 'try-btn' },
                    clickCallBack: {
                        fnc: this._onClickTryAgain,
                        scope: this
                    },
                    baseClass: 'btn-yellow'
                });

                // More than 1 tutorial found
                if (tutLength > 1) {
                    buttons.push({
                        id: 'pick-btn',
                        width: 169,
                        text: this.getMessage('got-it-popup', 'pick'),
                        response: { isPositive: true, buttonClicked: this.idPrefix + 'pick-btn' },
                        clickCallBack: {
                            fnc: this._onClickPickTutorial,
                            scope: this
                        },
                        baseClass: 'btn-yellow'
                    });
                }
                else {
                    width = 465;
                }

                if (currentTutorialIndex < (tutLength - 1)) {
                    buttons.push({
                        id: 'skip-btn',
                        width: 169,
                        text: this.getMessage('got-it-popup', 'skip'),
                        response: { isPositive: true, buttonClicked: this.idPrefix + 'skip-btn' },
                        clickCallBack: {
                            fnc: this._onClickSkipTutorials,
                            scope: this
                        },
                        baseClass: 'btn-yellow'
                    });
                }
            }

            if (currentTutorialIndex === (tutLength - 1)) {
                bodyText = this.getMessage('got-it-popup', 'msg-of-last-pop-up');
                titleText = this.getMessage('got-it-popup', 'title-of-last-pop-up');
                buttons.push({
                    id: 'go-explore-btn',
                    width: 169,
                    text: this.getMessage('got-it-popup', 'explore'),
                    response: { isPositive: true, buttonClicked: this.idPrefix + 'go-explore-btn' },
                    clickCallBack: {
                        fnc: this._onClickSkipTutorials,
                        scope: this
                    },
                    baseClass: 'btn-yellow'
                });
            }

            this._gotItPopupView = MathInteractives.global.Theme2.PopUpBox.createPopup({
                text: bodyText,
                title: titleText,
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                titleTextColorClass: 'popup-title-text',
                bodyTextColorClass: 'popup-body-text',
                buttons: buttons,
                width: width
            });

            this._changeDimensionsOfGotItPopup(this._gotItPopupView.$el);
        },

        _changeDimensionsOfGotItPopup: function _changeDimensionsOfGotItPopup($popupEl) {
            var accordionLevel = this.model.get('accordionLevel');
            $popupEl.find('.theme2-pop-up-dialogue').css({ 'width': '502px', 'top': '', 'left': '', 'bottom': '25px', 'right': '25px' });
            $popupEl.find('.theme2-pop-up-btns-container').addClass('buttons-container-adjust-margin');
            $popupEl.find('.theme2-pop-up-btns-aligner').css('width', '377px');
            $popupEl.find('.theme2-pop-up-title').addClass('adjust-margin-got-it-title');
            $popupEl.find('.theme2-pop-up-body').addClass('got-it-popup-body');
            $popupEl.find('.theme2-pop-up-tts-container').css('left', '').addClass('got-it-popup-tts');
            $popupEl.find('.theme2-pop-up-bottom-btn').addClass('adjust-margin-got-it-buttons');
            if (accordionLevel > 1) {
                $popupEl.find('.theme2-pop-up-title-text-combined-acc-defaultType').css({ 'top': '35px'});
                $popupEl.find('#' + this.idPrefix + 'go-explore-btn').addClass('go-explore-tutorial-complete');
            }
            else {
                $popupEl.find('.theme2-pop-up-title-text-combined-acc-defaultType').css({ 'top': '35px', height: '66px'});
            }
            this.updateFocusRect('theme2-pop-up-title-text-combined-acc');
        },


        /**
        * Handler of Skip tutorial button
        * Show Explore tab
        *
        * @method _onClickSkipTutorials
        * @private
        */
        _onClickSkipTutorials: function () {
            this.stopReading();
            // Trigger event to show explore mode
            this.trigger(namespace.TutorialFormExpression.SHOW_EXPLORE_TAB);
        },

        /**
        * Handler of Pick tutorial button
        * Show Choosen tutorial screen
        *
        * @method _onClickPickTutorial
        * @private
        */
        _onClickPickTutorial: function () {
            this.stopReading();
            this._setNegateTile = false;
            this.trigger(namespace.TutorialFormExpression.PICK_TUTORIAL);
        },

        /**
        * Handler of Try again button
        * Again start the same tutorial
        *
        * @method _onClickTryAgain
        * @private
        */
        _onClickTryAgain: function () {
            this.stopReading();
            // Again update view for current tutorial mode
            this.updateViewForTutorialMode();
            this.setAccessibilityTextForMainActivityArea(this.model, this.model.get('tutorialDataSelectorView'));
            // Play tutorial mode
            this.playTutorialMode();
            this.setFocus('direction-text-container-direction-text-text');
        },

        /**
        * Handler of Next button
        * Show the next tutorial if found
        *
        * @method _onClickNext
        * @private
        */
        _onClickNext: function () {
            this.stopReading();
            var currentTutorialIndex = this.model.get('currentTutorialLessonNumber'),
                tutorialLessons = this.model.get('tutorialLessons');
            if (currentTutorialIndex !== -1) {
                currentTutorialIndex += 1;
                if (tutorialLessons[currentTutorialIndex]) {
                    this.model.set('currentTutorialLessonNumber', currentTutorialIndex);
                    // Update the screen as per current index
                    this.trigger(namespace.TutorialFormExpression.UPDATE_TUTORIAL_SCREEN, currentTutorialIndex);
                    // Update the view for tutorial mode
                    this.updateViewForTutorialMode();
                    this.setAccessibilityTextForMainActivityArea(this.model, this.model.get('tutorialDataSelectorView'));
                    // Play tutorial mode
                    this.playTutorialMode();
                    this.setFocus('direction-text-container-direction-text-text');
                }
                else {
                    // We are at last tutorial
                    // Show something
                    this.trigger(namespace.TutorialFormExpression.PICK_TUTORIAL);
                }
            }
        },

        _checkPureAndSimple: function () {
            // Doesn't check for last step... Tutorial player handle this stuff
        },

        _showPureAndSimple: function _showPureAndSimple() {
            // Doesn't show any popup... Tutorial player handle this stuff
            //this._showPureAndSimplePopup();
            //this.model.set('pureAndSimpleShown', true);
        },

        /**
        * Update the tile negated value in model
        * For Tutorial mode, it deoesn't require to store the value in model
        *
        * @method _updateTileValueInModel
        * @param {Object} $tile Tile which value has been changed
        * @private
        */
        _updateTileValueInModel: function ($tile) {
            // Dont add data in model
        },

        /**
        * Retrieve the array with negated value
        * For Tutorial mode- it doesn't require to negate the value initially
        *
        * @method _getNegationsFromModel
        * @param {Array} tileNumberArray Tile number array
        * @param {Array} isNegated Negated array
        * @private
        * @return {Array} Tile number array with negation
        */
        _getNegationsFromModel: function _getNegationsFromModel(tileNumberArray, isNegated) {
            var tileTexts = [], i = 0;
            for (; i < tileNumberArray.length; i++) {
                tileTexts[i] = '<span class="tile-number">' + tileNumberArray[i] + '</span>';
            }

            return { newArray: tileNumberArray, textForTiles: tileTexts };
        },

        removeHighlightDisabledTiles: function () {
            var highlightedDisabledTiles = $('.custom-droppable-disabled .new-created-tile'),
                highlightedInactiveTiles = $('.inactive');

            highlightedDisabledTiles.removeClass('new-created-tile');
            highlightedInactiveTiles.removeClass('new-created-tile');
        },

    }, {
        ANIMATION_DURATIONS: {
            PAUSE_BETWEEN_ANIMATIONS: 200,
            PAUSE_BETWEEN_ANIMATIONS_FOR_TOGGLE_BUTTON: 1000,
            FLASH_BORDER: 2000,
            PULSE_3_TIMES: 2000
        },
        CURSORS: {
            // default cursor
            '1': {
                BASE_64: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyRTVDMTE5ODdCNzgxMUU0QTk5N0ZFQTBERUExODFCMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyRTVDMTE5OTdCNzgxMUU0QTk5N0ZFQTBERUExODFCMyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjJFNUMxMTk2N0I3ODExRTRBOTk3RkVBMERFQTE4MUIzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjJFNUMxMTk3N0I3ODExRTRBOTk3RkVBMERFQTE4MUIzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+WPxSggAAAr5JREFUeNqcVF1IU2EYPn/bBJ0rXWQLNkIZzkYJBuqFCKNw88oushuvEq+yuxEVRJfhpSAxJgy2YBfihTS1RTGJghJkrMU2WGwSFcw/1qxG07Pz9bxjwZQpRz94t33Pvvf53uc9z3tEjuNeIxTEZ+6U6wfiA+LWaQmSPT09bHBwMMXz/E3sxRNlIynl9XrZ2tqabDabdwBdRmjV5guMMU6WZQ5ViOFw2GA0Gl8Bv6OagD7K5XJlY7PZxNnZ2YtOp/MutrfVEEiHgZGREdbc3GwvlUqPVlZWdICeI5hqAmqLw+HgJEm6srm56Ukmk18gMw78z5ES6q3+/n62tLSkaWlpCR33iI8k0Gg0vMVikQKBQOvQ0NB9QONqJRxYw8PDil6vt4mi6F5eXqYLfdR31QRU5cDAAPWkc2tr6xn88g09WYV/8mQBQe3zhk+UhYUF3mq1BkE2RsnH9uDw0mq1gslkEufn58+Ojo4+BPSA8qWTDo7dbmdut/sCzDeOikqqCLLZLMtkMjyqqPgET4jr6+vrWFxcfFqXALOhkEYcJInM5/PJU1NTEgio+2VBELj9/X0Obt2oR8BmZma49fV1YXp6ugIUi0UJpO8R97Ddq04rdXGPZn/S5XIZe3t7K4f9fj+PeBuLxT7ipo7u7m5Rp9MJhUJhG6Q/of1N9SW0gdimnJTH42E4wObm5hjKXgV2HXEDJf/N5XIkh0UiEdbU1ES3dh62skCa4vE4NzExsQNtY8DoFqPBYNijflC50Cs3NDT8rpqPP9DktrY2Bt+/w++rNbgexNdgnO/BYJAIlEQiIbe3t3+tnQtie4Iyz+GbRvZTDcEvRVFS6XTakM/nyUh8V1eX2NjYaMZ/lv+HxGoivZWz9QyIOI8Kz6B5rdFolIVCoZe7u7svgKfVmk+E9x9DfxFVZDBEl2p78E+AAQBZ+Boe1D0ffQAAAABJRU5ErkJggg==',
                WIDTH: 16,
                HEIGHT: 25
            },
            // grab cursor
            '2': {
                //BASE_64: 'iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmNWJlYjU3Yi0yYjhlLTNkNGEtOGFmOS1kYTllYzg3NjAzZTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTRFQUI1RTQ3Qjc5MTFFNEFDRjVBNUQzRjZBNDcxQTYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTRFQUI1RTM3Qjc5MTFFNEFDRjVBNUQzRjZBNDcxQTYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmY1YmViNTdiLTJiOGUtM2Q0YS04YWY5LWRhOWVjODc2MDNlOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpmNWJlYjU3Yi0yYjhlLTNkNGEtOGFmOS1kYTllYzg3NjAzZTgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4huW7kAAAJ20lEQVR42oRYXXAT1xU++yPJlixbsrAt+aeusPlpAlMosWFoMiGTzjgPSScPfekk5QEeeWxeOqEtDzzSASYdyjRlkrbTB0gNniR4JnWg0wy/Q4PBxkATLGpkW5aNJet/V9Lu9jtXWo3sYLrMHWt3797z3e+c851zkT788E+09jJNk5qammjnzh1kGEbt+czMDDU0NJBlWb5yufy3VCq16/Tp06TrOimKQo2NjdbRo0eL4XD48ezs7Btnz57VSqUSqapK+/btow0bNhDf11/83dWrV0mldS5JkniSAoPduJUdDseTiYl7xpYtm3hhV6FQ2JRMJjuKxSJpmsbghJFsNsvDOzIyshfvFvG9zO8wGEEeI8p7ZRv8nEGyLXU9ELzL5eVlTyAQ+CMe+R8/fvyWrhfj4+N38d5yjo+PS2z41KlTgr3R0VFaWFigS5cuMYtevP8rQJj4LcmyTHv37mVq58DoEP5m2A42R2BO2FoXCHbsmZ6O9GHydlmWmsfH7/TBcElVlUQ6nZQ1rSAlEkkKhULU0tJCnZ3dwo23bn1Nc3PzqmmWOvk+n88TA8nlcrSysuKNRqMOZsLe7NOnT4VNlR8843JjgZFYbGHHhQvnfVhAcjo9n7pcruS2bT/YrarOoqKo5PF4BbVsiF3W1OSmjz/+szBw4sRxam9vZ1aFuy5evMhAjP7+ftvtfE/Nzc2CUZkDc+1gOnO5fDiVymzAZDWdTimFQi5QKGjdXV2dvq1btzZjGhWLJbEgj4YGF6h2CVYMo0x+v5/a2trE4N/pdJpBSWBYQlCLuGKW2D2Ckbm5ue/QwdTdvv11OZ8v0bFjxxDtrXTlyjV2l8Pt9lxJp7PSykoigBgQc/kyDN5EGeB0GNHJ6XSCMY/YNTOGeBdLg8mCLKvE3/Km7Us1TIMk/CNeT6qlr1yZVCKfrxmjFTtrZyAK3BWKx+PE2VIxsDrtKxliinc82A08SqUysyUHg8HNqupIzs/POgzTlADIgnt11e12k9PhFL5mlAITVgqFuixTsmhpOQnqndTf3yfS84MPfk+x2JwwyLuuZ9GqAjEr6SqAlcsGQBuIG40DtzkeXxwGK8bU1JSCexlaZAY7OlIia3L5nAiY9o52EWhYhnp6eywGxoGWaXRTMNiBhQ1KJJapjN0hJ2vG7FS0/W1nns0Yf5fJZUjTdRVxshHBTgAgNj6H9F1JJjXV3s3DBw+pp6eHBgcGRCCxz0ulIt2fuk8L8/MUDr8tFn7ttX10+fJlKvAcgChVlReU1wSK5zHTDS6XYJiDN4VY0fFNNDoDN3cgq06QB5s/cOAAB3IFiPCnJNPYPy5RoDVAfX1hC0DmEBNdBa3g1ou6ynPYCDPHMs9gqz6pSbVgpBoTfG9LAzNcc5vJ8UPkQyb5fD7xvGyHsg2Gr3999RVQz+aRWkPLy4lXzw9fiJ4/P1JRPwB5Y2iIDh06JMA4cM9xwm7itGWqZXYJBj+XGQyRCGyossgmZn3Tpk3UjrT2NnkFMF3TJRULbEQQutnvhmXJoNu4ODpahlp+62vxpxA/JuuFnW4dcAHveu+ePcKAwplR3Qgb510yExC/WpxwVlZ+S1DgTlH8ZBFjpkhVUWsguWfji4vBeGwBhiwpHl+wWtsCGnY/8ORJVGdXZPLFmvhwLLBi/ubIEcEgv+eLDbPcDw8PC4AsYiKQGaCLNcUtGB3cvZtaW1uxZoHymZx4hmGpsYWFvuVEwm/7vFDUKJlKmJ3B4BbskCErTociXMMGhBxXg7H+snWDgdbrilyNF5b2SGSGUETJC1lnoXu69BQswsVYX82k0joh8M+dO0der4eOHz+BGIlK169f/8JE5gBAU2/v90UasyGv1yt2//8uW9z44ngaQmwxq6FQELHloNHPPydUaNq//x1WYEnFZBHa7F+n0yV8DKGRIpFIi87qCR9WUrkSJ/biz7vs7OC/nI1smJkUvQfM8XNmBG2DCWbTiMdZFSgb2ciNGzeot/d7dPDgQQHq2rVr9PDhQzpz5gw9eDBF6EcErRxsvMP1Ls4eu0niv+3tbfiuFd+FxLtlCCK3Bp988newnMtmMpmfw+6YCgam8VHn5OREAKDU8MYwgDiou7tb+JYZgp7UOqnnsVDvEruS8xp2/DCQxcVFsJEWLPP9o0eR7IsvvmComzdv/lkmk/3hZ599ekrTi0H0VBTq6KQ9ewZEgKHlEy5hKtfWl7WuqNSWSppzYFdbCvGenzNL09OPUSYSYrNtbQELzZV88+YtQidlRQp6XgZCQ2j/TJRQzcVOODN42Avz+/VYqfalq+Jj7WBQHLDZbEZoCjdXzc1etIvzpO7fv59rgYOpjy3E6L1fvsfFCX71g5VBoRnMAscGL1Zf2GxXPIsJ3r393AbBEsCZglaCgp095HC5rGAoZLqgMypXVUzUGhoao8gajyRLXqStEkFwsnGO9lodeQ4TthtsYLbxetfwgEgSehHa+sI26uhot3wtLabDCVETPQiOLBC0Iey863fHjl0H8pb33z9Mp/9wij766C+0Y8d26EcF0LP0op4RGwzf2/XHZkXTivTNN//BfYkGX9pFAwO7XIgHlWuVWu0dTJT8tK4XssiWf+O+F4a7Uql0450746QqEv1o106RtvVd2dq4WKf/rbmKs49BcDwipWN+ny+Sy+cTdecaSfSaoogpyjt44T958uQIBGfL4cOHxYyxsTGhIwyGmVkLoJ4J+95mhUHgMEZLS0uVOUapgFPjr15++cdfpNLpFdlmxO6omBn8jMNAHEWLu+ouDBY8BeIjmmEOXBtIPSvrucwGy7WscsaRuDW1xr78MoYYXHoJLhI6tXYBm3qw8zbG9jfffOssQHSzEno8jUJ57cpaz0A9MzYL9m9m+9y5YZq8f59eeeVVTgC5p6db51S+ceNmpbN7jlRDfbPTgcCGRz6fv/Hu3QmfosjKu+/+YhULz9KLtToCrYKCfkslLWfigJ7EuWaxtdWflat9rzhOPAsET+BqOz8/v9Tfv/Gnt2/fCU9M3PlnqVhsxcFLuNFOZ/4ruix06QY6dr6vaIYmOnhJnApMii8uUB5d1tz83Ks/ef31GJrnzKpzDftdQoVU4BGcmEnFQgyEJ6Hkm7PR2czk5OQsnz+4WZ6aukdls0iWUTkHGdWA1NDHmGUAYpeU2B2acA+DXkmsUBGtIs42FlwRwzEzsXtwcNV/UUi//u2RWstviB1IohXkxTmIkqgL6Uym+7+RyEQ2l/NreMZzBQqJKgcz0R7Xqxytua8IGvSigMzbJstKZGM4vOr/XtR79+7ZaUOrq4hUrQfiP2BKjW73MhhxZNJpE4IHEuXvpMq6tVlid6O7leVMRXANuv/gwaov/ifAAEvWEaXrKM6IAAAAAElFTkSuQmCC',
                BASE_64: 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfeDAQILh5RacheAAAAXUlEQVRIx+2T0Q4AEAhF+/+fvhhDk61i86DjwXroTBdEHOTlojaiQLBremPdW3VBALOCCUznEAT6QaYAB3oBmx+LRimAKNAmgB3GCK8LHE/pRCBco+NDPRcEQfA3CVmCLOLKzprfAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE0LTEyLTA0VDA4OjQ2OjMxKzAxOjAwlLoGZQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNC0xMi0wNFQwODo0NjozMCswMTowMEOQtW0AAAAASUVORK5CYII=',
                WIDTH: 32,//34,
                HEIGHT: 32//34
            },
            // grabbing cursor
            '3': {
                //BASE_64: 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAbCAYAAABr/T8RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxM0JFRjJEMjdCNzgxMUU0OEVDRjg0NUNBNEIyNzNBRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxM0JFRjJEMzdCNzgxMUU0OEVDRjg0NUNBNEIyNzNBRSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjEzQkVGMkQwN0I3ODExRTQ4RUNGODQ1Q0E0QjI3M0FFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjEzQkVGMkQxN0I3ODExRTQ4RUNGODQ1Q0E0QjI3M0FFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+JOgSgQAABJBJREFUeNq0VktIY2cUPolXo3ES39a3jmitiiLSarWMSyuI1YVIuxcRxDCzqy4VCRpkRCm6ctuFglR8QTdFEK0KVrEQahhQxCfGjK8YX+n5/vEPNzGxrdUDl3tv7p/z+s75ztGUl5eTWm5ubig/P5+Kioq+6urq+vXg4ICeIkFBQZSSkvIt6/sdOq6vrykhIYHS0tJof3+fFK1WS263WxzWaDTiNjMzg4fQ4ODgCKkI3+Q5X/H3DYavrq6ch4eHIhhfUc7Pz70U8KHvHA7H+6mpKd3o6ChFR0fT3d0dsRM0NjZGbW1tFB8fTxMTE6TX64VBfBseHqaenh7KycmhkZERUhSFGhoaftzd3d1R2dtnG5bb21tSLi4uZKRCCRs2Op3O1yEhIUJJXFyc518ZGRniDkPFxcUiKimpqaniHhoaSgUFBfL5B3WUnIFNu91u2dnZIYVf6OzsTCiJiIiAE3c4BAjwTS3ASTp4eXlJ4eHhfr8htYhYpr+2tpaqqqpoe3tbZzab33IGXVooAA4A/Pj4GIedgQpGKgc8vphKJ9XQIZuQsrIyam5upvr6+gQ2+p5/+kmRaeaI8/lPeeztm0CGMzMzqa6ujmJiYkS61ZKXlye+AQ5kC1JdXS3gys7O9nKExUGJiYnyxYxMyYuLys2pcT+nzM3NSf12BcUMq7GxsS6j0Sjwfmrv/hfRsiPLfP+rvb29dW1tjQYGBjxF8pKCiL/gS6/T6USVqiv1pSN24QEkob77k+npaSotLaWamhrRThCTySR+6+vrE+82m41Aw/jNarUGjtg3pZLeTk5OHqR7b2+PFhcXKSoqisA+kNXVVfFbSUmJeEeNzM/Pi+fT01MPbLJ71Kn2ErAODwcKCwsjFJvXYeXTcXyTigCRZDNJPCAjOCbbSs2MAQ1nZWURF9qL4Ao6vRe94u+Az7T63wLct7a2gLmTB8sK6z+FYZ1MkXpKPacMDQ1Rb28vptkH5otvUD+whtKzcVFcgTh4JD57iiX+XA8apBt1gSHxJfPs5zz8beDblpaWf1SkLhJ/RBOIfNCqGDQwruUVx8196WYHXh0dHXlawJ/IVnO5XA+mkpxcUC65ADNd3Q0MpwEwAlaloqJCpIJ7s4mHvpGL4A1PlVZsF4ODg+Bwj5HKykoaHx8ng8Eg0oXILBaL6G85gTDBQDTyG0+kczbUyvrPWNeJ3Gg0aB14trS0RCsrK/Dme55KP8NLzOnIyMgnYwtOWF9ft3OUn7HRG4xTkA8MK74Ewdcf/PguKSnpNQ8MEzznAU65ubmPVjvYa3JykpKTk6mxsVGk855cNKzDwDAeS0KCTg9lAj9gx5hZ2aiVh3phd3e3CRsF1l0U3mMyOztLHR0dYhFoamoi3xZFlJubm8TL3yfDiBKRYFkD1qA7bA2M8StQIwxvbGzQ8vKyh5/97dDYLtLT04XhhYUFYdS3UBGcLFBFbpG4QwG8gXdsRCP7DystrseksLDwl87Ozj6uk695xzI/Ng+8phPaQbbE/YIO1z7+20LiJeLP/v7+3zhTt+zwR5UuB18PGvtvAQYAWjehu2UVfsAAAAAASUVORK5CYII=',
                BASE_64: 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfeDAQILzJ6qpX8AAAAQklEQVRIx2NgGAVUBP+BEJUkTTsIoJKkGfIfHTBADKHECNIM+E+ZAf+xAwoNoGsIYDGC9JSAZsSAGDAKRsEoGNkAABiywj6PuunXAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE0LTEyLTA0VDA4OjQ3OjUwKzAxOjAwG2BvaAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNC0xMi0wNFQwODo0Nzo1MCswMTowMGo919QAAAAASUVORK5CYII=',
                WIDTH: 32,//30,
                HEIGHT: 32//27
            },
            // pointer cursor
            '4': {
                BASE_64: 'iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oGBhA5NghChMYAAAFdSURBVDjLrVV/C4IwEH1XK9SGW0Oi7//9smloYeX1T5uTZiX1YHBMeffu54iZ8S8spj5orVlrPc8TM78crTU7SCk59k/sRJX1fe/t5XL5W5jX69Xb5/P5N7JQjVLqN7IkSbxd1zWklCyl/FgMEbvsus7baZrieDw6lczMEEKgLEv6ikyI4fp+v4/y5xwZY7jve1hr6W2YIUHY1MYYb18uF1hroZTiEVme56yU4t1uxwBANEQQ2qfTydvr9RoAUFUVXD6F817XtZfftu2oAA5N00SdpGk6KAtboSxLbDabj23gigIAt9ttILPWUpZl0Tx91V+LxbgAbdtSURR4ks+e75dqOrlzlblZHpFZa2m73c7eY1FlYfzfwhiDqqooSnY4HGapc6mZnICwh+aQTW7N54Z9i/1+zx83bTgu7xBOx+TWcMiyDKvVCkSEruuQ5zmapoEQAsz8stLpn0/dA4k3DbMumUlFAAAAAElFTkSuQmCC',
                WIDTH: 19,
                HEIGHT: 24
            }
        },
        SEPERATOR_ELEMENT_INDEX: '$',
        SEPERATOR_ACTION: '#',
        SEPERATOR_DATA: '&',
        SEPERATOR_TARGET: '*',
        PICK_TUTORIAL: 'pick-tutorial',
        UPDATE_TUTORIAL_SCREEN: 'update-tutorial-screen',
        SHOW_EXPLORE_TAB: 'show-explore-tab'
    });
})();
