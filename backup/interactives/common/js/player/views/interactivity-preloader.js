(function (MathInteractives) {
    if (MathInteractives.Common.Player.Views.InteractivityPreloader) {
        return;
    }

    'use strict';
    /**
    * A customized Backbone.View that holds the logic behind the preloading of Player.
    * @class InteractivityPreloader
    * @constructor
    * @namespace MathInteractives.Common.Player.Views
    * @module Common
    * @submodule Player
    * @extends Backbone.View
    */
    MathInteractives.Common.Player.Views.InteractivityPreloader = Backbone.View.extend({

        /*
        * @property el
        * @type object
        * @default $('.preloader')
        **/
        el: '.preloader',

        /*
        * The timer used for throbber animation
        *
        * @property throbTimer
        * @type Number
        * @default numm
        **/
        throbTimer: null,

        /**
        * Initialization
        * @method initialize
        */
        initialize: function initialize() {
            this.model.on('preloader-complete', $.proxy(this._completeCallback, this));
            this.model.on('preloader-progress', $.proxy(this._progressCallback, this));
            this.model.on('preloader-error', $.proxy(this._errorCallback, this));
            this.model.on('preloader-before-start', $.proxy(this._beforeStart, this));

            //Events for step 2 preloading
            this.model.on('step-2-preloader-complete', $.proxy(this._step2CompleteCallback, this));
            this.model.on('step-2-preloader-progress', $.proxy(this._step2ProgressCallback, this));
            this.model.on('step-2-preloader-error', $.proxy(this._step2ErrorCallback, this));
            this.model.on('step-2-preloader-before-start', $.proxy(this._step2BeforeStart, this));
        },

        /*
        * call before preload start
        * @method
        * @event
        */
        _beforeStart: function (event) {
            var config = this.model.get('interactivityConfig'),
                theme = config.themeType,
                noOfTabs = config.tabsData.length,
                containerId = this.model.get('containerId'),
                prefix = config.idPrefix, $playerCont,
                $throbberContainer = this.$('.throbber-container'),
                $loadingTextContainer = this.$('.in-progress-text');

            //TODO: uncomment this to load multiple interactive
            //prefix = containerId + '-' + config.idPrefix;
            $playerCont = $('#' + containerId + ' div:first');
            $playerCont
                .addClass((config.cssClass || ''))
                .addClass(config.idPrefix)
                .addClass('math-utilities-manager')
                .attr('id', prefix + '-player');


            //adding theme specific class
            if (typeof config.playerTheme !== 'undefined' && config.playerTheme !== null && config.playerTheme > 1) {
                $playerCont.addClass('player-theme-' + config.playerTheme);
            }

            //Hides tab container if tabs count is 1
            if (noOfTabs < 2) {
                this.$el.parent().find('.tabs-container').hide();
            }

            switch (theme) {
                case MathInteractives.Common.Player.Models.InteractivityPreloader.PRELOADER_TYPE1:
                    if (noOfTabs > 1) {
                        this.$el.css('height', '585px');    //small-layout-with-tabs
                    }
                    else {
                        this.$el.css('height', '550px');    //small-layout-without-tabs
                    }
                    break;

                case MathInteractives.Common.Player.Models.InteractivityPreloader.PRELOADER_TYPE2:
                    this.$el.css('height', '644px');        //large-layout-with-tabs or without-tabs
                    break;

                default:
                    if (noOfTabs > 1) {
                        this.$el.css('height', '585px');    //small-layout-with-tabs
                    }
                    else {
                        this.$el.css('height', '550px');    //small-layout-without-tabs
                    }

            }
            this.$el.show();
            var $progressBoxContainer = this.$('.progress-box-container');
            
            $progressBoxContainer.css('top', (this.$el.height() - $progressBoxContainer.height()) / 2).show(); // Subtract half the height of progress box

            this.throbTimer = MathInteractives.Common.Player.Views.InteractivityPreloader.SHOW_THROBBER($throbberContainer, $loadingTextContainer);
        },

        /*
        * call on preload complete
        * @method
        * @event
        */
        _completeCallback: function _completeCallback(event) {
            var self = this, config, playerModel, playerView, pollingTimer, prefix, containerId, PlayerView = MathInteractives.Common.Player.Views.Player;

            pollingTimer = setInterval(function () {

                config = self.model.get('interactivityConfig');
                containerId = self.model.get('containerId');
                prefix = config.idPrefix;

                //TODO: uncomment this to load multiple interactive
                //prefix = containerId + '-' + config.idPrefix;

                if (typeof prefix === 'undefined') {
                    prefix = '';
                }

                if (!$('#' + containerId + ' .player').is(':visible')) {
                    return;
                }
                clearInterval(pollingTimer);
                playerModel = new MathInteractives.global.PlayerModel({
                    noOfTabs: config.tabsData.length,
                    config: config,
                    jsonData: event.jsonData,
                    managerData: event.managerData,
                    startTabindex: event.startTabindex,
                    isAccessible: event.allowAccessibility,
                    isNoTextMode: event.isNoTextMode,
                    prefix: prefix + '-',
                    interactiveId: self.model._interactiveOptions.interactiveGuid,
                    path: event.path,
                    initialState: event.initialState,
                    containerId: containerId,
                    modalPresent: true,
                    pronunciationData: event.pronunciationData,
                    audioFileDataMap: self.model.get('audioFileDataMap'),
                    isPoppedOut: self.model._interactiveOptions.popout
                });
                playerView = new PlayerView({
                    model: playerModel,
                    el: $('#' + containerId + ' .player')
                });

                self.model.set('playerView', playerView);
                self.$el.fadeOut(1000, function () {
                    playerView.setModalPresent(false);
                });

                
                var pageControl = SpeechStream.tools.getPageControl();
                pageControl.addAllow(playerView.$el.parent()[0].id);

                playerModel.off(PlayerView.Events.SECOND_STEP_START).on(PlayerView.Events.SECOND_STEP_START, $.proxy(self._startStep2Preload, self));
                self.model.trigger('interactive-load-complete', { loadedStepNumber: 1 });
                MathInteractives.Common.Player.Views.InteractivityPreloader.STOP_THROBBER(self.throbTimer, self.$('.in-progress-text'));
            }, 17);
        },



        /*
        * call on preload progress
        * @method
        * @event
        */
        _progressCallback: function _progressCallback(event) {
            var text = this.$el.find('.in-progress-text').html();
            if (!text) {

                this.$el.find('.in-progress-text').html('Loading');
            }
            this.$el.find('.progress-bar').css('width', event.percentComplete + '%');
        },

        /*
        * call on preload error
        * @method
        * @event
        */
        _errorCallback: function _errorCallback() {
            MathInteractives.Debugger.log('interactivity-preloader :: Error!!');
            this.$el.find('.in-progress-text').html('Loading Failed!!');
            MathInteractives.Common.Player.Views.InteractivityPreloader.STOP_THROBBER(this.throbTimer, this.$('.in-progress-text'));
        },


        /*
        * Call on start loading resources for step 2
        * @event
        * @method _startStep2Preload
        */
        _startStep2Preload: function _startStep2Preload(tabView) {
            this.model.startStep2Preload();
        },

        /*
         * Callback before preload start of step 2. Sets preloader position and width
         * @method _step2BeforeStart
         * @event
         */
        _step2BeforeStart: function _step2BeforeStart(event) {
            //TODO: Initializing required vars, Setting the preloader's default values
        },

        /*
         * On Progress Callback for step 2. Updates the preloader width
         * @method _step2ProgressCallback
         * @event
         */
        _step2ProgressCallback: function _step2ProgressCallback(event) {
            var player = this.model.get('playerView'),
                PlayerEvents = MathInteractives.Common.Player.Views.Player.Events;
            player.model.trigger(PlayerEvents.SECOND_STEP_PROGRESS, event);
        },

        /*
         * Complete callback on step 2 preload completion
         * @method _step2CompleteCallback
         * @event
         */
        _step2CompleteCallback: function _step2CompleteCallback(event) {
            var player = this.model.get('playerView'),
                PlayerEvents = MathInteractives.Common.Player.Views.Player.Events;
            player.model.set('jsonData', event.jsonData);
            player.model.trigger(PlayerEvents.SECOND_STEP_COMPLETE, event);
            this.model.trigger('interactive-load-complete', { loadedStepNumber: 2 });
        },

        /*
         * Error Callback for step 2
         * @method _step2ErrorCallback
         * @event
         */
        _step2ErrorCallback: function _step2ErrorCallback(event) {
            MathInteractives.Debugger.log('interactivity-preloader :: Error!!');
            var player = this.model.get('playerView'),
                PlayerEvents = MathInteractives.Common.Player.Views.Player.Events;
            player.model.trigger(PlayerEvents.SECOND_STEP_ERROR, event);
            //TODO: Log the file having error, use the param passed back in error callback
        }



    }, {
        /*
         * Displays a continuous throbber
         * @method _showThrobber
         */
        SHOW_THROBBER: function _showThrobber($throbberContainer, $textContainer) {
            var self = this,
                InteractivityPreloader = MathInteractives.Common.Player.Views.InteractivityPreloader,
                MAX_THROBBER_SEQUENCE = InteractivityPreloader.MAX_THROBBER_SEQUENCE,
                counter = 0,
                throbTimer = null;
            if ($textContainer) {
                InteractivityPreloader.ANIMATE_PRELOADER_TEXT($textContainer);
            }
            throbTimer = setInterval(function singleThrob() {
                //console.log('throbbing...');

                $throbberContainer.removeClass(InteractivityPreloader.THROBBER_CLASS).addClass('throb-' + counter++ % MAX_THROBBER_SEQUENCE);
            }, InteractivityPreloader.THROBBER_FRAME_INTERVAL);
            return throbTimer
        },

        ANIMATE_PRELOADER_TEXT: function _animatePreloaderText($textContainer) {
            var self = this,
                InteractivityPreloader = MathInteractives.Common.Player.Views.InteractivityPreloader,
                animationCallbackEvent = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            $textContainer.removeClass('animated fadeIn').addClass('animated fadeOut').one(animationCallbackEvent, function () {
                $(this).removeClass('animated fadeOut').addClass('animated fadeIn').one(animationCallbackEvent, function () { InteractivityPreloader.ANIMATE_PRELOADER_TEXT($textContainer); });
            });
        },

        STOP_THROBBER: function _stopThrobber(intervalID, $textContainer) {
            if ($textContainer) {
                $textContainer.off();
            }
            clearInterval(intervalID);
            return;
        },

        THROBBER_CLASS: 'throb-0 throb-1 throb-2 throb-3 throb-4 throb-5 throb-6',
        MAX_THROBBER_SEQUENCE: 7,
        THROBBER_FRAME_INTERVAL: 100
    });


    return MathInteractives.Common.Player.Views.InteractivityPreloader;
})(window.MathInteractives);
