
(function () {
    'use strict';

    /**
    * View for rendering DirectionText box and its related events
    *
    * @class DirectionText
    * @constructor
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.DirectionText = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Holds the interactivity player reference
        * @property player
        * @default null
        * @private
        */
        player: null,

        /**
        * Holds the interactivity id prefix
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,
        /**
        * Holds the interactivity baseClass
        * @property baseclass
        * @default null
        * @private
        */
        baseClass: null,
        /**
        * Holds the interactivity manager reference
        * @property manager
        * @default null
        * @private
        */
        manager: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Holds the text of the direction text
        *
        * @property text
        * @type Object
        * @default null
        */
        text: null,
        /**
        * BackgroundColor
        * 
        * @property backgroundColor
        * @type String
        * @defaults null
        */

        backgroundColor: null,

        /**
        * textColor
        * 
        * @property textColor
        * @type String
        * @defaults null
        */
        textColor: null,

        /**
        * containerWidth
        * 
        * @property containerWidth
        * @type String
        * @defaults null
        */

        containerWidth: null,

        /**
        * containerHeight
        * 
        * @property containerHeight
        * @type String
        * @defaults null
        */

        containerHeight: null,
        /**
        * border color
        * 
        * @property borderColor
        * @type String
        * @defaults null
        */

        borderColor: null,

        /**
        * accText
        * 
        * @property accText
        * @type String
        * @default null
        */
        accText: null,
        /**
        * tts size of with margin
        * 
        * @property ttsSize
        * @type number
        * @defaults 25
        */
        ttsSize: 25,
        /**
        * sets the callback function of the button
        * 
        * @property clickCallback
        * @type Object
        * @default null
        */
        clickCallback: null,
        /**
        * It contain the containerId 
        * 
        * @property containerId
        * @type Object
        * @default null
        */
        containerId: null,

        /**
        * It contain the screenId
        * 
        * @property screenId
        * @type Object
        * @default null
        */
        screenId: null,

        /**
        * It contain the button Color Type
        * 
        * @property btnColorType
        * @type Object
        * @default null
        */
        btnColorType: null,

        /**
        * It contain the button Text Color
        * 
        * @property btnTextColor
        * @type Object
        * @default null
        */
        btnTextColor: null,

        /**
        * It contain the base class of button
        * 
        * @property btnBaseClass
        * @type String
        * @default undefined
        */
        btnBaseClass: undefined,


        /**
        * It contain the base class of tts button
        * 
        * @property ttsBaseClass
        * @type String
        * @default undefined
        */
        ttsBaseClass: undefined,


        /**
        * It contain the view of try another text button 
        *
        * @property tryAnotherView
        * @type Object
        * @default null
        */
        tryAnotherView: null,
        /**
        * It contain the view of tts 
        *
        * @property ttsView
        * @type Object
        * @default null
        */
        ttsView: null,

        /**
        * It contain the tabindex of hack div
        * 
        * @property tabIndex
        * @type Object
        * @default null
        */
        tabIndex: null,

        /**
        * It contain the padding of direction text
        * 
        * @property padding
        * @type Object
        * @default 10
        */
        padding: 10,

        /**
        * Fading duration when direction text is changed
        * 
        * @property fadeDuration
        * @type Number
        * @default 1000
        */
        fadeDuration: 600,

        /**
        * Boolean to Animate Direction Text when it is updated.
        * 
        * @property bAnimateDirectionText
        * @type Boolean
        * @default true
        */
        bAnimateDirectionText: true,
        /**
        * Holds the id of the el
        * 
        * @property $dirText 
        * @type id
        * @default null
        */
        $dirText: null,
        /**
       * Holds the width of the direction text
       * 
       * @property directionTextHolderWidth 
       * @type object
       * @default null
       */
        directionTextHolderWidth: null,

        /**
        * It contains type of button
        * 
        * @property buttonType
        * @type Object
        * @default null
        */
        buttonType: null,

        /**
        * It contains fa icon data for button
        * 
        * @property iconData
        * @type Object
        * @default null
        */
        iconData: null,

        /**
        * It contains text position in button
        * 
        * @property buttonTextPosition
        * @type String
        * @default null
        */
        buttonTextPosition: null,
        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {
            this.player = this.model.get('player');
            this.idPrefix = this.model.get('idPrefix');
            this.containerId = this.model.get('containerId');
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('path');
            this.text = this.model.get('text');
            this.accText = this.model.get('accText');
            this.showButton = this.model.get('showButton');
            this.buttonText = this.model.get('buttonText');
            this.textColor = this.model.get('textColor');
            this.clickCallback = this.model.get('clickCallback');
            this.screenId = this.model.get('screenId');
            this.containmentBGcolor = this.model.get('containmentBGcolor');
            this.btnColorType = this.model.get('btnColorType');
            this.btnTextColor = this.model.get('btnTextColor');
            this.btnBaseClass = this.model.get('btnBaseClass');
            this.ttsBaseClass = this.model.get('ttsBaseClass');
            this.ttsColorType = this.model.get('ttsColorType');
            this.tabIndex = this.model.get('tabIndex');
            this.buttonTabIndex = this.model.get('buttonTabIndex');
            this.buttonAccText = this.model.get('buttonAccText');
            this.buttonHeight = this.model.get('buttonHeight');
            this.buttonType = this.model.get('buttonType') || MathInteractives.global.Theme2.Button.TYPE.TEXT;
            this.iconData = this.model.get('iconData');
            this.buttonTextPosition = this.model.get('buttonTextPosition');
            this.render();
        },

        /**
        * Renders directionText Box
        *
        * @method render
        **/
        render: function render() {
            this.$dirText = this.$el;
            var template = MathInteractives.Common.Components.templates.directionText({ idPrefix: this.containerId }).trim()
            , object, idForManager = this.containerId.replace(this.idPrefix, ''),
             appliedCssClass = this.model.get('customClass');

            this.$dirText.append(template);

            if (this.showButton) {
                var buttonObj = {
                    idPrefix: this.containerId,
                    player: this.player,
                    manager: this.manager,
                    path: this.filePath,
                    data: {
                        id: this.containerId + '-direction-text-buttonholder',
                        text: this.buttonText,
                        type: this.buttonType,
                        colorType: this.btnColorType,
                        baseClass: this.btnBaseClass,
                        textColor: this.btnTextColor
                    }
                };
                if (this.buttonHeight !== null) {
                    buttonObj.data.height = this.buttonHeight;
                }

                if (this.buttonTextPosition !== null) {
                    buttonObj.data.textPosition = this.buttonTextPosition;
                }

                if (this.iconData !== null) {
                    buttonObj.data.icon = this.iconData;
                }

                this.tryAnotherView = new MathInteractives.global.Theme2.Button.generateButton(buttonObj);
                object = {
                    'elementId': idForManager + '-direction-text-buttonholder',
                    'tabIndex': this.buttonTabIndex,
                    'uniqueId': this.idPrefix,
                    'role': 'button',
                    'offsetTop': 5,
                    'offsetLeft': 5,
                    'acc': this.buttonAccText ? this.buttonAccText : this.buttonText
                };

                this.manager.createAccDiv(object);
                this.$el.off('click').on('click', '.direction-text-buttonHolder.clickEnabled', null, $.proxy(this.clickCallback.fnc, this.clickCallback.scope));
            }

            var ttsObj = {
                'containerId': this.containerId + '-direction-text-ttsholder',
                'isEnabled': false,
                'tabIndex': 20,
                'manager': this.manager,
                'ttsBaseClass': this.ttsBaseClass,
                'ttsColor': this.ttsColorType,
                'player': this.player,
                'filePath': this.filePath,
                'idPrefix': this.idPrefix,
                messagesToPlay: [this.containerId + '-direction-text-textholder']
            };
            this.ttsView = MathInteractives.global.Theme2.PlayerTTS.generateTTS(ttsObj);

            object = {
                'elementId': idForManager + '-direction-text-text',
                'tabIndex': this.tabIndex,
                'uniqueId': this.idPrefix,
                'loc': this.text,
                'acc': this.accText ? this.accText : this.text
            }



            this.$('.direction-text-containment').css({ 'background-color': this.containmentBGcolor });
            this.$('.direction-text-textHolder').css({ 'color': this.textColor });


            this._adjustMarginsForText();
            if (!appliedCssClass) {
                appliedCssClass = 'direction-text-textHolder';
            }
            var textHolderHeightWidthObject = this.player.getTextHeightWidth(this.text, appliedCssClass, 'max-width:' + this.directionTextHolderWidth + 'px'),
                props = { 'height': textHolderHeightWidthObject.height + 'px', 'width': textHolderHeightWidthObject.width + 'px' },
                self = this;
            $.swap(this.$('.direction-text-text')[0], props, function () {
                self.manager.createAccDiv(object);
            });
            this.renderDirectionTextTTSAccessibility();

        },


        /**
        * enables or disables TTS 
        * params disable
        * @method disableTTS
        **/
        disableTTS: function disableTTS(disable) {
            this.ttsView.disableTTS(disable);
        },

        /**
        * enables or disables button inside directionText
        * params disable
        * @method changeButtonState
        **/
        changeButtonState: function changeButtonState(state) {
            this.tryAnotherView.setButtonState(state);
        },


        /**
        * Changes direction text
        * params newText, bAnimateDirectionText
        * @method changeDirectionText
        **/
        changeDirectionText: function (newText, bAnimateDirectionText, newAccText) {
            var self = this;
            self.text = newText;
            self.accText = newAccText;
            if (bAnimateDirectionText === undefined) {
                bAnimateDirectionText = this.bAnimateDirectionText;
            }

            if (bAnimateDirectionText) {
                this.$el.fadeOut(self.fadeDuration / 2, function () {

                    self.$el.css('visibility', 'hidden');
                    self.$el.css('display', 'block');
                    self._changeDirectionTextContent(newText, newAccText);
                    self.$el.css('display', 'none');
                    self.$el.css('visibility', 'visible');
                    self.$el.fadeIn(self.fadeDuration / 2);
                });
            }
            else {
                self._changeDirectionTextContent(newText, newAccText);
            }
        },

        /**
        * Changes direction text content
        * params newText
        * @method changeDirectionText
        **/
        _changeDirectionTextContent: function (newText, newAccText) {
            var self = this;

            self.$('.direction-text-containment').addClass('zeroHeight');
            var containerId = self.containerId + '-direction-text-text';
            containerId = containerId.replace(self.idPrefix, '');

            self.setMessage(containerId, newText);
            self.setAccMessage(containerId, newAccText ? newAccText : newText);
            self._adjustMarginsForText();

            self.$('.direction-text-containment').removeClass('zeroHeight');
        },

        /**
        * Adjusts direction text content
        * params
        * @method _adjustMarginsForText
        **/
        _adjustMarginsForText: function _adjustMarginsForText() {

            var self = this,
                currentNamespace = MathInteractives.global.Theme2.DirectionText,
                containerHeight = currentNamespace.CONTAINER_HEIGHT,
                containerWidth = currentNamespace.CONTAINER_WIDTH,
                textHolderWidth,
                textHolderHeightWidthObject = null,
                textHolderHeight = null,
                $ttsHolder = self.$('.direction-text-ttsHolder'),
                ttsHeight = $ttsHolder.height(),
                ttsWidth = $ttsHolder.width(),
                ttsMargin = parseInt($ttsHolder.css('margin-left').replace('px', ''), 10)
                            + parseInt($ttsHolder.css('margin-right').replace('px', ''), 10),
                btnWidth = 0,

                btnMargin = 0,
                topMargin,
                leftMargin,
                ttsLeftMargin = parseInt($ttsHolder.css('margin-left').replace('px', '')),
                $directionTextHolder = this.$('.direction-text-textHolder'),
                appliedCssClass = self.model.get('customClass');// if custom class is provided then calculate height and width acc if not use default class for calclulation. add float left property in custom class.



            if (appliedCssClass) {
                this.$('.direction-text-textHolder').addClass(appliedCssClass);
            }
            else {

                appliedCssClass = 'direction-text-textHolder';
            }
            if (self.showButton) {
                btnWidth = self.$el.find('.direction-text-buttonHolder').width();
                btnMargin = parseInt(self.$('.direction-text-buttonHolder').css('margin-left').replace('px', ''), 10)
                            + parseInt(self.$('.direction-text-buttonHolder').css('margin-right').replace('px', ''), 10);


                textHolderWidth = containerWidth - btnWidth - btnMargin - ttsWidth - ttsMargin - 15;

            }
            else {

                textHolderWidth = containerWidth - ttsWidth - ttsMargin;
            }

            this.$('.direction-text-textHolder').css({ 'max-width': textHolderWidth + 'px' });



            this.$('.text-tts-cont').css({
                width: containerWidth - btnWidth - btnMargin,
                height: 78
            })

            //textHolderHeightWidthObject = this.player.getTextHeightWidth(this.text, appliedCssClass, 'max-width:' + textHolderWidth + 'px');
            //this.directionTextHolderWidth=textHolderWidth;
            //textHolderHeight = textHolderHeightWidthObject.height;
            //topMargin = (containerHeight - textHolderHeight) / 2;
            //leftMargin = (textHolderWidth - textHolderHeightWidthObject.width) / 2;

            //if (topMargin < self.padding) {
            //    topMargin = self.padding
            //}
            //if (leftMargin < self.padding) {
            //    this.$('.direction-text-textHolder').css({ 'max-width': textHolderWidth - (self.padding - leftMargin) + 'px' });
            //    leftMargin = self.padding
            //}
            //add the calculated margins to the text box.
            //this.$('.direction-text-textHolder').css({
            //    'margin-top': topMargin + 'px',
            //    'margin-left': leftMargin + 'px',
            //    'margin-bottom': topMargin + 'px'
            //});
            //Adjusting the margin of the tts holder.
            //if (containerHeight < textHolderHeight) {
            //    self.$('.direction-text-ttsHolder').css({ 'margin-top': (((textHolderHeight + (self.padding * 2)) - ttsHeight) / 2) });
            //}
            //else {
            //    self.$('.direction-text-ttsHolder').css({ 'margin-top': ((containerHeight - ttsHeight) / 2) });
            //}
        },


     

        /**
        * Renders TTS Accessibility
        * params
        * @method renderDirectionTextTTSAccessibility
        **/
        renderDirectionTextTTSAccessibility: function renderDirectionTextTTSAccessibility() {

            var instructionTextDivAccId = this.containerId.replace(this.idPrefix, '') + '-direction-text-text',
                ttsDivId = this.containerId.replace(this.idPrefix, '') + '-direction-text-ttsholder';
            this.ttsView.renderTTSAccessibility(this.getTabIndex(instructionTextDivAccId) + 2);

        }
    }, {

        /**
        * Generates DirectionText box
        * params data
        * @method generateDirectionText
        **/
        generateDirectionText: function (data) {
            var dirTextID = '#' + data.containerId,
                directionModel = new MathInteractives.Common.Components.Theme2.Models.DirectionText(data),
                directionBox = new MathInteractives.Common.Components.Theme2.Views.DirectionText({ el: dirTextID, model: directionModel });
            return directionBox;
        },

        /**
         * Height of the direction text container
         * @property CONTAINER_HEIGHT
         * @static
         */
        CONTAINER_HEIGHT: 78,
        /**
         * Width of the direction text container
         * @property CONTAINER_WIDTH
         * @static
         */
        CONTAINER_WIDTH: 908,

    });

    MathInteractives.global.Theme2.DirectionText = MathInteractives.Common.Components.Theme2.Views.DirectionText;
})();
