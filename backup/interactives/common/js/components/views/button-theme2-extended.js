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
    MathInteractives.Common.Components.Theme2.Views.ButtonExtended = MathInteractives.Common.Components.Theme2.Views.Button.extend({

        /**
        * Get data from model & set in view, Calls render
        *
        * @method initialize
        **/
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, arguments);
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
            iconPadding = this.model.get('iconPadding'),
            paddingBetnIconText = this.model.get('paddingBetnIconText') ? this.model.get('paddingBetnIconText') : 10;
            this.$btn.empty();


            //if user want to override width of a button
            if (this.model.get('width')) calculatedWidth = this.model.get('width');

            this.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);

            switch (type) {
                case MathInteractives.global.Theme2.Button.TYPE.FA_ICON:
                    this._renderFaIcon($divBtn, $divIcon, $divShadow);
                    break;

                case MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT:
                    calculatedWidth = this.getButtonWidth(calculatedWidth + paddingBetnIconText);
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
                    calculatedWidth = this.getButtonWidth(calculatedWidth);
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
                            'box-shadow': 'inset 0px -5px ' + this.model.get('boxShadowColor') + ', 1px 1px 5px #aaa'
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
                            if (type === MathInteractives.global.Theme2.Button.TYPE.ICONTEXT) {
                                calculatedWidth = this.getButtonWidth(calculatedWidth + paddingBetnIconText);
                            }
                            else {
                                calculatedWidth = this.getButtonWidth(calculatedWidth);
                            }
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
                textPadding = this.model.get('textPadding'),
                paddingBetnIconText = this.model.get('paddingBetnIconText') ? this.model.get('paddingBetnIconText') : 10;

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
                textPadding = (this.model.get('width') - textDimensions.width - icon['width'] - paddingBetnIconText) / 2;
                if (textPadding <= 15) {
                    textPadding = (this.model.get(textPadding)) ? this.model.get(textPadding) : 15;
                }
            }

            if (this.model.get('textPosition') === 'left') {
                $divBtn.append($divText).append($divIcon);
                $divText.css({ 'margin-left': textPadding });
                $divIcon.css({ 'margin-left': paddingBetnIconText });
            } else /*if(this.model.get('textPosition') === 'right')*/ {
                $divBtn.append($divIcon).append($divText);
                $divIcon.css({ 'margin-left': textPadding });
                $divText.css({ 'margin-left': paddingBetnIconText });
                //$divText.css({ 'width': textDimensions.width + paddingBetnIconText });
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
                'width': combinedWidth + (2 * textPadding) + paddingBetnIconText
            });
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
            var icon = this.model.get('icon') ? this.model.get('icon') : { 'iconPath': this.filePath.getImagePath(MathInteractives.global.Theme2.Button.BUTTON_ICON_PATH) },
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
                var paddingBetnIconText = this.model.get('paddingBetnIconText') ? this.model.get('paddingBetnIconText') : 10;

                $divText.css({
                    'width': textDimensions.width,
                    'float': 'left'
                }).append(text);

                $divIcon.css({
                    'float': 'left'
                });

                if (this.model.get('width')) {
                    textPadding = (this.model.get('width') - textDimensions.width - icon['width'] - paddingBetnIconText) / 2;
                    if (textPadding <= 15) {
                        textPadding = (this.model.get(textPadding)) ? this.model.get(textPadding) : 15;
                    }
                }

                if (this.model.get('textPosition') === 'left') {
                    $divBtn.append($divText).append($divIcon);
                    $divText.css({ 'margin-left': textPadding });
                    $divIcon.css({ 'margin-left': paddingBetnIconText });
                } else /*if(this.model.get('textPosition') === 'right')*/ {
                    $divBtn.append($divIcon).append($divText);
                    $divIcon.css({ 'margin-left': textPadding });
                    $divText.css({ 'margin-left': paddingBetnIconText });
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
                var divBtnWidth = combinedWidth + (2 * textPadding);
                $divBtn.css({
                    'height': resHeight,
                    'width': divBtnWidth + paddingBetnIconText
                });
            } else {

                if (this.model.get('width')) {
                    textPadding = (this.model.get('width') - icon['width']) / 2;
                    if (textPadding <= 15) {
                        textPadding = (this.model.get(textPadding)) ? this.model.get(textPadding) : 15;
                    }
                }

                resHeight = this.model.get('height') ? this.model.get('height') : icon['height'];
                if (resHeight < MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT) {
                    resHeight = MathInteractives.global.Theme2.Button.DEFAULT_MINHEIGHT;
                }

                $divIcon.css({ 'margin-top': (resHeight / 2) - (icon['height'] / 2), 'margin-left': textPadding });

                var divBtnWidth = icon['width'] + (2 * textPadding);
                $divBtn.css({
                    'height': resHeight,
                    'width': divBtnWidth
                }).append($divIcon);
            }
        },

        /*
        * Returns and sets minimum width of button equal to 115px
        * @method getButtonWidth
        * @param {number} calculatedWidth calculated width of button including text, iconwidth, padding etc
        * @return {number} button width
        * @public
        */
        getButtonWidth: function getButtonWidth(calculatedWidth) {
            var btnWidth = this.model.get('width');
            if (btnWidth === null || typeof btnWidth === 'undefined') {
                if (calculatedWidth < MathInteractives.global.Theme2.Button.DEFAULT_MINWIDTH) {
                    this.model.set('width', MathInteractives.global.Theme2.Button.DEFAULT_MINWIDTH);
                   return MathInteractives.global.Theme2.Button.DEFAULT_MINWIDTH;
                }
                else {
                    this.model.set('width', calculatedWidth);
                    return calculatedWidth;
                }
            }
            else {
                    return btnWidth;
            }
        }

    }, {
        
        /*
        * to generate button as per the given requirement
        * @method generateButton
        * @param {object} buttonProps
        * @return buttonView {Object} button view
        * @static
        */
        
        generateButton: function generateButton(options) {
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
                var buttonView = new MathInteractives.Common.Components.Theme2.Views.ButtonExtended({ el: btnID, model: buttonModel });
                return buttonView;
            }
        }
    });
    MathInteractives.global.Theme2.ButtonExtended = MathInteractives.Common.Components.Theme2.Views.ButtonExtended;
})();
