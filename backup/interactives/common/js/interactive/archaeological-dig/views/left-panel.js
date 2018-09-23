(function () {
    'use strict';
    var leftPanelClass = null;
    var namespace = MathInteractives.Common.Interactivities.ArchaeologicalDig.Views;
    /**
    * Class for Archaeological Dig sub view that helps to generate some part of main view independently.
    * @class LeftPanel
    * @module ArchaeologicalDig
    * @namespace MathInteractives.Interactivities.ArchaeologicalDig.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    namespace.LeftPanel = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Unique interactivity id prefix
        * @property idprefix
        * @default null
        * @private
        */
        idPrefix: null,
        /**
        * Holds the object of current model
        * @property model
        * @default null
        * @private
        */
        model: null,
        /**
        * Holds the view of Dig Button.
        * @property digButtonView
        * @default null
        * @private
        */
        digButtonView: null,
        /**
        * Holds the view of Continue Button.
        * @property continueButtonView
        * @default null
        * @private
        */
        continueButtonView: null,
        /**
        * Holds the view of Pay Up Button.
        * @property payUpButtonView
        * @default null
        * @private
        */
        payUpButtonView: null,
        /**
        * Holds the view of Spinner X.
        * @property spinnerviewX
        * @default null
        * @private
        */
        spinnerviewX: null,
        /**
        * Holds the view of Spinner Y.
        * @property spinnerviewY
        * @default null
        * @private
        */
        spinnerviewY: null,
        /**
        * Holds class of selected object.
        * @property selectedObjectClass
        * @default null
        * @private
        */
        selectedObjectClass: null,
        /**
        * True if artifact found,false if empty found
        * @property isArtifactFound
        * @default null
        * @private
        */
        isArtifactFound: null,
        /**
        * True if artifact is taken by villain
        * @property isArtifactTaken
        * @default null
        * @private
        */
        isArtifactTaken: null,
        /**
        * Holds Classes that to be taken by villain
        * @property artifactRemoveClassNames
        * @default null
        * @private
        */
        artifactRemoveClassNames: null,
        /**
        * stores true or false value
        * @property showTryAnotherPopUp
        * @default null
        * @private
        */
        showTryAnotherPopUp: null,
        /**
        * holds class of container
        * @property partsBackgroundFirst
        * @default null
        * @private
        */
        partsBackgroundFirst: null,
        /**
        * holds class of container
        * @property partsBackgroundSecond
        * @default null
        * @private
        */
        partsBackgroundSecond: null,
        /**
        * holds class of container
        * @property partsBackgroundThird
        * @default null
        * @private
        */
        partsBackgroundThird: null,
        /**
        * holds class of container
        * @property artifactFirstPart
        * @default null
        * @private
        */
        artifactFirstPart: null,
        /**
        * holds class of container
        * @property artifactSecondPart
        * @default null
        * @private
        */
        artifactSecondPart: null,
        /**
        * holds class of container
        * @property artifactThirdPart
        * @default null
        * @private
        */
        artifactThirdPart: null,
        /**
        * holds view of tooltip of close sign
        * @property closeSignTooltipView
        * @default null
        * @private
        */
        closeSignTooltipView: null,
        /**
        * Initializes main view
        *
        * @method initialize
        * @public 
        **/
        initialize: function (option) {
            this.idPrefix = option.idPrefix;
            this.model = option.model;
            this.initializeDefaultProperties();
            this._render();
        },

        /**
        * Renders DOM elements
        *
        * @method _render
        * @private 
        **/
        _render: function _render() {
            this.loadScreen('left-panel-screen');

            var currentArtifact = this.model.get('currentArtifact'), addNumber = 0;

            if (currentArtifact === 'jester') {
                addNumber = 1;
            }
            else if (currentArtifact === 'brush') {
                addNumber = 2;
            }

            /*****Loading Left Panel Template and appending it to $el*****/
            var leftPanelTemplate = MathInteractives.Common.Interactivities.ArchaeologicalDig.templates['leftPanel']({
                'idPrefix': this.idPrefix,
                'objectName': this.getMessage('left-view-text', 0 + addNumber),
                'firstPartName': this.getMessage('left-view-text', 3 + addNumber),
                'secondPartName': this.getMessage('left-view-text', 6 + addNumber),
                'thirdPartName': this.getMessage('left-view-text', 9 + addNumber),
                'itemName': currentArtifact
            }).trim();
            this.$el.html(leftPanelTemplate);


            this.partsBackgroundFirst = 'parts-background-1-' + currentArtifact;
            this.partsBackgroundSecond = 'parts-background-2-' + currentArtifact;
            this.partsBackgroundThird = 'parts-background-3-' + currentArtifact;
            this.artifactFirstPart = '.artifact-first-part-' + currentArtifact;
            this.artifactSecondPart = '.artifact-second-part-' + currentArtifact;
            this.artifactThirdPart = '.artifact-third-part-' + currentArtifact;


            this._showHideAnimationContainer(false);
            this._initialContainersToHide();
            this._initializeComponents();


            return this;
        },
        /**
        * Backbone property for binding events to DOM elements.
        * @property events
        * @private
        */
        events: {
            'click .payup-button-container.clickEnabled': '_onPayUpClick',
            'click .dig-button-container.clickEnabled': '_onDigClick',
            'click .continue-button-container.clickEnabled': '_onContinueClick',
            'click .cross-sign div': '_hideRedBox'
        },
        /**
        * Sets Acc message for specified acc id 
        *
        * @method setAccMessageFor
        * @public 
        * @param {string} setMsgFor element for which acc message has to change, {object} param all neccessary paramter cotain in it.
        **/
        setAccMessageFor: function setAccMessageFor(setMsgFor, param) {
            var accMsg = '',
                accId = 'object-found-container',
                arr = [],
                spinnerAccId = '',
                junkCount = this.model.get('availableJunksForVillain'),
                artifactParts = this.model.get('artifactParts'),
                artifactPartsFound = [],
                tempArr = [],
                type = this.model.get('type'),
                spinnerXvalue = this.spinnerviewX.currentValue,
                spinnerYvalue = this.spinnerviewY.currentValue,
                spinnerMin = this.spinnerviewX.minValue,
                spinnerMax = this.spinnerviewX.maxValue,
                msgId = null,
                self = this,
                check = true;

            switch (setMsgFor) {
                case 'empty':
                    {
                        accMsg += this.getAccMessage(accId, 2);
                        break;
                    }
                case 'junk':
                    {
                        this._getProperObjectName(arr, param.junkName);
                        accMsg += this.getAccMessage(accId, 3, arr);
                        while (arr.length > 0) {
                            arr.pop();
                        }
                        arr.push(junkCount);
                        ((junkCount === 1) ? arr.push('element') : arr.push('elements'));
                        accMsg += this.getAccMessage(accId, 4, arr);
                        break;
                    }
                case 'artifact_part':
                    {
                        this._getProperObjectName(arr, param.artifact_part); //gets proper artifact part name.
                        accMsg += this.getAccMessage(accId, 8, arr);
                        break;
                    }
                case 'villain':
                    {
                        for (var i = 0; i < 3; i++) {
                            if (artifactParts[i].isFound === true) {
                                artifactPartsFound.push(artifactParts[i].id);
                            }
                        }

                        arr.push('villain');
                        accMsg += this.getAccMessage(accId, 9, arr);
                        while (arr.length > 0) {
                            arr.pop();
                        }

                        if (junkCount === 0) {
                            ((artifactPartsFound.length === 0) ? accMsg += this.getAccMessage(accId, 5) : true); //(junk == 0 && artifact == 0)

                            if (artifactPartsFound.length === 1) { //(junk == 0 && artifact == 1)
                                arr.push('take');
                                this._getProperObjectName(arr, artifactPartsFound[0]);
                                arr.push('it');
                                accMsg += this.getAccMessage(accId, 7, arr);
                            }
                            else if (artifactPartsFound.length >= 2) { //(junk == 0 && artifact == 2)
                                arr.push('take');
                                this._getProperObjectName(arr, artifactPartsFound[0]);
                                this._getProperObjectName(arr, artifactPartsFound[1]);
                                tempArr.push(arr.pop());
                                tempArr.push(arr.pop());
                                arr.push(tempArr[0] + ' and ' + tempArr[1]);
                                arr.push('them');
                                accMsg += this.getAccMessage(accId, 7, arr);
                            }
                        }
                        else if (junkCount === 1) {
                            arr.push('one');
                            arr.push('element');
                            accMsg += this.getAccMessage(accId, 6, arr); //(junk == 1 && artifact >= 0)                            
                            if (artifactPartsFound.length >= 1) { //(junk == 1 && artifact >= 1)
                                while (arr.length > 0) {
                                    arr.pop();
                                }
                                arr.push('also take');
                                this._getProperObjectName(arr, artifactPartsFound[0]);
                                arr.push('it');
                                accMsg += this.getAccMessage(accId, 7, arr);
                            }
                        }
                        else if (junkCount >= 2) { //(junk >= 2 )
                            arr.push('two');
                            arr.push('elements');
                            accMsg += this.getAccMessage(accId, 6, arr);
                        }
                        accMsg += this.getAccMessage(accId, 1);
                        break;
                    }
                case 'steper-x-up-arrow':
                case 'steper-y-up-arrow':
                case 'steper-x-down-arrow':
                case 'steper-y-down-arrow':
                    {
                        accId = setMsgFor;
                        ((accId.indexOf('x') > -1) ? spinnerAccId = 'spinner-x-acc-text' : spinnerAccId = 'spinner-y-acc-text');
                        arr.push(spinnerXvalue);
                        arr.push(spinnerYvalue);
                        if (this.$('.type-' + type + '-' + spinnerXvalue + spinnerYvalue).hasClass('selected')) {
                            arr.push('dug');
                        }
                        else {
                            arr.push('not dug');
                        }
                        ((accId.indexOf('up') > -1) ? msgId = 1 : msgId = 2);
                        accMsg = this.getAccMessage(spinnerAccId, msgId, arr);
                        check = false;
                        break;
                    }
            }
            if (check === true) {
                accMsg += this.getAccMessage(accId, 0);
            }
            this.setAccMessage(accId, accMsg);
        },
        /**
        * Pushes proper name for articat found in arr array.
        *
        * @method _getProperObjectName
        * @private 
        * @param {array} arr, {string} artifactPartsFound
        **/
        _getProperObjectName: function _getProperObjectName(arr, objectFound) {
            switch (objectFound) {
                case 'body':
                    {
                        arr.push('Duck Body');
                        break;
                    }
                case 'brush-head':
                    {
                        arr.push('Brush')
                        break;
                    }
                case 'tin':
                    {
                        arr.push('Tin Can');
                        break;
                    }
                case 'pin':
                    {
                        arr.push('Paperclip');
                        break;
                    }
                case 'cassete':
                    {
                        arr.push('Cassette');
                        break;
                    }
                default:
                    {
                        arr.push(objectFound)
                        break;
                    }
            }
        },
        /**
        * shows animation container if value is true else hide.
        *
        * @method _showHideAnimationContainer
        * @private 
        **/
        _showHideAnimationContainer: function _showHideAnimationContainer(bool) {
            var self = this,
                $backgroundAnimationContainer = self.$('.background-animation-container');
            self.trigger(leftPanelClass.events.SHOW_HIDE_CURSOR_CONTAINER, bool);

            if (bool === true) {
                $backgroundAnimationContainer.show();
                $backgroundAnimationContainer.css({ 'background-image': 'url("' + self.filePath.getImagePath('men-animation') + '")' });
            }
            else {
                $backgroundAnimationContainer.css('background-image', 'none');
                $backgroundAnimationContainer.hide();
            }
        },


        /**
        * Hides Div at the time of loading initially.
        *
        * @method _initialContainersToHide
        * @private 
        **/
        _initialContainersToHide: function _initialContainersToHide() {
            var self = this;
            self.$('.display-object-container').hide();
            self.$('.continue-button-container').hide();
            self.$('.red-box-container').hide();
            self.$('.object-found-container').hide();
            self.$('.object-found-info').hide();
            self.$('.object-found-image').hide();
            self.$('.object-found-men-face').hide();
            self.$('.villain-callout-text-container').hide();
            self.$('.villain-object-collector').hide();
            self.$('.payup-button-container').hide();
        },

        /**
        * makes call to create new components like steper and buttons
        *
        * @method _initializeComponents
        * @private 
        **/
        _initializeComponents: function _initializeComponents() {
            var currentValue,
                upperLimit = 5,
                lowerLimit = 0,
                self = this,
                $object,
                tabIndex = null,
                msgId = '';


            if (self.model.get('type') === 2) {
                upperLimit = 3;
                lowerLimit = -3;
            }
            self.showTryAnotherPopUp = false;
            self._loadBackgroundImages();
            self._initializeDigButton();
            self._initializeContinueButton();
            self._initializePayUpButton();

            currentValue = self.model.get('steperStatus').x;
            tabIndex = 600;
            msgId = 'spinner-x-acc-text';
            self.spinnerviewX = self._initializeSpinner('steper-x', upperLimit, lowerLimit, currentValue, tabIndex, msgId);

            currentValue = self.model.get('steperStatus').y;
            tabIndex = 700;
            msgId = 'spinner-y-acc-text';
            self.spinnerviewY = self._initializeSpinner('steper-y', upperLimit, lowerLimit, currentValue, tabIndex, msgId);
            self.attachEvents();
        },
        /**
        * attach events to DOM elements
        *
        * @method attachEvents
        * @public 
        **/
        attachEvents: function attachEvents() {
            var self = this,
                activityAreaAccId = 'main-activity-area-container',
                activityAreaMessage = '';

            this.focusIn('steper-x-text', function () { self.spinnerFocusInHandler('steper-x-text'); });
            this.focusIn('steper-y-text', function () { self.spinnerFocusInHandler('steper-y-text'); });

            this.$('#' + this.idPrefix + 'object-found-container').one('focusin', function (event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                activityAreaMessage = self.getAccMessage(activityAreaAccId, 1);
                self.setAccMessage(activityAreaAccId, activityAreaMessage);
            })
        },
        /**
        * handle the focus in event of each element of spinner 
        *
        * @method spinnerFocusInHandler
        * @public
        **/
        spinnerFocusInHandler: function spinnerFocusInHandler(accId, callFrom) {
            var upArrow = 'up-arrow',
                downArrow = 'down-arrow';

            this.setAccMessageFor(accId.replace('text', upArrow));
            this.setAccMessageFor(accId.replace('text', downArrow));
        },

        /**
        * Loads Images
        *
        * @method _loadBackgroundImages
        * @private 
        **/
        _loadBackgroundImages: function _loadBackgroundImages() {
            var self = this;
            self.$('.artifact-background-image').css({ 'background-image': 'url("' + self.filePath.getImagePath('archaeological-dig-images') + '")' });
            self.$('.round-background-container').css({ 'background-image': 'url("' + self.filePath.getImagePath('archaeological-dig-images') + '")' });
            self.$('.villain-callout-text-container').css({ 'background-image': 'url("' + self.filePath.getImagePath('archaeological-dig-images') + '")' });
            self.$('.display-object-container,.villain-object-collector').css({ 'background-image': 'url("' + self.filePath.getImagePath('archaeological-dig-images') + '")' });
            self.$(self.artifactFirstPart + ',' + self.artifactSecondPart + ',' + self.artifactThirdPart).css({ 'background-image': 'url("' + self.filePath.getImagePath('archaeological-dig-images') + '")' });
            self.$('.object-found-men-face').css({ 'background-image': 'url("' + self.filePath.getImagePath('archaeological-dig-images') + '")' });
            self.$('.first-part-info,.second-part-info,.third-part-info,.first-part-image,.second-part-image,.third-part-image,.dummy-junks-container,.1-cursor-container,.2-cursor-container,.object-container,.object-found-image').css({ 'background-image': 'url("' + self.filePath.getImagePath('archaeological-dig-icons') + '")' });
        },

        /**
        * Disables All buttons while animation
        * @method _disableAllButtons
        * @private
        */
        _enableAllButtons: function _enableAllButtons(bool, callFromCursorMove) {
            this.player.enableAllHeaderButtons(bool);
            if (bool === false) {
                this.payUpButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                this.continueButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                this.digButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                this.trigger(leftPanelClass.events.CHANGE_TRY_ANOTHER_STATE, MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
            }
            else {
                this.payUpButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.continueButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.digButtonView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.trigger(leftPanelClass.events.CHANGE_TRY_ANOTHER_STATE, MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            }
            if (callFromCursorMove === false || callFromCursorMove === 'undefined') {
                this.trigger(leftPanelClass.events.CHECK_FOR_DIG_DISABLE);
            }
        },



        /**
        * This is called on saveState resume and it assing required class to found artifact parts before saving 
        *
        * @method _displaySelectedArtifactsParts
        * @private 
        **/
        _displaySelectedArtifactsParts: function _displaySelectedArtifactsParts() {
            var artifactParts = this.model.get('artifactParts'),
                $partsBackgroundFirst = this.$('.' + this.partsBackgroundFirst),
                $partsBackgroundSecond = this.$('.' + this.partsBackgroundSecond),
                $partsBackgroundThird = this.$('.' + this.partsBackgroundThird);


            if (artifactParts[0].isFound === true) {
                if (!$partsBackgroundFirst.hasClass('selected')) {
                    $partsBackgroundFirst.addClass('selected');
                    this.$('.border-part-1').addClass('selected');
                    this.$(this.artifactFirstPart).addClass('selected');
                }
            }
            if (artifactParts[1].isFound === true) {
                if (!$partsBackgroundSecond.hasClass('selected')) {
                    $partsBackgroundSecond.addClass('selected');
                    this.$('.border-part-2').addClass('selected');
                    this.$(this.artifactSecondPart).addClass('selected');
                }
            }
            if (artifactParts[2].isFound === true) {
                if (!$partsBackgroundThird.hasClass('selected')) {
                    $partsBackgroundThird.addClass('selected');
                    this.$('.border-part-3').addClass('selected');
                    this.$(this.artifactThirdPart).addClass('selected');
                }
            }
        },


        /**
        * Hides box
        *
        * @method _hideRedBox
        * @private 
        **/
        _hideRedBox: function _hideRedBox() {
            this.$('.red-box-container').hide();
            this.setFocus('steper-x-text');
        },


        /**
        * Gives Hover Effect to close button of red box.
        *
        * @method _addHoverEffct
        * @private 
        **/
        _addHoverEffect: function _addHoverEffect() {
            var closeTootipContainer = null;

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                closeTootipContainer = this.$('.cross-sign');
            }
            else {
                closeTootipContainer = this.$('.cross-sign div');
            }

            closeTootipContainer.addClass('cross-sign-hover');
            if (this.closeSignTooltipView === null) {
                this._initializeCloseSignTooltip(closeTootipContainer[0].id);
            }
            this.closeSignTooltipView.showTooltip();
        },

        /**
        * Removes Hover Effect to close button of red box.
        *
        * @method _removeHoverEffct
        * @private 
        **/
        _removeHoverEffect: function _removeHoverEffect() {
            var closeTootipContainer = null;

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                closeTootipContainer = this.$('.cross-sign');
            }
            else {
                closeTootipContainer = this.$('.cross-sign div');
            }

            closeTootipContainer.removeClass('cross-sign-hover');
            this.closeSignTooltipView.hideTooltip();
        },


        /******************************************************************************************/
        /***Following are methods that handles dig Button Click Event****/


        /**
        * Hides Artfact info container and shows object found container.
        * @method _onDigClick
        * @private
        */
        _onDigClick: function _onDigClick() {
            var self = this;
            self.stopReading();
            self._hideRedBox();
            self.setFocus('object-found-container');
            self.trigger(leftPanelClass.events.ENABLE_BUTTONS, false);
            self.$('.artifact-information-container').hide();
            self.$('.continue-button-container').hide();
            self._perfromDigAnimation();
        },

        /**
        * performs dig animation.
        *
        * @method _perfromDigAnimation
        * @private 
        **/
        _perfromDigAnimation: function _perfromDigAnimation() {
            var backgroundPositionX = 0, degree = 45, self = this, interval, $backgroundAnimationContainer, cursorAnimationTimer;
            this._showHideAnimationContainer(true);

            var $backgroundAnimationContainer = self.$('.background-animation-container');

            interval = setInterval(function () {
                $backgroundAnimationContainer.css('background-position', backgroundPositionX + 'px 0px');

                if (backgroundPositionX < -1666) {
                    clearInterval(interval);
                    clearInterval(cursorAnimationTimer);
                    self.trigger(leftPanelClass.events.ROTATE_CURSOR_CONTAINER, 0);
                    self._showHideAnimationContainer(false);
                    $backgroundAnimationContainer.css('background-position', '0px 0px');
                    self._showObjectFound();
                }
                else {
                    backgroundPositionX -= 333;
                }
            }, 100);


            cursorAnimationTimer = setInterval(function () {
                degree += 1;
                self.trigger(leftPanelClass.events.ROTATE_CURSOR_CONTAINER, degree);
            }, 1);
        },


        /**
        * Show and hides appropriate container for displaying found object
        *
        * @method _showObjectFound
        * @private 
        **/
        _showObjectFound: function _showObjectFound(isSaveStateCall) {
            var browserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck,
                artifactAndJunksCount = null,
                self = this,
                isWin = null;


            self.$('.artifact-information-container').hide();
            self.$('.object-found-container').show();


            self.selectedObjectClass = self._checkForObject(isSaveStateCall);
            self._placeObjectInContainer(self.selectedObjectClass, isSaveStateCall);

            if ((browserCheck.isIE === true && browserCheck.browserVersion === '9.0') || isSaveStateCall === true) {

                self.trigger(leftPanelClass.events.ENABLE_BUTTONS, true);
                if (self.selectedObjectClass === 'villain-display') {
                    artifactAndJunksCount = self._getArtifactAndJunksCount();
                    if (artifactAndJunksCount[0] > 0 || artifactAndJunksCount[1] > 0) {
                        self.$('.display-object-container, .villain-callout-text-container, .villain-object-collector,.payup-button-container').show();
                    }
                    else {
                        self.$('.display-object-container, .villain-callout-text-container,.continue-button-container').show();
                    }
                    self.setFocus('object-found-container');
                }
                else {
                    self.$('.display-object-container, .object-found-info,.object-found-men-face,.continue-button-container').show();
                    self.$('.continue-button-container').show();
                    self.setFocus('object-found-container');
                }
                isWin = self._checkWinCondition();
                if (isWin) {
                    self.$('.continue-button-container').hide();
                    self._createWinPopup();
                }
            }
            else {
                if (self.selectedObjectClass === 'villain-display') {
                    self.$('.payup-button-container').hide();
                    artifactAndJunksCount = self._getArtifactAndJunksCount();
                    if (artifactAndJunksCount[0] > 0 || artifactAndJunksCount[1] > 0) {
                        self._performZoomInAnimation('.display-object-container', '.villain-callout-text-container', '.villain-object-collector');
                    }
                    else {
                        self._performZoomInAnimation('.display-object-container', '.villain-callout-text-container');
                    }

                }
                else {
                    self.$('.continue-button-container').hide();
                    self._performZoomInAnimation('.display-object-container', '.object-found-info,.object-found-men-face');
                }
            }
        },

        /**
        * checks which object at position shown by stepper at the time dig clicked
        * @method _checkForObject
        * @private
        * @retrun val{character}
        */
        _checkForObject: function (isSaveStateCall) {
            var index = null,
                val = 0,
                spinnerXValue = this.spinnerviewX.currentValue,
                spinnerYValue = this.spinnerviewY.currentValue,
                artifactParts = this.model.get('artifactParts'),
                junks = this.model.get('junks'),
                villain = this.model.get('villain'),
                emptyPlacesAvailable = this.model.getEmptyPlacesAvailable(),
                emptyPlacesFound = this.model.getEmptyPlacesFound(),
                param = {};


            if (this.model.get('type') === 2) {
                spinnerXValue += 3;
                spinnerYValue += 3;
            }

            if (isSaveStateCall === undefined) {
                this.trigger(leftPanelClass.events.ADD_CLASS_TO_GRID_DIV, spinnerXValue, spinnerYValue);
            }
            this.trigger(leftPanelClass.events.CHECK_FOR_DIG_DISABLE);
            //console.log('spinner(' + spinnerXValue + ',' + spinnerYValue + ')');

            for (var i = 0; i < 3; i++) {
                if (artifactParts[i].x === spinnerXValue && artifactParts[i].y === spinnerYValue) {
                    this.model.trigger('artifactPartFound', artifactParts[i], isSaveStateCall);
                    val = 'display-part-' + (i + 1) + '-' + this.model.get('currentArtifact');
                    this.model.setState(val);
                    param.artifact_part = artifactParts[i].id;
                    this.setAccMessageFor('artifact_part', param);
                    return val;
                }
            } //search in artifactparts

            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < junks[i].positionDetails.length; j++) {
                    if (junks[i].positionDetails[j].x === spinnerXValue && junks[i].positionDetails[j].y === spinnerYValue) {
                        this.model.trigger('junkFound', junks[i], j, isSaveStateCall);
                        val = junks[i].id + '-display';
                        this.model.setState(val);
                        param.junkName = junks[i].id;
                        this.setAccMessageFor('junk', param);
                        return val;
                    }
                }
            } //search in junks

            if (villain.x === spinnerXValue && villain.y === spinnerYValue) {
                this.model.trigger('villainFound', villain);
                val = 'villain-display';
                this.model.setState(val);
                this.setAccMessageFor('villain', param);
                return val;
            } //search in villan

            index = $.inArray(spinnerXValue + '_' + spinnerYValue, emptyPlacesAvailable);
            if (index > -1) {
                this.model.trigger('emptyPalceFound', index, emptyPlacesAvailable, isSaveStateCall);
                val = 'empty-display';
                this.model.setState(val);
                this.setAccMessageFor('empty', param);
                return val;
            } //search in available empty places   

            if (isSaveStateCall) {
                index = $.inArray(spinnerXValue + '_' + spinnerYValue, emptyPlacesFound);
                if (index > -1) {
                    val = 'empty-display';
                    this.setAccMessageFor('empty', param);
                    return val;
                }
            } //search at emptyPlacesFound array
        },




        /**
        * Gives count of number of junks digged and artifact found.
        *
        * @method _getArtifactAndJunksCount
        * @private 
        **/

        _getArtifactAndJunksCount: function _getArtifactAndJunksCount() {
            var junksCount = this.model.get('availableJunksForVillain'), count = 0,
                        artifactParts = this.model.get('artifactParts'), arr = [];
            for (var i = 0; i < 3; i++) {
                if (artifactParts[i].isFound === true) {
                    count++;
                }
            }
            arr.push(count);
            arr.push(junksCount);
            return arr;
        },


        /**
        * Places Object in object found container.
        * @method _placeObjectInContainer
        * @private
        */
        _placeObjectInContainer: function _placeObjectInContainer(className, isSaveStateCall) {
            this.isArtifactFound = false;
            var objectFound = this.getMessage('object-found-text', 0),
                artifactAndJunksCount;

            var currentArtifact = this.model.get('currentArtifact'), addNumber = 0;
            if (currentArtifact === 'jester') {
                addNumber = 1;
            }
            else if (currentArtifact === 'brush') {
                addNumber = 2;
            }
            this.selectedObjectClass = className;
            this.$('.display-object-container').addClass(className);
            this.$('.object-found-image').removeClass().addClass('object-found-image');

            artifactAndJunksCount = this._getArtifactAndJunksCount();

            switch (className) {
                case 'villain-display':
                    {
                        var $villainCalloutText = this.$('.villain-callout-text'),
                            $continueButtonContainer = this.$('.continue-button-container'),
                            $payupButtonContainer = this.$('.payup-button-container');


                        this.$('.villain-object-collector-counter').text('');
                        this.$('.round-background-container').addClass('villain-found');


                        if (this.model.get('villain').villainStateType === 'payUp') {
                            $payupButtonContainer.show();
                            $continueButtonContainer.hide();

                            /*Checking Whether 1 or more artifacts or junks available*/
                            /*Text to be display vary for single artifact or junk and for more than one*/
                            if (artifactAndJunksCount[1] > 1) {
                                $villainCalloutText.text(this.getMessage('villain-callout-text', 1));
                            }
                            else if (artifactAndJunksCount[0] > 0) {
                                $villainCalloutText.text(this.getMessage('villain-callout-text', 2));
                            }
                            else if (artifactAndJunksCount[0] === 0 && artifactAndJunksCount[1] === 1) {
                                $villainCalloutText.text(this.getMessage('villain-callout-text', 1));
                            }
                            /**/
                        }
                        else if (this.model.get('villain').villainStateType === 'warrning') {
                            $payupButtonContainer.hide();
                            $continueButtonContainer.addClass('reduce-bottom');
                            // $continueButtonContainer.show();
                            $villainCalloutText.text(this.getMessage('villain-callout-text', 0));
                        }
                        this.$('.object-found-men-face').hide();
                        this.$('.object-found-info').hide();
                        break;
                    }
                case 'tin-display':
                    {
                        this._setObjectFoundText(objectFound, this.getMessage('object-found-text', 1));
                        break;
                    }
                case 'pin-display':
                    {
                        this._setObjectFoundText(objectFound, this.getMessage('object-found-text', 2));
                        break;
                    }
                case 'battery-display':
                    {
                        this._setObjectFoundText(objectFound, this.getMessage('object-found-text', 3));
                        break;
                    }
                case 'bolt-display':
                    {
                        this._setObjectFoundText(objectFound, this.getMessage('object-found-text', 6));
                        break;
                    }
                case 'cassete-display':
                    {
                        this._setObjectFoundText(objectFound, this.getMessage('object-found-text', 7));
                        break;
                    }
                case 'display-part-1-' + currentArtifact:
                    {
                        this._setObjectFoundText(objectFound, this.getMessage('object-found-text', 8 + addNumber));
                        this.$('.object-found-men-face').addClass('happy');
                        this.$('.object-found-image').show().addClass(this.partsBackgroundFirst + ' border-part-1');
                        if (!isSaveStateCall) {
                            this.$('.' + this.partsBackgroundFirst).addClass('selected');
                            this.$('.border-part-1').addClass('selected');
                            this.$(this.artifactFirstPart).addClass('selected');
                        }
                        this.isArtifactFound = true;
                        break;
                    }
                case 'display-part-2-' + currentArtifact:
                    {
                        this._setObjectFoundText(objectFound, this.getMessage('object-found-text', 11 + addNumber));
                        this.$('.object-found-men-face').addClass('happy');
                        this.$('.object-found-image').show().addClass(this.partsBackgroundSecond + ' border-part-2');
                        if (!isSaveStateCall) {
                            this.$('.' + this.partsBackgroundSecond).addClass('selected');
                            this.$('.border-part-2').addClass('selected');
                            this.$(this.artifactSecondPart).addClass('selected');
                        }
                        this.isArtifactFound = true;
                        break;
                    }
                case 'display-part-3-' + currentArtifact:
                    {
                        this._setObjectFoundText(objectFound, this.getMessage('object-found-text', 14 + addNumber));
                        this.$('.object-found-men-face').addClass('happy');
                        this.$('.object-found-image').show().addClass(this.partsBackgroundThird + ' border-part-3');
                        if (!isSaveStateCall) {
                            this.$('.' + this.partsBackgroundThird).addClass('selected');
                            this.$('.border-part-3').addClass('selected');
                            this.$(this.artifactThirdPart).addClass('selected');
                        }
                        this.isArtifactFound = true;
                        break;
                    }
                case 'empty-display':
                    {
                        objectFound = this.getMessage('object-found-text', 4);
                        this._setObjectFoundText(this.getMessage('object-found-text', 5), objectFound);

                        this.$('.object-found-header').addClass('bummer');
                        this.$('.object-found-footer').addClass('bummer');

                        this.isArtifactFound = false;
                        break;
                    }
            }

        },

        /**
        * Sets text to object found text container.
        * @method _setObjectFoundText
        * @private
        */
        _setObjectFoundText: function _setObjectFoundText(headerText, footerText) {
            this.$('.object-found-header').text(headerText);
            this.$('.object-found-name').text(footerText);
        },

        /**
        * performs zoomin animation.
        * @method _performZoomInAnimation
        * @private
        */
        _performZoomInAnimation: function _performZoomInAnimation(sourceName, fadeInSourceName, zoomInSourceName) {
            var self = this;
            this.$(sourceName).show();
            this.$(sourceName).addClass('animated zoomIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass('animated zoomIn');
                if (fadeInSourceName === true) {
                    fadeInSourceName = null;
                    //self.player.enableAllHeaderButtons(true);
                    self.$('.payup-button-container').show();
                    self.trigger(leftPanelClass.events.ENABLE_BUTTONS, true);
                }
                else if (fadeInSourceName) {
                    self._performFadeInAnimation(fadeInSourceName, zoomInSourceName);
                }
            });
        },

        /**
        * performs fade in animation.
        * @method _performFadeInAnimation
        * @private
        */
        _performFadeInAnimation: function _performFadeInAnimation(sourceName, zoomInSourceName) {
            var self = this,
                isWin = null;

            if (self.selectedObjectClass === 'villain-display' && sourceName !== '.villain-callout-text-container') {
                return;
            }
            else if (self.selectedObjectClass !== 'villain-display' && sourceName === '.villain-callout-text-container') {
                return;
            }
            this.$(sourceName).show();

            this.$(sourceName).addClass('animated fadeIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass('animated fadeIn');

                if (zoomInSourceName !== undefined) {
                    self._performZoomInAnimation(zoomInSourceName, true);
                }
                else {
                    self.player.enableAllHeaderButtons(true);
                    self.trigger(leftPanelClass.events.ENABLE_BUTTONS, true);
                    self.$('.continue-button-container').show();
                }
                isWin = self._checkWinCondition();
                if (isWin) {
                    self.$('.continue-button-container').hide();
                    self._createWinPopup();
                }
                else {
                    self.setFocus('object-found-container');
                }
            });
        },




        /**End With Dig Click Methods**/


        /**Starts With Payup Click Methods**/


        /**
        * Gives junks or artfacts to villain.
        * @method _onPayUpClick
        * @private
        */
        _onPayUpClick: function _onPayUpClick() {

            var artifactAndJunksCount, artifactPos, numberOfJunksTaken;

            artifactAndJunksCount = this._getArtifactAndJunksCount();

            this.stopReading();
            this.trigger(leftPanelClass.events.ENABLE_BUTTONS, false);


            if (artifactAndJunksCount[1] >= 2) {
                numberOfJunksTaken = 1;
                this._performTranslateAnimation('.dummy-junks-container', '.left-panel-container', '169px', '265px', numberOfJunksTaken, false, true);
            }
            else if (artifactAndJunksCount[1] === 1) {
                if (artifactAndJunksCount[0] === 0) {
                    numberOfJunksTaken = 1;
                    this._performTranslateAnimation('.dummy-junks-container', '.left-panel-container', '169px', '265px', numberOfJunksTaken, true);
                }
                else {
                    this.isArtifactTaken = true;
                    numberOfJunksTaken = 1;
                    this._performTranslateAnimation('.dummy-junks-container', '.left-panel-container', '169px', '265px', numberOfJunksTaken, false);
                    artifactPos = this._getSelectedArtifact(1);
                    numberOfJunksTaken = 2;
                    this._performTranslateAnimation(artifactPos[artifactPos.length - 1], '.artifact-parts-container', '137px', '265px', numberOfJunksTaken, true, artifactPos);
                }
            }
            else {
                artifactPos = this._getSelectedArtifact(2);
                this.isArtifactTaken = true;
                if (artifactPos.length === 3) {
                    numberOfJunksTaken = 2;
                }
                else if (artifactPos.length === 2) {
                    numberOfJunksTaken = 1;
                }
                this._performTranslateAnimation(artifactPos[artifactPos.length - 1], '.artifact-parts-container', '137px', '267px', numberOfJunksTaken, true, artifactPos);
            }
        },

        /**
        * Gives class names for animation.
        * @method _onPayUpClick
        * @private
        */
        _getSelectedArtifact: function _getSelectedArtifact(type) {
            var count = 0, artifactPos = [], classNames = '', message = '', arr = [], messageNumber = 12,
                 currentArtifact = this.model.get('currentArtifact'), addNumber = 0, accText = '';

            if (currentArtifact === 'jester') {
                addNumber = 1;
            }
            else if (currentArtifact === 'brush') {
                addNumber = 2;
            }


            this.artifactRemoveClassNames = '';
            if (this.$('.' + this.partsBackgroundFirst).hasClass('selected')) {
                this.artifactRemoveClassNames = '.' + this.partsBackgroundFirst + ',' + this.artifactFirstPart + ',.border-part-1';
                classNames += '.first-part-info';
                count++;
                artifactPos.push(0);
                message += this.getMessage('left-view-text', 3 + addNumber);

                if (type === 1) {
                    arr.push(message);
                    this.$('.red-box-text').text(this.getMessage('left-view-text', messageNumber, arr));
                    accText = this.getAccMessage('red-box-container', 0, arr);
                    this.setAccMessage('red-box-container', accText);
                    artifactPos.push(classNames);
                    return artifactPos;
                }
            }
            if (this.$('.' + this.partsBackgroundSecond).hasClass('selected')) {
                if (this.artifactRemoveClassNames !== '') {
                    this.artifactRemoveClassNames += ',';
                }
                if (classNames !== '') {
                    classNames += ',';
                }
                this.artifactRemoveClassNames += '.' + this.partsBackgroundSecond + ',' + this.artifactSecondPart + ',.border-part-2';
                classNames += '.second-part-info';
                if (count === 1) {
                    message += this.getMessage('left-view-text', 13);
                }
                count++;
                artifactPos.push(1);
                message += this.getMessage('left-view-text', 6 + addNumber);

                if (type === 1 || count === 2) {
                    if (count === 2) {
                        messageNumber = 14;
                    }
                    arr.push(message);
                    this.$('.red-box-text').text(this.getMessage('left-view-text', messageNumber, arr));
                    accText = this.getAccMessage('red-box-container', 0, arr);
                    this.setAccMessage('red-box-container', accText);
                    artifactPos.push(classNames);
                    return artifactPos;
                }
            }
            if (this.$('.' + this.partsBackgroundThird).hasClass('selected')) {
                if (count < 2) {
                    if (this.artifactRemoveClassNames !== '') {
                        this.artifactRemoveClassNames += ',';
                    }
                    if (classNames !== '') {
                        classNames += ',';
                    }
                    this.artifactRemoveClassNames += '.' + this.partsBackgroundThird + ',' + this.artifactThirdPart + ',.border-part-3';
                    classNames += '.third-part-info';
                    artifactPos.push(2);
                    if (count === 1) {
                        message += this.getMessage('left-view-text', 13);
                    }
                    count++;
                    if (count === 2) {
                        messageNumber = 14;
                    }
                    message += this.getMessage('left-view-text', 9 + addNumber);
                }
            }
            arr.push(message);
            this.$('.red-box-text').text(this.getMessage('left-view-text', messageNumber, arr));
            accText = this.getAccMessage('red-box-container', 0, arr);
            this.setAccMessage('red-box-container', accText);
            artifactPos.push(classNames);
            return artifactPos;
        },

        /**
        * Performs translation animation.
        * @method _performTranslateAnimation
        * @private
        */
        _performTranslateAnimation: function _performTranslateAnimation(sourceName, parentContainer, top, left, numberOfJunksTaken, bool, artifactPos) {
            var count = 0,
                hasNoEmptyPlaceCondition = false,
                junksCount = this.model.get('availableJunksForVillain'),
                focusTo = 'red-box';

            if (this.artifactRemoveClassNames) {
                this.$(this.artifactRemoveClassNames).removeClass('selected');
                this.artifactRemoveClassNames = '';
            }





            if (top === '137px') {
                var self = this, $sourceObj = this.$(sourceName).parent().clone().appendTo(this.$(parentContainer));
                $sourceObj.addClass('clone-div selected border-effect').children().addClass('selected');
            }
            else {
                var self = this, $sourceObj = this.$(sourceName).clone().appendTo(this.$(parentContainer));
                $sourceObj.addClass('clone-div selected').children().addClass('selected');
            }


            //this.$('.clone-div :first-child').addClass('selected');
            $sourceObj.css({ 'z-index': 1 });
            $sourceObj.animate({ top: top, left: left, opacity: '0.6' }, 500, function () {
                $sourceObj.css({ 'opacity': 1 });
                if (sourceName === '.dummy-junks-container') {
                    self.model.set('availableJunksForVillain', junksCount - 1);
                    focusTo = 'spinner';
                }
                self.$('.villain-object-collector-counter').text('+' + numberOfJunksTaken);

                count++;
                if (bool == true) {
                    if (count < 2) {
                        var timeout = setTimeout(function () {
                            if (artifactPos) {
                                self.trigger(leftPanelClass.events.REMOVE_CLASS_FROM_RIGHTSIDE, artifactPos);
                                hasNoEmptyPlaceCondition = self.model.rehideArtifactsParts(artifactPos);
                            }
                            if (!hasNoEmptyPlaceCondition) {
                                self.model.placeVillain();
                            }
                            self.$('.villain-object-collector-counter').text('');
                            self._resetVillianDisplay();
                            self.player.enableAllHeaderButtons(true);
                            self.trigger(leftPanelClass.events.ENABLE_BUTTONS, true);
                            if (focusTo === 'red-box') {
                                self.setFocus('red-box-container');
                            }
                            else if (focusTo = 'spinner') {
                                self.setFocus('steper-x-text');
                            }

                        }, 800);
                    }
                }
                else {
                    if (artifactPos === true) {
                        self._performTranslateAnimation('.dummy-junks-container', '.left-panel-container', '169px', '265px', 2, true);
                    }
                }
            });
            //$junkClone.animate({ top: '168px' }, 3000);
        },


        /**Ends with payup click methods**/


        /********************Starts With Continue Click************************/

        /**
        * Clears all class added and shows artifact information container
        * @method _onContinueClick
        * @private
        */
        _onContinueClick: function _onContinueClick(isSaveStateCall) {
            this.stopReading();
            var isWin = null;
            if (this.selectedObjectClass === 'villain-display') {
                this._resetVillianDisplay();
                if (isSaveStateCall !== true) {
                    this.model.placeVillain();
                }
            }
            else {
                this._resetObjectDisplay();
            }
            this.$('.object-found-image').hide();
            this.setFocus('steper-x-text');
            this.model.setState('normal');
            this.trigger(leftPanelClass.events.CHECK_FOR_DIG_DISABLE);
            isWin = this._checkWinCondition();
            if (isWin) {
                this.spinnerviewX.disableSpinBox();
                this.spinnerviewY.disableSpinBox();
            }
        },


        /**
        * Resets Objects displayed 
        * @method _resetObjectDisplay
        * @private
        */
        _resetObjectDisplay: function _resetObjectDisplay() {
            if (this.isArtifactFound === true) {
                this.$('.object-found-men-face').removeClass('happy');
            }
            if (this.isArtifactFound === false) {
                this.$('.object-found-header').removeClass('bummer');
                this.$('.object-found-footer').removeClass('bummer');
            }

            this.$('.object-found-info').hide();
            this.$('.object-found-men-face').hide();

            this.$('.object-found-container').hide();
            this.$('.display-object-container').removeClass(this.selectedObjectClass);
            this.$('.artifact-information-container').show();
            this.model.setState('normal');
            this.isArtifactFound = null;
        },

        /**
        * Resets villain 
        * @method _resetVillianDisplay
        * @private
        */
        _resetVillianDisplay: function _resetVillianDisplay() {
            var self = this;
            if (this.$('.continue-button-container').hasClass('reduce-bottom')) {
                this.$('.continue-button-container').removeClass('reduce-bottom');
            }
            this.$('.round-background-container').removeClass('villain-found');
            this.$('.villain-object-collector').hide();
            this.$('.payup-button-container').hide();
            this.$('.villain-callout-text-container').hide();
            this.$('.continue-button-container').show();


            //            if (this.artifactRemoveClassNames) {
            //                this.$(this.artifactRemoveClassNames).removeClass('selected');
            //                this.artifactRemoveClassNames = '';
            //            }

            this.$('.clone-div').remove();
            this.$('.artifact-information-container').show();
            this.$('.object-found-container').hide();
            this.$('.display-object-container').removeClass(this.selectedObjectClass);
            this.$('.artifact-information-container').show();
            this.model.setState('normal');
            if (this.isArtifactTaken) {
                this.$('.red-box-container').show();
                this._attachEventToCloseTooltip();
            }
            this.isArtifactFound = null;
            this.isArtifactTaken = null;

            var spinnerXValue = this.spinnerviewX.currentValue,
                spinnerYValue = this.spinnerviewY.currentValue;
            if (this.model.get('type') === 2) {
                spinnerXValue += 3;
                spinnerYValue += 3;
            }
            this.$('.type-' + this.model.get('type') + '-' + spinnerXValue + spinnerYValue).removeClass('selected');
            this.trigger(leftPanelClass.events.CHECK_FOR_DIG_DISABLE);
        },
        /*************Ends WIth Continue Click*********************/
        /**
        * Binds events on close tooltip
        *
        * @method _attachEventToCloseTooltip
        * @private
        **/
        _attachEventToCloseTooltip: function _attachEventToCloseTooltip() {
            var closeTootipContainer = null,
                self = this;

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                closeTootipContainer = this.$('.cross-sign')
                closeTootipContainer.addClass('cross-sign-cursor');
                //closeTootipContainer.off('touchstart').on('touchstart', function () { self._addHoverEffect() });
                //closeTootipContainer.off('touchend').on('touchend', function () { self._removeHoverEffect() });
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch(closeTootipContainer);

            }
            else {
                closeTootipContainer = this.$('.cross-sign div')
                closeTootipContainer.addClass('cross-sign-cursor');
                closeTootipContainer.off('mouseenter').on('mouseenter', function () { self._addHoverEffect() });
                closeTootipContainer.off('mouseleave').on('mouseleave', function () { self._removeHoverEffect() });
            }
        },

        /**
        * Checks whether all artifact parts are found are not
        * @method _checkWinCondition
        * @private
        */
        _checkWinCondition: function _checkWinCondition() {
            var artifactParts = this.model.get('artifactParts'),
                count = 0;
            for (var i = 0; i < 3; i++) {
                if (artifactParts[i].isFound === true) {
                    count++;
                }
            }
            if (count === 3) {
                this.model.setState('win');
                return true;
            }
            else {
                return false;
            }
        },

        /**
        * Creates popup after winning.
        * @method _createWinPopup
        * @private
        */
        _createWinPopup: function _createWinPopup() {
            var foregroundImagePosition, addNumber;
            this.$el.trigger('click');
            if (this.popupView) {
                return;
            }

            if (this.model.get('currentArtifact') === 'duck') {
                foregroundImagePosition = '0px 20px';
                addNumber = 0;
            }
            else if (this.model.get('currentArtifact') === 'jester') {
                foregroundImagePosition = '0px -1273px';
                addNumber = 1;
            }
            else if (this.model.get('currentArtifact') === 'brush') {
                foregroundImagePosition = '0px -624px';
                addNumber = 2;
            }

            var self = this, popupView,
            options = {
                title: this.getMessage('pop-up-text', 0 + addNumber),
                accTitle: this.getAccMessage('pop-up-text', 0 + addNumber),
                text: this.getMessage('pop-up-text', 3 + addNumber),
                accText: this.getAccMessage('pop-up-text', 3 + addNumber),
                //accText: self.getAccMessage('pop-up-text', messageId),
                //accTitle: self.getAccMessage('pop-up-title', messageId),
                manager: self.manager,
                player: self.player,
                path: self.filePath,
                idPrefix: self.idPrefix,
                closeCallback: {
                    fnc: function () {
                        self.setFocus('grid-container', 100);
                    },
                    scope: self
                },
                buttons: [
                            {
                                id: 'ok-win-button',
                                type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                                text: this.getMessage('pop-up-text', 8),
                                clickCallBack: {
                                    fnc: self._onContinueClick,
                                    scope: self
                                },
                                response: { isPositive: true / false, buttonClicked: 'ok-win-button' },
                                baseClass: 'button-baseclass'

                            }
                ],
                width: 532,
                ///backgroundImageBackgroundPosition: '360px -1200px',
                foregroundImageBackgroundPosition: foregroundImagePosition,
                //                backgroundImage: {
                //                    imageId: 'archaeological-dig-images',
                //                    imageHeight: 2228,
                //                    imageWidth: 698
                //                },
                foregroundImage: {
                    imageId: 'pop-up',
                    imageHeight: 928,
                    imageWidth: 599
                },
                titleTextColorClass: 'win-popup-header-text',
                bodyTextColorClass: 'win-popup-body-text'
            };
            this.popupView = MathInteractives.global.Theme2.PopUpBox.createPopup(options);
            this.popupView.$('.theme2-pop-up-dialogue').addClass('background-color');
            this.popupView.$('.theme2-pop-up-body').addClass('win-popup-body-text-container');
            this.popupView.$('.theme2-pop-up-title-text').before('<div class="pop-up-title-found-text"></div>');
            this.popupView.$('.pop-up-title-found-text').append('<div class="check-sign fa fa-check"></div>');
            this.popupView.$('.pop-up-title-found-text').append('<span>' + this.getMessage('pop-up-text', 11) + '</span>');
            this.popupView.$('.theme2-pop-up-title').css({ 'margin-top': '0px' });
            this.popupView.$('.theme2-pop-up-title-text-combined-acc-defaultType').css({ 'top': '105px' });
            this.showTryAnotherPopUp = false;
        },


        /**
        * Initializes view for Dig button.
        * @method _initializeDigButton
        * @private
        */
        _initializeDigButton: function _initializeDigButton() {
            var buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'dig-button-container',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'button-baseclass',
                    text: this.getMessage('button-text', 1),
                    tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    width: 112,
                    height: 38
                }
            };
            this.digButtonView = MathInteractives.global.Theme2.Button.generateButton(buttonProperties);
        },

        /**
        * Initializes view for Dig button.
        * @method _initializeContinueButton
        * @private
        */
        _initializeContinueButton: function _initializeContinueButton() {
            var buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'continue-button-container',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'button-baseclass',
                    text: this.getMessage('button-text', 2),
                    tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    width: 112,
                    height: 38
                }
            };
            this.continueButtonView = MathInteractives.global.Theme2.Button.generateButton(buttonProperties);
        },

        /**
        * Initializes view for Dig button.
        * @method _initializePayUpButton
        * @private
        */
        _initializePayUpButton: function _initializePayUpButton() {
            var buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'payup-button-container',
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    baseClass: 'button-baseclass',
                    text: this.getMessage('button-text', 2),
                    tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    width: 112,
                    height: 38
                }
            };
            this.payUpButtonView = MathInteractives.global.Theme2.Button.generateButton(buttonProperties);
        },

        /**
        * Initializes view for Dig button.
        * @method _initializeSpinner
        * @private
        */
        _initializeSpinner: function _initializeSpinner(containerId, upperLimit, lowerLimit, currentValue, tabIndex, msgId) {
            var self = this,
                spinnerAccText = self.getAccMessage(msgId, 0),
                spinnerAccPlaceholder = [MathInteractives.global.Theme2.CustomSpinner.CURR_VAL],
                spinnerOptions = {
                    spinId: this.idPrefix + containerId,
                    path: this.filePath,
                    manager: this.manager,
                    idPrefix: this.idPrefix,
                    isEditable: false,
                    minValue: lowerLimit,
                    maxValue: upperLimit,
                    value: currentValue,
                    tabIndex: tabIndex,
                    maxCharLength: 1,
                    alignType: MathInteractives.global.Theme2.CustomSpinner.VERTICAL_ALIGN,
                    inputType: MathInteractives.Common.Components.Theme2.Views.InputBox.INPUT_TYPE_CUSTOM,
                    player: this.player,
                    upArrowAccText: self.getAccMessage(msgId, 1),
                    downArrowAccText: self.getAccMessage(msgId, 2),
                    defaultAccText: spinnerAccText,
                    onIncreaseAccText: spinnerAccText,
                    onDecreaseAccText: spinnerAccText,
                    minLimitAccText: spinnerAccText,
                    maxLimitAccText: spinnerAccText,
                    onIncreasePlaceHolders: spinnerAccPlaceholder,
                    onDecreasePlaceHolders: spinnerAccPlaceholder,
                    minLimitPlaceHolders: [MathInteractives.global.Theme2.CustomSpinner.MIN_VAL],
                    maxLimitPlaceHolders: [MathInteractives.global.Theme2.CustomSpinner.MAX_VAL],
                    defaultPlaceHolders: spinnerAccPlaceholder,

                    textBoxStyle: {
                        backgroundColor: 'transparent',
                        borderColor: '#000000',
                        onFocusColor: '#FFF'
                    },
                    buttonBaseClass: 'steper-baseclass'
                };

            return MathInteractives.global.Theme2.CustomSpinner.generateCustomSpinner(spinnerOptions);
        },
        /**
        * Initializes view for Tooltip of close sign
        * @method _initializeCloseSignTooltip
        * @private
        * @param elementId{string}, x{integer}, y{integer}, arrowType{string}
        */
        _initializeCloseSignTooltip: function _initializeCloseSignTooltip(elementId) {
            var tooltipProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                id: this.idPrefix + 'cross-sign-tooltip',
                type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL,
                baseClass: 'cross-sign-tooltip',
                arrowBaseClass: 'cross-sign-tooltip-arrow',
                text: 'Close',
                elementEl: elementId,
                containerWidth: 50,
                containerHeight: 32,
                textColor: '#000000',
                arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                closeOnDocumentClick: true
            };
            if (this.closeSignTooltipView !== null) {
                this.closeSignTooltipView.hideTooltip();
                this.closeSignTooltipView.remove();
            }
            else {
                this.closeSignTooltipView = null;
            }
            this.closeSignTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(tooltipProperties);
        }
    },
     {
         events: {
             /**
             * fired when there should be wnable or disable all buttons in interactivity at time of animation.
             *
             * @event ENABLE_BUTTONS 
             * @param {Boolean} bool true denotes that user enables buttons
             **/
             ENABLE_BUTTONS: 'enableButtons',
             /**
             * fired when there is dig click and rotation of container of right panel  starts.
             *
             * @event ROTATE_CURSOR_CONTAINER 
             **/
             ROTATE_CURSOR_CONTAINER: 'rotateCursorContainer',
             /**
             * fired after digging anywhere. It adds class 'SELECTED' to digged div.
             *
             * @event ADD_CLASS_TO_GRID_DIV 
             **/
             ADD_CLASS_TO_GRID_DIV: 'addClassToGridDiv',
             /**
             * fired when enable button method is called. It is used to disable or anble try another button.
             *
             * @event CHANGE_TRY_ANOTHER_STATE 
             * @param {Boolean} MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED disables button, 
             * And MathInteractives.global.Theme2.Button.BUTTON_STATE_Active enables button.
             **/
             CHANGE_TRY_ANOTHER_STATE: 'changeTryAnotherState',
             /**
             * fired on every dig click and spinner click.
             *
             * @event CHECK_FOR_DIG_DISABLE 
             **/
             CHECK_FOR_DIG_DISABLE: 'checkForDigDisable',
             /**
             * fired when villain takes artifact.
             *
             * @event REMOVE_CLASS_FROM_RIGHTSIDE 
             **/
             REMOVE_CLASS_FROM_RIGHTSIDE: 'removeClassFromRightSide',
             /**
             * fired when cursor animation starts after dig click.
             *
             * @event SHOW_HIDE_CURSOR_CONTAINER 
             **/
             SHOW_HIDE_CURSOR_CONTAINER: 'showhideCursorContainer'
         }
     });
    leftPanelClass = MathInteractives.Common.Interactivities.ArchaeologicalDig.Views.LeftPanel;
})();