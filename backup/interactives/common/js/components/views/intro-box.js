(function () {
    'use strict';

    /**
    * View for Intro Box
    *
    * @class IntroBox
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.IntroBox = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Stores manager instance
        * @property manager
        * @default null
        **/
        manager: null,

        /**
        * Stores player instance
        * @property player
        * @default null
        **/
        player: null,

        /**
        * interactivity id prefix 
        * @property idPrefix
        * @default null
        **/
        idPrefix: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property _path
        * @type Object
        * @default null
        **/
        _path: null,

        /**
        * Calls render function
        *
        * @method initialize
        **/
        initialize: function () {
            var model = this.model,
                screenId = model.get('screenId');
            this.manager = model.get('manager');
            this.player = model.get('player');
            this.idPrefix = model.get('idPrefix');
            this._path = model.get('path');
            this.render();
            if (typeof screenId !== 'undefined') {
                this.unloadScreen(screenId);
                this.loadScreen(screenId);
            }
        },

        /**
        * Renders the introduction box
        *
        * @method render
        **/

        render: function () {
            this._renderTexts();
            //            this.positionTexts();
            this._renderButtons();
            this._positionButtons();
            this._setIntroBoxDimensions();

            //replace their DOM div with its inner contents (i.e : our html)
            this.$el.replaceWith(function() {
                return $( this ).contents();
            });
        },

        /**
        * Renders the title and intro text.
        *
        * @method _renderTexts
        * @private
        **/
        _renderTexts: function () {
            var title, text;
            title = this.model.get('title');
            text = this.model.get('text');
            if (title === null && text === null) {
                return;
            }
            this.$el.append(MathInteractives.Common.Components.templates.introBox({
                'title': title,
                'text': text,
                idPrefix: this.idPrefix
            }).trim());
        },

        /**
        * Sets intro box height , width
        * 
        * @method _setIntroBoxDimensions  
        * @private   
        **/
        _setIntroBoxDimensions: function () {
            var introBoxWidthPadding,
                introBoxHeightPadding,
                $introBox = this.$('#' + this.idPrefix + 'intro-box');
            introBoxWidthPadding = ($introBox.innerWidth() - $introBox.width()) / 2;
            introBoxHeightPadding = ($introBox.innerHeight() - $introBox.height()) / 2;
            $introBox.height(this.$el.height() - introBoxHeightPadding * 2);
            $introBox.width(this.$el.width() - introBoxWidthPadding * 2);
        },



        /**
        * Renders user specified buttons
        * 
        * @method _renderButtons  
        * @private
        **/
        _renderButtons: function () {
            var obj, idPrefix = this.idPrefix, view, $btnContainer, buttons, buttonsLength, btnDiv;
            obj = {
                containerId: idPrefix + 'intro-box-tts-container',
                messagesToPlay: [idPrefix + 'intro-box-text'],
                path: this._path,
                player: this.player,
                manager: this.manager,
                idPrefix : this.idPrefix
            };
            view = MathInteractives.global.PlayerTTS.generateTTS(obj);
            $btnContainer = this.$('#' + idPrefix + 'intro-btns-container');
            buttons = this.model.get('buttons');
            buttonsLength = buttons.length;

            for (var i = 0; i < buttonsLength; i++) {
                btnDiv = $('<div>', {
                    id: idPrefix + buttons[i].id,
                    class: 'intro-box-btn'
                });
                $btnContainer.append(btnDiv);
                obj = {
                    id: idPrefix + buttons[i].id,
                    type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,
                    width: buttons[i].width,
                    text: buttons[i].text,
                    path: this._path
                };

                MathInteractives.global.Button.generateButton(obj);
                btnDiv.bind('click', { currentButton: buttons[i] }, $.proxy(this._bottomBtnClickHandler, this));
            }
        },

        /**
        * positions buttons container
        * 
        * @method _positionButtons   
        * @private 
        **/
        _positionButtons: function () {
            var btnOffsetTop,
                btnOffsetLeft,
                btnMarginFromBox = 20,
                elOffset = this.$el.offset(),
                $introBtnsContainer = this.$('#' + this.idPrefix + 'intro-btns-container');

            btnOffsetTop = elOffset.top + this.$el.height() - $introBtnsContainer.height() - btnMarginFromBox;
            btnOffsetLeft = elOffset.left + this.$el.width() - $introBtnsContainer.width() - btnMarginFromBox;
            $introBtnsContainer.offset({ 'top': btnOffsetTop, 'left': btnOffsetLeft });
        },

        /**
        * binds callback on click of button
        * 
        * @method _bottomBtnClickHandler    
        **/
        _bottomBtnClickHandler: function (event) {
            var currentButton = event.data.currentButton;
            MathInteractives.global.SpeechStream.stopReading();
            /*Apply click call back for particular button*/
            if (currentButton.clickCallBack) {
                currentButton.clickCallBack.fnc.apply(currentButton.clickCallBack.scope || this, [event]);
            }
        },

    }, {
        /**
        * generates introduction box
        * 
        * @method generate    
        * @static
        * @param options {Object} The initial properties of the model : id , title , text , acctitle , acctext , buttons
        * @param options.id {String} DOM element id
        * @param options.title {String} title of intro box
        * @param options.text {String} text of intro box
        * @param options.accTitle {String} acc of title of intro box
        * @param options.accText {String} acc of text of intro box
        * @param options.buttons {Array} array of objects each object represents 1 btn and is of the structure :
                                          {
                                              id: "btn-id",
                                              type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,
                                              text: "some text",
                                              clickCallBack: { fnc: functionName, scope: scopeOfFunction }
                                          }
        * @return {Object} contains View of introBox
        **/
        generate: function (options) {
            if (options.id === null) {
                console.log('No id specified');
                return;
            }

            var introModel, introView, id = '#' + options.id;
            introModel = new MathInteractives.Common.Components.Models.IntroBox(options);
            introView = new MathInteractives.Common.Components.Views.IntroBox({ el: id, model: introModel });

            return introView;
        }

    })
    MathInteractives.global.IntroBox = MathInteractives.Common.Components.Views.IntroBox;
})();
