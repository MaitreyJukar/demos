
(function () {
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


    MathInteractives.Common.Player.Views.Player = Backbone.View.extend({

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

        /**
        * Initialization
        * @method initialize
        */
        initialize: function () {

            this._path = this.model.get('path');
            this._config = this.model.get('config');
            this._initializeManager();
            this._moduleName = this._config.module;
            this._tabsData = this._config.tabsData;
            this.tab = [];
            if (this._tabsData.length > 1) {
                this._manager.loadScreen('tab-contents', this.getIDPrefix());
            }
            this._stepsData = this._config.steps;
            this._attachEvents();

            this._manager.unloadScreen('header-buttons', this.getIDPrefix());
            this._manager.loadScreen('header-buttons', this.getIDPrefix());

            this.render();

            //set current tab as per model data
            this._defaultSetupOfPlayer();

            this._restrictTextSelection();

            this._manager.loadScreen('player', this.getIDPrefix());

            //var uagent = navigator.userAgent.toLowerCase();
            //if (uagent.indexOf('chrome') != -1) {
            //    $('body').attr('role', 'application');
            //}
            //else {
            //    $('body').attr('role', 'application');
            //}
            this._enableDisableApplicationMode(true);
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

            /*As DE is still to apply accessibility changes, we have temporarily hardcoded accessibility to false 
            so that we can test and mark all the jira tickets as tested */
            isAccessible = true;

            if ($.support.touch) {
                isAccessible = false;
            }

            //Disabling accessibility for player theme 2
            Player = MathInteractives.Common.Player.Views.Player;
            switch (this.getPlayerThemeType()) {
                case Player.THEMES.THEME_1: break;
                case Player.THEMES.THEME_2:
                    {
                        isAccessible = false;
                        break;
                    }
            }

            managerModel = new MathUtilities.Components.Manager.Models.Manager({
                startTabindex: this.model.get('startTabindex') || 0,
                isAccessible: isAccessible,
                isWrapOn: false,
               // debug: true
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

            managerModel.parse(commonJsonClone);
            managerModel.parse(activityJsonClone);
            manager = new MathUtilities.Components.Manager.Views.Manager({ model: managerModel });
            this._manager = manager;
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
             pronouncedSentenceInPronounceXml, i, j, k, $pronounceData,
             strCheck;
            if (parsedPronounceData) {
                for (i = 0; i <= 1; i++) {
                    if (parsedPronounceData[i] != undefined) {

                        $pronounceData = $(parsedPronounceData[i])[0];

                        $($pronounceData.pronounciations.sentences).each(function () {
                            strCheck = accOriginalMessage;
                            originalSentenceInPronounceXml = $(this)[0].originalSentence;

                            pronouncedSentenceInPronounceXml = $(this)[0].pronouncedSentence;

                            if ((new RegExp(originalSentenceInPronounceXml, 'gi')).test(strCheck)) {
                                accOriginalMessage = self.replaceSentence(accOriginalMessage, originalSentenceInPronounceXml, pronouncedSentenceInPronounceXml);
                            }

                        });
                    }
                }
                for (i = 0; i <= 1; i++) {
                    if (parsedPronounceData[i] != undefined) {

                        $pronounceData = $(parsedPronounceData[i])[0];

                        $($pronounceData.pronounciations.words).each(function () {

                            strCheck = accOriginalMessage;

                            originalWordInPronounceXml = $(this)[0].originalWord;

                            pronouncedWordInPronounceXml = $(this)[0].pronouncedWord;
                            if ((new RegExp(originalWordInPronounceXml, 'gi')).test(strCheck)) {
                                accOriginalMessage = self.replaceWord(accOriginalMessage, originalWordInPronounceXml, pronouncedWordInPronounceXml);
                            }
                        });
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
            for (var index = 0; index < noOfTabs; index++) {
                //adding activity area
                template = tabsData[index].templateName;
                this._insertActivityArea(index, template, tabsData[index].shadow, this._moduleName, uiClass);

            }

            //check config to disable auto resize of tabs
            if (typeof config.resizeTab === 'undefined' || config.resizeTab) {
                //this._adjustTabWidth(); // removed because each tab-header will have width according to its text
            }


            if (!$.support.touch) {
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
                        this.$el.off('click.drawerHide').on('click.drawerHide', $.proxy(function () {
                            if ($tabsCont.css('left') === '0px') {
                                this._hideDrawer();
                            }
                        }, this));

                        break;
                    }
            }

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
            this._header = headerView;
            headerModel.off('save-image').on('save-image', $.proxy(this.saveImage, this));
            headerModel.off('save-state').on('save-state', $.proxy(this.saveState, this));
            headerModel.off('tabs-drawer-click').on('tab-drawer-click', $.proxy(this._drawerAnimation, this));
        },

        /**
        * Sets the interactiveModel property using data from config.model
        * @method _initializeInteractiveModel
        * @private
        */
        _initializeInteractiveModel: function _initializeInteractiveModel() {
            var currentModel = this._config.model,
                moduleName = this._moduleName, InteractiveModel, newSaveState = this._config.newSaveState, data;


            if (typeof currentModel.module !== 'undefined') {
                moduleName = currentModel.module;
            }
            InteractiveModel = MathInteractives.Interactivities[moduleName].Models[currentModel.class];

            if (newSaveState !== 'undefined' && newSaveState === true) {
                data = this.model.get('initialState');
                if (typeof data === 'undefined' || data === null) {
                    data = {};
                }
                $.extend(data, {
                    jsonData: this.model.get('jsonData'),
                    manager: this._manager,
                    player: this,
                    path: this._path
                });
            }
            else {
                data = {
                    jsonData: this.model.get('jsonData'),
                    manager: this._manager,
                    player: this,
                    path: this._path,
                    savedState: this.model.get('initialState')
                };
            }


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
                templateName: templateName,
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

            this._pushCurrentTabContent(activityAreaID, activityAreaView);
        },

        /*
        * Default view of the player
        * @method _defaultSetupOfPlayer*/
        _defaultSetupOfPlayer: function () {
            var currentTabView = this.model.get('currentTabView');
            this.tabClicked(currentTabView, { silent: true });

            //hiding tab container if only 1 tab present
            var noOfTabs = this.model.get('noOfTabs');
            if (noOfTabs === 1) {
                this.$el.find('.tabs-container').hide();
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
                idPrefix = self.getIDPrefix(),
                tabCollection = this.model.get('tabCollection');

            if (!options || !(options.silent)) { // NOT(options && options.silent == true)
                this.trigger(MathInteractives.global.PlayerModel.BEFORE_TAB_SWITCH_EVENT, tabView._tabNumber);
            }
            if (this.getIsTabSwitchAllowed() === false) {
                this.setIsTabSwitchAllowed(true);   // set back to default true
                return;
            }

            if (tabView !== null && tabCollection.contains(tabView.model)) {
                //deactivate all tabs

                tabCollection.each(function (currentModel) {
                    currentModel.set('active', false);

                    currentTabId = currentModel.id;
                    self._manager.setAccMessage(currentTabId, self._manager.getAccMessage(currentTabId.split(idPrefix)[1], 0) + " " + self._manager.getAccMessage('unSelected-tab-btn-acc-text', 0));
                });

                //activate current tab
                tabView.model.set('active', true);
                currentTabId = tabView.model.id;
                self._manager.setAccMessage(currentTabId, self._manager.getAccMessage(currentTabId.split(idPrefix)[1], 0) + " " + self._manager.getAccMessage('Selected-tab-btn-acc-text', 0));
            }
            this.$('.header-subtitle').html(tabView.$el.clone().children().remove().end().text());
            if (typeof options === 'undefined' || !options.silent) {
                this._header.$('.header-tab-drawer-btn').trigger('click');
            }
        },

        /*
        * Change tab to given index (starts from 0)
        * @method switchToTab
        * @param tabIndex number
        */
        switchToTab: function (tabIndex) {
            var self = this,
                currentTabId,
                tabCollection = this.model.get('tabCollection'),
                idPrefix = this.getIDPrefix(),
                id = idPrefix + 'player-tab-' + tabIndex,
                requiredTabModel = tabCollection.get(id),
                isTabEnabled = true;
            if (requiredTabModel !== undefined) {
                //deactivate all tabs
                tabCollection.each(function (currentModel) {

                    currentModel.set('active', false);
                    currentTabId = currentModel.id;
                    self._manager.setAccMessage(currentTabId, self._manager.getAccMessage(currentTabId.split(idPrefix)[1], 0) + " " + self._manager.getAccMessage('unSelected-tab-btn-acc-text', 0));

                    if (!currentModel.get('enable') && currentModel.id === id) {
                        isTabEnabled = false;
                        return;
                    }
                });

                if (isTabEnabled) {
                    //activate the given tab
                    requiredTabModel.set('active', true);
                    currentTabId = requiredTabModel.id;
                    self._manager.setAccMessage(currentTabId, self._manager.getAccMessage(currentTabId.split(idPrefix)[1], 0) + " " + self._manager.getAccMessage('Selected-tab-btn-acc-text', 0));
                }
                else {
                    this.switchToTab(tabIndex - 1);
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
        _pushCurrentTabContent: function (activityAreaIndex, activityAreaView) {

            var currentTabData = this._tabsData[activityAreaIndex],
                moduleName = this._moduleName,
                InteractiveView = null, el = null, $el = null;

            if (typeof currentTabData.module !== 'undefined') {
                moduleName = currentTabData.module;
            }

            InteractiveView = MathInteractives.Interactivities[moduleName].Views[currentTabData.view.class];

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
                    id: el.replace('#',''),
                    idPrefix: this.getIDPrefix(),
                    manager: this._manager,
                    player: this,
                    path: this._path,
                    screenID: currentTabData.overviewTabData.screenID,
                    leftImageContainerID: currentTabData.overviewTabData.leftImageContainerID
                },
                overviewTabView = MathInteractives.global.Theme2.OverviewTab.generateOverviewTab(overviewData);
                this.listenTo(overviewTabView, MathInteractives.Common.Components.Theme2.Views.OverviewTab.GO_BUTTON_CLICKED, this.onGoButtonClicked);
            }
            var interactiveView = new InteractiveView({ el: $el, model: this.interactiveModel });
            this.interactiveModel.off('save-state').on('save-state', $.proxy(this.getCurrentStateData, this));
        },
        /**
        * Sends the click event of go button from overview tab to the interactive
        * @method onGoButtonClicked
        * @param overviewTab{Backbone.View} the view of the overview tab
        * @type private
        */
        onGoButtonClicked: function onGoButtonClicked(overviewTab) {
            this.trigger(MathInteractives.Common.Components.Theme2.Views.OverviewTab.GO_BUTTON_CLICKED, overviewTab);
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
            this.model.trigger('save-image', { interactiveGuid: this.model.get('interactiveId'), base64Image: event.base64Image });
        },

        saveState: function saveState() {
            this.model.trigger('save-state', { interactiveGuid: this.model.get('interactiveId') });
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
                $tabsCont.stop().animate({ left: '0px' }, {
                duration:500,
                start:$.proxy(function(){this._drawerAnimationStartCallback('show')}, this),
                complete:$.proxy(function(){this._drawerAnimationCompleteCallback('show')}, this)
                });
            }
            else {
                $tabsCont.off('animationstart webkitAnimationStart MSAnimationStart oAnimationStart').on('animationstart webkitAnimationStart MSAnimationStart oAnimationStart',
                $.proxy(function(){this._drawerAnimationStartCallback('show')}, this))
                .addClass('tabs-container-animation');

                $tabsCont.off('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd',
                $.proxy(function(){this._drawerAnimationCompleteCallback('show')}, this))
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
                duration:500,
                start:$.proxy(function(){this._drawerAnimationStartCallback('hide')}, this),
                complete:$.proxy(function(){this._drawerAnimationCompleteCallback('hide')}, this)
                });
            }
            else {
                $tabsCont.off('animationstart webkitAnimationStart MSAnimationStart oAnimationStart').on('animationstart webkitAnimationStart MSAnimationStart oAnimationStart',
                $.proxy(function(){this._drawerAnimationStartCallback('hide')}, this)).addClass('tabs-container-animation-reverse');

                $tabsCont.off('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', 
                $.proxy(function(){this._drawerAnimationCompleteCallback('hide')}, this))
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
           var isBrowserIE=this._isIE9();
           if (this._header._drawerBtn) {
            switch(state){
                case 'hide':{
                    this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                    break;
                }
                case 'show':{
                    this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_SELECTED);
                    break;
                }
            } 
           }
           if(!isBrowserIE){
                this._setTabContainerPosition();
                this._header.enableTabDrawer(true);
                this._header.enableHeaderSubtitle(true);
           }
        },

        /*
         * Handles call back of animation start
         * @method _drawerAnimationStartCallback
         * @private
         */
        _drawerAnimationStartCallback:function _drawerAnimationStartCallback(state){
        //debugger;
          var isBrowserIE=this._isIE9();

          if (this._header._drawerBtn) {
            switch(state){
                case 'hide':{
                    this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                    break;
                }
                case 'show':{
                    this._header._drawerBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_SELECTED);
                    break;
                }
          } 
          }
            if(!isBrowserIE){
                this._header.enableTabDrawer(false);
                this._header.enableHeaderSubtitle(false);
            }
               
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
            this.enableHelp(true);
            var currentActiveTab = this.model.get('currentActiveTab');
            var tabChangeData = this._tabChangeData;

            if (tabChangeData !== null && tabChangeData.hasOwnProperty(currentActiveTab)) {
                tabChangeData[currentActiveTab].fnc.apply(tabChangeData[currentActiveTab].scope || this, [currentActiveTab]);
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

            if (hasNextTab && nextTabIndex) {
                this._manager.setTabIndex(this.getIDPrefix() + 'save-btn', nextTabIndex - 50);
                this._manager.setTabIndex(this.getIDPrefix() + 'screen-shot-btn', nextTabIndex - 40);
                this._manager.setTabIndex(this.getIDPrefix() + 'help-btn', nextTabIndex - 30);
            }
            else {
                this._manager.unloadScreen('header-buttons', this.getIDPrefix());
                this._manager.loadScreen('header-buttons', this.getIDPrefix());
            }
        },

        /*
        * Enable/Disable help button
        * @method enableHelp
        * @param {bool} enable
        * @public 
        */
        enableHelp: function (enable) {
            if (enable !== undefined && enable !== null) {
                this._header.enableHelp(enable);
            }
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
        getManager:function getManager(){
            return this._manager;
        },

        /*
        * returns path instance of the interactive
        * @method getPath
        * @return {object} path instance
        * @public 
        */
        getPath:function getPath(){
            return this._path;
        },


        _restrictTextSelection: function _restrictTextSelection() {
            if (!$.support.touch) {
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

                //tabWidth1 = this.getDivHeightWidth($tabMid.text(), $tabMid.attr('class'), $tabMid.attr('style') + 'font-family: MontserratRegular;font-size: 14px;');
                //tabWidth0 = this.getDivHeightWidth($tabMidPrev.text(), $tabMidPrev.attr('class'), $tabMidPrev.attr('style') + 'font-family: MontserratRegular;font-size: 14px;');

                tabWidth1 = $tabMid.width();
                tabWidth0 = $tabMidPrev.width();
                if (tabWidth1 === 0) debugger;
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
        * Return text height width 
        * 
        * @method getTextHeightWidth
        * @private
        */
        getTextHeightWidth: function getTextHeightWidth(text, classes, inlineStyle, parentClasses) {
            var dimension = { height: 0, width: 0 },
                $textDivWrapper = this.$('#' + this.getIDPrefix() + 'de-math-interactive-dimension-hack-div-container').find('#' + this.getIDPrefix() + 'de-math-interactive-hack-text-div-wrapper').addClass(parentClasses),
                $textDiv = $textDivWrapper.find('#' + this.getIDPrefix() + 'de-math-interactive-hack-text-div').addClass(classes).html(text);

            if (!inlineStyle) {
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
        }

    }, {

        /*Holds Themes stauc values
         * @static
         * @property THEMES
         */
        THEMES: {
            THEME_1: 1,
            THEME_2: 2
        }
    });

})();