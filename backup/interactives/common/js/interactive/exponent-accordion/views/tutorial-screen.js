(function (MathInteractives) {
    'use strict';

    var namespace = MathInteractives.Common.Interactivities.ExponentAccordion.Views,
        dataSetSelectorNameSpace = MathInteractives.Common.Interactivities.DataSetSelector;

    /**
    * Class for EXPONENT accordion tutorial screen view.
    * @class TutorialScreen
    * @module ExponentAccordion
    * @namespace MathInteractives.Interactivities.ExponentAccordion.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    namespace.TutorialScreen = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Holds tutorial's screen 1 model
        *
        * @property tutorialsScreen1Model
        * @type object
        * @default null
        **/
        tutorialsScreen1Model: null,

        /**
        * Holds tutorial's screen 1 view
        *
        * @property tutorialsScreen1View
        * @type object
        * @default null
        **/
        tutorialsScreen1View: null,

        /**
        * Holds tutorial's screen 2 model
        *
        * @property tutorialsScreen2Model
        * @type object
        * @default null
        **/
        tutorialsScreen2Model: null,

        /**
        * Holds tutorial's screen 2 view
        *
        * @property tutorialsScreen2View
        * @type object
        * @default null
        **/
        tutorialsScreen2View: null,

        /**
        * keeps track of previously selected tile in screen 1
        *
        * @property previouslySelectedTile1
        * @type object
        * @default null
        **/
        previouslySelectedTile1: null,

        /**
        * keeps track of previously selected tile in screen 2
        *
        * @property previouslySelectedTile2
        * @type object
        * @default null
        **/
        previouslySelectedTile2: null,

        /**
        * Reference for tutorial form expression
        *
        * @method _tutorialFormExpression
        * @type Object
        * @default null
        */
        _tutorialFormExpression: null,

        /**
        * Boolean to know whether tutorial mode is play from render state or not
        *
        * @proeprty _playTutorialFromSaveState
        * @default false
        * @type Boolean
        */
        _playTutorialFromSaveState: false,

        /**
        * Initializes the tutorial's view
        *
        * @method initialize
        * @constructor
        **/

        initialize: function () {
            this.initializeDefaultProperties();
            this.player.bindTabChange(function (data) {
                this._generateTabChange(data);
            }, this, 1);
            this.$el.css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' }).addClass('bg');

            this.loadScreen('tutorials-tab-screen');
            this.loadScreen('direction-text-screen');
            this._addTutorialsScreen1();
            this._addTutorialsScreen2();
            this._addBackground();
            this._bindEvents();
            if (this.model.get('tutorialDataSelectorView') === null) {
                this._hideScreen2AndShowScreen1();
            }
            this.render();
            this._renderFromSavedState();
            this._updateFOcusRectsOfScreen1();
            this._initialiseHelpElements();
            this.model.on('change:clearAllData', this.clearAllData, this);
        },
        _updateFOcusRectsOfScreen1: function(){
            this.updateFocusRect('screen-1data-set-0');
            this.updateFocusRect('screen-1data-set-1');
        },



        _generateTabChange: function _generateTabChange(data) {
            this.model.set('currentTab', 1);
            var EAModelClass = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion;
            this.model.set('currentView', EAModelClass.CURRENT_VIEW.TUTORIAL);
            if (this._playTutorialFromSaveState) {
                // Play tutorial mode
                this._tutorialFormExpression.playTutorialMode();
                this._playTutorialFromSaveState = false;
            }
            if (this.model.get('tutorialDataSelectorView') !== EAModelClass.TUTORIAL_VIEW.TUTORIAL_MAIN) {
                this.player.enableHelp(false);

            }
            if (data.isLetsGoClicked || this.model.get('backButtonClick')) {
                this.setFocus('header-subtitle', 20);
            }
            else {
                if (this.model.get('tutorialDataSelectorView') === EAModelClass.TUTORIAL_VIEW.TUTORIAL_MAIN) {
                    this.setFocus('screen-1data-set-selector-direction-text-direction-text-text');
                }
                else if (this.model.get('tutorialDataSelectorView') === EAModelClass.TUTORIAL_VIEW.TUTORIAL_SUB_SELECT) {
                    this.setFocus('screen-2data-set-selector-direction-text-direction-text-text');
                }
                else if (this.model.get('tutorialDataSelectorView') === EAModelClass.TUTORIAL_VIEW.TUTORIAL_SCREEN) {
                    this.setFocus('tutorial-direction-text-container-direction-text-text');
                }

            }
            this.model.set('backButtonClick', false);
            this._updateFocusRectsOfTutorial();
            //this.setFocus('direction-text-container-direction-text-text');
        },

        _updateFocusRectsOfTutorial: function () {
            this.updateFocusRect('tutorial-direction-text-container-direction-text-text');
            this.updateFocusRect('tutorial-main-activity-area-container');
            this.updateFocusRect('tutorial-droppable-region');
        },


        _disableAccTabs: function () {
            this.enableTab('tutorial-base-tile-dispenser-container', false);
            this.enableTab('tutorial-exponents-tile-dispenser-container', false);
            this.enableTab('tutorial-parenthesis-tile-dispenser-container', false);
            this.setTabIndex('tutorial-main-activity-area-container', 504);
            this.enableTab('tutorial-droppable-region', false);
        },

        _renderFromSavedState: function _renderFromSavedState() {
            var screenSelectedIndex = this.model.get('tutorialSelectScreenIndex'),
                tutorialSelectedIndex = this.model.get('currentTutorialLessonNumber'),
                currentView = this.model.get('tutorialDataSelectorView'),
                currentTab = this.model.get('currentTab'),
                currentViewClass = MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.TUTORIAL_VIEW;
            if (screenSelectedIndex !== -1) {
                this._updateTutorialScreen1View(screenSelectedIndex);
            }
            if (tutorialSelectedIndex !== -1) {
                this._updateTutorialScreen2View(tutorialSelectedIndex);
            }
            if (currentView === currentViewClass.TUTORIAL_MAIN) {
                this._hideScreen2AndShowScreen1();
            }
            else if (currentView === currentViewClass.TUTORIAL_SUB_SELECT) {
                this._hideScreen1AndShowScreen2();
            }
            else if (currentView === currentViewClass.TUTORIAL_SCREEN) {
                // Update the tutorial mode
                this._tutorialFormExpression.updateViewForTutorialMode();
                // Hide screen 2 and show tutorial form expression screen
                this._hideScreenAndShowTutorial();
                if (currentTab === 1) {
                    // Play tutorial mode
                    this._tutorialFormExpression.playTutorialMode();
                }
                else {
                    this._playTutorialFromSaveState = true;
                }
            }
        },

        /**
        * Renders the view of tutorial tab
        *
        * @method render
        * @private
        **/
        render: function () {
            this._initializeTutorialFormExpression();
        },

        clearAllData: function () {
            if (this.model.get('clearAllData')) {
                this._resetScreen1();
                this._resetScreen2();
                this._hideScreen2AndShowScreen1();
                this._showHideTutorialFormExpression(false);
                this.setFocus('header-subtitle', 50);
                //TO DO : Trigger click of Pick Tutorial and trigger click of "Back" of screen 2
            }
        },

        /**
        * Initialize Tutorial form expression view
        *
        * @method initializeTutorialFormExpression
        * @private
        */
        _initializeTutorialFormExpression: function () {
            //this.idPrefix + 'tutorial';
            var viewNamespace = MathInteractives.Common.Interactivities.ExponentAccordion.Views,
                idPrefix = this.idPrefix + 'tutorial-',
                tutorialWrapper = MathInteractives.Common.Interactivities.ExponentAccordion.templates.formExpression({
                    idPrefix: idPrefix,
                    tutorialMode: true
                }).trim();
            this.$el.append(tutorialWrapper);
            this._tutorialFormExpression = new viewNamespace.TutorialFormExpression({
                el: '#' + idPrefix + 'form-expression-tab',
                model: this.model,
                idPrefix: idPrefix,
                tutorialMode: true
            });
            this._showHideTutorialFormExpression(false);
            this.listenTo(this._tutorialFormExpression, viewNamespace.TutorialFormExpression.PICK_TUTORIAL,
                            this._pickTutorial);
            this.listenTo(this._tutorialFormExpression, viewNamespace.TutorialFormExpression.UPDATE_TUTORIAL_SCREEN,
                            this._updateTutorialScreen2View);
            this.listenTo(this._tutorialFormExpression, viewNamespace.TutorialFormExpression.SHOW_EXPLORE_TAB,
                            this._showExploreTab);
        },

        /**
        * Adds tutorials screen no. 1
        *
        * @method _addTutorialsScreen1
        * @private
        **/
        _addTutorialsScreen1: function _addTutorialsScreen1() {
            var jsonData = [], object;
            for (var i = 0; i < 2; i++) {
                object = {
                    "dataSetName": this.getMessage('tutorial-screen-1-title', i),
                    "dataSetAccName": this.getAccMessage('tutorial-screen-1-title', i)
                }
                jsonData[i] = object;
            }

            /********************************  do changes accordingly ***********************************/
            var options = {
                containerId: this.idPrefix + "tutorials-screen-1",
                idSuffix: 'screen-1',
                showNumbers: false,
                locAccText: {
                    directionText:
                      { loc: this.getMessage('direction-text', 1), acc: this.getMessage('direction-text', 1) },
                    dataSetContainer:
                      { loc: this.getMessage('tutorial-activity-area', 1), acc: this.getAccMessage('tutorial-activity-area', 1) }
                },
                hasClearAllBtn: false,
                buttons: [],

                directionText: {
                    textColor: '',
                    //btn: {
                    //    callBack: {
                    //        fnc: this._blah,
                    //        scope: this
                    //    },
                    //    baseClass: ''
                    //},
                    ttsBaseClass: 'tts-yellow'
                },

                data: {
                    path: this.filePath,
                    manager: this.manager,
                    player: this.player,
                    userDataSetLimit: 0,        ///change to constants
                    noOfPredefinedSets: 2,
                    noOfSetsToSelect: 2,
                    dataSets: null,
                    jsonData: jsonData
                },

                isRoleButtonEnabled: true
            }
            
            this.tutorialsScreen1View = new MathInteractives.global.Theme2.DataSelector.createSelectorScreen(options);

            this.tutorialsScreen1View.$el.find('.data-set-container .data-set-0').addClass('screen-1-tiles').css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' });
        },

        _blah: function _blah() {

        },

        /**
        * Adds tutorials screen no. 2
        *
        * @method _addTutorialsScreen2
        * @private
        **/
        _addTutorialsScreen2: function _addTutorialsScreen2() {

            var model = this.model,
                numberOfTutorials = model.get('numberOfTutorial'),
                jsonData = [],
                self = this,
                accordionLevel = model.get('accordionLevel');

            for (var i = 0; i < numberOfTutorials; i++) {
                var object = {
                    "dataSetName": this.getMessage('tutorial-screen-2-title', i),
                    "dataSetAccName": this.getAccMessage('tutorial-screen-2-title', i)
                }
                jsonData[i] = object;
            }

            var options = {
                containerId: this.idPrefix + "tutorials-screen-2",
                idSuffix: 'screen-2',
                showNumbers: true,
                locAccText: {
                    directionText:
                      { loc: this.getMessage('direction-text', 2), acc: this.getMessage('direction-text', 2) },
                    dataSetContainer:
                      { loc: this.getMessage('tutorial-activity-area', 2), acc: this.getAccMessage('tutorial-activity-area', 2) }
                },
                hasClearAllBtn: false,
                directionText: {
                    textColor: '',
                    //btn: {
                    //    callBack: {
                    //        fnc: this._blah,
                    //        scope: this
                    //    },
                    //    baseClass: ''
                    //},
                    ttsBaseClass: 'tts-yellow'
                },

                buttons: [{
                    name: 'skipTutorialsButtonView',
                    container: 'skip-tutorial-button',
                    baseClass: 'btn-yellow',
                    text: this.getMessage('skip-tutorial-button-container', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    callback: function () { self._skipButtonHandler(); }
                }, {
                    name: 'backButtonView',
                    container: 'back-button',
                    baseClass: 'btn-yellow',
                    type: MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    text: this.getMessage('back-button-container', 0),
                    icon: { faClass: this.getFontAwesomeClass('fixed-back'), fontSize: 14, fontColor: '#222', fontWeight: 'bold', height: 14, width: 17 },
                    callback: function () { self._backButtonHandler(); },
                    width: 115
                }],

                data: {
                    path: this.filePath,
                    manager: this.manager,
                    player: this.player,
                    userDataSetLimit: 0,        ///change to constants
                    noOfPredefinedSets: 0,
                    noOfSetsToSelect: numberOfTutorials,
                    dataSets: null,
                    jsonData: jsonData
                },

                isRoleButtonEnabled: true

            }
            this.tutorialsScreen2View = new MathInteractives.global.Theme2.DataSelector.createSelectorScreen(options);
            var screen2View = this.tutorialsScreen2View.$el;
            screen2View.find('.data-set-container').addClass('screen-2-tutorial-view');
            for (var i = 0; i < numberOfTutorials; i++) {
                screen2View.find('.data-set-container .data-set-' + i).addClass('screen-2-tiles');
                screen2View.find('.data-set-container .data-set-' + i).addClass('accordion-level-' + accordionLevel);
            }

        },

        /**
        * Hides screen 2 and shows screen 1
        *
        * @method _hideScreen2AndShowScreen1
        * @private
        **/
        _hideScreen2AndShowScreen1: function _hideScreen2AndShowScreen1() {
            this.tutorialsScreen2View.hideSelector();
            this.tutorialsScreen1View.showSelector();
            this.player.enableHelp(true);
            this.model.set('tutorialDataSelectorView', MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.TUTORIAL_VIEW.TUTORIAL_MAIN);
        },

        /**
        * Hides screen 1 and shows screen 2
        *
        * @method _hideScreen1AndShowScreen2
        * @private
        **/
        _hideScreen1AndShowScreen2: function _hideScreen1AndShowScreen2() {
            this.tutorialsScreen1View.hideSelector();
            this.tutorialsScreen2View.showSelector();
            //this.setFocus('header-subtitle', 20);
            this.setFocus('screen-2data-set-selector-direction-text-direction-text-textholder');
            this.player.enableHelp(false);
            this.model.set('tutorialDataSelectorView', MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.TUTORIAL_VIEW.TUTORIAL_SUB_SELECT);
            this._updateFOcusRectsOfScreen2();
        },

        _updateFOcusRectsOfScreen2: function(){
            this.updateFocusRect('screen-2data-set-0');
            this.updateFocusRect('screen-2data-set-1');
            this.updateFocusRect('screen-2data-set-2');
            this.updateFocusRect('screen-2data-set-3');
            this.updateFocusRect('screen-2data-set-4');
            this.updateFocusRect('screen-2data-set-5');
        },

        /**
        * Hide screen 2 and show tutorial form expression screen
        *
        * @method _hideScreenAndShowTutorial
        * @private
        */
        _hideScreenAndShowTutorial: function () {
            this.tutorialsScreen1View.hideSelector();
            this.tutorialsScreen2View.hideSelector();
            this._showHideTutorialFormExpression(true);
            this.model.set('tutorialDataSelectorView', null);
            this.model.set('tutorialDataSelectorView', MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.TUTORIAL_VIEW.TUTORIAL_SCREEN);
            //this._disableAccTabs();
            this._updateFocusRectsOfTutorial();
            //this.setFocus('header-subtitle', 20);

            this.setFocus('tutorial-direction-text-container-direction-text-text');
            //this.setFocus('screen-2data-set-selector-direction-text-direction-text-textholder', 1000);
            //this.model.set('tutorialSelectedUsingButton', true);
        },

        /**
        * Show/Hide tutorial screen
        *
        * @method _showHideTutorialFormExpression
        * @param {Boolean} show True to show tutorial screen
        * @private
        */
        _showHideTutorialFormExpression: function (show) {
            var element = this._tutorialFormExpression.$el;
            if (show) {
                element.show();
            }
            else {
                element.hide();
            }
        },

        /**
        * Adds background-images
        *
        * @method _addBackground
        * @private
        **/
        _addBackground: function _addBackground() {
            //this.tutorialsScreen1View.$el.css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' }).addClass('bg');
            //this.tutorialsScreen2View.$el.css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' }).addClass('bg');
            this.tutorialsScreen1View.$el.find('.data-set-container .data-set-0').addClass('screen-1-tiles').css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' });
            this.tutorialsScreen1View.$el.find('.data-set-container .data-set-1').addClass('screen-1-tiles').css({ 'background-image': 'url("' + this.filePath.getImagePath('sprites') + '")' });

            var accordionLevel = this.model.get('accordionLevel'),
                exploreBtnTextArr = [];

            switch (accordionLevel) {
                case 1: exploreBtnTextArr = [4, 2, 4, 6];
                    break;
                case 2: exploreBtnTextArr = [-4, 2, 4, 6];
                    break;
                case 3:
                case 4: exploreBtnTextArr = [5, 2, 4, 2];
                    break;
                case 5: exploreBtnTextArr = [5, -2, 4, 2];
                    break;
            }

            //render text inside screen

            this._renderTextInsideScreen1Button(exploreBtnTextArr);
        },


        _renderTextInsideScreen1Button: function (exploreBtnTextArr) {
            var $tutorialButton = this.tutorialsScreen1View.$el.find('.data-set-container .data-set-0'),
                    $expolreButton = this.tutorialsScreen1View.$el.find('.data-set-container .data-set-1'),
                    $tutorialButtonBase = $('<div>5</div>').attr({ 'id': this.idPrefix + 'tutorial-button-base', 'class': 'tutorial-button-base' }),
                    $tutorialButtonExponent = $('<div>2</div>').attr({ 'id': this.idPrefix + 'tutorial-button-exponent', 'class': 'tutorial-button-exponent' }),
                    $exploreButtonBase1, $exploreButtonExponent1;
            $tutorialButtonBase.appendTo($tutorialButton);
            $tutorialButtonExponent.appendTo($tutorialButton);


            var $exploreButtonBase2 = $('<div>' + exploreBtnTextArr[2] + '</div>').attr({ 'id': this.idPrefix + 'explore-button-base-2', 'class': 'explore-button-base-2 explore-button-base' }),
                $exploreButtonExponent2 = $('<div>' + exploreBtnTextArr[3] + '</div>').attr({ 'id': this.idPrefix + 'explore-button-exponent-2', 'class': 'explore-button-exponent-2 explore-button-exponent' });

            if (exploreBtnTextArr[0] < 0) {
                $exploreButtonBase1 = $('<div>' + '&minus;' + Math.abs(exploreBtnTextArr[0]) + '</div>').attr({ 'id': this.idPrefix + 'explore-button-base-1', 'class': 'explore-button-base-1 explore-button-base' }).addClass('explore-base-button-left-adjust');;
            }
            else {
                $exploreButtonBase1 = $('<div>' + exploreBtnTextArr[0] + '</div>').attr({ 'id': this.idPrefix + 'explore-button-base-1', 'class': 'explore-button-base-1 explore-button-base' });
            }
            if (exploreBtnTextArr[1] < 0) {
                $exploreButtonExponent1 = $('<div>' + '&minus;' + Math.abs(exploreBtnTextArr[1]) + '</div>').attr({ 'id': this.idPrefix + 'explore-button-exponent-1', 'class': 'explore-button-exponent-1 explore-button-exponent' }).addClass('explore-exponent-button-left-adjust');
            }
            else {
                $exploreButtonExponent1 = $('<div>' +  exploreBtnTextArr[1] + '</div>').attr({ 'id': this.idPrefix + 'explore-button-exponent-1', 'class': 'explore-button-exponent-1 explore-button-exponent' });
            }

            $exploreButtonBase1.appendTo($expolreButton);
            $exploreButtonExponent1.appendTo($expolreButton);

            $exploreButtonBase2.appendTo($expolreButton);
            $exploreButtonExponent2.appendTo($expolreButton);
        },

        _onTutorialMouseOver: function _onTutorialMouseOver() {
            this.onRequiredElementMouseOver(this.tutorialsScreen1View.$el.find('.data-set-container .data-set-0'));
        },

        _onTutorialMouseOut: function _onTutorialMouseOut() {
            this.onRequiredElementMouseOut(this.tutorialsScreen1View.$el.find('.data-set-container .data-set-0'));
        },

        _onExploreMouseOver: function _onExploreMouseOver() {
            this.onRequiredElementMouseOver(this.tutorialsScreen1View.$el.find('.data-set-container .data-set-1'));
        },

        _onExploreMouseOut: function _onExploreMouseOut() {
            this.onRequiredElementMouseOut(this.tutorialsScreen1View.$el.find('.data-set-container .data-set-1'));
        },

        /**
        * Binds events to views
        *
        * @method _bindEvents
        * @private
        **/
        _bindEvents: function _bindEvents() {
            this.listenTo(this.tutorialsScreen1View, MathInteractives.global.Theme2.DataSelector.EVT_SEL_DATASET, this._screen1TileClickHandler);
            this.listenTo(this.tutorialsScreen2View, MathInteractives.global.Theme2.DataSelector.EVT_SEL_DATASET, this._screen2TileClickHandler);
        },

        /**
        * Handler of Pick tutorial button
        * If only 1 tutorial lesson found, show screen 1, otherwise show screen 2
        *
        * @method _pickTutorial
        * @private
        */
        _pickTutorial: function () {
            var numberOfTutorials = this.model.get('numberOfTutorial');
            if (numberOfTutorials === 1) {
                this._hideScreen2AndShowScreen1();
                this._showHideTutorialFormExpression(false);
            }
            else {
                this._showTutorialChoosenScreen();
            }
        },

        /**
        * Show tutorial choosen screen and Hide Tutorial Form expression
        *
        * @method _showTutorialChoosenScreen
        * @private
        */
        _showTutorialChoosenScreen: function () {
            this._hideScreen1AndShowScreen2();
            this._showHideTutorialFormExpression(false);
        },

        /**
        * Handles screen-1 tile click
        *
        * @method _screen1TileClickHandler
        * @param data object has two properties: data and index
        * @private
        **/
        _screen1TileClickHandler: function _screen1TileClickHandler(data) {
            this.stopReading();
            var staticData = namespace.TutorialScreen;
            this.model.set('tutorialSelectScreenIndex', data.index);
            this._updateTutorialScreen1View(data.index);
            if (data.index === staticData.TUTORIAL_SCREEN) {
                var numberOfTutorials = this.model.get('numberOfTutorial');
                if (numberOfTutorials === 1) {
                    this._showAndPlayTutorialMode(0);
                }
                else {
                    this._hideScreen1AndShowScreen2();
                }
            }
            else {
                this.model.set('currentTab', 2);
                if(this.model.get('exploreView') === null) {
                    this.model.set('exploreView', MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.EXPLORE_VIEW.FORMATION);
                }
                this.model.set('expolreBtnClick', true);
                this.player.switchToTab(2);

            }
        },

        /**
        * Handles screen-2 tile click
        *
        * @method _screen2TileClickHandler
        * @param data object has two properties: data and index
        * @private
        **/
        _screen2TileClickHandler: function _screen2TileClickHandler(data) {
            this.stopReading();
            this._updateTutorialScreen2View(data.index);
            if (!(data.index === undefined
                || data.index === null)) {
                var index = parseInt(data.index, 10);
                this._showAndPlayTutorialMode(index);
            }
        },

        /**
        * As per given index,
        *   Set current lesson number
        *   Update tutorial mode
        *   Show tutorial screen
        *   Play tutorial mode
        *
        * @method _showAndPlayTutorialMode
        * @param {Number} index Tutorial lesson number which is to be set
        * @private
        */
        _showAndPlayTutorialMode: function (index) {
            // Set current tutorial number to current data index
            this.model.set('currentTutorialLessonNumber', index);
            // Update the tutorial mode

            this._tutorialFormExpression.updateViewForTutorialMode();
            // Hide screen 2 and show tutorial form expression screen
            this._hideScreenAndShowTutorial();
            // Play tutorial mode


            this._tutorialFormExpression.playTutorialMode();

        },

        /**
        * Skip Tutorials button click handler
        *
        * @method _skipButtonHandler
        * @private
        **/
        _skipButtonHandler: function _skipButtonHandler() {
            this.stopReading();
            this._showExploreTab();
        },

        /**
        * Back button click handler
        *
        * @method _backButtonHandler
        * @private
        **/
        _backButtonHandler: function _backButtonHandler() {
            this.stopReading();
            this._hideScreen2AndShowScreen1();
        },

        _initialiseHelpElements: function _initialiseHelpElements() {
            var helpElements = this.model.get('helpElements');
            if (helpElements.length === 0) {
                helpElements.push(
                { elementId: 'screen-1data-set-0', helpId: 'tutorial-button-help', msgId: 0, position: 'top' },
                { elementId: 'screen-1data-set-1', helpId: 'explore-button-help', msgId: 0, position: 'top' },
                { elementId: 'direction-text-container-direction-text-buttonholder', helpId: 'try-another-help', msgId: 0, position: 'bottom', dynamicArrowPosition: true },
                { elementId: 'base-exp-tile-container', helpId: 'base-exp-tile-container-help', msgId: 0, position: 'top', offset:{x:5, y:228}, hideArrowDiv: true },
                { elementId: 'parenthesis-tile-container-value-1', helpId: 'parenthesis-container-help', msgId: 0, position: 'right', offset:{x:10, y:0}},
                { elementId: 'raised-to-power-toggle-button-container', helpId: 'raise-fraction-to-power-help', msgId: 0, position: 'top' },
                { elementId: 'build-mode-undo-button', helpId: 'build-mode-undo-help', msgId: 0, position: 'top' },
                { elementId: 'build-mode-reset-button', helpId: 'build-mode-reset-help', msgId: 0, position: 'top' },
                { elementId: 'random-expression-button', helpId: 'create-random-expression-help', msgId: 0, position: 'top' },
                { elementId: 'done-button', helpId: 'done-button-help', msgId: 0, position: 'top', dynamicArrowPosition: true},
                { elementId: 'original-expression-title', helpId: 'original-expression-help', msgId: 0, position: 'top' },
                { elementId: 'workspace-scrollable', helpId: 'workspace-scrollable-help', msgId: 0, position: 'top', offset:{x:0, y:230}, hideArrowDiv: true },
                { elementId: 'solve-mode-undo-button', helpId: 'solve-mode-undo-help', msgId: 0, position: 'top' },
                { elementId: 'solve-mode-reset-button', helpId: 'solve-mode-reset-help', msgId: 0, position: 'top' },
                { elementId: 'view-data-button', helpId: 'view-data-button-help', msgId: 0, position: 'top', dynamicArrowPosition: true },
                { elementId: 'data-tab-direction-text-direction-text-buttonholder', helpId: 'try-another-help', msgId: 0, position: 'bottom', dynamicArrowPosition: true },
                { elementId: 'accordion-container-title', helpId: 'accodion-data-table-help', msgId: 0, position: 'bottom', hideArrowDiv: true },
                { elementId: 'dummy-help-arrow-div', helpId: 'accordion-table-arrow-help', msgId: 0, position: 'bottom', dynamicArrowPosition: true, hideArrowDiv: true },
                { elementId: 'back-button', helpId: 'data-back-btn-help', msgId: 0, position: 'top', dynamicArrowPosition: true},
                { elementId: 'clear-data-button', helpId: 'clear-data-btn-help', msgId: 0, position: 'top', dynamicArrowPosition: true }
                );
            }
        },

        /**
        * Handler of tutorial mode to show explore
        * Hide screen2 and tutorial mode
        * reset screen2
        *
        * @method _showExploreTab
        * @private
        */
        _showExploreTab: function () {
            // Hide screen 2 and show screen 1
            this._hideScreen2AndShowScreen1();
            // Hide tutorial form expression
            this._showHideTutorialFormExpression(false);

            // Update tutorial screen 1
            this._updateTutorialScreen1View(namespace.TutorialScreen.EXPLORE_SCREEN);
            this.model.set('tutorialSelectScreenIndex', namespace.TutorialScreen.EXPLORE_SCREEN);
            // Reset tutorial screen 2
            this._resetScreen2();
            this.model.set('currentTutorialLessonNumber', -1);
            // Show Explore tab
            this.model.set('expolreBtnClick', true);
            this.player.switchToTab(2);
        },

        /**
        * Update screen1 selection as per given index
        *
        * @method _updateTutorialScreen1View
        * @param {Number} selectedIndex Index which is to be set selected
        * @private
        */
        _updateTutorialScreen1View: function (selectedIndex) {
            this._resetScreen1();
            this._setScreen1(selectedIndex);
        },

        /**
        * Update screen selection as per given index
        *
        * @method _updateTutorialScreen2View
        * @param {Number} selectedIndex Index which is to be set selected
        * @private
        */
        _updateTutorialScreen2View: function (selectedIndex) {
            this._resetScreen2();
            this._setScreen2(selectedIndex);
        },

        /**
        * Set selected button in screen1
        *
        * @method _setScreen1
        * @param {Number} selectedIndex Index which is to be set selected
        * @private
        */
        _setScreen1: function (selectedIndex) {
            this.tutorialsScreen1View.$el
                .find('.data-set-container .data-set-' + selectedIndex)
                .addClass('screen-1-tile-selected');
            this.previouslySelectedTile1 = selectedIndex;
        },

        /**
        * Reset selected button in screen1
        *
        * @method _resetScreen1
        * @private
        */
        _resetScreen1: function () {
            this.tutorialsScreen1View.$el
                .find('.data-set-container .data-set-' + this.previouslySelectedTile1)
                .removeClass('screen-1-tile-selected hover');
        },

        /**
        * Set selected button in screen2
        *
        * @method _setScreen2
        * @param {Number} selectedIndex Index which is to be set selected
        * @private
        */
        _setScreen2: function (selectedIndex) {
            this.tutorialsScreen2View.$el.find('.data-set-container .data-set-' + selectedIndex).addClass('screen-2-tile-selected');
            this.tutorialsScreen2View.$el.find('.data-set-container .data-set-' + selectedIndex + ' .data-set-number-container').addClass('screen-2-tile-selected');
            this.tutorialsScreen2View.$el.find('.data-set-container .data-set-' + selectedIndex + ' .data-set-number-container .data-set-number-text').addClass('screen-2-tile-selected');
            this.previouslySelectedTile2 = selectedIndex;
        },

        /**
        * Reset selected button in screen2
        *
        * @method _resetScreen2
        * @private
        */
        _resetScreen2: function () {
            this.tutorialsScreen2View.$el
                .find('.data-set-container .data-set-' + this.previouslySelectedTile2)
                .removeClass('screen-2-tile-selected');
            this.tutorialsScreen2View.$el
                .find('.data-set-container .data-set-' + this.previouslySelectedTile2 + ' .data-set-number-container')
                .removeClass('screen-2-tile-selected');
            this.tutorialsScreen2View.$el
                .find('.data-set-container .data-set-' + this.previouslySelectedTile2 + ' .data-set-number-container .data-set-number-text')
                .removeClass('screen-2-tile-selected');

        }
    }, {

        TUTORIAL_SCREEN: '0',
        EXPLORE_SCREEN: '1'

    });
})(window.MathInteractives);
