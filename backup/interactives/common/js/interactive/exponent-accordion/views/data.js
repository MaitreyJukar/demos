(function () {
    'use strict';
    var namespace = MathInteractives.Common.Interactivities.ExponentAccordion.Views;
    /**
    * Class for Exponent Accordion main view ,contains properties and methods of Exponent Accordion main view.
    * @class FormExpression
    * @module ExponentAccordion
    * @namespace MathInteractives.Interactivities.ExponentAccordion.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    namespace.Data = MathInteractives.Common.Player.Views.Base.extend({

        directionBoxView: null,
        accordionView: null,
        resetPopupView: null,
        $arrowHelp: null,
        _$animationDiv: null,
        /**
        * Initializes the Form Expression View
        *
        * @method initialize
        **/
        initialize: function () {
            this.initializeDefaultProperties();
            this.loadScreen('data-tab-direction-text-screen');
            this.loadScreen('data-tab-screen');
            this.unloadScreen('expression-text');
            this.loadScreen('expression-text');
            this.$arrowHelp = this.$('.dummy-help-arrow-div');
            this._$animationDiv = this.$('.animation-progress-div').hide();
            this._render();
            this._bindEvents();
            this.player.bindTabChange(function () {
                this._generateAccordion();
                this._clearAllDataBtnStatus();
                this._updateFocusRects();
                if (this.model.get('viewDataBtnClick')) {
                    this.setFocus('header-subtitle', 20);
                }
                else {
                    this.setFocus('data-tab-direction-text-direction-text-text');
                }
                this.model.set('viewDataBtnClick', false);
                this.updateFocusRect('data-tab-main-container');
            }, this, 3);
        },


        _render: function () {
            this._setBackgroundImage();
            this._renderDirectionText();
            this._generateButtons();
            this._generateAccordion();
            this.loadScreen('data-tab-buttons-screen');
        },


        _clearAllDataBtnStatus: function _clearAllDataBtnStatus() {
            if (this.model.get('accordionEquationData').length) {
                this.clearDataButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.player.enableHelpElement('clear-data-button', 0, true);
            }
            else {
                this.clearDataButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                this.player.enableHelpElement('clear-data-button', 0, false);
            }
        },

        _generateButtons: function _generateButtons() {
            var ButtonClass, buttonProperties;
            ButtonClass = MathInteractives.global.Theme2.Button;
            buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'back-button',
                    text: this.getMessage('back-button-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    baseClass: 'btn-yellow',
                    textColor: '#222222',
                    icon: {
                        'faClass': this.getFontAwesomeClass('back'),
                        'fontSize': 14,
                        'fontColor': '#222222',
                        'fontWeight': 'bold',
                        'height': 14,
                        'width': 16
                    },
                    width: 115
                }
            };
            this.backButtonView = new ButtonClass.generateButton(buttonProperties);
            buttonProperties.data.id = this.idPrefix + 'clear-data-button';
            buttonProperties.data.text = this.getMessage('clear-data-button-text', 0);
            buttonProperties.data.icon.faClass = this.getFontAwesomeClass('trash');
            buttonProperties.data.icon.height = 16;
            buttonProperties.data.width = null;
            this.clearDataButtonView = new ButtonClass.generateButton(buttonProperties);
        },


        _setBackgroundImage: function _setBackgroundImage() {
            this.$el.css({ 'background-image': 'url("' + this.getImagePath('sprites') + '")' }).addClass('bg');
        },

        /**
        * Renders direction text
        *
        * @method _renderDirectionText
        * @private
        **/
        _renderDirectionText: function _renderDirectionText() {
            if (this.directionBoxView === null) {
                var viewDataBtnTabIndex = this.getTabIndex('view-data-button');
                this.directionBoxView = new MathInteractives.global.Theme2.DirectionText.generateDirectionText({
                    idPrefix: this.idPrefix,
                    containerId: this.idPrefix + 'data-tab-direction-text',
                    manager: this.manager,
                    player: this.player,
                    path: this.filePath,
                    text: this.getMessage('data-tab-instuction-text', 0),
                    accText: this.getAccMessage('data-tab-instuction-text', 0),
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
                    tabIndex: viewDataBtnTabIndex + 1,
                    buttonTabIndex: 4000
                });
            }
        },

        _tryAnotherBtnStatus: function (value) {
            if (value === true) {
                this.directionBoxView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.player.enableHelpElement('data-tab-direction-text-direction-text-buttonholder', 0, true);

            }
            else {
                this.directionBoxView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                this.player.enableHelpElement('data-tab-direction-text-direction-text-buttonholder', 0, false);
            }
        },

        _showResetPopup: function _showResetPopup() {
            this.resetPopupView = MathInteractives.global.Theme2.PopUpBox.createPopup({
                text: this.getMessage('clear-all-popup', 'text'),
                title: this.getMessage('clear-all-popup', 'title'),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                buttons: [
                    {
                        id: this.idPrefix + 'yes-btn',
                        text: this.getMessage('clear-all-popup', 'yes'),
                        response: { isPositive: true, buttonClicked: this.idPrefix + 'yes-btn' },
                        clickCallBack: {
                            fnc: this._clearAllData,
                            scope: this
                        }
                    },
                    {
                        id: this.idPrefix + 'cancel-btn',
                        text: this.getMessage('clear-all-popup', 'cancel'),
                        response: { isPositive: false, buttonClicked: this.idPrefix + 'cancel-btn' },
                        clickCallBack: {
                            fnc: this._onClickCancelOfClearDataPopup,
                            scope: this
                        }
                    }
                ]
            });
        },

        _clearAllData: function _clearAllData() {
            this.player.switchToTab(1);
            this.model.set('accordionEquationData', []);
            this.model.set('currentEquationDataIndex', -1);
            this.model.set('clearAllData', true);
            this.model.set('accordionEquationData', []);
            this.model.set('noOfRowsRendered', 0);
            this.model.set('accordionRowsToDelete', 0);
            this.model.set('currentEquationDataIndex', -1);
            this.accordionView.destroyAccordion();
            this.accordionView.$el.empty().off();
            this.accordionView = null;
            this._generateAccordion();
        },

        _onClickCancelOfClearDataPopup: function () {
            this.setFocus('clear-data-button');
        },

        _clickedTryAnother: function _clickedTryAnother() {
            this.stopReading();
            this._showTryAnotherPopup();
        },

        _showTryAnotherPopup: function _showTryAnotherPopup() {
            this.tryAnotherPopupView = MathInteractives.global.Theme2.PopUpBox.createPopup({
                text: this.getMessage('try-another-popup', 'text-workspace'),
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
                        fnc: this._goToExploreTab,
                        scope: this
                    }
                },
                          {
                              id: this.idPrefix + 'cancel-btn',
                              text: this.getMessage('try-another-popup', 'cancel'),
                              response: { isPositive: false, buttonClicked: this.idPrefix + 'cancel-btn' },
                              clickCallBack: {
                                  fnc: this._onClickCancel,
                                  scope: this
                              }
                          }]
            });
        },

        _goToExploreTab: function () {
            this.model.set('currentTab', 2);
            this.model.set('dataTabTryAnotherClick', true);
            this.player.switchToTab(2);
        },

        _onClickCancel: function () {
            this.setFocus('data-tab-direction-text-direction-text-buttonholder');
        },

        //events: {
        //    'click .back-button.clickEnabled': '_backButtonClick',
        //    'click .clear-data-button.clickEnabled': '_clearDataButtonClick'
        //},

        _bindEvents: function _bindEvents() {
            var self = this;
            this.backButtonView.$el.off('click').on('click', function () {
                if ($(this).hasClass('clickEnabled')) {
                    self._backButtonClick();
                }
            });
            this.clearDataButtonView.$el.off('click').on('click', function () {
                if ($(this).hasClass('clickEnabled')) {
                    self._clearDataButtonClick();
                }
            });
        },

        _backButtonClick: function _backButtonClick() {
            var previousTab = this.model.get('dataPreviousTab');
            this.stopReading();
            this.model.set('currentTab', previousTab);
            this.model.set('currentView', this.model.get('previousView'));
            this.model.set('backButtonClick', true);
            this.player.switchToTab(previousTab);

        },

        _clearDataButtonClick: function _clearDataButtonClick() {
            this.stopReading();
            this._showResetPopup();

        },

        _generateAccordion: function _generateAccordion() {
            var accordionData = this.model.get('accordionEquationData'), accordionProperties, data,
                currentEquationDataIndex = this.model.get('currentEquationDataIndex'), i,
                noOfRowsRendered = this.model.get('noOfRowsRendered'),
                accordionRowsToDelete = this.model.get('accordionRowsToDelete'),
                currentTab = this.model.get('currentTab');

            this._tryAnotherBtnStatus(this.model.get('tryAnotherBtnStatus'));
            if (currentTab !== 3) {
                this.model.set('dataPreviousTab', currentTab);
                this.model.set('previousView', this.model.get('currentView'));
            }
            this.model.set('currentTab', 3);
            this.model.set('currentView', MathInteractives.Common.Interactivities.ExponentAccordion.Models.ExponentAccordion.CURRENT_VIEW.DATA);
            if (accordionData.length === 0) {
                this.$arrowHelp.hide();
            }
            else {
                this.$arrowHelp.show();
            }
            if (this.accordionView === null) {
                this.model.set('noOfRowsRendered', accordionData.length);
                accordionProperties = {
                    player: this.player,
                    containerId: this.idPrefix + 'accordion-container',
                    isTts: false,
                    data: accordionData,
                    accordionSetting: {
                        active: false,
                        animate: true,
                    },
                    headerBaseClass: 'accordion-data-header-class',
                    contentBaseClass: 'accordion-data-content-class',
                    icon: { 'header': this.filePath.getFontAwesomeClass('slide-down'), 'activeHeader': this.filePath.getFontAwesomeClass('slide-up') },
                    isHeaderClickDisable: true,
                    screen: 'accordion-screen',
                    $animationDiv: this._$animationDiv
                }
                this.accordionView = new MathInteractives.Common.Interactivities.ExponentAccordion.Views.DerivedAccordion.createAccordion(accordionProperties);
                this.listenTo(this.accordionView, MathInteractives.Common.Interactivities.ExponentAccordion.Views.DerivedAccordion.ACCORDION_HEADER_ICON_CLICK, this._onClickHeaderIcon);
                this.listenTo(this.accordionView, MathInteractives.Common.Components.Theme2.Views.Accordion.ACCORDION_CHANGE_EVENT, this._onChangeAccordion);

            }
            else {
                if (this.model.get('isAccordionEqnDataChanged') === true) {
                    var resetRow = noOfRowsRendered - 1, resettedData;
                    resettedData = accordionData[resetRow];
                    if (resettedData !== undefined) {
                        //if (resettedData.steps.length === 0) {
                        this.accordionView.removeAccordion(resetRow);
                        this.accordionView.addAccordion(resettedData);
                        //}
                    }

                    if (accordionRowsToDelete) {
                        var temp = noOfRowsRendered > accordionRowsToDelete ? noOfRowsRendered : accordionRowsToDelete;
                        for (i = 0; i < temp; i++) {
                            this.accordionView.removeAccordion(0);
                            noOfRowsRendered -= 1;
                            this.model.set('noOfRowsRendered', noOfRowsRendered - 1);
                        }
                    }
                    if (noOfRowsRendered - 1 <= currentEquationDataIndex) {
                        if (noOfRowsRendered === currentEquationDataIndex + 1) {
                            data = accordionData[accordionData.length - 1];
                            if (data !== undefined) {
                                this.accordionView.removeAccordion(currentEquationDataIndex);
                                this.accordionView.addAccordion(data);
                            }
                        }
                        else {
                            for (i = noOfRowsRendered; i <= currentEquationDataIndex; i++) {
                                data = accordionData[i];
                                this.accordionView.addAccordion(data);
                                this.model.set('noOfRowsRendered', this.model.get('noOfRowsRendered') + 1);
                            }
                        }

                    }
                    this.model.set('accordionRowsToDelete', 0);

                }
            }
            this.model.set('isAccordionEqnDataChanged', false);

        },


        _updateFocusRects: function () {
            var accObjects = this.accordionView.getAccObjects(),
                accObjectsLen = accObjects.length, i = 0;
            for (; i < accObjectsLen; i++) {
                this.updateFocusRect(accObjects[i].elemId.replace(this.idPrefix, ''));
            }
            //this.accordionView.setAccObjects();
        },


        _onClickHeaderIcon: function _onClickHeaderIcon(event) {
            var headerNo = event.data.headerNo;
            //set focus to the first row of content
            this.headerNo = headerNo;
            this.headerIcon = $(event.target);
            this.stopReading();

        },

        _onChangeAccordion: function (event, ui) {
            this._updateFocusRects();
            /*if (this.previousHeaderNo === this.headerNo && this.accordionView.$el.find('.ui-state-active').length === 0) {
                //this.setFocus(this.headerIcon.attr('id').replace(this.idPrefix, ''), 500);
                this.setFocus(ui.oldHeader.find('.accordion-header-content').attr('id').replace(this.idPrefix, ''), 500);
            }
            else {
                this.setFocus('panel-row-container' + this.headerNo + '0', 500);

            }*/
            this.previousHeaderNo = this.headerNo;
        }


    }, {


    });
})()
