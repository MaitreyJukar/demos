//var $target=null; uncomment this to test on various elements
(function () {
    if (MathInteractives.Common.Player.Views.DefinitionBox) {
        return;
    }
    'use strict';

    /**
    * View for rendering Definition Box
    *
    * @class DefinitionBox
    * @constructor
    * @extends Backbone.View
    * @namespace MathInteractives.Common.Player.Views
    **/
    MathInteractives.Common.Player.Views.DefinitionBox = Backbone.View.extend({

        /*
        * Stores the callback function data set by user on close of definition box
        * @property _closeCallback
        * @type {object}
        * @private
        * @default null
        */
        _closeCallback: null,

        /*
        * Stores the callback function data set by user on show of definition box
        * @property _closeCallback
        * @type {object}
        * @private
        * @default null
        */
        _showCallback: null,
        /*
        * Stores manager instance
        * @property _manager
        * @default null
        */
        _manager: null,
        /*
        * Stores player instance
        * @property _player
        * @default null
        */
        _player: null,

        /*
        * ID to prefix before all id used
        * @property _idPrefix
        * @type string
        * @default null
        */
        _idPrefix: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property path
        * @type Object
        * @default null
        */
        path: null,

        /**
        * Calls render function
        *
        * @method initialize
        **/

        initialize: function () {
            this.path = this.model.get('path');
            this._player = this.model.get('player');
            var $player = this._player.$el;
            this._idPrefix = this._player.getIDPrefix();
            this.render();
            this._closeCallback = this.model.get('closeCallback');
            this._showCallback = this.model.get('showCallback');
            this._manager = this.model.get('manager');

            var accTitle = this.model.get('accTitle'),
                accContent = this.model.get('accContent');

            //Player event propagation stopped on definition box
            this.$el.off('mousedown.definitionBox touchstart.definitionBox').on('mousedown.definitionBox touchstart.definitionBox', function (event) { event.stopPropagation(); });
            //removed the definition box on clicking outside the box
            $player.off('mousedown.definitionBox touchstart.definitionBox').on('mousedown.definitionBox touchstart.definitionBox', $.proxy(this._closeDefinitionBox, this));

            if (this._showCallback) {
                this._showCallback.fnc.apply(this._showCallback.scope || this);
            }

            var obj = {
                id: this._idPrefix + 'hint-box-close-button',
                text: 'CLOSE<span class="text">X</span>',
                isCustomButton: true,
                imagePathIds: [
                        'purple-button-definition-box',
                        'purple-button-definition-box-mid'
                ],
                width: 88,
                height: 33,
                path: this.path
            },
                btnView = MathInteractives.global.Button.generateButton(obj),

                obj = { containerId: this._idPrefix + 'hint-box-tts-container', messagesToPlay: [this._idPrefix + 'hint-box-content'], path: this.path, player: this._player, idPrefix: this._idPrefix, manager: this._manager },
                view = MathInteractives.global.PlayerTTS.generateTTS(obj),
                left = $(this.$el.children()[0]).width() - 15 - this.$el.find('.hint-box-close-button').width();

            //                left = $(this.$el.children()[0]).width() - 15 - this.$('.hint-box-close-button').width();

            var callerId = this.model.attributes.eventTarget.id;
            this.$('#' + this._player.getIDPrefix() + 'hint-box-title').bind('keydown', $.proxy(function (e) {
                if (e.keyCode === 9 && e.shiftKey) {
                    e.preventDefault();
                    $('.hint-box-close-button').trigger('click');
                    this._manager.setFocus(callerId);
                }
            }, this));

            this.$('#' + this._player.getIDPrefix() + 'hint-box-close-button').bind('keydown', $.proxy(function (e) {
                if (e.target.parentNode !== e.currentTarget) {
                    return true;
                }

                if (e.keyCode === 9 && !e.shiftKey) {
                    e.stopPropagation();
                    e.preventDefault();
                    $('.hint-box-close-button').trigger('click');
                    this._manager.setFocus(callerId);
                }
            }, this));

            $player.find('.hint-box-text-container').css('width', $(this.$el.children()[0]).width() - 30 + 'px');
            $player.find('.hint-box-header-buttons').css('left', (left - 49) + 'px');
            //$player.find('.hint-box-close-button').css('left', left + 'px');
            //$player.find('.hint-box-tts-container').css('left', (left - 49) + 'px');

            //$('#hint-box-header-pause-container').css('left', (left - 49) + 'px');

            this._manager.loadScreen('definition-pop-up', this._idPrefix);
            this._manager.restrictAccDivSize(this._idPrefix + 'hint-box-close-button');
            this._manager.restrictAccDivSize(this._idPrefix + 'hint-box-tts-container');
            //            if (title.trim() === "") {
            //                this._manager.enableTab(this._idPrefix + 'hint-box-title', false);
            //            }
            //            else {
            //                this._manager.enableTab(this._idPrefix + 'hint-box-title', true);
            //            }
            if (accTitle) {
                this._manager.setAccMessage(this._idPrefix + 'hint-box-title', accTitle);
            }
            if (accContent) {
                this._manager.setAccMessage(this._idPrefix + 'hint-box-content', accContent);
            }
            this._manager.setFocus(this._idPrefix + 'hint-box-title');
        },


        events: {
            'click .hint-box-close-button': '_closeDefinitionBox'
        },

        /**
        * Renders the definition box
        *
        * @method render
        **/
        render: function () {
            var title = this.model.get('title');
            var content = this.model.get('content');
            var width = this.model.get('width');
            var $player = this._player.$el;

            this.$el.append(MathInteractives.Common.Player.templates.definitionBox({
                definitionBoxTitle: title, definitionBoxContent: content,
                idPrefix: this._idPrefix
            }).trim());
            $player.find('.hint-box-container').remove();
            $player.append(this.el);
            this.$el.attr('id', this._idPrefix + 'hint-box-container').addClass('hint-box-outer-container');

            this.$el.css('width', width + 'px');
            $(this.$el.children()[0]).css('width', width + 'px');

            this._positionElement();
            return this;
        },


        /**
        * Positions Definition Box near the element that triggered the call.
        *
        * @method _positionElement
        **/
        _positionElement: function () {
            var elementPosition, playerWidth, playerHeight, $player, playerOffsetLeft, playerOffsetTop, playerOffset, definitionBoxWidth,
            definitionBoxHeight, targetTop, targetLeft, targetHeight, targetWidth, targetOffsets, self_height, self_width;

            var $target = $(this.model.get('eventTarget'));
            targetOffsets = $target.offset();
            targetTop = targetOffsets.top;
            targetLeft = targetOffsets.left;
            targetHeight = $target.height();
            targetWidth = $target.width();
            definitionBoxHeight = this.$el.children().outerHeight();
            definitionBoxWidth = this.$el.children().outerWidth();
            $player = this._player.$el;
            playerOffset = $player.offset();
            playerOffsetTop = playerOffset.top;
            playerOffsetLeft = playerOffset.left;
            playerHeight = $player.height() - definitionBoxHeight;
            playerWidth = $player.width();
            elementPosition = { top: 0, left: 0 }; //definition box position 


            //align center of definition box with center of target (vertical center)
            elementPosition.top = targetTop + (targetHeight / 2) - (definitionBoxHeight / 2);

            //if definition box is ABOVE player then align bottom of def. Box with bottom of target
            if (elementPosition.top < playerOffsetTop) {
                elementPosition.top = targetTop;
            }

            //if definition box is BELOW player then align top of def. Box with top of  target
            else if ((elementPosition.top + definitionBoxHeight) > (playerOffsetTop + playerHeight)) {
                elementPosition.top = targetTop + targetHeight - definitionBoxHeight;
            }

            //default : position def. Box to right of target 
            elementPosition.left = targetLeft + targetWidth + 5;

            //if definition box goes out of player's RIGHT : position def. Box to left of target 
            if ((targetLeft + targetWidth + definitionBoxWidth + 10) > (playerOffsetLeft + playerWidth)) {
                elementPosition.left = targetLeft - definitionBoxWidth - 5;
            }

            //if definition box goes out of player's LEFT : position def. Box to right of target 
            else if ((targetLeft - definitionBoxWidth - 10) < (playerOffsetLeft)) {
                elementPosition.left = targetLeft + targetWidth + 5;
            }
            this.$el.css({ 'position': 'absolute' });
            this.$el.offset(elementPosition);
        }
    ,

        /**
        * Removes definition box on clicking 
        *
        * @method _closeDefinitionBox
        **/
        _closeDefinitionBox: function () {
            var $player = this._player.$el;
            $player.off('mousedown.definitionBox touchstart.definitionBox');
            MathInteractives.global.SpeechStream.stopReading();
            var $definitionBox = $player.find('#' + this._idPrefix + 'hint-box-container');
            if ($definitionBox.length > 0) {
                $player.find('#' + this._idPrefix + 'hint-box-container').remove();
            }
            var callerId = this.model.get('eventTarget').id;
            this._manager.setFocus(callerId);
            if (this._closeCallback) {
                this._closeCallback.fnc.apply(this._closeCallback.scope || this, []);
            }

        }

    }, {

        createDefinitionBox: function (options) {
            if (options) {
                var definitionBox = new MathInteractives.Common.Player.Models.DefinitionBox(options);
                var definitionBoxView = new MathInteractives.global.PlayerDefinitionBox({ model: definitionBox });

                return definitionBoxView;
            }
        }

    });

    MathInteractives.global.PlayerDefinitionBox = MathInteractives.Common.Player.Views.DefinitionBox;

} ())