(function () {
    'use strict';

    /**
    * holds functions related to basic set-up of the interactivity window.
    * @class Button
    * @namespace MathInteractives.Common.Components.Theme2.Views
    * @submodule MathInteractives.Common.Components.Theme2.Views.Button
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Views.Button = MathInteractives.Common.Player.Views.Base.extend({

        /**
       * Holds the interactivity player reference
       * @property player
       * @default null
       * @private
       */
        player: null,

        /**
        * Holds the interactivity id prefix-
        * @property idPrefix
        * @default null
        * @private
        */
        idPrefix: null,

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
        * jQuery object of button
        *
        * @property $btn
        * @type Object
        * @default null
        */
        $btn: null,

        /**
        * Button tooltip Backbone.js view
        *
        * @property btnTooltipView
        * @type Object
        * @default null
        */
        btnTooltipView: null,

        /**
       * Add group name to buttons in same group to keep there width equal
       * @property btnWidthGroup
       * @type String
       * @default null
       */
        btnWidthGroup: null,

        /**
        * timer reference for touch and hold
        * @property _touchStartTimer
        * @type object
        * @default null
        */
        _touchStartTimer: null,

        /**
        * Calls render and attach events
        *
        * @method initialize
        * @public
        **/
        initialize: function initialize() {
            this.player = this.model.player;
            this.idPrefix = this.model.idPrefix;
            this.manager = this.model.manager;
            this.filePath = this.model.filePath;
            this.render();
            this._attachEvents();
            this._attachTooltip();
        },

        /**
        * Renders button text
        *
        * @method render
        * @public
        **/
        render: function render() {
            this.$btn = this.$el;
            var text = this.model.get('text'),
            type = this.model.get('type'),
            baseClass = this.model.get('baseClass'),
            textDimensions = this._getTextHeightWidth(text, 'custom-btn ' + this.model.get('baseClass')),
            //$divBtn = $('<div/>').addClass(this.model.get('displayClass')),
            $divBtn = this.$btn.addClass(this.model.get('displayClass')),
            $divText = $('<div/>').addClass('custom-btn-text'),
            $divIcon = $('<div/>').addClass('custom-btn-icon'),
            $divShadow = $('<div/>').addClass('custom-btn-shadowHolder'),
            btnGroup = this.model.get('btnGroup'),
            calculatedWidth = textDimensions['width'] + (2 * this.model.get('textPadding')),
            borderRadius = this.model.get('borderRadius'),
            textColor = this.model.get('textColor'),
            borderWidth = this.model.get('borderWidth'),
            borderColor = this.model.get('borderColor'),
            iconPadding = this.model.get('iconPadding');
            this.$btn.empty();

            if (calculatedWidth < MathInteractives.global.Theme2.Button.DEFAULT_MINWIDTH) {
                calculatedWidth = MathInteractives.global.Theme2.Button.DEFAULT_MINWIDTH;
            }


            //if user want to override width of a button
            if (this.model.get('width')) calculatedWidth = this.model.get('width');

            //this.$btn.append($divBtn);

            this.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);

            switch (type) {
                case MathInteractives.global.Theme2.Button.TYPE.FA_ICON:
                    this._renderFaIcon($divBtn, $divIcon, $divShadow);
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT:
                    this._renderFaIconText($divBtn, $divIcon, $divShadow, text, type, textDimensions, $divText, calculatedWidth, iconPadding);
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.NEXT_ICONTEXT:
                case MathInteractives.global.Theme2.Button.TYPE.BACK_ICONTEXT:
                    this._renderFixedIconButtons({
                        $divBtn: $divBtn,
                        $divText: $divText,
                        $divIcon: $divIcon,
                        $divShadow: $divShadow,
                        text: text,
                        type: type,
                        calculatedWidth: calculatedWidth,
                        iconPadding: iconPadding
                    });
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.TEXT:
                    $divBtn.css({
                        'height': this.model.get('height'),
                        'width': calculatedWidth
                    }).append($divText);
                    // use lineHeight for aligning text inside button
                    $divText.css({
                        'padding-left': ($divBtn.width() / 2) - (textDimensions.width / 2),
                        'height': $divBtn.height(),
                        'line-height': $divBtn.height() + MathInteractives.global.Theme2.Button.LINEHEIGHT_ERROR + 'px'
                    }).append(text);
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.TTS_PLAY:
                case MathInteractives.global.Theme2.Button.TYPE.TTS_PAUSE:
                case MathInteractives.global.Theme2.Button.TYPE.TTS_SOUND:
                    this._renderTTSButton($divBtn, type);
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.DRAGGABLE_TILE:
                case MathInteractives.global.Theme2.Button.TYPE.ALGEBRA_TILE_ONE:
                case MathInteractives.global.Theme2.Button.TYPE.ALGEBRA_TILE_X:
                    var left, top;
                    this.$btn.css({
                        'height': this.model.get('height'),
                        'width': this.model.get('width')
                    });
                    this.$btn.addClass('tile');

                    if (this.model.get('imagePath') === null) {
                        this.$btn.css({
                            'background-color': this.model.get('colorType').backgroundColor,
                            'box-shadow': 'inset 0px -5px ' + this.model.get('boxShadowColor') + ', 1px 1px 5px #000'
                        });
                    }
                    else {
                        this.$btn.css({
                            'background-image': 'url("' + this.filePath.getImagePath(this.model.get('imagePath')) + '")'
                        }).removeClass('custom-btn');
                    }
                    $divText.addClass('tile-font');
                    $divText.append(text);
                    $divBtn.append($divText).append($divIcon);
                    //For pattern generation.
                    $divIcon.html(MathInteractives.Common.Components.templates.sliderHandle({ data: _.range(6) }).trim());

                    //For aligning the icon horizontally.
                    left = (this.model.get('width') - this.$('.box').width()) / 2;
                    $divIcon.css({ 'margin-left': left + 'px' });

                    //For aligning the icon vertically.
                    top = (this.model.get('height') - (this.model.get('type').fontSize + this.$('.box').height())) / 4;
                    $divText.css({
                        'padding-top': top + 'px',
                        'font-size': this.model.get('type').fontSize
                    });
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.CAMERA:
                case MathInteractives.global.Theme2.Button.TYPE.HELP:
                case MathInteractives.global.Theme2.Button.TYPE.DRAWER:
                case MathInteractives.global.Theme2.Button.TYPE.MUTE:
                case MathInteractives.global.Theme2.Button.TYPE.UNMUTE:
                case MathInteractives.global.Theme2.Button.TYPE.SAVE:
                case MathInteractives.global.Theme2.Button.TYPE.FULL_SCREEN:
                case MathInteractives.global.Theme2.Button.TYPE.POP_OUT:
                default:
                    if (type.icon) {//has icon
                        if (type.category === 'header') {
                            this._renderHeaderBtns(text, type, textDimensions, $divBtn, $divText, $divIcon, calculatedWidth, iconPadding);
                        } else {
                            this._renderNonHeaderBtns(text, type, textDimensions, $divBtn, $divText, $divIcon, calculatedWidth, iconPadding);
                        }
                    }
                    break;
            }

            if (typeof borderRadius !== 'undefined' && borderRadius !== null) {
                $divBtn.css({
                    'border-radius': this.model.get('borderRadius')
                });

                $divShadow.css({
                    'border-radius': this.model.get('borderRadius')
                });
            }

            if (typeof textColor !== 'undefined' && textColor !== null) {
                $divText.css({
                    'color': textColor
                });
            }


            if (this.model.get('border') === true) {
                if (typeof borderWidth !== 'undefined' && borderWidth !== null) {
                    $divBtn.css({
                        'border-width': borderWidth
                    });
                }

                if (typeof borderColor !== 'undefined' && borderColor !== null) {
                    $divBtn.css({
                        'border-color': borderColor
                    });
                }
            }

            $divBtn.addClass(type['class']);
            $divBtn.addClass(btnGroup);

            $divBtn.append($divShadow);
            if (btnGroup) {
                this._resizeBtnGroup(btnGroup);
            }
        },
        /**
        * renders tts btns
        *
        * @method _renderTTSButton
        * @private
        * @param $divBtn {Object} tts button jquery object
        * @param $divBtn {Object} tts button type play/pause/sound
        **/
        _renderTTSButton: function ($divBtn, ttsType) {
            var classType = null,
                faClass = null;

            switch (ttsType) {
                case MathInteractives.global.Theme2.Button.TYPE.TTS_PLAY:
                    classType = 'play';
                    faClass = 'fa fa-play';
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.TTS_PAUSE:
                    classType = 'pause';
                    faClass = 'fa fa-pause';
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.TTS_SOUND:
                    classType = 'sound';
                    faClass = 'fa fa-volume-up';
                    break;
            }
            var $container = $('<div />').addClass('tts-' + classType + '-wrapper-container-div tts-wrapper-container-div'),
                $wrapperContainer = $('<div />').addClass('fa-wrapper-container-div'),
                $wrapper = $('<div />').addClass('fa-wrapper-div'),
                $span = $('<div />').css({
                    'display': 'block'
                }).addClass(faClass);
            $container.append($wrapperContainer);
            $wrapperContainer.append($wrapper);
            $wrapper.append($span);
            $divBtn.addClass(ttsType.icon.iconClass).append($container);
        },

        /**
        * render btns with category header
        *
        * @method _renderHeaderBtns
        * @param text {String} text to be displayed on button
        * @param type {Object} button type
        * @param textDimensions {Object} text height and width
        * @param $divBtn {Object} jquery object of button
        * @param $divText {Object} jquery obj of button text div
        * @param $divIcon {Object} jquery obj of button icon
        * @param calculatedWidth {Number} calculated width of button
        * @param iconPadding {Number} padding to be applied
        * @private
        **/
        _renderHeaderBtns: function _renderHeaderBtns(text, type, textDimensions, $divBtn, $divText, $divIcon, calculatedWidth, iconPadding) {
            if (type.icon.faClass) {
                var $span = $('<span />').addClass(type.icon.faClass),
                    $divWrapper = $('<div />').addClass('header-button-div-wrapper'),
                    $spanWrapper = $('<div />').addClass('header-button-span-wrapper');


                $spanWrapper.css({
                    'width': type.icon.fontSize ? type.icon.fontSize : 15,
                    'height': type.icon.fontSize ? type.icon.fontSize : 15,
                });

                $span.css({
                    'color': type.icon.fontColor ? type.icon.fontColor : '#FFFFFF',
                    'font-size': type.icon.fontSize ? type.icon.fontSize : 15,
                    'font-weight': type.icon.fontWeight ? type.icon.fontWeight : 'normal',
                    'position': 'relative',
                    'line-height': 'normal !important'
                });
                $spanWrapper.append($span);
                $divWrapper.append($spanWrapper);
                $divIcon.append($divWrapper);
            }
            else {
                $divIcon.css({
                    'background-image': 'url("' + this.filePath.getImagePath(MathInteractives.global.Theme2.Button.BUTTON_ICON_PATH) + '")'
                });
            }

            $divIcon.addClass(type.icon.iconClass);

            if (type['hasText']) {
                this.manager.unloadScreen('common-button-text');
                this.manager.loadScreen('common-button-text');
                var combinedWidth,
                btnText = this.manager.getMessage('common-button-text', type['id'] + '-button');
                //if new type added into header buttons then add new css classes for height, width, lineHeight

                $divText.append(btnText);
                if (type['textPosition'] === 'left') {
                    $divBtn.append($divText).append($divIcon);
                } else /*if(type['textPosition'] === 'right')*/ {
                    $divBtn.append($divIcon).append($divText);
                }
            } else {
                $divBtn.append($divIcon);
            }

        },

        /**
        * render btns with category not as header
        *
        * @method _renderNonHeaderBtns
        * @param text {String} text to be displayed on button
        * @param type {Object} button type
        * @param textDimensions {Object} text height and width
        * @param $divBtn {Object} jquery object of button
        * @param $divText {Object} jquery obj of button text div
        * @param $divIcon {Object} jquery obj of button icon
        * @param calculatedWidth {Number} calculated width of button
        * @param iconPadding {Number} padding to be applied
        * @private
        **/
        _renderNonHeaderBtns: function _renderNonHeaderBtns(text, type, textDimensions, $divBtn, $divText, $divIcon, calculatedWidth, iconPadding) {
            var icon = this.model.get('icon') ? this.model.get('icon') : type.icon,
            text = this.model.get('text'), textDimensions, resHeight,
            textPadding = this.model.get('textPadding');

            if (type.icon.faClass) {
                var $span = $('<span />').addClass(type.icon.faClass),
                    $spanWrapper = $('<div />').addClass('non-header-button-wrapper-div');

                $spanWrapper.css({
                    'height': type.icon.fontSize ? type.icon.fontSize : 15,
                    'width': type.icon.fontSize ? type.icon.fontSize : 15
                });

                $span.css({
                    'color': type.icon.fontColor ? type.icon.fontColor : '#FFFFFF',
                    'font-size': type.icon.fontSize ? type.icon.fontSize : 15,
                    'font-weight': type.icon.fontWeight ? type.icon.fontWeight : 'normal',
                    'text-align': 'center'
                });
                $spanWrapper.append($span);
                $divIcon.append($spanWrapper);
            }
            else {
                $divIcon.css({
                    'background-image': 'url("' + icon['iconPath'] + '")'
                });
            }

            $divIcon.css({
                'height': icon['height'],
                'width': icon['width']
            });

            if (type['icon']['iconClass']) {
                $divIcon.addClass(type['icon']['iconClass']);
            }

            if (type === MathInteractives.global.Theme2.Button.TYPE.ICONTEXT) {

                var combinedWidth,
                //textDimensions = this._getTextHeightWidth(text, 'custom-btn');
                //Base class is added to adjust the width of the button in case where image is used as icon in button.
                textDimensions = this._getTextHeightWidth(text, 'custom-btn ' + this.model.get('baseClass'));
                //Adding 1 to width for text to be displayed in IE and Firefox
                textDimensions.width += 1;

                $divText.css({
                    'width': textDimensions.width,
                    'float': 'left'
                }).append(text);

                $divIcon.css({
                    'float': 'left'
                });

                if (this.model.get('width')) {
                    textPadding = (this.model.get('width') - textDimensions.width - icon['width']) / 2
                }

                if (this.model.get('textPosition') === 'left') {
                    $divBtn.append($divText).append($divIcon);
                    $divText.css({ 'margin-left': textPadding });
                } else /*if(this.model.get('textPosition') === 'right')*/ {
                    $divBtn.append($divIcon).append($divText);
                    $divIcon.css({ 'margin-left': textPadding });
                }

                resHeight = textDimensions.height > icon['height'] ? textDimensions.height : icon['height'];
                if (this.model.get('height')) {
                    resHeight = this.model.get('height');
                }
                if (resHeight < MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT) {
                    resHeight = MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT;
                }

                //$divText.css({'margin-top': (resHeight/2) - (textDimensions.height/2) });
                $divText.css({ 'height': resHeight, 'line-height': resHeight + MathInteractives.global.Theme2.Button.LINEHEIGHT_ERROR + 'px' });
                $divIcon.css({ 'margin-top': (resHeight / 2) - (icon['height'] / 2) });

                combinedWidth = $divText.width() + $divIcon.width();
                $divBtn.css({
                    'height': resHeight,
                    'width': combinedWidth + (2 * textPadding)
                });
            } else {

                if (this.model.get('width')) {
                    textPadding = (this.model.get('width') - icon['width']) / 2
                }

                resHeight = this.model.get('height') ? this.model.get('height') : icon['height'];
                if (resHeight < MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT) {
                    resHeight = MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT;
                }

                $divIcon.css({ 'margin-top': (resHeight / 2) - (icon['height'] / 2), 'margin-left': textPadding });

                $divBtn.css({
                    'height': resHeight,
                    'width': icon['width'] + (2 * textPadding)
                }).append($divIcon);
            }
        },

        /**
        * renders font-awesome icons
        *
        * @method _renderFaIcon
        * @param $divBtn {Object} jquery object of button
        * @param $divIcon {Object} jquery obj of button icon
        * @param $divShadow {Object} jquery obj of shadow div
        * @private
        **/
        _renderFaIcon: function _renderFaIcon($divBtn, $divIcon, $divShadow) {
            var icon = this.model.get('icon'),
                type = this.model.get('type'),
                defaultFaIconClass = type.iconClass,
                $span = $('<span />').addClass(icon.faClass).addClass(icon.baseClass),
                $divWrapper = $('<div />');

            $divWrapper.css({
                'display': 'table-cell',
                'vertical-align': 'middle',
                'text-align': 'center',
                'width': 'inherit',
                'height': 'inherit'
            });
            if (icon.applyIconButtonWrapper) {
                var $iconButtonWrapper = $('<div/>');
                $iconButtonWrapper.addClass(icon.iconButtonWrapperClass);
                $divWrapper.append($iconButtonWrapper);
            }
            $span.css({
                'color': icon.fontColor,
                'font-size': icon.fontSize,
                'font-weight': icon.fontWeight,
                'margin': 'auto',
                'position': 'relative'
            }).addClass(defaultFaIconClass);
            if (icon.applyIconButtonWrapper) {
                $iconButtonWrapper.append($span)
            }
            else {
                $divWrapper.append($span);
            }

            $divBtn.css({
                'height': this.model.get('height'),
                /*'line-height': '' + (this.model.get('height') + 1) + 'px',*/
                'width': this.model.get('width')
            }).append($divWrapper);
        },

        /**
        * renders font awesome button text
        *
        * @method _renderFaIconText
        * @param $divBtn {Object} jquery object of button
        * @param $divIcon {Object} jquery obj of button icon
        * @param $divShadow {Object} jquery obj of shadow div
        * @param text {String} text to be displayed on button
        * @param type {Object} button type
        * @param textDimensions {Object} text height and width
        * @param $divText {Object} jquery obj of button text div
        * @param calculatedWidth {Number} calculated width of button
        * @param iconPadding {Number} padding to be applied
        * @private
        **/
        _renderFaIconText: function ($divBtn, $divIcon, $divShadow, text, type, textDimensions, $divText, calculatedWidth, iconPadding) {

            var icon = this.model.get('icon'), $span = $('<span />').addClass(icon.faClass),
                text = this.model.get('text'), textDimensions, resHeight,
                textPadding = this.model.get('textPadding');

            $span.css({
                'color': icon.fontColor ? icon.fontColor : '#FFFFFF',
                'font-size': icon.fontSize ? icon.fontSize : 16,
                'font-weight': icon.fontWeight ? icon.fontWeight : 'normal'
            });

            $divBtn.css({
                'height': this.model.get('height'),
                'width': this.model.get('width')
            });

            $divIcon.css({
                'height': icon.height,
                'width': icon.width
            }).append($span);

            if (type.icon.iconClass) {
                $divIcon.addClass(type.icon.iconClass);
            }

            var combinedWidth,
            textDimensions = this._getTextHeightWidth(text, 'custom-btn ' + this.model.get('baseClass'));
            //Adding 1 to width for text to be displayed in IE and Firefox
            textDimensions.width += 1;

            $divText.css({
                'width': textDimensions.width,
                'float': 'left'
            }).append(text);

            $divIcon.css({
                'float': 'left'
            });

            if (this.model.get('width')) {
                textPadding = (this.model.get('width') - textDimensions.width - icon['width']) / 2
            }

            if (this.model.get('textPosition') === 'left') {
                $divBtn.append($divText).append($divIcon);
                $divText.css({ 'margin-left': textPadding });
            } else /*if(this.model.get('textPosition') === 'right')*/ {
                $divBtn.append($divIcon).append($divText);
                $divIcon.css({ 'margin-left': textPadding });
            }

            resHeight = textDimensions.height > icon['height'] ? textDimensions.height : icon['height'];
            if (this.model.get('height')) {
                resHeight = this.model.get('height');
            }
            if (resHeight < MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT) {
                resHeight = MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT;
            }

            //$divText.css({'margin-top': (resHeight/2) - (textDimensions.height/2) });
            $divText.css({ 'height': resHeight, 'line-height': resHeight + MathInteractives.global.Theme2.Button.LINEHEIGHT_ERROR + 'px' });
            $divIcon.css({ 'margin-top': (resHeight / 2) - (icon['height'] / 2) });

            combinedWidth = $divText.width() + $divIcon.width();
            $divBtn.css({
                'height': resHeight,
                'width': combinedWidth + (2 * textPadding)
            });
        },

        /**
        * Renders icon text buttons with fixed sized icons.
        *
        * @method _renderFixedIconButtons
        * @param options {Object} All the parameters of _renderFaIconText method passed in key-value pairs of a single object.
        * @private
        */
        _renderFixedIconButtons: function _renderFixedIconButtons(options) {
            var icon = $.extend(true, {}, options.type.iconDefault, options.type.icon),
                baseClass = this.model.get('baseClass'),
                $span = $('<span />').addClass(this.getFontAwesomeClass(icon.faIconId)),
                resHeight, resWidth,
                minWidth = MathInteractives.global.Theme2.Button.DEFAULT_MINWIDTH,
                textPadding = this.model.get('textPadding') || options.type.textPadding || 15,
                textPosition = this.model.get('textPosition') || icon.textPosition,
                text = options.text || this.manager.getMessage(options.type.textId, 0),
                iconHeight = this.getChevronHeight();

            options.$divIcon.css({
                //'height': icon.height,
                'height': iconHeight,
                'width': icon.width
            }).append($span);

            var combinedWidth = 0,
            textDimensions = this._getTextHeightWidth(text, 'custom-btn ' + baseClass);
            //Adding 1 to width for text to be displayed in IE and Firefox
            textDimensions.width += 1;

            options.$divText.css({
                'width': textDimensions.width,
                'margin-right': icon.textMargin,
                'float': 'left'
            }).append(text);

            options.$divIcon.css({
                'float': 'left'
            });

            if (textDimensions.width) {
                combinedWidth += textDimensions.width;
            }
            if (icon.width) {
                combinedWidth += icon.width;
            }
            if (icon.textMargin) {
                combinedWidth += icon.textMargin;
            }

            if (this.model.get('width')) {
                textPadding = (this.model.get('width') - combinedWidth) / 2
            }
                // if button content's width is less than minimum button width - adjust padding to center align content
            else if (combinedWidth + textPadding * 2 < minWidth) {
                textPadding = (minWidth - combinedWidth) / 2;
            }

            if (textPosition === 'left') {
                options.$divBtn.append(options.$divText).append(options.$divIcon);
                options.$divText.css({ 'margin-left': textPadding });
            }
            else {
                options.$divBtn.append(options.$divIcon).append(options.$divText);
                options.$divIcon.css({ 'margin-left': textPadding });
            }

            if (this.model.get('height')) {
                resHeight = this.model.get('height');
            }
            else {
                //resHeight = textDimensions.height > icon['height'] ? textDimensions.height : icon['height'];
                resHeight = textDimensions.height > iconHeight ? textDimensions.height : iconHeight;
                if (resHeight < MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT) {
                    resHeight = MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT;
                }
            }

            options.$divText.css({ 'height': resHeight, 'line-height': resHeight + MathInteractives.global.Theme2.Button.LINEHEIGHT_ERROR + 'px' });
            //options.$divIcon.css({ 'margin-top': (resHeight / 2) - (icon['height'] / 2) });
            options.$divIcon.css({ 'margin-top': (resHeight / 2) - (iconHeight / 2) });

            resWidth = combinedWidth + (2 * textPadding);
            if (this.model.get('width')) {
                resWidth = this.model.get('width');
            }
            else if (combinedWidth + textPadding * 2 > minWidth) {
                resWidth = combinedWidth + (2 * textPadding);
            }
            else {
                resWidth = minWidth;
            }

            options.$divBtn.css({
                'height': resHeight,
                'width': resWidth
            });
        },

        getChevronHeight: function getChevronHeight() {
            var type = this.model.get('type'),
                iconDivHeight = type.iconDefault.height;
            return (MathInteractives.Common.Utilities.Models.BrowserCheck.isChrome === true || MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile === true) ? (iconDivHeight + 1) : (iconDivHeight + 3);
        },

        /**
        * resize btns with which has same group
        *
        * @method _resizeBtnGroup
        * @param btnGroup{String} btnGroup name
        * @private
        **/
        _resizeBtnGroup: function _resizeBtnGroup(btnGroup) {
            var elements = (this.player) ? this.player.$('.custom-btn.' + btnGroup) : $('.de-mathematics-interactive.player-theme-2 .custom-btn.' + btnGroup), maxHeight = 0, maxWidth = 0, i = 0, eleLength = elements.length;

            for (; i < eleLength; i++) {
                if ($(elements[i]).height() > maxHeight) {
                    maxHeight = $(elements[i]).height();
                }

                if ($(elements[i]).width() > maxWidth) {
                    maxWidth = $(elements[i]).width();
                }
            }

            for (i = 0; i < eleLength; i++) {
                this._changeBtnsHeightWidth($(elements[i]), maxHeight, maxWidth);
            }

        },

        /**
        * resize btns according to passed height and width parameteres
        *
        * @method _changeBtnsHeightWidth
        * @param $btn {Object} jquery object of button
        * @param height {Number} height of button
        * @param width {Number} width of button
        * @private
        **/
        _changeBtnsHeightWidth: function _changeBtnsHeightWidth($btn, height, width) {

            var $text = $btn.find('.custom-btn-text'),
            $icon = $btn.find('.custom-btn-icon'),
            textDimensions = this._getTextHeightWidth($text.text(), 'custom-btn'),
            combinedWidth = textDimensions.width + $icon.width();

            $btn.css({ 'height': height, 'width': width });

            if ($text.length > 0 && $icon.length > 0) {
                $text.css({ 'height': height, 'line-height': height + MathInteractives.global.Theme2.Button.LINEHEIGHT_ERROR + 'px' });
                $icon.css({ 'margin-top': (height - $icon.height()) / 2 });
                $btn.children().first().css({ 'margin-left': (width - combinedWidth) / 2 });
            } else if ($icon.length > 0) {
                $icon.css({ 'margin-top': (height - $icon.height()) / 2, 'margin-left': (width - combinedWidth) / 2 });
            } else if ($text.length > 0) {
                $text.css({ 'height': height, 'line-height': height + MathInteractives.global.Theme2.Button.LINEHEIGHT_ERROR + 'px', 'padding-left': (width - combinedWidth) / 2 });
            }

        },

        /**
        * handle button click for toggle action
        *
        * @method _onBtnClick
        * @private
        **/
        _onBtnClick: function _onBtnClick() {
            var state = this.getButtonState();
            if (state === MathInteractives.global.Theme2.Button.BUTTON_STATE_SELECTED) {
                this.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            } else if (state === MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                this.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_SELECTED);
            }
        },

        /*
        * Calculates the text width
        * @method _getTextHeightWidth
        * @param text {String} text on the button
        * @param classes {String} classes to be added to the button
        * @param parentClasses {String} parent classes to be added to the button
        * @return {Object} height and width
        * @private
        **/
        _getTextHeightWidth: function _getTextHeightWidth(text, classes, parentClasses) {
            if (this.player) {
                //console.log('button  ' + text + ':  from player');
                return this.player.getTextHeightWidth(text, classes, null, parentClasses);
            }

            this.$el.parents('.de-mathematics-interactive').find('#text-dimentions-hack').css({ 'position': 'absolute', 'top': '0px', 'width': '100%' });
            this.$el.parents('.de-mathematics-interactive').find('#text-dimentions-hack-holder').css({ 'position': 'absolute' });
            var dimenstion = { height: 0, width: 0 },
                $wrapperDiv = this.$el.parents('.de-mathematics-interactive').find('#text-dimentions-hack-holder-wrapper').addClass(parentClasses),
                $textDiv = $wrapperDiv.find('#text-dimentions-hack-holder').addClass(classes).html(text);

            if (text && text !== '') {
                dimenstion.height = $textDiv.getTextHeight();
                dimenstion.width = $textDiv.getTextWidth();
            }

            $wrapperDiv.removeClass(parentClasses);
            $textDiv.removeClass(classes).html('');

            return dimenstion;
        },

        /*
        * Calculates the image width
        * @method _getImageHeightWidth
        * @param imagePathId {String}
        * @return {number} width
        * @private
        **/
        _getImageHeightWidth: function _getImageHeightWidth(imagePathId) {
            var dimenstion = { height: 0, width: 0 };
            var $temp = $('<img>', {
                'src': this.filePath.getImagePath(imagePathId)
            });

            $('body').append($temp);
            dimenstion.height = $temp.height();
            dimenstion.width = $temp.width();
            $temp.hide();
            $temp.remove();

            return dimenstion;
        },



        /**
        * Attaches mouse and touch events to button
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var $btn = this.$btn;

            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                $btn.on('mouseenter', $.proxy(this._onMouseOver, this));
                $btn.on('mouseleave', $.proxy(this._onMouseOut, this));
                $btn.hover($.proxy(this._onMouseOver, this), $.proxy(this._onMouseOut, this));
                $btn.on('mousedown', $.proxy(this._onMouseDown, this));
                $btn.on('mouseup', $.proxy(this._removeTooltip, this));
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch($btn);
            }
            else {
                $btn.on('touchstart', $.proxy(this._touchStartEvent, this));
                $btn.on('touchend', $.proxy(this._touchEndEvent, this));
                MathInteractives.Common.Utilities.Models.Utils.addTouchAndHoldHandler(this, $btn, 600, this._onMouseOver, this._onMouseOut, 'theme2-button');
                $btn.on('click', $.proxy(this._onMouseup, this));
            }

            //$.fn.EnableTouch($btn);

            if (this.model.get('isToggle')) {
                this.$btn.off('click.custom-button', $.proxy(this._onBtnClick, this)).on('click.custom-button', $.proxy(this._onBtnClick, this));
            }
        },

        /**
        * Sets the state of button as 'active', 'selected' or 'disabled'
        *
        * @method setButtonState
        * @param {String} [state] State to be set
        * @param options {Object} options passed to the button
        * @public
        **/
        setButtonState: function setButtonState(state, options) {
            var staticDataHolder = MathInteractives.Common.Components.Theme2.Views.Button,
                baseClass = this.model.get('baseClass'),
                newClass = null,
                currentState = null,
                manager = this.manager,
                $dragTile, isCenterAlign, top,
                shadow = 5;
            //isThreeSliceButton = this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE ? true : false;
            this.$btn.removeClass(staticDataHolder.BUTTON_STATE_ACTIVE + ' ' + staticDataHolder.BUTTON_STATE_SELECTED + ' '
             + staticDataHolder.BUTTON_STATE_DISABLED + ' clickEnabled hover');

            this.$btn.addClass(state);
            if (state === staticDataHolder.BUTTON_STATE_ACTIVE || state === staticDataHolder.BUTTON_STATE_SELECTED) {
                this.$btn.addClass('clickEnabled');
                // Uncomment to allow hover effect after button enables
                /*
                if (!$.support.touch) {
                    this._bindMouseMoveForCursor();
                }
                */
                if (manager) {
                    manager.enableTab(this.$btn.attr('id'), true);
                }
            } else {
                this.$btn.removeClass('down'); // remove down state from disabled button
                if (manager) {
                    manager.enableTab(this.$btn.attr('id'), false);
                }
                //if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this.$btn.css('cursor', 'default').removeClass('hover');
                // Uncomment to allow hover effect after button enables
                //this._unbindMouseMoveForCursor();
                //}
            }
            this.model.set('currentState', state);
            if (options) {  //used for enabling and disabling drag drop tiles
                if (options.shadow) {
                    shadow = options.shadow;
                }
                $dragTile = options.$dragTile;
                isCenterAlign = options.isCenterAlign;
                if (state === staticDataHolder.BUTTON_STATE_ACTIVE) {
                    $dragTile.find('.custom-btn-icon').show();
                    top = ($dragTile.height() - (parseInt($dragTile.find('.custom-btn-text.tile-font').css('font-size').replace('px', '')) + $dragTile.find('.box').height())) / 4;
                    $dragTile.find('.custom-btn-text.tile-font').css('padding-top', top + 'px');
                }
                else if (state === staticDataHolder.BUTTON_STATE_DISABLED) {
                    $dragTile.find('.custom-btn-icon').hide();
                    $dragTile.css('cursor', 'default');
                    if (isCenterAlign === true) {
                        top = ($dragTile.height() - $dragTile.find('.custom-btn-text.tile-font').css('font-size').replace('px', '') - shadow) / 2;
                        $dragTile.find('.custom-btn-text.tile-font').css('padding-top', top + 'px');
                    }
                }
            }
        },
        /**
        * gets the current button state as 'active', 'selected' or 'disabled'
        *
        * @method getButtonState
        * @public
        **/
        getButtonState: function getButtonState() {
            return this.model.get('currentState');
        },
        /**
        * Binds a mousemove on the button to change cursor and hover state
        *
        * @method _unbindMouseMoveForCursor
        * @private
        **/
        _bindMouseMoveForCursor: function () {
            var self = this;
            this.$btn.off('mousemove.cursor-change').on('mousemove.cursor-change', function () {
                self._onMouseOver();
                self._unbindMouseMoveForCursor();
            });
        },
        /**
        * Unbinds the mousemove on the button
        *
        * @method _unbindMouseMoveForCursor
        * @private
        **/
        _unbindMouseMoveForCursor: function () {
            this.$btn.off('mousemove.cursor-change');
        },
        /**
        * Determines whether button is in active state of not
        *
        * @method _isBtnActive
        * @return {Boolean} [isActive]
        * @private
        **/
        _isBtnActive: function () {
            var isActive = false;

            if (this.getButtonState() === MathInteractives.Common.Components.Theme2.Views.Button.BUTTON_STATE_ACTIVE ||
                this.getButtonState() === MathInteractives.Common.Components.Theme2.Views.Button.BUTTON_STATE_SELECTED) {
                isActive = true;
            }

            return isActive;
        },


        /**
        * Changes cursor, if button is active and adds hover effect
        *
        * @method _onMouseOver
        * @param event {Object}
        * @private
        **/
        _onMouseOver: function _onMouseOver(event) {
            if (!this._isBtnActive()) {
                return;
            }

            var isToggleType = this.model.get('toggleButton'),
                btnState = this.getButtonState(),
                disabledState = MathInteractives.Common.Components.Theme2.Views.Button.BUTTON_STATE_DISABLED;

            if (btnState === disabledState) {
                return;
            }

            //if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
            //    this.$btn.removeClass('down').addClass('hover');
            //} else {
            this.$btn.css('cursor', 'pointer').addClass('hover');
            //}
            //this.$btn.css('cursor', 'pointer').removeClass('down').addClass('hover');

            return; //as tooltip functionality is handled by tooltip

        },

        /**
        * Removes tooltip and hover effect
        *
        * @method _onMouseOut
        * @param event {Object}
        * @private
        **/
        _onMouseOut: function _onMouseOut(event) {

            //if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
            //    this.$btn.removeClass('hover');
            //} else {
            this.$btn.css('cursor', 'default').removeClass('hover');
            //}
            if (!this._isBtnActive()) {
                return;
            }
            var isToggleType = this.model.get('toggleButton'),
               btnState = this.getButtonState(),
               disabledState = MathInteractives.Common.Components.Theme2.Views.Button.BUTTON_STATE_DISABLED;

            if (btnState === disabledState) {
                return;
            }
            this._removeTooltip();
        },

        /**
        * Adds selected state to button
        *
        * @method _onMouseDown
        * @param event {Object}
        * @private
        **/
        _onMouseDown: function _onMouseDown(event) {

            if (!this._isBtnActive()) {
                return;
            }

            $(document).one({
                'mouseup': $.proxy(this._onMouseup, this),
                'touchend': $.proxy(this._onMouseup, this)
            });

            this.$btn.addClass('down');

            return; //as tooltip functionality is handled by tooltip
        },

        /**
        * Removes selected state of button
        *
        * @method _onMouseup
        * @param event {Object}
        * @private
        **/
        _onMouseup: function _onMouseup(event) {
            if (!this._isBtnActive()) {
                return;
            }

            if (this._touchStartTimer !== null) {
                window.clearTimeout(this._touchStartTimer);
            }

            //$(document).off({
            //    'mouseup': $.proxy(this._onMouseup, this),
            //    'touchend': $.proxy(this._onMouseup, this)
            //});

            this.$btn.removeClass('down');
        },

        /**
        * adds touchstart timer for button
        *
        * @method _touchStartEvent
        * @param event {Object}
        * @private
        */
        _touchStartEvent: function _touchStartEvent(event) {
            if (!this._isBtnActive()) {
                return;
            }
            this.$btn.addClass('down');
        },


        /**
        * adds touchend timer for button
        *
        * @method _touchStartEvent
        * @param event {Object}
        * @private
        */
        _touchEndEvent: function _touchEndEvent(event) {
            if (!this._isBtnActive()) {
                return;
            }
            this.$btn.removeClass('down');
        },


        /**
        * Shows the button
        *
        * @method showButton
        * @public
        **/
        showButton: function showButton() {
            this.$btn.show();
        },

        /**
        * Hides the button
        *
        * @method hideButton
        * @public
        **/
        hideButton: function hideButton() {
            this.$btn.hide();
        },

        /**
        * Changes text on the button tooltip
        *
        * @method changeTooltipText
        * @param {String} [tooltiptext] New tooltip text
        * @public
        **/
        changeTooltipText: function changeTooltipText(tooltiptext) {
            this.btnTooltipView.changeTooltipText(tooltiptext);
        },
        /**
       * Changes text on the button
       *
       * @method changeText
       * @param {String} [text] New button text
       * @public
       **/
        changeText: function changeText(text) {
            var textDimensions = this._getTextHeightWidth(text, 'custom-btn ' + this.model.get('baseClass')),
                $divBtn = this.$btn;
            this.$btn.find(".custom-btn-text").css({
                'padding-left': ($divBtn.width() / 2) - (textDimensions.width / 2)
            }).html(text);
            this.model.set('text', text);
            //this._changeBtnsHeightWidth(this.$btn);
        },
        /**
        * Removes the tooltip
        *
        * @method _removeTooltip
        * @private
        **/
        _removeTooltip: function _removeTooltip() {
            if (this.btnTooltipView) {
                // if (this._touchStartTimer !== null) {
                //  window.clearTimeout(this._touchStartTimer);
                //  }

                //check the event.which to 0 probably
                this.btnTooltipView.hideTooltip();
            }
        },

        /**
        * Removes the tooltip
        *
        * @method removeTooltip
        * @public
        **/
        removeTooltip: function removeTooltip() {
            this._removeTooltip();
        },

        /**
        * Attaches the tooltip
        *
        * @method _attachTooltip
        * @private
        **/
        _attachTooltip: function _attachTooltip() {
            var tooltiptext = this.model.get('tooltipText'), data,
            arrowType = this.model.get('tooltipType'),
            tooltipColorType = this.model.get('tooltipColorType');


            if (!tooltiptext || tooltiptext.length === 0) {
                return;
            }

            data = {
                elementEl: this.$btn.attr('id'),
                idPrefix: this.idPrefix,
                manager: this.manager,
                _player: this.player,
                type: tooltipColorType,
                arrowType: arrowType,
                path: this.filePath,
                text: tooltiptext
            };
            this.btnTooltipView = MathInteractives.global.Theme2.Tooltip.generateTooltip(data);
            /*
            var $btn = this.$btn,
                tooltip = new MathInteractives.Common.Components.Models.Tooltip({
                    id: this.model.get('id') + 'tooltip',
                    text: tooltiptext,
                    elementOffsetPosition: $btn.offset(),
                    elementDimensions: { width: $btn.width(), height: $btn.height() },
                    tooltipPosition: this.model.get('tooltipPosition'),
                    path: this.filePath,
                    player: this.model.get('player')
                });
            this.btnTooltipView = new MathInteractives.Common.Components.Views.Tooltip({ model: tooltip });*/
        }

    }, {
        /**
        * border width
        * @property DEFAULT_BORDERWIDTH
        * @default 2
        * @static
        */
        DEFAULT_BORDERWIDTH: 2,
        /**
        * line height
        * @property LINEHEIGHT_ERROR
        * @default 1
        * @static
        */
        LINEHEIGHT_ERROR: 1,
        /**
        * min width
        * @property DEFAULT_MINWIDTH
        * @default 115
        * @static
        */
        DEFAULT_MINWIDTH: 115,
        /**
        * min height
        * @property DEFAULT_MINHEIGHT
        * @default 30
        * @static
        */
        DEFAULT_MINHEIGHT: 30,
        /**
        * button icon path
        * @property BUTTON_ICON_PATH
        * @default 'buttons-icons'
        * @static
        */
        BUTTON_ICON_PATH: 'buttons-icons',
        /**
        * button state active
        * @property BUTTON_STATE_ACTIVE
        * @default 'active'
        * @static
        */
        BUTTON_STATE_ACTIVE: 'active',
        /**
        * button state active
        * @property BUTTON_STATE_SELECTED
        * @default 'selected'
        * @static
        */
        BUTTON_STATE_SELECTED: 'selected',
        /**
        * button state disabled
        * @property BUTTON_STATE_DISABLED
        * @default 'disabled'
        * @static
        */
        BUTTON_STATE_DISABLED: 'disabled',
        /**
        * default type of button
        * @property DEFAULT_TYPE
        * @default { id: 'text', class: 'custom-btn-type-text', borderWidth: 0, textPadding: 30 }
        * @static
        */
        DEFAULT_TYPE: { id: 'text', class: 'custom-btn-type-text', borderWidth: 0, textPadding: 30 },
        /**
        * default button color
        * @property DEFAULT_COLORTYPE
        * @default { id: 'blue', 'textColor': '#FFF', 'borderColor': '#FFF', 'displayClass': 'custom-btn custom-btn-blue' }
        * @static
        */
        DEFAULT_COLORTYPE: { id: 'blue', 'textColor': '#FFF', 'borderColor': '#FFF', 'displayClass': 'custom-btn custom-btn-blue' },
        /**
        * default tts button color type
        * @property DEFAULT_TTS_COLORTYPE
        * @default { id: 'tts-blue', 'displayClass': 'custom-btn custom-btn-tts-blue' }
        * @static
        */
        DEFAULT_TTS_COLORTYPE: { id: 'tts-blue', 'displayClass': 'custom-btn custom-btn-tts-blue' },
        /**
        * Type of button string
        * @property TYPE
        * @type Object
        * @static
        */
        TYPE: {
            TEXT: { id: 'text', class: 'custom-btn-type-text', height: 38, borderWidth: 0, textPadding: 30 },
            ICON: { id: 'icon', class: 'custom-btn-type-icon', borderWidth: 0, textPadding: 15 },
            FA_ICON: { id: 'fa-icon', class: 'custom-btn-type-fa-icon', iconClass: 'custom-btn-type-fa-icon-span' },
            FA_ICONTEXT: { id: 'fa-icontext', class: 'custom-btn-type-fa-icon-text', textPadding: 15, height: 38 },
            TTS_PLAY: { id: 'tts-play', class: 'custom-btn-type-tts custom-btn-type-tts-play', icon: { iconClass: 'tts-play-icon' } },
            TTS_PAUSE: { id: 'tts-pause', class: 'custom-btn-type-tts custom-btn-type-tts-pause', icon: { iconClass: 'tts-pause-icon' } },
            TTS_SOUND: { id: 'tts-sound', class: 'custom-btn-type-tts custom-btn-type-tts-sound', icon: { iconClass: 'tts-sound-icon' } },
            ICONTEXT: { id: 'icontext', class: 'custom-btn-type-icontext', textPadding: 15, height: 38 },
            CAMERA: { id: 'camera', class: 'custom-btn-type-camera', category: 'header', icon: { iconClass: 'camera-icon', faClass: 'fa fa-camera', 'fontSize': 24 } },
            FULL_SCREEN: { id: 'full-screen', class: 'custom-btn-type-fullscreen', category: 'header', icon: { iconClass: 'full-screen-icon' } },
            HELP: { id: 'help', class: 'custom-btn-type-help', category: 'header', icon: { iconClass: 'help-icon', faClass: 'fa fa-question-circle', 'fontSize': 24 }, isToggle: true },
            MUTE: { id: 'mute', class: 'custom-btn-type-mute', category: 'header', icon: { iconClass: 'mute-icon', faClass: 'fa fa-volume-up', 'fontSize': 24 } },
            UNMUTE: { id: 'mute', class: 'custom-btn-type-unmute', category: 'header', icon: { iconClass: 'unmute-icon', faClass: 'fa fa-volume-off', 'fontSize': 24 } },
            DRAWER: { id: 'drawer', class: 'custom-btn-type-drawer', category: 'header', icon: { iconClass: 'drawer_icon', faClass: 'fa fa-bars', 'fontSize': 24 }, isToggle: true },
            POP_OUT: { id: 'pop-out', class: 'custom-btn-type-popout', category: 'header', icon: { iconClass: 'pop-out-icon' } },
            SAVE: { id: 'save', class: 'custom-btn-type-save', category: 'header', icon: { iconClass: 'save-icon', faClass: 'fa fa-folder', 'fontSize': 20 }, hasText: true, textPosition: 'right' },
            RESET: { id: 'reset', class: 'custom-btn-type-reset', icon: { iconClass: 'reset-icon', faClass: 'fa fa-undo', 'fontSize': 20, 'width': 38, 'height': 20 } },
            BACK: { id: 'back', class: 'custom-btn-type-back', icon: { iconClass: 'back-icon', faClass: 'fa fa-chevron-left', 'fontSize': 16 } },
            NEXT: { id: 'next', class: 'custom-btn-type-next', icon: { iconClass: 'next-icon', faClass: 'fa fa-chevron-right', 'fontSize': 16 } },
            DRAGGABLE_TILE: { id: 'draggable', class: 'custom-btn-type-draggable', height: 48, width: 48, fontSize: 20 },
            ALGEBRA_TILE_ONE: { id: 'algebra-one', class: 'custom-btn-type-draggable algebra-tile-one', height: 40, width: 40, fontSize: 14 },
            ALGEBRA_TILE_X: { id: 'algebra-x', class: 'custom-btn-type-draggable algebra-tile-x', height: 40, width: 100, fontSize: 14 },
            NEXT_ICONTEXT: { id: 'next-icontext', class: 'custom-btn-type-next-icon-text', textId: 'comm16', height: 38, iconDefault: { faIconId: 'fixed-next', height: 14, width: 9, textPosition: 'left', textPadding: 15, textMargin: 5 } },
            BACK_ICONTEXT: { id: 'back-icontext', class: 'custom-btn-type-back-icon-text', textId: 'comm15', height: 38, iconDefault: { faIconId: 'fixed-back', height: 14, width: 14, textPosition: 'right', textPadding: 15 } }
        },

        /**
        * Type of colors object
        * @property COLORTYPE
        * @type Object
        * @static
        */
        COLORTYPE: {
            GREEN: { id: 'green', 'textColor': '#FFF', 'borderColor': '#FFF', 'displayClass': 'custom-btn custom-btn-green' },
            BLUE: { id: 'blue', 'textColor': '#FFF', 'borderColor': '#FFF', 'displayClass': 'custom-btn custom-btn-blue' },
            WHITE: { id: 'white', 'textColor': '#2e3a3a', 'borderColor': '#000', 'displayClass': 'custom-btn custom-btn-white' },
            DRAWER: { id: 'drawer', 'textColor': '#FFF', 'borderColor': '#FFF', 'displayClass': 'custom-btn custom-btn-drawer' },
            HEADER_BLUE: { id: 'header-blue', 'textColor': '#FFF', 'borderColor': '#FFF', 'displayClass': 'custom-btn custom-btn-header-blue' },
            HEADER_BLUE_SHADOW: { id: 'header-blue-shadow', 'textColor': '#FFF', 'borderColor': '#FFF', 'displayClass': 'custom-btn custom-btn-header-blue-shadow' },
            DRAGGABLE_BLUE: { id: 'draggable-blue', 'displayClass': 'custom-btn-type-draggable-blue' },
            DRAGGABLE_GREEN: { id: 'draggable-green', 'displayClass': 'custom-btn-type-draggable-green' },
            DRAGGABLE_BLACK: { id: 'draggable-black', 'displayClass': 'custom-btn-type-draggable-black' },
            DRAGGABLE_WITH_IMAGE: { 'displayClass': 'custom-btn-type-draggable-image' },
            TTS_BLUE: { id: 'tts-blue', 'displayClass': 'custom-btn custom-btn-tts-blue' },
            TTS_GREEN: { id: 'tts-green', 'displayClass': 'custom-btn custom-btn-tts-green' },
            TTS_ORANGE: { id: 'tts-orange', 'displayClass': 'custom-btn custom-btn-tts-orange' },
            TTS_WHITE: { id: 'tts-white', 'displayClass': 'custom-btn custom-btn-tts-white' },
            ALGEBRA_NEGATIVE: { id: 'algebra-negative', 'backgroundColor': '#b4065f', 'boxShadowColor': '#660336', 'textColor': '#FFF' }
        },

        /**
        * Type of behavious button holds
        * @property BEHAVIOR_TYPE
        * @type Object
        * @static
        */
        BEHAVIOR_TYPE: {
            TOGGLE: 'behavior-type-toggle',
            PUSH: 'behavior-type-push',
            TOGGLE_AND_PUSH: 'behavior-type-toggle-and-push'
        },


        /*
        * Bind the specified buttons in toggle buttons or push buttons or toggle & push form
        * @method setButtonBehavior
        * @param {Object} options, type of behavior and button array
        * @static
        */
        setButtonBehavior: function setButtonBehavior(options) {
            if (options.buttons && options.buttons.length > 0) {
                var buttons = options.buttons,
                    buttonsLength = buttons.length;

                var BUTTON_VIEW = MathInteractives.Common.Components.Theme2.Views.Button;
                switch (options.type) {
                    case BUTTON_VIEW.BEHAVIOR_TYPE.TOGGLE:
                        for (var i = 0; i < buttonsLength; i++) {
                            buttons[i].$el.off('click.button-behavior-click').on('click.button-behavior-click', function (event) {
                                BUTTON_VIEW.handleToggleBehavior(event, options);
                            });
                        }
                        break;
                    case BUTTON_VIEW.BEHAVIOR_TYPE.PUSH:
                        for (var i = 0; i < buttonsLength; i++) {
                            buttons[i].$el.off('click.button-behavior-click').on('click.button-behavior-click', function (event) {
                                BUTTON_VIEW.handlePushBehavior(event, options);
                            });
                        }
                        break;
                    case BUTTON_VIEW.BEHAVIOR_TYPE.TOGGLE_AND_PUSH:
                        for (var i = 0; i < buttonsLength; i++) {
                            buttons[i].$el.off('click.button-behavior-click').on('click.button-behavior-click', function (event) {
                                BUTTON_VIEW.handleToggleAndPushBehavior(event, options);
                            });
                        }
                        break;
                }
            }

        },

        /*
        * Hanldle toggle behavior of buttons
        * @method handleToggleBehavior
        * @param {object} event
        * @param {object} options
        * @static
        */
        handleToggleBehavior: function handleToggleBehavior(event, options) {
            var buttons = options.buttons,
                buttonsLength = buttons.length,
                currentButtonTarget = event.currentTarget,
                $currentButtonTarget = $(currentButtonTarget),
                BUTTON_VIEW = MathInteractives.Common.Components.Theme2.Views.Button;


            if ($currentButtonTarget.hasClass(BUTTON_VIEW.BUTTON_STATE_DISABLED) || $currentButtonTarget.hasClass(BUTTON_VIEW.BUTTON_STATE_SELECTED)) {
                return;
            }

            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonView = buttons[i];
                if (currentButtonView.getButtonState() !== BUTTON_VIEW.BUTTON_STATE_DISABLED) {
                    if (currentButtonTarget == currentButtonView.el) {
                        currentButtonView.setButtonState(BUTTON_VIEW.BUTTON_STATE_SELECTED);
                        var selectedButtonViewIndex = i;
                        setTimeout(function () {
                            buttons[selectedButtonViewIndex].$el.removeClass('clickEnabled').addClass('selected-toggle-button');
                        }, 1);
                    }
                    else {
                        currentButtonView.setButtonState(BUTTON_VIEW.BUTTON_STATE_ACTIVE);
                        currentButtonView.$el.removeClass('selected-toggle-button');
                    }
                }
            }
        },

        /*
        * Hanldle push behavior of buttons
        * @method handlePushBehavior
        * @param {object} event
        * @param {object} options
        * @static
        */
        handlePushBehavior: function handlePushBehavior(event, options) {
            var buttons = options.buttons,
                buttonsLength = buttons.length,
                currentButtonTarget = event.currentTarget,
                $currentButtonTarget = $(currentButtonTarget),
                BUTTON_VIEW = MathInteractives.Common.Components.Theme2.Views.Button;


            if ($currentButtonTarget.hasClass(BUTTON_VIEW.BUTTON_STATE_DISABLED)) {
                return;
            }

            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonView = buttons[i];
                if (currentButtonView.getButtonState() !== BUTTON_VIEW.BUTTON_STATE_DISABLED) {
                    if (currentButtonTarget == currentButtonView.el) {
                        if (currentButtonView.getButtonState() === BUTTON_VIEW.BUTTON_STATE_SELECTED) {
                            currentButtonView.setButtonState(BUTTON_VIEW.BUTTON_STATE_ACTIVE);
                        }
                        else {
                            currentButtonView.setButtonState(BUTTON_VIEW.BUTTON_STATE_SELECTED);
                        }
                    }
                }
            }
        },

        /*
        * Hanldle toggle and push behavior of buttons
        * @method handleToggleAndPushBehavior
        * @param {object} event
        * @param {object} options
        * @static
        */
        handleToggleAndPushBehavior: function handleToggleAndPushBehavior(event, options) {
            var buttons = options.buttons,
                    buttonsLength = buttons.length,
                    currentButtonTarget = event.currentTarget,
                    $currentButtonTarget = $(currentButtonTarget),
                    BUTTON_VIEW = MathInteractives.Common.Components.Theme2.Views.Button;


            if ($currentButtonTarget.hasClass(BUTTON_VIEW.BUTTON_STATE_DISABLED)) {
                return;
            }

            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonView = buttons[i];
                if (currentButtonView.getButtonState() !== BUTTON_VIEW.BUTTON_STATE_DISABLED) {
                    if (currentButtonTarget == currentButtonView.el) {
                        if (currentButtonView.getButtonState() === BUTTON_VIEW.BUTTON_STATE_SELECTED) {
                            currentButtonView.setButtonState(BUTTON_VIEW.BUTTON_STATE_ACTIVE);
                        }
                        else {
                            currentButtonView.setButtonState(BUTTON_VIEW.BUTTON_STATE_SELECTED);
                        }
                    }
                    else {
                        currentButtonView.setButtonState(BUTTON_VIEW.BUTTON_STATE_ACTIVE);
                    }
                }
            }
        },

        /*
        * to generate button as per the given requirement
        * @method generateButton
        * @param {object} buttonProps
        * @return buttonView {Object} button view
        * @static
        */
        generateButton: function generateButton(options) {
            /*
            buttonProps = {

            player,
            manager,
            path,
            idPrefix,

            data : {
                id:
                type:
                colorType:
                textColor:
                borderColor:
                borderWidth:
                border: true
                text:
                height:
                tooltipText:
                tooltipPosition:
                textPadding:
                imagePath:

            }

            }

            */

            var btnID;
            if (options) {
                if (options['data']['border'] === true && typeof options['data']['borderWidth'] === 'undefined') {
                    $.extend(options['data'], { 'borderWidth': MathInteractives.global.Theme2.Button.DEFAULT_BORDERWIDTH });
                }

                if ((options['data']['type'] === MathInteractives.global.Theme2.Button.TYPE.TTS_PAUSE) || (options['data']['type'] === MathInteractives.global.Theme2.Button.TYPE.TTS_PLAY) || (options['data']['type'] === MathInteractives.global.Theme2.Button.TYPE.TTS_SOUND)) {
                    if (typeof options['data']['colorType'] === 'undefined') {
                        $.extend(options['data'], { 'colorType': MathInteractives.global.Theme2.Button.DEFAULT_TTS_COLORTYPE });
                    }
                }

                if (typeof options['data']['colorType'] === 'undefined') {
                    $.extend(options['data'], { 'colorType': MathInteractives.global.Theme2.Button.DEFAULT_COLORTYPE });
                }

                if (options['data']['border'] === true && typeof options['data']['borderColor'] === 'undefined') {
                    $.extend(options['data'], { 'borderColor': options['data']['colorType']['borderColor'] });
                }

                if (typeof options['data']['type'] === 'undefined') {
                    $.extend(options['data'], { 'type': MathInteractives.global.Theme2.Button.DEFAULT_TYPE });
                }

                if (typeof options['data']['textPadding'] === 'undefined') {
                    $.extend(options['data'], { 'textPadding': options['data']['type']['textPadding'] });
                }

                if (typeof options['data']['isToggle'] === 'undefined') {
                    $.extend(options['data'], { 'isToggle': options['data']['type']['isToggle'] });
                }

                if (typeof options['data']['height'] === 'undefined') {
                    if (options['data']['type']['height']) {
                        $.extend(options['data'], { 'height': options['data']['type']['height'] });
                    } else {
                        $.extend(options['data'], { 'height': MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT });
                    }
                }
                if (typeof options['data']['width'] === 'undefined') {
                    if (options['data']['type']['width']) {
                        $.extend(options['data'], { 'width': options['data']['type']['width'] });
                    }
                }
                if (typeof options['data']['icon'] !== 'undefined') {
                    $.extend(options['data']['type'], { 'icon': options['data']['icon'] });
                }

                if (typeof options['data']['iconPadding'] === 'undefined') {
                    $.extend(options['data'], { 'iconPadding': options['data']['type']['iconPadding'] });
                }

                if (typeof options['data']['baseClass'] === 'undefined' || options['data']['baseClass'] === null) {
                    $.extend(options['data'], { 'displayClass': options['data']['colorType']['displayClass'] });
                } else {
                    $.extend(options['data'], { 'displayClass': 'custom-btn ' + options['data']['baseClass'] });
                }


                if (typeof options['data']['textColor'] === 'undefined') {
                    $.extend(options['data'], { 'textColor': options['data']['colorType']['textColor'] });
                }
                if (typeof options['data']['boxShadowColor'] === 'undefined') {
                    $.extend(options['data'], { 'boxShadowColor': options['data']['colorType']['boxShadowColor'] });
                }

                btnID = '#' + options['data']['id'];
                var buttonModel = new MathInteractives.Common.Components.Theme2.Models.Button(options['data']);
                buttonModel.player = options['player'];
                buttonModel.idPrefix = options['idPrefix'];
                buttonModel.manager = options['manager'];
                buttonModel.filePath = options['path'];
                var buttonView = new MathInteractives.Common.Components.Theme2.Views.Button({ el: btnID, model: buttonModel });




                return buttonView;
            }
        },

    });

    if (!MathInteractives.global.Theme2) {
        MathInteractives.global.Theme2 = {};
    }

    MathInteractives.global.Theme2.Button = MathInteractives.Common.Components.Theme2.Views.Button;
})();
