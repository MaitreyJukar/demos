(function () {
    'use strict';

    /**
    * holds functions related to basic set-up of the interactivity window.
    * @class Theme2PopUp
    * @namespace MathInteractives.Common.Components.Theme2.Views
    * @submodule MathInteractives.Common.Components.Theme2.Views.Theme2PopUp
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Views.Theme2PopUp = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * holds interactivity manager reference
        *
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,
        /**
        * holds interactivity player reference
        *
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property _path
        * @type Object
        * @default null
        */
        _path: null,

        /**
        * stores popup text
        *
        * @property _text
        * @type String
        * @default null
        */
        _text: null,

        /**
        * stores popup title
        *
        * @property _title
        * @type String
        * @default null
        */
        _title: null,

        /**
        * Holds the refrence of view level reference of ok button
        *
        * @property btnViewRef
        * @type Array
        * @default null
        */
        btnViewRef: [],

        /**
        * Holds the refrence of view level reference of cancel button
        *
        * @property cancelBtnViewRef
        * @type Object
        * @default null
        */
        cancelBtnViewRef: null,

        /**
        * Holds the refrence of view level reference of popup
        *
        * @property popupViewRef
        * @type Object
        * @default null
        */
        popupViewRef: null,

        /**
        * Holds the refrence of view static data
        *
        * @property staticData
        * @type Object     
        * @default null
        */
        staticData: null,


        /**
        * Holds the popup type

        *
        * @property popUpType
        * @type Object     
        * @default null
        */
        popUpType: null,

        /**
        * stores button width
        *
        * @property _btnWidth
        * @type Number     
        * @default 0
        */
        _btnWidth: 0,

        /**
        * stores score text
        *
        * @property scoreDisplayChild
        * @type String     
        * @default null
        */
        scoreDisplayChild: null,

        /**
        * foregound image id
        *
        * @property imageOnForegroundId
        * @type String     
        * @default null
        */
        imageOnForegroundId: null,

        /**
        * image position on foreground top and left
        *
        * @property imagePositionOnForeground
        * @type String     
        * @default null
        */
        imagePositionOnForeground: null,

        /**
        * foreground image sprite position
        *
        * @property imagePositionOnForeground
        * @type String     
        * @default null
        */
        imageOnForegroundSpritePosition: null,

        /**
        * initialize properties of view
        *
        * @method initialize
        * @public
        **/
        initialize: function () {
            var model = this.model;

            this.manager = model.get('manager');
            this.player = model.get('player');
            this._path = model.get('path');
            this.idPrefix = model.get( 'idPrefix' );
            if ( this.player.getModalPresent() ) {
                if ( this._isSamePopupPresent() ) return;
            }
            this.unloadScreen('theme2-pop-up-box');
            this.loadScreen('theme2-pop-up-box');
            this.staticData = MathInteractives.global.Theme2.PopUpBox;

            this.popUpType = model.get('type');
            this.scoreDisplayChild = model.get('scoreDisplayChild');
            this.imageOnForegroundId = model.get('imageOnForegroundId');
            this.imagePositionOnForeground = model.get('imagePositionOnForeground');
            this.imageOnForegroundSpritePosition = model.get('imageOnForegroundSpritePosition');
            this.textOnForegroundImg = model.get('textOnForegroundImg');
            this.imageOnForegroundDimension = model.get('imageOnForegroundDimension');
            this.render();
            if (this.popUpType === null || this.popUpType === this.staticData.SCOREBOARD || this.popUpType === this.staticData.NEWSCOREBOARD) {
                this.setFocus('theme2-pop-up-title-text-combined-acc');
                this.$('.pause-tts-container,.play-tts-container,.sound-tts-container').on('keydown', $.proxy(this._setFocusToPopupTextOnShiftTab, this));

                // unbind previous binds and then bind focusout
                if (this.popUpType === null) {
                    this.$('.theme2-pop-up-title-text-combined-acc-defaultType').on('keydown', $.proxy(this._setFocusOnTTsOnTab, this));
                }
                else if (this.popUpType === this.staticData.SCOREBOARD) {
                    this.$('.theme2-pop-up-title-text-combined-acc-' + this.popUpType + '').on('keydown', $.proxy(this._setFocusOnTTsOnTab, this));
                }
                else if (this.popUpType === this.staticData.NEWSCOREBOARD) {
                    this.$('.theme2-pop-up-title-text-combined-acc-' + this.popUpType + '').on('keydown', $.proxy(this._setFocusOnTTsOnTab, this));
                }

            } else {
                this.setFocus('theme2-pop-up-title-text');
                this.$('.theme2-pop-up-title-text').on('keydown', $.proxy(this._setFocusToPopupTextOnTab, this));
                this.$('.theme2-pop-up-text').on('keydown', $.proxy(this._setFocusToPopupTitleOnShiftTab, this));
            }
            var showCallback = this.model.get('showCallback');
            if (showCallback) {
                showCallback.fnc.apply(showCallback.scope || this);
            }
        },

        /*Checks whether any popup present with same ID.
        * @method _isSamePopupPresent
        */
        _isSamePopupPresent: function _isSamePopupPresent() {
            var popupModalArray = this.player.$el.find( '.theme2-pop-up-modal' ),
                currentModalId;
            for ( var i = 0; i < popupModalArray.length; i++ ) {
                currentModalId = popupModalArray[0].id;
                if ( currentModalId === ( this.idPrefix + 'theme2-pop-up-modal' ) ) {
                    return true;
                }
            }
            return false;
        },

        /**
        * Sets focus to pop up text on shift tab
        * 
        * @method _setFocusToPopupTextOnShiftTab
        * @param event {Object}
        * @private
        **/
        _setFocusToPopupTextOnShiftTab: function (event) {

            var keyEvent = this._isEventTabOrShiftTab(event);
            if (keyEvent.shiftTabKey === true) {
                event.preventDefault();
                this.setFocus('theme2-pop-up-title-text-combined-acc');
            }
        },
        /**
        * Sets focus to TTS on tab
        * 
        * @method _setFocusOnTTsOnTab
        * @param event {Object}
        * @private
        **/
        _setFocusOnTTsOnTab: function (event) {

            var keyEvent = this._isEventTabOrShiftTab(event);
            if (keyEvent.tabKey === true) {
                event.preventDefault();
                if (this.$('.sound-tts-container').css('display') !== 'none') {
                    this.setFocus('theme2-pop-up-tts-container-sound-btn');
                } else {
                    if (this.$('.play-tts-container').css('display') !== 'none') {
                        this.setFocus('theme2-pop-up-tts-container-play-btn');
                    } else {
                        this.setFocus('theme2-pop-up-tts-container-pause-btn');
                    }
                }
            }
        },
        /**
        * Sets focus to popup title on shift tab
        * 
        * @method _setFocusToPopupTitleOnShiftTab
        * @param event {Object}
        * @private
        **/
        _setFocusToPopupTitleOnShiftTab: function (event) {

            var keyEvent = this._isEventTabOrShiftTab(event);
            if (keyEvent.shiftTabKey === true) {
                event.preventDefault();
                this.setFocus('theme2-pop-up-title-text');
            }
        },
        /**
        * Sets focus to popup text on tab
        * 
        * @method _setFocusToPopupTextOnTab
        * @param event {Object}
        * @private
        **/
        _setFocusToPopupTextOnTab: function (event) {

            var keyEvent = this._isEventTabOrShiftTab(event);
            if (keyEvent.tabKey === true) {
                event.preventDefault();
                this.setFocus('theme2-pop-up-text');
            }
        },
        /**
        * recognises keydown tab or shift tab
        * 
        * @method _isEventTabOrShiftTab
        * @param event {Object}
        * @private
        **/
        _isEventTabOrShiftTab: function (event) {
            var key = event ? event.which : event.keyCode,
                returnObj = {
                    shiftTabKey: false,
                    tabKey: false
                };
            if (key === 9) {

                if (typeof event.shiftKey !== 'undefined' && event.shiftKey === true) {
                    returnObj.shiftTabKey = true;
                }
                if (event.shiftKey !== true) {
                    returnObj.tabKey = true;
                }
            }
            return returnObj;
        },
        /**
        * Renders the popup
        * 
        * @method render
        * @public
        **/
        render: function () {
            var model = this.model,
                _accText = model.get('accText'),
                _accTitle = model.get('accTitle'),
                bodyTextColor = model.get('bodyTextColorClass'),
                titleTextColor = model.get('titleTextColorClass'),
                popUpWidth = model.get('width'),
                popUpType = model.get('type'),
                staticData = this.staticData,
                self = this,
                accTextDefaultPopup = null,
                dynamicHackDivObjectForDefaultPopup = null,
                scoreText = model.get('score');
            self.keyDown = {};

            this._text = model.get('text');
            this._title = model.get('title');
            // var $player = this.player.$el;
            //if (!this._text || !this._title) {
            //    return;
            //}

            this.generatePopup();

            if (popUpType === staticData.SCOREBOARD) {
                this.$('.theme2-pop-up-score-display').css({ 'height': '53px', 'width': '119px' });
                this.$('.theme2-pop-up-score-display').addClass('scorecard-display-container');
                this.$('.theme2-pop-up-score-display-text').text(scoreText);
                this.$('.theme2-pop-up-dialogue').addClass('scoreboard-class');
                this.$('.theme2-pop-up-title-text').addClass('scoreboard-title-text-class');
                this.$('.theme2-pop-up-title').addClass('scoreboard-title');
                this.$('.theme2-pop-up-text').addClass('scoreboard-text');
                this.$('.theme2-pop-up-body').addClass('scoreboard-body');
                //this.$('.theme2-pop-up-score-display-parent').addClass('theme2-pop-up-new-sorecard');

            }

            else if (popUpType === staticData.NEWSCOREBOARD) {
                this.$('.theme2-pop-up-score-display').css({ 'margin-left': '3px' });
                this.$('.theme2-pop-up-score-display-text').text(scoreText);
                this.$('.theme2-pop-up-score-display-text').addClass('new-scorecard-score-display-text-size');
                this.$('.theme2-pop-up-dialogue').addClass('new-scoreboard-class');
                this.$('.theme2-pop-up-title-text').addClass('new-scoreboard-title-text-class');
                this.$('.theme2-pop-up-title').addClass('new-scoreboard-title');
                this.$('.theme2-pop-up-text').addClass('new-scoreboard-text');
                this.$('.theme2-pop-up-body').addClass('new-scoreboard-body');
                this.$('.theme2-pop-up-score-display-parent').addClass('theme2-pop-up-new-sorecard');

                this.$('.theme2-pop-up-readable-text-region').addClass('new-scorecard-padding');

                var newHighScoreImage = $('<div>', {
                    id: this.idPrefix + 'new-scoreboard-high-score-img',
                    class: 'new-scoreboard-high-score-img'
                });

                this.$('.theme2-pop-up-dialogue').append(newHighScoreImage);

                if (this.imageOnForegroundId !== null && this.imageOnForegroundDimension !== null) {
                    this.$('#' + this.idPrefix + 'new-scoreboard-high-score-img').css({ 'background-image': 'url("' + this._path.getImagePath(this.imageOnForegroundId) + '")' });
                    this.$('#' + this.idPrefix + 'new-scoreboard-high-score-img').css({ 'height': this.imageOnForegroundDimension.height + 'px', 'width': this.imageOnForegroundDimension.width + 'px' });
                }
                if (this.imageOnForegroundSpritePosition !== null) {
                    this.$('#' + this.idPrefix + 'new-scoreboard-high-score-img').css({ 'background-position': this.imageOnForegroundSpritePosition.left + 'px ' + this.imageOnForegroundSpritePosition.top + 'px' });
                }

                if (this.imagePositionOnForeground !== null) {
                    this.$('#' + this.idPrefix + 'new-scoreboard-high-score-img').css({ 'left': this.imagePositionOnForeground.left + 'px', 'top': this.imagePositionOnForeground.top + 'px' });
                }
                else {
                    this.$('#' + this.idPrefix + 'new-scoreboard-high-score-img').css({ 'left': 0 + 'px', 'top': 0 + 'px' });
                }
                if (this.textOnForegroundImg !== null) {
                    var textDiv = $('<div>', {
                        id: this.idPrefix + 'text-On-Foreground-Img-format',
                        class: 'text-On-Foreground-Img-format'
                    });

                    this.$('.new-scoreboard-high-score-img').append(textDiv);

                    this.$('#' + this.idPrefix + 'text-On-Foreground-Img-format').text(this.textOnForegroundImg);
                }
            }

            else if (popUpType === staticData.CONFIRM) {  // to create yes or no button confirmed poppup

                //                this._hideContainers();
            }

            if (popUpWidth) {
                this.$('.theme2-pop-up-dialogue').css('width', popUpWidth);
            }
            if (bodyTextColor) {
                this.$('.theme2-pop-up-text').addClass(bodyTextColor);
            }
            if (titleTextColor) {
                this.$('.theme2-pop-up-title-text').addClass(titleTextColor);
            }


            this.player.setModalPresent(true);
            //this.loadScreen('theme2-pop-up-box');
            if (popUpType !== null && popUpType !== staticData.SCOREBOARD && popUpType !== staticData.NEWSCOREBOARD) {
                this.loadScreen('theme2-popup-title');
                var accObjScreen1 = {
                    "elementId": "theme2-pop-up-title-text",
                    "tabIndex": 5,
                    "offsetTop":-4,
                    "loc": "",
                    "acc": _accTitle ? _accTitle + ' ' + this.getAccMessage('text-to-append-to-pop-up-title', 0) : this._title + ' ' + this.getAccMessage('text-to-append-to-pop-up-title', 0)
                };
                var accObjScreen2 = {
                    "elementId": "theme2-pop-up-text",
                    "tabIndex": 4910,
                    "loc": "",
                    "acc": _accText ? _accText : this._text
                };
                this.createAccDiv(accObjScreen1);
                this.createAccDiv(accObjScreen2);

            }

            //call to generate buttons
            this.generateButtons();

            //this function set top and left of background image and pop up dialogue
            this.positionSetter();
            if (popUpType === null) {

                this._calculateDefaultPopupHackDivHeight();

                if (_accTitle) {
                    accTextDefaultPopup = _accTitle + ' ';
                } else {
                    accTextDefaultPopup = this._title + ' ';
                }

                if (_accText) {
                    accTextDefaultPopup += _accText;
                }
                else {
                    accTextDefaultPopup += this._text;
                }
                dynamicHackDivObjectForDefaultPopup = {

                    "elementId": 'theme2-pop-up-title-text-combined-acc',
                    "tabIndex": 5,
                    "offsetLeft":-2,
                    "acc": accTextDefaultPopup
                };
                this.createAccDiv(dynamicHackDivObjectForDefaultPopup);
            }
            if (popUpType === staticData.NEWSCOREBOARD) {
                this._calculateDefaultPopupHackDivHeightForNewScoreboard();

                if (_accText) {
                    accTextDefaultPopup = _accText + ' ';
                }
                else {
                    accTextDefaultPopup = this._text + ' ';
                }


                if (_accTitle) {
                    accTextDefaultPopup += _accTitle;
                }
                else {
                    accTextDefaultPopup += this._title;
                }

                dynamicHackDivObjectForDefaultPopup = {

                    "elementId": 'theme2-pop-up-title-text-combined-acc',
                    "tabIndex": 5,
                    "acc": accTextDefaultPopup
                };
                this.createAccDiv(dynamicHackDivObjectForDefaultPopup);
            }

            if (popUpType === staticData.SCOREBOARD) {
                this._calculateDefaultPopupHackDivHeightForScoreboard();

                if (_accText) {
                    accTextDefaultPopup = _accText + ' ';
                }
                else {
                    accTextDefaultPopup = this._text + ' ';
                }


                if (_accTitle) {
                    accTextDefaultPopup += _accTitle;
                }
                else {
                    accTextDefaultPopup += this._title;
                }


                dynamicHackDivObjectForDefaultPopup = {

                    "elementId": 'theme2-pop-up-title-text-combined-acc',
                    "tabIndex": 5,
                    "acc": accTextDefaultPopup
                };
                this.createAccDiv(dynamicHackDivObjectForDefaultPopup);
            }

        },

        /**
        * calculates popup hack div height and width
        * 
        * @method _calculateDefaultPopupHackDivHeightForNewScoreboard
        * @private
        **/
        _calculateDefaultPopupHackDivHeightForNewScoreboard: function () {
            var adjustPadding = 4,
                HackDivHeight = this.$('.theme2-pop-up-title-text').outerHeight() + this.$('.theme2-pop-up-text').outerHeight() + this.$('.theme2-pop-up-score-display-parent.theme2-pop-up-new-sorecard').outerHeight() + Number(this.$('.theme2-pop-up-body').css('padding-top').replace('px', '')) + Number(this.$('.theme2-pop-up-title').css('margin-bottom').replace('px', '')) + adjustPadding,
                accDivPositionTop = this.$('.theme2-pop-up-title').css('margin-top');
            this.$('.theme2-pop-up-title-text-combined-acc-new-scoreboard').css({ 'height': HackDivHeight + 'px', 'top': accDivPositionTop });
        },

        /**
        * calculates popup hack div height and width
        * 
        * @method _calculateDefaultPopupHackDivHeightForScoreboard
        * @private
        **/
        _calculateDefaultPopupHackDivHeightForScoreboard: function () {
            var adjustPadding = 4,
                HackDivHeight = this.$('.theme2-pop-up-title-text').outerHeight() + this.$('.theme2-pop-up-text').outerHeight() + this.$('.theme2-pop-up-score-display-parent').outerHeight() + Number(this.$('.theme2-pop-up-body').css('padding-top').replace('px', '')) + Number(this.$('.theme2-pop-up-title').css('margin-bottom').replace('px', '')) + adjustPadding,
                accDivPositionTop = this.$('.theme2-pop-up-title').css('margin-top');
            this.$('.theme2-pop-up-title-text-combined-acc-scoreboard').css({ 'height': HackDivHeight + 'px', 'top': accDivPositionTop });
        },
        /**
        * calculates popup hack div height and width
        * 
        * @method _calculateDefaultPopupHackDivHeight
        * @private
        **/
        _calculateDefaultPopupHackDivHeight: function () {
            var HackDivHeight = this.$('.theme2-pop-up-title-text').outerHeight() + this.$('.theme2-pop-up-text').outerHeight() + Number(this.$('.theme2-pop-up-body').css('padding-top').replace('px', '')),
                accDivPositionTop = this.$('.theme2-pop-up-title').css('margin-top');
            this.$('.theme2-pop-up-title-text-combined-acc-defaultType').css({ 'height': HackDivHeight + 'px', 'top': accDivPositionTop });
        },
        /**
        * Sets the position of the popup
        * 
        * @method positionSetter
        * @public
        **/
        positionSetter: function () {
            var dialogWidth = this.$('.theme2-pop-up-dialogue').width();
            if ((this._btnWidth + 100) > dialogWidth) {
                this.$('.theme2-pop-up-dialogue').width(this._btnWidth + 100);
            }

            var modalHeight = this.$('.theme2-pop-up-modal').height() + 44,
                modalWidth = this.$('.theme2-pop-up-modal').width(),
                dialogHeight = this.$('.theme2-pop-up-dialogue').height(),
                dialogWidth = this.$('.theme2-pop-up-dialogue').width();

            var backgroundImage = this.model.get('backgroundImage'),
                $backgroundImage, $foregroundImage,
                backgroundImagePosition = this.model.get('backgroundImageBackgroundPosition'),
                foregroundImage = this.model.get('foregroundImage'),
                foregroundImagePosition = this.model.get('foregroundImageBackgroundPosition'),
                foregroundImageHeight, foregroundImageWidth;
            if (backgroundImage) {
                var imgHeight = backgroundImage.imageHeight,
                imgWidth = backgroundImage.imageWidth;
                this.$('#' + this.idPrefix + 'theme2-pop-up-background-image').css({ 'background-image': 'url("' + this._path.getImagePath(backgroundImage.imageId) + '")' });
                if (backgroundImagePosition !== null || backgroundImagePosition !== undefined) {
                    this.$('#' + this.idPrefix + 'theme2-pop-up-background-image').css({ 'background-position': backgroundImagePosition });
                }
                $backgroundImage = this.$('.theme2-pop-up-background');
                $backgroundImage.height(imgHeight);
                $backgroundImage.width(imgWidth);
                $backgroundImage.css({ 'top': ((modalHeight / 2) - (imgHeight / 2)), 'left': ((modalWidth / 2) - (imgWidth / 2)) });
            }
            if (foregroundImage) {
                foregroundImageHeight = foregroundImage.imageHeight;
                foregroundImageWidth = foregroundImage.imageWidth;
                this.$('#' + this.idPrefix + 'theme2-pop-up-foreground-image').css({ 'background-image': 'url("' + this._path.getImagePath(foregroundImage.imageId) + '")' });
                if (foregroundImagePosition !== null || foregroundImagePosition !== undefined) {
                    this.$('#' + this.idPrefix + 'theme2-pop-up-foreground-image').css({ 'background-position': foregroundImagePosition });
                }
                $foregroundImage = this.$('.theme2-pop-up-foreground');
                $foregroundImage.height(foregroundImageHeight);
                $foregroundImage.width(foregroundImageWidth);
                $foregroundImage.css({
                    'left': -1 * ((modalWidth / 2) - (dialogWidth / 2)),
                    'top': -1 * (((modalHeight / 2) - (dialogHeight / 2)) - 44)
                });
            }
            this.$('.theme2-pop-up-dialogue').css({ 'top': ((modalHeight / 2) - (dialogHeight / 2)), 'left': ((modalWidth / 2) - (dialogWidth / 2)) });
            this.$('.scoreboard-body').css({ 'padding-left': ((dialogWidth / 2) - (this.$('.scoreboard-body').width() / 2)) });
            this.$('.theme2-pop-up-tts-container').css({ 'left': dialogWidth - 34 });
        },

        /**
        * Adjusts Background image position
        * 
        * @param {object} adjustProp  Has top/left/bottom/right values in pixel that is to be visible beyond popup.
        * @method adjustBackgroundImgPos
        **/
        adjustBackgroundImgPos: function (adjustProp) {
            var backgroundImage = this.model.get('backgroundImage'),
                $backgroundImage = this.$('.theme2-pop-up-background'),
                $popupDialogue = this.$('.theme2-pop-up-dialogue'),
                popupDialogueTop = parseFloat($popupDialogue.css('top'),10),
                popupDialogueLeft = parseFloat($popupDialogue.css('left'),10),
                popupDialogueWidth = $popupDialogue.width(),
                popupDialogueHeight = $popupDialogue.height(),
                popupModal = this.$('.theme2-pop-up-modal'),
                imgHeight = backgroundImage.imageHeight,
                imgWidth = backgroundImage.imageWidth,
                modalHeight = popupModal.height(),
                headerHeight = 44,
                modalWidth = popupModal.width();

            if (adjustProp !== null) {
                if (typeof adjustProp.left !== "undefined"){
                    if ((popupDialogueLeft - adjustProp.left) > 0) {
                        $backgroundImage.css('left', popupDialogueLeft - adjustProp.left);
                    }
                    else {
                        $backgroundImage.css('left', 0);
                    }
                }

                if (typeof adjustProp.top !== "undefined"){
                    if ((popupDialogueTop - adjustProp.top) > headerHeight) {
                        $backgroundImage.css('top', popupDialogueTop - adjustProp.top);
                    }
                    else {
                        $backgroundImage.css('top', headerHeight);
                    }
                }
                if (typeof adjustProp.right !== "undefined"){
                    if ((popupDialogueLeft + popupDialogueWidth + adjustProp.right) < modalWidth) {
                        $backgroundImage.css('left', popupDialogueLeft + (popupDialogueWidth - imgWidth) + adjustProp.right);
                    }
                    else {
                        $backgroundImage.css('left', modalWidth - imgWidth);
                    }
                }
                if (typeof adjustProp.bottom !== "undefined"){
                    if ((popupDialogueTop + popupDialogueHeight + adjustProp.bottom) < (modalHeight + headerHeight)) {
                        $backgroundImage.css('top', popupDialogueTop + (popupDialogueHeight - imgHeight) + adjustProp.bottom);
                    }
                    else {
                        $backgroundImage.css('top', modalHeight + headerHeight - imgHeight);
                    }
                }
            }
        },
        /**
        * Genrates the popup
        * 
        * @method generatePopup
        * @public
        **/
        generatePopup: function () {
            //pass parameters to template and append it to $el
            var options = {

                popupTitle: this._title,
                popupText: this._text,
                idPrefix: this.idPrefix

            },
            popUpType = this.popUpType;

            if (popUpType === null) {
                options.type = 'defaultType';
            }
            else {
                options.type = popUpType;
            }

            if (this.scoreDisplayChild !== null) {
                options.scoreDisplayChild = this.scoreDisplayChild;
            }
            else {
                options.scoreDisplayChild = '';
            }

            this.$el.append(MathInteractives.Common.Components.templates.theme2PopUpBox(options).trim());

            var $player = this.player.$el;
            //append el to DOM
            $player.append(this.el);

            var suppliedDialogWidth = this.model.get('width'),
                popupTextWidth = null,
                viewData = MathInteractives.global.Theme2.PopUpBox,
                suppliedDialogHeight = this.model.get('height');
            if (suppliedDialogWidth) {
                this.$('.theme2-pop-up-dialogue').width(parseFloat(suppliedDialogWidth));
                if (popUpType === null) {
                    this.$('#' + this.idPrefix + 'theme2-pop-up-text').width(suppliedDialogWidth - viewData.PADDING);
                }
            }
            else {
                if (popUpType === null) {
                    var $popupTextHolder = this.$('#' + this.idPrefix + 'theme2-pop-up-text'),
                    textWidth = viewData.DEFAULTWIDTH;
                    popupTextWidth = $popupTextHolder.width();
                    if (popupTextWidth < textWidth) {
                        $popupTextHolder.width(textWidth);
                    }
                }
            }
            if (suppliedDialogHeight) {
                this.$('.theme2-pop-up-dialogue').height(parseFloat(suppliedDialogHeight));
            }
        },


        /**
        * Generates Buttons
        * @method generateButtons
        * @public
        **/
        generateButtons: function () {
            /*
            * Generate close button if hasCloseBtn pass true by interactivity
            */
            var dynamicHackDivObject = null,
            incrementer = 10;
            /*
            * Add TTS button to title bar
            */
            //            var obj = {
            //                containerId: this.idPrefix + 'theme2-pop-up-tts-container',
            //                messagesToPlay: [this.idPrefix + 'theme2-pop-up-text'],
            //                path: this._path,
            //                player: this.player,
            //                idPrefix: this.idPrefix,
            //                manager: this.manager
            //            },
            //                    ttsTabIndex = this.getTabIndex('theme2-pop-up-text') + incrementer;
            //            var view = MathInteractives.global.PlayerTTS.generateTTS(obj),
            //            btnWidth = 0;
            //            view.renderTTSAccessibility(ttsTabIndex);
            var ttsTabIndex = this.getTabIndex('theme2-pop-up-text') + incrementer;
            if (this.model.get('containsTts')) {
                var ttsObj = {
                    'containerId': this.idPrefix + 'theme2-pop-up-tts-container',
                    'isEnabled': false,
                    'tabIndex': ttsTabIndex,
                    'manager': this.manager,
                    'idPrefix': this.idPrefix,
                    'player': this.player,
                    'filePath': this._path,
                    messagesToPlay: [this.idPrefix + 'theme2-pop-up-readable-text-region'],
                    tooltipColorType: this.model.get('tooltipColorType') ? this.model.get('tooltipColorType') : MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL_WHITE
                };
                this.popupViewRef = MathInteractives.global.Theme2.PlayerTTS.generateTTS(ttsObj);
                this.popupViewRef.renderTTSAccessibility(ttsTabIndex);
            }

            /*
            * Add pop-up type specific buttons
            */
            //var type = this.model.get('type'),
            var btnContainer = this.$('#' + this.idPrefix + 'theme2-pop-up-btns-aligner'),
            buttons = this.model.get('buttons');
            // buttons = buttons.length > 0 ? buttons : this.type.buttons;
            var buttonsLength = buttons.length;
            incrementer += 20;
            if (buttonsLength > 0) {
                for (var i = 0; i < buttonsLength; i++) {
                    var btnDiv = $('<div>', {
                        id: this.idPrefix + buttons[i].id,
                        class: 'theme2-pop-up-bottom-btn'
                    });

                    btnContainer.append(btnDiv);

                    dynamicHackDivObject = {

                        'elementId': buttons[i].id,
                        'tabIndex': this.getTabIndex('theme2-pop-up-text') + incrementer,
                        'role': 'button',
                        'offsetTop': 5,
                        'offsetLeft': 5,
                        'acc': buttons[i].accText || buttons[i].text
                    };
                    incrementer += 5;

                    var obj = {
                        idPrefix: this.idPrefix,
                        player: this.player,
                        manager: this.manager,
                        path: this._path,
                        data: {
                            id: this.idPrefix + buttons[i].id,
                            type: buttons[i].type ? buttons[i].type : MathInteractives.global.Theme2.Button.TYPE.TEXT,
                            colorType: buttons[i].colorType ? buttons[i].colorType : MathInteractives.global.Theme2.Button.COLORTYPE.BLUE,
                            text: buttons[i].text ? buttons[i].text : this.getMessage(buttons[i].id + '-text', 0),
                            btnWidthGroup: 'pop-up-buttons',
                            textColor: buttons[i].textColor,
                            baseClass: buttons[i].baseClass,
                            icon: buttons[i].icon ? buttons[i].icon : null,
                            textPosition: buttons[i].textPosition ? buttons[i].textPosition : null,
                            width: buttons[i].width ? buttons[i].width : null
                        }
                    };

                    if (this.model.get('buttonTextColor')) {
                        obj.data.textColor = this.model.get('buttonTextColor');
                    }
                    if (buttons[i].height !== null && typeof buttons[i].height !== 'undefined') {
                        obj.data.height = buttons[i].height;
                    }
                    //MathInteractives.global.Button.generateButton(obj);  //  to create dynamic acc object as the divs are created dynamically.           
                    var okButton = MathInteractives.global.Theme2.Button.generateButton(obj);
                    this.btnViewRef[i] = okButton;


                    if (this.popUpType === MathInteractives.global.Theme2.PopUpBox.CONFIRM) {
                        this._btnWidth += $(okButton.el).width() + 22;
                        this.$el.find('.theme2-pop-up-bottom-btn').css({ 'margin-right': '11px', 'margin-left': '11px' });
                    }
                    else {
                        this._btnWidth += $(okButton.el).width() + 18;
                        this.$el.find('.theme2-pop-up-bottom-btn').css({ 'margin-right': '9px', 'margin-left': '9px' });
                    }

                    this.createAccDiv(dynamicHackDivObject);
                    btnDiv.on('click', { currentButton: buttons[i] }, $.proxy(this._bottomBtnClickHandler, this));
                }

            }
            else {
                var btnDiv = $('<div>', {
                    id: this.idPrefix + 'pop-up-ok-btn',
                    class: 'theme2-pop-up-bottom-btn'
                });
                btnContainer.append(btnDiv);



                var obj = {
                    idPrefix: this.idPrefix,
                    player: this.player,
                    manager: this.manager,
                    path: this._path,
                    data: {
                        id: this.idPrefix + 'pop-up-ok-btn',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        colorType: MathInteractives.global.Theme2.Button.COLORTYPE.BLUE,
                        text: this.getMessage('theme2-pop-up-ok-btn-text', 0),
                        btnWidthGroup: 'pop-up-buttons'
                    }
                };
                if (this.model.get('buttonTextColor')) {
                    obj.data.textColor = this.model.get('buttonTextColor');
                }
                var okButton = MathInteractives.global.Theme2.Button.generateButton(obj); //  to create dynamic acc object as the divs are created dynamically.           
                this.btnViewRef[i] = okButton;


                if (this.popUpType === MathInteractives.global.Theme2.PopUpBox.CONFIRM) {
                    this._btnWidth += $(okButton.el).width() + 22;
                    this.$el.find('.theme2-pop-up-bottom-btn').css({ 'margin-right': '11px', 'margin-left': '11px' });
                }
                else {
                    this._btnWidth += $(okButton.el).width() + 18;
                    this.$el.find('.theme2-pop-up-bottom-btn').css({ 'margin-right': '9px', 'margin-left': '9px' });
                }

                dynamicHackDivObject = {

                    "elementId": 'pop-up-ok-btn',
                    "tabIndex": this.getTabIndex('theme2-pop-up-text') + incrementer,
                    "role": "button",
                    "acc": this.getMessage('theme2-pop-up-ok-btn-text', 0)
                };
                incrementer += 5;
                this.createAccDiv(dynamicHackDivObject);
                btnDiv.on('click', { currentButton: obj.data }, $.proxy(this._bottomBtnClickHandler, this));
            }

            this.$(btnContainer).width(this._btnWidth + 'px');
            //this.updateFocusRect("pop-up-yes-btn");
        },

        /* Handler for button click at bottom
        * @method _bottomBtnClickHandler
        * @public
        */
        _bottomBtnClickHandler: function (event) {
            var currentButton = event.data.currentButton,
            buttonId = currentButton.id.replace(this.idPrefix, '');

            MathInteractives.global.SpeechStream.stopReading();

            /*Apply click call back for particular button*/
            if (currentButton.clickCallBack) {
                currentButton.clickCallBack.fnc.apply(currentButton.clickCallBack.scope || this, [event]);
            }

            /*Send reponse data*/
            var response = { isPositive: false, buttonClicked: buttonId };
            if (currentButton.response) {
                response.isPositive = currentButton.response.isPositive;
                response.buttonClicked = currentButton.response.buttonClicked;
            }
            this._triggerCallback(response.isPositive, response.buttonClicked);
        },

        /**
        * Triggers callback function, if any 
        *
        * @method _triggerCallback
        * @param {Boolean} [isPositive] Type of response
        * @param {String} [buttonClicked] Button clicked
        * @private
        **/
        _triggerCallback: function _triggerCallback(isPositive, buttonClicked) {
            //Stop TTS Reading
            MathInteractives.global.SpeechStream.stopReading();
            this._removePopup();

            var closeCallback = this.model.get('closeCallback'),
                response = {};
            response.isPositive = isPositive;
            response.buttonClicked = buttonClicked;

            if (closeCallback) {
                closeCallback.fnc.apply(closeCallback.scope || this, [response]);
            }
        },


        /**
        * hide tts container and score-display container
        *
        * @method _hideContainers     
        * @private
        **/
        _hideContainers: function () {

            var self = this,
                idPrefix = this.idPrefix,
                $el = self.$el;


            this.$('#' + idPrefix + 'theme2-pop-up-header-btns').hide();
            this.$('#' + idPrefix + 'theme2-pop-up-score-display').hide();
        },

        /**
        * Removes pop-up modal
        *
        * @method _removePopup
        * @private
        **/
        _removePopup: function _removePopup() {
            this.$el.off('keydown.popupAccessibility');
            //this.manager.unloadScreen('player');
            this.remove();
            this.player.setModalPresent(false);
        }

    }, {
        /**
        * Creates popup view
        *
        * @method createPopup
        * @static
        * @return popupView
        **/
        createPopup: function (options) {

            if (options) {
                var popupModel = new MathInteractives.Common.Components.Theme2.Models.Theme2PopUp(options);
                var popupView = new MathInteractives.Common.Components.Theme2.Views.Theme2PopUp({ model: popupModel });

                return popupView;
            }
        },
        /**
        * Constant holding the type of popup box as scoreboard.
        * @property SCOREBOARD
        * @static
        */
        SCOREBOARD: 'scoreboard',
        /**
        * Constant holding the type of popup box as confirm.
        * @property SCOREBOARD
        * @static
        */
        CONFIRM: 'confirm',
        NEWSCOREBOARD: 'new-scoreboard',
        /**
        * Constant holding default width of popup
        * @property DEFAULTWIDTH
        * @static
        * @default 380
        */
        DEFAULTWIDTH: 380,
        /**
        * Constant holding default padding of popup
        * @property PADDING
        * @static
        * @default 40
        */
        PADDING: 40
    });
    MathInteractives.global.Theme2.PopUpBox = MathInteractives.Common.Components.Theme2.Views.Theme2PopUp;
})();