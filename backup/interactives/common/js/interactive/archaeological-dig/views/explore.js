(function () {
    'use strict';

    var namespace = MathInteractives.Common.Interactivities.ArchaeologicalDig.Views;
    var archaeologicalDigMainClass;
    /**
    * Class for Archaeological Dig main view ,contains properties and methods of Archaeological Dig main view.
    * @class Explore
    * @module ArchaeologicalDig
    * @namespace MathInteractives.Interactivities.ArchaeologicalDig.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    namespace.Explore = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Stores Current type of interactivity
        * @property type
        * @default null
        * @private
        */
        type: null,
        /**
        * Holds the view of direction text.
        * @property directionTextView
        * @default null
        * @private
        */
        directionTextView: null,

        /**
        * Holds the view of left panel.
        * @property leftPanelView
        * @default null
        * @private
        */
        leftPanelView: null,
        /**
        * Holds the view of right panel.
        * @property rightPanelView
        * @default null
        * @private
        */
        rightPanelView: null,
        /**
        * Holds the name of current artifact
        * @property currentArtifact
        * @default null
        * @private
        */
        currentArtifact: null,


        /**
        * Initializes main view
        *
        * @method initialize
        * @public 
        **/
        initialize: function () {
            var activityAreaAccId = 'main-activity-area-container',
                self = this,
                directionTextAccID = 'direction-text-container-direction-text-text'

            this.initializeDefaultProperties();
            this.player.bindTabChange(function (data) {
                var steperObject = this.model.get('steperStatus');
                if (steperObject.isDigEnable === true) {
                    this.enableTab('dig-button-container', true);
                }
                else {
                    this.enableTab('dig-button-container', false);
                }
                this.updateFocusRect(directionTextAccID);
                if (data.isLetsGoClicked !== true && data.currentActiveTab === 1) {
                    this.setFocus(directionTextAccID);
                }


            }, this, 1);

            this.type = this.model.get('type');

            if (this.type === 1) {
                this.loadScreen('archaeological-dig-1');
            }
            else {
                this.loadScreen('archaeological-dig-2');
            }

            this.loadScreen('help-screen');
            this._attachEvents()._render();
            this._setHelpElements();
            this.setAccMessageFor(activityAreaAccId);
        },
        /**
        * Sets Acc message for specified acc id 
        *
        * @method setAccMessageFor
        * @public 
        * @param {string} accId id of acc div of which acc message has to change
        **/
        setAccMessageFor: function setAccMessageFor(accId) {
            var activityAreaMessage = '',
                param = [],
                currentArtifact = this.model.get('currentArtifact'),
                addNumber = 0,
                from = ((this.model.get('type') === 1) ? 0 : -3),
                to = ((this.model.get('type') === 1) ? 5 : 3);

            if (currentArtifact === 'jester') {
                addNumber = 1;
            }
            else if (currentArtifact === 'brush') {
                addNumber = 2;
            }

            switch (accId) {
                case 'main-activity-area-container':
                    {
                        param.push(from + ' ' + from);
                        param.push(to + ' ' + to);
                        param.push(this.getMessage('left-view-text', 0 + addNumber));
                        param.push(this.getMessage('left-view-text', 3 + addNumber));
                        param.push(this.getMessage('left-view-text', 6 + addNumber));
                        param.push(this.getMessage('left-view-text', 9 + addNumber));
                        activityAreaMessage = this.getAccMessage(accId, 0, param);
                        this.setAccMessage(accId, activityAreaMessage);
                        break;
                    }
            }
        },

        /**
        * Renders DOM elements
        *
        * @method _render
        * @private 
        **/
        _render: function _render() {
            var $object,
                message = this.getMessage('direction-text-1', 0),
                accMessage = this.getAccMessage('direction-text-1', 0),
                mainContainerId = this.$('#' + this.idPrefix + 'main-activity-area-container'),
                currentValue = null,
                isSaveStateCall = false,
                initialState = this.model.getState(),
                self = this;


            //this.showTryAnotherPopUp = true;

            this.currentArtifact = this.model.get('currentArtifact');

            if (this.type === 2) {
                message = this.getMessage('direction-text-2', 0),
                accMessage = this.getAccMessage('direction-text-2', 0),
                $(this.$el).addClass('type-2-background');
            }

            this.$el.css({ 'background-image': 'url("' + this.filePath.getImagePath('archaeological-dig-background') + '")' });

            this.leftPanelView = new MathInteractives.Common.Interactivities.ArchaeologicalDig.Views.LeftPanel({
                el: mainContainerId,
                model: this.model,
                idPrefix: this.idPrefix
            });

            this.rightPanelView = new MathInteractives.Common.Interactivities.ArchaeologicalDig.Views.RightPanel({
                el: mainContainerId,
                model: this.model,
                idPrefix: this.idPrefix
            })

            //            this.leftPanelView.$el.on('click', function () {
            //                if (self.rightPanelView.junkFoundTooltipView !== null) {
            //                    self.rightPanelView.junkFoundTooltipView.hideTooltip();
            //                }
            //                if (self.rightPanelView.objectInfoTooltipView !== null) {
            //                    self.rightPanelView.objectInfoTooltipView.hideTooltip();
            //                }
            //            });
            this.rightPanelView.$el.parent().on('click', function () {
                if (self.rightPanelView.junkFoundTooltipView !== null) {
                    self._hideTooltips();
                }
                if (self.rightPanelView.objectInfoTooltipView !== null) {
                    self._hideTooltips();
                }
            });


            if (this.directionTextView === null) {
                this._initializeDirectionText(message, accMessage);
            }

            this._bindListeners();


            if (initialState !== null) {
                isSaveStateCall = true;
                this._updateJunkCount();
                this.leftPanelView._showObjectFound(isSaveStateCall);
                if (initialState === 'normal' || initialState === 'win') {
                    if (this.leftPanelView.popupView) {
                        this.leftPanelView.popupView.remove();
                    }
                    this.leftPanelView._onContinueClick(isSaveStateCall);
                }
                this.leftPanelView._displaySelectedArtifactsParts();
                this.checkForDigDisable();
            }
            else {
                this.model.setState('normal');
            }

            if (this.type === 1) {
                this.unloadScreen('archaeological-dig-1');
                this.loadScreen('archaeological-dig-1');
            }
            else {
                this.unloadScreen('archaeological-dig-2');
                this.loadScreen('archaeological-dig-2');
            }
            return this;
        },



        _bindListeners: function _bindListeners() {
            var self = this;
            self.listenTo(self.leftPanelView.spinnerviewX, MathInteractives.global.Theme2.CustomSpinner.VALUE_CHANGED, self._moveCursorX);
            self.listenTo(self.leftPanelView.spinnerviewY, MathInteractives.global.Theme2.CustomSpinner.VALUE_CHANGED, self._moveCursorY);
            self.listenTo(self.rightPanelView, namespace.RightPanel.events.UPADATE_STEPER_STATUS_VALUES, self._updateSteperStatusValues);
            self.listenTo(self.leftPanelView, namespace.LeftPanel.events.ENABLE_BUTTONS, $.proxy(self.leftPanelView._enableAllButtons, self.leftPanelView));
            self.listenTo(self.rightPanelView, namespace.RightPanel.events.ENABLE_BUTTONS, $.proxy(self.leftPanelView._enableAllButtons, self.leftPanelView));
            self.listenTo(self.rightPanelView, namespace.RightPanel.events.HIDE_RED_BOX, $.proxy(self.leftPanelView._hideRedBox, self.leftPanelView));
            self.listenTo(self.leftPanelView, namespace.LeftPanel.events.ROTATE_CURSOR_CONTAINER, $.proxy(self.rightPanelView._rotateDiv, self.rightPanelView));
            self.listenTo(self.leftPanelView, namespace.LeftPanel.events.ADD_CLASS_TO_GRID_DIV, $.proxy(self.rightPanelView._addClassToGridDiv, self.rightPanelView));
            self.listenTo(self.leftPanelView, namespace.LeftPanel.events.CHANGE_TRY_ANOTHER_STATE, self.changeTryAnotherState);
            self.listenTo(self.leftPanelView, namespace.LeftPanel.events.CHECK_FOR_DIG_DISABLE, self.checkForDigDisable);
            self.listenTo(self.rightPanelView, namespace.RightPanel.events.CHECK_FOR_DIG_DISABLE, self.checkForDigDisable);
            self.listenTo(self.leftPanelView, namespace.LeftPanel.events.REMOVE_CLASS_FROM_RIGHTSIDE, $.proxy(self.rightPanelView._removeClassFromRightSide, self.rightPanelView));
            self.listenTo(self.leftPanelView, namespace.LeftPanel.events.SHOW_HIDE_CURSOR_CONTAINER, $.proxy(self.rightPanelView._showHideCursorAnimationContainer, self.rightPanelView));
        },




        /**
        * Calls Method of right panel view to mover cursor horizontally.
        * @method _moveCursorX
        * @private
        */
        _moveCursorX: function _moveCursorX(event) {

            this.leftPanelView.showTryAnotherPopUp = true;
            this.rightPanelView._moveCursorX(event);
        },

        /**
        * Calls Method of right panel view to mover cursor Vertically.
        * @method _moveCursorY
        * @private
        */
        _moveCursorY: function _moveCursorY(event) {

            this.leftPanelView.showTryAnotherPopUp = true;
            this.rightPanelView._moveCursorY(event);
        },

        /**
        * Attach events 
        *
        * @method _attachEvents
        * @private 
        **/
        _attachEvents: function _attachEvents() {
            var self = this;
            this.model.on('change:availableJunksForVillain', this._updateJunkCount, this);
            return this;
        },
        /**
        * enable or disable try another button
        * @method changeTryAnotherState
        * @public
        */
        changeTryAnotherState: function changeTryAnotherState(state) {
            this.directionTextView.changeButtonState(state);

        },


        /**
        * sets up help screen elements.
        * @method _setHelpElements
        * @private
        */
        _setHelpElements: function _setHelpElements() {
            var helpElements = this.model.get('helpElements');

            if (helpElements.length > 0) {
                return;
            }
            helpElements.push(
                {
                    elementId: 'steper-container', helpId: 'help-instruction',
                    fromElementCenter: false,
                    msgId: 0,
                    positionArray: ['top'],
                    hideArrowDiv: true
                },
                {
                    elementId: 'artifact-image-container', helpId: 'help-instruction',
                    fromElementCenter: false,
                    msgId: 1,
                    positionArray: ['right'],
                    dynamicArrowPosition: true
                },
                {
                    elementId: 'dummy-junks-container', helpId: 'help-instruction',
                    fromElementCenter: false,
                    msgId: 2,
                    positionArray: ['right'],
                    dynamicArrowPosition: true,
                    tooltipWidth: 410
                },
                {
                    elementId: 'dig-button-container', helpId: 'help-instruction',
                    fromElementCenter: false,
                    msgId: 3,
                    positionArray: ['right'],
                    dynamicArrowPosition: true
                },
                {
                    elementId: 'continue-button-container', helpId: 'help-instruction',
                    fromElementCenter: false,
                    msgId: 4,
                    positionArray: ['right'],
                    dynamicArrowPosition: true
                }
            );
        },
        /**
        * Checks any tooltip is shown or not, and if shown then hide it
        * @method _hideTooltips
        * @private
        */
        _hideTooltips: function _hideTooltips() {
            if (this.rightPanelView.junkFoundTooltipView !== null) {
                this.rightPanelView.junkFoundTooltipView.hideTooltip();
            }
            if (this.rightPanelView.objectInfoTooltipView !== null) {
                this.rightPanelView.objectInfoTooltipView.hideTooltip();
            }
        },

        /**
        * Checks for the position is selected or not. If selected,then disables dig button.
        * @method checkForDigDisable
        * @private
        */
        checkForDigDisable: function checkForDigDisable() {
            var spinnerXValue = this.leftPanelView.spinnerviewX.currentValue,
                spinnerYValue = this.leftPanelView.spinnerviewY.currentValue,
                steperObject = this.model.get('steperStatus');
            if (this.type === 2) {
                spinnerXValue += 3;
                spinnerYValue += 3;
            }

            if (this.$('.type-' + this.type + '-' + spinnerXValue + spinnerYValue).hasClass('selected')) {
                this.leftPanelView.digButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                steperObject.isDigEnable = false;
            }
            else {
                this.leftPanelView.digButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                steperObject.isDigEnable = true;
            }
        },

        /**
        * Updates model steperStatus attribute
        * @method _updateSteperStatusValues
        * @private
        * param xValue{integer},yValue{integer}
        */
        _updateSteperStatusValues: function _updateSteperStatusValues() {
            var object = {},
                bool = null;
            object.x = this.leftPanelView.spinnerviewX.currentValue,
        object.y = this.leftPanelView.spinnerviewY.currentValue;
            bool = $('.type-' + this.model.get('type') + '-' + object.x + object.y).hasClass('selected');
            if (bool) {
                object.isDigEnable = false;
            }
            else {
                object.isDigEnable = true;
            }
            this.model.set('steperStatus', object);
        },


        /**
        * updates the junks count availabe for villan
        * @method _updateJunkCount
        * @private
        */
        _updateJunkCount: function () {
            this.$('.junks-score-count').text(this.model.get('availableJunksForVillain'));
        },
        /**
        * Resets Interactivity
        * @method _onTryAnotherClick
        * @private
        */
        _onTryAnotherClick: function _onTryAnotherClick() {
            this.stopReading();
            this._removeTooltip(this.rightPanelView.junkFoundTooltipView);
            this._removeTooltip(this.rightPanelView.objectInfoTooltipView);
            this._removeTooltip(this.rightPanelView.closeContainerTooltipView);
            this.leftPanelView.remove();
            this.rightPanelView.remove();
            if (this.popupView) {
                this.popupView = null;
            }
            this.$el.append(' <div id="' + this.idPrefix + 'main-activity-area-container" class="main-activity-area-container"></div>');
            this.model.setUpNewGame('tryAnother');
            this._render();
            this.setAccMessageFor('main-activity-area-container');
            this.setFocus('direction-text-container-direction-text-text');
        },
        /**
        * removes tooltip
        * @method _removeTooltip
        * @private
        * @param {object} tooltip view
        */
        _removeTooltip: function _removeTooltip(toolTip) {
            if (toolTip != null) {
                toolTip.remove();
            }
        },

        /**
        * Initializes the direction text component view.
        * @method _initializeDirectionText
        * @private
        */
        _initializeDirectionText: function _initializeDirectionText(message, accMessage) {
            var self = this,
                directionProperties = {
                    containerId: this.idPrefix + 'direction-text-container',
                    idPrefix: this.idPrefix,
                    player: this.player,
                    manager: this.manager,
                    path: this.filePath,
                    text: message,
                    accText: accMessage,
                    buttonText: this.getMessage('button-text', 0),
                    btnBaseClass: 'button-baseclass',
                    buttonTabIndex: 1800,
                    showButton: true,
                    tabIndex: 510,
                    textColor: '#ffffff',
                    containmentBGcolor: 'rgba(255,255,255, 0)',
                    clickCallback: {
                        fnc: this._createTryAnotherPopup,
                        scope: this
                    }
                };
            this.directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(directionProperties);
            this.focusIn('direction-text-container-direction-text-buttonholder', function () {
                if (self.rightPanelView.lastFocusChildAccId !== null) {
                    self.enableTab(self.rightPanelView.lastFocusChildAccId, false);
                    if (self.rightPanelView.objectInfoTooltipView) {
                        self.rightPanelView.objectInfoTooltipView.hideTooltip();
                    }
                }
            });
        },

        /**
        * Shows popup on try another click.
        * @method _createTryAnotherPopup
        * @private
        */
        _createTryAnotherPopup: function _createTryAnotherPopup() {
            this.stopReading();
            if (this.rightPanelView.junkFoundTooltipView) {
                this._hideTooltips();
            }


            if (this.leftPanelView.showTryAnotherPopUp === true) {
                var self = this,
                    popupOptions = {
                        manager: this.manager,
                        path: this.filePath,
                        player: this.player,
                        idPrefix: this.idPrefix,
                        title: this.getMessage('pop-up-text', 6),
                        accTitle: this.getMessage('pop-up-text', 6),
                        text: this.getMessage('pop-up-text', 7),
                        accText: this.getMessage('pop-up-text', 7),
                        type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                        buttons: [
                                {
                                    id: 'yes-button',
                                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                                    text: this.getMessage('pop-up-text', 9),
                                    response: { isPositive: true, buttonClicked: 'yes-button' },
                                    clickCallBack: { fnc: function () { this.setFocus('direction-text-container-direction-text-text') }, scope: this }
                                },
                                {
                                    id: 'cancel-button',
                                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                                    text: this.getMessage('pop-up-text', 10),
                                    response: { isPositive: false, buttonClicked: 'cancel-button' },
                                    clickCallBack: { fnc: function () { this.setFocus('direction-text-container-direction-text-buttonholder') }, scope: this }
                                }
                            ],
                        closeCallback: {
                            fnc: function (response) {
                                if (response.isPositive) {

                                    this._onTryAnotherClick();
                                }
                                else {
                                    //this.setFocus('translate-direction-container-direction-text-buttonholder');
                                }
                            },
                            scope: this
                        }
                    };

                MathInteractives.global.Theme2.PopUpBox.createPopup(popupOptions);

            } else {
                this._onTryAnotherClick();
            }
        }


    },
    {
        SPIN_UP: 'spinner-up',
        SPIN_DOWN: 'spinner-down'
    });
    archaeologicalDigMainClass = namespace.Explore;
})()