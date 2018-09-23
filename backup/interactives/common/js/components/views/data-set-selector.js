(function (MathInteractives) {
    'use strict';

    var thisView = null;

    /**
    * Class for Data Set Selection Step Screen, contains properties and methods of Data Set Selection Step Screen
    * @class DataSetSelectorView
    * @module DataSetSelector
    * @namespace MathInteractives.Common.Interactivities.DataSetSelector.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Views.DataSetSelectorView = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores reference to array of data sets
        *
        * @property scope
        * @type Object
        * @default null
        **/
        dataSets: [],

        /**
        * Stores path to access static model properties.
        *
        * @property modelPath
        * @type Object
        * @default null
        **/
        modelPath: null,

        /**
        * Stores reference to view of 'clear all data' button.
        *
        * @property clearAllDataBtnView
        * @type Object
        * @default null
        **/
        clearAllDataBtnView: null,

        /**
        * Stores reference to view of direction text bar.
        *
        * @property directionTextView
        * @type Object
        * @default null
        **/
        directionTextView: null,

        /**
        * Stores path to access templates of data set selector.
        *
        * @property templatePath
        * @type Object
        * @default null
        **/
        templatePath: null,

        /**
        * Stores index(cid) of data set to be deleted.
        *
        * @property dataSetDeleteIndex
        * @type String
        * @default null
        **/
        dataSetDeleteIndex: null,

        /**
        * Refereence to tooltip view of data set delete button.
        *
        * @property dataSetDeleteTooltip
        * @type Object
        * @default null
        **/
        dataSetDeleteTooltip: null,

        /**
        * Stores id suffix to be appended to elements after id prefix for different tabs.
        *
        * @property idSuffix
        * @type String
        * @default ''
        **/
        idSuffix: '',

        dataSetSelected: false,

        /**
        * Stored whether the created data sets would have role as button while creating the acc divs.
        *
        * @property isRoleButtonEnabled
        * @type Boolean
        * @default false
        **/
        isRoleButtonEnabled: false,

        isPopupExist: false,

        events: {
            'click .data-set': '_selectDataSet',
            'click .add-your-own': '_addYourOwnDataSet',
            'click .clear-all-btn-container.clickEnabled': '_createClearAllPopup'
        },

        /**
        * Initializes the data set selector step screen
        *
        * @method initialize
        **/
        initialize: function initialize(options) {
            var self = this,
                model = self.model;

            self.initializeDefaultProperties();

            if (self.options.hasClearAllBtn === false) {
                self.options.hasClearAllBtn = false;
            } else {
                self.options.hasClearAllBtn = true;
            }
            self.modelPath = MathInteractives.Common.Components.Theme2.Models.DataSetSelectorModel;
            self.filePath = model.get('path');
            self.manager = model.get('manager');
            self.player = model.get('player');
            self.dataSets = model.get('dataSets');
            self.idSuffix = options.idSuffix;
            self.isRoleButtonEnabled = options.isRoleButtonEnabled;
            self.idPrefix = this.player.getIDPrefix();
            self.EVT_SEL_DATASET = thisView.EVT_SEL_DATASET;
            self.EVT_ADD_DATASET = thisView.EVT_ADD_DATASET;
            self.EVT_DEL_DATASET = thisView.EVT_DEL_DATASET;
            self.EVT_DEL_ALL_DATASET = thisView.EVT_DEL_ALL_DATASET;
            self.templatePath = MathInteractives.Common.Components.templates;
            self._initLocAccText();
            self.render();
        },

        /**
        * Renders the data set selector step screen with updated data
        *
        * @method render
        **/
        render: function render() {
            var self = this,
                model = self.model;

            self.$el.html($(self.templatePath.dataSetSelectorScreen({
                idPrefix: self.idPrefix,
                idSuffix: self.idSuffix
            })));

            self._createDirectionText();
            self._createButtons();
            self._generateTooltips();
            self._updateDataSetView();
        },

        /**
        * binds mouse hover and down events.
        *
        * @method _bindMouseEvents
        * @private
        **/
        _bindMouseEvents: function _bindMouseEvents() {
            var self = this;

            self.$('.data-set').off('mousedown').on('mousedown', { context: self }, self._mouseDownEvent);
            self.$('.data-set-delete-btn').off('mousedown').on('mousedown', { context: self }, self._mouseDownEvent);
            self.$('.add-your-own').off('mousedown').on('mousedown', { context: self }, self._mouseDownEvent);
            self.$('.data-set-delete-btn').off('click').on('click', $.proxy(this._triggerDeleteEvent, this));

            self.$('.data-set').off('mouseenter').on('mouseenter', function (event) {
                self.$('.data-set').removeClass('hover');
                self.$('.add-your-own').removeClass('hover');
                self._hideDataSetDeleteTooltip(event);
                $(this).addClass('hover');
            });
            self.$('.data-set').off('mouseleave').on('mouseleave', function (event) {
                $(this).removeClass('hover');
            });
            self.$('.data-set-delete-btn').off('mouseenter').on('mouseenter', function (event) {
                $(this).addClass('hover');
                setTimeout(function () { self._showDataSetDeleteTooltip(event); }, 100);
            });
            self.$('.data-set-delete-btn').off('mouseleave').on('mouseleave', function (event) {
                $(this).removeClass('hover');
                setTimeout(function () { self._hideDataSetDeleteTooltip(event); }, 130);
            });
            self.$('.add-your-own-btn').off('mouseenter').on('mouseenter', function (event) {
                $(this).addClass('hover');
            });
            $('.add-your-own-btn').off('mouseleave').on('mouseleave', function (event) {
                $(this).removeClass('hover');
            });
            self.$('.add-your-own').off('mouseenter').on('mouseenter', function (event) {
                self.$('.data-set').removeClass('hover');
                self.$('.add-your-own').removeClass('hover');
                self._hideDataSetDeleteTooltip(event);
                $(this).addClass('hover');
            });
            self.$('.add-your-own').off('mouseleave').on('mouseleave', function (event) {
                $(this).removeClass('hover');
            });

            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(self.$('.data-set'));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(self.$('.data-set-delete-btn'));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(self.$('.add-your-own'));
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(self.$('.add-your-own-btn'));
        },

        /**
        * Add down class when mouse button is pressed.
        *
        * @method _mouseDownEvent
        * @private
        **/
        _mouseDownEvent: function _mouseDownEvent(event) {
            $(this).addClass('down');
            $(document).on('mouseup.DataSetSelector', event.data, function (event) {
                event.data.context.$('.add-your-own,.data-set,.data-set-delete-btn').removeClass('down');
                $(this).off('mouseup.DataSetSelector');
            });
        },

        /**
        * Add down state for touch devices
        *
        * @method _touchStartEvent
        * @private
        **/
        _touchStartEvent: function _touchStartEvent(event) {
            $(this).addClass('down');
            $(document).on('touchend.DataSetSelector', event.data, function (event) {
                event.data.context.$('.add-your-own, .data-set, .data-set-delete-btn').removeClass('down');
                $(this).off('touchend.DataSetSelector');
            });
        },

        /**
        * Updates and renders data set selector view.
        *
        * @method _updateDataSetView
        * @private
        **/
        _updateDataSetView: function _updateDataSetView() {
            var self = this,
                model = self.model,
                accData = null,
                noOfEmptySets,
                toShowEmptyDataSets = model.get('showEmptyDataSets');

            if (self.dataSets.length < model.get('noOfSetsToSelect') + model.get('userDataSetLimit')) {
                self.userDataFree = true;
            } else {
                self.userDataFree = false;
            }
            if (toShowEmptyDataSets) {
                noOfEmptySets = model.get('noOfSetsToSelect') + model.get('userDataSetLimit') - self.dataSets.length - 1;
                if (noOfEmptySets === 0) {
                    toShowEmptyDataSets = false;
                }
            }
            self.$('#' + self.idPrefix + self.idSuffix + 'data-set-container').html($(self.templatePath.dataSetContainer({
                idPrefix: self.idPrefix,
                idSuffix: self.idSuffix,
                models: self.dataSets.models,
                userDataFree: self.userDataFree,
                showNumbers: self.options.showNumbers,
                addBtnText: self.options.locAccText.addBtn.loc,
                showEmptyDataSets: toShowEmptyDataSets,
                emptyDataSets: _.range(noOfEmptySets)
            })));

            self.$('.data-set-number-text').each(function (index, elem) {
                $(elem).html(parseInt($(elem).html(), 10) + 1);
            });

            self.$('.data-set-delete-btn-icon').addClass(self.getFontAwesomeClass('close'));
            self.$('.add-your-own-btn').addClass(self.getFontAwesomeClass('plus-square'));

            if (self.options.hasClearAllBtn) {
                if (self.dataSets.length > model.get('noOfSetsToSelect')) {
                    if (self.clearAllDataBtnView.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                        self.clearAllDataBtnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                    }
                    accData = {
                        'elementId': this.idSuffix + 'clear-all-btn-container',
                        'role': 'button',
                        'tabIndex': 820,
                        'acc': self.options.locAccText.clearAllBtn.acc
                    };
                    this.createAccDiv(accData);
                } else {
                    if (self.clearAllDataBtnView.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                        self.clearAllDataBtnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                    }
                }
            }

            self._bindMouseEvents();
            self._setTabIndices();
        },

        /**
        * Creates step one direction text
        *
        * @method _createDirectionText
        * @private
        **/
        _createDirectionText: function _createDirectionText() {
            var self = this,
                options = null,
                customOpt = null;

            if (self.directionTextView === null) {
                options = {
                    idPrefix: self.idPrefix,
                    containerId: self.idPrefix + self.idSuffix + 'data-set-selector-direction-text',
                    manager: self.manager,
                    player: self.player,
                    path: self.filePath,
                    text: self.options.locAccText.directionText.loc,
                    accText: self.options.locAccText.directionText.acc,
                    textColor: '#ffffff',
                    showButton: false,
                    ttsBaseClass: 'data-set-selector tts-button-custom-blue',
                    tabIndex: 500
                };

                if (self.options.directionText) {
                    customOpt = {
                        textColor: self.options.directionText.textColor || '#ffffff',
                        ttsBaseClass: self.options.directionText.ttsBaseClass || 'tts-button-custom-blue',
                    };
                    if (self.options.directionText.btn) {
                        customOpt.showButton = true,
                        customOpt.btnBaseClass = self.options.directionText.btn.baseClass || 'data-selector-btn-class',
                        customOpt.clickCallback = self.options.directionText.btn.callBack,
                        customOpt.btnTextColor = self.options.directionText.btn.textColor || '#fff',
                        customOpt.buttonText = self.options.locAccText.directionText.btn.loc,
                        customOpt.buttonAccText = self.options.locAccText.directionText.btn.acc
                    }
                }
                $.extend(options, customOpt);
                self.directionTextView = new MathInteractives.global.Theme2.DirectionText.generateDirectionText(options);
            }
        },

        _initLocAccText: function _initLocAccText() {
            var locAccText = this.options.locAccText;

            locAccText = locAccText || {};
            locAccText.directionText = locAccText.directionText || {};
            locAccText.directionText.btn = locAccText.directionText.btn || {};
            locAccText.addBtn = locAccText.addBtn || {};
            locAccText.deletePopup = locAccText.deletePopup || {};
            locAccText.clearAllBtn = locAccText.clearAllBtn || {};
            locAccText.dataSetContainer = locAccText.dataSetContainer || {};
            locAccText.noUserDatasetText = locAccText.noUserDatasetText || {};
            locAccText.dataSetSelectInstruction = locAccText.dataSetSelectInstruction || {};
            locAccText.clearAllPopup = locAccText.clearAllPopup || {};
            locAccText.deleteDataPopup = locAccText.deleteDataPopup || {};
            locAccText.clearAllPopup.title = locAccText.clearAllPopup.title || {};
            locAccText.clearAllPopup.body = locAccText.clearAllPopup.body || {};
            locAccText.clearAllPopup.okBtn = locAccText.clearAllPopup.okBtn || {};
            locAccText.clearAllPopup.cancelBtn = locAccText.clearAllPopup.cancelBtn || {};
            locAccText.deleteDataPopup.title = locAccText.deleteDataPopup.title || {};
            locAccText.deleteDataPopup.body = locAccText.deleteDataPopup.body || {};
            locAccText.deleteDataPopup.okBtn = locAccText.deleteDataPopup.okBtn || {};
            locAccText.deleteDataPopup.cancelBtn = locAccText.deleteDataPopup.cancelBtn || {};

            this.options.locAccText = locAccText;
        },

        _setTabIndices: function _setTabIndices() {
            var i = 0,
                self = this,
                dataSets = self.model.get('dataSets'),
                dataSetAccText = null,
                dataSetContainerAccText = null,
                accData = {};

            if (self.options.locAccText.dataSetContainer.acc) {
                if (self.options.locAccText.dataSetContainer.acc.indexOf('%@$%') !== -1) {
                    dataSetContainerAccText = self.options.locAccText.dataSetContainer.acc.replace('%@$%', self.getDataSetCount());
                }
                if (self.options.locAccText.dataSetContainer.acc.indexOf('%U_COUNT%') !== -1) {
                    dataSetContainerAccText = self.options.locAccText.dataSetContainer.acc.replace('%U_COUNT%', self.dataSets.getUserDataSets().length);
                }
            }

            accData = {
                'elementId': self.idSuffix + 'data-set-selector-area',
                'tabIndex': 600,
                'acc': dataSetContainerAccText || self.options.locAccText.dataSetContainer.acc || ''
            };
            self.createAccDiv(accData);

            for (i = 0; i < dataSets.length; i++) {
                if (self.options.locAccText.dataSetSelectInstruction.acc) {
                    dataSetAccText = self.options.locAccText.dataSetSelectInstruction.acc.replace('%DSN%', dataSets.at(i).get('dataSetAccName') || dataSets.at(i).get('dataSetName'));
                } else if (dataSets.at(i).get('dataSetAccName')) {
                    dataSetAccText = dataSets.at(i).get('dataSetAccName').replace('%DSN%', dataSets.at(i).get('dataSetName'));
                } else {
                    dataSetAccText = dataSets.at(i).get('dataSetName');
                }

                accData = {
                    'elementId': self.idSuffix + 'data-set-' + i,
                    'offsetTop': 7,
                    'offsetLeft': 7,
                    'tabIndex': 620 + i * 5,
                    'acc': dataSetAccText
                };

                if(self.isRoleButtonEnabled) {
                    accData.role = 'button';
                }
                self.createAccDiv(accData);

                if (i >= self.model.get('noOfSetsToSelect')) {
                    accData = {
                        'elementId': self.idSuffix + 'data-set-delete-btn-' + i,
                        'role': 'button',
                        'tabIndex': (620 + i * 5) + 2,
                        'acc': self.options.locAccText.deletePopup.acc
                    };
                    self.createAccDiv(accData);
                }
            }
            accData = {
                'elementId': self.idSuffix + 'add-your-own',
                'offsetTop': 7,
                'offsetLeft': 7,
                'tabIndex': 695,
                'acc': self.options.locAccText.addBtn.acc
            };
            if(self.isRoleButtonEnabled) {
                accData.role = 'button';
            }
            self.createAccDiv(accData);
        },

        //_resolvePlaceholders: function _resolvePlaceholders(text) {
        //    if (text.search('%DSN%') !== -1) {
        //        text = text.replace('%DSN%', dataSets.at(i).get('dataSetName'));
        //    }
        //},

        //_resolvePlaceholders: function _resolvePlaceholders(text) {
        //    if (text.search('%DSN%') !== -1) {
        //        text = text.replace('%DSN%', dataSets.at(i).get('dataSetName'));
        //    }
        //},

        getDataSetCount: function () {
            return this.dataSets.length;
        },

        createDataSet: function createDataSet(attributes) {
            return new MathInteractives.Common.Player.Models.BaseInteractive(attributes);
        },

        /**
        * Creates view of clear all data set button.
        *
        *@method _createButtons
        *@private
        **/
        _createButtons: function _createButtons() {
            var self = this,
                options = null,
                buttonObj = self.options.buttons,
                index, accData = {};

            if (self.options.hasClearAllBtn) {
                options = {
                    player: self.player,
                    manager: self.manager,
                    path: self.filePath,
                    idPrefix: self.idPrefix,
                    data: {
                        id: self.idPrefix + self.idSuffix + 'clear-all-btn-container',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        text: self.options.locAccText.clearAllBtn.loc,
                        baseClass: 'data-selector-btn-class',
                        width: 163,
                        height: 38
                    }
                };

                self.clearAllDataBtnView = MathInteractives.global.Theme2.Button.generateButton(options);
            }
            if (buttonObj) {
                for (index = 0; index < buttonObj.length; index++) {
                    self.$('#' + self.idPrefix + self.idSuffix + 'data-set-selector-area')
                        .append($('<div>', {
                            id: self.idPrefix + self.idSuffix + buttonObj[index].container + '-container',
                            class: 'data-set-selector ' + buttonObj[index].container + '-container button-container'
                        }));

                    options = {
                        player: self.player,
                        manager: self.manager,
                        path: self.filePath,
                        idPrefix: self.idPrefix,
                        data: {
                            id: self.idPrefix + self.idSuffix + buttonObj[index].container + '-container',
                            type: buttonObj[index].type || MathInteractives.global.Theme2.Button.TYPE.TEXT,
                            text: buttonObj[index].text,
                            baseClass: buttonObj[index].baseClass || 'data-selector-btn-class',
                            icon: buttonObj[index].icon,
                            width: buttonObj[index].width || 0
                        }
                    };
                    self[buttonObj[index].name] = MathInteractives.global.Theme2.Button.generateButton(options);
                    var btnCallBack = buttonObj[index].callback;
                    self[buttonObj[index].name].$el.off('click').on('click', { callBack: btnCallBack }, function (event) {
                        self.stopReading();
                        if (event.data.callBack) {
                            event.data.callBack(event);
                        }
                    });
                    accData = {
                        'elementId': self.idSuffix + buttonObj[index].container + '-container',
                        'role': 'button',
                        'tabIndex': 700 + 5 * index,
                        'acc': buttonObj[index].accText || buttonObj[index].text
                    };
                    self.createAccDiv(accData);
                }
            }
        },

        showSelector: function showSelector() {
            var self = this;

            self.$el.show();
            self.focus();
            self.dataSetSelected = false;
        },

        hideSelector: function hideSelector() {
            var self = this;

            self.stopReading();
            self.$el.hide();
        },

        /**
        * Generates delete dataset tooltip.
        *
        *@method _generateTooltips
        *@private
        **/
        _generateTooltips: function _generateTooltips() {
            var self = this,
                idPrefix = self.idPrefix,
                toolTipView = MathInteractives.Common.Components.Theme2.Views.Tooltip,
                globalToolTip = MathInteractives.global.Theme2.Tooltip,
                toolTipOptions = {
                    _player: self.player,
                    idPrefix: self.idPrefix,
                    manager: self.manager,
                    path: self.filePath,
                    type: toolTipView.TYPE.GENERAL,
                    isTts: false
                };

            toolTipOptions.isArrow = true;
            toolTipOptions.arrowType = toolTipView.ARROW_TYPE.TOP_MIDDLE;
            toolTipOptions.elementEl = self.idPrefix + self.idSuffix + 'delete-dataset-tooltip-container';
            toolTipOptions.text = self.options.locAccText.deletePopup.loc;
            toolTipOptions.accText = self.options.locAccText.deletePopup.acc;
            self.dataSetDeleteTooltip = globalToolTip.generateTooltip(toolTipOptions);
            self.dataSetDeleteTooltip.hideTooltip();
        },

        /**
        * Shows and sets position of delete dataset tooltip.
        *
        *@method _showDataSetDeleteTooltip
        *@private
        **/
        _showDataSetDeleteTooltip: function _showDataSetDeleteTooltip(event) {
            var self = this;

            self.dataSetDeleteTooltip.elementEl = event.target.id;
            self.dataSetDeleteTooltip.showTooltip();
        },

        /**
        * Hides delete dataset tooltip.
        *
        *@method _hideDataSetDeleteTooltip
        *@private
        **/
        _hideDataSetDeleteTooltip: function _hideDataSetDeleteTooltip() {
            this.dataSetDeleteTooltip.hideTooltip();
        },

        /**
        * Generates and shows pop up for clear all data set.
        *
        *@method _createClearAllPopup
        *@private
        **/
        _createClearAllPopup: function _createClearAllPopup() {
            var self = this,
                options = null;

            self.stopReading();
            options = {
                player: self.player,
                manager: self.manager,
                path: self.filePath,
                idPrefix: self.idPrefix,
                title: self.options.locAccText.clearAllPopup.title.loc,
                accTitle: self.options.locAccText.clearAllPopup.title.acc,
                text: self.options.locAccText.clearAllPopup.body.loc,
                accText: self.options.locAccText.clearAllPopup.body.acc,
                titleTextColorClass: 'data-set-selector popup-title',
                bodyTextColorClass: 'data-set-selector popup-body',
                buttonTextColor: '#000000',
                containsTts: true,
                width: '440',
                buttons: [
                    {
                        id: self.idSuffix + 'clear-all-ok-button',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        text: self.options.locAccText.clearAllPopup.okBtn.loc,
                        clickCallBack: { fnc: self._clearAllUserDataSets, scope: self },
                        baseClass: 'data-set-selector popup-button',
                        height: 34,
                        width: 112
                    },
                   {
                       id: self.idSuffix + 'clear-all-cancel-button',
                       type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                       text: self.options.locAccText.clearAllPopup.cancelBtn.loc,
                       clickCallBack: { fnc: self._clearAllCancel, scope: self },
                       baseClass: 'data-set-selector popup-button',
                       height: 34,
                       width: 112
                   }
                ]
            };
            MathInteractives.global.Theme2.PopUpBox.createPopup(options);
        },

        /**
        * ######## This method is obsolete ########
        * Adds new data set or updates existing data set to data set selector collection using index matching.
        *
        * @method addDataSet
        * @public
        **/
        addDataSet: function addDataSet(dataSet) {
            var self = this,
                existing = self.dataSets.getDataSetByIndex(dataSet.dataSetIndex);

            if (existing.length === 0) {
                self.dataSets.add(dataSet);
                self._updateDataSetView();
            } else {
                $.extend(existing[0].attributes, dataSet);
                self._updateDataSetView();
            }
        },

        /**
        * Adds new data set or updates existing data set to data set selector collection.
        *
        * @method addOrUpdateDataSet
        * @public
        **/
        addOrUpdateDataSet: function addOrUpdateDataSet(dataSet) {
            var self = this;

            self.dataSets.add(dataSet);
            self.model.set('dataSets', self.dataSets);
            self._updateDataSetView();
            self.trigger(self.EVT_SEL_DATASET, { dataSet: dataSet, index: self.dataSets.indexOf(dataSet) });
        },

        /**
        * Triggers data set delete event.
        *
        * @method _triggerDeleteEvent
        * @private
        **/
        _triggerDeleteEvent: function _triggerDeleteEvent(event) {
            var self = this;
            event.stopPropagation();
            self.stopReading();
            self._hideDataSetDeleteTooltip();
            self.dataSetDeleteIndex = $(event.currentTarget).attr('data-set-index');
            self.trigger(self.EVT_DEL_DATASET, { dataSetName: self.dataSets.getDataSetByIndex(self.dataSetDeleteIndex).get('dataSetName') });
        },

        /**
        * Generates and shows pop up for delete data set.
        *
        *@method _createDeleteConfirmPopup
        *@private
        **/
        _createDeleteConfirmPopup: function _createDeleteConfirmPopup() {
            if (this.isPopupExist) {
                return;
            }
            var self = this,
                options = {
                    player: self.player,
                    manager: self.manager,
                    path: self.filePath,
                    idPrefix: self.idPrefix,
                    title: self.options.locAccText.deleteDataPopup.title.loc,
                    accTitle: self.options.locAccText.deleteDataPopup.title.acc,
                    text: self.options.locAccText.deleteDataPopup.body.loc,
                    accText: self.options.locAccText.deleteDataPopup.body.acc,
                    titleTextColorClass: 'data-set-selector popup-title',
                    bodyTextColorClass: 'data-set-selector popup-body',
                    buttonTextColor: '#000000',
                    containsTts: true,
                    buttons: [
                        {
                            id: self.idSuffix + 'delete-data-set-ok-button',
                            type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                            text: self.options.locAccText.deleteDataPopup.okBtn.loc,
                            clickCallBack: { fnc: self._deleteDataSet, scope: self },
                            baseClass: 'data-set-selector popup-button',
                            height: 34,
                            width: 112
                        },
                       {
                           id: self.idSuffix + 'clear-all-cancel-button',
                           type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                           text: self.options.locAccText.deleteDataPopup.cancelBtn.loc,
                           clickCallBack: { fnc: self._deleteCancel, scope: self },
                           baseClass: 'data-set-selector popup-button',
                           height: 34,
                           width: 112
                       }
                    ]
                };

            this.isPopupExist = true;
            MathInteractives.global.Theme2.PopUpBox.createPopup(options);
            
        },

        /**
        * change the loc-acc text of delete dataset popup message
        *
        * @method changeDeleteDataSetMessage
        * @public
        * @params {object} text loc-acc text object
        **/
        changeDeleteDataSetMessage: function changeDeleteDataSetMessage(text) {
            var self = this;

            if (text !== null) {
                self.options.locAccText.deleteDataPopup.body.loc = text.loc;
                self.options.locAccText.deleteDataPopup.body.acc = text.acc;
                self._createDeleteConfirmPopup();
            } else {
                self.log('No loc text found.');
            }
        },

        /**
        * Removes all user data sets.
        * Calls _updateDataSetView().
        *
        *@method _clearAllUserDataSets
        *@private
        **/
        _clearAllUserDataSets: function _clearAllUserDataSets() {
            var self = this,
                userDataSets = self.dataSets.getUserDataSets();

            self.dataSets.remove(userDataSets);
            self._updateDataSetView();
            self.trigger(self.EVT_DEL_ALL_DATASET);
            self.setFocus(self.idSuffix + 'data-set-selector-area');
        },

        focus: function focus() {
            var self = this;
            self.setFocus(self.idSuffix + 'data-set-selector-direction-text-direction-text-text');
        },

        _clearAllCancel: function _clearAllCancel() {
            var self = this;
            self.setFocus(self.idSuffix + 'clear-all-btn-container');
        },

        _deleteCancel: function _deleteCancel() {
            var self = this;
            self.setFocus(self.idSuffix + 'data-set-delete-btn-' + self.dataSetDeleteIndex);
            this.isPopupExist = false;
        },

        /**
        * Triggers data set selected event.
        *
        *@method _selectDataSet
        *@private
        **/
        _selectDataSet: function _selectDataSet(event) {
            var self = this,
                selectedDataSetIndex = null;

            self.stopReading();
            self.dataSetSelected = true;
            $(event.currentTarget).removeClass('hover');
            self.dataSetSelected = false;

            selectedDataSetIndex = $(event.currentTarget).attr('data-set-index');
            if (selectedDataSetIndex) {
                self.trigger(self.EVT_SEL_DATASET, { dataSet: self.dataSets.getDataSetByIndex(selectedDataSetIndex), index: selectedDataSetIndex });
            }
        },

        /**
        * Triggers add data set event.
        *
        *@method _addYourOwnDataSet
        *@private
        **/
        _addYourOwnDataSet: function _addYourOwnDataSet() {
            var self = this;

            self.stopReading();
            self.dataSetSelected = true;
            self.trigger(self.EVT_ADD_DATASET);
        },

        /**
        * Deletes data set.
        * Calls _updateDataSetView().
        *
        *@method _deleteDataSet
        *@private
        **/
        _deleteDataSet: function _deleteDataSet() {
            var self = this,
                datasetProperties = {},
                deleteDataSet = self.dataSets.getDataSetByIndex(self.dataSetDeleteIndex);

            self.dataSets.remove(deleteDataSet);
            self._updateDataSetView();
            if (self.dataSetDeleteIndex == self.dataSets.length) { // as dataSetDeleteIndex is string
                self.setFocus(this.idSuffix + 'add-your-own');
            } else {
                self.setFocus(this.idSuffix + 'data-set-' + self.dataSetDeleteIndex);
            }

            datasetProperties.dataSetDeleteIndex = self.dataSetDeleteIndex;

            self.trigger(thisView.EVT_DEL_POPUP_OK_CLICKED, datasetProperties);
            this.isPopupExist = false;

        },

        /*
        *  Sets help instruction
        *
        * @method setHelpElements
        * @public
        */

        setHelpElements: function setHelpElements(helpElements, customHelpText) {
            var self = this,
                buttonObj = self.options.buttons,
                index,
                constantHelpElemWidth = MathInteractives.Common.Components.Theme2.Models.DataSetSelectorModel.DATA_SET_HELP_ELEM_WIDTH,
                helpElemWidth = this.model.getHelpElementWidth(),
                datasetHelpWidth = helpElemWidth.datasetHelpWidth || constantHelpElemWidth.DATA_SET_HELP_WIDTH,
                addYourOwnHelpWidth = helpElemWidth.addYourOwnHelpWidth || constantHelpElemWidth.ADD_YOUR_OWN_HELP_WIDTH,
                deleteHelpWidth = helpElemWidth.deleteHelpWidth || self.player.getTextHeightWidth(self.getMessage(customHelpText.deleteDataset, 0)).width;
            this.getMessage(customHelpText.datasetSelect, 0);
            helpElements.push(
                    {
                        elementId: self.idSuffix + 'data-set-container',
                        helpId: customHelpText.datasetSelect, msgId: 0,
                        fromElementCenter: true,
                        tooltipWidth: datasetHelpWidth,
                        hideArrowDiv: true
                    },
                    {
                        elementId: self.idSuffix + 'add-your-own',
                        helpId: customHelpText.addYourOwn,
                        msgId: 0, position: 'bottom',
                        tooltipWidth: addYourOwnHelpWidth,
                        dynamicArrowPosition: true
                    },
                    {
                        elementId: self.idSuffix + 'data-set-delete-btn-' + this.model.get('noOfSetsToSelect'),
                        helpId: customHelpText.deleteDataset, msgId: 0,
                        position: 'bottom',
                        tooltipWidth: deleteHelpWidth,
                        dynamicArrowPosition: true
                    }
                );

            if (buttonObj) {
                for (index = 0; index < buttonObj.length; index++) {
                    if (buttonObj[index].helpElement) {
                        helpElements.push(
                            {
                                elementId: self.idSuffix + buttonObj[index].container + '-container',
                                helpId: buttonObj[index].helpElement.helpId, msgId: (buttonObj[index].helpElement.msgId || 0),
                                position: (buttonObj[index].helpElement.position || 'top'),
                                tooltipWidth: (buttonObj[index].helpElement.width || 210),
                                dynamicArrowPosition: true
                            }
                        );
                    }
                }
            }

            helpElements.push(
                   {
                       elementId: self.idSuffix + 'clear-all-btn-container',
                       helpId: customHelpText.clearAll, msgId: 0,
                       position: 'top', tooltipWidth: 180,
                       dynamicArrowPosition: true
                   }
               );

        }
    }, {
        createSelectorScreen: function createSelectorScreen(options) {
            if (options.containerId === null) {
                console.log('No id specified');
                return;
            }

            var dataSelectorModel, dataSelectorView, id = '#' + options.containerId;
            dataSelectorModel = new MathInteractives.Common.Components.Theme2.Models.DataSetSelectorModel(options.data);
            dataSelectorView = new MathInteractives.Common.Components.Theme2.Views.DataSetSelectorView({
                el: id,
                model: dataSelectorModel,
                idSuffix: options.idSuffix,
                locAccText: options.locAccText,
                showNumbers: options.showNumbers,
                directionText: options.directionText,
                hasClearAllBtn: options.hasClearAllBtn,
                buttons: options.buttons,
                isRoleButtonEnabled: options.isRoleButtonEnabled
            });

            return dataSelectorView;
        },

        /**
        * Fired when add you own data set button is clicked.
        *
        * @event EVT_ADD_DATASET
        */
        EVT_ADD_DATASET: 'addDataSetClicked',

        /**
         * Fired when a data set is selected from selector step screen.
         *
         * @event EVT_SEL_DATASET
         * @param {Object} dataSet A data set model containing data to fill table or grid.
         */
        EVT_SEL_DATASET: 'dataSetSelected',

        /**
         * Fired by data set delete btn of selector step screen.
         *
         * @event EVT_DEL_DATASET
         * @param {Object} data A object containing dataset name.
         */
        EVT_DEL_DATASET: 'deleteDataSet',

        EVT_DEL_POPUP_OK_CLICKED: 'deleteDataSetPopupOkClicked',

        /**
         * Fired by clear all data btn from selector step screen.
         *
         * @event EVT_DEL_ALL_DATASET
         */
        EVT_DEL_ALL_DATASET: 'deleteAllDataSet',

        USER_DATASET_COUNT: '%U_COUNT%'
    });

    thisView = MathInteractives.Common.Components.Theme2.Views.DataSetSelectorView;
    MathInteractives.global.Theme2.DataSelector = MathInteractives.Common.Components.Theme2.Views.DataSetSelectorView;

})(window.MathInteractives);
