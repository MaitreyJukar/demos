
(function () {
    'use strict';

    /**
    * View for rendering badges for correct and incorrect values
    *
    * @class Badge
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.Badge = MathInteractives.Common.Player.Views.Base.extend({

        /*
        * Stores background position as per height
        * @property _containerType
        * @default null
        * @type {String}
        * @private
        */
        _containerType: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property _path
        * @type Object
        * @default null
        */
        _path: null,

        /**
        * Holds the reference to manager for accessibility
        *
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * contains accId of the element used as container for badges.
        *
        * @property _accId
        * @type String
        * @default null
        */
        _accId: null,

        /**
        * Initializes properties and calls render
        *
        * @method initialize
        **/
        initialize: function initialize() {
            this._path = this.model.get('path');
            this.manager = this.model.get('manager');
            this._containerType = this.model.get('type');
            this._accId = this.$el.attr('id');

            this.render();
        },

        /**
        * Renders badge
        *
        * @method render
        **/
        render: function render() {
            var borderThickness = MathInteractives.Common.Components.Views.Badge.BADGE_BORDER_THICKNESS,
                $el = this.$el;

            switch (this._containerType) {
                case MathInteractives.Common.Components.Views.Badge.TYPES.TEXT_BOX:
                    var textId = this.model.get('textId');

                    if (typeof textId !== 'undefined') {
                        $('<input/>', {
                            id: textId,
                            class: textId + " " + "feedback-badges-textbox"
                        }).appendTo($el);
                    }

                    var $inputText = this.$('#' + textId);

                    $el.append('<div id="badge-input-modal" class="badge-input-modal"></div>');
                    this.$('.badge-input-modal').css({
                        'width': $inputText.width() + borderThickness + 'px',
                        'height': $inputText.height() + borderThickness + 'px',
                        'left': '0px',
                        'top': -$el.height() + 'px'
                    }).hide();
                    $el.css({ 'border': borderThickness + 'px solid transparent', 'border-radius': '6px' })
                        .on('keydown', function () {
                            if (event.keyCode === 13) {
                                $(this).find('input').focus();
                            }
                        });
                    break;

                case MathInteractives.Common.Components.Views.Badge.TYPES.MESSAGE:
                    var messageText = this.model.get('messageText');
                    $el.html('<span class="feedback-message">' + messageText + '</span>');
                    $el.find('.feedback-message').css({
                        'padding': '5px',
                        'border': borderThickness + 'px solid transparent',
                        'border-radius': '6px'
                    });
                    break;

                case MathInteractives.Common.Components.Views.Badge.TYPES.SCORE_BOX:
                    var textId = this.model.get('textId');

                    if (typeof textId !== 'undefined') {
                        $('<input/>', {
                            id: textId,
                            class: textId + " " + "score-badges-textbox"
                        }).appendTo($el);
                    }
                    $el.css({ 'border': borderThickness + 'px solid transparent', 'border-radius': '6px' })
                        .on('keydown', function (event) {
                            if (event.keyCode === 13) {
                                $(this).find('input').focus();
                            }
                        });

                    break;
                default:
                    //return;

            }


        },

        /*
        * Marks the element of view as Right/Wrong with css
        *
        * @method markBadgeCorrect
        * @param {Boolean} isCorrect to decide right/wrong badge mark
        * @param {Boolean} isHint to change incorrect image into hint image
        */
        markBadge: function markBadge(badgeType, isHint) {
            var Badge, BADGE_TYPE, $el, $badgeImg,
                contWidth, contHeight, badgeMargin, currentBadgeClass, BADGE_CLASS,
                $el = this.$el;

            $badgeImg = this.$('.badge-image');

            Badge = MathInteractives.Common.Components.Views.Badge;

            BADGE_TYPE = Badge.BADGE_TYPE;
            BADGE_CLASS = Badge.BADGE_CLASS;

            // create badge if not created
            if ($badgeImg.length === 0) {
                $('<div/>').addClass('badge-image').appendTo($el);
                $badgeImg = this.$('.badge-image');

                contWidth = $el.width(),
                contHeight = $el.height(),
				badgeMargin = $badgeImg.position().top - $el.position().top;

                $badgeImg.css({
                    'background-image': 'url("' + this._path.getImagePath('player-lr') + '")',
                    'background-position': '734px 0',
                    'left': contWidth - ($badgeImg.width() / 2) + 'px',
                    'top': -($badgeImg.height() / 2) + 'px'
                });
            }

            $badgeImg.show();

            if (this._containerType === Badge.TYPES.TEXT_BOX) {
                this.$('.badge-input-modal').show();
            }

            switch (badgeType) {
                case BADGE_TYPE.CORRECT_RESPONSE:
                    $el.css({ 'border-color': '#749718' });
                    $el.find('input').attr('disabled', true);
                    $badgeImg.css({
                        'background-position': '-33px -290px'
                    });
                    currentBadgeClass = BADGE_CLASS.CORRECT;
                    if (typeof this.manager !== 'undefined' && this.manager !== null) {
                        this.manager.changeAccMessage(this._accId, 'correct');
                    }
                    break;

                case BADGE_TYPE.INCORRECT_RESPONSE:
                    $el.css({ 'border-color': '#CF1D78' });
                    //$el.find('input').attr('disabled', true);
                    $badgeImg.css({ 'background-position': '-33px -326px' });
                    currentBadgeClass = BADGE_CLASS.INCORRECT;
                    if (typeof this.manager !== 'undefined' && this.manager !== null) {
                        this.manager.changeAccMessage(this._accId, 'incorrect');
                    }
                    break;

                case BADGE_TYPE.FEEDBACK:
                    $el.css({ 'border-color': 'transparent' });
                    //$el.find('input').attr('disabled', true);
                    $badgeImg.css({
                        'background-position': '-0px -1444px'
                    });
                    currentBadgeClass = BADGE_CLASS.FEEDBACK;
                    if (typeof this.manager !== 'undefined' && this.manager !== null) {
                        this.manager.changeAccMessage(this._accId, 'feedback');
                    }
                    break;

                case BADGE_TYPE.INCORRECT_RESPONSE_AND_HINT:
                    break;

            }

            this._setCurrentClassResponse(currentBadgeClass);
        },
        _setCurrentClassResponse: function (currentBadgeClass) {
            var BADGE_CLASS = MathInteractives.Common.Components.Views.Badge.BADGE_CLASS,
                $el = this.$el;

            this._removeBadgeClass($el, BADGE_CLASS);

            $el.addClass(currentBadgeClass);
        },
        _removeBadgeClass: function ($el, BADGE_CLASS) {
            if ($el.hasClass(BADGE_CLASS.CORRECT)) {
                $el.removeClass(BADGE_CLASS.CORRECT);
            }
            if ($el.hasClass(BADGE_CLASS.INCORRECT)) {
                $el.removeClass(BADGE_CLASS.INCORRECT);
            }
            if ($el.hasClass(BADGE_CLASS.FEEDBACK)) {
                $el.removeClass(BADGE_CLASS.FEEDBACK);
            }
            if ($el.hasClass(BADGE_CLASS.INCORRECT_RESPONSE_AND_HINT)) {
                $el.removeClass(BADGE_CLASS.INCORRECT_RESPONSE_AND_HINT);
            }
        },
        revertBadge: function () {
            var $el = this.$el,
                $badgeImg = this.$('.badge-image');

            $el.css({ 'border-color': 'transparent' });
            $el.find('input').attr('disabled', false);
            $badgeImg.hide();

            var BADGE_CLASS = MathInteractives.Common.Components.Views.Badge.BADGE_CLASS;
            this._removeBadgeClass($el, BADGE_CLASS);

            if (this._containerType === MathInteractives.Common.Components.Views.Badge.TYPES.TEXT_BOX) {
                this.$('.badge-input-modal').hide();
            }
            if (typeof this.manager !== 'undefined' && this.manager !== null) {
                this.manager.changeAccMessage(this._accId, 0);
            }
        },
        returnText: function (type) {
            var $el = this.$el,
                BadgeClass = MathInteractives.Common.Components.Views.Badge,
                TYPES = BadgeClass.TYPES,
                text = null;

            switch (type) {
                case TYPES.TEXT_BOX:
                case TYPES.SCORE_BOX: {

                    text = $el.find('input').val();
                    break;
                }

                case TYPES.MESSAGE:

                    text = $el.text();
                    break;

            }
            return text;
        }
    },
    {
        /**
        * Types of container string
        *
        * @static
        **/
        TYPES: {
            TEXT_BOX: 'textBox',
            MESSAGE: 'message',
            SCORE_BOX: 'scoreBox'
        },

        /*
        * ENUM for specifying badge types
        * @property BADGE_TYPE
        * @type Object
        * @static
        * @final
        */
        BADGE_TYPE: {
            CORRECT_RESPONSE: 0,
            INCORRECT_RESPONSE: 1,
            FEEDBACK: 2,
            INCORRECT_RESPONSE_AND_HINT: 3
        },

        /*
        * border thickness of badges.
        * @property BADGE_BORDER_THICKNESS
        * @type Number
        * @static
        */
        BADGE_BORDER_THICKNESS: 3,

        /*
        * Class String for specifying badge class responses
        * @property BADGE_CLASS
        * @type Object
        * @static
        * @final
        */
        BADGE_CLASS: {
            CORRECT: 'badge-correct',
            INCORRECT: 'badge-incorrect',
            FEEDBACK: 'badge-feedback',
            INCORRECT_RESPONSE_AND_HINT: 'badge-response-hint'
        },

        /*
        * to generate badge as per the given requirement
        * @method generateBadge
        * @param {object} badgeProps
        */
        generateBadge: function generateBadge(badgeProps) {
            var containerID;
            if (typeof badgeProps !== 'undefined') {
                containerID = '#' + badgeProps.containerId;
                var badgeModel = new MathInteractives.Common.Components.Models.Badge(badgeProps);
                var badgeView = new MathInteractives.Common.Components.Views.Badge({ el: containerID, model: badgeModel });

                return badgeView;
            }
        }
    });


    MathInteractives.global.Badge = MathInteractives.Common.Components.Views.Badge;
})();