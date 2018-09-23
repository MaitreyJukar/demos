(function () {
    'use strict';

    //defining namespace
    if (typeof MathInteractives.Interactivities.VirusZapper === 'undefined') {
        MathInteractives.Common.Interactivities.VirusZapper = {};
        MathInteractives.Common.Interactivities.VirusZapper.Views = {};
        MathInteractives.Common.Interactivities.VirusZapper.Models = {};
    }
    var namespace = MathInteractives.Common.Interactivities.VirusZapper.Views;
    var virusZapperMainClass;
    /**
    * Class for virus zapper main view ,contains properties and methods of virus zapper main view.
    * @class VirusZapper
    * @module VirusZapper
    * @namespace MathInteractives.Interactivities.VirusZapper.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    namespace.VirusZapper = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores filepaths for resources , value set on initialize
        *   
        * @property filePath 
        * @type Object
        * @default null
        **/
        filePath: null,

        /**
        * Stores manager instance for using common level functions , value set on initialize
        *
        * @property manager 
        * @type Object
        * @default null
        **/
        manager: null,

        /**
        * Stores reference to player , value set on initialize
        * 
        * @property player 
        * @type Object
        * @default null
        **/
        player: null,

        /**
        * id-prefix of the interactive , value set on initialize
        * 
        * @property idPrefix 
        * @type String
        * @default null
        **/
        idPrefix: null,

        /**
        * Stores view object of question panel.
        * 
        * @property quesAnsPanelView 
        * @type object
        * @default null
        **/
        quesAnsPanelView: null,

        /**
        * Stores view object of number line.
        * 
        * @property numberLineView 
        * @type object
        * @default null
        **/
        numberLineView: null,
        /**
        * Stores view object of viruses.
        * 
        * @property virusDisplayAnimation
        * @type object
        * @default null
        **/
        virusDisplayAnimation: null,

        /**
        * Stores status of virus i.e. whether it is zapped or missed.
        * 
        * @property status 
        * @type string
        * @default null
        **/
        status: null,

        /**
        * Stores interactivity type.
        * 
        * @property interactivityType 
        * @type number
        * @default null
        **/
        interactivityType: null,

        /**
        * Stores current level.
        * 
        * @property level 
        * @type number
        * @default 1
        **/
        level: 1,

        /**
        * Stores number line class.
        * 
        * @property numberLineClass 
        * @type object
        * @default 1
        **/
        numberLineClass: null,

        /**
        * Initializes the virus zapper main view
        *
        * @method initialize
        * @public 
        **/
        initialize: function () {
            this.player = this.model.get('player');
            this.filePath = this.player.getPath();
            this.manager = this.player.getManager();
            this.idPrefix = this.player.getIDPrefix();
            this.interactivityType = this.model.get('interactivityType');
            this.numberLineClass = namespace.NumberLine;
            var teamplateData = { idPrefix: this.idPrefix };
            this.$el.append(MathInteractives.Common.Interactivities.VirusZapper.templates.exploreTab(teamplateData).trim());
            this._setHelpElements();
            if (this.interactivityType === virusZapperMainClass.INTERACTIVITY_TYPE_1) {
                this.loadScreen('virus-zapper-1-direction');
                this.loadScreen('virus-zapper-1-popups');
                this.loadScreen('virus-zapper-1-direction-1');
            }
            else {
                this.loadScreen('virus-zapper-2-popups');
                this.loadScreen('virus-zapper-2-direction-1');
            }

            //            if (this.interactivityType === 2) {
            //                this.loadScreen('virus-zapper-2-direction-1');
            //            }
            this.render();
            //            this.changeMessage('question-answer-panel', '0', [this.quesAnsPanelView.model.get('healthMeter'), ]);
            //            this.setAccMessage('question-answer-panel', this.getAccMessage('question-answer-panel', 0));
        },

        /**
        * Renders the virus zapper interactivity main view.
        *
        * @method render
        * @public 
        **/
        render: function () {
            this._renderElements();

            this.loadScreen('explore-tab');
            this._generateButtons();
            this._attachEvents();

            this.player.bindTabChange(function () {
                if (this.interactivityType === virusZapperMainClass.INTERACTIVITY_TYPE_1) {
                    this.addDirectionText();
                    this.setFocus('direction-text-direction-text-text');
                } else {
                    this.changeZapper2direction(1);
                    this.setFocus('direction-text-direction-text-textholder');
                }
            }, this, 1);

            this.$el.css({
                'background-image': 'url("' + this.filePath.getImagePath('virus-zapper-sprite-1') + '")'
            });

            this.loadScreen('explore-tab-acc-div');

        },

        /**
        * Binds events on elements
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var self = this;
            this.viewDataBtnView.$el.off('click').on('click', $.proxy(self.tabSwitchDataTab, self));

            this.numberLineView.model.off('animation-progress')
                .on('animation-progress', $.proxy(self.triggerVirusAnimation
                , self));
            this.numberLineView.model.off('animation-complete')
                .on('animation-complete', $.proxy(self.triggerVirusAnimationComplete
                , self));
            this.numberLineView.model.off('fade-in-start')
                .on('fade-in-start', $.proxy(self.triggerFadeinVirusAnimation
                , self));


        },
        triggerVirusAnimation: function triggerVirusAnimation(data) {
            this.virusDisplayAnimation.model.trigger('animation-progress', data);
        },
        triggerVirusAnimationComplete: function triggerVirusAnimationComplete() {
            this.virusDisplayAnimation.model.trigger('animation-complete');
        },
        triggerFadeinVirusAnimation: function triggerFadeinVirusAnimation() {
            this.virusDisplayAnimation.model.trigger('fade-in-start');
        },


        /**
        * Renders all buttons in virus zapper.
        * @method _generateButtons
        * @private
        */
        _generateButtons: function _generateButtons() {
            this.viewDataBtnView = MathInteractives.global.Theme2.Button.generateButton({

                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                manager: this.manager,
                data: {
                    id: this.idPrefix + 'view-data-btn',
                    text: this.getMessage('view-data-btn-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    width: 112
                }
            });
            this.loadScreen('explore-tab');
            this.player.enableTab(false, 2);
            this.viewDataBtnView.$el.hide();
        },

        /**
        * Renders all other elements virus zapper.
        * @method _renderElements
        * @private
        */
        _renderElements: function _renderElements() {
            var quesAnsPanelObj, virusDisplayAnimationObj, $virusGridContainer, numberLineObj, $numberLineContainer, self = this, answer, root,

        $quesAnsPanelContainer = this.$('#' + this.idPrefix + 'explore-question-answer-panel');

            $numberLineContainer = this.$('#' + this.idPrefix + 'number-line-container');
            $virusGridContainer = this.$('#' + this.idPrefix + 'grid-wrapper-container');

            quesAnsPanelObj = {
                player: this.player,
                containerId: $quesAnsPanelContainer,
                interactivityType: this.interactivityType
            };
            this.quesAnsPanelView = namespace.QuesAnsPanel.generateQuesAnsPanel(quesAnsPanelObj);

            virusDisplayAnimationObj = {
                player: this.player,
                containerId: $virusGridContainer,
                interactivityType: this.interactivityType
            };

            this.virusDisplayAnimation = namespace.VirusDisplayAnimation.generateViruses(virusDisplayAnimationObj);


            numberLineObj = {
                player: this.player,
                containerId: $numberLineContainer,
                tickHeight: 12,
                centerTickHeight: 20,
                color: '#222',
                textColor: '#222'
            };
            this.numberLineView = this.numberLineClass.generateNumberLine(numberLineObj);

            this.numberLineView.interactivityType = this.interactivityType;
            this.attachEvents();
            answer = this.quesAnsPanelView.model.get('ansValue');
            this.numberLineView.ansValue = answer;
            root = this.quesAnsPanelView.model.get('root');
            this.numberLineView.root = root;
        },

        /**
        * Binds events.
        * @method attachEvents
        * @public
        */
        attachEvents: function () {
            var VirusZapperEvents = namespace.VirusZapper.Events;
            this.VirusZapperEvents = VirusZapperEvents;

            this.numberLineView.model.off(VirusZapperEvents.DECREMENT_HEALTH_METER).on(VirusZapperEvents.DECREMENT_HEALTH_METER, $.proxy(this.triggerHeathMeterChange, this));
            this.numberLineView.model.off(VirusZapperEvents.DISPLAY_FIRST_DIGIT).on(VirusZapperEvents.DISPLAY_FIRST_DIGIT, $.proxy(this.triggerDisplayFirstDigit, this));
            this.numberLineView.model.off(VirusZapperEvents.GENERATE_POPUP).on(VirusZapperEvents.GENERATE_POPUP, $.proxy(this.generatePopup, this));
            this.numberLineView.model.off(VirusZapperEvents.GET_ANSWER_VALUE).on(VirusZapperEvents.GET_ANSWER_VALUE, $.proxy(this.setValues, this));
            this.numberLineView.model.off(VirusZapperEvents.CHANGE_DIRECTION_TEXT).on(VirusZapperEvents.CHANGE_DIRECTION_TEXT, $.proxy(this.changeDirectionText, this));
            this.numberLineView.model.off(VirusZapperEvents.DISPLAY_ENTIRE_ANSWER).on(VirusZapperEvents.DISPLAY_ENTIRE_ANSWER, $.proxy(this.displayEntireAnswer, this));
            this.numberLineView.model.off(VirusZapperEvents.RENDER_NEXT_LEVEL).on(VirusZapperEvents.RENDER_NEXT_LEVEL, $.proxy(this.renderNextLevel, this));
            this.numberLineView.model.off(VirusZapperEvents.DISPLAY_THOUSANDTH_PLACE).on(VirusZapperEvents.DISPLAY_THOUSANDTH_PLACE, $.proxy(this.triggerDisplayLastDigit, this));
            this.numberLineView.model.off(VirusZapperEvents.MOVE_VIRUSES).on(VirusZapperEvents.MOVE_VIRUSES, $.proxy(this.triggerMoveVirus, this));
            this.numberLineView.model.off(VirusZapperEvents.ENABLE_DISABLE).on(VirusZapperEvents.ENABLE_DISABLE, $.proxy(this.enableDisableButtons, this));

            this.quesAnsPanelView.model.on('change:healthMeter', $.proxy(this.generatePopup, this, virusZapperMainClass.OUTBREAK));

        },

        /**
        * Shows direction text for first level of question round.
        * @method _addDirectionText
        * @public
        */
        addDirectionText: function () {
            this.$('#' + this.idPrefix + 'direction-text').html('');
            var options = null, self = this;

            switch (this.level) {
                case this.numberLineClass.VIRUS_ZAPPER_1_FIRST_LEVEL:
                    {
                        this.loadScreen('virus-zapper-1-direction');
                        //console.log('direction text');
                        options = {
                            screenId: 'virus-zapper-1-direction',
                            text: this.getMessage('direction-text-text', 0),
                            accText: this.getAccMessage('direction-text-direction-text-textholder', 0),
                            tabIndex: 505,
                            idPrefix: this.idPrefix,
                            containerId: this.idPrefix + 'direction-text',
                            manager: this.manager,
                            path: this.filePath,
                            player: this.player,
                            textColor: '#000000',
                            containmentBGcolor: 'rgba(255,255,255,0.1)',
                            showButton: true,
                            buttonText: this.getMessage('direction-text-direction-text-textholder', 1),
                            buttonAccText: this.getAccMessage('direction-text-direction-text-buttonholder', 1),
                            buttonTabIndex: 700,
                            clickCallback: {
                                fnc: function () {
                                    var callType = 1;
                                    self.generateTryAnotherPopup(callType);
                                },
                                scope: this
                            }
                        }
                    }
                    break;
                case this.numberLineClass.VIRUS_ZAPPER_1_BONUS_LEVEL:
                    {
                        this.loadScreen('virus-zapper-1-direction-1');
                        options = {
                            screenId: 'virus-zapper-1-direction-1',
                            text: this.getMessage('direction-text-text', 0),
                            accText: this.getAccMessage('direction-text-direction-text-textholder', 0),
                            idPrefix: this.idPrefix,
                            containerId: this.idPrefix + 'direction-text',
                            manager: this.manager,
                            path: this.filePath,
                            player: this.player,
                            textColor: '#000000',
                            tabIndex: 505,
                            containmentBGcolor: 'rgba(255,255,255,0.1)',
                            showButton: true,
                            buttonText: this.getMessage('direction-text-direction-text-textholder', 1),
                            buttonAccText: this.getAccMessage('direction-text-direction-text-buttonholder', 1),
                            buttonTabIndex: 580,
                            clickCallback: {
                                fnc: function () {
                                    var callType = 2;
                                    self.generateTryAnotherPopup(callType);
                                },
                                scope: this
                            }
                        }
                    }
                    break;
            }
            this.directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(options);

        },

        /**
        * Shows direction text for first level of question round.
        * @method _addZapper2DirectionText
        * @private
        */
        _addZapper2DirectionText: function () {
            var self = this;
            //console.log('direction text zapper 2');
            this.$('#' + this.idPrefix + 'direction-text').html('');
            this.virusZapper2DirectionText1 = MathInteractives.global.Theme2.DirectionText.generateDirectionText({
                screenId: 'virus-zapper-2-direction-1',
                text: this.getMessage('direction-text-direction-text-textholder', 0),
                accText: this.getAccMessage('direction-text-direction-text-textholder', 0),
                idPrefix: this.idPrefix,
                containerId: this.idPrefix + 'direction-text',
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                textColor: '#000000',
                containmentBGcolor: 'rgba(255,255,255,0.1)',
                showButton: true,
                buttonText: this.getAccMessage('direction-text-direction-text-textholder', 1),
                clickCallback: {
                    fnc: function () {
                        var callType = 1;
                        self.generateTryAnotherPopup(callType);
                    },
                    scope: this
                }
            });
            this.directionTextView = this.virusZapper2DirectionText1;
        },


        /**
        * Shows direction text for bonus level of question round.
        * @method changeDirectionText
        * @public
        */
        changeDirectionText: function (event) {
            this.level = event.gameLevel;
            // this.addDirectionText();
        },

        generateTryAnotherPopup: function (callType) {
            this.stopReading();
           
            var healthbarCount = this.quesAnsPanelView.model.get('healthMeter');
            var options, titleText, titleAccText, text, accText;
            titleText = this.getMessage('try-another-popup', 'title');
            titleAccText = this.getAccMessage('try-another-popup', 'title');
            text = this.getMessage('try-another-popup', 'text');
            accText = this.getAccMessage('try-another-popup', 'text');
            var self = this;
            options = {
                title: titleText,
                accTitle: titleAccText,
                text: text,
                accText: accText,
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                closeCallback: {
                    fnc: function (response) {

                        
                        self.tryAnotherResponse = response.isPositive;
                        if (response.isPositive) {
                            self.numberLineView.model.set('firstClick', true);
                            self.$('.grid-holder').remove();
                            var virusDisplayAnimationObj = {
                                player: self.player,
                                containerId: self.$('#' + self.idPrefix + 'grid-wrapper-container'),
                                interactivityType: self.interactivityType
                            };
                            namespace.VirusDisplayAnimation.generateViruses(virusDisplayAnimationObj);
                        }
                        if (callType === 2) {
                            self.resetQuestionPanelAndNumberLine();
                        }
                        if (callType === 1) {
                            self.resetQuestionPanel();
                        }

                        if (response.isPositive) {
                            //self.numberLineClass.FIRST_CLICK = true;
                           
                            self.setFocus('question-answer-panel');
                            self.changeAccMessage('number-line-acc-div', 0);

                            self.enableTab('question-answer-panel', true);
                            self.enableTab('number-line-acc-div', true);
                        }
                        else {
                            self.setFocus('direction-text-direction-text-buttonholder');
                        }
                    }
                },
                buttons: [{
                    id: 'try-another-ok-btn',
                    text: self.getAccMessage('try-another-popup', 'ok-btn'),
                    response: { isPositive: true, buttonClicked: 'try-another-ok-btn' }
                },
            {
                id: 'try-another-cancel-btn',
                text: self.getAccMessage('try-another-popup', 'cancel-btn'),
                response: { isPositive: false, buttonClicked: 'try-another-cancel-btn' }
            }]
            };
            if (this.numberLineView.model.get('firstClick') === true) {

                this.tryAnotherResponse = true;
                this.$('.grid-holder').remove();
                var virusDisplayAnimationObj = {
                    player: this.player,
                    containerId: this.$('#' + this.idPrefix + 'grid-wrapper-container'),
                    interactivityType: this.interactivityType
                };

                namespace.VirusDisplayAnimation.generateViruses(virusDisplayAnimationObj);
                if (callType === 2) {
                    this.resetQuestionPanelAndNumberLine();
                }
                if (callType === 1) {
                    this.resetQuestionPanel();
                }
                this.setFocus('question-answer-panel');
            }
            else {
                MathInteractives.global.Theme2.PopUpBox.createPopup(options);
            }
        },

        /**
        * Generates popups.
        * @method generatePopup
        * @public
        */
        generatePopup: function (event, outbreak) {
            var options, titleText, titleAccText, otherText, otherAccText, healthMeter, timeInterval = 0;
            if (outbreak) {
                healthMeter = this.quesAnsPanelView.model.get('healthMeter');
                if (healthMeter === 0) {
                    this.numberLineView.theme2NumberLineView.removeNumberLineHover();
                    if (this.interactivityType === virusZapperMainClass.INTERACTIVITY_TYPE_1) {
                        titleText = this.getMessage('outbreak-popup', 'title');
                        titleAccText = this.getAccMessage('outbreak-popup', 'title');
                        otherText = this.getMessage('outbreak-popup', 'text');
                        otherAccText = this.getAccMessage('outbreak-popup', 'text', [this.answer]);
                    }
                    else {
                        titleText = this.getMessage('virus-zapper-2-outbreak-popup', 'title');
                        titleAccText = this.getAccMessage('virus-zapper-2-outbreak-popup', 'title');
                        otherText = this.getMessage('virus-zapper-2-outbreak-popup', 'text');
                        otherAccText = this.getAccMessage('virus-zapper-2-outbreak-popup', 'text', [this.answer]);
                    }
                    timeInterval = 500;
                    options = {
                        title: titleText,
                        accTitle: titleAccText,
                        text: otherText,
                        accText: otherAccText,
                        idPrefix: this.idPrefix,
                        player: this.player,
                        manager: this.manager,
                        path: this.filePath,
                        width: 482,
                        height: 262,
                        closeCallback: {
                            fnc: this.callbackOnOutbreak,
                            scope: this
                        },
                        buttons: [{
                            id: 'outbreak-ok-btn',
                            text: this.getMessage('outbreak-popup', 'ok-btn'),
                            response: { isPositive: true, buttonClicked: 'outbreak-ok-btn' }
                        }]
                    };
                    options.foregroundImage = {
                        imageId: 'virus-zapper-sprite-2',
                        imageHeight: 664,
                        imageWidth: 1024


                    };
                    options.foregroundImageBackgroundPosition = '-52px -1404px';
                    options.backgroundImage = {
                        imageId: 'virus-zapper-sprite-2',
                        imageHeight: 664,
                        imageWidth: 1024

                    };
                    options.backgroundImageBackgroundPosition = '-4px -697px';

                }
            }
            switch (event.popupNumber) {
                case this.numberLineClass.BONUS_ROUND_POPUP:
                    {
                        //timeInterval = 500;
                        //this.changeMessage('bonus-round-popup', 'text', [this.ansFirstNumber]);
                        //                        this.setAccMessage('bonus-round-popup', this.getAccMessage('bonus-round-popup', 'text', [this.ansFirstNumber]));
                        //                        debugger;
                        options = {
                            title: this.getMessage('bonus-round-popup', 'title'),
                            accTitle: this.getAccMessage('bonus-round-popup', 'title'),
                            text: this.getMessage('bonus-round-popup', 'text'),
                            accText: this.getAccMessage('bonus-round-popup', 'text', [this.ansFirstNumber]),
                            idPrefix: this.idPrefix,
                            player: this.player,
                            manager: this.manager,
                            path: this.filePath,
                            width: 482,
                            height: 262,
                            closeCallback: {
                                fnc: this.callbackBonusRoundStarts,
                                scope: this
                            },
                            buttons: [{
                                id: 'bonus-round-ok-btn',
                                text: this.getMessage('bonus-round-popup', 'ok-btn'),
                                response: { isPositive: true, buttonClicked: 'bonus-round-ok-btn' }
                            }]
                        };
                        options.foregroundImage = {
                            imageId: 'virus-zapper-sprite-2',
                            imageHeight: 664,
                            imageWidth: 1024
                        };
                        options.foregroundImageBackgroundPosition = '-36px -56px';
                    }
                    break;
                case this.numberLineClass.NO_BONUS_POPUP:
                    {
                        this.status = event.status;
                        timeInterval = 500;
                        options = {
                            title: this.getMessage('no-bonus-popup', 'title'),
                            accTitle: this.getAccMessage('no-bonus-popup', 'title'),
                            text: this.getMessage('no-bonus-popup', 'text'),
                            accText: this.getAccMessage('no-bonus-popup', 'text', [this.answer]),
                            idPrefix: this.idPrefix,
                            player: this.player,
                            manager: this.manager,
                            path: this.filePath,
                            width: 482,
                            height: 262,
                            closeCallback: {
                                fnc: this.callbackNoBonusPopup,
                                scope: this
                            },
                            buttons: [{
                                id: 'no-bonus-ok-btn',
                                text: this.getMessage('no-bonus-popup', 'ok-btn'),
                                response: { isPositive: true, buttonClicked: 'no-bonus-ok-btn' }
                            }]
                        };
                        options.foregroundImage = {
                            imageId: 'virus-zapper-sprite-1',
                            imageHeight: 1024,
                            imageWidth: 664
                        };
                        options.foregroundImageBackgroundPosition = '-38px -1379px';

                    }
                    break;
                case this.numberLineClass.GOT_BONUS_POPUP:
                    {
                        var healthbarCountCheck = this.quesAnsPanelView.model.get('isHealthbarFull'),

                        popUpTextMsgId = (healthbarCountCheck) ? 'textForFullHealth' : 'text';
                        var btnText, type;
                        if (this.interactivityType === virusZapperMainClass.INTERACTIVITY_TYPE_1) {
                            titleText = this.getMessage('got-bonus-popup', 'title');
                            titleAccText = this.getAccMessage('got-bonus-popup', 'title');
                            type = this.quesAnsPanelView.model.get('root') === 2 ? this.quesAnsPanelView.getMessage('square-cube', 'square') : this.quesAnsPanelView.getMessage('square-cube', 'cube');
                            otherAccText = this.getAccMessage('got-bonus-popup', popUpTextMsgId, [type, this.qsn, this.answer]);

                            otherText = this.getMessage('got-bonus-popup', popUpTextMsgId);
                            btnText = this.getAccMessage('got-bonus-popup', 'ok-btn');
                        }
                        else {
                            titleText = this.getMessage('virus-zapper-2-fourth-level-popup', 'title');
                            titleAccText = this.getAccMessage('virus-zapper-2-fourth-level-popup', 'title');
                            otherText = this.getMessage('virus-zapper-2-fourth-level-popup', 'text');
                            otherAccText = this.getAccMessage('virus-zapper-2-fourth-level-popup', 'text', [this.qsn, this.answer]);
                            btnText = this.getAccMessage('virus-zapper-2-fourth-level-popup', 'ok-btn');
                        }

                        this.status = event.status;
                        timeInterval = 500;
                        this.$zappedVirus = event.$zappedVirus;
                        options = {
                            title: titleText,
                            accTitle: titleAccText,
                            text: otherText,
                            accText: otherAccText,
                            idPrefix: this.idPrefix,
                            player: this.player,
                            manager: this.manager,
                            path: this.filePath,
                            width: 482,
                            height: 262,
                            closeCallback: {
                                fnc: this.resetOnGettingBonus,
                                scope: this
                            },
                            buttons: [{
                                id: 'got-bonus-ok-btn',
                                text: btnText,
                                response: { isPositive: true, buttonClicked: 'got-bonus-ok-btn' }
                            }]
                        };
                        options.foregroundImage = {
                            imageId: 'virus-zapper-sprite-1',
                            imageHeight: 1024,
                            imageWidth: 664
                        };
                        options.foregroundImageBackgroundPosition = '-40px -704px';
                    }
                    break;
                case this.numberLineClass.ALMOST_THERE_POPUP:
                    {

                        options = {
                            title: this.getMessage('virus-zapper-2-third-level-popup', 'title'),
                            accTitle: this.getAccMessage('virus-zapper-2-third-level-popup', 'title'),
                            text: this.getMessage('virus-zapper-2-third-level-popup', 'text'),
                            accText: this.getAccMessage('virus-zapper-2-third-level-popup', 'text'),
                            idPrefix: this.idPrefix,
                            player: this.player,
                            manager: this.manager,
                            path: this.filePath,
                            width: 482,
                            height: 262,
                            closeCallback: {
                                fnc: this.triggerFourthLevel,
                                scope: this
                            },
                            buttons: [{
                                id: 'almost-there-ok-btn',
                                text: this.getAccMessage('virus-zapper-2-third-level-popup', 'ok-btn'),
                                response: { isPositive: true, buttonClicked: 'almost-there-ok-btn' }
                            }]
                        };
                        options.foregroundImage = {
                            imageId: 'virus-zapper-sprite-2',
                            imageHeight: 1024,
                            imageWidth: 664
                        };
                        options.foregroundImageBackgroundPosition = '-36px -56px';

                    }
                    break;
            }
            if (options) {
                this.numberLineView.player.setModalPresent(true);
            }
            MathInteractives.global.Theme2.PopUpBox.createPopup(options);
            this.setFocus('theme2-pop-up-title-text-combined-acc', 10);
        },

        /**
        * Generates fourth level..
        * @method triggerFourthLevel
        * @public
        */
        triggerFourthLevel: function (event) {
            this.loadScreen('virus-zapper-2-direction-4');
            this.changeZapper2direction(this.level);
            this.numberLineView.model.trigger(this.VirusZapperEvents.ENABLE_DISABLE, { status: true });
            this.numberLineView.enableNumberLine();
            this.setFocus('number-line-acc-div');
        },

        /**
        * Displays entire answer.
        * @method displayEntireAnswer
        * @public
        */
        displayEntireAnswer: function (event) {
            this.quesAnsPanelView.showEntireAnswer(event.isPositive);
            if (event.gotBonus === true) {
                this.quesAnsPanelView.incrementLifeMeter();
            }
        },

        /**
        * Resets question panel.
        * @method resetQuestionPanel
        * @public
        */
        resetQuestionPanel: function () {
            //alert('try another');
            //            var callType = 1;
            //            this.generateTryAnotherPopup(callType);

            if (this.tryAnotherResponse === true) {
                //console.log('called');
                this.resetCommonCode();

                this.quesAnsPanelView.resetLifeMeter();
                this.player.enableTab(false, 2);
                this.viewDataBtnView.$el.hide();
                this.model.set('changeForTryAnother', 1);
                this.numberLineView.removeToolTip();
                //(this.model.get('virusZapperModel')).trigger('TryanotherClick');
                if (this.interactivityType === virusZapperMainClass.INTERACTIVITY_TYPE_2) {
                    this.numberLineView.level = virusZapperMainClass.DEFAULT_LEVEL_VALUE;
                }
                this.numberLineView.player.setModalPresent(false);
            }
        },


        /**
        * Resets question panel and numberline.
        * @method resetQuestionPanelAndNumberLine
        * @public
        */
        resetQuestionPanelAndNumberLine: function () {
            //alert('try another');
            //            var callType = 2;
            //            this.generateTryAnotherPopup(callType);

            if (this.tryAnotherResponse === true) {
                this.numberLineView.removeToolTip();
                this.level = this.numberLineClass.VIRUS_ZAPPER_1_FIRST_LEVEL;
                this.resetCommonCode();
                this.quesAnsPanelView.resetLifeMeter();

                if (this.interactivityType === virusZapperMainClass.INTERACTIVITY_TYPE_2) {
                    this.numberLineView.level = virusZapperMainClass.DEFAULT_LEVEL_VALUE;
                    this.changeZapper2direction(this.level);
                } else {
                    this.addDirectionText();
                }
                this.numberLineView.player.setModalPresent(false);
            }
        },

        /**
        * Resets question panel and numberline.
        * @method callbackOnOutbreak
        * @public
        */
        callbackOnOutbreak: function () {
            var self = this;
            //this.numberLineView.removeToolTip();
            this.player.enableTab(true, 2);
            this.viewDataBtnView.$el.show();
            this.quesAnsPanelView.showEntireAnswer();
            this.numberLineView.triggerNumberLineDisableClick();
            this.numberLineView.theme2NumberLineView.removeNumberLineHover();
            this.numberLineView.player.setModalPresent(true);
            self.status = false;
            this.updateDataTable(self.answer, self.root, self.status, self.qsn);
            this.numberLineView.disableNumberLine();
            this.setFocus('view-data-btn');
            this.enableTab('question-answer-panel', false);
            this.enableTab('number-line-acc-div', false);
        },

        callbackBonusRoundStarts: function () {
            //this.numberLineView.removeToolTip();
            this.numberLineView.model.trigger(this.VirusZapperEvents.ENABLE_DISABLE, { status: true });
            this.addDirectionText();
            this.numberLineView.enableNumberLine();
            this.setFocus('number-line-acc-div');
        },

        /**
        * Resets question panel and numberline.
        * @method callbackNoBonusPopup
        * @public
        */
        callbackNoBonusPopup: function () {
            this.numberLineView.removeToolTip();

            var self = this;
            this.level = this.numberLineClass.VIRUS_ZAPPER_1_FIRST_LEVEL;
            this.updateDataTable(self.answer, self.root, self.status, self.qsn);
            //(this.model.get('virusZapperModel')).trigger('bonusClicked', { ansValue: self.answer, root: self.root, status: self.status, qsn: self.qsn });
            this.tryAnotherResponse = false;
            this.resetCommonCode();
            //this.quesAnsPanelView.resetLifeMeter();
            this.addDirectionText();
            this.player.enableTab(true, 2);
            this.viewDataBtnView.$el.show();
            this.numberLineView.enableNumberLine();
            this.setFocus('question-answer-panel');
        },

        /**
        * Adds values for next row.
        * @method updateDataTable
        * @public
        */

        updateDataTable: function (answer, root, status, qsn) {
            var qsnType = this.model.get('qsnType');
            var tableDataCol1 = this.model.get('tableDataCol1');
            var tableDataCol2 = this.model.get('tableDataCol2');
            var tableDataCol3 = this.model.get('tableDataCol3');
            qsnType.push(root);
            tableDataCol1.push(qsn);
            tableDataCol2.push(answer);
            tableDataCol3.push(status);
            this.model.set('qsnType', qsnType);
            this.model.set('tableDataCol1', tableDataCol1);
            this.model.set('tableDataCol2', tableDataCol2);
            this.model.set('tableDataCol3', tableDataCol3);
            this.model.set('valueChanged', 1);
        },


        /**
        * resets question, numberline but not the health meter in virus zapper 1.
        * @method resetOnGettingBonus
        * @public
        */
        resetOnGettingBonus: function () {
            this.numberLineView.removeToolTip();
            var self = this;
            this.level = this.numberLineClass.VIRUS_ZAPPER_1_FIRST_LEVEL;
            this.$zappedVirus.hide();
            this.numberLineView.level = virusZapperMainClass.DEFAULT_LEVEL_VALUE;
            this.updateDataTable(self.answer, self.root, self.status, self.qsn);
            //this.model.get('virusZapperModel').trigger('bonusClicked', { ansValue: self.answer, root: self.root, status: self.status, qsn: self.qsn });
            this.tryAnotherResponse = false;
            this.resetCommonCode();
            if (this.interactivityType === virusZapperMainClass.INTERACTIVITY_TYPE_2) {
                this.quesAnsPanelView.resetLifeMeter();
                this.changeZapper2direction(this.level);
            } else {
                this.addDirectionText();
            }
            this.player.enableTab(true, 2);
            this.viewDataBtnView.$el.show();
            this.numberLineView.enableNumberLine();
            this.numberLineView.theme2NumberLineView.removeNumberLineHover();
            this.setFocus('question-answer-panel');
        },

        /**
        * renders level in virus zapper 2.
        * @method renderNextLevel
        * @public
        */
        renderNextLevel: function (event) {            //For level 2,3 and 4
            this.numberLineView.removeToolTip();

            this.quesAnsPanelView.resetLifeMeter();
            switch (event.level) {
                case this.numberLineClass.VIRUS_ZAPPER_2_SECOND_LEVEL:
                    this.quesAnsPanelView.showAnsValueBeforeDecimalPoint(event.isPositive);
                    this.loadScreen('virus-zapper-2-direction-2');
                    this.changeZapper2direction(event.level);
                    break;
                case this.numberLineClass.VIRUS_ZAPPER_2_THIRD_LEVEL:
                    this.quesAnsPanelView.showTenthPlaceAnsValue();
                    this.loadScreen('virus-zapper-2-direction-3');
                    this.changeZapper2direction(event.level);
                    break;
                case this.numberLineClass.VIRUS_ZAPPER_2_FOURTH_LEVEL:
                    this.quesAnsPanelView.showHundredthPlaceAnsValue();
                    break;
            }
        },

        /**
        * Changes the direction text depending upon the level of interactivity.
        * @method changeZapper2direction
        * @public
        */

        changeZapper2direction: function (level) {
            var self = this;
            this.$('#' + this.idPrefix + 'direction-text').html('');
            this.virusZapper2DirectionText = MathInteractives.global.Theme2.DirectionText.generateDirectionText({
                screenId: 'virus-zapper-2-direction-' + level,
                idPrefix: this.idPrefix,
                containerId: this.idPrefix + 'direction-text',
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                textColor: '#000000',
                containmentBGcolor: 'rgba(255,255,255,0.1)',
                showButton: true,
                buttonText: this.getAccMessage('direction-text-direction-text-textholder', 1),
                clickCallback: {
                    fnc: function () {
                        self.generateTryAnotherPopup(1);
                    },
                    scope: this
                }
            });
            var ttsTabIndex = this.getTabIndex('direction-text-direction-text-textholder') + 2;
            this.setTabIndex('direction-text-direction-text-ttsholder-play-btn', ttsTabIndex);
            this.setTabIndex('direction-text-direction-text-ttsholder-sound-btn', ttsTabIndex);
            this.setTabIndex('direction-text-direction-text-ttsholder-pause-btn', ttsTabIndex);
            this.directionTextView = this.virusZapper2DirectionText;
            this.unloadScreen('virus-zapper-2-direction-' + level);
            this.loadScreen('virus-zapper-2-direction-' + level);
        },

        /**
        * Contains common reset function calls.
        * @method resetCommonCode
        * @public
        */
        resetCommonCode: function () {
            this.quesAnsPanelView.generateQuestion(this.interactivityType, this.tryAnotherResponse);
            this.numberLineView.showInitialNumberLine();
            this.loadScreen('number-line-acc-screen');
            this.numberLineView.isRangeclicked = false;
        },

        /**
        * Sets values.
        * @method setAnswerValue
        * @public
        */
        setValues: function (event) {

            var answer, root, tenthPlaceValue, hundredthPlaceValue, thousandthPlaceValue,
        digitArray, zapper1FirstClick = this.numberLineView.model.get('firstClick');
            answer = this.quesAnsPanelView.model.get('ansValue');
            answer = +(answer).toFixed(3);
            //            if (event.isPositive !== true && answer > 0) {
            //                this.quesAnsPanelView.model.set('ansValue', -answer);
            //            }
            //this.numberLineView.ansValue = answer;
            root = this.quesAnsPanelView.model.get('root');
            this.numberLineView.root = root;
            digitArray = this.quesAnsPanelView.model.get('digitArray');
            tenthPlaceValue = digitArray[2];

            if (event.isPositive === false && root === 2) {
                if (answer > 0) {
                    this.answer = -answer;
                }
                else if (zapper1FirstClick === false) {
                    this.answer = answer;
                }
                else {
                    this.answer = Math.abs(answer);
                }
            }
            else {
                this.answer = Math.abs(answer);
            }
            this.quesAnsPanelView.model.set('ansValue', this.answer);
            this.numberLineView.ansValue = this.answer;
            //this.answer = +this.answer.toFixed(3);
            this.root = root;
            this.numberLineView.root = root;
            this.qsn = this.quesAnsPanelView.model.get('questionValue');
            this.numberLineView.tenthPlaceValue = tenthPlaceValue;
            hundredthPlaceValue = digitArray[1];
            this.numberLineView.hundredthPlaceValue = hundredthPlaceValue;
            thousandthPlaceValue = digitArray[0];
            this.numberLineView.thousandthPlaceValue = thousandthPlaceValue;
            this.ansFirstNumber = digitArray[3];
        },

        triggerMoveVirus: function triggerMoveVirus(data) {

            this.virusDisplayAnimation.moveViruses(data.minValue, data.maxValue, data.startVal, data.endVal);
        },
        /**
        * triggers event to decrement health meter value.
        * @method triggerHeathMeterChange
        * @public
        */
        triggerHeathMeterChange: function (event) {
            if (this.interactivityType === virusZapperMainClass.INTERACTIVITY_TYPE_2) {
                this.status = event.status;
            }
            this.quesAnsPanelView.model.trigger(virusZapperMainClass.Events.DECREMENT_HEALTH_METER);
        },

        /**
        * switches tab to data tab
        * @method tabSwitchDataTab
        * @public
        */
        tabSwitchDataTab: function () {
            this.stopReading();
            //console.log('tab switch');
            this.player.switchToTab(2);
            this.setFocus('header-subtitle');
        },


        /**
        * triggers event to display part of the answer before decimal point.
        * @method triggerDisplayFirstDigit
        * @public
        */
        triggerDisplayFirstDigit: function (event) {
            this.quesAnsPanelView.showAnsValueBeforeDecimalPoint(event.isPositive);
        },

        /**
        * triggers event to display thousandth place value after decimal point.
        * @method triggerDisplayLastDigit
        * @public
        */
        triggerDisplayLastDigit: function (event) {
            this.quesAnsPanelView.showThousandthPlaceAnsValue();
        },

        /**
        * Enables and disables all buttons.
        * @method enableDisableButtons
        * @public
        */

        enableDisableButtons: function (event) {
            var self = this;
            if (event.status === true) {
                this.player.enableAllHeaderButtons(true);
                this.viewDataBtnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                this.directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                //console.log('enabled');
                this.viewDataBtnView.$el.on('click', $.proxy(self.tabSwitchDataTab, self));
            }
            else {
                this.player.enableAllHeaderButtons(false);
                this.viewDataBtnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                this.directionTextView.changeButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                this.viewDataBtnView.$el.off('click');
                //console.log('disabled');
            }
            this.enableTab('view-data-btn', event.status);
            this.enableTab('direction-text-direction-text-buttonholder', event.status);
        },
        _setHelpElements: function () {
            var helpElements = this.model.get('helpElements');
            helpElements.push(
            { elementId: 'help-center', helpId: 'numberline-center-help', position: 'top', tooltipWidth: '300px', dynamicArrowPosition: true },
            { elementId: 'health-meter-container', helpId: 'healthmeter-help', position: 'bottom', tooltipWidth: '360px' },
            { elementId: 'view-data-btn', helpId: 'view-data-help', position: 'top' },
            { elementId: 'direction-text-direction-text-buttonholder', helpId: 'try-another-help', position: 'bottom', dynamicArrowPosition: true },
            { elementId: 'complete-table-holder', helpId: 'table-data-help', position: 'right', dynamicArrowPosition: true },
            { elementId: 'back-to-game-btn', helpId: 'back-btn-help', position: 'top', dynamicArrowPosition: true }
           );
        }


    }, {
        Events: {
            DECREMENT_HEALTH_METER: 'decrement-health-meter',
            DISPLAY_FIRST_DIGIT: 'display-first-digit',
            GENERATE_POPUP: 'generate-popup',
            GET_ANSWER_VALUE: 'get-answer-value',
            CHANGE_DIRECTION_TEXT: 'change-direction-text',
            DISPLAY_ENTIRE_ANSWER: 'display-entire-answer',
            RENDER_NEXT_LEVEL: 'render-next-level',
            DISPLAY_THOUSANDTH_PLACE: 'display-thousandth-place',
            INCREMENT_HEALTH_METER: 'increment-health-meter',
            MOVE_VIRUSES: 'move-virus',
            ENABLE_DISABLE: 'enable-disable'

        },

        DEFAULT_LEVEL_VALUE: 2,
        OUTBREAK: 0,
        TRY_ANOTHER: 5,
        INTERACTIVITY_TYPE_1: 1,
        INTERACTIVITY_TYPE_2: 2,
        /**
        * Generates main view of the interactive
        * @method generateVirusZapperMainView
        * @param obj {Object} Model to be passed to the main view
        * @public
        */
        generateVirusZapperMainView: function (obj) {
            if (obj) {

                var virusZapperMainModel = new MathInteractives.Common.Interactivities.VirusZapper.Models.VirusZapper();
                obj.model.set('virusZapperModel', virusZapperMainModel);

                var virusZapperMainView = new namespace.VirusZapper({ model: obj.model, el: obj.el });
                return virusZapperMainView;
            }
        }
    });
    virusZapperMainClass = namespace.VirusZapper;
})()