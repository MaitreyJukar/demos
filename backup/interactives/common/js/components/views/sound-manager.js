(function () {
    'use strict';

    MathInteractives.Common.Components.Views.AudioManager = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Jquery Audio Tag for current instance
        * @property $audio
        * @type Object
        */
        $audio: null,

        /**
        * Stores a boolean whether the audio is being loaded
        * @property isLoading
        * @type Boolean
        * @default false
        */
        isLoading: false,

        /*
        * Stores a boolean whether sound has been muted.
        * @property isMuted
        * @default false
        * @type Boolean
        */
        isMuted: false,

        /**
        * Stores count of how many times audio load has been performed
        * @property loadingCount
        * @type Number
        * @default 0
        */
        loadingCount: 0,

        /**
        * Stores count of how many times audio load should be performed
        * @property maxLoadingTries
        * @type Number
        * @default 3
        */
        maxLoadingTries: 3,

        /**
        * IdPrefix of current instance
        * @property idPrefix
        * @type String
        */
        idPrefix: null,

        /**
        * Audio sprite id of current instance
        * @property audioSpriteId
        * @type String
        */
        audioSpriteId: null,

        /**
        * Stores whether activity has been loaded with or without sound
        * @property loadWithSound
        * @type Boolean
        * @default false
        */
        loadWithSound: true,

        /**
        * Stores whether the popup is displayed on the screen or not
        * @property popupShown
        * @type Boolean
        * @default false
        */
        popupShown: false,

        /**
        * Audio Manager View constructor
        *
        * @method initialize
        */
        initialize: function () {
            var self = this;
            self.initializeDefaultProperties();
            this.model.set('idPrefix', self.idPrefix);
            //self.manager = this.model.getManager();
            self.loadScreen('audio-manager-button');
            if (self.model.get('audioSpriteId').length === 0) {
                self.audioSpriteId = self.idPrefix;
            }
            else {
                self.audioSpriteId = self.model.get('audioSpriteId')[0];
            }
            self.render();
            self.model.on('change:bufferValue', function () {
                self._bufferMonitor();
            });
            self._bindHeaderMuteEvents();
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                self.maxLoadingTries = 1;
            }
        },

        /**
        * Check Buffer progress to show/hide preloader
        *
        * @method _bufferMonitor
        */
        _bufferMonitor: function () {
            var isSoundLoaded = this.isSoundLoaded();
            if (isSoundLoaded === false) {
                this._displayPreload(true);
            }
            else {
                this._displayPreload(false);
                this.model.off('change:bufferValue');
            }
        },


        /**
        * Show / Hide audio preloader.
        *
        * @method _displayPreload
        * @param {Boolean}  Boolean to specify display status of preloader
        */
        _displayPreload: function (isDisplayed) {
            var player = this.model.get('player'),
                self = this,
                showModal = this.model.get('displayPreloader');
            if (isDisplayed === true) {
                if (!this.isLoading) {
                    this._showPreloader();
                    this.isLoading = true;
                    this.trigger(MathInteractives.Common.Components.Views.AudioManager.AUDIO_EVENT.LOAD_START);
                }

            }
            else {
                this._hidePreloader();
                this.isLoading = false;
                this.trigger(MathInteractives.Common.Components.Views.AudioManager.AUDIO_EVENT.LOAD_COMPLETE);

            }
        },

        /**
        * Shows audio preloader.
        *
        * @method _showPreloader
        */
        _showPreloader: function () {
            var player = this.model.get('player'),
                showModal = this.model.get('displayPreloader');

            if (showModal) {
                if (player.$el.find('.audio-mgr-modal').length === 0) {
                    var preloadModal = $('<div/>', { class: "audio-mgr-modal" }).css({ position: "absolute", top: "0px", left: '0px', width: player.$el.width(), height: player.$el.height(), 'z-index': 980, opacity: 0.56, 'background-color': '#000' });
                    var preloader = $('<div/>', { class: "audio-mgr-preloder" }).css({ position: "absolute", top: "0", left: '0', width: "100%", height: "100%", "background": 'url("' + this.model.getPreloaderImgPath() + '") 50% 50% no-repeat' });
                    preloadModal.append(preloader);
                    player.$el.append(preloadModal);
                    player.setModalPresent(true);
                }
            }

        },

        /**
        * Hides audio preloader.
        *
        * @method _hidePreloader
        */
        _hidePreloader: function () {
            var player = this.model.get('player'),
                showModal = this.model.get('displayPreloader');

            if (player.$el.find('.audio-mgr-modal').length !== 0) {
                player.setModalPresent(false);
                player.$el.find('.audio-mgr-modal').remove();
            }

        },

        /**
        * Sets a timer to reload the audio element if not loaded within the given time.
        *
        * @method _bindReloadAudio
        */
        _bindReloadAudio: function () {
            var triggerTimer = this.model.get('initialLoadTime'),
                self = this;
            this.audioLoadTimer = setTimeout($.proxy(self._reloadAudio, self), triggerTimer);
        },

        /**
       * Reloads the audio element if not loaded within the given time.
       *
       * @method _reloadAudio
       */
        _reloadAudio: function () {
            this.loadingCount++;
            var self = this;
            var player = this.model.get('player');
            if (this.isSoundLoading() === false) {
                if (this.loadingCount < this.maxLoadingTries) {
                    clearInterval(this.afterReadyStateTimer);
                    this.render();
                    this.load();
                    this.$('.audio-mgr-modal').remove();
                    this.isLoading = false;
                    this._bindReloadAudio();
                    /*
                    to do Display pop-up to try reloading sound
                    var loadModal = $('<div/>', { class: "audio-load-modal" }).css({ position: "absolute", top: "0px", left: '0px', width: player.$el.width(), height: player.$el.height(), 'z-index': 980, opacity: 0.56, 'background-color': 'rgba(255,0,0,.45)' });
                    player.$el.append(loadModal);
                    loadModal.off('click.load-modal').on('click.load-modal', function () {
                        loadModal.remove();
                        self._bindReloadAudio();
                    });
                    */

                }
                else {
                    if (this.model.get('isMandatory')) {
                        clearInterval(this.afterReadyStateTimer);
                        this.$('.audio-mgr-modal').remove();
                        this.isLoading = false;
                        player.setModalPresent(false);
                        this._generateNoSoundPopup();
                        //this.trigger(MathInteractives.Common.Components.Views.AudioManager.AUDIO_EVENT.LOAD_COMPLETE);
                    }
                    else {
                        clearInterval(this.afterReadyStateTimer);
                        player.setModalPresent(false);
                        player.$el.find('.audio-mgr-modal').remove();
                        this.isLoading = false;
                        this.loadWithSound = false;
                        this.trigger(MathInteractives.Common.Components.Views.AudioManager.AUDIO_EVENT.LOAD_COMPLETE);
                    }
                }
            }
        },


        /**
        * Bind progress and timeupdate events on audio.
        *
        * @method _bindAudioEvents
        */
        _bindAudioEvents: function () {
            var self = this;
            this.$audio.off('progress').on('progress', function () {
                self.model.set('bufferValue', self.$audio[0].buffered.end(0));
            });
            this.$audio.on('timeupdate', function () {
                self._timeUpdateCheck();
                self.model.set('currentTime', self.$audio[0].currentTime);
            });
        },


        /**
        * Binds mute and unmute events on audio.
        *
        * @method _bindHeaderMuteEvents
        */
        _bindHeaderMuteEvents: function () {
            var self = this,
                player = this.model.get('player');
            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isIOS) {
                this.listenTo(player, MathInteractives.Common.Player.Views.Player.Events.MUTE_CLICKED, this.onMuteClick);
                this.listenTo(player, MathInteractives.Common.Player.Views.Player.Events.UNMUTE_CLICKED, this.onUnmuteClick);
            }
        },
        /**
        * Mutes the audio on click of header mute button.
        *
        * @method onMuteClick
        */
        onMuteClick: function () {
            this.isMuted = true;
            this.$audio[0].muted = true;
        },
        /**
        * Unmutes the audio on click of header unmute button
        *
        * @method onUnmuteClick
        */
        onUnmuteClick: function () {
            this.isMuted = false;
            this.$audio[0].muted = false;
        },

        /**
        * Create audio tag and append to body.
        *
        * @method render
        */
        render: function () {
            var audioId = this.idPrefix + 'audio',
                audioSrc = this.model.getGlobalAudioData(this.audioSpriteId).pathToSrc;
            if ($('#' + audioId).length !== 0) {
                $('#' + audioId).remove();
            }
            $('body').append('<audio id=' + audioId + '></audio>');
            $('#' + audioId).append('<source src=' + audioSrc + '.mp3 type="audio/mpeg"></source>');
            $('#' + audioId).attr('src', audioSrc + '.mp3').attr('type', 'audio/mpeg').attr('codecs', 'mp3');

            this.$audio = $('#' + audioId);
        },


        /**
        * Start loading(buffering) of sound
        *
        * @method  load
        */
        load: function () {
            if (this.loadWithSound) {
                var finish = $.Deferred();
                var self = this;
                this._showPreloader();
                this.$audio[0].muted = true;
                this.$audio[0].play();
                if (this.loadingCount === 0) {
                    this._bindReloadAudio();
                }
                this._afterReadyState(function () {

                    if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIE) {
                        self.$audio[0].muted = true;
                    }
                    else {
                        self.$audio[0].pause();
                    }

                    self._timerMonitor();
                    self._bindAudioEvents();
                    finish.resolve();
                });
                return finish;
            }
            else {
                this.trigger(MathInteractives.Common.Components.Views.AudioManager.AUDIO_EVENT.LOAD_COMPLETE);
            }
        },


        /**
        * Check if sound is completely loaded or not.
        *
        * @method isSoundLoaded
        * return {Boolean}
        */
        isSoundLoaded: function () {
            return (this.model.getBufferValue() / this.model.getDuration() * 100) > 99;
        },


        /**
        * Check if sound has started loading or not.
        *
        * @method isSoundLoading
        * return {Boolean}
        */
        isSoundLoading: function () {
            return this.model.getBufferValue() > 0;
        },

        /**
        * Set audio duration and current audio buffer value.
        *
        * @method _timerMonitor
        */
        _timerMonitor: function () {
            this.model.setDuration(this.$audio[0].duration);
            this.model.setBufferValue(this.$audio[0].buffered.end(0));
        },

        /**
        * Check end of current playing sound and trigger complete event.
        *
        * @method _timeUpdateCheck
        */
        _timeUpdateCheck: function () {
            var currentPlayingAudio = this.model.getCurrentPlayingAudio(),
                endTime = null;
            if (currentPlayingAudio == null) {
                return;
            }
            endTime = parseFloat(this.model.getGlobalAudioData(this.audioSpriteId).audioData[currentPlayingAudio].end);
            if (this.$audio[0].currentTime > endTime) {
                MathInteractives.Common.Components.Views.AudioManager.CURRENT_PLAYED_AUDIO_VIEWS[0].complete();
            }
        },



        /**
        * Check if audio file is ready to play.
        *
        * @method _afterReadyState
        */
        _afterReadyState: function (callback) {
            var self = this;
            this.afterReadyStateTimer = setInterval(function () {
                if (self.$audio[0].readyState > 1) {
                    if (typeof (callback) !== 'undefined') {
                        clearInterval(self.afterReadyStateTimer);
                        callback();
                    }
                }
            });
        },

        /**
        * Stops the sound playing
        * @method stopSound
        */
        stopSound: function () {
            this.$audio[0].pause()
        },

        /**
        * Plays the sound mentioned
        *
        * @method play
        * @param soundId {String} id of sound from json file which supposed to be played
        * @public
        */
        play: function (soundId) {
            var startTime = null,
                audioManagerView = MathInteractives.Common.Components.Views.AudioManager,
                self = this;

            MathInteractives.global.SpeechStream.stopReading();
            MathInteractives.Common.Components.Views.AudioManager.stopAllSounds();
            if (this.loadWithSound) {
                if (this.isSoundLoaded() === false) {
                    this.load();
                }

                var _playAfterAudioLoad = function () {
                    var audioObj = self.$audio[0],
                    startTime = parseFloat(self.model.getGlobalAudioData(self.audioSpriteId).audioData[soundId].start);
                    //$(audioObj).off('canplay.sound-manager-common').on('canplay.sound-manager-common', function () {
                    //    this.currentTime = startTime;
                    //    this.muted = self.isMuted,
                    //    this.play();
                    //    self.model.setCurrentPlayingAudio(soundId);
                    //    MathInteractives.Common.Components.Views.AudioManager.CURRENT_PLAYED_AUDIO_VIEWS.push(self);
                    //    self.trigger(audioManagerView.AUDIO_EVENT.PLAY);
                    //});
                    audioObj.currentTime = startTime,
                    audioObj.muted = self.isMuted,
                    audioObj.play();
                    self.model.setCurrentPlayingAudio(soundId);
                    MathInteractives.Common.Components.Views.AudioManager.CURRENT_PLAYED_AUDIO_VIEWS.push(self);
                    self.trigger(audioManagerView.AUDIO_EVENT.PLAY);
                }

                var _checkForPreloadComplete = function () {
                    if (self.isSoundLoaded() === false) {
                        setTimeout(_checkForPreloadComplete, 10);
                        return;
                    }
                    _playAfterAudioLoad();
                    clearTimeout(_checkForPreloadComplete);
                }
                _checkForPreloadComplete();
            }
            else {
                self.trigger(audioManagerView.AUDIO_EVENT.PLAY);
                self.trigger(audioManagerView.AUDIO_EVENT.COMPLETE);
            }
        },

        /**
        * Pause the currently playing sound
        *
        * @method pause
        * @public
        */
        pause: function () {
            var audioManagerView = MathInteractives.Common.Components.Views.AudioManager;
            if (this.loadWithSound) {
                $audioObj[0].pause();
            }
            if (typeof audioManagerView.AUDIO_EVENT.PAUSE !== 'undefined') {
                this.trigger(audioManagerView.AUDIO_EVENT.PAUSE);
            }
        },

        /**
        * Resumes the paused sound
        *
        * @method resume
        * @public
        */
        resume: function () {
            var audioManagerView = MathInteractives.Common.Components.Views.AudioManager;
            if (this.loadWithSound) {
                $audioObj[0].currentTime = this.model.get('currentTime');
                $audioObj[0].play();
            }
            if (typeof audioManagerView.AUDIO_EVENT.RESUME !== 'undefined') {
                this.trigger(audioManagerView.AUDIO_EVENT.RESUME);
            }
        },

        /**
        * Stop playing sound when reached to end time
        *
        * @method complete
        * @public
        */
        complete: function () {
            var audioManagerView = MathInteractives.Common.Components.Views.AudioManager;
            if (this.loadWithSound) {
                this.$audio[0].pause();
                this.model.setCurrentPlayingAudio(null);
                this.removeAudioViewFromArray();
            }
            if (typeof audioManagerView.AUDIO_EVENT.COMPLETE !== 'undefined') {
                this.trigger(audioManagerView.AUDIO_EVENT.COMPLETE);
            }
        },

        /**
        * Stops playing sound
        *
        * @method stop
        * @public
        */
        stop: function () {
            var audioManagerView = MathInteractives.Common.Components.Views.AudioManager;
            if (this.loadWithSound) {
                this.$audio[0].pause();
                this.model.setCurrentPlayingAudio(null);
                this.removeAudioViewFromArray();
            }
            if (typeof audioManagerView.AUDIO_EVENT.STOP !== 'undefined') {
                this.trigger(audioManagerView.AUDIO_EVENT.STOP);
            }
        },

        removeAudioViewFromArray: function () {
            var counter = 0,
                allAudioViews = MathInteractives.Common.Components.Views.AudioManager.CURRENT_PLAYED_AUDIO_VIEWS,
                length = allAudioViews.length;
            for (; counter < length; counter++) {
                if (allAudioViews[counter].idPrefix === this.idPrefix) {
                    allAudioViews.splice(counter, 1);
                    break;
                }
            }
        },
        /**
        * Generates a popup if sound fails to load
        *
        * @method _generateNoSoundPopup
        */
        _generateNoSoundPopup: function () {
            if (!this.popupShown) {
                this.popupShown = true;
                this.unloadScreen('sound-manager-popup-screen');
                this.loadScreen('sound-manager-popup-screen');
                if (MathInteractives.global.PlayerPopup) {
                    var options = {
                        text: this.getMessage('sound-manager-popup-text', 0),
                        buttons: [{
                            id: 'pop-up-retry-button',
                            text: this.getMessage('sound-manager-popup-text', 2),
                            response: { isPositive: true, buttonClicked: 'yes-button' }
                        }],
                        closeCallback: { fnc: this._popupCallback, scope: this },
                        title: this.getMessage('sound-manager-popup-text', 1),
                        manager: this.manager,
                        player: this.player,
                        path: this.filePath
                    };
                    this.soundManagerPopup = MathInteractives.global.PlayerPopup.createPopup(options);
                }
                else {
                    this.soundManagerPopup = MathInteractives.global.Theme2.PopUpBox.createPopup({
                        text: this.getMessage('sound-manager-popup-text', 0),
                        manager: this.manager,
                        player: this.player,
                        path: this.filePath,
                        idPrefix: this.idPrefix,
                        title: this.getMessage('sound-manager-popup-text', 1),
                        buttons: [{
                            id: 'pop-up-retry-button',
                            text: this.getMessage('sound-manager-popup-text', 2),
                            clickCallBack: {
                                fnc: this._popupCallback,
                                scope: this
                            }
                        }]
                    });
                }
            }
        },
        /**
        * Tries to reload audio if sound isn't loaded
        *
        * @method _generateNoSoundPopup
        */
        _popupCallback: function () {
            this.popupShown = false;
            this.loadingCount = 0;
            this.render();
            this.load();
            this._bindReloadAudio();
        }

    }, {
        /***** Static values and functions *******/
        AudioButton: MathInteractives.Common.Player.Views.Base.extend({
            containerId: null,
            playBtnOption: {},
            pauseBtnOption: {},
            resumeBtnOption: {},
            audioManagerView: null,
            soundId: "",
            model: null,
            idPrefix: null,
            filePath: null,
            tooltipView: null,

            /**
            * Audio Button View constructor.
            *
            * @method initialize
            */
            initialize: function () {
                var self = this;

                self._initData(this.options); // options is passed to View on initialize.
                self._generateButtons();
                self.$el.off('click.audio-mgr').on('click.audio-mgr', function () { self._clickListener(); });

                var unPrefixedId = this.$el.attr('id').split(this.idPrefix)[1];

                self._createHackScreenForAudioBtn(unPrefixedId);

                self.focusIn(unPrefixedId, function () { self.tooltipView.showTooltip(); });
                self.focusOut(unPrefixedId, function () { self.tooltipView.hideTooltip(); });
                self.$el.on('mouseover', function () { self.tooltipView.showTooltip(); });
                self.$el.on('mouseout', function () { self.tooltipView.hideTooltip(); });
            },


            /**
            * Set View data.
            containerId: null,
            playBtnOption: {},
            pauseBtnOption: {},
            resumeBtnOption: {},
            audioManagerView: null,
            soundId: "",
            model: null,
            idPrefix: null,

            /**
            * Audio Button View constructor.
            *
            * @method _initData
            * @param {object} [options] Data passed to Audio Manager view
            */
            _initData: function (options) {
                var $btnHolder = $('<div/>', { id: options.containerId + "-holder", role: 'button' }).css('position', 'absolute');
                $('#' + options.containerId).append($btnHolder);
                this.containerId = options.containerId,
                this.$el = $btnHolder,
                this._setButtonOptions(options),
                this.audioManagerView = options.audioManagerView,
                this.soundId = options.soundId,
                this.tabIndex = options.tabIndex,
                this.model = this.audioManagerView.model,
                this.manager = this.model.getManager();
                this.idPrefix = this.model.getIdPrefix();
                this.filePath = this.model.getFilePath();

            },

            /**
            * Set Button options according to button type.
            *
            * @method _setButtonOptions
            * @param {object} [options] Data passed to Audio Manager view
            */
            _setButtonOptions: function (options) {
                var _AUDIO_BTN = MathInteractives.Common.Components.Views.AudioManager.AudioButton;
                if (options.type !== _AUDIO_BTN.TYPE.CUSTOM) {
                    this.playBtnOption = _AUDIO_BTN.DEFAULT_BUTTON_OPTIONS.PLAY_BUTTON_OPTIONS,
                    this.pauseBtnOption = _AUDIO_BTN.DEFAULT_BUTTON_OPTIONS.PAUSE_BUTTON_OPTIONS,
                    this.resumeBtnOption = _AUDIO_BTN.DEFAULT_BUTTON_OPTIONS.RESUME_BUTTON_OPTIONS;
                }
                else {
                    this.playBtnOption = options.playBtnOption,
                    this.pauseBtnOption = options.pauseBtnOption,
                    this.resumeBtnOption = options.resumeBtnOption;
                }
            },

            /**
            * Load Audio Button Scren Dynamically.
            *
            * @method _createHackScreenForAudioBtn
            * @private
            */
            _createHackScreenForAudioBtn: function (unPrefixedId) {
                this.audioBtnHack_Prop = {
                    elementId: unPrefixedId,
                    tabIndex: this.tabIndex,
                    acc: this.getAccMessage('audio-button', 'play')
                };
                this.createAccDiv(this.audioBtnHack_Prop);

            },


            /**
            * Generate Play. Pause and Resume buttons.
            *
            * @method _generateButtons
            */
            _generateButtons: function () {
                var _player = this.audioManagerView.model.get('player'),
                    _audio_btn_state = MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE;
                this.$el.addClass('sound-btn-holder');
                this.playBtnOption.id = this.containerId + "-play-btn",
                this.pauseBtnOption.id = this.containerId + "-pause-btn",
                this.resumeBtnOption.id = this.containerId + "-resume-btn",

                this.playBtnOption.player = _player,
                this.pauseBtnOption.player = _player,
                this.resumeBtnOption.player = _player,
                this.playBtnOption.path = this.filePath,
                this.pauseBtnOption.path = this.filePath,
                this.resumeBtnOption.path = this.filePath,

                this.playBtnOption.baseClass = this.playBtnOption.baseClass || "",
                this.pauseBtnOption.baseClass = this.pauseBtnOption.baseClass || "",
                this.resumeBtnOption.baseClass = this.resumeBtnOption.baseClass || "";

                $("<div/>", { id: this.playBtnOption.id, class: "sound-mgr-audio-btns" + " " + this.playBtnOption.baseClass }).appendTo(this.$el);
                $("<div/>", { id: this.pauseBtnOption.id, class: "sound-mgr-audio-btns" + " " + this.pauseBtnOption.baseClass }).appendTo(this.$el);
                $("<div/>", { id: this.resumeBtnOption.id, class: "sound-mgr-audio-btns" + " " + this.resumeBtnOption.baseClass }).appendTo(this.$el);
                this.playBtnView = MathInteractives.global.Button.generateButton(this.playBtnOption);
                this.pauseBtnView = MathInteractives.global.Button.generateButton(this.pauseBtnOption);
                this.resumeBtnView = MathInteractives.global.Button.generateButton(this.resumeBtnOption);
                this._attachTooltip();
                this.showButton(MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PLAY);

            },

            /**
            * Adds hover effect
            *
            * @method _onMouseOver
            * @private
            **/
            _attachTooltip: function _attachTooltip() {
                this.loadScreen('tts-button-component');
                var $tts = this.$el,
                    self = this;
                this.tooltip = new MathInteractives.Common.Components.Models.Tooltip({
                    id: self.$el.prop('id') + '-tooltip',
                    text: self.getMessage('tts-tooltip-play', 0),
                    elementOffsetPosition: $tts.offset(),
                    elementDimensions: { width: $tts.width(), height: $tts.height() },
                    path: self.model.get('filePath'),
                    player: self.model.get('player')
                });
                this.tooltipView = new MathInteractives.Common.Components.Views.Tooltip({ model: this.tooltip })

            },
            /**
            * Enable/ Disable Audio button.
            *
            * @method disable
            * @param {Boolean} Boolean to Enable or Disable Audio button
            */
            disable: function (isDisabled) {
                if (isDisabled === true) {
                    this.$el.addClass(MathInteractives.Common.Components.Views.AudioManager.AudioButton.DISABLED);
                    this.currentDisplayedBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
                }
                else {
                    this.$el.removeClass(MathInteractives.Common.Components.Views.AudioManager.AudioButton.DISABLED);
                    this.currentDisplayedBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_ACTIVE);
                }
            },


            /**
            * Show play/pause or resume button corresponding to current button state.
            * Update tooltip text of Audio Button.
            *
            * @method showButton
            * @param {String} Current button state
            */
            showButton: function (btnState) {
                this.$('.sound-mgr-audio-btns').hide();
                switch (btnState) {
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PLAY:
                        this.playBtnView.$el.show();
                        this.currentDisplayedBtn = this.playBtnView;
                        break;
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PAUSE:
                        this.pauseBtnView.$el.show();
                        this.currentDisplayedBtn = this.pauseBtnView;
                        break;
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.RESUME:
                        this.resumeBtnView.$el.show();
                        this.currentDisplayedBtn = this.resumeBtnView;
                        break;
                }
                this.$el.css({ width: this.currentDisplayedBtn.$el.width(), height: this.currentDisplayedBtn.$el.height() });
                this.$el.data('visible-btn-state', btnState);
                this.setAccMessage(btnState);

            },

            /**
            * Set Accessibility text of Audio button.
            *
            * @method setAccMessage
            */
            setAccMessage: function (btnState) {
                switch (btnState) {
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PLAY:
                        this.setAccMessage(this.el.id, this.getAccMessage('audio-button', 'play'));
                        break;
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PAUSE:
                        this.setAccMessage(this.el.id, this.getAccMessage('audio-button', 'pause'));
                        break;
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.RESUME:
                        this.setAccMessage(this.el.id, this.getAccMessage('audio-button', 'resume'));
                        break;
                        break;
                }
            },

            /**
            * Get Tooltip text for various Audio buttton states.
            *
            * @method _getToolTipMessage
            * @param  {String} Button state currently displayed
            * return {String} Tooltip text
            */
            _getToolTipMessage: function (btnState) {
                switch (btnState) {
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PLAY:
                        {
                            return this.getAccMessage('audio-button', 'play');
                        }
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PAUSE:
                        {
                            return this.getAccMessage('audio-button', 'pause');
                        }
                    case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.RESUME:
                        {
                            return this.getAccMessage('audio-button', 'play');
                        }
                }
            },

            /**
            * Listener to click event on Audio button.
            * Plays/Pause or Resume audio depending
            * @method _clickListener
            */
            _clickListener: function () {
                var $el = this.$el;
                if ($el.hasClass(MathInteractives.Common.Components.Views.AudioManager.AudioButton.DISABLED) === false) {
                    switch ($el.data('visible-btn-state')) {
                        case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PLAY:
                            this._play();
                            break;
                        case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.PAUSE:
                            this._pause();
                            break;
                        case MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE.RESUME:
                            this._resume();
                            break;
                    }

                }
            },

            /**
            * Pause audio on Audio button click and triggers pause event.
            *
            * @method _resume
            */
            _pause: function () {
                var _audio_btn_state = MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_STATE;
                this.audioManagerView.$audio[0].pause();
                this.showButton(_audio_btn_state.RESUME);
                this.tooltipView.changeTooltipText(this._getToolTipMessage(_audio_btn_state.RESUME));
                this.trigger(MathInteractives.Common.Components.Views.AudioManager.AudioButton.AUDIO_EVENT.PAUSE);
            },

            /**
            * Resume playing audio on Audio button click and triggers resume event.
            * @method _resume
            */
            _resume: function () {
                var _AUDIO_BTN = MathInteractives.Common.Components.Views.AudioManager.AudioButton;
                MathInteractives.global.SpeechStream.stopReading();
                this.showButton(_AUDIO_BTN.AUDIO_STATE.PAUSE);
                this.tooltipView.changeTooltipText(this._getToolTipMessage(_AUDIO_BTN.AUDIO_STATE.PAUSE));
                this.audioManagerView.resume();
                this.trigger(_AUDIO_BTN.AUDIO_EVENT.RESUME);
            },

            /**
            * Play audio on Audio button click and triggers play event.
            *
            * @method _play
            */
            _play: function () {
                MathInteractives.global.SpeechStream.stopReading();
                MathInteractives.Common.Components.Views.AudioManager.stopAllSounds();

                var _AUDIO_BTN = MathInteractives.Common.Components.Views.AudioManager.AudioButton;
                self.showButton(_AUDIO_BTN.AUDIO_STATE.PAUSE);
                self.tooltipView.changeTooltipText(self._getToolTipMessage(_AUDIO_BTN.AUDIO_STATE.PAUSE));
                this.audioManagerView.play(this.soundId);
                self.trigger(_AUDIO_BTN.AUDIO_EVENT.PLAY);
            },

            /**
            * On Stop of playing current sound ID, stops current audio and triggers stop event.
            *
            * @method stop
            */
            stop: function () {
                var _AUDIO_BTN = MathInteractives.Common.Components.Views.AudioManager.AudioButton;
                this.audioManagerView.pause();
                this.showButton(_AUDIO_BTN.AUDIO_STATE.PLAY);
                this.model.setCurrentPlayingAudio(null);
                this.removeAudioViewFromArray();
                this.trigger(_AUDIO_BTN.AUDIO_EVENT.STOP);
            },

            /**
            * On Complete of playing current Audio Id, stops playing current audio and triggers complete event.
            * @method complete
            */
            complete: function () {
                var _AUDIO_BTN = MathInteractives.Common.Components.Views.AudioManager.AudioButton;
                this.audioManagerView.pause();
                this.showButton(_AUDIO_BTN.AUDIO_STATE.PLAY);
                this.tooltipView.changeTooltipText(this._getToolTipMessage(_AUDIO_BTN.AUDIO_STATE.PLAY));
                this.model.setCurrentPlayingAudio(null);
                this.removeAudioViewFromArray();
                this.trigger(_AUDIO_BTN.AUDIO_EVENT.COMPLETE);
            },



            /**
            * Remove Audio view from static array of currently played audios.
            *
            * @method removeAudioViewFromArray
            */
            removeAudioViewFromArray: function () {
                var counter = 0,
                    allAudioViews = MathInteractives.Common.Components.Views.AudioManager.CURRENT_PLAYED_AUDIO_VIEWS,
                    length = allAudioViews.length;
                for (; counter < length; counter++) {
                    if (allAudioViews[counter].idPrefix === this.idPrefix) {
                        allAudioViews.splice(counter, 1);
                        break;
                    }
                }
            }

        }, {
            /****** Starts : Static values and functions of Child view : AudioButton *******/

            /*
            * Disabled class name for audio button used to disable audio button
            *
            * @property DISABLED
            * @type String
            * @static
            * @final
            */
            DISABLED: "disabled",


            /*
            * Audio Button states
            *
            * @property AUDIO_STATE
            * @type {object}
            * @static
            * @final
            */
            AUDIO_STATE: {
                PLAY: "play",
                PAUSE: "pause",
                RESUME: "resume"
            },


            /**
            *  Custom Event callBack triggered after respective audio events are fired.
            *
            * @event AUDIO_EVENT
            * @type {object} Provide custom event names
            * @static
            * @final
            */
            AUDIO_EVENT: {
                PLAY: 'audio-manager-play',
                PAUSE: 'audio-manager-pause',
                RESUME: 'audio-manager-resume',
                STOP: 'audio-manager-stop',
                COMPLETE: 'audio-manager-complete'
            },

            /*
            * Default Audio Button options
            *
            * @property DEFAULT_BUTTON_OPTIONS
            * @type {object}
            * @static
            * @final
            */
            DEFAULT_BUTTON_OPTIONS: {
                PLAY_BUTTON_OPTIONS: {
                    containerId: null,
                    type: MathInteractives.Common.Components.Views.Button ? MathInteractives.Common.Components.Views.Button.TYPE.CUSTOM : MathInteractives.Common.Components.Theme2.Views.Button,
                    imagePathIds: ['sound-mgr-button'],
                    baseClass: 'sound-mgr-play-btn',
                    width: 29,
                    height: 32,
                    path: null
                },
                PAUSE_BUTTON_OPTIONS: {
                    containerId: null,
                    type: MathInteractives.Common.Components.Views.Button ? MathInteractives.Common.Components.Views.Button.TYPE.CUSTOM : MathInteractives.Common.Components.Theme2.Views.Button,
                    imagePathIds: ['sound-mgr-button'],
                    baseClass: 'sound-mgr-pause-btn',
                    width: 29,
                    height: 32,
                    path: null
                },
                RESUME_BUTTON_OPTIONS: {
                    containerId: null,
                    type: MathInteractives.Common.Components.Views.Button ? MathInteractives.Common.Components.Views.Button.TYPE.CUSTOM : MathInteractives.Common.Components.Theme2.Views.Button,
                    imagePathIds: ['sound-mgr-button'],
                    baseClass: 'sound-mgr-resume-btn',
                    width: 29,
                    height: 32,
                    path: null
                }
            },

            /*
            * Audio Button types
            *
            * @property TYPE
            * @type {object}
            * @static
            * @final
            */
            TYPE: {
                DEFAULT: 'default',
                CUSTOM: 'custom'
            }

            /****** Ends: Static values and functions of Child view : AudioButton *******/
        }),


        /**
        * Holds view of Audio button which is curerntly played and used across interactivities.
        * Used to stop currently played audio on new audio play.
        *
        * @property CURRENT_PLAYED_AUDIO_VIEWS
        * @type {Array}
        */
        CURRENT_PLAYED_AUDIO_VIEWS: [],


        /**
        *  Custom Event callBack triggered on Audio Load.
        *
        * @event AUDIO_EVENT
        * @type {object} Provide custom event names
        * @static
        * @final
        */
        AUDIO_EVENT: {
            LOAD_START: 'audio-manager-load-start',
            LOAD_COMPLETE: 'audio-manager-load-complete',
            PLAY: 'audio-manager-play',
            PAUSE: 'audio-manager-pause',
            RESUME: 'audio-manager-resume',
            STOP: 'audio-manager-stop',
            COMPLETE: 'audio-manager-complete'
        },




        /**
        * Generates audio button of Audio Manager.
        *
        * @method generateAudioButton
        * @param {object} [options]
        * return {object} Audio button view
        */
        generateAudioButton: function (options) {
            /**
            options = {
            containerId: $('#' + containerId), // containerId will include idPrefix.
            playBtnOption: {},                 // button object for play button without id
            pauseBtnOption: {},                // button object for pause button without id
            resumeBtnOption: {},               // button object for resume button without id
            audioManagerView: {},              // audio manager view object
            soundId: ""                        // Id of sound to play.
            }
            **/
            return (new this.AudioButton(options));
        },

        /**
        * Stop playing audio.
        *
        * @method stopAllSounds
        */
        stopAllSounds: function () {
            var audioBtnViews = MathInteractives.Common.Components.Views.AudioManager.CURRENT_PLAYED_AUDIO_VIEWS,
                audioViewsLength = audioBtnViews.length,
                currentAudioView = {},
                counter = 0;
            for (; counter < audioViewsLength; counter++) {
                currentAudioView = audioBtnViews[counter];
                currentAudioView.stop();
            }
            audioBtnViews = []; // reset array of currently played audio
        },

        /**
        * Initialize Audio Manager model and view.
        *
        * @method initAudioManager
        * @param {object} [options]
        * return {object} Audio Manager View
        */
        initAudioManager: function (options) {
            /**
            options = {}
            options.idPrefix        // Interactivity Id Prefix
            options.manager =       // Manager object
            options.player =        // Player object
            options.filePath =      // File json object used for getImagePath of preloader img
            options.audioFilePath = // Audio File complete src path
            options.audioData =     // Audio ids Map Object (mapping of sound ids and start/end markers)
            **/

            var audioManagerModel = new MathInteractives.Common.Components.Models.AudioManager(options);
            var audioManagerView = new MathInteractives.Common.Components.Views.AudioManager({ model: audioManagerModel });
            return audioManagerView;
        }
    });
    MathInteractives.global.AudioManager = MathInteractives.Common.Components.Views.AudioManager;
})();
