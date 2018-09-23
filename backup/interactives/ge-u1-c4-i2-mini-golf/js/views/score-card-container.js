(function () {
    'use strict';
    /**
    * Score Container holds the necessary structure for the score-card.
    * @class ScoreCardContainer
    * @module MiniGolf
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.ScoreCardContainer = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Unique interactivity id prefix
        * @property idprefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Manager object 
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        $playerModalDiv: null,
        /**
        * Backbone property for binding events to DOM elements.
        *
        * @property events
        * @private
        */
        events: {
            'click .score-card-clear-button.clickEnabled': '_onClearAllDataBtnClick',
            'click .score-card-close-button.clickEnabled': 'closeScoreCard',
            'click .score-card-back-button.clickEnabled': 'closeScoreCard'
        },

        /**
        * Initializes function of ball view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.initializeDefaultProperties();
            this.render();
            this.loadScreen('score-card');
            this._attachAccEvents();
        },
        render: function () {
            this._generateScoreCard();
        },

        _attachAccEvents: function _attachAccEvents() {
            var $titleAccElem = this.$('.score-card-title').on('keydown', $.proxy(this._onTitleKeyDown, this));

            this.$('.score-card-main-panel').off('keydown').on('keydown', $.proxy(this._onScoreCardContainerKeydown, this));
        },

        _onTitleKeyDown: function _onTitleKeyDown(event) {
            event = (event) ? event : window.event;
            var charCode = (event.keyCode) ? event.keyCode : event.which;

            if (charCode === 9 && !event.shiftKey) { // TAB

                this.setFocus('score-card-main-panel');
                event.preventDefault();
                //this.setTabIndex('score-card-title', 1499);
            }



        },
        _onScoreCardContainerKeydown: function _onScoreCardContainerKeydown(event) {

            event = (event) ? event : window.event;
            var charCode = (event.keyCode) ? event.keyCode : event.which;

            if (charCode === 9 && event.shiftKey) { // TAB

                this.setFocus('score-card-title');
                event.preventDefault();
                //this.setTabIndex('score-card-title', 1499);
            }
        },


        /**
        * Loads the score card template and generates the DOM for the score card.
        *
        * @method _generateScoreCard
        * @param miniGolfTemplates {Object} An object containing the pre-compiled handlebar templates for minigolf.
        * @private
        */
        _generateScoreCard: function () {
            var htmlFromTemplate,
                base64,
                $playerModalDiv = $('<div id="' + this.idPrefix + 'scorecard-modal-div-player" class="scorecard-modal-div-player">');
            this.$playerModalDiv = $playerModalDiv;
            $playerModalDiv.hide();

            htmlFromTemplate = MathInteractives.Interactivities.MiniGolf.templates['scoreCard']({ idPrefix: this.idPrefix }).trim();
            this.$el.html(htmlFromTemplate);
            this.player.$el.append($playerModalDiv);

            var base64 = this.getJson('baseURL');
            this.$('.score-card-title-icon').css({
                'background-image': 'url(' + base64.scorecardIcon + ')',
                'height': 17,
                'width': 19
            });

            this._addButtonsOnScoreCard();

            this._addScoreDOM();

            this._addCurrentScores();
        },
        /**
        * Adds close, back and clear data buttons on the score card.
        *
        * @method _addButtonsOnScoreCard
        * @private
        */
        _addButtonsOnScoreCard: function _addButtonsOnScoreCard() {
            var options;
            options = {
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                idPrefix: this.idPrefix,
                data: {
                    'id': this.idPrefix + 'score-card-back-button',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    'text': this.getMessage('scorecard-back-btn', 0),
                    'textColor': '#FFFFFF',
                    'borderRadius': 3,
                    'width': 105,
                    'icon': {
                        'faClass': this.getFontAwesomeClass('arrow-left'),
                        'fontWeight': 'normal',
                        'fontSize': 18,
                        'fontColor': '#FFFFFF',
                        'height': 18,
                        'width': 25
                    },
                    'textPosition': 'right'
                }
            };
            this.scoreCardBackBtn = MathInteractives.global.Theme2.Button.generateButton(options);

            options.data = {
                'id': this.idPrefix + 'score-card-clear-button',
                'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                'text': this.getMessage('clear-scorecard-btn', 0),
                'width': 152,
                'height': 38,
                'textColor': '#FFFFFF',
                'borderRadius': 3,
                'icon': {
                    'faClass': this.getFontAwesomeClass('trash'),
                    'fontWeight': 'normal',
                    'fontSize': 18,
                    'fontColor': '#FFFFFF',
                    'height': 18,
                    'width': 25
                },
                'textPosition': 'right'
            };
            this.clearScoreDataBtn = MathInteractives.global.Theme2.Button.generateButton(options);

            options.data = {
                'id': this.idPrefix + 'score-card-close-button',
                'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                'height': 18,
                'width': 15,
                'icon': {
                    'faClass': this.getFontAwesomeClass('close'),
                    'fontWeight': 'bold',
                    'fontSize': 18,
                    'fontColor': '#4c1787'
                },
                'baseClass': 'score-card-close-button',
                'tooltipText': this.getMessage('score-card-close-btn-text', 0),
                tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE
            };
            this.closeScoreCardBtn = MathInteractives.global.Theme2.Button.generateButton(options);
        },

        /**
        * Shows/displays the score card container DIV.
        *
        * @method closeScoreCard
        */
        showScoreCard: function showScoreCard() {
            this.player.enableHelp(false);
            this._addCurrentScores();
            this.$el.show();
            this.$playerModalDiv.show();
            this.model.set('scoreCardVisible', true);
            this.enableAllHelpElements(false);
            this.updateFocusRect('score-card-title');
            this.updateFocusRect('score-card-main-panel');
            this.setFocus('score-card-title');
        },

        /**
        * Hides the score card container DIV.
        *
        * @method closeScoreCard
        */
        closeScoreCard: function closeScoreCard() {
            this.player.enableHelp(true);
            this.$el.hide();
            this.$playerModalDiv.hide();
            this.model.set('scoreCardVisible', false);
            this.enableAllHelpElements(true);
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.SCORECARD_CLOSED);
        },

        /**
        * Generates a pop-up warning the user that proceeding would clear all games' data.
        *
        * @method _onClearAllDataBtnClick
        * @private
        */
        _onClearAllDataBtnClick: function _onClearAllDataBtnClick() {
            var options = {
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                containsTts: true,
                title: this.getMessage('clear-scorecard-pop-up-text', 'title'),
                accTitle: this.getAccMessage('clear-scorecard-pop-up-text', 'title'),
                text: this.getMessage('clear-scorecard-pop-up-text', 'body-text'),
                accText: this.getAccMessage('clear-scorecard-pop-up-text', 'body-text'),
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                bodyTextColorClass: 'custom-popup-class',
                buttons: [
                    {
                        id: 'okay-button',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        text: this.getMessage('clear-scorecard-pop-up-text', 'okay-btn'),
                        response: { isPositive: true, buttonClicked: 'okay-button' }
                    },
                    {
                        id: 'cancel-button',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        text: this.getMessage('clear-scorecard-pop-up-text', 'cancel-btn'),
                        response: { isPositive: false, buttonClicked: 'cancel-button' }
                    }
                ],
                closeCallback: {
                    fnc: function (response) {
                        if (response.isPositive === true) {
                            this.clearAllData();
                            this.disableClearButton();
                            console.log('TODO: reset score card acc text');
                            this.setFocus('score-card-main-panel');
                        }
                        else {
                            this.setFocus('score-card-clear-button');
                        }
                    },
                    scope: this
                }
            };
            MathInteractives.global.Theme2.PopUpBox.createPopup(options);
        },

        /**
        * Disables the clear button and also updates the boolean flag in the model.
        *
        * @method disableClearButton
        */
        disableClearButton: function disableClearButton() {
            var ButtonClass = MathInteractives.global.Theme2.Button;
            this.clearScoreDataBtn.setButtonState(ButtonClass.BUTTON_STATE_DISABLED);
            this.model.set('clearScoreCard', false);
        },

        /**
        * Clears all course' data, updates the score-card and triggers an event to clear course views
        *
        * @method clearAllData
        */
        clearAllData: function clearAllData() {
            this.clearScores();
            this._lockAllCourses();
            this._addCurrentScores();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.SCORECARD_CLEARED);
        },

        _lockAllCourses: function _lockAllCourses() {
            var index,
                courseModel = this.model.get('courses'),
                length = courseModel.length,
                modelClass = MathInteractives.Interactivities.MiniGolf.Models.Course.COURSE_TYPE;

            courseModel[0].set('state', modelClass.TYPE_2);
            for (index = 1; index < length; index++) {
                courseModel[index].set('state', modelClass.TYPE_3);
            }
        },
        /**
        * Clears the data from the model pertaining to scores
        *
        * @method clearScores
        */
        clearScores: function clearScores() {
            var courseModel = this.model.get('courses'),
                length = courseModel.length,
                index;

            for (index = 0; index < length; index++) {
                courseModel[index].set('timesPlayed', 0);
                courseModel[index].set('holesInOne', 0);
            }
        },

        /**
        * Prepares the DOM for course details to be shown in the score card.
        *
        * @method _addScoreDOM
        * @private
        */
        _addScoreDOM: function _addScoreDOM() {
            var index,
                htmlFromTemplate,
                $scoreCardLevelDetailsHolder = this.$('.score-card-levels-holder'),
                courseModel = this.model.get('courses'),
                length = courseModel.length;

            for (index = 0; index < length; index++) {
                htmlFromTemplate = MathInteractives.Interactivities.MiniGolf.templates.courseScoreCard({
                    idPrefix: this.idPrefix,
                    courseNumber: index
                }).trim();
                $scoreCardLevelDetailsHolder.append(htmlFromTemplate);

                if (index != 0) {
                    this.$('.course-' + index + '-lock-symbol').addClass(this.getFontAwesomeClass('lock'));
                    this.$('.course-' + index + '-unlocked').hide();
                }
            }
            this.$('.course-0-locked').hide();
            this.$('.course-trophy-holder')
                    .css({ 'background-image': 'url(' + this.getImagePath('sprites') + ')' })
                    .addClass('locked-trophy');
        },

        /**
        * Inserts user related data, like times playes and holes-in-one onto the scorecard
        *
        * @method _addCurrentScores
        * @private
        */
        _addCurrentScores: function _addCurrentScores() {
            var courseModels = this.model.get('courses'),
                length = courseModels.length,
                course, locked, courseName,
                scoreCardMainPanelAccId = 'score-card-main-panel',
                titleText = this.getAccMessage('score-card-title', 0),
                mainText = '',
                index, timesPlayed, holesInOne;

            if (this.model.get('clearScoreCard')) {
                this.enableClearButton();
                titleText += this.getAccMessage('score-card-title', 'clear-btn');
            }
            else {
                this.disableClearButton();
            }
            titleText += this.getAccMessage('score-card-title', 'close-btn');

            this.setAccMessage('score-card-title', titleText);

            for (index = 0; index < length; index++) {
                course = courseModels[index];
                locked = course.get('state') === MathInteractives.Interactivities.MiniGolf.Models.Course.COURSE_TYPE.TYPE_3;
                timesPlayed = course.get('timesPlayed') || 0;
                holesInOne = course.get('holesInOne') || 0;

                this._appendText(this.$('.course-' + index + '-play-count'), timesPlayed);
                this._appendText(this.$('.course-' + index + '-hole-in-1-count'), holesInOne);

                this._addState(courseModels, index);

                courseName = this.getAccMessage('course-' + index + '-title', 0);
                if (locked) {
                    mainText += this.getAccMessage(scoreCardMainPanelAccId, 'locked-course', [index + 1, courseName]);
                }
                else {
                    mainText += this.getAccMessage(scoreCardMainPanelAccId, 'unlocked-course',
                        [index + 1, courseName, timesPlayed, holesInOne]);
                }
            }
            mainText += this.getAccMessage(scoreCardMainPanelAccId, 'end');
            this.setAccMessage(scoreCardMainPanelAccId, mainText);
        },

        /**
        * Checks the state of the course and adds the trophy if true
        *
        * @method _addState
        * @param $courseModel {Array} The array of course models
        * @param index {Number} The course index in the loop
        * @private
        */
        _addState: function _addState(courseModel, index) {
            var modelClass = MathInteractives.Interactivities.MiniGolf.Models.Course.COURSE_TYPE;

            if (courseModel[index].get('state') === modelClass.TYPE_1) {
                this.$('.course-' + index + '-trophy-holder').removeClass('locked-trophy');
                this.$('.course-' + index + '-locked').hide();
                this.$('.course-' + index + '-unlocked').show();
            }
            else if (courseModel[index].get('state') === modelClass.TYPE_2) {
                this.$('.course-' + index + '-trophy-holder').addClass('locked-trophy');
                this.$('.course-' + index + '-locked').hide();
                this.$('.course-' + index + '-unlocked').show();
            }
            else if (courseModel[index].get('state') === modelClass.TYPE_3) {
                this.$('.course-' + index + '-trophy-holder').addClass('locked-trophy');
                this.$('.course-' + index + '-locked').show();
                this.$('.course-' + index + '-unlocked').hide();
            }
        },

        /**
        * Enables the clear button and also updates the boolean flag in the model.
        *
        * @method enableClearButton
        */
        enableClearButton: function enableClearButton() {
            var ButtonClass = MathInteractives.global.Theme2.Button;
            this.clearScoreDataBtn.setButtonState(ButtonClass.BUTTON_STATE_ACTIVE);

        },

        /**
        * Inserts user the given data into the container
        *
        * @method _appendText
        * @param $container {Object} The DOM element to which the data is supposed to be appended
        * @param data {String} The data to be appended
        * @private
        */
        _appendText: function _appendText($container, data) {
            $container.text(data);
        },

        enableAllHelpElements: function (enable) {
            var player = this.player,
                count = 0,
                currentCanvasHolder = null;

            player.enableHelpElement('canvas-holder-0', '0', enable);


            for (count = 0; count < 4; count++) {
                currentCanvasHolder = 'canvas-holder-' + count;

                player.enableHelpElement(currentCanvasHolder, 'mat-ball', enable);
                player.enableHelpElement(currentCanvasHolder, 'start-ball', enable);
                player.enableHelpElement(currentCanvasHolder, 'sticky-slider', enable);
                player.enableHelpElement(currentCanvasHolder, 'destination-ball', enable);
                player.enableHelpElement(currentCanvasHolder, 'hole', enable);
                if (count > 0) {
                    player.enableHelpElement('obstacles-holder-' + count, 'holder', enable);
                    player.enableHelpElement('obstacles-holder-' + count, 'placed-obstacle', enable);
                    player.enableHelpElement('obstacles-holder-' + count, 'multiple-obstacles', enable);
                    if (count === 3) {

                        player.enableHelpElement(currentCanvasHolder, 'bridge', enable);
                        player.enableHelpElement(currentCanvasHolder, 'bridge-wall', enable);
                        player.enableHelpElement(currentCanvasHolder, 'bridge-movement', enable);
                    }
                }

                player.enableHelpElement('course-score-card-btn-' + count, '0', enable);
                player.enableHelpElement('direction-text-' + count + '-direction-text-buttonholder', '0', enable);
            }

            player.enableHelpElement('canvas-holder-1', '0', enable);
            player.enableHelpElement('canvas-holder-2', '0', enable);
            player.enableHelpElement('canvas-holder-3', '0', enable);
            player.enableHelpElement('canvas-holder-3', '1', enable);

            player.enableHelpElement('reset-course-btn-holder-0', '0', enable);
            player.enableHelpElement('reset-course-btn-holder-1', '0', enable);
            player.enableHelpElement('reset-course-btn-holder-2', '0', enable);
            player.enableHelpElement('reset-course-btn-holder-3', '0', enable);

            player.enableHelpElement('obstacles-holder-0', '0', enable);
            player.enableHelpElement('obstacles-holder-1', '0', enable);
            player.enableHelpElement('obstacles-holder-2', '0', enable);
            player.enableHelpElement('obstacles-holder-3', '0', enable);

            player.enableHelpElement('carousel-view', '0', enable);
            player.enableHelpElement('carousel-page-score-card-btn-holder', '0', enable);

            //disable new help elements
            player.enableHelpElement('carousel-view', '0', enable);

        }
    }, {});
})();