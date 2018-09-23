
(function () {
    if (MathInteractives.Common.Player.Views.Player) {
        return;
    }
    'use strict';
    /**
    * A customized Backbone.View that holds the logic behind the presentation of Player.
    * @class PlayerView
    * @constructor
    * @namespace MathInteractives.Common.Player.Views
    * @module Common
    * @submodule Player
    * @extends Backbone.View
    */


    var PlayerClass = MathInteractives.Common.Player.Views.Player = Backbone.View.extend({

        /*
        * @property el
        * @type object
        * @default $('.player')
        **/


        /*
        * Stores the name of the interactivity retrieved from config
        * @property _moduleName
        * @type String
        * @default null
        */
        _moduleName: null,

        /*
        * Stores the tab array retrieved from config
        * @property _tabsData
        * @type {object}
        * @default null
        */
        _tabsData: null,

        /*
        * Stores the config retrieved from config file
        * @property _config
        * @type {object}
        * @default null
        */
        _config: null,

        /*
        * @property _header
        * @type {object}
        * @private
        * @deafule null
        */
        _header: null,

        /*
        * Stores the tab change callback passed by user
        * @property _tabChangeData
        * @type object
        * @default null
        */
        _tabChangeData: null,

        _managerModel: null,

        /*
        * Instance of manager
        * @private
        * @default null
        */
        _manager: null,

        /*
        * Refers to the interactivity's different tabs' common model
        * @private
        */
        interactiveModel: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property path
        * @type Object
        * @default null
        */
        _path: null,

        /**
        * Holds array of elements of tab views
        *
        * @property tab
        * @type Array
        * @default null
        */
        tab: null,

        /*
        * Stores the steps data retrieved from config
        * @property _stepsData
        * @type {object}
        * @default null
        */
        _stepsData: null,

        /*
        * Stores the view instances of activity area
        * @property _activityAreaViews
        * @type object
        * @default null
        */
        _activityAreaViews: null,

        /*
        *Stores boolean for step 2 load
        * @property _step2FirstLoad
        * @default false
        * @type bool
        */
        _step2FirstLoad: false,

        /*
        * Stores the index of tab to switch after preload complete
        * @property _tabToSwitchAfterPreload
        * @default 1
        * @type Number
        */
        _tabToSwitchAfterPreload: 1,

        /*
        * Stores instance of overview tab
        * @property _overviewTabInstance
        * @private
        * @default null
        * @type object
        */
        _overviewTabInstance: null,

        /*
        * Stores the index of current active tab.
        * @property _currentActiveTab
        * @default null
        * @type Number
        */
        _currentActiveTab: null,

        /*
        * Stores whether selected tab clicked.
        * @property _isSelectedTabClicked
        * @default false
        * @type Boolean
        */
        _isSelectedTabClicked: false,

        /*
        * Stores whether let's go button of overview tab is clicked, used while tab change to decide focus
        * @property isLetsGoClicked
        * @default false
        * @type Boolean
        */
        isLetsGoClicked: false,

        /*
        * Stores an instance of the sound manager
        * @property soundManagerInstance
        * @default null
        * @type Object
        */
        soundManagerInstance: null,

        taskStack: [],

        screenShotModalView: null,

        /**
        * Initialization
        * @method initialize
        */
        initialize: function () {
            var Player = MathInteractives.Common.Player.Views.Player;
            this._path = this.model.get('path');

            this._config = this.model.get('config');

            this._jsonDataMapping();
            this._initializeManager();
            this._moduleName = this._config.module;
            this._tabsData = this._config.tabsData;
            this.tab = [];

            if (this._tabsData.length > 1 && this.getPlayerThemeType() === MathInteractives.Common.Player.Views.Player.THEMES.THEME_1) {
                this._manager.unloadScreen('tab-contents', this.getIDPrefix());
                this._manager.loadScreen('tab-contents', this.getIDPrefix());
            }

            this._stepsData = this._config.steps;
            this._attachEvents();

            switch (this.getPlayerThemeType()) {
                case Player.THEMES.THEME_1:
                    {
                        this._manager.unloadScreen('theme-1-header-buttons', this.getIDPrefix());
                        this._manager.loadScreen('theme-1-header-buttons', this.getIDPrefix());
                        break;
                    }
                case Player.THEMES.THEME_2:
                    {
                        this._manager.unloadScreen('theme-2-header-buttons', this.getIDPrefix());
                        this._manager.loadScreen('theme-2-header-buttons', this.getIDPrefix());
                        break;
                    }
            }

            this.render();

            //set current tab as per model data
            this._defaultSetupOfPlayer();

            this._restrictTextSelection();

            this._manager.loadScreen('player', this.getIDPrefix());

            if (this.model.get('isAccessible') === true) {
                this._manager.initializeAccessibilityComponents(this.$el.parent());
            }

            //var uagent = navigator.userAgent.toLowerCase();
            //if (uagent.indexOf('chrome') != -1) {
            //    $('body').attr('role', 'application');
            //}
            //else {
            //    $('body').attr('role', 'application');
            //}
            this._enableDisableApplicationMode(true);
            this._header.initTheme2Help();
            if ((!$.isEmptyObject(this.model.get('audioFileDataMap'))) && (this.getPlayerThemeType() !== Player.THEMES.THEME_1)) {
                this.soundManagerInstance = this.initializeAudioManager();
            }
        },


        /**
        * Maps json data between common and interactivity..
        * @method _jsonDataMapping
        * @private
        */
        _jsonDataMapping: function () {
            var managerData,
                miscellaneousScreen,
                commonJsonScreens,
                miscScreen = "miscellaneous-screen",
                interactiveJsonScreens,
                miscElements,
                messageData = {},
                messages,
                screenElement,
                screens,
                screenElements,
                messageCount,
                miscElementCount;

            managerData = this.model.get('managerData');

            //Finds Miscellaneous screen in common loc-acc.json
            //commonJsonScreens = managerData.common;

            commonJsonScreens = $.extend([], managerData.common);
            for (var index in commonJsonScreens) {
                if (commonJsonScreens[index].id === miscScreen) {
                    miscellaneousScreen = commonJsonScreens[index];
                }
            }
            miscElements = miscellaneousScreen.elements;
            miscElementCount = miscElements.length;

            //Finds interactive screens in interactivity json

            interactiveJsonScreens = $.extend([], managerData.interactive);
            screens = interactiveJsonScreens.length;

            //loop through each screen of interactivity.
            for (var screenIndex = 0; screenIndex < screens; screenIndex++) {
                screenElement = interactiveJsonScreens[screenIndex].elements;
                screenElements = screenElement.length;

                //loop through each element of interactivity.
                for (var elementIndex = 0 ; elementIndex < screenElements ; elementIndex++) {
                    messages = screenElement[elementIndex].messages;
                    messageCount = messages.length;

                    //loop through each message.
                    for (var messageIndex = 0 ; messageIndex < messageCount; messageIndex++) {

                        //loop through each element of miscellaneous screen in common json.
                        for (var miscElmtIndex = 0 ; miscElmtIndex < miscElementCount; miscElmtIndex++) {

                            if (messages[messageIndex] !== undefined && messages[messageIndex] !== null) {
                                //mapping loc-acc text between common n interactivity.
                                if (messages[messageIndex].message.commonId === miscElements[miscElmtIndex].id) {
                                    var locText, accText;
                                    if (miscElements[miscElmtIndex].messages[0].isAccTextSame) {
                                        accText = miscElements[miscElmtIndex].messages[0].message.loc;
                                    }
                                    else {
                                        accText = miscElements[miscElmtIndex].messages[0].message.acc;
                                    }
                                    locText = miscElements[miscElmtIndex].messages[0].message.loc;

                                    if (messages[messageIndex].isAccTextSame) {
                                        messages[messageIndex].message.loc = locText;
                                        messages[messageIndex].message.acc = locText;
                                    }
                                    else {
                                        if (typeof messages[messageIndex].message.acc === 'undefined' || messages[messageIndex].message.acc === null) {
                                            messages[messageIndex].message.loc = locText;
                                            messages[messageIndex].message.acc = '';
                                        }
                                        else if (typeof messages[messageIndex].message.loc === 'undefined' || messages[messageIndex].message.loc === null) {
                                            messages[messageIndex].message.acc = accText;
                                        }
                                        else {
                                            messages[messageIndex].message.loc = locText;
                                            messages[messageIndex].message.acc = accText;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },


        /**
        * Returns status of the help screen visibility
        * @method isHelpOpen 
        * @return isHelpScreenShown: boolean
        * @public
        */
        isHelpOpen: function () {
            return this._header.isHelpScreenShown;
        },

        /**
        * Enables/ disables application mode
        * @method _enableDisableApplicationMode
        * @parameter allowAppMode: boolean
        * @private
        */
        _enableDisableApplicationMode: function _enableDisableApplicationMode(allowAppMode) {
            if (allowAppMode) {
                $(this.el).parent().attr('role', 'application');
            }
            else {
                $(this.el).parent().removeAttr('role');
            }
            this._refreshDOM();
        },
        /**
        * Refreshes html DOM
        * @method _refreshDOM
        * @private
        */
        _refreshDOM: function _refreshDOM() {
            var $span = $('<span>', { class: 'temp-dom-refresh-span' });
            this.$el.append($span);
            $span.remove();
        },
        /**
        * 
        * @method _initializeManager
        * @private
        */
        _initializeManager: function () {
            var self = this,
             jsonData = self.model.get('jsonData'), managerData = self.model.get('managerData'), pronunciationData = self.model.get('pronunciationData'), Player,
            isAccessible = this.model.get('isAccessible'), managerModel, commonJsonClone, activityJsonClone, manager, parsedCommonPronounceData, parsedInteractivePronounceData;

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                isAccessible = false;
            }

            //Disabling accessibility for player theme 2
            Player = MathInteractives.Common.Player.Views.Player;
            switch (this.getPlayerThemeType()) {
                case Player.THEMES.THEME_1: //break;
                case Player.THEMES.THEME_2:
                    {
                        this.model.set('isAccessible', isAccessible);
                        break;
                    }
            }


            managerModel = new MathUtilities.Components.Manager.Models.Manager({
                startTabindex: this.model.get('startTabindex') || 0,
                isAccessible: isAccessible,
                isWrapOn: false,
                noTextMode: this.model.get('isNoTextMode'),
                debug: true
            });

            commonJsonClone = $.extend([], managerData.common);
            activityJsonClone = $.extend([], managerData.interactive);
            if (isAccessible) {
                //if Accessibility on, words and sentances replaced by the pronunciation data before parsing in the manager
                parsedCommonPronounceData = pronunciationData.common;
                parsedInteractivePronounceData = pronunciationData.interactive;

                commonJsonClone = this.changeProunciations(commonJsonClone, parsedCommonPronounceData);
                activityJsonClone = this.changeProunciations(activityJsonClone, parsedInteractivePronounceData);
                activityJsonClone = this.changeProunciations(activityJsonClone, parsedCommonPronounceData);
            }

            //Prevent focus rect of tabs in the hamburger menu from being cut
            if (this.getPlayerThemeType() === Player.THEMES.THEME_2) {
                this.fixTabDrawerFocusRects(activityJsonClone);
            }

            managerModel.parse(commonJsonClone);
            managerModel.parse(activityJsonClone);
            manager = new MathUtilities.Components.Manager.Views.Manager({ model: managerModel });
            this._manager = manager;
        },

        /**
        * Sets fixed offset values for the focus rect of tabs in the hamburger menu
        * @method fixTabDrawerFocusRects
        * @param activityJson {Object} Loc-acc data of the interactive
        * @private
        */
        fixTabDrawerFocusRects: function (activityJson) {
            var tabContents, tabElements;

            tabContents = activityJson.filter(function (value) {
                if (value.id === 'tab-contents') {
                    return true;
                }
                return false;
            });

            tabElements = tabContents[0].elements;

            $.each(tabElements, function () {
                this.offsetTop = -4;
                this.offsetLeft = -4;
            });

            return activityJson;
        },


        /**
        * Function to create a clone object of loc-acc.json with new pronounciations
        * @method changeProunciations
        * @chainable
        * @private
        */
        changeProunciations: function (cloneJson, parsedPronounceData) {

            var $cloneJson = cloneJson,
             lengthClone = $cloneJson.length, i, j, k, cloneElementsLength, accMessages, accMessagesLength, currentAccMessage;

            if ($cloneJson !== undefined && lengthClone > 0) {

                for (i = 0; i < lengthClone; i++) {

                    cloneElementsLength = $cloneJson[i].elements.length;
                    for (j = 0; j < cloneElementsLength; j++) {
                        accMessages = $cloneJson[i].elements[j].messages;
                        accMessagesLength = accMessages.length;

                        for (k = 0; k < accMessagesLength; k++) {

                            if (accMessages[k].isAccTextSame !== undefined) {
                                if (accMessages[k].isAccTextSame === true) {
                                    accMessages[k].isAccTextSame = false;
                                    accMessages[k].message.acc = accMessages[k].message.loc;
                                }
                            }
                            currentAccMessage = accMessages[k].message.acc;
                            if (typeof currentAccMessage !== "undefined") {
                                // Now replace this acc message with new one $(accMessages[k])[0].message.acc
                                accMessages[k].message.acc = this.getOriginalMessage(currentAccMessage, parsedPronounceData);

                            }
                        }
                    }
                }
            }
            return cloneJson
        },



        /**
        * Function to get the pronounced text for original message
        * @method getOriginalMessage
        * @private
        */
        getOriginalMessage: function getOriginalMessage(accOriginalMessage, parsedPronounceData) {
            var self = this,
             originalWordInPronounceXml,
             pronouncedWordInPronounceXml,
             originalSentenceInPronounceXml,
             wordLength, sentenceLength,
             pronouncedSentenceInPronounceXml, i, j, k, $pronounceData,
             strCheck = accOriginalMessage;
            if (parsedPronounceData) {
                if (parsedPronounceData.sentences !== undefined) {
                    sentenceLength = parsedPronounceData.sentences.length;
                    for (i = 0; i < sentenceLength; i++) {

                        $pronounceData = parsedPronounceData.sentences[i];
                        originalSentenceInPronounceXml = $pronounceData.originalSentence;
                        pronouncedSentenceInPronounceXml = $pronounceData.pronouncedSentence;

                        if ((new RegExp(originalSentenceInPronounceXml, 'gi')).test(strCheck)) {
                            accOriginalMessage = self.replaceSentence(accOriginalMessage, originalSentenceInPronounceXml, pronouncedSentenceInPronounceXml);
                        }
                    }
                }
                if (parsedPronounceData.words !== undefined) {
                    wordLength = parsedPronounceData.words.length;
                    for (i = 0; i < wordLength; i++) {
                        $pronounceData = parsedPronounceData.words[i];
                        originalWordInPronounceXml = $pronounceData.originalWord;
                        pronouncedWordInPronounceXml = $pronounceData.pronouncedWord;

                        if ((new RegExp(originalWordInPronounceXml, 'gi')).test(strCheck)) {
                            accOriginalMessage = self.replaceWord(accOriginalMessage, originalWordInPronounceXml, pronouncedWordInPronounceXml);
                        }
                    }
                }
            }
            return accOriginalMessage;
        },

        /**
        * Function to replace the sentences
        * @method replaceSentence
        * @private
        */
        replaceSentence: function replaceSentence(text, sentenceToBeReplace, pronounceSentence) {
            return text.replace(new RegExp(sentenceToBeReplace, 'gi'), pronounceSentence);
        },

        /**
        * Function to replace the words
        * @method replaceWord
        * @private
        */
        replaceWord: function replaceWord(text, replace, pronounceWord) {
            var wordToBeReplaced = "\\b(" + replace + ")\\b";
            return text.replace(new RegExp(wordToBeReplaced, 'gi'), pronounceWord);
        },



        /**
        * Inserts css changes into DOM.
        * @method render
        * @return {Object}
        */
        render: function () {

            this._appendDivsToCalculateHeightWidth();

            //adding header to the player
            this._initializeHeader();
            var noOfTabs = this._tabsData.length, activityAreaModel = null,
                template = null,
                tabsData = this._tabsData,
                config = this._config,
                uiClass = null,
                noOfTabs = tabsData.length;
            switch (config.themeType) {
                case MathInteractives.global.PlayerModel.THEME1:
                    if (noOfTabs > 1) {
                        uiClass = 'theme1-tabs';        //small-layout-with-tabs
                    }
                    else {
                        uiClass = 'theme1';             //small-layout-without-tabs
                    }
                    break;

                case MathInteractives.global.PlayerModel.THEME2:
                    if (noOfTabs > 1) {
                        uiClass = 'theme2-tabs';        //large-layout-with-tabs
                    }
                    else {
                        uiClass = 'theme2';             //large-layout-without-tabs
                    }
                    break;

                default:
                    if (noOfTabs > 1) {
                        uiClass = 'theme1-tabs';        //small-layout-with-tabs
                    }
                    else {
                        uiClass = 'theme1';             //small-layout-without-tabs
                    }

            }

            this.model.initializeModals(noOfTabs);
            this._initializeInteractiveModel();


            this.$('.activity-area-container').addClass(uiClass);

            this._activityAreaViews = [];
            for (var index = 0; index < noOfTabs; index++) {
                //adding activity area
                template = tabsData[index].templateName;
                this._insertActivityArea(index, template, tabsData[index].shadow, this._moduleName, uiClass);

                //loads all data if two step loading is false or undefined
                if (typeof config.isTwoStepLoad === 'undefined' || !config.isTwoStepLoad) {
                    this._pushCurrentTabContent(index);
                }
            }
            /*Load tab container screen for theme 2, as message can not get from mamanger after createAcc for same element present in this screen*/
            if (this._tabsData.length > 1 && this.getPlayerThemeType() === MathInteractives.Common.Player.Views.Player.THEMES.THEME_2) {
                var self = this,
                    tabCollection = this.model.get('tabCollection'),
                    startTabIndex = MathInteractives.Common.Player.Models.Player.TAB_ITEMS_START_TAB_INDEX;
                this._manager.unloadScreen('tab-contents', this.getIDPrefix());
                this._manager.loadScreen('tab-contents', this.getIDPrefix());
                tabCollection.each(function (currentModel) {
                    self._manager.setTabIndex(currentModel.get('id'), startTabIndex);
                    startTabIndex += 10;
                });
            }

            //interactive default model is needed into player header for help screen functionality in theme 2
            this._header.model.set('interactiveModel', this.interactiveModel);
            //loads only 0th tab needed for first load 
            if (config.isTwoStepLoad === true) {
                this._step2FirstLoad = true;
                this.enableHeaderButtons(false);
                this._pushCurrentTabContent(0);
            }


            //check config to disable auto resize of tabs
            if (typeof config.resizeTab === 'undefined' || config.resizeTab) {
                //this._adjustTabWidth(); // removed because each tab-header will have width according to its text
            }


            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this.$el.css('cursor', 'default');
            }
            return this;
        },

        /*
        * Attach Events
        *
        * @method _attachEvents
        */
        _attachEvents: function () {
            this.model.on('change:currentActiveTab', $.proxy(this._tabChangeEvent, this));
            var Player = MathInteractives.Common.Player.Views.Player,
            $tabsCont = this.$('.tabs-container');

            switch (this.getPlayerThemeType()) {
                case Player.THEMES.THEME_1: break;
                case Player.THEMES.THEME_2:
                    {
                        $tabsCont.attr('data-html2canvas-ignore', 'true');
                        this.$el.off('click.drawerHide').on('click.drawerHide', $.proxy(function () {
                            if ($tabsCont.css('left') === '0px') {
                                this._hideDrawer();
                            }
                        }, this));

                        this.model.off(Player.Events.SECOND_STEP_COMPLETE).on(Player.Events.SECOND_STEP_COMPLETE, $.proxy(this._step2PreloadComplete, this));
                        this.model.off(Player.Events.SECOND_STEP_PROGRESS).on(Player.Events.SECOND_STEP_PROGRESS, $.proxy(this._step2PreloadProgress, this));
                        this.model.off(Player.Events.SECOND_STEP_ERROR).on(Player.Events.SECOND_STEP_ERROR, $.proxy(this._step2PreloadError, this));
                        break;
                    }
            }
            this.model.off(Player.Events.SAVE_STATE_ERROR).on(Player.Events.SAVE_STATE_ERROR, $.proxy(this._onSaveOperationError, this));
            this.model.off(Player.Events.SAVE_STATE_SUCCESS).on(Player.Events.SAVE_STATE_SUCCESS, $.proxy(this._onSaveOperationSuccess, this));
        },

        /*
        * Append divs to calculate height and width.
        * @method _appendDivsToCalculateHeightWidth
        */
        _appendDivsToCalculateHeightWidth: function () {

            /*======================== Append text div in button text calculation hack div======== */
            var buttonTextHackDivCont = this.$('#text-dimentions-hack'),
                wrapperDivForButton = $('<div>', {
                    'id': 'text-dimentions-hack-holder-wrapper',
                    'class': 'de-mathematics-interactive'
                }),

                textDivForButton = $('<div>', {
                    'id': 'text-dimentions-hack-holder',
                    'style': 'float:initial;  min-height: initial;margin-left: initial;line-height:normal;'
                });

            wrapperDivForButton.append(textDivForButton);
            buttonTextHackDivCont.append(wrapperDivForButton).removeAttr('style');
            /*======================================================================================*/


            /*============Append div to body to calculate text width==================*/
            var $deMathHackContainer = this.$('#' + this.getIDPrefix() + 'de-math-interactive-dimension-hack-div-container.de-mathematics-interactive');
            $deMathHackContainer = $('<div>', {
                'id': this.getIDPrefix() + 'de-math-interactive-dimension-hack-div-container',
                'class': 'de-mathematics-interactive'
            });


            /*to calculate text height width*/
            var $deMathTextWrapper = $('<div>', {
                'id': this.getIDPrefix() + 'de-math-interactive-hack-text-div-wrapper'
            });

            var $deMathTextDiv = $('<div>', {
                'id': this.getIDPrefix() + 'de-math-interactive-hack-text-div',
                'style': 'float:initial;  min-height: initial;margin-left: initial;line-height:normal;'
            });

            $deMathTextWrapper.append($deMathTextDiv);
            $deMathHackContainer.append($deMathTextWrapper);

            /*to calculate div height width*/
            var $deMathdimensionWrapper = $('<div>', {
                'id': this.getIDPrefix() + 'de-math-interactive-hack-dimension-div-wrapper'
            });

            var $deMathdimensionDiv = $('<div>', {
                'id': this.getIDPrefix() + 'de-math-interactive-hack-dimension-div',
                'style': 'float:initial;  min-height: initial;margin-left: initial;line-height:normal;'
            });

            $deMathdimensionWrapper.append($deMathdimensionDiv);
            $deMathHackContainer.append($deMathdimensionWrapper);

            this.$el.append($deMathHackContainer);

            /*========================================================================*/

        },

        /*
        * Initialize header
        * @method _initializeHeader*/
        _initializeHeader: function () {

            //getting helpscreen templates
            var helpScreenTemplates = [], currentTemplate;

            for (var tabIndex = 0; tabIndex < this._tabsData.length; tabIndex++) {
                currentTemplate = this._tabsData[tabIndex].helpScreenTemplateData;
                if (currentTemplate !== undefined && currentTemplate !== null) {
                    helpScreenTemplates.push(currentTemplate);
                }
            }
            //generating headers
            var headerModel = new MathInteractives.Common.Player.Models.Header({
                parentModel: this.model,
                helpScreenTemplates: helpScreenTemplates,
                moduleName: this._moduleName,
                path: this._path,
                player: this,
                containerId: this.model.get('containerId'),
                manager: this._manager
            });
            var headerView = new MathInteractives.Common.Player.Views.Header({ model: headerModel, el: this.$el.find('.header-container') });
            this.screenShotModalView = new MathInteractives.Common.Player.Views.ScreenShotModal();
            this._header = headerView;
            headerModel.off('save-image').on('save-image', $.proxy(this.saveImage, this));
            headerModel.off('save-state').on('save-state', $.proxy(this.saveState, this));
            headerModel.off('tabs-drawer-click').on('tab-drawer-click', $.proxy(this._drawerAnimation, this));
            headerModel.off('help-click').on('help-click', $.proxy(this._getCurrentTab, this));
            headerModel.off('popout-click').on('popout-click', $.proxy(this._onPopoutBtnClick, this));
            this.screenShotModalView.off('screenShotNameEntered').on('screenShotNameEntered', $.proxy(this.screenShotNameEntered, this))
        },

        /**
        * Sets the interactiveModel property using data from config.model
        * @method _initializeInteractiveModel
        * @private
        */
        _initializeInteractiveModel: function _initializeInteractiveModel() {
            var currentModel = this._config.model,
                moduleName = this._moduleName, InteractiveModel, newSaveState = this._config.newSaveState, data,
                modelData = currentModel.data || {}, jsonData = this.model.get('jsonData');

            if (typeof currentModel.module !== 'undefined') {
                moduleName = currentModel.module;
            }

            //checks if the model to generate is from common interactive or from interactive folder
            // The commonInteractive prop decides the model
            if (currentModel.commonInteractive === true) {
                InteractiveModel = MathInteractives.Common.Interactivities[moduleName].Models[currentModel.class];
            }
            else {
                InteractiveModel = MathInteractives.Interactivities[moduleName].Models[currentModel.class];
            }

            if (typeof newSaveState !== 'undefined' && newSaveState === true) {
                data = this.model.get('initialState');
                if (typeof data === 'undefined' || data === null) {
                    data = {};
                }
                $.extend(data, {
                    jsonData: jsonData,
                    manager: this._manager,
                    player: this,
                    path: this._path
                });
            }
            else {
                data = {
                    jsonData: jsonData,
                    manager: this._manager,
                    player: this,
                    path: this._path,
                    savedState: this.model.get('initialState')
                };
            }

            //Merge additional data fetched from config for model 
            $.extend(data, modelData);
            this.interactiveModel = new InteractiveModel(data);
        },

        /*
        * Inserts new tab view to the tab container
        * @method _insertTab
        */
        _insertTab: function (tabID, activityAreaModel) {
            var defaultTab = this.model.get('defaultTab'),
                currentTabId = this.getIDPrefix() + 'player-tab-' + tabID,
                stepsData = this._stepsData,
                isStep = null,
                enabledTabs = [],
                lastTabIndex = 0, isAccessible = this.model.get('isAccessible'),
                startTabindex = this.model.get('startTabindex') || 0,
                tabindex = isAccessible ? this._manager.getTabIndex(currentTabId) : -1,
                _BROWSER_CHECK = MathInteractives.Common.Utilities.Models.BrowserCheck;

            if (stepsData) {
                lastTabIndex = this._tabsData.length - 1;
                isStep = this._stepsData.show;
                enabledTabs = this._stepsData.initialEnabledIndices;
            }

            var tabModel = new MathInteractives.Common.Player.Models.Tab({
                id: currentTabId,
                text: this._manager.getMessage(currentTabId, 0),
                activityAreaModel: activityAreaModel,
                playerView: this,
                path: this._path,
                isStep: isStep,
                enabledTabs: enabledTabs,
                lastTabIndex: lastTabIndex
            }),
                tabView = new MathInteractives.Common.Player.Views.Tab({
                    model: tabModel
                });

            this.tab.push(tabView.$el);
            this.$el.find('.tabs-container').append(tabView.$el);
            if (_BROWSER_CHECK.isIE || _BROWSER_CHECK.isIE11) {
                tabView.setMinWidthOfTextDiv();
            }

            if (this.getPlayerThemeType() === MathInteractives.Common.Player.Views.Player.THEMES.THEME_1) {
                /*Generate hack div of tab*/
                var hackDivOptions = {
                    elementId: currentTabId,
                    tabIndex: tabindex,
                    role: 'button',
                    offsetTop: -4,
                    offsetLeft: -4,
                    acc: this._manager.getAccMessage(currentTabId, 0)
                };
                this._manager.createAccDiv(hackDivOptions);
            }

            if (!tabModel.get('enable')) {
                this._manager.enableTab(currentTabId, false);
            }

            //pushing the tabModel to the collection
            this.model.get('tabCollection').push(tabModel);

            if (tabID === defaultTab) {
                this.model.set('currentTabView', tabView);
                this.model.set('currentActiveTab', tabID);
            }
            else {
                this.updateHeaderButtonsTabIndex();
            }

        },


        /*
        * Inserts new activity area view to the activity area container
        * @method _insertActivityArea
        */
        _insertActivityArea: function (activityAreaID, templateName, shadow, moduleName, uiClass) {
            var activityAreaModel = new MathInteractives.Common.Player.Models.ActivityArea({
                id: this.getIDPrefix() + 'activity-area-' + activityAreaID,
                shadow: shadow,
                moduleName: moduleName,
                prefix: this.getIDPrefix(),
                path: this._path,
                uiClass: uiClass
            });

            //Adding tab for respective activity area
            this._insertTab(activityAreaID, activityAreaModel);

            var activityAreaView = new MathInteractives.Common.Player.Views.ActivityArea({ model: activityAreaModel });

            this.$el.find('.activity-area-container').append(activityAreaView.el);

            //pushing the tabModel to the collection
            this.model.get('activityAreaCollection').push(activityAreaModel);
            this._activityAreaViews.push(activityAreaView);
        },

        /*
        * Default view of the player
        * @method _defaultSetupOfPlayer*/
        _defaultSetupOfPlayer: function () {
            var currentTabView = this.model.get('currentTabView'),
                initialTabsState = this.interactiveModel.get('initialTabsState') || [],
                noOfTabs = this._tabsData.length;

            this.tabClicked(currentTabView, { silent: true });

            //hiding tab container if only 1 tab present
            var noOfTabs = this.model.get('noOfTabs');
            if (noOfTabs === 1 || this.getPlayerThemeType() === MathInteractives.Common.Player.Views.Player.THEMES.THEME_2) {
                this.$el.find('.tabs-container').hide();
            }

            //Tabs enable/disable on load
            if (initialTabsState.length > 0) {
                for (var tabsIndex = 1; tabsIndex < noOfTabs; tabsIndex++) {
                    this.enableTab(initialTabsState[(tabsIndex - 1)], tabsIndex);
                }
            }

        },

        /*
        * Getter method for model property - 'isTabSwitchAllowed'.
        * @method getIsTabSwitchAllowed
        * @return {Boolean} Model property 'isTabSwitchAllowed'.
        */
        getIsTabSwitchAllowed: function getIsTabSwitchAllowed() {
            return this.model.get('isTabSwitchAllowed');
        },

        /*
        * Setter method for model property - 'isTabSwitchAllowed'.
        * @method setIsTabSwitchAllowed
        * @param {Boolean} Model property 'isTabSwitchAllowed'.
        */
        setIsTabSwitchAllowed: function setIsTabSwitchAllowed(value) {
            this.model.set('isTabSwitchAllowed', value);
        },

        /*
        * Click handler for tabs; Fires BEFORE_TAB_SWITCH_EVENT unless silent is passed as option.
        * @method _tabClickHandler
        * @param tabView {object}
        * @param [options] {Object} Optional parameters like 'silent' bundled into an object.
        **/
        tabClicked: function (tabView, options) {
            var self = this,
                currentTabId,
                themeType,
                idPrefix = self.getIDPrefix(),
                tabCollection = this.model.get('tabCollection'),
                PlayerEvents = MathInteractives.Common.Player.Views.Player.Events,
                OverviewTabEvents = null;

            themeType = this.getPlayerThemeType();
            if (!options || !(options.silent)) { // NOT(options && options.silent == true)
                this.trigger(MathInteractives.global.PlayerModel.BEFORE_TAB_SWITCH_EVENT, tabView._tabNumber);
            }

            if (this._step2FirstLoad && !options) {
                this.enableAllHeaderButtons(false);
                this._step2FirstLoad = false;
                OverviewTabEvents = MathInteractives.Common.Components.Theme2.Views.OverviewTab.Events;
                this._tabToSwitchAfterPreload = tabView._tabNumber;
                this._overviewTabInstance.trigger(OverviewTabEvents.SECOND_STEP_LOAD);
                if (this.soundManagerInstance) {
                    this.loadAudio();
                }
                else {
                    this.model.trigger(PlayerEvents.SECOND_STEP_START);
                }
                return;
            }

            if (this.getIsTabSwitchAllowed() === false) {
                this.setIsTabSwitchAllowed(true);   // set back to default true
                return;
            }

            if (tabView !== null && tabCollection.contains(tabView.model)) {
                //deactivate all tabs
                var tabAccTextMessageId = this.getPlayerThemeType() === MathInteractives.Common.Player.Views.Player.THEMES.THEME_2 ? 1 : 0;
                tabCollection.each(function (currentModel) {
                    currentModel.set('active', false);
                    //Bind click event to tab
                    currentModel.trigger(currentModel.ATTACH_EVENTS, true);

                    currentTabId = currentModel.id;
                    self._manager.setAccMessage(currentTabId, self._manager.getAccMessage(currentTabId.split(idPrefix)[1], 0) + " " + self._manager.getAccMessage('unSelected-tab-btn-acc-text', tabAccTextMessageId));
                });

                //activate current tab
                tabView.model.set('active', true);
                //Unbind click event from current tab
                tabView.model.trigger(tabView.model.ATTACH_EVENTS, false);
                currentTabId = tabView.model.id;
                //enables/disables help button for theme2.
                if (themeType === 2) {
                    this._enableHelpForTheme2(tabView._tabNumber, tabView.model);
                }
                if (tabView._tabNumber === 0 && this._step2FirstLoad !== true) {
                    this._manager.setFocus(idPrefix + 'overview-readable-text-region');
                }
                //handles help screen visibility on tab switch.
                this._handleHelpScreenVisibilityOnTabSwitch(tabView._tabNumber, tabView.model);

                self._manager.setAccMessage(currentTabId, self._manager.getAccMessage(currentTabId.split(idPrefix)[1], 0) + " " + self._manager.getAccMessage('Selected-tab-btn-acc-text', tabAccTextMessageId));
            }
            //this.$('.header-subtitle').html(this._manager.getMessage(currentTabId, 0));
            this._manager.setMessage(this.getIDPrefix() + 'header-subtitle', this._manager.getMessage(currentTabId, 0));
            this._manager.setAccMessage(this.getIDPrefix() + 'header-subtitle', this._manager.getAccMessage(currentTabId, 0));
            if (typeof options === 'undefined' || !options.silent) {
                this._header.$('.header-tab-drawer-btn').trigger('click');
            }
            if (themeType === 2) {
                if (this._header.isTabDrawerClicked) {
                    this._hideDrawer();
                }
            }
        },

        /*
        * Handle selected tab click event to set focus 
        * @method selectedTabClicked
        * @param null
        */
        selectedTabClicked: function selectedTabClicked() {
            this._isSelectedTabClicked = true;
        },

        /*
        * Change tab to given index (starts from 0)
        * @method switchToTab
        * @param tabIndex number
        */
        switchToTab: function (tabIndex) {
            var self = this,
                currentTabId,
                themeType,
                tabCollection = this.model.get('tabCollection'),
                idPrefix = this.getIDPrefix(),
                id = idPrefix + 'player-tab-' + tabIndex,
                requiredTabModel = tabCollection.get(id),
                isTabEnabled = true,
                PlayerEvents = MathInteractives.Common.Player.Views.Player.Events;

            themeType = this.getPlayerThemeType();
            if (requiredTabModel !== undefined) {
                //handle the step 2 loading event and starts the preloading of data
                if (this._step2FirstLoad) {
                    this._step2FirstLoad = false;
                    this._tabToSwitchAfterPreload = tabIndex;
                    if (this.soundManagerInstance) {
                        this.loadAudio();
                    }
                    else {
                        this.model.trigger(PlayerEvents.SECOND_STEP_START);
                    }
                    return;
                }

                var tabAccTextMessageId = this.getPlayerThemeType() === MathInteractives.Common.Player.Views.Player.THEMES.THEME_2 ? 1 : 0;

                //deactivate all tabs
                tabCollection.each(function (currentModel) {

                    currentModel.set('active', false);
                    //Bind click event to tab
                    currentModel.trigger(currentModel.ATTACH_EVENTS, true);
                    currentTabId = currentModel.id;
                    self._manager.setAccMessage(currentTabId, self._manager.getAccMessage(currentTabId.split(idPrefix)[1], 0) + " " + self._manager.getAccMessage('unSelected-tab-btn-acc-text', tabAccTextMessageId));

                    if (!currentModel.get('enable') && currentModel.id === id) {
                        isTabEnabled = false;
                        return;
                    }
                });

                if (isTabEnabled) {
                    //activate the given tab
                    requiredTabModel.set('active', true);
                    //Unbind click event from current tab
                    requiredTabModel.trigger(requiredTabModel.ATTACH_EVENTS, false);
                    //enables/disables help button for theme2.
                    if (themeType === 2) {
                        self._enableHelpForTheme2(tabIndex, requiredTabModel);
                    }
                    //handles help screen visibility on tab switch.
                    self._handleHelpScreenVisibilityOnTabSwitch(tabIndex, requiredTabModel);
                    //this.$('.header-subtitle').html(this._manager.getMessage(id, 0));
                    this._manager.setMessage(this.getIDPrefix() + 'header-subtitle', this._manager.getMessage(id, 0));
                    this._manager.setAccMessage(this.getIDPrefix() + 'header-subtitle', this._manager.getAccMessage(id, 0));
                    currentTabId = requiredTabModel.id;
                    self._manager.setAccMessage(currentTabId, self._manager.getAccMessage(currentTabId.split(idPrefix)[1], 0) + " " + self._manager.getAccMessage('Selected-tab-btn-acc-text', tabAccTextMessageId));
                }
                else {
                    this.switchToTab(tabIndex - 1);
                }
            }
            if (themeType === 2) {
                if (this._header.isTabDrawerClicked) {
                    this._hideDrawer();
                }
            }
        },

        /*
        * Enable/Disable help button for theme2.
        * @method _enableHelpForTheme2
        * @param {Number} number of current tab.
        */
        _enableHelpForTheme2: function (tabNumber, currentTabModel) {
            var tabIndex = tabNumber, isHelpEnabled;

            isHelpEnabled = (tabIndex === 0) ? false : currentTabModel.get('isHelpEnabled');
            this.enableHelp(isHelpEnabled);
        },

        /*
        * Handles help screen visibility on tab switch.
        * @method _handleHelpScreenVisibilityOnTabSwitch
        * @param {Number} number of current tab.
        * @param {object} model of current tab.
        */
        _handleHelpScreenVisibilityOnTabSwitch: function (tabNumber, currentTabModel) {
            var tabIndex,
                tabModel,
                isHelpScrShown,
                helpView = this._header._helpView;

            tabIndex = tabNumber;
            tabModel = currentTabModel;
            isHelpScrShown = tabModel.get('isHelpScreenShown');

            if (helpView !== undefined && helpView !== null) {
                if (tabIndex === 0) {
                    this._header._helpView.hideHelpTooltip();
                }
                else {
                    this._header._helpView.hideHelpTooltip();
                    if (isHelpScrShown) {
                        this._header._helpView.showHelpTooltip();
                        this._header._helpBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_SELECTED);
                    }
                }
            }
        },

        /*
        * Change step to given index (starts from 0)
        * @method switchToStep
        * @param stepIndex number
        */
        switchToStep: function switchToStep(stepIndex) {
            this.switchToTab(stepIndex);
        },

        /*
        * Push current tab content passed by config file
        * @method _pushCurrentTabContent
        */
        _pushCurrentTabContent: function (activityAreaIndex) {

            var currentTabData = this._tabsData[activityAreaIndex],
                moduleName = this._moduleName,
                InteractiveView = null, el = null, $el = null,
                activityAreaView = this._activityAreaViews[activityAreaIndex],
                OverviewTab = null, template, templateData = null;

            if (typeof currentTabData.module !== 'undefined') {
                moduleName = currentTabData.module;
            }


            if (currentTabData.commonInteractive === true) {
                //Initiates the view using the class from common interactive
                // For this the templates also need to be at common level
                template = MathInteractives.Common.Interactivities[moduleName].templates[currentTabData.templateName];
                InteractiveView = MathInteractives.Common.Interactivities[moduleName].Views[currentTabData.view.class];
            } else {
                template = MathInteractives.Interactivities[moduleName].templates[currentTabData.templateName];
                InteractiveView = MathInteractives.Interactivities[moduleName].Views[currentTabData.view.class];
            }

            //Pushing current template into DOM
            templateData = typeof currentTabData.templateData !== 'undefined' ? currentTabData.templateData : {};
            templateData.idPrefix = this.getIDPrefix()
            activityAreaView.$el.append(template(templateData).trim());

            el = currentTabData.view.data.el;
            $el = this.$(el);
            //checks for passed el length, if its 0 then idPrefix is appended 
            // and set as view el
            if ($el.length === 0) {
                el = el.replace(/\#/g, '#' + this.getIDPrefix());
                $el = this.$(el);
            }
            // checks if the current tab is an overview tab and if so generates the overview tab
            if (currentTabData.overviewTabData !== null && currentTabData.overviewTabData !== undefined) {
                var overviewData = {
                    id: el.replace('#', ''),
                    idPrefix: this.getIDPrefix(),
                    manager: this._manager,
                    player: this,
                    path: this._path,
                    screenID: currentTabData.overviewTabData.screenID,
                    leftImageContainerID: currentTabData.overviewTabData.leftImageContainerID,
                    audioFileDataMap: this.model.get('audioFileDataMap')
                };
                if (currentTabData.overviewTabData.focusOnHeader != null) {
                    overviewData.focusOnHeader = currentTabData.overviewTabData.focusOnHeader;
                }
                var OverviewTab = MathInteractives.global.Theme2.OverviewTab,
                overviewTabView = OverviewTab.generateOverviewTab(overviewData);
                this._overviewTabInstance = overviewTabView;
                //this.listenTo(overviewTabView, OverviewTab.Events.GO_BUTTON_CLICKED, this.onGoButtonClicked);
            }
            var interactiveView = new InteractiveView({ el: $el, model: this.interactiveModel });
            this.interactiveModel.off('save-state').on('save-state', $.proxy(this.getCurrentStateData, this));
        },

        /*
        * Updates json data of interactive model on step 2 load complete
        * @method _updateInteractiveModelJsonData
        * @private
        */
        _updateInteractiveModelJsonData: function _updateInteractiveModelJsonData() {
            var jsonData = this.model.get('jsonData');
            this.interactiveModel.set('jsonData', jsonData, true);
        },

        /*
        * Callback on step 2 preload complete
        * @method _step2PreloadComplete
        * @event
        * @private
        */
        _step2PreloadComplete: function _step2PreloadComplete(event) {
            var OverviewTabEvents = MathInteractives.Common.Components.Theme2.Views.OverviewTab.Events,
                overviewTabView = this._overviewTabInstance;
            this.enableAllHeaderButtons(true);
            this._updateInteractiveModelJsonData();
            this._initiateRemainingInteractive();
            if (this._config.isSaveStateCheckEnabled) {
                this._updatePreviousSaveState();
            }
            this.switchToTab(this._tabToSwitchAfterPreload);

            //This event is listened on interactive level as and when required
            this.trigger(PlayerClass.Events.SECOND_STEP_INTERACTIVE_LOAD_COMPLETE, event);

            if (overviewTabView) {
                overviewTabView.trigger(OverviewTabEvents.SECOND_STEP_COMPLETE, event);
            }
        },

        /*
        * Callback on step 2 preload progress
        * @method _step2PreloadProgress
        * @event
        * @private
        */
        _step2PreloadProgress: function _step2PreloadProgress(event) {
            var OverviewTabEvents = MathInteractives.Common.Components.Theme2.Views.OverviewTab.Events,
                overviewTabView = this._overviewTabInstance;
            if (overviewTabView) {
                overviewTabView.trigger(OverviewTabEvents.SECOND_STEP_PROGRESS, event);
            }
        },

        /*
        * Callback on step 2 preload error
        * @method _step2PreloadProgress
        * @event
        * @private
        */
        _step2PreloadError: function _step2PreloadError(event) {
            var OverviewTabEvents = MathInteractives.Common.Components.Theme2.Views.OverviewTab.Events,
                overviewTabView = this._overviewTabInstance;
            if (overviewTabView) {
                overviewTabView.trigger(OverviewTabEvents.SECOND_STEP_ERROR, event);
            }
        },

        /*
        * Initiate the remaining tabs after completion of step 2 preload
        * @method _initiateRemainingInteractive
        * @private
        */
        _initiateRemainingInteractive: function _initiateRemainingInteractive() {
            var activityAreaViews = this._activityAreaViews, index;

            for (index = 1; index < activityAreaViews.length; index++) {
                this._pushCurrentTabContent(index);
            }
        },

        /*
        * Updates the previous save state to the current state of the interactive
        * This is used to decide whether to show a clear data pop-up or not after comparison
        * @method _updatePreviousSaveState
        * @param tabIndexToCompare {Number} Stores the index of tab for comparison
        * @private
        */
        _updatePreviousSaveState: function (tabIndexToCompare) {
            var activeTab = (typeof tabIndexToCompare === 'undefined') ? this.model.getCurrentActiveTab() : tabIndexToCompare,
                attrForSaveStateComparison = this.model.getAttrsForSaveStateComparison()[activeTab],
                attrsToIgnore = this.interactiveModel.get('attributesToIgnore'),
                previousSaveState = null,
                previousSaveStateObj = null;

            if (attrForSaveStateComparison) {
                previousSaveStateObj = JSON.parse(this.model.get('previousSaveState'));
                previousSaveStateObj[attrForSaveStateComparison] = $.extend(true, {}, this.interactiveModel.attributes[attrForSaveStateComparison]);
                previousSaveState = this.model.ignoreAttrsForSaveState(previousSaveStateObj, attrsToIgnore);
            } else {
                previousSaveState = this.model.ignoreAttrsForSaveState($.extend(true, {}, this.interactiveModel.attributes), attrsToIgnore);
            }

            this.model.set('previousSaveState', previousSaveState);
        },

        /**
        * Sends the click event of go button from overview tab to the interactive. And switch to the next tab or the tab provided in resume
        * @method onGoButtonClicked
        * @param overviewTab{Backbone.View} the view of the overview tab
        * @type private
        */
        onGoButtonClicked: function onGoButtonClicked(overviewTab) {
            var tabIndex = (this.getCurrentActiveTab() + 1),
                OverviewTabEvents = MathInteractives.Common.Components.Theme2.Views.OverviewTab.Events;

            if (this._step2FirstLoad) {
                this.enableAllHeaderButtons(false);
                tabIndex = this.interactiveModel.get('currentTab') || tabIndex;
                overviewTab.trigger(OverviewTabEvents.SECOND_STEP_LOAD);
            }

            this.trigger(OverviewTabEvents.GO_BUTTON_CLICKED, overviewTab);
            this.isLetsGoClicked = true;
            this.switchToTab(tabIndex);
        },
        /**
        * Triggers 'save-state' event on model.
        * @method getCurrentStateData
        */
        getCurrentStateData: function () {
            this.model.trigger('save-state', { interactiveGuid: this.model.get('interactiveId') });
        },

        /**
        * Triggers 'save-image' event on model.
        * @method saveImage
        */
        saveImage: function (event) {
            this.screenShotModalView.open(event.base64Image);
        },

        screenShotNameEntered: function (event) {
            this.model.trigger('save-image', event);
        },

        saveState: function saveState() {
            this.model.trigger('save-state', { interactiveGuid: this.model.get('interactiveId') });
        },

        /**
        * Triggers 'pop-out' event on model.
        * @method popoutInteractive
        */
        popoutInteractive: function popoutInteractive(startOver) {
            this.model.trigger('pop-out', { interactiveGuid: this.model.get('interactiveId'), containerId: '', data: { startover: startOver } });
        },


        /*save operation error event handler
        * @method _onSaveOperationError
        * @event
        * @private
        */
        _onSaveOperationError: function _onSaveOperationError(event) {
            // rollback previous save state
            this.model.rollbackSaveState();
            this._generatePopupOnSaveStateError(event);
            this._clearTaskStack();
        },

        /*save operation error event handler
        * @method _onSaveOperationSuccess
        * @event
        * @private
        */
        _onSaveOperationSuccess: function _onSaveOperationSuccess(event) {
            // perform pending tasks
            this._performPendingTasks();
        },

        /*Adds a single task to stack
        * @method _addTaskToStack
        * @private
        */
        _addTaskToStack: function _addTaskToStack(task) {
            if (typeof task === 'undefined' || task === null || typeof task.notification === 'undefined' ||
                task.notification === null) {
                return false;
            }
            this.taskStack.push(task);
            return true;
        },

        /*clear task stack
        * @method _clearTaskStack
        * @private
        */
        _clearTaskStack: function _clearTaskStack() {
            this.taskStack.splice(0, this.taskStack.length);
        },

        /*Performs pending tasks
        * @method _performPendingTaskss
        * @private
        */
        _performPendingTasks: function _performPendingTasks() {
            var task = null;
            while (this.taskStack.length > 0) {
                task = this.taskStack.pop();
                this._performTask(task);
            }
        },

        /*Performs single task
        * @method _performTask
        * @private
        */
        _performTask: function _performTask(task) {
            if (typeof task === 'undefined' || task === null) {
                return;
            }
            var notificationCodes = MathInteractives.Common.Player.Views.Player.TASK_NOTIFICATIONS;
            switch (task.notification) {
                case notificationCodes.POPOUT_INTERACTIVE:
                    {
                        if (typeof task.data === 'function') {
                            task.data.apply();
                        }
                    }
                    break;
            }
        },

        /*generates popup on save state error.
        * @method _generatePopup
        * @param {object} error messages data
        * @private
        */
        _generatePopupOnSaveStateError: function _generatePopupOnSaveStateError(errorMsg) {
            var options, saveStatepopup, themeType, manager;
            manager = this.getManager();

            manager.unloadScreen('save-state-popup', this.getIDPrefix());
            manager.loadScreen('save-state-popup', this.getIDPrefix());
            themeType = this.getPlayerThemeType();
            Player = MathInteractives.Common.Player.Views.Player;

            switch (themeType) {
                case Player.THEMES.THEME_1:
                    {
                        options = {
                            player: this,
                            path: this._path,
                            manager: manager,
                            idPrefix: this.getIDPrefix(),
                            title: errorMsg.title,
                            accTitle: errorMsg.accTitle,
                            text: errorMsg.text,
                            accText: errorMsg.accText,
                            buttons: [{
                                id: 'save-state-popup-ok-btn',
                                text: manager.getMessage('save-state-popup-ok-btn', 0),
                                response: { isPositive: true, buttonClicked: 'save-state-popup-ok-btn' }
                            }]
                        }
                        saveStatepopup = MathInteractives.global.PlayerPopup.createPopup(options);
                        break;
                    }
                case Player.THEMES.THEME_2:
                    {
                        options = {
                            title: errorMsg.title,
                            accTitle: errorMsg.accTitle,
                            text: errorMsg.text,
                            accText: errorMsg.accText,
                            manager: manager,
                            idPrefix: this.getIDPrefix(),
                            player: this,
                            path: this._path,
                            type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                            buttons: [{
                                id: 'save-state-popup-ok-btn',
                                text: manager.getMessage('save-state-popup-ok-btn', 0),
                                response: { isPositive: true, buttonClicked: 'save-state-popup-ok-btn' }
                            }]
                        };
                        saveStatepopup = MathInteractives.global.Theme2.PopUpBox.createPopup(options);
                        saveStatepopup.$el.addClass('save-popout-feature-popup');
                        break;
                    }
            }
        },

        /*Listens the Drawer button click to open/close tabs container
        * @method _drawerAnimation
        * @private
        * @event
        */
        _drawerAnimation: function _drawerAnimation(event, isDrawerVisible) {

            if (!isDrawerVisible) {
                this._showDrawer();
            }
            else {
                this._hideDrawer();
            }

        },

        /*
        * Starts animation to show tab drawer
        * @method _showDrawer
        * @private
        */
        _showDrawer: function _showDrawer() {
            var self = this;
            var isBrowserIE = this._isIE9(),
            $tabsCont = this.$('.tabs-container');

            this.$('.header-tab-drawer-btn').data('isDrawerVisible', true);
            if (isBrowserIE === true) {
                this.$('.tabs-container').show();
                $tabsCont.stop().animate({ left: '0px' }, {
                    duration: 500,
                    step: function (now, fx) {
                        //hamburger menu show animation starts at point -250px. 
                        if (fx.start === -250) {
                            self._drawerAnimationStartCallback('show');
                        }
                    },
                    complete: $.proxy(function () { this._drawerAnimationCompleteCallback('show') }, this)
                });
            }
            else {
                $tabsCont.show().off('animationstart webkitAnimationStart MSAnimationStart oAnimationStart').on('animationstart webkitAnimationStart MSAnimationStart oAnimationStart',
                $.proxy(function () { this._drawerAnimationStartCallback('show') }, this))
                .addClass('tabs-container-animation');

                $tabsCont.off('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd',
                $.proxy(function () { this._drawerAnimationCompleteCallback('show') }, this))
                .removeClass('tabs-container-animation-reverse').addClass('tabs-container-animation');

            }
        },

        /*
        * Starts animation to hide tab drawer
        * @method _hideDrawer
        * @private
        */
        _hideDrawer: function _hideDrawer() {
            var self = this, isBrowserIE = this._isIE9(),
            $tabsCont = this.$('.tabs-container');
            this.$('.header-tab-drawer-btn').data('isDrawerVisible', false);
            if (isBrowserIE === true) {
                $tabsCont.stop().animate({ left: '-250px' }, {
                    duration: 500,
                    step: function (now, fx) {
                        //hamburger menu hide animation starts at point 0px.
                        if (fx.start === 0) {
                            self._drawerAnimationStartCallback('hide');
                        }
                    },
                    complete: $.proxy(function () { this._drawerAnimationCompleteCallback('hide') }, this)
                });
            }
            else {
                $tabsCont.off('animationstart webkitAnimationStart MSAnimationStart oAnimationStart').on('animationstart webkitAnimationStart MSAnimationStart oAnimationStart',
                $.proxy(function () { this._drawerAnimationStartCallback('hide') }, this)).addClass('tabs-container-animation-reverse');

                $tabsCont.off('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd',
                $.proxy(function () { this._drawerAnimationCompleteCallback('hide') }, this))
                .removeClass('tabs-container-animation').addClass('tabs-container-animation-reverse');
            }
            //            if (this._header._drawerBtn) {
            //                this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            //            }
        },

        /*
        * Checks whether the current browser is IE9
        * @method _isIE9
        * @private
        */
        _isIE9: function _isIE9() {
            var BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
            IE = BrowserCheck.isIE,
            ieVersion = BrowserCheck.browserVersion,
            isIE9 = (IE === true && ieVersion === '9.0');
            return isIE9;
        },

        /*
        * Sets position of tabs container after animation
        * @method _setTabContainerPosition
        * @private
        */
        _setTabContainerPosition: function _setTabContainerPosition() {
            var $tabsCont = this.$('.tabs-container');
            if ($tabsCont.hasClass('tabs-container-animation')) {
                $tabsCont.css('left', '0px');
            }
            else if ($tabsCont.hasClass('tabs-container-animation-reverse')) {
                $tabsCont.css('left', '-250px');
            }
        },

        /*
        * Handles complete call back of animation completion
        * @method _drawerAnimationCompleteCallback
        * @private
        */
        _drawerAnimationCompleteCallback: function _drawerAnimationCompleteCallback(state) {
            //debugger;
            var isBrowserIE = this._isIE9();
            if (this._header._drawerBtn) {
                var self = this,
                    tabCollection = this.model.get('tabCollection');
                switch (state) {
                    case 'hide':
                        {
                            this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);

                            if (this._isSelectedTabClicked) {
                                this._isSelectedTabClicked = false;
                                this._manager.setFocus(this.getIDPrefix() + 'header-tab-drawer-btn', 0);
                            }
                            this.$('.tabs-container').hide();
                            break;
                        }
                    case 'show':
                        {
                            this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_SELECTED);

                            this._manager.setFocus(this.getIDPrefix() + 'player-tab-0');
                            break;
                        }
                }
            }
            if (!isBrowserIE) {
                this._setTabContainerPosition();
            }
            this._header.enableTabDrawer(this.model.get('isDrawerButtonEnable'));
            this._header.enableHeaderSubtitle(true);
        },

        /*
        * Handles call back of animation start
        * @method _drawerAnimationStartCallback
        * @private
        */
        _drawerAnimationStartCallback: function _drawerAnimationStartCallback(state) {
            //debugger;
            var isBrowserIE = this._isIE9();

            if (this._header._drawerBtn) {
                switch (state) {
                    case 'hide':
                        {
                            this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                            break;
                        }
                    case 'show':
                        {
                            this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_SELECTED);
                            break;
                        }
                }
            }
            //if (!isBrowserIE) {
            this._header.enableTabDrawer(false);
            this._header.enableHeaderSubtitle(false);
            //}

        },

        /*
        * Gets value of currentab.
        * @method _getCurrentTab
        * @private
        */
        _getCurrentTab: function () {
            var currentTab = this.getCurrentActiveTab();
            this._currentActiveTab = currentTab;

            var currentTabView = this.model.get('currentTabView');
            currentTabView.model.set('isHelpScreenShown', this._header.isHelpScreenShown);
        },

        /*
        * Enable all tab events
        * @method enableTab
        * @param {bool} enable
        * @param {Number} index given to enable/disable perticular tab or chain of tabs in steps
        * @param {bool} isStep determines if steps used
        */
        enableTab: function (enable, index, isSteps) {
            var tabCollection = this.model.get('tabCollection'),
                self = this;

            if (typeof index === 'undefined') {
                //disable all tabs
                tabCollection.each(function (currentModel) {
                    currentModel.set('enable', enable);
                    self._manager.enableTab(currentModel.get('id'), enable);

                });
            }
            else {
                tabCollection.models[index].set('enable', enable);
                self._manager.enableTab(tabCollection.models[index].get('id'), enable);

                // If steps are used enable/disable chain joining steps with given index to first/last index
                if (isSteps === true) {
                    if (enable === true) {
                        for (var stepIndex = 0; stepIndex <= index; stepIndex++) {
                            tabCollection.models[stepIndex].set('enable', true);
                            self._manager.enableTab(tabCollection.models[stepIndex].get('id'), true);
                        }
                    }
                    else if (enable === false) {
                        var lastTabIndex = this._tabsData.length - 1;
                        for (var stepIndex = lastTabIndex; stepIndex >= index; stepIndex--) {
                            tabCollection.models[stepIndex].set('enable', false);
                            self._manager.enableTab(tabCollection.models[stepIndex].get('id'), false);
                        }
                    }
                }
            }
        },

        /*
        * Enable/Disable step with given index
        * @method enableTab
        * @param {Boolean} enable
        * @param {Number} stepIndex if stepIndex not given all steps will affect
        */
        enableStep: function enableStep(enable, stepIndex) {
            this.enableTab(enable, stepIndex, true);
        },

        /*
        * Returns true/false if tab is enable/disable.
        * @method isTabEnabled
        * @param {Number} tab index.
        * @return enable {bool}  
        */
        isTabEnabled: function isTabEnabled(index) {
            var tabCollection = this.model.get('tabCollection'),
                enable = tabCollection.models[index].get('enable');
            return enable;
        },

        /*
        * Returns enabled step index of last enabled step.
        * @method getLastEnabledStep
        * @return {Number} step index of last enabled step.
        */
        getLastEnabledStep: function getLastEnabledStep() {
            var tabCollection = this.model.get('tabCollection'),
                lastEnabledStep = null,
                currentTabId = null;

            tabCollection.each(function (currentmodel) {
                if (currentmodel.get('enable') === true) {
                    currentTabId = parseInt(currentmodel.get('id').substr(currentmodel.get('id').length - 1, 1), 10);
                    if (lastEnabledStep == null || currentTabId > lastEnabledStep) {
                        lastEnabledStep = currentTabId
                    }
                }
            });

            return lastEnabledStep;
        },

        /*
        * Set function callbeck and scope to a local property
        * It  stores the event callbacks of specific tab in _tabChangeData object, and callback the function depending on the current tab
        * @method bindTabChange
        * @param {object} callbackFnc function to be called
        * @param {object} scope in which the function to be called
        * @param {number} tabIndex index of tab in which the callback to be called
        * @public
        */
        bindTabChange: function (callbackFnc, scope, tabIndex) {
            if (tabIndex !== undefined) {
                if (this._tabChangeData === null) {
                    this._tabChangeData = {};
                }
                this._tabChangeData[tabIndex] = { fnc: callbackFnc, scope: scope };
            }
        },

        /*
        * Set function callbeck and scope to a local property
        * 
        * @method bindStepChange
        * @param {object} callbackFnc function to be called
        * @param {object} scope in which the function to be called
        * @param {number} stepIndex index of tab in which the callback to be called
        * @public
        */
        bindStepChange: function (callbackFnc, scope, stepIndex) {
            this.bindTabChange(callbackFnc, scope, stepIndex);
        },

        /*
        * Callback on tab change
        * @method tabChangeEvent
        * 
        */
        _tabChangeEvent: function () {
            MathInteractives.global.SpeechStream.stopReading();
            this._header.model.set('currentTemplate', null);
            //this.enableHelp(true);
            var currentActiveTab = this.model.get('currentActiveTab');
            var tabChangeData = this._tabChangeData;

            if (tabChangeData !== null && tabChangeData.hasOwnProperty(currentActiveTab)) {
                var parameters = {
                    'currentActiveTab': currentActiveTab,
                    'isLetsGoClicked': this.isLetsGoClicked
                }
                tabChangeData[currentActiveTab].fnc.apply(tabChangeData[currentActiveTab].scope || this, [parameters]);
                this.isLetsGoClicked = false;
            }
            this.updateHeaderButtonsTabIndex();
        },

        /*
        * Update header buttons tab-index according to next tab so that header buttons are accessible before focus goes to next tab
        * @method updateHeaderButtonsTabIndex
        * @param 
        * @public 
        */
        updateHeaderButtonsTabIndex: function updateHeaderButtonsTabIndex() {
            var currentActiveTab = this.model.get('currentActiveTab'),
                nextTabId = 'player-tab-' + (currentActiveTab + 1),
                hasNextTab = this.$('#' + this.getIDPrefix() + nextTabId).length > 0 ? true : false,
                nextTabIndex = this._manager.getTabIndex(nextTabId);

            switch (this.getPlayerThemeType()) {
                case MathInteractives.Common.Player.Views.Player.THEMES.THEME_1:
                    {
                        if (hasNextTab && nextTabIndex) {
                            this._manager.setTabIndex(this.getIDPrefix() + 'save-btn', nextTabIndex - 50);
                            this._manager.setTabIndex(this.getIDPrefix() + 'screen-shot-btn', nextTabIndex - 40);
                            this._manager.setTabIndex(this.getIDPrefix() + 'help-btn', nextTabIndex - 30);
                        }
                        else {
                            this._manager.unloadScreen('theme-1-header-buttons', this.getIDPrefix());
                            this._manager.loadScreen('theme-1-header-buttons', this.getIDPrefix());
                        }
                        break;
                    }
                case MathInteractives.Common.Player.Views.Player.THEMES.THEME_2:
                    {
                        this._manager.unloadScreen('theme-2-header-buttons', this.getIDPrefix());
                        this._manager.loadScreen('theme-2-header-buttons', this.getIDPrefix());
                        break;
                    }
            }

        },

        /*
        * Enable/Disable help button
        * @method enableHelp
        * @param {bool} enable
        * @public 
        */
        enableHelp: function (enable) {
            var index, tabCollection, currentTab;
            if (enable !== undefined && enable !== null) {
                this._header.enableHelp(enable);
            }
            index = this.getCurrentActiveTab();
            tabCollection = this.model.get('tabCollection');
            currentTabModel = tabCollection.models[index]
            currentTabModel.set('isHelpEnabled', enable);
        },

        /*
        * Enable/Disable help for perticular element
        * @method enableHelp
        * @param {String} element id 
        * @param {String} message id
        * @param {bool} bEnableHelp
        * @public 
        */
        enableHelpElement: function (eleId, msgId, bEnableHelp) {
            this._header.trigger(MathInteractives.Common.Player.Views.Player.Events.TOGGLE_ELEMENT_HELP
                    , { eleId: eleId, msgId: msgId, bEnableHelp: bEnableHelp });
        },

        /*
        * Changes Element help text
        * @method changeHelpElementText
        * @param {String} element id 
        * @param {String} message id
        * @param {String} new message text
        * @public 
        */
        changeHelpElementText: function (eleId, msgId, text, accText) {
            this._header.trigger(MathInteractives.Common.Player.Views.Player.Events.CHANGE_HELP_TEXT
                    , { eleId: eleId, msgId: msgId, text: text, accText: accText });
        },

        /*
        * Enable/Disable screen shot button
        * @method enableScreenShot
        * @param {bool} enable
        * @public 
        */
        enableScreenShot: function (enable) {
            if (enable !== undefined && enable !== null) {
                this._header.enableScreenShot(enable);
            }
        },

        /*
        * Enable/Disable save button
        * @method enableSave
        * @param {bool} enable
        * @public 
        */
        enableSave: function (enable) {
            if (enable !== undefined && enable !== null) {
                this._header.enableSave(enable);
            }
        },

        /*
        * Enable/Disable header button
        * @method enableHeaderButtons
        * @param {bool} enable
        * @public 
        */
        enableHeaderButtons: function enableHeaderButtons(enable) {
            if (enable !== undefined && enable !== null) {
                this._header.enableHeaderButtons(enable);
            }
        },

        /*
        * Enable/Disable All header button
        * @method enableAllHeaderButtons
        * @param {bool} enable
        * @public 
        */
        enableAllHeaderButtons: function enableAllHeaderButtons(enable) {
            if (enable !== undefined && enable !== null) {
                this._header.enableAllHeaderButtons(enable);
                this.model.set('isDrawerButtonEnable', enable);
            }
        },

        /*
        * Changes help screen 
        * @method changeHelpScreen
        * @param {Object} templateData Data for template which is to be appended in the help screen
        * @public 
        */
        changeHelpScreen: function (templateData) {
            this._header.model.set('currentTemplate', templateData);
        },


        /*
        * apply show callback for help screen
        * @method applyShowCallbackForHelpScreen
        * @param {object} showCallbackProps contains {fnc:function(){},scope: scope in which the function to be called}
        * @public 
        */
        applyShowCallbackForHelpScreen: function (showCallbackProps) {
            this._header.model.set('helpScreenShowCallback', showCallbackProps);
        },


        /*
        * apply close callback for help screen
        * @method applyCloseCallbackForHelpScreen
        * @param {object} closeCallbackProps contains {fnc:function(){},scope: scope in which the function to be called}
        * @public 
        */
        applyCloseCallbackForHelpScreen: function (showCallbackProps) {
            this._header.model.set('helpScreenCloseCallback', showCallbackProps);
        },


        /*
        * returns ID prefix for the interactive
        * @method getIDPrefix
        * @return {string} id to prefix
        * @public 
        */
        getIDPrefix: function () {
            return this.model.get('prefix');
        },

        /*
        * returns manager instance of the interactive
        * @method getManager
        * @return {object} manager instance
        * @public 
        */
        getManager: function getManager() {
            return this._manager;
        },

        /*
        * returns sound manager instance of the interactive
        * @method getSoundManager
        * @return {object} sound manager instance
        * @public 
        */
        getSoundManager: function getSoundManager() {
            return this.soundManagerInstance;
        },

        /*
        * returns path instance of the interactive
        * @method getPath
        * @return {object} path instance
        * @public 
        */
        getPath: function getPath() {
            return this._path;
        },


        _restrictTextSelection: function _restrictTextSelection() {
            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this.$el[0].onselectstart = function (event) {
                    var tagName = event.target.nodeName.toLowerCase();
                    var tagType;
                    if (event.target.type) {
                        tagType = event.target.type.toLowerCase();
                    }

                    if (tagName != 'input' && tagType != 'text' && tagName != 'textarea') {
                        return false;
                    }
                };
                //  document.onmousedown = function () { return false; };
            }
        },

        /**
        * Gets the model's property 'modalPresent' - a boolean indicating if a modal is present.
        * @method getModalPresent
        * @return {Boolean} True if a modal is present
        */
        getModalPresent: function getModalPresent() {
            return this.model.getModalPresent();
        },

        /**
        * Sets the model's property 'modalPresent' - a boolean indicating if a modal is present.
        * @method setModalPresent
        * @param value {Boolean} True if a modal is present
        */
        setModalPresent: function setModalPresent(value) {
            this.model.setModalPresent(value);
        },

        /**
        * Getter function for mute property
        * @method getIsMuted
        * @return {Boolean} True if sound is muted
        */
        getIsMuted: function () {
            return this._header.model.get('isMuted');
        },

        /**
        * Setter function for mute property
        * @method setIsMuted
        * @param value {Boolean} True if sound is muted
        */
        setIsMuted: function (value) {
            this._header.model.set('isMuted', value);
        },

        /**
        * Getter function for 'currentActiveTab'.
        * @method getCurrentActiveTab
        * @return {Object} Tab ID
        */
        getCurrentActiveTab: function getCurrentActiveTab() {
            return this.model.getCurrentActiveTab();
        },

        /**
        * Adjust all tabs width to same width
        * 
        * @method _adjustTabWidth
        * @private
        */
        _adjustTabWidth: function _adjustTabWidth() {

            var noOfTabs = this._tabsData.length,
                tabWidth1,
                tabWidth0;

            if (noOfTabs <= 1) {
                return;
            }

            for (var index = 1; index < noOfTabs; index++) {
                var $tabMid = this.tab[index].find('.tab-mid');
                var $tabMidPrev = this.tab[index - 1].find('.tab-mid');

                //tabWidth1 = this.getDivHeightWidth($tabMid.text(), $tabMid.attr('class'), $tabMid.attr('style') + 'font-family: Montserrat;font-size: 14px;');
                //tabWidth0 = this.getDivHeightWidth($tabMidPrev.text(), $tabMidPrev.attr('class'), $tabMidPrev.attr('style') + 'font-family: Montserrat;font-size: 14px;');

                tabWidth1 = $tabMid.width();
                tabWidth0 = $tabMidPrev.width();
                if (tabWidth1 === 0)
                    if (tabWidth1 > tabWidth0) {
                        for (var j = index - 1; j >= 0; j--) {
                            this.tab[j].find('.tab-mid').width(tabWidth1);
                        }
                    }
                    else {
                        this.tab[index].find('.tab-mid').width(tabWidth0);
                    }
            }
        },

        /**
        * Returns boolean from config json of interactivity if save btn should be displayed
        * 
        * @method isSaveStateAllowed
        */
        isSaveStateAllowed: function isSaveStateAllowed() {
            if (typeof (this._config.isSaveStateAllowed) !== 'undefined') {
                return this._config.isSaveStateAllowed;
            }
            else {
                return true;
            }
        },

        /**
        * Returns boolean whether interactivity is loaded in new popup window or not
        * 
        * @method isPoppedOut
        * @return {bool} isPoppedOut value from player model
        */
        isPoppedOut: function isPoppedOut() {
            return this.model.get('isPoppedOut');
        },

        /**
        * Returns boolean from config json of interactivity if mute/unmute btn should be displayed
        * 
        * @method isMuteUnmuteShow
        * @return {bool} showMute value from config
        */
        isMuteUnmuteShow: function isMuteUnmuteShow() {
            return this._config.showMute || false;
        },
        /**
        * Return text height width 
        * 
        * @method getTextHeightWidth
        * @private
        */
        getTextHeightWidth: function getTextHeightWidth(text, classes, inlineStyle, parentClasses) {
            var dimension = { height: 0, width: 0 },
                $textDivWrapper = this.$('#' + this.getIDPrefix() + 'de-math-interactive-dimension-hack-div-container').find('#' + this.getIDPrefix() + 'de-math-interactive-hack-text-div-wrapper').addClass(parentClasses),
                $textDiv = $textDivWrapper.find('#' + this.getIDPrefix() + 'de-math-interactive-hack-text-div').addClass(classes).html(text);

            if (inlineStyle) {
                $textDiv.attr('style', inlineStyle);
            }

            if (text && text !== '') {
                dimension.height = $textDiv.getTextHeight();
                dimension.width = $textDiv.getTextWidth();
            }
            $textDiv.html('').removeClass(classes);
            $textDiv.removeAttr('style');
            $textDivWrapper.removeClass(parentClasses);

            return dimension;
        },

        /**
        * Return div height width 
        * 
        * @method getTextHeightWidth
        * @private
        */
        getDivHeightWidth: function getDivHeightWidth(text, classes, inlineStyle, parentClasses) {
            var dimension = { height: 0, width: 0 },
                $dimensionDivWrapper = this.$('#' + this.getIDPrefix() + 'de-math-interactive-dimension-hack-div-container').find('#' + this.getIDPrefix() + 'de-math-interactive-hack-dimension-div-wrapper').addClass(parentClasses),
                $dimensionDiv = $dimensionDivWrapper.find('#' + this.getIDPrefix() + 'de-math-interactive-hack-dimension-div').addClass(classes).html(text);

            if (inlineStyle) {
                $dimensionDiv.attr('style', inlineStyle);
            }

            dimension.height = $dimensionDiv.height();
            dimension.width = $dimensionDiv.width();

            $dimensionDiv.html('').removeClass(classes);
            $dimensionDiv.removeAttr('style');
            $dimensionDivWrapper.removeClass(parentClasses);

            return dimension;
        },

        /*Returns player's current Theme
        * @method getPlayerThemeType
        * @returns playerTheme {Number}
        */
        getPlayerThemeType: function getPlayerThemeType() {
            var playerTheme = this._config.playerTheme;

            if (typeof playerTheme === 'undefined' || playerTheme === null) {
                return MathInteractives.Common.Player.Views.Player.THEMES.THEME_1;
            }

            return playerTheme;
        },

        /**
        * Hides help screen using provided tab index.
        * 
        * @method hideTheme2Help
        * @private
        */
        hideTheme2Help: function (tabIndex) {
            var tabCollection = this.model.get('tabCollection'),
                id = this.getIDPrefix() + 'player-tab-' + tabIndex,
                currentTabModel = tabCollection.get(id)
            currentTabModel.set('isHelpScreenShown', false);
            this._handleHelpScreenVisibilityOnTabSwitch(tabIndex, currentTabModel);
        },


        /**
        * Return json data wrt ID.
        * @param jsonId {string} json id
        * @method getJson
        * @return json data {object}
        * @public
        */
        getJson: function getJson(jsonId) {
            var jsonData = this.model.get('jsonData');
            if (jsonData && jsonData[jsonId]) {
                return jsonData[jsonId].data;
            };
            return null;
        },

        /**
       * Initialize all the audioManager for all audio files
       * @method initializeAudioManager
       * @method public
       */
        initializeAudioManager: function initializeAudioManager() {
            //Loading audio files
            var audioFileDataMap = this.model.get('audioFileDataMap'),
                audioDataLength = Object.keys(audioFileDataMap).length,
                audioId = null,
                soundManagerInstance = null,
                options = null;

            for (audioId in audioFileDataMap) {
                //Create instance of sound manager and stores back to the data map
                options = $.extend({}, audioFileDataMap[audioId]);
                options.player = this;
                options.displayPreloader = false;
                if (!options.audioSpriteId) {
                    options.audioSpriteId = [];
                }
                options.audioSpriteId.push(audioId);
                options.isTheme2 = true;
                soundManagerInstance = MathInteractives.global.AudioManager.initAudioManager(options);
                audioFileDataMap[audioId].instance = soundManagerInstance;
            }

            return soundManagerInstance;

            //todo...update audioMapData upto player model
        },
        /**
        * Loads the audio on first click
        * @method loadAudio
        * @method public
        */
        loadAudio: function () {

            this.listenToOnce(this.soundManagerInstance, MathInteractives.Common.Components.Views.AudioManager.AUDIO_EVENT.LOAD_COMPLETE, function () {
                this.model.trigger(MathInteractives.Common.Player.Views.Player.Events.SECOND_STEP_START);
            });
            this.soundManagerInstance.load();
        },

        /**
        * Click handler called on pop-out button click.It has various checks to determine how the activity should be loaded on pop-out.
        * @method _onPopoutBtnClick
        * @method private
        */
        _onPopoutBtnClick: function _onPopoutBtnClick() {
            var isSaveStatePresent = (this.isSaveStateAllowed() === true) ? true : false,
                isSaveStateSaved = this._config.isSaveStateCheckEnabled ? this.interactiveModel.compareSavedState() : false;

            if ((isSaveStatePresent && isSaveStateSaved) || this._step2FirstLoad === true) {
                this.popoutInteractive(this._step2FirstLoad);
            }
            else {
                this._generatePopupOnPopoutClick(isSaveStatePresent);
            }
        },

        /**
        * Generates popup before popping out the activity to check if the activity is to be resumed or reloaded.
        * @method _generatePopupOnPopoutClick
        * @param isSaveStatePresent {boolean} Flag to indicate whether activity has save state or not
        * @method private
        */
        _generatePopupOnPopoutClick: function _generatePopupOnPopoutClick(isSaveStatePresent) {
            var options, popoutPopup, themeType, popupButtons, popupCloseCallback,
                self = this,
                popupTextID,
                manager = this.getManager(),
                idPrefix = this.getIDPrefix();

            manager.unloadScreen('pop-out-popup', idPrefix);
            manager.loadScreen('pop-out-popup', idPrefix);
            themeType = this.getPlayerThemeType();
            Player = MathInteractives.Common.Player.Views.Player;

            if (isSaveStatePresent) {
                popupButtons = [{
                    id: 'popout-save-and-proceed-btn',
                    text: manager.getMessage('popout-save-and-proceed-btn', 0),
                    response: { isPositive: false, buttonClicked: 'popout-save-and-proceed-btn' }
                },
                {
                    id: 'popout-start-over-btn',
                    text: manager.getMessage('popout-start-over-btn', 0),
                    response: { isPositive: true, buttonClicked: 'popout-start-over-btn' }
                }];
                popupCloseCallback = {
                    fnc: function (response) {
                        if (response.isPositive) {
                            this.popoutInteractive(true);
                        } else {
                            var Player = MathInteractives.Common.Player.Views.Player;
                            // add task that is to be performed after the interactive has been successfully saved.
                            self._addTaskToStack({
                                notification: Player.TASK_NOTIFICATIONS.POPOUT_INTERACTIVE,
                                data: $.proxy(function () { this.popoutInteractive(false) }, self)
                            });
                            self.saveState();
                        }
                    },
                    scope: self
                };
                //msg ID for popup text
                popupTextID = 1;
            } else {
                popupButtons = [{
                    id: 'popout-proceed-btn',
                    text: manager.getMessage('popout-proceed-btn', 0),
                    response: { isPositive: true, buttonClicked: 'popout-proceed-btn' }
                },
                {
                    id: 'popout-cancel-btn',
                    text: manager.getMessage('pop-up-no-btn-text', 0),
                    response: { isPositive: false, buttonClicked: 'popout-cancel-btn' }
                }];
                popupCloseCallback = {
                    fnc: function (response) {
                        if (response.isPositive) {
                            //call popoutInteractive
                            this.popoutInteractive(true);
                        } else {
                            return;
                        }
                    },
                    scope: self
                };

                popupTextID = 2;
            }

            switch (themeType) {
                case Player.THEMES.THEME_1:
                    {
                        options = {
                            player: this,
                            path: this._path,
                            manager: manager,
                            idPrefix: idPrefix,
                            title: manager.getMessage('theme1-popout-popup', 0),
                            accTitle: manager.getAccMessage('theme1-popout-popup', 0),
                            text: manager.getMessage('theme1-popout-popup', popupTextID),
                            accText: manager.getAccMessage('theme1-popout-popup', popupTextID),
                            buttons: popupButtons,
                            closeCallback: popupCloseCallback
                        }
                        popoutPopup = MathInteractives.global.PlayerPopup.createPopup(options);
                        break;
                    }
                case Player.THEMES.THEME_2:
                    {
                        options = {
                            title: manager.getMessage('theme2-popout-popup', 0),
                            accTitle: manager.getAccMessage('theme2-popout-popup', 0),
                            text: manager.getMessage('theme2-popout-popup', popupTextID),
                            accText: manager.getAccMessage('theme2-popout-popup', popupTextID),
                            manager: manager,
                            idPrefix: idPrefix,
                            player: this,
                            path: this._path,
                            type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                            buttons: popupButtons,
                            closeCallback: popupCloseCallback
                        };
                        popoutPopup = MathInteractives.global.Theme2.PopUpBox.createPopup(options);
                        popoutPopup.$el.addClass('save-popout-feature-popup');
                        manager.updateFocusRect(idPrefix + "theme2-pop-up-text");
                        break;
                    }
            }
        }

    }, {

        /*Holds Themes stauc values
        * @static
        * @property THEMES
        */
        THEMES: {
            THEME_1: 1,
            THEME_2: 2
        },

        Events: {
            SECOND_STEP_START: 'step-2-preload-start',
            SECOND_STEP_PROGRESS: 'step-2-preload-progress',
            SECOND_STEP_COMPLETE: 'step-2-preload-complete',
            SECOND_STEP_ERROR: 'step-2-preload-error',
            TOGGLE_ELEMENT_HELP: 'theme2-enable-element-help',
            HELP_CLICKED: 'help-click',
            CHANGE_HELP_TEXT: 'theme2-change-text-element-help',
            SAVE_STATE_ERROR: 'save-state-error',
            SAVE_STATE_SUCCESS: 'save-state-success',
            SECOND_STEP_INTERACTIVE_LOAD_COMPLETE: 'step-2-interactive-load-complete',
            MUTE_CLICKED: 'mute-click',
            UNMUTE_CLICKED: 'unmute-click',
            UNLOAD_INTERACTIVE: 'unload-interactive',
            SCREENSHOT_START: 'screenshot-start',
            SCREENSHOT_END: 'screenshot-end'
        },

        TASK_NOTIFICATIONS: {
            POPOUT_INTERACTIVE: 1
        }
    });

})();