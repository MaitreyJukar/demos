
(function () {
    if (MathInteractives.Common.Player.Views.Header) {
        return;
    }
    'use strict';
    /**
    * A customized Backbone.View that holds the logic behind the presentation of Header.
    * @class HeaderView
    * @constructor
    * @namespace MathInteractives.Common.Player.Views
    * @module Common
    * @submodule Player
    * @extends Backbone.View
    */


    MathInteractives.Common.Player.Views.Header = Backbone.View.extend({
        /*
        * @property el
        * @type object
        * @default $('.header-container')
        **/
        el: '.header-container',

        /*
        * @property _helpBtn
        * @type object
        * @default null
        **/
        _helpBtn: null,

        /*
        * @property _drawerBtn
        * @type object
        * @default null
        **/
        _drawerBtn: null,

        /*
        * @property _screenShotBtn
        * @type object
        * @default null
        **/
        _screenShotBtn: null,

        /*
        * @property _saveBtn
        * @type object
        * @default null
        **/
        _saveBtn: null,

        /*
        * @property _unmuteBtn
        * @type object
        * @default null
        **/
        _unmuteBtn: null,

        /*
        * @property _muteBtn
        * @type object
        * @default null
        **/
        _muteBtn: null,

        /*
        * @property idPrefix
        * @type {string}
        * @default null
        **/
        idPrefix: null,
        /**
        * Holds the model of path for preloading files
        *
        * @property path
        * @type Object
        * @default null
        */
        path: null,

        /**
        * Holds the model of player for help screen modal presence check
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Holds the manager instance
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Holds the reference of help view
        * @property _helpView
        * @type Object
        * @default null
        */
        _helpView: null,

        /*
        * Holds the Button class wrt to current Theme
        * @property Button
        * @type Object
        * @default null
        */
        Button: null,

        /*
        * Stores boolean for help screen shown.
        * @property isHelpScreenShown
        * @default false
        * @type bool
        */
        isHelpScreenShown: false,

        /*
        * Stores boolean for tab drawer button click.
        * @property isTabDrawerClicked
        * @default false
        * @type bool
        */
        isTabDrawerClicked: false,

        events: {

        },


        /**
        * Initialization
        * @method initialize
        */
        initialize: function () {
            this.path = this.model.get('path');
            this.player = this.model.get('player');
            this.manager = this.model.get('manager');
            this.idPrefix = this.model.get('parentModel').get('prefix');
            this.manager.loadScreen('player-header', this.idPrefix);
            this.render();

            this._attachEvents();
        },

        /**
        * Initializes theme2 help screen.
        * @method initTheme2Help
        * @public
        */
        initTheme2Help: function () {
            var playerTheme = this.player.getPlayerThemeType(),
            Player = MathInteractives.Common.Player.Views.Player,
            interactiveModel = this.model.get('interactiveModel');

            if (playerTheme === Player.THEMES.THEME_2) {
                if (interactiveModel && interactiveModel.get('helpElements')) {
                    if (MathInteractives.Common.Components.Theme2.Views.Help) {
                        this._helpView = MathInteractives.Common.Components.Theme2.Views.Help.generateHelpScreen({
                            'player': this.player,
                            'manager': this.manager,
                            'idPrefix': this.idPrefix,
                            'filePath': this.path,
                            'helpElements': interactiveModel.get('helpElements')
                        });
                        this._helpView.hideHelpTooltip();
                    }
                }
            }
        },

        /**
        * Inserts css changes into DOM.
        * @method render
        * @chainable
        * @return {Object}
        */
        render: function () {
            var buttonTheme, buttonsThemes;
            buttonsThemes = this.model.get('buttons');
            var playerTheme = this.player.getPlayerThemeType(), Player = MathInteractives.Common.Player.Views.Player;

            switch (playerTheme) {
                case Player.THEMES.THEME_2:
                    playerTheme = true;
                    buttonTheme = buttonsThemes.theme2;
                    this.Button = MathInteractives.Common.Components.Theme2.Views.Button;
                    break;
                default:
                    this.Button = MathInteractives.Common.Components.Views.Button;
                    playerTheme = false;
                    buttonTheme = buttonsThemes.theme1;
            }
            var buttons = buttonTheme,
                            context = { headerButtons: buttons, idPrefix: this.idPrefix, playerTheme: playerTheme },
                            html = MathInteractives.Common.Player.templates.header(context).trim(),
                            $el = this.$el;

            $el.find('.header-content').append(html);

            if (playerTheme) {
                this._renderHeaderButtonsTheme2();
                this.manager.loadScreen('theme-2-header-subtitle', this.idPrefix);
            }
            else {
                $el.find('.header-left, .header-right').css({
                    'background-image': 'url("' + this.path.getImagePath('player-lr') + '")'
                });
                $el.find('.header-middle').css({
                    'background-image': 'url("' + this.path.getImagePath('player-m') + '")'
                });
                this._renderHeaderButtonsTheme1();
            }
            //this._renderHeaderButtons();
            /*$el.find('.header-tab-drawer-btn').css({
            'background': 'url("' + this.path.getImagePath('drawer-icon') + '") no-repeat'
            });
            $el.find('.header-dot').css({
            'background': 'url("' + this.path.getImagePath('header-dot') + '") no-repeat'
            });*/
            //            var subtitleText= this.manager.getMessage(this.idPrefix + 'header-subtitle', 0);
            //            $el.find('.header-subtitle').text(subtitleText);
            return this;
        },

        /**
        * Attach events to elemen
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            //var $headerSubtitle=this.$('.header-subtitle');
            if (this._screenShotBtn !== null) {
                this._screenShotBtn.$el.off('click.capture').on('click.capture', $.proxy(this._captureScreen, this));
            }
            this.enableHelp(true);
            this.enableSave(true);
            this.enablePopOut(true);
            this.enableTabDrawer(true);
            this.enableHeaderSubtitle(true);
            this.enableMuteUnmuteButton(true);
            var self = this;

            // Theme2 help screen : To enable disable help for perticular element.
            this.on(MathInteractives.Common.Player.Views.Player.Events.TOGGLE_ELEMENT_HELP,
                function (data) {
                    if (self._helpView) {
                        self._helpView.trigger(MathInteractives.Common.Player.Views.Player.Events.TOGGLE_ELEMENT_HELP
                        , data);
                    }
                });

            this.on(MathInteractives.Common.Player.Views.Player.Events.CHANGE_HELP_TEXT,
               function (data) {
                   if (self._helpView) {
                       self._helpView.trigger(MathInteractives.Common.Player.Views.Player.Events.CHANGE_HELP_TEXT
                       , data);
                   }
               });
        },


        /*
        * Handles drawer button click
        * @event
        * @method _drawerBtnClick
        */
        _drawerBtnClick: function _drawerBtnClick(event) {
            MathInteractives.global.SpeechStream.stopReading();
            this.isTabDrawerClicked = true;
            event.stopPropagation();
            var $drawerBtn = this._drawerBtn.$el, isDrawerVisible;
            isDrawerVisible = $drawerBtn.data('isDrawerVisible');

            if (isDrawerVisible) {
                $drawerBtn.data('isDrawerVisible', false);
            } else {
                $drawerBtn.data('isDrawerVisible', true);
            }

            this.model.trigger('tab-drawer-click', event, isDrawerVisible);
        },

        /*
        * Enable/Disable click of tab drawer button.
        * @method enableTabDrawerClick
        * @param {bool} enable
        * @public
        */
        enableTabDrawer: function (enable) {
            if (this._drawerBtn === null || typeof this._drawerBtn === 'undefined') {
                return;
            }
            this._drawerBtn.$el.off('click.drawerBtn');
            this._drawerBtn.setButtonState(this.Button.BUTTON_STATE_DISABLED);
            if (enable) {
                this._drawerBtn.$el.on('click.drawerBtn', $.proxy(this._drawerBtnClick, this));
                this._drawerBtn.setButtonState(this.Button.BUTTON_STATE_ACTIVE);
            }
        },

        /*
        * Enable/Disable click of header subtitle.
        * @method enableHeaderSubtitle
        * @param {bool} enable
        * @public
        */
        enableHeaderSubtitle: function (enable) {
            var $headerSubtitle = this.$('.header-subtitle');
            $headerSubtitle.off('click.headerSubTitle');
            $headerSubtitle.off('mouseenter');
            $headerSubtitle.off('mouseleave');
            //$headerSubtitle.removeClass('header-subtitle-hover');
            if (enable) {
                //$headerSubtitle.addClass('header-subtitle-hover');
                $headerSubtitle.on('mouseenter', $.proxy(function (event) {
                    $headerSubtitle.addClass('hover');
                }, this));
                $headerSubtitle.on('mouseleave', $.proxy(function (event) {
                    $headerSubtitle.removeClass('hover');
                }, this));

                $headerSubtitle.on('click.headerSubTitle', $.proxy(function (event) {
                    event.stopPropagation();
                    $headerSubtitle.removeClass('hover');
                    MathInteractives.global.SpeechStream.stopReading();
                    if (this._drawerBtn === null || typeof this._drawerBtn === 'undefined') {
                        return;
                    }
                    this.model.trigger('tab-drawer-click', event, this._drawerBtn.$el.data('isDrawerVisible'));
                }, this));

                MathInteractives.Common.Utilities.Models.Utils.EnableTouch($headerSubtitle,
                   { specificEvents: MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS.HOVER });
            }
        },


        /*
        * Enable/Disable click of mute/unmute buttons.
        * @method enableMuteUnmuteButton
        * @param {bool} enable
        * @public
        */
        enableMuteUnmuteButton: function enableMuteUnmuteButton(enable) {
            if (this._muteBtn === null || this._unmuteBtn === null) {
                return false;
            }
            this._unmuteBtn.$el.off('click.mute');
            this._muteBtn.$el.off('click.mute');
            this._unmuteBtn.setButtonState(this.Button.BUTTON_STATE_DISABLED);
            this._muteBtn.setButtonState(this.Button.BUTTON_STATE_DISABLED);
            if (enable) {
                this._unmuteBtn.$el.on('click.mute', $.proxy(this._unMuteClick, this));
                this._muteBtn.$el.on('click.mute', $.proxy(this._muteClick, this));
                this._unmuteBtn.setButtonState(this.Button.BUTTON_STATE_ACTIVE);
                this._muteBtn.setButtonState(this.Button.BUTTON_STATE_ACTIVE);
            }
        },

        /*
        * Enable/Disable click of header buttons.
        * @method enableHeaderButtons
        * @param {bool} enable
        * @public
        */
        enableHeaderButtons: function enableHeaderButtons(enable) {
            this.enableHelp(enable);
            this.enableSave(enable);
            this.enableScreenShot(enable);
            this.enableMuteUnmuteButton(enable);
        },


        /*
        * Enable/Disable click of all header buttons.
        * @method enableAllHeaderButtons
        * @param {bool} enable
        * @public
        */
        enableAllHeaderButtons: function enableAllHeaderButtons(enable) {
            this.enableHelp(enable);
            this.enableSave(enable);
            this.enableScreenShot(enable);
            this.enableMuteUnmuteButton(enable);
            this.enableTabDrawer(enable);
            this.enablePopOut(enable);
            this.enableHeaderSubtitle(enable);
        },

        /**
        * Instantiates header buttons as object of 'Button' class for theme2
        *
        * @method _renderHeaderButtons
        * @private
        **/
        _renderHeaderButtonsTheme2: function _renderHeaderButtons() {
            var helpBtnData = {
                data: {
                    id: this.idPrefix + 'help-btn',
                    type: this.Button.TYPE.HELP,
                    colorType: this.Button.COLORTYPE.HEADER_BLUE,
                    tooltipText: this.manager.getMessage(this.idPrefix + 'help', 0)
                },
                path: this.path,
                player: this.player,
                manager: this.manager,
                idPrefix: this.idPrefix

            };

            var helpBtnView = MathInteractives.global.Theme2.Button.generateButton(helpBtnData);
            this._helpBtn = helpBtnView;

            if (this.player.isMuteUnmuteShow() && !MathInteractives.Common.Utilities.Models.BrowserCheck.isIOS) {
                var muteBtnData = {
                    data: {
                        id: this.idPrefix + 'mute-btn',
                        type: this.Button.TYPE.MUTE,
                        colorType: this.Button.COLORTYPE.HEADER_BLUE,
                        tooltipText: this.manager.getMessage(this.idPrefix + 'mute', 0),
                        tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_LEFT
                    },
                    path: this.path,
                    player: this.player,
                    manager: this.manager,
                    idPrefix: this.idPrefix
                };

                var muteBtnView = MathInteractives.global.Theme2.Button.generateButton(muteBtnData);
                this._muteBtn = muteBtnView;

                var unmuteBtnData = {
                    data: {
                        id: this.idPrefix + 'unmute-btn',
                        type: this.Button.TYPE.UNMUTE,
                        colorType: this.Button.COLORTYPE.HEADER_BLUE,
                        tooltipText: this.manager.getMessage(this.idPrefix + 'unmute', 0),
                        tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_LEFT
                    },
                    path: this.path,
                    player: this.player,

                    manager: this.manager,
                    idPrefix: this.idPrefix
                };

                var unmuteBtnView = MathInteractives.global.Theme2.Button.generateButton(unmuteBtnData);
                this._unmuteBtn = unmuteBtnView;

                /*to hide and show mute unmute buttons*/
                this._unmuteBtn.hideButton();
            }
            else {
                //todo: remove mute/unmute btn containers
                this.$('#' + this.idPrefix + 'mute-btn, ' + '#' + this.idPrefix + 'unmute-btn').remove();
            }


            var screenShotBtnData = {
                data: {
                    id: this.idPrefix + 'screen-shot-btn',
                    type: this.Button.TYPE.CAMERA,
                    colorType: this.Button.COLORTYPE.HEADER_BLUE,
                    tooltipText: this.manager.getMessage(this.idPrefix + 'screenshot', 0)
                },
                path: this.path,
                player: this.player,
                manager: this.manager,
                idPrefix: this.idPrefix
            };

            // Checking whether this interactivity is popped uo or not
            var isPoppedOut = this.player.isPoppedOut();
            if (isPoppedOut === false) {
                var popOutBtnData = {
                    data: {
                        id: this.idPrefix + 'pop-out-btn',
                        type: this.Button.TYPE.POP_OUT,
                        colorType: this.Button.COLORTYPE.HEADER_BLUE,
                        tooltipText: this.manager.getMessage(this.idPrefix + 'pop-out', 0)
                    },
                    path: this.path,
                    player: this.player,

                    manager: this.manager,
                    idPrefix: this.idPrefix
                };

                if (!this.player.isMuteUnmuteShow()) {
                popOutBtnData.data.tooltipType = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_LEFT_CENTER;
                }
                var popOutBtnView = MathInteractives.global.Theme2.Button.generateButton(popOutBtnData);
                this._popOutBtn = popOutBtnView;
            }
            else {
                this.$('#' + this.idPrefix + 'pop-out-btn').remove();
                if (!this.player.isMuteUnmuteShow()) {
                    //regenerate screenshot button tooltip
                    screenShotBtnData.data.tooltipType = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_LEFT;
                }
            }
            if (this.$('#' + this.idPrefix + 'screen-shot-btn').length > 0) {
                var screenShotBtnView = MathInteractives.global.Theme2.Button.generateButton(screenShotBtnData);
                this._screenShotBtn = screenShotBtnView;
            }

            var drawerData = {
                'player': this.player,
                'manager': this.manager,
                'path': this.path,
                'idPrefix': this.idPrefix,
                'data': {
                    'id': this.idPrefix + 'header-tab-drawer-btn',
                    'type': MathInteractives.global.Theme2.Button.TYPE.DRAWER,
                    'colorType': MathInteractives.global.Theme2.Button.COLORTYPE.DRAWER,
                    tooltipText: this.manager.getMessage(this.idPrefix + 'drawer', 0),
                    tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_RIGHT,
                    'borderRadius': 0
                }
            }

            this._drawerBtn = this.Button.generateButton(drawerData);

            /*var fullScreenBtnData = {
            id: this.idPrefix + 'full-screen-btn',
            type: MathInteractives.Common.Components.Views.Button.TYPE.FULL_SCREEN,
            tooltipText: this.manager.getMessage(this.idPrefix + 'full-screen', 0),
            path: this.path,
            player: this.player
            };
            var fullScreenBtnView = MathInteractives.global.Button.generateButton(fullScreenBtnData);
            fullScreenBtnView.$el.off('click').on('click', $.proxy(this._saveModelState, this));
            */

            var isSaveStateAllowed = this.player.isSaveStateAllowed(),
                saveBtnLength = this.$('#' + this.idPrefix + 'save-btn').length;

            if ((isSaveStateAllowed === true) && (saveBtnLength>0)) {
                var saveBtnData = {
                    'player': this.player,
                    'manager': this.manager,
                    'path': this.path,
                    'idPrefix': this.idPrefix,
                    'data': {
                        'id': this.idPrefix + 'save-btn',
                        'type': MathInteractives.global.Theme2.Button.TYPE.SAVE,
                        colorType: this.Button.COLORTYPE.HEADER_BLUE//,
                        //tooltipText: this.manager.getMessage(this.idPrefix + 'save', 0)
                    }
                };
                var saveBtnView = MathInteractives.global.Theme2.Button.generateButton(saveBtnData);


                this._saveBtn = saveBtnView;
            }
            else {
                if (saveBtnLength > 0) {
                    this.$('#' + this.idPrefix + 'save-btn').remove();
                }
            }


        },


        /**
        * fired on click of unmute button
        *
        * @method _unMuteClick
        * @private
        **/
        _unMuteClick: function _unMuteClick() {
            MathInteractives.global.SpeechStream.stopReading();

            this._unmuteBtn.hideButton();
            this._muteBtn.showButton();
            this.manager.setFocus(this.idPrefix + 'mute-btn');
            this.model.set('isMuted', false);
            this.player.trigger(MathInteractives.Common.Player.Views.Player.Events.UNMUTE_CLICKED);
        },

        /**
        * fired on click of mute button
        *
        * @method _muteClick
        * @private
        **/
        _muteClick: function _muteClick() {
            MathInteractives.global.SpeechStream.stopReading();
            this._unmuteBtn.showButton();
            this._muteBtn.hideButton();
            this.manager.setFocus(this.idPrefix + 'unmute-btn');
            this.model.set('isMuted', true);
            this.player.trigger(MathInteractives.Common.Player.Views.Player.Events.MUTE_CLICKED);
        },

        /**
        * Instantiates header buttons as object of 'Button' class for theme1.
        *
        * @method _renderHeaderButtons
        * @private
        **/
        _renderHeaderButtonsTheme1: function _renderHeaderButtons() {
            var helpBtnData = {
                id: this.idPrefix + 'help-btn',
                type: this.Button.TYPE.HELP,
                tooltipText: this.manager.getMessage(this.idPrefix + 'help', 0),
                path: this.path,
                player: this.player,
                manager: this.manager
            };

            var helpBtnView = MathInteractives.global.Button.generateButton(helpBtnData);
            this._helpBtn = helpBtnView;

            if (this.$('#' + this.idPrefix + 'screen-shot-btn').length > 0) {
                var screenShotBtnData = {
                    id: this.idPrefix + 'screen-shot-btn',
                    type: this.Button.TYPE.CAMERA,
                    tooltipText: this.manager.getMessage(this.idPrefix + 'screenshot', 0),
                    path: this.path,
                    player: this.player,
                    manager: this.manager
                };
                var screenShotBtnView = MathInteractives.global.Button.generateButton(screenShotBtnData);
                this._screenShotBtn = screenShotBtnView;
            }


            /*var fullScreenBtnData = {
            id: this.idPrefix + 'full-screen-btn',
            type: this.Button.TYPE.FULL_SCREEN,
            tooltipText: this.manager.getMessage(this.idPrefix + 'full-screen', 0),
            path: this.path,
            player: this.player
            };
            var fullScreenBtnView = MathInteractives.global.Button.generateButton(fullScreenBtnData);
            fullScreenBtnView.$el.off('click').on('click', $.proxy(this._saveModelState, this));
            */

            var isSaveStateAllowed = this.player.isSaveStateAllowed(),
                saveBtnLength = this.$('#' + this.idPrefix + 'save-btn').length;

            if ((isSaveStateAllowed === true) && (saveBtnLength > 0)) {
                var saveBtnData = {
                    id: this.idPrefix + 'save-btn',
                    type: this.Button.TYPE.SAVE,
                    //tooltipText: this.manager.getMessage(this.idPrefix + 'save', 0),
                    path: this.path,
                    manager: this.manager,
                    player: this.player,
                    idPrefix: this.idPrefix,
                    displayType: 'both',
                    iConPosition: 'right'
                };
                var saveBtnView = MathInteractives.global.Button.generateButton(saveBtnData);
                this._saveBtn = saveBtnView;
            }
            else {
                if (saveBtnLength > 0) {
                    this.$('#' + this.idPrefix + 'save-btn').remove();
                }
            }
        },

        /*
        * Enable/Disable pop-out button
        * @method enablePopOut
        * @param {bool} enable
        * @private
        */
        enablePopOut: function (enable) {
            if (this._popOutBtn === null || typeof this._popOutBtn === 'undefined') {
                return;
            }
            this._popOutBtn.$el.off('click');
            this._popOutBtn.setButtonState(this.Button.BUTTON_STATE_DISABLED);
            if (enable) {
                this._popOutBtn.$el.on('click', $.proxy(this._popoutActivity, this));
                this._popOutBtn.setButtonState(this.Button.BUTTON_STATE_ACTIVE);
            }
        },


        /*
        * Enable/Disable Help ScreenBtn
        * @method enableHelp
        * @param {bool} enable
        * @private
        */
        enableHelp: function (enable) {
            this._helpBtn.$el.off('click.help');
            this._helpBtn.setButtonState(this.Button.BUTTON_STATE_DISABLED);
            if (enable) {
                this._helpBtn.$el.on('click.help', $.proxy(this._showHelp, this));
                this._helpBtn.setButtonState(this.Button.BUTTON_STATE_ACTIVE);
            }
        },

        /*
        * Enable/Disable Screen Shot button
        * @method enableScreenShot
        * @param {bool} enable
        * @private
        */
        enableScreenShot: function (enable) {
            if (this._screenShotBtn !== null) {
                this._screenShotBtn.$el.off('click.capture');
                this._screenShotBtn.setButtonState(this.Button.BUTTON_STATE_DISABLED);
                if (enable) {
                    this._screenShotBtn.$el.on('click.capture', $.proxy(this._captureScreen, this));
                    this._screenShotBtn.setButtonState(this.Button.BUTTON_STATE_ACTIVE);
                }
            }
        },

        /*
        * Enable/Disable Save ScreenBtn
        * @method enableSave
        * @param {bool} enable
        * @private
        */
        enableSave: function (enable) {
            if (this._saveBtn !== null) {
                this._saveBtn.$el.off('click.save');
                this._saveBtn.setButtonState(this.Button.BUTTON_STATE_DISABLED);
                if (enable) {
                    this._saveBtn.$el.off('click.save').on('click.save', $.proxy(this._saveModelState, this));
                    this._saveBtn.setButtonState(this.Button.BUTTON_STATE_ACTIVE);
                }
            }
        },


        /**
        * Shows pop up on click of the help button
        *
        * @event _showHelp
        **/
        _showHelp: function _showHelp(event) {
            var helpAlertText = this.model.helpText, playerTheme = this.player.getPlayerThemeType(), Player = MathInteractives.Common.Player.Views.Player,
            interactiveModel = this.model.get('interactiveModel'), isHelpScrShown;

            MathInteractives.global.SpeechStream.stopReading();
            if (playerTheme === Player.THEMES.THEME_2) {
                if (this._helpView) {
                    this._helpView.toggleHelpView();
                    isHelpScrShown = this._helpView.toggle;
                    this.isHelpScreenShown = isHelpScrShown;
                }
                if (this.isHelpScreenShown) {
                    this._helpBtn.setButtonState(this.Button.BUTTON_STATE_SELECTED);
                }
                else {
                    this._helpBtn.setButtonState(this.Button.BUTTON_STATE_ACTIVE);
                    this.manager.setFocus(this.idPrefix + 'help-btn');
                }
                this.model.trigger('help-click');
                this.player.trigger(MathInteractives.Common.Player.Views.Player.Events.HELP_CLICKED
                                , isHelpScrShown);
                this.player.setModalPresent(isHelpScrShown);
                return;
            }
            this.enableHelp(false);
            var templateFromModel = this.model.get('currentTemplate');
            this._showHelpScreen(templateFromModel);
        },

        /**
        * Fired on click of screen-shot button
        *
        * @event _captureScreen
        **/
        _captureScreen: function _captureScreen() {
            MathInteractives.global.SpeechStream.stopReading();
            var self = this,
                Player = MathInteractives.Common.Player.Views.Player;
            self.player.trigger(Player.Events.SCREENSHOT_START);
            //adding loading modal for screenshot
            var $modal = $('<div>', {
                'class': 'screen-shot-modal',
                'data-html2canvas-ignore': 'true'
            });

            //$('.theme2-tooltip:not(.help-tooltip)').hide();issue 15667 remove for lcm tooltip in screenshot

            self.player.$el.append($modal);
            self.player.setModalPresent(true)
            setTimeout(function () {
                MathInteractives.global.SpeechStream.stopReading();
                MathInteractives.Common.Utilities.Models.ScreenUtils.init();
                MathInteractives.Common.Utilities.Models.ScreenUtils.getScreenShot({
                    //container: $('#' + self.model.get('containerId') + ' div:first'),
                    container: self.player.$el,
                    type: MathInteractives.Common.Utilities.Models.ScreenUtils.types.BASE64,
                    background: 'transparent',
                    useCORS: true,
                    complete: function (base64Image) {
                        self.model.trigger('save-image', { base64Image: base64Image });
                        self.player.trigger(Player.Events.SCREENSHOT_END);
                        $modal.remove();
                        self.player.setModalPresent(false);
                    }
                });

            }, 50);



        },

        _saveModelState: function _saveModelState() {
            MathInteractives.global.SpeechStream.stopReading();
            this.model.trigger('save-state');
        },

        /**
        * Function to show help screen  
        *
        * @method _showHelpScreen
        * @param {String} text To be shown in pop up
        * @param {function} callback 
        * @param {boolean} isConfirmBox
        * @private
        **/
        _showHelpScreen: function _showHelpScreen(template) {
            MathInteractives.global.SpeechStream.stopReading(false);
            var $parent = this.$el.parent();
            var helpScreenTemplates = this.model.get('helpScreenTemplates');
            var currentTab = this.model.get('parentModel').get('currentActiveTab');
            var currentHelpScreen = helpScreenTemplates[currentTab].template;
            var context = { idPrefix: this.idPrefix };

            var images = helpScreenTemplates[currentTab].templateImages;
            var accTextElemId = helpScreenTemplates[currentTab].accTextElemId;
            var moduleName = this.model.get('moduleName');

            var helpScreenShowCallback = this.model.get('helpScreenShowCallback');
            if (template !== null) {
                currentHelpScreen = template.template;
                images = template.templateImages;
                accTextElemId = template.accTextElemId;
            }

            $parent.find('.help-screen').remove();
            var $helpScreen = $('<div>', {
                'class': 'help-screen'
            })


            var $content = $('<div>', { 'class': 'help-screen-content' }).appendTo($helpScreen);

            var $helpScreenAccDiv = $('<div>', {
                'id': this.idPrefix + 'help-screen-acc-div',
                'class': 'help-screen-acc-div'
            }).appendTo($helpScreen);


            var $closeBtn = $('<div>', { 'class': 'help-screen-close-btn', 'id': this.idPrefix + 'help-screen-close-btn' }).appendTo($helpScreen);

            if (helpScreenShowCallback !== null) {
                helpScreenShowCallback.fnc.apply(helpScreenShowCallback.scope || this);
            }


            $closeBtn.on('click.helpScreenClose', $.proxy(this._helpScreenCloseButtonClick, this));

            /*apply show call back*/


            if (helpScreenTemplates.length > 0) {
                $parent.append($helpScreen);
                $helpScreenAccDiv.css({
                    height: $content.height() - 10 - this.$el.height(),
                    width: $content.width() - 10
                });

                if (currentHelpScreen !== undefined) {
                    $content.append(MathInteractives.Interactivities[moduleName].templates[currentHelpScreen](context).trim());
                }

                var $imageElement;
                for (var index in images) {
                    $imageElement = $('#' + this.idPrefix + images[index]);     // Name of div in help template should be same as image ID
                    if ($imageElement.length > 0) {
                        $imageElement.css({
                            'background-image': 'url("' + this.path.getImagePath(images[index]) + '")'
                        });
                    }
                }

                //Generating button and adding event for close
                //var helpCloseBtn = new MathInteractives.Common.Components.Models.Button({
                //    id: this.idPrefix + 'help-screen-close-btn',
                //    baseClass: 'help-screen-close-btn',
                //    text: 'Close'
                //});
                //var helpCloseBtnView = new this.Button({
                //    model: helpCloseBtn
                //});

                var helpCloseBtnView = MathInteractives.global.Button.generateButton({
                    id: this.idPrefix + 'help-screen-close-btn',
                    type: this.Button.TYPE.GENERAL,
                    path: this.path,
                    fixedMinWidth: true,
                    text: this.manager.getMessage(this.idPrefix + 'help-screen-close-btn-text', 0)
                })

                this.player.setModalPresent(true);

            }
            else {

                //show popup if template not provides
                var popUp = new MathInteractives.Common.Player.Models.PopUp({
                    text: text,
                    callback: callback,
                    isConfirmBox: isConfirmBox
                }),
                                popUpView = new MathInteractives.Common.Player.Views.PopUp({
                                    model: popUp
                                });
            }

            //increase height if tabs container present
            //if (helpScreenTemplates.length > 1) {
            //    $helpScreen.css({ 'height': 478 });
            //}
            //MathInteractives.global.PlayerModel.modalPresent = true;


            this.manager.loadScreen('help-modal-screen', this.idPrefix);
            if (accTextElemId) {
                var accMessage = this.manager.getAccMessage(this.idPrefix + accTextElemId, '0');
                this.manager.setAccMessage(this.idPrefix + 'help-screen-acc-div', accMessage);
                this.manager.setFocus(this.idPrefix + 'help-screen-acc-div');
            }

            /*Handled shift tab on help screen modal and set focus interactivty title so as focus should not enter in interactivity*/
            $('#' + this.idPrefix + 'help-screen-acc-div').bind('keydown', $.proxy(function (e) {
                if (e.keyCode === 9 && e.shiftKey) {
                    e.preventDefault();
                    this.manager.setFocus(this.idPrefix + 'heading');
                }
            }, this));

            /*Handle tab on heading and focus set help screen modal if it is present*/
            this.$('#' + this.idPrefix + 'heading').bind('keydown', $.proxy(function (e) {
                if (e.target.parentNode !== e.currentTarget) {
                    return true;
                }

                if (e.keyCode === 9 && !e.shiftKey) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.manager.setFocus(this.idPrefix + 'help-screen-acc-div');
                }
            }, this));

        },

        /*
        * Close click handler for help screen   
        * @method _helpScreenCloseButtonClick
        * @private
        */
        _helpScreenCloseButtonClick: function () {
            $('#' + this.idPrefix + 'help-screen-acc-div').unbind('keydown');
            this.$('#' + this.idPrefix + 'heading').unbind('keydown');

            MathInteractives.global.SpeechStream.stopReading();
            this.$el.parent().find('.help-screen').remove();
            this.enableHelp(true);

            var helpScreenCloseCallback = this.model.get('helpScreenCloseCallback');

            if (helpScreenCloseCallback !== null) {
                helpScreenCloseCallback.fnc.apply(helpScreenCloseCallback.scope || this);
            }
            //MathInteractives.global.PlayerModel.modalPresent = false;
            this.player.setModalPresent(false);

            this.manager.setFocus(this.idPrefix + 'help-btn');
        },

        /*
        * Triggers click event to call _onPopoutBtnClick function in Player 
        * @method _popoutActivity
        * @private
        */
        _popoutActivity: function _popoutActivity() {
            MathInteractives.global.SpeechStream.stopReading();
            this.model.trigger('popout-click');
        },

    }, {


    });

})();