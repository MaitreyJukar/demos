(function () {
    if (MathInteractives.Common.Player.Views.TTS) {
        return;
    }
    'use strict';

    /**
    * View for rendering TTS and its related events
    *
    * @class TTS
    * @constructor
    * @namespace MathInteractives.Common.Player.Views
    **/
    MathInteractives.Common.Player.Views.TTS = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * backbone view for tts play button
        * 
        * @property ttsPlayView
        * @type Object
        * @defaults null
        */
        ttsPlayView: null,

        /**
        * backbone view for tts pause button
        * 
        * @property ttsPauseView
        * @type Object
        * @defaults null
        */
        ttsPauseView: null,

        /**
        * backbone view for tts sound button
        * 
        * @property ttsSoundView
        * @type Object
        * @defaults null
        */
        ttsSoundView: null,

        /**
        * jQuery object of tts container
        * 
        * @property $container
        * @type Object
        * @defaults null
        */
        $container: null,

        /**
        * jQuery object of TTS tooltip
        * 
        * @property $btnTooltip
        * @type Object
        * @defaults null
        */
        $ttsTooltip: null,

        /**
        * jQuery object of tts play button
        * 
        * @property $ttsContainer
        * @type Object
        * @defaults null
        */
        $ttsContainer: null,

        /**
        * jQuery object of tts pause button
        * 
        * @property $ttsPauseContainer
        * @type Object
        * @defaults null
        */
        $ttsPauseContainer: null,


        /**
        * messages to play when clicked on tts play button
        * 
        * @property messagesToPlay
        * @type Array
        * @defaults null
        */
        messagesToPlay: null,

        /**
        * TTS tooltip Backbone.js view
        * 
        * @property ttsTooltipView
        * @type Object
        * @defaults null
        */
        ttsTooltipView: null,

        /**
        * stores touch start timer value
        * 
        * @property _touchStartTimer
        * @type Object
        * @defaults null
        */
        _touchStartTimer: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property path
        * @type Object
        * @default null
        */
        path: null,
        /**
        * TTs color
        *
        * @property ttsColor
        * @type Object
        * @default null
        */
        ttsColor: null,
        /**
        * whether to show sound img
        *
        * @property soundImage
        * @type boolean
        * @default true
        */
        soundImage: true,
        /**
        * Holds interactivity player reference
        *
        * @property player
        * @type Object
        * @default null
        */
        player: null,
        /**
        * stores themeType
        *
        * @property themeType
        * @type Object
        * @default null
        */
        themeType: null,

        /**
        * Calls render and attach events
        *
        * @method initialize
        * @public
        **/
        initialize: function initialize() {
            this.path = this.model.get('path');
            this.idPrefix = this.model.get('idPrefix'),
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this.themeType = this.player.getPlayerThemeType();
            this.filePath = this.model.get('filePath');
            this.ttsColor = this.model.get('ttsColor');
            this.render();
            this._attachEvents();
            if (this.themeType !== 2) {
                this._attachTooltip();
            } else {
                this.loadScreen('tts-button-component');
            }
            this.$messagesToPlay = this.model.get('messagesToPlay');
            //

            this.ttsColor = this.model.getTTSColor();
        },

        /**
        * Renders TTs
        *
        * @method render
        * @public
        **/
        render: function render() {
            this.$container = this.$el;
            if (this.themeType === 2) {
                this._generateTTSThemeType2();
            }
            else {
                this._generateTTS();
            }

        },


        /*
        * Generate tts accessibility divs and set tab Index
        * @method renderTTSAccessibility
        * @param {Number} tabIndex : tab index for the buttons.
        */
        renderTTSAccessibility: function (tabIndex) {
            //this.loadScreen('tts-button-component');
            var ttsAccMsg = this.getAccMessage('tts-btn', 0),
                playBtnHackProp = null,
                soundBtnHackProp = {
                    elementId: this.$ttsContainer.attr('id').split(this.idPrefix)[1],
                    tabIndex: tabIndex,
                    role: 'button',
                    acc: ttsAccMsg
                },
                pauseBtnHackProp = {
                    elementId: this.$ttsPauseContainer.attr('id').split(this.idPrefix)[1],
                    tabIndex: tabIndex,
                    role: 'button',
                    acc: ttsAccMsg
                };
            if (this.themeType === 2) {
                playBtnHackProp = {
                    elementId: this.$ttsPlayContainer.attr('id').split(this.idPrefix)[1],
                    tabIndex: tabIndex,
                    role: 'button',
                    acc: ttsAccMsg
                };
                this.createAccDiv(playBtnHackProp);
            } else {
                pauseBtnHackProp.offsetTop = -2;
                pauseBtnHackProp.offsetLeft = -1;
                soundBtnHackProp.offsetTop = -2;
                soundBtnHackProp.offsetLeft = -1;
            }
            this.createAccDiv(pauseBtnHackProp);
            this.createAccDiv(soundBtnHackProp);
        },

        /*
        * Enable/ Disable tts Tab Index.
        * @method enableTab
        * @param {Boolean} isEnabled.
        */
        enableTTSBtnTab: function (isEnabled) {
            var playBtnId = this.$ttsContainer.attr('id').split(this.idPrefix)[1],
                pauseBtnId = this.$ttsPauseContainer.attr('id').split(this.idPrefix)[1];
            this.enableTab(playBtnId, isEnabled);
            this.enableTab(pauseBtnId, isEnabled);
        },
        /*
        * Generating a tts play and pause button
        * @method _generateTTSThemeType2
        * @private
        */
        _generateTTSThemeType2: function () {

            var container = this.model.get('containerId'),
                model = this.model,
                ttsBaseClass = model.getTTSBaseClass(),
                $ttsContainer,
                $tts,
                $ttsPauseContainer,
                $ttsPlayContainer,
                $ttsPause, data, data1, data2, tooltipView, tooltipView1, tooltipView2;



            $ttsContainer = $('<div>', {
                'id': container + '-sound-btn',
                'class': 'sound-tts-container'
            });


            $ttsPlayContainer = $('<div>', {
                'id': container + '-play-btn',
                'class': 'play-tts-container'
            });



            $ttsPauseContainer = $('<div>', {
                'id': container + '-pause-btn',
                'class': 'pause-tts-container'
            });

            //$ttsContainer.append($tts);
            //$ttsPauseContainer.append($ttsPause);

            this.$container.append($ttsPauseContainer)
                        .append($ttsContainer).append($ttsPlayContainer);

            //this.$container.append($ttsPlayContainer);

            var soundBtn = {

                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'data': {
                    'id': container + '-sound-btn',
                    'type': MathInteractives.Common.Components.Theme2.Views.Button.TYPE.TTS_SOUND,
                    'baseClass': ttsBaseClass,
                    'tooltipText': this.manager.getMessage('tts-tooltip-play', 0),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    'tooltipColorType': this.model.get('tooltipColorType')
                }
            };

            if (this.ttsColor !== null) {
                soundBtn.data.colorType = this.ttsColor;
            }

            this.ttsSoundView = MathInteractives.global.Theme2.Button.generateButton(soundBtn);

            var playBtn = {
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'data': {
                    'id': container + '-play-btn',
                    'type': MathInteractives.Common.Components.Theme2.Views.Button.TYPE.TTS_PLAY,
                    'baseClass': ttsBaseClass,
                    'tooltipText': this.manager.getMessage('tts-tooltip-play', 0),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    'tooltipColorType': this.model.get('tooltipColorType')
                }
            };

            if (this.ttsColor !== null) {
                playBtn.data.colorType = this.ttsColor;
            }

            this.ttsPlayView = MathInteractives.global.Theme2.Button.generateButton(playBtn);

            var pauseBtn = {
                'player': this.player,
                'manager': this.manager,
                'path': this.filePath,
                'data': {
                    'id': container + '-pause-btn',
                    'type': MathInteractives.Common.Components.Theme2.Views.Button.TYPE.TTS_PAUSE,
                    'baseClass': ttsBaseClass,
                    'tooltipText': this.manager.getMessage('tts-tooltip-pause', 0),
                    'tooltipType': MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,
                    'tooltipColorType': this.model.get('tooltipColorType')
                }
            };

            if (this.ttsColor !== null) {
                pauseBtn.data.colorType = this.ttsColor;
            }
            this.ttsPauseView = MathInteractives.global.Theme2.Button.generateButton(pauseBtn);



            this.$container.css({
                height: $ttsContainer.height(),
                width: $ttsContainer.width()
            });

            this.$ttsContainer = $ttsContainer;
            this.$ttsPauseContainer = $ttsPauseContainer;
            this.$ttsPlayContainer = $ttsPlayContainer;

            this.$ttsPauseContainer.hide();
            this.$ttsPlayContainer.hide();
        },

        /*
        * hides tts tooltips
        * @method hideTTSTooltip
        * @public
        */
        hideTTSTooltip: function hideTTSTooltip() {
            if (this.ttsPauseView) this.ttsPauseView.removeTooltip();
            if (this.ttsPlayView) this.ttsPlayView.removeTooltip();
            if (this.ttsSoundView) this.ttsSoundView.removeTooltip();
        },

        /*
        * Generating a tts play and pause button
        * @method _generateTTS
        * @private
        */
        _generateTTS: function () {

            var container = this.model.get('containerId'),
                $ttsContainer,
                $tts,
                $ttsPauseContainer,
                $ttsPause;



            $ttsContainer = $('<div>', {
                'id': container + '-play-btn',
                'class': 'tts-container'
            });



            $ttsPauseContainer = $('<div>', {
                'id': container + '-pause-btn',
                'class': 'pause-tts-container'
            });

            //$ttsContainer.append($tts);
            //$ttsPauseContainer.append($ttsPause);

            this.$container.append($ttsPauseContainer)
                        .append($ttsContainer);


            var playBtn = {
                id: container + '-play-btn',
                type: MathInteractives.Common.Components.Views.Button.TYPE.TTS_SOUND,
                path: this.path
            };

            MathInteractives.global.Button.generateButton(playBtn);



            var pauseBtn = {
                id: container + '-pause-btn',
                type: MathInteractives.Common.Components.Views.Button.TYPE.TTS_PAUSE,
                path: this.path
            };

            MathInteractives.global.Button.generateButton(pauseBtn);


            this.$container.css({
                height: $ttsContainer.height(),
                width: $ttsContainer.width()
            });

            this.$ttsContainer = $ttsContainer;
            this.$ttsPauseContainer = $ttsPauseContainer;

        },

        /**
        * Attaches mouse and touch events to tts play and pause buttons 
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var $ttsContainer = this.$ttsContainer;
            var $ttsPauseContainer = this.$ttsPauseContainer,
                $ttsPlayContainer;

            //if (!$.support.touch) {
            $ttsContainer.on('mouseover', $.proxy(this._onMouseOver, this));
            $ttsContainer.on('mouseout', $.proxy(this._onMouseOut, this));
            $ttsContainer.on('mousedown', $.proxy(this._onttsMouseDown, this));
            $ttsContainer.on('mouseup', $.proxy(this._onttsMouseup, this));
            $ttsContainer.on('focusOnCompletion', $.proxy(this._focusOnSpeechComplete, this));

            $ttsPauseContainer.on('mouseover', $.proxy(this._onMouseOver, this));
            $ttsPauseContainer.on('mouseout', $.proxy(this._onMouseOut, this));
            $ttsPauseContainer.on('mousedown', $.proxy(this._onPauseMouseDown, this));
            $ttsPauseContainer.on('mouseup', $.proxy(this._onPauseMouseup, this));

            if (this.themeType === 2) {
                $ttsPlayContainer = this.$ttsPlayContainer;
                $ttsPlayContainer.on('mouseover', $.proxy(this._onMouseOver, this));
                $ttsPlayContainer.on('mouseout', $.proxy(this._onMouseOut, this));
                $ttsPlayContainer.on('mousedown', $.proxy(this._onPauseMouseDown, this));
                $ttsPlayContainer.on('mouseup', $.proxy(this._onPauseMouseup, this));
                $ttsPlayContainer.on('focusOnCompletion', $.proxy(this._focusOnSpeechComplete, this));
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch($ttsPlayContainer);
            }

            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($ttsContainer);
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($ttsPauseContainer);


            //}
            //else {
            //    $ttsContainer.on('touchstart', $.proxy(this._ttsTouchStartEvent, this));
            //    $ttsPauseContainer.on('touchstart', $.proxy(this._pauseTouchStartEvent, this));

            //    $ttsContainer.on('touchend', $.proxy(this._removeTooltip, this));
            //    $ttsPauseContainer.on('touchend', $.proxy(this._removeTooltip, this));

            //    if (this.themeType === 2) {
            //        $ttsPlayContainer = this.$ttsPlayContainer;
            //        $ttsPlayContainer.on('touchstart', $.proxy(this._pauseTouchStartEvent, this));
            //        $ttsPlayContainer.on('touchend', $.proxy(this._removeTooltip, this));
            //        $ttsPlayContainer.on('focusOnCompletion', $.proxy(this._focusOnSpeechComplete, this));
            //    }
            //    //$btn.on('click', $.proxy(this._onMouseup, this));
            //}
            if (this.themeType !== 2) {
                $ttsPauseContainer.on('click', $.proxy(this._onClick, this));
                $ttsContainer.on('click', $.proxy(this._onClick, this));
            }
            else {
                $ttsPauseContainer.on('click', $.proxy(this._onClickThemeType2, this));
                $ttsContainer.on('click', $.proxy(this._onClickThemeType2, this));
                $ttsPlayContainer.on('click', $.proxy(this._onClickThemeType2, this));
            }
        },


        /**
        * Enables or disables TTS button.
        * This function is implemented for theme-2 tts only
        *
        * @method disableTTS
        * @public
        **/
        disableTTS: function disableTTS(isDisabled) {// currently this function is only implemented for theme 2 tts
            var buttonState;
            if (isDisabled) {
                buttonState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            } else {
                buttonState = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE;
            }
            this.model.set('isDisabled', isDisabled);
            this.ttsPlayView.setButtonState(buttonState);
            this.ttsPauseView.setButtonState(buttonState);
            this.ttsSoundView.setButtonState(buttonState);
        },

        /**
        * Attaches the tooltip
        *
        * @method _attachTooltip
        * @private
        **/
        _attachTooltip: function _attachTooltip() {
            this.loadScreen('tts-button-component');
            var $tts = this.$container;
            this.tooltip = new MathInteractives.Common.Components.Models.Tooltip({
                id: this.model.get('containerId') + '-tooltip',
                text: this.getMessage('tts-tooltip-play', 0),
                elementOffsetPosition: $tts.offset(),
                elementDimensions: { width: $tts.width(), height: $tts.height() },
                path: this.path,
                player: this.model.get('player')
            });
            this.ttsTooltipView = new MathInteractives.Common.Components.Views.Tooltip({ model: this.tooltip })
            MathInteractives.global.PlayerTTS.ttsView = this;
            MathInteractives.global.PlayerTTS.ttsView.tooltipView = this.ttsTooltipView;

        },
        /**
        * Attaches the tooltip
        *
        * @method _attachTooltip
        * @param event {Object} event object
        * @private
        **/
        _focusOnSpeechComplete: function (event) {
            var unPrefixedTTS_PlayId = MathInteractives.global.SpeechStream.currentTTSId.split(this.idPrefix)[1],
                ttsView = MathInteractives.global.PlayerTTS.ttsView,
                ttsViewFocusOnComplete = ttsView.model.getFocusStatusOnComplete();

            if ($('#' + MathInteractives.global.SpeechStream.currentTTSId).is(':visible') === true && ttsViewFocusOnComplete === true) {
                var checkPauseBtnAcc = $(this.$ttsPauseContainer).find('.acc-read-elem');
                if ((typeof (checkPauseBtnAcc) !== undefined) && (document.activeElement.id === checkPauseBtnAcc.attr('id'))) {
                    this.setFocus(unPrefixedTTS_PlayId, 1);
                }
            }

            this.setFocus(this.$ttsContainer.attr('id').split(this.idPrefix)[1]);

            if (this.themeType === 2) {
                this.$ttsPauseContainer.hide();
                this.$ttsPauseContainer.trigger('mouseout');
                this.$ttsPlayContainer.hide();
                this.$ttsContainer.show();
            }
        },


        /**
        * Adds hover effect 
        *
        * @method _onMouseOver
        * @param event {Object} event object
        * @private
        **/
        _onMouseOver: function _onMouseOver(event) {

            if (this.model.get('isDisabled') !== true) {

                var $currentTarget = $(event.currentTarget);
                $currentTarget.addClass('hover');

                if (this.themeType !== 2) {
                    this.tooltip.set('elementOffsetPosition', this.$container.offset());
                    this.ttsTooltipView.showTooltip();
                }
            }
            //MathInteractives.global.PlayerTTS.ttsView.tooltipView = this.ttsTooltipView;
        },

        /**
        * Removes hover effect 
        *
        * @method _onMouseOut
        * @param event {Object} event object
        * @private
        **/
        _onMouseOut: function _onMouseOut(event) {
            $(event.currentTarget).removeClass('hover');

            if (this.themeType !== 2) {
                this.ttsTooltipView.hideTooltip();
            }
        },

        /**
        * Adds selected state to play tts button
        *
        * @method _onttsMouseDown
        * @param event {Object} event object
        * @private
        **/
        _onttsMouseDown: function _onttsMouseDown(event) {
            //$(document).on({
            //    'mouseup': $.proxy(this._onttsMouseup, this),
            //    'touchend': $.proxy(this._onttsMouseup, this)
            //});

            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile && event.which !== 1) {
                return;
            }
            if (this.model.get('isDisabled') === true) return;
            this.$ttsContainer.addClass('down');

            if (this.ttsTooltipView && MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                if (this.themeType !== 2) {
                    this.tooltip.set('elementOffsetPosition', this.$container.offset());
                    this.ttsTooltipView.showTooltip();
                    MathInteractives.global.PlayerTTS.ttsView.tooltipView = this.ttsTooltipView;
                }
            }
        },

        /**
        * Adds selected state to pause tts button
        *
        * @method _onPauseMouseDown
        * @param event {Object} event object
        * @private
        **/
        _onPauseMouseDown: function _onPauseMouseDown(event) {

            //$(document).on({
            //    'mouseup': $.proxy(this._onPauseMouseup, this),
            //    'touchend': $.proxy(this._onPauseMouseup, this)
            //});

            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile && event.which !== 1) {
                return;
            }
            if (this.model.get('isDisabled') === true) return;
            this.$ttsPauseContainer.addClass('down');

            if (this.ttsTooltipView && MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                if (this.themeType !== 2) {
                    this.tooltip.set('elementOffsetPosition', this.$container.offset());
                    this.ttsTooltipView.showTooltip();
                    MathInteractives.global.PlayerTTS.ttsView.tooltipView = this.ttsTooltipView;
                }
            }
        },


        /**
        * Removes selected state of play tts button
        *
        * @method _onttsMouseup
        * @param event {Object} event object
        * @private
        **/
        _onttsMouseup: function _onttsMouseup(event) {
            if (this._touchStartTimer !== null) {
                window.clearTimeout(this._touchStartTimer);
            }

            //$(document).off({
            //    'mouseup': $.proxy(this._onttsMouseup, this),
            //    'touchend': $.proxy(this._onttsMouseup, this)
            //});
            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile && event.which !== 1) {
                return;
            }

            this.$ttsContainer.removeClass('down');

        },

        /**
        * Removes selected state of pause tts button
        *
        * @method _onPauseMouseup
        * @param event {Object} event object
        * @private
        **/
        _onPauseMouseup: function _onPauseMouseup(event) {
            if (this._touchStartTimer !== null) {
                window.clearTimeout(this._touchStartTimer);
            }

            //$(document).off({
            //    'mouseup': $.proxy(this._onPauseMouseup, this),
            //    'touchend': $.proxy(this._onPauseMouseup, this)
            //});
            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile && event.which !== 1) {
                return;
            }

            this.$ttsPauseContainer.removeClass('down');

        },

        /**
        * Hides play tts button and shows pause tts button and vice-versa, and calls functions to read text and pause
        *
        * @method _onClickThemeType2
        * @private
        **/
        _onClickThemeType2: function _onClickThemeType2(event) {
            var ttsIdString,
               currentTtsId = MathInteractives.global.SpeechStream.currentTTSId;
            if (this.model.get('isDisabled') === true) return;
            //event.stopPropagation();
            if (MathInteractives.global.Theme2.PlayerTTS.ttsView !== undefined) {
                if (MathInteractives.global.Theme2.PlayerTTS.ttsView.themeType !== 2) {
                    MathInteractives.global.Theme2.PlayerTTS.resetTooltipText();
                }
            }

            MathInteractives.global.Theme2.PlayerTTS.ttsView = this;
            var currentTargetId = event.currentTarget.id;
            if (MathInteractives.global.AudioManager) {
                //MathInteractives.global.AudioManager.stopAllSounds();
            }

            if (currentTargetId === this.$ttsContainer.attr('id') || currentTargetId === this.$ttsPlayContainer.attr('id')) {
                if (typeof currentTtsId !== 'undefined' && currentTtsId !== event.currentTarget.id) {
                    if (currentTargetId === this.$ttsContainer.attr('id')) {
                        MathInteractives.global.SpeechStream.stopReading();
                        currentTtsId = currentTtsId.replace( 'play', 'sound' );
                        currentTtsId = currentTtsId.replace( 'pause', 'sound' );
                        ttsIdString = currentTtsId.split( '-sound-btn' )[0];
                        //$('#' + ttsIdString + '-pause-btn' + ',' + '#' + ttsIdString + 'play-btn').hide();
                        $( '#' + ttsIdString + '-pause-btn' ).hide();
                        $( '#' + ttsIdString + '-play-btn' ).hide();
                        $( '#' + currentTtsId ).show();
                    }
                    // $('#' + MathInteractives.global.SpeechStream.currentTTSId).css({ 'background-image': 'url("' + this.path.getImagePath('tts-sound-button') + '")' });
                    // MathInteractives.global.Theme2.PlayerTTS.ttsView.tooltipView.changeTooltipText(this.getMessage('tts-tooltip-play', 0));
                }

                else {
                    //this.ttsTooltipView.changeTooltipText(this.getMessage('tts-tooltip-pause', 0));
                }

                if (this.soundImage) {
                    // this.$ttsContainer.css({ 'background-image': 'url("' + this.filePath.getImagePath('tts-play-button') + '")' });
                    //                    this.$ttsPauseContainer.hide();
                    //                    this.$ttsContainer.hide();
                    //                    this.$ttsPlayContainer.show();
                    this.soundImage = false;
                }

                //PlayTTSSpeaker(this.$messagesToPlay);

                MathInteractives.global.Theme2.PlayerTTS.ttsView = this;
                //done to access ttsTooltipView property in the static part
                //MathInteractives.global.PlayerTTS.ttsView.tooltipView = this.ttsTooltipView;
                MathInteractives.global.SpeechStream.playTTSSpeaker(this.$messagesToPlay);

                this.$ttsContainer.hide();
                this.$ttsPlayContainer.hide();
                this.$ttsPauseContainer.show();

                MathInteractives.global.SpeechStream.currentTTSId = event.currentTarget.id;
                this.setFocus(this.$ttsPauseContainer.attr('id').split(this.idPrefix)[1]);
                //this.$ttsPauseContainer.trigger('mouseover');
            }
            else {
                this.$ttsContainer.hide();
                this.$ttsPauseContainer.hide();
                this.$ttsPlayContainer.show();
                //this.$ttsContainer.hide();
                //PauseReading();
                MathInteractives.global.SpeechStream.pauseReading();
                //this.ttsTooltipView.changeTooltipText(this.getMessage('tts-tooltip-play', 0));
                this.setFocus(this.$ttsPlayContainer.attr('id').split(this.idPrefix)[1]);
                //this.$ttsPlayContainer.trigger('mouseover');
            }
        },

        /**
        * Hides play tts button and shows pause tts button and vice-versa, and calls functions to read text and pause
        *
        * @method _onClick
        * @private
        **/
        _onClick: function _onClick(event) {
            if (MathInteractives.global.AudioManager) {
                MathInteractives.global.AudioManager.stopAllSounds()
            }

            if (MathInteractives.global.PlayerTTS.ttsView !== this) {
                if (MathInteractives.global.PlayerTTS.ttsView.themeType === 2) {
                    MathInteractives.global.PlayerTTS.ttsView.$ttsPlayContainer.hide();
                    MathInteractives.global.PlayerTTS.ttsView.$ttsPauseContainer.hide();
                    MathInteractives.global.PlayerTTS.ttsView.$ttsContainer.show();
                }
                else {
                    MathInteractives.global.PlayerTTS.resetTooltipText();
                }
                MathInteractives.global.PlayerTTS.ttsView = this;
                this.setFocus();
            }
            if (event.currentTarget.id === this.$ttsContainer.attr('id')) {
                if (typeof MathInteractives.global.SpeechStream.currentTTSId !== 'undefined' && MathInteractives.global.SpeechStream.currentTTSId !== event.currentTarget.id) {
                    MathInteractives.global.SpeechStream.stopReading();
                    if (this.themeType === 2) {
                        $('#' + MathInteractives.global.SpeechStream.currentTTSId).css({ 'background-image': 'url("' + this.path.getImagePath('tts-sound-button') + '")' });
                        MathInteractives.global.PlayerTTS.ttsView.tooltipView.changeTooltipText(this.getMessage('tts-tooltip-play', 0));
                    }
                }
                else {
                    this.ttsTooltipView.changeTooltipText(this.getMessage('tts-tooltip-pause', 0));
                }

                this.$ttsContainer.hide();
                if (this.soundImage) {
                    var $container = this.$ttsContainer
                    $container.css({ 'background-image': 'url("' + this.path.getImagePath('tts-play-button') + '")' });
                    this.soundImage = false;
                }



                this.$ttsPauseContainer.show();
                //PlayTTSSpeaker(this.$messagesToPlay);

                MathInteractives.global.PlayerTTS.ttsView = this;
                //done to access ttsTooltipView property in the static part
                //MathInteractives.global.PlayerTTS.ttsView.tooltipView = this.ttsTooltipView;
                MathInteractives.global.SpeechStream.playTTSSpeaker(this.$messagesToPlay);


                MathInteractives.global.SpeechStream.currentTTSId = event.currentTarget.id;
                this.setFocus(this.$ttsPauseContainer.attr('id').split(this.idPrefix)[1]);
                //this.$ttsPauseContainer.trigger('mouseover');
            }
            else {

                this.$ttsContainer.show();
                this.$ttsPauseContainer.hide();
                //PauseReading();
                MathInteractives.global.SpeechStream.pauseReading();
                this.ttsTooltipView.changeTooltipText(this.getMessage('tts-tooltip-play', 0));
                this.setFocus(this.$ttsContainer.attr('id').split(this.idPrefix)[1]);
                //this.$ttsContainer.trigger('mouseover');
            }

        },

        /**
        * Binds touchstart event on play tts button for touch devices
        *
        * @method _ttsTouchStartEvent
        * @private
        **/
        _ttsTouchStartEvent: function _ttsTouchStartEvent(event) {
            var thisRef = this;
            this.$ttsContainer.one('touchmove', function (event) {
                event.preventDefault(); //fix for android. if we dont do event.preventDefault() mouse up doesnt fire in android
                if (thisRef._touchStartTimer !== null) {
                    window.clearTimeout(thisRef._touchStartTimer);
                }
            });
            this._touchStartTimer = window.setTimeout(function (event) {
                thisRef._onttsMouseDown(event);
                thisRef._touchStartTimer = null;
            }, 200);
        },

        /**
        * Binds touchstart event on pause tts button for touch devices
        *
        * @method _pauseTouchStartEvent
        * @private
        **/
        _pauseTouchStartEvent: function _pauseTouchStartEvent(event) {
            var thisRef = this;
            //            console.log('_pauseTouchStartEvent');
            this.$ttsPauseContainer.one('touchmove', function (event) {
                event.preventDefault(); //fix for android. if we dont do event.preventDefault() mouse up doesnt fire in android
                if (thisRef._touchStartTimer !== null) {
                    window.clearTimeout(thisRef._touchStartTimer);
                }
            });
            this._touchStartTimer = window.setTimeout(function (event) {
                thisRef._onPauseMouseDown(event);
                thisRef._touchStartTimer = null;
            }, 200);
        },

        /**
        * Removes the tooltip
        *
        * @method _removeTooltip
        * @private
        **/
        _removeTooltip: function _removeTooltip() {
            if (this.ttsTooltipView) {//alert('_removeTooltip')
                if (this._touchStartTimer !== null) {
                    window.clearTimeout(this._touchStartTimer);
                }
                this.ttsTooltipView.hideTooltip();
            }
        }



    }, {

        /**
        * static tts tooltip view
        * 
        * @property tooltipView
        * @type Object
        * @defaults null
        */
        tooltipView: null,

        /*
        * to generate tts as per the given requirement
        * @method generateTTS
        * @param {object} ttsProps
        */
        generateTTS: function (ttsProps) {
            var containerId;
            if (ttsProps) {
                containerId = '#' + ttsProps.containerId;

                if (ttsProps.tooltipColorType === null || typeof ttsProps.tooltipColorType === 'undefined') {
                    if (MathInteractives.Common.Components.Theme2.Views && MathInteractives.Common.Components.Theme2.Views.Tooltip) {
                        ttsProps.tooltipColorType = MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL
                    }
                }
                var ttsModel = new MathInteractives.Common.Player.Models.TTS(ttsProps);
                var ttsView = new MathInteractives.Common.Player.Views.TTS({ el: containerId, model: ttsModel });

                return ttsView;
            }
        },




        /*
        * to change tooltip text after completion of text reading
        * @method resetTooltipText
        */
        resetTooltipText: function () {

            MathInteractives.global.PlayerTTS.ttsView.$el.find('.pause-tts-container').hide();
            MathInteractives.global.PlayerTTS.ttsView.$el.find('.tts-container').show();
            MathInteractives.global.PlayerTTS.ttsView.$el.find('.sound-tts-container').show();
            if (MathInteractives.global.PlayerTTS.ttsView.$el.find('.sound-tts-container').length > 0) {
                MathInteractives.global.PlayerTTS.ttsView.$el.find('.play-tts-container').hide();
            }

            if (!MathInteractives.global.PlayerTTS.ttsView.soundImage) {
                if (MathInteractives.global.PlayerTTS.ttsView.$el.find('.sound-tts-container').length === 0) {
                    MathInteractives.global.PlayerTTS.ttsView.$ttsContainer.css({ 'background-image': 'url("' + MathInteractives.global.PlayerTTS.ttsView.path.getImagePath('tts-sound-button') + '")' });
                    MathInteractives.global.PlayerTTS.ttsView.soundImage = true;
                }
            }

            if (MathInteractives.global.PlayerTTS.ttsView.tooltipView) {
                MathInteractives.global.PlayerTTS.ttsView.tooltipView.changeTooltipText(MathInteractives.global.PlayerTTS.ttsView.getMessage('tts-tooltip-play', 0));
            }
        }


    });

    MathInteractives.global.PlayerTTS = MathInteractives.Common.Player.Views.TTS;
    MathInteractives.global.Theme2.PlayerTTS = MathInteractives.Common.Player.Views.TTS;
})();