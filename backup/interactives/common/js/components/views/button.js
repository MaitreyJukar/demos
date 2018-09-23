
(function () {
    'use strict';

    /**
    * View for rendering button and its related events
    *
    * @class Button
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.Button = MathInteractives.Common.Player.Views.Base.extend({

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
        * Holds the interactivity manager reference
        * @property manager
        * @default null
        * @private
        */
        manager: null,

        /**
        * Sets true if left mouse button is down
        *
        * @property isLeftDown
        * @type {Boolean}
        * @defaults false
        */
        isLeftDown: false,
        /**
        * jQuery object of button
        *
        * @property $btn
        * @type Object
        * @defaults null
        */
        $btn: null,

        /*
        * Sets as true if custom button
        * @property _isCustomButton
        * @type {bool}
        * @default null
        */
        _isCustomButton: null,

        /**
        * Button tooltip Backbone.js view
        *
        * @property btnTooltipView
        * @type Object
        * @defaults null
        */
        btnTooltipView: null,

        /*
        * Stores height of button
        * @property _height
        * @default 32
        * @type number
        * @private
        */
        _height: 32,

        /*
        * padding in sprites
        * @property _padding
        * @default 10
        * @type {number}
        * @private
        */
        _padding: 10,

        /*
        * Stores background position as per height
        * @property _backgroundPositions
        * @default null
        * @type {object}
        * @private
        */
        _backgroundPositions: null,

        /*
        * @type bool
        * @property _heightChanged
        * @default false
        * @private
        */
        _heightChanged: false,

        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Specifies type of button to be generated
        * @property _btnType
        * @type Object
        * @defaults null
        */
        _btnType: null,

        /**
        * Stores slice value for current button type
        * @property _btnImgSlice
        * @type String
        * @defaults null
        */
        _btnImgSlice: null,

        /**
        * Stores button text or icon left and right padding value
        * @property _btnContentPadding
        * @type Number
        * @defaults null
        */
        _btnContentPadding: 10,


        /**
       * Add group name to buttons in same group to keep there width equal
       * @property btnWidthGroup
       * @type String
       * @defaults null
       */
        btnWidthGroup: null,

        /**
       * to maintain legend button state
       * @property isLegendDown
       * @type boolean
       * @defaults false
       */
        _isLegendDown: false,

        _touchStartTimer: null,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {
            this.player = this.model.get('player');
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this._btnType = this.model.get('type');
            this.filePath = this.model.get('path');
            var height = this.model.get('height');

            if (this._btnType.height) {
                this._height = this._btnType.height;
            }
            else if (height !== null && height !== this._height) {
                this._height = height;
            }

            var padding = this.model.get('padding');
            if (padding !== null) {
                this._padding = padding;
            }

            if (this._btnType === MathInteractives.Common.Components.Views.Button.TYPE.CUSTOM) {
                this._isCustomButton = true;
            }

            this.render();
            this._attachEvents();
            this._attachTooltip();

            if (this._btnType.isDraggable || this.model.get('isDraggable')) {
                this._addDraggableIcon();
            }
        },

        /**
        * Renders button text
        *
        * @method render
        **/
        render: function render() {
            this.$btn = this.$el;
            var text = this.model.get('text');
            var icon = this.model.get('icon');
            var imagePathIds = this.model.get('imagePathIds');
            var width = this.model.get('width'),
            displayType = this.model.get('displayType');

            displayType = displayType || null;

            if (this.el.id.length === 0) {
                this.$btn = $('#' + this.model.get('id'));
            }


            /* Set custom button image slice value*/
            if (this._isCustomButton) {
                if (imagePathIds) {
                    if (imagePathIds.length === 1) {
                        this._btnImgSlice = MathInteractives.Common.Components.Views.Button.IMAGESLICE.SINGLE;
                    }
                    else if (imagePathIds.length === 2) {
                        this._btnImgSlice = MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE;
                    }
                }
            }
            else {
                this._btnImgSlice = this._btnType.slice;
                /*Set icon and text if it is provided in button type constant*/
                if (this._btnType.icon && displayType !== 'both') {
                    icon = this._btnType.icon;
                    this.model.set('icon', icon);
                }
                else {
                    if (this._btnType.hasText) {
                        this.loadScreen('common-button-text');
                        text = this.getMessage('common-button-text', this._btnType.id + '-button');
                        this.model.set('text', text);
                        if (displayType === 'both') {
                            icon = this._btnType.icon;
                            this.model.set('icon', icon);
                        }
                    }
                }
            }

            /*Check if button icon is passed by interactivity, if not default icon image sprite from common will be applied*/
            if (icon) {
                if (!icon.pathId) {
                    icon.pathId = 'buttons-icons';
                }

                if (!icon.iconClass) {
                    icon.iconClass = '';
                }

                this.model.set('icon', icon);
            }


            if (this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE) {
                /*Initialize height for three slice button*/
                if (!this._isCustomButton) {
                    this._getImageHeightWidth(this._btnType.category + '-button').width
                }
                this._generateButton();
            }
            else if (this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.SINGLE) {
                if (this._isCustomButton) {
                    this.$btn.css({
                        'background-image': 'url("' + this.filePath.getImagePath(imagePathIds[0]) + '")'
                    });
                }
                else {
                    var baseClass = this._btnType.category + '-button';
                    this.$btn.css({
                        'background-image': 'url("' + this.filePath.getImagePath(this._btnType.category + '-button') + '")'
                    }).addClass(baseClass);

                    this.model.set('baseClass', baseClass);
                    this._height = this.$btn.height();
                    width = this.$btn.width();
                }

                if (icon !== null) {
                    /*Append icon in button*/
                    var $iconDiv = $('<div>', {
                        'class': 'button-icon button-content'
                    }).css({
                        'height': icon.height,
                        'width': icon.width,
                        'margin-top': (this._height / 2) - (icon.height / 2),
                        'margin-left': (width / 2) - (icon.width / 2),
                        'background-image': 'url("' + this.filePath.getImagePath(icon.pathId) + '")'
                    }).addClass(icon.iconClass);

                    this.$btn.append($iconDiv);
                }
                else if (text !== null) {
                    /*Append text in button*/
                    var textDimentions = this._getTextHeightWidth(text, this._btnType.category + '-button-text', this._btnType.category + '-button');
                    var $textChild = $('<div>', {
                        'class': this._btnType.category + '-button-text button-content',
                        'text': text
                    }).css({
                        'margin-top': (this._height / 2) - (textDimentions.height / 2),
                        'margin-left': (width / 2) - (textDimentions.width / 2)
                    });

                    this.$btn.append($textChild);
                }

                this.$btn.css({
                    'height': this._height,
                    'width': width
                }).addClass(this._btnType.category + '-button click-enabled');
            }


            this._resizeGrpBtnWidth();

            if (this.model.get('isLegend') === true) {
                this.$btn.off('click.graphlegend');
                this.$btn.on('click.graphlegend', $.proxy(this._legendClick, this));
            }
        },


        /*
        * Resize button as per group, sets the width of max btn to all btns in the group
        * @method __resizeGrpBtnWidth
        * @private
        */
        _resizeGrpBtnWidth: function _resizeGrpBtnWidth() {
            this.btnWidthGroup = this.model.get('btnWidthGroup');
            var btnWidthGroup = this.btnWidthGroup, $groupElements, $elem, maxMiddleCellWidth, maxWidth, elemWidth, elemHtml, firstChildWidth;

            if (btnWidthGroup != undefined) {

                this.$el.addClass(btnWidthGroup);

                $groupElements = $('.' + btnWidthGroup);

                //getting width of current generated button
                maxMiddleCellWidth = this.$el.find('.mid-child').width();
                firstChildWidth = this.$el.find(this.$el.children()[0]).width();
                maxWidth = maxMiddleCellWidth + firstChildWidth * 2;


                //Checking the current width with other elements in the group to determine max width
                for (var i = 0; i < $groupElements.length; i++) {
                    $elem = $groupElements[i];
                    elemWidth = $("#" + $elem.id).width()
                    if (elemWidth > maxWidth) {
                        maxWidth = elemWidth;
                        maxMiddleCellWidth = maxWidth - firstChildWidth * 2;
                    }

                }

                //applying the Max width to all elements in the group
                for (i = 0; i < $groupElements.length; i++) {
                    $elem = $($groupElements[i]);
                    $elem.css("width", maxWidth);
                    $elem.find('.mid-child').css("width", maxMiddleCellWidth);
                    $elem.find('.button-content').css({
                        "width": maxMiddleCellWidth + firstChildWidth * 2,
                        "margin-left": "auto",
                        "margin-right": "auto",
                    });

                }
            }
        },


        /*
        * Generating a 3 slice button
        * @method _generateButton
        */
        _generateButton: function () {

            var imagePathIds = this.model.get('imagePathIds'),
                width = this.model.get('width'),
                midWidth,
                $firstChild,
                $midChild,
                $thirdChild,
                $textChild,
                text = this.model.get('text'),
                icon = this.model.get('icon'),
                displayType = this.model.get('displayType') || null,
                iConPosition = this.model.get('iConPosition') || 'right',
                contentContanier = null,
                $contentContanier = null,
                iconContainer = null,
                $iconContainer = null,
                textContainer = null,
                $textContainer = null,
                currBtn = this.$btn,
                iConContainerWidth = null,
                textContainerWidth = null;


            $firstChild = $('<div>', {
                'class': this._btnType.category + '-button-first-child'
            });

            $midChild = $('<div>', {
                'class': this._btnType.category + '-button-mid-child mid-child'
            });

            $thirdChild = $('<div>', {
                'class': this._btnType.category + '-button-third-child'
            });

            this.$btn.html('')
                    .append($firstChild)
                    .append($midChild)
                    .append($thirdChild)
                    .addClass(this._btnType.category + '-button button-common click-enabled');

            //setting width of button
            if (displayType !== 'both') {
                if (icon !== null) {
                    if (width) {
                        this._btnContentPadding = (width - icon.width) / 2;
                    }
                    else {
                        width = icon.width + 2 * this._btnContentPadding;
                    }

                    $textChild = $('<div>', {
                        'class': 'button-icon button-content'
                    }).css({
                        'height': icon.height,
                        'width': icon.width,
                        'margin-top': (this._height / 2) - (icon.height / 2),
                        'margin-left': this._btnContentPadding,
                        'background-image': 'url("' + this.filePath.getImagePath(icon.pathId) + '")'
                    }).addClass(icon.iconClass);

                    this.$btn.append($textChild);
                }
                else {
                    $textChild = $('<div>', {
                        'class': this._btnType.category + '-button-text button-content'
                    });

                    this.$btn.append($textChild);
                    $textChild.html(this.model.get('text'));
                    var textDimention = this._getTextHeightWidth(text, this._btnType.category + '-button-text', this._btnType.category + '-button'),
                        textWidth = textDimention.width,
                        textHeight = textDimention.height;

                    if (width) {
                        this._btnContentPadding = (width - textWidth) / 2;
                    }
                    else { // if (!width) {
                        width = textWidth + 2 * this._btnContentPadding;
                    }

                    if (this.model.get('fixedMinWidth') === true) {
                        /*-----------------------Set button min width----------------------------*/
                        if (this._btnType.category === MathInteractives.Common.Components.Views.Button.TYPE.GENERAL.category || this._btnType.category === MathInteractives.Common.Components.Views.Button.TYPE.ACTION.category) {
                            if (width < MathInteractives.Common.Components.Views.Button.BUTTON_MIN_WIDTH) {
                                width = MathInteractives.Common.Components.Views.Button.BUTTON_MIN_WIDTH;
                            }
                        }
                        /*--------------------------------------------------------------*/
                    }
                    this._btnContentPadding = (width - textWidth) / 2;
                    $textChild.css({
                        //'width': textWidth,
                        'margin-top': Math.ceil((this._height - textHeight) / 2),
                        'margin-left': this._btnContentPadding
                    });
                }
            }
            else {

                iConContainerWidth = icon.width;
                textContainerWidth = this._getTextHeightWidth(text, this._btnType.category + '-button-text', this._btnType.category + '-button').width;



                contentContanier = document.createElement('div');
                iconContainer = document.createElement('div');
                textContainer = document.createElement('div');

                $contentContanier = $(contentContanier).addClass(this._btnType.category + '-button');
                $iconContainer = $(iconContainer);
                $textContainer = $(textContainer).addClass(this._btnType.category + '-button-text');

                width = iConContainerWidth + textContainerWidth + 5;
                currBtn.append($contentContanier).css({ 'width': width });
                $midChild.css({ 'width': width - 14 });

                $iconContainer = $('<div>', {
                    'class': 'button-icon button-content'
                }).css({
                    'height': icon.height,
                    'width': icon.width,
                    'background-image': 'url("' + this.filePath.getImagePath(icon.pathId) + '")',
                    'position': 'relative',
                    'float': 'left'


                }).addClass(icon.iconClass);

                $textContainer.html(text)
                              .css({
                                  'line-height': currBtn.height() + 'px',
                                  'width': textContainerWidth,
                                  'position': 'relative',
                                  'float': 'left'
                              });

                $contentContanier.css({
                    'position': 'absolute'
                });

                if (iConPosition === 'left') {

                    $contentContanier.append($iconContainer)
                                     .append($textContainer);
                    $textContainer.css({
                        //  'margin-left':'-14px'

                    });
                    $iconContainer.css({
                        //  'margin-left':'7px'

                    });


                }
                else {
                    if (iConPosition === 'right') {

                        $contentContanier.append($textContainer)
                                         .append($iconContainer);
                        //  $iconContainer.css({'margin-left':'8px'});
                        $textContainer.css({
                            'margin-left': '5px'
                        });

                    }
                }
            }
            this.$btn.css({
                width: width
            });
            if (this._height) {
                this.$btn.css({
                    height: this._height
                })
            }

            var imageWidth = $firstChild.width();
            midWidth = width - 2 * imageWidth;

            if (this._isCustomButton) {
                var cornerSliceImgWidth = this.model.get('cornerSliceImgWidth');
                if (cornerSliceImgWidth) {
                    $firstChild.css({ 'width': cornerSliceImgWidth });
                    $thirdChild.css({ 'width': cornerSliceImgWidth });

                    midWidth = width - 2 * cornerSliceImgWidth;
                }
            }

            $midChild.css({
                'width': midWidth
            });

            if (this._isCustomButton) {
                this._changeImage();
                if (icon !== null) {
                    this._changeHeight($textChild, true);
                }
                else {
                    this._changeHeight($textChild, false);
                }
            }
            else {
                $firstChild.css({ 'background-image': 'url("' + this.filePath.getImagePath(this._btnType.category + '-button') + '")' });
                $midChild.css({ 'background-image': 'url("' + this.filePath.getImagePath(this._btnType.category + '-button-mid') + '")' });
                $thirdChild.css({ 'background-image': 'url("' + this.filePath.getImagePath(this._btnType.category + '-button') + '")' });
            }
        },

        /*
        * Calculates the text width
        * @method _getTextHeightWidth
        * @param text
        * @return {Object} height and width
        * @private
        **/
        _getTextHeightWidth: function (text, classes, parentClasses) {

            if (this.player) {
                //console.log('button  ' + text + ':  from player');
                return this.player.getTextHeightWidth(text, classes, null, parentClasses);
            }

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
        * @param text
        * @return {number} width
        * @private
        **/
        _getImageHeightWidth: function (imagePathId) {
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

        /*
        * Calculates the button height
        * @method _getButtonHeight
        * @param text
        * @return {number} width
        * @private
        **/
        _getButtonHeight: function ($textDiv) {
            var height;

            //var $temp = $('<div>').addClass('de-mathematics-interactive');
            //$temp.html(text);
            //$('body').append($temp);
            //height = $temp.getTextHeight();
            //$temp.hide();
            //$temp.remove();

            //var $temp = $textDiv.clone().removeAttr('id').insertAfter($textDiv);

            var $temp = $textDiv.clone().removeAttr('id').appendTo($('body')).addClass('de-mathematics-interactive')
            .css({
                'font-size': $textDiv.css('font-size'),
                'font-weight': $textDiv.css('font-weight'),
                'height': $textDiv.css('height'),
                'text-align': $textDiv.css('text-align')
            }); /*properties inherited in body without testing stub*/

            //var $temp = $('<div>').appendTo($('body')).attr('style', $textDiv.attr('style'))
            //.addClass($textDiv.attr('class')).html($textDiv.html());

            height = $temp.getTextHeight();
            $temp.hide();
            $temp.remove();
            return height;
        },

        /*
        * Change button image if specified by user
        * @method _changeImage
        */
        _changeImage: function () {
            var imagePathIds = this.model.get('imagePathIds'),
                currView = this;

            if (imagePathIds === null) {
                return;
            }

            var btnTypeCategory = this._btnType.category;
            this.$btn.find('div').each(function (index) {
                if ($(this).hasClass(btnTypeCategory + '-button-first-child') || $(this).hasClass(btnTypeCategory + '-button-third-child')) {
                    $(this).css({ 'background-image': 'url("' + currView.filePath.getImagePath(imagePathIds[0]) + '")' });
                } else if ($(this).hasClass(btnTypeCategory + '-button-mid-child')) {
                    $(this).css({ 'background-image': 'url("' + currView.filePath.getImagePath(imagePathIds[1]) + '")' });
                }

                /*
                if (index === 0 || index === 2) {
                $(this).css({ 'background-image': 'url("' + currView.filePath.getImagePath(imagePathIds[0]) + '")' });
                }
                else if (index === 1) {
                $(this).css({ 'background-image': 'url("' + currView.filePath.getImagePath(imagePathIds[1]) + '")' });
                }
                */
            });

        },

        /*
        * Change button height if specified by user
        * @method _changeImage
        */
        _changeHeight: function ($contentChild, isIcon) {
            var height = this._height;

            /*if (this._heightChanged === false) {
            return;
            }*/

            this.$btn.find('div').each(function (index) {
                if (index === 0 || index === 1 || index === 2) {
                    $(this).css({
                        'height': height
                    });
                }
            });

            this.$btn.css({ height: height });

            if (isIcon) {
                var icon = this.model.get('icon');
                $contentChild.css({ 'margin-top': (height / 2) - (icon.height / 2) });
            }
            else {
                var textDimentions = this._getTextHeightWidth(this.model.get('text'), this._btnType.category + '-button-text', this._btnType.category + '-button');
                $contentChild.css({ 'margin-top': (height - textDimentions.height) / 2 });
            }

            this._generateBackgroundPosition();
        },


        /*
        * Generates new background position as per specified height
        * @method _generateBackgroundPosition
        * @private
        */
        _generateBackgroundPosition: function () {
            var backgroundPostion = { active: {}, hover: {}, down: {}, disabled: {}, selected: {} };
            var height = this._height;
            var padding = this._padding;
            var gapInBetween = height + padding;
            var initialActive = 0;
            var initialHover = 2 * gapInBetween;
            var initialDown = 4 * gapInBetween;
            var initialDisabled = 6 * gapInBetween;
            var initialSelected = 8 * gapInBetween;

            backgroundPostion.active[0] = initialActive;
            backgroundPostion.hover[0] = initialHover;
            backgroundPostion.down[0] = initialDown;
            backgroundPostion.disabled[0] = initialDisabled;
            backgroundPostion.selected[0] = initialSelected;

            backgroundPostion.active[1] = 0;
            backgroundPostion.hover[1] = gapInBetween;
            backgroundPostion.down[1] = 2 * gapInBetween;
            backgroundPostion.disabled[1] = 3 * gapInBetween;
            backgroundPostion.selected[1] = 4 * gapInBetween;

            backgroundPostion.active[2] = initialActive + gapInBetween;
            backgroundPostion.hover[2] = initialHover + gapInBetween;
            backgroundPostion.down[2] = initialDown + gapInBetween;
            backgroundPostion.disabled[2] = initialDisabled + gapInBetween;
            backgroundPostion.selected[2] = initialSelected + gapInBetween;

            this._backgroundPositions = backgroundPostion;
            this._applyNewPosition('active');
        },


        /*
        * Apply new background position
        * @method _applyNewPosition
        * @param {string} state
        * @private
        */
        _applyNewPosition: function (state) {
            var currentBackgroundPosition = this._backgroundPositions[state];
            var btnChildren = this.$btn.find('div');
            var btnTypeCategory = this._btnType.category;
            var initial = this.model.get('imagePositions') || [0, 0, 0];
            this.$btn.find('div').each(function (index) {
                if ($(this).hasClass(btnTypeCategory + '-button-first-child')) {
                    $(this).css({ 'background-position': '0px -' + (currentBackgroundPosition[0] + initial[0]) + 'px' });
                } else if ($(this).hasClass(btnTypeCategory + '-button-mid-child')) {
                    $(this).css({ 'background-position': '0px -' + (currentBackgroundPosition[1] + initial[1]) + 'px' });
                } else if ($(this).hasClass(btnTypeCategory + '-button-third-child')) {
                    $(this).css({ 'background-position': '0px -' + (currentBackgroundPosition[2] + initial[2]) + 'px' });
                }
            });

            /*
            for (var divIndex = 0; divIndex < 3; divIndex++) {
            $(btnChildren[divIndex]).css({
            'background-position': '0px -' + currentBackgroundPosition[divIndex] + 'px'
            });
            }
            */
        },

        /**
        * Attaches mouse and touch events to button
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var $btn = this.$btn;

            //if (!$.support.touch) {
            $btn.on('mouseover', $.proxy(this._onMouseOver, this));
            $btn.on('mouseout', $.proxy(this._onMouseOut, this));
            //$btn.hover($.proxy(this._onMouseOver, this), $.proxy(this._onMouseOut, this));
            $btn.on('mousedown', $.proxy(this._onMouseDown, this));
            $btn.on('mouseup', $.proxy(this._removeTooltip, this));
            //}
            //else {
            //    $btn.on('touchstart', $.proxy(this._touchStartEvent, this));
            //    $btn.on('touchend', $.proxy(this._removeTooltip, this));
            //    //$btn.on('click', $.proxy(this._onMouseup, this));
            //}
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($btn);
            $btn.on('click', $.proxy(this._onToggle, this));
        },

        /**
        * Sets the state of button as 'active', 'selected' or 'disabled'
        *
        * @method setButtonState
        * @param {String} [state] State to be set
        **/
        setButtonState: function setButtonState(state) {
            var staticDataHolder = MathInteractives.Common.Components.Views.Button,
                baseClass = this.model.get('baseClass'),
                newClass = null,
                currentState = null,
                disabledClass = 'disabled',
                downClass = 'down',
                selectedClass = 'selected',
                hoverClass = 'hover',
                manager = this.manager,
                isThreeSliceButton = this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE ? true : false;

            this.$btn.find('div').removeClass(disabledClass + ' ' + downClass + ' ' + selectedClass + ' ' + hoverClass);

            if (!isThreeSliceButton) {
                disabledClass = baseClass + '-disabled';
                downClass = baseClass + '-down';
                selectedClass = baseClass + '-selected';
                hoverClass = baseClass + '-hover';

                this.$btn.removeClass(disabledClass + ' ' + downClass + ' ' + selectedClass + ' ' + hoverClass);
            }

            switch (state) {
                case staticDataHolder.BUTTON_STATE_ACTIVE:
                    currentState = staticDataHolder.BUTTON_STATE_ACTIVE;
                    newClass = isThreeSliceButton ? 'active' : baseClass;
                    this.$btn.addClass('click-enabled');
                    if (manager) {
                        manager.enableTab(this.$btn.attr('id'), true);
                    }
                    break;

                case staticDataHolder.BUTTON_STATE_SELECTED:
                    currentState = staticDataHolder.BUTTON_STATE_SELECTED;
                    newClass = isThreeSliceButton ? 'selected' : baseClass + '-selected';
                    var $button = this.$btn;
                    var self = this;
                    setTimeout(function () {
                        if (self.getButtonState() === MathInteractives.Common.Components.Views.Button.BUTTON_STATE_DISABLED) {
                            $button.removeClass('click-enabled');
                            if (manager) {
                                manager.enableTab($button.attr('id'), false);
                            }
                        }
                    }, 1);
                    break;

                case staticDataHolder.BUTTON_STATE_DISABLED:
                    currentState = staticDataHolder.BUTTON_STATE_DISABLED;
                    newClass = isThreeSliceButton ? 'disabled' : baseClass + '-disabled';
                    var $button = this.$btn;
                    var self = this;
                    setTimeout(function () {
                        if (self.getButtonState() === MathInteractives.Common.Components.Views.Button.BUTTON_STATE_DISABLED) {
                            $button.removeClass('click-enabled');
                            if (manager) {
                                manager.enableTab($button.attr('id'), false);
                            }
                        }
                    }, 1);
                    break;
            }

            if (isThreeSliceButton) {

                this.$btn.find('div').addClass(newClass);

                if (this._isCustomButton) {
                    this._applyNewPosition(newClass);
                }
            }
            else {
                this.$btn.addClass(newClass);
                this.$btn.find('div').addClass(currentState)
            }
            this.model.currentState = currentState;
        },

        getButtonState: function getButtonState() {
            return this.model.currentState;
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

            if (this.model.currentState === MathInteractives.Common.Components.Views.Button.BUTTON_STATE_ACTIVE) {
                isActive = true;
            }

            return isActive;
        },

        /**
        * Changes cursor, if button is active and adds hover effect
        *
        * @method _onMouseOver
        * @private
        **/
        _onMouseOver: function _onMouseOver(event) {
            var isToggleType = this.model.get('toggleButton'),
                btnState = this.getButtonState(),
                disabledState = MathInteractives.Common.Components.Views.Button.BUTTON_STATE_DISABLED;

            if ((!isToggleType && !this._isBtnActive()) || (isToggleType && btnState === disabledState)) {
                if (!this.$btn.data('isPushButton') || btnState === disabledState) {
                    this.$btn.children().each(function () {
                        $(this).css('cursor', 'default');
                    });
                }

                if (this.btnTooltipView) {
                    this.btnTooltipView.updateElementPos(this.$btn.offset());
                    this.btnTooltipView.showTooltip();
                }
                return;
            }
            else if (isToggleType && btnState === MathInteractives.Common.Components.Views.Button.BUTTON_STATE_SELECTED) {
                this.$btn.children().each(function () {
                    $(this).css('cursor', 'pointer');
                });
                if (this.btnTooltipView) {
                    this.btnTooltipView.updateElementPos(this.$btn.offset());
                    this.btnTooltipView.showTooltip();
                }
                return;
            }

            var baseClass = this.getBaseClass();
            if (this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE) {
                if (!this.$btn.find('div').hasClass('down')) {
                    this.$btn.find('div').addClass('hover');

                    if (this._isCustomButton) {
                        this._applyNewPosition('hover');
                    }
                }
            }
            else {
                this.$btn.addClass(baseClass + '-hover');
            }
            this.$btn.children().each(function () {
                $(this).css('cursor', 'pointer');
            });

            if (this.btnTooltipView) {
                this.btnTooltipView.updateElementPos(this.$btn.offset());
                this.btnTooltipView.showTooltip();
            }
        },

        /**
        * Removes tooltip and hover effect
        *
        * @method _onMouseOut
        * @private
        **/
        _onMouseOut: function _onMouseOut(event) {
            /*if (!this._isBtnActive()) {
            return;
            }*/
            var isToggleType = this.model.get('toggleButton'),
               btnState = this.getButtonState(),
               disabledState = MathInteractives.Common.Components.Views.Button.BUTTON_STATE_DISABLED;

            if ((!isToggleType && !this._isBtnActive()) || (isToggleType && btnState === disabledState)) {
                if (!this.$btn.data('isPushButton') || btnState === disabledState) {
                    this.$btn.children().each(function () {
                        $(this).css('cursor', 'default');
                    });
                }
                this._removeTooltip();
                return;
            }

            var baseClass = this.getBaseClass();
            if (this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE) {

                this.$btn.find('div').removeClass('hover');
                if (this._isCustomButton) {
                    if (this.$btn.find('div').hasClass('down')) {
                        this._applyNewPosition('down');
                    }
                    else {
                        this._applyNewPosition('active');
                    }

                }
            }
            else {
                this.$btn.removeClass(baseClass + '-hover');
            }

            this._removeTooltip();
        },

        /**
        * Adds selected state to button
        *
        * @method _onMouseDown
        * @private
        **/
        _onMouseDown: function _onMouseDown(event) {
            if (!this._isBtnActive()) {
                return;
            }
            $(document).one({
                'mouseup': $.proxy(this._onMouseup, this),
                //  'touchend': $.proxy(this._onMouseup, this)
            });
            //MathInteractives.Common.Utilities.Models.Utils.EnableTouch(document);
            //if (this.btnTooltipView && $.support.touch) {
            //if (this.btnTooltipView) {
            //    this.btnTooltipView.updateElementPos(this.$btn.offset());
            //    this.btnTooltipView.showTooltip();
            //}


            //if (!$.support.touch && event.which !== 1) {
            if (event.which !== 1) {
                if (this.$btn.find('div').hasClass('down') || this.$btn.hasClass(this.getBaseClass() + '-down')) {
                    $(document).on("contextmenu", this.returnFalse); // disable contextmenu
                }
                return;
            }
            //this.isLeftDown = true;
            var baseClass = this.getBaseClass();
            if (this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE) {


                this.$btn.find('div').addClass('down');
                if (this._isCustomButton) {
                    this._applyNewPosition('down');
                }
            }
            else {
                this.$btn.addClass(baseClass + '-down');
            }


            if (this.$btn.find('div').hasClass('down') || this.$btn.hasClass(this.getBaseClass() + '-down')) {
                $(document).on("contextmenu", this.returnFalse); // disable contextmenu
            }



        },

        /**
        * Removes selected state of button
        *
        * @method _onMouseup
        * @private
        **/
        _onMouseup: function _onMouseup(event) {
            //if (this._touchStartTimer !== null) {
            //    window.clearTimeout(this._touchStartTimer);
            //}

            //$(document).off({
            //    'mouseup': $.proxy(this._onMouseup, this),
            //    //'touchend': $.proxy(this._onMouseup, this)
            //});
            //if (!$.support.touch && event.which !== 1) {
            //if (event.which !== 1) {
            //    if (this.isLeftDown) {
            //        $(document).on({
            //            'mouseup': $.proxy(this._onMouseup, this),
            //            'touchend': $.proxy(this._onMouseup, this)
            //        });
            //    }
            //    else {
            //        $(document).off("contextmenu", this.returnFalse); // enable contextmenu
            //    }
            //    return;
            //}
            //this.isLeftDown = false;
            //MathInteractives.Common.Utilities.Models.Utils.DisableTouch(document);
            $(document).off("contextmenu", this.returnFalse); // enable contextmenu
            var isToggleType = this.model.get('toggleButton'),
                isActive = this._isBtnActive();

            if (!isToggleType && !isActive) {
                return;
            }

            var baseClass = this.getBaseClass();
            if (this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE) {
                if (this.getButtonState() !== MathInteractives.Common.Components.Views.Button.BUTTON_STATE_SELECTED) {
                    this.$btn.find('div').removeClass('down');
                    if (this._isCustomButton) {
                        this._applyNewPosition('active');
                    }
                }
            }
            else {
                this.$btn.removeClass(baseClass + '-down');
            }
        },


        _onToggle: function _onToggle(event) {
            //if (!$.support.touch && event.which !== 1) {
            if (event.which !== 1) {
                return;
            }
            if (!this.model.get('toggleButton')) {
                return;
            }
            if (this.getButtonState() !== MathInteractives.Common.Components.Views.Button.BUTTON_STATE_DISABLED) {
                if (this._isBtnActive()) {
                    if (this._btnImgSlice === MathInteractives.Common.Components.Views.Button.IMAGESLICE.THREE) {


                        this.$btn.find('div').addClass('down');

                        if (this._isCustomButton) {
                            this._applyNewPosition('down');
                        }
                    } else {
                        this.$btn.addClass(this.getBaseClass() + '-down');
                    }
                    this.setButtonState(MathInteractives.Common.Components.Views.Button.BUTTON_STATE_SELECTED);
                }
                else {
                    this.setButtonState(MathInteractives.Common.Components.Views.Button.BUTTON_STATE_ACTIVE);
                }
            }
        },
        /*
        _touchStartEvent: function _touchStartEvent(event) {
            var thisRef = this;
            this.$btn.children().addClass('down');
            this.$btn.one('touchmove', function (event) {
                event.preventDefault(); //fix for android. if we dont do event.preventDefault() mouse up doesnt fire in android
                if (thisRef._touchStartTimer !== null) {
                    window.clearTimeout(thisRef._touchStartTimer);
                }
            });
            this._touchStartTimer = window.setTimeout(function (event) {
                thisRef._onMouseDown(event);
                thisRef._touchStartTimer = null;
            }, 200);
        },
        */
        /**
        * Set or unset draggable icon in button
        *
        * @method setDraggableIcon
        **/
        setDraggableIcon: function (isSet) {
            if (isSet) {
                this.model.set('isDraggable', true);
                this._addDraggableIcon();
            }
            else {
                this.model.set('isDraggable', false);
                this._removeDraggableIcon();
            }
        },

        /**
        * Add the draggable icon below the button text or icon
        *
        * @method _addDraggableIcon
        **/
        _addDraggableIcon: function _addDraggableIcon() {
            var $contentDiv = this.$el.find('.button-content');
            var $draggableIconDiv = $('<div>', {
                'class': 'draggable-icon-div'
            }).css({
                'background-image': 'url("' + this.filePath.getImagePath('buttons-icons') + '")'
            }).addClass('draggable-icon');

            this.$el.append($draggableIconDiv);

            var contentDivHeight = $contentDiv.height();
            var draggableIconHeight = $draggableIconDiv.height();

            var freeHeight = this._height - (contentDivHeight + draggableIconHeight);
            var marginTop = (freeHeight / 5) * 2;

            $contentDiv.css({
                'margin-top': marginTop
            });

            $draggableIconDiv.css({
                'margin-top': this._height - (draggableIconHeight + 7),
                'margin-left': (this.$el.width() - $draggableIconDiv.width()) / 2
            });
        },

        /**
        * Remove the draggable icon from the button
        *
        * @method _removeDraggableIcon
        **/
        _removeDraggableIcon: function _removeDraggableIcon() {
            this.$el.find('.draggable-icon-div').remove();

            /*var $contentDiv = this.$el.find('.button-content');
            var contentDivHeight = $contentDiv.height();

            $contentDiv.css({
                'margin-top': (this._height - contentDivHeight) / 2
            });*/
        },

        /**
        * Shows the button
        *
        * @method showButton
        **/
        showButton: function showButton() {
            this.$btn.show();
        },

        /**
        * Hides the button
        *
        * @method hideButton
        **/
        hideButton: function hideButton() {
            this.$btn.hide();
        },

        /**
        * Changes text on the button
        *
        * @method changeText
        * @param {String} [text] New button text
        **/
        changeText: function changeText(text) {
            //this.$btn.html(text);
            this.$('.' + this._btnType.category + '-button-text.button-content').text(text);
            this.model.set('text', text);
        },

        /**
        * Changes text on the button tooltip
        *
        * @method changeTooltipText
        * @param {String} [tooltiptext] New tooltip text
        **/
        changeTooltipText: function changeTooltipText(tooltiptext) {
            this.btnTooltipView.changeTooltipText(tooltiptext);
        },

        /**
        * Changes button baseclass
        *
        * @method changeBaseClass
        * @param {String} [className] New class name
        **/
        changeBaseClass: function changeBaseClass(className) {
            this.model.set('baseClass', className);
        },

        /**
        * Removes the tooltip
        *
        * @method _removeTooltip
        * @private
        **/
        _removeTooltip: function _removeTooltip() {
            this.$btn.children().removeClass('down');
            if (this.btnTooltipView) {
                //if (this._touchStartTimer !== null) {
                //    window.clearTimeout(this._touchStartTimer);
                //}
                this.btnTooltipView.hideTooltip();
            }
        },

        /**
        * Public function to remove tooltip
        *
        * @method hideTooltip
        * @public
        **/
        hideTooltip: function hideTooltip() {
            this._removeTooltip();
        },

        /**
        * Attaches the tooltip
        *
        * @method _attachTooltip
        * @private
        **/
        _attachTooltip: function _attachTooltip() {
            var tooltiptext = this.model.get('tooltipText');

            if (!tooltiptext || tooltiptext.length === 0) {
                return;
            }

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
            this.btnTooltipView = new MathInteractives.Common.Components.Views.Tooltip({ model: tooltip });
        },


        /**
        * Returns false on right click
        *
        * @method getBaseClass
        * @return {String} [baseClass]
        **/

        returnFalse: function (e) {
            e.preventDefault();
            return false;
        },


        /**
        * Returns base class of the button
        *
        * @method getBaseClass
        * @return {String} [baseClass]
        **/
        getBaseClass: function getBaseClass() {
            var baseClass = this.model.get('baseClass');
            return baseClass;
        },

        /****************************************these functions are used for graphlegends****************************************/
        /**
        * function fired on click of legend btn
        *
        * @method legendClick
        **/
        _legendClick: function _legendClick(event) {
            event.preventDefault();
            event.stopPropagation();

            if (this.model.get('customEvent') === true) {
                if (this._isLegendDown === true) {
                    this._isLegendDown = false;
                    this.$el.children().removeClass('down');
                } else if (this._isLegendDown === false) {
                    this._isLegendDown = true;
                    this.$el.children().addClass('down');
                }
                this.$el.trigger('legend_click');
                return;
            }

            var legendModel = {
                'chart': $('#' + this.model.get('chartConianerID')).highcharts(),
                'seriesID': this.model.get('seriesID'),
                'callbackFnc': this.model.get('callbackFnc')
            }, series = legendModel['chart'].get(legendModel['seriesID']);

            if (series.visible === true) {
                series.hide();
                this.$el.children().removeClass('down');
                //this.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
            } else {
                series.show();
                this.$el.children().addClass('down');
                //this.setButtonState(MathInteractives.global.Button.BUTTON_STATE_ACTIVE);
            }
        }

    }, {

        /**
        * Minimum width for gernal and action buttons which contains text
        *
        * @static
        **/
        BUTTON_MIN_WIDTH: 92,

        /**
        * Active State string
        *
        * @static
        **/
        BUTTON_STATE_ACTIVE: 'active',

        /**
        * Selected State string
        *
        * @static
        **/
        BUTTON_STATE_SELECTED: 'selected',

        /**
        * Disabled State string
        *
        * @static
        **/
        BUTTON_STATE_DISABLED: 'disabled',

        /**
        * Type of button string
        *
        * @static
        **/
        IMAGESLICE: {
            SINGLE: 'single',
            THREE: 'three'
        },

        /**
        * Type of button string
        *
        * @static
        **/
        TYPE: {
            CUSTOM: { id: 'custom', category: 'custom', slice: '' },
            GENERAL: { id: 'general', category: 'general', slice: 'three' },
            ACTION: { id: 'action', category: 'action', slice: 'three' },
            MULTIPLE_TOGGLE_BLACK: { id: 'multi-toggle-black', category: 'multi-toggle-black', slice: 'three', height: 39 },
            ACTION_MOVE: { id: 'action-move', category: 'action', slice: 'three', icon: { iconClass: 'move-icon', height: 30, width: 30 } },
            ACTION_DRAW_LINE: { id: 'action-draw-line', category: 'action', slice: 'three', icon: { iconClass: 'draw-line-icon', height: 30, width: 30 } },
            ACTION_ZOOM_IN: { id: 'action-zoom-in', category: 'action', slice: 'three', icon: { iconClass: 'zoom-in-icon', height: 20, width: 20 } },
            ACTION_ZOOM_OUT: { id: 'action-zoom-out', category: 'action', slice: 'three', icon: { iconClass: 'zoom-out-icon', height: 20, width: 20 } },
            ACTION_FIT_TO_SCREEN: { id: 'action-fit-to-screen', category: 'action', slice: 'three', icon: { iconClass: 'fit-to-screen-icon', height: 26, width: 26 } },
            ACTION_RESET: { id: 'action-reset', category: 'action', slice: 'three', icon: { iconClass: 'action-reset-icon', height: 26, width: 26 } },
            CLOSE_ORANGE: { id: 'close-orange', category: 'close-orange', slice: 'single' },
            CLOSE_ORANGE_CROSS: { id: 'close-orange-cross', category: 'close-orange-cross', slice: 'single' },
            CLOSE_PURPLE_CROSS: { id: 'close-purple-cross', category: 'close-purple-cross', slice: 'single' },
            TTS_PLAY: { id: 'tts-play', category: 'tts-play', slice: 'single' },
            TTS_PAUSE: { id: 'tts-pause', category: 'tts-pause', slice: 'single' },
            TTS_SOUND: { id: 'tts-sound', category: 'tts-sound', slice: 'single' },
            HINT: { id: 'hint', category: 'hint', slice: 'single', icon: { iconClass: 'hint-icon', height: 30, width: 28 } },
            CAMERA: { id: 'camera', category: 'header', slice: 'single', icon: { iconClass: 'camera-icon', height: 32, width: 42 } },
            FULL_SCREEN: { id: 'full-screen', category: 'header', slice: 'single', icon: { iconClass: 'full-screen-icon', height: 32, width: 32 } },
            HELP: { id: 'help', category: 'header', slice: 'single', icon: { iconClass: 'help-icon', height: 32, width: 42 } },
            SAVE: { id: 'save', category: 'save', slice: 'three', icon: { iconClass: 'save-icon', height: 30, width: 33 }, hasText: true },
            ON: { id: 'on', category: 'on', slice: 'three', hasText: true, height: 30 },
            OFF: { id: 'off', category: 'off', slice: 'three', hasText: true, height: 30 },
            DRAGGABLE_BLUE: { id: 'draggable-blue', category: 'draggable-blue', slice: 'three', isDraggable: true, height: 46 },
            DRAGGABLE_GREEN: { id: 'draggable-green', category: 'draggable-green', slice: 'three', isDraggable: true, height: 46 },
            DRAGGABLE_RED: { id: 'draggable-red', category: 'draggable-red', slice: 'three', isDraggable: true, height: 46 },
            DRAGGABLE_BLUE_SMALL: { id: 'draggable-blue-small', category: 'draggable-blue-small', slice: 'three', isDraggable: true, height: 40 }
        },

        /*
        * Bind the specified buttons in toggle buttons or push buttons form
        * @method toggleButtonHandler
        * @param {array} buttonObjects
        * @param {boolean} isPushButtons
        */

        toggleButtonHandler: function (options) {
            var buttonObjects = options.buttonObjects,
                isPushButtons = options.isPushButtons,
                isPushAndToggleButtons = options.isPushAndToggleButtons;

            if (buttonObjects) {
                var buttonsLength = buttonObjects.length;
                for (var i = 0; i < buttonsLength; i++) {
                    var currentButtonObj = buttonObjects[i];
                    if (isPushAndToggleButtons) {
                        $(currentButtonObj.el).unbind('click.pushHandler').bind('click.pushHandler', $.proxy(function (event) {
                            this._handlePushAndToggleState(event, buttonObjects);
                        }, this)).data('isPushButton', true);
                    }
                    else if (isPushButtons) {
                        $(currentButtonObj.el).unbind('click.pushHandler').bind('click.pushHandler', $.proxy(function (event) {
                            this._handlePushState(event, buttonObjects);
                        }, this)).data('isPushButton', true);
                    }
                    else {
                        $(currentButtonObj.el).unbind('click.toggleHandler').bind('click.toggleHandler', $.proxy(function (event) {
                            this._handleToggleState(event, buttonObjects);
                        }, this));
                    }
                }
            }

        },

        /*
        * Hanldle toggle states of buttons
        * @method _handleToggleState
        * @param {object} event
        * @param {array} buttonObjects
        */
        _handleToggleState: function (event, buttonObjects) {
            var buttonsLength = buttonObjects.length;
            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonObj = buttonObjects[i];
                if (currentButtonObj.el == event.currentTarget && currentButtonObj.getButtonState() === this.BUTTON_STATE_DISABLED) {
                    return;
                }
            }

            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonObj = buttonObjects[i];
                var $currentBtnEl = $(currentButtonObj.el);

                if (currentButtonObj.getButtonState() !== this.BUTTON_STATE_DISABLED) {
                    currentButtonObj.setButtonState(this.BUTTON_STATE_ACTIVE);

                    $currentBtnEl.unbind('click.toggleHandler').bind('click.toggleHandler', $.proxy(function (event) {
                        this._handleToggleState(event, buttonObjects);
                    }, this));

                    if (currentButtonObj.el == event.currentTarget) {
                        currentButtonObj.setButtonState(this.BUTTON_STATE_SELECTED);
                        var $selectedButton = $currentBtnEl;
                        setTimeout(function () {
                            $selectedButton.unbind('click.toggleHandler');
                            $selectedButton.removeClass('click-enabled');
                        }, 1);
                    }
                }
            }
        },

        /*
        * Hanldle push states of buttons
        * @method _handlePushState
        * @param {object} event
        * @param {array} buttonObjects
        */
        _handlePushState: function (event, buttonObjects) {
            var buttonsLength = buttonObjects.length;
            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonObj = buttonObjects[i];
                if (currentButtonObj.el == event.currentTarget && currentButtonObj.getButtonState() === this.BUTTON_STATE_DISABLED) {
                    return;
                }
            }

            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonObj = buttonObjects[i];
                if (currentButtonObj.el == event.currentTarget) {
                    var buttonState = currentButtonObj.getButtonState();

                    if (buttonState === this.BUTTON_STATE_SELECTED) {
                        currentButtonObj.setButtonState(this.BUTTON_STATE_ACTIVE);
                    }
                    else if (buttonState === this.BUTTON_STATE_ACTIVE) {
                        currentButtonObj.setButtonState(this.BUTTON_STATE_SELECTED);
                        var $currentBtnEl = $(currentButtonObj.el);
                        $currentBtnEl.removeClass('click-enabled').addClass('click-enabled');
                        $currentBtnEl.children().each(function () {
                            $(this).css({ cursor: 'pointer' });
                        });
                    }
                    break;
                }
            }

        },

        /*
        * Hanldle push states of buttons with toggle
        * @method _handlePushAndToggleState
        * @param {object} event
        * @param {array} buttonObjects
        */
        _handlePushAndToggleState: function _handlePushAndToggleState(event, buttonObjects) {
            var buttonsLength = buttonObjects.length;
            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonObj = buttonObjects[i];
                if (currentButtonObj.el == event.currentTarget && currentButtonObj.getButtonState() === this.BUTTON_STATE_DISABLED) {
                    return;
                }
            }

            for (var i = 0; i < buttonsLength; i++) {
                var currentButtonObj = buttonObjects[i];
                if (currentButtonObj.el == event.currentTarget) {
                    var buttonState = currentButtonObj.getButtonState();

                    if (buttonState === this.BUTTON_STATE_SELECTED) {
                        currentButtonObj.setButtonState(this.BUTTON_STATE_ACTIVE);
                    }
                    else if (buttonState === this.BUTTON_STATE_ACTIVE) {
                        currentButtonObj.setButtonState(this.BUTTON_STATE_SELECTED);
                        var $currentBtnEl = $(currentButtonObj.el);
                        $currentBtnEl.removeClass('click-enabled').addClass('click-enabled');
                        $currentBtnEl.children().each(function () {
                            $(this).css({ cursor: 'pointer' });
                        });
                    }
                }
                else {
                    if (currentButtonObj.getButtonState() === this.BUTTON_STATE_DISABLED) {
                        continue;
                    }
                    currentButtonObj.setButtonState(this.BUTTON_STATE_ACTIVE);
                }
            }
        },

        /*
        * to generate button as per the given requirement
        * @method generateButton
        * @param {object} buttonProps
        */
        generateButton: function (buttonProps) {
            var btnID;
            if (buttonProps) {
                btnID = '#' + buttonProps.id;
                var buttonModel = new MathInteractives.Common.Components.Models.Button(buttonProps);
                var buttonView = new MathInteractives.Common.Components.Views.Button({ el: btnID, model: buttonModel });

                return buttonView;
            }
        },

        /*
        * to generate legend button as per the given requirement for graph
        * @method generateLegend
        * @param {object} buttonProps
        */
        generateLegend: function (options) {
            /* button properties
            options = {
                'id': 'id'
                'path' : 'path'
                'icon' : { pathId: 'path-id-of-image', height: **, width: ** }
                'tooltipText' : 'text'
                'tooltipPosition' : 'text'
                'player' : 'player'
                'chartConianerID' :
                'seriesID'
                'customClickEvent'
            }

            */
            var defaults = {
                'type': MathInteractives.Common.Components.Views.Button.TYPE.ACTION,
                'baseClass': 'graphLegends',
                //'toggleButton' : true,
                'width': 51,
                'height': 33,
                'padding': 5,
                'imagePathIds': [],
                'isDraggable': false,
                'cornerSliceImgWidth': 5,
                //'btnWidthGroup' : 'graphLegends',//because this is causing images of icon to resize in width
                'text': '',
                'isLegend': true,
                'customEvent': false

            }, btnID;

            options = $.extend(defaults, options);

            if (options) {
                btnID = '#' + options['id'];
                var buttonModel = new MathInteractives.Common.Components.Models.Button(options);
                var buttonView = new MathInteractives.Common.Components.Views.Button({ el: btnID, model: buttonModel });

                var $btnIcon = buttonView.$el.find('.button-icon'), iconPadding = parseInt((buttonView.$el.width() - options['icon']['width']) / 2) + 2;

                if ($btnIcon !== null && typeof $btnIcon !== 'undefined') {
                    $btnIcon.css({
                        'background-image': 'url(' + options['path'].getImagePath(options['icon']['pathId']) + ')',
                        'margin-left': iconPadding,
                        'width': options['icon']['width']
                    });
                }
                buttonView.$el.children().addClass('down');
                buttonView._isLegendDown = true;
                return buttonView;
            }
        }
    });


    MathInteractives.global.Button = MathInteractives.Common.Components.Views.Button;
})();
