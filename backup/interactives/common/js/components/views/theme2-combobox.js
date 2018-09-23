(function () {
    'use strict';

    /**
    * View for rendering Combobox.
    *
    * @class Combobox   
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.Combobox = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @type String
        * @default null
        */
        idPrefix: null,
        /**
        * Reference to the manager
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,
        /**
        * Reference to player
        * @property player
        * @type Object
        * @default null
        */
        player: null,
        /**
        * Holds the model of path for preloading files
        * @property path
        * @type Object
        * @default null
        */
        path: null,
        /**
        * jQuery object of combo holder 
        * @property $comboHolder
        * @type Object
        * @default null
        */
        $comboHolder: null,

        /**
       * Stores timeout id for currently hovered dropdown option
       * @property _timer
       * @type Number
       * @default null
       */
        _timer: null,

        /**
        * Stores current dropdown option  which is currently hovered. 
        * @property _currentTarget
        * @type Object
        * @default null
        */
        _currentTarget: null,

        zIndexArray: [],
        zIndexSubElemArray: [],
        zIndexCount: 0,
        isCustomComboBoxTemplate: false,
        /**  
        * Get data from model & set in view, Calls render and attach events on model.
        *    
        * @namespace MathInteractives.Common.Components.Theme2.Views
        * @class Combobox 
        * @constructor
        */
        initialize: function () {
            var model = this.model,
                isCustomComboBoxTemplate = model.get('isCustomComboBoxTemplate');
            this.path = model.get('path');
            this.idPrefix = model.get('idPrefix');
            this.manager = model.get('manager');
            this.player = model.get('player');
            this.isCustomComboBoxTemplate = isCustomComboBoxTemplate !== undefined ? isCustomComboBoxTemplate : false;
            this._intilializeAccTextArrForCustomComboBoxTemplate();
            model.on('change:options', this._render, this);
            model.on('change:bEnabled', this.enableDisableCombobox, this);
            model.on('change:selectedOptionIndex', this._setOption, this);
            this._render();
            
        },
        /**
        * Backbone property for binding events to DOM elements.
        * @property events
        * @private
        */
        events: {
            'click .combo-top-box': 'comboClick',
            //'click .option-outer-container': 'selectOption',
            'keydown .combo-top-box': '_onKeyDown',
            'click .optgroup-container': 'optgroupClicked'
        },
        /**
        * Renders the combobox view
        *
        * @method _render
        * @private
        **/
        _render: function () {
            var self = this,
                containerId = this.model.get('containerId'),
                screenId = this.model.get('screenId'),
                templateOptions, compiledVeiw,
                idPrefix = this.idPrefix,
                defaultOption,
                defaultOptionTypes = MathInteractives.Common.Components.Theme2.Models.Combobox.DEFAULT_OPTION_TYPES,
                model = this.model,
                height,
                selectedOptionIndex;

            this.$comboHolder = this.$el;

            // remove previous content
            this.$el.empty();

            // parse template of combo-box
            templateOptions = { idPrefix: idPrefix, defaultText: '', comboBoxTop: true, containerId: containerId };
            compiledVeiw = MathInteractives.Common.Components.templates.theme2Combobox(templateOptions).trim();

            // inject template into view
            this.$el.append(compiledVeiw);

            //generate markup for options
            this.generateOptionsMarkup();

            // bind events
            this.bindEvents();

            height = this.$('.combo-top-box').outerHeight();
            // hide drop down list
            this.$('.combo-box-list').css('top', height + 'px');
            this.$('.combo-box-list').hide();

            //Creates hack div of combo top-box container through loadScreen for text acc messages
            if (screenId !== null && typeof (screenId) !== 'undefined') {
                this.loadScreen(screenId);
                this.loadScreen('theme-2-combobox-screen');
                this.focusOut(containerId + '-combo-top-box', function () {
                    self.setAccMessage(containerId + '-combo-top-box', self.getAccMessage('theme2ComboboxText', 0), [self.getAccMessage(containerId + '-combo-top-box', model.get('selectedOptionIndex'))]);
                });
            }

            selectedOptionIndex = model.get('selectedOptionIndex');
            if (selectedOptionIndex === null) {
                // decide and set default option
                defaultOption = model.get('defaultOptionType');
                switch (defaultOption) {
                    case defaultOptionTypes.FIRST_OPTION:
                        this.selectComboOptionByIndex(0);
                        break;
                    case defaultOptionTypes.DEFAULT_TEXT:
                        this.selectComboOptionByIndex(-1);
                        break;
                    case defaultOptionTypes.PASSED_OPTION_TEXT:
                        var selectedOptionIndex = model.get('options').indexOf(model.get('defaultOptionText'));
                        this.selectComboOptionByIndex(selectedOptionIndex === -1 ? 0 : selectedOptionIndex);
                        break;
                    case defaultOptionTypes.PASSED_OPTION_INDEX:
                        var selectedOptionIndex = model.get('defaultOptionIndex'),
                            length = model.get('options').length;
                        this.selectComboOptionByIndex(selectedOptionIndex >= 0 && selectedOptionIndex < length ? selectedOptionIndex : 0);
                        break;
                }
            }
            else {
                this._setOption();
                this.enableDisableCombobox();
            }
            if (this.isCustomComboBoxTemplate === true) {
                this._createTabIndexArrayForOption();
                this._createHackDivForCustomTemplateCombo();
                this._bindFocusOutEventOnLastOption();
            }
            this.$('.option-outer-container').off('click').on('click', $.proxy(this.selectOption, this));
        },

        /**
        * Enables or Disables the combo box
        *
        * @method enableDisableCombobox
        * @public
        */
        enableDisableCombobox: function () {
            var model = this.model;

            if (!model.get('bEnabled')) {
                this.$el.find('.combo-container').css({ 'cursor': 'default' });
            }
            else {
                this.$el.find('.combo-container').css({ 'cursor': 'pointer' });
            }
            this.enableTab(model.get('containerId') + '-combo-top-box', model.get('bEnabled'));
            this.hideDropDown();
        },
        /**
        * Handles the click event of the combo box
        *
        * @method comboClick
        * @public
        * @param event{Object} The event received when the combo box is clicked
        */
        comboClick: function (event) {
            event.stopPropagation();
            var model = this.model, isEnabled;

            if (this.player.$el.find('.tabs-container').css('left') === '0px') {
                this.player._hideDrawer();
            }
            if (!model.get('bEnabled')) {
                return;
            }
            MathInteractives.global.SpeechStream.stopReading();
            // collapse all other dropdown
            this.hideAllDropdownsInCurrentTab();
            this.showHideDropDownList();
            this.highlightDownplayCombo();
            if (this.isCustomComboBoxTemplate === true) {
                this._setFocusOnFirstOption();
            }
        },

        /**
        * Handles the click event of the combo box options group container
        *
        * @method optgroupClicked
        * @public
        * @param event{Object} The event received when the combo box options group container is clicked
        */
        optgroupClicked: function optgroupClicked(event) {
            event.stopPropagation();
        },

        /**
        * Hides all the drop downs in the current tab
        *
        * @method hideAllDropdownsInCurrentTab
        * @public
        */
        hideAllDropdownsInCurrentTab: function () {
            var self = this,
                currentTab = this.getCurrentTab();

            currentTab.find('.combo-box-list').each(function () {
                var comboList;

                comboList = $(this);
                if (self.$el.has(comboList).length === 0) {
                    if (comboList.is(':visible')) {
                        comboList.hide();
                        self.unbindEventOnDocument();
                        comboList.removeClass('combo-list-pull-up').removeClass('combo-list-drop-down').addClass('combo-list-drop-down');
                        comboList.prev().removeClass('combo-top-box-active');
                        return;
                    }

                }
            })
        },

        /**
        * Hides a particular drop down
        *
        * @method hideDropDown
        * @public
        */
        hideDropDown: function () {
            var self = this,
                comboList = this.$('.combo-box-list'),
                currentTab;

            if (comboList.is(':visible')) {
                this.unbindEventOnDocument();
                if (this.isCustomComboBoxTemplate === true) {
                    setTimeout(function () {
                        comboList.hide();
                        comboList.removeClass('combo-list-pull-up').removeClass('combo-list-drop-down').addClass('combo-list-drop-down');
                        self.highlightDownplayCombo();
                    }, 5);
                    
                }
                else {
                    comboList.hide();
                    comboList.removeClass('combo-list-pull-up').removeClass('combo-list-drop-down').addClass('combo-list-drop-down');
                    this.highlightDownplayCombo();
                }
                
                if (this.model.get('hasMultipleSelection') === true) {
                    this.trigger(MathInteractives.global.Theme2.Combobox.MULTIPLE_SELECTION_COMBO_BOX_CLOSED, this);
                }
                
                return true;
            }
        },

        /**
        * Shows or hides the drop down list
        *
        * @method showHideDropDownList
        * @public
        */
        showHideDropDownList: function () {
            var idPrefix = this.idPrefix, currentTab, len1, len2,
                comboList = this.$('.combo-box-list'),
                model = this.model,
                isEnabled;

            if (!model.get('bEnabled')) {
                return;
            }

            if (comboList.is(':visible')) {
                this.hideDropDown();
                return;
            }

            comboList.css('visibility', 'hidden');
            comboList.show();
            len1 = comboList.offset().top + comboList.height()

            // get Current Tab
            currentTab = this.getCurrentTab();
            len2 = currentTab.offset().top + currentTab.height();

            if (len1 > len2) {
                comboList.removeClass('combo-list-drop-down').addClass('combo-list-pull-up')
            }
            else {
                comboList.removeClass('combo-list-pull-up').addClass('combo-list-drop-down')
            }
            comboList.show();
            this.bindEventOnDocument();
            comboList.css('visibility', 'visible');
            this._updateFocusRects();
        },

        /**
        * Resturns the current tab
        *
        * @method getCurrentTab
        * @public
        */
        getCurrentTab: function () {
            return this.player.$('div[class="activity-area theme2-tabs"]:visible');
        },

        /**
        * Highlights or downplays the combo box
        *
        * @method highlightDownplayCombo
        * @public
        */
        highlightDownplayCombo: function () {
            // highlight top box
            if (this.$('.combo-box-list').is(':visible')) {
                this.$('.combo-top-box').addClass('combo-top-box-active');
            }
            else {
                this.$('.combo-top-box').removeClass('combo-top-box-active');
            }
        },

        /**
        * Selects a particular option from the combo box
        *
        * @method selectOption
        * @public
        * @param event{Object} the event received when a particular option has to be selected       
        */
        selectOption: function (event) {
            event.preventDefault();
            var $currentTarget = $(event.currentTarget),
                $previousTarget = this._currentTarget,
                targetElem = event.target,
                text = $(targetElem).text().trim(),
                model = this.model,
                idPrefix = this.idPrefix,
                dropDownDownStateClass = model.get('dropDownDownStateClass'),
                index;
            if (this._timer) {
                clearTimeout(this._timer);
            }
            if ($previousTarget) {
                $previousTarget.removeClass('highlight-option');
            }
            MathInteractives.global.SpeechStream.stopReading();
            if (typeof dropDownDownStateClass !== 'undefined' && dropDownDownStateClass !== null) {
                var optionInnerContainerArray = $currentTarget.find('.option-inner-container');
                $(optionInnerContainerArray).each(function () {
                    $(this).addClass(dropDownDownStateClass);
                });
                var remainingOptionContainerArray = $($currentTarget.siblings('.option-outer-container')).find('.option-inner-container');
                $(remainingOptionContainerArray).each(function () {
                    $(this).removeClass(dropDownDownStateClass);
                });
            }
            if (!$(targetElem).hasClass('option-outer-container')) {
                index = $(targetElem).parents('.option-outer-container').attr('index');
            }
            else {
                index = $(targetElem).attr('index');
            }

            // set selected option index in the model
            this.selectComboOptionByIndex(index);

            if (model.get('hasMultipleSelection') !== true) {
                // hide dropped list
                this.showHideDropDownList();
                //downplay-combo-selection
                this.highlightDownplayCombo();
                this._setFocusOnComboHeader();
            }
        },

        /*
        * Key down handler for the combobox
        * 
        * @method _onKeyDown
        * @private
        * @param event {Object} the event received when any key is down        
        */
        _onKeyDown: function _onKeyDown(event) {

            // HOME_KEY_CODE = 36,
            // END_KEY_CODE = 35,
            // PAGE_UP_KEY_CODE = 33,
            // PAGE_DOWN_KEY_CODE = 34,
            // UP_ARROW_KEY_CODE = 38,
            // DOWN_ARROW_KEY_CODE = 40,
            // SPACE_KEY_CODE = 32,
            // ENTER_KEY_CODE = 13,

            var selectedOptionIndex = null;

            switch (event.keyCode) {
                case 36:
                case 33:
                    {
                        selectedOptionIndex = 0;
                        if (selectedOptionIndex !== null) {
                            event.preventDefault();
                            this.selectComboOptionByIndex(selectedOptionIndex);
                        }
                    }
                    break;
                case 35:
                case 34:
                    {
                        selectedOptionIndex = this.model.get('options').length - 1;
                        if (selectedOptionIndex !== null) {
                            event.preventDefault();
                            this.selectComboOptionByIndex(selectedOptionIndex);
                        }
                    }
                    break;
                case 38:
                    {
                        selectedOptionIndex = this.model.get('selectedOptionIndex');
                        if (selectedOptionIndex > 0) {
                            selectedOptionIndex--;
                        }
                        if (selectedOptionIndex !== null) {
                            event.preventDefault();
                            if (this.model.get('handleArrowKeys') !== false) {
                                this.selectComboOptionByIndex(selectedOptionIndex);
                            }
                        }
                        this.trigger(MathInteractives.Common.Components.Theme2.Views.Combobox.SELECTION_CHANGE_UP_ARROW);
                    }
                    break;
                case 40:
                    {
                        selectedOptionIndex = this.model.get('selectedOptionIndex');
                        if (selectedOptionIndex < (this.model.get('options').length - 1)) {
                            selectedOptionIndex++;
                        }
                        if (selectedOptionIndex !== null) {
                            event.preventDefault();
                            if (this.model.get('handleArrowKeys') !== false) {
                                this.selectComboOptionByIndex(selectedOptionIndex);
                            }
                        }
                        this.trigger(MathInteractives.Common.Components.Theme2.Views.Combobox.SELECTION_CHANGE_DOWN_ARROW);
                    }
                    break;
                case 32:
                case 13:
                    {
                        if (this.model.get('isCustomComboBoxTemplate') !== true) {
                            event.preventDefault();
                        }
                        if (selectedOptionIndex !== null) {
                            this.selectComboOptionByIndex(selectedOptionIndex);
                        }

                    }
                    break;
            }
            if (this.isCustomComboBoxTemplate === true && this.$('.combo-top-box').hasClass('combo-top-box-active') === true) {
                if (event.keyCode === 9 && event.shiftKey === true) {
                    this.showHideDropDownList();
                }
            }
        },

        /*
        * Selects the combobox option using option index
        * 
        * @method selectComboOptionByIndex
        * @public
        * @param selectedOptionIndex {Number} Index of the option to be selected        
        */
        selectComboOptionByIndex: function (selectedOptionIndex) {
            if (selectedOptionIndex >= -1 && selectedOptionIndex < this.model.get('options').length) {
                MathInteractives.global.SpeechStream.stopReading();
                this.model.set('selectedOptionIndex', selectedOptionIndex);
            }
            else {
                this.log('Index out of range');
            }
        },

        /*
        * Selects the combobox option using option data
        * 
        * @method selectComboOptionByData
        * @public
        * @param selectedOptionData {String} Text of the option to be selected        
        */
        selectComboOptionByData: function (selectedOptionData) {
            var selectedOptionIndex = this.model.get('options').indexOf(selectedOptionData);
            this.selectComboOptionByIndex(selectedOptionIndex);
        },

        /**
        * Sets the text to be displayed in combobox top container and sets the acc message 
        * based on the selectedOptionIndex in the model
        * 
        * @method _setOption
        * @private
        **/
        _setOption: function _setOption() {
            var model = this.model,
                selectedOptionIndex = model.get('selectedOptionIndex'),
                selectedOptionData = '',
                containerAccId = model.get('containerId') + '-combo-top-box',
                screenId = model.get('screenId');

            if (selectedOptionIndex === -1) {
                selectedOptionData = model.get('defaultText');
            }
            else {
                selectedOptionData = model.get('options')[selectedOptionIndex];
            }
            this.model.set('selectedOptionData', selectedOptionData);
            //this.$('.top-box-text-container').text(selectedOptionData);

            if (selectedOptionData.isCustomComboBoxTemplate === true) {
                //this.$('.top-box-text-container').text(model.get('defaultText'));
            } else {
                this.$('.top-box-text-container').html(selectedOptionData);
            }

            //if (this.model.get('hasMultipleSelection') !== true) {
            this.trigger(MathInteractives.global.Theme2.Combobox.SELECTION_CHANGED, this);
            //}

            //Sets acc message of hack div of combo top-box container
            if (screenId !== null && typeof (screenId) !== 'undefined') {
                this.$('#' + this.idPrefix + containerAccId + '-acc-elem').blur();
                this.setAccMessage(containerAccId, this.getAccMessage(containerAccId, this.model.get('selectedOptionIndex')));
                this.setFocus(containerAccId);
            }
        },

        /**
        * Gets the current selected option's index
        * 
        * @method getSelectedOptionIndex
        * @public
        * @return {Number} Current selected option's index in the combobox        
        **/
        getSelectedOptionIndex: function getSelectedOptionIndex() {
            return this.model.get('selectedOptionIndex');
        },

        /**
        * add the new option into the combo box
        * 
        * @method addOptionInComboBox         
        * @public
        * @param data {String} new option's text
        * @param index {Number} index at which new option to be added
        **/
        addOptionInComboBox: function addOptionInComboBox(data, index) {
            this.model.addOptions(data, index);
        },
        /**
        * remove the all data from the combo box
        * 
        * @method removeAllOptionFromComboBox
        * @public
        **/
        removeAllOptionFromComboBox: function removeAllOptionFromComboBox() {
            this.model.removeAllOptions();
        },
        /**
        * remove the data from the combo box
        * 
        * @method removeOptionFromComboBox
        * @public
        * @param index {Number} index to be remove from options
        **/
        removeOptionFromComboBox: function removeOptionFromComboBox(index) {
            this.model.removeIndexAt(index);
        },
        /**
        * Resets the combobox to intital selection
        * 
        * @method resetCombo
        * @public
        **/
        resetCombo: function () {
            var model = this.model,
                defaultOption = model.get('defaultOptionType'),
                defaultOptionTypes = MathInteractives.Common.Components.Theme2.Models.Combobox.DEFAULT_OPTION_TYPES,
                selectedOptionIndex;

            switch (defaultOption) {
                case defaultOptionTypes.FIRST_OPTION:
                    this.selectComboOptionByIndex(0);
                    break;
                case defaultOptionTypes.DEFAULT_TEXT:
                    this.selectComboOptionByIndex(-1);
                    break;
                case defaultOptionTypes.PASSED_OPTION_TEXT:
                    var selectedOptionIndex = model.get('options').indexOf(model.get('defaultOptionText'));
                    this.selectComboOptionByIndex(selectedOptionIndex === -1 ? 0 : selectedOptionIndex);
                    break;
                case defaultOptionTypes.PASSED_OPTION_INDEX:
                    var selectedOptionIndex = model.get('defaultOptionIndex'),
                        length = model.get('options').length;
                    this.selectComboOptionByIndex(selectedOptionIndex >= 0 && selectedOptionIndex < length ? selectedOptionIndex : 0);
                    break;
            }
        },

        /**
        * Binds events to the combo box
        *
        * @method bindEvents
        * @public
        */
        bindEvents: function () {
            this.bindOptionsHighlightDownPlayEvents();
            return;
        },

        /**
        * Binds events on the document
        *
        * @method bindEventOnDocument
        * @public
        */
        bindEventOnDocument: function () {
            var self = this,
                comboList = this.$('.combo-box-list');
            $(document).on('click.combobox', function () {
                if (self.model.get('hasMultipleSelection') !== true) {
                    self.hideDropDown();
                }
                return;
            });
            // close dropdown if mousedown is fired anywhere outside it

            $(document).on('mousedown.combobox', function (event) {
                if (!($(event.target).parents('#' + self.el.id).length == 1)) {
                    self.hideDropDown();
                }
            });
            
           // MathInteractives.Common.Utilities.Models.Utils.EnableTouch($(document));
        },

        /**
        * Unbinds events on the document
        *
        * @method unbindEventOnDocument
        * @public
        */
        unbindEventOnDocument: function () {
            var self = this;
            $(document).off('click.combobox');
            // close dropdown if mousedown is fired anywhere outside it
            $(document).off('mousedown.combobox');
         //   MathInteractives.Common.Utilities.Models.Utils.DisableTouch($(document));
        },

        /**
        * Binds mouse and touch events for hover on dropdown options
        *
        * @method bindOptionsHighlightDownPlayEvents
        * @public
        */
        bindOptionsHighlightDownPlayEvents: function () {
            var $optionOuterContainer = this.$('.option-outer-container');
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                $optionOuterContainer.off('touchstart').on('touchstart', $.proxy(this._onOptionMouseOver, this));
                $optionOuterContainer.off('touchend').on('touchend', $.proxy(this._onOptionMouseLeave, this));
            }
            else {
                $optionOuterContainer.off('mouseenter').on('mouseenter', $.proxy(this._onOptionMouseOver, this));
                $optionOuterContainer.off('mouseleave').on('mouseleave', $.proxy(this._onOptionMouseLeave, this));
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch($optionOuterContainer);
            }
        },

        /**
        * Handles mouse and touch over on options
        *
        * @method _onOptionMouseOver
        * @private
        * @param event {Object} the event received when mouse over or touch start on combo box option   
        */
        _onOptionMouseOver: function _onOptionMouseOver(event) {
            if (!this.model.get('bEnabled')) {
                return;
            }
            var $currentTarget = $(event.currentTarget).find('.option-inner-container'),
                isSimulated = event.originalEvent && event.originalEvent.data && event.originalEvent.data.simulatedEvent;

            if (isSimulated) {
                this._currentTarget = $currentTarget;
                if (this._timer) {
                    clearTimeout(this._timer);
                }
                this._timer = setTimeout(function () {
                    $currentTarget.addClass('highlight-option');
                }, 200);
            }
            else {
                $currentTarget.addClass('highlight-option');
            }
        },

        /**
        * Handles mouse and touch leave on options
        *
        * @method _onOptionMouseLeave
        * @private
        * @param event {Object} the event received when mouse leave or touch end on combo box option        
        */
        _onOptionMouseLeave: function _onOptionMouseLeave(event) {
            if (!this.model.get('bEnabled')) {
                return;
            }

            var isSimulated = event.originalEvent && event.originalEvent.data && event.originalEvent.data.simulatedEvent;

            if (this._timer) {
                clearTimeout(this._timer);
            }

            if (isSimulated) {
                setTimeout(function () {
                    $(event.currentTarget).find('.option-inner-container').removeClass('highlight-option');
                }, 200);
            } else {
                $(event.currentTarget).find('.option-inner-container').removeClass('highlight-option');
            }
        },

        /**
        * Generates options markup
        *
        * @method generateOptionsMarkup
        * @public
        */
        generateOptionsMarkup: function () {
            var options = this.model.get('options'), i,
                containerId = this.model.get('containerId'),
                optionsCount = options.length,
                compiledOptionTemplate,
                idPrefix = this.idPrefix,
                templateOptions;
            //customComboBoxTemplate = this.model.get('customComboBoxTemplate'),
            //isCustomComboBoxTemplate = this.model.get('isCustomComboBoxTemplate');

            for (i = 0; i < optionsCount; i++) {
                // setup template data
                templateOptions = { idPrefix: idPrefix, value: options[i], index: i, containerId: containerId + '-' + i + '-' };

                // check for whether it is a clickable option
                if (options[i].isClickable === false) {
                    compiledOptionTemplate = options[i].optgroupTemplate;
                } else {
                    if (options[i].isCustomComboBoxTemplate === true) {
                        //compiledOptionTemplate = customComboBoxTemplate;
                        templateOptions.value = options[i].customComboBoxTemplate;
                    }
                    // compile template
                    compiledOptionTemplate = MathInteractives.Common.Components.templates.theme2Combobox(templateOptions).trim();
                }

                // inject into dom
                this.$('.combo-box-list').append(compiledOptionTemplate);

                if (i == 0) {
                    this.$('.option-outer-container').addClass('first-option-outer-container');
                }
            }
        },
        _createHackDivForCustomTemplateCombo: function _createHackDivForCustomTemplateCombo() {
                this.createAccDiv({
                    "elementId": this.$el.find('.combo-top-box').attr('id').replace(this.model.get('idPrefix'), '').trim(),
                    "tabIndex": this.model.get('tabIndex'),
                    "acc": this.accTextArray !== undefined ? this.accTextArray.unSelectedDropDownHeaderAccText : ''

                });
                this._createHackDivForOptions();
        },
        _createHackDivForOptions: function _createHackDivForOptions() {
            var self = this,
                options = this.model.get('options'),
                $optionsArray = this.$el.find('.combo-box-list').children();
            $optionsArray.each(function (index) {
                self.createAccDiv({
                    "elementId": $(this).attr('id').replace(self.model.get('idPrefix'), '').trim(),
                    "tabIndex": self.zIndexArray[self.zIndexCount],
                    "acc": self.accTextArray !== undefined ? self.accTextArray.optionsAccText[index] : ''
                });
                self.zIndexCount++;
                if (options[index].subElements === true) {
                    self._generateHackDivsForCurrentOptionSubElement(self.$('.' + options[index].subElementsCommonClass));
                }
            });
        },
        _updateFocusRects: function _updateFocusRects() {
            var self = this;
            if (this.isCustomComboBoxTemplate === true) {
                var $optionsArray = this.$el.find('.combo-box-list').children();
                $optionsArray.each(function (index) {
                    self.updateFocusRect($(this).attr('id').replace(self.model.get('idPrefix'), ''));
                })
            }
        },
        _setFocusOnFirstOption: function _setFocusOnFirstOption() {
            var $firstOption = this.$el.find('.combo-box-list').children().first();
            this.setFocus($firstOption.attr('id').replace(this.model.get('idPrefix'), ''));
        },
        _createTabIndexArrayForOption: function _createTabIndexArrayForOption() {
            var model = this.model,
                options = model.get('options'),
                numberOfHackElem = options.length + this._getNumberOfSubElems(),
                baseTabIndex = model.get('tabIndex');
                for (var i = 0; i < numberOfHackElem; i++) {
                    this.zIndexArray[i] = baseTabIndex + 1;
                }
        },
        _setFocusOnComboHeader: function _setFocusOnComboHeader() {
            if(this.isCustomComboBoxTemplate===true) {
                this.setFocus(this.$el.find('.combo-top-box').attr('id').replace(this.model.get('idPrefix'), '').trim());
            }
        },
        _bindFocusOutEventOnLastOption: function _bindFocusOutEventOnLastOption() {
            var lastOptionId = this.$el.find('.combo-box-list').children().last().attr('id');
            this.$('#' + lastOptionId).on('keydown', $.proxy(this._onlastOptionFocusOut, this));
        },
        _onlastOptionFocusOut: function _onlastOptionFocusOut(event) {
            if (event.keyCode === 9 && event.shiftKey === false) {
                this.showHideDropDownList();
            }
        },
        _intilializeAccTextArrForCustomComboBoxTemplate: function _intilializeAccTextArrForCustomComboBoxTemplate() {
            if (this.isCustomComboBoxTemplate === true) {
                this.accTextArray = this.model.get('accText');
            }
        },
        _generateHackDivsForCurrentOptionSubElement: function _generateHackDivsForCurrentOptionSubElement($subElemParent) {
            var $subElemArr = $subElemParent.children(),
                self = this;
            $subElemArr.each(function (index) {
                self.createAccDiv({
                    "elementId": $(this).attr('id').replace(self.model.get('idPrefix'), '').trim(),
                    "tabIndex": self.zIndexArray[self.zIndexCount],
                    "acc": self.accTextArray !== undefined ? self.accTextArray.quantityArrayText[index] : ''
                });
                self.zIndexCount++;
            })
        },
        _getNumberOfSubElems: function _getNumberOfSubElems() {
            var options = this.model.get('options'),
                optionsLength = options.length,
                numberOfSubElems = 0;
            for (var i = 0; i < optionsLength; i++) {
                if (options[i].subElements === true) {
                    numberOfSubElems += this.$('.' + options[i].subElementsCommonClass).children().length;
                }
            }
            return numberOfSubElems;

        },
        setAccTextForDropDownHeader: function setAccTextForDropDownHeader(accText) {
            this.setAccMessage(this.$el.find('.combo-top-box').attr('id').replace(this.model.get('idPrefix'), '').trim(), accText);
        },
        setAccTextForDropDownOption: function setAccTextForDropDownOption(optionIndex, accText) {
            var $options = $(this.$el.find('.combo-box-list').children()[optionIndex]);
            this.setAccMessage($options.attr('id').replace(this.model.get('idPrefix'), '').trim(), accText);
        },
        setFocusOnComboHeader: function setFocusOnComboHeader() {
            this._setFocusOnComboHeader();
        }
    }, {

        /**
        * Event to trigger when combo selection changed
        * @property SELECTION_CHANGED
        * @type String
        * @static
        */
        SELECTION_CHANGED: 'selection-changed',
        /**
        * Event to trigger when multiple selection combo box is closed
        * @property MULTIPLE_SELECTION_COMBO_BOX_CLOSED
        * @type String
        * @static
        */
        MULTIPLE_SELECTION_COMBO_BOX_CLOSED: 'multiple-selection-combo-box-closed',

        /**
        * Event triggerred when up arrow key is pressed on combo box
        * @property SELECTION_CHANGE_UP_ARROW
        * @type String
        * @static
        */
        SELECTION_CHANGE_UP_ARROW: 'selection-change-up-arrow',

        /**
        * Event triggerred when down arrow key is pressed on combo box
        * @property SELECTION_CHANGE_DOWN_ARROW
        * @type String
        * @static
        */
        SELECTION_CHANGE_DOWN_ARROW: 'selection-change-down-arrow',

        /*
        * To generate custom combobox
        *
        * @method generateCombo
        * @public
        * @static
        * @param options {Object} paramter passed by user
        * @return {Object} combo box's view
        */
        generateCombo: function generateCombo(options) {
            var comboModel, comboView;
            comboModel = new MathInteractives.Common.Components.Theme2.Models.Combobox(options);
            // instantiate comboView
            comboView = new MathInteractives.Common.Components.Theme2.Views.Combobox({ el: '#' + options['idPrefix'] + options['containerId'], model: comboModel });
            // return view
            return comboView;
        }
    });

    MathInteractives.global.Theme2.Combobox = MathInteractives.Common.Components.Theme2.Views.Combobox;

})();
